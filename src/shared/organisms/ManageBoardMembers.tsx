/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import EmployeeMultiSelect from "./EmployeeMultiSelect";
import BoardMemberItem from "../molecules/BoardMemberItem";
import EmployeeSelect from "../molecules/EmployeeSelect";
import indexOf from "lodash-es/indexOf";
import {
  Button,
  Divider,
  List,
  Modal,
  ModalProps,
  Space,
  Tag,
  Typography,
} from "antd/es";
import { ExclamationCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import {
  useCuttinboardLocation,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library";
import {
  checkEmployeePositions,
  IEmployee,
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

type ManageBoardMembersProps = {
  readonly?: boolean;
  members: string[];
  removeMember: (employee: IEmployee) => void;
  addMembers: (addedEmployees: IEmployee[]) => void;
  setAppHost: (newHostUser: IEmployee) => void;
  removeHost: (hostUser: IEmployee) => void;
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
  const { role, employees } = useCuttinboardLocation();
  const [addMembersOpen, openAddMembers, closeAddMembers] = useDisclose();
  const [selectHostOpen, openSelectHost, closeSelectHost] = useDisclose();

  const handleAddMembers = (addedEmployees: IEmployee[]) => {
    addMembers(addedEmployees);
  };

  const handleMemberRemove = async (employee: IEmployee) => {
    Modal.confirm({
      title: t("Are you sure you want to remove this user?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      onOk() {
        try {
          removeMember(employee);
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  // Calculate a list of board members based on the privacy level and other conditions
  const getBoardMembers = useMemo(() => {
    let membersList: IEmployee[] = [];
    if (privacyLevel === PrivacyLevel.PRIVATE) {
      // If the privacy level is private, only include employees who are members
      membersList = employees.filter((emp) => indexOf(members, emp.id) > -1);
    }
    if (privacyLevel === PrivacyLevel.PUBLIC) {
      // If the privacy level is public, include all employees
      membersList = employees;
    }
    if (privacyLevel === PrivacyLevel.POSITIONS && positions) {
      // If the privacy level is based on positions and positions are specified, only include employees with the specified positions
      membersList = employees.filter((emp) =>
        checkEmployeePositions(emp, positions)
      );
    }
    // Filter out any admins from the list of members
    return membersList.filter((m) => !admins?.includes(m.id));
  }, [privacyLevel, positions, employees, members, admins]);

  // Calculate a list of hosts (admins)
  const hostsList = useMemo(() => {
    // If there are no admins, return an empty list
    if (!admins || !admins.length) {
      return [];
    }
    // Otherwise, return a list of employees who are admins
    return employees.filter((e) => admins.indexOf(e.id) > -1);
  }, [employees, admins]);

  const handleSetHost = (newHost: IEmployee) => {
    closeSelectHost();
    setAppHost(newHost);
  };

  const handleRemoveHost = async (admin: IEmployee) => {
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
      <Modal {...props} footer={null}>
        {/* 🛡 Admin */}
        {(Boolean(hostsList.length) ||
          role <= RoleAccessLevels.GENERAL_MANAGER) && (
          <Divider orientation="left">{t("Admin")}</Divider>
        )}

        {role <= RoleAccessLevels.GENERAL_MANAGER && (
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
                readonly={role > RoleAccessLevels.GENERAL_MANAGER}
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
              admins={admins}
              readonly={Boolean(
                privacyLevel === PrivacyLevel.POSITIONS ||
                  privacyLevel === PrivacyLevel.PUBLIC ||
                  readonly
              )}
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
        employees={employees}
        onCancel={closeSelectHost}
        open={selectHostOpen}
        footer={null}
        title={t("Select admin")}
      />
    </React.Fragment>
  );
}

export default ManageBoardMembers;
