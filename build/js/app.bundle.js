(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Dragify, Handler, MiniEventEmitter, msg,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MiniEventEmitter = require('mini-event-emitter');

Handler = require('./handler');

if (MiniEventEmitter == null) {
  msg = 'Dragify depends on the MiniEventEmitter.\nhttps://github.com/hawkerboy7/mini-event-emitter\nDefine it before Dragify';
  if (console.warn) {
    console.warn(msg);
  } else {
    console.log(msg);
  }
}

Dragify = (function(superClass) {
  extend(Dragify, superClass);

  function Dragify(containers, options) {
    var ref, ref1, x, y;
    this.containers = containers;
    Dragify.__super__.constructor.apply(this, arguments);
    this.options = {
      threshold: {
        x: 3,
        y: 3
      },
      transition: true
    };
    if ((options != null ? options.transition : void 0) != null) {
      this.options.transition = options.transition;
    }
    if ((x = options != null ? (ref = options.threshold) != null ? ref.x : void 0 : void 0) != null) {
      this.options.threshold.x = x;
    }
    if ((y = options != null ? (ref1 = options.threshold) != null ? ref1.y : void 0 : void 0) != null) {
      this.options.threshold.y = y;
    }
    new Handler(this);
  }

  return Dragify;

})(MiniEventEmitter);

module.exports = Dragify;

},{"./handler":3,"mini-event-emitter":4}],2:[function(require,module,exports){
var Error;

Error = (function() {
  function Error(dragify) {
    var ref;
    this.dragify = dragify;
    this.block = !((ref = this.dragify.options) != null ? ref.error : void 0);
  }

  Error.prototype.error = function(id) {
    var msg;
    if (this.block) {
      return;
    }
    msg = "Dragify ~ ";
    if (id === 1) {
      msg += "First argument 'Containers' must be an array";
    }
    if (id === 2) {
      msg += "Dragify was unable to find the correct offset, please report an issue on https://github.com/hawkerboy7/dragify/issues/new. Please provide an example in which this error occurs";
    }
    if (console.warn) {
      return console.warn(msg);
    } else {
      return console.log(msg);
    }
  };

  return Error;

})();

module.exports = Error;

},{}],3:[function(require,module,exports){
var Error, Handler,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Error = require('./error');

Handler = (function() {
  function Handler(dragify) {
    this.dragify = dragify;
    this.mousemove = bind(this.mousemove, this);
    this.mousedown = bind(this.mousedown, this);
    this.mouseup = bind(this.mouseup, this);
    this.load();
    this.setup();
    this.listeners();
  }

  Handler.prototype.load = function() {
    return this.error = (new Error({
      dragify: this.dragify
    })).error;
  };

  Handler.prototype.setup = function() {
    if (this.dragify.containers.constructor !== Array) {
      return this.error(1);
    }
    this.setData();
    return this.create();
  };

  Handler.prototype.setData = function() {
    this.data = {
      index: null,
      start: {},
      offset: {},
      source: null,
      parent: null,
      treshhold: {}
    };
    return this.previous = {};
  };

  Handler.prototype.listeners = function() {
    var container, i, len, ref;
    ref = this.dragify.containers;
    for (i = 0, len = ref.length; i < len; i++) {
      container = ref[i];
      this.listen(container);
    }
    return window.addEventListener('mouseup', this.mouseup);
  };

  Handler.prototype.mouseup = function(e) {
    if (e.button !== 0) {
      return;
    }
    window.removeEventListener('mousemove', this.mousemove);
    if (this.active) {
      return this.reset();
    }
  };

  Handler.prototype.listen = function(container) {
    var i, len, node, ref, results, set;
    set = (function(_this) {
      return function(node) {
        return node.addEventListener('mousedown', function(ev) {
          return _this.mousedown(ev, node);
        });
      };
    })(this);
    ref = container.childNodes;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      node = ref[i];
      results.push(set(node));
    }
    return results;
  };

  Handler.prototype.mousedown = function(ev, node) {
    var check, el, found, i, len, ref, x, y;
    if (ev.button !== 0) {
      return;
    }
    this.node = node;
    this.data.source = node.parentNode;
    this.data.index = this.getIndex(node);
    this.data.start.x = ev.x || ev.clientX;
    this.data.start.y = ev.y || ev.clientY;
    x = ev.offsetX;
    y = ev.offsetY;
    if (ev.path) {
      ref = ev.path;
      for (i = 0, len = ref.length; i < len; i++) {
        el = ref[i];
        if (el === node) {
          found = true;
          break;
        }
        x += el.offsetLeft;
        y += el.offsetTop;
      }
    } else {
      check = function(target) {
        if (target === node) {
          return found = true;
        }
        x += target.offsetLeft;
        y += target.offsetTop;
        if (target.parentNode) {
          return check(target.parentNode);
        }
      };
      check(ev.target);
    }
    if (!found) {
      return this.error(2);
    }
    this.data.offset = {
      x: x,
      y: y
    };
    return window.addEventListener('mousemove', this.mousemove);
  };

  Handler.prototype.mousemove = function(e1) {
    this.e = e1;
    this.e.preventDefault();
    this.e.X = this.e.clientX;
    this.e.Y = this.e.clientY;
    if (!this.active) {
      if (Math.abs(this.e.X - this.data.start.x) > this.dragify.options.threshold.x) {
        this.active = true;
      }
      if (Math.abs(this.e.Y - this.data.start.y) > this.dragify.options.threshold.y) {
        this.active = true;
      }
      if (!this.active) {
        return;
      }
      this.set();
    }
    if (this.active) {
      return this.position();
    }
  };

  Handler.prototype.position = function() {
    var target;
    this.mirror.style.transform = "translate(" + (this.e.X - this.data.offset.x) + "px," + (this.e.Y - this.data.offset.y) + "px)";
    target = document.elementFromPoint(this.e.X, this.e.Y);
    if (target && target === this.previous.target) {
      return;
    }
    this.previous.target = target;
    if (!(target = this.valid(target))) {
      return;
    }
    if (target === this.previous.valid) {
      return;
    }
    if (this.node === target) {
      return;
    }
    this.previous.valid = target;
    return this["switch"](target);
  };

  Handler.prototype.valid = function(target) {
    var find, valid;
    if (!target) {
      return;
    }
    valid = false;
    if (-1 !== this.dragify.containers.indexOf(target)) {
      valid = target;
    }
    find = (function(_this) {
      return function(el) {
        if (-1 === _this.dragify.containers.indexOf(el.parentNode)) {
          if (el.parentNode) {
            return find(el.parentNode);
          }
        } else {
          return valid = el;
        }
      };
    })(this);
    find(target);
    return valid;
  };

  Handler.prototype["switch"] = function(target1) {
    this.target = target1;
    if (-1 !== this.dragify.containers.indexOf(this.target)) {
      if (this.node.parentNode !== this.target) {
        this.transfer();
      }
      return;
    }
    if (this.target.parentNode !== this.node.parentNode || (this.getIndex(this.node)) > (this.getIndex(this.target))) {
      return this.insert(this.target.parentNode, this.node, this.target);
    } else {
      return this.insert(this.target.parentNode, this.node, this.target.nextSibling);
    }
  };

  Handler.prototype.insert = function(parent, node, target) {
    var replaced;
    parent.insertBefore(node, target);
    replaced = this.target !== parent ? this.target : void 0;
    return this.dragify.emit('move', this.node, this.node.parentNode, this.data.source, replaced);
  };

  Handler.prototype.getIndex = function(node) {
    var child, i, index, len, ref;
    ref = node.parentNode.childNodes;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      child = ref[index];
      if (child === node) {
        return index;
      }
    }
    return null;
  };

  Handler.prototype.transfer = function() {
    var below, child, i, index, len, lower, lowest, ref, ref1, target, val;
    lowest = null;
    ref = this.target.childNodes;
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      child = ref[index];
      ref1 = this.distance({
        top: child.offsetTop,
        bottom: child.offsetTop + child.clientHeight
      }), val = ref1[0], lower = ref1[1];
      if (!lowest || val < lowest) {
        lowest = val;
        target = child;
        below = lower;
      }
    }
    if (this.target.childNodes[this.target.childNodes.length - 1] === target && below) {
      target = null;
    }
    return this.insert(this.target, this.node, target);
  };

  Handler.prototype.distance = function(pos) {
    var below, bottom, val, y;
    below = false;
    y = this.e.offsetY;
    val = Math.abs(y - pos.top);
    if (val > (bottom = Math.abs(y - pos.bottom))) {
      val = bottom;
    }
    return [val, y > pos.bottom];
  };

  Handler.prototype.create = function() {
    this.mirror = document.createElement('div');
    this.mirror.tabIndex = 0;
    return this.mirror.className = 'dragify--mirror';
  };

  Handler.prototype.set = function() {
    var clone;
    this.previous.valid = this.node.parentNode;
    this.dragify.emit('drag', this.node, this.node.parentNode);
    this.mirror.appendChild(clone = this.node.cloneNode(true));
    clone.style.width = this.node.offsetWidth + "px";
    clone.style.height = this.node.offsetHeight + "px";
    document.body.appendChild(this.mirror);
    this.mirror.focus();
    this.addClass(document.body, 'dragify--body');
    if (this.dragify.options.transition) {
      this.addClass(this.node, 'dragify--transition');
    }
    return this.addClass(this.node, 'dragify--opaque');
  };

  Handler.prototype.reset = function() {
    var remove;
    this.active = false;
    while (this.mirror.firstChild) {
      this.mirror.removeChild(this.mirror.firstChild);
    }
    document.body.removeChild(this.mirror);
    this.mirror.removeAttribute('style');
    this.removeClass(document.body, 'dragify--body');
    this.removeClass(this.node, 'dragify--opaque');
    remove = (function(_this) {
      return function(node) {
        return setTimeout(function() {
          return _this.removeClass(node, 'dragify--transition');
        }, 500);
      };
    })(this);
    if (this.dragify.options.transition) {
      remove(this.node);
    }
    if (this.data.source === this.node.parentNode && this.data.index === this.getIndex(this.node)) {
      this.dragify.emit('cancel', this.node, this.node.parentNode);
    } else {
      this.dragify.emit('drop', this.node, this.node.parentNode, this.data.source);
    }
    this.dragify.emit('end', this.node);
    this.node = null;
    this.target = null;
    return this.setData();
  };

  Handler.prototype.addClass = function(node, className) {
    var classes;
    classes = [];
    if (node.className) {
      classes = node.className.split(' ');
    }
    classes.push(className);
    return node.className = classes.join(' ');
  };

  Handler.prototype.removeClass = function(node, className) {
    var classes;
    classes = node.className.split(' ');
    classes.splice(classes.indexOf(className), 1);
    if (classes.length === 0) {
      return node.removeAttribute('class');
    } else {
      return node.className = classes.join(' ');
    }
  };

  return Handler;

})();

module.exports = Handler;

},{"./error":2}],4:[function(require,module,exports){
var MiniEventEmitter;

MiniEventEmitter = (function() {
  var _emit, error, isFunction, isString, objLength, optional;

  function MiniEventEmitter(obj) {
    this.settings = {
      error: (obj != null ? obj.error : void 0) || false,
      trace: (obj != null ? obj.trace : void 0) || false,
      worker: (obj != null ? obj.worker : void 0) || null
    };
    this.events = {};
    this.groups = {};
    if (!this.settings.worker) {
      return;
    }
    this.worker = webworkify(this.settings.worker);
    this.worker.addEventListener('message', (function(_this) {
      return function(arg) {
        var data;
        data = arg.data;
        return _emit({
          self: _this,
          args: data.args,
          event: data.event,
          internal: true
        });
      };
    })(this));
  }

  MiniEventEmitter.prototype.on = function(event, group, fn) {
    var ref;
    ref = optional(group, fn), group = ref[0], fn = ref[1];
    if (!isString(event)) {
      return error(this, 'on', 1);
    }
    if (!isString(group)) {
      return error(this, 'on', 5);
    }
    if (!isFunction(fn)) {
      return error(this, 'on', 6, event, group);
    }
    if (this.groups[group]) {
      if (this.groups[group][event]) {
        this.groups[group][event].push(fn);
      } else {
        this.groups[group][event] = [fn];
      }
    } else {
      this.groups[group] = {};
      this.groups[group][event] = [fn];
    }
    if (this.events[event]) {
      this.events[event].push(fn);
    } else {
      this.events[event] = [fn];
    }
    return this;
  };

  MiniEventEmitter.prototype.off = function(event, group, fn) {
    var actions, index1, index2, ref, ref1, removeFn;
    removeFn = (function(_this) {
      return function() {
        var action, i, index, len;
        for (i = 0, len = actions.length; i < len; i++) {
          action = actions[i];
          index = _this.events[event].indexOf(action);
          _this.events[event].splice(index, 1);
        }
        if (_this.events[event].length === 0) {
          return delete _this.events[event];
        }
      };
    })(this);
    ref = optional(group, fn), group = ref[0], fn = ref[1];
    if (event && !isString(event)) {
      return error(this, 'off', 1);
    }
    if (!isString(group)) {
      return error(this, 'off', 5);
    }
    if (fn && !isFunction(fn)) {
      return error(this, 'off', 6, event, group);
    }
    if (event && !this.groups[group]) {
      return error(this, 'off', 7, event, group);
    }
    if (!event) {
      ref1 = this.groups[group];
      for (event in ref1) {
        actions = ref1[event];
        removeFn();
      }
      delete this.groups[group];
      return this;
    }
    if (!(actions = this.groups[group][event])) {
      return error(this, 'off', 4, event, group);
    }
    if (!fn) {
      removeFn();
      delete this.groups[group][event];
      if (0 === objLength(this.groups[group])) {
        delete this.groups[group];
      }
      return this;
    }
    if (-1 === (index1 = actions.indexOf(fn))) {
      return error(this, 'off', 2, event, group);
    }
    actions.splice(index1, 1);
    if (actions.length === 0) {
      delete this.groups[group][event];
    }
    if (0 === objLength(this.groups[group])) {
      delete this.groups[group];
    }
    index2 = this.events[event].indexOf(fn);
    this.events[event].splice(index2, 1);
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
    return this;
  };

  MiniEventEmitter.prototype.emit = function() {
    var args, event;
    args = Array.from(arguments);
    event = args.shift();
    return _emit({
      self: this,
      args: args,
      event: event,
      internal: false
    });
  };

  MiniEventEmitter.prototype.trigger = function() {
    this.emit.apply(this, arguments);
    return this;
  };

  isString = function(event) {
    return typeof event === 'string' || event instanceof String;
  };

  objLength = function(obj) {
    return Object.keys(obj).length;
  };

  isFunction = function(fn) {
    return typeof fn === 'function';
  };

  error = function(self, name, id, event, group) {
    var msg;
    if (!self.settings.error) {
      return self;
    }
    msg = "MiniEventEmitter ~ " + name + " ~ ";
    if (id === 1) {
      msg += "Event name must be a string";
    }
    if (id === 2) {
      msg += "Provided function to remove with event \"" + event + "\" in group \"" + group + "\" is not found";
    }
    if (id === 3) {
      msg += "Event was not provided";
    }
    if (id === 4) {
      msg += "Event \"" + event + "\" does not exist";
    }
    if (id === 5) {
      msg += "Provided group must be a string";
    }
    if (id === 6) {
      msg += "The last param provided with event \"" + event + "\" and group \"" + group + "\" is expected to be a function";
    }
    if (id === 7) {
      msg += "Provided Group \"" + group + "\" doesn't have any events";
    }
    if (console.warn) {
      console.warn(msg);
    } else {
      console.log(msg);
    }
    return self;
  };

  optional = function(group, fn) {
    if ((fn == null) && isFunction(group)) {
      fn = group;
      group = '';
    } else {
      if (!group) {
        group = '';
      }
    }
    return [group, fn];
  };

  _emit = function(arg) {
    var action, args, event, i, internal, len, list, msg, self;
    self = arg.self, event = arg.event, args = arg.args, internal = arg.internal;
    if (!event) {
      return error(self, 'emit', 3);
    }
    if (!isString(event)) {
      return error(self, 'emit', 1);
    }
    if (!(list = self.events[event])) {
      return error(self, 'emit', 4, event);
    }
    if (self.settings.worker && !internal) {
      self.worker.postMessage({
        args: args,
        event: event
      });
    } else {
      if (self.settings.trace) {
        msg = "MiniEventEmitter ~ trace ~ " + event;
        if (console.debug) {
          console.debug(msg);
        } else {
          console.log(msg);
        }
      }
      for (i = 0, len = list.length; i < len; i++) {
        action = list[i];
        action.apply(action, args);
      }
    }
    return self;
  };

  return MiniEventEmitter;

})();

(function() {
  var msg;
  if ((typeof module !== "undefined" && module !== null) && module.exports) {
    return module.exports = MiniEventEmitter;
  } else if (window) {
    return window.MiniEventEmitter = MiniEventEmitter;
  } else {
    msg = "Cannot expose MiniEventEmitter";
    if (console.warn) {
      return console.warn(msg);
    } else {
      return console.log(msg);
    }
  }
})();

},{}]},{},[1])