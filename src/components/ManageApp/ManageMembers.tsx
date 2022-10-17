/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  PrivacyLevel,
  Employee,
  useLocation,
  RoleAccessLevels,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useNavigate } from "react-router-dom";
import AddMembers from "./AddMembers";
import MemberItem from "./MemberItem";
import SelectEmployee from "./SelectEmployee";
import { indexOf } from "lodash";
import {
  Button,
  Divider,
  Layout,
  List,
  Modal,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { ExclamationCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { GrayPageHeader } from "../PageHeaders";

interface ManageMembersProps {
  readonly?: boolean;
  members: string[];
  removeMember: (employeeId: string) => void;
  addMembers: (addedEmployees: Employee[]) => void;
  setAppHost: (newHostUser: Employee) => void;
  removeHost: (hostUser: Employee) => void;
  privacyLevel: PrivacyLevel;
  positions?: string[];
  hosts?: string[];
}

function ManageMembers({
  readonly,
  removeMember,
  addMembers,
  setAppHost,
  removeHost,
  privacyLevel,
  positions,
  hosts,
  members,
}: ManageMembersProps) {
  const { t } = useTranslation();
  const { locationAccessKey, location } = useLocation();
  const navigate = useNavigate();
  const { getEmployees } = useEmployeesList();

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
    let membersList: Employee[] = [];
    if (privacyLevel === PrivacyLevel.PRIVATE) {
      membersList = getEmployees.filter((emp) => indexOf(members, emp.id) > -1);
    }
    if (privacyLevel === PrivacyLevel.PUBLIC) {
      membersList = getEmployees;
    }
    if (privacyLevel === PrivacyLevel.POSITIONS) {
      membersList = getEmployees.filter((emp) => emp.hasAnyPosition(positions));
    }
    return membersList.filter((m) => !hosts?.includes(m.id));
  }, [getEmployees, privacyLevel, members, positions, hosts]);

  const hostsList = useMemo(() => {
    if (!Boolean(hosts?.length)) {
      return [];
    }
    return getEmployees.filter((e) => hosts?.indexOf(e.id) > -1);
  }, [getEmployees, hosts]);

  const handleSetHost = (newHost: Employee) => {
    setAppHost(newHost);
    navigate(-1);
  };

  const handleRemoveHost = async (host: Employee) => {
    Modal.confirm({
      title: t("Are you sure you want to remove this host?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          removeHost(host);
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
            <Layout>
              <GrayPageHeader
                onBack={() => navigate(-1)}
                title={t("Members")}
                extra={[
                  <Tooltip key="1" title={t("Add Members")}>
                    <Button
                      icon={<UserAddOutlined />}
                      onClick={() => navigate(`add`)}
                      type="primary"
                      hidden={privacyLevel !== PrivacyLevel.PRIVATE || readonly}
                    >
                      {t("Add Members")}
                    </Button>
                  </Tooltip>,
                ]}
              />
              <Layout.Content>
                <div
                  css={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 20,
                  }}
                >
                  <div
                    css={{
                      minWidth: 300,
                      maxWidth: 600,
                      margin: "auto",
                      width: "100%",
                    }}
                  >
                    {/* 🛡 Host */}
                    {(Boolean(hostsList.length) ||
                      locationAccessKey.role <=
                        RoleAccessLevels.GENERAL_MANAGER) && (
                      <Divider orientation="left">{t("Host")}</Divider>
                    )}

                    {Boolean(hostsList.length) && (
                      <List
                        dataSource={hostsList}
                        renderItem={(hostUser) => (
                          <MemberItem
                            key={hostUser.id}
                            employee={hostUser}
                            onRemove={() => handleRemoveHost(hostUser)}
                            hosts={hosts}
                            privacyLevel={privacyLevel}
                          />
                        )}
                      />
                    )}
                    {locationAccessKey.role <=
                      RoleAccessLevels.GENERAL_MANAGER && (
                      <Button
                        type="dashed"
                        block
                        onClick={() => navigate("host")}
                      >
                        {t("Add Host")}
                      </Button>
                    )}

                    {/* Members */}
                    <Divider orientation="left">{t("Members")}</Divider>

                    {privacyLevel === PrivacyLevel.PUBLIC && (
                      <Typography.Text
                        strong
                        css={{
                          fontSize: 20,
                          textAlign: "center",
                          display: "block",
                        }}
                      >
                        {t("This is a Public element. Everyone is a member")}
                      </Typography.Text>
                    )}

                    {privacyLevel === PrivacyLevel.POSITIONS &&
                      positions?.length && (
                        <Space wrap>
                          {positions
                            .filter((p) => !p.startsWith("hostId_"))
                            .map((pos, index) => (
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
                          privacyLevel={privacyLevel}
                          readonly={
                            privacyLevel === PrivacyLevel.POSITIONS ||
                            privacyLevel === PrivacyLevel.PUBLIC ||
                            readonly
                          }
                        />
                      )}
                    />
                  </div>
                </div>
              </Layout.Content>
            </Layout>
          }
        />
        <Route
          path="add"
          element={
            <Layout>
              <GrayPageHeader
                onBack={() => navigate(-1)}
                title={t("Add Members")}
              />
              <Layout.Content>
                <AddMembers
                  onSelectedEmployees={handleAddMembers}
                  hosts={hosts}
                  initialSelected={getMembers}
                />
              </Layout.Content>
            </Layout>
          }
        />
        <Route
          path="host"
          element={
            <Layout>
              <GrayPageHeader
                onBack={() => navigate(-1)}
                title={t("Select Host")}
              />
              <Layout.Content>
                <SelectEmployee
                  onSelectedEmployee={handleSetHost}
                  hosts={hosts}
                />
              </Layout.Content>
            </Layout>
          }
        />
      </Route>
    </Routes>
  );
}

export default ManageMembers;
