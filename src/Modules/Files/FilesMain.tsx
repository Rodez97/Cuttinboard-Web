/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ref } from "firebase/storage";
import { useLayoutEffect, useMemo, useState } from "react";
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
  Tag,
  Tooltip,
  Typography,
} from "antd";
import Icon, {
  CloudUploadOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import PickFile from "./PickFile";
import { matchSorter } from "match-sorter";
import {
  GrayPageHeader,
  NotFound,
  EmptyBoard,
  LoadingPage,
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
import { useRenameFile } from "./RenameFile";
import {
  FilesProvider,
  getFileUrl,
  STORAGE,
  useBoard,
  useCuttinboardLocation,
  useDisclose,
  useFiles,
  useFilesData,
} from "@cuttinboard-solutions/cuttinboard-library";
import dayjs from "dayjs";
import ErrorPage from "../../shared/molecules/PageError";
import { ICuttinboard_File } from "@cuttinboard-solutions/types-helpers";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(LocalizedFormat);

export default function FilesMain() {
  const { boardId } = useParams();
  if (!boardId) {
    throw new Error("No board id");
  }
  const { selectedBoard, selectBoardId, loading, error } = useBoard();

  useLayoutEffect(() => {
    if (boardId) {
      selectBoardId(boardId);
    }
    return () => {
      selectBoardId();
    };
  }, [boardId, selectBoardId]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!selectedBoard) {
    return <NotFound />;
  }

  return (
    <FilesProvider selectedBoard={selectedBoard}>
      <Main />
    </FilesProvider>
  );
}

function Main() {
  const { selectedBoard, canManageBoard } = useBoard();
  if (!selectedBoard) {
    throw new Error("No board selected");
  }
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [pickFileOpen, pickFiles, closePickFile] = useDisclose();
  const [viewImage, setViewImage] = useState<string | null>("");
  const { location } = useCuttinboardLocation();
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const [manageMembersOpen, openManageMembers, closeManageMembers] =
    useDisclose();
  const { baseRef, editModule } = useManageModule();
  const { renameCuttinboardFile, RenameFile } = useRenameFile();
  const { files, loading, error } = useFiles();
  const storagePathRef = useMemo(
    () => ref(STORAGE, `locations/${location.id}/files/${selectedBoard.id}`),
    [location, selectedBoard]
  );

  useFilesData(selectedBoard);

  const getOrderedFiles = useMemo(() => {
    if (!files) {
      return [];
    }
    return searchQuery
      ? matchSorter(files, searchQuery, {
          keys: ["name"],
        })
      : files;
  }, [files, searchQuery]);

  const columns = useMemo<TableColumnsType<ICuttinboard_File>>(
    () => [
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
        title: t("Created"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (_, { createdAt }) => (
          <Typography.Text>{dayjs(createdAt).format("lll")}</Typography.Text>
        ),
        width: "20%",
        sorter: (a, b) => a.createdAt - b.createdAt,
        align: "right",
        defaultSortOrder: "descend",
      },
      {
        title: "",
        dataIndex: "actions",
        key: "actions",
        render: (_, file) => (
          <FileMenu
            file={file}
            onRename={renameCuttinboardFile}
            canManage={!selectedBoard?.global && canManageBoard}
          />
        ),
        width: "7%",
        align: "center",
      },
    ],
    [canManageBoard, renameCuttinboardFile, selectedBoard, t]
  );

  const fileClick = async (file: ICuttinboard_File) => {
    try {
      const fileUrl = await getFileUrl(file);
      if (file.fileType.startsWith("image/")) {
        setViewImage(fileUrl);
      } else {
        window.open(fileUrl, "_blanc");
      }
    } catch (error) {
      recordError(error);
    }
  };

  if (!selectedBoard || !storagePathRef) {
    return <EmptyBoard />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={openInfo}
        title={selectedBoard.name}
        extra={
          selectedBoard.global ? (
            <Tag color="processing" icon={<GlobalOutlined />}>
              {t("Global Board")}
            </Tag>
          ) : (
            <Button
              key="members"
              type="primary"
              onClick={openManageMembers}
              icon={<TeamOutlined />}
            >
              {t("Members")}
            </Button>
          )
        }
      />

      <Space
        size="large"
        css={{
          display: "flex",
          padding: "10px 20px",
          alignItems: "center",
        }}
      >
        {!selectedBoard.global && canManageBoard && (
          <Button
            onClick={pickFiles}
            icon={<CloudUploadOutlined />}
            type="primary"
          >
            {t("Upload Files")}
          </Button>
        )}

        <Input.Search
          placeholder={t("Search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          css={{ width: 200 }}
        />
      </Space>

      {loading ? (
        <LoadingPage />
      ) : files.length === 0 ? (
        <EmptyBoard
          description={
            <span>
              {t("No files")}
              {". "}
              {!selectedBoard.global && canManageBoard && (
                <span>
                  <a onClick={pickFiles}>{t("upload one")}</a> {t("or")}{" "}
                </span>
              )}
              <a
                href="http://www.cuttinboard.com/help/files"
                target="_blank"
                rel="noreferrer"
              >
                {t("Learn more")}
              </a>
            </span>
          }
        />
      ) : (
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
              style: { cursor: "pointer" },
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
      )}

      {RenameFile}
      <PickFile
        maxSize={5e7}
        // 200MB
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
