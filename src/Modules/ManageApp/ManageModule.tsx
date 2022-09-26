import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { PrivacyLevel } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { serverTimestamp } from "firebase/firestore";
import React from "react";
import ManageBase, { BaseApp } from "../../components/ManageApp/ManageBase";
import { recordError } from "../../utils/utils";
import {
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";
import { GenericModule } from "@cuttinboard-solutions/cuttinboard-library/models";

interface ManageModuleProps {
  title: string;
  edit?: boolean;
}

// TODO: Crear una cceso directo para manejar los miembros

const ManageModule = ({ title, edit }: ManageModuleProps) => {
  const { newElement, editElement, selectedApp } = useCuttinboardModule();
  const { locationId } = useLocation();
  const { pathname } = useRouterLocation();
  const navigate = useNavigate();

  const createModuleItem = async ({
    members,
    positions,
    ...newModuleData
  }: BaseApp) => {
    const newAppObject: any = {
      ...newModuleData,
      createdAt: serverTimestamp(),
      createdBy: Auth.currentUser.uid,
      locationId,
    };

    if (newModuleData.privacyLevel === PrivacyLevel.POSITIONS) {
      newAppObject.accessTags = positions;
    }
    if (newModuleData.privacyLevel === PrivacyLevel.PRIVATE) {
      newAppObject.accessTags = members;
    }

    try {
      const newId = await newElement(newAppObject);
      navigate(pathname.replace("new", newId));
    } catch (error) {
      recordError(error);
    }
  };

  const editModuleItem = async ({
    members,
    positions,
    ...moduleData
  }: BaseApp) => {
    const editedData: GenericModule = { ...selectedApp, ...moduleData };

    if (moduleData.privacyLevel === PrivacyLevel.POSITIONS) {
      editedData.accessTags = positions;
    }
    if (moduleData.privacyLevel === PrivacyLevel.PRIVATE) {
      editedData.accessTags = members;
    }
    try {
      await editElement(editedData);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <ManageBase
      title={title}
      baseApp={
        edit
          ? {
              ...selectedApp,
              members: selectedApp.accessTags,
              positions: selectedApp.accessTags,
            }
          : null
      }
      create={createModuleItem}
      edit={editModuleItem}
    />
  );
};

export default ManageModule;
