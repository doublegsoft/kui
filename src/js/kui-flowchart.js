
function FlowChart(opts) {
  this.containerId = opts.containerId;
  this.code = opts.code;
  
  this.defaultOptions = {
    'line-width': 1,
    'maxWidth': 1,//ensures the flowcharts fits within a certian width
    'line-length': 10,
    'text-margin': 5,
    'font-size': 12,
    'font': 'normal',
    'font-family': 'Microsoft SimHei',
    'font-weight': 'normal',
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': '是',
    'no-text': '否',
    'arrow-end': 'block',
    'scale': 1,
    'symbols': {
      'start': {
        'font-color': 'black',
        'element-color': 'green',
        'fill': 'white'
      },
      'end':{
        'class': 'end-element'
      }
    },
    'flowstate' : {
      'past' : { 'fill' : '#21ba45', 'font-weight' : 'bold'},
      'current' : {'fill' : '#fbbd08', 'font-weight' : 'bold'},
      'future' : { 'fill' : 'white', 'font-color': 'black', 'font-weight' : 'bold'}
    }
  };
}

FlowChart.prototype.render = function() {
  var fc = flowchart.parse(this.code);
  fc.drawSVG(this.containerId, this.defaultOptions)
};