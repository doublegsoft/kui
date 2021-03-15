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

chart.pie = function (selector, opt) {
  function paint(selector, opt) {
    let container = null;
    if (typeof selector === 'string')
      container = document.querySelector(selector);
    else
      container = selector;

    if (container.getAttribute('_echarts_instance_') && opt.echartOption) {
      opt.echartOption.series.data = opt.data;
      return;
    }

    container.setAttribute('_echarts_instance_', '');

    let echartOption = chart.convert(opt);
    echartOption.tooltip = echartOption.tooltip || {};
    let seriesData = [];
    for (let category in echartOption.categories) {
      seriesData.push({
        name: echartOption.categories[category].name,
        value: echartOption.categories[category].values[0][opt.values[0].operator]
      });
    }
    // set colors
    for (let i = 0; i < seriesData.length; i++) {
      for (let key in opt.category.values) {
        if (seriesData[i].name == opt.category.values[key].text) {
          seriesData[i].color = opt.category.values[key].color;
          break;
        }
      }
    }
    echartOption.series = [{
      type: 'pie',
      data: seriesData
    }];

    if (opt.textColor) {
      echartOption.textStyle = {
        color: opt.textColor
      };
      echartOption.legend.textStyle = {
        color: opt.textColor
      };
    }
    if (opt.title) {
      echartOption.title = {
        text: opt.title,
        left: 'center',
        textStyle: {
          color: opt.textColor
        }
      };
    }
    echartOption.legend.show = false;
    let echart = echarts.init(container);
    echart.setOption(echartOption);

    opt.echartOption = echartOption;
  }

  chart.paint(selector, opt, paint);
};

chart.bar = function (selector, opt) {
  function paint(selector, opt) {
    let container = null;
    if (typeof selector === 'string')
      container = document.querySelector(selector);
    else
      container = selector;

    if (container.getAttribute('_echarts_instance_') && opt.echartOption) {
      opt.echartOption.series.data = opt.data;
      return;
    }

    container.setAttribute('_echarts_instance_', '');
    let echartOption = chart.convert(opt);

    let series = [];
    let xAxis = {type: 'category', data: []};
    for (let i = 0; i < opt.values.length; i++) {
      let seriesItem = {
        name: opt.values[i].text,
        type: 'bar',
        data: []
      };
      if (opt.values[i].color) {
        seriesItem.itemStyle = {color: opt.values[i].color};
      }
      // 填充数值
      for (let textCategory in echartOption.categories) {
        if (i == 0) xAxis.data.push(textCategory);
        let values = echartOption.categories[textCategory].values;
        seriesItem.data.push(values[i][opt.values[i].operator]);
      }
      series.push(seriesItem);
    }

    echartOption.tooltip = echartOption.tooltip || {};
    echartOption.xAxis = xAxis;
    echartOption.series = series;
    echartOption.yAxis = {

    };
    if (opt.textColor) {
      echartOption.textStyle = {
        color: opt.textColor
      };
      echartOption.legend.textStyle = {
        color: opt.textColor
      };
    }

    let echart = echarts.init(container);
    echart.setOption(echartOption);

    opt.echartOption = echartOption;
  }

  chart.paint(selector, opt, paint);
};

chart.line = function (selector, opt) {
  function paint(selector, opt) {
    let container = null;
    if (typeof selector === 'string')
      container = document.querySelector(selector);
    else
      container = selector;

    if (container.getAttribute('_echarts_instance_') && opt.echartOption) {
      opt.echartOption.series.data = opt.data;
      return;
    }

    container.setAttribute('_echarts_instance_', '');
    let echartOption = chart.convert(opt);
    let series = [];
    let xAxis = {type: 'category', data: []};
    for (let i = 0; i < opt.values.length; i++) {
      let seriesItem = {
        name: opt.values[i].text,
        type: 'line',
        data: [],
      };
      if (opt.values[i].color) {
        seriesItem.itemStyle = {color: opt.values[i].color};
      }
      for (let textCategory in echartOption.categories) {
        if (i == 0) xAxis.data.push(textCategory);
        let values = echartOption.categories[textCategory].values;
        seriesItem.data.push(values[i][opt.values[i].operator]);
      }
      series.push(seriesItem);
    }
    echartOption.tooltip = {};
    echartOption.xAxis = xAxis;
    echartOption.series = series;
    echartOption.yAxis = {
      splitLine: {
        show: false
      }
    };
    if (opt.textColor) {
      echartOption.textStyle = {
        color: opt.textColor
      };
      echartOption.legend.textStyle = {
        color: opt.textColor
      };
    }
    let echart = echarts.init(container);
    echart.setOption(echartOption);

    return {
      chart: echart,
      options: echartOption
    };
  }

  return chart.paint(selector, opt, paint);
};

chart.scatter = function (selector, opt) {
  function paint(selector, opt) {
    let container = null;
    if (typeof selector === 'string')
      container = document.querySelector(selector);
    else
      container = selector;

    if (container.getAttribute('_echarts_instance_') && opt.echartOption) {
      opt.echartOption.series.data = opt.data;
      return;
    }

    container.setAttribute('_echarts_instance_', '');
    let echartOption = chart.convert(opt);
    let series = [];
    let xAxis = {type: 'category', data: []};
    for (let i = 0; i < opt.values.length; i++) {
      let seriesItem = {
        name: opt.values[i].text,
        type: 'scatter',
        data: [],
      };
      if (opt.values[i].color) {
        seriesItem.itemStyle = {color: opt.values[i].color};
      }
      for (let textCategory in echartOption.categories) {
        if (i == 0) xAxis.data.push(textCategory);
        let values = echartOption.categories[textCategory].values;
        seriesItem.data.push(values[i][opt.values[i].operator]);
      }
      series.push(seriesItem);
    }
    echartOption.tooltip = echartOption.tooltip || {};
    echartOption.xAxis = xAxis;
    echartOption.series = series;
    echartOption.yAxis = {
      splitLine: {
        show: false
      }
    };
    if (opt.textColor) {
      echartOption.textStyle = {
        color: opt.textColor
      };
      echartOption.legend.textStyle = {
        color: opt.textColor
      };
    }
    let echart = echarts.init(container);
    echart.setOption(echartOption);

    if (opt.click) {
      echart.on("click", "series.scatter", function (event) {
        event.event.stop();
        opt.click(event.dataIndex, event.data);
      });
    }
    return {
      chart: echart,
      options: echartOption
    };
  }

  return chart.paint(selector, opt, paint);
};

chart.stack = function (selector, opt) {
  function paint(selector, opt) {
    let container = null;
    if (typeof selector === 'string')
      container = document.querySelector(selector);
    else
      container = selector;

    if (container.getAttribute('_echarts_instance_')) {
      opt.echartOption.series.data = opt.data;
      return;
    }

    let echartOption = chart.convert(opt);

    let series = [];
    let legendData = echartOption.legend.data;

    let xAxis = {data: []};
    for (let i = 0; i < opt.values.length; i++) {
      for (let j = 0; j < legendData.length; j++) {
        let seriesItem = {
          name: legendData[j],
          type: 'bar',
          stack: i + '',
          data: []
        };
        for (let textCategory in echartOption.categories) {
          if (i == 0 && j == 0) xAxis.data.push(textCategory);
          let values = echartOption.categories[textCategory].values;
          seriesItem.data.push(values[i][legendData[j]]);
        }
        if (opt.values[i].values) {
          let valuesInValues = opt.values[i].values;
          for (let code in valuesInValues) {
            if (legendData[j] == code || valuesInValues[code].text == legendData[j]) {
              seriesItem.color = valuesInValues[code].color;
            }
          }
        }
        series.push(seriesItem);
      }
    }

    echartOption.tooltip = echartOption.tooltip || {};
    echartOption.xAxis = xAxis;
    echartOption.series = series;
    echartOption.yAxis = {};

    let echart = echarts.init(container);
    echart.setOption(echartOption);
  }

  chart.paint(selector, opt, paint);
};

chart.spark = function(selector, options) {

};

chart.thermometer = function(selector, options) {

};

chart.ratio = function(selector, options) {
  let title = options.title;
  let value = options.value || 0;
  let container = null;
  if (typeof selector === 'string')
    container = document.querySelector(selector);
  else
    container = selector;

  let echartOption = {
    grid: {
      bottom: 0,
      top: 0
    },
    textStyle: {
      color: 'white'
    },
    legend: {
      textStyle: 'white'
    },
    xAxis: {
      type: 'category',
      data: [''],
      show: false
    },
    yAxis: [{
      type: 'value',
      min: 0,
      max: 100,
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },{
      type: 'value',
      min: 0,
      max: 100,
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    }],
    series: [{
      data: [{
        value: value
      }],
      barWidth: '100%',
      type: 'bar',
      label: {
        show: true,
        position: 'inside',
        formatter: function (series) {
          return title + '\n' + series.data.value + '%';
        }
      },
    }]
  };

  let echart = echarts.init(container);
  echart.setOption(echartOption);

  return {
    chart: echart,
    options: echartOption
  }
};

chart.realtime = function(options, values, max, getColor) {
  let echart = options.chart;
  let echartOption = options.options;
  let seriesData = echartOption.series[0].data;
  for (let i = 0; i < values.length; i++) {
    if (seriesData.length >= max) seriesData.shift();
    let value = {
      value: values[i]
    };
    if (getColor) {
      value.itemStyle = {
        color: getColor(values[i])
      }
    }
    seriesData.push(value);
    echart.setOption(echartOption);
  }
};

/**
 * Converts custom options to echarts options.
 *
 * @param {object} opts
 *        custom options
 */
chart.convert = function (opts) {
  // echarts option compatible data structure
  let ret = {};
  let color = [];
  let data = opts.data;
  let category = opts.category;
  let values = opts.values;

  // group field means chart legend
  let dataLegend = [];
  let hashLegend = {};

  let hashCategory = {};

  // 填充category数据
  for (let i = 0; i < data.length; i++) {
    let row = data[i];

    // 这一行所属的类别
    let valueCategory = row[category.name];
    let textCategory = valueCategory;

    // 如果是图例，则要收集图例的数据
    if (category.values && category.values[valueCategory]) {
      textCategory = category.values[valueCategory].text;
      textCategory = (typeof textCategory === 'undefined') ? valueCategory : textCategory;
    }
    if (typeof hashCategory[textCategory] === 'undefined') {
      // 注意此处的数据结构
      hashCategory[textCategory] = {name: textCategory, values: []};
    }

    // 收集category的数据
    for (let j = 0; j < values.length; j++) {
      let valueValue = row[values[j].name];
      if (typeof hashCategory[textCategory].values[j] === 'undefined')
        hashCategory[textCategory].values[j] = {};
      if (values[j].operator === 'sum') {
        if (typeof hashCategory[textCategory].values[j]['sum'] === 'undefined')
          hashCategory[textCategory].values[j]['sum'] = [];
        hashCategory[textCategory].values[j]['sum'].push(valueValue);
      } else {
        // operator为某个字段名，意味着以operator字段作为legend分别计算
        let valueOperator = row[values[j].operator];
        // 编码转文本
        if (values[j].values && values[j].values[valueOperator]) {
          valueOperator = values[j].values[valueOperator].text;
        }
        if (typeof hashCategory[textCategory].values[j][valueOperator] === 'undefined')
          hashCategory[textCategory].values[j][valueOperator] = [];
        hashCategory[textCategory].values[j][valueOperator].push(valueValue);
        // 注意此处，从value的operator指定的字段中获取subcategory的值
        hashLegend[valueOperator] = valueOperator;
      }
    }
  }

  if (category.legend) {
    // 图例的数据来源来自于分类的数据
    for (let textCategory in hashCategory) {
      dataLegend.push(textCategory);
      for (let i = 0; i < values.length; i++) {
        if (values[i].operator === 'sum') {
          let sum = hashCategory[textCategory].values[i]['sum'].reduce(function (a, b) {
            return a + b;
          }, 0);
          hashCategory[textCategory].values[i]['sum'] = sum;
        }
      }
    }
  } else {
    // 图例的数据来源于值的定义
    for (let i = 0; i < values.length; i++) {
      if (values[i].operator === 'sum') {
        dataLegend.push(values[i].text);
      } else {
        if (i == 0) {
          // 动态的图例数据，来源于值域中的operator值，相当于把subcategory作为图例
          for (let key in hashLegend)
            dataLegend.push(key);
        }
      }
      for (let textCategory in hashCategory) {
        if (values[i].operator === 'sum') {
          // 需要求和
          let sum = hashCategory[textCategory].values[i]['sum'].reduce(function (a, b) {
            return a + b;
          }, 0);
          // 把数组转换为数字
          hashCategory[textCategory].values[i]['sum'] = sum;
        } else {
          for (let key in hashCategory[textCategory].values[i]) {
            // 把数组转换为数字
            hashCategory[textCategory].values[i][key] = hashCategory[textCategory].values[i][key][0];
          }
        }
      }
    }
  } // if (category.legend)

  // compatible echarts option
  ret = {
    legend: {
      data: dataLegend
    },
    categories: hashCategory,
    // grid: {
    //   top: 30,
    //   left: "10%",
    //   right: 20,
    //   bottom: 30
    // }
  };
  if (opts.tooltip) {
    ret.tooltip = {
      formatter: opts.tooltip
    }
  }
  if (color.length > 0) ret.color = color;
  return ret;
};

/**
 * Preprocess data to make datetime or number values to right format.
 *
 * @param data
 *        the data from server
 *
 * @param opts
 *        the conversion options
 *
 * @returns {Array}
 *        the converted data
 */
chart.process = function(data, opts) {
  function cacheKey(row, groups) {
    let ret = '';
    for (let i = 0; i < groups.length; i++) {
      if (ret != '') {
        ret += '-';
      }
      ret += row[groups[i]];
    }
    return ret;
  }

  if (opts.convert) {
    for (let i = 0; i < data.length; i++) {
      data[i] = opts.convert(data[i]);
    }
  }

  let cache = {};
  let ret = [];
  let groups = opts.fields.groups;
  let values = opts.fields.values;
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    let key = cacheKey(row, groups);
    if (!cache[key]) {
      cache[key] = {};
      for (let j = 0; j < values.length; j++) {
        cache[key][values[j]] = 0;
      }
      ret.push(row);
    }
    for (let j = 0; j < values.length; j++) {
      cache[key][values[j]] += row[values[j]];
    }
  }
  for (let i = 0; i < ret.length; i++) {
    let row = ret[i];
    for (let j = 0; j < values.length; j++) {
      data[i][values[j]] = cache[cacheKey(row, groups)][values[j]];
    }
  }
  return ret;
};

/**
 * Fetches data from server side and applies them to paint function.
 *
 * @param {string} selector
 *        the css selector
 *
 * @param {object} opt
 *        the xhr options
 *
 * @param {function} paint
 *        the paint function
 *
 * @private
 */
chart.paint = function(selector, opt, paint) {
  function fetch() {
    new Promise(function(resolve) {
      xhr.post({
        url: opt.url,
        usecase: opt.usecase,
        data: opt.params,
        success: function(resp) {
          if (resp.error) {
            dialog.error('获取图表数据失败：' + resp.error.message);
            return;
          }
          if (opt.convert) {
            for (let i = 0; i < resp.data.length; i++)
              resp.data[i] = opt.convert(resp.data[i]);
          }
          resolve(resp.data);
        }
      })
    }).then(function(data) {
      opt.data = data;
      paint(selector, opt);
    });
  }
  if (opt.url) {
    // 变成周期任务
    if (opt.interval) {
      schedule.stop(opt.name);
      schedule.start(opt.name, function() {
        fetch(selector, opt, paint);
      }, opt.interval);
    }
    fetch(selector, opt, paint);
  } else {
    return paint(selector, opt);
  }
};