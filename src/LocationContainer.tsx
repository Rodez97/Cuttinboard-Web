/** @jsx jsx */
import { jsx } from "@emotion/react";
import { lazy, Suspense, useMemo, useState } from "react";
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
import Icon, { ArrowLeftOutlined } from "@ant-design/icons";
import Forum from "@mdi/svg/svg/forum.svg";
import mdiMessageCogOutline from "@mdi/svg/svg/message-cog-outline.svg";
import MessageTextLock from "@mdi/svg/svg/message-text-lock.svg";
import { DarkPageHeader, LoadingPage, UserMenu } from "./shared";
import mdiViewDashboard from "@mdi/svg/svg/view-dashboard.svg";
import mdiMyShifts from "@mdi/svg/svg/account-clock.svg";
import mdiNotes from "@mdi/svg/svg/note-multiple-outline.svg";
import mdiTasks from "@mdi/svg/svg/checkbox-marked-circle-plus-outline.svg";
import mdiFiles from "@mdi/svg/svg/folder-home-outline.svg";
import mdiChecklist from "@mdi/svg/svg/clipboard-list-outline.svg";
import mdiEmployees from "@mdi/svg/svg/account-group-outline.svg";
import mdiSchedule from "@mdi/svg/svg/store-clock-outline.svg";
import mdiUtensils from "@mdi/svg/svg/silverware-fork-knife.svg";
import {
  useCuttinboard,
  useCuttinboardLocation,
  useNotifications,
} from "@cuttinboard-solutions/cuttinboard-library";
import {
  RoleAccessLevels,
  roleToString,
} from "@cuttinboard-solutions/types-helpers";

const DM = lazy(() => import("./Chats/DirectMessages"));
const Conversations = lazy(() => import("./Chats/Conversations"));
const Tasks = lazy(() => import("./Modules/Tasks"));
const Notes = lazy(() => import("./Modules/Notes"));
const Shifts = lazy(() => import("./Modules/MyShifts"));
const Storage = lazy(() => import("./Modules/Files"));
const GlobalChecklist = lazy(() => import("./Modules/GlobalChecklist"));
const ManageConversations = lazy(() => import("./Chats/ManageConversations"));
const Employees = lazy(() => import("./Admin/Employees"));
const Scheduler = lazy(() => import("./Admin/Scheduler"));
const Utensils = lazy(() => import("./Admin/Utensils"));
const Summary = lazy(() => import("./Modules/Summary"));

export default () => {
  const { locationId } = useParams();
  if (!locationId) {
    throw new Error("No locationId found");
  }
  const { pathname } = useRouterLocation();
  const navigate = useNavigate();
  const { role, location } = useCuttinboardLocation();
  const { organizationKey } = useCuttinboard();
  if (!organizationKey || !location) {
    throw new Error("No organization key found");
  }
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    getTotalBadgesForConversations,
    getTotalDMBadges,
    getTotalScheduleBadges,
  } = useNotifications();

  const sidebarItems = useMemo(() => {
    const adminItems: MenuProps["items"] = [
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
        label: t("Employees"),
        icon: <Icon component={mdiEmployees} />,
      },
      {
        key: "schedule",
        label: t("Schedule"),
        icon: <Icon component={mdiSchedule} />,
      },
      {
        key: "manage-conversations",
        label: t("Conversations"),
        icon: <Icon component={mdiMessageCogOutline} />,
      },
      {
        key: "utensils",
        label: t("Utensils"),
        icon: <Icon component={mdiUtensils} />,
      },
      {
        key: "divider-2",
        type: "divider",
        style: { borderColor: "#fbfbfa25", borderWidth: 0.2 },
      },
    ];

    const navItems: MenuProps["items"] = [
      {
        key: "notes",
        label: t("Notes"),
        icon: <Icon component={mdiNotes} />,
      },
      {
        key: "tasks",
        label: t("Tasks"),
        icon: <Icon component={mdiTasks} />,
      },
      {
        key: "files",
        label: t("Files"),
        icon: <Icon component={mdiFiles} />,
      },
      {
        key: "checklist",
        label: t("Daily Checklists"),
        icon: <Icon component={mdiChecklist} />,
      },
    ];

    return role <= RoleAccessLevels.MANAGER
      ? [...adminItems, ...navItems]
      : navItems;
  }, [role, t]);

  return (
    <Layout>
      <DarkPageHeader
        onBack={() => navigate("/dashboard", { replace: true })}
        backIcon={<ArrowLeftOutlined />}
        title={location.name}
        subTitle={t(roleToString(role))}
        extra={[
          <Badge
            key="my-shifts"
            count={getTotalScheduleBadges}
            size="small"
            offset={[-20, 5]}
          >
            <Button
              icon={<Icon component={mdiMyShifts} />}
              type={pathname.split("/")[4] === "my-shifts" ? "primary" : "text"}
              shape="circle"
              onClick={() => navigate("my-shifts", { replace: true })}
            />
          </Badge>,
          <Badge
            key="conversations"
            count={getTotalBadgesForConversations}
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
            count={getTotalDMBadges}
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
            items={sidebarItems}
            onSelect={({ key }) => {
              navigate(key, { replace: true });
            }}
            selectedKeys={[pathname.split("/")[4]]}
            theme="dark"
            css={{ backgroundColor: "#121432" }}
          />
        </Layout.Sider>
        <Layout.Content css={{ display: "flex" }}>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {role <= 3 && [
                <Route path={`home`} key="home" element={<Summary />} />,
                <Route
                  key="emp"
                  path={`employees/*`}
                  element={<Employees />}
                />,
                <Route key="sch" path={`schedule/*`} element={<Scheduler />} />,
                <Route key="uts" path={`utensils/*`} element={<Utensils />} />,
                <Route
                  key="mdg-conv"
                  path={`manage-conversations/*`}
                  element={<ManageConversations />}
                />,
              ]}

              <Route
                path={`my-shifts`}
                element={<Shifts locationId={locationId} />}
              />
              <Route path={`notes/*`} element={<Notes />} />
              <Route path={`tasks/*`} element={<Tasks />} />
              <Route path={`files/*`} element={<Storage />} />
              <Route path={`checklist/*`} element={<GlobalChecklist />} />

              <Route path={`conversations/*`} element={<Conversations />} />
              <Route path={`chats/*`} element={<DM />} />
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
        </Layout.Content>
      </Layout>
    </Layout>
  );
};
