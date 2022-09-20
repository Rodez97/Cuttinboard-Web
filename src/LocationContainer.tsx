/** @jsx jsx */
import { jsx } from "@emotion/react";
import PageLoading from "./components/PageLoading";
import { lazy, Suspense, useMemo } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation as useRouterLocation,
  useParams,
} from "react-router-dom";
import {
  useCuttinboard,
  useLocation,
  useNotificationsBadges,
} from "@cuttinboard/cuttinboard-library/services";
import { Badge, Button, Layout, Menu, PageHeader } from "antd";
import { useTranslation } from "react-i18next";
import Icon, { SettingOutlined, SwapOutlined } from "@ant-design/icons";
import Forum from "@mdi/svg/svg/forum.svg";
import MessageTextLock from "@mdi/svg/svg/message-text-lock.svg";
import Apps from "@mdi/svg/svg/apps.svg";
import UserMenu from "./components/UserMenu";
import { getRoleTextByNumber } from "./Admin/Employees/employee-utils";

const LocationSettings = lazy(() => import("./Admin/LocationSettings"));
const DM = lazy(() => import("./pages/RealtimeChat/DM"));
const AppsRouter = lazy(() => import("./Modules/AppsRouter"));
const Conversations = lazy(() => import("./pages/RealtimeConversations/Conv"));

export function LocationContainer() {
  const { locationId } = useParams();
  const { pathname } = useRouterLocation();
  const { notifications } = useCuttinboard();
  const navigate = useNavigate();
  const { locationAccessKey, location } = useLocation();
  const { t } = useTranslation();
  const { getBadgeByModule } = useNotificationsBadges();

  const items = useMemo(
    () => [
      {
        label: (
          <Badge
            dot
            count={getBadgeByModule("sch") + getBadgeByModule("task")}
            size="small"
            css={{ color: "inherit" }}
            offset={[10, 0]}
          >
            {t("Apps")}
          </Badge>
        ),
        key: "apps",
        icon: <Icon component={Apps} />,
      },
      {
        label: (
          <Badge
            dot
            count={getBadgeByModule("conv")}
            size="small"
            css={{ color: "inherit" }}
            offset={[10, 0]}
          >
            {t("Conversations")}
          </Badge>
        ),
        key: "conversations",
        icon: <Icon component={Forum} />,
      },
      {
        label: t("Chats"),
        key: "chats",
        icon: <Icon component={MessageTextLock} />,
      },
    ],
    [notifications]
  );

  if (!locationAccessKey || locationAccessKey.locId !== locationId) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Layout>
      <PageHeader
        className="site-page-header"
        onBack={() => navigate("/dashboard")}
        backIcon={<SwapOutlined />}
        title={location.name}
        subTitle={t(getRoleTextByNumber(locationAccessKey.role))}
        extra={[
          <Button
            icon={<SettingOutlined />}
            key="locSettings"
            type="text"
            shape="circle"
            onClick={() => navigate("locSettings")}
            className="settings-btn"
          />,
          <UserMenu key="userMenu" color="#000" />,
        ]}
      />
      <Menu
        items={items}
        css={{ justifyContent: "center" }}
        mode="horizontal"
        theme="dark"
        selectedKeys={[pathname.split("/")[3]]}
        onSelect={({ key }) => navigate(key)}
      />
      <Layout.Content css={{ display: "flex" }}>
        <Routes>
          <Route
            path={`chats/*`}
            element={
              <Suspense fallback={<PageLoading />}>
                <DM />
              </Suspense>
            }
          />
          <Route
            path={`apps/*`}
            element={
              <Suspense fallback={<PageLoading />}>
                <AppsRouter />
              </Suspense>
            }
          />
          <Route
            path={`conversations/*`}
            element={
              <Suspense fallback={<PageLoading />}>
                <Conversations />
              </Suspense>
            }
          />
          <Route
            path={`locSettings`}
            element={
              <Suspense fallback={<PageLoading />}>
                <LocationSettings />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="apps" />} />
        </Routes>
      </Layout.Content>
    </Layout>
  );
}
