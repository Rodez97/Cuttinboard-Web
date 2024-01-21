import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { getFileUrl, useFiles } from "@rodez97/cuttinboard-library";
import { ICuttinboard_File } from "@rodez97/types-helpers";
import { Button, Dropdown, message, Modal } from "antd/es";
import axios from "axios";
import fileDownload from "js-file-download";
import React from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

interface FilesMenuProps {
  file: ICuttinboard_File;
  onRename: (file: ICuttinboard_File) => void;
  canManage: boolean;
}

export default ({ file, onRename, canManage }: FilesMenuProps) => {
  const { t } = useTranslation();
  const { deleteFile } = useFiles();

  const handleDelete = async () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this file?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      onOk() {
        deleteFile(file);
      },
    });
  };

  const downloadFile = async () => {
    try {
      const fileUrl = await getFileUrl(file);
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
              onClick: async (e) => {
                e.domEvent.stopPropagation();
                const fileUrl = await getFileUrl(file);
                await navigator.clipboard.writeText(fileUrl);
                message.success(t("Link copied to clipboard"));
              },
            },
            {
              label: t("Download"),
              key: "onDownload",
              icon: <DownloadOutlined />,
              onClick: async (e) => {
                e.domEvent.stopPropagation();
                await downloadFile();
              },
            },
            ...(canManage
              ? [
                  {
                    label: t("Rename"),
                    key: "renameFile",
                    icon: <FormOutlined />,
                    onClick: (e) => {
                      e.domEvent.stopPropagation();
                      onRename(file);
                    },
                  },
                  {
                    label: t("Delete"),
                    key: "deleteFile",
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: async (e) => {
                      e.domEvent.stopPropagation();
                      await handleDelete();
                    },
                  },
                ]
              : []),
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
    </React.Fragment>
  );
};
