import { SettingOutlined } from "@ant-design/icons";
import {
  useDisclose,
  useLocationPermissions,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Button } from "antd/es";
import React, { lazy } from "react";
import { useTranslation } from "react-i18next";

const ScheduleSettings = lazy(() => import("../Settings/ScheduleSettings"));

function ScheduleSettingsBtn() {
  const { t } = useTranslation();
  const checkPermission = useLocationPermissions();
  const [isSettingsOpen, openSettings, closeSettings] = useDisclose(false);

  return checkPermission("manageScheduleSettings") ? (
    <>
      <Button key="settings" icon={<SettingOutlined />} onClick={openSettings}>
        {t("Settings")}
      </Button>
      <ScheduleSettings open={isSettingsOpen} onClose={closeSettings} />
    </>
  ) : null;
}

export default ScheduleSettingsBtn;
