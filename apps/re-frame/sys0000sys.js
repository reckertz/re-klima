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
    var uihelper = require("re-frame/uihelper");

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
    sys0000sys.getallsqlrecords = function (db, async, req, reqparm, res, callback) {
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
                    debugger;
                    ret.error = true;
                    ret.message = "WHERE zu komplex:" + JSON.stringify(sel);
                    callback(res, ret);
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
        if (limit > 0) {
            //  + " LIMIT 10 OFFSET 0";
            if (sel.toUpperCase().indexOf("ORDER BY") > 0) {
                // sel += " LIMIT " + limit;
                //sel += "," + skip;
                sel += " LIMIT " + skip;
                sel += "," + limit;
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
                callback(res, ret);
                return;
            }
            /**
             * Aufbau des Response-Array
             */
            var record = {};
            console.log("***SKIP***" + skip + " " + typeof skip);
            var sqlStmt = sel;
            db.serialize(function () {
                db.all(sqlStmt, function (err, rows) {
                    var ret = {};
                    if (err) {
                        ret.error = true;
                        ret.message = "getallsqlrecords-2:" + err;
                        console.log(ret.message);
                        callback(res, ret);
                        return;
                    } else if (rows.length === 0) {
                        ret.error = false;
                        ret.message = "getallsqlrecords-2:Keine Sätze zu " + sqlStmt;
                        console.log(ret.message);
                        callback(res, ret);
                        return;
                    } else {
                        ret.error = false;
                        ret.message = "getallsqlrecords-5:" + " gefunden:" + rows.length;
                        ret.records = rows;
                        console.log(ret.message);
                        callback(res, ret);
                        return;
                    }
                });
            });
        } catch (err) {
            ret.error = true;
            ret.message = "getallsqlrecords-6:" + err.message;
            ret.records = null;
            console.log("getallsqlrecords-7:" + ret.message);
            callback(res, ret);
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
                                vallist += "'" + pvalue.replace(/'/g, "''") + "',";
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
                                createInd +=  " ind" + indrnd + "_" + ret.sorparms.table;
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
                                vallist += "'" + pvalue.replace(/'/g, "''") + "',";
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
    sys0000sys.delonerecord = function (db, async, ObjectID, req, reqparm, res, callback) {
        /**
         * Prüfen, welche Parameter vorliegen, dann zugreifen
         * username und firma sind auch verfügbar
         */
        var sel = {};
        if (req.body && typeof req.body.sel !== "undefined" && req.body.sel.length > 0) {
            sel = JSON.parse(req.body.sel);
        }
        var table = "";
        if (req.body && typeof req.body.table !== "undefined" && req.body.table.length > 0) {
            table = req.body.table;
        }
        var firma = "";
        if (req.body && typeof req.body.firma !== "undefined" && req.body.firma.length > 0) {
            firma = req.body.firma;
        }
        var record = {};
        if (req.body && typeof req.body.record !== "undefined" && req.body.record.length > 0) {
            record = JSON.parse(req.body.record);
        }

        var ret = {};
        var recid = "";
        console.log("delonerecord:" + table);
        console.log("delonerecord:" + JSON.stringify(sel, null, " "));
        if (typeof sel.recid !== "undefined") {
            recid = sel.recid;
            delete sel.recid;
        } else {
            ret.error = true;
            ret.message = "delonerecord:" + "keine recid übergeben";
            ret.record = null;
            callback(res, ret);
            return;
        }
        try {
            if (db === null) {
                ret.error = true;
                ret.message = "delonerecord:" + "Keine Datenbank übergeben";
                ret.record = null;
                callback(res, ret);
                return;
            }
            /**
             * später erst den Protokollsatz Schreiben
             *
             */
            var saverec = {}; // $.extend({}, record);
            saverec.oldid = recid;
            delete saverec._id;
            sel = {};
            sel._id = ObjectID(recid);
            db.collection(table).findOne(sel, function (err, result) {
                if (err) {
                    ret.error = true;
                    ret.message = "nichts gefunden:" + err.message;
                    console.log("delonerecord:" + ret.message);
                    ret.record = null;
                    callback(res, ret);
                    return;
                } else if (result) {
                    console.log("delonerecord:" + recid + " gefunden");

                    var newrec = JSON.parse(JSON.stringify(result));
                    var oldid = newrec._id;
                    newrec.oldid = oldid;
                    delete newrec._id;
                    db.collection(table + "history").insert(newrec, {
                        w: 1
                    }, function (err, result) {
                        ret = {};
                        if (err) {
                            console.log("delonerecord insert " + table + "history" + " Error:" + err.message);
                            ret.error = true;
                            ret.message = "delonerecord:" + err.message;
                            callback(res, ret);
                            return;
                        } else {
                            console.log("delonerecord insert " + table + "history OK");
                            /**
                             * und jetzt die Daten wirklich löschen
                             */
                            db.collection(table).remove(sel, function (err, result) {
                                if (err) {
                                    ret.error = true;
                                    ret.message = "delonerecord:" + err.message;
                                    console.log("delonerecord:" + ret.message);
                                    callback(res, ret);
                                    return;
                                } else {
                                    ret.error = false;
                                    ret.message = "delonerecord:" + "gelöscht:" + recid;
                                    ret.record = null;
                                    console.log("delonerecord:" + ret.message);
                                    callback(res, ret);
                                    return;
                                }
                            });
                        }
                    });

                } else {
                    ret.error = false;
                    ret.message = "gefunden:0 für " + JSON.stringify(sel);
                    console.log("delonerecord:" + ret.message);
                    ret.record = null;
                    callback(res, ret);
                    return;
                }
            });
        } catch (err) {
            ret.error = true;
            ret.message = "delonerecord:" + err.message;
            ret.record = null;
            console.log("delonerecord:" + ret.message);
            callback(res, ret);
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
                                errinfo.name = err.message;
                                errinfo.error = true;
                                dirtree.root.push(errinfo);
                            }
                        }
                        callback("Finish", dirtree);
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

    var walkSync = function (dir, filelist, selyears, ADBC) {
        var fs = fs || require('fs'),
            files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function (file) {
            var fullfilename = path.join(dir, file);
            if (fs.statSync(fullfilename).isDirectory()) {
                var fparts = file.match(/([a-zA-Z_]*)(\d*)(BC|AD)/);
                var j = fparts[2];
                if (j.length > 0) {
                    j = ("0000" + j).slice(-4);
                }
                if (fparts[3] === ADBC && kli9010srv.hasyear(j, selyears) === true) {
                    filelist.push(walkSync(fullfilename, [], selyears, ADBC));
                }
            } else {
                var fparts = file.match(/([a-zA-Z_]*)(\d*)(BC|AD)/);
                // console.log(fparts); // Array(4) ["conv_rangeland0AD", "conv_rangeland", "0", "AD"]
                var j = fparts[2];
                if (j.length > 0) {
                    j = ("0000" + j).slice(-4);
                }
                if (fparts[3] === ADBC && kli9010srv.hasyear(j, selyears) === true) {
                    filelist.push(fullfilename);
                    linfilelist.push(fullfilename);
                }
            }
        });
        return filelist;
    };






    /**
     * getdirectoryfiles - Dateinamen zu Verzeichnis auslesen
     * KLIFILES, wenn vorhanden sonst werden die Dateien neu geholt
     * Parameter sind
     * fileopcode: "show" und "prep"
     * predirectory: "/../klima1001/";
     * directory: Beispiel: "albedo"
     * root-Directory wird zugefügt
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
        var tablename = "KLIFILES";
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
        if (!fs.existsSync(rootdir)) {
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
                        fs.mkdirSync(ret.directory);
                        console.log("ANGELEGT:" + ret.directory);
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
                                        var actdir = ret.files.find(function (element) {
                                            if (element.name === dirinfo.name) {
                                                element.dorefresh = true;
                                                return element;
                                            }
                                        });
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
                                            var actdir = ret.files.find(function (element) {
                                                if (element.name === dirinfo.name) {
                                                    element.dorefresh = true;
                                                    return element;
                                                }
                                            });
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
                    async.eachSeries(ret.files, function (file, nextfile) {

                            async.waterfall([
                                function (callback) {
                                    // file hat dirinfo, das wandert nach KLIFILES
                                    /*
                                    var reqparm = {
                                        fileopcode: "meta",
                                        predirectory: predirectory,
                                        directory: directory,
                                        filename: file.name
                                    };
                                    */
                                    var updfields = {};
                                    /*
                                    metafields: Array mit Objects
                                    fielddescr:"Year AD, ,,AD, , speleothem, ,,N,   "
                                    fieldname:"year"
                                    */
                                    updfields["$set"] = file;
                                    var reqparm = {
                                        table: tablename,
                                        selfields: {
                                            "fullname": file.fullname
                                        },
                                        updfields: updfields
                                    };
                                    sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret) {
                                        nextfile();
                                        return;
                                    });
                                }
                            ]);
                        },
                        function (err) {
                            // Ende von eachseries
                            callback("Finish", ret);
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