/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  DashboardOutlined,
  DownOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library";
import { Avatar, Dropdown, Menu, MenuProps } from "antd";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function UserMenu({ color }: { color?: string }) {
  const { t } = useTranslation();
  const [user] = useAuthState(Auth);
  const navigate = useNavigate();

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
        await signOut(Auth);
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
            label: Auth.currentUser.email,
            disabled: true,
          },
          {
            key: "dashboard",
            label: t("Dashboard"),
            icon: <DashboardOutlined />,
          },
          {
            key: "account",
            label: t("Account"),
            icon: <UserOutlined />,
          },
          {
            key: "helpCenter",
            label: t("Help Center"),
            icon: <QuestionCircleOutlined />,
          },
          {
            key: "signOut",
            label: t("Sign Out"),
            icon: <LogoutOutlined />,
          },
        ],
        onClick,
      }}
      trigger={["click"]}
    >
      <div css={{ cursor: "pointer" }}>
        <Avatar
          src={user.photoURL ?? undefined}
          alt={user.displayName}
          icon={<UserOutlined />}
        />
        <DownOutlined style={{ fontSize: 14, color: color ?? "#fff" }} />
      </div>
    </Dropdown>
  );
}

export default UserMenu;
