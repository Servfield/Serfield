(async function(){
  const $ = (s, el=document)=>el.querySelector(s);
  const $$ = (s, el=document)=>Array.from(el.querySelectorAll(s));

  const [site, posts] = await Promise.all([
    fetch('/data/site.json', {cache:'no-store'}).then(r=>r.json()),
    fetch('/data/posts.json', {cache:'no-store'}).then(r=>r.json())
  ]);

  // basic hydration
  const st = $('#siteTitle'); if(st) st.textContent = site.title;
  const sa = $('#siteAuthor'); if(sa) sa.textContent = site.author;
  const y = $('#year'); if(y) y.textContent = new Date().getFullYear();
  const tl = $('#siteTagline'); if(tl) tl.textContent = site.tagline;
  const desc = $('#siteDesc'); if(desc) desc.textContent = site.description;

  // meta line
  const hero = $('#heroMeta');
  if(hero){
    const tags = new Set();
    posts.forEach(p=>p.tags.forEach(t=>tags.add(t)));
    hero.innerHTML = `<span class="pill">${posts.length} 篇文章</span> <span class="pill">${tags.size} 个标签</span> <span class="pill">纯静态 · 免构建</span>`;
  }

  // tag filter
  function buildTagSelect(select){
    if(!select) return;
    const tags = Array.from(new Set(posts.flatMap(p=>p.tags))).sort((a,b)=>a.localeCompare(b,'zh-Hans-CN'));
    select.innerHTML = `<option value="">全部标签</option>` + tags.map(t=>`<option value="${t}">${t}</option>`).join('');
  }

  // utils
  const fmt = (d)=>{
    // keep as yyyy-mm-dd
    return d;
  }
  const byDateDesc = (a,b)=> (a.date<b.date?1:-1);

  function matches(p, q, tag){
    const hitTag = !tag || p.tags.includes(tag);
    if(!hitTag) return false;
    if(!q) return true;
    q = q.toLowerCase();
    return (p.title + ' ' + p.summary + ' ' + p.tags.join(' ')).toLowerCase().includes(q);
  }

  function renderCards(listEl, max=6){
    if(!listEl) return;
    const search = $('#search');
    const tagSel = $('#tagFilter');
    buildTagSelect(tagSel);

    const draw = ()=>{
      const q = search?.value?.trim()||'';
      const tag = tagSel?.value||'';
      const items = posts.slice().sort(byDateDesc).filter(p=>matches(p,q,tag)).slice(0,max);
      listEl.innerHTML = items.map(p=>{
        const tags = p.tags.slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('');
        return `
          <article class="card">
            <a class="card__link" href="/p/${p.slug}/" aria-label="阅读：${p.title}">
              <div class="card__body">
                <h3 class="card__title">${p.title}</h3>
                <p class="card__summary">${p.summary}</p>
                <div class="card__meta">
                  <time datetime="${p.date}">${fmt(p.date)}</time>
                  <span class="dot" aria-hidden="true">•</span>
                  <span class="tags">${tags}</span>
                </div>
              </div>
            </a>
          </article>`;
      }).join('') || `<p class="muted">没有找到匹配的文章。</p>`;
    };

    search?.addEventListener('input', draw);
    tagSel?.addEventListener('change', draw);
    draw();
  }

  function renderArchive(listEl){
    if(!listEl) return;
    const search = $('#search');
    const tagSel = $('#tagFilter');
    buildTagSelect(tagSel);

    const draw = ()=>{
      const q = search?.value?.trim()||'';
      const tag = tagSel?.value||'';
      const items = posts.slice().sort(byDateDesc).filter(p=>matches(p,q,tag));
      listEl.innerHTML = items.map(p=>{
        const tags = p.tags.map(t=>`<span class="tag">${t}</span>`).join('');
        return `
          <div class="row">
            <div class="row__date"><time datetime="${p.date}">${fmt(p.date)}</time></div>
            <div class="row__main">
              <a class="row__title" href="/p/${p.slug}/">${p.title}</a>
              <div class="row__summary">${p.summary}</div>
              <div class="row__tags">${tags}</div>
            </div>
          </div>`;
      }).join('') || `<p class="muted">没有找到匹配的文章。</p>`;
    };
    search?.addEventListener('input', draw);
    tagSel?.addEventListener('change', draw);
    draw();
  }

  renderCards($('#postList'), 6);
  renderArchive($('#postArchive'));
})();
