// Lightweight Markdown renderer (no dependencies)
// Supports: headings, paragraphs, links, emphasis, inline code, fenced code blocks, blockquotes, ul/ol, hr.
(function(){
  const esc = (s)=>s.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

  function renderInline(line){
    // code
    line = line.replace(/`([^`]+?)`/g, (_,c)=>`<code>${esc(c)}</code>`);
    // bold
    line = line.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    // italic
    line = line.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    // links
    line = line.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return line;
  }

  function mdToHtml(md){
    md = md.replace(/\r\n/g,'\n');
    const lines = md.split('\n');
    let out = [];
    let inCode = false;
    let codeLang = '';
    let codeBuf = [];
    let listStack = []; // 'ul' or 'ol'

    const closeLists = ()=>{
      while(listStack.length){
        out.push(`</${listStack.pop()}>`);
      }
    };

    for(let i=0;i<lines.length;i++){
      let line = lines[i];

      // fenced code
      const fence = line.match(/^```\s*([\w-]+)?\s*$/);
      if(fence){
        if(!inCode){
          closeLists();
          inCode = true;
          codeLang = fence[1]||'';
          codeBuf=[];
        }else{
          inCode = false;
          const code = esc(codeBuf.join('\n'));
          out.push(`<pre class="code"><code class="lang-${esc(codeLang)}">${code}</code></pre>`);
          codeLang='';
          codeBuf=[];
        }
        continue;
      }
      if(inCode){
        codeBuf.push(line);
        continue;
      }

      // hr
      if(/^---+$/.test(line.trim())){ closeLists(); out.push('<hr />'); continue; }

      // blockquote
      const bq = line.match(/^>\s?(.*)$/);
      if(bq){
        closeLists();
        out.push(`<blockquote>${renderInline(bq[1])}</blockquote>`);
        continue;
      }

      // heading
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if(h){
        closeLists();
        const level = h[1].length;
        const text = renderInline(h[2].trim());
        // create id for anchor
        const plain = h[2].trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'');
        out.push(`<h${level} id="${plain}">${text}</h${level}>`);
        continue;
      }

      // list item (ul/ol)
      const ul = line.match(/^\s*[-*+]\s+(.*)$/);
      const ol = line.match(/^\s*(\d+)\.\s+(.*)$/);
      if(ul || ol){
        const type = ul ? 'ul' : 'ol';
        const item = renderInline((ul?ul[1]:ol[2]).trim());
        if(listStack[listStack.length-1] !== type){
          closeLists();
          listStack.push(type);
          out.push(`<${type}>`);
        }
        out.push(`<li>${item}</li>`);
        continue;
      } else {
        // close list when blank line or normal paragraph
        if(line.trim()===''){
          closeLists();
          continue;
        }
      }

      // paragraph
      closeLists();
      out.push(`<p>${renderInline(line.trim())}</p>`);
    }
    closeLists();
    return out.join('\n');
  }

  window.__mdToHtml = mdToHtml;
})();
