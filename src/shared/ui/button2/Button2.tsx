// src/components/ui/Button.tsx
"use client";

import React from "react";
import styled from "@emotion/styled";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  as?: any; // 필요하면 <Button as="a" href="/..."> 로 사용
  href?: string; // as="a"일 때 사용
};

const ButtonRoot = styled.button<{
  "data-variant": Variant;
  "data-size": Size;
  "data-full": boolean;
}>`
  /* 기본 토큰(없으면 fallback) */
  --_c: var(--ds-color-primary, #1f6feb);
  --_c-hover: var(--ds-color-primary-hover, #0084fe);
  --_fg-on: var(--ds-color-primary-contrast, #fff);
  --_radius: var(--ds-radius-md, 0.8rem);
  --_fz: var(--ds-font-size-base, 1.5rem);
  --_ring-w: var(--ds-ring-width, 3px);
  --_ring-c: var(--ds-ring-color, rgba(0, 132, 254, 0.32));

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  white-space: nowrap;
  user-select: none;

  height: 3.8rem;
  padding: 0 1.6rem;
  font-size: var(--_fz);
  font-weight: var(--ds-font-weight-medium, 500);
  font-family: var(
    --ds-font-family,
    ui-sans-serif,
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    "Noto Sans KR",
    Arial,
    sans-serif
  );
  border-radius: var(--_radius);
  border: 1px solid transparent;
  background: transparent;
  color: var(--_c);
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.02s linear;

  width: ${({ "data-full": full }) => (full ? "100%" : "auto")};

  /* variants */
  &[data-variant="solid"] {
    background: var(--_c);
    color: var(--_fg-on);
    border-color: var(--_c);
  }
  &[data-variant="solid"]:hover {
    background: var(--_c-hover);
    border-color: var(--_c-hover);
    transform: translateY(-0.5px);
  }

  &[data-variant="outline"] {
    border-color: var(--_c);
    color: var(--_c);
    background: transparent;
  }
  &[data-variant="outline"]:hover {
    background: color-mix(in srgb, var(--_c) 10%, transparent);
    transform: translateY(-0.5px);
  }

  &[data-variant="ghost"] {
    border-color: transparent;
    color: var(--_c);
    background: transparent;
  }
  &[data-variant="ghost"]:hover {
    background: color-mix(in srgb, var(--_c) 8%, transparent);
  }

  /* sizes */
  &[data-size="sm"] {
    height: 3.2rem;
    padding: 0 1.2rem;
    font-size: var(--ds-font-size-sm, 1.3rem);
  }
  &[data-size="lg"] {
    height: 4.4rem;
    padding: 0 2rem;
    font-size: var(--ds-font-size-md, 1.6rem);
  }

  /* states */
  &:focus-visible {
    outline: 0;
    box-shadow: 0 0 0 var(--_ring-w) var(--_ring-c);
  }
  &:active {
    transform: translateY(0.5px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export function Button({
  variant = "solid",
  size = "md",
  fullWidth,
  children,
  ...rest
}: ButtonProps) {
  return (
    <ButtonRoot
      data-variant={variant}
      data-size={size}
      data-full={!!fullWidth}
      {...rest}
    >
      {children}
    </ButtonRoot>
  );
}
