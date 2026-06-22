# 苹果手机长期使用方案

## 推荐方式

把这个目录部署成 HTTPS 静态网站，然后在 iPhone Safari 打开并添加到主屏幕。

这样做的好处：

- 不需要电脑一直开着。
- iPhone 可以像 App 一样从主屏幕打开。
- HTTPS 环境下麦克风权限更稳定。
- 词库、错题、历史记录会保存在手机浏览器本地。

## 部署选择

### GitHub Pages

适合免费长期使用。

注意：GitHub Pages 只能托管静态网页，不能运行云端语音识别后端。如果你要使用“手机录音 -> 云端识别”，不要选 GitHub Pages，建议选 Vercel。

1. 新建一个 GitHub 仓库。
2. 上传本目录里的 `index.html`、`app-config.js`、`manifest.webmanifest`、`sw.js`、`icon.svg`、`.nojekyll`。
3. 在仓库 Settings -> Pages 里选择 Deploy from branch。
4. 部署完成后，用 iPhone Safari 打开 GitHub Pages 地址。
5. 如果需要云端语音识别，把后端部署到 Vercel，并在 `app-config.js` 里配置 `API_BASE_URL`。

### Vercel

适合以后继续升级功能，也适合当前的云端语音识别方案。

1. 登录 Vercel。
2. 导入这个项目目录或 GitHub 仓库。
3. Framework 选择 Other。
4. 在项目环境变量里添加 `OPENAI_API_KEY`。
5. 部署完成后，用 iPhone Safari 打开 Vercel 提供的 HTTPS 地址。

Vercel 静态文件来自 `public/` 目录。如果修改了根目录静态页面，先运行 `sync-public.ps1` 同步。

## iPhone 添加到主屏幕

1. 用 Safari 打开部署后的 HTTPS 地址。
2. 点底部分享按钮。
3. 选择“添加到主屏幕”。
4. 之后从主屏幕图标打开。

## 语音核对说明

当前版本优先使用“录音上传到云端语音识别”的方案，浏览器自带 `SpeechRecognition` 只作为兜底。

详细说明见 `CLOUD_SPEECH.md`。
