/** @jsx jsx */
import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons";
import { jsx } from "@emotion/react";
import { Button, Layout, List, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@ant-design/pro-layout";
import { UserInfoAvatar } from "../../shared";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library";
import { IOrganizationEmployee } from "@cuttinboard-solutions/types-helpers";
import EmptyExtended from "../../shared/molecules/EmptyExtended";

export default ({ supervisors }: { supervisors: IOrganizationEmployee[] }) => {
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
            {supervisors?.length ? (
              <List
                dataSource={supervisors}
                css={{ padding: "20px 10px" }}
                renderItem={(sup) => (
                  <List.Item
                    css={{
                      backgroundColor: Colors.MainOnWhite,
                      padding: "10px !important",
                      marginTop: "10px",
                    }}
                    key={sup.id}
                    actions={[
                      <ArrowRightOutlined
                        key="details"
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
                      avatar={<UserInfoAvatar employee={sup} />}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <EmptyExtended
                descriptions={[
                  "Invite Supervisors to administer several locations",
                  "Delegate administrative tasks to your Supervisors",
                  "Give your Supervisors absolute permissions in the locations you assign to them",
                ]}
                description={
                  <p>
                    {t("Supervisors help you manage your locations")}
                    {". "}
                    <Link to="new-supervisor">{t("Add Supervisor")}</Link>
                  </p>
                }
              />
            )}
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
};
