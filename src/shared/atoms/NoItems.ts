import { Empty } from "antd";
import styled from "@emotion/styled";

const NoItems = styled(Empty)`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  & .ant-empty-description {
    color: #00000050 !important;
  }
`;

export default NoItems;
