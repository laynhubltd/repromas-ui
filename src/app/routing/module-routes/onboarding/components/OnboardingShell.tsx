import { MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Grid, Layout, Menu, Typography } from "antd";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const navMenuItems = [
  { key: "/", label: <Link to="/">Home</Link> },
  { key: "/about", label: <Link to="/about">About</Link> },
  { key: "/services", label: <Link to="/services">Services</Link> },
  { key: "/contact", label: <Link to="/contact">Contact</Link> },
  { key: "/tenant-signup", label: <Link to="/tenant-signup">Tenant Signup</Link> },
];

export default function OnboardingShell() {
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedKey =
    navMenuItems.find((item) => location.pathname === item.key)?.key ?? "";

  const drawerMenuItems = navMenuItems.map((item) => ({
    ...item,
    onClick: () => setDrawerOpen(false),
  }));

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
        {isMobile ? (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
        ) : (
          <Menu
            mode="horizontal"
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={navMenuItems}
            style={{ flex: 1, minWidth: 0, justifyContent: "flex-end" }}
          />
        )}
      </Header>

      <Drawer
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Menu"
      >
        <Menu
          mode="vertical"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={drawerMenuItems}
        />
      </Drawer>

      <Content style={{ padding: 0 }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <Text type="secondary">Repromas Onboarding</Text>
      </Footer>
    </Layout>
  );
}
