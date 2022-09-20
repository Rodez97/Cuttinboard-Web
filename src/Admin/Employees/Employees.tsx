/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TitleBoxBlue,
  TitleBoxGreen,
  TitleBoxOwner,
  TitleBoxYellow,
} from "../../theme/styledComponents";
import EmployeeCard from "./EmployeeCard";
import { useNavigate } from "react-router-dom";
import { matchSorter } from "match-sorter";
import { getRoleTextByNumber } from "./employee-utils";
import {
  useCuttinboard,
  useEmployeesList,
  useEmployeesManager,
  useLocation,
} from "@cuttinboard/cuttinboard-library/services";
import {
  Positions,
  RoleAccessLevels,
} from "@cuttinboard/cuttinboard-library/utils";
import { Employee } from "@cuttinboard/cuttinboard-library/models";
import {
  AutoComplete,
  Button,
  Col,
  Input,
  Layout,
  List,
  Modal,
  PageHeader,
  Row,
  Space,
  Tooltip,
} from "antd";
import { ExclamationCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import Icon from "@ant-design/icons";
import AccountGroupOutline from "@mdi/svg/svg/account-group-outline.svg";
import { recordError } from "../../utils/utils";
import { deleteField, doc, setDoc } from "firebase/firestore";
import { Auth, Firestore } from "@cuttinboard/cuttinboard-library/firebase";

function Employees() {
  const { getEmployees } = useEmployeesList();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const { user } = useCuttinboard();
  const { isOwner, usage, locationId, isAdmin, location } = useLocation();
  const [result, setResult] = useState<string[]>([]);
  const { addPrimaryOwnerAsGeneralManager, removePrimaryOwnerAsEmployee } =
    useEmployeesManager();
  const navigate = useNavigate();

  const addPrimaryOwner = async () => {
    await addPrimaryOwnerAsGeneralManager();
  };

  const removePrimaryOwner = () => {
    Modal.confirm({
      title: t("Are you sure you want to leave this location?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await removePrimaryOwnerAsEmployee();
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const getEmployeeByRole = useCallback(
    (role: RoleAccessLevels) => {
      const byRole: Employee[] = matchSorter(getEmployees, role.toString(), {
        keys:
          role === RoleAccessLevels.OWNER || role === RoleAccessLevels.ADMIN
            ? [`role`]
            : [`locations.${locationId}.role`],
      });
      const byName = searchText
        ? matchSorter(byRole, searchText, {
            keys: ["name", "lastName"],
          })
        : byRole;

      return selectedTag
        ? matchSorter(byName, selectedTag, {
            keys: [`locations.${locationId}.pos`],
          })
        : byName;
    },
    [searchText, selectedTag, getEmployees]
  );

  const handleSearch = (value: string) => {
    let res: string[] = [];
    if (!value) {
      res = [];
    } else {
      const sortedPos = matchSorter(Positions, value);
      if (sortedPos.length) {
        res = sortedPos;
      } else {
        res = [value];
      }
    }
    setResult(res);
  };

  const joinSupervisor = async () => {
    try {
      await setDoc(
        doc(
          Firestore,
          "Organizations",
          location.organizationId,
          "employees",
          Auth.currentUser.uid
        ),
        { locations: { [locationId]: true } },
        { merge: true }
      );
    } catch (error) {
      recordError(error);
    }
  };

  const leaveSupervisor = async () => {
    Modal.confirm({
      title: t("Are you sure you want to leave this location?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await setDoc(
            doc(
              Firestore,
              "Organizations",
              location.organizationId,
              "employees",
              Auth.currentUser.uid
            ),
            { locations: { [locationId]: deleteField() } },
            { merge: true }
          );
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  return (
    <Layout>
      <PageHeader
        className="site-page-header-responsive"
        onBack={() => navigate(-1)}
        avatar={{ icon: <Icon component={AccountGroupOutline} /> }}
        title={t("Employees")}
        subTitle={`${usage.employeesCount} / ${usage.employeesLimit}`}
        extra={[
          <Tooltip
            key="1"
            title={
              usage.employeesCount === usage.employeesLimit &&
              t("Limit Reached")
            }
          >
            <Button
              icon={<UserAddOutlined />}
              onClick={() => navigate(`create`)}
              type="primary"
              disabled={usage.employeesCount === usage.employeesLimit}
            >
              {t("Add Employee")}
            </Button>
          </Tooltip>,
        ]}
      />
      <Space align="center" wrap css={{ justifyContent: "space-evenly" }}>
        <Input.Search
          placeholder={t("Search")}
          allowClear
          onChange={({ currentTarget }) => setSearchText(currentTarget.value)}
          value={searchText}
          css={{ width: 200 }}
        />
        <AutoComplete
          css={{ width: 200 }}
          onSearch={handleSearch}
          placeholder={t("Filter by position")}
          onSelect={setSelectedTag}
        >
          {result.map((position: string) => (
            <AutoComplete.Option key={position} value={position}>
              {position}
            </AutoComplete.Option>
          ))}
        </AutoComplete>
      </Space>

      <Layout.Content
        css={{
          paddingBottom: 30,
        }}
      >
        <Row justify="center" css={{ paddingBottom: "50px" }}>
          <Col xs={24} md={20} lg={16} xl={12}>
            <List css={{ padding: "20px 10px" }}>
              {isOwner && !getEmployees?.some((e) => e.id === user.uid) && (
                <Button type="dashed" onClick={addPrimaryOwner} block>
                  {t("Join this location")}
                </Button>
              )}
              {isOwner && getEmployees?.some((e) => e.id === user.uid) && (
                <Button type="dashed" danger onClick={removePrimaryOwner} block>
                  {t("Leave this location")}
                </Button>
              )}

              {getEmployeeByRole(RoleAccessLevels.OWNER)?.length > 0 && (
                <TitleBoxOwner>
                  {t(getRoleTextByNumber(RoleAccessLevels.OWNER))}
                </TitleBoxOwner>
              )}

              {getEmployeeByRole(RoleAccessLevels.OWNER)?.map((emp, i) => (
                <EmployeeCard key={i} employee={emp} />
              ))}

              {isAdmin && !getEmployees?.some((e) => e.id === user.uid) && (
                <Button type="dashed" onClick={joinSupervisor} block>
                  {t("Join this location")}
                </Button>
              )}
              {isAdmin && getEmployees?.some((e) => e.id === user.uid) && (
                <Button type="dashed" danger onClick={leaveSupervisor} block>
                  {t("Leave this location")}
                </Button>
              )}

              {getEmployeeByRole(RoleAccessLevels.ADMIN)?.length > 0 && (
                <TitleBoxOwner>
                  {t(getRoleTextByNumber(RoleAccessLevels.ADMIN))}
                </TitleBoxOwner>
              )}

              {getEmployeeByRole(RoleAccessLevels.ADMIN)?.map((emp, i) => (
                <EmployeeCard key={i} employee={emp} />
              ))}

              {getEmployeeByRole(RoleAccessLevels.GENERAL_MANAGER)?.length >
                0 && (
                <TitleBoxBlue>
                  {t(getRoleTextByNumber(RoleAccessLevels.GENERAL_MANAGER))}
                </TitleBoxBlue>
              )}

              {getEmployeeByRole(RoleAccessLevels.GENERAL_MANAGER)?.map(
                (emp, i) => (
                  <EmployeeCard key={i} employee={emp} />
                )
              )}

              {getEmployeeByRole(RoleAccessLevels.MANAGER)?.length > 0 && (
                <TitleBoxGreen>
                  {t(getRoleTextByNumber(RoleAccessLevels.MANAGER))}
                </TitleBoxGreen>
              )}

              {getEmployeeByRole(RoleAccessLevels.MANAGER)?.map((emp, i) => (
                <EmployeeCard key={i} employee={emp} />
              ))}

              {getEmployeeByRole(RoleAccessLevels.STAFF)?.length > 0 && (
                <TitleBoxYellow>
                  {t(getRoleTextByNumber(RoleAccessLevels.STAFF))}
                </TitleBoxYellow>
              )}

              {getEmployeeByRole(RoleAccessLevels.STAFF)?.map((emp, i) => (
                <EmployeeCard key={i} employee={emp} />
              ))}
            </List>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
}

export default Employees;
