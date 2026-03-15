document.addEventListener('DOMContentLoaded', () => {
  const defaults = {
    backendMode: 'server',
    apiBrand: 'deepseek-api',
    apiSelectServer: 'deepseek/',
    targetLanguage: 'ZH-HANS',
    streamDeepseek: 'true'
  };

  const targetInput = document.getElementById('targetLang');
  const quickModeSelect = document.getElementById('quickModeSelect');
  const quickApiSelectServer = document.getElementById('quickApiSelectServer');
  const quickApiSelect = document.getElementById('quickApiSelect');
  const streamDeepseekSelect = document.getElementById('streamDeepseekSelect');
  const quickServerGroup = document.getElementById('quickServerGroup');
  const quickApiGroup = document.getElementById('quickApiGroup');
  const streamGroup = document.getElementById('streamGroup');
  const openOptionsBtn = document.getElementById('openOptionsBtn');

  function updateVisibility(items) {
    const isServerMode = items.backendMode === 'server';
    const isDeepseekApi = items.backendMode === 'api' && items.apiBrand === 'deepseek-api';

    quickServerGroup.hidden = !isServerMode;
    quickApiGroup.hidden = isServerMode;
    streamGroup.hidden = !isDeepseekApi;
  }

  function updateSelectValues(items) {
    targetInput.value = items.targetLanguage;
    quickModeSelect.value = items.backendMode;
    quickApiSelectServer.value = items.apiSelectServer;
    quickApiSelect.value = items.apiBrand;
    streamDeepseekSelect.value = items.streamDeepseek;
  }

  function updateModeUI() {
    chrome.storage.local.get(defaults, (items) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to read popup settings:', chrome.runtime.lastError);
        return;
      }

      updateSelectValues(items);
      updateVisibility(items);
    });
  }

  targetInput.addEventListener('change', () => {
    chrome.storage.local.set({ targetLanguage: targetInput.value.trim() }, updateModeUI);
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

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && Object.keys(changes).length > 0) {
        updateModeUI();
      }
    });
  }

  updateModeUI();
});
