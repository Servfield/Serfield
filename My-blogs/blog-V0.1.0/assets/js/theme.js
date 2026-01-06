(function(){
  const KEY = 'blog-theme';
  const root = document.documentElement;

  function apply(mode){
    root.dataset.theme = mode;
  }

  function getPreferred(){
    const saved = localStorage.getItem(KEY);
    if(saved) return saved;
    return 'auto';
  }

  function resolve(mode){
    if(mode !== 'auto') return mode;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function set(mode){
    localStorage.setItem(KEY, mode);
    apply(resolve(mode));
    document.dispatchEvent(new CustomEvent('theme:change', {detail:{mode}}));
  }

  // initial
  apply(resolve(getPreferred()));

  // toggle
  window.addEventListener('DOMContentLoaded', ()=>{
    const btn = document.getElementById('themeToggle');
    if(!btn) return;
    const cycle = ['auto','light','dark'];
    btn.addEventListener('click', ()=>{
      const cur = localStorage.getItem(KEY) || 'auto';
      const next = cycle[(cycle.indexOf(cur)+1)%cycle.length];
      set(next);
      btn.classList.add('pulse');
      setTimeout(()=>btn.classList.remove('pulse'), 350);
    });
  });

  // react to system theme change when auto
  if(window.matchMedia){
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{
      const saved = localStorage.getItem(KEY) || 'auto';
      if(saved === 'auto') apply(resolve('auto'));
    });
  }
})();
