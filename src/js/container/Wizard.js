
function Wizard(opt) {
  let self = this;
  this.topic = opt.topic;
  this.steps = opt.steps || [];
  this.root = dom.element(`
    <div style="width: 100%">
      <div class="wizard">
      </div>
      <div class="wizard-content">
      </div>
    </div>
  `);
}

Wizard.prototype.render = function(containerId, params) {
  this.container = dom.find(containerId);
  this.body = dom.find('div.wizard-content', this.root);
  let elSteps = dom.find('div.wizard', this.root);
  for (let i = 0; i < this.steps.length; i++) {
    let step = this.steps[i];
    let elStep = dom.element(`
      <div class="wizard-step" widget-on-render="" data-step="${i}" style="cursor: pointer;">
        <div class="content">
          <div class="title"></div>
          <div class="description"></div>
        </div>
      </div>
    `);
    step.index = i;
    if (step.active) {
      this.current = step;
    }
    if (this.current == null) {
      elStep.classList.add('completed');
    }
    dom.find('div.title', elStep).innerHTML = step.title;
    dom.find('div.description', elStep).innerHTML = step.description;
    elSteps.appendChild(elStep);
  }
  this.container.appendChild(this.root);

  this.display(this.current);
};

Wizard.prototype.display = function(current) {
  let self = this;
  let elStep = dom.find('div.step[data-step="' + current.index + '"]', this.root);
  elStep.classList.remove('completed');
  elStep.classList.add('active');

  let existing = false;
  for (let i = 0; i < this.body.children.length; i++) {
    let child = this.body.children[i];
    if (child.getAttribute('data-page-url') == current.url) {
      existing = true;
      child.classList.add('active');
    } else {
      child.classList.remove('active');
    }
  }

  if (existing) return;

  let tab = dom.create('div', 'tab-pane', 'active');
  this.body.appendChild(tab)
  ajax.view({
    url: current.url,
    page: current.page,
    containerId: tab,
    success: function(resp) {
      self.body.children[self.body.children.length - 1].setAttribute('data-page-url', current.url);
    }
  });
};

/**
 * Completes the current step.
 */
Wizard.prototype.commit = function () {
  let elStep = dom.find('div.step.active', this.root);
  let index = parseInt(elStep.getAttribute('data-step'));
  elStep.classList.remove('active');
  elStep.classList.add('completed');
  this.display(this.steps[index + 1]);
};

Wizard.prototype.rollback = function () {
  let elStep = dom.find('div.step.active', this.container);
  let index = parseInt(elStep.getAttribute('data-step'));
  elStep.classList.remove('active');
  this.display(this.steps[index - 1]);
};