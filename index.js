var get = require('@akbr/get');
var shallowEqual = require('shallowequal');

module.exports = function border(fn, options = {}) {
  var {
    init,
    // argument(s), // number, array of numbers, (arguments) => [args]
    path, // refers to first argument
    paths, // replaces path, expects object of paths {0: path, 1: path}
    cache, // arg number
    comparator = 'reference',
    injectCache = false
  } = options;

  var argConfig = options.arguments !== undefined ? options.arguments : options.argument;
  var argConfigType = Array.isArray(argConfig) ? 'array' : typeof(argConfig);
  var cacheEnabled = typeof(cache) === 'number';

  // ---

  var hasRun;
  var cacheData;
  var result;

  return function () {
    // Prepare an array of arguments
    let args;
    if (argConfig === undefined) {
      args = Array.prototype.slice.call(arguments);
    } else if (argConfigType === 'number') {
      args = [arguments[argConfig]];
    } else if (argConfigType === 'array') {
      args = argConfig.map(index => arguments[index]);
    } else if (argConfigType === 'function') {
      args = argConfig.apply(argConfig, arguments);
    }

    // Path into specified arguments
    if (paths) {
      for (let i in paths) {
        args[i] = get(args[i], paths[i]);
      }
    } else if (path) {
      args[0] = get(args[0], path);
    }

    // Check cache, if applicable
    let cacheTarget;
    let isNew;
    if (cacheEnabled) {
      cacheTarget = args[cache];
      
      if (comparator === 'reference') {
        isNew = cacheTarget !== cacheData;
      } else if (comparator === 'shallow') {
        isNew = !shallowEqual(cacheTarget, cacheData);
      } else if (typeof(comparator) === 'function') {
        isNew = !comparator(cacheTarget, cacheData);
      } else {
        throw new Error('Invalid comparator supplied:', comparator);
      }

      if (!isNew) {
        return result;
      }
    }

    if (!hasRun) {
      hasRun = true;
      if (init) {
        init.apply(init, args);
      }
    }

    if (cacheEnabled && injectCache) {
      args.splice(cache + 1, 0, cacheData);
    }

    result = fn.apply(fn, args);

    cacheData = cacheTarget;

    return result;
  }
}