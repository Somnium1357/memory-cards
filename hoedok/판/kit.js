
/* ── 절 카드 (09-24 개편 · 앱 디자인 언어) — 절 제목(h2)·대주제 배너(.part)는 카드 바깥, 그 뒤 내용은 .sect 카드 한 장.
   조립기의 쪽(.pg) 구조와 앵커는 그대로 — 쪽이 절 경계에 걸리면 쪽 껍데기를 복제해 양쪽 카드에 나눠 담는다(id 는 첫 조각만).
   🔴 다른 스크립트(눈금·꺾쇠·접기)보다 먼저 돈다 — 재배치 뒤의 자리를 재야 한다. ── */
(function(){
  var main=document.querySelector('main.wrap'); if(!main) return;
  var pgs=[].slice.call(main.querySelectorAll(':scope > section.pg')); if(!pgs.length) return;
  var foot=main.querySelector(':scope > .foot');
  var card=null;
  pgs.forEach(function(pg){
    var nodes=[].slice.call(pg.childNodes);
    while(pg.firstChild) pg.removeChild(pg.firstChild);
    pg.parentNode.removeChild(pg);
    var host=null, used=false;
    nodes.forEach(function(n){
      if(n.nodeType===3 && !n.textContent.trim()) return;
      var head=n.nodeType===1 && (n.tagName==='H2' || n.classList.contains('part'));
      if(head){
        if(!used){ main.insertBefore(pg, foot); used=true; }   /* 제목만 있는 쪽 — 쪽 id 는 빈 표지로 남긴다 */
        main.insertBefore(n, foot); card=null; host=null; return;
      }
      if(!card){ card=document.createElement('div'); card.className='sect'; main.insertBefore(card, foot); host=null; }
      if(!host){ if(used){ host=pg.cloneNode(false); host.removeAttribute('id'); } else { host=pg; used=true; } card.appendChild(host); }
      host.appendChild(n);
    });
    if(!used) main.insertBefore(pg, foot);
  });
})();

/* ── 치트시트 스킨(v2 · 09-29) — 절 카드 안을 h3 단위 블록 격자로. 조립기가 켠 과목(:root.v2)에서만.
   쪽(.pg)은 display:contents 로 두고(쪽 id 보존) 쪽 안에서 h3 마다 새 블록 · 첫 h3 앞 내용 = 레이블 없는 블록.
   넓은 부품(표·산문·수렴·가로 줄·여러 단·그림)이 든 블록은 전폭(.full). 🔴 눈금·꺾쇠 실측보다 먼저 돈다. ── */
(function(){
  if(!document.documentElement.classList.contains('v2')) return;
  /* 09-29 동하 「단이랑 위계를 좀 유연하게」(사회 각론 = h3 하나에 h4 수십 · 두 칸이 좁은 칸에서 가로 스크롤):
     ① h4 소단원이 둘 이상인 블록은 h3 레이블을 위에 걸치고 소단원(.sg)을 격자 칸으로 흘린다(.subs = 전폭 · 안쪽도 같은 격자)
     ② 칸 폭은 고정하지 않는다 — 그린 뒤 넘치는 칸만 필요한 만큼 2칸·전폭으로 넓힌다(fitSpans). 전폭 고정은 산문뿐. */
  /* 09-30 동하 「어디서는 성취기준별로, 어디서는 중단원별로 끊잖아 — 위계를 맞춰」:
     ⑤ 쪽 이음새 — 절 안에서 제목(h3) 없이 시작하는 쪽은 앞 칸의 이어짐이다(따로 칸을 세우지 않는다 · 쪽은 display:contents 라 순서 무변)
     ⑥ 각론 — h4 에 성취기준 코드([4사01-01] 꼴)가 있으면 하나뿐이어도 단원(h3) = 전폭 머리줄 · 성취기준 = 칸(.std).
        노트가 3학년은 h2 단원 > h3 성취기준, 4학년부터는 h3 단원 > h4 성취기준이라 칸 단위가 섞이던 것을 「칸 = 성취기준」 하나로 */
  var STD=/\[\d+[가-힣]+\s?\d{2}-\d{2}\]/;
  document.querySelectorAll('main.wrap .sect').forEach(function(sect){
    var last=null;
    sect.querySelectorAll(':scope > .pg').forEach(function(pg){
      var kids=[].slice.call(pg.childNodes), blk=null, first=true;
      kids.forEach(function(n){
        if(n.nodeType===3 && !n.textContent.trim()){ pg.removeChild(n); return; }
        var h3=n.nodeType===1 && n.tagName==='H3';
        if(h3) blk=null;
        if(!blk){
          if(first && last && !h3) blk=last;
          else { blk=document.createElement('div'); blk.className='blk'; pg.insertBefore(blk,n); }
        }
        first=false;
        blk.appendChild(n);
      });
      var bs=pg.querySelectorAll(':scope > .blk'); if(bs.length) last=bs[bs.length-1];
    });
  });
  document.querySelectorAll('main.wrap .sect > .pg').forEach(function(pg){
    pg.querySelectorAll(':scope > .blk').forEach(function(b){
      if(!b.querySelector(':scope > h3')) b.classList.add('nolab');
      if(b.querySelector(':scope > .prose, :scope > * > .prose')) b.classList.add('full');
      var h4s=b.querySelectorAll(':scope > h4:not(.lab)');
      var hd=b.firstElementChild;
      if(hd && hd.tagName==='H3' && !(h4s.length>=2 || [].some.call(h4s, function(h){ return STD.test(h.textContent); }))){
        /* ③ 과 같은 제목·본문 두 줄 subgrid — 칸 = h3 블록인 곳(3학년 성취기준 등)도 같은 줄 제목 높이를 맞춘다 */
        var bb=document.createElement('div'); bb.className='blb';
        while(hd.nextSibling) bb.appendChild(hd.nextSibling);
        b.appendChild(bb); b.classList.add('ttl');
      }
      var std=[].some.call(h4s, function(h){ return STD.test(h.textContent); });
      if(h4s.length>=2 || std){
        b.classList.add('subs'); if(std) b.classList.add('std'); var sg=null;
        [].slice.call(b.childNodes).forEach(function(n){
          if(n.nodeType!==1) return;
          if(n.tagName==='H3') return;
          if(n.tagName==='H4' && !n.classList.contains('lab')) sg=null;
          if(!sg){ sg=document.createElement('div'); sg.className='sg'+(n.tagName==='H4'?'':' lead'); b.insertBefore(sg,n); }
          sg.appendChild(n);
        });
        /* 09-30 동하 「3단 높이가 첫 단만 달라」·「긴 칸 옆이 텅 빔」:
           ③ 소단원 = 제목 + 본문(.sgb) 두 줄 subgrid — 같은 줄 칸끼리 제목 높이를 맞춰 본문 첫 줄이 가지런하다
           ④ 본문 최상위 갈래(레이블 + 들여쓴 하위)를 .grp 로 묶어 둔다 — 평소엔 display:contents(배치 무변),
              형제 칸보다 훨씬 긴 칸만 .split = 제목 전폭 + 갈래를 단으로(노트 위계대로 · splitTall 실측) */
        b.querySelectorAll(':scope > .sg:not(.lead)').forEach(function(sg){
          var h=sg.firstElementChild; if(!h || h.tagName!=='H4') return;
          var body=document.createElement('div'); body.className='sgb';
          while(h.nextSibling) body.appendChild(h.nextSibling);
          sg.appendChild(body);
          var st=body.querySelector(':scope > .ind2 > .stack, :scope > .stack'); if(!st) return;
          var g=null, k=0;
          [].slice.call(st.children).forEach(function(n){
            if(n.classList.contains('ind') && g){ if(!g.classList.contains('k')){ g.classList.add('k'); k++; } g.appendChild(n); return; }
            g=document.createElement('div'); g.className='grp'; st.insertBefore(g,n); g.appendChild(n);
          });
          if(k>=2){ sg.classList.add('cansplit'); st.classList.add('grps'); }
        });
      }
    });
  });
  /* 각론 절 안에서 성취기준 대신 다른 줄기로 짠 단원(6-1 「통일, 민주화, 산업화 — 내용 조직 다름」)도 같은 단원 위계로 */
  document.querySelectorAll('main.wrap .sect').forEach(function(s){
    if(s.querySelector('.blk.std')) s.querySelectorAll('.blk.subs:not(.std)').forEach(function(b){ if(b.querySelector(':scope > h3')) b.classList.add('std'); });
  });
  function cols(g){ return getComputedStyle(g).gridTemplateColumns.split(' ').length; }
  function splitTall(){
    document.querySelectorAll('main.wrap .sg.split').forEach(function(s){ s.classList.remove('split'); });
    fitSpans();
    document.querySelectorAll('main.wrap .subs').forEach(function(b){
      if(cols(b)<2) return;
      var sgs=[].slice.call(b.querySelectorAll(':scope > .sg:not(.lead)')); if(sgs.length<2) return;
      var hs=sgs.map(function(s){ var x=s.querySelector(':scope > .sgb'); return x ? x.getBoundingClientRect().height : 0; });
      var med=hs.slice().sort(function(a,c){ return a-c; })[Math.floor(hs.length/2)];
      sgs.forEach(function(s,i){
        if(s.classList.contains('cansplit') && hs[i]>2.2*med && hs[i]>innerHeight*.6) s.classList.add('split');
      });
    });
    /* 갈래를 단으로 세운 뒤에도 한 갈래만 훨씬 길면(11-01 「가계와 기업의 역할」) 그 갈래는 전폭 ·
       그 안에서 형제 가지(.branch 둘 이상)가 선 가장 얕은 줄기만 단으로 — 위의 설명 줄은 전폭 그대로 */
    document.querySelectorAll('main.wrap .grp.wide').forEach(function(g){ g.classList.remove('wide'); });
    document.querySelectorAll('main.wrap .bgrid').forEach(function(x){ x.classList.remove('bgrid'); });
    document.querySelectorAll('main.wrap .sg.split .grps').forEach(function(st){
      var gs=[].slice.call(st.querySelectorAll(':scope > .grp')); if(gs.length<2) return;
      var hs=gs.map(function(g){ return g.getBoundingClientRect().height; });
      gs.forEach(function(g,i){
        var rest=hs.filter(function(_,j){ return j!==i; }).sort(function(a,c){ return a-c; });
        if(hs[i] <= 2*rest[Math.floor(rest.length/2)]) return;
        var best=null;
        g.querySelectorAll('.stack').forEach(function(x){
          if(best) return;
          if([].filter.call(x.children, function(c){ return c.classList.contains('branch'); }).length>=2) best=x;
        });
        if(best){ g.classList.add('wide'); best.classList.add('bgrid'); }
      });
    });
    fitSpans();
  }
  function fitSpans(){
    document.querySelectorAll('main.wrap .blk:not(.subs):not(.full):not(.nolab), main.wrap .sg:not(.lead)').forEach(function(c){ c.style.gridColumn=''; });
    document.querySelectorAll('main.wrap .blk:not(.subs):not(.full):not(.nolab), main.wrap .sg:not(.lead):not(.split)').forEach(function(c){
      var g=c.parentElement.closest('.sect, .subs'); if(!g) return;
      var n=cols(g); if(n<2) return;
      var need=c.scrollWidth-c.clientWidth;
      c.querySelectorAll('.cols,.wide,.line,table,.lanes,.vchain,ol.steps,.fork,.branch').forEach(function(e){
        need=Math.max(need, e.scrollWidth-e.clientWidth);
      });
      if(need>2){
        var w=c.getBoundingClientRect().width, gap=parseFloat(getComputedStyle(g).columnGap)||0, one=(g.clientWidth-gap*(n-1))/n;
        var span=Math.min(n, Math.ceil((w+need+gap)/(one+gap)));
        c.style.gridColumn = span>=n ? '1/-1' : 'span '+span;
      }
    });
  }
  splitTall();
  var t=null; function again(){ splitTall(); window.dispatchEvent(new Event('resize')); }
  window.addEventListener('load', again);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(again);
  window.addEventListener('resize', function(){ clearTimeout(t); t=setTimeout(splitTall,120); });
})();

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
      /* 🔴 marginTop 은 flex 컨테이너(.converge) 위끝 기준이다 — 왼쪽 묶음 위끝 기준으로 재면
         오른쪽 묶음이 더 높을 때(align-items:center 로 왼쪽이 내려앉는다) 브레이스가 그 차이만큼
         떠오른다. 두 자리 실측 후 고침 (2026-09-01 · 수학 p23 · 음악 p07, 둘 다 -17.5px). */
      var cb = c.getBoundingClientRect();
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
        svg.style.marginTop = ((a.top + a.height/2) - cb.top).toFixed(1)+'px';
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
      svg.style.marginTop = ((a.top + a.height/2) - cb.top).toFixed(1)+'px';
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

/* 테마 — 카드앱 설정을 그대로 따른다(같은 origin · 09-24 개편). 판에는 테마 단추가 없다(내용 화면 · 동하 09-24).
   cards_theme_v1 = white|paper|dark|auto(없음) · 옛 값 b→dark · c→paper. 자동이면 data-theme 을 비우고
   cards_light_v1(white|paper)을 data-light 에 — kit.css 가 기기 라이트/다크에 맞춰 고른다. 앱이 다른 탭에서 바꾸면 따라 바뀐다. */
(function(){
  var root=document.documentElement;
  function apply(){
    var v=null, l=null;
    try{ v=localStorage.getItem('cards_theme_v1'); l=localStorage.getItem('cards_light_v1'); }catch(e){}
    if(v==='b') v='dark'; else if(v==='c') v='paper';
    if(v==='white'||v==='paper'||v==='dark') root.dataset.theme=v; else root.removeAttribute('data-theme');
    if(l==='white'||l==='paper') root.dataset.light=l; else root.removeAttribute('data-light');
  }
  apply();
  window.addEventListener('storage',function(e){ if(!e.key||/^cards_(theme|light)_v1$/.test(e.key)) apply(); });
})();


/* 구조 선 svg 는 전부 장식이다 — 일괄로 스크린리더에서 뺀다 */
document.querySelectorAll('.mkf svg,.mkd svg,.converge>svg,.fork svg,.fig svg').forEach(function(e){
  e.setAttribute('aria-hidden','true');});


/* ── 위키 v3 (09-01) — 절 접기 + 해시 자동 펼침 + 우측 서랍 목차(아이콘 버튼) ── */
(function(){
  var main=document.querySelector('main.wrap'); if(!main) return;
  /* 09-24: 절 제목은 카드 바깥(main 직계) · 내용은 .sect > .pg > * — 둘 다 문서 순서로 */
  var flow=[].slice.call(document.querySelectorAll('main.wrap > h2, main.wrap > .part, main.wrap .pg > *'));
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
    if(h.tagName==='H2'){ for(var s=h.nextElementSibling; s&&s.tagName!=='H2'&&!s.classList.contains('part')&&!s.classList.contains('foot'); s=s.nextElementSibling){ if(s.classList.contains('sect')) s.classList.toggle('clpsd',closed); } }
    rangeOf(h).forEach(function(e){
      if(closed){e.classList.add('clpsd');}
      else{e.classList.remove('clpsd');
        if(e.tagName==='H3'&&e.classList.contains('closed'))
          rangeOf(e).forEach(function(x){x.classList.add('clpsd');});}
    });}
  [].slice.call(document.querySelectorAll('main.wrap > h2, main.wrap .pg > h2, main.wrap .pg > h3'))
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
  /* 목차 — 왼쪽 유리 패널 · 🔴 기본 접힘(09-24 동하 「회독본은 내용요소 — distraction 없게」) · 과목마다 마지막 상태 기억.
     가로 1000px 이상에선 본문을 밀고(목차를 띄운 채 읽기), 좁으면 겹쳐 뜨고 링크를 누르면 닫힌다. */
  var sb=document.querySelector('.sidebar');
  if(sb){
    var h1=document.querySelector('main.wrap h1'), KEY='pan_side_'+(h1?h1.textContent.trim():'');
    var btn=document.createElement('button'); btn.className='tocbtn'; btn.title='목차'; btn.setAttribute('aria-label','목차');
    btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M9 4.5v15"/></svg>';
    var scrim=document.createElement('div'); scrim.className='scrim';
    function wide(){ return window.innerWidth>=1000; }
    function setOpen(o,save){sb.classList.toggle('open',o); document.body.classList.toggle('tocopen',o); btn.setAttribute('aria-expanded',o?'true':'false');
      if(save){ try{ localStorage.setItem(KEY,o?'1':'0'); }catch(e){} } }
    btn.addEventListener('click',function(){setOpen(!sb.classList.contains('open'),true);});
    scrim.addEventListener('click',function(){setOpen(false,true);});
    var tv=sb.querySelector('.toc-view'), lv=sb.querySelector('.list-view');
    sb.addEventListener('click',function(ev){
      var sw=ev.target.closest('.toc-switch');
      if(sw&&tv&&lv){ev.preventDefault(); tv.hidden=true; lv.hidden=false; return;}
      var bk=ev.target.closest('.toc-back');
      if(bk){ev.preventDefault(); if(tv&&lv){lv.hidden=true; tv.hidden=false;} return;}
      if(ev.target.closest('a')&&!wide())setOpen(false,false);});
    document.body.appendChild(btn); document.body.appendChild(scrim);
    var saved=null; try{ saved=localStorage.getItem(KEY); }catch(e){}
    setOpen(saved==='1'&&wide(),false);
  }
})();

/* ── 눈금 실측 (09-01) — bracket/kids 자식마다 라벨 첫 글줄 중앙을 재서 --tick 으로 ── */
(function(){
  function firstLineCenter(el){
    var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),n;
    while((n=w.nextNode())){
      if(n.textContent.trim()){
        var r=document.createRange(); r.selectNodeContents(n);
        var rects=r.getClientRects();
        if(rects.length) return rects[0].top+rects[0].height/2;
      }
    }
    var b=el.getBoundingClientRect(); return b.top+b.height/2;
  }
  function fitTicks(){
    var kids=document.querySelectorAll('.bracket > *, .kids > *');
    for(var i=0;i<kids.length;i++){
      var ch=kids[i];
      if(ch.tagName==='svg'||ch.tagName==='SVG')continue;
      var src=ch;
      if(ch.classList.contains('branch')&&ch.firstElementChild) src=ch.firstElementChild;
      else if(ch.classList.contains('bsub')){ch.style.removeProperty('--tick');continue;}
      var y=firstLineCenter(src)-ch.getBoundingClientRect().top;
      if(isFinite(y)&&y>0) ch.style.setProperty('--tick', y.toFixed(1)+'px');
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fitTicks);
  else fitTicks();
  window.addEventListener('load',fitTicks);
  var t; window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(fitTicks,150);});
})();
