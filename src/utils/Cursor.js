const USER_COLORS = ["blue", "green", "red", "orange"];
const USER_NAMES = ["Barack Obama", "Donald Trump", "Angela", "Vladimir"];

export default class Cursor {
  constructor(userID, index, length, userCount) {
    this.userID = userID;
    this.index = index || 1;
    this.length = length || 0;
    this.color = userCount <= 3 ? USER_COLORS[userCount] : USER_COLORS[0];
    this.name = userCount <= 3 ? USER_NAMES[userCount] : USER_NAMES[0];
  }

  updateRange(index, length) {
    this.index = index;
    this.length = length;
  }
}
