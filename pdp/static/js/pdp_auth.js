/*jslint browser: true, devel: true */
/*global $, jQuery, pdp */

window.pdp = (function (my, $) {
    "use strict";

    my.init_login = function (loginDivId) {

        var user, providers, signupUrls, loginButton, form;

        // Set up login splash
        form = document.body.appendChild(pdp.getLoginForm());
        form = $("#login-dialog").dialog({
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

        // Create login/logout buttons
        loginButton = document.getElementById(loginDivId).appendChild(
            pdp.createLink("login-button", undefined, undefined, "Login with OpenAuthentication")
        );
        loginButton = $(loginButton);
        loginButton.prop("loggedIn", false);
        loginButton.click(function(){form.dialog("open")});

        // Set up OAuth with Hello.js
        providers = ["google", "windows", "facebook", "dropbox", "yahoo", "linkedin"];
        hello.init({
            google: '593322243760-o5qmvn1lgico4tfh2f6c170mghttmojq.apps.googleusercontent.com',
            dropbox: '5r9nfwgz5efltpv',
            linkedin: '750qnahuwtlcxm',
            github: '1d1a2b283af770155dd3'
        },{
            scope: 'email',
            redirect_uri: pdp.app_root + '/redirect.html'
        });

        hello.on('auth.login', function(auth) {
            hello( auth.network ).api( '/me' ).then( function(r){
                user = r;

                // Create logout button
                loginButton.prop("loggedIn", true);
                loginButton.hide();
                var link = document.createElement("a");
                link.id = "logout-button"
                link.appendChild(document.createTextNode("Logout as " + user.email));
                $(link).click(function() {
                    hello.logout(auth.network);
                    $.ajax({
                        url: pdp.app_root + '/user/logout',
                    })
                });
                document.getElementById(loginDivId).appendChild(link);

                // Log into the server
                $.ajax({
                    type: "POST",
                    url: pdp.app_root + '/user/login',
                    data: {
                        "email": user.email
                    }
                })
            });
        });
        hello.on('auth.logout', function(auth) {
            user = undefined;
            $(document.getElementById("logout-button")).remove();
            loginButton.show();
        });

        return loginButton;
    };

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

    my.getLoginForm = function () {

        var loginDialog = pdp.createDiv('login-dialog');

        function createLoginFieldset() {
            var div = pdp.createDiv();


            var providerButton = function(provider) {
                var button = document.createElement("button");
                button.className = "zocial" + provider;
                button.appendChild(document.createTextNode('Login with ' + provider));
                button.onclick = function () {
                    $(loginDialog).dialog("close");
                    hello(provider).login();
                }
                return button;
            };

            div.appendChild(providerButton('google'));
            div.appendChild(providerButton('linkedin'));
            div.appendChild(providerButton('github'));
            div.appendChild(providerButton('dropbox'));
            return div;
        }

        function createWorksFieldset() {
            var div = pdp.createDiv();
            var h = div.appendChild(document.createElement("h2"));
            h.appendChild(document.createTextNode("How it works"));

            var p = div.appendChild(document.createElement("p"));
            p.appendChild(document.createTextNode("Click \"Login\" to use an existing OpenID account. " +
                                                  "A new window will open asking you to sign in with the account provider. " +
                                                  "Once signed in, you will be returned to the data portal. " +
                                                  "PCIC uses OpenID to allow us to communicate with users via e-mail. " +
                                                  "If you don't have an OpenID account, click \"Sign up\"." +
                                                  "For information about OpenID click "));
            var a = document.createElement("a");
            a.appendChild(document.createTextNode("here"));
            a.href = "http://openid.net/get-an-openid/what-is-openid/";
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
}(window.pdp, jQuery));
