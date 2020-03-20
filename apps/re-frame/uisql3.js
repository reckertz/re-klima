/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global ecsystem,console,devide,window,module,define,root,global,self */
/*global async */
(function () {
    var uisql3 = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var myidcode = "uisql3";
    var myidhash = "#" + myidcode;

    var newskip = 0;
    var tablename = "";
    var skip = 0;
    var limit = 20;

    var myfields = [];

    uisql3.parms = {
        sel: {},
        sort: [
            ['_id', -1]
        ],
        skip: 0,
        limit: 20,
        tablename: ""
    };




    uisql3.show = function () {
        /**
         * uisql3 - generische Kontrolle Tabellen und JSON-Inhalte
         */
        
        var tsdate = new Date();
        myisoday = new Date(tsdate - tsdate.getTimezoneOffset() * 60 * 1000).toISOString().substr(0, 10);
        $(".content").empty();
        $(".headertitle").html("Database-Control (SQLite3)");
        $(".headertitle").attr("title", "uisql3");
        $(".content").attr("pageid", "uisql3");
        $(".content").attr("id", "uisql3");



        $(".content")
            .append($('<div/>', {
                id: "uisql3",
                css: {
                    overflow: "hidden"
                }
            }));
        $(".headerright").remove();
        $(".header")
            .append($("<div/>", {
                class: "headerright",
                css: {
                    float: "right"
                }
            }));
        // html: "<h3><span id='uisql3HeaderLine'>Kontrolle Tabellen/Collections</span></h3>"
        $(".headerright")
            .append($("<input/>", {
                type: "button",
                value: "Refresh",
                css: {
                    float: "left"
                },
                id: myidcode + "dorefresh",
                myidcode: myidcode,
                //var imgmatrix =
                click: function () {
                    /**
                     * alle Zuweisungen speichern
                     */
                    var newrecord = {};
                    //alert("refresh");
                    uisql3.showuisql3tables(".uisql3table1Liste", function (ret) {});
                }
            }))
            .append($("<input/>", {
                type: "button",
                value: "Prompt",
                css: {
                    float: "left"
                },
                id: myidcode + "doprompt",
                myidcode: myidcode,
                //var imgmatrix =
                click: function () {
                    /**
                     * alle Zuweisungen speichern
                     */
                    $(".uisql3sel").html("");
                    uisql3.showPrompt(" ", function (ret) {

                    });
                }
            }))
            .append($("<input/>", {
                type: "button",
                value: "Anzeige",
                css: {
                    float: "right"
                },
                id: myidcode + "doshow",
                myidcode: myidcode,
                //var imgmatrix =
                click: function () {
                    uisql3.parms.sel = {};
                    var selstring = "";  // WHERE-Bedingung
                    
                    $('#uisql3Table > tbody  > tr').each(function (ind, tr) {
                        var property = $(tr).find("[name='property']").html();
                        var typ = $(tr).find("[name='typ']").text();
                        var operatorT = $(tr).find("[name='operator'] option:selected").text();
                        var operator = $(tr).find("[name='operator'] option:selected").val();
                        var wert = $(tr).find("[name='wert']").val();
                        if (typeof operator === "undefined" || operator.length === 0) {
                            if (typeof wert !== "undefined" && wert.trim().length > 0) {
                                operator = "="; // als Default, wenn es eine Eingabe gibt
                            }
                        }
                        // undefined
                        if (operator === "u") {
                            uisql3.parms.sel[property] = null;
                            if (selstring.length > 0) selstring += " AND ";
                            selstring += " " + property + " = " + "null";
                        }
                        if (typ === "number") {
                            if (operator === "=" || operator === ">=" || operator === "<=") {
                                if (selstring.length > 0) selstring += " AND ";
                                selstring += " " + property + " " + operator + " " + wert;
                            }
                        } else if (typ === "string") {
                            if (operator === "=") {
                                if (selstring.length > 0) selstring += " AND ";
                                selstring += " " + property + " = '" + wert + "'";
                            } else if (operator === "*") {
                                if (selstring.length > 0) selstring += " AND ";
                                selstring += " " + property + " LIKE '%" + wert + "%'";
                            }
                        } else if (typ === "boolean") {
                            if (operator === "=") {
                                var bwert = null;
                                if (wert === "true") bwert = true;
                                if (wert === "false") bwert = false;
                                if (bwert !== null) {
                                    if (selstring.length > 0) selstring += " AND ";
                                    selstring += " " + property + " = " + bwert;
                                }
                            }
                        }
                    });
                    $(".uisql3sel").html(selstring);
                    uisql3.parms.selstring = selstring;
                    // Neue Anzeige
                    uisql3.showDetails(function (ret) {
                        if (ret.error === true) {
                            sysbase.putMessage(ret.message, 3);
                        } else {
                            sysbase.putMessage(ret.message, 0);
                        }
                    });
                }
            }))
            .append($("<span/>", {
                id: "uisql3sel",
                class: "uisql3sel"
            }));
        $("#uisql3")
            .append($('<form/>', {
                    id: myidcode + "content",
                    "data-role": "content",
                    class: "uieform ",
                    css: {
                        "background-color": "",
                        width: "100%",
                        overflow: "hidden"
                    }
                })
                .append($("<div/>", {
                    class: "col1of2 content",
                    id: myidcode + "c1",
                    css: {
                        width: "20%",
                        overflow: "auto",
                        "text-align": "left",
                        float: "left"
                    }
                }))
                .append($("<div/>", {
                    class: "col2of2 content",
                    id: myidcode + "c2",
                    css: {
                        width: "80%",
                        overflow: "auto",
                        "text-align": "left",
                        float: "right"
                    }
                }))

            );

        uisql3.prepare(function () {
            console.log("uisql3 aufgebaut");
            sysbase.initFooter();
        });
    };


    uisql3.gonext = function (event, ui, callback) {
        var username = uihelper.getUsername();
        uisql3.parms.skip += 20;
        uisql3.showDetails(function (ret) {
            if (ret.error === true) {
                sysbase.putMessage(ret.message, 3);
            } else {
                sysbase.putMessage(ret.message, 0);
            }
        });
    };


    uisql3.goprevious = function (event, ui, callback) {
        var username = uihelper.getUsername();
        uisql3.parms.skip -= 20;
        if (uisql3.parms.skip < 0) uisql3.parms.skip = 0;
        uisql3.showDetails(function (ret) {
            if (ret.error === true) {
                sysbase.putMessage(ret.message, 3);
            } else {
                sysbase.putMessage(ret.message, 0);
            }
        });
    };

    /**
     * uisql3.showuisql3tables(target) - Ausgabe Namen aller Tabellen
     * Quelle ist ajax-Call auf den Server
     */
    uisql3.showuisql3tables = function (target, callback) {

        var retmsg = "";
        try {
            $(target).empty();
            /**
             * AJAX holt die Liste als JSON/Array
             */
            uihelper.getAllTables("getsql3tables", function (ret) {
                if (ret.error === true) {
                    ret.message = ret.message || "";
                    $(target)
                        .append($('<li/>', {
                            html: "Keine Tabellen gefunden " + ret.message,
                            class: "uielist",
                            css: {
                                "white-space": "normal",
                                "font-size": "large"
                            }
                        }));
                    callback({
                        error: "Keine Tabellen gefunden",
                        message: "ok"
                    });
                } else if (typeof ret.records === "undefined" || ret.records === null) {
                    $(target)
                        .append($('<li/>', {
                            html: "Keine Tabellen gefunden",
                            class: "uielist",
                            css: {
                                "white-space": "normal"
                            }
                        }));
                    callback({
                        error: "Keine Tabellen gefunden",
                        message: "ok"
                    });
                } else {
                    var tarray = [];
                    for (var i = 0; i < ret.records.length; i++) {
                        var cname = ret.records[i].name;
                        tarray.push({
                            name: cname
                        });
                    }
                    tarray.sort(function (a, b) {
                        if (a.name < b.name)
                            return -1;
                        if (a.name > b.name)
                            return 1;
                        return 0;
                    });
                    for (var i1 = 0; i1 < tarray.length; i1++) {
                        var dname = tarray[i1].name;
                        $(target)
                            .append($('<li/>', {
                                    class: "uielist clickable",
                                    key: dname
                                })
                                .append($("<a/>", {
                                    href: "#",
                                    class: "uielist",
                                    html: dname
                                }))
                            );
                        //	}
                    }
                    callback({
                        error: false,
                        message: "ok"
                    });
                }
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

    uisql3.showDetails = function (callback) {
        // UI Vorbereiten
        $("#" + myidcode + "c2").empty();
        $("#" + myidcode + "c2")
            .append($("<ul/>", {
                id: "uisql3Liste",
                class: "uisql3Liste",
            }));

        var api = "getallsqlrecords";
        var table = uisql3.parms.table;
        var skip = uisql3.parms.skip;
        if (skip < 0) skip = 0;
        var limit = uisql3.parms.limit;
        var sel = uisql3.parms.sel;
        var sort = uisql3.parms.sort;
        var sqlselect = "SELECT * FROM " + table;
        var where = uisql3.parms.selstring || "";
        if (where.length > 0) {
            sqlselect += " WHERE " + where;
        }
        sqlselect += " ORDER BY tsserverupd";  // + " LIMIT 10 OFFSET 0";
        // var sort = [];
        uihelper.getAllRecords(sqlselect, {}, sort, skip, limit, api, table, function (ret) {
            var irec = skip;
            var ifirst = true;
            if (ret.error === false) {
                //for (var i = 0; i < ret.records.length; i++) {
                //	var record = ret.records[i];
                var ifield = 0;
                for (var property in ret.records) {
                    if (ret.records.hasOwnProperty(property)) {
                        // do stuff
                        var record = ret.records[property];
                        if (ifirst === true) {
                            ifirst = false;
                            $("#uisql3Liste").empty();
                            firstrecord = $.extend({}, record);
                        }
                        irec++;
                        // do stuff
                        var msg = "<span style='background-color:yellow' width='100%'>Satz:" + irec + " " + table + "</span>";
                        //msg += '<a data-mini="true" href="#" title="Satz l�schen" class="ui-btn ui--shadow ui-mini ui-corner-all ui-btn-icon-notext ui-icon-delete uisql3del" style="float: left;"></a>';
                        msg += '<a href="#" class="uisql3del">Löschen</a>';
                        /** 
                         * Optimierung der Darstellung
                         */
                        for (fieldname in record) {
                            if (record.hasOwnProperty(fieldname)) {
                                var fieldvalue = record[fieldname];
                                if (typeof fieldvalue === "string" && fieldvalue.length > 50) {
                                    var feld = "";
                                    ifield++;
                                    feld += fieldvalue.substr(0, 50);
                                    feld += "<a href='#' onclick=\" $('.toggleme" + ifield + "').toggle();\" class='toggleme"+ ifield + "'>mehr</a>";
                                    feld += "<a href='#' onclick=\" $('.toggleme" + ifield + "').toggle();\" class='toggleme" + ifield + "' style='display:none'>weniger</a>";
                                    feld += "<span class='toggleme" + ifield + "' style='display:none'>";
                                    feld += fieldvalue.substr(50);
                                    feld += "</span>";
                                    record[fieldname] = feld;
                                }
                            }
                        }
                        msg += "<br/>" + uihelper.iterateJSON2pretty(record, "", "") + "<br><br>";
                        // msg += "<br/>" + uihelper.iterateJSON2HTML(record, "", "") + "<br><br>";
                        if (irec === 1) {
                            // Feldanalyse 
                            myfields = [];
                            uisql3.getFields(record, myfields, 0, "");
                            console.log(JSON.stringify(myfields));
                        }
                        $("#uisql3Liste")
                            .append($('<li/>', {
                                    class: "uielist",
                                    css: {
                                        "white-space": "normal"
                                    },
                                    key: record._id,
                                    tablename: uisql3.parms.table
                                })
                                .append($("<span/>", {
                                    class: "uielist",
                                    html: "Satz:" + irec + " " + table + "&nbsp;&nbsp;"
                                }))
                                .append($("<a/>", {
                                    href: "#",
                                    class: "uisql3del uielist",
                                    html: "Satz löschen",
                                    click: function () {
                                        var that = this;
                                        uisql3.deleteOneRecord(that);
                                    }
                                }))
                                .append($("<span/>", {
                                    class: "uielist",
                                    html: "<br/>" + uihelper.iterateJSON2pretty(record, "", "") + "<br><br>"
                                    // html: "<br/>" + uihelper.iterateJSON2HTML(record, "", "") + "<br><br>"

                                }))
                            );
                    }
                }
                var msg1 = "OK";
                if (irec === skip) {
                    // keine Sätze gefunden
                    if (skip === 0) {
                        msg1 = ret.message;
                    }
                    uisql3.parms.skip = skip - uisql3.parms.limit;
                }
                $(".goprev").show();
                $(".gonext").show();
                callback({
                    error: false,
                    message: msg1,
                    irec: irec
                });
            } else {
                callback({
                    error: true,
                    message: ret.message
                });
            }
        });
    };

    uisql3.getFields = function (obj, res, dis, root) {
        var dotted = dotize.convert(obj);
        var dottedfieldnames = Object.keys(dotted);
        var newrecord = {};
        for (var ifield = 0; ifield < dottedfieldnames.length; ifield++) {
            var fieldname = dottedfieldnames[ifield];
            // entfernen Einträge in [] uns setzen Punkt stattdessen
            var newfieldname = fieldname.replace(/(\[.+\])/g, '');
            if (fieldname !== newfieldname) console.log(newfieldname);
            if (typeof newrecord[newfieldname] === "undefined") {
                newrecord[newfieldname] = dotted[fieldname];
                res.push({
                    name: newfieldname,
                    type: typeof dotted[fieldname],
                    value: dotted[fieldname]
                });
            }
        }
    };



    uisql3.getFieldsOld = function (obj, res, dis, root) {
        try {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (property === "history") {
                        var x = 1;
                    }
                    if (typeof obj[property] === "object") {
                        // Rekursion nur, wenn nicht leer
                        if (Object.keys(obj[property]).length === 0) {
                            continue;
                        }
                        if (root.length > 0) root += ".";
                        root += property;
                        if (Array.isArray(obj[property])) {
                            // nur [0] auswerten!!!
                            var a = 1;
                            var nextobj = obj[property][0];
                            if (typeof nextobj !== "object") {
                                myfields.push({
                                    name: root,
                                    type: typeof nextobj,
                                    value: nextobj
                                });
                                var ilast = root.lastIndexOf(".");
                                if (ilast > 0) {
                                    root = root.substr(0, ilast);
                                } else {
                                    root = "";
                                }
                                ilast = root.lastIndexOf(".");
                                if (ilast > 0) {
                                    root = root.substr(0, ilast);
                                }
                                continue;
                            } else {
                                res = uisql3.getFields(nextobj, res, dis, root);
                                var ilast = root.lastIndexOf(".");
                                if (ilast > 0) {
                                    root = root.substr(0, ilast);
                                } else {
                                    root = "";
                                }
                                ilast = root.lastIndexOf(".");
                                if (ilast > 0) {
                                    root = root.substr(0, ilast);
                                }
                            }
                        } else {
                            res = uisql3.getFields(obj[property], res, dis, root);
                            var ilast = root.lastIndexOf(".");
                            if (ilast > 0) {
                                root = root.substr(0, ilast);
                            }
                        }
                    } else {
                        var newfield = property;
                        if (root.length > 0) newfield = root + "." + property;
                        // Prüfen, ob schon da
                        var ifound = false;
                        for (var i = 0; i < myfields.length; i++) {
                            if (myfields[i].name === newfield) {
                                ifound = true;
                                break;
                            }
                        }
                        if (ifound === false) {
                            var value = "";
                            if (typeof obj[property] === "string" && obj[property].length > 50) {
                                value = obj[property].substr(0, 50);
                            } else {
                                value = "" + obj[property];
                            }
                            myfields.push({
                                name: newfield,
                                type: typeof obj[property],
                                value: value
                            });
                        }
                    }
                }
            }
        } catch (err) {
            res += "***ERROR***" + err;
        }
        return res;
    };

    uisql3.showPrompt = function (username, callback) {
        var sel = uisql3.parms.sel;
        $("#" + myidcode + "c2").empty();
        $("#" + myidcode + "c2")
            .append($("<table/>", {
                id: "uisql3Table",
                class: "uisql3Table"
            }));
        $(".uisql3Table").empty();
        $("#uisql3Table")
            .append($("<thead/>"))
            .append($("<tbody/>"));

        var irow = 0;
        for (var i = 0; i < myfields.length; i++) {
            // do stuff
            var myfield = myfields[i];
            irow++;
            var icol = 0;
            var rowid = "uisql3Table" + irow;
            $("#uisql3Table tbody")
                .append($("<tr/>", {
                        id: rowid
                    })
                    .append($("<td/>", {
                        html: irow
                    }))
                );
            // immer Name
            icol++;
            $("#uisql3Table tbody tr:last")
                .append($("<td/>", {
                    html: myfield.name,
                    name: "property"
                }));

            icol++;
            $("#uisql3Table tbody tr:last")
                .append($("<td/>", {
                    html: myfield.type,
                    name: "typ"
                }));
            /**
             * Selektionstyp/-Vorgabe
             * hier wird es spannend, abhängig vom Typ
             * werden unterschiedliche Selektionsoperationen angeboten
             * string: =, enthält, Werteliste
             * number: =, >=, <=
             * boolean: true, false, egal
             * date: nicht unterstützt, weil nicht wirklich native in der Datenbank
             */
            var typ = myfield.type;
            if (typ === "undefined" || typ === "object") {
                icol++;
                $("#uisql3Table tbody tr:last")
                    .append($("<td/>", {
                        html: "&nbsp;"
                    }));
            } else if (typ === "string") {
                $("#uisql3Table tbody tr:last")
                    .append($("<td/>")
                        .append($('<select/>', {
                                "data-mini": true,
                                name: "operator",
                                id: "uisql3Table" + irow + "sel"
                            })
                            .append($("<option/>", {
                                value: "",
                                text: "keine Vorgabe"
                            }))
                            .append($("<option/>", {
                                value: "=",
                                text: "gleich"
                            }))
                            .append($("<option/>", {
                                value: "*",
                                text: "enthält"
                            }))
                            .append($("<option/>", {
                                value: "#",
                                text: "Werteliste mit ;"
                            }))
                            .append($("<option/>", {
                                value: "u",
                                text: "undefined/null"
                            }))

                        )
                    );
            } else if (typ === "number") {
                icol++;
                $("#uisql3Table tbody tr:last")
                    .append($("<td/>")
                        .append($('<select/>', {
                                "data-mini": true,
                                name: "operator",
                                id: "uisql3Table" + irow + "sel"
                            })
                            .append($("<option/>", {
                                value: "",
                                text: "keine Vorgabe"
                            }))
                            .append($("<option/>", {
                                value: "=",
                                text: "gleich, Dezimalpunkt"
                            }))
                            .append($("<option/>", {
                                value: ">=",
                                text: ">=, Dezimalpunkt"
                            }))
                            .append($("<option/>", {
                                value: "#",
                                text: "Werteliste mit ; Dezimalpunkt"
                            }))
                        )
                    );
            } else if (typ === "boolean") {
                icol++;
                $("#uisql3Table tbody tr:last")
                    .append($("<td/>")
                        .append($('<select/>', {
                                "data-mini": true,
                                name: "operator",
                                id: "uisql3Table" + irow + "sel"
                            })
                            .append($("<option/>", {
                                value: "",
                                text: "keine Vorgabe"
                            }))
                            .append($("<option/>", {
                                value: "=",
                                text: "gleich"
                            }))
                        )
                    );
            } else {
                icol++;
                $("#uisql3Table tbody tr:last")
                    .append($("<td/>", {
                        html: "&nbsp;"
                    }));
            }
            /**
             * Eingabefeld
             */
            if (typ !== "undefined" && typ !== "object") {
                icol++;
                $("#uisql3Table tbody tr:last")
                    .append($("<td/>")
                        .append($("<input/>", {
                            name: "wert",
                            id: "I" + irow + "C" + icol,
                            type: "text",
                            placeholder: myfield.value,
                            value: ""
                        }))
                    );
            } else {
                icol++;
                $("#uisql3Table tbody tr:last")
                    .append($("<td/>", {
                        html: "&nbsp;"
                    }));
            }
        }

        callback({
            error: false,
            message: "OK",
        });

    };



    /**
     * Ausführung pagebeforechange aus app.js event
     * feststellen COREADER Erlaubnisse
     * FlyIn Menue dazu, bei 1. Mail einblenden, sonst mit Pulldown click rechts
     * dann gefiltert anzeiten
     */
    uisql3.prepare = function (callback) {
        console.log("start prepare");
        var username = uihelper.getUsername();
        console.log("uisql3-SELF-started");

        $("#" + myidcode + "c1")
            .append($("<ul/>", {
                id: "uisql3table1Liste",
                class: "uisql3table1Liste"
            }));
        $("#" + myidcode + "c2")
            .append($("<ul/>", {
                id: "uisql3Liste",
                class: "uisql3Liste"
            }));
        newskip = 0;
        uisql3.showuisql3tables(".uisql3table1Liste", function (ret) {
            /**
             * Detailanzeige aus der Liste
             */
            $(".uisql3table1Liste").on("click", "li", function (evt) {
                evt.preventDefault();
                // in key ist username von USER oder coreader
                $(".uisql3sel").html("");
                console.log("uisql3table1Liste.clicked");
                if ($(this).attr("key")) {
                    var key = $(this).attr("key");
                    if (key !== null && key.length > 0) {
                        $("#" + myidcode + "c2").empty();
                        $("#" + myidcode + "c2")
                            .append($("<ul/>", {
                                id: "uisql3Liste",
                                class: "uisql3Liste"
                            }));
                        $(".uisql3Liste").empty();
                        uisql3.parms.table = key;
                        uisql3.parms.sel = {};
                        uisql3.showDetails(function (ret) {
                            if (ret.error === true) {
                                sysbase.putMessage(ret.message, 3);
                            } else {
                                sysbase.putMessage(ret.message, 0);
                            }
                        });
                    }
                }
                callback(null);
                return;
            });
            console.log("uisql3-SELF-ended");
        });
    };


    uisql3.deleteOneRecord = function (that) {

        var key = $(that).closest("li").attr("key");
        var tablename = $(that).closest("li").attr("tablename");

        /**
         * Popup Prompt zur Bestätigung des Löschens
         */
        var username = uihelper.getUsername();

        var popschema = {
            entryschema: {
                tablename: {
                    title: "Tabelle",
                    type: "string", // currency, integer, datum, text, key
                    class: "uietext",
                    default: "",
                    io: "o"
                },
                key: {
                    title: "Primärkey",
                    type: "string", // currency, integer, datum, text, key
                    class: "uietext",
                    default: "",
                    io: "o"
                }
            }
        };
        var poprecord = {
            tablename: tablename,
            key: key
        };
        var anchorHash = "#uisql3";
        var title = "Satz löschen";
        var position = {};
        /*
        position.left = $(this).position().left;
        position.left -= $(myidhash).find(".popup").outerWidth();
        position.top = $(this).position().top;
        position.top += $(this).outerHeight() + 5;
        */
        //uientry.inputDialogX = function (container, position, title, schema, record, callback) {

        $(document).on('popupok', function (evt, extraParam) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            //This code runs when the event is triggered
            // https://stackoverflow.com/questions/9584892/can-you-set-event-data-with-jquery-trigger
            console.log(extraParam);


        });
        uientry.inputDialogX(anchorHash, position, title, popschema, poprecord, function (ret) {
            if (ret.error === false) {
                var sel = {
                    recid: key
                };
                var api = "delonerecord";
                var table = tablename;
                var record = {};
                $("body").css("cursor", "progress");
                uihelper.delOneRecord(sel, api, table, record, function (ret) {
                    if (ret.error === false) {
                        // record upserted
                        sysbase.putMessage("delOneRecord:" + ret.message, 1);
                        console.log("delOneRecord:" + key + " erledigt");
                        $(that).html(" Satz wurde gelöscht");
                        $(that).removeAttr('href');
                    } else {
                        sysbase.putMessage("delOneRecord:" + ret.message, 3);
                    }
                    $("body").css("cursor", "default");
                });
            }
        });
    };



    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = uisql3;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return uisql3;
        });
    } else {
        // included directly via <script> tag
        root.uisql3 = uisql3;
    }
}());