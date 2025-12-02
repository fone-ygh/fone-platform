// src/features/patterns/components/PatternListPage.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Pattern, PATTERNS } from "../patterns";
import { PatternCard } from "./PatternCard";

export function PatternList() {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return PATTERNS;
    return PATTERNS.filter(p => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });
  }, [keyword]);

  const handleSelect = (pattern: Pattern) => {
    // 여기서 editor로 네비게이션
    // 예: /editor/new?patternId=search-grid-basic
    const url = `/editor/new?patternId=${encodeURIComponent(pattern.id)}`;
    router.push(url);
  };

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 px-6 py-8">
      {/* 헤더 */}
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            화면 패턴 선택
          </h1>
          <p className="text-xs text-slate-500">
            자주 사용하는 Search / Single / Grid / Tab 조합 패턴 중 하나를
            선택해서 화면 설계를 시작할 수 있어요.
          </p>
        </div>
        <div className="mt-3 md:mt-0">
          <input
            type="search"
            placeholder="패턴 이름, 유형으로 검색..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="
              w-full rounded-md border border-slate-200 bg-white px-3 py-1.5
              text-xs text-slate-800 shadow-sm outline-none
              focus:border-sky-500 focus:ring-1 focus:ring-sky-200
            "
          />
        </div>
      </header>

      {/* 패턴 그리드 */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(pattern => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            onSelect={handleSelect}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-slate-400">
            검색 결과에 해당하는 패턴이 없습니다.
          </div>
        )}
      </section>
    </div>
  );
}
