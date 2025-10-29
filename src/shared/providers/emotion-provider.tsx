// shared/providers/emotion-provider.tsx
"use client";

import { ReactNode, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider, ThemeProvider } from "@emotion/react";
import { DesignSystemProvider } from "fone-design-system_v2";

import theme from "@/shared/styles/theme";

export default function EmotionProvider({ children }: { children: ReactNode }) {
  const [cache] = useState(() => {
    let insertionPoint: HTMLElement | undefined;
    if (typeof document !== "undefined") {
      const meta = document.querySelector(
        'meta[name="emotion-insertion-point"]',
      ) as HTMLElement | null;
      insertionPoint = meta ?? undefined;
    }
    const c = createCache({ key: "css", prepend: true, insertionPoint });
    // Enable compatibility mode to ensure styles are inserted in the correct order on SSR
    // and avoid mismatches during hydration.
    // See: https://emotion.sh/docs/ssr#manual-setup
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - compat exists at runtime
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => {
    const inserted = (
      cache as unknown as { inserted: Record<string, string>; key: string }
    ).inserted;
    const names = Object.keys(inserted);
    if (names.length === 0) return null;
    const styles = names.map(name => inserted[name]).join(" ");
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <DesignSystemProvider>{children}</DesignSystemProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
