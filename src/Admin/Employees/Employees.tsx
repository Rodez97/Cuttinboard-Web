/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useCallback, useState } from "react";
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
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Positions,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  AutoComplete,
  Button,
  Input,
  Layout,
  List,
  Modal,
  Select,
  Space,
  Tooltip,
} from "antd";
import {
  ExclamationCircleOutlined,
  TagOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import Icon from "@ant-design/icons";
import AccountGroupOutline from "@mdi/svg/svg/account-group-outline.svg";
import { recordError } from "../../utils/utils";
import { deleteField, doc, setDoc } from "firebase/firestore";
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { GrayPageHeader } from "components/PageHeaders";
import ManagePositions from "./ManagePositions";

function Employees() {
  const { getEmployees } = useEmployeesList();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const { user } = useCuttinboard();
  const [managePositionsOpen, setManagePositionsOpen] = useState(false);
  const { isOwner, isAdmin, location } = useLocation();
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
            : [`locations.${location.id}.role`],
      });
      const byName = searchText
        ? matchSorter(byRole, searchText, {
            keys: ["name", "lastName"],
          })
        : byRole;

      return selectedTag
        ? matchSorter(byName, selectedTag, {
            keys: [`locations.${location.id}.pos`],
          })
        : byName;
    },
    [searchText, selectedTag, getEmployees]
  );

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
        { locations: { [location.id]: true } },
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
            { locations: { [location.id]: deleteField() } },
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
      <GrayPageHeader
        onBack={() => navigate(`/location/${location.id}/apps`)}
        avatar={{ icon: <Icon component={AccountGroupOutline} /> }}
        title={t("Employees")}
        subTitle={`${location.usage.employeesCount} / ${location.usage.employeesLimit}`}
        extra={[
          <Button
            key="ManagePositions"
            icon={<TagOutlined />}
            onClick={() => setManagePositionsOpen(true)}
            type="primary"
          >
            {t("Manage Positions")}
          </Button>,
          <Tooltip
            key="1"
            title={
              location.usage.employeesCount === location.usage.employeesLimit &&
              t("Limit Reached")
            }
          >
            <Button
              icon={<UserAddOutlined />}
              onClick={() => navigate(`create`)}
              type="primary"
              disabled={
                location.usage.employeesCount === location.usage.employeesLimit
              }
            >
              {t("Add Employee")}
            </Button>
          </Tooltip>,
        ]}
      />
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <Space align="center" wrap css={{ justifyContent: "space-evenly" }}>
          <Input.Search
            placeholder={t("Search")}
            allowClear
            onChange={({ currentTarget }) => setSearchText(currentTarget.value)}
            value={searchText}
            css={{ width: 200 }}
          />

          <Select
            showSearch
            style={{ width: 200 }}
            onSelect={setSelectedTag}
            placeholder={t("Filter by position")}
          >
            {location.settings?.positions?.length && (
              <Select.OptGroup label={t("Custom")}>
                {location.settings.positions.map((pos) => (
                  <Select.Option value={pos}>{pos}</Select.Option>
                ))}
              </Select.OptGroup>
            )}

            <Select.OptGroup label={t("Default")}>
              {Positions.map((pos) => (
                <Select.Option value={pos}>{pos}</Select.Option>
              ))}
            </Select.OptGroup>
          </Select>
        </Space>
        <div
          css={{
            minWidth: 300,
            maxWidth: 700,
            margin: "auto",
            width: "100%",
          }}
        >
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
        </div>
      </div>
      <ManagePositions
        open={managePositionsOpen}
        onClose={() => setManagePositionsOpen(false)}
      />
    </Layout>
  );
}

export default Employees;
