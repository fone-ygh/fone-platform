import {
  createSectionsForPattern,
  useLayoutStore,
  usePatternStore,
} from "../store";

export function openPattern(originPatternId: string | null) {
  const layout = useLayoutStore.getState();
  const pattern = usePatternStore.getState();

  // 1) 초기화
  layout.actions.setReset();

  // 2) built-in /custom / black 분기
  if (!originPatternId || originPatternId === "blank") {
    layout.actions.setCanvasSize(1920, 1000);
    layout.actions.setSections([]);
  }

  const custom = pattern.customPatterns.find(p => p.id === originPatternId);

  if (custom?.sections?.length) {
    // custom에서 열기
    layout.actions.setCanvasSize(
      custom.canvasWidth ?? 1920,
      custom.canvasHeight ?? 1000,
    );
    layout.actions.setSections(custom.sections);
    return;
  }

  // built-in에서 열기
  if (originPatternId) {
    const sections = createSectionsForPattern(originPatternId);
    layout.actions.setCanvasSize(1920, 1080);
    layout.actions.setSections(sections);

    return;
  }
}
