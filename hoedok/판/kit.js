
/* 꺾쇠 팔 맞추기 — 첫 항목·끝 항목의 세로 중앙에 팔 끝을 붙인다.
   CSS 로는 자식 높이를 알 수 없어서 재서 넣는다. 레이아웃만 읽고 아무것도 저장하지 않는다. */
(function(){
  function fit(){
    document.querySelectorAll('.fork').forEach(function(f){
      var mk = f.querySelector(':scope > .mkf');
      var box = f.querySelector(':scope > .mkf ~ *');
      if(!mk || !box) return;
      var kids = box.children;
      if(!kids.length) return;
      var fb = f.getBoundingClientRect();
      var a = kids[0].getBoundingClientRect();
      var b = kids[kids.length-1].getBoundingClientRect();
      var top = (a.top + a.height/2) - fb.top;
      var bot = fb.bottom - (b.top + b.height/2);
      mk.style.setProperty('--t', top.toFixed(1) + 'px');
      mk.style.setProperty('--b', bot.toFixed(1) + 'px');
      var s1 = mk.querySelector('.a1'), s2 = mk.querySelector('.a2');
      var mid = (fb.height - top - bot) / 2 + top;
      if(s1){ s1.style.top = top + 'px'; s1.style.height = (mid - top) + 'px'; }
      if(s2){ s2.style.top = mid + 'px'; s2.style.height = (fb.height - bot - mid) + 'px'; }
    });
  }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
  window.addEventListener('resize', fit);
  fit();
})();


/* .converge 브레이스 — 왼쪽 묶음 높이에 맞춘다. 손으로 px 을 박지 않아도 되게. */
(function(){
  function fitBrace(){
    /* 🔴 감싸지 않는다 — 브레이스 끝이 첫 항목·끝 항목의 글자 중앙에 와야 한다.
       왼쪽 묶음 전체 높이로 늘이면 첫·끝 줄을 감싸 보인다(fork 와 같은 문제였다). */
    document.querySelectorAll('.converge').forEach(function(c){
      var kids = c.children, svg = null, left = null;
      for (var i=0;i<kids.length;i++){
        if (kids[i].tagName.toLowerCase()==='svg'){ svg = kids[i]; break; }
        left = kids[i];
      }
      if(!svg || !left || !left.children.length) return;
      var lb = left.getBoundingClientRect();
      var a, b;
      /* 🔴 명시 계약 (2026-08-31): 조각이 브레이스가 감쌀 첫 항목에 data-b="s", 끝 항목에
         data-b="e"(하나뿐이면 "se")를 단다 — kit 은 그 둘만 잰다. 아래 추측 사슬은 표시가
         없는 옛 조각용 비상망이다 (추측은 세 번 틀렸다: 체육 p02·영어 p02·p03). */
      var ms = left.querySelector('[data-b="s"],[data-b="se"]');
      var me = left.querySelector('[data-b="e"],[data-b="se"]');
      if (ms && me){
        a = ms.getBoundingClientRect();
        b = me.getBoundingClientRect();
        var top0 = (a.top + a.height/2) - lb.top;
        var bot0 = lb.bottom - (b.top + b.height/2);
        var h0 = Math.max(8, lb.height - top0 - bot0);
        svg.setAttribute('preserveAspectRatio','none');
        svg.style.height = h0.toFixed(1)+'px';
        svg.style.alignSelf = 'flex-start';
        svg.style.marginTop = top0.toFixed(1)+'px';
        if(!svg.style.width) svg.style.width = '11px';
        svg.querySelectorAll('path,line').forEach(function(e){
          e.setAttribute('vector-effect','non-scaling-stroke'); });
        return;
      }
      /* — 이하 비상망(추측 사슬) — 왼쪽이 중첩 구조면 본문 항목(.term/.mid)의 글자 중앙을 잰다 */
      var marks = left.querySelectorAll('.term,.mid');
      if(marks.length >= 2){
        a = marks[0].getBoundingClientRect();
        b = marks[marks.length-1].getBoundingClientRect();
        /* 마크들이 한 가로줄에 있으면(.line/.lanes) 세로 폭이 0 — 목록 폴백으로 넘어간다
           (영어 p02·p03 실사고 2026-08-31: 브레이스가 8px 로 주저앉았다) */
        if (Math.abs((b.top + b.height/2) - (a.top + a.height/2)) < 8) marks = [];
      }
      if(marks.length < 2){
        /* .term/.mid 가 없으면 왼쪽 안의 「세로 목록」(.bracket/.stack/.kids, 항목 2+)을 찾아
           그 첫·끝 항목을 잰다 — 왼쪽이 라벨+목록의 가로 묶음(.branch)이면 직계 자식은 가로
           형제라 첫·끝 중앙이 같은 점이 되어 브레이스가 8px 로 주저앉는다 (체육 p02 실사고) */
        var list = null;
        var cands = left.querySelectorAll('.bracket,.stack,.kids');
        for (var ci = 0; ci < cands.length; ci++){
          if (cands[ci].children.length >= 2){ list = cands[ci]; break; }
        }
        if (!list){
          list = left;
          while (list.children.length === 1 && list.firstElementChild &&
                 list.firstElementChild.children.length) list = list.firstElementChild;
        }
        var ks = list.children;
        a = ks[0].getBoundingClientRect();
        b = ks[ks.length-1].getBoundingClientRect();
      }
      if (Math.abs((b.top + b.height/2) - (a.top + a.height/2)) < 8){
        /* 목록마저 한 가로줄(.line 등) — 왼쪽 상자의 첫 줄·끝 줄 중앙으로 근사한다 */
        a = { top: lb.top, height: 24 };
        b = { top: lb.bottom - 24, height: 24 };
      }
      var top = (a.top + a.height/2) - lb.top;
      var bot = lb.bottom - (b.top + b.height/2);
      var h = Math.max(8, lb.height - top - bot);
      svg.setAttribute('preserveAspectRatio','none');
      svg.style.height = h.toFixed(1)+'px';
      svg.style.alignSelf = 'flex-start';
      svg.style.marginTop = top.toFixed(1)+'px';
      if(!svg.style.width) svg.style.width = '11px';
      svg.querySelectorAll('path,line').forEach(function(e){
        e.setAttribute('vector-effect','non-scaling-stroke'); });
    });
  }
  /* 아래로 갈라지는 꺾쇠 — 팔 끝을 첫·끝 갈래의 가로 중앙에 맞춘다. */
  function fitDown(){
    document.querySelectorAll('.forkdown').forEach(function(f){
      var mk = f.querySelector(':scope > .mkd');
      var box = f.querySelector(':scope > .mkd ~ *');
      if(!mk || !box || !box.children.length) return;
      var fb = mk.getBoundingClientRect();
      /* 팔 끝은 갈래 「상자」가 아니라 「머리(첫 줄 라벨)」의 가로 중앙에 — 내용이 넓게 뻗은
         갈래에서 상자 중앙을 재면 팔이 옆으로 누워 형체를 잃는다 */
      function headRect(el){ var h = el.firstElementChild; return (h || el).getBoundingClientRect(); }
      var a = headRect(box.children[0]);
      var b = headRect(box.children[box.children.length-1]);
      var l = (a.left + a.width/2) - fb.left, r = (b.left + b.width/2) - fb.left;
      var mid = (l + r) / 2;
      var d1 = mk.querySelector('.d1'), d2 = mk.querySelector('.d2');
      /* 갈래가 넓어도 팔은 꼭짓점에서 70px 까지만 — 다 뻗으면 ∧ 가 누워서 형체를 잃는다 */
      var L = Math.max(l, mid-70), R = Math.min(r, mid+70);
      if(d1){ d1.style.left = L+'px'; d1.style.width = Math.max(1, mid-L)+'px'; }
      if(d2){ d2.style.left = mid+'px'; d2.style.width = Math.max(1, R-mid)+'px'; }
      var root = f.querySelector(':scope > .root');
      if(root){ root.style.marginLeft = Math.max(0, mid - root.offsetWidth/2)+'px'; }
    });
  }
  function all(){ fitBrace(); fitDown(); }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  window.addEventListener('load', all);
  window.addEventListener('resize', all);
  all();
})();

/* 테마 — 카드앱과 같은 저장소를 읽는다(같은 origin). 앱에서 고른 테마가 여기도 적용된다.
   저장값 없으면 시스템 설정. 우상단 버튼으로 여기서 바꾸면 앱에도 반영된다(같은 키). */
(function(){
  var KEY='cards_theme_v1';
  function cur(){
    try{ var v=localStorage.getItem(KEY); if(v==='b'||v==='c') return v; }catch(e){}
    return matchMedia('(prefers-color-scheme:light)').matches ? 'c' : 'b';
  }
  function apply(v){ document.documentElement.dataset.theme=v; }
  apply(cur());
  function mkBtn(){
    var b=document.createElement('button');
    b.id='themeBtn';
    b.setAttribute('aria-label','테마 전환');
    b.textContent = document.documentElement.dataset.theme==='b' ? '☀' : '☾';
    b.style.cssText='position:fixed;top:12px;right:12px;z-index:9;width:30px;height:30px;opacity:.92;'
      +'border:1px solid var(--hair);border-radius:50%;background:var(--bg);color:var(--dim);'
      +'font-size:15px;cursor:pointer;line-height:1;';
    b.onclick=function(){
      var v=document.documentElement.dataset.theme==='b'?'c':'b';
      apply(v); b.textContent=v==='b'?'☀':'☾';
      try{ localStorage.setItem(KEY,v); }catch(e){}
    };
    document.body.appendChild(b);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mkBtn);
  else mkBtn();
})();


/* 구조 선 svg 는 전부 장식이다 — 일괄로 스크린리더에서 뺀다 */
document.querySelectorAll('.mkf svg,.mkd svg,.converge>svg,.fork svg,.fig svg').forEach(function(e){
  e.setAttribute('aria-hidden','true');});


/* ── 위키 v3 (09-01) — 절 접기 + 해시 자동 펼침 + 우측 서랍 목차(아이콘 버튼) ── */
(function(){
  var main=document.querySelector('main.wrap'); if(!main) return;
  var flow=[].slice.call(document.querySelectorAll('main.wrap .pg > *'));
  function rangeOf(h){
    var i=flow.indexOf(h), out=[];
    for(var j=i+1;j<flow.length;j++){var e=flow[j];
      if(e.classList&&e.classList.contains('part'))break;
      if(e.tagName==='H2')break;
      if(h.tagName==='H3'&&e.tagName==='H3')break;
      out.push(e);}
    return out;}
  function setClosed(h,closed){
    h.classList.toggle('closed',closed);
    rangeOf(h).forEach(function(e){
      if(closed){e.classList.add('clpsd');}
      else{e.classList.remove('clpsd');
        if(e.tagName==='H3'&&e.classList.contains('closed'))
          rangeOf(e).forEach(function(x){x.classList.add('clpsd');});}
    });}
  [].slice.call(document.querySelectorAll('main.wrap .pg > h2, main.wrap .pg > h3'))
    .forEach(function(h){h.classList.add('tg');
      h.addEventListener('click',function(ev){
        if(ev.target.closest('a'))return;
        setClosed(h,!h.classList.contains('closed'));});});
  function expandTo(id){
    if(!id)return; var el=document.getElementById(id); if(!el)return;
    var node=el, i=flow.indexOf(node);
    while(i<0&&node&&node!==main){node=node.parentElement; i=flow.indexOf(node);}
    for(var j=i;j>=0;j--){var e=flow[j];
      if(e.tagName==='H3'||e.tagName==='H2'){
        if(e.classList.contains('closed'))setClosed(e,false);
        if(e.tagName==='H2')break;}}
    el.classList&&el.classList.remove('clpsd');}
  window.addEventListener('hashchange',function(){
    expandTo(decodeURIComponent(location.hash.slice(1)));});
  if(location.hash)expandTo(decodeURIComponent(location.hash.slice(1)));
  var sb=document.querySelector('.sidebar');
  if(sb){
    var btn=document.createElement('button'); btn.className='tocbtn'; btn.title='목차';
    btn.innerHTML='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 5h14M3 10h14M3 15h9"/></svg>';
    var scrim=document.createElement('div'); scrim.className='scrim';
    function setOpen(o){sb.classList.toggle('open',o); document.body.classList.toggle('tocopen',o);}
    btn.addEventListener('click',function(){setOpen(!sb.classList.contains('open'));});
    scrim.addEventListener('click',function(){setOpen(false);});
    var tv=sb.querySelector('.toc-view'), lv=sb.querySelector('.list-view');
    sb.addEventListener('click',function(ev){
      var sw=ev.target.closest('.toc-switch');
      if(sw&&tv&&lv){ev.preventDefault(); tv.hidden=true; lv.hidden=false; return;}
      var bk=ev.target.closest('.toc-back');
      if(bk){ev.preventDefault(); if(tv&&lv){lv.hidden=true; tv.hidden=false;} return;}
      if(ev.target.closest('a'))setOpen(false);});
    document.body.appendChild(btn); document.body.appendChild(scrim);
  }
})();
