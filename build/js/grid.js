var Error, Grid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Error = require("./error");

Grid = (function() {
  function Grid(dragify) {
    this.dragify = dragify;
    this.mousedown = bind(this.mousedown, this);
    if (this.dragify.options.grid != null) {
      return;
    }
    this.load();
    this.setup();
    this.listeners();
  }

  Grid.prototype.load = function() {
    return this.error = (new Error({
      dragify: this.dragify
    })).error;
  };

  Grid.prototype.setup = function() {};

  Grid.prototype.listeners = function() {
    return window.addEventListener("mousedown", this.mousedown);
  };

  Grid.prototype.mousedown = function(ev) {
    if (ev.button !== 0) {
      return;
    }
    if (!(this.node = this.validMousedown(ev.target))) {
      return;
    }
    console.log("@node", this.node);
    return window.addEventListener("mousemove", this.mousemove);
  };

  Grid.prototype.validMousedown = function(target) {
    var check, validate;
    check = (function(_this) {
      return function(el) {
        var e, error;
        try {
          return _this.validContainer(el);
        } catch (error) {
          e = error;
          return false;
        }
      };
    })(this);
    validate = function(node) {
      if (check(node.parentNode)) {
        return node;
      }
      if (node.parentNode) {
        return validate(node.parentNode);
      }
      return false;
    };
    return validate(target);
  };

  Grid.prototype.validContainer = function(el) {
    if (!el || el === document) {
      return false;
    }
    return this.dragify.containers.indexOf(el) !== -1 || this.dragify.options.isContainer(el);
  };

  return Grid;

})();

module.exports = Grid;
