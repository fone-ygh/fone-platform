import { create } from "zustand";

interface SelectData {
  crud?: string;
  componentId: string;
  name: string;
  label: string;
  style: string;
  required: string;
  all: string;
  dataType: string;
  dataSourceCd: string;
  dataSourceNm: string;
}

export interface StyleData {
  width: string;
  color: string;
  variant: "contained" | "outlined" | "text" | "";
  icon: File | null;
  iconPosition: string;
}

interface ButtonData {
  crud?: string;
  componentId: string;
  name: string;
  title: string;
  style: StyleData;
  function: string;
}

interface CommonCodeData {
  code: string;
  codeName: string;
  codeDescription: string;
}

interface CodeTypeData {
  groupCode: string;
  groupName: string;
  groupDescription: string;
  commonCodeData: CommonCodeData[];
}

interface ApiData {
  groupName: string;
  groupCode: string;
  groupDescription: string;
}

interface State {
  buttonData: ButtonData[];
  selectData: SelectData[];

  codeTypeData: CodeTypeData[];
  apiData: ApiData[];

  setButtonData: (buttonData: ButtonData[]) => void;
  setSelectData: (selectData: SelectData[]) => void;

  setCodeTypeData: (codeTypeData: CodeTypeData[]) => void;
  setApiData: (apiData: ApiData[]) => void;
}

const useComponentStore = create<State>(set => ({
  buttonData: [
    {
      componentId: "search",
      name: "조회",
      title: "조회",
      style: {
        width: "200",
        color: "#1976d2",
        variant: "contained",
        icon: null,
        iconPosition: "",
      },
      function: "01",
    },
    {
      componentId: "popup",
      name: "팝업",
      title: "팝업",
      style: {
        width: "200",
        color: "#dc004e",
        variant: "outlined",
        icon: null,
        iconPosition: "",
      },
      function: "02",
    },
  ],

  selectData: [
    {
      componentId: "useYn",
      name: "사용여부",
      label: "사용여부",
      style: "default",
      required: "N",
      all: "Y",
      dataType: "commonCode",
      dataSourceCd: "CT0001",
      dataSourceNm: "사용여부",
    },
    {
      componentId: "position",
      name: "직책유형",
      label: "직책유형",
      style: "default",
      required: "Y",
      all: "N",
      dataType: "commonCode",
      dataSourceCd: "CT0002",
      dataSourceNm: "직책유형",
    },
  ],

  codeTypeData: [
    {
      groupCode: "CT0001",
      groupName: "사용여부",
      groupDescription: "컴포넌트의 사용여부를 나타냄",
      commonCodeData: [
        {
          code: "Y",
          codeName: "Y",
          codeDescription: "사용",
        },
        {
          code: "N",
          codeName: "N",
          codeDescription: "미사용",
        },
      ],
    },
    {
      groupCode: "CT0002",
      groupName: "직책유형",
      groupDescription: "조직 내 직책을 나타냄",
      commonCodeData: [
        {
          code: "01",
          codeName: "사원",
          codeDescription: "사원",
        },
        {
          code: "02",
          codeName: "대리",
          codeDescription: "대리",
        },
        {
          code: "03",
          codeName: "과장",
          codeDescription: "과장",
        },
        {
          code: "04",
          codeName: "차장",
          codeDescription: "차장",
        },
        {
          code: "05",
          codeName: "부장",
          codeDescription: "부장",
        },
      ],
    },
  ],

  apiData: [
    {
      groupCode: "CT0001",
      groupName: "/options/use-yn",
      groupDescription: "컴포넌트의 사용여부를 나타냄",
    },
    {
      groupCode: "CT0002",
      groupName: "/options/position",
      groupDescription: "조직 내 직책을 나타냄",
    },
  ],

  setButtonData: (buttonData: ButtonData[]) => set({ buttonData: buttonData }),
  setSelectData: (selectData: SelectData[]) => set({ selectData: selectData }),
  setCodeTypeData: (codeTypeData: CodeTypeData[]) =>
    set({ codeTypeData: codeTypeData }),

  setApiData: (apiData: ApiData[]) => set({ apiData: apiData }),
}));

export default useComponentStore;
