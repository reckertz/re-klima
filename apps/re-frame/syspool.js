/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global sysbase,IDBCursor,tageliste,uihelper,ecsystem,console,devide,window,module,define,root,global,self,uientry */
/*global async,CKEDITOR,uisystem, */
(function () {
    "use strict";
    var syspool = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global || this;

    var syspoololdrecs = 0;
    var activeKeytype = "";

    var keytypes = {};

    var schema = {
        entryschema: {
            keydata: {
                title: "Schlüsselvorgaben",
                description: "",
                type: "object", // currency, integer, datum, text, key, object
                class: "uiefieldset",
                width: "90%",
                properties: {
                    keytype: {
                        title: "Typ",
                        type: "string",
                        class: "uietext",
                        io: "o"
                    },
                    isactive: {
                        title: "aktiv",
                        type: "string",
                        class: "uietext",
                        io: "o"
                    },
                    key: {
                        title: "Schlüsselwert",
                        type: "string",
                        class: "uietext",
                        io: "o"
                    },
                    name: {
                        title: "Name",
                        type: "string",
                        class: "uietext",
                        io: "i"
                    },
                    description: {
                        title: "Bezeichnung",
                        type: "string",
                        class: "uietext",
                        io: "i"
                    }
                }
            }
        }
    };

    var typschema = {
        parms: {
            title: "Konfigurationsparameter",
            description: "",
            type: "object", // currency, integer, datum, text, key
            class: "uiefieldset",
            width: "90%",
            properties: {
                adminedBy: {
                    title: "Verwaltet durch andere Anwendung",
                    type: "string",
                    class: "uietext",
                    io: "i"
                },
                usertype: {
                    title: "Notwendiger Benutzertyp",
                    type: "string",
                    class: "uieselectinput",
                    enum: [
                        "S",
                        "U",
                        "-"
                    ],
                    io: "i"
                }
            }
        }
    };

    var keytypeschema = {};



    var record = {};
    var initrecord = {};

    syspool.show = function (parameters, navigatebucket) {
        if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {

        }
        console.log("show");
        $(".headertitle").html("Key-Master");
        /**
         * syspool - Verwaltung Schlüssel Split-Screen mit Listpanel und Entrypanel
         */
        var ret;
        $(".content").empty();
        $(".content")
            .append($("<div/>", {
                id: 'syspool'
            }));

        $(".content")
            .append($("<input/>", {
                type: "hidden",
                id: "syspool_isdirty",
                value: "false"
            }));

        sysbase.putHeaderRight();
        // class: "headerrightList" - zufügen li Zeilen
        // 

        $(".headerrightList")
            .prepend($("<li/>", {
                class: "dropdown-menuepoint",
                html: "Neue Schlüsseldefinition",
                click: function () {
                    $("#syspool_isdirty").val("true");
                    sysbase.putMessage("Neuer Schlüssel wurde aufgerufen");
                    // sicherstellen, dass alle Ergebnisse übernommen sind
                    // das form "syspoolentrypanel" hält die Eingaben
                    record = {};
                    $("#syspoolentrypanel").empty();
                    activeKeytype = "KEYTYPE";
                    if (activeKeytype === "" || activeKeytype === "KEYTYPE") {
                        activeKeytype = "KEYTYPE";
                        record.keytype = activeKeytype;
                        keytypeschema.entryschema.keydata.properties.key.io = "i";
                        uientry.getSchemaUI("syspool", keytypeschema, "syspool", "syspoolentrypanel", function (ret) {
                            if (ret.error === false) {
                                sysbase.putMessage("syspool" + " aufgebaut", 0);
                                $("#syspoolparmsdiv").css({
                                    width: "90%"
                                });
                                uientry.fromRecord2UI($("#syspoolentrypanel"), record, keytypeschema);
                                syspool.putStoreButton("#syspoolentrypanel");
                            } else {
                                sysbase.putMessage("syspool" + " NICHT aufgebaut", 3);
                            }
                        });
                    } else {
                        record.keytype = activeKeytype;
                        schema.entryschema.keydata.properties.key.io = "i";
                        uientry.getSchemaUI("syspool", schema, "syspool", "syspoolentrypanel", function (ret) {
                            if (ret.error === false) {
                                sysbase.putMessage("syspool" + " aufgebaut", 0);
                                // auch im UI keytype anzeige als Ausgabefeld
                                uientry.fromRecord2UI($("#syspoolentrypanel"), record, schema);
                                syspool.putStoreButton("#syspoolentrypanel");
                            } else {
                                sysbase.putMessage("syspool" + " NICHT aufgebaut", 3);
                            }
                        });
                    }
                }
            }));


        $(".headerrightList")
            .prepend($("<li/>", {
                class: "dropdown-menuepoint",
                html: "Neuer Schlüsselwert",
                click: function () {
                    $("#syspool_isdirty").val("true");
                    sysbase.putMessage("Neuer Schlüssel wurde aufgerufen");
                    // sicherstellen, dass alle Ergebnisse übernommen sind
                    // das form "syspoolentrypanel" hält die Eingaben
                    record = {};
                    $("#syspoolentrypanel").empty();
                    if (activeKeytype === "" || activeKeytype === "KEYTYPE") {
                        activeKeytype = "KEYTYPE";
                        record.keytype = activeKeytype;
                        keytypeschema.entryschema.keydata.properties.key.io = "i";
                        uientry.getSchemaUI("syspool", keytypeschema, "syspool", "syspoolentrypanel", function (ret) {
                            if (ret.error === false) {
                                sysbase.putMessage("syspool" + " aufgebaut", 0);
                                $("#syspoolparmsdiv").css({
                                    width: "90%"
                                });
                                uientry.fromRecord2UI($("#syspoolentrypanel"), record, keytypeschema);
                            } else {
                                sysbase.putMessage("syspool" + " NICHT aufgebaut", 3);
                            }
                        });
                    } else {
                        record.keytype = activeKeytype;
                        schema.entryschema.keydata.properties.key.io = "i";
                        uientry.getSchemaUI("syspool", schema, "syspool", "syspoolentrypanel", function (ret) {
                            if (ret.error === false) {
                                sysbase.putMessage("syspool" + " aufgebaut", 0);
                                // auch im UI keytype anzeige als Ausgabefeld
                                uientry.fromRecord2UI($("#syspoolentrypanel"), record, schema);
                                syspool.putStoreButton("#syspoolentrypanel");

                            } else {
                                sysbase.putMessage("syspool" + " NICHT aufgebaut", 3);
                            }
                        });
                    }
                }
            }));



        $(".content")
            .append($('<div/>', {
                    id: 'syspoolContent',
                    class: "col1of1 separator"
                })
                .append($("<div/>", {
                    id: "syspoolT1",
                    class: "col1of3 content",
                    css: {
                        width: "15%"
                    }
                }))
                .append($("<div/>", {
                    id: "syspoolT2",
                    class: "col2of3 content",
                    css: {
                        width: "25%"
                    }
                }))
                .append($("<div/>", {
                    id: "syspoolT3",
                    class: "col3of3 content",
                    css: {
                        width: "55%"
                    }
                }))
            );



        /**
         * Tabs über Entrypanel - "Grosscontainer"
         */
        $("#syspoolT3")
            .append($('<div/>', {
                    id: "syspoolentrypanelwrapper",
                    class: "content",
                    css: {
                        "margin-left": "10px",
                        width: "90%",
                        display: "inline-block"
                    }
                })
                .append($('<form/>', {
                    id: "syspoolentrypanel",
                    class: "uieform"
                }))
            );

        $("#syspoolContent")
            .append($("<div/>", {
                id: "syspooltmp",
                style: "display:none"
            })); // hierarchische Struktur - aus 



        keytypeschema = {};
        keytypeschema = $.extend(true, {}, schema);
        keytypeschema.entryschema.parms = $.extend(true, {}, typschema.parms);

        $("#syspoolblockawrapper").empty();
        async.waterfall([
            function (callback) {
                uihelper.modulecheck("uientry", function (ret) {
                    if (ret && ret.error === true) {
                        sysbase.putMessage(ret.message, 3);
                        callback(null, ret);
                        return;
                    } else {
                        callback(null, {
                            error: false,
                            message: "OK"
                        });
                        return;

                    }
                });
            },
            function (ret, callback) {
                // füllen der enum-Bereiche in den Metadaten
                // jetzt die Daten für Editierung aufbereiten
                uientry.getSchemaUI("syspool", schema, "syspool", "syspoolentrypanel", function (ret) {
                    if (ret.error === false) {
                        sysbase.putMessage("syspool" + " aufgebaut", 0);
                    } else {
                        sysbase.putMessage("syspool" + " NICHT aufgebaut", 3);
                    }
                    callback(null, null);
                    return;
                });
            },
            function (ret, callback) {
                syspool.getAllKeytypes(function () {
                    $("#syspoolentrypanel").empty();
                    callback(null, ret);
                });
            },
            function (ret, callback) {
                /**
                 * hier muss data in die Tabelle übernommen werden
                 */
                callback(null, null);
                return;
            }
        ]);
        sysbase.initFooter();
    };

    syspool.getAllKeytypes = function (callback) {
        /**
         * Die keytypes anzeigen
         */
        var sel = {};
        var projection = {
            keytype: 1,
            key: 1,
            parms: 1
        };
        var sort = {
            keytype: 1,
            key: 1
        };
        var skip = 0;
        var limit = 0;
        var api = "getallrecords";
        var table = "CFEPOOL";
        record = {};
        var definedkeytypes = [];
        var availablekeytypes = {};
        $("#syspoolT1").empty();
        keytypes = {};
        uihelper.getAllRecords(sel, projection, sort, skip, limit, api, table, function (ret) {
            var html = ret.message;
            var irec = 0;
            $("#syspoolT1")
                .append($("<ul/>", {
                    class: "syspoollist1"
                }));
            var vglkeytype = "";
            var count = 0;

            for (var property in ret.records) {
                if (ret.records.hasOwnProperty(property)) {
                    // do stuff
                    irec++;
                    var record = ret.records[property];
                    if (record.keytype === "KEYTYPE") {
                        definedkeytypes.push(record.key);
                        try {
                            if (typeof keytypes[record.key] === "undefined" && typeof record.parms.adminedBy !== "undefined") {
                                keytypes[record.key] = {};
                                keytypes[record.key].adminedBy = record.parms.adminedBy;
                            }
                        } catch (err) {}
                    }
                    if (record.keytype !== vglkeytype) {
                        if (vglkeytype !== "") {
                            var html = vglkeytype + " " + count;
                            availablekeytypes[vglkeytype] = {};
                            availablekeytypes[vglkeytype].count = count;
                            $(".syspoollist1")
                                .append($("<li/>", {
                                    html: html,
                                    keytype: vglkeytype,
                                    class: "syspoolli1"
                                }));
                        }
                        vglkeytype = record.keytype;
                        count = 0;
                    }
                    count++;
                }
            }
            if (vglkeytype !== "") {
                var html = vglkeytype + " " + count;
                availablekeytypes[vglkeytype] = {};
                availablekeytypes[vglkeytype].count = count;
                $(".syspoollist1")
                    .append($("<li/>", {
                        html: html,
                        keytype: vglkeytype,
                        class: "syspoolli1"
                    }));
            }
            // zum Erfassen anzeigen
            for (var i = 0; i < definedkeytypes.length; i++) {
                var kt = definedkeytypes[i];
                if (typeof availablekeytypes[kt] === "undefined" || availablekeytypes[kt].count === 0) {
                    html = kt + " 0";
                    $(".syspoollist1")
                        .append($("<li/>", {
                            html: html,
                            keytype: kt,
                            class: "syspoolli1"
                        }));
                }
            }
            if (irec === 0) {
                sysbase.putMessage("keine Schlüssel gefunden", 3);
            }
            callback();
        });
    };

    syspool.getAllKeys = function (keytype, callback) {
        /**
         * Die Daten des ausgewählte keytype anzeigen
         */
        var sel = {
            keytype: keytype
        };
        var projection = {
            keytype: 1,
            isactive: 1,
            key: 1,
            name: 1
        };
        var sort = {
            keytype: 1,
            key: 1
        };
        var skip = 0;
        var limit = 0;
        var api = "getallrecords";
        var table = "CFEPOOL";
        record = {};
        $("#syspoolT2").empty();
        $("#syspoolentrypanel").empty();
        uihelper.getAllRecords(sel, projection, sort, skip, limit, api, table, function (ret) {
            var html = ret.message;
            var irec = 0;
            $("#syspoolT2")
                .append($("<div/>", {})
                    .append($("<ul/>", {
                        class: "syspoollist list-view",
                        "data-role": "listview"
                    }))
                );
            for (var property in ret.records) {
                if (ret.records.hasOwnProperty(property)) {
                    // do stuff
                    irec++;
                    var record = ret.records[property];
                    var html = record.key;
                    if (typeof record.name !== "undefined" && record.key !== record.name) {
                        html += " " + record.name;
                    }
                    schema.entryschema.keydata.properties.key.io = "o";
                    keytypeschema.entryschema.keydata.properties.key.io = "o";

                    if (typeof record.isactive !== "undefined" && record.isactive === "false") {
                        $(".syspoollist")
                            .append($("<li/>", {
                                html: html,
                                keytype: record.keytype,
                                key: record.key,
                                css: {
                                    "background-color": "mistyrose"
                                }
                            }));
                    } else {
                        $(".syspoollist")
                            .append($("<li/>", {
                                html: html,
                                keytype: record.keytype,
                                key: record.key,
                                class: "syspoolli"
                            }));
                    }
                }
            }
            if (irec === 0) {
                sysbase.putMessage("keine Schlüsselwerte gefunden", 3);
            }
            callback();
        });

    };

    syspool.putStoreButton = function (panelid) {
        $(panelid)
            .append($("<button/>", {
                html: "Speichern",
                click: function (evt) {
                    $("#syspool_isdirty").val("true");
                    sysbase.putMessage("Speichern wurde aufgerufen");
                    // sicherstellen, dass alle Ergebnisse übernommen sind
                    // das form "syspoolentrypanel" hält die Eingaben
                    var outrec = {};
                    if (activeKeytype === "" || activeKeytype === "KEYTYPE") {
                        outrec = uientry.fromUI2Record("#syspoolentrypanel", outrec, keytypeschema);
                    } else {
                        outrec = uientry.fromUI2Record("#syspoolentrypanel", outrec, schema);
                    }
                    console.log(JSON.stringify(outrec, null, " "));
                    outrec.keydata.isactive = "true"; // true oder false wenn gelöscht
                    uihelper.setHistoryEntry(outrec, "Änderung Schlüsseldaten", "syspool");

                    var selfields = {
                        keytype: outrec.keydata.keytype,
                        key: outrec.keydata.key
                    };
                    var updfields = {
                        "$setOnInsert": {
                            keytype: outrec.keydata.keytype,
                            key: outrec.keydata.key,
                        },
                        "$set": {
                            name: outrec.keydata.name,
                            description: outrec.keydata.description
                        }
                    };
                    if (outrec.keytype === "KEYTYPE") {
                        updfields["$set"].parms = outrec.parms;
                    }
                    var api = "setonerecord";
                    var table = "CFEPOOL";
                    uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                        if (ret.error === false) {
                            sysbase.putMessage(ret.message, 1);
                            syspool.getAllKeys(outrec.keytype, function (ret) {

                            });
                        } else {
                            sysbase.putMessage(ret.message, 3);
                            // record: feedback.value
                        }
                    });
                }
            }));
    };


    syspool.putDeleteButton = function (panelid) {
        /**
         * Löschen und weiter im Dialog (isactive)
         */
        $(panelid)
            .append($("<button/>", {
                id: "syspoolinactivate",
                html: "Löschen",
                click: function (evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    $("#syspool_isdirty").val("true");
                    /**
                     * Holen Daten aus dem UI
                     */
                    var outrec = {};
                    if (activeKeytype === "" || activeKeytype === "KEYTYPE") {
                        outrec = uientry.fromUI2Record("#syspoolentrypanel", outrec, keytypeschema);
                    } else {
                        outrec = uientry.fromUI2Record("#syspoolentrypanel", outrec, schema);
                    }
                    /**
                     * Popup Prompt zur Bestätigung des Löschens
                     */
                    var username = uihelper.getUsername();
                    var popschema = {
                        entryschema: {
                            keytype: {
                                title: "Typ",
                                type: "string", // currency, integer, datum, text, key
                                class: "uietext",
                                default: "",
                                io: "o"
                            },
                            key: {
                                title: "Schlüssel",
                                type: "string", // currency, integer, datum, text, key
                                class: "uietext",
                                default: "",
                                io: "i"
                            },
                            name: {
                                title: "Name",
                                type: "string", // currency, integer, datum, text, key
                                class: "uietext",
                                default: "",
                                io: "o"
                            },
                            description: {
                                title: "Beschreibung",
                                type: "string", // currency, integer, datum, text, key
                                class: "uietext",
                                default: "",
                                io: "o"
                            }
                        }
                    };
                    var poprecord = {};

                    poprecord.keytype = outrec.keytype;
                    poprecord.key = outrec.key;
                    poprecord.name = outrec.name;
                    poprecord.description = outrec.description;

                    var anchorHash = "#syspool";
                    var title = "CFEPOOL Satz löschen";
                    var pos = {};
                    uientry.inputDialogX(anchorHash, pos, title, popschema, poprecord, function (ret) {
                        if (ret.error === false) {
                            outrec.isactive = "false"; // true oder false wenn gelöscht
                            uihelper.setHistoryEntry(outrec, "Löschen Schlüsseldaten", "syspool");
                            var selfields = {
                                keytype: outrec.keytype,
                                key: outrec.key
                            };
                            var updfields = {
                                "$set": {
                                    isactive: "false"
                                }
                            };
                            var api = "setonerecord";
                            var table = "CFEPOOL";
                            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                                if (ret.error === false) {
                                    syspool.getAllKeys(outrec.keytype, function (ret) {
                                        sysbase.putMessage("gelöscht", 1);
                                    });
                                } else {
                                    sysbase.putMessage(ret.message, 3);
                                    // record: feedback.value
                                }
                            });
                        } else {
                            sysbase.putMessage("nicht gelöscht", 1);
                        }
                    });
                }
            }));


    };

    /*
    $(window).resize(function () {
        var hh = $(".ui-page-active .ui-header").outerHeight();
        var fh = $(".ui-page-active .ui-footer").outerHeight();
        var wh = $.mobile.getScreenHeight();
        $(".content").height(wh - hh - fh - 1);
        $(".content").css("overflow", "auto");
    });
    */

    /**
     * Auswahl eines li-Elementes - keytype zu key-Liste
     * und Anzeige aller key zu keytype
     */
    $(document).on("click", ".syspoolli1", function (event) {
        var keytype = $(this).attr("keytype");
        /**
         * Prüfen auf Fremdanwendung adminedBy
         */
        var adminedBy = "";
        if (typeof keytypes[keytype] !== "undefined" && typeof keytypes[keytype].adminedBy !== "undefined") {
            adminedBy = keytypes[keytype].adminedBy;
        }

        if (typeof adminedBy !== "undefined" && adminedBy.length > 0) {
            // TODO - muss umgestellt werden, ist so kompliziert nicht notwendig
            uihelper.pagechange("#" + adminedBy, {});
            return;
        } else {
            activeKeytype = keytype;
            syspool.getAllKeys(keytype, function (ret) {
                return;
            });
        }
    });





    /**
     * Auswahl eines li-Elementes - key zu Edit-Window
     */
    $(document).on("click", ".syspoolli", function (event) {
        var keytype = $(this).attr("keytype");
        var key = $(this).attr("key");
        var sel = {
            keytype: keytype,
            key: key
        };
        var projection = {};
        var api = "getonerecord";
        var table = "CFEPOOL";
        uihelper.getOneRecord(sel, projection, api, table, function (ret) {
            var record = ret.record;
            // etwas aufwändige Art, zu initialisieren
            $("#syspoolentrypanel").empty();
            if (record.keytype !== "KEYTYPE") {
                uientry.getSchemaUI("syspool", schema, "syspool", "syspoolentrypanel", function (ret) {
                    if (ret.error === false) {
                        sysbase.putMessage("syspool" + " aufgebaut", 0);
                        uientry.fromRecord2UI($("#syspoolentrypanel"), record, schema);
                        syspool.putStoreButton("#syspoolentrypanel");
                        syspool.putDeleteButton("#syspoolentrypanel");
                    } else {
                        sysbase.putMessage("syspool" + " NICHT aufgebaut", 3);
                    }
                });
            } else {
                uientry.getSchemaUI("syspool", keytypeschema, "syspool", "syspoolentrypanel", function (ret) {
                    if (ret.error === false) {
                        sysbase.putMessage("syspool" + " aufgebaut", 0);
                        $("#syspoolparmsdiv").css({
                            width: "90%"
                        });
                        uientry.fromRecord2UI($("#syspoolentrypanel"), record, keytypeschema);
                        syspool.putStoreButton("#syspoolentrypanel");
                        syspool.putDeleteButton("#syspoolentrypanel");
                    } else {
                        sysbase.putMessage("syspool" + " NICHT aufgebaut", 3);
                    }
                });
            }
        });
    });


    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = syspool;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return syspool;
        });
    } else {
        // included directly via <script> tag
        root.syspool = syspool;
    }
}());