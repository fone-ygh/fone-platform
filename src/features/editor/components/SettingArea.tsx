"use client";

import React, { useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Button, Checkbox, Flex, Switch } from "fone-design-system_v1";

import { AccordionCard } from "@/shared/ui/cardAccordion/CardAccordion";

import { AsideStyle } from "./AsideStyle";

/* ───────────────── styled inputs (가벼운 베이스) ───────────────── */
const Label = styled.label`
  font-size: 1.25rem;
  color: #334155;
  white-space: nowrap;
`;
const Input = styled.input`
  height: 3.2rem;
  padding: 0 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  outline: none;
  font-size: 1.3rem;
  color: #0f172a;
  background: #fff;

  &:focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 0.24rem rgba(99, 102, 241, 0.12);
  }

  &[type="number"] {
    width: 10rem;
  }
`;
const SmallNote = styled.p`
  margin: 0.2rem 0 0 0;
  font-size: 1.2rem;
  color: #6b7280;
`;
const Hr = styled.hr`
  border: 0;
  height: 1px;
  background: #e5eaf3;
  margin: 0.8rem 0;
`;

/* ───────────────── component ───────────────── */
function SettingArea() {
  /* Canvas */
  const [canvasW, setCanvasW] = useState(1200);
  const [canvasH, setCanvasH] = useState(800);
  const [lockRatio, setLockRatio] = useState(true);
  const ratio = useMemo(
    () => (canvasH ? canvasW / canvasH : 1.5),
    [canvasW, canvasH],
  );

  const handleCanvasW = (v: number) => {
    setCanvasW(v);
    if (lockRatio && ratio) setCanvasH(Math.max(1, Math.round(v / ratio)));
  };
  const handleCanvasH = (v: number) => {
    setCanvasH(v);
    if (lockRatio && ratio) setCanvasW(Math.max(1, Math.round(v * ratio)));
  };
  const resetCanvas = () => {
    setCanvasW(1200);
    setCanvasH(800);
    setLockRatio(true);
  };

  /* Zoom */
  const [zoom, setZoom] = useState(100);
  const clampZoom = (z: number) => Math.min(200, Math.max(25, Math.round(z)));
  const zoomIn = () => setZoom(z => clampZoom(z + 10));
  const zoomOut = () => setZoom(z => clampZoom(z - 10));
  const zoomReset = () => setZoom(100);

  /* Grid */
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(16);
  const [gridColor, setGridColor] = useState("#e2e8f0");

  /* Snap */
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapToGuides, setSnapToGuides] = useState(true);
  const [snapToElements, setSnapToElements] = useState(true);
  const [snapTolerance, setSnapTolerance] = useState(6);

  /* Guides */
  const [showRulers, setShowRulers] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const addVGuide = () => console.log("TODO: add vertical guide");
  const addHGuide = () => console.log("TODO: add horizontal guide");

  /* JSON Export/Import */
  const fileRef = useRef<HTMLInputElement>(null);
  const currentSettings = useMemo(
    () => ({
      canvas: { width: canvasW, height: canvasH, lockRatio },
      zoom,
      grid: { show: showGrid, size: gridSize, color: gridColor },
      snap: {
        toGrid: snapToGrid,
        toGuides: snapToGuides,
        toElements: snapToElements,
        tolerance: snapTolerance,
      },
      guides: { rulers: showRulers, show: showGuides },
      _meta: { exportedAt: new Date().toISOString() },
    }),
    [
      canvasW,
      canvasH,
      lockRatio,
      zoom,
      showGrid,
      gridSize,
      gridColor,
      snapToGrid,
      snapToGuides,
      snapToElements,
      snapTolerance,
      showRulers,
      showGuides,
    ],
  );

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(currentSettings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "layout-settings.json";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openImport = () => fileRef.current?.click();
  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "{}"));
        if (data?.canvas) {
          if (typeof data.canvas.width === "number")
            setCanvasW(data.canvas.width);
          if (typeof data.canvas.height === "number")
            setCanvasH(data.canvas.height);
          if (typeof data.canvas.lockRatio === "boolean")
            setLockRatio(data.canvas.lockRatio);
        }
        if (typeof data?.zoom === "number") setZoom(clampZoom(data.zoom));
        if (data?.grid) {
          if (typeof data.grid.show === "boolean") setShowGrid(data.grid.show);
          if (typeof data.grid.size === "number") setGridSize(data.grid.size);
          if (typeof data.grid.color === "string")
            setGridColor(data.grid.color);
        }
        if (data?.snap) {
          if (typeof data.snap.toGrid === "boolean")
            setSnapToGrid(data.snap.toGrid);
          if (typeof data.snap.toGuides === "boolean")
            setSnapToGuides(data.snap.toGuides);
          if (typeof data.snap.toElements === "boolean")
            setSnapToElements(data.snap.toElements);
          if (typeof data.snap.tolerance === "number")
            setSnapTolerance(data.snap.tolerance);
        }
        if (data?.guides) {
          if (typeof data.guides.rulers === "boolean")
            setShowRulers(data.guides.rulers);
          if (typeof data.guides.show === "boolean")
            setShowGuides(data.guides.show);
        }
        console.log("Imported:", data);
      } catch (err) {
        console.error("Invalid JSON", err);
        alert("불러오기에 실패했어. JSON 형식을 확인해줘.");
      } finally {
        e.currentTarget.value = "";
      }
    };
    reader.readAsText(f);
  };

  /* Server (stub) */
  const serverSave = () => {
    console.log("TODO: 서버 저장", currentSettings);
    alert("서버 저장 스텁: 콘솔을 확인해줘.");
  };
  const serverLoad = () => {
    console.log("TODO: 서버 불러오기");
    alert("서버 불러오기 스텁: 콘솔을 확인해줘.");
  };

  return (
    <AsideStyle data-side="left">
      {/* Canvas */}
      <AccordionCard
        title="Setting"
        defaultOpenAll
        hideControls
        items={[
          {
            id: "canvas-size",
            title: "캔버스크기",
            content: (
              <Flex flexDirection="column" spacing="1rem">
                <Flex spacing="1.2rem">
                  <Flex flexDirection="column">
                    <span>W</span>
                    <input
                      type="number"
                      value={canvasW}
                      min={1}
                      onChange={e => handleCanvasW(Number(e.target.value))}
                      style={{ display: "block", width: "100%" }}
                    />
                  </Flex>

                  <Flex flexDirection="column">
                    <label htmlFor="h">H</label>
                    <input
                      type="number"
                      value={canvasH}
                      min={1}
                      onChange={e => handleCanvasH(Number(e.target.value))}
                      style={{ display: "block", width: "100%" }}
                    />
                    <div />
                  </Flex>
                </Flex>

                <Flex
                  spacing="1.2rem"
                  alignItems="center"
                  style={{ marginTop: ".6rem" }}
                >
                  <Checkbox
                    checked={lockRatio}
                    onChange={(e: any) => setLockRatio(!!e?.target?.checked)}
                  />
                  <Label style={{ margin: 0 }}>비율 잠금</Label>
                  <SmallNote>현재 비율: {Number(ratio.toFixed(3))}</SmallNote>
                </Flex>

                <Flex spacing=".8rem">
                  <Button variant="outlined" onClick={resetCanvas} size="sm">
                    리셋(1200×800)
                  </Button>
                  <Button
                    variant="contained"
                    color="#0075F6"
                    size="sm"
                    onClick={() =>
                      console.log("적용", { width: canvasW, height: canvasH })
                    }
                  >
                    적용
                  </Button>
                </Flex>
              </Flex>
            ),
          },
          {
            id: "json-io",
            title: "JSON 내보내기/불러오기",
            content: (
              <div>
                <Flex spacing=".8rem">
                  <Button variant="outlined" onClick={exportJSON}>
                    내보내기(JSON)
                  </Button>
                  <Button variant="outlined" onClick={openImport}>
                    불러오기(JSON)
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    onChange={onImport}
                    style={{ display: "none" }}
                  />
                </Flex>
                <SmallNote style={{ marginTop: ".6rem" }}>
                  현재 상태를 JSON으로 저장/복원할 수 있습니다.
                </SmallNote>
              </div>
            ),
          },
          {
            id: "server",
            title: "서버저장",
            content: (
              <div>
                <Flex spacing=".8rem">
                  <Button
                    variant="contained"
                    onClick={serverSave}
                    color="#0075F6"
                    size="sm"
                  >
                    저장
                  </Button>
                  <Button variant="outlined" onClick={serverLoad} size="sm">
                    불러오기
                  </Button>
                </Flex>
              </div>
            ),
          },
          {
            id: "zoom",
            title: "확대/축소",
            content: (
              <div>
                <Flex spacing=".8rem" alignItems="center">
                  <Button variant="outlined" onClick={zoomOut} size="sm">
                    −
                  </Button>
                  <input
                    type="number"
                    value={zoom}
                    min={25}
                    max={200}
                    onChange={e => setZoom(clampZoom(Number(e.target.value)))}
                    style={{ width: "100%" }}
                  />
                  <Button variant="outlined" onClick={zoomIn} size="sm">
                    ＋
                  </Button>
                  <Button variant="outlined" onClick={zoomReset} size="sm">
                    100%
                  </Button>
                </Flex>
                <SmallNote>25% ~ 200%</SmallNote>
              </div>
            ),
          },
          {
            id: "grid",
            title: "그리드",
            content: (
              <div>
                <Flex spacing="1.2rem" alignItems="center">
                  <Switch
                    checked={showGrid}
                    onChange={(e: any) => setShowGrid(!!e?.target?.checked)}
                  />
                  <Label style={{ margin: 0 }}>격자 표시</Label>
                </Flex>

                <Flex
                  spacing="1rem"
                  alignItems="center"
                  style={{ marginTop: ".6rem" }}
                >
                  <Label htmlFor="grid-size">Size</Label>
                  <Input
                    id="grid-size"
                    type="number"
                    value={gridSize}
                    min={4}
                    max={64}
                    onChange={e =>
                      setGridSize(
                        Math.max(4, Math.min(64, Number(e.target.value))),
                      )
                    }
                  />
                  <Label htmlFor="grid-color" style={{ marginLeft: "1rem" }}>
                    Color
                  </Label>
                  <Input
                    id="grid-color"
                    type="color"
                    value={gridColor}
                    onChange={e => setGridColor(e.target.value)}
                    style={{ width: "4rem", padding: 0 }}
                  />
                </Flex>
              </div>
            ),
          },
          {
            id: "snap",
            title: "스냅",
            content: (
              <div>
                <Flex spacing="1.2rem" alignItems="center">
                  <Checkbox
                    checked={snapToGrid}
                    onChange={(e: any) => setSnapToGrid(!!e?.target?.checked)}
                  />
                  <Label style={{ margin: 0 }}>그리드에 스냅</Label>
                </Flex>
                <Flex
                  spacing="1.2rem"
                  alignItems="center"
                  style={{ marginTop: ".4rem" }}
                >
                  <Checkbox
                    checked={snapToGuides}
                    onChange={(e: any) => setSnapToGuides(!!e?.target?.checked)}
                  />
                  <Label style={{ margin: 0 }}>가이드에 스냅</Label>
                </Flex>
                <Flex
                  spacing="1.2rem"
                  alignItems="center"
                  style={{ marginTop: ".4rem" }}
                >
                  <Checkbox
                    checked={snapToElements}
                    onChange={(e: any) =>
                      setSnapToElements(!!e?.target?.checked)
                    }
                  />
                  <Label style={{ margin: 0 }}>요소 간 스냅</Label>
                </Flex>

                <Hr />

                <Flex spacing="1rem" alignItems="center">
                  <Label htmlFor="snapTol">허용 오차(px)</Label>
                  <Input
                    id="snapTol"
                    type="number"
                    value={snapTolerance}
                    min={1}
                    max={20}
                    onChange={e =>
                      setSnapTolerance(
                        Math.max(1, Math.min(20, Number(e.target.value))),
                      )
                    }
                  />
                </Flex>
              </div>
            ),
          },
          {
            id: "guide",
            title: "가이드/룰러",
            content: (
              <div>
                <Flex spacing="1.2rem" alignItems="center">
                  <Switch
                    checked={showRulers}
                    onChange={(e: any) => setShowRulers(!!e?.target?.checked)}
                  />
                  <Label style={{ margin: 0 }}>룰러 표시</Label>
                </Flex>
                <Flex
                  spacing="1.2rem"
                  alignItems="center"
                  style={{ marginTop: ".4rem" }}
                >
                  <Switch
                    checked={showGuides}
                    onChange={(e: any) => setShowGuides(!!e?.target?.checked)}
                  />
                  <Label style={{ margin: 0 }}>가이드 표시</Label>
                </Flex>

                <Hr />

                <Flex spacing=".8rem">
                  <Button variant="outlined" onClick={addVGuide}>
                    세로 가이드 추가
                  </Button>
                  <Button variant="outlined" onClick={addHGuide}>
                    가로 가이드 추가
                  </Button>
                </Flex>
              </div>
            ),
          },
        ]}
      />
    </AsideStyle>
  );
}

export default SettingArea;
