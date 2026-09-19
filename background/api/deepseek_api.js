// background/api/deepseek_api.js
// DeepSeek 直连适配器。
//
// 同一个 Flash 模型同时承担两种输入：
//   文本输入 -> 传入 text，提示词翻译对象为选中文字
//   图片输入 -> 传入 imageDataUrl，提示词翻译对象为图片中可见文字
// 两者共用同一套提示词模板、请求、错误处理与 SSE 流式解析逻辑，
// 仅 messages 的组织方式随输入类型不同（文本走 system，图片走 content 块数组）。
import { createSseTextIterable } from './sse_reader.js';

const CHAT_COMPLETIONS_URL = 'https://api.deepseek.com/chat/completions';
// 模型名（DeepSeek 官方当前命名）；旧模型名 deepseek-v4-flash /
// deepseek-v4-flash-vision-exp 仍可调用，但均由同一 Flash 模型提供服务。
export const FLASH_MODEL = 'deepseek-flash';
// Pro 分支使用的模型：只做纯文本划词翻译，不支持截图。
export const PRO_MODEL = 'deepseek-v4-pro';

// Flash 分支的共用提示词：划词与截图共用同一模板，
// 仅“翻译对象”随输入类型切换（text 为选中文字，image 为图片中可见文字）。
function buildFlashPrompt(target, source) {
  const subject = source === 'image' ? 'all the text visible in the image' : 'the text';
  return (
    'You are a professional translator proficient in any field. Translate ' +
    subject +
    ' into ' +
    target +
    ', and only give me the translation.'
  );
}

// 文本请求：整段待翻译文字内联进 system 提示词。
function buildTextMessages(text, target) {
  return [
    { role: 'system', content: buildFlashPrompt(target, 'text') },
    { role: 'user', content: text }
  ];
}

// 图片请求：base64 data URL 以 OpenAI 兼容的 content 块数组内联传入。
function buildImageMessages(imageDataUrl, target) {
  return [
    {
      role: 'user',
      content: [
        { type: 'text', text: buildFlashPrompt(target, 'image') },
        { type: 'image_url', image_url: { url: imageDataUrl } }
      ]
    }
  ];
}

export async function translate({ text, imageDataUrl, target, apiKey, model = FLASH_MODEL, stream = false }) {
  const hasText = typeof text === 'string' && text.length > 0;
  const hasImage = typeof imageDataUrl === 'string' && imageDataUrl.length > 0;

  if (!hasText && !hasImage) return { success: false, error: 'missing_input' };
  if (hasText && hasImage) return { success: false, error: 'ambiguous_input' };
  if (!apiKey) return { success: false, error: 'missing_api_key' };

  const params = {
    model,
    messages: hasImage ? buildImageMessages(imageDataUrl, target) : buildTextMessages(text, target),
    stream,
    thinking: { type: 'disabled' }
  };

  try {
    const resp = await fetch(CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    });

    // 网络/HTTP 错误
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      return { success: false, error: `http_${resp.status}: ${txt}` };
    }

    const contentType = (resp.headers.get('content-type') || '').toLowerCase();

    // 如果是 SSE 流（text/event-stream），返回 async iterable（yield 每个 chunk）
    if (contentType.includes('text/event-stream')) {
      return createSseTextIterable(resp);
    }

    // 如果不是 event-stream（普通 JSON 响应），保持原有行为
    const data = await resp.json().catch(async (err) => {
      // 如果解析 JSON 失败（极少数情况），尝试把 body 当文本读出以便调试
      const txt = await resp.text().catch(() => '');
      throw new Error('invalid_json_response: ' + String(txt || (err && err.message)));
    });

    if (!data || !data.choices || data.choices.length === 0) {
      return { success: false, error: data };
    }

    const aiMsg = data.choices[0].message && data.choices[0].message.content
      ? String(data.choices[0].message.content).trim()
      : null;

    if (!aiMsg) {
      return { success: false, error: data };
    }

    return { success: true, translated: aiMsg };
  } catch (err) {
    console.error('deepseek_api.translate error:', err);
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
}
