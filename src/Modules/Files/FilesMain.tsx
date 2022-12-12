/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ref } from "firebase/storage";
import { useLayoutEffect, useMemo, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  Image,
  Input,
  Layout,
  Space,
  Table,
  TableColumnsType,
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
import {
  GrayPageHeader,
  PageError,
  LoadingPage,
  NotFound,
  EmptyBoard,
} from "../../shared";
import { getFileColorsByType, getFileIconByType } from "./FileTypeIcons";
import fileSize from "filesize";
import FileMenu from "./FileMenu";
import { recordError } from "../../utils/utils";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";
import ModuleInfoDialog from "../ManageApp/ModuleInfoDialog";
import ModuleManageMembers from "../ManageApp/ModuleManageMembers";
import {
  Cuttinboard_File,
  useBoard,
} from "@cuttinboard-solutions/cuttinboard-library/boards";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  STORAGE,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library/utils";

export default function FilesMain() {
  const { boardId } = useParams();
  const { selectedBoard, selectBoard } = useBoard();

  useLayoutEffect(() => {
    if (boardId) {
      selectBoard(boardId);
    }
    return () => {
      selectBoard("");
    };
  }, [boardId, selectBoard]);

  if (!selectedBoard) {
    return <NotFound />;
  }

  return <Main />;
}

function Main() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [pickFileOpen, pickFiles, closePickFile] = useDisclose();
  const [viewImage, setViewImage] = useState<string | null>("");
  const { selectedBoard, canManageBoard } = useBoard();
  const { location } = useCuttinboardLocation();
  const [drawerFiles, loading, drawerFilesError] =
    useCollectionData<Cuttinboard_File>(
      selectedBoard &&
        selectedBoard.contentRef.withConverter(
          Cuttinboard_File.firestoreConverter
        )
    );
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const [manageMembersOpen, openManageMembers, closeManageMembers] =
    useDisclose();
  const { baseRef, editModule } = useManageModule();
  const storagePathRef = useMemo(
    () =>
      selectedBoard &&
      ref(
        STORAGE,
        `${location.storageRef.fullPath}/storage/${selectedBoard.id}`
      ),
    [location.storageRef.fullPath, selectedBoard]
  );

  const getOrderedFiles = useMemo(() => {
    if (!drawerFiles) {
      return [];
    }
    return searchQuery
      ? matchSorter(drawerFiles, searchQuery, {
          keys: ["name"],
        })
      : drawerFiles;
  }, [drawerFiles, searchQuery]);

  const columns: TableColumnsType<Cuttinboard_File> = [
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
      sorter: (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis(),
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
    return <LoadingPage />;
  }

  if (drawerFilesError) {
    return <PageError error={drawerFilesError} />;
  }

  if (!selectedBoard || !storagePathRef) {
    return <EmptyBoard />;
  }

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={openInfo}
        title={selectedBoard.name}
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
          disabled={!canManageBoard}
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
        <EmptyBoard
          description={
            <span>
              No files. <a onClick={pickFiles}>upload one</a> or{" "}
              <a
                href="https://www.cuttinboard.com/help/understanding-the-notes-app"
                target="_blank"
                rel="noreferrer"
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
          editModule(selectedBoard);
        }}
      />
      <ModuleManageMembers
        open={manageMembersOpen}
        onCancel={closeManageMembers}
      />
    </Layout.Content>
  );
}
