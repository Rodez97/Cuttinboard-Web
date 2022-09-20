import { useNotificationsBadges } from "@cuttinboard/cuttinboard-library/services";
import { Avatar, Badge, Card, Tooltip } from "antd";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface IAppCard {
  name: string;
  path: string;
  icon: ReactNode;
  description: string;
  shortDescription: string;
  badge?: "conv" | "task" | "sch";
}

function AppCard({
  name,
  icon,
  description,
  shortDescription,
  path,
  badge,
}: IAppCard) {
  const navigate = useNavigate();
  const { getBadgeByModule } = useNotificationsBadges();
  const { t } = useTranslation();
  return (
    <Tooltip title={t(description)}>
      <Badge count={badge && getBadgeByModule(badge)}>
        <Card
          style={{
            width: 300,
          }}
          hoverable
          onClick={() => navigate(path)}
        >
          <Card.Meta
            avatar={<Avatar src={icon} shape="square" />}
            title={t(name)}
            description={shortDescription}
          />
        </Card>
      </Badge>
    </Tooltip>
  );
}

export default AppCard;
