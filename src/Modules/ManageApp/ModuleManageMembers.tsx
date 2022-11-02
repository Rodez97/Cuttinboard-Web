import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { getAnalytics, logEvent } from "firebase/analytics";
import React from "react";
import ManageMembers from "../../components/ManageApp/ManageMembers";
import { recordError } from "../../utils/utils";

function ModuleManageMembers() {
  const { selectedApp, canManage } = useCuttinboardModule();

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedApp) {
      return;
    }
    try {
      await selectedApp.removeMember(employeeId);
      // Report to analytics
      const analytics = getAnalytics();
      logEvent(analytics, "remove_member", {
        from: "module_manage_members",
      });
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddMembers = async (addedEmployees: Employee[]) => {
    if (!selectedApp) {
      return;
    }
    try {
      await selectedApp.addMembers(addedEmployees);
      // Report to analytics
      const analytics = getAnalytics();
      logEvent(analytics, "add_members", {
        from: "module_manage_members",
      });
    } catch (error) {
      recordError(error);
    }
  };

  const handleSetAppHost = async (newHostUser: Employee) => {
    if (!selectedApp) {
      return;
    }
    try {
      await selectedApp.addHost(newHostUser);
      // Report to analytics
      const analytics = getAnalytics();
      logEvent(analytics, "set_app_host", {
        from: "module_manage_members",
      });
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveHost = async (host: Employee) => {
    if (!selectedApp) {
      return;
    }
    try {
      await selectedApp.removeHost(host.id);
      // Report to analytics
      const analytics = getAnalytics();
      logEvent(analytics, "remove_host", {
        from: "module_manage_members",
      });
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <ManageMembers
      readonly={!canManage}
      members={selectedApp.accessTags}
      removeMember={handleRemoveMember}
      addMembers={handleAddMembers}
      setAppHost={handleSetAppHost}
      removeHost={handleRemoveHost}
      privacyLevel={selectedApp.privacyLevel}
      positions={selectedApp.accessTags}
      hosts={selectedApp?.hosts}
    />
  );
}

export default ModuleManageMembers;
