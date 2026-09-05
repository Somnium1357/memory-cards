#!/bin/bash
# 앱 소유 파일(marks·sessions·log-*)은 data 브랜치에 산다(Pages 스로틀 2단계 · 2026-09-05).
# main 작업 트리의 사본은 git이 무시하는 로컬 복사본이다 — 이 스크립트가 origin/data에서 새로 채운다.
# 쓰는 곳: 로컬 프리뷰(8571)·헤드리스 재측정·QC fsrs_opt.py(작업 트리를 읽는다).
cd "$(dirname "$0")" && git fetch -q origin data || exit 1
for f in $(git ls-tree --name-only origin/data | grep -E '^cards-(marks|sessions|log-.*)\.json$'); do git show "origin/data:$f" > "$f"; done
echo "refreshed: $(git ls-tree --name-only origin/data | grep -cE '^cards-(marks|sessions|log-.*)\.json$') files from origin/data"
