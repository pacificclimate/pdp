// var app_root (the url to the root of the application) should be set globally before this is loaded.
function init_login() {

    var theButton = $('#login-button');
    // FIXME: when upgrading jquery > 1.6 use theButton.prop('loggedIn') which is a boolean... currently .attr() will only return a string e.g. 'false' which evaluates to true (!)

    function checkLogin(onSuccess, onFailure) {
	$.ajax({'url': app_root + '/check_auth_app/',
		'type': 'GET',
		'dataType': 'json',
		// show logged-in status
		'success': function(data, textStatus, jqXHR) {
		    theButton.attr('loggedIn', 'yes');
		    theButton.html("Logout as: " + data.email);
		    if (onSuccess) {
			onSuccess();
		    };
		},
		// show link to login
		'error': function(jqXHR, textStatus, errorThrown) {
		    theButton.attr('loggedIn', 'no');
		    theButton.html("Login with OpenID");
		    if (onFailure) {
			onFailure();
		    };
		}});
    };

    function toggleLogin(evt) {
	if (theButton.attr('loggedIn') == 'yes') {
	    doLogout(evt);
	} else {
	    showLogin(evt);
	};
    };


    // These are the six state transitions
    // see notebook 2012/09/21 for transition diagram
    function showLogin(evt) {
	$('#login-form').css('visibility', 'visible');
	return false;
    };

    function startLogin(evt, onSuccess, onFailure) {
	// spawn new window, hook the onClose with checkLogin()
	var return_to = app_root + '/check_auth_app/';
	var oid = $('select[name="openid-provider"]')[0].value;
	var loginWindow = window.open(app_root + '/auth?openid_identifier=' + oid + '&return_to=' + return_to, 'openid_login');
	var pattern = new RegExp('^' + return_to)
	var id = setInterval(function () {
	    try {
		if (loginWindow.closed) {
		    clearInterval(id);
		    $('#login-form').css('visibility', 'hidden');
		    checkLogin(onSuccess, onFailure);
		} else if (pattern.test(loginWindow.location.href)) { // FIXME: check whether it's XSS first
		    clearInterval(id);
		    loginWindow.close();
		    $('#login-form').css('visibility', 'hidden');
		    checkLogin(onSuccess, onFailure);
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
		   theButton.attr('loggedIn', 'no');
		   theButton.html("Login with OpenID");
		   alert("Logout successful.");
	       },
		// On 401, we are now unauthorized, redirect somewhere?
	       'error': function() {
		   alert("We're not authorized! I'm not sure what to do. Abort! Abort!");
	       }});
	return false;
    };

    function closeLoginWin(evt) {
	$('#login-form').css('visibility', 'hidden');
	return false;
    };

    // Not used: just inline in startLogin
    function loginFailure(evt) {
	$('#login-form').css('visibility', 'hidden');
	checkLogin();
    };
    // Not used: just inline in startLogin
    function loginSuccess(evt) {
	$('#login-form').css('visibility', 'hidden');
	checkLogin();
    };

    function doSubmitAfterLogin(evt) {
	$('#filter').submit();
	$('#do-login').unbind('click');
	$('#do-login').click(startLogin); // clear doSubmit as the login onSuccess event handler
    };

    function startSignup(evt) {
	var i = $('select[name="openid-provider"]')[0].selectedIndex;
	var url = signupUrls[i];
	window.open(url);
    };

    // Display a login window before submission if the user is not logged in
    $('#filter').submit(function(evt) {
	if (theButton.attr('loggedIn') == 'yes') { // This _could_ be gamed, but the data is still behind an auth wall
	    return true;
	} else {
	    showLogin();
	    $('#do-login').unbind('click');
	    $('#do-login').click(function(evt) {
		startLogin(evt, doSubmitAfterLogin) // continue the form submission after returning from the login
	    });
	};
	return false;
    });

    $('#close-login button').button({text: false, icons: {primary: 'ui-icon-circle-close'}});
    $('#close-login button').click(closeLoginWin);

    checkLogin();
    theButton.click(toggleLogin);
    $('#do-login').click(startLogin);
    $('#do-signup').click(startSignup);
};

