const callbacks = [];
let pending = false;

let timerFunc: Function;

const p = typeof Promise !== 'undefined' ? Promise.resolve() : null;

const flushCallbacks = () => {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (const func of copies) {
    func();
  }
}

if (p) {
  timerFunc = () => {
    p.then(flushCallbacks).catch(err => console.error(err));
  };
} else if (typeof MutationObserver !== 'undefined' && MutationObserver.toString() === '[object MutationObserverConstructor]') {
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

export function nextTick(cb: Function, ctx: Object, ...args: any[]) {
  let _resolve;
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx, ...args);
      } catch (e) {
        console.error(e);
      }
    } else if (_resolve) {
      _resolve(args);
    }
  });
  if (!pending) {
    pending = true;
    timerFunc();
  }
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise((resolve) => {
      _resolve = resolve;
    });
  }
}
