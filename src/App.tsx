import { ConfigProvider, Spin } from "antd";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { isEndpointAllowedOnCurrentHost } from "./app/api/apex-endpoint-whitelist";
import { useAppSelector } from "./app/hooks";
import { HostRouter } from "./app/routing/host-router";
import { persistor, store } from "./app/store";
import ThemeVars from "./app/theme/ThemeVars";
import { buildThemeConfig } from "./app/theme/themeConfig";
import { useGetBrandConfigQuery } from "./features/theming/api/theming-api";

function ThemedApp() {
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);
  const shouldLoadThemeConfig = isEndpointAllowedOnCurrentHost("/brand-config");
  const themeConfigQuery = useGetBrandConfigQuery(undefined, {
    skip: !shouldLoadThemeConfig,
  });

  if (
    shouldLoadThemeConfig &&
    (themeConfigQuery.isLoading || themeConfigQuery.isFetching)
  ) {
    return <FullscreenLoader label="Loading theme..." />;
  }

  return (
    <ConfigProvider theme={buildThemeConfig(primaryColor)}>
      <ThemeVars />
      <HostRouter />
    </ConfigProvider>
  );
}

function FullscreenLoader({ label }: { label: string }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Spin size="large" description={label} />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={<FullscreenLoader label="Loading..." />}
        persistor={persistor}
      >
        <ThemedApp />
      </PersistGate>
    </Provider>
  );
}

export default App;
