var Store = function() {
  this.state = null;
  this.reducer = null;
  this.listeners = [];
};

Store.prototype.dispatch = function(action) {
  this.state = this.reducer(this.state, action);
  this.listeners.forEach(function(listener) {
    listener();
  });
};

Store.prototype.createStore = function(reducer) {
  this.reducer = reducer;
  this.state = this.reducer(null, {});
}

Store.prototype.getState = function() {
  return this.state;
}

Store.prototype.subscribe = function(listener) {
  this.listeners.push(listener);
  return function unsubscribe() {
    var index = this.listeners.indexOf(listener);
    this.listeners.splice(index, 1);
  }
};

module.exports = Store;