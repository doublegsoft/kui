if (typeof schedule === 'undefined') schedule = {};

schedule.names = {};

schedule.stop = function (name) {
  if (typeof name === 'undefined') {
    for (let key in schedule.names) {
      clearInterval(schedule.names[key]);
    }
    schedule.names = {};
    return;
  }
  clearInterval(schedule.names[name]);
  delete schedule.names[name];
};

schedule.start = function (name, handle, interval) {
  if (schedule.names[name]) {
    clearInterval(schedule.names[name]);
  }
  schedule.names[name] = setInterval(function() {
    handle();
  }, interval);
  handle();
};