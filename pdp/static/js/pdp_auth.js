/*jslint browser: true, devel: true */
/*global $, jQuery, pdp */

window.pdp = (function (my, $) {
    "use strict";

    my.init_login = function (loginDivId) {

        var user, loginButton;

        // Set up login splash
        var loginDialog = document.body.appendChild(pdp.getLoginForm());
        loginDialog = $("#login-dialog").dialog({
            appendTo: "#main",
            autoOpen: false,
            title: "login",
            width: "40%",
            modal: true,
            dialogClass: "no-title",
            buttons: {
                "Close": function () {
                    $(this).dialog("close");
                }
            }
        });

        // Register by email dialog
        var emailRegistrationDialog = document.body.appendChild(pdp.getEmailRegistrationDialog());
        emailRegistrationDialog = $("#email-dialog").dialog({
            appendTo: "#main",
            autoOpen: false,
            title: "email",
            width: "40%",
            modal: true,
            dialogClass: "no-title",
            buttons: {
                "Close": function () {
                    $(this).dialog("close");
                }
            }
        });

        // Oauth failed dialog
        var oauthErrorDialog = document.body.appendChild(pdp.getOauthErrorDialog());
        oauthErrorDialog = $("#oauth-error-dialog").dialog({
            appendTo: "#main",
            autoOpen: false,
            title: "email",
            width: "40%",
            modal: true,
            dialogClass: "no-title",
            buttons: {
                "Close": function () {
                    $(this).dialog("close");
                }
            }
        });

        // Create login/logout buttons
        loginButton = document.getElementById(loginDivId).appendChild(
            pdp.createLink("login-button", undefined, undefined, "Login with OpenAuthentication")
        );
        loginButton = $(loginButton);
        loginButton.prop("loggedIn", false);
        loginButton.click(function(){loginDialog.dialog("open")});

        // Set up OAuth with Hello.js
        hello.init(CLIENT_IDS_ALL,
        {
            scope: 'email',
            redirect_uri: location.protocol + '//' + window.location.hostname + '/oauth/redirect.html',
        });

        hello.on('auth.login', function(auth) {
            hello( auth.network ).api( '/me' ).then( function(r){
                user = r;

                if (pdp.validateEmail(user.email)) {
                    pdp.login(user.email, auth.network);
                } else {
                    oauthErrorDialog.dialog("open");
                }
            });
        });

        hello.on('auth.logout', function(auth) {
            user = undefined;
        });

        /* FIXME: check if session has registered email already. Since hellojs
        automatically logs back in if the session is valid, this must only be
        done if we know hellojs does not have a valid session. */

        return loginButton;
    };

    my.login = function (email, network) {

        // Register login through button
        var loginButton = $("#login-button")
        loginButton.prop("loggedIn", true);
        loginButton.hide();

        // Create logout button
        var link = document.createElement("a");
        link.id = "logout-button"
        link.appendChild(document.createTextNode("Logout as " + email));
        $(link).click(function() {
            pdp.logout(network);
        });
        document.getElementById("login-button").parentElement.appendChild(link);

        // Log into the server
        $.ajax({
            type: "POST",
            url: pdp.app_root + '/user/login',
            data: {
                "email": email
            }
        })
        // FIXME Add failure handler
    }

    my.logout = function(network) {

        // oauth logout
        if (network) {
            hello.logout(network);
        }

        // backend logout (also removes session cookie)
        $.ajax({
            url: pdp.app_root + '/user/logout',
        });

        // Show the login button, remove logout
        $("#logout-button").remove();
        var loginButton = $("#login-button")
        loginButton.prop("loggedIn", false);
        loginButton.show();
    }

    my.checkLogin = function() {
        $.ajax({
            dataType: 'json',
            url: pdp.app_root + '/user/profile',
        }).done(function(data) {
            if (pdp.validateEmail(data.email)) {
                pdp.login(data.email);
            }
        });
    }

    my.createCookie = function (name, value, days) {
        var expires, date;
        if (days) {
            date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    my.readCookie = function (name) {
        var nameEQ, ca, i, c;
        nameEQ = name + "=";
        ca = document.cookie.split(";");
        for (i = 0; i < ca.length; i += 1) {
            c = ca[i];
            while (c.charAt(0) === " ") {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    };

    my.eraseCookie = function (name) {
        pdp.createCookie(name, "", -1);
    };

    my.validateEmail = function (email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    }

    my.getOauthErrorDialog = function() {
        var dialog = pdp.createDiv('oauth-error-dialog');

        var h = dialog.appendChild(document.createElement('h2'));
        h.appendChild(document.createTextNode("OpenAuthentication Error"));

        var p = dialog.appendChild(document.createElement("p"));
        p.appendChild(document.createTextNode("Something had happened during the authentication process and we " + 
            "were not able to retrieve your verified email address. Please simply register by email address below."));

        dialog.appendChild(pdp.getEmailForm('oauth-error-dialog'));

        return dialog;
    }

    my.getEmailRegistrationDialog = function() {
        var dialog = pdp.createDiv('email-dialog');

        var h = dialog.appendChild(document.createElement('h2'));
        h.appendChild(document.createTextNode("Registration by email"));
        dialog.appendChild(pdp.getEmailForm('email-dialog'));

        return dialog;
    }

    my.getEmailForm = function(dialogId) {

        var form = pdp.createDiv('email-form');

        var label = document.createElement('label')
        label.appendChild(document.createTextNode("Email: "));
        label.for = 'email';
        form.appendChild(label);
        var inputEmail = pdp.createInputElement('text', undefined, 'email', 'email');
        form.appendChild(inputEmail);

        var invalidEmail = pdp.createDiv();
        invalidEmail.style.display = 'none';
        invalidEmail.appendChild(document.createTextNode("Email does not appear valid"));
        form.appendChild(invalidEmail);

        var clear = pdp.createDiv('', 'clear')
        form.appendChild(clear);
        form.appendChild(document.createElement('br'));

        var submit = document.createElement("button");
        submit.appendChild(document.createTextNode("Submit"));
        submit.onclick = function() {
            var email = inputEmail.value;
            if (pdp.validateEmail(email)) {
                $("#" + dialogId).dialog("close");
                pdp.login(email);
            } else {
                invalidEmail.style.display = 'block';
            }

        }
        form.appendChild(submit);

        return form;
    }

    my.getLoginForm = function () {

        var loginDialog = pdp.createDiv('login-dialog');

        function createLoginFieldset() {
            var div = pdp.createDiv();
            var h = div.appendChild(document.createElement('h2'));
            h.appendChild(document.createTextNode("OpenAuthentication Providers"));

            var providerButton = function(provider) {
                var button = document.createElement("button");
                button.className = "zocial " + provider;
                button.appendChild(document.createTextNode('Login with ' + pdp.toTitleCase(provider)));
                button.onclick = function () {
                    $(loginDialog).dialog("close");
                    hello(provider).login();
                }
                return button;
            };

            div.appendChild(providerButton('google'));
            div.appendChild(providerButton('windows'));
            return div;
        }

        function createWorksFieldset() {
            var div = pdp.createDiv();
            var h = div.appendChild(document.createElement("h2"));
            h.appendChild(document.createTextNode("How it works"));

            var p = div.appendChild(document.createElement("p"));
            p.appendChild(document.createTextNode("Click \"Login with...\" to use an existing OpenAuthentication account. " +
                                                  "A new window will open asking you to sign in with the account provider. " +
                                                  "Once signed in, you will be returned to the data portal. " +
                                                  "If you do not have an account with one of the available providers either " +
                                                  "sign up using the pop up window or click "));
            var a = document.createElement("a");
            a.appendChild(document.createTextNode("here"));
            a.onclick = function() {
                $("#email-dialog").dialog("open");
                $("#login-dialog").dialog("close");
            }
            p.appendChild(a);
            return div;
        }

        function createWhyFieldset() {
            var div = pdp.createDiv();
            var h = div.appendChild(document.createElement('h2'));
            h.appendChild(document.createTextNode("Why do you want my e-mail address?"));
            var p = div.appendChild(document.createElement("p"));
            p.appendChild(document.createTextNode("PCIC will use your address only to contact you in the event major errors  are found in the data or when major changes to the data in the portal are made. " +
                                                  "Your e-mail address is the only personal information that PCIC will gather and will be kept secure."));
            return div;
        }

        loginDialog.appendChild(createLoginFieldset());
        loginDialog.appendChild(createWorksFieldset());
        loginDialog.appendChild(createWhyFieldset());
        return loginDialog;
    };

    my.checkAuthBeforeDownload = function(e) {
        return;
        // var loginButton = e.data;
        // if (!$(loginButton).prop("loggedIn")) {
        //     alert("Please log in before downloading data");
        //     e.preventDefault();
        // }
    };

    return my;
}(window.pdp, jQuery, hello));

var GOOGLE_CLIENT_ID = {
    'atlas.pcic.uvic.ca' : '893332401445-1h9k4h7msol4dedu4nqgb50fib16ui7p.apps.googleusercontent.com',
    'tools.pacificclimate.org' : '915572015142-k9lo6a17a6vcpqriqmt8mibg6i7fkhu8.apps.googleusercontent.com',
    'basalt.pcic.uvic.ca' : 'j6vnKGoSR9iiYzX0OqqdjTV-M3gLgsrQ,'
}[window.location.hostname];

var WINDOWS_CLIENT_ID = {
    'atlas.pcic.uvic.ca' : '000000004414E918',
    'tools.pacificclimate.org' : '000000004015551A',
    'basalt.pcic.uvic.ca' : '0000000048156D90',
}[window.location.hostname];

var CLIENT_IDS_ALL = {
    windows: WINDOWS_CLIENT_ID,
    google: GOOGLE_CLIENT_ID
};