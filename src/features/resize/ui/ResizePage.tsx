"use client";

import styled from "@emotion/styled";

import Box from "@/shared/components/ui/box/Box";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";
import TextField from "@/shared/components/ui/textField/TextField";
import TreeView from "@/shared/components/ui/treeView/TreeView";
import useResizeStore from "@/shared/store/resize";

export default function ResizePage() {
  const { resize } = useResizeStore();

  console.log(resize);

  return (
    <StyledResizePage>
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
      >
        Box
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
      >
        Box
      </Box>
    </StyledResizePage>
  );
}

const StyledResizePage = styled.div`
  width: 100%;
  height: 100%;
`;
