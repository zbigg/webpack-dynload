const { c } = require("./c");
const { dynamicLoad } = require("./dynamicLoad");

console.log("index");

console.log("index: C", c);
// require.ensure([], require => {
//     const x = require("./x.js");

//     console.log("index: X", x);
// });

dynamicLoad(DYNAMIC_LOAD_DIRNAME, "./x").then((x) => {
    console.log("index: X (2)", x);
});

dynamicLoad(DYNAMIC_LOAD_DIRNAME, "./y").then((y) => {
    console.log("index: Y (2)", y);
});

require.ensure(["./z"], function (require) {
    const z = require("./z");

    console.log("index: Z", z);
});

// require.ensure([], require => {
//     const y = require("./y.js");

//     console.log("index: Y", y);
// });
