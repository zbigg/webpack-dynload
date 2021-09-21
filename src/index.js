const { c } = require("./c");
const { dynamicLoad } = require("./dynamicLoad");

console.log("index");

console.log("index: C", c);

// dynamicLoad(DYNAMIC_LOAD_DIRNAME, "./x").then((x) => {
//     console.log("index: X (2)", x);
// });

dynamicLoad(DYNAMIC_LOAD_DIRNAME, "../src/y").then((y) => {
    console.log("index: Y (2)", y);
});

require.ensure(["./z"], function (require) {
    const z = require("./z");

    console.log("index / webpack: Z", z);

    dynamicLoad(DYNAMIC_LOAD_DIRNAME, "./z").then((z) => {
        console.log("index/dynamicLoad (2)", z);
    });
});

// require.ensure([], require => {
//     const y = require("./y.js");

//     console.log("index: Y", y);
// });
