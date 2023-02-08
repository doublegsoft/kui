
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
  if (data) {
    this.local = data;
  }
  return this.local;
};

GridView.prototype.root = async function () {
  let ret = dom.element(`
    <div class="row mx-0">
      <div class="col-24-12 pr-1"></div>
      <div class="col-24-12 pl-1"></div>
    </div>
  `);
  let first = ret.children[0];
  let second = ret.children[1];

  this.local = await this.fetch();
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    let el = this.create(i, item);
    if (i % 2 == 0) {
      first.appendChild(el);
    } else {
      second.appendChild(el);
    }
  }
  return ret;
};

GridView.prototype.render = async function (containerId) {
  this.container = dom.find(containerId);
  this.container.appendChild(await this.root());
};