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
    deepseekModel: 'deepseek-v4-flash',
    streamDeepseek: 'true',
    [i18n.UI_LANGUAGE_KEY]: i18n.detectInitialUiLanguage(),
    [theme.THEME_MODE_KEY]: theme.DEFAULT_THEME_MODE
  };

  const targetInput = document.getElementById('targetLang');
  const quickModeSelect = document.getElementById('quickModeSelect');
  const quickApiSelectServer = document.getElementById('quickApiSelectServer');
  const quickApiSelect = document.getElementById('quickApiSelect');
  const deepseekModelSelect = document.getElementById('deepseekModelSelect');
  const visionCaptureBtn = document.getElementById('visionCaptureBtn');
  const visionGroup = document.getElementById('visionGroup');
  const quickServerGroup = document.getElementById('quickServerGroup');
  const quickApiGroup = document.getElementById('quickApiGroup');
  const deepseekModelGroup = document.getElementById('deepseekModelGroup');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  let currentThemeMode = theme.DEFAULT_THEME_MODE;
  let currentUiLanguage = defaults[i18n.UI_LANGUAGE_KEY];

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
    const isVisionModel = items.deepseekModel === 'deepseek-v4-flash-vision-exp';

    quickServerGroup.hidden = !isServerMode;
    quickApiGroup.hidden = isServerMode;
    deepseekModelGroup.hidden = !isDeepseekApi;

    // 仅 Deepseek API + Flash-Vision 模型时提供截图翻译入口
    if (visionGroup) {
      visionGroup.hidden = !(isDeepseekApi && isVisionModel);
    }
  }

  function renderUi(items) {
    const language = i18n.resolveUiLanguage(items[i18n.UI_LANGUAGE_KEY]);

    currentUiLanguage = language;
    applyThemeMode(items[theme.THEME_MODE_KEY], language);
    document.documentElement.lang = language;
    document.title = i18n.t(language, 'menu.pageTitle');
    i18n.applyTranslations(document, language);

    i18n.populateSelect(targetInput, i18n.getTargetLanguageOptions(language), items.targetLanguage);
    i18n.populateSelect(quickModeSelect, i18n.getBackendModeOptions(language), items.backendMode);
    i18n.populateSelect(quickApiSelectServer, i18n.getServerTargetOptions(language), items.apiSelectServer);
    i18n.populateSelect(quickApiSelect, i18n.getApiBrandOptions(language), items.apiBrand);
    i18n.populateSelect(deepseekModelSelect, i18n.getDeepseekModelOptions(language), items.deepseekModel);

    // 自绘下拉：选项重新填充后同步显示
    if (globalThis.TranslateOnSelectSelect) {
      globalThis.TranslateOnSelectSelect.enhanceAll(document);
    }

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
    chrome.storage.local.set({ targetLanguage: targetInput.value.trim() });
  });

  quickModeSelect.addEventListener('change', () => {
    chrome.storage.local.set({ backendMode: quickModeSelect.value });
  });

  quickApiSelectServer.addEventListener('change', () => {
    chrome.storage.local.set({ apiSelectServer: quickApiSelectServer.value });
  });

  quickApiSelect.addEventListener('change', () => {
    chrome.storage.local.set({ apiBrand: quickApiSelect.value });
  });

  deepseekModelSelect.addEventListener('change', () => {
    chrome.storage.local.set({ deepseekModel: deepseekModelSelect.value });
  });

  if (visionCaptureBtn) {
    visionCaptureBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        if (!tab || typeof tab.id !== 'number') {
          alert(i18n.t(currentUiLanguage, 'menu.visionUnavailable'));
          return;
        }
        chrome.tabs.sendMessage(tab.id, { action: 'start_vision_capture' }, () => {
          if (chrome.runtime.lastError) {
            alert(i18n.t(currentUiLanguage, 'menu.visionUnavailable'));
            return;
          }
          window.close();
        });
      });
    });
  }

  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextThemeMode = theme.toggleThemeMode(currentThemeMode);
      chrome.storage.local.set({ [theme.THEME_MODE_KEY]: nextThemeMode });
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
