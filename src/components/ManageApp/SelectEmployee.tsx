/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Colors,
  Employee,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Button, List } from "antd";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TitleBoxBlue, TitleBoxGreen } from "../../theme/styledComponents";
import { QuickUserDialogAvatar } from "../QuickUserDialog";
import { ArrowRightOutlined } from "@ant-design/icons";

interface AddMembersProps {
  onSelectedEmployee: (employee: Employee) => void;
}

function SelectEmployee({ onSelectedEmployee }: AddMembersProps) {
  const { t } = useTranslation();
  const { getEmployees, getOrgEmployees } = useEmployeesList();

  const getUniqEmployees = useMemo(
    () =>
      getEmployees.filter(
        (emp) => !getOrgEmployees?.some((oe) => oe.id === emp.id)
      ),
    [getEmployees, getOrgEmployees]
  );

  return (
    <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
      <div
        css={{
          minWidth: 300,
          maxWidth: 600,
          margin: "auto",
          width: "100%",
        }}
      >
        {Boolean(getOrgEmployees?.length) && (
          <React.Fragment>
            <TitleBoxBlue>{t("Organization")}</TitleBoxBlue>
            <List
              dataSource={getOrgEmployees}
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
                        onClick={() => onSelectedEmployee(emp)}
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
          </React.Fragment>
        )}

        <TitleBoxGreen>{t("Location")}</TitleBoxGreen>
        <List
          dataSource={getUniqEmployees}
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
                    onClick={() => onSelectedEmployee(emp)}
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
  );
}

export default SelectEmployee;
