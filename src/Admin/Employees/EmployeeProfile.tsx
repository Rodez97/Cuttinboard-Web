/** @jsx jsx */
import { jsx } from "@emotion/react";
import { UserOutlined } from "@ant-design/icons";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Layout, PageHeader, Tabs } from "antd";
import React, { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeContactPanel from "./EmployeeContactPanel";
import EmployeeDocuments from "./EmployeeDocuments";
import EmployeeRolePanel from "./EmployeeRolePanel";
import {
  useEmployeesList,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";

function EmployeeProfile() {
  const { getEmployees } = useEmployeesList();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locationId } = useLocation();
  const [employee, setEmployee] = useState(null);

  useLayoutEffect(() => {
    setEmployee(getEmployees.find((e) => e.id === id));
  }, [getEmployees, id]);

  if (!employee) {
    return null;
  }

  return (
    <Layout>
      <PageHeader
        className="site-page-header-responsive"
        onBack={() => navigate(`/location/${locationId}/apps/employees`)}
        title={`${employee.name} ${employee.lastName}`}
        avatar={{
          src: employee.avatar,
          icon: <UserOutlined />,
          alt: employee.name,
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
              <EmployeeContactPanel employee={employee} />
              <EmployeeRolePanel
                employee={
                  { ...employee, role: "employee" } as Employee & {
                    role: "employee";
                  }
                }
              />
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
