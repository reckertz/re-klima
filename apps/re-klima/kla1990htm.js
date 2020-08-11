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
                            canvas: true,
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
                    html: "Dies ist die Initialisierung"
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