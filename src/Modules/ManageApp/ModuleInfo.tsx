import { useCuttinboardModule } from "@cuttinboard/cuttinboard-library";
import { deleteDoc } from "firebase/firestore";
import React from "react";
import BaseInfo from "../../components/ManageApp/BaseInfo";

function ModuleInfo() {
  const { setSelected, selectedApp } = useCuttinboardModule();

  const handleDelete = async () => {
    const refToDelete = selectedApp.docRef;
    setSelected(null);
    await deleteDoc(refToDelete);
  };

  return (
    <BaseInfo
      privacyLevel={selectedApp.privacyLevel}
      positions={selectedApp.accessTags}
      hostId={selectedApp?.hostId}
      name={selectedApp?.name}
      description={selectedApp?.description}
      members={selectedApp.accessTags}
      deleteApp={handleDelete}
    />
  );
}

export default ModuleInfo;
