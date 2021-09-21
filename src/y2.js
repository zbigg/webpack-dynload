const { assignIn } = require("lodash");
console.log("evaluated: x2.js");

const defaults = assignIn({}, { y: "y2" });

module.exports = defaults.y;
