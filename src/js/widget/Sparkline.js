
function Sparkline(opt) {
  this.color = opt.color || 'black';
  this.type = opt.type || 'line';
  this.data = opt.data || [];
}

Sparkline.PADDING = 3;

Sparkline.prototype.render = function (containerId) {
  this.container = dom.find(containerId);
  let rect = this.container.getBoundingClientRect();
  let width = rect.width;
  let height = rect.height;

  let min = 0;
  let max = 0;

  for (let i = 0; i < this.data.length; i++) {
    let num = parseFloat(this.data[i]);
    if (min == 0) {
      min = num;
    }
    if (min > num) {
      min = num;
    }
    if (max < num) {
      max = num;
    }
  }

  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  this.container.appendChild(canvas);

  let ctx = canvas.getContext('2d');

  let dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  canvas.style = "width: 100%; height: 100%;";

  ctx.scale(dpr, dpr);

  if (this.type == 'line') {
    this.line(ctx, max, min, width, height);
  } else if (this.type == 'bar') {
    this.bar(ctx, max, min, width, height);
  }

  this.container.appendChild(canvas);
};

Sparkline.prototype.line = function (ctx, max, min, width, height) {
  let vRange = Math.abs(max - min);
  let vScale = (height - Sparkline.PADDING * 2) / vRange;
  let hScale = width / (this.data.length - 1);

  ctx.strokeStyle = this.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < this.data.length; i++) {
    let x = i * hScale;
    let y = height - (this.data[i] - min) * vScale - Sparkline.PADDING;
    if (i == 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
};

Sparkline.prototype.bar = function (ctx, max, min, width, height) {
  let vRange = Math.abs(max - min);
  let vScale = (height - Sparkline.PADDING * 2) / max;
  let barWidth = width / this.data.length - Sparkline.PADDING;

  ctx.fillStyle = this.color;
  ctx.lineWidth = 0;
  ctx.beginPath();
  let prev = 0;
  for (let i = 0; i < this.data.length; i++) {
    let x = (barWidth + Sparkline.PADDING) * i;
    let y = height - Sparkline.PADDING - this.data[i] * vScale;
    ctx.rect(x.toFixed(0), y.toFixed(0),
      barWidth.toFixed(0), (this.data[i] * vScale).toFixed(0));
    ctx.fill();
  }
};