// components/EmotionProvider.tsx
"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

// (1) 캐시 생성 함수(같은 파일에 포함)
function createEmotionCache() {
  let insertionPoint: HTMLElement | undefined;
  if (typeof document !== "undefined") {
    insertionPoint = document.querySelector(
      'meta[name="emotion-insertion-point"]',
    ) as HTMLElement | undefined;
  }
  const cache = createCache({ key: "mui", prepend: true, insertionPoint });
  (cache as any).compat = true; // 선택: 다중 Emotion 환경 호환
  return cache;
}

// (2) Provider (요청별 캐시 + SSR 스타일 즉시 주입)
export default function EmotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR에 안전: 요청마다 새 캐시, 클라이언트 전환 동안엔 1회 유지
  const [cache] = useState(() => createEmotionCache());

  // 서버 렌더 중, 캐시에 쌓인 CSS를 <style>로 즉시 삽입 → FOUC/불일치 방지
  useServerInsertedHTML(() => {
    const { inserted, key } = cache as unknown as {
      inserted: Record<string, string>;
      key: string;
    };
    const names = Object.keys(inserted);
    if (names.length === 0) return null;
    const styles = names.map(n => inserted[n]).join(" ");
    return (
      <style
        data-emotion={`${key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
