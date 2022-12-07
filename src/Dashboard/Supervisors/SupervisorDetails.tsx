/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Layout, Modal, Result } from "antd";
import { arrayRemove, doc, writeBatch } from "firebase/firestore";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { useOwner } from "../OwnerPortal";
import SupervisorLocations from "./SupervisorLocations";
import AssignLocations from "./AssignLocations";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";

export default ({ supervisors }: { supervisors: Employee[] }) => {
  const { user } = useCuttinboard();
  const { supervisorId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locations } = useOwner();
  const getSupervisor = useMemo(
    () => supervisors.find((sp) => sp.id === supervisorId),
    [supervisors, supervisorId]
  );
  const getSupervisorLocations = useMemo(
    () =>
      locations.filter(
        (loc) =>
          loc.supervisors &&
          supervisorId &&
          loc.supervisors.indexOf(supervisorId) > -1
      ),
    [locations, supervisorId]
  );

  const unassignLocation = (location: Location) => {
    if (!getSupervisor) {
      throw new Error("Supervisor not found");
    }
    Modal.confirm({
      title: "Do you want to unassign this location?",
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        const batch = writeBatch(FIRESTORE);
        batch.update(doc(FIRESTORE, "Locations", location.id), {
          supervisors: arrayRemove(getSupervisor.id),
        });
        batch.update(
          doc(
            FIRESTORE,
            "Organizations",
            user.uid,
            "employees",
            getSupervisor.id
          ),
          {
            supervisingLocations: arrayRemove(location.id),
          }
        );
        try {
          await batch.commit();
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  if (!getSupervisor) {
    return (
      <Result
        status="error"
        title={t("Supervisor not found")}
        extra={
          <Button type="primary" key="console" onClick={() => navigate(-1)}>
            {t("Go back")}
          </Button>
        }
      />
    );
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <SupervisorLocations
              locations={getSupervisorLocations}
              onUnassign={unassignLocation}
              supervisor={getSupervisor}
            />
          }
        />
        <Route
          path="assign"
          element={
            <AssignLocations
              alreadySelected={getSupervisorLocations}
              supervisor={getSupervisor}
            />
          }
        />
      </Routes>
    </Layout>
  );
};
