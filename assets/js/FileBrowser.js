"use strict";

WhenReady(Scope => {

  function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    let k = 1000;
    let dm = decimals + 1 || 3;
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
  }

  Scope.DirectoryObject = {
    Directory: './'
  };
  var FileListElement = $('.filelist');

  Scope.GetFileList = dir => {
    http.get('/files/?dir=' + dir, res => {
      if (res !== "Invalid Directory") {
        let FileList = JSON.parse(res);
        FileListElement.innerHTML = "";
        FileList.forEach(File => {
          let FileNameNoSpace = File.Name.replace(/ /g, "~!");
          if (File.IsDir !== true) {
            let FileSizeFormatted = formatBytes(File.Size);
            FileListElement.innerHTML += `
             <div>
             <span onclick="window.open('/getfile/?dir=${Scope.DirectoryObject.Directory}/${FileNameNoSpace}');"> ${File.Name} </span><span> ${FileSizeFormatted}</span>
             </div>
           `;
          } else {
            FileListElement.innerHTML += `
            <div class="dirdiv">
             <span onclick="WhenReady.Scope.DirectoryObject.Directory = '${Scope.DirectoryObject.Directory + "/" + FileNameNoSpace}'" class='dir'> ${File.Name}</span>
            </div>
          `;
          }
        });
      }
    });
  };

  Scope.GoBack = () => {
    let PathParts = Scope.DirectoryObject.Directory.split('/');
    Scope.DirectoryObject.Forward = PathParts[PathParts.length - 1];
    PathParts.pop(PathParts[PathParts.length - 1]);
    Scope.DirectoryObject.Directory = PathParts.join('/');
  };
  Scope.GoForward = () => {
    if (Craft.isDefined(Scope.DirectoryObject.Forward) && Craft.isntNull(Scope.DirectoryObject.Forward) && Scope.DirectoryObject.Forward !== Scope.DirectoryObject.Directory) {
      Scope.DirectoryObject.Directory = Scope.DirectoryObject.Directory + "/" + Scope.DirectoryObject.Forward;
    }
  };

  Scope.GetFileList(Scope.DirectoryObject.Directory);

  Object.observe(Scope.DirectoryObject, changes => {
    changes.forEach(change => {
      if (change.name === "Directory" && Craft.isDefined(change.oldValue) || Craft.isntNull(change.oldValue)) $('.search-bar > input').value = Scope.DirectoryObject.Directory;
    });
    Scope.GetFileList(Scope.DirectoryObject.Directory);
  }, ["update"]);

  $('.search-bar > input').On('input', ev => Scope.DirectoryObject.Directory = ev.target.value);
  $('.search-bar > span').On('click', e => $('.search-bar > input').value = "");



});
