<div align="center">

<img src="./icons/icon_128.png" alt="Translate-on-Select" width="96" height="96" />

# Translate-on-Select

一個輕量的 Chrome 劃詞翻譯擴充功能。選取文字後點擊按鈕，即可在目前頁面內查看翻譯結果。

</div>

---

<p align="center">
  <a href="https://developer.chrome.com/docs/extensions/">
    <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Extension" />
  </a>
  <img src="https://img.shields.io/badge/Manifest-V3-34A853?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
  <a href="./README.md">
    <img src="https://img.shields.io/badge/Docs-English-111111?style=flat-square" alt="English README" />
  </a>
  <a href="./README.zh-CN.md">
    <img src="https://img.shields.io/badge/Docs-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-111111?style=flat-square" alt="簡體中文 README" />
  </a>
</p>

這是一個基於 Manifest V3 的原生 JavaScript Chrome 擴充功能，支援兩種翻譯工作流程：

- 直連 API 模式：瀏覽器直接使用你的 API Key 呼叫 DeepL 或 DeepSeek
- 後端中轉模式：擴充功能把請求送到你自己的後端，再由後端與翻譯服務互動

## 快速導覽

- [功能特色](#功能特色)
- [支援的目標語言](#支援的目標語言-)
- [介面與在地化](#介面與在地化-)
- [運作原理](#運作原理-)
- [翻譯模式](#翻譯模式-)
- [安裝](#安裝-)
- [設定](#設定-)
- [使用說明](#使用說明-)
- [專案結構](#專案結構-)
- [架構說明](#架構說明-)
- [本機儲存](#本機儲存-)
- [隱私政策](#隱私政策-)
- [安全說明](#安全說明-)
- [目前限制](#目前限制-)
- [開發](#開發-)
- [路線圖](#路線圖-)

## 功能特色

- 🌐 在一般網頁中翻譯選取的文字
- 🖱️ 選取文字後會出現浮動 `翻譯` 按鈕
- 💬 頁面內結果彈層支援 `複製` 和 `關閉`
- ⚡ 提供快速設定 popup 供常用切換
- ⚙️ 提供完整 options 頁面用於 API Key 與後端設定
- 🌗 popup 內建淺色 / 深色切換，並在 popup、options 頁面與頁內翻譯彈層之間共享主題
- 🌍 支援三語言介面切換：English、簡體中文、繁體中文
- 🔤 支援 DeepL 直連 API
- 🤖 支援 DeepSeek 直連 API
- 📡 DeepSeek 直連模式支援可選串流輸出
- 🖥️ 支援自建後端中轉翻譯請求

## 支援的目標語言 🌍

- 簡體中文 `ZH-HANS`
- 繁體中文 `ZH-HANT`
- 英語（英式）`EN-GB`
- 英語（美式）`EN-US`
- 日語 `JA`
- 德語 `DE`
- 法語 `FR`
- 俄語 `RU`

## 介面與在地化 🎨

- 介面語言可在 `English`、`簡體中文` 與 `繁體中文` 之間切換。
- 語言設定會同時套用到 popup、options 頁面與網頁內的翻譯浮層。
- popup 提供主題切換按鈕，可在淺色模式與深色模式之間切換。
- 儲存後的主題模式會同步到 popup、options 頁面與 content script 建立的頁內結果彈層。

## 運作原理 ⚙️

### 使用者流程 🚀

1. 打開任意支援的網頁。
2. 選取一段文字。
3. 點擊浮動 `翻譯` 按鈕。
4. 擴充功能將文字送到背景 service worker。
5. 背景程式會根據目前儲存的設定決定使用哪條翻譯路徑。
6. 翻譯結果會顯示在目前頁面的結果彈層中。

### 設定流程 🧩

- `menu/` 是快速設定 popup：
  - 選擇目標語言
  - 選擇介面語言
  - 切換 `server` 與 `api` 模式
  - 快速切換目前翻譯來源
  - 切換淺色 / 深色主題
- `options/` 是完整設定頁：
  - 儲存介面語言
  - 儲存後端 URL 與後端端點類型
  - 儲存 DeepL API Key 與 endpoint 類型
  - 儲存 DeepSeek API Key

## 翻譯模式 🔀

### 1. 直連 API 模式 🔌

在這個模式下，瀏覽器會直接請求翻譯服務提供者。

目前支援的 provider：

- DeepL
- DeepSeek

目前狀態：

- DeepL：已實作
- DeepSeek：已實作
- Google Translate：介面入口已預留，但目前尚未實作

### 2. 後端中轉模式 🖥️

在這個模式下，擴充功能不會直接請求翻譯服務提供者，而是把請求送到你自己的伺服器。

目前 UI 支援的後端端點類型：

- `deepseek/`
- `deepl/`

根據目前程式碼實作，後端需要：

- 接收包含 `text` 與 `target` 的 JSON 請求
- 回傳如下結構的 JSON：

```json
{
  "success": true,
  "result": "translated text"
}
```

專案目前 README 中提到的配套後端倉庫：

- [translate-on-select-backend](https://github.com/simon-hale/translate-on-select-backend)

## 安裝 📦

目前專案沒有建置步驟，可以直接作為 unpacked extension 載入。

1. Clone 或下載本倉庫。
2. 開啟 Chrome，進入 `chrome://extensions/`。
3. 開啟 `Developer mode`。
4. 點擊 `Load unpacked`。
5. 選擇目前專案目錄。

## 設定 🛠️

### 在 popup 中快速設定 ⚡

你可以在 popup 中完成以下高頻操作：

- 選擇目標語言
- 選擇介面語言
- 選擇 `自訂伺服器` 或 `自訂 API`
- 快速切換目前 provider
- 切換淺色 / 深色主題

Popup 介面概覽：

<img src="./assets/Popup%20interface%20overview.png" alt="Popup 介面概覽" style="zoom: 67%;" />

### 在 options 頁面中完整設定 🧰

打開設定頁後，你可以設定以下幾種方式：

Options 介面概覽：

<img src="./assets/Options%20interface%20overview.png" alt="Options 介面概覽" style="zoom: 50%;" />

#### A. 直連 DeepL

必填：

- DeepL API Key
- DeepL endpoint 類型：
  - `DeepL Free`
  - `DeepL Pro`

#### B. 直連 DeepSeek

必填：

- DeepSeek API Key

可選：

- 在 popup 中開啟或關閉串流輸出

#### C. 後端中轉

必填：

- server URL
- 端點類型：
  - `Deepseek V3 Chat`
  - `DeepL`

可選：

- UI 中提供 HTTP Method 選擇器
- 也可以在 options 頁面調整介面語言

## 使用說明 📝

- 擴充功能會把 content script 注入到 `<all_urls>`。
- 只有在選取文字後，才會出現浮動翻譯按鈕。
- 目前實作中，選取文字長度超過 `2400` 字元會被拒絕。
- 結果彈層支援手動複製。
- 目前實作中，結果彈層不會自動定時關閉。
- 介面支援 English、簡體中文 與 繁體中文 三種語言。
- 儲存後的主題模式會重用到 popup、options 頁面與頁內翻譯浮層。

## 專案結構 📁

```text
.
├─ background/
│  ├─ background.js              # 背景分發器與 provider 路由
│  └─ api/
│     ├─ deepl_api.js            # DeepL 直連適配器
│     ├─ deepseek_api.js         # DeepSeek 直連適配器
│     └─ server_api.js           # 後端中轉適配器
├─ front/
│  └─ contentScript.js           # 劃詞偵測與頁面內翻譯彈層
├─ menu/
│  ├─ menu.html                  # popup 介面
│  └─ menu.js                    # popup 互動邏輯
├─ options/
│  ├─ options.html               # 完整設定頁
│  └─ options.js                 # 設定儲存與介面切換邏輯
├─ shared/
│  ├─ i18n.js                    # 多語言資源與在地化輔助
│  └─ theme.js                   # 淺色 / 深色主題輔助
├─ icons/
├─ PrivacyPolicyAndSecure.md     # 隱私政策（英文）
├─ PrivacyPolicyAndSecure.zh-CN.md
├─ PrivacyPolicyAndSecure.zh-TW.md
└─ manifest.json
```

## 架構說明 🧠

### `front/contentScript.js`

- 監聽文字選取行為
- 建立浮動翻譯按鈕
- 顯示 loading 與結果彈層
- 接收背景轉發過來的串流內容

### `background/background.js`

- 從 `chrome.storage.local` 讀取設定
- 根據目前模式選擇翻譯路徑
- 為不同 provider 正規化目標語言格式
- 在 DeepSeek 串流情境下把 chunk 轉發給頁面

### `background/api/*.js`

- `deepl_api.js`：請求 DeepL REST API
- `deepseek_api.js`：請求 DeepSeek Chat Completions API
- `server_api.js`：請求你自己的後端服務

### `shared/*.js`

- `i18n.js`：提供 English、簡體中文、繁體中文 三套介面文案
- `theme.js`：提供共享的淺色 / 深色主題狀態與配色輔助

## 本機儲存 💾

擴充功能會把設定保存在 `chrome.storage.local` 中，包括：

- backend mode
- provider 選擇
- target language
- server URL
- API keys
- DeepL endpoint 選擇
- DeepSeek 串流開關
- 介面語言
- 主題模式

## 隱私政策 🔒

倉庫中提供了三種語言版本的隱私政策文本：

- [English](./PrivacyPolicyAndSecure.md)
- [簡體中文](./PrivacyPolicyAndSecure.zh-CN.md)
- [繁體中文](./PrivacyPolicyAndSecure.zh-TW.md)

## 安全說明 🔐

這個專案目前更偏向「方便可用」，而不是「已完成安全加固」。

- 在直連 API 模式下，API Key 會保存在 `chrome.storage.local` 中。
- 在後端中轉模式下，安全性取決於你的伺服器端如何保存與保護 provider 憑證。
- 如果你使用中轉後端，更建議把金鑰放在環境變數或專門的 secret 管理解決方案中，而不是直接放在檔案裡。

## 目前限制 ⚠️

- Google Translate 尚未實作
- 目前截圖主要展示簡體中文介面
- 目前沒有自動化測試
- 目前沒有打包或發布流程
- 後端中轉模式依賴你自行實作並維護後端契約

## 開發 👨‍💻

這個倉庫目前足夠簡單，適合直接修改原始碼後在 Chrome 中 reload 進行調試。

推薦本機開發流程：

1. 修改倉庫中的檔案。
2. 打開 `chrome://extensions/`。
3. 重新載入這個 unpacked extension。
4. 重新驗證 popup、options 頁面與網頁中的劃詞翻譯流程。

## 路線圖 💡

- 支援 Google Translate
- 改進金鑰與敏感資訊管理方式
- 補充截圖與展示 GIF
- 提升多語言支援
- 為 provider 適配器與設定邏輯補上測試
