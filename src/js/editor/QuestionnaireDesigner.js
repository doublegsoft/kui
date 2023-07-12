
function QuestionnaireDesigner(opt) {
  this.title = opt.title || '问卷调查';
  this.questions = opt.questions || [];
  this.draggingTarget = null;
  this.onSave = opt.onSave || function(model) {};
  this.onDelete = opt.onDelete || function(model) {};
  this.mobileFramePath = opt.mobileFramePath;
  QuestionnaireDesigner.instance = this;
}

QuestionnaireDesigner.QUESTION_MULTIPLE_CHOICE = 'multiple';
QuestionnaireDesigner.QUESTION_SINGLE_CHOICE = 'single';
QuestionnaireDesigner.QUESTION_SHORT_ANSWER = 'answer';

QuestionnaireDesigner.ATTRIBUTE_TITLE = 'data-questionnaire-question-title';
QuestionnaireDesigner.ATTRIBUTE_TYPE = 'data-questionnaire-question-type';
QuestionnaireDesigner.ATTRIBUTE_ORDINAL_POSITION = 'data-questionnaire-question-ordinal-position';
QuestionnaireDesigner.ATTRIBUTE_VALUES = 'data-questionnaire-question-values';
QuestionnaireDesigner.ATTRIBUTE_MODEL = 'data-questionnaire-question-model';

QuestionnaireDesigner.COLOR_SELECTED = '#3880ff';

QuestionnaireDesigner.MODEL_MULTIPLE_CHOICE = `
{
"title":"多选题示例",
"type":"multiple",
"values": ["选线A","选项B","选项C","选项D"]
}
`;

QuestionnaireDesigner.MODEL_SINGLE_CHOICE = `
{
"title":"单选题示例",
"type":"single",
"values": ["选项A","选项B","选项C","选项D"]
}
`;

QuestionnaireDesigner.MODEL_SHORT_ANSWER = `
{
"title":"简答题示例",
"type":"answer"
}
`;

/**
 * the palette component on left side;
 */
QuestionnaireDesigner.prototype.palette = function() {
  let ret = dom.element(`<div class="col-md-2" style="padding: 0; border-radius: unset;"></div>`);
  let ul = dom.create('ul', 'list-group', 'mt-2', 'ml-4');
  let li = dom.create('li', 'list-group-item','grab');
  li.setAttribute('draggable', true);
  li.setAttribute(QuestionnaireDesigner.ATTRIBUTE_TYPE, QuestionnaireDesigner.QUESTION_SINGLE_CHOICE);
  li.innerText = '单选题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: QuestionnaireDesigner.MODEL_SINGLE_CHOICE
  }, function() {});

  li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(QuestionnaireDesigner.ATTRIBUTE_TYPE, QuestionnaireDesigner.QUESTION_MULTIPLE_CHOICE);
  li.innerText = '多选题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: QuestionnaireDesigner.MODEL_MULTIPLE_CHOICE
  }, function() {});

  li = dom.create('li', 'list-group-item', 'grab');
  li.setAttribute('draggable', true);
  li.setAttribute(QuestionnaireDesigner.ATTRIBUTE_TYPE, QuestionnaireDesigner.QUESTION_SHORT_ANSWER);
  li.innerText = '问答题';
  ul.appendChild(li);
  dnd.setDraggable(li, {
    model: QuestionnaireDesigner.MODEL_SHORT_ANSWER
  }, function() {});

  ret.appendChild(ul);

  dom.height(ret, 0, this.container);
  return ret;
};

QuestionnaireDesigner.prototype.canvas = function() {
  let self = this;
  let ret = dom.element(`
    <div class="col-md-6 m-0">
      <div widget-id="widgetQuestionnaireCanvas" 
           style="padding: 10px; 
           margin-top: 8px;
           margin-bottom: 8px;
           background-color: white; 
           overflow-y: auto; 
           height: 100%; 
           border: 4px dashed rgba(0, 0, 0, 0.3);">
      </div>
    </div>
  `);
  this.widgetQuestionnaireCanvas = dom.find('[widget-id=widgetQuestionnaireCanvas]', ret);
  dom.height(this.widgetQuestionnaireCanvas, 16, this.container);
  this.questions.forEach((question, index) => {
    question.ordinalPosition = (index + 1);
    this.renderQuestion(this.widgetQuestionnaireCanvas, question);
  });
  this.widgetQuestionnaireCanvas.addEventListener('dragover', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    let x = ev.clientX;
    let y = ev.clientY;

    let existing = dom.find('[data-questionnaire-question-clone=true]', this.widgetQuestionnaireCanvas);
    if (existing != null) existing.remove();
    if (self.draggingTarget == null) return;

    let cloned = self.draggingTarget.cloneNode(true);
    cloned.style.opacity = '0.5';
    cloned.setAttribute('data-questionnaire-question-clone', 'true');
    self.draggingTarget.remove();

    let inserted = false;
    for (let i = 0; i < this.widgetQuestionnaireCanvas.children.length; i++) {
      let el = this.widgetQuestionnaireCanvas.children[i];
      let rect = el.getBoundingClientRect();
      if (rect.bottom > y) {
        this.widgetQuestionnaireCanvas.insertBefore(cloned, el);
        inserted = true;
        break;
      }
    }
    if (inserted === false) {
      this.widgetQuestionnaireCanvas.appendChild(cloned);
    }
    self.resort(this.widgetQuestionnaireCanvas);
  });
  dnd.setDroppable(this.widgetQuestionnaireCanvas, (x, y, data) => {
    if (self.draggingTarget != null) {
      self.draggingTarget.remove();
      self.draggingTarget = null;
      let dragged = dom.find('[data-questionnaire-question-clone=true]', this.widgetQuestionnaireCanvas);
      dragged.style.opacity = '';
      dragged.removeAttribute('data-questionnaire-question-clone');
      dom.bind(dragged, 'click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        this.clearAndSelect(dragged);
      });
      self.resort(dragged.parentElement);
      self.clearAndSelect(dragged, true);
    } else {
      for (let i = 0; i < this.widgetQuestionnaireCanvas.children.length; i++) {
        this.widgetQuestionnaireCanvas.children[i].style.borderColor = 'transparent';
        let operations = dom.find('[widget-id=operations]', this.widgetQuestionnaireCanvas.children[i]);
        if (operations != null) {
          operations.remove();
        }
      }
      this.renderQuestion(this.widgetQuestionnaireCanvas, JSON.parse(data.model));
    }
    self.refresh();
  });

  dom.bind(this.widgetQuestionnaireCanvas, 'click', ev => {
    for (let i = 0; i < this.widgetQuestionnaireCanvas.children.length; i++) {
      this.clearAndSelect(this.widgetQuestionnaireCanvas.children[i], true);
    }
  });

  return ret;
};

QuestionnaireDesigner.prototype.preview = function(container) {
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
  this.ifPreview.src  = this.mobileFramePath;

  this.ifPreview.onload = () => {
    this.refresh();
  };

};

QuestionnaireDesigner.prototype.render = function(containerId, params) {
  params = params || {};
  if (params.questions) {
    this.questions = params.questions;
  }
  this.container = dom.find(containerId);
  this.container.innerHTML = '';
  this.container.appendChild(this.palette());
  this.container.appendChild(this.canvas());
  this.preview(this.container);
};

/**
 * 设计时渲染多选题。
 */
QuestionnaireDesigner.prototype.renderMultipleChoice = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'multiple_' + Date.now();
    existing = false;
  }
  let model = {...question};
  delete model.id;
  delete model.ordinalPosition;
  question.model = JSON.stringify(model);
  let el = dom.templatize(`
    <div data-questionnaire-question-id="{{id}}" data-questionnaire-question-model="{{model}}" 
         class="questionnaire-question" style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
      <div style="margin-bottom: 6px">
        <strong>{{ordinalPosition}}. {{title}}：</strong>
      </div>
      {{#each values}}
      <div class="questionnaire-answer d-flex">
        <i class="far fa-check-square"></i>
        <label>{{this}}</label>
      </div>
      {{/each}}
    </div>
  `, question);
  dom.bind(el, 'click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.clearAndSelect(el);
  });
  if (existing === true) {
    let old = dom.find('[data-questionnaire-question-id="' + question.id + '"]');
    if (old)
      container.replaceChild(el, old);
    else
      container.appendChild(el);
  } else {
    container.appendChild(el);
  }
};

/**
 * 设计时渲染单选题。
 */
QuestionnaireDesigner.prototype.renderSingleChoice = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'single_' + Date.now();
    existing = false;
  }
  let model = {...question};
  delete model.id;
  delete model.ordinalPosition;
  question.model = JSON.stringify(model);
  if (existing === true && !question.ordinalPosition) {
    let old = dom.find('[data-questionnaire-question-id="' + question.id + '"]');
    let nodes = Array.prototype.slice.call(container.children);
    question.ordinalPosition = nodes.indexOf(old) + 1;
  }
  let el = dom.templatize(`
    <div data-questionnaire-question-id="{{id}}" 
         data-questionnaire-question-model="{{model}}" 
         data-switch=".questionnaire-answer+.checked"
         class="questionnaire-question" style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
      <div style="margin-bottom: 6px">
        <strong>{{ordinalPosition}}. {{title}}：</strong>
      </div>
      {{#each values}}
      <div class="questionnaire-answer d-flex" data-questionnaire-question-name="{{../id}}">
        <i class="far fa-check-circle"></i>
        <label>{{this}}</label>
      </div>
      {{/each}}
    </div>
  `, question);
  dom.bind(el, 'click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.clearAndSelect(el);
  });
  if (existing === true) {
    let old = dom.find('[data-questionnaire-question-id="' + question.id + '"]');
    if (old)
      container.replaceChild(el, old);
    else
      container.appendChild(el);
  } else {
    container.appendChild(el);
  }
};

/**
 * 设计时渲染问答题。
 */
QuestionnaireDesigner.prototype.renderShortAnswer = function(container, question) {
  let existing = true;
  if (!question.id) {
    question.ordinalPosition = container.children.length + 1;
    question.id = 'answer_' + new Date().getMilliseconds();
    existing = false;
  }
  let model = {...question};
  delete model.id;
  delete model.ordinalPosition;
  question.model = JSON.stringify(model);
  let el = dom.templatize(`
    <div data-questionnaire-question-id="{{id}}" data-questionnaire-question-model="{{model}}" class="questionnaire-question"  style="margin-bottom: 12px; padding: 6px; border: 6px solid transparent;">
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
    let old = dom.find('[data-questionnaire-question-id="' + question.id + '"]');
    if (old) {
      container.replaceChild(el, old);
    } else {
      container.appendChild(el);
    }
  } else {
    container.appendChild(el);
  }
};

QuestionnaireDesigner.prototype.clearAndSelect = function(element, clear) {
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
  element.style.borderColor = QuestionnaireDesigner.COLOR_SELECTED;

  let operations = dom.element(`
    <div widget-id="operations" style="position: relative; float: right; right: -6px; bottom: 25px;">
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
  operations.style.backgroundColor = QuestionnaireDesigner.COLOR_SELECTED;

  let buttonMove = dom.find('a[widget-id=buttonMove', operations);
  dom.bind(buttonMove, 'mousedown', ev => {
    let root = dom.ancestor(ev.target, 'div', 'questionnaire-question');
    dnd.setDraggable(root, {
      model: root.getAttribute('data-questionnaire-question-model')
    }, function(x, y, target) {
      self.draggingTarget = target; // target.cloneNode(true);
      // self.draggingTarget.style.opacity = '0.50';
      // self.draggingTarget.setAttribute('data-questionnaire-clone', 'true');
      // target.style.display = 'none';
      dnd.clearDraggable(target);
    });
  });

  let buttonEdit = dom.find('a[widget-id=buttonEdit]', operations);
  dom.bind(buttonEdit, 'click', ev => {
    let model = element.getAttribute(QuestionnaireDesigner.ATTRIBUTE_MODEL);
    model = JSON.parse(model);
    let question = {
      ...model,
      id: element.getAttribute('data-questionnaire-question-id'),
    };
    this.edit(question);
  });

  let buttonDelete = dom.find('a[widget-id=buttonDelete]', operations);
  dom.bind(buttonDelete, 'click', ev => {
    let model = JSON.parse(element.getAttribute('data-questionnaire-question-model'));
    if (!model.questionnaireQuestionId) {
      model.questionnaireQuestionId = element.getAttribute('data-questionnaire-question-id');
    }
    this.onDelete(model, element)
  });
  element.appendChild(operations);
};

QuestionnaireDesigner.prototype.resort = function(container) {
  for (let i = 0; i < container.children.length; i++) {
    let child = container.children[i];
    let strong = dom.find('strong', child);
    let text = strong.innerText;
    strong.innerText = text.replace(/\d+\./i, i + 1 + '.');
    let model = JSON.parse(child.getAttribute('data-questionnaire-question-model'));
    model.ordinalPosition = i + 1;
    child.setAttribute('data-questionnaire-question-model', JSON.stringify(model));
  }
};

QuestionnaireDesigner.prototype.renderQuestion = function(container, question) {
  if (question.type === QuestionnaireDesigner.QUESTION_MULTIPLE_CHOICE) {
    this.renderMultipleChoice(container, question);
  } else if (question.type === QuestionnaireDesigner.QUESTION_SINGLE_CHOICE) {
    this.renderSingleChoice(container, question);
  } else if (question.type === QuestionnaireDesigner.QUESTION_SHORT_ANSWER) {
    this.renderShortAnswer(container, question);
  }
};

QuestionnaireDesigner.prototype.edit = function(question) {
  let self = this;
  Handlebars.registerHelper('ifne', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
  });
  let questionId = question.id;
  question.options = [];
  for (let i = 0; i < question.values.length; i++) {
    question.options.push({
      value: question.values[i],
      score: question.scores ? question.scores[i] : '0',
    })
  }
  let el = dom.templatize(`
    <div>
    <div widget-id="dialogQuestionEdit" class="card border-less">
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
                {{#each options}}
                <li class="list-group-item d-flex pt-0 pb-0">
                  <input onfocus="QuestionnaireDesigner.instance.onCellFocus(this);" 
                         onkeydown="QuestionnaireDesigner.instance.onCellKeyPress(event);"
                         name="values" style="border: none; height=100%; width: 100%" value="{{value}}">
                  <input onfocus="QuestionnaireDesigner.instance.onCellFocus(this);" 
                         onkeydown="QuestionnaireDesigner.instance.onCellKeyPress(event);"
                         name="scores" style="border: none; width: 50px" value="{{score}}">
                  <a class="btn text-danger line-height-32" onclick="this.parentElement.remove();">
                    <span class="material-icons">highlight_off</span>
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
      <div>
        <span class="keyboard-key material-icons">arrow_upward</span>和
        <span class="keyboard-key material-icons">arrow_downward</span>
        可以用于切换输入框。
      </div>
    </div>
  `, question);
  dialog.html({
    html: el.innerHTML,
    load: function() {
      let dialog = dom.find('div[widget-id="dialogQuestionEdit"]');
      let buttonAdd = dom.find('a[widget-id=buttonAdd]', dialog);
      dom.bind(buttonAdd, 'click', ev => {
        let el = dom.element(`
          <li class="list-group-item d-flex pt-0 pb-0">
            <input onfocus="QuestionnaireDesigner.instance.onCellFocus(this);" 
                   onkeydown="QuestionnaireDesigner.instance.onCellKeyPress(event);"
                   name="values" style="border: none; height=100%; width: 100%" value="选项">
            <input onfocus="QuestionnaireDesigner.instance.onCellFocus(this);" 
                   onkeydown="QuestionnaireDesigner.instance.onCellKeyPress(event);"
                   name="scores" style="border: none; width: 50px" value="0">
            <a class="btn text-danger line-height-32" onclick="this.parentElement.remove();">
              <span class="material-icons">highlight_off</span>
            </a>
          </li>
        `);
        dom.find('ul', dialog).appendChild(el);
      });
    },
    success: function() {
      let dialog = dom.find('div[widget-id="dialogQuestionEdit"]');
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
      self.renderQuestion(self.widgetQuestionnaireCanvas, {
        ...question,
        id: questionId,
      });
      self.refresh();
    }
  });
};

QuestionnaireDesigner.prototype.refresh = function() {
  let ifbody = this.ifPreview.contentDocument.body || this.ifPreview.contentWindow.document.body;
  ifbody.innerHTML = this.widgetQuestionnaireCanvas.innerHTML;
};

QuestionnaireDesigner.prototype.onCellFocus = function(input) {
  input.setSelectionRange(0, input.value.length);
};

QuestionnaireDesigner.prototype.onCellKeyPress = function(ev) {
  let ul = dom.ancestor(ev.target, 'ul');
  let inputs = ul.querySelectorAll('input');
  let index = -1;
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    if (input === ev.target) {
      index = i;
      break;
    }
  }
  if (ev.keyCode == 38) {
    // arrow-up
    if (index - 1 >= 0) {
      inputs[index - 1].focus();
      // inputs[index - 1].setSelectionRange(0, inputs[index - 1].value.length);
    }
  } else if (ev.keyCode == 40) {
    // arrow-down
    if (index + 1 < inputs.length) {
      inputs[index + 1].focus();
      // inputs[index + 1].setSelectionRange(0, inputs[index + 1].value.length);
    }
  }
};

QuestionnaireDesigner.prototype.getQuestions = function () {
  let questions = [];
  this.widgetQuestionnaireCanvas.querySelectorAll('.questionnaire-question').forEach((el, idx) => {
    let model = JSON.parse(el.getAttribute('data-questionnaire-question-model'));
    questions.push({
      questionId: el.getAttribute('data-questionnaire-question-id'),
      questionName: model.title,
      questionType: model.type,
      content: JSON.stringify(model),
      ordinalPosition: idx,
    });
  });
  return questions;
};

QuestionnaireDesigner.prototype.setQuestionIds = function (ids) {
  this.widgetQuestionnaireCanvas.querySelectorAll('.questionnaire-question').forEach((el, idx) => {
    el.setAttribute('data-questionnaire-question-id', ids[idx]);
  });
};

QuestionnaireDesigner.prototype.selectText = function (el){
  let sel, range;
  if (window.getSelection && document.createRange) { //Browser compatibility
    sel = window.getSelection();
    if(sel.toString() == ''){ //no text selection
      window.setTimeout(function(){
        range = document.createRange(); //range object
        range.selectNodeContents(el); //sets Range
        sel.removeAllRanges(); //remove all ranges from selection
        sel.addRange(range);//add Range to a Selection.
      },1);
    }
  } else if (document.selection) { //older ie
    sel = document.selection.createRange();
    if(sel.text == ''){ //no text selection
      range = document.body.createTextRange();//Creates TextRange object
      range.moveToElementText(el);//sets Range
      range.select(); //make selection.
    }
  }
}