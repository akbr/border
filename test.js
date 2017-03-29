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
  argument: 1
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
  argument: 1,
  path: "a.b.c"
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

// Step 4: Caching
// After arrangement and pathing, optionally cache on one argument

// {cache: number}
let runCount = 0;
let cachedFunction = border(x => runCount++, {
  cache: 0
});
cachedFunction("hi");
assert.equal(runCount, 1);
cachedFunction("hi"); // function not run!
assert.equal(runCount, 1);
cachedFunction("ho");
assert.equal(runCount, 2);

// {comparator: 'refernece', shallow', function}
// 'Reference' is default, but you can do other stuff too.
runCount = 0;
cachedFunction = border(x => runCount++, {
  cache: 0,
  comparator: 'shallow'
});
cachedFunction({greeting: "hi"});
assert.equal(runCount, 1);
cachedFunction({greeting: "hi"}); // function not run!
assert.equal(runCount, 1);
cachedFunction({greeting: "ho"});
assert.equal(runCount, 2);

runCount = 0;
cachedFunction = border(x => runCount++, {
  cache: 0,
  comparator: (current, last) => current === last + 1
});
cachedFunction(1);
assert.equal(runCount, 1);
cachedFunction(2); // function not run!
assert.equal(runCount, 1);
cachedFunction(2); // function not run AND "last" is still 1
assert.equal(runCount, 1);
cachedFunction(); // finally
assert.equal(runCount, 2);

// {injectCache: boolean}
// Injects the cached value after the new value
let addCache = border((x, cache, y) => y + cache, {
  cache: 0,
  injectCache: true,
  init: (x, y) => assert.equal(x + y, 3)
});
// Init fires without cache injection, but initial return of main function is NaN, because cache is undefined
assert.equal(isNaN(addCache(1,2)), true);
// Now cache as value of 1
assert.equal(addCache(999,2), 3);
// Now cache as value of 999
assert.equal(addCache(999,2), 3); // Doesn't run
assert.equal(addCache(1,1), 1000);

// Putting it all together!
let cacheWithPath = border(x => x, {
  arguments: [0, 2],
  paths: {1: "a.b.c"},
  cache: 1
});

assert.equal(cacheWithPath(1, null, {a:{b:{c:"foo"}}}), 1);
assert.equal(cacheWithPath(2, null, {a:{b:{c:"foo"}}}), 1);
assert.equal(cacheWithPath(2, null, null), 2);
assert.equal(cacheWithPath(3, null, null), 2);