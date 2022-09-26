import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useConversations,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { PrivacyLevel } from "@cuttinboard-solutions/cuttinboard-library/utils";
import React from "react";
import { useNavigate } from "react-router-dom";
import ManageMembers from "../../components/ManageApp/ManageMembers";
import { recordError } from "../../utils/utils";

function ConvManageMembers() {
  const navigate = useNavigate();
  const { getEmployees, getOrgEmployees } = useEmployeesList();

  const {
    canManageApp,
    selectedChat,
    removeMember,
    addMembers,
    setAppHost,
    removeHost,
  } = useConversations();

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedChat) {
      return;
    }
    try {
      await removeMember(employeeId);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddMembers = async (addedEmployees: Employee[]) => {
    if (!selectedChat) {
      return;
    }
    try {
      await addMembers(addedEmployees);
    } catch (error) {
      recordError(error);
    }
  };

  const handleSetAppHost = async (newHostUser: Employee) => {
    if (!selectedChat) {
      return;
    }
    try {
      await setAppHost(newHostUser);
      navigate(-1);
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveHost = async (host: Employee) => {
    if (!selectedChat) {
      return;
    }
    try {
      await removeHost(host);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <ManageMembers
      readonly={!canManageApp}
      members={
        selectedChat.privacyLevel === PrivacyLevel.PRIVATE &&
        (selectedChat?.members ?? [])
      }
      removeMember={handleRemoveMember}
      addMembers={handleAddMembers}
      setAppHost={handleSetAppHost}
      removeHost={handleRemoveHost}
      privacyLevel={selectedChat.privacyLevel}
      positions={
        selectedChat.privacyLevel === PrivacyLevel.POSITIONS &&
        (selectedChat?.positions ?? [])
      }
      hostId={selectedChat?.hostId ?? ""}
    />
  );
}

export default ConvManageMembers;
