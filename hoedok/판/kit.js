
/* 09-30 성취기준 이름 덧붙이기 — 조각의 제목 바로 뒤 <div class="hname"> 를 화면에서만 제목 끝에 「 – 이름」으로(제목 글자·id·목차 무변 · 동하 「이름 없으면 적당히 뽑아서 붙여야」) */
(function(){
  document.querySelectorAll('main.wrap .hname').forEach(function(d){
    var h=d.previousElementSibling;
    if(h && /^H[1-6]$/.test(h.tagName)){ var s=document.createElement('span'); s.className='hname'; s.textContent=' – '+d.textContent.trim(); h.appendChild(s); }
    d.remove();
  });
})();

/* 10-09 동하(폰 가독성) — 용어 안 손 줄바꿈 <br>(패드 옆 칸과 높이 맞춤용 · 「원의 넓이 구하는<br>식 만들기」)을
   넓은 화면에선 줄바꿈 · 폰(≤560px)에선 띄어쓰기로 서는 .tbr 로 바꾼다(kit.css). 패드 화면은 1px 도 안 움직인다(수학 9,509 요소 실측). */
(function(){
  document.querySelectorAll('main .term br').forEach(function(b){
    var s=document.createElement('span'); s.className='tbr'; s.textContent=' '; b.parentNode.replaceChild(s,b);
  });
})();

/* ── 절 카드 (09-24 개편 · 앱 디자인 언어) — 절 제목(h2)·대주제 배너(.part)는 카드 바깥, 그 뒤 내용은 .sect 카드 한 장.
   조립기의 쪽(.pg) 구조와 앵커는 그대로 — 쪽이 절 경계에 걸리면 쪽 껍데기를 복제해 양쪽 카드에 나눠 담는다(id 는 첫 조각만).
   🔴 다른 스크립트(눈금·꺾쇠·접기)보다 먼저 돈다 — 재배치 뒤의 자리를 재야 한다. ── */
(function(){
  var main=document.querySelector('main.wrap'); if(!main) return;
  var pgs=[].slice.call(main.querySelectorAll(':scope > section.pg')); if(!pgs.length) return;
  var foot=main.querySelector(':scope > .foot');
  var card=null, inRun=false, afterHead=false;
  pgs.forEach(function(pg){
    var nodes=[].slice.call(pg.childNodes);
    while(pg.firstChild) pg.removeChild(pg.firstChild);
    pg.parentNode.removeChild(pg);
    var host=null, used=false;
    nodes.forEach(function(n){
      if(n.nodeType===3 && !n.textContent.trim()) return;
      /* 09-30 판정 표가 h2 에 칸·글칸·안을 준 곳(체육 5~6 스포츠 · 실과 교수·학습 방법 등 짧은 절 여럿)은 카드를 끊지 않는다 — 앞 절 격자의 칸 */
      var RL=window.PAN_ROLE, r2=(RL && n.nodeType===1 && n.tagName==='H2') ? RL[n.id] : '';
      /* 09-30 완성: 머리줄 h2 도 카드를 끊지 않는다 — 절 모양으로 크게 나와 한 층 위로 보이던 것(국어 사실적·추론적 읽기 · 사회는 확정 배치라 그대로) */
      var headRow = r2==='머리줄' && window.PAN_HOIST!==false;
      var head=n.nodeType===1 && ((n.tagName==='H2' && !(r2==='칸' || r2==='글칸' || r2==='안' || headRow)) || n.classList.contains('part'));
      if(head){
        if(!used){ main.insertBefore(pg, foot); used=true; }   /* 제목만 있는 쪽 — 쪽 id 는 빈 표지로 남긴다 */
        main.insertBefore(n, foot); card=null; host=null; inRun=false; return;
      }
      /* 칸 h2 가 연달아 시작되는 곳 = 새 격자(제목 없이) — 앞 절 격자에 이어 붙어 그 절 소속처럼 보이던 것(체육 5~6 스포츠 09-30) */
      var isCellH2 = n.nodeType===1 && n.tagName==='H2' && (r2==='칸' || r2==='글칸');
      /* 단, 바로 앞이 절·머리줄 제목이면 그 절의 칸이다(체육 전략형 절 밑 야구형~승마 · 09-30 완성 · 사회 제외) */
      if(isCellH2 && !inRun && !(afterHead && window.PAN_HOIST!==false)){ card=null; host=null; }
      var isHeadRole=n.nodeType===1 && /^H[234]$/.test(n.tagName) && RL && (RL[n.id]==='절' || RL[n.id]==='머리줄');
      if(isCellH2) inRun=true; else if(isHeadRole && n.tagName!=='H2') inRun=false;
      if(n.nodeType===1) afterHead=isHeadRole;
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
  /* 본문 최상위 갈래(레이블 + 들여쓴 하위)를 .grp 로 묶어 둔다 — 평소 display:contents · 긴 칸만 .split 때 단으로 */
  /* 10-10 QC: 갈래로 쪼갤 줄기는 블록 자식이 하나라도 있을 때만 — 「용어 : 설명」 한 줄짜리 .ind(자식 = <span>·글자뿐)를
     span 마다 .grp 로 감싸 세 줄로 깨던 것(10-09 수학 「0의 역할」 · 국어 「예 : 로미오와 줄리엣」 · 조각에서 <div> 로 감싸 피했던 것의 근본 수리).
     종전 기준(자식 요소 둘 이상)은 그대로 두고 「전부 인라인」만 뺀다 — 숨은 메모 span·빈 앵커가 섞인 줄기(도덕 「기원·효과」 · 총창 「자율·자치활동」)는 종전대로 */
  var BLK=/^(DIV|UL|OL|TABLE|P|FIGURE|SECTION|DL|PRE|BLOCKQUOTE|DETAILS|H[1-6]|HR)$/;
  function blk(x){
    if(!x || x.children.length<2) return false;
    return [].some.call(x.children, function(c){ return BLK.test(c.tagName); });
  }
  function wrapGrps(cell, body){
    /* 쪽 이음새로 끊긴 같은 겉싸개(.ind2>.stack · .ind2 · .stack)를 하나로 — 6사03-01 「인권」이 다음 쪽(p19)에서 새 겉싸개로 시작 */
    var sig=function(e){ if(!e || e.nodeType!==1) return ''; var s=e.className; if(e.children.length===1 && e.firstElementChild.classList.contains('stack')) s+='>stack'; return s; };
    [].slice.call(body.children).forEach(function(e){
      var p=e.previousElementSibling;
      if(!p || !/^(ind2|stack)(>stack)?$/.test(sig(e)) || sig(p)!==sig(e)) return;
      var from=/>stack$/.test(sig(e)) ? e.firstElementChild : e, to=/>stack$/.test(sig(p)) ? p.firstElementChild : p;
      while(from.firstChild) to.appendChild(from.firstChild);
      e.remove();
    });
    /* 09-30 과목 확대 — 칸 안에 「안」 제목이 둘 이상이면 안마다 한 갈래(제목 + 그 뒤 내용) · 칸 본문이 곧 줄기
       (수학 「도형의 기초」 배경|핵심 · 과학 「순환 학습 모형」 5E|POE · 체육 야구형 셋이 전폭 한 단으로 쌓이던 것) */
    var ins=body.querySelectorAll(':scope > .r-in');
    if(ins.length>=2){
      /* 첫 안 앞 글(칸 자신의 설명)은 줄기 밖 — 단 위 전폭(과학 순환 학습 모형 설명이 5E 단 머리에 붙던 것) */
      var box=document.createElement('div'); box.className='grps'; body.insertBefore(box, ins[0]);
      var cur=null;
      [].slice.call(body.childNodes).forEach(function(n){
        if(!cur && n!==ins[0]) return;
        if(n===box) return;
        if(n.nodeType!==1){ if(cur) cur.appendChild(n); return; }
        if(n.classList.contains('r-in')){ cur=document.createElement('div'); cur.className='grp k ingrp'; box.appendChild(cur); }
        cur.appendChild(n);
      });
      cell.classList.add('cansplit');
      return;
    }
    /* 갈래 담는 줄기 — .ind2>.stack · .stack · .ind2(4사05-01처럼 stack 없이 바로) · .ind>.stack · .ind 중 자식 둘 이상인 첫 것 */
    var st=null;
    [':scope > .ind2 > .stack', ':scope > .stack', ':scope > .ind2', ':scope > .ind > .stack', ':scope > .ind'].some(function(q){
      var x=body.querySelector(q); if(blk(x)){ st=x; return true; } return false; });
    if(!st) return;
    var g=null, k=0, n0=0;
    [].slice.call(st.children).forEach(function(n){
      if(n.classList.contains('ind') && g){ if(!g.classList.contains('k')){ g.classList.add('k'); k++; } g.appendChild(n); return; }
      g=document.createElement('div'); g.className='grp'; st.insertBefore(g,n); g.appendChild(n); n0++;
    });
    st.classList.add('grps');
    if(k>=2) cell.classList.add('cansplit');
    /* 안쪽 갈래도 「레이블 + 들여쓴 내용」을 한 덩어리로(단에 나눌 때 레이블만 떨어지던 것 — 6사03-01 「위계」·11-01 「경제」) · 두 겹까지 */
    (function nest(parent, d){
      if(d>2) return;
      parent.querySelectorAll(':scope > .grp.k').forEach(function(gp){
        var inner=gp.querySelector(':scope > .ind > .stack') || gp.querySelector(':scope > .ind'); if(!blk(inner)) return;
        var g2=null, has=false;
        [].slice.call(inner.children).forEach(function(x){
          if(x.classList.contains('ind') && g2){ g2.classList.add('k'); has=true; g2.appendChild(x); return; }
          g2=document.createElement('div'); g2.className='grp'; inner.insertBefore(g2,x); g2.appendChild(x);
        });
        inner.classList.add('grps2'); gp._inner=inner;
        nest(inner, d+1);
      });
    })(st, 1);
  }
  /* ⑦ 09-30 동하 「기계적으로 자르지 말고 모델이 훑어보고 위계 맞춰 재조직」 — 조립기가 모델 판정 표(window.PAN_ROLE ·
     제목 id → 대단/절/머리줄/칸/안)를 실어 주면 제목 태그가 아니라 그 역할로 칸을 세운다.
     절·머리줄·대단 = 전폭 머리줄(.hrow) · 칸 = 제목 + 본문(.blb) · 안·표에 없는 제목·글 = 지금 칸에 그대로 · 쪽 이음새는 앞 칸에 잇는다 */
  var ROLE=window.PAN_ROLE;
  /* ⑨ 09-30 동하 「단계가 어디는 세로 어디는 가로 제각각」 → 「설명 있으면 세로, 없으면 가로」:
     · 화살표로 잇는 가로 줄(.line)에 설명(.up/.down)이 있으면 = 세로 사슬(단계 | 설명)로 세움(원래 줄은 숨겨 둔다 — 글자·화살표 보존)
     · 설명 없는 세로 사슬(.vchain)·번호 목록(ol.steps) = 가로 화살표 줄(.hz) */
  document.querySelectorAll('main.wrap .line').forEach(function(line){
    var cols=[].slice.call(line.children);
    var arrow=cols.some(function(c){ var m=c.querySelector('.mid.mk'); return m && /[→⇒⟶]/.test(m.textContent); });
    var ann=[].some.call(line.querySelectorAll('.up,.down'), function(x){ return x.textContent.trim(); });
    if(!arrow || !ann) return;
    var v=document.createElement('div'); v.className='vchain conv'; var first=true;
    cols.forEach(function(c){
      var mid=c.querySelector('.mid'); if(!mid || mid.classList.contains('mk')) return;
      if(!first){ var a=document.createElement('div'); a.className='arw'; a.textContent='↓'; a.setAttribute('aria-hidden','true'); v.appendChild(a); }
      first=false;
      var s=document.createElement('div'); s.className='stp'; s.appendChild(mid); v.appendChild(s);
      var an=[].filter.call(c.querySelectorAll('.up,.down'), function(x){ return x.textContent.trim(); });
      if(an.length){ var d=document.createElement('div'); d.className='ann'; an.forEach(function(x){ d.appendChild(x); }); v.appendChild(d); }
    });
    line.parentNode.insertBefore(v, line); line.style.display='none';   /* hidden 속성은 스킨 display:flex 에 진다 */
  });
  /* ⑩ 09-30 동하 「당구장 표시 같은 각주들은 빼 줘」·「(동하 수정) 이런 것도 빼고」 — 화면에서만 숨김(글자는 남는다):
        · ※ 로 시작하는 줄은 통째로 · 글 중간의 ※… 는 그 글 끝까지 · 「(동하 …)」 괄호 메모
     ⑪ 「짧은 연쇄는 줄바꿈 없이」(추체험 학습 「이해 → 재사고 → 표현」·시간 표현·나선형 원리) — 화살표 셋 이하 연쇄를 한 덩어리(.nw)로 */
  (function(){
    var main=document.querySelector('main.wrap'); if(!main) return;
    var wrapRange=function(n, a, b, cls){ var mid=n.splitText(a); mid.splitText(b-a); var sp=document.createElement('span'); sp.className=cls; mid.parentNode.insertBefore(sp, mid); sp.appendChild(mid); return sp; };
    main.querySelectorAll('div, li').forEach(function(el){
      if(el.children.length>6) return;
      var t=el.textContent.trim();
      if(t.charAt(0)==='※' && !el.querySelector('div, li')) el.classList.add('memo');
      /* 09-30 과목 확대 검수 — 작업 메모 줄(「동하 손글씨 …」·「여백 라벨 …」·「구조 메모」·「학습 지침(손글씨)」·「「가. 성격」 구역은 동하 …」) 통째로 */
      else if(!el.querySelector('div, li') && (/^(\[[^\]]+\]\s*)?(동하 (손글씨|마킹)|여백 라벨|구조 메모|학습 지침)/.test(t) || /^「[^」]+」\s*(절|구역)은 동하/.test(t) || /^.{0,22}(동하 메모|손글씨 「)/.test(t))) el.classList.add('memo');
    });
    var tw=document.createTreeWalker(main, NodeFilter.SHOW_TEXT), list=[], x;
    while((x=tw.nextNode())) list.push(x);
    list.forEach(function(n){
      if(!n.parentNode || (n.parentElement && n.parentElement.closest('.memo, h1, script, style, svg'))) return;   /* svg 안 <text> 는 건너뜀 — HTML span 으로 감싸면 글자가 사라진다(10-01 뒤르켐 도식 「→」 연쇄 소실) */
      var s=n.textContent, m, inH=n.parentElement && n.parentElement.closest('h2, h3, h4');   /* 제목 안은 메모만 숨긴다(「(운동 — 손글씨 라벨)」) */
      /* 괄호 메모 = 「(동하 …)」·「(09-01 동하 확정)」·「(구멍 09-27)」 — 「이동하기」 같은 낱말 속 「동하」는 아님 */
      if((m=/\((?:구멍\s*\d\d-\d\d|(?:[^()]*[^가-힣()])?동하(?![가-힣])[^()]*)\)/.exec(s))){ wrapRange(n, m.index, m.index+m[0].length, 'memo'); return; }
      /* 「(손글씨 라벨)」 통째 · 「(운동 — 손글씨 라벨)」·「(손글씨 라벨 — 지리/일사/역사)」는 메모 말만(내용 낱말은 남김) */
      if((m=/\(손글씨 라벨\)|\s*—\s*손글씨 라벨|손글씨 라벨\s*—\s*/.exec(s))){ wrapRange(n, m.index, m.index+m[0].length, 'memo'); return; }
      /* 「(※표 — 전부 암기 지정)」 같은 암기 지정 메모(10-01 독립검수 M7 · 음악 요소 제목 — 글자를 지우면 제목 id·카드 링크가 바뀌어 표시만 끔) */
      if((m=/\s*\(※[^()]*(?:암기|지정)[^()]*\)/.exec(s))){ wrapRange(n, m.index, m.index+m[0].length, 'memo'); return; }
      if(inH) return;
      var i=s.indexOf('※'); if(i>0){ wrapRange(n, i, s.length, 'memo'); return; }
      m=/[^\s→,;()·]+(?:\s[^\s→,;()·]+)?\s*→\s*[^\s→,;()·]+(?:\s*→\s*[^\s→,;()·]+){1,2}/.exec(s);
      if(m && (m[0].match(/→/g)||[]).length<=3) wrapRange(n, m.index, m.index+m[0].length, 'nw');
    });
    /* 목차 링크 글자에서도 같은 암기 지정 메모를 뗀다(표시만 · href 무변 · M7) */
    document.querySelectorAll('nav a, .list-view a, .tochead a').forEach(function(a){ var s=a.textContent, r=s.replace(/\s*\(※[^()]*(?:암기|지정)[^()]*\)/, ''); if(r!==s && a.children.length===0) a.textContent=r; });
    main.querySelectorAll('table').forEach(function(t){ var f=t.querySelector('tr > *'); if(f && !f.textContent.trim()) t.classList.add('rh'); });   /* 첫 칸 빈 표 = 행 머리 표 */
    /* 짧은 괄호 덧말(12자 이하)은 쪼개지 않는다 — 「STAD (집·성·분 / ·오)」 줄 끝 쪼개짐(09-30) */
    main.querySelectorAll('.quiet').forEach(function(q){ var s=q.textContent.trim(); if(s.length<=12 && /^\(.*\)$/.test(s)) q.classList.add('nw'); });
    /* 부품 연쇄(가로 줄·가로로 눕힌 사슬·번호 목록)도 단계 셋 이하면 한 덩어리 */
    main.querySelectorAll('.line, .vchain.hz, ol.steps.hz, .chain').forEach(function(c){
      var steps=c.classList.contains('line') ? [].filter.call(c.children, function(k){ var m=k.querySelector('.mid'); return m && !m.classList.contains('mk'); }).length
              : c.classList.contains('chain') ? c.querySelectorAll(':scope > .arrow').length+1
              : c.querySelectorAll(':scope > .stp, :scope > li').length;
      if(steps && steps<=3) c.classList.add('nw');
    });
  })();
  document.querySelectorAll('main.wrap .vchain:not(.conv)').forEach(function(v){
    if(v.classList.contains('keepv')) return;   /* 10-10 동하 판 훑기(사회 원형·상황·뱅크스): 표지 단 사슬은 설명 없어도 세로 그대로 */
    if(![].some.call(v.querySelectorAll('.ann'), function(x){ return x.textContent.trim(); })) v.classList.add('hz');
  });
  /* 나무 압축(09-30 동하 「가로 트리 전부 이상함」 → 샘플 → 「수학은 괜찮은데 국어는 나열하면 안 될 것(시점)이 나열로」) — 기본 켬(PAN_CTREE=false 로 끔)
     ① 끝가지만 달린 가지 = 한 줄(레이블 + 끝가지를 「·」로) ② 맨 위 가지 = 칸 머리 ③ 선 없음 · 들여쓰기 = 층 */
  if(window.PAN_CTREE!==false){   /* 09-30 동하 「수학은 괜찮은데」 → 기본으로 켬 */
    var isTree=function(x){ return x.classList && (x.classList.contains('bracket') || x.classList.contains('kids')); };
    var kidsOf=function(b){ return [].find.call(b.children, isTree); };
    document.querySelectorAll('main.wrap .bracket, main.wrap .kids').forEach(function(tr){
      if(tr.parentElement.closest('.bracket, .kids')) return;
      if(!tr.querySelector('.branch .branch')) return;   /* 두 층 이상만 */
      tr.classList.add('ctree');
      tr.querySelectorAll('.branch').forEach(function(b){
        var k=kidsOf(b); if(!k || !k.children.length) return;
        /* 이름만 있는 끝가지만 한 줄로 — 「이름 — 설명」이 달린 끝가지(국어 시점 「1인칭 주인공 시점 — 내면심리묘사 O」)는 나열하지 않는다(동하 09-30) */
        var leaves=[].every.call(k.children, function(c){ return !c.querySelector('.branch, .bracket, .kids, .mk, .sub') && c.querySelectorAll('.term, .desc').length<=1 && c.textContent.trim().length<=24; });
        if(leaves && k.children.length<=4 && k.textContent.replace(/\s+/g,' ').trim().length<=70) b.classList.add('cline');   /* 끝가지 넷·70자 이하만 한 줄 */
      });
      /* 10-10 공개 제보(체육 학습과제 「개별 대상」): 형제 가지 중 하나라도 안 접히면 그 형제들도 접지 않는다 — 글자 수 한두 자 차이로
         「전체 대상」은 펼치고 「개별 대상」만 한 줄로 접혀 하위 관계가 안 보이던 것(같은 급 = 같은 모양) */
      tr.querySelectorAll('.bracket, .kids').forEach(function(k){
        var sib=[].filter.call(k.children, function(c){ return c.classList.contains('branch') && kidsOf(c); });
        if(sib.length>1 && sib.some(function(c){ return !c.classList.contains('cline'); })) sib.forEach(function(c){ c.classList.remove('cline'); });
      });
      (function(k){ var sib=[].filter.call(tr.children, function(c){ return c.classList.contains('branch') && kidsOf(c); });
        if(sib.length>1 && sib.some(function(c){ return !c.classList.contains('cline'); })) sib.forEach(function(c){ c.classList.remove('cline'); }); })();
      [].forEach.call(tr.children, function(c){ if(c.classList.contains('branch')) c.classList.add('ccell'); });
    });
  }
  /* 묶음 괄호(}) = 묶는 줄 높이에 맞춰 늘인다 — 그림 높이가 조각에 고정(56·84px)이라 줄이 접혀 길어지면 괄호가 짧아 「깨져」 보이던 것
     (동하 09-30 「합동변환 묶음선 깨짐 — 계속 문제되는데 왜 반복되지? 다시 안 생기도록」) */
  document.querySelectorAll('main.wrap .converge > svg, main.wrap .branch > svg').forEach(function(sv){
    if(sv.getAttribute('viewBox')!=='0 0 11 70') return;
    sv.setAttribute('preserveAspectRatio','none'); sv.classList.add('brace');
    sv.querySelectorAll('path').forEach(function(pt){ pt.setAttribute('vector-effect','non-scaling-stroke'); });
    var st=sv.previousElementSibling; if(st && st.classList.contains('stack')) [].forEach.call(st.children, function(k){ if(k.textContent.trim().length<=14) k.classList.add('nw'); });   /* 괄호 앞 짧은 이름은 접지 않는다(「대칭이동(뒤집기)」) */
    var w=document.createElement('span'); w.className='bracew'; sv.parentNode.insertBefore(w, sv); w.appendChild(sv);   /* 키 없는 틀 — 줄 높이만 따라간다(괄호 그림의 고유 비율이 줄을 늘리지 않게) */
  });
  /* 이름만 있고 내용 없는 항목(미술 조형 요소 「면」·「색」)은 그 묶음 끝 한 줄에 모은다 — 빈 칸 모음과 같은 뜻(동하 09-30 「모으고」) */
  document.querySelectorAll('main.wrap .cols').forEach(function(cl){
    var bare=[].filter.call(cl.querySelectorAll(':scope > .stack > .row'), function(r){
      if([].some.call(r.childNodes, function(n){ return n.nodeType===3 ? n.textContent.trim() : !(n.classList.contains('num') || n.classList.contains('term')); })) return false;
      var nx=r.nextElementSibling; return !(nx && (nx.classList.contains('ind') || nx.classList.contains('bracket') || nx.classList.contains('kids')));
    });
    if(bare.length<2 || bare.length===cl.querySelectorAll(':scope > .stack > .row').length) return;   /* 전부 이름뿐인 목록(수학 「특성」 8개)은 목록 그대로 */
    var g=document.createElement('div'); g.className='gath'; cl.parentNode.insertBefore(g, cl.nextSibling);
    bare.forEach(function(r){ g.appendChild(r); });
  });
  /* 판단 나무 줄(「X : 이름 : 설명」·「O : 질문?」) = 「X →」 머리 + 이름, 설명은 그 아래 들여쓰기 · 이음 「:」는 화면에서만 끔
     (09-30 동하 영어 말하기 「연습 단계 순서도가 좀 이상함」 → (가) 접힌 줄이 X·O 밑으로 빠지고 질문·이름·설명이 한 줄에 섞임) */
  document.querySelectorAll('main.wrap .kids > div, main.wrap .kids > .branch > div:first-child, main.wrap .bracket > div').forEach(function(r){
    var m=r.firstElementChild; if(!m || !m.classList.contains('mk') || !/^[XOxo○×]$/.test(m.textContent.trim())) return;
    var pre=m.previousSibling; if(pre && pre.nodeType===3 && pre.textContent.trim()) return;
    var b=document.createElement('span'); b.className='decb';
    while(m.nextSibling) b.appendChild(m.nextSibling);
    r.appendChild(b); r.classList.add('dec');
    var hide=function(t){ var s=document.createElement('span'); s.className='mk'; s.style.display='none'; t.parentNode.insertBefore(s,t); s.appendChild(t); };
    var f=b.firstChild; if(f && f.nodeType===3 && /^\s*:\s*$/.test(f.textContent)) hide(f);
    var tm=b.querySelector(':scope > .term');
    if(tm){ var c=tm.nextSibling; if(c && c.nodeType===3 && /^\s*:\s*$/.test(c.textContent)){ hide(c); var d=tm.nextElementSibling; while(d && d.classList.contains('mk')) d=d.nextElementSibling; if(d && d.classList.contains('desc')) d.classList.add('decd'); } }
    else b.classList.add('decq');
    var root=r.closest('.kids'); root=root && root.parentElement; while(root && root.parentElement && root.parentElement.closest('.kids')) root=root.parentElement.closest('.kids').parentElement;
    var q=root && root.classList.contains('branch') ? root.firstElementChild : null;   /* 맨 위 질문(「이해가 필요한가?」)도 같은 굵기 */
    if(q && /\?\s*$/.test(q.textContent)) q.classList.add('decq');
  });
  document.querySelectorAll('main.wrap ol.steps').forEach(function(o){
    if(![].some.call(o.querySelectorAll('.an'), function(x){ return x.textContent.trim(); })) o.classList.add('hz');
  });
  if(ROLE){
    var RC={'대단':'r-dae','절':'r-jeol','머리줄':'r-head','칸':'r-cell','글칸':'r-cell','안':'r-in','숨김':'r-hide','글':'r-line','끝':'r-end'};   /* 끝 = 단원 끝 블록 제목(성취기준 해설·적용 시 고려 사항) — 전폭 새 블록 · 모양은 안(10-01 독립검수 M3) */   /* 글 = 제목을 앞 머리줄 밑 한 줄 도입 글로(국어 토의 「개념 : …」 · 09-30) */   /* 숨김 = 화면에서만 접음(id·목차 링크는 산다 · 사회 학기 구분 — 동하 09-30) */
    /* 09-30 재조직: 역할 제목이 감싸개(div.ind 등) 안에 들어 있으면 쪽(.pg) 바로 밑으로 꺼낸다 — 감싸개를 제목 앞뒤로 갈라
       글자 순서는 그대로(체육 신체활동 예시 「역할 표에 뭘 적어도 한 줄기로 쌓임」 · 국어 97곳). 사회는 확정 배치라 끔(PAN_HOIST=false) */
    if(window.PAN_HOIST!==false) document.querySelectorAll('main.wrap h2[id], main.wrap h3[id], main.wrap h4[id]').forEach(function(h){
      var r=ROLE[h.id]; if(!r || r==='안' || r==='글') return;
      var pg=h.closest('.pg'); if(!pg) return;
      while(h.parentElement && h.parentElement!==pg){
        var P=h.parentElement, after=P.cloneNode(false); after.removeAttribute('id');
        while(h.nextSibling) after.appendChild(h.nextSibling);
        P.parentNode.insertBefore(h, P.nextSibling);
        if(after.textContent.trim() || after.querySelector('img,svg,table')) h.parentNode.insertBefore(after, h.nextSibling);
        if(!P.textContent.trim() && !P.querySelector('img,svg,table')) P.remove();
      }
    });
    document.querySelectorAll('main.wrap h2[id], main.wrap h3[id], main.wrap h4[id]').forEach(function(h){ var r=ROLE[h.id]; if(RC[r]) h.classList.add(RC[r]); });
    if(window.PAN_HOIST!==false) document.documentElement.classList.add('dae-big');
    /* 10-04 배포 검수 E6: 대주제 배너(.part) 뒤에 오는 대단 = 영역 밑 대단원(수학 「도형과 측정」 › 「평면도형」…) → 한 단 작게(.dae2 · 모양은 kit.css) */
    if(window.PAN_HOIST!==false){ var _p1=document.querySelector('main.wrap .part'); if(_p1) document.querySelectorAll('main.wrap h2.r-dae').forEach(function(h){ if(_p1.compareDocumentPosition(h) & 4) h.classList.add('dae2'); }); }
    /* 용어 뒤 관계 기호(↔ ⇔ + ≠)는 뜻이라 끄지 않는다 — .term+.mk 숨김은 구조 기호(⇒ → 등)만(10-01 음악 「창극 ↔ 판소리」·영어 「내용어 + Chunk」 · 사회 제외) */
    if(window.PAN_HOIST!==false) document.querySelectorAll('main.wrap .mk').forEach(function(m){ if(/^\s*(↔|⇔|\+|≠)\s*$/.test(m.textContent)) m.classList.add('rel'); });   /* 대단 h2 = 대주제 배너(.part)와 같은 모양(09-30 완성 · 사회는 작은 레이블 그대로) */
    var mk=function(cls, pg, before){ var d=document.createElement('div'); d.className=cls; pg.insertBefore(d, before); return d; };
    document.querySelectorAll('main.wrap .sect').forEach(function(sect){
      var cur=null, body=null;
      sect.querySelectorAll(':scope > .pg').forEach(function(pg){
        [].slice.call(pg.childNodes).forEach(function(n){
          if(n.nodeType===3 && !n.textContent.trim()){ pg.removeChild(n); return; }
          if(n.nodeType===8 && !cur && window.PAN_HOIST!==false) return;   /* 절 제목 뒤 주석이 빈 blk nolab 을 만들어 첫 칸이 25px 벌어지던 것(10-01 음악 8절 · 사회 제외) */
          var r=(n.nodeType===1 && /^H[234]$/.test(n.tagName)) ? (ROLE[n.id]||'') : '';
          if(r==='대단' || r==='절' || r==='머리줄' || r==='끝'){ cur=mk('blk full hrow'+(r==='끝'?' endb':''), pg, n); cur.appendChild(n); body=cur; return; }
          /* 글칸 = 서술문 칸 → 전폭 · 읽기 폭(46em) — 좁은 단에 긴 문장이 갇히던 것(사회 「기르고자 하는 시민」 09-30) */
          if(r==='칸' || r==='글칸'){ cur=mk('blk cell ttl'+(r==='글칸'?' full prosecell':''), pg, n); cur.appendChild(n); body=document.createElement('div'); body.className='blb'; cur.appendChild(body); return; }
          /* data-own = 제목 없는 도입 줄이 앞 칸(첫머리 성취기준 글칸)에 삼켜지지 않게 새 nolab 을 연다(10-03 미술·실과 첫머리) */
          if(!cur || (n.nodeType===1 && n.hasAttribute('data-own'))){ cur=mk('blk nolab', pg, n); body=cur; }
          body.appendChild(n);
        });
      });
      /* 같은 격자 칸 제목들이 「○○ - 」 앞머리를 되풀이하면 그 앞머리를 span.pfx 로 감싼다(글자 무변 · 모양은 CSS) — 09-30 체육 스포츠·실과 교수·학습 */
      var heads=[].map.call(sect.querySelectorAll('.blk.cell'), function(c){ return c.firstElementChild; });
      var cnt={}; heads.forEach(function(h){ var t=h.textContent.trim(), i=t.indexOf(' - '); if(i>0){ var p=t.slice(0,i+3); cnt[p]=(cnt[p]||0)+1; h._pfx=p; } });
      heads.forEach(function(h){
        if(!h._pfx || cnt[h._pfx]<2) return;
        var w=document.createTreeWalker(h, NodeFilter.SHOW_TEXT), n;
        while((n=w.nextNode())){ if(!n.textContent.trim() || (n.parentElement && n.parentElement.classList.contains('num'))) continue;
          var s=n.textContent, j=s.indexOf(h._pfx.trim().split(' - ')[0]); if(j<0) break;
          var k=s.indexOf(' - ', j); if(k<0) break;
          var rest=n.splitText(k+3); var pre=n; if(j>0) pre=n.splitText(j);
          var sp=document.createElement('span'); sp.className='pfx'; pre.parentNode.insertBefore(sp, pre); sp.appendChild(pre); break; }
      });
      /* 본문 없는 칸(내용이 제목에만 — 국어 평가 「선다형 평가」 등) 처리 방식 PAN_EMPTY: gather(단원의 빈 칸끼리 한 칸에 모음 · 단원 끝) /
         attach(앞 칸 끝에 이름표로) / label(이름표만 크게) / 없음(그대로). 09-30 동하 샘플 비교 중 */
      var EM=window.PAN_EMPTY!=null ? window.PAN_EMPTY : 'gather';   /* 동하 09-30 「빈칸은 모으는 쪽으로」 */
      if(EM){
        var isEmpty=function(c){ var b=c.querySelector(':scope > .blb'); return b && !b.textContent.trim() && !b.querySelector('img,svg,table'); };
        var units=[], u=[];
        [].forEach.call(sect.querySelectorAll(':scope > .pg > .blk'), function(b){ if(b.classList.contains('cell') && !b.classList.contains('full')) u.push(b); else { if(u.length) units.push(u); u=[]; } });
        if(u.length) units.push(u);
        units.forEach(function(un){
          var em=un.filter(isEmpty); if(!em.length) return;
          if(EM==='label'){ em.forEach(function(c){ c.classList.add('emptyc'); }); return; }
          if(EM==='attach'){
            em.forEach(function(c){
              var i=un.indexOf(c), host=null;
              for(var j=i-1;j>=0;j--) if(!isEmpty(un[j])){ host=un[j]; break; }
              if(!host) for(j=i+1;j<un.length;j++) if(!isEmpty(un[j])){ host=un[j]; break; }
              if(!host) return;
              var h=c.firstElementChild; h.classList.add('att'); var hb=host.querySelector(':scope > .blb');
              if(un.indexOf(host)<i) hb.appendChild(h); else hb.insertBefore(h, hb.firstChild);
              c.remove();
            });
            return;
          }
          /* 빈 칸 하나뿐 = 앞 칸 끝 이름표로(혼자 빈 칸이 떠 있던 것 · 09-30 수학 · 사회 제외) */
          if(EM==='gather' && em.length===1 && window.PAN_HOIST!==false){
            var c1=em[0], i1=un.indexOf(c1), host1=null;
            for(var j1=i1-1;j1>=0;j1--) if(!isEmpty(un[j1])){ host1=un[j1]; break; }
            if(host1){ var h1=c1.firstElementChild; h1.classList.add('att'); h1.classList.add('glab'); /* M1: 모음 칸과 같은 레이블 꼴(CSS) */ host1.querySelector(':scope > .blb').appendChild(h1); c1.remove(); }
            return;
          }
          if(EM==='gather' && em.length>=2){
            var last=un[un.length-1], g=document.createElement('div'); g.className='blk cell ttl gathered';
            var hd=document.createElement('div'); hd.className='ghead'; g.appendChild(hd);
            var gb=document.createElement('div'); gb.className='blb'; g.appendChild(gb);
            em[0].parentNode.insertBefore(g, em[0]);   /* 첫 빈 칸 자리에 — 원문 순서를 덜 깨게(09-30 국어 재조직 「gather 가 순서를 바꾼다」) · 먼저 넣고 지운다 */
            /* 10-01 독립검수 M1(동하 승인 · 사회 제외): 모은 이름표 = 칸 레이블 꼴(파랑 + 괘선) — 흰 굵은 이름이 레이블 없이 서서 다른 층처럼 보이던 것.
               첫 이름이 레이블 줄(subgrid 첫 행)에 앉아 같은 줄 칸들과 레이블 선이 맞는다 · 줄 높이를 키우면 layoutRole 이 전폭 레이블 격자(.gfull)로 */
            if(window.PAN_HOIST!==false){
              g.classList.add('glabs'); g.removeChild(hd);
              em.forEach(function(c,i){ var h=c.firstElementChild; h.classList.add('glab'); if(i===0) g.insertBefore(h, gb); else gb.appendChild(h); c.remove(); });
            }
            else em.forEach(function(c){ var h=c.firstElementChild; h.classList.add('att'); gb.appendChild(h); c.remove(); });
          }
        });
      }
      /* 칸 h2 연달음으로 시작한 격자 = 숨긴 앞머리를 절 표시로 한 번(동하 09-30 「위에 절 표시 만들면 되잖아」) — 제목 태그 아님(id 없음) */
      /* 앞머리가 바뀌는 칸마다 한 번(체육 「5~6학년군 스포츠」 뒤 「3~4학년군 표현」 묶음에 절 표시가 없던 것 · 09-30) */
      var prevP=null;
      [].slice.call(sect.querySelectorAll(':scope > .pg > .blk')).forEach(function(fb){
        var fh=fb.classList.contains('cell') ? fb.firstElementChild : null;
        if(!fb.classList.contains('cell')){ prevP=null; return; }
        if(!fh || fh.tagName!=='H2' || !fh.querySelector('.pfx')) return;
        var p=fh.querySelector('.pfx').textContent.replace(/\s*-\s*$/,'').trim();
        if(p===prevP) return; prevP=p;
        var prev=fb.previousElementSibling; if(prev && prev.classList.contains('hrow') && !prev.classList.contains('runhead')) return;
        var rh=document.createElement('div'); rh.className='blk full hrow runhead';
        var t=document.createElement('div'); t.className='rh'; t.textContent=p; rh.appendChild(t);
        fb.parentNode.insertBefore(rh, fb);
      });
      sect.querySelectorAll('.blk.cell').forEach(function(c){
        var b=c.querySelector(':scope > .blb');
        /* 전폭 = 긴 산문(200자↑)이나 표가 든 칸만 — 짧은 산문 한 줄 칸은 형제와 나란히(국어 2022 내용 체계 「영역마다 범주 3칸」 · 09-30) */
        var pl=[].reduce.call(b.querySelectorAll('.prose'), function(a,p){ return a+p.textContent.trim().length; }, 0);
        var tb=[].some.call(b.querySelectorAll('table'), function(t){ var r=t.querySelector('tr'); return t.classList.contains('rh') || (r && r.children.length>=3); });
        /* 조각이 [data-full] 로 전폭을 요청한 칸 — 글자 수 기준으로 잡으면 수학 확정 칸까지 흔들려(10-01 실측) 사람 판단 스위치로만 · 도덕적 토론 수업 모형(1/3 칸에서 설명이 두세 글자씩 접힘) */
        if(pl>200 || tb || b.querySelector('[data-full]')) c.classList.add('full');
        /* 10-01 독립검수 H4·M9(동하 승인 · 사회 제외) — 폭과 무관한 칸 성격 표지(배치는 layoutRole):
           stepc = 세로 단계 목록 칸 · prosey = 산문 칸(문장 2개↑) · longchain = 다섯 단계↑ 가로 사슬 칸 */
        if(window.PAN_HOIST!==false){
          if(b.querySelector('ol.steps:not(.hz), .vchain:not(.hz)')) c.classList.add('stepc');
          var tx=b.textContent.replace(/\s+/g,' ');
          if(tx.length>=150 && (tx.match(/다\.(?=\s|$|['’”)])/g)||[]).length>=2) c.classList.add('prosey');
          if([].some.call(b.querySelectorAll('.chain, .line, .vchain.hz, ol.steps.hz'), function(k){
            var st=k.classList.contains('line') ? [].filter.call(k.children, function(x){ var m=x.querySelector('.mid'); return m && !m.classList.contains('mk'); }).length
                  : k.classList.contains('chain') ? k.querySelectorAll(':scope > .arrow').length+1 : k.querySelectorAll(':scope > .stp, :scope > li').length;
            return st>=5; })) c.classList.add('longchain');
        }
        /* 10-01 동하 「나머지 다 정리」(사회 3): 사회는 확정 배치라 조각이 [data-half] 로 고른 단계 칸만(뱅크스 | 매트릭스 — 위아래로 쌓여 각각 오른쪽 80% 빔) */
        else if(b.querySelector('[data-half]') && b.querySelector('ol.steps:not(.hz), .vchain:not(.hz)')) c.classList.add('stepc');
        wrapGrps(c, b);
      });
    });
    /* 10-01 독립검수 M3·M4(동하 승인 · 사회 제외):
       · 단원 끝 블록 속 레이블(「성취기준 해설」·「적용 시 고려 사항」 — 조각의 인라인 작은 회색 p)을 안 꼴로(.endlab)
       · 끝 제목(「해설 · 적용 시 고려 사항」)은 바로 밑에 속 레이블이 보이면 같은 말 되풀이 → 화면에서만 접음(id 는 산다)
       · 과학 학기 구분 줄(「(3) 4학년 2학기」 — 절 제목 밑 흐린 줄 13곳) = 숨김(규칙 §1 학기 구분) */
    /* 10-01 동하 「나머지 다 정리」(사회 5): M6 수렴 결과 열 최소 폭을 사회에도(극화 학습 「기준: ⟶ 규칙·/체계·/승패/유무」 한 글자씩 쌓임) — 모양은 kit.css .converge.m6 */
    if(window.PAN_HOIST===false) document.querySelectorAll('main.wrap .converge').forEach(function(cv){ cv.classList.add('m6'); });
    /* 10-04 배포 검수 E9: 성취기준 절의 해설·고려 사항 줄(.stack>.desc 가 「성취기준 해설:」「적용 시 고려 사항 [4사01]:」로 시작) = 머리 레이블을 span.sglab 로 · 줄에 .sgnote(모양은 kit.css) — 글자 무변 · 실측상 과학·사회 p904 만 */
    document.querySelectorAll('main.wrap .stack > .desc').forEach(function(d){
      var t=d.firstChild; if(!t || t.nodeType!==3) return;
      var m=/^\s*(?:성취기준 해설|적용 시 고려 사항)(?:\s*\[[^\]]*\])?\s*:/.exec(t.nodeValue); if(!m) return;
      var lab=document.createElement('span'); lab.className='sglab'; lab.textContent=m[0];
      t.nodeValue=t.nodeValue.slice(m[0].length); d.insertBefore(lab, t); d.classList.add('sgnote');
    });
    /* 10-04 배포 검수 F3(본체 「원문 조직이 기준」 · 위계 역전): 교육과정 성취기준 절의 (가)(나) 헤더(「(가) 성취기준 해설」「(나) 성취기준 적용 시 고려 사항」)
       = .sgsub(한 단계 낮춤 · 파랑·괘선 유지) · 그 위 학년군 머리(「3~4학년」「5~6학년군」)가 h3 이면 .sggrade(머리줄 꼴) → 학년군 > 영역(단원) > (가)(나). 모양은 kit.css · 8과목 같은 규칙 */
    (function(){
      var hs=[].slice.call(document.querySelectorAll('main.wrap h2, main.wrap h3, main.wrap h4'));
      var bare=function(h){ var c=h.cloneNode(true); [].forEach.call(c.querySelectorAll('.mk'), function(m){ m.remove(); }); return c.textContent.trim(); };
      hs.forEach(function(h, i){
        if(h.tagName!=='H4' || !/^\((가|나)\) 성취기준/.test(bare(h))) return;
        h.classList.add('sgsub');
        for(var j=i-1; j>=0; j--){ var p=hs[j]; if(p.tagName==='H2') break; if(p.tagName==='H3' && /^\d~\d학년(군)?$/.test(bare(p))){ p.classList.add('sggrade'); break; } }
      });
    })();
    if(window.PAN_HOIST!==false){
      document.querySelectorAll('main.wrap .prose > p[style]').forEach(function(p){
        var t=p.textContent.trim();
        if(/font-weight:\s*700/.test(p.getAttribute('style')) && t.length<30 && /해설|고려\s?사항/.test(t)) p.classList.add('endlab');
      });
      document.querySelectorAll('main.wrap .r-end').forEach(function(h){
        var pr=null; for(var s=h.nextElementSibling; s && !pr; s=s.nextElementSibling) pr=s.classList.contains('prose') ? s : s.querySelector('.prose');
        var f=pr && [].find.call(pr.children, function(p){ return p.style.display!=='none'; });
        if(f && f.classList.contains('endlab')) h.classList.add('r-enddup');
      });
      document.querySelectorAll('main.wrap div.quiet').forEach(function(q){ if(/^\(\d\)\s*\d학년\s*\d학기/.test(q.textContent.trim())) q.classList.add('memo'); });
      /* 10-01 독립검수 M5(사회 제외): 표 열 폭 = 내용 길이 비례(kit.css table-layout:auto) — 짧은 첫 열(코드·이름 12자 이하)은 접지 않는다(.nw1).
         균등 열 폭이라 한 줄짜리 코드 열이 1/3 을 먹고 문장 열이 3~4줄로 접히던 것(통합교과 공통 적용 표) */
      /* 10-01 독립검수 L2(사회 제외): 레이블을 제목으로 올린 뒤 줄머리에 남은 「:」(영어 「: comprehensible input」) — 표시만 끈다(글자 무변) */
      document.querySelectorAll('main.wrap div > .mk:first-child').forEach(function(m){
        if(m.textContent.trim()!==':') return;
        for(var p=m.previousSibling; p; p=p.previousSibling) if(p.nodeType!==8 && p.textContent.trim()) return;
        m.classList.add('lhc');
      });
      document.querySelectorAll('main.wrap .blk table').forEach(function(t){
        var rows=[].filter.call(t.rows, function(r){ return r.cells.length>=2; }); if(!rows.length) return;
        /* 10-01 동하 「단모음표·자음체계표 좌우로 너무 늘어남」: 몸 칸이 전부 1~2자인 격자 표(.cgrid) = 전폭 대신 내용 폭 */
        var body=[].filter.call(t.querySelectorAll('td'), function(c){ return !c.classList.contains('h'); });
        if(body.length>=4 && body.every(function(c){ return c.textContent.trim().length<=2; })){ t.classList.add('cgrid'); return; }
        /* 병합 칸(rowspan·colspan)이 있는 표는 균등 그대로 — 긴 병합 칸이 폭을 다 먹어 숫자 열이 눌리던 것(총창 시간 배당 표 · 10-01 실측) */
        if([].some.call(t.querySelectorAll('td,th'), function(c){ return c.rowSpan>1 || c.colSpan>1; })) return;
        t.classList.add('tauto');
        var firsts=rows.map(function(r){ return r.cells[0]; }).filter(function(c){ return c.colSpan===1; });
        if(firsts.length && firsts.every(function(c){ return c.textContent.trim().length<=12; })) firsts.forEach(function(c){ c.classList.add('nw1'); });
      });
    }
  }
  if(!ROLE) document.querySelectorAll('main.wrap .sect').forEach(function(sect){
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
  if(!ROLE) document.querySelectorAll('main.wrap .sect > .pg').forEach(function(pg){
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
          wrapGrps(sg, body);
        });
      }
    });
  });
  /* 각론 절 안에서 성취기준 대신 다른 줄기로 짠 단원(6-1 「통일, 민주화, 산업화 — 내용 조직 다름」)도 같은 단원 위계로 */
  if(!ROLE) document.querySelectorAll('main.wrap .sect').forEach(function(s){
    if(s.querySelector('.blk.std')) s.querySelectorAll('.blk.subs:not(.std)').forEach(function(b){ if(b.querySelector(':scope > h3')) b.classList.add('std'); });
  });
  /* ⑧ 09-30 역할 판정 격자 배치(layoutRole) — 동하 「4사05-02·6사11-01 편집 중구난방 · 6사08-02 느낌으로 · 4사05-01·6사03-01 너무 김 ·
        국가유산처럼 둘뿐이면 3단 흉내 말고 반응형」:
     ① 절 격자 = 기본 단 n(1~3, 칸 최소 16.5em) × 2 트랙 · 칸 = 2 트랙
     ② 단원(머리줄·절 사이) 칸 수 k < n 이면 폭을 나눠 채움(k=2 → 3트랙씩 · k=1 → 전폭)
     ③ 형제 칸보다 훨씬 긴 칸(2.2배 ∧ 540px↑) = 전폭 · ④ 넘치는 칸은 2트랙씩 넓힘
     ⑤ 넓어진 칸 = 최상위 갈래를 순서대로 m 단에 담되 단 높이가 비슷하게 끊음(6사08-02 꼴) ·
        혼자 한 단 몫보다 훨씬 긴 갈래는 그 레이블을 머리로 두고 하위 가지를 같은 식으로 단에 담음(한 번 더까지) */
  function layoutRole(){
    var main=document.querySelector('main.wrap');
    main.querySelectorAll('.colset').forEach(function(cs){ (cs._items||[]).forEach(function(it){ it.style.gridColumn=''; cs.parentNode.insertBefore(it, cs); }); cs.remove(); });
    main.querySelectorAll('.rowg').forEach(function(g){ g.classList.remove('rowg'); });
    main.querySelectorAll('.flowing').forEach(unflow);
    main.querySelectorAll('.flat').forEach(function(g){ g.classList.remove('flat'); });
    main.querySelectorAll('.tcells').forEach(function(g){ g.classList.remove('tcells'); });
    main.querySelectorAll('.kids.kgrid').forEach(function(k){ k.classList.remove('kgrid'); });
    main.querySelectorAll('.treewide').forEach(function(k){ k.classList.remove('treewide'); });
    main.querySelectorAll('.gfull').forEach(function(k){ k.classList.remove('gfull'); });
    var sects=[].filter.call(main.querySelectorAll('.sect'), function(s){ return s.querySelector(':scope > .pg > .blk.cell, :scope > .pg > .blk.hrow, :scope > .pg > .blk.nolab'); });
    sects.forEach(function(s){
      var fs=parseFloat(getComputedStyle(s).fontSize)||16, gap=2.2*fs, minc=16.5*fs;
      var n=Math.max(1, Math.min(3, Math.floor((s.clientWidth+gap)/(minc+gap))));
      s._n=n; s.style.gridTemplateColumns='repeat('+(2*n)+',minmax(0,1fr))';
      s.querySelectorAll(':scope > .pg > .blk').forEach(function(b){ b._half=false; });
      s.querySelectorAll(':scope > .pg > .blk.cell:not(.full)').forEach(function(c){ c.style.gridColumn='span 2'; });
    });
    /* 좁은(기본 폭) 상태에서 높이를 잰다 — 단에 담을 때 단 폭 ≈ 기본 칸 폭 */
    main.querySelectorAll('.grps .grp').forEach(function(g){ g._h=g.getBoundingClientRect().height; });
    /* 나무 — 가지 묶음 높이(_th) · 가지 높이(_h) · 가지의 하위 묶음(_inner) */
    main.querySelectorAll('.blk.cell .bracket, .blk.cell .kids, .blk.hrow .bracket, .blk.hrow .kids, .blk.nolab .bracket, .blk.nolab .kids').forEach(function(x){
      x._th=x.getBoundingClientRect().height;
      [].forEach.call(x.children, function(k){ k._h=k.getBoundingClientRect().height; if(!k._inner) k._inner=k.querySelector(':scope > .kids, :scope > .bracket'); });
    });
    /* 사회 .m6(수렴 결과 열 최소 폭)는 칸 폭 판정(눌린 칸 = 전폭) 뒤에 켠다 — 판정 전에 켜면 극화 학습 칸이 반폭으로 바뀌어 확정 배치가 흔들린다(10-01 사회 5) */
    var M6=[].slice.call(main.querySelectorAll('.converge.m6'));
    sects.forEach(function(s){
      M6.forEach(function(x){ x.classList.remove('m6'); });
      var n=s._n, blks=[].slice.call(s.querySelectorAll(':scope > .pg > .blk')), unit=[];
      var bodyH=function(c){ var b=c.querySelector(':scope > .blb'); return b ? b.getBoundingClientRect().height : 0; };
      var cells=blks.filter(function(b){ return b.classList.contains('cell') && !b.classList.contains('full'); });
      cells.forEach(function(c){ c._bh=bodyH(c); c._wide=false; });   /* 기본 폭(2트랙)에서의 본문 높이 — 짧은 칸 판정용 */
      var hs=cells.map(bodyH).sort(function(a,b){ return a-b; }), med=hs.length ? hs[window.PAN_HOIST===false ? Math.floor(hs.length/2) : Math.floor((hs.length-1)/2)] : 0;   /* 아래 중앙값 — 칸 둘이면 짧은 쪽(09-30 수학 약수와 배수 | 수의 범위 · 긴 쪽이 중앙값이 돼 「훨씬 긴 칸 = 전폭」이 안 먹던 것) */
      var spanOf=function(c){ var g=c.style.gridColumn; if(g==='1 / -1' || g==='1/-1' || (c.classList.contains('full') && !c._half)) return 2*n; var mm=g.match(/span (\d+)/); return mm ? +mm[1] : 2; };
      var setSpan=function(c,t){ c.style.gridColumn = t>=2*n ? '1/-1' : 'span '+t; };
      /* 칸 넷짜리 단원 = 2×2(동하 09-30 「환경 확대법·3~4학년 설명이 너무 눌림 — 2단×2로」) */
      var flush=function(){ var k=unit.length; if(k===4 && n===3) unit.forEach(function(c){ setSpan(c,3); }); unit=[]; };
      blks.forEach(function(b){ if(b.classList.contains('cell') && !b.classList.contains('full')) unit.push(b); else flush(); });
      flush();
      cells.forEach(function(c){ var h=bodyH(c); if(cells.length>1 && h>2.2*med && h>540) setSpan(c,2*n); });
      /* 넘침 → 2트랙씩 넓힘 · 눌린 칸(수렴 도식 오른쪽 글이 좁은 기둥으로 여러 줄 — 가치 학습 계보·환경 확대법)도 넓힘 */
      cells.forEach(function(c){
        var fs=parseFloat(getComputedStyle(c).fontSize)||16;
        var need=c.scrollWidth-c.clientWidth;
        c.querySelectorAll('.cols,.wide,.line,table,.lanes,.vchain,ol.steps,.fork,.branch,.nw').forEach(function(e){ need=Math.max(need, e.scrollWidth-e.clientWidth); });
        var cw=c.getBoundingClientRect().width;
        var squeezed=[].some.call(c.querySelectorAll('.converge > :last-child'), function(x){ var r=x.getBoundingClientRect(); return r.width<0.62*cw && r.height>4.5*fs*1.5; })
          /* 좌우 대조 칸(.cols)의 한쪽이 좁은 기둥으로 여러 줄 접힘도 눌림(09-30 「현장 학습이 너무 눌렸음」) */
          || [].some.call(c.querySelectorAll('.cols > *'), function(x){ var r=x.getBoundingClientRect(); return r.width<11*fs && r.height>4.5*fs*1.5; });
        if(squeezed){ setSpan(c, 2*n); return; }   /* 눌린 칸 = 전폭 → 남은 칸끼리 한 줄을 나눈다(가치 학습 계보 → 명료화 | 탐구) */
        if(need>12){ var one=s.clientWidth/(2*n), cur=c.getBoundingClientRect().width;
          c._wide=true;   /* 넘침 때문에 넓힌 칸 — 줄 채우기에서 비율 유지 */
          setSpan(c, Math.max(spanOf(c)+2, Math.min(2*n, 2*Math.ceil((cur+need)/(2*one))))); }
      });
      M6.forEach(function(x){ x.classList.add('m6'); });
      /* 줄 채우기(반응형) — 줄에 칸이 혼자거나 빈 자리가 남으면 그 줄 칸들이 폭을 비율대로 나눠 채운다
         (동하 09-30 「민주주의·선거 옆 단이 비었잖아」 · 「국가유산처럼 둘뿐이면 3단 흉내 말고」) */
      var fillRows=function(){
        var row=[], used=0;
        var close=function(){
          /* 기본은 같은 폭으로 나눈다(두 칸 = 1:1 · 동하 09-30 「협동 학습 수업 모형|Jigsaw I 이 2:1 — 필요할 때만」) · 넘침으로 넓힌 칸이 있을 때만 비율 유지 */
          var prop=row.some(function(c){ return c._wide; });
          if(row.length && (used<2*n || !prop)){ var left=2*n, tot=used;
            row.forEach(function(c,i){ var t= i===row.length-1 ? left : Math.max(2, prop ? Math.round(spanOf(c)*2*n/tot) : Math.floor(2*n/row.length)); left-=t; setSpan(c,t); }); }
          row=[]; used=0; };
        blks.forEach(function(b){
          var isCell=b.classList.contains('cell') && (!b.classList.contains('full') || b._half);
          var t=isCell ? spanOf(b) : 2*n;
          if(used+t>2*n) close();
          if(!isCell){ close(); return; }
          row.push(b); used+=t; if(used>=2*n) close();
        });
        close();
      };
      fillRows();
      /* 같은 줄 옆 칸보다 2배↑ 긴 칸(∧ 540px↑) = 전폭 — 옆이 텅 비지 않게(사회 원칙 「긴 칸 옆 텅 빔 금지」 · 09-30 수학 약수와 배수 | 수의 범위) · 사회 확정 배치는 그대로 */
      if(window.PAN_HOIST!==false){
        var rowsBy={}; cells.forEach(function(c){ if(spanOf(c)>=2*n) return; var t=Math.round(c.getBoundingClientRect().top); (rowsBy[t]=rowsBy[t]||[]).push(c); });
        var chg=false;
        Object.keys(rowsBy).forEach(function(t){ var r=rowsBy[t]; if(r.length<2) return;
          var hh=r.map(bodyH), mx=Math.max.apply(null,hh), i=hh.indexOf(mx), rest=hh.filter(function(_,j){ return j!==i; }), m2=Math.max.apply(null,rest);
          if((mx>540 && mx>2*m2) || (mx>300 && mx>3*m2)){   /* 짧아도 옆 칸의 3배↑면(사각형 60 : 350px) */ setSpan(r[i], 2*n); r[i]._wide=false; chg=true; } });
        if(chg) fillRows();
      }
      /* 10-01 독립검수 H4·M9(동하 승인 · 사회 제외):
         ① M9 — 산문 칸·다섯 단계↑ 사슬 칸은 3단 격자에서 최소 1/2 폭(1/3 칸 290px 에 한 줄 17~19자로 잘게 접히던 것)
         ② H4 — 전폭이 된 세로 단계 목록 칸은 목록 내용 폭이 반 폭에 들면 반 폭으로(역할놀이 9단계 오른쪽 절반 이상 빔) — 짧은 형제 칸이 옆에 선다 */
      if(n>=2 && (window.PAN_HOIST!==false || s.querySelector('[data-half]'))){   /* 사회 = [data-half] 칸만(사회 3) */
        var gp=2.2*(parseFloat(getComputedStyle(s).fontSize)||16), W=s.clientWidth, halfW=n*(W-(2*n-1)*gp)/(2*n)+(n-1)*gp, ch2=false;
        var natW=function(c){ var cl=c.getBoundingClientRect().left, mx=0;
          c.querySelectorAll('ol.steps:not(.hz), .vchain:not(.hz)').forEach(function(L){ var o=L.style.width; L.style.width='max-content'; var r=L.getBoundingClientRect(); mx=Math.max(mx, r.right-cl); L.style.width=o; });
          return mx; };
        blks.forEach(function(c){
          if(!c.classList.contains('cell')) return;
          if(window.PAN_HOIST===false && !c.querySelector('[data-half]')) return;
          var sp=spanOf(c);
          if((c.classList.contains('prosey') || c.classList.contains('longchain')) && !c.classList.contains('full') && sp<n){ setSpan(c,n); c._wide=false; ch2=true; }
          if(c.classList.contains('stepc') && sp>=2*n && !c.querySelector('table, .colset, .prose') && natW(c)<=halfW*1.35){
            c._half=true; setSpan(c,n); c._wide=false; ch2=true; if(cells.indexOf(c)<0) cells.push(c); }
        });
        /* 10-01 동하 「나머지 다 정리」(8): 반폭 단계 칸 옆 짧은 형제 칸이 혼자 줄을 차지해 전폭으로 채워져 있으면 반폭으로 돌려 옆에 세운다
           (수학 폴리아 「문제 해결 4단계 | 문제 해결 전략」 — 형제가 전폭이면 반폭 단계 칸도 줄에 혼자 남아 다시 전폭이 되던 것) · 형제가 단계 칸보다 짧을 때만 */
        blks.forEach(function(c,i){
          if(!c.classList.contains('stepc') || spanOf(c)!==n) return;
          /* 단계 목록이 칸 본문의 거의 전부일 때만 — 목록 밖 갈래가 큰 칸(과학 개념 변화 · 미술 도자기 공예)은 전폭에서 갈래 단이 서는 편이 낫다(10-01 실측) */
          var lh=[].reduce.call(c.querySelectorAll('ol.steps:not(.hz), .vchain:not(.hz)'), function(a,L){ return a+L.getBoundingClientRect().height; }, 0);
          if(lh < 0.7*bodyH(c)) return;
          if(c._half) [blks[i+1], blks[i-1]].some(function(o){
            if(!o || !o.classList.contains('cell') || o.classList.contains('full') || o._half || o._wide || spanOf(o)<2*n) return false;
            if(window.PAN_HOIST===false && !o.querySelector('[data-half]')) return false;
            if((o._bh||bodyH(o)) > bodyH(c)) return false;
            setSpan(o, n); ch2=true; return true;
          });
        });
        if(ch2) fillRows();
        /* 단계 목록이 반폭보다 넓으면(폴리아 반성 설명 줄) 같은 줄 짧은 형제와 2/3 : 1/3 — 목록이 접히지 않게 · 짧은 형제는 좁은 쪽(동하 「필요할 때만 2:1」) */
        var tw=function(t){ return t*(W-(2*n-1)*gp)/(2*n)+(t-1)*gp; }, ch3=false;
        if(n===3) blks.forEach(function(c,i){
          if(!c.classList.contains('stepc') || spanOf(c)!==n) return;
          var lh=[].reduce.call(c.querySelectorAll('ol.steps:not(.hz), .vchain:not(.hz)'), function(a,L){ return a+L.getBoundingClientRect().height; }, 0);
          if(lh < 0.7*bodyH(c)) return;
          var nw=natW(c); if(!(nw>tw(n)+8 && nw<=tw(2*n-2)+8)) return;
          [blks[i+1], blks[i-1]].some(function(o){
            if(!o || !o.classList.contains('cell') || o._half || o.classList.contains('stepc') || spanOf(o)!==n) return false;
            if(Math.abs(o.getBoundingClientRect().top-c.getBoundingClientRect().top)>2) return false;   /* 같은 줄 짝만 */
            if(window.PAN_HOIST===false && !o.querySelector('[data-half]')) return false;
            if((o._bh||bodyH(o)) > 0.5*bodyH(c) || overflows(o)) return false;
            setSpan(c, 2*n-2); setSpan(o, 2); c._wide=true; o._wide=true; ch3=true; return true;
          });
        });
        if(ch3) fillRows();
      }
      /* 넓어진 칸 = 갈래를 단에 담음 */
      /* 단으로 안 나누는 칸: 짧은 칸(한 줄기로 화면 1/3 미만 — 6사08-03 미디어) · 세로 단계 사슬(↓)이 든 칸(가치 학습 계보 — 단계는 단을 넘기지 않는다) */
      var noSplit=function(c){
        if((c._bh||0) < Math.min(innerHeight,820)/3) return true;
        if(c.querySelector('.grp.ingrp')) return false;   /* 안 갈래 칸 = 안을 통째로 단에 담는다(사슬은 안 속에서 안 끊긴다 — balance 가 사슬 든 갈래는 안 내려감) */
        return hasChain(c);
      };
      /* 전폭 칸(표·긴 산문 제외)도 갈래 단 대상 — 「안」 둘 이상 칸이 전폭 한 단으로 쌓이던 것(09-30 과목 확대) */
      /* [data-cols] = 표가 든 전폭 칸도 갈래 단 대상(표 갈래는 balance 가 전폭으로 둠) — 10-01 동하 「나머지 다 정리」(사회 2 · 4사05-01 방위~높낮이가 한 기둥으로 왼쪽에 몰림) */
      var fulls=blks.filter(function(b){ return b.classList.contains('cell') && b.classList.contains('full') && !b.classList.contains('prosecell') && (!b.querySelector('table') || b.querySelector('[data-cols]')); });
      fulls.forEach(function(c){ c._bh=bodyH(c); });
      cells.concat(fulls).forEach(function(c){
        var st=c.querySelector('.grps'); if(!st) return;
        if(noSplit(c)) return;
        var w=c.getBoundingClientRect().width, colw=19*(parseFloat(getComputedStyle(c).fontSize)||16), g2=2.2*(parseFloat(getComputedStyle(c).fontSize)||16);
        var m=Math.floor((w+g2)/(colw+g2)); if(m<2) return;
        balance(st, [].slice.call(st.children), m, 0);
      });
      /* 넓은 칸인데 갈래 단이 안 선 곳의 키 큰 나무(국어 「읽기 능력 구조」·「소설」) = 가장 바깥 가지 묶음(.bracket/.kids)을 같은 균형 배치로
         (혼자 긴 가지는 레이블 아래 하위 가지를 단에) · 단으로 옮긴 가지는 잇는 선 없음(동하 09-30 「가로 트리라고 트리 구조 유지할 필요 없음」) */
      /* 칸 없는 절 본문(머리줄 블록)의 키 큰 나무도 같은 흘림 — 과학 단원 절 30여 개가 한 줄기로 화면 1~2장이던 것(09-30) */
      var hrows=blks.filter(function(b){ return (b.classList.contains('hrow') || b.classList.contains('nolab')) && !b.classList.contains('runhead'); });
      hrows.forEach(function(c){ c._bh=c.getBoundingClientRect().height; });
      cells.concat(fulls, hrows).forEach(function(c){
        if(c.querySelector('.colset') || noSplit(c)) return;
        var fs=parseFloat(getComputedStyle(c).fontSize)||16, m=Math.floor((c.getBoundingClientRect().width+2.2*fs)/(21.2*fs)); if(m<2) return;
        var tr=[].find.call(c.querySelectorAll('.bracket, .kids'), function(x){ return x.children.length>=2 && (x._th||0)>360; });
        if(tr && !c.classList.contains('cell')){ var top=tr; while(top.parentElement!==c) top=top.parentElement; top.classList.add('treewide'); }
        /* 동하 09-30 결정: 보통 길이 = 6사08-02 꼴(바깥 가지를 통째로 나란히 · 한 층만 · 가지 안 끊음) / 너무 긴 것(한 줄기 900px↑) = 3단으로 잘라 흘림 */
        var TM0=window.PAN_TREE||((tr && (tr._th||0)>Math.min(innerHeight,820)*2/3) ? 'flow' : 'one');   /* 기준 = 패드 가로 화면 2/3(동하 「픽셀 말고 아이패드 가로에서 어느 정도로」 · 「820도 좀 긴데」) */
        if(tr && TM0==='none') return;
        if(tr && TM0==='cells'){ tr.classList.add('tcells','flat'); tr.style.setProperty('--m', m); return; }   /* 바깥 가지 = 작은 칸 격자 */
        /* 단 수는 길이에 맞춰 — 한 단이 화면 2/3 안에 들도록 필요한 만큼만(동하 「꼭 3단일 필요 없고 알아서」) */
        if(tr && TM0==='flow'){ var thr=Math.min(innerHeight,820)*2/3; flowTree(tr, Math.min(m, Math.max(2, Math.ceil((tr._th||0)/thr)))); return; }
        if(tr){
          var TM=TM0;   /* 나무 모양 샘플 비교(09-30 동하 「모양이 너무 제각각」): bal(균형·내려가기) / one(바깥 가지만) / rows(바깥 가지마다 한 줄 + 그 아래 가지만 단) */
          if(TM==='one') balance(tr, [].slice.call(tr.children), m, 99);
          else if(TM==='rows') [].slice.call(tr.children).forEach(function(x){
            x.classList.add('rowg'); var inn=x._inner; if(inn && inn.children.length>=2) balance(inn, [].slice.call(inn.children), m, 99);
          });
          else balance(tr, [].slice.call(tr.children), m, 0);
          if(tr.querySelector('.colset') || TM==='rows') tr.classList.add('flat');
        }   /* 가로로 편 나무 = 선 없는 단 형식(동하 09-30) */
      });
      /* 마무리 — 아직 넘치는 칸은 2트랙씩 더 넓힘(두 번까지) */
      for(var pass=0; pass<2; pass++) cells.forEach(function(c){
        if(!overflows(c) && c.scrollWidth-c.clientWidth<=2) return;
        var cur=(c.style.gridColumn.match(/span (\d+)/)||[0,2])[1]*1; if(c.style.gridColumn==='1 / -1' || cur>=2*n) return;
        var nx=Math.min(2*n, cur+2); c.style.gridColumn= nx>=2*n ? '1/-1' : 'span '+nx;
      });
      fillRows();
      /* 10-01 독립검수 M1(사회 제외): 모은 이름표 칸이 같은 줄 칸보다 키가 커 줄 높이를 키우면(도덕 원리 5개 — 왼쪽 두 칸 아래 150px 빔)
         또는 줄에 혼자면 = 전폭 레이블 격자(.gfull · 절 격자와 같은 단) — 이름표가 짧은 칸 여럿처럼 한두 줄로 */
      if(window.PAN_HOIST!==false){
        var gch=false;
        blks.forEach(function(g){
          if(!g.classList.contains('glabs')) return;
          var full=spanOf(g)>=2*n;
          if(!full){
            var gt=g.getBoundingClientRect().top, fsg=parseFloat(getComputedStyle(g).fontSize)||16;
            var mates=cells.filter(function(c){ return c!==g && Math.abs(c.getBoundingClientRect().top-gt)<=2; });
            var mx=mates.length ? Math.max.apply(null, mates.map(bodyH)) : 0;
            if(!mates.length || bodyH(g)>mx+1.5*fsg){ setSpan(g, 2*n); g._wide=false; gch=true; full=true; }
          }
          if(full) g.classList.add('gfull');
        });
        if(gch) fillRows();
      }
    });
    eqAlign();
  }
  /* 「= 이어지는 줄」은 윗줄 「=」와 줄 맞춤(동하 09-30 「명시적 비용·암묵적 비용도 = 뒤니까 = 끼리 줄 맞춰야」) — 구운 배치에도 쓴다 */
  function eqAlign(){
    var main=document.querySelector('main.wrap'); if(!main || !main.clientWidth) return;
    var eqX=function(root){ var tw=document.createTreeWalker(root, NodeFilter.SHOW_TEXT), t; while((t=tw.nextNode())){ var i=t.textContent.indexOf('='); if(i>=0){ var r=document.createRange(); r.setStart(t,i); r.setEnd(t,i+1); return r.getBoundingClientRect().left; } } return null; };
    main.querySelectorAll('.eqal').forEach(function(e){ e.style.paddingLeft=''; e.classList.remove('eqal'); });
    /* 10-01 독립검수 L1(사회 제외): 같은 절 안 형제 세로 단계 목록은 단계 이름 열 폭을 맞춘다(설명 열 x 가 목록마다 134·155px — 도덕 168~221) —
       절 안 최대 이름 열 폭으로 · 그만큼 넓혀도 설명 열이 12em 넘게 남는 목록만 */
    if(document.documentElement.classList.contains('dae-big')){
      main.querySelectorAll('.vchain.l1al').forEach(function(v){ v.style.gridTemplateColumns=''; v.classList.remove('l1al'); });
      main.querySelectorAll('.sect').forEach(function(s){
        var L=[].filter.call(s.querySelectorAll('.vchain:not(.hz)'), function(v){ return v.offsetParent!==null && v.querySelector(':scope > .ann'); });
        if(L.length<2) return;
        var cw=L.map(function(v){ var st=v.querySelector(':scope > .stp'); return st ? st.getBoundingClientRect().width : 0; });
        /* 10-03 동하 미결(순환·5E·POE 이름 칸 넓음): 절 최대 하나에 다 맞추면 짧은 이름 사슬(탐색 62px)이 172px 로 벌어진다 →
           폭이 1.5배 안쪽인 사슬끼리만 무리 지어 무리 안 최대로 */
        var ord=cw.map(function(w,i){ return i; }).filter(function(i){ return cw[i]>0; }).sort(function(a,b){ return cw[a]-cw[b]; });
        var grpMax={}, g=[];
        var flushG=function(){ var m=Math.max.apply(null, g.map(function(i){ return cw[i]; })); g.forEach(function(i){ grpMax[i]=m; }); g=[]; };
        ord.forEach(function(i){ if(g.length && cw[i]>cw[g[0]]*1.5) flushG(); g.push(i); }); if(g.length) flushG();
        L.forEach(function(v,i){
          var mx=grpMax[i]; if(mx==null || mx-cw[i]<2) return;
          var fs=parseFloat(getComputedStyle(v).fontSize)||16;
          if(v.clientWidth-mx-fs < 12*fs) return;
          v.style.gridTemplateColumns=Math.ceil(mx)+'px minmax(0,1fr)'; v.classList.add('l1al');
        });
      });
    }
    main.querySelectorAll('.blk .ind').forEach(function(ind){
      var d=ind.firstElementChild; if(!d || d.textContent.trim().charAt(0)!=='=') return;
      var prev=ind.previousElementSibling; if(!prev) return;
      var a=eqX(prev), b=eqX(ind); if(a==null || b==null) return;
      var pl=parseFloat(getComputedStyle(ind).paddingLeft)||0; ind.style.paddingLeft=Math.max(0, pl+(a-b))+'px'; ind.classList.add('eqal');
    });
  }
  /* 가로 나무 = 단 높이 고르게(동하 09-30 「길이가 들쭉날쭉」) — 가지를 순서대로 이어 붙여 높이가 비슷한 자리에서 끊는다.
     큰 가지는 레이블 줄 + 하위 가지로 풀어 그 안에서도 끊을 수 있게(깊이 3까지) · 층 = 들여쓰기 · 단 첫머리가 가지 중간이면
     윗 레이블 경로를 흐리게(「구성(플롯) › 구성 요소」) · 선 없음 · 옮긴 자리는 주석 표지로 남겨 되돌린다 */
  function flowTree(tr, m){
    var target=(tr._th||tr.getBoundingClientRect().height)/m, units=[];
    var lab=function(el){ var t=el.querySelector('.term'); return (t ? t.textContent : el.textContent).trim(); };
    (function walk(list, depth, anc){
      list.forEach(function(el){
        var h=el._h||el.getBoundingClientRect().height;
        var inner=el.classList.contains('branch') ? el.querySelector(':scope > .kids, :scope > .bracket') : null;
        /* 끝가지만 달린 가지(「인지 → 사실·추론·비판…」)는 쪼개지 않는다 */
        var leafy=inner && [].every.call(inner.children, function(k){ return !(k.classList.contains('branch') && k.querySelector(':scope > .kids, :scope > .bracket')); });
        if(!inner || !inner.children.length || leafy || h<=target*0.45 || depth>=3){ units.push({el:el, d:depth, anc:anc, h:h}); return; }
        var head=el.firstElementChild; units.push({el:head, d:depth, anc:anc, h:head.getBoundingClientRect().height+4, head:true});
        walk([].slice.call(inner.children), depth+1, anc.concat([lab(head)]));
      });
    })([].slice.call(tr.children), 0, []);
    if(units.length<2) return;
    var fl=document.createElement('div'); fl.className='flow'; fl.style.setProperty('--m', m);
    var rs=part(units.map(function(u){ return u.h; }), Math.min(m, units.length));
    /* 레이블이 단 끝에 혼자 남지 않게 — 다음 단 첫머리로 넘긴다(「해독」이 단 끝, 내용은 다음 단이던 것) */
    for(var ri=0; ri<rs.length-1; ri++) while(rs[ri][1]-1>rs[ri][0] && units[rs[ri][1]-1].head){ rs[ri][1]--; rs[ri+1][0]--; }
    rs.forEach(function(r){
      var col=document.createElement('div'); col.className='col'; fl.appendChild(col);
      var first=units[r[0]];
      if(first && first.d>0 && first.anc.length){ var cr=document.createElement('div'); cr.className='crumb'; cr.setAttribute('aria-hidden','true'); cr.textContent=first.anc.join(' › '); col.appendChild(cr); }
      units.slice(r[0], r[1]).forEach(function(u){
        var ph=document.createComment('flow'); u.el.parentNode.insertBefore(ph, u.el); u.el._ph=ph;
        u.el.style.paddingLeft=(u.d*1.1)+'em'; if(u.head) u.el.classList.add('fhead');
        col.appendChild(u.el);
      });
    });
    tr.insertBefore(fl, tr.firstChild); tr.classList.add('flowing','flat'); tr._flow=units;
  }
  function unflow(tr){
    (tr._flow||[]).slice().reverse().forEach(function(u){ var ph=u.el._ph; if(ph && ph.parentNode){ ph.parentNode.replaceChild(u.el, ph); } u.el.style.paddingLeft=''; u.el.classList.remove('fhead'); u.el._ph=null; });
    var fl=tr.querySelector(':scope > .flow'); if(fl) fl.remove(); tr.classList.remove('flowing'); tr._flow=null;
  }
  function part(hs, k){   /* 순서 유지 k 묶음 — 최대 합 최소(작은 DP) */
    var n=hs.length, pre=[0]; hs.forEach(function(h,i){ pre.push(pre[i]+h); });
    var INF=1e18, dp=[], cut=[];
    for(var j=0;j<=k;j++){ dp.push([]); cut.push([]); for(var i=0;i<=n;i++){ dp[j].push(INF); cut[j].push(0); } }
    dp[0][0]=0;
    for(j=1;j<=k;j++) for(i=1;i<=n;i++) for(var p=j-1;p<i;p++){ var v=Math.max(dp[j-1][p], pre[i]-pre[p]); if(v<dp[j][i]){ dp[j][i]=v; cut[j][i]=p; } }
    var out=[], e=n; for(j=k;j>=1;j--){ var b=cut[j][e]; out.unshift([b,e]); e=b; } return out;
  }
  var WIDE='.cols,.wide,.line,table,.lanes,.vchain,ol.steps,.fork,.branch,.converge';
  /* 넘침 판정 여유 12px — 크롬에서도 부품이 단 폭에 딱 맞아(여유 0) 사파리 글자 폭 1~3px 차로 단 나누기가 통째 취소되던 것
     (09-30 동하 패드 「아직도 안 올라옴」 · 실제 겹침은 수십 px) */
  /* 세로 단계 사슬(↓·.vchain)이 든 덩어리 — 단을 넘기지 않는다(동하 09-30 가치 학습 계보) */
  function hasChain(c){
    if(c.querySelector('.vchain:not(.hz)')) return true;
    return [].some.call(c.querySelectorAll('.blb div'), function(x){ return !x.children.length && /^[↓⇓]$/.test(x.textContent.trim()); });
  }
  function overflows(root, tol){ tol = tol==null ? 12 : tol; return [].some.call(root.querySelectorAll(WIDE), function(e){ return e.scrollWidth-e.clientWidth>tol; }); }
  function balance(parent, items, m, depth){
    var tot=items.reduce(function(a,x){ return a+(x._h||0); },0), target=tot/m, batch=[];
    var flushB=function(){
      /* 단 안에서 넓은 부품(대조 표·수렴 도식)이 넘치면 단 수를 줄이고, 끝까지 넘치면 안 나눈다(09-30 실측 — 옆 단 글자와 겹침) */
      /* 높이가 비슷한 같은 급 항목(6사10-02 기후대)은 줄 맞춘 격자 — 단 흘림이면 단마다 개수가 달라 줄이 어긋난다(동하 09-30) */
      var bh=batch.map(function(x){ return x._h||0; }), sb=bh.slice().sort(function(a,b){ return a-b; }), md=sb[Math.floor(sb.length/2)]||1;
      var even=batch.length>m && sb[sb.length-1]<=2.5*md;
      /* 줄 맞춘 격자가 단 흘림보다 훨씬 길면(빈 칸이 크게 남음) 흘림으로 — 체육 야구형 「발야구 | 주먹 야구 / 티볼」 → 티볼을 주먹 야구 밑으로(동하 09-30 「높이 맞추라니까」) */
      if(even){ var kk=Math.min(m, batch.length), gH=0; for(var r0=0; r0<bh.length; r0+=kk) gH+=Math.max.apply(null, bh.slice(r0, r0+kk));
        var fH=Math.max.apply(null, part(bh, kk).map(function(r){ return bh.slice(r[0], r[1]).reduce(function(a,b){ return a+b; },0); }));
        if(batch.length%kk && gH>1.15*fH && batch.every(function(x){ return x.classList.contains('ingrp'); })) even=false; }   /* 「안」 갈래끼리만(같은 급 목록 격자 — 사회 05-02·08-02·현장 학습 — 는 동하 확정 배치 그대로) */
      for(var k=Math.min(m, batch.length); batch.length>=2 && k>=2; k--){
        var cs=document.createElement('div'); cs.className='colset'+(even?' gridset':''); cs.style.setProperty('--m', k);
        parent.insertBefore(cs, batch[0]); cs._items=batch.slice();
        if(even){ batch.forEach(function(x){ cs.appendChild(x); });
          /* 모양이 다른 첫 항목 = 앞머리 → 전폭: ① 나머지는 모두 「이름 : 설명」인데 첫 항목만 아님(6사10-02 「요소·요인」)
             ② 첫 항목만 하위 없는 한 줄 메모, 나머지는 모두 갈래(4사05-01 「방위, 기호와 범례…」) — 같은 급(08-02 국회)은 건드리지 않는다 */
          batch.forEach(function(x){ x.classList.remove('lead1'); });
          var fl=function(x){ return ((x.firstElementChild||x).textContent||'').trim(); };
          var rest=batch.slice(1), colon=function(x){ return /\s:\s|:\s/.test(fl(x)); };
          var r1=!colon(batch[0]) && rest.filter(colon).length>=rest.length-1 && rest.filter(colon).length>=2;
          var r2=!batch[0].classList.contains('k') && rest.every(function(x){ return x.classList.contains('k'); });
          if(batch.length>2 && (r1 || r2)) batch[0].classList.add('lead1'); }
        else part(bh, k).forEach(function(r){
          var col=document.createElement('div'); col.className='col'; cs.appendChild(col);
          batch.slice(r[0], r[1]).forEach(function(x){ col.appendChild(x); });
        });
        /* 격자에서 넘치는 항목이 있으면 격자를 버리고 같은 단 수로 단 흘림으로 다시(09-30 「4사05-01 내용이 왼쪽에 몰림」 — 넘친 항목만 전폭으로 빼면 줄마다 왼쪽만 참) */
        if(even && batch.some(function(x){ return overflows(x); })){ cs._items.forEach(function(it){ parent.insertBefore(it, cs); }); cs.remove(); even=false; k++; continue; }
        if(!overflows(cs)) break;
        cs._items.forEach(function(it){ it.style.gridColumn=''; parent.insertBefore(it, cs); }); cs.remove();
      }
      batch=[];
    };
    items.forEach(function(x){
      /* 표가 든 갈래는 단에 넣지 않는다 — 전폭 그대로(09-30 동하 「바·바스·셔미스 왼쪽이 텅 빔」·「4사05-01 왼쪽에 몰림」) */
      if(x.querySelector && x.querySelector('table')){ flushB(); return; }
      var inner=(x.classList.contains('grp') || x.classList.contains('branch')) ? (x._inner || null) : null;
      /* 내려가기 = 한 단 몫보다 긴 갈래(∧ 360px↑) · 안쪽에 여러 줄짜리 가지가 있을 때만(한 줄 목록은 쪼개지 않는다 — 4사05-02 행정구역) */
      var kids=inner ? [].slice.call(inner.children) : [];
      var rich=kids.length>=2 && kids.some(function(z){ return (z._h||0)>=60; });
      if(depth<2 && rich && (x._h||0)>Math.max(1.15*target, 360) && !hasChain(x)){
        flushB(); x.classList.add('rowg'); balance(inner, [].slice.call(inner.children), m, depth+1);
      } else batch.push(x);
    });
    flushB();
  }
  function cols(g){ return getComputedStyle(g).gridTemplateColumns.split(' ').length; }
  function splitTall(){
    document.querySelectorAll('main.wrap .split').forEach(function(s){ s.classList.remove('split'); });
    fitSpans();
    /* 칸 무리 = 소단원 격자(.subs 의 .sg) 또는 역할 판정 칸(.sect 의 .blk.cell) */
    [].slice.call(document.querySelectorAll('main.wrap .subs')).concat([].slice.call(document.querySelectorAll('main.wrap .sect'))).forEach(function(b){
      if(cols(b)<2) return;
      var sgs=[].slice.call(b.querySelectorAll(':scope > .sg:not(.lead), :scope > .pg > .blk.cell')); if(sgs.length<2) return;
      var hs=sgs.map(function(s){ var x=s.querySelector(':scope > .sgb, :scope > .blb'); return x ? x.getBoundingClientRect().height : 0; });
      var med=hs.slice().sort(function(a,c){ return a-c; })[Math.floor(hs.length/2)];
      sgs.forEach(function(s,i){
        if(s.classList.contains('cansplit') && hs[i]>2.2*med && hs[i]>Math.min(innerHeight,900)*.6)   /* 창 높이 상한 900 — 전면 캡처(창 3만 px)에서도 패드와 같은 판정 */ s.classList.add('split');
      });
    });
    /* 갈래를 단으로 세운 뒤에도 한 갈래만 훨씬 길면(11-01 「가계와 기업의 역할」) 그 갈래는 전폭 ·
       그 안에서 형제 가지(.branch 둘 이상)가 선 가장 얕은 줄기만 단으로 — 위의 설명 줄은 전폭 그대로 */
    document.querySelectorAll('main.wrap .grp.wide').forEach(function(g){ g.classList.remove('wide'); });
    document.querySelectorAll('main.wrap .bgrid').forEach(function(x){ x.classList.remove('bgrid'); });
    document.querySelectorAll('main.wrap .split .grps').forEach(function(st){
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
    document.querySelectorAll('main.wrap .blk:not(.subs):not(.full):not(.nolab):not(.split), main.wrap .sg:not(.lead):not(.split)').forEach(function(c){
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
  var relayout = ROLE ? layoutRole : splitTall;
  /* ⑫ 09-30 동하 「미리 그려 놓는 건?」 → 배치 굽기: 조립 때 헤드리스 Chrome 으로 구간(판 폭 950↑ = 3 · 700~950 = 2 · 700↓ = 1)마다
        배치를 계산해 window.PAN_LAYOUT 에 적어 두고(bake.py), 판을 열면 지금 구간의 배치를 옮겨 놓기만 한다(측정 없음 → 사파리·크롬·앱 안 같음).
        원소 주소 = 구조 잡기(폭 무관·결정적)를 마친 뒤 main.wrap 안 원소 순번. 구간이 바뀔 때만 되돌리고 다시 놓는다. */
  var MAIN=document.querySelector('main.wrap'), ALL=[], IX=new Map();
  if(MAIN){ ALL=[].slice.call(MAIN.getElementsByTagName('*')); ALL.forEach(function(e,i){ IX.set(e,i); }); }
  /* 10-01 독립검수 H3(동하 승인): 구간은 창 폭이 아니라 본문(main.wrap) 폭으로 — 목차를 열어 본문이 ≈680px 로 줄었는데 창 폭(1000) 구간 3단이 남아
     두세 글자씩 접히던 것. 굽힌 배치(PAN_LAYOUT) 셋 중 고르기만 한다(측정 없음). 굽기 창 폭 1000·820·390 에선 본문 폭 = 창 폭이라 굽는 값은 그대로.
     사회는 확정 배치라 옛 기준(창 폭) 그대로 — 사회의 같은 결함은 동하 판단 */
  /* 10-01 동하 「나머지 다 정리」(사회 1): 사회도 본문 폭 기준 — 목차를 열면 사회 3단이 630px 에 남아 두세 글자씩 접히던 것. 목차 닫힌 기본 상태에선 본문 폭 = 창 폭이라 배치 무변 */
  var bpOf=function(){ var w, mwb=document.querySelector('main.wrap');
    w = mwb ? mwb.clientWidth : (document.documentElement.clientWidth||window.innerWidth||0);
    return w>=950 ? 3 : w>=700 ? 2 : w>0 ? 1 : 0; };
  var BAKE=/[?&]bake=1/.test(location.search), LAYOUT=(!BAKE && window.PAN_LAYOUT) || null, applied=null;
  function snapshot(){
    var sn={sect:[], span:[], cls:{}, sets:[], flows:[]};
    MAIN.querySelectorAll('.sect').forEach(function(s){ if(s.style.gridTemplateColumns && IX.has(s)) sn.sect.push([IX.get(s), s.style.gridTemplateColumns]); });
    ALL.forEach(function(e,i){ if(e.style && e.style.gridColumn) sn.span.push([i, e.style.gridColumn]); });
    ['rowg','flat','flowing','tcells','lead1','treewide','gfull'].forEach(function(c){ sn.cls[c]=ALL.filter(function(e){ return e.classList.contains(c); }).map(function(e){ return IX.get(e); }); });
    MAIN.querySelectorAll('.colset').forEach(function(cs){
      sn.sets.push({p:IX.get(cs.parentNode), c:cs.className, m:cs.style.getPropertyValue('--m'), items:(cs._items||[]).map(function(x){ return IX.get(x); }),
        cols: cs.classList.contains('gridset') ? null : [].map.call(cs.children, function(col){ return [].map.call(col.children, function(x){ return IX.get(x); }); })});
    });
    MAIN.querySelectorAll('.flow').forEach(function(fl){
      sn.flows.push({tr:IX.get(fl.parentNode), m:fl.style.getPropertyValue('--m'), cols:[].map.call(fl.children, function(col){
        var cr=col.querySelector(':scope > .crumb');
        return {crumb: cr ? cr.textContent : '', items:[].filter.call(col.children, function(x){ return !x.classList.contains('crumb'); }).map(function(x){ return [IX.get(x), x.style.paddingLeft, x.classList.contains('fhead')?1:0]; })};
      })});
    });
    return sn;
  }
  var mv=function(el, into){ if(!el._ph){ var ph=document.createComment('p'); el.parentNode.insertBefore(ph, el); el._ph=ph; } into.appendChild(el); };
  function unapply(){
    if(!applied) return;
    ALL.forEach(function(el){ if(el._ph){ if(el._ph.parentNode) el._ph.parentNode.replaceChild(el, el._ph); el._ph=null; } });
    MAIN.querySelectorAll('.colset, .flow').forEach(function(x){ x.remove(); });
    applied.sect.forEach(function(r){ ALL[r[0]].style.gridTemplateColumns=''; });
    applied.span.forEach(function(r){ ALL[r[0]].style.gridColumn=''; });
    Object.keys(applied.cls).forEach(function(c){ applied.cls[c].forEach(function(i){ ALL[i].classList.remove(c); }); });
    applied.flows.forEach(function(f){ f.cols.forEach(function(col){ col.items.forEach(function(it){ ALL[it[0]].style.paddingLeft=''; ALL[it[0]].classList.remove('fhead'); }); }); });
    applied=null;
  }
  function applySnap(sn){
    unapply();
    sn.sect.forEach(function(r){ ALL[r[0]].style.gridTemplateColumns=r[1]; });
    sn.span.forEach(function(r){ ALL[r[0]].style.gridColumn=r[1]; });
    Object.keys(sn.cls).forEach(function(c){ sn.cls[c].forEach(function(i){ ALL[i].classList.add(c); }); });
    sn.sets.forEach(function(s){
      var p=ALL[s.p], first=ALL[s.items[0]]; if(!p || !first) return;
      var cs=document.createElement('div'); cs.className=s.c; cs.style.setProperty('--m', s.m); p.insertBefore(cs, first);
      cs._items=s.items.map(function(i){ return ALL[i]; });
      if(s.cols) s.cols.forEach(function(ids){ var col=document.createElement('div'); col.className='col'; cs.appendChild(col); ids.forEach(function(i){ mv(ALL[i], col); }); });
      else cs._items.forEach(function(x){ mv(x, cs); });
    });
    sn.flows.forEach(function(f){
      var tr=ALL[f.tr]; if(!tr) return;
      var fl=document.createElement('div'); fl.className='flow'; fl.style.setProperty('--m', f.m); tr.insertBefore(fl, tr.firstChild);
      f.cols.forEach(function(c){ var col=document.createElement('div'); col.className='col'; fl.appendChild(col);
        if(c.crumb){ var cr=document.createElement('div'); cr.className='crumb'; cr.setAttribute('aria-hidden','true'); cr.textContent=c.crumb; col.appendChild(cr); }
        c.items.forEach(function(it){ var el=ALL[it[0]]; if(!el) return; mv(el, col); el.style.paddingLeft=it[1]; if(it[2]) el.classList.add('fhead'); });
      });
    });
    applied=sn;
  }
  var eqAlignFn=eqAlign;   /* 「=」 줄 맞춤 — 구운 배치에도 따로 돈다(글자 위치 1회 측정) */
  var place=function(){
    if(LAYOUT){ var b=bpOf(); if(!b) return false; var sn=LAYOUT[b]; if(sn){ if(!applied || applied!==sn) applySnap(sn); if(eqAlignFn) eqAlignFn(); return true; } }
    relayout(); return true;
  };
  place();
  if(BAKE){
    /* 구울 때는 글자를 2% 넓게 — 크롬에 딱 맞게 구운 배치가 사파리(글자 폭 1~3px 다름)에서 넘쳐 가로 스크롤이 생기던 것(09-30 환경 확대법) */
    document.documentElement.classList.add('baking');
    var dump=function(){ relayout(); var pre=document.getElementById('pan-bake') || document.body.appendChild(Object.assign(document.createElement('pre'), {id:'pan-bake'})); pre.style.display='none'; pre.textContent=JSON.stringify({bp:bpOf(), w:document.documentElement.clientWidth, layout:snapshot()}); };
    window.addEventListener('load', function(){ if(document.fonts && document.fonts.ready) document.fonts.ready.then(dump); else dump(); });
  }
  /* 재배치가 끝난 뒤 꺾쇠·눈금(resize 로 재는 스크립트들)을 다시 재게 한다 — 09-30 「묶음표 깨짐」: 재배치(지연)보다 꺾쇠가 먼저 재던 것 */
  /* 09-30 동하 「퍼포먼스 문제 안 생김?」 — 배치 한 번 = PC 사회 70ms·국어 100ms(패드 2~4배). 열 때 서너 번 + 사파리는 스크롤 중
     주소창이 접히며 resize(높이만)를 쏜다 → 폭·폰트 상태가 지난 배치와 같으면 다시 계산하지 않는다 */
  /* 키 = 본문 폭만(웹폰트는 글자가 보일 때마다 조각을 받아 fonts.status 가 수시로 바뀐다 — 키에 넣으면 건너뛰기가 안 먹음, 09-30 실측) */
  /* 구운 배치가 있으면 키 = 구간(구간이 바뀔 때만 다시 놓음) */
  var layKey=function(){ if(LAYOUT) return 'bp'+bpOf(); var mw3=document.querySelector('main.wrap'); return String(mw3 ? mw3.clientWidth : 0); };
  var lastKey=layKey();   /* 위 첫 배치의 키 */
  var t=null, busy=false; function again(force){ var k=layKey(); if(force!==true && k===lastKey) return; lastKey=k; place(); busy=true; window.dispatchEvent(new Event('resize')); busy=false; }
  window.addEventListener('load', function(){ again(true); });   /* 로딩 끝·폰트 준비 = 글자 폭이 바뀌니 한 번씩 강제 */
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ again(true); });
  window.addEventListener('resize', function(){ if(busy) return; clearTimeout(t); t=setTimeout(again,120); });
  /* 09-30 앱 안 판(iframe)이 보이기 전에 불러져 폭 0으로 배치되고, 보일 때 resize 가 안 와서 「1단」 그대로 남던 것
     (동하 패드 「앱 커밋은 바로 반영됐는데 회독이 그대로」) → 본문 폭이 바뀌면(0 → 실제 폭 포함) 다시 배치 */
  if(window.ResizeObserver){
    var mw=document.querySelector('main.wrap'), lastW=mw ? mw.clientWidth : 0;
    if(mw) new ResizeObserver(function(){ var w=mw.clientWidth; if(Math.abs(w-lastW)<2) return; lastW=w; if(busy) return; clearTimeout(t); t=setTimeout(again,60); }).observe(mw);
  }
  document.addEventListener('visibilitychange', function(){ if(!document.hidden){ clearTimeout(t); t=setTimeout(again,60); } });
  /* 숨은 프레임에서는 ResizeObserver 알림도 안 온다(09-30 실측) → 폭이 0이면 생길 때까지 0.25초마다 보고 생기면 다시 배치 */
  (function waitW(){ var mw2=document.querySelector('main.wrap'); if(!mw2 || mw2.clientWidth>0) return;
    var iv=setInterval(function(){ if(mw2.clientWidth>0){ clearInterval(iv); again(); } }, 250); })();
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
      /* 10-10 동하 「꺽쇠 이상」(체육 피드백): 끝 항목이 하위 묶음을 달고 있으면 팔이 그 덩어리 가운데(하위 항목 쪽)를 겨눴다 → 항목의 첫 줄을 겨눈다 */
      var head = function(el){ return (el.querySelector(':scope > .bracket, :scope > .kids, :scope > .fork, :scope > .stack, :scope > .ind') && el.firstElementChild) ? el.firstElementChild : el; };
      var a = head(kids[0]).getBoundingClientRect();
      var b = head(kids[kids.length-1]).getBoundingClientRect();
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
  /* 10-01 독립검수 H2(동하 승인 · 사회 제외 = dae-big): 접기(▾)도 태그가 아니라 역할로 — 절(r-jeol)이면 h2·h3·h4 모두 · 대단(r-dae)은 배너라 ▾ 없음(대단 한 벌) */
  var DB=document.documentElement.classList.contains('dae-big');
  [].slice.call(document.querySelectorAll('main.wrap > h2, main.wrap .pg > h2, main.wrap .pg > h3'))
    .forEach(function(h){ if(DB && h.classList.contains('r-dae')) return; h.classList.add('tg');
      h.addEventListener('click',function(ev){
        if(ev.target.closest('a'))return;
        setClosed(h,!h.classList.contains('closed'));});});
  /* 칸 격자(.sect) 안 절 제목 — 범위 = 제 블록의 나머지 + 다음 절·대단·절 표시 블록 전까지의 블록 */
  function blkList(b){ var s=b && b.closest('.sect'); return s ? [].slice.call(s.querySelectorAll(':scope > .pg > .blk')) : []; }
  function isBound(e){ return e.classList.contains('runhead') || !!e.querySelector(':scope > .r-jeol, :scope > .r-dae'); }
  function rangeB(h){
    var b=h.parentElement, out=[], s, L=blkList(b);
    for(s=h.nextElementSibling; s; s=s.nextElementSibling) out.push(s);
    for(var j=L.indexOf(b)+1; j<L.length && !isBound(L[j]); j++) out.push(L[j]);
    return out; }
  function setClosedB(h,c){ h.classList.toggle('closed',c); rangeB(h).forEach(function(e){ e.classList.toggle('clpsd',c); }); }
  /* 10-01 동하 「나머지 다 정리」(사회 4): 사회 H3 단원 절(5단원~ · 칸 격자 안 머리줄)에도 ▾ — 다른 단원(h2 절)과 같은 접기 · 모양은 kit.css */
  var JB=DB || window.PAN_HOIST===false;
  if(JB) [].forEach.call(main.querySelectorAll('.sect .blk.hrow > .r-jeol'), function(h){
    h.classList.add('tg');
    h.addEventListener('click',function(ev){ if(ev.target.closest('a')) return; setClosedB(h,!h.classList.contains('closed')); });
  });
  function openB(el){
    var b=el.closest && el.closest('.sect .blk'); if(!b) return; var L=blkList(b);
    for(var j=L.indexOf(b); j>=0; j--){ var hj=L[j].querySelector(':scope > .r-jeol'); if(hj){ if(hj.classList.contains('closed')) setClosedB(hj,false); break; } if(isBound(L[j])) break; } }
  function expandTo(id){
    if(!id)return; var el=document.getElementById(id); if(!el)return;
    var node=el, i=flow.indexOf(node);
    while(i<0&&node&&node!==main){node=node.parentElement; i=flow.indexOf(node);}
    for(var j=i;j>=0;j--){var e=flow[j];
      if(e.tagName==='H3'||e.tagName==='H2'){
        if(e.classList.contains('closed'))setClosed(e,false);
        if(e.tagName==='H2')break;}}
    if(JB) openB(el);
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
      if(save){ try{ localStorage.setItem(KEY,o?'1':'0'); }catch(e){} }
      /* 본문 폭이 바뀌었으니 배치 구간을 다시 고르게(H3 · ResizeObserver 가 없는 환경 대비) */
      setTimeout(function(){ window.dispatchEvent(new Event('resize')); }, 30); }
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
