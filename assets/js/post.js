(async function(){
  const $ = (s, el=document)=>el.querySelector(s);
  const slug = document.querySelector('[data-post-slug]')?.getAttribute('data-post-slug');
  if(!slug) return;

  const [site, posts] = await Promise.all([
    fetch('/data/site.json', {cache:'no-store'}).then(r=>r.json()),
    fetch('/data/posts.json', {cache:'no-store'}).then(r=>r.json())
  ]);

  // hydrate brand/footer
  $('#siteTitle').textContent = site.title;
  $('#siteAuthor').textContent = site.author;
  $('#year').textContent = new Date().getFullYear();

  const post = posts.find(p=>p.slug===slug);
  if(!post){
    $('#postBody').innerHTML = '<p>未找到文章。</p>';
    return;
  }

  // fetch markdown
  const md = await fetch(post.source, {cache:'no-store'}).then(r=>r.text());

  // render
  if(!window.__mdToHtml){
    const s = document.createElement('script');
    s.src = '/assets/js/md.js';
    s.defer = true;
    document.head.appendChild(s);
    await new Promise(res=>s.addEventListener('load',res));
  }
  const html = window.__mdToHtml(md);
  const body = $('#postBody');
  body.innerHTML = `<div class="prose">${html}</div>`;

  // reading time
  const words = md.replace(/```[\s\S]*?```/g,'').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words/260));
  $('#readingTime').textContent = `${minutes} 分钟阅读`;

  // post nav
  const idx = posts.findIndex(p=>p.slug===slug);
  const prev = posts[idx-1];
  const next = posts[idx+1];
  const nav = $('#postNav');
  const item = (p, label)=> p ? `<a class="postnav__item" href="/p/${p.slug}/"><span class="muted">${label}</span><span>${p.title}</span></a>` : '';
  nav.innerHTML = `${item(prev,'上一篇')} ${item(next,'下一篇')}`;

  // share
  const url = location.href;
  $('#shareX').href = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`;
  $('#copyLink').addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(url);
      $('#copyLink').textContent='已复制';
      setTimeout(()=>$('#copyLink').textContent='复制链接',1200);
    }catch(e){
      alert('复制失败，请手动复制地址栏链接');
    }
  });
})();
