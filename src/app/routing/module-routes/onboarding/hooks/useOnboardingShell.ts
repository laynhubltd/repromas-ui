import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ADVISOR_URL,
  DEMO_BOOKING_URL,
  MARKETING_FONTS_URL,
  MARKETING_FOOTER,
  MARKETING_NAV,
  WHATSAPP_URL,
} from "../utils/marketing-links";

/** Scroll depth after which the sticky "Book a Demo" bar slides in. */
const STICKY_BAR_OFFSET = 700;

export function useOnboardingShell() {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.hash}`;
  /** Route the drawer was opened on; navigating anywhere else closes it without an effect. */
  const [drawerOpenedOn, setDrawerOpenedOn] = useState<string | null>(null);
  const drawerOpen = drawerOpenedOn === routeKey;
  const [signInOpen, setSignInOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolledPastHero(window.scrollY > STICKY_BAR_OFFSET);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return {
    content: {
      nav: MARKETING_NAV,
      footer: MARKETING_FOOTER,
      demoUrl: DEMO_BOOKING_URL,
      advisorUrl: ADVISOR_URL,
      whatsappUrl: WHATSAPP_URL,
      fontsUrl: MARKETING_FONTS_URL,
      year: new Date().getFullYear(),
    },
    state: {
      drawerOpen,
      signInOpen,
      stickyVisible: scrolledPastHero && !stickyDismissed,
      currentPath: location.pathname,
    },
    actions: {
      openDrawer: () => setDrawerOpenedOn(routeKey),
      closeDrawer: () => setDrawerOpenedOn(null),
      openSignIn: () => {
        setDrawerOpenedOn(null);
        setSignInOpen(true);
      },
      closeSignIn: () => setSignInOpen(false),
      dismissSticky: () => setStickyDismissed(true),
    },
  };
}
