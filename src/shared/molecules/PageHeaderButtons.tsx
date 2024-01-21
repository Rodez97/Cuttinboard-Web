/** @jsx jsx */
import { MoreOutlined } from "@ant-design/icons";
import { jsx } from "@emotion/react";
import { useMediaQuery } from "@react-hook/media-query";
import { Button, Dropdown, MenuProps, Tooltip } from "antd";
import { BaseButtonProps } from "antd/es/button/button";
import React from "react";

type ItemProps = {
  tooltip?: string;
  hidden?: boolean;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  key: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: BaseButtonProps["type"];
  loading?: boolean;
}[];

function PageHeaderButtons({
  items,
  mediaQuery,
}: {
  items: ItemProps;
  mediaQuery?: string;
}) {
  const matches = useMediaQuery(
    mediaQuery ?? "only screen and (max-width: 992px)"
  );

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const { key } = e;
    const item = items.find((item) => item.key === key);
    if (item && item.onClick) {
      item.onClick(e as any);
    }
  };

  const getMenuItem = (
    item: ItemProps[0]
  ): NonNullable<MenuProps["items"]>[0] => {
    const { tooltip, hidden, icon, disabled, label, key, loading, danger } =
      item;
    if (hidden) return null;
    return {
      key,
      icon,
      disabled: disabled || loading,
      label: tooltip ? <Tooltip title={tooltip}>{label}</Tooltip> : label,
      danger,
    };
  };

  const getButtonItem = (item: ItemProps[0]) => {
    const {
      tooltip,
      hidden,
      icon,
      onClick,
      disabled,
      label,
      key,
      type,
      loading,
    } = item;
    if (hidden) return null;

    if (tooltip) {
      return (
        <Tooltip key={key} title={tooltip}>
          <Button
            icon={icon}
            onClick={onClick}
            type={type}
            disabled={disabled}
            loading={loading}
            danger={item.danger}
          >
            {label}
          </Button>
        </Tooltip>
      );
    } else {
      return (
        <Button
          key={key}
          icon={icon}
          onClick={onClick}
          type={type}
          loading={loading}
          danger={item.danger}
        >
          {label}
        </Button>
      );
    }
  };
  return (
    <React.Fragment>
      {matches ? (
        <Dropdown
          menu={{
            items: items.map(getMenuItem),
            onClick: handleMenuClick,
          }}
        >
          <Button>
            <MoreOutlined />
          </Button>
        </Dropdown>
      ) : (
        <div
          css={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {items.map(getButtonItem)}
        </div>
      )}
    </React.Fragment>
  );
}

export default PageHeaderButtons;
