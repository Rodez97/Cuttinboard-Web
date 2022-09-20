/** @jsx jsx */
import { jsx } from "@emotion/react";
import { BaseMediaProps } from "components/ChatV2/CustomMessages/BaseMediaProps";
import Linkify from "linkify-react";
import { getFileIconByType } from "../../../Modules/Files/FileTypeIcons";
import { Avatar, List, Space, Typography } from "antd";
import Icon from "@ant-design/icons";
import mdiOpenInNew from "@mdi/svg/svg/open-in-new.svg";
import styled from "@emotion/styled";

const FileElementContainer = styled(List.Item)`
  background-color: #00000010;
  cursor: pointer;
  padding: 10px;
`;

function FileMessage({ source, attachment, message }: BaseMediaProps) {
  const handleDownload = async () => {
    window.open(source, "_blanc");
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
          avatar={
            <Avatar
              icon={
                <Icon
                  component={getFileIconByType(
                    attachment.filename,
                    attachment?.mimeType
                  )}
                />
              }
              shape="square"
            />
          }
          description={attachment.filename}
        />
      </FileElementContainer>
      {message && message !== "📁 File Message" && (
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
            {message ?? attachment.filename}
          </Linkify>
        </Typography.Paragraph>
      )}
    </Space>
  );
}

export default FileMessage;
