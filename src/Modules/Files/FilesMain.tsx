/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ref } from "firebase/storage";
import React, { useMemo, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router-dom";
import FilesItem from "./FilesItem";
import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import {
  Cuttinboard_File,
  ModuleFirestoreConverter,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Storage } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import ToolBar from "../ToolBar";
import FileItemRow from "./FileItemRow";
import { Button, Col, Layout, List, Row, Segmented, Space } from "antd";
import { GrayPageHeader } from "../../components/PageHeaders";
import {
  AppstoreOutlined,
  BarsOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import PickFile from "./PickFile";
import { matchSorter } from "match-sorter";
import { EmptyMainModule } from "../Notes/EmptyMainModule";

const CuttinboardFileConverter = ModuleFirestoreConverter<Cuttinboard_File>();

function FilesMain() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [viewType, setViewType] = useState<"module" | "list">("module");
  const [{ order, index, searchQuery }, setOrderData] = useState<{
    index: number;
    order: "desc" | "asc";
    searchQuery?: string;
  }>({
    index: 0,
    order: "asc",
    searchQuery: "",
  });
  const [pickFileOpen, setPickFileOpen] = useState(false);
  const { selectedApp, moduleContentRef, canManage } = useCuttinboardModule();
  const { locationStorageRef } = useLocation();
  const [drawerFiles, loading, drawerFilesError] =
    useCollectionData<Cuttinboard_File>(
      moduleContentRef &&
        moduleContentRef.withConverter(CuttinboardFileConverter)
    );
  const storagePathRef = useMemo(
    () =>
      ref(Storage, `${locationStorageRef.fullPath}/storage/${selectedApp.id}`),
    [locationStorageRef.fullPath, selectedApp.id]
  );

  const pickFiles = () => setPickFileOpen(true);

  const getOrderedFiles = useMemo(() => {
    let ordered: Cuttinboard_File[] = [];

    switch (index) {
      case 0:
        ordered = orderBy(drawerFiles, "createdAt", order);
        break;
      case 1:
        ordered = orderBy(drawerFiles, "name", order);
        break;
      case 2:
        ordered = orderBy(drawerFiles, "size", order);
        break;

      default:
        ordered = drawerFiles;
        break;
    }

    return matchSorter(ordered, searchQuery, {
      keys: ["name"],
      sorter: (items) => items,
    });
  }, [drawerFiles, index, order, searchQuery]);

  const handleChange = (nextView: "module" | "list") => {
    setViewType(nextView);
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
        onBack={() => navigate("details")}
        title={selectedApp.name}
        extra={[
          <Button
            key="uploadFile"
            disabled={!canManage}
            onClick={pickFiles}
            icon={<CloudUploadOutlined />}
            type="dashed"
          >
            {t("Upload Files")}
          </Button>,
          <Button
            key="members"
            type="primary"
            onClick={() => navigate(`members`)}
            icon={<TeamOutlined />}
          >
            {t("Members")}
          </Button>,
        ]}
      />
      <ToolBar
        options={["Creation", "Name", "Size"]}
        index={index}
        order={order}
        onChageOrder={(order) => setOrderData((prev) => ({ ...prev, order }))}
        onChange={(index) => setOrderData((prev) => ({ ...prev, index }))}
        searchQuery={searchQuery}
        onChangeSearchQuery={(sq) =>
          setOrderData((prev) => ({ ...prev, searchQuery: sq }))
        }
      />
      <div css={{ display: "flex", padding: "10px", justifyContent: "center" }}>
        <Segmented
          value={viewType}
          onChange={handleChange}
          options={[
            {
              value: "list",
              icon: <BarsOutlined />,
            },
            {
              value: "module",
              icon: <AppstoreOutlined />,
            },
          ]}
        />
      </div>

      {getOrderedFiles?.length ? (
        viewType === "module" ? (
          <Space wrap style={{ display: "flex", padding: "10px" }}>
            {getOrderedFiles?.map((file, i) => (
              <FilesItem key={i} id={file.id} file={file} />
            ))}
          </Space>
        ) : (
          <Row justify="center" style={{ paddingBottom: "50px" }}>
            <Col xs={24} md={20} lg={16} xl={12}>
              <List
                bordered
                style={{ width: "100%" }}
                dataSource={getOrderedFiles}
                renderItem={(file) => <FileItemRow key={file.id} file={file} />}
              />
            </Col>
          </Row>
        )
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
        onClose={() => setPickFileOpen(false)}
      />
    </Layout.Content>
  );
}

export default FilesMain;
