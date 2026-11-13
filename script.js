// Arabic lives in the HTML, keeping the site useful before JavaScript loads.
const EN = {
  "skip": "Skip to content",
  "brand.home": "MIZAJ STUDIO — Home",
  "nav.label": "Main navigation",
  "nav.services": "Services",
  "nav.about": "About Mizaj",
  "nav.course": "The course",
  "nav.contact": "Let's talk",
  "menu.open": "Open menu",
  "menu.close": "Close menu",
  "hero.eyebrow": "Digital studio · Baghdad, Iraq",
  "hero.title1": "Your idea.",
  "hero.title2": "A new energy.",
  "hero.lead": "We turn your ideas into digital solutions that feel like you. Systems that organize your work, websites that express your identity, and catalogs that let your products speak.",
  "hero.cta1": "Let's start your project",
  "hero.cta2": "Explore our services",
  "hero.credit": "Founded by Eng. Amjad Ahmed",
  "hero.bottom": "Creative thinking. Practical solutions.",
  "strip.systems": "Business systems",
  "strip.web": "Digital experiences",
  "strip.catalogs": "Professional catalogs",
  "services.label": "What we do",
  "services.title": "Every idea has a way forward.",
  "services.sub": "We choose technology that works for your business and design it around your needs.",
  "services.s1.t": "A clearer view of your business.",
  "services.s1.type": "Business management systems",
  "services.s1.d": "Sales, inventory, customers and reports. Bring your business together in one integrated system, accessible from desktop or mobile.",
  "services.s1.tag1": "Organization",
  "services.s1.tag2": "Tracking",
  "services.s1.tag3": "Reporting",
  "services.s1.link": "Let's talk about your system",
  "services.s2.t": "A presence that feels like you.",
  "services.s2.type": "Websites & digital experiences",
  "services.s2.d": "Fast, elegant websites in Arabic and English. A clear experience on every screen that helps people discover you and get in touch.",
  "services.s2.tag1": "Design",
  "services.s2.tag2": "Development",
  "services.s2.tag3": "Bilingual",
  "services.s2.link": "Let's plan your website",
  "services.s3.t": "Let your products do the talking.",
  "services.s3.type": "Professional catalogs",
  "services.s3.d": "Interactive or print-ready catalogs that bring your products into focus. Thoughtfully organized, easy to browse, and simple to share.",
  "services.s3.tag1": "Interactive",
  "services.s3.tag2": "Print-ready",
  "services.s3.tag3": "Easy to share",
  "services.s3.link": "Let's shape your catalog",
  "about.label": "About Mizaj",
  "about.title1": "We understand business.",
  "about.title2": "We design what helps it.",
  "about.founder": "Eng. Amjad Ahmed",
  "about.role": "Founder, MIZAJ STUDIO · Baghdad",
  "about.p1": "MIZAJ STUDIO is a digital studio founded by Eng. Amjad Ahmed in Baghdad. We bring real market and sales experience together with modern technology.",
  "about.p2": "We believe good digital design should be useful, too. So we start with what business owners need, keeping clarity and ease of use at the heart of every detail.",
  "about.note": "From Baghdad, for ideas worth bringing to life.",
  "process.label": "Our approach",
  "process.title": "A conversation. Then a solution.",
  "process.sub": "Room for the idea. Care at every step.",
  "process.p1.t": "Listen & understand",
  "process.p1.d": "We talk about your business, your audience, and what you want to improve.",
  "process.p2.t": "Plan & design",
  "process.p2.d": "We turn your needs into a clear direction and an experience that fits your identity.",
  "process.p3.t": "Build & review",
  "process.p3.d": "We develop the details and test the experience to keep the solution practical and easy to use.",
  "course.label": "Room to learn",
  "course.badge": "Coming soon · For beginners in Iraq",
  "course.title": "AI with Awareness.",
  "course.desc": "New tools. A deeper understanding. A course on using AI at work and in everyday life, thoughtfully and responsibly.",
  "course.p1": "What AI is and how it works",
  "course.p2": "Practical applications for work and study",
  "course.p3": "Safe and responsible use",
  "course.by": "Prepared & presented by Eng. Amjad Ahmed",
  "course.cta": "Ask about the course on WhatsApp",
  "contact.label": "The next step",
  "contact.title1": "Have an idea?",
  "contact.title2": "Give it a little Mizaj.",
  "contact.sub": "A new project, a better way to work, or a question about the course. It starts with a message from you.",
  "contact.wa": "Let's talk on WhatsApp",
  "footer.rights": "MIZAJ STUDIO. All rights reserved.",
  "footer.top": "Back to top",
  "footer.by": "Founded by Eng. Amjad Ahmed",
  "footer.location": "Baghdad, Iraq",
};

const nodes = document.querySelectorAll("[data-i18n]");
const ariaNodes = document.querySelectorAll("[data-i18n-aria]");
const AR = { "menu.close": "إغلاق القائمة" };
nodes.forEach((el) => { AR[el.dataset.i18n] = el.textContent; });
ariaNodes.forEach((el) => { AR[el.dataset.i18nAria] = el.getAttribute("aria-label"); });

const langToggle = document.getElementById("langToggle");
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("mainNav");
const mobileLayout = window.matchMedia("(max-width: 760px)");
const metaDescription = document.querySelector('meta[name="description"]');
const arabicDescription = metaDescription.content;
let currentLanguage = "ar";

function setMenu(open, returnFocus = false) {
  nav.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.dataset.i18nAria = open ? "menu.close" : "menu.open";
  menuToggle.setAttribute("aria-label", (currentLanguage === "en" ? EN : AR)[menuToggle.dataset.i18nAria]);
  if (returnFocus) menuToggle.focus();
}

function setLang(language) {
  currentLanguage = language === "en" ? "en" : "ar";
  const english = currentLanguage === "en";
  const dict = english ? EN : AR;
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = english ? "ltr" : "rtl";
  nodes.forEach((el) => { el.textContent = dict[el.dataset.i18n]; });
  ariaNodes.forEach((el) => { el.setAttribute("aria-label", dict[el.dataset.i18nAria]); });
  langToggle.textContent = english ? "عربي" : "EN";
  langToggle.lang = english ? "ar" : "en";
  langToggle.setAttribute("aria-label", english ? "التبديل إلى العربية" : "Switch to English");
  document.title = english ? "MIZAJ STUDIO | Digital studio in Baghdad" : "MIZAJ STUDIO | مزاج ستوديو";
  metaDescription.content = english
    ? "MIZAJ STUDIO, a digital studio in Baghdad founded by Eng. Amjad Ahmed. Business systems, bilingual websites and professional catalogs."
    : arabicDescription;
  try { localStorage.setItem("mizaj-lang", currentLanguage); } catch { /* Storage may be unavailable. */ }
}

langToggle.addEventListener("click", () => { setLang(currentLanguage === "en" ? "ar" : "en"); });
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  setMenu(open);
  if (open) nav.querySelector("a").focus();
});
nav.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (link && mobileLayout.matches && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false, true);
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav") && menuToggle.getAttribute("aria-expanded") === "true") setMenu(false);
});
mobileLayout.addEventListener("change", () => {
  // Avoid leaving keyboard focus inside navigation that becomes hidden on mobile.
  const focusWasInNav = nav.contains(document.activeElement);
  setMenu(false, mobileLayout.matches && focusWasInNav);
});

let savedLanguage = "ar";
try { savedLanguage = localStorage.getItem("mizaj-lang") || "ar"; } catch { /* Use Arabic by default. */ }
setLang(savedLanguage);
document.documentElement.classList.add("js-enabled");
langToggle.hidden = false;
menuToggle.hidden = false;
document.getElementById("year").textContent = new Date().getFullYear();

// Progressive enhancement: never hide content without a working observer.
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((el) => {
    el.classList.add("reveal-pending");
    observer.observe(el);
  });
}
