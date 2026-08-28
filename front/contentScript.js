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
  let visionCapture = null;
  let visionOutputActive = false;
  let visionAnchorRect = null;

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
    visionOutputActive = false;
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

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    try {
      if (!msg) return;

      if (msg.action === 'start_vision_capture') {
        beginVisionCapture();
        // 同步应答，避免 menu 弹窗把“未应答”误判为无法连接页面
        sendResponse({ success: true });
        return;
      }

      if (msg.action !== 'translate_stream') return;

      if (!popup) {
        if (visionOutputActive) {
          showVisionLoading();
        } else {
          showLoadingAtRect(lastRangeRect || { left: window.innerWidth / 2, bottom: 120 });
        }
      }

      if (msg.error) {
        visionOutputActive = false;
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
        visionOutputActive = false;
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

  function sendRuntimeMessage(message) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          if (!response) {
            resolve({ success: false, error: 'no_response_from_background' });
            return;
          }
          resolve(response);
        });
      } catch (error) {
        resolve({ success: false, error: error && error.message ? error.message : String(error) });
      }
    });
  }

  function sendTranslateMessage(text) {
    return sendRuntimeMessage({ action: 'translate', text });
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

  // ---------------------------------------------------------------------------
  // Vision capture: screenshot the page, let the user adjust a crop region,
  // then translate it with the Deepseek vision model.
  // ---------------------------------------------------------------------------

  const VISION_BOX_MIN = 48;
  const VISION_MAX_SIDE = 1600;
  // 遮罩颜色：与选区框外压暗色（box-shadow）保持一致
  const VISION_MASK_COLOR = 'rgba(0, 0, 0, 0.42)';

  function getHandleCursor(dir) {
    if (dir === 'n' || dir === 's') return 'ns-resize';
    if (dir === 'e' || dir === 'w') return 'ew-resize';
    if (dir === 'nw' || dir === 'se') return 'nwse-resize';
    return 'nesw-resize';
  }

  // 输出框吸附截图选区下沿；越界时翻转到选区上方并夹紧在视口内
  function createVisionPopup() {
    const padding = 8;
    const popupWidth = Math.min(440, Math.max(260, Math.round(window.innerWidth * 0.6)));
    const estHeight = 220;
    const scrollX = window.scrollX || 0;
    const scrollY = window.scrollY || 0;
    const anchor = visionAnchorRect;
    let x = Math.max(padding, scrollX + window.innerWidth - popupWidth - padding);
    let y = Math.max(padding, scrollY + Math.round(window.innerHeight * 0.22));

    if (anchor) {
      x = Math.max(padding, anchor.left);
      y = anchor.bottom + padding;
      if (y + estHeight > scrollY + window.innerHeight - padding) {
        y = anchor.top - estHeight - padding;
      }
      y = Math.max(padding, y);
      if (x + popupWidth + padding > scrollX + window.innerWidth) {
        x = scrollX + window.innerWidth - popupWidth - padding;
      }
    }

    createPopup(x, y);
    popup.style.maxHeight = '68vh';
    popup.style.overflowY = 'auto';
    visionOutputActive = true;
  }

  function showVisionLoading() {
    createVisionPopup();
    popupSystemState = { key: 'content.visionLoading', variables: {}, tone: 'loading' };
    renderPopupSystemState();
  }

  function showVisionError(errorMessage) {
    createVisionPopup();
    popupSystemState = {
      key: 'content.translationFailed',
      variables: { error: errorMessage },
      tone: 'error'
    };
    renderPopupSystemState();
  }

  async function beginVisionCapture() {
    if (visionCapture) return;

    removeFloatBtn();
    removePopup();
    visionOutputActive = false;

    try {
      const response = await sendRuntimeMessage({ action: 'capture_visible_tab' });
      if (!response || !response.success) {
        const errorMessage = response && response.error ? String(response.error) : 'unknown_error';
        showSystemMessageAtRect(
          { left: window.innerWidth / 2, bottom: 120 },
          'content.visionCaptureFailed',
          { error: errorMessage },
          'error'
        );
        return;
      }
      buildVisionOverlay(response.dataUrl);
    } catch (error) {
      showSystemMessageAtRect(
        { left: window.innerWidth / 2, bottom: 120 },
        'content.visionCaptureFailed',
        { error: error && error.message ? error.message : String(error) },
        'error'
      );
    }
  }

  function buildVisionOverlay(dataUrl) {
    const overlay = document.createElement('div');
    overlay.id = 'qt-vision-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483646',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      userSelect: 'none'
    });
    overlay.addEventListener('wheel', (event) => event.preventDefault(), { passive: false });

    const image = new Image();
    image.alt = '';
    Object.assign(image.style, {
      display: 'block',
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    });

    // 等待框选时的遮罩层：必须是截图之上的独立层，
    // 不能放在 overlay 背景上（会被不透明的截图完全盖住）
    const mask = document.createElement('div');
    mask.id = 'qt-vision-mask';
    Object.assign(mask.style, {
      position: 'absolute',
      inset: '0',
      background: VISION_MASK_COLOR,
      pointerEvents: 'none'
    });

    const box = document.createElement('div');
    box.id = 'qt-vision-box';
    Object.assign(box.style, {
      position: 'absolute',
      display: 'none',
      border: '2px solid #7fae95',
      background: 'rgba(255, 255, 255, 0.04)',
      boxShadow: `0 0 0 9999px ${VISION_MASK_COLOR}`,
      cursor: 'move'
    });

    const handleDirs = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    const handles = handleDirs.map((dir) => {
      const handle = document.createElement('span');
      handle.dataset.dir = dir;
      Object.assign(handle.style, {
        position: 'absolute',
        width: '12px',
        height: '12px',
        border: '2px solid #7fae95',
        borderRadius: '50%',
        background: '#f2f7f4',
        cursor: getHandleCursor(dir),
        zIndex: '1'
      });
      if (dir.includes('n')) handle.style.top = '0';
      if (dir.includes('s')) handle.style.bottom = '0';
      if (dir.includes('w')) handle.style.left = '0';
      if (dir.includes('e')) handle.style.right = '0';
      if (dir === 'n' || dir === 's') handle.style.left = '50%';
      if (dir === 'e' || dir === 'w') handle.style.top = '50%';
      const tx = dir.includes('e') ? '50%' : '-50%';
      const ty = dir.includes('s') ? '50%' : '-50%';
      handle.style.transform = `translate(${tx}, ${ty})`;
      return handle;
    });

    // 工具栏：仅含确认/取消（必要宽度），有选区后由 refreshVisionUi 定位
    const toolbar = document.createElement('div');
    toolbar.id = 'qt-vision-toolbar';
    Object.assign(toolbar.style, {
      position: 'absolute',
      display: 'none',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 8px',
      borderRadius: '999px',
      background: 'rgba(24, 30, 38, 0.92)',
      boxShadow: '0 10px 26px rgba(0, 0, 0, 0.35)',
      zIndex: '1'
    });

    // 等待框选时的顶部提示条，框选开始/完成后隐藏
    const hint = document.createElement('div');
    hint.id = 'qt-vision-hint';
    Object.assign(hint.style, {
      position: 'absolute',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '2',
      maxWidth: 'calc(100% - 48px)',
      padding: '6px 12px',
      borderRadius: '999px',
      background: 'rgba(24, 30, 38, 0.92)',
      color: '#f4efe7',
      fontSize: '12px',
      textAlign: 'center',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
    });
    hint.textContent = t('content.visionDrawHint');

    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.textContent = t('content.visionConfirm');
    Object.assign(confirmBtn.style, {
      padding: '6px 14px',
      borderRadius: '999px',
      border: 'none',
      background: 'linear-gradient(135deg, #5f8f7a, #4a725f)',
      color: '#f4f9f6',
      cursor: 'pointer',
      fontWeight: '600'
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = t('content.visionCancel');
    Object.assign(cancelBtn.style, {
      padding: '6px 14px',
      borderRadius: '999px',
      border: '1px solid rgba(255, 255, 255, 0.28)',
      background: 'rgba(255, 255, 255, 0.08)',
      color: '#f4efe7',
      cursor: 'pointer'
    });

    overlay.appendChild(image);
    overlay.appendChild(mask);
    box.append(...handles);
    overlay.appendChild(box);
    toolbar.appendChild(confirmBtn);
    toolbar.appendChild(cancelBtn);
    overlay.appendChild(toolbar);
    overlay.appendChild(hint);
    document.body.appendChild(overlay);

    visionCapture = { overlay, image, mask, box, handles, confirmBtn, toolbar, hint, hasSelection: false, isDrawing: false };

    image.addEventListener('error', () => {
      // 清理时置空 src 也会触发 error 事件，此时忽略，避免误报
      if (!visionCapture) return;
      disposeVisionOverlay();
      showSystemMessageAtRect(
        { left: window.innerWidth / 2, bottom: 120 },
        'content.visionCaptureFailed',
        { error: 'invalid_image_data' },
        'error'
      );
    });

    image.src = dataUrl;

    confirmBtn.addEventListener('click', confirmVisionCapture);
    cancelBtn.addEventListener('click', disposeVisionOverlay);
    refreshVisionUi();
    attachVisionBoxInteractions(box);
    attachVisionDrawInteractions(overlay);
  }

  function setVisionBoxRect(rect) {
    if (!visionCapture) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const left = Math.min(Math.max(0, rect.left), width - VISION_BOX_MIN);
    const top = Math.min(Math.max(0, rect.top), height - VISION_BOX_MIN);
    const right = Math.min(Math.max(left + VISION_BOX_MIN, rect.left + rect.width), width);
    const bottom = Math.min(Math.max(top + VISION_BOX_MIN, rect.top + rect.height), height);
    Object.assign(visionCapture.box.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${right - left}px`,
      height: `${bottom - top}px`
    });
    refreshVisionUi();
  }

  // 统一刷新截图交互 UI 状态：遮罩、顶部提示、选区框、手柄、确认按钮、
  // 以及工具栏的显隐与吸附定位（选区下沿居中，越界翻转/夹紧在视口内）
  function refreshVisionUi() {
    if (!visionCapture) return;
    const { box, toolbar, hint, mask, handles, confirmBtn, isDrawing, hasSelection } = visionCapture;

    const hasBox = hasSelection || isDrawing;
    box.style.display = hasBox ? 'block' : 'none';
    mask.style.background = hasBox ? 'rgba(0, 0, 0, 0)' : VISION_MASK_COLOR;
    hint.style.display = !hasBox ? 'block' : 'none';
    handles.forEach((handle) => {
      handle.style.display = hasSelection ? '' : 'none';
    });
    confirmBtn.disabled = !hasSelection;
    confirmBtn.style.opacity = hasSelection ? '1' : '0.5';

    if (!hasSelection || isDrawing) {
      toolbar.style.display = 'none';
      toolbar.style.left = '';
      toolbar.style.top = '';
      return;
    }

    const boxRect = box.getBoundingClientRect();
    const margin = 8;
    toolbar.style.display = 'flex';
    const width = toolbar.offsetWidth;
    const height = toolbar.offsetHeight;

    let left = boxRect.left + boxRect.width / 2 - width / 2;
    let top = boxRect.bottom + margin;
    if (top + height > window.innerHeight - margin) {
      top = boxRect.top - height - margin;
    }
    top = Math.max(margin, top);
    left = Math.min(Math.max(margin, left), window.innerWidth - width - margin);

    toolbar.style.left = `${left}px`;
    toolbar.style.top = `${top}px`;
  }

  function attachVisionBoxInteractions(box) {
    let dragMode = null;
    let startX = 0;
    let startY = 0;
    let startRect = null;

    function onPointerDown(mode, event) {
      dragMode = mode;
      startX = event.clientX;
      startY = event.clientY;
      startRect = visionCapture.box.getBoundingClientRect();
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event) {
      if (!dragMode || !startRect) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const rect = { left: startRect.left, top: startRect.top, width: startRect.width, height: startRect.height };

      if (dragMode === 'move') {
        rect.left += dx;
        rect.top += dy;
      } else {
        if (dragMode.includes('e')) rect.width += dx;
        if (dragMode.includes('s')) rect.height += dy;
        if (dragMode.includes('w')) {
          rect.left += dx;
          rect.width -= dx;
        }
        if (dragMode.includes('n')) {
          rect.top += dy;
          rect.height -= dy;
        }
      }

      setVisionBoxRect(rect);
    }

    function onPointerUp() {
      dragMode = null;
      startRect = null;
    }

    box.addEventListener('pointerdown', (event) => onPointerDown('move', event));
    box.addEventListener('pointermove', onPointerMove);
    box.addEventListener('pointerup', onPointerUp);
    box.addEventListener('pointercancel', onPointerUp);

    box.querySelectorAll('span[data-dir]').forEach((handle) => {
      handle.addEventListener('pointerdown', (event) => onPointerDown(handle.dataset.dir, event));
      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
      handle.addEventListener('pointercancel', onPointerUp);
    });
  }

  function attachVisionDrawInteractions(overlay) {
    let drawStart = null;
    const MIN_DRAG = 8;

    function cancelDraw() {
      drawStart = null;
      if (!visionCapture) return;
      visionCapture.isDrawing = false;
      visionCapture.hasSelection = false;
      refreshVisionUi();
    }

    function onPointerDown(event) {
      if (event.button !== 0 || !visionCapture) return;
      if (event.target && typeof event.target.closest === 'function') {
        if (event.target.closest('#qt-vision-box') || event.target.closest('#qt-vision-toolbar')) return;
      }

      event.preventDefault();
      drawStart = { x: event.clientX, y: event.clientY };
      visionCapture.isDrawing = true;
      visionCapture.hasSelection = false;
      setVisionBoxRect({ left: drawStart.x, top: drawStart.y, width: 0, height: 0 });
      overlay.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event) {
      if (!drawStart || !visionCapture) return;
      setVisionBoxRect({
        left: Math.min(drawStart.x, event.clientX),
        top: Math.min(drawStart.y, event.clientY),
        width: Math.abs(event.clientX - drawStart.x),
        height: Math.abs(event.clientY - drawStart.y)
      });
    }

    function onPointerUp(event) {
      if (!drawStart || !visionCapture) return;
      const dragged = Math.abs(event.clientX - drawStart.x) > MIN_DRAG || Math.abs(event.clientY - drawStart.y) > MIN_DRAG;
      drawStart = null;
      visionCapture.isDrawing = false;

      if (!dragged) {
        // 点击未拖动，视为误触，不产生选区
        cancelDraw();
        return;
      }

      visionCapture.hasSelection = true;
      refreshVisionUi();
    }

    visionCapture.cancelDraw = cancelDraw;
    overlay.addEventListener('pointerdown', onPointerDown);
    overlay.addEventListener('pointermove', onPointerMove);
    overlay.addEventListener('pointerup', onPointerUp);
    overlay.addEventListener('pointercancel', cancelDraw);
  }

  function confirmVisionCapture() {
    if (!visionCapture || !visionCapture.hasSelection) return;

    const rect = visionCapture.box.getBoundingClientRect();
    // 记录选区锚点（文档坐标），供输出框吸附定位
    visionAnchorRect = {
      left: rect.left + (window.scrollX || 0),
      top: rect.top + (window.scrollY || 0),
      bottom: rect.bottom + (window.scrollY || 0)
    };
    const scaleX = visionCapture.image.naturalWidth / window.innerWidth;
    const scaleY = visionCapture.image.naturalHeight / window.innerHeight;

    const cropX = Math.max(0, Math.round(rect.left * scaleX));
    const cropY = Math.max(0, Math.round(rect.top * scaleY));
    const cropWidth = Math.min(visionCapture.image.naturalWidth - cropX, Math.round(rect.width * scaleX));
    const cropHeight = Math.min(visionCapture.image.naturalHeight - cropY, Math.round(rect.height * scaleY));
    if (cropWidth < 1 || cropHeight < 1) return;

    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const context = canvas.getContext('2d');
    context.drawImage(visionCapture.image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    // Downscale very large crops so the request body stays small.
    let imageDataUrl;
    if (Math.max(cropWidth, cropHeight) > VISION_MAX_SIDE) {
      const scale = VISION_MAX_SIDE / Math.max(cropWidth, cropHeight);
      const resized = document.createElement('canvas');
      resized.width = Math.max(1, Math.round(cropWidth * scale));
      resized.height = Math.max(1, Math.round(cropHeight * scale));
      resized.getContext('2d').drawImage(canvas, 0, 0, resized.width, resized.height);
      imageDataUrl = resized.toDataURL('image/jpeg', 0.9);
      resized.width = 0;
      resized.height = 0;
    } else {
      imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    }
    canvas.width = 0;
    canvas.height = 0;

    // Free the screenshot before sending so memory is released as early as possible.
    disposeVisionOverlay();
    sendVisionTranslate(imageDataUrl);
  }

  function disposeVisionOverlay() {
    if (!visionCapture) return;
    visionCapture.image.src = '';
    visionCapture.overlay.remove();
    visionCapture = null;
  }

  async function sendVisionTranslate(imageDataUrl) {
    showVisionLoading();

    const response = await sendRuntimeMessage({ action: 'translate_vision', imageDataUrl });
    visionOutputActive = false;

    if (!response || !response.success) {
      const errorMessage = response && response.error ? String(response.error) : 'unknown_error';
      showVisionError(errorMessage);
      return;
    }

    popupSystemState = null;
    setPopupContentText(String(response.translated || ''), 'normal');
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
      if (visionCapture) {
        if (visionCapture.isDrawing && visionCapture.cancelDraw) {
          // 绘制中：只取消本次框选，保持截图遮罩
          visionCapture.cancelDraw();
        } else {
          disposeVisionOverlay();
        }
        return;
      }
      removeFloatBtn();
      removePopup();
      return;
    }
    if (visionCapture && visionCapture.hasSelection && event.key === 'Enter' && (!event.target || event.target.tagName !== 'BUTTON')) {
      event.preventDefault();
      confirmVisionCapture();
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
    disposeVisionOverlay();
  });

  loadUiPreferences();
})();
