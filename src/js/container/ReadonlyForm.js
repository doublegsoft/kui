
function ReadonlyForm(opts) {
  // 表单容器
  this.container = dom.find(opts.containerId);
  // 远程数据访问地址及参数
  this.url = opts.url;
  this.params = opts.params || {};
  // 本地数据
  this.local = opts.local;
  // 显示列数
  this.columnCount = opts.columnCount || 1;
  // 显示字段
  this.fields = opts.fields;
}

/**
 * Fetches data from remote url.
 *
 * @param params
 *        the request parameters, local data or undefined
 */
ReadonlyForm.prototype.fetch = function(params) {
  let self = this;
  if (this.url) {
    let requestParams = {};
    utils.clone(this.params, requestParams);
    utils.clone(params || {}, requestParams);
    xhr.promise({
      url: this.url,
      params: requestParams,
    }).then((data) => {
      self.root(data);
    });
  } else {
    this.root(params);
  }
};

ReadonlyForm.prototype.root = function(data) {
  this.container.innerHTML = '';
  let root = dom.element('<div class="row"></div>');
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    field.emptyText = field.emptyText || '-';
    let col = dom.element('<div class="col-md-3"></div>');
    let caption = dom.element('<label></label>');
    let value = dom.element('<label></label>');

    caption.innerText = field.text;
    if (typeof field.getValue !== 'undefined') {
      value.innerText = field.getValue.apply(null, data);
    } else {
      value.innerText = data[field.name] || field.emptyText;
    }

    col.appendChild(caption);
    col.appendChild(value);
    root.appendChild(col);
  }
  this.container.appendChild(root);
};

ReadonlyForm.prototype.reload = function(params) {
  this.fetch(params);
};

ReadonlyForm.prototype.render = function() {
  this.fetch({});
};
