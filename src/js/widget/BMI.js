
function BMI(opts) {
  this.upperWeight = opts.upperWeight || 20;
  this.upperWeek = opts.upperWeek || 40;

  this.horizontalLines = [];
  this.verticalLines = [];

  this.dpr = opts.dpr;
}

BMI._185_UPPER = [0.1,0.3,0.9,1.1,1.4,1.6,1.9,2.1,2.2,2.8,3.1,3.2,4,4.4,5,5.6,6,6.4,7,7.4,8,8.6,9,9.4,10,10.6,11,11.3,12,12.7,13.2,13.5,14.3,14.9,15.2,15.7,16.4,16.8,17.2,18];
BMI._185_LOWER = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1,1.2,1.7,2,2.3,3,3.2,3.5,4.1,4.6,5,5.3,5.7,6.1,6.5,6.9,7.2,7.8,8.4,8.6,9,9.6,10,10.4,10.8,11.2,11.6,11.9,12.5];

BMI.prototype.render = function(canvas, params) {
  this.context = canvas.getContext('2d');

  if (!this.dpr) {
    this.dpr = window.devicePixelRatio || 1;
    this.height = canvas.clientHeight;
    this.width = canvas.clientWidth;
    let rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * this.dpr;
    canvas.height = rect.height * this.dpr;
    this.context.scale(this.dpr, this.dpr);
  }

  // this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
  // 画网格线
  this.drawGrids(this.context);
  this.drawLowerLimit(this.context);
  this.drawUpperLimit(this.context);
};

BMI.prototype.drawGrids = function(ctx) {
  let marginLeft = 40;
  let marginRight = 20;
  let marginBottom = 40;
  let marginTop = 10;

  let chartWidth  = this.width - marginLeft - marginRight;
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
  let ySpace = chartWidth / yLineCount;

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

  // 画竖线
  for (let i = 0; i < yLineCount; i++) {
    ctx.moveTo(this.startX + ySpace * (i + 1), this.startY + 10);
    ctx.lineTo(this.startX + ySpace * (i + 1), endY);
    if ((i + 1) % 3 == 1) {
      ctx.fillText((i + 1) + '', this.startX + ySpace * (i + 1) - ySpace, this.startY + 25);
    }
    this.verticalLines.push(this.startX + ySpace * (i + 1));
  }
  ctx.stroke();
  ctx.closePath();
};

BMI.prototype.drawUpperLimit = function(ctx) {
  ctx.beginPath();
  ctx.strokeStyle = '#ffc0cb';
  ctx.lineWidth = 2;
  ctx.setLineDash([10,5]);
  let prevPoint = null;
  for (let i = 0; i < BMI._185_UPPER.length; i++) {
    let val = BMI._185_UPPER[i];
    if (prevPoint = null) {
      ctx.moveTo(this.verticalLines[i], this.startY - (val * this.chartHeight / 20));
    } else {
      ctx.lineTo(this.verticalLines[i], this.startY - (val * this.chartHeight / 20));
      ctx.stroke();
    }
    prevPoint = this.verticalLines[i];
  }
  ctx.closePath();
};

BMI.prototype.drawLowerLimit = function(ctx) {
  ctx.beginPath();
  ctx.strokeStyle = '#ffc0cb';
  ctx.lineWidth = 2;
  ctx.setLineDash([10,5]);
  let prevPoint = null;
  for (let i = 0; i < BMI._185_LOWER.length; i++) {
    let val = BMI._185_LOWER[i];
    if (prevPoint = null) {
      ctx.moveTo(this.verticalLines[i], this.startY - (val * this.chartHeight / 20));
    } else {
      ctx.lineTo(this.verticalLines[i], this.startY - (val * this.chartHeight / 20));
      ctx.stroke();
    }
    prevPoint = this.verticalLines[i];
  }
  ctx.closePath();
};

if (typeof module !== 'undefined') {
  module.exports = BMI;
}