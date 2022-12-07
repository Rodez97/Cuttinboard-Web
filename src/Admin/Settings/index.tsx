/** @jsx jsx */
import {
  ScheduleOutlined,
  SettingFilled,
  ShopOutlined,
} from "@ant-design/icons";
import { jsx } from "@emotion/react";
import { Layout, Menu, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";
import LocationSettings from "./LocationSettings";
import ScheduleSettings from "./ScheduleSettings";

export default () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useRouterLocation();

  return (
    <Layout hasSider>
      <Layout.Sider
        width={250}
        breakpoint="lg"
        collapsedWidth="0"
        className="module-sider"
      >
        <Space direction="vertical" className="module-sider-content">
          <div
            css={{
              display: "flex",
              alignItems: "center",
              padding: "5px 10px",
              justifyContent: "center",
            }}
          >
            <SettingFilled
              css={{
                fontSize: "20px",
                color: "#74726e",
              }}
            />
            <Typography.Text
              css={{
                color: "#74726e",
                fontSize: "20px",
                marginLeft: "10px",
              }}
            >
              {t("Settings")}
            </Typography.Text>
          </div>
          <Menu
            theme="dark"
            selectedKeys={[pathname.split("/").pop() ?? ""]}
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
            className="module-sider-menu"
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
};
