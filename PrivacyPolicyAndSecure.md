# Translate-on-Select Privacy Policy and Secure Handling Disclosure

Updated: 2026-03-17

This disclosure applies to the current implementation version of the `Translate-on-Select` Chrome extension.

The sole purpose of this extension is to translate text that a user actively selects on a webpage into the user’s chosen target language. To provide this functionality, the extension processes certain data related to webpage content, translation requests, and local settings. In accordance with Chrome Web Store requirements regarding user data, privacy policies, and secure handling, this disclosure explains what data the extension processes, how it uses that data, who it may share that data with, how long the data is retained, and how users can control or delete that data.

## 1. What data we process

This extension currently processes the following data:

- Text actively selected by the user on a webpage.
- The target language selected by the user.
- Configuration items entered or selected by the user in the popup or options page, including:
  - Operating mode (custom server mode / custom API mode)
  - API provider selection
  - Custom server URL
  - Server endpoint type
  - HTTP method
  - DeepL API Key
  - DeepSeek API Key
  - DeepL endpoint type
  - DeepSeek streaming toggle
  - Interface language
  - Theme mode
- Translation results returned by the selected service.
- The translated result copied to the local clipboard when the user clicks "Copy".

This extension does not provide user registration, login, advertising, analytics, marketing emails, or profiling features. Based on the current code implementation, this extension does not proactively collect or upload the following information:

- Personal identity information such as name, email address, phone number, or street address.
- A user’s complete browsing history.
- A user’s cookies, form contents, bookmarks, download records, or payment information.
- The full body content of a webpage unless directly triggered by the user.

It is important to note that this extension injects a content script into webpages that match `<all_urls>` so it can show a translation button when the user selects text. Although it runs in the webpage environment, the current implementation reads only the selected text when the user selects text and triggers translation, and does not proactively upload the entire page content.

## 2. How we collect this data

This extension processes data in the following ways:

- When the user visits a webpage, the content script runs in the page to support the "show a translation button after text selection" feature.
- When the user actively selects text and clicks the translation button, the extension reads that selected text and sends it to the background script for processing.
- When the user enters API keys, a server address, or other settings in the popup or options page, the extension stores those settings in the current browser’s `chrome.storage.local`.
- When the user clicks the "Copy" button, the translation result is written to the local clipboard.

This extension does not automatically and continuously upload user-selected webpage text when the user is not performing a translation action.

## 3. How we use this data

This extension uses the processed data only for the following purposes:

- To perform the translation function requested by the user.
- To choose the target language, translation service, or server endpoint based on the user’s settings.
- To display translation results in the page UI.
- To save the user’s local preferences and connection settings so they do not have to be entered repeatedly.
- To copy the translation result to the local clipboard when the user clicks "Copy".

Other than providing the translation function and necessary settings storage described above, this extension does not use user data for the following purposes:

- Personalized advertising.
- User profiling or behavioral analytics.
- Selling or transferring data to data brokers, advertising platforms, or data resellers.
- Credit evaluation, lending decisions, or any purpose unrelated to the translation feature.

## 4. Who we share data with

Whether this extension sends data to a third party depends on the translation mode currently selected by the user.

### 4.1 Direct API mode

If the user selects direct API mode, the extension sends the data required for translation directly to the third-party translation service provider selected by the user:

- `DeepL`
- `DeepSeek`

In this mode:

- The user’s selected text is sent to the chosen provider in order to complete the translation.
- The target language parameter is also sent.
- The corresponding API Key is sent to the chosen provider as authentication information.

### 4.2 Custom server mode

If the user selects custom server mode, the extension sends the data required for translation to the server address entered by the user.

In the current implementation, the data sent to the custom server includes:

- The user’s selected text
- The target language

In the current implementation, the extension does not send the `DeepL API Key` or `DeepSeek API Key` to the custom server; those keys are used only in direct API mode.

Please note:

- The custom server is configured by the user, and its privacy and security practices depend on that server’s operator.
- If the user sends data to a server they control or trust, the operator of that server is responsible for providing the relevant privacy disclosure and security protections.

### 4.3 The developer

Based on the current code implementation, this extension does not include built-in developer-owned analytics, telemetry, advertising, or tracking endpoints, and it does not contain logic that automatically sends selected text or API Keys to a developer server.

However, if the user configures a custom server that is operated by the developer, then user data will be sent to that server under the rules of "custom server mode."

## 5. Local storage, retention period, and deletion

This extension stores the following configuration items in the current browser’s `chrome.storage.local`:

- `backendMode`
- `apiBrand`
- `serverUrl`
- `httpMethod`
- `apiSelectServer`
- `deeplApiKey`
- `deepseekApiKey`
- `deeplEndpoint`
- `targetLanguage`
- `streamDeepseek`
- `uiLanguage`
- `themeMode`

Retention is as follows:

- The configuration items above remain stored in the current browser until the user actively clears them, resets the extension settings, clears extension data in the browser, or uninstalls the extension.
- Selected text and translation results are not persistently stored long term by this extension; they are primarily kept in memory only during the current request and while being displayed on the current page.

Users can manage or delete data in the following ways:

- Clear server settings or API Keys in the settings page.
- Remove extension data from the browser’s extension management interface.
- Uninstall the extension directly.
- Stop using the translation feature or avoid selecting text that contains sensitive information.

## 6. Secure handling disclosure

We aim to describe the current implementation in line with Chrome Web Store secure handling requirements for user data:

- In direct API mode, the current code sends translation requests over HTTPS to endpoints such as `https://api.deepl.com`, `https://api-free.deepl.com`, and `https://api.deepseek.com`.
- In custom server mode, the server address is entered by the user. To protect selected text and related data in transit, users should configure only trusted servers that use HTTPS.
- If the user enters a non-HTTPS address, data transmission may not be encrypted; that risk comes from the user’s custom server configuration.
- API Keys are authentication information. The current implementation stores API Keys in `chrome.storage.local` for reuse, and users can delete them at any time from the settings page.
- The current implementation does not publicly display the user’s API Keys and does not collect payment information as part of the extension’s functionality.

Users should also note:

- Do not use this extension to translate passwords, access tokens, verification codes, cookies, payment information, ID numbers, medical information, or other highly sensitive content unless you clearly understand and accept how the selected translation service or custom server will handle that data.
- If you use a third-party translation service or a custom server, the logging, retention policies, and further processing rules of those services are determined by their respective operators and are not directly controlled by this extension.

## 7. Third-party services

When the user enables the relevant mode, the following third parties may receive translation request data:

- DeepL
- DeepSeek
- The operator of the user-configured custom server

Any further processing of data, log retention, compliance obligations, and cross-border transfer arrangements by those third parties are subject to their own terms, privacy policies, and security measures. This extension cannot make commitments on behalf of those third parties.

## 8. Consistency with Chrome Web Store single-purpose and minimum-use principles

This extension’s use of user data is limited to its single purpose: translating webpage text actively selected by the user and displaying the translation result.

Based on the current code implementation, this extension does not:

- Use user data for advertising or marketing.
- Sell user data to any third party.
- Provide user data to data brokers, advertising platforms, or data resellers.
- Use user data for credit evaluation, lending decisions, or any purpose unrelated to the translation function.

## 9. Policy updates

If this extension later adds new data processing methods, third-party services, sync capabilities, account systems, analytics, or any other features that affect privacy or security, this disclosure will be updated accordingly, and the updated version will prevail.
