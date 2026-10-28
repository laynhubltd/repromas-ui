import { ConfigProvider, Drawer } from "antd";
import { Link, Outlet } from "react-router-dom";
import LockupDark from "@/assets/brand-kit/02-lockup/repromas-lockup-transparent.svg?react";
import LockupLight from "@/assets/brand-kit/02-lockup/repromas-lockup-for-dark-bg-transparent.svg?react";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { MarketingContainer, MarketingRoot, PillLink, marketingStyles } from "@/shared/ui/marketing";
import { useOnboardingShell } from "../hooks/useOnboardingShell";
import styles from "./OnboardingShell.module.css";
import SignInModal from "./SignInModal";

const ONBOARDING_THEME = {
  token: {
    colorPrimary: "#6D28D9",
    borderRadius: 12,
    fontFamily: '"Rubik", system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  },
};

function Caret() {
  return (
    <svg className={styles.caret} viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function OnboardingShell() {
  const { content, state, actions } = useOnboardingShell();

  return (
    <ConfigProvider theme={ONBOARDING_THEME}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={content.fontsUrl} precedence="default" />
      <MarketingRoot>
        <header className={styles.header}>
          <MarketingContainer className={styles.nav}>
            <Link to="/" className={styles.brand} aria-label="REPROMAS home">
              <LockupDark className={styles.brandLogo} aria-hidden="true" />
            </Link>

            <nav className={styles.menu} aria-label="Main">
              {content.nav.map((item) => (
                <div key={item.label} className={styles.menuItem}>
                  {item.children ? (
                    <>
                      <button type="button" className={styles.topLink} aria-haspopup="true">
                        {item.label} <Caret />
                      </button>
                      <div className={styles.drop}>
                        {item.children.map((child) => (
                          <Link key={child.label} to={child.to} className={styles.dropLink}>
                            {child.label}
                            <small>{child.description}</small>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={item.to ?? "/"}
                      className={styles.topLink}
                      aria-current={state.currentPath === item.to ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className={styles.navRight}>
              <button type="button" className={styles.signIn} onClick={actions.openSignIn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                </svg>
                Sign in
              </button>
              <PillLink to={content.demoUrl} variant="cta">
                Book a Demo
              </PillLink>
              <PillLink to={content.advisorUrl} variant="outline">
                Talk to an Advisor
              </PillLink>
            </div>

            <button type="button" className={styles.burger} aria-label="Open menu" onClick={actions.openDrawer}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </MarketingContainer>
        </header>

        <Drawer
          placement="right"
          open={state.drawerOpen}
          onClose={actions.closeDrawer}
          title="Menu"
          rootClassName={marketingStyles.tokens}
        >
          <nav className={styles.drawerNav} aria-label="Mobile">
            {content.nav.map((item) =>
              item.children ? (
                <div key={item.label} className={styles.drawerGroup}>
                  <span className={styles.drawerGroupTitle}>{item.label}</span>
                  {item.children.map((child) => (
                    <Link key={child.label} to={child.to} className={styles.drawerLink}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={item.label} to={item.to ?? "/"} className={styles.drawerLink}>
                  {item.label}
                </Link>
              ),
            )}
            <button type="button" className={styles.drawerLink} onClick={actions.openSignIn}>
              Sign in to your institution
            </button>
            <PillLink to={content.demoUrl} variant="cta" fullWidth>
              Book a Demo
            </PillLink>
            <PillLink to={content.advisorUrl} variant="outline" fullWidth>
              Talk to an Advisor
            </PillLink>
          </nav>
        </Drawer>

        <main>
          <Outlet />
        </main>

        <footer className={styles.footer}>
          <MarketingContainer>
            <div className={styles.footTop}>
              <div className={styles.footBrand}>
                <LockupLight className={styles.footLogo} aria-hidden="true" />
                <p>
                  Academic records software for Nigerian universities, polytechnics and colleges of education. A Laynhub
                  Ltd product.
                </p>
              </div>
              {content.footer.map((column) => (
                <div key={column.title} className={styles.footCol}>
                  <h4>{column.title}</h4>
                  {column.links.map((link) => (
                    <Link key={link.label} to={link.to}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className={styles.footBottom}>
              <span>© {content.year} Laynhub Ltd. All rights reserved.</span>
              <button type="button" onClick={actions.openSignIn}>
                Sign in to your institution
              </button>
            </div>
          </MarketingContainer>
        </footer>

        <div
          className={[styles.sticky, state.stickyVisible ? styles.stickyShow : ""].join(" ")}
          aria-hidden={!state.stickyVisible}
          inert={!state.stickyVisible}
        >
          <MarketingContainer className={styles.stickyInner}>
            <p>Ready to modernise your results process?</p>
            <PillLink to={content.demoUrl} variant="cta">
              Book a Demo
            </PillLink>
            <PillLink to={content.advisorUrl} variant="outline">
              Talk to an Advisor
            </PillLink>
            <button type="button" className={styles.stickyClose} aria-label="Close" onClick={actions.dismissSticky}>
              ×
            </button>
          </MarketingContainer>
        </div>

        <ConditionalRenderer when={Boolean(content.whatsappUrl)}>
          <a
            className={styles.chat}
            href={content.whatsappUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 2.9 2.9 0 00-.9 2.2 5.1 5.1 0 001.1 2.7 11.6 11.6 0 004.4 3.9c1.6.7 2.3.8 3.1.6a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z" />
            </svg>
          </a>
        </ConditionalRenderer>

        <SignInModal open={state.signInOpen} onClose={actions.closeSignIn} />
      </MarketingRoot>
    </ConfigProvider>
  );
}
