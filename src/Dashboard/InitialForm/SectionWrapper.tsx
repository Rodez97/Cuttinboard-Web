import styled from "@emotion/styled";

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
  max-height: 500px;
  min-width: 300px;
  max-width: 600px;
  width: 100%;
  padding: 20px;
`;

export const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
`;

export const SectionFooter = styled.div`
  min-width: 300px;
  max-width: 600px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  background-color: transparent !important;
  text-align: center;
`;

export const UserTypeCard = styled.div<{ selected: boolean }>`
  width: 100%;
  border-radius: 8px;
  border: 2px solid #e8e8e8;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  background-color: ${(props) => (props.selected ? "#E6F7FF" : "#fff")};
  border-color: ${(props) => (props.selected ? "#1890FF" : "#e8e8e8")};

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 0 0 5px rgba(24, 144, 255, 0.2);
  }

  & .title-container {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;

    & .title {
      font-size: 20px;
      font-weight: 400;
    }
  }

  & .description {
    font-size: 16px;
  }
`;
