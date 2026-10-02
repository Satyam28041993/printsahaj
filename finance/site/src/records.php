<?php
/**
 * Income, contributions, expenses, loans, loan payments and the dashboard.
 *
 * Visibility: a row is seen by its owner, and by the whole family when its
 * visibility is "family". Every query goes through Scope so that rule lives
 * in one place.
 */

declare(strict_types=1);

final class Scope
{
    /** WHERE fragment for rows this user may see, with its parameters. */
    public static function visible(array $user, string $alias = ''): array
    {
        $a = $alias ? "$alias." : '';
        return [
            "{$a}family_id = ? AND {$a}deleted_at IS NULL AND ({$a}visibility = 'family' OR {$a}user_id = ?)",
            [$user['family_id'], $user['id']],
        ];
    }

    /** A family member id, checked to be in this user's family. */
    public static function member(array $user, mixed $id): int
    {
        $id = is_numeric($id) ? (int) $id : (int) $user['id'];
        $row = Db::one('SELECT id FROM users WHERE id = ? AND family_id = ?', [$id, $user['family_id']]);
        if ($row === null) {
            throw new HttpError(422, 'That person is not in this family.');
        }
        return $id;
    }

    /** Private rows belong to one person; nobody records a private row for someone else. */
    public static function visibility(array $user, Input $in, int $memberId): string
    {
        $visibility = $in->enum('visibility', ['private', 'family'], 'family');
        if ($visibility === 'private' && $memberId !== (int) $user['id']) {
            throw new HttpError(422, 'A private entry can only be your own.');
        }
        return $visibility;
    }

    public static function find(array $user, string $table, int $id): array
    {
        [$where, $params] = self::visible($user);
        $row = Db::one("SELECT * FROM $table WHERE id = ? AND $where", array_merge([$id], $params));
        if ($row === null) {
            throw new HttpError(404, 'Not found.');
        }
        return $row;
    }
}

final class Income
{
    public const TYPES = ['salary', 'incentive', 'commission', 'crm', 'freelance', 'business', 'other'];
    /** Salary is fixed; incentives and side income are never treated as guaranteed. */
    private const FORCED = ['salary' => 'fixed', 'incentive' => 'variable', 'commission' => 'variable', 'crm' => 'variable', 'freelance' => 'variable'];

    /** One month, or an explicit from/to range (inclusive) when $range is given. */
    public static function list(array $user, string $month, ?array $range = null): array
    {
        [$from, $to] = $range ?? monthRange($month);
        [$where, $params] = Scope::visible($user, 'i');
        return Db::all(
            "SELECT i.*, u.name AS member_name FROM income i JOIN users u ON u.id = i.user_id
             WHERE $where AND i.received_on BETWEEN ? AND ? ORDER BY i.received_on DESC, i.id DESC",
            array_merge($params, [$from, $to])
        );
    }

    private static function fields(array $user, Input $in): array
    {
        $type = $in->enum('income_type', self::TYPES);
        $member = Scope::member($user, $in->raw('member_id'));
        return [
            'user_id' => $member,
            'visibility' => Scope::visibility($user, $in, $member),
            'income_type' => $type,
            'stability' => self::FORCED[$type] ?? $in->enum('stability', ['fixed', 'variable'], 'variable'),
            'amount_paise' => $in->money('amount'),
            'received_on' => $in->date('received_on'),
            'is_recurring' => $in->bool('is_recurring') ? 1 : 0,
            'notes' => $in->str('notes', 500, false, 'Notes'),
        ];
    }

    public static function create(array $user, Input $in): array
    {
        $f = self::fields($user, $in);
        $id = Db::insert(
            'INSERT INTO income (family_id, user_id, visibility, income_type, stability, amount_paise, received_on, is_recurring, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [$user['family_id'], $f['user_id'], $f['visibility'], $f['income_type'], $f['stability'], $f['amount_paise'], $f['received_on'], $f['is_recurring'], $f['notes']]
        );
        Audit::log($user, 'create', 'income', $id, $f);
        return Scope::find($user, 'income', $id);
    }

    public static function update(array $user, int $id, Input $in): array
    {
        Scope::find($user, 'income', $id);
        $f = self::fields($user, $in);
        Db::run(
            'UPDATE income SET user_id = ?, visibility = ?, income_type = ?, stability = ?, amount_paise = ?, received_on = ?, is_recurring = ?, notes = ?, updated_at = NOW() WHERE id = ?',
            [$f['user_id'], $f['visibility'], $f['income_type'], $f['stability'], $f['amount_paise'], $f['received_on'], $f['is_recurring'], $f['notes'], $id]
        );
        Audit::log($user, 'update', 'income', $id, $f);
        return Scope::find($user, 'income', $id);
    }
}

final class Expenses
{
    public const CATEGORIES = [
        'grocery', 'electricity', 'mobile_internet', 'milk', 'vegetables', 'kids', 'school', 'medical',
        'travel', 'shopping', 'entertainment', 'household', 'rent', 'insurance', 'other',
    ];

    public static function list(array $user, string $month, string $search = '', string $category = '', ?array $range = null): array
    {
        [$from, $to] = $range ?? monthRange($month);
        [$where, $params] = Scope::visible($user, 'e');
        $sql = "SELECT e.*, u.name AS member_name FROM expenses e JOIN users u ON u.id = e.user_id
                WHERE $where AND e.spent_on BETWEEN ? AND ?";
        $params = array_merge($params, [$from, $to]);
        if ($category !== '') {
            if (!in_array($category, self::CATEGORIES, true)) {
                throw new HttpError(422, 'Unknown category.');
            }
            $sql .= ' AND e.category = ?';
            $params[] = $category;
        }
        if ($search !== '') {
            $sql .= ' AND e.notes LIKE ?';
            $params[] = '%' . addcslashes(mb_substr($search, 0, 60), '%_\\') . '%';
        }
        return Db::all($sql . ' ORDER BY e.spent_on DESC, e.id DESC', $params);
    }

    private static function fields(array $user, Input $in): array
    {
        $member = Scope::member($user, $in->raw('member_id'));
        return [
            'user_id' => $member,
            'visibility' => Scope::visibility($user, $in, $member),
            'category' => $in->enum('category', self::CATEGORIES),
            'amount_paise' => $in->money('amount'),
            'spent_on' => $in->date('spent_on'),
            'is_recurring' => $in->bool('is_recurring') ? 1 : 0,
            'notes' => $in->str('notes', 500, false, 'Notes'),
        ];
    }

    public static function create(array $user, Input $in): array
    {
        $f = self::fields($user, $in);
        $id = Db::insert(
            'INSERT INTO expenses (family_id, user_id, visibility, category, amount_paise, spent_on, is_recurring, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [$user['family_id'], $f['user_id'], $f['visibility'], $f['category'], $f['amount_paise'], $f['spent_on'], $f['is_recurring'], $f['notes']]
        );
        Audit::log($user, 'create', 'expense', $id, $f);
        return Scope::find($user, 'expenses', $id);
    }

    public static function update(array $user, int $id, Input $in): array
    {
        Scope::find($user, 'expenses', $id);
        $f = self::fields($user, $in);
        Db::run(
            'UPDATE expenses SET user_id = ?, visibility = ?, category = ?, amount_paise = ?, spent_on = ?, is_recurring = ?, notes = ?, updated_at = NOW() WHERE id = ?',
            [$f['user_id'], $f['visibility'], $f['category'], $f['amount_paise'], $f['spent_on'], $f['is_recurring'], $f['notes'], $id]
        );
        Audit::log($user, 'update', 'expense', $id, $f);
        return Scope::find($user, 'expenses', $id);
    }
}

/** Soft delete for any of the simple tables. */
function softDelete(array $user, string $table, string $entity, int $id): void
{
    Scope::find($user, $table, $id);
    Db::run("UPDATE $table SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?", [$id]);
    Audit::log($user, 'delete', $entity, $id);
}

final class Contributions
{
    /** Each member's current monthly contribution to the family pool, plus history. */
    public static function list(array $user): array
    {
        $members = Db::all('SELECT id, name FROM users WHERE family_id = ? ORDER BY id', [$user['family_id']]);
        $history = Db::all(
            'SELECT c.*, u.name AS member_name FROM contributions c JOIN users u ON u.id = c.user_id
             WHERE c.family_id = ? AND c.deleted_at IS NULL ORDER BY c.effective_from DESC, c.id DESC',
            [$user['family_id']]
        );
        return ['members' => $members, 'history' => $history, 'current' => self::onDate($user, today())];
    }

    /** member_id => paise in effect on a date (latest effective_from <= date). */
    public static function onDate(array $user, string $date): array
    {
        $rows = Db::all(
            'SELECT c.user_id, c.amount_paise FROM contributions c
             WHERE c.family_id = ? AND c.deleted_at IS NULL AND c.effective_from <= ?
             ORDER BY c.effective_from DESC, c.id DESC',
            [$user['family_id'], $date]
        );
        $current = [];
        foreach ($rows as $r) {
            $current[(int) $r['user_id']] ??= (int) $r['amount_paise'];
        }
        return $current;
    }

    public static function create(array $user, Input $in): array
    {
        $member = Scope::member($user, $in->raw('member_id'));
        $amount = $in->money('amount');
        $from = $in->date('effective_from');
        $id = Db::insert(
            'INSERT INTO contributions (family_id, user_id, amount_paise, effective_from, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [$user['family_id'], $member, $amount, $from, $in->str('notes', 500, false, 'Notes')]
        );
        Audit::log($user, 'create', 'contribution', $id, ['user_id' => $member, 'amount_paise' => $amount, 'effective_from' => $from]);
        return self::list($user);
    }

    public static function delete(array $user, int $id): void
    {
        $row = Db::one('SELECT id FROM contributions WHERE id = ? AND family_id = ? AND deleted_at IS NULL', [$id, $user['family_id']]);
        if ($row === null) {
            throw new HttpError(404, 'Not found.');
        }
        Db::run('UPDATE contributions SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?', [$id]);
        Audit::log($user, 'delete', 'contribution', $id);
    }
}

final class Budgets
{
    /** Each category's current target, plus history. Same pattern as Contributions. */
    public static function list(array $user): array
    {
        $history = Db::all(
            'SELECT b.*, u.name AS member_name FROM category_budgets b JOIN users u ON u.id = b.user_id
             WHERE b.family_id = ? AND b.deleted_at IS NULL ORDER BY b.effective_from DESC, b.id DESC',
            [$user['family_id']]
        );
        return ['history' => $history, 'current' => self::onDate($user, today())];
    }

    /** category => paise in effect on a date (latest effective_from <= date). */
    public static function onDate(array $user, string $date): array
    {
        $rows = Db::all(
            'SELECT b.category, b.amount_paise FROM category_budgets b
             WHERE b.family_id = ? AND b.deleted_at IS NULL AND b.effective_from <= ?
             ORDER BY b.effective_from DESC, b.id DESC',
            [$user['family_id'], $date]
        );
        $current = [];
        foreach ($rows as $r) {
            $current[$r['category']] ??= (int) $r['amount_paise'];
        }
        return $current;
    }

    public static function create(array $user, Input $in): array
    {
        $category = $in->enum('category', Expenses::CATEGORIES);
        $amount = $in->money('amount');
        $from = $in->date('effective_from');
        $id = Db::insert(
            'INSERT INTO category_budgets (family_id, user_id, category, amount_paise, effective_from, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [$user['family_id'], $user['id'], $category, $amount, $from, $in->str('notes', 500, false, 'Notes')]
        );
        Audit::log($user, 'create', 'category_budget', $id, ['category' => $category, 'amount_paise' => $amount, 'effective_from' => $from]);
        return self::list($user);
    }

    public static function delete(array $user, int $id): void
    {
        $row = Db::one('SELECT id FROM category_budgets WHERE id = ? AND family_id = ? AND deleted_at IS NULL', [$id, $user['family_id']]);
        if ($row === null) {
            throw new HttpError(404, 'Not found.');
        }
        Db::run('UPDATE category_budgets SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?', [$id]);
        Audit::log($user, 'delete', 'category_budget', $id);
    }
}

/** Explicit "this EMI was not paid this month" marks. Recording a real payment clears the mark. */
final class LoanSkips
{
    /** loan_id => true, for months with an explicit "not paid" mark and no payment since. */
    public static function forMonth(array $user, string $month): array
    {
        [$where, $params] = Scope::visible($user, 'l');
        $rows = Db::all(
            "SELECT s.loan_id FROM loan_skips s JOIN loans l ON l.id = s.loan_id WHERE $where AND s.month = ?",
            array_merge($params, [$month])
        );
        return array_fill_keys(array_map(fn ($r) => (int) $r['loan_id'], $rows), true);
    }

    public static function mark(array $user, int $loanId, Input $in): array
    {
        Scope::find($user, 'loans', $loanId);
        $month = (string) $in->raw('month');
        monthRange($month);
        Db::run(
            'INSERT INTO loan_skips (family_id, loan_id, user_id, month, notes, created_at) VALUES (?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE notes = VALUES(notes)',
            [$user['family_id'], $loanId, $user['id'], $month, $in->str('notes', 500, false, 'Notes')]
        );
        Audit::log($user, 'create', 'loan_skip', $loanId, ['month' => $month]);
        return Loans::describe(Scope::find($user, 'loans', $loanId), substr(today(), 0, 7));
    }

    public static function unmark(array $user, int $loanId, Input $in): array
    {
        Scope::find($user, 'loans', $loanId);
        $month = (string) $in->raw('month');
        Db::run('DELETE FROM loan_skips WHERE loan_id = ? AND month = ? AND family_id = ?', [$loanId, $month, $user['family_id']]);
        Audit::log($user, 'delete', 'loan_skip', $loanId, ['month' => $month]);
        return Loans::describe(Scope::find($user, 'loans', $loanId), substr(today(), 0, 7));
    }
}

final class Loans
{
    public const TYPES = ['gold', 'home', 'personal', 'bike', 'consumer', 'credit_card', 'other'];
    /** Yearly rate at or above which a loan is shown as high-cost. */
    private const HIGH_COST_UNITS = 150000;

    public static function list(array $user, ?string $month = null): array
    {
        $month ??= substr(today(), 0, 7);
        [$where, $params] = Scope::visible($user, 'l');
        $rows = Db::all(
            "SELECT l.*, u.name AS member_name FROM loans l JOIN users u ON u.id = l.user_id
             WHERE $where ORDER BY l.status = 'closed', l.outstanding_paise DESC",
            $params
        );
        return array_map(fn (array $l) => self::describe($l, $month), $rows);
    }

    /**
     * Adds what the app works out about a loan for a given month. All of it
     * is arithmetic on stored numbers; nothing is guessed when a number is
     * missing (the flags say what is missing instead).
     */
    public static function describe(array $l, string $month): array
    {
        $flags = [];
        $remainingNow = null;
        $closeMonth = null;
        if ($l['remaining_months'] !== null) {
            $remainingNow = max(0, (int) $l['remaining_months'] - max(0, monthsBetween($l['as_of_date'], $month . '-01')));
            if ((int) $l['remaining_months'] > 0) {
                $closeMonth = addMonths(substr($l['as_of_date'], 0, 7), (int) $l['remaining_months'] - 1);
            }
        }
        $active = $l['status'] === 'active' && (int) $l['outstanding_paise'] > 0;
        $monthlyInterest = null;
        if ($l['interest_rate'] !== null) {
            $monthlyInterest = Money::monthlyInterest((int) $l['outstanding_paise'], (string) $l['interest_rate']);
        } elseif ($active) {
            $flags[] = 'rate_missing';
        }

        $scheduled = 0;
        if ($active && ($closeMonth === null || $closeMonth >= $month)) {
            $scheduled = $l['repayment_type'] === 'card'
                ? min((int) ($l['min_due_paise'] ?? 0), (int) $l['outstanding_paise'])
                : (int) ($l['monthly_payment_paise'] ?? 0);
        }
        if ($active && $l['repayment_type'] !== 'card' && $l['monthly_payment_paise'] === null) {
            $flags[] = 'payment_missing';
        }
        if ($active && $l['repayment_type'] === 'interest_only') {
            $flags[] = 'principal_not_reducing';
        }
        if ($active && $l['repayment_type'] === 'card') {
            $flags[] = 'min_due_is_not_full';
        }

        $isHighCost = $l['interest_rate'] !== null && Money::rateUnits((string) $l['interest_rate']) >= self::HIGH_COST_UNITS;
        $group = match (true) {
            !$active => 'closed',
            $isHighCost => 'high_cost',
            $l['loan_type'] === 'home' || ($remainingNow !== null && $remainingNow > 60) => 'long_term',
            $remainingNow !== null && $remainingNow <= 24 => 'short_term',
            default => 'other',
        };

        return $l + [
            'remaining_now' => $remainingNow,
            'projected_close' => $closeMonth,
            'monthly_interest_paise' => $monthlyInterest,
            'scheduled_paise' => $scheduled,
            'group' => $group,
            'closing_soon' => $active && $remainingNow !== null && $remainingNow <= 3,
            'flags' => $flags,
        ];
    }

    private static function fields(array $user, Input $in): array
    {
        $type = $in->enum('loan_type', self::TYPES);
        $repayment = $type === 'credit_card' ? 'card' : $in->enum('repayment_type', ['emi', 'interest_only', 'card']);
        $member = Scope::member($user, $in->raw('member_id'));
        $f = [
            'user_id' => $member,
            'visibility' => Scope::visibility($user, $in, $member),
            'name' => $in->str('name', 80, true, 'Loan name'),
            'loan_type' => $type,
            'repayment_type' => $repayment,
            'original_principal_paise' => $in->money('original_principal', false),
            'outstanding_paise' => $in->money('outstanding'),
            'interest_rate' => Money::parseRate($in->raw('interest_rate')),
            'monthly_payment_paise' => $in->money('monthly_payment', false),
            'min_due_paise' => $in->money('min_due', false),
            'due_day' => $in->int('due_day', 1, 31, false),
            'start_date' => $in->date('start_date', false),
            'tenure_months' => $in->int('tenure_months', 1, 600, false),
            'remaining_months' => $in->int('remaining_months', 0, 600, false),
            'as_of_date' => $in->date('as_of_date', false) ?? today(),
            'status' => $in->enum('status', ['active', 'closed'], 'active'),
            'notes' => $in->str('notes', 500, false, 'Notes'),
        ];
        if ($repayment === 'card' && $f['min_due_paise'] === null) {
            throw new HttpError(422, 'A credit card needs its minimum due.');
        }
        $f['closed_on'] = $f['status'] === 'closed' ? ($in->date('closed_on', false) ?? today()) : null;
        return $f;
    }

    public static function create(array $user, Input $in): array
    {
        $f = self::fields($user, $in);
        $cols = array_keys($f);
        $id = Db::insert(
            'INSERT INTO loans (family_id, ' . implode(', ', $cols) . ', created_at, updated_at) VALUES (?' . str_repeat(', ?', count($cols)) . ', NOW(), NOW())',
            array_merge([$user['family_id']], array_values($f))
        );
        Audit::log($user, 'create', 'loan', $id, $f);
        return self::describe(Scope::find($user, 'loans', $id), substr(today(), 0, 7));
    }

    public static function update(array $user, int $id, Input $in): array
    {
        Scope::find($user, 'loans', $id);
        $f = self::fields($user, $in);
        $set = implode(', ', array_map(fn ($c) => "$c = ?", array_keys($f)));
        Db::run("UPDATE loans SET $set, updated_at = NOW() WHERE id = ?", array_merge(array_values($f), [$id]));
        Audit::log($user, 'update', 'loan', $id, $f);
        return self::describe(Scope::find($user, 'loans', $id), substr(today(), 0, 7));
    }
}

final class Payments
{
    public static function list(array $user, int $loanId): array
    {
        Scope::find($user, 'loans', $loanId);
        return Db::all(
            'SELECT p.*, u.name AS member_name FROM loan_payments p JOIN users u ON u.id = p.user_id
             WHERE p.loan_id = ? AND p.deleted_at IS NULL ORDER BY p.paid_on DESC, p.id DESC',
            [$loanId]
        );
    }

    /**
     * Records a payment and moves the outstanding by its principal part only.
     *
     * With an explicit split (principal / interest / fee) the split is used
     * as given. With only a total:
     *   interest_only → all of it is interest; principal does not move.
     *   emi           → this month's interest at the loan's rate, rest principal.
     *                   Without a rate the split cannot be known, so it is refused.
     *   card          → all of it reduces the card balance.
     */
    public static function create(array $user, int $loanId, Input $in): array
    {
        $paidOn = $in->date('paid_on');
        $member = Scope::member($user, $in->raw('member_id'));
        $notes = $in->str('notes', 500, false, 'Notes');
        $split = $in->has('principal') || $in->has('interest') || $in->has('fee');
        $given = [$in->money('principal', false) ?? 0, $in->money('interest', false) ?? 0, $in->money('fee', false) ?? 0];
        $total = $split ? null : $in->money('amount');

        return Db::tx(function () use ($user, $loanId, $paidOn, $member, $notes, $split, $given, $total) {
            [$where, $params] = Scope::visible($user);
            $loan = Db::one("SELECT * FROM loans WHERE id = ? AND $where FOR UPDATE", array_merge([$loanId], $params));
            if ($loan === null) {
                throw new HttpError(404, 'Not found.');
            }
            $outstanding = (int) $loan['outstanding_paise'];
            if ($split) {
                [$principal, $interest, $fee] = $given;
            } else {
                $fee = 0;
                switch ($loan['repayment_type']) {
                    case 'interest_only':
                        [$principal, $interest] = [0, $total];
                        break;
                    case 'card':
                        [$principal, $interest] = [$total, 0];
                        break;
                    default:
                        if ($loan['interest_rate'] === null) {
                            throw new HttpError(422, 'Interest rate is not saved for this loan, so the app cannot split this payment. Enter principal and interest separately, or add the rate to the loan.');
                        }
                        $interest = min($total, Money::monthlyInterest($outstanding, (string) $loan['interest_rate']));
                        $principal = $total - $interest;
                }
            }
            if ($principal + $interest + $fee === 0) {
                throw new HttpError(422, 'Payment amount is zero.');
            }
            if ($principal > $outstanding) {
                throw new HttpError(422, 'Principal paid is more than the outstanding (₹' . number_format($outstanding / 100, 2) . ').');
            }
            $id = Db::insert(
                'INSERT INTO loan_payments (family_id, loan_id, user_id, paid_on, principal_paise, interest_paise, fee_paise, notes, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [$user['family_id'], $loanId, $member, $paidOn, $principal, $interest, $fee, $notes]
            );
            $left = $outstanding - $principal;
            $closes = $left === 0 && $loan['repayment_type'] !== 'card' && $loan['status'] === 'active';
            Db::run(
                'UPDATE loans SET outstanding_paise = ?, status = IF(?, \'closed\', status), closed_on = IF(?, ?, closed_on), updated_at = NOW() WHERE id = ?',
                [$left, $closes ? 1 : 0, $closes ? 1 : 0, $paidOn, $loanId]
            );
            Audit::log($user, 'create', 'loan_payment', $id, ['loan_id' => $loanId, 'principal_paise' => $principal, 'interest_paise' => $interest, 'fee_paise' => $fee]);
            return ['payment' => Db::one('SELECT * FROM loan_payments WHERE id = ?', [$id]), 'loan' => Loans::describe(Scope::find($user, 'loans', $loanId), substr(today(), 0, 7))];
        });
    }

    /** Soft-deletes a payment and puts its principal back on the loan. */
    public static function delete(array $user, int $id): array
    {
        return Db::tx(function () use ($user, $id) {
            $p = Db::one('SELECT * FROM loan_payments WHERE id = ? AND family_id = ? AND deleted_at IS NULL FOR UPDATE', [$id, $user['family_id']]);
            if ($p === null) {
                throw new HttpError(404, 'Not found.');
            }
            Scope::find($user, 'loans', (int) $p['loan_id']);
            Db::run('UPDATE loan_payments SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?', [$id]);
            Db::run(
                "UPDATE loans SET outstanding_paise = outstanding_paise + ?,
                 status = IF(status = 'closed' AND closed_on = ?, 'active', status),
                 closed_on = IF(status = 'active', NULL, closed_on), updated_at = NOW() WHERE id = ?",
                [$p['principal_paise'], $p['paid_on'], $p['loan_id']]
            );
            Audit::log($user, 'delete', 'loan_payment', $id, ['loan_id' => (int) $p['loan_id'], 'principal_paise' => (int) $p['principal_paise']]);
            return Loans::describe(Scope::find($user, 'loans', (int) $p['loan_id']), substr(today(), 0, 7));
        });
    }
}

final class Dashboard
{
    /**
     * One month at a glance. "Available" is the plan for the month:
     * family contributions + variable income received − expenses − scheduled
     * loan payments. Variable income is counted only once it has arrived.
     */
    public static function get(array $user, string $month): array
    {
        [$from, $to] = monthRange($month);
        $members = Db::all('SELECT id, name FROM users WHERE family_id = ? ORDER BY id', [$user['family_id']]);

        $contrib = Contributions::onDate($user, $to);
        $pool = array_sum($contrib);

        [$where, $params] = Scope::visible($user);
        $incomeRows = Db::all(
            "SELECT stability, income_type, user_id, SUM(amount_paise) AS total FROM income
             WHERE $where AND received_on BETWEEN ? AND ? GROUP BY stability, income_type, user_id",
            array_merge($params, [$from, $to])
        );
        $fixed = 0;
        $variable = 0;
        foreach ($incomeRows as $r) {
            $r['stability'] === 'fixed' ? $fixed += (int) $r['total'] : $variable += (int) $r['total'];
        }

        $byCategory = Db::all(
            "SELECT category, SUM(amount_paise) AS total, COUNT(*) AS n FROM expenses
             WHERE $where AND spent_on BETWEEN ? AND ? GROUP BY category ORDER BY total DESC",
            array_merge($params, [$from, $to])
        );
        $expenses = array_sum(array_map(fn ($r) => (int) $r['total'], $byCategory));

        $loans = Loans::list($user, $month);
        $scheduled = 0;
        $outstanding = 0;
        $interestOnlyMonthly = 0;
        foreach ($loans as $l) {
            $scheduled += $l['scheduled_paise'];
            if ($l['group'] !== 'closed') {
                $outstanding += (int) $l['outstanding_paise'];
                if ($l['repayment_type'] === 'interest_only' && $l['monthly_interest_paise'] !== null) {
                    $interestOnlyMonthly += $l['monthly_interest_paise'];
                }
            }
        }

        [$pWhere, $pParams] = Scope::visible($user, 'l');
        $paid = Db::all(
            "SELECT p.loan_id, SUM(p.principal_paise) AS principal, SUM(p.interest_paise) AS interest, SUM(p.fee_paise) AS fee
             FROM loan_payments p JOIN loans l ON l.id = p.loan_id
             WHERE $pWhere AND p.deleted_at IS NULL AND p.paid_on BETWEEN ? AND ? GROUP BY p.loan_id",
            array_merge($pParams, [$from, $to])
        );
        $paidByLoan = [];
        $paidTotals = ['principal' => 0, 'interest' => 0, 'fee' => 0];
        foreach ($paid as $p) {
            $paidByLoan[(int) $p['loan_id']] = true;
            foreach ($paidTotals as $k => $_) {
                $paidTotals[$k] += (int) $p[$k];
            }
        }

        $skips = LoanSkips::forMonth($user, $month);
        $upcoming = [];
        foreach ($loans as $l) {
            if ($l['group'] === 'closed' || $l['due_day'] === null || $l['scheduled_paise'] === 0) {
                continue;
            }
            $day = min((int) $l['due_day'], (int) (new DateTimeImmutable($from))->format('t'));
            $paidThis = isset($paidByLoan[(int) $l['id']]);
            $upcoming[] = [
                'loan_id' => (int) $l['id'],
                'name' => $l['name'],
                'due_on' => sprintf('%s-%02d', $month, $day),
                'amount_paise' => $l['scheduled_paise'],
                'paid' => $paidThis,
                'missed' => !$paidThis && isset($skips[(int) $l['id']]),
            ];
        }
        usort($upcoming, fn ($a, $b) => [$a['paid'], !$a['missed'], $a['due_on']] <=> [$b['paid'], !$b['missed'], $b['due_on']]);

        $budgets = Budgets::onDate($user, $to);
        $available = $pool + $variable - $expenses - $scheduled;
        $goals = Goals::summary($user, $from, $to);
        return [
            'saved_to_goals_paise' => $goals['saved_to_goals_paise'],
            'free_after_goals_paise' => $available - $goals['saved_to_goals_paise'],
            'emergency' => $goals['emergency'],
            'month' => $month,
            'members' => array_map(fn ($m) => $m + ['contribution_paise' => $contrib[(int) $m['id']] ?? null], $members),
            'contribution_pool_paise' => $pool,
            'contributions_missing' => count($contrib) < count($members),
            'fixed_income_paise' => $fixed,
            'variable_income_paise' => $variable,
            'expenses_paise' => $expenses,
            'expenses_by_category' => array_map(fn ($r) => ['category' => $r['category'], 'total_paise' => (int) $r['total'], 'count' => (int) $r['n'], 'budget_paise' => $budgets[$r['category']] ?? null], $byCategory),
            'scheduled_debt_paise' => $scheduled,
            'available_paise' => $available,
            'outstanding_debt_paise' => $outstanding,
            'interest_only_monthly_paise' => $interestOnlyMonthly,
            'paid_this_month' => $paidTotals,
            'upcoming' => $upcoming,
            'loans' => $loans,
        ];
    }
}
