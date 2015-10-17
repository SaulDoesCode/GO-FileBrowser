# GO-FileBrowser
Web File Browser with Golang back-end , front-end logic written in ECMASCRIPT 6 with Web Components

#### Golang backend 
  reads info about files and send a json response  
  handles requests to download any file on the system  

#### Front-End
  pure JS no frameworks other than inhouse Crafter.js  
  built using some parts of my Crafter.js toolkit  
  all written in ES6 , makes use of Object.observe  

#### Polyfills
  I included polyfills for Object.observe , Webcomponents , Array.from
  
### Supported Browsers
  Chrome 43+  
  Opera 32+  
  
  Can work on firefox 40+ - if you change all the html script tags' type to type="text/javascript;version=1.7"