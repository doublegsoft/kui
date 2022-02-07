
function FormBuilder(opt) {

}

FormBuilder.prototype.decorate = function(formContainerId) {
  this.formContainer = dom.find(formContainerId);
  let inputGroups = this.formContainer.querySelectorAll('.input-group');
  for (let i = 0; i < inputGroups.length; i++) {
    let mask = dom.create('div');
    mask.style.background = 'transparent';
    mask.style.width = '100%';
    mask.style.height = '100%';
    mask.style.zIndex = '9999';
    mask.style.position = 'absolute';
    mask.style.top = '0px';
    mask.style.left = '0px';
    mask.style.cursor = 'pointer';
    let ig = inputGroups[i];
    ig.parentElement.style.position = 'relative';
    ig.parentElement.appendChild(mask);
    dom.bind(mask, 'click', ev => {

    });
  }
};