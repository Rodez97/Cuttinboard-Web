import React, { useState } from "react";
import { getFileColorsByType, getFileIconByType } from "./FileTypeIcons";
import { Cuttinboard_File } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import useFileItem from "./useFileItem";
import { Dropdown, Input, Menu, Modal, Space, Tooltip, Typography } from "antd";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import Icon, {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileExclamationOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import fileSize from "filesize";
import { updateDoc } from "firebase/firestore";
import { recordError } from "../../utils/utils";

interface FilesItemProps {
  id: string;
  file: Cuttinboard_File;
}

function FilesItem({ file }: FilesItemProps) {
  const { t } = useTranslation();
  const fileIcon = getFileIconByType(file.name, file.fileType);
  const fileColor = getFileColorsByType(file.name, file.fileType);
  const { canManage } = useCuttinboardModule();
  const { deleteFile, copyToClipboard, openFile } = useFileItem(file);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [renaming, setRenaming] = useState(false);

  const handleDelete = async () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this file?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          await deleteFile();
        } catch (error) {
          return recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const renameFile = async () => {
    const filenameMath = file.name.match(/^(.*?)\.([^.]*)?$/);
    const oldName = filenameMath[1];
    const extension = filenameMath[2];
    if (!newFileName || newFileName === oldName) {
      return;
    }
    setRenaming(true);
    const name = `${newFileName}.${extension}`;
    try {
      await updateDoc(file.docRef, { name });
    } catch (error) {
      recordError(error);
    }
    setRenameDialogOpen(false);
    setRenaming(false);
  };

  return (
    <>
      <Tooltip title={file.name}>
        <Dropdown
          overlay={
            <Menu
              items={[
                {
                  label: t("Copy link"),
                  key: "onCopyToClipboardClick",
                  icon: <CopyOutlined />,
                  onClick: copyToClipboard,
                },
                {
                  label: t("Download"),
                  key: "onDownload",
                  icon: <DownloadOutlined />,
                  onClick: openFile,
                },
                {
                  label: t("Rename"),
                  key: "renameFile",
                  icon: <FormOutlined />,
                  disabled: !canManage,
                  onClick: () => setRenameDialogOpen(true),
                },
                {
                  label: t("Delete"),
                  key: "deleteFile",
                  icon: <DeleteOutlined />,
                  disabled: !canManage,
                  danger: true,
                  onClick: handleDelete,
                },
                {
                  label: fileSize(file.size),
                  key: "fileSize",
                  icon: <FileExclamationOutlined />,
                  disabled: true,
                },
              ]}
            />
          }
          trigger={["contextMenu"]}
        >
          <Space
            direction="vertical"
            align="center"
            style={{
              backgroundColor: Colors.MainOnWhite,
              width: 120,
              height: 120,
              padding: "2px",
              margin: "5px",
              cursor: "pointer",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            <Icon
              component={fileIcon}
              style={{ color: fileColor, fontSize: "70px" }}
            />
            <Typography.Paragraph
              ellipsis={{ rows: 2, expandable: false, symbol: "..." }}
              style={{ wordBreak: "break-word" }}
            >
              {file.name}
            </Typography.Paragraph>
          </Space>
        </Dropdown>
      </Tooltip>
      <Modal
        confirmLoading={renaming}
        open={renameDialogOpen}
        title={t(`Rename file`)}
        okText={t("Accept")}
        cancelText={t("Cancel")}
        onCancel={() => setRenameDialogOpen(false)}
        onOk={renameFile}
      >
        <Typography.Text mark>{file.name}</Typography.Text>
        <Input
          placeholder={t("New filename")}
          value={newFileName}
          onChange={(e) => setNewFileName(e.currentTarget.value)}
          disabled={renaming}
        />
      </Modal>
    </>
  );
}

export default FilesItem;
