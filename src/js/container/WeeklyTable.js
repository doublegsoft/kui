
function WeeklyTable(opts) {
  this.datable = opts.datable !== false;

  this.now = moment();
  this.weekday = this.now.day();
}

WeeklyTable.prototype.render = function(containerId) {
  this.container = dom.find(containerId);
};

