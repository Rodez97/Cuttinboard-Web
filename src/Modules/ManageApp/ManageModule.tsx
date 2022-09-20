import { Auth } from "@cuttinboard/cuttinboard-library/firebase";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard/cuttinboard-library/services";
import { PrivacyLevel } from "@cuttinboard/cuttinboard-library/utils";
import { serverTimestamp } from "firebase/firestore";
import React from "react";
import ManageBase, { BaseApp } from "../../components/ManageApp/ManageBase";
import { recordError } from "../../utils/utils";
import {
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";

interface ManageModuleProps {
  title: string;
  baseApp?: BaseApp;
}

// TODO: Crear una cceso directo para manejar los miembros

const ManageModule = ({ title, baseApp }: ManageModuleProps) => {
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
      newAppObject.positions = positions;
    }
    if (newModuleData.privacyLevel === PrivacyLevel.PRIVATE) {
      newAppObject.members = members;
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
    const editedData: any = { ...selectedApp, ...moduleData };

    if (moduleData.privacyLevel === PrivacyLevel.POSITIONS) {
      editedData.positions = positions;
    }
    if (moduleData.privacyLevel === PrivacyLevel.PRIVATE) {
      editedData.members = members;
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
      baseApp={baseApp}
      create={createModuleItem}
      edit={editModuleItem}
    />
  );
};

export default ManageModule;
