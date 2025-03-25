var jsPsychTimelineHeartsAndFlowers = (function (exports) {
  'use strict';

  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/auto-bind/index.js
  var require_auto_bind = __commonJS({
    "node_modules/auto-bind/index.js"(exports, module) {
      var getAllProperties = (object) => {
        const properties = /* @__PURE__ */ new Set();
        do {
          for (const key of Reflect.ownKeys(object)) {
            properties.add([object, key]);
          }
        } while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);
        return properties;
      };
      module.exports = (self2, { include, exclude } = {}) => {
        const filter = (key) => {
          const match = (pattern) => typeof pattern === "string" ? key === pattern : pattern.test(key);
          if (include) {
            return include.some(match);
          }
          if (exclude) {
            return !exclude.some(match);
          }
          return true;
        };
        for (const [object, key] of getAllProperties(self2.constructor.prototype)) {
          if (key === "constructor" || !filter(key)) {
            continue;
          }
          const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
          if (descriptor && typeof descriptor.value === "function") {
            self2[key] = self2[key].bind(self2);
          }
        }
        return self2;
      };
    }
  });

  // node_modules/seedrandom/lib/alea.js
  var require_alea = __commonJS({
    "node_modules/seedrandom/lib/alea.js"(exports, module) {
      (function(global, module2, define2) {
        function Alea(seed) {
          var me = this, mash = Mash();
          me.next = function() {
            var t = 2091639 * me.s0 + me.c * 23283064365386963e-26;
            me.s0 = me.s1;
            me.s1 = me.s2;
            return me.s2 = t - (me.c = t | 0);
          };
          me.c = 1;
          me.s0 = mash(" ");
          me.s1 = mash(" ");
          me.s2 = mash(" ");
          me.s0 -= mash(seed);
          if (me.s0 < 0) {
            me.s0 += 1;
          }
          me.s1 -= mash(seed);
          if (me.s1 < 0) {
            me.s1 += 1;
          }
          me.s2 -= mash(seed);
          if (me.s2 < 0) {
            me.s2 += 1;
          }
          mash = null;
        }
        function copy(f, t) {
          t.c = f.c;
          t.s0 = f.s0;
          t.s1 = f.s1;
          t.s2 = f.s2;
          return t;
        }
        function impl(seed, opts) {
          var xg = new Alea(seed), state = opts && opts.state, prng = xg.next;
          prng.int32 = function() {
            return xg.next() * 4294967296 | 0;
          };
          prng.double = function() {
            return prng() + (prng() * 2097152 | 0) * 11102230246251565e-32;
          };
          prng.quick = prng;
          if (state) {
            if (typeof state == "object")
              copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        function Mash() {
          var n = 4022871197;
          var mash = function(data) {
            data = String(data);
            for (var i = 0; i < data.length; i++) {
              n += data.charCodeAt(i);
              var h = 0.02519603282416938 * n;
              n = h >>> 0;
              h -= n;
              h *= n;
              n = h >>> 0;
              h -= n;
              n += h * 4294967296;
            }
            return (n >>> 0) * 23283064365386963e-26;
          };
          return mash;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.alea = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // node_modules/seedrandom/lib/xor128.js
  var require_xor128 = __commonJS({
    "node_modules/seedrandom/lib/xor128.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this, strseed = "";
          me.x = 0;
          me.y = 0;
          me.z = 0;
          me.w = 0;
          me.next = function() {
            var t = me.x ^ me.x << 11;
            me.x = me.y;
            me.y = me.z;
            me.z = me.w;
            return me.w ^= me.w >>> 19 ^ t ^ t >>> 8;
          };
          if (seed === (seed | 0)) {
            me.x = seed;
          } else {
            strseed += seed;
          }
          for (var k = 0; k < strseed.length + 64; k++) {
            me.x ^= strseed.charCodeAt(k) | 0;
            me.next();
          }
        }
        function copy(f, t) {
          t.x = f.x;
          t.y = f.y;
          t.z = f.z;
          t.w = f.w;
          return t;
        }
        function impl(seed, opts) {
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (typeof state == "object")
              copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.xor128 = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // node_modules/seedrandom/lib/xorwow.js
  var require_xorwow = __commonJS({
    "node_modules/seedrandom/lib/xorwow.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this, strseed = "";
          me.next = function() {
            var t = me.x ^ me.x >>> 2;
            me.x = me.y;
            me.y = me.z;
            me.z = me.w;
            me.w = me.v;
            return (me.d = me.d + 362437 | 0) + (me.v = me.v ^ me.v << 4 ^ (t ^ t << 1)) | 0;
          };
          me.x = 0;
          me.y = 0;
          me.z = 0;
          me.w = 0;
          me.v = 0;
          if (seed === (seed | 0)) {
            me.x = seed;
          } else {
            strseed += seed;
          }
          for (var k = 0; k < strseed.length + 64; k++) {
            me.x ^= strseed.charCodeAt(k) | 0;
            if (k == strseed.length) {
              me.d = me.x << 10 ^ me.x >>> 4;
            }
            me.next();
          }
        }
        function copy(f, t) {
          t.x = f.x;
          t.y = f.y;
          t.z = f.z;
          t.w = f.w;
          t.v = f.v;
          t.d = f.d;
          return t;
        }
        function impl(seed, opts) {
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (typeof state == "object")
              copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.xorwow = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // node_modules/seedrandom/lib/xorshift7.js
  var require_xorshift7 = __commonJS({
    "node_modules/seedrandom/lib/xorshift7.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this;
          me.next = function() {
            var X = me.x, i = me.i, t, v;
            t = X[i];
            t ^= t >>> 7;
            v = t ^ t << 24;
            t = X[i + 1 & 7];
            v ^= t ^ t >>> 10;
            t = X[i + 3 & 7];
            v ^= t ^ t >>> 3;
            t = X[i + 4 & 7];
            v ^= t ^ t << 7;
            t = X[i + 7 & 7];
            t = t ^ t << 13;
            v ^= t ^ t << 9;
            X[i] = v;
            me.i = i + 1 & 7;
            return v;
          };
          function init(me2, seed2) {
            var j, X = [];
            if (seed2 === (seed2 | 0)) {
              X[0] = seed2;
            } else {
              seed2 = "" + seed2;
              for (j = 0; j < seed2.length; ++j) {
                X[j & 7] = X[j & 7] << 15 ^ seed2.charCodeAt(j) + X[j + 1 & 7] << 13;
              }
            }
            while (X.length < 8)
              X.push(0);
            for (j = 0; j < 8 && X[j] === 0; ++j)
              ;
            if (j == 8)
              X[7] = -1;
            else
              X[j];
            me2.x = X;
            me2.i = 0;
            for (j = 256; j > 0; --j) {
              me2.next();
            }
          }
          init(me, seed);
        }
        function copy(f, t) {
          t.x = f.x.slice();
          t.i = f.i;
          return t;
        }
        function impl(seed, opts) {
          if (seed == null)
            seed = +/* @__PURE__ */ new Date();
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (state.x)
              copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.xorshift7 = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // node_modules/seedrandom/lib/xor4096.js
  var require_xor4096 = __commonJS({
    "node_modules/seedrandom/lib/xor4096.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this;
          me.next = function() {
            var w = me.w, X = me.X, i = me.i, t, v;
            me.w = w = w + 1640531527 | 0;
            v = X[i + 34 & 127];
            t = X[i = i + 1 & 127];
            v ^= v << 13;
            t ^= t << 17;
            v ^= v >>> 15;
            t ^= t >>> 12;
            v = X[i] = v ^ t;
            me.i = i;
            return v + (w ^ w >>> 16) | 0;
          };
          function init(me2, seed2) {
            var t, v, i, j, w, X = [], limit = 128;
            if (seed2 === (seed2 | 0)) {
              v = seed2;
              seed2 = null;
            } else {
              seed2 = seed2 + "\0";
              v = 0;
              limit = Math.max(limit, seed2.length);
            }
            for (i = 0, j = -32; j < limit; ++j) {
              if (seed2)
                v ^= seed2.charCodeAt((j + 32) % seed2.length);
              if (j === 0)
                w = v;
              v ^= v << 10;
              v ^= v >>> 15;
              v ^= v << 4;
              v ^= v >>> 13;
              if (j >= 0) {
                w = w + 1640531527 | 0;
                t = X[j & 127] ^= v + w;
                i = 0 == t ? i + 1 : 0;
              }
            }
            if (i >= 128) {
              X[(seed2 && seed2.length || 0) & 127] = -1;
            }
            i = 127;
            for (j = 4 * 128; j > 0; --j) {
              v = X[i + 34 & 127];
              t = X[i = i + 1 & 127];
              v ^= v << 13;
              t ^= t << 17;
              v ^= v >>> 15;
              t ^= t >>> 12;
              X[i] = v ^ t;
            }
            me2.w = w;
            me2.X = X;
            me2.i = i;
          }
          init(me, seed);
        }
        function copy(f, t) {
          t.i = f.i;
          t.w = f.w;
          t.X = f.X.slice();
          return t;
        }
        function impl(seed, opts) {
          if (seed == null)
            seed = +/* @__PURE__ */ new Date();
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (state.X)
              copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.xor4096 = impl;
        }
      })(
        exports,
        // window object or global
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // node_modules/seedrandom/lib/tychei.js
  var require_tychei = __commonJS({
    "node_modules/seedrandom/lib/tychei.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this, strseed = "";
          me.next = function() {
            var b = me.b, c = me.c, d = me.d, a = me.a;
            b = b << 25 ^ b >>> 7 ^ c;
            c = c - d | 0;
            d = d << 24 ^ d >>> 8 ^ a;
            a = a - b | 0;
            me.b = b = b << 20 ^ b >>> 12 ^ c;
            me.c = c = c - d | 0;
            me.d = d << 16 ^ c >>> 16 ^ a;
            return me.a = a - b | 0;
          };
          me.a = 0;
          me.b = 0;
          me.c = 2654435769 | 0;
          me.d = 1367130551;
          if (seed === Math.floor(seed)) {
            me.a = seed / 4294967296 | 0;
            me.b = seed | 0;
          } else {
            strseed += seed;
          }
          for (var k = 0; k < strseed.length + 20; k++) {
            me.b ^= strseed.charCodeAt(k) | 0;
            me.next();
          }
        }
        function copy(f, t) {
          t.a = f.a;
          t.b = f.b;
          t.c = f.c;
          t.d = f.d;
          return t;
        }
        function impl(seed, opts) {
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (typeof state == "object")
              copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.tychei = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // node_modules/seedrandom/seedrandom.js
  var require_seedrandom = __commonJS({
    "node_modules/seedrandom/seedrandom.js"(exports, module) {
      (function(global, pool, math) {
        var width = 256, chunks = 6, digits = 52, rngname = "random", startdenom = math.pow(width, chunks), significance = math.pow(2, digits), overflow = significance * 2, mask = width - 1, nodecrypto;
        function seedrandom2(seed, options, callback) {
          var key = [];
          options = options == true ? { entropy: true } : options || {};
          var shortseed = mixkey(flatten(
            options.entropy ? [seed, tostring(pool)] : seed == null ? autoseed() : seed,
            3
          ), key);
          var arc4 = new ARC4(key);
          var prng = function() {
            var n = arc4.g(chunks), d = startdenom, x = 0;
            while (n < significance) {
              n = (n + x) * width;
              d *= width;
              x = arc4.g(1);
            }
            while (n >= overflow) {
              n /= 2;
              d /= 2;
              x >>>= 1;
            }
            return (n + x) / d;
          };
          prng.int32 = function() {
            return arc4.g(4) | 0;
          };
          prng.quick = function() {
            return arc4.g(4) / 4294967296;
          };
          prng.double = prng;
          mixkey(tostring(arc4.S), pool);
          return (options.pass || callback || function(prng2, seed2, is_math_call, state) {
            if (state) {
              if (state.S) {
                copy(state, arc4);
              }
              prng2.state = function() {
                return copy(arc4, {});
              };
            }
            if (is_math_call) {
              math[rngname] = prng2;
              return seed2;
            } else
              return prng2;
          })(
            prng,
            shortseed,
            "global" in options ? options.global : this == math,
            options.state
          );
        }
        function ARC4(key) {
          var t, keylen = key.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
          if (!keylen) {
            key = [keylen++];
          }
          while (i < width) {
            s[i] = i++;
          }
          for (i = 0; i < width; i++) {
            s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
            s[j] = t;
          }
          (me.g = function(count) {
            var t2, r = 0, i2 = me.i, j2 = me.j, s2 = me.S;
            while (count--) {
              t2 = s2[i2 = mask & i2 + 1];
              r = r * width + s2[mask & (s2[i2] = s2[j2 = mask & j2 + t2]) + (s2[j2] = t2)];
            }
            me.i = i2;
            me.j = j2;
            return r;
          })(width);
        }
        function copy(f, t) {
          t.i = f.i;
          t.j = f.j;
          t.S = f.S.slice();
          return t;
        }
        function flatten(obj, depth) {
          var result = [], typ = typeof obj, prop;
          if (depth && typ == "object") {
            for (prop in obj) {
              try {
                result.push(flatten(obj[prop], depth - 1));
              } catch (e) {
              }
            }
          }
          return result.length ? result : typ == "string" ? obj : obj + "\0";
        }
        function mixkey(seed, key) {
          var stringseed = seed + "", smear, j = 0;
          while (j < stringseed.length) {
            key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
          }
          return tostring(key);
        }
        function autoseed() {
          try {
            var out;
            if (nodecrypto && (out = nodecrypto.randomBytes)) {
              out = out(width);
            } else {
              out = new Uint8Array(width);
              (global.crypto || global.msCrypto).getRandomValues(out);
            }
            return tostring(out);
          } catch (e) {
            var browser = global.navigator, plugins = browser && browser.plugins;
            return [+/* @__PURE__ */ new Date(), global, plugins, global.screen, tostring(pool)];
          }
        }
        function tostring(a) {
          return String.fromCharCode.apply(0, a);
        }
        mixkey(math.random(), pool);
        if (typeof module == "object" && module.exports) {
          module.exports = seedrandom2;
          try {
            nodecrypto = __require("crypto");
          } catch (ex) {
          }
        } else if (typeof define == "function" && define.amd) {
          define(function() {
            return seedrandom2;
          });
        } else {
          math["seed" + rngname] = seedrandom2;
        }
      })(
        // global: `self` in browsers (including strict mode and web workers),
        // otherwise `this` in Node and other environments
        typeof self !== "undefined" ? self : exports,
        [],
        // pool: entropy pool starts empty
        Math
        // math: package containing random, pow, and seedrandom
      );
    }
  });

  // node_modules/seedrandom/index.js
  var require_seedrandom2 = __commonJS({
    "node_modules/seedrandom/index.js"(exports, module) {
      var alea = require_alea();
      var xor128 = require_xor128();
      var xorwow = require_xorwow();
      var xorshift7 = require_xorshift7();
      var xor4096 = require_xor4096();
      var tychei = require_tychei();
      var sr = require_seedrandom();
      sr.alea = alea;
      sr.xor128 = xor128;
      sr.xorwow = xorwow;
      sr.xorshift7 = xorshift7;
      sr.xor4096 = xor4096;
      sr.tychei = tychei;
      module.exports = sr;
    }
  });

  // node_modules/random-words/index.js
  var require_random_words = __commonJS({
    "node_modules/random-words/index.js"(exports, module) {
      var seedrandom2 = require_seedrandom2();
      var wordList = [
        // Borrowed from xkcd password generator which borrowed it from wherever
        "ability",
        "able",
        "aboard",
        "about",
        "above",
        "accept",
        "accident",
        "according",
        "account",
        "accurate",
        "acres",
        "across",
        "act",
        "action",
        "active",
        "activity",
        "actual",
        "actually",
        "add",
        "addition",
        "additional",
        "adjective",
        "adult",
        "adventure",
        "advice",
        "affect",
        "afraid",
        "after",
        "afternoon",
        "again",
        "against",
        "age",
        "ago",
        "agree",
        "ahead",
        "aid",
        "air",
        "airplane",
        "alike",
        "alive",
        "all",
        "allow",
        "almost",
        "alone",
        "along",
        "aloud",
        "alphabet",
        "already",
        "also",
        "although",
        "am",
        "among",
        "amount",
        "ancient",
        "angle",
        "angry",
        "animal",
        "announced",
        "another",
        "answer",
        "ants",
        "any",
        "anybody",
        "anyone",
        "anything",
        "anyway",
        "anywhere",
        "apart",
        "apartment",
        "appearance",
        "apple",
        "applied",
        "appropriate",
        "are",
        "area",
        "arm",
        "army",
        "around",
        "arrange",
        "arrangement",
        "arrive",
        "arrow",
        "art",
        "article",
        "as",
        "aside",
        "ask",
        "asleep",
        "at",
        "ate",
        "atmosphere",
        "atom",
        "atomic",
        "attached",
        "attack",
        "attempt",
        "attention",
        "audience",
        "author",
        "automobile",
        "available",
        "average",
        "avoid",
        "aware",
        "away",
        "baby",
        "back",
        "bad",
        "badly",
        "bag",
        "balance",
        "ball",
        "balloon",
        "band",
        "bank",
        "bar",
        "bare",
        "bark",
        "barn",
        "base",
        "baseball",
        "basic",
        "basis",
        "basket",
        "bat",
        "battle",
        "be",
        "bean",
        "bear",
        "beat",
        "beautiful",
        "beauty",
        "became",
        "because",
        "become",
        "becoming",
        "bee",
        "been",
        "before",
        "began",
        "beginning",
        "begun",
        "behavior",
        "behind",
        "being",
        "believed",
        "bell",
        "belong",
        "below",
        "belt",
        "bend",
        "beneath",
        "bent",
        "beside",
        "best",
        "bet",
        "better",
        "between",
        "beyond",
        "bicycle",
        "bigger",
        "biggest",
        "bill",
        "birds",
        "birth",
        "birthday",
        "bit",
        "bite",
        "black",
        "blank",
        "blanket",
        "blew",
        "blind",
        "block",
        "blood",
        "blow",
        "blue",
        "board",
        "boat",
        "body",
        "bone",
        "book",
        "border",
        "born",
        "both",
        "bottle",
        "bottom",
        "bound",
        "bow",
        "bowl",
        "box",
        "boy",
        "brain",
        "branch",
        "brass",
        "brave",
        "bread",
        "break",
        "breakfast",
        "breath",
        "breathe",
        "breathing",
        "breeze",
        "brick",
        "bridge",
        "brief",
        "bright",
        "bring",
        "broad",
        "broke",
        "broken",
        "brother",
        "brought",
        "brown",
        "brush",
        "buffalo",
        "build",
        "building",
        "built",
        "buried",
        "burn",
        "burst",
        "bus",
        "bush",
        "business",
        "busy",
        "but",
        "butter",
        "buy",
        "by",
        "cabin",
        "cage",
        "cake",
        "call",
        "calm",
        "came",
        "camera",
        "camp",
        "can",
        "canal",
        "cannot",
        "cap",
        "capital",
        "captain",
        "captured",
        "car",
        "carbon",
        "card",
        "care",
        "careful",
        "carefully",
        "carried",
        "carry",
        "case",
        "cast",
        "castle",
        "cat",
        "catch",
        "cattle",
        "caught",
        "cause",
        "cave",
        "cell",
        "cent",
        "center",
        "central",
        "century",
        "certain",
        "certainly",
        "chain",
        "chair",
        "chamber",
        "chance",
        "change",
        "changing",
        "chapter",
        "character",
        "characteristic",
        "charge",
        "chart",
        "check",
        "cheese",
        "chemical",
        "chest",
        "chicken",
        "chief",
        "child",
        "children",
        "choice",
        "choose",
        "chose",
        "chosen",
        "church",
        "circle",
        "circus",
        "citizen",
        "city",
        "class",
        "classroom",
        "claws",
        "clay",
        "clean",
        "clear",
        "clearly",
        "climate",
        "climb",
        "clock",
        "close",
        "closely",
        "closer",
        "cloth",
        "clothes",
        "clothing",
        "cloud",
        "club",
        "coach",
        "coal",
        "coast",
        "coat",
        "coffee",
        "cold",
        "collect",
        "college",
        "colony",
        "color",
        "column",
        "combination",
        "combine",
        "come",
        "comfortable",
        "coming",
        "command",
        "common",
        "community",
        "company",
        "compare",
        "compass",
        "complete",
        "completely",
        "complex",
        "composed",
        "composition",
        "compound",
        "concerned",
        "condition",
        "congress",
        "connected",
        "consider",
        "consist",
        "consonant",
        "constantly",
        "construction",
        "contain",
        "continent",
        "continued",
        "contrast",
        "control",
        "conversation",
        "cook",
        "cookies",
        "cool",
        "copper",
        "copy",
        "corn",
        "corner",
        "correct",
        "correctly",
        "cost",
        "cotton",
        "could",
        "count",
        "country",
        "couple",
        "courage",
        "course",
        "court",
        "cover",
        "cow",
        "cowboy",
        "crack",
        "cream",
        "create",
        "creature",
        "crew",
        "crop",
        "cross",
        "crowd",
        "cry",
        "cup",
        "curious",
        "current",
        "curve",
        "customs",
        "cut",
        "cutting",
        "daily",
        "damage",
        "dance",
        "danger",
        "dangerous",
        "dark",
        "darkness",
        "date",
        "daughter",
        "dawn",
        "day",
        "dead",
        "deal",
        "dear",
        "death",
        "decide",
        "declared",
        "deep",
        "deeply",
        "deer",
        "definition",
        "degree",
        "depend",
        "depth",
        "describe",
        "desert",
        "design",
        "desk",
        "detail",
        "determine",
        "develop",
        "development",
        "diagram",
        "diameter",
        "did",
        "die",
        "differ",
        "difference",
        "different",
        "difficult",
        "difficulty",
        "dig",
        "dinner",
        "direct",
        "direction",
        "directly",
        "dirt",
        "dirty",
        "disappear",
        "discover",
        "discovery",
        "discuss",
        "discussion",
        "disease",
        "dish",
        "distance",
        "distant",
        "divide",
        "division",
        "do",
        "doctor",
        "does",
        "dog",
        "doing",
        "doll",
        "dollar",
        "done",
        "donkey",
        "door",
        "dot",
        "double",
        "doubt",
        "down",
        "dozen",
        "draw",
        "drawn",
        "dream",
        "dress",
        "drew",
        "dried",
        "drink",
        "drive",
        "driven",
        "driver",
        "driving",
        "drop",
        "dropped",
        "drove",
        "dry",
        "duck",
        "due",
        "dug",
        "dull",
        "during",
        "dust",
        "duty",
        "each",
        "eager",
        "ear",
        "earlier",
        "early",
        "earn",
        "earth",
        "easier",
        "easily",
        "east",
        "easy",
        "eat",
        "eaten",
        "edge",
        "education",
        "effect",
        "effort",
        "egg",
        "eight",
        "either",
        "electric",
        "electricity",
        "element",
        "elephant",
        "eleven",
        "else",
        "empty",
        "end",
        "enemy",
        "energy",
        "engine",
        "engineer",
        "enjoy",
        "enough",
        "enter",
        "entire",
        "entirely",
        "environment",
        "equal",
        "equally",
        "equator",
        "equipment",
        "escape",
        "especially",
        "essential",
        "establish",
        "even",
        "evening",
        "event",
        "eventually",
        "ever",
        "every",
        "everybody",
        "everyone",
        "everything",
        "everywhere",
        "evidence",
        "exact",
        "exactly",
        "examine",
        "example",
        "excellent",
        "except",
        "exchange",
        "excited",
        "excitement",
        "exciting",
        "exclaimed",
        "exercise",
        "exist",
        "expect",
        "experience",
        "experiment",
        "explain",
        "explanation",
        "explore",
        "express",
        "expression",
        "extra",
        "eye",
        "face",
        "facing",
        "fact",
        "factor",
        "factory",
        "failed",
        "fair",
        "fairly",
        "fall",
        "fallen",
        "familiar",
        "family",
        "famous",
        "far",
        "farm",
        "farmer",
        "farther",
        "fast",
        "fastened",
        "faster",
        "fat",
        "father",
        "favorite",
        "fear",
        "feathers",
        "feature",
        "fed",
        "feed",
        "feel",
        "feet",
        "fell",
        "fellow",
        "felt",
        "fence",
        "few",
        "fewer",
        "field",
        "fierce",
        "fifteen",
        "fifth",
        "fifty",
        "fight",
        "fighting",
        "figure",
        "fill",
        "film",
        "final",
        "finally",
        "find",
        "fine",
        "finest",
        "finger",
        "finish",
        "fire",
        "fireplace",
        "firm",
        "first",
        "fish",
        "five",
        "fix",
        "flag",
        "flame",
        "flat",
        "flew",
        "flies",
        "flight",
        "floating",
        "floor",
        "flow",
        "flower",
        "fly",
        "fog",
        "folks",
        "follow",
        "food",
        "foot",
        "football",
        "for",
        "force",
        "foreign",
        "forest",
        "forget",
        "forgot",
        "forgotten",
        "form",
        "former",
        "fort",
        "forth",
        "forty",
        "forward",
        "fought",
        "found",
        "four",
        "fourth",
        "fox",
        "frame",
        "free",
        "freedom",
        "frequently",
        "fresh",
        "friend",
        "friendly",
        "frighten",
        "frog",
        "from",
        "front",
        "frozen",
        "fruit",
        "fuel",
        "full",
        "fully",
        "fun",
        "function",
        "funny",
        "fur",
        "furniture",
        "further",
        "future",
        "gain",
        "game",
        "garage",
        "garden",
        "gas",
        "gasoline",
        "gate",
        "gather",
        "gave",
        "general",
        "generally",
        "gentle",
        "gently",
        "get",
        "getting",
        "giant",
        "gift",
        "girl",
        "give",
        "given",
        "giving",
        "glad",
        "glass",
        "globe",
        "go",
        "goes",
        "gold",
        "golden",
        "gone",
        "good",
        "goose",
        "got",
        "government",
        "grabbed",
        "grade",
        "gradually",
        "grain",
        "grandfather",
        "grandmother",
        "graph",
        "grass",
        "gravity",
        "gray",
        "great",
        "greater",
        "greatest",
        "greatly",
        "green",
        "grew",
        "ground",
        "group",
        "grow",
        "grown",
        "growth",
        "guard",
        "guess",
        "guide",
        "gulf",
        "gun",
        "habit",
        "had",
        "hair",
        "half",
        "halfway",
        "hall",
        "hand",
        "handle",
        "handsome",
        "hang",
        "happen",
        "happened",
        "happily",
        "happy",
        "harbor",
        "hard",
        "harder",
        "hardly",
        "has",
        "hat",
        "have",
        "having",
        "hay",
        "he",
        "headed",
        "heading",
        "health",
        "heard",
        "hearing",
        "heart",
        "heat",
        "heavy",
        "height",
        "held",
        "hello",
        "help",
        "helpful",
        "her",
        "herd",
        "here",
        "herself",
        "hidden",
        "hide",
        "high",
        "higher",
        "highest",
        "highway",
        "hill",
        "him",
        "himself",
        "his",
        "history",
        "hit",
        "hold",
        "hole",
        "hollow",
        "home",
        "honor",
        "hope",
        "horn",
        "horse",
        "hospital",
        "hot",
        "hour",
        "house",
        "how",
        "however",
        "huge",
        "human",
        "hundred",
        "hung",
        "hungry",
        "hunt",
        "hunter",
        "hurried",
        "hurry",
        "hurt",
        "husband",
        "ice",
        "idea",
        "identity",
        "if",
        "ill",
        "image",
        "imagine",
        "immediately",
        "importance",
        "important",
        "impossible",
        "improve",
        "in",
        "inch",
        "include",
        "including",
        "income",
        "increase",
        "indeed",
        "independent",
        "indicate",
        "individual",
        "industrial",
        "industry",
        "influence",
        "information",
        "inside",
        "instance",
        "instant",
        "instead",
        "instrument",
        "interest",
        "interior",
        "into",
        "introduced",
        "invented",
        "involved",
        "iron",
        "is",
        "island",
        "it",
        "its",
        "itself",
        "jack",
        "jar",
        "jet",
        "job",
        "join",
        "joined",
        "journey",
        "joy",
        "judge",
        "jump",
        "jungle",
        "just",
        "keep",
        "kept",
        "key",
        "kids",
        "kill",
        "kind",
        "kitchen",
        "knew",
        "knife",
        "know",
        "knowledge",
        "known",
        "label",
        "labor",
        "lack",
        "lady",
        "laid",
        "lake",
        "lamp",
        "land",
        "language",
        "large",
        "larger",
        "largest",
        "last",
        "late",
        "later",
        "laugh",
        "law",
        "lay",
        "layers",
        "lead",
        "leader",
        "leaf",
        "learn",
        "least",
        "leather",
        "leave",
        "leaving",
        "led",
        "left",
        "leg",
        "length",
        "lesson",
        "let",
        "letter",
        "level",
        "library",
        "lie",
        "life",
        "lift",
        "light",
        "like",
        "likely",
        "limited",
        "line",
        "lion",
        "lips",
        "liquid",
        "list",
        "listen",
        "little",
        "live",
        "living",
        "load",
        "local",
        "locate",
        "location",
        "log",
        "lonely",
        "long",
        "longer",
        "look",
        "loose",
        "lose",
        "loss",
        "lost",
        "lot",
        "loud",
        "love",
        "lovely",
        "low",
        "lower",
        "luck",
        "lucky",
        "lunch",
        "lungs",
        "lying",
        "machine",
        "machinery",
        "mad",
        "made",
        "magic",
        "magnet",
        "mail",
        "main",
        "mainly",
        "major",
        "make",
        "making",
        "man",
        "managed",
        "manner",
        "manufacturing",
        "many",
        "map",
        "mark",
        "market",
        "married",
        "mass",
        "massage",
        "master",
        "material",
        "mathematics",
        "matter",
        "may",
        "maybe",
        "me",
        "meal",
        "mean",
        "means",
        "meant",
        "measure",
        "meat",
        "medicine",
        "meet",
        "melted",
        "member",
        "memory",
        "men",
        "mental",
        "merely",
        "met",
        "metal",
        "method",
        "mice",
        "middle",
        "might",
        "mighty",
        "mile",
        "military",
        "milk",
        "mill",
        "mind",
        "mine",
        "minerals",
        "minute",
        "mirror",
        "missing",
        "mission",
        "mistake",
        "mix",
        "mixture",
        "model",
        "modern",
        "molecular",
        "moment",
        "money",
        "monkey",
        "month",
        "mood",
        "moon",
        "more",
        "morning",
        "most",
        "mostly",
        "mother",
        "motion",
        "motor",
        "mountain",
        "mouse",
        "mouth",
        "move",
        "movement",
        "movie",
        "moving",
        "mud",
        "muscle",
        "music",
        "musical",
        "must",
        "my",
        "myself",
        "mysterious",
        "nails",
        "name",
        "nation",
        "national",
        "native",
        "natural",
        "naturally",
        "nature",
        "near",
        "nearby",
        "nearer",
        "nearest",
        "nearly",
        "necessary",
        "neck",
        "needed",
        "needle",
        "needs",
        "negative",
        "neighbor",
        "neighborhood",
        "nervous",
        "nest",
        "never",
        "new",
        "news",
        "newspaper",
        "next",
        "nice",
        "night",
        "nine",
        "no",
        "nobody",
        "nodded",
        "noise",
        "none",
        "noon",
        "nor",
        "north",
        "nose",
        "not",
        "note",
        "noted",
        "nothing",
        "notice",
        "noun",
        "now",
        "number",
        "numeral",
        "nuts",
        "object",
        "observe",
        "obtain",
        "occasionally",
        "occur",
        "ocean",
        "of",
        "off",
        "offer",
        "office",
        "officer",
        "official",
        "oil",
        "old",
        "older",
        "oldest",
        "on",
        "once",
        "one",
        "only",
        "onto",
        "open",
        "operation",
        "opinion",
        "opportunity",
        "opposite",
        "or",
        "orange",
        "orbit",
        "order",
        "ordinary",
        "organization",
        "organized",
        "origin",
        "original",
        "other",
        "ought",
        "our",
        "ourselves",
        "out",
        "outer",
        "outline",
        "outside",
        "over",
        "own",
        "owner",
        "oxygen",
        "pack",
        "package",
        "page",
        "paid",
        "pain",
        "paint",
        "pair",
        "palace",
        "pale",
        "pan",
        "paper",
        "paragraph",
        "parallel",
        "parent",
        "park",
        "part",
        "particles",
        "particular",
        "particularly",
        "partly",
        "parts",
        "party",
        "pass",
        "passage",
        "past",
        "path",
        "pattern",
        "pay",
        "peace",
        "pen",
        "pencil",
        "people",
        "per",
        "percent",
        "perfect",
        "perfectly",
        "perhaps",
        "period",
        "person",
        "personal",
        "pet",
        "phrase",
        "physical",
        "piano",
        "pick",
        "picture",
        "pictured",
        "pie",
        "piece",
        "pig",
        "pile",
        "pilot",
        "pine",
        "pink",
        "pipe",
        "pitch",
        "place",
        "plain",
        "plan",
        "plane",
        "planet",
        "planned",
        "planning",
        "plant",
        "plastic",
        "plate",
        "plates",
        "play",
        "pleasant",
        "please",
        "pleasure",
        "plenty",
        "plural",
        "plus",
        "pocket",
        "poem",
        "poet",
        "poetry",
        "point",
        "pole",
        "police",
        "policeman",
        "political",
        "pond",
        "pony",
        "pool",
        "poor",
        "popular",
        "population",
        "porch",
        "port",
        "position",
        "positive",
        "possible",
        "possibly",
        "post",
        "pot",
        "potatoes",
        "pound",
        "pour",
        "powder",
        "power",
        "powerful",
        "practical",
        "practice",
        "prepare",
        "present",
        "president",
        "press",
        "pressure",
        "pretty",
        "prevent",
        "previous",
        "price",
        "pride",
        "primitive",
        "principal",
        "principle",
        "printed",
        "private",
        "prize",
        "probably",
        "problem",
        "process",
        "produce",
        "product",
        "production",
        "program",
        "progress",
        "promised",
        "proper",
        "properly",
        "property",
        "protection",
        "proud",
        "prove",
        "provide",
        "public",
        "pull",
        "pupil",
        "pure",
        "purple",
        "purpose",
        "push",
        "put",
        "putting",
        "quarter",
        "queen",
        "question",
        "quick",
        "quickly",
        "quiet",
        "quietly",
        "quite",
        "rabbit",
        "race",
        "radio",
        "railroad",
        "rain",
        "raise",
        "ran",
        "ranch",
        "range",
        "rapidly",
        "rate",
        "rather",
        "raw",
        "rays",
        "reach",
        "read",
        "reader",
        "ready",
        "real",
        "realize",
        "rear",
        "reason",
        "recall",
        "receive",
        "recent",
        "recently",
        "recognize",
        "record",
        "red",
        "refer",
        "refused",
        "region",
        "regular",
        "related",
        "relationship",
        "religious",
        "remain",
        "remarkable",
        "remember",
        "remove",
        "repeat",
        "replace",
        "replied",
        "report",
        "represent",
        "require",
        "research",
        "respect",
        "rest",
        "result",
        "return",
        "review",
        "rhyme",
        "rhythm",
        "rice",
        "rich",
        "ride",
        "riding",
        "right",
        "ring",
        "rise",
        "rising",
        "river",
        "road",
        "roar",
        "rock",
        "rocket",
        "rocky",
        "rod",
        "roll",
        "roof",
        "room",
        "root",
        "rope",
        "rose",
        "rough",
        "round",
        "route",
        "row",
        "rubbed",
        "rubber",
        "rule",
        "ruler",
        "run",
        "running",
        "rush",
        "sad",
        "saddle",
        "safe",
        "safety",
        "said",
        "sail",
        "sale",
        "salmon",
        "salt",
        "same",
        "sand",
        "sang",
        "sat",
        "satellites",
        "satisfied",
        "save",
        "saved",
        "saw",
        "say",
        "scale",
        "scared",
        "scene",
        "school",
        "science",
        "scientific",
        "scientist",
        "score",
        "screen",
        "sea",
        "search",
        "season",
        "seat",
        "second",
        "secret",
        "section",
        "see",
        "seed",
        "seeing",
        "seems",
        "seen",
        "seldom",
        "select",
        "selection",
        "sell",
        "send",
        "sense",
        "sent",
        "sentence",
        "separate",
        "series",
        "serious",
        "serve",
        "service",
        "sets",
        "setting",
        "settle",
        "settlers",
        "seven",
        "several",
        "shade",
        "shadow",
        "shake",
        "shaking",
        "shall",
        "shallow",
        "shape",
        "share",
        "sharp",
        "she",
        "sheep",
        "sheet",
        "shelf",
        "shells",
        "shelter",
        "shine",
        "shinning",
        "ship",
        "shirt",
        "shoe",
        "shoot",
        "shop",
        "shore",
        "short",
        "shorter",
        "shot",
        "should",
        "shoulder",
        "shout",
        "show",
        "shown",
        "shut",
        "sick",
        "sides",
        "sight",
        "sign",
        "signal",
        "silence",
        "silent",
        "silk",
        "silly",
        "silver",
        "similar",
        "simple",
        "simplest",
        "simply",
        "since",
        "sing",
        "single",
        "sink",
        "sister",
        "sit",
        "sitting",
        "situation",
        "six",
        "size",
        "skill",
        "skin",
        "sky",
        "slabs",
        "slave",
        "sleep",
        "slept",
        "slide",
        "slight",
        "slightly",
        "slip",
        "slipped",
        "slope",
        "slow",
        "slowly",
        "small",
        "smaller",
        "smallest",
        "smell",
        "smile",
        "smoke",
        "smooth",
        "snake",
        "snow",
        "so",
        "soap",
        "social",
        "society",
        "soft",
        "softly",
        "soil",
        "solar",
        "sold",
        "soldier",
        "solid",
        "solution",
        "solve",
        "some",
        "somebody",
        "somehow",
        "someone",
        "something",
        "sometime",
        "somewhere",
        "son",
        "song",
        "soon",
        "sort",
        "sound",
        "source",
        "south",
        "southern",
        "space",
        "speak",
        "special",
        "species",
        "specific",
        "speech",
        "speed",
        "spell",
        "spend",
        "spent",
        "spider",
        "spin",
        "spirit",
        "spite",
        "split",
        "spoken",
        "sport",
        "spread",
        "spring",
        "square",
        "stage",
        "stairs",
        "stand",
        "standard",
        "star",
        "stared",
        "start",
        "state",
        "statement",
        "station",
        "stay",
        "steady",
        "steam",
        "steel",
        "steep",
        "stems",
        "step",
        "stepped",
        "stick",
        "stiff",
        "still",
        "stock",
        "stomach",
        "stone",
        "stood",
        "stop",
        "stopped",
        "store",
        "storm",
        "story",
        "stove",
        "straight",
        "strange",
        "stranger",
        "straw",
        "stream",
        "street",
        "strength",
        "stretch",
        "strike",
        "string",
        "strip",
        "strong",
        "stronger",
        "struck",
        "structure",
        "struggle",
        "stuck",
        "student",
        "studied",
        "studying",
        "subject",
        "substance",
        "success",
        "successful",
        "such",
        "sudden",
        "suddenly",
        "sugar",
        "suggest",
        "suit",
        "sum",
        "summer",
        "sun",
        "sunlight",
        "supper",
        "supply",
        "support",
        "suppose",
        "sure",
        "surface",
        "surprise",
        "surrounded",
        "swam",
        "sweet",
        "swept",
        "swim",
        "swimming",
        "swing",
        "swung",
        "syllable",
        "symbol",
        "system",
        "table",
        "tail",
        "take",
        "taken",
        "tales",
        "talk",
        "tall",
        "tank",
        "tape",
        "task",
        "taste",
        "taught",
        "tax",
        "tea",
        "teach",
        "teacher",
        "team",
        "tears",
        "teeth",
        "telephone",
        "television",
        "tell",
        "temperature",
        "ten",
        "tent",
        "term",
        "terrible",
        "test",
        "than",
        "thank",
        "that",
        "thee",
        "them",
        "themselves",
        "then",
        "theory",
        "there",
        "therefore",
        "these",
        "they",
        "thick",
        "thin",
        "thing",
        "think",
        "third",
        "thirty",
        "this",
        "those",
        "thou",
        "though",
        "thought",
        "thousand",
        "thread",
        "three",
        "threw",
        "throat",
        "through",
        "throughout",
        "throw",
        "thrown",
        "thumb",
        "thus",
        "thy",
        "tide",
        "tie",
        "tight",
        "tightly",
        "till",
        "time",
        "tin",
        "tiny",
        "tip",
        "tired",
        "title",
        "to",
        "tobacco",
        "today",
        "together",
        "told",
        "tomorrow",
        "tone",
        "tongue",
        "tonight",
        "too",
        "took",
        "tool",
        "top",
        "topic",
        "torn",
        "total",
        "touch",
        "toward",
        "tower",
        "town",
        "toy",
        "trace",
        "track",
        "trade",
        "traffic",
        "trail",
        "train",
        "transportation",
        "trap",
        "travel",
        "treated",
        "tree",
        "triangle",
        "tribe",
        "trick",
        "tried",
        "trip",
        "troops",
        "tropical",
        "trouble",
        "truck",
        "trunk",
        "truth",
        "try",
        "tube",
        "tune",
        "turn",
        "twelve",
        "twenty",
        "twice",
        "two",
        "type",
        "typical",
        "uncle",
        "under",
        "underline",
        "understanding",
        "unhappy",
        "union",
        "unit",
        "universe",
        "unknown",
        "unless",
        "until",
        "unusual",
        "up",
        "upon",
        "upper",
        "upward",
        "us",
        "use",
        "useful",
        "using",
        "usual",
        "usually",
        "valley",
        "valuable",
        "value",
        "vapor",
        "variety",
        "various",
        "vast",
        "vegetable",
        "verb",
        "vertical",
        "very",
        "vessels",
        "victory",
        "view",
        "village",
        "visit",
        "visitor",
        "voice",
        "volume",
        "vote",
        "vowel",
        "voyage",
        "wagon",
        "wait",
        "walk",
        "wall",
        "want",
        "war",
        "warm",
        "warn",
        "was",
        "wash",
        "waste",
        "watch",
        "water",
        "wave",
        "way",
        "we",
        "weak",
        "wealth",
        "wear",
        "weather",
        "week",
        "weigh",
        "weight",
        "welcome",
        "well",
        "went",
        "were",
        "west",
        "western",
        "wet",
        "whale",
        "what",
        "whatever",
        "wheat",
        "wheel",
        "when",
        "whenever",
        "where",
        "wherever",
        "whether",
        "which",
        "while",
        "whispered",
        "whistle",
        "white",
        "who",
        "whole",
        "whom",
        "whose",
        "why",
        "wide",
        "widely",
        "wife",
        "wild",
        "will",
        "willing",
        "win",
        "wind",
        "window",
        "wing",
        "winter",
        "wire",
        "wise",
        "wish",
        "with",
        "within",
        "without",
        "wolf",
        "women",
        "won",
        "wonder",
        "wonderful",
        "wood",
        "wooden",
        "wool",
        "word",
        "wore",
        "work",
        "worker",
        "world",
        "worried",
        "worry",
        "worse",
        "worth",
        "would",
        "wrapped",
        "write",
        "writer",
        "writing",
        "written",
        "wrong",
        "wrote",
        "yard",
        "year",
        "yellow",
        "yes",
        "yesterday",
        "yet",
        "you",
        "young",
        "younger",
        "your",
        "yourself",
        "youth",
        "zero",
        "zebra",
        "zipper",
        "zoo",
        "zulu"
      ];
      function words(options) {
        const random = (options == null ? void 0 : options.seed) ? new seedrandom2(options.seed) : null;
        function word() {
          if (options && options.maxLength > 1) {
            return generateWordWithMaxLength();
          } else {
            return generateRandomWord();
          }
        }
        function generateWordWithMaxLength() {
          var rightSize = false;
          var wordUsed;
          while (!rightSize) {
            wordUsed = generateRandomWord();
            if (wordUsed.length <= options.maxLength) {
              rightSize = true;
            }
          }
          return wordUsed;
        }
        function generateRandomWord() {
          return wordList[randInt(wordList.length)];
        }
        function randInt(lessThan) {
          const r = random ? random() : Math.random();
          return Math.floor(r * lessThan);
        }
        if (typeof options === "undefined") {
          return word();
        }
        if (typeof options === "number") {
          options = { exactly: options };
        }
        if (options.exactly) {
          options.min = options.exactly;
          options.max = options.exactly;
        }
        if (typeof options.wordsPerString !== "number") {
          options.wordsPerString = 1;
        }
        if (typeof options.formatter !== "function") {
          options.formatter = (word2) => word2;
        }
        if (typeof options.separator !== "string") {
          options.separator = " ";
        }
        var total = options.min + randInt(options.max + 1 - options.min);
        var results = [];
        var token = "";
        var relativeIndex = 0;
        for (var i = 0; i < total * options.wordsPerString; i++) {
          if (relativeIndex === options.wordsPerString - 1) {
            token += options.formatter(word(), relativeIndex);
          } else {
            token += options.formatter(word(), relativeIndex) + options.separator;
          }
          relativeIndex++;
          if ((i + 1) % options.wordsPerString === 0) {
            results.push(token);
            token = "";
            relativeIndex = 0;
          }
        }
        if (typeof options.join === "string") {
          results = results.join(options.join);
        }
        return results;
      }
      module.exports = words;
      words.wordList = wordList;
    }
  });

  // node_modules/jspsych/dist/index.js
  __toESM(require_auto_bind(), 1);
  __toESM(require_random_words(), 1);
  __toESM(require_alea(), 1);
  var ParameterType = /* @__PURE__ */ ((ParameterType2) => {
    ParameterType2[ParameterType2["BOOL"] = 0] = "BOOL";
    ParameterType2[ParameterType2["STRING"] = 1] = "STRING";
    ParameterType2[ParameterType2["INT"] = 2] = "INT";
    ParameterType2[ParameterType2["FLOAT"] = 3] = "FLOAT";
    ParameterType2[ParameterType2["FUNCTION"] = 4] = "FUNCTION";
    ParameterType2[ParameterType2["KEY"] = 5] = "KEY";
    ParameterType2[ParameterType2["KEYS"] = 6] = "KEYS";
    ParameterType2[ParameterType2["SELECT"] = 7] = "SELECT";
    ParameterType2[ParameterType2["HTML_STRING"] = 8] = "HTML_STRING";
    ParameterType2[ParameterType2["IMAGE"] = 9] = "IMAGE";
    ParameterType2[ParameterType2["AUDIO"] = 10] = "AUDIO";
    ParameterType2[ParameterType2["VIDEO"] = 11] = "VIDEO";
    ParameterType2[ParameterType2["OBJECT"] = 12] = "OBJECT";
    ParameterType2[ParameterType2["COMPLEX"] = 13] = "COMPLEX";
    ParameterType2[ParameterType2["TIMELINE"] = 14] = "TIMELINE";
    return ParameterType2;
  })(ParameterType || {});
  [
    ParameterType.AUDIO,
    ParameterType.IMAGE,
    ParameterType.VIDEO
  ];
  var MigrationError = class extends Error {
    constructor(message = "The global `jsPsych` variable is no longer available in jsPsych v7.") {
      super(
        `${message} Please follow the migration guide at https://www.jspsych.org/7.0/support/migration-v7/ to update your experiment.`
      );
      this.name = "MigrationError";
    }
  };
  window.jsPsych = {
    get init() {
      throw new MigrationError("`jsPsych.init()` was replaced by `initJsPsych()` in jsPsych v7.");
    },
    get data() {
      throw new MigrationError();
    },
    get randomization() {
      throw new MigrationError();
    },
    get turk() {
      throw new MigrationError();
    },
    get pluginAPI() {
      throw new MigrationError();
    },
    get ALL_KEYS() {
      throw new MigrationError(
        'jsPsych.ALL_KEYS was replaced by the "ALL_KEYS" string in jsPsych v7.'
      );
    },
    get NO_KEYS() {
      throw new MigrationError('jsPsych.NO_KEYS was replaced by the "NO_KEYS" string in jsPsych v7.');
    }
  };
  if (typeof window !== "undefined" && window.hasOwnProperty("webkitAudioContext") && !window.hasOwnProperty("AudioContext")) {
    window.AudioContext = webkitAudioContext;
  }

  // node_modules/@jspsych/plugin-html-button-response/dist/index.js
  var version = "2.1.0";
  var info = {
    name: "html-button-response",
    version,
    parameters: {
      /** The HTML content to be displayed. */
      stimulus: {
        type: ParameterType.HTML_STRING,
        default: void 0
      },
      /** Labels for the buttons. Each different string in the array will generate a different button. */
      choices: {
        type: ParameterType.STRING,
        default: void 0,
        array: true
      },
      /**
       * A function that generates the HTML for each button in the `choices` array. The function gets the string and index of the item in the `choices` array and should return valid HTML. If you want to use different markup for each button, you can do that by using a conditional on either parameter. The default parameter returns a button element with the text label of the choice.
       */
      button_html: {
        type: ParameterType.FUNCTION,
        default: function(choice, choice_index) {
          return `<button class="jspsych-btn">${choice}</button>`;
        }
      },
      /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
      prompt: {
        type: ParameterType.HTML_STRING,
        default: null
      },
      /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
      stimulus_duration: {
        type: ParameterType.INT,
        default: null
      },
      /** ow long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely.  */
      trial_duration: {
        type: ParameterType.INT,
        default: null
      },
      /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter. */
      button_layout: {
        type: ParameterType.STRING,
        default: "grid"
      },
      /**
       * The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the number of rows will be determined automatically based on the number of buttons and the number of columns.
       */
      grid_rows: {
        type: ParameterType.INT,
        default: 1
      },
      /**
       * The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the number of columns will be determined automatically based on the number of buttons and the number of rows.
       */
      grid_columns: {
        type: ParameterType.INT,
        default: null
      },
      /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
      response_ends_trial: {
        type: ParameterType.BOOL,
        default: true
      },
      /** How long the button will delay enabling in milliseconds. */
      enable_button_after: {
        type: ParameterType.INT,
        default: 0
      }
    },
    data: {
      /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
      rt: {
        type: ParameterType.INT
      },
      /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. */
      response: {
        type: ParameterType.INT
      },
      /** The HTML content that was displayed on the screen. */
      stimulus: {
        type: ParameterType.HTML_STRING
      }
    },
    // prettier-ignore
    citations: {
      "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
      "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
    }
  };
  var _HtmlButtonResponsePlugin = class {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      const stimulusElement = document.createElement("div");
      stimulusElement.id = "jspsych-html-button-response-stimulus";
      stimulusElement.innerHTML = trial.stimulus;
      display_element.appendChild(stimulusElement);
      const buttonGroupElement = document.createElement("div");
      buttonGroupElement.id = "jspsych-html-button-response-btngroup";
      if (trial.button_layout === "grid") {
        buttonGroupElement.classList.add("jspsych-btn-group-grid");
        if (trial.grid_rows === null && trial.grid_columns === null) {
          throw new Error(
            "You cannot set `grid_rows` to `null` without providing a value for `grid_columns`."
          );
        }
        const n_cols = trial.grid_columns === null ? Math.ceil(trial.choices.length / trial.grid_rows) : trial.grid_columns;
        const n_rows = trial.grid_rows === null ? Math.ceil(trial.choices.length / trial.grid_columns) : trial.grid_rows;
        buttonGroupElement.style.gridTemplateColumns = `repeat(${n_cols}, 1fr)`;
        buttonGroupElement.style.gridTemplateRows = `repeat(${n_rows}, 1fr)`;
      } else if (trial.button_layout === "flex") {
        buttonGroupElement.classList.add("jspsych-btn-group-flex");
      }
      for (const [choiceIndex, choice] of trial.choices.entries()) {
        buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, choiceIndex));
        const buttonElement = buttonGroupElement.lastChild;
        buttonElement.dataset.choice = choiceIndex.toString();
        buttonElement.addEventListener("click", () => {
          after_response(choiceIndex);
        });
      }
      display_element.appendChild(buttonGroupElement);
      if (trial.prompt !== null) {
        display_element.insertAdjacentHTML("beforeend", trial.prompt);
      }
      var start_time = performance.now();
      var response = {
        rt: null,
        button: null
      };
      const end_trial = () => {
        var trial_data = {
          rt: response.rt,
          stimulus: trial.stimulus,
          response: response.button
        };
        this.jsPsych.finishTrial(trial_data);
      };
      function after_response(choice) {
        var end_time = performance.now();
        var rt = Math.round(end_time - start_time);
        response.button = parseInt(choice);
        response.rt = rt;
        stimulusElement.classList.add("responded");
        for (const button of buttonGroupElement.children) {
          button.setAttribute("disabled", "disabled");
        }
        if (trial.response_ends_trial) {
          end_trial();
        }
      }
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          stimulusElement.style.visibility = "hidden";
        }, trial.stimulus_duration);
      }
      if (trial.enable_button_after > 0) {
        var btns = document.querySelectorAll("#jspsych-html-button-response-btngroup button");
        for (var i = 0; i < btns.length; i++) {
          btns[i].setAttribute("disabled", "disabled");
        }
        this.jsPsych.pluginAPI.setTimeout(() => {
          var btns2 = document.querySelectorAll("#jspsych-html-button-response-btngroup button");
          for (var i2 = 0; i2 < btns2.length; i2++) {
            btns2[i2].removeAttribute("disabled");
          }
        }, trial.enable_button_after);
      }
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }
    }
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }
    create_simulation_data(trial, simulation_options) {
      const default_data = {
        stimulus: trial.stimulus,
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true) + trial.enable_button_after,
        response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1)
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }
    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }
    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      this.trial(display_element, trial);
      load_callback();
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(
            `#jspsych-html-button-response-btngroup [data-choice="${data.response}"]`
          ),
          data.rt
        );
      }
    }
  };
  var HtmlButtonResponsePlugin = _HtmlButtonResponsePlugin;
  (() => {
    _HtmlButtonResponsePlugin.info = info;
  })();

  // node_modules/@jspsych/plugin-html-keyboard-response/dist/index.js
  var version2 = "2.1.0";
  var info2 = {
    name: "html-keyboard-response",
    version: version2,
    parameters: {
      /**
       * The string to be displayed.
       */
      stimulus: {
        type: ParameterType.HTML_STRING,
        default: void 0
      },
      /**
       * This array contains the key(s) that the participant is allowed to press in order to respond
       * to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values this page}
       * and
       * {@link https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/ this page (event.key column)}
       * for more examples. Any key presses that are not listed in the
       * array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses.
       * Specifying `"NO_KEYS"` will mean that no responses are allowed.
       */
      choices: {
        type: ParameterType.KEYS,
        default: "ALL_KEYS"
      },
      /**
       * This string can contain HTML markup. Any content here will be displayed below the stimulus.
       * The intention is that it can be used to provide a reminder about the action the participant
       * is supposed to take (e.g., which key to press).
       */
      prompt: {
        type: ParameterType.HTML_STRING,
        default: null
      },
      /**
       * How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus
       * will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will
       * remain visible until the trial ends.
       */
      stimulus_duration: {
        type: ParameterType.INT,
        default: null
      },
      /**
       * How long to wait for the participant to make a response before ending the trial in milliseconds.
       * If the participant fails to make a response before this timer is reached, the participant's response
       * will be recorded as null for the trial and the trial will end. If the value of this parameter is null,
       * then the trial will wait for a response indefinitely.
       */
      trial_duration: {
        type: ParameterType.INT,
        default: null
      },
      /**
       * If true, then the trial will end whenever the participant makes a response (assuming they make their
       * response before the cutoff specified by the trial_duration parameter). If false, then the trial will
       * continue until the value for trial_duration is reached. You can set this parameter to false to force
       * the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
       */
      response_ends_trial: {
        type: ParameterType.BOOL,
        default: true
      }
    },
    data: {
      /** Indicates which key the participant pressed. */
      response: {
        type: ParameterType.STRING
      },
      /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
      rt: {
        type: ParameterType.INT
      },
      /** The HTML content that was displayed on the screen. */
      stimulus: {
        type: ParameterType.STRING
      }
    },
    // prettier-ignore
    citations: {
      "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
      "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
    }
  };
  var _HtmlKeyboardResponsePlugin = class {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + "</div>";
      if (trial.prompt !== null) {
        new_html += trial.prompt;
      }
      display_element.innerHTML = new_html;
      var response = {
        rt: null,
        key: null
      };
      const end_trial = () => {
        if (typeof keyboardListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }
        var trial_data = {
          rt: response.rt,
          stimulus: trial.stimulus,
          response: response.key
        };
        this.jsPsych.finishTrial(trial_data);
      };
      var after_response = (info22) => {
        display_element.querySelector("#jspsych-html-keyboard-response-stimulus").className += " responded";
        if (response.key == null) {
          response = info22;
        }
        if (trial.response_ends_trial) {
          end_trial();
        }
      };
      if (trial.choices != "NO_KEYS") {
        var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false
        });
      }
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector(
            "#jspsych-html-keyboard-response-stimulus"
          ).style.visibility = "hidden";
        }, trial.stimulus_duration);
      }
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }
    }
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }
    create_simulation_data(trial, simulation_options) {
      const default_data = {
        stimulus: trial.stimulus,
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        response: this.jsPsych.pluginAPI.getValidKey(trial.choices)
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }
    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }
    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      this.trial(display_element, trial);
      load_callback();
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
      }
    }
  };
  var HtmlKeyboardResponsePlugin = _HtmlKeyboardResponsePlugin;
  (() => {
    _HtmlKeyboardResponsePlugin.info = info2;
  })();

  // assets/blank-icon.js
  var blankIconSvg = `<svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
  <rect width="240" height="240" fill="none" stroke="none" stroke-width="2"/>
</svg>`;

  // assets/flower-icon.js
  var flowerIconSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="241" height="241">
<path d="M0 0 C5.19480835 2.23486019 7.44595492 7.25677343 10 12 C10.99 12.495 10.99 12.495 12 13 C12.2475 12.360625 12.495 11.72125 12.75 11.0625 C14 9 14 9 16.0625 8.4375 C16.701875 8.293125 17.34125 8.14875 18 8 C18.33 7.01 18.66 6.02 19 5 C23.1720663 2.66328476 26.98001753 1.84440945 31.6875 2.5625 C36.91671245 4.83178087 40.12007356 6.3008317 42.8125 11.5 C45.69729781 20.75539296 45.22040431 29.677972 43 39 C43.45375 38.505 43.9075 38.01 44.375 37.5 C46 36 46 36 48 36 C48 35.34 48 34.68 48 34 C49.91411557 33.01585567 51.8313967 32.03786651 53.75 31.0625 C54.81734375 30.51722656 55.8846875 29.97195312 56.984375 29.41015625 C62.72585051 26.72534711 68.53164511 26.03208701 74.6875 27.75 C78.30885335 29.7074883 81.16668656 31.61114427 83.3125 35.1875 C85.14415637 42.68063971 83.80562491 48.93583728 81 56 C81.70125 55.94199219 82.4025 55.88398437 83.125 55.82421875 C90.127563 55.49121643 94.68906345 56.26321875 100 61 C103.05640472 64.74656063 103.92103362 68.1830511 104 73 C102.35460056 79.22136237 99.98534312 83.82622436 95 88 C94.48566406 88.49113281 93.97132813 88.98226562 93.44140625 89.48828125 C89.08125146 93.54634679 84.53541584 95.86616623 79 98 C80.09957031 98.15855469 81.19914063 98.31710938 82.33203125 98.48046875 C103.90050762 101.79136548 103.90050762 101.79136548 110.625 109.75 C113.37071887 113.96806087 114.38314004 117.98180001 114 123 C112.29339347 128.43980832 108.71070401 131.95823112 104 135 C101.05468354 136.25023767 98.09598972 137.19967613 95 138 C96.1446875 138.928125 96.1446875 138.928125 97.3125 139.875 C100.94816026 143.55221066 102.29575544 147.95041666 103 153 C102.75282547 156.17372098 102.09731184 159.01577627 101 162 C100.79632813 162.68707031 100.59265625 163.37414062 100.3828125 164.08203125 C98.19165131 167.1211842 95.01307686 167.78880248 91.5625 168.8125 C90.84835938 169.03188232 90.13421875 169.25126465 89.3984375 169.47729492 C83.40496891 171.17539952 78.12489988 171.31062476 72 170 C72.886875 170.928125 73.77375 171.85625 74.6875 172.8125 C80.92549124 180.05566519 84.3950073 189.15793871 84.28515625 198.68359375 C83.71170728 203.34188468 81.41445759 206.67394601 78 209.875 C72.97280744 212.70279582 67.28264402 212.71631579 61.7265625 211.50390625 C56.35464258 209.88132975 52.39745498 207.46182626 48 204 C48.03480469 204.60585937 48.06960937 205.21171875 48.10546875 205.8359375 C48.36100759 213.74547291 47.73882103 220.86991882 42.375 227 C37.44862189 229.91933518 33.2412752 231.68343167 27.48046875 230.46875 C21.22829099 228.24063135 16.6696543 224.64356684 12 220 C11.90074219 220.87269531 11.80148438 221.74539062 11.69921875 222.64453125 C10.34467533 229.14482621 6.41433336 235.12218516 1.1875 239.1875 C-4.22129062 240.56621134 -9.41968634 240.87965238 -14.75 239.0625 C-18.23055888 235.87198769 -20.53159669 231.99577309 -23 228 C-23.66 227.01 -24.32 226.02 -25 225 C-25.44111565 223.11845117 -25.8109267 221.21937362 -26.125 219.3125 C-26.29257813 218.31863281 -26.46015625 217.32476562 -26.6328125 216.30078125 C-26.81457031 215.16189453 -26.81457031 215.16189453 -27 214 C-28.03447266 215.24716797 -28.03447266 215.24716797 -29.08984375 216.51953125 C-39.13238658 228.27687377 -39.13238658 228.27687377 -47 229 C-52.59621944 229.18516903 -56.78199944 227.72753538 -61 224 C-63.78358345 218.92990158 -64.91060978 213.65201277 -66 208 C-66.886875 208.474375 -67.77375 208.94875 -68.6875 209.4375 C-75.49173503 212.64704483 -82.73182624 212.81704344 -90 211 C-90 210.34 -90 209.68 -90 209 C-90.8971875 208.6596875 -90.8971875 208.6596875 -91.8125 208.3125 C-94.83535493 206.49878704 -95.65344741 205.29905386 -97 202 C-98.43704568 191.26544193 -94.45173697 182.95642502 -89 174 C-90.22203125 174.23976562 -90.22203125 174.23976562 -91.46875 174.484375 C-95.51078163 175.07458316 -99.4217188 175.22133018 -103.5 175.25 C-104.60021484 175.2809375 -104.60021484 175.2809375 -105.72265625 175.3125 C-111.45644202 175.35352888 -115.56282505 174.26165823 -119.8984375 170.23828125 C-122.83588936 166.40716018 -124.99504993 163.22488167 -124.59375 158.1484375 C-122.82687103 151.75512543 -118.73093912 146.50202271 -114 142 C-113.2575 141.2575 -112.515 140.515 -111.75 139.75 C-111.1725 139.1725 -110.595 138.595 -110 138 C-110.56847656 137.8040625 -111.13695313 137.608125 -111.72265625 137.40625 C-117.91112094 135.00938221 -122.93205638 132.08809995 -126 126 C-126.86465867 120.71737729 -127.38535832 115.3420975 -124.5859375 110.609375 C-123.80089844 109.81273438 -123.80089844 109.81273438 -123 109 C-122.34 109 -121.68 109 -121 109 C-121 108.34 -121 107.68 -121 107 C-116.38 104.69 -111.76 102.38 -107 100 C-108.485 98.88625 -109.97 97.7725 -111.5 96.625 C-114.03125 94.7265625 -114.03125 94.7265625 -116 93 C-116 92.34 -116 91.68 -116 91 C-116.66 91 -117.32 91 -118 91 C-121.52601809 84.85465418 -124.15305343 80.1489313 -123 73 C-121.18191021 68.25034915 -118.63615521 64.92186782 -114.125 62.5 C-107.70791704 60.02855589 -100.74817084 60.70871205 -94 61 C-93.01 61 -92.02 61 -91 61 C-91.52400391 60.09507813 -91.52400391 60.09507813 -92.05859375 59.171875 C-92.74115234 57.97304687 -92.74115234 57.97304687 -93.4375 56.75 C-93.88996094 55.96109375 -94.34242187 55.1721875 -94.80859375 54.359375 C-97.45605817 49.11652743 -97.50287256 43.77846288 -97 38 C-95.33282118 33.26170231 -93.14637955 30.7988062 -89 28 C-80.98863123 25.32954374 -74.40998242 27.53478902 -67 31 C-67.495 29.515 -67.495 29.515 -68 28 C-68.71411311 20.2032896 -68.23821371 13.70707607 -64 7 C-61.83541358 4.4024963 -60.23175112 2.53375882 -57.125 1.1875 C-56.073125 1.0946875 -56.073125 1.0946875 -55 1 C-53.9275 0.896875 -52.855 0.79375 -51.75 0.6875 C-44.93475233 1.25543731 -38.56170471 4.87269308 -34 10 C-31.40025613 13.85395286 -29.07889048 17.84221904 -27 22 C-26.78085938 21.29875 -26.56171875 20.5975 -26.3359375 19.875 C-21.64346096 5.8357206 -15.64227497 -2.04537842 0 0 Z " fill="#C13B2E" transform="translate(126,1)"/>
<path d="M0 0 C3.67244722 3.47393656 4.4193316 6.510028 4.625 11.4375 C4.5336936 16.37634599 3.12272862 20.62960293 1.3125 25.1875 C0.6525 25.1875 -0.0075 25.1875 -0.6875 25.1875 C-0.93757813 26.07824219 -1.18765625 26.96898438 -1.4453125 27.88671875 C-5.21122398 37.89362189 -15.34830152 44.18859129 -23.6875 50.1875 C-25.95117375 51.89910646 -28.19448959 53.63644697 -30.4375 55.375 C-31.52451619 56.21122797 -32.61174904 57.0471744 -33.69921875 57.8828125 C-35.51993453 59.28702467 -37.33624388 60.69700633 -39.14453125 62.1171875 C-39.83933594 62.65601562 -40.53414062 63.19484375 -41.25 63.75 C-41.82878906 64.20503906 -42.40757812 64.66007812 -43.00390625 65.12890625 C-44.87522974 66.30553889 -46.52851914 66.76704202 -48.6875 67.1875 C-49.1 66.60742188 -49.5125 66.02734375 -49.9375 65.4296875 C-53.96945018 59.9757549 -58.04182585 55.93082742 -63.6875 52.1875 C-64.6775 51.5275 -65.6675 50.8675 -66.6875 50.1875 C-65.47570145 46.44194086 -63.73393765 43.9179459 -61.1640625 40.96484375 C-55.71348322 34.40396128 -51.211288 26.99815439 -46.58203125 19.8515625 C-44.79691351 17.3413557 -42.8645263 15.35054112 -40.6875 13.1875 C-40.3575 12.32125 -40.0275 11.455 -39.6875 10.5625 C-38.6875 8.1875 -38.6875 8.1875 -36.75 6.9375 C-35.0720189 6.32732506 -33.38135378 5.75211793 -31.6875 5.1875 C-31.6875 4.5275 -31.6875 3.8675 -31.6875 3.1875 C-29.77338443 2.20335567 -27.8561033 1.22536651 -25.9375 0.25 C-24.87015625 -0.29527344 -23.8028125 -0.84054688 -22.703125 -1.40234375 C-14.74985081 -5.12142663 -7.28473234 -4.91295902 0 0 Z " fill="#E74E3E" transform="translate(205.6875,31.8125)"/>
<path d="M0 0 C3.6214597 1.2870693 6.20213819 2.76934238 9.125 5.25 C14.24232512 9.44605176 19.49926505 13.43021845 24.8125 17.375 C26.0492749 18.3036084 26.0492749 18.3036084 27.31103516 19.25097656 C28.49705322 20.12834473 28.49705322 20.12834473 29.70703125 21.0234375 C30.4131958 21.54856934 31.11936035 22.07370117 31.84692383 22.61474609 C34.14871047 24.09567788 36.46314995 24.99118953 39 26 C46.77976704 33.52928212 52.94120155 44.31034073 53.3125 55.3125 C53.25506325 60.29308658 51.89880576 62.97388089 49 67 C44.84674911 70.89367271 40.82428416 71.30874732 35.2109375 71.21484375 C28.0075198 70.514865 22.58900231 67.39985289 17 63 C16.01 63.495 16.01 63.495 15 64 C14.773125 63.278125 14.54625 62.55625 14.3125 61.8125 C13.03908062 59.08374419 11.70339059 57.59473393 9.54296875 55.5546875 C3.37929364 49.34419966 -1.48776962 41.96809457 -6.23828125 34.6640625 C-7.93258744 32.02827568 -7.93258744 32.02827568 -9.73046875 29.7734375 C-11 28 -11 28 -11 26 C-11.598125 25.7525 -12.19625 25.505 -12.8125 25.25 C-15.33586869 23.80807503 -16.50030076 22.47450374 -18 20 C-18 19.01 -18 18.02 -18 17 C-17.01 16.525625 -16.02 16.05125 -15 15.5625 C-8.6466235 11.95967065 -4.26748186 5.79534573 0 0 Z " fill="#E74E3E" transform="translate(157,142)"/>
<path d="M0 0 C3.26459124 2.37424817 5.89395574 4.94345793 8.5 8 C11.89688461 11.96549355 14.94801734 15.31600578 20 17 C19.42676569 20.86933162 17.61046448 23.15222057 15 26 C14.34 26 13.68 26 13 26 C12.66548828 27.01320312 12.66548828 27.01320312 12.32421875 28.046875 C10.61945708 31.8486444 8.31049846 34.93287581 5.8125 38.25 C5.31709717 38.91459229 4.82169434 39.57918457 4.3112793 40.26391602 C3.32492607 41.5838202 2.33581934 42.90167193 1.34375 44.21728516 C0.22180265 45.70574074 -0.89032527 47.20159134 -2 48.69921875 C-11.43960084 61.21980042 -11.43960084 61.21980042 -17 64 C-17.40729228 66.32156597 -17.74438677 68.6568787 -18 71 C-18.66 69.68 -19.32 68.36 -20 67 C-20.886875 67.474375 -21.77375 67.94875 -22.6875 68.4375 C-29.49173503 71.64704483 -36.73182624 71.81704344 -44 70 C-44 69.34 -44 68.68 -44 68 C-44.598125 67.773125 -45.19625 67.54625 -45.8125 67.3125 C-48.83535493 65.49878704 -49.65344741 64.29905386 -51 61 C-52.27345572 51.48743916 -49.47502512 44.07373575 -44.6875 36 C-44.130625 35.01 -43.57375 34.02 -43 33 C-43.33 32.34 -43.66 31.68 -44 31 C-42.2984375 30.319375 -42.2984375 30.319375 -40.5625 29.625 C-36.95278308 28.42904194 -36.95278308 28.42904194 -36 26 C-34.32308114 25.04026713 -32.64403963 24.08396423 -30.95214844 23.15087891 C-27.78309698 21.28258119 -24.98153437 18.99559582 -22.125 16.6875 C-20.89851681 15.71083789 -19.67195431 14.73427538 -18.4453125 13.7578125 C-17.8565332 13.28633789 -17.26775391 12.81486328 -16.66113281 12.32910156 C-11.24442886 7.99510151 -5.84305572 3.74554854 0 0 Z " fill="#E74E3E" transform="translate(80,142)"/>
<path d="M0 0 C0.33 0.99 0.66 1.98 1 3 C2.91666667 4.16666667 2.91666667 4.16666667 5 5 C5.66 5.33 6.32 5.66 7 6 C7 6.66 7 7.32 7 8 C7.55945313 8.22558594 8.11890625 8.45117188 8.6953125 8.68359375 C15.71546619 12.69341035 21.3106064 20.99574054 25.55078125 27.7265625 C27.78382861 31.22961792 30.24623814 34.56784885 32.6796875 37.93359375 C34 40 34 40 34 42 C34.66 42 35.32 42 36 42 C37.5078125 43.96875 37.5078125 43.96875 39.125 46.5 C39.66382812 47.3353125 40.20265625 48.170625 40.7578125 49.03125 C41.16773437 49.6809375 41.57765625 50.330625 42 51 C40.96875 51.556875 39.9375 52.11375 38.875 52.6875 C31.92427862 56.70129685 27.55971904 61.48380577 23 68 C19.00754999 67.1581138 16.27209122 65.45406841 13 63 C13 62.34 13 61.68 13 61 C12.2678125 60.7421875 11.535625 60.484375 10.78125 60.21875 C7.88684888 58.95041693 5.91868485 57.52109282 3.5 55.5 C0.06519563 52.6752579 -3.39576209 49.90961712 -6.93725586 47.22119141 C-8.61548122 45.94473994 -10.28366402 44.65620927 -11.94921875 43.36328125 C-13.7506312 41.9678209 -15.56194447 40.58472946 -17.39453125 39.23046875 C-23.96092422 34.07026319 -28.4864776 26.2661608 -30 18 C-30.51367057 12.01376216 -30.52337661 7.10282129 -27 2 C-19.37872721 -5.04967733 -9.08169445 -4.37867411 0 0 Z " fill="#E64D3D" transform="translate(59,31)"/>
<path d="M0 0 C1.67972972 3.01877816 2.45649165 5.70678074 3.03515625 9.10546875 C3.20466797 10.08966797 3.37417969 11.07386719 3.54882812 12.08789062 C3.71833984 13.11076172 3.88785156 14.13363281 4.0625 15.1875 C4.23587891 16.19103516 4.40925781 17.19457031 4.58789062 18.22851562 C6.27969842 28.19138375 7.17392467 37.96591151 7.5625 48.0625 C7.60568359 49.11888672 7.64886719 50.17527344 7.69335938 51.26367188 C7.79837337 53.84234879 7.90052877 56.42110435 8 59 C7.34 59 6.68 59 6 59 C5.90074219 59.87269531 5.80148438 60.74539062 5.69921875 61.64453125 C4.34467533 68.14482621 0.41433336 74.12218516 -4.8125 78.1875 C-10.22129062 79.56621134 -15.41968634 79.87965238 -20.75 78.0625 C-24.23055888 74.87198769 -26.53159669 70.99577309 -29 67 C-29.66 66.01 -30.32 65.02 -31 64 C-31.41846983 62.15927975 -31.7670714 60.30192753 -32.0625 58.4375 C-32.63329904 54.59053568 -32.63329904 54.59053568 -34 51 C-33.67 50.34 -33.34 49.68 -33 49 C-32.82675544 47.60481105 -32.70283168 46.20330981 -32.60546875 44.80078125 C-32.50576782 43.49717651 -32.50576782 43.49717651 -32.40405273 42.16723633 C-32.33259033 41.22517334 -32.26112793 40.28311035 -32.1875 39.3125 C-30.02051041 13.06153122 -30.02051041 13.06153122 -26 1 C-24.97845825 1.00785522 -24.97845825 1.00785522 -23.9362793 1.01586914 C-20.85336223 1.03664458 -17.7704599 1.04966198 -14.6875 1.0625 C-13.0797168 1.07506836 -13.0797168 1.07506836 -11.43945312 1.08789062 C-10.41142578 1.09111328 -9.38339844 1.09433594 -8.32421875 1.09765625 C-7.37635498 1.10289307 -6.42849121 1.10812988 -5.4519043 1.11352539 C-2.86161319 1.10498854 -2.86161319 1.10498854 0 0 Z " fill="#E74E3E" transform="translate(132,162)"/>
<path d="M0 0 C3.9957911 3.5883771 6.19520354 7.31392683 7.0625 12.625 C7.27791238 17.64841676 5.95880204 20.8400237 2.5546875 24.59375 C-1.32312263 28.27316054 -5.03391038 29.99879664 -10.1796875 31.359375 C-12.20770789 31.83604875 -12.20770789 31.83604875 -13 34 C-13.99 33.67 -14.98 33.34 -16 33 C-18.01862671 33.02310603 -20.0374182 33.05190181 -22.05517578 33.11547852 C-33.64493655 33.4483879 -44.63465625 31.91979311 -56.0390625 29.97265625 C-61.34399995 29.06791829 -66.63827625 28.44743278 -72 28 C-71.835 27.13375 -71.67 26.2675 -71.5 25.375 C-70.31340731 17.0688512 -70.42966874 8.2442391 -72 0 C-69.01409013 -0.99530329 -66.26949496 -1.30791548 -63.14941406 -1.59619141 C-56.1484438 -2.24421268 -49.52303505 -3.22627606 -42.75 -5.125 C-28.41801031 -9.04756977 -12.82393612 -7.91948406 0 0 Z " fill="#E74E3F" transform="translate(233,107)"/>
<path d="M0 0 C5.18209308 2.24358819 7.48367495 7.23695616 10 12 C10.66 12.66 11.32 13.32 12 14 C12.53693913 17.38271652 12.8218065 20.58597457 13 24 C13.07734375 25.24136719 13.1546875 26.48273437 13.234375 27.76171875 C13.88050935 43.68313173 12.07506959 62.77479124 7 78 C6.13375 77.835 5.2675 77.67 4.375 77.5 C-3.9311488 76.31340731 -12.7557609 76.42966874 -21 78 C-21.07347656 77.00033203 -21.07347656 77.00033203 -21.1484375 75.98046875 C-21.69738241 69.21330302 -22.73999274 62.66525577 -24 56 C-27.19295413 38.7395378 -30.11182917 21.19898527 -19.6953125 5.97265625 C-13.8993053 -0.77154568 -8.56445653 -1.22965749 0 0 Z " fill="#E74D3E" transform="translate(126,1)"/>
<path d="M0 0 C1.00614853 0.1305629 1.00614853 0.1305629 2.03262329 0.26376343 C9.79122977 1.2816136 17.47947085 2.44979264 25.125 4.125 C24.96257812 4.95 24.80015625 5.775 24.6328125 6.625 C24.07356425 10.47951104 23.97809799 14.24104359 24 18.125 C23.99613281 18.81078125 23.99226563 19.4965625 23.98828125 20.203125 C23.99606397 24.28126809 24.33745494 28.12477115 25.125 32.125 C24.5266333 32.20540527 23.9282666 32.28581055 23.31176758 32.36865234 C21.52961037 32.60860091 19.74755506 32.84930694 17.96557617 33.09057617 C15.92823018 33.36604414 13.89062629 33.63961078 11.8527832 33.91137695 C6.80726141 34.59126996 1.81369367 35.35497118 -3.1875 36.3125 C-9.64108783 37.31524871 -16.1063746 37.41200585 -22.625 37.5 C-24.22468628 37.53903442 -24.22468628 37.53903442 -25.85668945 37.57885742 C-34.75972018 37.59901103 -41.74167298 35.67116899 -48.375 29.5 C-49.0246875 28.90960938 -49.674375 28.31921875 -50.34375 27.7109375 C-53.33888034 24.60883822 -53.06846035 21.94335747 -53.125 17.75 C-53.15078125 16.60789062 -53.1765625 15.46578125 -53.203125 14.2890625 C-52.85021232 10.88597591 -52.28979095 9.50462409 -49.875 7.125 C-49.215 7.125 -48.555 7.125 -47.875 7.125 C-47.875 6.465 -47.875 5.805 -47.875 5.125 C-45.96088443 4.14085567 -44.0436033 3.16286651 -42.125 2.1875 C-41.05765625 1.64222656 -39.9903125 1.09695312 -38.890625 0.53515625 C-27.14201825 -4.95868706 -12.41352044 -1.62079052 0 0 Z " fill="#E64D3D" transform="translate(52.875,102.875)"/>
<path d="M0 0 C5.35735256 4.11083983 7.65031174 9.38028015 8.5390625 15.90625 C8.85395735 22.47059657 7.16880314 27.59227368 3.265625 32.8984375 C-1.75218062 37.3091065 -6.40182802 39.64692452 -13.046875 40.1484375 C-19.67406978 39.69913616 -26.00755545 36.5901569 -30.734375 31.8984375 C-34.68893574 26.02475169 -35.77419561 19.84881737 -34.734375 12.8984375 C-33.05120675 6.08773685 -29.57714636 2.36291963 -24.05078125 -1.7890625 C-16.3549283 -6.14961324 -7.19736425 -4.57129892 0 0 Z " fill="#E57D22" transform="translate(132.734375,103.1015625)"/>
<path d="M0 0 C0.66 0.33 1.32 0.66 2 1 C1.16855469 1.81404297 1.16855469 1.81404297 0.3203125 2.64453125 C-0.76636719 3.71767578 -0.76636719 3.71767578 -1.875 4.8125 C-2.59429688 5.52019531 -3.31359375 6.22789063 -4.0546875 6.95703125 C-6.15358937 9.04399194 -6.15358937 9.04399194 -8 12 C-7.45276317 8.62537285 -6.9451 6.91765 -5 4 C-4.34 4 -3.68 4 -3 4 C-3 3.34 -3 2.68 -3 2 C-2.01 1.34 -1.02 0.68 0 0 Z " fill="#EF887D" transform="translate(8,106)"/>
<path d="M0 0 C0.66 0.33 1.32 0.66 2 1 C-0.64 3.64 -3.28 6.28 -6 9 C-6.33 8.34 -6.66 7.68 -7 7 C-4.66666667 4.66666667 -2.33333333 2.33333333 0 0 Z " fill="#EF877D" transform="translate(37,29)"/>
</svg>`;

  // assets/heart-icon.js
  var heartIconSvg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="241" height="241">
<path d="M0 0 C0.76957031 0.74121094 1.53914063 1.48242188 2.33203125 2.24609375 C2.92628906 2.81199219 3.52054687 3.37789062 4.1328125 3.9609375 C8.22348826 8.28415814 10.60594106 13.4239712 13.1328125 18.76953125 C14.11047203 21.13395056 14.11047203 21.13395056 15.33203125 22.24609375 C15.75162109 21.31990234 15.75162109 21.31990234 16.1796875 20.375 C22.52528997 6.96965974 32.04135805 -4.57548845 46.26953125 -9.8203125 C61.27858642 -14.39577702 76.07470339 -13.20250684 90.33203125 -6.75390625 C94.0654296 -4.43505667 97.19027652 -1.81767416 100.33203125 1.24609375 C101.0384375 1.91382813 101.74484375 2.5815625 102.47265625 3.26953125 C114.43237959 15.54878918 119.31410507 32.43133696 119.33203125 49.24609375 C118.29832011 66.87556745 112.9296999 82.14087814 102.33203125 96.24609375 C101.67203125 96.24609375 101.01203125 96.24609375 100.33203125 96.24609375 C100.12578125 96.92671875 99.91953125 97.60734375 99.70703125 98.30859375 C98.21071225 101.50527525 96.44093687 103.67470275 94.09545898 106.27783203 C92.42235171 108.14528196 90.78682612 110.04017006 89.15234375 111.94140625 C85.24303123 116.41265345 81.10430056 120.62155947 76.89453125 124.80859375 C76.18232422 125.52466797 75.47011719 126.24074219 74.73632812 126.97851562 C70.09932631 131.60709419 65.31565533 135.99446169 60.33203125 140.24609375 C59.76460205 140.7352124 59.19717285 141.22433105 58.61254883 141.72827148 C57.06807793 143.05533612 55.51279844 144.36979035 53.95703125 145.68359375 C53.43753906 146.12896484 52.91804687 146.57433594 52.3828125 147.03320312 C48.56287802 150.24609375 48.56287802 150.24609375 46.33203125 150.24609375 C46.33203125 150.90609375 46.33203125 151.56609375 46.33203125 152.24609375 C45.02197266 153.46362305 45.02197266 153.46362305 43.18359375 154.8203125 C42.51255615 155.32006592 41.84151855 155.81981934 41.15014648 156.3347168 C40.42641846 156.86234619 39.70269043 157.38997559 38.95703125 157.93359375 C38.22621338 158.47089111 37.49539551 159.00818848 36.74243164 159.56176758 C35.27884193 160.63526062 33.81312812 161.70586421 32.34521484 162.7734375 C30.64597928 164.01643883 28.96529557 165.28474269 27.2890625 166.55859375 C22.73938638 169.94439924 19.23991919 172.47332021 13.33203125 172.24609375 C8.69700028 170.22152264 4.65595484 167.52216901 0.58203125 164.55859375 C-0.03285156 164.11435059 -0.64773437 163.67010742 -1.28125 163.21240234 C-19.22101414 150.16487555 -35.77582878 135.19201087 -51.48046875 119.55859375 C-52.18598877 118.85774658 -52.89150879 118.15689941 -53.6184082 117.43481445 C-62.03204938 108.99536151 -69.13539452 100.19557051 -75.66796875 90.24609375 C-76.3125 89.27542969 -76.95703125 88.30476563 -77.62109375 87.3046875 C-87.61587739 71.33476146 -91.54532961 51.46231081 -87.54077148 32.94921875 C-83.80854156 17.83725689 -76.24634526 3.57714894 -62.66796875 -4.75390625 C-56.88325103 -8.07134021 -51.25580337 -10.62121532 -44.66796875 -11.75390625 C-43.99507812 -11.87636719 -43.3221875 -11.99882812 -42.62890625 -12.125 C-26.8928624 -14.44249009 -11.91145862 -10.62090527 0 0 Z " fill="#FA4E4E" transform="translate(104.66796875,40.75390625)"/>
<path d="M0 0 C11.35226184 2.63240854 20.28395868 10.69229128 27 20 C37.87697878 38.43407648 40.04902282 57.08698669 35.1015625 77.94140625 C32.3605357 88.35297949 27.45959621 97.40244893 21 106 C20.34 106 19.68 106 19 106 C18.79375 106.680625 18.5875 107.36125 18.375 108.0625 C16.878681 111.2591815 15.10890562 113.428609 12.76342773 116.03173828 C11.09032046 117.89918821 9.45479487 119.79407631 7.8203125 121.6953125 C3.91099998 126.1665597 -0.22773069 130.37546572 -4.4375 134.5625 C-5.14970703 135.27857422 -5.86191406 135.99464844 -6.59570312 136.73242188 C-11.23270494 141.36100044 -16.01637592 145.74836794 -21 150 C-21.5674292 150.48911865 -22.1348584 150.9782373 -22.71948242 151.48217773 C-24.26395332 152.80924237 -25.81923281 154.1236966 -27.375 155.4375 C-27.89449219 155.88287109 -28.41398437 156.32824219 -28.94921875 156.78710938 C-32.76915323 160 -32.76915323 160 -35 160 C-35 160.66 -35 161.32 -35 162 C-36.31005859 163.2175293 -36.31005859 163.2175293 -38.1484375 164.57421875 C-39.1549939 165.32384888 -39.1549939 165.32384888 -40.18188477 166.08862305 C-40.90561279 166.61625244 -41.62934082 167.14388184 -42.375 167.6875 C-43.10581787 168.22479736 -43.83663574 168.76209473 -44.58959961 169.31567383 C-46.05318932 170.38916687 -47.51890313 171.45977046 -48.98681641 172.52734375 C-50.68605197 173.77034508 -52.36673568 175.03864894 -54.04296875 176.3125 C-58.59264487 179.69830549 -62.09211206 182.22722646 -68 182 C-72.63503097 179.97542889 -76.67607641 177.27607526 -80.75 174.3125 C-81.36488281 173.86825684 -81.97976562 173.42401367 -82.61328125 172.96630859 C-96.85028839 162.61178383 -110.07002375 150.9272434 -123 139 C-119.41258882 137.70523321 -117.62728903 138.31716929 -114.1875 139.8125 C-107.2535444 142.48438423 -100.37198238 143.35456272 -93 144 C-91.94296875 144.09667969 -90.8859375 144.19335938 -89.796875 144.29296875 C-77.42225889 144.89226299 -67.92024185 138.71566934 -58 132 C-57.0203125 131.35804688 -56.040625 130.71609375 -55.03125 130.0546875 C-41.9000271 121.42463121 -29.33651751 112.1696234 -17.8125 101.46875 C-16 100 -16 100 -14 100 C-14 99.34 -14 98.68 -14 98 C-12.42578125 96.4140625 -12.42578125 96.4140625 -10.3125 94.625 C-9.62800781 94.03976563 -8.94351563 93.45453125 -8.23828125 92.8515625 C-6.71613546 91.59240525 -5.15916134 90.37444853 -3.57421875 89.1953125 C-0.42111194 86.50632004 1.98487819 83.52731974 4.5 80.25 C4.98412354 79.6223877 5.46824707 78.99477539 5.96704102 78.34814453 C15.83866284 65.43871521 20.56523358 53.48386616 19 37 C16.71524598 24.50525146 10.08463962 12.52440675 1.25 3.453125 C0 2 0 2 0 0 Z " fill="#D24141" transform="translate(186,31)"/>
<path d="M0 0 C2.5625 1.875 2.5625 1.875 4 5 C4.81643601 12.96383197 1.4264817 19.60406856 -3 26 C-7.52168479 31.3666915 -13.64791485 38.10883816 -21 39 C-27.35831157 39.4461973 -27.35831157 39.4461973 -29.6796875 37.83203125 C-32.54337229 33.85845679 -31.69342258 28.62281723 -31 24 C-29.468421 20.27368408 -27.42406106 17.20421864 -25 14 C-24.53207031 13.35160156 -24.06414063 12.70320313 -23.58203125 12.03515625 C-17.95371168 4.83027658 -9.48602931 -1.57164983 0 0 Z " fill="#FC8181" transform="translate(61,43)"/>
</svg>`;

  // src/index.ts
  var DEFAULT_STIMULUS_INFO_OBJECT = {
    same: {
      stimulus_name: "heart",
      stimulus_src: heartIconSvg,
      target_side: "same"
    },
    opposite: {
      stimulus_name: "flower",
      stimulus_src: flowerIconSvg,
      target_side: "opposite"
    }
  };
  function generateStimulus(targetSide, stimulusSide, stimulusInfo, instruction = false) {
    return `
    <div class="jspsych-hearts-and-flowers-instruction">
      ${instruction ? `<h3>When you see a ${stimulusInfo[targetSide].stimulus_name}, press
          the button on the ${targetSide} side.</h3>` : ""}
      </div>
      <div class="hearts-and-flowers-stimulus-grid">
        <div class="hearts-and-flowers-stimulus-grid-item">${stimulusSide === "left" ? stimulusInfo[targetSide].stimulus_src : blankIconSvg}</div>
        <div class="hearts-and-flowers-stimulus-grid-item">${stimulusSide === "right" ? stimulusInfo[targetSide].stimulus_src : blankIconSvg}</div>
      </div>
    </div>`;
  }
  function getCorrectResponse(targetSide, stimulusSide) {
    return targetSide === "same" ? stimulusSide === "left" ? "left" : "right" : stimulusSide === "left" ? "right" : "left";
  }
  function createGametypeTrial(stimulusName) {
    return {
      type: HtmlButtonResponsePlugin,
      stimulus: `<div class="jspsych-hearts-and-flowers-instruction"><h3>
      This is the ${stimulusName}s game. Here's how you play it.</h3></div>`,
      choices: ["OK"],
      data: { trial_type: "demo_gametype", stimulus_name: stimulusName }
    };
  }
  function createTrial(jsPsych, stimulusInfo, instruction = false) {
    return {
      type: HtmlButtonResponsePlugin,
      stimulus: () => {
        const stimulusSide = jsPsych.evaluateTimelineVariable("stimulus_side");
        const targetSide = jsPsych.evaluateTimelineVariable("target_side");
        return generateStimulus(targetSide, stimulusSide, stimulusInfo, instruction);
      },
      choices: ["left", "right"],
      data: {
        trial_type: instruction ? "demo_trial" : "trial",
        stimulus_side: () => jsPsych.evaluateTimelineVariable("stimulus_side"),
        target_side: () => jsPsych.evaluateTimelineVariable("target_side"),
        stimulus_name: () => stimulusInfo[jsPsych.evaluateTimelineVariable("target_side")].stimulus_name,
        correct_response: () => {
          const stimulusSide = jsPsych.evaluateTimelineVariable("stimulus_side");
          const targetSide = jsPsych.evaluateTimelineVariable("target_side");
          return getCorrectResponse(targetSide, stimulusSide);
        }
      },
      on_finish: (data) => {
        data.correct = jsPsych.pluginAPI.compareKeys(
          data.response == 0 ? "left" : "right",
          // clicking "left" button results in data.response = 0
          data.correct_response
        );
      }
    };
  }
  function createFeedbackTrial(jsPsych) {
    return {
      plugin: HtmlKeyboardResponsePlugin,
      stimulus: () => {
        return `<div class="jspsych-hearts-and-flowers-instruction">
        <h3>${jsPsych.data.get().last(1).select("correct").values[0] ? "Great job!" : "Try again."}</h3>
      </div>`;
      },
      trial_duration: 1e3,
      data: {
        trial_type: "demo_feedback",
        correct: () => jsPsych.data.get().last(1).select("correct").values[0]
      }
    };
  }
  function createFixationTrial(jsPsych, fixationDurationFunction) {
    return {
      type: HtmlKeyboardResponsePlugin,
      stimulus: "<div class='jspsych-hearts-and-flowers-instruction'><h3>+</h3></div>",
      trial_duration: fixationDurationFunction,
      save_trial_parameters: {
        trial_duration: true
      },
      data: {
        trial_type: "fixation"
      }
    };
  }
  function createDemoSubTimeline(jsPsych, targetSide, stimulusInfo) {
    return {
      timeline: [
        createGametypeTrial(stimulusInfo[targetSide].stimulus_name),
        {
          timeline: [
            // A full demo session includes a demo trial with stimulus on the left and a demo trial with stimulus on the right
            {
              // Each demo trial includes a fixation trial, a trial with the actual stimulus, and a feedback trial
              timeline: [createTrial(jsPsych, stimulusInfo, true), createFeedbackTrial(jsPsych)],
              // The demo trial is repeated until the participant gets it right
              loop_function: () => !jsPsych.data.get().last(1).select("correct").values[0]
            }
          ],
          timeline_variables: ((targetSide2) => {
            switch (targetSide2) {
              case "same":
                return [
                  __spreadProps(__spreadValues({}, stimulusInfo.same), { stimulus_side: "left" }),
                  __spreadProps(__spreadValues({}, stimulusInfo.same), { stimulus_side: "right" })
                ];
              case "opposite":
                return [
                  __spreadProps(__spreadValues({}, stimulusInfo.opposite), { stimulus_side: "left" }),
                  __spreadProps(__spreadValues({}, stimulusInfo.opposite), { stimulus_side: "right" })
                ];
              case "both":
                return [
                  __spreadProps(__spreadValues({}, stimulusInfo.same), { stimulus_side: "left" }),
                  __spreadProps(__spreadValues({}, stimulusInfo.same), { stimulus_side: "right" }),
                  __spreadProps(__spreadValues({}, stimulusInfo.opposite), { stimulus_side: "left" }),
                  __spreadProps(__spreadValues({}, stimulusInfo.opposite), { stimulus_side: "right" })
                ];
              default:
                return [];
            }
          })(targetSide)
        }
      ]
    };
  }
  function createTrialsSubTimeline(jsPsych, options = {}) {
    const defaultOptions = {
      target_side: "both",
      n_trials: 20,
      target_side_weights: [1, 1],
      side_weights: [1, 1],
      fixation_duration_function: () => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1e3], 1)[0],
      stimulus_info: DEFAULT_STIMULUS_INFO_OBJECT
    };
    options = __spreadValues(__spreadValues({}, defaultOptions), options);
    return {
      timeline: [
        createFixationTrial(jsPsych, options.fixation_duration_function),
        createTrial(jsPsych, options.stimulus_info, false)
      ],
      timeline_variables: ((targetSide) => {
        switch (targetSide) {
          case "same":
            return [
              __spreadProps(__spreadValues({}, options.stimulus_info.same), { stimulus_side: "left" }),
              __spreadProps(__spreadValues({}, options.stimulus_info.same), { stimulus_side: "right" })
            ];
          case "opposite":
            return [
              __spreadProps(__spreadValues({}, options.stimulus_info.opposite), { stimulus_side: "left" }),
              __spreadProps(__spreadValues({}, options.stimulus_info.opposite), { stimulus_side: "right" })
            ];
          case "both":
            return [
              __spreadProps(__spreadValues({}, options.stimulus_info.same), { stimulus_side: "left" }),
              __spreadProps(__spreadValues({}, options.stimulus_info.same), { stimulus_side: "right" }),
              __spreadProps(__spreadValues({}, options.stimulus_info.opposite), { stimulus_side: "left" }),
              __spreadProps(__spreadValues({}, options.stimulus_info.opposite), { stimulus_side: "right" })
            ];
          default:
            return [];
        }
      })(options.target_side),
      sample: {
        type: "with-replacement",
        size: options.n_trials,
        weights: ((targetSide, targetSideWeights, sideWeights) => {
          if (targetSide === "both") {
            return targetSideWeights.flatMap((tsw) => sideWeights.map((sw) => tsw * sw));
          } else {
            return sideWeights;
          }
        })(options.target_side, options.target_side_weights, options.side_weights)
      }
    };
  }
  function createTimeline(jsPsych, options = {}) {
    const defaultOptions = {
      n_trials: 20,
      side_weights: [1, 1],
      target_side_weights: [1, 1],
      fixation_duration_function: () => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1e3], 1)[0],
      stimulus_options: {
        same_side_stimulus_name: "heart",
        same_side_stimulus_src: heartIconSvg,
        opposite_side_stimulus_name: "flower",
        opposite_side_stimulus_src: flowerIconSvg
      },
      demo: true,
      start_instruction_text: "Time to play!",
      end_instruction_text: "Great job! You're all done."
    };
    options = __spreadProps(__spreadValues(__spreadValues({}, defaultOptions), options), {
      stimulus_options: __spreadValues(__spreadValues({}, defaultOptions.stimulus_options), options.stimulus_options)
    });
    const stimulusInfo = {
      same: {
        stimulus_name: options.stimulus_options.same_side_stimulus_name,
        stimulus_src: options.stimulus_options.same_side_stimulus_src,
        target_side: "same"
      },
      opposite: {
        stimulus_name: options.stimulus_options.opposite_side_stimulus_name,
        stimulus_src: options.stimulus_options.opposite_side_stimulus_src,
        target_side: "opposite"
      }
    };
    const heartsAndFlowersTimeline = [];
    if (options.demo) {
      heartsAndFlowersTimeline.push(createDemoSubTimeline(jsPsych, "same", stimulusInfo));
      heartsAndFlowersTimeline.push(
        createDemoSubTimeline(jsPsych, "opposite", stimulusInfo)
      );
    }
    heartsAndFlowersTimeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: options.start_instruction_text,
      choices: ["OK"]
    });
    heartsAndFlowersTimeline.push(
      createTrialsSubTimeline(jsPsych, {
        target_side: "both",
        n_trials: options.n_trials,
        side_weights: options.side_weights,
        target_side_weights: options.target_side_weights,
        fixation_duration_function: options.fixation_duration_function,
        stimulus_info: stimulusInfo
      })
    );
    heartsAndFlowersTimeline.push({
      type: HtmlKeyboardResponsePlugin,
      stimulus: options.end_instruction_text,
      choices: "NO_KEYS"
    });
    return { timeline: heartsAndFlowersTimeline };
  }
  var timelineUnits = {
    createGametypeTrial,
    createTrial,
    createFeedbackTrial,
    createFixationTrial,
    createDemoSubTimeline,
    createTrialsSubTimeline
  };
  var utils = {
    generateStimulus,
    getCorrectResponse
  };

  exports.createTimeline = createTimeline;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.global.js.map