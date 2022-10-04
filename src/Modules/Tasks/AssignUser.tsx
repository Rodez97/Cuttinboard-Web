/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useCuttinboardModule,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Colors,
  PrivacyLevel,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, List } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GrayPageHeader } from "components/PageHeaders";
import { TitleBoxGreen } from "theme/styledComponents";
import { ArrowRightOutlined } from "@ant-design/icons";
import { QuickUserDialogAvatar } from "components/QuickUserDialog";

interface AssignUserProps {
  onSelectedEmployee: (employee: Employee) => void;
}

function AssignUser({ onSelectedEmployee }: AssignUserProps) {
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
    navigate(-1);
  };

  return (
    <div>
      <GrayPageHeader onBack={() => navigate(-1)} title={t("Assign tasks")} />
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{
            minWidth: 300,
            maxWidth: 600,
            margin: "auto",
            width: "100%",
          }}
        >
          <TitleBoxGreen>{t("Location")}</TitleBoxGreen>
          <List
            dataSource={employees}
            renderItem={(emp) => {
              return (
                <List.Item
                  key={emp.id}
                  css={{
                    backgroundColor: Colors.MainOnWhite,
                    padding: 10,
                    margin: 5,
                  }}
                  extra={
                    <Button
                      type="link"
                      icon={<ArrowRightOutlined />}
                      onClick={() => handleSelectEmployee(emp)}
                    />
                  }
                >
                  <List.Item.Meta
                    avatar={<QuickUserDialogAvatar employee={emp} />}
                    title={`${emp.name} ${emp.lastName}`}
                    description={emp.email}
                  />
                </List.Item>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AssignUser;
