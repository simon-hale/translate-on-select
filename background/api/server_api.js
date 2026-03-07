export async function translate({ text, target, serverUrl, httpMethod = 'POST', brand, meta = {} }) {
  if (!serverUrl) return { success: false, error: 'missing_server_url' };
  if (!text) return { success: false, error: 'missing_text' };

  // 发送异步请求
  try {
    const resp = await fetch((serverUrl + brand), {
      method: (httpMethod || 'POST').toUpperCase(),
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        target: target,
      })
    });

    // 捕捉网络连接问题
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      return { success: false, error: `http_${resp.status}: ${txt}` };
    }

    const data = await resp.json();

    console.log(data);

    if (!data || !data.result || !data.success) {
      return {
        success: false,
        error: data
      };
    }

    const aiMsg = data.result ? data.result.trim() : null;

    if (!aiMsg) {
      return {
        success: false,
        error: data
      };
    }

    return {
      success: true,
      translated: aiMsg
    };
    
  } catch (err) {
    // 捕捉其他所有问题
    console.error('deepl_api.translate error:', err);
    return { success: false, error: err && err.message ? err.message : String(err) };
  }

}
