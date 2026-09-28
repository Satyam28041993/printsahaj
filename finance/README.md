# Family Finance (private)

A private two-person family finance app: income, spending, loans, loan
payments and a monthly dashboard. Lives at **finance.printsahaj.com**.
It is not linked from printsahaj.com and must never be.

Stack: plain HTML/CSS/JS + PHP 8.1+ + MySQL, on the same Hostinger plan as the
website. No framework, no build step. Chart.js 4.5.1 is vendored in
`site/assets/vendor/`.

**This repository is public.** No real amounts, names, passwords or the
config file ever go in it. Real data is entered in the app after sign-in and
stays in the Hostinger database.

## Layout

| Path | What |
|---|---|
| `site/` | Everything uploaded to `public_html/finance/` |
| `site/index.html`, `site/assets/` | The app (one page, hash routes) |
| `site/api/index.php` | The only PHP entry point (`?r=/route`) |
| `site/src/` | PHP: `lib.php` (config, DB, money, input), `auth.php`, `records.php`, `planner.php`, `goals.php` |
| `site/src/migrations/` | SQL, applied automatically in order |
| `site/config.example.php` | Template for the private config |
| `tests/api_test.php` | End-to-end API test against a throwaway MySQL DB |
| `tests/dev-router.php` | Local `php -S` router with the production CSP |

## Rules the code keeps

1. Money is whole **paise** (BIGINT). Amounts arrive as strings and are parsed exactly; floats are refused.
2. Loans have a repayment type: `emi`, `interest_only` (gold loans) or `card`.
   Every payment stores principal, interest and fees apart; **only principal moves the balance**.
   An interest-only payment never reduces the loan. A card's minimum due is never treated as full repayment.
3. An EMI total is split automatically only when the loan's rate is known; otherwise the user enters the split.
4. Salary is always fixed income; incentive, commission, CRM and freelance are always variable,
   and variable income counts on the dashboard only once received.
5. What someone earns (income) and what they put into the family pool (contributions) are stored separately.
6. Private rows are seen only by their owner; family rows by both. All reads go through `Scope`.
7. Deletes are soft (`deleted_at`); every change is written to `audit_log`.
9. The emergency fund and other goals are separate money; payoff plans never use them.
8. Unknown numbers stay empty (NULL), never 0; the app flags them instead of guessing.

## One-time Hostinger setup

1. **Subdomain** `finance.printsahaj.com` → folder `public_html/finance` (done).
2. **Database** `u205537795_finance` with user `u205537795_finance` (done).
3. **Config file.** In hPanel → File Manager, go to `domains/printsahaj.com/`
   (the folder that *contains* `public_html`). Create `finance-config.php`
   with the contents of `site/config.example.php`, then fill in the database
   password and a long random setup code. Being outside `public_html`, the web can never serve it.
4. **Deploy.** Merging to `main` runs `.github/workflows/deploy-finance.yml`:
   tests first, then FTP to `public_html/finance/`, then a live check.
5. **Accounts.** Open https://finance.printsahaj.com, enter the setup code,
   and create both accounts. The setup page refuses to run again once any account exists.

## Run locally

```bash
# MySQL/MariaDB with an empty database, then:
cp finance/site/config.example.php /tmp/ff-config.php   # edit db + allowed_hosts ['127.0.0.1:8770'], secure_cookies false
FINANCE_CONFIG=/tmp/ff-config.php php -S 127.0.0.1:8770 -t finance/site finance/tests/dev-router.php
# tests (wipe the given DB):
FF_DB_HOST=127.0.0.1 FF_DB_NAME=fftest FF_DB_USER=ff FF_DB_PASS=ffpass php finance/tests/api_test.php
```

## Roadmap

- **V1 (done):** sign-in, income, family pool, spending, loans, loan payments, dashboard.
- **Plan (done):** month-by-month payoff projection (`src/planner.php`) comparing today's payments,
  costliest-first (avalanche), smallest-first (snowball) and a chosen loan first, with extra monthly
  money and expected lump sums (incentive, CRM). Freed EMIs roll into the next loan. Refinance check:
  new loan vs paying the same EMI into the current loans. Neither changes saved data.
- **Goals (done):** emergency fund (one per family, optional lower target, e.g. 50k–75k) and savings
  goals with money in/out entries, monthly amount, target date, "needs ₹X/month" and expected month.
  Loan-closure goals follow a loan's balance and use the planner for the expected end. Loan planning
  never reads or spends goal money. The dashboard shows money put into goals and what is still free.
- **V4:** AI explanations on top of the calculated numbers (server-side key; AI never writes data).
- **V5:** backups, monitoring, security review.
