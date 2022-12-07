/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import AddMembers from "./AddMembers";
import MemberItem from "./MemberItem";
import SelectEmployee from "./SelectEmployee";
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

type ManageMembersProps = {
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

function ManageMembers({
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
}: ManageMembersProps) {
  const { t } = useTranslation();
  const { locationAccessKey } = useCuttinboardLocation();
  const { getEmployees } = useEmployeesList();
  const [addMembersOpen, openAddMembers, closeAddMembers] = useDisclose();
  const [selectHostOpen, openSelectHost, closeSelectHost] = useDisclose();

  const handleAddMembers = (addedEmployees: Employee[]) => {
    addMembers(addedEmployees);
  };

  const handleMemberRemove = async (employeeId: string) => {
    Modal.confirm({
      title: t("Are you sure you want to remove this user?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      onOk() {
        try {
          removeMember(employeeId);
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  const getMembers = useMemo(() => {
    let membersList: Employee[] = [];
    if (privacyLevel === PrivacyLevel.PRIVATE) {
      membersList = getEmployees.filter((emp) => indexOf(members, emp.id) > -1);
    }
    if (privacyLevel === PrivacyLevel.PUBLIC) {
      membersList = getEmployees;
    }
    if (privacyLevel === PrivacyLevel.POSITIONS && positions) {
      membersList = getEmployees.filter((emp) => emp.hasAnyPosition(positions));
    }
    return membersList.filter((m) => !admins?.includes(m.id));
  }, [getEmployees, privacyLevel, members, positions, admins]);

  const hostsList = useMemo(() => {
    if (!admins || !admins.length) {
      return [];
    }
    return getEmployees.filter((e) => admins?.indexOf(e.id) > -1);
  }, [getEmployees, admins]);

  const getPossibleHosts = useMemo(() => {
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
              <MemberItem
                key={hostUser.id}
                employee={hostUser}
                onRemove={() => handleRemoveHost(hostUser)}
                admins={admins}
                privacyLevel={privacyLevel}
              />
            )}
          />
        )}

        {/* Members */}
        <Divider orientation="left">{t("Members")}</Divider>

        <Button
          icon={<UserAddOutlined />}
          onClick={openAddMembers}
          type="dashed"
          block
          hidden={privacyLevel !== PrivacyLevel.PRIVATE || readonly}
        >
          {t("Add Members")}
        </Button>

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
          dataSource={getMembers}
          renderItem={(emp) => (
            <MemberItem
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
      <AddMembers
        onSelectedEmployees={handleAddMembers}
        admins={admins}
        initialSelected={getMembers}
        onClose={closeAddMembers}
        onCancel={closeAddMembers}
        open={addMembersOpen}
      />
      <SelectEmployee
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

export default ManageMembers;
