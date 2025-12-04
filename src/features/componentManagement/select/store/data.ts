import { create } from "zustand";

interface SelectData {
  componentId: string;
  name: string;
  style: string;
  required: string;
  defaultValue: string;
  dataType: string;
  dataSourceCd: string;
  dataSourceNm: string;
}

interface CodeTypeData {
  groupCode: string;
  groupName: string;
  groupDescription: string;
  commonCodeData: CommonCodeData[];
}

interface CommonCodeData {
  code: string;
  codeName: string;
  codeDescription: string;
}

interface State {
  selectId: string;
  selectData: SelectData[];
  codeTypeData: CodeTypeData[];
  commonCodeData: CommonCodeData[];

  setSelectId: (selectId: string) => void;
  setSelectData: (selectData: SelectData[]) => void;
  setCodeTypeData: (codeTypeData: CodeTypeData[]) => void;
  setCommonCodeData: (commonCodeData: CommonCodeData[]) => void;
}

const useDataStore = create<State>(set => ({
  selectId: "",

  selectData: [
    {
      componentId: "useYn",
      name: "사용여부",
      style: "default",
      required: "Y",
      defaultValue: "Y",
      dataType: "commonCode",
      dataSourceCd: "CT0001",
      dataSourceNm: "사용여부",
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
  commonCodeData: [],

  setSelectId: (selectId: string) => set({ selectId: selectId }),
  setSelectData: (selectData: SelectData[]) => set({ selectData: selectData }),
  setCodeTypeData: (codeTypeData: CodeTypeData[]) =>
    set({ codeTypeData: codeTypeData }),
  setCommonCodeData: (commonCodeData: CommonCodeData[]) =>
    set({ commonCodeData: commonCodeData }),
}));

export default useDataStore;
