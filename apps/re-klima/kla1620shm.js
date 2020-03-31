/*global $,this,window,module,define,root,global,self,var,async,sysbase,uihelper,kla9020fun */
(function () {
    'use strict';
    var kla1620shm = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1620shm  bekommt über getCache pivotdata oder yearlats(?)
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
    var selstationid = null;
    var selsource = null;
    var selvariablename = null;
    var starecord = null; // Selektionsparameter
    var savedwidth = null;
    var heatmapparms = {};
    var stationrecord;
    var yearindexarray = {};
    var matrix1 = {}; // aktive Datenmatrix, wenn gefüllt

    kla1620shm.show = function (parameters, navigatebucket) {
        if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {}
        if (typeof parameters !== "undefined" && parameters.length > 0) {
            selstationid = parameters[0].stationid;
            selsource = parameters[0].source;
            selvariablename = parameters[0].variablename;
            starecord = JSON.parse(parameters[0].starecord);
        } else {
            var selparms = window.parent.sysbase.getCache("onestation");
            selparms = JSON.parse(selparms);
            selstationid = selparms.stationid;
            selsource = selparms.source;
            selvariablename = selparms.variablename;
            starecord = selparms.starecord;
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
        $(".headertitle").attr("title", "kla1620shm");
        $(".content").attr("pageid", "kla1620shm");
        $(".content").attr("id", "kla1620shm");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1620shm")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1620shm_isdirty",
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
                                var parameters = {};
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
        $("#kla1620shm.content")
            .append($("<div/>", {
                css: {
                    width: "100%",
                    "background-color": "lightsteelblue"
                }
            }));

        $("#kla1620shm.content").empty();
        $("#kla1620shm.content")
            .append($("<div/>", {
                    css: {
                        width: "100%",
                        float: "left"
                    }
                })
                .append($("<button/>", {
                    html: "Sparklines/Periode anzeigen",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.paintS(selvariablename, selsource, selstationid, matrix1);
                    }
                }))

                .append($("<button/>", {
                    html: "Sparklines/Jahr anzeigen",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.paintT(selvariablename, selsource, selstationid, matrix1);
                    }
                }))

                .append($("<button/>", {
                    html: "Chart anzeigen",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.paintChart(30, selvariablename, selsource, selstationid);
                    }
                }))


                .append($("<button/>", {
                    html: "Clusteranalyse",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.clusterAnalysis(selvariablename, selsource, selstationid);
                    }
                }))


                .append($("<button/>", {
                    html: "Bucketanalyse (30)",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.bucketAnalysis(30, selvariablename, selsource, selstationid);
                    }
                }))


                .append($("<button/>", {
                    html: "Bucketanalyse (10)",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.bucketAnalysis(10, selvariablename, selsource, selstationid);
                    }
                }))

                .append($("<div/>", {
                    id: "kla1620shmclock",
                    float: "left",
                    css: {
                        float: "left",
                        margin: "10px"
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

                            $("#kla1620shmwrapper").empty();
                            var h = $("#heatmap").height();
                            var w = $("#kla1620shm.content").width();
                            w -= $("#heatmap").position().left;
                            w -= $("#heatmap").width();
                            w -= 40;
                            $("#kla1620shmwrapper")
                                .append($("<div/>", {
                                    id: "kla1620shmcolormap",
                                    css: {
                                        "background-color": "yellow",
                                        height: h,
                                        width: w,
                                        overflow: "auto"
                                    }
                                }));

                            $("#kla1620shmcolormap").show();
                            kla9020fun.getColorPaletteX1("kla1620shmcolormap");
                        }
                        return false;
                    }
                }))
            );
        /**
         * heatmap ist die Konstante in der Darstellung
         */
        $("#kla1620shm.content")
            .append($("<div/>", {
                    id: "heatmap",
                    height: "600px",
                    width: "520px",
                    css: {
                        "margin": "10px",
                        float: "left"
                    }
                })
                .append($("<canvas/>", {
                    id: cid,
                    css: {
                        border: "1px solid"
                    }
                }))
            );
        /**
         * kla1620shmwrapper ist für die dynamischen Einspielunge zu den Buttons in paintA etc.
         */
        $("#kla1620shm.content")
            .append($("<div/>", {
                id: "kla1620shmwrapper",
                class: "kla1620shmwrapper"
            }));
        var h = $("#kla1620shm.content").height();
        var hsum = 0;
        $("#heatmap").prevAll().each(function (index) {
            var hs = $(this).height();
            hsum += hs;
        });
        h = h - hsum;
        $("#kla1620shmwrapper")
            .css({
                "margin": "10px",
                height: h,
                overflow: "auto",
                float: "left"
            });
        $("#heatmap")
            .css({
                "margin": "10px",
                height: h,
                overflow: "auto",
                float: "left"
            });
        console.log("kliheatmap Finished");
        // Dragdrop aktivieren
        var box = $(".heatvardiv");
        var mainCanvas = $(".content");
        box.draggable({
            containment: mainCanvas,
            helper: "clone",
            start: function () {
                $(this).css({
                    opacity: 0
                });
                $(".box").css("z-index", "0");
            },
            stop: function () {
                $(this).css({
                    opacity: 1
                });
            }
        });
        box.droppable({
            accept: box,
            drop: function (event, ui) {
                var draggable = ui.draggable;
                var droppable = $(this);
                var dragPos = draggable.position();
                var dropPos = droppable.position();
                draggable.css({
                    left: dropPos.left + "px",
                    top: dropPos.top + "px",
                    "z-index": 20
                });
                droppable.css("z-index", 10).animate({
                    left: dragPos.left,
                    top: dragPos.top
                });
            }
        });

        if ($("#" + cid).length === 0) {
            $("#heatmap")
                .append($("<canvas/>", {
                    id: cid,
                    css: {
                        border: "1px solid"
                    }
                }));
        }

        $(window).on('resize', function () {
            var w = $("#kla1620shm.content").width();
            w -= $("#heatmap").position().left;
            w -= $("#heatmap").width();
            w -= 40;
            $("#kla1620shmwrapper div:first").css({
                width: w
            });
        });
        savedwidth = $("#heatmap").width();
        kla1620shm.kliheatmap1(selvariablename, selsource, selstationid, starecord, function (ret) {

        });
    }; // Ende show


    /**
     * kliheatmap1 - Heatmap berechnen, Animation sichern und anzeigen
     * mit "Video-Controls" - aus KLISTATIONS - YEARS
     */
    kla1620shm.kliheatmap1 = function (selvariablename, selsource, selstationid, starecord, callbackh0) {
        $("#heatmap").show();
        $("#heatworld").show();

        // KLISTATIONS mit <variablename>.years[<year>][12 Werte im Array]

        async.waterfall([
                function (callbackshm1) {
                    var sqlStmt = "";
                    var sel = {
                        source: selsource,
                        stationid: selstationid
                    };
                    var projection = {
                        source: 1,
                        stationid: 1,
                        name: 1,
                        climatezone: 1,
                        region: 1,
                        subregion: 1,
                        countryname: 1,
                        lats: 1,
                        longitude: 1,
                        latitude: 1,
                        anzyears: 1,
                        realyears: 1,
                        fromyear: 1,
                        toyear: 1,
                        height: 1,
                        "analysis.tavg.regression.total.m": 1,
                        "analysis.tavg.regression.mtotal": 1,
                    };
                    sqlStmt += "SELECT ";
                    sqlStmt += "KLISTATIONS.source, ";
                    sqlStmt += "KLISTATIONS.stationid, ";
                    sqlStmt += "stationname, ";
                    sqlStmt += "climatezone, ";
                    sqlStmt += "region, ";
                    sqlStmt += "subregion, ";
                    sqlStmt += "countryname, ";
                    sqlStmt += "lats, ";
                    sqlStmt += "longitude, ";
                    sqlStmt += "latitude, ";
                    sqlStmt += "variable, ";
                    sqlStmt += "anzyears, ";
                    sqlStmt += "realyears, ";
                    sqlStmt += "fromyear, ";
                    sqlStmt += "toyear, ";
                    sqlStmt += "height, ";
                    sqlStmt += "years ";
                    sqlStmt += "FROM KLISTATIONS ";
                    sqlStmt += "LEFT JOIN KLIDATA ";
                    sqlStmt += "ON KLISTATIONS.source = KLIDATA.source ";
                    sqlStmt += "AND KLISTATIONS.stationid = KLIDATA.stationid ";
                    sqlStmt += "WHERE KLISTATIONS.source = '" + selsource + "' ";
                    sqlStmt += "AND KLISTATIONS.stationid = '" + selstationid + "' ";
                    sqlStmt += "AND KLIDATA.variable = '" + selvariablename.toUpperCase() + "' ";
                    sqlStmt += "ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";
                    // "analysis.tavg.regression.total.m": 1,
                    // "analysis.tavg.regression.mtotal": 1,
                    var api = "getonerecord";
                    var table = "KLISTATIONS";
                    uihelper.getOneRecord(sqlStmt, projection, api, table, function (ret) {
                        if (ret.error === false && ret.record !== null) {
                            /*
                            intern wird getallsqlrecords gerufen und EIN Satz in record zurückgegeben.
                            */
                            stationrecord = ret.record;
                            callbackshm1(null, {
                                error: false,
                                message: "Daten gefunden",
                                record: ret.record
                            });
                            return;
                        } else {
                            /**
                             * Abfrage, ob Daten geladen werden sollen
                             */
                            var qmsg = "Für Station:" + selstationid + " aus " + selsource;
                            qmsg += " und " + selvariablename;
                            qmsg += " gibt es keine Daten, sollen diese geladen werden (dauert)?";
                            var check = window.confirm(qmsg);
                            if (check === false) {
                                sysbase.putMessage("Keine Daten zur Station gefunden", 3);
                                callbackshm1("Error", {
                                    error: true,
                                    message: "Keine Daten gefunden",
                                });
                                return;
                            } else {
                                kla1620shm.loadstationdata(selstationid, selsource, sqlStmt, function (ret, record) {
                                    sysbase.putMessage("Daten geladen und bereitgestellt", 1);
                                    console.log("loadstationdata fertig:" + ret.message);
                                    callbackshm1(null, {
                                        error: ret.error,
                                        message: ret.message,
                                        record: ret.record
                                    });
                                    return;
                                });
                            }
                        }
                    });
                },
                function (ret, callbackshm2) {
                    var colwidth;
                    var rowheight;
                    var wratio;
                    var hratio;
                    try {
                        var wmtit = "Selektion für Station:";
                        wmtit += " " + starecord.source + " ";
                        // isMember ? '$2.00' : '$10.00'
                        wmtit += selstationid;
                        wmtit += (ret.record.stationname || "").length > 0 ? " " + ret.record.stationname : "";
                        wmtit += (ret.record.fromyear || "").length > 0 ? " von " + ret.record.fromyear : "";
                        wmtit += (ret.record.toyear || "").length > 0 ? " bis " + ret.record.toyear : "";
                        wmtit += (ret.record.anzyears || 0).length > 0 ? " für " + ret.record.anzyears + " Jahre" : "";
                        wmtit += (ret.record.region || "").length > 0 ? " Region:" + ret.record.region : "";
                        wmtit += (ret.record.climatezone || "").length > 0 ? " Klimazone:" + ret.record.climatezone : "";
                        wmtit += (ret.record.height || "").length > 0 ? " Höhe:" + ret.record.height : "";
                        $(".headertitle").html(wmtit);
                        var years = JSON.parse(ret.record.years);
                        var dayyears = JSON.parse(ret.record.years); // ret.record[selvariablename].years;

                        var mtitle = "";
                        mtitle += (ret.record.variable || "").length > 0 ? " " + ret.record.variable : "";
                        mtitle += " " + selstationid;
                        mtitle += (ret.record.stationname || "").length > 0 ? " " + ret.record.stationname : "";
                        mtitle += (ret.record.fromyear || "").length > 0 ? " von " + ret.record.fromyear : "";
                        mtitle += (ret.record.toyear || "").length > 0 ? " bis " + ret.record.toyear : "";

                        // Aufruf Heatmap mit Container und Matrix
                        matrix1 = {
                            title: mtitle,
                            colheaders: [],
                            rowheaders: [],
                            data: []
                        };
                        var irow = 0;
                        for (var year in years) {
                            if (years.hasOwnProperty(year)) {
                                matrix1.rowheaders.push(year);
                                var rowvalues = years[year];
                                // zum Test erst mal brutal die ersten 12 Werte
                                matrix1.data[irow] = [];
                                for (var icol = 0; icol < 365; icol++) {
                                    if (rowvalues[icol] === "") {
                                        matrix1.data[irow][icol] = null;
                                    } else if (rowvalues[icol] === "-9999" || rowvalues[icol] === "-999.9") {
                                        matrix1.data[irow][icol] = null;
                                    } else {
                                        matrix1.data[irow][icol] = rowvalues[icol];
                                    }
                                }
                                irow++;
                            }
                        }
                        // hier ist das Layout nochmal zu kontrollieren

                        var erg = kla9020fun.getHeatmap(cid, matrix1, function (ret) {
                            sysbase.putMessage("Heatmap ausgegeben", 1);
                            callbackshm2(null, {
                                error: false,
                                message: "Heatmap ausgegeben",
                                matrix: matrix1
                            });
                            return;
                        });
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
                function (ret, callbackshm2) {
                    // hier muss die matrix1-Struktur übergeben werden
                    kla1620shm.paintT(selvariablename, selsource, selstationid, ret.matrix);
                    callbackshm2("Finish", {
                        error: false,
                        message: "Heatmap ausgegeben"
                    });
                    return;
                }
            ],
            function (error, ret) {
                callbackh0(ret);
                return;
            });
    };

    /**
     * loadstationdata - Laden der Rohdaten nach SQLite und Bereitstellen Datensatz
     * @param {*} stationid  - identifiziert die Staion
     * @param {*} source - Datenquelle zur Selektion
     * @param {*} sqlStmt  - SQL-SELECT, um den geforderten Satz zu holen, wiederholt den Zugriff
     * vor dem Laden der Daten
     * returns callbackshm8 mit ret, record, wenn Record gefunden wurde nach dem Aufruf Laden
     */
    kla1620shm.loadstationdata = function (stationid, source, sqlStmt, callbackshm8) {

        async.waterfall([
                function (callbackshm8a) {
                    var ghcnclock = kla1620shm.showclock("#kla1620shmclock");
                    var that = this;
                    $(that).attr("disabled", true);
                    var jqxhr = $.ajax({
                        method: "GET",
                        crossDomain: false,
                        url: sysbase.getServer("ghcnddata"),
                        data: {
                            timeout: 10 * 60 * 1000,
                            source: source,
                            stationid: stationid
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        clearInterval(ghcnclock);
                        sysbase.checkSessionLogin(r1);
                        var ret1 = JSON.parse(r1);
                        sysbase.putMessage(ret1.message, 1);
                        if (ret1.error === true) {
                            callbackshm8a ("Error", {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        } else {
                            callbackshm8a (null, {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        }
                    }).fail(function (err) {
                        clearInterval(ghcnclock);
                        //$("#kli1400raw_rightwdata").empty();
                        //document.getElementById("kli1400raw").style.cursor = "default";
                        sysbase.putMessage("ghcnddata:" + err, 3);
                        callbackshm8a ("Error", {
                            error: true,
                            message: err
                        });
                        return;
                    }).always(function () {
                        // nope
                        $(that).attr("disabled", false);
                    });
                },
                function (ret, callbackshm8b) {
                    uihelper.getOneRecord(sqlStmt, "", "getonerecord", "KLIDATA", function (ret) {
                        if (ret.error === false && ret.record !== null) {
                            /*
                            intern wird getallsqlrecords gerufen und EIN Satz in record zurückgegeben.
                            */
                            stationrecord = ret.record;
                            callbackshm8b("Finish", {
                                error: false,
                                message: "Daten gefunden",
                                record: ret.record
                            });
                            return;
                        } else {
                            callbackshm8b ("Error", {
                                error: true,
                                message: ret.message
                            });
                            return;
                        }
                    });
                }
            ],
            function (error, result) {
                callbackshm8 (result);
                return;
            });
    };



    /**
     * paintS - Sparklines für Monate Gesamt = alle Jahre
     * - Randauszählung der Zuordnungen zu Grad Celsius je Jahr
     */
    kla1620shm.paintS = function (selvariablename, selsource, selstationid, matrix) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         */
        var years = matrix.data;
        var tarray = [];
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: matrix1.rowheaders[year],
                    values: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        overflow: "auto"
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        id: "kla1620shmt1",
                        css: {
                            "max-width": w + "px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
                            }))
                            .append($("<th/>", {
                                html: "m"
                            }))
                            .append($("<th/>", {
                                html: "c"
                            })).append($("<th/>", {
                                html: "r2"
                            }))
                            .append($("<th/>", {
                                html: "min"
                            }))
                            .append($("<th/>", {
                                html: "max"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        /**
         * jeder Monat über alle Jahre eine Sparkline
         */
        var pcount = 0;
        var lvalue = tarray[0].values.length;
        if (lvalue > 365) lvalue = 365; // kleine Vereinfachung
        for (var ivalue = 0; ivalue < lvalue; ivalue++) {
            var monindex = ivalue;
            pcount++;
            var sparkid = '#spark' + pcount;
            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            for (var iarray = 0; iarray < tarray.length; iarray++) {
                // Iterate values
                var x = parseInt(tarray[iarray].year);
                var y;
                var temperatur = tarray[iarray].values[ivalue];
                if (temperatur === null) {
                    pearls.push(null);
                    y = null;
                } else {
                    pearls.push(parseFloat(temperatur));
                    y = parseFloat(temperatur);
                    if (miny === null) {
                        miny = y;
                    } else if (y < miny) {
                        miny = y;
                    }
                    if (maxy === null) {
                        maxy = y;
                    } else if (y > maxy) {
                        maxy = y;
                    }
                }
                // Transformation von x und y
                //y = y + 273.15;  // Kelvin
                // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                regarray.push([x, y]);
            }
            var minyv = miny;
            var maxyv = maxy;
            var result = null;
            var gradient = null;
            var yIntercept = null;
            var r2 = null;
            if (miny !== null && maxy !== null) {
                result = regression.linear(regarray);
                gradient = result.equation[0].toFixed(2);
                yIntercept = result.equation[1].toFixed(2);
                r2 = result.r2.toFixed(2);
                minyv = minyv.toFixed(2);
                maxyv = maxyv.toFixed(2);
            }
            // Regression https://github.com/Tom-Alexander/regression-js
            // rowtit noch verfeinern für spezielle Termine, wie Tag/Nachtgleiche etc.
            var rowtit = "";
            if (tarray.length <= 12) {
                rowtit = 'M' + ("00" + (ivalue + 1)).slice(-2);
            } else {
                rowtit = 'D' + ("000" + (ivalue + 1)).slice(-3);
            }

            $("#kla1620shmt1")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: rowtit
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'spark' + pcount,
                            css: {
                                margin: "5px",
                                float: "left"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: gradient,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: yIntercept,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: r2,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )


                );

            /**
             * Regressionsgerade berechnen und einblenden
             * return [m, c] aus y = mx + c; basierend auf regarray.push([x, y]);
             */
            var linarray = [];
            var newpearls = [];
            var isigvals = 0;
            if (result !== null) {
                for (var ilin = 0; ilin < regarray.length; ilin++) {
                    var newx = regarray[ilin][0];
                    var newp = result.predict(newx);
                    var newy = newp[1].toFixed(2);
                    var y = newp[1];
                    if (miny === null && y !== null) {
                        miny = y;
                    } else if (y !== null && y < miny) {
                        miny = y;
                    }
                    if (maxy === null && y !== null) {
                        maxy = y;
                    } else if (y !== null && y > maxy) {
                        maxy = y;
                    }
                    linarray.push([newx, newy]);
                    newpearls.push(newy);
                }
            }
            // $(sparkid).sparkline(pearls);

            $(sparkid).sparkline(pearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: 3,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "blue"
                /* composite: true */
            });
            if (result !== null) {
                $(sparkid).sparkline(newpearls, {
                    type: 'line',
                    /* height: 60, */
                    fillColor: false,
                    defaultPixelsPerValue: 3,
                    chartRangeMin: miny,
                    chartRangeMax: maxy,
                    lineColor: "red",
                    composite: true
                });
            }

        }
        $(".tablesorter").tablesorter({
            theme: "blue",
            /* widgets: ['filter'], */
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

    }; // ende paintS



    /**
     * paintT - Sparklines Matrix "as is" also per row
     * - Randauszählung der Zuordnungen zu Grad Celsius je Jahr
     * - Regressionsanalyse je Zeile
     */
    kla1620shm.paintT = function (selvariablename, selsource, selstationid, matrix) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         * tarray[i] mit year und values[]
         * colheaders direkt nutzbar
         */
        var years = matrix.data;
        var tarray = [];
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: matrix1.rowheaders[year],
                    values: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        overflow: "auto"
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        id: "kla1620shmt1",
                        css: {
                            "max-width": w + "px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
                            }))
                            .append($("<th/>", {
                                html: "m"
                            }))
                            .append($("<th/>", {
                                html: "c"
                            })).append($("<th/>", {
                                html: "r2"
                            }))
                            .append($("<th/>", {
                                html: "min"
                            }))
                            .append($("<th/>", {
                                html: "max"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        /**
         * jeder Monat über alle Jahre eine Sparkline
         */
        var pcount = 0;
        var lvalue = tarray[0].values.length;
        if (lvalue > 365) lvalue = 365; // kleine Vereinfachung
        // Iteration über Zeilen = Jahre
        for (var iarray = 0; iarray < tarray.length; iarray++) {

            var monindex = ivalue;
            pcount++;
            var sparkid = '#spark' + pcount;
            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            // Iteration über Werte, je Monat/je Tag/ ...
            for (var ivalue = 0; ivalue < lvalue; ivalue++) {
                // Iterate values
                var x = ivalue; // hier: laufende Periode im Jahr parseInt(tarray[iarray].year);
                var y;
                var temperatur = tarray[iarray].values[ivalue];
                if (temperatur === null) {
                    pearls.push(null);
                    y = null;
                } else {
                    pearls.push(parseFloat(temperatur));
                    y = parseFloat(temperatur);
                    if (miny === null) {
                        miny = y;
                    } else if (y < miny) {
                        miny = y;
                    }
                    if (maxy === null) {
                        maxy = y;
                    } else if (y > maxy) {
                        maxy = y;
                    }
                }
                // Transformation von x und y
                //y = y + 273.15;  // Kelvin
                // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                regarray.push([x, y]);
            }
            var minyv = miny;
            var maxyv = maxy;
            var result = null;
            var gradient = null;
            var yIntercept = null;
            var r2 = null;
            if (miny !== null && maxy !== null) {
                result = regression.linear(regarray);
                gradient = result.equation[0].toFixed(2);
                yIntercept = result.equation[1].toFixed(2);
                r2 = result.r2.toFixed(2);
                minyv = minyv.toFixed(2);
                maxyv = maxyv.toFixed(2);
            }
            // Regression https://github.com/Tom-Alexander/regression-js
            // rowtit noch verfeinern für spezielle Termine, wie Tag/Nachtgleiche etc.
            var rowtit = tarray[iarray].year;

            $("#kla1620shmt1")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: rowtit
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'spark' + pcount,
                            css: {
                                margin: "5px",
                                float: "left"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: gradient,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: yIntercept,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: r2,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )


                );

            /**
             * Regressionsgerade berechnen und einblenden
             * return [m, c] aus y = mx + c; basierend auf regarray.push([x, y]);
             */
            var linarray = [];
            var newpearls = [];
            var isigvals = 0;
            if (result !== null) {
                for (var ilin = 0; ilin < regarray.length; ilin++) {
                    var newx = regarray[ilin][0];
                    var newp = result.predict(newx);
                    var newy = newp[1].toFixed(2);
                    var y = newp[1];
                    if (miny === null && y !== null) {
                        miny = y;
                    } else if (y !== null && y < miny) {
                        miny = y;
                    }
                    if (maxy === null && y !== null) {
                        maxy = y;
                    } else if (y !== null && y > maxy) {
                        maxy = y;
                    }
                    linarray.push([newx, newy]);
                    newpearls.push(newy);
                }
            }
            // $(sparkid).sparkline(pearls);
            var defaultpixel = 3;
            if (pearls.length > 350) defaultpixel = 2;
            $(sparkid).sparkline(pearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: defaultpixel,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "blue"
                /* composite: true */
            });
            if (result !== null) {
                $(sparkid).sparkline(newpearls, {
                    type: 'line',
                    /* height: 60, */
                    fillColor: false,
                    defaultPixelsPerValue: defaultpixel,
                    chartRangeMin: miny,
                    chartRangeMax: maxy,
                    lineColor: "red",
                    composite: true
                });
            }

        }
        $(".tablesorter").tablesorter({
            theme: "blue",
            /* widgets: ['filter'], */
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

    }; // ende paintS


    /**
     * paintChart - mit chartJS wird eine Gesamtgraphik ausgegeben
     * mit Skalierung etc.
     */
    kla1620shm.paintChart = function (bucketlength, selvariablename, selsource, selstationid) {
        /**
         * Bereitstellung der Daten
         */
        var years = stationrecord[selvariablename].years;
        var tarray = [];
        for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {

            tarray.push({
                year: matrix1.rowheaders[iyear],
                months: matrix.data[iyear]
            });

        }

        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        "background-color": "white"
                    }
                })
                .append($("<canvas/>", {
                    id: "myChart",
                    css: {
                        height: h,
                        width: w
                    }
                }))
            );
        var datasets = [];
        var labels = [];
        var lab;
        for (var imon = 0; imon < 12; imon++) {
            var rowvalues = [];
            for (var iarray = 0; iarray < tarray.length; iarray++) {
                if (imon === 0) {
                    lab = "";
                    if (iarray % bucketlength === 0 || iarray === 0) {
                        lab = tarray[iarray].year;
                    }
                    labels.push(lab);
                }
                rowvalues.push(parseFloat(tarray[iarray].months[imon]));
            }
            datasets.push({
                label: "M" + ("00" + (imon + 1)).slice(-2),
                backgroundColor: '#00FFFF',
                borderColor: '#00FFFF',
                borderWidth: 1,
                pointRadius: 1,
                data: rowvalues,
                fill: false,
            });
        }
        var ctx = document.getElementById('myChart').getContext('2d');
        Chart.defaults.global.plugins.colorschemes.override = true;
        Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                plugins: {
                    colorschemes: {
                        scheme: 'tableau.HueCircle19'
                    }
                }
            }
        };
        window.chart1 = new Chart(ctx, config);
    };

    /**
     * Clusteranalyse mit https://www.npmjs.com/package/tayden-clusterfck
     */
    kla1620shm.clusterAnalysis = function (selvariablename, selsource, selstationid) {
        /**
         * Bereitstellung der Daten
         */
        var colorarray = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];

        //var years = stationrecord[selvariablename].years;
        var years = matrix1.data;
        var tarray = [];
        for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {

            tarray.push({
                year: matrix1.rowheaders[iyear],
                values: matrix1.data[iyear]
            });

        }

        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var carray = [];
        var md5pointers = {};
        var objstrings = {};
        // null - substitute -999
        for (var ia = 0; ia < tarray.length; ia++) {
            var cvector = [];
            var iskip = false;
            for (var imo = 0; imo < tarray[0].values.length; imo++) {
                if (tarray[ia].values[imo] === null) {
                    //cvector.push(-9999);
                    iskip = true;
                    break;
                } else {
                    cvector.push(parseFloat(tarray[ia].values[imo]));
                }
            }
            if (iskip === true) continue;
            carray.push(cvector);
            var aktyear = tarray[ia].year;
            var md5pointer = md5(JSON.stringify(cvector));

            md5pointers[md5pointer] = aktyear;
            var objstring = cvector[cvector.length - 1].toString();
            objstrings[objstring] = aktyear;
        }
        /*  Input: nur Zahlen!!!
        carray = [
            [-20.2, -20, 80,20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [22, 22, -90, 20.2, 20, 80, -20.2, 20, 80,20.2, 40, 80],
            [250, 255, -253, 20.2, 20, 80, -20.2, 20, 80,20.2, 40, 80],
            [0, 30, 70, -20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [200, 0, 23, -20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [100, 54, 100, 20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [255, 13, 8, 20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80]
         ];
         */
        /* MIT license; https://www.npmjs.com/package/tayden-clusterfck */
        // var clusters = clusterfck.kmeans(carray, 8);
        // var clusters = clusterfck.kmeans(carray);  // default ist sqrt(n) für n Zeilen/Vektoren - Fehlerquelle!
        var nclusters = Math.ceil(Math.sqrt(carray.length));
        var clusters = clusterfck.kmeans(carray, nclusters);

        for (var icluster = 0; icluster < clusters.length; icluster++) {
            console.log("Cluster:" + icluster);
            for (var ielem = 0; ielem < clusters[icluster].length; ielem++) {
                var md5pointer = md5(JSON.stringify(clusters[icluster][ielem]));
                var md5year = md5pointers[md5pointer];
                var objstring = clusters[icluster][ielem].toString();
                var objyear = objstrings[objstring];
                console.log(md5year + " " + JSON.stringify(clusters[icluster][ielem]));
            }
        }
        /**
         * Vorbereitung Ausgabebereich
         */
        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var whm = $("#heatmap").width();
        /*
        if (whm <= heatmapparms.savedwidth) {
            var cdiff = Math.trunc(heatmapparms.colwidth * heatmapparms.wratio) + 1;
            $("#heatmap").width(whm + cdiff);
            var whmc = $("#" + cid).width();
            $("#" + cid).width(whmc + cdiff);
        }
        */

        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;

        $("#kla1620shmwrapper").css({
            height: h,
            width: w,
            overflow: "auto"
        });

        var scw = uihelper.getScrollbarWidth($("#kla1620shmwrapper")[0].parentElement);
        /**
         * Loop zur Ausgabe der Charts zu den Clustern
         */
        var hmcc = document.getElementById(cid);
        var hmcctx = hmcc.getContext("2d");
        var ihit = 0;

        for (var icluster = 0; icluster < clusters.length; icluster++) {
            // Holen der Daten zu den Jahren eines Clusters aus stationrecord[selvariablename].years;
            // year wird label, 12 Monate werden die Werte
            var datasets = [];
            var labels = [];
            var vlen = tarray[0].values.length;
            if (vlen === 12) {
                for (var imon = 0; imon < vlen; imon++) {
                    labels.push("M" + ("00" + (imon + 1)).slice(-2));
                }
            } else {
                for (var imon = 0; imon < vlen; imon++) {
                    labels.push("T" + ("000" + (imon + 1)).slice(-3));
                }
            }

            var rowvalues = [];
            for (var ielem = 0; ielem < clusters[icluster].length; ielem++) {
                var md5pointer = md5(JSON.stringify(clusters[icluster][ielem]));
                var rowlabel = md5pointers[md5pointer];
                // rowvalues = stationrecord[selvariablename].years[rowlabel];
                // rowvalues = matrix1.data[rowlabel];
                // rowvalues = stationrecord.years[rowlabel];  // wäre ein String
                var year = rowlabel;
                for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {
                    if (year === matrix1.rowheaders[iyear]) {
                        rowvalues = matrix1.data[iyear];
                        break;
                    }
                }

                datasets.push({
                    label: rowlabel,
                    backgroundColor: '#00FFFF',
                    borderColor: '#00FFFF',
                    borderWidth: 1,
                    pointRadius: 1,
                    data: rowvalues,
                    fill: false,
                });
            }
            $("#kla1620shmwrapper")
                .append($("<div/>", {
                        css: {
                            height: h - scw,
                            width: w - scw,
                            "background-color": "white",
                            float: "left",
                            "margin-bottom": "15px"
                        }
                    })
                    .append($("<canvas/>", {
                        id: "myChart" + icluster,
                        css: {
                            height: h - scw,
                            width: w - scw
                        }
                    }))
                );

            var ctx = document.getElementById('myChart' + icluster).getContext('2d');
            Chart.defaults.global.plugins.colorschemes.override = true;
            Chart.defaults.global.legend.display = true;
            // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
            var clusterheader = "Cluster:" + (icluster + 1);
            clusterheader += " " + selsource;
            clusterheader += " " + stationrecord.stationid;
            clusterheader += " " + stationrecord.stationname;
            var config = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    title: {
                        display: true,
                        text: clusterheader
                    },
                    plugins: {
                        colorschemes: {
                            scheme: 'tableau.HueCircle19'
                        }
                    },
                    onClick: function (ev) {
                        var title = this.titleBlock;
                        if (!title) {
                            return;
                        }
                        var x = ev.x;
                        var y = ev.y;
                        if (x > title.left && x < title.right && y > title.top && y < title.bottom) {
                            alert('title clicked!')
                        }
                    }
                }
            };
            window.chart1 = new Chart(ctx, config);
        }
        /**
         * Ausgabe des Metaclusters
         */
        var metacluster = []; // n cluster mit 12 Monatswerten
        datasets = [];
        labels = [];
        var vlen = tarray[0].values.length;
        if (vlen === 12) {
            for (var imon = 0; imon < vlen; imon++) {
                labels.push("M" + ("00" + (imon + 1)).slice(-2));
            }
        } else {
            for (var imon = 0; imon < vlen; imon++) {
                labels.push("T" + ("000" + (imon + 1)).slice(-3));
            }
        }

        var yearsounds = [];
        var clusteravgs = [];
        for (var icluster = 0; icluster < clusters.length; icluster++) {
            var monsum = new Array(vlen).fill(0.0);
            var moncount = new Array(vlen).fill(0);
            for (var ielem = 0; ielem < clusters[icluster].length; ielem++) {
                var md5pointer = md5(JSON.stringify(clusters[icluster][ielem]));
                var year = md5pointers[md5pointer];
                var rowvalues = [];
                for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {
                    if (year === matrix1.rowheaders[iyear]) {
                        rowvalues = matrix1.data[iyear];
                        break;
                    }
                }
                yearsounds.push([year, icluster]);
                for (var imon = 0; imon < vlen; imon++) {
                    if (rowvalues[imon] !== null) {
                        monsum[imon] += parseFloat(rowvalues[imon]);
                        moncount[imon]++;
                    }
                }
            }

            var avgvalues = new Array(vlen).fill(0);
            var avgsum = 0;
            var avgcount = 0;
            for (var imo = 0; imo < vlen; imo++) {
                if (moncount[imo] > 0) {
                    avgvalues[imo] = monsum[imo] / moncount[imo];
                    avgsum += monsum[imo];
                    avgcount += moncount[imo];
                }
            }
            clusteravgs.push({
                icluster: icluster,
                avg: avgsum / avgcount
            });
            datasets.push({
                label: "Cluster:" + (icluster + 1),
                /* "M" + ("00" + (imon + 1)).slice(-2), */
                backgroundColor: '#00FFFF',
                borderColor: colorarray[icluster % 10],
                borderWidth: 1,
                pointRadius: 1,
                data: avgvalues,
                fill: false,
            });
        }
        // yearsounds[[year, icluster]]
        yearsounds.sort(function (a, b) {
            if (a[0] < b[0])
                return -1;
            if (a[0] > b[0])
                return 1;
            return 0;
        });
        var spanstring = "";
        var metaarray = [];

        for (var iy = 0; iy < yearsounds.length; iy++) {
            if (iy > 0) spanstring += ",";
            spanstring += yearsounds[iy][1];
            metaarray.push(Number(yearsounds[iy][1]));
        }

        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h - scw,
                        width: w - scw,
                        "background-color": "white",
                        float: "left",
                        "margin-bottom": "15px"
                        /* overflow: "auto" */
                    }
                })
                .append($("<canvas/>", {
                    id: "myMetaChart",
                    css: {
                        height: h - scw,
                        width: w - scw,
                        /* overflow: "auto" */
                    }
                }))
            );

        var metactx = document.getElementById('myMetaChart').getContext('2d');
        Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var clusterheader = "Meta-Cluster ";
        clusterheader += " " + selsource;
        clusterheader += " " + stationrecord.variable;
        clusterheader += " " + stationrecord.stationid;
        clusterheader += " " + stationrecord.stationname;
        clusterheader += " " + stationrecord.anzyears;
        clusterheader += " von:" + stationrecord.fromyear;
        clusterheader += " bis:" + stationrecord.toyear;
        clusterheader += " " + stationrecord.countryname;
        clusterheader += " " + stationrecord.region;
        clusterheader += " " + stationrecord.longitude;
        clusterheader += "/" + stationrecord.latitude;
        var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                title: {
                    display: true,
                    text: clusterheader
                },

            }
        };
        window.chart1 = new Chart(metactx, config);
        /*
        clusteravgs.push({
            icluster: icluster,
            avg: avgsum/avgcount
        });
        */
        // absteigend
        clusteravgs.sort(function (a, b) {
            if (a.avg > b.avg)
                return -1;
            if (a.avg < b.avg)
                return 1;
            return 0;
        });
        var newval = 0;
        for (var ic = 0; ic < clusteravgs.length; ic++) {
            newval++;
            clusteravgs[ic].newval = newval;
        }
        clusteravgs.sort(function (a, b) {
            if (a.icluster < b.icluster)
                return -1;
            if (a.icluster < b.icluster)
                return 1;
            return 0;
        });
        var metaarray1 = [];
        for (var imeta = 0; imeta < metaarray.length; imeta++) {
            metaarray1.push(clusteravgs[metaarray[imeta]].newval);
        }

        $("#kla1620shmwrapper")
            .append($("<br/>"))
            .append($("<span/>", {
                id: "metasound",
                css: {
                    margin: "10px",
                    float: "left"
                }
            }))
            .append($("<button/>", {
                html: "Soundification  year/cluster#",
                css: {
                    margin: "10px"
                },
                click: function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    var splay = [];
                    for (var iy = 0; iy < yearsounds.length; iy++) {
                        splay.push(yearsounds[iy][1] + 100);
                    }
                    //var a = dtm.data(pearls[key]);
                    var a = dtm.data(splay);
                    dtm.music().note(a.range(60, 90)).play().for(24);
                    // dtm.music().note(a.range(20, 60)).play().for(12);
                    //dtm.music().note(a.range(0,10)).play();
                }
            }));
        $("#metasound").sparkline(metaarray, {
            type: 'line',
            fillColor: false,
            defaultPixelsPerValue: 3,
            lineColor: "blue"
            /* composite: true */
        });


        $("#kla1620shmwrapper")
            .append($("<br/>"))
            .append($("<span/>", {
                id: "metasound1",
                css: {
                    margin: "10px",
                    float: "left"
                }
            }))
            .append($("<button/>", {
                html: "Soundification year/cluster*",
                css: {
                    margin: "10px"
                },
                click: function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    var splay = [];

                    for (var iy = 0; iy < metaarray1.length; iy++) {
                        splay.push(metaarray1[iy] + 100);
                    }
                    var a = dtm.data(splay);
                    dtm.music().note(a.range(60, 90)).play().for(24);
                    //  mit Callback - später mal richtig
                    /*
                    var mus0 = dtm.music().note(a.range(60,90)).play().for(24);
                    var mus1 = dtm.music(function (mus0,i) {
                        console.log(i);
                        var a1 = this.data(i).print();
                        console.log(a1);
                        dtm.music().note(a1).play();
                    });
                    mus1.trigger();
                    */
                }
            }));
        $("#metasound1").sparkline(metaarray1, {
            type: 'line',
            fillColor: false,
            defaultPixelsPerValue: 3,
            lineColor: "blue"
            /* composite: true */
        });

    };

    /**
     * bucketAnalysis - 30 Jahre zusammengefasst = Klimaperioden-Monatsaufbereitung
     */
    kla1620shm.bucketAnalysis = function (bucketlength, selvariablename, selsource, selstationid) {
        /**
         * Bereitstellung der Daten
         */
        var colorarray = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];
        var years = stationrecord[selvariablename].years;
        tarray = [];
        // Lückenfüllung in years
        var yearvals = Object.keys(years);
        // Korrektur auf bucketlength-Jahre Buckets
        var startyear = parseInt(yearvals[0]);
        var endyear = new Date().getFullYear();
        var diff1 = endyear - startyear + 1;
        var rem1 = diff1 % bucketlength;
        startyear = endyear - diff1 - (bucketlength - rem1) + 1;
        for (var iyear = startyear; iyear <= endyear; iyear++) {
            if (typeof years["" + iyear] === "undefined") {
                years["" + iyear] = new Array(12).fill(null);
            }
        }
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: year,
                    months: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        /**
         * Vorbereitung Ausgabebereich
         */
        var scw = uihelper.getScrollbarWidth($("#kla1620shmwrapper")[0].parentElement);
        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h - scw,
                        width: w - scw,
                        "background-color": "white",
                        overflow: "auto"
                    }
                })
                .append($("<canvas/>", {
                    id: "myChartBucket",
                    css: {
                        height: h - scw,
                        width: w - scw
                    }
                }))
            );
        /**
         * Rahmen für die Sparklines mit Regressionsgerade zu den Buckets
         */
        var scw = uihelper.getScrollbarWidth($("#kla1620shmwrapper")[0].parentElement);
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;

        /**
         * Tabelle 1 "kla1620shmt3" - Monatsspalten pivotiert
         */
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        width: w - scw,
                        "margin-top": "15px",
                        "z-index": 1,
                        position: "relative"
                        /* overflow: "auto" */
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        id: "kla1620shmt3",
                        css: {
                            "max-width": (w - scw - 10) + "px",
                            "margin-top": "10px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Jahr"
                            }))
                            .append($("<th/>", {
                                html: "M01"
                            }))
                            .append($("<th/>", {
                                html: "M02"
                            }))
                            .append($("<th/>", {
                                html: "M03"
                            }))
                            .append($("<th/>", {
                                html: "M04"
                            }))
                            .append($("<th/>", {
                                html: "M05"
                            }))
                            .append($("<th/>", {
                                html: "M06"
                            }))
                            .append($("<th/>", {
                                html: "M07"
                            }))
                            .append($("<th/>", {
                                html: "M08"
                            }))
                            .append($("<th/>", {
                                html: "M09"
                            }))
                            .append($("<th/>", {
                                html: "M10"
                            }))
                            .append($("<th/>", {
                                html: "M11"
                            }))
                            .append($("<th/>", {
                                html: "M12"
                            }))
                            .append($("<th/>", {
                                html: "AVG"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        $("#kla1620shmt3").hide();
        /**
         * Tabelle 2 "kla1620shmt2"
         */
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        width: w - scw,
                        "margin-top": "15px",
                        "z-index": 2,
                        position: "relative"
                        /* overflow: "auto" */
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        id: "kla1620shmt2",
                        css: {
                            "max-width": (w - scw - 10) + "px",
                            "margin-top": "10px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Jahr"
                            }))
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
                            }))
                            .append($("<th/>", {
                                html: "m"
                            }))
                            .append($("<th/>", {
                                html: "c"
                            })).append($("<th/>", {
                                html: "r2"
                            }))
                            .append($("<th/>", {
                                html: "min"
                            }))
                            .append($("<th/>", {
                                html: "max"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        /**
         * Loop zur Ausgabe der Buckets
         */
        var hmcc = document.getElementById(cid);
        var hmcctx = hmcc.getContext("2d");
        var ihit = 0;
        // var anzyears = tarray.length;
        var anzyears = parseInt(tarray.length);
        var anzbuckets = Math.ceil(anzyears / bucketlength); // aufgerundet
        var labels = [];
        for (var imon = 0; imon < 12; imon++) {
            labels.push("M" + ("00" + (imon + 1)).slice(-2));
        }
        var datasets = [];
        var yearavgs = [];
        for (var ibucket = 1; ibucket <= anzbuckets; ibucket++) {
            var firstyear = (ibucket - 1) * bucketlength; // auf 0 als Basis im Array
            var lastyear = (ibucket) * bucketlength - 1; // also 0 - 29 im ersten Bucket bei 30
            if (lastyear >= anzyears) lastyear = anzyears - 1; // Absicherung
            // Holen der Daten zu den Jahren eines Clusters aus stationrecord[selvariablename].years;
            // year wird label, 12 Monate werden die Werte
            var rowvalues = [];
            var monsum = new Array(12).fill(0);
            var moncount = new Array(12).fill(0);
            kla1620shm.paintSB(bucketlength, selvariablename, selsource, selstationid, firstyear, lastyear, "kla1620shmt2", "kla1620shmt3");
            for (var iyear = firstyear; iyear <= lastyear; iyear++) {
                rowvalues = tarray[iyear].months;
                for (var imon = 0; imon < 12; imon++) {
                    if (rowvalues[imon] !== null) {
                        monsum[imon] += parseFloat(rowvalues[imon]);
                        moncount[imon]++;
                    }
                }
            }
            var avgvalues = new Array(12).fill(0);
            for (var imo = 0; imo < 12; imo++) {
                if (moncount[imo] > 0) {
                    avgvalues[imo] = monsum[imo] / moncount[imo];
                } else {
                    avgvalues[imo] = null;
                }
            } // years-Loop im Bucket
            var rowlabel = "ab:" + tarray[firstyear].year;
            datasets.push({
                label: rowlabel,
                /* "M" + ("00" + (imon + 1)).slice(-2), */
                backgroundColor: '#00FFFF',
                borderColor: '#00FFFF',
                borderWidth: 1,
                pointRadius: 1,
                data: avgvalues,
                fill: false,
            });
        } // bucket-Loop


        $(".tablesorter").tablesorter({
            theme: "blue",
            widgets: ['filter'],
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

        $("#kla1620shmt3").show();

        var ctx = document.getElementById('myChartBucket').getContext('2d');
        Chart.defaults.global.plugins.colorschemes.override = true;
        Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var bucketheader = "Buckets:";
        bucketheader += " " + selsource;
        bucketheader += " " + stationrecord.stationid;
        bucketheader += " " + stationrecord.stationname;
        var config = {
            type: 'line',
            data: {
                datasets: datasets,
                labels: labels
            },
            options: {
                title: {
                    display: true,
                    text: bucketheader
                },
                plugins: {
                    colorschemes: {
                        scheme: 'tableau.HueCircle19'
                    }
                },
            }
        };
        window.chart1 = new Chart(ctx, config);


        /**
         * Soundification for buckets https://ttsuchiya.github.io/dtm/doc/
         */
        /*
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        "max-width": (w - scw - 10) + "px",
                        float: "left"
                    }
                })
                .append($("<span/>", {
                    id: "metasound",
                    css: {
                        margin: "10px",
                        float: "left"
                    }
                }))
                .append($("<button/>", {
                    html: "Soundification  Buckets Winter",
                    css: {
                        margin: "10px"
                    },
                    click: function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                        var cvector = [];
                        var von = tarray.length - 30 - 1;
                        var bis = tarray.length - 1;
                        cvector = [];
                        for (var ia = von; ia <= bis; ia++) {
                            var iskip = false;
                            // Januar bis April
                            for (var imo = 0; imo < 3; imo++) {
                                if (tarray[ia].months[imo] === null) {
                                    //cvector.push(-9999);
                                    iskip = true;
                                    break;
                                } else {
                                    cvector.push(parseFloat(tarray[ia].months[imo]));
                                }
                            }
                            if (iskip === true) continue;
                            // November, Dezember
                            for (var imo = 10; imo < 12; imo++) {
                                if (tarray[ia].months[imo] === null) {
                                    //cvector.push(-9999);
                                    iskip = true;
                                    break;
                                } else {
                                    cvector.push(parseFloat(tarray[ia].months[imo]));
                                }
                            }
                            if (iskip === true) continue;
                        }
                        // Soundification
                        var splay = [];
                        for (var ic = 0; ic < cvector.length; ic++) {
                            splay.push(Number(cvector[ic]) + 100);
                        }
                        //var a = dtm.data(pearls[key]);
                        var a = dtm.data(splay);
                        dtm.music().note(a.range(60, 90)).play().for(24);
                    }
                }))
                .append($("<br/>"))
                .append($("<button/>", {
                    html: "Soundification  Buckets Sommer",
                    css: {
                        margin: "10px"
                    },
                    click: function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                        var cvector = [];
                        var von = tarray.length - 30 - 1;
                        var bis = tarray.length - 1;
                        cvector = [];
                        for (var ia = von; ia <= bis; ia++) {
                            var iskip = false;
                            // Januar bis April
                            for (var imo = 4; imo < 10; imo++) {
                                if (tarray[ia].months[imo] === null) {
                                    //cvector.push(-9999);
                                    iskip = true;
                                    break;
                                } else {
                                    cvector.push(parseFloat(tarray[ia].months[imo]));
                                }
                            }
                            if (iskip === true) continue;
                        }
                        // Soundification
                        var splay = [];
                        for (var ic = 0; ic < cvector.length; ic++) {
                            splay.push(Number(cvector[ic]) + 100);
                        }
                        //var a = dtm.data(pearls[key]);
                        var a = dtm.data(splay);
                        dtm.music().note(a.range(60, 90)).play().for(24);
                    }
                }))
            );
            */
    };


    /**
     * paintSB - Sparklines für Monate eines Buckets
     * - von Jahr, bis Jahr für ein Bucket
     */
    kla1620shm.paintSB = function (bucketlength, selvariablename, selsource, selstationid, von, bis, tableid, tableid2) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         * table wird vorausgesetzt, es kommen nur die rows in die Table
         * tarray wird vorausgesetzt
         * ***
         */
        $("#" + tableid2)
            .append($("<tr/>")
                .append($("<td/>", {
                    html: tarray[von].year + "-" + tarray[bis].year
                }))
            );

        /**
         * jeder Monat über alle Jahre eines Bucket
         */
        var pcount = 0;
        var msum = 0;
        var mcount = 0;
        for (var imon = 0; imon < 12; imon++) {
            var monindex = imon;
            pcount++;
            var sparkid = 'spark' + von + "_" + pcount;

            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            // rowvalues = tarray[iyear].months;
            for (var iarray = von; iarray <= bis; iarray++) {
                // Iterate Monate
                var x = parseInt(tarray[iarray].year);
                var y;
                var temperatur = tarray[iarray].months[imon];
                if (temperatur === null) {
                    pearls.push(null);
                    y = null;
                } else {
                    pearls.push(parseFloat(temperatur));
                    y = parseFloat(temperatur);
                    if (miny === null) {
                        miny = y;
                    } else if (y < miny) {
                        miny = y;
                    }
                    if (maxy === null) {
                        maxy = y;
                    } else if (y > maxy) {
                        maxy = y;
                    }
                }
                // Transformation von x und y
                //y = y + 273.15;  // Kelvin
                // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                regarray.push([x, y]);
            }
            if (miny !== null && regarray.length > 1) {
                var minyv = miny;
                var maxyv = maxy;
                // Regression https://github.com/Tom-Alexander/regression-js
                var result = regression.linear(regarray);
                if (result === null || result.length < 2) debugger;
                var gradient = result.equation[0];
                if (gradient === null) debugger;
                var yIntercept = result.equation[1];
                var gcolor;
                var cfakt;
                // percentage zwischen 0 und 1, daher transponieren
                if (gradient < -0.01) {
                    if (gradient < -5) {
                        cfakt = 1;
                    } else {
                        cfakt = (Math.abs(gradient)) / 5;
                    }
                    gcolor = kla9020fun.percentagetohsl(cfakt * 1, 160, 200); // blue
                } else if (gradient >= -0.01 && gradient < 0.01) {
                    cfakt = (Math.abs(gradient + 0.01));
                    gcolor = kla9020fun.percentagetohsl(cfakt, 90, 135); // green
                } else {
                    if (gradient > 5) {
                        cfakt = 1;
                    } else {
                        cfakt = (Math.abs(gradient)) / 5;
                    }
                    gcolor = kla9020fun.percentagetohsl((1 - cfakt), 1, 80); // red mit Kehrwert
                }


                $("#" + tableid2)
                    .find("tr:last")
                    .append($("<td/>", {
                        css: {
                            "text-align": "center",
                            "background-color": gcolor
                        },
                        html: gradient // zu 'M' + ("00" + (imon + 1)).slice(-2)
                    }));

            } else {

                $("#" + tableid2)
                    .find("tr:last")
                    .append($("<td/>", {
                        css: {
                            "text-align": "center"
                        },
                        html: "&nbsp;" // zu 'M' + ("00" + (imon + 1)).slice(-2)
                    }));
                continue;
            }

            msum += gradient;
            mcount++;

            $("#" + tableid)
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: tarray[von].year + "-" + tarray[bis].year
                    }))
                    .append($("<td/>", {
                        html: 'M' + ("00" + (imon + 1)).slice(-2)
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: sparkid,
                            css: {
                                margin: "5px",
                                float: "left"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            html: gradient.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            html: yIntercept.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            html: result.r2.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                );

            /**
             * Regressionsgerade berechnen und einblenden
             * return [m, c] aus y = mx + c; basierend auf regarray.push([x, y]);
             */
            var linarray = [];
            var newpearls = [];
            for (var ilin = 0; ilin < regarray.length; ilin++) {
                var newx = regarray[ilin][0];
                var newp = result.predict(newx);
                var newy = newp[1].toFixed(2);
                var y = newp[1];
                if (miny === null && y !== null) {
                    miny = y;
                } else if (y < miny) {
                    miny = y;
                }
                if (maxy === null && y !== null) {
                    maxy = y;
                } else if (y > maxy) {
                    maxy = y;
                }
                linarray.push([newx, newy]);
                newpearls.push(newy);
            }

            // $(sparkid).sparkline(pearls);

            $("#" + sparkid).sparkline(pearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: 3,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "blue"
                /* composite: true */
            });
            $("#" + sparkid).sparkline(newpearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: 3,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "red",
                composite: true
            });

        }

        if (mcount > 0) {
            var gradient = (msum / mcount).toFixed(2);
            var gcolor;
            var cfakt;
            // percentage zwischen 0 und 1, daher transponieren
            if (gradient < -0.01) {
                if (gradient < -5) {
                    cfakt = 1;
                } else {
                    cfakt = (Math.abs(gradient)) / 5;
                }
                gcolor = kla9020fun.percentagetohsl(cfakt * 1, 160, 200); // blue
            } else if (gradient >= -0.01 && gradient < 0.01) {
                cfakt = (Math.abs(gradient + 0.01));
                gcolor = kla9020fun.percentagetohsl(cfakt, 90, 135); // green
            } else {
                if (gradient > 5) {
                    cfakt = 1;
                } else {
                    cfakt = (Math.abs(gradient)) / 5;
                }
                gcolor = kla9020fun.percentagetohsl((1 - cfakt), 1, 80); // red mit Kehrwert
            }

            $("#" + tableid2)
                .find("tr:last")
                .append($("<td/>", {
                    css: {
                        "text-align": "center",
                        "background-color": gcolor
                    },
                    html: gradient // zu 'M' + ("00" + (imon + 1)).slice(-2)
                }));
        } else {
            $("#" + tableid2)
                .find("tr:last")
                .append($("<td/>", {
                    css: {
                        "text-align": "center"
                    },
                    html: "&nbsp;" // zu 'M' + ("00" + (imon + 1)).slice(-2)
                }));
        }
    }; // ende paintSB


    kla1620shm.activateDragDrop = function () {
        // Dragdrop aktivieren, umstellen auf offset
        var box = $(".heatvardiv");
        var mainCanvas = $(".kla1620shmwrapper");
        box.draggable({
            containment: mainCanvas,
            helper: "clone",
            start: function () {
                $(this).css({
                    opacity: 0
                });
                $(".box").css("z-index", "0");
            },
            stop: function () {
                $(this).css({
                    opacity: 1
                });
            }
        });
        box.droppable({
            accept: box,
            drop: function (event, ui) {
                var draggable = ui.draggable;
                var droppable = $(this);
                var dragOff = draggable.offset();
                var dropOff = droppable.offset();
                ui.draggable.offset(dropOff);
                draggable.offset(dropOff);
                droppable.offset(dragOff);
            }
        });
    };

    /**
     * Einblendung Stopuhr wärend langer AJAX-Aufrufe
     */
    kla1620shm.showclock = function (clockcontainer) {
        // Update the count down every 1 second
        if (typeof clockcontainer === "string") {
            if (!clockcontainer.startsWith("#")) clockcontainer = "#" + clockcontainer;
        }

        if ($('#kliclock', clockcontainer).length === 0) {
            $(clockcontainer)
                .append($("<span/>", {
                    id: "kliclock",
                    class: "kliclock",
                    html: "Stoppuhr",
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
            $("#kliclock").text(hours + "h " + minutes + "m " + seconds + "s ");
        }, 1000);
        return xclock;
    };

    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1620shm;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1620shm;
        });
    } else {
        // included directly via <script> tag
        root.kla1620shm = kla1620shm;
    }
}());