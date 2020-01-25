
function TextElement() {
  this.data = {};
}

TextElement.prototype.getData = function () {

};

TextElement.prototype.setData = function (data) {
  this.data = data;
};

TextElement.prototype.getProperties = function () {
  return [{
    title: '展示',
    properties: [{
      id: 'left',
      label: '左',
      input: 'number',
      value: this.data.x || 0
    }, {
      id: 'right',
      label: '顶',
      input: 'number',
      value: this.data.y || 0
    }, {
      id: 'width',
      label: '宽度',
      input: 'number',
      value: this.data.width || 0
    }, {
      id: 'height',
      label: '高度',
      input: 'number',
      value: this.data.height || 0
    }]
  }, {
    title: '文本元素',
    properties: [{
      id: 'text',
      label: '文本',
      input: 'textarea',
      value: this.data.text || '',
      display: function (obj) {
        return obj.text;
      }
    },{
      id: 'fontFamily',
      label: '字体名称',
      input: 'select',
      value: this.data.fontFamily || '宋体',
      values: ['宋体','黑体','楷体','仿宋体'],
      display: function (obj) {
        return obj.fontFamily;
      }
    },{
      id: 'fontSize',
      label: '字体大小',
      input: 'range',
      unit: 'px',
      value: this.data.fontSize || 16,
      min: '10',
      max: '60',
      display: function (obj) {
        return obj.fontSize;
      }
    }]
  }];
};