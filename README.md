# e-workspace

jeekeagle 的个人工作台。一张安静的书桌，放得下几篇写得慢的文章、几张偶尔翻出来的备忘、几个值得反复点开的小工具。

## 站点结构

- `index.html` — 博客入口（首页 / 文章列表 / 文章详情 / About）
- `assets/` — CSS、博客数据、客户端脚本
- `resources/` — 资源索引
  - `resources/skills/` — 12 张独立 HTML 的速查合集
  - `resources/notes/` — 一些更自由的随笔

## 本地运行

无需构建，直接用任意静态文件服务器即可：

```bash
python -m http.server 8080
# 或
npx serve .
```

## 部署

托管在 GitHub Pages 上：<https://jeekeagle.github.io/e-workspace/>

## 起源

博客的视觉骨架来自 [StyleKit Templates](https://www.stylekit.top/templates) 的 Yohaku Blog 模板（日式留白 + 纸面纹理 + 弹簧动画）。本仓库在此基础上做了轻量化重构：把 Next.js 替换为纯静态站点，保留设计令牌与排版，把视图切换、目录高亮等轻交互搬进原生 JS。

## License

MIT