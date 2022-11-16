/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ref } from "firebase/storage";
import { useMemo, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Cuttinboard_File } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Storage } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  Button,
  Image,
  Input,
  Layout,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import Icon, {
  CloudUploadOutlined,
  InfoCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import PickFile from "./PickFile";
import { matchSorter } from "match-sorter";
import { useDisclose } from "../../hooks";
import {
  EmptyMainModule,
  GrayPageHeader,
  PageError,
  PageLoading,
} from "../../components";
import { ColumnsType } from "antd/lib/table";
import { getFileColorsByType, getFileIconByType } from "./FileTypeIcons";
import fileSize from "filesize";
import FileMenu from "./FileMenu";
import { recordError } from "../../utils/utils";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";
import ModuleInfoDialog from "../ManageApp/ModuleInfoDialog";
import ModuleManageMembers from "../ManageApp/ModuleManageMembers";

function FilesMain() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [pickFileOpen, pickFiles, closePickFile] = useDisclose();
  const [viewImage, setViewImage] = useState("");
  const { selectedApp, canManage } = useCuttinboardModule();
  const { location } = useLocation();
  const [drawerFiles, loading, drawerFilesError] =
    useCollectionData<Cuttinboard_File>(
      selectedApp &&
        selectedApp.contentRef.withConverter(Cuttinboard_File.Converter)
    );
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const [manageMembersOpen, openManageMembers, closeManageMembers] =
    useDisclose();
  const { baseRef, editModule } = useManageModule();
  const storagePathRef = useMemo(
    () =>
      ref(Storage, `${location.storageRef.fullPath}/storage/${selectedApp.id}`),
    [location.storageRef.fullPath, selectedApp.id]
  );

  const getOrderedFiles = useMemo(() => {
    return searchQuery
      ? matchSorter(drawerFiles, searchQuery, {
          keys: ["name"],
        })
      : drawerFiles;
  }, [drawerFiles, searchQuery]);

  const columns: ColumnsType<Cuttinboard_File> = [
    {
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      ellipsis: {
        showTitle: false,
      },
      render: (_, { name, fileType }) => {
        const fileIcon = getFileIconByType(name, fileType);
        const fileColor = getFileColorsByType(name, fileType);

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
      width: "61%",
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend", "ascend"],
    },
    {
      title: t("Size"),
      dataIndex: "size",
      key: "size",
      render: (_, { size }) => (
        <Typography.Text>{fileSize(size)}</Typography.Text>
      ),
      width: "12%",
      align: "right",
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, { createdAt }) => (
        <Typography.Text>
          {createdAt?.toDate().toLocaleString()}
        </Typography.Text>
      ),
      width: "20%",
      sorter: (a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis(),
      align: "right",
    },
    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      render: (_, file) => <FileMenu file={file} />,
      width: "7%",
      align: "center",
    },
  ];

  const fileClick = async (file: Cuttinboard_File) => {
    try {
      const fileUrl = await file.getUrl();
      if (file.fileType.startsWith("image/")) {
        setViewImage(fileUrl);
      } else {
        window.open(fileUrl, "_blanc");
      }
    } catch (error) {
      recordError(error);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (drawerFilesError) {
    return <PageError error={drawerFilesError} />;
  }

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={openInfo}
        title={selectedApp.name}
        extra={[
          <Button
            key="members"
            type="primary"
            onClick={openManageMembers}
            icon={<TeamOutlined />}
          >
            {t("Members")}
          </Button>,
        ]}
      />

      <Space
        size="large"
        css={{
          display: "flex",
          padding: "10px 20px",
          alignItems: "center",
        }}
      >
        <Button
          disabled={!canManage}
          onClick={pickFiles}
          icon={<CloudUploadOutlined />}
          type="primary"
        >
          {t("Upload Files")}
        </Button>
        <Input.Search
          placeholder={t("Search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          css={{ width: 200 }}
        />
      </Space>

      {getOrderedFiles?.length ? (
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            padding: 20,
            paddingTop: 0,
            overflow: "auto",
          }}
        >
          <Table
            dataSource={getOrderedFiles}
            columns={columns}
            size="small"
            css={{
              minWidth: 500,
              margin: "auto",
            }}
            pagination={false}
            sticky
            onRow={(file) => ({
              onClick: () => fileClick(file),
            })}
          />
          {viewImage && (
            <Image
              width={200}
              css={{ display: "none" }}
              src={viewImage}
              preview={{
                visible: true,
                src: viewImage,
                onVisibleChange: (value) => {
                  if (!value) {
                    setViewImage(null);
                  }
                },
              }}
            />
          )}
        </div>
      ) : (
        <EmptyMainModule
          description={
            <span>
              No files. <a onClick={pickFiles}>upload one</a> or{" "}
              <a
                href="https://www.cuttinboard.com/help/understanding-the-notes-app"
                target="_blank"
              >
                learn more.
              </a>
            </span>
          }
        />
      )}

      <PickFile
        maxSize={5e7}
        maxFiles={3}
        baseStorageRef={storagePathRef}
        open={pickFileOpen}
        onClose={closePickFile}
      />
      <ManageModuleDialog ref={baseRef} moduleName="Notes Stack" />
      <ModuleInfoDialog
        open={infoOpen}
        onCancel={closeInfo}
        onEdit={() => {
          closeInfo();
          editModule(selectedApp);
        }}
      />
      <ModuleManageMembers
        open={manageMembersOpen}
        onCancel={closeManageMembers}
      />
    </Layout.Content>
  );
}

export default FilesMain;
