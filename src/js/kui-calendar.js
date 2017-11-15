

function Calendar(option) {
    this.year = option.year;
    this.month = option.month;
    this.tooltip = option.tooltip || function (params) { };
    this.series = option.series || [];
}

/**
 * Renders the calendar to the given container.
 *
 * @param {int} year - the year
 *
 * @param {int} month - the month
 */
Calendar.prototype.render = function (containerId) {
    this.containerId = containerId;

    var lunarData = [];
    var date = moment().set({ 'year': this.year, 'month': this.month - 1, 'date': 1 });

    var datesOfMonth = date.daysInMonth();

    for (var i = 1; i <= datesOfMonth; i++) {
        lunarData.push([this.year + '-' + this.month + '-' + i, 1]);
    }

    this.chartOption = {
        tooltip: {
            formatter: this.tooltip
        },
        visualMap: {
            type: 'piecewise',
            show: false,
            calculable: true,
            seriesIndex: [1],
            orient: 'horizontal',
            left: 'center',
            bottom: 20,
            pieces: [
                {gt: 10, color: '#21ba45'},       
                {lte: 10, color: '#FF695E'}
            ]
        },
        calendar: [{
            left: 'center',
            top: 'middle',
            cellSize: [70, 70],
            yearLabel: { show: false },
            orient: 'vertical',
            dayLabel: {
                firstDay: 1,
                nameMap: 'cn'
            },
            monthLabel: {
                show: false
            },
            range: this.year + '-' + this.month
        }],
        series: [{
            type: 'scatter',
            coordinateSystem: 'calendar',
            symbolSize: 1,
            label: {
                normal: {
                    show: true,
                    formatter: function (params) {
                        var d = echarts.number.parseDate(params.value[0]);
                        return d.getDate() + '\n\n';
                    },
                    textStyle: {
                        color: '#000'
                    }
                }
            },
            data: lunarData
        }]
    };

    // 添加自定义的Series
    for (var i = 0; i < this.series.length; i++) {
        this.chartOption.series.push(this.series[i]);
    }
    
    // 渲染日期栏和日历栏
    var root = document.getElementById(this.containerId);
    root.innerHTML = this.datebar();
    root.appendChild(this.chart());

    var self = this;
    var buttons = root.getElementsByTagName('button');
    buttons[0].addEventListener('click', function () {
        self.prev();
    });
    buttons[1].addEventListener('click', function () {
        self.next();
    });
};

Calendar.prototype.setValues = function (values) {
    this.year = values.year;
    this.month = values.month;
    this.render(this.containerId);
};

Calendar.prototype.next = function () {
    var date = moment().set({ 'year': this.year, 'month': this.month - 1, 'date': 1 });
    date = date.add(1, 'months');
    this.setValues({year: date.year(), month: date.month() + 1});
};

Calendar.prototype.prev = function () {
    var date = moment().set({ 'year': this.year, 'month': this.month - 1, 'date': 1 });
    date = date.subtract(1, 'months');
    this.setValues({year: date.year(), month: date.month() + 1});
};

/**
 * 日期和上一月、下一月的显示栏。
 */
Calendar.prototype.datebar = function () {
    var ret = '' +
    '<div class="col-md-12" style="width: 500px; height: 24px; text-align: center;">' +
    '    <button class="btn btn-link icon-action float-left">' +
    '        <i class="icon-arrow-left-circle" style="font-size: 23px;"></i>' +
    '    </button>' +
    '    <span style="font-size: 16px; font-weight: bold">' + this.year + '年' + this.month + '月</span>' +
    '    <button class="btn btn-link icon-action float-right">' +
    '        <i class="icon-arrow-right-circle" style="font-size: 23px;"></i>' +
    '    </button>' +
    '</div>';
    return ret;
};

Calendar.prototype.chart = function () {
    var chartContainer = document.createElement('div');
    chartContainer.style.width = '500px';
    chartContainer.style.height = '520px';

    var chart = echarts.init(chartContainer);
    chart.setOption(this.chartOption);
    chart.on('click', function (params) {
        console.log(params);
    });
    return chartContainer;
};