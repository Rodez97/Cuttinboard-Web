import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import styled from "@emotion/styled";
import { PageHeader } from "antd";

export const DarkPageHeader = styled(PageHeader)`
  background-color: ${Colors.MainDark};
  & .ant-page-header-heading-title {
    color: #fff !important;
  }
  & .ant-page-header-back-button {
    color: #fff !important;
  }
  & .ant-page-header-heading-sub-title {
    color: rgba(255, 255, 255, 0.65) !important;
  }
  & .ant-btn {
    color: #fff;
  }
`;

export const GrayPageHeader = styled(PageHeader)`
  background-color: ${Colors.MainOnWhite};
`;
