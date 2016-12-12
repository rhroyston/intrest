(function() {
    
    var doc = document;
    var populations = {};
    var buttons = doc.getElementsByTagName('button');
    var stringArea = doc.getElementById('string-area');
    var responseArea = doc.getElementById('response-area');
    var stringAreaData = '';
    var token = '';
    var urlArea = doc.getElementById('url-area');
    
    var getButton = doc.getElementById('get');
    var putButton = doc.getElementById('put');
    var postButton = doc.getElementById('post');
    var deleteButton = doc.getElementById('delete');
    
    var authSwitch = doc.getElementById('auth-switch');
    
	var dialogHelp = doc.getElementById('dialog-help');
	var dialogHelpTitle = doc.getElementById('dialog-help-title');
	var dialogConfigTitle = doc.getElementById('dialog-config-title');
	
	var dialogTopIcons = doc.getElementsByClassName('dialog-top-icon');
	
	var dialogHelpContent = doc.getElementById('dialog-help-content');
	var dialogHelpBody = doc.getElementById('dialog-help-body');
	var dialogHelpActions = doc.getElementById('dialog-help-actions');
	var dialogHelpClose = doc.getElementById('dialog-help-close');
	
	var tokenSpan = doc.getElementById('token-span');
	var dialogToken = doc.getElementById('dialog-token');
	var dialogTokenClose = doc.getElementById('dialog-token-close');
	var dialogTokenSet = doc.getElementById('dialog-token-set');
	
	var username = doc.getElementById('username');
	var password = doc.getElementById('password');
	
	var mainHelp = doc.getElementById('main-help');
	
	fillUsernameSpan();
    
	doc.addEventListener("keyup", function(){
	    if (stringArea.value !== '') {
            //string is in there so disable
            getButton.disabled = true;
            putButton.disabled = true;
            deleteButton.disabled = true;
            stringAreaData = stringArea.value;
	    } else {
            getButton.disabled = false;
            putButton.disabled = false;
            deleteButton.disabled = false;
            stringAreaData = '';
	    }
	    
	    if (clientUsername.value !== '' && clientPassword.value !== '') {
	        dialogTokenSet.disabled = false;
	    } else {
	        dialogTokenSet.disabled = true;
	    }
	});
	
	dialogHelpClose.addEventListener("click", function(){
	    dialogHelp.close();
	    // remove id fragment from URL and slice off the remaining hash in HTML5
	    window.location.replace("#");
	    if (typeof window.history.replaceState == 'function') {
	      history.replaceState({}, '', window.location.href.slice(0, -1));
	    }
	});
    
	dialogTokenClose.addEventListener("click", function(){
	    dialogToken.close();
	    // remove id fragment from URL and slice off the remaining hash in HTML5
	    window.location.replace("#");
	    if (typeof window.history.replaceState == 'function') {
	      history.replaceState({}, '', window.location.href.slice(0, -1));
	    }
	});
	
    for (var i = 0; i < dialogTopIcons.length; i++) {
        dialogTopIcons[i].addEventListener("click", function(){
			if(this.parentNode.id == 'dialog-help'){
				dialogHelp.close();
			} else if(this.parentNode.id == 'dialog-token'){
				dialogToken.close();
			}
        });
    }
	
	tokenSpan.addEventListener("click", function(){
	    if (!tokenSpan.showModal) {
	        dialogPolyfill.registerDialog(dialogToken);
	    }
	    dialogToken.showModal();
	    doc.activeElement.blur();
	});
	
	mainHelp.addEventListener("click", function(){
	    if (!mainHelp.showModal) {
	        dialogPolyfill.registerDialog(dialogHelp);
	    }
	    dialogHelp.showModal();
	    doc.activeElement.blur();
	});
	
	dialogTokenSet.addEventListener("click", function(){
		fillUsernameSpan();
		dialogTokenClose.click();
	});
    
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(){
            var url = urlArea.value;
			
			if(this.id =='post'){
			    altXhr();
			}
            if(this.id =='get' || this.id =='put' || this.id =='delete'){
				
				httpReq(url,this.id).then(function(data) {
				        console.log(data);
						responseArea.innerHTML = '';
						var res = document.createTextNode(data);
						responseArea.appendChild(document.createElement('pre')).appendChild(res);
						hljs.highlightBlock(responseArea);
					}, function(status) {
						responseArea.innerHTML = "Error: " + status;
				});
            }
        });
    }
    
    
    function altXhr(){
        document.domain = 'rack.pub';
        $.ajax({
            url: "https://csr1.rack.pub:55443/api/v1/auth/token-services",
            beforeSend: function(xhr) {
                xhr.withCredentials = true;
                xhr.setRequestHeader("Authorization", "Basic " + window.btoa("cisco:cisco"));
                //xhr.setRequestHeader("User-Agent","curl/7.51.0");
                //xhr.setRequestHeader("Accept-Language",null);
                //xhr.setRequestHeader("Accept-Encoding",null);
                //xhr.setRequestHeader("origin",null);
                xhr.setRequestHeader("Accept", "*/*");
            },
            type: 'POST',
            //dataType: 'json',
            //contentType: 'application/json',
            contentType: 'application/x-www-form-urlencoded',
            processData: false,
            data: '',
            
            }).done(function(data) {
                console.log("success " + JSON.stringify(data));
            })
            .fail(function(error) {
                console.log("error " + JSON.stringify(error));
            })
            .always(function() {
                console.log("complete");
            });
    }
    
    
    var httpReq = function(url,method) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            var body = '';
            var params = "lorem=ipsum&name=binny";
            
            console.log('firing xhr.open(' + method + ',' + url);
            xhr.open(url, method, true);
            
			if(authSwitch.checked){
			    //if we already have token dont send username and password
			    if(token !== ''){
			        xhr.setRequestHeader('X-auth-token', token);
			    } else {
			        xhr.withCredentials = true;
			        xhr.setRequestHeader("Accept", "application/json");
			        //xhr.setRequestHeader("Content-Type", "text/plain");
			        
			        //xhr.setRequestHeader ("Authorization", "Basic " + window.btoa(clientUsername.value + ":" + clientPassword.value));
			        //xhr.setRequestHeader("Content-Length", "0");
			        //xhr.setRequestHeader ("Content-Type", "application/x-www-form-urlencoded");
			    }
			}
			
            //POST /api/v1/auth/token-services HTTP/1.1
            //Host: 192.168.1.14:55443
            //Authorization: Basic cmhyb3lzdG9uOm5pYzB0aW5l
            //User-Agent: curl/7.51.0
            //Accept:application/json
            //Content-Length: 0
            //Content-Type: application/x-www-form-urlencoded					
			
            if(jsonSwitch.checked){
            	xhr.setRequestHeader("Content-Type","application/json");
            }
            
            if (xmlSwitch.checked) {
            	xhr.setRequestHeader("Content-Type","application/xml");
            }
            
            xhr.onload = function() {
                var status = xhr.status;
                if (status == 200 || status == 201 || status == 202) {
                	resolve(xhr.response);
                } else {
                	reject(status);
                }
            };
            //xhr.send(stringAreaData);
            //xhr.send(post || null);
            //http.send(params);
            xhr.send(body);
        });
    };
    
    function fillUsernameSpan(){			
        if(token){
            tokenSpan.innerHTML = token;
        } else if (username.value){
            tokenSpan.innerHTML = 'credentials pending authentication';
        } else {
            tokenSpan.innerHTML = 'token not set';
        }
    }
	
    //window.componentHandler.upgradeAllRegistered();
}());