"use strict";

var http = {
  get: function (url, data, callback, headers,verbose) {
    if (url === undefined) return console.error('URL undefined');
    if (typeof arguments[1] === "function") callback = arguments[1];
    let Req = new XMLHttpRequest(),
    SendData = (data !== undefined && typeof data !== "function") ? url + http.serialiseObject(data) : url;
    Req.open('GET', SendData);
    if (headers !== undefined) {
      headers.forEach(header => {
        Req.setRequestHeader(header.headertype, header.content);
      });
    }
    let progress = {
      percentage : 0,
      Event : null
    };
    Req.onprogress = e => {
      if (e.lengthComputable) {
        progress.percentage =  Math.round(e.loaded / e.total * 100);
      } else {
        progress.percentage = NaN;
        if(verbose) console.warn("Can't get percentage for this URL , most likely missing Content-length header");
      }
      progress.Event = e;
    };
    let response;
    Req.onreadystatechange = () => {
      if (Req.readyState == 4 && Req.status == 200) {
         response = ('response' in Req) ? Req.response : Req.responseText;
        if (typeof callback == "function") {
          callback(response);
        }
      }
    };
    let httpinterface = {
      progress :  callback => {
        if(callback !== undefined && typeof callback === "function") Object.observe(progress,ch => callback(progress.percentage,progress.Event));
      }
    };
    Req.send();
    return httpinterface;
  },
  post: function (url, data, callback, headers, isFormData) {
    if (url == undefined) return console.error("URL undefined");
    if (data == undefined) return console.error("can't send nothing");
    if (arguments.length === 4 && headers instanceof Array === false) isFormData = arguments[3];
    let Req = new XMLHttpRequest();
    Req.open("POST", url, true);
    if (headers !== undefined) {
      headers.forEach(header => {
        Req.setRequestHeader(header.headertype, header.content);
      });
    }
    if (isFormData) Req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    Req.onreadystatechange = () => {
      if (Req.readyState == 4 && Req.status == 200) {
        let response = ('response' in Req) ? Req.response : Req.responseText;
        if (callback) {
          callback(response);
        } else {
          console.error('No Callback Found');
        }
      }
    }
    isFormData ? Req.send(http.serialiseObject(data)) : Req.send(data);
  },
  serialiseObject: function(obj) {
    let pairs = [];
    for (let prop in obj) {
      if (!obj.hasOwnProperty(prop)) continue;
      if (Object.prototype.toString.call(obj[prop]) == '[object Object]' && obj[prop] !== null) {
        pairs.push(this.serialiseObject(obj[prop]));
        continue;
      }
      if (obj[prop] !== null) pairs.push(prop + '=' + obj[prop]);
    }
    return pairs.join('&');
  }
}
