# Aesthetic Static Blog（纯静态博客模板）

这是一个可以**直接上传到 GitHub 并用 GitHub Pages 发布**的纯静态博客模板：只有 HTML/CSS/JS + Markdown 内容，无需构建。

## 1. 快速开始

1) 新建 GitHub 仓库（建议：`<username>.github.io` 或任意项目仓库）。
2) 把本模板所有文件上传到仓库根目录。
3) 在 GitHub 仓库的 **Settings → Pages** 中选择发布分支（通常是 `main`）与根目录发布。
4) 等待 1–2 分钟后访问 GitHub Pages 提供的 URL。

> GitHub Pages 可以直接托管静态站点（HTML/CSS/JS），只要保证根目录有 `index.html` 即可。文章：DEV Community 的部署步骤与说明可参考；或 Udacity 的 GitHub Pages 指南。 

## 2. 写文章（Markdown）

- 文章内容放在：`/content/posts/*.md`
- 元信息在：`/data/posts.json`

新增文章步骤：

1) 复制一个 md：`content/posts/your-post.md`
2) 在 `data/posts.json` 添加一项（参考已有两篇文章）
3) 新建文章页：`/p/<slug>/index.html`

> 已提供两篇示例文章与对应页面。

## 3. 修改站点信息

编辑 `data/site.json`：

- title / tagline / description
- author
- social

## 4. 可选：避免 Jekyll 处理

如果你的仓库里出现以下划线开头的目录（例如 `_data`），建议保留本模板自带的 `.nojekyll`，避免 GitHub Pages 用 Jekyll 过滤文件。

## 5. License

MIT
