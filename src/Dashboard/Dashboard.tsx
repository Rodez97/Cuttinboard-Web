/** @jsx jsx */
import { jsx } from "@emotion/react";
import AllWhiteLogo from "../assets/images/allWhiteLogo.svg";
import { useMemo } from "react";
import DashboardRouter from "./DashboardRouter";
import { Badge, Button, Layout, Menu, MenuProps, Typography } from "antd";
import { useDashboard } from "./DashboardProvider";
import {
  useNavigate,
  useLocation as useRouterLocation,
  Routes,
  Route,
} from "react-router-dom";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import Icon, {
  CreditCardOutlined,
  DashboardOutlined,
  FolderOpenOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import mdiMessageTextLock from "@mdi/svg/svg/message-text-lock.svg";
import { useNotificationsBadges } from "@cuttinboard-solutions/cuttinboard-library/services";
import DM from "../pages/DirectMessages/DM";
import {
  DarkPageHeader,
  NormalContainer,
  OwnerGoldContainer,
  UserMenu,
} from "../components";

const { Content, Footer, Sider } = Layout;

const StyledContent = styled(Content)`
  min-width: 300px;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pathname } = useRouterLocation();
  const { userDocument, subscriptionDocument } = useDashboard();
  const { getDMBadges } = useNotificationsBadges();

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
        title={<AllWhiteLogo width={150} />}
        extra={[
          <Badge
            key="directMessages"
            count={getDMBadges}
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
      <Routes>
        <Route path="directMessages/*" element={<DM />} />
        <Route
          path="/*"
          element={
            <Layout hasSider>
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
                            {t("Trial ends in {{0}} day(s)", {
                              0: getTrialDays,
                            })}
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
          }
        />
      </Routes>
    </Layout>
  );
}

export default Dashboard;
