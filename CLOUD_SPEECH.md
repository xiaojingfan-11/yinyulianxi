# 云端语音识别方案

当前版本已经升级为“手机录音 -> 后端接口 -> OpenAI 语音识别 -> 页面核对”。

## 工作流程

1. 手机网页点击“开始朗读核对”。
2. 浏览器录音，最长约 8.5 秒。
3. 录音上传到同域名下的 `/api/transcribe`。
4. 后端读取 `OPENAI_API_KEY`，调用 OpenAI 音频转文字接口。
5. 页面拿到英文转写结果，再和当前题目做匹配度核对。

## 为什么需要后端

OpenAI API Key 不能放在前端网页里，否则任何打开网页的人都能看到密钥。

所以手机网页只上传录音，真正调用 OpenAI 的逻辑在后端：

- 本地使用：`server.js`
- Vercel 部署：`api/transcribe.js`

## 本地使用

先设置环境变量：

```powershell
setx OPENAI_API_KEY "你的 OpenAI API Key"
```

重新打开终端或重启电脑后，运行：

```powershell
node server.js
```

然后打开：

```text
http://127.0.0.1:8765/index.html
```

## Vercel 部署

1. 上传整个项目到 GitHub。
2. 在 Vercel 导入这个仓库。
3. 在 Vercel 项目设置里添加环境变量：

```text
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
```

4. 重新部署。
5. 用 iPhone Safari 打开 Vercel 的 HTTPS 地址。
6. 添加到主屏幕。

## 注意

- iPhone 录音上传需要 HTTPS，Vercel/GitHub Pages 自带 HTTPS。
- GitHub Pages 只能托管静态页面，不能运行 `/api/transcribe` 后端；如果要用云端识别，推荐 Vercel。
- 如果没有设置 `OPENAI_API_KEY`，页面会提示“OPENAI_API_KEY is not set on the server”。
