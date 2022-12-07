/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Avatar, Card, Tooltip } from "antd";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface IAppCard {
  name: string;
  path: string;
  icon: ReactNode;
  description: string;
  shortDescription: string;
}

function AppCard({
  name,
  icon,
  description,
  shortDescription,
  path,
}: IAppCard) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Tooltip title={t(description)} placement="bottom">
      <Card
        css={{
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
    </Tooltip>
  );
}

export default AppCard;
