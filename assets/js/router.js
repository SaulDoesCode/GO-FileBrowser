var router = {
  handle: (RouteLink, callback) => {
    if (window.location.hash === RouteLink || window.location === RouteLink) callback();
    router.handlers.push({
      link: RouteLink,
      callback: callback
    });
  },
  handlers: [],
  links : [],
  makeLink: (Selector, link, newtab,eventType) => {
    router.links.push(() => {
      if(eventType === undefined) eventType = 'click';
      document.querySelector(Selector).addEventListener(eventType, e => {
        router.openLink(link,newtab);
      });
    });
  },
  openLink : (link,newtab) => newtab ? window.open(link) : window.location = link,
  setTitle: title => document.title = title ,
  setView: (viewHostSelector, view) => {
    document.body.querySelector(viewHostSelector).innerHTML = view;
  }
};

(() => {
  window.addEventListener('hashchange', e => {
    router.handlers.forEach(handler => {
      if (window.location.hash === handler.link || window.location === handler.link) {
        handler.callback();
      }
    });
  });
  window.addEventListener('load', e => {
    Array.from(document.querySelectorAll('[link]')).forEach((linkelement) => {
      linkelement.addEventListener('click', e => {
        if(linkelement.hasAttribute('newtab')) {
           window.open(linkelement.getAttribute('link'));
        } else {
            window.location = linkelement.getAttribute('link');
        }
      });
    });
    router.links.forEach(link => {
      link();
    });
  });
})();
