// src/shared/lib/store-util.ts
import {
  persist as _persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";

/** SSR 체크 */
const isClient =
  typeof window !== "undefined" && typeof sessionStorage !== "undefined";

/** SSR용 no-op StateStorage (createJSONStorage로 PersistStorage로 감싼다) */
const noopStateStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * 원본 persist 시그니처를 100% 그대로 유지한 래퍼
 * - 제네릭/뮤테이터 체인 정체성 보존 → “서로 다른 형식”/체인 불일치 에러 방지
 * - storage 기본값만 sessionStorage(SSR에선 noop)로 주입
 */
export const persist: typeof _persist = ((initializer, options) => {
  const { storage, ...rest } = (options as any) ?? {};

  const fallback = createJSONStorage(() =>
    isClient ? sessionStorage : noopStateStorage,
  );

  const merged = { ...rest, storage: storage ?? fallback } as any;
  return (_persist as any)(initializer, merged);
}) as typeof _persist;
