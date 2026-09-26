# -*- coding: utf-8 -*-
"""연문 카탈로그 빌드 — QC 인덱스(tsv) → yeonmun-catalog.json (정적 · 빌드 시 생성)

발주 = skills\card\연문트랙_앱과업_2026-09-08.md §2·§5.  인덱스 소유 = QC (바뀌면 QC가 통보한다 → 이 스크립트를 다시 돌린다).
인덱스 재생성(QC 몫) = python .claude\skills\card\scripts\yeonmun_index.py
🔴 인덱스 해석 규칙은 전부 QC 답(2026-09-08)에서 왔다 — 여기서 새로 해석하지 않는다(동하: 「필요한 정보 QC 쪽에 물어봐」).

입력
  <IDX>\_연문인덱스_<과목>.tsv  ×12 : 열 6개 고정 = 문항 · 문제면 · 해설면 · 연문절 · 덮는노드 · 각론원문
      · 「문항」 = 인쇄된 문항 번호(2~3자리 · 앞 0) — 절마다 01로 되돌아가는 과목은 `(등장순번)`을 붙인다 (예 01 · 173 · 01(26))
        🔴 합본 전체 순번이 아니고, `(등장순번)`은 검출이 바뀔 때마다 밀린다(09-08 밤 +127이 증거).
        🔴 안정 id = **과목/p<문제면>/<인쇄번호>** (메타 09-08 정정 · 예 1.국어/p16/29) — 면과 인쇄 번호는 클린 합본이 고정이고 한 면 안에서 인쇄 번호는 고유하다.
           등장 순번은 정렬용 속성(seq)으로만.
      · 문제면·해설면 = 합본 면 정수 · 파일 안 줄 순서 = 합본 등장 순
      · 덮는노드 = spec 노드 **이름**(대개 중주제) · ';' 구분
  <IDX>\_매핑표_3단계.tsv : 과목 · 출처 · 단원파일 · 단원명 · 면범위 · 덮는_spec_노드
      · 조인 = 매핑표 「단원파일」 == 인덱스 「연문절」
      · 줄 순서 = 면범위 오름차순 = 합본 등장 순  →  단위 순번은 이 순서로 (문항 0인 단위를 뺀 뒤 매긴다)
      · 「단원명」 앞 ★ = 내부 표시(단원명이 spec 노드 이름이 아니라는 뜻) — 화면에 내지 않는다 · 떼고 쓴다
      · 문항 0인 단위(수학 계산원리 5 + 수학 학습 이론 1 = 합본에 없는 단원)는 **뺀다**

출력
  yeonmun-catalog.json  {v, built, subjects, units:[…], items:[…], stats}
    unit = {id:'과목/NN', subj, seq, name(단원파일-.txt), label(★ 뗀 단원명), star, pages, kind('topic'|'range'), range('첫~끝'), nodes[], items[ids]}
    item = {id:'과목/p<문제면>/<인쇄번호>', subj, unit, no(인쇄번호 · 괄호 뗀 것), key(인덱스 원문), seq(과목 내 등장 순), q(문제면), a(해설면), nodes[]}
    kind: 국·수·영·과 = 주제형('topic' · 이름이 1차 라벨) / 그 밖 = 구간형('range' · 문항 범위가 1차 라벨 — 메타 09-08)

검증 출력(매번 찍는다 — 값이 흔들리면 인덱스가 바뀐 것이다)
  문항 수 · 단위 수(문항 있는 것) · 문항 0 단위 · 문항 매칭(카드 ≥1) · 고유 노드 매칭/실패 · 번호 구멍 · 중복 문항키
"""
import io, os, sys, json, glob, datetime, collections

TAB = chr(9)
IDX = r"C:\Users\faren\.claude\skills\card\사례풀"
HERE = os.path.dirname(os.path.abspath(__file__))
CARDS = os.path.join(HERE, "cards-data.json")
OUT = os.path.join(HERE, "yeonmun-catalog.json")
TOPIC_SUBJ = {"1.국어", "2.수학", "3.영어", "6.과학"}   # 주제로 갈린 과목 → 이름이 1차 라벨
# 🔴 종이책 소스 「중기뽀」(발주 skills\card\중기뽀_연문소스_앱과업_2026-09-19.md · 동하 09-19 「문항 번호만 쭉 빼주면」) — PDF·면·노드 없음 · 번호만.
#    문항 키 = <과목>/중기뽀/<번호 두 자리> · 단위 = 10문항씩 <과목>/중기뽀-NN(「중기뽀 01~10번」) · 기존 강사 연문 뒤(과목 안 seq 이어서) · kind "paper" · q/a None · nodes [].
#    과목 안 번호는 1~N 연속 가정(책이 절마다 번호를 다시 시작하면 동하가 한 줄 → 그때 절/번호 키).
PAPER_SOURCES = [   # (소스명, 과목별 문항 수) — 과목 안 순서 = 강사 연문 → 여기 순서대로
    ("중기뽀", {"9.미술": 61, "8.음악": 78, "7.체육": 39, "6.과학": 81, "2.수학": 20, "5.도덕": 85, "4.사회": 67, "1.국어": 76}),   # 동하 09-19 · 합 507
    ("강사중등", {"1.국어": 49, "3.영어": 41}),   # 강사 중등기출 선별집(발주 09-22 · 국어 01.~49. · 영어 = 답안지 01~41 정본 · 문제지 등장 순과 첫 5문항 대조 일치) · 합 90
]
PAPER_SRC = PAPER_SOURCES[0][0]

def rows(path):
    txt = io.open(path, encoding="utf-8").read().split(chr(10))
    out = []
    for ln in txt:
        if not ln.strip():
            continue
        out.append([c.strip() for c in ln.rstrip(chr(13)).split(TAB)])
    return out

def printed(key):
    """문항키 '01(26)' → '01' (인쇄된 번호만) · '173' → '173'"""
    k = key.strip()
    return k[:k.index("(")].strip() if "(" in k else k

def item_id(subj, q, key):
    return subj + "/p" + str(q) + "/" + printed(key)

def num_part(key):
    """문항키 '01(26)' → 26 (괄호가 있으면 등장순번), '173' → 173. 구멍 검사용."""
    k = key.strip()
    if "(" in k and k.endswith(")"):
        inner = k[k.index("(") + 1 : -1]
        return int(inner) if inner.isdigit() else None
    return int(k) if k.isdigit() else None

def main():
    # ── 카드 노드 마디(과목 마디 제외) — 매칭 검증용
    cards = json.load(io.open(CARDS, encoding="utf-8"))["cards"]
    segs = collections.defaultdict(set)
    for c in cards:
        parts = [p for p in str(c.get("node") or "").split("/") if p]
        for p in parts[1:]:
            segs[c["subj"]].add(p.strip())

    # ── 인덱스 12개
    items_by_subj = collections.OrderedDict()
    for f in sorted(glob.glob(os.path.join(IDX, "_연문인덱스_*.tsv"))):
        subj = os.path.basename(f)[len("_연문인덱스_"):-len(".tsv")]
        rs = rows(f)
        hdr = rs[0]
        assert len(hdr) == 6, (subj, hdr)
        lst = []
        for r in rs[1:]:
            assert len(r) == 6, (subj, r[:2])
            no, q, a, unit_file, nodes, _src = r
            assert q.isdigit() and a.isdigit(), (subj, no, q, a)
            lst.append({"no": no, "q": int(q), "a": int(a), "unit_file": unit_file,
                        "nodes": [x.strip() for x in nodes.split(";") if x.strip()]})
        items_by_subj[subj] = lst

    # ── 매핑표 (줄 순서 = 합본 등장 순)
    mp = rows(os.path.join(IDX, "_매핑표_3단계.tsv"))
    assert mp[0][:6] == ["과목", "출처", "단원파일", "단원명", "면범위", "덮는_spec_노드"], mp[0]
    units = []
    empty_units = []
    seq_by_subj = collections.Counter()
    # 🔴 **한 단원파일이 여러 줄이면 = 소제목 조각** (동하 09-26 「쪼개라 해」 · 메타 인계 · 경계 = QC 매핑표의 줄별 면범위).
    #    조각은 부모 번호 하나를 같이 쓰고 id = 과목/NN-k(1부터) · 다른 단위 번호는 안 밀린다(done·skip 이벤트가 단위 키에 붙어 있다).
    #    문항 배정 = 문제면(q)이 그 줄 면범위 안. 한 줄뿐이면 종전 그대로(id 과목/NN).
    file_rows = collections.Counter((r + [""] * 6)[0] + "|" + (r + [""] * 6)[2] for r in mp[1:])
    group_seq, group_k = {}, collections.Counter()
    def in_pages(q, pages):
        try:
            a_, b_ = (pages.split("-") + [pages])[:2]
            return int(a_) <= int(q) <= int(b_)
        except Exception:
            return False
    for r in mp[1:]:
        subj, _src, unit_file, label, pages, spec_nodes = (r + [""] * 6)[:6]
        its = [it for it in items_by_subj.get(subj, []) if it["unit_file"] == unit_file]
        gk = subj + "|" + unit_file
        split = file_rows[gk] > 1
        if split:
            its = [it for it in its if in_pages(it["q"], pages)]
        if not its:
            empty_units.append(subj + " | " + unit_file + ((" | " + pages) if split else ""))
            continue
        if split:
            if gk not in group_seq:
                seq_by_subj[subj] += 1
                group_seq[gk] = seq_by_subj[subj]
            group_k[gk] += 1
            uid = subj + "/" + ("%02d" % group_seq[gk]) + "-" + str(group_k[gk])
        else:
            seq_by_subj[subj] += 1
            uid = subj + "/" + ("%02d" % seq_by_subj[subj])
        star = label.startswith("★")
        label_clean = label.lstrip("★").strip()
        name = unit_file[:-4] if unit_file.endswith(".txt") else unit_file
        nodes = []
        for x in spec_nodes.split(";"):
            x = x.strip()
            if x and x not in nodes:
                nodes.append(x)
        for it in its:
            for x in it["nodes"]:
                if x not in nodes:
                    nodes.append(x)
        units.append({"id": uid, "subj": subj, "seq": (group_seq[gk] + group_k[gk] / 100.0) if split else seq_by_subj[subj], "name": name, "label": label_clean,
                      "star": star, "pages": pages, "kind": "topic" if subj in TOPIC_SUBJ else "range",
                      "range": printed(its[0]["no"]) + "~" + printed(its[-1]["no"]), "nodes": nodes,
                      "items": [item_id(subj, it["q"], it["no"]) for it in its]})
        for it in its:
            it["unit"] = uid

    # ── 🔴 구간형 과목(사회·도덕·음악·미술·체육·실과·통합·총창)은 **문항 10개씩** 재절단 (동하 결정 09-15 「절 안 끊긴 애들은 1~10번 이런 식으로 임의로 끊어줘」).
    #    매핑표 단위(절)는 이 과목들에서 버리고, 과목 안 등장 순으로 10개씩 묶어 「01~10번」 꼴 단위를 만든다(꼬리는 남는 만큼).
    #    문항 id·키는 그대로(표시·사다리·due는 문항 키 기준이라 살아남는다) · 단위 id만 새로 매긴다. 주제형 넷(국·수·영·과)은 절 단위 그대로.
    CHUNK = 10
    for subj, lst in items_by_subj.items():
        if subj in TOPIC_SUBJ or not lst:
            continue
        units = [u for u in units if u["subj"] != subj]
        seq_by_subj[subj] = 0
        for k in range(0, len(lst), CHUNK):
            its = lst[k:k + CHUNK]
            seq_by_subj[subj] += 1
            uid = subj + "/" + ("%02d" % seq_by_subj[subj])
            nodes = []
            for it in its:
                for x in it["nodes"]:
                    if x not in nodes:
                        nodes.append(x)
            rng = printed(its[0]["no"]) + ("~" + printed(its[-1]["no"]) if len(its) > 1 else "")   # 꼬리 한 문항이면 「41번」
            qs = sorted(set(int(it["q"]) for it in its if str(it["q"]).isdigit()))
            units.append({"id": uid, "subj": subj, "seq": seq_by_subj[subj], "name": rng + "번", "label": rng + "번",
                          "star": False, "pages": (str(qs[0]) + ("-" + str(qs[-1]) if len(qs) > 1 else "")) if qs else "",
                          "kind": "range", "range": rng, "nodes": nodes,
                          "items": [item_id(subj, it["q"], it["no"]) for it in its]})
            for it in its:
                it["unit"] = uid
        units.sort(key=lambda u: (u["subj"], u["seq"]))

    # ── 종이책 소스 「중기뽀」 — 과목마다 기존 단위·문항 뒤에 붙인다 (id 불변 · 기존 1,100 키에 손대지 않는다)
    paper_units, paper_items = [], []
    paper_stats = {}
    for subj in items_by_subj.keys():
        base_seq = len(items_by_subj[subj])
        for src, per in PAPER_SOURCES:
            n = per.get(subj)
            if not n:
                continue
            st = paper_stats.setdefault(src, {"items": 0, "units": 0, "per_subject": {}})
            st["per_subject"][subj] = n
            for k in range(0, n, CHUNK):
                nos = list(range(k + 1, min(k + CHUNK, n) + 1))
                seq_by_subj[subj] += 1
                uid = subj + "/" + src + "-" + ("%02d" % (k // CHUNK + 1))
                rng = "%02d" % nos[0] + ("~%02d" % nos[-1] if len(nos) > 1 else "")
                ids = [subj + "/" + src + "/" + ("%02d" % no) for no in nos]
                paper_units.append({"id": uid, "subj": subj, "seq": seq_by_subj[subj], "name": src + " " + rng + "번", "label": src + " " + rng + "번",
                                    "star": False, "pages": "", "kind": "paper", "src": src, "range": rng, "nodes": [], "items": ids})
                st["units"] += 1
                for no, iid in zip(nos, ids):
                    paper_items.append({"id": iid, "subj": subj, "unit": uid, "no": "%02d" % no, "key": "%02d" % no, "seq": base_seq + no,
                                        "q": None, "a": None, "nodes": [], "src": src})
                    st["items"] += 1
            base_seq += n
    units.extend(paper_units)
    units.sort(key=lambda u: (u["subj"], u["seq"]))

    # ── 문항 (과목 내 등장 순)
    items = []
    dup = []
    for subj, lst in items_by_subj.items():
        seen = set()
        for i, it in enumerate(lst):
            iid = item_id(subj, it["q"], it["no"])
            if iid in seen:
                dup.append(iid)
            seen.add(iid)
            assert it.get("unit"), ("단위 없는 문항", iid, it["unit_file"])
            items.append({"id": iid, "subj": subj, "unit": it["unit"], "no": printed(it["no"]), "key": it["no"], "seq": i + 1,
                          "q": it["q"], "a": it["a"], "nodes": it["nodes"]})

    n_lect = len(items)                     # 강사 연문 문항 수(중기뽀 전)
    items.extend(paper_items)
    if len(set(x["id"] for x in items)) != len(items):
        dup.append("PAPER-DUP")

    # ── 검증: 노드 매칭 (QC 규칙 = 덮는노드 == 같은 과목 카드 node 경로의 어느 마디, 과목 마디 제외)
    node_names, node_hit = set(), set()
    item_hit = 0
    for it in items:
        if it.get("src"):
            continue
        hit = 0
        for nd in it["nodes"]:
            node_names.add((it["subj"], nd))
            if nd in segs.get(it["subj"], ()):
                node_hit.add((it["subj"], nd)); hit += 1
        if hit:
            item_hit += 1
    node_fail = sorted(node_names - node_hit)

    # ── 검증: 번호 구멍 (과목 안에서 숫자 부분의 빠진 정수)
    holes = {}
    for subj, lst in items_by_subj.items():
        nums = sorted({n for n in (num_part(it["no"]) for it in lst) if n is not None})
        if nums:
            miss = [n for n in range(nums[0], nums[-1] + 1) if n not in set(nums)]
            if miss:
                holes[subj] = miss

    stats = {
        "items": len(items), "units": len(units), "units_empty": len(empty_units),
        "item_match": item_hit, "node_names": len(node_names), "node_match": len(node_hit),
        "node_fail": len(node_fail), "dup_item_ids": len(dup), "holes": holes,
        "per_subject": {s: {"items": len(l), "units": seq_by_subj[s]} for s, l in items_by_subj.items()},
        "paper": paper_stats, "paper_total": {"items": len(paper_items), "units": len(paper_units)},
        "lecture_items": n_lect,
    }
    cat = {"v": 1, "built": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
           "index_dir": IDX, "subjects": list(items_by_subj.keys()),
           "units": units, "items": items, "stats": stats}
    io.open(OUT, "w", encoding="utf-8", newline=chr(10)).write(json.dumps(cat, ensure_ascii=False, separators=(",", ":")))

    # ── 보고
    print("yeonmun-catalog.json  v%d  built %s" % (cat["v"], cat["built"]))
    print("문항 %d (강사 연문 %d + 종이 %d) · 단위 %d (종이 %d) · 문항 0 단위 %d (뺌) · 종이 소스 %s" % (len(items), n_lect, len(paper_items), len(units), len(paper_units), len(empty_units), json.dumps({k: (v["items"], v["units"]) for k, v in paper_stats.items()}, ensure_ascii=False)))
    for e in empty_units:
        print("   뺀 단위:", e)
    print("문항 매칭(카드 ≥1) %d/%d (중기뽀 제외) · 고유 노드 %d 중 매칭 %d · 실패 %d" %
          (item_hit, n_lect, len(node_names), len(node_hit), len(node_fail)))
    print("중복 문항키 %d %s" % (len(dup), dup[:5]))
    print("번호 구멍:", holes if holes else "없음")
    print("과목별:", json.dumps(stats["per_subject"], ensure_ascii=False))
    side = os.path.join(HERE, "yeonmun-catalog.check.txt")
    io.open(side, "w", encoding="utf-8", newline=chr(10)).write(
        "node_fail (%d)\n" % len(node_fail) + "\n".join("%s\t%s" % x for x in node_fail) +
        "\n\nempty_units (%d)\n" % len(empty_units) + "\n".join(empty_units) +
        "\n\nholes\n" + json.dumps(holes, ensure_ascii=False))
    print("상세 →", os.path.basename(side), "(레포에 안 넣는다 · .gitignore)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
