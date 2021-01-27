

function GroupLayout(opts) {
  // title
  this.titled = opts.titled || true;
  // 向服务器端请求的参数
  this.params = opts.data;
  // 组别信息
  this.groups = opts.groups;
}

GroupLayout.prototype.group = function(params, options) {
  let title = options.title;
  let groupTitle = dom.element('<div class="title-bordered mb-2"><strong>' + title + '</strong></div>');
  let groupContainer = dom.create('div');

  let group = dom.create('div');
  if (this.titled) {
    group.appendChild(groupTitle);
  }
  group.appendChild(groupContainer);
  this.container.appendChild(group);

  // use callback function to render group content view
  options.render(groupContainer, options);
};

GroupLayout.prototype.render = function(selector) {
  if (typeof selector === 'string') {
    this.container = dom.find(selector);
  } else {
    this.container = selector;
  }
  for (let i = 0; i < this.groups.length; i++) {
    let groupOption = this.groups[i];
    this.group(this.params, groupOption);
  }
};