# `ResizeContainer.tsx` 완전 해부

> 파일 위치 `src/shared/components/ui/resize/ResizeContainer.tsx`

이 컴포넌트는 **어떤 UI 컴포넌트든 “드래그 / 리사이즈 / 회전 가능한 박스”로 감싸주는 래퍼**입니다.  
내부에서는 [`react-moveable`](https://github.com/daybrush/moveable)를 쓰고,  
위치/크기는 `useResizeStore`(zustand)로 캐시합니다.

---

## 0. 이 컴포넌트를 한 줄로 설명하면

- `ResizeContainer` =  
  “자식 컴포넌트 하나를 감싸서,  
  **마우스로 움직이고(드래그), 크기 조절하고(리사이즈), 회전**할 수 있게 만들어주는 박스”

---

## 1. 상단 import 구문

```ts
import { ReactNode, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import Moveable from "react-moveable";

import useResizeStore from "@/shared/store/resize";
```

### 1-1. `ReactNode`, `useState`, `useRef`, `useEffect`

- **`ReactNode`**
  - 리액트가 렌더링할 수 있는 모든 타입
  - JSX, 문자열, 숫자, `null` 등 전부 포함
  - 여기서는 `children` 타입으로 사용 → 어떤 컴포넌트든 넣을 수 있게 해줌
- **`useState`**
  - 컴포넌트 안에 상태(state)를 만드는 훅
  - `const [state, setState] = useState(초기값);`
- **`useRef`**
  - 어떤 값을 “박스”에 저장해두고, 리렌더링 사이에서도 유지하고 싶을 때 사용
  - `ref.current`에 값을 넣고 읽음
  - DOM 엘리먼트를 가리키는 용도로도 많이 사용 (여기서도 DOM 참조에 사용)
- **`useEffect`**
  - “컴포넌트가 렌더링된 이후에 실행할 코드”를 넣는 곳
  - 주로:
    - 초기값 세팅
    - 이벤트 리스너 등록/해제
    - API 호출 같은 걸 할 때 사용

### 1-2. `styled` from `@emotion/styled`

- 스타일이 들어간 컴포넌트를 만드는 함수
- 예:

  ```tsx
  const Box = styled.div`
    border: 1px solid red;
  `;
  ```

- 여기서는 `StyledContainer`라는 div를 만듦

### 1-3. `Moveable` from `"react-moveable"`

- 이 라이브러리가 **드래그 / 리사이즈 / 회전** 기능을 제공
- `target`, `draggable`, `resizable` 등의 props를 넣어서 동작을 제어

### 1-4. `useResizeStore` (zustand 스토어)

- 우리 프로젝트의 전역 state
- `resize[id]` 에 `{ width, height, x, y }`가 들어있는 구조라고 보면 됨
- 컴포넌트별 위치/크기를 **ID 기준으로** 저장하기 위한 스토어

---

## 2. 타입 정의들

```tsx
type TargetsType = (HTMLElement | SVGElement)[] | undefined;
```

- 그룹 드래그/리사이즈에 쓰는 타입
- **뜻**:
  - `HTMLElement` 또는 `SVGElement`의 배열
  - 혹은 `undefined` (그룹이 아닐 때)

---

## 3. Props 인터페이스 상세

```tsx
interface Props {
  /* Selection */
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  defaultActive?: boolean;

  /* Identity + features */
  id?: string;
  resizable?: boolean;
  draggable?: boolean;
  rotatable?: boolean;
  throttleResize?: number;

  /* limits */
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;

  /* layout */
  width: number;
  height: number;
  x: number;
  y: number;
  rotate?: number;

  /* coords */
  zoom?: number;
  containerEl?: HTMLElement | null;

  /* group + snap */
  targets?: TargetsType;
  snappable?: boolean | string[];
  snapGridWidth?: number;
  snapGridHeight?: number;
  elementGuidelines?: any;

  /* events (single / group) */
  onResizeStart?: (e: any) => void;
  onResize?: (e: any) => void;
  onResizeEnd?: (e: any) => void;

  onResizeGroupStart?: (e: any) => void;
  onResizeGroup?: (e: any) => void;
  onResizeGroupEnd?: (e: any) => void;

  onDragStart?: (e: any) => void;
  onDrag?: (e: any) => void;
  onDragEnd?: (e: any) => void;

  onDragGroupStart?: (e: any) => void;
  onDragGroup?: (e: any) => void;
  onDragGroupEnd?: (e: any) => void;

  onRotateStart?: (e: any) => void;
  onRotate?: (e: any) => void;
  onRotateEnd?: (e: any) => void;

  children: ReactNode;
}
```

### 3-1. Selection 관련

- `active?: boolean`
  - “이 박스가 선택된 상태인지?”를 **부모 쪽에서 제어**할 때 쓰는 값
  - `true`면 Moveable의 핸들이 보임
- `onActiveChange?: (active: boolean) => void`
  - 내부에서 “나 선택해줘 / 선택 해제해줘”라고 부모에게 알릴 때 사용하는 콜백
- `defaultActive?: boolean`
  - `active` 없이 쓸 때 (uncontrolled) **초기 선택 상태**

### 3-2. 기능 및 ID 관련

- `id?: string`
  - 이 박스를 구분하는 ID (스토어 키)
- `resizable?`
  - `true`면 리사이즈 가능
- `draggable?`
  - `true`면 드래그 가능
- `rotatable?`
  - `true`면 회전 가능
- `throttleResize?`
  - 리사이즈 이벤트가 얼마나 자주 발생할지(픽셀 단위)

### 3-3. 크기 제한(limits)

- `minWidth`, `maxWidth`, `minHeight`, `maxHeight`
  - 리사이즈 시 이 범위를 벗어나지 않도록 막는 용도

### 3-4. 기본 레이아웃

- `width`, `height`, `x`, `y`
  - 초기 width / height / left / top
- `rotate`
  - 회전 각도(도 단위)

### 좌표계 관련 프롭

#### `zoom?: number`

- Moveable에 전달되는 줌값 (예: `1 = 100%`, `1.25 = 125%`).
- **내부 동작**
  - Moveable은 컨트롤 박스(테두리, 리사이즈/회전 핸들)를 그릴 때 이 `zoom` 값을 사용해서, 실제 캔버스가 `scale()` 되어 있어도 **마우스 이동량과 좌표가 일치하도록** 좌표를 보정한다.
  - 예를 들어, 캔버스를 `transform: scale(0.5)`로 축소하면, 화면에서 10px 드래그해도 실제 좌표계에서는 20px 움직인 것으로 계산해야 한다. 이때 `zoom={0.5}`를 넘겨주면 Moveable이 이 차이를 내부에서 처리해 준다.
  - 따라서 `onDrag`, `onResize` 이벤트에 들어오는 `e.left`, `e.top`, `e.width`, `e.height` 등은 **이미 줌이 반영된 “논리 좌표”**라고 보면 된다.

#### `containerEl?: HTMLElement | null`

- 줌/팬이 적용된 **캔버스 루트 DOM 요소**.
- 이 값을 Moveable의 `container`, `rootContainer`로 넘겨 동일한 좌표계를 사용한다.
- **내부 동작**
  - Moveable은 마우스 이벤트 좌표(`clientX`, `clientY`)를 받은 뒤, `containerEl.getBoundingClientRect()`를 사용해 **컨테이너 기준 좌표**로 변환한다.
    - 즉, `containerEl`의 왼쪽 위를 `(0, 0)`으로 삼고, 모든 드래그/리사이즈/스냅 계산을 수행한다.
  - 스냅 라인, 가이드 라인, 박스의 `e.left`, `e.top` 등이 모두 이 컨테이너 기준으로 계산된다.
  - 만약 `containerEl`을 지정하지 않으면 기본적으로 문서/뷰포트 기준으로 계산되기 때문에, 캔버스를 `translate` 또는 `scale`로 옮겨 둔 경우 **컨트롤 위치와 실제 박스 위치가 어긋나는 문제**가 발생할 수 있다.
  - `container={containerEl}`, `rootContainer={containerEl}`로 넘겨주면 Moveable과 캔버스가 같은 기준점을 사용하게 되어,  
    줌/팬을 해도 좌표가 안정적으로 맞는다.

### 3-6. 그룹 + 스냅

- `targets?: TargetsType`
  - 여러 박스를 한 번에 드래그/리사이즈할 때 넘기는 DOM 배열
- `snappable?: boolean | string[]`
  - 스냅 기능 켜기/끄기 또는 특정 스냅 타입
- `snapGridWidth`, `snapGridHeight`
  - 그리드 스냅 간격(px)
- `elementGuidelines`
  - 다른 엘리먼트를 스냅 기준으로 쓰고 싶을 때 넣는 값

### 3-7. 이벤트 콜백들

- 단일 대상용
  - `onDragStart`, `onDrag`, `onDragEnd`
  - `onResizeStart`, `onResize`, `onResizeEnd`
  - `onRotateStart`, `onRotate`, `onRotateEnd`
- 그룹 대상용
  - `onDragGroupStart`, `onDragGroup`, `onDragGroupEnd`
  - `onResizeGroupStart`, `onResizeGroup`, `onResizeGroupEnd`

---

## 4. 컴포넌트 선언 & 기본 값들

```tsx
export default function ResizeContainer({
  id = "",
  children,

  // selection
  active,
  onActiveChange,
  defaultActive = false,

  // features
  resizable,
  draggable,
  rotatable,
  throttleResize,

  // limits
  minWidth = 0,
  maxWidth = Infinity,
  minHeight = 0,
  maxHeight = Infinity,

  // initial layout
  width: propWidth,
  height: propHeight,
  x: propX = 0,
  y: propY = 0,
  rotate = 0,

  // coords
  zoom = 1,
  containerEl,

  // group/snap
  targets,
  snappable = true,
  snapGridWidth = 16,
  snapGridHeight = 16,
  elementGuidelines,

  // callbacks
  onResizeStart,
  onResize,
  onResizeEnd,
  onResizeGroupStart,
  onResizeGroup,
  onResizeGroupEnd,
  onDragStart,
  onDrag,
  onDragEnd,
  onDragGroupStart,
  onDragGroup,
  onDragGroupEnd,
  onRotateStart,
  onRotate,
  onRotateEnd,
}: Props) {

```

- props를 구조 분해 하면서 **기본값**도 같이 설정
- 예:
  - `id = ""` → id가 안 오면 빈 문자열
  - `minWidth = 0`, `maxWidth = Infinity` → 기본 제한 범위
  - `width: propWidth` → `width`라는 이름으로 받은 값을 내부에선 `propWidth`로 사용

---

## 5. ref와 selection 상태

```tsx
const targetRef = useRef<HTMLDivElement | null>(null);

// internal selection (uncontrolled fallback)
const [internalActive, setInternalActive] = useState(defaultActive);
const isActive = active ?? internalActive;
```

- `targetRef`
  - 실제 DOM `<div>`를 가리키는 ref.
  - Moveable에서 조작할 대상.
- `internalActive`
  - 내부에서만 관리하는 선택 상태(uncontrolled)
- `isActive = active ?? internalActive`
  - `active`가 주어졌으면 `active` 사용
  - 아니면 `internalActive` 사용 → **Controlled + Uncontrolled 둘 다 지원**

---

## 6. 레이아웃 캐싱 (zustand)

```tsx
const { resize, setResize } = useResizeStore();
const width = resize[id]?.width ?? propWidth;
const height = resize[id]?.height ?? propHeight;
const x = resize[id]?.x ?? propX ?? 0;
const y = resize[id]?.y ?? propY ?? 0;
```

- `resize[id]`에 값이 있으면 그거 사용
- 없으면 최초 props 값 사용
- 이렇게 하면:
  1. 첫 렌더: props 값 사용
  2. 드래그/리사이즈 후: `setResize`로 store 업데이트
  3. 다음 렌더부터는 store 값 사용

### 초기값을 store에 넣는 useEffect

```tsx
useEffect(() => {
  setResize(id, {
    width: propWidth || 0,
    height: propHeight || 0,
    x: propX || 0,
    y: propY || 0,
  });
}, [id, propWidth, propHeight, propX, propY, setResize]);
```

- 컴포넌트가 처음 렌더링되거나 props 레이아웃 값이 바뀔 때
  - store에 초기 레이아웃을 넣어줌

---

## 7. 리사이즈 기준값을 저장하는 ref

```tsx
const resizeStartRef = useRef<{
  width: number;
  height: number;
  left: number;
  top: number;
  dirX: number;
  dirY: number;
} | null>(null);
```

- 리사이즈 시작 시점의
  - width, height
  - left, top
  - dirX, dirY (리사이즈 방향: 좌/우, 상/하)
- 위/왼쪽 방향 핸들을 드래그할 때,
  - 박스의 반대쪽이 고정된 것처럼 보이게 하기 위해 필요함

---

## 8. 클릭 → 선택 요청

```tsx
const handlePointerDownCapture = (e: React.PointerEvent) => {
  if (e.button !== 0) return; // only left button
  if (active !== undefined) {
    if (!active) onActiveChange?.(true);
  } else {
    if (!internalActive) setInternalActive(true);
    onActiveChange?.(true);
  }
};
```

- 이 컨테이너를 **마우스로 클릭했을 때** 실행
- 좌클릭이 아니면 무시
- Controlled 모드(`active`가 있음):
  - 현재 `active`가 false면 → `onActiveChange(true)` 호출 (부모에게 “나 선택해줘”)
- Uncontrolled 모드:
  - `internalActive`를 true로 바꾸고, 부모에게도 알림

---

## 9. 단일 vs 그룹 모드 판단

```tsx
const hasGroup = isActive && targets && targets.length > 1;
const moveableTarget = isActive && !hasGroup ? targetRef : undefined;
const moveableTargets = hasGroup ? targets : undefined;
```

- `targets` 배열이 있고 길이가 2 이상이고, 선택되어 있으면 → 그룹 모드
- 그룹이 아니면 → 단일 `target`만 사용
- Moveable은
  - `target`: 단일 대상
  - `targets`: 그룹 대상 둘 중 하나만 쓰므로 이렇게 분기.

---

## 10. JSX – Moveable 설정

```tsx
  return (
    <><Moveabletarget={moveableTarget}
        targets={moveableTargets}
        draggable={!!draggable && isActive}
        resizable={!!resizable && isActive}
        rotatable={!!rotatable && isActive}
        origin={false}
        throttleResize={throttleResize}
        container={containerEl ?? undefined}
        rootContainer={containerEl ?? undefined}
        zoom={zoom}
        snappable={snappable}
        snapGridWidth={snapGridWidth}
        snapGridHeight={snapGridHeight}
        elementGuidelines={elementGuidelines ?? []}
        renderDirections={
          isActive ? ["nw", "n", "ne", "w", "e", "sw", "s", "se"] : []
        }
        ...
      />

      <StyledContainer ...>
        {children}
      </StyledContainer>
    </>
  );

```

- Moveable는 “컨트롤 UI” 역할
- StyledContainer는 “실제 박스 DOM”
- `draggable={!!draggable && isActive}`
  - `draggable`가 true이고,
  - 현재 선택되어 있을 때만 드래그 허용
- `renderDirections`:
  - 선택 상태일 때만 리사이즈 핸들 8개 전부 보여줌

---

## 11. Drag 이벤트들

### 11-1. 단일 Drag

```tsx
        onDragStart={e => onDragStart?.(e)}
        onDrag={e => {
          const el = e.target as HTMLElement;
          el.style.left = `${e.left}px`;
          el.style.top = `${e.top}px`;
          onDrag?.(e);
        }}
        onDragEnd={e => onDragEnd?.(e)}

```

- Moveable이 계산해 준 좌표 (`e.left`, `e.top`)를
  - 실제 DOM 스타일(`el.style.left/top`)에 반영해서 미리보기
- `onDrag?.(e)`:
  - 부모가 넘긴 콜백이 있으면 호출

> 스토어 업데이트는 여기서 안 함 → 보통 상위 컴포넌트에서 onDragEnd에서 커밋하는 패턴.

### 11-2. 그룹 Drag

```tsx
        onDragGroupStart={e => onDragGroupStart?.(e)}
        onDragGroup={e => {
          e.events.forEach((ev: any) => {
            const el = ev.target as HTMLElement;
            el.style.left = `${ev.left}px`;
            el.style.top = `${ev.top}px`;
          });
          onDragGroup?.(e);
        }}
        onDragGroupEnd={e => onDragGroupEnd?.(e)}

```

- 그룹 모드에서는 `e.events` 배열 안에 각 타겟의 이벤트가 들어 있음
- 각 타겟에 대해 left/top을 업데이트

---

## 12. Resize 이벤트들

### 12-1. onResizeStart

```tsx
        onResizeStart={e => {
          const cs = getComputedStyle(e.target as HTMLElement);
          const startWidth = parseFloat(cs.width) || 0;
          const startHeight = parseFloat(cs.height) || 0;
          const startLeft = parseFloat(cs.left) || 0;
          const startTop = parseFloat(cs.top) || 0;
          const [dirX, dirY] = (e.direction as number[]) || [0, 0];
          resizeStartRef.current = {
            width: startWidth,
            height: startHeight,
            left: startLeft,
            top: startTop,
            dirX,
            dirY,
          };
          onResizeStart?.(e);
        }}

```

- 리사이즈 시작 시점의
  - width, height, left, top, direction을 `resizeStartRef.current`에 저장

### 12-2. onResize

```tsx
        onResize={e => {
          const newW = Math.max(minWidth, Math.min(e.width, maxWidth));
          const newH = Math.max(minHeight, Math.min(e.height, maxHeight));
          const target = e.target as HTMLElement;
          target.style.width = `${newW}px`;
          target.style.height = `${newH}px`;

          const start = resizeStartRef.current;
          if (start) {
            const { dirX, dirY } = start;
            if (dirX === -1) {
              const newLeft = start.left + (start.width - newW);
              target.style.left = `${newLeft}px`;
            }
            if (dirY === -1) {
              const newTop = start.top + (start.height - newH);
              target.style.top = `${newTop}px`;
            }
          }
          onResize?.(e);
        }}

```

- `e.width`, `e.height`를 받아서 min/max로 clamp
- DOM의 width/height에 바로 반영
- 왼쪽 또는 위쪽 방향으로 줄이는 경우(dirX/dirY === -1)
  - left/top도 같이 움직여서 반대쪽이 고정된 것처럼 보이게 함

### 12-3. onResizeEnd

```tsx
        onResizeEnd={e => {
          const target = e.target as HTMLElement;
          const cs = getComputedStyle(target);

          const finalLeft = parseFloat(cs.left) || x || 0;
          const finalTop = parseFloat(cs.top) || y || 0;
          const finalW =
            (e?.lastEvent?.width as number) ??
            (parseFloat(cs.width) || width || 0);
          const finalH =
            (e?.lastEvent?.height as number) ??
            (parseFloat(cs.height) || height || 0);

          setResize(id, {
            width: finalW,
            height: finalH,
            x: draggable ? finalLeft : x,
            y: draggable ? finalTop : y,
          });
          resizeStartRef.current = null;
          onResizeEnd?.(e);
        }}

```

- 리사이즈가 끝난 시점의 **최종 width/height/left/top**을 계산
- `setResize(id, {...})`로 zustand에 저장
- 다음 렌더링부터는 이 값이 적용됨

### 12-4. 그룹 Resize

```tsx
        onResizeGroupStart={e => onResizeGroupStart?.(e)}
        onResizeGroup={e => {
          e.events.forEach((ev: any) => {
            const target = ev.target as HTMLElement;
            const newW = Math.max(minWidth, Math.min(ev.width, maxWidth));
            const newH = Math.max(minHeight, Math.min(ev.height, maxHeight));

            target.style.width = `${newW}px`;
            target.style.height = `${newH}px`;

            // 좌/상 핸들 보정
            const { direction, drag } = ev;
            const [dirX, dirY] = (direction as number[]) || [0, 0];
            if (dirX === -1) target.style.left = `${drag.left}px`;
            if (dirY === -1) target.style.top = `${drag.top}px`;
          });
          onResizeGroup?.(e);
        }}
        onResizeGroupEnd={e => onResizeGroupEnd?.(e)}

```

- 단일 Resize와 거의 동일한 로직을, 그룹에 대해서 반복 실행

---

## 13. Rotate 관련 이벤트

```tsx
        onRotateStart={e => onRotateStart?.(e)}
        onRotate={e => onRotate?.(e)}
        onRotateEnd={e => onRotateEnd?.(e)}

```

- 현재 코드는 회전 자체는 외부에서 관리해야 함
- `rotate` prop이 바뀌면, 아래 `StyledContainer`의 `transform`에 반영되는 구조

---

## 14. 실제 박스 DOM: `StyledContainer`

```tsx
<StyledContainer
  id={id}
  ref={targetRef}
  onPointerDownCapture={handlePointerDownCapture}
  width={width || "auto"}
  height={height || "auto"}
  x={x}
  y={y}
  draggable={draggable}
  style={{
    transform: rotate ? `rotate(${rotate}deg)` : "none",
    transformOrigin: "left top",
  }}
>
  {children}
</StyledContainer>
```

- 이 div가 실제 화면에 보이는 박스.
- `ref={targetRef}` → Moveable `target`로 사용됨.
- `onPointerDownCapture` → 클릭하면 selection을 요청.
- `style.transform` → 회전이 있으면 `rotate(각도deg)` 적용.

### StyledContainer 스타일 정의

```tsx
interface StyledContainerProps {
  width?: number | string;
  height?: number | string;
  x?: number;
  y?: number;
  draggable?: boolean;
}

const StyledContainer = styled.div<StyledContainerProps>`
  position: ${({ draggable }) => (draggable ? "absolute" : "static")};
  left: ${({ x }) => `${x ?? 0}px`};
  top: ${({ y }) => `${y ?? 0}px`};
  width: ${({ width }) => (typeof width === "number" ? `${width}px` : width)};
  height: ${({ height }) =>
    typeof height === "number" ? `${height}px` : height};
`;
```

- `position`
  - `draggable`가 true면 `absolute` → `left/top`으로 위치 조정
  - 아니면 `static` → 일반 문서 흐름
- `x`, `y`
  - `left`, `top`에 그대로 들어감 (`px` 단위)
- `width`, `height`
  - 숫자면 `px` 붙이고
  - 문자열(`"100%"` 같은 것)이면 그대로 사용

---

## 15. 전체 동작 흐름 요약

1. **초기 렌더링**
   - props로 `width/height/x/y`를 받음
   - `useEffect`에서 `setResize(id, {...})`로 store에 초기값 저장
2. **실제 렌더링 값**
   - `resize[id]`가 있으면 그 값을 사용
   - 아니면 props 초기값 사용
3. **사용자가 박스를 클릭**
   - `handlePointerDownCapture` 실행
   - `onActiveChange(true)` 호출해서 부모에게 “나 선택해줘” 요청
   - 부모는 `active` 또는 `selectedIds` 등을 업데이트
4. **선택되면(isActive=true)**
   - Moveable의 `target/targets`가 연결됨
   - 테두리 + 리사이즈 핸들이 보임
5. **드래그/리사이즈 중**
   - Moveable이 계속 이벤트를 날림 (`onDrag`, `onResize` 등)
   - DOM 스타일(`left/top/width/height`)을 **실시간으로 업데이트** (미리보기)
6. **리사이즈 끝**
   - `onResizeEnd`에서 최종 위치/크기를 계산
   - `setResize(id, {...})`로 store에 저장
   - 이후 렌더부터 store 값이 곧 “정답”이 됨

```

```
