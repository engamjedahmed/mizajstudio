# Mizaj Studio — educational demo scope

## What this implementation provides

Two frontend-only demonstrations share the existing `#demo-content` panel. They use no API, backend, local storage, analytics, or personal data. Inputs remain in memory while the page is open. Nothing is sent to WhatsApp, a customer, or an order system.

This is a deliberately small demonstration implementation. It does not claim to complete all proposed Phase 02 features or reproduce an earlier unpublished source archive.

### Catalog

- Six fictional stationery, packaging, and display examples, each clearly labelled as sample data.
- Arabic and English names and specifications; no prices, client names, logos, images, or actual inventory claims.
- Search by either language, specification, or example code; filter by three categories.
- Add and remove selections, and enter whole quantities from 1 through 99.
- Selected items remain selected when the search or category changes.
- Clear selection and reset the entire catalog independently.
- Copy a plain-text sample summary only after the user clicks the copy button. If clipboard access is unavailable or denied, a labelled read-only textarea is selected for manual copying.
- The selection is explicitly not a purchase order. Copying does not send it anywhere.

### Needs planner

Five user-editable numeric inputs are used: average weekly usage, current stock, units on order, lead time in weeks, and safety allowance in weeks.

```
additional = max(0, ceil(weekly × (leadWeeks + safetyWeeks) − stock − onOrder))
```

The result is rounded up to whole additional units. Initial values are illustrative: 40 units/week, 50 units in stock, 10 units on order, 2 weeks lead time, and 1 week safety allowance. The resulting 60 units are a worked example, not a business recommendation.

Assumptions are visible in both languages: the entered weekly average stays constant and quantities on order arrive within the required period. This is arithmetic, not AI forecasting, inventory integration, or an ERP system.

Inputs must be finite, nonnegative numbers. Decimal values are accepted. Limits: weekly usage 1,000,000; stock and on-order units 1,000,000,000 each; lead and safety time 104 weeks each. Invalid fields are marked, described, and focused on submission. Changing inputs clears the visible prior result until the user calculates again. Reset restores the example inputs.

## Integration contract

```js
import { initDemos } from './src/demos.js';
const demos = initDemos({ language: 'ar' });
demos.setLanguage('en');
// Before unmounting:
demos.dispose();
```

The parent page owns the tab group and its labels. Provide buttons with `data-demo-tab="catalog"` and `data-demo-tab="planner"`, preferably within an element with `role="tablist"` and a localized accessible label. The module manages each tab's `aria-selected`, `tabindex`, panel association, and arrow/Home/End keyboard handling. It does not alter the page's global language, styles, navigation, or external contact controls.

The module renders exclusively inside `#demo-content`. It preserves selections, planner values, and the active tab when `setLanguage()` runs. It removes its event listeners and generated panel content on `dispose()`. Do not mount two active instances onto the same panel; dispose the old instance first.

The page stylesheet should cover the supplied `demo-*` classes, `.button`, `.button-small`, `.button-secondary`, and `.sr-only`. Preserve native `[hidden]` behavior and obvious focus and disabled states. Do not hide field labels or error messages.

Status messages use one polite, atomic live region. Each input has a label. Numeric errors have associated descriptions. There is no autoplay or motion in these demonstrations.

## Pure calculation API

`src/demo-math.js` exports `calculateNeed({ weekly, stock, onOrder, leadWeeks, safetyWeeks })`, which returns a whole nonnegative number and rejects non-numeric, non-finite, negative, missing, or over-limit values. `DEMO_LIMITS` exposes the UI's shared bounds. Decimal arithmetic prevents an extra unit caused only by binary arithmetic residue near an integer, while preserving genuinely positive fractional needs.

## Validation boundaries

The pure arithmetic and input boundaries can be checked in Node. Browser layout, tab focus, keyboard actions, clipboard fallback, language changes, and the surrounding page must also be reviewed in the assembled site. No physical-device result is claimed by this module's implementation.
