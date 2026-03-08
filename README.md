# Translate-On-Select

This is a Chrome Extension for translating selected text on web pages.

It was ***almost entirely built with ChatGPT*** — yes, it's an ***AI-BUILT PROJECT***.  

My own work mainly involved manually integrating the translation API and, um, right — also uploading it to GitHub.

The extension currently integrates Deepseek V3 and DeepL. All you need to do is register a developer account of them, get a token, and paste it into the plugin settings. 

The API integration offers two options:  
1. Store the token locally and send it directly with each translation request to the API.  
2. Use a [Backend](https://github.com/simon-hale/translate-on-select-backend, "click to jump") layer to act as a relay.  

Which one to choose? That’s for you to explore.  

That said, the project isn’t particularly elegant yet. For example, with option 1, the token is stored locally and sent directly when needed — it just doesn’t feel very secure to have it exposed on the internet like that. Still, I kept this option for convenience.  With option 2, the token is still just stored in a local file on the server. Ideally, it should be placed in environment variables or secured through other measures. Also, the interface and settings currently only support Simplified Chinese.

But hey — current problems can wait. Haha.