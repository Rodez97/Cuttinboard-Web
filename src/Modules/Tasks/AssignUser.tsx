/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useCuttinboardModule,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { PrivacyLevel } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { ModalProps } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SelectEmployee from "../../components/ManageApp/SelectEmployee";

type AssignUserProps = {
  onSelectedEmployee: (employee: Employee) => void;
} & ModalProps;

function AssignUser({ onSelectedEmployee, ...props }: AssignUserProps) {
  const navigate = useNavigate();
  const { getEmployees } = useEmployeesList();
  const { t } = useTranslation();
  const { selectedApp } = useCuttinboardModule();

  const employees = useMemo(
    () =>
      selectedApp.privacyLevel === PrivacyLevel.PRIVATE
        ? getEmployees?.filter((e) => selectedApp.accessTags?.includes(e.id))
        : selectedApp.privacyLevel === PrivacyLevel.POSITIONS
        ? getEmployees?.filter((e) => e.hasAnyPosition(selectedApp.accessTags))
        : getEmployees,
    [getEmployees]
  );

  const handleSelectEmployee = (emp: Employee) => {
    onSelectedEmployee(emp);
  };

  return (
    <SelectEmployee
      onSelectedEmployee={handleSelectEmployee}
      employees={employees}
      footer={null}
      title={t("Assign tasks")}
      {...props}
    />
  );
}

export default AssignUser;
