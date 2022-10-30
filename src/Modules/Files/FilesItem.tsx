/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useState } from "react";
import { getFileColorsByType, getFileIconByType } from "./FileTypeIcons";
import { Cuttinboard_File } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import useFileItem from "../../hooks/useFileItem";
import {
  Dropdown,
  Image,
  Input,
  Menu,
  Modal,
  Space,
  Tooltip,
  Typography,
} from "antd";
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
import { recordError } from "../../utils/utils";
import axios from "axios";
import fileDownload from "js-file-download";

interface FilesItemProps {
  id: string;
  file: Cuttinboard_File;
}

function FilesItem({ file }: FilesItemProps) {
  const { t } = useTranslation();
  const fileIcon = getFileIconByType(file.name, file.fileType);
  const fileColor = getFileColorsByType(file.name, file.fileType);
  const { canManage } = useCuttinboardModule();
  const { copyToClipboard, openFile } = useFileItem(file);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const handleDelete = async () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this file?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          await file.delete();
        } catch (error) {
          return recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const renameFile = async () => {
    setRenaming(true);
    try {
      await file.rename(newFileName.trim());
    } catch (error) {
      recordError(error);
    }
    setRenameDialogOpen(false);
    setRenaming(false);
  };

  const downloadFile = async () => {
    try {
      const fileUrl = await file.getUrl();
      const res = await axios.get(fileUrl, { responseType: "blob" });
      fileDownload(res.data, file.name, file.fileType);
    } catch (error) {
      recordError(error);
    }
  };

  const handleFileClick = async () => {
    try {
      if (file.fileType.startsWith("image/")) {
        if (!imageUrl) {
          const fileUrl = await file.getUrl();
          setImageUrl(fileUrl);
        }
        setIsImageVisible(true);
      } else {
        openFile();
      }
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <React.Fragment>
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
                  onClick: downloadFile,
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
            onClick={handleFileClick}
            direction="vertical"
            align="center"
            css={{
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
              css={{ color: fileColor, fontSize: "60px" }}
            />
            <Typography.Paragraph
              ellipsis={{ rows: 2, expandable: false, symbol: "..." }}
              css={{ wordBreak: "break-word" }}
            >
              {file.name}
            </Typography.Paragraph>
            {file.fileType.startsWith("image/") && (
              <Image
                width={200}
                css={{ display: "none" }}
                src={imageUrl}
                preview={{
                  visible: isImageVisible,
                  src: imageUrl,
                  onVisibleChange: (value) => {
                    setIsImageVisible(value);
                  },
                }}
              />
            )}
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
    </React.Fragment>
  );
}

export default FilesItem;
