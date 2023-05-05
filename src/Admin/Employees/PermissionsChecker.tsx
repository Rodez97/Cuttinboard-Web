/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ManagerPermissions } from "@cuttinboard-solutions/types-helpers";
import { useTranslation } from "react-i18next";
import { Checkbox, Space, Typography } from "antd";

interface PermissionsCheckerProps {
  value?: ManagerPermissions;
  onChange?: (permissions: ManagerPermissions) => void;
}

const PermissionsChecker = ({ value, onChange }: PermissionsCheckerProps) => {
  const { t } = useTranslation();
  const handleChange =
    (permission: keyof ManagerPermissions, newValue: boolean) => () => {
      onChange?.({ ...value, [permission]: newValue });
    };

  return (
    <Space direction="vertical">
      <Typography.Text>{t("MANAGER_PERMISSIONS")}</Typography.Text>

      <Checkbox
        onChange={handleChange("canManageStaff", !value?.canManageStaff)}
        checked={value?.canManageStaff}
      >
        {t("MANAGE_STAFF")}
      </Checkbox>
      {value?.canManageStaff && (
        <Checkbox
          checked={value?.canManageStaffDocuments}
          css={{
            marginLeft: 20,
          }}
          onChange={handleChange(
            "canManageStaffDocuments",
            !value?.canManageStaffDocuments
          )}
        >
          {t("MANAGE_STAFF_DOCUMENTS")}
        </Checkbox>
      )}

      <Checkbox
        checked={value?.canManageSchedule}
        onChange={handleChange("canManageSchedule", !value?.canManageSchedule)}
      >
        {t("MANAGE_SCHEDULE")}
      </Checkbox>

      {value?.canManageSchedule && (
        <Checkbox
          checked={value?.canSeeWages}
          css={{
            marginLeft: 20,
          }}
          onChange={handleChange("canSeeWages", !value?.canSeeWages)}
        >
          {t("SEE_WAGES")}
        </Checkbox>
      )}
    </Space>
  );
};

export default PermissionsChecker;
