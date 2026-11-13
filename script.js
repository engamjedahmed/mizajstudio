// Translations: Arabic is written in the HTML; English lives here.
const EN = {
  "nav.services": "Services",
  "nav.course": "Course",
  "nav.about": "About",
  "nav.contact": "Contact",
  "hero.eyebrow": "by Eng. Amjad Ahmed",
  "hero.title1": "A new space",
  "hero.title2": "for digital solutions",
  "hero.lead": "We design business systems, websites and catalogs that make your work clearer, faster and more beautiful.",
  "hero.cta1": "Start your project",
  "hero.cta2": "See our services",
  "services.title": "Our services",
  "services.sub": "Solutions tailored to your business, not ready-made templates.",
  "services.s1.t": "Business management systems",
  "services.s1.d": "Integrated systems for sales, inventory, customers and reports, on desktop and mobile.",
  "services.s2.t": "Websites & digital experiences",
  "services.s2.d": "Fast, elegant bilingual websites that reflect your brand identity.",
  "services.s3.t": "Professional catalogs",
  "services.s3.d": "Interactive and print-ready product catalogs, organized and easy to share with your customers.",
  "course.badge": "Coming soon",
  "course.title": "AI with Awareness",
  "course.desc": "A beginner course in Iraq that teaches you to use AI tools at work and in daily life, smartly and responsibly.",
  "course.p1": "What AI is and how it works",
  "course.p2": "Practical use for work and study",
  "course.p3": "Safe and responsible use",
  "course.by": "Prepared & presented by Eng. Amjad Ahmed",
  "course.cta": "Register your interest",
  "about.title": "About us",
  "about.p1": "MIZAJ STUDIO is a digital studio founded by Eng. Amjad Ahmed in Baghdad.",
  "about.p2": "We combine real market and sales experience with modern technology to build digital solutions that genuinely help business owners.",
  "contact.title": "Get in touch",
  "contact.sub": "Have a project idea? Tell us about it.",
  "contact.wa": "WhatsApp",
  "contact.ig": "Instagram",
  "footer.by": "by Eng. Amjad Ahmed",
};

const nodes = document.querySelectorAll("[data-i18n]");
const AR = {};
nodes.forEach((el) => (AR[el.dataset.i18n] = el.textContent));

function setLang(lang) {
  const dict = lang === "en" ? EN : AR;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
  nodes.forEach((el) => {
    const v = dict[el.dataset.i18n];
    if (v) el.textContent = v;
  });
  document.getElementById("langToggle").textContent = lang === "en" ? "ع" : "EN";
  try { localStorage.setItem("mizaj-lang", lang); } catch (e) {}
}

document.getElementById("langToggle").addEventListener("click", () => {
  setLang(document.documentElement.lang === "en" ? "ar" : "en");
});

let saved = "ar";
try { saved = localStorage.getItem("mizaj-lang") || "ar"; } catch (e) {}
if (saved === "en") setLang("en");

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();
