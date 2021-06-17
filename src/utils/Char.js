import { uuid } from "uuidv4";

export default class Char {
  constructor(index, char, siteID, attributes, id = uuid()) {
    this.index = index;
    this.char = char;
    this.siteID = siteID;
    this.tombstone = false;
    ATTRIBUTES.forEach((attr) => {
      this[attr] = _updateAttribute(attr, attributes);
    });
    this.id = id;
  }

  update(attributes) {
    console.log("should update", attributes);
    ATTRIBUTES.forEach((attr) => {
      this[attr] = _updateAttribute(attr, attributes);
    });
  }
}

const _updateAttribute = (attr, attributes) =>
  attributes && attr in attributes ? attributes[attr] : undefined;

const ATTRIBUTES = ["bold", "italic", "underline", "header", "link"];
