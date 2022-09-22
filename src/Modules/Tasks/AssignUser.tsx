import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  Employee,
  EmployeeConverter,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { PrivacyLevel } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Typography } from "antd";
import {
  collection,
  documentId,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useRef } from "react";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SelectEmployee from "../../components/ManageApp/SelectEmployee";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import useExtendedCollectionOnceQuery from "../../hooks/useExtendedCollectionOnceQuery";

interface AssignUserProps {
  initialSelected?: string;
  onSelectedEmployee: (employee: Employee) => void;
}

function AssignUser({ initialSelected, onSelectedEmployee }: AssignUserProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locationId, location } = useLocation();
  const { selectedApp } = useCuttinboardModule();
  const baseQuery = useRef(
    collection(
      Firestore,
      "Organizations",
      location.organizationId,
      "employees"
    ).withConverter(EmployeeConverter)
  );

  const [employees, loadingEmployees, employeesError] =
    selectedApp.privacyLevel === PrivacyLevel.PRIVATE
      ? useExtendedCollectionOnceQuery(
          baseQuery.current,
          documentId(),
          selectedApp.accessTags
        )
      : selectedApp.privacyLevel === PrivacyLevel.POSITIONS
      ? useCollectionDataOnce(
          query(
            baseQuery.current,
            where(
              `locations.${locationId}.pos`,
              "array-contains-any",
              selectedApp.accessTags ?? []
            )
          )
        )
      : useCollectionDataOnce(
          query(baseQuery.current, orderBy(`locations.${locationId}`))
        );

  const handleSelectEmployee = (emp: Employee) => {
    onSelectedEmployee(emp);
    navigate(-1);
  };

  if (loadingEmployees) {
    return <PageLoading />;
  }
  if (employeesError) {
    return <PageError error={employeesError} />;
  }
  return (
    <>
      <Typography.Title
        level={4}
        style={{ textAlign: "center", margin: "20px 0px" }}
      >
        {t("Assign tasks")}
      </Typography.Title>
      <SelectEmployee
        employees={employees}
        orgEmployees={[]}
        onSelectedEmployee={handleSelectEmployee}
        initialSelected={employees?.find((e) => e.id === initialSelected)}
      />
    </>
  );
}

export default AssignUser;
