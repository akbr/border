var assert = require("assert");
var border = require("./index");

// API
// border(function, options) => wrappedFunction

let sanityCheck = border(x => x);
assert.equal(sanityCheck(1), 1);

// Step 1: Initialization
// {init: initFunction}
// initFunction is run the first time wrappedFunction is invoked.
let ready = 0;
let count = 0;
let counter = border(() => count++, {
  init: () => ready++
});

counter();
assert.equal(ready, 1);
assert.equal(count, 1);
counter(); // init only fires once
assert.equal(ready, 1);
assert.equal(count, 2);

// Step 2: Argument arrangement
// {argument(s): number, obj, function}
// wrappedFunction invokes function with only that argument(s) specified
let justOne = border(x => x, {
  arguments: 1
});
assert.equal(justOne(1, 2), 2);

let choosy = border((x, y) => x + y, {
  arguments: [0, 2]
});
assert.equal(choosy(1, -999, 1), 2);

let complex = border((a, b, c) => a + b + c, {
  arguments: (...args) => [...args].map(x => x + 1)
});
assert.equal(complex(1, 2, 3), 9);

// Step 3: Pathing
// {path: string, arr}
// {path: obj or arr of paths}
// Path into arguments (after arrangement).
let nested = {a:{b:{c:"foo"}}};
let shiftedPath = border(x => x, {
  arguments: 1,
  paths: "a.b.c"
});
assert.equal(shiftedPath(null, nested), "foo");

let multiPath = border((x, y) => x + y, {
  arguments: [1, 3],
  paths: { // An array would work here instead of a keyed 0,1 object
    // Note: argument transformation has already happened!
    0: "a.b.c",
    1: ["a", "b", "c"] // Note different path format
  }
})
assert.equal(multiPath(null, nested, null, nested), "foofoo");


// Step 4: shouldUpdate
let cached = border(x => x, {
  shouldUpdate: (prev, next) => prev !== next
});
assert.equal(cached(1), 1);
assert.equal(cached(1), undefined);
assert.equal(cached(2), 2);
assert.equal(cached(2), undefined);

let cached2 = border(x => x, {
  arguments: 1,
  paths: "a.b.c",
  shouldUpdate: (prev, next) => prev !== next
});
assert.equal(cached2(null, {a:{b:{c:1}}}), 1);
assert.equal(cached2(null, {a:{b:{c:1}}}), undefined);
assert.equal(cached2(null, {a:{b:{c:2}}}), 2);
assert.equal(cached2(null, {a:{b:{c:2}}}), undefined);
assert.equal(cached2(), null);
assert.equal(cached2(), undefined);