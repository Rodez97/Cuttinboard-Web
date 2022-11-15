import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Cuttinboard_File } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Dropdown, Input, Modal, Typography } from "antd";
import axios from "axios";
import fileDownload from "js-file-download";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDisclose, useFileItem } from "../../hooks";
import { recordError } from "../../utils/utils";

interface FilesMenuProps {
  file: Cuttinboard_File;
}

function FileMenu({ file }: FilesMenuProps) {
  const { t } = useTranslation();
  const { canManage } = useCuttinboardModule();
  const [newFileName, setNewFileName] = useState("");
  const [renameOpen, openRename, closeRename] = useDisclose();
  const [renaming, startRenaming, endRenaming] = useDisclose();
  const { copyToClipboard, openFile } = useFileItem(file);

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
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const renameFile = async () => {
    openRename();
    startRenaming();
    try {
      await file.rename(newFileName.trim());
    } catch (error) {
      recordError(error);
    }
    endRenaming();
    closeRename();
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

  return (
    <React.Fragment>
      <Dropdown
        menu={{
          items: [
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
              onClick: openRename,
            },
            {
              label: t("Delete"),
              key: "deleteFile",
              icon: <DeleteOutlined />,
              disabled: !canManage,
              danger: true,
              onClick: handleDelete,
            },
          ],
        }}
        trigger={["click"]}
      >
        <Button
          type="text"
          icon={<MoreOutlined />}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </Dropdown>

      <Modal
        confirmLoading={renaming}
        open={renameOpen}
        title={t(`Rename file`)}
        okText={t("Accept")}
        cancelText={t("Cancel")}
        onCancel={closeRename}
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

export default FileMenu;
