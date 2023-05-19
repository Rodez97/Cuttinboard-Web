/** @jsx jsx */
import { jsx } from "@emotion/react";
import AllWhiteLogo from "../assets/images/allWhiteLogo.svg";
import { useMemo, useState } from "react";
import DashboardRouter from "./DashboardRouter";
import { Badge, Button, Layout, Menu, MenuProps, Tag } from "antd/es";
import { useDashboard } from "./DashboardProvider";
import {
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import Icon, { ClockCircleOutlined } from "@ant-design/icons";
import mdiMessageTextLock from "@mdi/svg/svg/message-text-lock.svg";
import { DarkPageHeader, OwnerGoldTag, UserMenu } from "../shared";
import relativeTime from "dayjs/plugin/relativeTime";
import mdiNotes from "@mdi/svg/svg/note-multiple.svg";
import mdiFiles from "@mdi/svg/svg/folder-home.svg";
import mdiMyShifts from "@mdi/svg/svg/account-clock.svg";
import mdiDashboard from "@mdi/svg/svg/view-dashboard.svg";
import mdiPublic from "@mdi/svg/svg/earth.svg";
import mdiLocations from "@mdi/svg/svg/home-group.svg";
import mdiAccount from "@mdi/svg/svg/account-cog.svg";
import mdiMyDocuments from "@mdi/svg/svg/folder-account.svg";
import mdiBilling from "@mdi/svg/svg/account-credit-card.svg";
import Forum from "@mdi/svg/svg/forum.svg";
import {
  useCuttinboard,
  useNotifications,
} from "@cuttinboard-solutions/cuttinboard-library";
import VerifyEmailBanner from "../shared/organisms/VerifyEmailBanner";
import i18next from "../i18n";
dayjs.extend(relativeTime);

const { Content, Sider } = Layout;

const StyledContent = styled(Content)`
  min-width: 300px;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const OptionsRoutes: MenuProps["items"] = [
  {
    label: i18next.t("Locations") as string,
    key: "locations",
    icon: <Icon component={mdiLocations} className="sidebar-icon" />,
  },
  {
    label: i18next.t("Account") as string,
    key: "account",
    icon: <Icon component={mdiAccount} className="sidebar-icon" />,
  },
  {
    label: i18next.t("My Documents") as string,
    key: "my-documents",
    icon: <Icon component={mdiMyDocuments} className="sidebar-icon" />,
  },
];

const OwnerRoute = {
  label: i18next.t("Owner Portal") as string,
  key: "owner-portal",
  icon: <Icon component={mdiDashboard} className="sidebar-icon" />,
};

const GlobalBoardRoute = {
  label: i18next.t("Global Boards") as string,
  key: "global-boards",
  icon: <Icon component={mdiPublic} className="sidebar-icon" />,
  children: [
    {
      label: i18next.t("Global Notes") as string,
      key: "global-notes",
      icon: <Icon component={mdiNotes} className="sidebar-icon" />,
    },
    {
      label: i18next.t("Global Files") as string,
      key: "global-files",
      icon: <Icon component={mdiFiles} className="sidebar-icon" />,
    },
  ],
};

const BillingRoute = {
  label: i18next.t("Manage Billing") as string,
  key: "subscription",
  icon: <Icon component={mdiBilling} className="sidebar-icon" />,
};

export default () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { pathname } = useRouterLocation();
  const { userDocument, subscriptionDocument, organization } = useDashboard();
  const {
    getTotalDMBadges,
    getTotalBadgesForConversations,
    getTotalScheduleBadges,
  } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);

  const getTrialDays = useMemo(() => {
    if (!userDocument || !userDocument.subscriptionId) return;
    if (!subscriptionDocument) return;

    const trialEnd = dayjs(subscriptionDocument.trial_end?.toDate());

    if (trialEnd.isBefore(dayjs())) return;

    return dayjs().to(trialEnd, true);
  }, [userDocument, subscriptionDocument]);

  const routes = useMemo(() => {
    if (!userDocument?.subscriptionId) {
      return OptionsRoutes;
    }
    const fullRoutes = [OwnerRoute];
    if (organization?.hadMultipleLocations) {
      fullRoutes.push(GlobalBoardRoute);
    }
    return [...fullRoutes, ...OptionsRoutes, BillingRoute];
  }, [organization?.hadMultipleLocations, userDocument?.subscriptionId]);

  return (
    <Layout>
      {!user.emailVerified && <VerifyEmailBanner />}
      <DarkPageHeader
        title={
          <AllWhiteLogo
            width={150}
            css={{
              display: "flex",
            }}
          />
        }
        subTitle={
          Boolean(userDocument?.subscriptionId) && (
            <OwnerGoldTag>OWNER</OwnerGoldTag>
          )
        }
        tags={
          getTrialDays
            ? [
                <Tag key="trial" icon={<ClockCircleOutlined />} color="volcano">
                  {t("Trial ends in {{0}}", {
                    0: getTrialDays,
                  })}
                </Tag>,
              ]
            : undefined
        }
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
              onClick={() => navigate("my-shifts")}
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
                pathname.split("/")[2] === "conversations" ? "primary" : "text"
              }
              shape="circle"
              onClick={() => navigate("conversations")}
            />
          </Badge>,
          <Badge
            key="directMessages"
            count={getTotalDMBadges}
            size="small"
            offset={[-20, 5]}
          >
            <Button
              icon={<Icon component={mdiMessageTextLock} />}
              type={
                pathname.split("/")[2] === "directMessages" ? "primary" : "text"
              }
              shape="circle"
              onClick={() => navigate("directMessages")}
              css={{ marginRight: 15 }}
            />
          </Badge>,

          <UserMenu key="userMenu" />,
        ]}
      />
      <Layout hasSider>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          css={{ height: "100%", backgroundColor: "#121432 !important" }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname.split("/")[2]]}
            items={routes}
            onSelect={({ key }) => navigate(key, { replace: true })}
            css={{ backgroundColor: "#121432" }}
          />
        </Sider>
        <StyledContent>
          <DashboardRouter />
        </StyledContent>
      </Layout>
    </Layout>
  );
};
