<?php
/**
 * The only PHP entry point. Called as api/index.php?r=/income/12/update.
 * Reads are GET; every change is a POST carrying the CSRF header.
 */

declare(strict_types=1);

require __DIR__ . '/../src/lib.php';
require __DIR__ . '/../src/auth.php';
require __DIR__ . '/../src/records.php';
require __DIR__ . '/../src/planner.php';
require __DIR__ . '/../src/goals.php';
require __DIR__ . '/../src/ai.php';
require __DIR__ . '/../src/reports.php';

date_default_timezone_set('Asia/Kolkata');
ini_set('display_errors', '0');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: no-referrer');

try {
    $config = Config::get();
    $hosts = $config['allowed_hosts'] ?? [];
    if ($hosts && !in_array(strtolower($_SERVER['HTTP_HOST'] ?? ''), $hosts, true)) {
        throw new HttpError(404, 'Not found.');
    }

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $route = trim((string) ($_GET['r'] ?? ''), '/');
    $parts = $route === '' ? [] : explode('/', $route);
    if ($method === 'POST' && !str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
        throw new HttpError(415, 'Send JSON.');
    }

    Migrator::run();
    Auth::start();

    // Routes that work without a session.
    if ($route === 'session' && $method === 'GET') {
        $user = Auth::user();
        Http::json([
            'user' => $user,
            'locked' => Auth::isLocked(),
            'csrf' => Auth::csrfToken(),
            'needsSetup' => $user === null && Auth::needsSetup(),
        ]);
    }
    if ($route === 'setup' && $method === 'POST') {
        Auth::checkCsrf();
        Http::json(Auth::setup(new Input(Http::body())), 201);
    }
    if ($route === 'login' && $method === 'POST') {
        Auth::checkCsrf();
        $in = new Input(Http::body());
        $user = Auth::login($in->str('username', 40, true, 'Username'), (string) $in->raw('password'));
        Http::json(['user' => $user, 'csrf' => Auth::csrfToken()]);
    }

    $user = Auth::requireUser();
    if ($method === 'POST') {
        Auth::checkCsrf();
    } elseif ($method !== 'GET') {
        throw new HttpError(405, 'Method not allowed.');
    }
    $in = new Input($method === 'POST' ? Http::body() : $_GET);
    $month = static fn () => (string) ($_GET['month'] ?? substr(today(), 0, 7));
    $range = static fn () => dateRange((string) ($_GET['from'] ?? ''), (string) ($_GET['to'] ?? ''));
    $id = isset($parts[1]) && ctype_digit($parts[1]) ? (int) $parts[1] : null;
    // Either resource/:id/action or resource/action.
    $action = $id !== null ? ($parts[2] ?? '') : ($parts[1] ?? '');
    $key = $method . ' ' . ($parts[0] ?? '') . ($id !== null ? '/:id' : '') . ($action !== '' ? "/$action" : '');
    if (!in_array($key, ['POST logout', 'POST pin/unlock', 'POST pin/lock'], true)) {
        Auth::requireUnlocked();
    }

    $result = match ($key) {
        'POST logout' => (function () {
            Auth::logout();
            return ['ok' => true, 'csrf' => Auth::csrfToken()];
        })(),
        'POST pin/lock' => ['locked' => Auth::lock($user)],
        'POST pin/unlock' => (function () use ($user, $in) {
            Auth::unlock($user, (string) $in->raw('pin'));
            return ['ok' => true];
        })(),
        'POST pin' => (function () use ($user, $in) {
            Auth::setPin($user, (string) $in->raw('password'), (string) $in->raw('pin'));
            return ['ok' => true];
        })(),
        'POST pin/remove' => (function () use ($user, $in) {
            Auth::removePin($user, (string) $in->raw('password'));
            return ['ok' => true];
        })(),
        'POST password' => (function () use ($user, $in) {
            Auth::changePassword($user, (string) $in->raw('current'), (string) $in->raw('new'));
            return ['ok' => true];
        })(),
        'POST members/:id/password' => (function () use ($user, $id, $in) {
            Auth::resetMemberPassword($user, $id, (string) $in->raw('new'));
            return ['ok' => true];
        })(),
        'GET activity' => Auth::activity($user),
        'GET members' => Db::all('SELECT id, name, username, role FROM users WHERE family_id = ? ORDER BY id', [$user['family_id']]),
        'GET meta' => ['income_types' => Income::TYPES, 'expense_categories' => Expenses::CATEGORIES, 'loan_types' => Loans::TYPES, 'goal_kinds' => Goals::KINDS, 'ai_enabled' => Ai::enabled()],

        'GET dashboard' => Dashboard::get($user, $month()),

        'GET income' => Income::list($user, $month(), $range()),
        'POST income' => Income::create($user, $in),
        'POST income/:id/update' => Income::update($user, $id, $in),
        'POST income/:id/delete' => (function () use ($user, $id) {
            softDelete($user, 'income', 'income', $id);
            return ['ok' => true];
        })(),

        'GET expenses' => Expenses::list($user, $month(), (string) ($_GET['q'] ?? ''), (string) ($_GET['category'] ?? ''), $range()),
        'POST expenses' => Expenses::create($user, $in),
        'POST expenses/:id/update' => Expenses::update($user, $id, $in),
        'POST expenses/:id/delete' => (function () use ($user, $id) {
            softDelete($user, 'expenses', 'expense', $id);
            return ['ok' => true];
        })(),

        'GET contributions' => Contributions::list($user),
        'POST contributions' => Contributions::create($user, $in),
        'POST contributions/:id/delete' => (function () use ($user, $id) {
            Contributions::delete($user, $id);
            return ['ok' => true];
        })(),

        'GET loans' => Loans::list($user, $month()),
        'POST loans' => Loans::create($user, $in),
        'POST loans/:id/update' => Loans::update($user, $id, $in),
        'POST loans/:id/delete' => (function () use ($user, $id) {
            softDelete($user, 'loans', 'loan', $id);
            return ['ok' => true];
        })(),
        'GET loans/:id/payments' => Payments::list($user, $id),
        'POST loans/:id/payments' => Payments::create($user, $id, $in),
        'POST payments/:id/delete' => Payments::delete($user, $id),
        'POST loans/:id/skip' => LoanSkips::mark($user, $id, $in),
        'POST loans/:id/unskip' => LoanSkips::unmark($user, $id, $in),

        'GET budgets' => Budgets::list($user),
        'POST budgets' => Budgets::create($user, $in),
        'POST budgets/:id/delete' => (function () use ($user, $id) {
            Budgets::delete($user, $id);
            return ['ok' => true];
        })(),
        'GET reports' => Reports::monthly($user, $month()),

        'GET goals' => Goals::list($user),
        'POST goals' => Goals::create($user, $in),
        'POST goals/:id/update' => Goals::update($user, $id, $in),
        'POST goals/:id/delete' => (function () use ($user, $id) {
            softDelete($user, 'goals', 'goal', $id);
            return ['ok' => true];
        })(),
        'GET goals/:id/entries' => Goals::entries($user, $id),
        'POST goals/:id/entries' => Goals::addEntry($user, $id, $in),
        'POST goal-entries/:id/delete' => Goals::deleteEntry($user, $id),

        // The AI reads engine results and read-only tools; it cannot write data.
        'GET ai/history' => Ai::history($user),
        'POST ai/ask' => Ai::ask($user, $in),

        // Planning only reads; nothing here changes saved data.
        'POST plan/simulate' => Planner::run($user, $in),
        'POST plan/refinance' => Planner::refinance($user, $in),

        default => throw new HttpError(404, 'Not found.'),
    };
    Http::json($result);
} catch (HttpError $e) {
    Http::json(['error' => $e->getMessage()], $e->status);
} catch (Throwable $e) {
    // Log the kind of failure, never the request body (it holds amounts).
    error_log('finance api: ' . get_class($e) . ' at ' . basename($e->getFile()) . ':' . $e->getLine());
    Http::json(['error' => 'Something went wrong. Please try again.'], 500);
}
