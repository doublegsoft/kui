function ChartWrapper(opts) {
  let self = this;
  this.url = opts.url;
  this.params = opts.params || {};
  this.options = opts;
  this.chartType = opts.chartType;
  this.interval = opts.interval || 0;
  this.scheduleName = opts.scheduleName;
  this.refresh = opts.refresh || function(data) {

  };
}

/**
 * Converts customized options to echarts options.
 *
 * @returns echarts options
 */
ChartWrapper.prototype.convert = function() {
  let color = [];
  let data = this.options.data;
  let category = this.options.category;
  let values = this.options.values;

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
  let ret = {
    legend: {
      data: dataLegend
    },
    categories: hashCategory
  };
  if (this.options.tooltip) {
    ret.tooltip = {
      formatter: this.options.tooltip
    }
  }
  if (color.length > 0) ret.color = color;
  return ret;
};

/**
 * Converts the data to echarts series data.
 *
 * @param data
 *        the raw data
 */
ChartWrapper.prototype.process = function(data) {

};

ChartWrapper.prototype.paint = function() {
  if (this.chartType == 'pie') {
    this.pie();
  } else if (this.chartType == 'bar') {
    this.bar();
  } else if (this.chartType == 'line') {
    this.line();
  } else if (this.chartType == 'stack') {
    this.stack();
  } else if (this.chartType == 'scatter') {
    this.scatter();
  }

  // text color
  if (this.options.textColor) {
    this.echartOptions.textStyle = {
      color: this.options.textColor
    };
    this.echartOptions.legend.textStyle = {
      color: this.options.textColor
    };
  }

  // title
  if (this.options.title) {
    this.echartOptions.title = {
      text: this.options.title,
      left: 'center',
      textStyle: {
        color: this.options.textColor
      }
    };
  }

  this.echart = echarts.init(this.container);
  this.echart.setOption(this.echartOptions);
};

/**
 * Gets echarts options for PIE.
 */
ChartWrapper.prototype.pie = function() {
  this.container.setAttribute('_echarts_instance_', '');

  this.echartOptions = this.convert();
  this.echartOptions.tooltip = this.echartOptions.tooltip || {};

  // series
  let seriesData = [];
  for (let category in this.echartOptions.categories) {
    seriesData.push({
      name: this.echartOptions.categories[category].name,
      value: this.echartOptions.categories[category].values[0][this.options.values[0].operator]
    });
  }

  // series color
  for (let i = 0; i < seriesData.length; i++) {
    for (let key in this.options.category.values) {
      if (seriesData[i].name == this.options.category.values[key].text) {
        seriesData[i].color = this.options.category.values[key].color;
        break;
      }
    }
  }
  this.echartOptions.series = [{
    type: 'pie',
    data: seriesData
  }];
  this.echartOptions.legend.show = false;
};

/**
 * Gets echarts options for BAR.
 */
ChartWrapper.prototype.bar = function() {
  this.container.setAttribute('_echarts_instance_', '');
  this.echartOptions = this.convert();

  let series = [];
  let xAxis = {type: 'category', data: []};
  for (let i = 0; i < this.options.values.length; i++) {
    let seriesItem = {
      name: this.options.values[i].text,
      type: 'bar',
      data: []
    };
    if (this.options.values[i].color) {
      seriesItem.itemStyle = {color: this.options.values[i].color};
    }
    // 填充数值
    for (let textCategory in this.echartOptions.categories) {
      if (i == 0) xAxis.data.push(textCategory);
      let values = this.echartOptions.categories[textCategory].values;
      seriesItem.data.push(values[i][this.options.values[i].operator]);
    }
    series.push(seriesItem);
  }

  this.echartOptions.tooltip = this.echartOptions.tooltip || {};
  this.echartOptions.xAxis = xAxis;
  this.echartOptions.series = series;
  this.echartOptions.yAxis = {};
};

/**
 * Gets echarts options for LINE.
 */
ChartWrapper.prototype.line = function() {
  this.container.setAttribute('_echarts_instance_', '');
  this.echartOptions = this.convert();
  let series = [];
  let xAxis = {type: 'category', data: []};
  for (let i = 0; i < this.options.values.length; i++) {
    let seriesItem = {
      name: this.options.values[i].text,
      type: 'line',
      data: [],
    };
    if (this.options.values[i].color) {
      seriesItem.itemStyle = {color: this.options.values[i].color};
    }
    for (let textCategory in this.echartOptions.categories) {
      if (i == 0) xAxis.data.push(textCategory);
      let values = this.echartOptions.categories[textCategory].values;
      seriesItem.data.push(values[i][this.options.values[i].operator]);
    }
    series.push(seriesItem);
  }
  this.echartOptions.tooltip = {};
  this.echartOptions.xAxis = xAxis;
  this.echartOptions.series = series;
  this.echartOptions.yAxis = {
    splitLine: {
      show: false
    }
  };
};

/**
 * Gets echarts options for STACK.
 */
ChartWrapper.prototype.stack = function() {
  this.echartOptions = this.convert();

  let series = [];
  let legendData = this.echartOptions.legend.data;

  let xAxis = {data: []};
  for (let i = 0; i < this.options.values.length; i++) {
    for (let j = 0; j < legendData.length; j++) {
      let seriesItem = {
        name: legendData[j],
        type: 'bar',
        stack: i + '',
        data: []
      };
      for (let textCategory in this.echartOptions.categories) {
        if (i == 0 && j == 0) xAxis.data.push(textCategory);
        let values = this.echartOptions.categories[textCategory].values;
        seriesItem.data.push(values[i][legendData[j]]);
      }
      if (this.options.values[i].values) {
        let valuesInValues = this.options.values[i].values;
        for (let code in valuesInValues) {
          if (legendData[j] == code || valuesInValues[code].text == legendData[j]) {
            seriesItem.color = valuesInValues[code].color;
          }
        }
      }
      series.push(seriesItem);
    }
  }

  this.echartOptions.tooltip = this.echartOptions.tooltip || {};
  this.echartOptions.xAxis = xAxis;
  this.echartOptions.series = series;
  this.echartOptions.yAxis = {};
};

/**
 * Gets echarts options for SCATTER.
 */
ChartWrapper.prototype.scatter = function() {
  this.echartOptions = this.convert();
  let series = [];
  let xAxis = {type: 'category', data: []};
  for (let i = 0; i < this.options.values.length; i++) {
    let seriesItem = {
      name: this.options.values[i].text,
      type: 'scatter',
      data: [],
    };
    if (this.options.values[i].color) {
      seriesItem.itemStyle = {color: this.options.values[i].color};
    }
    for (let textCategory in this.echartOptions.categories) {
      if (i == 0) xAxis.data.push(textCategory);
      let values = this.echartOptions.categories[textCategory].values;
      seriesItem.data.push(values[i][this.options.values[i].operator]);
    }
    series.push(seriesItem);
  }
  this.echartOptions.tooltip = this.echartOptions.tooltip || {};
  this.echartOptions.xAxis = xAxis;
  this.echartOptions.series = series;
  this.echartOptions.yAxis = {
    splitLine: {
      show: false
    }
  };
};

/**
 * Gets echarts options for RATIO.
 */
ChartWrapper.prototype.ratio = function() {
  let title = this.options.title;
  let value = this.options.value || 0;

  this.echartOptions = {
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
};

ChartWrapper.prototype.fetch = function(resolve) {
  let self = this;
  new Promise(function(resolve) {
    xhr.post({
      url: self.url,
      data: self.params,
      success: function(resp) {
        if (resp.error) {
          dialog.error('获取图表数据失败：' + resp.error.message);
          return;
        }
        resolve(resp.data);
      }
    });
  }).then(function(data) {
    if (resolve) {
      // custom
      resolve(self, data);
    } else {
      // default
      self.options.data = data;
      self.paint();
    }
  });
};

/**
 * Renders the chart under the containerId.
 *
 * @param containerId
 *        the container or the container selector
 */
ChartWrapper.prototype.render = function(containerId) {
  let self = this;
  this.container = dom.find(containerId);
  if (self.url) {
    this.fetch();
  } else {
    this.paint();
  }
  if (this.interval > 0) {
    schedule.start(this.scheduleName, function() {
      self.fetch(self.refresh);
    }, this.interval);
  }
};