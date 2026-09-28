<?php
/**
 * Goals and the emergency fund.
 *
 * Savings goals hold money the family has set aside (entries in and out).
 * A loan-closure goal holds no money of its own: it tracks a loan's
 * outstanding and projects its end with the planner. Nothing in loan
 * planning ever takes money from a goal.
 */

declare(strict_types=1);

final class Goals
{
    public const KINDS = ['emergency', 'loan_closure', 'home_prepayment', 'vacation', 'education', 'car', 'investment', 'custom'];

    public static function list(array $user): array
    {
        [$where, $params] = Scope::visible($user, 'g');
        $rows = Db::all(
            "SELECT g.*, u.name AS member_name FROM goals g JOIN users u ON u.id = g.user_id
             WHERE $where ORDER BY g.status = 'done', g.kind <> 'emergency', g.target_date IS NULL, g.target_date, g.id",
            $params
        );
        return array_map(fn ($g) => self::describe($user, $g), $rows);
    }

    /** Current amount from entries (in − out), all visible entries of one goal. */
    private static function saved(int $goalId): int
    {
        $row = Db::one(
            "SELECT COALESCE(SUM(CASE WHEN direction = 'in' THEN amount_paise ELSE -amount_paise END), 0) AS net
             FROM goal_entries WHERE goal_id = ? AND deleted_at IS NULL",
            [$goalId]
        );
        return (int) $row['net'];
    }

    public static function describe(array $user, array $g): array
    {
        $thisMonth = substr(today(), 0, 7);
        $target = (int) $g['target_paise'];
        $monthly = $g['monthly_paise'] !== null ? (int) $g['monthly_paise'] : 0;
        $loan = null;
        $projected = null;

        if ($g['kind'] === 'loan_closure' && $g['loan_id'] !== null) {
            $loan = Db::one('SELECT id, name, outstanding_paise, status FROM loans WHERE id = ? AND deleted_at IS NULL', [$g['loan_id']]);
            $outstanding = $loan ? (int) $loan['outstanding_paise'] : 0;
            $current = max(0, (int) $g['start_paise'] - $outstanding);
            $target = (int) $g['start_paise'];
            if ($loan && $outstanding > 0) {
                // If freed EMIs and this goal's monthly amount go to this loan first.
                $start = addMonths($thisMonth, 1);
                [$loans] = Planner::prepare($user, $start);
                $plan = Planner::simulate($loans, $start, $monthly, [], 'custom', [(int) $loan['id']]);
                foreach ($plan['loans'] as $pl) {
                    if ($pl['id'] === (int) $loan['id']) {
                        $projected = $pl['close_month'];
                    }
                }
            }
        } else {
            $current = self::saved((int) $g['id']);
        }

        $remaining = max(0, $target - $current);
        $done = $remaining === 0 || $g['status'] === 'done';
        if ($g['kind'] !== 'loan_closure' && !$done && $monthly > 0) {
            $projected = addMonths($thisMonth, intdiv($remaining + $monthly - 1, $monthly));
        }

        $required = null;
        if (!$done && $g['target_date'] !== null) {
            $monthsLeft = max(1, monthsBetween(today(), $g['target_date']));
            $required = intdiv($remaining + $monthsLeft - 1, $monthsLeft);
        }

        $state = match (true) {
            $done => 'done',
            $g['target_date'] !== null && $projected !== null => $projected <= substr($g['target_date'], 0, 7) ? 'on_track' : 'behind',
            $g['target_date'] !== null => 'behind',
            $projected !== null => 'on_track',
            default => 'no_plan',
        };

        return $g + [
            'current_paise' => $current,
            'target_now_paise' => $target,
            'remaining_paise' => $remaining,
            'progress_pct' => $target > 0 ? min(100, intdiv(max(0, $current) * 100, $target)) : 0,
            'reached_min' => $g['target_min_paise'] !== null && $current >= (int) $g['target_min_paise'],
            'projected_month' => $done ? null : $projected,
            'required_monthly_paise' => $required,
            'state' => $state,
            'loan' => $loan,
        ];
    }

    private static function fields(array $user, Input $in, ?array $existing): array
    {
        $kind = $existing['kind'] ?? $in->enum('kind', self::KINDS);
        $member = Scope::member($user, $in->raw('member_id'));
        $f = [
            'user_id' => $member,
            'visibility' => Scope::visibility($user, $in, $member),
            'name' => $in->str('name', 80, true, 'Goal name'),
            'kind' => $kind,
            'target_date' => $in->date('target_date', false),
            'monthly_paise' => $in->money('monthly', false),
            'status' => $in->enum('status', ['active', 'done'], 'active'),
            'notes' => $in->str('notes', 500, false, 'Notes'),
            'target_min_paise' => null,
        ];
        if ($kind === 'loan_closure') {
            $loanId = $existing['loan_id'] ?? $in->int('loan_id', 1, PHP_INT_MAX);
            $loan = Scope::find($user, 'loans', (int) $loanId);
            if ((int) $loan['outstanding_paise'] === 0) {
                throw new HttpError(422, 'That loan is already paid off.');
            }
            $f['loan_id'] = (int) $loan['id'];
            $f['start_paise'] = $existing['start_paise'] ?? (int) $loan['outstanding_paise'];
            $f['target_paise'] = $f['start_paise'];
        } else {
            $f['target_paise'] = $in->money('target');
            if ($f['target_paise'] === 0) {
                throw new HttpError(422, 'Target must be more than zero.');
            }
            if ($kind === 'emergency') {
                $f['target_min_paise'] = $in->money('target_min', false);
                if ($f['target_min_paise'] !== null && $f['target_min_paise'] > $f['target_paise']) {
                    throw new HttpError(422, 'The lower target cannot be above the full target.');
                }
            }
            $f['loan_id'] = null;
            $f['start_paise'] = null;
        }
        return $f;
    }

    public static function create(array $user, Input $in): array
    {
        $f = self::fields($user, $in, null);
        if ($f['kind'] === 'emergency') {
            $exists = Db::one("SELECT id FROM goals WHERE family_id = ? AND kind = 'emergency' AND status = 'active' AND deleted_at IS NULL", [$user['family_id']]);
            if ($exists) {
                throw new HttpError(422, 'There is already an emergency fund. Add money to it instead.');
            }
        }
        $cols = array_keys($f);
        $id = Db::insert(
            'INSERT INTO goals (family_id, ' . implode(', ', $cols) . ', created_at, updated_at) VALUES (?' . str_repeat(', ?', count($cols)) . ', NOW(), NOW())',
            array_merge([$user['family_id']], array_values($f))
        );
        Audit::log($user, 'create', 'goal', $id, $f);
        return self::describe($user, Scope::find($user, 'goals', $id));
    }

    public static function update(array $user, int $id, Input $in): array
    {
        $existing = Scope::find($user, 'goals', $id);
        $f = self::fields($user, $in, $existing);
        $set = implode(', ', array_map(fn ($c) => "$c = ?", array_keys($f)));
        Db::run("UPDATE goals SET $set, updated_at = NOW() WHERE id = ?", array_merge(array_values($f), [$id]));
        Audit::log($user, 'update', 'goal', $id, $f);
        return self::describe($user, Scope::find($user, 'goals', $id));
    }

    public static function entries(array $user, int $goalId): array
    {
        Scope::find($user, 'goals', $goalId);
        return Db::all(
            'SELECT e.*, u.name AS member_name FROM goal_entries e JOIN users u ON u.id = e.user_id
             WHERE e.goal_id = ? AND e.deleted_at IS NULL ORDER BY e.entry_on DESC, e.id DESC',
            [$goalId]
        );
    }

    /** Money put into (or taken out of) a savings goal. */
    public static function addEntry(array $user, int $goalId, Input $in): array
    {
        $goal = Scope::find($user, 'goals', $goalId);
        if ($goal['kind'] === 'loan_closure') {
            throw new HttpError(422, 'A loan goal moves with loan payments. Record a principal payment on the loan instead.');
        }
        $direction = $in->enum('direction', ['in', 'out'], 'in');
        $amount = $in->money('amount');
        if ($amount === 0) {
            throw new HttpError(422, 'Amount is zero.');
        }
        if ($direction === 'out' && $amount > self::saved($goalId)) {
            throw new HttpError(422, 'That is more than the goal holds.');
        }
        $id = Db::insert(
            'INSERT INTO goal_entries (family_id, goal_id, user_id, direction, amount_paise, entry_on, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [$user['family_id'], $goalId, Scope::member($user, $in->raw('member_id')), $direction, $amount, $in->date('entry_on'), $in->str('notes', 500, false, 'Notes')]
        );
        Audit::log($user, 'create', 'goal_entry', $id, ['goal_id' => $goalId, 'direction' => $direction, 'amount_paise' => $amount]);
        return self::describe($user, Scope::find($user, 'goals', $goalId));
    }

    public static function deleteEntry(array $user, int $id): array
    {
        $e = Db::one('SELECT * FROM goal_entries WHERE id = ? AND family_id = ? AND deleted_at IS NULL', [$id, $user['family_id']]);
        if ($e === null) {
            throw new HttpError(404, 'Not found.');
        }
        $goal = Scope::find($user, 'goals', (int) $e['goal_id']);
        if ($e['direction'] === 'in' && self::saved((int) $goal['id']) - (int) $e['amount_paise'] < 0) {
            throw new HttpError(422, 'Undo the withdrawal first; the goal would go below zero.');
        }
        Db::run('UPDATE goal_entries SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?', [$id]);
        Audit::log($user, 'delete', 'goal_entry', $id);
        return self::describe($user, $goal);
    }

    /** For the dashboard: net money set aside this month, and the emergency fund. */
    public static function summary(array $user, string $from, string $to): array
    {
        [$where, $params] = Scope::visible($user, 'g');
        $row = Db::one(
            "SELECT COALESCE(SUM(CASE WHEN e.direction = 'in' THEN e.amount_paise ELSE -e.amount_paise END), 0) AS net
             FROM goal_entries e JOIN goals g ON g.id = e.goal_id
             WHERE $where AND e.deleted_at IS NULL AND e.entry_on BETWEEN ? AND ?",
            array_merge($params, [$from, $to])
        );
        $ef = Db::one("SELECT g.* FROM goals g WHERE $where AND g.kind = 'emergency' AND g.status = 'active' LIMIT 1", $params);
        return [
            'saved_to_goals_paise' => (int) $row['net'],
            'emergency' => $ef ? self::describe($user, $ef) : null,
        ];
    }
}
