// Requires globals app_root, ensemble_name (really just need for url space)
function init_login(loginDivId) {

    // Will we ever want to have different providers by application?
    var providers = {
        "Launchpad": "https://login.launchpad.net/",
        "myOpenID": "https://www.myopenid.com/",
        "Verisign": "http://pip.verisignlabs.com",
        "Google": "https://www.google.com/accounts/o8/id",
        "Yahoo": "http://yahoo.com/"
    };

    var signupUrls = {
        "Launchpad": "https://login.launchpad.net/pBkz56vSM5432lMr/+new_account",
        "myOpenID": "https://www.myopenid.com/signup",
        "Verisign": "https://pip.verisignlabs.com/register.do",
        "Google": "https://accounts.google.com/NewAccount",
        "Yahoo": "https://edit.yahoo.com/registration?.src=fpctx&.intl=ca&.done=http%3A%2F%2Fca.yahoo.com%2F"
    };

    // var signupUrls = [
    //     "https://login.launchpad.net/pBkz56vSM5432lMr/+new_account", 
    //     "https://www.myopenid.com/signup", 
    //     "https://pip.verisignlabs.com/register.do", 
    //     "https://accounts.google.com/NewAccount", 
    //     "https://edit.yahoo.com/registration?.src=fpctx&.intl=ca&.done=http%3A%2F%2Fca.yahoo.com%2F"
    // ];

	var button = document.getElementById(loginDivId).appendChild(
		createLink("login-button", undefined, undefined, "LOGIN")
	);
	var form = document.getElementById(loginDivId).appendChild(getLoginForm(providers));
	var form = $("#login-form").dialog({
        appendTo: '#main',
    	autoOpen: false,
    	title: "login",
    	width: '40%',
    	autoOpen: false,
        modal: true,
        dialogClass: 'no-title',
        buttons: {
    	    "Close": function() {
    	    	$(this).dialog("close");
    	    }
    	}
    });

    var button = $('#login-button');
    button.prop('loggedIn', false);



    function startLogin(evt, onSuccess, onFailure) {
		// spawn new window, hook the onClose with checkLogin()
		var return_to = app_root + '/check_auth_app/';
		var oid = $('select[name="openid-provider"]')[0].value;
		var loginWindow = window.open(app_root + '/' + ensemble_name + '/?openid_identifier=' + oid + '&return_to=' + return_to);
		var pattern = new RegExp('^' + return_to)
		var id = setInterval(function () {
			try {
				if (loginWindow.closed) {
					clearInterval(id);
					form.dialog("close");
					checkLogin(button, onSuccess, onFailure);
				} else if (pattern.test(loginWindow.location.href)) { // FIXME: check whether it's XSS first
					clearInterval(id);
					loginWindow.close();
					form.dialog("close");
					checkLogin(button, onSuccess, onFailure);
				};
			} catch(e) {
				// Permission denied on loginWindow.location.* ... ignore
			};
		}, 500);
    };

    function doLogout(evt) {
    	eraseCookie("beaker.session.id");
    	$.ajax({'url': './?openid_logout',
    		'type': 'GET',
			// We can remain on the page, probably just update the logged-in status
			'success': function() {
				button.prop('loggedIn', false);
				button.html("Login with OpenID");
				alert("Logout successful.");
			},
			// On 401, we are now unauthorized, redirect somewhere?
			'error': function() {
				alert("We're not authorized! I'm not sure what to do. Abort! Abort!");
			}
		});
    	return false;
    };

    function startSignup(evt) {
    	// var i = $('select[name="openid-provider"]')[0].selectedIndex;
    	var name = $('select[name="openid-provider"] option:selected').html()
    	var url = signupUrls[name];
    	window.open(url);
    };

    function doSubmitAfterLogin(evt) {
		$('#filter').submit();
		$('#do-login').unbind('click');
		$('#do-login').click(startLogin); // clear doSubmit as the login onSuccess event handler
    };

    function showLogin(evt) {
    	form.dialog("open");
    	return false;
    };

    function toggleLogin(evt) {
    	if (button.prop('loggedIn')) {
    		// Log out
    		doLogout(evt);
    	} else {
    		// Log in
    		showLogin(evt);
    	};
    };

    checkLogin(button);
    button.click(toggleLogin);
    $('#do-login').click(startLogin);
    $('#do-signup').click(startSignup);

    return button;
}

function checkLogin(button, onSuccess, onFailure) {
$.ajax({'url': app_root + '/check_auth_app/',
	'type': 'GET',
	'dataType': 'json',
	// show logged-in status
	'success': function(data, textStatus, jqXHR) {
	    button.prop('loggedIn', true);
	    button.html("Logout as: " + data.email);
	    if (onSuccess) {
	    	onSuccess();
	    };
	},
	// show link to login
	'error': function(jqXHR, textStatus, errorThrown) {
	    button.prop('loggedIn', false);
	    button.html("Login with OpenID");
	    if (onFailure) {
	    	onFailure();
	    };
	}});
};

function createCookie(name,value,days) {
    if (days) {
	var date = new Date();
	date.setTime(date.getTime()+(days*24*60*60*1000));
	var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
};

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
	var c = ca[i];
	while (c.charAt(0)==' ') c = c.substring(1,c.length);
	if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
};

function eraseCookie(name) {
    createCookie(name,"",-1);
};

function getLoginForm(providers) {
	function createProviderSelect(id, name, providers, defaultValue) {
	    var select = document.createElement("select");
		if(typeof id != 'undefined') select.id = id;
    	if(typeof name != 'undefined') select.name = name;
    	$.each(providers, function(idx, val) {
    		select.appendChild(createOption(val, idx));
    	});
    	return select;
	}

	function createLoginFieldset(providers) {

		var fieldset = createFieldset(undefined, "Login");
		var div = fieldset.appendChild(createDiv("login-or-signup"));
		div.appendChild(createLabel(undefined, "OpenID Provider"));
		
		var providersDiv = div.appendChild(createDiv());
		var select = createProviderSelect(undefined, "openid-provider", providers);
		providersDiv.appendChild(select);
		
		loginDiv = div.appendChild(createDiv());
		loginButton = createInputElement("button", undefined, "do-login", undefined, "Open login window");
		loginDiv.appendChild(loginButton);

		seperatorDiv = div.appendChild(createDiv());
		seperatorDiv.appendChild(document.createTextNode("--- or ---"));
		
		signupDiv = div.appendChild(createDiv());
		signupButton = createInputElement("button", undefined, "do-signup", undefined, "Open sign up window");
		signupDiv.appendChild(signupButton);
		return fieldset
	}

	function createWorksFieldset() {
		var fieldset = createFieldset(undefined, "How it works");
		p = fieldset.appendChild(document.createElement("p"));
		p.appendChild(document.createTextNode("Click \"Login\" to use an existing OpenID account. " + 
			"A new window will open asking you to sign in with the account provider. " + 
			"Once signed in, you will be returned to the data portal. " + 
			"PCIC uses OpenID to allow us to communicate with users via e-mail. " + 
			"If you don't have an OpenID account, click \"Sign up\"." + 
			"For information about OpenID click <a href=\"http://openid.net/get-an-openid/what-is-openid/\">here</a>"));
		return fieldset;
	}

	function createWhyFieldset() {
		var fieldset = createFieldset(undefined, "Why do you want my e-mail address?");
		p = fieldset.appendChild(document.createElement("p"));
		p.appendChild(document.createTextNode("PCIC will use your address only to contact you in the event major errors  are found in the data or when major changes to the data in the portal are made. " + 
			"Your e-mail address is the only personal information that PCIC will gather and will be kept secure."));
		return fieldset;
	}
	
	var loginForm = createForm("login-form", "login-form", "get");
	// var closeDiv = loginForm.appendChild(createDiv("close-login"));
	// var closeButton = closeDiv.appendChild(document.createElement("button"));
	loginForm.appendChild(createLoginFieldset(providers));
	loginForm.appendChild(createWorksFieldset());
	loginForm.appendChild(createWhyFieldset());
	return loginForm;
}