/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Colors,
  employeesSelectors,
  useAppSelector,
  useConversations,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Divider, List, Modal, ModalProps, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { UserInfoAvatar } from "../../shared";
import {
  getEmployeeFullName,
  IEmployee,
  PrivacyLevel,
} from "@cuttinboard-solutions/types-helpers";

function ConvManageMembers(props: ModalProps) {
  const { t } = useTranslation();
  const getEmployees = useAppSelector(employeesSelectors.selectAll);
  const { activeConversation } = useConversations();

  if (!activeConversation) {
    throw new Error("No active conversation");
  }

  // Calculate a list of board members based on the privacy level and other conditions
  const getMembers = useMemo(() => {
    let membersList: IEmployee[] = [];
    if (activeConversation.privacyLevel === PrivacyLevel.PRIVATE) {
      // If the privacy level is private, only include employees who are members
      membersList = getEmployees.filter(
        (emp) => activeConversation.members[emp.id] !== undefined
      );
    }
    if (activeConversation.privacyLevel === PrivacyLevel.PUBLIC) {
      // If the privacy level is public, include all employees
      membersList = getEmployees;
    }
    if (
      activeConversation.privacyLevel === PrivacyLevel.POSITIONS &&
      activeConversation.position
    ) {
      const position = activeConversation.position;
      // If the privacy level is based on positions and positions are specified, only include employees with the specified positions
      membersList = getEmployees.filter((emp) =>
        emp.positions?.includes(position)
      );
    }
    // Filter out any admins from the list of members
    return membersList;
  }, [
    activeConversation.privacyLevel,
    activeConversation.position,
    activeConversation.members,
    getEmployees,
  ]);

  return (
    <Modal {...props} title={t("Members")} footer={null}>
      {/* Members */}
      <Divider orientation="left">{t("Members")}</Divider>

      {activeConversation.privacyLevel === PrivacyLevel.PUBLIC && (
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

      {activeConversation.privacyLevel === PrivacyLevel.POSITIONS &&
        activeConversation.position && <Tag>{activeConversation.position}</Tag>}

      <List
        dataSource={getMembers}
        renderItem={(employee) => (
          <List.Item
            css={{
              backgroundColor: Colors.MainOnWhite,
              padding: 10,
              margin: 5,
            }}
          >
            <List.Item.Meta
              avatar={<UserInfoAvatar employee={employee} />}
              title={getEmployeeFullName(employee)}
              description={employee.email}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}

export default ConvManageMembers;
