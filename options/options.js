document.addEventListener('DOMContentLoaded', () => {
  const defaults = {
    backendMode: 'server',
    serverUrl: '',
    httpMethod: 'POST',
    apiSelectServer: 'deepseek/',
    apiBrand: 'deepl-api',
    deeplApiKey: '',
    deepseekApiKey: '',
    deeplEndpoint: 'free-deepl'
  };

  const modeLabels = {
    server: '自定义服务器',
    api: '自定义 API'
  };

  const apiLabels = {
    'deepl-api': 'DeepL',
    'deepseek-api': 'Deepseek V3 Chat',
    'google-api': 'Google Translate'
  };

  const serverLabels = {
    'deepseek/': 'Deepseek V3 Chat',
    'deepl/': 'DeepL'
  };

  const modeSummaries = {
    server: '当前为服务器模式。',
    api: '当前为 API 模式。'
  };

  const backendModelSelect = document.getElementById('modeSelect');
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

  function setSectionState(element, visible) {
    element.hidden = !visible;
  }

  function setInputVisibility(input, toggle, visible) {
    if (!input || !toggle) return;

    input.type = visible ? 'text' : 'password';
    toggle.textContent = '显示';
    toggle.setAttribute('aria-pressed', String(visible));

    const label = toggle.dataset.label || '内容';
    toggle.setAttribute('aria-label', `${visible ? '隐藏' : '显示'} ${label}`);
  }

  function resetInputVisibility(inputId) {
    const toggle = visibilityToggles.find((button) => button.dataset.target === inputId);
    const input = document.getElementById(inputId);

    if (!toggle || !input) return;
    setInputVisibility(input, toggle, false);
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

    modeBadge.textContent = modeLabels[mode] || modeLabels.server;
    brandBadge.textContent = mode === 'server'
      ? serverLabels[apiSelectServer.value] || serverLabels['deepseek/']
      : apiLabels[brand] || apiLabels['deepl-api'];
    modeSummary.textContent = modeSummaries[mode] || modeSummaries.server;
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

  function loadSavedSettings() {
    chrome.storage.local.get(defaults, (items) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to load settings:', chrome.runtime.lastError);
        return;
      }

      backendModelSelect.value = items.backendMode;
      serverUrlInput.value = items.serverUrl;
      httpMethodSelect.value = items.httpMethod;
      apiSelectServer.value = items.apiSelectServer;
      apiSelect.value = items.apiBrand;
      apiKeyInputDeepl.value = items.deeplApiKey;
      endpointSelectDeepl.value = items.deeplEndpoint;
      apiKeyInputDeepseek.value = items.deepseekApiKey;

      updateModeUI();
    });
  }

  backendModelSelect.addEventListener('change', () => {
    chrome.storage.local.set({ backendMode: backendModelSelect.value }, updateModeUI);
  });

  apiSelectServer.addEventListener('change', () => {
    chrome.storage.local.set({ apiSelectServer: apiSelectServer.value }, updateModeUI);
  });

  apiSelect.addEventListener('change', () => {
    chrome.storage.local.set({ apiBrand: apiSelect.value }, updateModeUI);
  });

  saveBtnServer.addEventListener('click', () => {
    let url = serverUrlInput.value.trim();
    const method = httpMethodSelect.value.trim();
    const apiServer = apiSelectServer.value.trim();

    if (!url) {
      alert('请输入服务器 URL。');
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
        alert('服务器配置已保存。');
        serverUrlInput.value = url;
        updateModeUI();
      }
    );
  });

  clearBtnServer.addEventListener('click', () => {
    chrome.storage.local.remove(['serverUrl', 'httpMethod', 'apiSelectServer'], () => {
      serverUrlInput.value = '';
      httpMethodSelect.value = defaults.httpMethod;
      apiSelectServer.value = defaults.apiSelectServer;
      alert('服务器配置已清空。');
      updateModeUI();
    });
  });

  saveBtnDeepl.addEventListener('click', () => {
    const key = apiKeyInputDeepl.value.trim();
    const endpoint = endpointSelectDeepl.value || defaults.deeplEndpoint;

    if (!key) {
      alert('请输入 DeepL API Key。');
      apiKeyInputDeepl.focus();
      return;
    }

    chrome.storage.local.set(
      {
        deeplApiKey: key,
        deeplEndpoint: endpoint
      },
      () => {
        alert('DeepL 配置已保存。');
        updateModeUI();
      }
    );
  });

  clearBtnDeepl.addEventListener('click', () => {
    chrome.storage.local.remove(['deeplApiKey', 'deeplEndpoint'], () => {
      apiKeyInputDeepl.value = '';
      endpointSelectDeepl.value = defaults.deeplEndpoint;
      resetInputVisibility('apiKey-deepl');
      alert('DeepL 配置已清空。');
      updateModeUI();
    });
  });

  saveBtnDeepseek.addEventListener('click', () => {
    const key = apiKeyInputDeepseek.value.trim();

    if (!key) {
      alert('请输入 Deepseek API Key。');
      apiKeyInputDeepseek.focus();
      return;
    }

    chrome.storage.local.set(
      {
        deepseekApiKey: key
      },
      () => {
        alert('Deepseek 配置已保存。');
        updateModeUI();
      }
    );
  });

  clearBtnDeepseek.addEventListener('click', () => {
    chrome.storage.local.remove(['deepseekApiKey'], () => {
      apiKeyInputDeepseek.value = '';
      resetInputVisibility('apiKey-deepseek');
      alert('Deepseek 配置已清空。');
      updateModeUI();
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
