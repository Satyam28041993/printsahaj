/* Family Finance — plain JavaScript, no framework.
 * All money arrives from the API as whole paise and is only formatted here;
 * every sum is done on the server. User text is always set with textContent.
 */
'use strict';

(() => {
  const state = { csrf: '', user: null, meta: null, members: [], month: thisMonth(), view: 'dashboard', chart: null };

  // ---------- small helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      // Through the CSSOM, which the page's CSP allows; a style attribute would be blocked.
      else if (k === 'style') el.style.cssText = v;
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat()) {
      if (kid === null || kid === undefined || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  function thisMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  function todayIso() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  const rupee = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  /** 1250050 paise → "₹12,500.50"; whole rupees drop the paise. */
  function fmt(paise) {
    if (paise === null || paise === undefined) return '—';
    const neg = paise < 0;
    const abs = Math.abs(paise);
    const whole = Math.floor(abs / 100);
    const frac = abs % 100;
    return `${neg ? '−' : ''}₹${rupee.format(whole)}${frac ? '.' + String(frac).padStart(2, '0') : ''}`;
  }
  /** Rounded to the rupee, for projections where paise are noise. */
  const fmt0 = (paise) => (paise === null || paise === undefined ? '—' : fmt(Math.round(paise / 100) * 100));
  /** paise → "12500.50" for putting back into an input. */
  function toInput(paise) {
    if (paise === null || paise === undefined) return '';
    const frac = paise % 100;
    return `${Math.floor(paise / 100)}${frac ? '.' + String(frac).padStart(2, '0') : ''}`;
  }
  function rate(r) {
    return r === null || r === undefined ? null : `${Number(r).toString()}%`;
  }
  function dayLabel(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function fullDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function monthLabel(ym) {
    const d = new Date(ym + '-01T00:00:00');
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  const CATEGORY = {
    grocery: ['Grocery', '🛒'], electricity: ['Electricity', '💡'], mobile_internet: ['Mobile / Internet', '📶'],
    milk: ['Milk', '🥛'], vegetables: ['Vegetables', '🥦'], kids: ['Kids', '🧸'], school: ['School', '🎒'],
    medical: ['Medical', '💊'], travel: ['Travel', '🚌'], shopping: ['Shopping', '🛍️'], entertainment: ['Entertainment', '🎬'],
    household: ['Household', '🏠'], rent: ['Rent / Maintenance', '🔑'], insurance: ['Insurance', '🛡️'], other: ['Other', '•'],
  };
  const INCOME = {
    salary: 'Salary', incentive: 'Incentive', commission: 'Commission', crm: 'CRM income',
    freelance: 'Freelance', business: 'Business', other: 'Other',
  };
  const FIXED_BY_TYPE = { salary: 'fixed', incentive: 'variable', commission: 'variable', crm: 'variable', freelance: 'variable' };
  const LOAN_TYPE = {
    gold: 'Gold loan', home: 'Home loan', personal: 'Personal loan', bike: 'Bike loan',
    consumer: 'Consumer loan', credit_card: 'Credit card', other: 'Other',
  };
  const GROUPS = [
    ['high_cost', 'High-cost (15% or more)'],
    ['short_term', 'Short-term (2 years or less left)'],
    ['long_term', 'Long-term'],
    ['other', 'Other loans'],
    ['closed', 'Paid off'],
  ];
  const PALETTE = ['#0e9f8e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#ec4899', '#64748b', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#a855f7', '#94a3b8'];

  // ---------- API ----------
  class ApiError extends Error {
    constructor(status, message) { super(message); this.status = status; }
  }
  async function api(method, route, body) {
    const opts = { method, headers: { Accept: 'application/json' }, credentials: 'same-origin' };
    if (method === 'POST') {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['X-CSRF-Token'] = state.csrf;
      opts.body = JSON.stringify(body || {});
    }
    let res;
    try {
      res = await fetch(`api/index.php?r=${route}`, opts);
    } catch {
      throw new ApiError(0, 'No connection. Check the internet and try again.');
    }
    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
    if (data && data.csrf) state.csrf = data.csrf;
    if (!res.ok) {
      if (res.status === 401 && state.user) {
        state.user = null;
        showLogin('You were signed out. Please sign in again.');
      }
      throw new ApiError(res.status, (data && data.error) || 'Something went wrong.');
    }
    return data;
  }
  const get = (route) => api('GET', route);
  const post = (route, body) => api('POST', route, body);

  // ---------- boot, sign-in, setup ----------
  function showOnly(id) {
    for (const s of ['#boot', '#view-login', '#view-setup', '#app']) $(s).hidden = s !== id;
  }

  async function boot() {
    try {
      const s = await get('session');
      if (s.needsSetup) return showOnly('#view-setup');
      if (s.user) {
        state.user = s.user;
        return startApp();
      }
      showLogin();
    } catch (e) {
      $('#boot').textContent = e.message;
    }
  }

  function showLogin(message = '') {
    showOnly('#view-login');
    $('#login-form .error').textContent = message;
    $('#login-form [name=username]').focus();
  }

  function bindForm(form, handler) {
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const err = form.querySelector('.error');
      if (err) err.textContent = '';
      btn.disabled = true;
      try {
        await handler(new FormData(form));
      } catch (e) {
        if (err) err.textContent = e.message;
        else toast(e.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  bindForm($('#login-form'), async (fd) => {
    const r = await post('login', { username: fd.get('username'), password: fd.get('password') });
    state.user = r.user;
    $('#login-form').reset();
    startApp();
  });

  bindForm($('#setup-form'), async (fd) => {
    const members = [0, 1].map((i) => ({ name: fd.get('name' + i), username: fd.get('username' + i), password: fd.get('password' + i) }));
    await post('setup', { token: fd.get('token'), familyName: fd.get('familyName'), members });
    $('#setup-form').reset();
    showLogin('Accounts created. Sign in now.');
  });

  async function startApp() {
    showOnly('#app');
    [state.meta, state.members] = await Promise.all([get('meta'), get('members')]);
    $('#who').textContent = `Signed in as ${state.user.name}`;
    $('#month').value = state.month;
    route();
  }

  $('#month').addEventListener('change', (e) => {
    if (/^\d{4}-\d{2}$/.test(e.target.value)) {
      state.month = e.target.value;
      render();
    }
  });
  window.addEventListener('hashchange', route);
  $('#fab').addEventListener('click', () => openExpenseForm());

  function route() {
    const view = location.hash.replace('#', '') || 'dashboard';
    state.view = ['dashboard', 'expenses', 'income', 'loans', 'goals', 'plan', 'settings'].includes(view) ? view : 'dashboard';
    for (const a of document.querySelectorAll('.nav a')) {
      if (a.dataset.view === state.view) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
    render();
  }

  async function render() {
    if (!state.user) return;
    const titles = { dashboard: 'Home', expenses: 'Spending', income: 'Income', loans: 'Loans', goals: 'Goals', plan: 'Plan', settings: 'Settings' };
    $('#view-title').textContent = titles[state.view];
    $('#month').hidden = ['settings', 'loans', 'goals', 'plan'].includes(state.view);
    const main = $('#main');
    main.replaceChildren(h('div', { class: 'loading', text: 'Loading…' }));
    try {
      const views = { dashboard: viewDashboard, expenses: viewExpenses, income: viewIncome, loans: viewLoans, goals: viewGoals, plan: viewPlan, settings: viewSettings };
      const node = await views[state.view]();
      main.replaceChildren(node);
    } catch (e) {
      if (e.status !== 401) main.replaceChildren(h('div', { class: 'card empty', text: e.message }));
    }
  }

  // ---------- dialog ----------
  const dialog = $('#dialog');
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });
  function openDialog(title, body) {
    $('#dialog-title').textContent = title;
    $('#dialog-body').replaceChildren(body);
    if (!dialog.open) dialog.showModal();
    const first = body.querySelector('input:not([type=hidden]), select');
    if (first) first.focus();
  }

  // ---------- form building ----------
  function field(label, input, hint) {
    return h('label', { class: 'field' }, h('span', { text: label }), input, hint ? h('span', { class: 'hint', text: hint }) : null);
  }
  function input(name, value, attrs = {}) {
    return h('input', { name, value: value ?? '', ...attrs });
  }
  function moneyInput(name, value, attrs = {}) {
    return input(name, value, { inputmode: 'decimal', autocomplete: 'off', placeholder: '0', ...attrs });
  }
  function select(name, options, value) {
    return h('select', { name }, options.map(([v, label]) => h('option', { value: v, selected: v === value }, label)));
  }
  function memberSelect(value) {
    return select('member_id', state.members.map((m) => [String(m.id), m.name]), String(value ?? state.user.id));
  }
  function check(name, label, checked) {
    return h('label', { class: 'check' }, h('input', { type: 'checkbox', name, checked: !!checked }), h('span', { text: label }));
  }
  function segmented(options, value, onChange) {
    const wrap = h('div', { class: 'segmented', role: 'group' });
    const set = (v) => {
      for (const b of wrap.children) b.setAttribute('aria-pressed', String(b.dataset.value === v));
      onChange(v);
    };
    for (const [v, label] of options) {
      wrap.append(h('button', { type: 'button', dataset: { value: v }, 'aria-pressed': String(v === value), onclick: () => set(v) }, label));
    }
    return wrap;
  }
  function formShell(onSubmit, submitLabel, ...kids) {
    const form = h('form', { novalidate: true }, ...kids, h('p', { class: 'error', role: 'alert' }), h('button', { class: 'btn primary block', type: 'submit' }, submitLabel));
    bindForm(form, onSubmit);
    return form;
  }
  const privateBox = (item) => check('private', 'Private — only I can see this', item && item.visibility === 'private');
  const visibilityOf = (fd) => (fd.get('private') ? 'private' : 'family');

  // ---------- dashboard ----------
  async function viewDashboard() {
    const d = await get(`dashboard&month=${state.month}`);
    const root = h('div', { class: 'stack' });

    const available = d.available_paise;
    const pool = d.contribution_pool_paise;
    let status = ['good', 'Healthy'];
    if (available < 0) status = ['bad', 'Short this month'];
    else if (pool > 0 && available < pool * 0.1) status = ['warn', 'Tight'];

    root.append(h('section', { class: `card hero${available < 0 ? ' negative' : ''}` },
      h('div', { class: 'row between' }, h('span', { class: 'muted', text: `Left for ${monthLabel(d.month)}` }), h('span', { class: `chip ${status[0]}`, text: status[1] })),
      h('div', { class: 'big-money', text: fmt(available) }),
      h('p', { class: 'formula', text: `${fmt(pool)} family pool + ${fmt(d.variable_income_paise)} extra income − ${fmt(d.expenses_paise)} spent − ${fmt(d.scheduled_debt_paise)} loan payments` }),
      d.saved_to_goals_paise ? h('p', { class: 'formula', text: `${fmt(d.saved_to_goals_paise)} put into goals this month · ${fmt(d.free_after_goals_paise)} still free` }) : null,
    ));
    root.append(emergencyMini(d.emergency));

    const notes = [];
    if (d.contributions_missing) notes.push(h('p', { class: 'notice' }, 'Family pool is not set for everyone. ', h('a', { href: '#settings', text: 'Set monthly contributions' }), '.'));
    const noRate = d.loans.filter((l) => l.flags.includes('rate_missing'));
    if (noRate.length) notes.push(h('p', { class: 'notice info', text: `Interest rate not entered for: ${noRate.map((l) => l.name).join(', ')}. Add it in Loans so the app can split EMIs and plan payoff.` }));
    if (notes.length) root.append(h('div', { class: 'stack' }, notes));

    const kpi = (label, value, note) => h('div', { class: 'card kpi' }, h('div', { class: 'label', text: label }), h('div', { class: 'value', text: value }), note ? h('div', { class: 'note', text: note }) : null);
    root.append(h('div', { class: 'kpis' },
      kpi('Family pool', fmt(pool), 'Monthly contributions'),
      kpi('Extra income', fmt(d.variable_income_paise), 'Incentive, CRM — only once received'),
      kpi('Spent', fmt(d.expenses_paise), `${d.expenses_by_category.reduce((n, c) => n + c.count, 0)} entries`),
      kpi('Loan payments due', fmt(d.scheduled_debt_paise), 'EMIs, interest and card minimums'),
      kpi('Total loans left', fmt(d.outstanding_debt_paise), `${d.loans.filter((l) => l.group !== 'closed').length} active`),
      d.interest_only_monthly_paise > 0
        ? kpi('Interest-only cost', fmt(d.interest_only_monthly_paise) + '/mo', 'Paying this does not reduce those loans')
        : kpi('Principal paid', fmt(d.paid_this_month.principal), 'This month'),
    ));

    const grid = h('div', { class: 'two-col' });
    grid.append(upcomingCard(d.upcoming), spendingCard(d.expenses_by_category, d.expenses_paise));
    root.append(grid);
    root.append(debtCard(d.loans));
    return root;
  }

  function emergencyMini(ef) {
    if (!ef) {
      return h('section', { class: 'card row between' },
        h('div', {}, h('h3', { text: 'Emergency fund' }), h('p', { class: 'muted small', text: 'Not set up yet. Money kept aside for emergencies, never used for loan plans.' })),
        h('a', { class: 'btn small', href: '#goals', text: 'Set up' }));
    }
    return h('section', { class: 'card' },
      h('div', { class: 'row between' }, h('h3', { text: 'Emergency fund' }), goalChip(ef)),
      h('div', { class: 'amounts row', style: 'margin:8px 0' }, h('span', { class: 'money', text: fmt(ef.current_paise) }), h('span', { class: 'muted small', text: `of ${goalTargetText(ef)}` })),
      progressBar(ef),
    );
  }

  function dueChip(u) {
    if (u.paid) return h('span', { class: 'chip good', text: 'Paid' });
    const today = todayIso();
    // The app only knows what was recorded; the bill may be paid already.
    if (u.due_on < today) return h('span', { class: 'chip warn', text: 'Not recorded' });
    const days = Math.round((new Date(u.due_on) - new Date(today)) / 86400000);
    return h('span', { class: `chip ${days <= 5 ? 'warn' : 'info'}`, text: days === 0 ? 'Due today' : `In ${days} days` });
  }

  function upcomingCard(upcoming) {
    const card = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Payments this month' })));
    if (!upcoming.length) {
      card.append(h('p', { class: 'empty', text: 'No due dates yet. Add a due day to your loans to see them here.' }));
      return card;
    }
    card.append(h('ul', { class: 'list' }, upcoming.map((u) => h('li', {},
      h('div', { class: 'main' }, h('div', { class: 't', text: u.name }), h('div', { class: 's', text: dayLabel(u.due_on) })),
      h('div', { class: 'money', text: fmt(u.amount_paise) }), dueChip(u),
    ))));
    return card;
  }

  function spendingCard(cats, total) {
    const card = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Where money went' }), h('span', { class: 'money', text: fmt(total) })));
    if (!cats.length) {
      card.append(h('p', { class: 'empty' }, 'No spending entered for this month. ', h('button', { class: 'btn small', type: 'button', onclick: () => openExpenseForm(), text: 'Add spending' })));
      return card;
    }
    const canvas = h('canvas', { 'aria-label': 'Spending by category', role: 'img' });
    card.append(h('div', { class: 'chart-box' }, canvas));
    card.append(h('ul', { class: 'list' }, cats.map((c, i) => {
      const [label, icon] = CATEGORY[c.category] || [c.category, '•'];
      const pct = total ? Math.round((c.total_paise / total) * 100) : 0;
      return h('li', {},
        h('span', { class: 'icon', text: icon }),
        h('div', { class: 'main' }, h('div', { class: 't', text: label }), h('div', { class: 'bar' }, h('span', { style: `width:${pct}%;background:${PALETTE[i % PALETTE.length]}` }))),
        h('div', { class: 'money', text: fmt(c.total_paise) }),
      );
    })));
    requestAnimationFrame(() => drawDoughnut(canvas, cats));
    return card;
  }

  function drawDoughnut(canvas, cats) {
    if (!window.Chart || !canvas.isConnected) return;
    if (state.chart) state.chart.destroy();
    const text = getComputedStyle(document.body).color;
    state.chart = new window.Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: cats.map((c) => (CATEGORY[c.category] || [c.category])[0]),
        datasets: [{ data: cats.map((c) => c.total_paise / 100), backgroundColor: cats.map((_, i) => PALETTE[i % PALETTE.length]), borderWidth: 0 }],
      },
      options: {
        maintainAspectRatio: false,
        cutout: '68%',
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${fmt(Math.round(ctx.parsed * 100))}` } },
        },
        color: text,
      },
    });
  }

  function debtCard(loans) {
    const active = loans.filter((l) => l.group !== 'closed');
    const card = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Loans' }), h('a', { href: '#loans', class: 'small', text: 'Open loans' })));
    if (!active.length) {
      card.append(h('p', { class: 'empty', text: 'No active loans entered.' }));
      return card;
    }
    const max = Math.max(...active.map((l) => l.outstanding_paise));
    card.append(h('ul', { class: 'list' }, active.map((l) => h('li', {},
      h('div', { class: 'main' },
        h('div', { class: 'row between' }, h('span', { class: 't', text: l.name }), h('span', { class: 'money', text: fmt(l.outstanding_paise) })),
        h('div', { class: 'bar' }, h('span', { style: `width:${Math.max(2, Math.round((l.outstanding_paise / max) * 100))}%` })),
        h('div', { class: 's', text: loanSubline(l) }),
      ),
    ))));
    return card;
  }

  function loanSubline(l) {
    const bits = [LOAN_TYPE[l.loan_type] || l.loan_type];
    bits.push(rate(l.interest_rate) || 'rate not entered');
    if (l.projected_close) bits.push(`ends ${monthLabel(l.projected_close)}`);
    return bits.join(' · ');
  }

  // ---------- spending ----------
  async function viewExpenses() {
    const root = h('div', { class: 'stack' });
    const filters = h('div', { class: 'card' });
    const cat = select('category', [['', 'All categories'], ...state.meta.expense_categories.map((c) => [c, CATEGORY[c][0]])], state.expCategory || '');
    const q = input('q', state.expQuery || '', { type: 'search', placeholder: 'Search notes', 'aria-label': 'Search notes' });
    const listBox = h('div');
    filters.append(h('div', { class: 'grid-2' }, cat, q));
    root.append(h('button', { class: 'btn primary', type: 'button', onclick: () => openExpenseForm(), text: '+ Add spending' }), filters, listBox);

    const load = async () => {
      state.expCategory = cat.value;
      state.expQuery = q.value.trim();
      const params = `expenses&month=${state.month}&category=${encodeURIComponent(cat.value)}&q=${encodeURIComponent(state.expQuery)}`;
      const rows = await get(params);
      listBox.replaceChildren(expenseList(rows));
    };
    cat.addEventListener('change', load);
    let timer;
    q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(load, 300); });
    await load();
    return root;
  }

  function expenseList(rows) {
    const card = h('section', { class: 'card' });
    const total = rows.reduce((n, r) => n + r.amount_paise, 0);
    card.append(h('div', { class: 'card-head' }, h('h2', { text: monthLabel(state.month) }), h('span', { class: 'money', text: fmt(total) })));
    if (!rows.length) {
      card.append(h('p', { class: 'empty', text: 'Nothing here yet.' }));
      return card;
    }
    let day = '';
    let list = null;
    for (const r of rows) {
      if (r.spent_on !== day) {
        day = r.spent_on;
        card.append(h('div', { class: 'day-head', text: dayLabel(day) }));
        list = h('ul', { class: 'list' });
        card.append(list);
      }
      const [label, icon] = CATEGORY[r.category] || [r.category, '•'];
      list.append(h('li', {},
        h('span', { class: 'icon', text: icon }),
        h('div', { class: 'main' },
          h('div', { class: 't', text: r.notes || label }),
          h('div', { class: 's', text: [label, r.member_name, r.visibility === 'private' ? 'private' : null, r.is_recurring ? 'monthly' : null].filter(Boolean).join(' · ') }),
        ),
        h('div', { class: 'money', text: fmt(r.amount_paise) }),
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': `Edit ${label}`, onclick: () => openExpenseForm(r), text: '✎' }),
      ));
    }
    return card;
  }

  function openExpenseForm(item) {
    let category = item ? item.category : (state.lastCategory || 'grocery');
    const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Category' });
    for (const c of state.meta.expense_categories) {
      const [label, icon] = CATEGORY[c];
      chips.append(h('button', {
        type: 'button', 'aria-pressed': String(c === category), dataset: { value: c },
        onclick: (e) => {
          category = c;
          for (const b of chips.children) b.setAttribute('aria-pressed', String(b === e.currentTarget));
        },
      }, `${icon} ${label}`));
    }
    const form = formShell(async (fd) => {
      const body = {
        amount: fd.get('amount'), category, spent_on: fd.get('spent_on'), member_id: fd.get('member_id'),
        notes: fd.get('notes'), is_recurring: !!fd.get('is_recurring'), visibility: visibilityOf(fd),
      };
      if (item) await post(`expenses/${item.id}/update`, body);
      else await post('expenses', body);
      state.lastCategory = category;
      dialog.close();
      toast(item ? 'Updated' : 'Saved');
      render();
    }, item ? 'Save changes' : 'Save',
      field('Amount (₹)', moneyInput('amount', item ? toInput(item.amount_paise) : '', { class: 'amount-input', required: true })),
      h('div', { class: 'field' }, h('span', { text: 'Category' }), chips),
      h('div', { class: 'grid-2' },
        field('Date', input('spent_on', item ? item.spent_on : todayIso(), { type: 'date', required: true })),
        field('Paid by', memberSelect(item && item.user_id)),
      ),
      field('Note', input('notes', item ? item.notes : '', { maxlength: 500, placeholder: 'Optional' })),
      check('is_recurring', 'Happens every month', item && item.is_recurring),
      privateBox(item),
    );
    if (item) {
      form.append(h('button', {
        class: 'btn danger block', type: 'button', style: 'margin-top:10px', text: 'Delete',
        onclick: async () => {
          if (!confirm('Delete this entry?')) return;
          await post(`expenses/${item.id}/delete`);
          dialog.close();
          toast('Deleted');
          render();
        },
      }));
    }
    openDialog(item ? 'Edit spending' : 'Add spending', form);
  }

  // ---------- income ----------
  async function viewIncome() {
    const rows = await get(`income&month=${state.month}`);
    const root = h('div', { class: 'stack' });
    const fixed = rows.filter((r) => r.stability === 'fixed').reduce((n, r) => n + r.amount_paise, 0);
    const variable = rows.filter((r) => r.stability === 'variable').reduce((n, r) => n + r.amount_paise, 0);
    root.append(h('button', { class: 'btn primary', type: 'button', onclick: () => openIncomeForm(), text: '+ Add income' }));
    root.append(h('div', { class: 'kpis' },
      h('div', { class: 'card kpi' }, h('div', { class: 'label', text: 'Fixed (salary)' }), h('div', { class: 'value', text: fmt(fixed) })),
      h('div', { class: 'card kpi' }, h('div', { class: 'label', text: 'Variable (incentive, CRM…)' }), h('div', { class: 'value', text: fmt(variable) }), h('div', { class: 'note', text: 'Never counted before it arrives' })),
    ));
    root.append(h('p', { class: 'notice info', text: 'Salary is what you earn. The family pool (in Settings) is what each person puts in for the house — they can be different.' }));
    const card = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: monthLabel(state.month) })));
    if (!rows.length) card.append(h('p', { class: 'empty', text: 'No income entered for this month.' }));
    else {
      card.append(h('ul', { class: 'list' }, rows.map((r) => h('li', {},
        h('span', { class: 'icon', text: r.stability === 'fixed' ? '🏦' : '✨' }),
        h('div', { class: 'main' },
          h('div', { class: 't', text: `${INCOME[r.income_type] || r.income_type} — ${r.member_name}` }),
          h('div', { class: 's', text: [dayLabel(r.received_on), r.stability, r.visibility === 'private' ? 'private' : null, r.notes || null].filter(Boolean).join(' · ') }),
        ),
        h('div', { class: 'money', text: fmt(r.amount_paise) }),
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Edit income', onclick: () => openIncomeForm(r), text: '✎' }),
      ))));
    }
    root.append(card);
    return root;
  }

  function openIncomeForm(item) {
    const type = select('income_type', state.meta.income_types.map((t) => [t, INCOME[t]]), item ? item.income_type : 'salary');
    const stability = select('stability', [['fixed', 'Fixed (regular)'], ['variable', 'Variable (not guaranteed)']], item ? item.stability : 'fixed');
    const stabilityField = field('Regular or variable?', stability);
    const sync = () => {
      const forced = FIXED_BY_TYPE[type.value];
      stabilityField.hidden = !!forced;
      if (forced) stability.value = forced;
    };
    type.addEventListener('change', sync);
    sync();
    const form = formShell(async (fd) => {
      const body = {
        income_type: fd.get('income_type'), stability: fd.get('stability'), amount: fd.get('amount'), received_on: fd.get('received_on'),
        member_id: fd.get('member_id'), notes: fd.get('notes'), is_recurring: !!fd.get('is_recurring'), visibility: visibilityOf(fd),
      };
      if (item) await post(`income/${item.id}/update`, body);
      else await post('income', body);
      dialog.close();
      toast('Saved');
      render();
    }, item ? 'Save changes' : 'Save',
      field('Amount (₹)', moneyInput('amount', item ? toInput(item.amount_paise) : '', { class: 'amount-input', required: true })),
      h('div', { class: 'grid-2' }, field('Type', type), field('Earned by', memberSelect(item && item.user_id))),
      stabilityField,
      field('Date received', input('received_on', item ? item.received_on : todayIso(), { type: 'date', required: true })),
      field('Note', input('notes', item ? item.notes : '', { maxlength: 500, placeholder: 'Optional' })),
      check('is_recurring', 'Comes every month', item && item.is_recurring),
      privateBox(item),
    );
    if (item) form.append(deleteButton(`income/${item.id}/delete`));
    openDialog(item ? 'Edit income' : 'Add income', form);
  }

  function deleteButton(route) {
    return h('button', {
      class: 'btn danger block', type: 'button', style: 'margin-top:10px', text: 'Delete',
      onclick: async () => {
        if (!confirm('Delete this entry?')) return;
        await post(route);
        dialog.close();
        toast('Deleted');
        render();
      },
    });
  }

  // ---------- loans ----------
  async function viewLoans() {
    const loans = await get('loans');
    const root = h('div', { class: 'stack' });
    root.append(h('button', { class: 'btn primary', type: 'button', onclick: () => openLoanForm(), text: '+ Add loan or card' }));
    const active = loans.filter((l) => l.group !== 'closed');
    if (active.length) {
      const total = active.reduce((n, l) => n + l.outstanding_paise, 0);
      const monthly = active.reduce((n, l) => n + l.scheduled_paise, 0);
      root.append(h('div', { class: 'kpis' },
        h('div', { class: 'card kpi' }, h('div', { class: 'label', text: 'Total left to repay' }), h('div', { class: 'value', text: fmt(total) })),
        h('div', { class: 'card kpi' }, h('div', { class: 'label', text: 'Monthly loan payments' }), h('div', { class: 'value', text: fmt(monthly) })),
      ));
    }
    if (!loans.length) root.append(h('div', { class: 'card empty', text: 'No loans yet. Add each loan and credit card once; the app keeps the balance from your payments.' }));
    for (const [key, label] of GROUPS) {
      const inGroup = loans.filter((l) => l.group === key);
      if (!inGroup.length) continue;
      root.append(h('h2', { text: label }), h('div', { class: 'loan-grid' }, inGroup.map(loanCard)));
    }
    return root;
  }

  function loanCard(l) {
    const monthlyLabel = { emi: 'EMI', interest_only: 'Monthly interest', card: 'Minimum due' }[l.repayment_type];
    const monthlyValue = l.repayment_type === 'card' ? l.min_due_paise : l.monthly_payment_paise;
    const notes = [];
    if (l.flags.includes('principal_not_reducing')) {
      notes.push(h('p', { class: 'notice', text: `Interest-only: paying ${fmt(l.monthly_payment_paise)} each month does not reduce this loan. Only a principal payment does.${l.monthly_interest_paise !== null ? ` Interest on today's balance: ${fmt(l.monthly_interest_paise)}/month.` : ''}` }));
    }
    if (l.flags.includes('min_due_is_not_full')) {
      notes.push(h('p', { class: 'notice', text: `Paying only the minimum (${fmt(l.min_due_paise)}) leaves ${fmt(Math.max(0, l.outstanding_paise - (l.min_due_paise || 0)))} on the card, and the bank charges interest on it.` }));
    }
    if (l.flags.includes('rate_missing')) {
      notes.push(h('p', { class: 'notice info', text: l.repayment_type === 'card'
        ? 'Add the card\'s interest rate (Edit) to see what carrying this balance costs each month.'
        : 'Add the interest rate (Edit) so the app can split each EMI into interest and principal.' }));
    }
    let left = '—';
    if (l.remaining_now !== null) left = l.remaining_now === 0 ? 'Done' : `${l.remaining_now} months`;
    return h('article', { class: 'card loan-card' },
      h('div', { class: 'top' },
        h('div', {}, h('h3', { text: l.name }), h('p', { class: 'faint', text: `${LOAN_TYPE[l.loan_type] || l.loan_type} · ${l.member_name}${l.visibility === 'private' ? ' · private' : ''}` })),
        l.closing_soon ? h('span', { class: 'chip good', text: 'Closing soon' }) : l.group === 'closed' ? h('span', { class: 'chip', text: 'Paid off' }) : null,
      ),
      h('dl', { class: 'facts' },
        h('div', {}, h('dt', { text: 'Left to repay' }), h('dd', { class: 'money', text: fmt(l.outstanding_paise) })),
        h('div', {}, h('dt', { text: 'Interest' }), h('dd', { text: rate(l.interest_rate) || 'Not entered' })),
        h('div', {}, h('dt', { text: monthlyLabel }), h('dd', { text: fmt(monthlyValue) })),
        h('div', {}, h('dt', { text: 'Time left' }), h('dd', { text: left + (l.projected_close ? ` · ${monthLabel(l.projected_close)}` : '') })),
      ),
      notes.length ? h('div', { class: 'stack', style: 'gap:8px;margin-bottom:12px' }, notes) : null,
      h('div', { class: 'row' },
        l.group !== 'closed' ? h('button', { class: 'btn primary small', type: 'button', onclick: () => openPaymentForm(l), text: 'Record payment' }) : null,
        h('button', { class: 'btn small', type: 'button', onclick: () => openPayments(l), text: 'Payments' }),
        h('button', { class: 'btn small', type: 'button', onclick: () => openLoanForm(l), text: 'Edit' }),
      ),
    );
  }

  function openLoanForm(item) {
    const type = select('loan_type', state.meta.loan_types.map((t) => [t, LOAN_TYPE[t]]), item ? item.loan_type : 'personal');
    let repayment = item ? item.repayment_type : 'emi';
    const emiFields = h('div', { class: 'grid-2' },
      field('Monthly payment (₹)', moneyInput('monthly_payment', item ? toInput(item.monthly_payment_paise) : ''), 'EMI, or the monthly interest for gold loans'),
      field('Months left', input('remaining_months', item && item.remaining_months !== null ? item.remaining_months : '', { inputmode: 'numeric' }), 'As on the date below'),
    );
    const cardFields = field('Minimum due (₹)', moneyInput('min_due', item ? toInput(item.min_due_paise) : ''));
    const help = h('p', { class: 'faint', style: 'margin:-6px 0 14px' });
    const repaymentPicker = segmented([['emi', 'EMI'], ['interest_only', 'Interest only']], repayment, (v) => { repayment = v; sync(); });
    const sync = () => {
      if (type.value === 'credit_card') repayment = 'card';
      else if (repayment === 'card') repayment = 'emi';
      repaymentPicker.hidden = repayment === 'card';
      for (const b of repaymentPicker.children) b.setAttribute('aria-pressed', String(b.dataset.value === repayment));
      emiFields.hidden = repayment === 'card';
      cardFields.hidden = repayment !== 'card';
      help.textContent = {
        emi: 'Each EMI pays some interest and some of the loan.',
        interest_only: 'Monthly payments cover interest only; the loan goes down only with a principal payment.',
        card: 'The card balance and the minimum due are kept apart.',
      }[repayment];
    };
    type.addEventListener('change', () => {
      if (!item && type.value === 'gold') repayment = 'interest_only';
      sync();
    });
    if (!item && type.value === 'gold') repayment = 'interest_only';
    sync();

    const form = formShell(async (fd) => {
      const body = {
        name: fd.get('name'), loan_type: fd.get('loan_type'), repayment_type: repayment, member_id: fd.get('member_id'),
        outstanding: fd.get('outstanding'), original_principal: fd.get('original_principal'), interest_rate: fd.get('interest_rate'),
        monthly_payment: repayment === 'card' ? '' : fd.get('monthly_payment'), min_due: repayment === 'card' ? fd.get('min_due') : '',
        remaining_months: repayment === 'card' ? '' : fd.get('remaining_months'), due_day: fd.get('due_day'), as_of_date: fd.get('as_of_date'),
        status: fd.get('status') || 'active', notes: fd.get('notes'), visibility: visibilityOf(fd),
      };
      if (item) await post(`loans/${item.id}/update`, body);
      else await post('loans', body);
      dialog.close();
      toast('Saved');
      render();
    }, item ? 'Save changes' : 'Add loan',
      field('Name', input('name', item ? item.name : '', { maxlength: 80, required: true, placeholder: 'e.g. Gold loan — bank name' })),
      h('div', { class: 'grid-2' }, field('Type', type), field('Borrower', memberSelect(item && item.user_id))),
      repaymentPicker, help,
      h('div', { class: 'grid-2' },
        field('Left to repay today (₹)', moneyInput('outstanding', item ? toInput(item.outstanding_paise) : '', { required: true })),
        field('Interest % per year', input('interest_rate', item && item.interest_rate !== null ? Number(item.interest_rate) : '', { inputmode: 'decimal' }), 'Leave empty if not known'),
      ),
      emiFields, cardFields,
      h('div', { class: 'grid-2' },
        field('Due day of month', input('due_day', item && item.due_day !== null ? item.due_day : '', { inputmode: 'numeric', placeholder: 'e.g. 5' })),
        field('Numbers as on', input('as_of_date', item ? item.as_of_date : todayIso(), { type: 'date' })),
      ),
      field('Original loan amount (₹)', moneyInput('original_principal', item ? toInput(item.original_principal_paise) : ''), 'Optional — what was borrowed at the start'),
      item ? field('Status', select('status', [['active', 'Active'], ['closed', 'Closed']], item.status)) : null,
      field('Note', input('notes', item ? item.notes : '', { maxlength: 500, placeholder: 'Optional' })),
      privateBox(item),
    );
    if (item) form.append(deleteButton(`loans/${item.id}/delete`));
    openDialog(item ? `Edit ${item.name}` : 'Add loan or card', form);
  }

  function openPaymentForm(l) {
    const modes = {
      interest_only: [['interest', 'Monthly interest'], ['principal', 'Principal payment'], ['split', 'Both']],
      emi: l.interest_rate !== null ? [['total', 'EMI'], ['split', 'Enter split']] : [['split', 'Enter split']],
      card: [['total', 'Card payment']],
    }[l.repayment_type];
    let mode = modes[0][0];
    const suggested = {
      interest: toInput(l.monthly_payment_paise), total: toInput(l.repayment_type === 'card' ? l.min_due_paise : l.monthly_payment_paise), principal: '',
    };
    const amount = moneyInput('amount', suggested[mode], { class: 'amount-input' });
    const amountField = field('Amount (₹)', amount);
    const splitFields = h('div', {},
      h('div', { class: 'grid-2' }, field('Principal (₹)', moneyInput('principal', '')), field('Interest (₹)', moneyInput('interest', ''))),
      field('Fees / charges (₹)', moneyInput('fee', '')),
    );
    const help = h('p', { class: 'faint', style: 'margin:-6px 0 14px' });
    const texts = {
      interest: 'Goes to interest only. The loan balance stays the same.',
      principal: `Reduces the loan. Left to repay now: ${fmt(l.outstanding_paise)}.`,
      split: 'Take the split from the bank statement.' + (l.repayment_type === 'emi' && l.interest_rate === null ? ' (Add the interest rate to the loan and the app will split EMIs for you.)' : ''),
      total: l.repayment_type === 'card' ? 'Reduces the card balance by this amount.' : `The app works out this month's interest at ${rate(l.interest_rate)}; the rest reduces the loan.`,
    };
    const sync = () => {
      splitFields.hidden = mode !== 'split';
      amountField.hidden = mode === 'split';
      help.textContent = texts[mode];
      if (mode !== 'split' && !amount.value) amount.value = suggested[mode] || '';
    };
    const picker = modes.length > 1 ? segmented(modes, mode, (v) => { mode = v; amount.value = suggested[v] || ''; sync(); }) : null;
    sync();
    const form = formShell(async (fd) => {
      const body = { paid_on: fd.get('paid_on'), member_id: fd.get('member_id'), notes: fd.get('notes') };
      if (mode === 'split') Object.assign(body, { principal: fd.get('principal'), interest: fd.get('interest'), fee: fd.get('fee') });
      else if (mode === 'principal') body.principal = fd.get('amount');
      else body.amount = fd.get('amount');
      const r = await post(`loans/${l.id}/payments`, body);
      dialog.close();
      const p = r.payment;
      toast(`Saved — ${fmt(p.principal_paise)} principal, ${fmt(p.interest_paise)} interest`);
      render();
    }, 'Save payment',
      picker, help, amountField, splitFields,
      h('div', { class: 'grid-2' },
        field('Paid on', input('paid_on', todayIso(), { type: 'date', required: true })),
        field('Paid by', memberSelect()),
      ),
      field('Note', input('notes', '', { maxlength: 500, placeholder: 'Optional' })),
    );
    openDialog(`Payment — ${l.name}`, form);
  }

  async function openPayments(l) {
    const rows = await get(`loans/${l.id}/payments`);
    const body = h('div', {});
    if (!rows.length) body.append(h('p', { class: 'empty', text: 'No payments recorded yet.' }));
    else {
      const sum = (k) => rows.reduce((n, r) => n + r[k], 0);
      body.append(h('p', { class: 'muted small', text: `Total principal ${fmt(sum('principal_paise'))} · interest ${fmt(sum('interest_paise'))} · fees ${fmt(sum('fee_paise'))}` }));
      body.append(h('ul', { class: 'list' }, rows.map((r) => h('li', {},
        h('div', { class: 'main' },
          h('div', { class: 't', text: fmt(r.principal_paise + r.interest_paise + r.fee_paise) }),
          h('div', { class: 's', text: `${dayLabel(r.paid_on)} · principal ${fmt(r.principal_paise)} · interest ${fmt(r.interest_paise)}${r.fee_paise ? ` · fees ${fmt(r.fee_paise)}` : ''} · ${r.member_name}` }),
        ),
        h('button', {
          class: 'btn small danger', type: 'button', text: 'Undo',
          onclick: async () => {
            if (!confirm('Undo this payment? Its principal goes back on the loan.')) return;
            await post(`payments/${r.id}/delete`);
            toast('Payment removed');
            dialog.close();
            render();
          },
        }),
      ))));
    }
    openDialog(`Payments — ${l.name}`, body);
  }

  // ---------- goals ----------
  const GOAL_KIND = {
    emergency: 'Emergency fund', loan_closure: 'Close a loan', home_prepayment: 'Home loan prepayment', vacation: 'Vacation',
    education: "Children's education", car: 'Car', investment: 'Investment', custom: 'Other',
  };

  function goalTargetText(g) {
    return g.target_min_paise ? `${fmt(g.target_min_paise)}–${fmt(g.target_now_paise)}` : fmt(g.target_now_paise);
  }
  function goalChip(g) {
    const map = { done: ['good', 'Done'], on_track: ['info', 'On track'], behind: ['warn', 'Behind'], no_plan: ['', 'No monthly amount'] };
    const [cls, text] = map[g.state] || ['', g.state];
    return h('span', { class: `chip ${cls}`, text: g.kind === 'emergency' && g.reached_min && g.state !== 'done' ? 'Minimum reached' : text });
  }
  function progressBar(g) {
    const bar = h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(g.progress_pct) },
      h('span', { style: `width:${Math.max(g.progress_pct, g.current_paise > 0 ? 2 : 0)}%` }));
    if (g.target_min_paise && g.target_now_paise) {
      bar.append(h('i', { class: 'mark', style: `left:${Math.round((g.target_min_paise / g.target_now_paise) * 100)}%`, title: 'Lower target' }));
    }
    return bar;
  }

  async function viewGoals() {
    const goals = await get('goals');
    const root = h('div', { class: 'stack' });
    const ef = goals.find((g) => g.kind === 'emergency' && g.status === 'active');
    root.append(h('button', { class: 'btn primary', type: 'button', onclick: () => openGoalForm(), text: '+ New goal' }));
    if (!ef) {
      root.append(h('section', { class: 'card goal-card emergency' },
        h('h2', { text: 'Emergency fund' }),
        h('p', { class: 'muted', style: 'margin:6px 0 14px', text: 'Money kept aside for a medical bill, a job gap or a repair — so an emergency never becomes a new loan. Loan plans never use it.' }),
        h('button', { class: 'btn primary', type: 'button', text: 'Set up emergency fund', onclick: () => openGoalForm(null, 'emergency') }),
      ));
    }
    root.append(h('div', { class: 'loan-grid' }, goals.map(goalCard)));
    if (!goals.length) root.append(h('p', { class: 'faint', text: 'Goals can be savings (vacation, education, car) or closing a loan. A loan goal moves by itself when you record principal payments.' }));
    return root;
  }

  function goalCard(g) {
    const facts = [];
    if (g.kind === 'loan_closure') {
      facts.push(['Loan left', g.loan ? fmt(g.loan.outstanding_paise) : '—']);
      facts.push(['Paid down', fmt(g.current_paise)]);
      facts.push(['Expected to end', g.projected_month ? monthLabel(g.projected_month) : g.state === 'done' ? 'Closed' : 'Never at today’s payments']);
      facts.push(['Extra per month', g.monthly_paise ? fmt(g.monthly_paise) : 'None']);
    } else {
      facts.push(['Still needed', fmt(g.remaining_paise)]);
      facts.push(['Per month', g.monthly_paise ? fmt(g.monthly_paise) : 'Not set']);
      facts.push(['Expected by', g.state === 'done' ? 'Reached' : g.projected_month ? monthLabel(g.projected_month) : '—']);
      facts.push(['Target date', g.target_date ? fullDate(g.target_date) : '—']);
    }
    const notes = [];
    if (g.required_monthly_paise && g.state === 'behind') {
      notes.push(h('p', { class: 'notice', text: `To reach it by ${fullDate(g.target_date)}, put in about ${fmt(g.required_monthly_paise)} a month.` }));
    }
    if (g.kind === 'emergency') notes.push(h('p', { class: 'faint', text: 'Loan plans never touch this money.' }));
    if (g.kind === 'loan_closure') notes.push(h('p', { class: 'faint', text: 'Moves when you record a principal payment on the loan. “Expected to end” assumes freed EMIs and the extra go to this loan first.' }));

    return h('article', { class: `card goal-card${g.kind === 'emergency' ? ' emergency' : ''}` },
      h('div', { class: 'row between' },
        h('div', {}, h('h3', { text: g.name }), h('p', { class: 'faint', text: `${GOAL_KIND[g.kind] || g.kind}${g.visibility === 'private' ? ' · private' : ''}` })),
        goalChip(g),
      ),
      h('div', { class: 'amounts' }, h('span', { class: 'big-money', style: 'font-size:28px', text: fmt(g.current_paise) }), h('span', { class: 'of', text: `of ${goalTargetText(g)} · ${g.progress_pct}%` })),
      progressBar(g),
      h('dl', { class: 'meta' }, facts.map(([k, v]) => h('div', {}, h('dt', { text: k }), h('dd', { text: v })))),
      notes.length ? h('div', { class: 'stack', style: 'gap:8px;margin-bottom:12px' }, notes) : null,
      h('div', { class: 'row' },
        g.kind !== 'loan_closure' && g.status === 'active' ? h('button', { class: 'btn primary small', type: 'button', text: 'Add money', onclick: () => openGoalEntry(g, 'in') }) : null,
        g.kind !== 'loan_closure' && g.current_paise > 0 ? h('button', { class: 'btn small', type: 'button', text: 'Take out', onclick: () => openGoalEntry(g, 'out') }) : null,
        g.kind !== 'loan_closure' ? h('button', { class: 'btn small', type: 'button', text: 'History', onclick: () => openGoalHistory(g) }) : null,
        h('button', { class: 'btn small', type: 'button', text: 'Edit', onclick: () => openGoalForm(g) }),
      ),
    );
  }

  async function openGoalForm(item, presetKind) {
    const loans = (await get('loans')).filter((l) => l.group !== 'closed');
    let kind = item ? item.kind : (presetKind || 'custom');
    const kindSelect = select('kind', state.meta.goal_kinds.map((k) => [k, GOAL_KIND[k]]), kind);
    if (item) kindSelect.disabled = true;
    const loanField = field('Which loan', select('loan_id', loans.map((l) => [String(l.id), `${l.name} — ${fmt(l.outstanding_paise)}`]), item && item.loan_id ? String(item.loan_id) : ''));
    if (item) loanField.querySelector('select').disabled = true;
    const target = field('Target amount (₹)', moneyInput('target', item ? toInput(item.target_paise) : (kind === 'emergency' ? '75000' : '')));
    const targetMin = field('Lower target (₹)', moneyInput('target_min', item ? toInput(item.target_min_paise) : (kind === 'emergency' ? '50000' : '')), 'Optional — the “at least” amount');
    const name = input('name', item ? item.name : (kind === 'emergency' ? 'Emergency fund' : ''), { maxlength: 80, required: true });
    const monthlyLabel = h('span', {});
    const sync = () => {
      kind = kindSelect.value;
      loanField.hidden = kind !== 'loan_closure';
      target.hidden = kind === 'loan_closure';
      targetMin.hidden = kind !== 'emergency';
      monthlyLabel.textContent = kind === 'loan_closure' ? 'Extra per month for this loan (₹)' : 'Put in each month (₹)';
      if (!item && !name.value && kind !== 'custom') name.value = GOAL_KIND[kind];
    };
    kindSelect.addEventListener('change', sync);
    const monthly = h('label', { class: 'field' }, monthlyLabel, moneyInput('monthly', item ? toInput(item.monthly_paise) : ''));
    sync();
    const form = formShell(async (fd) => {
      const body = {
        kind, name: fd.get('name'), target: fd.get('target'), target_min: fd.get('target_min'), loan_id: fd.get('loan_id'),
        target_date: fd.get('target_date'), monthly: fd.get('monthly'), notes: fd.get('notes'), visibility: visibilityOf(fd),
        status: fd.get('done') ? 'done' : 'active', member_id: state.user.id,
      };
      if (item) await post(`goals/${item.id}/update`, body);
      else await post('goals', body);
      dialog.close();
      toast('Saved');
      render();
    }, item ? 'Save changes' : 'Create goal',
      field('Type', kindSelect), field('Name', name), loanField,
      h('div', { class: 'grid-2' }, target, targetMin),
      h('div', { class: 'grid-2' }, monthly, field('Target date', input('target_date', item ? item.target_date || '' : '', { type: 'date' }), 'Optional')),
      field('Note', input('notes', item ? item.notes : '', { maxlength: 500, placeholder: 'Optional' })),
      item ? check('done', 'Mark as done', item.status === 'done') : null,
      privateBox(item),
    );
    if (item) form.append(deleteButton(`goals/${item.id}/delete`));
    openDialog(item ? `Edit ${item.name}` : 'New goal', form);
  }

  function openGoalEntry(g, direction) {
    const form = formShell(async (fd) => {
      await post(`goals/${g.id}/entries`, { direction, amount: fd.get('amount'), entry_on: fd.get('entry_on'), member_id: fd.get('member_id'), notes: fd.get('notes') });
      dialog.close();
      toast(direction === 'in' ? 'Added' : 'Taken out');
      render();
    }, direction === 'in' ? 'Add money' : 'Take out',
      h('p', { class: 'muted small', style: 'margin-bottom:12px', text: `${g.name} holds ${fmt(g.current_paise)}.` }),
      field('Amount (₹)', moneyInput('amount', direction === 'in' && g.monthly_paise ? toInput(g.monthly_paise) : '', { class: 'amount-input', required: true })),
      h('div', { class: 'grid-2' }, field('Date', input('entry_on', todayIso(), { type: 'date', required: true })), field(direction === 'in' ? 'Put in by' : 'Taken by', memberSelect())),
      field(direction === 'in' ? 'Note' : 'What for?', input('notes', '', { maxlength: 500, placeholder: direction === 'in' ? 'Optional' : 'e.g. hospital bill' })),
    );
    openDialog(direction === 'in' ? `Add to ${g.name}` : `Take out of ${g.name}`, form);
  }

  async function openGoalHistory(g) {
    const rows = await get(`goals/${g.id}/entries`);
    const body = h('div', {});
    if (!rows.length) body.append(h('p', { class: 'empty', text: 'Nothing added yet.' }));
    else {
      body.append(h('ul', { class: 'list' }, rows.map((r) => h('li', {},
        h('span', { class: 'icon', text: r.direction === 'in' ? '＋' : '－' }),
        h('div', { class: 'main' }, h('div', { class: 't', text: `${r.direction === 'in' ? 'Added' : 'Taken out'} ${fmt(r.amount_paise)}` }), h('div', { class: 's', text: [dayLabel(r.entry_on), r.member_name, r.notes || null].filter(Boolean).join(' · ') })),
        h('button', {
          class: 'btn small danger', type: 'button', text: 'Undo',
          onclick: async () => {
            if (!confirm('Undo this entry?')) return;
            try {
              await post(`goal-entries/${r.id}/delete`);
              toast('Removed');
              dialog.close();
              render();
            } catch (e) { toast(e.message); }
          },
        }),
      ))));
    }
    openDialog(`History — ${g.name}`, body);
  }

  // ---------- plan ----------
  const STRATEGY = {
    none: "Today's payments only",
    avalanche: 'Costliest loan first',
    snowball: 'Smallest loan first',
    custom: 'My choice first',
  };

  async function viewPlan() {
    const loans = await get('loans');
    const active = loans.filter((l) => l.group !== 'closed');
    const root = h('div', { class: 'stack' });
    root.append(h('p', { class: 'notice info', text: 'Planning never changes your real entries. Try as many numbers as you like.' }));
    root.append(aiCard());
    if (!active.length) {
      root.append(h('div', { class: 'card empty', text: 'Add your loans first (Loans tab), then come back to plan.' }));
      return root;
    }
    root.append(payoffCard(active), refinanceCard(active));
    return root;
  }

  // ---------- AI ----------
  const AI_QUESTIONS = [
    'Is mahine hum safely kitna bacha sakte hain?',
    'Gold loan kab tak band ho sakta hai?',
    'Agar ₹30,000 incentive aaye to kahan lagayein?',
    'Hamara cash flow tight kyun hai?',
    'Agle 6 mahine kaise dikhte hain?',
    'Debt-free hone ka plan banao.',
  ];

  function aiCard() {
    const card = h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: 'Ask about your money' }), h('span', { class: 'chip info', text: 'AI' })),
    );
    if (!state.meta.ai_enabled) {
      card.append(h('p', { class: 'muted small', text: 'AI is off. Add gemini_api_key to finance-config.php on the server to switch it on.' }));
      return card;
    }
    card.append(h('p', { class: 'muted small', style: 'margin-bottom:12px', text: 'The app does the maths; the AI explains it. It cannot change anything, and names and notes are not sent.' }));
    const answerBox = h('div', { class: 'stack', style: 'margin-top:14px' });
    const q = h('textarea', { name: 'question', maxlength: 1000, rows: 2, placeholder: 'Poochho — e.g. gold loan kab band hoga?', 'aria-label': 'Your question' });
    const chips = h('div', { class: 'chips', style: 'margin-bottom:12px' }, AI_QUESTIONS.map((text) => h('button', { type: 'button', text, onclick: () => { q.value = text; q.focus(); } })));
    const form = formShell(async () => {
      if (!q.value.trim()) throw new Error('Type a question first.');
      answerBox.replaceChildren(h('p', { class: 'loading', text: 'Working it out…' }));
      try {
        const r = await post('ai/ask', { question: q.value.trim() });
        answerBox.replaceChildren(aiAnswer(r.question, r.answer));
      } catch (e) {
        answerBox.replaceChildren();
        throw e;
      }
    }, 'Ask', chips, h('label', { class: 'field' }, q));
    card.append(form, answerBox);
    const past = h('details', { style: 'margin-top:12px' }, h('summary', { class: 'small', text: 'Earlier questions' }));
    past.addEventListener('toggle', async () => {
      if (!past.open || past.dataset.loaded) return;
      past.dataset.loaded = '1';
      const rows = await get('ai/history');
      past.append(rows.length ? h('div', { class: 'stack', style: 'margin-top:10px' }, rows.map((r) => aiAnswer(r.question, r.answer, r.created_at))) : h('p', { class: 'faint', text: 'None yet.' }));
    });
    card.append(past);
    return card;
  }

  function aiAnswer(question, a, when) {
    const section = (title, items) => (items && items.length ? h('div', {}, h('h3', { style: 'margin:10px 0 4px', text: title }), h('ul', { style: 'margin:0;padding-left:20px' }, items.map((t) => h('li', { text: t })))) : null);
    return h('article', { class: 'card', style: 'background:var(--surface-2);box-shadow:none' },
      h('p', { class: 'faint', text: when ? `${question} · ${new Date(when.replace(' ', 'T')).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : question }),
      h('p', { style: 'font-weight:650;margin-top:6px', text: a.short_answer }),
      section('Calculated facts', a.facts),
      section('Assumptions', a.assumptions),
      section('Estimates', a.estimates),
      section('Suggestions', a.suggestions),
    );
  }

  function payoffCard(active) {
    const card = h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: 'Pay off loans faster' })),
      h('p', { class: 'muted small', style: 'margin-bottom:14px', text: 'Keeps your total loan payment each month the same. When a loan ends, its EMI moves to the next loan instead of being spent. Extra money goes on top.' }),
    );
    const lumps = h('div', {});
    const addLump = (v = {}) => {
      const row = h('div', { class: 'lump-row' },
        field('Amount (₹)', moneyInput('lump_amount', v.amount || '')),
        field('First month', input('lump_month', v.month || addMonthsJs(thisMonth(), 1), { type: 'month' })),
        field('Every … months', input('lump_every', v.every ?? '3', { inputmode: 'numeric' }), '0 = once'),
        field('How many times', input('lump_times', v.times ?? '4', { inputmode: 'numeric' })),
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Remove', text: '✕', onclick: () => row.remove() }),
      );
      lumps.append(row);
    };
    const firstPick = select('first', [['', 'No — let the method decide'], ...active.map((l) => [String(l.id), l.name])], state.planFirst || '');
    const results = h('div', { class: 'stack', style: 'margin-top:16px' });

    const form = formShell(async (fd) => {
      const rows = [...lumps.querySelectorAll('.lump-row')];
      const body = {
        extra_monthly: fd.get('extra_monthly'),
        lumps: rows.map((r) => ({
          amount: r.querySelector('[name=lump_amount]').value,
          month: r.querySelector('[name=lump_month]').value,
          every_months: r.querySelector('[name=lump_every]').value || '0',
          times: r.querySelector('[name=lump_times]').value || '1',
        })).filter((l) => l.amount.trim() !== ''),
        order: fd.get('first') ? [Number(fd.get('first'))] : [],
      };
      state.planFirst = fd.get('first');
      const r = await post('plan/simulate', body);
      results.replaceChildren(...planResults(r));
    }, 'Show plan',
      field('Extra every month (₹)', moneyInput('extra_monthly', ''), 'On top of today’s EMIs. Leave empty for none.'),
      h('div', { class: 'field' }, h('span', { text: 'Extra income expected (incentive, CRM…)' }), lumps,
        h('button', { class: 'btn small', type: 'button', text: '+ Add expected income', onclick: () => addLump() })),
      field('Clear one loan first?', firstPick),
    );
    card.append(form, results);
    return card;
  }

  function addMonthsJs(ym, n) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + n, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  const when = (ym) => (ym ? monthLabel(ym) : 'Never');

  function planResults(r) {
    const out = [];
    if (r.left_out.length) {
      out.push(h('p', { class: 'notice', text: `Left out (missing numbers): ${r.left_out.map((l) => `${l.name} — ${l.reason}`).join(' ')}` }));
    }
    const approx = r.loans.filter((l) => l.approx).map((l) => l.name);
    if (approx.length) {
      out.push(h('p', { class: 'notice info', text: `No interest rate for ${approx.join(', ')}: EMIs are followed as scheduled, their interest is not counted, and they are ranked last for extra money. Credit cards usually charge far more than 18% — add the card's rate for a truer plan.` }));
    }
    const names = Object.keys(r.plans);
    const table = h('table', { class: 'compare' },
      h('thead', {}, h('tr', {}, h('th', { text: 'Method' }), h('th', { class: 'num', text: 'Gold loans closed' }), h('th', { class: 'num', text: 'All loans done' }), h('th', { class: 'num', text: 'Interest paid*' }))),
      h('tbody', {}, names.map((n) => {
        const p = r.plans[n];
        return h('tr', {},
          h('th', { text: STRATEGY[n] }),
          h('td', { class: 'num', text: when(p.gold_closed_month) }),
          h('td', { class: 'num', text: when(p.debt_free_month) }),
          h('td', { class: 'num', text: fmt0(p.total_interest_paise) }),
        );
      })),
    );
    out.push(h('div', { class: 'table-wrap' }, table));
    const base = r.plans.none;
    const best = names.filter((n) => n !== 'none').map((n) => r.plans[n]).sort((a, b) => a.total_interest_paise - b.total_interest_paise)[0];
    out.push(h('p', { class: 'faint', text: `* Interest on loans whose rate is known, from ${monthLabel(r.start_month)} until each loan ends (or 40 years). Monthly loan budget: ${fmt(best.monthly_budget_paise)}.${base.debt_free_month === null ? " On today's payments alone, interest-only loans never end." : ''}` }));

    const canvas = h('canvas', { role: 'img', 'aria-label': 'Total loans left over time for each method' });
    out.push(h('div', { class: 'chart-box tall' }, canvas));
    requestAnimationFrame(() => drawPlanChart(canvas, r));

    const pick = h('div', {});
    const showLoans = (n) => {
      const p = r.plans[n];
      pick.replaceChildren(h('div', { class: 'table-wrap' }, h('table', { class: 'compare' },
        h('thead', {}, h('tr', {}, h('th', { text: 'Loan' }), h('th', { class: 'num', text: 'Ends' }), h('th', { class: 'num', text: 'Interest' }))),
        h('tbody', {}, p.loans.slice().sort((a, b) => (a.close_month || '9999').localeCompare(b.close_month || '9999')).map((l) => h('tr', {},
          h('th', { text: l.name }),
          h('td', { class: 'num', text: when(l.close_month) }),
          h('td', { class: 'num', text: l.interest_paise === null ? 'rate not entered' : fmt0(l.interest_paise) }),
        ))),
      )));
    };
    const initial = names.includes('custom') ? 'custom' : 'avalanche';
    out.push(h('h3', { text: 'When each loan ends' }), segmented(names.map((n) => [n, STRATEGY[n].replace(' first', '').replace("Today's payments only", 'Today')]), initial, showLoans), pick);
    showLoans(initial);
    return out;
  }

  function drawPlanChart(canvas, r) {
    if (!window.Chart || !canvas.isConnected) return;
    if (state.planChart) state.planChart.destroy();
    const names = Object.keys(r.plans);
    const longest = Math.max(...names.map((n) => r.plans[n].timeline.length));
    const months = Math.min(longest, 240);
    const labels = Array.from({ length: months }, (_, i) => addMonthsJs(r.start_month, i));
    const colors = { none: '#94a3b8', avalanche: '#0e9f8e', snowball: '#3b82f6', custom: '#f59e0b' };
    state.planChart = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.map((m) => new Date(m + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })),
        datasets: names.map((n) => ({
          label: STRATEGY[n],
          data: labels.map((_, i) => { const t = r.plans[n].timeline[i]; return t ? t.outstanding_paise / 100 : 0; }),
          borderColor: colors[n], backgroundColor: colors[n], pointRadius: 0, borderWidth: n === 'none' ? 1.5 : 2.5, borderDash: n === 'none' ? [5, 4] : [],
        })),
      },
      options: {
        maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false },
        scales: {
          y: { ticks: { callback: (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(v % 100000 ? 1 : 0)}L` : `₹${rupee.format(v)}`) } },
          x: { ticks: { maxTicksLimit: 8 } },
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12 } },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${fmt(Math.round(c.parsed.y * 100))}` } },
        },
      },
    });
  }

  function refinanceCard(active) {
    const withRate = active.filter((l) => l.interest_rate !== null);
    const card = h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: 'Replace a loan with a new one?' })),
      h('p', { class: 'muted small', style: 'margin-bottom:14px', text: 'For example, a personal loan to close the gold loan. Enter the offer exactly as the bank gives it. The fair comparison pays the same monthly amount into the loans you have now.' }),
    );
    if (!withRate.length) {
      card.append(h('p', { class: 'empty', text: 'Add interest rates to your loans to use this.' }));
      return card;
    }
    const picks = h('div', { class: 'loan-picks' }, withRate.map((l) => h('label', { class: 'check' },
      h('input', { type: 'checkbox', name: 'loan', value: String(l.id), checked: l.loan_type === 'gold' }),
      h('span', { text: `${l.name} — ${fmt(l.outstanding_paise)} at ${rate(l.interest_rate)}` }),
    )));
    const results = h('div', { style: 'margin-top:16px' });
    const form = formShell(async (fd) => {
      const r = await post('plan/refinance', {
        loan_ids: fd.getAll('loan').map(Number), new_rate: fd.get('new_rate'), tenure_months: fd.get('tenure_months'),
        new_amount: fd.get('new_amount'), processing_fee: fd.get('processing_fee'), foreclosure_charges: fd.get('foreclosure_charges'), other_charges: fd.get('other_charges'),
      });
      results.replaceChildren(...refinanceResults(r));
    }, 'Compare',
      h('div', { class: 'field' }, h('span', { text: 'Loans to close' }), picks),
      h('div', { class: 'grid-2' },
        field('Offered interest % per year', input('new_rate', '', { inputmode: 'decimal', required: true })),
        field('Tenure (months)', input('tenure_months', '36', { inputmode: 'numeric', required: true })),
      ),
      h('div', { class: 'grid-2' },
        field('Processing fee (₹)', moneyInput('processing_fee', '')),
        field('Closing / foreclosure charges (₹)', moneyInput('foreclosure_charges', '')),
      ),
      h('div', { class: 'grid-2' },
        field('Other charges (₹)', moneyInput('other_charges', ''), 'Insurance, stamp duty…'),
        field('New loan amount (₹)', moneyInput('new_amount', ''), 'Empty = exactly what it closes'),
      ),
    );
    card.append(form, results);
    return card;
  }

  function refinanceResults(r) {
    const same = r.same_payment_on_current;
    const nl = r.new_loan;
    const rows = [
      ['Monthly payment', fmt0(r.current.monthly_paise), fmt0(same.monthly_paise), fmt0(nl.emi_paise)],
      ['Time to clear', 'Never (interest only)', same.months ? `${same.months} months` : 'Over 40 years', `${nl.months} months`],
      ['Interest', `${fmt0(r.current.interest_only_for_tenure_paise)} in ${nl.months} months`, fmt0(same.interest_paise), fmt0(nl.interest_paise)],
      ['Charges', '—', '—', fmt0(nl.charges_paise)],
      ['Total cost', `${fmt0(r.current.interest_only_for_tenure_paise)} + ${fmt0(r.current.still_owed_after_tenure_paise)} still owed`, fmt0(same.total_cost_paise), fmt0(nl.total_cost_paise)],
    ];
    const table = h('table', { class: 'compare' },
      h('thead', {}, h('tr', {}, h('th', {}), h('th', { class: 'num', text: 'Keep as now' }), h('th', { class: 'num', text: 'Same EMI into current loans' }), h('th', { class: 'num', text: 'New loan' }))),
      h('tbody', {}, rows.map((row) => h('tr', {}, h('th', { text: row[0] }), row.slice(1).map((c) => h('td', { class: 'num', text: c }))))),
    );
    const diff = r.difference_paise;
    const out = [h('div', { class: 'table-wrap' }, table)];
    out.push(h('p', { class: `notice${diff < 0 ? ' info' : ''}`, text: diff < 0
      ? `On these numbers the new loan costs ${fmt0(-diff)} less than paying the same ${fmt0(nl.emi_paise)} a month into the loans you have now.`
      : `On these numbers the new loan costs ${fmt0(diff)} more than paying the same ${fmt0(nl.emi_paise)} a month into the loans you have now.` }));
    out.push(h('p', { class: 'faint', text: `Monthly outgo changes by ${r.monthly_change_paise >= 0 ? '+' : ''}${fmt0(r.monthly_change_paise)} compared with today.${nl.cash_in_hand_paise < 0 ? ` You would need ${fmt0(-nl.cash_in_hand_paise)} from your pocket for the fees.` : nl.cash_in_hand_paise > 0 ? ` ${fmt0(nl.cash_in_hand_paise)} would be left in hand.` : ''} Check the bank's own EMI and charges before deciding; this uses only the numbers you entered.` }));
    return out;
  }

  // ---------- settings ----------
  async function viewSettings() {
    const c = await get('contributions');
    const root = h('div', { class: 'stack' });

    const pool = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Family pool' })),
      h('p', { class: 'muted small', style: 'margin-bottom:12px', text: 'What each person puts in every month for the house and loans. This is separate from salary.' }));
    pool.append(h('ul', { class: 'list' }, c.members.map((m) => h('li', {},
      h('div', { class: 'main' }, h('div', { class: 't', text: m.name })),
      h('div', { class: 'money', text: c.current[m.id] !== undefined ? `${fmt(c.current[m.id])}/mo` : 'Not set' }),
    ))));
    const first = `${thisMonth()}-01`;
    pool.append(formShell(async (fd) => {
      await post('contributions', { member_id: fd.get('member_id'), amount: fd.get('amount'), effective_from: fd.get('effective_from') });
      toast('Saved');
      render();
    }, 'Set contribution',
      h('div', { class: 'grid-2', style: 'margin-top:14px' }, field('Person', memberSelect()), field('Amount per month (₹)', moneyInput('amount', '', { required: true }))),
      field('From', input('effective_from', first, { type: 'date', required: true }), 'Change it any time; old months keep the old amount.'),
    ));
    if (c.history.length) {
      pool.append(h('details', { style: 'margin-top:12px' }, h('summary', { class: 'small', text: 'History' }),
        h('ul', { class: 'list' }, c.history.map((r) => h('li', {},
          h('div', { class: 'main' }, h('div', { class: 't', text: `${r.member_name} — ${fmt(r.amount_paise)}` }), h('div', { class: 's', text: `from ${dayLabel(r.effective_from)}` })),
          h('button', {
            class: 'btn small danger', type: 'button', text: 'Remove',
            onclick: async () => {
              if (!confirm('Remove this contribution entry?')) return;
              await post(`contributions/${r.id}/delete`);
              render();
            },
          }),
        )))));
    }
    root.append(pool);

    root.append(h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Change password' })),
      formShell(async (fd) => {
        if (fd.get('new') !== fd.get('confirm')) throw new Error('The two new passwords do not match.');
        await post('password', { current: fd.get('current'), new: fd.get('new') });
        toast('Password changed. Other devices are signed out.');
        render();
      }, 'Change password',
        field('Current password', input('current', '', { type: 'password', autocomplete: 'current-password', required: true })),
        field('New password', input('new', '', { type: 'password', autocomplete: 'new-password', required: true }), 'At least 10 characters'),
        field('New password again', input('confirm', '', { type: 'password', autocomplete: 'new-password', required: true })),
      )));

    root.append(h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: 'Account' })),
      h('p', { class: 'muted small', style: 'margin-bottom:12px', text: `Signed in as ${state.user.name} (${state.user.username}). Family: ${state.members.map((m) => m.name).join(', ')}.` }),
      h('button', {
        class: 'btn block', type: 'button', text: 'Sign out',
        onclick: async () => {
          await post('logout');
          state.user = null;
          showLogin('Signed out.');
        },
      }),
    ));
    root.append(h('p', { class: 'faint', text: 'Coming next: AI suggestions on top of these numbers.' }));
    return root;
  }

  boot();
})();
