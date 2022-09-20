import {
  DeleteFilled,
  EditFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useLocation } from "@cuttinboard/cuttinboard-library/services";
import {
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard/cuttinboard-library/utils";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Layout,
  Modal,
  PageHeader,
  Row,
  Space,
  Tag,
} from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";

interface BaseInfoProps {
  deleteApp: () => Promise<void>;
  hostId?: string;
  name: string;
  description?: string;
  privacyLevel: PrivacyLevel;
  positions?: string[];
  members?: string[];
}

function BaseInfo({
  deleteApp,
  name,
  description,
  privacyLevel,
  positions,
  members,
}: BaseInfoProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { locationAccessKey } = useLocation();

  const handleEdit = () => {
    navigate("edit");
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this element?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          await deleteApp();
          close();
        } catch (error) {
          return recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const close = () => navigate(-1);

  console.log(positions);

  return (
    <Layout>
      <PageHeader
        className="site-page-header-responsive"
        onBack={close}
        title={t("Board Details")}
      />
      <Row justify="center" style={{ paddingBottom: "50px" }}>
        <Col xs={22} sm={18} lg={10}>
          <Card style={{ width: "100%" }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t("Name")}>{name}</Descriptions.Item>
              {description && (
                <Descriptions.Item label={t("Description")}>
                  {description}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t("Privacy Level")}>
                {t(privacyLevel)}
              </Descriptions.Item>
              {privacyLevel === PrivacyLevel.POSITIONS && positions?.length && (
                <Descriptions.Item label={t("Selected Positions")}>
                  {positions?.map((pos, key) => (
                    <Tag key={key}>{t(pos)}</Tag>
                  ))}
                </Descriptions.Item>
              )}
              {privacyLevel === PrivacyLevel.PRIVATE && members && (
                <Descriptions.Item label={t("Members")}>
                  {members.length}
                </Descriptions.Item>
              )}
            </Descriptions>
            <Space
              align="center"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                marginTop: "10px",
              }}
            >
              {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
                <>
                  <Button icon={<DeleteFilled />} danger onClick={handleDelete}>
                    {t("Delete")}
                  </Button>
                  <Button
                    icon={<EditFilled />}
                    type="dashed"
                    onClick={handleEdit}
                  >
                    {t("Edit")}
                  </Button>
                </>
              )}

              <Button onClick={close} type="primary">
                OK
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}

export default BaseInfo;
