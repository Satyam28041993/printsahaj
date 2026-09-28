<?php
/**
 * Budget vs actual, week-by-week spending, and a 6-month trend. Read-only —
 * nothing here writes data.
 */

declare(strict_types=1);

final class Reports
{
    public static function monthly(array $user, string $month): array
    {
        [$from, $to] = monthRange($month);
        [$where, $params] = Scope::visible($user, 'e');

        $spent = [];
        foreach (Db::all(
            "SELECT category, SUM(amount_paise) AS total, COUNT(*) AS n FROM expenses e
             WHERE $where AND spent_on BETWEEN ? AND ? GROUP BY category",
            array_merge($params, [$from, $to])
        ) as $r) {
            $spent[$r['category']] = ['total' => (int) $r['total'], 'n' => (int) $r['n']];
        }
        $budgets = Budgets::onDate($user, $to);

        $categories = [];
        foreach (array_unique(array_merge(array_keys($spent), array_keys($budgets))) as $cat) {
            $budget = $budgets[$cat] ?? null;
            $actual = $spent[$cat]['total'] ?? 0;
            $diff = $budget === null ? null : $actual - $budget;
            $categories[] = [
                'category' => $cat,
                'budget_paise' => $budget,
                'actual_paise' => $actual,
                'entries' => $spent[$cat]['n'] ?? 0,
                'diff_paise' => $diff,
                'diff_pct' => $budget !== null && $budget > 0 ? (int) round(($actual - $budget) / $budget * 100) : null,
                'status' => $budget === null ? 'no_budget' : ($actual > $budget ? 'over' : 'under'),
            ];
        }
        usort($categories, fn ($a, $b) => $b['actual_paise'] <=> $a['actual_paise']);

        $weekly = array_map(fn ($r) => ['week' => (int) $r['w'], 'spent_paise' => (int) $r['total'], 'entries' => (int) $r['n']], Db::all(
            "SELECT CEIL(DAY(spent_on) / 7) AS w, SUM(amount_paise) AS total, COUNT(*) AS n FROM expenses e
             WHERE $where AND spent_on BETWEEN ? AND ? GROUP BY w ORDER BY w",
            array_merge($params, [$from, $to])
        ));

        $budgetTotal = array_sum($budgets);
        $actualTotal = array_sum($spent ? array_column($spent, 'total') : []);

        return [
            'month' => $month,
            'budget_total_paise' => $budgetTotal,
            'actual_total_paise' => $actualTotal,
            'categories' => $categories,
            'weekly' => $weekly,
            'trend' => self::trend($user, $month),
        ];
    }

    /** Spending, income and recorded loan payments for this month and the 5 before it. */
    private static function trend(array $user, string $month): array
    {
        $start = addMonths($month, -5);
        [$from] = monthRange($start);
        [, $to] = monthRange($month);

        [$eWhere, $eParams] = Scope::visible($user, 'e');
        $spent = self::byMonth(Db::all(
            "SELECT DATE_FORMAT(spent_on, '%Y-%m') AS m, SUM(amount_paise) AS total FROM expenses e
             WHERE $eWhere AND spent_on BETWEEN ? AND ? GROUP BY m",
            array_merge($eParams, [$from, $to])
        ));
        [$iWhere, $iParams] = Scope::visible($user, 'i');
        $income = self::byMonth(Db::all(
            "SELECT DATE_FORMAT(received_on, '%Y-%m') AS m, SUM(amount_paise) AS total FROM income i
             WHERE $iWhere AND received_on BETWEEN ? AND ? GROUP BY m",
            array_merge($iParams, [$from, $to])
        ));
        [$pWhere, $pParams] = Scope::visible($user, 'l');
        $loanPaid = self::byMonth(Db::all(
            "SELECT DATE_FORMAT(p.paid_on, '%Y-%m') AS m, SUM(p.principal_paise + p.interest_paise + p.fee_paise) AS total
             FROM loan_payments p JOIN loans l ON l.id = p.loan_id
             WHERE $pWhere AND p.deleted_at IS NULL AND p.paid_on BETWEEN ? AND ? GROUP BY m",
            array_merge($pParams, [$from, $to])
        ));

        $months = [];
        for ($i = 0; $i < 6; $i++) {
            $m = addMonths($start, $i);
            $months[] = ['month' => $m, 'spent_paise' => $spent[$m] ?? 0, 'income_paise' => $income[$m] ?? 0, 'loan_paid_paise' => $loanPaid[$m] ?? 0];
        }
        return $months;
    }

    private static function byMonth(array $rows): array
    {
        $out = [];
        foreach ($rows as $r) {
            $out[$r['m']] = (int) $r['total'];
        }
        return $out;
    }
}
