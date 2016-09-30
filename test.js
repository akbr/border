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
/**
var state = {};

var initToken;
var count;

var options = {
  path: "hello.world",
  injectCache: true,
  init
}

function init(state, inc) {
  initToken = true;
  count = 0;
}

function update(state, cache, inc) {
  count += inc;
}

var updater = Updater(update, options);

updater(state, 1);
assert.equal(initToken, undefined);

state.hello = {world: "foo"};
updater(state, 1);
assert.equal(initToken, true);
assert.equal(count, 1);

updater(state, 1);
updater(state, 1);
updater(state, 1);
assert.equal(count, 1);

state.hello.world = "bar";
updater(state, 1);
assert.equal(count, 2);

// ---

var state2 = {
  systems: {
    1: {
      name: "Milky Way"
    }
  },
  a: {
    b: {
      c: {
        d: true
      }
    }
  }
};

options = {
  init: init2,
  path: (state, get) => {
    return {
      systems: get(state, "systems"),
      abc: get(state, "a.b.c")
    }
  },
  comparator: "shallow"
}

var firstSystemName;
function init2(state) {
  firstSystemName = state.systems[1].name;
}

var updateValue;
function update2(state, value) {
  updateValue = value;
}

var updater2 = Updater(update2, options);

updater2(state2, "foo");
assert.equal(firstSystemName, "Milky Way");
assert.equal(updateValue, "foo");

state2.whatev = "hi";
updater2(state2, "bar");
assert.equal(updateValue, "foo");

// ---

let state3 = {hello: "world"};
let initCheck;
let updateCheck;

function init3 (a, b, c, state) {
  if (state === "world") initCheck = true;
}
function update3 (a, b, c, state, cache) {
  if (cache === "world") updateCheck = true;
}

let options3 = {
  init: init3,
  argument: 3,
  path: "hello",
  injectCache: true
}

var updater3 = Updater(update3, options3);
updater3(null, null, null, state3);
assert.equal(initCheck, true);
assert.equal(updateCheck, undefined);
state3.hello = "world!";
updater3(null, null, null, state3);
assert.equal(updateCheck, true);
**/