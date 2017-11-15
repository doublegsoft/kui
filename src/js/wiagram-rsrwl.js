if (typeof wiagram === 'undefined') wiagram = {};

var RSRWL_DAM = {
    gaugeX: 7,
    gaugeY: 40.7,
    lbX: 25.7,
    lbY: 40.7,
    rbX: 206.5,
    rbY: 40.7,
    ltX: 112.3,
    ltY: 6,
    rtX: 124,
    rtY: 6
};

/**
 * 水库水位实时示意图。依赖库为d3，里面最重要的参数是viewBox，因为水位示意图底图是预置的，
 * 它的viewBox是固定的，所以很多参数同样是需要根据这个viewBox来预置。
 *
 * @param {object} option - 选项 
 * <ul>
 *   <li>crel: 坝顶高程</li>
 *   <li>maxdmhg: 最大坝高</li>
 *
 *   <li>rz: 坝前水位</li>
 *   <li>drz: 下游水位</li>
 *   <li>w: 蓄水量</li>
 *
 *   <li>dsfllv: 设计洪水位</li>
 *   <li>chfllv: 校核洪水位</li>
 *   <li>ddwl: 死水位</li>
 *   <li>flsscnwl: 汛限水位</li>
 *   <li>nrstlv: 正常蓄水位</li>
 *
 *   <li>svgurl: 底图加载路径</li>
 * </ul>
 *
 * @constructor 
 */
wiagram.Rsrwl = function (option) {
    this.svgurl = option.svgurl;

    this.maxdmhg = option.maxdmhg;
    this.crel = option.crel;

    this.rz = option.rz;
    this.drz = option.drz;
    this.w = option.w || 0;

    this.ddwl = option.ddwl;
    this.flsscnwl = option.flsscnwl;
    this.nrstlv = option.nrstlv;
    this.chfllv = option.chfllv;
    this.dsfllv = option.dsfllv;
};

wiagram.Rsrwl.prototype.render = function (containerId) {
    var self = this;
    // 绑定DOM元素标识到对象上
    this.containerId = containerId;
    var svg = new Svg({
        svgurl: this.svgurl,
        onLoaded: function (svg, dom) {
            // 设置SVG根文档，绑定在对象实例
            self.svg = svg;
            self.dom = dom;
            self.decorate(self.dom.cloneNode(true));
        }
    });
    svg.render(containerId);
};

/**
 * 设置或者更新显示值。
 *
 * @param {object} values - 更新值
 * <ul>
 *   <li>rz: 坝前水位</li>
 *   <li>drz: 下游水位</li>
 *   <li>drp: 小时雨量</li>
 * </ul>
 * 
 * @public
 */
wiagram.Rsrwl.prototype.setValues = function (values) {
    this.rz = values.rz;
    this.drz = values.drz;
    this.w = values.w;

    this.decorate(this.dom.cloneNode(true));
};

/**
 * Decorates the svg document with custom drawing.
 * 
 * @param {object} svg - svg文档
 *
 * @private
 */
wiagram.Rsrwl.prototype.decorate = function (svg) {

    var crel = this.crel;
    var maxdmhg = this.maxdmhg;

    var rz = this.rz;
    var drz = this.drz;
    var w = this.w;

    var ddwl = this.ddwl;
    var chfllv = this.chsfllv;
    var dsfllv = this.dsfllv;
    var flsscnwl = this.flsscnwl;
    var nrstlv = this.nrstlv;

    var cbel = crel - maxdmhg;
    var dam = RSRWL_DAM;
    var self = this;

    // 先被5除
    var maxdmhgBy5 = parseInt(maxdmhg / 5);
    var maxdmhgResi = maxdmhg % 5;
    if (maxdmhgResi != 0) maxdmhgBy5 += 1;

    // 每米的实际坐标
    var scale1m = (dam.lbY - dam.ltY) / maxdmhg;

    // 距离坝底最近的能够被5除尽
    var cbelBy5 = parseInt(cbel / 5);
    var scaleEl = cbelBy5 * 5 + maxdmhgBy5;

    var scales = [];
    for (var i = 0; i < 5; i++) {
        scales.push({ el: scaleEl, offsetY: (scaleEl - cbel) * scale1m });
        scaleEl += maxdmhgBy5;
    }

    var distanceY = scales[1].offsetY - scales[0].offsetY;

    // 计算水位在图中坐标
    var rzY = dam.lbY - (rz - cbel) * scale1m;

    var rzX = (dam.ltX - dam.lbX) * (dam.lbY - rzY) / (dam.lbY - dam.ltY) + dam.lbX;

    // 下游水位
    var drzY = 0;
    var drzX = 0;
    if (typeof drz !== 'undefined') {
        drzY = dam.lbY - (drz - cbel) * scale1m;
        drzX = dam.rbX - (dam.rbX - dam.rtX) * (dam.lbY - drzY) / (dam.lbY - dam.ltY);
    }

    // 坝前水位
    if (typeof rz !== 'undefined') {
        wiagram.polygon(svg, [[0, dam.lbY], [dam.lbX, dam.lbY], [rzX, rzY], [0, rzY]], { fill: '#74ccf4', stroke: '#74ccf4', 'stroke-width': 0.02 });
        if (w === 0) {
            wiagram.text(svg, rzX - 20, rzY - 1, '坝前水位：' + rz + '米', { 'font-size': 2, 'font-weight': 'bold', fill: 'blue' });
        } else {
            wiagram.text(svg, rzX - 45, rzY - 1, '坝前水位：' + rz + '米，库容：' + w + '万立方', { 'font-size': 2, 'font-weight': 'bold', fill: 'blue' });
        }
        if (drzY !== 0) {
            wiagram.polygon(svg, [[210, dam.lbY], [dam.rbX, dam.rbY], [drzX, drzY], [210, drzY]], { fill: '#74ccf4', stroke: '#74ccf4', 'stroke-width': 0.02 });
            wiagram.text(svg, drzX - 7, drzY - 1, '下游水位：' + drz + '米', { 'font-size': 2, 'font-weight': 'bold', fill: 'blue' });
        }
    }
    // 整数刻度
    // 竖线
    wiagram.line(svg, dam.gaugeX, dam.gaugeY, dam.gaugeX, dam.ltY, { fill: 'blue', stroke: 'blue', 'stroke-width': 0.4 });
    for (var i = 0; i < scales.length; i++) {
        if (scales[i].el > crel) break;
        var scale = scales[i];
        var y = dam.gaugeY - scale.offsetY;
        // 大于了坝顶高程，刻度不画出来
        wiagram.line(svg, dam.gaugeX, y, dam.gaugeX + 3.0, y, { fill: 'blue', stroke: 'blue', 'stroke-width': 0.4 });
        wiagram.text(svg, 2, y, '' + scale.el, { 'font-size': 2, 'font-weight': 'bold' });
        // 标注高程文字
        for (var j = 1; j < 5; j++) {
            if (scale.el + j > crel) break;
            y = dam.gaugeY - scale.offsetY - distanceY / 5 * j;
            wiagram.line(svg, dam.gaugeX, y, dam.gaugeX + 1.5, y, { fill: 'blue', stroke: 'blue', 'stroke-width': 0.4 });
        }
    }
    var el = scales[0].el;
    var j = 0;
    // 最下面的刻度到坝底
    while (el > cbel) {
        y = dam.gaugeY - scales[0].offsetY + distanceY / 5 * j;
        wiagram.line(svg, dam.gaugeX, y, dam.gaugeX + 1.5, y, { fill: 'blue', stroke: 'blue', 'stroke-width': 0.4 });
        el -= parseFloat(maxdmhgBy5 / 5);
        j++;
    }
    // 特征水位
    wiagram.text(svg, dam.ltX, dam.ltY - 2, '坝顶高程：' + crel + '米', { 'font-size': 2, 'font-weight': 'bold' });
    wiagram.text(svg, dam.ltX, 28, '最大坝高：' + maxdmhg + '米', { 'font-size': 2, 'font-weight': 'bold' });
    if (typeof ddwl !== 'undefined') {
        var ddwlY = dam.lbY - (ddwl - cbel) * scale1m;
        wiagram.text(svg, 12, ddwlY, '死水位：' + ddwl + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }
    if (typeof flsscnwl !== 'undefined') {
        var flsscnwlY = dam.lbY - (flsscnwl - cbel) * scale1m;
        if (nrstlv !== flsscnwl)
            wiagram.text(svg, 12, flsscnwlY, '汛限水位：' + flsscnwl + '米', { 'font-size': 2, 'font-weight': 'bold' });
        else
            wiagram.text(svg, 12, flsscnwlY, '汛限水位、正常蓄水位：' + flsscnwl + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }
    if (typeof nrstlv !== 'undefined' && typeof flsscnwl === 'undefined') {
        var nrstlvY = dam.lbY - (flsscnwl - cbel) * scale1m;
        svg.text(svg, 12, nrstlvY, '正常水位：' + nrstlv + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }
    var top = 2;
    if (typeof chfllv !== 'undefined') {
        wiagram.text(svg, 12, 2, '校核洪水位：' + chfllv + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }
    if (typeof dsfllv !== 'undefined') {
        wiagram.text(svg, 12, 4, '设计洪水位：' + dsfllv + '米', { 'font-size': 2, 'font-weight': 'bold' });
    }

    // 显示SVG DOM
    var container = document.getElementById(this.containerId);
    container.innerHTML = '';
    container.appendChild(svg);
};

function isInt(n) {
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}