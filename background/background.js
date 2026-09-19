import { translate as translateDeepl } from './api/deepl_api.js';
import { translate as translateDeepseek, FLASH_MODEL, PRO_MODEL } from './api/deepseek_api.js';
import { translate as translateServer } from './api/server_api.js';

console.log('BG: Quick Select Translate (dispatcher) loaded');

// helper: is async iterable?
function isAsyncIterable(obj) {
  return obj && typeof obj[Symbol.asyncIterator] === 'function';
}

// helper to forward streaming chunks to content tab
async function streamToTab(iterable, tabId) {
  let full = '';
  try {
    for await (const chunk of iterable) {
      let textChunk;
      if (typeof chunk === 'string') textChunk = chunk;
      else if (chunk && typeof chunk.text === 'string') textChunk = chunk.text;
      else textChunk = String(chunk);
      full += textChunk;
      if (tabId) {
        try {
          chrome.tabs.sendMessage(tabId, { action: 'translate_stream', chunk: textChunk, done: false });
        } catch (e) {
          // ignore sendMessage errors
        }
      }
    }
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { action: 'translate_stream', done: true, success: true, translated: full });
    }
    return { success: true, translated: full };
  } catch (err) {
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { action: 'translate_stream', done: true, success: false, error: err && err.message ? err.message : String(err) });
    }
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
}

// helper: forward a provider result (plain object or async iterable) to the page
async function respondWithResult(resultOrIterable, sender, sendResponse) {
  if (isAsyncIterable(resultOrIterable)) {
    const tabId = sender && sender.tab && sender.tab.id ? sender.tab.id : null;
    sendResponse(await streamToTab(resultOrIterable, tabId));
    return;
  }
  sendResponse(resultOrIterable);
}

// 模型名归一化：仅 Pro 为纯文本划词分支（不支持截图），其余取值（含历史遗留的
// deepseek-v4-flash / deepseek-v4-flash-vision-exp）统一落到 Flash。
function resolveDeepseekModel(storedModel) {
  return storedModel === PRO_MODEL ? PRO_MODEL : FLASH_MODEL;
}

// API 品牌归一化：google-api 分支已下线，历史配置统一回落到当前默认品牌。
function resolveApiBrand(storedBrand) {
  return storedBrand === 'deepl-api' || storedBrand === 'deepseek-api' ? storedBrand : 'deepseek-api';
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Keep listener non-blocking but we'll use async flow and return true for async response.
  (async () => {
    try {
      if (!msg) {
        sendResponse({ success: false, error: 'unsupported_action' });
        return;
      }

      if (msg.action === 'translate_vision') {
        console.log('BG received: translate_vision (image payload omitted)');
      } else {
        console.log('BG received:', msg);
      }

      // 截图：使用 Chrome 内置接口截取当前标签页可见区域（供视觉翻译使用）
      if (msg.action === 'capture_visible_tab') {
        if (!sender || !sender.tab) {
          sendResponse({ success: false, error: 'no_tab_context' });
          return;
        }
        if (!sender.tab.active) {
          sendResponse({ success: false, error: 'tab_not_active' });
          return;
        }
        try {
          const options = { format: 'jpeg', quality: 85 };
          const dataUrl = await chrome.tabs.captureVisibleTab(sender.tab.windowId, options);
          sendResponse({ success: true, dataUrl });
        } catch (err) {
          sendResponse({ success: false, error: err && err.message ? err.message : String(err) });
        }
        return;
      }

      const isVision = msg.action === 'translate_vision';
      if (msg.action !== 'translate' && !isVision) {
        sendResponse({ success: false, error: 'unsupported_action' });
        return;
      }

      // 读取本地数据
      const items = await new Promise((resolve) => {
        chrome.storage.local.get(
          ['backendMode','apiBrand','serverUrl','httpMethod','apiSelectServer','deeplApiKey','deepseekApiKey','deeplEndpoint','targetLanguage', 'streamDeepseek', 'deepseekModel'],
          resolve
        );
      });

      // 赋值本地数据
      const backendMode = items && items.backendMode ? items.backendMode : 'server';
      const storedBrand = items && items.apiBrand ? items.apiBrand : 'deepseek-api'; // 与 popup / options 的默认品牌保持一致
      const apiBrand = resolveApiBrand(storedBrand);
      const targetFormat = normalizeTargetForBrand(apiBrand, msg.target || items && items.targetLanguage || 'ZH-HANS');
      const streamDeepseek = items && items.streamDeepseek ? (items.streamDeepseek === 'true') : false;
      const deepseekModel = resolveDeepseekModel(items && items.deepseekModel);

      // 旧配置兼容：google-api 分支已下线，把 storage 中的残留取值迁移到当前默认品牌
      if (storedBrand !== apiBrand) {
        chrome.storage.local.set({ apiBrand });
      }

      // 截图翻译的前置门禁：只有「自定义 API -> DeepSeek V4 -> Flash」才允许继续，
      // 其余情况（自定义服务器、其他 provider、Pro 模型）一律在此立即返回，
      // 不会落入 server / DeepL 等分支。
      if (isVision) {
        if (backendMode !== 'api' || apiBrand !== 'deepseek-api') {
          sendResponse({ success: false, error: 'vision_requires_deepseek_api' });
          return;
        }
        if (deepseekModel !== FLASH_MODEL) {
          sendResponse({ success: false, error: 'vision_requires_flash_model' });
          return;
        }
        if (typeof msg.imageDataUrl !== 'string' || !msg.imageDataUrl) {
          sendResponse({ success: false, error: 'missing_image' });
          return;
        }
      }

      // 判断后端服务器模式
      if (backendMode === 'server') {
        // 赋值服务器URL及HTTP方法
        const serverUrl = items && items.serverUrl ? items.serverUrl : null;
        const httpMethod = items && items.httpMethod ? items.httpMethod : 'POST';
        const apiServer = items && items.apiSelectServer ? items.apiSelectServer : 'deepseek/';
        if (!serverUrl) {
          sendResponse({ success: false, error: 'missing_server_url' });
          return;
        }

        // 中转后端只有纯文本划词接口；截图请求已在上面被门禁拦下
        const resultOrIterable = await translateServer({
          text: msg.text,
          target: targetFormat,
          serverUrl,
          httpMethod,
          brand: apiServer
        });

        await respondWithResult(resultOrIterable, sender, sendResponse);
        return;
      }

      if (backendMode !== 'api') {
        sendResponse({ success: false, error: 'unknown_backend_mode' });
        return;
      }

      if (apiBrand === 'deepl-api') {
        // 赋值apikey-deepl和版本
        const deeplApiKey = items && items.deeplApiKey ? items.deeplApiKey : null;
        const deeplEndpoint = items && items.deeplEndpoint ? items.deeplEndpoint : 'free-deepl';
        if (!deeplApiKey) {
          sendResponse({ success: false, error: 'missing_api_key' });
          return;
        }

        const resultOrIterable = await translateDeepl({
          text: msg.text,
          target: targetFormat,
          apiKey: deeplApiKey,
          endpointKey: deeplEndpoint,
          meta: { from: 'deepl' }
        });

        await respondWithResult(resultOrIterable, sender, sendResponse);
        return;
      }

      if (apiBrand !== 'deepseek-api') {
        sendResponse({ success: false, error: 'unknown_api_brand' });
        return;
      }

      // 赋值apikey-deepseek
      const deepseekApiKey = items && items.deepseekApiKey ? items.deepseekApiKey : null;
      if (!deepseekApiKey) {
        sendResponse({ success: false, error: 'missing_api_key' });
        return;
      }

      // 走到这里说明已通过上面的截图门禁：截图只可能是 Flash 分支
      const resultOrIterable = await translateDeepseek({
        text: isVision ? undefined : msg.text,
        imageDataUrl: isVision ? msg.imageDataUrl : undefined,
        target: normalizeTargetForBrand('deepseek-api', items && items.targetLanguage || 'ZH-HANS'),
        apiKey: deepseekApiKey,
        model: isVision ? FLASH_MODEL : deepseekModel,
        stream: streamDeepseek
      });

      await respondWithResult(resultOrIterable, sender, sendResponse);
    } catch (err) {
      console.error('BG dispatcher error:', err);
      // 尽可能通知页面
      try {
        const tabId = (sender && sender.tab && sender.tab.id) || null;
        if (tabId) chrome.tabs.sendMessage(tabId, { action: 'translate_stream', done: true, success: false, error: err && err.message ? err.message : String(err) });
      } catch (e) {}
      sendResponse({ success: false, error: err && err.message ? err.message : String(err) });
    }
  })();

  // "true" indicate we will respond asynchronously
  return true;
});

function normalizeTargetForBrand(brand, targetRaw) {
  if (!targetRaw) return undefined;
  let t = String(targetRaw).toUpperCase();

  if (brand === 'deepl-api') {
    if (t === 'ZH-HANS') t = 'ZH-HANS';
    else if (t === 'ZH-HANT') t = 'ZH-HANT';
    else if (t === 'EN-GB') t = 'EN-GB';
    else if (t === 'EN-US') t = 'EN-US';
    else if (t === 'JA') t = 'JA';
    else if (t === 'DE') t = 'DE';
    else if (t === 'FR') t = 'FR';
    else if (t === 'RU') t = 'RU';
    else t = 'ZH-HANS'; // 默认值
    return t;
  } else if (brand === 'deepseek-api') {
    if (t === 'ZH-HANS') t = 'ZH-HANS(Chinese Simplified)';
    else if (t === 'ZH-HANT') t = 'ZH-HANT(Chinese Traditional)';
    else if (t === 'EN-GB') t = 'EN-GB(British English)';
    else if (t === 'EN-US') t = 'EN-US(American English)';
    else if (t === 'JA') t = 'JA(Japanese)';
    else if (t === 'DE') t = 'DE(German)';
    else if (t === 'FR') t = 'FR(French)';
    else if (t === 'RU') t = 'RU(Russian)';
    else t = 'ZH-HANS(Chinese Simplified)'; // 默认值
    return t;
  }

  // 待拓展其他api

  return t;
}
