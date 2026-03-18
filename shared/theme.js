(function (global) {
  const THEME_MODE_KEY = 'themeMode';
  const DEFAULT_THEME_MODE = 'light';

  const contentPalettes = {
    'light': {
      'floatButtonBackground': 'linear-gradient(135deg, #c65b2e, #8e3c18)',
      'floatButtonText': '#fff8f3',
      'floatButtonBorder': '1px solid rgba(255, 255, 255, 0.34)',
      'floatButtonShadow': '0 12px 28px rgba(24, 38, 44, 0.18)',
      'popupBackground': 'rgba(255, 252, 247, 0.96)',
      'popupText': '#18262c',
      'popupMutedText': '#5f6c72',
      'popupErrorText': '#b8402a',
      'popupBorder': '1px solid rgba(24, 38, 44, 0.12)',
      'popupShadow': '0 18px 40px rgba(24, 38, 44, 0.16)',
      'popupActionBackground': 'rgba(255, 255, 255, 0.88)',
      'popupActionText': '#18262c',
      'popupActionBorder': '1px solid rgba(24, 38, 44, 0.1)',
      'popupActionShadow': '0 8px 18px rgba(24, 38, 44, 0.08)'
    },
    'dark': {
      'floatButtonBackground': 'linear-gradient(135deg, #f09a53, #c65b2e)',
      'floatButtonText': '#1f1712',
      'floatButtonBorder': '1px solid rgba(240, 154, 83, 0.28)',
      'floatButtonShadow': '0 16px 34px rgba(0, 0, 0, 0.34)',
      'popupBackground': 'rgba(16, 22, 28, 0.96)',
      'popupText': '#f4efe7',
      'popupMutedText': '#aeb7be',
      'popupErrorText': '#ff9b8f',
      'popupBorder': '1px solid rgba(255, 255, 255, 0.1)',
      'popupShadow': '0 22px 48px rgba(0, 0, 0, 0.38)',
      'popupActionBackground': 'rgba(255, 255, 255, 0.07)',
      'popupActionText': '#f4efe7',
      'popupActionBorder': '1px solid rgba(255, 255, 255, 0.12)',
      'popupActionShadow': '0 10px 20px rgba(0, 0, 0, 0.18)'
    }
  };

  const themeToggleLabels = {
    'en': {
      'light': 'Switch to dark mode',
      'dark': 'Switch to light mode'
    },
    'zh-CN': {
      'light': '切换到深色模式',
      'dark': '切换到浅色模式'
    },
    'zh-TW': {
      'light': '切換到深色模式',
      'dark': '切換到淺色模式'
    }
  };

  function resolveThemeMode(mode) {
    return mode === 'dark' ? 'dark' : DEFAULT_THEME_MODE;
  }

  function applyDocumentTheme(root, mode) {
    const resolvedMode = resolveThemeMode(mode);
    const documentRoot = root && root.documentElement ? root.documentElement : document.documentElement;

    if (!documentRoot) return resolvedMode;

    documentRoot.dataset.theme = resolvedMode;
    documentRoot.style.colorScheme = resolvedMode;
    return resolvedMode;
  }

  function getContentPalette(mode) {
    return contentPalettes[resolveThemeMode(mode)];
  }

  function getThemeToggleLabel(language, themeMode) {
    const labels = themeToggleLabels[language] || themeToggleLabels.en;
    return labels[resolveThemeMode(themeMode)];
  }

  function toggleThemeMode(mode) {
    return resolveThemeMode(mode) === 'dark' ? DEFAULT_THEME_MODE : 'dark';
  }

  global.TranslateOnSelectTheme = {
    'THEME_MODE_KEY': THEME_MODE_KEY,
    'DEFAULT_THEME_MODE': DEFAULT_THEME_MODE,
    'applyDocumentTheme': applyDocumentTheme,
    'resolveThemeMode': resolveThemeMode,
    'getContentPalette': getContentPalette,
    'getThemeToggleLabel': getThemeToggleLabel,
    'toggleThemeMode': toggleThemeMode
  };
})(globalThis);
