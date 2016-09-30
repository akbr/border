var assert = require("assert");
var border = require("./index");

// Argument composition
var bare = border(x => x);
assert.equal(bare(1), 1);

var shifted = border(x => x, {arguments: 2});
assert.equal(shifted(1, 2, 3), 3);

var complex = border((a, b, c) => a + b + c, {
  arguments: function (...args) {
    return [...args].map(x => x + 1);
  }
});
assert.equal(complex(1, 2, 3), 9);

// Pathing
var obj = {a:{b:{c:"foo"}}};

var shiftedPath = border(x => x, {
  argument: 1,
  path: "a.b.c"
});
assert.equal(shiftedPath(null, obj), "foo");

var multiPath = border((x, y) => x + y, {
  arguments: [1, 3],
  paths: { // Note: argument transformation has already happened!
    0: "a.b.c",
    1: "a.b.c"
  }
})
assert.equal(multiPath(null, obj, null, obj), "foofoo");

// Init without cache
var toggle = false;
var toggler = border(x => x, {
  init: () => {
    toggle = !toggle;
  }
});

toggler();
assert.equal(toggle, true);
toggler(); // init only fires once.
assert.equal(toggle, true);

// Caching
var toggle2 = false;
var getSecond = border((x, y) => y, {
  cache: 0,
  init: () => toggle2 = !toggle2
})

assert.equal(getSecond(1, 2), 2);
assert.equal(toggle2, true);
assert.equal(getSecond(1, 999), 2); // last result returned, inner function not run
assert.equal(getSecond("changed", 999), 999);

var addCache = border((x, cache, y) => y + cache, {
  cache: 0,
  injectCache: true,
  init: (x, y) => assert.equal(x + y, 3)
});

// Init fires wihout cache injection, but initial return of main function is NaN, because cache is undefined
assert.equal(isNaN(addCache(1,2)), true);
// Now cache as value of 1
assert.equal(addCache(999,2), 3);
// Now cache as value of 999
assert.equal(addCache(999,2), 3); // Doesn't run
assert.equal(addCache(1,1), 1000);

var cacheWithPath = border(x => x, {
  arguments: [0, 2],
  paths: {1: "a.b.c"},
  cache: 1
});

assert.equal(cacheWithPath(1, null, {a:{b:{c:"foo"}}}), 1);
assert.equal(cacheWithPath(2, null, {a:{b:{c:"foo"}}}), 1);
assert.equal(cacheWithPath(2, null, null), 2);
assert.equal(cacheWithPath(3, null, null), 2);