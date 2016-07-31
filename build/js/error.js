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
      msg += "Event name must be a string";
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
