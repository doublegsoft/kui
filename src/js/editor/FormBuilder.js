
function FormBuilder(opt) {

}

FormBuilder.prototype.decorate = function(formContainerId) {
  this.formContainer = dom.find(formContainerId);
  let inputGroups = this.formContainer.querySelectorAll('.input-group');
  for (let i = 0; i < inputGroups.length; i++) {
    let ig = inputGroups[i];
    ig.classList.add('mask');
  }
};