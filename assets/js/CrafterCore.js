/*
 *  Saul's Craft JS
 *  License MIT
 *   /[^{}]+(?=\})/g    find between curly braces
 */
"use strict";

function On(eventType, SelectorOrNode, callback) {
  if (Craft.isFunc(callback) || Craft.isFunc(SelectorOrNode)) {
    if (Craft.isDefined(SelectorOrNode) && Craft.isString(SelectorOrNode)) {
      $(SelectorOrNode, true).forEach(element => {
        element.addEventListener(eventType, e => callback(e, e.target));
      });
    } else if (Craft.isNode(SelectorOrNode) || SelectorOrNode === window || SelectorOrNode === document) {
      SelectorOrNode.addEventListener(eventType, e => {
        callback(e, e.target);
      });
    } else if (Craft.isNodeList(SelectorOrNode)) {
      craft(SelectorOrNode).forEach(element => {
        element.addEventListener(eventType, e => {
          callback(e, e.target);
        });
      });
    } else if (Craft.isFunc(SelectorOrNode)) {
      window.addEventListener(eventType, e => SelectorOrNode(e, e.target));
    }
  } else {
    console.error("No Function Provided for 'On'");
  }
}

function craft(element) {
  if (Craft.isNodeList(element)) {
    element.forEach = callback => {
      if (Craft.isFunc(callback)) {
        for (var index = 0; index < element.length; index++) {
          callback(craft(element[index]), index);
        }
      } else {
        console.error("No Function Provided for NodeList.forEach");
      }
    };
    element.On = (eventType, callback) => {
      if (Craft.isFunc(callback)) {
        element.forEach(element => {
          element.addEventListener(eventType, e => {
            (Craft.isDefined(e.target) && Craft.isntNull(e.target) && Craft.isNode(e.target)) ? callback(e, craft(e.target)) : callback(e, e.target);
          });
        });
      } else {
        console.error("No function Provided for 'on'");
      }
      return craft(element);
    };
    element.includes = SelectorOrNode => {
      if (Craft.isString(SelectorOrNode)) SelectorOrNode = $(SelectorOrNode);
    }
  } else if (Craft.isNode(element)) {
    element.prepend = prependNode => {
      element.insertBefore(prependNode, element.firstChild);
    }
    element.getSiblings = () => {
      let siblings = [];
      let AllChildren = element.parentNode.childNodes;
      for (var i = 0; i < AllChildren.length; i++) {
        if (AllChildren[i] !== element) siblings.push(AllChildren[i]);
      }
      return siblings;
    }
    element.getWidth = () => {
      return element.getBoundingClientRect().width;
    }
    element.getHeight = () => {
      return element.getBoundingClientRect().height;
    }
    element.getRect = () => {
      return element.getBoundingClientRect();
    }
    element.On = (eventType, callback) => {
      Craft.isFunc(callback) ? element.addEventListener(eventType, e => callback(e, e.target)) : console.error("No function Provided for 'Node.craft().On( _EVENT_TYPE_GOES_HERE_, function);  '");
      return element;
    }
    element.find = (selector, forceSelectAll, verbose) => {
      let Localelement = element.querySelectorAll(selector);
      if (Localelement.length > 1 || forceSelectAll === true && Craft.isntNull(Localelement) && Craft.isNodeList(Localelement)) {
        return craft(Localelement);
      } else if (Localelement !== null && Craft.isNode(Localelement[0])) {
        return craft(Localelement[0]);
      } else {
        if (verbose === true) console.error('NO such element/s found for selector : ' + selector);
        return null;
      }
    }
    element.hasClass = (className, callback) => {
      if (Craft.isUndefined(callback)) {
        console.error("no class name provided -> element.hasClass(_className_,optionalcallback)");
        return null;
      }
      let has = false;
      element.classList.contains(className) ? has = true : has = false;
      if (Craft.isDefined(callback) && Craft.isFunc(callback)) callback(has);
      return has;
    }
    element.isTag = (Tagname, callback) => {
      if (element.tagName === Tagname.toUpperCase()) {
        if (Craft.isDefined(callback) && Craft.isFunc(callback)) callback(craft(element));
        return true;
      } else {
        return false;
      }
    }
    element.hide = (speed, timing, callback) => {}
  }
  return element;
}

function $(selector, forceSelectAll, verbose) {
  let element = document.querySelectorAll(selector);
  if (element.length > 1 || forceSelectAll === true && Craft.isntNull(element) && Craft.isNodeList(element)) {
    return craft(element);
  } else if (Craft.isntNull(element) && Craft.isNode(element[0])) {
    return craft(element[0]);
  } else {
    if (verbose === true) console.warn('NO such element/s found for selector : ' + selector);
    return null;
  }
}
var Craft = {
  Nodeloop: (SelectorOrNodeList, callback) => {
    Craft.isNodeList(SelectorOrNodeList) ? craft(SelectorOrNodeList) : SelectorOrNodeList = $(SelectorOrNodeList, true);
    SelectorOrNodeList.forEach(element => callback ? callback(element) : console.error('No Callback Found'));
  },
  ArraytoObject: arr => {
    let NewObject = {};
    arr.forEach(arrI => {
      if (Craft.isDefined(arrI)) NewObject[arrI] = arrI;
    });

    return NewObject;
  },
  ContextBind: (SelectorOrNode, ContextObject, callback) => {
    let element = Craft.isNode(SelectorOrNodeList) ? SelectorOrNode : $(SelectorOrNode),
      Changes;
    if (Craft.isntNull(element) && Craft.isDefined(callback) && Craft.isFunc(callback)) {
      Object.observe(ContextObject, changes => {
        changes.forEach(ch => {
          Changes = ch;
          callback(element, ch);
        });
      });
      callback(element, Changes);
    } else {
      console.error("Selector did not find any matching element");
    }
  },
  isFunc: func => {
    return typeof func === 'function';
  },
  isUndefined: val => {
    return typeof val === 'undefined';
  },
  isDefined: val => {
    return typeof val !== 'undefined';
  },
  isString: val => {
    return typeof val === 'string';
  },
  isNum: val => {
    return typeof val === 'number';
  },
  isNode: val => {
    return val instanceof Node;
  },
  isNodeList: val => {
    return val instanceof NodeList;
  },
  isNull: val => {
    return val === null;
  },
  isntNull: val => {
    return val !== null;
  },
  isFile: obj => {
    return toString.call(obj) === '[object File]';
  },
  isFormData: obj => {
    return toString.call(obj) === '[object FormData]';
  },
  isBlob: obj => {
    return toString.call(obj) === '[object Blob]';
  },
  isRegExp: obj => {
    return toString.call(obj) === '[object RegExp]';
  },
  isDate: obj => {
    return toString.call(obj) === '[object Date]';
  },
  isUpperCase: char => {
    return (char >= 'A') && (char <= 'Z');
  },
  IsEmail: EmailString => {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(EmailString);
  },
  charLoop: (string, callback) => {
    if (Craft.isUndefined(callback) || !Craft.isFunc(callback)) return console.error('callback is not a valid function');
    for (var i = 0; i < string.length; i++) {
      callback(string[i])
    }
  },
  hasCapitals: string => {
    let HasCapitals = false;
    Craft.charLoop(string, char => {
      if (Craft.isUpperCase(char)) HasCapitals = true;
    });
    return HasCapitals;
  },
  same : (itemOne,itemTwo) => {
    return itemOne === itemTwo;
  },
  cookie: {
    getItem: item => {
      if (!item) return null;
      return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(item).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: (item, itemValue, EndOfLife, Path, Domain, isSecure) => {
      if (!item || /^(?:expires|max\-age|path|domain|secure)$/i.test(item)) return false;
      let EOLdate = "";
      if (EndOfLife) {
        if (Craft.isNum(EndOfLife)) {
          EOLdate = EndOfLife === Infinity ? "; expires=Fri, 11 April 9997 23:59:59 GMT" : "; max-age=" + EndOfLife;
        } else if (Craft.isString(EndOfLife)) {
          EOLdate = "; expires=" + EndOfLife;
        } else if (Craft.isDate(EndOfLife)) {
          EOLdate = "; expires=" + EndOfLife.toUTCString();
        } else {
          console.error("Expiry date is not a Number/String/Date");
        }
      }
      document.cookie = encodeURIComponent(item) + "=" + encodeURIComponent(itemValue) + EOLdate + (Domain ? "; domain=" + Domain : "") + (Path ? "; path=" + Path : "") + (isSecure ? "; secure" : "");
      return true;
    },
    removeItem: (item, Path, Domain) => {
      if (!Craft.cookies.itemExists(item)) return false;
      document.cookie = encodeURIComponent(item) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (Domain ? "; domain=" + Domain : "") + (Path ? "; path=" + Path : "");
      return true;
    },
    itemExists: item => {
      if (!item) return false;
      return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(item).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    CookieKeys: () => {
      let Keys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
      for (var KeysLength = Keys.length, IDx = 0; IDx < KeysLength; IDx = IDx + 1) {
        Keys[IDx] = decodeURIComponent(Keys[IDx]);
      }
      return Keys;
    }
  },
  Mouse: {
    Position: {
      x: 0,
      y: 0
    },
    Over: null
  }
};

function WhenReady(callback) {
  WhenReady.timesInvoked++;
  return (() => Craft.isFunc(callback) ? WhenReady.invocations.push(callback) : console.error('No Function Provided'))();
};
WhenReady.timesInvoked = 0;
WhenReady.Scope = {};
WhenReady.invocations = [];

(() => {

  function initDynamics() {
    $('[movable]', true).forEach(element => {
      element.style.position = 'absolute';
      let movable = false;
      let Dimentions = {
        rect: element.getRect(),
        mouseX: Craft.Mouse.Position.x,
        mouseY: Craft.Mouse.Position.y
      };

      function initMove() {
        movable = true;
        Dimentions = {
          rect: element.getBoundingClientRect(),
          mouseX: Craft.Mouse.Position.x,
          mouseY: Craft.Mouse.Position.y
        };
      }
      if (Craft.isntNull(element.find('[movehandle]')) && Craft.isDefined(element.find('[movehandle]'))) {
        craft(element).find('[movehandle]').On('mousedown', initMove);
      } else {
        element.On('mousedown', initMove);
      }
      On('mouseup', document, e => movable = false);
      Object.observe(Craft.Mouse.Position, () => {
        if (movable) {
          element.style.left = (Craft.Mouse.Position.x - (Dimentions.mouseX - Dimentions.rect.left)) + 'px';
          element.style.top = (Craft.Mouse.Position.y - (Dimentions.mouseY - Dimentions.rect.top)) + 'px';
        }
      });
    });
    setTimeout(() => {
      $('[tooltip]', true).forEach(element => {
        let tooltip = document.createElement('span');
        let showTooltip = false;
        let Dimentions = element.getRect();
        tooltip.appendChild(document.createElement('label'));
        tooltip.innerHTML += element.getAttribute('tooltip');
        Object.observe(Craft.Mouse.Position, () => {
          if (showTooltip && Craft.Mouse.Over === element) {
            tooltip.style.left = Craft.Mouse.Position.x + 'px';
            tooltip.style.top = Craft.Mouse.Position.y + 'px';
          }
        });
        tooltip.classList.add('craft-tooltip');
        element.On('mouseenter', e => {
          if (element.hasAttribute('tooltip-delay')) {
            setTimeout(() => {
              showTooltip = true;
              tooltip.style.display = 'block';
              setTimeout(() => tooltip.style.opacity = '1', 10);
              if (Craft.Mouse.Over === element) {
                tooltip.style.left = Craft.Mouse.Position.x + 'px';
                tooltip.style.top = Craft.Mouse.Position.y + 'px';
              } else {
                showTooltip = false;
                tooltip.style.display = 'none';
                setTimeout(() => tooltip.style.opacity = '0', 10);
              }
            }, parseInt(element.getAttribute('tooltip-delay'), 10));
          } else {
            showTooltip = true;
            tooltip.style.display = 'block';
            setTimeout(() => tooltip.style.opacity = '1', 10);
          }
        });
        element.On('mouseleave', e => {
          showTooltip = false;
          tooltip.style.display = 'none';
          setTimeout(() => tooltip.style.opacity = '0', 10);
        });
        document.body.appendChild(tooltip);
      });
    }, 250);
  }
  On('DOMContentLoaded',() => {
    On('mousemove', e => {
      Craft.Mouse.Position.x = e.clientX;
      Craft.Mouse.Position.y = e.clientY;
    });
    On('mouseover', document, e => Craft.Mouse.Over = e.target);
    WhenReady.invocations.forEach(invocation => invocation(WhenReady.Scope));
    initDynamics();
  });
  On('hashchange', initDynamics);
})();
