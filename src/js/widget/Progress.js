
function Progress(opt) {
  this.model = opt.model;
  this.value = opt.value;
}

Progress.prototype.renderTo = function(container) {
  container.innerHTML = '';

  let model = this.model;
  let max = model.max || 100;
  let value = model.value || 0;
  model.fnPercentage = function() {
    if (parseFloat(model.value) == 0) return '未开始';
    let progress = (model.value / model.max) * 100;
    return progress + '%';
  };
  model.fnDuration = function() {
    let startDate = model.startDate;
    let finishDate = model.finishDate;
    if (typeof startDate === 'number') {
      startDate = moment(startDate).format('YYYY年MM月DD日');
    }
    if (typeof finishDate === 'undefined') {
      finishDate = '待定';
    } else if (typeof finishDate === 'number') {
      finishDate = moment(finishDate).format('YYYY年MM月DD日');
    }
    return startDate + ' - ' + finishDate;
  };
  model.fnStatus = function() {
    let startDate = model.startDate;
    let finishDate = model.finishDate;
    let now = moment(new Date());
    if (typeof finishDate === 'undefined') return 'success';
    if (typeof finishDate === 'number') {
      finishDate = moment(finishDate);
    }
    let diff = finishDate.subtract(now).days();
    if (diff < 0) return 'danger';
    return 'success';
  };

  let html = `
    <div>
      <div class="clearfix">
        <div class="float-left">
          <strong>${model.fnPercentage()}</strong>
        </div>
        <div class="float-right">
          <small class="text-muted">${model.fnDuration()}</small>
        </div>
      </div>
      <div class="progress progress-xs">
        <div class="progress-bar bg-${model.fnStatus()}" role="progressbar" style="width: ${model.fnPercentage()}" aria-valuenow="${model.value}" aria-valuemin="0" aria-valuemax="${model.max}"></div> 
      </div>
    </div>
  `;
  let el = dom.element(html);
  dom.model(el, this.value);
  container.appendChild(el);
};