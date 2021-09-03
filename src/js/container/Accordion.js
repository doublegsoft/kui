function Accordion(opts) {
	// 表单容器
	this.container = dom.find(opts.containerId);
	// 远程数据访问地址及参数
	this.url = opts.url;
	this.params = opts.params || {};
	// 本地数据
	this.local = opts.local;
	// 显示字段
	this.Data = opts.data;
	this.convert = opts.convert;
	this.rowClick = opts.rowClick;
	this.mode=opts.mode || 'radio'
	if (opts.url) {
		this.reload(opts.params)
	} else {
		this.render();
	}
}

/**
 * Fetches data from remote url.
 *
 * @param params
 *        the request parameters, local data or undefined
 */
Accordion.prototype.fetch = function (params) {
	let self = this;
	if (this.url) {
		let requestParams = {};
		utils.clone(this.params, requestParams);
		utils.clone(params || {}, requestParams);
		xhr.promise({
			url: this.url,
			params: requestParams,
		}).then((data) => {
			let _data = data;
			if (self.convert) {
				_data = self.convert(data)
			}
			self.root(_data);
		});
	} else {
		this.root(params);
	}
};

Accordion.prototype.root = function (data) {
	this.container.innerHTML = '';
	let self = this;
	let root = dom.element('<div class="tabs-card"></div>');
	for (let i = 0; i < data.length; i++) {
		let item = data[i];
		let _id = 'check' + (i + 1);
		let Item = dom.element('<div class="tab">\n' +
				'            <input type='+self.mode+' id=' + _id +' '+(self.mode=='radio'?'name=radio_name':'')+'>\n' +
				'            <label class="tab-label" for=' + _id + '>' + item.title + '</label>\n' +
				'          </div>');
		let Child = dom.element('<div class="tab-content"></div>');
		item.children.forEach(function (child, index) {
			let _childId=_id+'_child'+(index+1),_childName='child_radio_name';
			let childdom = dom.element('<div class="tab-child"><input type="radio" id='+_childId+' name='+_childName+'><label class="tab-label-min" for=' + _childId + '>' + child.title + '</label></div>');
			Child.appendChild(childdom);
			dom.bind(childdom, 'click', function (event) {
				self.rowClick(event, child, index);
			});
		})
		Item.appendChild(Child);
		root.appendChild(Item);
	}
	this.container.appendChild(root);
};

Accordion.prototype.reload = function (params) {
	this.fetch(params);
};

Accordion.prototype.render = function () {
	this.fetch({});
};
