import { cloneDeep, includes, omitBy } from "lodash-es";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { persist } from "@/shared/lib/store-util";

const defaultState = {};

export const useEDITORStore = create(
  persist(
    immer(set => ({
      ...cloneDeep(defaultState),
      actions: {
        setSearchCodeStore: (searchCodeStore: any) => {
          console.log(" searchCodeStore : ", searchCodeStore);
          set({ searchCodeStore });
        },
      },
    })),
    {
      name: "EDITOR",
      partialize: (state: any) =>
        omitBy(state, (_value: any, key: any) => includes([], key)),
    },
  ),
);

export const useEDITORActions = () =>
  useEDITORStore((state: any) => state.actions);
