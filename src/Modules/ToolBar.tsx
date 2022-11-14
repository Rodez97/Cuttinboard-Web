/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Input, Space } from "antd";
import { useTranslation } from "react-i18next";
import { SplitButton } from "../components";

interface ToolBarProps {
  index: number;
  order: "desc" | "asc";
  onChageOrder: (order: "asc" | "desc") => void;
  onChange: (index: number) => void;
  options: string[];
  searchQuery?: string;
  onChangeSearchQuery?: (sq: string) => void;
}

function ToolBar({
  index,
  order,
  onChageOrder,
  onChange,
  options,
  searchQuery,
  onChangeSearchQuery,
}: ToolBarProps) {
  const { t } = useTranslation();
  return (
    <Space
      css={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 5,
        borderBottom: "1px solid #00000025",
      }}
    >
      <SplitButton
        options={options}
        onChange={onChange}
        selectedIndex={index}
        order={order}
        onChageOrder={onChageOrder}
      />
      <Input.Search
        placeholder={t("Search")}
        value={searchQuery}
        onChange={(e) => onChangeSearchQuery(e.currentTarget.value)}
        css={{ width: 200 }}
      />
    </Space>
  );
}

export default ToolBar;
