import {
  PrivacyLevel,
  Employee,
  useLocation,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useNavigate } from "react-router-dom";
import { TitleBoxBlue, TitleBoxGreen } from "../../theme/styledComponents";
import AddMembers from "./AddMembers";
import MemberItem from "./MemberItem";
import SelectEmployee from "./SelectEmployee";
import { differenceBy, indexOf, uniqBy } from "lodash";
import {
  Button,
  Col,
  Layout,
  List,
  Modal,
  PageHeader,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { ExclamationCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";

interface ManageMembersProps {
  readonly?: boolean;
  members: string[];
  employees: Employee[];
  orgEmployees: Employee[];
  removeMember: (employeeId: string) => void;
  addMembers: (addedEmployees: Employee[]) => void;
  setAppHost: (newHostUser: Employee) => void;
  removeHost: (hostUser: Employee) => void;
  privacyLevel: PrivacyLevel;
  positions?: string[];
  hostId?: string;
}

function ManageMembers({
  readonly,
  removeMember,
  addMembers,
  setAppHost,
  removeHost,
  privacyLevel,
  positions,
  hostId,
  members,
  employees,
  orgEmployees,
}: ManageMembersProps) {
  const { t } = useTranslation();
  const { locationAccessKey, locationId } = useLocation();
  const navigate = useNavigate();

  const handleAddMembers = (addedEmployees: Employee[]) => {
    addMembers(addedEmployees);
  };

  const handleMemberRemove = async (employeeId: string) => {
    Modal.confirm({
      title: t("Are you sure you want to remove this user?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      onOk() {
        try {
          removeMember(employeeId);
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const getMembers = useMemo(() => {
    const empList = employees ?? [];
    const orgEmpList = orgEmployees ?? [];
    let membersList: Employee[] = [];
    if (privacyLevel === PrivacyLevel.PRIVATE) {
      membersList = uniqBy([...empList, ...orgEmpList], "id").filter(
        (emp) => indexOf(members, emp.id) > -1
      );
    }
    if (privacyLevel === PrivacyLevel.PUBLIC) {
      membersList = uniqBy([...empList, ...orgEmpList], "id");
    }
    if (privacyLevel === PrivacyLevel.POSITIONS) {
      membersList = uniqBy([...empList, ...orgEmpList], "id").filter(
        (emp) =>
          emp?.role === "employee" &&
          emp?.locations?.[locationId]?.pos?.some((p) => positions?.includes(p))
      );
    }
    return membersList.filter((m) => m.id !== hostId);
  }, [orgEmployees, employees, privacyLevel, members, positions, hostId]);

  const hostUser = useMemo(() => {
    const empList = employees ?? [];
    const orgEmpList = orgEmployees ?? [];
    return uniqBy([...empList, ...orgEmpList], "id").find(
      ({ id }) => id === hostId
    );
  }, [hostId]);

  const handleSetHost = (newHost: Employee) => {
    setAppHost(newHost);
  };

  const handleRemoveHost = async () => {
    Modal.confirm({
      title: t("Are you sure you want to remove this host?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          removeHost(hostUser);
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  return (
    <Routes>
      <Route path="/">
        <Route
          index
          element={
            <Layout.Content>
              <PageHeader
                className="site-page-header-responsive"
                onBack={() => navigate(-1)}
                title={t("Members")}
                extra={[
                  <Tooltip key="1" title={t("Add Members")}>
                    <Button
                      icon={<UserAddOutlined />}
                      onClick={() => navigate(`add`)}
                      type="primary"
                      disabled={
                        privacyLevel !== PrivacyLevel.PRIVATE || readonly
                      }
                    >
                      {t("Add Members")}
                    </Button>
                  </Tooltip>,
                ]}
              />
              <Row justify="center" style={{ paddingBottom: "50px" }}>
                <Col
                  xs={24}
                  md={20}
                  lg={16}
                  xl={12}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    paddingTop: "10px",
                  }}
                >
                  {/* 🛡 Host */}
                  {(hostUser ||
                    locationAccessKey.role <=
                      RoleAccessLevels.GENERAL_MANAGER) && (
                    <TitleBoxBlue>{t("Host")}</TitleBoxBlue>
                  )}

                  {hostUser && (
                    <MemberItem
                      key={hostUser.id}
                      employee={hostUser}
                      onRemove={handleRemoveHost}
                      hostId={hostId}
                      privacyLevel={privacyLevel}
                    />
                  )}
                  {!hostUser &&
                    locationAccessKey.role <=
                      RoleAccessLevels.GENERAL_MANAGER && (
                      <Button
                        type="dashed"
                        block
                        onClick={() => navigate("host")}
                      >
                        {t("Set Host")}
                      </Button>
                    )}

                  {/* Members */}
                  <TitleBoxGreen>{t("Members")}</TitleBoxGreen>

                  {privacyLevel === PrivacyLevel.PUBLIC && (
                    <Typography.Text
                      strong
                      style={{
                        fontSize: "20px",
                        textAlign: "center",
                        display: "block",
                      }}
                    >
                      {t("This is a Public element. Everyone is a member")}
                    </Typography.Text>
                  )}

                  {privacyLevel === PrivacyLevel.POSITIONS &&
                    positions?.length && (
                      <Space size="large" wrap>
                        {positions.map((pos, index) => (
                          <Tag key={index}>{t(pos)}</Tag>
                        ))}
                      </Space>
                    )}

                  <List
                    dataSource={getMembers}
                    renderItem={(emp) => (
                      <MemberItem
                        key={emp.id}
                        employee={emp}
                        onRemove={handleMemberRemove}
                        hostId={hostId}
                        privacyLevel={privacyLevel}
                        readonly={
                          privacyLevel === PrivacyLevel.POSITIONS ||
                          privacyLevel === PrivacyLevel.PUBLIC ||
                          readonly
                        }
                      />
                    )}
                  />
                </Col>
              </Row>
            </Layout.Content>
          }
        />
        <Route
          path="add"
          element={
            <>
              <PageHeader
                className="site-page-header-responsive"
                onBack={() => navigate(-1)}
                title={t("Add Members")}
              />
              <AddMembers
                onSelectedEmployees={handleAddMembers}
                employees={differenceBy(employees, [...getMembers, hostUser])}
                orgEmployees={differenceBy(orgEmployees, [
                  ...getMembers,
                  hostUser,
                ])}
                initialSelected={getMembers}
              />
            </>
          }
        />
        <Route
          path="host"
          element={
            <>
              <PageHeader
                className="site-page-header-responsive"
                onBack={() => navigate(-1)}
                title={t("Select Host")}
              />
              <SelectEmployee
                onSelectedEmployee={handleSetHost}
                initialSelected={hostUser}
                employees={employees}
                orgEmployees={orgEmployees}
              />
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default ManageMembers;
