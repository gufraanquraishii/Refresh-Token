"use client";

import { ConfigProvider } from "antd";

export function AntdAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider theme={{ cssVar: true, hashed: false }}>
      {children}
    </ConfigProvider>
  );
}
