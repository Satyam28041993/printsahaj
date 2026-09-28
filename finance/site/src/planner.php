<?php
/**
 * Planning engine: month-by-month payoff projections and the refinance check.
 *
 * Pure arithmetic on whole paise. It reads loans but never writes anything,
 * so a plan can be tried as often as wanted without touching real data.
 *
 * Unknown numbers are not guessed:
 *  - An EMI loan without a rate but with "months left" is projected as its
 *    fixed schedule (payments until it ends); its interest is unknown, so it
 *    is not counted in interest totals and is never chosen for extra money.
 *  - An EMI loan with neither rate nor months left cannot be projected and is
 *    listed as left out.
 */

declare(strict_types=1);

final class Planner
{
    private const HORIZON_MONTHS = 480;

    /** Active loans, prepared for projection from the month after this one. */
    public static function prepare(array $user, string $startMonth): array
    {
        $loans = [];
        $left_out = [];
        foreach (Loans::list($user, $startMonth) as $l) {
            if ($l['group'] === 'closed' || (int) $l['outstanding_paise'] === 0) {
                continue;
            }
            $units = $l['interest_rate'] !== null ? Money::rateUnits((string) $l['interest_rate']) : null;
            $type = $l['repayment_type'];
            $pay = $type === 'card' ? (int) ($l['min_due_paise'] ?? 0) : ($l['monthly_payment_paise'] !== null ? (int) $l['monthly_payment_paise'] : null);
            if ($type === 'emi' && $units === null && $l['remaining_now'] === null) {
                $left_out[] = ['id' => (int) $l['id'], 'name' => $l['name'], 'reason' => 'Needs the interest rate or the months left.'];
                continue;
            }
            if ($type !== 'card' && $pay === null) {
                $left_out[] = ['id' => (int) $l['id'], 'name' => $l['name'], 'reason' => 'Needs the monthly payment.'];
                continue;
            }
            $loans[] = [
                'id' => (int) $l['id'],
                'name' => $l['name'],
                'loan_type' => $l['loan_type'],
                'type' => $type,
                'units' => $units,
                'balance' => (int) $l['outstanding_paise'],
                'pay' => $pay,
                'remaining' => $l['remaining_now'],
                'approx' => $units === null,
            ];
        }
        return [$loans, $left_out];
    }

    /**
     * Runs one strategy.
     *
     *   none      — today's payments only; no extra money, nothing rolls over.
     *   avalanche — extra money to the highest interest rate first.
     *   snowball  — extra money to the smallest balance first.
     *   custom    — extra money in the given loan order, then by rate.
     *
     * For every strategy except "none", the month-one payment total stays the
     * monthly budget (plus the extra): when a loan ends, its payment moves to
     * the next target instead of being spent.
     *
     * @param array<string,int> $lumps month => paise
     */
    public static function simulate(array $loans, string $start, int $extra, array $lumps, string $strategy, array $order = []): array
    {
        $open = [];
        $done = [];
        foreach ($loans as $l) {
            $open[$l['id']] = $l + ['closed' => null, 'interest' => 0];
        }
        $budget = null;
        $totalInterest = 0;
        $leftover = 0;
        $timeline = [];
        $debtFree = null;
        $warnings = [];

        for ($m = 0; $m < self::HORIZON_MONTHS && $open; $m++) {
            $month = addMonths($start, $m);
            $required = 0;
            foreach ($open as $id => &$l) {
                [$pay, $interest] = self::monthlyPayment($l);
                $required += $pay;
                $l['interest'] += $interest ?? 0;
                $totalInterest += $interest ?? 0;
            }
            unset($l);

            $budget ??= $required + $extra;
            $pool = $strategy === 'none' ? 0 : max(0, $budget + ($lumps[$month] ?? 0) - $required);
            $poolStart = $pool;
            if ($pool > 0) {
                foreach (self::targets($open, $strategy, $order) as $id) {
                    $amount = min($pool, $open[$id]['balance']);
                    $open[$id]['balance'] -= $amount;
                    $pool -= $amount;
                    if ($pool === 0) {
                        break;
                    }
                }
            }
            $leftover += $pool;
            $paidThisMonth = $required + $poolStart - $pool;

            $outstanding = 0;
            $ended = [];
            foreach ($open as $id => $l) {
                if ($l['balance'] <= 0 || ($l['type'] === 'emi' && $l['units'] === null && $l['remaining'] !== null && $l['remaining'] <= 0)) {
                    $l['closed'] = $month;
                    $done[$id] = $l;
                    $ended[] = $l['name'];
                    unset($open[$id]);
                    continue;
                }
                $outstanding += $l['balance'];
            }
            $timeline[] = ['month' => $month, 'outstanding_paise' => $outstanding, 'payments_paise' => $paidThisMonth, 'ended' => $ended];
            if (!$open) {
                $debtFree = $month;
            }
        }
        foreach ($open as $id => $l) {
            $done[$id] = $l;
            if ($l['type'] === 'interest_only' && $strategy === 'none') {
                $warnings['io'] = 'Interest-only loans never end on today\'s payments alone.';
            }
        }

        $result = [];
        $goldOpen = false;
        $goldClosed = null;
        foreach ($loans as $l) {
            $d = $done[$l['id']] ?? null;
            $result[] = ['id' => $l['id'], 'name' => $l['name'], 'close_month' => $d['closed'] ?? null, 'interest_paise' => $l['units'] === null && $l['type'] !== 'interest_only' ? null : ($d['interest'] ?? 0), 'approx' => $l['approx']];
            if ($l['loan_type'] === 'gold') {
                if (($d['closed'] ?? null) === null) {
                    $goldOpen = true;
                } elseif ($goldClosed === null || $d['closed'] > $goldClosed) {
                    $goldClosed = $d['closed'];
                }
            }
        }

        return [
            'strategy' => $strategy,
            'debt_free_month' => $debtFree,
            'gold_closed_month' => $goldOpen ? null : $goldClosed,
            'total_interest_paise' => $totalInterest,
            'monthly_budget_paise' => $budget ?? 0,
            'unused_paise' => $leftover,
            'loans' => $result,
            'timeline' => $timeline,
            'warnings' => array_values($warnings),
        ];
    }

    /** This month's required payment for one loan; moves its balance. Returns [paid, interest or null]. */
    private static function monthlyPayment(array &$l): array
    {
        $bal = $l['balance'];
        switch ($l['type']) {
            case 'interest_only':
                $interest = $l['units'] !== null ? Money::monthlyInterest($bal, self::rateString($l['units'])) : $l['pay'];
                return [$interest, $interest];

            case 'card':
                if ($l['units'] === null) {
                    $pay = min($l['pay'], $bal);
                    $l['balance'] = $bal - $pay;
                    return [$pay, null];
                }
                $interest = Money::monthlyInterest($bal, self::rateString($l['units']));
                $pay = min($l['pay'], $bal + $interest);
                $l['balance'] = $bal + $interest - $pay;
                return [$pay, min($interest, $pay)];

            default: // emi
                if ($l['units'] === null) {
                    // Fixed schedule; the split is unknown, so the balance falls evenly to zero.
                    $left = max(1, (int) $l['remaining']);
                    $l['balance'] = $left === 1 ? 0 : $bal - intdiv($bal, $left);
                    $l['remaining'] = $left - 1;
                    return [$l['pay'], null];
                }
                $interest = Money::monthlyInterest($bal, self::rateString($l['units']));
                $pay = min($l['pay'], $bal + $interest);
                $l['balance'] = $bal + $interest - $pay;
                return [$pay, min($interest, $pay)];
        }
    }

    /** Loans that may take extra money, in the order the strategy wants. */
    private static function targets(array $open, string $strategy, array $order): array
    {
        $eligible = array_filter($open, fn ($l) => $l['balance'] > 0 && !($l['type'] === 'emi' && $l['units'] === null));
        uasort($eligible, match ($strategy) {
            'snowball' => fn ($a, $b) => [$a['balance'], $a['id']] <=> [$b['balance'], $b['id']],
            default => fn ($a, $b) => [$b['units'] ?? -1, $a['balance']] <=> [$a['units'] ?? -1, $b['balance']],
        });
        $ids = array_keys($eligible);
        if ($strategy === 'custom' && $order) {
            $first = array_values(array_filter($order, fn ($id) => isset($eligible[$id])));
            $ids = array_merge($first, array_values(array_diff($ids, $first)));
        }
        return $ids;
    }

    private static function rateString(int $units): string
    {
        return intdiv($units, 10000) . '.' . str_pad((string) ($units % 10000), 4, '0', STR_PAD_LEFT);
    }

    /** Smallest whole-paisa EMI that clears $principal in $months at $rate. */
    public static function emi(int $principal, string $rate, int $months): int
    {
        $lo = 1;
        $hi = $principal + Money::monthlyInterest($principal, $rate);
        while ($lo < $hi) {
            $mid = intdiv($lo + $hi, 2);
            if (self::clears($principal, $rate, $mid, $months)) {
                $hi = $mid;
            } else {
                $lo = $mid + 1;
            }
        }
        return $lo;
    }

    private static function clears(int $principal, string $rate, int $emi, int $months): bool
    {
        $bal = $principal;
        for ($i = 0; $i < $months; $i++) {
            $bal += Money::monthlyInterest($bal, $rate) - $emi;
            if ($bal <= 0) {
                return true;
            }
        }
        return false;
    }

    /** Pays $monthly into loans until cleared: interest first, then principal to the highest rate. */
    private static function payDown(array $loans, int $monthly, int $maxMonths): array
    {
        $interestTotal = 0;
        for ($m = 1; $m <= $maxMonths; $m++) {
            $pool = $monthly;
            foreach ($loans as &$l) {
                $i = Money::monthlyInterest($l['balance'], $l['rate']);
                $interestTotal += min($i, $pool);
                $l['balance'] += max(0, $i - $pool);
                $pool = max(0, $pool - $i);
            }
            unset($l);
            usort($loans, fn ($a, $b) => Money::rateUnits($b['rate']) <=> Money::rateUnits($a['rate']));
            foreach ($loans as &$l) {
                $take = min($pool, $l['balance']);
                $l['balance'] -= $take;
                $pool -= $take;
            }
            unset($l);
            if (array_sum(array_column($loans, 'balance')) === 0) {
                return ['months' => $m, 'interest_paise' => $interestTotal];
            }
        }
        return ['months' => null, 'interest_paise' => $interestTotal];
    }

    /**
     * Keep the selected loans vs replace them with a new loan, both on the
     * user's own numbers. The fair comparison pays the SAME monthly amount
     * (the new EMI) into the existing loans as a principal prepayment.
     */
    public static function refinance(array $user, Input $in): array
    {
        $ids = $in->raw('loan_ids');
        if (!is_array($ids) || !$ids) {
            throw new HttpError(422, 'Choose at least one loan to close.');
        }
        $current = [];
        foreach ($ids as $id) {
            $l = Scope::find($user, 'loans', (int) $id);
            if ($l['status'] !== 'active' || (int) $l['outstanding_paise'] === 0) {
                throw new HttpError(422, "{$l['name']} is not active.");
            }
            if ($l['interest_rate'] === null) {
                throw new HttpError(422, "Add the interest rate for {$l['name']} first.");
            }
            $current[] = ['name' => $l['name'], 'balance' => (int) $l['outstanding_paise'], 'rate' => (string) $l['interest_rate'], 'type' => $l['repayment_type'], 'pay' => (int) ($l['monthly_payment_paise'] ?? 0)];
        }
        $closing = array_sum(array_column($current, 'balance'));
        $rate = Money::parseRate($in->raw('new_rate'));
        if ($rate === null) {
            throw new HttpError(422, 'Enter the interest rate the bank offered.');
        }
        $months = $in->int('tenure_months', 1, 120);
        $amount = $in->money('new_amount', false) ?? $closing;
        $processing = $in->money('processing_fee', false) ?? 0;
        $foreclosure = $in->money('foreclosure_charges', false) ?? 0;
        $other = $in->money('other_charges', false) ?? 0;
        if ($amount < $closing) {
            throw new HttpError(422, 'The new loan is smaller than what it has to close (' . self::rupees($closing) . ').');
        }

        $emi = self::emi($amount, $rate, $months);
        $newInterest = self::payDown([['balance' => $amount, 'rate' => $rate]], $emi, $months)['interest_paise'];
        $newCost = $newInterest + $processing + $foreclosure + $other;

        $currentMonthly = 0;
        foreach ($current as $c) {
            $currentMonthly += $c['type'] === 'interest_only' ? Money::monthlyInterest($c['balance'], $c['rate']) : $c['pay'];
        }
        $same = self::payDown(array_map(fn ($c) => ['balance' => $c['balance'], 'rate' => $c['rate']], $current), $emi, self::HORIZON_MONTHS);
        $keepInterest = 0;
        foreach ($current as $c) {
            $keepInterest += Money::monthlyInterest($c['balance'], $c['rate']) * $months;
        }

        return [
            'closing_paise' => $closing,
            'current' => [
                'monthly_paise' => $currentMonthly,
                'interest_only_for_tenure_paise' => $keepInterest,
                'still_owed_after_tenure_paise' => $closing,
            ],
            'same_payment_on_current' => [
                'monthly_paise' => $emi,
                'months' => $same['months'],
                'interest_paise' => $same['interest_paise'],
                'total_cost_paise' => $same['interest_paise'],
            ],
            'new_loan' => [
                'amount_paise' => $amount,
                'rate' => $rate,
                'months' => $months,
                'emi_paise' => $emi,
                'interest_paise' => $newInterest,
                'charges_paise' => $processing + $foreclosure + $other,
                'total_cost_paise' => $newCost,
                'cash_in_hand_paise' => $amount - $closing - $processing,
            ],
            'difference_paise' => $newCost - $same['interest_paise'],
            'monthly_change_paise' => $emi - $currentMonthly,
        ];
    }

    private static function rupees(int $paise): string
    {
        return '₹' . number_format(intdiv($paise, 100));
    }

    /** POST plan/simulate: runs "none" plus each requested strategy on the same inputs. */
    public static function run(array $user, Input $in): array
    {
        $start = addMonths(substr(today(), 0, 7), 1);
        [$loans, $leftOut] = self::prepare($user, $start);
        $extra = $in->money('extra_monthly', false) ?? 0;

        $lumps = [];
        $raw = $in->raw('lumps');
        foreach (is_array($raw) ? array_slice($raw, 0, 12) : [] as $lump) {
            $li = new Input(is_array($lump) ? $lump : []);
            $amount = $li->money('amount');
            $first = (string) $li->raw('month');
            monthRange($first);
            $every = $li->int('every_months', 0, 24, false) ?? 0;
            $count = $li->int('times', 1, 40, false) ?? 1;
            for ($k = 0; $k < ($every > 0 ? $count : 1); $k++) {
                $month = addMonths($first, $k * $every);
                $lumps[$month] = ($lumps[$month] ?? 0) + $amount;
            }
        }
        $order = array_map('intval', is_array($in->raw('order')) ? $in->raw('order') : []);
        $strategies = ['none', 'avalanche', 'snowball'];
        if ($order) {
            $strategies[] = 'custom';
        }
        $plans = [];
        foreach ($strategies as $s) {
            $plans[$s] = self::simulate($loans, $start, $extra, $lumps, $s, $order);
        }
        return [
            'start_month' => $start,
            'extra_monthly_paise' => $extra,
            'lumps' => $lumps,
            'loans' => array_map(fn ($l) => ['id' => $l['id'], 'name' => $l['name'], 'balance_paise' => $l['balance'], 'rate' => $l['units'] === null ? null : self::rateString($l['units']), 'approx' => $l['approx']], $loans),
            'left_out' => $leftOut,
            'plans' => $plans,
        ];
    }
}
