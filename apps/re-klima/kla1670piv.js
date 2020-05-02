/*jshint laxbreak:true */
/*global $,window,module,document,define,root,global,self,var,this,sysbase,uihelper */
/*global uientry,planetaryjs, */
(function () {
    "use strict";
    var kla1670piv = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1670piv  starecord mit den Selektionskriterien und
     * holt die Daten selbst
     */
    var starecord = {};
    var gblpearls = [];
    var pivotmatrix = [];
    var gblconfig = {};
    var cid;
    var cidw;
    kla1670piv.show = function (parameters, navigatebucket) {
        // https://www.sitepoint.com/get-url-parameters-with-javascript/
        starecord = {};
        if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {}
        if (typeof parameters !== "undefined" && parameters.length > 0) {
            starecord.source = parameters.source || "";
            starecord.variablename = parameters.variablename || "";
            starecord.fromyear = parameters.fromyear || "0";
            starecord.toyear = parameters.toyear || "0";
        } else {
            var queryString = window.location.search;
            console.log(queryString); // ?product=shirt&color=blue&newuser&size=m
            queryString = queryString.substr(1);
            var idis = queryString.lastIndexOf("?");
            if (idis > 0) {
                queryString = queryString.substr(0, idis);
            }
            if (queryString && queryString.length > 0) {
                var parms = queryString.split("&");
                var parmobj = {};
                parms.forEach(function (item) {
                    var subparms = item.split("=");
                    var key = subparms[0];
                    parmobj[key] = subparms[1];
                });
                console.log(parmobj);
                starecord.source = parmobj.source || "";
                starecord.variablename = parmobj.variablename || "";
                starecord.fromyear = parmobj.fromyear || "0";
                starecord.toyear = parmobj.toyear || "0";
            }
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
        $(".content").empty();
        $(".headertitle").html("Globus anzeigen");
        $(".headertitle").attr("title", "kla1670piv");
        $(".content").attr("pageid", "kla1670piv");
        $(".content").attr("id", "kla1670piv");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1670piv")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1670piv_isdirty",
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
        $("#kla1670piv.content")
            .append($("<div/>", {
                class: "col1of2",
                css: {
                    "background-color": "yellow",
                    overflow: "auto"
                }
            }));
        $("#kla1670piv.content")
            .append($("<div/>", {
                    class: "col2of2",
                    css: {
                        "background-color": "lightsteelblue",
                        overflow: "auto"
                    }
                })

                .append($("<div/>", {
                    id: 'pivot670',
                    css: {
                        margin: "30px"
                    }
                }))


                .append($("<div/>", {
                        id: 'controls',
                        css: {
                            "text-align": "center",
                            width: "100%"
                        }
                    })
                    .append($("<div/>")
                        .append($("<input/>", {
                            width: "50%",
                            id: 'slider670',
                            class: "slider670",
                            type: 'range',
                            min: '0',
                            max: '100',
                            step: '0.1',
                            value: '0'
                        }))
                    )
                    .append($("<div/>", {
                            css: {
                                display: "flex",
                                "justify-content": "space-between",
                                width: "65%",
                                "margin-left": "17%"
                                /*
                                "text-align": "center",
                                width: "100%",
                                display: "block"
                                */
                            }
                        })
                        .append($("<span/>", {
                            id: 'from670',
                            css: {
                                "min-width": "40px"
                            },
                            html: "&nbsp;"
                        }))
                        .append($("<img/>", {
                            src: '/images/icons-png/arrow-l-black.png',
                            title: "Vorjahr",
                            class: "kla1670pivback"
                        }))
                        .append($("<span/>", {
                            id: 'date670',
                            css: {
                                "min-width": "40px"
                            },
                            html: "&nbsp;"
                        }))
                        .append($("<img/>", {
                            src: '/images/icons-png/arrow-r-black.png',
                            title: "Folgejahr",
                            class: "kla1670pivfore"
                        }))
                        .append($("<span/>", {
                            id: 'to670',
                            css: {
                                "min-width": "40px"
                            },
                            html: "&nbsp;"
                        }))

                    )
                )
            );
        /*
        $("#rotatingGlobe").parent().css({
            "max-width": "700px",
            "max-height": "700px"
        });
        */

        var pivotdiv = document.getElementById("pivot670");
        pivotdiv.width = $("#kla1670piv .col2of2").width();
        pivotdiv.height = $("#kla1670piv .col2of2").height();
        /*
        <canvas id='rotatingGlobe' width='400' height='400' style='width: 400px; height: 400px; cursor: move;'></canvas>
        */

        $(document).on("keypress", "input", function (evt) {
            if (evt.keyCode === 13) {
                // Cancel the default action, if needed
                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                // Trigger the button element with a click
                //document.getElementById("myBtn").click();
            }
        });

        var h = $(".content").height();
        var hh = $(".header").height();
        h += hh;
        var fh = $(".footer").height();
        h -= fh - 3;
        $("#kla1670piv .col1of2").height(h);
        $("#kla1670piv .col2of2").height(h);
        var wmtit = "Globus ";
        if (typeof starecord.stasel !== "undefined") {
            wmtit += starecord.source.length > 0 ? " " + starecord.source : "";
            wmtit += starecord.variablename.length > 0 ? " " + starecord.variablename : "";
            wmtit += starecord.fromyear.length > 0 ? " " + starecord.fromyear : "";
            wmtit += starecord.toyear.length > 0 ? " " + starecord.toyear : "";
        }
        $(".headertitle").html(wmtit);
        /**
         * Ausgabe der Pivottabelle: putpivot
         */
        kla1670piv.putpivot(function (ret) {
            sysbase.putMessage(ret.message);
            return;
        });
    }; // Ende show



    kla1670piv.putpivot = function (callback670) {
        /**
         * Spezieller Aufbau Filter und Laden in Pufffer
         * starecord wird beim Aufruf versorgt, ist hier global
         * pivot670 ist div-Container
         */
        var sel = {};
        var table = "KLISTATIONS";
        var sqlStmt = "";
        var where = "";

        sqlStmt += "SELECT ";
        // sqlStmt += " KLISTATIONS.source, KLISTATIONS.stationid, KLISTATIONS.stationname, ";
        sqlStmt += " KLISTATIONS.climatezone, ";
        sqlStmt += " KLISTATIONS.continent, ";
        // sqlStmt += " KLISTATIONS.alpha2, KLISTATIONS.alpha3, ";
        // sqlStmt += " KLISTATIONS.region, KLISTATIONS.subregion, KLISTATIONS.countryname, ";
        // sqlStmt += " KLISTATIONS.lats, KLISTATIONS.longitude, KLISTATIONS.latitude, KLISTATIONS.height, ";
        sqlStmt += " KLIINVENTORY.variable, ";
        sqlStmt += " KLIINVENTORY.fromyear, KLIINVENTORY.toyear,";
        sqlStmt += " COUNT(KLIINVENTORY.stationid) AS ANZAHL";
        sqlStmt += " FROM KLISTATIONS";
        sqlStmt += " LEFT JOIN KLIINVENTORY";
        sqlStmt += " ON KLISTATIONS.source = KLIINVENTORY.source";
        sqlStmt += " AND KLISTATIONS.stationid = KLIINVENTORY.stationid";
        where += " KLISTATIONS.stationid IN (";
        where += " SELECT stationid FROM KLIINVENTORY";
        where += " WHERE KLIINVENTORY.source = '" + starecord.source + "'";
        where += " AND KLIINVENTORY.variable = '" + starecord.variablename + "'";
        if (typeof starecord.fromyear !== "undefined" && starecord.fromyear.trim().length > 0) {
            var fromyear = starecord.fromyear.match(/(<=|>=|<|>|=)?(\d*)(-)?(\d*)?/);
            if (fromyear !== null && fromyear.length >= 3) {
                if (where.length > 0) where += " AND ";
                where += " KLIINVENTORY.toyear " + ">=" + parseInt(fromyear[2]);
                starecord.fromyear = fromyear[2];
            } else {
                callback670("Error", {
                    error: true,
                    message: "Parameterfehler"
                });
                return;
            }
        }
        if (typeof starecord.toyear !== "undefined" && starecord.toyear.trim().length > 0) {
            var toyear = starecord.toyear.match(/(<=|>=|<|>|=)?(\d*)(-)?(\d*)?/);
            if (toyear !== null && toyear.length >= 3) {
                if (where.length > 0) where += " AND ";
                where += " KLIINVENTORY.fromyear " + "<=" + parseInt(toyear[2]);
                starecord.toyear = toyear[2];
            } else {
                callback670("Error", {
                    error: true,
                    message: "Parameterfehler"
                });
                return;
            }
        }
        where += ")";
        where += " AND KLISTATIONS.source = '" + starecord.source + "'";
        where += " AND KLIINVENTORY.variable = '" + starecord.variablename + "'";
        // where += " AND KLIISTATIONS.temperature = 'TMAX,TMIN'";
        sqlStmt += " WHERE " + where;

        sqlStmt += " GROUP BY KLISTATIONS.continent, KLISTATIONS.climatezone,";
        sqlStmt += " KLIINVENTORY.variable,",
            sqlStmt += " KLIINVENTORY.fromyear, KLIINVENTORY.toyear";



        // sqlStmt += " ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";
        sqlStmt += " ORDER BY KLISTATIONS.continent, KLISTATIONS.climatezone";
        async.waterfall([
                function (callback670a) {
                    var skip = 0;
                    var limit = 0;
                    var api = "getallrecords";

                    uihelper.getAllRecords(sqlStmt, null, null, skip, limit, api, table, function (ret) {
                        if (ret.error === true) {
                            // sollte nicht passieren??? oder auch hier anlegen
                            sysbase.putMessage("Error:" + ret.message, 3);
                            callback670a("error", {
                                error: true,
                                message: ret.message
                            });
                            return;
                        } else {
                            if (ret.records !== "undefined" && ret.records !== null) {
                                var irow = 0;
                                var vonjahr = null;
                                var bisjahr = null;
                                var pearls = [];
                                $("#kla1670piv .col1of2")
                                    .append($("<ul/>", {
                                        id: "kla1670pivl1"
                                    }));
                                for (var property in ret.records) {
                                    if (ret.records.hasOwnProperty(property)) {
                                        var record = ret.records[property];
                                        irow++;
                                        pearls.push({
                                            continent: record.continent,
                                            climatezone: record.climatezone,
                                            variable: record.variable,
                                            fromyear: parseInt(record.fromyear) || 0,
                                            toyear: parseInt(record.toyear) || 0,
                                            ispainted: false
                                        });
                                        $("#kla1670pivl1")
                                            .append($("<li/>", {
                                                html: JSON.stringify(pearls[pearls.length - 1])
                                            }));
                                    }
                                }
                                callback670a(null, {
                                    error: false,
                                    message: "Daten gefunden:" + irow,
                                    pearls: uihelper.cloneObject(pearls),
                                    starecord: uihelper.cloneObject(starecord),
                                });
                                return;
                            } else {
                                callback670a("error", {
                                    error: true,
                                    message: "Keine Daten gefunden"
                                });
                                return;
                            }
                        }
                    });
                },
                function (ret, callback670b) {
                    /**
                     * Ausgabe aus dem Puffer pearls mit Iteration über die Jahre
                     * pearls mit stationid, stationname, variable, latitude, longitude,
                     * fromyear, toyear, ispainted (false als init)
                     */
                    gblpearls = ret.pearls;

                    kla1670piv.putpivotyear(gblpearls, ret.starecord.fromyear, {
                        allrowcolheaders: true,
                        fromyear: ret.starecord.fromyear,
                        toyear: ret.starecord.toyear,
                        yearsteps: 1
                    });



                    /*
                    var fromyear = parseInt(ret.starecord.fromyear);
                    var toyear = parseInt(ret.starecord.toyear);

                    $("#slider670").prop("min", fromyear);
                    $("#slider670").prop("max", toyear);
                    $("#slider670").prop("step", "1");
                    $("#slider670").prop("value", fromyear);

                    $(document).on("change slide", ".slider670", function (evt) {
                        evt.preventDefault();
                        var newValue = $(this).val();
                        $("#date670").html(newValue);
                    });
                    */


                }
            ],
            function (error, ret) {
                callback670(ret);
                return;
            });

    };


    kla1670piv.putpivotyear = function (gblpearls, actyear, config) {
        /*
        allrowcolheaders: true,
        fromyear: fromyear,
        toyear: toyear,
        yearsteps: 1
        */

        gblconfig = config;
        $("#slider670").prop("min", config.fromyear);
        $("#slider670").prop("max", config.toyear);
        $("#slider670").prop("step", config.yearsteps);
        $("#slider670").prop("value", actyear);

        $("#date670").html(actyear);
        $("#from670").html(config.fromyear);
        $("#to670").html(config.toyear);

        for (var i = 0; i < gblpearls.length; i++) {
            if (gblpearls[i].fromyear <= actyear && gblpearls[i].toyear >= actyear) {
                pivotmatrix.push({
                    continent: gblpearls[i].continent,
                    climatezone: gblpearls[i].climatezone,
                    anzahl: gblpearls[i].anzahl
                });
            }
        }
        $("#pivot670").pivotUI(
            pivotmatrix, {
                rows: ["actyear", "continent"],
                cols: ["climatezone"]
            }
        );
    };

    $(document).on("change slide", ".slider670", function (evt) {
        evt.preventDefault();
        var newValue = $(this).val();
        $("#date670").html(newValue);

        kla1670piv.putpivotyear(gblpearls, newValue, gblconfig);
    });


    $(document).on("change slide", ".slider670", function (evt) {
        evt.preventDefault();
        var newValue = $(this).val();
        $("#date670").html(newValue);

        kla1670piv.putpivotyear(gblpearls, newValue, gblconfig);
    });

    $(document).on("click", ".kla1670pivback", function (evt) {
        var oldValue = parseInt($(".slider670").val());
        var newValue = oldValue - 1;  // Step
        // Check fromyear
        if (newValue < gblconfig.fromyear) {
            newValue = oldValue;
        }
        $(".slider670").val(newValue);
        $("#date670").html(newValue);
        kla1670piv.putpivotyear(gblpearls, newValue, gblconfig);
    });


    $(document).on("click", ".kla1670pivfore", function (evt) {
        var oldValue = parseInt($(".slider670").val());
        var newValue = oldValue + 1;  // Step
        // Check fromyear
        if (newValue > gblconfig.toyear) {
            newValue = oldValue;
        }
        $(".slider670").val(newValue);
        $("#date670").html(newValue);
        kla1670piv.putpivotyear(gblpearls, newValue, gblconfig);
    });



    function oldCode() {

        var pivotdata;
        var crosswindow;
        var tries = 0;
        var tabtimer = setInterval(function () {
            //if (tries === 0) $(window).resize();
            if (window.localStorage && localStorage.length > 0) {
                pivotdata = JSON.parse(localStorage.getItem("pivotdata"));
                if (typeof pivotdata === "undefined") {
                    return;
                }
                console.log("klapivot START");
                console.log("typeof pivotdata:" + typeof pivotdata);
                $("body").empty();
                $("body")
                    .append($("<button/>", {
                        html: "Einfärben",
                        id: "klapivotb1",
                        click: function (evt) {
                            /**
                             * customize colors in cells
                             * <td class="pvtVal row19 col0" data-value="22.2" style="background-color: rgb(255, 15, 15);">22.20</td>
                             */
                            $(".pvtVal, .pvtTotal").each(function (index) {

                                var colorcode = "";
                                var tempfakt;
                                var tempfakt1;
                                var tempstring = $(this).text();
                                var colorcode = kli9020fun.getColor4Temp(tempstring);
                                $(this).css({
                                    "background-color": colorcode
                                });
                            });
                            kli9020fun.getColorPalette4Temp("colorgrade");
                        }
                    }))
                    .append($("<button/>", {
                        html: "Heatmap",
                        click: function (evt) {
                            /**
                             * Export pivotdata als heatdata to kliheatmap.html
                             */
                            var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                            localStorage.removeItem("heatmapdata");
                            crosswindow = window.open("kliheatmap.html", wname);
                            localStorage.setItem("heatmapdata", JSON.stringify(pivotdata));
                        }
                    }))
                    .append($("<button/>", {
                        html: "Heatmap+1",
                        click: function (evt) {
                            /**
                             * Export pivotdata als heatdata to kliheatmap.html
                             */
                            var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                            localStorage.removeItem("heatmapdata");
                            crosswindow = window.open("kliheatmap1.html", wname);
                            localStorage.setItem("heatmapdata", JSON.stringify(pivotdata));
                        }
                    }));


                $("body")
                    .append($("<div/>", {
                        id: "pivotoutput"
                    }));
                var h = $("body").height() - $("#pivotoutput").position().top - 3;
                $("#pivotoutput")
                    .css({
                        "margin": "30px",
                        height: h,
                        overflow: "auto",
                        float: "left"
                    });
                clearInterval(tabtimer);

                /*
                $.pivotUtilities.pivotdata = [
                    ["row","total_bill","tip","sex","smoker","day","time","size"],
                    ["1",16.99,1.01,"Female","No","Sun","Dinner",2]
                ];
                */

                /**
                 * einfache PivotTabelle
                 *
                 *
                var utils = $.pivotUtilities;
                var heatmap = utils.renderers["Heatmap"];
                $.pivotUtilities.pivotdata = pivotdata;
                $("#pivotoutput").pivot(
                    utils.pivotdata, {
                        rows: ["lats", "year"],
                        cols: ["month"],
                        renderer: heatmap
                    });
                */

                /**
                 * PivotUI-Tabelle mit DragDrop
                 *
                $.pivotUtilities.pivotdata = pivotdata;
                $("#pivotoutput").pivotUI(
                    $.pivotUtilities.pivotdata, {
                        rows: ["lats", "year"],
                        cols: ["month"],
                        vals: ["tmax", "tmin"],

                        rendererName: "Heatmap"
                    });
                */

                /**
                 * PivotUI-Tabelle mit DragDrop
                 * und customized Heatmap
                 *
                 */
                $.pivotUtilities.pivotdata = pivotdata;
                $("#pivotoutput").pivotUI(
                    $.pivotUtilities.pivotdata, {
                        rows: ["lats", "year"],
                        cols: ["month"],
                        vals: ["tmax", "tmin"],
                        aggregator: $.pivotUtilities.aggregators["Median"],
                        aggregatorName: "Median",
                        rendererName: "Heatmap",
                        onRefresh: function (config) {
                            $("#klapivotb1").click();
                        }
                    });

                $("#pivotoutput")
                    .after($("<div/>", {
                        id: "colorgrade",
                        css: {
                            float: "right"
                        }
                    }));

                localStorage.removeItem("pivotdata");

                // tabtimer = setInterval(500);
                console.log("klapivot STOP");
            } else {
                // hier geht das Versuchen weiter
                tries++;
                if (tries > 100) {
                    clearInterval(tabtimer);
                    return;
                }
                $("#waiting").append("," + tries + " " + localStorage.getItem("pivotdata"));
                console.log("Try:" + tries);
            }
        }, 500);
    }


    kla1670piv.showclock = function (clockcontainer) {
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
        module.exports = kla1670piv;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1670piv;
        });
    } else {
        // included directly via <script> tag
        root.kla1670piv = kla1670piv;
    }
}());