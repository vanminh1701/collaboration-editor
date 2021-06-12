import { useCallback, useEffect, useRef, useState } from "react";
import useHistory from "hooks/useHistory";
import { uuid } from "uuidv4";
import Axios from "config/Axios";

function useQuill() {
  const ref = useRef();
  const [text, setText] = useState();
  const [userID] = useState(uuid());
  const {
    insert,
    getRelativeIndex,
    sequence,
    retain,
    delete: historyDelete,
    updateCursor,
    remoteChange,
  } = useHistory(ref, userID);
  const [selectedRange, setSelectedRange] = useState([]);

  const _insert = useCallback(
    (chars, startIndex, attributes, source) => {
      let index = startIndex;
      for (let i in chars) {
        let char = chars[i];
        let crdtIndex = getRelativeIndex(index);
        //prettier-ignore
        insert(crdtIndex[0].index, crdtIndex[1].index, char, attributes, source);
        index += 1;
      }
    },
    [insert, getRelativeIndex],
  );

  const _delete = useCallback(
    (startIndex, length, source) => {
      let index = startIndex;
      for (let i = 0; i < length; i++) {
        try {
          let chars = getRelativeIndex(index);
          historyDelete(chars[1], source);
        } catch {
          alert("failed to find relative index");
        }
      }
    },
    [getRelativeIndex, historyDelete],
  );

  const _retain = useCallback(
    (index, length, attribute, source) => {
      for (let i = 0; i < length; i++) {
        try {
          let chars = getRelativeIndex(index);
          retain(chars[1], attribute, source);
        } catch {
          alert("failed to find relative index");
        }
        index += 1;
      }
    },
    [getRelativeIndex, retain],
  );

  const _inspectDelta = useCallback(
    (ops, index, source) => {
      if (ops["insert"] != null) {
        let chars = ops["insert"];
        let attributes = ops["attributes"];
        _insert(chars, index, attributes, source);
      } else if (ops["delete"] != null) {
        let len = ops["delete"];
        _delete(index, len, source);
      } else if (ops["retain"] != null) {
        let len = ops["retain"];
        let attributes = ops["attributes"];
        _retain(index, len, attributes, source);
      }
    },
    [_delete, _insert, _retain],
  );

  const _onChangeSelection = useCallback(
    (range, source) => {
      console.log("cursor:", range, source);
      if (range && range.index !== null) {
        updateCursor(range.index, range.length);
        setSelectedRange(range);
      } else {
        setSelectedRange([]);
      }
      // console.log("selectedRange", selectedRange);
    },
    [updateCursor],
  );

  const _onFocus = useCallback(() => {
    console.log("focus");
  }, []);

  const _onBlur = useCallback(() => {
    console.log("blur");
  }, []);

  const _onChange = useCallback(
    (value, delta, source) => {
      console.log("change", value, delta, source);
      let index = delta.ops[0]["retain"] || 0;
      if (delta.ops.length === 4) {
        const deleteOps_1 = delta.ops[1];
        _inspectDelta(deleteOps_1, index, source);
        index += delta.ops[2]["retain"];
        const deleteOps_2 = delta.ops[3];
        _inspectDelta(deleteOps_2, index, source);
      } else if (delta.ops.length === 3) {
        const deleteOps = delta.ops[2];
        _inspectDelta(deleteOps, index, source);
        const insert = delta.ops[1];
        _inspectDelta(insert, index, source);
      } else if (delta.ops.length === 2) {
        _inspectDelta(delta.ops[1], index, source);
      } else {
        _inspectDelta(delta.ops[0], index, source);
      }
      setText(value);
    },
    [_inspectDelta],
  );

  const _getData = useCallback(async () => {
    try {
      const { status, data } = await Axios.get("/editor");
      if (status !== 200) return;
      // console.log("data", data);
      data.forEach((char) => {
        console.log("char", char);
        remoteChange({ data: char });
      });
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    _getData();
  }, [_getData]);

  return {
    ref,
    onChange: _onChange,
    onChangeSelection: _onChangeSelection,
    onFocus: _onFocus,
    onBlur: _onBlur,
    text,
    sequence: sequence,
  };
}

export default useQuill;
