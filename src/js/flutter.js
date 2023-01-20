
flutter = {};

flutter.log = (data) => {
  if (!window.print) return;
  print.postMessage(data);
};