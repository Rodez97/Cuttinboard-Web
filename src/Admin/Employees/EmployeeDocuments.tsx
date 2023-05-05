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
  Result,
  Upload,
  UploadProps,
} from "antd";
import {
  DeleteFilled,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileFilled,
  InboxOutlined,
} from "@ant-design/icons";
import { getAvatarObject, recordError } from "../../utils/utils";
import { logEvent } from "firebase/analytics";
import { useNavigate, useParams } from "react-router-dom";
import { GrayPageHeader } from "../../shared";
import {
  Colors,
  STORAGE,
  useCuttinboardLocation,
  useEmployees,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ANALYTICS } from "firebase";
import {
  getEmployeeFullName,
  roleToString,
} from "@cuttinboard-solutions/types-helpers";

const { Dragger } = Upload;

export default () => {
  const { id } = useParams();
  if (!id) throw new Error("No id provided");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { location } = useCuttinboardLocation();
  const [files, setFiles] = useState<StorageReference[]>([]);
  const [userFiles, setUserFiles] = useState<StorageReference[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { getEmployeeById } = useEmployees();

  const employee = useMemo(() => getEmployeeById(id), [getEmployeeById, id]);

  if (!location) {
    throw new Error("No location found");
  }

  if (!employee) {
    throw new Error("No employee found");
  }

  useEffect(() => {
    if (employee) {
      const loadFilesFromStorage = async () => {
        const employeeStorageRef = ref(
          STORAGE,
          `locations/${location.id}/employees/${employee.id}`
        );
        const userStorageRef = ref(STORAGE, `users/${employee.id}/documents`);
        try {
          const employeeStorageFiles = await listAll(employeeStorageRef);
          setFiles(employeeStorageFiles.items);

          const userStorageFiles = await listAll(userStorageRef);
          setUserFiles(userStorageFiles.items);
        } catch (error) {
          setError(error);
          console.error(error);
        } finally {
          setLoadingFiles(false);
        }
      };
      loadFilesFromStorage();
    }
  }, [employee, location.id, location.organizationId]);

  const handleChange = async (file: File) => {
    const nameArray = file.name.split(".");
    const extension = nameArray.pop();
    const newName = prompt(
      t("Enter file name (Optional, leave blank to use original name)")
    );
    const newFile = newName
      ? new File([file], `${newName}.${extension}`, { type: file.type })
      : file;
    await uploadFile(newFile);
  };

  const uploadFile = async (file: File) => {
    if (!employee) {
      throw new Error("Employee not found");
    }
    const { type, name, size } = file;
    const { id: locationId } = location;
    const storageRef = ref(
      STORAGE,
      `locations/${location.id}/employees/${employee.id}/${name}`
    );

    try {
      const uploadRef = await uploadBytes(storageRef, file, {
        contentType: type,
      });
      setFiles([...files, uploadRef.ref]);
      // Report to analytics
      logEvent(ANALYTICS, "file_upload", {
        size,
        type,
        locationId,
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

  const props: UploadProps = {
    beforeUpload: async (file) => {
      // Return false if the file is not a PDF
      if (file.type !== "application/pdf") {
        message.error(t("Only PDF files are allowed"));
        return false;
      }

      // Return false if file size exceeds 8 MB
      if (file.size > 8e6) {
        message.error(t("Your file surpasses the 8mb limit"));
        return false;
      }

      message.loading(t("Uploading File"));
      await handleChange(file);
      message.destroy();
      return false;
    },
    fileList: [],
    multiple: false,
    maxCount: 1,
    // Allow only PDF files
    accept: ".pdf",
  };

  if (!employee) {
    return (
      <Result status="404" title="404" subTitle={t("Employee not found")} />
    );
  }

  if (error) {
    return (
      <Result
        status="500"
        title="500"
        subTitle={t("Error loading employee documents")}
      />
    );
  }

  return (
    <Layout>
      <GrayPageHeader
        onBack={() => navigate(-1)}
        title={getEmployeeFullName(employee)}
        subTitle={roleToString(employee.role)}
        avatar={getAvatarObject(employee)}
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
          <Card title={t("Documents")}>
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
