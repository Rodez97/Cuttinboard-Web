/** @jsx jsx */
import { jsx } from "@emotion/react";
import { BaseMediaProps } from "./BaseMediaProps";
import { getFileIconByType } from "../../Modules/Files/FileTypeIcons";
import { Avatar, List } from "antd";
import Icon, { FileFilled } from "@ant-design/icons";
import mdiOpenInNew from "@mdi/svg/svg/open-in-new.svg";
import styled from "@emotion/styled";

const FileElementContainer = styled(List.Item)`
  background-color: #00000010;
  cursor: pointer;
  padding: 10px;
`;

function FileMessage({ message }: BaseMediaProps) {
  const getSrc = () => {
    if (message.type === "mediaUri") {
      return message.sourceUrl;
    } else {
      return message.attachment.uri;
    }
  };

  const handleDownload = async () => {
    window.open(getSrc(), "_blanc");
  };

  const GetIcon = () => {
    if (message.type === "mediaUri") {
      return <FileFilled />;
    } else {
      const Icon = getFileIconByType(
        message.attachment.fileName,
        message.attachment.mimeType
      );
      return <Icon />;
    }
  };

  return (
    <div css={{ width: "100%" }}>
      <FileElementContainer
        extra={[
          <Icon
            component={mdiOpenInNew}
            css={{ color: "rgba(0, 0, 0, 0.45)", fontSize: 18 }}
          />,
        ]}
        onClick={handleDownload}
      >
        <List.Item.Meta
          avatar={<Avatar icon={<Icon component={GetIcon} />} shape="square" />}
          description={
            message.type === "attachment" && message.attachment.fileName
          }
        />
      </FileElementContainer>
    </div>
  );
}

export default FileMessage;
