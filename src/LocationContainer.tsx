/** @jsx jsx */
import { jsx } from "@emotion/react";
import { lazy, Suspense, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation as useRouterLocation,
  useParams,
} from "react-router-dom";
import { Badge, Button, Layout, Menu, MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import Icon, { SettingFilled, SwapOutlined } from "@ant-design/icons";
import Forum from "@mdi/svg/svg/forum.svg";
import MessageTextLock from "@mdi/svg/svg/message-text-lock.svg";
import {
  RoleAccessLevels,
  roleToString,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { DarkPageHeader, PageLoading, UserMenu } from "./components";
import mdiViewDashboard from "@mdi/svg/svg/view-dashboard.svg";
import mdiMyShifts from "@mdi/svg/svg/account-clock-outline.svg";
import mdiNotes from "@mdi/svg/svg/note-multiple-outline.svg";
import mdiTasks from "@mdi/svg/svg/checkbox-marked-circle-plus-outline.svg";
import mdiFiles from "@mdi/svg/svg/folder-home-outline.svg";
import mdiChecklist from "@mdi/svg/svg/clipboard-list-outline.svg";
import mdiEmployees from "@mdi/svg/svg/account-group-outline.svg";
import mdiSchedule from "@mdi/svg/svg/store-clock-outline.svg";
import mdiUtensils from "@mdi/svg/svg/silverware-fork-knife.svg";
import AppsView from "./Modules/AppsView";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";

const Settings = lazy(() => import("./Admin/Settings"));
const DM = lazy(() => import("./Chats/DirectMessages"));
const Conversations = lazy(() => import("./Chats/Conversations"));
const Tasks = lazy(() => import("./Modules/Tasks"));
const Notes = lazy(() => import("./Modules/Notes"));
const Shifts = lazy(() => import("./Modules/MyShifts"));
const Storage = lazy(() => import("./Modules/Files"));
const GlobalChecklist = lazy(() => import("./Modules/GlobalChecklist"));
const Employees = lazy(() => import("./Admin/Employees"));
const Schedule = lazy(() => import("./Admin/Scheduler"));
const Utensils = lazy(() => import("./Admin/Utensils"));

export default () => {
  const { locationId } = useParams();
  const { pathname } = useRouterLocation();
  const navigate = useNavigate();
  const { locationAccessKey, location } = useCuttinboardLocation();
  const { t } = useTranslation();
  const { notifications } = useCuttinboard();
  const [collapsed, setCollapsed] = useState(false);

  const AdminItems: MenuProps["items"] = [
    {
      key: "home",
      icon: <Icon component={mdiViewDashboard} />,
      label: t("Summary"),
    },
    {
      key: "divider",
      type: "divider",
      style: { borderColor: "#fbfbfa25", borderWidth: 0.2 },
    },
    {
      key: "employees",
      label: "Employees",
      icon: <Icon component={mdiEmployees} />,
    },
    {
      key: "schedule",
      label: "Schedule",
      icon: <Icon component={mdiSchedule} />,
    },
    {
      key: "utensils",
      label: "Utensils",
      icon: <Icon component={mdiUtensils} />,
    },
    {
      key: "divider-2",
      type: "divider",
      style: { borderColor: "#fbfbfa25", borderWidth: 0.2 },
    },
  ];

  const NavItems: MenuProps["items"] = [
    {
      key: "my-shifts",
      label: "My Shifts",
      icon: (
        <Badge
          count={notifications?.getScheduleBadges(
            location.organizationId,
            locationId!
          )}
          size="small"
          dot
        >
          <Icon component={mdiMyShifts} />
        </Badge>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      icon: <Icon component={mdiNotes} />,
    },
    {
      key: "tasks",
      label: "Tasks",
      icon: <Icon component={mdiTasks} />,
    },
    {
      key: "files",
      label: "Files",
      icon: <Icon component={mdiFiles} />,
    },
    {
      key: "checklist",
      label: "Daily Checklists",
      icon: <Icon component={mdiChecklist} />,
    },
  ];

  if (
    !locationAccessKey ||
    locationAccessKey.locId !== locationId ||
    !location
  ) {
    // If the locationKey is not set or the locationId does not match the one in the url, redirect to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <DarkPageHeader
        onBack={() => navigate("/dashboard", { replace: true })}
        backIcon={<SwapOutlined />}
        title={location.name}
        subTitle={t(roleToString(locationAccessKey.role))}
        extra={[
          <Badge
            key="conversations"
            count={notifications?.getAllConversationBadges(
              location.organizationId,
              locationId
            )}
            size="small"
            offset={[-20, 5]}
          >
            <Button
              icon={<Icon component={Forum} />}
              type={
                pathname.split("/")[4] === "conversations" ? "primary" : "text"
              }
              shape="circle"
              onClick={() => navigate("conversations", { replace: true })}
            />
          </Badge>,

          <Badge
            key="directMessages"
            count={notifications?.allDMBadges}
            size="small"
            offset={[-20, 5]}
          >
            <Button
              icon={<Icon component={MessageTextLock} />}
              type={pathname.split("/")[4] === "chats" ? "primary" : "text"}
              shape="circle"
              onClick={() => navigate("chats", { replace: true })}
            />
          </Badge>,
          <Button
            hidden={locationAccessKey.role > RoleAccessLevels.GENERAL_MANAGER}
            icon={<SettingFilled />}
            key="locSettings"
            type={pathname.split("/")[4] === "locSettings" ? "primary" : "text"}
            shape="circle"
            onClick={() => navigate("locSettings", { replace: true })}
            className="settings-btn"
            css={{ marginRight: 15 }}
          />,
          <UserMenu key="userMenu" />,
        ]}
      />

      <Layout hasSider>
        <Layout.Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          css={{ height: "100%", backgroundColor: "#121432 !important" }}
        >
          <Menu
            mode="inline"
            items={
              locationAccessKey.role <= RoleAccessLevels.MANAGER
                ? [...AdminItems, ...NavItems]
                : NavItems
            }
            onSelect={({ key }) => {
              navigate(key, { replace: true });
            }}
            selectedKeys={[pathname.split("/")[4]]}
            theme="dark"
            css={{ backgroundColor: "#121432" }}
          />
        </Layout.Sider>
        <Layout.Content css={{ display: "flex" }}>
          <Routes>
            {locationAccessKey.role <= 3 && [
              <Route
                path={`home`}
                key="home"
                element={
                  <Suspense fallback={<PageLoading />}>
                    <AppsView />
                  </Suspense>
                }
              />,
              <Route
                key="emp"
                path={`employees/*`}
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Employees />
                  </Suspense>
                }
              />,
              <Route
                key="sch"
                path={`schedule/*`}
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Schedule />
                  </Suspense>
                }
              />,
              <Route
                key="uts"
                path={`utensils/*`}
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Utensils />
                  </Suspense>
                }
              />,
            ]}

            <Route
              path={`my-shifts/*`}
              element={
                <Suspense fallback={<PageLoading />}>
                  <Shifts />
                </Suspense>
              }
            />
            <Route
              path={`notes/*`}
              element={
                <Suspense fallback={<PageLoading />}>
                  <Notes />
                </Suspense>
              }
            />
            <Route
              path={`tasks/*`}
              element={
                <Suspense fallback={<PageLoading />}>
                  <Tasks />
                </Suspense>
              }
            />
            <Route
              path={`files/*`}
              element={
                <Suspense fallback={<PageLoading />}>
                  <Storage />
                </Suspense>
              }
            />
            <Route
              path={`checklist/*`}
              element={
                <Suspense fallback={<PageLoading />}>
                  <GlobalChecklist />
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
              path={`chats/*`}
              element={
                <Suspense fallback={<PageLoading />}>
                  <DM />
                </Suspense>
              }
            />
            {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
              <Route
                path={`locSettings/*`}
                element={
                  <Suspense fallback={<PageLoading />}>
                    <Settings />
                  </Suspense>
                }
              />
            )}
            <Route
              path="*"
              element={
                <Navigate
                  to={
                    locationAccessKey.role <= RoleAccessLevels.MANAGER
                      ? "home"
                      : "my-shifts"
                  }
                />
              }
            />
          </Routes>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};
