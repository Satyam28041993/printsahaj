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
    state.view = ['dashboard', 'expenses', 'income', 'loans', 'settings'].includes(view) ? view : 'dashboard';
    for (const a of document.querySelectorAll('.nav a')) {
      if (a.dataset.view === state.view) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
    render();
  }

  async function render() {
    if (!state.user) return;
    const titles = { dashboard: 'Home', expenses: 'Spending', income: 'Income', loans: 'Loans', settings: 'Settings' };
    $('#view-title').textContent = titles[state.view];
    $('#month').hidden = state.view === 'settings' || state.view === 'loans';
    const main = $('#main');
    main.replaceChildren(h('div', { class: 'loading', text: 'Loading…' }));
    try {
      const views = { dashboard: viewDashboard, expenses: viewExpenses, income: viewIncome, loans: viewLoans, settings: viewSettings };
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
    ));

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
    root.append(h('p', { class: 'faint', text: 'Coming next: loan payoff plan (which loan to clear first), “what if” planner for incentives and refinancing, emergency fund and goals, then AI suggestions.' }));
    return root;
  }

  boot();
})();
