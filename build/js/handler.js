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
    return this.data = {
      index: null,
      start: {},
      offset: {},
      source: null,
      parent: null,
      treshhold: {}
    };
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
    this.data.parent = node.parentNode;
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
    var base, base1;
    this.e = e1;
    this.e.preventDefault();
    (base = this.e).x || (base.x = this.e.clientX);
    (base1 = this.e).y || (base1.y = this.e.clientY);
    if (!this.active) {
      if (Math.abs(this.e.x - this.data.start.x) > this.dragify.options.threshold.x) {
        this.active = true;
      }
      if (Math.abs(this.e.y - this.data.start.y) > this.dragify.options.threshold.y) {
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
    this.mirror.style.transform = "translate(" + (this.e.x - this.data.offset.x) + "px," + (this.e.y - this.data.offset.y) + "px)";
    target = document.elementFromPoint(this.e.x, this.e.y);
    if (target === this.target) {
      return;
    }
    this.target = target;
    if (this.target) {
      return this["switch"]();
    }
  };

  Handler.prototype["switch"] = function() {
    var found, i, len, parent, ref, ref1;
    if (this.target !== this.data.parent) {
      this.data.parent = this.target.parentNode;
      this.dragify.emit('over', this.node, this.target, this.data.source);
    }
    found = false;
    ref = this.dragify.containers;
    for (i = 0, len = ref.length; i < len; i++) {
      parent = ref[i];
      if (((ref1 = this.target) != null ? ref1.parentNode : void 0) === parent) {
        found = true;
        break;
      }
      if (this.target === parent && this.node.parentNode !== parent) {
        return this.transfer();
      }
    }
    if (!found) {
      return;
    }
    if (this.target.parentNode !== this.node.parentNode || (this.getIndex(this.node)) > (this.getIndex(this.target))) {
      return this.insert(this.target.parentNode, this.node, this.target);
    } else {
      return this.insert(this.target.parentNode, this.node, this.target.nextSibling);
    }
  };

  Handler.prototype.insert = function(parent, node, target) {
    parent.insertBefore(node, target);
    return this.dragify.emit('move', this.node, this.node.parentNode, this.data.source);
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
