(function () {
  const MAX_CHARS = 2400;
  let floatBtn = null;
  let popup = null;
  let popupTimeout = null; // 保留变量但不用于自动关闭
  let lastSelectionText = '';
  let lastRangeRect = null;
  let floatBtnTimeout = null; // 保留变量但不用于自动 hide

  // 流式相关状态
  let streamingActive = false;
  let streamingBuffer = '';

  /* ------------------ UI helpers ------------------ */

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
    floatBtn.textContent = '翻译';
    // style
    Object.assign(floatBtn.style, {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      zIndex: 2147483647,
      padding: '6px 10px',
      fontSize: '13px',
      borderRadius: '18px',
      background: '#0a66ff',
      color: '#fff',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      userSelect: 'none'
    });

    // 点击按钮 -> 显示 popup 并开始翻译
    floatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 打开翻译窗口并开始翻译
      try {
        showLoadingAtRect(lastRangeRect || { left: x, bottom: y + 24 });
        // 触发翻译
        triggerTranslate(lastSelectionText);
      } finally {
        // 按钮在用户点击后继续保留（若你想移除按钮，取消下面一行）
        // removeFloatBtn();
      }
    });

    document.body.appendChild(floatBtn);

    // 点击浮窗外不再自动移除按钮（但保留外部点击处理，以便手动关闭）
    setTimeout(() => {
      window.addEventListener('mousedown', outsideClickHandlerForBtn);
    }, 0);

    // 取消自动隐藏：此前为 floatBtnTimeout = setTimeout(removeFloatBtn, 8000);
    // 我们不再设置自动隐藏定时器
  }

  function outsideClickHandlerForBtn(e) {
    if (!floatBtn) return;
    if (!floatBtn.contains(e.target)) {
      // 如果你不想让外部点击关闭按钮，注释下一行
      // removeFloatBtn();
      // 我们保留外部点击关闭行为默认开启；若希望禁用，请注释上面一行
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
    // 清理流状态
    streamingActive = false;
    streamingBuffer = '';
  }

  function createPopup(x, y, initialHtml = '') {
    removePopup();

    popup = document.createElement('div');
    popup.id = 'qt-popup';
    popup.style.position = 'absolute';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.zIndex = 2147483647;
    popup.style.minWidth = '220px';
    popup.style.maxWidth = '520px';
    popup.style.background = '#fff';
    popup.style.color = '#111';
    popup.style.border = '1px solid rgba(0,0,0,0.12)';
    popup.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
    popup.style.borderRadius = '8px';
    popup.style.padding = '8px';
    popup.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    popup.style.fontSize = '14px';
    popup.style.lineHeight = '1.4';
    popup.style.backdropFilter = 'blur(2px)';
    popup.style.wordBreak = 'break-word';
    popup.innerHTML = `
      <div id="qt-content" style="min-height:20px">${initialHtml}</div>
      <div style="display:flex;gap:8px;margin-top:8px;justify-content:flex-end">
        <button id="qt-copy" style="padding:4px 8px;border-radius:6px;border:1px solid rgba(0,0,0,0.08);background:#f5f5f5;cursor:pointer">复制</button>
        <button id="qt-close" style="padding:4px 8px;border-radius:6px;border:1px solid rgba(0,0,0,0.08);background:#f5f5f5;cursor:pointer">关闭</button>
      </div>
    `;
    document.body.appendChild(popup);

    document.getElementById('qt-close').addEventListener('click', removePopup);
    document.getElementById('qt-copy').addEventListener('click', async () => {
      const text = document.getElementById('qt-content').innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    });

    setTimeout(() => {
      window.addEventListener('mousedown', outsideClickHandlerForPopup);
    }, 0);

    // 取消自动 60s 关闭：此前 popupTimeout = setTimeout(removePopup, 60_000);
    // 我们不再设置自动关闭定时器
  }

  function outsideClickHandlerForPopup(e) {
    if (!popup) return;
    if (!popup.contains(e.target)) {
      // 如果你不想让外部点击关闭弹窗，注释下一行
      removePopup();
    }
  }

  function showLoadingAtRect(rect) {
    const pos = computePopupPosition(rect);
    // 在开始流式前，显示一个 loading 提示（流式会继续更新内容）
    createPopup(pos.x, pos.y, '<div style="opacity:0.7">翻译中…</div>');
  }

  function showResultAtRect(rect, html) {
    const pos = computePopupPosition(rect);
    createPopup(pos.x, pos.y, html);
  }

  function computePopupPosition(rect) {
    // 计算弹窗位置：尽量放在选区下方并避免超出可视区域
    const padding = 8;
    const popupWidth = Math.min(520, Math.max(220, (rect && rect.width) || 300));
    let x = Math.max(padding, (rect ? rect.left : window.innerWidth / 2) + window.scrollX);
    let y = Math.max(padding, (rect ? rect.bottom : 120) + window.scrollY + 6);

    // 如果溢出右侧，往左移动
    if (x + popupWidth + padding > window.scrollX + window.innerWidth) {
      x = window.scrollX + window.innerWidth - popupWidth - padding;
      if (x < padding) x = padding;
    }
    return { x, y };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------ streaming message handler ------------------ */

  // 处理来自 background 的流式消息（chrome.tabs.sendMessage）
  chrome.runtime.onMessage.addListener((msg, sender) => {
    try {
      if (!msg || msg.action !== 'translate_stream') return;
      // 如果没有 popup，则创建一个基于 lastRangeRect 的 popup
      if (!popup) {
        showLoadingAtRect(lastRangeRect || { left: window.innerWidth / 2, bottom: 120 });
      }

      const contentEl = document.getElementById('qt-content');
      if (!contentEl) return;

      // 处理错误/完成/分片
      if (msg.error) {
        // 出错，显示错误并结束流
        contentEl.innerText = `翻译失败：${msg.error}`;
        streamingActive = false;
        streamingBuffer = '';
        return;
      }

      if (msg.done) {
        // 流结束（可能带 final 翻译）
        streamingActive = false;
        if (msg.success && typeof msg.translated !== 'undefined') {
          contentEl.innerText = msg.translated;
        } else if (msg.message) {
          contentEl.innerText = msg.message;
        }
        streamingBuffer = '';
        return;
      }

      // 常规 chunk（可能是字符串）
      if (typeof msg.chunk !== 'undefined') {
        const chunkText = String(msg.chunk);
        streamingBuffer += chunkText;
        // 实时更新 popup（escapeHtml 以避免注入）
        contentEl.innerText = streamingBuffer;
        streamingActive = true;
      }
    } catch (e) {
      console.error('stream handler error:', e);
    }
  });

  /* ------------------ messaging ------------------ */

  function sendTranslateMessage(text) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(
          { action: 'translate', text },
          (resp) => {
            if (chrome.runtime.lastError) {
              resolve({ success: false, error: chrome.runtime.lastError.message });
              return;
            }
            if (!resp) {
              resolve({ success: false, error: 'no_response_from_background' });
              return;
            }
            resolve(resp);
          }
        );
      } catch (err) {
        resolve({ success: false, error: err && err.message ? err.message : String(err) });
      }
    });
  }

  async function triggerTranslate(text) {
    if (!text) {
      showResultAtRect(lastRangeRect || { left: window.innerWidth / 2, bottom: 120 }, `<div>没有选中文本。</div>`);
      return;
    }

    // 初始化流状态
    streamingActive = false;
    streamingBuffer = '';

    // 显示 loading（已在 click 时创建） - ensure popup exists
    showLoadingAtRect(lastRangeRect || { left: window.innerWidth / 2, bottom: 120 });

    // 发送翻译请求（后端可能以流式同时用 chrome.tabs.sendMessage 返回 chunk）
    const resp = await sendTranslateMessage(text);
    if (!resp || !resp.success) {
      const errMsg = resp && resp.error ? escapeHtml(resp.error) : '未知错误';
      showResultAtRect(lastRangeRect || { left: window.innerWidth / 2, bottom: 120 }, `<div style="color:#b00">翻译失败：${errMsg}</div>`);
      return;
    }

    // 若后端不是流式或作为最终结果返回，显示最终翻译（兼容性）
    const safeHtml = escapeHtml(resp.translated);
    showResultAtRect(lastRangeRect || { left: window.innerWidth / 2, bottom: 120 }, `<div>${safeHtml}</div>`);
  }

  /* ------------------ selection handling ------------------ */

  function handleSelectionShowButton() {
    // 处理选区并显示浮动按钮（不立即翻译）
    const selection = window.getSelection();
    if (!selection) {
      lastSelectionText = '';
      lastRangeRect = null;
      // 不自动移除按钮，这里仍然保留移除逻辑以避免悬浮遗留在无选区时
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
      // 文本过长：提示并不显示按钮
      lastSelectionText = '';
      lastRangeRect = null;
      removeFloatBtn();
      // 轻量提示：直接在页面显示临时 popup（不自动翻译）
      try {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        showResultAtRect(rect, `<div>文本过长（> ${MAX_CHARS} 字符），请缩短选区。</div>`);
        // 不再自动移除提示，用户需手动关闭弹窗
      } catch (e) {}
      return;
    }

    // 获取选区位置（用于放置按钮）
    let rect;
    try {
      rect = selection.getRangeAt(0).getBoundingClientRect();
    } catch (e) {
      rect = { left: window.innerWidth / 2, bottom: 120, width: 200 };
    }

    lastSelectionText = text;
    lastRangeRect = rect;

    // 按钮位置：放在选区右上方或右下方（如果右侧空间不足则放左侧）
    const padding = 6;
    const btnWidth = 64;
    const btnHeight = 32;
    const scrollX = window.scrollX || 0;
    const scrollY = window.scrollY || 0;

    let btnX = rect.right + scrollX - btnWidth; // 默认靠右
    let btnY = rect.top + scrollY - btnHeight - 6; // 默认放在上方

    // 若上方放不下，则放到下方
    if (btnY < scrollY + padding) {
      btnY = rect.bottom + scrollY + 6;
    }

    // 确保不超出右侧
    if (btnX + btnWidth + padding > scrollX + window.innerWidth) {
      btnX = scrollX + window.innerWidth - btnWidth - padding;
    }
    if (btnX < scrollX + padding) btnX = scrollX + padding;

    createFloatBtn(btnX, btnY);
  }

  /* ------------------ event listeners ------------------ */

  // mouseup / touchend 触发划词检测（延迟一点以稳定 selection）
  document.addEventListener('mouseup', () => {
    setTimeout(handleSelectionShowButton, 10);
  });

  document.addEventListener('touchend', () => {
    setTimeout(handleSelectionShowButton, 10);
  });

  // Esc 关闭所有浮层
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      removeFloatBtn();
      removePopup();
    }
  });

  // 保证卸载时清理
  window.addEventListener('unload', () => {
    removeFloatBtn();
    removePopup();
  });

})();
