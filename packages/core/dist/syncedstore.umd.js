(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@reactivedata/reactive'), require('@syncedstore/yjs-reactive-bindings'), require('yjs')) :
  typeof define === 'function' && define.amd ? define(['exports', '@reactivedata/reactive', '@syncedstore/yjs-reactive-bindings', 'yjs'], factory) :
  (global = global || self, factory(global.core = {}, global.reactive, global.yjsReactiveBindings, global.yjs));
})(this, (function (exports, reactive, yjsReactiveBindings, Y) {
  function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n["default"] = e;
    return n;
  }

  var reactive__namespace = /*#__PURE__*/_interopNamespace(reactive);
  var Y__namespace = /*#__PURE__*/_interopNamespace(Y);

  /**
   * @ignore
   */
  class Box {
    constructor(value) {
      this.value = void 0;
      this.value = value;
    }
  }
  function boxed(value) {
    if (ArrayBuffer.isView(value)) {
      // can't freeze arraybuffer
      return new Box(value);
    } else {
      return new Box(Object.freeze(value));
    }
  }

  function arrayImplementation(arr) {
    const slice = function slice() {
      let ic = this[reactive.$reactiveproxy]?.implicitObserver;
      arr._implicitObserver = ic;
      const items = arr.slice.bind(arr).apply(arr, arguments);
      return items.map(item => {
        const ret = parseYjsReturnValue(item, ic);
        if (ic && typeof ret === "object") {
          // when using Reactive, we should make sure the returned
          // object is made reactive with the implicit observer ic
          return reactive.reactive(ret, ic);
        } else {
          return ret;
        }
      });
    };
    const wrapItems = function wrapItems(items) {
      return items.map(item => {
        const wrapped = crdtValue(item); // TODO
        let valueToSet = getYjsValue(wrapped) || wrapped;
        if (valueToSet instanceof Box) {
          valueToSet = valueToSet.value;
        }
        if (valueToSet instanceof Y__namespace.AbstractType && valueToSet.parent) {
          throw new Error("Not supported: reassigning object that already occurs in the tree.");
        }
        return valueToSet;
      });
    };
    const findIndex = function findIndex() {
      return [].findIndex.apply(slice.apply(this), arguments);
    };
    const methods = {
      // get length() {
      //   return arr.length;
      // },
      // set length(val: number) {
      //   throw new Error("set length of yjs array is unsupported");
      // },
      slice,
      unshift: function () {
        arr.unshift(wrapItems([].slice.call(arguments)));
        return arr.lengthUntracked;
      },
      push: function () {
        arr.push(wrapItems([].slice.call(arguments)));
        return arr.lengthUntracked;
      },
      insert: arr.insert.bind(arr),
      toJSON: arr.toJSON.bind(arr),
      forEach: function () {
        return [].forEach.apply(slice.apply(this), arguments);
      },
      every: function () {
        return [].every.apply(slice.apply(this), arguments);
      },
      filter: function () {
        return [].filter.apply(slice.apply(this), arguments);
      },
      find: function () {
        return [].find.apply(slice.apply(this), arguments);
      },
      findIndex,
      some: function () {
        return [].some.apply(slice.apply(this), arguments);
      },
      includes: function () {
        return [].includes.apply(slice.apply(this), arguments);
      },
      map: function () {
        return [].map.apply(slice.apply(this), arguments);
      },
      indexOf: function () {
        const arg = arguments[0];
        return findIndex.call(this, el => areSame(el, arg));
      },
      splice: function () {
        let start = arguments[0] < 0 ? arr.length - Math.abs(arguments[0]) : arguments[0];
        let deleteCount = arguments[1];
        let items = Array.from(Array.from(arguments).slice(2));
        let deleted = slice.apply(this, [start, Number.isInteger(deleteCount) ? start + deleteCount : undefined]);
        if (arr.doc) {
          arr.doc.transact(() => {
            arr.delete(start, deleteCount);
            arr.insert(start, wrapItems(items));
          });
        } else {
          arr.delete(start, deleteCount);
          arr.insert(start, wrapItems(items));
        }
        return deleted;
      }
      // toJSON = () => {
      //   return this.arr.toJSON() slice();
      // };
      // delete = this.arr.delete.bind(this.arr) as (Y.Array<T>)["delete"];
    };
    const ret = [];
    for (let method in methods) {
      ret[method] = methods[method];
    }
    // this is necessary to prevent errors like "trap reported non-configurability for property 'length' which is either non-existent or configurable in the proxy target" when adding support for ownKeys and Reflect.keysx
    // (not necessary anymore now we changed ret from object to array)
    // Object.defineProperty(ret, "length", {
    //   enumerable: false,
    //   configurable: false,
    //   writable: true,
    //   value: (arr as any).lengthUntracked,
    // });
    return ret;
  }
  function propertyToNumber(p) {
    if (typeof p === "string" && p.trim().length) {
      const asNum = Number(p);
      // https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
      if (Number.isInteger(asNum)) {
        return asNum;
      }
    }
    return p;
  }
  function crdtArray(initializer, arr) {
    if (arr === void 0) {
      arr = new Y__namespace.Array();
    }
    if (arr[reactive.$reactive]) {
      throw new Error("unexpected");
      // arr = arr[$reactive].raw;
    }
    const implementation = arrayImplementation(arr);
    const proxy = new Proxy(implementation, {
      set: (target, pArg, value) => {
        const p = propertyToNumber(pArg);
        if (typeof p !== "number") {
          throw new Error();
        }
        // TODO map.set(p, smartValue(value));
        throw new Error("array assignment is not implemented / supported");
      },
      get: (target, pArg, receiver) => {
        const p = propertyToNumber(pArg);
        if (p === INTERNAL_SYMBOL) {
          return arr;
        }
        if (typeof p === "number") {
          let ic;
          if (receiver && receiver[reactive.$reactiveproxy]) {
            ic = receiver[reactive.$reactiveproxy]?.implicitObserver;
            arr._implicitObserver = ic;
          }
          let ret = arr.get(p);
          ret = parseYjsReturnValue(ret, ic);
          return ret;
        }
        if (p === Symbol.toStringTag) {
          return "Array";
        }
        if (p === Symbol.iterator) {
          const values = arr.slice();
          return Reflect.get(values, p);
        }
        if (p === "length") {
          return arr.length;
        }
        // forward to arrayimplementation
        const ret = Reflect.get(target, p, receiver);
        return ret;
      },
      // getOwnPropertyDescriptor: (target, pArg) => {
      //   const p = propertyToNumber(pArg);
      //   if (typeof p === "number" && p < arr.length && p >= 0) {
      //     return { configurable: true, enumerable: true, value: arr.get(p) };
      //   } else {
      //     return undefined;
      //   }
      // },
      deleteProperty: (target, pArg) => {
        const p = propertyToNumber(pArg);
        if (typeof p !== "number") {
          throw new Error();
        }
        if (p < arr.lengthUntracked && p >= 0) {
          arr.delete(p);
          return true;
        } else {
          return false;
        }
      },
      has: (target, pArg) => {
        const p = propertyToNumber(pArg);
        if (typeof p !== "number") {
          // forward to arrayimplementation
          return Reflect.has(target, p);
        }
        if (p < arr.lengthUntracked && p >= 0) {
          return true;
        } else {
          return false;
        }
      },
      getOwnPropertyDescriptor(target, pArg) {
        const p = propertyToNumber(pArg);
        if (p === "length") {
          return {
            enumerable: false,
            configurable: false,
            writable: true
          };
        }
        if (typeof p === "number" && p >= 0 && p < arr.lengthUntracked) {
          return {
            enumerable: true,
            configurable: true,
            writable: true
          };
        }
        return undefined;
      },
      ownKeys: target => {
        const keys = [];
        for (let i = 0; i < arr.length; i++) {
          keys.push(i + "");
        }
        keys.push("length");
        return keys;
      }
    });
    implementation.push.apply(proxy, initializer);
    return proxy;
  }

  function crdtObject(initializer, map) {
    if (map === void 0) {
      map = new Y__namespace.Map();
    }
    if (map[reactive.$reactive]) {
      throw new Error("unexpected");
      // map = map[$reactive].raw;
    }
    const proxy = new Proxy({}, {
      set: (target, p, value) => {
        if (typeof p !== "string") {
          throw new Error();
        }
        const wrapped = crdtValue(value); // TODO: maybe set cache
        let valueToSet = getYjsValue(wrapped) || wrapped;
        if (valueToSet instanceof Box) {
          valueToSet = valueToSet.value;
        }
        if (valueToSet instanceof Y__namespace.AbstractType && valueToSet.parent) {
          throw new Error("Not supported: reassigning object that already occurs in the tree.");
        }
        map.set(p, valueToSet);
        return true;
      },
      get: (target, p, receiver) => {
        if (p === INTERNAL_SYMBOL) {
          return map;
        }
        if (typeof p !== "string") {
          return Reflect.get(target, p);
          // throw new Error("get non string parameter");
        }
        let ic;
        if (receiver && receiver[reactive.$reactiveproxy]) {
          ic = receiver[reactive.$reactiveproxy]?.implicitObserver;
          map._implicitObserver = ic;
        }
        let ret = map.get(p);
        ret = parseYjsReturnValue(ret, ic);
        return ret;
      },
      deleteProperty: (target, p) => {
        if (typeof p !== "string") {
          throw new Error();
        }
        if (map.has(p)) {
          map.delete(p);
          return true;
        } else {
          return false;
        }
      },
      has: (target, p) => {
        if (typeof p === "string" && map.has(p)) {
          return true;
        }
        return false;
      },
      getOwnPropertyDescriptor(target, p) {
        if (typeof p === "string" && map.has(p)) {
          return {
            enumerable: true,
            configurable: true
          };
        }
        return undefined;
      },
      ownKeys: target => {
        return Array.from(map.keys());
      }
    });
    yToWrappedCache.set(map, proxy);
    for (let key in initializer) {
      proxy[key] = initializer[key];
    }
    return proxy;
  }

  function isYType(element) {
    return element instanceof Y__namespace.AbstractType;
  }

  const yToWrappedCache = new WeakMap();
  function parseYjsReturnValue(value, implicitObserver) {
    if (isYType(value)) {
      value._implicitObserver = implicitObserver;
      if (value instanceof Y__namespace.Array || value instanceof Y__namespace.Map) {
        if (!yToWrappedCache.has(value)) {
          const wrapped = crdtValue(value);
          yToWrappedCache.set(value, wrapped);
        }
        value = yToWrappedCache.get(value);
      } else if (value instanceof Y__namespace.XmlElement || value instanceof Y__namespace.XmlFragment || value instanceof Y__namespace.XmlText || value instanceof Y__namespace.XmlHook || value instanceof Y__namespace.Text) {
        reactive.markRaw(value);
        value.__v_skip = true; // for vue Reactive
      } else {
        throw new Error("unknown YType");
      }
      return value;
    } else if (value === null) {
      return null;
    } else if (typeof value === "object") {
      return boxed(value); // TODO: how do we recognize a boxed "null" value?
    }
    return value;
  }
  function crdtValue(value) {
    if (value === null || value === undefined) {
      return value;
    }
    value = getYjsValue(value) || value; // unwrap
    if (value instanceof Y__namespace.Array) {
      return crdtArray([], value);
    } else if (value instanceof Y__namespace.Map) {
      return crdtObject({}, value);
    } else if (typeof value === "string") {
      return value; // TODO
    } else if (Array.isArray(value)) {
      return crdtArray(value);
    } else if (value instanceof Y__namespace.XmlElement || value instanceof Y__namespace.XmlFragment || value instanceof Y__namespace.XmlText || value instanceof Y__namespace.XmlHook) {
      return value;
    } else if (value instanceof Y__namespace.Text) {
      return value;
    } else if (typeof value === "object") {
      if (value instanceof Box) {
        return value;
      } else {
        return crdtObject(value);
      }
    } else if (typeof value === "number" || typeof value === "boolean") {
      return value;
    } else {
      throw new Error("invalid");
    }
  }

  // export type rootTypeDescription<T extends rootTypeDescriptionParent> = {
  //   [P in keyof T]?: T[P];
  // };
  function validateRootTypeDescription(typeDescription) {
    for (let [key, val] of Object.entries(typeDescription)) {
      if (Array.isArray(val)) {
        if (val.length !== 0) {
          throw new Error("Root Array initializer must always be empty array");
        }
      } else if (val && typeof val === "object") {
        if (Object.keys(val).length !== 0 || Object.getPrototypeOf(val) !== Object.prototype) {
          throw new Error("Root Object initializer must always be {}");
        }
      } else if (val !== "xml" && val !== "text") {
        throw new Error("unknown Root initializer");
      }
    }
  }
  function getYjsByTypeDescription(doc, typeDescription, p) {
    let description = typeDescription[p];
    if (!description) {
      // exclude expected Vue Reactive checks from logging a warning
      if (p !== "__v_raw" && p !== "__v_isRef" && p !== "__v_isReadonly" && p != "$$typeof") {
        console.warn("property not found on root doc", p);
      }
      return undefined;
    }
    return description === "xml" ? doc.getXmlFragment(p) : description === "text" ? doc.getText(p) : Array.isArray(description) ? doc.getArray(p) : doc.getMap(p);
  }
  function crdtDoc(doc, typeDescription) {
    if (doc[reactive.$reactive]) {
      throw new Error("unexpected");
    }
    validateRootTypeDescription(typeDescription);
    const proxy = new Proxy({}, {
      set: (target, p, value) => {
        if (typeof p !== "string") {
          throw new Error();
        }
        throw new Error("cannot set new elements on root doc");
      },
      get: (target, p, receiver) => {
        if (p === INTERNAL_SYMBOL) {
          return doc;
        }
        if (typeof p !== "string") {
          return Reflect.get(target, p);
          // throw new Error("get non string parameter");
        }
        let ic;
        if (receiver && receiver[reactive.$reactiveproxy]) {
          ic = receiver[reactive.$reactiveproxy]?.implicitObserver;
          doc._implicitObserver = ic;
        }
        if (p === "toJSON") {
          for (let key of Object.keys(typeDescription)) {
            // initialize all values
            getYjsByTypeDescription(doc, typeDescription, key);
          }
          const ret = Reflect.get(doc, p);
          return ret;
        }
        let ret = getYjsByTypeDescription(doc, typeDescription, p);
        ret = parseYjsReturnValue(ret, ic);
        return ret;
      },
      deleteProperty: (target, p) => {
        throw new Error("deleteProperty not available for doc");
      },
      has: (target, p) => {
        if (typeof p === "string" && doc.share.has(p)) {
          return true;
        }
        return false;
      },
      getOwnPropertyDescriptor(target, p) {
        if (typeof p === "string" && doc.share.has(p) || p === "toJSON") {
          return {
            enumerable: true,
            configurable: true
          };
        }
        return undefined;
      },
      ownKeys: target => {
        return Array.from(doc.share.keys());
      }
    });
    yToWrappedCache.set(doc, proxy);
    return proxy;
  }

  /**
   * Filter a SyncedStore array
   * @param arr array to filter
   * @param filter predicate to filter the array `arr` by
   */
  function filterArray(arr, filter) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (!filter(arr[i])) {
        arr.splice(i, 1);
      }
    }
  }

  // setup yjs-reactive-bindings
  yjsReactiveBindings.enableReactiveBindings(reactive__namespace); // use reactive bindings by default
  /**
   * @ignore
   */
  const INTERNAL_SYMBOL = Symbol("INTERNAL_SYMBOL");
  /**
   * Register a listener for when any changes to `object` or its nested objects occur.
   *
   * @param object the synced object (store, object, map, or Yjs value to observe)
   * @param handler the callback to be raised.
   * @returns a function to dispose (unregister) the handler
   */
  function observeDeep(object, handler) {
    const internal = getYjsValue(object) || object;
    if (!internal) {
      throw new Error("not a valid synced object");
    }
    if (internal instanceof Y__namespace.Doc) {
      internal.on("update", handler);
      return () => {
        internal.off("update", handler);
      };
    } else {
      internal.observeDeep(handler);
      return () => {
        internal.unobserveDeep(handler);
      };
    }
  }
  /**
   * Access the internal Yjs Doc.
   *
   * @param store a store returned by
   * @returns the Yjs doc (Y.Doc) underneath.
   */
  function getYjsDoc(store) {
    const ret = getYjsValue(store);
    if (!(ret instanceof Y__namespace.Doc)) {
      throw new Error("store is not a valid syncedStore that maps to a Y.Doc");
    }
    return ret;
  }
  /**
   * Access the internal Yjs value that backs the syncing of the passed in object.
   *
   * @param object a value retrieved from the store
   * @returns the Yjs value underneath. This can be a Y.Doc, Y.Array, Y.Map or other Y-type based on the value passed in
   */
  function getYjsValue(object) {
    if (typeof object !== "object" || object === null) {
      return undefined;
    }
    const ret = object[INTERNAL_SYMBOL];
    if (ret) {
      reactive.markRaw(ret);
      ret.__v_skip = true; // for vue Reactive
    }
    return ret;
  }
  /**
   * Check whether two objects represent the same value.
   * A strict equality (===) check doesn't always work,
   * because SyncedStore can wrap the object with a Proxy depending on where you retrieved it.
   *
   * @param objectA Object to compare with objectB
   * @param objectB Object to compare with objectA
   * @returns true if they represent the same object, false otherwise
   */
  function areSame(objectA, objectB) {
    if (objectA === objectB) {
      return true;
    }
    if (typeof objectA === "object" && typeof objectB === "object") {
      const internalA = getYjsValue(objectA);
      const internalB = getYjsValue(objectB);
      if (!internalA || !internalB) {
        // one of them doesn't have an internal value
        return false;
      }
      return internalA === internalB;
    }
    return false;
  }
  /**
   * Create a SyncedStore store
   * @param shape an object that describes the root types of the store. e.g.:
   *  const shape = {
   *    exampleArrayData: [],
   *    exampleObjectData: {},
   *    exampleXMLData: "xml",
   *    exampleTextData: "text",
   * };
   * @param doc (optional) a Y.Doc to use as the backing system
   * @returns a SyncedStore store
   */
  function syncedStore(shape, doc) {
    if (doc === void 0) {
      doc = new Y__namespace.Doc();
    }
    yjsReactiveBindings.makeYDocObservable(doc);
    return crdtDoc(doc, shape);
  }

  Object.defineProperty(exports, 'enableMobxBindings', {
    enumerable: true,
    get: function () { return yjsReactiveBindings.enableMobxBindings; }
  });
  Object.defineProperty(exports, 'enableVueBindings', {
    enumerable: true,
    get: function () { return yjsReactiveBindings.enableVueBindings; }
  });
  Object.defineProperty(exports, 'SyncedArray', {
    enumerable: true,
    get: function () { return Y.Array; }
  });
  Object.defineProperty(exports, 'SyncedDoc', {
    enumerable: true,
    get: function () { return Y.Doc; }
  });
  Object.defineProperty(exports, 'SyncedMap', {
    enumerable: true,
    get: function () { return Y.Map; }
  });
  Object.defineProperty(exports, 'SyncedText', {
    enumerable: true,
    get: function () { return Y.Text; }
  });
  Object.defineProperty(exports, 'SyncedXml', {
    enumerable: true,
    get: function () { return Y.XmlFragment; }
  });
  exports.Y = Y__namespace;
  exports.Box = Box;
  exports.INTERNAL_SYMBOL = INTERNAL_SYMBOL;
  exports.areSame = areSame;
  exports.boxed = boxed;
  exports["default"] = syncedStore;
  exports.filterArray = filterArray;
  exports.getYjsDoc = getYjsDoc;
  exports.getYjsValue = getYjsValue;
  exports.observeDeep = observeDeep;
  exports.syncedStore = syncedStore;

}));
//# sourceMappingURL=syncedstore.umd.js.map
