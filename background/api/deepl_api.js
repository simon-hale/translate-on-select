export async function translate({ text, target, apiKey, endpointKey = 'free-deepl', meta = {} }) {
  if (!text || typeof text !== 'string') {
    return { success: false, error: 'missing_text' };
  }
  if (!apiKey) return { success: false, error: 'missing_api_key' };

  // 处理版本对应api URL
  let base;
  if (endpointKey === 'pro-deepl') {
    base = 'https://api.deepl.com/v2/translate';
  } else {
    base = 'https://api-free.deepl.com/v2/translate';
  }

  // 构建请求体
  const params = new URLSearchParams();
  params.append('text', text);
  params.append('target_lang', (target && String(target).toUpperCase() || 'ZH-HANS'));

  // 发送异步请求
  try {
    const resp = await fetch(base, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    // 捕捉网络连接问题
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      return { success: false, error: `http_${resp.status}: ${txt}` };
    }

    // 捕捉服务器问题,若没问题则返回结果
    // 完整返回数据
    const data = await resp.json().catch(() => null);
    // 提炼翻译结果
    const translated = data && data.translations && data.translations[0] && data.translations[0].text;
    if (translated){
        // 翻译成功则返回翻译结果
        return { success: true, translated, raw: data, meta };
    }else{
        // 否则返回整个返回体
        return { success: false, error: ('From Web Server: ' + JSON.stringify(data))};
    }
  } catch (err) {
    // 捕捉其他所有问题
    console.error('deepl_api.translate error:', err);
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
}
