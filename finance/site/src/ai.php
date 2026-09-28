<?php
/**
 * AI Finance assistant on Google Gemini — the same API, models and fallback
 * order as the PrintVerify engine (tools/artwork-verification/.../vision.py).
 *
 * The rule: the engine calculates, the AI explains.
 *  - The AI gets numbers the engine already worked out, never raw rows.
 *  - For a new "what if", it can only call read-only engine tools
 *    (payoff plan, refinance check, month-by-month outlook).
 *  - It has no way to write, change or delete anything.
 *  - Notes, usernames and people's names are not sent; members travel as
 *    "Person 1", "Person 2" and are put back into the answer here.
 *  - The key lives only in the server config; nothing is logged.
 */

declare(strict_types=1);

final class Ai
{
    private const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta';
    private const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
    private const DAILY_LIMIT = 40;
    private const MAX_TOOL_ROUNDS = 3;
    private const TIMEOUT = 40;

    public static function enabled(): bool
    {
        return trim((string) (Config::get()['gemini_api_key'] ?? '')) !== '';
    }

    public static function history(array $user): array
    {
        $rows = Db::all(
            'SELECT id, question, answer_json, created_at FROM ai_messages WHERE user_id = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 20',
            [$user['id']]
        );
        return array_map(fn ($r) => ['id' => (int) $r['id'], 'question' => $r['question'], 'answer' => json_decode($r['answer_json'], true), 'created_at' => $r['created_at']], $rows);
    }

    public static function ask(array $user, Input $in): array
    {
        if (!self::enabled()) {
            throw new HttpError(503, 'AI is not switched on yet. Add gemini_api_key to finance-config.php on the server.');
        }
        $question = $in->str('question', 1000, true, 'Question');
        $used = Db::one('SELECT COUNT(*) AS n FROM ai_messages WHERE user_id = ? AND created_at >= CURDATE()', [$user['id']]);
        if ((int) $used['n'] >= self::DAILY_LIMIT) {
            throw new HttpError(429, 'Daily AI limit reached. Try again tomorrow.');
        }
        @set_time_limit(150);

        [$people, $toLabel] = self::people($user);
        $context = self::context($user, $people);
        $asked = self::mask($question, $toLabel);

        $contents = [[
            'role' => 'user',
            'parts' => [['text' => "FAMILY FINANCE DATA (calculated by the app, amounts in rupees):\n"
                . json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                . "\n\nQUESTION:\n" . $asked]],
        ]];
        $toolsUsed = [];
        $model = null;
        for ($round = 0; $round <= self::MAX_TOOL_ROUNDS; $round++) {
            [$reply, $model] = self::call($model, [
                'systemInstruction' => ['parts' => [['text' => self::SYSTEM]]],
                'contents' => $contents,
                'tools' => [['functionDeclarations' => self::TOOLS]],
                'generationConfig' => ['temperature' => 0.2],
            ]);
            $content = $reply['candidates'][0]['content'] ?? null;
            $calls = array_values(array_filter($content['parts'] ?? [], fn ($p) => isset($p['functionCall'])));
            if (!$calls || $round === self::MAX_TOOL_ROUNDS) {
                if ($content) {
                    $contents[] = $content;
                }
                break;
            }
            $contents[] = $content;
            $responses = [];
            foreach ($calls as $c) {
                $name = (string) ($c['functionCall']['name'] ?? '');
                $args = is_array($c['functionCall']['args'] ?? null) ? $c['functionCall']['args'] : [];
                $toolsUsed[] = $name;
                $responses[] = ['functionResponse' => ['name' => $name, 'response' => ['result' => self::runTool($user, $name, $args)]]];
            }
            $contents[] = ['role' => 'user', 'parts' => $responses];
        }

        // Final pass: the same conversation, written up in the fixed shape.
        $contents[] = ['role' => 'user', 'parts' => [['text' => self::FINAL]]];
        [$reply, $model] = self::call($model, [
            'systemInstruction' => ['parts' => [['text' => self::SYSTEM]]],
            'contents' => $contents,
            'generationConfig' => ['temperature' => 0.2, 'responseMimeType' => 'application/json', 'responseSchema' => self::SCHEMA],
        ]);
        $text = '';
        foreach ($reply['candidates'][0]['content']['parts'] ?? [] as $p) {
            $text .= $p['text'] ?? '';
        }
        $answer = json_decode($text, true);
        if (!is_array($answer)) {
            throw new HttpError(502, 'The AI answer could not be read. Please ask again.');
        }
        $answer = self::clean($answer, $people);

        $id = Db::insert(
            'INSERT INTO ai_messages (family_id, user_id, question, answer_json, model, tools_used, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [$user['family_id'], $user['id'], $question, json_encode($answer, JSON_UNESCAPED_UNICODE), (string) $model, implode(',', array_unique($toolsUsed))]
        );
        return ['id' => $id, 'question' => $question, 'answer' => $answer, 'tools_used' => array_values(array_unique($toolsUsed))];
    }

    // ---------- people, masking ----------

    /** [label => real name], [real name => label]. */
    private static function people(array $user): array
    {
        $people = [];
        $toLabel = [];
        foreach (Db::all('SELECT id, name FROM users WHERE family_id = ? ORDER BY id', [$user['family_id']]) as $i => $m) {
            $label = 'Person ' . ($i + 1);
            $people[(int) $m['id']] = ['label' => $label, 'name' => $m['name'], 'is_asker' => (int) $m['id'] === (int) $user['id']];
            $toLabel[$m['name']] = $label;
        }
        return [$people, $toLabel];
    }

    private static function mask(string $text, array $toLabel): string
    {
        foreach ($toLabel as $name => $label) {
            if (mb_strlen($name) >= 2) {
                $text = preg_replace('/\b' . preg_quote($name, '/') . '\b/iu', $label, $text) ?? $text;
            }
        }
        return $text;
    }

    /** Keeps only the four lists and the short answer, as plain strings, with names put back. */
    private static function clean(array $answer, array $people): array
    {
        $unmask = function (string $s) use ($people): string {
            foreach ($people as $p) {
                $s = str_replace($p['label'], $p['name'], $s);
            }
            return mb_substr(trim($s), 0, 800);
        };
        $out = ['short_answer' => $unmask((string) ($answer['short_answer'] ?? ''))];
        foreach (['facts', 'assumptions', 'estimates', 'suggestions'] as $k) {
            $items = is_array($answer[$k] ?? null) ? $answer[$k] : [];
            $out[$k] = array_values(array_filter(array_map(fn ($x) => $unmask(is_scalar($x) ? (string) $x : ''), array_slice($items, 0, 8))));
        }
        return $out;
    }

    // ---------- the data the AI sees ----------

    private static function rs(?int $paise): ?int
    {
        return $paise === null ? null : intdiv($paise + ($paise >= 0 ? 50 : -50), 100);
    }

    private static function context(array $user, array $people): array
    {
        $month = substr(today(), 0, 7);
        $d = Dashboard::get($user, $month);
        $person = fn ($id) => $people[(int) $id]['label'] ?? 'Someone';

        // Last six months of income and spending, from recorded entries.
        [$where, $params] = Scope::visible($user);
        $from = addMonths($month, -5) . '-01';
        $history = [];
        foreach (Db::all("SELECT DATE_FORMAT(received_on, '%Y-%m') AS m, stability, SUM(amount_paise) AS t FROM income WHERE $where AND received_on >= ? GROUP BY m, stability", array_merge($params, [$from])) as $r) {
            $history[$r['m']]['income_' . $r['stability']] = self::rs((int) $r['t']);
        }
        foreach (Db::all("SELECT DATE_FORMAT(spent_on, '%Y-%m') AS m, SUM(amount_paise) AS t FROM expenses WHERE $where AND spent_on >= ? GROUP BY m", array_merge($params, [$from])) as $r) {
            $history[$r['m']]['spent'] = self::rs((int) $r['t']);
        }
        ksort($history);

        $start = addMonths($month, 1);
        [$loans] = Planner::prepare($user, $start);
        $plans = [];
        foreach (['none', 'avalanche'] as $s) {
            $plans[$s] = self::planSummary(Planner::simulate($loans, $start, 0, [], $s));
        }

        return [
            'today' => today(),
            'asker' => $people[(int) $user['id']]['label'],
            'people' => array_values(array_map(fn ($p) => $p['label'], $people)),
            'this_month' => [
                'month' => $month,
                'family_pool_contributions' => array_map(fn ($m) => ['person' => $person($m['id']), 'monthly' => self::rs($m['contribution_paise'])], $d['members']),
                'family_pool_total' => self::rs($d['contribution_pool_paise']),
                'fixed_income_received' => self::rs($d['fixed_income_paise']),
                'variable_income_received' => self::rs($d['variable_income_paise']),
                'spent' => self::rs($d['expenses_paise']),
                'spent_by_category' => array_map(fn ($c) => ['category' => $c['category'], 'amount' => self::rs($c['total_paise'])], $d['expenses_by_category']),
                'scheduled_loan_payments' => self::rs($d['scheduled_debt_paise']),
                'left_after_loans' => self::rs($d['available_paise']),
                'put_into_goals' => self::rs($d['saved_to_goals_paise']),
                'still_free' => self::rs($d['free_after_goals_paise']),
                'formula' => 'left_after_loans = family_pool_total + variable_income_received - spent - scheduled_loan_payments',
            ],
            'last_six_months_recorded' => $history,
            'loans' => array_map(fn ($l) => [
                'name' => mb_substr($l['name'], 0, 40),
                'type' => $l['loan_type'],
                'repayment' => $l['repayment_type'],
                'borrower' => $person($l['user_id']),
                'outstanding' => self::rs((int) $l['outstanding_paise']),
                'interest_rate_percent' => $l['interest_rate'] !== null ? (float) $l['interest_rate'] : null,
                'monthly_payment' => self::rs($l['repayment_type'] === 'card' ? $l['min_due_paise'] : $l['monthly_payment_paise']),
                'monthly_interest_now' => self::rs($l['monthly_interest_paise']),
                'months_left' => $l['remaining_now'],
                'ends' => $l['projected_close'],
                'status' => $l['group'] === 'closed' ? 'paid off' : 'active',
                'flags' => $l['flags'],
            ], $d['loans']),
            'goals' => array_map(fn ($g) => [
                'name' => mb_substr($g['name'], 0, 40),
                'kind' => $g['kind'],
                'saved' => self::rs($g['current_paise']),
                'target' => self::rs($g['target_now_paise']),
                'lower_target' => self::rs($g['target_min_paise'] !== null ? (int) $g['target_min_paise'] : null),
                'monthly' => self::rs($g['monthly_paise'] !== null ? (int) $g['monthly_paise'] : null),
                'target_date' => $g['target_date'],
                'expected' => $g['projected_month'],
                'state' => $g['state'],
            ], Goals::list($user)),
            'payoff_projection_no_extra' => $plans,
            'rules' => [
                'Interest-only (gold) payments never reduce the principal; only principal payments do.',
                'A credit card minimum due is not full repayment.',
                'Variable income (incentive, commission, CRM) is not guaranteed; it counts only once received.',
                'The emergency fund and other goals must not be used for loan plans unless the family decides so.',
                'Loans with a null rate have unknown interest; their interest is not counted.',
            ],
        ];
    }

    private static function planSummary(array $p): array
    {
        return [
            'gold_loans_closed' => $p['gold_closed_month'],
            'all_loans_done' => $p['debt_free_month'],
            'total_interest_known_loans' => self::rs($p['total_interest_paise']),
            'monthly_loan_budget' => self::rs($p['monthly_budget_paise']),
            'each_loan_ends' => array_column($p['loans'], 'close_month', 'name'),
        ];
    }

    // ---------- tools (read-only engine calls) ----------

    private const TOOLS = [
        [
            'name' => 'run_payoff_plan',
            'description' => 'Runs the app\'s deterministic loan payoff projection for a what-if. Extra money and expected lump sums (incentive, CRM income) go to loans; freed EMIs roll over. Returns results for today\'s payments, costliest-first, smallest-first, and (if given) one loan first. Changes no data.',
            'parameters' => [
                'type' => 'OBJECT',
                'properties' => [
                    'extra_monthly_rupees' => ['type' => 'INTEGER', 'description' => 'Extra paid to loans every month, on top of today\'s payments. 0 if none.'],
                    'lumps' => [
                        'type' => 'ARRAY',
                        'description' => 'Expected one-time or repeating extra money.',
                        'items' => [
                            'type' => 'OBJECT',
                            'properties' => [
                                'amount_rupees' => ['type' => 'INTEGER'],
                                'first_month' => ['type' => 'STRING', 'description' => 'YYYY-MM'],
                                'every_months' => ['type' => 'INTEGER', 'description' => '0 for once'],
                                'times' => ['type' => 'INTEGER'],
                            ],
                            'required' => ['amount_rupees', 'first_month'],
                        ],
                    ],
                    'clear_first_loan' => ['type' => 'STRING', 'description' => 'Exact loan name to put extra money into first. Optional.'],
                ],
            ],
        ],
        [
            'name' => 'compare_refinance',
            'description' => 'Compares closing existing loans with a new loan (for example a personal loan to close gold loans) against paying the same EMI into the current loans. Uses only the terms given. Changes no data.',
            'parameters' => [
                'type' => 'OBJECT',
                'properties' => [
                    'loan_names' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING'], 'description' => 'Exact names of the loans to close.'],
                    'new_rate_percent' => ['type' => 'NUMBER'],
                    'tenure_months' => ['type' => 'INTEGER'],
                    'processing_fee_rupees' => ['type' => 'INTEGER'],
                    'foreclosure_charges_rupees' => ['type' => 'INTEGER'],
                    'other_charges_rupees' => ['type' => 'INTEGER'],
                ],
                'required' => ['loan_names', 'new_rate_percent', 'tenure_months'],
            ],
        ],
        [
            'name' => 'month_by_month_outlook',
            'description' => 'Next N months on today\'s loan payments: loan payments due each month, which loans end, the family pool, average recorded spending, and an estimated free amount. Changes no data.',
            'parameters' => [
                'type' => 'OBJECT',
                'properties' => ['months' => ['type' => 'INTEGER', 'description' => '1 to 24']],
                'required' => ['months'],
            ],
        ],
    ];

    private static function runTool(array $user, string $name, array $args): array
    {
        try {
            $loanIdByName = [];
            foreach (Loans::list($user) as $l) {
                $loanIdByName[mb_strtolower(trim($l['name']))] = (int) $l['id'];
            }
            switch ($name) {
                case 'run_payoff_plan':
                    $lumps = [];
                    foreach (array_slice(is_array($args['lumps'] ?? null) ? $args['lumps'] : [], 0, 12) as $lump) {
                        $lumps[] = [
                            'amount' => (string) max(0, (int) ($lump['amount_rupees'] ?? 0)),
                            'month' => (string) ($lump['first_month'] ?? ''),
                            'every_months' => (string) max(0, min(24, (int) ($lump['every_months'] ?? 0))),
                            'times' => (string) max(1, min(40, (int) ($lump['times'] ?? 1))),
                        ];
                    }
                    $first = mb_strtolower(trim((string) ($args['clear_first_loan'] ?? '')));
                    $r = Planner::run($user, new Input([
                        'extra_monthly' => (string) max(0, (int) ($args['extra_monthly_rupees'] ?? 0)),
                        'lumps' => $lumps,
                        'order' => $first !== '' && isset($loanIdByName[$first]) ? [$loanIdByName[$first]] : [],
                    ]));
                    return [
                        'start_month' => $r['start_month'],
                        'left_out' => $r['left_out'],
                        'plans' => array_map(fn ($p) => self::planSummary($p), $r['plans']),
                    ];

                case 'compare_refinance':
                    $ids = [];
                    foreach (is_array($args['loan_names'] ?? null) ? $args['loan_names'] : [] as $n) {
                        $key = mb_strtolower(trim((string) $n));
                        if (!isset($loanIdByName[$key])) {
                            return ['error' => "No loan named \"$n\". Use the exact names from the data."];
                        }
                        $ids[] = $loanIdByName[$key];
                    }
                    $r = Planner::refinance($user, new Input([
                        'loan_ids' => $ids,
                        'new_rate' => (string) ($args['new_rate_percent'] ?? ''),
                        'tenure_months' => (int) ($args['tenure_months'] ?? 0),
                        'processing_fee' => (string) max(0, (int) ($args['processing_fee_rupees'] ?? 0)),
                        'foreclosure_charges' => (string) max(0, (int) ($args['foreclosure_charges_rupees'] ?? 0)),
                        'other_charges' => (string) max(0, (int) ($args['other_charges_rupees'] ?? 0)),
                    ]));
                    return self::rupeesDeep($r);

                case 'month_by_month_outlook':
                    return self::outlook($user, max(1, min(24, (int) ($args['months'] ?? 6))));
            }
            return ['error' => 'Unknown tool.'];
        } catch (HttpError $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private static function outlook(array $user, int $months): array
    {
        $month = substr(today(), 0, 7);
        $start = addMonths($month, 1);
        [$loans] = Planner::prepare($user, $start);
        $plan = Planner::simulate($loans, $start, 0, [], 'none');
        $pool = array_sum(Contributions::onDate($user, today()));
        [$where, $params] = Scope::visible($user);
        $spent = [];
        foreach (Db::all("SELECT DATE_FORMAT(spent_on, '%Y-%m') AS m, SUM(amount_paise) AS t FROM expenses WHERE $where AND spent_on >= ? AND spent_on < ? GROUP BY m", array_merge($params, [addMonths($month, -3) . '-01', $month . '-01'])) as $r) {
            $spent[] = (int) $r['t'];
        }
        $avg = $spent ? intdiv(array_sum($spent), count($spent)) : null;
        $rows = [];
        foreach (array_slice($plan['timeline'], 0, $months) as $t) {
            $rows[] = [
                'month' => $t['month'],
                'loan_payments' => self::rs($t['payments_paise']),
                'loans_ending' => $t['ended'],
                'family_pool' => self::rs($pool),
                'estimated_free' => $avg === null ? null : self::rs($pool - $avg - $t['payments_paise']),
            ];
        }
        return [
            'average_monthly_spending_last_3_full_months' => self::rs($avg),
            'note' => $avg === null ? 'No spending recorded in the last three full months, so free money cannot be estimated.' : 'estimated_free = family_pool - average spending - loan payments; variable income not included.',
            'months' => $rows,
        ];
    }

    /** Converts every *_paise key to rupees for the AI. */
    private static function rupeesDeep(array $a): array
    {
        $out = [];
        foreach ($a as $k => $v) {
            if (is_array($v)) {
                $out[$k] = self::rupeesDeep($v);
            } elseif (is_int($v) && str_ends_with((string) $k, '_paise')) {
                $out[substr((string) $k, 0, -6) . '_rupees'] = self::rs($v);
            } else {
                $out[$k] = $v;
            }
        }
        return $out;
    }

    // ---------- Gemini HTTP ----------

    /** POST generateContent; walks the model list on 404 like the PrintVerify engine. Returns [json, model]. */
    private static function call(?string $model, array $body): array
    {
        $config = Config::get();
        $key = trim((string) $config['gemini_api_key']);
        $base = rtrim((string) ($config['gemini_base'] ?? self::DEFAULT_BASE), '/');
        $models = $model !== null ? [$model] : array_values(array_unique(array_filter([$config['gemini_model'] ?? null, ...self::MODELS])));
        $lastError = 'AI did not answer.';
        foreach ($models as $m) {
            [$status, $raw] = self::post("$base/models/" . rawurlencode($m) . ':generateContent', $key, $body);
            if ($status === 200) {
                $json = json_decode($raw, true);
                if (is_array($json)) {
                    return [$json, $m];
                }
                $lastError = 'AI sent something unreadable.';
                continue;
            }
            if ($status === 404) {
                continue;
            }
            $lastError = match (true) {
                $status === 0 => 'Could not reach the AI service.',
                $status === 400 || $status === 403 => 'The AI key was refused. Check gemini_api_key in the config.',
                $status === 429 => 'The AI service is busy or out of quota. Try again later.',
                default => 'The AI service had a problem (' . $status . ').',
            };
            break;
        }
        throw new HttpError(502, $lastError);
    }

    private static function post(string $url, string $key, array $body): array
    {
        $payload = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $headers = ['Content-Type: application/json', 'x-goog-api-key: ' . $key];
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => self::TIMEOUT,
                CURLOPT_CONNECTTIMEOUT => 10,
            ]);
            $raw = curl_exec($ch);
            $status = $raw === false ? 0 : (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
            curl_close($ch);
            return [$status, (string) $raw];
        }
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => implode("\r\n", $headers), 'content' => $payload, 'timeout' => self::TIMEOUT, 'ignore_errors' => true]]);
        $raw = @file_get_contents($url, false, $ctx);
        $status = 0;
        foreach ($http_response_header ?? [] as $h) {
            if (preg_match('#^HTTP/\S+ (\d{3})#', $h, $m)) {
                $status = (int) $m[1];
            }
        }
        return [$status, (string) $raw];
    }

    // ---------- instructions ----------

    private const SYSTEM = <<<'TXT'
You are the family's finance assistant inside their private app. People appear as "Person 1", "Person 2"; "asker" is who is asking.

Hard rules:
- Every number you state must come from the FAMILY FINANCE DATA or from a tool result. Never do your own loan maths, interest maths or projections; call a tool instead (run_payoff_plan, compare_refinance, month_by_month_outlook). Simple addition or subtraction of given numbers is fine; say what you added.
- If a needed number is missing (for example a loan's interest rate is null, or no spending is recorded), say it is missing and what to enter. Do not guess it.
- Variable income (incentive, commission, CRM) is never guaranteed. Treat it as possible, not certain.
- Interest-only (gold) payments do not reduce the principal. A credit card minimum due is not full repayment.
- Never suggest using the emergency fund for loans unless the person asks about it; if they do, say it leaves no cushion.
- Do not recommend a specific bank or product. Do not give tax or legal advice.
- You cannot change any data. If asked to change something, say which screen to use.
- Answer in the language and style the person used (Hinglish in, Hinglish out). Keep it short, plain and kind.
TXT;

    private const FINAL = <<<'TXT'
Now write the final answer as JSON with these keys:
- short_answer: one or two sentences that directly answer the question.
- facts: calculated facts taken from the data or tool results (with the rupee amounts and months).
- assumptions: what the answer assumes (for example "incentive of ₹30,000 arrives every 3 months").
- estimates: projected or estimated figures from tool results, marked as estimates.
- suggestions: practical options, never orders; at most 4.
Use empty lists where nothing applies. Same language as the question.
TXT;

    private const SCHEMA = [
        'type' => 'OBJECT',
        'properties' => [
            'short_answer' => ['type' => 'STRING'],
            'facts' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
            'assumptions' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
            'estimates' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
            'suggestions' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
        ],
        'required' => ['short_answer', 'facts', 'assumptions', 'estimates', 'suggestions'],
    ];
}
