import styled from "@emotion/styled";

export const MessageContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 5px;
  padding-bottom: 0px;
  width: 100%;
  position: relative;
  align-items: center;
`;

export const MainMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2px 5px;
`;

export const MessageWrap = styled.div`
  width: 100%;
  position: relative;
  & .optionsBtn {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    right: 15px;
    top: -25px;
    z-index: 20;
    transition: visibility 0s, opacity 0.2s linear;
  }
  :hover {
    background-color: #00000010;
    & .optionsBtn {
      visibility: visible;
      opacity: 1;
    }
  }
`;

export const GroupHeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const GroupContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 1px;
`;
