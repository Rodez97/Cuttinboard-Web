/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  DashboardOutlined,
  DownOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, MenuProps } from "antd";
import { signOut } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { AUTH } from "@cuttinboard-solutions/cuttinboard-library/utils";

function UserMenu({ color }: { color?: string }) {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
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
        await signOut(AUTH);
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
            key: "trans",
            label: t("Translations"),
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
      <div
        css={{
          cursor: "pointer",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        <Avatar
          src={user.photoURL ?? undefined}
          alt={user.displayName ?? ""}
          icon={<UserOutlined />}
        />
        <DownOutlined style={{ fontSize: 14, color: color ?? "#fff" }} />
      </div>
    </Dropdown>
  );
}

export default UserMenu;
