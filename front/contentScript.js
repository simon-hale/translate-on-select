(function () {
  const i18n = globalThis.TranslateOnSelectI18n;
  const theme = globalThis.TranslateOnSelectTheme;

  if (!i18n) {
    console.error('I18n helpers are unavailable in content script.');
    return;
  }

  if (!theme) {
    console.error('Theme helpers are unavailable in content script.');
    return;
  }

  const MAX_CHARS = 2400;
  const defaultLanguage = i18n.detectInitialUiLanguage();
  const defaultThemeMode = theme.DEFAULT_THEME_MODE;

  let currentLanguage = defaultLanguage;
  let currentThemeMode = defaultThemeMode;
  let floatBtn = null;
  let popup = null;
  let popupTimeout = null;
  let lastSelectionText = '';
  let lastRangeRect = null;
  let floatBtnTimeout = null;
  let streamingActive = false;
  let streamingBuffer = '';
  let popupSystemState = null;

  function t(key, variables) {
    return i18n.t(currentLanguage, key, variables);
  }

  function getThemePalette() {
    return theme.getContentPalette(currentThemeMode);
  }

  function applyContentTone(contentEl) {
    if (!contentEl) return;

    const palette = getThemePalette();
    const tone = contentEl.dataset.tone || 'normal';

    contentEl.style.color = tone === 'error' ? palette.popupErrorText : palette.popupText;
    contentEl.style.opacity = tone === 'loading' ? '0.72' : '1';
  }

  function stylePopupActionButton(button) {
    if (!button) return;

    const palette = getThemePalette();

    button.style.border = palette.popupActionBorder;
    button.style.background = palette.popupActionBackground;
    button.style.color = palette.popupActionText;
    button.style.boxShadow = palette.popupActionShadow;
  }

  function applyFloatButtonTheme() {
    if (!floatBtn) return;

    const palette = getThemePalette();

    floatBtn.style.background = palette.floatButtonBackground;
    floatBtn.style.color = palette.floatButtonText;
    floatBtn.style.border = palette.floatButtonBorder;
    floatBtn.style.boxShadow = palette.floatButtonShadow;
  }

  function applyPopupTheme() {
    if (!popup) return;

    const palette = getThemePalette();

    popup.style.background = palette.popupBackground;
    popup.style.color = palette.popupText;
    popup.style.border = palette.popupBorder;
    popup.style.boxShadow = palette.popupShadow;

    applyContentTone(document.getElementById('qt-content'));
    stylePopupActionButton(document.getElementById('qt-copy'));
    stylePopupActionButton(document.getElementById('qt-close'));
  }

  function setPopupContentText(text, tone = 'normal') {
    const contentEl = document.getElementById('qt-content');
    if (!contentEl) return;

    contentEl.innerText = text;
    contentEl.dataset.tone = tone;
    applyContentTone(contentEl);
  }

  function renderPopupSystemState() {
    if (!popupSystemState) return;
    setPopupContentText(t(popupSystemState.key, popupSystemState.variables), popupSystemState.tone);
  }

  function refreshOpenUi() {
    if (floatBtn) {
      floatBtn.textContent = t('content.translateButton');
      applyFloatButtonTheme();
    }

    if (!popup) return;

    const copyButton = document.getElementById('qt-copy');
    const closeButton = document.getElementById('qt-close');

    if (copyButton) {
      copyButton.textContent = t('content.copyButton');
    }

    if (closeButton) {
      closeButton.textContent = t('content.closeButton');
    }

    applyPopupTheme();

    if (popupSystemState) {
      renderPopupSystemState();
    }
  }

  function loadUiPreferences() {
    if (!chrome.storage || !chrome.storage.local) return;

    chrome.storage.local.get({ [i18n.UI_LANGUAGE_KEY]: defaultLanguage, [theme.THEME_MODE_KEY]: defaultThemeMode }, (items) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to load content script language:', chrome.runtime.lastError);
        return;
      }

      currentLanguage = i18n.resolveUiLanguage(items[i18n.UI_LANGUAGE_KEY]);
      currentThemeMode = theme.resolveThemeMode(items[theme.THEME_MODE_KEY]);
      refreshOpenUi();
    });
  }

  function removeFloatBtn() {
    if (floatBtn) {
      floatBtn.remove();
      floatBtn = null;
    }
    if (floatBtnTimeout) {
      clearTimeout(floatBtnTimeout);
      floatBtnTimeout = null;
    }
    window.removeEventListener('mousedown', outsideClickHandlerForBtn);
  }

  function createFloatBtn(x, y) {
    removeFloatBtn();

    floatBtn = document.createElement('button');
    floatBtn.id = 'qt-float-btn';
    floatBtn.type = 'button';
    floatBtn.textContent = t('content.translateButton');

    Object.assign(floatBtn.style, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: 2147483647,
      padding: '6px 10px',
      fontSize: '13px',
      borderRadius: '18px',
      border: '1px solid transparent',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease'
    });

    floatBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      try {
        showLoadingAtRect(lastRangeRect || { left: x, bottom: y + 24 });
        triggerTranslate(lastSelectionText);
      } finally {
        // Keep the button after click so repeated translations stay convenient.
      }
    });

    document.body.appendChild(floatBtn);
    applyFloatButtonTheme();

    setTimeout(() => {
      window.addEventListener('mousedown', outsideClickHandlerForBtn);
    }, 0);
  }

  function outsideClickHandlerForBtn(event) {
    if (!floatBtn) return;
    if (!floatBtn.contains(event.target)) {
      // Intentionally keep the button visible until the selection changes.
    }
  }

  function removePopup() {
    if (popup) {
      popup.remove();
      popup = null;
    }
    if (popupTimeout) {
      clearTimeout(popupTimeout);
      popupTimeout = null;
    }
    window.removeEventListener('mousedown', outsideClickHandlerForPopup);
    streamingActive = false;
    streamingBuffer = '';
    popupSystemState = null;
  }

  function createPopup(x, y) {
    removePopup();

    popup = document.createElement('div');
    popup.id = 'qt-popup';
    popup.style.position = 'absolute';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.zIndex = 2147483647;
    popup.style.minWidth = '220px';
    popup.style.maxWidth = '520px';
    popup.style.border = '1px solid transparent';
    popup.style.borderRadius = '8px';
    popup.style.padding = '8px';
    popup.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    popup.style.fontSize = '14px';
    popup.style.lineHeight = '1.4';
    popup.style.backdropFilter = 'blur(2px)';
    popup.style.wordBreak = 'break-word';

    const content = document.createElement('div');
    content.id = 'qt-content';
    content.style.minHeight = '20px';
    popup.appendChild(content);

    const actionRow = document.createElement('div');
    actionRow.style.display = 'flex';
    actionRow.style.gap = '8px';
    actionRow.style.marginTop = '8px';
    actionRow.style.justifyContent = 'flex-end';

    const copyButton = document.createElement('button');
    copyButton.id = 'qt-copy';
    copyButton.type = 'button';
    copyButton.textContent = t('content.copyButton');
    Object.assign(copyButton.style, {
      padding: '4px 8px',
      borderRadius: '6px',
      border: '1px solid transparent',
      cursor: 'pointer',
      transition: 'border-color 160ms ease, box-shadow 160ms ease, background 160ms ease'
    });

    const closeButton = document.createElement('button');
    closeButton.id = 'qt-close';
    closeButton.type = 'button';
    closeButton.textContent = t('content.closeButton');
    Object.assign(closeButton.style, {
      padding: '4px 8px',
      borderRadius: '6px',
      border: '1px solid transparent',
      cursor: 'pointer',
      transition: 'border-color 160ms ease, box-shadow 160ms ease, background 160ms ease'
    });

    actionRow.appendChild(copyButton);
    actionRow.appendChild(closeButton);
    popup.appendChild(actionRow);
    document.body.appendChild(popup);
    applyPopupTheme();

    closeButton.addEventListener('click', removePopup);
    copyButton.addEventListener('click', async () => {
      const text = document.getElementById('qt-content').innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
    });

    setTimeout(() => {
      window.addEventListener('mousedown', outsideClickHandlerForPopup);
    }, 0);
  }

  function outsideClickHandlerForPopup(event) {
    if (!popup) return;
    if (!popup.contains(event.target)) {
      removePopup();
    }
  }

  function showSystemMessageAtRect(rect, key, variables = {}, tone = 'normal') {
    const pos = computePopupPosition(rect);
    createPopup(pos.x, pos.y);
    popupSystemState = { key, variables, tone };
    renderPopupSystemState();
  }

  function showTranslatedResultAtRect(rect, text) {
    const pos = computePopupPosition(rect);
    createPopup(pos.x, pos.y);
    popupSystemState = null;
    setPopupContentText(text, 'normal');
  }

  function showLoadingAtRect(rect) {
    showSystemMessageAtRect(rect, 'content.loading', {}, 'loading');
  }

  function computePopupPosition(rect) {
    const padding = 8;
    const popupWidth = Math.min(520, Math.max(220, (rect && rect.width) || 300));
    let x = Math.max(padding, (rect ? rect.left : window.innerWidth / 2) + window.scrollX);
    let y = Math.max(padding, (rect ? rect.bottom : 120) + window.scrollY + 6);

    if (x + popupWidth + padding > window.scrollX + window.innerWidth) {
      x = window.scrollX + window.innerWidth - popupWidth - padding;
      if (x < padding) x = padding;
    }
    return { x, y };
  }

  chrome.runtime.onMessage.addListener((msg) => {
    try {
      if (!msg || msg.action !== 'translate_stream') return;

      if (!popup) {
        showLoadingAtRect(lastRangeRect || { left: window.innerWidth / 2, bottom: 120 });
      }

      if (msg.error) {
        popupSystemState = {
          key: 'content.translationFailed',
          variables: { error: String(msg.error) },
          tone: 'error'
        };
        renderPopupSystemState();
        streamingActive = false;
        streamingBuffer = '';
        return;
      }

      if (msg.done) {
        streamingActive = false;
        streamingBuffer = '';

        if (msg.success && typeof msg.translated !== 'undefined') {
          popupSystemState = null;
          setPopupContentText(String(msg.translated), 'normal');
        } else if (typeof msg.message !== 'undefined') {
          popupSystemState = null;
          setPopupContentText(String(msg.message), 'normal');
        }
        return;
      }

      if (typeof msg.chunk !== 'undefined') {
        const chunkText = String(msg.chunk);
        streamingBuffer += chunkText;
        popupSystemState = null;
        setPopupContentText(streamingBuffer, 'normal');
        streamingActive = true;
      }
    } catch (error) {
      console.error('stream handler error:', error);
    }
  });

  function sendTranslateMessage(text) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(
          { action: 'translate', text },
          (response) => {
            if (chrome.runtime.lastError) {
              resolve({ success: false, error: chrome.runtime.lastError.message });
              return;
            }
            if (!response) {
              resolve({ success: false, error: 'no_response_from_background' });
              return;
            }
            resolve(response);
          }
        );
      } catch (error) {
        resolve({ success: false, error: error && error.message ? error.message : String(error) });
      }
    });
  }

  async function triggerTranslate(text) {
    if (!text) {
      showSystemMessageAtRect(
        lastRangeRect || { left: window.innerWidth / 2, bottom: 120 },
        'content.noSelection'
      );
      return;
    }

    streamingActive = false;
    streamingBuffer = '';

    showLoadingAtRect(lastRangeRect || { left: window.innerWidth / 2, bottom: 120 });

    const response = await sendTranslateMessage(text);
    if (!response || !response.success) {
      const errorMessage = response && response.error ? String(response.error) : 'unknown_error';
      showSystemMessageAtRect(
        lastRangeRect || { left: window.innerWidth / 2, bottom: 120 },
        'content.translationFailed',
        { error: errorMessage },
        'error'
      );
      return;
    }

    showTranslatedResultAtRect(
      lastRangeRect || { left: window.innerWidth / 2, bottom: 120 },
      String(response.translated || '')
    );
  }

  function handleSelectionShowButton() {
    const selection = window.getSelection();
    if (!selection) {
      lastSelectionText = '';
      lastRangeRect = null;
      removeFloatBtn();
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      lastSelectionText = '';
      lastRangeRect = null;
      removeFloatBtn();
      return;
    }

    if (text.length > MAX_CHARS) {
      lastSelectionText = '';
      lastRangeRect = null;
      removeFloatBtn();

      try {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        showSystemMessageAtRect(rect, 'content.textTooLong', { max: MAX_CHARS });
      } catch (error) {
        // Ignore range lookup failures for collapsed or detached selections.
      }
      return;
    }

    let rect;
    try {
      rect = selection.getRangeAt(0).getBoundingClientRect();
    } catch (error) {
      rect = { left: window.innerWidth / 2, bottom: 120, width: 200 };
    }

    lastSelectionText = text;
    lastRangeRect = rect;

    const padding = 6;
    const btnWidth = 64;
    const btnHeight = 32;
    const scrollX = window.scrollX || 0;
    const scrollY = window.scrollY || 0;

    let btnX = rect.right + scrollX - btnWidth;
    let btnY = rect.top + scrollY - btnHeight - 6;

    if (btnY < scrollY + padding) {
      btnY = rect.bottom + scrollY + 6;
    }

    if (btnX + btnWidth + padding > scrollX + window.innerWidth) {
      btnX = scrollX + window.innerWidth - btnWidth - padding;
    }
    if (btnX < scrollX + padding) btnX = scrollX + padding;

    createFloatBtn(btnX, btnY);
  }

  document.addEventListener('mouseup', () => {
    setTimeout(handleSelectionShowButton, 10);
  });

  document.addEventListener('touchend', () => {
    setTimeout(handleSelectionShowButton, 10);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      removeFloatBtn();
      removePopup();
    }
  });

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return;

      if (changes[i18n.UI_LANGUAGE_KEY]) {
        currentLanguage = i18n.resolveUiLanguage(changes[i18n.UI_LANGUAGE_KEY].newValue || defaultLanguage);
      }

      if (changes[theme.THEME_MODE_KEY]) {
        currentThemeMode = theme.resolveThemeMode(changes[theme.THEME_MODE_KEY].newValue || defaultThemeMode);
      }

      refreshOpenUi();
    });
  }

  window.addEventListener('unload', () => {
    removeFloatBtn();
    removePopup();
  });

  loadUiPreferences();
})();
