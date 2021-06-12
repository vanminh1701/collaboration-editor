import { useCallback, useRef } from "react";
import Char from "utils/Char";
import { uuid } from "uuidv4";

function useSequence() {
  const siteID = useRef(uuid());
  const chars = useRef([
    new Char(0, "bof", siteID.current, {}),
    new Char(10000, "eof", siteID.current, {}),
  ]);

  const _generateIndex = useCallback((indexStart, indexEnd) => {
    let diff = indexEnd - indexStart;
    let index;
    if (diff <= 10) {
      index = indexStart + diff / 100;
    } else if (diff <= 1000) {
      index = Math.round(indexStart + diff / 10);
    } else if (diff <= 5000) {
      index = Math.round(indexStart + diff / 100);
    } else {
      index = Math.round(indexStart + diff / 1000);
    }
    return index;
  }, []);

  const _compareIdentifier = useCallback((c1, c2) => {
    if (c1.index < c2.index) {
      return -1;
    } else if (c1.index > c2.index) {
      return 1;
    } else {
      if (c1.siteID < c2.siteID) {
        return -1;
      } else if (c1.siteID > c2.siteID) {
        return 1;
      } else {
        return 0;
      }
    }
  }, []);

  const _insert = useCallback(
    (indexStart, indexEnd, char, attributes, id) => {
      //TODO: Must find better way here

      let index = _generateIndex(indexStart, indexEnd);
      // console.log("Insert index:", index);
      let charObj =
        id !== undefined
          ? new Char(index, char, siteID.current, attributes, id)
          : new Char(index, char, siteID.current, attributes);

      chars.current.splice(index, 0, charObj);
      chars.current.sort((a, b) => a.index - b.index);
      return charObj;
    },
    [_generateIndex],
  );

  const _remoteInsert = useCallback((char) => {
    const charCopy = new Char(
      char.index,
      char.char,
      char.siteID,
      { bold: char.bold, italic: char.italic, underline: char.underline },
      char.id,
    );
    chars.current.push(charCopy);
    chars.current.sort((a, b) => {
      if (a.index == b.index) {
        return a.siteID - b.siteID;
      } else {
        return a.index - b.index;
      }
    });
  }, []);

  const _delete = useCallback((id) => {
    //console.log(id);
    let char = chars.current.find((e) => e.id === id);
    if (char !== undefined) {
      char.tombstone = true;
      //console.log("removed: ", char)
    } else {
      //console.log("did not found char")
    }
  }, []);

  const _remoteRetain = useCallback((charCopy) => {
    const { id, bold, italic, underline, link } = charCopy;
    let char = chars.current.find((c) => c.id === id);
    if (char !== undefined) {
      char.update({ bold, italic, underline, link });
    }
  }, []);

  const _getRelativeIndex = useCallback((index) => {
    let i = 0;
    let aliveIndex = 0;
    let itemsFound = false;
    let charStart;
    let charEnd;
    let char;
    while (!itemsFound && i < chars.current.length) {
      char = chars.current[i];
      if (!char.tombstone) {
        if (aliveIndex > index) {
          charEnd = char;
          itemsFound = true;
        } else {
          charStart = char;
        }
        aliveIndex++;
      }
      i++;
    }
    if (aliveIndex >= index) {
      charEnd = char;
      itemsFound = true;
    } else {
      charStart = char;
    }
    if (charStart && charEnd) return [charStart, charEnd];
    else throw Error("failedToFindRelativeIndex");
  }, []);

  const _getCharRelativeIndex = useCallback((char) => {
    let i = 0;
    let aliveIndex = 0;
    let charFound = false;
    let c;
    while (!charFound && i < chars.current.length) {
      c = chars.current[i];
      if (!c.tombstone && c.char !== "bof" && c.char !== "eof") aliveIndex++;
      if (c.id === char.id) {
        if (c.tombstone) {
          aliveIndex++;
        }
        charFound = true;
      }
      i++;
    }
    if (charFound) return aliveIndex - 1;
    else throw Error("failedToFindRelativeIndex");
  }, []);

  const _getSequence = useCallback(() => {
    let seq = "";
    for (let char of chars.current) {
      if (!char.tombstone && char.char !== "bof" && char.char !== "eof")
        seq += char.char;
    }
    return seq;
  }, []);

  const _pretty = useCallback(() => {
    for (let char of chars.current) {
      console.log(char.index, char.char, char.siteID, char.tombstone);
    }
  }, []);

  return {
    pretty: _pretty,
    getSequence: _getSequence,
    getCharRelativeIndex: _getCharRelativeIndex,
    compareIdentifier: _compareIdentifier,
    insert: _insert,
    remoteInsert: _remoteInsert,
    delete: _delete,
    remoteRetain: _remoteRetain,
    getRelativeIndex: _getRelativeIndex,
  };
}

export default useSequence;
