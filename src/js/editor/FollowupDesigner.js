
function FollowupDesigner(opt) {
  this.title = opt.title || '问卷调查';
  this.questions = opt.questions || [];
}

FollowupDesigner.QUESTION_MULTIPLE_CHOICE = 'multiple';
FollowupDesigner.QUESTION_SINGLE_CHOICE = 'single';
FollowupDesigner.QUESTION_SHORT_ANSWER = 'answer';

FollowupDesigner.ATTRIBUTE_TITLE = 'data-followup-title';
FollowupDesigner.ATTRIBUTE_TYPE = 'data-followup-type';
FollowupDesigner.ATTRIBUTE_ORDINAL_POSITION = 'data-followup-ordinal-position';
FollowupDesigner.ATTRIBUTE_VALUES = 'data-followup-values';
FollowupDesigner.ATTRIBUTE_MODEL = 'data-followup-model';

FollowupDesigner.COLOR_SELECTED = '#3880ff';

FollowupDesigner.MODEL_MULTIPLE_CHOICE = `
{
"title":"多选题示例",
"type":"multiple",
"values": ["选线A","选项B","选项C","选项D"]
}
`;

FollowupDesigner.MODEL_SINGLE_CHOICE = `
{
"title":"单选题示例",
"type":"single",
"values": ["选线A","选项B","选项C","选项D"]
}
`;

FollowupDesigner.MODEL_SHORT_ANSWER = `
{
"title":"简答题示例",
"type":"answer"
}
`;

/**
 * the palette component on left side;
 */
FollowupDesigner.prototype.palette = function() {
  let ret = dom.element(`<div class="col-md-2" style="padding: 0; border-radius: unset;"></div>`);
  let ul = dom.create('ul', 'list-group');
  let li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(FollowupDesigner.ATTRIBUTE_TYPE, FollowupDesigner.QUESTION_SINGLE_CHOICE);
  li.innerText = '单选题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: FollowupDesigner.MODEL_SINGLE_CHOICE
  }, function() {});

  li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(FollowupDesigner.ATTRIBUTE_TYPE, FollowupDesigner.QUESTION_MULTIPLE_CHOICE);
  li.innerText = '多选题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: FollowupDesigner.MODEL_MULTIPLE_CHOICE
  }, function() {});

  li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(FollowupDesigner.ATTRIBUTE_TYPE, FollowupDesigner.QUESTION_SHORT_ANSWER);
  li.innerText = '问答题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: FollowupDesigner.MODEL_SHORT_ANSWER
  }, function() {});

  ret.appendChild(ul);

  dom.height(ret, 0, this.container);
  return ret;
};

FollowupDesigner.prototype.canvas = function() {
  let ret = dom.element(`
    <div class="col-md-10 m-0">
      <div>
        <a class="btn btn-link">保存</a>
        <a class="btn btn-link">预览</a>
      </div>
      <div widget-id="widgetFollowupCanvas" style="padding: 10px; background-color: white; overflow-y: auto; height: 100%">
      </div>
    </div>
  `);
  this.questions.forEach(question => {
    this.renderQuestion(widgetFollowupCanvas, question);
  });
  let widgetFollowupCanvas = dom.find('[widget-id=widgetFollowupCanvas]', ret);
  dom.height(widgetFollowupCanvas, 0, this.container);
  widgetFollowupCanvas.addEventListener('dragover', (ev) => {
    ev.preventDefault();
    let x = ev.clientX;
    let y = ev.clientY;
    for (let i = 0; i < widgetFollowupCanvas.children.length; i++) {
      let el = widgetFollowupCanvas.children[i];
      let rect = el.getBoundingClientRect();
    }
  });
  dnd.setDroppable(widgetFollowupCanvas, (x, y, data) => {
    this.renderQuestion(widgetFollowupCanvas, JSON.parse(data.model));
  });

  dom.bind(widgetFollowupCanvas, 'click', ev => {
    for (let i = 0; i < widgetFollowupCanvas.children.length; i++) {
      this.clearAndSelect(widgetFollowupCanvas.children[i], true);
    }
  });

  return ret;
};

FollowupDesigner.prototype.render = function(containerId, params) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  this.container.appendChild(this.palette());
  this.container.appendChild(this.canvas());
};

FollowupDesigner.prototype.preview = function(containerId, params) {
  this.container = dom.find(containerId);
  this.questions.forEach(question => {
    this.previewQuestion(question);
  });
};

/**
 * 设计时渲染多选题。
 */
FollowupDesigner.prototype.renderMultipleChoice = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'multiple_' + new Date().getMilliseconds();
    existing = false;
  }
  question.model = JSON.stringify(question);
  let el = dom.templatize(`
    <div data-followup-id="{{id}}" data-followup-model="{{model}}" style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
      <div style="margin-bottom: 6px">
        <strong>{{ordinalPosition}}. {{title}}：</strong>
      </div>
      {{#each values}}
      <div><input type="checkbox" name="{{id}}" style="margin-right: 5px;">{{this}}</div>
      {{/each}}
    </div>
  `, question);
  dom.bind(el, 'click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.clearAndSelect(el);
  });
  if (existing === true) {
    let old = dom.find('[data-followup-id=' + question.id + ']');
    container.replaceChild(el, old);
  } else {
    container.appendChild(el);
  }
};

/**
 * 设计时渲染单选题。
 */
FollowupDesigner.prototype.renderSingleChoice = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'single_' + new Date().getMilliseconds();
    existing = false;
  }
  question.model = JSON.stringify(question);
  let el = dom.templatize(`
    <div data-followup-id="{{id}}" data-followup-model="{{model}}" style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
      <div style="margin-bottom: 6px">
        <strong>{{ordinalPosition}}. {{title}}：</strong>
      </div>
      {{#each values}}
      <div><input type="radio" name="{{id}}" style="margin-right: 5px;">{{this}}</div>
      {{/each}}
    </div>
  `, question);
  dom.bind(el, 'click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.clearAndSelect(el);
  });
  if (existing === true) {
    let old = dom.find('[data-followup-id=' + question.id + ']');
    container.replaceChild(el, old);
  } else {
    container.appendChild(el);
  }
};

/**
 * 设计时渲染问答题。
 */
FollowupDesigner.prototype.renderShortAnswer = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'answer_' + new Date().getMilliseconds();
    existing = false;
  }
  question.model = JSON.stringify(question);
  let el = dom.templatize(`
    <div data-followup-id="{{id}}" data-followup-model="{{model}}" style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
      <div style="margin-bottom: 6px">
        <strong>{{ordinalPosition}}. {{title}}：</strong>
      </div>
      <div>
        <textarea name="{{id}}" style="width: 100%; height: 120px; resize: none; outline: none; box-shadow: none;  background-color: transparent;" readonly></textarea>
      </div>
    </div>
  `, question);
  dom.bind(el, 'click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.clearAndSelect(el);
  });
  if (existing === true) {
    let old = dom.find('[data-followup-id=' + question.id + ']');
    container.replaceChild(el, old);
  } else {
    container.appendChild(el);
  }
};

/**
 * 运行时渲染多选题。
 */
FollowupDesigner.prototype.previewMultipleChoice = function(question) {

};

/**
 * 运行时渲染单选题。
 */
FollowupDesigner.prototype.previewSingleChoice = function(question) {

};

/**
 * 运行时渲染问答题。
 */
FollowupDesigner.prototype.previewShortAnswer = function(question) {

};

FollowupDesigner.prototype.clearAndSelect = function(element, clear) {
  if (element.parentElement == null) return;
  for (let i = 0; i < element.parentElement.children.length; i++) {
    element.parentElement.children[i].style.borderColor = 'transparent';
    let operations = dom.find('[widget-id=operations]', element.parentElement.children[i]);
    if (operations != null) {
      operations.remove();
    }
  }

  if (clear === true) return;
  element.style.borderColor = FollowupDesigner.COLOR_SELECTED;

  let operations = dom.element(`
    <div widget-id="operations" style="position: relative; float: right; right: -6px; bottom: 24px;">
      <a class="btn text-light"">
        <i class="fas fa-arrows-alt"></i>
      </a>
      <a widget-id="buttonEdit" class="btn text-light"">
        <i class="fas fa-edit"></i>
      </a>
      <a widget-id="buttonDelete" class="btn text-light">
        <i class="fas fa-trash-alt"></i>
      </a>
    </div>
  `);
  operations.style.backgroundColor = FollowupDesigner.COLOR_SELECTED;

  let buttonEdit = dom.find('a[widget-id=buttonEdit]', operations);
  dom.bind(buttonEdit, 'click', ev => {
    let model = element.getAttribute(FollowupDesigner.ATTRIBUTE_MODEL);
    this.edit(JSON.parse(model));
  });

  let buttonDelete = dom.find('a[widget-id=buttonDelete]', operations);
  dom.bind(buttonDelete, 'click', ev => {
    let parent = element.parentElement;
    element.remove();
    this.resort(parent);
  });
  element.appendChild(operations);
};

FollowupDesigner.prototype.resort = function(container) {
  for (let i = 0; i < container.children.length; i++) {
    let child = container.children[i];
    let strong = dom.find('strong', child);
    let text = strong.innerText;
    strong.innerText = text.replace(/\d+\./i, i + 1 + '.');
  }
};

FollowupDesigner.prototype.renderWhenDragging = function(container) {
  for (let i = 0; i < container.children.length; i++) {
    let child = container.children[i];
    let strong = dom.find('strong', child);
    let text = strong.innerText;
    strong.innerText = text.replace(/\d+\./i, i + 1 + '.');
  }
};

/**
 *
 * @param question
 */
FollowupDesigner.prototype.addAndRenderQuestion = function(question) {
  this.questions.push(question);
  this.renderQuestion(question);
};

FollowupDesigner.prototype.renderQuestion = function(container, question) {
  if (question.type === FollowupDesigner.QUESTION_MULTIPLE_CHOICE) {
    this.renderMultipleChoice(container, question);
  } else if (question.type === FollowupDesigner.QUESTION_SINGLE_CHOICE) {
    this.renderSingleChoice(container, question);
  } else if (question.type === FollowupDesigner.QUESTION_SHORT_ANSWER) {
    this.renderShortAnswer(container, question);
  }
};

FollowupDesigner.prototype.previewQuestion = function(question) {
  if (question.type === FollowupDesigner.QUESTION_MULTIPLE_CHOICE) {
    this.previewMultipleChoice(question);
  } else if (question.type === FollowupDesigner.QUESTION_SINGLE_CHOICE) {
    this.previewSingleChoice(question);
  } else if (question.type === FollowupDesigner.QUESTION_SHORT_ANSWER) {
    this.previewShortAnswer(question);
  }
};

/**
 * Gets the question models.
 *
 * @returns {[]}
 */
FollowupDesigner.prototype.getQuestions = function() {
  let ret = [];
  let index = 1;
  this.questions.forEach(question => {
    let itemQuestion = {};
    itemQuestion.ordinalPosition = index++;
    itemQuestion.title = question.title;
    itemQuestion.type = question.type;
    itemQuestion.values = question.values;
    ret.push(itemQuestion);
  });
  return ret;
};

FollowupDesigner.prototype.edit = function(question) {
  let self = this;
  Handlebars.registerHelper('ifne', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
  });
  let el = dom.templatize(`
    <div>
    <div widget-id="dialogFollowupEdit" class="card border-less">
      <div class="card-body">
        <div class="row">
          <div class="col-sm-12">
            <div class="form-group">
              <input class="form-control" name="id" type="hidden" value="{{id}}">
              <input class="form-control" name="ordinalPosition" type="hidden" value="{{ordinalPosition}}">
              <input class="form-control" name="type" type="hidden" value="{{type}}">
              <label for="name"><strong>标题</strong></label>
              <input class="form-control" name="title" type="text" value="{{title}}">
            </div>
          </div>
        </div>  
        {{#ifne type "answer"}}
        <div class="row">
          <div class="col-sm-12">
            <div class="form-group">
              <label for="name">
                <strong>选项</strong>
                <a widget-id="buttonAdd" class="btn btn-link">
                  <i class="fas fa-plus-circle"></i>
                </a>
              </label>
              <ul class="list-group">
                {{#each values}}
                <li class="list-group-item d-flex pt-0 pb-0">
                  <input name="values" style="border: none; height=100%; width: 100%" value="{{this}}">
                  <a class="btn text-danger" onclick="this.parentElement.remove();">
                    <i class="fas fa-times"></i>
                  </a>
                </li>
                {{/each}}
              </ul>
            </div>
          </div>
        </div>  
        {{/ifne}}
      </div>
    </div>
    </div>
  `, question);



  dialog.html({
    html: el.innerHTML,
    load: function() {
      let dialog = dom.find('div[widget-id="dialogFollowupEdit"]');
      let buttonAdd = dom.find('a[widget-id=buttonAdd]', dialog);
      dom.bind(buttonAdd, 'click', ev => {
        dom.find('ul', dialog).appendChild(dom.element(`
          <li class="list-group-item d-flex pt-0 pb-0">
            <input name="values" style="border: none; height=100%; width: 100%" value="选项">
            <a class="btn text-danger" onclick="this.parentElement.remove();">
              <i class="fas fa-times"></i>
            </a>
          </li>
        `));
      });
    },
    success: function() {
      let dialog = dom.find('div[widget-id="dialogFollowupEdit"]');
      let inputs = dialog.querySelectorAll('input');
      let question = dom.formdata(dialog);
      question.values = [];
      inputs.forEach((el, idx) => {
        if (el.name === 'values') {
          question.values.push(el.value);
        }
      });
      self.renderQuestion(dom.find("[widget-id=widgetFollowupCanvas]"), question);
    }
  });
};