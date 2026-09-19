(function (global) {
  const UI_LANGUAGE_KEY = 'uiLanguage';
  const DEFAULT_UI_LANGUAGE = 'en';

  const messages = {
    'en': {
      'shared': {
        'targetLanguages': {
          'ZH-HANS': 'ZH-HANS Simplified Chinese',
          'ZH-HANT': 'ZH-HANT Traditional Chinese',
          'EN-GB': 'EN-GB English (UK)',
          'EN-US': 'EN-US English (US)',
          'JA': 'JA Japanese',
          'DE': 'DE German',
          'FR': 'FR French',
          'RU': 'RU Russian'
        },
        'uiLanguages': {
          'en': 'English',
          'zh-CN': 'Simplified Chinese',
          'zh-TW': 'Traditional Chinese'
        },
        'backendModes': {
          'server': 'Custom Server',
          'api': 'Custom API'
        },
        'serverTargets': {
          'deepseek/': 'DeepSeek V4',
          'deepl/': 'DeepL'
        },
        'apiBrands': {
          'deepl-api': 'DeepL',
          'deepseek-api': 'DeepSeek V4'
        },
        'deepseekModels': {
          'deepseek-flash': 'Flash',
          'deepseek-v4-pro': 'Pro'
        },
        'streamModes': {
          'true': 'Streaming',
          'false': 'Non-streaming'
        },
        'httpMethods': {
          'POST': 'POST',
          'GET': 'GET'
        },
        'deeplEndpoints': {
          'free-deepl': 'DeepL Free',
          'pro-deepl': 'DeepL Pro'
        }
      },
      'menu': {
        'pageTitle': 'Translate on Select',
        'heading': 'Translate on Select',
        'targetLanguageLabel': 'Target Language',
        'uiLanguageLabel': 'Interface Language',
        'quickModeLabel': 'Quick Mode',
        'quickServerLabel': 'Server Endpoint',
        'quickApiLabel': 'API Source',
        'deepseekModelLabel': 'DeepSeek V4 Model',
        'streamModeLabel': 'DeepSeek Output Mode',
        'storageNote': 'Settings are stored locally only.',
        'moreSettingsButton': 'More Settings',
        'visionButton': 'Capture',
        'visionUnavailable': 'Cannot reach the current page. Please reload the tab and try again.'
      },
      'options': {
        'pageTitle': 'Translate on Select - Settings',
        'heading': 'Extension Settings',
        'heroText': 'Manage the mode, server URL, and API keys.',
        'currentModeLabel': 'Current Mode',
        'currentSourceLabel': 'Current Source',
        'currentModeTitle': 'Current Mode',
        'generalTitle': 'General Settings',
        'modeLabel': 'Working Mode',
        'serverTitle': 'Server',
        'serverUrlLabel': 'Server URL',
        'requestMethodLabel': 'Request Method',
        'serverEndpointLabel': 'Service Endpoint Type',
        'saveSettingsButton': 'Save Settings',
        'clearButton': 'Clear',
        'apiTitle': 'API Brand',
        'apiBrandLabel': 'Current Brand',
        'deepseekModelLabel': 'DeepSeek V4 Model',
        'deeplTitle': 'DeepL',
        'apiKeyLabel': 'API Key',
        'endpointLabel': 'Endpoint',
        'clearKeyButton': 'Clear Key',
        'deepseekTitle': 'DeepSeek',
        'modeSummaries': {
          'server': 'Currently using server mode.',
          'api': 'Currently using API mode.'
        },
        'toggle': {
          'show': 'Show',
          'hide': 'Hide',
          'showAria': 'Show {label}',
          'hideAria': 'Hide {label}'
        },
        'alerts': {
          'serverUrlRequired': 'Please enter a server URL.',
          'serverSaved': 'Server settings saved.',
          'serverCleared': 'Server settings cleared.',
          'deeplKeyRequired': 'Please enter the DeepL API key.',
          'deeplSaved': 'DeepL settings saved.',
          'deeplCleared': 'DeepL settings cleared.',
          'deepseekKeyRequired': 'Please enter the DeepSeek API key.',
          'deepseekSaved': 'DeepSeek settings saved.',
          'deepseekCleared': 'DeepSeek settings cleared.'
        }
      },
      'content': {
        'translateButton': 'Translate',
        'copyButton': 'Copy',
        'closeButton': 'Close',
        'loading': 'Translating...',
        'translationFailed': 'Translation failed: {error}',
        'noSelection': 'No text selected.',
        'textTooLong': 'The selected text is too long (> {max} characters). Please shorten the selection.',
        'visionCaptureFailed': 'Screenshot failed: {error}',
        'visionLoading': 'Translating screenshot…',
        'visionDrawHint': 'Press and hold the left button and drag to select the region',
        'visionConfirm': 'Confirm',
        'visionCancel': 'Cancel'
      }
    },
    'zh-CN': {
      'shared': {
        'targetLanguages': {
          'ZH-HANS': 'ZH-HANS 中文（简体）',
          'ZH-HANT': 'ZH-HANT 中文（繁体）',
          'EN-GB': 'EN-GB 英语（英式）',
          'EN-US': 'EN-US 英语（美式）',
          'JA': 'JA 日语',
          'DE': 'DE 德语',
          'FR': 'FR 法语',
          'RU': 'RU 俄语'
        },
        'uiLanguages': {
          'en': 'English',
          'zh-CN': '简体中文',
          'zh-TW': '繁體中文'
        },
        'backendModes': {
          'server': '自定义服务器',
          'api': '自定义 API'
        },
        'serverTargets': {
          'deepseek/': 'DeepSeek V4',
          'deepl/': 'DeepL'
        },
        'apiBrands': {
          'deepl-api': 'DeepL',
          'deepseek-api': 'DeepSeek V4'
        },
        'deepseekModels': {
          'deepseek-flash': 'Flash',
          'deepseek-v4-pro': 'Pro'
        },
        'streamModes': {
          'true': '流式输出',
          'false': '非流式输出'
        },
        'httpMethods': {
          'POST': 'POST',
          'GET': 'GET'
        },
        'deeplEndpoints': {
          'free-deepl': 'DeepL Free',
          'pro-deepl': 'DeepL Pro'
        }
      },
      'menu': {
        'pageTitle': '划词翻译',
        'heading': '划词翻译',
        'targetLanguageLabel': '目标语言',
        'uiLanguageLabel': '界面语言',
        'quickModeLabel': '快速切换模式',
        'quickServerLabel': '服务器端点',
        'quickApiLabel': 'API 来源',
        'deepseekModelLabel': 'DeepSeek V4 模型',
        'streamModeLabel': 'DeepSeek 输出模式',
        'storageNote': '配置仅保存在本地。',
        'moreSettingsButton': '更多设置',
        'visionButton': '截图',
        'visionUnavailable': '无法连接当前页面，请刷新标签页后重试。'
      },
      'options': {
        'pageTitle': 'Translate on Select - 设置',
        'heading': '扩展设置',
        'heroText': '管理模式、服务器地址和 API Key。',
        'currentModeLabel': '当前模式',
        'currentSourceLabel': '当前来源',
        'currentModeTitle': '当前模式',
        'generalTitle': '基础设置',
        'modeLabel': '工作模式',
        'serverTitle': '服务器',
        'serverUrlLabel': '服务器 URL',
        'requestMethodLabel': '请求方法',
        'serverEndpointLabel': '服务端点类型',
        'saveSettingsButton': '保存配置',
        'clearButton': '清空',
        'apiTitle': 'API 品牌',
        'apiBrandLabel': '当前品牌',
        'deepseekModelLabel': 'DeepSeek V4 模型',
        'deeplTitle': 'DeepL',
        'apiKeyLabel': 'API Key',
        'endpointLabel': 'Endpoint',
        'clearKeyButton': '清空 Key',
        'deepseekTitle': 'DeepSeek',
        'modeSummaries': {
          'server': '当前为服务器模式。',
          'api': '当前为 API 模式。'
        },
        'toggle': {
          'show': '显示',
          'hide': '隐藏',
          'showAria': '显示 {label}',
          'hideAria': '隐藏 {label}'
        },
        'alerts': {
          'serverUrlRequired': '请输入服务器 URL。',
          'serverSaved': '服务器配置已保存。',
          'serverCleared': '服务器配置已清空。',
          'deeplKeyRequired': '请输入 DeepL API Key。',
          'deeplSaved': 'DeepL 配置已保存。',
          'deeplCleared': 'DeepL 配置已清空。',
          'deepseekKeyRequired': '请输入 DeepSeek API Key。',
          'deepseekSaved': 'DeepSeek 配置已保存。',
          'deepseekCleared': 'DeepSeek 配置已清空。'
        }
      },
      'content': {
        'translateButton': '翻译',
        'copyButton': '复制',
        'closeButton': '关闭',
        'loading': '翻译中…',
        'translationFailed': '翻译失败：{error}',
        'noSelection': '没有选中文本。',
        'textTooLong': '文本过长（> {max} 字符），请缩短选区。',
        'visionCaptureFailed': '截图失败：{error}',
        'visionLoading': '正在翻译截图…',
        'visionDrawHint': '长按左键拖动，选取截图区域',
        'visionConfirm': '确认',
        'visionCancel': '取消'
      }
    },
    'zh-TW': {
      'shared': {
        'targetLanguages': {
          'ZH-HANS': 'ZH-HANS 中文（簡體）',
          'ZH-HANT': 'ZH-HANT 中文（繁體）',
          'EN-GB': 'EN-GB 英語（英式）',
          'EN-US': 'EN-US 英語（美式）',
          'JA': 'JA 日語',
          'DE': 'DE 德語',
          'FR': 'FR 法語',
          'RU': 'RU 俄語'
        },
        'uiLanguages': {
          'en': 'English',
          'zh-CN': '簡體中文',
          'zh-TW': '繁體中文'
        },
        'backendModes': {
          'server': '自訂伺服器',
          'api': '自訂 API'
        },
        'serverTargets': {
          'deepseek/': 'DeepSeek V4',
          'deepl/': 'DeepL'
        },
        'apiBrands': {
          'deepl-api': 'DeepL',
          'deepseek-api': 'DeepSeek V4'
        },
        'deepseekModels': {
          'deepseek-flash': 'Flash',
          'deepseek-v4-pro': 'Pro'
        },
        'streamModes': {
          'true': '串流輸出',
          'false': '非串流輸出'
        },
        'httpMethods': {
          'POST': 'POST',
          'GET': 'GET'
        },
        'deeplEndpoints': {
          'free-deepl': 'DeepL Free',
          'pro-deepl': 'DeepL Pro'
        }
      },
      'menu': {
        'pageTitle': '劃詞翻譯',
        'heading': '劃詞翻譯',
        'targetLanguageLabel': '目標語言',
        'uiLanguageLabel': '介面語言',
        'quickModeLabel': '快速切換模式',
        'quickServerLabel': '伺服器端點',
        'quickApiLabel': 'API 來源',
        'deepseekModelLabel': 'DeepSeek V4 模型',
        'streamModeLabel': 'DeepSeek 輸出模式',
        'storageNote': '設定只會儲存在本機。',
        'moreSettingsButton': '更多設定',
        'visionButton': '截圖',
        'visionUnavailable': '無法連線目前頁面，請重新整理分頁後再試。'
      },
      'options': {
        'pageTitle': 'Translate on Select - 設定',
        'heading': '擴充功能設定',
        'heroText': '管理模式、伺服器位址與 API Key。',
        'currentModeLabel': '目前模式',
        'currentSourceLabel': '目前來源',
        'currentModeTitle': '目前模式',
        'generalTitle': '基本設定',
        'modeLabel': '工作模式',
        'serverTitle': '伺服器',
        'serverUrlLabel': '伺服器 URL',
        'requestMethodLabel': '請求方法',
        'serverEndpointLabel': '服務端點類型',
        'saveSettingsButton': '儲存設定',
        'clearButton': '清空',
        'apiTitle': 'API 品牌',
        'apiBrandLabel': '目前品牌',
        'deepseekModelLabel': 'DeepSeek V4 模型',
        'deeplTitle': 'DeepL',
        'apiKeyLabel': 'API Key',
        'endpointLabel': 'Endpoint',
        'clearKeyButton': '清空 Key',
        'deepseekTitle': 'DeepSeek',
        'modeSummaries': {
          'server': '目前為伺服器模式。',
          'api': '目前為 API 模式。'
        },
        'toggle': {
          'show': '顯示',
          'hide': '隱藏',
          'showAria': '顯示 {label}',
          'hideAria': '隱藏 {label}'
        },
        'alerts': {
          'serverUrlRequired': '請輸入伺服器 URL。',
          'serverSaved': '伺服器設定已儲存。',
          'serverCleared': '伺服器設定已清空。',
          'deeplKeyRequired': '請輸入 DeepL API Key。',
          'deeplSaved': 'DeepL 設定已儲存。',
          'deeplCleared': 'DeepL 設定已清空。',
          'deepseekKeyRequired': '請輸入 DeepSeek API Key。',
          'deepseekSaved': 'DeepSeek 設定已儲存。',
          'deepseekCleared': 'DeepSeek 設定已清空。'
        }
      },
      'content': {
        'translateButton': '翻譯',
        'copyButton': '複製',
        'closeButton': '關閉',
        'loading': '翻譯中…',
        'translationFailed': '翻譯失敗：{error}',
        'noSelection': '沒有選取文字。',
        'textTooLong': '文字過長（> {max} 字元），請縮短選取範圍。',
        'visionCaptureFailed': '截圖失敗：{error}',
        'visionLoading': '正在翻譯截圖…',
        'visionDrawHint': '長按左鍵拖曳，選取截圖範圍',
        'visionConfirm': '確認',
        'visionCancel': '取消'
      }
    }
  };

  const targetLanguageValues = ['ZH-HANS', 'ZH-HANT', 'EN-GB', 'EN-US', 'JA', 'DE', 'FR', 'RU'];
  const uiLanguageValues = ['en', 'zh-CN', 'zh-TW'];
  const backendModeValues = ['server', 'api'];
  const serverTargetValues = ['deepseek/', 'deepl/'];
  const apiBrandValues = ['deepl-api', 'deepseek-api'];
  const streamModeValues = ['true', 'false'];
  const httpMethodValues = ['POST', 'GET'];
  const deeplEndpointValues = ['free-deepl', 'pro-deepl'];

  // DeepSeek 直连的两个分支：Flash 同时支持划词与截图，Pro 只做纯文本划词翻译、不支持截图。
  const DEEPSEEK_FLASH_MODEL = 'deepseek-flash';
  const DEEPSEEK_PRO_MODEL = 'deepseek-v4-pro';
  const deepseekModelValues = [DEEPSEEK_FLASH_MODEL, DEEPSEEK_PRO_MODEL];

  // 当前有效的 API 品牌；历史配置里可能残留已下线的品牌（google-api），
  // 统一回落到默认品牌，避免下拉框显示与 storage 中的取值不一致。
  const DEFAULT_API_BRAND = 'deepseek-api';
  const apiBrandSet = new Set(apiBrandValues);

  function normalizeApiBrand(brand) {
    const value = String(brand || '');
    return apiBrandSet.has(value) ? value : DEFAULT_API_BRAND;
  }

  // 历史配置里可能残留旧模型名（deepseek-v4-flash / deepseek-v4-flash-vision-exp），
  // 统一归一到当前模型名，避免旧取值在下拉框中落空。
  function normalizeDeepseekModel(model) {
    return String(model || '') === DEEPSEEK_PRO_MODEL ? DEEPSEEK_PRO_MODEL : DEEPSEEK_FLASH_MODEL;
  }

  function normalizeUiLanguage(language) {
    const normalized = String(language || '').trim().toLowerCase().replace(/_/g, '-');

    if (!normalized) return '';
    if (Object.prototype.hasOwnProperty.call(messages, normalized)) {
      return normalized;
    }
    if (normalized === 'en' || normalized.startsWith('en-')) {
      return 'en';
    }
    if (normalized === 'zh' || normalized === 'zh-cn' || normalized === 'zh-sg' || normalized === 'zh-hans') {
      return 'zh-CN';
    }
    if (
      normalized === 'zh-tw' ||
      normalized === 'zh-hk' ||
      normalized === 'zh-mo' ||
      normalized === 'zh-hant'
    ) {
      return 'zh-TW';
    }

    return '';
  }

  function resolveUiLanguage(language) {
    return normalizeUiLanguage(language) || DEFAULT_UI_LANGUAGE;
  }

  function detectInitialUiLanguage() {
    if (global.chrome && global.chrome.i18n && typeof global.chrome.i18n.getUILanguage === 'function') {
      const chromeLanguage = normalizeUiLanguage(global.chrome.i18n.getUILanguage());
      if (chromeLanguage) return chromeLanguage;
    }

    if (global.navigator && Array.isArray(global.navigator.languages)) {
      for (const language of global.navigator.languages) {
        const resolvedLanguage = normalizeUiLanguage(language);
        if (resolvedLanguage) return resolvedLanguage;
      }
    }

    if (global.navigator && global.navigator.language) {
      const navigatorLanguage = normalizeUiLanguage(global.navigator.language);
      if (navigatorLanguage) return navigatorLanguage;
    }

    return DEFAULT_UI_LANGUAGE;
  }

  function getByPath(source, path) {
    return path.split('.').reduce((accumulator, segment) => {
      if (accumulator && Object.prototype.hasOwnProperty.call(accumulator, segment)) {
        return accumulator[segment];
      }
      return undefined;
    }, source);
  }

  function interpolate(message, variables = {}) {
    return String(message).replace(/\{(\w+)\}/g, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        return String(variables[key]);
      }
      return match;
    });
  }

  function t(language, key, variables) {
    const resolvedLanguage = resolveUiLanguage(language);
    const resolvedMessage =
      getByPath(messages[resolvedLanguage], key) ??
      getByPath(messages[DEFAULT_UI_LANGUAGE], key) ??
      key;

    return interpolate(resolvedMessage, variables);
  }

  function applyTranslations(root, language) {
    const scope = root && typeof root.querySelectorAll === 'function' ? root : document;
    const resolvedLanguage = resolveUiLanguage(language);

    scope.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(resolvedLanguage, element.dataset.i18n);
    });

    scope.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      element.setAttribute('placeholder', t(resolvedLanguage, element.dataset.i18nPlaceholder));
    });

    scope.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      element.setAttribute('aria-label', t(resolvedLanguage, element.dataset.i18nAriaLabel));
    });

    scope.querySelectorAll('[data-i18n-title]').forEach((element) => {
      element.setAttribute('title', t(resolvedLanguage, element.dataset.i18nTitle));
    });

    scope.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      element.setAttribute('alt', t(resolvedLanguage, element.dataset.i18nAlt));
    });
  }

  function populateSelect(select, items, selectedValue) {
    if (!select) return;

    const desiredValue = selectedValue == null ? '' : String(selectedValue);
    select.textContent = '';

    items.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      select.appendChild(option);
    });

    if (desiredValue) {
      select.value = desiredValue;
    }

    if (select.value !== desiredValue && items.length > 0) {
      select.value = items[0].value;
    }
  }

  function createOptions(language, path, values) {
    const resolvedLanguage = resolveUiLanguage(language);
    return values.map((value) => ({
      'value': value,
      'label': t(resolvedLanguage, `${path}.${value}`)
    }));
  }

  function getTargetLanguageOptions(language) {
    return createOptions(language, 'shared.targetLanguages', targetLanguageValues);
  }

  function getUiLanguageOptions(language) {
    return createOptions(language, 'shared.uiLanguages', uiLanguageValues);
  }

  function getBackendModeOptions(language) {
    return createOptions(language, 'shared.backendModes', backendModeValues);
  }

  function getServerTargetOptions(language) {
    return createOptions(language, 'shared.serverTargets', serverTargetValues);
  }

  function getApiBrandOptions(language) {
    return createOptions(language, 'shared.apiBrands', apiBrandValues);
  }

  function getDeepseekModelOptions(language) {
    return createOptions(language, 'shared.deepseekModels', deepseekModelValues);
  }

  function getStreamModeOptions(language) {
    return createOptions(language, 'shared.streamModes', streamModeValues);
  }

  function getHttpMethodOptions(language) {
    return createOptions(language, 'shared.httpMethods', httpMethodValues);
  }

  function getDeeplEndpointOptions(language) {
    return createOptions(language, 'shared.deeplEndpoints', deeplEndpointValues);
  }

  global.TranslateOnSelectI18n = {
    'UI_LANGUAGE_KEY': UI_LANGUAGE_KEY,
    'DEFAULT_UI_LANGUAGE': DEFAULT_UI_LANGUAGE,
    'DEFAULT_API_BRAND': DEFAULT_API_BRAND,
    'DEEPSEEK_FLASH_MODEL': DEEPSEEK_FLASH_MODEL,
    'DEEPSEEK_PRO_MODEL': DEEPSEEK_PRO_MODEL,
    'normalizeApiBrand': normalizeApiBrand,
    'normalizeDeepseekModel': normalizeDeepseekModel,
    'normalizeUiLanguage': normalizeUiLanguage,
    'detectInitialUiLanguage': detectInitialUiLanguage,
    'resolveUiLanguage': resolveUiLanguage,
    't': t,
    'applyTranslations': applyTranslations,
    'populateSelect': populateSelect,
    'getTargetLanguageOptions': getTargetLanguageOptions,
    'getUiLanguageOptions': getUiLanguageOptions,
    'getBackendModeOptions': getBackendModeOptions,
    'getServerTargetOptions': getServerTargetOptions,
    'getApiBrandOptions': getApiBrandOptions,
    'getDeepseekModelOptions': getDeepseekModelOptions,
    'getStreamModeOptions': getStreamModeOptions,
    'getHttpMethodOptions': getHttpMethodOptions,
    'getDeeplEndpointOptions': getDeeplEndpointOptions
  };
})(globalThis);
