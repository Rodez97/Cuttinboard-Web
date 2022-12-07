import * as React from "react";
import { Dropdown } from "antd";
import {
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";

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
  const handleClick = () => {
    onChangeOrder(order === "asc" ? "desc" : "asc");
  };

  return (
    <React.Fragment>
      <Dropdown.Button
        onClick={handleClick}
        menu={{
          items: options.map((opt, i) => ({
            label: opt,
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
          React.cloneElement(leftButton as React.ReactElement<any, string>, {
            icon:
              order === "asc" ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              ),
          }),
          React.cloneElement(rightButton as React.ReactElement<any, string>, {
            icon: <FilterOutlined />,
          }),
        ]}
      >
        {options[selectedIndex]}
      </Dropdown.Button>
    </React.Fragment>
  );
}
