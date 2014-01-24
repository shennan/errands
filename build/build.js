
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("errands/index.js", function(exports, require, module){
module.exports = function(){
	
	var errand = {

		args:arguments,
		errands:[],
		asyncs:[],
		index:0,
		running:false,

		next:function(){
			
			if(errand.errands[errand.index]){

				errand.running = true;

				var fn = errand.errands[errand.index];

				setTimeout(function(){

					fn.apply(errand, errand.args);

					if(!errand.asyncs[errand.index - 1]){

						errand.next();

					}
				}, 0);

				errand.index++;

			}else{

				errand.running = false;

			}

			return errand;

		},

		run:function(fn, async){

			async = async || 0;

			if(typeof fn === 'function'){

				errand.errands.push(fn);
				errand.asyncs.push(async);

			}else if(typeof fn === 'object'){
				
				for(var i in fn){

					errand.errands.push(fn[i]);
					errand.asyncs.push(async);

				}
			}

			return !errand.running ? errand.next() : errand;

		},

		wait:function(fn){

			fn = fn || 1000;

			if(typeof fn === 'number'){

				errand.run(function(){

					setTimeout(this.next, fn);

				}, 1);

			}else{

				errand.run(fn, 1);

			}

			return !errand.running ? errand.next() : errand;

		},

		repeat:function(i){

			i = i || 1;

			var fn = errand.errands[errand.errands.length - 1];
			var async = errand.asyncs[errand.asyncs.length - 1];
			
			if(fn){

				for(; i; i--){
					
					errand.run(fn, async);
					
				}
			}

			return !errand.running ? errand.next() : errand;

		},

		skip:function(i){

			i = i || 1;
			
			errand.run(function(){

				errand.index += i;

				errand.next();

			}, 0)

			return !errand.running ? errand.next() : errand;

		}
	}

	return errand;

}
});
require.alias("errands/index.js", "errands/index.js");