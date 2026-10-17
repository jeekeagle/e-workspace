// e-workspace blog app
// Hash-based routing so the static site behaves like a tiny SPA.

(function () {
  const VIEW_HOME = "home";
  const VIEW_POSTS = "posts";
  const VIEW_POST = "post";
  const VIEW_ABOUT = "about";

  const posts = window.POSTS || [];

  const root = document.getElementById("app");

  function fmtDate(d) {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">");
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === "data") {
        for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
      } else if (v !== null && v !== undefined) {
        node.setAttribute(k, v);
      }
    }
    for (const c of [].concat(children)) {
      if (c == null) continue;
      node.append(c.nodeType ? c : document.createTextNode(c));
    }
    return node;
  }

  function renderPostList(posts, limit) {
    const list = posts
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, limit || posts.length);
    const items = list.map((p) => {
      const a = el("a", { class: "post", href: `#/post/${p.id}` }, [
        el("div", { class: "post__date" }, fmtDate(p.date)),
        el("div", { class: "post__body" }, [
          el("div", { class: "post__category" }, p.category),
          el("h3", { class: "post__title" }, p.title),
          el("p", { class: "post__excerpt" }, p.excerpt),
        ]),
        el("div", { class: "post__time" }, p.readTime),
      ]);
      return el("li", {}, [a]);
    });
    return el("ul", { class: "posts" }, items);
  }

  function renderHome() {
    const main = el("main", { class: "container layer" });
    const hero = el("section", { class: "hero fade-up" }, [
      el("p", { class: "hero__eyebrow" }, "Personal workspace · 2026"),
      el("h1", { class: "hero__title", html: "一张安静的书桌，放得下<em>写得慢的文章</em>与<em>翻得勤的小工具</em>。" }),
      el("p", { class: "hero__lede" }, "e-workspace 是 jeekeagle 的个人网络角落。博客记录思考，Resources 收纳速查，所有东西都托管在 GitHub Pages 上，没有后台。"),
      el("div", { class: "hero__meta" }, [
        el("div", {}, [el("b", {}, "栈"), " · ", "HTML · CSS · 原生 JS"]),
        el("div", {}, [el("b", {}, "托管"), " · ", "GitHub Pages"]),
        el("div", {}, [el("b", {}, "更新"), " · ", "有想法就写"]),
      ]),
    ]);
    main.append(hero);

    const recent = el("section", { class: "section" }, [
      el("div", { class: "section__head" }, [
        el("h2", { class: "section__title" }, "最近的文章"),
        el("a", { class: "section__hint", href: "#/posts" }, "查看全部 →"),
      ]),
    ]);
    recent.append(renderPostList(posts, 3));
    main.append(recent);

    return main;
  }

  function renderPosts() {
    const main = el("main", { class: "container layer" });
    main.append(
      el("section", { class: "hero" }, [
        el("p", { class: "hero__eyebrow" }, "Posts"),
        el("h1", { class: "hero__title" }, "全部文章"),
        el("p", { class: "hero__lede" }, "按时间倒序排列。点开任意一条进入阅读视图。"),
      ])
    );

    const section = el("section", { class: "section" });
    const cats = ["全部", ...new Set(posts.map((p) => p.category))];

    const filterBar = el("div", { class: "filters" });
    let current = "全部";
    const list = el("div");

    function paint() {
      list.innerHTML = "";
      const filtered =
        current === "全部" ? posts : posts.filter((p) => p.category === current);
      if (filtered.length === 0) {
        list.append(el("p", { class: "empty" }, "这个分类下还没有文章。"));
        return;
      }
      list.append(renderPostList(filtered));
    }
    cats.forEach((c) => {
      const btn = el("button", { type: "button" }, c);
      if (c === current) btn.classList.add("is-active");
      btn.addEventListener("click", () => {
        current = c;
        filterBar.querySelectorAll("button").forEach((b) =>
          b.classList.toggle("is-active", b.textContent === c)
        );
        paint();
      });
      filterBar.append(btn);
    });
    section.append(filterBar);
    section.append(list);
    paint();
    main.append(section);
    return main;
  }

  function renderPost(postId) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return renderNotFound();

    const main = el("main", { class: "container layer" });

    // Detail
    const detail = el("section", { class: "post-detail" }, [
      el("div", {}, [
        el("div", { class: "post-detail__head" }, [
          el("div", { class: "post-detail__category" }, post.category),
          el("h1", { class: "post-detail__title" }, post.title),
          el("div", { class: "post-detail__meta" }, [
            el("span", {}, fmtDate(post.date)),
            el("span", {}, post.readTime),
            el("a", { href: "#/posts" }, "← 全部文章"),
          ]),
        ]),
        el("article", { class: "post-detail__body" }, buildBody(post)),
      ]),
      buildToc(post),
    ]);
    main.append(detail);

    // Prev / Next
    const idx = posts.findIndex((p) => p.id === post.id);
    const sorted = posts.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const sortedIdx = sorted.findIndex((p) => p.id === post.id);
    const prev = sorted[sortedIdx + 1];
    const next = sorted[sortedIdx - 1];

    const nav = el("section", { class: "container" }, [
      el("div", { class: "post-nav" }, [
        prev
          ? el(
              "a",
              { class: "post-nav__cell", href: `#/post/${prev.id}` },
              [
                el("p", { class: "post-nav__hint" }, "← 上一篇"),
                el("p", { class: "post-nav__title" }, prev.title),
              ]
            )
          : el("div", { class: "post-nav__placeholder" }),
        next
          ? el(
              "a",
              { class: "post-nav__cell is-right", href: `#/post/${next.id}` },
              [
                el("p", { class: "post-nav__hint" }, "下一篇 →"),
                el("p", { class: "post-nav__title" }, next.title),
              ]
            )
          : el("div", { class: "post-nav__placeholder" }),
      ]),
    ]);
    main.append(nav);

    setTimeout(() => setupTocObserver(post), 60);
    return main;
  }

  function buildBody(post) {
    // Distribute headings evenly between paragraphs (simple, deterministic).
    const N = post.headings.length;
    const M = post.content.length;
    const positions = post.headings.map((_, i) => {
      const p = Math.floor((i + 1) * M / (N + 1));
      return Math.min(M, p);
    });

    const out = document.createDocumentFragment();
    let h = 0;
    for (let p = 0; p < M; p++) {
      while (h < N && positions[h] === p) {
        const head = post.headings[h];
        out.append(el("h2", { id: head.id }, head.text));
        h++;
      }
      out.append(el("p", {}, post.content[p]));
    }
    while (h < N) {
      const head = post.headings[h];
      out.append(el("h2", { id: head.id }, head.text));
      h++;
    }
    return out;
  }

  function buildToc(post) {
    const aside = el("aside", { class: "toc" });
    aside.append(el("p", { class: "toc__label" }, "本页目录"));
    const nav = el("nav", { class: "toc__nav" });
    post.headings.forEach((h) => {
      const a = el("a", { href: `#${h.id}`, "data-target": h.id }, h.text);
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(h.id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#/post/${post.id}#${h.id}`);
      });
      nav.append(a);
    });
    aside.append(nav);
    return aside;
  }

  function setupTocObserver(post) {
    const links = document.querySelectorAll(".toc__nav a");
    if (!links.length) return;
    const map = new Map();
    links.forEach((a) => map.set(a.dataset.target, a));
    const headings = post.headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const link = map.get(e.target.id);
          if (!link) return;
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    headings.forEach((h) => obs.observe(h));
  }

  function renderNotFound() {
    const main = el("main", { class: "container layer" });
    main.append(
      el("section", { class: "hero" }, [
        el("p", { class: "hero__eyebrow" }, "404"),
        el("h1", { class: "hero__title" }, "找不到这篇文章"),
        el("p", { class: "hero__lede" }, "可能链接已经更新，或者这篇文章还没有被收录。"),
        el("p", {}, [el("a", { href: "#/" }, "← 回首页")]),
      ])
    );
    return main;
  }

  function renderAbout() {
    const main = el("main", { class: "container layer" });
    main.append(
      el("section", { class: "hero" }, [
        el("p", { class: "hero__eyebrow" }, "About"),
        el("h1", { class: "hero__title" }, "关于这个站点"),
      ])
    );
    const about = el("section", { class: "about container-narrow" }, [
      el("p", {}, "这是 jeekeagle 的个人工作台。站点的目的是放一些写得慢的文章，和一些用得勤的小工具。"),
      el("p", {}, "如果你正在读这里，说明内容对你还有点用。如果没有，跳过去也没关系。"),
      el("dl", { class: "kv" }, [
        el("dt", {}, "Author"),
        el("dd", {}, "jeekeagle"),
        el("dt", {}, "Stack"),
        el("dd", {}, "HTML / CSS / 原生 JavaScript"),
        el("dt", {}, "Hosting"),
        el("dd", {}, [el("a", { href: "https://github.com/jeekeagle/e-workspace", target: "_blank", rel: "noopener" }, "GitHub Pages")]),
        el("dt", {}, "Source"),
        el("dd", {}, [el("a", { href: "https://github.com/jeekeagle/e-workspace", target: "_blank", rel: "noopener" }, "jeekeagle/e-workspace")]),
      ]),
      el("p", {}, "站点模板来自 ", [
        el("a", { href: "https://www.stylekit.top/templates", target: "_blank", rel: "noopener" }, "StyleKit Templates"),
        " 的 Yohaku Blog，已重构为纯静态版本。",
      ]),
    ]);
    main.append(about);
    return main;
  }

  function renderResources() {
    // Resources landing page lives in resources/index.html — this just renders a guard.
    window.location.href = "resources/";
    return el("main");
  }

  function render() {
    const hash = window.location.hash || "#/";
    const path = hash.replace(/^#\/?/, "").split("?")[0];

    let main;
    if (path === "" || path === "/") {
      main = renderHome();
      setNavActive("home");
    } else if (path === "posts" || path === "posts/") {
      main = renderPosts();
      setNavActive("posts");
    } else if (path.startsWith("post/")) {
      const id = path.slice("post/".length);
      main = renderPost(id);
      setNavActive("posts");
    } else if (path === "about" || path === "about/") {
      main = renderAbout();
      setNavActive("about");
    } else if (path.startsWith("resources")) {
      // Defer to dedicated page
      const dest = "resources/" + (path === "resources" ? "" : path.slice("resources".length));
      window.location.href = dest;
      return;
    } else {
      main = renderNotFound();
      setNavActive("");
    }

    root.innerHTML = "";
    root.append(main);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function setNavActive(name) {
    document.querySelectorAll(".nav a").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.view === name);
    });
  }

  window.addEventListener("hashchange", render);
  document.addEventListener("DOMContentLoaded", render);
  if (document.readyState !== "loading") render();
})();