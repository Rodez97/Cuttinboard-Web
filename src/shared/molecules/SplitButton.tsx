import * as React from "react";
import { Dropdown } from "antd/es";
import {
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface SplitButtonProps {
  options: string[];
  order: "asc" | "desc";
  onChange: (index: number) => void;
  selectedIndex: number;
  onChangeOrder: (order: "asc" | "desc") => void;
}

export default function SplitButton({
  options,
  onChange,
  selectedIndex,
  onChangeOrder,
  order = "asc",
}: SplitButtonProps) {
  const { t } = useTranslation();
  const handleClick = () => {
    onChangeOrder(order === "asc" ? "desc" : "asc");
  };

  return (
    <React.Fragment>
      <Dropdown.Button
        onClick={handleClick}
        menu={{
          items: options.map((opt, i) => ({
            label: t(opt),
            key: i,
            onClick: () => onChange(i),
          })),
        }}
        icon={
          order === "asc" ? (
            <SortAscendingOutlined />
          ) : (
            <SortDescendingOutlined />
          )
        }
        buttonsRender={([leftButton, rightButton]) => [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          React.cloneElement(leftButton as React.ReactElement<any, string>, {
            icon:
              order === "asc" ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              ),
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          React.cloneElement(rightButton as React.ReactElement<any, string>, {
            icon: <FilterOutlined />,
          }),
        ]}
      >
        {t(options[selectedIndex])}
      </Dropdown.Button>
    </React.Fragment>
  );
}
