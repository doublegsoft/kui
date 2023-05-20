
function TreeView(opts) {
  if (opts.url) {
    this.rootUrl = opts.url;
    this.childUrl = opts.url;
  } else if (opts.urls) {
    this.rootUrl = opts.urls.root;
    this.childUrl = opts.urls.child;
  }
  this.local = opts.local;
  // the level number
  this.levels = opts.levels || 99;
  let params = opts.params || {};
  this.rootParams = params.root || {};
  this.childParams = params.child || {};

  this.fieldText = opts.fields.text;
  this.fieldValue = opts.fields.value;
  this.fieldParent = opts.fields.parent;

  this.contextMenu = dom.element(`
    <div class="context-menu" style="display: none; width: 200px;">
      <ul class="menu">
        <li><a widget-id="buttonAdd" href="#"><i class="fas fa-plus-circle position-relative" style="top: -2px;"></i>添加</a></li>
        <li><a widget-id="buttonEdit" href="#"><i class="fas fa-edit position-relative" style="top: -2px;"></i>编辑</a></li>
        <li><a widget-id="buttonCopy" href="#"><i class="fas fa-copy position-relative" style="top: -2px;"></i>复制</a></li>
        <li class="trash"><a widget-id="buttonDelete" href="#"><i class="fas fa-trash position-relative" style="top: -2px;"></i>删除</a></li>
      </ul>
    </div>
  `);

  dom.init(this, this.contextMenu);

  this.onEditNode = opts.onEditNode;
  this.onRemoveNode = opts.onRemoveNode;
  this.onSelectNode = opts.onSelectNode;
  this.onAddNode = opts.onAddNode;

  this.isNodeEditable = opts.isNodeEditable;
  this.isNodeRemovable = opts.isNodeRemovable;
  this.isNodeAppendable = opts.isNodeAppendable;

  if (this.onEditNode) {
    dom.bind(this.buttonEdit, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hideContextMenu();
      this.onEditNode(this.selectedLi, dom.model(this.selectedLi));
    });
  } else {
    this.buttonEdit.remove();
  }

  if (this.onRemoveNode) {
    dom.bind(this.buttonDelete, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hideContextMenu();
      this.onRemoveNode(this.selectedLi, dom.model(this.selectedLi));
    });
  } else {
    this.buttonDelete.remove();
  }
  if (this.onAddNode) {
    dom.bind(this.buttonAdd, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hideContextMenu();
      this.onAddNode(this.selectedLi, dom.model(this.selectedLi));
    });
  } else {
    this.buttonAdd.remove();
  }
}

TreeView.prototype.createNodeElement = function(data, level) {
  level = level || 0;
  let viewModel = {
    ...data,
    paddingLeft: 16 * (level),
    level: level,
    text: data[this.fieldText],
  };
  let ret = dom.templatize(`
    <li widget-model-level="{{level}}" class="list-group-item p-0 b-a-0">
      <div class="full-width">
        <div class="d-flex full-width list-group-item-action" style="line-height: 32px; padding-left: {{paddingLeft}}px!important;">
          <a widget-id="buttonExpand" class="btn-link pointer ml-2 mr-2">
            <i class="far text-success font-14 fa-plus-square"></i>
          </a>
          <div widget-id="widgetText" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-height: 32px;">
            <strong>{{text}}</strong>
          </div>
        </div>
        <ul class="list-group full-width border-less" style="display: none;"></ul>
      </div>
    </li>
  `, viewModel);
  dom.model(ret, data);
  let buttonExpand = dom.find('[widget-id=buttonExpand]', ret);
  if ((level + 1) == this.levels) {
    buttonExpand.style.visibility = 'hidden';
  } else if (!data.children || data.children.length == 0) {
    buttonExpand.style.visibility = 'hidden';
  } else {
    let model = {};
    model[this.fieldParent] = data[this.fieldValue];
  }
  buttonExpand.onclick = this.collapseOrExpand;

  let model = {};
  model[this.fieldValue] = data[this.fieldValue];
  model[this.fieldText] = data[this.fieldText];
  if (data[this.fieldParent])
    model[this.fieldParent] = data[this.fieldParent];

  if (this.onSelectNode) {
    dom.bind(ret, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.hideContextMenu();
      let li = this.activateListItem(ev);
      this.onSelectNode(li, dom.model(li));
    });
  }

  // 动态调整按钮宽度和文本宽度
  let widgetText = dom.find('[widget-id=widgetText]', ret);
  widgetText.style.width = 'calc(100% - ' + widgetText + 'px)';
  return ret;
};

/**
 * 根据数据定位树视图中的元素。
 *
 * @deprecated
 */
TreeView.prototype.locateElement = function(data, parentElement) {
  parentElement = parentElement || this.container;
  let ul = parentElement.querySelector('ul');
  let lis = ul.querySelectorAll('li');

  for (let i = 0; i < lis.length; i++) {
    let li = lis[i];
    let model = dom.model(li);
    if (data[this.fieldValue] === model[this.fieldValue]) {
      return li;
    }
    let ret = this.locateElement(data, li);
    if (ret != null) {
      return ret;
    }
  }
  return null;
};

TreeView.prototype.locateNode = function(data, parentElement) {
  parentElement = parentElement || this.container;
  let ul = parentElement.querySelector('ul');
  let lis = ul.querySelectorAll('li');

  for (let i = 0; i < lis.length; i++) {
    let li = lis[i];
    let model = dom.model(li);
    if (data[this.fieldValue] === model[this.fieldValue]) {
      return li;
    }
    let ret = this.locateNode(data, li);
    if (ret != null) {
      return ret;
    }
  }
  return null;
};

TreeView.prototype.fetchChildren = async function(parentElement, params, level) {
  if (!this.childUrl) return;
  let url = this.childUrl;
  let fixedParams = level > 0 ? this.childParams : this.rootParams;
  let data = await xhr.promise({
    url: url,
    params: {
      ...fixedParams,
      ...params,
    },
  });
  for (let i = 0; i < data.length; i++) {
    this.appendNode(data[i], level, parentElement);
  }
};

TreeView.prototype.collapseOrExpand = function (ev) {
  ev.preventDefault();
  ev.stopPropagation();

  let a = dom.ancestor(ev.currentTarget, 'a');
  let div = a.parentElement.parentElement;
  let ul = div.querySelector('ul');

  let icon = a.children[0];
  if (icon.classList.contains('fa-plus-square')) {
    icon.classList.remove('fa-plus-square');
    icon.classList.add('fa-minus-square');
    ul.style.display = '';
    // if (ul.children.length == 0)
    // ul.innerHTML = '';
    // this.fetchChildren(ret, dom.model(a), level + 1);
  } else {
    icon.classList.remove('fa-minus-square');
    icon.classList.add('fa-plus-square');
    ul.style.display = 'none';
  }
};

TreeView.prototype.updateParent = function(parentElement) {
  let ul = parentElement;
  let div = ul.parentElement;
  let buttonExpand = div.querySelector('[widget-id=buttonExpand]')
  if (ul.children.length == 0) {
    buttonExpand.style.visibility = 'hidden';
  } else {
    buttonExpand.style.visibility = '';
  }
  buttonExpand.onclick = this.collapseOrExpand;
};

/**
 * 递归添加、渲染数据到树节点或者新增节点。
 *
 * @public
 */
TreeView.prototype.appendNode = function(nodeData, level, parentElement) {
  parentElement = parentElement || this.container;
  let ul = parentElement.querySelector('ul');
  let lis = ul.querySelectorAll('li');
  let li = this.createNodeElement(nodeData, level);

  nodeData.children = nodeData.children || [];
  let pos = null;
  for (let li of lis) {
    if (li.innerText.localeCompare(nodeData[this.fieldText]) == 1) {
      pos = li;
      break;
    }
  }
  if (pos == null) {
    ul.appendChild(li);
    this.updateParent(li.parentElement);
  } else {
    ul.insertBefore(li, pos);
  }
  for (let i = 0; i < nodeData.children.length; i++) {
    let childData = nodeData.children[i];
    childData.level = nodeData.level + 1;
    let childParentElement = li.children[0];
    this.appendNode(childData, level + 1, childParentElement);
  }
};

TreeView.prototype.appendOrUpdateNode = function (nodeData) {
  let node = this.locateNode(nodeData);
  let ul = this.container.querySelector('ul');
  let li = ul.querySelector('[' + utils.nameAttr(this.fieldValue) + '="' + nodeData[this.fieldValue] + '"]');
  if (li != null) {
    // update
    li.querySelector('strong').innerText = nodeData[this.fieldText];
    dom.model(li, nodeData);
    return;
  }
  li = this.container.querySelector('li[' + utils.nameAttr(this.fieldValue) + '="' + nodeData[this.fieldParent] + '"]');
  if (li == null) {
    this.appendNode(nodeData, 0);
    return;
  }
  let level = parseInt(li.getAttribute('widget-model-level'));
  this.appendNode(nodeData, level + 1, li);
};

TreeView.prototype.removeNode = function (nodeData) {
  let li = this.locateNode(nodeData);
  if (li != null) {
    let ul = li.parentElement;
    li.remove();
    this.updateParent(ul);
  }
};

TreeView.prototype.insertNode = function (parentElement, nodeData) {
  parentElement = parentElement || this.container;
  let ul = dom.find('ul', parentElement);
  let lis = ul.querySelectorAll('li');

};

TreeView.prototype.render = async function(containerId, params) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  let data = [];
  if (this.rootUrl) {
    data = await xhr.promise({
      url: this.rootUrl,
      params: {
        ...this.rootParams,
        ...params,
      },
    });
  } else if (this.local) {
    data = this.local;
  }

  // the root ul
  let ul = dom.create('ul', 'list-group');
  this.container.appendChild(ul);
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    this.appendNode(row, 0, this.container);
  }
  this.container.appendChild(this.contextMenu);

  this.container.oncontextmenu = ev => {
    ev.preventDefault();
    this.showContextMenu(ev);
  };
  this.container.onclick = ev => {
    this.hideContextMenu();
  };
};

/**
 * 激活显示列表项目。
 */
TreeView.prototype.activateListItem = function (ev) {
  let li = dom.ancestor(ev.target, 'li');
  let actives = this.container.querySelectorAll('.list-group-item-action.active');
  actives.forEach((el, idx) => { el.classList.remove('active') });
  let div = li.querySelector('.list-group-item-action');
  if (div != null) {
    div.classList.add('active');
  }
  return li;
};

/**
 * 显示右键菜单。
 */
TreeView.prototype.showContextMenu = function (ev) {
  let rect = this.container.getBoundingClientRect();
  if (ev.pageX < rect.left || ev.pageX > (rect.left + rect.width)) {
    return;
  }
  if (ev.pageY < rect.top || ev.pageY > (rect.top + rect.height)) {
    return;
  }
  this.contextMenu.style.display = 'block';
  this.contextMenu.style.left = (ev.pageX - rect.left + 10) + "px";
  this.contextMenu.style.top = (ev.pageY - rect.top + 25) + "px";
  let closest = document.elementFromPoint(ev.clientX, ev.clientY);
  let li = dom.ancestor(closest, 'li');
  if (li == null) {
    return;
  }
  this.selectedLi = li;
  // 会触发TreeView的onSelectNode方法
  this.activateListItem(ev);
};

TreeView.prototype.hideContextMenu = function (ev) {
  this.contextMenu.style.display = 'none';
};

