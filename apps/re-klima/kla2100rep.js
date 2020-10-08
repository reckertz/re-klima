/*global $,this,screen,document,window,module,define,root,global,self,var,async,sysbase,uihelper,kla9020fun,regression */
(function () {
    'use strict';
    var kla2100rep = {};
    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla2100rep  Auswertung GHCND außer TMAX und TMIN, also PRCP, SNOW etc.!!!
     * Aufruf aus kla1610sta
     * bekommt über getCache pivotdata oder yearlats(?)
     * und erzeugt animierte Gifs mit der Option weiterer Zuordnungen
     * nach latitude und
     * nach wasserstand, grundet auf Ganzzahlen
     * mit Sekundärdaten aus HYDE
     */

    var kla2100repparms = {};
    var varparms = {};
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

    var myCharts = {};

    var selparms;
    var selstations = []; // die Massenabfrage kann je station unterschiedliche source haben!!!,
    // daher Strukur mit selstationid und selsource je Eintrag
    var selstationid = null;
    var selsource = null;
    var selvariablename = null;
    var starecord = null; // Selektionsparameter
    var kla2100repconfig = {};
    var stationrecord;
    var yearindexarray = {};
    var matrix1 = {}; // aktive Datenmatrix, wenn gefüllt
    var histo1 = {}; // Histogramm auf Wasserstand gerundet Ganzzahl
    var array1 = []; // aktives Array für d3
    var klirecords = [];
    var klirow = {}; // der aktuelle Datensatz, dynamisch aus klirecords[i] geholt
    var klihydes = {}; // Struktur für die gesammelten Hyde-Daten: source.stationid => klihyde in der Strukur
    var klihyde = {}; // Struktur für eine source.stationid Kombination
    var kla2100repclock;

    var hmatrixR;
    var hmatrixL;

    var hoptionsR;
    var hoptionsL;

    var poprecord = {}; // Konfigurationsparameter mit Default-Zuweisung
    poprecord.qonly = true;
    poprecord.total = false;
    poprecord.mixed = true;
    poprecord.moon = false;
    poprecord.tempdistribution = true;
    poprecord.export = false;

    kla2100rep.show = function (parameters, navigatebucket) {
        // if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {}
        if (typeof parameters !== "undefined" && parameters.length > 0) {
            selstationid = parameters[0].stationid;
            selsource = parameters[0].source;
            selvariablename = parameters[0].variablename;
            starecord = JSON.parse(parameters[0].starecord);
        } else {
            /**
             * Prüfen, ob allin - Abarbeiten aller stationid aus der Liste
             */
            selparms = window.parent.sysbase.getCache("onestation");
            if (selparms !== null) {
                selparms = JSON.parse(selparms);
                selstations = selparms.selstations || [];
                selstationid = selparms.stationid;
                starecord = selparms.starecord;
                selsource = selparms.starecord.source;
                selvariablename = selparms.starecord.variablename;
            }
            /*
            config:
            comment: ""
            decimals: false
            heatmaps: false
            hyde: false
            master: true
            qonly: false
            tempdistribution: false
            tempchart: false
            temptable: false
            */
            kla2100repconfig = $.extend(true, {
                comment: "",
                decimals: true,
                heatmaps: true,
                hyde: true,
                master: true,
                qonly: true,
                tempdistribution: true,
                tempchart: true,
                temptable: true,
                allin: false,
                autoload: true

            }, selparms.config);

        }

        kla2100repparms = {
            selstations: selstations,
            selstationid: selstationid,
            starecord: starecord,
            selsource: selsource,
            selvariablename: selvariablename
        };
        varparms = {
            TMAX: {
                header: "Temperatur",
                reverse: false,
                cumulate: false
            },
            TMIN: {
                header: "Temperatur",
                reverse: false,
                cumulate: false

            },
            "TMAX,TMIN": {
                header: "Temperatur",
                reverse: false,
                cumulate: false

            },
            PRCP: {
                header: "Niederschlag",
                reverse: false,
                cumulate: true
            },
            SNOW: {
                header: "Schnee",
                reverse: false,
                cumulate: false
            },
            TSUN: {
                header: "Sonne",
                reverse: false,
                cumulate: false
            },
            PSUN: {
                header: "mögl. Sonne",
                reverse: false,
                cumulate: false
            },
            WLVL: {
                header: "Grundwasser",
                reverse: false,
                cumulate: false
            }
        };



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
        $(".headertitle").attr("title", "kla2100rep");
        $(".content").attr("pageid", "kla2100rep");
        $(".content").attr("id", "kla2100rep");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla2100rep")
            .append($("<input/>", {
                type: "hidden",
                id: "kla2100rep_isdirty",
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
        $("#kla2100rep.content").empty();
        $("#kla2100rep.content")
            .append($("<div/>", {
                id: "kla2100repbuttons",
                css: {
                    width: "100%",
                    float: "left"
                }
            }));

        $("#kla2100repbuttons")


            .append($("<button/>", {
                html: "Drucken",
                css: {
                    "text-align": "center",
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    // sysbase.printDivAll($("#kla2100repwrapper").html());
                    // https://georgebohnisch.com/dynamically-generate-replace-html5-canvas-elements-img-elements/
                    $('canvas').each(function (e) {
                        var image = new Image();
                        var that = this;
                        image.src = this.toDataURL("image/png");
                        var w = $(this).width();
                        var h = $(this).height();
                        $(image).width(w);
                        $(image).height(h);
                        // doprintthis, wenn die Klasse schon da war
                        if ($(this).hasClass("doprintthis")) {
                            $(image).addClass("doprintthis");
                        }
                        var parspan = $(this).parent();
                        if ($(parspan).prop("tagName") === "SPAN") {
                            $(parspan).css({
                                width: w + "px",
                                height: h + "px"
                            });
                        }
                        $(this).replaceWith(image);
                    });
                    evt.preventDefault();
                    // https://github.com/jasonday/printThis
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
            }))

            .append($("<button/>", {
                html: "Aufbereiten HTML",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // evt.stopPropagation();
                    // evt.stopImmediatePropagation();
                    // https://georgebohnisch.com/dynamically-generate-replace-html5-canvas-elements-img-elements/
                    /**
                     * Konvertieren svg zu image
                     * http://bl.ocks.org/biovisualize/8187844
                     */
                    var tourl = "klaheatmap.html" + "?" + "stationid=" + selstationid + "&source=" + selsource + "&variablename=" + selvariablename;
                    var idc21 = window.parent.sysbase.tabcreateiframe(selstationid, "", "re-klima", "kla1990htm", tourl);
                    window.parent.$(".tablinks[idhash='#" + idc21 + "']").click(); // das legt erst den iFrame an
                    setTimeout(function () {

                        var actdiv = window.parent.$("#" + idc21);
                        var actiFrame = $(actdiv).find("iframe").get(0);
                        var actiFrameBody = $(actiFrame).contents();
                        /**
                         * Loop über alle doprintthis-Elemente
                         */
                        var aktwrapper = $(actiFrameBody).find(".kla1990htmwrapper");
                        $('.doprintthis').each(function (index, printelement) {
                            $(aktwrapper)
                                .append($(printelement));
                            $(aktwrapper)
                                .append($("<div/>", {
                                    html: "&nbsp;",
                                    css: {
                                        clear: "both"
                                    }
                                }));
                        });
                        /**
                         * Konvertieren canvas zu image
                         */
                        $(actiFrameBody).find('canvas').each(function (index, printcanvas) {
                            var image = new Image();
                            image.src = printcanvas.toDataURL("image/jpg"); // png
                            var w = $(printcanvas).width();
                            var h = $(printcanvas).height();
                            $(image).width(w);
                            $(image).height(h);
                            // doprintthis, wenn die Klasse schon da war
                            if ($(printcanvas).hasClass("doprintthis")) {
                                $(image).addClass("doprintthis");
                            }
                            var parspan = $(printcanvas).parent();
                            if ($(parspan).prop("tagName") === "SPAN") {
                                $(parspan).css({
                                    width: w + "px",
                                    height: h + "px"
                                });
                            }
                            $(printcanvas).replaceWith(image);
                        });

                        /**
                         * Konvertieren svg zu Image
                         */
                        $(actiFrame).find('svg').each(function (index, svgelement) {
                            var svgString = new XMLSerializer().serializeToString(svgelement);
                            //var canvas = document.getElementById("canvas");
                            var canvas = document.createElement("canvas");
                            var ctx = canvas.getContext("2d");
                            var DOMURL = self.URL || self.webkitURL || self;
                            var svg = new Blob([svgString], {
                                type: "image/svg+xml;charset=utf-8"
                            });
                            var url = DOMURL.createObjectURL(svg);
                            var image = new Image();
                            image.src = url;
                            var w = $(svgelement).width();
                            var h = $(svgelement).height();
                            $(image).width(w);
                            $(image).height(h);
                            // doprintthis, wenn die Klasse schon da war
                            if ($(svgelement).hasClass("doprintthis")) {
                                $(svgelement).addClass("doprintthis");
                            }
                            var parspan = $(svgelement).parent();
                            if ($(parspan).prop("tagName") === "SPAN") {
                                $(parspan).css({
                                    width: w + "px",
                                    height: h + "px"
                                });
                            }
                            $(svgelement).replaceWith(image);
                        });

                    }, 2000);
                    if (1 === 1) return;
                    window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
                }
            }))


            .append($("<button/>", {
                html: "Heatmap Colortest",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // evt.stopPropagation();
                    // evt.stopImmediatePropagation();
                    if ($("#kliheattable").is(":visible")) {
                        $("#kliheattable").hide();
                    } else {
                        $("#kla2100repwrapper").empty();
                        var h = $("#heatmap").height();
                        var w = $("#kla2100rep.content").width();
                        w -= 0; // $("#heatmap").position().left;
                        w -= 0; // $("#heatmap").width();
                        w -= 0; // 40;
                        $("#kla2100repwrapper")
                            .append($("<div/>", {
                                id: "kla2100repcolormap",
                                css: {
                                    "background-color": "yellow",
                                    height: h,
                                    width: w,
                                    overflow: "auto"
                                }
                            }));
                        $("#kla2100repcolormap").show();
                        kla9020fun.getColorPaletteX1("kla2100repcolormap", 7);
                    }
                    return false;
                }
            }))

            .append($("<div/>", {
                id: "kla2100repclock",
                float: "left",
                css: {
                    float: "left",
                    margin: "10px"
                }
            }));
        /**
         * Beginn des initialen Aufbaus kla2100repwrapper
         */
        $("#kla2100rep.content")
            .append($("<div/>", {
                    id: "kla2100repdiv",
                    class: "kla2100repdiv"
                })
                .append($("<div/>", {
                    id: "kla2100repwrapper",
                    class: "kla2100repwrapper"
                }))
            );
        var h = $("#kla2100rep").height();
        h -= $("#kla2100rep.header").height();
        h -= $("#kla2100repbuttons").height();
        h -= $("#kla2100rep.footer").height();
        $("#kla2100repdiv")
            .css({
                "margin": "10px",
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        $("#kla2100repwrapper")
            .css({
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        console.log("kla2100repwrapper initialisiert, leer");
        $(window).on('resize', function () {
            var h = $("#kla2100rep").height();
            h -= $("#kla2100rep.header").height();
            h -= $("#kla2100repbuttons").height();
            h -= $("#kla2100rep.footer").height();
            $("#kla2100repdiv").css({
                height: h
            });
        });

        /**
         * Laden aller benötigten Daten, dann Ausgabe mit Formatieren
         */
        kla2100rep.getmoredata(function (ret) {
            clearInterval(kla2100repclock);
            $("#kliclock").html("&nbsp;&nbsp;&nbsp;");
            $(':button').prop('disabled', false); // Enable all the buttons
            $("body").css("cursor", "default");
            return;
        });
    }; // Ende show

    /**
     * getmoredata - kla2100repconfig.allin === true
     * allin === true, dann selstations mit stationid und source als Array abfragen
     * im server:
     * - create temporary table
     * - dann laden der temporary table
     * - dann eigentlicher SQL-Zugriff
     * - Rückgabe records - das eigentliche Ziel
     * tricky mit temporary table
     */
    kla2100rep.getmoredata = function (cb2100n) {
        var ttid = "STA" + Math.floor(Math.random() * 100000) + 1;
        async.waterfall([
                function (cb2100n0) {
                    if (selstations.length === 0) {
                        selstations.push({
                            source: selsource,
                            stationid: selstationid,
                            variable: selvariablename
                        });
                    }
                    kla2100repclock = kla2100rep.showclock("#kla2100repclock");
                    //$("button").hide();
                    $(':button').prop('disabled', true); // Disable all the buttons
                    $("body").css("cursor", "progress");
                    /**
                     * Aufbau temporary table
                     */
                    var crtsql = "CREATE TEMPORARY TABLE " + ttid + " (stationid text, source text, variable text)";
                    /**
                     * Daten zum Laden der temporary table: selstations
                     * sql SELECT mit temptable über ttid
                     */
                    var sqlStmt = "";
                    // selvariablename = "WLVL";
                    var projection = {};
                    sqlStmt += "SELECT ";
                    sqlStmt += "KLISTATIONS.source, ";
                    sqlStmt += "KLISTATIONS.stationid, ";
                    sqlStmt += "stationname, ";
                    sqlStmt += "climatezone, ";
                    sqlStmt += "region, ";
                    sqlStmt += "subregion, ";
                    sqlStmt += "countryname, ";
                    sqlStmt += "continent, ";
                    sqlStmt += "continentname, ";
                    sqlStmt += "lats, ";
                    sqlStmt += "longitude, ";
                    sqlStmt += "latitude, ";
                    sqlStmt += ttid + ".variable, "; // wichtig, damit variable immer geladen wird, GHCN etc.
                    // können dann gezielt nachgeladen werden
                    sqlStmt += "anzyears, ";
                    sqlStmt += "realyears, ";
                    sqlStmt += "fromyear, ";
                    sqlStmt += "toyear, ";
                    sqlStmt += "height, ";
                    sqlStmt += "years ";
                    sqlStmt += " FROM " + ttid;
                    sqlStmt += " INNER JOIN KLISTATIONS ";
                    sqlStmt += " ON " + ttid + ".source = KLISTATIONS.source";
                    sqlStmt += " AND " + ttid + ".stationid = KLISTATIONS.stationid";
                    sqlStmt += " LEFT JOIN KLIDATA ";
                    sqlStmt += " ON " + ttid + ".source = KLIDATA.source ";
                    sqlStmt += " AND " + ttid + ".stationid = KLIDATA.stationid ";
                    sqlStmt += " AND " + ttid + ".variable = KLIDATA.variable ";
                    // sqlStmt += " WHERE KLIDATA.variable ='" + selvariablename + "' ";
                    sqlStmt += " ORDER BY " + ttid + ".source, " + ttid + ".stationid, KLIDATA.variable";
                    var api = "getallsqlrecords";
                    var table = "KLISTATIONS";
                    //uihelper.getAllRecords(sqlStmt, {}, [], 0, 2, api, table, function (ret1) {
                    var jqxhr = $.ajax({
                        method: "POST",
                        crossDomain: false,
                        url: sysbase.getServer("getmoredata"),
                        data: {
                            timeout: 10 * 60 * 1000,
                            crtsql: crtsql,
                            selstations: selstations,
                            sqlStmt: sqlStmt,
                            temptable: ttid
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        sysbase.checkSessionLogin(r1);
                        var ret1 = JSON.parse(r1);
                        sysbase.putMessage(ret1.message, 1);
                        if (ret1.error === true) {
                            cb2100n0("Error", {
                                error: ret1.error,
                                message: ret1.message,
                                crtsql: crtsql,
                                selstations: selstations,
                                sqlStmt: sqlStmt,
                                temptable: ttid
                            });
                            return;
                        } else {
                            cb2100n0(null, {
                                error: ret1.error,
                                message: ret1.message,
                                records: ret1.records,
                                crtsql: crtsql,
                                selstations: selstations,
                                sqlStmt: sqlStmt,
                                temptable: ttid
                            });
                            return;
                        }
                    }).fail(function (err) {
                        //$("#kli1400raw_rightwdata").empty();
                        //document.getElementById("kli1400raw").style.cursor = "default";
                        sysbase.putMessage("getmoredata:" + err, 3);
                        cb2100n0("Error", {
                            error: true,
                            message: err.message || err
                        });
                        return;
                    }).always(function () {
                        // nope
                    });

                },
                function (ret1, cb2100n5) {
                    /**
                     * hier kommt eine async loop-Steuerung, um die Daten sequentiell abzuarbeite
                     * in der bisherigen Logik
                     */
                    klirecords = ret1.records;
                    async.eachSeries(ret1.records, function (newklirow, nextklirow) {
                        /**
                         * Direkte Ausgabe des reports für die Records in ret1.records => klirow
                         * Wiederholungsvermeidung geschieht dynamisch ohne expliziten Gruppenwechsel
                         * mit Kontrollobjekten "jede Anwendung schützt sich selbst"
                         * Achtung: hier kann years  leer sein, genauso anzyears, fromyear, toyear und variable
                         * variable ist der kritische Punkt!!!
                         */
                        klirow = newklirow;
                        async.waterfall([
                                function (cb2100n50) {
                                    /**
                                     * Laden KLIDATA aus Urdaten, wenn erforderlich
                                     */
                                    var ret = {};
                                    ret.record = klirow;
                                    if (klirow.years === null) {
                                        klirow.years = {};
                                    } else if (typeof klirow.years === "string") {
                                        if (klirow.years.startsWith("{")) {
                                            klirow.years = klirow.years.replace(/""/g, null);
                                            klirow.years = JSON.parse(klirow.years);
                                        } else {
                                            klirow.years = {};
                                        }
                                    }
                                    if (typeof klirow.years === "object") {
                                        var jahre = Object.keys(klirow.years);
                                        if (jahre === null || jahre.length === 0) {
                                            if (kla2100repconfig.autoload === true) {
                                                // hier nachladen!
                                                kla2100rep.execmoredata(klirow.source, klirow.stationid, klirow.variable, function (ret1) {
                                                    klirow = ret1.record;
                                                    ret.record = ret1.record;
                                                    cb2100n50(null, ret);
                                                    return;
                                                });
                                            } else {
                                                // raus
                                                ret.error = true;
                                                ret.message = "Keine Daten vorhanden, autoload nicht gesetzt";
                                                cb2100n50("Error", ret);
                                                return;
                                            }
                                        } else {
                                            // raus
                                            cb2100n50(null, ret);
                                            return;
                                        }
                                    } else {
                                        ret.error = true;
                                        ret.message = "Keine Daten vorhanden, prüfen";
                                        cb2100n50("Error", ret);
                                        return;
                                    }
                                },
                                function (ret, cb2100n51) {
                                    /**
                                     * Prüfen und Holen der HYDE-Daten
                                     * HYDE geht in Cache, weil mehrere Variablen den gleichen Bezug haben können
                                     */
                                    if (kla2100repconfig.hyde === false) {
                                        cb2100n51(null, ret);
                                        return;
                                    }
                                    // Prüfen, ob schon vorhanden und holen aus cache
                                    if (typeof klihydes[klirow.source] !== "undefined" &&
                                        typeof klihydes[klirow.source][klirow.stationid] !== "undefined") {
                                        klihyde = klihydes[klirow.source][klirow.stationid];
                                        cb2100n51(null, ret);
                                        return;
                                    }
                                    var jqxhr = $.ajax({
                                        method: "GET",
                                        crossDomain: false,
                                        url: sysbase.getServer("stationhyde"),
                                        data: {
                                            source: klirow.source,
                                            stationid: klirow.stationid,
                                            longitude: klirow.longitude,
                                            latitude: klirow.latitude,
                                            name: klirow.stationname,
                                            globals: false,
                                            selyears: "",
                                            selvars: "popc,rurc,urbc,uopp,cropland,tot_irri"
                                        }
                                    }).done(function (r1, textStatus, jqXHR) {
                                        sysbase.checkSessionLogin(r1);
                                        var ret = JSON.parse(r1);
                                        sysbase.putMessage(ret.message, 1);
                                        if (ret.error === true) {
                                            cb2100n51(null, ret);
                                            return;
                                        } else {
                                            klihyde = ret.klihyde;
                                            klihydes[klirow.source] = klihydes[klirow.source] || {};
                                            klihydes[klirow.source][klirow.stationid] = klihyde;
                                            // klihyde.data muss mit JSON.parse noch entpackt werden
                                            cb2100n51(null, ret);
                                            return;
                                        }
                                    }).fail(function (err) {
                                        sysbase.putMessage(err, 1);
                                        cb2100n51(null, ret);
                                        return;
                                    }).always(function () {
                                        // nope
                                    });
                                },
                                function (ret, cb2100n52) {
                                    /**
                                     * Auswertung einer source, stationid, variable Kombination aus klirow
                                     */
                                    if (klirow.years !== null) {
                                        if (typeof klirow.years === "string") {
                                            klirow.years = JSON.parse(klirow.years);
                                        }
                                        // Vorbereitung buckets
                                        kla2100rep.showall(klirow, function (ret1) {
                                            cb2100n52("Finish", ret);
                                            return;
                                        });
                                    } else {
                                        cb2100n52("Finish", ret);
                                        return;
                                    }
                                }
                            ],
                            function (error, result) {
                                if (error !== null && error === "Error") {
                                    var htmlmsg = klirow.source + " " + klirow.stationid + " " + klirow.variable + " " + error + " " + result.message;
                                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                                    $("#kla2100repwrapper")
                                        .append($("<div/>", {
                                            id: divid,
                                            class: "doprintthis",
                                            css: {
                                                width: "100%",
                                                float: "left",
                                                overflow: "hidden",
                                                "font-weight": "bold"
                                            },
                                            html: htmlmsg
                                        }));
                                }
                                nextklirow();
                                return;
                            }); // evtl in Schlussfunktion von waterfall erst nextklirow(); aufrufen
                    }, function (err) {
                        // zum Ablschluss TODO:
                        cb2100n5(null, {
                            error: false,
                            message: "finished"
                        });
                        return;
                    });
                }
            ],
            function (error, result) {
                cb2100n(result);
                return;
            });

    };
    /**
     * execmoredata - in Loop die Verarbeitung eines Pair in klirecords
     * durchführen, teilweise von altem loadall und dann showall
     * @param {*} newsource
     * @param {*} newstationid
     * @param {*} cbexec
     * returns klirow - years, fromyear, toyear, anzyears gezielt!!!
     */
    kla2100rep.execmoredata = function (newsource, newstationid, newvariable, cb2100p) {
        selsource = newsource;
        selstationid = newstationid;
        selvariablename = newvariable;
        async.waterfall([
                function (cb2100p2) {
                    /**
                     * Laden der GHCN-Daily-Daten, falls angefordert
                     * Laden aus den Urdaten (*.dly-Files)
                     */
                    var jqxhr = $.ajax({
                        method: "GET",
                        crossDomain: false,
                        url: sysbase.getServer("ghcnddata"),
                        data: {
                            timeout: 10 * 60 * 1000,
                            source: selsource,
                            stationid: selstationid,
                            variable: selvariablename
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        sysbase.checkSessionLogin(r1);
                        var ret1 = JSON.parse(r1);
                        sysbase.putMessage(ret1.message, 1);
                        if (ret1.error === true) {
                            cb2100p2("Error", {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        } else {
                            cb2100p2(null, {
                                error: ret1.error,
                                operation: "repeat",
                                message: ret1.message,
                                selvariablename: selvariablename,
                                selsource: selsource,
                                selstationid: selstationid
                            });
                            return;
                        }
                    }).fail(function (err) {
                        //$("#kli1400raw_rightwdata").empty();
                        //document.getElementById("kli1400raw").style.cursor = "default";
                        sysbase.putMessage("ghcnddata:" + err, 3);
                        cb2100p2("Error", {
                            error: true,
                            message: err.message || err
                        });
                        return;
                    }).always(function () {
                        // nope
                    });
                },
                function (ret, cb2100p3) {
                    /**
                     * nochmaliges Lesen, falls erforderlich
                     */
                    if (typeof ret.operation === "undefined" || ret.operation !== "repeat") {
                        cb2100p3(null, ret);
                        return;
                    }
                    // gezieltes Lesen years, fromyear, toyear, anzyears
                    var sqlSelect = "SELECT source, stationid, variable, years, fromyear, toyear, anzyears";
                    sqlSelect += " FROM KLIDATA";
                    sqlSelect += " WHERE source ='" + ret.selsource + "'";
                    sqlSelect += " AND stationid ='" + ret.selstationid + "'";
                    sqlSelect += " AND variable ='" + ret.selvariablename + "'";
                    uihelper.getOneRecord(sqlSelect, {}, "getonerecord", "KLIDATA", function (ret1) {
                        if (ret1.error === false && ret1.record !== null) {
                            var newdata = ret1.record;
                            klirow.years = newdata.years;
                            klirow.fromyear = newdata.fromyear;
                            klirow.toyear = newdata.toyear;
                            klirow.anzyears = newdata.anzyears;
                            klirow.years = klirow.years.replace(/""/g, null);
                            klirow.years = JSON.parse(klirow.years);
                            cb2100p3(null, {
                                error: false,
                                message: ret.selsource + " " + ret.selstationid + " " + ret.selvariablename + " Daten gefunden"
                            });
                            return;
                        } else {
                            cb2100p3(null, {
                                error: true,
                                message: ret.selsource + " " + ret.selstationid + " " + ret.selvariablename + " Endgültig keine Daten gefunden"
                            });
                            return;
                        }
                    });
                }
            ],
            function (error, result) {
                cb2100p(result);
                return;
            });
    };

    /**
     * kla2100rep.getBucketYear
     * @param {*} klirow
     * @param {*} byear
     * returns bucketyear
     */
    kla2100rep.getBucketYear = function (klirow, byear, bstep, method) {
        var buck0 = parseInt(byear);
        var buck1 = buck0 - 1661; // 65 * 30 = 1950 Rest 11
        // oder 1661 als Basisjahr und damit rechnen
        var steps = parseInt(kla2100repconfig.step || 30);
        var buck2 = Math.floor(buck1 / steps);
        var buck3 = 1661 + (buck2) * steps;
        var buckyear = "" + buck3;
        return {
            bucketindex: buck3,
            bucketstring: "" + buck3
        }
    };

    /**
     * kla2100rep.getBuckets
     * @param {*} klirow - aktueller Datensatz
     * @param {*} bucketname - Name unter dem die buckets abelegt werden in klirow
     * @param {*} yearbase - Basisjahr, ab dem Buckets berechnet werden
     * @param {*} yearstep - Anzahl Jahre in einem Bucket
     * @param {*} labelmethod - fromto setzt from-to; middle setzt (from + to) / 2
     * @param {*} endmethod - config setzt kla2100repconfig.fromyear und .toyear; data nimmt klirow.fromyear und toyear
     *                 toyear wird gerundet
     * return - klirow wird direkt fortgeschrieben, return false wenn Probleme aufgetaucht sind
     */
    kla2100rep.getBuckets = function (klirow, bucketname, yearbase, yearstep, labelmethod, endmethod) {
        klirow[bucketname] = {};
        klirow[bucketname].yearbase = parseInt(yearbase);
        klirow[bucketname].yearstep = parseInt(yearstep);
        if (endmethod === "config") {
            klirow[bucketname].fromyear = parseInt(kla2100repconfig.fromyear);
            klirow[bucketname].toyear = parseInt(kla2100repconfig.toyear);
            klirow[bucketname].yearstep = parseInt(kla2100repconfig.step);
        } else {
            klirow[bucketname].fromyear = parseInt(klirow.fromyear);
            klirow[bucketname].toyear = parseInt(klirow.toyear);
        }
        klirow[bucketname].data = [];
        var emptybucket = {
            label: "",
            fromyear: null,
            toyear: null,
            min: null,
            max: null,
            sum: 0,
            count: 0,
            avg: null
        };

        // Initialisierung aus den Parametern in klirow[bucketname], die bereits aufbereitet sind
        var anzbuckets = Math.ceil((klirow[bucketname].toyear - klirow[bucketname].fromyear + 1) / klirow[bucketname].yearstep); // aufgerundet
        for (var ibuck = 0; ibuck < anzbuckets; ibuck++) {
            klirow[bucketname].data[ibuck] = Object.assign({}, emptybucket);
            klirow[bucketname].data[ibuck].fromyear = klirow[bucketname].fromyear + ibuck * klirow[bucketname].yearstep;
            klirow[bucketname].data[ibuck].toyear = klirow[bucketname].data[ibuck].fromyear + klirow[bucketname].yearstep - 1;
            if (labelmethod === "fromto") {
                klirow[bucketname].data[ibuck].label = klirow[bucketname].data[ibuck].fromyear + "-" + klirow[bucketname].data[ibuck].toyear;
            } else if (labelmethod === "middle") {
                klirow[bucketname].data[ibuck].label = Math.floor((klirow[bucketname].data[ibuck].fromyear + klirow[bucketname].data[ibuck].toyear) / 2);
            }
        }
        var sumbucket = Object.assign({}, emptybucket);
        sumbucket.fromyear = klirow[bucketname].fromyear;
        sumbucket.toyear = klirow[bucketname].toyear;
        sumbucket.label = sumbucket.fromyear + "-" + sumbucket.toyear;
        /**
         * hier kommt der eigentliche Berechnungsteil
         */
        var workbucket = klirow[bucketname];
        for (var iyear = workbucket.fromyear; iyear <= workbucket.toyear; iyear++) {
            var syear = "" + iyear;
            if (typeof klirow.years[syear] !== "undefined") {
                // Bestimmung bucket, LOOP, weil später "dedizierte" Perioden kommen
                var aktbuckindex = null;
                for (ibuck = 0; ibuck < workbucket.data.length; ibuck++) {
                    if (iyear >= workbucket.data[ibuck].fromyear && iyear <= workbucket.data[ibuck].toyear) {
                        aktbuckindex = ibuck;
                        break;
                    }
                }
                if (aktbuckindex !== null) {
                    var aktbuck = workbucket.data[aktbuckindex];
                    for (var iday = 0; iday < klirow.years[syear].length; iday++) {
                        var valuestring = klirow.years[syear][iday];
                        if (valuestring === null || valuestring === "-9999" || valuestring === "-999.9") {
                            continue;
                        }
                        var value = parseFloat(valuestring);
                        if (aktbuck.min === null) {
                            aktbuck.min = parseFloat(value);
                        } else if (value < aktbuck.min) {
                            aktbuck.min = parseFloat(value);
                        }
                        if (aktbuck.max === null) {
                            aktbuck.max = parseFloat(value);
                        } else if (value > aktbuck.max) {
                            aktbuck.max = parseFloat(value);
                        }
                        aktbuck.count++;
                        aktbuck.sum += value;
                        aktbuck.avg = aktbuck.sum / aktbuck.count;

                        if (sumbucket.min === null) {
                            sumbucket.min = parseFloat(value);
                        } else if (value < sumbucket.min) {
                            sumbucket.min = parseFloat(value);
                        }
                        if (sumbucket.max === null) {
                            sumbucket.max = parseFloat(value);
                        } else if (value > sumbucket.max) {
                            sumbucket.max = parseFloat(value);
                        }
                        sumbucket.count++;
                        sumbucket.sum += value;
                        sumbucket.avg = aktbuck.sum / aktbuck.count;
                    }
                }
            }
        }
        klirow[bucketname].sumbucket = Object.assign({}, sumbucket);
        return true;
    };



    /**
     * kla2100rep.getHBuckets
     * @param {*} klirow - aktueller Datensatz
     * @param {*} bucketname - Name unter dem die buckets abelegt werden in klirow
     * @param {*} yearbase - Basisjahr, ab dem Buckets berechnet werden
     * @param {*} yearstep - Anzahl Jahre in einem Bucket
     * @param {*} labelmethod - fromto setzt from-to; middle setzt (from + to) / 2
     * @param {*} endmethod - config setzt kla2100repconfig.fromyear und .toyear; data nimmt klirow.fromyear und toyear
     *                 toyear wird gerundet
     * @param {*} histmethod -
     * return - klirow wird direkt fortgeschrieben, return false wenn Probleme aufgetaucht sind
     */
    kla2100rep.getHBuckets = function (klirow, bucketname, yearbase, yearstep, labelmethod, endmethod, histmethod) {
        klirow[bucketname] = {};
        klirow[bucketname].yearbase = parseInt(yearbase);
        klirow[bucketname].yearstep = parseInt(yearstep);
        if (endmethod === "config") {
            klirow[bucketname].fromyear = parseInt(kla2100repconfig.fromyear);
            klirow[bucketname].toyear = parseInt(kla2100repconfig.toyear);
            klirow[bucketname].yearstep = parseInt(kla2100repconfig.step);
        } else {
            klirow[bucketname].fromyear = parseInt(klirow.fromyear);
            klirow[bucketname].toyear = parseInt(klirow.toyear);
        }
        klirow[bucketname].data = [];
        var emptybucket = {
            label: "",
            fromyear: null,
            toyear: null,
            min: null,
            max: null,
            sum: 0,
            count: 0,
            avg: null,
            hdata: {}
        };
        // hdata hat x und y, hdata[x] = y als Prinzip
        // x wird aus value abgeleitet als Ganzzahl, y ist der Zähler zu x


        // Initialisierung aus den Parametern in klirow[bucketname], die bereits aufbereitet sind
        var anzbuckets = Math.ceil((klirow[bucketname].toyear - klirow[bucketname].fromyear + 1) / klirow[bucketname].yearstep); // aufgerundet
        for (var ibuck = 0; ibuck < anzbuckets; ibuck++) {
            klirow[bucketname].data[ibuck] = Object.assign({}, emptybucket);
            klirow[bucketname].data[ibuck].fromyear = klirow[bucketname].fromyear + ibuck * klirow[bucketname].yearstep;
            klirow[bucketname].data[ibuck].toyear = klirow[bucketname].data[ibuck].fromyear + klirow[bucketname].yearstep - 1;
            if (labelmethod === "fromto") {
                klirow[bucketname].data[ibuck].label = klirow[bucketname].data[ibuck].fromyear + "-" + klirow[bucketname].data[ibuck].toyear;
            } else if (labelmethod === "middle") {
                klirow[bucketname].data[ibuck].label = Math.floor((klirow[bucketname].data[ibuck].fromyear + klirow[bucketname].data[ibuck].toyear) / 2);
            }
            klirow[bucketname].data[ibuck].hdata = Object.assign({}, {});
        }
        var sumbucket = Object.assign({}, emptybucket);
        sumbucket.fromyear = klirow[bucketname].fromyear;
        sumbucket.toyear = klirow[bucketname].toyear;
        sumbucket.label = sumbucket.fromyear + "-" + sumbucket.toyear;
        /**
         * hier kommt der eigentliche Berechnungsteil
         */
        var workbucket = klirow[bucketname];
        for (var iyear = workbucket.fromyear; iyear <= workbucket.toyear; iyear++) {
            var syear = "" + iyear;
            if (typeof klirow.years[syear] !== "undefined") {
                // Bestimmung bucket, LOOP, weil später "dedizierte" Perioden kommen
                var aktbuckindex = null;
                for (ibuck = 0; ibuck < workbucket.data.length; ibuck++) {
                    if (iyear >= workbucket.data[ibuck].fromyear && iyear <= workbucket.data[ibuck].toyear) {
                        aktbuckindex = ibuck;
                        break;
                    }
                }
                if (aktbuckindex !== null) {
                    var aktbuck = workbucket.data[aktbuckindex];
                    for (var iday = 0; iday < klirow.years[syear].length; iday++) {
                        var valuestring = klirow.years[syear][iday];
                        if (valuestring === null || valuestring === "-9999" || valuestring === "-999.9") {
                            continue;
                        }
                        /**
                         * Verlaufsdaten
                        */
                        var value = parseFloat(valuestring);
                        if (aktbuck.min === null) {
                            aktbuck.min = parseFloat(value);
                        } else if (value < aktbuck.min) {
                            aktbuck.min = parseFloat(value);
                        }
                        if (aktbuck.max === null) {
                            aktbuck.max = parseFloat(value);
                        } else if (value > aktbuck.max) {
                            aktbuck.max = parseFloat(value);
                        }
                        aktbuck.count++;
                        aktbuck.sum += value;
                        aktbuck.avg = aktbuck.sum / aktbuck.count;

                        if (sumbucket.min === null) {
                            sumbucket.min = parseFloat(value);
                        } else if (value < sumbucket.min) {
                            sumbucket.min = parseFloat(value);
                        }
                        if (sumbucket.max === null) {
                            sumbucket.max = parseFloat(value);
                        } else if (value > sumbucket.max) {
                            sumbucket.max = parseFloat(value);
                        }
                        sumbucket.count++;
                        sumbucket.sum += value;
                        sumbucket.avg = aktbuck.sum / aktbuck.count;
                        /**
                         * Histogrammdaten, in actbuck wird hdata fortgeschrieben: x aus value und y
                         * hdata[x] = y;
                        */
                        var xval = Math.round(value);
                        if (typeof aktbuck.hdata[xval] === "undefined") {
                            aktbuck.hdata[xval] = 1;
                        } else {
                            aktbuck.hdata[xval] += 1;
                        }
                    }
                }
            }
        }
        debugger;
        klirow[bucketname].sumbucket = Object.assign({}, sumbucket);
        return true;
    };




    /**
     * kla2100rep.showall - Aufruf aller Funktionen für die Standardauswertung
     * @param {*} ret
     */
    kla2100rep.showall = function (klirow, cball) {
        /**
         * einbahnige Ausgabe nach kla2100repwrapper
         */
        var ret = {};
        hmatrixL = {};
        hoptionsL = {};

        /*
        var w = new Vector([0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2, 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3, 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8]);
        var l = new Vector([1.4, 1.4, 1.3, 1.5, 1.4, 1.7, 1.4, 1.5, 1.4, 1.5, 1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5, 1.7, 1.5, 1.0, 1.7, 1.9, 1.6, 1.6, 1.5, 1.4, 1.6, 1.6, 1.5, 1.5, 1.4, 1.5, 1.2, 1.3, 1.4, 1.3, 1.5, 1.3, 1.3, 1.3, 1.6, 1.9, 1.4, 1.6, 1.4, 1.5, 1.4, 4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.7, 3.3, 4.6, 3.9, 3.5, 4.2, 4.0, 4.7, 3.6, 4.4, 4.5, 4.1, 4.5, 3.9, 4.8, 4.0, 4.9, 4.7, 4.3, 4.4, 4.8, 5.0, 4.5, 3.5, 3.8, 3.7, 3.9, 5.1, 4.5, 4.5, 4.7, 4.4, 4.1, 4.0, 4.4, 4.6, 4.0, 3.3, 4.2, 4.2, 4.2, 4.3, 3.0, 4.1, 6.0, 5.1, 5.9, 5.6, 5.8, 6.6, 4.5, 6.3, 5.8, 6.1, 5.1, 5.3, 5.5, 5.0, 5.1, 5.3, 5.5, 6.7, 6.9, 5.0, 5.7, 4.9, 6.7, 4.9, 5.7, 6.0, 4.8, 4.9, 5.6, 5.8, 6.1, 6.4, 5.6, 5.1, 5.6, 6.1, 5.6, 5.5, 4.8, 5.4, 5.6, 5.1, 5.1, 5.9, 5.7, 5.2, 5.0, 5.2, 5.4, 5.1]);
        var lm = new Regression.linear(l, w);
        console.log(JSON.stringify(lm, null, 4));
        */
        var gldivid;
        async.waterfall([
                function (cb2100g0a) {
                    klirow.titel = klirow.variable + " " + klirow.stationid + " " + klirow.stationname + " (" + klirow.source + ")";

                    if (kla2100repconfig.allin === true) {
                        gldivid = "div" + Math.floor(Math.random() * 100000) + 1;
                        $("#kla2100repwrapper")
                            .append($("<div/>", {
                                    class: "doprintthis",
                                    id: gldivid,
                                    css: {
                                        width: "100%",
                                        float: "left",
                                        "text-align": "left",
                                        overflow: "hidden"
                                    }
                                })
                                .append($("<br/>"))
                                .append($("<span/>", {
                                    html: klirow.stationid + " " + klirow.stationname + " (" + klirow.source + ")",
                                    class: "doprintthis eckh3"
                                }))
                            );
                        // Spezielle Buttons mit Vor-Aufbereitung
                        var gurl = "https://www.google.com/maps/search/?api=1&query=";
                        gurl += klirow.latitude;
                        gurl += ",";
                        gurl += klirow.longitude;

                        var lurl = "klaleaflet.html";
                        lurl += "?";
                        lurl += "latitude=" + encodeURIComponent(klirow.latitude);
                        lurl += "&";
                        lurl += "longitude=" + encodeURIComponent(klirow.longitude);

                        $("#" + gldivid)
                            .append($("<button/>", {
                                html: "Google-Maps",
                                gurl: gurl,
                                css: {
                                    float: "left",
                                    margin: "10px"
                                },
                                click: function (evt) {
                                    evt.preventDefault();
                                    //var gurl = "https://www.google.com/maps/dir/";
                                    var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                                    var newurl = $(this).attr("gurl");
                                    window.open(newurl, wname, 'height=' + screen.height + ', width=' + screen.width);
                                }
                            }))
                            .append($("<button/>", {
                                html: "Leaflet-Raster",
                                lurl: lurl,
                                css: {
                                    float: "left",
                                    margin: "10px"
                                },
                                click: function (evt) {
                                    evt.preventDefault();
                                    var newurl = $(this).attr("lurl");
                                    var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                                    window.open(newurl, wname, 'height=' + screen.height + ', width=' + screen.width);
                                }
                            }));
                    } else {
                        gldivid = "div" + Math.floor(Math.random() * 100000) + 1;
                        $("#kla2100repwrapper")
                            .append($("<div/>", {
                                    class: "doprintthis",
                                    id: gldivid,
                                    css: {
                                        width: "100%",
                                        float: "left",
                                        overflow: "hidden"
                                    }
                                })
                                .append($("<br/>"))
                                .append($("<br/>"))
                                .append($("<span/>", {
                                    html: klirow.stationid + " " + klirow.stationname + " (" + klirow.source + ")",
                                    class: "doprintthis eckh3"
                                }))
                            );
                    }
                    /**
                     * Stammdaten
                     */
                    if (kla2100repconfig.master === false) {
                        cb2100g0a(null, ret);
                        return;
                    }
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    $("#kla2100repwrapper")
                        .append($("<div/>", {
                            id: divid,
                            class: "doprintthis",
                            css: {
                                width: "100%",
                                float: "left",
                                overflow: "hidden"
                            }
                        }));

                    $("#" + divid)
                        .append($("<a/>", {
                                title: "HTML-Ausschnitt",
                                css: {
                                    margin: "10px"
                                },
                                click: function (evt) {
                                    evt.preventDefault();
                                    var cHtml = $(this).parent()[0];
                                    var copyh = "";
                                    copyh += "<html>";
                                    copyh += "<head>";
                                    copyh += "<meta charset='UTF-8'>";
                                    copyh += "</head>";
                                    copyh += "<body ";
                                    copyh += " styles='font-family:Calibri,sans-serif'>";
                                    copyh += $(this).parent().html();
                                    copyh += "</body>";
                                    copyh += "</html>";
                                    uihelper.downloadfile("station.html", copyh, function (ret) {
                                        console.log("Downloaded");
                                    });
                                }
                            })
                            .append($("<span/>", {
                                html: "Stammdaten " + klirow.titel,
                                class: "eckh3"
                            }))
                        );
                    var master = {};
                    master.stationid = klirow.stationid;
                    master.source = klirow.source;
                    master.stationname = klirow.stationname;
                    master.climatezone = klirow.climatezone;
                    master.region = klirow.region;
                    master.subregion = klirow.subregion;
                    master.countryname = klirow.countryname;
                    master.continent = klirow.continent;
                    master.continentname = klirow.continentname;
                    master.lats = klirow.lats;
                    master.longitude = klirow.longitude;
                    master.latitude = klirow.latitude;
                    master.height = klirow.height;
                    ret.master = master;
                    var html = uihelper.iterateJSON2HTML(master, "", "");
                    $("#" + divid)
                        .append($("<div/>", {
                            html: html
                        }));
                    cb2100g0a(null, ret);
                    return;
                },
                function (ret, cb2100g0) {
                    /**
                     * Datenqualität missing/bad data
                     */
                    if (kla2100repconfig.qonly === false) {
                        cb2100g0(null, ret);
                        return;
                    }
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    $("#kla2100repwrapper")
                        .append($("<div/>", {
                            id: divid,
                            class: "doprintthis",
                            css: {
                                width: "100%",
                                float: "left",
                                overflow: "hidden"
                            }
                        }));

                    $("#" + divid)
                        .append($("<a/>", {
                                title: "HTML-Ausschnitt",
                                css: {
                                    margin: "10px"
                                },
                                click: function (evt) {
                                    evt.preventDefault();
                                    var cHtml = $(this).closest("div");
                                    if ($(cHtml).attr("id") !== null) {
                                        cHtml = $(cHtml).attr("id");
                                        uihelper.copyHtml2clipboard(cHtml);
                                    } else {
                                        var newid = "I" + Math.floor(Math.random() * 100000) + 1;
                                        $(cHtml).attr("id", newid);
                                        uihelper.copyHtml2clipboard(newid);
                                    }
                                }
                            })
                            .append($("<span/>", {
                                html: "Datenqualität, Jahresdaten " + klirow.titel,
                                class: "eckh3"
                            }))
                        );
                    /**
                     * Prüfung der Datenqualität je Jahr in klirow.years
                     */
                    var klirecord = klirow;
                    var years;
                    if (typeof klirow.years === "string") {
                        years = JSON.parse(klirow.years);
                    } else {
                        years = klirow.years;
                    }
                    var rawyears = Object.keys(years);
                    var yearcontrol = [];
                    var firstyear = null;
                    var lastyear = null;
                    for (var iyear = 0; iyear < rawyears.length; iyear++) {
                        yearcontrol.push(parseInt(rawyears[iyear]));
                    }
                    yearcontrol.sort(function (a, b) {
                        if (a < b)
                            return -1;
                        if (a > b)
                            return 1;
                        return 0;
                    });
                    var imissing = 0;
                    var ibad = 0;
                    var badyears = [];
                    var missingyears = [];
                    for (var iyear = 1; iyear < yearcontrol.length; iyear++) {
                        var ydiff = yearcontrol[iyear] + yearcontrol[iyear - 1];
                        if (ydiff !== 1) {
                            for (var imiss = yearcontrol[iyear - 1] + 1; imiss < yearcontrol[iyear] - 1; imiss++) {
                                missingyears.push(imiss);
                            }
                        }
                    }
                    for (var iyear = 1; iyear < yearcontrol.length; iyear++) {
                        var ayear = "" + yearcontrol[iyear];
                        var testyear = years[ayear];
                        if (uihelper.isqualityyear(testyear) === false) {
                            badyears.push(ayear);
                        }
                    }
                    console.log("Missing:" + JSON.stringify(missingyears));
                    console.log("Bad:" + JSON.stringify(badyears));

                    var rep1 = "Variable:<b>" + klirecord.variable + "</b>";
                    rep1 += "<br>";
                    rep1 += "Missing years:" + missingyears.join(", ");
                    rep1 += "<br>";
                    rep1 += "Bad data in years:" + badyears.join(", ");
                    var fdir = "left";

                    $("#" + divid)
                        .append($("<div/>", {
                            html: rep1,
                            css: {
                                float: fdir,
                                width: "49%"
                            }
                        }));

                    cb2100g0(null, ret);
                    return;
                },


                function (ret, cb2100g7) {
                    /**
                     * Verlauf Graphik und Tabelle
                     */
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    if (kla2100repconfig.tempchart === false) {
                        cb2100g7(null, ret);
                        return;
                    }
                    $("#kla2100repwrapper")
                        .append($("<div/>", {
                                css: {
                                    width: "100%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            })
                            .append($("<div/>", {
                                id: divid + "L",
                                css: {
                                    "text-align": "left",
                                    float: "left",
                                    width: "95%"
                                }
                            }))
                        );

                    var hmoptions = {
                        minmax: true,
                        minmaxhistogram: true,
                        cbuckets: true,
                        hyde: true
                    };
                    hoptionsL.minmaxhistogram = true;
                    kla2100rep.klitemp2("#" + divid + "L", klirow, function (ret) {
                        cb2100g7(null, ret);
                        return;
                    });
                },




                function (ret27, cb2100g1) {
                    /**
                     * Heatmap-1
                     */
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    if (kla2100repconfig.heatmaps === true || kla2100repconfig.heatmapsx === true) {
                        $("#kla2100repwrapper")
                            .append($("<div/>", {
                                    css: {
                                        width: "100%",
                                        float: "left",
                                        overflow: "hidden"
                                    }
                                })
                                .append($("<div/>", {
                                        css: {
                                            width: "100%",
                                            "text-align": "center"
                                        }
                                    })
                                    .append($("<h2>", {
                                        text: "Heatmaps " + klirow.titel
                                    }))
                                )
                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            float: "left",
                                            width: "49%"
                                        }
                                    })
                                    .append($("<div/>", {
                                        id: divid + "L",
                                    }))
                                )
                            );
                    }
                    // Linke heatmap
                    var hmoptions = {
                        minmax: false,
                        minmaxhistogram: false,
                        cbuckets: false,
                        hyde: true
                    };
                    kla2100rep.kliheatmap2("#" + divid + "L", klirow, selvariablename, selsource, selstationid, starecord, hmoptions, function (ret) {
                        ret.divid = divid;
                        if (kla2100repconfig.heatmaps === true) {
                            var nkorr = $("#" + divid + "L").find("canvas").height();
                            $("#" + divid + "L").css({
                                "max-height": nkorr + 10,
                                height: nkorr + 10,
                                overflow: "hidden"
                            });
                        }
                        cb2100g1(null, ret);
                        return;
                    });
                },

                function (ret, cb2100g3) {
                    /**
                     * Heatmap-3
                     */
                    if (kla2100repconfig.heatmaps === true) {
                        var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                        $("#kla2100repwrapper")
                            .append($("<div/>", {
                                    css: {
                                        width: "100%",
                                        float: "left",
                                        overflow: "hidden"
                                    }
                                })
                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            float: "left",
                                            width: "49%"
                                        }
                                    })
                                    .append($("<div/>", {
                                        id: divid + "L",
                                    }))
                                )

                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            float: "left",
                                            width: "49%"
                                        }
                                    })
                                    .append($("<div/>", {
                                        id: divid + "R",
                                    }))
                                ));
                        // Linke heatmap
                        var hmoptions = {
                            minmax: true,
                            minmaxhistogram: true,
                            cbuckets: true,
                            hyde: true
                        };
                        kla2100rep.kliheatmap2("#" + divid + "L", klirow, selvariablename, selsource, selstationid, starecord, hmoptions, function (ret) {
                            ret.divid = divid;
                            if (kla2100repconfig.heatmaps === true) {
                                var nkorr = $("#" + divid + "L").find("canvas").height();
                                $("#" + divid + "L").css({
                                    "max-height": nkorr + 10,
                                    height: nkorr + 10,
                                    overflow: "hidden"
                                });
                            }
                            hmatrixL = ret.matrix;
                            hoptionsL = ret.options;
                            cb2100g3(null, ret);
                            return;
                        });
                    } else {
                        cb2100g3(null, ret);
                        return;
                    }
                },

                function (ret, cb2100g5a) {
                    /**
                     * Heat-Distribution mit ChartJS WLVL
                     */
                    if (kla2100repconfig.tempdistribution === false) {
                        cb2100g5a(null, ret);
                        return;
                    }
                    /**
                     * Berechnen aller Werte für die Histogramm-Ausgabeoptimierung
                     */
                    kla2100rep.getHBuckets(klirow, "HISTOGRAMM", klirow.fromyear, 30, "fromto", "config");
                    var distrs = {};
                    var maxy = 0;
                    // distrs[selvariablename] = kla2100rep.klidistr2calc(selvariablename, selsource, selstationid, ret);

                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    $("#kla2100repwrapper")
                        .append($("<div/>", {
                                css: {
                                    width: "100%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            })
                            .append($("<div/>", {
                                id: divid + "L",
                                css: {
                                    width: "49%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            }))
                            .append($("<div/>", {
                                id: divid + "R",
                                css: {
                                    width: "49%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            }))

                        );
                    ret.distrs = distrs;
                    kla2100rep.klidistr2("#" + divid + "L", klirow, selvariablename, selsource, selstationid, ret, function (ret1) {
                        ret.divid = divid;
                        ret.distrs = distrs;
                        cb2100g5a(null, ret);
                        return;
                    });
                },


                function (ret, cb2100g5) {
                    /**
                     * Tabelle mit Histogrammen - links
                     */
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    // hier wird eine Struktur links und rechts bereitgestellt, noch ohne Inhalt
                    $("#kla2100repwrapper")
                        .append($("<div/>", {
                                css: {
                                    width: "100%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            })
                            .append($("<div/>", {
                                    css: {
                                        "text-align": "center",
                                        float: "left",
                                        width: "49%"
                                    }
                                })
                                .append($("<div/>", {
                                    id: divid + "L",
                                }))
                            )
                        );

                    var hmoptions = {
                        minmax: true,
                        minmaxhistogram: true,
                        cbuckets: true,
                        hyde: true
                    };
                    hoptionsL.minmaxhistogram = true;
                    kla2100rep.klihisto2("#" + divid + "L", klirow, selvariablename, selsource, selstationid, starecord, hmatrixL, hoptionsL, function (ret) {
                        ret.divid = divid;
                        cb2100g5(null, ret);
                        return;
                    });
                },


                function (ret, cb2100g9) {
                    if (kla2100repconfig.hyde === false) {
                        cb2100g9("Finish", ret);
                        return;
                    }
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    $("#kla2100repwrapper")
                        .append($("<div/>", {
                            id: divid,
                            css: {
                                width: "100%",
                                float: "left",
                                overflow: "hidden"
                            }
                        }));
                    var hmoptions = {};
                    kla2100rep.klihyde2("#" + divid, selstationid, starecord, function (ret) {
                        cb2100g9("Finish", ret);
                        return;
                    });
                }
            ],
            function (error, result) {
                $(".tablesorter").tablesorter({
                    theme: "blue",
                    widgets: ['filter'],
                    widthFixed: true,
                    widgetOptions: {
                        filter_hideFilters: false,
                        filter_ignoreCase: true
                    }
                }); // so funktioniert es
                $("#kla2100repwrapper")
                    .append($("<div/>", {
                            css: {
                                width: "100%",
                                float: "left",
                                overflow: "hidden"
                            }
                        })
                        .append($("<br/>"))
                        .append($("<br/>"))
                        .append($("<br/>"))
                        .append($("<br/>"))
                    );
                // finaler Callback, wenn vorgegeben
                if (typeof cball !== "undefined") {
                    cball(result);
                    return;
                }

            });
    };


    /**
     * kliheatmap2 - Heatmap berechnen und anzeigen
     * @param {*} cid
     * @param {*} selvariablename
     * @param {*} selsource
     * @param {*} selstationid
     * @param {*} starecord
     * @param {*} hmoptions
     *            minmax: true, - Wasserstandskala auf echte Min und Max der Werte beziehen, nicht auf die Standardskale
     *            minmaxhistogram: true - Ausgabe Sparkline über dem Historgramm => histo1
     *            scale: 7 oder 5 - Anzahl der Grundfarben für die Heatmap
     *              minval, maxval, sumval, countval werden berechnet und mit übergeben
     * @param {*} callbackh0
     */
    kla2100rep.kliheatmap2 = function (cid, klirow, selvariablename, selsource, selstationid, starecord, hmoptions, callbackh0) {

        async.waterfall([
                function (callbackshm2) {
                    var ret = {};
                    if (typeof hmoptions === "object" && Object.keys(hmoptions).length >= 1) {
                        hmoptions.minmax = hmoptions.minmax || false;
                        hmoptions.scale = 7; // Farb-Buckets
                        hmoptions.minval = null;
                        hmoptions.maxval = null;
                        hmoptions.sumval = 0.0;
                        hmoptions.countval = 0;
                    } else {
                        hmoptions = {};
                        hmoptions.minmax = false;
                        hmoptions.scale = 7; // Farb-Buckets
                        hmoptions.minval = null;
                        hmoptions.maxval = null;
                        hmoptions.sumval = 0.0;
                        hmoptions.countval = 0;
                    }
                    var colwidth;
                    var rowheight;
                    var wratio;
                    var hratio;
                    var hmvalstr;
                    try {
                        var years;
                        if (typeof klirow.years === "string") {
                            years = JSON.parse(klirow.years);
                        } else {
                            years = klirow.years;
                        }
                        var dayyears = years; // ret.record[selvariablename].years;

                        var mtitle = "";
                        mtitle += (klirow.variable || "").length > 0 ? " " + klirow.variable : "";
                        mtitle += " " + selstationid;
                        mtitle += (klirow.stationname || "").length > 0 ? " " + klirow.stationname : "";
                        mtitle += (klirow.fromyear || "").length > 0 ? " von " + klirow.fromyear : "";
                        mtitle += (klirow.toyear || "").length > 0 ? " bis " + klirow.toyear : "";
                        klirow.fromyear = kla2100repconfig.fromyear;
                        klirow.toyear = kla2100repconfig.toyear;
                        mtitle += (klirow.fromyear || "").length > 0 ? " Filter von " + klirow.fromyear : "";
                        mtitle += (klirow.toyear || "").length > 0 ? " bis " + klirow.toyear : "";
                        // Aufruf Heatmap mit Container und Matrix
                        matrix1 = {
                            title: mtitle,
                            fromyear: klirow.fromyear,
                            toyear: klirow.toyear,
                            colheaders: [],
                            rowheaders: [],
                            data: []
                        };

                        var irow = 0;
                        hmoptions.cbucketdata = {}; // year mit: toyear, histo, yearmin, yearmax, yearsum, yearcount
                        var numberhisto = new Array(10).fill(0);
                        for (var year in years) {
                            if (years.hasOwnProperty(year)) {
                                if (parseInt(year) < kla2100repconfig.fromyear || parseInt(year) > kla2100repconfig.toyear) {
                                    continue;
                                }
                                matrix1.rowheaders.push(year);
                                var rowvalues = years[year];
                                matrix1.data[irow] = [];
                                for (var icol = 0; icol < 365; icol++) {
                                    if (typeof rowvalues[icol] === "undefined") {
                                        matrix1.data[irow][icol] = null;
                                    } else if (rowvalues[icol] === null || rowvalues[icol] === "" || rowvalues[icol].trim().length === 0) {
                                        matrix1.data[irow][icol] = null;
                                    } else if (rowvalues[icol] === "-9999" || rowvalues[icol] === "-999.9") {
                                        matrix1.data[irow][icol] = null;
                                    } else {
                                        matrix1.data[irow][icol] = rowvalues[icol];
                                        if (hmoptions.minmax === true) {
                                            var hmval = parseFloat(rowvalues[icol]);
                                            if (!isNaN(hmval)) {
                                                hmoptions.sumval += hmval;
                                                if (isNaN(hmoptions.sumval)) {
                                                    console.log("*****" + hmval);
                                                    debugger;
                                                }
                                                hmoptions.countval += 1;
                                                if (hmoptions.minval === null) {
                                                    hmoptions.minval = hmval;
                                                } else if (hmoptions.minval > hmval) {
                                                    hmoptions.minval = hmval;
                                                }
                                                if (hmoptions.maxval === null) {
                                                    hmoptions.maxval = hmval;
                                                } else if (hmoptions.maxval < hmval) {
                                                    hmoptions.maxval = hmval;
                                                }
                                                if (hmoptions.minmaxhistogram === true) {
                                                    hmvalstr = "" + Math.round(parseFloat(rowvalues[icol]));
                                                    if (typeof histo1[hmvalstr] === "undefined") {
                                                        histo1[hmvalstr] = 0;
                                                    }
                                                    histo1[hmvalstr] += 1;
                                                }
                                                if (hmoptions.cbuckets === true) {
                                                    //    hmoptions.cbucketdata = {};  // year mit: toyear, histo, minval, maxval, valsum, valcount
                                                    // berechnen buckyear für das Klimabucket
                                                    // 1961 bis 1990 als Referenzperiode; 1961 = 30*
                                                    var buck0 = parseInt(year);
                                                    var buck1 = buck0 - 1661; // 65 * 30 = 1950 Rest 11
                                                    // oder 1661 als Basisjahr und damit rechnen
                                                    var steps = parseInt(kla2100repconfig.step || 30);
                                                    var buck2 = Math.floor(buck1 / steps);
                                                    var buck3 = 1661 + (buck2) * steps;
                                                    var buckyear = "" + buck3;
                                                    if (typeof hmoptions.cbucketdata[buckyear] === "undefined") {
                                                        hmoptions.cbucketdata[buckyear] = {
                                                            toyear: buck3 + steps - 1,
                                                            histo: [],
                                                            minval: null,
                                                            maxval: null,
                                                            valsum: 0,
                                                            valcount: 0,
                                                            numberhisto: []
                                                        };
                                                        hmoptions.cbucketdata[buckyear].numberhisto = new Array(10).fill(0);
                                                    }
                                                    var wert = rowvalues[icol];
                                                    var inum = 0;
                                                    var numt = wert.split(".");
                                                    if (numt.length === 2) {
                                                        inum = parseInt(numt[1].slice(-1));
                                                    }
                                                    hmoptions.cbucketdata[buckyear].numberhisto[inum] += 1;
                                                    hmoptions.cbucketdata[buckyear].valsum += hmval;
                                                    hmoptions.cbucketdata[buckyear].valcount += 1;
                                                    if (hmoptions.cbucketdata[buckyear].minval === null) {
                                                        hmoptions.cbucketdata[buckyear].minval = hmval;
                                                    } else if (hmoptions.cbucketdata[buckyear].minval > hmval) {
                                                        hmoptions.cbucketdata[buckyear].minval = hmval;
                                                    }
                                                    if (hmoptions.cbucketdata[buckyear].maxval === null) {
                                                        hmoptions.cbucketdata[buckyear].maxval = hmval;
                                                    } else if (hmoptions.cbucketdata[buckyear].maxval < hmval) {
                                                        hmoptions.cbucketdata[buckyear].maxval = hmval;
                                                    }
                                                    if (typeof hmoptions.cbucketdata[buckyear].histo[hmvalstr] === "undefined") {
                                                        hmoptions.cbucketdata[buckyear].histo[hmvalstr] = 0;
                                                    }
                                                    hmoptions.cbucketdata[buckyear].histo[hmvalstr] += 1;
                                                }
                                            } else {
                                                matrix1.data[irow][icol] = null;
                                                console.log("Kein formal korrekter " + varparms[selvariablename].header + ":" + rowvalues[icol]);
                                                debugger;
                                            }
                                        }
                                    }
                                }
                                irow++;
                            }
                        }

                        // hier ist das Layout nochmal zu kontrollieren
                        hmoptions.histo = histo1;
                        if (kla2100repconfig.heatmaps === true && matrix1.data.length > 0) {
                            var erg = kla9020fun.getHeatmap(cid, kla2100repconfig.heatmapsx, matrix1, hmoptions, function (ret) {
                                sysbase.putMessage("Heatmap ausgegeben", 1);
                                callbackshm2(null, {
                                    error: false,
                                    message: "Heatmap ausgegeben",
                                    matrix: matrix1,
                                    options: uihelper.cloneObject(hmoptions),
                                    hoptions: ret.hoptions,
                                    hcwrapperid: ret.hcwrapperid,
                                    histo: hmoptions.histo,
                                    temparray: ret.temparray
                                });
                                return;
                            });
                        } else {
                            callbackshm2(null, {
                                error: false,
                                message: "Heatmap nicht ausgegeben",
                                matrix: matrix1,
                                options: uihelper.cloneObject(hmoptions),
                                hoptions: ret.hoptions,
                                hcwrapperid: ret.hcwrapperid,
                                histo: hmoptions.histo,
                                temparray: ret.temparray
                            });
                            return;
                        }
                    } catch (err) {
                        sysbase.putMessage("Error:" + err, 3);
                        console.log(err);
                        console.log(err.stack);
                        callbackshm2("Error", {
                            error: true,
                            message: "Heatmap ausgegeben:" + err
                        });
                        return;
                    }
                },
                function (ret, callbackshm4) {
                    // hier muss die matrix1-Struktur übergeben werden
                    // kla2100rep.paintT(selvariablename, selsource, selstationid, ret.matrix);
                    callbackshm4("Finish", ret);
                    return;
                }
            ],
            function (error, ret) {
                callbackh0(ret);
                return;
            });
    };


    kla2100rep.klihisto2 = function (cid, klirow, selvariable, selsource, selstationid, starecord, hmatrix, hoptions, cb2100h) {
        var ret = {
            error: false,
            message: ""
        };

        //$(cid).addClass("doprintthis");
        /**
         * Histogramm ausgeben, wenn übergeben
         */
        var temparray = [];
        if (hoptions.minmax === true && typeof hoptions.histo === "object" && Object.keys(hoptions.histo).length > 0) {
            temparray = [];
            // Ergänzen der Wasserstand ohne count
            for (var ival = -50; ival <= 50; ival++) {
                var valstr = "" + ival;
                if (typeof hoptions.histo[valstr] === "undefined") {
                    hoptions.histo[valstr] = 0;
                }
            }
            var tempvals = Object.keys(hoptions.histo);
            var mincount = null;
            var maxcount = null;
            for (var i = 0; i < tempvals.length; i++) {
                var count = hoptions.histo[tempvals[i]];
                if (mincount === null) {
                    mincount = count;
                } else if (count < mincount) {
                    mincount = count;
                }
                if (maxcount === null) {
                    maxcount = count;
                } else if (count > maxcount) {
                    maxcount = count;
                }
                temparray.push({
                    temp: tempvals[i],
                    count: count
                });
            }
            temparray.sort(function (a, b) {
                if (parseInt(a.temp) < parseInt(b.temp))
                    return -1;
                if (parseInt(a.temp) > parseInt(b.temp))
                    return 1;
                return 0;
            });
            var sparkpoints = [];
            var xvalues = [];
            for (var i = 0; i < temparray.length; i++) {
                //sparkpoints.push(temparray[i].count);
                //xvalues.push(temparray[i].temp);
                sparkpoints.push([temparray[i].temp, temparray[i].count]);

            }
            var tableid;
            var bigchart = {};
            if (hoptions.cbuckets === true && typeof hoptions.cbucketdata === "object" && Object.keys(hoptions.cbucketdata).length > 0) {
                tableid = "tbl" + Math.floor(Math.random() * 100000) + 1;

                if (kla2100repconfig.temptable === true) {
                    $(cid)
                        .append($("<span/>", {
                                text: "Histogramm " + varparms[selvariablename].header + "-Verteilung " + selvariable + " " + klirow.titel,
                                class: "doprintthis eckh3"
                            })
                            .append($("<span/>", {
                                text: "x-Range",
                                css: {
                                    margin: "5px"
                                }
                            }))
                            .append($("<input/>", {
                                type: "checkbox",
                                css: {
                                    margin: "5px"
                                },
                                click: function (evt) {
                                    // neuer Status der Checkbox
                                    var state = $(this).prop("checked");
                                    alert(state);
                                }
                            }))
                        )
                        .append($("<table/>", {
                                id: tableid,
                                border: "2",
                                rules: "all",
                                class: "doprintthis tablesorter",
                                css: {
                                    float: "left",
                                    margin: "10px",
                                    width: "95%",
                                    layout: "fixed",
                                    "background-color": "white"
                                }
                            })
                            .append($("<thead/>")
                                .append($("<tr/>")
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Periode"
                                    }))
                                    .append($("<th/>", {
                                        width: "40%",
                                        html: "Histogramm"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Min"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Max"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Avg"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Kurtosis<br>Skewness"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Shapiro Wilk W/P"
                                    }))
                                )
                            )
                            .append($("<tbody/>"))
                        );
                }
                /**
                 * hier wird die Gesamtzeile eingeschoben und ausgegeben
                 * für split stehen bereit selvariable, selsource, selstationid, starecord,
                 * klirecords.push(ret1.records[0]);
                 * stationrecord = ret1.records[0];
                 * sowie hmatrix.fromyear + "-" + hmatrix.toyear
                 */
                var sparkid = "spark" + Math.floor(Math.random() * 100000) + 1;
                if (kla2100repconfig.temptable === true) {
                    $("#" + tableid + " tbody")
                        .append($("<tr/>")
                            .append($("<td/>", {
                                html: hmatrix.fromyear + "-" + hmatrix.toyear
                            }))
                            .append($("<td/>")
                                .append($("<span/>", {
                                    id: sparkid,
                                    css: {
                                        width: "100%",
                                        float: "left"
                                    }
                                }))
                            )
                            .append($("<td/>", {
                                align: "center",
                                html: hoptions.minval
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: hoptions.maxval
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: (hoptions.sumval / hoptions.countval).toFixed(2)
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: "&nbsp;"
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: "&nbsp;<br>&nbsp;<br>&nbsp;<br>"
                            }))
                        );
                    $("#" + sparkid).sparkline(sparkpoints, {
                        type: 'line',
                        height: 60,
                        fillColor: "red",
                        defaultPixelsPerValue: 3,
                        /* chartRangeMin: mincount,
                        chartRangeMax: maxcount, */
                        lineColor: "red",
                        composite: false
                    });
                }
            }

            /**
             * Loop über die Klimaperioden
             */
            var bucknumberprot = "";
            var buckyears = Object.keys(hoptions.cbucketdata);
            for (var ibuck = 0; ibuck < buckyears.length; ibuck++) {
                bucknumberprot += " " + JSON.stringify(hoptions.cbucketdata[buckyears[ibuck]].numberhisto);
                temparray = [];
                var bucket = hoptions.cbucketdata[buckyears[ibuck]];
                // Ergänzen der Wasserstand ohne count
                for (var ival = -50; ival <= 50; ival++) {
                    var valstr = "" + ival;
                    if (typeof bucket.histo[valstr] === "undefined") {
                        bucket.histo[valstr] = 0;
                    }
                }
                var tempvals = Object.keys(bucket.histo);
                var mincount = null;
                var maxcount = null;
                for (var i = 0; i < tempvals.length; i++) {
                    var count = bucket.histo[tempvals[i]];
                    if (mincount === null) {
                        mincount = count;
                    } else if (count < mincount) {
                        mincount = count;
                    }
                    if (maxcount === null) {
                        maxcount = count;
                    } else if (count > maxcount) {
                        maxcount = count;
                    }
                    temparray.push({
                        temp: tempvals[i],
                        count: count
                    });
                }
                temparray.sort(function (a, b) {
                    if (parseInt(a.temp) < parseInt(b.temp))
                        return -1;
                    if (parseInt(a.temp) > parseInt(b.temp))
                        return 1;
                    return 0;
                });
                var sparkpoints = [];
                for (var i = 0; i < temparray.length; i++) {
                    sparkpoints.push(temparray[i].count);
                }
                // Kennziffern
                var kur = ss.sampleKurtosis(sparkpoints);
                var skew = ss.sampleSkewness(sparkpoints);
                var calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2);
                calc1 += "<br>" + (kur - skew ** 2).toFixed(2);
                /*
                calc1 += "<br>" + ss.standardDeviation(sparkpoints).toFixed(2);
                calc1 += "<br>" + ss.sampleStandardDeviation(sparkpoints).toFixed(2);
                calc1 += "<br>" + ss.medianAbsoluteDeviation(sparkpoints).toFixed(2);
                */
                var w = new Vector(sparkpoints);
                var wperg = new Normality.shapiroWilk(w);
                var calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);
                //var lm = new Regression.linear(l, w);


                // Ausgabe
                var sparkid = "spark" + Math.floor(Math.random() * 100000) + 1;

                if (kla2100repconfig.temptable === true) {
                    $("#" + tableid + " tbody")
                        .append($("<tr/>", {
                                class: "kla2100repsplit",
                                fromyear: buckyears[ibuck],
                                toyear: bucket.toyear,
                                selvariable: selvariable,
                                selsource: selsource,
                                selstationid: selstationid
                            })
                            .append($("<td/>", {
                                html: buckyears[ibuck] + "-" + bucket.toyear
                            }))
                            .append($("<td/>")
                                .append($("<span/>", {
                                    id: sparkid,
                                    class: "mouseoverdemo",
                                    css: {
                                        width: "100%",
                                        float: "left"
                                    }
                                }))
                            )
                            .append($("<td/>", {
                                align: "center",
                                html: bucket.minval
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: bucket.maxval
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: (bucket.valsum / bucket.valcount).toFixed(2)
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: calc1
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: calc2
                            }))
                        );
                    $("#" + sparkid).sparkline(sparkpoints, {
                        type: 'bar',
                        height: 60,
                        barColor: "red",
                        negBarColor: "blue",
                        barWidth: 3,
                        barSpacing: 0,
                        fillColor: false,
                        /* chartRangeMin: mincount,
                        chartRangeMax: maxcount, */
                        defaultPixelsPerValue: 3
                    });
                }
            }

            /*
            $("#" + tableid).parent().append($("<span/>", {
                html: bucknumberprot
            }));
            */
            if (kla2100repconfig.decimals === true) {
                var divid = "div" + Math.floor(Math.random() * 100000) + 1;
                var chartid = divid + "c";
                /* die tableid hat links oder rechts unterschieden, das muss bei cid nicht so sein?
                $("#" + tableid)
                    .parent()
                */
                $(cid)
                    .append($("<div/>", {
                            id: divid,
                            css: {
                                float: "left",
                                overflow: "hidden",
                                "background-color": "white",
                                margin: "10px",
                                width: "90%"
                            }
                        })
                        .append($("<h3/>", {
                            text: "Histogramm 1. Dezimalstelle " + selvariable + " " + klirow.titel,
                            class: "doprintthis"
                        }))
                        .append($("<canvas/>", {
                            id: chartid,
                            class: "doprintthis",
                            selvariable: selvariable,
                            css: {
                                "text-align": "center"
                            }
                        }))
                    );

                var ctx = document.getElementById(chartid).getContext('2d');
                //Chart.defaults.global.plugins.colorschemes.override = true;
                //Chart.defaults.global.legend.display = true;
                // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
                var yAxesticks = [];
                var newArr;
                var config = {
                    type: 'line',
                    data: {
                        labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                        datasets: [],
                        backgroundColor: "yellow"
                    },
                    options: {
                        layout: {
                            padding: {
                                left: 10,
                                right: 50,
                                top: 10,
                                bottom: 10
                            }
                        },
                        plugins: {
                            colorschemes: {
                                scheme: 'brewer.Paired12'
                            }
                        },
                        chartid: chartid,
                        /* selvariable, */
                        onClick: function (mouseEvent, chart) {
                            var mytype = this.options.chartid;
                            var myChart = window.charts[chartid];
                            var firstPoint = myChart.getElementAtEvent(mouseEvent)[0];
                            if (firstPoint) {
                                var fpIndex = firstPoint._index;
                                var fpDataIndex = firstPoint._datasetIndex;
                                var xlabel = myChart.data.labels[firstPoint._index];
                                var ylabel = myChart.data.datasets[firstPoint._datasetIndex].label;
                                var value = myChart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
                                var syears = ylabel.split("-");
                                /**
                                 * echte Werte später
                                 */
                                window.parent.sysbase.setCache("regstation", JSON.stringify({
                                    starecord: starecord,
                                    klirecords: klirecords,
                                    fromyear: syears[0],
                                    toyear: syears[1]
                                }));
                                var tourl = "klaheatmap.html" + "?" + "stationid=" + klirow.stationid + "&source=" + klirow.source + "&variablename=" + klirow.variable;
                                var tabname = klirow.stationname;
                                var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1627dec", tourl);
                                window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
                            }
                            console.log(ylabel + ":" + value);
                        }

                    }
                };
                for (var ibuck = 0; ibuck < buckyears.length; ibuck++) {
                    bucknumberprot += " " + JSON.stringify(hoptions.cbucketdata[buckyears[ibuck]].numberhisto);
                    config.data.datasets.push({
                        label: buckyears[ibuck] + "-" + hoptions.cbucketdata[buckyears[ibuck]].toyear,
                        data: hoptions.cbucketdata[buckyears[ibuck]].numberhisto,
                        /* backgroundColor: "red", */
                        /* borderColor: "red", */
                        fill: false,
                        borderWidth: 2
                    });
                }
                //myCharts[selvariable] = new Chart(ctx, config);
                window.charts = window.charts || {};
                window.charts[chartid] = new Chart(ctx, config);
                /*
                $('#' + chartid).click(function (e) {
                    var activePoints = myChart.getElementsAtEvent(event);
                    var activeDataSet = myChart.getDatasetAtEvent(event);

                    if (activePoints.length > 0) {
                        var clickedDatasetIndex = activeDataSet[0]._datasetIndex;
                        var clickedElementIndex = activePoints[0]._index;
                        var value = myChart.data.datasets[clickedDatasetIndex].data[clickedElementIndex];
                    }
                    // todo: add code to do something with value.
                });
                */
            }
            cb2100h(ret);
            return;
        } else {
            cb2100h(ret);
            return;
        }
    };


    /**
     * kla2100repsplit - Splitten Sommer/Winter Histogramm
     * in neue Zeilen der Zieltabelle
     * starecord hat source, stationid
     * klirow oder [1] mit variable
     */
    $(document).on("click", ".kla2100repsplit", function (evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        var splstationid = $(this).closest("tr").attr("selstationid");
        var splsource = $(this).closest("tr").attr("selsource");
        var splvariable = $(this).closest("tr").attr("selvariable");
        var splfromyear = $(this).closest("tr").attr("fromyear");
        var spltoyear = $(this).closest("tr").attr("toyear");

        var oldsparkid = $(this).closest("tr").find("span").attr("id");
        // from - to Logik mit den years
        //var years = JSON.parse(ret.record.years);
        var splrecord = klirow; // TODO: Der Satz muss geholt werden/gesucht werden in klirecords[i] global
        var sun = {
            numberhisto: [],
            valsum: 0,
            valcount: 0,
            minval: null,
            maxval: null,
            maxcount: 0
        };
        var win = {
            numberhisto: [],
            valsum: 0,
            valcount: 0,
            minval: null,
            maxval: null,
            maxcount: 0
        };
        var years = JSON.parse(splrecord.years);
        var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        sun.temphisto = new Array(101).fill(0);
        win.temphisto = new Array(101).fill(0);
        for (var iyear = parseInt(splfromyear); iyear <= parseInt(spltoyear); iyear++) {
            if (typeof years[iyear] !== "undefined") {
                if (uihelper.isleapyear(iyear)) {
                    mdtable[1] = 29;
                } else {
                    mdtable[1] = 28;
                }
                var splfromday = 0;
                var spltoday = 0;
                var yearvals = years["" + iyear];
                /**
                 * Loop über die 12 Monate
                 * je Monat Zuweisung des "richtigen" Objekts sun oder win als work
                 */
                var wrk = {};
                for (var imon = 0; imon < 12; imon++) {
                    if (imon >= 0 && imon <= 2 || imon >= 9 && imon <= 11) {
                        wrk = win;
                    } else {
                        wrk = sun;
                    }
                    spltoday = splfromday + mdtable[imon];

                    for (var iday = splfromday; iday < spltoday; iday++) {
                        var dval1 = yearvals[iday];
                        if (dval1 !== null && dval1 !== -9999 && !isNaN(dval1)) {
                            var dval = parseFloat(dval1);
                            var inum = 0;
                            var numt = dval1.split(".");
                            if (numt.length === 2) {
                                inum = parseInt(numt[1].substr(0, 1));
                            }
                            wrk.valsum += dval;
                            wrk.valcount += 1;
                            if (wrk.minval === null) {
                                wrk.minval = dval;
                            } else if (dval < wrk.minval) {
                                wrk.minval = dval;
                            }
                            if (wrk.maxval === null) {
                                wrk.maxval = dval;
                            } else if (dval > wrk.maxval) {
                                wrk.maxval = dval;
                            }
                            var itemp = Math.round(dval);
                            itemp += 50;
                            if (itemp >= 0 && itemp <= 100) {
                                wrk.temphisto[itemp] += 1;
                            } else if (itemp < 0) {
                                wrk.temphisto[0] += 1;
                            } else {
                                wrk.temphisto[100] += 1;
                            }
                        }
                    }
                    splfromday = splfromday + mdtable[imon];
                }
            }
        }
        // Kennziffern Kurtosis, Skewness, Shapiro Wilk-Test mit P und W-Wert
        var kur = ss.sampleKurtosis(sun.temphisto);
        var skew = ss.sampleSkewness(sun.temphisto);
        sun.calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2) + "<br>" + (kur - skew ** 2).toFixed(2);
        var w = new Vector(sun.temphisto);
        var wperg = new Normality.shapiroWilk(w);
        sun.calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);

        var kur = ss.sampleKurtosis(win.temphisto);
        var skew = ss.sampleSkewness(win.temphisto);
        win.calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2) + "<br>" + (kur - skew ** 2).toFixed(2);
        var w = new Vector(win.temphisto);
        var wperg = new Normality.shapiroWilk(w);
        win.calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);


        // Ausgabe der Zeile mit den Sommerwerten
        var baserow = $(this).closest("tr");
        var sparkid = "S" + Math.floor(Math.random() * 100000) + 1;
        $(baserow)
            .after($("<tr/>", {
                    id: sparkid + "s"
                })
                .append($("<td/>", {
                    html: splfromyear + "-" + spltoyear + " 04-09 sun"
                }))
                .append($("<td/>")
                    .append($("<span/>", {
                        id: sparkid,
                        class: "mouseoverdemo",
                        css: {
                            width: "100%",
                            float: "left"
                        }
                    }))
                )
                .append($("<td/>", {
                    align: "center",
                    html: sun.minval
                }))
                .append($("<td/>", {
                    align: "center",
                    html: sun.maxval
                }))
                .append($("<td/>", {
                    align: "center",
                    html: (sun.valsum / sun.valcount).toFixed(2)
                }))
                .append($("<td/>", {
                    align: "center",
                    html: sun.calc1
                }))
                .append($("<td/>", {
                    align: "center",
                    html: sun.calc2
                }))
            );
        $("#" + sparkid).sparkline(sun.temphisto, {
            type: 'bar',
            height: 60,
            barColor: "red",
            negBarColor: "blue",
            barWidth: 3,
            barSpacing: 0,
            fillColor: false,
            defaultPixelsPerValue: 3,
            chartRangeMin: 0,
            chartRangeMax: Math.max(sun.temphisto),
            composite: false
        });

        // auf oldsparkid
        $("#" + oldsparkid).sparkline(sun.temphisto, {
            type: 'line',
            defaultPixelsPerValue: 3,
            lineColor: "black",
            fillColor: false,
            composite: true
        });

        var sparkid1 = "S" + Math.floor(Math.random() * 100000) + 1;
        $("#" + sparkid + "s")
            .after($("<tr/>", {
                    id: sparkid + "w"
                })
                .append($("<td/>", {
                    html: splfromyear + "-" + spltoyear + " 01-03, 10-12 win"
                }))
                .append($("<td/>")
                    .append($("<span/>", {
                        id: sparkid1,
                        class: "mouseoverdemo",
                        css: {
                            width: "100%",
                            float: "left"
                        }
                    }))
                )
                .append($("<td/>", {
                    align: "center",
                    html: win.minval
                }))
                .append($("<td/>", {
                    align: "center",
                    html: win.maxval
                }))
                .append($("<td/>", {
                    align: "center",
                    html: (win.valsum / win.valcount).toFixed(2)
                }))
                .append($("<td/>", {
                    align: "center",
                    html: win.calc1
                }))
                .append($("<td/>", {
                    align: "center",
                    html: win.calc2
                }))
            );
        $("#" + sparkid1).sparkline(win.temphisto, {
            type: 'bar',
            height: 60,
            barColor: "red",
            negBarColor: "blue",
            barWidth: 3,
            barSpacing: 0,
            fillColor: false,
            defaultPixelsPerValue: 3,
            chartRangeMin: 0,
            chartRangeMax: Math.max(win.temphisto),
            composite: false
        });


        // auf oldsparkid
        $("#" + oldsparkid).sparkline(win.temphisto, {
            type: 'line',
            defaultPixelsPerValue: 3,
            lineColor: "blue",
            fillColor: false,
            composite: true
        });

        $(".tablesorter").tablesorter({
            theme: "blue",
            widgets: ['filter', 'cssStickyHeaders'],
            widthFixed: true,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es
    });


    /**
     * klidistr2calc
     * @param {*} selvariable
     * @param {*} selsource
     * @param {*} selstationid
     * @param {*} ret1
     * returns object mit - sunconfig
     */
    kla2100rep.klidistr2calc = function (selvariable, selsource, selstationid, ret1) {
        //Chart.defaults.global.plugins.colorschemes.override = true;
        //Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var yAxesticks = [];
        var newArr;

        var sunconfig = {
            type: 'line',
            data: {
                labels: [],
                datasets: [],
                backgroundColor: "yellow"
            },
            options: {
                plugins: {
                    colorschemes: {
                        scheme: 'brewer.Paired12'
                    }
                },
                mytype: selvariable,
                maxcount: 0,
                layout: {
                    padding: {
                        left: 10,
                        right: 50,
                        top: 10,
                        bottom: 10
                    }
                },
                scales: {

                    xAxes: [{
                        ticks: {

                        },
                    }],

                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 500
                        }
                    }]
                }
            }
        };

        /**
         * sunconfig  für die Differenzierung
         */
        var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        //sun.temphisto = new Array(101).fill(0); // von -50 bis +50
        //win.temphisto = new Array(101).fill(0); // von -50 bis +50
        if (typeof kla2100repconfig.fromyear === "undefined") {
            var year1 = uihelper.getwmobucket(selparms.fromyear).fromyear;
            var year2 = uihelper.getwmobucket(selparms.toyear).toyear;
            kla2100repconfig.fromyear = year1;
            kla2100repconfig.toyear = year2;
            kla2100repconfig.step = 30;
        }

        var distfromyear = parseInt(kla2100repconfig.fromyear);
        var disttoyear = parseInt(kla2100repconfig.toyear);
        var diststep = parseInt(kla2100repconfig.step);
        var sunbucket = {};
        var winbucket = {};
        var ibucket = 0;
        var ebucket = distfromyear + diststep - 1;
        var sunbuckets = [];
        // Initialisieren und auf Standard-Buckets runden oder vorher setzen!!!
        for (var ibuck = distfromyear; ibuck <= disttoyear; ibuck += diststep) {
            sunbuckets.push({
                fromyear: ibuck,
                toyear: ibuck + diststep - 1,
                temphisto: {},
                /* von Array zu Object!!! */
                valsum: 0,
                valcount: 0,
                minval: null,
                maxval: null
            });
        }

        // years bereitstellen
        if (selvariable === selvariablename && klirecords.length > 0) {
            ret1.record = klirow;
        }

        var years;
        if (typeof ret1.record.years === "string") {
            years = JSON.parse(ret1.record.years);
        } else {
            years = ret1.record.years;
        }
        // Loop über die Klimaperioden - Problem: sehr große Spannweite der Werte für Grundwasser und Pegel
        // daher: kein Array, sondern Loop als Ansatz für Histogramm
        // Ergebnis in  data: sunbuckets[ibuck].temphisto,
        var minval = null;
        var maxval = null;
        for (var iyear = parseInt(distfromyear); iyear <= parseInt(disttoyear); iyear++) {
            if (typeof years[iyear] !== "undefined") {
                if (uihelper.isleapyear(iyear)) {
                    mdtable[1] = 29;
                } else {
                    mdtable[1] = 28;
                }
                var splfromday = 0;
                var spltoday = 0;
                var yearvals = years["" + iyear];
                /**
                 * Loop über die 12 Monate
                 * je Monat Zuweisung des "richtigen" Objekts sun oder win als work
                 */
                var wrk = {};
                for (var imon = 0; imon < 12; imon++) {
                    for (var ibuck2 = 0; ibuck2 < sunbuckets.length; ibuck2++) {
                        if (iyear >= sunbuckets[ibuck2].fromyear && iyear <= sunbuckets[ibuck2].toyear) {
                            wrk = sunbuckets[ibuck2];
                            break;
                        }
                    }
                    spltoday = splfromday + mdtable[imon];
                    for (var iday = splfromday; iday < spltoday; iday++) {
                        var dval1 = yearvals[iday];
                        if (dval1 !== null && dval1 !== "" && dval1 !== -9999 && !isNaN(dval1)) {
                            var dval = parseFloat(dval1);
                            var inum = 0;
                            //if (selvariablename.indexOf("WLVL") >= 0) {
                            var numt = dval1.split(".");
                            if (numt.length === 2) {
                                inum = parseInt(numt[1].substr(1, 1));
                            } else {
                                debugger;
                            }
                            //} else {
                            //    inum = parseInt(dval1.substr(dval1.length - 1));
                            //}
                            wrk.valsum += dval;
                            wrk.valcount += 1;
                            if (wrk.minval === null) {
                                wrk.minval = dval;
                            } else if (dval < wrk.minval) {
                                wrk.minval = dval;
                            }
                            if (wrk.maxval === null) {
                                wrk.maxval = dval;
                            } else if (dval > wrk.maxval) {
                                wrk.maxval = dval;
                            }
                            var itemp = Math.round(dval);
                            if (minval === null) {
                                minval = itemp;
                            } else if (itemp < minval) {
                                minval = itemp;
                            }
                            if (maxval === null) {
                                maxval = itemp;
                            } else if (itemp > maxval) {
                                maxval = itemp;
                            }
                            var tempindex = ("00000" + itemp).slice(-5); // führende Nullen
                            if (typeof wrk.temphisto[tempindex] === "undefined") {
                                wrk.temphisto[tempindex] = 1;
                            } else {
                                wrk.temphisto[tempindex] += 1;
                            }
                        }
                    }
                    splfromday = splfromday + mdtable[imon];
                }
            }
        }
        sunconfig.options.maxcount = 0;
        var maxy = 0;
        for (var ibuck = 0; ibuck < sunbuckets.length; ibuck++) {
            // Transformation in Array und Bestimmung maxcount
            var sigdata = Object.keys(sunbuckets[ibuck].temphisto);
            sigdata.sort(function (a, b) {
                if (a < b)
                    return -1;
                if (a > b)
                    return 1;
                return 0;
            });
            var minx = null;
            var maxx = null;
            var newarray = [];
            var korrindex = parseInt(sigdata[0]);
            var fromdata = parseInt(sigdata[0]);
            var todata = parseInt(sigdata[sigdata.length - 1]);
            var sigindex = fromdata;
            var anzarray = maxval - minval + 1;
            newarray = new Array(anzarray).fill(0);
            for (var isig = 0; isig < sigdata.length; isig++) {
                sigindex = sigdata[isig];
                var sigval = sunbuckets[ibuck].temphisto[sigindex];
                if (sigval !== null && sigval !== 0) {
                    newarray[parseInt(sigindex) - minval] += sigval;
                    var vglval = newarray[parseInt(sigindex) - minval];
                    if (vglval > maxy) {
                        maxy = vglval;
                    }
                }
            }
            sunbuckets[ibuck].temphisto = Object.assign(newarray);
            sunconfig.data.datasets.push({
                label: sunbuckets[ibuck].fromyear + "-" + sunbuckets[ibuck].toyear,
                data: sunbuckets[ibuck].temphisto,
                pointStyle: 'line',
                fill: false,
                borderWidth: 2
            });
        }
        /**
         * Anders rechnen für die effektiven Wasserstandswerte, gerundet
         */
        var anzvals = maxval - minval + 1;
        for (var ilabel = minval; ilabel <= maxval; ilabel++) {
            var itemp = ilabel;
            var lab;
            if (anzvals <= 10) {
                lab = "" + itemp;
            } else {
                if (itemp % 10 === 0) {
                    lab = "" + itemp;
                } else {
                    lab = "";
                }
            }
            sunconfig.data.labels.push(lab);
        }
        var rest = maxy % 10;
        maxy = maxy - rest + 10;
        sunconfig.options.scales.yAxes[0].ticks.max = maxy;
        sunconfig.options.scales.xAxes[0].ticks.min = minval;
        sunconfig.options.scales.xAxes[0].ticks.max = maxval;
        return {
            sunconfig: sunconfig,
        };
    };

    /**
     * kla2100rep.klidistr2 - tempdistribution
     * Separate Charts für Sommer und Winter für die Distribution
     * starecord hat source, stationid
     * klirow oder [1] mit variable
     */
    kla2100rep.klidistr2 = function (cid, klirow, selvariable, selsource, selstationid, ret1, cb2100p) {
        try {
            var divid = "div" + Math.floor(Math.random() * 100000) + 1;
            var chartidsun = divid + "sun";
            var chartidwin = divid + "win";
            $(cid)
                .append($("<div/>", {
                        id: divid,
                        css: {
                            float: "left",
                            overflow: "hidden",
                            "background-color": "white",
                            margin: "10px",
                            width: "100%"
                        }
                    })
                    .append($("<span/>", {
                            text: "Distribution " + " " + klirow.titel,
                            class: "doprintthis eckh3"
                        })
                        .append($("<br>"))
                        .append($("<span/>", {
                                text: "reverseY",
                                css: {
                                    margin: "5px",
                                    "background-color": "lightsteelblue"
                                }
                            })
                            .append($("<input/>", {
                                type: "checkbox",
                                class: "kla2100repreverse",
                                css: {
                                    margin: "5px"
                                }
                            }))
                        )

                        .append($("<span/>", {
                                text: "logY",
                                css: {
                                    margin: "5px",
                                    "background-color": "lightsteelblue"
                                }
                            })
                            .append($("<input/>", {
                                type: "checkbox",
                                /* checked: "checked", */
                                class: "kla2100replogy",
                                css: {
                                    margin: "5px"
                                }
                            }))
                        )

                        .append($("<span/>", {
                                text: "no x=0",
                                css: {
                                    margin: "5px",
                                    "background-color": "lightsteelblue"
                                }
                            })
                            .append($("<input/>", {
                                type: "checkbox",
                                class: "kla2100repnox0",
                                /* checked: "checked", */
                                css: {
                                    margin: "5px"
                                }
                            }))
                        )


                        .append($("<span/>", {
                                text: "X 0=null",
                                title: "X Konvertieren 0 zu null",
                                css: {
                                    margin: "5px",
                                    "background-color": "lightsteelblue"
                                }
                            })
                            .append($("<input/>", {
                                type: "checkbox",
                                class: "kla2100repx0null",
                                /* checked: "checked", */
                                css: {
                                    margin: "5px"
                                }
                            }))
                        )

                        .append($("<span/>", {
                                text: "X/10",
                                title: "x Aggregation auf 10-er Intervalle",
                                css: {
                                    margin: "5px",
                                    "background-color": "lightsteelblue"
                                }
                            })
                            .append($("<input/>", {
                                type: "checkbox",
                                class: "kla2100repx10",
                                /* checked: "checked", */
                                css: {
                                    margin: "5px"
                                }
                            }))
                        )

                        .append($("<span/>", {
                                text: "spanGaps",
                                title: "Line unterbrechen, wenn kein signifikanter y-Wert vorhanden ist",
                                css: {
                                    margin: "5px",
                                    "background-color": "lightsteelblue"
                                }
                            })
                            .append($("<input/>", {
                                type: "checkbox",
                                class: "kla2100repspangaps",
                                /* checked: "checked", */
                                css: {
                                    margin: "5px"
                                },
                            }))
                        )

                        .append($("<span/>", {
                                text: "hide all",
                                title: "Alle Datasets ausblenden",
                                css: {
                                    margin: "5px",
                                    "background-color": "lightsteelblue"
                                }
                            })
                            .append($("<input/>", {
                                type: "checkbox",
                                class: "kla2100rephideall",
                                /* checked: "checked", */
                                css: {
                                    margin: "5px"
                                }
                            }))
                        )


                    )
                    .append($("<canvas/>", {
                        id: chartidsun,
                        class: "doprintthis",
                        selvariable: selvariable,
                        css: {
                            "text-align": "center",
                            margin: "10px",
                            width: "90%"
                        }
                    }))
                    .append($("<div/>", {
                            css: {
                                "background-color": "lime",
                                width: "100%"
                            }
                        })
                        .append($("<br/>"))
                        .append($("<br/>"))
                    )
                );
            //Chart.defaults.global.plugins.colorschemes.override = true;
            //Chart.defaults.global.legend.display = true;
            // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html


            var ctx1 = document.getElementById(chartidsun).getContext('2d');
            // myCharts[selvariable + "D1"] = new Chart(ctx1, ret1.distrs[selvariable].sunconfig);


            var sunconfig = {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [],
                    backgroundColor: "yellow"
                },
                options: {
                    plugins: {
                        colorschemes: {
                            scheme: 'brewer.Paired12'
                        }
                    },
                    mytype: klirow.variable,
                    maxcount: 0,
                    layout: {
                        padding: {
                            left: 10,
                            right: 50,
                            top: 10,
                            bottom: 10
                        }
                    },
                    scales: {
                        xAxes: [{
                            ticks: {},
                        }],
                            yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            };
            debugger;
            // Die Daten stehen in klirow.HISTOGRAMM
            var fromx = Math.round(klirow.HISTOGRAMM.sumbucket.min);
            var tox = Math.round(klirow.HISTOGRAMM.sumbucket.max);
            var anzx = tox - fromx + 1;

            // Array anlegen und füllen
            var xarray = new Array(anzx).fill(0);
            var yarray = new Array(anzx).fill(0);
            var larray = new Array(anzx).fill("");

            for (var ix = 0; ix < anzx; ix++) {
                var lx = ix + fromx;
                if (lx % 5 === 0) {
                    larray [ix] = lx;
                }
                xarray[ix] = lx;
            }
            debugger;
            var hbuckets = klirow.HISTOGRAMM.data;
            for (var ibucket = 0; ibucket < hbuckets.length; ibucket++) {
                hbuckets[ibucket].harray = new Array(anzx).fill(0);
                for (var ix = 0; ix < anzx; ix++) {
                    var lx = ix + fromx;
                    if (typeof hbuckets[ibucket].hdata[lx] !== "undefined") {
                        hbuckets[ibucket].harray[ix] = hbuckets[ibucket].hdata[lx];
                    }
                }
                sunconfig.data.datasets[ibucket] = Object.assign({}, {
                    label: hbuckets[ibucket].label,
                    data: hbuckets[ibucket].harray,
                    pointStyle: 'line',
                    fill: false,
                    borderWidth: 2
                });
            }
            sunconfig.data.labels = larray;
            debugger;

            window.charts = window.charts || {};
            window.charts[chartidsun] = new Chart(ctx1, sunconfig);
            cb2100p({
                error: false,
                message: "Distribution-Chart ausgegeben"
            });
            return;
        } catch (err) {
            console.log(err);
            cb2100p({
                error: true,
                message: "Distribution-Chart:" + err
            });
            return;
        }



        /*
        // Kennziffern Kurtosis, Skewness, Shapiro Wilk-Test mit P und W-Wert
        var kur = ss.sampleKurtosis(sun.temphisto);
        var skew = ss.sampleSkewness(sun.temphisto);
        sun.calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2) + "<br>" + (kur - skew ** 2).toFixed(2);
        var w = new Vector(sun.temphisto);
        var wperg = new Normality.shapiroWilk(w);
        sun.calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);

        var kur = ss.sampleKurtosis(win.temphisto);
        var skew = ss.sampleSkewness(win.temphisto);
        win.calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2) + "<br>" + (kur - skew ** 2).toFixed(2);
        var w = new Vector(win.temphisto);
        var wperg = new Normality.shapiroWilk(w);
        win.calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);
        */
    };


    $(document).on("change", ".kla2100repreverse", function (evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        // neuer Status der Checkbox
        var state;
        state = $(this).prop("checked");
        console.log("New Status:" + state);
        //var graph = $("#" + ciddiv + "chart").data('graph');
        var canvasid = $(this).parent().find("canvas").attr("id");
        if (typeof canvasid === "undefined" || canvasid === null) {
            canvasid = $(this).parent().parent().find("canvas").attr("id");
            if (typeof canvasid === "undefined" || canvasid === null) {
                canvasid = $(this).parent().parent().parent().find("canvas").attr("id");
            }
        }
        var graph = window.charts[canvasid];
        // var graph = $(canvasref).data('graph');
        if (state === true) {
            try {
                graph.options.scales.yAxes[0].ticks.reverse = true;
                graph.update();
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                graph.options.scales.yAxes[0].ticks.reverse = false;
                graph.update();
            } catch (err) {
                console.log(err);
            }
        }
        evt.stopImmediatePropagation();
        evt.stopPropagation();
    });

    $(document).on("change", ".kla2100replogy", function (evt) {
        // click: function (evt) {
        var state = $(this).prop("checked"); // neuer Status der Checkbox
        var canvasid = $(this).parent().find("canvas").attr("id");
        if (typeof canvasid === "undefined" || canvasid === null) {
            canvasid = $(this).parent().parent().find("canvas").attr("id");
            if (typeof canvasid === "undefined" || canvasid === null) {
                canvasid = $(this).parent().parent().parent().find("canvas").attr("id");
            }
        }
        var graph = window.charts[canvasid];
        if (state === true) {
            try {
                graph.options.scales.yAxes[0].type = "logarithmic";
                graph.update();
            } catch (err) {
                console.log(err)
            }
        } else {
            try {
                graph.options.scales.yAxes[0].type = "linear";
                graph.update();
            } catch (err) {
                console.log(err)
            }
        }
    });

    $(document).on("change", ".kla2100repnox0", function (evt) {
        var state = $(this).prop("checked"); // neuer Status der Checkbox
        var canvasid = $(this).parent().find("canvas").attr("id");
        if (typeof canvasid === "undefined" || canvasid === null) {
            canvasid = $(this).parent().parent().find("canvas").attr("id");
            if (typeof canvasid === "undefined" || canvasid === null) {
                canvasid = $(this).parent().parent().parent().find("canvas").attr("id");
            }
        }
        var graph = window.charts[canvasid];
        window.chartscache = window.chartscache || {};
        window.chartscache[canvasid] = window.chartscache[canvasid] || {};
        if (state === true) {
            try {
                var saveminval = graph.options.scales.xAxes[0].ticks.min;
                var savemaxval = graph.options.scales.xAxes[0].ticks.max;
                window.chartscache[canvasid].firstxvalues = [];
                for (var igdata = 0; igdata < graph.data.datasets.length; igdata++) {
                    var firstxvalue = graph.data.datasets[igdata].data[0];
                    window.chartscache[canvasid].firstxvalues.push(firstxvalue);
                    graph.data.datasets[igdata].data[0] = null;
                }
                delete graph.options.scales.yAxes[0].ticks.min;
                delete graph.options.scales.yAxes[0].ticks.max;
                graph.update();
            } catch (err) {
                console.log(err)
            }
        } else {
            try {
                for (var igdata = 0; igdata < graph.data.datasets.length; igdata++) {
                    var firstxvalue = chartscache[canvasid].firstxvalues[igdata];
                    graph.data.datasets[igdata].data[0] = firstxvalue;
                }
                graph.update();
            } catch (err) {
                console.log(err)
            }
        }
    });


    $(document).on("change", ".kla2100rephideall", function (evt) {
        var state = $(this).prop("checked"); // neuer Status der Checkbox
        var canvasid = $(this).parent().find("canvas").attr("id");
        if (typeof canvasid === "undefined" || canvasid === null) {
            canvasid = $(this).parent().parent().find("canvas").attr("id");
            if (typeof canvasid === "undefined" || canvasid === null) {
                canvasid = $(this).parent().parent().parent().find("canvas").attr("id");
            }
        }
        var graph = window.charts[canvasid];
        if (state === true) {
            try {
                var olddatasets = graph.data.datasets;
                for (var igdata = 0; igdata < olddatasets.length; igdata++) {
                    graph.config.data.datasets[igdata].hidden = true;
                    graph.data.datasets[igdata].hidden = true;
                }
                graph.update();
            } catch (err) {
                console.log(err)
            }
        } else {
            try {
                var olddatasets = graph.data.datasets;
                for (var igdata = 0; igdata < olddatasets.length; igdata++) {
                    graph.config.data.datasets[igdata].hidden = false;
                    graph.data.datasets[igdata].hidden = false;
                }
                graph.update();
            } catch (err) {
                console.log(err)
            }
        }
    });



    $(document).on("change", ".kla2100repx0null", function (evt) {
        var state = $(this).prop("checked"); // neuer Status der Checkbox
        var canvasid = $(this).parent().find("canvas").attr("id");
        if (typeof canvasid === "undefined" || canvasid === null) {
            canvasid = $(this).parent().parent().find("canvas").attr("id");
            if (typeof canvasid === "undefined" || canvasid === null) {
                canvasid = $(this).parent().parent().parent().find("canvas").attr("id");
            }
        }
        var graph = window.charts[canvasid];
        // 10-er Intervalle auf x-Achse zusammenfassen, Aggregation
        if (state === true) {
            try {
                for (var igdata = 0; igdata < graph.data.datasets.length; igdata++) {
                    var olddata = graph.data.datasets[igdata].data;
                    for (var igx = 0; igx < olddata.length; igx++) {
                        if (typeof olddata[igx] === "undefined") {
                            olddata[igx] = "a";
                        } else if (olddata[igx] === 0 || olddata[igx].length === 0) {
                            olddata[igx] = "a";
                        }
                    }
                }
                graph.update();
            } catch (err) {
                console.log(err)
            }
        } else {
            try {
                for (var igdata = 0; igdata < graph.data.datasets.length; igdata++) {
                    var olddata = graph.data.datasets[igdata].data;
                    for (var igx = 0; igx < olddata.length; igx++) {
                        if (olddata[igx] === "a") {
                            olddata[igx] = 0;
                        }
                    }
                }
                graph.update();
            } catch (err) {
                console.log(err)
            }
        }
    });

    $(document).on("change", ".kla2100repx10", function (evt) {
        var state = $(this).prop("checked"); // neuer Status der Checkbox
        var canvasid = $(this).parent().find("canvas").attr("id");
        if (typeof canvasid === "undefined" || canvasid === null) {
            canvasid = $(this).parent().parent().find("canvas").attr("id");
            if (typeof canvasid === "undefined" || canvasid === null) {
                canvasid = $(this).parent().parent().parent().find("canvas").attr("id");
            }
        }
        var graph = window.charts[canvasid];
        // 10-er Intervalle auf x-Achse zusammenfassen, Aggregation
        // die y-Skalierung .max muss ausgesetzt werden
        if (state === true) {
            try {
                window.chartscache = window.chartscache || {};
                window.chartscache[canvasid] = window.chartscache[canvasid] || {};
                window.chartscache[canvasid].originaldata = []; //uihelper.cloneObject(graph.data.datasets);
                for (var igdata = 0; igdata < graph.data.datasets.length; igdata++) {
                    var olddata = graph.data.datasets[igdata].data;
                    window.chartscache[canvasid].originaldata.push(olddata);
                    var newdata = new Array(olddata.length).fill(0);
                    for (var igx = 0; igx < olddata.length; igx++) {
                        // Zielindex berechnen
                        var target = Math.floor(igx / 10) * 10 + 5;
                        newdata[target] += olddata[igx];
                    }
                    graph.data.datasets[igdata].data = newdata;
                }
                delete graph.options.scales.yAxes[0].ticks.max;
                graph.update();
            } catch (err) {
                console.log(err)
            }
        } else {
            try {
                var olddatasets = window.chartscache[canvasid].originaldata;
                for (var igdata = 0; igdata < olddatasets.length; igdata++) {
                    graph.data.datasets[igdata].data = olddatasets[igdata];
                }
                graph.update();
            } catch (err) {
                console.log(err)
            }
        }
    });


    $(document).on("change", ".kla2100repspangaps", function (evt) {
        var state = $(this).prop("checked"); // neuer Status der Checkbox
        var canvasid = $(this).parent().find("canvas").attr("id");
        if (typeof canvasid === "undefined" || canvasid === null) {
            canvasid = $(this).parent().parent().find("canvas").attr("id");
            if (typeof canvasid === "undefined" || canvasid === null) {
                canvasid = $(this).parent().parent().parent().find("canvas").attr("id");
            }
        }
        var graph = window.charts[canvasid];
        // spanGaps
        if (state === true) {
            try {
                graph.options.spanGaps = true;
                graph.update();
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                graph.options.spanGaps = false;
                graph.update();
            } catch (err) {
                console.log(err);
            }
        }
    });




    /**
     * kla2100rep.klitemp2 ChartJS mit min, max und avg sowie Tabelle dazu
     * @param {*} cid
     * @param {*} klirow
     * @param {*} cb2100k
     */
    kla2100rep.klitemp2 = function (cid, klirow, cb2100k) {
        // kla2100repconfig
        try {
            var ret = {};
            var ciddiv = cid.substr(1) + "div";
            var tableid = cid.substr(1) + "tbl";
            var chartid = ciddiv + "chart";
            $(cid)
                .append($("<br>"))
                .append($("<span/>", {
                        text: "Verlaufsgraphik " + klirow.titel,
                        class: "doprintthis eckh3",
                    })
                    .append($("<br>"))
                    .append($("<span/>", {
                            text: "reverseY",
                            css: {
                                margin: "5px",
                                "background-color": "lightsteelblue"
                            }
                        })
                        .append($("<input/>", {
                            type: "checkbox",
                            class: "kla2100repreverse",
                            css: {
                                margin: "5px"
                            }
                        }))
                    )

                    .append($("<span/>", {
                            text: "logY",
                            css: {
                                margin: "5px",
                                "background-color": "lightsteelblue"
                            }
                        })
                        .append($("<input/>", {
                            type: "checkbox",
                            /* checked: "checked", */
                            class: "kla2100replogy",
                            css: {
                                margin: "5px"
                            }
                        }))
                    )

                    .append($("<span/>", {
                            text: "hide all",
                            title: "Alle Datasets ausblenden",
                            css: {
                                margin: "5px",
                                "background-color": "lightsteelblue"
                            }
                        })
                        .append($("<input/>", {
                            type: "checkbox",
                            class: "kla2100rephideall",
                            /* checked: "checked", */
                            css: {
                                margin: "5px"
                            }
                        }))
                    )


                )
                .append($("<div/>", {
                    id: ciddiv + "L1",
                    css: {
                        width: "55%",
                        margin: "10px",
                        float: "left",
                        "background-color": "white",
                        overflow: "hidden"
                    }
                }))
                .append($("<div/>", {
                        id: ciddiv + "R1",
                        css: {
                            width: "40%",
                            float: "right",
                            overflow: "hidden"
                        }
                    })
                    .append($("<table/>", {
                            id: tableid,
                            class: "doprintthis tablesorter",
                            border: "2",
                            rules: "all",
                            css: {
                                width: "95%",
                                float: "left",
                                margin: "10px",
                                "background-color": "white"
                            }
                        })
                        .append($("<thead/>")
                            .append($("<tr/>")
                                .append($("<th/>", {
                                    html: "Jahr"
                                }))
                                .append($("<th/>", {
                                    html: "min"
                                }))
                                .append($("<th/>", {
                                    html: "avg"
                                }))
                                .append($("<th/>", {
                                    html: "max"
                                }))
                                .append($("<th/>", {
                                    html: "kum"
                                }))
                                .append($("<th/>", {
                                    html: "count"
                                }))
                            )
                        )
                        .append($("<tbody/>"))
                    )
                );

            // checked: "checked",
            // Loop über die Jahre
            // hoptions.cbucketdata[year]
            var minvals = [];
            var maxvals = [];
            var avgvals = [];
            var minregvals = [];
            var maxregvals = [];
            var avgregvals = [];
            var miny = null;
            var maxy = null;
            kla2100rep.getBuckets(klirow, "VERLAUF", klirow.fromyear, 30, "fromto", "config");
            for (var ibucket = 0; ibucket < klirow.VERLAUF.data.length; ibucket++) {
                $("#" + tableid)
                    .find("tbody")
                    .append($("<tr/>")
                        .append($("<td/>", {
                            html: klirow.VERLAUF.data[ibucket].label
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.data[ibucket].min.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.data[ibucket].avg.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.data[ibucket].max.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.data[ibucket].sum.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.data[ibucket].count.toFixed(0)
                        }))
                    );
                minvals.push(klirow.VERLAUF.data[ibucket].min.toFixed(1));
                avgvals.push(klirow.VERLAUF.data[ibucket].avg.toFixed(1));
                maxvals.push(klirow.VERLAUF.data[ibucket].max.toFixed(1));
                // Umrechnung auf Kelvin
                minregvals.push([ibucket, klirow.VERLAUF.data[ibucket].min + 273.15]);
                avgregvals.push([ibucket, klirow.VERLAUF.data[ibucket].avg + 273.15]);
                maxregvals.push([ibucket, klirow.VERLAUF.data[ibucket].max + 273.15]);

                if (miny === null) {
                    miny = klirow.VERLAUF.data[ibucket].min;
                } else if (miny > klirow.VERLAUF.data[ibucket].min) {
                    miny = klirow.VERLAUF.data[ibucket].min;
                }
                if (maxy === null) {
                    maxy = klirow.VERLAUF.data[ibucket].max;
                } else if (maxy < klirow.VERLAUF.data[ibucket].max) {
                    maxy = klirow.VERLAUF.data[ibucket].max;
                }
            }

            $("#" + tableid)
                    .find("tbody")
                    .append($("<tr/>")
                        .append($("<td/>", {
                            html: klirow.VERLAUF.sumbucket.label
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.sumbucket.min.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.sumbucket.avg.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.sumbucket.max.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.sumbucket.sum.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: klirow.VERLAUF.sumbucket.count.toFixed(0)
                        }))
                    );

            /**
             * Regressionsanalyse minvals, avgvals und maxvals als Array
             * https://tom-alexander.github.io/regression-js/
             */
            var result = regression.linear(minregvals, {
                order: 2,
                precision: 3
            });
            var mingradient = result.equation[0].toFixed(3);
            var minyIntercept = result.equation[1].toFixed(2);
            var minr2 = Math.round(result.r2 * 100);

            result = regression.linear(avgregvals, {
                order: 2,
                precision: 3
            });
            var avggradient = result.equation[0].toFixed(3);
            var avgyIntercept = result.equation[1].toFixed(2);
            var avgr2 = Math.round(result.r2 * 100);

            result = regression.linear(maxregvals, {
                order: 2,
                precision: 3
            });
            var maxgradient = result.equation[0].toFixed(3);
            var maxyIntercept = result.equation[1].toFixed(2);
            var maxr2 = Math.round(result.r2 * 100);

            var mindelta = minregvals[minregvals.length - 1][1] - minregvals[0][1];
            var avgdelta = avgregvals[avgregvals.length - 1][1] - avgregvals[0][1];
            var maxdelta = maxregvals[maxregvals.length - 1][1] - maxregvals[0][1];
            $("#" + tableid)
                .find("tbody")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: "Delta 1-n"
                    }))
                    .append($("<td/>", {
                        html: mindelta.toFixed(1)
                    }))
                    .append($("<td/>", {
                        html: avgdelta.toFixed(1)
                    }))
                    .append($("<td/>", {
                        html: maxdelta.toFixed(1)
                    }))
                );



            $("#" + tableid)
                .find("tbody")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: "Steigung g"
                    }))
                    .append($("<td/>", {
                        html: mingradient
                    }))
                    .append($("<td/>", {
                        html: avggradient
                    }))
                    .append($("<td/>", {
                        html: maxgradient
                    }))
                );


            $("#" + tableid)
                .find("tbody")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: "Bestimmtheit r2 %"
                    }))
                    .append($("<td/>", {
                        html: minr2
                    }))
                    .append($("<td/>", {
                        html: avgr2
                    }))
                    .append($("<td/>", {
                        html: maxr2
                    }))
                );

            $("#" + ciddiv + "L1")
                .append($("<canvas/>", {
                    id: chartid,
                    class: "doprintthis",
                    css: {
                        "text-align": "center"
                    }
                }));

            var ctx = document.getElementById(chartid).getContext('2d');
            //Chart.defaults.global.plugins.colorschemes.override = true;
            //Chart.defaults.global.legend.display = true;
            // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
            var xlabels = [];
            for (var ibuck = 0; ibuck < klirow.VERLAUF.data.length; ibuck++) {
                xlabels.push(klirow.VERLAUF.data[ibuck].label);
            }
            var config = {
                type: 'line',
                data: {
                    labels: xlabels,
                    datasets: [{
                            label: "min",
                            data: minvals,
                            backgroundColor: "blue",
                            borderColor: "blue",
                            fill: false,
                            borderWidth: 2
                        },
                        {
                            label: "avg",
                            data: avgvals,
                            backgroundColor: "black",
                            /* window.chartColors.black,*/
                            borderColor: "black",
                            /* window.chartColors.black, */
                            fill: false,
                            borderWidth: 2
                        },
                        {
                            label: "max",
                            data: maxvals,
                            backgroundColor: "red",
                            borderColor: "red",
                            fill: false,
                            borderWidth: 2
                        }
                    ],
                    backgroundColor: "yellow"
                },
                options: {
                    layout: {
                        padding: {
                            left: 10,
                            right: 50,
                            top: 10,
                            bottom: 10
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                /* beginAtZero: true, */
                                reverse: true
                                /* min: 0,
                                max: 500 */
                            }
                        }]
                    },
                    plugins: {
                        colorschemes: {
                            scheme: 'tableau.HueCircle19'
                        }
                    }
                }
            };
            window.charts = window.charts || {};
            window.charts[chartid] = new Chart(ctx, config);
            cb2100k(ret);
            return;
        } catch (err) {
            console.log(err);
            console.log(err.stack);
            cb2100k({
                error: true,
                message: err
            });
            return;
        }
    };



    /**
     * kla2100rep.klihyde2 - Ausgabe der HYDE-Daten
     * Tabelle mit Spalten und Unterteilungen nach Variablen
     * Prüfen: Line-Chart je Variablen, 3 Linien L1, L2, L3 - in %-Egalisierung auf jeweiliges Maximum
     * oder height entsprechend erweitern
     * {"1750": {
        "L1":{"popc_":175.11806088,"rurc_":0,"uopp_":0},
        "L2":{"popc_":1281.765752112,"rurc_":246.622361287,"uopp_":0},
        "L3":{"popc_":1275.5785712538,"rurc_":611.3757526348,"uopp_":0}
       },
     * @param {*} cid - Container-ID, wird vorgegeben, mit #
     * @param {*} selstationid - wird ausgewertet, Daten stehen in klihyde
     * @param {*} starecord - wird ausgewertet für Geo-Koordinaten
     * @param {*} cb2100j - Callback
     */
    kla2100rep.klihyde2 = function (cid, selstationid, starecord, cb2100j) {
        // Transformation der Daten nach Variable, year, L1, L2, L3 in Struktur
        // Dasmit Tabelle mit Charts
        var hyderep = {}; // variable - year - level
        if (typeof klihyde.data === "string" && klihyde.data.length > 0) {
            klihyde.data = JSON.parse(klihyde.data);
        }
        for (var year in klihyde.data) {
            if (klihyde.data.hasOwnProperty(year)) {
                var yeardata = klihyde.data[year];
                for (var level in yeardata) {
                    if (yeardata.hasOwnProperty(level)) {
                        var leveldata = yeardata[level];
                        for (var variablename in leveldata) {
                            if (leveldata.hasOwnProperty(variablename)) {
                                var wert = leveldata[variablename];
                                // hier ist die finale Werteebene
                                if (typeof hyderep[variablename] === "undefined") {
                                    hyderep[variablename] = {};
                                }
                                if (typeof hyderep[variablename][year] === "undefined") {
                                    hyderep[variablename][year] = {};
                                }
                                if (typeof hyderep[variablename][year][level] === "undefined") {
                                    hyderep[variablename][year][level] = 0;
                                }
                                hyderep[variablename][year][level] += wert;
                            }
                        }
                    }
                }
            }
        }

        var hcount = 0;
        $(cid)
            .append($("<div/>", {
                    css: {
                        width: "100%",
                        "text-align": "center"
                    }
                })
                .append($("<h2>", {
                    text: "Auswertung HYDE-Daten " + klirow.titel,
                    class: "doprintthis"

                }))
            );
        for (var variablename in hyderep) {
            if (hyderep.hasOwnProperty(variablename)) {
                hcount++;
                var ciddiv = cid + variablename;
                var chartdiv = ciddiv + "c";
                var tableid = "tbl" + Math.floor(Math.random() * 100000) + 1;
                var gravec = []; // Vektor für Sparkline-Graphik
                var floatdirection = "right";
                if (hcount % 2 === 1) {
                    floatdirection = "left";
                }
                $(cid)
                    .append($("<div/>", {
                            css: {
                                width: "49%",
                                float: floatdirection,
                                overflow: "hidden"
                            }
                        })
                        .append($("<h2/>", {
                            html: variablename + " " + cfeCodes.getTitleKey("hydevariable", variablename),
                            class: "doprintthis",
                            css: {
                                width: "100%"
                            }
                        }))
                        .append($("<div/>", {
                            id: chartdiv.substr(1),
                            css: {
                                width: "50%",
                                float: "left",
                                overflow: "hidden"
                            }
                        }))
                        .append($("<div/>", {
                                id: ciddiv.substr(1),
                                css: {
                                    width: "40%",
                                    float: "right",
                                    overflow: "hidden"
                                }
                            })
                            .append($("<table/>", {
                                    id: tableid,
                                    class: "doprintthis tablesorter",
                                    border: "2",
                                    rules: "all",
                                    css: {
                                        width: "49%",
                                        float: "left"
                                    }
                                })
                                .append($("<thead/>")
                                    .append($("<tr/>")
                                        .append($("<th/>", {
                                            html: "Variable"
                                        }))
                                        .append($("<th/>", {
                                            html: "Jahr"
                                        }))
                                        .append($("<th/>", {
                                            html: "L1"
                                        }))
                                        .append($("<th/>", {
                                            html: "L2"
                                        }))
                                        .append($("<th/>", {
                                            html: "L3"
                                        }))
                                    )
                                )
                                .append($("<tbody/>"))
                            )
                        )
                    );
                // Loop über die Jahre
                // hyderep[variablename][year][level] += wert;
                var miny = null;
                var maxy = null;
                var L1vals = [];
                var L2vals = [];
                var L3vals = [];
                for (var year in hyderep[variablename]) {
                    if (hyderep[variablename].hasOwnProperty(year)) {
                        var yeardata = hyderep[variablename][year];
                        $("#" + tableid)
                            .find("tbody")
                            .append($("<tr/>")
                                .append($("<td/>", {
                                    html: variablename
                                }))
                                .append($("<td/>", {
                                    html: year
                                }))
                                .append($("<td/>", {
                                    html: yeardata.L1.toFixed(0)
                                }))
                                .append($("<td/>", {
                                    html: (yeardata.L1 + yeardata.L2).toFixed(0)
                                }))
                                .append($("<td/>", {
                                    html: (yeardata.L1 + yeardata.L2 + yeardata.L3).toFixed(0)
                                }))
                            );
                        gravec.push({
                            year: year,
                            L1: yeardata.L1.toFixed(0),
                            L2: (yeardata.L1 + yeardata.L2).toFixed(0),
                            L3: (yeardata.L1 + yeardata.L2 + yeardata.L3).toFixed(0)
                        });
                        L1vals.push(yeardata.L1.toFixed(0));
                        L2vals.push((yeardata.L1 + yeardata.L2).toFixed(0));
                        L3vals.push((yeardata.L1 + yeardata.L2 + yeardata.L3).toFixed(0));
                        if (miny === null) {
                            miny = yeardata.L1;
                        } else if (miny < yeardata.L1) {
                            miny = yeardata.L1;
                        }
                        if (maxy === null) {
                            maxy = yeardata.L1 + yeardata.L2 + yeardata.L3;
                        } else if (maxy < yeardata.L1 + yeardata.L2 + yeardata.L3) {
                            maxy = yeardata.L1 + yeardata.L2 + yeardata.L3;
                        }
                    }
                }
                var chartid = ciddiv + "chart";
                // $(cid)
                /*
                $(ciddiv)
                    .parent()
                    .append($("<div/>", {
                            css: {
                                width: "49%",
                                align: "right",
                                overflow: "auto",
                                "background-color": "white"
                            }
                        })
                        */
                // hier Canvas für Chartjs
                $(chartdiv)
                    .append($("<canvas/>", {
                        id: chartid,
                        class: "doprintthis",
                        css: {
                            "text-align": "center",
                            "background-color": "white"
                        }
                    }));
                //);

                var ctx = document.getElementById(chartid).getContext('2d');
                //Chart.defaults.global.plugins.colorschemes.override = true;
                //Chart.defaults.global.legend.display = true;
                // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
                var config = {
                    type: 'line',
                    data: {
                        labels: gravec.map(function (a) {
                            return a.year;
                        }),
                        datasets: [{
                                label: "L1",
                                data: gravec.map(function (a) {
                                    return a.L1;
                                }),
                                backgroundColor: "blue",
                                borderColor: "blue",
                                fill: false,
                                borderWidth: 2
                            },
                            {
                                label: "L2",
                                data: gravec.map(function (a) {
                                    return a.L2;
                                }),
                                backgroundColor: "black",
                                borderColor: "black",
                                fill: false,
                                borderWidth: 2
                            },
                            {
                                label: "L3",
                                data: gravec.map(function (a) {
                                    return a.L3;
                                }),
                                backgroundColor: "red",
                                borderColor: "red",
                                fill: false,
                                borderWidth: 2
                            }
                        ],
                        backgroundColor: "yellow"
                    },
                    options: {
                        layout: {
                            padding: {
                                left: 10,
                                right: 50,
                                top: 10,
                                bottom: 10
                            }
                        },
                        plugins: {
                            colorschemes: {
                                scheme: 'tableau.HueCircle19'
                            }
                        }
                    }
                };
                window.charts = window.charts || {};
                window.charts[chartid] = new Chart(ctx, config);
                /**
                 * Hier Chart-Ausgabe - mit chartJS wird eine Gesamtgraphik ausgegeben
                 */
                // hmatrixL, hoptionsL,
                // hmatrixR, hoptionsR,
            }
        }
        cb2100j({
            error: false,
            message: "HYDE ausgegeben"
        });
    };




    /**
     * Einblendung Stopuhr wärend langer AJAX-Aufrufe
     */
    kla2100rep.showclock = function (clockcontainer) {
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
        module.exports = kla2100rep;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla2100rep;
        });
    } else {
        // included directly via <script> tag
        root.kla2100rep = kla2100rep;
    }
}());