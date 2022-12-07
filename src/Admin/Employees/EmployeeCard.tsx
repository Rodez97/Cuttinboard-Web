/** @jsx jsx */
import { jsx } from "@emotion/react";
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
  UserOutlined,
} from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { GrayPageHeader, UserInfoElement } from "../../components";
import EmployeeContactDialog from "./EmployeeContactDialog";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  CompareRoles,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library/utils";

interface EmployeeCardProps {
  employee: Employee;
}

function EmployeeCard({ employee }: EmployeeCardProps) {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { locationAccessKey } = useCuttinboardLocation();
  const [infoOpen, openInfo, closeInfo] = useDisclose();

  const handleRemoveEmployee = async () => {
    Modal.confirm({
      title: t(
        "Are you sure you want to eliminate this user from the location?"
      ),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await employee.delete();
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  const compareRoles = useMemo(() => {
    return CompareRoles(locationAccessKey.role, Number(employee.locationRole));
  }, [locationAccessKey, employee]);

  const items: MenuProps["items"] = [
    {
      label: t("Contact Information"),
      key: "ci",
      icon: <InfoCircleOutlined />,
      onClick: openInfo,
    },
  ];

  const manageItems: MenuProps["items"] = [
    {
      type: "divider",
    },
    {
      label: <Link to={`s/${employee.id}`}>{t("Role and Positions")}</Link>,
      key: "es",
      icon: <TagOutlined />,
    },
    {
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
  ];

  const handleAvatarClick = () => {
    Modal.info({
      title: t("User Info"),
      content: <UserInfoElement employee={employee} />,
    });
  };

  const getPositions = () => {
    return employee.positions.filter(
      (position) => position !== employee.mainPosition
    );
  };

  return (
    <React.Fragment>
      <Skeleton loading={!employee} active>
        <GrayPageHeader
          css={{
            marginBottom: 4,
          }}
          avatar={{
            src: employee.avatar,
            onClick: handleAvatarClick,
            style: { cursor: "pointer" },
            icon: <UserOutlined />,
          }}
          subTitle={employee.fullName}
          extra={
            <Dropdown
              menu={{
                items: [
                  ...items,
                  ...(employee.id !== user?.uid && compareRoles
                    ? manageItems
                    : []),
                ],
              }}
              trigger={["click"]}
            >
              <Button type="text" shape="circle" icon={<MoreOutlined />} />
            </Dropdown>
          }
          tags={
            employee.mainPosition
              ? [
                  <Tag key="mainPosition" color="gold">
                    {employee.mainPosition}
                  </Tag>,
                ]
              : []
          }
          footer={
            getPositions().length
              ? getPositions().map((pos) => (
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

export default EmployeeCard;
