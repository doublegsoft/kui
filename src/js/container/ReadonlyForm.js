
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
  this.convert=opts.convert;
  if(opts.url){
  	this.reload(opts.params)
	}else{
  	this.render();
	}
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
    	let _data=data;
    	if(self.convert){
				_data=self.convert(data)
			}
      self.root(_data);
    });
  } else {
    this.root(params);
  }
};

ReadonlyForm.prototype.root = function(data) {
  this.container.innerHTML = '';
  data = data || {};
  let self = this;
  let root = dom.element('<div class="row ml-0 mr-0"></div>');
  for (let i = 0; i < this.fields.length; i++) {
    let field = this.fields[i];
    field.emptyText = field.emptyText || '-';
    let colnum= parseInt(12/Number(self.columnCount));
    let col = dom.element("<div class='col-lg-"+colnum+" col-sm-12 row-flex'></div>");
    let caption = dom.element('<span></span>');
    let value = dom.element('<div></div>');

    caption.innerText = field.title+'：';
    var _value=null;

    if (typeof field.getValue !== 'undefined') {
			_value=field.getValue.apply(null, data);
    } else {
    	_value = data[field.name] || field.emptyText;
    }
    if(_value && (_value.length>0 || _value!='')){
			if(field.display){
				_value=field.display(data[field.name]);
			}else{
				if(field.values && field.values.length>0){
					field.values.forEach(function (item) {
						if(field.input&&(field.input=='radio' || field.input=='select') && item.value==data[field.name]){
							_value=item.text
						}
						if(field.input&&field.input=='checkbox' && data[field.name].indexOf(item.value)>-1){
							_value.push(item.text)
						}
					})
					if(field.input&&field.input=='checkbox' && typeof (_value)=='object'){
						_value=_value.join(",");
					}
				}
			}
			if(field.unit){
				_value=_value+field.unit;
			}
		}else{
			_value='-'
		}
		value.innerText =_value;
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
