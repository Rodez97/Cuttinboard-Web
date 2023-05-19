/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Layout, Modal, Result } from "antd/es";
import { arrayRemove, doc, writeBatch } from "firebase/firestore";
import { lazy, Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { useOwner } from "../OwnerPortal";
import { LoadingPage } from "../../shared";
import {
  FIRESTORE,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import {
  ILocation,
  IOrganizationEmployee,
} from "@cuttinboard-solutions/types-helpers";

const AssignLocations = lazy(() => import("./AssignLocations"));
const SupervisorLocations = lazy(() => import("./SupervisorLocations"));

export default ({ supervisors }: { supervisors: IOrganizationEmployee[] }) => {
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

  const unassignLocation = (location: ILocation) => {
    if (!getSupervisor) {
      throw new Error("Supervisor not found");
    }
    Modal.confirm({
      title: t("Do you want to unassign this location?"),
      icon: <ExclamationCircleOutlined />,
      cancelText: t("Cancel"),
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
      <Suspense fallback={<LoadingPage />}>
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
      </Suspense>
    </Layout>
  );
};
