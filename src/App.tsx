import { ThemeVars } from "@/components/ThemeVars";
import { themeConfig } from "@/config/theme";
import "@/index.css";
import { AppRouter } from "@/routing/app-router";
import { persistor, store } from "@/store/store";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={themeConfig}>
          <ThemeVars />
          <AppRouter />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
