import { useTranslation } from "react-i18next";
import { Select } from "antd";
import React from "react";
import { POSITIONS } from "@cuttinboard-solutions/types-helpers";

export function PositionSelect({
  positions,
  onSelect,
}: {
  positions: string[] | undefined;
  onSelect: (value: string | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <Select
      showSearch
      style={{
        width: 200,
      }}
      onSelect={onSelect}
      onClear={() => onSelect(null)}
      placeholder={t("Filter by position")}
      allowClear
    >
      {positions && positions.length > 0 && (
        <Select.OptGroup label={t("Custom")}>
          {positions.map((pos) => (
            <Select.Option value={pos} key={pos}>
              {pos}
            </Select.Option>
          ))}
        </Select.OptGroup>
      )}

      <Select.OptGroup label={t("Default")}>
        {POSITIONS.map((pos) => (
          <Select.Option value={pos} key={pos}>
            {pos}
          </Select.Option>
        ))}
      </Select.OptGroup>
    </Select>
  );
}