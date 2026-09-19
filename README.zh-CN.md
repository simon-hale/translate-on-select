<div align="center">

<img src="./icons/icon_128.png" alt="Translate-on-Select" width="96" height="96" />

# Translate-on-Select

一个轻量的 Chrome 划词翻译扩展。选中文字后点击按钮，即可在当前页面内查看翻译结果。

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
  <a href="./README.zh-TW.md">
    <img src="https://img.shields.io/badge/Docs-%E7%B9%81%E9%AB%94%E4%B8%AD%E6%96%87-111111?style=flat-square" alt="繁体中文 README" />
  </a>
</p>

这是一个基于 Manifest V3 的原生 JavaScript Chrome 扩展，支持两种翻译工作流：

- 直连 API 模式：浏览器直接使用你的 API Key 调用 DeepL 或 DeepSeek
- 后端中转模式：扩展把请求发给你自己的后端，再由后端与翻译服务交互

## 快速导航

- [功能特性](#功能特性)
- [支持的目标语言](#支持的目标语言-)
- [界面与本地化](#界面与本地化-)
- [工作原理](#工作原理-)
- [翻译模式](#翻译模式-)
- [安装](#安装-)
- [配置](#配置-)
- [使用说明](#使用说明-)
- [项目结构](#项目结构-)
- [架构说明](#架构说明-)
- [本地存储](#本地存储-)
- [隐私政策](#隐私政策-)
- [安全说明](#安全说明-)
- [当前限制](#当前限制-)
- [开发](#开发-)
- [路线图](#路线图-)

## 功能特性

- 🌐 在普通网页中翻译选中的文字
- 🖱️ 选中文字后会出现浮动 `翻译` 按钮
- 💬 页面内结果弹层支持 `复制` 和 `关闭`
- ⚡ 提供快速设置 popup 用于常用切换
- ⚙️ 提供完整 options 页面用于 API Key 和后端配置
- 🌗 popup 内置浅色 / 深色切换，并在 popup、options 页面和页内翻译弹层之间共享主题
- 🌍 支持三语言界面切换：English、简体中文、繁体中文
- 🔤 支持 DeepL 直连 API
- 🤖 DeepSeek 直连 API 支持两个 V4 分支：Flash 和 Pro
- 📡 DeepSeek V4 分支支持可选流式输出
- 🖼️ 截图翻译：在当前标签页上框选可调整的区域，使用与划词相同的 Flash 分支翻译
- 🎛️ popup 与 options 页面使用主题化的自定义下拉菜单替代原生 `<select>` 控件
- 🖥️ 支持自建后端中转翻译请求

## 支持的目标语言 🌍

- 简体中文 `ZH-HANS`
- 繁体中文 `ZH-HANT`
- 英语（英式）`EN-GB`
- 英语（美式）`EN-US`
- 日语 `JA`
- 德语 `DE`
- 法语 `FR`
- 俄语 `RU`

## 界面与本地化 🎨

- 界面语言可在 `English`、`简体中文` 和 `繁体中文` 之间切换。
- 语言设置会同时应用到 popup、options 页面和网页内的翻译浮层。
- popup 提供主题切换按钮，可在浅色模式与深色模式之间切换。
- 保存后的主题模式会同步到 popup、options 页面和 content script 创建的页内结果弹层。

## 工作原理 ⚙️

### 用户流程 🚀

1. 打开任意支持的网页。
2. 选中一段文字。
3. 点击浮动 `翻译` 按钮。
4. 扩展将文字发送给后台 service worker。
5. 后台根据当前保存的配置决定走哪条翻译链路。
6. 翻译结果显示在当前页面的结果弹层中。

### 配置流程 🧩

- `menu/` 是快速设置 popup：
  - 选择目标语言
  - 切换 `server` 和 `api` 模式
  - 快速切换当前翻译来源
  - 选择 DeepSeek V4 分支（Flash / Pro）
  - 切换浅色 / 深色主题
  - Flash 分支下，标题右侧会出现截图翻译入口
- `options/` 是完整设置页：
  - 保存界面语言
  - 保存后端 URL 和后端端点类型
  - 保存 DeepL API Key 和 endpoint 类型
  - 保存 DeepSeek API Key
  - 选择 DeepSeek V4 分支和流式输出模式

## 翻译模式 🔀

### 1. 直连 API 模式 🔌

在这个模式下，浏览器会直接请求翻译服务商。

当前支持的 provider：

- DeepL
- DeepSeek

#### DeepSeek V4 分支

DeepSeek 直连 API 提供两个分支，两者都调用 `https://api.deepseek.com` 的 chat completions 接口：

- `Flash`（`deepseek-flash`）：双功能分支。划词翻译与截图翻译同时可用，两者共用同一套 Flash 提示词。
- `Pro`（`deepseek-v4-pro`）：只做纯文本划词翻译，不支持截图翻译，也不显示截图入口。

截图入口只在 `自定义 API -> DeepSeek V4 -> Flash` 下展开，其他分支保持纯文字划词的交互逻辑。

### 2. 后端中转模式 🖥️

在这个模式下，扩展不会直接请求翻译服务商，而是把请求发给你自己的服务端。

当前 UI 支持的后端端点类型：

- `deepseek/`
- `deepl/`

根据当前代码实现，后端需要：

- 接收包含 `text` 和 `target` 的 JSON 请求
- 返回如下结构的 JSON：

```json
{
  "success": true,
  "result": "translated text"
}
```

项目当前 README 中提到的配套后端项目：

- [translate-on-select-backend](https://github.com/simon-hale/translate-on-select-backend)

## 安装 📦

当前项目没有构建步骤，可以直接作为 unpacked extension 加载。

1. 克隆或下载本项目。
2. 打开 Chrome，进入 `chrome://extensions/`。
3. 打开 `Developer mode`。
4. 点击 `Load unpacked`。
5. 选择当前项目目录。

## 配置 🛠️

### 在 popup 中快速配置 ⚡

你可以在 popup 中完成以下高频操作：

- 选择目标语言
- 选择 `自定义服务器` 或 `自定义 API`
- 快速切换当前 provider
- 选择 DeepSeek V4 分支
- 切换浅色 / 深色主题

Popup 界面概览：

<img src="./assets/Popup%20interface%20overview.png" alt="Popup 界面概览" style="zoom: 67%;" />

### 在 options 页面中完整配置 🧰

打开设置页后，你可以配置以下几种方式：

Options 界面概览：

<img src="./assets/Options%20interface%20overview.png" alt="Options 界面概览" style="zoom: 50%;" />

#### A. 直连 DeepL

必填：

- DeepL API Key
- DeepL endpoint 类型：
  - `DeepL Free`
  - `DeepL Pro`

#### B. 直连 DeepSeek

必填：

- DeepSeek API Key

可选：

- 选择 DeepSeek V4 分支：
  - `Flash` (`deepseek-flash`) —— 划词翻译 + 截图翻译入口
  - `Pro` (`deepseek-v4-pro`) —— 仅纯文本划词翻译，不支持截图
- 在 options 页面开启或关闭流式输出

旧模型名 `deepseek-v4-flash` 和 `deepseek-v4-flash-vision-exp` 仍可被 API 调用，但都由当前 Flash 模型提供服务并按 Flash 价格计费；扩展会自动把配置中的旧取值迁移为 `deepseek-flash`。

#### C. 后端中转

必填：

- server URL
- 端点类型：
  - `DeepSeek V4`
  - `DeepL`

可选：

- UI 中提供了 HTTP Method 选择器
- 也可以在 options 页面调整界面语言

## 使用说明 📝

- 扩展会把 content script 注入到 `<all_urls>`。
- 只有在选中文字后，才会出现浮动翻译按钮。
- 当前实现中，选中文字长度超过 `2400` 字符会被拒绝。
- 结果弹层支持手动复制。
- 当前实现中，结果弹层不会自动定时关闭。
- 截图翻译（Flash 分支）：在 popup 中点击 `截图`，拖动框选区域，通过手柄调整后确认。截图区域仅保留在内存中，确认后才发送给 DeepSeek，使用后立即丢弃。Flash 分支下划词翻译仍可使用，文字请求与截图请求调用同一 Flash 模型、共用同一套提示词模板，只是翻译对象不同（选中文字 / 图片中可见文字）。
- 界面支持 English、简体中文 和 繁体中文 三种语言。
- 保存后的主题模式会复用到 popup、options 页面和页内翻译浮层。
- 自绘下拉同一时间只展开一个：展开某个下拉时会自动收起其他已展开的下拉。

## 项目结构 📁

```text
.
├─ background/
│  ├─ background.js              # 后台分发器与 provider 路由
│  └─ api/
│     ├─ deepl_api.js            # DeepL 直连适配器
│     ├─ deepseek_api.js         # DeepSeek 直连适配器（Flash 划词 + Flash 截图，Pro 划词）
│     ├─ sse_reader.js           # 共享 SSE 流式解析器
│     └─ server_api.js           # 后端中转适配器
├─ front/
│  └─ contentScript.js           # 划词检测与页面内翻译弹层
├─ menu/
│  ├─ menu.html                  # popup 界面
│  └─ menu.js                    # popup 交互逻辑
├─ options/
│  ├─ options.html               # 完整设置页
│  └─ options.js                 # 设置存储与界面切换逻辑
├─ shared/
│  ├─ i18n.js                    # 多语言资源与本地化辅助
│  ├─ select.js                  # 主题化自定义下拉组件
│  └─ theme.js                   # 浅色 / 深色主题辅助
├─ icons/
├─ PrivacyPolicyAndSecure.md     # 隐私政策（英文）
├─ PrivacyPolicyAndSecure.zh-CN.md
├─ PrivacyPolicyAndSecure.zh-TW.md
└─ manifest.json
```

## 架构说明 🧠

### `front/contentScript.js`

- 监听文字选择行为
- 创建浮动翻译按钮
- 显示 loading 和结果弹层
- 接收后台转发来的流式内容

### `background/background.js`

- 从 `chrome.storage.local` 读取配置
- 根据当前模式选择翻译链路
- 为不同 provider 规范目标语言格式
- 在 DeepSeek 流式场景下把 chunk 转发给页面

### `background/api/*.js`

- `deepl_api.js`：请求 DeepL REST API
- `deepseek_api.js`：请求 DeepSeek Chat Completions API；同一个适配器同时处理文字提示词与截图提示词
- `server_api.js`：请求你自己的后端服务

### `shared/*.js`

- `i18n.js`：提供 English、简体中文、繁体中文 三套界面文案
- `theme.js`：提供共享的浅色 / 深色主题状态与配色辅助

## 本地存储 💾

扩展会把配置保存在 `chrome.storage.local` 中，包括：

- backend mode
- provider 选择
- target language
- server URL
- API keys
- DeepL endpoint 选择
- DeepSeek 模型选择
- DeepSeek 流式开关
- 界面语言
- 主题模式

## 隐私政策 🔒

仓库中提供了三种语言版本的隐私政策文件：

- [English](./PrivacyPolicyAndSecure.md)
- [简体中文](./PrivacyPolicyAndSecure.zh-CN.md)
- [繁体中文](./PrivacyPolicyAndSecure.zh-TW.md)

## 安全说明 🔐

这个项目目前更偏“方便可用”，而不是“安全加固完成”。

- 在直连 API 模式下，API Key 会保存在 `chrome.storage.local` 中。
- 在后端中转模式下，安全性取决于你的服务端如何保存和保护 provider 凭据。
- 如果你使用中转后端，更建议把密钥放到环境变量或专门的 secret 管理方案中，而不是直接放在文件里。

## 当前限制 ⚠️

- 当前截图主要展示简体中文界面
- 当前没有自动化测试
- 当前没有打包或发布流水线
- 后端中转模式依赖你自己实现并维护后端契约

## 开发 👨‍💻

这个项目目前足够简单，适合直接修改源码然后在 Chrome 中 reload 调试。

推荐本地开发流程：

1. 修改项目中的文件。
2. 打开 `chrome://extensions/`。
3. 重新加载这个 unpacked extension。
4. 重新验证 popup、options 页面和网页中的划词翻译流程。

## 路线图 💡

- 改进密钥与敏感信息管理方式
- 补充截图和演示 GIF
- 提升多语言支持
- 为 provider 适配器和设置逻辑补测试
