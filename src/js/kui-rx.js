/**
 *
 * @param name
 * @param obj
 * @param handlers
 * @returns {*}
 * @constructor
 */
function BindingProxy(name, obj, observable) {
  let self = this;
  this.name = name;
  let handlers = {
    set: function(target, key, value) {
      let oldVal = target[key];
      target[key] = value;
      if (self.name != '' && !Array.isArray(target)) {
        key = self.name + '.' + key;
      } else if (Array.isArray(target)) {
        observable.notifyPropertyChanged(target, self.name, oldVal, value, key);
        return true;
      }
      observable.notifyPropertyChanged(target, key, oldVal, value);
      return true;
    }
  };
  return new Proxy(obj, handlers);
}

/**
 *
 * @param obj
 * @constructor
 */
function ObservableObject(obj) {
  this.observers = {};
  for (let key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = new BindingProxy(key, obj[key], this);
    } else if (typeof obj[key] === 'object') {
      obj[key] = new BindingProxy(key, obj[key], this);
    }
  }
  for (let key in obj) {
    this.observers[key] = [];
  }
  this.proxy = new BindingProxy('', obj, this);
}

ObservableObject.prototype.notifyPropertyChanged = function (obj, prop, oldVal, newVal, index) {
  if (!this.observers[prop]) return;
  for (let i = 0; i < this.observers[prop].length; i++) {
    let callback = this.observers[prop][i];
    if (typeof callback === 'string') {
      // eval(callback + '({property: prop, oldValue: oldVal, newValue: newVal})');
      let strs = callback.split('.');
      let fn = window;
      for (let j = 0; j < strs.length; j++) {
        fn = fn[strs[j]];
      }
      if (typeof fn === 'function') {
        // fn({
        //   property: prop,
        //   oldValue: oldVal,
        //   newValue: newVal
        // });
        fn(newVal, oldVal);
      }
    } else if (typeof callback === 'function') {
      callback(newVal, oldVal);
      // callback({
      //   property: prop,
      //   oldValue: oldVal,
      //   newValue: newVal
      // });
    }
  }
};

ObservableObject.prototype.addObserver = function(property, callback) {
  if (!this.observers[property]) {
    this.observers[property] = [];
  }
  this.observers[property].push(callback);
};

ObservableObject.prototype.setValue = function(property, value) {
  this.proxy[property] = value;
};

ObservableObject.prototype.install = function(containerId) {
  let self = this;
  let container = document.getElementById(containerId);
  let elements = container.querySelectorAll('[data-rx-model]');
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    let exprRxModel = element.getAttribute('data-rx-model');
    let rxModel = Rx.parse(exprRxModel);
    if (rxModel.procedure) {
      this.addObserver(rxModel.variable, rxModel.procedure);
    } else if (rxModel.event) {
      element.setAttribute('data-rx-variable', rxModel.variable);
      element.addEventListener(rxModel.event, function() {
        eval('self.proxy.' + this.getAttribute('data-rx-variable') + ' = this.value');
      });
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = ObservableObject;
}