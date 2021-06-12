import dynamic from "next/dynamic";

const Editor = dynamic(() => import("components/editor"), { ssr: false });

function Page() {
  return <Editor />;
}

export default Page;
