/** @jsx jsx */
import { jsx } from "@emotion/react";
import PageLoading from "./components/PageLoading";
import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation as useRouterLocation,
  useParams,
} from "react-router-dom";
import {
  useLocation,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Badge, Button, Layout } from "antd";
import { useTranslation } from "react-i18next";
import Icon, { SettingFilled, SwapOutlined } from "@ant-design/icons";
import Forum from "@mdi/svg/svg/forum.svg";
import MessageTextLock from "@mdi/svg/svg/message-text-lock.svg";
import UserMenu from "./components/UserMenu";
import { getRoleTextByNumber } from "./Admin/Employees/employee-utils";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { DarkPageHeader } from "./components/PageHeaders";

const LocationSettings = lazy(() => import("./Admin/LocationSettings"));
const DM = lazy(() => import("./pages/DirectMessages/DM"));
const AppsRouter = lazy(() => import("./Modules/AppsRouter"));
const Conversations = lazy(() => import("./pages/Conversations/Conv"));

export function LocationContainer() {
  const { locationId } = useParams();
  const { pathname } = useRouterLocation();
  const navigate = useNavigate();
  const { locationAccessKey, location } = useLocation();
  const { t } = useTranslation();
  const { getBadgeByModule, getDMBadges } = useNotificationsBadges();

  if (
    !locationAccessKey ||
    locationAccessKey.locId !== locationId ||
    !location
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <DarkPageHeader
        onBack={() => navigate("/dashboard", { replace: true })}
        backIcon={<SwapOutlined />}
        title={location.name}
        subTitle={t(getRoleTextByNumber(locationAccessKey.role))}
        extra={[
          <Badge
            key="conversations"
            count={getBadgeByModule("conv")}
            size="small"
            offset={[-20, 5]}
          >
            <Button
              icon={<Icon component={Forum} />}
              type={
                pathname.split("/")[3] === "conversations" ? "primary" : "text"
              }
              shape="circle"
              onClick={() => navigate("conversations", { replace: true })}
            />
          </Badge>,

          <Badge
            key="directMessages"
            count={getDMBadges}
            size="small"
            offset={[-20, 5]}
          >
            <Button
              icon={<Icon component={MessageTextLock} />}
              type={pathname.split("/")[3] === "chats" ? "primary" : "text"}
              shape="circle"
              onClick={() => navigate("chats", { replace: true })}
            />
          </Badge>,
          <Button
            hidden={locationAccessKey.role > RoleAccessLevels.GENERAL_MANAGER}
            icon={<SettingFilled />}
            key="locSettings"
            type={pathname.split("/")[3] === "locSettings" ? "primary" : "text"}
            shape="circle"
            onClick={() => navigate("locSettings", { replace: true })}
            className="settings-btn"
            css={{ marginRight: 15 }}
          />,
          <UserMenu key="userMenu" />,
        ]}
      />

      <Layout.Content css={{ display: "flex" }}>
        <Routes>
          <Route
            path={`chats/*`}
            element={
              <Suspense fallback={<PageLoading />}>
                <DM locationId={locationId} />
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
          {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
            <Route
              path={`locSettings`}
              element={
                <Suspense fallback={<PageLoading />}>
                  <LocationSettings />
                </Suspense>
              }
            />
          )}
          <Route path="*" element={<Navigate to="apps" />} />
        </Routes>
      </Layout.Content>
    </Layout>
  );
}
