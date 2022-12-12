/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import EmployeeMultiSelect from "./EmployeeMultiSelect";
import BoardMemberItem from "../molecules/BoardMemberItem";
import EmployeeSelect from "../molecules/EmployeeSelect";
import { indexOf } from "lodash";
import {
  Button,
  Divider,
  List,
  Modal,
  ModalProps,
  Space,
  Tag,
  Typography,
} from "antd";
import { ExclamationCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import {
  Employee,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  PrivacyLevel,
  RoleAccessLevels,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";

type ManageBoardMembersProps = {
  readonly?: boolean;
  members: string[];
  removeMember: (employeeId: string) => void;
  addMembers: (addedEmployees: Employee[]) => void;
  setAppHost: (newHostUser: Employee) => void;
  removeHost: (hostUser: Employee) => void;
  privacyLevel: PrivacyLevel;
  positions?: string[];
  admins?: string[];
} & ModalProps;

function ManageBoardMembers({
  readonly,
  removeMember,
  addMembers,
  setAppHost,
  removeHost,
  privacyLevel,
  positions,
  admins,
  members,
  ...props
}: ManageBoardMembersProps) {
  const { t } = useTranslation();
  const { locationAccessKey } = useCuttinboardLocation();
  const { getEmployees } = useEmployeesList();
  const [addMembersOpen, openAddMembers, closeAddMembers] = useDisclose();
  const [selectHostOpen, openSelectHost, closeSelectHost] = useDisclose();

  const handleAddMembers = (addedEmployees: Employee[]) => {
    addMembers(addedEmployees);
  };

  const handleMemberRemove = async (employee: Employee) => {
    Modal.confirm({
      title: t("Are you sure you want to remove this user?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      onOk() {
        try {
          removeMember(employee.id);
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  // Calculate a list of board members based on the privacy level and other conditions
  const getBoardMembers = useMemo(() => {
    let membersList: Employee[] = [];
    if (privacyLevel === PrivacyLevel.PRIVATE) {
      // If the privacy level is private, only include employees who are members
      membersList = getEmployees.filter((emp) => indexOf(members, emp.id) > -1);
    }
    if (privacyLevel === PrivacyLevel.PUBLIC) {
      // If the privacy level is public, include all employees
      membersList = getEmployees;
    }
    if (privacyLevel === PrivacyLevel.POSITIONS && positions) {
      // If the privacy level is based on positions and positions are specified, only include employees with the specified positions
      membersList = getEmployees.filter((emp) => emp.hasAnyPosition(positions));
    }
    // Filter out any admins from the list of members
    return membersList.filter((m) => !admins?.includes(m.id));
  }, [getEmployees, privacyLevel, members, positions, admins]);

  // Calculate a list of hosts (admins)
  const hostsList = useMemo(() => {
    // If there are no admins, return an empty list
    if (!admins || !admins.length) {
      return [];
    }
    // Otherwise, return a list of employees who are admins
    return getEmployees.filter((e) => admins.indexOf(e.id) > -1);
  }, [getEmployees, admins]);

  // Calculate a list of possible hosts (admins)
  const getPossibleHosts = useMemo(() => {
    // Return a list of employees who have manager-level access or higher and are not already admins
    return getEmployees.filter(
      (emp) =>
        emp.locationRole &&
        emp.locationRole <= RoleAccessLevels.MANAGER &&
        !(admins && admins.includes(emp.id))
    );
  }, [getEmployees, admins]);

  const handleSetHost = (newHost: Employee) => {
    closeSelectHost();
    setAppHost(newHost);
  };

  const handleRemoveHost = async (admin: Employee) => {
    Modal.confirm({
      title: t("Are you sure you want to remove this admin?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          removeHost(admin);
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  return (
    <React.Fragment>
      <Modal {...props} title={t("Add Members")} footer={null}>
        {/* 🛡 Admin */}
        {(Boolean(hostsList.length) ||
          locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER) && (
          <Divider orientation="left">{t("Admin")}</Divider>
        )}

        {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
          <Button type="dashed" block onClick={openSelectHost}>
            {t("Add Admin")}
          </Button>
        )}

        {Boolean(hostsList.length) && (
          <List
            dataSource={hostsList}
            renderItem={(hostUser) => (
              <BoardMemberItem
                key={hostUser.id}
                employee={hostUser}
                onRemove={handleRemoveHost}
                admins={admins}
                privacyLevel={privacyLevel}
              />
            )}
          />
        )}

        {/* Members */}
        <Divider orientation="left">{t("Members")}</Divider>

        {privacyLevel === PrivacyLevel.PRIVATE && !readonly && (
          <Button
            icon={<UserAddOutlined />}
            onClick={openAddMembers}
            type="dashed"
            block
            hidden={privacyLevel !== PrivacyLevel.PRIVATE || readonly}
          >
            {t("Add Members")}
          </Button>
        )}

        {privacyLevel === PrivacyLevel.PUBLIC && (
          <Typography.Text
            strong
            css={{
              fontSize: 20,
              textAlign: "center",
              display: "block",
            }}
          >
            {t("This is a Public element. Everyone is a member")}
          </Typography.Text>
        )}

        {privacyLevel === PrivacyLevel.POSITIONS && positions?.length && (
          <Space wrap>
            {positions
              .filter((p) => !p.startsWith("hostId_"))
              .map((pos, index) => (
                <Tag key={index}>{t(pos)}</Tag>
              ))}
          </Space>
        )}

        <List
          dataSource={getBoardMembers}
          renderItem={(emp) => (
            <BoardMemberItem
              key={emp.id}
              employee={emp}
              onRemove={handleMemberRemove}
              privacyLevel={privacyLevel}
              readonly={
                privacyLevel === PrivacyLevel.POSITIONS ||
                privacyLevel === PrivacyLevel.PUBLIC ||
                readonly
              }
            />
          )}
        />
      </Modal>
      <EmployeeMultiSelect
        onSelectedEmployees={handleAddMembers}
        admins={admins}
        initialSelected={getBoardMembers}
        onClose={closeAddMembers}
        onCancel={closeAddMembers}
        open={addMembersOpen}
      />
      <EmployeeSelect
        onSelectedEmployee={handleSetHost}
        employees={getPossibleHosts}
        onCancel={closeSelectHost}
        open={selectHostOpen}
        footer={null}
        title={t("Select admin")}
      />
    </React.Fragment>
  );
}

export default ManageBoardMembers;
