/** @jsx jsx */
import { jsx } from "@emotion/react";
import styled from "@emotion/styled";
import { Col, Layout, Row, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import AllWhiteLogo from "../assets/images/allWhiteLogo.svg";
import authImage from "../assets/images/authImage.jpg";
import AuthFooter from "./AuthFooter";
import AuthRouter from ".";

const ImageColumn = styled(Col)`
  background-image: linear-gradient(0deg, #00000050, #00000050),
    url(${authImage});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  color: #fff;
`;

const LeftPanel = styled(Space)`
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding: 20px;
`;

function AuthWrapper() {
  const { t } = useTranslation();
  return (
    <Layout>
      <Row css={{ flex: 1 }}>
        <ImageColumn xs={0} md={12}>
          <LeftPanel direction="vertical">
            <AllWhiteLogo height={30} />
            <div
              css={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Typography.Title
                css={{
                  color: "#fff !important",
                  maxWidth: 500,
                  textAlign: "center",
                }}
              >
                {t("The Digital Workspace for Restaurants")}
              </Typography.Title>
            </div>
            <Typography.Link
              css={{
                color: "#fff !important",
              }}
              underline
              href="https://cuttinboard.com"
              target="_blank"
            >
              cuttinboard.com
            </Typography.Link>
          </LeftPanel>
        </ImageColumn>
        <Col
          xs={24}
          md={12}
          css={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            css={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <AuthRouter />
          </div>
          <AuthFooter />
        </Col>
      </Row>
    </Layout>
  );
}

export default AuthWrapper;
