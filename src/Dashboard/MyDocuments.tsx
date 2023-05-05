/** @jsx jsx */
import { jsx } from "@emotion/react";
import Icon, {
  DeleteFilled,
  DownloadOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Divider,
  message,
  Modal,
  Table,
  Tooltip,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  StorageReference,
  uploadBytes,
} from "firebase/storage";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../utils/utils";
import { logEvent } from "firebase/analytics";
import {
  getFileColorsByType,
  getFileIconByType,
} from "../Modules/Files/FileTypeIcons";
import usePageTitle from "../hooks/usePageTitle";
import {
  STORAGE,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ANALYTICS } from "firebase";
import {
  MAX_DOCUMENTS,
  MAX_FILE_SIZE,
} from "@cuttinboard-solutions/types-helpers";
import { GrayPageHeader } from "../shared";

const { Dragger } = Upload;

function MyDocuments() {
  usePageTitle("My Documents");
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const [userFiles, setUserFiles] = useState<StorageReference[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const loadFilesFromStorage = useCallback(async () => {
    // Set loadingFiles to true to indicate that the files are being loaded
    setLoadingFiles(true);

    try {
      // Get a reference to the user's storage location
      const userStorageRef = ref(STORAGE, `users/${user.uid}/documents`);

      // List all files in the user's storage location
      const userResult = await listAll(userStorageRef);

      // Set the userFiles state variable with the files from the user's storage location
      setUserFiles(userResult.items);
    } catch (error) {
      // Handle error if something goes wrong
      recordError(error);
    } finally {
      // Set loadingFiles to false to indicate that the files have been loaded
      setLoadingFiles(false);
    }
  }, [user.uid, setLoadingFiles, setUserFiles]);

  useLayoutEffect(() => {
    loadFilesFromStorage();
  }, [loadFilesFromStorage]);

  const handleChange = async (file: File) => {
    const filenameParts = file.name.split(".");
    const fileExtension = filenameParts.pop();
    const filename = filenameParts.join(".");
    const fileName = prompt(
      "Enter file name (Optional, leave blank to use original name)",
      filename
    );
    const newFile = fileName
      ? new File([file], `${fileName}.${fileExtension}`, { type: file.type })
      : file;
    await handleSaveFile(newFile);
  };

  const handleSaveFile = async (file: File) => {
    const storageRef = ref(STORAGE, `users/${user.uid}/documents/${file.name}`);
    try {
      const uploadRef = await uploadBytes(storageRef, file, {
        contentType: file.type,
      });
      setUserFiles([...userFiles, uploadRef.ref]);
      // Report document upload to analytics
      logEvent(ANALYTICS, "upload_document", {
        contentType: file.type,
        size: file.size,
        from: "MyDocuments",
      });
    } catch (error) {
      recordError(error);
    }
  };

  const handleDeleteFile = (file: StorageReference) => async () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this file?"),
      icon: <ExclamationCircleOutlined />,
      cancelText: t("Cancel"),
      async onOk() {
        try {
          await deleteObject(file);
          setUserFiles(userFiles.filter((f) => f.fullPath !== file.fullPath));
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  const handleFileClick = (file: StorageReference) => async () => {
    const url = await getDownloadURL(file);
    window.open(url, "_blank");
  };

  const props: UploadProps = {
    beforeUpload: async (file) => {
      if (file.size > MAX_FILE_SIZE) {
        message.error(t("File size is too large"));
        return false;
      }

      if (file.type !== "application/pdf") {
        message.error(t("Only PDF files are supported"));
        return false;
      }

      message.loading(t("Uploading File"));
      await handleChange(file);
      message.destroy();
      return false;
    },
    fileList: [],
    maxCount: 1,
  };

  return (
    <React.Fragment>
      <GrayPageHeader title={t("My Documents")} />
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{
            minWidth: 270,
            maxWidth: 500,
            margin: "auto",
            width: "100%",
          }}
        >
          <Alert
            type="warning"
            showIcon
            css={{ marginBottom: 10 }}
            message={t(
              "Employers will have access to the documents you upload in this section"
            )}
          />

          <div>
            <Dragger
              {...props}
              disabled={Boolean(userFiles.length >= MAX_DOCUMENTS)}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{t("Upload Document")}</p>
              <p className="ant-upload-hint">
                {t("Click or drag file to this area to upload")}
              </p>
              <p className="ant-upload-hint">
                {t("Files must be PDFs and less than 8MB in size")}
              </p>
            </Dragger>
          </div>

          <Divider>
            {t("Documents")}{" "}
            <Typography.Text type="secondary">{`${userFiles.length}/${MAX_DOCUMENTS}`}</Typography.Text>
          </Divider>

          <Table
            dataSource={userFiles}
            loading={loadingFiles}
            columns={[
              {
                title: t("Name"),
                dataIndex: "name",
                key: "name",
                ellipsis: {
                  showTitle: false,
                },
                render: (_, { name }) => {
                  const fileIcon = getFileIconByType(name);
                  const fileColor = getFileColorsByType(name);

                  return (
                    <Tooltip
                      placement="topLeft"
                      title={name}
                      css={{ gap: 5, display: "flex", alignItems: "center" }}
                    >
                      <Icon
                        component={fileIcon}
                        css={{ color: fileColor, fontSize: "20px" }}
                      />
                      <Typography.Paragraph
                        ellipsis={{ rows: 1 }}
                        css={{
                          marginBottom: "0px !important",
                        }}
                      >
                        {name}
                      </Typography.Paragraph>
                    </Tooltip>
                  );
                },
                sorter: (a, b) => a.name.localeCompare(b.name),
                defaultSortOrder: "ascend",
                sortDirections: ["ascend", "descend", "ascend"],
              },
              {
                title: "",
                dataIndex: "actions",
                key: "actions",
                render: (_, file) => (
                  <Button.Group>
                    <Button
                      key="delete"
                      icon={<DeleteFilled />}
                      onClick={handleDeleteFile(file)}
                      type="link"
                      danger
                    />
                    <Button
                      key="download"
                      icon={<DownloadOutlined />}
                      onClick={handleFileClick(file)}
                      type="link"
                    />
                  </Button.Group>
                ),
                align: "center",
                width: 100,
              },
            ]}
            size="small"
            css={{
              minWidth: 500,
              margin: "auto",
            }}
            pagination={false}
            sticky
          />
        </div>
      </div>
    </React.Fragment>
  );
}

export default MyDocuments;
