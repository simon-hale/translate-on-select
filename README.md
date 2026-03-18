<div align="center">

<img src="./icons/icon_128.png" alt="Translate-on-Select" width="96" height="96" />

# Translate-on-Select

A lightweight Chrome extension that translates text directly from any webpage after you select it.

</div>

---

<p align="center">
  <a href="https://developer.chrome.com/docs/extensions/">
    <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Extension" />
  </a>
  <img src="https://img.shields.io/badge/Manifest-V3-34A853?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
  <a href="./README.zh-CN.md">
    <img src="https://img.shields.io/badge/Docs-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-111111?style=flat-square" alt="简体中文文档" />
  </a>
  <a href="./README.zh-TW.md">
    <img src="https://img.shields.io/badge/Docs-%E7%B9%81%E9%AB%94%E4%B8%AD%E6%96%87-111111?style=flat-square" alt="繁體中文文件" />
  </a>
</p>

This project is a plain JavaScript Chrome Extension built on Manifest V3. It supports two translation workflows:

- Direct API mode: call DeepL or DeepSeek from the browser with your own API key
- Server relay mode: send translation requests to your own backend and let the backend talk to the provider

## Quick Navigation

- [Features](#features)
- [Supported Target Languages](#supported-target-languages-)
- [Interface & Localization](#interface--localization-)
- [How It Works](#how-it-works-)
- [Translation Modes](#translation-modes-)
- [Installation](#installation-)
- [Setup](#setup-)
- [Usage Notes](#usage-notes-)
- [Project Structure](#project-structure-)
- [Architecture Overview](#architecture-overview-)
- [Storage](#storage-)
- [Privacy Policy](#privacy-policy-)
- [Security Notes](#security-notes-)
- [Limitations](#limitations-)
- [Development](#development-)
- [Roadmap Ideas](#roadmap-ideas-)

## Features

- 🌐 Translate selected text from normal webpages
- 🖱️ Floating `翻译` button appears after text selection
- 💬 In-page result popup with `复制` and `关闭`
- ⚡ Quick settings popup for common switches
- ⚙️ Full options page for API keys and backend configuration
- 🌗 Popup theme toggle with shared light/dark styling across the popup, options page, and in-page overlay
- 🌍 Three-language interface switch: English, Simplified Chinese, and Traditional Chinese
- 🔤 DeepL direct API support
- 🤖 DeepSeek direct API support
- 📡 Optional streaming output for direct DeepSeek API mode
- 🖥️ Server relay mode for self-hosted translation routing

## Supported Target Languages 🌍

- Chinese (Simplified) `ZH-HANS`
- Chinese (Traditional) `ZH-HANT`
- English (British) `EN-GB`
- English (American) `EN-US`
- Japanese `JA`
- German `DE`
- French `FR`
- Russian `RU`

## Interface & Localization 🎨

- The interface language can be switched between `English`, `简体中文`, and `繁體中文`.
- The selected interface language applies to the popup, options page, and in-page translation overlay.
- The popup includes a theme toggle button for switching between light mode and dark mode.
- The saved theme mode is shared across the popup, options page, and the content-script popup UI.

## How It Works ⚙️

### User flow 🚀

1. Open any supported webpage.
2. Select some text.
3. Click the floating `翻译` button.
4. The extension sends the text to the background service worker.
5. The background script dispatches the request based on your saved settings.
6. The translated result is shown in an in-page popup.

### Configuration flow 🧩

- `menu/` is the quick popup:
  - choose target language
  - choose interface language
  - switch between `server` and `api` mode
  - switch active provider quickly
  - toggle between light and dark mode
- `options/` is the full settings page:
  - save interface language
  - save backend URL and backend endpoint type
  - save DeepL API key and endpoint type
  - save DeepSeek API key

## Translation Modes 🔀

### 1. Direct API mode 🔌

In this mode, the browser sends requests directly to the provider.

Supported providers:

- DeepL
- DeepSeek

Current status:

- DeepL: implemented
- DeepSeek: implemented
- Google Translate: UI placeholder exists, but it is not implemented yet

### 2. Server relay mode 🖥️

In this mode, the extension sends requests to your own server instead of directly calling the provider.

The UI currently supports these backend endpoint types:

- `deepseek/`
- `deepl/`

From the current code, the backend is expected to:

- receive JSON with `text` and `target`
- return JSON in the shape:

```json
{
  "success": true,
  "result": "translated text"
}
```

The project README currently links to a companion backend here:

- [translate-on-select-backend](https://github.com/simon-hale/translate-on-select-backend)

## Installation 📦

There is no build step right now. You can load the project directly as an unpacked extension.

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Turn on `Developer mode`.
4. Click `Load unpacked`.
5. Select this project folder.

## Setup 🛠️

### Quick setup from the popup ⚡

Use the popup to:

- choose the target language
- choose the interface language
- choose `自定义服务器` or `自定义 API`
- switch the active provider quickly
- toggle between light and dark mode

Popup interface overview:

<img src="./assets/Popup%20interface%20overview.png" alt="Popup interface overview" style="zoom:67%;" />

### Full setup from the options page 🧰

Open the options page and configure one of the following:

Options interface overview:

<img src="./assets/Options%20interface%20overview.png" alt="Options interface overview" style="zoom:50%;" />

#### A. Direct DeepL

Required:

- DeepL API key
- DeepL endpoint type:
  - `DeepL Free`
  - `DeepL Pro`

#### B. Direct DeepSeek

Required:

- DeepSeek API key

Optional:

- enable or disable streaming in the popup

#### C. Server relay

Required:

- server URL
- endpoint type:
  - `Deepseek V3 Chat`
  - `DeepL`

Optional:

- HTTP method selector is exposed in the UI
- interface language can also be updated from the options page

## Usage Notes 📝

- The extension injects its content script on `<all_urls>`.
- A floating translate button appears only after text is selected.
- Selected text longer than `2400` characters is rejected in the current implementation.
- The result popup can be copied manually.
- The popup does not auto-close by timer in the current implementation.
- The interface supports English, Simplified Chinese, and Traditional Chinese.
- The saved theme mode is reused by the popup, options page, and in-page overlay.

## Project Structure 📁

```text
.
├─ background/
│  ├─ background.js              # Dispatcher and provider routing
│  └─ api/
│     ├─ deepl_api.js            # Direct DeepL adapter
│     ├─ deepseek_api.js         # Direct DeepSeek adapter
│     └─ server_api.js           # Relay backend adapter
├─ front/
│  └─ contentScript.js           # Selection handling + in-page popup UI
├─ menu/
│  ├─ menu.html                  # Popup UI
│  └─ menu.js                    # Popup interaction logic
├─ options/
│  ├─ options.html               # Full settings page
│  └─ options.js                 # Settings persistence and UI switching
├─ shared/
│  ├─ i18n.js                    # UI language resources and localization helpers
│  └─ theme.js                   # Light/dark theme helpers
├─ icons/
├─ PrivacyPolicyAndSecure.md     # Privacy policy (English)
├─ PrivacyPolicyAndSecure.zh-CN.md
├─ PrivacyPolicyAndSecure.zh-TW.md
└─ manifest.json
```

## Architecture Overview 🧠

### `front/contentScript.js`

- Watches text selection
- Creates the floating translate button
- Shows loading and result popup
- Receives streaming chunks from the background script

### `background/background.js`

- Reads saved settings from `chrome.storage.local`
- Chooses the active translation path
- Normalizes target language values per provider
- Handles streaming forwarding for DeepSeek responses

### `background/api/*.js`

- `deepl_api.js`: calls DeepL REST API
- `deepseek_api.js`: calls DeepSeek Chat Completions API
- `server_api.js`: calls your custom backend

### `shared/*.js`

- `i18n.js`: provides English, Simplified Chinese, and Traditional Chinese UI strings
- `theme.js`: provides the shared light/dark theme state and palette helpers

## Storage 💾

The extension stores settings in `chrome.storage.local`, including:

- backend mode
- provider selection
- target language
- server URL
- API keys
- DeepL endpoint selection
- DeepSeek streaming toggle
- UI language
- theme mode

## Privacy Policy 🔒

This repository includes privacy policy documents in three languages:

- [English](./PrivacyPolicyAndSecure.md)
- [简体中文](./PrivacyPolicyAndSecure.zh-CN.md)
- [繁體中文](./PrivacyPolicyAndSecure.zh-TW.md)

## Security Notes 🔐

This project is convenient, but not hardened.

- In direct API mode, your API keys are stored in `chrome.storage.local`.
- In server mode, security depends entirely on how your backend stores and protects provider credentials.
- If you use a relay backend, prefer environment variables or a proper secret management setup instead of plain files.

## Limitations ⚠️

- Google Translate is not implemented yet
- Screenshots currently focus on the Simplified Chinese interface
- No automated tests are included
- No build pipeline or packaging flow is included
- Server mode assumes a backend contract that you must implement yourself

## Development 👨‍💻

This repository is currently simple enough to edit directly and reload in Chrome.

Recommended local workflow:

1. Edit files in this repo.
2. Go to `chrome://extensions/`.
3. Reload the unpacked extension.
4. Re-test popup settings, options page, and webpage selection behavior.

## Roadmap Ideas 💡

- Implement Google Translate support
- Improve secrets handling
- Add screenshots and demo GIFs
- Improve localization
- Add tests for provider adapters and settings logic
