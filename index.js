var get = require('@akbr/get');

module.exports = function border(fn, options = {}) {
  // argument, arguments
  const argConfig = options.argument || options.arguments;
  const argConfigType = Array.isArray(argConfig) ? 'array' : typeof(argConfig);
  // path, paths
  const pathsConfig = options.path || options.paths;
  const pathsType = typeof(pathsConfig);
  // init
  const init = options.init;
  // shouldUpdate
  const shouldUpdate = options.shouldUpdate;

  var needsInit = init;
  var cache;

  return function () {
    // Prepare arguments
    let args;
    if (argConfigType === 'undefined') {
      args = Array.prototype.slice.call(arguments);
    } else if (argConfigType === 'number') {
      args = [arguments[argConfig]];
    } else if (argConfigType === 'array') {
      args = argConfig.map(index => arguments[index]);
    } else if (argConfigType === 'function') {
      args = argConfig.apply(argConfig, arguments);
      if (!Array.isArray(args)) {
        args = [];
      }
    }

    // Path into specified arguments
    if (pathsType === 'object') {
      for (let i in pathsConfig) {
        args[i] = get(args[i], pathsConfig[i]);
      }
    } else if (pathsType === 'string') {
      args[0] = get(args[0], pathsConfig);
    }

    // Run init if this is the first execution
    if (needsInit) {
      init.apply(init, args);
      needsInit = false;
    }

    // Run shouldUpdate
    if (shouldUpdate) {
      let cachePattern = args.concat();
      cachePattern.splice(0, 0, cache);
      if (!shouldUpdate.apply(shouldUpdate, cachePattern)) {
        return;
      } else {
        cache = args[0];
      }
    }

    return fn.apply(fn, args);
  }
}