import { Layout, Menu, Typography } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  { key: "/", label: <Link to="/">Home</Link> },
  { key: "/about", label: <Link to="/about">About</Link> },
  { key: "/services", label: <Link to="/services">Services</Link> },
  { key: "/contact", label: <Link to="/contact">Contact</Link> },
  { key: "/tenant-signup", label: <Link to="/tenant-signup">Tenant Signup</Link> },
];

export default function OnboardingShell() {
  const location = useLocation();
  const selectedKey =
    menuItems.find((item) => location.pathname === item.key)?.key ?? "";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: "#ffffff",
          borderBottom: "1px solid #f0f0f0",
          paddingInline: 20,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Repromas
        </Title>
        <Menu
          mode="horizontal"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, justifyContent: "flex-end" }}
        />
      </Header>
      <Content style={{ padding: "24px 16px" }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <Text type="secondary">Repromas Onboarding</Text>
      </Footer>
    </Layout>
  );
}
