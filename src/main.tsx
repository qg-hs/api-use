import React from "react";
import ReactDOM from "react-dom/client";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { useThemeStore } from "./stores/themeStore";
import { getThemeTokens, getComponentsConfig } from "./utils/themeConfig";
import "./styles/main.css";

if (typeof window !== "undefined") {
  useThemeStore.getState().init();
}

const AppContainer = () => {
  const mode = useThemeStore((state) => state.mode);
  const themeName = useThemeStore((state) => state.themeName);
  const isDark = mode === "dark";

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: getThemeTokens(themeName, isDark),
        components: getComponentsConfig(themeName, isDark),
      }}
    >
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppContainer />
  </React.StrictMode>
);

