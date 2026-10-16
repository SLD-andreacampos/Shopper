const q=document.querySelector('#search');
if(q){
  q.addEventListener('input',e=>{
    const s=e.target.value.toLowerCase();
    document.querySelectorAll('.nav a,.module-card').forEach(x=>x.hidden=!x.textContent.toLowerCase().includes(s));
  });
}

const sidebar=document.querySelector('.sidebar');
document.querySelector('.menu-btn')?.addEventListener('click',()=>sidebar?.classList.toggle('open'));
addEventListener('keydown',e=>{
  if(e.key==='/'&&!/input/i.test(document.activeElement.tagName)){
    e.preventDefault();
    q?.focus();
  }
});

const article=document.querySelector('article');
const headings=article?[...article.querySelectorAll(':scope > h2')]:[];
if(article&&headings.length){
  const used=new Set();
  const slugify=text=>{
    const base=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'seccion';
    let slug=base;
    let suffix=2;
    while(used.has(slug)||document.getElementById(slug)) slug=`${base}-${suffix++}`;
    used.add(slug);
    return slug;
  };
  headings.forEach(h=>{if(!h.id)h.id=slugify(h.textContent.trim())});

  const links=headings.map(h=>`<li><a href="#${h.id}">${h.textContent.trim()}</a></li>`).join('');
  const sectionNav=document.createElement('nav');
  sectionNav.className='section-nav';
  sectionNav.setAttribute('aria-label','Contenido de este módulo');
  sectionNav.innerHTML=`<strong>En este módulo</strong><ol>${links}</ol>`;
  const introCard=article.querySelector(':scope > .card');
  const lede=article.querySelector(':scope > .lede');
  (introCard||lede||article.firstElementChild)?.insertAdjacentElement('afterend',sectionNav);

  const activeModule=document.querySelector('.nav > a.active');
  if(activeModule){
    const submenu=document.createElement('nav');
    submenu.className='nav-submenu';
    submenu.setAttribute('aria-label',`Apartados de ${activeModule.textContent.trim()}`);
    submenu.innerHTML=links.replaceAll('<li>','').replaceAll('</li>','');
    activeModule.insertAdjacentElement('afterend',submenu);

    const sectionLinks=[...submenu.querySelectorAll('a')];
    const markCurrent=id=>sectionLinks.forEach(link=>link.classList.toggle('current',link.hash===`#${id}`));
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if(visible)markCurrent(visible.target.id);
    },{rootMargin:'-18% 0px -68% 0px'});
    headings.forEach(h=>observer.observe(h));
  }

  document.querySelectorAll('.section-nav a,.nav-submenu a').forEach(link=>link.addEventListener('click',event=>{
    const target=document.querySelector(link.hash);
    if(target){
      event.preventDefault();
      const top=target.getBoundingClientRect().top+window.scrollY-70;
      window.scrollTo({top,behavior:'instant'});
      history.replaceState(null,'',link.hash);
      document.querySelectorAll('.nav-submenu a').forEach(item=>item.classList.toggle('current',item.hash===link.hash));
    }
    sidebar?.classList.remove('open');
  }));
}
