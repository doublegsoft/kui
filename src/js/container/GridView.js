
function GridView(opt) {
  this.columnCount = opt.columnCount || 2;
  this.local = opt.local || [];
  this.url = opt.url;
  this.params = opt.params || {};
  // functions
  this.create = opt.create;
  this.error = opt.error || function (err) {};
}

GridView.prototype.fetch = async function (error) {
  if (!this.url) return this.local;
  let data = await xhr.promise({
    url: this.url,
    params: this.params,
  }, error);
  console.log(data);
  if (data) {
    this.local = data;
  }
  return this.local;
};

GridView.prototype.root = async function () {
  let ret = dom.element('<ul class="list-grid"></ul>');
  this.local = await this.fetch();
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    let li = dom.element('<li class="list-grid-item"></li>');
    let el = this.create(i, item, li);
    li.appendChild(el);
    ret.appendChild(li);
  }
  return ret;
};

GridView.prototype.render = async function (containerId) {
  this.container = dom.find(containerId);
  this.container.appendChild(await this.root());
};