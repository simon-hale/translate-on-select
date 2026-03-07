// background/api/deepseek_api.js
export async function translate({ text, target, apiKey, streamDeepseek, meta = {} }) {
  if (!text || typeof text !== 'string') {
    return { success: false, error: 'missing_text' };
  }
  if (!apiKey) return { success: false, error: 'missing_api_key' };

  // 构建请求体，建议请求流式（若服务支持）
  const messages = [
    { "role": "system", "content": "You are a professional translator proficient in any field. Please translate the text to " + target + ", and only give me the translation. The text is \"" + text + "\"" },
  ];
  const params = {
    model: "deepseek-chat",
    messages: messages,
    stream: streamDeepseek
  };

  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
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
      // 返回一个 async iterable（background 的 streamToTab 会识别并逐块处理）
      return (async function* () {
        const reader = resp.body.getReader();
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
            sseBuffer = parts.pop(); // 不完整的残留回到 buffer

            for (const part of parts) {
              if (!part.trim()) continue;
              // part 可能包含多行（event:, data:, id: ...）
              const lines = part.split(/\r?\n/);
              for (const line of lines) {
                if (!line) continue;
                if (line.startsWith('data:')) {
                  const payload = line.slice(5).trim();
                  if (payload === '[DONE]' || payload === '[done]') {
                    done = true;
                    // 通常 [DONE] 不包含可展示文本
                    continue;
                  }
                  // 尝试 JSON 解析，否则把 payload 当作明文
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
                      // 其他 JSON 结构： stringify 追加以避免丢数据
                      textChunk = JSON.stringify(obj);
                    }
                  } catch (e) {
                    // 不是 JSON，直接追加原始 payload
                    textChunk = payload;
                  }

                  if (textChunk) {
                    // yield 一个 chunk（background 会把它发到 contentScript）
                    yield textChunk;
                  }
                } // 非 data: 行一般忽略
              }
            }
          }

          // 处理最后残留（若有）
          if (sseBuffer && sseBuffer.trim()) {
            const remLines = sseBuffer.split(/\r?\n/);
            for (const line of remLines) {
              if (!line) continue;
              if (line.startsWith('data:')) {
                const payload = line.slice(5).trim();
                if (payload !== '[DONE]') {
                  let textChunk = '';
                  try {
                    const obj = JSON.parse(payload);
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
                      textChunk = JSON.stringify(obj);
                    }
                  } catch (e) {
                    textChunk = payload;
                  }
                  if (textChunk) yield textChunk;
                }
              }
            }
          }
        } finally {
          try { reader.cancel(); } catch (e) {}
        }

        // async generator 完成（for-await-of 结束）
        return;
      })();
    }

    // 如果不是 event-stream（普通 JSON 响应），保持原有行为
    const data = await resp.json().catch(async (err) => {
      // 如果解析 JSON 失败（极少数情况），尝试把 body 当文本读出以便调试
      const txt = await resp.text().catch(() => '');
      throw new Error('invalid_json_response: ' + String(txt || err && err.message));
    });

    console.log('deepseek_api response json:', data);

    if (!data || !data.choices || data.choices.length === 0) {
      return { success: false, error: data };
    }

    const aiMsg = data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content.trim()
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
