import { Select } from "antd";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { label: "Español", flag: "es", value: "es" },
  { label: "English", flag: "gb", value: "en" },
];

function LangSelect() {
  const { i18n, t } = useTranslation();
  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
    dayjs.locale(value);
  };

  return (
    <Select
      defaultValue={i18n.language}
      style={{ margin: 50, width: 150 }}
      options={languages}
      onChange={handleChange}
      id="lang-select"
    />
  );
}

export default LangSelect;
