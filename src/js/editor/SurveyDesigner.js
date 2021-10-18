
function SurveyDesigner(opt) {
  this.title = opt.title || '问卷调查';
  this.questions = opt.questions || [];
  this.draggingTarget = null;
}

SurveyDesigner.QUESTION_MULTIPLE_CHOICE = 'multiple';
SurveyDesigner.QUESTION_SINGLE_CHOICE = 'single';
SurveyDesigner.QUESTION_SHORT_ANSWER = 'answer';

SurveyDesigner.ATTRIBUTE_TITLE = 'data-survey-title';
SurveyDesigner.ATTRIBUTE_TYPE = 'data-survey-type';
SurveyDesigner.ATTRIBUTE_ORDINAL_POSITION = 'data-survey-ordinal-position';
SurveyDesigner.ATTRIBUTE_VALUES = 'data-survey-values';
SurveyDesigner.ATTRIBUTE_MODEL = 'data-survey-model';

SurveyDesigner.COLOR_SELECTED = '#3880ff';

SurveyDesigner.MODEL_MULTIPLE_CHOICE = `
{
"title":"多选题示例",
"type":"multiple",
"values": ["选线A","选项B","选项C","选项D"]
}
`;

SurveyDesigner.MODEL_SINGLE_CHOICE = `
{
"title":"单选题示例",
"type":"single",
"values": ["选线A","选项B","选项C","选项D"]
}
`;

SurveyDesigner.MODEL_SHORT_ANSWER = `
{
"title":"简答题示例",
"type":"answer"
}
`;

/**
 * the palette component on left side;
 */
SurveyDesigner.prototype.palette = function() {
  let ret = dom.element(`<div class="col-md-2" style="padding: 0; border-radius: unset;"></div>`);
  let ul = dom.create('ul', 'list-group');
  let li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(SurveyDesigner.ATTRIBUTE_TYPE, SurveyDesigner.QUESTION_SINGLE_CHOICE);
  li.innerText = '单选题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: SurveyDesigner.MODEL_SINGLE_CHOICE
  }, function() {});

  li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(SurveyDesigner.ATTRIBUTE_TYPE, SurveyDesigner.QUESTION_MULTIPLE_CHOICE);
  li.innerText = '多选题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: SurveyDesigner.MODEL_MULTIPLE_CHOICE
  }, function() {});

  li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(SurveyDesigner.ATTRIBUTE_TYPE, SurveyDesigner.QUESTION_SHORT_ANSWER);
  li.innerText = '问答题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: SurveyDesigner.MODEL_SHORT_ANSWER
  }, function() {});

  ret.appendChild(ul);

  dom.height(ret, 0, this.container);
  return ret;
};

SurveyDesigner.prototype.canvas = function() {
  let self = this;
  let ret = dom.element(`
    <div class="col-md-6 m-0">
      <div widget-id="widgetSurveyCanvas" style="padding: 10px; background-color: white; overflow-y: auto; height: 100%">
      </div>
    </div>
  `);
  this.questions.forEach(question => {
    this.renderQuestion(widgetSurveyCanvas, question);
  });
  let widgetSurveyCanvas = dom.find('[widget-id=widgetSurveyCanvas]', ret);
  dom.height(widgetSurveyCanvas, 0, this.container);
  widgetSurveyCanvas.addEventListener('dragover', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    let x = ev.clientX;
    let y = ev.clientY;

    let existing = dom.find('[data-survey-clone=true]', widgetSurveyCanvas);
    if (existing != null) existing.remove();
    if (self.draggingTarget == null) return;

    let cloned = self.draggingTarget.cloneNode(true);
    cloned.style.opacity = '0.5';
    cloned.setAttribute('data-survey-clone', 'true');
    self.draggingTarget.remove();

    let inserted = false;
    for (let i = 0; i < widgetSurveyCanvas.children.length; i++) {
      let el = widgetSurveyCanvas.children[i];
      let rect = el.getBoundingClientRect();
      if (rect.bottom > y) {
        widgetSurveyCanvas.insertBefore(cloned, el);
        inserted = true;
        break;
      }
    }
    if (inserted === false) {
      widgetSurveyCanvas.appendChild(cloned);
    }
    self.resort(widgetSurveyCanvas);
  });
  dnd.setDroppable(widgetSurveyCanvas, (x, y, data) => {
    if (self.draggingTarget != null) {
      self.draggingTarget.remove();
      self.draggingTarget = null;
      let dragged = dom.find('[data-survey-clone=true]', widgetSurveyCanvas);
      dragged.style.opacity = '';
      dragged.removeAttribute('data-survey-clone');
      dom.bind(dragged, 'click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.clearAndSelect(dragged);
      });
      self.resort(dragged.parentElement);
      self.clearAndSelect(dragged, true);
    } else {
      this.renderQuestion(widgetSurveyCanvas, JSON.parse(data.model));
    }
    let ifbody = self.ifPreview.contentDocument.body || self.ifPreview.contentWindow.document.body;
    ifbody.innerHTML = widgetSurveyCanvas.innerHTML;
  });

  dom.bind(widgetSurveyCanvas, 'click', ev => {
    for (let i = 0; i < widgetSurveyCanvas.children.length; i++) {
      this.clearAndSelect(widgetSurveyCanvas.children[i], true);
    }
  });

  return ret;
};

SurveyDesigner.prototype.preview = function(container) {
  let width = 365;
  let height = 750;
  let el = dom.element(`
    <div class="col-md-4 m-0 d-flex position-relative">
      <img src="img/emulator/iphone-full.png" class="m-auto" style="width: ${width}px; height: ${height}px;">
      <iframe class="position-absolute" style="width: ${width - 52}px; height: ${height - 138}px; background-color: white;" frameborder="0"></iframe>
    </div>
  `);
  container.appendChild(el);

  // 重新计算位置
  let img = dom.find('img', el);
  this.ifPreview = dom.find('iframe', el);
  let imgrect = img.getBoundingClientRect();
  this.ifPreview.style.left = (img.offsetLeft + 25) + 'px';
  this.ifPreview.style.top = (img.offsetTop + 82) + 'px';
  this.ifPreview.src  = 'html/mobile/index.html';
};

SurveyDesigner.prototype.render = function(containerId, params) {
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  this.container.appendChild(this.palette());
  this.container.appendChild(this.canvas());
  this.preview(this.container);
};

/**
 * 设计时渲染多选题。
 */
SurveyDesigner.prototype.renderMultipleChoice = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'multiple_' + new Date().getMilliseconds();
    existing = false;
  }
  question.model = JSON.stringify(question);
  let el = dom.templatize(`
    <div data-survey-id="{{id}}" data-survey-model="{{model}}" class="followup-question" style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
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
    let old = dom.find('[data-survey-id=' + question.id + ']');
    container.replaceChild(el, old);
  } else {
    container.appendChild(el);
  }
};

/**
 * 设计时渲染单选题。
 */
SurveyDesigner.prototype.renderSingleChoice = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'single_' + Date.now();
    existing = false;
  }
  question.model = JSON.stringify(question);
  let el = dom.templatize(`
    <div data-survey-id="{{id}}" data-survey-model="{{model}}" class="followup-question" style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
      <div style="margin-bottom: 6px">
        <strong>{{ordinalPosition}}. {{title}}：</strong>
      </div>
      {{#each values}}
      <div><input type="radio" name="{{../id}}" style="margin-right: 5px;">{{this}}</div>
      {{/each}}
    </div>
  `, question);
  dom.bind(el, 'click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.clearAndSelect(el);
  });
  if (existing === true) {
    let old = dom.find('[data-survey-id=' + question.id + ']');
    container.replaceChild(el, old);
  } else {
    container.appendChild(el);
  }
};

/**
 * 设计时渲染问答题。
 */
SurveyDesigner.prototype.renderShortAnswer = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'answer_' + new Date().getMilliseconds();
    existing = false;
  }
  question.model = JSON.stringify(question);
  let el = dom.templatize(`
    <div data-survey-id="{{id}}" data-survey-model="{{model}}" class="followup-question"  style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
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
    let old = dom.find('[data-survey-id=' + question.id + ']');
    container.replaceChild(el, old);
  } else {
    container.appendChild(el);
  }
};

SurveyDesigner.prototype.clearAndSelect = function(element, clear) {
  let self = this;
  if (element.parentElement == null) return;
  for (let i = 0; i < element.parentElement.children.length; i++) {
    element.parentElement.children[i].style.borderColor = 'transparent';
    let operations = dom.find('[widget-id=operations]', element.parentElement.children[i]);
    if (operations != null) {
      operations.remove();
    }
  }

  if (clear === true) return;
  element.style.borderColor = SurveyDesigner.COLOR_SELECTED;

  let operations = dom.element(`
    <div widget-id="operations" style="position: relative; float: right; right: -6px; bottom: 24px;">
      <a widget-id="buttonMove" class="btn text-light" style="cursor: move;">
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
  operations.style.backgroundColor = SurveyDesigner.COLOR_SELECTED;

  let buttonMove = dom.find('a[widget-id=buttonMove', operations);
  dom.bind(buttonMove, 'mousedown', ev => {
    let root = dom.ancestor(ev.target, 'div', 'followup-question');
    dnd.setDraggable(root, {
      model: root.getAttribute('data-survey-model')
    }, function(x, y, target) {
      self.draggingTarget = target; // target.cloneNode(true);
      // self.draggingTarget.style.opacity = '0.50';
      // self.draggingTarget.setAttribute('data-survey-clone', 'true');
      // target.style.display = 'none';
      dnd.clearDraggable(target);
    });
  });

  let buttonEdit = dom.find('a[widget-id=buttonEdit]', operations);
  dom.bind(buttonEdit, 'click', ev => {
    let model = element.getAttribute(SurveyDesigner.ATTRIBUTE_MODEL);
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

SurveyDesigner.prototype.resort = function(container) {
  for (let i = 0; i < container.children.length; i++) {
    let child = container.children[i];
    let strong = dom.find('strong', child);
    let text = strong.innerText;
    strong.innerText = text.replace(/\d+\./i, i + 1 + '.');
  }
};

SurveyDesigner.prototype.renderWhenDragging = function(container) {
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
SurveyDesigner.prototype.addAndRenderQuestion = function(question) {
  this.questions.push(question);
  this.renderQuestion(question);
};

SurveyDesigner.prototype.renderQuestion = function(container, question) {
  if (question.type === SurveyDesigner.QUESTION_MULTIPLE_CHOICE) {
    this.renderMultipleChoice(container, question);
  } else if (question.type === SurveyDesigner.QUESTION_SINGLE_CHOICE) {
    this.renderSingleChoice(container, question);
  } else if (question.type === SurveyDesigner.QUESTION_SHORT_ANSWER) {
    this.renderShortAnswer(container, question);
  }
};

/**
 * Gets the question models.
 *
 * @returns {[]}
 */
SurveyDesigner.prototype.getQuestions = function() {
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

SurveyDesigner.prototype.edit = function(question) {
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
                  <input name="scores" style="border: none; width: 50px" value="0">
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
      let inputs = dialog.querySelectorAll('input[name=values]');
      let question = dom.formdata(dialog);
      question.values = [];
      question.scores = [];
      inputs.forEach((el, idx) => {
        if (el.name === 'values') {
          question.values.push(el.value);
        }
      });
      inputs = dialog.querySelectorAll('input[name=scores]');
      inputs.forEach((el, idx) => {
        if (el.name === 'scores') {
          question.scores.push(el.value);
        }
      });
      self.renderQuestion(dom.find("[widget-id=widgetSurveyCanvas]"), question);
      let ifbody = self.ifPreview.contentDocument.body || self.ifPreview.contentWindow.document.body;
      ifbody.innerHTML = dom.find("[widget-id=widgetSurveyCanvas]").innerHTML;
    }
  });
};