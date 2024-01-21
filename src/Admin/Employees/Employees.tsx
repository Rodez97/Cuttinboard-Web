/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import EmployeeCard from "./EmployeeCard";
import { Button, Divider, Input, Layout, List, Modal, Space } from "antd/es";
import {
  ExclamationCircleOutlined,
  TagOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import ManagePositions from "./ManagePositions";
import CreateEmployee from "./CreateEmployee";
import { GrayPageHeader } from "../../shared";
import { PositionSelect } from "../../shared/molecules/PositionSelect";
import {
  joinLocation,
  leaveLocation,
  useCuttinboard,
  useCuttinboardLocation,
  useDisclose,
  useEmployees,
} from "@rodez97/cuttinboard-library";
import {
  getLocationUsage,
  RoleAccessLevels,
  roleToString,
} from "@rodez97/types-helpers";
import EmptyExtended from "./../../shared/molecules/EmptyExtended";
import NoItems from "../../shared/atoms/NoItems";
import { logAnalyticsEvent } from "utils/analyticsHelpers";
import PageHeaderButtons from "../../shared/molecules/PageHeaderButtons";

function Employees() {
  const { location, role } = useCuttinboardLocation();
  const { getEmployeesByRole, employees } = useEmployees();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>("");
  const { user } = useCuttinboard();
  const [managePositionsOpen, setManagePositionsOpen] = useState(false);
  const [isCreateEmployeeOpen, openCreateEmployee, closeCreateEmployee] =
    useDisclose(false);
  const [joiningLocation, setJoiningLocation] = useState(false);

  const joinToLocation = async () => {
    if (usage.employeesCount === usage.employeesLimit) {
      Modal.warning({
        title: t("Limit Reached"),
        content: t(
          "You cannot join this location because it has reached its employee limit"
        ),
      });
      return;
    }

    try {
      setJoiningLocation(true);
      await joinLocation(location);

      logAnalyticsEvent(
        role === RoleAccessLevels.OWNER
          ? "owner_join_location"
          : "supervisor_join_location"
      );
    } catch (error) {
      recordError(error);

      if (
        error.message ===
        "You have reached the maximum number of employees for this location"
      ) {
        Modal.warning({
          title: t("Limit Reached"),
          content: t(
            "You cannot join this location because it has reached its employee limit"
          ),
        });
      }
    } finally {
      setJoiningLocation(false);
    }
  };

  const leaveFromLocation = () => {
    Modal.confirm({
      title: t("Are you sure you want to leave this location?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await leaveLocation(location);

          // Add a delay of 500ms to allow the data to be updated
          await new Promise((resolve) => setTimeout(resolve, 500));

          logAnalyticsEvent(
            role === RoleAccessLevels.OWNER
              ? "owner_leave_location"
              : "supervisor_leave_location"
          );
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  const usage = useMemo(() => getLocationUsage(location), [location]);

  const employeesByRole = useMemo(
    () => getEmployeesByRole(searchText, selectedTag),
    [getEmployeesByRole, searchText, selectedTag]
  );

  return (
    <Layout>
      <GrayPageHeader
        title={t("Employees")}
        subTitle={`${usage.employeesCount} / ${usage.employeesLimit}`}
        extra={
          <PageHeaderButtons
            items={[
              {
                key: "ManagePositions",
                icon: <TagOutlined />,
                onClick: () => setManagePositionsOpen(true),
                label: t("Manage Positions"),
                hidden: role >= RoleAccessLevels.MANAGER,
                type: "primary",
              },
              {
                key: "AddEmployee",
                icon: <UserAddOutlined />,
                onClick: openCreateEmployee,
                label: t("Add Employee"),
                disabled: usage.employeesCount === usage.employeesLimit,
                tooltip:
                  usage.employeesCount >= usage.employeesLimit
                    ? t("Limit Reached")
                    : undefined,
                type: "primary",
              },
            ]}
          />
        }
      />
      <Space
        align="center"
        wrap
        css={{ justifyContent: "space-evenly", padding: "10px 5px" }}
      >
        <Input.Search
          placeholder={t("Search")}
          allowClear
          onChange={({ currentTarget }) => setSearchText(currentTarget.value)}
          value={searchText}
          css={{ width: 200 }}
        />

        <PositionSelect
          onSelect={setSelectedTag}
          positions={location.settings?.positions}
        />
      </Space>
      <Layout.Content>
        <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
          <div
            css={{
              minWidth: 300,
              maxWidth: 800,
              margin: "auto",
              width: "100%",
            }}
          >
            <List>
              {role <= RoleAccessLevels.ADMIN &&
                !employees.some((e) => e.id === user.uid) && (
                  <Button
                    type="dashed"
                    onClick={joinToLocation}
                    block
                    loading={joiningLocation}
                  >
                    {t("Join this location")}
                  </Button>
                )}

              {role <= RoleAccessLevels.ADMIN &&
                employees.some((e) => e.id === user.uid) && (
                  <Button
                    type="dashed"
                    danger
                    onClick={leaveFromLocation}
                    block
                  >
                    {t("Leave this location")}
                  </Button>
                )}

              {employees.length === 0 ? (
                <EmptyExtended
                  descriptions={[
                    "Add employees",
                    "Manage employee wages, positions and roles",
                    "See employee contact information",
                    "Access employee documents",
                  ]}
                  description={
                    <span>
                      {t("No employees in this location")}
                      {". "}
                      <a onClick={openCreateEmployee}>{t("Add Employee")}</a>
                    </span>
                  }
                />
              ) : employeesByRole.every(([, emps]) => emps.length === 0) ? (
                <NoItems css={{ marginTop: 50 }} />
              ) : (
                employeesByRole.map(([role, employees]) => {
                  if (employees.length > 0) {
                    return (
                      <React.Fragment key={role}>
                        <Divider orientation="left">
                          {t(roleToString(parseInt(role)))}
                        </Divider>
                        {employees.map((employee) => (
                          <EmployeeCard key={employee.id} employee={employee} />
                        ))}
                      </React.Fragment>
                    );
                  }
                  return null;
                })
              )}
            </List>
          </div>
        </div>
      </Layout.Content>
      <ManagePositions
        open={managePositionsOpen}
        onClose={() => setManagePositionsOpen(false)}
      />
      <CreateEmployee
        open={isCreateEmployeeOpen}
        onClose={closeCreateEmployee}
      />
    </Layout>
  );
}

export default Employees;
