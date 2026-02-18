/**
 * i18n: init i18next, update DOM from data-i18n / data-i18n-html, language switcher.
 */
import i18next from 'i18next';
import Backend from 'i18next-http-backend';

const STORAGE_KEY = 'aug-lang';

function getSavedLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

export function updateContent() {
  if (!i18next.isInitialized) return;
  const t = i18next.t.bind(i18next);

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (key) el.innerHTML = t(key, { interpolation: { escapeValue: false } });
  });

  const html = document.documentElement;
  const lang = i18next.language?.split('-')[0] || 'en';
  if (lang === 'fr') {
    html.classList.add('fr-mode');
    html.setAttribute('lang', 'fr');
  } else {
    html.classList.remove('fr-mode');
    html.setAttribute('lang', 'en');
  }
}

export function setLanguage(lng) {
  lng = lng === 'fr' ? 'fr' : 'en';
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {}
  i18next.changeLanguage(lng).then(updateContent);
}

function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const lang = btn.getAttribute('data-lang');
    btn.addEventListener('click', () => setLanguage(lang));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') setLanguage(lang);
    });
  });
}

function init() {
  const savedLang = getSavedLang();

  i18next
    .use(Backend)
    .init({
      lng: savedLang,
      fallbackLng: 'en',
      backend: {
        loadPath: '/locales/{{lng}}.json',
      },
      interpolation: { escapeValue: false },
    })
    .then(() => {
      updateContent();
      initLangSwitcher();
    })
    .catch((err) => {
      console.warn('i18n init error', err);
      updateContent();
      initLangSwitcher();
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose for inline scripts (e.g. Why Augmented panel)
window.i18nUpdateContent = updateContent;
window.i18nSetLanguage = setLanguage;
