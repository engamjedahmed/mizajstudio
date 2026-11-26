import { calculateNeed, DEMO_LIMITS } from './demo-math.js';

const PRODUCTS = Object.freeze([
  { id: 'DEMO-01', category: 'print', ar: ['بطاقة تعريف', 'ورق مطفأ · 9 × 5 سم'], en: ['ID card', 'Matte paper · 9 × 5 cm'] },
  { id: 'DEMO-02', category: 'print', ar: ['دفتر ملاحظات A5', '40 ورقة · غلاف بلون واحد'], en: ['A5 notebook', '40 sheets · single-color cover'] },
  { id: 'DEMO-03', category: 'packaging', ar: ['حقيبة قماش', 'مقاس توضيحي · طباعة بلون واحد'], en: ['Canvas bag', 'Illustrative size · single-color print'] },
  { id: 'DEMO-04', category: 'packaging', ar: ['صندوق ورقي', 'كرتون بسيط · 20 × 15 سم'], en: ['Paper box', 'Plain cardboard · 20 × 15 cm'] },
  { id: 'DEMO-05', category: 'display', ar: ['بطاقة عرض', 'حامل مكتبي · 15 × 10 سم'], en: ['Display card', 'Desktop stand · 15 × 10 cm'] },
  { id: 'DEMO-06', category: 'display', ar: ['لوحة إرشادية', 'نموذج مكتبي · 30 × 20 سم'], en: ['Information sign', 'Desktop example · 30 × 20 cm'] },
]);

const COPY = {
  ar: {
    sample: 'بيانات توضيحية',
    catalogTitle: 'كتالوج تجريبي',
    catalogIntro: 'جرّب البحث والتصفية وتجميع الاختيارات. العناصر والمواصفات افتراضية؛ هذه ليست منتجات معروضة للبيع.',
    search: 'ابحث عن عنصر', searchPlaceholder: 'الاسم أو المواصفة أو الرمز',
    category: 'الفئة', all: 'كل الفئات', print: 'مطبوعات', packaging: 'تغليف', display: 'عرض',
    add: 'أضف للاختيارات', remove: 'إزالة', quantity: 'الكمية', decrease: 'تقليل الكمية', increase: 'زيادة الكمية',
    summary: 'اختياراتك التجريبية', empty: 'أضف عنصرًا لتجربة الملخص.',
    noMatches: 'لا توجد عناصر تطابق بحثك. جرّب اسمًا آخر أو اختر كل الفئات.',
    noOrder: 'هذا ملخص توضيحي، وليس طلب شراء. لا تُرسل هذه الاختيارات إلى أي جهة.',
    clear: 'امسح الاختيارات', reset: 'إعادة ضبط النموذج', copy: 'انسخ الملخص',
    copied: 'نُسخ الملخص التوضيحي. لم يُرسل إلى أي جهة.',
    manualCopy: 'النسخ التلقائي غير متاح. حدّد النص أدناه وانسخه يدويًا.',
    manualLabel: 'نص الملخص للنسخ اليدوي', copyHeading: 'اختيارات توضيحية — ليست طلب شراء',
    copyFooter: 'أسماء ومواصفات افتراضية. لا توجد أسعار أو معلومات مخزون فعلية.',
    removed: 'أُزيل العنصر من الاختيارات.', cleared: 'مُسحت الاختيارات.', resetDone: 'أُعيد ضبط النموذج.',
    qtyError: 'أدخل كمية صحيحة من 1 إلى 99.',
    resultCount: n => `${n} عناصر ظاهرة`, selectedCount: (n, units) => `${n} أصناف مختارة · ${units} وحدة`,
    updated: (name, n) => `كمية ${name}: ${n}.`,
    plannerTitle: 'مخطّط احتياج مبسّط',
    plannerIntro: 'عدّل الأرقام لترى أثر المخزون ووقت التوريد. القيم الأولية توضيحية، والحساب يعتمد على المتوسط الذي تُدخله.',
    weekly: 'متوسط الاستخدام الأسبوعي', stock: 'المخزون الحالي', onOrder: 'الكمية قيد التوريد',
    leadWeeks: 'مدة التوريد', safetyWeeks: 'هامش الأمان', units: 'وحدة', perWeek: 'وحدة / أسبوع', weeks: 'أسبوع',
    calculate: 'احسب الاحتياج', resultTitle: 'الكمية الإضافية المقترحة', resultEmpty: 'أدخل القيم واضغط «احسب الاحتياج».',
    zero: 'لا توجد كمية إضافية مطلوبة وفق هذه المدخلات.',
    formula: 'الكمية الإضافية = الأعلى بين صفر ونتيجة التقريب للأعلى: [الاستخدام الأسبوعي × (مدة التوريد + هامش الأمان) − المخزون − الكمية قيد التوريد].',
    assumption: 'نفترض ثبات المتوسط الأسبوعي ووصول الكمية قيد التوريد ضمن الفترة المطلوبة. هذا تمرين حسابي؛ لا يتنبأ بالطلب ولا يرتبط بالمخزون أو بنظام إدارة.',
    required: 'أدخل قيمة رقمية.', range: max => `استخدم رقمًا من 0 إلى ${max}.`,
    fixInputs: 'راجع الحقول الموضحة قبل الحساب.', stale: 'تغيّرت المدخلات. اضغط «احسب الاحتياج» لتحديث النتيجة.',
    calculated: n => `الكمية الإضافية المقترحة: ${n} وحدة.`,
  },
  en: {
    sample: 'Sample data',
    catalogTitle: 'Catalog demo',
    catalogIntro: 'Try searching, filtering, and collecting a selection. All items and specifications are fictional; these products are not offered for sale.',
    search: 'Search items', searchPlaceholder: 'Name, specification, or code',
    category: 'Category', all: 'All categories', print: 'Print', packaging: 'Packaging', display: 'Display',
    add: 'Add to selection', remove: 'Remove', quantity: 'Quantity', decrease: 'Decrease quantity', increase: 'Increase quantity',
    summary: 'Your sample selection', empty: 'Add an item to try the summary.',
    noMatches: 'No items match your search. Try another name or select all categories.',
    noOrder: 'This is a sample summary, not a purchase order. Your selections are not sent anywhere.',
    clear: 'Clear selection', reset: 'Reset demo', copy: 'Copy summary',
    copied: 'The sample summary was copied. Nothing was sent.',
    manualCopy: 'Automatic copying is unavailable. Select the text below and copy it manually.',
    manualLabel: 'Summary text for manual copying', copyHeading: 'Sample selection — not a purchase order',
    copyFooter: 'Fictional names and specifications. No prices or live inventory data.',
    removed: 'The item was removed from the selection.', cleared: 'The selection was cleared.', resetDone: 'The demo was reset.',
    qtyError: 'Enter a whole quantity from 1 to 99.',
    resultCount: n => `${n} items shown`, selectedCount: (n, units) => `${n} selected items · ${units} units`,
    updated: (name, n) => `${name} quantity: ${n}.`,
    plannerTitle: 'Simple needs planner',
    plannerIntro: 'Change the numbers to explore stock and lead time. The starting values are examples; the calculation uses the average you enter.',
    weekly: 'Average weekly usage', stock: 'Current stock', onOrder: 'Units on order',
    leadWeeks: 'Lead time', safetyWeeks: 'Safety allowance', units: 'units', perWeek: 'units / week', weeks: 'weeks',
    calculate: 'Calculate need', resultTitle: 'Suggested additional quantity', resultEmpty: 'Enter values, then choose “Calculate need”.',
    zero: 'No additional units are needed under these inputs.',
    formula: 'Additional quantity = the greater of zero and the rounded-up result of: [weekly usage × (lead time + safety allowance) − stock − units on order].',
    assumption: 'Assumes constant average weekly usage and that units on order arrive within the required period. This is an arithmetic exercise, not demand forecasting or a connected inventory or management system.',
    required: 'Enter a numeric value.', range: max => `Use a number from 0 to ${max}.`,
    fixInputs: 'Review the indicated fields before calculating.', stale: 'Inputs changed. Choose “Calculate need” to update the result.',
    calculated: n => `Suggested additional quantity: ${n} units.`,
  },
};

const PLANNER_DEFAULTS = Object.freeze({ weekly: '40', stock: '50', onOrder: '10', leadWeeks: '2', safetyWeeks: '1' });
const FIELD_KEYS = Object.keys(PLANNER_DEFAULTS);
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const normalizeSearch = value => value.toLocaleLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا').trim();

/** Mount the two local-only demos inside the existing #demo-content panel. */
export function initDemos({ language = 'ar' } = {}) {
  const root = document.getElementById('demo-content');
  if (!root) return { setLanguage() {}, dispose() {} };
  const tabs = [...document.querySelectorAll('[data-demo-tab]')]
    .filter(tab => ['catalog', 'planner'].includes(tab.dataset.demoTab));
  const state = {
    language: language === 'en' ? 'en' : 'ar', active: 'catalog', query: '', category: 'all',
    selection: new Map(), planner: { ...PLANNER_DEFAULTS }, result: null, errors: {}, dirty: false,
  };
  const controller = new AbortController();
  const { signal } = controller;
  let disposed = false;
  let copyAttempt = 0;
  const t = () => COPY[state.language];
  const number = value => new Intl.NumberFormat(state.language === 'ar' ? 'ar-IQ' : 'en', { maximumFractionDigits: 6 }).format(value);
  const productName = product => product[state.language][0];
  const announce = text => {
    const status = root.querySelector('#demo-status');
    if (status) status.textContent = text;
  };

  function syncTabs() {
    tabs.forEach(tab => {
      const active = tab.dataset.demoTab === state.active;
      if (!tab.id) tab.id = `demo-tab-${tab.dataset.demoTab}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', root.id);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('is-active', active);
    });
    root.setAttribute('role', 'tabpanel');
    const activeTab = tabs.find(tab => tab.dataset.demoTab === state.active);
    if (activeTab) root.setAttribute('aria-labelledby', activeTab.id);
    root.lang = state.language;
    root.dir = state.language === 'ar' ? 'rtl' : 'ltr';
  }

  function catalogShell() {
    const c = t();
    return `<span class="demo-tag">${c.sample}</span>
      <h3>${c.catalogTitle}</h3><p>${c.catalogIntro}</p>
      <div class="demo-toolbar">
        <label class="demo-field demo-search" for="demo-search">${c.search}
          <input id="demo-search" type="search" autocomplete="off" placeholder="${c.searchPlaceholder}" value="${escapeHTML(state.query)}" data-demo-search>
        </label>
        <label class="demo-field demo-filter" for="demo-category">${c.category}
          <select id="demo-category" data-demo-category>${['all', 'print', 'packaging', 'display'].map(key => `<option value="${key}"${state.category === key ? ' selected' : ''}>${c[key]}</option>`).join('')}</select>
        </label>
      </div>
      <p id="demo-result-count" class="demo-product-meta"></p>
      <div class="demo-products" id="demo-products"></div>
      <section class="demo-summary" aria-labelledby="demo-summary-title">
        <h4 id="demo-summary-title" tabindex="-1">${c.summary}</h4>
        <p id="demo-selection-count"></p><ul id="demo-selection-list"></ul>
        <p>${c.noOrder}</p>
        <div class="demo-product-actions">
          <button class="button button-small" type="button" data-demo-action="copy">${c.copy}</button>
          <button class="button button-small button-secondary" type="button" data-demo-action="clear">${c.clear}</button>
          <button class="button button-small button-secondary demo-reset" type="button" data-demo-action="reset-catalog">${c.reset}</button>
        </div><div id="demo-copy-fallback"></div>
      </section>`;
  }

  function visibleProducts() {
    const query = normalizeSearch(state.query);
    return PRODUCTS.filter(product => (state.category === 'all' || product.category === state.category)
      && (!query || normalizeSearch([product.id, ...product.ar, ...product.en].join(' ')).includes(query)));
  }

  function renderProducts({ announceResults = false } = {}) {
    const c = t();
    const products = visibleProducts();
    const container = root.querySelector('#demo-products');
    if (!container) return;
    container.innerHTML = products.length ? products.map(product => {
      const [name, spec] = product[state.language];
      const quantity = state.selection.get(product.id) || 1;
      const selected = state.selection.has(product.id);
      return `<article class="demo-product" data-demo-product="${product.id}">
        <span class="demo-product-meta" dir="ltr">${product.id}</span>
        <h4>${name}</h4><p class="demo-product-meta">${spec}</p>
        <span class="demo-tag">${c[product.category]}</span>
        <div class="demo-product-actions">
          <button type="button" class="button button-small" data-demo-action="add" data-product-id="${product.id}"${selected ? ' hidden' : ''}>${c.add}<span class="sr-only">: ${name}</span></button>
          <div class="demo-quantity-controls" data-demo-quantity-controls${selected ? '' : ' hidden'}>
            <label for="quantity-${product.id}">${c.quantity}<span class="sr-only">: ${name}</span></label>
            <div class="demo-quantity-row">
              <button type="button" class="button button-small button-secondary" data-demo-action="decrease" data-product-id="${product.id}" aria-label="${c.decrease}: ${name}"${quantity <= 1 ? ' disabled' : ''}>−</button>
              <input id="quantity-${product.id}" type="number" min="1" max="99" step="1" inputmode="numeric" value="${quantity}" data-demo-quantity="${product.id}" aria-describedby="quantity-error-${product.id}">
              <button type="button" class="button button-small button-secondary" data-demo-action="increase" data-product-id="${product.id}" aria-label="${c.increase}: ${name}"${quantity >= 99 ? ' disabled' : ''}>+</button>
            </div>
            <p class="demo-field-error" id="quantity-error-${product.id}" hidden>${c.qtyError}</p>
            <button type="button" class="button button-small button-secondary" data-demo-action="remove" data-product-id="${product.id}" aria-label="${c.remove}: ${name}">${c.remove}</button>
          </div>
        </div></article>`;
    }).join('') : `<p class="demo-empty">${c.noMatches}</p>`;
    const count = c.resultCount(number(products.length));
    root.querySelector('#demo-result-count').textContent = count;
    if (announceResults) announce(count);
  }

  function updateCard(id) {
    const card = root.querySelector(`[data-demo-product="${id}"]`);
    if (!card) return;
    const quantity = state.selection.get(id) || 1;
    const selected = state.selection.has(id);
    card.querySelector('[data-demo-action="add"]').hidden = selected;
    card.querySelector('[data-demo-quantity-controls]').hidden = !selected;
    const input = card.querySelector('[data-demo-quantity]');
    input.value = String(quantity);
    input.removeAttribute('aria-invalid');
    card.querySelector('.demo-field-error').hidden = true;
    card.querySelector('[data-demo-action="decrease"]').disabled = quantity <= 1;
    card.querySelector('[data-demo-action="increase"]').disabled = quantity >= 99;
  }

  function renderSummary() {
    const c = t();
    const selected = PRODUCTS.filter(product => state.selection.has(product.id));
    const list = root.querySelector('#demo-selection-list');
    if (!list) return;
    list.innerHTML = selected.map(product => `<li class="demo-selection-item"><span>${productName(product)} <bdi>× ${number(state.selection.get(product.id))}</bdi></span>
      <button type="button" class="button button-small button-secondary" data-demo-action="remove-summary" data-product-id="${product.id}" aria-label="${c.remove}: ${productName(product)}">${c.remove}</button></li>`).join('');
    list.hidden = !selected.length;
    const total = [...state.selection.values()].reduce((sum, value) => sum + value, 0);
    root.querySelector('#demo-selection-count').textContent = selected.length
      ? c.selectedCount(number(selected.length), number(total)) : c.empty;
    root.querySelector('[data-demo-action="copy"]').disabled = !selected.length;
    root.querySelector('[data-demo-action="clear"]').disabled = !selected.length;
    root.querySelector('#demo-copy-fallback').replaceChildren();
    copyAttempt += 1;
  }

  function setQuantity(id, quantity, { announceChange = true } = {}) {
    if (!PRODUCTS.some(product => product.id === id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    state.selection.set(id, quantity);
    updateCard(id);
    renderSummary();
    if (announceChange) announce(t().updated(productName(PRODUCTS.find(product => product.id === id)), number(quantity)));
  }

  function plannerShell() {
    const c = t();
    return `<span class="demo-tag">${c.sample}</span>
      <h3>${c.plannerTitle}</h3><p>${c.plannerIntro}</p>
      <form id="demo-planner-form" novalidate>
        <div class="demo-input-grid">${FIELD_KEYS.map(key => {
          const unit = key === 'weekly' ? c.perWeek : key.endsWith('Weeks') ? c.weeks : c.units;
          return `<div class="demo-field">
            <label for="demo-${key}">${c[key]} <span class="demo-product-meta">(${unit})</span></label>
            <input id="demo-${key}" name="${key}" type="number" min="0" max="${DEMO_LIMITS[key]}" step="any" inputmode="decimal" required value="${escapeHTML(state.planner[key])}" data-planner-field="${key}" aria-describedby="demo-error-${key}">
            <p id="demo-error-${key}" class="demo-field-error" hidden></p>
          </div>`;
        }).join('')}</div>
        <div class="demo-product-actions">
          <button class="button button-small" type="submit">${c.calculate}</button>
          <button class="button button-small button-secondary demo-reset" type="button" data-demo-action="reset-planner">${c.reset}</button>
        </div>
      </form>
      <section class="demo-output" aria-labelledby="demo-output-title">
        <h4 id="demo-output-title">${c.resultTitle}</h4>
        <div id="demo-planner-result"></div><p>${c.formula}</p><p class="demo-product-meta">${c.assumption}</p>
      </section>`;
  }

  function renderPlannerResult() {
    const output = root.querySelector('#demo-planner-result');
    if (!output) return;
    const c = t();
    if (state.dirty) output.innerHTML = `<p>${c.stale}</p>`;
    else if (state.result === null) output.innerHTML = `<p>${c.resultEmpty}</p>`;
    else output.innerHTML = `<p class="demo-result-value"><strong>${number(state.result)}</strong> ${c.units}</p>${state.result === 0 ? `<p>${c.zero}</p>` : ''}`;
    for (const key of FIELD_KEYS) {
      const field = root.querySelector(`[data-planner-field="${key}"]`);
      const error = root.querySelector(`#demo-error-${key}`);
      if (state.errors[key]) {
        field.setAttribute('aria-invalid', 'true');
        error.hidden = false;
        error.textContent = state.errors[key] === 'required' ? c.required : c.range(number(DEMO_LIMITS[key]));
      } else {
        field.removeAttribute('aria-invalid');
        error.hidden = true;
        error.textContent = '';
      }
    }
  }

  function render() {
    copyAttempt += 1;
    syncTabs();
    root.innerHTML = (state.active === 'catalog' ? catalogShell() : plannerShell())
      + '<p id="demo-status" class="demo-status" role="status" aria-live="polite" aria-atomic="true"></p>';
    if (state.active === 'catalog') { renderProducts(); renderSummary(); }
    else renderPlannerResult();
  }

  async function copySelection() {
    if (!state.selection.size) return;
    const c = t();
    const text = [c.copyHeading, ...PRODUCTS.filter(product => state.selection.has(product.id))
      .map(product => `${product.id} — ${productName(product)} × ${state.selection.get(product.id)}`), '', c.copyFooter].join('\n');
    const attempt = ++copyAttempt;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (!disposed && attempt === copyAttempt) announce(t().copied);
    } catch {
      if (disposed || attempt !== copyAttempt || state.active !== 'catalog') return;
      const container = root.querySelector('#demo-copy-fallback');
      container.innerHTML = `<label class="demo-field" for="demo-copy-text">${t().manualLabel}</label><textarea id="demo-copy-text" rows="5" readonly dir="auto"></textarea>`;
      const textarea = container.querySelector('textarea');
      textarea.value = text;
      textarea.focus();
      textarea.select();
      announce(t().manualCopy);
    }
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-demo-action]');
    if (!button || !root.contains(button) || button.disabled) return;
    const action = button.dataset.demoAction;
    const id = button.dataset.productId;
    if (action === 'add') {
      setQuantity(id, 1);
      root.querySelector(`#quantity-${id}`)?.focus({ preventScroll: true });
    } else if (action === 'increase' || action === 'decrease') {
      setQuantity(id, (state.selection.get(id) || 1) + (action === 'increase' ? 1 : -1));
    } else if (action === 'remove' || action === 'remove-summary') {
      state.selection.delete(id);
      updateCard(id);
      renderSummary();
      const focusTarget = action === 'remove' ? root.querySelector(`[data-demo-product="${id}"] [data-demo-action="add"]`) : root.querySelector('#demo-summary-title');
      focusTarget?.focus({ preventScroll: true });
      announce(t().removed);
    } else if (action === 'clear' || action === 'reset-catalog') {
      state.selection.clear();
      if (action === 'reset-catalog') { state.query = ''; state.category = 'all'; render(); root.querySelector('#demo-search')?.focus({ preventScroll: true }); }
      else { PRODUCTS.forEach(product => updateCard(product.id)); renderSummary(); root.querySelector('#demo-summary-title')?.focus({ preventScroll: true }); }
      announce(action === 'clear' ? t().cleared : t().resetDone);
    } else if (action === 'copy') {
      void copySelection();
    } else if (action === 'reset-planner') {
      state.planner = { ...PLANNER_DEFAULTS }; state.result = null; state.errors = {}; state.dirty = false;
      render(); root.querySelector('#demo-weekly')?.focus({ preventScroll: true }); announce(t().resetDone);
    }
  }, { signal });

  root.addEventListener('input', event => {
    const field = event.target;
    if (field.matches('[data-demo-search]')) {
      state.query = field.value;
      renderProducts({ announceResults: true });
    } else if (field.matches('[data-demo-quantity]')) {
      const value = field.valueAsNumber;
      const invalid = !Number.isInteger(value) || value < 1 || value > 99;
      field.setAttribute('aria-invalid', String(invalid));
      root.querySelector(`#quantity-error-${field.dataset.demoQuantity}`).hidden = !invalid;
      if (!invalid) {
        // Keep the input node and its caret while typing.
        state.selection.set(field.dataset.demoQuantity, value);
        const card = field.closest('[data-demo-product]');
        card.querySelector('[data-demo-action="decrease"]').disabled = value <= 1;
        card.querySelector('[data-demo-action="increase"]').disabled = value >= 99;
        renderSummary();
        announce(t().updated(productName(PRODUCTS.find(product => product.id === field.dataset.demoQuantity)), number(value)));
      }
    } else if (field.matches('[data-planner-field]')) {
      state.planner[field.dataset.plannerField] = field.value;
      delete state.errors[field.dataset.plannerField];
      if (state.result !== null) state.dirty = true;
      renderPlannerResult();
    }
  }, { signal });

  root.addEventListener('change', event => {
    const field = event.target;
    if (field.matches('[data-demo-category]')) {
      state.category = field.value;
      renderProducts({ announceResults: true });
    }
  }, { signal });

  root.addEventListener('focusout', event => {
    const field = event.target;
    if (field.matches('[data-demo-quantity]') && field.getAttribute('aria-invalid') === 'true') {
      field.value = String(state.selection.get(field.dataset.demoQuantity) || 1);
      field.removeAttribute('aria-invalid');
      root.querySelector(`#quantity-error-${field.dataset.demoQuantity}`).hidden = true;
      announce(t().qtyError);
    }
  }, { signal });

  root.addEventListener('submit', event => {
    if (event.target.id !== 'demo-planner-form') return;
    event.preventDefault();
    state.errors = {};
    const values = {};
    FIELD_KEYS.forEach(key => {
      const raw = state.planner[key];
      const value = Number(raw);
      if (!raw.trim() || !Number.isFinite(value)) state.errors[key] = 'required';
      else if (value < 0 || value > DEMO_LIMITS[key]) state.errors[key] = 'range';
      else values[key] = value;
    });
    if (Object.keys(state.errors).length) {
      state.result = null; state.dirty = false;
      renderPlannerResult();
      root.querySelector(`[data-planner-field="${Object.keys(state.errors)[0]}"]`)?.focus({ preventScroll: true });
      announce(t().fixInputs);
      return;
    }
    state.result = calculateNeed(values); state.dirty = false;
    renderPlannerResult();
    announce(t().calculated(number(state.result)));
  }, { signal });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { state.active = tab.dataset.demoTab; render(); }, { signal });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const direction = (event.key === 'ArrowRight' ? 1 : -1) * (state.language === 'ar' ? -1 : 1);
        next = (index + direction + tabs.length) % tabs.length;
      } else return;
      event.preventDefault();
      tabs[next].focus();
      state.active = tabs[next].dataset.demoTab;
      render();
    }, { signal });
  });

  render();
  return {
    setLanguage(nextLanguage) {
      if (disposed) return;
      state.language = nextLanguage === 'en' ? 'en' : 'ar';
      render();
    },
    dispose() {
      if (disposed) return;
      disposed = true; copyAttempt += 1; controller.abort();
      root.replaceChildren();
    },
  };
}
