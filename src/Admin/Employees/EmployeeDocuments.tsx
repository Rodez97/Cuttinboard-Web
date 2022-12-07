/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  StorageReference,
  uploadBytes,
} from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Card,
  Divider,
  Layout,
  List,
  message,
  Modal,
  Upload,
  UploadProps,
} from "antd";
import {
  DeleteFilled,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileFilled,
  InboxOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Colors,
  STORAGE,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { recordError } from "../../utils/utils";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useNavigate, useParams } from "react-router-dom";
import { GrayPageHeader } from "../../components";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";

const { Dragger } = Upload;

export default () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getEmployeeById } = useEmployeesList();
  const { location } = useCuttinboardLocation();
  const { user } = useCuttinboard();
  const [files, setFiles] = useState<StorageReference[]>([]);
  const [userFiles, setUserFiles] = useState<StorageReference[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const employee = useMemo(
    () => (id ? getEmployeeById(id) : null),
    [getEmployeeById, id]
  );

  useEffect(() => {
    if (employee) {
      loadFilesFromStorage();
    }
  }, [employee]);

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
    if (!employee) {
      throw new Error("Employee not found");
    }
    const storageRef = ref(
      STORAGE,
      `organizations/${location.organizationId}/employees/${employee.id}/location/${location.id}/${file.name}`
    );
    try {
      const uploadRef = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          locationId: location.id,
          employeeId: employee.id,
          uploadedBy: user.uid,
        },
      });
      setFiles([...files, uploadRef.ref]);
      // Report to analytics
      logEvent(getAnalytics(), "file_upload", {
        file_size: file.size,
        file_type: file.type,
        file_location: location.id,
        from: "employee_documents",
      });
    } catch (error) {
      recordError(error);
    }
  };

  const handleDeleteFile = (file: StorageReference) => () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this file from the location?"),
      content: file.name,
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          await deleteObject(file);
          setFiles(files.filter((f) => f.fullPath !== file.fullPath));
        } catch (error) {
          return recordError(error);
        }
      },
    });
  };

  const handleFileClick = (file: StorageReference) => async () => {
    const url = await getDownloadURL(file);
    window.open(url, "_blank");
  };

  const loadFilesFromStorage = async () => {
    if (!employee) {
      throw new Error("Employee not found");
    }
    setLoadingFiles(true);
    const storageRef = ref(
      STORAGE,
      `organizations/${location.organizationId}/employees/${employee.id}/location/${location.id}`
    );
    const result = await listAll(storageRef);
    setFiles(result.items);
    const userStorageRef = ref(STORAGE, `users/${employee.id}/documents`);
    const userResult = await listAll(userStorageRef);
    setUserFiles(userResult.items);
    setLoadingFiles(false);
  };

  const props: UploadProps = {
    beforeUpload: async (file) => {
      message.loading(t("Uploading File"));
      await handleChange(file);
      message.destroy();
      return false;
    },
    fileList: [],
  };

  if (!employee) {
    return null;
  }

  return (
    <Layout>
      <GrayPageHeader
        onBack={() => navigate(-1)}
        title={employee.fullName}
        subTitle={t("Employee Documents")}
        avatar={{
          src: employee.avatar,
          icon: <UserOutlined />,
          alt: employee.fullName,
        }}
      />
      <Layout.Content
        css={{
          display: "flex",
          flexDirection: "column",
          padding: 20,
          paddingBottom: 30,
        }}
      >
        <div
          css={{
            display: "flex",
            minWidth: 300,
            maxWidth: 500,
            margin: "auto",
            width: "100%",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Card title={t("Employee Documents")}>
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{t("Upload Document")}</p>
              <p className="ant-upload-hint">
                {t("Click or drag file to this area to upload")}
              </p>
            </Dragger>

            <Divider>{t("Documents")}</Divider>
            <List
              loading={loadingFiles}
              dataSource={files}
              bordered
              renderItem={(file, index) => (
                <List.Item
                  key={index}
                  actions={[
                    <DeleteFilled
                      key="delete"
                      onClick={handleDeleteFile(file)}
                      style={{ color: Colors.Error.errorMain }}
                    />,
                    <DownloadOutlined
                      key="download"
                      onClick={handleFileClick(file)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileFilled />} />}
                    description={file.name}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title={t("Uploaded by employee")}>
            <List
              loading={loadingFiles}
              dataSource={userFiles}
              bordered
              renderItem={(file, index) => (
                <List.Item
                  key={index}
                  actions={[
                    <DownloadOutlined
                      key="download"
                      onClick={handleFileClick(file)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileFilled />} />}
                    description={file.name}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </Layout.Content>
    </Layout>
  );
};
