document.addEventListener('DOMContentLoaded', () => {
  const targetInput = document.getElementById('targetLang');
  const server_label = document.getElementById('server-label');
  const deepl_label = document.getElementById('deepl-label');
  const deepseek_label = document.getElementById('deepseek-label');
  const google_label = document.getElementById('google-label');
  const quickModeSelect = document.getElementById('quickModeSelect');
  const quickApiSelectServer = document.getElementById('quickApiSelectServer');
  const quickApiSelect = document.getElementById('quickApiSelect');
  const streamDeepseekSelect = document.getElementById('streamDeepseekSelect');

  // 简单的存在性校验，便于调试
  console.log('DOM elements', {
    targetInput,
    server_label,
    deepl_label,
    deepseek_label,
    google_label,
    quickModeSelect,
    quickApiSelectServer,
    quickApiSelect,
    streamDeepseekSelect
  });

  function updateModeUI() {
    // 读取已有设置（注意：这里包含 apiBrand 和 apiSelectServer 两个不同的 key）
    chrome.storage.local.get(
      ['backendMode', 'apiBrand', 'apiSelectServer', 'targetLanguage', 'streamDeepseek'],
      (items) => {
        if (chrome.runtime.lastError) {
          console.error('storage.get error', chrome.runtime.lastError);
          return;
        }
        // 同步 target input
        if (items && items.targetLanguage && targetInput) {
          targetInput.value = items.targetLanguage;
        }

        // 显示 / 隐藏 label
        if (server_label) server_label.style.display = items.backendMode === 'server' ? 'block' : 'none';
        if (deepl_label) deepl_label.style.display = (items.backendMode === 'api' && items.apiBrand === 'deepl-api') ? 'block' : 'none';
        if (deepseek_label) deepseek_label.style.display = (items.backendMode === 'api' && items.apiBrand === 'deepseek-api') ? 'block' : 'none';
        if (google_label) google_label.style.display = (items.backendMode === 'api' && items.apiBrand === 'google-api') ? 'block' : 'none';

        // 显示 / 隐藏 selects
        if (quickModeSelect) quickModeSelect.style.display = 'block';
        if (quickApiSelectServer) quickApiSelectServer.style.display = items.backendMode === 'server' ? 'block' : 'none';
        if (quickApiSelect) quickApiSelect.style.display = items.backendMode === 'api' ? 'block' : 'none';
        if (streamDeepseekSelect) streamDeepseekSelect.style.display = (items.backendMode === 'api' && items.apiBrand === 'deepseek-api') ? 'block' : 'none';

        // 把 storage 的值同步回 select 的当前显示（避免 UI 看起来与实际 storage 不一致）
        if (quickModeSelect && items.backendMode) quickModeSelect.value = items.backendMode;
        if (quickApiSelect && items.apiBrand) quickApiSelect.value = items.apiBrand;
        if (quickApiSelectServer && items.apiSelectServer) quickApiSelectServer.value = items.apiSelectServer;
        if (streamDeepseekSelect && items.streamDeepseek) streamDeepseekSelect.value = items.streamDeepseek;

        // 若没有存过值，则保持 select 的当前 value（不覆盖用户默认）
        console.log('updateModeUI read items', items);
      }
    );
  }

  // 目标语言变化
  if (targetInput) {
    targetInput.addEventListener('change', () => {
      const target = targetInput.value.trim();
      chrome.storage.local.set({ targetLanguage: target }, () => {
        if (chrome.runtime.lastError) console.error('set targetLanguage failed', chrome.runtime.lastError);
        else console.log('saved targetLanguage', target);
        updateModeUI();
      });
    });
  }

  // 快速切换 backendMode
  if (quickModeSelect) {
    quickModeSelect.addEventListener('change', () => {
      const mode = quickModeSelect.value;
      chrome.storage.local.set({ backendMode: mode }, () => {
        if (chrome.runtime.lastError) console.error('set backendMode failed', chrome.runtime.lastError);
        else console.log('saved backendMode', mode);
        updateModeUI();
      });
    });
  }

  // quickApiSelectServer: 这是用于“服务器端点选择”的 key（我保留为 apiSelectServer）
  if (quickApiSelectServer) {
    quickApiSelectServer.addEventListener('change', () => {
      const serverPath = quickApiSelectServer.value;
      chrome.storage.local.set({ apiSelectServer: serverPath }, () => {
        if (chrome.runtime.lastError) console.error('set apiSelectServer failed', chrome.runtime.lastError);
        else console.log('saved apiSelectServer', serverPath);
        // 如果你希望选择服务器后自动将 backendMode 设为 'server'，可以在这里同时写入 backendMode：
        // chrome.storage.local.set({ apiSelectServer: serverPath, backendMode: 'server' }, ... )
        updateModeUI();
      });
    });
  }

  // quickApiSelect: 这是用于选择 API 品牌的 key（apiBrand）
  if (quickApiSelect) {
    quickApiSelect.addEventListener('change', () => {
      const brand = quickApiSelect.value;
      chrome.storage.local.set({ apiBrand: brand }, () => {
        if (chrome.runtime.lastError) console.error('set apiBrand failed', chrome.runtime.lastError);
        else console.log('saved apiBrand', brand);
        updateModeUI();
      });
    });
  }

  if (streamDeepseekSelect) {
    streamDeepseekSelect.addEventListener('change', () => {
      const streamDeepseek = streamDeepseekSelect.value;
      chrome.storage.local.set({ streamDeepseek: streamDeepseek }, () => {
        if (chrome.runtime.lastError) console.error('set streamDeepseek failed', chrome.runtime.lastError);
        else console.log('saved streamDeepseek', brand);
        updateModeUI();
      });
    });
  }

  // 订阅 storage 变化（若其他脚本也写 storage，可以立即同步 UI）
  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        console.log('storage changed', changes);
        updateModeUI();
      }
    });
  }

  // 初始更新
  updateModeUI();
});
