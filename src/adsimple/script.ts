// @ts-nocheck
import { sendLeadToTelegram } from "../lib/telegram.functions";

export function initAdsimple(): () => void {
  const cleanups: Array<() => void> = [];

  // scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  }, {threshold:0.12});
  revealEls.forEach(el=>io.observe(el));

  // faq accordion
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(o=>{ o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight=null; });
      if(!isOpen){ item.classList.add('open'); a.style.maxHeight = a.scrollHeight+'px'; }
    });
  });

  // mobile nav
  const style = document.createElement('style');
  style.innerHTML = `@media (max-width:900px){ .navlinks.mobile-open{ display:flex; flex-direction:column; position:fixed; top:73px; left:0; right:0; background:var(--ink); padding:24px 32px; gap:18px; border-bottom:1px solid var(--line);} .navlinks.mobile-open .mobile-cta-link{ display:inline-block; color:var(--ink); background:var(--volt); padding:12px 16px; margin-top:6px; width:fit-content; } }`;
  document.head.appendChild(style);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- phone country code auto-detect ----------
  const codeSelect = document.getElementById('countryCode');
  if (codeSelect) {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const cc = data && data.country_code;
        if (!cc) return;
        const opt = codeSelect.querySelector(`option[data-country="${cc}"]`);
        if (opt) codeSelect.value = opt.value;
      })
      .catch(() => {});
  }

  // ---------- scroll progress bar ----------
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  // ---------- hero video background ----------
  const heroVideo = document.getElementById('heroVideo');
  const heroSection = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ heroVideo.play().catch(()=>{}); }
      else { heroVideo.pause(); }
    });
  }, {threshold:0}).observe(heroSection);

  // ---------- scroll: progress bar + hero depth zoom + shape parallax ----------
  const shapes = document.querySelectorAll('.shape[data-speed]');
  function onScroll(){
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY;
    progressBar.style.width = (scrollY/docH*100) + '%';

    const heroH = heroSection.offsetHeight;
    if(scrollY < heroH){
      const progress = scrollY / heroH;
      if(!reduceMotion){
        heroVideo.style.transform = `scale(${1 + progress*0.2})`;
        heroContent.style.transform = `translateY(${scrollY*0.32}px)`;
      }
      heroContent.style.opacity = Math.max(1 - progress*1.3, 0);
    }

    if(!reduceMotion){
      shapes.forEach(el=>{
        const speed = parseFloat(el.dataset.speed);
        const rect = el.getBoundingClientRect();
        const dist = (rect.top + rect.height/2) - window.innerHeight/2;
        el.style.transform = `translateY(${dist*speed}px) rotate(${dist*speed*0.4}deg)`;
      });
    }
    rafScroll = null;
  }
  let rafScroll = null;
  window.addEventListener('scroll', ()=>{ if(!rafScroll){ rafScroll = requestAnimationFrame(onScroll); } }, {passive:true});
  onScroll();

  // ---------- case carousel nav ----------
  const caseCarousel = document.getElementById('caseCarousel');
  const casePrev = document.getElementById('casePrev');
  const caseNext = document.getElementById('caseNext');
  if(caseCarousel && casePrev && caseNext){
    const scrollAmount = () => (caseCarousel.querySelector('.case-card')?.offsetWidth || 320) + 20;
    casePrev.addEventListener('click', ()=> caseCarousel.scrollBy({left:-scrollAmount(), behavior:'smooth'}));
    caseNext.addEventListener('click', ()=> caseCarousel.scrollBy({left:scrollAmount(), behavior:'smooth'}));
  }

  // ---------- custom cursor ----------
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const fineHover = window.matchMedia('(pointer: fine)').matches;
  if(fineHover && cursorDot && cursorRing){
    document.documentElement.classList.add('custom-cursor-on');
    cursorRing.classList.add('active');
    let mx = window.innerWidth/2, my = window.innerHeight/2;
    let rx = mx, ry = my;
    document.addEventListener('mousemove', (e)=>{
      mx = e.clientX; my = e.clientY;
      cursorDot.style.left = mx+'px';
      cursorDot.style.top = my+'px';
    });
    function ringLoop(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      cursorRing.style.left = rx+'px';
      cursorRing.style.top = ry+'px';
      requestAnimationFrame(ringLoop);
    }
    ringLoop();
    document.querySelectorAll('a, button, .case-card, .price-card, input, .faq-q, .service-card').forEach(el=>{
      el.addEventListener('mouseenter', ()=> document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', ()=> document.body.classList.remove('cursor-hover'));
    });
    document.addEventListener('mouseleave', ()=>{ cursorDot.style.opacity='0'; cursorRing.style.opacity='0'; });
    document.addEventListener('mouseenter', ()=>{ cursorDot.style.opacity='1'; cursorRing.style.opacity='1'; });
  }

  // ---------- animated count-up numbers (case cards) ----------
  const countEls = document.querySelectorAll('.count');
  function formatCount(val, decimals){
    const fixed = decimals ? val.toFixed(decimals) : Math.round(val).toString();
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  function runCount(el){
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1300;
    const start = performance.now();
    function step(now){
      const t = Math.min((now-start)/duration, 1);
      const eased = 1 - Math.pow(1-t, 3);
      const current = target * eased;
      el.textContent = prefix + formatCount(current, decimals) + suffix;
      if(t < 1){ requestAnimationFrame(step); }
      else { el.textContent = prefix + formatCount(target, decimals) + suffix; }
    }
    requestAnimationFrame(step);
  }
  if(countEls.length){
    if(reduceMotion){
      countEls.forEach(el=>{
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        el.textContent = (el.dataset.prefix||'') + formatCount(target, decimals) + (el.dataset.suffix||'');
      });
    } else {
      const countIO = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){ runCount(entry.target); countIO.unobserve(entry.target); }
        });
      }, {threshold:0.6});
      countEls.forEach(el=>countIO.observe(el));
    }
  }

  // ---------- metric panel tilt on mouse move ----------
  const metricPanel = document.getElementById('metricPanel');
  if(metricPanel && !reduceMotion){
    heroSection.addEventListener('mousemove', (e)=>{
      const rect = metricPanel.getBoundingClientRect();
      const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx)/rect.width, dy = (e.clientY - cy)/rect.height;
      metricPanel.style.transform = `perspective(700px) rotateX(${dy*-8}deg) rotateY(${dx*8}deg)`;
    });
    heroSection.addEventListener('mouseleave', ()=>{ metricPanel.style.transform = 'none'; });
  }
  return () => cleanups.forEach(fn => fn());
}
