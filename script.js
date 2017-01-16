/*
 IntREST: JavaScript, CSS, and HTML crafted with love and lots of coffee.
 (c) 2017, Ron Royston, MIT License
 https://rack.pub
*/

document.addEventListener('DOMContentLoaded', function() {
  
  // VARIABLES
  var doc = document;

  window.snackbarContainer = doc.querySelector('#toast');
  var dialog = doc.querySelector('dialog');
  dialogPolyfill.registerDialog(dialog);
  
  var credentials = [];
  var devices = [];
  var cards = doc.getElementsByClassName('mdl-card');
  var layout = doc.querySelector('.mdl-layout');
  
  var dialogConfirmText = doc.getElementById('dialog-confirm-text');
  //var dialogCancelButton = doc.getElementById('dialog-cancel');
  //var dialogOkButton = doc.getElementById('dialog-ok');

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
  var navMenuAddCredentialButton = doc.getElementById('nav-menu-add-credential-button');
  var navMenuDevices = doc.getElementById('nav-menu-devices');
  var navMenuDevicesPanel = doc.getElementById('nav-menu-devices-panel');
  var navMenuAddDeviceButton = doc.getElementById('nav-menu-add-device-button');
  
  var endpointCards = doc.getElementsByClassName('endpoint-card');
  var endpointCardsSliders = doc.getElementsByClassName('mdl-slider');
  var pollingMinutesSpans = doc.getElementsByClassName('polling-minutes-span');
  
  var configurationCards = doc.getElementsByClassName('configuration-card');
  
  var testButton = doc.getElementById('test-button');
  
  initializePage();
  
  initializeEndpointCards();
  
  function initializePage (){
    // INITIALIZE PAGE
    if(ls == false){
      // if browser does not support html5 local storage alert user and stop
      showUnsupportedCard();
    } else {
      try {
        var devicesString = localStorage.getItem('devices');
        if (devicesString === null){
          devicesString = '';
        }
        if(devicesString.length > 2){
          devices = JSON.parse(devicesString);
          devices.forEach(function (arrayItem){
            if (arrayItem.id){
              navMenuAdd('device',arrayItem.id);
            }
          });
        } else {
          // no devices are configured show intro card
          showIntroCard();
        }
      } catch(e) {
        console.log('error is ' + e);
      }
      // LOAD CREDENTIALS
      try {
        var credentialsString = localStorage.getItem('credentials');
        if (credentialsString === null){
          credentialsString = '';
        }
        if(credentialsString.length > 2){
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
      
      //Setup Nav Menu Accordian
      var acc = document.getElementsByClassName("accordion");
      
      try {
        for (var i = 0; i < acc.length; i++) {
          acc[i].onclick = function(){
            this.classList.toggle("active");
            this.nextElementSibling.classList.toggle("show");
          };
        }
      } catch(e) {
        console.log('error is ' + e);
      }
    }
  }
  
  
  // ---------------------------------------------------------- *******************************************************************************
  var card1 = doc.getElementById('card1');
  card1.style.display = "inline";
  
  
  function navMenuAdd(type,id){
    
    var newOuterDiv = doc.createElement('div');
    newOuterDiv.classList.add('mdl-navigation__link',type);
    
    var newSpan = doc.createElement('span');
    var spanContent = doc.createTextNode(id);
    
    var newDiv = doc.createElement('div');
    newDiv.classList.add('float-right');
    
    var newButton = doc.createElement('button');
    newButton.classList.add('mdl-button','mdl-js-button','mdl-button--icon','mdl-color-text--red-A700','nav-delete-button');
    newButton.addEventListener('click', navMenuDeleteHandler, false);
    
    var newIcon = doc.createElement('i');
    var newIconText = doc.createTextNode('delete');
    newIcon.classList.add('material-icons','delete-icon');
    
    newIcon.appendChild(newIconText);
    newSpan.appendChild(spanContent);
    newDiv.appendChild(newButton);
    newButton.appendChild(newIcon);
    newOuterDiv.appendChild(newSpan);
    newOuterDiv.appendChild(newDiv);
    newOuterDiv.addEventListener('click', navMenuClickHandler, false);
    
    if (type === 'credential'){
      navMenuCredentialsPanel.appendChild(newOuterDiv);
    } else if (type === 'device'){
      navMenuDevicesPanel.appendChild(newOuterDiv);
    }
  }
  
  function navMenuDeleteHandler(){
    var grandparent = this.parentElement.parentElement;
    var id = this.parentElement.previousSibling.innerHTML;
    var obj = {};
    if(grandparent.classList.contains('credential')){
      //deleteObject('credential',id);
      obj = getCredentialObject(id);
      dialogConfirm(obj,{action:'delete'});
    } else if (grandparent.classList.contains('device')){
      //deleteObject('device',id);
      obj = getDeviceObject(id);
      dialogConfirm(obj,{action:'delete'});
    }
  }
  
  function deleteObject(type, id){
    var obj = {};
    if (type === 'credential'){
      obj = credentials;
      deleteThis(obj);
      //save credentials array to local storage
      try {
        localStorage.setItem('credentials', JSON.stringify(credentials));
        toast('Credential ' + id + ' deleted.');
      } catch(e) {
        console.log(e);
      }
    } else if (type === 'device'){
      obj = devices;
      deleteThis(obj);
      //save devices array to local storage
      try {
        localStorage.setItem('devices', JSON.stringify(devices));
        toast('Device ' + id + ' deleted.');
      } catch(e) {
        console.log(e);
      }
    }
    deleteNavMenuItem(id,type);
    function deleteThis(o){
      try {
        for (var i=0, iLen=o.length; i<iLen; i++) {
          if (o[i].id === id){
            o.splice(i,1);
          }
        }
      } catch(e) {
        console.log(e);
      }
    }
  }
  
  function deleteNavMenuItem(id,type){
    try {
      var items = doc.getElementsByClassName(type);
      for (i = 0; i < items.length; i++) {
        if(items[i].firstChild.innerHTML === id){
          items[i].parentElement.removeChild(items[i]);
        }
      }
    } catch(e) {
      console.log(e);
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
    //we need to clear all cards, look in classlist for which thing
    hideEndpointsCards();
    
    if(this.classList.contains("credential")){
      var credential = getCredentialObject(this.firstElementChild.innerHTML);
      showCredentialCard();
      credentialCardIdInput.value = credential.id;
      credentialCardUsernameInput.value = credential.username;
      credentialCardPasswordInput.value = credential.password;     
      //mdlCleanUp();
    } else if (this.classList.contains("device")){
      var device = getDeviceObject(this.firstElementChild.innerHTML);
      showDeviceCard();
      deviceCardIdInput.value = device.id;
      deviceCardAddressInput.value = device.address;
      deviceCardCredentialsSelect.selected = device.credentialId;  
    }
    //Clean up the js text fields
    mdlCleanUp();
    //Close the drawer
    layout.MaterialLayout.toggleDrawer();
  }
  
  endpointCardsSliders[0].addEventListener("input", function(){
    pollingMinutesSpans[0].innerHTML = this.value;
  });

  function initializeEndpointCards(){

    google.charts.load('current', {
      'packages': ['gauge','line']
    });
    google.charts.setOnLoadCallback(drawGuage);
    google.charts.setOnLoadCallback(drawChart);
        
    function drawGuage() {
          
      var data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Memory', 80],
        ['CPU', 55],
        ['Network', 68]
      ]);
      
      var guageOptions = {
        //width: '100%',
        height: 120,
        redFrom: 90,
        redTo: 100,
        yellowFrom: 75,
        yellowTo: 90,
        minorTicks: 5
      };
      
      var guage = new google.visualization.Gauge(document.getElementById('guage-div'));
      google.visualization.events.addListener(guage, 'ready', resetTableStyle);
      
      guage.draw(data, guageOptions);
      
      function resetTableStyle(){
        var myDiv = document.getElementById('guage-div');
        var myTable = myDiv.getElementsByTagName('table')[0];
        myTable.style.margin = 'auto';
      }
    }
    
    function drawChart() {
      
      var data = new google.visualization.DataTable();
      data.addColumn('number', 'Day');
      data.addColumn('number', 'Guardians of the Galaxy');
      data.addColumn('number', 'The Avengers');
      data.addColumn('number', 'Transformers: Age of Extinction');
      
      data.addRows([
        [1, 37.8, 80.8, 41.8],
        [2, 30.9, 69.5, 32.4],
        [3, 25.4, 57, 25.7],
        [4, 11.7, 18.8, 10.5],
        [5, 11.9, 17.6, 10.4],
        [6, 8.8, 13.6, 7.7],
        [7, 7.6, 12.3, 9.6],
        [8, 12.3, 29.2, 10.6],
        [9, 16.9, 42.9, 14.8],
        [10, 12.8, 30.9, 11.6],
        [11, 5.3, 7.9, 4.7],
        [12, 6.6, 8.4, 5.2],
        [13, 4.8, 6.3, 3.6],
        [14, 4.2, 6.2, 3.4]
      ]);
      
      var options = {
        // chart: {
        //     title: 'Box Office Earnings in First Two Weeks of Opening',
        //     subtitle: 'in millions of dollars (USD)',
        // },
        legend : { position:"none"},
        width: 400,
        height: 300
      };
      
      var chart = new google.charts.Line(document.getElementById('chart-div'));
      google.visualization.events.addListener(chart, 'ready', resetChartDivStyle);
      
      chart.draw(data, options);
      
      function resetChartDivStyle(){
        var chartDiv = document.getElementById('chart-div');
        var targetDiv = chartDiv.getElementsByTagName('div')[0];
        targetDiv.style.margin = 'auto';
      }
    }
  }  

  navMenuAddCredentialButton.addEventListener("click", function(){
    layout.MaterialLayout.toggleDrawer();
    showCredentialCard();
  });
  
  navMenuAddDeviceButton.addEventListener("click", function(){
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
    deviceCardIdInput.value = '';
    deviceCardAddressInput.value = '';
    credentialCardPasswordInput.value = '';
    mdlCleanUp();
    deviceCardSaveButton.disabled = true;
    // if no devices show intro card; else show guage adder
    if(devices[0] !== undefined){
      hideConfigurationCards();
      showEndpointCards();
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
    credentialCardSaveButton.disabled = true;
    // show endpoint cards : if no devices show intro card
    if(devices[0] !== undefined){
      hideConfigurationCards();
      showEndpointCards();
    } else {
      showIntroCard();
    }
  });

  // function check(input) {
  //   if (input.value != registrationInputPassword.value) {
  //     input.setCustomValidity('Passwords Must Match');
  //     submitButton.disabled = true;
  //   } else {
  //     // VALID INPUT - RESET ERROR MESSAGE
  //     input.setCustomValidity('');
  //     submitButton.disabled = false;
  //   }
  // }
  
  credentialCardSaveButton.addEventListener("click", function(){
    //get the input values
    var id = credentialCardIdInput.value;
    var username = credentialCardUsernameInput.value;
    var password = credentialCardPasswordInput.value;
    
    var newValues = {};
    newValues.id = id;
    newValues.username = username;
    newValues.password = password;
    newValues.type = 'credential';
    
    //test for duplicates
    if (credentials !== null && credentials.length > 0) {
      if (duplicate(id, credentials) === true){
        dialogConfirm(newValues,{action:'update'});
        return;
      }
    }
    //push object to credentials array
    try {
      credentials.push(new Credential(id,username,password));
    } catch(e) {
      toast('Error: Failed Adding Credential ' + id + '.');
      return;
    }
    //save to local storage
    try {
      localStorage.setItem('credentials', JSON.stringify(credentials));
      toast('Credential ' + id + ' saved to localStorage.');
    } catch(e) {
      toast('Error: Failed storing credential ' + id + '.');
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
    var token = '';
    var expiration = '';
    var newValues = {};
    newValues.id = id;
    newValues.address = address;
    newValues.credentialId = credentialId;
    newValues.type = 'device';
    
    if (deviceCardCredentialsCheckbox.checked){
      basicAuthentication = true;
      credentialId = deviceCardCredentialsSelect.value;
    }
    
    //test for duplicates
    if (devices !== null && devices.length > 0) {
      if (duplicate(id, devices) === true){
        dialogConfirm(newValues,{action:'update'});
        return;
      }
    }
    
    //push object to devices array
    try {
      devices.push(new Device(id,address,basicAuthentication,credentialId,token,expiration));
    } catch(e) {
      toast('Error: Failed adding device ' + id + '.');
      return;
    }
    
    //save to local storage
    try {
      localStorage.setItem('devices', JSON.stringify(devices));
      toast('Device ' + id + ' saved to localStorage.');
    } catch(e) {
      toast('Error: Failed storing device ' + id + '.');
      return;
    }
    // add device to nav menu
    navMenuAdd('device',id);
  });

  credentialCardIdInput.addEventListener("blur", function(event) {
    if(credentialInputsPopulated()){
      credentialCardSaveButton.disabled = false;
    }
  }, true);
  
  credentialCardUsernameInput.addEventListener("blur", function(event) {
    if(credentialInputsPopulated()){
      credentialCardSaveButton.disabled = false;
    } else {
      credentialCardSaveButton.disabled = true;
    }
  }, true);
  
  // credentialCardPasswordInput.addEventListener("blur", function(event) {
  //   if(credentialInputsPopulated()){
  //     credentialCardSaveButton.disabled = false;
  //   }
  // }, true);  
  
  

  
  credentialCardPasswordInput.addEventListener("keyup", function(e) {
    if(credentialInputsPopulated()){
      credentialCardSaveButton.disabled = false;
    } else {
      credentialCardSaveButton.disabled = true;
    }
    //enable pressing enter
    e.preventDefault();
    if (e.keyCode == 13) {
      credentialCardSaveButton.click();
    }
  });
 

  deviceCardIdInput.addEventListener("blur", function(event) {
    if(deviceInputsPopulated()){
      deviceCardSaveButton.disabled = false;
    } else {
      deviceCardSaveButton.disabled = true;
    }
  }, true);
  
  deviceCardAddressInput.addEventListener("blur", function(event) {
    if(deviceInputsPopulated()){
      deviceCardSaveButton.disabled = false;
    } else {
      deviceCardSaveButton.disabled = true;
    }
  }, true);
  
  function credentialInputsPopulated(){
    var result = false;
    if(credentialCardIdInput.value !== '' && credentialCardUsernameInput.value !== '' && credentialCardPasswordInput.value !== ''){
      result = true;
    }
    return result;
  }
  
  function deviceInputsPopulated(){
    var result = false;
    if(deviceCardIdInput.value !== '' && deviceCardAddressInput.value !== ''){
      result = true;
    }
    return result;
  }  
  
  function showIntroCard(){
    introCard.style.display = "inline";
    deviceCard.style.display = "none";
    credentialCard.style.display = "none";
    unsupportedCard.style.display = "none";
  }
  
  function showCredentialCard(){
    //hide other cards
    introCard.style.display = "none";
    unsupportedCard.style.display = "none";
    hideConfigurationCards();
    hideEndpointsCards();
    
    //show credential card
    credentialCard.style.display = "inline";
    
    //select and focus first input
    credentialCardIdInput.focus();
    mdlCleanUp();
    
  }
  
  function showDeviceCard(){
    introCard.style.display = "none";
    unsupportedCard.style.display = "none";
    hideConfigurationCards();
    hideEndpointsCards();
    
    //show device card
    deviceCard.style.display = "inline";
    
    //select and focus first input
    deviceCardIdInput.focus();
    mdlCleanUp();    
  }  

  function showEndpointCards(){
    try {
      for (var i = 0, l = endpointCards.length; i < l; i++) {
        endpointCards[i].style.display = 'inline';
      }
    } catch(e) {
    }    
  }
  
  function hideEndpointsCards(){
    try {
      for (var i = 0, l = endpointCards.length; i < l; i++) {
        endpointCards[i].style.display = 'none';
      }
    } catch(e) {
    }
  }

  function hideConfigurationCards(){
    try {
      for (var i = 0, l = configurationCards.length; i < l; i++) {
        configurationCards[i].style.display = 'none';
      }
    } catch(e) {
    }
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
    this.type = 'credential';
  }  
    
  function Device(id, address, basicAuthentication, credentialId,token,expiration) {
    this.id = id;
    this.address = address;
    this.basicAuthentication = basicAuthentication;
    this.credential = credentialId;
    this.token = token;
    this.expiration = expiration;
    this.type = 'device';
  }


  
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
  
  function callApi(deviceId, path){
    var device = getDeviceObject(deviceId);
    if(device === undefined){
      toast('Error: Device ' + deviceId + ' not found.');
    } else {
      //var credential = getCredentialObject(device.credential);
      if(device.expiration < clock.now){
        // we don't have a good token
        getToken(deviceId).then(function(token) {
          //for TESTING PURPOSES let's make it GET
          return httpReq('GET', device.address, path, token); 
          //return httpReq(method, device.address, path, token); // ---------------------------------------------------------------------------
        }).then(function(data) {
          console.log(data);
        }).catch(function(err) {
          console.log(err);
        });
      } else {
        console.log('we have a good token: ' + device.token + ', which expires ' + device.expiration);
        //so let's GET a resource now
        //for TESTING PURPOSES let's make it GET
        httpReq('GET', device.address, path, device.token).then(function(data) {
          console.log(data);
        }, function(status) {
          console.log(status);
        });
      }
    }
  }
  
  // testButton.addEventListener("click", function(){
  //   callApi('csr-home','/api/v1/global/host-name');
  // });
  
  
  function getToken(deviceId){
    var device = getDeviceObject(deviceId);
    var credential = getCredentialObject(device.credential);
    var address = 'https://' + device.address + '/api/v1/auth/token-services';
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", address, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader ("Authorization", "Basic " + window.btoa(credential.username + ":" + credential.password));
      xhr.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
      xhr.onload = function() {
        var status = xhr.status;
        if (status == 200 || status == 201 || status == 202) {
          var response = JSON.parse(xhr.response);
          var expiration = new Date(response["expiry-time"]).getTime();
          try {
            updateDeviceToken(deviceId, response["token-id"], expiration);
            toast(deviceId + ' token recieved. Lifetime is ' + clock.until(expiration));
          } catch(e) {
            console.log(e);
          }
          resolve(response["token-id"]);
        }
        else {
          reject(status);
        }
      };
      xhr.send();
    });
  }
  
  function updateDeviceObject(id, address, credentialId){
    //update devices array
    try {
      for (var i=0, iLen=devices.length; i<iLen; i++) {
        if (devices[i].id == id){
          devices[i].address = address;
          devices[i].credentialId = credentialId;
          if(credentialId){
            devices[i].basicAuthentication = true;
          } else {
            devices[i].basicAuthentication = false;
          }
          devices[i].type = 'device';
        }
      }
    } catch(e) {
      console.log(e);
    }
    //save devices array to local storage
    try {
      localStorage.setItem('devices', JSON.stringify(devices));
    } catch(e) {
      console.log(e);
    }
  }
  
  function updateDeviceToken(id, token, expiration){
    try {
      for (var i=0, iLen=devices.length; i<iLen; i++) {
        if (devices[i].id === id){
          devices[i].token = token;
          devices[i].expiration = expiration;
          devices[i].type = 'device';
        }
      }
    } catch(e) {
      console.log(e);
    }
    //save devices array to local storage
    try {
      localStorage.setItem('devices', JSON.stringify(devices));
      toast('Device ' + id + ' updated.');
    } catch(e) {
      console.log(e);
    }
  }
  
  function updateCredentialObject(id, username, password){
    //update devices array
    try {
      for (var i=0, iLen=credentials.length; i<iLen; i++) {
        if (credentials[i].id === id){
          credentials[i].username = username;
          credentials[i].password = password;
          credentials[i].type = 'credential';
        }
      }
    } catch(e) {
      console.log(e);
    }
    //save devices array to local storage
    try {
      localStorage.setItem('credentials', JSON.stringify(credentials));
      toast('Credential ' + id + ' updated.');
    } catch(e) {
      console.log(e);
    }
  }
  
  function getDeviceObject(id){
    try {
      for (var i=0, iLen=devices.length; i<iLen; i++) {
        if (devices[i].id == id){
          return devices[i];
        }
      }
    } catch(e) {
      return false;
    }
  }
  
  function getCredentialObject(id){
    try {
      for (var i=0, iLen=credentials.length; i<iLen; i++) {
        if (credentials[i].id == id){
          return credentials[i];
        }
      }
    } catch(e) {
      return false;
    }
  }  

  function httpReq(method, host, path, token) {
    if(method === "DELETE" || method === "GET"|| method === "POST" || method === "PUT" ){
      var address = 'https://' + host + path;
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, address, true);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader ("X-auth-token", token);
        //xhr.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
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
      console.log('invalid method');
    }
  };
  
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


  var toast = function(msg,timeout){
    if(!timeout){timeout = 2750}
    var data = {
      message: msg,
      timeout: timeout
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
  };
  
  function dialogConfirm(obj,task){
    dialogConfirmText.innerHTML = task.action + ' ' + obj.id;
    bindDialogListeners(obj,task);
    dialog.showModal();
  }
  
  function bindDialogListeners(obj,task){
    var arr = [];
    arr.push(obj);
    doc.querySelector('#dialog-cancel').onclick = null;
    doc.querySelector('#dialog-ok').onclick = null;
    
    doc.querySelector('#dialog-cancel').onclick = function() {
      task.val = false;
      arr.push(task);
      dialog.close(arr);
    };
    doc.querySelector('#dialog-ok').onclick = function() {
      task.val = true;
      arr.push(task);
      dialog.close(arr);
    };
  }
  
  doc.querySelector('dialog').addEventListener('close', function() {
    //an object turns up here.
    var obj = this.returnValue[0];
    var task = this.returnValue[1];
    
    if(obj.type === 'credential'){
      if(task.val === true){
        if(task.action === 'update'){
          updateCredentialObject(obj.id, obj.username, obj.password);
        }
        if(task.action === 'delete'){
          deleteObject('credential', obj.id);
        }
      }
    } else if (obj.type === 'device'){
      if(task.val === true){
        if(task.action === 'update'){
          updateDeviceObject(obj.id, obj.address, obj.credentialId);
        }
        if(task.action === 'delete'){
          deleteObject('device', obj.id);
        }        
      }
    }
  });
  // END
}, false);


