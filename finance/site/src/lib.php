<?php
/**
 * Core helpers: config, database, migrations, JSON I/O, validation, money.
 *
 * Money rule: amounts travel as strings ("12,500.50") and live as integer
 * paise. Nothing here ever turns money into a float.
 */

declare(strict_types=1);

final class HttpError extends RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message);
    }
}

final class Config
{
    private static ?array $config = null;

    /**
     * The real config holds the database password, so on Hostinger it lives
     * outside public_html (domains/printsahaj.com/finance-config.php).
     * FINANCE_CONFIG overrides the path; site/config.php is for local runs.
     */
    public static function get(): array
    {
        if (self::$config !== null) {
            return self::$config;
        }
        $site = dirname(__DIR__);
        $candidates = array_filter([
            getenv('FINANCE_CONFIG') ?: null,
            dirname($site, 2) . '/finance-config.php',
            $site . '/config.php',
        ]);
        foreach ($candidates as $path) {
            if (is_file($path)) {
                $config = require $path;
                if (!is_array($config)) {
                    break;
                }
                return self::$config = $config;
            }
        }
        throw new HttpError(500, 'App is not configured yet.');
    }
}

final class Db
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo !== null) {
            return self::$pdo;
        }
        $db = Config::get()['db'];
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $db['host'],
            (int) ($db['port'] ?? 3306),
            $db['name']
        );
        $pdo = new PDO($dsn, $db['user'], $db['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_STRINGIFY_FETCHES => false,
        ]);
        $pdo->exec("SET time_zone = '+05:30'");
        return self::$pdo = $pdo;
    }

    public static function all(string $sql, array $params = []): array
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function one(string $sql, array $params = []): ?array
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    public static function run(string $sql, array $params = []): int
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    public static function insert(string $sql, array $params = []): int
    {
        self::run($sql, $params);
        return (int) self::pdo()->lastInsertId();
    }

    public static function tx(callable $fn): mixed
    {
        $pdo = self::pdo();
        $pdo->beginTransaction();
        try {
            $result = $fn();
            $pdo->commit();
            return $result;
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}

final class Migrator
{
    /** Applies every migrations/NNN_*.sql newer than the recorded version. */
    public static function run(): void
    {
        $pdo = Db::pdo();
        $pdo->exec('CREATE TABLE IF NOT EXISTS schema_migrations (
            version INT UNSIGNED PRIMARY KEY,
            applied_at DATETIME NOT NULL
        ) ENGINE=InnoDB');
        $done = array_map('intval', array_column(Db::all('SELECT version FROM schema_migrations'), 'version'));
        $files = glob(__DIR__ . '/migrations/*.sql') ?: [];
        sort($files);
        foreach ($files as $file) {
            $version = (int) basename($file);
            if ($version === 0 || in_array($version, $done, true)) {
                continue;
            }
            $sql = preg_replace('/^\s*--.*$/m', '', (string) file_get_contents($file));
            foreach (array_filter(array_map('trim', explode(';', (string) $sql))) as $statement) {
                $pdo->exec($statement);
            }
            Db::run('INSERT INTO schema_migrations (version, applied_at) VALUES (?, NOW())', [$version]);
        }
    }
}

final class Money
{
    /** Largest amount accepted: ₹99,99,99,99,999.99 (11 rupee digits). */
    private const MAX_PAISE = 99_999_999_999_99;

    /** "12,500.5" / "₹ 12500" → paise. Rejects negatives, letters and >2 decimals. */
    public static function parse(mixed $value): int
    {
        if (is_int($value)) {
            $value = (string) $value;
        }
        if (!is_string($value)) {
            throw new HttpError(422, 'Amount must be a number like 12500 or 12500.50.');
        }
        $clean = str_replace([',', ' ', '₹'], '', trim($value));
        if (!preg_match('/^(\d{1,11})(?:\.(\d{1,2}))?$/', $clean, $m)) {
            throw new HttpError(422, 'Amount must be a number like 12500 or 12500.50.');
        }
        $paise = (int) $m[1] * 100 + (int) str_pad($m[2] ?? '0', 2, '0');
        if ($paise > self::MAX_PAISE) {
            throw new HttpError(422, 'Amount is too large.');
        }
        return $paise;
    }

    /** "18" / "11.25" → "18.0000"; null stays null (rate not known yet). */
    public static function parseRate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        $clean = str_replace(['%', ' '], '', trim((string) $value));
        if (!preg_match('/^(\d{1,3})(?:\.(\d{1,4}))?$/', $clean, $m) || (int) $m[1] > 99) {
            throw new HttpError(422, 'Interest rate must be a yearly % like 18 or 11.25.');
        }
        return $m[1] . '.' . str_pad($m[2] ?? '0', 4, '0');
    }

    /** "18.0000" → 180000 (units of 0.0001 %). */
    public static function rateUnits(string $rate): int
    {
        [$whole, $frac] = array_pad(explode('.', $rate, 2), 2, '0');
        return (int) $whole * 10000 + (int) str_pad(substr($frac, 0, 4), 4, '0');
    }

    /** One month's interest on a balance at a yearly rate, rounded half-up to the paisa. */
    public static function monthlyInterest(int $balancePaise, string $rate): int
    {
        $divisor = 12 * 100 * 10000;
        return intdiv($balancePaise * self::rateUnits($rate) + intdiv($divisor, 2), $divisor);
    }
}

final class Http
{
    public static function body(): array
    {
        $raw = file_get_contents('php://input') ?: '';
        if ($raw === '') {
            return [];
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            throw new HttpError(400, 'Request body must be JSON.');
        }
        return $data;
    }

    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}

/** Reads and checks one field at a time; every message is safe to show. */
final class Input
{
    public function __construct(private array $data)
    {
    }

    public function has(string $key): bool
    {
        return array_key_exists($key, $this->data) && $this->data[$key] !== null && $this->data[$key] !== '';
    }

    public function str(string $key, int $max, bool $required = true, string $label = ''): string
    {
        $label = $label ?: $key;
        $value = $this->data[$key] ?? '';
        if (!is_string($value) && !is_int($value)) {
            throw new HttpError(422, "$label is not valid.");
        }
        $value = trim((string) $value);
        if ($required && $value === '') {
            throw new HttpError(422, "$label is required.");
        }
        if (mb_strlen($value) > $max) {
            throw new HttpError(422, "$label is too long (max $max characters).");
        }
        return $value;
    }

    public function enum(string $key, array $allowed, ?string $default = null): string
    {
        $value = $this->data[$key] ?? $default;
        if (!is_string($value) || !in_array($value, $allowed, true)) {
            throw new HttpError(422, "$key must be one of: " . implode(', ', $allowed) . '.');
        }
        return $value;
    }

    public function date(string $key, bool $required = true): ?string
    {
        $value = $this->data[$key] ?? null;
        if ($value === null || $value === '') {
            if ($required) {
                throw new HttpError(422, "$key is required.");
            }
            return null;
        }
        $d = is_string($value) ? DateTimeImmutable::createFromFormat('!Y-m-d', $value) : false;
        if ($d === false || $d->format('Y-m-d') !== $value) {
            throw new HttpError(422, "$key must be a date like 2026-09-27.");
        }
        return $value;
    }

    public function money(string $key, bool $required = true): ?int
    {
        if (!$this->has($key)) {
            if ($required) {
                throw new HttpError(422, "$key is required.");
            }
            return null;
        }
        return Money::parse($this->data[$key]);
    }

    public function int(string $key, int $min, int $max, bool $required = true): ?int
    {
        if (!$this->has($key)) {
            if ($required) {
                throw new HttpError(422, "$key is required.");
            }
            return null;
        }
        $value = $this->data[$key];
        if (is_string($value) && preg_match('/^\d+$/', trim($value))) {
            $value = (int) trim($value);
        }
        if (!is_int($value) || $value < $min || $value > $max) {
            throw new HttpError(422, "$key must be a whole number from $min to $max.");
        }
        return $value;
    }

    public function bool(string $key): bool
    {
        return filter_var($this->data[$key] ?? false, FILTER_VALIDATE_BOOLEAN);
    }

    public function raw(string $key): mixed
    {
        return $this->data[$key] ?? null;
    }
}

function now(): string
{
    return (new DateTimeImmutable('now'))->format('Y-m-d H:i:s');
}

function today(): string
{
    return (new DateTimeImmutable('today'))->format('Y-m-d');
}

/** Validates "YYYY-MM" and returns [first day, last day]. */
function monthRange(string $month): array
{
    if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month)) {
        throw new HttpError(422, 'month must look like 2026-09.');
    }
    $first = new DateTimeImmutable($month . '-01');
    return [$first->format('Y-m-d'), $first->modify('last day of this month')->format('Y-m-d')];
}

/**
 * An optional from/to date range (inclusive, YYYY-MM-DD each). Null when neither is
 * given, so callers fall back to the month. Both are required together; a range is
 * capped at 10 years so a typo cannot ask for the whole database.
 */
function dateRange(?string $from, ?string $to): ?array
{
    $from = $from === '' ? null : $from;
    $to = $to === '' ? null : $to;
    if ($from === null && $to === null) {
        return null;
    }
    if ($from === null || $to === null) {
        throw new HttpError(422, 'Give both a from and a to date.');
    }
    $a = DateTimeImmutable::createFromFormat('!Y-m-d', $from);
    $b = DateTimeImmutable::createFromFormat('!Y-m-d', $to);
    if ($a === false || $b === false || $a->format('Y-m-d') !== $from || $b->format('Y-m-d') !== $to) {
        throw new HttpError(422, 'Dates must look like 2026-10-02.');
    }
    if ($a > $b) {
        throw new HttpError(422, 'The from date is after the to date.');
    }
    if ($a->diff($b)->days > 3660) {
        throw new HttpError(422, 'Pick a range of at most 10 years.');
    }
    return [$from, $to];
}

/** Whole months from one YYYY-MM-DD to another, by calendar month. */
function monthsBetween(string $from, string $to): int
{
    [$fy, $fm] = array_map('intval', explode('-', substr($from, 0, 7)));
    [$ty, $tm] = array_map('intval', explode('-', substr($to, 0, 7)));
    return ($ty - $fy) * 12 + ($tm - $fm);
}

function addMonths(string $ym, int $months): string
{
    // sprintf keeps the sign single ("-5 months"): "+-5 months" is read differently by newer PHP.
    return (new DateTimeImmutable($ym . '-01'))->modify(sprintf('%+d months', $months))->format('Y-m');
}

final class Audit
{
    public static function log(array $user, string $action, string $entity, ?int $id, ?array $changes = null): void
    {
        Db::run(
            'INSERT INTO audit_log (family_id, user_id, action, entity, entity_id, changes, at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [$user['family_id'], $user['id'], $action, $entity, $id, $changes ? json_encode($changes, JSON_UNESCAPED_UNICODE) : null]
        );
    }
}
