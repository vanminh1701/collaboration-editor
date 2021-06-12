import { useEffect, useCallback } from "react";
import QuillCursors from "quill-cursors";
import ReactQuill, { Quill } from "react-quill";
import Axios from "config/Axios";
import "react-quill/dist/quill.snow.css";

import useQuill from "hooks/useQuill";
Quill.register("modules/cursors", QuillCursors);
const modules = {
  cursors: true,
  toolbar: ["bold", "italic", "underline"],
};

export default function Home() {
  const {
    ref,
    onChange,
    onChangeSelection,
    onFocus,
    onBlur,
    text = "",
    sequence,
  } = useQuill();

  const _removeData = useCallback(async () => {
    try {
      await Axios.put("/editor");
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    ref.current && ref.current.getEditor().enable;
  }, [ref]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "50px",
        width: "500px",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <ReactQuill
        value={text}
        theme={"snow"}
        ref={ref}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onChangeSelection={onChangeSelection}
        modules={modules}
      />

      <div>
        <button onClick={() => console.log(sequence.pretty())}>
          Print sequence
        </button>
        <button onClick={_removeData}>Delete Data</button>
      </div>
    </div>
  );
}
