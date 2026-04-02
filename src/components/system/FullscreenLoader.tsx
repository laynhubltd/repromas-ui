import { Spin } from "antd";

type FullscreenLoaderProps = {
  label?: string;
};

export default function FullscreenLoader({
  label = "Loading...",
}: FullscreenLoaderProps) {
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
      <Spin size="large" tip={label} />
    </div>
  );
}
