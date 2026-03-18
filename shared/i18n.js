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
          'deepseek/': 'Deepseek V3 Chat',
          'deepl/': 'DeepL'
        },
        'apiBrands': {
          'deepl-api': 'DeepL',
          'deepseek-api': 'Deepseek V3 Chat',
          'google-api': 'Google Translate'
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
        'streamModeLabel': 'Deepseek Output Mode',
        'storageNote': 'Settings are stored locally only.',
        'moreSettingsButton': 'More Settings'
      },
      'options': {
        'pageTitle': 'Translate on Select - Settings',
        'heading': 'Extension Settings',
        'heroText': 'Manage the mode, server URL, and API keys.',
        'currentModeLabel': 'Current Mode',
        'currentSourceLabel': 'Current Source',
        'iconAlt': 'Translate on Select icon',
        'localStorageLabel': 'Local Storage',
        'localStorageText': 'Settings are stored only in this browser.',
        'recommendationTitle': 'Recommendation',
        'recommendationText': 'If you have a relay service, prefer server mode.',
        'securityTitle': 'Security',
        'securityText': 'Do not share screenshots or settings that contain API keys.',
        'currentModeTitle': 'Current Mode',
        'generalKicker': 'General',
        'generalTitle': 'General Settings',
        'generalCopy': 'Pick the interface language and working mode first.',
        'modeLabel': 'Working Mode',
        'modeHint': 'Server mode uses your backend, while API mode talks to providers directly.',
        'uiLanguageHint': 'Applies to the popup, options page, and on-page translation overlay.',
        'serverKicker': 'Server',
        'serverTitle': 'Server',
        'serverCopy': 'Provide the URL, request method, and service type.',
        'serverUrlLabel': 'Server URL',
        'requestMethodLabel': 'Request Method',
        'serverEndpointLabel': 'Service Endpoint Type',
        'serverEndpointHint': 'Select the service type used by the current server.',
        'saveSettingsButton': 'Save Settings',
        'clearButton': 'Clear',
        'noteTitle': 'Note',
        'noteText': 'A trailing `/` will be appended automatically when saving.',
        'apiKicker': 'API',
        'apiTitle': 'API Brand',
        'apiCopy': 'The matching configuration card appears after switching.',
        'apiBrandLabel': 'Current Brand',
        'deeplKicker': 'DeepL',
        'deeplTitle': 'DeepL',
        'deeplCopy': 'Save the DeepL key and endpoint.',
        'apiKeyLabel': 'API Key',
        'endpointLabel': 'Endpoint',
        'clearKeyButton': 'Clear Key',
        'deepseekKicker': 'Deepseek',
        'deepseekTitle': 'Deepseek',
        'deepseekCopy': 'Save the Deepseek key.',
        'googleKicker': 'Google',
        'googleTitle': 'Google',
        'googleCopy': 'The entry point is reserved but not wired yet.',
        'notImplementedTitle': 'Not implemented yet',
        'notImplementedText': 'You can add configuration fields here later.',
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
          'deepseekKeyRequired': 'Please enter the Deepseek API key.',
          'deepseekSaved': 'Deepseek settings saved.',
          'deepseekCleared': 'Deepseek settings cleared.'
        }
      },
      'content': {
        'translateButton': 'Translate',
        'copyButton': 'Copy',
        'closeButton': 'Close',
        'loading': 'Translating...',
        'translationFailed': 'Translation failed: {error}',
        'noSelection': 'No text selected.',
        'textTooLong': 'The selected text is too long (> {max} characters). Please shorten the selection.'
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
          'deepseek/': 'Deepseek V3 Chat',
          'deepl/': 'DeepL'
        },
        'apiBrands': {
          'deepl-api': 'DeepL',
          'deepseek-api': 'Deepseek V3 Chat',
          'google-api': 'Google Translate'
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
        'streamModeLabel': 'Deepseek 输出模式',
        'storageNote': '配置仅保存在本地。',
        'moreSettingsButton': '更多设置'
      },
      'options': {
        'pageTitle': 'Translate on Select - 设置',
        'heading': '扩展设置',
        'heroText': '管理模式、服务器地址和 API Key。',
        'currentModeLabel': '当前模式',
        'currentSourceLabel': '当前来源',
        'iconAlt': 'Translate on Select 图标',
        'localStorageLabel': '本地存储',
        'localStorageText': '配置只保存在当前浏览器。',
        'recommendationTitle': '建议',
        'recommendationText': '有自建中转服务时，优先使用服务器模式。',
        'securityTitle': '安全',
        'securityText': '不要公开带有 API Key 的截图或配置。',
        'currentModeTitle': '当前模式',
        'generalKicker': '基础',
        'generalTitle': '基础设置',
        'generalCopy': '先选择界面语言，再配置翻译模式。',
        'modeLabel': '工作模式',
        'modeHint': '服务器模式走后端，API 模式直连第三方。',
        'uiLanguageHint': '会同时应用到弹窗、设置页和网页内翻译浮层。',
        'serverKicker': '服务器',
        'serverTitle': '服务器',
        'serverCopy': '填写地址、请求方式和服务类型。',
        'serverUrlLabel': '服务器 URL',
        'requestMethodLabel': '请求方法',
        'serverEndpointLabel': '服务端点类型',
        'serverEndpointHint': '选择当前服务端所使用的类型。',
        'saveSettingsButton': '保存配置',
        'clearButton': '清空',
        'noteTitle': '提示',
        'noteText': '保存时会自动补全末尾的 `/`。',
        'apiKicker': 'API',
        'apiTitle': 'API 品牌',
        'apiCopy': '切换后显示对应配置。',
        'apiBrandLabel': '当前品牌',
        'deeplKicker': 'DeepL',
        'deeplTitle': 'DeepL',
        'deeplCopy': '保存 DeepL Key 与 endpoint。',
        'apiKeyLabel': 'API Key',
        'endpointLabel': 'Endpoint',
        'clearKeyButton': '清空 Key',
        'deepseekKicker': 'Deepseek',
        'deepseekTitle': 'Deepseek',
        'deepseekCopy': '保存 Deepseek Key。',
        'googleKicker': 'Google',
        'googleTitle': 'Google',
        'googleCopy': '入口已预留，暂未接入。',
        'notImplementedTitle': '尚未适配',
        'notImplementedText': '后续可在这里补充配置项。',
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
          'deepseekKeyRequired': '请输入 Deepseek API Key。',
          'deepseekSaved': 'Deepseek 配置已保存。',
          'deepseekCleared': 'Deepseek 配置已清空。'
        }
      },
      'content': {
        'translateButton': '翻译',
        'copyButton': '复制',
        'closeButton': '关闭',
        'loading': '翻译中…',
        'translationFailed': '翻译失败：{error}',
        'noSelection': '没有选中文本。',
        'textTooLong': '文本过长（> {max} 字符），请缩短选区。'
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
          'deepseek/': 'Deepseek V3 Chat',
          'deepl/': 'DeepL'
        },
        'apiBrands': {
          'deepl-api': 'DeepL',
          'deepseek-api': 'Deepseek V3 Chat',
          'google-api': 'Google Translate'
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
        'streamModeLabel': 'Deepseek 輸出模式',
        'storageNote': '設定只會儲存在本機。',
        'moreSettingsButton': '更多設定'
      },
      'options': {
        'pageTitle': 'Translate on Select - 設定',
        'heading': '擴充功能設定',
        'heroText': '管理模式、伺服器位址與 API Key。',
        'currentModeLabel': '目前模式',
        'currentSourceLabel': '目前來源',
        'iconAlt': 'Translate on Select 圖示',
        'localStorageLabel': '本機儲存',
        'localStorageText': '設定只會儲存在目前瀏覽器。',
        'recommendationTitle': '建議',
        'recommendationText': '如果有自建中轉服務，優先使用伺服器模式。',
        'securityTitle': '安全',
        'securityText': '不要公開包含 API Key 的截圖或設定。',
        'currentModeTitle': '目前模式',
        'generalKicker': '基本',
        'generalTitle': '基本設定',
        'generalCopy': '先選擇介面語言，再設定翻譯模式。',
        'modeLabel': '工作模式',
        'modeHint': '伺服器模式經由後端，API 模式直接連線第三方。',
        'uiLanguageHint': '會同步套用到彈窗、設定頁與網頁內翻譯浮層。',
        'serverKicker': '伺服器',
        'serverTitle': '伺服器',
        'serverCopy': '填寫位址、請求方式與服務類型。',
        'serverUrlLabel': '伺服器 URL',
        'requestMethodLabel': '請求方法',
        'serverEndpointLabel': '服務端點類型',
        'serverEndpointHint': '選擇目前伺服器使用的服務類型。',
        'saveSettingsButton': '儲存設定',
        'clearButton': '清空',
        'noteTitle': '提示',
        'noteText': '儲存時會自動補上結尾的 `/`。',
        'apiKicker': 'API',
        'apiTitle': 'API 品牌',
        'apiCopy': '切換後會顯示對應設定。',
        'apiBrandLabel': '目前品牌',
        'deeplKicker': 'DeepL',
        'deeplTitle': 'DeepL',
        'deeplCopy': '儲存 DeepL Key 與 endpoint。',
        'apiKeyLabel': 'API Key',
        'endpointLabel': 'Endpoint',
        'clearKeyButton': '清空 Key',
        'deepseekKicker': 'Deepseek',
        'deepseekTitle': 'Deepseek',
        'deepseekCopy': '儲存 Deepseek Key。',
        'googleKicker': 'Google',
        'googleTitle': 'Google',
        'googleCopy': '入口已預留，尚未接入。',
        'notImplementedTitle': '尚未支援',
        'notImplementedText': '之後可以在這裡補上設定項目。',
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
          'deepseekKeyRequired': '請輸入 Deepseek API Key。',
          'deepseekSaved': 'Deepseek 設定已儲存。',
          'deepseekCleared': 'Deepseek 設定已清空。'
        }
      },
      'content': {
        'translateButton': '翻譯',
        'copyButton': '複製',
        'closeButton': '關閉',
        'loading': '翻譯中…',
        'translationFailed': '翻譯失敗：{error}',
        'noSelection': '沒有選取文字。',
        'textTooLong': '文字過長（> {max} 字元），請縮短選取範圍。'
      }
    }
  };

  const targetLanguageValues = ['ZH-HANS', 'ZH-HANT', 'EN-GB', 'EN-US', 'JA', 'DE', 'FR', 'RU'];
  const uiLanguageValues = ['en', 'zh-CN', 'zh-TW'];
  const backendModeValues = ['server', 'api'];
  const serverTargetValues = ['deepseek/', 'deepl/'];
  const apiBrandValues = ['deepl-api', 'deepseek-api', 'google-api'];
  const streamModeValues = ['true', 'false'];
  const httpMethodValues = ['POST', 'GET'];
  const deeplEndpointValues = ['free-deepl', 'pro-deepl'];

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
    'getStreamModeOptions': getStreamModeOptions,
    'getHttpMethodOptions': getHttpMethodOptions,
    'getDeeplEndpointOptions': getDeeplEndpointOptions
  };
})(globalThis);