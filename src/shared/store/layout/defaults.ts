import type { Breakpoint, LayoutState, Page, SectionItem } from "./types";
import { deepClone, genId } from "./utils";

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { id: "base", label: "Base", width: 1200 },
  { id: "sm", label: "SM", width: 640 },
  { id: "md", label: "MD", width: 768 },
  { id: "lg", label: "LG", width: 1024 },
  { id: "xl", label: "XL", width: 1280 },
];

export const START_SECTIONS: SectionItem[] = [
  {
    id: "s-1",
    title: "Header",
    type: "box",
    x: 12,
    y: 12,
    width: 1160,
    height: 80,
    radius: 8,
    shadow: 0,
    z: 1,
    purpose: "header",
    autoColor: true,
  },
  {
    id: "s-2",
    title: "Sidebar",
    type: "box",
    x: 12,
    y: 108,
    width: 280,
    height: 300,
    radius: 8,
    shadow: 0,
    z: 1,
    purpose: "sidebar",
    autoColor: true,
  },
  {
    id: "s-3",
    title: "Main",
    type: "box",
    x: 304,
    y: 108,
    width: 868,
    height: 300,
    radius: 8,
    shadow: 0,
    z: 1,
    purpose: "main",
    autoColor: true,
  },
  {
    id: "s-4",
    title: "Footer",
    type: "box",
    x: 12,
    y: 422,
    width: 1160,
    height: 80,
    radius: 8,
    shadow: 0,
    z: 1,
    purpose: "footer",
    autoColor: true,
  },
];

export const makeDefaultLayout = (): LayoutState => ({
  version: 9,
  canvasWidth: 1200,
  canvasHeight: 900,
  sections: deepClone(START_SECTIONS),
  breakpoints: DEFAULT_BREAKPOINTS,
  activeBp: "base",
  responsive: { inheritScale: true, viewportWidth: 1200 },
  showColumns: false,
  columns: 0,
  gutter: 0,
  containerPadding: 0,
});

export const DEFAULT_PAGES: Page[] = [
  { id: genId("page"), name: "Home", layout: makeDefaultLayout() },
  { id: genId("page"), name: "About", layout: makeDefaultLayout() },
];
