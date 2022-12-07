/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import EmployeeCard from "./EmployeeCard";
import { matchSorter } from "match-sorter";
import {
  Button,
  Divider,
  Input,
  Layout,
  List,
  Modal,
  Select,
  Skeleton,
  Space,
  Tooltip,
} from "antd";
import {
  ExclamationCircleOutlined,
  TagOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import ManagePositions from "./ManagePositions";
import { groupBy, orderBy } from "lodash";
import CreateEmployee from "./CreateEmployee";
import { GrayPageHeader } from "../../components";
import {
  Employee,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  POSITIONS,
  RoleAccessLevels,
  roleToString,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library/utils";

function Employees() {
  const { getEmployees, loading } = useEmployeesList();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>("");
  const { user } = useCuttinboard();
  const [managePositionsOpen, setManagePositionsOpen] = useState(false);
  const { isOwner, isAdmin, location } = useCuttinboardLocation();
  const [isCreateEmployeeOpen, openCreateEmployee, closeCreateEmployee] =
    useDisclose(false);

  const addPrimaryOwner = async () => {
    await location.ownerJoin(true);
  };

  const removePrimaryOwner = () => {
    Modal.confirm({
      title: t("Are you sure you want to leave this location?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await location.ownerJoin();
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  const getEmployeeByRole = useCallback(() => {
    const employees = getEmployees;

    const groupedByRole = groupBy(employees, (e) => e.locationRole);

    const finalAfterQuery = Object.entries(groupedByRole).reduce<
      Record<RoleAccessLevels, Employee[]>
    >(
      (acc, [role, employees]) => {
        // Filter by name by searchText
        const filtered = searchText
          ? matchSorter(employees, searchText, {
              keys: [(e) => e.fullName],
            })
          : employees;
        const byPos = selectedTag
          ? matchSorter(filtered, selectedTag, {
              keys: [(e) => e.positions],
            })
          : filtered;
        const parsedRole: RoleAccessLevels = parseInt(role);
        acc[parsedRole] = orderBy(byPos, ["locationRole", "fullName"]);

        return acc;
      },
      {
        [RoleAccessLevels.OWNER]: [],
        [RoleAccessLevels.ADMIN]: [],
        [RoleAccessLevels.GENERAL_MANAGER]: [],
        [RoleAccessLevels.MANAGER]: [],
        [RoleAccessLevels.STAFF]: [],
      }
    );

    return Object.entries(finalAfterQuery);
  }, [searchText, selectedTag, getEmployees]);

  const joinSupervisor = async () => {
    try {
      await location.supervisorJoin(true);
    } catch (error) {
      recordError(error);
    }
  };

  const leaveSupervisor = async () => {
    Modal.confirm({
      title: t("Are you sure you want to leave this location?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await location.supervisorJoin();
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  return (
    <Layout>
      <GrayPageHeader
        title={t("Employees")}
        subTitle={`${location.usage.employeesCount} / ${location.usage.employeesLimit}`}
        extra={[
          <Button
            key="ManagePositions"
            icon={<TagOutlined />}
            onClick={() => setManagePositionsOpen(true)}
            type="primary"
          >
            {t("Manage Positions")}
          </Button>,
          <Tooltip
            key="1"
            title={
              location.usage.employeesCount === location.usage.employeesLimit &&
              t("Limit Reached")
            }
          >
            <Button
              icon={<UserAddOutlined />}
              onClick={openCreateEmployee}
              type="primary"
              disabled={
                location.usage.employeesCount === location.usage.employeesLimit
              }
            >
              {t("Add Employee")}
            </Button>
          </Tooltip>,
        ]}
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

        <Select
          showSearch
          style={{ width: 200 }}
          onSelect={setSelectedTag}
          onClear={() => setSelectedTag(null)}
          placeholder={t("Filter by position")}
          allowClear
        >
          {location.settings?.positions?.length && (
            <Select.OptGroup label={t("Custom")}>
              {location.settings.positions.map((pos) => (
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
            {loading ? (
              <Skeleton active />
            ) : (
              <List>
                {isOwner && !getEmployees?.some((e) => e.id === user.uid) && (
                  <Button type="dashed" onClick={addPrimaryOwner} block>
                    {t("Join this location")}
                  </Button>
                )}
                {isAdmin && !getEmployees?.some((e) => e.id === user.uid) && (
                  <Button type="dashed" onClick={joinSupervisor} block>
                    {t("Join this location")}
                  </Button>
                )}

                {isOwner && getEmployees?.some((e) => e.id === user.uid) && (
                  <Button
                    type="dashed"
                    danger
                    onClick={removePrimaryOwner}
                    block
                  >
                    {t("Leave this location")}
                  </Button>
                )}
                {isAdmin && getEmployees?.some((e) => e.id === user.uid) && (
                  <Button type="dashed" danger onClick={leaveSupervisor} block>
                    {t("Leave this location")}
                  </Button>
                )}

                {getEmployeeByRole().map(([role, employees]) => {
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
                })}
              </List>
            )}
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
