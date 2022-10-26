import Header from "./Header";
import { ReactElement } from "react";

const Layout = (props: { children: ReactElement }) => {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#262626",
        color: "#fff",
        flexDirection: "column",
      }}
    >
      <Header />
      {props.children}
    </div>
  );
};

export default Layout;
