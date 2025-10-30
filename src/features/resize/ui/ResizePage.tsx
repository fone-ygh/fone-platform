"use client";

import styled from "@emotion/styled";

import useResizeStore from "@/shared/store/resize";
import Button from "@/shared/ui/button/Button";

export default function ResizePage() {
  const { resize } = useResizeStore();

  return (
    <StyledResizePage>
      <Button
        id="button1"
        resizable
        width={200}
        height={60}
        variant="contained"
      >
        Button 1
      </Button>
      <Button
        id="button2"
        resizable
        draggable
        width={200}
        height={60}
        x={400}
        y={100}
        variant="contained"
      >
        Button 2
      </Button>
    </StyledResizePage>
  );
}

const StyledResizePage = styled.div`
  width: 100%;
  height: 100%;
`;
