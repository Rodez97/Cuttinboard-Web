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
  Divider,
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
import ManagePositions from "./ManagePositions";
import { GrayPageHeader } from "../../components/PageHeaders";

function Employees() {
  const { getEmployees } = useEmployeesList();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const { user } = useCuttinboard();
  const [managePositionsOpen, setManagePositionsOpen] = useState(false);
  const { isOwner, isAdmin, location } = useLocation();
  const navigate = useNavigate();

  const addPrimaryOwner = async () => {
    await location.ownerJoin(true);
  };

  const removePrimaryOwner = () => {
    Modal.confirm({
      title: t("Are you sure you want to leave this location?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await location.ownerJoin();
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
      await location.supervisorJoin(true);
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
          await location.supervisorJoin();
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
      <Space
        align="center"
        wrap
        css={{ justifyContent: "space-evenly", padding: "10px 5px" }}
      >
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
          onClear={() => setSelectedTag(null)}
          placeholder={t("Filter by position")}
          allowClear
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
      <Layout.Content>
        <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
          <div
            css={{
              minWidth: 300,
              maxWidth: 700,
              margin: "auto",
              width: "100%",
            }}
          >
            <List>
              {isOwner && !getEmployees?.some((e) => e.id === user.uid) && (
                <Button type="dashed" onClick={addPrimaryOwner} block>
                  {t("Join this location")}
                </Button>
              )}
              {isAdmin && !getEmployees?.some((e) => e.id === user.uid) && (
                <Button type="dashed" onClick={joinSupervisor} block>
                  {t("Join this location")}
                </Button>
              )}

              {isOwner && getEmployees?.some((e) => e.id === user.uid) && (
                <Button type="dashed" danger onClick={removePrimaryOwner} block>
                  {t("Leave this location")}
                </Button>
              )}
              {isAdmin && getEmployees?.some((e) => e.id === user.uid) && (
                <Button type="dashed" danger onClick={leaveSupervisor} block>
                  {t("Leave this location")}
                </Button>
              )}

              {getEmployeeByRole(RoleAccessLevels.OWNER)?.length > 0 && (
                <Divider orientation="left">
                  {t(getRoleTextByNumber(RoleAccessLevels.OWNER))}
                </Divider>
              )}

              {getEmployeeByRole(RoleAccessLevels.OWNER)?.map((emp, i) => (
                <EmployeeCard key={i} employee={emp} />
              ))}

              {getEmployeeByRole(RoleAccessLevels.ADMIN)?.length > 0 && (
                <Divider orientation="left">
                  {t(getRoleTextByNumber(RoleAccessLevels.ADMIN))}
                </Divider>
              )}

              {getEmployeeByRole(RoleAccessLevels.ADMIN)?.map((emp, i) => (
                <EmployeeCard key={i} employee={emp} />
              ))}

              {getEmployeeByRole(RoleAccessLevels.GENERAL_MANAGER)?.length >
                0 && (
                <Divider orientation="left">
                  {t(getRoleTextByNumber(RoleAccessLevels.GENERAL_MANAGER))}
                </Divider>
              )}

              {getEmployeeByRole(RoleAccessLevels.GENERAL_MANAGER)?.map(
                (emp, i) => (
                  <EmployeeCard key={i} employee={emp} />
                )
              )}

              {getEmployeeByRole(RoleAccessLevels.MANAGER)?.length > 0 && (
                <Divider orientation="left">
                  {t(getRoleTextByNumber(RoleAccessLevels.MANAGER))}
                </Divider>
              )}

              {getEmployeeByRole(RoleAccessLevels.MANAGER)?.map((emp, i) => (
                <EmployeeCard key={i} employee={emp} />
              ))}

              {getEmployeeByRole(RoleAccessLevels.STAFF)?.length > 0 && (
                <Divider orientation="left">
                  {t(getRoleTextByNumber(RoleAccessLevels.STAFF))}
                </Divider>
              )}

              {getEmployeeByRole(RoleAccessLevels.STAFF)?.map((emp, i) => (
                <EmployeeCard key={i} employee={emp} />
              ))}
            </List>
          </div>
        </div>
      </Layout.Content>
      <ManagePositions
        open={managePositionsOpen}
        onClose={() => setManagePositionsOpen(false)}
      />
    </Layout>
  );
}

export default Employees;
