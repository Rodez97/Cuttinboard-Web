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
  Tooltip,
  Typography,
} from "antd";
import Icon, {
  CloudUploadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import PickFile from "./PickFile";
import { matchSorter } from "match-sorter";
import {
  GrayPageHeader,
  NotFound,
  EmptyBoard,
  LoadingPage,
} from "../../shared";
import fileSize from "filesize";
import { recordError } from "../../utils/utils";
import ManageBoard, { useManageBoard } from "../ManageBoard";
import BoardInfo from "../BoardInfo";
import { useRenameFile } from "../../Modules/Files/RenameFile";
import {
  getFileColorsByType,
  getFileIconByType,
} from "../../Modules/Files/FileTypeIcons";
import FileMenu from "../../Modules/Files/FileMenu";
import {
  FilesProvider,
  getFileUrl,
  STORAGE,
  useCuttinboard,
  useDisclose,
  useFiles,
  useFilesData,
  useGBoard,
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
  const { selectedBoard, selectBoardId, loading, error } = useGBoard();

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
  const { selectedBoard } = useGBoard();
  if (!selectedBoard) {
    throw new Error("No board selected");
  }
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [pickFileOpen, pickFiles, closePickFile] = useDisclose();
  const [viewImage, setViewImage] = useState<string | null>("");
  const { files } = useFiles();
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const { baseRef, editBoard } = useManageBoard();
  const { renameCuttinboardFile, RenameFile } = useRenameFile();
  const storagePathRef = useMemo(
    () =>
      selectedBoard &&
      ref(STORAGE, `organizations/${user.uid}/files/${selectedBoard.id}`),
    [selectedBoard, user.uid]
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
        title: t("Created"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (_, { createdAt }) => (
          <Typography.Text>{dayjs(createdAt).format("lll")}</Typography.Text>
        ),
        width: "20%",
        sorter: (a, b) => a.createdAt - b.createdAt,
        align: "right",
      },
      {
        title: "",
        dataIndex: "actions",
        key: "actions",
        render: (_, file) => (
          <FileMenu file={file} onRename={renameCuttinboardFile} canManage />
        ),
        width: "7%",
        align: "center",
      },
    ],
    [renameCuttinboardFile, t]
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

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={openInfo}
        title={selectedBoard.name}
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

      {files.length === 0 ? (
        <EmptyBoard
          description={
            <span>
              {t("No files")}. <a onClick={pickFiles}>{t("upload one")}</a>{" "}
              {t("or")}{" "}
              <a
                href="http://www.cuttinboard.com/help/global-files"
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
        baseStorageRef={storagePathRef}
        open={pickFileOpen}
        onClose={closePickFile}
      />
      <ManageBoard ref={baseRef} moduleName="Notes Stack" />
      <BoardInfo
        open={infoOpen}
        onCancel={closeInfo}
        onEdit={() => {
          closeInfo();
          editBoard(selectedBoard);
        }}
      />
    </Layout.Content>
  );
}
