import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Drawer, Dropdown, Layout, Menu, theme } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RepromasLogo } from "./RepromasLogo";
import { SidebarIllustration } from "./SidebarIllustration";
import type { MainLayoutProps } from "./types";

const { Header, Sider, Content } = Layout;

export default function MainLayout({
  children,
  menuItems,
  bottomMenuItems,
  userMenuItems,
  userDisplayName,
}: MainLayoutProps) {
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMobileMenuVisible(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) setMobileMenuVisible(false);
  };

  const menuContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          height: collapsed && !isMobile ? 64 : 80,
          margin: 16,
          marginBottom: 24,
          flexShrink: 0,
          background: "transparent",
          borderRadius: token.borderRadius,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
          padding: collapsed && !isMobile ? 0 : "0 12px",
          transition: "all 0.2s",
          position: "relative",
          zIndex: 1,
        }}
      >
        <RepromasLogo collapsed={collapsed && !isMobile} lightText />
      </div>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          position: "relative",
          zIndex: 1,
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            background: "transparent",
            flex: 1,
          }}
        />
      </div>
      {bottomMenuItems && bottomMenuItems.length > 0 && (
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 12,
            marginTop: 8,
            marginLeft: 12,
            marginRight: 12,
            marginBottom: 16,
            position: "relative",
            zIndex: 1,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.5)",
              marginBottom: 8,
              paddingLeft: collapsed && !isMobile ? 0 : 12,
              textAlign: collapsed && !isMobile ? "center" : "left",
            }}
          >
            {collapsed && !isMobile ? "" : "CONFIGURATION"}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={bottomMenuItems}
            onClick={handleMenuClick}
            style={{
              borderRight: 0,
              background: "transparent",
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          breakpoint="lg"
          collapsedWidth={80}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            background: token.colorPrimary,
            borderRight: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <SidebarIllustration />
          {menuContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          title={
            <span
              style={{
                color: token.colorText,
                fontWeight: token.fontWeightStrong,
              }}
            >
              Repromas
            </span>
          }
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          bodyStyle={{
            padding: 0,
            background: token.colorPrimary,
            position: "relative",
          }}
          headerStyle={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: "16px 24px",
          }}
          style={{ zIndex: 1000 }}
        >
          <SidebarIllustration />
          {menuContent}
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 250,
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{
            padding: isMobile ? "0 16px" : "0 24px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={
              isMobile ? (
                mobileMenuVisible ? (
                  <MenuFoldOutlined />
                ) : (
                  <MenuUnfoldOutlined />
                )
              ) : collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={() =>
              isMobile
                ? setMobileMenuVisible((v) => !v)
                : setCollapsed((c) => !c)
            }
            style={{
              fontSize: 18,
              width: isMobile ? 48 : 64,
              height: 64,
              color: token.colorText,
            }}
          />
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: token.borderRadius,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = token.colorBgElevated;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ background: token.colorPrimary }}
              />
              {!isMobile && (
                <span
                  style={{
                    color: token.colorText,
                    fontWeight: 500,
                  }}
                >
                  {userDisplayName}
                </span>
              )}
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: isMobile ? "16px 8px" : "24px 16px",
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            paddingBottom: 24,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
