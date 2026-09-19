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
    deepseekModel: i18n.DEEPSEEK_FLASH_MODEL,
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

  function updateVisibility(items, model) {
    const isServerMode = items.backendMode === 'server';
    const isDeepseekApi = items.backendMode === 'api' && items.apiBrand === 'deepseek-api';
    // Flash 分支同时支持划词与截图；Pro 分支保持纯文字划词
    const canCapture = isDeepseekApi && model === i18n.DEEPSEEK_FLASH_MODEL;

    quickServerGroup.hidden = !isServerMode;
    quickApiGroup.hidden = isServerMode;
    deepseekModelGroup.hidden = !isDeepseekApi;

    // 仅 DeepSeek API + Flash 模型时提供截图翻译入口
    if (visionGroup) {
      visionGroup.hidden = !canCapture;
    }
  }

  function renderUi(items) {
    const language = i18n.resolveUiLanguage(items[i18n.UI_LANGUAGE_KEY]);
    const model = i18n.normalizeDeepseekModel(items.deepseekModel);
    // 旧配置兼容：google-api 已下线，残留取值回落到当前默认品牌
    const brand = i18n.normalizeApiBrand(items.apiBrand);

    currentUiLanguage = language;
    applyThemeMode(items[theme.THEME_MODE_KEY], language);
    document.documentElement.lang = language;
    document.title = i18n.t(language, 'menu.pageTitle');
    i18n.applyTranslations(document, language);

    i18n.populateSelect(targetInput, i18n.getTargetLanguageOptions(language), items.targetLanguage);
    i18n.populateSelect(quickModeSelect, i18n.getBackendModeOptions(language), items.backendMode);
    i18n.populateSelect(quickApiSelectServer, i18n.getServerTargetOptions(language), items.apiSelectServer);
    i18n.populateSelect(quickApiSelect, i18n.getApiBrandOptions(language), brand);
    i18n.populateSelect(deepseekModelSelect, i18n.getDeepseekModelOptions(language), model);

    // 自绘下拉：选项重新填充后同步显示
    if (globalThis.TranslateOnSelectSelect) {
      globalThis.TranslateOnSelectSelect.enhanceAll(document);
    }

    updateVisibility({ ...items, apiBrand: brand }, model);

    // 旧模型名（deepseek-v4-flash / deepseek-v4-flash-vision-exp）写回归一后的取值
    if (items.deepseekModel !== model) {
      chrome.storage.local.set({ deepseekModel: model });
    }

    // 旧 API 品牌（google-api）同样写回，保证 UI 与实际配置一致
    if (items.apiBrand !== brand) {
      chrome.storage.local.set({ apiBrand: brand });
    }
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
