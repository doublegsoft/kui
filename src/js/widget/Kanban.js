
function Kanban(opts) {
  this.drop = opts.drop;
  this.boards = opts.boards;
}

Kanban.prototype.initialize = function() {
  this.jkanbanBoards = [];
  for (let i = 0; i < this.boards.length; i++) {
    let board = this.boards[i];
    this.jkanbanBoards.push({
      id: board.id,
      title: board.title,
      class: board.classes,
      dragTo: board.target
    });
  }
};

Kanban.prototype.addElement = function(boardId, element) {
  this.kanban.addElement(boardId, element);
};

Kanban.prototype.render = function(containerId, params) {
  let self = this;
  this.initialize();
  this.kanban = new jKanban({
    element: containerId,
    gutter: "10px",
    responsivePercentage: true,
    itemHandleOptions:{
      enabled: false,
    },
    click: function(el) {
      // console.log("Trigger on all items click!");
    },
    dropEl: function(el, target, source, sibling) {
      console.log(target);
      console.log(el);
      // self.drop(el, target, source, sibling);
    },
    boards: self.jkanbanBoards
  });

};