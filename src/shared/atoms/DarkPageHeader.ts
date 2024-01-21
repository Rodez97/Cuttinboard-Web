import { PageHeader } from "@ant-design/pro-layout";
import { Colors } from "@rodez97/cuttinboard-library";
import styled from "@emotion/styled";

const DarkPageHeader = styled(PageHeader)`
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
    :hover {
      color: rgba(255, 255, 255, 0.65);
    }
  }
`;

export default DarkPageHeader;
