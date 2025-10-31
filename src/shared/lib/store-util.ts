import {
  createJSONStorage,
  persist as zustandPersist,
} from "zustand/middleware";

export const persist = (initializer: any, options: any) => {
  const mergedOptions = {
    storage: createJSONStorage(() => sessionStorage),
    ...options,
  };
  return zustandPersist(initializer, mergedOptions);
};
