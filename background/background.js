import { translate as translateDeepl } from './api/deepl_api.js';
import { translate as translateDeepseek } from './api/deepseek_api.js';
import { translate as translateServer } from './api/server_api.js';

console.log('BG: Quick Select Translate (dispatcher) loaded');

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Keep listener non-blocking but we'll use async flow and return true for async response.
  (async () => {
    try {
      console.log('BG received:', msg);

      if (!msg || msg.action !== 'translate') {
        sendResponse({ success: false, error: 'unsupported_action' });
        return;
      }

      // 读取本地数据
      const items = await new Promise((resolve) => {
        chrome.storage.local.get(
          ['backendMode','apiBrand','serverUrl','httpMethod','apiSelectServer','deeplApiKey','deepseekApiKey','deeplEndpoint','targetLanguage', 'streamDeepseek'],
          resolve
        );
      });

      // 赋值本地数据
      const backendMode = items && items.backendMode ? items.backendMode : 'server';
      const apiBrand = items && items.apiBrand ? items.apiBrand : 'deepl-api'; // default if api mode
      const targetFormat = normalizeTargetForBrand(apiBrand, msg.target || items && items.targetLanguage || 'ZH-HANS');
      const streamDeepseek = items && items.streamDeepseek ? (items.streamDeepseek === 'true') : false;

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

        // 调用翻译（可能返回 async iterable）
        const resultOrIterable = await translateServer({
          text: msg.text,
          target: targetFormat,
          serverUrl,
          httpMethod,
          brand: apiServer,
          meta: { from: 'server' } // pass through if needed
        });

        if (isAsyncIterable(resultOrIterable)) {
          const tabId = sender && sender.tab && sender.tab.id ? sender.tab.id : null;
          const streamResult = await streamToTab(resultOrIterable, tabId);
          sendResponse(streamResult);
          return;
        } else {
          // 非流式结果（对象）
          sendResponse(resultOrIterable);
          return;
        }
      } else if (backendMode === 'api') {

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

          if (isAsyncIterable(resultOrIterable)) {
            const tabId = sender && sender.tab && sender.tab.id ? sender.tab.id : null;
            const streamResult = await streamToTab(resultOrIterable, tabId);
            sendResponse(streamResult);
            return;
          } else {
            sendResponse(resultOrIterable);
            return;
          }

        } else if (apiBrand === 'deepseek-api') {
          // 赋值apikey-deepseek
          const deepseekApiKey = items && items.deepseekApiKey ? items.deepseekApiKey : null;
          if (!deepseekApiKey) {
            sendResponse({ success: false, error: 'missing_api_key' });
            return;
          }

          const resultOrIterable = await translateDeepseek({
            text: msg.text,
            target: targetFormat,
            apiKey: deepseekApiKey,
            streamDeepseek,
            meta: { from: 'deepseek' },
          });

          if (isAsyncIterable(resultOrIterable)) {
            const tabId = sender && sender.tab && sender.tab.id ? sender.tab.id : null;
            const streamResult = await streamToTab(resultOrIterable, tabId);
            sendResponse(streamResult);
            return;
          } else {
            sendResponse(resultOrIterable);
            return;
          }

        } else if (apiBrand === 'google-api') {
          // 待适配
          sendResponse({ success: false, error: 'google_api_not_implemented' });
          return;
        } else {
          // 暂不支持的api品牌
          sendResponse({ success: false, error: 'unknown_api_brand' });
          return;
        }
      }

      // fallback
      sendResponse({ success: false, error: 'unknown_backend_mode' });
    } catch (err) {
      console.error('BG dispatcher error:', err);
      // 尽可能通知页面
      try {
        const tabId = (arguments[2] && arguments[2].tab && arguments[2].tab.id) || null;
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
