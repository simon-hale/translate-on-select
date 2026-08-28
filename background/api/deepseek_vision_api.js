// background/api/deepseek_vision_api.js
// Independent vision interface for the Deepseek V4 flash vision model.
// Contract reference: DeepseekV4-flash-vision.md in the workspace root.
import { createSseTextIterable } from './sse_reader.js';

const VISION_MODEL = 'deepseek-v4-flash-vision-exp';
const VISION_ENDPOINT = 'https://api.deepseek.com/chat/completions';

// 独立的视觉提示词分支（短，风格与纯文字版提示词保持一致）。
function buildVisionPrompt(target) {
  return (
    'You are a professional translator. Translate all the text visible in the image into ' +
    target +
    ', and only give me the translation.'
  );
}

export async function translateVision({ imageDataUrl, target, apiKey, streamDeepseek = false }) {
  if (!imageDataUrl || typeof imageDataUrl !== 'string') {
    return { success: false, error: 'missing_image' };
  }
  if (!apiKey) return { success: false, error: 'missing_api_key' };

  // 图片以 base64 data URL 内联传入（OpenAI 兼容的 content 块数组）
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: buildVisionPrompt(target) },
        { type: 'image_url', image_url: { url: imageDataUrl } }
      ]
    }
  ];
  const params = {
    model: VISION_MODEL,
    messages,
    stream: streamDeepseek,
    thinking: { type: 'disabled' },
  };

  try {
    const resp = await fetch(VISION_ENDPOINT, {
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
    console.error('deepseek_vision_api.translateVision error:', err);
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
}
