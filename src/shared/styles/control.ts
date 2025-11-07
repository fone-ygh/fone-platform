import styled from "@emotion/styled";

export const SmallNoteStyle = styled.p`
  margin: 0.2rem 0 0 0;
  font-size: 1.2rem;
  color: #6b7280;
`;

export const LabelStyle = styled.label`
  font-size: 1.25rem;
  color: #334155;
  white-space: nowrap;
`;

export const InputStyle = styled.input`
  height: 3.2rem;
  padding: 0 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  outline: none;
  font-size: 1.3rem;
  color: #0f172a;
  background: #fff;

  &:focus {
    border-color: #c7d2fe;
    box-shadow: 0 0 0 0.24rem rgba(99, 102, 241, 0.12);
  }

  &[type="number"] {
    width: 10rem;
  }
`;

export const HrStyle = styled.hr`
  border: 0;
  height: 1px;
  background: #e5eaf3;
  margin: 0.8rem 0;
`;
