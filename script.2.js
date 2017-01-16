/*
 Firebase Authentication Working Example, JavaScript, CSS, and HTML crafted with love and lots of coffee.
 (c) 2016, Ron Royston, MIT License
 https://rack.pub
 
 1. ...........................................................INITIALIZE SCRIPT
    DOMContentLoaded TRIGGER
 2. ...................................................................VARIABLES
    
 3. .............................................................INITIALIZE PAGE
    ADD EVENT LISTENERS

 4. ............................................................FIREBASE METHODS
    INITIALIZE FIREBASE WEB APP
    FIREBASE AUTH STATE CHANGE METHOD
 5. ...................................................................FUNCTIONS
    ACCOUNT PAGE
    ACK / EMAIL ACTION HANDLER PAGE
    LOGIN PAGE
    PUBLIC PAGE 
    SHARED
 6. ............................................................REVEALED METHODS
    ADD NODES WITH DATA TO REALTIME DATABASE
*/


// INITIALIZE SCRIPT
document.addEventListener('DOMContentLoaded', function() {
  
  // VARIABLES
  var doc = document;
  
  var credentials = [];
  var devices = [];
  var cards = doc.getElementsByClassName('mdl-card');
  var layout = doc.querySelector('.mdl-layout');

  //Unsupported Card
  var unsupportedCard = doc.getElementById('unsupported-card');

  //Intro Card
  var introCard = doc.getElementById('intro-card');
  var introCardShowCredentialCardButton = doc.getElementById('show-credential-card');
  var introCardShowDeviceCardButton = doc.getElementById('show-device-card');
  
  //Credential Card
  var credentialCard = doc.getElementById('credential-card');
  var credentialCardIdInput = doc.getElementById('credential-id');
  var credentialCardUsernameInput = doc.getElementById('username');
  var credentialCardPasswordInput = doc.getElementById('password');
  var credentialCardCancelButton = doc.getElementById('credential-cancel');
  var credentialCardSaveButton = doc.getElementById('credential-save');
  
  //Device Card
  var deviceCard = doc.getElementById('device-card');
  var deviceCardIdInput = doc.getElementById('device-id');
  var deviceCardAddressInput = doc.getElementById('device-address');
  var deviceCardCredentialsCheckbox = doc.getElementById('credentials-checkbox');
  var deviceCardCredentialsSelect = doc.getElementById('credentials-select');
  
  var deviceCardCancelButton = doc.getElementById('cancel-device');
  var deviceCardSaveButton = doc.getElementById('device-save');

  //Nav Menu
  var drawer = doc.getElementsByClassName('mdl-layout__drawer')[0];
  var navLinks = drawer.getElementsByClassName('mdl-navigation')[0];
  var navMenuCredentials = doc.getElementById('nav-menu-credentials');
  var navMenuCredentialsPanel = doc.getElementById('nav-menu-credentials-panel');
  var navMenuAddCredential = doc.getElementById('nav-menu-add-credential');
  var navMenuDevices = doc.getElementById('nav-menu-devices');
  var navMenuDevicesPanel = doc.getElementById('nav-menu-devices-panel');
  var navMenuAddDevice = doc.getElementById('nav-menu-add-device');
  
  // INITIALIZE PAGE
  if(ls == false){
    // if browser does not support html5 local storage alert user and stop
    showUnsupportedCard();
  } else {
    try {
      var devicesString = localStorage.getItem('devices');
      if(devicesString !== null){
        devices = JSON.parse(devicesString);
        devices.forEach(function (arrayItem){
          if (arrayItem.id){
            navMenuAdd('device',arrayItem.id);
          }
        });
      } else {
        // no devices are configured show intro card
        console.log(devices);
        showIntroCard();
      }
    } catch(e) {
      console.log('error is ' + e);
    }
    // LOAD CREDENTIALS
    try {
      var credentialsString = localStorage.getItem('credentials');
      if(credentialsString !== null){
        credentials = JSON.parse(credentialsString);
        credentials.forEach(function (arrayItem){
          if (arrayItem.id){
            // add credential to nav menu
            navMenuAdd('credential',arrayItem.id);
            //add credential to select
            var opt = document.createElement('option');
            opt.value = arrayItem.id;
            opt.innerHTML = arrayItem.id;
            deviceCardCredentialsSelect.appendChild(opt);
          }
        });
      }
    } catch(e) {
      console.log('error is ' + e);
    }
  }
  
  // ----------------------------------------------------------
  var card1 = doc.getElementById('card1');
  card1.style.display = "inline";
  
  function hideCards(){
    for (var i = 0, l = cards.length; i < l; i++) {
      cards[i].style.display = 'none';
    }    
  }
  
  function navMenuAdd(type,text){
    var newAnchor = doc.createElement("anchor");
    newAnchor.classList.add('mdl-navigation__link');
    newAnchor.classList.add(type);
    newAnchor.href = "javascript:void(0)";
    var anchorContent = doc.createTextNode(text);
    newAnchor.appendChild(anchorContent);
    newAnchor.addEventListener('click', navMenuClickHandler, false);
    //newAnchor.style.display = 'none';
    if (type === 'credential'){
      //insertAfter(newAnchor, navMenuCredentials);
      navMenuCredentialsPanel.appendChild(newAnchor);
    } else if (type === 'device'){
      //insertAfter(newAnchor, navMenuDevices);
      navMenuDevicesPanel.appendChild(newAnchor);
    }
  }
  
  //Use this to layout if only a single card
  function makeMdlSpacer(){
    //<div class="mdl-layout-spacer"></div>
    var newMdlSpacer = doc.createElement("div");
    newMdlSpacer.classList.add('mdl-layout-spacer');
    return newMdlSpacer;
  }
  
  function navMenuClickHandler(element){
    alert(this.innerHTML);
  }
  
  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  navMenuAddCredential.addEventListener("click", function(){
    layout.MaterialLayout.toggleDrawer();
    showCredentialCard();
  });
  
  navMenuAddDevice.addEventListener("click", function(){
    layout.MaterialLayout.toggleDrawer();
    showDeviceCard();
  });
  
  introCardShowDeviceCardButton.addEventListener("click", function(){
    showDeviceCard();
  });

  introCardShowCredentialCardButton.addEventListener("click", function(){
    showCredentialCard();
  });
  
  deviceCardCancelButton.addEventListener("click", function(){
    // if no devices show intro card; else show guage adder
    if(devices[0] !== undefined){
      //show guage card
      hideCards();
    } else {
      // show intro card
      showIntroCard();
    }
  });
  
  deviceCardCredentialsSelect.addEventListener("click", function(e){
    this.classList.add('active');
  });
  
  deviceCardCredentialsCheckbox.addEventListener("click", function(e){
    if (this.checked){
      deviceCardCredentialsSelect.disabled = false;
      deviceCardCredentialsSelect.classList.add('active');      
    } else {
      deviceCardCredentialsSelect.selectedIndex = 0;
      deviceCardCredentialsSelect.disabled = true;
      deviceCardCredentialsSelect.classList.remove('active');      
    }
  });
  
  credentialCardCancelButton.addEventListener("click", function(){
    credentialCardIdInput.value = '';
    credentialCardUsernameInput.value = '';
    credentialCardPasswordInput.value = '';
    mdlCleanUp();
    // if no devices show intro card; else show guage adder
    if(devices[0] !== undefined){
      //show guage card
      hideCards();
    } else {
      showIntroCard();
    }
  });
  
  credentialCardSaveButton.addEventListener("click", function(){
    console.log('credential save clicked');
    //get the input values
    var id = credentialCardIdInput.value;
    var username = credentialCardUsernameInput.value;
    var password = credentialCardPasswordInput.value;
    //test for duplicates
    if (credentials !== null && credentials.length > 0) {
      if (duplicate(id, credentials) === true){
        intrest.toast('Error: Credential ' + id + ' already exists.');
        return;
      }
    }
    //push object to credentials array
    try {
      credentials.push(new Credential(id,username,password));
      console.log('creds should have been pushed');
    } catch(e) {
      intrest.toast('Error: Failed Adding Credential ' + id + '.');
      return;
    }
    //save to local storage
    try {
      localStorage.setItem('credentials', JSON.stringify(credentials));
      intrest.toast('Credential ' + id + ' saved to localStorage.');
    } catch(e) {
      intrest.toast('Error: Failed storing credential ' + id + '.');
      return;
    }
    // add credential to nav menu
    navMenuAdd('credential',id);
    //add credential to select
    var opt = document.createElement('option');
    opt.value = id;
    opt.innerHTML = id;
    deviceCardCredentialsSelect.appendChild(opt);
  });
  
  deviceCardSaveButton.addEventListener("click", function(){
    //get the input values
    var id = deviceCardIdInput.value;
    var address = deviceCardAddressInput.value;
    var basicAuthentication = false;
    var credentialId = '';
    
    if (deviceCardCredentialsCheckbox.checked){
      try {
        basicAuthentication = true;
        credentialId = deviceCardCredentialsSelect.value;
      } catch(e) {
        intrest.toast('Error: Failed adding device ' + id + '.');
        return;
      }
    }
    
    //test for duplicates
    if (devices !== null && devices.length > 0) {
      if (duplicate(id, devices) === true){
        intrest.toast('Error: Devices ' + id + ' already exists.');
        return;
      }
    }
    
    //push object to devices array
    try {
      devices.push(new Device(id,address,basicAuthentication,credentialId));
    } catch(e) {
      intrest.toast('Error: Failed adding device ' + id + '.');
      return;
    }
    
    //save to local storage
    try {
      localStorage.setItem('devices', JSON.stringify(devices));
      intrest.toast('Device ' + id + ' saved to localStorage.');
    } catch(e) {
      intrest.toast('Error: Failed storing device ' + id + '.');
      return;
    }
    // add device to nav menu
    navMenuAdd('device',id);
  });
  
  function showIntroCard(){
    introCard.style.display = "inline";
    deviceCard.style.display = "none";
    credentialCard.style.display = "none";
    unsupportedCard.style.display = "none";
  }
  
  function showCredentialCard(){
    introCard.style.display = "none";
    deviceCard.style.display = "none";
    credentialCard.style.display = "inline";
    unsupportedCard.style.display = "none";
  }

  function showDeviceCard(){
    introCard.style.display = "none";
    deviceCard.style.display = "inline";
    credentialCard.style.display = "none";
    unsupportedCard.style.display = "none";
  }

  function showUnsupportedCard(){
    introCard.style.display = "none";
    deviceCard.style.display = "none";
    credentialCard.style.display = "none";
    unsupportedCard.style.display = "inline";
  }
  
  // Object Constructor Functions
  function Credential(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password;
  }  
    
  function Device(id, address, basicAuthentication, credentialId) {
    this.id = id;
    this.address = address;
    this.basicAuthentication = basicAuthentication;
    this.credential = credentialId;
  }
  


  /*
  
  EVENT LISTENERS
  
  */
  
  //ACCOUNT PAGE

  //enable pressing enter
  // if(newEmailInputMdlTextfield){
  //   newEmailInputMdlTextfield.addEventListener("keyup", function(e) {
  //     e.preventDefault();
  //     if (e.keyCode == 13) {
  //       newEmailSubmitButton.click();
  //     }
  //   });
  // }


  function getArg(param) {
    var vars = {};
    window.location.href.replace( location.hash, '' ).replace( 
      /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
      function( m, key, value ) { // callback
        vars[key] = value !== undefined ? value : '';
      }
    );
    if ( param ) {
      return vars[param] ? vars[param] : null;	
    }
    return vars;
  }


  function addPrivateLinkToDrawer(){
    if(!doc.getElementById('private-link')){
      var icon = doc.createElement("i");
      var iconText = doc.createTextNode('lock_outline');
      var anchorText = doc.createTextNode(' Private');
      icon.classList.add('material-icons');
      icon.appendChild(iconText);
      
      var privateLink = doc.createElement("a");
      privateLink.classList.add('mdl-navigation__link');
      privateLink.href = "../intrest/private";
      privateLink.id = "private-link";
      privateLink.appendChild(icon);
      privateLink.appendChild(anchorText);
      
      var anchorList = navLinks.getElementsByClassName('mdl-navigation__link')[1];
      navLinks.insertBefore(privateLink, anchorList);
    }
  }

  function removePrivateLinkFromDrawer(){
    var linkToRemove = doc.getElementById('private-link');
    if(linkToRemove){
      linkToRemove.parentNode.removeChild(linkToRemove);
    }
  }
  
  function redirect(path){
    //console.log('redirect ran with path = ' + path);
    var baseURL = window.location.protocol + '//' + window.location.host + '/firebase-auth';
    var hasSlash = path.charAt(0) == '/';

    if(!hasSlash){
      path = '/' + path;
    }
    //console.log ('hasSlash = ' + hasSlash + ', and path = ' + path);
    //console.log(baseURL + path); // https://rack.pub/firebase-authhttps://rack.pub/firebase-auth
    var onThisPage = (window.location.href.indexOf(baseURL + path) > -1);
    
    if (!onThisPage) {
      //redirect them to login page for message
       location = baseURL + path;
    }
  }
  
  //else display Add New Card
    // options full or third width card
    // type of display - guage, bar, table
    // data to fetch  


  //LOCAL STORAGE TEST
  var ls =  {
    get: function () { 
      var test = 'test';
      try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch(e) {
        return false;
      }
    }
  };

  function duplicate(id,obj){
    var result = false;
    obj.forEach( function (arrayItem){
        if (arrayItem.id == id){
          result = true;
        }
    }); 
    return result;
  }
  
  //MDL Text Input Cleanup
  function mdlCleanUp(){
    var mdlInputs = doc.querySelectorAll('.mdl-js-textfield');
    for (var i = 0, l = mdlInputs.length; i < l; i++) {
      mdlInputs[i].MaterialTextfield.checkDirty();
    }  
  }
  
  //Setup Nav Menu Accordian
  var acc = document.getElementsByClassName("accordion");
  var i;
  
  for (i = 0; i < acc.length; i++) {
      acc[i].onclick = function(){
          this.classList.toggle("active");
          this.nextElementSibling.classList.toggle("show");
    }
  }

  // END
}, false);






/*

REVEALED METHODS

*/

//REVEALED METHODS
var intrest = (function() {
  window.snackbarContainer = document.querySelector('#toast');
  var pub = {};
  
  //intrest.toast
  pub.toast = function(msg,timeout){
    if(!timeout){timeout = 2750}
    var data = {
      message: msg,
      timeout: timeout
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
  };
  
  
// function loadDoc() {
//   var xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//     document.getElementById("demo").innerHTML = this.responseText;
//     }
//   };
//   xhttp.open("GET", "ajax_info.txt", true);
//   xhttp.send();
// }  
  
  function getToken(host, port, auth){
    var address = 'https://' + host + ':' + port + '/api/v1/auth/token-services';
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", address, true);
      //xhr.withCredentials = true;
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader ("Authorization", "Basic " + window.btoa(auth.username + ":" + auth.password));
      xhr.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
      
      xhr.onload = function() {
        var status = xhr.status;
        if (status == 200 || status == 201 || status == 202) {
          resolve(xhr.response);
        }
        else {
          reject(status);
        }
      };
      xhr.send();
    });
  }
  
  function httpReq(method, host, port, path, auth) {
    if(method === "DELETE" || method === "GET"|| method === "POST" || method === "PUT" ){
      var address = 'https://' + host + port + path;
      if(auth.token !== '' && auth.expiration < clock.now){
        return new Promise(function(resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open(method, address, true);
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader ("X-auth-token", auth.token);
          xhr.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
          xhr.onload = function() {
            var status = xhr.status;
            if (status == 200 || status == 201 || status == 202) {
              resolve(xhr.response);
            }
            else {
              reject(status);
            }
          };
          xhr.send();
        });        
      } else {
        // Token is expired or null
        return new Promise(function(resolve, reject) {
          var xhr = new XMLHttpRequest();
          
          xhr.open(method, address, true);
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader ("Authorization", "Basic " + window.btoa("cisco:cisco"));
          xhr.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
          
          //X-auth-token: "12a23bc"
          
          xhr.onload = function() {
            var status = xhr.status;
            if (status == 200 || status == 201 || status == 202) {
              resolve(xhr.response);
            }
            else {
              reject(status);
            }
          };
          xhr.send();
        }); 
        
      }
    } else {
      console.log('invalid method');
    }
  };
  
  function valid(method, address, path, auth){
    var isValid = false;
    
    if(method === "DELETE" || method === "GET"|| method === "POST" || method === "PUT" ){
    
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
    
    } else {
      
    }
    return isValid;
  }
  
  // pub.in = function(method, address, path, auth){
  //   //auth = JSON.parse(auth);
  //   console.log('method is ' + method);
  //   console.log('address is ' + address);
  //   console.log('path is ' + path);
  //   console.log('username is ' + auth.username);
  //   console.log('password is ' + auth.password);
  //   console.log('token is ' + auth.token);
    
  // }
  
  
  pub.test = function(){
    httpReq().then(function(data) {
      console.log(data);
    }, function(status) {
      console.log(status);
    }); 
  }
  
  
  function myRestCall(method, host, port, path, auth){
    //auth is {username:'joe', password:'abc123', token:null, expiration:null}

    if(auth.expiration < clock.now){
      console.log('we have a good token: ' + auth.token + ', which expires ' + auth.expiration);
      //so let's GET a resource now
      httpReq(method, host, port, path, auth).then(function(data) {
        console.log(data);
      }, function(status) {
        console.log(status);
      });
    } else {
      
      
      // we don't have a good token so we need to get one first, then GET the resource.
      getToken(host, port, auth).then(function(data) {
        if(auth.token !== '' && auth.expiration < clock.now){
          console.log('we have a good token: ' + auth.token + ', which expires ' + auth.expiration);
          httpReq(method, host, port, path, auth).then(function(data) {
            console.log(data);
          }, function(status) {
            console.log(status);
          });
        }
        
      }, function(status) {
        console.log(status);
      });
      
// getToken(host, port, auth)
//   .then(function(token) { return httpReq(method, host, post, path, token); })
//   .then(function(data) { return console.log(data); }) // not strictly necessary. But
//                                                       // strictly equivalent to above
//   .catch(function(err) { return console.log(err); });      
      
getToken(host, port, auth)
  .then(function(token) { return httpReq(method, host, post, path, token); })
  .then(function(data) { return console.log(data); }) // not strictly necessary. But
                                                      // strictly equivalent to above
  .catch(function(err) { return console.log(err); });  
  
    }
  }
  
  
asyncFunc1()
.then(result1 => {
    // Use result1
    return asyncFunction2(); // (A)
})
.then(result2 => { // (B)
    // Use result2
})
.catch(error => {
    // Handle errors of asyncFunc1() and asyncFunc2()
});  

// getJSON('story.json').then(function(story) {
//   return getJSON(story.chapterUrls[0]);
// }).then(function(chapter1) {
//   console.log("Got chapter 1!", chapter1);
// }) 

  //API
  return pub;
}());