# 英语盲读练习

一个适合手机和桌面使用的英语日常短句/单词练习工具。

## GitHub Pages

可以直接把本目录上传到 GitHub Pages 作为静态网站使用。

注意：GitHub Pages 不能运行 `/api/transcribe` 后端，所以云端语音识别需要额外部署到 Vercel 或其他服务器。

如果你有独立后端地址，编辑 `app-config.js`：

```js
window.ENGLISH_TRAINER_CONFIG = {
  API_BASE_URL: "https://your-backend.example.com"
};
```

然后页面会把录音上传到：

```text
https://your-backend.example.com/api/transcribe
```

## 本地使用

```powershell
node server.js
```

打开：

```text
http://127.0.0.1:8765/index.html
```

云端语音识别需要设置：

```powershell
setx OPENAI_API_KEY "你的 OpenAI API Key"
```

## Vercel

Vercel 使用 `public/` 目录作为静态网站根目录，`api/` 目录作为后端函数。

如果修改了根目录下的静态文件，运行：

```powershell
.\sync-public.ps1
```

然后提交并推送。
