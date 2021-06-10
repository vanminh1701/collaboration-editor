import { uuid } from "uuidv4";
import { useState, useEffect, useRef, useCallback } from "react";

import ReactQuill, { Quill, Range } from "react-quill";

export default function Home() {
  const [text, setText] = useState();
  const [history, setHistory] = useState({
    id: "id",
    remoteInsert: () => {},
    remoteDelete: () => {},
    remoteRetain: () => {},
    updateRemoteCursors: () => {},
  });

  const [selectedRange, setSelectedRange] = useState([]);
  const [, setRender] = useState();

  const editRef = useRef();

  const _onChange = useCallback(() => {}, []);
  const _onFocus = useCallback(() => {
    console.log("onFocus");
  }, []);
  const _onBlur = useCallback(() => {
    console.log("onBlur");
  }, []);

  const _handleChangeSelection = useCallback((range, source, editor) => {
    console.log("changeSelection ", { range, source, editor });
    if (range && range.index !== null) {
      this.state.history.updateCursor(range.index, range.length);
      this.setState({ selectedRange: range });
    } else {
      this.setState({ selectedRange: [] });
    }
  }, []);

  const _remoteInsert = useCallback((index, char) => {
    if (editRef.current) {
      editRef.current.getEditor().insertText(
        index,
        char.char,
        {
          italic: char.italic,
          bold: char.bold,
          underline: char.underline,
        },
        "silent"
      );
      setRender({});
    }
  }, []);

  const _remoteDelete = useCallback((index) => {
    editRef.current &&
      editRef.current.getEditor().deleteText(index, 1, "silent");
  }, []);

  const _remoteRetain = useCallback((index, char) => {
    //prettier-ignore
    editRef.current.getEditor().formatText(index,1, {'italic': char.italic, 'bold': char.bold, 'underline': char.underline, 'link': char.link }, 'silent');
  }, []);

  const _insert = useCallback((chars, startIndex, attributes, source) => {
    for (let i in chars) {
      const char = chars[i];
      const crdtIndex = history.getRelativeIndex(index);

      history.insert(
        crdtIndex[0].index,
        crdtIndex[1].index,
        char,
        attributes,
        source
      );
      index += 1;
    }
  }, []);
  const _delete = useCallback((startIndex, length, source) => {
    for (let i = 0; i < length; i++) {
      const chars = history.getRelativeIndex(history.delete(chars[1], source));
    }
  }, []);
  const _remain = useCallback((index, length, number, source) => {
    for (let i = 0; i < length; i++) {
      try {
        let chars = history.getRelativeIndex(index);
        history.remoteRetain(chars[1], attribute, source);
      } catch (err) {
        //
      }
    }
  }, []);
  const _remoteInsert = useCallback(() => {}, []);

  // Initial
  useEffect(() => {
    editorRef.current && editorRef.current.getEditor().enable;
  }, []);

  return (
    <div>
      <ReactQuill
        value={text}
        theme={"snow"}
        ref={editorRef}
        onChange={_onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onChangeSelection={_handleChangeSelection}
        modules={modules}
      />
    </div>
  );
}
