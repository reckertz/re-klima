/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global ecsystem,parseNumberconsole,devide,window,module,define,root,global,self */
/*global async,uilogger,nta1010login,nta1000men,kber2,kassenber1cal,nta3001show,nta3005mit,nta3010devlst,nta3007raw,uiloginControl,nta3050users,nta3055user,nta3060invite,nta3020uploader,uimessages,uisystem */
(function () {
    var uihelper = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var sessionUsername = "";
    var sessionType = "";

    var userMessages = [];
    var geo = "";

    var coreaders = [];
    var messageCount = 0;
    var pushMessageCount = 0;
    var msgcounter = 0;
    var jmsgbuffer = [];

    var lastTS = 0;

    var gblHelpers = {

    };
    uihelper.initAll = function () {
        var myInfo = uisystem.getsysInfo();

        if (myInfo.appMode !== 'undefined' && myInfo.appMode === false) {
            if (typeof nta1010login !== "undefined") nta1010login.init();
            if (typeof uilogger !== "undefined") uilogger.init();
        } else {
            if (typeof uilogger !== "undefined") uilogger.init();
            if (typeof nta1010login !== "undefined") nta1010login.init();
        }

        if (typeof uientry !== "undefined") uientry.init();


        if (typeof nta1000men !== "undefined") nta1000men.init();
        if (typeof kassenber1 !== "undefined") kassenber1.init();
        if (typeof kassenber1cal !== "undefined") kassenber1cal.init();

        if (typeof nta3005mit !== "undefined") nta3005mit.init();
        if (typeof kassenBericht !== "undefined") kassenBericht.init();

        if (typeof cfeTables !== "undefined") cfeTables.init();
        if (typeof cfeConfiguration !== "undefined") cfeConfiguration.init();
        if (typeof cfeArticles !== "undefined") cfeArticles.init();
        if (typeof cfeOrder01 !== "undefined") cfeOrder01.init();
        if (typeof cfeOrder02 !== "undefined") cfeOrder02.init();
        if (typeof cfeOrder03 !== "undefined") cfeOrder03.init();
        if (typeof cfeOrder04 !== "undefined") cfeOrder04.init();
        if (typeof cfeArticle01 !== "undefined") cfeArticle01.init();
        if (typeof cfeBase01 !== "undefined") cfeBase01.init();

        if (typeof uirawdata !== "undefined") uirawdata.init();
        if (typeof uirawdatadetails !== "undefined") uirawdetails.init();
        if (typeof uirawprompt !== "undefined") uirawprompt.init();
        if (typeof uicamera !== "undefined") uicamera.init();
        if (typeof kontoklass2 !== "undefined") kontoklass2.init();
        if (typeof cfeDoc01 !== "undefined") cfeDoc01.init();
        if (typeof kontoregelnliste !== "undefined") kontoregelnliste.init();
        if (typeof speechtest !== "undefined") speechtest.init();

        //nta3050users.init();
        //uiloginControl.init();
        //nta3010devlst.init();
        //nta3001show.init();
        //nta3007raw.init();
        //nta3020uploader.init();
        //nta3055user.init();

        if (typeof nta3056reg !== "undefined") nta3056reg.init();
        if (typeof nta3057regupd !== "undefined") nta3057regupd.init();
        if (typeof nta3060invite !== "undefined") nta3060invite.init();
        if (typeof uimessages !== "undefined") uimessages.init();
        if (typeof uisysdata !== "undefined") uisysdata.init();
        if (typeof uipuschclient !== "undefined") uipushclient.init();

        if (myInfo.appMode && myInfo.appMode === true) {
            if (typeof ntasyncpage !== "undefined") ntasyncpage.init();
        }

        if (myInfo.appMode && myInfo.appMode === true) {
            //  $("loginpage").trigger("create");
        } else {
            // $.mobile.initializePage();
        }




    };

    /**
     * pagechange - Wrapper für pagecontainer mit change
     * mit dynamischem Nachladen
     */
    uihelper.pagechange = function (target, parameters) {
        /*
        {
            script: "js/kber2.js",
            module: "kber2",
            domref: "kber2"
        }
        */
        if (typeof target === "undefined") return {
            error: false,
            message: "Kein target vorgegeben"
        };
        if (typeof target === "string") {
            var t1 = target;
            if (t1.startsWith("#")) t1 = t1.substring(1);
            if (t1 === "loginpage") {
                target = {
                    script: "js/nta1010login.js",
                    module: "nta1010login",
                    domref: "#loginpage"
                };
            } else if (t1 === "userpage") {
                target = {
                    script: "js/nta3055user.js",
                    module: "nta3055user",
                    domref: "#userpage"
                };
            } else if (t1 === "caldata") {
                target = {
                    script: "js/kassenber1cal.js",
                    module: "kassenber1cal",
                    domref: "#caldata"
                };
            } else {
                // Prüfen gegen ntamenu
                var vgllink = target;
                if (vgllink.startsWith("#")) vgllink = vgllink.substr(1);
                var found = false;
                for (var property in ntamenu) {
                    if (ntamenu.hasOwnProperty(property)) {
                        // do stuff
                        var menu = ntamenu[property];
                        for (var j = 0; j < menu.length; j++) {
                            if (vgllink === menu[j].domref || vgllink === menu[j].module) {
                                target = menu[j];
                                found = true;
                                break;
                            }
                        }
                    }
                    if (found === true) break;
                }
                // da bleibt nur der Default-Versuch
                if (found === false) {
                    target = {
                        script: "js/" + t1 + ".js",
                        module: t1,
                        domref: t1
                    };
                }
            }
        }
        if (typeof target.module === "undefined") return {
            error: false,
            message: "Kein Modul vorgegeben"
        };

        if (target.domref === "undefined") {
            target.domref = target.module;
        }
        if (target.script === "undefined") {
            target.script = "js/" + target.module + ".js";
        }
        /**
         * hier geht es richtig los
         */
        try {
            var modulename = target.module;
            var modulescript = target.script;
            var domref = target.domref;
            if (domref.startsWith("#")) {
                domref = domref.substring(1);
            }
            var domhash = "#" + domref;
            if (typeof window[modulename] === "undefined") {
                var url = modulescript;
                console.log("LOAD:" + url);
                $.getScript(url, function (data, textStatus, jqxhr) {
                    // console.log( data ); // Data returned
                    // console.log( textStatus ); // Success
                    // console.log( jqxhr.status ); // 200
                    console.log("*****" + modulename + ".init() ");
                    if (typeof window[modulename] === "undefined") {
                        alert("Modul nicht gefunden:" + url);
                        return {
                            error: true,
                            message: url + " nicht gefunden"
                        };
                    }
                    if (typeof window[modulename].init === "undefined") {
                        alert("init zu Modul nicht gefunden:" + url);
                        return {
                            error: true,
                            message: url + " init nicht gefunden"
                        };
                    }
                    window[modulename].init();
                    // $('body').pagecontainer("change", domhash, {
                    $.mobile.pageContainer.pagecontainer("change", domhash, parameters);
                });
            } else {
                if (!$(domhash).length > 0) {
                    console.log("*****" + modulename + ".init() " + " ");
                    window[modulename].init();
                }
                console.log("*****" + modulename + " " + "vor change 2");
                $.mobile.pageContainer.pagecontainer("change", domhash, parameters);
            }
            return ({
                error: false,
                message: "OK"
            });
        } catch (err) {
            sysbase.putMessage(target.module + " kann nicht aufgerufen werden:" + err.message, 3);
            return ({
                error: true,
                message: err.message
            });
        }
    };

    /**
     * modulecheck - prüft modul
     * mit dynamischem Nachladen
     */
    uihelper.modulecheck = function (target, callback) {
        if (typeof target === "undefined") return {
            error: false,
            message: "Kein target vorgegeben"
        };
        if (typeof target === "string") {
            var t1 = target;
            if (t1.indexOf("#") === 0) {
                t1 = t1.substring(1);
            }
            target = {
                script: "js/" + t1 + ".js",
                module: t1,
            };
        }

        if (typeof target.module === "undefined") callback({
            error: false,
            message: "Kein Modul vorgegeben"
        });

        if (target.script === "undefined") {
            target.script = "js/" + target.module + ".js";
        }
        /**
         * hier geht es richtig los
         */
        try {
            var modulename = target.module;
            var modulescript = target.script;
            var url = modulescript;
            if (typeof window[modulename] === "undefined") {
                console.log("LOAD:" + url);
                $.getScript(url, function (data, textStatus, jqxhr) {
                    // console.log( data ); // Data returned
                    // console.log( textStatus ); // Success
                    // console.log( jqxhr.status ); // 200
                    console.log("LOAD:" + url + " ok");
                    if (typeof window[modulename] === "undefined") {
                        alert("Modul nicht gefunden:" + url);
                        callback({
                            error: true,
                            message: url + " nicht gefunden"
                        });
                        return;
                    } else {
                        console.log("LOAD:" + url + " done");
                        if (typeof window[modulename].init === "undefined") {
                            // alert("init zu Modul nicht gefunden:" + url);
                            callback({
                                error: true,
                                message: url + " init nicht gefunden"
                            });
                        } else {
                            window[modulename].init();
                            callback({
                                error: false,
                                message: "OK"
                            });
                            return;
                        }
                    }
                });
            } else {
                console.log("LOAD:" + url + " nicht notwendig");
                callback({
                    error: false,
                    message: "OK"
                });
                return;
            }
        } catch (err) {
            console.log("LOAD:" + JSON.stringify(target) + " ERROR:" + err.message);
            sysbase.putMessage(" " + target.module + " kann nicht aufgerufen werden:" + err.message, 3);
            callback({
                error: true,
                message: err.message
            });
            return;
        }

    };



    uihelper.setUsername = function (loginUsername) {
        /** 
         * Dummy
         */
        gblHelpers.username = loginUsername;
    };

    uihelper.getUsername = function () {
        /** 
         * Dummy
         */
        return "Climate-Expert";
    };



    uihelper.setGeoMessage = function (message) {
        geo = message;
        return;
    };

    uihelper.getGeoMessage = function () {
        return geo;
    };


    uihelper.getGeoposition = function (callback) {
        setGeoposition(function (erg, msg) {
            geo = msg;
            callback(erg, msg);
            return;
        });
    };

    function setGeoposition(callback) {
        var gmsg = "";
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        gmsg = "Latitude: " + position.coords.latitude +
                            "<br>Longitude: " + position.coords.longitude;
                        callback(false, gmsg);
                    },
                    function (err) {
                        gmsg = 'ERROR(' + err.code + '): ' + err.message;
                        callback(true, gmsg);
                    }, {
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 5 * 60 * 1000
                    });

            } else {
                gmsg = "Geolocation is not supported by this browser.";
                callback(true, gmsg);
            }
        } catch (err) {
            callback(true, err.message);
        }
    }



    /**
     * diverse Funktionen für spätere Analysen
     */
    var key;
    var value;
  


    /**
     * Dummy
     */
    uihelper.checkSessionLogin = function (ret) {
            return;
    };


    uihelper.getLocaleDatum = function (thisday) {
        return getLocaleDatumUI(thisday, false);
    };

    uihelper.getLocaleDatumBR = function (thisday) {
        return getLocaleDatumUI(thisday, true);
    };

    function getLocaleDatumUI(thisday, br) {
        var thisdayISO = thisday.toISOString();
        var jetzt = thisday.toLocaleDateString("de");
        console.log("getLocaleDatumUI-jetzt:" + jetzt);
        var thisLOCDATUM = "";
        var tag;
        try {
            var jetztArr = jetzt.match(/(\d+)(\D+)(\d+)(\D+)(\d+)/);
            if (jetztArr.length >= 5) {
                if (jetztArr[1].length === 1) jetztArr[1] = "0" + jetztArr[1];
                if (jetztArr[3].length === 1) jetztArr[3] = "0" + jetztArr[3];
                if (jetztArr[5].length === 1) jetztArr[5] = "0" + jetztArr[5];
                var jetztString = jetztArr.slice(1).join("");
                thisLOCDATUM = jetztString;
                if (br && br === true) {
                    thisLOCDATUM += "<br>";
                } else {
                    thisLOCDATUM += " ";
                }
                thisLOCDATUM += thisday.toTimeString().substring(0, 17);
                return thisLOCDATUM;
            } else {
                console.log("getLocaleDatumUI-regex Fallback");
                tag = thisdayISO.substr(0, 10);
                thisLOCDATUM = tag.substr(8, 2) + "." + tag.substr(5, 2) + "." + tag.substr(0, 4);
                if (br && br === true) {
                    thisLOCDATUM += "<br>";
                } else {
                    thisLOCDATUM += " ";
                }
                thisLOCDATUM += thisday.toTimeString().substring(0, 17);
                return thisLOCDATUM;
            }
        } catch (err) {
            /**
             * entweder falsches Datum oder Safari-Problem etc.
             * Aufbereitung für de
             */
            console.log("getLocaleDatumUI-ERR Fallback:" + err.message);
            tag = thisdayISO.substr(0, 10);
            thisLOCDATUM = tag.substr(8, 2) + "." + tag.substr(5, 2) + "." + tag.substr(0, 4);
            if (br && br === true) {
                thisLOCDATUM += "<br>";
            } else {
                thisLOCDATUM += " ";
            }
            thisLOCDATUM += thisday.toTimeString().substring(0, 17);
            return thisLOCDATUM;
        }
    }

    uihelper.getWeekDayText = function (dayofweek) {
        var wt = [
            "So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"
        ];
        if (dayofweek >= 0 && dayofweek <= 6) {
            return (wt[dayofweek]);
        } else {
            return "";
        }

    };

    uihelper.getWeekDayLongtext = function (dayofweek) {
        var wt = [
            "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"
        ];
        if (dayofweek >= 0 && dayofweek <= 6) {
            return (wt[dayofweek]);
        } else {
            return "";
        }

    };

    /**
     * Konvertiert ISO-Datum in das deutsche Datum
     * @param iso
     * @returns
     */
    uihelper.convertISO2D = function (iso) {
        /**
         * konvertieren isoday-Datum nach deutschem Datum
         */
        if (typeof iso !== "undefined" && iso.length === 10) {
            return iso.substr(8, 2) + "." + iso.substr(5, 2) + "." + iso.substr(0, 4);
        } else {
            return iso;
        }
    }

    /**
     * konvertiert Datumsstring
     * von Deutsch TT.MM.JJ oder TT.MM.JJJJ zu ISO JJJJ-MM-TT
     * @param {*} d 
     */
    uihelper.convertD2ISO = function (d) {
        if (typeof d === "undefined") return "";
        if (d === null) return "";
        if (d === "") return "";
        d = d.trim();
        if (d.length === 0) return "";
        var thisday;
        var isoday = null;
        try {
            var d1 = d.split(".");
            //if (d1.length !== 2) return "";
            // Ausgleich verkürztes Jahr
            var y = parseInt(d1[2]);
            if (y < 1000) {
                y += 2000;
                d1[2] = "" + y;
            }
            d1[2] = ("0000" + d1[2]);
            d1[2] = d1[2].substr(d1[2].length - 4, 4);
            d1[1] = ("00" + d1[1]);
            d1[1] = d1[1].substr(d1[1].length - 2, 2);
            d1[0] = ("00" + d1[0]);
            d1[0] = d1[0].substr(d1[0].length - 2, 2);
            isoday = d1[2] + "-" + d1[1] + "-" + d1[0];
            if (uihelper.convertISO2D(isoday) !== d) console.log("*****" + d + "<>" + isoday + "*****");
            return isoday;
        } catch (err) {
            console.log("ERROR Datum 1-toIS:" + err.message + " " + thisday);
            return "";
        }
    };

    /**
     * Konvertiert UTC String nach lokaler Zeit mit deutscher Formatierung
     * Achtung: der Monat wird -1 gerechnet, weil er schon "richtig" erwartet wird
     * @param {*} UTC 
     */
    uihelper.convertUTC2D = function (UTC) {
        if (typeof UTC === "undefined" || UTC.trim().length === 0) {
            return "";
        }
        var d = new Date();
        try {
            d.setUTCFullYear(UTC.substr(0, 4));
            d.setUTCMonth(parseInt(UTC.substr(4 + 1, 2)) - 1);
            d.setUTCDate(UTC.substr(4 + 1 + 2 + 1, 2));
            d.setUTCHours(UTC.substr(11 + 0, 2));
            d.setUTCMinutes(UTC.substr(11 + 2 + 1, 2));
            d.setUTCSeconds(UTC.substr(11 + 2 + 1 + 2 + 1, 2));
            d.setUTCMilliseconds(0);
            var date = d; // new Date(UTC); // das System unterstellt GMT + 1 und das ist nicht korrekt, date ist schon falsch
            var tag = date.toISOString();
            hdiff = date.getTimezoneOffset(); // in Minuten
            var thisday = new Date(date - hdiff * 60 * 1000);
            var thisdayISO = thisday.toISOString();
            return uihelper.convertISO2D(thisdayISO.substring(0, 10)) + " " + thisdayISO.substr(11, 8);
        } catch (err) {
            console.log("uihelper.convertUTC2D ERROR:" + err.message + " " + UTC);
            return UTC;
        }
    };


    /**
     * convertDMS2dd - Konvertieren Geo-Koordinaten
     * +010:55:18 zu Dezimalzahl
     */
    uihelper.convertDMS2dd = function (DMS) {
        var neg = false;
        if (DMS.startsWith("-")) {
            neg = true;
        }
        var dmsstr = DMS;
        if (DMS.startsWith("+") || DMS.startsWith("-")) {
            dmsstr = DMS.substr(1);
        }
        var dmsvec = dmsstr.split(":");
        var dd = parseInt(dmsvec[0]) + parseInt(dmsvec[1]) / 60 + parseInt(dmsvec[2]) / 3600;
        if (neg === true) dd = dd * -1;
        return dd;
    };

    /**
     * generische Prüfung currency
     */

    uihelper.checkCurrencyInput = function (betrag) {
        return checkCurrencyInputX(betrag);
    };

    /**
     * Übergabe betrag als DOM-Input-Element und Prüfung: deutsche Eingabe, konvertiert zu US ...
     * später auch mal mit Formatierung
     * @param betrag
     */
    function checkCurrencyInputX(betrag) {
        var nbetrag = betrag.val().replace(/\./g, '').replace(',', '.');
        if (nbetrag === "" || nbetrag === "0.00") {
            $(betrag).css("border-color", "");
            return true;
        }
        if (isNaN(parseFloat(nbetrag)) || !isFinite(nbetrag)) {
            sysbase.putMessage("Bitte Betrag eingeben", 3);
            $(betrag).focus();
            $(betrag).css({
                "border-color": "red",
                "border-width": "3px"
            });
            return false;
        }
        $(betrag).css("border-color", "");
        return true;
    }

    /**
     * Prüfung auf numerische Eingabe, float
     * @param betrag
     * @returns
     */
    uihelper.checkNumberInput = function (betrag, optionalDecimals) {

        return checkNumberInputX(betrag, optionalDecimals);
    };

    /**
     * numerische Eingabe 
     * @param betrag - DOM-Input
     */
    function checkNumberInputX(betrag, optionalDecimals) {
        try {
            var nbetrag = betrag.val().replace(/\./g, '').replace(',', '.').trim();
            $(betrag).css({
                "border-color": "",
                "border-width": "1px"
            });
            if (typeof optionalDecimals === "undefined") {
                if (nbetrag.indexOf(".") >= 0) {
                    optionalDecimals = 2;
                } else {
                    optionalDecimals = 0;
                }
            }
            if (nbetrag === "" || nbetrag === "0") {
                $(betrag).css("border-color", "");
                return true;
            }
            if (isNaN(parseFloat(nbetrag)) || !isFinite(nbetrag)) {
                sysbase.putMessage("Bitte Betrag eingeben", 3);
                $(betrag).focus();
                $(betrag).css({
                    "border-color": "red",
                    "border-width": "3px"
                });
                return false;
            } else {
                $(betrag).css("border-color", "");
                return true;
            }
        } catch (err) {
            console.log("*****" + err.message + " typeof:" + typeof betrag + " Wert:" + betrag);
        }
    }

    /**
     * converD2US - Zahlenstring von Deutsch nach US umwandeln ohne richtige Validierung
     * @param betrag - String in Deutscher Formatierung
     * @returns String in US-Formatierung
     */
    uihelper.convertD2US = function (betrag) {
        return convertD2USX(betrag);
    };


    function convertD2USX(d) {
        /**
         * konvertiert Zahlenstring 
         * von Deutsch Dezimalkomma und Tausenderpunkte zu US Dezimalpunkt und kein Tausenderkomma
         * mit Wegfall Währung etc.
         */
        try {
            if (typeof d === "undefined") return "0.00";
            if (d === null) return "0.00";
            if (typeof d !== "string") return d;
            if (d.trim().length === 0) return "0.00";
            var u = d.replace(/\./g, ""); // nimmt die Tausenderpunkte Wegfall
            u = u.replace(",", "."); // Tausch
            u = u.replace(/[^\d.-]/g, ''); // Filtern alle Zeichen, die nicht erwünscht sind
            return u;
        } catch (err) {
            console.log("convertD2USX" + err.message + " " + typeof d + "=>" + d);
            return "0.00";
        }
    }


    /**
     * convertUS2D - Zahlenstring von US nach Deutsch umwandeln ohne richtige Validierung
     * @param betrag - String in US Formatierung
     * @returns String in Deutscher-Formatierung
     */
    uihelper.convertUS2D = function (betrag) {
        return convertUS2D(betrag);
    };


    function convertUS2D(d) {
        /**
         * konvertiert Zahlenstring 
         * von Deutsch Dezimalkomma und Tausenderpunkte zu US Dezimalpunkt und kein Tausenderkomma
         * mit Wegfall Währung etc.
         */
        try {
            if (d === "undefined") return "0,00";
            if (d === null) return "0,00";
            if (typeof d === "number") {
                d = d.toFixed(2);
            }
            if (typeof d !== "string") return d;
            if (d.trim().length === 0) return "0,00";
            var u = d.replace(/#/g, ""); // Tausche  Platzhalter gegen Leerstring
            u = d.replace(/,/g, "#"); // Tausche Punkte gegen Platzhalter
            u = u.replace(/\./g, ","); // Tausch DezimalPunkt gegen DezimalKomma
            u = u.replace(/#/g, "."); // Tausch Platzhalter gegen Punkte
            u = u.replace(/[^\d.,-]/g, ''); // Filtern alle Zeichen, die nicht erwünscht sind
            return u;
        } catch (err) {
            console.log("convertD2USX" + err.message + " " + typeof d + "=>" + d);
            return "0,00";
        }
    }


 


    /**
     * checkeMailAddress prüft eine eMail-Adresse formal
     * Rückgabe true = korrekt oder false = fehlerhaft
     * @param {*} email 
     */
    uihelper.checkeMailAddress = function (email) {
        var pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (typeof email === "undefined" || email.length < 1 || !pattern.test(email)) {
            return false;
        } else {
            return true;
        }
    };

    /**
     * checkeMailAddressUI ist ein Wrapper für checkeMailAddress
     * es wird ein DOM-Input-Feld für das Passwort übergeben und 
     * das DOM-Input-Feld entsprechend markiert
     * @param {*} email 
     */
    uihelper.checkeMailAddressUI = function (email) {
        var emailinput = $(email).val();
        if (uihelper.checkeMailAddress(emailinput)) {
            $(email).css({
                border: "1px"
            });
            return true;
        } else {
            sysbase.putMessage("e-Mail Adresse ist erforderlich für die Bestätigung", 3);
            $(email).css({
                border: "1px solid red"
            });
            $(email).focus();
            return false;
        }
    };

    /**
     * IBAN Prüfziffer berechnen und UI Rückmelden
     * @param {*} iban 
     */
    uihelper.checkIbanUI = function (iban) {
        var ibaninput = $(iban).val();
        if (uihelper.checkIban(ibaninput)) {
            uihelper.markok(iban);
            return true;
        } else {
            sysbase.putMessage("IBAN-Prüfziffer ist falsch", 3);
            uihelper.markerror(iban);
            $(iban).focus();
            return false;
        }
    };
    /*
     * https://stackoverflow.com/questions/21928083/iban-validation-check
     * deprecated: Returns 1 if the IBAN is valid 
     * Returns FALSE if the IBAN's length is not as should be (for CY the IBAN Should be 28 chars long starting with CY )
     * deprecated: Returns any other number (checksum) when the IBAN is invalid (check digits do not match)
     * Return TRUE, wenn alles ok ist
     */
    uihelper.checkIban = function (ibanstring) {
        var CODE_LENGTHS = {
            AD: 24,
            AE: 23,
            AT: 20,
            AZ: 28,
            BA: 20,
            BE: 16,
            BG: 22,
            BH: 22,
            BR: 29,
            CH: 21,
            CR: 21,
            CY: 28,
            CZ: 24,
            DE: 22,
            DK: 18,
            DO: 28,
            EE: 20,
            ES: 24,
            FI: 18,
            FO: 18,
            FR: 27,
            GB: 22,
            GI: 23,
            GL: 18,
            GR: 27,
            GT: 28,
            HR: 21,
            HU: 28,
            IE: 22,
            IL: 23,
            IS: 26,
            IT: 27,
            JO: 30,
            KW: 30,
            KZ: 20,
            LB: 28,
            LI: 21,
            LT: 20,
            LU: 20,
            LV: 21,
            MC: 27,
            MD: 24,
            ME: 22,
            MK: 19,
            MR: 27,
            MT: 31,
            MU: 30,
            NL: 18,
            NO: 15,
            PK: 24,
            PL: 28,
            PS: 29,
            PT: 25,
            QA: 29,
            RO: 24,
            RS: 22,
            SA: 24,
            SE: 24,
            SI: 19,
            SK: 24,
            SM: 27,
            TN: 24,
            TR: 26
        };
        if (typeof ibanstring === "undefined" || ibanstring === null || ibanstring.length === 0) {
            return false;
        }
        var iban = ibanstring.toUpperCase().replace(/[^A-Z0-9]/g, ''); // keep only alphanumeric characters
        var code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/); // match and capture (1) the country code, (2) the check digits, and (3) the rest
        var digits;
        // check syntax and length
        if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
            return false;
        }
        // rearrange country code and check digits, and convert chars to ints
        digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
            return letter.charCodeAt(0) - 55;
        });
        // final check
        var checkdigits = digits.substring(0, digits.length - 2);
        var checksum = uihelper.mod97(checkdigits + "00");
        if (parseInt(code[2]) !== checksum) {
            return false;
        } else {
            return true;
        }
    };

    uihelper.mod97 = function (digitstring) {
        var checksum = 0;
        var chunk1 = "";
        var chunk2 = "";
        var chunk3 = "";
        var mod1 = 0;
        var mod2 = 0;
        var mod3 = 0;
        chunk1 = digitstring.substr(0, 9);
        mod1 = parseInt(chunk1) % 97;
        if (mod1 < 10) {
            chunk2 = "0" + mod1 + digitstring.substr(9, 7);
        } else {
            chunk2 = "" + mod1 + digitstring.substr(9, 7);
        }
        mod2 = parseInt(chunk2) % 97;
        if (mod2 < 10) {
            chunk3 = "0" + mod2 + digitstring.substr(16);
        } else {
            chunk3 = "" + mod2 + digitstring.substr(16);
        }
        mod3 = parseInt(chunk3) % 97;
        checksum = 98 - mod3;
        return checksum;
    };


    /**
     * markerror - Markierung Eingabefeld als fehlerhaft
     * @param {*} uielem - DOM-Element oder this von jQuery
     */
    uihelper.markerror = function (uielem) {
        if ($(uielem).parent().hasClass("ui-input-text")) {
            $(uielem).parent().css({
                "border-color": "red",
                "border-width": "3px"
            });
            $(uielem).parent().parent().css({
                "border-color": "",
                "border-width": "0px"
            });
        } else if ($(uielem).prop("tagName") === "SPAN") {
            $(uielem).parent().css({
                "border": "solid 3px red"
            });
        } else {
            $(uielem).css({
                "border-color": "red",
                "border-width": "3px"
            });
        }
    };

    /**
     * markok - Markierung Eingabefeld als ok
     * @param {*} uielem - DOM-Element oder this von jQuery
     */
    uihelper.markok = function (uielem) {
        if ($(uielem).parent().hasClass("ui-input-text")) {
            $(uielem).parent().css({
                "border-color": "",
                "border-width": "1px"
            });
            $(uielem).parent().parent().css({
                "border-color": "",
                "border-width": "0px"
            });
        } else if ($(uielem).prop("tagName") === "SPAN") {
            $(uielem).parent().css({
                "border-color": "",
                "border": "0px"
            });
        } else {
            $(uielem).css({
                "border-color": "",
                "border-width": "1px"
            });
        }
    };


    /**
     * markactive - Markierung Eingabefeld als "Eingabe aktiv"
     * @param {*} uielem - DOM-Element oder this von jQuery
     */
    uihelper.markactive = function (uielem) {
        if ($(uielem).parent().hasClass("ui-input-text")) {
            $(uielem).parent().css({
                "background-color": "#ffffaa"
            });
            $(uielem).parent().parent().css({
                "background-color": ""
            });
        } else if ($(uielem).prop("tagName") === "SPAN") {
            $(uielem).parent().css({
                "background-color": "#ffffaa"
            });
        } else {
            $(uielem).css({
                "background-color": "#ffffaa"
            });
        }
    };


    /**
     * markinactive - Markierung Eingabefeld als "Eingabe nicht aktiv"
     * @param {*} uielem - DOM-Element oder this von jQuery
     */
    uihelper.markinactive = function (uielem) {
        if ($(uielem).parent().hasClass("ui-input-text")) {
            $(uielem).parent().css({
                "background-color": ""
            });
            $(uielem).parent().parent().css({
                "background-color": ""
            });
        } else if ($(uielem).prop("tagName") === "SPAN") {
            $(uielem).parent().css({
                "background-color": ""
            });
        } else {
            $(uielem).css({
                "background-color": ""
            });
        }
    };

    /**
     * opentab - einfache, generische Lösung
     */
    uihelper.opentab = function (elem, tabid, callback) {
        if (typeof elem === "string") {
            var elemstr = elem;
            if (!elemstr.startsWith("#")) {
                elemstr = "#" + elem;
            }
            elem = $(elemstr);
        }
        $(".tabcontent").css({
            display: "none"
        });
        $(elem).parent().children().removeClass("active");
        $(elem).addClass("active");
        $(tabid).css({
            display: "block"
        });

        var hh = $(".header").outerHeight();
        var fh = $(".footer").outerHeight();
        var wh = $(window).height();
        var hc = wh - hh - fh - 3;
        $(".content").height(hc);
        var ht = hc - $(elem).parent().height();
        $(tabid).css({
            height: ht
        });

    };


   




    /**
     * Selektionsvorgabe für alle Tabellen - genauer: Collections
     * in ret.record
     * @param api
     * @param callback - gibt ret-Struktur mit error, message, record zurück
     */

    uihelper.getAllTables = function (api, callback) {
        //var myInfo = uisystem.getsysInfo();
        try {
            var jqxhr = $.ajax({
                method: "GET",
                crossDomain: false,
                url: sysbase.getServer(api),
                data: {
                    username: uihelper.getUsername(),
                }
            }).done(function (r1, textStatus, jqXHR) {
                sysbase.checkSessionLogin(r1);
                ret = {};
                try {
                    var j1 = JSON.parse(r1);
                    uihelper.checkSessionLogin(j1);
                    if (j1.records && j1.records !== null) {
                        var records;
                        if (Array.isArray(j1.records)) {
                            records = j1.records.slice();
                        } else {
                            records = $.extend({}, {
                                records: j1.records
                            });

                        }
                        var msg = "";
                        callback({
                            error: false,
                            message: "getAllTables Satz gefunden",
                            records: records
                        });
                        return;
                    } else {
                        callback({
                            error: false,
                            message: "getAllTables kein Satz gefunden",
                            records: null
                        });
                        return;
                    }
                } catch (err) {
                    callback({
                        error: true,
                        message: "getAllTables AJAX/DB-Error-1:" + err.message,
                        records: null
                    });
                    return;
                }
            }).fail(function (err) {
                callback({
                    error: true,
                    message: "getAllTables AJAX ERROR:" + err.message,
                    records: null
                });
                return;
            }).always(function () {
                // nope
            });
        } catch (err) {
            callback({
                error: true,
                message: "getAllTables AJAX ERROR:" + err.message,
                records: null
            });
            return;
        }
    };



    /**
     * Selektionsvorgabe für einen Satz, wenn nicht vorhanden, dann initialisierten Satz zurückgeben
     * in ret.record
     * @param sel
     * @param api
     * @param table
     * @param callback - gibt ret-Struktur mit error, message, record zurück
     */

    uihelper.getOneRecord = function (sel, projection, api, table, callback) {
        //var myInfo = uisystem.getsysInfo();
        //var url47 = uisystem.getActiveServer(api);
        // uihelper.getUsername(),
        var url47 = api;
        var user47 = "";
        // firma: uihelper.getUsername(),
        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer(url47),
            data: {
                sel: JSON.stringify(sel),
                projection: JSON.stringify(projection),
                table: table,
                username: user47
            }
        }).done(function (r1, textStatus, jqXHR) {
            try {
                var j1 = JSON.parse(r1);
                sysbase.checkSessionLogin(r1);
                if (j1.record && j1.record !== null) {
                    var record = $.extend({}, j1.record);
                    var msg = "";
                    callback({
                        error: false,
                        message: "Satz gefunden",
                        record: record
                    });
                    return;
                } else {
                    callback({
                        error: false,
                        message: "kein Satz gefunden",
                        record: null
                    });
                    return;
                }
            } catch (err) {
                callback({
                    error: true,
                    message: "uihelper.getOneRecord AJAX/DB-Error-2:" + err.message,
                    record: null
                });
                return;
            }
        }).fail(function (err) {
            callback({
                error: true,
                message: "AJAX ERROR:" + err.message,
                record: null
            });
            return;
        }).always(function () {
            // nope

        });
    };


    /**
     * Selektionsvorgabe für viele Sätze
     * in ret.record
     * @param sel
     * @param api
     * @param table
     * @param callback - gibt ret-Struktur mit error, message, record zurück
     */
    uihelper.getAllRecords = function (sel, projection, sort, skip, limit, api, table, callback) {
        var myInfo = {}; // uisystem.getsysInfo();
        var url = api; // uisystem.getActiveServer(api);
        var selparm;
        if (typeof sel === "object") {
            selparm = JSON.stringify(sel);
        } else {
            selparm = sel;
        }

        try {
            var jqxhr = $.ajax({
                method: "GET",
                crossDomain: false,
                url: sysbase.getServer(url),
                data: {
                    sel: selparm,
                    projection: JSON.stringify(projection),
                    sort: JSON.stringify(sort),
                    skip: skip,
                    limit: limit,
                    table: table,
                    username: "",
                    firma: "KLI"
                }
            }).done(function (r1, textStatus, jqXHR) {
                try {
                    var j1 = JSON.parse(r1);
                    sysbase.checkSessionLogin(r1);
                    if (j1.records && j1.records !== null) {
                        var records = $.extend({}, j1.records);
                        var msg = "";
                        callback({
                            error: false,
                            message: "Satz gefunden",
                            records: records
                        });
                    } else {
                        callback({
                            error: false,
                            message: "kein Satz gefunden",
                            records: null
                        });
                    }
                } catch (err) {
                    callback({
                        error: true,
                        message: "getAllRecords AJAX/DB-Error-3:" + err.message + " " + err.stack,
                        records: null
                    });
                }
            }).fail(function (err) {
                callback({
                    error: true,
                    message: "AJAX ERROR:" + err.message,
                    records: null
                });
            }).always(function () {
                // nope
            });
        } catch (err) {
            callback({
                error: true,
                message: "AJAX ERROR:" + err.message,
                record: null
            });
        }

    };


    /**
     * Selektionsvorgabe für inkrementelles Update für einen Satz mit upsert
     * in ret.record - _id wird entfernt, record mit stringify
     * @param selfields
     * @param updfields
     * @param api
     * @param table
     * @param record
     * @param callback - gibt ret-Struktur mit error, message, record zurück
     */
    uihelper.setOneRecord = function (selfields, updfields, api, table, callback) {
        // var myInfo = uisystem.getsysInfo();
        try {
            var jqxhr = $.ajax({
                method: "POST",
                crossDomain: false,
                url: sysbase.getServer(api),
                data: {
                    selfields: JSON.stringify(selfields),
                    updfields: JSON.stringify(updfields),
                    table: table,
                    username: uihelper.getUsername()
                    // firma: myInfo.firma
                }
            }).done(function (r1, textStatus, jqXHR) {
                try {
                    var j1 = JSON.parse(r1);
                    sysbase.checkSessionLogin(r1);
                    callback(j1);
                    return;
                } catch (err) {
                    callback({
                        error: true,
                        message: "AJAX/DB-Error-5:" + err.message + " " + err.stack,
                        record: null
                    });
                }
            }).fail(function (err) {
                callback({
                    error: true,
                    message: "AJAX ERROR:" + err.message,
                    record: null
                });
            }).always(function () {
                // nope
            });
        } catch (err) {
            callback({
                error: true,
                message: "SEVERE ERROR:" + err.message,
                record: null
            });
        }
    };


    /**
     * Selektionsvorgabe für inkrementelles Update für viele Sätze mit findAndModify
     * @param selfields
     * @param updfields
     * @param api
     * @param table
     * @param record
     * @param callback - gibt ret-Struktur mit error, message, records zurück
     * es ist zu prüfen, ob records null ist, ein Satz oder ein Array von Sätzen
     */
    uihelper.setAllRecords = function (selfields, updfields, api, table, callback) {
        var myInfo = uisystem.getsysInfo();
        try {
            var jqxhr = $.ajax({
                method: "POST",
                crossDomain: false,
                url: sysbase.getServer(api),
                data: {
                    selfields: JSON.stringify(selfields),
                    updfields: JSON.stringify(updfields),
                    table: table,
                    username: uihelper.getUsername(),
                    firma: myInfo.firma
                }
            }).done(function (r1, textStatus, jqXHR) {
                try {
                    var j1 = JSON.parse(r1);
                    sysbase.checkSessionLogin(r1);
                    callback(j1);
                    return;
                } catch (err) {
                    callback({
                        error: true,
                        message: "setAllRecords AJAX/DB-Error-6:" + err.message,
                        record: null
                    });
                }
            }).fail(function (err) {
                callback({
                    error: true,
                    message: "setAllRecords AJAX ERROR:" + err.message,
                    record: null
                });
            }).always(function () {
                // nope
            });
        } catch (err) {
            callback({
                error: true,
                message: "setAllRecords SEVERE ERROR:" + err.message,
                record: null
            });
        }
    };


    /**
     * Selektionsvorgabe für inkrementelles Update für einen Satz mit upsert
     * in ret.record - _id wird entfernt, record mit stringify
     * @param selfields
     * @param updfields - enthält den record mit allen Zuweisungen
     * @param api
     * @param table
     * @param record
     * @param callback - gibt ret-Struktur mit error, message, record zurück
     */
    uihelper.insOneRecord = function (selfields, updfields, api, table, callback) {
        // var myInfo = uisystem.getsysInfo();
        try {
            var jqxhr = $.ajax({
                method: "POST",
                crossDomain: false,
                url: sysbase.getServer(api),
                data: {
                    sel: JSON.stringify(selfields),
                    record: JSON.stringify(updfields),
                    table: table,
                    username: uihelper.getUsername()
                    // firma: myInfo.firma
                }
            }).done(function (r1, textStatus, jqXHR) {
                try {
                    var j1 = JSON.parse(r1);
                    sysbase.checkSessionLogin(r1);
                    callback(j1);
                    return;
                } catch (err) {
                    callback({
                        error: true,
                        message: "AJAX/DB-Error-5:" + err.message + " " + err.stack,
                        record: null
                    });
                }
            }).fail(function (err) {
                callback({
                    error: true,
                    message: "AJAX ERROR:" + err.message,
                    record: null
                });
            }).always(function () {
                // nope
            });
        } catch (err) {
            callback({
                error: true,
                message: "SEVERE ERROR:" + err.message,
                record: null
            });
        }
    };



    /**
     * Selektionsvorgabe für einen Satz für delete
     * in ret.record - _id wird entfernt, record mit stringify
     * @param sel -  belibt leer, weil _id genommen wird
     * @param api
     * @param table
     * @param record
     * @param callback - gibt ret-Struktur mit error, message, record zurück
     */

    uihelper.delOneRecord = function (sel, api, table, record, callback) {
        // var myInfo = uisystem.getsysInfo();
        try {
            var jqxhr = $.ajax({
                method: "POST",
                crossDomain: false,
                url: sysbase.getServer(api),
                data: {
                    sel: JSON.stringify(sel),
                    table: table,
                    record: JSON.stringify(record),
                    username: uihelper.getUsername(),
                }
            }).done(function (r1, textStatus, jqXHR) {
                try {
                    var j1 = JSON.parse(r1);
                    sysbase.checkSessionLogin(r1);
                    callback(j1);
                    return;
                } catch (err) {
                    callback({
                        error: true,
                        message: "AJAX/DB-Error-7:" + err.message,
                        record: null
                    });
                }
            }).fail(function (err) {
                callback({
                    error: true,
                    message: "AJAX ERROR:" + err.message,
                    record: null
                });
            }).always(function () {
                // nope
            });
        } catch (err) {
            callback({
                error: true,
                message: "SEVERE ERROR:" + err.message,
                record: null
            });
        }
    };

    /**
     * Berechnen uuid gemäß RFC4122 
     * https://gist.github.com/jcxplorer/823878
     */
    uihelper.uuid = function () {
        var uuid = "",
            i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i == 8 || i == 12 || i == 16 || i == 20) {
                uuid += "-";
            }
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    };

    /**
     * Berechnung und Speicherung Historieneintrag
     * @param kommentar - aus der Anwendung vorgegeben als String
     * username wird bei Server-Anwendung versorgt, sonst s.u.
     * @returns Struktur mit ts, username, app, msg (statt text1 bis text4 früher)
     */

    uihelper.setHistoryEntry = function (record, kommentar, func, username) {
        if (typeof record.history === "undefined") record.history = [];
        // das ist kritisch
        if (!Array.isArray(record.history)) {
            var tmp = record.history;
            record.history = [];
        }
        var historyEntry = {};
        historyEntry.msg = kommentar; // statt text1
        // lokales Datum ts in ISO-String statt text2
        var date = new Date();
        historyEntry.ts = new Date(date - date.getTimezoneOffset() * 60 * 1000).toISOString();
        // username statt text3
        if (typeof username !== "undefined") {
            historyEntry.username = username;
        } else {
            historyEntry.username = uihelper.getUsername();
        }
        // app statt text4
        if (typeof func !== "undefined") {
            historyEntry.app = func;
        } else {
            historyEntry.app = "setHistoryEntry";
        }
        record.history.push(historyEntry);
        return historyEntry;
    };


    uihelper.html2print = function (trext) {
        return html2printX(text);
    };

    function html2printX(text) {
        if (typeof text !== "undefined") {
            text = text.replace(/<br>/g, "\n");
        } else {
            text = "";
        }
        return text;
    }


    /**
     * iterateJSON2HTML - bereitet html zu JSON auf
     *          obj - JSON-Struktur
     *          res - hilfsvariable für die html-Aufbereitung, initialer Aufruf mit ""
     *          dis - Hilfsvariable für die Einrückung links, initialer Aufruf mit ""
     */
    uihelper.iterateJSON2HTML = function (obj, res, dis) {
        res = "<pre>";
        return iterateJSON2HTMLX(obj, res, dis) + "</pre>";
    };

    function iterateJSON2HTMLX(obj, res, dis) {
        try {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (property.startsWith("_")) {
                        res += "_";
                    } else if (typeof obj[property] === 'function') {
                        res += "<br>" + dis + "=>" + property;
                        console.log("Function:" + property);
                    } else if (typeof obj[property] === "object") {
                        res += "<br>";
                        res += dis;
                        res += "<b>";
                        res += property;
                        res += "</b>";
                        res += "(";
                        res += typeof obj[property];
                        if (Array.isArray(obj[property])) {
                            dis += "    ";
                            res += "<br>" + dis + "=>" + property + " {";
                            for (var iarr = 0; iarr < obj[property].length; iarr++) {
                                console.log("Iterate-0a:" + property + " " + dis.len / 4);
                                res = iterateJSON2HTMLX(obj[property], res, dis);
                                console.log("Iterate-0b:" + property + " " + dis.len / 4);
                            }
                            if (dis.length > 4) dis = dis.substr(0, dis.length - 4);
                            res += "<br>" + dis + "}";
                        } else {
                            res += ")";
                            /**
                             * Einschränken der Rekursion 
                             * 
                             * && typeof obj[property] !== 'function'
                             */
                            if (dis.length <= 120 && typeof obj[property] !== 'function') {
                                res += "{";
                                dis += "    ";
                                console.log("Iterate-1:" + property + " " + dis.len / 4);
                                res = iterateJSON2HTMLX(obj[property], res, dis);
                                if (dis.length > 4) dis = dis.substr(0, dis.length - 4);
                                res += "<br>";
                                res += dis; // " ";
                                res += "}";
                            } else {
                                res += "***KEINE WEITERE ITERATION***";
                            }
                        }
                    } else {
                        res += "<br>";
                        res += dis;
                        res += "<b>";
                        res += property;
                        res += "</b>";
                        res += "(";
                        res += typeof obj[property];
                        res += ")";
                        res += ":";
                        res += obj[property] + ", ";
                    }
                }
            }
        } catch (err) {
            res += "***ERROR***" + err;
        }
        return res;
    }

    /**
     * Erzeugen HTML-Anzeige, strukturiert, html ist escaped!!!
     * @param obj - JSON-Struktur
     * @param res - init ""
     * @param dis - init ""
     * @returns
     */
    uihelper.iterateJSON2pretty = function (obj, res, dis) {
        return iterateJSON2prettyX(obj, res, dis);
    };

    function iterateJSON2prettyX(obj, res, dis) {
        try {
            for (var property in obj) {
                if (property.startsWith("_")) {
                    res += "_";
                } else if (typeof obj[property] === "function") {
                    res += "#";
                } else if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] === "object") {
                        res += "<br>";
                        res += dis;
                        res += "<b>";
                        res += property;
                        res += "</b>";
                        res += "(";
                        res += typeof obj[property];
                        if (Array.isArray(obj[property])) {
                            res += "=>array";
                        }
                        res += ")";
                        /**
                         * Einschränken der Rekursion 
                         * 
                         * && typeof obj[property] !== 'function'
                         */
                        // if (dis.length <= 36 && typeof obj[property] !== 'function') {
                        res += "{";
                        dis += "&nbsp;&nbsp;&nbsp;&nbsp;";
                        if (res.length > 400000) {
                            return (res);
                        }
                        res = iterateJSON2prettyX(obj[property], res, dis);
                        dis = dis.substring(0, dis.length - 24);
                        // if (dis.length > 24) dis = dis.substr(0, dis.length - 24);
                        res += "<br>";
                        res += dis; // " ";
                        res += "}";
                        //} else {
                        //    res += "***KEINE WEITERE ITERATION***";
                        //}
                    } else {
                        res += "<br>";
                        res += dis;
                        res += "<b>";
                        res += property;
                        res += "</b>";
                        res += "(";
                        res += typeof obj[property];
                        res += ")";
                        res += ":";
                        if (typeof obj[property] === "string" && obj[property].startsWith("<")) {
                            htmlx = obj[property].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            htmlx = htmlx.replace(/\&lt;form/g, "<br><b>&lt;form</b>");
                            htmlx = htmlx.replace(/\&lt;table/g, "<br><b>&lt;table</b>");
                            htmlx = htmlx.replace(/\&lt;tr/g, "<br><b>&lt;tr</b>");
                            res += htmlx;
                        } else {
                            res += obj[property] + ", ";
                        }
                    }
                }
            }
        } catch (err) {
            res += "***ERROR***" + err;
        }
        return res;
    }


    /**
     * transformJSON2TableTR - bereitet html zu tr mit td's auf
     *          obj - JSON-Struktur mit den Vorgabedaten einer Zeile
     *          count - hilfsvariable für die th-Aufbereitung, bei 0 wird der th ausgegeben,
     *                  entspricht also einem schlichten Satzzähler, der bei 0 beginnt
     *          format - Angaben zur Druck-/Anzeigeaufbereitung, teilt sich in 
     *                  format.attributes für allgemeine Vorgaben und
     *                  format.fields[] für feldspezifische Vorgaben
     *                  wenn format.fields fehlt und somit die alte Formatierung vorliegt, dann 
     *                  wird format.fields daraus generiert, die Feldreihenfolge ist dann alphabetisch
     *          rowid - fakultativ, wird als tr-Attribut ausgegeben
     *          rowclass - fakultativ, wird als tr-Class ausgegeben
     *          return ist der html-code zu einer Datenzeile tr oder zur Kopfzeile und der ersten Datenzeile
     *                   die aufrufende Anwendung muss dies aufbereiten
     */
    uihelper.transformJSON2TableTR = function (obj, count, format, rowid, rowclass) {
        if (typeof format.attributes === "undefined") format.attributes = {};
        var objfields = Object.keys(obj);
        var saveattributes = uihelper.cloneObject(format.attributes);
        delete format.attributes;
        var formatfields = [];
        if (typeof format !== "undefined") formatfields = Object.keys(format);
        if (formatfields.length <= 0) {
            format = {};
            for (var iobjfield = 0; iobjfield < objfields.length; iobjfield++) {
                format[objfields[iobjfield]] = {
                    title: objfields[iobjfield]
                }
            }
        }
        return transformJSON2TableTRX(obj, count, saveattributes, format, rowid, rowclass);
    };

    function transformJSON2TableTRX(obj, count, formatattributes, format, rowid, rowclass) {
        var header = "";
        var line = "";
        var res = "";
        var attrs = [];
        try {
            for (var property in format) {
                if (format.hasOwnProperty(property)) {
                    attrs = [];
                    var cont = "";
                    if (typeof formatattributes === "undefined") formatattributes = {};
                    if (typeof formatattributes.onlyFormat !== "undefined" && formatattributes.onlyFormat === true && typeof formatattributes[property] === "undefined") {
                        continue;
                    }
                    if (typeof obj[property] === "object" && formatattributes.skipObjects === true) {
                        continue;
                    }
                    var attr = "";
                    if (format && typeof format[property] !== "undefined" &&
                        format[property].width && format[property].width.length > 0) {
                        attrs.push(" width='" + format[property].width + "'");
                    }
                    if (count === 0) {
                        header += "<th" + attr + ">";
                        if (typeof format[property] !== "undefined" && typeof format[property].title !== "undefined" && format[property].title.length > 0) {
                            header += format[property].title;
                        } else {
                            header += property;
                        }
                        header += "</th>";
                    }
                    if (typeof obj[property] === "object") {
                        cont = JSON.stringify(obj[property], null, " ");
                    } else {
                        var typ = typeof obj[property];
                        var wrt = obj[property];
                        if (typeof wrt === "undefined" ||
                            wrt === null || wrt === "") {
                            contentstring = "&nbsp;";
                        } else if (format && typeof format[property] !== "undefined") {
                            cont = wrt;
                            if (format[property].pattern && format[property].pattern === "currency") {
                                attrs.push(" align='right'");
                                cont = parseFloat(wrt).toLocaleString('de-DE', {
                                    minimumFractionDigits: 2
                                });
                            }
                            if (format[property].typ && format[property].typ === "checkbox") {
                                cont = "";
                                cont += "<input ";
                                cont += "type='checkbox'";
                                if (format[property].class) {
                                    cont += " class='" + format[property].class + "'";
                                }
                                if (wrt === true) cont += " checked";
                                cont += ">";
                            }
                            if (format[property].width) {
                                attrs.push(" width='" + format[property].width + "'");
                            }
                            if (format[property].align) {
                                attrs.push(" align='" + format[property].align + "'");
                            }
                        } else if (typ === "number") {
                            attrs.push("align='right'");
                            cont = wrt;
                        } else if (!isNaN(wrt)) {
                            attrs.push("align='right'");
                            cont = wrt;
                        } else {
                            if (wrt.length <= 3) {
                                attrs.push("align='center'");
                            } else {}
                            cont = wrt;
                        }
                    }
                    if (format && typeof format[property] !== "undefined" &&
                        format[property].linkclass && format[property].linkclass.length > 0) {
                        attrs.push("class=" + format[property].linkclass);
                    }
                    if (typeof format[property] !== "undefined" && typeof format[property].css !== "undefined") {
                        var cssstring = JSON.stringify(format[property].css);
                        cssstring = cssstring.substr(1, cssstring.length - 2);
                        attrs.push(" style='" + cssstring + "'");
                    }
                }
                line += "<td";
                line += attrs.join(" ");
                line += ">";
                line += cont;
                line += "</td>";
            }
            res = "";
            if (header.length > 0) {
                res += "<thead>";
                res += "<tr>" + header + "</tr>";
                res += "</thead>";
                res += "<tbody>";
            }
            var rowattr = "";
            if (typeof rowid !== "undefined" && rowid.length > 0) {
                rowattr += " rowid='" + rowid + "'";
            }
            if (typeof rowclass !== "undefined" && rowclass.length > 0) {
                rowattr += " class='" + rowclass + "'";
            }
            res += "<tr" + rowattr + ">" + line + "</tr>";
        } catch (err) {
            res += "***ERROR***" + err + " " + err.stack;
        }
        return res;
    }

    uihelper.normalizeString = function (instring) {
        /**
         * toLowerCase, Sonderzeichen raus, Umlaute auflösen
         * nur ein Blank zwischen Worten
         */
        var fragvgl = instring.toLowerCase();
        // html-Tags entfernen
        fragvgl = fragvgl.replace(/<\/?[^>]+(>|$)/g, "");
        // Sonderzeichen
        fragvgl = fragvgl.replace(/,/g, " ");
        fragvgl = fragvgl.replace(/\./g, " ");
        fragvgl = fragvgl.replace(/\+/g, " ");
        fragvgl = fragvgl.replace(/-/g, " ");
        fragvgl = fragvgl.replace(/&/g, " ");
        fragvgl = fragvgl.replace(/\s\s+/g, ' ');
        // Umlaute
        fragvgl = fragvgl.replace(/ä/g, "ae");
        fragvgl = fragvgl.replace(/ö/g, "oe");
        fragvgl = fragvgl.replace(/ü/g, "ue");
        fragvgl = fragvgl.replace(/ß/g, "ss");
        return fragvgl;
    };

    uihelper.escapeHtmlInString = function (instring) {
        var fragvgl = instring.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        return fragvgl;
    };

    uihelper.removeHtmlInString = function (instring) {
        if (typeof instring !== "undefined" && instring !== null && instring.length > 0) {
            var fragvgl = instring.replace(/<\/?[^>]+(>|$)/g, "");
            return fragvgl;
        } else {
            return instring;
        }
    };


    uihelper.transformDotIndexes = function (upddots) {
        // Index-Adressierung darf nicht .[99]. sein sondern darf nur .99. sein
        // daher Iteration über regex. für Aufbereitung nach dotize für
        // die Parameterübergabe in $set an MongoDB aus node.js
        var regex = /\[([0-9]+)\]/;
        var newdots = {};
        for (var property in upddots) {
            if (upddots.hasOwnProperty(property)) {
                // do stuff
                var value = upddots[property];
                var pname = property;
                var matches = pname.match(regex);
                if (null != matches) {
                    for (var i = 0; i < matches.length; i++) {
                        var num = matches[i];
                        pname = pname.replace("[" + num + "]", "." + num);
                    }
                }
                newdots[pname] = value;
            }
        }
        return newdots;
    };

    /**
     * Download einer HTML-Tabelle
     * @param {*} jQhtmltable entweder mit # als Verweis auf HTML-Table oder String als HTML-Table
     * @param {*} filename 
     */
    uihelper.downloadHtmlTable = function (jQhtmltable, filename) {

        var mimeType = "text/html";
        var elHtml = "";
        elHtml += "<html>";
        elHtml += "<head>";
        elHtml += "<meta charset='UTF-8'>";
        elHtml += "</head>";
        elHtml += "<body>";
        elHtml += "<table>";
        if (jQhtmltable.startsWith("#")) {
            elHtml += $(jQhtmltable).html();
        } else {
            elHtml += jQhtmltable;
        }
        elHtml += "</table>";
        elHtml += "</body>";
        elHtml += "</html>";
        if (navigator.msSaveBlob) { // IE 10+ 
            navigator.msSaveBlob(new Blob([elHtml], {
                type: mimeType + ';charset=utf-8;'
            }), filename);
        } else {
            var link = document.createElement('a');
            mimeType = mimeType || 'text/plain';
            link.setAttribute('download', filename);
            link.style.display = 'none';
            var cstring = encodeURIComponent(elHtml);
            sysbase.putMessage("Download:" + cstring.length);
            link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + cstring);
            link.click();
        }
    };

    /**
     * Datei aus String vom Client downloaden
     */
    uihelper.downloadfile = function (filename, largestring, callback) {

        var jqxhr = $.ajax({
            method: "POST",
            url: sysbase.getServer("getbackasfile"),
            data: {
                filename: filename,
                largestring: largestring
            }
        }).done(function (r1) {
            console.log("getbackasfile:" + filename + "=>" + r1);
            var j1 = JSON.parse(r1);
            if (j1.error === false) {
                var download_path = j1.path;
                // Could also use the link-click method.
                // window.location = download_path;
                window.open(download_path, '_blank');
                sysbase.putMessage(filename + " download erfolgt", 1);
            } else {
                sysbase.putMessage(filename + " download ERROR:" + j1.message, 3);
            }
            return;
        }).fail(function (err) {
            console.log("getbackasfile:" + filename + "=>" + err.message);
            sysbase.putMessage(err, 3);
            return;
        }).always(function () {
            // nope
        });
    };

    /**
     * geolocation mit callback returns: latitude, longitude
     * @param {*} country_code  - DEU für Deutschland! 
     * @param {*} postal_code   - Postleitzahl
     * @param {*} city          - Stadt
     * @param {*} street        - Strasse und Hausnummer
     * @param {*} callback      - Rückgabe latitude und longitude in ret-Objekt als Klammer!
     */
    uihelper.geolocation = function (country_code, postal_code, city, street, callback) {
        /**
         * Plausi: nur ausführen, wenn Vorgaben signifikant sind
         */

        if (country_code.length < 3 || postal_code.length === 0 || city.length === 0) {
            callback({
                error: true,
                message: "Mindestens Land, PLZ und Ort müssen vorgegeben werden"
            });
            return;
        }
        var geokey = "AswBhcYUHkAHY9_1BxGfDyrv5NpiWJBArkyDIAM2ZuLAWGAVCAyz92ZAXpl2rQ_r";
        var geoservder = "http://dev.virtualearth.net/REST/v1/Locations/DE/postalCode/locality/addressLine";
        /**
         * und https://msdn.microsoft.com/de-de/library/mt712657.aspx dort wird eine Adresse
         * http://dev.virtualearth.net/REST/v1/Locations/DE/12010/Berlin/Platz%20Der%20Luftbrücke%205?key=BingMapsKey
         */
        var url = "http://dev.virtualearth.net/REST/v1/Locations";
        url += "/" + encodeURI(country_code.trim());
        url += "/" + encodeURI(postal_code.trim());
        url += "/" + encodeURI(city.trim());
        url += "/" + encodeURI(street.trim());
        //url += "?key=" + "AswBhcYUHkAHY9_1BxGfDyrv5NpiWJBArkyDIAM2ZuLAWGAVCAyz92ZAXpl2rQ_r";
        try {
            $.ajax({
                method: "GET",
                crossDomain: false,
                cache: false,
                timeout: 0,
                url: sysbase.getServer(url),
                data: {
                    key: geokey
                }
            }).done(function (r1, textStatus, jqXHR) {
                try {
                    sysbase.checkSessionLogin(r1);
                    var resp = jqXHR.responseText;
                    console.log(resp);
                    var j1 = JSON.parse(resp);
                    var coordinates = j1.resourceSets[0].resources[0].point.coordinates;
                    var latitude = coordinates[0];
                    var longitude = coordinates[1];
                    var msg = "Metro:" + latitude + "/" + longitude;
                    sysbase.putMessage(msg, 1);
                    callback({
                        error: false,
                        message: msg,
                        latitude: latitude,
                        longitude: longitude
                    });
                } catch (err) {
                    sysbase.putMessage(err.message, 3);
                    callback({
                        error: true,
                        message: err.message
                    });
                }
            }).fail(function (err) {
                sysbase.putMessage(err.message, 3);
                callback({
                    error: true,
                    message: err.message
                });
            }).always(function () {
                // nope
            });
        } catch (err) {
            sysbase.putMessage(err.message, 3);
            callback({
                error: true,
                message: err.message
            });
        }
    };


    /**
     * geodistance - rechnet mit externem Server, virtualearth.net
     *               aus Microsoft Bing mit Dev-Key
     * @param {*} olatitude     origin latitude
     * @param {*} olongitude    origin longitude
     * @param {*} tlatitude     target latitude
     * @param {*} tlongitude    target longitude
     * @param {*} callback      callback returns distance
     */
    uihelper.geodistance = function (olatitude, olongitude, tlatitude, tlongitude, callback) {
        if (olongitude === null) olongitude = "6.91892";
        if (olatitude === null) olatitude = "50.76633";

        if (typeof olatitude === "number") olatitude = olatitude.toFixed(6);
        if (typeof olongitude === "number") olongitude = olongitude.toFixed(6);
        if (typeof tlatitude === "number") tlatitude = tlatitude.toFixed(6);
        if (typeof tlongitude === "number") tlongitude = tlongitude.toFixed(6);

        if (typeof olatitude !== "string") olatitude = "" + olatitude;
        if (typeof olongitude !== "string") olongitude = "" + olongitude;
        if (typeof tlatitude !== "string") tlatitude = "" + tlatitude;
        if (typeof tlongitude !== "string") tlongitude = "" + tlongitude;

        if (olatitude === tlatitude && olongitude === tlongitude) {
            callback({
                error: false,
                message: "Gleicher Standort",
                distance: 0
            });
        }

        var url1 = "https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix";
        //url1 += "?origins=" + olatitude + "," + olongitude; // + ";" + olatitude + "," + olongitude;
        //url1 += "&destinations=" + tlatitude + "," + tlongitude; // + ";" + latitude + "," + longitude;
        //url1 += "&travelMode=driving";
        // &startTime=startTime   // 2017-06-15T8:00:00-07:00 - optional
        // &timeUnit=timeUnit     // optional
        //url1 += '&key=' + 'AswBhcYUHkAHY9_1BxGfDyrv5NpiWJBArkyDIAM2ZuLAWGAVCAyz92ZAXpl2rQ_r';
        async.waterfall([
            function (callback1) {
                try {
                    var jqxhr = $.ajax({
                        method: "GET",
                        crossDomain: false,
                        cache: false,
                        timeout: 0,
                        url: sysbase.getServer(url1),
                        data: {
                            "origins": olatitude + "," + olongitude, // + ";" + olatitude + "," + olongitude;
                            "destinations": tlatitude + "," + tlongitude, // + ";" + latitude + "," + longitude;
                            "travelMode": "driving",
                            // &startTime=startTime   // 2017-06-15T8:00:00-07:00 - optional
                            // &timeUnit=timeUnit     // optional
                            key: 'AswBhcYUHkAHY9_1BxGfDyrv5NpiWJBArkyDIAM2ZuLAWGAVCAyz92ZAXpl2rQ_r'
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        try {
                            sysbase.checkSessionLogin(r1);
                            var resp = jqXHR.responseText;
                            console.log(resp);
                            var j1 = JSON.parse(resp);
                            var distance = 0;
                            if (j1.statusCode === 200) {
                                distance = j1.resourceSets[0].resources[0].results[0].travelDistance.toFixed(3);
                            }
                            sysbase.putMessage("Distanz:" + distance);
                            callback({
                                error: false,
                                message: "Distanz:" + distance,
                                distance: distance
                            });

                        } catch (err) {
                            sysbase.putMessage(err.message, 3);
                            callback({
                                error: true,
                                message: err.message,
                                distance: null
                            });

                        }
                    }).fail(function (err) {

                        if (err.responseText.indexOf("too many requests") > 0) {
                            sysbase.putMessage("geodistance too many requests", 3);
                        } else {
                            sysbase.putMessage("geodistance:" + err.responseText, 3);
                        }
                        console.log(err.responseText);
                        callback({
                            error: true,
                            message: err.responseText,
                            distance: null
                        });
                    }).always(function () {
                        // nope
                    });
                } catch (err) {
                    sysbase.putMessage(err.message, 3);
                    callback({
                        error: true,
                        message: err.message,
                        distance: null
                    });
                }

            }
        ], function (error, result) {
            console.log(error);
            console.log(JSON.stringify(result));
            callback({
                error: true,
                message: "AJAX geodistance failed:" + error,
                distance: null
            });
        });
    };

    /**
     * lindistance - Lineare Distanz auf der Erdkugel, angenähert
     * https://snipplr.com/view/25479/calculate-distance-between-two-points-with-latitude-and-longitude-coordinates/
     * modifiziert
     */
    uihelper.lindistance = function (lat1, lon1, lat2, lon2) {
        var R = 6371; // km (change this constant to get miles)
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        /*
        if (d>1) return Math.round(d)+"km";
        else if (d<=1) return Math.round(d*1000)+"m";
        return d;
        */
        return Math.round(d);
    };


    /** 
     * moonphase - berechnet aus dem Datum die Mondphase
     * https://gist.github.com/endel/dfe6bb2fbe679781948c
     * return phase, name
     */
    uihelper.moonphase = function (year, month, day) {
        var moonphases = ['new-moon', 'waxing-crescent-moon', 'quarter-moon', 'waxing-gibbous-moon', 'full-moon', 'waning-gibbous-moon', 'last-quarter-moon', 'waning-crescent-moon'];
        if (typeof year === "string") {
            year = parseInt(year);
            month = parseInt(month);
            day = parseInt(day);
        }
        var c = 0;
        var e = 0;
        var jd = 0;
        var b = 0;
        if (month < 3) {
            year--;
            month += 12;
        }
        ++month;
        c = 365.25 * year;
        e = 30.6 * month;
        jd = c + e + day - 694039.09; // jd is total days elapsed
        jd /= 29.5305882; // divide by the moon cycle
        b = parseInt(jd); // int(jd) -> b, take integer part of jd
        jd -= b; // subtract integer part to leave fractional part of original jd
        b = Math.round(jd * 8); // scale fraction from 0-8 and round
        if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0
        return {
            phase: b,
            name: moonphases[b]
        };
    };

    /** 
     * Schaltjahr bzw. leapyear
     * Vorgabe djahr als numerich, return true/false
     */
    uihelper.isleapyear = function (djahr) {
        if (typeof djahr === "string") djahr = parseInt(djahr);
        var isleapy = (djahr % 4 === 0 && djahr % 100 !== 0) || djahr % 400 === 0;
        return isleapy;
    };






    /**
     * confirmDialog - baut Popup auf und callback mit question und isConfirmed als true/false boolean
     * in sich geschlossen, eine Antwort wird erzwungen, nach der Anwort wird das popup entfernt
     * id wird random gebildet; callback mit question (text) und isconfirmed (boolean)
     * @param {*} anchorHash 
     * @param {*} title 
     * @param {*} question 
     * @param {*} comment 
     */
    uihelper.confirmDialog = function (anchorHash, title, question, comment, callback) {
        // <a href="#popupDialog" data-rel="popup" data-position-to="window" data-transition="pop" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-delete ui-btn-icon-left ui-btn-b">Delete page...</a>
        var popupid = "popupD" + Math.floor((Math.random() * 90000) + 1);
        var popupHash = "#" + popupid;
        if (anchorHash.length === 0) anchorHash = $(".content").find("div").prop("id"); // $.mobile.pageContainer;
        $(anchorHash)
            .append($("<div/>", {
                    "data-role": "popup",
                    id: popupid,
                    "data-overlay-theme": "b",
                    "data-theme": "b",
                    "data-dismissible": "false",
                    "data-confirmed": "nein",
                    css: {
                        "max-width": "400px"
                    }
                })
                .append($("<div/>", {
                    "data-role": "header",
                    "data-theme": "a",
                    html: title
                }))
                .append($("<div/>", {
                        "data-role": "main",
                        class: "ui-content"
                    })
                    .append($("<h3/>", {
                        html: question
                    }))
                    .append($("<pre/>", {
                        html: comment
                    }))
                    .append($("<a/>", {
                        href: "#",
                        class: "ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b optionConfirm",
                        html: "OK",
                        click: function (econfirm) {
                            $(popupHash).attr('data-confirmed', 'true');
                            $(popupHash).popup("close");
                            return;
                        }
                    }))
                    .append($("<a/>", {
                        href: "#",
                        class: "ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b optionCancel",
                        "data-transition": "flow",
                        html: "Cancel",
                        click: function (ecancel) {
                            $(popupHash).attr('data-confirmed', 'false');
                            $(popupHash).popup("close");
                            return;
                        }
                    }))
                )
            );
        var popupDialogObj = $(popupHash);
        popupDialogObj.popup();
        popupDialogObj.popup({
            afterclose: function (event, ui) {
                popupDialogObj.find(".optionConfirm").first().off('click');
                var isConfirmed = popupDialogObj.attr('data-confirmed') === 'true' ? true : false;
                $(event.target).remove();
                //if (isConfirmed && callback) {
                if (callback) {
                    callback(question, isConfirmed);
                }
            }
        });
        popupDialogObj.popup('open');
    };

    uihelper.getRandomColor = function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };


    /**
     * deep copy für Objekte, Arrays etc.
     * https://www.codementor.io/avijitgupta/deep-copying-in-js-7x6q8vh5d
     */
    uihelper.cloneObject = function copy(o) {
        if (o === null) return null;
        var output, v, key;
        output = Array.isArray(o) ? [] : {};
        for (key in o) {
            v = o[key];
            output[key] = (typeof v === "object") ? uihelper.cloneObject(v) : v;
        }
        return output;
    };

    /** 
     * cloneObjectOnly - null und undefined werden NICHT kopiert
     * 
     */
    uihelper.cloneObjectOnly = function copy(o) {
        if (o === null) return null;
        var output, v, key;
        output = Array.isArray(o) ? [] : {};
        for (key in o) {
            v = o[key];
            if (typeof v !== "undefined" && v !== null) {
                output[key] = (typeof v === "object") ? uihelper.cloneObjectOnly(v) : v;
            }
        }
        return output;
    };



    /**
     * formatExtractedText - bereitet Wort-für-Wort-Extraktionen auf
     * mit . Beachtung  und Absätze mit Leerzeilen - ist nicht ganz sauber gelöst
     * room for improvement
     */
    uihelper.formatExtractedText = function (text) {
        var erg = "";
        var t = text.replace(/\r\n/g, "\n");
        t = text.replace(/\r/g, "\n");
        var t1 = t.split(/\n/);
        for (var i1 = 0; i1 < t1.length; i1++) {
            if (t1[i1] === "") {
                erg += "\n";
            } else if (t1[i1].endsWith(".")) {
                erg += t1[i1] + "\n";
            } else if (t1[i1].endsWith(":")) {
                erg += t1[i1] + "\n";
            } else {
                erg += t1[i1];
            }
        }
        return erg;
    };


    uihelper.getScrollbarHeight = function (el) {

        return el.getBoundingClientRect().height - el.scrollHeight;
    };

    uihelper.getScrollbarWidth = function (el) {
        // https://stackoverflow.com/questions/986937/how-can-i-get-the-browsers-scrollbar-sizes;
        var parent, child, width;
        if (width === undefined) {
            parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
            child = parent.children();
            width = child.innerWidth() - child.height(99).innerWidth();
            parent.remove();
        }
        return width;
    };





    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = uihelper;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return uihelper;
        });
    } else {
        // included directly via <script> tag
        root.uihelper = uihelper;
    }
}());