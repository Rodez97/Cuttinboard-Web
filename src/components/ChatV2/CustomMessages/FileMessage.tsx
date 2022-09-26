/** @jsx jsx */
import { jsx } from "@emotion/react";
import { BaseMediaProps } from "components/ChatV2/CustomMessages/BaseMediaProps";
import Linkify from "linkify-react";
import { getFileIconByType } from "../../../Modules/Files/FileTypeIcons";
import { Avatar, List, Space, Typography } from "antd";
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
  const getText = () => {
    if (message.type === "mediaUri") {
      return null;
    } else {
      return message.attachment.fileName;
    }
  };
  return (
    <Space direction="vertical" css={{ width: "100%" }}>
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
      {message && message.message !== "📁 File Message" && (
        <Typography.Paragraph
          css={{
            color: "inherit",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            fontSize: 14,
            marginBottom: "0px !important",
          }}
        >
          <Linkify
            options={{
              target: "_blank",
              rel: "noreferrer noopener",
              className: "linkifyInnerStyle",
            }}
          >
            {getText()}
          </Linkify>
        </Typography.Paragraph>
      )}
    </Space>
  );
}

export default FileMessage;
