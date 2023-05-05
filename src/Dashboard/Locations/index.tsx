/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../DashboardProvider";
import { Layout, Tabs } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import { PageHeader } from "@ant-design/pro-layout";
import { GoldButton, LoadingPage } from "../../shared";
import { lazy, Suspense } from "react";

const MemberLocations = lazy(() => import("./MemberLocations"));
const SupervisorLocations = lazy(() => import("./SupervisorLocations"));

const { Content } = Layout;

export default (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userDocument } = useDashboard();

  return (
    <Layout css={{ overflow: "auto" }}>
      <PageHeader
        backIcon={false}
        title={t("Locations")}
        extra={
          !userDocument.subscriptionId && [
            <GoldButton
              key="1"
              type="text"
              icon={<ShopOutlined />}
              onClick={() => navigate("/dashboard/upgrade-create")}
            >
              {t("Create Location")}
            </GoldButton>,
          ]
        }
      />

      <Content css={{ padding: "5px 10px", overflow: "auto" }}>
        <Suspense fallback={<LoadingPage />}>
          <Tabs
            items={[
              {
                label: t("Member"),
                key: "member",
                children: <MemberLocations />,
              },
              {
                label: t("Supervisor"),
                key: "supervisor",
                children: <SupervisorLocations />,
              },
            ]}
          />
        </Suspense>
      </Content>
    </Layout>
  );
};
