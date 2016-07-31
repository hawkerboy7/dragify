var Dragify, Events, Handler,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Events = require('mini-event-emitter');

Handler = require('./handler');

Dragify = (function(superClass) {
  extend(Dragify, superClass);

  function Dragify(containers, options) {
    var ref, ref1;
    this.containers = containers;
    Dragify.__super__.constructor.apply(this, arguments);
    this.options = {
      threshold: {
        x: (options != null ? (ref = options.threshold) != null ? ref.x : void 0 : void 0) || 3,
        y: (options != null ? (ref1 = options.threshold) != null ? ref1.y : void 0 : void 0) || 3
      }
    };
    new Handler(this);
  }

  return Dragify;

})(Events);

module.exports = Dragify;
