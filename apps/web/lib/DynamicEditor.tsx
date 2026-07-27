import dynamic from "next/dynamic";

export const Editor = dynamic(
  () => import("../components/problem/ApproachEditor").then((mod) => mod.ApproachEditor),
  { ssr: false }
);

export default Editor;
