
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
    document.querySelectorAll('.converge').forEach(function(c){
      var kids = c.children, svg = null, left = null;
      for (var i=0;i<kids.length;i++){
        if (kids[i].tagName.toLowerCase()==='svg'){ svg = kids[i]; break; }
        left = kids[i];
      }
      if(!svg || !left) return;
      var h = left.getBoundingClientRect().height;
      if(!h) return;
      svg.setAttribute('preserveAspectRatio','none');
      svg.style.height = h.toFixed(1)+'px';
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
      var a = box.children[0].getBoundingClientRect();
      var b = box.children[box.children.length-1].getBoundingClientRect();
      var l = (a.left + a.width/2) - fb.left, r = (b.left + b.width/2) - fb.left;
      var mid = (l + r) / 2;
      var d1 = mk.querySelector('.d1'), d2 = mk.querySelector('.d2');
      if(d1){ d1.style.left = l+'px'; d1.style.width = Math.max(1, mid-l)+'px'; }
      if(d2){ d2.style.left = mid+'px'; d2.style.width = Math.max(1, r-mid)+'px'; }
    });
  }
  function all(){ fitBrace(); fitDown(); }
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(all);
  window.addEventListener('load', all);
  window.addEventListener('resize', all);
  all();
})();
