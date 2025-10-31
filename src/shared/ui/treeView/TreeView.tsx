import {
  TreeView2 as DsTreeView2,
  TreeView2Props as DsTreeView2Props,
} from "fone-design-system_v1";

import ResizeContainer from "../resize/ResizeContainer";

// 'items'를 선택적으로 받아도 되도록 강제: DS 원본에선 필수지만, 래퍼에서 기본값을 공급한다.
interface ResizeTreeView2Props extends Omit<DsTreeView2Props, "ref" | "items"> {
  id?: string;
  resizable?: boolean;
  draggable?: boolean;
  throttleResize?: number;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  height?: number;
  minHeight?: number;
  maxHeight?: number;
  x?: number;
  y?: number;
  items?: DsTreeView2Props["items"]; // 선택적
}

export default function TreeView({
  id,
  resizable,
  draggable,
  throttleResize,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  width,
  height,
  x,
  y,
  items: itemsProp,
  ...props
}: ResizeTreeView2Props) {
  const defaultItems: NonNullable<DsTreeView2Props["items"]> = [
    {
      id: "F0",
      parentId: "",
      label: "taskhub",
      opOrgTcd: "F0",
      menuLvSeq: "0",
      children: [
        {
          id: "F1",
          parentId: "F0",
          label: "에프원테크시스템즈",
          opOrgTcd: "F1",
          menuLvSeq: "1",
          children: [
            {
              id: "HSPI002",
              parentId: "F1",
              label: "가산K1",
              opOrgTcd: "F1",
              menuLvSeq: "2",
            },
            {
              id: "HSPI001",
              parentId: "F1",
              label: "가산어반워크",
              opOrgTcd: "F1",
              menuLvSeq: "2",
              children: [],
            },
          ],
        },
        {
          id: "F2",
          parentId: "F0",
          label: "공장",
          opOrgTcd: "F2",
          menuLvSeq: "1",
          children: [
            {
              id: "FCTR001",
              parentId: "F2",
              label: "에프원공장",
              opOrgTcd: "F2",
              menuLvSeq: "2",
              children: [],
            },
          ],
        },
        {
          id: "F3",
          parentId: "F0",
          label: "영업지점",
          opOrgTcd: "F3",
          menuLvSeq: "1",
          children: [
            {
              id: "BSPL001",
              parentId: "F3",
              label: "에프원점",
              opOrgTcd: "F3",
              menuLvSeq: "2",
              children: [],
            },
          ],
        },
      ],
    },
  ];

  const items = itemsProp ?? defaultItems;

  return (
    <ResizeContainer
      id={id}
      resizable={resizable}
      draggable={draggable}
      throttleResize={throttleResize}
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={minHeight}
      maxHeight={maxHeight}
      width={width}
      height={height}
      x={x}
      y={y}
      renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]} // ["nw", "n", "ne", "w", "e", "sw", "s", "se"]
    >
      <div
        // 투명 오버레이로 Select 상호작용을 차단 (버블링은 허용하여 컨테이너 활성화/드래그 영향 최소화)
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "transparent",
        }}
      />
      <DsTreeView2 {...props} items={items} />
    </ResizeContainer>
  );
}
