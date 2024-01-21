/** @jsx jsx */
import { jsx } from "@emotion/react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";
import { Badge, Button, Drawer, Layout, Menu, MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import Icon, { ArrowLeftOutlined } from "@ant-design/icons";
import {
  useCuttinboard,
  useCuttinboardLocation,
  useLocationPermissions,
  useNotifications,
} from "@rodez97/cuttinboard-library";
import { RoleAccessLevels, roleToString } from "@rodez97/types-helpers";
import { LoadingPage } from "./shared";
import { useMediaQuery } from "@react-hook/media-query";
import mdiMenu from "@mdi/svg/svg/menu.svg";
import mdiCloseDrawer from "@mdi/svg/svg/backburger.svg";
import { StyledContent } from "./Dashboard/Dashboard";

const Forum = lazy(() => import("@mdi/svg/svg/forum.svg"));
const mdiMessageCogOutline = lazy(() => import("@mdi/svg/svg/message-cog.svg"));
const MessageTextLock = lazy(
  () => import("@mdi/svg/svg/message-text-lock.svg")
);
const mdiChartBox = lazy(() => import("@mdi/svg/svg/chart-box.svg"));
const mdiMyShifts = lazy(() => import("@mdi/svg/svg/account-clock.svg"));
const mdiNotes = lazy(() => import("@mdi/svg/svg/note-multiple.svg"));
const mdiTasks = lazy(() => import("@mdi/svg/svg/checkbox-marked-circle.svg"));
const mdiFiles = lazy(() => import("@mdi/svg/svg/folder-home.svg"));
const mdiChecklist = lazy(() => import("@mdi/svg/svg/clipboard-list.svg"));
const mdiEmployees = lazy(() => import("@mdi/svg/svg/account-group.svg"));
const mdiSchedule = lazy(() => import("@mdi/svg/svg/store-clock.svg"));
const mdiUtensils = lazy(() => import("@mdi/svg/svg/blender.svg"));
const DM = lazy(() => import("./Chats/DirectMessages"));
const Conversations = lazy(() => import("./Chats/Conversations"));
const Tasks = lazy(() => import("./Modules/Tasks"));
const Notes = lazy(() => import("./Modules/Notes"));
const Shifts = lazy(() => import("./Modules/MyShifts"));
const Storage = lazy(() => import("./Modules/Files"));
const GlobalChecklist = lazy(() => import("./Modules/DailyChecklists"));
const ManageConversations = lazy(() => import("./Chats/ManageConversations"));
const Employees = lazy(() => import("./Admin/Employees"));
const Scheduler = lazy(() => import("./Admin/Scheduler"));
const Utensils = lazy(() => import("./Admin/Utensils"));
const Summary = lazy(() => import("./Modules/Summary"));
const DarkPageHeader = lazy(() =>
  import("./shared").then((module) => ({
    default: module.DarkPageHeader,
  }))
);
const UserMenu = lazy(() =>
  import("./shared").then((module) => ({
    default: module.UserMenu,
  }))
);

export default () => {
  const { pathname } = useRouterLocation();
  const { user } = useCuttinboard();
  const navigate = useNavigate();
  const { role, location, employees } = useCuttinboardLocation();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    getTotalBadgesForConversations,
    getTotalDMBadges,
    getTotalScheduleBadges,
  } = useNotifications();
  const checkPermission = useLocationPermissions();
  const matches = useMediaQuery("only screen and (max-width: 600px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    import("firebase/analytics").then(
      ({
        setAnalyticsCollectionEnabled,
        setUserId,
        setUserProperties,
        getAnalytics,
      }) => {
        const ANALYTICS = getAnalytics();

        setAnalyticsCollectionEnabled(ANALYTICS, true);
        setUserId(ANALYTICS, user.uid);
        setUserProperties(ANALYTICS, {
          email: user.email,
          username: user.displayName,
        });
      }
    );
  }, [user.displayName, user.email, user.uid]);

  const sidebarItems = useMemo(() => {
    const adminItems = [
      {
        key: "home",
        icon: <Icon component={mdiChartBox} className="sidebar-icon" />,
        label: t("Summary"),
      },
      {
        key: "divider",
        type: "divider",
        style: { borderColor: "#fbfbfa25", borderWidth: 0.2 },
      },
      checkPermission("manageStaff") && {
        key: "employees",
        label: t("Employees"),
        icon: <Icon component={mdiEmployees} className="sidebar-icon" />,
      },
      checkPermission("manageSchedule") && {
        key: "schedule",
        label: t("Schedule"),
        icon: <Icon component={mdiSchedule} className="sidebar-icon" />,
      },
      checkPermission("manageMessageBoard") && {
        key: "message-boards",
        label: t("Message Boards"),
        icon: (
          <Icon component={mdiMessageCogOutline} className="sidebar-icon" />
        ),
      },
      {
        key: "utensils",
        label: t("Utensils"),
        icon: <Icon component={mdiUtensils} className="sidebar-icon" />,
      },
      {
        key: "divider-2",
        type: "divider",
        style: { borderColor: "#fbfbfa25", borderWidth: 0.2 },
      },
    ].filter(Boolean) as MenuProps["items"];

    const navItems: MenuProps["items"] = [
      {
        key: "notes",
        label: t("Notes"),
        icon: <Icon component={mdiNotes} className="sidebar-icon" />,
      },
      {
        key: "tasks",
        label: t("Shift Tasks"),
        icon: <Icon component={mdiTasks} className="sidebar-icon" />,
      },
      {
        key: "files",
        label: t("Files"),
        icon: <Icon component={mdiFiles} className="sidebar-icon" />,
      },
      {
        key: "checklist",
        label: t("Daily Checklists"),
        icon: <Icon component={mdiChecklist} className="sidebar-icon" />,
      },
    ];

    return role <= RoleAccessLevels.MANAGER && adminItems
      ? [...adminItems, ...navItems]
      : navItems;
  }, [checkPermission, role, t]);

  return (
    <Layout>
      <DarkPageHeader
        onBack={() =>
          matches
            ? setDrawerOpen(true)
            : navigate("/dashboard", { replace: true })
        }
        backIcon={
          matches ? <Icon component={mdiMenu} /> : <ArrowLeftOutlined />
        }
        title={location.name}
        subTitle={!matches && t(roleToString(role))}
        extra={[
          <Badge
            key="my-shifts"
            count={getTotalScheduleBadges}
            size="small"
            offset={[-20, 5]}
          >
            <Button
              icon={<Icon component={mdiMyShifts} />}
              type={pathname.split("/")[2] === "my-shifts" ? "primary" : "text"}
              shape="circle"
              onClick={() => navigate("my-shifts", { replace: true })}
            />
          </Badge>,
          <Badge
            key="my-message-boards"
            count={getTotalBadgesForConversations}
            size="small"
            offset={[-20, 5]}
          >
            <Button
              icon={<Icon component={Forum} />}
              type={
                pathname.split("/")[2] === "my-message-boards"
                  ? "primary"
                  : "text"
              }
              shape="circle"
              onClick={() => navigate("my-message-boards", { replace: true })}
            />
          </Badge>,
          <Badge
            key="directMessages"
            count={getTotalDMBadges}
            size="small"
            offset={[-20, 5]}
          >
            <Button
              icon={<Icon component={MessageTextLock} />}
              type={pathname.split("/")[2] === "chats" ? "primary" : "text"}
              shape="circle"
              onClick={() => navigate("chats", { replace: true })}
            />
          </Badge>,
          <UserMenu key="userMenu" />,
        ]}
      />

      {matches && (
        <Drawer
          title={
            <span
              css={{
                color: "white",
              }}
            >
              {location.name}
            </span>
          }
          closeIcon={
            <Icon
              component={mdiCloseDrawer}
              css={{ color: "white", fontSize: 24 }}
            />
          }
          placement="left"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          css={{ backgroundColor: "#121432 !important" }}
          width={280}
        >
          <Menu
            mode="inline"
            items={sidebarItems}
            onSelect={({ key }) => {
              navigate(key, { replace: true });
              setDrawerOpen(false);
            }}
            selectedKeys={[pathname.split("/")[2]]}
            theme="dark"
            css={{ backgroundColor: "#121432" }}
          />
        </Drawer>
      )}

      <Layout hasSider>
        {!matches && (
          <Layout.Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            css={{ height: "100%", backgroundColor: "#121432 !important" }}
          >
            <Menu
              mode="inline"
              items={sidebarItems}
              onSelect={({ key }) => {
                navigate(key, { replace: true });
              }}
              selectedKeys={[pathname.split("/")[2]]}
              theme="dark"
              css={{ backgroundColor: "#121432" }}
            />
          </Layout.Sider>
        )}
        <StyledContent>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {role <= 3 && [
                <Route path={`home`} key="home" element={<Summary />} />,
                <Route
                  key="emp"
                  path={`employees/*`}
                  element={<Employees />}
                />,
                checkPermission("manageSchedule") && (
                  <Route
                    key="sch"
                    path={`schedule/*`}
                    element={<Scheduler />}
                  />
                ),
                checkPermission("manageMessageBoard") && (
                  <Route
                    key="mdg-conv"
                    path={`message-boards/*`}
                    element={<ManageConversations />}
                  />
                ),
                <Route key="uts" path={`utensils/*`} element={<Utensils />} />,
              ]}

              <Route
                path={`my-shifts`}
                element={<Shifts locationId={location.id} />}
              />
              <Route path={`notes/*`} element={<Notes />} />
              <Route path={`tasks/*`} element={<Tasks />} />
              <Route path={`files/*`} element={<Storage />} />
              <Route path={`checklist/*`} element={<GlobalChecklist />} />

              <Route path={`my-message-boards/*`} element={<Conversations />} />
              <Route path={`chats/*`} element={<DM employees={employees} />} />
              <Route
                path="*"
                element={
                  <Navigate
                    to={role <= RoleAccessLevels.MANAGER ? "home" : "my-shifts"}
                  />
                }
              />
            </Routes>
          </Suspense>
        </StyledContent>
      </Layout>
    </Layout>
  );
};
