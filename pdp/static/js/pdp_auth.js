/*jslint browser: true, devel: true */
/*global $, jQuery, pdp */

window.pdp = (function (my, $) {
    "use strict";

    my.init_login = function (loginDivId) {

        var providers, signupUrls, button, form;

        // Will we ever want to have different providers by application?
        providers = {
            "Launchpad": "https://login.launchpad.net/",
            "Verisign": "http://pip.verisignlabs.com",
            "Google": "https://www.google.com/accounts/o8/id",
            "Yahoo": "http://open.login.yahooapis.com/openid20/www.yahoo.com/xrds"
        };

        signupUrls = {
            "Launchpad": "https://login.launchpad.net/pBkz56vSM5432lMr/+new_account",
            "Verisign": "https://pip.verisignlabs.com/register.do",
            "Google": "https://accounts.google.com/NewAccount",
            "Yahoo": "https://edit.yahoo.com/registration?.src=fpctx&.intl=ca&.done=http%3A%2F%2Fca.yahoo.com%2F"
        };

        button = document.getElementById(loginDivId).appendChild(
            pdp.createLink("login-button", undefined, undefined, "Login with OpenID")
        );
        form = document.getElementById(loginDivId).appendChild(pdp.getLoginForm(providers));
        form = $("#login-form").dialog({
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

        button = $("#login-button");
        button.prop("loggedIn", false);

        /*jslint unparam: true*/
        function startLogin(evt, onSuccess, onFailure) {
            var return_to, oid, loginWindow, pattern, id;
            // spawn new window, hook the onClose with checkLogin()
            return_to = pdp.app_root + "/check_auth_app/";
            oid = $("select[name='openid-provider']")[0].value;
            loginWindow = window.open(pdp.app_root + "/check_auth_app/?openid_identifier=" + oid + "&return_to=" + return_to);
            pattern = new RegExp("^" + return_to);
            id = setInterval(function () {
                try {
                    if (loginWindow.closed) {
                        clearInterval(id);
                        form.dialog("close");
                        pdp.checkLogin(button, onSuccess, onFailure);
                    } else if (pattern.test(loginWindow.location.href)) { // FIXME: check whether it"s XSS first
                        clearInterval(id);
                        loginWindow.close();
                        form.dialog("close");
                        pdp.checkLogin(button, onSuccess, onFailure);
                    }
                } catch (ignore) {
                    // Permission denied on loginWindow.location.* ... ignore
                }
            }, 500);
            /*jslint unparam: false*/

        }

        function doLogout(evt) {
            pdp.eraseCookie("beaker.session.id");
            $.ajax({
                url: "./?openid_logout",

                // We can remain on the page, probably just update the logged-in status
                success: function () {
                    button.prop("loggedIn", false);
                    button.html("Login with OpenID");
                    alert("Logout successful.");
                },
                // On 401, we are now unauthorized, redirect somewhere?
                error: function () {
                    alert("We're not authorized! I'm not sure what to do. Abort! Abort!");
                }
            });
            return false;
        }

        function startSignup(evt) {
            var name = $("select[name='openid-provider'] option:selected").html(),
                url = signupUrls[name];
            window.open(url);
        }

        /*jslint unparam: true*/
        function doSubmitAfterLogin(evt) {
            $("#filter").submit();
            $("#do-login").unbind("click");
            $("#do-login").click(startLogin); // clear doSubmit as the login onSuccess event handler
        }

        function showLogin(evt) {
            form.dialog("open");
            return false;
        }

        function toggleLogin(evt) {
            if (button.prop("loggedIn")) {
                // Log out
                doLogout(evt);
            } else {
                // Log in
                showLogin(evt);
            }
        }
        /*jslint unparam: false*/

        pdp.checkLogin(button);
        button.click(toggleLogin);
        $("#do-login").click(startLogin);
        $("#do-signup").click(startSignup);

        return button;
    };

    my.checkLogin = function (button, onSuccess, onFailure) {
        $.ajax({
            url: pdp.app_root + "/check_auth_app/",
            dataType: "json",

            // show logged-in status
            success: function (data) {
                button.prop("loggedIn", true);
                button.html("Logout as: " + data.email);
                if (onSuccess) {
                    onSuccess();
                }
            },

            // show link to login
            error: function () {
                button.prop("loggedIn", false);
                button.html("Login with OpenID");
                if (onFailure) {
                    onFailure();
                }
            }
        });
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

    my.getLoginForm = function (providers) {

        var loginForm;

        function createProviderSelect(id, name, providers) {
            var select = document.createElement("select");
            if (id !== undefined) { select.id = id; }
            if (name !== undefined) { select.name = name; }
            $.each(providers, function (idx, val) {
                select.appendChild(pdp.createOption(val, idx));
            });
            return select;
        }

        function createLoginFieldset(providers) {

            var fieldset, div, providersDiv, select, loginDiv, loginButton,
                seperatorDiv, signupDiv, signupButton;

            fieldset = pdp.createFieldset(undefined, "Login");
            div = fieldset.appendChild(pdp.createDiv("login-or-signup"));
            div.appendChild(pdp.createLabel(undefined, "OpenID Provider"));

            providersDiv = div.appendChild(pdp.createDiv());
            select = createProviderSelect(undefined, "openid-provider", providers);
            providersDiv.appendChild(select);

            loginDiv = div.appendChild(pdp.createDiv());
            loginButton = pdp.createInputElement("button", undefined, "do-login", undefined, "Open login window");
            loginDiv.appendChild(loginButton);

            seperatorDiv = div.appendChild(pdp.createDiv());
            seperatorDiv.appendChild(document.createTextNode("--- or ---"));

            signupDiv = div.appendChild(pdp.createDiv());
            signupButton = pdp.createInputElement("button", undefined, "do-signup", undefined, "Open sign up window");
            signupDiv.appendChild(signupButton);
            return fieldset;
        }

        function createWorksFieldset() {
            var fieldset, p, a, linkText;
            fieldset = pdp.createFieldset(undefined, "How it works");
            p = fieldset.appendChild(document.createElement("p"));
            p.appendChild(document.createTextNode("Click \"Login\" to use an existing OpenID account. " +
                                                  "A new window will open asking you to sign in with the account provider. " +
                                                  "Once signed in, you will be returned to the data portal. " +
                                                  "PCIC uses OpenID to allow us to communicate with users via e-mail. " +
                                                  "If you don't have an OpenID account, click \"Sign up\"." +
                                                  "For information about OpenID click "));
            a = document.createElement("a");
            linkText = document.createTextNode("here");
            a.appendChild(linkText);
            a.href = "http://openid.net/get-an-openid/what-is-openid/";
            p.appendChild(a);
            return fieldset;
        }

        function createWhyFieldset() {
            var fieldset = pdp.createFieldset(undefined, "Why do you want my e-mail address?"),
                p = fieldset.appendChild(document.createElement("p"));
            p.appendChild(document.createTextNode("PCIC will use your address only to contact you in the event major errors  are found in the data or when major changes to the data in the portal are made. " +
                                                  "Your e-mail address is the only personal information that PCIC will gather and will be kept secure."));
            return fieldset;
        }

        loginForm = pdp.createForm("login-form", "login-form", "get");
        // var closeDiv = loginForm.appendChild(createDiv("close-login"));
        // var closeButton = closeDiv.appendChild(document.createElement("button"));
        loginForm.appendChild(createLoginFieldset(providers));
        loginForm.appendChild(createWorksFieldset());
        loginForm.appendChild(createWhyFieldset());
        return loginForm;
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
