document.addEventListener('DOMContentLoaded', () => {
  const i18n = globalThis.TranslateOnSelectI18n;
  const theme = globalThis.TranslateOnSelectTheme;

  if (!i18n) {
    console.error('I18n helpers are unavailable in options page.');
    return;
  }

  if (!theme) {
    console.error('Theme helpers are unavailable in options page.');
    return;
  }
  const defaults = {
    backendMode: 'server',
    serverUrl: '',
    httpMethod: 'POST',
    apiSelectServer: 'deepseek/',
    apiBrand: 'deepl-api',
    deeplApiKey: '',
    deepseekApiKey: '',
    deeplEndpoint: 'free-deepl',
    [i18n.UI_LANGUAGE_KEY]: i18n.detectInitialUiLanguage(),
    [theme.THEME_MODE_KEY]: theme.DEFAULT_THEME_MODE
  };

  const backendModelSelect = document.getElementById('modeSelect');
  const uiLanguageSelect = document.getElementById('uiLanguageSelect');
  const serverSection = document.getElementById('serverSection');
  const apiSection = document.getElementById('apiSection');
  const apiSelect = document.getElementById('apiSelect');

  const serverUrlInput = document.getElementById('server');
  const httpMethodSelect = document.getElementById('HTTPMethods');
  const apiSelectServer = document.getElementById('apiSelectServer');
  const saveBtnServer = document.getElementById('saveBtn-server');
  const clearBtnServer = document.getElementById('clearBtn-server');

  const deeplSection = document.getElementById('deeplApiSection');
  const apiKeyInputDeepl = document.getElementById('apiKey-deepl');
  const endpointSelectDeepl = document.getElementById('endpoint-deepl');
  const saveBtnDeepl = document.getElementById('saveBtn-deepl');
  const clearBtnDeepl = document.getElementById('clearBtn-deepl');

  const deepseekSection = document.getElementById('deepseekApiSection');
  const apiKeyInputDeepseek = document.getElementById('apiKey-deepseek');
  const saveBtnDeepseek = document.getElementById('saveBtn-deepseek');
  const clearBtnDeepseek = document.getElementById('clearBtn-deepseek');
  const visibilityToggles = Array.from(document.querySelectorAll('.input-visibility-toggle'));

  const googleSection = document.getElementById('googleApiSection');
  const modeBadge = document.getElementById('modeBadge');
  const brandBadge = document.getElementById('brandBadge');
  const modeSummary = document.getElementById('modeSummary');

  let currentLanguage = defaults[i18n.UI_LANGUAGE_KEY];

  function setSectionState(element, visible) {
    element.hidden = !visible;
  }

  function getModeLabel(mode) {
    return i18n.t(currentLanguage, `shared.backendModes.${mode}`) || i18n.t(currentLanguage, 'shared.backendModes.server');
  }

  function getBrandLabel(mode, brand, serverBrand) {
    if (mode === 'server') {
      return i18n.t(currentLanguage, `shared.serverTargets.${serverBrand}`) || i18n.t(currentLanguage, 'shared.serverTargets.deepseek/');
    }

    return i18n.t(currentLanguage, `shared.apiBrands.${brand}`) || i18n.t(currentLanguage, 'shared.apiBrands.deepl-api');
  }

  function setInputVisibility(input, toggle, visible) {
    if (!input || !toggle) return;

    const labelKey = toggle.dataset.labelKey || 'options.apiKeyLabel';
    const label = i18n.t(currentLanguage, labelKey);

    input.type = visible ? 'text' : 'password';
    toggle.textContent = i18n.t(currentLanguage, visible ? 'options.toggle.hide' : 'options.toggle.show');
    toggle.setAttribute('aria-pressed', String(visible));
    toggle.setAttribute(
      'aria-label',
      i18n.t(currentLanguage, visible ? 'options.toggle.hideAria' : 'options.toggle.showAria', { label })
    );
  }

  function resetInputVisibility(inputId) {
    const toggle = visibilityToggles.find((button) => button.dataset.target === inputId);
    const input = document.getElementById(inputId);

    if (!toggle || !input) return;
    setInputVisibility(input, toggle, false);
  }

  function refreshVisibilityToggleLabels() {
    visibilityToggles.forEach((toggle) => {
      const input = document.getElementById(toggle.dataset.target);
      if (!input) return;
      setInputVisibility(input, toggle, input.type === 'text');
    });
  }

  function initializeVisibilityToggles() {
    visibilityToggles.forEach((toggle) => {
      const input = document.getElementById(toggle.dataset.target);
      if (!input) return;

      setInputVisibility(input, toggle, false);
      toggle.addEventListener('click', () => {
        const nextVisible = input.type === 'password';
        setInputVisibility(input, toggle, nextVisible);
        input.focus({ preventScroll: true });
      });
    });
  }

  function updateOverview() {
    const mode = backendModelSelect.value;
    const brand = apiSelect.value;

    modeBadge.textContent = getModeLabel(mode);
    brandBadge.textContent = getBrandLabel(mode, brand, apiSelectServer.value);
    modeSummary.textContent = i18n.t(currentLanguage, `options.modeSummaries.${mode}`);
  }

  function updateModeUI() {
    const mode = backendModelSelect.value;
    const brand = apiSelect.value;

    setSectionState(serverSection, mode === 'server');
    setSectionState(apiSection, mode === 'api');
    setSectionState(deeplSection, mode === 'api' && brand === 'deepl-api');
    setSectionState(deepseekSection, mode === 'api' && brand === 'deepseek-api');
    setSectionState(googleSection, mode === 'api' && brand === 'google-api');
    updateOverview();
  }

  function renderLocalizedUi(items) {
    currentLanguage = i18n.resolveUiLanguage(items[i18n.UI_LANGUAGE_KEY]);

    theme.applyDocumentTheme(document, items[theme.THEME_MODE_KEY]);
    document.documentElement.lang = currentLanguage;
    document.title = i18n.t(currentLanguage, 'options.pageTitle');
    i18n.applyTranslations(document, currentLanguage);

    i18n.populateSelect(uiLanguageSelect, i18n.getUiLanguageOptions(currentLanguage), currentLanguage);
    i18n.populateSelect(backendModelSelect, i18n.getBackendModeOptions(currentLanguage), items.backendMode);
    i18n.populateSelect(httpMethodSelect, i18n.getHttpMethodOptions(currentLanguage), items.httpMethod);
    i18n.populateSelect(apiSelectServer, i18n.getServerTargetOptions(currentLanguage), items.apiSelectServer);
    i18n.populateSelect(apiSelect, i18n.getApiBrandOptions(currentLanguage), items.apiBrand);
    i18n.populateSelect(endpointSelectDeepl, i18n.getDeeplEndpointOptions(currentLanguage), items.deeplEndpoint);

    refreshVisibilityToggleLabels();
  }

  function loadSavedSettings() {
    chrome.storage.local.get(defaults, (items) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to load settings:', chrome.runtime.lastError);
        return;
      }

      renderLocalizedUi(items);

      serverUrlInput.value = items.serverUrl;
      apiKeyInputDeepl.value = items.deeplApiKey;
      apiKeyInputDeepseek.value = items.deepseekApiKey;

      updateModeUI();
    });
  }

  uiLanguageSelect.addEventListener('change', () => {
    chrome.storage.local.set({ [i18n.UI_LANGUAGE_KEY]: uiLanguageSelect.value }, loadSavedSettings);
  });

  backendModelSelect.addEventListener('change', () => {
    chrome.storage.local.set({ backendMode: backendModelSelect.value }, loadSavedSettings);
  });

  apiSelectServer.addEventListener('change', () => {
    chrome.storage.local.set({ apiSelectServer: apiSelectServer.value }, loadSavedSettings);
  });

  apiSelect.addEventListener('change', () => {
    chrome.storage.local.set({ apiBrand: apiSelect.value }, loadSavedSettings);
  });

  saveBtnServer.addEventListener('click', () => {
    let url = serverUrlInput.value.trim();
    const method = httpMethodSelect.value.trim();
    const apiServer = apiSelectServer.value.trim();

    if (!url) {
      alert(i18n.t(currentLanguage, 'options.alerts.serverUrlRequired'));
      serverUrlInput.focus();
      return;
    }

    if (!url.endsWith('/')) {
      url += '/';
    }

    chrome.storage.local.set(
      {
        serverUrl: url,
        httpMethod: method,
        apiSelectServer: apiServer
      },
      () => {
        alert(i18n.t(currentLanguage, 'options.alerts.serverSaved'));
        serverUrlInput.value = url;
        loadSavedSettings();
      }
    );
  });

  clearBtnServer.addEventListener('click', () => {
    chrome.storage.local.remove(['serverUrl', 'httpMethod', 'apiSelectServer'], () => {
      serverUrlInput.value = '';
      httpMethodSelect.value = defaults.httpMethod;
      apiSelectServer.value = defaults.apiSelectServer;
      alert(i18n.t(currentLanguage, 'options.alerts.serverCleared'));
      loadSavedSettings();
    });
  });

  saveBtnDeepl.addEventListener('click', () => {
    const key = apiKeyInputDeepl.value.trim();
    const endpoint = endpointSelectDeepl.value || defaults.deeplEndpoint;

    if (!key) {
      alert(i18n.t(currentLanguage, 'options.alerts.deeplKeyRequired'));
      apiKeyInputDeepl.focus();
      return;
    }

    chrome.storage.local.set(
      {
        deeplApiKey: key,
        deeplEndpoint: endpoint
      },
      () => {
        alert(i18n.t(currentLanguage, 'options.alerts.deeplSaved'));
        loadSavedSettings();
      }
    );
  });

  clearBtnDeepl.addEventListener('click', () => {
    chrome.storage.local.remove(['deeplApiKey', 'deeplEndpoint'], () => {
      apiKeyInputDeepl.value = '';
      endpointSelectDeepl.value = defaults.deeplEndpoint;
      resetInputVisibility('apiKey-deepl');
      alert(i18n.t(currentLanguage, 'options.alerts.deeplCleared'));
      loadSavedSettings();
    });
  });

  saveBtnDeepseek.addEventListener('click', () => {
    const key = apiKeyInputDeepseek.value.trim();

    if (!key) {
      alert(i18n.t(currentLanguage, 'options.alerts.deepseekKeyRequired'));
      apiKeyInputDeepseek.focus();
      return;
    }

    chrome.storage.local.set(
      {
        deepseekApiKey: key
      },
      () => {
        alert(i18n.t(currentLanguage, 'options.alerts.deepseekSaved'));
        loadSavedSettings();
      }
    );
  });

  clearBtnDeepseek.addEventListener('click', () => {
    chrome.storage.local.remove(['deepseekApiKey'], () => {
      apiKeyInputDeepseek.value = '';
      resetInputVisibility('apiKey-deepseek');
      alert(i18n.t(currentLanguage, 'options.alerts.deepseekCleared'));
      loadSavedSettings();
    });
  });

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && Object.keys(changes).length > 0) {
        loadSavedSettings();
      }
    });
  }

  initializeVisibilityToggles();
  loadSavedSettings();
});
