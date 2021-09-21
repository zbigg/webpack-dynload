const { assignIn } = require("lodash");
console.log("x2.js");

const defaults = assignIn({}, { x: "x2" });
module.exports = defaults.x;
