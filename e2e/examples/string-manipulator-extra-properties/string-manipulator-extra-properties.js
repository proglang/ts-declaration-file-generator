module.exports = function (s) {
  s.charAt(0);

  var i = 0;
  if (s.somethingNotInString === 'something') {
    i++;
  }

  i += s.anotherProperty;

  return s.length;
};
