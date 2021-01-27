
$.fn.checktree = function(opts) {
  let setting = {
    check: {
      enable: true,
      chkboxType: {
        "Y": "ps",
        "N": "ps"
      }
    },
    data: {
      simpleData: {
        enable: true,
        idKey: opts.fields.id,
        pIdKey: opts.fields.parentId
      },
      key: {
        name: opts.fields.name
      }
    }
  };
  this.fieldId = opts.fields.id;
  this.selections = opts.selections || [];
  let self = this;

  function setChecked(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children && nodes[i].children.length == 0) nodes[i].children = null;
      for (let j = 0; j < self.selections.length; j++) {
        if (nodes[i][self.fieldId] == self.selections[j][self.fieldId]) {
          nodes[i].checked = true;
          break;
        }
      }
      setChecked(nodes[i].children || []);
    }
  }
  opts.data.fieldId = opts.fields.id;
  opts.data.fieldParentId = opts.fields.parentId;
  xhr.post({
    url: opts.url,
    usecase: opts.usecase || '',
    data: opts.data,
    success: function (resp) {
      let nodes = resp.data;
      setChecked(nodes);
      opts.tree = $.fn.zTree.init(self, setting, nodes);
    }
  })
};

function Checktree(opts) {
  this.setting = {
    check: {
      enable: true,
      chkboxType: {
        "Y": "ps",
        "N": "ps"
      }
    },
    data: {
      simpleData: {
        enable: true,
        idKey: opts.fields.id,
        pIdKey: opts.fields.parentId
      },
      key: {
        name: opts.fields.name
      }
    },
    callback: opts.callback || {}
  };
  this.fieldId = opts.fields.id;
  this.fieldParentId = opts.fields.parentId;
  this.url = opts.url;
  this.data = opts.data;
  this.usecase = opts.usecase || '';
}

Checktree.prototype.getSelections = function () {
  return this.tree.getCheckedNodes();
};

Checktree.prototype.setSelections = function (selections, match) {
  let self = this;
  function setChecked(node) {
    for (let i = 0; i < selections.length; i++) {
      let sel = selections[i];
      if (sel[self.fieldId] == node[self.fieldId]) {
        node.checked = true;
        if (!node.children || node.children.length == 0)
          self.tree.updateNode(node, true);
        break;
      }
    }
    if (!node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      let child = node.children[i];
      setChecked(child);
    }
  }

  this.tree.getNodes().forEach((node, index) => {
    setChecked(node);
    self.tree.updateNode(node, false);
  });
};

Checktree.prototype.uncheckAll = function () {
  let self = this;

  function setUnchecked(node) {
    if (!node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      let child = node.children[i];
      node.checked = false;
      self.tree.updateNode(node, true);
      setUnchecked(child);
    }
  }

  this.tree.getNodes().forEach((node, index) => {
    node.checked = false;
    self.tree.updateNode(node, false);
    setUnchecked(node);
  });
};

Checktree.prototype.render = function (containerId, opts) {
  let self = this;
  if (opts) {
    this.selections = opts.selections || [];
  } else {
    this.selections = [];
  }
  function resetChildren(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children && nodes[i].children.length == 0) nodes[i].children = null;
      resetChildren(nodes[i].children || []);
    }
  }
  this.data.fieldId = this.fieldId;
  this.data.fieldParentId = this.fieldParentId;
  xhr.post({
    url: this.url,
    usecase: this.usecase,
    data: this.data,
    success: function (resp) {
      let nodes = resp.data;
      let container = null;
      resetChildren(nodes);
      if (typeof containerId === 'string') {
        container = $(containerId);
      } else {
        container = $(containerId);
      }
      self.tree = $.fn.zTree.init(container, self.setting, nodes);
      self.setSelections(self.selections);
    }
  })
};