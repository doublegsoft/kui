
/**
 * 设计画布类型定义，一切利用html canvas技术业务实现的基类。
 */
function DesignCanvas() {
// 在画布上选中的对象
  this.selected = null;
  this.moving = false;

  // 页面实际的画布对象
  this.canvas = document.createElement('canvas');
}

/**
 * 
 */
DesignCanvas.prototype.bindDragOverEventListener = function () {
  // 拖拽到canvas上面时的事件处理函数
  this.canvas.addEventListener('dragover', function(ev) {
    ev.preventDefault();
  });
};

/**
 * 
 */
DesignCanvas.prototype.bindDropEventListener = function (self, callback) {
  // 在canvas上面释放拖拽对象时的事件处理函数
  var self = this;
  this.canvas.addEventListener('drop', function (ev) {
    ev.preventDefault();
    callback(self, ev);
  });
};

/**
 * 
 */
DesignCanvas.prototype.bindMouseDownEventListener = function (self, callback) {
  // 在canvas上响应鼠标按钮按下的事件处理函数
  this.canvas.addEventListener('mousedown', function(ev) {
    // 重置已经选择的对象
    self.selected = null;
    // 利用坐标体系算法获取当前的选择对象
    callback(self, ev);
  });
};

/**
 * 
 */
DesignCanvas.prototype.bindMouseMoveEventListener = function (self, callback) {
  this.canvas.addEventListener('mousemove', function(ev) {
    if (self.selected == null) {
      return;
    }
    if (!self.moving) {
      return;
    }
    callback(self, ev);
    if (self.selected != null) {
      self.moving = true;
    }
  });
};

/**
 * 
 */
DesignCanvas.prototype.bindMouseUpEventListener = function () {
  var self = this;
  this.canvas.addEventListener('mouseup', function(ev) {
    self.moving = false;
  });
};