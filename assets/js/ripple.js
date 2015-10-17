"use strict";

  function Ripple(SelectorOrNode, options) {
      var color = options.color || undefined;
      var timing = options.timing || 1000;
      if(typeof SelectorOrNode === "string") SelectorOrNode = document.querySelectorAll(SelectorOrNode);
      if(SelectorOrNode instanceof Node) SelectorOrNode = [SelectorOrNode];
      function MakeCircle(element, color, timing, event) {
       var circle = document.createElement('div');
       var Dimentions = element.getBoundingClientRect();
       var diameter = Math.max(Dimentions.width, Dimentions.height);
       var x = event.clientX - Dimentions.left - (diameter / 2);
       var y = event.clientY - Dimentions.top - (diameter / 2);
       circle.classList.add('circle');
       circle.style.width = diameter + "px";
       circle.style.height = diameter + "px";
       circle.style.top = y + "px";
       circle.style.left = x + "px";
       if (color !== undefined) circle.style.backgroundColor = color;
       circle.style.animation = "ripple " + timing + "ms ease";
       //element.appendChild(circle);
       element.insertBefore(circle, element.firstChild);
       if (circle !== undefined) {
         setTimeout(function (){
           circle.remove();
         }, timing);
       }
      }
      [].forEach.call(SelectorOrNode, function(element) {
        if (element.getAttribute("ripple") !== null && element.getAttribute("ripple") !== "") {
          color = element.getAttribute("ripple");
        }
        element.onmousedown = function(e) {
          MakeCircle(element, color, timing, e);
        };
        element.onmouseup = function(e) {
          [].forEach.call(element.querySelectorAll('.circle'), function(Childcircle) {
            if (Childcircle !== undefined) {
              setTimeout(() => {
                Childcircle.remove();
              }, timing);
            }
          });
        };

      });
    };

  var CircleStyle = document.createElement('style');
  CircleStyle.innerHTML = `
    .circle {
      display: block;
      position: absolute;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
      background: hsl(180, 40%, 80%);
      border-radius: 100%;
      transform: scale(0);
      z-index: 0;
    }

    @keyframes ripple {
      100% {
        opacity: 0;
        transform: scale(2.5);
      }
    }`;
  document.head.appendChild(CircleStyle);
  window.addEventListener('DOMContentLoaded', function (e) {
    [].forEach.call(document.querySelectorAll('[ripple]'),function (element) {
      Ripple(element,{});
    });
    window.addEventListener('hashchange', (e) => {
      [].forEach.call(document.querySelectorAll('[ripple]'),function (element) {
        Ripple(element,{});
      });
    });
  });
