
format = {};

format.date = function(val) {
  if (typeof val === 'undefined') {
    return '';
  }
  if (typeof val === 'string') {
    return val;
  }
  let dt = moment(val);
  return dt.format('YYYY年MM月DD日');
};

format.time = function(val) {
  if (typeof val === 'undefined') {
    return '';
  }
  if (typeof val === 'string') {
    return val;
  }
  let dt = moment(val);
  return dt.format('HH:mm');
};

format.money = function(val, scale) {
  scale = scale || 0;
  return accounting.formatMoney(parseFloat(val), "￥", scale, ",", ".")
};