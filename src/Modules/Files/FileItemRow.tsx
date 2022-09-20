import React from "react";
import { Cuttinboard_File } from "@cuttinboard/cuttinboard-library/models";
import { getFileColorsByType, getFileIconByType } from "./FileTypeIcons";
import fileSize from "filesize";
import dayjs from "dayjs";
import { List, Typography } from "antd";
import Icon from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default ({ file }: { file: Cuttinboard_File }): JSX.Element => {
  const { t } = useTranslation();
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
            style={{ color: fileColor, fontSize: "30px" }}
          />
        }
        title={file.name}
        description={dayjs(file.createdAt.toDate()).format("MM/DD/YYYY")}
      />
    </List.Item>
  );
};
