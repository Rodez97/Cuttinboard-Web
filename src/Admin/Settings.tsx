/** @jsx jsx */
import {
  ScheduleOutlined,
  SettingFilled,
  ShopOutlined,
} from "@ant-design/icons";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Layout, Menu, Space } from "antd";
import { useTranslation } from "react-i18next";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";
import { DarkPageHeader } from "../components";
import LocationSettings from "./LocationSettings";
import ScheduleSettings from "./ScheduleSettings";

function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useRouterLocation();
  return (
    <Layout hasSider>
      <Layout.Sider width={250} breakpoint="lg" collapsedWidth="0">
        <Space
          direction="vertical"
          css={{
            display: "flex",
            padding: "3px 5px",
            borderTop: `5px solid ${Colors.MainBlue}`,
          }}
        >
          <DarkPageHeader
            title={t("Settings")}
            avatar={{ src: <SettingFilled /> }}
            onBack={() => navigate(-1)}
            css={{ paddingBottom: 0, paddingTop: 0 }}
          />
          <Menu
            theme="dark"
            selectedKeys={[pathname.split("/").pop()]}
            items={[
              {
                key: "location",
                label: t("Location"),
                onClick: () => navigate("location", { replace: true }),
                icon: <ShopOutlined />,
              },
              {
                key: "schedule",
                label: t("Schedule"),
                onClick: () => navigate("schedule", { replace: true }),
                icon: <ScheduleOutlined />,
              },
            ]}
          />
        </Space>
      </Layout.Sider>
      <Layout.Content>
        <Routes>
          <Route path="location" element={<LocationSettings />} />
          <Route path="schedule" element={<ScheduleSettings />} />
          <Route path="*" element={<Navigate to="location" />} />
        </Routes>
      </Layout.Content>
    </Layout>
  );
}

export default Settings;
