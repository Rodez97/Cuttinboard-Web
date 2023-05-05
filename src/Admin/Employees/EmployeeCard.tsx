/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Dropdown, MenuProps, Modal, Skeleton, Tag } from "antd";
import {
  ExclamationCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  MinusOutlined,
  MoreOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { GrayPageHeader, UserInfoElement } from "../../shared";
import EmployeeContactDialog from "./EmployeeContactDialog";
import {
  useCuttinboard,
  useCuttinboardLocation,
  useDisclose,
  useEmployees,
  useLocationPermissions,
} from "@cuttinboard-solutions/cuttinboard-library";
import AvatarPlaceholder from "../../shared/atoms/AvatarPlaceholder";
import {
  CompareRoles,
  getEmployeeFullName,
  IEmployee,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

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
      <Skeleton loading={!employee} active>
        <GrayPageHeader
          css={cardStyle}
          avatar={{
            src: employee.avatar,
            onClick: handleAvatarClick,
            style: { cursor: "pointer" },
            icon: <AvatarPlaceholder userId={employee.id} />,
          }}
          subTitle={getEmployeeFullName(employee)}
          extra={
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
          }
          footer={
            getPositions.length
              ? getPositions.map((pos) => (
                  <Tag key={pos} color="processing">
                    {pos}
                  </Tag>
                ))
              : undefined
          }
        />
      </Skeleton>
      <EmployeeContactDialog
        employee={employee}
        open={infoOpen}
        onCancel={closeInfo}
        footer={null}
      />
    </React.Fragment>
  );
}

const cardStyle = css`
  margin-bottom: 4px;
  .ant-page-header-footer {
    margin-top: 0;
  }
`;

export default EmployeeCard;
