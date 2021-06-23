/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper,SuperGif,WordCloud,async */
(function () {
    "use strict";
    var kla1800ext = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var actprjname = "";
    var actfullname = "";
    var actresult = "";
    var poprecord = {};
    var aktsource = "";
    var fulldatafilename = "";
    var datafilename = "";
    var acttext = "";

    kla1800ext.show = function (parameters, navigatebucket) {
        if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {

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

        $(".content").empty();
        $(".headertitle").html("Extrakt 'Good Data' GHCN-D");
        $(".headertitle").attr("title", "kla1800ext");
        $(".content").attr("pageid", "kla1800ext");
        $(".content").attr("id", "kla1800ext");
        $(".content")
            .css({
                overflow: "hidden"
            });

        $(".content")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1800ext_isdirty",
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
                    )));

        /**
         * content - body der Application
         */
        $(".content").append($("<div/>", {
            id: "kla1800ext_left",
            class: "col1of2",
            css: {
                width: "30%",
                "background-color": "lightsteelblue"
            }
        }));

        $(".content").append($("<div/>", {
            id: "kla1800ext_right",
            class: "col2of2",
            css: {
                width: "69%",
                "background-color": "yellow"
            }
        }));
        /**
         * Tab/Reiter-Struktur anlegen https://www.w3schools.com/howto/howto_js_tabs.asp
         * class: "tab" für das gesamte div-Konstrukt
         * class: "tablink" für den Reiter-Button
         * class: "tabcontent" für den div-Inhalt je Reiter
         * opentab (tablink als this oder id des Button, id des tab, callback) für die Aktivierung eines Tabs
         */
        $("#kla1800ext_right").empty();

        sysbase.initFooter();

        // hier die Höhen absolut berechnen und versorgen
        var h = $(".content").height();
        var hh = $(".header").height();
        h += hh;
        var fh = $(".footer").height();
        h -= fh - 3;
        $("#kla1800ext_left").height(h);
        $("#kla1800ext_right").height(h);


        $("#kla1800ext_left")
            .append($("<div/>", {
                    css: {
                        width: "100%"
                    }
                })
                .append($("<button/>", {
                    html: "KLIINVENTORY-Stat",
                    css: {
                        float: "left",
                        "margin": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var selfields = {
                            username: uihelper.getUsername(),
                            configname: "TEXTTREE"
                        };
                        var updfields = {};
                        var api = "getallrecords";
                        var table = "KLICONFIG";
                        var confrecord = {};
                        try {
                            var stat = {
                                IPCC: [
                                    [1871, 1900, 0],
                                    [1901, 1930, 0],
                                    [1931, 1960, 0],
                                    [1961, 1990, 0],
                                    [1991, 2020, 0],
                                    [2021, 2050, 0]
                                ],
                                OLLILA: [
                                    [1880, 1927, 0],
                                    [1928, 1937, 0],
                                    [1938, 1977, 0],
                                    [1978, 2001, 0],
                                    [2002, 2021, 0]
                                ],
                                NELSON: [
                                    [1860, 1878, 0],
                                    [1879, 1910, 0],
                                    [1911, 1945, 0],
                                    [1946, 1965, 0],
                                    [1966, 1998, 0],
                                    [1999, 2014, 0],
                                    [2015, 2021, 0]
                                ]
                            };
                            var total = 0;

                            var sqlStmt = "SELECT";
                            sqlStmt += " source, variable, fromyear, toyear";
                            sqlStmt += " FROM KLIINVENTORY";
                            sqlStmt += " WHERE source = 'GHCND'";
                            sqlStmt += " AND variable = 'TMAX'";

                            var table = "KLIINVENTORY";
                            var skip = 0;
                            var limit = 0;
                            var api = "getallrecords";
                            uihelper.getAllRecords(sqlStmt, null, null, skip, limit, api, table, function (ret) {
                                if (ret.error === true) {
                                    // sollte nicht passieren??? oder auch hier anlegen
                                    sysbase.putMessage("Error:" + ret.message, 3);
                                    return;
                                } else {
                                    if (ret.records !== "undefined" && ret.records !== null) {
                                        $("#kla1800ext_right").empty();
                                        for (var property in ret.records) {
                                            if (ret.records.hasOwnProperty(property)) {
                                                var record = ret.records[property];
                                                total++;
                                                var fromyear = parseInt(record.fromyear);
                                                var toyear = parseInt(record.toyear);
                                                var von = 0;
                                                var bis = 0;
                                                for (var i1 = 0; i1 < stat.IPCC.length; i1++) {
                                                    von = stat.IPCC[i1][0];
                                                    bis = stat.IPCC[i1][1];
                                                    if (toyear > von && fromyear < bis) {
                                                        stat.IPCC[i1][2]++;
                                                    }
                                                }

                                                for (var i2 = 0; i2 < stat.OLLILA.length; i2++) {
                                                    von = stat.OLLILA[i2][0];
                                                    bis = stat.OLLILA[i2][1];
                                                    if (toyear > von && fromyear < bis) {
                                                        stat.OLLILA[i2][2]++;
                                                    }
                                                }

                                                for (var i3 = 0; i3 < stat.NELSON.length; i3++) {
                                                    von = stat.NELSON[i3][0];
                                                    bis = stat.NELSON[i3][1];
                                                    if (toyear > von && fromyear < bis) {
                                                        stat.NELSON[i3][2]++;
                                                    }
                                                }
                                            }
                                        }
                                        var html = "";
                                        html += "<br>total:" + total;
                                        html += "<br>" + JSON.stringify(stat, null, " ");
                                        $("#kla1800ext_right").html(html);
                                    }
                                }
                            });
                        } catch (err) {
                            sysbase.putMessage("kla1800ext" + " ERROR:" + err, 3);
                            return;
                        }
                    }
                }))
            );





            $("#kla1800ext_left")
            .append($("<div/>", {
                    css: {
                        width: "100%"
                    }
                })
                .append($("<button/>", {
                    html: "KLIDATA-Stat",
                    css: {
                        float: "left",
                        "margin": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var selfields = {
                            username: uihelper.getUsername(),
                            configname: "TEXTTREE"
                        };
                        var updfields = {};
                        var api = "getallrecords";
                        var table = "KLICONFIG";
                        var confrecord = {};
                        try {
                            var stat = {
                                IPCC: [
                                    [1871, 1900, 0],
                                    [1901, 1930, 0],
                                    [1931, 1960, 0],
                                    [1961, 1990, 0],
                                    [1991, 2020, 0],
                                    [2021, 2050, 0]
                                ],
                                OLLILA: [
                                    [1880, 1927, 0],
                                    [1928, 1937, 0],
                                    [1938, 1977, 0],
                                    [1978, 2001, 0],
                                    [2002, 2021, 0]
                                ],
                                NELSON: [
                                    [1860, 1878, 0],
                                    [1879, 1910, 0],
                                    [1911, 1945, 0],
                                    [1946, 1965, 0],
                                    [1966, 1998, 0],
                                    [1999, 2014, 0],
                                    [2015, 2021, 0]
                                ]
                            };
                            var total = 0;

                            var sqlStmt = "SELECT";
                            sqlStmt += " source, variable, fromyear, toyear, missing";
                            sqlStmt += " FROM KLIDATA";
                            sqlStmt += " WHERE source = 'GHCND'";
                            sqlStmt += " AND variable = 'TMAX'";
                            sqlStmt += " AND CAST(missing as DECIMAL(4,5)) <= 0.20";

                            var table = "KLIDATA";
                            var skip = 0;
                            var limit = 0;
                            var api = "getallrecords";
                            uihelper.getAllRecords(sqlStmt, null, null, skip, limit, api, table, function (ret) {
                                if (ret.error === true) {
                                    // sollte nicht passieren??? oder auch hier anlegen
                                    sysbase.putMessage("Error:" + ret.message, 3);
                                    return;
                                } else {
                                    if (ret.records !== "undefined" && ret.records !== null) {
                                        $("#kla1800ext_right").empty();
                                        for (var property in ret.records) {
                                            if (ret.records.hasOwnProperty(property)) {
                                                var record = ret.records[property];
                                                total++;
                                                var fromyear = parseInt(record.fromyear);
                                                var toyear = parseInt(record.toyear);
                                                var von = 0;
                                                var bis = 0;
                                                for (var i1 = 0; i1 < stat.IPCC.length; i1++) {
                                                    von = stat.IPCC[i1][0];
                                                    bis = stat.IPCC[i1][1];
                                                    if (toyear > von && fromyear < bis) {
                                                        stat.IPCC[i1][2]++;
                                                    }
                                                }

                                                for (var i2 = 0; i2 < stat.OLLILA.length; i2++) {
                                                    von = stat.OLLILA[i2][0];
                                                    bis = stat.OLLILA[i2][1];
                                                    if (toyear > von && fromyear < bis) {
                                                        stat.OLLILA[i2][2]++;
                                                    }
                                                }

                                                for (var i3 = 0; i3 < stat.NELSON.length; i3++) {
                                                    von = stat.NELSON[i3][0];
                                                    bis = stat.NELSON[i3][1];
                                                    if (toyear > von && fromyear < bis) {
                                                        stat.NELSON[i3][2]++;
                                                    }
                                                }
                                            }
                                        }
                                        var html = "";
                                        html += "<br>total:" + total;
                                        html += "<br>" + JSON.stringify(stat, null, " ");
                                        $("#kla1800ext_right").html(html);
                                    }
                                }
                            });
                        } catch (err) {
                            sysbase.putMessage("kla1800ext" + " ERROR:" + err, 3);
                            return;
                        }
                    }
                }))
            );







        $("#kla1800ext_left")
            .append($("<div/>", {
                    css: {
                        width: "100%"
                    }
                })
                .append($("<button/>", {
                    html: "Daten-Check",
                    css: {
                        float: "left",
                        "margin": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var selfields = {
                            username: uihelper.getUsername(),
                            configname: "TEXTTREE"
                        };
                        var updfields = {};
                        var api = "getallrecords";
                        var table = "KLICONFIG";
                        var confrecord = {};
                        try {
                            var stat = {
                                IPCC: [
                                    [1871, 1900, 0],
                                    [1901, 1930, 0],
                                    [1931, 1960, 0],
                                    [1961, 1990, 0],
                                    [1991, 2020, 0],
                                    [2021, 2050, 0]
                                ],
                                OLLILA: [
                                    [1880, 1927, 0],
                                    [1928, 1937, 0],
                                    [1938, 1977, 0],
                                    [1978, 2001, 0],
                                    [2002, 2021, 0]
                                ],
                                NELSON: [
                                    [1860, 1878, 0],
                                    [1879, 1910, 0],
                                    [1911, 1945, 0],
                                    [1946, 1965, 0],
                                    [1966, 1998, 0],
                                    [1999, 2014, 0],
                                    [2015, 2021, 0]
                                ]
                            };


                            var sqlStmt = "SELECT";
                            sqlStmt += " source, variable, fromyear, toyear, anzyears, realyears, years";
                            sqlStmt += " FROM KLIDATA";
                            sqlStmt += " WHERE source = 'GHCND'";
                            sqlStmt += " AND variable = 'TMAX'";
                            sqlStmt += " AND CAST(KLISTATIONS.missing as DECIMAL(4,5)) <= 0.20";
                            sqlStmt += " ORDER BY source, stationid";
                            var table = "KLIDATA";
                            var skip = 0;
                            var limit = 100;
                            var chunkarray = new Array(2000).fill(0);
                            var firstrec = {};
                            var total = 0;
                            async.eachSeries(chunkarray, function (chunk, nextchunk) {
                                    var api = "getallrecords";
                                    uihelper.getAllRecords(sqlStmt, null, null, skip, limit, api, table, function (ret) {
                                        if (ret.error === true) {
                                            // sollte nicht passieren??? oder auch hier anlegen
                                            sysbase.putMessage("Error:" + ret.message, 3);
                                            return;
                                        } else {
                                            $("#kla1800ext_right").html("Daten sind da");
                                            if (ret.records !== "undefined" && ret.records !== null) {
                                                $("#kla1800ext_right").empty();
                                                var chunkcount = 0;
                                                for (var property in ret.records) {
                                                    if (ret.records.hasOwnProperty(property)) {
                                                        var record = ret.records[property];
                                                        total++;
                                                        chunkcount++;
                                                        if (total === 1) {
                                                            firstrec = record;
                                                            debugger;
                                                        }
                                                        var years = record.years;
                                                        var nulls = years.match(/null/g).length;
                                                        try {
                                                            if (years.indexOf("-9999") >= 0) {
                                                                var missings = years.match(/-9999/g).length;
                                                            }
                                                        } catch (err) {
                                                            var html = $("#kla1800ext_right").html();
                                                            html += "<br>" + err.stack;
                                                            $("#kla1800ext_right").html(html);
                                                            sysbase.putMessage("kla1800ext" + " ERROR:" + err, 3);
                                                            return;
                                                        }

                                                        var missingyears = 0;
                                                        var fromyear = parseInt(record.fromyear);
                                                        var toyear = parseInt(record.toyear);

                                                        var von = 0;
                                                        var bis = 0;
                                                        for (var i1 = 0; i1 < stat.IPCC.length; i1++) {
                                                            von = stat.IPCC[i1][0];
                                                            bis = stat.IPCC[i1][1];
                                                            if (toyear > von && fromyear < bis) {
                                                                stat.IPCC[i1][2]++;
                                                            }
                                                        }

                                                        for (var i2 = 0; i2 < stat.OLLILA.length; i2++) {
                                                            von = stat.OLLILA[i2][0];
                                                            bis = stat.OLLILA[i2][1];
                                                            if (toyear > von && fromyear < bis) {
                                                                stat.OLLILA[i2][2]++;
                                                            }
                                                        }

                                                        for (var i3 = 0; i3 < stat.NELSON.length; i3++) {
                                                            von = stat.NELSON[i3][0];
                                                            bis = stat.NELSON[i3][1];
                                                            if (toyear > von && fromyear < bis) {
                                                                stat.NELSON[i3][2]++;
                                                            }
                                                        }
                                                    }
                                                }
                                                if (chunkcount < 100) {
                                                    nextchunk(new Error("wohl Ende"));
                                                    return;
                                                }
                                                skip += limit;
                                                nextchunk();
                                            }
                                        }
                                    });
                                },
                                function (err) {
                                    var html = "";
                                    html += "<br>total:" + total;
                                    html += "<br>" + JSON.stringify(stat, null, " ");
                                    html += "<br>" + JSON.stringify(firstrec, null, " ");
                                    $("#kla1800ext_right").html(html);
                                });
                        } catch (err) {
                            var html = $("#kla1800ext_right").html();
                            html += "<br>" + err.stack;
                            $("#kla1800ext_right").html(html);
                            sysbase.putMessage("kla1800ext" + " ERROR:" + err, 3);
                            return;
                        }
                    }
                }))
            );
    };





    kla1800ext.showclock = function (clockcontainer) {
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
        module.exports = kla1800ext;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1800ext;
        });
    } else {
        // included directly via <script> tag
        root.kla1800ext = kla1800ext;
    }
}());