
function Status(opt) {
  this.model = opt.model;
  this.value = opt.value;
  this.onStatusClicked = opt.onStatusClicked;
}

Status.PENDING = {text: '暂停', color: ''};
Status.IN_PROCESSING = {text: '处理中', color: ''};
Status.COMPLETED = {text: '完成', color: ''};
Status.TERMINATED = {text: '中止', color: ''};
Status.CONNECTED = {text: '已连接', color: ''};

Status.prototype.renderTo = function(container) {
  let model = this.model;
  container.innerHTML = '';

  let el = dom.element(`
    <div class="font-13 m-auto tag-success">
      <span>${model.status.text}</span>
      <div class="tag-success-after"></div>
    </div>
  `);
  if (this.onStatusClicked) {
    el.classList.add('pointer');
    dom.bind(el, 'click', event => {
      this.onStatusClicked(dom.model(event.target));
    });
  }
  dom.model(el, this.value);
  container.appendChild(el);
};