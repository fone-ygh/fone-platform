"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import styled from "@emotion/styled";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { Button, TextField2 } from "fone-design-system_v1";

import useComponentStore from "@/features/componentManagement/store/component";

import ComponentView from "../../components/componentView/ComponentView";
import StyleDialog from "../../components/styleDialog/StyleDialog";
import Table from "../../components/table/Table";
import useDataStore from "../store/data";
import useDialogStore from "../store/dialog";

export default function InputPage() {
  const { inputData, setInputData } = useComponentStore();
  const { setIsOpen } = useDialogStore();
  const { selectedData } = useDataStore();

  const columns = [
    {
      accessorKey: "componentId",
      header: "ID",
      editable: true,
      type: (row: any) => (row.crud === "C" ? "input" : "text"),
      required: true,
    },
    {
      accessorKey: "name",
      header: "컴포넌트명",
      editable: true,
      type: "input",
      required: true,
    },
    {
      accessorKey: "title",
      header: "타이틀",
      editable: true,
      type: "input",
      required: true,
    },
    {
      accessorKey: "style",
      header: "스타일",
      editable: true,
      type: "custom",
      component: (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button onClick={() => setIsOpen(true)} size="sm" fullWidth>
            <AddCircleOutlineIcon sx={{ fontSize: 18, color: "#4D4D4D" }} />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "required",
      header: "필수여부",
      editable: true,
      type: "checkbox",
      required: true,
    },
    {
      accessorKey: "type",
      header: "타입",
      editable: true,
      type: "select",
      required: true,
      selectItems: [
        { value: "text", label: "텍스트" },
        { value: "number", label: "숫자" },
        { value: "password", label: "비밀번호" },
        { value: "email", label: "이메일" },
      ],
    },
    {
      accessorKey: "placeholder",
      header: "placeholder",
      editable: true,
      type: "input",
    },
  ];

  const StyleColumns = [
    {
      accessorKey: "width",
      title: "너비(px)",
      type: "inputNum",
      required: true,
    },

    {
      accessorKey: "icon",
      title: "아이콘",
      type: "file",
      accept: "image/*",
      icon: <AddPhotoAlternateIcon sx={{ fontSize: 18 }} />,
    },
    {
      accessorKey: "iconPosition",
      title: "아이콘위치",
      type: "select",
      required: true,
      disabled: (data: any) => {
        return !data.icon;
      },
      menuItems: [
        {
          value: "left",
          label: "왼쪽",
        },
        {
          value: "right",
          label: "오른쪽",
        },
      ],
    },
  ];

  const iconUrl = useMemo(() => {
    const file = selectedData?.style.icon;
    return file ? URL.createObjectURL(file) : null;
  }, [selectedData?.style.icon]);

  useEffect(() => {
    return () => {
      if (iconUrl) URL.revokeObjectURL(iconUrl);
    };
  }, [iconUrl]);

  const iconNode = iconUrl ? (
    <Image src={iconUrl} alt="" width={16} height={16} unoptimized />
  ) : undefined;

  const iconPosition = selectedData?.style.iconPosition;
  const startIcon = iconPosition === "right" ? undefined : iconNode;
  const endIcon = iconPosition === "right" ? iconNode : undefined;

  return (
    <InputPageStyle>
      <Table data={inputData} setData={setInputData} columns={columns} />
      <ComponentView>
        <InputStyle>
          <div className="label">
            <span>{selectedData.title}</span>
            {selectedData.required === "Y" && <div className="required">*</div>}
          </div>
          <TextField2
            startAdornment={startIcon}
            endAdornment={endIcon}
            type={selectedData?.type || "text"}
            sx={{
              width: selectedData?.style.width
                ? `${selectedData.style.width}px`
                : undefined,
            }}
            placeholder={selectedData?.placeholder || ""}
          />
        </InputStyle>
      </ComponentView>
      <StyleDialog
        data={inputData}
        setData={setInputData}
        columns={StyleColumns}
      />
    </InputPageStyle>
  );
}

const InputPageStyle = styled.div`
  width: 100%;
  height: 100%;
  padding: 1.6rem;
  gap: 10rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputStyle = styled.div`
  position: relative;
  gap: 0.6rem;

  .label {
    position: absolute;
    top: -2.3rem;
    left: -0.2rem;
    display: flex;
    gap: 0.2rem;

    span {
      font-size: 1.2rem;
    }
  }

  .required {
    color: #ec193a;
    font-size: 2rem;
    line-height: 2rem;
  }
`;
