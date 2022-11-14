import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/services";
import React from "react";
import ManageMembers from "../../components/ManageApp/ManageMembers";
import { recordError } from "../../utils/utils";

function ConvManageMembers() {
  const { canManage, selectedConversation } = useConversations();

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedConversation) {
      return;
    }
    try {
      await selectedConversation.removeMember(employeeId);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddMembers = async (addedEmployees: Employee[]) => {
    if (!selectedConversation) {
      return;
    }
    try {
      await selectedConversation.addMembers(addedEmployees);
    } catch (error) {
      recordError(error);
    }
  };

  const handleSetAppHost = async (newHostUser: Employee) => {
    if (!selectedConversation) {
      return;
    }
    try {
      await selectedConversation.addHost(newHostUser);
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveHost = async (host: Employee) => {
    if (!selectedConversation) {
      return;
    }
    try {
      await selectedConversation.removeHost(host);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <ManageMembers
      readonly={!canManage}
      members={selectedConversation.members}
      removeMember={handleRemoveMember}
      addMembers={handleAddMembers}
      setAppHost={handleSetAppHost}
      removeHost={handleRemoveHost}
      privacyLevel={selectedConversation.privacyLevel}
      positions={[selectedConversation.position]}
      hosts={selectedConversation?.hosts}
    />
  );
}

export default ConvManageMembers;
