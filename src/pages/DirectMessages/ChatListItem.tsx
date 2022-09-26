import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { List } from "antd";
import styled from "@emotion/styled";

export const ChatListItem = styled(List.Item)`
  cursor: pointer;
  & .ant-list-item-meta-title {
    color: #fff;
  }
  & .ant-list-item-meta-description {
    color: rgba(255, 255, 255, 0.65);
  }
  & .conv-selected {
    border-left: 5px solid ${Colors.MainBlue};
    padding-left: 5px;
  }
  & .ant-list-item-meta-avatar {
    margin-right: 5px;
    align-self: center;
  }
  & .ant-typography {
    margin-bottom: 0px;
    color: rgba(255, 255, 255, 0.65);
  }
`;
