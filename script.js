import { EN } from './src/translations.js';
import { initDemos } from './src/demos.js';

const $ = (selector) => document.querySelector(selector);
const nodes = [...document.querySelectorAll('[data-i18n]')];
const ariaNodes = [...document.querySelectorAll('[data-i18n-aria]')];
const altNodes = [...document.querySelectorAll('[data-i18n-alt]')];
const AR = Object.fromEntries(nodes.map(el => [el.dataset.i18n, el.textContent]));
for (const el of ariaNodes) AR[el.dataset.i18nAria] = el.getAttribute('aria-label');
for (const el of altNodes) AR[el.dataset.i18nAlt] = el.alt;
const languageButton = $('#language-toggle');
const menuButton = $('#menu-toggle');
const nav = $('#main-nav');
const mobile = matchMedia('(max-width:760px)');
const reduced = matchMedia('(prefers-reduced-motion:reduce)');
const viewport = $('#gateway-viewport');
const canvasHost = $('#gateway-canvas');
const status = $('#scene-status');
const playButton = $('#scene-play');
const pauseButton = $('#scene-pause');
const replayButton = $('#scene-replay');
const staticButton = $('#scene-static');
const stageNodes = [...document.querySelectorAll('[data-stage]')];
let language = 'ar';
let demos;
let scene = null;
let sceneState = reduced.matches ? 'reduced' : 'static';
let sceneStage = 3;
let requestId = 0;
let loading = false;
let timeoutId;

const sceneMessages = {
 ar: {
  static: 'الحركة اختيارية. شاهد كيف تتصل الأجزاء في مشهد قصير.',
  loading: 'نجهّز المشهد. تبقى الصورة متاحة أثناء التحميل.',
  ready: 'المشهد جاهز للتشغيل.',
  playing: ['١ من ٤ — وحدات منفصلة، ومعنى يتشكّل.', '٢ من ٤ — العلاقات تصل بين الوظائف.', '٣ من ٤ — الأجزاء تنتظم في بنية واحدة.', '٤ من ٤ — بوابة الوضوح تستقر.'],
  paused: 'المشهد متوقف مؤقتًا. يمكنك متابعة الحركة.',
  complete: 'اكتمل المشهد واستقرت البوابة. يمكنك إعادة المشاهدة.',
  reduced: 'تظهر الصورة الثابتة احترامًا لإعداد تقليل الحركة في جهازك.',
  error: 'تعذّر تشغيل الحركة على هذا الجهاز. الصورة الثابتة متاحة، ويمكنك المحاولة مجددًا.',
  resume: 'متابعة المشهد'
 },
 en: {
  static: 'Motion is optional. See the parts connect in a short scene.',
  loading: 'Preparing the scene. The still image remains available.',
  ready: 'The scene is ready to play.',
  playing: ['1 of 4 — Separate modules. A meaning taking shape.', '2 of 4 — Relationships connect the functions.', '3 of 4 — The parts form one structure.', '4 of 4 — The Clarity Gateway settles.'],
  paused: 'The scene is paused. You can resume when you are ready.',
  complete: 'The scene has finished and the gateway has settled. You can replay it.',
  reduced: 'A still image respects your device’s reduced-motion setting.',
  error: 'Motion could not start on this device. The still image is available; you can try again.',
  resume: 'Resume scene'
 }
};

function updateSceneUI() {
 const dict = language === 'en' ? EN : AR;
 const message = sceneMessages[language];
 playButton.disabled = reduced.matches || loading || sceneState === 'playing';
 playButton.textContent = sceneState === 'paused' ? message.resume : dict.scenePlay;
 pauseButton.disabled = sceneState !== 'playing';
 replayButton.disabled = !scene || loading || reduced.matches;
 staticButton.disabled = !scene && !loading;
 stageNodes.forEach((node, index) => {
   node.classList.toggle('is-current', index === sceneStage);
   if (index === sceneStage) node.setAttribute('aria-current', 'step');
   else node.removeAttribute('aria-current');
 });
 const text = sceneState === 'playing' ? message.playing[sceneStage] : message[sceneState] || message.static;
 if (status.textContent !== text) status.textContent = text;
}

function showStill(nextState = 'static') {
 requestId += 1;
 clearTimeout(timeoutId);
 loading = false;
 scene?.dispose();
 scene = null;
 viewport.classList.remove('is-live');
 sceneState = nextState;
 sceneStage = 3;
 updateSceneUI();
}

async function startScene() {
 if (reduced.matches || loading) return;
 if (scene) {
   viewport.classList.add('is-live');
   if (sceneState === 'paused') scene.resume(); else scene.play();
   return;
 }
 const currentRequest = ++requestId;
 loading = true;
 sceneState = 'loading';
 updateSceneUI();
 timeoutId = setTimeout(() => {
   if (currentRequest === requestId) showStill('error');
 }, 8000);
 try {
   const { mountGateway } = await import('./src/clarity-scene.js');
   if (currentRequest !== requestId || reduced.matches) return;
   const mounted = await mountGateway(canvasHost, {
     onStage(index) {
       if (currentRequest !== requestId) return;
       sceneStage = index;
       updateSceneUI();
     },
     onState(nextState) {
       if (currentRequest !== requestId) return;
       sceneState = nextState;
       if (nextState === 'ready') viewport.classList.add('is-live');
       updateSceneUI();
     },
     onError(error) {
       if (currentRequest !== requestId) return;
       if (import.meta.env.DEV) console.warn('Gateway fallback:', error.message);
       showStill('error');
     }
   });
   if (currentRequest !== requestId || reduced.matches) { mounted.dispose(); return; }
   scene = mounted;
   clearTimeout(timeoutId);
   loading = false;
   viewport.classList.add('is-live');
   scene.play();
 } catch (error) {
   if (currentRequest !== requestId) return;
   if (import.meta.env.DEV) console.warn('Gateway unavailable:', error.message);
   showStill('error');
 }
}

function setMenu(open, restoreFocus = false) {
 nav.classList.toggle('is-open', open);
 menuButton.setAttribute('aria-expanded', String(open));
 menuButton.textContent = open ? (language === 'ar' ? 'إغلاق' : 'Close') : (language === 'ar' ? AR.menu : EN.menu);
 if (restoreFocus) menuButton.focus();
}

function setLanguage(value) {
 language = value === 'en' ? 'en' : 'ar';
 const dict = language === 'en' ? EN : AR;
 document.documentElement.lang = language;
 document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
 for (const node of nodes) node.textContent = dict[node.dataset.i18n] ?? AR[node.dataset.i18n];
 for (const node of ariaNodes) node.setAttribute('aria-label', dict[node.dataset.i18nAria] ?? AR[node.dataset.i18nAria]);
 for (const node of altNodes) node.alt = dict[node.dataset.i18nAlt] ?? AR[node.dataset.i18nAlt];
 languageButton.textContent = language === 'ar' ? 'English' : 'العربية';
 languageButton.lang = language === 'ar' ? 'en' : 'ar';
 languageButton.setAttribute('aria-label', language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
 document.title = language === 'ar' ? 'Mizaj Studio | مزاج ستوديو' : 'Mizaj Studio | From complexity to clarity';
 $('meta[name="description"]').content = language === 'ar'
  ? 'مزاج ستوديو من بغداد. مواقع وتجارب رقمية بالعربية والإنجليزية، كتالوجات، وأنظمة تُبنى لطريقة عملك.'
  : 'Mizaj Studio, a digital studio in Baghdad. Arabic and English websites, interactive experiences, catalogs and business tools.';
 demos?.setLanguage(language);
 setMenu(menuButton.getAttribute('aria-expanded') === 'true');
 updateSceneUI();
 try { localStorage.setItem('mizaj-lang', language); } catch { /* Optional preference storage. */ }
}

languageButton.addEventListener('click', () => setLanguage(language === 'ar' ? 'en' : 'ar'));
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', event => {
 const link = event.target.closest('a[href^="#"]');
 if (link && mobile.matches) {
   setMenu(false);
   const target = document.querySelector(link.getAttribute('href'));
   target?.setAttribute('tabindex', '-1');
   target?.focus({ preventScroll:true });
 }
});
document.addEventListener('keydown', event => {
 if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
document.addEventListener('click', event => {
 if (!event.target.closest('.navigation') && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
});
mobile.addEventListener('change', () => setMenu(false, mobile.matches && nav.contains(document.activeElement)));
reduced.addEventListener('change', () => showStill(reduced.matches ? 'reduced' : 'static'));
playButton.addEventListener('click', startScene);
pauseButton.addEventListener('click', () => scene?.pause());
replayButton.addEventListener('click', () => scene?.replay());
staticButton.addEventListener('click', () => showStill(reduced.matches ? 'reduced' : 'static'));
for (const link of document.querySelectorAll('[data-demo-link]')) {
 link.addEventListener('click', () => document.querySelector('[data-demo-tab="' + link.dataset.demoLink + '"]')?.click());
}
window.addEventListener('pagehide', event => {
 if (event.persisted) scene?.pause(); else { scene?.dispose(); demos?.dispose(); }
});

document.documentElement.classList.add('js-enabled');
languageButton.hidden = false;
menuButton.hidden = false;
$('#scene-controls').hidden = false;
$('#year').textContent = String(new Date().getFullYear());
let storedLanguage = 'ar';
try { storedLanguage = localStorage.getItem('mizaj-lang') || 'ar'; } catch { /* Arabic default. */ }
demos = initDemos({ language:storedLanguage });
setLanguage(storedLanguage);
