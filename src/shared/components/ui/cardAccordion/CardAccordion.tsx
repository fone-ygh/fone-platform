// src/components/ui/AsideCardAccordion.tsx
"use client";

import React from "react";
import styled from "@emotion/styled";

/* -------------------------------------------
   Collapse (측정 기반 height 전환: 완전히 닫힘)
-------------------------------------------- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(!!m?.matches);
    on();
    m?.addEventListener?.("change", on);
    return () => m?.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

function Collapse({
  open,
  duration = 220,
  children,
  className,
  style,
  onRest,
}: {
  open: boolean;
  duration?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onRest?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.style.height = open ? "auto" : "0px";
      return;
    }

    const currentHeight = el.getBoundingClientRect().height;
    const targetHeight = open ? el.scrollHeight : 0;

    el.style.height = `${currentHeight}px`;
    el.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => {
      el.style.transition = `height ${duration}ms ease`;
      el.style.height = `${targetHeight}px`;
    });

    const clean = () => {
      el.style.transition = "";
      if (open) el.style.height = "auto";
      else el.style.height = "0px";
      onRest?.();
    };

    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === "height") {
        el.removeEventListener("transitionend", onEnd);
        clean();
      }
    };
    el.addEventListener("transitionend", onEnd);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("transitionend", onEnd);
    };
  }, [open, duration, reduced, onRest]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ height: open ? "auto" : 0, overflow: "hidden", ...style }}
      aria-hidden={!open}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------
   Card (기본 카드 + 아코디언 스타일 토큰)
-------------------------------------------- */
export const Card = styled.section`
  /* ===== Card tokens ===== */
  --card-bg: #ffffff;
  --card-fg: #0f172a;
  --card-sub: #64748b;

  --card-bd: #e6edf5;
  --card-divider: #e5eaf3;

  --card-radius: 12px;
  --card-pad: 12px;
  --card-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
  --card-ring: 0 0 0 0.32rem rgba(99, 102, 241, 0.12);

  /* ===== Accordion tokens ===== */
  --acc-gap: 10px;
  --acc-item-bg: #fff;
  --acc-item-bd: #e7ecf7;
  --acc-item-radius: 10px;

  --acc-trigger-fg: #0f172a;
  --acc-trigger-fz: 1.3rem;
  --acc-trigger-fw: 700;
  --acc-trigger-pad-y: 0.9rem;
  --acc-trigger-pad-x: 1rem;

  --acc-caret-size: 1.2rem;
  --acc-caret-rotate: 90deg;

  --acc-panel-pad: 1rem;

  /* ===== Controls tokens (아이콘 버튼) ===== */
  --ctrl-size: 28px;
  --ctrl-radius: 8px;
  --ctrl-ico: 16px;

  position: relative;
  display: grid;
  gap: 10px;

  background: var(--card-bg);
  color: var(--card-fg);
  border: 1px solid var(--card-bd);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: var(--card-pad);

  transition:
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    transform 0.1s ease,
    background-color 0.18s ease;

  /* 스크린리더 전용 */
  .sr-only {
    position: absolute !important;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .acc-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* 헤드 */
  .card-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    min-height: 2.8rem;
  }
  .card-title {
    margin: 0;
    padding: 0;
    font-weight: 800;
    font-size: 1.4rem;
    letter-spacing: -0.01em;
    color: #0b1220;
  }
  .card-divider {
    height: 1px;
    background: var(--card-divider);
    margin: 0.2rem 0 0.6rem 0;
  }

  /* 컨트롤: 아이콘 버튼 */
  .acc-actions {
    margin-left: auto;
    display: inline-flex;
    gap: 0.4rem;
  }
  .acc-ctrl {
    appearance: none;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    width: var(--ctrl-size);
    height: var(--ctrl-size);
    border-radius: var(--ctrl-radius);
    display: grid;
    place-items: center;
    cursor: pointer;
    color: #0f172a;

    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      transform 0.06s ease;
  }
  .acc-ctrl:hover {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 0.24rem rgba(99, 102, 241, 0.08);
    background: #f3f6fb;
  }
  .acc-ctrl:active {
    transform: translateY(1px);
  }
  .acc-ctrl:focus-visible {
    outline: none;
    box-shadow: var(--card-ring);
  }
  .acc-ctrl svg {
    width: var(--ctrl-ico);
    height: var(--ctrl-ico);
  }

  /* 리스트/아이템 */
  .acc-list {
    display: grid;
    gap: var(--acc-gap);
  }
  .acc-item {
    border: 1px solid var(--acc-item-bd);
    border-radius: var(--acc-item-radius);
    background: var(--acc-item-bg);
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    overflow: hidden;
  }
  .acc-item:hover {
    border-color: #d5def0;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  }
  .acc-item[data-open="true"] {
    border-color: #cfd8ea;
    background: #fcfdff;
    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05);
  }

  /* 트리거 */
  .acc-trigger {
    width: 100%;
    background: transparent;
    border: 0;
    text-align: left;

    display: grid;
    grid-template-columns: var(--acc-caret-size) 1fr auto;
    align-items: center;
    gap: 0.8rem;

    padding: var(--acc-trigger-pad-y) var(--acc-trigger-pad-x);
    cursor: pointer;
    font-weight: var(--acc-trigger-fw);
    font-size: var(--acc-trigger-fz);
    color: var(--acc-trigger-fg);
    border-radius: calc(var(--acc-item-radius) - 2px);
    transition: background-color 0.12s ease;
  }
  .acc-trigger:hover {
    background-color: #f8fafc;
  }
  .acc-trigger:active {
    background-color: #f1f5f9;
  }
  .acc-trigger:focus-visible {
    outline: none;
    box-shadow: var(--card-ring);
  }
  .acc-caret {
    width: var(--acc-caret-size);
    height: var(--acc-caret-size);
    transform-origin: 50% 50%;
    transition: transform 0.18s ease;
    color: #334155;
  }
  .acc-item[data-open="true"] .acc-caret {
    transform: rotate(var(--acc-caret-rotate));
    color: #1f2937;
  }
  .acc-sub {
    color: #6b7280;
    font-weight: 600;
    font-size: 1.2rem;
    margin-left: 0.4rem;
  }

  /* 패널 */
  .acc-panel-inner {
    padding: var(--acc-panel-pad);
    border-top: 1px solid #eef2f7;
  }
  .acc-panel-inner > .card-body {
    font-size: 1.3rem;
    color: #334155;
    line-height: 1.55;
  }
  .acc-panel-inner > .card-body > :first-of-type {
    margin-top: 0;
  }
  .acc-panel-inner > .card-body > :last-of-type {
    margin-bottom: 0;
  }
`;

/* -------------------------------------------
   Types
-------------------------------------------- */
export type AccordionCardClasses = Partial<{
  root: string;
  head: string;
  actions: string;
  ctrl: string;
  list: string;
  item: string;
  trigger: string;
  caret: string;
  sub: string;
  panel: string;
  panelInner: string;
  divider: string;
  title: string;
}>;

type Item = {
  id: string;
  title?: string;
  subtitle?: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
};

export type AccordionCardProps = {
  title: string;
  items: Item[];
  defaultOpenAll?: boolean;
  allowMultiple?: boolean;
  openKeys?: string[];
  onOpenChange?: (openKeys: string[]) => void;
  classes?: AccordionCardClasses;
  cssVars?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
  /** 전체 펼침/닫기 컨트롤 숨김 */
  hideControls?: boolean; // <-- 추가
};

/* -------------------------------------------
   AccordionCard
-------------------------------------------- */
export function AccordionCard({
  title,
  items,
  defaultOpenAll = true,
  allowMultiple = true,
  openKeys,
  onOpenChange,
  classes,
  cssVars,
  className,
  style,
  hideControls = false, // <-- 기본값
}: AccordionCardProps) {
  const uncontrolled = openKeys == null;
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const it of items) init[it.id] = it.defaultOpen ?? defaultOpenAll;
    return init;
  });

  const currentOpenKeys = uncontrolled
    ? Object.keys(openMap).filter(k => openMap[k])
    : openKeys!;

  const isOpen = (id: string) =>
    uncontrolled ? !!openMap[id] : currentOpenKeys.includes(id);

  const setKeys = (keys: string[]) => {
    if (uncontrolled) {
      setOpenMap(s => {
        const next: Record<string, boolean> = {};
        for (const it of items) next[it.id] = keys.includes(it.id);
        return next;
      });
    }
    onOpenChange?.(keys);
  };

  const toggle = (id: string) => {
    const next = new Set(currentOpenKeys);
    if (next.has(id)) next.delete(id);
    else {
      if (!allowMultiple) next.clear();
      next.add(id);
    }
    setKeys(Array.from(next));
  };

  const expandAll = () => setKeys(items.map(i => i.id));
  const collapseAll = () => setKeys([]);

  return (
    <Card
      className={[classes?.root, className].filter(Boolean).join(" ")}
      style={{ ...cssVars, ...style }}
      role="region"
      aria-label={title}
    >
      {title && (
        <div className={["acc-head", classes?.head].filter(Boolean).join(" ")}>
          <h4
            className={["card-title", classes?.title].filter(Boolean).join(" ")}
          >
            {title}
          </h4>
          {!hideControls && ( // <-- 컨트롤 표시 여부
            <div
              className={["acc-actions", classes?.actions]
                .filter(Boolean)
                .join(" ")}
              aria-label="Accordion controls"
            >
              {/* 전체 펼침 (플러스 아이콘) */}
              <button
                type="button"
                title="전체 펼침"
                aria-label="전체 펼침"
                className={["acc-ctrl", classes?.ctrl]
                  .filter(Boolean)
                  .join(" ")}
                onClick={expandAll}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M12 5v14M5 12h14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="sr-only">전체 펼침</span>
              </button>

              {/* 전체 닫기 (마이너스 아이콘) */}
              <button
                type="button"
                title="전체 닫기"
                aria-label="전체 닫기"
                className={["acc-ctrl", classes?.ctrl]
                  .filter(Boolean)
                  .join(" ")}
                onClick={collapseAll}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M5 12h14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="sr-only">전체 닫기</span>
              </button>
            </div>
          )}
        </div>
      )}
      <div
        className={["card-divider", classes?.divider].filter(Boolean).join(" ")}
      />

      <div className={["acc-list", classes?.list].filter(Boolean).join(" ")}>
        {items.map(it => {
          const open = isOpen(it.id);
          const panelId = `acc-panel-${it.id}`;
          const btnId = `acc-btn-${it.id}`;
          return (
            <div
              key={it.id}
              className={["acc-item", classes?.item].filter(Boolean).join(" ")}
              data-open={open ? "true" : "false"}
            >
              {it.title && (
                <button
                  id={btnId}
                  type="button"
                  className={["acc-trigger", classes?.trigger]
                    .filter(Boolean)
                    .join(" ")}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggle(it.id)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(it.id);
                    }
                  }}
                >
                  {/* caret */}
                  <svg
                    className={["acc-caret", classes?.caret]
                      .filter(Boolean)
                      .join(" ")}
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    aria-hidden
                  >
                    <path
                      d="M8 5l8 7-8 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span>{it.title}</span>
                  {it.subtitle ? (
                    <span
                      className={["acc-sub", classes?.sub]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {it.subtitle}
                    </span>
                  ) : (
                    <span />
                  )}
                </button>
              )}
              <Collapse
                open={open}
                duration={220}
                className={["acc-panel", classes?.panel]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className={["acc-panel-inner", classes?.panelInner]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="card-body">{it.content}</div>
                </div>
              </Collapse>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
