
function SimpleChart(opts) {
  this.url = opts.url;
  this.data = opts.data || [];
  this.title = opts.title || '';
  this.numberField = opts.numberField;
  this.dateField = opts.dateField;
  this.valueField = opts.valueField;
  
  this.statIndex = opts.statIndex || 'sum';

  this.chartType = opts.chartType;
  this.containerId = opts.containerId;
  this.container = document.getElementById(this.containerId);
}

SimpleChart.prototype.render = function() {
  this.container.innerHTML = '';
  this.chart = echarts.init(this.container);
  this.container.removeAttribute("_echarts_instance_");
  this.request({});
};

SimpleChart.prototype.request = function(params) {
  var self = this;
  if (this.url) {
    xhr.post({
      url: this.url,
      data: params,
      success: function(resp) {
        if (self.chartType == 'pie') {
          self.chart.setOption(self.pie(resp));
        } else if (self.chartType == 'line') {
          self.chart.setOption(self.line(resp));
        } else if (self.chartType == 'bar') {
          self.chart.setOption(self.bar(resp));
        }
      }
    });
  } else {
    if (this.chartType == 'pie') {
      this.chart.setOption(this.pie(this.data));
    } else if (this.chartType == 'line') {
      this.chart.setOption(this.line(this.data));
    } else if (this.chartType == 'bar') {
      this.chart.setOption(this.bar(this.data));
    }
  }
}

SimpleChart.prototype.pie = function(resp) {
  var option = {
    title : {
      text: this.title,
      subtext: '',
      x:'center'
    },
    tooltip : {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: 10,
      top: 20,
      bottom: 20,
      data: []
    },
    series : [{
      type: 'pie',
      radius : '55%',
      center: ['40%', '50%'],
      data: [],
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  var totalByValue = {};
  var countByValue = {};
  for (var i = 0; i < resp.data.length; i++) {
    var item = resp.data[i];
    var number = item[this.numberField] || 0;
    var value = item[this.valueField];

    totalByValue[value] = totalByValue[value] || 0;
    countByValue[value] = countByValue[value] || 0;

    totalByValue[value] += number;
    countByValue[value] += 1;
  }
  for (var key in totalByValue) {
    option.legend.data.push(key);
    if (this.statIndex == 'sum') {
      option.series[0].data.push({
        name: key,
        value: totalByValue[key]
      });
    } else if (this.statIndex == 'count') {
      option.series[0].data.push({
        name: key,
        value: countByValue[key]
      });
    }
  }
  return option;
};

SimpleChart.prototype.line = function(resp) {
  var option = {
    title : {
      text: this.title,
      subtext: '',
      x:'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      y: 'bottom',
      data:[]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: []
  };
  // 收集时间轴日期
  var dateIndexes = {};
  for (var i = 0; i < resp.data.length; i++) {
    var item = resp.data[i];
    var date = item[this.dateField];
    dateIndexes[date] = 0;
  }

  // 排序并且赋值
  var dateSort = [];
  for (var date in dateIndexes) {
    dateSort.push(date);
  }
  dateSort.sort();

  for (var i = 0; i < dateSort.length; i++) {
    dateIndexes[dateSort[i]] = i;
  }

  var totalByValue = {};

  // 初始化数据收集变量
  for (var i = 0; i < resp.data.length; i++) {
    var item = resp.data[i];
    var value = item[this.valueField];
    var date = item[this.dateField];

    totalByValue[value] = totalByValue[value] || {data: []};
    totalByValue[value].data.push(0);
  }
  
  // 赋值
  for (var i = 0; i < resp.data.length; i++) {
    var item = resp.data[i];
    var number = item[this.numberField] || 0;
    var value = item[this.valueField];
    var date = item[this.dateField];

    totalByValue[value].data[dateIndexes[date]] = number;
  }

  for (var key in totalByValue) {
    var seriesItem = {
      name: key,
      type: 'line',
      data: totalByValue[key].data
    };
    option.legend.data.push(key);
    option.series.push(seriesItem);
  }
  option.xAxis.data = dateSort;
  return option;
};

SimpleChart.prototype.bar = function(resp) {
  var option = {
    title : {
      text: this.title,
      subtext: '',
      x:'center'
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [],
      type: 'bar'
    }]
  };
  var totalByValue = {};
  var countByValue = {};
  for (var i = 0; i < resp.data.length; i++) {
    var item = resp.data[i];
    var number = item[this.numberField] || 0;
    var value = item[this.valueField];

    totalByValue[value] = totalByValue[value] || 0;
    countByValue[value] = countByValue[value] || 0;

    totalByValue[value] += number;
    countByValue[value] += 1;
  }
  for (var key in totalByValue) {
    option.xAxis.data.push(key);
    if (this.statIndex == 'sum') {
      option.series[0].data.push(totalByValue[key]);
    } else if (this.statIndex == 'count') {
      option.series[0].data.push(countByValue[key]);
    }
    
  }
  return option;
};