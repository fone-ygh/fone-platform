export type WidgetType =
  | "box"
  | "text"
  | "image"
  | "button"
  | "list"
  | "card"
  | "gallery"
  | "tabs"
  | "accordion"
  | "pricing";

export type Purpose =
  | "neutral"
  | "header"
  | "sidebar"
  | "main"
  | "footer"
  | "hero"
  | "card"
  | "gallery"
  | "cta"
  | "emphasis"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
};

export type SectionItem = {
  id: string;
  title: string;
  type: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  bg?: string;
  z?: number;
  radius?: number;
  shadow?: number;
  locked?: boolean;
  blockPointer?: boolean;

  // text
  text?: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";

  // image
  imageUrl?: string;
  objectFit?: "cover" | "contain" | "fill";

  // button
  btnLabel?: string;
  btnHref?: string;
  btnVariant?: "solid" | "ghost";

  // list
  listItems?: string[];

  // tabs
  tabs?: { label: string; content: string }[];
  activeTabIndex?: number;

  // accordion
  accordion?: { label: string; content: string; open?: boolean }[];

  // pricing
  pricing?: {
    name: string;
    price: string;
    features: string[];
    highlight?: boolean;
  }[];

  // purpose + colors
  purpose?: Purpose;
  autoColor?: boolean;
  textColorOverride?: string;

  // responsive frames
  frames?: Record<string, Frame>;
};

export type Breakpoint = { id: string; label: string; width: number };

export type LayoutState = {
  version: number;
  canvasWidth: number;
  canvasHeight: number;
  sections: SectionItem[];
  breakpoints?: Breakpoint[];
  activeBp?: string;
  responsive?: {
    inheritScale?: boolean;
    viewportWidth?: number;
  };
};

export type Page = {
  id: string;
  name: string;
  layout: LayoutState;
};

export type Theme = "light" | "dark";
export type GuideTheme = "blue" | "green" | "magenta" | "amber";

export type CommitResult =
  | { ok: true }
  | { ok: false; message: string; collidedIds: string[] };
