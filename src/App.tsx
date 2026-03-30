import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useAppSelector } from "./app/hooks";
import { AppRouter } from "./app/routing/AppRouter";
import { persistor, store } from "./app/store";
import ThemeVars from "./app/theme/ThemeVars";
import { buildThemeConfig } from "./app/theme/themeConfig";
import { useGetBrandConfigQuery } from "./features/theming/api/theming-api";

function ThemedApp() {
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);
  useGetBrandConfigQuery();
  return (
    <ConfigProvider theme={buildThemeConfig(primaryColor)}>
      <ThemeVars />
      <AppRouter />
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemedApp />
      </PersistGate>
    </Provider>
  );
}

export default App;
