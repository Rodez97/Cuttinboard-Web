/** @jsx jsx */
import { jsx } from "@emotion/react";
import { UserOutlined } from "@ant-design/icons";
import { Layout, PageHeader, Tabs } from "antd";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeContactPanel from "./EmployeeContactPanel";
import EmployeeDocuments from "./EmployeeDocuments";
import EmployeeRolePanel from "./EmployeeRolePanel";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/services";

function EmployeeProfile() {
  const { getEmployees } = useEmployeesList();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const employee = useMemo(
    () => getEmployees.find((e) => e.id === id),
    [getEmployees, id]
  );

  if (!employee) {
    return null;
  }

  return (
    <Layout>
      <PageHeader
        onBack={() => navigate(-1)}
        title={employee.fullName}
        avatar={{
          src: employee.avatar,
          icon: <UserOutlined />,
          alt: employee.fullName,
        }}
      />
      <Layout.Content
        css={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingBottom: 30,
        }}
      >
        <Tabs defaultActiveKey="0" centered>
          <Tabs.TabPane tab={t("Information")} key={0}>
            <React.Fragment>
              <EmployeeRolePanel employee={employee} />
              <EmployeeContactPanel employee={employee} />
            </React.Fragment>
          </Tabs.TabPane>
          <Tabs.TabPane tab={t("Documents")} key={1}>
            <EmployeeDocuments employee={employee} />
          </Tabs.TabPane>
        </Tabs>
      </Layout.Content>
    </Layout>
  );
}

export default EmployeeProfile;
