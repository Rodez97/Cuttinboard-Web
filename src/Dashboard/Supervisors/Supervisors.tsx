/** @jsx jsx */
import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Button, Empty, Layout, List, PageHeader, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
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
      <Layout.Content>
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            padding: 20,
          }}
        >
          <div
            css={{
              minWidth: 300,
              maxWidth: 700,
              margin: "auto",
              width: "100%",
            }}
          >
            {Boolean(supervisors?.length) ? (
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
            ) : (
              <div
                css={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Empty
                  description={
                    <p>
                      {t("Supervisors help you manage your locations.")}{" "}
                      <Link to="new-supervisor">{t("Add Supervisor")}</Link>
                    </p>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
}

export default Supervisors;
