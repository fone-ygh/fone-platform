"use client";

import { useState } from "react";
import styled from "@emotion/styled";

import Box from "@/shared/components/ui/box/Box";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import TextField from "@/shared/components/ui/textField/TextField";
import TreeView from "@/shared/components/ui/treeView/TreeView";
import useResizeStore from "@/shared/store/resize";

export default function ResizePage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { resize } = useResizeStore();

  const clearActive = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setActiveId(null);
    }
  };

  return (
    <ResizePageStyle onMouseDown={clearActive}>
      <Button
        id="button"
        resizable
        draggable
        width={200}
        height={50}
        minWidth={200}
        maxWidth={400}
        x={100}
        y={100}
        size="small"
        variant="contained"
        active={activeId === "button"}
        onActiveChange={next => {
          setActiveId(
            next ? "button" : activeId === "button" ? null : activeId,
          );
        }}
      >
        Button 1
      </Button>
      <Select
        id="select"
        resizable
        draggable
        width={200}
        height={50}
        minWidth={200}
        maxWidth={400}
        x={400}
        y={100}
        active={activeId === "select"}
        onActiveChange={next => {
          setActiveId(
            next ? "select" : activeId === "select" ? null : activeId,
          );
        }}
      />
      <TextField
        id="textField"
        resizable
        draggable
        width={200}
        height={50}
        minWidth={200}
        maxWidth={400}
        x={700}
        y={100}
        placeholder="Input"
        active={activeId === "textField"}
        onActiveChange={next => {
          setActiveId(
            next ? "textField" : activeId === "textField" ? null : activeId,
          );
        }}
      />
      <Box
        id="box1"
        resizable
        draggable
        width={200}
        height={50}
        minWidth={200}
        minHeight={50}
        x={1000}
        y={100}
        component="div"
        sx={{
          border: "1px solid black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        active={activeId === "box1"}
        onActiveChange={next => {
          setActiveId(next ? "box1" : activeId === "box1" ? null : activeId);
        }}
      >
        Box1
      </Box>
      <TreeView
        id="treeView"
        resizable
        draggable
        width={500}
        minWidth={250}
        height={500}
        minHeight={300}
        x={100}
        y={200}
        title="TreeView"
        defaultExpanded
        active={activeId === "treeView"}
        onActiveChange={next => {
          setActiveId(
            next ? "treeView" : activeId === "treeView" ? null : activeId,
          );
        }}
      />
      <Box
        id="box2"
        resizable
        draggable
        width={200}
        height={50}
        minWidth={200}
        minHeight={50}
        x={700}
        y={200}
        component="div"
        sx={{
          border: "1px solid black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        active={activeId === "box2"}
        onActiveChange={next => {
          setActiveId(next ? "box2" : activeId === "box2" ? null : activeId);
        }}
      >
        Box
      </Box>
    </ResizePageStyle>
  );
}

const ResizePageStyle = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
