document.addEventListener('DOMContentLoaded', () => {
  // elements
  const backendModelSelect = document.getElementById('modeSelect'); // 'server' or 'api'
  const serverSection = document.getElementById('serverSection');
  const apiSection = document.getElementById('apiSection');
  const apiSelect = document.getElementById('apiSelect'); // 'deepl-api' or others

  // server controls
  const serverUrlInput = document.getElementById('server');
  const httpMethodSelect = document.getElementById('HTTPMethods');
  const apiSelectServer = document.getElementById('apiSelectServer');
  const saveBtnServer = document.getElementById('saveBtn-server');
  const clearBtnServer = document.getElementById('clearBtn-server');

  // deepl controls
  const deeplSection = document.getElementById('deeplApiSection');
  const apiKeyInput_deepl = document.getElementById('apiKey-deepl');
  const endpointSelect_deepl = document.getElementById('endpoint-deepl');
  const saveBtn_deepl = document.getElementById('saveBtn-deepl');
  const clearBtn_deepl = document.getElementById('clearBtn-deepl');

  // deepseek controls
  const deepseekSection = document.getElementById('deepseekApiSection');
  const apiKeyInput_deepseek = document.getElementById('apiKey-deepseek');
  const saveBtn_deepseek = document.getElementById('saveBtn-deepseek');
  const clearBtn_deepseek = document.getElementById('clearBtn-deepseek');

  // google controls
  const googleSection = document.getElementById('googleApiSection');

  // update UI visibility based on selections
  // 注意：因为我们在 CSS 中把 .section 默认 display:none，JS 必须显式设置 'block' 才能显示
  function updateModeUI() {
    const mode = backendModelSelect.value;

    serverSection.style.display = (mode === 'server') ? 'block' : 'none';
    apiSection.style.display = (mode === 'api') ? 'block' : 'none';

    const brand = apiSelect.value;

    deeplSection.style.display = (mode === 'api' && brand === 'deepl-api') ? 'block' : 'none';
    deepseekSection.style.display = (mode === 'api' && brand === 'deepseek-api') ? 'block' : 'none';
    googleSection.style.display = (mode === 'api' && brand === 'google-api') ? 'block' : 'none';
  }

  // load saved settings and populate UI
  function loadSavedSettings() {
    chrome.storage.local.get(
      [
        'backendMode',    // 'server' | 'api'
        'serverUrl',
        'httpMethod',
        'apiSelectServer',
        'apiBrand',       // 'deepl-api' etc.
        'deeplApiKey',
        'deepseekApiKey',
        'deeplEndpoint'
        // 待拓展其他api
      ],
      (items) => {
        // backend mode
        backendModelSelect.value = items && items.backendMode ? items.backendMode : 'server';

        // server fields
        serverUrlInput.value = items && items.serverUrl ? items.serverUrl : '';
        httpMethodSelect.value = items && items.httpMethod ? items.httpMethod : 'POST';
        apiSelectServer.value = items && items.apiSelectServer ? items.apiSelectServer : 'deepseek/';

        // api brand
        apiSelect.value = items && items.apiBrand ? items.apiBrand : 'deepl-api';

        // deepl
        apiKeyInput_deepl.value = items && items.deeplApiKey ? items.deeplApiKey : '';
        endpointSelect_deepl.value = items && items.deeplEndpoint ? items.deeplEndpoint : 'free-deepl';

        // deepseek
        apiKeyInput_deepseek.value = items && items.deepseekApiKey ? items.deepseekApiKey : '';

        // 待拓展其他api

        updateModeUI();
      }
    );
  }

  // 后端模式保存
  backendModelSelect.addEventListener('change', () => {
    const mode = backendModelSelect.value;
    chrome.storage.local.set({ backendMode: mode }, updateModeUI);
  });

  // 后端api模式保存
  apiSelectServer.addEventListener('change', () => {
    const mode = apiSelectServer.value;
    chrome.storage.local.set({ apiSelectServer: mode }, updateModeUI);
  });

  // api品牌保存
  apiSelect.addEventListener('change', () => {
    const brand = apiSelect.value;
    chrome.storage.local.set({ apiBrand: brand }, updateModeUI);
  });

  saveBtnServer.addEventListener('click', () => {
    let url = serverUrlInput.value.trim();
    const method = httpMethodSelect.value.trim();
    const apiServer = apiSelectServer.value.trim();

    if (!url) {
      alert('请输入服务器 URL 。');
      serverUrlInput.focus();
      return;
    }

    if (!url.endsWith('/')) url += '/';

    chrome.storage.local.set(
      {
        serverUrl: url,
        httpMethod: method,
        apiSelectServer: apiServer
      },
      () => {
        alert('服务器配置已保存');
        serverUrlInput.focus();
        updateModeUI();
      }
    );
  });

  clearBtnServer.addEventListener('click', () => {
    chrome.storage.local.remove(['serverUrl', 'httpMethod'], () => {
      serverUrlInput.value = '';
      httpMethodSelect.value = 'POST';
      apiSelectServer.value = 'deepseek/';
      alert('已重置服务器配置');
    });
  });

  // --- DeepL save / clear ---
  saveBtn_deepl.addEventListener('click', () => {
    const key = apiKeyInput_deepl.value.trim();
    const endpoint = endpointSelect_deepl.value || 'free-deepl';

    if (!key) {
      alert('请输入 api key 。');
      return;
    }

    chrome.storage.local.set(
      {
        deeplApiKey: key,
        deeplEndpoint: endpoint,
      },
      () => {
        alert('DeepL API 设置已保存');
        updateModeUI();
      }
    );
  });

  clearBtn_deepl.addEventListener('click', () => {
    chrome.storage.local.remove(['deeplApiKey', 'deeplEndpoint'], () => {
      apiKeyInput_deepl.value = '';
      endpointSelect_deepl.value = 'free-deepl'; // 重置默认
      alert('已清除 DeepL 配置');
    });
  });

  // --- Deepseek save / clear ---
  saveBtn_deepseek.addEventListener('click', () => {
    const key = apiKeyInput_deepseek.value.trim();

    if (!key) {
      alert('请输入 api key 。');
      return;
    }

    chrome.storage.local.set(
      {
        deepseekApiKey: key,
      },
      () => {
        alert('Deepseek API 设置已保存');
        updateModeUI();
      }
    );
  });

  clearBtn_deepseek.addEventListener('click', () => {
    chrome.storage.local.remove(['deepseekApiKey', 'deepseekEndpoint'], () => {
      apiKeyInput_deepseek.value = '';
      alert('已清除 Deepseek 配置');
    });
  });

  // init func
  loadSavedSettings();
});
