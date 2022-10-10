/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  CloseOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  Employee,
  Location,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  Alert,
  Button,
  Card,
  Divider,
  Dropdown,
  Layout,
  Menu,
  Modal,
  PageHeader,
  Space,
  Typography,
} from "antd";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { recordError } from "../../utils/utils";
import LocationsPicker from "./LocationsPicker";
import { useOwner } from "../OwnerPortal/OwnerPortal";
import { QuickUserDialogAvatar } from "components/QuickUserDialog";

function SupervisorDetails({ supervisors }: { supervisors: Employee[] }) {
  const { supervisorId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locations } = useOwner();
  const getSupervisor = useMemo(
    () => supervisors.find((sp) => sp.id === supervisorId),
    [supervisors, supervisorId]
  );
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [assigning, setAssigning] = useState(false);
  const getSupervisorLocations = useMemo(
    () =>
      locations.filter((loc) => loc.supervisors?.indexOf(supervisorId) > -1),
    [locations, supervisorId]
  );

  const deleteSupervisor = () => {
    Modal.confirm({
      title: "Do you want to remove this supervisor?",
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          navigate(-1);
          await deleteDoc(getSupervisor.docRef);
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const menu = (
    <Menu
      items={[
        {
          key: "assign",
          label: t("Assign Locations"),
          icon: <PlusSquareOutlined />,
          onClick: () => navigate("assign"),
        },
        {
          key: "delete",
          label: t("Delete Supervisor"),
          icon: <DeleteOutlined />,
          danger: true,
          onClick: deleteSupervisor,
        },
      ]}
    />
  );

  const unassignLocation = (location: Location) => {
    Modal.confirm({
      title: "Do you want to unassign this location?",
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        const batch = writeBatch(Firestore);
        batch.update(doc(Firestore, "Locations", location.id), {
          supervisors: arrayRemove(getSupervisor.id),
        });
        batch.update(
          doc(
            Firestore,
            "Organizations",
            Auth.currentUser.uid,
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
      onCancel() {},
    });
  };

  const assignNewLocations = async () => {
    if (!selectedLocations.length) {
      return;
    }
    setAssigning(true);
    const batch = writeBatch(Firestore);

    for (const loc of selectedLocations) {
      batch.update(doc(Firestore, "Locations", loc.id), {
        supervisors: arrayUnion(getSupervisor.id),
      });
    }
    batch.update(
      doc(
        Firestore,
        "Organizations",
        Auth.currentUser.uid,
        "employees",
        getSupervisor.id
      ),
      {
        supervisingLocations: arrayUnion(
          ...selectedLocations.map((sl) => sl.id)
        ),
      }
    );

    try {
      await batch.commit();
      navigate(-1);
    } catch (error) {
      recordError(error);
    }
    setAssigning(false);
  };

  return (
    <Layout
      css={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "25px",
      }}
    >
      <PageHeader
        onBack={() => navigate(-1)}
        title={t("Supervisor Details")}
        extra={[
          <Dropdown key="1" overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>,
        ]}
      />
      <Routes>
        <Route
          path="/"
          element={
            <React.Fragment>
              <div
                css={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <QuickUserDialogAvatar employee={getSupervisor} size={60} />

                <Typography.Title
                  level={3}
                >{`${getSupervisor.name} ${getSupervisor.lastName}`}</Typography.Title>

                <Alert
                  message={t("Supervising {{0}} location(s)", {
                    0: getSupervisor.supervisingLocations?.length ?? 0,
                  })}
                  type="warning"
                  showIcon
                />
              </div>

              <Divider />

              <Space wrap size="large" css={{ padding: "20px" }}>
                {getSupervisorLocations?.map((loc) => (
                  <Card
                    css={{ width: 270 }}
                    title={loc.name}
                    extra={[
                      <CloseOutlined
                        key={`close-${loc.id}`}
                        onClick={() => unassignLocation(loc)}
                      />,
                    ]}
                  >
                    <Card.Meta
                      description={
                        <Typography.Text>
                          {t("City: {{0}}", { 0: loc.address?.city })}
                          <br />
                          {t("ID: {{0}}", { 0: loc.intId })}
                        </Typography.Text>
                      }
                    />
                  </Card>
                ))}
              </Space>
            </React.Fragment>
          }
        />
        <Route
          path="assign"
          element={
            <React.Fragment>
              <Layout css={{ padding: "20px" }}>
                <Typography.Text
                  type="secondary"
                  css={{ fontSize: 18, alignSelf: "center", margin: "10px" }}
                >
                  {t("What Locations will {{0}} supervise?", {
                    0: getSupervisor?.name,
                  })}
                </Typography.Text>

                <LocationsPicker
                  selectedLocations={selectedLocations}
                  onSelectionChange={setSelectedLocations}
                  alreadySelected={getSupervisorLocations}
                />

                <Layout.Footer
                  css={{ justifyContent: "center", display: "flex" }}
                >
                  <Space direction="vertical" css={{ width: 300 }}>
                    <Alert
                      message={t("{{0}} Location(s) selected", {
                        0: Number(selectedLocations.length),
                      })}
                      type="warning"
                      showIcon
                    />
                    <Button
                      type="primary"
                      onClick={assignNewLocations}
                      loading={assigning}
                      block
                      disabled={!Boolean(selectedLocations.length)}
                    >
                      {t("Assign")}
                    </Button>
                    <Button
                      type="primary"
                      danger
                      onClick={() => {
                        setSelectedLocations([]);
                        navigate(-1);
                      }}
                      block
                    >
                      {t("Cancel")}
                    </Button>
                  </Space>
                </Layout.Footer>
              </Layout>
            </React.Fragment>
          }
        />
      </Routes>
    </Layout>
  );
}

export default SupervisorDetails;
