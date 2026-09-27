<?php
/**
 * Login, sessions and first-time setup.
 *
 * Sessions are stored in the database (not the shared host's /tmp), the
 * cookie is HttpOnly + SameSite=Strict, and every write request must carry
 * the session's CSRF token in the X-CSRF-Token header.
 */

declare(strict_types=1);

final class DbSessionHandler implements SessionHandlerInterface
{
    public function open(string $path, string $name): bool
    {
        return true;
    }

    public function close(): bool
    {
        return true;
    }

    public function read(string $id): string|false
    {
        $row = Db::one('SELECT data FROM sessions WHERE id = ?', [$id]);
        return $row ? (string) $row['data'] : '';
    }

    public function write(string $id, string $data): bool
    {
        Db::run(
            'INSERT INTO sessions (id, user_id, data, last_activity) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), data = VALUES(data), last_activity = VALUES(last_activity)',
            [$id, is_int($_SESSION['uid'] ?? null) ? $_SESSION['uid'] : null, $data, time()]
        );
        return true;
    }

    public function destroy(string $id): bool
    {
        Db::run('DELETE FROM sessions WHERE id = ?', [$id]);
        return true;
    }

    public function gc(int $max_lifetime): int|false
    {
        return Db::run('DELETE FROM sessions WHERE last_activity < ?', [time() - $max_lifetime]);
    }
}

final class Auth
{
    /** Signed out after this long without using the app. */
    private const IDLE_SECONDS = 3 * 24 * 3600;
    /** Signed out after this long regardless. */
    private const MAX_SECONDS = 30 * 24 * 3600;
    private const MAX_FAILURES = 5;
    private const FAILURE_WINDOW_MINUTES = 15;

    private static ?array $user = null;

    public static function start(): void
    {
        $secure = (bool) (Config::get()['secure_cookies'] ?? true);
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.gc_maxlifetime', (string) self::MAX_SECONDS);
        session_set_save_handler(new DbSessionHandler(), true);
        session_name('ffsid');
        session_set_cookie_params([
            'lifetime' => self::MAX_SECONDS,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
    }

    public static function user(): ?array
    {
        if (self::$user !== null) {
            return self::$user;
        }
        $uid = $_SESSION['uid'] ?? null;
        if (!is_int($uid)) {
            return null;
        }
        $t = time();
        if ($t - (int) ($_SESSION['seen'] ?? 0) > self::IDLE_SECONDS || $t - (int) ($_SESSION['since'] ?? 0) > self::MAX_SECONDS) {
            self::logout();
            return null;
        }
        $_SESSION['seen'] = $t;
        $user = Db::one('SELECT id, family_id, name, username, role FROM users WHERE id = ?', [$uid]);
        if ($user === null) {
            self::logout();
            return null;
        }
        return self::$user = $user;
    }

    public static function requireUser(): array
    {
        $user = self::user();
        if ($user === null) {
            throw new HttpError(401, 'Please sign in.');
        }
        return $user;
    }

    public static function csrfToken(): string
    {
        if (!isset($_SESSION['csrf']) || !is_string($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf'];
    }

    public static function checkCsrf(): void
    {
        $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!is_string($sent) || !isset($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sent)) {
            throw new HttpError(403, 'Session expired. Reload the page and try again.');
        }
    }

    public static function login(string $username, string $password): array
    {
        $username = mb_strtolower(trim($username));
        $ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|ffsalt');
        $since = (new DateTimeImmutable('-' . self::FAILURE_WINDOW_MINUTES . ' minutes'))->format('Y-m-d H:i:s');
        $failures = Db::one(
            'SELECT COUNT(*) AS n FROM login_attempts WHERE success = 0 AND attempted_at > ? AND (username = ? OR ip_hash = ?)',
            [$since, $username, $ipHash]
        );
        if ((int) $failures['n'] >= self::MAX_FAILURES) {
            throw new HttpError(429, 'Too many wrong attempts. Try again in 15 minutes.');
        }

        $user = Db::one('SELECT id, password_hash FROM users WHERE username = ?', [$username]);
        // Verify against a dummy hash for unknown names so timing does not reveal who exists.
        $hash = $user['password_hash'] ?? '$2y$12$kcFVBDoKkbmW2atguWaY4eKa8XbMoZyO52IZ3HcKuW6jg2vAMJxbe';
        $ok = password_verify($password, $hash) && $user !== null;
        Db::run(
            'INSERT INTO login_attempts (username, ip_hash, success, attempted_at) VALUES (?, ?, ?, NOW())',
            [$username, $ipHash, $ok ? 1 : 0]
        );
        if (!$ok) {
            throw new HttpError(401, 'Wrong username or password.');
        }
        if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
            Db::run('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $user['id']]);
        }
        Db::run('UPDATE users SET last_login_at = NOW() WHERE id = ?', [$user['id']]);

        session_regenerate_id(true);
        $_SESSION = ['uid' => (int) $user['id'], 'since' => time(), 'seen' => time()];
        self::$user = null;
        return self::requireUser();
    }

    public static function logout(): void
    {
        $_SESSION = [];
        self::$user = null;
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }
    }

    public static function changePassword(array $user, string $current, string $new): void
    {
        $row = Db::one('SELECT password_hash FROM users WHERE id = ?', [$user['id']]);
        if (!password_verify($current, $row['password_hash'])) {
            throw new HttpError(422, 'Current password is wrong.');
        }
        self::checkStrength($new);
        Db::run('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [password_hash($new, PASSWORD_DEFAULT), $user['id']]);
        // Sign out this person's other devices; the other family member stays signed in.
        Db::run('DELETE FROM sessions WHERE user_id = ? AND id <> ?', [$user['id'], session_id()]);
        Audit::log($user, 'update', 'password', (int) $user['id']);
    }

    public static function checkStrength(string $password): void
    {
        if (mb_strlen($password) < 10) {
            throw new HttpError(422, 'Password must be at least 10 characters.');
        }
        if (mb_strlen($password) > 200) {
            throw new HttpError(422, 'Password is too long.');
        }
    }

    public static function needsSetup(): bool
    {
        return (int) Db::one('SELECT COUNT(*) AS n FROM users')['n'] === 0;
    }

    /**
     * Creates the family and its first members. Works only while there are no
     * users at all, and only with the setup_token from the private config.
     */
    public static function setup(Input $in): array
    {
        $expected = (string) (Config::get()['setup_token'] ?? '');
        $token = $in->str('token', 200, true, 'Setup code');
        if (strlen($expected) < 20 || !hash_equals($expected, $token)) {
            throw new HttpError(403, 'Setup code is wrong.');
        }
        $family = $in->str('familyName', 100, true, 'Family name');
        $members = $in->raw('members');
        if (!is_array($members) || count($members) < 1 || count($members) > 4) {
            throw new HttpError(422, 'Add one to four members.');
        }
        $clean = [];
        foreach (array_values($members) as $i => $m) {
            $mi = new Input(is_array($m) ? $m : []);
            $username = mb_strtolower($mi->str('username', 40, true, 'Username'));
            if (!preg_match('/^[a-z0-9._-]{3,40}$/', $username)) {
                throw new HttpError(422, 'Username may use a–z, 0–9, dot, dash and underscore (3–40).');
            }
            $password = $mi->str('password', 200, true, 'Password');
            self::checkStrength($password);
            $clean[] = ['name' => $mi->str('name', 60, true, 'Name'), 'username' => $username, 'password' => $password, 'role' => $i === 0 ? 'owner' : 'member'];
        }
        if (count(array_unique(array_column($clean, 'username'))) !== count($clean)) {
            throw new HttpError(422, 'Each member needs a different username.');
        }

        return Db::tx(function () use ($family, $clean) {
            if (!self::needsSetup()) {
                throw new HttpError(409, 'Setup is already done.');
            }
            $familyId = Db::insert('INSERT INTO families (name, created_at) VALUES (?, NOW())', [$family]);
            foreach ($clean as $m) {
                Db::insert(
                    'INSERT INTO users (family_id, name, username, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                    [$familyId, $m['name'], $m['username'], password_hash($m['password'], PASSWORD_DEFAULT), $m['role']]
                );
            }
            return ['familyId' => $familyId, 'members' => count($clean)];
        });
    }
}
