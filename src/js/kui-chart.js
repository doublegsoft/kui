/*
 * Copyright 2020 doublegsoft.net
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
if (typeof chart === 'undefined') chart = {};

chart.pie = function (opts) {
  let containerId = opts.containerId;
  let title = opts.title;
  let chartOpt = chart.convert(opts);
  let option = {
    title : {
      text: title,
      x:'center'
    },
    tooltip : {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    label: {
      color: 'white'
    },
    series : [{
      name: opts.value.label,
      type: 'pie',
      radius : '55%',
      center: ['50%', '60%'],
      data:[],
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  for (let i = 0; i < chartOpt.legend.length; i++) {
    option.series[0].data.push({
      name: chartOpt.legend[i],
      value: chartOpt.series[0].data[i]
    });
  }
  if (opts.color) {
    for (let i = 0; i < opts.color.length && i < option.series[0].data.length; i++) {
      option.series[0].data[i].itemStyle = {
        color: opts.color[i]
      }
    }
  }

  let echart = echarts.init(document.getElementById(containerId));
  echart.setOption(option);
};

/**
 * 绘制柱状图。
 *
 * @param opts
 */
chart.bar = function (opts) {
  let containerId = opts.containerId;
  let tableContainerId = opts.tableContainerId;
  let title = opts.title || '';

  let chartOpt = chart.convert(opts);

  let option = {
    title: {
      text: title,
    },
    tooltip : {
      trigger: 'axis',
      axisPointer : {
        type : 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    color: opts.color,
    textStyle: {
      color: '#fff'
    },
    legend: {
      data: chartOpt.legend,
      textStyle: {
        color: '#fff'
      }
    },
    xAxis: chartOpt.xAxis,
    yAxis: chartOpt.yAxis,
    series: chartOpt.series
  };

  if (chartOpt.legend.length == 1)
    option.legend = null;

  // 如果颜色设置和图例数量不匹配，则
  if (opts.color.length != chartOpt.legend.length && chartOpt.legend.length == 1) {
    for (let i = 0; i < opts.color.length; i++) {
      option.series[0].data[i] = {
        name: option.series[0].name,
        value: option.series[0].data[i],
        itemStyle: {
          color: opts.color[i]
        }
      };
    }
  }
  let echart = echarts.init(document.getElementById(containerId));
  echart.setOption(option);

  if (tableContainerId) {
    chart.table(tableContainerId, chartOpt);
  }
};

/**
 * 绘制中国地图。
 *
 * @param opts
 */
chart.china = function (opts) {
  let containerId = opts.containerId;
  let data = opts.data;

  let fields = opts.fields || {};

  let name = fields.name;
  let value = fields.value;

  let districts = [
    { name: '北京', value: 0 },
    { name: '天津', value: 0 },
    { name: '上海', value: 0 },
    { name: '重庆', value: 0 },
    { name: '河北', value: 0 },
    { name: '河南', value: 0 },
    { name: '云南', value: 0 },
    { name: '辽宁', value: 0 },
    { name: '黑龙江', value: 0 },
    { name: '湖南', value: 0 },
    { name: '安徽', value: 0 },
    { name: '山东', value: 0 },
    { name: '新疆', value: 0 },
    { name: '江苏', value: 0 },
    { name: '浙江', value: 0 },
    { name: '江西', value: 0 },
    { name: '湖北', value: 0 },
    { name: '广西', value: 0 },
    { name: '甘肃', value: 0 },
    { name: '山西', value: 0 },
    { name: '内蒙古', value: 0 },
    { name: '陕西', value: 0 },
    { name: '吉林', value: 0 },
    { name: '福建', value: 0 },
    { name: '贵州', value: 0 },
    { name: '广东', value: 0 },
    { name: '青海', value: 0 },
    { name: '西藏', value: 0 },
    { name: '四川', value: 0 },
    { name: '宁夏', value: 0 },
    { name: '海南', value: 0 },
    { name: '台湾', value: 0 },
    { name: '香港', value: 0 },
    { name: '澳门', value: 0 },
    { name: '北京', value: 0 },
    { name: '天津', value: 0 },
  ];

  let max = 0;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < districts.length; j++) {
      if (data[i][name] == districts[j].name) {
        districts[j].value = data[i][value];
        max = Math.max(districts[j].value, max);
        break;
      }
    }
  }

  let option = {
    tooltip: {
      trigger: 'item',
      showDelay: 0,
      transitionDuration: 0.2
    },
    geo: {
      map: 'china',
      label: {
        normal: {
          show: true,
          textStyle: {
            color: '#feffff',
            fontSize: 10,
          },
        },
        emphasis: {
          show: true,
          textStyle: {
            color: '#feffff',
            fontSize: 10,
          },
        },
      },
      roam: false,
      zoom: 1.2,
      itemStyle: {
        normal: {
          areaColor: '#eee',
          borderColor: '#1a5cb5',
          borderWidth: 2,
        },
        emphasis: {
          areaColor: '#ed860d',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 20,
          borderWidth: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      zlevel: 1,
    },
    visualMap: {
      show: true,
      type: 'continuous',
      min: 0,
      max: max,
      right: 32,
      bottom: 20,
      seriesIndex: [0],
      color: ['#060e35', '#0d1648', '#101c65', '#083492', '#2560ff', '#4671ff'],
      textStyle: {
        color: '#feffff',
      },
      calculable: true,
      zlevel: 2,
    },
    series: [{
      name: '',
      type: 'map',
      geoIndex: 0,
      data: districts,
      zlevel: 3,
    }]
  };

  $.get('data/map/china.json', function (chinaJson) {
    echarts.registerMap('china', chinaJson);

    let echart = echarts.init(document.getElementById(containerId));
    echart.setOption(option);
  });
};

chart.table = function (tableContainerId, chartOpt) {
  let table = $('#' + tableContainerId);

  let legend = chartOpt.legend;
  let series = chartOpt.series;
  let xAxis = chartOpt.xAxis[0];

  let rowHead = $('<tr></tr>');

  rowHead.append('<td></td>');
  for (let i = 0; i < xAxis.data.length; i++) {
    rowHead.append('<td>' + xAxis.data[i] + '</td>');
  }
  table.append(rowHead);

  for (let i = 0; i < legend.length; i++) {
    let row = $('<tr></tr>');
    row.append('<td style="width: 120px;">' + legend[i] + '</td>');
    for (let j = 0; j < series[i].data.length; j++) {
      row.append('<td>' + (series[i].data[j] || 0) + '</td>');
    }
    table.append(row);
  }
};

/**
 *
 * @param opts
 * @returns {{yAxis: [], xAxis: [], legend: [], series: []}}
 */
chart.convert = function(opts) {
  let stack = opts.stack;
  let orientation = opts.orientation;

  let valueAxis = opts.value;
  let legendConstant = opts.legend;

  // 表示类别的字段
  let category = opts.fields.category;

  // 表示图例的字段
  let legend = opts.fields.legend;

  // 表示值的字段，可以为多个
  let value = opts.fields.value;

  let data = opts.data;

  let valueAxes = [];
  let values = [];
  let legendConstants = [];
  if (Array.isArray(value)) values = value;
  else values.push(value);
  if (Array.isArray(legendConstant)) legendConstants = legendConstant;
  else legendConstants.push(legendConstant);
  if (Array.isArray(valueAxis)) valueAxes = valueAxis;
  else valueAxes.push(valueAxis);

  let ret = {
    legend: [],
    series: [],
    xAxis: [],
    yAxis: []
  };

  let categories = [];
  let mapKey = {};
  let mapLegend = {};

  // 类别字段的排序依赖于数据库（服务器端）的排序
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    let existing = false;
    for (let j = 0; j < categories.length; j++) {
      if (row[category] == categories[j]) {
        existing = true;
        break;
      }
    }
    // 有可能category没有设置
    if (!existing && row[category]) {
      categories.push(row[category]);
    }
    mapLegend[row[legend]] = {};
    mapKey[row[legend] + '&' + row[category]] = {};
  }
  if (legend) {
    // 初始化图例数据
    for (let name in mapLegend) {
      ret.legend.push(name);
      ret.series.push({
        name: name,
        data: [],
        label: {
          normal: {
            show: orientation == 'vertical' ? true : false,
            position: 'top'
          }
        },
      });
    }
  }
  // 使用预定义的图例数据
  if (ret.legend.length == 0) {
    for (let i = 0; i < legendConstants.length; i++) {
      ret.legend.push(legendConstants[i]);
      ret.series.push({
        name: legendConstants[i],
        data: [],
        label: {
          normal: {
            show: orientation == 'vertical' ? true : false,
            position: 'top'
          }
        },
      });
    }
  }
  for (let i = 0; i < values.length; i++) {
    ret.series[i].type = 'bar';
    if (stack)
      ret.series[i].stack = stack;
  }

  // 开始准备系列数据
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < values.length; j++) {
      ret.series[j].data.push(data[i][values[j]]);
    }
  }
  if (valueAxes.length == 2) {
    ret.series[ret.series.length - 1].yAxisIndex = 1;
    ret.series[ret.series.length - 1].type = 'line';
  }
  if (orientation == 'vertical') {
    ret.xAxis.push({
      type: 'category',
      color: 'white',
      data: categories,
      axisLabel : {
        show:true,
        interval: 0,
        rotate: 45,
        margin: 20
      }
    });
    for (let i = 0; i < valueAxes.length; i++) {
      ret.yAxis.push({
        type: 'value',
        color: valueAxes[i].color,
        name: valueAxes[i].unit,
        axisLabel: {
          formatter: '{value}' + valueAxes[i].unit
        }
      });
    }
  } else if (orientation == 'horizontal') {
    ret.yAxis.push({
      type: 'category',
      color: 'white',
      data: categories
    });
    for (let i = 0; i < valueAxes.length; i++) {
      ret.xAxis.push({
        type: 'value',
        color: valueAxes[i].color,
        name: valueAxes[i].unit,
        axisLabel: {
          formatter: '{value}' + valueAxes[i].unit
        }
      });
    }
  }
  return ret;
};

