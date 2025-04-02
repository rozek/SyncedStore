(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('yjs')) :
  typeof define === 'function' && define.amd ? define(['exports', 'yjs'], factory) :
  (global = global || self, factory(global.yjsReactiveBindings = {}, global.yjs));
})(this, (function (exports, Y) {
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

  var Y__namespace = /*#__PURE__*/_interopNamespace(Y);

  let customCreateAtom;
  let customReaction;
  let defaultReaction = func => func();
  function reaction(func, effect) {
    if (customReaction) {
      return customReaction(func, effect);
    } else {
      defaultReaction(func);
      return undefined;
    }
  }
  function createAtom(_name, _onBecomeObservedHandler, _onBecomeUnobservedHandler) {
    if (customCreateAtom) {
      return customCreateAtom.apply(null, arguments);
    } else {
      throw new Error("observable implementation not provided. Call enableReactiveBindings, enableVueBindings or enableMobxBindings.");
    }
  }
  /**
   * Enable MobX integration
   *
   * @param mobx An instance of mobx, e.g. import * as mobx from "mobx";
   */
  function enableMobxBindings(mobx) {
    customCreateAtom = mobx.createAtom;
    customReaction = undefined;
  }
  /**
   * Enable Vue3 integration
   *
   * @param vue An instance of Vue or Vue reactivity, e.g. import * as Vue from "vue";
   */
  function enableVueBindings(vue) {
    customCreateAtom = function (name, onBecomeObserved) {
      let id = 0;
      const data = vue.reactive({
        data: id
      });
      const atom = {
        reportObserved() {
          return data.data;
        },
        reportChanged() {
          data.data = ++id;
        }
      };
      if (onBecomeObserved) {
        onBecomeObserved();
      }
      return atom;
    };
    customReaction = undefined;
  }
  function enableReactiveBindings(reactive) {
    customCreateAtom = function (name, onBecomeObserved, onBecomeUnobserved) {
      // TMP
      const atom = reactive.createAtom(name);
      if (onBecomeObserved) {
        onBecomeObserved();
      }
      return atom;
    };
    customReaction = (func, effect) => {
      return reactive.reaction(func, effect, {
        fireImmediately: false
      });
    };
  }

  const arraysObserved = new WeakSet();
  function observeArray(array) {
    if (arraysObserved.has(array)) {
      // already patched
      return array;
    }
    arraysObserved.add(array);
    let selfAtom;
    const atoms = new Map();
    function reportSelfAtom() {
      if (!selfAtom) {
        const handler = event => {
          if (event.changes.added.size || event.changes.deleted.size || event.changes.keys.size || event.changes.delta.length) {
            selfAtom.reportChanged();
          }
        };
        selfAtom = createAtom("map", () => {
          array.observe(handler);
        }, () => {
          array.unobserve(handler);
        });
      }
      selfAtom.reportObserved(array._implicitObserver);
    }
    function reportArrayElementAtom(key) {
      let atom = atoms.get(key);
      // possible optimization: only register a single handler for all keys
      if (!atom) {
        const handler = event => {
          // TODO: detect key of changed element
          // if (event.keys.has(key + "")) {
          //   if (
          //     event.changes.added.size ||
          //     event.changes.deleted.size ||
          //     event.changes.keys.size ||
          //     event.changes.delta.length
          //   ) {
          atom.reportChanged();
          // }
        };
        atom = createAtom(key + "", () => {
          array.observe(handler);
        }, () => {
          array.unobserve(handler);
        });
        atoms.set(key, atom);
      }
      atom.reportObserved(array._implicitObserver);
    }
    const originalGet = array.get;
    array.get = function (key) {
      if (typeof key !== "number") {
        throw new Error("unexpected");
      }
      reportArrayElementAtom(key);
      const ret = Reflect.apply(originalGet, this, arguments);
      return ret;
    };
    function patch(method) {
      const originalFunction = array[method];
      array[method] = function () {
        reportSelfAtom();
        const ret = Reflect.apply(originalFunction, this, arguments);
        return ret;
      };
    }
    function patchGetter(method) {
      let target = array;
      let descriptor = Object.getOwnPropertyDescriptor(target, method);
      // properties might be defined down the prototype chain (e.g., properties on XmlFragment when working on an XmlElement)
      if (!descriptor) {
        target = Object.getPrototypeOf(target);
        descriptor = Object.getOwnPropertyDescriptor(target, method);
      }
      if (!descriptor) {
        target = Object.getPrototypeOf(target);
        descriptor = Object.getOwnPropertyDescriptor(target, method);
      }
      if (!descriptor) {
        throw new Error("property not found");
      }
      const originalFunction = descriptor.get;
      descriptor.get = function () {
        if (!this._disableTracking) {
          reportSelfAtom();
        }
        const ret = Reflect.apply(originalFunction, this, arguments);
        return ret;
      };
      Object.defineProperty(array, method, descriptor);
    }
    function copyGetter(method, newMethodName) {
      let target = array;
      let descriptor = Object.getOwnPropertyDescriptor(target, method);
      // properties might be defined down the prototype chain (e.g., properties on XmlFragment when working on an XmlElement)
      if (!descriptor) {
        target = Object.getPrototypeOf(target);
        descriptor = Object.getOwnPropertyDescriptor(target, method);
      }
      if (!descriptor) {
        target = Object.getPrototypeOf(target);
        descriptor = Object.getOwnPropertyDescriptor(target, method);
      }
      if (!descriptor) {
        throw new Error("property not found");
      }
      Object.defineProperty(array, newMethodName, descriptor);
    }
    patch("forEach");
    patch("toJSON");
    patch("toArray");
    patch("slice");
    patch("map");
    copyGetter("length", "lengthUntracked");
    patchGetter("length");
    // make push and slice use _disableTracking so calls to .length don't get observed
    const originalPush = array.push;
    array.push = function (content) {
      this._disableTracking = true;
      const ret = originalPush.call(this, content);
      this._disableTracking = false;
      return ret;
    };
    const originalSlice = array.slice;
    array.slice = function (start, end) {
      this._disableTracking = true;
      const ret = originalSlice.call(this, start, end);
      this._disableTracking = false;
      return ret;
    };
    // TODO: iterator
    return array;
  }

  const docsObserved$1 = new WeakSet();
  // TODO: add atoms, etc
  function observeDoc(doc) {
    if (docsObserved$1.has(doc)) {
      // already patched
      return doc;
    }
    docsObserved$1.add(doc);
    let selfAtom;
    function reportSelfAtom() {
      if (!selfAtom) {
        let oldKeys = Array.from(doc.share.keys());
        const handler = tr => {
          const newKeys = Array.from(doc.share.keys());
          if (JSON.stringify(oldKeys) !== JSON.stringify(newKeys)) {
            oldKeys = newKeys;
            selfAtom.reportChanged();
          }
        };
        selfAtom = createAtom("map", () => {
          doc.on("beforeObserverCalls", handler);
        }, () => {
          doc.off("beforeObserverCalls", handler);
        });
      }
      selfAtom.reportObserved(doc._implicitObserver);
    }
    const originalGet = doc.get;
    doc.get = function (key) {
      if (typeof key !== "string") {
        throw new Error("unexpected");
      }
      const ret = Reflect.apply(originalGet, this, arguments);
      observeYJS(ret);
      return ret;
    };
    function patch(method) {
      const originalFunction = doc[method];
      let previous;
      doc[method] = function () {
        let ret;
        let args = arguments;
        reportSelfAtom();
        if (previous) {
          previous.removeObservers(); // dispose
        }
        // we run this in a reaction, because the originalfunction might also trigger
        // observers in nested functions. In particular, if toJSON is called.
        previous = reaction(() => {
          ret = Reflect.apply(originalFunction, doc, args);
          return ret;
        }, () => selfAtom.reportChanged());
        return ret;
      };
    }
    patch("toJSON");
    Object.defineProperty(doc, "keys", {
      get: () => {
        reportSelfAtom();
        return Object.keys(doc.share);
      }
    });
    return doc;
  }

  const mapsObserved = new WeakSet();
  function observeMap(map) {
    if (mapsObserved.has(map)) {
      // already patched
      return map;
    }
    mapsObserved.add(map);
    let selfAtom;
    const atoms = new Map();
    function reportSelfAtom() {
      if (!selfAtom) {
        const handler = event => {
          if (event.changes.added.size || event.changes.deleted.size || event.changes.keys.size || event.changes.delta.length) {
            selfAtom.reportChanged();
          }
        };
        selfAtom = createAtom("map", () => {
          map.observe(handler);
        }, () => {
          map.unobserve(handler);
        });
      }
      selfAtom.reportObserved(map._implicitObserver);
    }
    function reportMapKeyAtom(key) {
      let atom = atoms.get(key);
      // possible optimization: only register a single handler for all keys
      if (!atom) {
        const handler = event => {
          if (event.keysChanged.has(key)) {
            if (event.changes.added.size || event.changes.deleted.size || event.changes.keys.size || event.changes.delta.length) {
              atom.reportChanged();
            }
          }
        };
        atom = createAtom(key, () => {
          map.observe(handler);
        }, () => {
          map.unobserve(handler);
        });
        atoms.set(key, atom);
      }
      atom.reportObserved(map._implicitObserver);
    }
    const originalGet = map.get;
    map.get = function (key) {
      if (typeof key !== "string") {
        throw new Error("unexpected");
      }
      reportMapKeyAtom(key);
      const ret = Reflect.apply(originalGet, this, arguments);
      return ret;
    };
    function patch(method) {
      const originalFunction = map[method];
      map[method] = function () {
        reportSelfAtom();
        const ret = Reflect.apply(originalFunction, this, arguments);
        return ret;
      };
    }
    patch("values");
    patch("entries");
    patch("keys");
    patch("forEach");
    patch("toJSON");
    // TODO: has, iterator
    return map;
  }

  const textsObserved = new WeakSet();
  function observeText(value) {
    if (textsObserved.has(value)) {
      // already patched
      return value;
    }
    textsObserved.add(value);
    let atom;
    const handler = _changes => {
      atom.reportChanged();
    };
    atom = createAtom("text", () => {
      value.observe(handler);
    }, () => {
      value.unobserve(handler);
    });
    function patch(method) {
      const originalFunction = value[method];
      value[method] = function () {
        atom.reportObserved(this._implicitObserver);
        const ret = Reflect.apply(originalFunction, this, arguments);
        return ret;
      };
    }
    patch("toString");
    patch("toJSON");
    return value;
  }

  const xmlsObserved = new WeakSet();
  function observeXml(value) {
    if (xmlsObserved.has(value)) {
      // already patched
      return value;
    }
    xmlsObserved.add(value);
    let atom;
    const handler = event => {
      if (event.changes.added.size || event.changes.deleted.size || event.changes.keys.size || event.changes.delta.length) {
        atom.reportChanged();
      }
    };
    atom = createAtom("xml", () => {
      value.observe(handler);
    }, () => {
      value.unobserve(handler);
    });
    function patch(method) {
      const originalFunction = value[method];
      value[method] = function () {
        atom.reportObserved(this._implicitObserver);
        const ret = Reflect.apply(originalFunction, this, arguments);
        return ret;
      };
    }
    function patchGetter(method) {
      let target = value;
      let descriptor = Object.getOwnPropertyDescriptor(target, method);
      // properties might be defined down the prototype chain (e.g., properties on XmlFragment when working on an XmlElement)
      if (!descriptor) {
        target = Object.getPrototypeOf(target);
        descriptor = Object.getOwnPropertyDescriptor(target, method);
      }
      if (!descriptor) {
        target = Object.getPrototypeOf(target);
        descriptor = Object.getOwnPropertyDescriptor(target, method);
      }
      if (!descriptor) {
        throw new Error("property not found");
      }
      const originalFunction = descriptor.get;
      descriptor.get = function () {
        atom.reportObserved(this._implicitObserver);
        const ret = Reflect.apply(originalFunction, this, arguments);
        return ret;
      };
      Object.defineProperty(value, method, descriptor);
    }
    patch("toString");
    patch("toDOM");
    patch("toArray");
    patch("getAttribute");
    patchGetter("firstChild");
    return value;
  }

  function isYType(element) {
    return element instanceof Y__namespace.AbstractType || Object.prototype.hasOwnProperty.call(element, "autoLoad"); // detect subdocs. Is there a better way for this?
  }
  function observeYJS(element) {
    if (element instanceof Y__namespace.XmlText) {
      return observeText(element);
    } else if (element instanceof Y__namespace.Text) {
      return observeText(element);
    } else if (element instanceof Y__namespace.Array) {
      return observeArray(element);
    } else if (element instanceof Y__namespace.Map) {
      return observeMap(element);
    } else if (element instanceof Y__namespace.Doc || Object.prototype.hasOwnProperty.call(element, "autoLoad")) {
      // subdoc. Ok way to detect this?
      return observeDoc(element);
    } else if (element instanceof Y__namespace.XmlFragment) {
      return observeXml(element);
    } else if (element instanceof Y__namespace.XmlElement) {
      return observeXml(element);
    } else ;
    return element;
  }
  function makeYDocRootLevelTypesObservable(doc) {
    doc.share.forEach(type => {
      // the explicit check is necessary because we sometimes initialize "anonymous" types that the user can't (and shouldn't) access.
      if (type.constructor !== Y__namespace.AbstractType) {
        // console.log("root", type)
        observeYJS(type);
      }
    });
  }
  function makeStructsObservable(structs, startPos) {
    for (let i = structs.length - 1; i >= startPos; i--) {
      let struct = structs[i];
      if (!struct.deleted) {
        if (struct instanceof Y__namespace.GC) {
          continue;
        }
        struct.content?.getContent().forEach(content => {
          if (content instanceof Y__namespace.AbstractType) {
            // console.log("struct", content)
            observeYJS(content);
            // console.log(content, "is a created type type");
          }
        });
      }
    }
  }
  const docsObserved = new WeakSet();
  function makeYDocObservable(doc) {
    if (docsObserved.has(doc)) {
      return;
    }
    docsObserved.add(doc);
    // based on https://github.com/yjs/yjs/pull/298#issuecomment-937636849
    // hook new root type creations (when calling getMap() or getArray(), etc)
    observeYJS(doc);
    // observe all structs already in the document
    doc.store.clients.forEach(entry => {
      if (entry) {
        makeStructsObservable(entry, 0);
      }
    });
    // observe all root-types
    makeYDocRootLevelTypesObservable(doc);
    // observe newly created types from now on
    doc.on("beforeObserverCalls", tr => {
      // observe new root types
      makeYDocRootLevelTypesObservable(doc);
      // observe new structs
      tr.afterState.forEach((clock, client) => {
        const beforeClock = tr.beforeState.get(client) || 0;
        if (beforeClock !== clock) {
          const structs = tr.doc.store.clients.get(client);
          if (!structs) {
            return;
          }
          const firstChangePos = Y__namespace.findIndexSS(structs, beforeClock);
          makeStructsObservable(structs, firstChangePos);
        }
      });
    });
  }

  exports.enableMobxBindings = enableMobxBindings;
  exports.enableReactiveBindings = enableReactiveBindings;
  exports.enableVueBindings = enableVueBindings;
  exports.isYType = isYType;
  exports.makeYDocObservable = makeYDocObservable;
  exports.observeYJS = observeYJS;

}));
//# sourceMappingURL=yjs-reactive-bindings.umd.js.map
