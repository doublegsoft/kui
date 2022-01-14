
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
  this.levels = opts.levels || 1;

  this.fieldText = opts.fields.text;
  this.fieldValue = opts.fields.value;
  this.fieldParent = opts.fields.parent;

  this.onEditNode = opts.onEditNode;
  this.onRemoveNode = opts.onRemoveNode;
  this.onSelectNode = opts.onSelectNode;
  this.onAddNode = opts.onAddNode;
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
          <div widget-id="widgetActions" class="ml-auto mr-2" style="line-height: 32px;">
            <a widget-id="buttonEdit"
               class="btn-link pointer mr-1 action">
              <i class="fas fa-edit font-14 text-info" style="top: 4px;"></i>
            </a>
            <a widget-id="buttonAdd"
               class="btn-link pointer mr-1 action">
              <span class="material-icons text-info font-18" style="top: 4px;">add_circle_outline</span>
            </a>
            <a widget-id="buttonDelete"
               class="btn-link pointer action">
              <span class="material-icons text-danger font-18" style="top: 4px;">highlight_off</span>
            </a>
          </div>
        </div>
        <ul class="list-group full-width border-less">
        </ul>
      </div>
    </li>
  `, viewModel);
  let buttonExpand = dom.find('[widget-id=buttonExpand]', ret);
  let buttonEdit = dom.find('[widget-id=buttonEdit]', ret);
  let buttonAdd = dom.find('[widget-id=buttonAdd]', ret);
  let buttonDelete = dom.find('[widget-id=buttonDelete]', ret);
  if ((level + 1) == this.levels) buttonExpand.remove();
  else {
    let model = {};
    model[this.fieldParent] = data[this.fieldValue];
    dom.model(buttonExpand, model);
    dom.bind(buttonExpand, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      let a = dom.ancestor(ev.target, 'a');
      let div = a.parentElement.parentElement;
      let ul = div.querySelector('ul');
      let icon = a.children[0];
      if (icon.classList.contains('fa-plus-square')) {
        icon.classList.remove('fa-plus-square');
        icon.classList.add('fa-minus-square');
        ul.style.display = '';
        if (ul.children.length == 0)
          this.fetchChildren(ret, dom.model(a));
      } else {
        icon.classList.remove('fa-minus-square');
        icon.classList.add('fa-plus-square');
        ul.style.display = 'none';
      }
    });
  }

  let widthActions = 0;
  if (this.onEditNode) {
    let model = {};
    model[this.fieldValue] = data[this.fieldValue];
    dom.model(buttonEdit, model);
    dom.bind(buttonEdit, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      let a = dom.ancestor(ev.target, 'a');
      this.onEditNode(a.parentElement.parentElement.parentElement.parentElement, dom.model(a));
    });
    widthActions += 22;
  } else {
    buttonEdit.remove();
  }
  if (this.onRemoveNode) {
    let model = {};
    model[this.fieldValue] = data[this.fieldValue];
    dom.model(buttonDelete, model);
    dom.bind(buttonDelete, 'click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      let a = dom.ancestor(ev.target, 'a');
      this.onRemoveNode(a.parentElement.parentElement.parentElement.parentElement, dom.model(a));
    });
    widthActions += 22;
  } else {
    buttonDelete.remove();
  }

  if (this.onAddNode) {
    if ((level + 1) == this.levels) buttonAdd.remove();
    else {
      let model = {};
      model[this.fieldParent] = data[this.fieldParent];
      dom.model(buttonAdd, model);
      dom.bind(buttonAdd, 'click', ev => {
        let a = dom.ancestor(ev.target, 'a');
        this.onAddNode(a.parentElement.parentElement.parentElement.parentElement, dom.model(a));
      });
    }
    widthActions += 22;
  } else {
    buttonAdd.remove();
  }
  if (this.onSelectNode) {
    dom.bind(ret, 'click', ev => {
      let li = dom.ancestor(ev.target, 'li');
      let actives = this.container.querySelectorAll('.list-group-item-action.active');
      actives.forEach((el, idx) => { el.classList.remove('active') });
      let div = li.querySelector('.list-group-item-action');
      if (div != null) {
        div.classList.add('active');
      }
      this.onSelectNode(dom.model(li));
    });
  }

  // 动态调整按钮宽度和文本宽度
  let widgetText = dom.find('[widget-id=widgetText]', ret);
  let widgetActions = dom.find('[widget-id=widgetActions]', ret);
  widgetActions.style.minWidth = widgetActions + 'px';
  widgetText.style.width = 'calc(100% - ' + widgetText + 'px)';
  return ret;
};

/**
 * 递归添加、渲染数据到树节点。
 */
TreeView.prototype.appendNode = function(parentElement, data, level) {
  let ul = parentElement.querySelector('ul');
  let li = this.createNodeElement(data, level);
  ul.appendChild(li);

  data.children = data.children || [];
  for (let i = 0; i < data.children.length; i++) {
    let childData = data.children[i];
    childData.level = data.level + 1;
    let childParentElement = li.querySelector('ul');
    this.appendNode(childParentElement, childData, level + 1);
  }
};

TreeView.prototype.fetchChildren = async function(parentElement, params) {
  if (!this.childUrl) return;
  let url = this.childUrl;
  let data = await xhr.promise({
    url: url,
    params: params,
  });
  for (let i = 0; i < data.length; i++) {
    this.appendNode(parentElement, data[i], 1);
  }
};

TreeView.prototype.render = async function(containerId, params) {
  this.container = dom.find(containerId);
  let data = [];
  if (this.rootUrl) {
    data = await xhr.promise({
      url: this.rootUrl,
      params: params,
    });
  } else if (this.local) {
    data = this.local;
  }

  // the root ul
  let ul = dom.create('ul', 'list-group');
  this.container.appendChild(ul);
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    this.appendNode(this.container, row, 0);
  }

};