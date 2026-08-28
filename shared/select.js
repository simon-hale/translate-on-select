// shared/select.js
// 自绘下拉组件：原生 <select> 仅作为值载体（隐藏），
// 视觉由自定义触发器 + 圆角面板呈现，样式完全可控并跟随主题。
// 点击选项时写入 select.value 并触发原生 change 事件，
// 因此引用方读取 value / 监听 change 的逻辑保持不变。
(function (global) {
  // 所有已增强实例，由共享的全局监听统一管理关闭
  const wraps = [];

  function selectedText(selectEl) {
    const opt = selectEl.options && selectEl.options[selectEl.selectedIndex];
    return opt ? opt.textContent : '';
  }

  function refresh(selectEl) {
    const trigger = selectEl.__ddTrigger;
    if (trigger) trigger.textContent = selectedText(selectEl);
  }

  function enhance(selectEl) {
    if (!selectEl || !selectEl.options) return;
    // 已增强：仅同步显示文本（填充选项后由 enhanceAll 调用）
    if (selectEl.__ddTrigger) {
      refresh(selectEl);
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'custom-select';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.setAttribute('role', 'listbox');

    function renderMenu() {
      menu.textContent = '';
      for (const opt of selectEl.options) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'custom-select-option';
        item.setAttribute('role', 'option');
        item.textContent = opt.textContent;
        if (String(opt.value) === String(selectEl.value)) {
          item.classList.add('is-selected');
        }
        item.addEventListener('click', () => {
          selectEl.value = opt.value;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          refresh(selectEl);
          wrap.classList.remove('is-open');
        });
        menu.appendChild(item);
      }
    }

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (wrap.classList.contains('is-open')) wrap.classList.remove('is-open');
      else {
        renderMenu();
        wrap.classList.add('is-open');
      }
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    selectEl.__ddTrigger = trigger;
    selectEl.insertAdjacentElement('afterend', wrap);
    selectEl.style.display = 'none';
    wraps.push(wrap);
    refresh(selectEl);
  }

  function enhanceAll(root) {
    const selects = (root || document).querySelectorAll('select');
    for (const selectEl of selects) enhance(selectEl);
  }

  // 共享全局监听：点击外部 / Escape 关闭所有打开的下拉
  document.addEventListener('click', (event) => {
    for (const wrap of wraps) {
      if (wrap.classList.contains('is-open') && !wrap.contains(event.target)) {
        wrap.classList.remove('is-open');
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      for (const wrap of wraps) {
        wrap.classList.remove('is-open');
      }
    }
  });

  global.TranslateOnSelectSelect = { enhance, enhanceAll };
})(globalThis);
