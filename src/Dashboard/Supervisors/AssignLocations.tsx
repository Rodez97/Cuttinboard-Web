/** @jsx jsx */
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Alert, Button, Layout, Space } from "antd";
import { arrayUnion, doc, writeBatch } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GrayPageHeader } from "../../shared";
import { recordError } from "../../utils/utils";
import LocationsPicker from "./LocationsPicker";

type props = {
  alreadySelected: Location[];
  supervisor: Employee;
};

export default ({ alreadySelected, supervisor }: props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useCuttinboard();
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [assigning, setAssigning] = useState(false);

  const assignNewLocations = async () => {
    if (!selectedLocations.length) {
      return;
    }
    setAssigning(true);
    const batch = writeBatch(FIRESTORE);

    for (const loc of selectedLocations) {
      batch.update(doc(FIRESTORE, "Locations", loc.id), {
        supervisors: arrayUnion(supervisor.id),
      });
    }
    batch.update(
      doc(FIRESTORE, "Organizations", user.uid, "employees", supervisor.id),
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
    <React.Fragment>
      <GrayPageHeader
        onBack={() => navigate(-1)}
        subTitle={t("What Locations will {{0}} supervise?", {
          0: supervisor.fullName,
        })}
      />
      <Layout.Content css={{ padding: 20 }}>
        <LocationsPicker
          selectedLocations={selectedLocations}
          onSelectionChange={setSelectedLocations}
          alreadySelected={alreadySelected}
        />
      </Layout.Content>
      <Layout.Footer css={{ justifyContent: "center", display: "flex" }}>
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
            disabled={!selectedLocations.length}
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
    </React.Fragment>
  );
};
