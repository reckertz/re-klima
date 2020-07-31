/*global $,uihelper,sysbase,dotize,console,root,global,self,document,uientry,define */
/*global async */
(function () {
    "use strict";
    var uisql3rep = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var myidcode = "uisql3rep";
    var myidhash = "#" + myidcode;

    var newskip = 0;
    var tablename = "";
    var skip = 0;
    var limit = 1000;

    var myfields = [];


    var selschema = {
        entryschema: {
            seldata: {
                title: "Selektionsvorgabe",
                description: "",
                type: "object", // currency, integer, datum, text, key, object
                class: "uiefieldset",
                width: "90%",
                properties: {
                    selstmt: {
                        title: "SELECT-Statement",
                        type: "string", // currency, integer, datum, text, key
                        class: "uiearea",
                        rows: 8,
                        cols: 70,
                        default: "",
                        io: "i"
                    },
                    comment: {
                        title: "Kommentar",
                        type: "string", // currency, integer, datum, text, key
                        class: "uiearea",
                        rows: 2,
                        cols: 70,
                        default: "",
                        io: "i"
                    }
                }
            }
        }
    };


    uisql3rep.parms = {
        sel: {},
        sort: [
            ['_id', -1]
        ],
        skip: 0,
        limit: 1000,
        tablename: ""
    };


    uisql3rep.show = function () {
        /**
         * uisql3rep - generische Kontrolle Tabellen und JSON-Inhalte
         */
        var tsdate = new Date();
        var myisoday = new Date(tsdate - tsdate.getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10);
        $(".content").empty();
        $(".headertitle").html("Database-Control (SQLite3)");
        $(".headertitle").attr("title", "uisql3rep");
        $(".content").attr("pageid", "uisql3rep");
        $(".content").attr("id", "uisql3rep");
        $(".headerright").remove();
        $(".header")
            .append($("<div/>", {
                class: "headerright",
                css: {
                    float: "right"
                }
            }));

        $("#uisql3rep")
            .append($("<div/>", {
                    class: "col1of2",
                    css: {
                        width: "25%",
                        "background-color": "lightsteelblue",
                        overflow: "auto"
                    }
                })
                .append($("<div/>", {
                    id: "uisql3repc1"
                }))
            );

        $("#uisql3rep")
            .append($("<div/>", {
                    class: "col2of2",
                    id: "uisql3repc2",
                    css: {
                        width: "75%",
                        "background-color": "mistyrose",
                        overflow: "auto"
                    }
                })
                .append($("<form/>", {
                    id: "uisql3repform"
                }))
                .append($("<div/>", {
                    id: "uisql3repbutts",
                    css: {
                        width: "100%"
                    }
                }))
                .append($("<div/>", {
                    id: "uisql3repdata",
                    css: {
                        width: "100%"
                    }
                }))
            );

        sysbase.initFooter();
        uisql3rep.showuisql3reptables(function (ret) {

            var hh = $(".header").outerHeight();
            var fh = $(".footer").outerHeight();
            var wh = $(window).height();
            var h1 = wh - hh - fh - 1;
            $(".content").height(h1);
            $(".col1of2").height(h1);
            $(".col2of2").height(h1);
            uientry.getSchemaUI("uisql3rep", selschema, "uisql3rep", "uisql3rep" + "form", function (ret) {
                if (ret.error === false) {
                    //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                    $("#uisql3repbutts")
                        .append($("<button/>", {
                            id: "uisql3repbsel",
                            html: "Datensätze anzeigen",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var selrecord = {};
                                selrecord = uientry.fromUI2Record("#uisql3rep" + "form", selrecord, selschema);
                                $("#uisql3repdata").empty();
                                $(".goprev").hide();
                                $(".gonext").hide();
                                var sel = selrecord.seldata.selstmt;
                                uisql3rep.parms.tablename = "";
                                uisql3rep.parms.sel = sel;
                                uisql3rep.parms.skip = 0;
                                uisql3rep.parms.limit = 1000;
                                uisql3rep.showDetails(function (ret) {
                                    if (ret.error === true) {
                                        sysbase.putMessage(ret.message, 3);
                                    } else {
                                        sysbase.putMessage(ret.message, 0);
                                    }
                                });
                            }
                        }));

                    $("#uisql3repbutts")
                        .append($("<button/>", {
                            id: "uisql3repbsel",
                            html: "ALLE Datensätze anzeigen",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();

                                var qmsg = "Der Abruf für ALLE Daten kann lange dauern! Trotzdem durchführen?";
                                var check = window.confirm(qmsg);
                                if (check === true) {
                                    var ghcnclock = uisql3rep.showclock("#uisql3repbutts");
                                    var selrecord = {};
                                    selrecord = uientry.fromUI2Record("#uisql3rep" + "form", selrecord, selschema);
                                    $("#uisql3repdata").empty();
                                    $(".goprev").hide();
                                    $(".gonext").hide();
                                    var sel = selrecord.seldata.selstmt;
                                    uisql3rep.parms.tablename = "";
                                    uisql3rep.parms.sel = sel;
                                    uisql3rep.parms.skip = 0;
                                    uisql3rep.parms.limit = 0;
                                    uisql3rep.showDetails(function (ret) {
                                        clearInterval(ghcnclock);
                                        if (ret.error === true) {
                                            sysbase.putMessage(ret.message, 3);
                                        } else {
                                            sysbase.putMessage(ret.message, 0);
                                        }
                                    });
                                }
                            }
                        }));


                    $("#uisql3repbutts")
                        .append($("<button/>", {
                            html: "SQL-SELECT speichern",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var selrecord = {};
                                selrecord = uientry.fromUI2Record("#uisql3rep" + "form", selrecord, selschema);
                                var sel = selrecord.seldata.selstmt;
                                if (sel.trim().length === 0) {
                                    sysbase.putMessage("uisql3rep:" + " Erst ein SELECT-Statement erfassen", 3);
                                    return;
                                }
                                var updfields = {};
                                var sqlkey = md5(sel);
                                updfields["$setOnInsert"] = {
                                    sqlkey: sqlkey
                                };
                                updfields["$set"] = {
                                    sel: sel,
                                    comment: selrecord.seldata.comment,
                                    username: uihelper.getUsername()
                                };
                                var selfields = {
                                    sqlkey: sqlkey
                                };
                                var api = "setonerecord";
                                var table = "KLISQL";
                                uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                                    if (ret.error === false) {
                                        sysbase.putMessage("uisql3rep" + " saved:" + ret.message, 1);
                                        return;
                                    } else {
                                        sysbase.putMessage("uisql3rep" + " NOT saved:" + ret.message, 3);
                                        return;
                                    }
                                });
                            }
                        }));


                    $("#uisql3repbutts")
                        .append($("<button/>", {
                            html: "SQL-SELECTs anzeigen",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var sqlstmt = "SELECT * FROM KLISQL";
                                sqlstmt += " ORDER BY tsserverupd desc";
                                uisql3rep.parms.tablename = "KLISQL";
                                uisql3rep.parms.sel = sqlstmt;
                                uisql3rep.parms.skip = 0;
                                uisql3rep.parms.limit = 1000;
                                $("#uisql3repselstmt").val(sqlstmt);
                                $("#uisql3repbsel").click();
                            }
                        }));


                    $("#uisql3repbutts")
                        .append($("<button/>", {
                            html: "csv-Download",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();

                                var sqlstmt = "";
                                sqlstmt = $("#uisql3repselstmt").val();
                                uisql3rep.parms.tablename = "KLISQL";
                                uisql3rep.parms.sel = sqlstmt;
                                uisql3rep.parms.skip = 0;
                                uisql3rep.parms.limit = 1000;
                                var filename = "sql.csv";
                                var jqxhr = $.ajax({
                                    method: "POST",
                                    crossDomain: false,
                                    url: sysbase.getServer("sql2csv"),
                                    data: {
                                        sqlstmt: sqlstmt,
                                        limit: 1000,
                                        filename: filename
                                    }
                                }).done(function (r1, textStatus, jqXHR) {
                                    sysbase.checkSessionLogin(r1);
                                    var j1 = JSON.parse(r1);
                                    if (j1.error === false) {
                                        var download_path = j1.path;
                                        // Could also use the link-click method.
                                        // window.location = download_path;
                                        debugger;
                                        window.open(download_path, '_blank');
                                        sysbase.putMessage(filename + " download erfolgt", 1);
                                    } else {
                                        sysbase.putMessage(filename + " download ERROR:" + j1.message, 3);
                                    }
                                    return;


                                }).fail(function (err) {
                                    sysbase.putMessage("getAllTables AJAX ERROR:" + err.message);
                                    return;
                                }).always(function () {
                                    // nope
                                });

                            }
                        }));


                    $("#uisql3repbutts")
                        .append($("<button/>", {
                            html: "Doppel-Elimination",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                /**
                                 * Prüfung des SQL-Statements
                                 */
                                var sqlstmt = "";
                                sqlstmt = $("#uisql3repselstmt").val();

                                if (sqlstmt.indexOf("COUNT(") < 0) {
                                    sysbase.putMessage("COUNT fehlt", 3);
                                    return;
                                }
                                if (sqlstmt.indexOf("as anzahl") < 0) {
                                    sysbase.putMessage("as anzahl fehlt", 3);
                                    return;
                                }
                                if (sqlstmt.indexOf("GROUP BY") < 0) {
                                    sysbase.putMessage("GROUP BY fehlt", 3);
                                    return;
                                }
                                if (sqlstmt.indexOf("HAVING") < 0) {
                                    sysbase.putMessage("HAVING fehlt", 3);
                                    return;
                                }
                                if (sqlstmt.indexOf("ORDER BY") < 0) {
                                    sysbase.putMessage("ORDER BY fehlt", 3);
                                    return;
                                }
                                // Tabellenname extrahieren



                                var regex = /from\s+(\w+)/i;
                                var matches = sqlstmt.match(regex);
                                var qmsg = "";
                                debugger;
                                if (null != matches && matches.length >= 2) {
                                    qmsg = "Soll für Tabelle:" + matches[1] + " die Elimination doppelter Sätze durchgeführt werden?";
                                } else {
                                    sysbase.putMessage("Tabelle nicht erkennbar nach FROM", 3);
                                    return;
                                }

                                var check = window.confirm(qmsg);
                                if (check !== true) {
                                    sysbase.putMessage("Abgebrochen", 3);
                                    return;
                                }
                                uisql3rep.parms.tablename = "KLISQL";
                                uisql3rep.parms.sel = sqlstmt;
                                uisql3rep.parms.skip = 0;
                                uisql3rep.parms.limit = 1000;
                                var filename = "sql.csv";
                                var jqxhr = $.ajax({
                                    method: "POST",
                                    crossDomain: false,
                                    url: sysbase.getServer("sql2eliminate"),
                                    data: {
                                        sqlstmt: sqlstmt,
                                        limit: 1000,
                                        filename: filename
                                    }
                                }).done(function (r1, textStatus, jqXHR) {
                                    sysbase.checkSessionLogin(r1);
                                    var j1 = JSON.parse(r1);
                                    if (j1.error === false) {
                                        var download_path = j1.path;
                                        // Could also use the link-click method.
                                        // window.location = download_path;
                                        debugger;
                                        window.open(download_path, '_blank');
                                        sysbase.putMessage(filename + " download erfolgt", 1);
                                    } else {
                                        sysbase.putMessage(filename + " download ERROR:" + j1.message, 3);
                                    }
                                    return;


                                }).fail(function (err) {
                                    sysbase.putMessage("getAllTables AJAX ERROR:" + err.message);
                                    return;
                                }).always(function () {
                                    // nope
                                });

                            }
                        }));



                    $("#uisql3repbuttu")
                        .append($("<button/>", {
                            html: "HTML-Download",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                uihelper.downloadHtmlTable($("#uisql3repdata").find("table"), "html-extrakt");
                            }
                        }));
                }
            });
        });
    };


    uisql3rep.gonext = function (event, ui, callback) {
        var username = uihelper.getUsername();
        uisql3rep.parms.skip += uisql3rep.parms.limit;
        uisql3rep.showDetails(function (ret) {
            if (ret.error === true) {
                sysbase.putMessage(ret.message, 3);
            } else {
                sysbase.putMessage(ret.message, 0);
            }
        });
    };


    uisql3rep.goprevious = function (event, ui, callback) {
        var username = uihelper.getUsername();
        uisql3rep.parms.skip -= uisql3rep.parms.limit;
        if (uisql3rep.parms.skip < 0) {
            uisql3rep.parms.skip = 0;
        }
        uisql3rep.showDetails(function (ret) {
            if (ret.error === true) {
                sysbase.putMessage(ret.message, 3);
            } else {
                sysbase.putMessage(ret.message, 0);
            }
        });
    };

    /**
     * uisql3rep.showuisql3reptables(target) - Ausgabe Namen aller Tabellen
     * Quelle ist ajax-Call auf den Server
     */
    uisql3rep.showuisql3reptables = function (callback) {
        var retmsg = "";
        try {
            /**
             * AJAX holt die Liste als JSON/Array
             */
            var jqxhr = $.ajax({
                method: "GET",
                crossDomain: false,
                url: sysbase.getServer("getsql3tablesx"),
                data: {
                    username: uihelper.getUsername()
                }
            }).done(function (r1, textStatus, jqXHR) {
                sysbase.checkSessionLogin(r1);
                var ret = {};
                var j1 = JSON.parse(r1);
                uihelper.checkSessionLogin(j1);
                if (j1.records && j1.records !== null) {
                    var tabletree = j1.tabletree;
                    if ($("#uisql3repc1b1").hasClass("jstree")) $("#infobox").jstree(true).destroy();
                    $("#uisql3repc1b1").remove();
                    $("#uisql3repc1")
                        .append($("<div/>", {
                            id: "uisql3repc1b1",
                            css: {
                                overflow: "hidden"
                            }
                        }));
                    // "plugins": ["checkbox", "state", "search"],
                    $("#uisql3repc1b1").jstree({
                            "plugins": ["state", "types"],
                            core: {
                                'check_callback': true,
                                data: tabletree
                            }
                        })
                        .bind("loaded.jstree", function (event, data) {
                            //$(this).jstree("open_all");
                        });
                    // Click-Event auf eine Datei
                    $('#uisql3repc1b1').on("select_node.jstree", function (e, data) {
                        var node = $('#uisql3repc1b1').jstree(true).get_node(data.node.id);

                        if (node.a_attr.tablename !== "undefined") {
                            var tablename = node.a_attr.tablename;
                            var sqlstmt = "SELECT * FROM KLISQL";
                            sqlstmt += " WHERE sel LIKE '%" + tablename + "%'";
                            sqlstmt += " ORDER BY tsserverupd desc";
                            uisql3rep.parms.tablename = "KLISQL";
                            uisql3rep.parms.sel = sqlstmt;
                            uisql3rep.parms.skip = 0;
                            uisql3rep.parms.limit = 1000;
                            $("#uisql3repselstmt").val(sqlstmt);
                            $("#uisql3repbsel").click();
                        }
                    });
                    callback({
                        error: false,
                        message: "Treeview geladen"
                    });
                } else {
                    callback({
                        error: false,
                        message: "Treeview nicht geladen"
                    });
                }
                return;
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
            console.log("ERROR:" + err);
            callback({
                error: true,
                message: err,
                repeat: false
            });
        }
    };

    /**
     * Holen der Daten und Blätterlogik
     */
    uisql3rep.showDetails = function (callback30) {


        var api = "getallrecords";
        var table = "";
        var skip = uisql3rep.parms.skip;
        if (skip < 0) skip = 0;
        var limit = uisql3rep.parms.limit;
        var sel = uisql3rep.parms.sel;

        $("body").css("cursor", "progress");

        var htmltable = "<table class='tablesorter'>"; //  style='display:none'>";
        if (limit > 0) {
            htmltable = "<table class='tablesorter'>";
        }

        uihelper.getAllRecords(sel, {}, [], skip, limit, api, table, function (ret) {
            if (ret.error === true) {
                // skip
                sysbase.putMessage(ret.message, 3);
                callback30(ret);
                return;
            } else {
                if (ret.records !== "undefined" && ret.records !== null) {
                    var irec = 0;
                    var anzrecs = Object.keys(ret.records).length;
                    var fcount = 0;
                    var fsum = 0;
                    var flen = 0;
                    var staformat = {};
                    var staattributes = {};
                    if (uisql3rep.parms.limit === 0) {
                        var rmsg = anzrecs + " Sätze gefunden";
                        sysbase.putMessage(rmsg, 3);
                    }
                    for (var property in ret.records) {
                        if (ret.records.hasOwnProperty(property)) {
                            var record = ret.records[property];
                            // Bestimmung feste Breiten
                            irec++;
                            if (irec === 1) {
                                if (uisql3rep.parms.limit === 0 && anzrecs > 1000) {
                                    staformat.attributes = {};
                                    staattributes.largetable = true;
                                    var keys = Object.keys(record);
                                    for (var ikey = 0; ikey < keys.length; ikey++) {
                                        var feldname = keys[ikey];
                                        var feldtype = typeof record[feldname];
                                        var feldwert = "";
                                        if (feldname === "number") {
                                            feldwert = record[feldname];
                                            staformat[feldname] = {
                                                title: feldname,
                                                align: "right",
                                            };
                                            flen = feldwert.toFixed(2).length;
                                            if (flen <= 8) {
                                                staformat[feldname].stellen = 8;
                                            } else if (flen <= 15) {
                                                staformat[feldname].stellen = 15;
                                            } else {
                                                staformat[feldname].stellen = 20;
                                            }
                                            fsum += staformat[feldname].stellen;
                                        } else if (feldname === "boolean") {
                                            feldwert = record[feldname];
                                            staformat[feldname] = {
                                                title: feldname,
                                                align: "center"
                                            };
                                            staformat[feldname].stellen = 10;
                                            fsum += staformat[feldname].stellen;
                                        } else if (feldname === "object") {
                                            feldwert = JSON.stringify(record[feldname], null, "");
                                            staformat[feldname] = {
                                                title: feldname,
                                                align: "center"
                                            };
                                            staformat[feldname].stellen = 10;
                                            fsum += staformat[feldname].stellen;
                                        } else {
                                            feldwert = record[feldname];
                                            staformat[feldname] = {
                                                title: feldname,
                                                align: "left"
                                            };
                                            flen = feldwert.length;
                                            if (flen <= 8) {
                                                staformat[feldname].stellen = 8;
                                            } else if (flen <= 15) {
                                                staformat[feldname].stellen = 15;
                                            } else {
                                                staformat[feldname].stellen = flen;
                                            }
                                            fsum += staformat[feldname].stellen;
                                        }
                                    }
                                    if (fsum < 200) {
                                        var keys = Object.keys(staformat);
                                        for (var ikey = 0; ikey < keys.length; ikey++) {
                                            var feldname = keys[ikey];
                                            if (feldname !== "attributes") {
                                                staformat[feldname].width = (staformat[feldname].stellen / fsum * 100).toFixed(0) + "%";
                                            }
                                        }
                                    }
                                } else {
                                    staformat = {};
                                }
                            }
                            var line = uihelper.transformJSON2TableTRX(record, irec - 1, staattributes, staformat, "", "uisql3repclick tablesorter-ignoreRow");
                            htmltable += line;
                        }
                    }

                    htmltable += "</body>";
                    htmltable += "</table>";
                    $("#uisql3repdata").html(htmltable);
                    if (limit === 0) {
                        $(".tablesorter").tablesorter({
                            theme: "blue",
                            widthFixed: true,
                            widgets: ['filter'],
                            widgetOptions: {
                                filter_hideFilters: false,
                                filter_ignoreCase: true
                            }
                        }); // so funktioniert es


                        function timeout() {
                            setTimeout(function () {
                                // Do Something Here
                                // Then recall the parent function to
                                // create a recursive loop.
                                var cc = 0;
                                $("#uisql3repdata").find("tr:hidden").each(function (ind, elem) {
                                    cc++;
                                    if (cc > 10) return false;
                                    $(elem).show();
                                });
                                timeout();
                            }, 100);
                        }
                        timeout();
                        /*
                        $("#uisql3repdata").find("table").show();
                        $("#uisql3repdata").find("table").css({
                            display: "table"
                        });
                        $("#uisql3repdata").find("table").show();
                        */
                    } else {

                        $(".tablesorter").tablesorter({
                            theme: "blue",
                            widgets: ['filter', 'resizable'],
                            widgetOptions: {
                                resizable: true,
                                filter_hideFilters: false,
                                filter_ignoreCase: true
                            }
                        }); // so funktioniert es
                    }

                    $(".goprev").show();
                    $(".gonext").show();
                    sysbase.putMessage("Ausgabe ist fertig", 1);
                } else {
                    sysbase.putMessage("Keine Daten gefunden", 3);
                }
                $("body").css("cursor", "default");

                callback30(ret);
                return;
            }
        });
    };

    $(document).on("click", ".uisql3repclick", function (event) {
        event.preventDefault();
        var selfields = {};
        var row = $(this).closest("tr");
        var sqlstmt = $(row).find("td:nth-child(2)").text();
        uisql3rep.parms.tablename = "";
        uisql3rep.parms.sel = sqlstmt;
        uisql3rep.parms.skip = 0;
        uisql3rep.parms.limit = 20;
        $("#uisql3repselstmt").val(sqlstmt);
        $("#uisql3repbsel").click();
    });


    uisql3rep.showclock = function (clockcontainer) {
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
        module.exports = uisql3rep;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return uisql3rep;
        });
    } else {
        // included directly via <script> tag
        root.uisql3rep = uisql3rep;
    }
}());