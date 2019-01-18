
/**
 * Constructs a 
 */
var WorkflowDesigner = function(opts) {
  this.nodes = opts.nodes;
};

WorkflowDesigner.prototype.render = function(containerId) {
  var container = d3.select('#' + containerId);
  console.log(container);
  var svg = container.append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', '0 0 300 300');
};

WorkflowDesigner.prototype.drawArrow = function (prevNode, nextNode) {
  
}

/**
 * 根据前置节点和后置节点信息得到最大的行数。
 */
WorkflowDesigner.prototype.maxRows = function () {
  
}

/**
 * 侦测每行中的节点数判断出最大的列数。
 */
WorkflowDesigner.prototype.maxCols = function () {
  
}