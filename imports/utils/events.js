export const once = (el, type, callback) => {
  const typeArray = type ? type.split(' ') : [];
  const recursiveFunction = (event) => {
    event.target.removeEventListener(event.type, recursiveFunction);
    return callback(event);
  };

  for (let i = typeArray.length - 1; i >= 0; i -= 1) {
    this.on(el, typeArray[i], recursiveFunction);
  }
};

export const on = (el, type, callback) => {
  if (el.addEventListener) {
    el.addEventListener(type, callback);
  } else {
    // IE8+ Support
    el.attachEvent(`on${type}`, () => {
      callback.call(el);
    });
  }
};

export const off = (el, type, callback) => {
  if (el.removeEventListener) {
    el.removeEventListener(type, callback);
  } else {
    // IE8+ Support
    el.detachEvent(`on${type}`, callback);
  }
};

export const isKeyboard = (event) => [
  'keydown',
  'keypress',
  'keyup',
].indexOf(event.type) !== -1;
