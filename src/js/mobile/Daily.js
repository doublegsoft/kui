
function Daily(opt) {

}

Daily.prototype.root = function(containerId) {
  let ret = dom.element(`
    <div class="daily">
     
    </div>
  `);
};

Daily.prototype.buildTimeWindows = function(timeWindows) {
  let ret = dom.element(`
    <div class="time-window">
      <div class="time">
        <ul></ul>
      </div>
      <div class="event">
      </div>
    </div>
  `);
  let ul = dom.find('ul');
  for (let i = 0; i < timeWindows.length; i++) {
    let tw = timeWindows[i];
  }
  return ret;
}

Daily.prototype.render = function(containerId) {

};