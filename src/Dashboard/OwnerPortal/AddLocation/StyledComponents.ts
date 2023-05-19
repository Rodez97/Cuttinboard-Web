import styled from "@emotion/styled";
import { Layout } from "antd/es";

export const AddLocationWrapper = styled(Layout)`
  overflow: auto;
  height: 100%;
  padding: 20px;
`;

export const AddLocationContent = styled(Layout.Content)`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 30px;
  overflow: auto;
`;

export const AddLocationHeader = styled(Layout.Header)`
  background-color: transparent !important;
  text-align: center;
`;

export const SummaryNewLocationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 5px;
  padding: 10px;
  box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.8),
    0px 1px 3px rgba(0, 0, 0, 0.3);
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#000000),
    to(#434343)
  );
  color: #fff !important;
  & .ant-list-item-meta-title {
    color: #fff !important;
  }
  & .ant-list-item-meta-description {
    color: #ffffff80 !important;
  }
  & .ant-typography {
    color: #fff;
    text-align: center;
  }
  & .ant-typography-secondary {
    color: #ffffff80;
  }
`;
