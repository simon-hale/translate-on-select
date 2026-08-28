// background/api/sse_reader.js
// Shared SSE reader for OpenAI-compatible streaming responses.
// Used by the Deepseek vision interface; the text interface keeps its own
// inline reader so its existing logic is left untouched.

function extractPayloadText(payload) {
  let textChunk = '';
  try {
    const obj = JSON.parse(payload);
    // 兼容多种返回结构：choices[].delta.content / choices[].message.content / text / message.content
    if (obj && obj.choices && Array.isArray(obj.choices)) {
      for (const ch of obj.choices) {
        const ctext =
          (ch.delta && (ch.delta.content || ch.delta.text)) ||
          (ch.message && ch.message.content) ||
          (ch.text) ||
          '';
        if (ctext) textChunk += String(ctext);
      }
    } else if (obj && typeof obj.text === 'string') {
      textChunk = obj.text;
    } else if (obj && obj.message && typeof obj.message.content === 'string') {
      textChunk = obj.message.content;
    } else {
      // 其他 JSON 结构：stringify 追加以避免丢数据
      textChunk = JSON.stringify(obj);
    }
  } catch (e) {
    // 不是 JSON，直接追加原始 payload
    textChunk = payload;
  }
  return textChunk;
}

export async function* createSseTextIterable(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = '';
  let done = false;

  try {
    while (!done) {
      const { value, done: readDone } = await reader.read();
      if (readDone) break;
      sseBuffer += decoder.decode(value, { stream: true });

      // 将完整的 events（以空行分隔）拆出，最后一段可能不完整，保留到下一轮
      const parts = sseBuffer.split(/\r?\n\r?\n/);
      sseBuffer = parts.pop() || '';

      for (const part of parts) {
        for (const line of part.split(/\r?\n/)) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]' || payload === '[done]') {
            done = true;
            continue;
          }
          const chunk = extractPayloadText(payload);
          if (chunk) yield chunk;
        }
      }
    }

    // 处理最后残留（若有）
    if (sseBuffer && sseBuffer.trim()) {
      for (const line of sseBuffer.split(/\r?\n/)) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]' || payload === '[done]') continue;
        const chunk = extractPayloadText(payload);
        if (chunk) yield chunk;
      }
    }
  } finally {
    try { reader.cancel(); } catch (e) {}
  }
}
