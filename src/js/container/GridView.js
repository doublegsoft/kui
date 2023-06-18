
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
    </div>
  `);
  let cols = 24 / this.columnCount;
  if (cols < 10) {
    cols = '0' + cols;
  }
  for (let i = 0; i < this.columnCount; i++) {
    let el = dom.element(`<div class="col-24-${cols}"></div>`);
    ret.appendChild(el);
  }
  let index = 0;
  this.local = await this.fetch();
  for (let i = 0; i < this.local.length; i++) {
    let item = this.local[i];
    let el = this.create(i, item);
    index = i % this.columnCount;
    ret.children[index].appendChild(el);
  }
  return ret;
};

GridView.prototype.render = async function (containerId) {
  this.container = dom.find(containerId);
  this.container.appendChild(await this.root());
};

GridView.prototype.appendElement = function (el) {
  for (let i = 0; i < this.columnCount; i++) {

  }
};