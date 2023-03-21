/** @jsx jsx */
import { jsx } from "@emotion/react";
import { UserAddOutlined } from "@ant-design/icons";
import {
  employeesSelectors,
  useAppSelector,
  useConversations,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Button, Divider, List, Modal, Tag, Typography } from "antd";
import React, { useImperativeHandle, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BoardMemberItem, EmployeeMultiSelect } from "../../shared";
import { IEmployee, PrivacyLevel } from "@cuttinboard-solutions/types-helpers";

export interface ConvManageMembersDialogRef {
  openDialog: (conversationId: string) => void;
}

const ConvManageMembers = React.forwardRef<ConvManageMembersDialogRef, unknown>(
  (_, ref) => {
    const { t } = useTranslation();
    const getEmployees = useAppSelector(employeesSelectors.selectAll);
    const [isOpen, open, close] = useDisclose();
    const [addMembersOpen, openAddMembers, closeAddMembers] = useDisclose();
    const [activeConversationId, setActiveConversationId] =
      useState<string>("");
    const { removeConversationMember, addConversationMembers, conversations } =
      useConversations();

    useImperativeHandle(ref, () => ({
      openDialog: (conversationId: string) => {
        setActiveConversationId(conversationId);
        open();
      },
    }));

    const activeConversation = useMemo(() => {
      if (!activeConversationId) {
        return undefined;
      }
      return conversations.find((conv) => conv.id === activeConversationId);
    }, [activeConversationId, conversations]);

    const handleRemoveMember = (employee: IEmployee) => {
      if (!activeConversation) {
        return;
      }
      removeConversationMember(activeConversation, [employee]);
    };

    const handleAddMembers = (addedEmployees: IEmployee[]) => {
      if (!activeConversation) {
        return;
      }
      addConversationMembers(activeConversation, addedEmployees);
    };

    // Calculate a list of board members based on the privacy level and other conditions
    const getMembers = useMemo(() => {
      if (!activeConversation) {
        return [];
      }
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
    }, [activeConversation, getEmployees]);

    if (!activeConversation) {
      return null;
    }

    return (
      <React.Fragment>
        <Modal
          title={activeConversation.name}
          footer={null}
          open={isOpen}
          onCancel={close}
        >
          {/* Members */}
          <Divider orientation="left">{t("Members")}</Divider>

          {activeConversation.privacyLevel === PrivacyLevel.PRIVATE && (
            <Button
              icon={<UserAddOutlined />}
              onClick={openAddMembers}
              type="dashed"
              block
            >
              {t("Add Members")}
            </Button>
          )}

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
            activeConversation.position && (
              <Tag>{activeConversation.position}</Tag>
            )}

          <List
            dataSource={getMembers}
            renderItem={(emp) => (
              <BoardMemberItem
                key={emp.id}
                employee={emp}
                onRemove={handleRemoveMember}
                privacyLevel={activeConversation.privacyLevel}
                readonly={Boolean(
                  activeConversation.privacyLevel === PrivacyLevel.POSITIONS ||
                    activeConversation.privacyLevel === PrivacyLevel.PUBLIC
                )}
              />
            )}
          />
        </Modal>
        <EmployeeMultiSelect
          onSelectedEmployees={handleAddMembers}
          initialSelected={getMembers}
          onClose={closeAddMembers}
          onCancel={closeAddMembers}
          open={addMembersOpen}
        />
      </React.Fragment>
    );
  }
);

export const useManageMembers = () => {
  const ref = React.useRef<ConvManageMembersDialogRef>(null);

  const openDialog = (conversationId: string) => {
    if (ref.current) {
      ref.current.openDialog(conversationId);
    }
  };

  return { openDialog, ConvManageMembers: <ConvManageMembers ref={ref} /> };
};

export default ConvManageMembers;
