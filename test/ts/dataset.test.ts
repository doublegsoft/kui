// @ts-ignore
import { AggregateOperator, Dataset } from '../../src/ts/dataset';

import * as fs from 'fs';
import * as path from 'path';

const html = `
<html lang="en">
<head>
  <meta charset="utf-8">
</head>
<body>
<div id="chart" style="height:500px;border:1px solid #ccc;padding:10px;"></div>
</body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.0/echarts.min.js"></script>
<script src="https://unpkg.com/echarts-gl@2.0.8/dist/echarts-gl.js"></script>
</html>
<script>
var chart = echarts.init(document.getElementById('chart'));
chart.setOption({{option}});
</script>
`;

function randomIndex(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const CATEGORIES = ['保健品', '食品', '药品', '工业用品', '军品'];
const SUBCATEGORIES = ['维生素', '面食', '米饭', '速冻食品', '快餐', '冲剂', '水果', '干果', '酒', '茶'];
const COUNT = 20; // 5000000;
const data = [];
for (let i = 0; i < COUNT; i++) {
  data.push({
    productId: i,
    productName: '产品' + i,
    category: CATEGORIES[randomIndex(0, CATEGORIES.length - 1)],
    subcategory: SUBCATEGORIES[randomIndex(0, SUBCATEGORIES.length - 1)],
    price: randomIndex(100, 1000),
    saleAmount: randomIndex(500, 1000),
  })
}

describe('Dataset测试', () => {
  test('柱状图', () => {
    let dataset = new Dataset(data)
      .groupBy(['category'])
      .aggregateBy('saleAmount', AggregateOperator.SUM)
      .aggregateBy('count', AggregateOperator.COUNT)
      .transform();
    let d = dataset.series([], 'saleAmount');
    let category = dataset.series([], 'category');

    let data_string = JSON.stringify(d);
    let cate_string = JSON.stringify(category);
    let opt = `{
      xAxis: {
        type: 'category',
        data: ${cate_string},
      },
      yAxis: {},
      series: [{
        type: 'bar',
        data: ${data_string},
      }]
    }`;
    fs.writeFileSync('./test/html/echarts/bar.html', html.replace('{{option}}', opt));
  });

  test('散点图', () => {
    let dataset = new Dataset(data)
      .groupBy(['category', 'subcategory'])
      .aggregateBy('saleAmount', AggregateOperator.SUM)
      .aggregateBy('count', AggregateOperator.COUNT)
      .transform();
    let d = dataset.series(['category#subcategory'], 'saleAmount');
    let data_string = JSON.stringify(d);
    let opt = `{
      xAxis: {
        type: 'category',
      },
      yAxis: {
        type: 'category',
      },
      series: [{
        type: 'scatter',
        data: ${data_string},
      }]
    }`;
    fs.writeFileSync('./test/html/echarts/scatter.html', html.replace('{{option}}', opt));
  });

  test('折线图', () => {
    let dataset = new Dataset(data)
      .groupBy(['category', 'subcategory'])
      .aggregateBy('saleAmount', AggregateOperator.SUM)
      .aggregateBy('count', AggregateOperator.COUNT)
      .transform();
    let d = dataset.series(['category#subcategory'], 'saleAmount');
    let data_string = JSON.stringify(d);
    let opt = `{
      xAxis: {
        type: 'category',
      },
      yAxis: {},
      series: [{
        type: 'line',
        smooth: 0.5,
        data: ${data_string},
      }]
    }`;
    fs.writeFileSync('./test/html/echarts/line.html', html.replace('{{option}}', opt));
  });

  test('饼状图', () => {
    let dataset = new Dataset(data)
      .groupBy(['category', 'subcategory'])
      .aggregateBy('saleAmount', AggregateOperator.SUM)
      .aggregateBy('count', AggregateOperator.COUNT)
      .transform();
    let d = dataset.treerize(['category#subcategory'], 'saleAmount');
    let data_string = JSON.stringify(d);
    let opt = `{
      series: [{
        type: 'pie',
        data: ${data_string},
      }]
    }`;
    fs.writeFileSync('./test/html/echarts/pie.html', html.replace('{{option}}', opt));
  });

  test('漏斗图', () => {
    let dataset = new Dataset(data)
      .groupBy(['category', 'subcategory'])
      .aggregateBy('saleAmount', AggregateOperator.SUM)
      .aggregateBy('count', AggregateOperator.COUNT)
      .transform();
    let d = dataset.treerize(['category#subcategory'], 'saleAmount');
    let data_string = JSON.stringify(d);
    let opt = `{
      series: [{
        type: 'funnel',
        data: ${data_string},
      }]
    }`;
    fs.writeFileSync('./test/html/echarts/funnel.html', html.replace('{{option}}', opt));
  });

  test('表面图', () => {
    let dataset = new Dataset(data)
      .groupBy(['category', 'subcategory'])
      .aggregateBy('saleAmount', AggregateOperator.SUM)
      .aggregateBy('count', AggregateOperator.COUNT)
      .transform();
    let d = dataset.series(['category', 'subcategory'], 'saleAmount');
    let data_string = JSON.stringify(d);
    let opt = `{
      xAxis3D: {
        type: 'category'
      },
      yAxis3D: {
        type: 'category'
      },
      zAxis3D: {
        type: 'value'
      },
      grid3D: {
        viewControl: {}
      },
      series: [{
        type: 'surface',
        data: ${data_string},
      }]
    }`;
    fs.writeFileSync('./test/html/echarts/surface.html', html.replace('{{option}}', opt));
  });

  test('树型图', () => {
    let dataset = new Dataset(data)
      .groupBy(['category', 'subcategory'])
      .aggregateBy('saleAmount', AggregateOperator.SUM)
      .aggregateBy('count', AggregateOperator.COUNT)
      .transform();
    let d = dataset.treerize(['category', 'subcategory'], 'saleAmount');
    let root = {
      name: '根',
      children: d,
    };
    let data_string = JSON.stringify(root);
    let opt = `{
      series: [{
        type: 'tree',
        data: [${data_string}],
      }]
    }`;
    fs.writeFileSync('./test/html/echarts/tree.html', html.replace('{{option}}', opt));
  });
});