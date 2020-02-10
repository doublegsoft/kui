let ObservableObject = require('../../src/js/kui-Rx.js')

let pageData = {
  id: '',
  name: '',
  children: [],
  other: {}
};

let observable = new ObservableObject(pageData);
observable.addObserver('name', function(evt) {
  console.log(evt.property + ": " + (evt.oldValue ? evt.oldValue : '') + ' => ' + evt.newValue);
});

observable.addObserver('other.id', function(evt) {
  console.log(evt.property + ": " + (evt.oldValue ? evt.oldValue : '') + ' => ' + evt.newValue);
});

observable.addObserver('children', function(evt) {
  console.log(evt.property + ": " + (evt.oldValue ? evt.oldValue : '') + ' => ' + evt.newValue);
});

let proxy = observable.proxy;

proxy.name = 'hello';
proxy.age = 23;
proxy.other.id = '123';

proxy.children.push(1);
proxy.children.push(2);
proxy.children.push(3);
proxy.children.pop();

proxy.children = proxy.children.slice(0, 1)

console.log(JSON.stringify(proxy));

