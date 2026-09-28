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

  // FAB: only shown on Home and Spending; draggable to a corner on mobile
  // (desktop keeps the fixed bottom-right spot from the .fab CSS rule).
  const fab = $('#fab');
  const FAB_CORNERS = {
    tl: { top: 'calc(16px + env(safe-area-inset-top))', left: '16px', right: 'auto', bottom: 'auto' },
    tr: { top: 'calc(16px + env(safe-area-inset-top))', right: '16px', left: 'auto', bottom: 'auto' },
    bl: { bottom: 'calc(84px + env(safe-area-inset-bottom))', left: '16px', right: 'auto', top: 'auto' },
    br: { bottom: 'calc(84px + env(safe-area-inset-bottom))', right: '16px', left: 'auto', top: 'auto' },
  };
  const fabIsMobile = () => window.matchMedia('(max-width: 899px)').matches;
  const applyFabCorner = (corner) => Object.assign(fab.style, FAB_CORNERS[corner] || FAB_CORNERS.br);
  const loadFabCorner = () => { try { return localStorage.getItem('ff-fab-corner') || 'br'; } catch { return 'br'; } };
  const saveFabCorner = (corner) => { try { localStorage.setItem('ff-fab-corner', corner); } catch { /* private mode etc. */ } };
  if (fabIsMobile()) applyFabCorner(loadFabCorner());
  window.addEventListener('resize', () => {
    if (fabIsMobile()) applyFabCorner(loadFabCorner());
    else fab.removeAttribute('style');
  });

  let fabDragging = false, fabMoved = false, fabSuppressClick = false;
  let fabStartX = 0, fabStartY = 0, fabStartLeft = 0, fabStartTop = 0;
  fab.addEventListener('pointerdown', (e) => {
    if (!fabIsMobile()) return;
    fabDragging = true;
    fabMoved = false;
    const r = fab.getBoundingClientRect();
    fabStartX = e.clientX;
    fabStartY = e.clientY;
    fabStartLeft = r.left;
    fabStartTop = r.top;
    fab.style.transition = 'none';
    fab.setPointerCapture(e.pointerId);
  });
  fab.addEventListener('pointermove', (e) => {
    if (!fabDragging) return;
    const dx = e.clientX - fabStartX;
    const dy = e.clientY - fabStartY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) fabMoved = true;
    if (!fabMoved) return;
    const w = fab.offsetWidth, hgt = fab.offsetHeight;
    const left = Math.max(6, Math.min(window.innerWidth - w - 6, fabStartLeft + dx));
    const top = Math.max(6, Math.min(window.innerHeight - hgt - 6, fabStartTop + dy));
    Object.assign(fab.style, { left: `${left}px`, top: `${top}px`, right: 'auto', bottom: 'auto' });
  });
  fab.addEventListener('pointerup', () => {
    if (!fabDragging) return;
    fabDragging = false;
    fab.style.transition = '';
    if (!fabMoved) return;
    fabSuppressClick = true;
    const r = fab.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const corner = (cy < window.innerHeight / 2 ? 't' : 'b') + (cx < window.innerWidth / 2 ? 'l' : 'r');
    applyFabCorner(corner);
    saveFabCorner(corner);
  });
  fab.addEventListener('click', (e) => {
    if (fabSuppressClick) {
      fabSuppressClick = false;
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    openExpenseForm();
  });

  function route() {
    const view = location.hash.replace('#', '') || 'dashboard';
    state.view = ['dashboard', 'expenses', 'income', 'loans', 'goals', 'plan', 'settings'].includes(view) ? view : 'dashboard';
    for (const a of document.querySelectorAll('.nav a')) {
      if (a.dataset.view === state.view) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
    fab.hidden = !['dashboard', 'expenses'].includes(state.view);
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
    const loansById = Object.fromEntries(d.loans.map((l) => [l.id, l]));
    grid.append(upcomingCard(d.upcoming, loansById), spendingCard(d.expenses_by_category, d.expenses_paise));
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
    if (u.missed) return h('span', { class: 'chip bad', text: 'Missed' });
    const today = todayIso();
    // The app only knows what was recorded; the bill may be paid already.
    if (u.due_on < today) return h('span', { class: 'chip warn', text: 'Not recorded' });
    const days = Math.round((new Date(u.due_on) - new Date(today)) / 86400000);
    return h('span', { class: `chip ${days <= 5 ? 'warn' : 'info'}`, text: days === 0 ? 'Due today' : `In ${days} days` });
  }

  function upcomingCard(upcoming, loansById) {
    const card = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Payments this month' })));
    if (!upcoming.length) {
      card.append(h('p', { class: 'empty', text: 'No due dates yet. Add a due day to your loans to see them here.' }));
      return card;
    }
    const mark = async (loanId, skip) => {
      await post(`loans/${loanId}/${skip ? 'skip' : 'unskip'}`, { month: state.month });
      toast(skip ? 'Marked not paid' : 'Undone');
      render();
    };
    card.append(h('ul', { class: 'list' }, upcoming.map((u) => {
      const actions = [];
      if (!u.paid && !u.missed) {
        actions.push(
          h('button', { class: 'btn small primary', type: 'button', text: 'Paid', onclick: () => { const l = loansById[u.loan_id]; if (l) openPaymentForm(l); } }),
          h('button', { class: 'btn small', type: 'button', text: 'Not paid', onclick: () => mark(u.loan_id, true) }),
        );
      } else if (u.missed) {
        actions.push(h('button', { class: 'btn small', type: 'button', text: 'Undo', onclick: () => mark(u.loan_id, false) }));
      }
      return h('li', { class: 'payment-row' },
        h('div', { class: 'main' }, h('div', { class: 't', text: u.name }), h('div', { class: 's', text: dayLabel(u.due_on) })),
        h('div', { class: 'money', text: fmt(u.amount_paise) }),
        dueChip(u),
        actions.length ? h('div', { class: 'row', style: 'gap:6px' }, actions) : null,
      );
    })));
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
    // Compact, one line per category: swatch, name, amount, % — legible at a glance.
    card.append(h('div', { class: 'legend' }, cats.map((c, i) => {
      const [label] = CATEGORY[c.category] || [c.category];
      const pct = total ? Math.round((c.total_paise / total) * 100) : 0;
      return h('div', { class: 'legend-row' },
        h('span', { class: 'swatch', style: `background:${PALETTE[i % PALETTE.length]}` }),
        h('span', { class: 'legend-name', text: label }),
        h('span', { class: 'legend-pct', text: `${pct}%` }),
        h('span', { class: 'legend-amount', text: fmt(c.total_paise) }),
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
    const mode = state.expenseMode || 'entries';
    root.append(segmented([['entries', 'Entries'], ['report', 'Report']], mode, (v) => { state.expenseMode = v; render(); }));
    if (mode === 'report') {
      root.append(await expenseReport());
      return root;
    }

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

  const STATUS_TEXT = { over: 'Over', under: 'Saved', no_budget: 'No budget' };

  async function expenseReport() {
    const r = await get(`reports&month=${state.month}`);
    const root = h('div', { class: 'stack' });

    const budgetCard = h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: 'Budget vs actual' }), h('span', { class: 'money', text: `${fmt(r.actual_total_paise)} of ${fmt(r.budget_total_paise)}` })),
    );
    if (!r.categories.length) {
      budgetCard.append(h('p', { class: 'empty' }, 'No spending or budgets for this month yet. ', h('a', { href: '#settings', text: 'Set category budgets' })));
    } else {
      const table = h('table', { class: 'compare' },
        h('thead', {}, h('tr', {}, h('th', { text: 'Category' }), h('th', { class: 'num', text: 'Budget' }), h('th', { class: 'num', text: 'Actual' }), h('th', { class: 'num', text: 'Difference' }))),
        h('tbody', {}, r.categories.map((c) => {
          const [label] = CATEGORY[c.category] || [c.category];
          const diffText = c.diff_paise === null ? '—' : `${c.diff_paise > 0 ? '+' : ''}${fmt(c.diff_paise)}${c.diff_pct !== null ? ` (${c.diff_pct > 0 ? '+' : ''}${c.diff_pct}%)` : ''}`;
          return h('tr', {},
            h('th', { text: label }),
            h('td', { class: 'num', text: c.budget_paise === null ? '—' : fmt(c.budget_paise) }),
            h('td', { class: 'num', text: fmt(c.actual_paise) }),
            h('td', { class: `num status-${c.status}`, text: c.status === 'no_budget' ? 'No budget' : diffText }),
          );
        })),
      );
      budgetCard.append(h('div', { class: 'table-wrap' }, table));
      budgetCard.append(h('p', { class: 'faint', style: 'margin-top:10px', text: 'Difference = actual − budget. Red means spent more than planned; green means saved.' }));
    }
    budgetCard.append(h('a', { class: 'btn small', href: '#settings', style: 'margin-top:10px', text: 'Set / change budgets' }));
    root.append(budgetCard);

    const weekCard = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Week by week' })));
    if (!r.weekly.length) {
      weekCard.append(h('p', { class: 'empty', text: 'No spending recorded yet this month.' }));
    } else {
      const canvas = h('canvas', { role: 'img', 'aria-label': 'Spending by week' });
      weekCard.append(h('div', { class: 'chart-box' }, canvas));
      requestAnimationFrame(() => drawWeeklyChart(canvas, r.weekly));
    }
    root.append(weekCard);

    const trendCard = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Last 6 months' })));
    const trendCanvas = h('canvas', { role: 'img', 'aria-label': 'Income, spending and loan payments over the last 6 months' });
    trendCard.append(h('div', { class: 'chart-box' }, trendCanvas));
    requestAnimationFrame(() => drawTrendChart(trendCanvas, r.trend));
    root.append(trendCard);
    return root;
  }

  function drawWeeklyChart(canvas, weekly) {
    if (!window.Chart || !canvas.isConnected) return;
    if (state.weekChart) state.weekChart.destroy();
    const byWeek = Object.fromEntries(weekly.map((w) => [w.week, w.spent_paise]));
    const labels = [1, 2, 3, 4, 5].map((w) => `Week ${w}`);
    state.weekChart = new window.Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ data: [1, 2, 3, 4, 5].map((w) => (byWeek[w] || 0) / 100), backgroundColor: PALETTE[0], borderRadius: 6, maxBarThickness: 44 }] },
      options: {
        maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => fmt(Math.round(c.parsed.y * 100)) } } },
        scales: { y: { ticks: { callback: (v) => `₹${rupee.format(v)}` } } },
      },
    });
  }

  function drawTrendChart(canvas, trend) {
    if (!window.Chart || !canvas.isConnected) return;
    if (state.trendChart) state.trendChart.destroy();
    const labels = trend.map((t) => monthLabel(t.month).split(' ')[0]);
    const series = [
      ['Income', trend.map((t) => t.income_paise / 100), '#0e9f8e'],
      ['Spent', trend.map((t) => t.spent_paise / 100), '#ef4444'],
      ['Loan payments', trend.map((t) => t.loan_paid_paise / 100), '#3b82f6'],
    ];
    state.trendChart = new window.Chart(canvas, {
      type: 'line',
      data: { labels, datasets: series.map(([label, data, c]) => ({ label, data, borderColor: c, backgroundColor: c, pointRadius: 3, borderWidth: 2.5, tension: 0.25 })) },
      options: {
        maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${fmt(Math.round(c.parsed.y * 100))}` } } },
        scales: { y: { ticks: { callback: (v) => `₹${rupee.format(v)}` } } },
      },
    });
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
  // The Plan screen speaks plain Hinglish, Hindi or English (the viewer's choice).
  const PLAN_LANGS = [['hinglish', 'Hinglish'], ['hi', 'हिंदी'], ['en', 'English']];
  state.lang = (() => {
    try {
      const v = localStorage.getItem('ff-lang');
      return PLAN_LANGS.some(([k]) => k === v) ? v : 'hinglish';
    } catch { return 'hinglish'; }
  })();

  const T = {
    hinglish: {
      lakh: 'lakh', crore: 'crore', per_month: '/mahina', never: 'Kabhi nahi',
      dur_ym: '{y} saal {m} mahine', dur_y: '{y} saal', dur_m: '{m} mahine',
      plan_notice: 'Yahan kuch bhi try karo — aapki asli entries nahi badlengi.',
      no_loans: 'Pehle Loans tab me apne loan daalo, fir yahan plan dekho.',
      ask_title: 'Paise ke baare me poochho', ai_off: 'AI abhi band hai. Server par finance-config.php me gemini_api_key daalne se chalu hoga.',
      ai_intro: 'Hisaab app karta hai, AI sirf samjhata hai. AI kuch badal nahi sakta, aur naam/notes bheje nahi jaate.',
      ai_placeholder: 'Poochho — jaise gold loan kab band hoga?', ai_ask: 'Poochho', ai_working: 'Hisaab lag raha hai…', ai_need_q: 'Pehle sawaal likho.',
      ai_earlier: 'Pehle ke sawaal', ai_none: 'Abhi koi nahi.',
      ai_facts: 'Pakka hisaab', ai_assumptions: 'Maan ke chale', ai_estimates: 'Andaaza', ai_suggestions: 'Sujhav',

      po_title: 'Loan jaldi kaise khatam karein?',
      po_intro: 'Seedha niyam: har mahine loans me utna hi paisa do jitna aaj dete ho. Jab ek loan khatam ho, uski EMI band mat karo — wahi paisa agle loan me daal do.',
      po_extra_label: 'Har mahine extra kitna de sakte ho? (₹)', po_extra_hint: 'Nahi hai to khali chhodo.',
      po_more: 'Aur options (bonus / pehle kaunsa loan)',
      po_lumps_label: 'Beech me extra paisa aayega? (incentive, bonus)', po_add_lump: '+ Extra paisa jodo',
      lump_amount: 'Kitna (₹)', lump_month: 'Kab se', lump_every: 'Har kitne mahine', lump_every_hint: '0 = sirf ek baar', lump_times: 'Kitni baar', lump_remove: 'Hatao',
      po_first_label: 'Koi loan sabse pehle band karna hai?', po_first_none: 'Nahi — app khud best tarika chune',
      po_submit: 'Plan dikhao',

      left_out: 'Ye loan plan me nahi hain (number missing): {list}',
      approx_note: '{names} ka byaaj % nahi dala hai, isliye inka byaaj hisaab me nahi hai. Loans tab me rate daalo to plan aur sahi banega.',
      res_today: 'Abhi jaise chal raha hai', res_today_sub: 'Jo EMI aaj dete ho, wahi dete raho',
      res_best: 'App ka best plan', res_best_sub: 'Khatam hue loan ki EMI agle loan me',
      res_custom: 'Aapka chuna plan', res_custom_sub: '{name} sabse pehle',
      res_all_done: 'Saare loan khatam', res_gold_done: 'Gold loan khatam', res_interest: 'Kul byaaj doge', res_monthly: 'Har mahine loans me',
      verdict_never: 'Best plan se saare loan {date} tak khatam ho jaayenge — aur lagbhag {amount} byaaj bachega.',
      verdict_early: 'Best plan se lagbhag {amount} byaaj bachega aur loan {time} pehle khatam honge.',
      verdict_saved: 'Best plan se lagbhag {amount} byaaj bachega.',
      verdict_stuck: 'Aaj ke paise se saare loan khatam nahi ho rahe. Har mahine thoda extra daal ke dekho.',
      verdict_nochange: 'Aapka abhi ka tarika hi theek hai — koi bada fark nahi.',
      today_never_note: 'Abhi wale tarike me gold loan kabhi khatam nahi hota (sirf byaaj jaata hai), isliye uska byaaj 40 saal tak joda gaya hai.',
      custom_vs_best: 'Note: app ka best tarika (sabse mehenga loan pehle) {amount} aur bachata.',
      steps_title: 'Kya karna hai — step by step',
      step1: 'Har mahine loans me kul {amount} do.', step1_extra: 'Har mahine loans me kul {amount} do (isme {extra} extra shaamil hai).',
      step2: 'Jab koi loan khatam ho jaaye, uski EMI ka paisa kharch mat karo — wahi agle loan me daal do.',
      step3: 'Loan is order me khatam honge:', step_never: '{name} — is plan me bhi khatam nahi',
      chart_title: 'Loan ka bojh kaise kam hoga', chart_hint: 'Line jitni jaldi zero par aaye, utna achha.',
      series_today: 'Abhi jaisa', series_best: 'Best plan', series_custom: 'Aapka plan',
      more_detail: 'Har loan ki detail dekho', detail_line: '{date} me khatam · byaaj {interest}', no_rate: 'rate nahi dala',
      other_way: '{name}: saare loan {date} tak, byaaj {interest}',
      way_avalanche: 'Sabse mehenga loan pehle', way_snowball: 'Sabse chhota loan pehle',

      rf_title: 'Naya loan lekar purana band karein?',
      rf_intro: 'Jaise: personal loan lekar gold loan band karna. Bank ne jo offer diya hai wahi number daalo — app batayega faayda hai ya nuksaan.',
      rf_need_rate: 'Iske liye Loans tab me apne loans ka byaaj % daalo.',
      rf_pick: 'Kaunse loan band karne hain?', rf_pick_item: '{name} — {amount} baki · {rate} byaaj',
      rf_rate: 'Naye loan ka byaaj (% saal ka)', rf_rate_hint: 'Jaise 14',
      rf_tenure: 'Kitne mahine me chukana hai?', rf_tenure_hint: '12 = 1 saal, 36 = 3 saal',
      rf_fee: 'Processing fee (₹)', rf_more: 'Aur charges (agar hain)',
      rf_foreclosure: 'Purana loan band karne ka charge (₹)', rf_other: 'Baaki charges (₹)', rf_other_hint: 'Insurance, stamp duty…',
      rf_amount: 'Naya loan kitne ka? (₹)', rf_amount_hint: 'Khali chhodo = jitna band karna hai utna hi',
      rf_submit: 'Faayda hai ya nuksaan? Check karo',
      rf_yes: '✅ Haan, naya loan lena faayde ka hai', rf_yes_sub: 'Lagbhag {amount} bachenge.',
      rf_no: '❌ Nahi, naya loan mehenga padega', rf_no_sub: 'Isme lagbhag {amount} zyada lagega. Wahi paisa purane loan me bharna better hai.',
      rf_equal: 'Dono barabar hain — koi fark nahi.',
      opt_new: 'Naya loan lo', opt_new_sub: '{amount} ka loan · {rate} byaaj · {time}',
      opt_same: 'Naya loan mat lo', opt_same_sub: 'Bas har mahine wahi {emi} purane loan me bharo',
      lbl_monthly: 'Har mahine', lbl_time: 'Kitne time me khatam', lbl_interest: 'Kul byaaj', lbl_fees: 'Fees / charges', lbl_total: 'Kul kharcha',
      over_40: '40 saal se zyada',
      rf_keep: 'Agar kuch bhi nahi badla (sirf byaaj {monthly}/mahina bharte rahe): {time} me {interest} sirf byaaj me jaayega aur {owed} ka loan fir bhi utna hi baki rahega.',
      rf_now: 'Abhi aap in loans me har mahine {now} dete ho.',
      rf_monthly_more: 'Naye loan me har mahine {amount} zyada dena padega.', rf_monthly_less: 'Naye loan me har mahine {amount} kam dena padega.',
      rf_pocket: 'Fees ke liye {amount} apni jeb se dena hoga.', rf_in_hand: '{amount} haath me bachega.',
      rf_caution: 'Ye sirf aapke daale numbers par hai. Final faisla karne se pehle bank se EMI aur saare charges pakka kar lo.',
    },
    hi: {
      lakh: 'लाख', crore: 'करोड़', per_month: '/महीना', never: 'कभी नहीं',
      dur_ym: '{y} साल {m} महीने', dur_y: '{y} साल', dur_m: '{m} महीने',
      plan_notice: 'यहाँ कुछ भी आज़माइए — आपकी असली एंट्री नहीं बदलेगी।',
      no_loans: 'पहले लोन टैब में अपने लोन डालें, फिर यहाँ प्लान देखें।',
      ask_title: 'पैसों के बारे में पूछें', ai_off: 'AI अभी बंद है। सर्वर पर finance-config.php में gemini_api_key डालने से चालू होगा।',
      ai_intro: 'हिसाब ऐप करता है, AI सिर्फ़ समझाता है। AI कुछ बदल नहीं सकता, और नाम/नोट्स भेजे नहीं जाते।',
      ai_placeholder: 'पूछें — जैसे गोल्ड लोन कब बंद होगा?', ai_ask: 'पूछें', ai_working: 'हिसाब लग रहा है…', ai_need_q: 'पहले सवाल लिखें।',
      ai_earlier: 'पहले के सवाल', ai_none: 'अभी कोई नहीं।',
      ai_facts: 'पक्का हिसाब', ai_assumptions: 'मान कर चले', ai_estimates: 'अंदाज़ा', ai_suggestions: 'सुझाव',

      po_title: 'लोन जल्दी कैसे ख़त्म करें?',
      po_intro: 'सीधा नियम: हर महीने लोन में उतना ही पैसा दें जितना आज देते हैं। जब एक लोन ख़त्म हो, उसकी EMI बंद न करें — वही पैसा अगले लोन में डालें।',
      po_extra_label: 'हर महीने अलग से कितना दे सकते हैं? (₹)', po_extra_hint: 'नहीं है तो खाली छोड़ें।',
      po_more: 'और विकल्प (बोनस / पहले कौनसा लोन)',
      po_lumps_label: 'बीच में अलग से पैसा आएगा? (इंसेंटिव, बोनस)', po_add_lump: '+ पैसा जोड़ें',
      lump_amount: 'कितना (₹)', lump_month: 'कब से', lump_every: 'हर कितने महीने', lump_every_hint: '0 = सिर्फ़ एक बार', lump_times: 'कितनी बार', lump_remove: 'हटाएँ',
      po_first_label: 'कोई लोन सबसे पहले बंद करना है?', po_first_none: 'नहीं — ऐप खुद सबसे अच्छा तरीका चुने',
      po_submit: 'प्लान दिखाओ',

      left_out: 'ये लोन प्लान में नहीं हैं (जानकारी अधूरी): {list}',
      approx_note: '{names} का ब्याज % नहीं डाला है, इसलिए इनका ब्याज हिसाब में नहीं है। लोन टैब में रेट डालें तो प्लान और सही बनेगा।',
      res_today: 'अभी जैसा चल रहा है', res_today_sub: 'जो EMI आज देते हैं, वही देते रहें',
      res_best: 'ऐप का सबसे अच्छा प्लान', res_best_sub: 'ख़त्म हुए लोन की EMI अगले लोन में',
      res_custom: 'आपका चुना प्लान', res_custom_sub: '{name} सबसे पहले',
      res_all_done: 'सारे लोन ख़त्म', res_gold_done: 'गोल्ड लोन ख़त्म', res_interest: 'कुल ब्याज देंगे', res_monthly: 'हर महीने लोन में',
      verdict_never: 'सबसे अच्छे प्लान से सारे लोन {date} तक ख़त्म हो जाएँगे — और लगभग {amount} ब्याज बचेगा।',
      verdict_early: 'सबसे अच्छे प्लान से लगभग {amount} ब्याज बचेगा और लोन {time} पहले ख़त्म होंगे।',
      verdict_saved: 'सबसे अच्छे प्लान से लगभग {amount} ब्याज बचेगा।',
      verdict_stuck: 'आज के पैसों से सारे लोन ख़त्म नहीं हो रहे। हर महीने थोड़ा अलग से डाल कर देखें।',
      verdict_nochange: 'आपका अभी का तरीका ही ठीक है — कोई बड़ा फ़र्क नहीं।',
      today_never_note: 'अभी वाले तरीके में गोल्ड लोन कभी ख़त्म नहीं होता (सिर्फ़ ब्याज जाता है), इसलिए उसका ब्याज 40 साल तक जोड़ा गया है।',
      custom_vs_best: 'ध्यान दें: ऐप का सबसे अच्छा तरीका (सबसे महँगा लोन पहले) {amount} और बचाता।',
      steps_title: 'क्या करना है — कदम दर कदम',
      step1: 'हर महीने लोन में कुल {amount} दें।', step1_extra: 'हर महीने लोन में कुल {amount} दें (इसमें {extra} अलग से शामिल है)।',
      step2: 'जब कोई लोन ख़त्म हो जाए, उसकी EMI का पैसा ख़र्च न करें — वही अगले लोन में डालें।',
      step3: 'लोन इस क्रम में ख़त्म होंगे:', step_never: '{name} — इस प्लान में भी ख़त्म नहीं',
      chart_title: 'लोन का बोझ कैसे घटेगा', chart_hint: 'लाइन जितनी जल्दी शून्य पर आए, उतना अच्छा।',
      series_today: 'अभी जैसा', series_best: 'सबसे अच्छा प्लान', series_custom: 'आपका प्लान',
      more_detail: 'हर लोन की डिटेल देखें', detail_line: '{date} में ख़त्म · ब्याज {interest}', no_rate: 'रेट नहीं डाला',
      other_way: '{name}: सारे लोन {date} तक, ब्याज {interest}',
      way_avalanche: 'सबसे महँगा लोन पहले', way_snowball: 'सबसे छोटा लोन पहले',

      rf_title: 'नया लोन लेकर पुराना बंद करें?',
      rf_intro: 'जैसे: पर्सनल लोन लेकर गोल्ड लोन बंद करना। बैंक ने जो ऑफ़र दिया है वही नंबर डालें — ऐप बताएगा फ़ायदा है या नुकसान।',
      rf_need_rate: 'इसके लिए लोन टैब में अपने लोन का ब्याज % डालें।',
      rf_pick: 'कौनसे लोन बंद करने हैं?', rf_pick_item: '{name} — {amount} बाकी · {rate} ब्याज',
      rf_rate: 'नए लोन का ब्याज (% सालाना)', rf_rate_hint: 'जैसे 14',
      rf_tenure: 'कितने महीने में चुकाना है?', rf_tenure_hint: '12 = 1 साल, 36 = 3 साल',
      rf_fee: 'प्रोसेसिंग फ़ीस (₹)', rf_more: 'और चार्ज (अगर हैं)',
      rf_foreclosure: 'पुराना लोन बंद करने का चार्ज (₹)', rf_other: 'बाकी चार्ज (₹)', rf_other_hint: 'बीमा, स्टाम्प ड्यूटी…',
      rf_amount: 'नया लोन कितने का? (₹)', rf_amount_hint: 'खाली छोड़ें = जितना बंद करना है उतना ही',
      rf_submit: 'फ़ायदा है या नुकसान? देखें',
      rf_yes: '✅ हाँ, नया लोन लेना फ़ायदे का है', rf_yes_sub: 'लगभग {amount} बचेंगे।',
      rf_no: '❌ नहीं, नया लोन महँगा पड़ेगा', rf_no_sub: 'इसमें लगभग {amount} ज़्यादा लगेगा। वही पैसा पुराने लोन में भरना बेहतर है।',
      rf_equal: 'दोनों बराबर हैं — कोई फ़र्क नहीं।',
      opt_new: 'नया लोन लें', opt_new_sub: '{amount} का लोन · {rate} ब्याज · {time}',
      opt_same: 'नया लोन न लें', opt_same_sub: 'बस हर महीने वही {emi} पुराने लोन में भरें',
      lbl_monthly: 'हर महीने', lbl_time: 'कितने समय में ख़त्म', lbl_interest: 'कुल ब्याज', lbl_fees: 'फ़ीस / चार्ज', lbl_total: 'कुल ख़र्च',
      over_40: '40 साल से ज़्यादा',
      rf_keep: 'अगर कुछ भी नहीं बदला (सिर्फ़ ब्याज {monthly}/महीना भरते रहे): {time} में {interest} सिर्फ़ ब्याज में जाएगा और {owed} का लोन फिर भी उतना ही बाकी रहेगा।',
      rf_now: 'अभी आप इन लोन में हर महीने {now} देते हैं।',
      rf_monthly_more: 'नए लोन में हर महीने {amount} ज़्यादा देना होगा।', rf_monthly_less: 'नए लोन में हर महीने {amount} कम देना होगा।',
      rf_pocket: 'फ़ीस के लिए {amount} अपनी जेब से देने होंगे।', rf_in_hand: '{amount} हाथ में बचेंगे।',
      rf_caution: 'यह सिर्फ़ आपके डाले नंबरों पर है। आख़िरी फ़ैसले से पहले बैंक से EMI और सारे चार्ज पक्के कर लें।',
    },
    en: {
      lakh: 'lakh', crore: 'crore', per_month: '/month', never: 'Never',
      dur_ym: '{y} yr {m} mo', dur_y: '{y} years', dur_m: '{m} months',
      plan_notice: 'Try anything here — your real entries never change.',
      no_loans: 'Add your loans in the Loans tab first, then come back to plan.',
      ask_title: 'Ask about your money', ai_off: 'AI is off. Add gemini_api_key to finance-config.php on the server to switch it on.',
      ai_intro: 'The app does the maths; the AI explains it. It cannot change anything, and names and notes are not sent.',
      ai_placeholder: 'Ask — e.g. when will the gold loan close?', ai_ask: 'Ask', ai_working: 'Working it out…', ai_need_q: 'Type a question first.',
      ai_earlier: 'Earlier questions', ai_none: 'None yet.',
      ai_facts: 'Calculated facts', ai_assumptions: 'Assumptions', ai_estimates: 'Estimates', ai_suggestions: 'Suggestions',

      po_title: 'How to finish your loans sooner',
      po_intro: 'One simple rule: keep paying the same total into loans each month. When a loan ends, don’t spend its EMI — put it into the next loan.',
      po_extra_label: 'Extra you can pay each month (₹)', po_extra_hint: 'Leave empty if none.',
      po_more: 'More options (bonus / which loan first)',
      po_lumps_label: 'Extra money coming in? (incentive, bonus)', po_add_lump: '+ Add extra money',
      lump_amount: 'Amount (₹)', lump_month: 'Starting', lump_every: 'Every … months', lump_every_hint: '0 = only once', lump_times: 'How many times', lump_remove: 'Remove',
      po_first_label: 'Close one loan first?', po_first_none: 'No — let the app pick the best way',
      po_submit: 'Show plan',

      left_out: 'Not in the plan (numbers missing): {list}',
      approx_note: 'No interest rate for {names}, so their interest isn’t counted. Add the rate in Loans for a truer plan.',
      res_today: 'If you carry on as today', res_today_sub: 'Keep paying today’s EMIs',
      res_best: 'The app’s best plan', res_best_sub: 'A finished loan’s EMI moves to the next loan',
      res_custom: 'Your plan', res_custom_sub: '{name} first',
      res_all_done: 'All loans finished', res_gold_done: 'Gold loans finished', res_interest: 'Total interest', res_monthly: 'Into loans each month',
      verdict_never: 'With the best plan every loan is finished by {date} — and you save about {amount} in interest.',
      verdict_early: 'With the best plan you save about {amount} in interest and finish {time} sooner.',
      verdict_saved: 'With the best plan you save about {amount} in interest.',
      verdict_stuck: 'Today’s money doesn’t finish every loan. Try adding a little extra each month.',
      verdict_nochange: 'Your current way is already fine — no big difference.',
      today_never_note: 'On today’s payments the gold loan never ends (you only pay interest), so its interest is counted for 40 years.',
      custom_vs_best: 'Note: the app’s best way (costliest loan first) would save {amount} more.',
      steps_title: 'What to do — step by step',
      step1: 'Pay {amount} in total into loans every month.', step1_extra: 'Pay {amount} in total into loans every month (includes {extra} extra).',
      step2: 'When a loan finishes, don’t spend its EMI — put that money into the next loan.',
      step3: 'Your loans will finish in this order:', step_never: '{name} — not finished even in this plan',
      chart_title: 'How your loan balance falls', chart_hint: 'The sooner the line reaches zero, the better.',
      series_today: 'As today', series_best: 'Best plan', series_custom: 'Your plan',
      more_detail: 'See each loan in detail', detail_line: 'Ends {date} · interest {interest}', no_rate: 'rate not entered',
      other_way: '{name}: all loans by {date}, interest {interest}',
      way_avalanche: 'Costliest loan first', way_snowball: 'Smallest loan first',

      rf_title: 'Take a new loan to close old ones?',
      rf_intro: 'For example, a personal loan to close the gold loan. Enter the bank’s offer exactly — the app tells you if it saves money or not.',
      rf_need_rate: 'Add interest rates to your loans (Loans tab) to use this.',
      rf_pick: 'Which loans to close?', rf_pick_item: '{name} — {amount} left · {rate}',
      rf_rate: 'New loan interest (% a year)', rf_rate_hint: 'e.g. 14',
      rf_tenure: 'Repay in how many months?', rf_tenure_hint: '12 = 1 year, 36 = 3 years',
      rf_fee: 'Processing fee (₹)', rf_more: 'Other charges (if any)',
      rf_foreclosure: 'Charge to close the old loan (₹)', rf_other: 'Other charges (₹)', rf_other_hint: 'Insurance, stamp duty…',
      rf_amount: 'New loan amount (₹)', rf_amount_hint: 'Empty = exactly what it closes',
      rf_submit: 'Is it worth it? Check',
      rf_yes: '✅ Yes, the new loan saves money', rf_yes_sub: 'You save about {amount}.',
      rf_no: '❌ No, the new loan costs more', rf_no_sub: 'It costs about {amount} more. Paying the same into your old loans is better.',
      rf_equal: 'Both cost the same — no difference.',
      opt_new: 'Take the new loan', opt_new_sub: '{amount} loan · {rate} · {time}',
      opt_same: 'Don’t take a new loan', opt_same_sub: 'Just pay the same {emi} a month into the old loans',
      lbl_monthly: 'Every month', lbl_time: 'Finished in', lbl_interest: 'Total interest', lbl_fees: 'Fees / charges', lbl_total: 'Total cost',
      over_40: 'Over 40 years',
      rf_keep: 'If you change nothing (paying only {monthly}/month interest): in {time} you pay {interest} in interest alone, and still owe the full {owed}.',
      rf_now: 'Today you pay {now} a month into these loans.',
      rf_monthly_more: 'The new loan needs {amount} more each month.', rf_monthly_less: 'The new loan needs {amount} less each month.',
      rf_pocket: 'You’d pay {amount} from your pocket for the fees.', rf_in_hand: '{amount} would be left in hand.',
      rf_caution: 'This uses only the numbers you entered. Confirm the EMI and every charge with the bank before deciding.',
    },
  };

  function t(key, vars = {}) {
    const s = T[state.lang]?.[key] ?? T.en[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
  }
  /** Easy-read money: exact below ₹10 lakh (₹1,03,678), then ₹12.3 lakh · ₹1.25 crore. */
  function easy(paise) {
    if (paise === null || paise === undefined) return '—';
    const r = Math.round(paise / 100);
    const dp = (n, d) => n.toLocaleString('en-IN', { maximumFractionDigits: d });
    if (Math.abs(r) >= 1e7) return `₹${dp(r / 1e7, 2)} ${t('crore')}`;
    if (Math.abs(r) >= 1e6) return `₹${dp(r / 1e5, 1)} ${t('lakh')}`;
    return `₹${rupee.format(r)}`;
  }
  function planMonth(ym) {
    if (!ym) return t('never');
    return new Date(ym + '-01T00:00:00').toLocaleDateString(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' });
  }
  function monthsBetween(a, b) {
    const [ay, am] = a.split('-').map(Number);
    const [by, bm] = b.split('-').map(Number);
    return (by - ay) * 12 + (bm - am);
  }
  function duration(n) {
    const y = Math.floor(n / 12), m = n % 12;
    if (y && m) return t('dur_ym', { y, m });
    return y ? t('dur_y', { y }) : t('dur_m', { m });
  }
  const kv = (label, value, cls) => h('div', { class: 'kv' }, h('span', { text: label }), h('strong', { class: cls || null, text: value }));

  async function viewPlan() {
    const loans = await get('loans');
    const active = loans.filter((l) => l.group !== 'closed');
    const root = h('div', { class: 'stack' });
    root.append(h('section', { class: 'card lang-card' },
      h('p', { class: 'small muted', style: 'margin:0 0 8px', text: 'Bhasha · भाषा · Language' }),
      segmented(PLAN_LANGS, state.lang, (v) => {
        state.lang = v;
        try { localStorage.setItem('ff-lang', v); } catch { /* private mode */ }
        render();
      })));
    root.append(h('p', { class: 'notice info', text: t('plan_notice') }));
    if (!active.length) {
      root.append(h('div', { class: 'card empty', text: t('no_loans') }));
      root.append(aiCard());
      return root;
    }
    root.append(payoffCard(active), refinanceCard(active), aiCard());
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
      h('div', { class: 'card-head' }, h('h2', { text: t('ask_title') }), h('span', { class: 'chip info', text: 'AI' })),
    );
    if (!state.meta.ai_enabled) {
      card.append(h('p', { class: 'muted small', text: t('ai_off') }));
      return card;
    }
    card.append(h('p', { class: 'muted small', style: 'margin-bottom:12px', text: t('ai_intro') }));
    const answerBox = h('div', { class: 'stack', style: 'margin-top:14px' });
    const q = h('textarea', { name: 'question', maxlength: 1000, rows: 2, placeholder: t('ai_placeholder'), 'aria-label': t('ask_title') });
    const chips = h('div', { class: 'chips', style: 'margin-bottom:12px' }, AI_QUESTIONS.map((text) => h('button', { type: 'button', text, onclick: () => { q.value = text; q.focus(); } })));
    const form = formShell(async () => {
      if (!q.value.trim()) throw new Error(t('ai_need_q'));
      answerBox.replaceChildren(h('p', { class: 'loading', text: t('ai_working') }));
      try {
        const r = await post('ai/ask', { question: q.value.trim() });
        answerBox.replaceChildren(aiAnswer(r.question, r.answer));
      } catch (e) {
        answerBox.replaceChildren();
        throw e;
      }
    }, t('ai_ask'), chips, h('label', { class: 'field' }, q));
    card.append(form, answerBox);
    const past = h('details', { style: 'margin-top:12px' }, h('summary', { class: 'small', text: t('ai_earlier') }));
    past.addEventListener('toggle', async () => {
      if (!past.open || past.dataset.loaded) return;
      past.dataset.loaded = '1';
      const rows = await get('ai/history');
      past.append(rows.length ? h('div', { class: 'stack', style: 'margin-top:10px' }, rows.map((r) => aiAnswer(r.question, r.answer, r.created_at))) : h('p', { class: 'faint', text: t('ai_none') }));
    });
    card.append(past);
    return card;
  }

  function aiAnswer(question, a, when) {
    const section = (title, items) => (items && items.length ? h('div', {}, h('h3', { style: 'margin:10px 0 4px', text: title }), h('ul', { style: 'margin:0;padding-left:20px' }, items.map((x) => h('li', { text: x })))) : null);
    return h('article', { class: 'card', style: 'background:var(--surface-2);box-shadow:none' },
      h('p', { class: 'faint', text: when ? `${question} · ${new Date(when.replace(' ', 'T')).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : question }),
      h('p', { style: 'font-weight:650;margin-top:6px', text: a.short_answer }),
      section(t('ai_facts'), a.facts),
      section(t('ai_assumptions'), a.assumptions),
      section(t('ai_estimates'), a.estimates),
      section(t('ai_suggestions'), a.suggestions),
    );
  }

  // ---------- pay off faster ----------
  function payoffCard(active) {
    const saved = state.planSaved;
    const card = h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: t('po_title') })),
      h('p', { class: 'muted', style: 'margin-bottom:14px', text: t('po_intro') }),
    );
    const lumps = h('div', {});
    const addLump = (v = {}) => {
      const row = h('div', { class: 'lump-row' },
        field(t('lump_amount'), moneyInput('lump_amount', v.amount || '')),
        field(t('lump_month'), input('lump_month', v.month || addMonthsJs(thisMonth(), 1), { type: 'month' })),
        field(t('lump_every'), input('lump_every', v.every ?? '0', { inputmode: 'numeric' }), t('lump_every_hint')),
        field(t('lump_times'), input('lump_times', v.times ?? '1', { inputmode: 'numeric' })),
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': t('lump_remove'), text: '✕', onclick: () => row.remove() }),
      );
      lumps.append(row);
    };
    for (const l of saved?.body.lumps || []) addLump({ amount: l.amount, month: l.month, every: l.every_months, times: l.times });
    const firstPick = select('first', [['', t('po_first_none')], ...active.map((l) => [String(l.id), l.name])], saved?.body.order[0] ? String(saved.body.order[0]) : '');
    const more = h('details', { class: 'more' }, h('summary', { text: t('po_more') }),
      h('div', { class: 'field', style: 'margin-top:12px' }, h('span', { text: t('po_lumps_label') }), lumps,
        h('button', { class: 'btn small', type: 'button', text: t('po_add_lump'), onclick: () => addLump() })),
      field(t('po_first_label'), firstPick),
    );
    if (saved && (saved.body.lumps.length || saved.body.order.length)) more.open = true;
    const results = h('div', { class: 'stack', style: 'margin-top:16px' });

    const form = formShell(async (fd) => {
      const body = {
        extra_monthly: fd.get('extra_monthly'),
        lumps: [...lumps.querySelectorAll('.lump-row')].map((r) => ({
          amount: r.querySelector('[name=lump_amount]').value,
          month: r.querySelector('[name=lump_month]').value,
          every_months: r.querySelector('[name=lump_every]').value || '0',
          times: r.querySelector('[name=lump_times]').value || '1',
        })).filter((l) => l.amount.trim() !== ''),
        order: fd.get('first') ? [Number(fd.get('first'))] : [],
      };
      const r = await post('plan/simulate', body);
      state.planSaved = { body, r };
      results.replaceChildren(...planResults(r, active));
    }, t('po_submit'),
      field(t('po_extra_label'), moneyInput('extra_monthly', saved?.body.extra_monthly || ''), t('po_extra_hint')),
      more,
    );
    card.append(form, results);
    if (saved) results.replaceChildren(...planResults(saved.r, active));
    return card;
  }

  function addMonthsJs(ym, n) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + n, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function planResults(r, active) {
    const out = [];
    if (r.left_out.length) {
      out.push(h('p', { class: 'notice', text: t('left_out', { list: r.left_out.map((l) => `${l.name} (${l.reason})`).join(', ') }) }));
    }
    const approx = r.loans.filter((l) => l.approx).map((l) => l.name);
    if (approx.length) out.push(h('p', { class: 'notice info', text: t('approx_note', { names: approx.join(', ') }) }));

    const today = r.plans.none;
    const smart = ['avalanche', 'snowball'].filter((n) => r.plans[n]).sort((a, b) => r.plans[a].total_interest_paise - r.plans[b].total_interest_paise)[0];
    const bestKey = r.plans.custom ? 'custom' : smart;
    const best = r.plans[bestKey];
    const hasGold = active.some((l) => l.loan_type === 'gold');
    const firstName = bestKey === 'custom' ? (r.loans.find((l) => l.id === state.planSaved?.body.order[0])?.name || '') : '';

    // 1. The answer in one sentence.
    const savedPaise = today.total_interest_paise - best.total_interest_paise;
    let verdict;
    if (!best.debt_free_month) verdict = t('verdict_stuck');
    else if (!today.debt_free_month) verdict = t('verdict_never', { date: planMonth(best.debt_free_month), amount: easy(savedPaise) });
    else if (savedPaise <= 0) verdict = t('verdict_nochange');
    else {
      const early = monthsBetween(best.debt_free_month, today.debt_free_month);
      verdict = early > 0 ? t('verdict_early', { amount: easy(savedPaise), time: duration(early) }) : t('verdict_saved', { amount: easy(savedPaise) });
    }
    out.push(h('div', { class: `verdict ${best.debt_free_month && savedPaise > 0 ? 'good' : 'plain'}` }, h('strong', { text: verdict })));

    // 2. Today vs the plan, side by side.
    const box = (title, sub, p, cls) => h('div', { class: `plan-box ${cls}` },
      h('h3', { text: title }), h('p', { class: 'sub', text: sub }),
      kv(t('res_monthly'), `${easy(p.monthly_budget_paise)}${t('per_month')}`),
      hasGold ? kv(t('res_gold_done'), planMonth(p.gold_closed_month), p.gold_closed_month ? null : 'bad') : null,
      kv(t('res_all_done'), planMonth(p.debt_free_month), p.debt_free_month ? null : 'bad'),
      kv(t('res_interest'), easy(p.total_interest_paise)),
    );
    out.push(h('div', { class: 'plan-compare' },
      box(t('res_today'), t('res_today_sub'), today, ''),
      bestKey === 'custom'
        ? box(t('res_custom'), t('res_custom_sub', { name: firstName }), best, 'best')
        : box(t('res_best'), t('res_best_sub'), best, 'best'),
    ));
    if (!today.debt_free_month && hasGold) out.push(h('p', { class: 'faint small', text: t('today_never_note') }));
    if (bestKey === 'custom' && r.plans[smart].total_interest_paise < best.total_interest_paise) {
      out.push(h('p', { class: 'notice', text: t('custom_vs_best', { amount: easy(best.total_interest_paise - r.plans[smart].total_interest_paise) }) }));
    }

    // 3. What to actually do.
    const order = best.loans.filter((l) => l.close_month).sort((a, b) => a.close_month.localeCompare(b.close_month));
    const stuck = best.loans.filter((l) => !l.close_month);
    out.push(h('div', {},
      h('h3', { text: t('steps_title') }),
      h('ol', { class: 'steps' },
        h('li', { text: r.extra_monthly_paise > 0 ? t('step1_extra', { amount: easy(best.monthly_budget_paise), extra: easy(r.extra_monthly_paise) }) : t('step1', { amount: easy(best.monthly_budget_paise) }) }),
        h('li', { text: t('step2') }),
        h('li', {}, t('step3'), h('ol', { class: 'order' },
          order.map((l, i) => h('li', {}, h('span', {}, h('b', { text: `${i + 1}.` }), l.name), h('span', { class: 'muted', text: planMonth(l.close_month) }))),
          stuck.map((l) => h('li', {}, h('span', { class: 'bad', text: t('step_never', { name: l.name }) }))),
        )),
      ),
    ));

    // 4. The picture.
    const canvas = h('canvas', { role: 'img', 'aria-label': t('chart_title') });
    out.push(h('div', {}, h('h3', { text: t('chart_title') }), h('p', { class: 'faint small', style: 'margin:0 0 8px', text: t('chart_hint') }), h('div', { class: 'chart-box tall' }, canvas)));
    requestAnimationFrame(() => drawPlanChart(canvas, r, bestKey));

    // 5. Detail, for whoever wants it.
    const other = ['avalanche', 'snowball'].filter((n) => r.plans[n] && n !== bestKey);
    out.push(h('details', { class: 'more' }, h('summary', { text: t('more_detail') }),
      h('ul', { class: 'order', style: 'margin-top:10px' }, order.concat(stuck).map((l) => h('li', { class: 'col' },
        h('strong', { text: l.name }),
        h('span', { class: 'muted small', text: t('detail_line', { date: planMonth(l.close_month), interest: l.interest_paise === null ? t('no_rate') : easy(l.interest_paise) }) }),
      ))),
      other.map((n) => h('p', { class: 'faint small', style: 'margin-top:8px', text: t('other_way', { name: t(`way_${n}`), date: planMonth(r.plans[n].debt_free_month), interest: easy(r.plans[n].total_interest_paise) }) })),
    ));
    return out;
  }

  function drawPlanChart(canvas, r, bestKey) {
    if (!window.Chart || !canvas.isConnected) return;
    if (state.planChart) state.planChart.destroy();
    const keys = ['none', bestKey];
    const longest = Math.max(...keys.map((n) => r.plans[n].timeline.length));
    const months = Math.min(longest, 240);
    const labels = Array.from({ length: months }, (_, i) => addMonthsJs(r.start_month, i));
    const style = {
      none: { label: t('series_today'), color: '#94a3b8', dash: [5, 4], width: 2 },
      [bestKey]: { label: bestKey === 'custom' ? t('series_custom') : t('series_best'), color: '#0e9f8e', dash: [], width: 3 },
    };
    const short = (v) => (v >= 1e5 ? `₹${(v / 1e5).toFixed(v % 1e5 ? 1 : 0)} ${t('lakh')}` : `₹${rupee.format(v)}`);
    state.planChart = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.map((m) => new Date(m + '-01T00:00:00').toLocaleDateString(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', year: 'numeric' })),
        datasets: keys.map((n) => ({
          label: style[n].label,
          data: labels.map((_, i) => { const p = r.plans[n].timeline[i]; return p ? p.outstanding_paise / 100 : 0; }),
          borderColor: style[n].color, backgroundColor: style[n].color, pointRadius: 0, borderWidth: style[n].width, borderDash: style[n].dash,
        })),
      },
      options: {
        maintainAspectRatio: false, animation: false, interaction: { mode: 'index', intersect: false },
        scales: { y: { ticks: { callback: short } }, x: { ticks: { maxTicksLimit: 6 } } },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12 } },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${easy(Math.round(c.parsed.y * 100))}` } },
        },
      },
    });
  }

  // ---------- new loan to close old ones ----------
  function refinanceCard(active) {
    const saved = state.refiSaved;
    const withRate = active.filter((l) => l.interest_rate !== null);
    const card = h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: t('rf_title') })),
      h('p', { class: 'muted', style: 'margin-bottom:14px', text: t('rf_intro') }),
    );
    if (!withRate.length) {
      card.append(h('p', { class: 'empty', text: t('rf_need_rate') }));
      return card;
    }
    const picks = h('div', { class: 'loan-picks' }, withRate.map((l) => h('label', { class: 'check' },
      h('input', { type: 'checkbox', name: 'loan', value: String(l.id), checked: saved ? saved.body.loan_ids.includes(l.id) : l.loan_type === 'gold' }),
      h('span', { text: t('rf_pick_item', { name: l.name, amount: easy(l.outstanding_paise), rate: rate(l.interest_rate) }) }),
    )));
    const v = (k, d = '') => (saved ? saved.body[k] || d : d);
    const more = h('details', { class: 'more' }, h('summary', { text: t('rf_more') }),
      h('div', { style: 'margin-top:12px' },
        field(t('rf_foreclosure'), moneyInput('foreclosure_charges', v('foreclosure_charges'))),
        field(t('rf_other'), moneyInput('other_charges', v('other_charges')), t('rf_other_hint')),
        field(t('rf_amount'), moneyInput('new_amount', v('new_amount')), t('rf_amount_hint')),
      ),
    );
    if (saved && (saved.body.foreclosure_charges || saved.body.other_charges || saved.body.new_amount)) more.open = true;
    const results = h('div', { class: 'stack', style: 'margin-top:16px' });
    const form = formShell(async (fd) => {
      const body = {
        loan_ids: fd.getAll('loan').map(Number), new_rate: fd.get('new_rate'), tenure_months: fd.get('tenure_months'),
        new_amount: fd.get('new_amount'), processing_fee: fd.get('processing_fee'), foreclosure_charges: fd.get('foreclosure_charges'), other_charges: fd.get('other_charges'),
      };
      const r = await post('plan/refinance', body);
      state.refiSaved = { body, r };
      results.replaceChildren(...refinanceResults(r, withRate.filter((l) => body.loan_ids.includes(l.id))));
    }, t('rf_submit'),
      h('div', { class: 'field' }, h('span', { text: t('rf_pick') }), picks),
      field(t('rf_rate'), input('new_rate', v('new_rate'), { inputmode: 'decimal', required: true, placeholder: '14' }), t('rf_rate_hint')),
      field(t('rf_tenure'), input('tenure_months', v('tenure_months', '36'), { inputmode: 'numeric', required: true }), t('rf_tenure_hint')),
      field(t('rf_fee'), moneyInput('processing_fee', v('processing_fee'))),
      more,
    );
    card.append(form, results);
    if (saved) results.replaceChildren(...refinanceResults(saved.r, withRate.filter((l) => saved.body.loan_ids.includes(l.id))));
    return card;
  }

  function refinanceResults(r, picked) {
    const same = r.same_payment_on_current;
    const nl = r.new_loan;
    const diff = r.difference_paise;
    const out = [];

    // 1. The answer.
    out.push(diff === 0
      ? h('div', { class: 'verdict plain' }, h('strong', { text: t('rf_equal') }))
      : h('div', { class: `verdict ${diff < 0 ? 'good' : 'bad'}` },
        h('strong', { text: diff < 0 ? t('rf_yes') : t('rf_no') }),
        h('p', { text: diff < 0 ? t('rf_yes_sub', { amount: easy(-diff) }) : t('rf_no_sub', { amount: easy(diff) }) })));

    // 2. The two choices, same monthly payment.
    const newBox = h('div', { class: `plan-box ${diff < 0 ? 'best' : ''}` },
      h('h3', { text: t('opt_new') }),
      h('p', { class: 'sub', text: t('opt_new_sub', { amount: easy(nl.amount_paise), rate: rate(nl.rate), time: duration(nl.months) }) }),
      kv(t('lbl_monthly'), `${easy(nl.emi_paise)}${t('per_month')}`),
      kv(t('lbl_time'), duration(nl.months)),
      kv(t('lbl_interest'), easy(nl.interest_paise)),
      nl.charges_paise > 0 ? kv(t('lbl_fees'), easy(nl.charges_paise)) : null,
      kv(t('lbl_total'), easy(nl.total_cost_paise), diff < 0 ? 'good' : null),
    );
    const sameBox = h('div', { class: `plan-box ${diff > 0 ? 'best' : ''}` },
      h('h3', { text: t('opt_same') }),
      h('p', { class: 'sub', text: t('opt_same_sub', { emi: easy(same.monthly_paise) }) }),
      kv(t('lbl_monthly'), `${easy(same.monthly_paise)}${t('per_month')}`),
      kv(t('lbl_time'), same.months ? duration(same.months) : t('over_40')),
      kv(t('lbl_interest'), easy(same.interest_paise)),
      kv(t('lbl_total'), easy(same.total_cost_paise), diff > 0 ? 'good' : null),
    );
    out.push(h('div', { class: 'plan-compare' }, newBox, sameBox));

    // 3. Plain notes on money in and out.
    const notes = [];
    const allInterestOnly = picked.length && picked.every((l) => l.repayment_type === 'interest_only');
    if (allInterestOnly) {
      notes.push(t('rf_keep', { monthly: easy(r.current.monthly_paise), time: duration(nl.months), interest: easy(r.current.interest_only_for_tenure_paise), owed: easy(r.current.still_owed_after_tenure_paise) }));
    }
    notes.push(t('rf_now', { now: easy(r.current.monthly_paise) }));
    if (r.monthly_change_paise > 0) notes.push(t('rf_monthly_more', { amount: easy(r.monthly_change_paise) }));
    else if (r.monthly_change_paise < 0) notes.push(t('rf_monthly_less', { amount: easy(-r.monthly_change_paise) }));
    if (nl.cash_in_hand_paise < 0) notes.push(t('rf_pocket', { amount: easy(-nl.cash_in_hand_paise) }));
    else if (nl.cash_in_hand_paise > 0) notes.push(t('rf_in_hand', { amount: easy(nl.cash_in_hand_paise) }));
    out.push(h('ul', { class: 'plain-notes' }, notes.map((n) => h('li', { text: n }))));
    out.push(h('p', { class: 'faint small', text: t('rf_caution') }));
    return out;
  }

  // ---------- settings ----------
  const ACTION_TEXT = { create: 'added', update: 'changed', delete: 'deleted', reset: 'reset' };
  const ENTITY_TEXT = {
    income: 'income', expense: 'spending', contribution: 'family pool amount', loan: 'loan', loan_payment: 'loan payment',
    goal: 'goal', goal_entry: 'goal money', password: 'password',
  };

  function ownerCard() {
    const others = state.members.filter((m) => m.id !== state.user.id);
    const card = h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: 'Admin' }), h('span', { class: 'chip info', text: 'Owner' })),
      h('p', { class: 'muted small', style: 'margin-bottom:12px', text: 'You can enter anything for anyone (choose them in "Earned by", "Paid by", "Borrower"). Entries someone marks Private stay theirs alone.' }),
    );
    card.append(h('ul', { class: 'list' }, others.map((m) => h('li', {},
      h('div', { class: 'main' }, h('div', { class: 't', text: m.name }), h('div', { class: 's', text: `username: ${m.username}` })),
      h('button', { class: 'btn small', type: 'button', text: 'Set new password', onclick: () => openResetPassword(m) }),
    ))));
    const log = h('details', { style: 'margin-top:12px' }, h('summary', { class: 'small', text: 'Activity — who changed what' }));
    log.addEventListener('toggle', async () => {
      if (!log.open || log.dataset.loaded) return;
      log.dataset.loaded = '1';
      const rows = await get('activity');
      log.append(rows.length ? h('ul', { class: 'list' }, rows.map((r) => h('li', {},
        h('div', { class: 'main' },
          h('div', { class: 't', text: `${r.member_name || 'Someone'} ${ACTION_TEXT[r.action] || r.action} ${ENTITY_TEXT[r.entity] || r.entity}` }),
          h('div', { class: 's', text: new Date(r.at.replace(' ', 'T')).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) }),
        ),
      ))) : h('p', { class: 'faint', text: 'Nothing yet.' }));
    });
    card.append(log);
    return card;
  }

  function openResetPassword(m) {
    const form = formShell(async (fd) => {
      if (fd.get('new') !== fd.get('confirm')) throw new Error('The two passwords do not match.');
      await post(`members/${m.id}/password`, { new: fd.get('new') });
      dialog.close();
      toast(`New password set for ${m.name}. Tell them directly.`);
    }, 'Set password',
      h('p', { class: 'muted small', style: 'margin-bottom:12px', text: `${m.name} will be signed out on every device and sign in again with this password.` }),
      field('New password', input('new', '', { type: 'password', autocomplete: 'new-password', required: true }), 'At least 10 characters'),
      field('New password again', input('confirm', '', { type: 'password', autocomplete: 'new-password', required: true })),
    );
    openDialog(`Password for ${m.name}`, form);
  }

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

    const bd = await get('budgets');
    const budgetCard = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Category budgets' })),
      h('p', { class: 'muted small', style: 'margin-bottom:12px', text: 'A monthly target per category. Spending tab → Report shows actual against it.' }));
    const set = state.meta.expense_categories.filter((c) => bd.current[c] !== undefined);
    if (set.length) {
      budgetCard.append(h('div', {}, set.map((c) => h('div', { class: 'budget-row' },
        h('span', { class: 'name', text: (CATEGORY[c] || [c])[0] }),
        h('span', { class: 'money', text: `${fmt(bd.current[c])}/mo` }),
      ))));
    }
    budgetCard.append(formShell(async (fd) => {
      await post('budgets', { category: fd.get('category'), amount: fd.get('amount'), effective_from: fd.get('effective_from') });
      toast('Saved');
      render();
    }, 'Set budget',
      h('div', { class: 'grid-2', style: 'margin-top:14px' },
        field('Category', select('category', state.meta.expense_categories.map((c) => [c, (CATEGORY[c] || [c])[0]]), 'grocery')),
        field('Budget per month (₹)', moneyInput('amount', '', { required: true })),
      ),
      field('From', input('effective_from', first, { type: 'date', required: true }), 'Change it any time; old months keep the old budget.'),
    ));
    if (bd.history.length) {
      budgetCard.append(h('details', { style: 'margin-top:12px' }, h('summary', { class: 'small', text: 'History' }),
        h('ul', { class: 'list' }, bd.history.map((r) => h('li', {},
          h('div', { class: 'main' }, h('div', { class: 't', text: `${(CATEGORY[r.category] || [r.category])[0]} — ${fmt(r.amount_paise)}` }), h('div', { class: 's', text: `from ${dayLabel(r.effective_from)}` })),
          h('button', {
            class: 'btn small danger', type: 'button', text: 'Remove',
            onclick: async () => {
              if (!confirm('Remove this budget entry?')) return;
              await post(`budgets/${r.id}/delete`);
              render();
            },
          }),
        )))));
    }
    root.append(budgetCard);

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

    if (state.user.role === 'owner') root.append(ownerCard());

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
