/*jslint browser:true, devel:true, white:true */
/*global $,window,module,define,root,global,self */
/*global uihelper,async */
(function () {
    var sysbase = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var initialX = null;
    var initialY = null;

    var hasiframe = false;

    var userMessages = [];
    var messageCount = 0;

    var sysbaseconfig = {};
    sysbase.getConfig = function () {
        return sysbaseconfig;
    };

    var appCache = {};
    sysbase.setCache = function (name, data) {
        if (typeof appCache[name] === "undefined") {
            appCache[name] = {};
        }
        appCache[name].data = data;
        return true;
    };

    sysbase.getCache = function (name) {
        if (typeof appCache[name] === "undefined") {
            return null;
        }
        return appCache[name].data;
    };

    sysbase.delCache = function (name) {
        if (typeof appCache[name] !== "undefined") {
            delete appCache[name];
            return true;
        } else {
            return false;
        }
    };


    var kliparameters = {};

    sysbase.getkliparameters = function () {
        return kliparameters;
    };


    sysbase.initFooter = function () {
        /**
         * Unterscheidung normal oder im iframe
         */
        // https://stackoverflow.com/questions/21751377/foolproof-way-to-detect-if-this-page-is-inside-a-cross-domain-iframe
        if (window.self !== window.top) {
            hasiframe = true;
        } else {
            hasiframe = false;
        }
        $(".footer").empty();
        $(".goprev").hide();
        $(".gonext").hide();
        /*
         * Footer standard
         */
        $(".footer").height("2em");
        $(".footer")
            .append($("<div/>", {
                    css: {
                        height: "1em"
                    }
                })
                .append($("<div/>", {
                    class: "message messageline",
                    html: "&nbsp;",
                    css: {
                        height: "1em",
                        width: "100%",
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    }
                }))
            )
            /**
             * hier die zweite Zeile
             */
            .append($("<div/>", {
                    class: "goprev",
                    css: {
                        "text-align": "center",
                        float: "left",
                        width: "5%",
                        display: "none"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        //<div class="content" pageid="uisql3" id="uisql3" style="height: 751px;">
                        var actPageId = $(".content").attr("id");
                        if (typeof actPageId !== "undefined" && actPageId !== null) {
                            var funcname5 = "" + actPageId + ".goprevious";
                            var functest5 = "typeof " + funcname5;
                            var funcexec5 = functest5 + "()";
                            if (eval(functest5) === 'function') {
                                eval(funcexec5);
                            }
                        }
                    }
                })
                .append($("<img/>", {
                    "src": '/images/icons-png/arrow-l-black.png',

                }))
            )
            .append($("<div/>", {
                    css: {
                        "text-align": "center",
                        float: "left",
                        width: "15%",
                        "background-color": "yellow"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        sysbase.navigateTo("uisql3", [], function (ret) {
                            if (ret.error === true) {
                                alert(ret.message);
                            }
                        });
                    }
                })
                .append($("<img/>", {
                    "src": '/images/icons-png/cloud-black.png'
                }))
            )
            .append($("<div/>", {
                html: "Hilfe",
                css: {
                    "text-align": "center",
                    float: "left",
                    width: "20%"
                }
            }))

            .append($("<div/>", {
                html: "Drucken",
                css: {
                    "text-align": "center",
                    float: "left",
                    width: "20%"
                },
                click: function () {
                    sysbase.printDiv($(".content").html());
                }
            }))

            .append($("<div/>", {
                html: "Impressum/KLI",
                css: {
                    "text-align": "center",
                    float: "left",
                    width: "20%"
                },
                click: function (evt) {
                    evt.preventDefault();
                    window.open(
                        "https://www.trimborn-hof.de/",
                        '_blank' // <- This is what makes it open in a new window.
                    );
                }
            }))

            .append($("<div/>", {
                    class: "gonext",
                    css: {
                        "text-align": "center",
                        float: "left",
                        width: "5%",
                        display: "none"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        //<div class="content" pageid="uisql3" id="uisql3" style="height: 751px;">
                        var actPageId = $(".content").attr("id");
                        if (typeof actPageId !== "undefined" && actPageId !== null) {
                            var funcname5 = "" + actPageId + ".gonext";
                            var functest5 = "typeof " + funcname5;
                            var funcexec5 = functest5 + "()";
                            if (eval(functest5) === 'function') {
                                eval(funcexec5);
                            }
                        }
                    }
                })
                .append($("<img/>", {
                    "src": '/images/icons-png/arrow-r-black.png',
                }))
            );




        var hh = $(".header").outerHeight();
        var fh = $(".footer").outerHeight();
        var wh = $(window).height();
        $(".content").height(wh - hh - fh - 1);
    };

    sysbase.confirmCookie = function (callback) {
        try {
            var hideCookie = $.cookie('hideCookieNotice');
            if (hideCookie && hideCookie === "1") {
                // Cookie bekannt, no action
                callback(true);
            } else {
                /**
                 *  explizites Popup
                 */
                $(".content")
                    .append($("<div/>", {
                            class: "cookiepopup",
                            css: {
                                display: "none",
                                position: "fixed",
                                /* Stay in place */
                                "z-index": 1,
                                /* Sit on top */
                                "padding-top": "10px",
                                /* Location of the box */
                                "left": "30%",
                                top: "25%",
                                width: "50%",
                                "min-width": "250px",
                                /* Full width */
                                height: "5em",
                                /* Full height */
                                overflow: "auto",
                                "background-color": "mistyrose",
                                border: "2px solid blue",
                                "text-align": "center"
                            }
                        })
                        .append($("<div/>")
                            .append($("<span/>", {
                                html: "diese Seite verwendet Cookies für Ihren Benutzerkomfort<br>"
                            }))
                            .append($("<button/>", {
                                class: "cookiepopupok",
                                html: "Bestätigt"
                            }))
                        )
                    );
                $(".cookiepopup").show();
                $(".cookiepopupok").click(function () {
                    $.cookie('hideCookieNotice', ["1"], {
                        expires: 360
                    });
                    $(".cookiepopup").hide();
                    callback(true);
                });
            }
        } catch (err) {
            console.log("Cookie-Error:" + err.message);
            callback(false);
        }

    };

    /**
     * Bereitstellen des Inhalts einer div zum Drucken (PDF, Printer)
     * Eingabefelder werden in Ausgabefelder umgewandelt
     * keine Canvas
     * @param {*} data
     */
    sysbase.printDiv = function (data) {
        var mywindow = window.open();
        var is_chrome = Boolean(mywindow.chrome);
        mywindow.document.write(data);
        // jetzt die Felder ändern in Ausgaben
        $(mywindow.document).find('.noprint').each(function () {
            $(this).empty();
        });
        $(mywindow.document).find('input').each(function () {
            $(this).replaceWith("<span>&nbsp;" + this.value + "</span>");
        });
        $(mywindow.document).find('textarea').each(function () {
            $(this).replaceWith("<span>&nbsp;" + this.value + "</span>");
        });

        $(mywindow.document).find('button').each(function () {
            $(this).replaceWith("<span>" + "&nbsp;" + "</span>");
        });

        $(mywindow.document).find('a').each(function () {
            $(this).replaceWith("<span>&nbsp;" + this.text + "</span>");
        });

        if (is_chrome) {
            setTimeout(function () { // wait until all resources loaded
                mywindow.document.close(); // necessary for IE >= 10
                mywindow.focus(); // necessary for IE >= 10
                mywindow.print(); // change window to winPrint
                mywindow.close(); // change window to winPrint
            }, 250);
        } else {
            mywindow.document.close(); // necessary for IE >= 10
            mywindow.focus(); // necessary for IE >= 10

            mywindow.print();
            mywindow.close();
        }

        return true;
    };




    /**
     * printDivAll - Bereitstellen des Inhalts einer div zum Drucken (PDF, Printer)
     * Eingabefelder werden in Ausgabefelder umgewandelt
     * Canvas werden umgewandelt zum Druck (siehe kla1650ani), dort
     * mit /getbackasfile Umsetzung svg-Tag in Bilddatei
     *  var svghtml = (new XMLSerializer()).serializeToString(document.querySelector('svg'));
     *  var url = "data:image/svg+xml," + encodeURIComponent(svghtml);
     * das ist hier erst mal nicht erforderlich, daher Umsetzung canvas in string
     * mit var dataURL = canvas.toDataURL(); => "data:image/png;base64,iVBORw0KGgoAA...
     * oder var mediumQuality = canvas.toDataURL("image/jpeg", 0.5);   // 1.0 High, 0.1 Low
     *  var img = new Image;
     *  img.src = "data:image/png;base64,..."; // Assume valid data
     * https://stackoverflow.com/questions/11112321/how-to-save-canvas-as-png-image
     * dort Konzentration auf Bild => File, aber gut
     * @param {*} data
     */
    sysbase.printDivAll = function (data) {
        var mywindow = window.open();
        var is_chrome = Boolean(mywindow.chrome);
        mywindow.document.write(data);
        // jetzt die Felder ändern in Ausgaben
        $(mywindow.document).find('.noprint').each(function () {
            $(this).empty();
        });
        $(mywindow.document).find('input').each(function () {
            $(this).replaceWith("<span>&nbsp;" + this.value + "</span>");
        });

        $(mywindow.document).find('textarea').each(function () {
            $(this).replaceWith("<span>&nbsp;" + this.value + "</span>");
        });

        $(mywindow.document).find('button').each(function () {
            $(this).replaceWith("<span>" + "&nbsp;" + "</span>");
        });

        $(mywindow.document).find('a').each(function () {
            $(this).replaceWith("<span>&nbsp;" + this.text + "</span>");
        });

        $(mywindow.document).find('canvas').each(function () {
            //var mediumQuality = this.toDataURL("image/jpeg", 0.5);
            var mediumQuality = this.toDataURL();
            console.log("id:" + $(this).attr("id"));
            console.log("dataUrl:" + mediumQuality.substr(0, 100));
            $(this).replaceWith("<img src='" + mediumQuality + "' alt='from canvas' />");
        });

        if (is_chrome) {
            setTimeout(function () { // wait until all resources loaded

                var newwindow = window.open();
                var ihtml = mywindow.document.body.innerHTML;
                $(newwindow.document.body).append(ihtml);

                mywindow.document.close(); // necessary for IE >= 10
                mywindow.focus(); // necessary for IE >= 10
                mywindow.print(); // change window to winPrint
                //mywindow.close(); // change window to winPrint
            }, 500);
        } else {

            var newwindow = window.open();
            var ihtml = mywindow.document.body.innerHTML;
            $(newwindow.document.body).append(ihtml);

            mywindow.document.close(); // necessary for IE >= 10
            mywindow.focus(); // necessary for IE >= 10
            mywindow.print();
            //mywindow.close();
        }

        return true;
    };


    /**
     * putMessage
     * @param {*} message
     * @param {*} severity
     * @param {*} dopush
     */
    var lastmessage = "*";
    var isActiveMessage = false;
    sysbase.putMessage = function (message, severity, dopush) {
        if (isActiveMessage === false) {
            isActiveMessage = true;
            sysbase.activateMessages();
        }
        if (typeof severity === undefined) {
            severity = 0;
        }
        if (typeof message === "undefined" || (typeof message === "string" && message.trim().length === 0)) {
            if (lastmessage.length === 0) {
                return;
            } else {
                lastmessage = "";
            }
        } else {
            lastmessage = "*";
        }

        // hier check ob severity und Farbe anpassen - später
        if ($(".message").length <= 0) {
            $(".footer")
                .prepend($("<span/>", {
                    class: "message",
                    css: {
                        "background-color": "white",
                        height: "1em",
                        width: "100%",
                        "white-space": "nowrap",
                        "text-overflow": "ellipsis",
                        "overflow": "hidden"
                    }
                }));
        }
        if ($(".message").length > 0) {
            if ($(".message").length > 100) {
                $(".message").html(message.substr(0, 100) + "...");
            } else {
                $(".message").html(message);
            }

        }
        if (severity > 1) {
            $(".messageline").css({
                "background-color": "magenta",
                "font-weight": "bold"
            });
        } else {
            $(".messageline").css({
                "background-color": "yellow",
                "font-weight": "normal"
            });
        }
        messageCount++;
        var tot = userMessages.unshift({
            message: message,
            severity: severity,
            messageCount: messageCount
        });
        if (tot > 100) {
            userMessages.splice(100, tot);
        }
    };

    /**
     * showAllMessages - alle Anzeige in target
     * target ist ein Container als ul !!!
     */
    sysbase.showAllMessages = function (target) {
        $(target).empty();
        for (var i = 0; i < userMessages.length; i++) {
            var eintrag = userMessages[i].message;
            if (userMessages[i].severity > 2) {
                $("<li />", {
                    html: eintrag,
                    css: {
                        color: "red"
                    }
                }).appendTo(target);
            } else {
                $("<li />", {
                    html: eintrag,
                    css: {
                        color: "green"
                    }
                }).appendTo(target);
            }
        }
        return true;
    };

    sysbase.activateMessages = function () {
        $(document).on("click", ".messageline", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            var msgschema = {
                entryschema: {
                    messages: {
                        title: "Meldungen",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        default: "",
                        io: "o"
                    }
                }
            };
            var msgrecord = {
                comment: "hier sind die Meldungen"
            };
            var msgcontainer = $("body").find(".content");
            var msgtargetid = "msg" + Math.floor(Math.random() * 100000) + 1;
            var oldmsgs = $(".uiepopup").find(".messageprotocol");
            if (oldmsgs.length > 0) {
                oldmsgs.closest(".uiepopup").remove();
            }

            uientry.inputDialogX(msgcontainer, {
                left: "15%",
                top: "15%",
                width: "70%",
                height: "70%"

            }, "Anzeige Meldungen", msgschema, msgrecord, function (ret) {
                if (ret.error === false) {
                    // outrec.isactive = "false"; // true oder false wenn gelöscht
                    var hm = $(".uiepopup").height();
                    var wm = $(".uiepopup").width();
                    $(".uiepopup")
                        .find(".uieform")
                        .append($("<br>"))
                        .append($("<div/>", {
                                class: "messageprotocol doprintthis",
                                css: {
                                    height: Math.floor(hm * .6),
                                    width: Math.floor(wm * .8),
                                    overflow: "auto"
                                }
                            })
                            .append($("<ul/>", {
                                id: msgtargetid,
                                css: {
                                    width: "100%"
                                }
                            }))
                        );
                    $("button.optionCancel")
                        .after($("<button/>", {
                            html: "Drucken",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                $('.doprintthis').printThis({
                                    canvas: true,
                                    afterPrint: function () {
                                        //var lsid = $("iframe").find("[name=printIframe]").attr("id");
                                        var lsid = $('iframe[name="printIframe"]').attr('id');
                                        var largestring = document.getElementById(lsid).contentWindow.document.body.innerHTML;
                                        uihelper.downloadfile("station.html", largestring, function (ret) {
                                            console.log("Downloaded");
                                        });
                                    }
                                });
                            }
                        }));


                    sysbase.showAllMessages("#" + msgtargetid);
                } else {
                    sysbase.putMessage("Keine Anzeige möglich", 3);
                    return;
                }
            });
        });
    };
    var klistack = [];

    sysbase.navigateReset = function () {
        if (klistack.length > 0) {
            var lasttarget = klistack.pop();
        }
    };

    sysbase.navigateTo = function (targetpage, parameters, callback) {
        /**
         * Aufruf einer anderen Seite mit show-Funktion,
         * klistack als Callstack für Back-Unterstützung
         * Problem: wenn .content mit id erst auf unterer Ebene gefunden wird,
         * dann müsste pageid gesucht werden, besser: pageid => .content mit id
         * Kontext: im iframe, da sollte es auch klappen, aber iframe hat kein parent i.e.S.
         */
        if (targetpage === null) {
            return;
        }
        var uname = "Climate-Expert";
        var origin;
        if (sysbase.navigateTo.caller === null) {
            origin = "*top*";
        } else {
            origin = $("body").find("div[pageid]");
            if (origin.length === 0) {
                origin = $(".content").find("div").prop("id");
            } else {
                origin = $("body").find("div[pageid]").attr("pageid");
            }
            if (typeof origin !== "undefined" && origin.length === 0) {
                origin = $(".content").prop("id"); // hier müsste der Level geprüft werden
                if (origin.length === 0) {
                    var err = new Error("Missing ID in page");
                    sysbase.putMessage("Missing ID in page", 3);
                    alert(new Error("ID").stack);

                    if (typeof callback !== "undefined") {
                        callback({
                            error: true,
                            message: "Missing ID in page"
                        });
                    } else {
                        sysbase.putMessage("Missing ID in page");
                    }
                    return;
                }
            }
        }

        //sysbase.putMessage(origin + "=>" + targetpage);
        if (typeof parameters === "undefined") parameters = [];

        if (typeof targetpage === "string") {
            if (targetpage.startsWith("#")) {
                targetpage = targetpage.substr(1);
            }
        } else {
            var err = new Error("wrong page-parameter");
        }

        var script = "js/" + targetpage + ".js";
        var module = targetpage;
        var domhash = "#" + targetpage;

        var target = {
            script: script,
            module: module,
            domhash: domhash
        };

        var navigateBucket = {
            navigate: "to",
            target: target,
            origin: origin
        };
        try {
            klistack.push({
                origin: origin,
                target: target,
                parameters: Object.assign({}, parameters)
            });
        } catch (err) {
            sysbase.putMessage(err);
        }

        if (typeof window[module] === "undefined") {
            var url = script;
            async.waterfall([
                    function (callbackwl) {
                        try {
                            $.getScript(url, function (data, textStatus, jqxhr) {
                                if (typeof window[module] === "undefined") {
                                    callbackwl(null, {
                                        error: true,
                                        message: "not found",
                                        url: url,
                                        module: module
                                    });
                                } else {
                                    callbackwl("found", {
                                        error: false,
                                        message: "found",
                                        url: url,
                                        module: module
                                    });
                                }
                            });
                        } catch (err) {
                            callbackwl(null, {
                                error: true,
                                message: "not found:" + err,
                                url: url,
                                module: module
                            });
                        }
                    },
                    function (url, callbackwl) {
                        // apps prüfen!!!
                        url = "/apps/re-klima/" + module + ".js";
                        $.getScript(url, function (data, textStatus, jqxhr) {
                            if (typeof window[module] === "undefined") {
                                callbackwl(null, {
                                    error: true,
                                    message: "not found",
                                    url: url,
                                    module: module
                                });
                            } else {
                                callbackwl("found", {
                                    error: false,
                                    message: "found",
                                    url: url,
                                    module: module
                                });
                            }
                        });
                    },
                    function (url, callbackwl) {
                        // apps prüfen!!!
                        url = "/apps/re-frame/" + module + ".js";
                        $.getScript(url, function (data, textStatus, jqxhr) {
                            if (typeof window[module] === "undefined") {
                                callbackwl(null, {
                                    error: true,
                                    message: "not found",
                                    url: url,
                                    module: module
                                });
                            } else {
                                callbackwl("found", {
                                    error: false,
                                    message: "found",
                                    url: url,
                                    module: module
                                });
                            }
                        });
                    }
                ],
                function (error, result) {
                    if (typeof window[module] === "undefined") {
                        if (typeof callback !== "undefined") {
                            callback({
                                error: true,
                                message: "Module " + url + " not found"
                            });
                        } else {
                            sysbase.putMessage("Module " + url + " not found");
                        }
                        return;
                    }
                    if (typeof window[module].show === "undefined") {
                        if (typeof callback !== "undefined") {
                            callback({
                                error: true,
                                message: "Function show in Module " + url + " not found"
                            });
                        } else {
                            sysbase.putMessage("Function show in Module " + url + " not found");
                        }
                        return;
                    }
                    klistack.push({
                        target: target,
                        origin: origin,
                        parameters: parameters
                    });
                    window[module].show(parameters, navigateBucket); // sonst kann der Trigger nicht wirken
                    if (typeof callback !== "undefined") {
                        callback({
                            error: false,
                            message: "navigation complete to:" + url
                        });
                    } else {
                        // sysbase.putMessage("navigation complete to:" + url);
                    }
                    return;
                }
            );
            /*
            $.getScript(url, function (data, textStatus, jqxhr) {

            });
            */
        } else {
            klistack.push({
                target: target,
                origin: origin,
                parameters: parameters
            });
            window[module].show(parameters, navigateBucket);
            if (typeof callback !== "undefined") {
                callback({
                    error: false,
                    message: "navigation complete to:" + target
                });
            } else {
                // sysbase.putMessage("navigation complete to:" + target);
            }
            return;
        }
    };

    sysbase.navigateBack = function (parameters, callbackb) {
        var frameid;
        if (typeof parameters === "undefined") parameters = [];
        // Holen letzen Eintrag aus klistack
        if (klistack.length > 0) {
            var lasttarget = klistack.pop();
            if (typeof lasttarget.origin === "undefined") {
                sysbase.destroytabiframe();
                if (typeof callbackb !== "undefined") {
                    callbackb({
                        error: false,
                        message: "hard closed"
                    });
                }
                return;
            }
            // target, origin, parameters
            var module = lasttarget.origin;
            var navigateBucket = {
                navigate: "back",
                target: lasttarget.target,
                origin: lasttarget.origin,
                oldparameters: lasttarget.parameters
            };
            window[module].show(parameters, navigateBucket); // sonst kann der Trigger nicht wirken
            if (typeof callbackb !== "undefined") {
                callbackb({
                    error: false,
                    message: "Back to:" + module
                });
            }
            return;
        } else {
            // wenn im iFrame, dann spezielles schliessen, sonst relativ einfach
            // callback ist dann uninteressant, weil hier das Ende ist
            frameid = $(this).closest("iframe").parent().attr("id");
            sysbase.destroytabiframe();
            if (window.self !== window.top) {
                // iframe schliessen
                if (frameid) {
                    $(frameid).parentNode.removeChild(frameid);
                }
                if (typeof callbackb !== "undefined") {
                    callbackb({
                        error: false,
                        message: "iframe closed:" + frameid
                    });
                }
                return;
            } else {
                if (frameid) {
                    $(frameid).remove();
                }
                if (typeof callbackb !== "undefined") {
                    callbackb({
                        error: false,
                        message: "iframe closed:" + frameid
                    });
                }
                return;
            }
        }
    };

    sysbase.destroytabiframe = function () {
        if (window.self !== window.top) {
            // iframe schliessen
            var itop = $("body").closest("html");
            var p1tagname = $(itop).parent().prop("tagName");
            var wp = window.parent.document;
            var wp1 = window.parent.document.activeElement;
            var wp2 = window.parent.document.activeElement.parentElement; // ist tabbody
            var wp2idhash = wp2.id;
            // mit der id kann tablinks adressiert und gelöscht werden sowie tabbody

            var wptop = $(wp2).closest("body");
            $(wptop).find("[idhash='" + "#" + wp2idhash + "']").remove();
            $(wp2).remove();
        }
    };

    sysbase.getNavigationStack = function () {
        return klistack;
    };


    /**
     * swipeLeft und swipeRight zur Unterstützung der Navigation
     * bei Smartphone und Tablet - hier nicht im Vordergrund
     * swipeLeft auch bei Browser-Backbutton und Smartphone-Backbutton
     * origin: selbst, from: left, to: right
     * wba4100 bleibt auf dem Rückweg!!!
     */
    var progsequences = [
        /*
        {
            origin: "wba4010",
            from: "wba4100",
            to: "wba4100"
        },
        */
    ];



    /**
     * tabcreate
     */
    sysbase.tabcreate = function (title, idcode, module) {
        if (typeof idcode === "undefined" || idcode.trim().length === 0) {
            idcode = "T" + Math.floor(Math.random() * 100000) + 1;
        }
        var idhash = "#" + idcode;
        $(".tablinks").removeClass("active");
        $(".tabwrapper .tab")
            .append($("<button/>", {
                class: "tablinks active",
                html: title,
                idhash: idhash,
                module: module,
                click: function () {
                    var idhash = $(this).attr("idhash");
                    var module = $(this).attr("module");
                    $(".tablinks").removeClass("active");
                    $(this).addClass("active");
                    $(".tabcontent").hide();
                    if ($(".tabcontent." + idhash.substr(1)).length > 0) {
                        $(".tabcontent." + idhash.substr(1)).show();
                    } else {
                        var container = $(this).parent().parent();
                        if (typeof module !== "undefined" && module.trim().length > 0) {
                            sysbase.tabload(container, module, idhash, function (ret) {
                                sysbase.initFooter(idhash);
                            });
                        }
                    }
                }
            }));
        return idcode;
    };
    /**
     * modulecheck - prüft modul
     * mit dynamischem Nachladen
     */
    sysbase.tabload = function (container, target, idhash, callback) {
        if (typeof container === "undefined") {
            return {
                error: true,
                message: "Kein container vorgegeben"
            };
        }
        if (typeof target === "undefined") return {
            error: true,
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
            error: true,
            message: "Kein Modul vorgegeben"
        });

        if (target.script === "undefined") {
            target.script = "js/" + target.module + ".js";
        }
        /**
         * hier geht es richtig los - von init auf show umstellen
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
                        if (typeof window[modulename].show === "undefined") {
                            // alert("init zu Modul nicht gefunden:" + url);
                            callback({
                                error: false,
                                message: url + " kein init vorhanden"
                            });
                        } else {
                            window[modulename].show(container, idhash);
                            callback({
                                error: false,
                                message: "OK init"
                            });
                            return;
                        }
                    }
                });
            } else {
                // prüfen, ob init noch aufgerufen werden muss
                if ($(idhash) === null || $(idhash).length === 0) {
                    if (typeof window[modulename].show !== "undefined") {
                        window[modulename].show(container, idhash);
                    }
                }
                console.log("LOAD:" + url + " nicht notwendig");
                callback({
                    error: false,
                    message: "OK no load no init"
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

    /**
     * tabcreateiframe
     */
    sysbase.tabcreateiframe = function (title, idcode, app, module, htmlpage) {
        if (typeof htmlpage === "undefined" || htmlpage.length === 0) htmlpage = "inframe.html";
        if (typeof idcode === "undefined" || idcode.trim().length === 0) {
            idcode = "T" + Math.floor(Math.random() * 100000) + 1;
        }
        var idhash = "#" + idcode;
        $(".tablinks").removeClass("active");
        $(".tabwrapper .tab")
            .append($("<button/>", {
                    class: "tablinks active",
                    css: {
                        display: "inline",
                        position: "relative"
                    },
                    html: title,
                    htmlpage: htmlpage,
                    idhash: idhash,
                    app: app,
                    module: module,
                    click: function () {
                        var idhash = $(this).attr("idhash");
                        var app = $(this).attr("app");
                        var module = $(this).attr("module");
                        $(".tablinks").removeClass("active");
                        $(this).addClass("active");
                        $(".tabbody").hide();
                        if ($(idhash).length > 0) {
                            $(idhash).show();
                        } else {
                            var container = $(this).parent().parent();
                            if (typeof module !== "undefined" && module.trim().length > 0) {
                                sysbase.tabloadiframe(container, app, module, idhash, htmlpage, function (ret) {
                                    sysbase.initFooter(idhash);
                                });
                            }
                        }
                    }
                })
                // close-Marker rechts oben
                .append($("<a/>", {
                    html: "x",
                    href: "#",
                    css: {
                        "background-color": "lightsteelblue",
                        position: "absolute",
                        right: "0",
                        top: "0",
                        height: "21 px",
                        width: "21 px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        evt.stopImmediatePropagation();
                        evt.stopPropagation();
                        // Button zerstören: parent von this, einfach
                        // iframe zerstören "von oben" mit idhash von button
                        // idhash ist der div-Container des iframe
                        // was im iframe ist, das ist unbekannt, aber html etc.,
                        // dorthin sollte ein logout geschickt werden
                        var canhash = $(this).parent().attr("idhash");
                        var pindex = $(this).parent().index();
                        var canfra = $(canhash).find("iframe")[0];
                        if (typeof canfra !== "undefined" && canfra !== null) {
                            var parameters = {};
                            canfra.contentWindow.sysbase.navigateBack(parameters, function (ret) {
                                if (ret.error === true) {
                                    sysbase.putMessage(ret.message, 3);
                                } else {
                                    sysbase.putMessage(ret.message, 1);
                                }
                                // zur Sicherheit
                                $(canfra).remove();
                                $(canhash).remove();
                                // activate reiter
                                if ($(".tablinks.active").length === 1) {
                                    $(".tablinks.active").show();
                                } else {
                                    // suche links nach Reiter, der gezeigt werden kann
                                    for (var rind = pindex - 1; rind >= 0; rind--) {
                                        var butt = $(".tablinks").eq(rind);
                                        var idhash = $(butt).attr("idhash");
                                        if ($(idhash) !== null) {
                                            $(butt).click();
                                            break;
                                        }
                                    }
                                }
                            });
                            return;
                        } else {
                            // iframe noch nicht vorhanden, nur den Tab entfernen
                            $(this).parent().remove();
                            if ($(".tablinks.active").length === 1) {
                                $(".tablinks.active").show();
                            }
                        }
                    }
                }))


            );
        return idcode;
    };
    /**
     * modulecheck - prüft modul
     * mit dynamischem Nachladen
     */
    sysbase.tabloadiframe = function (container, app, target, idhash, htmlpage, callback) {
        if (typeof container === "undefined") {
            return {
                error: true,
                message: "Kein target vorgegeben"
            };
        }
        if (typeof target === "undefined") return {
            error: true,
            message: "Kein target vorgegeben"
        };
        if (typeof target === "string") {
            var t1 = target;
            if (t1.indexOf("#") === 0) {
                t1 = t1.substring(1);
            }
            if (typeof app !== "undefined" && app !== null) {
                target = {
                    script: "apps/" + app + "/" + t1 + ".js",
                    module: t1,
                };
            } else {
                target = {
                    script: "js/" + t1 + ".js",
                    module: t1,
                };
            }
        }

        if (typeof target.module === "undefined") callback({
            error: true,
            message: "Kein Modul vorgegeben"
        });

        if (target.script === "undefined") {
            target.script = "js/" + target.module + ".js";
        }

        var hh = $(".header").outerHeight();
        var fh = $(".footer").outerHeight();
        var wh = $(window).height();
        var ch = wh - hh - fh - 2;

        $(".tabbodies").position().top = hh;

        var p = "";
        p += location.origin;
        p += "/" + htmlpage;
        // p += "/inframe.html";
        var trenn = "?";

        if (htmlpage.indexOf("?") >= 0) {
            trenn = "&";
        }
        if (app.length > 0) {
            p += trenn + "app=" + encodeURIComponent(app);
            trenn = "&";
        }
        p += trenn + "target=" + encodeURIComponent(target.module);

        $(".tabbodies")
            .append($("<div/>", {
                    id: idhash.substr(1),
                    class: "tabbody",
                    css: {
                        height: wh,
                        width: "100%",
                        overflow: "none"
                    }
                })
                .append($("<iframe/>", {
                    src: p,
                    height: ch,
                    width: "100%",
                    overflow: "none"
                }))
            );
        if (typeof callback !== "undefined") {
            callback({
                error: false,
                message: "ok"
            });
        }
    };




    sysbase.swipeRight = function () {
        /**
         * sucht Vorgänger - origin ist to, gesucht wird from, Annahme einfacher Rücksprung, daher LETZTES from suchen
         * https://github.com/mattbryson/TouchSwipe-Jquery-Plugin/blob/master/jquery.touchSwipe.min.js
         */
        sysbase.putMessage("swipeRight detected");
        var origin = $(".content").find("div").prop("id");
        if (typeof origin !== "undefined" && origin.length === 0) {
            origin = $(".content").prop("id");
            if (origin.length === 0) {
                var err = new Error("Missing ID in page");
                sysbase.putMessage("Missing ID in page", 3);
                alert(new Error("ID").stack);
                return;
            }
        }
        for (var ipage = 0; ipage < progsequences.length; ipage++) {
            if (progsequences[ipage].origin === origin) {
                var frompage = progsequences[ipage].from;
                if (frompage === "*back") {
                    sysbase.navigateBack({}, function (ret) {
                        if (ret.error === true) {
                            // sysbase.putMessage(ret.message, 3);
                        }
                        return;
                    });
                } else {
                    sysbase.navigateTo(frompage, {}, function (ret) {
                        // callback bezieht sich auf navigateTo, nicht auf kli1020evt.show!!!
                        if (ret.error === true) {
                            //sysbase.putMessage(ret.message, 3);
                        }
                        return;
                    });
                }
            }
        }
    };


    sysbase.swipeLeft = function () {
        /**
         * sucht Nachfolger - origin ist from, gesucht wird to, Annahme Sprung, daher ERSTES to suchen
         */
        sysbase.putMessage("swipeLeft detected");
        var origin = $(".content").find("div").prop("id");
        if (origin.length === 0) {
            origin = $(".content").prop("id");
            if (origin.length === 0) {
                var err = new Error("Missing ID in page");
                sysbase.putMessage("Missing ID in page", 3);
                alert(new Error("ID").stack);
                return;
            }
        }
        for (var ipage = 0; ipage < progsequences.length; ipage++) {
            if (progsequences[ipage].origin === origin) {
                var topage = progsequences[ipage].to;
                if (topage === "*back") {
                    sysbase.navigateBack({}, function (ret) {
                        if (ret.error === true) {
                            //sysbase.putMessage(ret.message, 3);
                        }
                        return;
                    });
                } else {
                    sysbase.navigateTo(topage, {}, function (ret) {
                        // callback bezieht sich auf navigateTo, nicht auf kli1020evt.show!!!
                        if (ret.error === true) {
                            // sysbase.putMessage(ret.message, 3);
                        }
                        return;
                    });
                }
            }
        }
    };

    sysbase.checkSessionLogin = function (ret) {
        /**
         * Dummy-Funktion, bleibt erst mal formal erhalten
         */
        return;
    };

    sysbase.putHeaderRight = function () {
        $(".headerright").remove();
        $(".header")
            .append($("<div/>", {
                class: "headerright",
                css: {
                    float: "right"
                }
            }));
        $(".headerright")
            .prepend($("<button/>", {
                    class: "dropdown-right",
                    css: {
                        float: "right"
                    }
                })
                .append($("<span/>", {
                    html: "Actions"
                }))
                .append($("<div/>", {
                        class: "dropdown-content-right",
                        css: {
                            margin: 0,
                            right: 0,
                            left: "auto"
                        }
                    })
                    .append($("<ul/>", {
                            class: "headerrightList"
                        })
                        .append($("<li/>", {
                            class: "dropdown-menuepoint",
                            html: "zurück",
                            click: function (evt) {
                                evt.preventDefault();
                                var parameters = {};
                                sysbase.navigateBack(parameters, function (ret) {
                                    if (ret.error === true) {
                                        //sysbase.putMessage(ret.message, 3);
                                    }
                                });
                                return;
                            }
                        }))
                    )
                )
            );

    };


    // Get device pixel ratio https://gist.github.com/gdi2290/7772743
    sysbase.getDPR = function () {
        var mediaQuery;
        // Fix fake window.devicePixelRatio on mobile Firefox
        var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (window.devicePixelRatio !== "undefined" && !is_firefox) {
            return window.devicePixelRatio;
        } else if (window.matchMedia) {
            mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
              (min--moz-device-pixel-ratio: 1.5),\
              (-o-min-device-pixel-ratio: 3/2),\
              (min-resolution: 1.5dppx)";
            if (window.matchMedia(mediaQuery).matches)
                return 1.5;
            mediaQuery = "(-webkit-min-device-pixel-ratio: 2),\
              (min--moz-device-pixel-ratio: 2),\
              (-o-min-device-pixel-ratio: 2/1),\
              (min-resolution: 2dppx)";
            if (window.matchMedia(mediaQuery).matches)
                return 2;
            mediaQuery = "(-webkit-min-device-pixel-ratio: 0.75),\
              (min--moz-device-pixel-ratio: 0.75),\
              (-o-min-device-pixel-ratio: 3/4),\
              (min-resolution: 0.75dppx)";
            if (window.matchMedia(mediaQuery).matches)
                return 0.7;
        } else
            return 1;
    };

    /**
     * getServer - zunächst neutral, Aktivierung nur zum echten Test
     * Ableitung aus der aktuellen URL im Client oder Test von Lokal zu Remote, geht auch
     */
    sysbase.getServer = function (url) {
        // http://ec2-18-197-152-42.eu-central-1.compute.amazonaws.com:8000/
        // var newurl = "http://ec2-18-197-152-42.eu-central-1.compute.amazonaws.com:8000"; // KLI
        // var newurl = "http://ec2-18-197-152-42.eu-central-1.compute.amazonaws.com:8000"; // AWS re
        var newurl = "";
        if (typeof newurl !== "undefined" && newurl.length > 0) {
            if (url.startsWith("/")) {
                newurl += url;
            } else {
                newurl += "/" + url;
            }
            return (newurl);
        } else {
            return url;
        }
    };


    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = sysbase;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return sysbase;
        });
    } else {
        // included directly via <script> tag
        root.sysbase = sysbase;
    }
}());