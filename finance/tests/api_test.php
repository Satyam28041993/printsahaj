<?php
/**
 * End-to-end API test. Starts `php -S` against a throwaway MySQL database,
 * wipes it, and drives the API like the browser does.
 *
 *   FF_DB_HOST=127.0.0.1 FF_DB_NAME=fftest FF_DB_USER=ff FF_DB_PASS=ffpass php finance/tests/api_test.php
 *
 * The amounts here are made up. Real family numbers never go in this repo.
 */

declare(strict_types=1);

$db = [
    'host' => getenv('FF_DB_HOST') ?: '127.0.0.1',
    'port' => (int) (getenv('FF_DB_PORT') ?: 3306),
    'name' => getenv('FF_DB_NAME') ?: 'fftest',
    'user' => getenv('FF_DB_USER') ?: 'ff',
    'pass' => getenv('FF_DB_PASS') ?: 'ffpass',
];
$port = 8765;
$base = "http://127.0.0.1:$port/api/index.php?r=";
$token = 'test-setup-token-0123456789abcdef';

// Fresh database.
$pdo = new PDO("mysql:host={$db['host']};port={$db['port']};dbname={$db['name']}", $db['user'], $db['pass']);
$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
foreach ($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $t) {
    $pdo->exec("DROP TABLE `$t`");
}
$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

$configFile = sys_get_temp_dir() . '/ff-test-config.php';
file_put_contents($configFile, '<?php return ' . var_export([
    'db' => $db,
    'setup_token' => $token,
    'allowed_hosts' => ["127.0.0.1:$port"],
    'secure_cookies' => false,
], true) . ';');

$site = dirname(__DIR__) . '/site';
$server = proc_open(
    ['php', '-S', "127.0.0.1:$port", '-t', $site],
    [1 => ['file', '/dev/null', 'w'], 2 => ['file', '/dev/null', 'w']],
    $pipes,
    null,
    ['FINANCE_CONFIG' => $configFile] + getenv()
);
register_shutdown_function(fn () => proc_terminate($server));
usleep(400_000);

final class Client
{
    private string $jar;
    public string $csrf = '';

    public function __construct(private string $base, private string $host = '')
    {
        $this->jar = tempnam(sys_get_temp_dir(), 'ffjar');
    }

    public function call(string $method, string $route, ?array $body = null, bool $withCsrf = true): array
    {
        $ch = curl_init($this->base . $route);
        $headers = ['Accept: application/json'];
        if ($this->host) {
            $headers[] = 'Host: ' . $this->host;
        }
        if ($method === 'POST') {
            $headers[] = 'Content-Type: application/json';
            if ($withCsrf) {
                $headers[] = 'X-CSRF-Token: ' . $this->csrf;
            }
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body ?? []));
        }
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_COOKIEJAR => $this->jar,
            CURLOPT_COOKIEFILE => $this->jar,
        ]);
        $raw = (string) curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $data = json_decode($raw, true);
        if (is_array($data) && isset($data['csrf'])) {
            $this->csrf = $data['csrf'];
        }
        return [$status, $data ?? $raw];
    }

    public function get(string $route): array
    {
        return $this->call('GET', $route);
    }

    public function post(string $route, array $body = []): array
    {
        return $this->call('POST', $route, $body);
    }
}

$failures = 0;
$checks = 0;
function check(string $name, bool $ok, mixed $detail = null): void
{
    global $failures, $checks;
    $checks++;
    if ($ok) {
        echo "  ok   $name\n";
        return;
    }
    $failures++;
    echo "  FAIL $name\n       " . json_encode($detail) . "\n";
}
function expectStatus(string $name, array $res, int $status): array
{
    check($name, $res[0] === $status, $res);
    return is_array($res[1]) ? $res[1] : [];
}

$a = new Client($base);
$b = new Client($base);

echo "Setup and sign-in\n";
$s = expectStatus('session before setup', $a->get('session'), 200);
check('needs setup', ($s['needsSetup'] ?? null) === true, $s);
expectStatus('POST without CSRF is refused', $a->call('POST', 'setup', [], false), 403);
$members = [
    ['name' => 'Asha', 'username' => 'asha', 'password' => 'asha-password-1'],
    ['name' => 'Ravi', 'username' => 'ravi', 'password' => 'ravi-password-1'],
];
expectStatus('setup with wrong code', $a->post('setup', ['token' => 'wrong-wrong-wrong-wrong', 'familyName' => 'Test', 'members' => $members]), 403);
expectStatus('setup rejects short password', $a->post('setup', ['token' => $token, 'familyName' => 'Test', 'members' => [['name' => 'X', 'username' => 'xx1', 'password' => 'short']]]), 422);
expectStatus('setup', $a->post('setup', ['token' => $token, 'familyName' => 'Test family', 'members' => $members]), 201);
expectStatus('setup cannot run twice', $a->post('setup', ['token' => $token, 'familyName' => 'Again', 'members' => $members]), 409);
expectStatus('dashboard needs sign-in', $a->get('dashboard'), 401);
expectStatus('wrong password', $a->post('login', ['username' => 'asha', 'password' => 'nope-nope-nope']), 401);
$login = expectStatus('sign in Asha', $a->post('login', ['username' => 'Asha', 'password' => 'asha-password-1']), 200);
check('signed in as Asha', ($login['user']['name'] ?? '') === 'Asha', $login);
$b->get('session');
expectStatus('sign in Ravi', $b->post('login', ['username' => 'ravi', 'password' => 'ravi-password-1']), 200);
$ids = array_column($a->get('members')[1], 'id', 'username');
expectStatus('write without CSRF is refused', $a->call('POST', 'expenses', ['amount' => '10'], false), 403);

echo "Money parsing\n";
$month = date('Y-m');
$today = date('Y-m-d');
$e = expectStatus('expense with commas and paise', $a->post('expenses', ['amount' => '2,500.50', 'category' => 'grocery', 'spent_on' => $today]), 200);
check('stored as exact paise', ($e['amount_paise'] ?? null) === 250050, $e);
expectStatus('three decimals refused', $a->post('expenses', ['amount' => '12.345', 'category' => 'grocery', 'spent_on' => $today]), 422);
expectStatus('negative refused', $a->post('expenses', ['amount' => '-5', 'category' => 'grocery', 'spent_on' => $today]), 422);
expectStatus('float refused', $a->post('expenses', ['amount' => 10.5, 'category' => 'grocery', 'spent_on' => $today]), 422);
expectStatus('bad date refused', $a->post('expenses', ['amount' => '5', 'category' => 'grocery', 'spent_on' => '2026-02-30']), 422);
expectStatus('unknown category refused', $a->post('expenses', ['amount' => '5', 'category' => 'emi', 'spent_on' => $today]), 422);

echo "Private and family rows\n";
$private = expectStatus('private expense', $a->post('expenses', ['amount' => '999', 'category' => 'shopping', 'spent_on' => $today, 'visibility' => 'private', 'notes' => 'gift']), 200);
$bList = $b->get("expenses&month=$month")[1];
check('Ravi does not see Asha\'s private expense', !in_array($private['id'], array_column($bList, 'id'), true), $bList);
check('Ravi sees the family expense', in_array($e['id'], array_column($bList, 'id'), true), $bList);
expectStatus('Ravi cannot edit it', $b->post("expenses/{$private['id']}/update", ['amount' => '1', 'category' => 'shopping', 'spent_on' => $today]), 404);
expectStatus('Ravi cannot delete it', $b->post("expenses/{$private['id']}/delete"), 404);
expectStatus('private row for someone else refused', $a->post('expenses', ['amount' => '5', 'category' => 'milk', 'spent_on' => $today, 'visibility' => 'private', 'member_id' => $ids['ravi']]), 422);
$found = $a->get("expenses&month=$month&q=gift")[1];
check('search finds by note', count($found) === 1, $found);
expectStatus('delete own expense', $a->post("expenses/{$private['id']}/delete"), 200);
check('deleted row is hidden', !in_array($private['id'], array_column($a->get("expenses&month=$month")[1], 'id'), true));
check('deleted row is kept (soft delete)', (int) $pdo->query("SELECT COUNT(*) FROM expenses WHERE id = {$private['id']} AND deleted_at IS NOT NULL")->fetchColumn() === 1);

echo "Income\n";
$sal = expectStatus('salary', $a->post('income', ['income_type' => 'salary', 'stability' => 'variable', 'amount' => '40000', 'received_on' => $today]), 200);
check('salary is always fixed', ($sal['stability'] ?? '') === 'fixed', $sal);
$inc = expectStatus('incentive', $b->post('income', ['income_type' => 'incentive', 'stability' => 'fixed', 'amount' => '9000', 'received_on' => $today]), 200);
check('incentive is always variable', ($inc['stability'] ?? '') === 'variable', $inc);
expectStatus('contribution Asha', $a->post('contributions', ['member_id' => $ids['asha'], 'amount' => '30000', 'effective_from' => "$month-01"]), 200);
expectStatus('contribution Ravi', $a->post('contributions', ['member_id' => $ids['ravi'], 'amount' => '10000', 'effective_from' => "$month-01"]), 200);

echo "Loans\n";
$gold = expectStatus('interest-only loan', $a->post('loans', [
    'name' => 'Gold A', 'loan_type' => 'gold', 'repayment_type' => 'interest_only',
    'outstanding' => '200000', 'interest_rate' => '18', 'monthly_payment' => '3000', 'due_day' => 5,
]), 200);
check('monthly interest 200000 @ 18% = 3000', ($gold['monthly_interest_paise'] ?? null) === 300000, $gold);
check('flag: principal not reducing', in_array('principal_not_reducing', $gold['flags'] ?? [], true), $gold);
check('grouped high-cost', ($gold['group'] ?? '') === 'high_cost', $gold);
$p = expectStatus('interest payment', $a->post("loans/{$gold['id']}/payments", ['amount' => '3000', 'paid_on' => $today]), 200);
check('interest payment does not touch principal', ($p['loan']['outstanding_paise'] ?? null) === 20000000, $p);
check('recorded as interest', ($p['payment']['interest_paise'] ?? null) === 300000 && ($p['payment']['principal_paise'] ?? null) === 0, $p);
$pp = expectStatus('explicit principal payment', $a->post("loans/{$gold['id']}/payments", ['principal' => '50000', 'paid_on' => $today]), 200);
check('principal payment reduces outstanding', ($pp['loan']['outstanding_paise'] ?? null) === 15000000, $pp);
check('interest recalculated on new balance', ($pp['loan']['monthly_interest_paise'] ?? null) === 225000, $pp);
expectStatus('principal above outstanding refused', $a->post("loans/{$gold['id']}/payments", ['principal' => '150001', 'paid_on' => $today]), 422);
$undo = expectStatus('delete principal payment', $a->post("payments/{$pp['payment']['id']}/delete"), 200);
check('deleting restores the principal', ($undo['outstanding_paise'] ?? null) === 20000000, $undo);

$bike = expectStatus('EMI loan without rate', $a->post('loans', [
    'name' => 'Bike', 'loan_type' => 'bike', 'repayment_type' => 'emi', 'outstanding' => '40000',
    'monthly_payment' => '2000', 'remaining_months' => 5, 'as_of_date' => date('Y-m-d', strtotime('first day of -2 months')),
]), 200);
check('flag: rate missing', in_array('rate_missing', $bike['flags'] ?? [], true), $bike);
check('remaining counts down from as-of date', ($bike['remaining_now'] ?? null) === 3, $bike);
check('closing soon', ($bike['closing_soon'] ?? null) === true, $bike);
expectStatus('EMI total without rate refused', $a->post("loans/{$bike['id']}/payments", ['amount' => '2000', 'paid_on' => $today]), 422);
$split = expectStatus('EMI with explicit split', $a->post("loans/{$bike['id']}/payments", ['principal' => '1600', 'interest' => '400', 'paid_on' => $today]), 200);
check('split principal applied', ($split['loan']['outstanding_paise'] ?? null) === 3840000, $split);

$home = expectStatus('EMI loan with rate', $a->post('loans', [
    'name' => 'Home', 'loan_type' => 'home', 'repayment_type' => 'emi', 'outstanding' => '1000000',
    'interest_rate' => '12', 'monthly_payment' => '15000', 'due_day' => 10,
]), 200);
$hp = expectStatus('EMI auto split', $a->post("loans/{$home['id']}/payments", ['amount' => '15000', 'paid_on' => $today]), 200);
check('interest = 10,00,000 × 12% / 12 = 10,000', ($hp['payment']['interest_paise'] ?? null) === 1000000, $hp);
check('principal = 5,000', ($hp['payment']['principal_paise'] ?? null) === 500000 && ($hp['loan']['outstanding_paise'] ?? null) === 99500000, $hp);
check('home loan grouped long-term', ($hp['loan']['group'] ?? '') === 'long_term', $hp);

expectStatus('card needs min due', $a->post('loans', ['name' => 'Card', 'loan_type' => 'credit_card', 'outstanding' => '10000']), 422);
$card = expectStatus('credit card', $a->post('loans', ['name' => 'Card', 'loan_type' => 'credit_card', 'repayment_type' => 'emi', 'outstanding' => '10000', 'min_due' => '1000']), 200);
check('credit card is always revolving', ($card['repayment_type'] ?? '') === 'card', $card);
check('flag: minimum due is not full repayment', in_array('min_due_is_not_full', $card['flags'] ?? [], true), $card);

$tiny = expectStatus('small loan', $a->post('loans', ['name' => 'Tiny', 'loan_type' => 'consumer', 'repayment_type' => 'emi', 'outstanding' => '500', 'monthly_payment' => '500']), 200);
$close = expectStatus('pay it off', $a->post("loans/{$tiny['id']}/payments", ['principal' => '500', 'paid_on' => $today]), 200);
check('loan closes at zero', ($close['loan']['status'] ?? '') === 'closed', $close);
$reopen = expectStatus('undo last payment', $a->post("payments/{$close['payment']['id']}/delete"), 200);
check('undo reopens it', ($reopen['status'] ?? '') === 'active' && array_key_exists('closed_on', $reopen) && $reopen['closed_on'] === null, $reopen);
expectStatus('delete small loan', $a->post("loans/{$tiny['id']}/delete"), 200);

echo "Dashboard\n";
$d = expectStatus('dashboard', $a->get("dashboard&month=$month"), 200);
check('pool = 30,000 + 10,000', ($d['contribution_pool_paise'] ?? null) === 4000000, $d['contribution_pool_paise'] ?? null);
check('variable income counted', ($d['variable_income_paise'] ?? null) === 900000, $d['variable_income_paise'] ?? null);
check('expenses = 2,500.50', ($d['expenses_paise'] ?? null) === 250050, $d['expenses_paise'] ?? null);
// Scheduled: gold 3,000 + bike 2,000 + home 15,000 + card min 1,000 = 21,000.
check('scheduled debt = 21,000', ($d['scheduled_debt_paise'] ?? null) === 2100000, $d['scheduled_debt_paise'] ?? null);
// 40,000 + 9,000 − 2,500.50 − 21,000 = 25,499.50
check('available = 25,499.50', ($d['available_paise'] ?? null) === 2549950, $d['available_paise'] ?? null);
check('outstanding = 2,00,000 + 38,400 + 9,95,000 + 10,000', ($d['outstanding_debt_paise'] ?? null) === 124340000, $d['outstanding_debt_paise'] ?? null);
check('interest-only monthly interest shown', ($d['interest_only_monthly_paise'] ?? null) === 300000, $d['interest_only_monthly_paise'] ?? null);
check('upcoming lists due loans', count($d['upcoming'] ?? []) === 2, $d['upcoming'] ?? null);
$db2 = $b->get("dashboard&month=$month")[1];
check('Ravi sees the same family totals', ($db2['available_paise'] ?? null) === 2549950, $db2['available_paise'] ?? null);

echo "Guards\n";
$other = new Client($base, 'printsahaj.com');
expectStatus('wrong host answers 404', $other->get('session'), 404);
expectStatus('password change needs the current one', $a->post('password', ['current' => 'bad', 'new' => 'another-password-1']), 422);
$a2 = new Client($base);
$a2->get('session');
expectStatus('Asha on a second device', $a2->post('login', ['username' => 'asha', 'password' => 'asha-password-1']), 200);
expectStatus('password change', $a->post('password', ['current' => 'asha-password-1', 'new' => 'asha-password-2']), 200);
expectStatus('her other device is signed out', $a2->get('dashboard'), 401);
expectStatus('this device stays signed in', $a->get('dashboard'), 200);
expectStatus('Ravi stays signed in', $b->get('dashboard'), 200);
expectStatus('logout', $a->post('logout'), 200);
expectStatus('after logout', $a->get('dashboard'), 401);
check('audit log written', (int) $pdo->query('SELECT COUNT(*) FROM audit_log')->fetchColumn() > 10);

$c = new Client($base);
$c->get('session');
for ($i = 0; $i < 5; $i++) {
    $c->post('login', ['username' => 'ravi', 'password' => 'wrong-password-x']);
}
expectStatus('locked after 5 wrong tries', $c->post('login', ['username' => 'ravi', 'password' => 'ravi-password-1']), 429);

echo "\n$checks checks, $failures failed\n";
exit($failures === 0 ? 0 : 1);
