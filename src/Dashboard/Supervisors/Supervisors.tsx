/** @jsx jsx */
import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Button, Col, Layout, List, PageHeader, Row, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { QuickUserDialogAvatar } from "../../components/QuickUserDialog";

function Supervisors({ supervisors }: { supervisors: Employee[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Layout css={{ overflow: "auto" }}>
      <PageHeader
        onBack={() => navigate(-1)}
        title={t("Supervisors")}
        subTitle={`(${Number(supervisors?.length)})`}
        extra={[
          <Button
            key="1"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("new-supervisor")}
          >
            {t("Add Supervisor")}
          </Button>,
        ]}
      />
      <Row justify="center" css={{ paddingBottom: "50px" }}>
        <Col xs={24} md={20} lg={16} xl={12}>
          <List
            dataSource={supervisors}
            css={{ padding: "20px 10px" }}
            renderItem={(sup) => (
              <List.Item
                css={{
                  backgroundColor: Colors.MainOnWhite,
                  padding: "10px",
                  marginTop: "10px",
                }}
                key={sup.id}
                actions={[
                  <ArrowRightOutlined
                    onClick={() => navigate(`details/${sup.id}`)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={`${sup.name} ${sup.lastName}`}
                  description={
                    <Tag color="processing">
                      {t("Supervising {{0}} location(s)", {
                        0: sup.supervisingLocations?.length ?? 0,
                      })}
                    </Tag>
                  }
                  avatar={<QuickUserDialogAvatar employee={sup} />}
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </Layout>
  );
}

export default Supervisors;
