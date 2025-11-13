// src/features/editor/components/canvas/hooks/collision.ts
/* =================== Overlap/Collision helpers (GAP aware) =================== */

export const GAP = 1; // 종료 시 보장할 최소 간격(px)
const EPS = 0.001; // 부동소수 오차 방지

export type Rect = { x: number; y: number; w: number; h: number; id?: string };

/**
 * 실제 교차 영역(겹친 픽셀 영역)을 돌려줍니다.
 * 라이브 하이라이트(빨간 박스) 표시용으로 사용하세요.
 */
export function intersectionRect(a: Rect, b: Rect): Rect | null {
  const ix1 = Math.max(a.x, b.x);
  const iy1 = Math.max(a.y, b.y);
  const ix2 = Math.min(a.x + a.w, b.x + b.w);
  const iy2 = Math.min(a.y + a.h, b.y + b.h);
  if (ix2 > ix1 && iy2 > iy1) {
    return { x: ix1, y: iy1, w: ix2 - ix1, h: iy2 - iy1 };
  }
  return null;
}

/**
 * GAP까지도 '겹침 또는 과도한 근접'으로 간주하여 충돌 여부를 판정합니다.
 * (즉, 0px 맞닿음도 허용하지 않으려면 gap=1)
 */
export function intersectsWithGap(
  a: Rect,
  b: Rect,
  gap: number = GAP,
): boolean {
  const separated =
    a.x + a.w + gap <= b.x + EPS ||
    b.x + b.w + gap <= a.x + EPS ||
    a.y + a.h + gap <= b.y + EPS ||
    b.y + b.h + gap <= a.y + EPS;
  return !separated;
}

/**
 * a를 b 바깥으로 내보내는 최소 이동량(MTV) (GAP 포함).
 * 네 방향(좌/우/상/하) 후보 이동량 중 '가장 적은' 이동으로 탈출합니다.
 * prevX/prevY는 인터페이스 유지용(사용하지 않음).
 */
function pushOutOnce(
  a: Rect,
  b: Rect,
  _prevX: number,
  _prevY: number,
  gap: number = GAP,
): { x: number; y: number } {
  const ax2 = a.x + a.w;
  const ay2 = a.y + a.h;
  const bx2 = b.x + b.w;
  const by2 = b.y + b.h;

  const toLeft = ax2 + gap - b.x; // 왼쪽으로 이동 필요량 -> dx = -toLeft
  const toRight = bx2 + gap - a.x; // 오른쪽                -> dx = +toRight
  const toUp = ay2 + gap - b.y; // 위로                  -> dy = -toUp
  const toDown = by2 + gap - a.y; // 아래로                -> dy = +toDown

  const candidates = [
    { dx: -toLeft, dy: 0, d: Math.max(0, toLeft) },
    { dx: toRight, dy: 0, d: Math.max(0, toRight) },
    { dx: 0, dy: -toUp, d: Math.max(0, toUp) },
    { dx: 0, dy: toDown, d: Math.max(0, toDown) },
  ].filter(c => c.d > EPS);

  if (!candidates.length) return { x: a.x, y: a.y }; // 이미 GAP 이상 떨어짐

  const best = candidates.reduce((m, c) => (c.d < m.d ? c : m), candidates[0]);
  return { x: a.x + best.dx, y: a.y + best.dy };
}

/**
 * 여러 충돌체에 대해 반복적으로 겹침/근접을 해소합니다.
 * 종료 시점에는 반드시 GAP 이상 떨어지도록 보장됩니다.
 */
export function resolveNoOverlap(
  a: Rect,
  colliders: Rect[],
  prevX: number,
  prevY: number,
  maxIter = 128,
  gap = GAP,
): Rect {
  let out = { ...a };
  for (let i = 0; i < maxIter; i++) {
    const hit = colliders.find(b => intersectsWithGap(out, b, gap));
    if (!hit) break;

    const next = pushOutOnce(out, hit, prevX, prevY, gap);
    if (Math.abs(next.x - out.x) < EPS && Math.abs(next.y - out.y) < EPS) {
      break; // 더 이상 진전 없음(안전장치)
    }
    out = { ...out, ...next };
  }
  return out;
}
/* ============================================================================ */
