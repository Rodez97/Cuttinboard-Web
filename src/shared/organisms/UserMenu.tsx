/** @jsx jsx */
import { jsx } from "@emotion/react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, MenuProps, Modal, Space } from "antd";
import { signOut } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  AUTH,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import androidStore from "../../assets/images/android-store.png";
import appleStore from "../../assets/images/apple-store.png";
import CuttinboardAvatar from "../atoms/Avatar";
import mdiDashboard from "@mdi/svg/svg/view-dashboard-outline.svg";
import mdiAccount from "@mdi/svg/svg/account-cog-outline.svg";
import mdiHelp from "@mdi/svg/svg/help-circle-outline.svg";
import mdiMobile from "@mdi/svg/svg/tablet-cellphone.svg";
import mdiLogout from "@mdi/svg/svg/logout.svg";
import Icon from "@ant-design/icons";

function UserMenu({ color }: { color?: string }) {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const navigate = useNavigate();

  const showMobileAppDialog = () => {
    Modal.info({
      title: t("Download the Cuttinboard Mobile App"),
      content: (
        <Space direction="horizontal">
          <a
            href="https://play.google.com/store/apps/details?id=com.cuttinboard.tools"
            target="_blank"
            rel="noreferrer"
          >
            <img height={50} src={androidStore} />
          </a>
          <a
            href="https://apps.apple.com/us/app/cuttinboard/id1609517565"
            target="_blank"
            rel="noreferrer"
          >
            <img height={50} src={appleStore} />
          </a>
        </Space>
      ),
      okText: t("Ok"),
    });
  };

  const onClick: MenuProps["onClick"] = async ({ key }) => {
    switch (key) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "account":
        navigate("/dashboard/account");
        break;
      case "helpCenter":
        window.open("https://www.cuttinboard.com/help-center", "_blank");
        break;
      case "signOut":
        await signOut(AUTH);
        navigate("/login");
        break;
      case "mobile-app":
        showMobileAppDialog();
        break;

      default:
        break;
    }
  };

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "email",
            label: user.email,
            disabled: true,
          },
          {
            key: "dashboard",
            label: t("Dashboard"),
            icon: <Icon component={mdiDashboard} className="user-menu-icon" />,
          },
          {
            key: "account",
            label: t("Account"),
            icon: <Icon component={mdiAccount} className="user-menu-icon" />,
          },
          {
            key: "helpCenter",
            label: t("Help Center"),
            icon: <Icon component={mdiHelp} className="user-menu-icon" />,
          },
          {
            key: "mobile-app",
            label: t("Mobile App"),
            icon: <Icon component={mdiMobile} className="user-menu-icon" />,
          },
          {
            key: "signOut",
            label: t("Sign Out"),
            icon: <Icon component={mdiLogout} className="user-menu-icon" />,
          },
        ],
        onClick,
      }}
      trigger={["click"]}
    >
      <div
        css={{
          cursor: "pointer",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        <CuttinboardAvatar
          src={user.photoURL ?? undefined}
          alt={user.displayName ?? undefined}
        />
        <DownOutlined css={{ fontSize: 14, color: color ?? "#fff" }} />
      </div>
    </Dropdown>
  );
}

export default UserMenu;
