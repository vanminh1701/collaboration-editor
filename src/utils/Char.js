import { uuid } from "uuidv4";

export default class Char {
  constructor(index, char, siteID, attributes, id = uuid()) {
    this.index = index;
    this.char = char;
    this.siteID = siteID;
    this.tombstone = false;
    this.bold = _updateAttribute("bold", attributes);
    this.italic = _updateAttribute("italic", attributes);
    this.underline = _updateAttribute("underline", attributes);
    this.header = _updateAttribute("header", attributes);
    this.id = id;
  }

  update(attributes) {
    console.log("should update", attributes);
    this.bold =
      attributes && "bold" in attributes ? attributes["bold"] : this.bold;
    this.italic =
      attributes && "italic" in attributes ? attributes["italic"] : this.italic;
    this.underline =
      attributes && "underline" in attributes
        ? attributes["underline"]
        : this.underline;
    //this.header = attributes  && "header" in attributes ? attributes["header"] : ;
    this.link =
      attributes && "link" in attributes ? attributes["link"] : this.link;
  }
}

const _updateAttribute = (attr, attributes) =>
  attributes && attr in attributes ? attributes[attr] : undefined;
