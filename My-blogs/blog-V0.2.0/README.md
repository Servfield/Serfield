# Apple-like Static Blog（可直接部署到 GitHub Pages）

目标：**纯静态**、极简、类 Apple 美学；包含：导航（Gemini 问答 + 常用网站）、News（抓取 10 条头条）、博客（Markdown）、留言板（评论）。

## 一键部署
1) 新建仓库并上传本项目 → Settings → Pages → Deploy from branch → main / root。

## 写文章
把 `.md` 放进 `posts_md/`，然后运行：
```bash
python scripts/build_posts.py
```
也可用 `.github/workflows/build.yml` 自动生成（push + 定时）。

## News
用 Actions 定时抓 RSS 生成 `data/news.json`，避免浏览器 CORS。

## Gemini
- 直接调用（不安全）：控制台 `localStorage.setItem('GEMINI_API_KEY','你的key')`
- 推荐：Cloudflare Worker 代理（见 `optional/`），再在 `site.config.json` 打开 `useProxy`。

## 留言板
推荐 giscus（GitHub Discussions），在 https://giscus.app 生成配置填到 `site.config.json`。
