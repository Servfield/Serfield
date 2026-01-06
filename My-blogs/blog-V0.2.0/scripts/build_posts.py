"""Generate static HTML posts from posts_md/*.md and write data/posts.json."""
from __future__ import annotations
import re, json, datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'posts_md'; OUT=ROOT/'posts'; DATA=ROOT/'data'
FRONT_RE=re.compile(r'^---\s*\n(.*?)\n---\s*\n',re.S)
try:
  import markdown as _md
except Exception:
  _md=None

def slugify(name:str)->str:
  s=re.sub(r'[^\w\u4e00-\u9fff-]+','-',name.strip().lower())
  return re.sub(r'-{2,}','-',s).strip('-') or 'post'

def parse_frontmatter(text:str):
  fm={}; m=FRONT_RE.match(text)
  if not m: return fm,text
  block=m.group(1); body=text[m.end():]
  for line in block.splitlines():
    if ':' not in line: continue
    k,v=line.split(':',1); k=k.strip(); v=v.strip()
    if v.startswith('[') and v.endswith(']'):
      fm[k]=[x.strip().strip('"\'') for x in v[1:-1].split(',') if x.strip()]
    else:
      fm[k]=v.strip('"\'')
  return fm,body

def fallback(md:str)->str:
  md=md.replace('\r\n','\n')
  def code(m):
    c=m.group(2).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
    return f"<pre><code>{c}</code></pre>"
  md=re.sub(r'```(\w+)?\n(.*?)\n```',code,md,flags=re.S)
  md=re.sub(r'^# (.*)$',r'<h1>\1</h1>',md,flags=re.M)
  md=re.sub(r'^## (.*)$',r'<h2>\1</h2>',md,flags=re.M)
  md=re.sub(r'^> (.*)$',r'<blockquote>\1</blockquote>',md,flags=re.M)
  md=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',md)
  md=re.sub(r'`(.+?)`',r'<code>\1</code>',md)
  md=re.sub(r'\[(.+?)\]\((.+?)\)',r'<a href="\2">\1</a>',md)
  parts=[p.strip() for p in re.split(r'\n\s*\n',md) if p.strip()]
  out=[]
  for p in parts:
    if p.startswith('<h') or p.startswith('<pre') or p.startswith('<blockquote'):
      out.append(p)
    else:
      out.append('<p>'+p.replace('\n','<br/>')+'</p>')
  return '\n'.join(out)

def wrap(title,summary,date,tags,html,cfg):
  meta=f"<div class='meta'>{date} · {' / '.join(tags) if tags else ''}</div>" if (date or tags) else ''
  body=f"<h1>{title}</h1>{meta}{html}"
  site=cfg.get('site',{}).get('title','My Static Blog')
  # NOTE: avoid JS object literals here to keep string simple
  giscus_js="(async()=>{const cfg=await (await fetch('../site.config.json')).json();const g=cfg.giscus||{};if(!g.enabled) return;const s=document.createElement('script');s.src='https://giscus.app/client.js';s.async=true;s.crossOrigin='anonymous';s.setAttribute('data-repo',g.repo);s.setAttribute('data-repo-id',g.repoId);s.setAttribute('data-category',g.category);s.setAttribute('data-category-id',g.categoryId);s.setAttribute('data-mapping',g.mapping||'pathname');s.setAttribute('data-strict','0');s.setAttribute('data-reactions-enabled',g.reactionsEnabled||'1');s.setAttribute('data-emit-metadata',g.emitMetadata||'0');s.setAttribute('data-input-position',g.inputPosition||'top');s.setAttribute('data-lang',g.lang||'zh-CN');const theme=document.documentElement.dataset.theme==='dark'?'transparent_dark':'light';s.setAttribute('data-theme',theme);document.getElementById('postComments').appendChild(s);})();"
  return "<!doctype html><html lang='zh-CN'><head><meta charset='utf-8' />\n<meta name='viewport' content='width=device-width,initial-scale=1' />\n<meta name='color-scheme' content='light dark' />\n<link rel='stylesheet' href='../assets/style.css' />\n<title>"+title+" · "+site+"</title>\n<meta name='description' content='"+(summary or '')+"' /></head><body>\n<div class='topbar'><div class='container'><div class='nav'><a class='brand' href='../index.html'><span class='logo'></span><span>"+site+"</span></a><nav class='navlinks'><a href='../index.html'>首页</a><a href='../news.html'>News</a><a href='../blog.html'>博客</a><a href='../guestbook.html'>留言板</a></nav><div class='spacer'></div><select class='btn' id='themeSelect'></select></div></div></div>\n<section class='hero' style='padding-top:26px'><div class='container'><article class='card article'>"+body+"<hr style='border:0;border-top:1px solid var(--border);margin:18px 0' /><div id='postComments'></div></article></div></section>\n<div class='footer'><div class='container'><div class='row'><div>© <span id='year'></span></div><div class='meta'>Built for GitHub Pages</div></div></div></div>\n<script>document.getElementById('year').textContent=new Date().getFullYear();</script>\n<script src='../assets/app.js' defer></script>\n<script>"+giscus_js+"</script>\n</body></html>"

def main():
  cfg=json.loads((ROOT/'site.config.json').read_text('utf-8'))
  OUT.mkdir(exist_ok=True); DATA.mkdir(exist_ok=True)
  posts=[]
  for mdp in sorted(SRC.glob('*.md')):
    fm,body=parse_frontmatter(mdp.read_text('utf-8'))
    title=fm.get('title') or mdp.stem; date=fm.get('date') or ''; tags=fm.get('tags') or []; summary=fm.get('summary') or ''
    html=_md.markdown(body,extensions=['fenced_code','tables']) if _md else fallback(body)
    slug=slugify(mdp.stem); url=f"./posts/{slug}.html"
    (OUT/f"{slug}.html").write_text(wrap(title,summary,date,tags,html,cfg),encoding='utf-8')
    posts.append({'title':title,'date':date,'tags':tags,'summary':summary,'url':url})
  (DATA/'posts.json').write_text(json.dumps({'generated':datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),'posts':sorted(posts,key=lambda x:x.get('date',''),reverse=True)},ensure_ascii=False,indent=2),encoding='utf-8')

if __name__=='__main__':
  main()
