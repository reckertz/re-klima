/*global $,this,window,module,define,root,global,self,var,async,sysbase,uihelper,kla9020fun,regression */
(function () {
    'use strict';
    var kla1990htm = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1990htm  bekommt über getCache pivotdata oder yearlats(?)
     * und erzeugt animierte Gifs mit der Option weiterer Zuordnungen
     * nach latitude und
     * nach temperatur, grundet auf Ganzzahlen
     * mit Sekundärdaten aus HYDE
     */
    var actprjname;
    var fullname;
    var fulldatafilename;
    var datafilename;
    var selyears;
    var yearlats;
    var tarray = [];
    var cid;
    var cidw;
    var sgif;
    var aktyear;
    var aktvariablename;
    var selparms;
    var selstationid = null;
    var selsource = null;
    var selvariablename = null;
    var starecord = null; // Selektionsparameter
    var savedwidth = null;
    var heatmapparms = {};
    var stationrecord;
    var yearindexarray = {};
    var matrix1 = {}; // aktive Datenmatrix, wenn gefüllt
    var histo1 = {}; // Histogramm auf Temperatur gerundet Ganzzahl
    var array1 = []; // aktives Array für d3
    var klirecords = [];

    var klihyde = {};
    var kla1990htmclock;

    var hmatrixR;
    var hmatrixL;

    var hoptionsR;
    var hoptionsL;

    var lastobj = null;

    var poprecord = {}; // Konfigurationsparameter mit Default-Zuweisung
    poprecord.qonly = true;
    poprecord.total = false;
    poprecord.mixed = true;
    poprecord.moon = false;
    poprecord.sunwinter = true;
    poprecord.export = false;

    kla1990htm.show = function (parameters, navigatebucket) {

        // if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {}
        if (typeof parameters !== "undefined" && parameters.length > 0) {
            selstationid = parameters[0].stationid;
            selsource = parameters[0].source;
            selvariablename = parameters[0].variablename;
            starecord = JSON.parse(parameters[0].starecord);
        } else {
            selparms = window.parent.sysbase.getCache("onestation");
            selparms = JSON.parse(selparms);
            selstationid = selparms.stationid;
            starecord = selparms.starecord;
            selsource = selparms.starecord.source;
            selvariablename = selparms.starecord.variablename;
        }
        if (typeof navigatebucket === "object") {
            if (navigatebucket.navigate === "back") {
                if (typeof navigatebucket.oldparameters === "object") {
                    /* hier wird es sehr kontext-/anwendungsspezifisch */
                    if (navigatebucket.oldparameters.length > 0) {
                        if (typeof navigatebucket.oldparameters[0].prjname !== "undefined") {
                            actprjname = navigatebucket.oldparameters[0].prjname;
                        }
                    }
                }
            }
        }
        if (typeof parameters !== "undefined") {
            if (Array.isArray(parameters) && parameters.length > 0) {
                actprjname = parameters[0].prjname;
            }
        }
        var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
        cid = wname + "map";
        cidw = cid + "w";
        $("body").css({
            "background-color": "lightsteelblue"
        });

        $(".content").empty();
        $(".headertitle").html("Heatmap für Station:" + selstationid + " Quelle:" + selsource);
        $(".headertitle").attr("title", "kla1990htm");
        $(".content").attr("pageid", "kla1990htm");
        $(".content").attr("id", "kla1990htm");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1990htm")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1990htm_isdirty",
                value: "false"
            }));
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
                    title: "Actions",
                    class: "dropdown-right",
                    css: {
                        float: "right",
                        height: "0.7em",
                        width: "35px",
                        "background-color": "navyblue"
                    }
                })
                .append($("<div/>", {
                        class: "dropdown-content-right",
                        css: {
                            margin: 0,
                            right: 0,
                            left: "auto"
                        }
                    })
                    .append($("<ul/>")
                        .append($("<li/>", {
                            class: "dropdown-menuepoint",
                            html: "zurück",
                            click: function (evt) {
                                evt.preventDefault();
                                parameters = {};
                                sysbase.navigateBack(parameters, function (ret) {
                                    if (ret.error === true) {
                                        sysbase.putMessage(ret.message, 3);
                                    }
                                });
                                return;
                            }
                        }))
                    )
                )
            );
        sysbase.initFooter();
        $("#kla1990htm.content").empty();
        $("#kla1990htm.content")
            .append($("<div/>", {
                    id: "kla1990htmbuttons",
                    css: {
                        width: "100%",
                        float: "left"
                    }
                })

                .append($("<button/>", {
                    html: "Drucken",
                    css: {
                        "text-align": "center",
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // https://github.com/jasonday/printThis
                        $('.doprintthis').printThis({
                            canvas: false,
                            removeScripts: true,
                            importCSS: false
                        });
                    }
                }))

                .append($("<button/>", {
                    html: "Download",
                    css: {
                        "text-align": "center",
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var largestring = $(".kla1990htmwrapper").html();
                        uihelper.downloadfile("station.html", largestring, function (ret) {
                            console.log("Downloaded");
                        });
                    }
                }))


                .append($("<button/>", {
                    html: "Download kompakt",
                    css: {
                        "text-align": "center",
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var newid = "N" + Math.floor(Math.random() * 100000) + 1;
                        var newhash = "#" + newid;
                        $(".content")
                            .append($("<div/>", {
                                id: newid
                            }));
                        // rekursiv durch die alte Struktur
                        kla1990htm.recurse($(".content"), newhash);
                        var largestring = $(newhash).html();
                        uihelper.downloadfile("station.html", largestring, function (ret) {
                            console.log("Downloaded");
                        });
                    }
                }))


                .append($("<button/>", {
                    html: "Download kompakt-2",
                    css: {
                        "text-align": "center",
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var newid = "N" + Math.floor(Math.random() * 100000) + 1;
                        var newhash = "#" + newid;
                        $(".content")
                            .append($("<div/>", {
                                    id: newid,
                                    css: {
                                        position: "relative"
                                    }
                                })
                                .append($("<h3/>", {
                                    id: "H" + newid,
                                    text: "Aufbereitung für Textverarbeitung",
                                    css: {
                                        position: "absolute",
                                        top: "15px",
                                        left: "15px"
                                    }
                                }))
                            );
                        // rekursiv durch die alte Struktur
                        lastobj = $("#H" + newid);
                        kla1990htm.recurse2($(".content"), newhash);
                        var largestring = $(newhash).html();
                        uihelper.downloadfile("station.html", largestring, function (ret) {
                            console.log("Downloaded");
                        });
                    }
                }))


                .append($("<button/>", {
                    html: "Download kompakt-3",
                    css: {
                        "text-align": "center",
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var newid = "N" + Math.floor(Math.random() * 100000) + 1;
                        var newhash = "#" + newid;
                        $(".content")
                            .append($("<div/>", {
                                    id: newid
                                })
                                .append($("<table/>", {
                                        border: "2",
                                        rules: "all",
                                        width: "95%",
                                        layout: "fixed",
                                        "background-color": "white"
                                    })
                                    .append($("<thead/>")
                                        .append($("<th/>", {
                                            html: "Ergebnis",
                                            width: "70%"
                                        }))
                                        .append($("<th/>", {
                                            html: "Kommentar",
                                            width: "30%"
                                        }))
                                    )
                                    .append($("<tbody/>", {
                                        id: newid + "T"
                                    }))
                                )
                            );
                        // rekursiv durch die alte Struktur
                        debugger;


                        kla1990htm.recurse3($(".content"), "#" + newid + "T", newhash);
                        debugger;
                        var largestring = $(newhash).html();
                        uihelper.downloadfile("station.html", largestring, function (ret) {
                            console.log("Downloaded");
                        });
                    }
                }))

                .append($("<div/>", {
                    id: "kla1990htmclock",
                    float: "left",
                    css: {
                        float: "left",
                        margin: "10px"
                    }
                }))

            );
        /**
         * Beginn des initialen Aufbaus kla1990htmwrapper
         */
        $("#kla1990htm.content")
            .append($("<div/>", {
                    id: "kla1990htmdiv",
                    class: "kla1990htmdiv"
                })
                .append($("<div/>", {
                    id: "kla1990htmwrapper",
                    class: "kla1990htmwrapper",
                    html: "&nbsp;"
                }))
            );
        var h = $("#kla1990htm").height();
        h -= $("#kla1990htm.header").height();
        h -= $("#kla1990htmbuttons").height();
        h -= $("#kla1990htm.footer").height();
        $("#kla1990htmdiv")
            .css({
                "margin": "10px",
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        $("#kla1990htmwrapper")
            .css({
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        console.log("kla1990htmwrapper initialisiert");
        $(window).on('resize', function () {
            var h = $("#kla1990htm").height();
            h -= $("#kla1990htm.header").height();
            h -= $("#kla1990htmbuttons").height();
            h -= $("#kla1990htm.footer").height();
            $("#kla1990htmdiv").css({
                height: h
            });
        });
    }; // Ende show

    /**
     *
     * @param {*} obj
     * @param {*} newhash
     */
    kla1990htm.recurse = function (obj, newhash) {
        var actid = $(obj).attr("id");
        if (typeof actid !== "undefined") {
            if (actid === newhash.substr(1)) {
                debugger;
                console.log("Return home");
                return;
            }
        }
        var acttag = $(obj).prop("tagName");
        console.log(actid + "=>" + acttag);
        console.log(acttag);
        if (acttag === "IMG") {
            debugger;
            $(newhash)
                .append($("<div/>", {
                        html: "&nbsp;",
                        clear: "left"
                    })
                    .append($(obj).clone())
                );
            return;
        }
        if (acttag === "TABLE") {
            $(newhash)
                .append($("<div/>", {
                        html: "&nbsp;",
                        width: "100%",
                        clear: "left"
                    })
                    .append($(obj).clone())
                );
            return;
        }
        if (acttag === "BUTTON") {
            return;
        }

        var ch = $(obj).children();
        if (acttag !== "PRE" && typeof ch !== "undefined" && ch.length > 0) {
            $(ch).each(function (ind, el) {
                console.log("***recurse:" + ch.length + " " + acttag);
                // alert(this.value); // "this" is the current element in the loop
                var that = this;
                kla1990htm.recurse(that, newhash);
            });
        } else {
            if (acttag === "SPAN") {
                var html = $(obj).html();
                $(newhash)
                    .append($("<div/>", {
                            html: "&nbsp;",
                            width: "100%",
                            clear: "left"
                        })
                        .append($("<span/>", {
                            html: html,
                            css: {
                                float: "left"
                            }
                        }))
                    );
                return;
            }

            if (acttag === "DIV") {
                var html = $(obj).html();
                $(newhash)
                    .append($("<div/>", {
                            html: "&nbsp;",
                            width: "100%",
                            clear: "left"
                        })
                        .append($("<div/>", {
                            html: html,
                            css: {
                                float: "left"
                            }
                        }))
                    );
                return;
            }

            if (acttag === "PRE") {
                var html = $(obj).html();
                $(newhash)
                    .append($("<div/>", {
                            html: "&nbsp;",
                            width: "100%",
                            clear: "left"
                        })
                        .append($("<pre/>", {
                            html: html,
                            css: {
                                float: "left"
                            }
                        }))
                    );
                return;
            }

            var text = $(obj).text();
            if (typeof text !== "undefined" && text.length > 0) {
                $(newhash)
                    .append($("<div/>", {
                            html: "&nbsp;",
                            width: "100%",
                            clear: "left"
                        })
                        .append($("<div/>", {
                            text: text,
                            css: {
                                float: "left"
                            }
                        }))
                    );
            }
        }
    };


    /**
     * recurse2 - Aufbereiten mit left und top "stripped"
     * lastobj ist der Anker für die Positionierung
     * newhash steht für den Container (könnte auch body sein)
     * @param {*} obj
     * @param {*} newhash
     */
    kla1990htm.recurse2 = function (obj, newhash) {
        var doposition = "absolute";
        var actid = $(obj).attr("id");
        if (typeof actid !== "undefined") {
            if (actid === newhash.substr(1)) {
                console.log("Return home");
                return;
            }
        }
        var acttag = $(obj).prop("tagName");
        console.log(actid + "=>" + acttag);
        console.log(acttag);
        if (acttag === "IMG") {
            var newimg = $(obj).clone();
            $(newimg).css({
                position: doposition,
                top: $(lastobj).position().top + $(lastobj).height() + 15,
                left: "15px"
            });
            $(newhash).append($(newimg));
            lastobj = $(newimg);
            return;
        }
        if (acttag === "TABLE") {
            var newtable = $(obj).clone();
            $(newtable).css({
                position: doposition,
                top: $(lastobj).position().top + $(lastobj).height() + 15,
                left: "15px"
            });
            $(newhash).append($(newtable));
            lastobj = $(newtable);
            return;
        }
        if (acttag === "BUTTON") {
            return;
        }

        var ch = $(obj).children();
        if (acttag !== "PRE" && typeof ch !== "undefined" && ch.length > 0) {
            $(ch).each(function (ind, el) {
                console.log("***recurse:" + ch.length + " " + acttag);
                // alert(this.value); // "this" is the current element in the loop
                var that = this;
                kla1990htm.recurse2(that, newhash);
            });
        } else {
            if (acttag === "SPAN") {
                var html = $(obj).html();
                if (html.length === 0 || html === "&nbsp;") return;
                var newspan = $(obj).clone();
                $(newspan).css({
                    position: doposition,
                    top: $(lastobj).position().top + $(lastobj).height() + 15,
                    left: "15px"
                });
                $(newhash).append($(newspan));
                lastobj = $(newspan);
                return;
            }

            if (acttag === "DIV") {
                var html = $(obj).html();
                if (html.trim().length > 0 && html !== "&nbsp;") {
                    var newdiv = document.createElement("span");
                    $(newdiv).html(html);
                    $(newdiv).css({
                        position: doposition,
                        top: $(lastobj).position().top + $(lastobj).height() + 15,
                        left: "15px"
                    });
                    $(newhash).append($(newdiv));
                    lastobj = $(newdiv);
                }
                return;
            }

            if (acttag === "PRE") {
                var newpre = document.createElement("span");
                $(newpre).html($(obj).html());
                $(newpre).css({
                    position: doposition,
                    top: $(lastobj).position().top + $(lastobj).height() + 15,
                    left: "15px"
                });
                $(newhash).append($(newpre));
                lastobj = $(newpre);
                return;
            }

            var text = $(obj).text();
            if (typeof text !== "undefined" && text.length > 0) {
                var newtext = document.createElement("span");
                $(newtext).html($(obj).html());
                $(newtext).css({
                    position: doposition,
                    top: $(lastobj).position().top + $(lastobj).height() + 15,
                    left: "15px"
                });
                $(newhash).append($(newtext));
                lastobj = $(newtext);
            }
            return;
        }
    };



    /**
     * recurse3 - Aufbereiten Table
     * newhash steht für den Container (könnte auch body sein)
     * @param {*} obj
     * @param {*} newhash
     */
    kla1990htm.recurse3 = function (obj, newhash, newtophash) {
        var doposition = "absolute";
        var actid = $(obj).attr("id");
        if (typeof actid !== "undefined") {
            if (actid === newtophash.substr(1)) {
                debugger;
                console.log("Return home");
                return;
            }
        }
        var acttag = $(obj).prop("tagName");
        console.log(actid + "=>" + acttag);
        console.log(acttag);
        if (acttag === "IMG") {
            var newimg = $(obj).clone();
            $(newimg).css({
                margin: "10px"
            });
            $(newhash)
                .append($("<tr/>")
                    .append($("<td/>")
                        .append($(newimg))
                    )
                    .append($("<td/>", {
                        html: "Raum für Kommentare"
                    }))
                );
            return;
        }
        if (acttag === "TABLE") {
            var newtable = $(obj).clone();
            $(newtable).css({
                margin: "10px"
            });
            $(newhash)
                .append($("<tr/>")
                    .append($("<td/>")
                        .append($(newtable))
                    )
                    .append($("<td/>", {
                        html: "Raum für Kommentare"
                    }))
                );
            return;
        }
        if (acttag === "BUTTON") {
            return;
        }

        var ch = $(obj).children();
        if (acttag !== "PRE" && typeof ch !== "undefined" && ch.length > 0) {
            $(ch).each(function (ind, el) {
                console.log("***recurse:" + ch.length + " " + acttag);
                // alert(this.value); // "this" is the current element in the loop
                var that = this;
                kla1990htm.recurse3(that, newhash, newtophash);
            });
        } else {
            if (acttag === "SPAN") {
                var html = $(obj).html();
                if (html.length === 0 || html === "&nbsp;") return;
                var newspan = $(obj).clone();
                $(newspan).css({
                    margin: "10px"
                });
                $(newhash)
                    .append($("<tr/>")
                        .append($("<td/>")
                            .append($(newspan))
                        )
                        .append($("<td/>", {
                            html: "Raum für Kommentare"
                        }))
                    );
                return;
            }

            if (acttag === "DIV") {
                var html = $(obj).html();
                if (html.trim().length > 0 && html !== "&nbsp;") {
                    var newdiv = document.createElement("span");
                    $(newdiv).html(html);
                    $(newdiv).css({
                        margin: "10px"
                    });
                    $(newhash)
                        .append($("<tr/>")
                            .append($("<td/>")
                                .append($(newdiv))
                            )
                            .append($("<td/>", {
                                html: "Raum für Kommentare"
                            }))
                        );
                }
                return;
            }

            if (acttag === "PRE") {
                var newpre = document.createElement("span");
                $(newpre).html($(obj).html());
                $(newpre).css({
                    margin: "10px"
                });
                $(newhash)
                    .append($("<tr/>")
                        .append($("<td/>")
                            .append($(newpre))
                        )
                        .append($("<td/>", {
                            html: "Raum für Kommentare"
                        }))
                    );
                return;
            }

            var text = $(obj).text();
            if (typeof text !== "undefined" && text.length > 0) {
                var newtext = document.createElement("span");
                $(newtext).html($(obj).html());
                $(newtext).css({
                    margin: "10px"
                });
                $(newhash)
                    .append($("<tr/>")
                        .append($("<td/>")
                            .append($(newtext))
                        )
                        .append($("<td/>", {
                            html: "Raum für Kommentare"
                        }))
                    );
            }
            return;
        }
    };


    /**
     * Einblendung Stopuhr wärend langer AJAX-Aufrufe
     */
    kla1990htm.showclock = function (clockcontainer) {
        // Update the count down every 1 second
        if (typeof clockcontainer === "string") {
            if (!clockcontainer.startsWith("#")) clockcontainer = "#" + clockcontainer;
        }
        if ($('#kliclock', clockcontainer).length === 0) {
            $(clockcontainer)
                .append($("<span/>", {
                    id: "kliclock",
                    class: "kliclock",
                    html: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
                    css: {
                        "font-size": "2em",
                        "font-weight": "bold"
                    }
                }));
        }
        var countDownDate = new Date().getTime();
        var xclock = setInterval(function () {
            // Get today's date and time
            var now = new Date().getTime();
            // Find the distance between now and the count down date
            var distance = now - countDownDate;
            // Time calculations for days, hours, minutes and seconds
            // var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            distance = Math.floor(distance - seconds * 1000);
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            distance = Math.floor(distance - minutes * 1000 * 60);
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            // Display the result in the element with id="demo"
            $("#kliclock").text(hours + "h " + minutes + "m " + seconds + "s " + " . . . loading");
        }, 1000);
        return xclock;
    };

    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1990htm;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1990htm;
        });
    } else {
        // included directly via <script> tag
        root.kla1990htm = kla1990htm;
    }
}());