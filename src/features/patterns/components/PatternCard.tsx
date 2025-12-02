// src/features/patterns/components/PatternCard.tsx
import * as React from "react";

import type { Pattern, SectionKind } from "../patterns";

interface PatternCardProps {
  pattern: Pattern;
  onSelect?: (pattern: Pattern) => void;
}

const SECTION_LABEL: Record<SectionKind, string> = {
  search: "Search",
  single: "Single",
  grid: "Grid",
  tab: "Tab",
};

const SECTION_COLOR_CLASS: Record<SectionKind, string> = {
  search: "bg-sky-100 border-sky-300",
  single: "bg-emerald-100 border-emerald-300",
  grid: "bg-amber-100 border-amber-300",
  tab: "bg-violet-100 border-violet-300",
};

export function PatternCard({ pattern, onSelect }: PatternCardProps) {
  const handleClick = () => {
    onSelect?.(pattern);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        group flex flex-col justify-between rounded-xl border border-slate-200
        bg-white p-4 shadow-sm transition hover:-translate-y-0.5
        hover:border-sky-400 hover:shadow-md text-left w-full
      "
    >
      {/* 썸네일 영역 */}
      <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
        <div className="flex flex-col gap-1">
          {pattern.sections.length === 0 ? (
            <div className="flex h-20 items-center justify-center text-xs text-slate-400">
              빈 화면
            </div>
          ) : (
            pattern.sections.map((s, idx) => (
              <div
                key={`${pattern.id}-section-${idx}`}
                className={`
                  flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]
                  ${SECTION_COLOR_CLASS[s.type]}
                `}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-slate-500/70" />
                <span className="font-medium text-slate-700">
                  {SECTION_LABEL[s.type]}
                </span>
                {s.title && (
                  <span className="truncate text-[10px] text-slate-500">
                    · {s.title}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 텍스트 정보 영역 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {pattern.name}
          </h3>
          {pattern.category && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {pattern.category}
            </span>
          )}
        </div>
        {pattern.description && (
          <p className="line-clamp-2 text-xs text-slate-500">
            {pattern.description}
          </p>
        )}
      </div>

      {/* 하단 액션 텍스트 */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-medium text-sky-600 group-hover:text-sky-700">
          이 패턴으로 시작하기
        </span>
        <span className="text-slate-400">클릭해서 선택</span>
      </div>
    </button>
  );
}
