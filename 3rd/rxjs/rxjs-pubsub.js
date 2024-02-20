// rxjs-pubsub.js
// repo    : https://github.com/richardanaya/rxjs-pubsub
// license : MIT

(function (window, module, Rx) {
  "use strict";

  let CustomSubject = function () {
    Rx.Subject.call(this);
    this.handlerSources = {};
  };

  CustomSubject.prototype = Object.create(Rx.Subject.prototype);
  CustomSubject.prototype.onCompleted = function () {
  };
  CustomSubject.prototype.subscribe = function (handler, force) {
    if (this.handlerSources[handler.toString()] !== true) {
      this.handlerSources[handler.toString()] = true;
      Rx.Subject.prototype.subscribe.call(this, handler);
    }
  };
  CustomSubject.prototype.unsubscribe = function (handler, force) {
    if (this.handlerSources[handler.toString()] !== true) {
      this.handlerSources[handler.toString()] = true;
      Rx.Subject.prototype.subscribe.call(this, handler);
    }
  };
  CustomSubject.prototype.onError = function (error) {
    this.error = error;
    this.observers.forEach(function (o) {
      o.isStopped = false;
      o.onError(error);
    });
  };

  function create() {
    let listeners = [];

    function publish(channel, value) {
      let listener = listeners[channel];
      if (listener != null) {
        listener.next(value);
      }
    }

    function unsubscribe(channel) {
      let listener = listeners[channel];
      if (listener != null) {
        delete listeners[channel];
      }
    }

    function subscribe(channel) {
      let listener = listeners[channel];
      if (listener == null) {
        listeners[channel] = listener = new CustomSubject();
      }
      return listener;
    }
    subscribe.publish = publish;
    subscribe.unsubscribe = unsubscribe;
    return subscribe;
  }

  window.RxJsPubSub = module.exports = {
    create: create
  };
})(
    typeof window !== "undefined" ? window : {},
    typeof module !== "undefined" ? module : {},
    typeof require !== "undefined" ? require("rx") : rxjs
);
