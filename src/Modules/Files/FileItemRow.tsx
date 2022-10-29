/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Cuttinboard_File } from "@cuttinboard-solutions/cuttinboard-library/models";
import { getFileColorsByType, getFileIconByType } from "./FileTypeIcons";
import fileSize from "filesize";
import dayjs from "dayjs";
import { List, Typography } from "antd";
import Icon from "@ant-design/icons";

export default ({ file }: { file: Cuttinboard_File }): JSX.Element => {
  const fileIcon = getFileIconByType(file.name, file.fileType);
  const fileColor = getFileColorsByType(file.name, file.fileType);

  return (
    <List.Item
      actions={[
        <Typography.Text type="secondary">
          {fileSize(file.size)}
        </Typography.Text>,
      ]}
    >
      <List.Item.Meta
        avatar={
          <Icon
            component={fileIcon}
            css={{ color: fileColor, fontSize: "30px" }}
          />
        }
        title={file.name}
        description={dayjs(file.createdAt.toDate()).format("MM/DD/YYYY")}
      />
    </List.Item>
  );
};
