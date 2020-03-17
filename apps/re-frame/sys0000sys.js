// http://www.jslint.com/help.html https://jshint.com/docs/options/
/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*jshint -W069 */
/*jshint sub:true*/
/*global $:false, intel:false, cordova:false, device:false, 
 require,process,ecsystem,console,devide,window,module,define,root,global,self,__dirname
 */
"use strict";
(function () {
    var sys0000sys = {};
    // test
    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    var ObjectId = require('mongodb').ObjectID;
    var nodemailer = require("nodemailer");
    var md5 = require("md5");
    var path = require("path");
    var fs = require("fs");
    var async = require("async");
    var readline = require("readline");
    var stream = require("stream");
    var request = require("request");
    var htmlparser2 = require("htmlparser2");
    var download = require("download-file");
    var kli9010srv = require("re-klima/kli9010srv");
    var uihelper = require("re-frame/uihelper");
    var gblInfo = {};
    sys0000sys.getInfo = function () {
        return gblInfo;
    };

    sys0000sys.testDB = function () {
        /**
         * Test MongoDB-Erreichbarkeit
         */
        try {
            var mongodb = require('mongodb');
            var mongoUrl = "";
            //We need to work with "MongoClient" interface in order to connect to a mongodb server.
            var MongoClient = mongodb.MongoClient;
            var ObjectID = require('mongodb').ObjectID;
            var connection_string = '127.0.0.1:27017/kliback';
            mongoUrl = "mongodb://" + connection_string;
            console.log("*MongoDB-Connectionstring*:" + mongoUrl);
            MongoClient.connect(mongoUrl, function (err, db) {
                if (err) {
                    console.log("Unable to connect to the mongoDB server with:" + mongoUrl + " Error:" + err);
                } else {
                    //HURRAY!! We are connected. :)
                    console.log('Connection established to:' + mongoUrl);
                    var collection = db.collection("KLIUSERS");
                }
            });

        } catch (err) {
            console.log("MongoDB-Error:" + err);
        }
        return ("das normale Ende wurde erreicht");
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
    sys0000sys.getonerecord = function (db, async, req, reqparm, res, callback) {
        /**
         * Prüfen, welche Parameter vorliegen, dann zugreifen
         * username und firma sind auch verfügbar
         */
        var sel = {};
        var projection = {};
        var table = "";
        var firma = "";
        if (typeof reqparm === "undefined" || reqparm === null) {
            if (req.query && typeof req.query.sel !== "undefined" && req.query.sel.length > 0) {
                sel = JSON.parse(req.query.sel);
            }
            if (req.query && typeof req.query.projection !== "undefined" && req.query.projection.length > 0) {
                projection = JSON.parse(req.query.projection);
            }
            if (req.query && typeof req.query.table !== "undefined" && req.query.table.length > 0) {
                table = req.query.table;
            }
            if (req.query && typeof req.query.firma !== "undefined" && req.query.firma.length > 0) {
                firma = req.query.firma;
            }
        } else {
            if (reqparm && typeof reqparm.sel !== "undefined") {
                sel = reqparm.sel;
            }
            if (reqparm && typeof reqparm.projection !== "undefined") {
                projection = reqparm.projection;
            }
            if (reqparm && typeof reqparm.table !== "undefined" && reqparm.table.length > 0) {
                table = reqparm.table;
            }
            if (reqparm && typeof reqparm.firma !== "undefined" && reqparm.firma.length > 0) {
                firma = reqparm.firma;
            }
        }

        var ret = {};
        var record = {};
        //console.log("getonerecord:" + table);
        console.log("getonerecord-sel:" + table + "=>" + JSON.stringify(sel, null, " "));
        try {
            if (db === null) {
                ret.error = true;
                ret.message = "getonerecord:" + "Keine Datenbank übergeben";
                ret.record = null;
                callback(res, ret);
                return;
            }
            /**
             * Aufbau des Response-Array
             */
            var records = [];
            var record = {};
            /**
             * und jetzt die Daten wirklich lesen
             */
            var collection = db.collection(table);
            // prüfen, ob _id selektiert werden soll:
            if (typeof sel["_id"] !== "undefined" && sel["_id"].length > 0) {
                var selid = sel["_id"];
                if (!selid.startsWith("new ObjectId(")) {
                    sel["_id"] = new ObjectId(selid);
                }
            }
            console.log("getonerecord-Selektion:" + JSON.stringify(sel));
            collection.findOne(sel, projection, function (err, result) {
                if (err) {
                    ret.error = true;
                    ret.message = "nichts gefunden:" + err.message;
                    console.log("getonerecord:" + ret.message);
                    ret.record = null;
                    callback(res, ret);
                    return;
                } else if (result) {
                    ret.error = false;
                    ret.message = "gefunden";
                    console.log("getonerecord:" + ret.message);
                    /**
                     * filtern projection mit 0
                     */
                    for (var fld in projection) {
                        if (projection.hasOwnProperty(fld)) {
                            if (projection[fld] === 0) {
                                delete result[fld];
                            }
                        }
                    }
                    //console.log(JSON.stringify(result, null, " "));
                    ret.record = result;
                    callback(res, ret);
                    return;
                } else {
                    ret.error = false;
                    ret.message = "gefunden:0 für " + JSON.stringify(sel);
                    console.log("getonerecord:" + ret.message);
                    ret.record = null;
                    callback(res, ret);
                    return;
                }
            });
        } catch (err) {
            ret.error = true;
            ret.message = "getonerecord-ERR:" + err.message;
            ret.record = null;
            console.log("getonerecord-ERR:" + ret.message + "\n" + err.stack);
            callback(res, ret);
            return;
        }
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
    sys0000sys.getallrecords = function (db, async, req, reqparm, res, callback) {
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

        if (typeof reqparm === "undefined" || reqparm === null) {
            if (req.query && typeof req.query.sel !== "undefined" && req.query.sel.length > 0) {
                sel = JSON.parse(req.query.sel);
            }
            if (typeof sel["_id"] !== "undefined" && sel["_id"].length > 0) {
                var selid = sel["_id"];
                if (!selid.startsWith("new ObjectId(")) {
                    sel["_id"] = new ObjectId(selid);
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
            }
            if (typeof sel["_id"] !== "undefined" && sel["_id"].length > 0) {
                var selid = sel["_id"];
                if (!selid.startsWith("new ObjectId(")) {
                    sel["_id"] = new ObjectId(selid);
                }
            }
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
            if (reqparm && typeof reqparm.skip !== "undefined" && reqparm.skip > 0) {
                skip = parseInt(reqparm.skip);
            }
            if (reqparm && typeof reqparm.limit !== "undefined" && reqparm.limit > 0) {
                limit = parseInt(reqparm.limit);
            }
        }

        var ret = {};
        var records = [];
        // console.log("getallrecords:" + table);
        // console.log("getallrecords-sel.:" + JSON.stringify(sel, null, " ") + " Skip:" + skip + " Limit:" + limit);
        //console.log("getallrecords-sort:" + JSON.stringify(sort, null, " "));
        try {
            if (db === null) {
                ret.error = true;
                ret.message = "getallrecords:" + "Keine Datenbank übergeben";
                ret.record = null;
                ret.records = null;
                callback(res, ret);
                return;
            }
            /**
             * Aufbau des Response-Array
             */
            var record = {};
            // console.log("***SKIP***" + skip + " " + typeof skip);
            db.collection(table)
                .find(sel)
                .project(projection)
                .limit(limit)
                .skip(skip)
                .sort(sort)
                .toArray(function (err, result) {
                    if (err) {
                        ret.error = true;
                        ret.message = "nichts gefunden:" + err.message;
                        console.log("getallrecords-3:" + ret.message);
                        ret.records = null;
                        callback(res, ret);
                        return;
                    } else if (result.length) {
                        ret.error = false;
                        ret.message = "gefunden:" + result.length;
                        // console.log("getallrecords-4:" + ret.message);
                        /**
                         * filtern projection mit 0
                         */
                        if (Object.keys(projection).length > 0) {
                            for (var irec = 0; irec < result.length; irec++) {
                                var resultrecord = result[irec];
                                for (var fld in projection) {
                                    if (projection.hasOwnProperty(fld)) {
                                        if (projection[fld] === 0) {
                                            delete resultrecord[fld];
                                        }
                                    }
                                }
                            }
                        }
                        ret.records = result;
                        callback(res, ret);
                        return;
                    } else {
                        ret.error = false;
                        ret.message = "nichts gefunden für:<br>" + JSON.stringify(sel, null, " ");
                        console.log("getallrecords-5:" + ret.message);
                        ret.records = null;
                        callback(res, ret);
                        return;
                    }
                });
        } catch (err) {
            ret.error = true;
            ret.message = "getallrecords-6:" + err.message;
            ret.records = null;
            console.log("getallrecords-7:" + ret.message);
            callback(res, ret);
            return;
        }
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
    sys0000sys.getallsqlrecords = function (sqldb, async, req, reqparm, res, callback) {
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
            if (selectmode === false) {
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
            if (sqldb === null) {
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
            sqldb.serialize(function () {
                sqldb.all(sqlStmt, function (err, rows) {
                    var ret = {};
                    if (err) {
                        ret.error = true;
                        ret.message = "getallsqlrecords-2:" + err;
                        callback(res, ret);
                        return;
                    } else if (rows.length === 0)   {
                        ret.error = false;
                        ret.message = "getallsqlrecords-2:Keine Sätze zu " + sqlStmt;
                        callback(res, ret);
                        return;
                    } else {
                        ret.error = false;
                        ret.message = "getallsqlrecords-5:" + " gefunden:" + rows.length;
                        ret.records = rows;
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
     * getaggregaterecords - Kumulationen, JOIN
     * @param {*} db 
     * @param {*} async 
     * @param {*} req - options
     * @param {*} res 
     * @param {*} callback72 
     */

    sys0000sys.getaggregaterecords = function (db, async, req, reqparm, res, callback72) {
        /**
         * Prüfen, welche Parameter vorliegen, dann zugreifen
         * username und firma sind auch verfügbar
         */
        var options = {};
        if (req.query && typeof req.query.options !== "undefined" && req.query.options.length > 0) {
            options = JSON.parse(req.query.options);
        }

        var table = "";
        if (req.query && typeof req.query.table !== "undefined" && req.query.table.length > 0) {
            table = req.query.table;
        }

        var ret = {};
        var records = [];
        try {
            if (db === null) {
                ret.error = true;
                ret.message = "getaggregaterecords-2:" + "Keine Datenbank übergeben";
                ret.record = null;
                ret.records = null;
                callback72(res, ret);
                return;
            }

            // iterieren über options nach $match und dort ObjectId-Spezialbehandlung
            if (typeof options === "object") {
                for (var i = 0; i < options.length; i++) {
                    var obj = options[i];
                    if (typeof obj["$match"] !== "undefined") {
                        if (typeof obj["$match"]["_id"] !== "undefined" && obj["$match"]["_id"].length > 0) {
                            var selid = obj["$match"]["_id"];
                            if (!selid.startsWith("new ObjectId(")) {
                                obj["$match"]["_id"] = new ObjectId(selid);
                            }
                            break;
                        }
                    }
                }
            }


            /**
             * Aufbau des Response-Array
             */
            var record = {};
            db.collection(table).aggregate(options).toArray(function (err, result) {

                if (err) {
                    ret.error = true;
                    ret.message = "nichts gefunden:" + err.message;
                    ret.records = null;
                    callback72(res, ret);
                    return;
                } else if (result.length) {
                    ret.error = false;
                    ret.message = "gefunden:" + result.length;
                    ret.records = result;
                    callback72(res, ret);
                    return;
                } else {
                    ret.error = false;
                    ret.message = "nichts gefunden";
                    ret.records = null;
                    callback72(res, ret);
                    return;
                }
            });
        } catch (err) {
            ret.error = true;
            ret.message = "getaggregaterecords-6:" + err.message;
            ret.records = null;
            callback72(res, ret);
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
     * setonerecord (inkrementelles Update mit optionaler Zählererhöhung)
     * Zähler mit $inc erhöhen ist Teil von updfields 
     * @param db
     * @param async
     * @param req - hat selfields, updfields und table
     * @param res
     * @param callback returns res, ret
     */
    sys0000sys.setonerecord = function (db, async, req, reqparm, res, callbacksor) {
        /**
         * Prüfen, welche Parameter vorliegen, dann zugreifen
         * username und firma sind auch verfügbar
         */
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
        if (typeof selfields["_id"] !== "undefined" && selfields["_id"].length > 0) {
            var selid = selfields["_id"];
            if (!selid.startsWith("new ObjectId(")) {
                selfields["_id"] = new ObjectId(selid);
            }
        }


        var ret = {};
        //try {
        if (db === null) {
            ret.error = true;
            ret.message = "setonerecord:" + "Keine Datenbank übergeben";
            ret.record = null;
            callbacksor(res, ret);
            return;
        }
        if (typeof updfields["$set"] === "undefined") {
            updfields["$set"] = {};
        }
        updfields["$set"].tsserverupd = new Date().toISOString();
        updfields["$set"].iostatus = 1;
        /**
         * Hier ist eine add-Logik notwendig, um die Tabelle anzulegen und fortzuschreiben
         */
        var sentry = {};
        //sentry.ts = new Date().toISOString();
        var tsdate = new Date();
        sentry.ts = new Date(tsdate - tsdate.getTimezoneOffset() * 60 * 1000).toISOString();
        if (typeof req !== "undefined" && req !== null && typeof req.session !== "undefined" && typeof req.session.username !== "undefined") {
            sentry.username = req.session.username; // record.lastusername;
        } else if (typeof updfields["$set"] !== "undefined" && typeof updfields["$set"].lastusername !== "undefined") {
            sentry.username = updfields["$set"].lastusername;
        } else {
            sentry.username = "*unknown";
        }

        sentry.app = "sys0000sys-setOneRecord";
        if (table === "KLIUSERS" || !table.startsWith("KLI")) {
            sentry.msg = "Server - set erfolgt:" + JSON.stringify(updfields, null, " ");
        } else {
            sentry.msg = "Server - set erfolgt";
        }

        /**
         * und jetzt die Daten wirklich fortschreiben
         * nach Bereinigung $inc und $addToSet
         */
        /*
        var incfields = {};
        if (typeof updfields["$inc"] !== "undefined" && updfields.hasOwnProperty("$inc")) {
            incfields = updfields["$inc"];
            delete updfields["$inc"];
        }
        var addToSetfields = {};
        if (typeof updfields["$addToSet"] !== "undefined" && updfields.hasOwnProperty("$addToSet")) {
            addToSetfields = updfields["$addToSet"];
            delete updfields["$addToSet"];
        }

        console.log("setonerecord:" + table);
        console.log("setonerecord-$sel:" + JSON.stringify(selfields, null, " "));
        console.log("setonerecord-$set:" + JSON.stringify(updfields, null, " "));
        console.log("setonerecord-$inc:" + JSON.stringify(incfields, null, " "));
        console.log("setonerecord-$addToSet:" + JSON.stringify(addToSetfields, null, " "));
        */

        updfields["$push"] = {
            history: sentry
        };
        //console.log("SEL:" + JSON.stringify(selfields, null, " "));
        //console.log("UPD:" + JSON.stringify(updfields, null, " "));
        try {
            db.collection(table).findOneAndUpdate(
                selfields,
                updfields, {
                    upsert: true,
                    returnOriginal: false
                },
                function (err, feedback) {
                    if (typeof err !== "undefined" && err !== null) {
                        console.log("setonerecord-ERR:" + err);
                        callbacksor(res, {
                            error: true,
                            message: JSON.stringify(err, null, " "),
                            record: {}
                        });
                        return;
                    } else {
                        // Kontrollausgabe ohne History
                        var confeedback = Object.assign({}, feedback);
                        delete confeedback.history;

                        // console.log("setonerecord-OK:" + JSON.stringify(confeedback, null, " "));
                        callbacksor(res, {
                            error: false,
                            message: "Operation war erfolgreich",
                            record: feedback.value,
                            lastErrorObject: confeedback.lastErrorObject
                        });
                        return;
                    }
                });
        } catch (err) {
            ret.error = true;
            ret.message = "setonerecord:" + err.message;
            ret.record = null;
            console.log("setonerecord:" + ret.message);
            callbacksor(res, ret);
            return;
        }
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
     * Delete einen record in table mit sel als Filter
     * @param db
     * @param async
     * @param req
     * @param res
     * @param callback
     */
    sys0000sys.deloneevent = function (db, async, ObjectID, req, reqparm, res, callback) {
        /**
         * Prüfen, welche Parameter vorliegen, dann zugreifen
         * username und firma sind auch verfügbar
         */
        var sel = {};
        var ret = {};
        var eventid;
        if (req.body && typeof req.body.sel !== "undefined" && req.body.sel.length > 0) {
            var selparm = JSON.parse(req.body.sel);
            sel.eventid = selparm.eventid;
            eventid = sel.eventid;
        }
        if (typeof sel.eventid === "undefined") {
            ret.error = true;
            ret.message = "deloneevent:" + "keine eventid übergeben";
            ret.record = null;
            callback(res, ret);
            return;
        }
        var table = "KLIICALS";

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
        console.log("deloneevent:" + table);
        console.log("deloneevent:" + JSON.stringify(sel, null, " "));
        if (typeof sel.eventid === "undefined") {
            ret.error = true;
            ret.message = "deloneevent:" + "keine eventid übergeben";
            ret.record = null;
            callback(res, ret);
            return;
        }
        try {
            if (db === null) {
                ret.error = true;
                ret.message = "deloneevent:" + "Keine Datenbank übergeben";
                ret.record = null;
                callback(res, ret);
                return;
            }
            /**
             * später erst den Protokollsatz Schreiben
             * 
             */
            db.collection(table).findOne(sel, function (err, result) {
                if (err) {
                    ret.error = true;
                    ret.message = "nichts gefunden:" + err.message;
                    console.log("deloneevent:" + ret.message);
                    ret.record = null;
                    callback(res, ret);
                    return;
                } else if (result) {
                    console.log("deloneevent:" + result.eventid + " gefunden");

                    var newrec = JSON.parse(JSON.stringify(result));
                    var oldid = newrec._id;
                    newrec.oldid = oldid;
                    delete newrec._id;
                    db.collection(table + "history").insert(newrec, {
                        w: 1
                    }, function (err, result) {
                        ret = {};
                        if (err) {
                            console.log("deloneevent insert " + table + "history" + " Error:" + err.message);
                            ret.error = true;
                            ret.message = "deloneevent:" + err.message;
                            callback(res, ret);
                            return;
                        } else {
                            console.log("deloneevent insert " + table + "history OK");
                            /**
                             * und jetzt die Daten wirklich löschen
                             */
                            db.collection(table).remove(sel, function (err, result) {
                                if (err) {
                                    ret.error = true;
                                    ret.message = "deloneevent:" + err.message;
                                    console.log("deloneevent:" + ret.message);
                                    callback(res, ret);
                                    return;
                                } else {
                                    ret.error = false;
                                    ret.message = "deloneevent:" + "gelöscht:" + eventid;
                                    ret.eventid = eventid;
                                    ret.record = null;
                                    console.log("deloneevent:" + ret.message);
                                    callback(res, ret);
                                    return;
                                }
                            });
                        }
                    });

                } else {
                    ret.error = false;
                    ret.message = "gefunden:0 für " + JSON.stringify(sel);
                    console.log("deloneevent:" + ret.message);
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

    /*
    host: "securesmtp.t-online.de",
            secure: true,
            port: 465,
            auth: {
                user: "ls2016s@t-online.de",
                pass: "ls2016#!"
            },
    */

    // https://gmail-blog.de/gmail-einstellungen-fur-imap-pop3-und-smtp/
    sys0000sys.sendmail = function (mailOptions, mxhost) {
        var transport;

        transport = nodemailer.createTransport({
            host: "smtp.google.mail",
            service: "gmail",
            secure: true,
            port: 465,
            auth: {
                user: "neckertz921@gmail.com",
                pass: "Cha0sBaum3958"
            },
            maxConnections: 1
        });


        transport.sendMail(mailOptions, function (error, responseStatus) {
            console.log(error || responseStatus);
            transport.close();
            return (error || responseStatus);
        });
    };

    sys0000sys.forgottenpassword = function (gbldb, async, req, reqparm, res, callback) {
        // if (checkSession(req, res)) return;
        var passwordold = "";
        var passwordnew = "";
        var firstname;
        var lastname;
        var email;
        var firstpassword;
        sess = req.session;
        var xusername = "";
        var filter = {};
        if (req.body && typeof req.body.username !== "undefined") {
            xusername = req.body.username;
        }
        filter.username = xusername;
        var sel = Object.assign({}, filter);
        var projection = {
            username: 1,
            firstname: 1,
            lastname: 1,
            isactive: 1,
            mustchangepassword: 1,
            password: 1
        };
        var api = "getonerecord";
        var table = "KLIUSERS";
        /*
        if (req.query && typeof req.query.sel !== "undefined" && req.query.sel.length > 0) {
            sel = JSON.parse(req.query.sel);
        }
        */
        var reqparm = {};
        reqparm.sel = Object.assign({}, sel);
        reqparm.projection = Object.assign({}, projection);
        reqparm.table = table;
        sys0000sys.getonerecord(gbldb, async, null, reqparm, res, function (res, ret) {
            if (ret.error === true) {
                // sollte nicht passieren??? oder auch hier anlegen
                callback(res, {
                    error: true,
                    message: ret.message
                });
                return;
            } else {
                if (ret.record !== "undefined" && ret.record !== null) {
                    var record = ret.record;
                    firstname = record.firstname || "";
                    lastname = record.lastname || "";
                    email = record.email || "";
                    firstpassword = "" + Math.floor((Math.random() * 10000000) + 1);
                    firstpassword += record.firstname.substr(0, 1).toLowerCase();
                    firstpassword += record.lastname.substr(0, 1).toLowerCase();
                    passwordnew = md5(firstpassword);
                    var reqparm = {
                        table: "KLIUSERS",
                        selfields: {
                            "_id": record._id
                        },
                        updfields: {
                            "$set": {
                                password: passwordnew,
                                firstpassword: firstpassword,
                                isactive: true,
                                mustchangepassword: true
                            }
                        }
                    };
                    sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret) {
                        // in ret liegen error, message und record
                        /**
                         * jetzt die Mail erzeugen aspmx.l.google.com
                         */
                        //var mxhost = "aspmx.l.google.com";
                        if (ret.error === false) {
                            console.log(ret.message);
                            var mxhost = "smtp.t-online.de";
                            var psubject = "Password-Refresh";
                            var ptext = "";
                            ptext += "Dear " + firstname + " " + lastname + ", ";
                            ptext += "your password has been reset to:" + firstpassword;
                            ptext += " - Enter this password to log into the World Business Dialogue App again.";
                            ptext += " Don't forget to change it to your personal password afterwards.";
                            ptext += " Your World Business Dialog Team.";

                            var phtml = "";
                            phtml += "Dear " + firstname + " " + lastname + ",";
                            phtml += "<br>your password has been reset to:" + firstpassword;
                            phtml += "<br><br>Enter this password to log into the World Business Dialogue App again.";
                            phtml += "<br>Don't forget to change it to your personal password afterwards.";
                            phtml += "<br><br>Your World Business Dialog Team.";
                            var mailOptions = {
                                from: '"KLI-Administrator" <neckertz@gmail.com>', // sender address
                                sender: '"Nina Eckertz(Administrator)" <nina.eckertz@dialogue.team>',
                                to: email, // list of receivers
                                //bcc: "eckertz@t-online.de",
                                cc: "nina.eckertz@dialogue.team",
                                subject: psubject, // Subject line
                                text: ptext, // plain text body
                                html: phtml // html body
                            };
                            var mailmsg = "";
                            mailmsg = sys0000sys.sendmail(mailOptions, mxhost);
                            if (typeof mailmsg === "object") {
                                mailmsg = JSON.stringify(mailmsg);
                            }

                            callback(res, {
                                error: false,
                                message: "you get a mail with a new password"
                            });
                            return;
                        } else {
                            callback(res, {
                                error: true,
                                message: "you can't get a mail with a new password"
                            });
                            return;
                        }
                    });

                } else {
                    res.writeHead(200, {
                        'Content-Type': 'application/text',
                        "Access-Control-Allow-Origin": "*"
                    });
                    res.end(JSON.stringify({
                        error: false,
                        message: "password not reset, please check username"
                    }));
                    return;
                }
            }
        });

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
     * getp2kfiles - Dateinamen zu Verzeichnis auslesen
     * Parameter sind
     * fileopcode: "show" und "prep"
     * predirectory: "/../klima1001/";
     * directory: Beispiel: "pages2k"
     * root-Directory wird zugefügt
     * var appDir = path.dirname(require.main.filename);
     */
    sys0000sys.getp2kfiles = function (gbldb, rootdir, fs, async, req, res, supercallback2) {
        /**
         * return Javascript-Array ret.files
         * mit filename, filesize?
         */
        var fileopcode = "show"; // Default
        if (req.query && typeof req.query.fileopcode !== "undefined" && req.query.fileopcode.length > 0) {
            fileopcode = req.query.fileopcode;
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
                        table: "KLIFILES",
                        firma: "KLI",
                        skip: 0,
                        limit: 0
                    };
                    sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            // sollte nicht passieren??? oder auch hier anlegen
                            callback("Error", ret);
                            return;
                        } else {
                            if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
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
                                    dirinfo.archive = record.archive.trim();
                                    dirinfo.sitename = record.sitename.trim();
                                    dirinfo.longitude = "" + Number(record.longitude).toFixed(6);
                                    dirinfo.latitude = "" + Number(record.latitude).toFixed(6);
                                    dirinfo.firstyear = "" + Math.floor(Number(record.firstyear)).toFixed(0);
                                    dirinfo.lastyear = "" + Math.floor(Number(record.lastyear)).toFixed(0);
                                    files.push(dirinfo);
                                }
                                ret.files = files;
                                if (ret.fileopcode === "prep") {
                                    callback(null, ret);
                                    return;
                                } else {
                                    callback("Finish", ret);
                                    return;
                                }
                            } else {
                                ret.error = true;
                                ret.message = "Keine Sätze vorhanden";
                                callback(null, ret);
                                return;
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
                                dirinfo.fullname = path.join(ret.directory, dirs[i]);
                                var info = fs.lstatSync(dirinfo.fullname);
                                dirinfo.isFile = info.isFile();
                                dirinfo.isDirectory = info.isDirectory();
                                if (dirinfo.name.endsWith(".txt") || dirinfo.name.endsWith(".csv")) {
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
                     * Komplettieren oder Anlegen KLIFILES
                     */

                    async.eachSeries(ret.files, function (file, nextfile) {

                        async.waterfall([
                            function (callback) {
                                var reqparm = {
                                    fileopcode: "first5",
                                    predirectory: predirectory,
                                    directory: directory,
                                    filename: file.name
                                };
                                sys0000sys.getp2kfile(rootdir, fs, async, null, reqparm, res, function (res, ret1) {
                                    if (ret1.error === false) {
                                        var updfields = {};
                                        /*
                                        updfields: {
                                            "$set": {
                                                password: passwordnew,
                                                firstpassword: firstpassword,
                                                isactive: true,
                                                mustchangepassword: true
                                            }
                                        }
                                        */
                                        var metadata = ret1.metadata;
                                        var data = ret1.data;
                                        var metafields = ret1.metafields;

                                        /*
                                        file: Object mit
                                        dorefresh:true
                                        fullname:"C:\Projekte\klima1001\pages\Afr-ColdAirCave.Sundqvist.2013.txt"
                                        isDirectory:false
                                        isFile:true
                                        name:"Afr-ColdAirCave.Sundqvist.2013.txt"
                                        size:14170
                                        tsfilecreated:"2019-09-09T08:06:57.269Z                                        
                                        */
                                        updfields["$setOnInsert"] = {};
                                        updfields["$setOnInsert"].name = file.name;
                                        updfields["$setOnInsert"].fullname = file.fullname;
                                        updfields["$setOnInsert"].size = file.size;
                                        updfields["$setOnInsert"].tsfilecreated = file.tsfilecreated;

                                        file.name = file.name;
                                        file.fullname = file.fullname;
                                        file.size = file.size;
                                        file.tsfilecreated = file.tsfilecreated;


                                        /*
                                        metadata: Object mit Elements
                                        archive:" speleothem"
                                        firstyear:" 1635.0"
                                        HGHT:" 1450"
                                        lastyear:" 1992.0"
                                        latitude:" -24"
                                        longitude:" 29.18"
                                        sitename:" Cold Air Cave"
                                        */
                                        updfields["$set"] = {};
                                        updfields["$set"].archive = metadata.archive;
                                        updfields["$set"].sitename = metadata.sitename;
                                        updfields["$set"].longitude = metadata.longitude;
                                        updfields["$set"].latitude = metadata.latitude;
                                        updfields["$set"].HGHT = metadata.HGHT;
                                        updfields["$set"].firstyear = metadata.firstyear;
                                        updfields["$set"].lastyear = metadata.lastyear;

                                        file.archive = metadata.archive;
                                        file.sitename = metadata.sitename;
                                        file.longitude = metadata.longitude;
                                        file.latitude = metadata.latitude;
                                        file.HGHT = metadata.HGHT;
                                        file.firstyear = metadata.firstyear;
                                        file.lastyear = metadata.lastyear;
                                        /*
                                        data: Array mit Objects
                                        d18O:"0.459055"
                                        SE:"0.5780824"
                                        year:"1992.0"
                                        */



                                        /*
                                        metafields: Array mit Objects
                                        fielddescr:"Year AD, ,,AD, , speleothem, ,,N,   "
                                        fieldname:"year"
                                        */
                                        updfields["$set"].metafields = metafields;
                                        var reqparm = {
                                            table: "KLIFILES",
                                            selfields: {
                                                "fullname": file.fullname
                                            },
                                            updfields: updfields
                                        };
                                        sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret) {

                                            nextfile();
                                        });
                                    } else {
                                        nextfile();
                                    }

                                });
                            }
                        ]);
                    });


                }
            ],
            function (error, ret) {
                if (error !== "Finish") {
                    ret.err = true;
                    ret.message = error.message;
                    ret.files = [];
                    supercallback2(res, ret);
                    return;
                } else {
                    supercallback2(res, {
                        error: false,
                        message: "OK",
                        files: ret.files
                    });
                    return;
                }
            }
        );

    };


    /**
     * anzall - alle Dateien analysieren
     * Parameter sind predirectory und directory, 
     * linkarray enthält die Namen aller ausgewählten Dateien
     * root-Directory wird zugefügt
     * var appDir = path.dirname(require.main.filename);
     * return Javascript-Array ret.attributes
     */
    sys0000sys.anzall = function (rootdir, fs, async, req, res, supercallback6) {
        var files = [];
        var predirectory = "";
        if (req.query && typeof req.query.predirectory !== "undefined" && req.query.predirectory.length > 0) {
            predirectory = req.query.predirectory;
        }
        var directory = "";
        if (req.query && typeof req.query.directory !== "undefined" && req.query.directory.length > 0) {
            directory = req.query.directory;
        }
        var linkarray = [];
        if (req.query && typeof req.query.linkarray !== "undefined" && req.query.linkarray.length > 0) {
            linkarray = req.query.linkarray;
        }
        var filestats;
        var ret = {};
        ret.attrs = {};
        if (predirectory.length > 0) {
            ret.directory = path.join(rootdir, predirectory);
            ret.directory = path.join(ret.directory, directory);
        } else {
            ret.directory = path.join(rootdir, directory);
        }

        async.eachSeries(linkarray, function (linkname, nextlink) {

            async.waterfall([
                function (callback) {
                    var reqparm = {
                        predirectory: predirectory,
                        directory: directory,
                        filename: linkname
                    };
                    sys0000sys.getp2kfile(rootdir, fs, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === false) {
                            for (var ifields = 0; ifields < ret1.metafields.length; ifields++) {
                                var fname = ret1.metafields[ifields].fieldname.trim();
                                var fdescr = ret1.metafields[ifields].fielddescr.trim();
                                if (typeof ret.attrs[fname] === "undefined") {
                                    ret.attrs[fname] = {};
                                    ret.attrs[fname].fieldname = fname;
                                    ret.attrs[fname].fielddescr = fdescr;
                                    ret.attrs[fname].files = [];
                                }
                                if (ret.attrs[fname].fielddescr.length === 0) {
                                    ret.attrs[fname].fielddescr = fdescr;
                                } else if (ret.attrs[fname].fielddescr.indexOf(fdescr) < 0) {
                                    ret.attrs[fname].fielddescr += ";<br/>" + fdescr;
                                }
                                if (ret.attrs[fname].files.length === 0 || ret.attrs[fname].files.indexOf(linkname) < 0) {
                                    ret.attrs[fname].files.push(linkname);
                                }
                            }
                            // ret.metadata, 
                            // ret.data 
                        }
                        nextlink();
                        return;
                    });

                }
            ]);
        }, function (error) {
            supercallback6(res, ret);
            return;
        });
    };



    /**
     * showall - alle Dateien graphisch aufbereiten
     * Parameter sind predirectory und directory, 
     * linkarray enthält die Namen aller ausgewählten Dateien
     * root-Directory wird zugefügt
     * Attribute werden gegen KLIATTR geprüft, daraus kommt die Aufbereitung graphisch
     * var appDir = path.dirname(require.main.filename);
     */
    sys0000sys.showall = function (rootdir, gbldb, fs, async, req, res, supercallback7) {
        var files = [];
        var predirectory = "";
        if (req.body && typeof req.body.predirectory !== "undefined" && req.body.predirectory.length > 0) {
            predirectory = req.body.predirectory;
        }
        var directory = "";
        if (req.body && typeof req.body.directory !== "undefined" && req.body.directory.length > 0) {
            directory = req.body.directory;
        }
        var linkarray = [];
        if (req.body && typeof req.body.linkarray !== "undefined" && req.body.linkarray.length > 0) {
            linkarray = req.body.linkarray;
        }
        var trule = "";
        if (req.body && typeof req.body.trule !== "undefined" && req.body.trule.length > 0) {
            trule = req.body.trule;
        }

        var filestats;
        var ret = {};
        ret.attrs = {}; // Auszug aus KLIATTRS, um relevante Attribute zu filtern   
        ret.datas = []; // Array mit Header und den eigentlichen Daten je Ausgangsdatei
        if (predirectory.length > 0) {
            ret.directory = path.join(rootdir, predirectory);
            ret.directory = path.join(ret.directory, directory);
        } else {
            ret.directory = path.join(rootdir, directory);
        }
        async.eachSeries(linkarray, function (linkname, nextlink) {
            async.waterfall([
                function (callback) {
                    if (Object.keys(ret.attrs).length === 0) {
                        var reqparm = {
                            sel: {},
                            projection: {
                                fieldname: 1,
                                isrelevant: 1,
                                istimescale: 1
                            },
                            sort: {
                                fieldname: 1
                            },
                            table: "KLIATTRS",
                            firma: "KLI",
                            skip: 0,
                            limit: 0
                        };
                        sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                            if (ret1.error === true) {
                                // sollte nicht passieren??? oder auch hier anlegen
                                callback("Error", res, ret);
                                return;
                            } else {
                                if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                                    // attrs füllen
                                    for (var irec = 0; irec < ret1.records.length; irec++) {
                                        var record = ret1.records[irec];
                                        ret.attrs[record.fieldname] = {
                                            isrelevant: record.isrelevant,
                                            istimescale: record.istimescale
                                        };
                                    }
                                    callback(null, res, ret);
                                    return;
                                } else {
                                    ret.error = true;
                                    ret.message = "Keine Sätze vorhanden";
                                    callback("Error", res, ret);
                                    return;
                                }
                            }
                        });
                    } else {
                        callback(null, res, ret);
                        return;
                    }
                },
                function (res, ret, callback) {
                    var reqparm = {
                        trule: trule,
                        predirectory: predirectory,
                        directory: directory,
                        filename: linkname
                    };
                    sys0000sys.getp2kfile(rootdir, fs, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === false) {
                            /*
                                data:Array(339) [Object, Object, Object, …]
                                error:false
                                message:"OK"
                                metadata:Object {archive: " speleothem"}
                                metafields:Array(3) [Object, Object]
                            */
                            /**
                             * Prüfung metafields gegen KLIATTRS, ob relevant
                             * wenn ja, dann behalten, sonst löschen aus data-Array-Objekten
                             */
                            var myfields = {};
                            var attrs = ret.attrs;
                            ret.metafields = Object.assign([], ret1.metafields);
                            for (var iattr = 0; iattr < ret.metafields.length; iattr++) {
                                var fieldname = ret.metafields[iattr].fieldname;
                                if (typeof attrs[fieldname] !== "undefined" && attrs[fieldname].isrelevant === true) {
                                    myfields[fieldname] = Object.assign({}, attrs[fieldname]);
                                } else if (typeof attrs[fieldname] !== "undefined" && attrs[fieldname].istimescale === true) {
                                    myfields[fieldname] = Object.assign({}, attrs[fieldname]);
                                } else if (fieldname === "year") {
                                    myfields[fieldname] = {
                                        isrelevant: true,
                                        istimescale: true
                                    };
                                }
                            }
                            // ret.datas fortschreiben
                            var newdata = {};
                            newdata.filename = linkname;
                            newdata.metadata = Object.assign({}, ret1.metadata);
                            newdata.myfields = Object.assign({}, myfields);
                            newdata.data = [];
                            var data = ret1.data;
                            for (var idata = 0; idata < data.length; idata++) {
                                var row = data[idata];
                                var datarow = {};
                                for (var field in myfields) {
                                    if (myfields.hasOwnProperty(field)) {
                                        datarow[field] = row[field];
                                    }
                                }
                                newdata.data.push(datarow);
                            }
                            /*                                
                                data:Array(339) [Object, Object, Object, …]
                                filename:"Afr-ColdAirCave.Sundqvist.2013.txt"
                                metadata:Object {archive: " speleothem", sitename: " Cold Air Cave", latitude: " -24", …}
_                           */
                            ret.datas.push(newdata);
                        }
                        nextlink();
                        return;
                    });
                }
            ]);
        }, function (error) {
            supercallback7(res, ret);
            return;
        });
    };



    /**
     * getp2kfile - Datei lesen und Daten als Array bereitstellen
     * Parameter sind url, predirectory, directory, filename
     * trule: 1000=ingnorieren, first5= die ersten 5 Sätze mit Daten als html aufbereiten
     * oder das Array darauf beschränken
     * Rückgabe ret.data ret.metadata, ret.metafields jeweisl als Array
     */

    sys0000sys.getp2kfile = function (rootdir, fs, async, req, reqparm, res, supercallback3) {
        var files = [];
        var predirectory = "";
        var directory = "";
        var filename = "";
        var trule = "";
        var ret = {};
        ret.data = [];


        if (typeof req !== "undefined" && req !== null) {
            if (req.query && typeof req.query.predirectory !== "undefined" && req.query.predirectory.length > 0) {
                predirectory = req.query.predirectory;
            }
            if (req.query && typeof req.query.directory !== "undefined" && req.query.directory.length > 0) {
                directory = req.query.directory;
            }
            if (predirectory.length > 0) {
                ret.directory = path.join(rootdir, predirectory);
                ret.directory = path.join(ret.directory, directory);
            } else {
                ret.directory = path.join(rootdir, directory);
            }
            if (req.query && typeof req.query.filename !== "undefined" && req.query.filename.length > 0) {
                filename = req.query.filename;
            }
            if (req.query && typeof req.query.trule !== "undefined" && req.query.trule.length > 0) {
                trule = req.query.trule;
            }
        } else if (typeof reqparm !== "undefined" && reqparm !== null) {
            if (reqparm && typeof reqparm.predirectory !== "undefined" && reqparm.predirectory.length > 0) {
                predirectory = reqparm.predirectory;
            }
            if (reqparm && typeof reqparm.directory !== "undefined" && reqparm.directory.length > 0) {
                directory = reqparm.directory;
            }
            if (predirectory.length > 0) {
                ret.directory = path.join(rootdir, predirectory);
                ret.directory = path.join(ret.directory, directory);
            } else {
                ret.directory = path.join(rootdir, directory);
            }
            if (reqparm && typeof reqparm.filename !== "undefined" && reqparm.filename.length > 0) {
                filename = reqparm.filename;
            }
            if (reqparm && typeof reqparm.trule !== "undefined" && reqparm.trule.length > 0) {
                trule = reqparm.trule;
            }

        }

        var linecount = 0;
        var metadata = {};
        var metafields = [];
        var headfields = [];
        var datafields = [];
        var datalinecounter = 0;

        ret.filepath = path.join(ret.directory, filename);
        var readInterface = readline.createInterface({
            input: fs.createReadStream(ret.filepath),
            console: false
        });
        readInterface.on('line', function (line) {
            //console.log(line);
            if (line.startsWith("##") === true && line.trim().length > 0) {
                var metainfo = line.split("\t");
                metafields.push({
                    fieldname: metainfo[0].substr(2),
                    fielddescr: metainfo[1]
                });
            } else if (line.startsWith("#") === true && line.trim().length > 0) {
                /*
                    Metadaten zu der Datei
                    # Archive: tree
                    # Site_Information
                    #     Site_Name: Lake Tanganyika
                    #     Location: 
                    #     Country: 
                    #     Northernmost_Latitude: -6.03
                    #     Southernmost_Latitude: -6.03
                    #     Easternmost_Longitude: 28.53
                    #     Westernmost_Longitude: 28.53
                    #     Elevation: 905
                    #------------------
                    # Data_Collection
                    #     Collection_Name: 
                    #     Earliest_Year: 504.0
                    #     Most_Recent_Year: 1986.0
                    #     Time_Unit: AD
                    #     Core_Length: 
                */
                sys0000sys.getlineparameter(line, "Archive:", "archive", metadata);
                sys0000sys.getlineparameter(line, "Northernmost_Latitude:", "latitude", metadata);
                sys0000sys.getlineparameter(line, "Easternmost_Longitude:", "longitude", metadata);
                sys0000sys.getlineparameter(line, "Elevation:", "HGHT", metadata);
                sys0000sys.getlineparameter(line, "Site_Name:", "sitename", metadata);
                sys0000sys.getlineparameter(line, "Earliest_Year:", "firstyear", metadata);
                sys0000sys.getlineparameter(line, "Most_Recent_Year:", "lastyear", metadata);
            } else if (line.startsWith("#") === false && line.trim().length > 0) {
                linecount++;
                if (linecount === 1) {
                    // head-line
                    headfields = line.split("\t");
                } else {
                    // data-line
                    datalinecounter++;
                    if (trule === "first5" && datalinecounter > 5) {
                        readInterface.close();
                        return;
                    }
                    datafields = line.split("\t");
                    var datarow = {};
                    for (var ifield = 0; ifield < metafields.length; ifield++) {
                        var fname = metafields[ifield].fieldname;
                        var fvalue = datafields[ifield];
                        datarow[fname] = fvalue;
                    }
                    ret.data.push(datarow);
                }
            }

        });
        readInterface.on('close', function () {
            // do something on finish here
            supercallback3(res, {
                error: false,
                message: "OK",
                metadata: metadata,
                data: ret.data,
                metafields: metafields
            });
            return;
        });
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

    /**
     * rekursive Auflösung Verzeichnis mit Selektion nach Jahren für HYDE
     * sehr speziell
     */
    sys0000sys.getallhydefiles = function (aktdir, hfiles) {
        if (async ===null) async = require("async");
        fs.readdir(aktdir, function (error, dirs) {
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
                } catch (err) {

                }
            }
        });




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
     * transhyde - alle Daten aufbereiten für vorgegebene Jahre
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
        var selyears = "";
        var adbc = "";

        if (typeof req !== "undefined" && req !== null) {
            if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
                fullname = req.query.fullname;
            }
            if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
                selyears = req.query.selyears;
            }
            if (req.query && typeof req.query.adbc !== "undefined" && req.query.adbc.length > 0) {
                adbc = req.query.adbc;
            }
            if (req.query && typeof req.query.rootname !== "undefined" && req.query.rootname.length > 0) {
                rootname = req.query.rootname;
            }

        } else if (typeof reqparm !== "undefined" && reqparm !== null) {
            if (reqparm && typeof reqparm.fullname !== "undefined" && reqparm.fullname.length > 0) {
                fullname = reqparm.fullname;
            }
            if (reqparm && typeof reqparm.selyears !== "undefined" && reqparm.selyears.length > 0) {
                selyears = reqparm.selyears;
            }
            if (reqparm && typeof reqparm.adbc !== "undefined" && reqparm.adbc.length > 0) {
                adbc = reqparm.adbc;
            }
            if (reqparm && typeof reqparm.rootname !== "undefined" && reqparm.rootname.length > 0) {
                rootname = reqparm.rootname;
            }
        }
        var firstdir = fullname;
        var filelist = [];
        filelist = walkSync(firstdir, filelist, selyears, adbc);

        linfilelist.sort(function (a, b) {
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        });
        console.log("HYDE-Files gefunden:" + linfilelist.length);
        /*
        if (1 === 1) {
            callbackh(res, {
                error: false,
                message: "OK",
                metafields: metafields,
                hitcells: hitcells,
            });
            return;
        }
        */
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
                console.log(fullfilename + " Started");
                valcounter = 0;
                async.waterfall([
                        function (callbackn) {
                            // fullfilename zerlegen für Feldname, Jahr
                            var filename = path.basename(fullfilename);
                            var fparts = filename.match(/([a-zA-Z_]*)(\d*)(BC|AD)/);

                            // console.log(fparts); // Array(4) ["conv_rangeland0AD", "conv_rangeland", "0", "AD"]
                            var year = fparts[2];
                            if (year.length > 0) {
                                year = ("0000" + year).slice(-4);
                            }
                            var variablename = fparts[1];
                            if (typeof hydedata.variables === "undefined") {
                                hydedata.variables = {};
                            }
                            if (typeof hydedata[year] === "undefined") {
                                hydedata[year] = {};
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
                        function (res, ret, callbackn) {
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
                                } else if (lline.startsWith("NODATA_value")) {
                                    fld = lline.replace("NODATA_value", "");
                                    fld = fld.replace(/ /g, "");
                                    metafields.NODATA_value = fld;
                                } else {
                                    /**
                                     * hier kommen die Daten, VIELE DATEN!!!
                                     */
                                    rowcount++;
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
                                    var lat = kli9020fun.getlatfieldsp("" + latitude);
                                    // Filtern der Zellen für Deutschland
                                    var lastcell = rowcells.length; // 
                                    var summe = 0;
                                    var icount = 0;
                                    for (var i = 0; i < lastcell; i++) {
                                        /**
                                         * hier die Zellen auf signifikante Werte abprüfen
                                         */
                                        var x = i + 1;
                                        var longitude = parseFloat(metafields.xllcorner + (x * metafields.cellsize));
                                        var wert = rowcells[i];
                                        if (!wert.startsWith("-9999")) {
                                            if (!isNaN(wert)) {
                                                icount++;
                                                valcounter++;
                                                if (wert.indexOf(".") >= 0) {
                                                    summe += parseFloat(wert) || 0;
                                                } else {
                                                    summe += parseInt(wert) || 0;
                                                }
                                            } else {
                                                console.log(variablename + " NaN:" + wert);
                                            }
                                        }
                                    }
                                    // hydedata[year][variablename] = {};
                                    if (icount > 0) {
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
                                callbackn("Finish", res, ret);
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


                var fullpath64 = "";
                var path64 = "";
                fullpath64 = path.join(rootname, "static");
                path64 = "static";
                fullpath64 = path.join(fullpath64, "temp");
                path64 = path.join(path64, "temp");
                if (!fs.existsSync(fullpath64)) {
                    fs.mkdirSync(fullpath64);
                }
                fullpath64 = path.join(fullpath64, "hyde");
                path64 = path.join(path64, "hyde");
                if (!fs.existsSync(fullpath64)) {
                    fs.mkdirSync(fullpath64);
                }
                //var filnr = Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000;
                var datafilename = "hydelats.txt";
                var fulldatafilename = path.join(fullpath64, datafilename);
                fs.writeFile(fulldatafilename, JSON.stringify(hydedata), function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Finished-Files processed:" + filecounter);
                    }
                    callbackh(res, {
                        error: false,
                        message: err || "OK",
                        datafilename: datafilename,
                        fulldatafilename: fulldatafilename,
                        hydedata: hydedata
                    });
                    return;
                });
            });
        // G:\Projekte\klimadaten\HYDE_lu_pop_proxy\baseline\asc\2008AD_pop\rurc_2008AD.asc
    };


    /**
     * gethydefile - Datei lesen und Daten als Array bereitstellen
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
            callback ist function (res, ret)
     */
    sys0000sys.gethydefile = function (rootdir, fs, async, req, reqparm, res, callbackh) {

        var files = [];
        var predirectory = "";
        var directory = "";
        var filename = "";
        var trule = "";
        var ret = {};
        ret.data = [];

        if (typeof req !== "undefined" && req !== null) {
            if (req.query && typeof req.query.predirectory !== "undefined" && req.query.predirectory.length > 0) {
                predirectory = req.query.predirectory;
            }
            if (req.query && typeof req.query.directory !== "undefined" && req.query.directory.length > 0) {
                directory = req.query.directory;
            }
            if (predirectory.length > 0) {
                ret.directory = path.join(rootdir, predirectory);
                ret.directory = path.join(ret.directory, directory);
            } else {
                ret.directory = path.join(rootdir, directory);
            }
            if (req.query && typeof req.query.filename !== "undefined" && req.query.filename.length > 0) {
                filename = req.query.filename;
            }
            if (req.query && typeof req.query.trule !== "undefined" && req.query.trule.length > 0) {
                trule = req.query.trule;
            }
        } else if (typeof reqparm !== "undefined" && reqparm !== null) {
            if (reqparm && typeof reqparm.predirectory !== "undefined" && reqparm.predirectory.length > 0) {
                predirectory = reqparm.predirectory;
            }
            if (reqparm && typeof reqparm.directory !== "undefined" && reqparm.directory.length > 0) {
                directory = reqparm.directory;
            }
            if (predirectory.length > 0) {
                ret.directory = path.join(rootdir, predirectory);
                ret.directory = path.join(ret.directory, directory);
            } else {
                ret.directory = path.join(rootdir, directory);
            }
            if (reqparm && typeof reqparm.filename !== "undefined" && reqparm.filename.length > 0) {
                filename = reqparm.filename;
            }
            if (reqparm && typeof reqparm.trule !== "undefined" && reqparm.trule.length > 0) {
                trule = reqparm.trule;
            }

        }

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


        ret.filepath = path.join(ret.directory, filename);
        // feststellen ob die Datei existiert
        if (!fs.existsSync(ret.filepath)) {
            ret.filepath = "G:\\Projekte\\klimadaten\\HYDE_lu_pop_proxy\\general_files\\iso_cr.asc";
        }

        var readInterface = readline.createInterface({
            input: fs.createReadStream(ret.filepath),
            console: false
        });
        readInterface.on('line', function (line) {
            //console.log(line);
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
            } else if (lline.startsWith("NODATA_value")) {
                fld = lline.replace("NODATA_value", "");
                fld = fld.replace(/ /g, "");
                metafields.NODATA_value = fld;
            } else {
                /**
                 * hier kommen die Daten, VIELE DATEN!!!
                 */
                rowcount++;
                var rowcells = line.split(" ");
                // Sizing-Test, volle Matrix im Speicher
                datamat.push(rowcells);
                // Filtern der Zellen für Deutschland
                var lastcell = rowcells.length; // 
                for (var i = 0; i < lastcell; i++) {
                    // 276 Germany, 152 Chile
                    if (rowcells[i] === "152") {
                        var x = i + 1;
                        var y = rowcount;
                        hitcount++;
                        //if (hitcount <= 100) {
                        hitcells.push({
                            linkname: "HYDE",
                            archive: "HYDE",
                            sitename: "Chile 152",
                            longitude: parseFloat(metafields.xllcorner + (x * metafields.cellsize)),
                            latitude: parseFloat(metafields.yllcorner + (metafields.nrows - y) * metafields.cellsize),
                            value: rowcells[i]

                        });
                        //}
                    }
                }
            }
        });
        readInterface.on('close', function () {
            // do something on finish here
            console.log("Finished:" + hitcells.length);
            callbackh(res, {
                error: false,
                message: "OK",
                metafields: metafields,
                hitcells: hitcells,
                /* datamat: datamat */
            });
            return;
        });
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
                    sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            // sollte nicht passieren??? oder auch hier anlegen
                            callback("Error", ret);
                            return;
                        } else {
                            if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
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
                            } else {
                                ret.error = true;
                                ret.message = "Keine Sätze vorhanden";
                                callback(null, ret);
                                return;
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
                    ret.message = error.message;
                    supercallback4(res, ret);
                    return;
                } else {
                    ret.err = false;
                    ret.message = "getralbefiles finished";
                    supercallback4(res, ret);
                    return;
                }
            }
        );

    };


    /**
     * getalbefile - Datei lesen und Daten als Array bereitstellen
     * Parameter sind url, predirectory, directory, filename
     * sowie hier speziell:
     * metaonly true/false - nur Metadaten oder auch Inhaltsdaten
     * variablename - Name der Variable, die als Auswertung zurückgegeben werden soll,
     *                automatisch werden auch die Dimensionen zurückgegeben, die als Variablen auftauchen
     * später auch: Variablennamen, weil netCDF mehrere Variablen bereitstellen kann
     * 1. Die Daten liegen in einer tar-Datei vor, diese wird vorab unzipped
     * 2. Die Dateien sind nc-Dateien im netCDF-Format (level 4)
     * 3. Die nc-Dateien werden mit dem Hilfsprogramm ncdump aufbereitet zu txt-Dateien
     *    Die txt-Dateien sind sehr gross und werden nach der Verarbeitung wieder gelöscht
     *    diese Funktion wird später ergänzt, zuerst wird netCDF als Kernfunktion bearbeitet
     * 4. Die txt-Dateien werden sehr speziell aufbereitet und zurückgegeben wie beim
     *    Esri ASCII-Raster-Format der HYDE-Daten zu  
     *          metafields: metafields,
     *          hitcells: hitcells,
     * Die Metafields zeigen direkt auf longitude und latitude, der Umweg über die Zellen ist also eigentlich 
     * nicht erforderlich, aber weil die Weiterverarbeitung bereits auf Zellen basiert werden diese 
     * noch irgendwie mit geschlüsselt
     * Die HYDE-Daten haben größere Grid-Flächen, als die ALBEDO-Daten, da wäre ein Umrechnung aus sinnvoll
     * oder eine entsprechende Vektor-Aufbereitung.
     * Rückgabe ret.data als Objekt mit Parametern sowie
     * var metadata = ret1.metadata;
     * var data = ret1.data;
     * var metafields = ret1.metafields;
     */
    sys0000sys.getalbefile = function (gbldb, rootdir, fs, async, req, reqparm, res, callbacki) {

        var files = [];
        var predirectory = "";
        var directory = "";
        var filename = "";
        var fileopcode = "meta";
        var trule = "";
        var ret = {};
        console.log("getalbefile: started");
        if (typeof req !== "undefined" && req !== null) {
            if (req.query && typeof req.query.predirectory !== "undefined" && req.query.predirectory.length > 0) {
                predirectory = req.query.predirectory;
            }
            if (req.query && typeof req.query.directory !== "undefined" && req.query.directory.length > 0) {
                directory = req.query.directory;
            }
            if (predirectory.length > 0) {
                ret.directory = path.join(rootdir, predirectory);
                ret.directory = path.join(ret.directory, directory);
            } else {
                ret.directory = path.join(rootdir, directory);
            }
            if (req.query && typeof req.query.filename !== "undefined" && req.query.filename.length > 0) {
                filename = req.query.filename;
            }
            if (req.query && typeof req.query.trule !== "undefined" && req.query.trule.length > 0) {
                trule = req.query.trule;
            }
            if (req.query && typeof req.query.fileopcode !== "undefined" && req.query.fileopcode.length > 0) {
                fileopcode = req.query.fileopcode;
            }
        } else if (typeof reqparm !== "undefined" && reqparm !== null) {
            if (reqparm && typeof reqparm.predirectory !== "undefined" && reqparm.predirectory.length > 0) {
                predirectory = reqparm.predirectory;
            }
            if (reqparm && typeof reqparm.directory !== "undefined" && reqparm.directory.length > 0) {
                directory = reqparm.directory;
            }
            if (predirectory.length > 0) {
                ret.directory = path.join(rootdir, predirectory);
                ret.directory = path.join(ret.directory, directory);
            } else {
                ret.directory = path.join(rootdir, directory);
            }
            if (reqparm && typeof reqparm.filename !== "undefined" && reqparm.filename.length > 0) {
                filename = reqparm.filename;
            }
            if (reqparm && typeof reqparm.trule !== "undefined" && reqparm.trule.length > 0) {
                trule = reqparm.trule;
            }
            if (reqparm && typeof reqparm.fileopcode !== "undefined" && reqparm.fileopcode.length > 0) {
                fileopcode = reqparm.fileopcode;
            }
        }
        var adata = {}; // Container für die Gesamtheit der Daten aus einer Datei
        adata.dimensionslist = "";
        ret.adata = adata;
        var lastabschnitt = "";
        var lastvariable = ""; // ist der Variablenname oder "global"

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

        async.waterfall([
                function (callback8) {
                    // filename extension auf txt setzen
                    // erst später wird hier konvertiert
                    ret.data = [];
                    ret.filename = filename.replace(".nc", ".txt");
                    callback8(null, ret);
                    return;
                },
                function (ret, callback8) {
                    console.log("getalbefile: read-started");
                    ret.filepath = path.join(ret.directory, ret.filename);
                    var readInterface = readline.createInterface({
                        input: fs.createReadStream(ret.filepath),
                        console: false
                    });
                    readInterface.on('line', function (line) {
                        linecount++;
                        if (linecount < 50000) {
                            if (linecount % 10000 === 0) console.log("getalbefile: reading " + linecount);
                        } else {
                            if (linecount % 100000 === 0) console.log("getalbefile: reading " + linecount);
                        }

                        //console.log(line);
                        /**
                         * Abschnitte: 
                         * netcdf ist eine Variable: netcdf SALpm19920215000000219AVPOS01GL {  
                         * dimensions: leitet Zuweisungen ein für lat, lon, bndsize, time, Format dazu 
                         *             tab blank <lat> blank = blank <wert> blank ;
                         * variables: leitet Variablendefinitionen ein
                         *          tab <Datentyp> blank <name>(description) blank ;
                         *          tab tab <name>:long_name oder units oder standard_name mit String oder Zahl und ;
                         *                  und es gibt auch weitere Attribute zu den Variablen
                         * // global attributes: das kommt am Ende der Variables und leitet das Format ein:
                         *          tab tab : <name> blank = blank <wert> ;
                         *          hier gibt es viele <name> Zuweisungen global
                         * data:
                         *      hier wird es voluminös, Struktur:
                         *  blank <name> blank = [matrix] 
                         *      <name> sind die o.a. dimensions, aber: die Reihenfolge ist frei
                         *      [matrix] ist eine Speicherungsform mit Zeilen und Spalten bzw. Zellenwerten
                         *      lat und lon bestimmen inhaltlich Zeilen und Spalten (Randdefinitionen)
                         *      lon ist eher x, (f)lat ist eher y - das ist zu prüfen
                         *      Beispiel sal_median (Testvariable für die Programmierung):
                         *      alle Einträge sind kommasepariert
                         *      _, ist der Eintrag für einen missing value
                         *      die anderen Einträge stellen die Werte in den Zellen dar
                         *      die Zeilen sind anhand der Spalten auszuzählen, CRLF-Logiken ziehen hier NICHT!
                         * 
                         */


                        var lline = line.toLocaleLowerCase();
                        var fld = "";
                        // erste Stelle Buchstabe = neuer Abschnitt sonst im alten Abschnitt
                        if (line.substr(0, 1) >= "a" && line.substr(0, 1) <= "z") {
                            // Abschnittswechsel
                            if (lline.startsWith("netcdf")) {
                                // netcdf SALpm19920215000000219AVPOS01GL {
                                adata.netcdf = lline;
                                metadata.format = "netCDF-ASCII";
                                metadata.fileinfo = lline;
                                lastabschnitt = "netcdf";
                                return true;
                            } else if (lline.startsWith("dimensions:")) {
                                adata.dimensions = {};
                                lastabschnitt = "dimensions";
                                return true;
                            } else if (lline.startsWith("variables:")) {
                                adata.variables = {};
                                lastabschnitt = "variables";
                                return true;
                            } else if (lline.startsWith("data:")) {
                                adata.data = {};
                                lastabschnitt = "data";
                                return true;
                            }
                        } else {
                            // Arbeit im alten Abschnitt
                            if (lastabschnitt === "dimensions") {
                                sys0000sys.getalbevar(adata, lastabschnitt, line);
                                return true;
                            }
                            if (lastabschnitt === "variables") {
                                sys0000sys.getalbevar(adata, lastabschnitt, line);
                                return true;
                            }
                            // global wird in getalbevar gesetzt!
                            if (lastabschnitt === "global") {
                                sys0000sys.getalbevar(adata, lastabschnitt, line);
                                return true;
                            }
                            if (lastabschnitt === "data") {
                                if (fileopcode.indexOf("datastat") >= 0) {
                                    sys0000sys.getalbestat(adata, lastabschnitt, line);
                                    return true; // Test Schluss
                                } else {
                                    return false; // Test Schluss
                                }
                            }
                        }
                    });
                    readInterface.on('close', function () {
                        // do something on finish here
                        console.log("Finished:" + hitcells.length);
                        console.log("getalbefile: read-finished " + linecount);
                        ret.hitcells = hitcells;
                        ret.adata = adata;
                        ret.metadata = metadata;
                        ret.metafields = metafields;
                        callback8(null, ret);
                        return;
                    });

                },
                function (ret, callback8) {
                    /**
                     * Ausgabe/Abgleich KLIFILES - fullname ist ret.filepath
                     */
                    var klirec = {};
                    var reqparm = {};
                    reqparm.sel = {
                        fullname: ret.filepath
                    };
                    reqparm.projection = {};
                    reqparm.table = "KLIFILES";
                    sys0000sys.getonerecord(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {} else {
                            ret.klirec = ret1.record;
                        }
                        console.log("getalbefile: KLIFILES gelesen");
                        callback8(null, ret);
                        return;
                    });
                },
                function (ret, callback8) {
                    var klirec = ret.klirec;
                    klirec.archive = "CERES";
                    klirec.firstyear = "";
                    klirec.lastyear = "";
                    // longitude, latitude, HGHT machen keinen Sinn
                    try {
                        klirec.title = ret.adata.global.title || "";
                        klirec.institution = ret.adata.global.institution || "";
                        klirec.comment = ret.adata.global.comment || "";
                        klirec.version = ret.adata.global.version || "";
                        klirec.DOI = ret.adata.global.DOI || "";
                    } catch (err) {}
                    // metafields - mit fieldname, fielddescr
                    callback8(null, ret);
                    return;
                },
                function (ret, callback8) {
                    if (typeof ret.klirec === "undefined") {
                        callback8("Finish", ret);
                        return;
                    }
                    /**
                     * Integration adata.datastat in adata.variables mit
                     *  count: 0,
                        countmissing: 0,
                        countnull: 0,
                        countnonsignificant: 0,
                        min: null,
                        max: null
                     */

                    if (typeof adata.datastat !== "undefined" && typeof adata.variables !== "undefined") {
                        for (var stat in adata.datastat) {
                            if (adata.datastat.hasOwnProperty(stat)) {
                                if (adata.variables[stat] !== "undefined") {
                                    adata.variables[stat].statistics = adata.datastat[stat];
                                }
                            }
                        }
                        delete adata.datastat;
                    }
                    var updfields = {};
                    updfields["$set"] = {};
                    updfields["$set"].dimensions = ret.adata.dimensions;
                    updfields["$set"].dimensionslist = ret.adata.dimensionslist;
                    updfields["$set"].variables = ret.adata.variables;
                    updfields["$set"].global = ret.adata.global;
                    var reqparm = {
                        table: "KLIFILES",
                        selfields: {
                            "fullname": ret.klirec.fullname
                        },
                        updfields: updfields
                    };
                    sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret1) {
                        ret.klirec = ret1.record;
                        delete ret.klirec.history;
                        console.log("getalbefile: KLIFILES updated");
                        callback8("Finish", ret);
                        return;
                    });
                }
            ],
            function (error, result) {
                if (typeof result.error === "undefined") {
                    result.error = false;
                    result.message = "getalbefile finished";
                }
                console.log("getalbefile: finished");
                callbacki(res, result);
                return;
            }
        );
    };


    /**
     * getalbevar - holt Metadaten-Variablen und Dimensionen etc.
     * line = Zeile; 
     * trailerseparator ist leer oder :
     * return {trailer, name, value}
     */
    sys0000sys.getalbevar = function (adata, lastabschnitt, line) {
        var cline = line;
        var attr = "";
        var wert = "";
        var idis = 0;
        var lastvariable = "";
        // global fängt mit : an
        var gline = cline.replace(/\t/g, "");
        if (gline.trim().startsWith(":")) {
            if (typeof adata.global === "undefined") {
                adata.global = {};
            }
            lastabschnitt = "global";
            gline = gline.substr(1); // skip von :
            var v = gline.split("=");
            if (v.length === 2) {
                attr = v[0].trim();
                wert = v[1];
                wert = wert.substr(0, wert.length - 1);
                wert = wert.trim();
                // vor- und nachlaufende " entfernen
                wert = wert.replace(/^"/g, "");
                wert = wert.replace(/"+$/g, "");
                adata[lastabschnitt][attr] = wert;
                if (lastabschnitt === "dimensions") {
                    if (adata.dimensionslist.length > 0) adata.dimensionslist += ","
                    adata.dimensionslist += attr;
                }
            }
            return;
        }
        // zwei tabs
        if (cline.startsWith("\t\t")) {
            cline = cline.substr(2);
            idis = cline.indexOf(":");
            if (idis > 0) {
                lastvariable = cline.substr(0, idis);
                cline = cline.substr(idis + 1);
            }
            idis = cline.indexOf("=");
            if (idis > 0) {
                attr = cline.substr(0, idis).trim();
                wert = cline.substr(idis + 1);
                wert = wert.substr(0, wert.length - 1); // ; entfernen
                wert = wert.trim();
                // bei Strings die " strippen
                if (wert.startsWith('"')) {
                    wert = wert.substr(1, wert.length - 2);
                }
                if (lastvariable === "") {
                    lastvariable = "global";
                }
                if (typeof adata[lastabschnitt][lastvariable] === "undefined") {
                    adata[lastabschnitt][lastvariable] = {};
                }
                adata[lastabschnitt][lastvariable][attr] = wert;
            }
            return;
        }
        // ein Tab
        if (cline.startsWith("\t")) {
            if (lastabschnitt === "dimensions") {
                cline = cline.substr(1);
                var v = cline.split("=");
                if (v.length === 2) {
                    attr = v[0].trim();
                    wert = v[1];
                    wert = wert.substr(0, wert.length - 1);
                    wert = wert.trim();
                    adata[lastabschnitt][attr] = wert;
                }
                return;
            }
            if (lastabschnitt === "variables") {
                // <type> <name>(<descr>) ;
                cline = cline.substr(1);
                idis = cline.indexOf(" ");
                if (idis > 0) {
                    var vartype = cline.substr(0, idis);
                    cline = cline.substr(idis + 1).trim();
                    var descr = cline.match(/\((.*)\)/);
                    idis = cline.indexOf(descr[0], "");
                    if (idis > 0) {
                        var varname = cline.substr(0, idis).trim();
                        adata[lastabschnitt][varname] = {};
                        adata[lastabschnitt][varname]["descr"] = descr[1];
                        adata[lastabschnitt][varname]["type"] = vartype;
                    }
                    return;
                }
            }
        }

    };


    /**
     * getalbestat - Holen Statistik zu data
     * line = Zeile; 
     * data:
        lat = -89.875, -89.625, -89.375, -89.125, -88.875, -88.625, -88.375,
            -88.125, -87.875, -87.625, -87.375, -87.125, -86.875, -86.625, -86.375,
            -86.125, -85.875, -85.625, -85.375, -85.125, -84.875, -84.625, -84.375,
            . . . 
            89.875 ;

        lon = -179.875, -179.625, -179.375, -179.125, -178.875, -178.625, -178.375,
            -178.125, -177.875, -177.625, -177.375, -177.125, -176.875, -176.625,
     * 
     * also <variable><blank>=<Werteliste> bis zum ;
     * return {trailer, name, value}
     */
    sys0000sys.getalbestat = function (adata, lastabschnitt, line) {
        var cline = line;
        var attr = "";
        var wert = "";
        var idis = 0;
        var lastvariable = "";
        if (typeof adata.datastat === "undefined") {
            adata.datastat = {};
            adata.lastdatavariable = "";
        }
        if (line.trim().length === 0) {
            return;
        }
        if (line.indexOf("=") > 0) {
            var t1 = line.split("=");
            var datavariable = t1[0].trim();
            adata.datastat[datavariable] = {
                count: 0,
                countmissing: 0,
                countnull: 0,
                countnonsignificant: 0,
                min: null,
                max: null
            };
            adata.lastdatavariable = datavariable;
            line = t1[1]; // und dann weiter mit Werteanalyse
        }
        var lastdatavariable = adata.lastdatavariable;
        var t2 = line.split(",");
        for (var ivar = 0; ivar < t2.length; ivar++) {
            var aktvar = t2[ivar].trim();
            if (aktvar === "" && ivar === (t2.length - 1)) {
                // nix
            } else if (aktvar === "0") {
                adata.datastat[lastdatavariable].count++;
                adata.datastat[lastdatavariable].countnull++;
            } else if (aktvar === "-9999") {
                adata.datastat[lastdatavariable].count++;
                adata.datastat[lastdatavariable].countmissing++;
            } else if (!isNaN(aktvar)) {
                adata.datastat[lastdatavariable].count++;
                if (adata.datastat[lastdatavariable].min === null) {
                    adata.datastat[lastdatavariable].min = aktvar;
                } else if (parseFloat(adata.datastat[lastdatavariable].min) > parseFloat(aktvar)) {
                    adata.datastat[lastdatavariable].min = aktvar;
                }
                if (adata.datastat[lastdatavariable].max === null) {
                    adata.datastat[lastdatavariable].max = aktvar;
                } else if (parseFloat(adata.datastat[lastdatavariable].max) < parseFloat(aktvar)) {
                    adata.datastat[lastdatavariable].max = aktvar;
                }
            } else {
                adata.datastat[lastdatavariable].count++;
                adata.datastat[lastdatavariable].countnonsignificant++;
            }
        }
        return;
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