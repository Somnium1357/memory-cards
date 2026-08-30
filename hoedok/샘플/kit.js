
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
      /* 왼쪽이 중첩 구조면 자식 상자가 아니라 본문 항목(.term/.mid)의 글자 중앙을 잰다 */
      var marks = left.querySelectorAll('.term,.mid');
      var a, b;
      if(marks.length >= 2){
        a = marks[0].getBoundingClientRect();
        b = marks[marks.length-1].getBoundingClientRect();
      } else {
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

