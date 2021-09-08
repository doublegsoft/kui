function Report(opts) {
	// 表单容器
	this.container = dom.find(opts.containerId);
	// 远程数据访问地址及参数
	this.url = opts.url;
	this.params = opts.params || {};
	// 本地数据
	this.local = opts.local;
	// 显示字段
	this.Data = opts.data;
	// 简介显示列数
	this.columnCount = opts.profileColumnCount || 4;
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
Report.prototype.fetch = function (params) {
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

Report.prototype.root = function (data) {
	this.container.innerHTML = '';
	let self = this;
	let root = dom.element('<div class="report-card"></div>');
	let headDom=dom.element('<div class="report-card-head"></div>');
	let headTitleDom=dom.element('<div class="report-card-head-title"></div>');
	if(data.name&&data.name.length>0){
		let titleDom=dom.element('<p class="head-title"><span>'+data.name+'</span></p>');
		headTitleDom.appendChild(titleDom);
	}
	let minTitleDom=dom.element('<p class="head-doctor"></p>');
	if(data.attendingDoctor){
		let _span=dom.element('<span>主诊医生：'+data.attendingDoctor+'</span>');
		minTitleDom.appendChild(_span)
	}else if(data.head&&data.head.length>0){
		data.head.forEach(function (item) {
			let _span=dom.element('<span> '+item.label+' : '+item.value+' </span>');
			minTitleDom.appendChild(_span)
		})
	}else{
		let _span=dom.element('<span>主诊医生：- </span>');
		minTitleDom.appendChild(_span)
	}
	headTitleDom.appendChild(minTitleDom);
	headDom.appendChild(headTitleDom);

	let _profile=[];
	if(data.profile&&data.profile.length>0){
		_profile=data.profile;
	}else{
		_profile=[{label:'检验单号',value:data.patientLaboratoryReportId},
			{label:'送检',value:data.reportDoctor?data.reportDoctor:''},
			{label:'性别',value:data.gender},
			{label:'姓名',value:data.patientName},
			{label:'年龄',value:(data.age?data.age+'岁':'')},
			{label:'标本部位',value:data.position?data.position:''},
			{label:'报告日期',value:data.reportTime?data.reportTime:''},
			{label:'送检日期',value:data.publishTime?data.publishTime:''}];
	}
	let profileHtml='';
	let colnumCount=12/this.columnCount;
	_profile.forEach(function (item) {
		let profilediv='<div class="col-lg-'+colnumCount+' col-sm-12 row-flex"><span>'+item.label+'：</span><div>'+item.value+'</div></div>';
		profileHtml=profileHtml+profilediv;
	})
	let profileDom=dom.element('<div class="report-card-head-body"><div class="row ml-0 mr-0">'+profileHtml+'</div></div>');
	headDom.appendChild(profileDom);

	let tableHtml='';
	if(data.results&&data.results.length>0){
		data.results.forEach(function (item) {
			let trDom='<tr style="color:'+(item.color?item.color:'#333333')+';"><td>'+item.componentName+'</td><td>'+item.result+'</td><td>'+item.unit+'</td><td>'+item.referenceRange+'</td><td>'+item.state+'</td></tr>';
			tableHtml=tableHtml+trDom;
		})
	}
	let contentDom=dom.element('<div class="report-card-body"><div class="report-table"><table><tr><th>检验项目</th><th>结果</th><th>单位</th><th>参考值</th><th>状态</th></tr>'+tableHtml+'</table></div></div>');
	root.appendChild(headDom);
	root.appendChild(contentDom);
	this.container.appendChild(root);
};

Report.prototype.reload = function (params) {
	this.fetch(params);
};

Report.prototype.render = function () {
	this.fetch({});
};
