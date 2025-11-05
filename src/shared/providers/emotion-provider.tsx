// shared/providers/emotion-provider.tsx
"use client";

import { ReactNode, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider, css, Global, ThemeProvider } from "@emotion/react";

import { AppTheme, theme } from "../styles/theme";

type Props = {
  children: ReactNode;
  /** 외부 프로젝트 테마 주입 (없으면 defaultTheme 사용) */
  appTheme?: AppTheme;
};

export default function EmotionProvider({ children, appTheme }: Props) {
  const [cache] = useState(() => {
    let insertionPoint: HTMLElement | undefined;
    if (typeof document !== "undefined") {
      const meta = document.querySelector(
        'meta[name="emotion-insertion-point"]',
      ) as HTMLElement | null;
      insertionPoint = meta ?? undefined;
    }
    const c = createCache({ key: "css", prepend: true, insertionPoint });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const inserted = (
      cache as unknown as { inserted: Record<string, string>; key: string }
    ).inserted;
    const names = Object.keys(inserted);
    if (names.length === 0) return null;
    const styles = names.map(n => inserted[n]).join(" ");
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  // 사용할 테마(외부 주입 > 기본 테마)

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        {/* 전역 베이스: 루트 10px 고정 */}
        <Global
          styles={css`
            html {
              font-size: 10px;
            }
          `}
        />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
