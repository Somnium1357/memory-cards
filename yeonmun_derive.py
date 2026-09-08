# -*- coding: utf-8 -*-
"""연문 상태 파생 — `cards-yeonmun.json`(이벤트 로그 · data 브랜치) → 문항/단위 상태. 앱 `ymDerive()`와 **같은 규칙**의 파이썬 참조 구현.

정본 규칙 = skills\card\카드앱_구조안내.md §7.5.  앱(cards.html `ymDerive`)과 이 파일이 갈리면 앱이 정본이다 — 둘 다 고쳐라.
등가성 검사 = app_tools 헤드리스에서 같은 이벤트로 JS 파생값을 뽑아 이 모듈 출력과 대조했다(2026-09-09 · 커밋 본문).

파일  {v:1, ev:[{i,t,k,m,ref?}]}   i 이벤트 id · t ISO(UTC 'Z' 또는 오프셋) · k 문항키('과목/p<문제면>/<인쇄번호>') 또는 단위키('과목/NN') · m 아래
m     ✓ △ ? ○ -   표시(문항 · '-' = 지움)     ▽ 닫힘     x 또 틀림     done 단위 풀었음(단위키)     u 되돌리기(ref = 무르는 이벤트 id)
사다리 ✓ → due = 표시일+3 · n+1 / △ → +7 / x → n+1 · +7 · 표시 ✓ / ? ○ - → due 없음 / ▽ → closed · due 없음 · n 유지
      due가 목요일이면 금요일 · 하루 경계 04시(KST) · 날짜 키 'YYYY-MM-DD'

사용  python yeonmun_derive.py cards-yeonmun.json [--today YYYY-MM-DD]   → 오늘 due 문항과 상태를 JSON으로 찍는다
      import yeonmun_derive as yd; st = yd.derive(events); due = yd.due_today(st, today)
"""
import sys, json, io, datetime

KST = datetime.timezone(datetime.timedelta(hours=9))
DAY_CUT = 4                       # 앱 DAY_CUT — 04시 경계

def parse_iso(t):
    t = t.strip()
    if t.endswith("Z"):
        t = t[:-1] + "+00:00"
    d = datetime.datetime.fromisoformat(t)
    if d.tzinfo is None:
        d = d.replace(tzinfo=KST)
    return d.astimezone(KST)

def day_key(t):
    """ISO 시각 → 앱의 dayKey (KST · 04시 이전은 전날)."""
    d = parse_iso(t) - datetime.timedelta(hours=DAY_CUT)
    return d.strftime("%Y-%m-%d")

def dk_add(k, n):
    d = datetime.date.fromisoformat(k) + datetime.timedelta(days=n)
    return d.isoformat()

def due_from(t, days):
    """표시 시각 + days · 목요일이면 금요일로 (앱 ymDueFrom)."""
    k = dk_add(day_key(t), days)
    if datetime.date.fromisoformat(k).weekday() == 3:   # 월=0 … 목=3
        k = dk_add(k, 1)
    return k

def sort_key(e):
    return (e["t"], e["i"])

def derive(events):
    """→ {'items': {key: {m, due, closed, n, at}}, 'units': {key: {done}}}  (앱 ymDerive와 동일)"""
    ev = sorted([e for e in events if e and e.get("i") and e.get("t") and e.get("k") and e.get("m")], key=sort_key)
    undone = {e["ref"] for e in ev if e["m"] == "u" and e.get("ref")}
    items, units = {}, {}
    for e in ev:
        if e["m"] == "u" or e["i"] in undone:
            continue
        if e["m"] == "done":
            u = units.setdefault(e["k"], {"done": None})
            if not u["done"]:
                u["done"] = day_key(e["t"])
            continue
        it = items.setdefault(e["k"], {"m": None, "due": None, "closed": False, "n": 0, "at": None})
        it["at"] = e["t"]
        m = e["m"]
        if m == "▽":
            it["closed"] = True; it["due"] = None; continue
        if m == "x":
            it["closed"] = False; it["n"] += 1; it["m"] = "✓"; it["due"] = due_from(e["t"], 7); continue
        it["closed"] = False
        it["m"] = None if m == "-" else m
        if m == "✓":
            it["due"] = due_from(e["t"], 3); it["n"] += 1
        elif m == "△":
            it["due"] = due_from(e["t"], 7)
        else:
            it["due"] = None
    return {"items": items, "units": units}

def due_today(state, today=None):
    """오늘 다시 풀 문항 = due ≤ 오늘 · 안 닫힌 것 (앱 ymDueToday · 정렬은 due, 키)."""
    today = today or day_key(datetime.datetime.now(KST).isoformat())
    out = [(k, s) for k, s in state["items"].items() if not s["closed"] and s["due"] and s["due"] <= today]
    out.sort(key=lambda x: (x[1]["due"], x[0]))
    return out

def main(argv):
    if len(argv) < 2:
        print(__doc__); return 1
    d = json.load(io.open(argv[1], encoding="utf-8"))
    today = argv[argv.index("--today") + 1] if "--today" in argv else None
    st = derive(d.get("ev", []))
    due = due_today(st, today)
    print(json.dumps({"today": today or day_key(datetime.datetime.now(KST).isoformat()),
                      "events": len(d.get("ev", [])), "items": len(st["items"]), "units_done": sum(1 for u in st["units"].values() if u["done"]),
                      "due": [{"key": k, **s} for k, s in due]}, ensure_ascii=False, indent=1))
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))
