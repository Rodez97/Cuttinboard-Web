/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../DashboardProvider";
import { Layout, Tabs } from "antd";
import { CrownOutlined } from "@ant-design/icons";
import MemberLocations from "./MemberLocations";
import SupervisorLocations from "./SupervisorLocations";
import { PageHeader } from "@ant-design/pro-layout";
import { GoldButton } from "../../shared";

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
              icon={<CrownOutlined />}
              onClick={() => navigate("/dashboard/upgrade")}
            >
              {t("Upgrade to Owner")}
            </GoldButton>,
          ]
        }
      />

      <Content css={{ padding: "5px 10px", overflow: "auto" }}>
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
      </Content>
    </Layout>
  );
};
