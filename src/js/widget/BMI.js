function BMI(opts) {
	this.upperWeight = opts.upperWeight || 20;
	this.upperWeek = opts.upperWeek || 40;

	this.horizontalLines = [];
	this.verticalLines = [];

	this.dpr = opts.dpr;
	this.height = opts.height;
	this.width = opts.width;
}

BMI._185_UPPER = [0.1, 0.3, 0.9, 1.1, 1.4, 1.6, 1.9, 2.1, 2.2, 2.8, 3.1, 3.2, 4, 4.4, 5, 5.6, 6, 6.4, 7, 7.4, 8, 8.6, 9, 9.4, 10, 10.6, 11, 11.3, 12, 12.7, 13.2, 13.5, 14.3, 14.9, 15.2, 15.7, 16.4, 16.8, 17.2, 18];
BMI._185_LOWER = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.7, 2, 2.3, 3, 3.2, 3.5, 4.1, 4.6, 5, 5.3, 5.7, 6.1, 6.5, 6.9, 7.2, 7.8, 8.4, 8.6, 9, 9.6, 10, 10.4, 10.8, 11.2, 11.6, 11.9, 12.5];

BMI.prototype.render = function (canvas, params) {
	this.context = canvas.getContext('2d');
	if (!this.dpr) {
		this.dpr = window.devicePixelRatio || 1;
		this.height = canvas.clientHeight;
		this.width = canvas.clientWidth;
		let rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * this.dpr;
		canvas.height = rect.height * this.dpr;
		this.context.scale(this.dpr, this.dpr);
	} else {
		canvas.width = this.width * this.dpr;
		canvas.height = this.height * this.dpr;
		this.context.scale(this.dpr, this.dpr);
	}

	// this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
	// 画网格线
	this.drawGrids(this.context);
	// this.drawLowerLimit(this.context);
	// this.drawUpperLimit(this.context);
	this.drawLine(this.context, BMI._185_LOWER);
	this.drawLine(this.context, BMI._185_UPPER);

	//绘制需要实际展示的线段
	if (Array.isArray(params) && params.length > 0) {//多条线
		params.forEach((item, index) => {
			this.drawLine(this.context, item.data, (item.color ? item.color : color));
		})
	} else if (!Array.isArray(params) && params.data && params.data.length > 0) {//单条线
		const linedata = params.data || [];
		const linecolor = params.color || '#333';
		this.drawLine(this.context, linedata, linecolor);
	}
};

BMI.prototype.drawGrids = function (ctx) {
	let marginLeft = 80;
	let marginRight = 20;
	let marginBottom = 80;
	let marginTop = 10;

	this.chartWidth = this.width - marginLeft - marginRight;
	this.chartHeight = this.height - marginTop - marginBottom;

	this.startX = marginLeft;
	this.startY = this.height - marginBottom;
	let endX = this.width - marginRight;
	let endY = marginTop;

	ctx.beginPath();
	ctx.lineWidth = 1;

	// X轴
	ctx.moveTo(this.startX - 10, this.startY);
	ctx.lineTo(endX, this.startY);
	ctx.stroke();

	// Y轴
	ctx.moveTo(this.startX, this.startY + 10);
	ctx.lineTo(this.startX, endY);
	ctx.stroke();
	ctx.closePath();

	let xLineCount = 10;
	let yLineCount = 40;

	let xSpace = this.chartHeight / xLineCount;
	let ySpace = this.chartWidth / yLineCount;

	// 画横线
	ctx.beginPath();
	ctx.font = '14px serif';
	ctx.lineWidth = 0.2;
	for (let i = 0; i < xLineCount; i++) {
		ctx.moveTo(this.startX - 10, this.startY - xSpace * (i + 1));
		ctx.lineTo(endX, this.startY - xSpace * (i + 1));
		ctx.fillText(i * 2 + '', this.startX - 30, this.startY - xSpace * i + 4);
		this.horizontalLines.push(this.startY - xSpace * (i + 1));
	}
	ctx.fillText('20', this.startX - 30, this.startY - xSpace * xLineCount + 4);
	this.drawVtext(ctx, '体重增长', '（kg）', 15, this.startY - xSpace * xLineCount + 4, 0, '#000', 6);

	// 画竖线
	for (let i = 0; i < yLineCount; i++) {
		ctx.moveTo(this.startX + ySpace * (i + 1), this.startY + 10);
		ctx.lineTo(this.startX + ySpace * (i + 1), endY);
		if ((i + 1) % 3 == 1) {
			ctx.fillText((i + 1) + '', this.startX + ySpace * (i + 1) - ySpace, this.startY + 25);
		}
		this.verticalLines.push(this.startX + ySpace * (i + 1));
	}
	ctx.fillText('孕期（周）', (this.width / 2) - 16, this.startY + 50);
	ctx.stroke();
	ctx.closePath();
};
//左边标题
BMI.prototype.drawVtext = function (ctx, text, unit, tx, ty, ux, color, ls) {
	let x = tx, y = ty; // 文字开始的坐标
	let letterSpacing = ls || 10; // 设置字间距
	for (let i = 0; i < text.length; i++) {
		const str = text.slice(i, i + 1).toString();
		if (str.match(/[A-Za-z0-9]/) && (y < 576)) { // 非汉字 旋转
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(Math.PI / 180 * 90);
			ctx.textBaseline = 'bottom';
			ctx.fillText(str, 0, 0);
			ctx.restore();
			y += ctx.measureText(str).width + letterSpacing; // 计算文字宽度
		} else if (str.match(/[\u4E00-\u9FA5]/) && (y < 576)) {
			ctx.save();
			ctx.textBaseline = 'top';
			ctx.fillText(str, x, y);
			ctx.restore();
			y += ctx.measureText(str).width + letterSpacing; // 计算文字宽度
		}
	}
	ctx.fillText(unit, ux, y + 10);
}

BMI.prototype.drawLine = function (ctx, data, color = '#ffc0cb', lineWidth = 2) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.setLineDash([10, 5]);
	let prevPoint = null;
	let ySpace = this.chartWidth / 40;
	for (let i = 0; i < data.length; i++) {
		let val = data[i], xval = -1, yval = -1;
		let x = 0, y = 0;
		if (typeof (val) == 'object') {
			xval = data[i].x;
			yval = data[i].y;
			x = this.startX + ySpace * xval;
		} else {
			yval = data[i];
			x = this.verticalLines[i];
		}
		y = this.startY - (yval * this.chartHeight / 20);
		if (prevPoint = null) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
			ctx.stroke();
		}
		prevPoint = this.verticalLines[i];
	}
	ctx.closePath();
};

if (typeof module !== 'undefined') {
	module.exports = BMI;
}