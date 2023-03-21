/** @jsx jsx */
import { jsx } from "@emotion/react";
import styled from "@emotion/styled";
import { Col, Layout, Row, Space, Typography } from "antd";

const ImageColumn = styled(Col)<{ image: string }>`
  background-image: linear-gradient(0deg, #00000070, #00000070),
    url(${(props) => props.image});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  color: #fff;
`;

const LeftPanel = styled(Space)`
  display: flex;
  height: 100%;
  padding: 80px 60px;
`;

interface StepLayoutProps {
  children: React.ReactNode;
  image: string;
  text: string;
  author: string;
  role: string;
}

function StepLayout({ children, image, text, author, role }: StepLayoutProps) {
  return (
    <Layout css={{ height: "100%" }}>
      <Row css={{ flex: 1 }}>
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
              //justifyContent: "center",
              flex: 1,
              paddingTop: 80,
            }}
          >
            {children}
          </div>
        </Col>
        <ImageColumn xs={0} md={12} image={image}>
          <LeftPanel direction="vertical">
            <div
              css={{
                borderLeft: "5px solid #fff",
                paddingLeft: 15,
                marginBottom: 20,
              }}
            >
              <Typography.Text
                css={{
                  color: "#fff !important",
                  fontSize: 20,
                  fontFamily: "Roboto",
                  fontStyle: "normal",
                  fontWeight: "500",
                  lineHeight: "23px",
                  letterSpacing: "0.005em",
                }}
              >
                {text}
              </Typography.Text>
            </div>

            <Typography.Text
              css={{
                color: "#fff !important",
                marginLeft: 20,
                fontSize: 16,
              }}
              strong
            >
              {author}
            </Typography.Text>

            <Typography.Text
              css={{
                color: "#FCFCFC !important",
                marginLeft: 20,
                fontSize: 14,
              }}
            >
              {role}
            </Typography.Text>
          </LeftPanel>
        </ImageColumn>
      </Row>
    </Layout>
  );
}

export default StepLayout;
