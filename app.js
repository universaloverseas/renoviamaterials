/* ============================================================
   RENOVIA — shared interactions (multi-page)
   ============================================================ */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__renovia = {scroll:0};

  /* ---------- WebGL core ---------- */
  function initThree(){
    const canvas = document.getElementById('bg-canvas');
    if(reduce || !canvas || typeof THREE === 'undefined') return;
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060D0A, 0.05);
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

    const EM = new THREE.Color(0x1FA876), TE = new THREE.Color(0x15D6C0), AM = new THREE.Color(0xF4B740);

    const core = new THREE.Group();
    scene.add(core);

    const icoGeo = new THREE.IcosahedronGeometry(2.6, 1);
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(icoGeo),
      new THREE.LineBasicMaterial({color:TE, transparent:true, opacity:.5})
    );
    core.add(wire);

    const solid = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.55, 1),
      new THREE.MeshBasicMaterial({color:0x0B6E4F, transparent:true, opacity:.12, side:THREE.DoubleSide})
    );
    core.add(solid);

    const shellN = 900, sp = new Float32Array(shellN*3);
    for(let i=0;i<shellN;i++){
      const r = 3.2 + Math.random()*0.5;
      const th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
      sp[i*3]   = r*Math.sin(ph)*Math.cos(th);
      sp[i*3+1] = r*Math.sin(ph)*Math.sin(th);
      sp[i*3+2] = r*Math.cos(ph);
    }
    const shellGeo = new THREE.BufferGeometry();
    shellGeo.setAttribute('position', new THREE.BufferAttribute(sp,3));
    const shell = new THREE.Points(shellGeo, new THREE.PointsMaterial({
      color:TE, size:0.035, transparent:true, opacity:.7, sizeAttenuation:true
    }));
    core.add(shell);

    const ringMat = c => new THREE.MeshBasicMaterial({color:c, transparent:true, opacity:.55});
    const rings = [];
    [[3.6,EM],[4.2,TE],[4.8,AM]].forEach((d,i)=>{
      const ring = new THREE.Mesh(new THREE.TorusGeometry(d[0],0.012,8,128), ringMat(d[1]));
      ring.rotation.x = Math.PI/2 + i*0.5;
      ring.rotation.y = i*0.7;
      core.add(ring); rings.push(ring);
    });

    const starN = 1400, st = new Float32Array(starN*3);
    for(let i=0;i<starN;i++){
      st[i*3]   = (Math.random()-0.5)*60;
      st[i*3+1] = (Math.random()-0.5)*60;
      st[i*3+2] = (Math.random()-0.5)*40 - 10;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(st,3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color:0x6FBF9F, size:0.05, transparent:true, opacity:.45
    }));
    scene.add(stars);

    const pointer = {x:0,y:0}, target = {x:0,y:0};
    window.addEventListener('pointermove', e=>{
      target.x = (e.clientX/window.innerWidth - 0.5);
      target.y = (e.clientY/window.innerHeight - 0.5);
    }, {passive:true});

    const clock = new THREE.Clock();
    function tick(){
      const t = clock.getElapsedTime();
      const s = window.__renovia.scroll;
      core.rotation.y = t*0.12 + s*Math.PI*1.4;
      core.rotation.x = Math.sin(t*0.18)*0.15 + s*0.5;
      wire.rotation.y = t*0.05;
      shell.rotation.y = -t*0.04;
      rings.forEach((r,i)=>{ r.rotation.z = t*(0.2+i*0.12)*(i%2?1:-1); });
      stars.rotation.y = t*0.01;
      const breathe = 1 + Math.sin(t*0.8)*0.015;
      core.scale.setScalar(breathe*(1 - s*0.12));
      camera.position.z = 11 + s*4.5;
      const cc = new THREE.Color().copy(EM).lerp(TE, Math.min(s*2,1));
      if(s>0.5) cc.lerp(AM, (s-0.5)*2*0.6);
      wire.material.color.copy(cc);
      pointer.x += (target.x - pointer.x)*0.04;
      pointer.y += (target.y - pointer.y)*0.04;
      camera.position.x += (pointer.x*2.4 - camera.position.x)*0.05;
      camera.position.y += (-pointer.y*1.6 + s*1.2 - camera.position.y)*0.05;
      camera.lookAt(0,0,0);
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
    window.addEventListener('resize', ()=>{
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, {passive:true});
  }
  initThree();

  /* ---------- header + progress ---------- */
  const hdr=document.getElementById('hdr'), progress=document.getElementById('progress');
  function onScroll(){
    if(hdr)hdr.classList.toggle('scrolled', window.scrollY>20);
    const h=document.documentElement, max=h.scrollHeight-h.clientHeight;
    const p=max>0?window.scrollY/max:0;
    if(progress)progress.style.width=(p*100)+'%';
    window.__renovia.scroll=p;
    if(scrollspy)scrollspy();
  }

  /* ---------- mobile menu ---------- */
  const burger=document.getElementById('burger'), mmenu=document.getElementById('mmenu');
  if(burger&&mmenu){burger.addEventListener('click',()=>{const open=mmenu.classList.toggle('open');burger.setAttribute('aria-expanded',open);});}

  /* ---------- mega menu (click for touch) ---------- */
  const trigger=document.querySelector('.nav-trigger'),mega=document.querySelector('.mega');
  if(trigger&&mega){
    trigger.addEventListener('click',(e)=>{e.stopPropagation();const open=mega.classList.toggle('open');trigger.setAttribute('aria-expanded',open);});
    document.addEventListener('click',(e)=>{if(!e.target.closest('.has-mega')){mega.classList.remove('open');trigger.setAttribute('aria-expanded','false');}});
  }

  /* ---------- scrollspy (home only) ---------- */
  let scrollspy=null;
  const spyLinks=[].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if(spyLinks.length){
    scrollspy=function(){
      let cur='';
      ['industries','sustainability','why','solutions'].forEach(id=>{
        const el=document.getElementById(id);
        if(!cur && el && el.getBoundingClientRect().top<=window.innerHeight*0.42)cur=id;
      });
      spyLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
    };
  }
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  /* ---------- GSAP reveals ---------- */
  function fallbackReveal(){
    const ro=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target);}});},{threshold:.12});
    document.querySelectorAll('.reveal').forEach(r=>ro.observe(r));
  }
  if(!reduce && typeof gsap!=='undefined' && typeof ScrollTrigger!=='undefined'){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal').forEach(el=>{
      if(el.classList.contains('in'))return;
      gsap.fromTo(el,{y:34,opacity:0},{y:0,opacity:1,duration:.9,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 86%',toggleActions:'play none none none'}});
    });
    ['#prodGrid .card','.why .three .item','.ind-grid .tile','.metrics .metric'].forEach(sel=>{
      const items=gsap.utils.toArray(sel); if(!items.length)return;
      gsap.fromTo(items,{y:40,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',stagger:.08,
        scrollTrigger:{trigger:items[0].parentElement,start:'top 82%'}});
    });
    const st=document.getElementById('statement');
    if(st){gsap.fromTo(st.querySelector('h2'),{scale:.88},{scale:1,ease:'none',
      scrollTrigger:{trigger:st,start:'top bottom',end:'center center',scrub:.6}});}
  } else if(reduce){
    document.querySelectorAll('.reveal').forEach(r=>r.classList.add('in'));
  } else { fallbackReveal(); }

  /* ---------- counters ---------- */
  function fmt(n,target){const dec=(target%1!==0)?1:0;return n.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});}
  function runCounter(el){const target=parseFloat(el.dataset.target),suf=el.dataset.suf||'';const dur=1400,t0=performance.now();
    function step(t){const p=Math.min((t-t0)/dur,1);const eased=1-Math.pow(1-p,3);
      el.innerHTML=fmt(target*eased,target)+'<span class="suf">'+suf+'</span>';if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);}
  const counters=document.querySelectorAll('[data-target]');
  if(counters.length){
    const co=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){runCounter(e.target);co.unobserve(e.target);}});},{threshold:.5});
    counters.forEach(el=>co.observe(el));
  }

  /* ---------- cycle ring spin ---------- */
  if(!reduce){
    const ring=document.querySelector('.cycle-spin');
    if(ring){let a=0;(function spin(){a=(a+0.4)%360;ring.style.transform='rotate('+a+'deg)';requestAnimationFrame(spin);})();}
  }

  /* ---------- solution filters ---------- */
  const chips=document.querySelectorAll('.chip'),cards=document.querySelectorAll('#prodGrid .card');
  if(chips.length){chips.forEach(c=>c.addEventListener('click',()=>{chips.forEach(x=>x.classList.remove('active'));c.classList.add('active');
    const f=c.dataset.filter;cards.forEach(card=>{card.classList.toggle('hide',!(f==='all'||card.dataset.cat===f));});
    if(typeof ScrollTrigger!=='undefined')ScrollTrigger.refresh();}));}

  /* ---------- morph words (home) ---------- */
  const words=["plastic waste","spent bottles","scrap metal","end-of-life parts","industrial offcuts"];
  let wi=0;const morphEl=document.getElementById('morph');
  if(morphEl&&!reduce){setInterval(()=>{morphEl.classList.add('out');setTimeout(()=>{wi=(wi+1)%words.length;morphEl.textContent=words[wi];morphEl.classList.remove('out');},400);},2200);}

  /* ---------- cursor glow ---------- */
  const glow=document.getElementById('cursor-glow');
  if(glow && window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce){
    let gx=innerWidth/2,gy=innerHeight/2,cx=gx,cy=gy;
    window.addEventListener('pointermove',e=>{gx=e.clientX;gy=e.clientY;},{passive:true});
    (function loop(){cx+=(gx-cx)*0.2;cy+=(gy-cy)*0.2;
      glow.style.transform='translate('+cx+'px,'+cy+'px) translate(-50%,-50%)';requestAnimationFrame(loop);})();
    document.addEventListener('pointerover',e=>{
      const hov=e.target.closest('a,button,.card,.tile,.chip,input,select,textarea');
      glow.style.width=hov?'58px':'36px';glow.style.height=hov?'58px':'36px';});
  }

  /* ---------- lead form (delegated → emails via FormSubmit endpoint) ---------- */
  document.addEventListener('submit',(e)=>{
    const form=e.target; if(!form||form.id!=='leadForm')return; e.preventDefault();
    const reqIds=['f-name','f-company','f-email','f-interest']; let ok=true;
    reqIds.forEach(id=>{const inp=form.querySelector('#'+id);if(!inp)return;const field=inp.closest('.field');
      let bad=!inp.value.trim();
      if(id==='f-email'&&inp.value.trim()){bad=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());}
      field.classList.toggle('invalid',bad);if(bad)ok=false;});
    if(!ok)return;
    const msg=form.querySelector('#formMsg'), note=form.querySelector('#formNote'),
          btn=form.querySelector('button[type="submit"]'), endpoint=form.getAttribute('data-endpoint');
    const val=id=>{const el=form.querySelector('#'+id);return el?el.value.trim():'';};
    const showSuccess=()=>{form.querySelectorAll('.field').forEach(f=>{if(!f.querySelector('.form-msg'))f.style.display='none';});
      if(note)note.style.display='none';
      if(msg){msg.classList.add('show');msg.scrollIntoView({behavior:'smooth',block:'center'});}};
    if(note){note.style.display='none';note.textContent='';}
    if(!endpoint){showSuccess();return;}  /* no endpoint set → acknowledge only */
    const payload={name:val('f-name'),company:val('f-company'),email:val('f-email'),
      interest:val('f-interest'),message:val('f-msg'),
      _honey:(form.querySelector('[name="_honey"]')||{}).value||'',
      _cc:'universaloverseas96@gmail.com',
      _subject:'New enquiry — renoviamaterials.com',_template:'table',_captcha:'false'};
    if(btn){btn.dataset.html=btn.innerHTML;btn.disabled=true;btn.textContent='Sending…';}
    fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)})
      .then(r=>r.ok?r.json().catch(()=>({})):Promise.reject(r))
      .then(()=>showSuccess())
      .catch(()=>{if(note){note.style.display='block';
        note.innerHTML='Couldn’t send right now — please email <a href="mailto:info@renoviamaterials.com">info@renoviamaterials.com</a> or call +91&nbsp;6351171932.';}})
      .finally(()=>{if(btn){btn.disabled=false;if(btn.dataset.html)btn.innerHTML=btn.dataset.html;}});
  });
})();
