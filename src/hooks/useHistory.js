import Cursor from "utils/Cursor";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useSocket from "./useSocket";
import useSequence from "./useSequence";

const CURSOR = "cursor";
const INSERT = "insert";
const DELETE = "delete";
const RETAIN = "retain";
const SILENT = "silent";
const INIT_LOAD = "init_load";

function useHistory(ref, currentUserID) {
  const versionVector = useRef([]);
  const cursors = useRef([]);
  const sequence = useSequence();
  const { socketSend, socket, connected } = useSocket(currentUserID);

  const localCursor = useMemo(
    () => new Cursor(currentUserID, 1, 0, cursors.current.length),
    [currentUserID],
  );

  const _incrementVersionVector = useCallback((userID) => {
    const localVersionVector = versionVector.current.find(
      (e) => e.userID === userID,
    );
    if (localVersionVector) {
      localVersionVector.clock += 1;
      //console.log('local vector: ', localVersionVector);
    } else {
      let newVector = creatUser(userID);
      versionVector.current.push(newVector);
      //console.log('new vector: ', newVector);
    }
  }, []);

  const _remoteInsert = useCallback(
    (index, char) => {
      if (ref.current) {
        ref.current
          .getEditor()
          .insertText(
            index,
            char.char,
            { italic: char.italic, bold: char.bold, underline: char.underline },
            "silent",
          );
      }
    },
    [ref],
  );

  const _remoteDelete = useCallback(
    (index) => {
      if (!ref.current) return;
      ref.current.getEditor().deleteText(index, 1, "silent");
    },
    [ref],
  );

  const _remoteRetain = useCallback(
    (index, char) => {
      const { italic, bold, underline, link } = char;
      ref.current
        .getEditor()
        .formatText(index, 1, { italic, bold, underline, link }, "silent");
    },
    [ref],
  );

  const _remoteInitialLoad = useCallback(
    (change) => {
      if (change.type === INSERT) {
        let char = change.data;
        sequence.remoteInsert(char);
        let index = sequence.getCharRelativeIndex(char);
        _remoteInsert(index, char);
      } else if (change.type === DELETE) {
        let char = change.data;
        let id = char.id;
        sequence.delete(id);
        try {
          let index = sequence.getCharRelativeIndex(char);
          _remoteDelete(index);
        } catch (e) {
          console.log("INITIAL: error delete");
        }
      } else if (change.type === RETAIN) {
        let char = change.data;
        sequence.remoteRetain(char);
        try {
          let index = sequence.getCharRelativeIndex(char);
          _remoteRetain(index, char);
        } catch (e) {
          console.log("INITIAL: error retain");
        }
      }
    },
    [_remoteDelete, _remoteInsert, _remoteRetain, sequence],
  );

  const _remoteChange = useCallback(
    ({ data: _change }) => {
      const change = JSON.parse(_change);
      // console.log("change", change.type);

      if (change.type === INSERT) {
        const char = change.data;
        sequence.remoteInsert(char);
        let index = sequence.getCharRelativeIndex(char);
        _remoteInsert(index, char);
        _incrementVersionVector(change.userID);
      } else if (change.type === DELETE) {
        let char = change.data;
        let id = char.id;
        sequence.delete(id);
        try {
          let index = sequence.getCharRelativeIndex(char);
          _remoteDelete(index);
          _incrementVersionVector(change.userID);
        } catch (e) {
          console.log("error _remoteChange");
        }
      } else if (change.type === RETAIN) {
        let char = change.data;
        sequence.remoteRetain(char);
        try {
          let index = sequence.getCharRelativeIndex(char);
          _remoteRetain(index, char);
          _incrementVersionVector(change.userID);
        } catch (e) {
          //
        }
      } else if (change.type === CURSOR) {
        let remoteCursor = change.data;
        _updateRemoteCursor(remoteCursor);
      } else if (change.type === INIT_LOAD) {
        for (let i = 0; i < change.data.length; i++) {
          let prevChange = JSON.parse(change.data[i]);
          //console.log(prevChange);
          _remoteInitialLoad(prevChange);
        }
      }
    },
    [
      _incrementVersionVector,
      _remoteDelete,
      _remoteInitialLoad,
      _remoteInsert,
      _remoteRetain,
      _updateRemoteCursor,
      sequence,
    ],
  );

  const _insert = useCallback(
    (start, end, char, attributes, source) => {
      if (source !== SILENT) {
        let charObj = sequence.insert(start, end, char, attributes);
        socketSend({ type: INSERT, data: charObj, userID: currentUserID });
        _incrementVersionVector(currentUserID);
      }
    },
    [_incrementVersionVector, currentUserID, socketSend, sequence],
  );

  const _delete = useCallback(
    (char, source) => {
      if (source !== SILENT) {
        sequence.delete(char.id);

        socketSend({ type: DELETE, data: char, userID: currentUserID });
        _incrementVersionVector(currentUserID);
      }
    },
    [_incrementVersionVector, currentUserID, socketSend, sequence],
  );

  const _retain = useCallback(
    (char, attributes, source) => {
      if (source !== SILENT) {
        char.update(attributes);

        socketSend({ type: RETAIN, data: char, userID: currentUserID });
        _incrementVersionVector(currentUserID);
      }
    },
    [_incrementVersionVector, currentUserID, socketSend],
  );

  const _getRelativeIndex = useCallback(
    (index) => {
      const relativeIndex = sequence.getRelativeIndex(index);
      // console.log("relativeIndex", relativeIndex);
      return relativeIndex;
    },
    [sequence],
  );

  const _updateCursorEditor = useCallback(
    (cursor) => {
      if (ref.current) {
        const quillCursors = ref.current.getEditor().getModule("cursors");
        const qC = quillCursors.cursors().find((c) => c.id === cursor.userID);
        if (!qC) {
          quillCursors.createCursor(cursor.userID, cursor.name, cursor.color);
        }

        quillCursors.moveCursor(qC ? qC.id : cursor.userID, {
          index: cursor.index,
          length: cursor.length,
        });
      }
    },
    [ref],
  );

  const _updateRemoteCursor = useCallback(
    ({ userID, index, length }) => {
      let cursor = cursors.current.find((c) => c.userID === userID);
      if (cursor) {
        cursor.updateRange(index, length);
      } else {
        cursor = new Cursor(userID, index, length, cursors.current.length);
        cursors.current.push(cursor);
      }
      _updateCursorEditor(cursor);
    },
    [_updateCursorEditor],
  );

  const _updateCursor = useCallback(
    (index, length) => {
      localCursor.updateRange(index, length);
      socketSend({ type: CURSOR, data: localCursor, userID: currentUserID });
    },
    [currentUserID, localCursor, socketSend],
  );

  const _getCursors = useCallback(() => cursors.current, []);

  useEffect(() => {
    if (!connected && !socket) return;
    socket.addEventListener("message", _remoteChange);
    return () => {
      socket.removeEventListener("message", _remoteChange);
    };
  }, [_remoteChange, connected, socket]);

  return {
    insert: _insert,
    delete: _delete,
    retain: _retain,
    getRelativeIndex: _getRelativeIndex,
    getCursors: _getCursors,
    updateCursor: _updateCursor,
    remoteChange: _remoteChange,
    sequence,
  };
}

export default useHistory;

const creatUser = (userID) => ({ userID, clock: 1 });
