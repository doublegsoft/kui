
function MobileWizard(opt) {
  let self = this;
  this.topic = opt.topic;
  this.steps = opt.steps || [];
  this.root = dom.element(`
    <div style="width: 100%">
      <div class="wizard-progress">
      </div>
      <div class="wizard-content">
      </div>
    </div>
  `);
}

MobileWizard.prototype.render = function(containerId, params) {
  this.container = dom.find(containerId);
  this.content = dom.find('div.wizard-content', this.root);
  let elSteps = dom.find('div.wizard-progress', this.root);
  for (let i = 0; i < this.steps.length; i++) {
    let step = this.steps[i];
    let stepIndex = i + 1;
    let elStep = dom.element(`
      <div class="step-${stepIndex}" widget-on-render="" data-step="${i}" style="cursor: pointer;">
        <strong class="title"></strong>
      </div>
    `);
    step.index = i;
    elStep.style.width = (100 / this.steps.length) + '%';
    if (step.active === true) {
      this.current = step;
    }
    dom.find('strong.title', elStep).innerHTML = step.title;
    elSteps.appendChild(elStep);
  }
  this.container.appendChild(this.root);

  this.display(this.current);
};

MobileWizard.prototype.display = function(current) {
  let self = this;
  let elStep = dom.find('div[data-step="' + current.index + '"]', this.root);
  elStep.classList.remove('completed');
  elStep.classList.add('active');
  kuim.navigateWidget(current.url, this.content, {
    wizard: this,
  });
};

/**
 * Completes the current step.
 */
MobileWizard.prototype.commit = function (params) {
  let elStep = dom.find('div.active', this.root);
  let index = parseInt(elStep.getAttribute('data-step'));
  elStep.classList.remove('active');
  elStep.classList.add('completed');
  this.display(this.steps[index + 1]);
};

MobileWizard.prototype.rollback = function () {
  let elStep = dom.find('div.step.active', this.container);
  let index = parseInt(elStep.getAttribute('data-step'));
  elStep.classList.remove('active');
  this.display(this.steps[index - 1]);
};