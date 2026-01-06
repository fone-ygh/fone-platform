import { create } from "zustand";

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

export interface ButtonStyleData {
  width: string;
  color: string;
  variant: "contained" | "outlined" | "text" | "";
  icon: File | null;
  iconPosition: string;
}

export interface InputStyleData {
  width: string;
  icon: File | null;
  iconPosition: string;
}

export interface CheckboxStyleData {
  color: string;
}

export interface SwitchStyleData {
  color:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "default";
}

export interface RadioStyleData {
  color: string;
}

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

interface ButtonData {
  crud?: string;
  componentId: string;
  name: string;
  title: string;
  style: ButtonStyleData;
  function: string;
}

export interface InputData {
  crud?: string;
  componentId: string;
  name: string;
  title: string;
  style: InputStyleData;
  required: string;
  type: string;
  placeholder: string;
}

export interface CheckboxData {
  crud?: string;
  componentId: string;
  name: string;
  title: string;
  style: CheckboxStyleData;
  required: string;
  defaultChecked: string;
}

export interface SwitchData {
  crud?: string;
  componentId: string;
  name: string;
  title: string;
  style: CheckboxStyleData;
  required: string;
  defaultChecked: string;
}

export interface RadioData {
  crud?: string;
  componentId: string;
  name: string;
  title: string;
  style: RadioStyleData;
  required: string;
  dataType: string;
  dataSourceCd: string;
  dataSourceNm: string;
}

interface State {
  buttonData: ButtonData[];
  selectData: SelectData[];
  inputData: InputData[];
  checkboxData: CheckboxData[];
  switchData: SwitchData[];
  radioData: RadioData[];

  codeTypeData: CodeTypeData[];
  apiData: ApiData[];

  setButtonData: (buttonData: ButtonData[]) => void;
  setSelectData: (selectData: SelectData[]) => void;
  setInputData: (inputData: InputData[]) => void;
  setCheckboxData: (checkboxData: CheckboxData[]) => void;
  setSwitchData: (switchData: SwitchData[]) => void;
  setRadioData: (radioData: RadioData[]) => void;

  setCodeTypeData: (codeTypeData: CodeTypeData[]) => void;
  setApiData: (apiData: ApiData[]) => void;
}

const useComponentStore = create<State>(set => ({
  radioData: [
    {
      componentId: "sex",
      name: "성별",
      title: "성별",
      style: {
        color: "#1976d2",
      },
      required: "Y",
      dataType: "commonCode",
      dataSourceCd: "CT0003",
      dataSourceNm: "성별",
    },
  ],

  switchData: [
    {
      componentId: "darkMode",
      name: "다크모드",
      title: "다크모드",
      style: {
        color: "primary",
      },
      required: "N",
      defaultChecked: "Y",
    },
  ],

  checkboxData: [
    {
      componentId: "required",
      name: "필수여부",
      title: "필수여부",
      style: {
        color: "#1976d2",
      },
      required: "Y",
      defaultChecked: "Y",
    },
  ],

  inputData: [
    {
      componentId: "username",
      name: "아이디",
      title: "아이디",
      style: {
        width: "250",
        icon: null,
        iconPosition: "",
      },
      required: "Y",
      type: "text",
      placeholder: "아이디를 입력하세요",
    },
    {
      componentId: "password",
      name: "비밀번호",
      title: "비밀번호",
      style: {
        width: "250",
        icon: null,
        iconPosition: "",
      },
      required: "Y",
      type: "password",
      placeholder: "비밀번호를 입력하세요",
    },
  ],

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
    {
      groupCode: "CT0003",
      groupName: "성별",
      groupDescription: "성별을 나타냄",
      commonCodeData: [
        {
          code: "01",
          codeName: "남성",
          codeDescription: "남성",
        },
        {
          code: "02",
          codeName: "여성",
          codeDescription: "여성",
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
  setInputData: (inputData: InputData[]) => set({ inputData: inputData }),
  setCheckboxData: (checkboxData: CheckboxData[]) =>
    set({ checkboxData: checkboxData }),
  setSwitchData: (switchData: SwitchData[]) => set({ switchData: switchData }),
  setRadioData: (radioData: RadioData[]) => set({ radioData: radioData }),

  setCodeTypeData: (codeTypeData: CodeTypeData[]) =>
    set({ codeTypeData: codeTypeData }),
  setApiData: (apiData: ApiData[]) => set({ apiData: apiData }),
}));

export default useComponentStore;
