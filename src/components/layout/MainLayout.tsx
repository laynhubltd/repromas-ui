import { AppIcon } from "@/shared/ui/AppIcon";
import {
  Breadcrumb,
  Button,
  Divider,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  theme,
} from "antd";
import type { MenuProps } from "antd";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RepromasLogo } from "./RepromasLogo";
import { SidebarIllustration } from "./SidebarIllustration";
import type { MainLayoutProps } from "./types";

const { Header, Sider, Content } = Layout;

export default function MainLayout({
  children,
  menuItems,
  bottomMenuItems,
  sidebarBackground,
  bottomSectionLabel = "CONFIGURATION",
  userMenuItems,
  userDisplayName,
  userRoleLabel,
  userAvatarUrl,
  userFirstName,
  userLastName,
  userEmail,
}: MainLayoutProps) {
  const { token } = theme.useToken();
  const siderBg = sidebarBackground ?? token.colorPrimary;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route-derived breadcrumbs: labels resolved from the sidebar menu items,
  // falling back to a humanised path segment for routes not in the menu.
  const breadcrumbItems = useMemo(() => {
    const labelByKey = new Map<string, React.ReactNode>();
    const collect = (items?: MenuProps["items"]) => {
      items?.forEach((item) => {
        if (!item) return;
        const key = "key" in item && item.key != null ? String(item.key) : null;
        const label = "label" in item ? item.label : null;
        if (key && label != null) labelByKey.set(key, label);
        if ("children" in item) collect(item.children as MenuProps["items"]);
      });
    };
    collect(menuItems);
    collect(bottomMenuItems);

    const segments = location.pathname.split("/").filter(Boolean);
    return segments.map((segment, i) => {
      const path = "/" + segments.slice(0, i + 1).join("/");
      const humanised =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      return { title: labelByKey.get(path) ?? humanised };
    });
  }, [location.pathname, menuItems, bottomMenuItems]);

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
            {collapsed && !isMobile ? "" : bottomSectionLabel}
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
            background: siderBg,
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
            background: siderBg,
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
            padding: isMobile ? "0 12px" : "0 24px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 100,
            height: 64,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: scrolled ? token.boxShadowTertiary : "none",
            transition: "box-shadow 0.2s ease",
          }}
        >
          {/* ── Left: navigation toggle + page context ─────────────── */}
          <Button
            type="text"
            aria-label={
              (isMobile ? mobileMenuVisible : !collapsed)
                ? "Collapse navigation"
                : "Open navigation"
            }
            icon={
              <AppIcon
                name={
                  (isMobile ? mobileMenuVisible : !collapsed)
                    ? "sidebar-left"
                    : "sidebar-right"
                }
                size="lg"
              />
            }
            onClick={() =>
              isMobile
                ? setMobileMenuVisible((v) => !v)
                : setCollapsed((c) => !c)
            }
            style={{
              width: 40,
              height: 40,
              color: token.colorText,
              flexShrink: 0,
            }}
          />

          {!isMobile && breadcrumbItems.length > 0 && (
            <>
              <Divider type="vertical" style={{ height: 24, margin: 0 }} />
              <Breadcrumb items={breadcrumbItems} />
            </>
          )}

          {/* Spacer: pushes utilities right, keeps the centre breathable.
              Future utilities (notifications, theme toggle) mount after it. */}
          <div style={{ flex: 1 }} />

          {/* ── Right: user account menu ───────────────────────────── */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button
              type="text"
              aria-label={`Account menu for ${userDisplayName}`}
              style={{
                height: 48,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: token.borderRadiusLG,
              }}
            >
              <UserAvatar
                src={userAvatarUrl}
                firstName={userFirstName}
                lastName={userLastName}
                email={userEmail}
                displayName={userDisplayName}
                size={36}
              />
              {!isMobile && (
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    lineHeight: 1.3,
                  }}
                >
                  <span
                    style={{
                      color: token.colorText,
                      fontWeight: 600,
                      fontSize: token.fontSize,
                      maxWidth: 160,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {userDisplayName}
                  </span>
                  {userRoleLabel && (
                    <span
                      style={{
                        color: token.colorTextSecondary,
                        fontSize: token.fontSizeSM,
                        fontWeight: 400,
                      }}
                    >
                      {userRoleLabel}
                    </span>
                  )}
                </span>
              )}
              {!isMobile && (
                <AppIcon
                  name="arrow-down-plain"
                  size="sm"
                  color={token.colorTextTertiary}
                />
              )}
            </Button>
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
