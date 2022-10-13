/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  PrivacyLevel,
  RoleAccessLevels,
  useCuttinboardModule,
  useEmployeesList,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader } from "components/PageHeaders";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "utils/utils";
import { Button, Divider, List, Space, Tag } from "antd";
import {
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LockOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";

function ModuleInfo() {
  const { selectedApp, canManage } = useCuttinboardModule();
  const { locationAccessKey } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getEmployees } = useEmployeesList();

  const handleDelete = async () => {
    if (!canManage) {
      return;
    }
    try {
      await selectedApp.delete();
    } catch (error) {
      recordError(error);
    }
  };

  const hosts = useMemo(() => {
    if (!Boolean(selectedApp.hosts?.length)) {
      return [];
    }
    return getEmployees.filter((e) => selectedApp.hosts?.indexOf(e.id) > -1);
  }, [getEmployees, selectedApp]);

  return (
    <div>
      <GrayPageHeader title={t("Details")} onBack={() => navigate(-1)} />
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{
            minWidth: 270,
            maxWidth: 400,
            margin: "auto",
            width: "100%",
          }}
        >
          <Divider orientation="left">{t("About")}</Divider>
          <List.Item>
            <List.Item.Meta
              avatar={<FormOutlined />}
              title={t("Name")}
              description={selectedApp.name}
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              avatar={
                selectedApp.privacyLevel === PrivacyLevel.PRIVATE ? (
                  <LockOutlined />
                ) : selectedApp.privacyLevel === PrivacyLevel.POSITIONS ? (
                  <TagsOutlined />
                ) : (
                  <GlobalOutlined />
                )
              }
              title={t("Privacy Level")}
              description={t(selectedApp.privacyLevel)}
            />
          </List.Item>
          {Boolean(hosts.length) && (
            <List.Item>
              <List.Item.Meta
                avatar={<CrownOutlined />}
                title={t("Hosts")}
                description={hosts.map((host) => (
                  <p>{host.fullName}</p>
                ))}
              />
            </List.Item>
          )}
          <List.Item>
            <List.Item.Meta
              avatar={<InfoCircleOutlined />}
              title={t("Description")}
              description={
                Boolean(selectedApp.description)
                  ? selectedApp.description
                  : "---"
              }
            />
          </List.Item>
          {selectedApp.privacyLevel === PrivacyLevel.POSITIONS &&
            selectedApp.accessTags?.length && (
              <Space
                wrap
                css={{
                  border: "1px solid #00000025",
                  width: "100%",
                  padding: 10,
                }}
              >
                {selectedApp.accessTags.map((p) => (
                  <Tag key={p}>{p}</Tag>
                ))}
              </Space>
            )}
          <Divider />
          {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
            <div
              css={{
                gap: 12,
                marginTop: 30,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Button
                icon={<EditOutlined />}
                type="dashed"
                block
                onClick={() => navigate("edit")}
              >
                {t("Edit Board")}
              </Button>
              <Button
                icon={<DeleteOutlined />}
                type="dashed"
                danger
                block
                onClick={handleDelete}
              >
                {t("Delete Board")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModuleInfo;
