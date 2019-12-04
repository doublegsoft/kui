/**
 * 
 */
function MessageDispatcher(opts) {
  this.components = opts.components || [];
}

/**
 * Dispatches the message to observers.
 * 
 * @param {object} message
 *        the message data, include name and data
 */
MessageDispatcher.prototype.dispatch = function(message) {
  for (var i = 0; i < this.components.length; i++) {
    var component = this.components[i];
    if (component.message == message.name && component.observe) {
      component.observe(message);
    }
  }
}