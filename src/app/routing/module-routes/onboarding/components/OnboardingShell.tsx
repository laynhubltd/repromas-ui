import { MenuOutlined } from "@ant-design/icons";
import { Button, ConfigProvider, Drawer, Form, Grid, Input, Layout, Menu, Modal, Typography } from "antd";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const PRIMARY = "#6B21A8";

const navMenuItems = [
  { key: "/", label: <Link to="/">Home</Link> },
  { key: "/about", label: <Link to="/about">About</Link> },
  { key: "/services", label: <Link to="/services">Services</Link> },
  { key: "/contact", label: <Link to="/contact">Contact</Link> },
];

const ONBOARDING_THEME = {
  token: {
    colorPrimary: PRIMARY,
  },
  components: {
    Menu: {
      itemColor: "#000000",
      itemHoverColor: "#000000",
      itemSelectedColor: PRIMARY,
      horizontalItemSelectedColor: PRIMARY,
    },
  },
};

/** Builds the tenant URL from the current browser origin + slug as subdomain */
function buildTenantUrl(slug: string): string {
  const { protocol, hostname, port } = window.location;
  const portSuffix = port ? `:${port}` : "";

  // localhost → slug.localhost:port
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${slug}.${hostname}${portSuffix}/auth/login`;
  }

  // Strip existing subdomain if any, then prepend slug
  const parts = hostname.split(".");
  const baseDomain = parts.length > 2 ? parts.slice(-2).join(".") : hostname;
  return `${protocol}//${slug}.${baseDomain}${portSuffix}/auth/login`;
}

function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form] = Form.useForm<{ slug: string }>();
  const slug = Form.useWatch("slug", form) ?? "";
  const trimmed = slug.trim().toLowerCase();
  const preview = trimmed ? buildTenantUrl(trimmed) : "";

  function handleSignIn() {
    form.validateFields().then(({ slug }) => {
      window.location.href = buildTenantUrl(slug.trim().toLowerCase());
    });
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSignIn}
      okText="Go to Sign In"
      title="Sign in to your institution"
      okButtonProps={{ size: "large" }}
      cancelButtonProps={{ size: "large" }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="slug"
          label="School slug"
          rules={[
            { required: true, message: "Please enter your school slug" },
            { pattern: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, message: "Only lowercase letters, numbers and hyphens" },
          ]}
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              e.g. <Text code style={{ fontSize: 12 }}>harvard</Text>, <Text code style={{ fontSize: 12 }}>mit-edu</Text>
            </Text>
          }
        >
          <Input
            size="large"
            placeholder="your-school"
            prefix={<Text type="secondary" style={{ fontSize: 13 }}>school /</Text>}
          />
        </Form.Item>

        {preview && (
          <div style={{
            background: "#f9f5ff",
            border: `1px solid ${PRIMARY}33`,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            color: "#374151",
          }}>
            You will be redirected to:{" "}
            <Text style={{ color: PRIMARY, fontWeight: 600, wordBreak: "break-all" }}>
              {preview}
            </Text>
          </div>
        )}
      </Form>
    </Modal>
  );
}

export default function OnboardingShell() {
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const selectedKey =
    navMenuItems.find((item) => location.pathname === item.key)?.key ?? "";

  const drawerMenuItems = navMenuItems.map((item) => ({
    ...item,
    onClick: () => setDrawerOpen(false),
  }));

  const authButtons = (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Button
        size="middle"
        onClick={() => setSignInOpen(true)}
        style={{ fontWeight: 500, borderColor: PRIMARY, color: PRIMARY }}
      >
        Sign In
      </Button>
      <Link to="/tenant-signup">
        <Button
          type="primary"
          size="middle"
          style={{ fontWeight: 500 }}
        >
          Sign Up
        </Button>
      </Link>
    </div>
  );

  return (
    <ConfigProvider theme={ONBOARDING_THEME}>
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            background: "#ffffff",
            borderBottom: "1px solid #f0f0f0",
            paddingInline: 20,
          }}
        >
          <Title level={4} style={{ margin: 0, color: PRIMARY }}>
            Repromas
          </Title>

          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
              <Menu
                mode="horizontal"
                selectedKeys={selectedKey ? [selectedKey] : []}
                items={navMenuItems}
                style={{ flex: 1, minWidth: 0, justifyContent: "flex-end", background: "transparent", borderBottom: "none" }}
              />
              {authButtons}
            </div>
          )}
        </Header>

        {/* Spacer to offset fixed header height */}
        <div style={{ height: 64 }} />

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
            style={{ borderInlineEnd: "none", marginBottom: 16 }}
          />
          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <Button block onClick={() => { setDrawerOpen(false); setSignInOpen(true); }} style={{ borderColor: PRIMARY, color: PRIMARY }}>
              Sign In
            </Button>
            <Link to="/tenant-signup" onClick={() => setDrawerOpen(false)}>
              <Button block type="primary">Sign Up</Button>
            </Link>
          </div>
        </Drawer>

        <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />

        <Content style={{ padding: 0 }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          <Text type="secondary">Repromas Onboarding</Text>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
