/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Dropdown, MenuProps, Modal, Tag, Typography } from "antd";
import {
  ExclamationCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  MinusOutlined,
  MoreOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { UserInfoElement } from "../../shared";
import EmployeeContactDialog from "./EmployeeContactDialog";
import {
  useCuttinboard,
  useCuttinboardLocation,
  useDisclose,
  useEmployees,
  useLocationPermissions,
} from "@cuttinboard-solutions/cuttinboard-library";
import {
  CompareRoles,
  getEmployeeFullName,
  IEmployee,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import CuttinboardAvatar from "../../shared/atoms/Avatar";
import styled from "@emotion/styled";

interface EmployeeCardProps {
  employee: IEmployee;
}

function EmployeeCard({ employee }: EmployeeCardProps) {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { role } = useCuttinboardLocation();
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const { deleteEmployee } = useEmployees();
  const checkPermission = useLocationPermissions();

  const handleRemoveEmployee = async () => {
    Modal.confirm({
      title: t(
        "Are you sure you want to eliminate this user from the location?"
      ),
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deleteEmployee(employee);
      },
    });
  };

  const compareRoles = useMemo(() => {
    return (
      CompareRoles(role, employee.role) &&
      employee.role !== RoleAccessLevels.ADMIN
    );
  }, [employee, role]);

  const items: MenuProps["items"] = [
    {
      label: t("Contact Information"),
      key: "ci",
      icon: <InfoCircleOutlined />,
      onClick: openInfo,
    },
  ];

  const manageItems = [
    {
      type: "divider",
    },
    {
      label: <Link to={`s/${employee.id}`}>{t("Employee settings")}</Link>,
      key: "es",
      icon: <TagOutlined />,
    },
    checkPermission("manageStaffDocuments") && {
      label: <Link to={`d/${employee.id}`}>{t("Documents")}</Link>,
      key: "ed",
      icon: <FileTextOutlined />,
    },
    {
      label: t("Remove"),
      key: "re",
      danger: true,
      onClick: handleRemoveEmployee,
      icon: <MinusOutlined />,
    },
  ].filter(Boolean) as MenuProps["items"];

  const handleAvatarClick = () => {
    Modal.info({
      title: (
        <span css={{ textAlign: "center", display: "block" }}>
          {t("User Info")}
        </span>
      ),
      content: <UserInfoElement employee={employee} />,
      icon: null,
      className: "user-info-modal",
      bodyStyle: {
        maxWidth: "100%",
      },
    });
  };

  const getPositions = useMemo(
    () =>
      employee.positions?.filter(
        (position) => position !== employee.mainPosition
      ) || [],
    [employee]
  );

  return (
    <React.Fragment>
      <Container>
        <Content>
          <LeftContent>
            <EmployeeAvatar
              src={employee.avatar}
              // If there is no avatar, we will use the email to fetch the gravatars
              alt={getEmployeeFullName(employee)}
              onClick={handleAvatarClick}
            />
            <Name>{getEmployeeFullName(employee)}</Name>
          </LeftContent>

          <Dropdown
            menu={{
              items: [
                ...items,
                ...(employee.id !== user.uid && compareRoles && manageItems
                  ? manageItems
                  : []),
              ],
            }}
            trigger={["click"]}
          >
            <Button type="text" shape="circle" icon={<MoreOutlined />} />
          </Dropdown>
        </Content>
        <TagsContainer>
          {getPositions.map((pos) => (
            <Tag key={pos} color="processing">
              {pos}
            </Tag>
          ))}
        </TagsContainer>
      </Container>
      <EmployeeContactDialog
        employee={employee}
        open={infoOpen}
        onCancel={closeInfo}
        footer={null}
      />
    </React.Fragment>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fbfbfa;
  padding: 6px 16px;
  margin: 0px 0px 4px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-block: 5px;
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const Name = styled(Typography.Text)`
  margin-left: 10px;
  color: rgba(0, 0, 0, 0.65);
`;

const EmployeeAvatar = styled(CuttinboardAvatar)`
  cursor: pointer;
`;

export default EmployeeCard;
