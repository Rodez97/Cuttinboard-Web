/** @jsx jsx */
import { jsx } from "@emotion/react";
import AllWhiteLogo from "assets/images/allWhiteLogo.svg";
import { useMemo } from "react";
import UserMenu from "../components/UserMenu";
import DashboardRouter from "./DashboardRouter";
import { Layout, Menu, MenuProps, Typography } from "antd";
import { useDashboard } from "./DashboardProvider";
import {
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  CreditCardOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  NormalContainer,
  OwnerGoldContainer,
} from "../components/BusinessPaper";
import { DarkPageHeader } from "../components/PageHeaders";

const { Header, Content, Footer, Sider } = Layout;

const StyledContent = styled(Content)`
  min-width: 300px;
  overflow: auto;
`;

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pathname } = useRouterLocation();
  const { userDocument, subscriptionDocument } = useDashboard();

  const getTrialDays = useMemo(
    () =>
      Boolean(userDocument?.subscriptionId) &&
      subscriptionDocument?.status === "trialing" &&
      Math.abs(dayjs().diff(subscriptionDocument?.trial_end?.toDate(), "days")),
    [userDocument, subscriptionDocument]
  );

  const menuElements = () => {
    const optionsRoutes: MenuProps["items"] = [
      {
        label: "Locations",
        key: "locations",
        icon: <ShopOutlined />,
      },
      {
        label: "Account",
        key: "account",
        icon: <UserOutlined />,
      },
      {
        label: "My Documents",
        key: "my-documents",
        icon: <FolderOpenOutlined />,
      },
    ];
    const OwnerRoute = {
      label: "Owner Portal",
      key: "owner-portal",
      icon: <DashboardOutlined />,
    };

    const BillingRoute = {
      label: "Manage Billing",
      key: "subscription",
      icon: <CreditCardOutlined />,
    };
    if (Boolean(userDocument?.subscriptionId)) {
      optionsRoutes.splice(0, 0, OwnerRoute);
      optionsRoutes.push(BillingRoute);
    }
    return optionsRoutes;
  };

  return (
    <Layout>
      <DarkPageHeader
        className="site-page-header"
        title={<AllWhiteLogo width={150} />}
        extra={[<UserMenu key="userMenu" />]}
      />
      <Layout>
        <Sider width={250} breakpoint="lg" collapsedWidth="0">
          <Layout css={{ height: "100%" }}>
            <Content css={{ backgroundColor: "#121432" }}>
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[pathname.split("/")[2]]}
                items={menuElements()}
                onClick={(e) => navigate(e.key)}
              />
            </Content>

            <Footer
              css={{
                backgroundColor: "#121432",
                padding: "3px",
                justifyContent: "center",
                display: "flex",
              }}
            >
              {Boolean(userDocument?.subscriptionId) ? (
                <OwnerGoldContainer>
                  <AllWhiteLogo width={150} />
                  {getTrialDays && (
                    <Typography.Text css={{ color: "#fff" }}>
                      {t("Trial ends in {{0}} day(s)", { 0: getTrialDays })}
                    </Typography.Text>
                  )}
                </OwnerGoldContainer>
              ) : (
                <NormalContainer>
                  <AllWhiteLogo width={150} />
                </NormalContainer>
              )}
            </Footer>
          </Layout>
        </Sider>
        <StyledContent>
          <DashboardRouter />
        </StyledContent>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
