

function GroupLayout(opts) {
  // 向服务器端请求的参数
  this.params = opts.data;
  // 行
  this.groups = opts.groups;
}

GroupLayout.prototype.group = function(title, opt) {
  let groupTitle = dom.element('<div class="title-bordered mb-2"><strong>' + title + '</strong></div>');
  let groupContainer = dom.create('div');

  let group = dom.create('div');
  if (title) {
    group.appendChild(groupTitle);
  }
  group.appendChild(groupContainer);
  this.container.appendChild(group);

  // use callback function to render group content view
  opt.render(groupContainer, opt);
};

GroupLayout.prototype.render = function(containerSelector) {
  this.container = dom.find(containerSelector);
  for (let i = 0; i < this.groups.length; i++) {
    let groupOption = this.groups[i];
    this.group(groupOption.title, groupOption);
  }
};