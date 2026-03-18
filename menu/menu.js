document.addEventListener('DOMContentLoaded', () => {
  const i18n = globalThis.TranslateOnSelectI18n;
  const theme = globalThis.TranslateOnSelectTheme;

  if (!i18n) {
    console.error('I18n helpers are unavailable in popup.');
    return;
  }

  if (!theme) {
    console.error('Theme helpers are unavailable in popup.');
    return;
  }
  const defaults = {
    backendMode: 'server',
    apiBrand: 'deepseek-api',
    apiSelectServer: 'deepseek/',
    targetLanguage: 'ZH-HANS',
    streamDeepseek: 'true',
    [i18n.UI_LANGUAGE_KEY]: i18n.detectInitialUiLanguage(),
    [theme.THEME_MODE_KEY]: theme.DEFAULT_THEME_MODE
  };

  const targetInput = document.getElementById('targetLang');
  const uiLanguageSelect = document.getElementById('uiLanguageSelect');
  const quickModeSelect = document.getElementById('quickModeSelect');
  const quickApiSelectServer = document.getElementById('quickApiSelectServer');
  const quickApiSelect = document.getElementById('quickApiSelect');
  const streamDeepseekSelect = document.getElementById('streamDeepseekSelect');
  const quickServerGroup = document.getElementById('quickServerGroup');
  const quickApiGroup = document.getElementById('quickApiGroup');
  const streamGroup = document.getElementById('streamGroup');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  let currentThemeMode = theme.DEFAULT_THEME_MODE;

  function applyThemeMode(themeMode, language) {
    currentThemeMode = theme.applyDocumentTheme(document, themeMode);

    if (!themeToggleBtn) return;

    const label = theme.getThemeToggleLabel(language, currentThemeMode);
    themeToggleBtn.setAttribute('aria-pressed', String(currentThemeMode === 'dark'));
    themeToggleBtn.setAttribute('aria-label', label);
    themeToggleBtn.setAttribute('title', label);
  }

  function updateVisibility(items) {
    const isServerMode = items.backendMode === 'server';
    const isDeepseekApi = items.backendMode === 'api' && items.apiBrand === 'deepseek-api';

    quickServerGroup.hidden = !isServerMode;
    quickApiGroup.hidden = isServerMode;
    streamGroup.hidden = !isDeepseekApi;
  }

  function renderUi(items) {
    const language = i18n.resolveUiLanguage(items[i18n.UI_LANGUAGE_KEY]);

    applyThemeMode(items[theme.THEME_MODE_KEY], language);
    document.documentElement.lang = language;
    document.title = i18n.t(language, 'menu.pageTitle');
    i18n.applyTranslations(document, language);

    i18n.populateSelect(targetInput, i18n.getTargetLanguageOptions(language), items.targetLanguage);
    i18n.populateSelect(uiLanguageSelect, i18n.getUiLanguageOptions(language), language);
    i18n.populateSelect(quickModeSelect, i18n.getBackendModeOptions(language), items.backendMode);
    i18n.populateSelect(quickApiSelectServer, i18n.getServerTargetOptions(language), items.apiSelectServer);
    i18n.populateSelect(quickApiSelect, i18n.getApiBrandOptions(language), items.apiBrand);
    i18n.populateSelect(streamDeepseekSelect, i18n.getStreamModeOptions(language), items.streamDeepseek);

    updateVisibility(items);
  }

  function updateModeUI() {
    chrome.storage.local.get(defaults, (items) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to read popup settings:', chrome.runtime.lastError);
        return;
      }

      renderUi(items);
    });
  }

  targetInput.addEventListener('change', () => {
    chrome.storage.local.set({ targetLanguage: targetInput.value.trim() }, updateModeUI);
  });

  uiLanguageSelect.addEventListener('change', () => {
    chrome.storage.local.set({ [i18n.UI_LANGUAGE_KEY]: uiLanguageSelect.value }, updateModeUI);
  });

  quickModeSelect.addEventListener('change', () => {
    chrome.storage.local.set({ backendMode: quickModeSelect.value }, updateModeUI);
  });

  quickApiSelectServer.addEventListener('change', () => {
    chrome.storage.local.set({ apiSelectServer: quickApiSelectServer.value }, updateModeUI);
  });

  quickApiSelect.addEventListener('change', () => {
    chrome.storage.local.set({ apiBrand: quickApiSelect.value }, updateModeUI);
  });

  streamDeepseekSelect.addEventListener('change', () => {
    chrome.storage.local.set({ streamDeepseek: streamDeepseekSelect.value }, updateModeUI);
  });

  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextThemeMode = theme.toggleThemeMode(currentThemeMode);
      chrome.storage.local.set({ [theme.THEME_MODE_KEY]: nextThemeMode }, updateModeUI);
    });
  }

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && Object.keys(changes).length > 0) {
        updateModeUI();
      }
    });
  }

  updateModeUI();
});
