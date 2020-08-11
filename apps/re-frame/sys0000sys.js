/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper */
(function () {
    "use strict";
    var sys0000sys = {};
    // test
    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    var md5 = require("md5");
    var path = require("path");
    var fs = require("fs");
    var async = require("async");
    var readline = require("readline");
    var stream = require("stream");
    var request = require("request");
    var htmlparser2 = require("htmlparser2");
    var download = require("download-file");
    var csv = require("fast-csv");
    var kli9010srv = require("re-klima/kli9010srv");
    var kla9020fun = require("re-klima/kla9020fun");
    var uihelper = require("re-frame/uihelper");
    var sysbase = require("re-frame/sysbase");

    var gblInfo = {};
    var sorcount = 0;
    var perftimer = {};
    perftimer.sor = {};
    sys0000sys.getInfo = function () {
        return gblInfo;
    };


    /**
     * Holen einen record aus table mit sel als Filter
     * @param {*} db - formal notwendig
     * @param {*} async - formal notwendig
     * @param {*} req - request vom Server, kann null sein, dann muss reqparm angegeben sein
     * @param {*} reqparm - request vom Server, kann null sein, dann muss reqparm angegeben sein
     * @param {*} res - response zum Server, wird übernommen, um die Antwort im callback zurückgeben zu können
     * @param {*} callback - callback funktion
     */
    sys0000sys.getonerecord = function (db, async, req, reqparm, res, callback201) {

        sys0000sys.getallsqlrecords(db, async, req, reqparm, res, function (res1, ret1) {
            // Transformation Ergebnis
            ret1.record = null;
            if (typeof ret1.records !== "undefined") {
                if (Array.isArray(ret1.records)) {
                    if (ret1.records.length > 0) {
                        ret1.record = ret1.records[0];
                    }
                } else {
                    var key = Object.keys(ret1.records);
                    if (key.length > 0) {
                        ret1.record = ret1.records[key[0]];
                    }
                }
            }
            delete ret1.records;
            callback201(res1, ret1);
            return;
        });

    };

    /**
     * Holen alle records aus table mit sel als Filter
     * @param {*} db - formal notwendig
     * @param {*} async - formal notwendig
     * @param {*} req - request vom Server, kann null sein, dann muss reqparm angegeben sein
     * @param {*} reqparm - request vom Server, kann null sein, dann muss reqparm angegeben sein
     * @param {*} res - response zum Server, wird übernommen, um die Antwort im callback zurückgeben zu können
     * @param {*} callback - callback funktion
     */
    sys0000sys.getallrecords = function (db, async, req, reqparm, res, callback200) {
        sys0000sys.getallsqlrecords(db, async, req, reqparm, res, function (res1, ret1) {
            callback200(res1, ret1);
            return;
        });
    };

    /**
     * getallsqlrecords - Holen alle records aus sql3-table mit sel als Filter
     * @param {*} db - formal notwendig
     * @param {*} async - formal notwendig
     * @param {*} req - request vom Server, kann null sein, dann muss reqparm angegeben sein
     * @param {*} reqparm - request vom Server, kann null sein, dann muss reqparm angegeben sein
     * @param {*} res - response zum Server, wird übernommen, um die Antwort im callback zurückgeben zu können
     * @param {*} callback - callback funktion
     */
    sys0000sys.getallsqlrecords = function (db, async, req, reqparm, res, callbackgsr) {
        /**
         * Prüfen, welche Parameter vorliegen, dann zugreifen
         * username und firma sind auch verfügbar
         */
        var sel = {};
        var projection = {};
        var sort = {};
        var table = "";
        var firma = "";
        var skip = 0;
        var limit = 0;
        var selectmode = false;
        var ret = {};
        if (typeof reqparm === "undefined" || reqparm === null) {
            if (req.query && typeof req.query.sel !== "undefined" && req.query.sel.length > 0) {
                // sqlite3 - sel kann ein SELECT-String sein!
                if (req.query.sel.startsWith("{")) {
                    sel = JSON.parse(req.query.sel);
                    selectmode = false;
                } else {
                    sel = req.query.sel;
                    selectmode = true;
                }
            }
            if (req.query && typeof req.query.projection !== "undefined" && req.query.projection.length > 0) {
                projection = JSON.parse(req.query.projection);
                if (projection !== "undefined" && projection !== null) {
                    var pkeys = Object.keys(projection);
                    if (pkeys.length === 1 && pkeys[0] === "history") {
                        projection = {};
                    }
                } else {
                    projection = {};
                }
            }
            if (req.query && typeof req.query.sort !== "undefined" && req.query.sort.length > 0) {
                sort = JSON.parse(req.query.sort);
            }
            if (req.query && typeof req.query.table !== "undefined" && req.query.table.length > 0) {
                table = req.query.table;
            }
            if (req.query && typeof req.query.firma !== "undefined" && req.query.firma.length > 0) {
                firma = req.query.firma;
            }
            if (req.query && typeof req.query.skip !== "undefined" && req.query.skip.length > 0) {
                skip = parseInt(req.query.skip);
            }
            if (req.query && typeof req.query.limit !== "undefined" && req.query.limit.length > 0) {
                limit = parseInt(req.query.limit);
            }
        } else {
            if (reqparm && typeof reqparm.sel !== "undefined") {
                sel = reqparm.sel;
                if (typeof reqparm.sel === "object") {
                    selectmode = false;
                } else {
                    selectmode = true;
                }
            }
            if (selectmode === false) {
                if (reqparm && typeof reqparm.projection !== "undefined") {
                    projection = reqparm.projection;
                }
                if (reqparm && typeof reqparm.sort !== "undefined") {
                    sort = reqparm.sort;
                }
                if (reqparm && typeof reqparm.table !== "undefined" && reqparm.table.length > 0) {
                    table = reqparm.table;
                }
                if (reqparm && typeof reqparm.firma !== "undefined" && reqparm.firma.length > 0) {
                    firma = reqparm.firma;
                }
            }
            if (reqparm && typeof reqparm.skip !== "undefined" && reqparm.skip > 0) {
                skip = parseInt(reqparm.skip);
            }
            if (reqparm && typeof reqparm.limit !== "undefined" && reqparm.limit > 0) {
                limit = parseInt(reqparm.limit);
            }
        }
        if (typeof sel === "object") {
            // where-Bedingung bauen
            var selstring = "SELECT ";
            if (typeof projection === "object") {
                var flds = Object.keys(projection);
                var fldstring = "";
                if (flds.length > 0) {
                    for (var ifld = 0; ifld < flds.length; ifld++) {
                        if (projection[flds[ifld]] === 1) {
                            if (fldstring.length > 0) fldstring += ",";
                            fldstring += flds[ifld];
                        }
                    }
                }
                if (fldstring.length === 0) {
                    selstring += " * ";
                } else {
                    selstring += " " + fldstring;
                }
            }
            selstring += " FROM " + table;
            // WHERE nur flat an dieser Stelle
            var conds = Object.keys(sel);
            var where = "";
            for (var icond = 0; icond < conds.length; icond++) {
                var condval = sel[conds[icond]];
                if (typeof condval === "number") {
                    if (where.length > 0) where += " AND ";
                    where += conds[icond];
                    where += " = " + condval;
                } else if (typeof condval === "string") {
                    if (where.length > 0) where += " AND ";
                    where += conds[icond];
                    where += " = " + "'" + condval + "'";
                } else {
                    // Dickes Problem!!!
                    ret.error = true;
                    ret.message = "WHERE zu komplex:" + JSON.stringify(sel);
                    callbackgsr(res, ret);
                    return;
                }
            }
            if (where.length > 0) {
                selstring += " WHERE " + where;
            }
            var orderby = "";
            if (Array.isArray(sort)) {
                for (var isort = 0; isort < sort.length; isort++) {
                    // ["startdate", "asc"],
                    if (orderby.length > 0) orderby += ", ";
                    orderby += sort[isort][0];
                    var odir = sort[isort][1];
                    if (odir.toUpperCase() === "ASC") {
                        orderby += " ASC";
                    } else {
                        orderby += " DESC";
                    }
                }
                if (orderby.length > 0) {
                    selstring += " ORDER BY " + orderby;
                }
            } else if (typeof sort === "object") {
                var sortkeys = Object.keys(sort);
                for (var isort = 0; isort < sortkeys.length; isort++) {
                    // ["startdate", "asc"],
                    if (orderby.length > 0) orderby += ", ";
                    orderby += sortkeys[isort];
                    var odir = sort[sortkeys[isort]];
                    if (typeof odir === "number") {
                        if (odir === 1) {
                            orderby += " ASC";
                        } else {
                            orderby += " DESC";
                        }
                    } else {
                        if (odir.toUpperCase() === "ASC") {
                            orderby += " ASC";
                        } else {
                            orderby += " DESC";
                        }
                    }
                }
                if (orderby.length > 0) {
                    selstring += " ORDER BY " + orderby;
                }
            }
            sel = selstring; // et voila der Zauber
        }
        if (sel.indexOf("LIMIT ") > 0) {} else {
            if (limit > 0) {
                //  + " LIMIT 10 OFFSET 0";
                if (sel.toUpperCase().indexOf("ORDER BY") > 0) {
                    // sel += " LIMIT " + limit;
                    //sel += "," + skip;
                    sel += " LIMIT " + skip;
                    sel += "," + limit;
                }
            }
        }
        var ret = {};
        var records = [];
        console.log("getallsqlrecords-0:" + sel);
        try {
            if (db === null) {
                ret.error = true;
                ret.message = "getallsqlrecords-1:" + "Keine Datenbank übergeben";
                ret.record = null;
                ret.records = null;
                callbackgsr(res, ret);
                return;
            }
            /**
             * Aufbau des Response-Array
             */
            var record = {};
            var sqlStmt = sel;
            var rows;
            db.serialize(function () {
                db.all(sqlStmt, function (err, rows) {
                    var ret = {};
                    if (err) {
                        ret.error = true;
                        ret.message = "getallsqlrecords-2:" + err;
                        console.log(ret.message);
                        callbackgsr(res, ret);
                        return;
                    } else if (rows.length === 0) {
                        ret.error = false;
                        ret.message = "getallsqlrecords-2:Keine Sätze zu " + sqlStmt;
                        console.log(ret.message);
                        callbackgsr(res, ret);
                        return;
                    } else {
                        ret.error = false;
                        ret.message = "getallsqlrecords-5:" + " gefunden:" + rows.length;
                        ret.records = rows;
                        console.log(ret.message);
                        callbackgsr(res, ret);
                        return;
                    }
                });
            });
        } catch (err) {
            ret.error = true;
            ret.message = "getallsqlrecords-6:" + err.message;
            ret.records = null;
            console.log("getallsqlrecords-7:" + ret.message);
            callbackgsr(res, ret);
            return;
        }
    };

    /**
     * Einfügen Satz mit unique keyfield, kein Update
     * @param {*} db - formal notwendig
     * @param {*} async - formal notwendig
     * @param {*} req - request vom Server, kann null sein, dann muss reqparm angegeben sein
     * @param {*} reqparm - request vom Server, kann null sein, dann muss reqparm angegeben sein
     *            sel und record müssen gefüllt sein, insert, wenn sel nicht erfüllt ist
     *            über $setOnInsert only
     * @param {*} res - response zum Server, wird übernommen, um die Antwort im callback zurückgeben zu können
     * @param {*} callback - callback funktion
     * es wird analog setonerecord alles in $setOnInsert gepackt, so dass nichts passieren kann!!!
     */
    sys0000sys.insonerecord = function (db, async, req, reqparm, res, callback) {
        var sel = {};
        var table = "";
        var uniquefield = "";
        var record = {};
        if (typeof reqparm === "undefined" || reqparm === null) {
            if (req.body && typeof req.body.sel !== "undefined" && req.body.sel.length > 0) {
                sel = JSON.parse(req.body.sel);
            }
            if (req.body && typeof req.body.table !== "undefined" && req.body.table.length > 0) {
                table = req.body.table;
            }
            if (req.body && typeof req.body.uniquefield !== "undefined" && req.body.uniquefield.length > 0) {
                uniquefield = req.body.uniquefield;
            }
            if (req.body && typeof req.body.record !== "undefined" && req.body.record.length > 0) {
                record = JSON.parse(req.body.record);
            }
        } else {
            if (reqparm && typeof reqparm.sel !== "undefined") {
                sel = reqparm.sel;
            }
            if (reqparm && typeof reqparm.table !== "undefined" && reqparm.table.length > 0) {
                table = reqparm.table;
            }
            if (reqparm && typeof reqparm.uniquefield !== "undefined" && reqparm.uniquefield.length > 0) {
                uniquefield = reqparm.uniquefield;
            }
            if (reqparm && typeof reqparm.record !== "undefined") {
                record = reqparm.record;
            }
        }
        var updfields = {};
        updfields["$setOnInsert"] = record;
        updfields["$setOnInsert"].tsserverupd = new Date().toISOString();
        updfields["$setOnInsert"].iostatus = 1;
        /**
         * Hier ist eine add-Logik notwendig, um die Tabelle anzulegen und fortzuschreiben
         */
        var sentry = {};
        //sentry.ts = new Date().toISOString();
        var tsdate = new Date();
        sentry.ts = new Date(tsdate - tsdate.getTimezoneOffset() * 60 * 1000).toISOString();
        if (typeof req !== "undefined" && req !== null && typeof req.session !== "undefined" && typeof req.session.username !== "undefined") {
            sentry.username = req.session.username; // record.lastusername;
        } else {
            sentry.username = "*unknown";
        }
        sentry.app = "sys0000sys-insOneRecord";
        if (table === "KLIUSERS" || !table.startsWith("KLI")) {
            sentry.msg = "Server - ins erfolgt:" + JSON.stringify(updfields, null, " ");
        } else {
            sentry.msg = "Server - ins erfolgt";
        }

        //updfields["$setOnInsert"].history[0] = sentry;
        try {
            db.collection(table).findOneAndUpdate(
                sel,
                updfields, {
                    upsert: true,
                    returnOriginal: false
                },
                function (err, feedback) {
                    if (typeof err !== "undefined" && err !== null) {
                        console.log("insonerecord-ERR:" + err);
                        callback(res, {
                            error: true,
                            message: JSON.stringify(err, null, " "),
                            record: {}
                        });
                        return;
                    } else {
                        // Kontrollausgabe ohne History
                        var confeedback = Object.assign({}, feedback);
                        delete confeedback.history;
                        callback(res, {
                            error: false,
                            message: "insonerecord Operation war erfolgreich",
                            record: feedback.value,
                            lastErrorObject: confeedback.lastErrorObject
                        });
                        return;
                    }
                });
        } catch (err) {
            var ret = {};
            ret.error = true;
            ret.message = "insonerecord:" + err.message;
            ret.record = null;
            console.log("insonerecord:" + ret.message);
            callback(res, ret);
            return;
        }
    };





    /**
     * setonerecord - adaptive Datenfortschreibung mit JSON-Vorgaben in den Parametern
     * table, selfields und updfields, vorausgesetzt wird:
     * selfieds hat name-value pairs, die in UND/=-Direktiven umgesetzt werden
     * updfields hat die Abschnitte $set für UPDATE oder INSERT und "setOnInsert" nur für INSERT
     * für name-value pairs, typeof object wird mit JSON.stringify in einen String konvertiert
     * die Funktion prüft zuerst, ob die Zieltabelle vorhanden ist und legt sie mit
     * CREATE TABLE an, wenn dies erforderlich ist.
     * TODO:
     * 1. CREATE INDEX aus selfields ableiten und
     * 2. ALTER TABLE für neue Felder, die noch nicht in der Feldbeschreibung enthalten sind,
     * vorhandene Felder werden abgefragt mit PRAGMA table_info(table-name);
     * diese Feldlisten können in einen globalen Cache genommen werden, um wieder verwendet zu werden
     * @param db - SQLite3 Datenbank, zugewiesen
     * @param async - Standardbibliothek
     * @param req - hat selfields, updfields und table für Aufruf aus dem Client (über server.js etc)
     * @param reqparm - hat selfields, updfields und table für Aufruf innerhalb des Servers
     * @param res - response-Objekt, wird einfach durchgereicht in callback
     * @param callback returns res, ret
     */
    sys0000sys.setonerecord = function (db, async, req, reqparm, res, callbacksor) {
        /**
         * Prüfen, welche Parameter vorliegen, dann zugreifen
         * username und firma sind auch verfügbar
         */
        var ret = {};
        sorcount++;
        ret.sorcount = sorcount;
        ret.startts = new Date();
        perftimer.sor.start = new Date();
        var selfields = {};
        var updfields = {};
        var table = "";
        var firma = "";
        if (typeof req !== "undefined" && req !== null) {
            if (req.body && typeof req.body.selfields !== "undefined" && req.body.selfields.length > 0) {
                selfields = JSON.parse(req.body.selfields);
            }
            if (req.body && typeof req.body.updfields !== "undefined" && req.body.updfields.length > 0) {
                updfields = JSON.parse(req.body.updfields);
            }
            if (req.body && typeof req.body.table !== "undefined" && req.body.table.length > 0) {
                table = req.body.table;
            }
            if (req.body && typeof req.body.firma !== "undefined" && req.body.firma.length > 0) {
                firma = req.body.firma;
            }
        } else {
            if (reqparm && typeof reqparm.selfields !== "undefined") {
                selfields = reqparm.selfields;
            }
            if (reqparm && typeof reqparm.updfields !== "undefined") {
                updfields = reqparm.updfields;
            }
            if (reqparm && typeof reqparm.table !== "undefined" && reqparm.table.length > 0) {
                table = reqparm.table;
            }
            if (reqparm && typeof reqparm.firma !== "undefined" && reqparm.firma.length > 0) {
                firma = reqparm.firma;
            }
        }
        // console.log("updfields-raw:" + JSON.stringify(updfields, null, " "));


        //try {
        if (db === null) {
            ret.error = true;
            ret.message = "setonerecord ERROR:" + "Keine Datenbank übergeben";
            ret.record = null;
            console.log("ABBRUCH-ERROR-keine Datenbank");
            callbacksor(res, ret);
            return;
        }
        if (typeof updfields["$set"] === "undefined") {
            updfields["$set"] = {};
        }
        if (typeof updfields["$setOnInsert"] === "undefined") {
            updfields["$setOnInsert"] = {};
        }
        updfields["$set"].tsserverupd = new Date().toISOString();
        updfields["$set"].iostatus = 1;

        //console.log("SEL:" + JSON.stringify(selfields, null, " "));
        //console.log("UPD:" + JSON.stringify(updfields, null, " "));
        /**
         * Erzeugen Update-Statement - upsert = true ist default und wird beachtet
         */
        var allfields = {};
        allfields = Object.assign({}, selfields);
        allfields = Object.assign(allfields, updfields["$set"]);
        allfields = Object.assign(allfields, updfields["$setOnInsert"]);
        var sorparms = {
            table: table,
            selfields: selfields,
            updfields: updfields,
            allfields: allfields
        };
        db.serialize(function () {
            async.waterfall([
                function (callback210) {
                    // Lesen des evtl. vorhandenen Satzes
                    // SELECT konstruieren
                    var ret = {};
                    ret.error = false;
                    ret.message = "";
                    ret.sorparms = sorparms;
                    ret.sorcount = sorcount;
                    var sqlStmt = "";
                    var sel = sorparms.selfields;
                    var conds = Object.keys(sel);
                    var where = "";
                    for (var icond = 0; icond < conds.length; icond++) {
                        var condval = sel[conds[icond]];
                        if (typeof condval === "number") {
                            if (where.length > 0) where += " AND ";
                            where += conds[icond];
                            where += " = " + condval;
                        } else if (typeof condval === "string") {
                            if (where.length > 0) where += " AND ";
                            where += conds[icond];
                            where += " = " + "'" + condval + "'";
                        } else {
                            // Dickes Problem!!!
                            ret.error = true;
                            ret.message += "WHERE zu komplex:" + JSON.stringify(sel);
                            callback210("Error", res, ret);
                            return;
                        }
                    }
                    if (where.length > 0) {
                        sqlStmt += "SELECT * ";
                        sqlStmt += " FROM " + ret.sorparms.table;
                        sqlStmt += " WHERE " + where;
                    }
                    db.get(sqlStmt, function (err, row) {
                        perftimer.sor.SELECT = new Date() - perftimer.sor.start;
                        perftimer.sor.start = new Date();
                        ret.alter = false;
                        if (err) {
                            // wenn Tabelle nicht vorhanden, dann CREATE TABLE
                            if (err.message.indexOf("SQLITE_ERROR: no such table:") >= 0) {
                                console.log(err.message);
                            }
                            ret.createTable = true;
                            ret.insert = true;
                            ret.update = false;
                        } else {
                            ret.createTable = false;
                            if (typeof row !== "undefined" && row !== null) {
                                ret.insert = false;
                                ret.update = true;
                                ret.oldrecord = row;
                            } else {
                                ret.insert = true;
                                ret.update = false;
                            }
                        }
                        if (err) {
                            ret.message += " SELECT:" + err.message;
                        } else if (row === null) {
                            ret.message += " SELECT:" + ret.sorparms.table + " not found";
                        } else {
                            ret.message += " " + ret.sorparms.table + " selected";
                        }
                        callback210(null, res, ret);
                        return;
                    });
                },
                function (res, ret, callback210a) {
                    // optional CREATE TABLE
                    if (ret.createTable === false) {
                        callback210a(null, res, ret);
                        return;
                    }
                    /*
                        CREATE TABLE bench (key VARCHAR(32), value TEXT)
                    */
                    var createStmt = "CREATE TABLE IF NOT EXISTS";
                    createStmt += " " + ret.sorparms.table;
                    createStmt += " (";
                    var baserecord = ret.sorparms.allfields;
                    var varlist = "";
                    var vallist = "";
                    for (var property in baserecord) {
                        if (baserecord.hasOwnProperty(property)) {
                            createStmt += " " + property;
                            var ptype = typeof baserecord[property];
                            var pvalue = baserecord[property];
                            varlist += property + ",";
                            if (ptype === "object") {
                                createStmt += " TEXT,";
                                vallist += JSON.stringify(pvalue) + ",";
                            } else if (ptype === "string") {
                                createStmt += " TEXT,";
                                vallist += "'" + pvalue.replace(/'/g, "''") + "',";
                            } else if (ptype === "number") {
                                createStmt += " FLOAT,";
                                vallist += pvalue + ",";
                            } else if (ptype === "boolean") {
                                createStmt += " TEXT,";
                                vallist += pvalue + ",";
                            } else {
                                createStmt += " TEXT,";
                                if (pvalue === null) {
                                    vallist += "null,";
                                } else {
                                    vallist += pvalue + ",";
                                }
                            }
                        }
                    }
                    // letztes Komma weg
                    if (createStmt.lastIndexOf(",") > 0) createStmt = createStmt.slice(0, -1);
                    createStmt += ')';
                    if (varlist.lastIndexOf(",") > 0) varlist = varlist.slice(0, -1);
                    if (vallist.lastIndexOf(",") > 0) vallist = vallist.slice(0, -1);
                    db.run(createStmt, function (err) {
                        perftimer.sor.CREATE = new Date() - perftimer.sor.start;
                        perftimer.sor.start = new Date();
                        /**
                         * TODO: Indices Anlegen wäre noch gut aus selfields und für tsserver
                         * CREATE INDEX IF NOT EXISTS ind1_KLISTATIONS ON KLISTATIONS(tsserverrupd)
                         */
                        if (err) {
                            ret.message += " CREATE TABLE:" + err.message;
                            callback210a("Error", res, ret);
                            return;
                        } else {
                            ret.message += " " + ret.sorparms.table + " created";
                            var indFields = "";
                            for (var field in ret.sorparms.selfields) {
                                if (ret.sorparms.selfields.hasOwnProperty(field)) {
                                    if (indFields.length > 0) indFields += ", ";
                                    indFields += field;
                                }
                            }
                            if (indFields.length > 0) {
                                var indrnd = "T" + Math.floor(Math.random() * 100000) + 1;
                                var createInd = "CREATE INDEX IF NOT EXISTS ";
                                createInd += " ind" + indrnd + "_" + ret.sorparms.table;
                                createInd += " ON " + ret.sorparms.table + "(";
                                createInd += indFields;
                                createInd += ")";
                                db.run(createInd, function (err) {
                                    perftimer.sor.CREATEIND = new Date() - perftimer.sor.start;
                                    perftimer.sor.start = new Date();
                                    callback210a(null, res, ret);
                                    return;
                                });
                            } else {
                                callback210a(null, res, ret);
                                return;
                            }
                        }
                    });
                },

                function (res, ret, callback210c) {
                    // check new fields - wenn Tabelle nicht neu ist
                    var mycache = sys0000sys.getInfo();
                    if (ret.createTable === true) {
                        // cache immer aufbauen bei neuer Tabelle
                        mycache.tables = {};
                        var acttable = ret.sorparms.table;
                        mycache.tables[acttable] = {};
                        var allfields = Object.keys(ret.sorparms.allfields);
                        for (var ifield = 0; ifield < allfields.length; ifield++) {
                            var fieldname = allfields[ifield];
                            var fieldtype = typeof ret.sorparms.allfields[fieldname];
                            mycache.tables[acttable][fieldname] = fieldtype;
                        }
                        callback210c(null, res, ret);
                        return;
                    } else {
                        // hier wird es ernst
                        if (typeof mycache.tables === "undefined") {
                            mycache.tables = {};
                        }
                        var acttable = ret.sorparms.table;
                        if (typeof mycache.tables[acttable] === "undefined") {
                            mycache.tables[acttable] = {};
                            db.all("PRAGMA table_info ('" + ret.sorparms.table + "')", function (err, fields) {
                                perftimer.sor.PRAGMATI = new Date() - perftimer.sor.start;
                                perftimer.sor.start = new Date();
                                if (err === null) {
                                    for (var ifield = 0; ifield < fields.length; ifield++) {
                                        var name = fields[ifield].name;
                                        var type = fields[ifield].type;
                                        mycache.tables[acttable][name] = type;
                                    }
                                }
                                callback210c(null, res, ret);
                                return;
                            });
                        } else {
                            callback210c(null, res, ret);
                            return;
                        }
                    }
                },

                function (res, ret, callback210d) {
                    if (ret.createTable === true) {
                        callback210d(null, res, ret);
                        return;
                    }
                    var acttable = ret.sorparms.table;
                    var mycache = sys0000sys.getInfo();
                    var allfields = Object.keys(ret.sorparms.allfields);
                    var alterstatements = [];
                    for (var ifield = 0; ifield < allfields.length; ifield++) {
                        var actfield = allfields[ifield];
                        var actvalue = ret.sorparms.allfields[actfield];
                        var acttype = "TEXT";
                        if (typeof actvalue === "number") {
                            acttype = "FLOAT";
                        }
                        if (typeof mycache.tables[acttable][actfield] === "undefined") {
                            var alterstatement = "ALTER TABLE ";
                            alterstatement += ret.sorparms.table;
                            alterstatement += " ADD COLUMN " + actfield;
                            alterstatement += " " + acttype;
                            alterstatements.push(alterstatement);
                            mycache.tables[acttable][actfield] = acttype;
                        }
                    }
                    if (alterstatements.length > 0) {
                        async.eachSeries(alterstatements, function (alterStmt, nextStmt) {
                                db.run(alterStmt, function (err) {
                                    perftimer.sor.ALTER = new Date() - perftimer.sor.start;
                                    perftimer.sor.start = new Date();
                                    if (err) {
                                        ret.message += " ALTER-Error:" + err.message;
                                    } else {
                                        ret.message += " " + alterStmt + " executed";
                                        ret.alter = true;
                                    }
                                    nextStmt();
                                    return;
                                });
                            },
                            function (error) {
                                callback210d(null, res, ret);
                                return;
                            });
                    } else {
                        callback210d(null, res, ret);
                        return;
                    }
                },
                function (res, ret, callback210i) {
                    // optional INSERT
                    if (ret.insert === false) {
                        callback210i(null, res, ret);
                        return;
                    }
                    /*
                        INSERT INTO table_name(column_name)
                        VALUES(value_1), (value_2), (value_3),...
                    */
                    var insStmt = "INSERT INTO ";
                    insStmt += " " + ret.sorparms.table;
                    var baserecord = ret.sorparms.allfields;
                    var varlist = "";
                    var vallist = "";
                    for (var property in baserecord) {
                        if (baserecord.hasOwnProperty(property)) {
                            var ptype = typeof baserecord[property];
                            var pvalue = baserecord[property];
                            varlist += property + ",";
                            if (ptype === "object") {
                                vallist += JSON.stringify(pvalue) + ",";
                            } else if (ptype === "string") {
                                vallist += "'" + pvalue.replace(/'/g, "''") + "',";
                            } else if (ptype === "number") {
                                vallist += pvalue + ",";
                            } else if (ptype === "boolean") {
                                vallist += pvalue + ",";
                            } else {
                                if (pvalue === null) {
                                    vallist += "null,";
                                } else {
                                    vallist += pvalue + ",";
                                }
                            }
                        }
                    }
                    // letztes Komma weg
                    if (varlist.lastIndexOf(",") > 0) varlist = varlist.slice(0, -1);
                    if (vallist.lastIndexOf(",") > 0) vallist = vallist.slice(0, -1);
                    insStmt += "(";
                    insStmt += varlist;
                    insStmt += ")";
                    insStmt += " VALUES(";
                    insStmt += vallist;
                    insStmt += ")";
                    db.run(insStmt, function (err) {
                        perftimer.sor.INSERT = new Date() - perftimer.sor.start;
                        perftimer.sor.start = new Date();
                        if (err) {
                            ret.message += " INSERT-Error:" + err.message;
                            console.log(" INSERT-Error:" + err.message);
                        } else {
                            ret.message += " " + ret.sorparms.table + " ID:" + this.lastID + " inserted";
                        }
                        callback210i(null, res, ret);
                        return;
                    });
                },
                function (res, ret, callback210u) {
                    // optional UPDATE
                    if (ret.update === false) {
                        callback210u(null, res, ret);
                        return;
                    }
                    /**
                     * Ein Vergleich auf sifnifikante Updates kann hier vorgenommen werden
                     */

                    /*
                        UPDATE table
                        SET column_1 = new_value_1,
                            column_2 = new_value_2
                        WHERE
                            search_condition
                        ORDER column_or_expression
                        LIMIT row_count OFFSET offset;
                    */
                    var updStmt = "UPDATE ";
                    updStmt += " " + ret.sorparms.table;
                    var set = "";

                    var baserecord = ret.sorparms.updfields["$set"];
                    /**
                     * Ein Vergleich auf sifnifikante Updates kann hier vorgenommen werden
                     * alte Felder gegen neue und neue Felder an sich müssen Update auslösen
                     */
                    var isigcount = 0;
                    var idelcount = 0;

                    for (var property in baserecord) {
                        if (baserecord.hasOwnProperty(property)) {
                            var ptype = typeof baserecord[property];
                            var pvalue = baserecord[property];
                            if (property !== "tsserverupd") {
                                if (ret.oldrecord[property] !== pvalue) {
                                    isigcount++;
                                } else {
                                    delete baserecord[property];
                                    idelcount++;
                                }
                            }
                        }
                    }
                    var newkeys = Object.keys(baserecord);
                    // bisher isigcount === 0
                    // Hinweis tsserverupd zählt nicht, daher < 2 ist zu wenig
                    if (newkeys.length < 2) {
                        ret.message += " " + ret.sorparms.table + " kein update notwendig";
                        callback210u(null, res, ret);
                        return;
                    }
                    for (var property in baserecord) {
                        if (baserecord.hasOwnProperty(property)) {
                            var ptype = typeof baserecord[property];
                            var pvalue = baserecord[property];
                            if (set.length > 0) set += ", ";
                            set += property;
                            set += " = ";
                            if (ptype === "object") {
                                set += JSON.stringify(pvalue);
                            } else if (ptype === "string") {
                                set += "'" + pvalue.replace(/'/g, "''") + "'";
                            } else if (ptype === "number") {
                                set += pvalue;
                            } else if (ptype === "boolean") {
                                set += pvalue;
                            } else {
                                set += "'" + pvalue.replace(/'/g, "''") + "'";
                            }
                        }
                    }
                    updStmt += " SET " + set;
                    // jetzt noch die WHERE-Bedingung
                    var sel = ret.sorparms.selfields;
                    var conds = Object.keys(sel);
                    var where = "";
                    for (var icond = 0; icond < conds.length; icond++) {
                        var condval = sel[conds[icond]];
                        if (typeof condval === "number") {
                            if (where.length > 0) where += " AND ";
                            where += conds[icond];
                            where += " = " + condval;
                        } else if (typeof condval === "string") {
                            if (where.length > 0) where += " AND ";
                            where += conds[icond];
                            where += " = " + "'" + condval + "'";
                        } else {
                            // Dickes Problem!!!
                            ret.error = true;
                            ret.message = "WHERE zu komplex:" + JSON.stringify(sel);
                            callback210u("Error", res, ret);
                            return;
                        }
                    }
                    if (where.length > 0) {
                        updStmt += " WHERE " + where;
                    }
                    db.run(updStmt, function (err) {
                        perftimer.sor.UPDATE = new Date() - perftimer.sor.start;
                        perftimer.sor.start = new Date();
                        if (err) {
                            ret.message += " UPDATE:" + err.message;
                        } else {
                            ret.message += " " + ret.sorparms.table + " updated:" + this.changes;
                        }
                        callback210u(null, res, ret);
                        return;
                    });
                }
            ], function (error, res, ret) {
                // hier geht es erst heraus
                // db.run("BEGIN");   db.run("END");
                if (typeof error !== "undefined" && error !== null && error === "Error") {
                    console.log("ABBRUCH-ERROR-final");
                    callbacksor(res, ret);
                    return;
                }
                ret.message += " " + ret.sorparms.table + " finished";
                ret.endts = new Date();
                ret.timediff = ret.endts - ret.startts;
                if (ret.error === true) {
                    console.log("#" + ret.sorcount + ". " + ret.message);
                }
                /*
                if (ret.sorcount % 100 === 0) {
                    console.log("#" + ret.sorcount + ". last sor-Time:" + ret.timediff);
                    console.log(JSON.stringify(perftimer.sor, null, ""));
                }
                */
                perftimer.sor = {}; // Später müsste hier kumuliert werden
                callbacksor(res, ret);
                return;
            }); // async.waterfall
        }); // db.serialize
    };



    /**
     * Delete einen record in table mit sel als Filter
     * @param db
     * @param async
     * @param req
     * @param res
     * @param callback
     */
    sys0000sys.delonerecord = function (db, async, req, reqparm, res, callbackdel) {
        /**
         * Prüfen, welche Parameter vorliegen, dann zugreifen
         * username und firma sind auch verfügbar
         */
        var delStmt = "";
        var table = "";
        var firma = "";
        var record = {};
        if (typeof reqparm === "undefined" || reqparm === null) {
            if (req.body && typeof req.body.delStmt !== "undefined" && req.body.delStmt.length > 0) {
                delStmt = req.body.delStmt;
            }
            if (req.body && typeof req.body.table !== "undefined" && req.body.table.length > 0) {
                table = req.body.table;
            }

            if (req.body && typeof req.body.firma !== "undefined" && req.body.firma.length > 0) {
                firma = req.body.firma;
            }
            if (req.body && typeof req.body.record === "object" && req.body.record !== null) {
                record = JSON.parse(req.body.record);
            }
        } else {
            if (reqparm && typeof reqparm.delStmt !== "undefined" && reqparm.delStmt.length > 0) {
                delStmt = reqparm.delStmt;
            }
            if (reqparm && typeof reqparm.table !== "undefined" && reqparm.table.length > 0) {
                table = reqparm.table;
            }
            if (reqparm && typeof reqparm.firma !== "undefined" && reqparm.firma.length > 0) {
                firma = reqparm.firma;
            }
            if (reqparm && typeof reqparm.record === "object" && reqparm.record !== null) {
                record = JSON.parse(reqparm.record);
            }
        }
        var ret = {};
        console.log("delonerecord:" + table);
        console.log("delonerecord:" + delStmt);
        var selStmt = delStmt.replace("DELETE ", "SELECT * ");
        try {
            if (db === null) {
                ret.error = true;
                ret.message = "delonerecord:" + "Keine Datenbank übergeben";
                ret.record = null;
                callbackdel(res, ret);
                return;
            }
            var saverec = {}; // $.extend({}, record);
            db.serialize(function () {
                async.waterfall([
                    function (callback77) {
                        /**
                         * Holen Satz für Protokoll
                         */
                        db.get(selStmt, function (err, row) {
                            callback77(null, res, {
                                error: false,
                                message: "OK",
                                row: row
                            });
                            return;
                        });
                    },
                    function (res, ret, callback77b) {

                        var updfields = {};
                        /*
                        metafields: Array mit Objects
                        fielddescr:"Year AD, ,,AD, , speleothem, ,,N,   "
                        fieldname:"year"
                        */
                        updfields["$setOnInsert"] = ret.row;
                        var reqparm = {
                            table: table + "_history",
                            selfields: {
                                saveuuid: uihelper.uuid(),
                                savets: new Date().toISOString()
                            },
                            updfields: updfields
                        };
                        sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                            callback77b(null, res, {
                                error: false,
                                message: "gesichert",
                                row: ret.row
                            });
                            return;
                        });
                    },
                    function (res, ret, callback77c) {
                        db.run(delStmt, function (err) {
                            console.log("Row(s) deleted:" + this.changes);
                            callback77c(null, res, {
                                error: false,
                                message: "gelöscht",
                                row: ret.row
                            });
                            return;
                        });

                    }
                ], function (error, res, ret) {
                    ret.error = false;
                    ret.message = "delonerecord:" + "Fertig";
                    ret.row = null;
                    console.log("delonerecord:" + ret.message);
                    callbackdel(res, ret);
                    return;
                });
            }); // serialize
        } catch (err) {
            ret.error = true;
            ret.message = "delonerecord:" + err.message;
            ret.record = null;
            console.log("delonerecord:" + ret.message);
            callbackdel(res, ret);
            return;
        }
    };


    /**
     * getDirectories -. holt Verzeichnisse mit ausgewählten Dateien
     * log-Files, access.logfiles, root und web-root
     */
    sys0000sys.getDirectories = function (gblInfo, fs, async, res, supercallback) {
        /**
         * return Javascript-object
         */
        var dirtree = {};
        var filestats;
        async.waterfall([
                function (callback) {
                    /**
                     * sichern initiale Parameter
                     */
                    var dir = gblInfo.logDirectory;
                    console.log("Start getDirectories:" + dir);
                    callback(null, dirtree, dir);
                },
                function (dirtree, dir, callback) {
                    /**
                     * get subdirectories of root
                     */
                    console.log("Start-dir:" + dir);
                    fs.readdir(dir, function (error, dirs) {
                        dirtree.root = [];
                        for (var i = 0; i < dirs.length; i++) {
                            console.log(">>>>" + dirs[i]);
                            try {
                                var dirinfo = {};
                                dirinfo.name = dirs[i];
                                dirinfo.fullname = path.join(dir, dirs[i]);
                                console.log("fullname:" + dirinfo.fullname);
                                var info = fs.lstatSync(dirinfo.fullname);
                                dirinfo.isFile = info.isFile();
                                dirinfo.isDirectory = info.isDirectory();
                                // Logfile selektieren
                                if (dirinfo.name.endsWith(".log")) {
                                    filestats = fs.statSync(dirinfo.fullname);
                                    dirinfo.size = filestats.size;
                                    console.log("fs.watch scanned: statSync/size:" + dirinfo.name + " " + filestats.size);
                                    dirtree.root.push(dirinfo);
                                }
                            } catch (err) {
                                var errinfo = {};
                                console.log(err.stack);
                                errinfo.name = err.message;
                                errinfo.error = true;
                                dirtree.root.push(errinfo);
                            }
                        }
                        callback("Finish", dirtree);
                        return;
                    });
                }
            ],
            function (error, success) {
                if (error !== "Finish") {
                    var ret = {};
                    ret.err = true;
                    ret.message = error.message;
                    ret.dirtree = {};
                    supercallback(res, ret);
                    return;
                } else {
                    supercallback(res, {
                        error: false,
                        message: "OK",
                        dirtree: dirtree
                    });
                    return;
                }
            }
        );

    };



    /**
     * line = Zeile; search: Suchbegriff inkl. :; variablename und metadata für das Ergebnis
     */
    sys0000sys.getlineparameter = function (line, search, variablename, metadata) {
        var sline = line.substring(1).trim(); // ohne # und trim
        if (sline.indexOf(search) >= 0) {
            var idis = sline.indexOf(search) + search.length;
            var value = sline.substring(idis);
            metadata[variablename] = value;
            return true;
        } else {
            return false;
        }
    };



    var linfilelist = [];

    var walkSync = function (dir, filelist, globals, selyears, selvars, ADBC) {
        var fs = fs || require('fs'),
            files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function (file) {
            var fullfilename = path.join(dir, file);
            if (fs.statSync(fullfilename).isDirectory()) {
                if (globals === false) {
                    var fparts = file.match(/([a-zA-Z_]*)(\d*)(BC|AD)/);
                    var j = fparts[2];
                    if (j.length > 0) {
                        j = ("0000" + j).slice(-4);
                    }
                    if (fparts[3] === ADBC && sys0000sys.hasyear(j, selyears) === true) {
                        filelist.push(walkSync(fullfilename, [], globals, selyears, selvars, ADBC));
                    }
                } else {
                    filelist.push(walkSync(fullfilename, [], globals, selyears, selvars, ADBC));
                }
            } else {
                if (globals === false) {
                    var fparts = file.match(/([a-zA-Z_]*)(\d*)(BC|AD)/);
                    // console.log(fparts); // Array(4) ["conv_rangeland0AD", "conv_rangeland", "0", "AD"]
                    var vfrag = fparts[1].replace("_", "");
                    if (selvars.length > 0 && selvars.indexOf(vfrag) < 0) {
                        // skip
                    } else {
                        var j = fparts[2];
                        if (j.length > 0) {
                            j = ("0000" + j).slice(-4);
                        }
                        if (fparts[3] === ADBC && sys0000sys.hasyear(j, selyears) === true) {
                            filelist.push(fullfilename);
                            linfilelist.push(fullfilename);
                        }
                    }
                } else {
                    filelist.push(fullfilename);
                    linfilelist.push(fullfilename);
                }
            }
        });
        return filelist;
    };



    /**
     * year gegen Vorgabe prüfen
     * kommaseparierte Vorgaben
     * 4-stellige Jahreszahlen
     * Wildcard * ist erlaubt
     * und es kommen von-bis Angaben mit - dazu
     */
    sys0000sys.hasyear = function (year, selyears) {
        var sels = selyears.split(",");
        var ifound = false;
        for (var isel = 0; isel < sels.length; isel++) {
            if (sels[isel].length === 0) continue;
            if (sels[isel].indexOf("-") >= 0) {
                var selvb = sels[isel].split("-");
                if (selvb.length === 2) {
                    if (year >= selvb[0] && year <= selvb[1]) {
                        ifound = true;
                        break;
                    }
                }
            } else if (sels[isel].indexOf("*") >= 0) {
                ifound = true;
                for (var isel1 = 0; isel1 < sels[isel].length; isel1++) {
                    var y1 = year.substr(isel1, 1);
                    var y2 = sels[isel].substr(isel1, 1);
                    if (y2 === "*") continue;
                    if (y1 !== y2) {
                        ifound = false;
                        break;
                    }
                }
                if (ifound === false) {
                    continue;
                } else {
                    break;
                }
            } else {
                if (year !== sels[isel]) {
                    ifound = false;
                    continue;
                } else {
                    ifound = true;
                    break;
                }
            }
        }
        return ifound;
    };



    /**
     * getdirectoryfiles - Dateinamen zu Verzeichnis auslesen
     * KLIFILES, wenn vorhanden sonst werden die Dateien neu geholt
     * Parameter sind
     * fileopcode: "show" und "prep"
     * predirectory: "/../klima1001/";
     * directory: Beispiel: "albedo"
     * root-Directory wird zugefügt
     * wen doKLIFILES und doKLIRAWFILES === false, dann kein SQL-Abgleich, nur directories
     * var appDir = path.dirname(require.main.filename);
     */
    sys0000sys.getdirectoryfiles = function (gbldb, rootdir, fs, async, req, reqparm, res, supercallback4) {
        /**
         * return Javascript-Array ret.files
         * mit filename, filesize?
         */
        var fileopcode = "show"; // Default
        if (req.query && typeof req.query.fileopcode !== "undefined" && req.query.fileopcode.length > 0) {
            fileopcode = req.query.fileopcode;
        }
        var tablename = "";
        /**
         * Filter für Extensions, Flag für Subdirectories, Flag für KLIFILES-Updates
         * filterextensions, skipsubdirectories, doKLIFILES, doKLIRAWFILES
         */
        var filterextensions = ".txt";
        if (req.query && typeof req.query.filterextensions !== "undefined" && req.query.filterextensions.length > 0) {
            filterextensions = req.query.filterextensions;
        }
        var skipsubdirectories = "true";
        if (req.query && typeof req.query.skipsubdirectories !== "undefined" && req.query.skipsubdirectories.length > 0) {
            skipsubdirectories = req.query.skipsubdirectories;
        }
        var doKLIFILES = "true";
        if (req.query && typeof req.query.doKLIFILES !== "undefined" && req.query.doKLIFILES.length > 0) {
            doKLIFILES = req.query.doKLIFILES;

        }
        if (doKLIFILES === "true") {
            tablename = "KLIFILES";
        }
        var doKLIRAWFILES = "false";
        if (req.query && typeof req.query.doKLIRAWFILES !== "undefined" && req.query.doKLIRAWFILES.length > 0) {
            doKLIRAWFILES = req.query.doKLIRAWFILES;
            if (doKLIRAWFILES === "true") {
                doKLIFILES = "false";
                rootdir = path.join("G:", "Projekte");
                rootdir = path.join(rootdir, "klimadaten");
                tablename = "KLIRAWFILES";
            }
        }
        if (typeof rootdir !== "undefined" && rootdir.length > 0 && !fs.existsSync(rootdir)) {
            rootdir = path.join("C:", "projekte");
            rootdir = path.join(rootdir, "klima1001");
            if (!fs.existsSync(rootdir)) {
                fs.mkdirSync(rootdir);
            }
        }

        var files = [];
        var predirectory = "";
        if (req.query && typeof req.query.predirectory !== "undefined" && req.query.predirectory.length > 0) {
            predirectory = req.query.predirectory;
            if (typeof predirectory === "string" && predirectory.startsWith("{")) {
                predirectory = JSON.parse(predirectory);
            }
            if (typeof predirectory === "object" && Array.isArray(predirectory)) {
                var startdir = predirectory[0] || "";
                for (var idir = 1; idir < predirectory.length; idir++) {
                    startdir = path.join(startdir, predirectory[idir]);
                }
                predirectory = startdir;
            }
        }
        var directory = "";
        if (req.query && typeof req.query.directory !== "undefined" && req.query.directory.length > 0) {
            directory = req.query.directory;
        }
        if (predirectory.startsWith(rootdir)) predirectory = predirectory.substr(rootdir.length);
        if (directory.startsWith(rootdir)) directory = directory.substr(rootdir.length);

        var filestats;
        var ret = {};
        if (predirectory.length > 0) {
            ret.directory = path.join(rootdir, predirectory);
            ret.directory = path.join(ret.directory, directory);
        } else {
            ret.directory = path.join(rootdir, directory);
        }
        ret.files = files;
        ret.fileopcode = fileopcode;
        ret.rootdir = rootdir;
        var filesfound = 0;

        var filecontrol = {};

        async.waterfall([
                function (callback) {
                    if (tablename.length === 0) {
                        callback(null, ret);
                        return;
                    }
                    var reqparm = {
                        sel: {
                            directory: directory
                        },
                        projection: {},
                        sort: {
                            name: 1
                        },
                        table: tablename,
                        firma: "KLI",
                        skip: 0,
                        limit: 0
                    };

                    sys0000sys.getallsqlrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            // sollte nicht passieren??? oder auch hier anlegen
                            console.log("SQL:" + ret.message);
                            callback(null, ret);
                            return;
                        } else {
                            if (typeof ret1.records === "undefined" || ret1.records === null) {
                                ret.error = true;
                                ret.message = "Keine Sätze vorhanden";
                                callback(null, ret);
                                return;
                            } else if (ret1.records === "object" && Array.isArray(ret1.records) && ret1.records.length === 0) {
                                ret.error = false;
                                ret.message = "Keine Sätze vorhanden";
                                callback(null, ret);
                                return;
                            } else {
                                // attrs füllen
                                var files = [];
                                for (var irec = 0; irec < ret1.records.length; irec++) {
                                    var record = ret1.records[irec];
                                    var dirinfo = {};
                                    dirinfo.name = record.name;
                                    dirinfo.fullname = record.fullname;
                                    dirinfo.isFile = record.isFile;
                                    dirinfo.isDirectory = record.isDirectory;
                                    dirinfo.size = record.size;
                                    dirinfo.tsfilecreated = record.tsfilecreated;
                                    var filename = record.name;
                                    filecontrol[filename] = {};
                                    filecontrol[filename].oldtsfilecreated = record.tsfilecreated;
                                    /*
                                    dirinfo.archive = record.archive.trim() || "";
                                    dirinfo.sitename = record.sitename.trim() || "";
                                    dirinfo.longitude = "" + Number(record.longitude).toFixed(6);
                                    dirinfo.latitude = "" + Number(record.latitude).toFixed(6);
                                    dirinfo.firstyear = "" + Math.floor(Number(record.firstyear)).toFixed(0);
                                    dirinfo.lastyear = "" + Math.floor(Number(record.lastyear)).toFixed(0);
                                    */

                                    files.push(dirinfo);
                                }
                                ret.files = files;
                                if (ret.fileopcode === "listonly") {
                                    callback("Finish", ret);
                                    return;
                                } else {
                                    callback(null, ret);
                                    return;
                                }
                            }
                        }
                    });
                },
                function (ret, callback) {
                    /**
                     * sichern initiale Parameter
                     */
                    if (!fs.existsSync(ret.directory)) {
                        try {
                            fs.mkdirSync(ret.directory);
                            console.log("ANGELEGT:" + ret.directory);
                        } catch (err) {
                            ret.error = true;
                            ret.message = "Verzeichnis konnte nicht angelegt werden:" + ret.directory + " " + err;
                            callback("Error", ret);
                            return;
                        }
                    }
                    console.log("Start getDirectories:" + ret.directory);
                    callback(null, ret);
                    return;
                },
                function (ret, callback) {
                    /**
                     * get subdirectories of root
                     */
                    //console.log("Start-dir:" + ret.directory);
                    fs.readdir(ret.directory, function (error, dirs) {
                        for (var i = 0; i < dirs.length; i++) {
                            try {
                                var dirinfo = {};
                                dirinfo.name = dirs[i];
                                dirinfo.directory = directory;
                                dirinfo.format = "*unknown";
                                dirinfo.archive = "*unknown";
                                dirinfo.fullname = path.join(ret.directory, dirs[i]);
                                var info = fs.lstatSync(dirinfo.fullname);
                                dirinfo.isFile = info.isFile();
                                dirinfo.isDirectory = info.isDirectory();
                                // if (dirinfo.name.endsWith(".txt")) {
                                /**
                                 * filterextensions prüfen
                                 */
                                var aktext = "";
                                if (dirinfo.name.lastIndexOf(".") > 0) {
                                    aktext = dirinfo.name.substr(dirinfo.name.lastIndexOf("."));
                                }
                                if (filterextensions.indexOf(aktext) >= 0) {
                                    filestats = fs.statSync(dirinfo.fullname);
                                    dirinfo.size = filestats.size;
                                    dirinfo.tsfilecreated = filestats.ctime.toISOString();
                                    /*
                                    filecontrol[record.name] = {
                                        oldtsfilecreated: record.tsfilecreated
                                    };
                                    */
                                    dirinfo.dorefresh = false;
                                    if (typeof filecontrol[dirinfo.name] === "undefined") {
                                        dirinfo.dorefresh = true;
                                        ret.files.push(dirinfo);
                                    } else if (filecontrol[dirinfo.name].oldtsfilecreated < dirinfo.tsfilecreated) {
                                        dirinfo.dorefresh = true;
                                        ret.files.push(dirinfo);
                                        /*
                                        var actdir = ret.files.find(function (element) {
                                            if (element.name === dirinfo.name) {
                                                element.dorefresh = true;
                                                return element;
                                            }
                                        });
                                        */
                                    }

                                } else {
                                    if (skipsubdirectories === "false" && dirinfo.isDirectory === true) {
                                        dirinfo.size = 0;
                                        dirinfo.tsfilecreated = "";
                                        dirinfo.dorefresh = false;
                                        if (typeof filecontrol[dirinfo.name] === "undefined") {
                                            dirinfo.dorefresh = true;
                                            ret.files.push(dirinfo);
                                        } else if (filecontrol[dirinfo.name].oldtsfilecreated < dirinfo.tsfilecreated) {
                                            dirinfo.dorefresh = true;
                                            ret.files.push(dirinfo);
                                            /*
                                            var actdir = ret.files.find(function (element) {
                                                if (element.name === dirinfo.name) {
                                                    element.dorefresh = true;
                                                    return element;
                                                }
                                            });
                                            */
                                        }
                                    }
                                }
                            } catch (err) {
                                var errinfo = {};
                                errinfo.name = err.message;
                                errinfo.error = true;
                                ret.files.push(errinfo);
                            }
                        }
                        if (fileopcode === "show") {
                            callback("Finish", ret);
                            return;
                        } else {
                            callback(null, ret);
                            return;
                        }
                    });
                },
                function (ret, callback) {
                    /**
                     * Komplettieren oder Anlegen KLIFILES für netCDF albedo
                     */
                    if (tablename.length === 0) {
                        callback("Finish", ret);
                        return;
                    }
                    var saveret = uihelper.cloneObject(ret);
                    async.eachSeries(ret.files, function (file, nextfile) {
                            async.waterfall([
                                function (callback) {
                                    var updfields = {};
                                    updfields["$set"] = file;
                                    var reqparm = {
                                        table: tablename,
                                        selfields: {
                                            "fullname": file.fullname
                                        },
                                        updfields: updfields
                                    };
                                    sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret1) {
                                        nextfile();
                                        return;
                                    });
                                }
                            ]);
                        },
                        function (err) {
                            // Ende von eachseries
                            callback("Finish", saveret);
                            return;
                        }

                    );
                }
            ],
            function (error, ret) {
                if (error !== "Finish") {
                    ret.err = true;
                    ret.message += " getdirectoryfiles: " + error.message;
                    console.log(ret.message);
                    supercallback4(res, ret);
                    return;
                } else {
                    ret.err = false;
                    ret.message += " getdirectoryfiles: finished";
                    console.log(ret.message);
                    supercallback4(res, ret);
                    return;
                }
            }
        );

    };


    /**
     * importcsv2JSON - csv-Datei einlesen und unter dem keyname in JSON bereitstellen
     * Feldnamen werden aus SQL-Konventionen geändert, "-"" entfällt
     * @param {*} fullname - Pfad zur Datei
     * @param {*} keyname - Feldname, der als Key verwendet wird
     * @param {*} res - Response-Objekt, wird durchgewunken
     * @param {*} callback244
     * returns fullname - Dateiname; counter - Satzzähler; data - JSON-Struktur
     */

    sys0000sys.importcsv2JSON = function (fullname, keyname, res, callback244) {

        var ret = {};

        // erst mal den richtigen Namen bilden
        var counter = 0;
        var result = {};
        if (fullname.length > 0) {
            try {
                fs.createReadStream(fullname)
                    /*
                    .pipe(iconv.decodeStream('iso-8859-15'))
                    .pipe(iconv.encodeStream('utf8'))
                    */
                    .pipe(csv.parse({
                        headers: true,
                        delimiter: ',',
                        ignoreEmpty: true
                    }))
                    .on("data", function (data) {
                        var that = this;
                        that.pause();
                        counter++;
                        if (counter === 1) {
                            console.log(">>>start Vorlauf-Fields<<<");
                            /*
                            for (var key1 in data) {
                                var attrName = key1;
                                var attrValue = data[key1];
                            }
                            */
                        }
                        var key = data[keyname];
                        result[key] = Object.assign({}, data);
                        that.resume(); // holt den nächsten Satz, auch aus waterfall
                    })
                    .on("end", function () {
                        console.log(">>>done Stream<<<");
                        ret.error = false;
                        ret.message = "Importiert";
                        ret.fullname = fullname;
                        ret.counter = counter;
                        ret.data = result;
                        callback244(res, ret);
                    });
            } catch (err) {
                ret.error = true;
                ret.message = "ERROR:" + err;
                callback244(res, ret);
            }
        } else {
            ret.error = true;
            ret.message = "kein Dateiname vorgegeben, kein Import möglich";
            callback244(res, ret);
        }
    };


    /**
     * getlogstatistics filename
     * ":remote-addr :date[iso] :method :url :status :res[content-length] - :response-time ms";
     * returns JSON mit der Statistik
     *
     */
    sys0000sys.getlogstatistics = function (gblInfo, req, res, supercallback) {

        var fullname = "";
        var filename = "";
        var filetype;
        if (req.query && typeof req.query.id !== "undefined" && req.query.id.length > 0) {
            fullname = req.query.id;
        }
        if (req.query && typeof req.query.name !== "undefined" && req.query.name.length > 0) {
            filename = req.query.name;
        }

        var instream = fs.createReadStream(fullname);
        var outstream = new stream();
        var rl = readline.createInterface(instream, outstream);
        var stat = {};
        stat.toptime = {};
        stat.topsize = {};
        stat.toip = {};
        stat.topapp = {};
        stat.hour = {};
        stat.status = {};
        rl.on('line', function (line) {
            // process line here
            var frags = line.split(" ");
            if (frags.length >= 8) {
                var logip = frags[0];
                var logisodate = frags[1];
                var logmethod = frags[2];
                var logurl = frags[3];
                var logstatus = frags[4];
                var logsize = frags[5];
                var str1 = frags[6];
                var logtime = frags[7];
                // console.log(logisodate, logurl, logtime);
                var loghour = logisodate.substr(11, 2);
                var logms = parseFloat(logtime) || 0.0;
                /*
                if (typeof stat.hour[loghour] === "undefined") {
                    stat.hour[loghour] = Object.assign({}, emptybucket);
                }
                stat.hour[loghour].bezug = stat.loghour;
                stat.hour[loghour].count += 1;
                stat.hour[loghour].summs += logms;
                if (logms < stat.hour[loghour].minms) stat.hour[loghour].minms = logms;
                if (logms > stat.hour[loghour].maxms) stat.hour[loghour].maxms = logms;
                stat.hour[loghour].avgms = stat.hour[loghour].summs / stat.hour[loghour].count;
                */
                sys0000sys.addBucket(stat, "hour", loghour, logms);
                sys0000sys.addBucket(stat, "status", logstatus, logms);

                var url1 = logurl;
                if (logurl.indexOf("?") >= 0) {
                    url1 = logurl.substr(0, logurl.indexOf("?"));
                }
                var idis = url1.lastIndexOf(".");
                if (idis > 0) {
                    filetype = url1.substr(idis);
                    filename = url1.substr(0, idis);
                    sys0000sys.addBucket(stat, "filetype", filetype, logms);
                    if (filetype === ".html") {
                        sys0000sys.addBucket(stat, "html", filename + filetype, logms);
                    } else {
                        sys0000sys.addBucket(stat, "files", filename + filetype + "(" + logstatus + ")", logms);
                    }
                    // sys0000sys.addBucket2d(stat, "file", filetype, filename, logms);
                } else {
                    filetype = "API";
                    filename = url1;
                    sys0000sys.addBucket(stat, "api", filename, logms);
                }

                // https://ourcodeworld.com/articles/read/619/top-7-best-table-sorter-javascript-and-jquery-plugins


            }

        });

        rl.on('close', function () {
            // do something on finish here
            supercallback(res, {
                error: false,
                message: "OK",
                stat: stat
            });
            return;
        });

    };

    sys0000sys.addBucket = function (stat, bucket, bezug, logms) {
        var emptybucket = {
            bezug: "",
            count: 0,
            summs: 0,
            sum2: 0,
            minms: 999999999999999,
            maxms: 0,
            avgms: 0.0
        };
        if (typeof stat[bucket] === "undefined") {
            stat[bucket] = {};
        }
        if (typeof stat[bucket][bezug] === "undefined") {
            stat[bucket][bezug] = Object.assign({}, emptybucket);
        }
        stat[bucket][bezug].bezug = bezug;
        stat[bucket][bezug].count += 1;
        stat[bucket][bezug].summs += logms;
        if (logms < stat[bucket][bezug].minms) stat[bucket][bezug].minms = logms;
        if (logms > stat[bucket][bezug].maxms) stat[bucket][bezug].maxms = logms;
        stat[bucket][bezug].avgms = stat[bucket][bezug].summs / stat[bucket][bezug].count;
    };

    sys0000sys.addBucket2d = function (stat, bucket1, bucket2, bezug, logms) {
        var emptybucket = {
            bezug: "",
            count: 0,
            summs: 0,
            sum2: 0,
            minms: 999999999999999,
            maxms: 0,
            avgms: 0.0
        };
        if (typeof stat[bucket1] === "undefined") {
            stat[bucket1] = {};
        }
        if (typeof stat[bucket1][bucket2] === "undefined") {
            stat[bucket1][bucket2] = {};
        }
        if (typeof stat[bucket1][bucket2][bezug] === "undefined") {
            stat[bucket1][bucket2][bezug] = Object.assign({}, emptybucket);
        }
        stat[bucket1][bucket2][bezug].bezug = bezug;
        stat[bucket1][bucket2][bezug].count += 1;
        stat[bucket1][bucket2][bezug].summs += logms;
        if (logms < stat[bucket1][bucket2][bezug].minms) stat[bucket1][bucket2][bezug].minms = logms;
        if (logms > stat[bucket1][bucket2][bezug].maxms) stat[bucket1][bucket2][bezug].maxms = logms;
        stat[bucket1][bucket2][bezug].avgms = stat[bucket1][bucket2][bezug].summs / stat[bucket1][bucket2][bezug].count;
    };


    /**
     * gethtmllinks url aufrufen und links extrahieren
     * Übergabe in ret.linkliste als array
     */
    sys0000sys.gethtmllinks = function (gbldb, async, ObjectID, uihelper, req, res, supercallback1) {

        var url = "";
        var directory = "";
        if (req.query && typeof req.query.url !== "undefined" && req.query.url.length > 0) {
            url = req.query.url;
        }
        if (req.query && typeof req.query.directory !== "undefined" && req.query.directory.length > 0) {
            directory = req.query.directory;
        }
        console.log(url);
        async.waterfall([
                function (callback) {
                    /**
                     * Dateinamen filtern
                     */
                    var ret = {};
                    ret.linkliste = [];
                    request(url, {
                        json: true
                    }, function (err, res1, body) {
                        //body = body.replace(new RegExp('\r?\n', 'g'), '<br />');
                        if (err) {

                        } else {
                            var parser = new htmlparser2.Parser({
                                onopentag(tagname, attribs) {
                                    if (tagname === "a" && typeof attribs.href !== "undefined") {
                                        console.log(attribs.href);
                                        ret.linkliste.push(attribs.href);
                                    }
                                },
                                ontext(text) {
                                    // console.log("-->", text);
                                },
                                onclosetag(tagname) {
                                    if (tagname === "script") {
                                        //   console.log("That's it?!");
                                    }
                                }
                            }, {
                                decodeEntities: true
                            });
                            parser.write(body);
                            parser.end();
                            callback(null, ret);
                        }
                    });
                },
                function (ret, callback) {
                    callback(null, ret);
                }
            ],
            function (error, ret) {
                ret.error = false;
                ret.message = "HTML Parse beendet";
                supercallback1(res, ret);
            }
        );
    };

    /**
     * geturllinksfiles - Dateien aus url mit link holen
     * und in Zielverzeichnis schreiben
     */
    sys0000sys.geturllinksfiles = function (gblInfo, gbldb, async, ObjectID, uihelper, req, res, supercallback1) {

        var url = "";
        var linkarray = [];
        var directory = "";
        if (req.body && typeof req.body.url !== "undefined" && req.body.url.length > 0) {
            url = req.body.url;
        }
        if (req.body && typeof req.body.directory !== "undefined" && req.body.directory.length > 0) {
            directory = req.body.directory;
        }
        if (req.body && typeof req.body.linkarray !== "undefined" && req.body.linkarray.length > 0) {
            linkarray = req.body.linkarray;
        }
        console.log(url);
        var dir = path.join(gblInfo.rootDirectory, "/../klima1001/");
        var targetdir = path.join(dir, directory);
        if (!fs.existsSync(targetdir)) {
            fs.mkdirSync(targetdir);
            console.log("ANGELEGT:" + targetdir);
        }
        var ret = {};
        async.eachSeries(linkarray, function (linkname, nextlink) {
            /**
             * Dateinamen bilden, url bilden, Datei download
             */
            var fileurl = url + linkname;
            var options = {
                directory: targetdir,
                filename: linkname
            };
            download(fileurl, options, function (err) {
                if (err) throw err;
                nextlink();
            });

        }, function (err) {
            supercallback1(res, ret);
        });
    };

    /**
     * transhyde - HYDE Daten aufbereiten für vorgegebene Jahre
     * und Bezüge:
     * fullname - HYDE-Anker-Verzeichnis für die rekursive Auflösung
     * selyears - Liste der Jahre, die auszuwerten sind: yyy,yyyy-yyyy
     * adbc - AD oder BC
     * rootname - Verzeichnis für die Ausgabe von Dateien, default static/temp/hyde/<dateiname>
     * stationids - optional, für liste von stationid's für die station-Auswertung, wenn vorhanden
     *              dann wird je stationid eine Datei ausgegeben
     * lats - optional, bei true Ausgabe der hydelats.txt-Datei wie bisher
     * globals - true, dann statische Daten aus general_files auswerten
     * sonst werden die total-Auswertung und die Auswertung je Klimazone ausgegeben
     *
     *
     * und Ablegen auf dem Server, erst JSON, später mal sehen
     * Parameter sind url, predirectory, directory, filename
     * Rückgabe ret.data als Objekt mit Parametern von
     * Esri ASCII-Raster-Format mit:
        NCOLS xxx
        NROWS xxx
        XLLCORNER xxx
        YLLCORNER xxx
        CELLSIZE xxx
        NODATA_VALUE xxx
        row 1
        row 2
        ...
        row n
        sowie Randauszählung der Ländercodes (Spezialfall) und der null-Values (-9999)
        dann kommt Tabelle der relevanten Punkte, hier: Deutschland im ersten Test
        var linkname = mydata[i].linkname;
            var archive = mydata[i].archive;
            var sitename = mydata[i].sitename;
            var longitude = Number(mydata[i].longitude);
            var latitude = Number(mydata[i].latitude);
    Neue Exports - Dateinamenskonventionen:
    hydetot.txt - Gesamtsummen pro Jahr <year>
    hydeC<climatezone>.txt - Gesamtsummen pro Klimazone <climatezone> pro Jahr,
        dies wird für alle Klimazonen berechnet
    und nur bei speziellen Aufrufparametern
    hydeS<stationid>.txt Werte zur Zelle einer Station pro Jahr,
        dazu Wert je 1 + 8, 1 + 8 + 16 etc. Zellen, also die Stationszelle und Nachbarzellen
        in wachsendem Umfeld, das wird eine Herausforderung, kann aber gut erledigt werden,
        wird nur für ausgewählte Stationen berechnet als Umfeldindikatoren.
        Für das Umfeld einer Station ist das relativ homogen zu sehen, ist erst mal ein pragmatischer Start,
        der mit den Quadratmetern anfängt.
    */

    sys0000sys.transhyde = function (rootname, fs, async, req, reqparm, res, callbackh) {
        var hydedata = {};

        var files = [];
        var predirectory = "";
        var directory = "";
        var filename = "";
        var trule = "";
        var ret = {};
        ret.data = [];
        // hierarchie year - lats -
        var result = {};
        /**
         * erst mal den Baum holen
         */
        var fullname = "";
        var outdir = [];
        var selyears = "";
        var selvars = "";
        var adbc = "AD";
        var stationids = []; // aufbereitetes Array, aus kommaseparierter Liste
        var lats = false;
        var globals = false; // aus general_files
        var hydetot = {}; // Vorlage für die Ausgabe
        var hydezone = {}; // hyde climatezones Vorlage für die Ausgabe
        var hydecont = {}; // hyde continents Vorlage für die Ausgabe
        var hydestation = {}; // wird bei Ausgabe differenziert
        if (typeof req !== "undefined" && req !== null) {
            if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
                fullname = req.query.fullname;
            }
            if (req.query && typeof req.query.outdir !== "undefined" && req.query.outdir.length > 0) {
                outdir = req.query.outdir;
            }

            if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
                selyears = req.query.selyears;
            }
            if (req.query && typeof req.query.selvars !== "undefined" && req.query.selvars.length > 0) {
                selvars = req.query.selvars;
            }
            if (req.query && typeof req.query.adbc !== "undefined" && req.query.adbc.length > 0) {
                adbc = req.query.adbc;
            }
            if (req.query && typeof req.query.rootname !== "undefined" && req.query.rootname.length > 0) {
                rootname = req.query.rootname;
            }
            if (req.query && typeof req.query.stationids !== "undefined" && req.query.stationids.length > 0) {
                stationids = req.query.stationids.split(",");
            }
            if (req.query && typeof req.query.lats !== "undefined") {
                if (typeof req.query.lats === "string" && req.query.lats.length > 0 &&
                    (req.query.lats === "true" || req.query.lats === "-1")) {
                    lats = true;
                }
            }
            if (req.query && typeof req.query.globals !== "undefined") {
                if (typeof req.query.globals === "string" && req.query.globals.length > 0 &&
                    (req.query.globals === "true" || req.query.globals === "-1")) {
                    globals = true;
                }
            }
        } else if (typeof reqparm !== "undefined" && reqparm !== null) {
            if (reqparm && typeof reqparm.fullname !== "undefined" && reqparm.fullname.length > 0) {
                fullname = reqparm.fullname;
            }
            if (reqparm && typeof reqparm.outdir !== "undefined" && reqparm.fullname.outdir > 0) {
                outdir = reqparm.outdir;
            }
            if (reqparm && typeof reqparm.selyears !== "undefined" && reqparm.selyears.length > 0) {
                selyears = reqparm.selyears;
            }
            if (reqparm && typeof reqparm.selvars !== "undefined" && reqparm.selvars.length > 0) {
                selvars = reqparm.selvars;
            }
            if (reqparm && typeof reqparm.adbc !== "undefined" && reqparm.adbc.length > 0) {
                adbc = reqparm.adbc;
            }
            if (reqparm && typeof reqparm.rootname !== "undefined" && reqparm.rootname.length > 0) {
                rootname = reqparm.rootname;
            }
            if (reqparm && typeof reqparm.stationids !== "undefined" && reqparm.stationids.length > 0) {
                stationids = reqparm.stationids.split(",");
            }
            if (reqparm.query && typeof reqparm.lats !== "undefined") {
                if (typeof reqparm.lats === "string" && reqparm.lats.length > 0 &&
                    (reqparm.lats === "true" || reqparm.lats === "-1")) {
                    lats = true;
                }
            }
            if (reqparm.query && typeof reqparm.globals !== "undefined") {
                if (typeof reqparm.globals === "string" && reqparm.globals.length > 0 &&
                    (reqparm.globals === "true" || reqparm.globals === "-1")) {
                    globals = true;
                }
            }
        }
        selvars = selvars.replace(/_/g, "");
        if (fullname.length === 0) {
            // "G:\\Projekte\klimadaten\"HYDE_lu_pop_proxy"\baseline\asc\2008AD_pop\rurc_2008AD.asc"
            fullname = path.join("G:", "Projekte");
            fullname = path.join(fullname, "klimadaten");
            fullname = path.join(fullname, "HYDE_lu_pop_proxy");
            if (globals === false) {
                fullname = path.join(fullname, "baseline");
                fullname = path.join(fullname, "asc");
            } else {
                fullname = path.join(fullname, "general_files");
            }
            if (!fs.existsSync(fullname)) {
                // hier ausweichverzeichnis prüfen
                callbackh(res, {
                    error: true,
                    message: "keine HYDE-Datenverzeichnis vorgegeben"
                });
                return;
            }
        } else {
            if (!fs.existsSync(fullname)) {
                // hier ausweichverzeichnis prüfen
                callbackh(res, {
                    error: true,
                    message: "keine HYDE-Datenverzeichnis vorgegeben"
                });
                return;
            }
        }
        /**
         * Bestimmung der Kandidaten-Dateinamen
         */
        var firstdir = fullname;
        var filelist = [];
        filelist = walkSync(firstdir, filelist, globals, selyears, selvars, adbc);
        linfilelist.sort(function (a, b) {
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        });
        console.log("HYDE-Files gefunden:" + linfilelist.length);

        var filecounter = 0;
        var valcounter = 0;
        async.eachSeries(linfilelist, function (fullfilename, nextfile) {
                /**
                 * Iteration über die gefundenen Dateien fullfilename
                 */
                filecounter++;
                if (filecounter > 1000000) {
                    var err = new Error('Broke out of async');
                    err.break = true;
                    return nextfile(err);
                }
                var ext = path.extname(fullfilename);
                if (ext !== ".asc") {
                    console.log("Falscher Dateityp, skipped:" + fullfilename);
                    nextfile();
                    return;
                }
                console.log(fullfilename + " Started");
                valcounter = 0;
                async.waterfall([
                        function (callbackn) {
                            // fullfilename zerlegen für Feldname, Jahr
                            var filename = path.basename(fullfilename);
                            var fparts = filename.match(/([a-zA-Z_]*)(\d*)(BC|AD)/);
                            var variablename = "";
                            var year;
                            if (fparts !== null) {
                                variablename = fparts[1];
                                if (typeof hydedata.variables === "undefined") {
                                    hydedata.variables = {};
                                }
                                year = fparts[2];
                                if (year.length > 0) {
                                    year = ("0000" + year).slice(-4);
                                }
                                if (typeof hydedata[year] === "undefined") {
                                    hydedata[year] = {};
                                }
                            } else {
                                var idis = filename.indexOf(".");
                                variablename = filename.substr(0, idis);
                                if (typeof hydedata.variables === "undefined") {
                                    hydedata.variables = {};
                                }
                            }
                            // variablename erst innerhalb der lats unten
                            var ret = {
                                error: false,
                                message: "start",
                                fullfilename: fullfilename,
                                year: year,
                                variablename: variablename
                            };
                            callbackn(null, res, ret);
                            return;
                        },
                        function (res, ret, callbacko) {
                            // file lesen und Update der Zielstruktur
                            var year = ret.year;
                            var variablename = ret.variablename;
                            var linecount = 0;
                            var metadata = {};
                            var metafields = {};
                            var datamat = []; // zweidimensional erst mal
                            var hitcells = [];
                            var rowcount = 0;
                            var hitcount = 0;
                            var headfields = [];
                            var datafields = [];
                            var datalinecounter = 0;
                            // ret.filepath = path.join(ret.directory, filename, selyears);
                            var readInterface = readline.createInterface({
                                input: fs.createReadStream(ret.fullfilename),
                                console: false
                            });
                            readInterface.on('line', function (line) {
                                //console.log(line);
                                if (line.substr(0, 1) === " ") {
                                    line = line.trim();
                                }
                                var lline = line.toLocaleLowerCase();
                                var fld = "";
                                if (lline.startsWith("ncols")) {
                                    fld = lline.replace("ncols", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.ncols = parseInt(fld);
                                } else if (lline.startsWith("nrows")) {
                                    fld = lline.replace("nrows", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.nrows = parseInt(fld);
                                } else if (lline.startsWith("xllcorner")) {
                                    fld = lline.replace("xllcorner", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.xllcorner = parseInt(fld);
                                } else if (lline.startsWith("yllcorner")) {
                                    fld = lline.replace("yllcorner", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.yllcorner = parseInt(fld);
                                } else if (lline.startsWith("cellsize")) {
                                    fld = lline.replace("cellsize", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.cellsize = Number(fld) || 0;
                                } else if (lline.startsWith("nodata_value")) {
                                    fld = lline.replace("nodata_value", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.NODATA_value = fld;
                                } else {
                                    /**
                                     * hier kommen die Daten, VIELE DATEN!!!
                                     */
                                    rowcount++;
                                    // Problem: es gibt Zeilen, die mit Blank beginnen
                                    var rowcells = line.split(" ");
                                    // Sizing-Test, volle Matrix im Speicher
                                    datamat.push(rowcells);
                                    // hydedata[year][variablename]
                                    var y = rowcount;
                                    var latitude = parseFloat(metafields.yllcorner + (metafields.nrows - y) * metafields.cellsize);
                                    /**
                                     * getlatfieldsp - latitude wird vorgegeben,
                                     * hier: explizite Dezimalstellen mit . getrennt und -999 für Missing!!!
                                     * Struktur wird zurückgegeben mit
                                     * lat - Gerundet auf ganzzahlige latitude
                                     * latn - Nord/Süd-Wert, mit Präfix für Nord oder Süd, zweistellig
                                     * lats - Sortierwert von 000 = Nordpol bis 180 = Südpol und lat dahinter
                                     */
                                    var lat = kla9020fun.getlatfieldsp("" + latitude);
                                    var climatezone = "*";
                                    var climateerg = uihelper.getClimateZone(latitude);
                                    if (climateerg !== false) {
                                        climatezone = climateerg.value;
                                    } else {
                                        console.log(latitude);
                                    }
                                    var lastcell = rowcells.length; //
                                    var summe = 0;
                                    var minval = null;
                                    var maxval = null;
                                    var icount = 0;
                                    for (var i = 0; i < lastcell; i++) {
                                        /**
                                         * hier die Zellen auf signifikante Werte abprüfen
                                         */
                                        var x = i + 1;
                                        var longitude = parseFloat(metafields.xllcorner + (x * metafields.cellsize));
                                        var wert = rowcells[i];
                                        if (!wert.startsWith("-9999")) {
                                            if (!isNaN(wert) && parseInt(wert) !== 0) {
                                                icount++;
                                                valcounter++;
                                                if (wert.indexOf(".") >= 0) {
                                                    summe += parseFloat(wert) || 0;
                                                } else {
                                                    summe += parseInt(wert) || 0;
                                                }
                                                if (minval === null) {
                                                    minval = wert;
                                                } else if (wert < minval) {
                                                    minval = wert;
                                                }
                                                if (maxval === null) {
                                                    maxval = wert;
                                                } else if (wert > maxval) {
                                                    maxval = wert;
                                                }
                                                /**
                                                 * hier wird es sehr speziell, weil hydecont
                                                 * für die Kontinente aus den Zellen berechnet wird!!!
                                                 * 1. Bestimmung Kontinentalzone
                                                 * 2. Addieren in Kontinentalzone
                                                 */
                                                var continentobj = uihelper.getContinent(longitude, latitude);
                                                if (continentobj.error === false) {
                                                    var continent = continentobj.continentcode;
                                                    if (typeof hydecont[continent] === "undefined") {
                                                        hydecont[continent] = {};
                                                    }
                                                    if (globals === false) {
                                                        if (typeof hydecont[continent][year] === "undefined") {
                                                            hydecont[continent][year] = {};
                                                        }
                                                        if (typeof hydecont[continent][year][variablename] === "undefined") {
                                                            hydecont[continent][year][variablename] = {
                                                                count: 0,
                                                                summe: 0.0,
                                                            };
                                                        }
                                                        hydecont[continent][year][variablename].count += 1;
                                                        hydecont[continent][year][variablename].summe += parseFloat(wert);
                                                    } else {
                                                        if (typeof hydecont[continent][variablename] === "undefined") {
                                                            hydecont[continent][variablename] = {
                                                                count: 0,
                                                                summe: 0.0,
                                                            };
                                                        }
                                                        hydecont[continent][variablename].count += 1;
                                                        hydecont[continent][variablename].summe += parseFloat(wert);
                                                    }
                                                }
                                            } else {
                                                if (isNaN(wert)) console.log(variablename + " NaN:" + wert);
                                            }
                                        }
                                    }
                                    /**
                                     * Aufbereitung von summe, minval und maxval je row
                                     * Gesamtsummen je Jahr
                                     *
                                     */
                                    // Verdichtung hydetot
                                    if (icount > 0) {
                                        if (globals === false) {
                                            if (typeof hydetot[year] === "undefined") {
                                                hydetot[year] = {};
                                            }
                                            if (typeof hydetot[year][variablename] === "undefined") {
                                                hydetot[year][variablename] = {
                                                    count: 0,
                                                    summe: 0.0,
                                                };
                                            }
                                            hydetot[year][variablename].count += icount;
                                            hydetot[year][variablename].summe += summe;
                                        } else {
                                            if (typeof hydetot[variablename] === "undefined") {
                                                hydetot[variablename] = {
                                                    count: 0,
                                                    summe: 0.0,
                                                };
                                            }
                                            hydetot[variablename].count += icount;
                                            hydetot[variablename].summe += summe;
                                        }
                                    }
                                    // Verdichtung hydezone
                                    if (icount > 0) {
                                        if (globals === false) {
                                            if (typeof hydezone[climatezone] === "undefined") {
                                                hydezone[climatezone] = {};
                                            }
                                            if (typeof hydezone[climatezone][year] === "undefined") {
                                                hydezone[climatezone][year] = {};
                                            }
                                            if (typeof hydezone[climatezone][year][variablename] === "undefined") {
                                                hydezone[climatezone][year][variablename] = {
                                                    count: 0,
                                                    summe: 0.0,
                                                };
                                            }
                                            hydezone[climatezone][year][variablename].count += icount;
                                            hydezone[climatezone][year][variablename].summe += summe;
                                        } else {
                                            if (typeof hydezone[climatezone] === "undefined") {
                                                hydezone[climatezone] = {};
                                            }
                                            if (typeof hydezone[climatezone][variablename] === "undefined") {
                                                hydezone[climatezone][variablename] = {
                                                    count: 0,
                                                    summe: 0.0,
                                                };
                                            }
                                            hydezone[climatezone][variablename].count += icount;
                                            hydezone[climatezone][variablename].summe += summe;
                                        }
                                    }
                                    // alte lats-Aufbereitung, jetzt bedingt; hydedata[year][variablename] = {};
                                    if (icount > 0 && lats === true) {
                                        if (typeof hydedata[year][lat.lats] === "undefined") {
                                            hydedata[year][lat.lats] = {};
                                        }
                                        if (typeof hydedata[year][lat.lats][variablename] === "undefined") {
                                            hydedata[year][lat.lats][variablename] = 0;
                                        }
                                        hydedata[year][lat.lats][variablename] += summe;
                                        if (typeof hydedata.variables[variablename] === "undefined") {
                                            hydedata.variables[variablename] = {
                                                count: 0,
                                                min: null,
                                                max: null
                                            };
                                        }
                                        var vglwert = hydedata[year][lat.lats][variablename];
                                        hydedata.variables[variablename].count++;
                                        if (hydedata.variables[variablename].min === null) {
                                            hydedata.variables[variablename].min = vglwert;
                                        } else if (vglwert < hydedata.variables[variablename].min) {
                                            hydedata.variables[variablename].min = vglwert;
                                        }
                                        if (hydedata.variables[variablename].max === null) {
                                            hydedata.variables[variablename].max = vglwert;
                                        } else if (vglwert > hydedata.variables[variablename].max) {
                                            hydedata.variables[variablename].max = vglwert;
                                        }
                                    }
                                }
                            });
                            readInterface.on('close', function () {
                                // do something on finish here
                                console.log("Finished:" + valcounter);
                                callbacko("Finish", res, ret);
                                return;
                            });
                        }
                    ],
                    function (error, ret) {
                        nextfile();
                        return;
                    });
            },
            function () {
                /**
                 * Ausgabe Ergebnisdatei(en)
                 * no such file or directory, mkdir 'C:\Projekte\re-klima\apps\re-frame\static\temp'
                 */
                var fullpath = "";
                var fpath = "";
                var targetpath = path.join(rootname, "static");
                targetpath = path.join(targetpath, "temp");
                if (!fs.existsSync(targetpath)) {
                    fs.mkdirSync(targetpath);
                }

                if (typeof outdir === "object" && Array.isArray(outdir)) {
                    for (var ifilename = 0; ifilename < outdir.length; ifilename++) {
                        var outdir1 = outdir[ifilename].replace(/[><=]/g, "");
                        targetpath = path.join(targetpath, outdir1);
                        if (!fs.existsSync(targetpath)) {
                            fs.mkdirSync(targetpath);
                        }
                    }
                    fullpath = targetpath;
                    // der echte Dateiname kommt erst später
                } else {
                    if (typeof outdir === "undefined" || outdir.length === 0) {
                        outdir = "hyde";
                    }
                    fullpath = path.join(targetpath, outdir);
                }
                fpath = fullpath.substr(fullpath.indexOf("static") + 7);
                //var filnr = Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000;
                async.waterfall([
                        function (cb0000Z0) {
                            var datafilename = "hydelats.txt";
                            var fulldatafilename = path.join(fullpath, datafilename);
                            if (lats === true) {
                                fs.writeFile(fulldatafilename, JSON.stringify(hydedata), {
                                    encoding: 'utf8',
                                    flag: 'w'
                                }, function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(fulldatafilename + " Finished:" + filecounter);
                                    }
                                    cb0000Z0(null, res, {
                                        error: false,
                                        message: err || "OK",
                                        fullpath: fullpath
                                    });
                                    return;
                                });
                            } else {
                                cb0000Z0(null, res, {
                                    error: false,
                                    message: "OK",
                                    fullpath: fullpath
                                });
                                return;
                            }
                        },
                        function (res, ret, cb0000Z1) {
                            /**
                             * neue Ausgabe hydetot.txt
                             */
                            var datafilename = "hydetot.txt";
                            if (globals === true) datafilename = "hydeglobal.txt";
                            var fulldatafilename = path.join(ret.fullpath, datafilename);
                            fs.writeFile(fulldatafilename, JSON.stringify(hydetot), {
                                encoding: 'utf8',
                                flag: 'w'
                            }, function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("Finished-Files processed:" + filecounter);
                                }
                                cb0000Z1(null, res, {
                                    error: false,
                                    message: err || "OK",
                                    fullpath: ret.fullpath
                                });
                                return;
                            });
                        },
                        function (res, ret, cb0000Z2) {
                            /**
                             * neue Ausgabe hydezone.txt
                             */
                            var datafilename = "hydezone.txt";
                            if (globals === true) datafilename = "hydeglobalzone.txt";
                            var fulldatafilename = path.join(ret.fullpath, datafilename);
                            fs.writeFile(fulldatafilename, JSON.stringify(hydezone), {
                                encoding: 'utf8',
                                flag: 'w'
                            }, function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("hydezone processed:" + filecounter);
                                }
                                cb0000Z2(null, res, {
                                    error: false,
                                    message: err || "OK",
                                    fullpath: ret.fullpath
                                });
                                return;
                            });
                        },
                        function (res, ret, cb0000Z3) {
                            /**
                             * neue Ausgabe hydezone.txt
                             */
                            var datafilename = "hydecont.txt";
                            if (globals === true) datafilename = "hydeglobalcont.txt";
                            var fulldatafilename = path.join(ret.fullpath, datafilename);
                            fs.writeFile(fulldatafilename, JSON.stringify(hydecont), {
                                encoding: 'utf8',
                                flag: 'w'
                            }, function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("hxdecont processed:" + filecounter);
                                }
                                cb0000Z3("Finish", res, {
                                    error: false,
                                    message: err || "OK",
                                    fullpath: ret.fullpath
                                });
                                return;
                            });
                        }
                    ],
                    function (error, res, ret) {
                        callbackh(res, ret);
                        return;
                    });
            });
        // G:\Projekte\klimadaten\HYDE_lu_pop_proxy\baseline\asc\2008AD_pop\rurc_2008AD.asc
    };


    /**
     * stationhyde - HYDE Daten aufbereiten für Stationid nach Klimabuckets ab 1961 in 30-ern
     * Bezüge
     * fullname - HYDE-Anker-Verzeichnis für die rekursive Auflösung
     * Perioden ab 1661 in 30-er Sprüngen, wo Daten vorhanden sind
     * es wird der letzte Jahreswert in einem Bucket ausgewertet
     * adbc - AD oder BC, hier immer AD
     * rootname - Verzeichnis für die Ausgabe von Dateien, default static/temp/hyde/<stationid>.txt
     * stationids - optional, für liste von stationid's für die station-Auswertung, wenn vorhanden
     *              dann wird je stationid eine Datei ausgegeben
     * globals - true, dann statische Daten aus general_files auswerten
     * sonst werden die total-Auswertung und die Auswertung je Klimazone ausgegeben
     *
     * und Ablegen auf dem Server, erst JSON, später mal sehen
     * Parameter sind url, predirectory, directory, filename
     * Rückgabe ret.data als Objekt mit Parametern von
     * Esri ASCII-Raster-Format mit:
        NCOLS xxx
        NROWS xxx
        XLLCORNER xxx
        YLLCORNER xxx
        CELLSIZE xxx
        NODATA_VALUE xxx
        row 1
        row 2
        ...
        row n
        sowie Randauszählung der Ländercodes (Spezialfall) und der null-Values (-9999)
        dann kommt Tabelle der relevanten Punkte, hier: Deutschland im ersten Test
        var linkname = mydata[i].linkname;
            var archive = mydata[i].archive;
            var sitename = mydata[i].sitename;
            var longitude = Number(mydata[i].longitude);
            var latitude = Number(mydata[i].latitude);
    Neue Exports - Dateinamenskonventionen:
    hydetot.txt - Gesamtsummen pro Jahr <year>
    hydeC<climatezone>.txt - Gesamtsummen pro Klimazone <climatezone> pro Jahr,
        dies wird für alle Klimazonen berechnet
    und nur bei speziellen Aufrufparametern
    hydeS<stationid>.txt Werte zur Zelle einer Station pro Jahr,
        dazu Wert je 1 + 8, 1 + 8 + 16 etc. Zellen, also die Stationszelle und Nachbarzellen
        in wachsendem Umfeld, das wird eine Herausforderung, kann aber gut erledigt werden,
        wird nur für ausgewählte Stationen berechnet als Umfeldindikatoren.
        Für das Umfeld einer Station ist das relativ homogen zu sehen, ist erst mal ein pragmatischer Start,
        der mit den Quadratmetern anfängt.
    */

    sys0000sys.stationhyde = function (db, rootname, fs, async, req, reqparm, res, callbackh) {
        var hydedata = {};

        var files = [];
        var predirectory = "";
        var directory = "";
        var filename = "";
        var trule = "";
        var ret = {};
        ret.data = [];
        // hierarchie year - lats -
        var result = {};
        /**
         * erst mal den Baum holen
         */
        var fullname = "";
        var outdir = [];
        var selyears = "";
        var selvars = "";
        var adbc = "AD";
        var stationids = []; // aufbereitetes Array, aus kommaseparierter Liste
        var stationid = "";
        var name = "";
        var longitude = 0;
        var latitude = 0;
        var metafields = {};

        var globals = false; // aus general_files
        var hydetot = {}; // Vorlage für die Ausgabe
        var hydezone = {}; // hyde climatezones Vorlage für die Ausgabe
        var hydecont = {}; // hyde continents Vorlage für die Ausgabe
        var hydestation = {}; // wird bei Ausgabe differenziert
        if (typeof req !== "undefined" && req !== null) {
            if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
                fullname = req.query.fullname;
            }
            if (req.query && typeof req.query.outdir !== "undefined" && req.query.outdir.length > 0) {
                outdir = req.query.outdir;
            }

            if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
                selyears = req.query.selyears;
            }
            if (req.query && typeof req.query.selvars !== "undefined" && req.query.selvars.length > 0) {
                selvars = req.query.selvars;
            }
            if (req.query && typeof req.query.adbc !== "undefined" && req.query.adbc.length > 0) {
                adbc = req.query.adbc;
            }
            if (req.query && typeof req.query.rootname !== "undefined" && req.query.rootname.length > 0) {
                rootname = req.query.rootname;
            }
            if (req.query && typeof req.query.stationids !== "undefined" && req.query.stationids.length > 0) {
                stationids = req.query.stationids.split(",");
            }
            if (req.query && typeof req.query.stationid !== "undefined" && req.query.stationid.length > 0) {
                stationid = req.query.stationid;
            }
            if (req.query && typeof req.query.name !== "undefined" && req.query.name.length > 0) {
                name = req.query.name;
            }
            if (req.query && typeof req.query.longitude !== "undefined" && req.query.longitude.length > 0) {
                longitude = req.query.longitude;
            }
            if (req.query && typeof req.query.latitude !== "undefined" && req.query.latitude.length > 0) {
                latitude = req.query.latitude;
            }

            if (req.query && typeof req.query.globals !== "undefined") {
                if (typeof req.query.globals === "string" && req.query.globals.length > 0 &&
                    (req.query.globals === "true" || req.query.globals === "-1")) {
                    globals = true;
                }
            }
        } else if (typeof reqparm !== "undefined" && reqparm !== null) {
            if (reqparm && typeof reqparm.fullname !== "undefined" && reqparm.fullname.length > 0) {
                fullname = reqparm.fullname;
            }
            if (reqparm && typeof reqparm.outdir !== "undefined" && reqparm.fullname.outdir > 0) {
                outdir = reqparm.outdir;
            }
            if (reqparm && typeof reqparm.selyears !== "undefined" && reqparm.selyears.length > 0) {
                selyears = reqparm.selyears;
            }
            if (reqparm && typeof reqparm.selvars !== "undefined" && reqparm.selvars.length > 0) {
                selvars = reqparm.selvars;
            }
            if (reqparm && typeof reqparm.adbc !== "undefined" && reqparm.adbc.length > 0) {
                adbc = reqparm.adbc;
            }
            if (reqparm && typeof reqparm.rootname !== "undefined" && reqparm.rootname.length > 0) {
                rootname = reqparm.rootname;
            }
            if (reqparm && typeof reqparm.stationids !== "undefined" && reqparm.stationids.length > 0) {
                stationids = reqparm.stationids.split(",");
            }

            if (reqparm.query && typeof reqparm.globals !== "undefined") {
                if (typeof reqparm.globals === "string" && reqparm.globals.length > 0 &&
                    (reqparm.globals === "true" || reqparm.globals === "-1")) {
                    globals = true;
                }
            }
        }
        selvars = selvars.replace(/_/g, "");

        if (fullname.length === 0) {
            // "G:\\Projekte\klimadaten\"HYDE_lu_pop_proxy"\baseline\asc\2008AD_pop\rurc_2008AD.asc"
            fullname = path.join("G:", "Projekte");
            fullname = path.join(fullname, "klimadaten");
            fullname = path.join(fullname, "HYDE_lu_pop_proxy");
            if (globals === false) {
                fullname = path.join(fullname, "baseline");
                fullname = path.join(fullname, "asc");
            } else {
                fullname = path.join(fullname, "general_files");
            }
            if (!fs.existsSync(fullname)) {
                // hier ausweichverzeichnis prüfen
                callbackh(res, {
                    error: true,
                    message: "keine HYDE-Datenverzeichnis vorgegeben"
                });
                return;
            }
        } else {
            if (!fs.existsSync(fullname)) {
                // hier ausweichverzeichnis prüfen
                callbackh(res, {
                    error: true,
                    message: "keine HYDE-Datenverzeichnis vorgegeben"
                });
                return;
            }
        }
        /**
         * Bestimmung der Kandidaten-Dateinamen
         */
        var firstdir = fullname;
        var filelist = [];
        // selyears wird konstruiert für die Station-Klimadaten
        selyears = "1750,1780,1810,1840,1870,1900,1930,1960,1990,2017";
        filelist = walkSync(firstdir, filelist, globals, selyears, selvars, adbc);
        linfilelist.sort(function (a, b) {
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        });
        // Berechnung der Konturen um eine Station herum
        console.log("HYDE-Files gefunden:" + linfilelist.length);

        var filecounter = 0;
        var valcounter = 0;
        var klihyde = {
            source: "HYDE",
            stationid: stationid,
            name: name,
            longitude: longitude,
            latitude: latitude,
            rasterx: 0,
            rastery: 0,
            areas: {},
            data: {}
        };
        async.eachSeries(linfilelist, function (fullfilename, nextfile) {
                /**
                 * Iteration über die gefundenen Dateien fullfilename
                 */
                filecounter++;
                if (filecounter > 1000000) {
                    var err = new Error('Broke out of async');
                    err.break = true;
                    return nextfile(err);
                }
                var ext = path.extname(fullfilename);
                if (ext !== ".asc") {
                    console.log("Falscher Dateityp, skipped:" + fullfilename);
                    nextfile();
                    return;
                }
                console.log(fullfilename + " Started");
                valcounter = 0;
                async.waterfall([
                        function (callbackn) {
                            // fullfilename zerlegen für Feldname, Jahr
                            var filename = path.basename(fullfilename);
                            var fparts = filename.match(/([a-zA-Z_]*)(\d*)(BC|AD)/);
                            var variablename = "";
                            var year;
                            if (fparts !== null) {
                                variablename = fparts[1];
                                if (typeof hydedata.variables === "undefined") {
                                    hydedata.variables = {};
                                }
                                year = fparts[2];
                                if (year.length > 0) {
                                    year = ("0000" + year).slice(-4);
                                }
                                if (typeof hydedata[year] === "undefined") {
                                    hydedata[year] = {};
                                }
                            } else {
                                var idis = filename.indexOf(".");
                                variablename = filename.substr(0, idis);
                                if (typeof hydedata.variables === "undefined") {
                                    hydedata.variables = {};
                                }
                            }
                            // variablename erst innerhalb der lats unten
                            var ret = {
                                error: false,
                                message: "start",
                                fullfilename: fullfilename,
                                year: year,
                                variablename: variablename
                            };
                            callbackn(null, res, ret);
                            return;
                        },
                        function (res, ret, callbacko) {
                            // file lesen und Update der Zielstruktur
                            var year = ret.year;
                            var variablename = ret.variablename;
                            var linecount = 0;
                            var metadata = {};
                            metafields = {};
                            var datamat = []; // zweidimensional erst mal
                            var cells = []; // Hyde-Daten, Zeilen und Spalten
                            var rowcount = 0;
                            var hitcount = 0;
                            var headfields = [];
                            var datafields = [];
                            var datalinecounter = 0;

                            var lcontrol = [];

                            var hydeerg = {
                                L1: 0,
                                L2: 0,
                                L3: 0
                            };

                            // ret.filepath = path.join(ret.directory, filename, selyears);
                            var readInterface = readline.createInterface({
                                input: fs.createReadStream(ret.fullfilename),
                                console: false
                            });
                            readInterface.on('line', function (line) {
                                //console.log(line);
                                if (line.substr(0, 1) === " ") {
                                    line = line.trim();
                                }
                                var lline = line.toLocaleLowerCase();
                                var fld = "";
                                if (lline.startsWith("ncols")) {
                                    fld = lline.replace("ncols", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.ncols = parseInt(fld);
                                } else if (lline.startsWith("nrows")) {
                                    fld = lline.replace("nrows", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.nrows = parseInt(fld);
                                } else if (lline.startsWith("xllcorner")) {
                                    fld = lline.replace("xllcorner", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.xllcorner = parseInt(fld);
                                } else if (lline.startsWith("yllcorner")) {
                                    fld = lline.replace("yllcorner", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.yllcorner = parseInt(fld);
                                } else if (lline.startsWith("cellsize")) {
                                    fld = lline.replace("cellsize", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.cellsize = Number(fld) || 0;
                                } else if (lline.startsWith("nodata_value")) {
                                    fld = lline.replace("nodata_value", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.NODATA_value = fld;
                                } else {
                                    /**
                                     * hier kommen die Daten, VIELE DATEN!!!
                                     */
                                    rowcount++;
                                    if (rowcount === 1) {
                                        // Berechnung der center-Zelle LatLon-Sicht
                                        metafields.latitude = parseFloat(latitude);
                                        metafields.longitude = parseFloat(longitude);
                                        var y = uihelper.lat2y(metafields, metafields.latitude);
                                        var x = uihelper.lon2x(metafields, metafields.longitude);
                                        metafields.rawy = y;
                                        metafields.rawx = x;
                                        y = Math.floor(y);
                                        x = Math.floor(x);
                                        metafields.y = y;
                                        metafields.x = x;

                                        lcontrol.push(["L1", x, y]);

                                        lcontrol.push(["L2", x - 1, y - 1]);
                                        lcontrol.push(["L2", x - 1, y]);
                                        lcontrol.push(["L2", x - 1, y + 1]);
                                        lcontrol.push(["L2", x, y - 1]);
                                        lcontrol.push(["L2", x, y + 1]);
                                        lcontrol.push(["L2", x + 1, y - 1]);
                                        lcontrol.push(["L2", x + 1, y]);
                                        lcontrol.push(["L2", x + 1, y + 1]);

                                        // drüber
                                        lcontrol.push(["L3", x - 2, y - 2]);
                                        lcontrol.push(["L3", x - 1, y - 2]);
                                        lcontrol.push(["L3", x, y - 2]);
                                        lcontrol.push(["L3", x + 1, y - 2]);
                                        lcontrol.push(["L3", x + 2, y - 2]);
                                        // um L2 herum
                                        lcontrol.push(["L3", x - 2, y - 1]);
                                        lcontrol.push(["L3", x + 2, y - 1]);
                                        lcontrol.push(["L3", x - 2, y]);
                                        lcontrol.push(["L3", x + 2, y]);
                                        lcontrol.push(["L3", x - 2, y + 1]);
                                        lcontrol.push(["L3", x + 2, y + 1]);
                                        // drunter
                                        lcontrol.push(["L3", x - 2, y + 2]);
                                        lcontrol.push(["L3", x - 1, y + 2]);
                                        lcontrol.push(["L3", x, y + 2]);
                                        lcontrol.push(["L3", x + 1, y + 2]);
                                        lcontrol.push(["L3", x + 2, y + 2]);
                                        // hier die Flächen berechnen oder aus HYDE holen!!!
                                        //klihyde.areas = {};
                                    }
                                    if (rowcount > metafields.y + 3) {
                                        readInterface.close();
                                        readInterface.removeAllListeners();
                                    }
                                    // Problem: es gibt Zeilen, die mit Blank beginnen
                                    var rowcells = line.split(" ");
                                    // Sizing-Test, volle Matrix im Speicher
                                    cells.push(rowcells);
                                    // es sollte schneller gehen, wenn rowcells sofort verarbeitet
                                    // und nicht gepuffert wird
                                    // Loop über die  lcontrol.push(["L3", x - 2, y - 2]);
                                    if (rowcount >= metafields.y - 2 && rowcount <= metafields.y + 2)
                                        for (var icontrol = 0; icontrol < lcontrol.length; icontrol++) {
                                            var cl = lcontrol[icontrol][0];
                                            var cx = lcontrol[icontrol][1];
                                            var cy = lcontrol[icontrol][2];
                                            if ((rowcount - 1) === cy) {
                                                //var wert = cells[cy][cx - 1].trim();
                                                var wert = rowcells[cx - 1].trim();
                                                if (!wert.startsWith("-9999") && !wert.startsWith(metafields.NODATA_value)) {
                                                    if (!isNaN(wert) && parseInt(wert) !== 0) {
                                                        if (wert.indexOf(".") >= 0) {
                                                            hydeerg[cl] += parseFloat(wert) || 0;
                                                        } else {
                                                            hydeerg[cl] += parseInt(wert) || 0;
                                                        }
                                                        // paintcell(mymap, metafields, cy, cx, parseFloat(wert).toFixed(0));
                                                    }
                                                }
                                            }
                                        }
                                }
                            });
                            readInterface.on('close', function () {
                                // do something on finish here
                                console.log("Finished:" + valcounter);
                                console.log("Hydeerg:" + JSON.stringify(hydeerg));

                                klihyde.rasterx = metafields.x;
                                klihyde.rastery = metafields.y;
                                // year / L1,L2,L3 / variable / summe
                                if (typeof klihyde.data[year] === "undefined") {
                                    klihyde.data[year] = {};
                                }

                                if (typeof klihyde.data[year].L1 === "undefined") {
                                    klihyde.data[year].L1 = {};
                                }
                                if (typeof klihyde.data[year].L2 === "undefined") {
                                    klihyde.data[year].L2 = {};
                                }
                                if (typeof klihyde.data[year].L3 === "undefined") {
                                    klihyde.data[year].L3 = {};
                                }

                                if (typeof klihyde.data[year].L1[variablename] === "undefined") {
                                    klihyde.data[year].L1[variablename] = 0;
                                }
                                if (typeof klihyde.data[year].L2[variablename] === "undefined") {
                                    klihyde.data[year].L2[variablename] = 0;
                                }
                                if (typeof klihyde.data[year].L3[variablename] === "undefined") {
                                    klihyde.data[year].L3[variablename] = 0;
                                }

                                klihyde.data[year].L1[variablename] += hydeerg.L1;
                                klihyde.data[year].L2[variablename] += hydeerg.L2;
                                klihyde.data[year].L3[variablename] += hydeerg.L3;

                                callbacko("Finish", res, ret);
                                return;
                            });
                        }
                    ],
                    function (error, ret) {
                        nextfile();
                        return;
                    });
            },
            function () {
                /**
                 * Ausgabe Ergebnis nach KLIHYDE
                 */
                var updparm = {};
                updparm.selfields = {};
                updparm.selfields.source = klihyde.source;
                updparm.selfields.stationid = klihyde.stationid;
                updparm.updfields = {};
                updparm.updfields["$setOnInsert"] = {
                    source: klihyde.source,
                    stationid: klihyde.stationid
                };
                updparm.updfields["$set"] = {
                    name: klihyde.name,
                    longitude: klihyde.longitude,
                    latitude: klihyde.latitude,
                    rasterx: klihyde.rasterx,
                    rastery: klihyde.rastery,
                    data: JSON.stringify(klihyde.data)
                };
                updparm.table = "KLIHYDE";
                sys0000sys.setonerecord(db, async, null, updparm, res, function (res, ret) {
                    ret.klihyde = klihyde;
                    callbackh(res, ret);
                    return;
                });
            });
        // G:\Projekte\klimadaten\HYDE_lu_pop_proxy\baseline\asc\2008AD_pop\rurc_2008AD.asc
    };





    /**
     * updatecontinent berechnet Kontinentzuordnung neu nach Update inline
     */
    sys0000sys.updatecontinent = function (db, rootdir, fs, async, req, reqparm, res, callback79) {

        reqparm = {
            sel: {

            },
            projection: {
                source: 1,
                stationid: 1,
                tsserverupd: 1,
                longitude: 1,
                latitude: 1,
                continent: 1,
                continentname: 1
            },
            sort: {
                source: 1,
                stationid: 1
            },
            table: "KLISTATIONS",
            firma: "KLI",
            skip: 0,
            limit: 0
        };

        sys0000sys.getallsqlrecords(db, async, null, reqparm, res, function (res, ret1) {
            if (ret1.records.length === 0) {
                callback79(res, ret1);
                return;
            }
            var rows = ret1.records;
            var rcount = 0;
            var ucount = 0;
            var ncount = 0;
            var xcount = 0;
            async.eachSeries(rows, function (row, nextrow) {
                    rcount++;
                    async.waterfall([
                            function (callback79a) {
                                if (row.source === null && row.stationid === null) {
                                    xcount++;
                                    var delStmt = "DELETE FROM KLISTATIONS";
                                    delStmt += " WHERE tsserverupd = '" + row.tsserverupd + "'";
                                    delStmt += " AND source IS NULL";
                                    delStmt += " AND stationid IS NULL";
                                    var delparm = {};
                                    delparm.delStmt = delStmt;
                                    delparm.table = "KLISTATIONS";
                                    sys0000sys.delonerecord(db, async, req, delparm, res, function (res, ret) {
                                        callback79a("next", {
                                            error: false,
                                            message: "gelöscht"
                                        });
                                        return;
                                    });
                                } else {
                                    callback79a(null, {
                                        error: false,
                                        message: "skipped"
                                    });
                                    return;
                                }
                            },
                            function (ret, callback79b) {
                                var condata = uihelper.getContinent(row.longitude, row.latitude);
                                if (condata.error === false) {
                                    ucount++;
                                    var updparm = {};
                                    updparm.selfields = {};
                                    updparm.selfields.source = row.source;
                                    updparm.selfields.stationid = row.stationid;
                                    updparm.updfields = {};
                                    updparm.updfields["$set"] = {
                                        continent: condata.continentcode,
                                        continentname: condata.continentname
                                    };
                                    updparm.table = "KLISTATIONS";
                                    sys0000sys.setonerecord(db, async, null, updparm, res, function (res, ret) {
                                        callback79b(null, {
                                            error: false,
                                            message: "updated"
                                        });
                                        return;
                                    });
                                } else {
                                    ncount++;
                                    var updparm = {};
                                    updparm.selfields = {};
                                    updparm.selfields.source = row.source;
                                    updparm.selfields.stationid = row.stationid;
                                    updparm.updfields = {};
                                    updparm.updfields["$set"] = {
                                        continent: "?",
                                        continentname: "unknown"
                                    };
                                    updparm.table = "KLISTATIONS";
                                    sys0000sys.setonerecord(db, async, null, updparm, res, function (res, ret) {
                                        callback79b(null, {
                                            error: false,
                                            message: "not updated"
                                        });
                                        return;
                                    });
                                }
                            }
                        ],
                        function (error, ret) {
                            nextrow();
                        });
                },
                function (error) {
                    var msg = "Continente gelesen:" + rcount + " zugeordnet:" + ucount + " nicht zugeordnet:" + ncount + " NULL-Korr:" + xcount;
                    console.log(msg);
                    callback79(res, {
                        error: false,
                        message: msg
                    });
                    return;
                });
        });
    };



    /**
     * sql2eliminate - Doppelte Sätze beseitigen
     * der unique index wird später aufgebaut
     */
    var icount = 0;
    var gblcount = 0;
    sys0000sys.sql2eliminate = function (gblInfo, sqlite3, db, async, uihelper, req, res, cbeli000) {
        var db2 = new sqlite3.Database(db.filename);
        var sqlstmt = "";
        if (req.body && typeof req.body.sqlstmt !== "undefined" && req.body.sqlstmt.length > 0) {
            sqlstmt = req.body.sqlstmt;
        }
        var regex = /from\s+(\w+)/i;
        var matches = sqlstmt.match(regex);
        var qmsg = "";
        var tablename = "";
        if (null !== matches && matches.length >= 2) {
            tablename = matches[1];
        } else {
            // Fehlerfall und raus
        }
        var limit = 100;
        if (req.body && typeof req.body.limit !== "undefined" && req.body.limit.length > 0) {
            limit = req.body.limit;
            if (parseInt(limit) === 0) {
                limit = 100;
            }
        }
        var skip = 0;
        if (req.body && typeof req.body.skip !== "undefined" && req.body.skip.length > 0) {
            skip = req.body.skip;
        }
        var filename = "sql.csv";
        if (req.body && typeof req.body.filename !== "undefined" && req.body.filename.length > 0) {
            filename = req.body.filename;
        }


        var fpath = "/temp/" + filename;
        var fullpath = __dirname + "/static" + fpath;

        var itotal = 0;


        var iread = 0;
        var ccount = 0;
        try {
            /**
             * chunk lesen, skip icontrol, limit 100
             * wenn rows.length < 100, dann gibt es ein Dateiende
             */
            var cskip = 0; // da die Sätze verschwinden immer wieder vorne anfangen!!!
            var climit = 1;
            db.serialize(function () {
                async.waterfall([
                        function (cbeli100) {
                            /**
                             * Einen Gruppensatz lesen als Template
                             */
                            db.run("BEGIN TRANSACTION;");
                            var sqlstmt1 = sqlstmt.replace(/[\r\n\t]/g, " ");
                            if (sqlstmt1.toUpperCase().indexOf("ORDER BY") > 0) {
                                // sel += " LIMIT " + limit;
                                //sel += "," + skip;
                                sqlstmt1 += " LIMIT " + cskip;
                                sqlstmt1 += "," + climit;
                            }
                            gblcount += climit;
                            db.all(sqlstmt1, function (err, rows) {
                                var ret = {};
                                if (err) {
                                    ret.error = true;
                                    ret.message = "getallsqlrecords-2:" + err;
                                    cbeli100("Error", res, ret);
                                    return;
                                } else if (rows.length === 0) {
                                    ret.error = true;
                                    ret.message = "getallsqlrecords-3: Keine Daten";
                                    cbeli100("Error", res, ret);
                                    return;
                                } else {
                                    ret.error = false;
                                    ret.message = "getallsqlrecords-2:" + " Chunk gefunden:" + rows.length;
                                    ret.records = rows;
                                    ret.tablename = tablename;
                                    cbeli100(null, res, ret);
                                    return;
                                }
                            });
                        },
                        function (res, ret, cbeli101) {
                            /**
                             * Sätze einzeln lesen, klassische Gruppenwechsel
                             */
                            var where = "";
                            var orderby = "";
                            var selfields = {};
                            var reqparm = {};
                            var sel = "SELECT ROWID as rid, * FROM " + ret.tablename;
                            var elimrecord = ret.records[0];
                            var vglfields = [];
                            for (var feld in elimrecord) {
                                if (elimrecord.hasOwnProperty(feld)) {
                                    if (feld === "anzahl") {
                                        continue;
                                    }
                                    if (feld === "rid") {
                                        continue;
                                    }
                                    vglfields.push(feld);
                                    if (where.length > 0) {
                                        where += " AND ";
                                    }
                                    where += " " + feld;
                                    where += " = ";
                                    var wert = elimrecord[feld];
                                    if (typeof wert === "string") {
                                        where += "'" + wert + "'";
                                    } else {
                                        where += wert;
                                    }
                                    selfields[feld] = wert;
                                    if (orderby.length > 0) {
                                        orderby += ", ";
                                    }
                                    orderby += feld;
                                }
                            }
                            // sel += " WHERE " + where;

                            var limit = 100;
                            var offset = 0;
                            var actcount = 0;
                            var grucount = 0;
                            var idel = 0;
                            var newvgls = {};
                            var oldvgls = {};
                            var oldkeys = "";
                            var newkeys = "";
                            var gruwe = false;
                            // Database#each(sql, [param, ...], [callback], [completecallback])
                            // completecallback liefert error und #rows
                            // "There is currently no way to abort execution." USC00327655

                            sel += " ORDER BY " + orderby;
                            console.log(JSON.stringify(vglfields));
                            console.log(sel);
                            db2.each(sel, function (err, elirow) {
                                    var eliret = {};
                                    if (err) {
                                        eliret.error = true;
                                        eliret.message = "getallsqlrecords-2:" + err;
                                        console.log(eliret.message);
                                        cbeli101("Error", res, eliret);
                                        return;
                                    } else if (elirow.length === 0) {
                                        eliret.error = true;
                                        eliret.message = "getallsqlrecords-3: Keine Daten";
                                        console.log(eliret.message);
                                        cbeli101("Error", res, eliret);
                                        return;
                                    } else {
                                        /**
                                         * Gruppenwechsel und Löschen
                                         */
                                        actcount++;
                                        for (var ifeld = 0; ifeld < vglfields.length; ifeld++) {
                                            newvgls[vglfields[ifeld]] = elirow[vglfields[ifeld]];
                                        }
                                        newkeys = JSON.stringify(newvgls);
                                        if (actcount === 1) {
                                            oldkeys = newkeys;
                                            console.log(elirow);
                                        } else if (oldkeys !== newkeys) {
                                            grucount = 1;
                                            oldkeys = newkeys;
                                        } else {
                                            grucount++;
                                            console.log(actcount + " " + grucount + " " + elirow.rid);
                                            if (grucount > 1) {
                                                where = "";
                                                for (var ivgl = 0; ivgl < vglfields.length; ivgl++) {
                                                    var feld = vglfields[ivgl];
                                                    if (where.length > 0) {
                                                        where += " AND ";
                                                    }
                                                    where += " " + feld;
                                                    where += " = ";
                                                    var wert = elirow[feld];
                                                    if (typeof wert === "string") {
                                                        where += "'" + wert + "'";
                                                    } else {
                                                        where += wert;
                                                    }
                                                }
                                                var delsql = "DELETE FROM " + tablename;
                                                delsql += " WHERE ROWID = " + elirow.rid;
                                                idel++;
                                                if (idel < 100 || idel % 1000 === 0) {
                                                    console.log("delete:" + delsql);
                                                }
                                                db.run(delsql, function (err) {
                                                    // eigentlich nix
                                                    if (idel < 100 || idel % 1000 === 0) {
                                                        console.log("delete:" + delsql);
                                                    }
                                                    return;
                                                });
                                            }
                                        }
                                    }
                                },
                                function (error, rowcount) {
                                    /**
                                     * Abschluss, Tabellenende/Query-Ende
                                     */
                                    cbeli101("Finish", res, {
                                        error: false,
                                        message: "rowcount:" + rowcount + " " + error
                                    });
                                    return;
                                });
                        }
                    ],
                    function (error, res, ret) {
                        var ret = {
                            error: false,
                            message: "ENDE"
                        };
                        cbeli000(res, ret);
                        return;
                    });
            });

        } catch (err) {
            var ret = {
                error: true,
                message: err
            };
            cbeli000(res, ret);
            return;
        }
    };


    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = sys0000sys;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return sys0000sys;
        });
    } else {
        // included directly via <script> tag
        root.sys0000sys = sys0000sys;
    }
}());