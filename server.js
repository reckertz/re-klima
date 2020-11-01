"use strict";
var path = require("path");
require('app-module-path/register');
require('app-module-path').addPath(path.join(__dirname, "apps"));
var express = require('express');
var app = express();

var fs = require("fs");
var async = require("async");

var express = require("express");
var bodyParser = require("body-parser");

var session = require('express-session');
var FileStore = require('session-file-store')(session);
var cookieParser = require("cookie-parser");
var compression = require("compression");

var readline = require("readline");
var stream = require("stream");
var ba64 = require("ba64");
// gblInfo
var StreamZip = require("node-stream-zip");

var csv = require("fast-csv");

var csvformat = require('@fast-csv/format');


var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
  // Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
};
console.error = console.log;


// DB expressions
var sqlite3 = require('sqlite3');

var db = new sqlite3.Database('klidata.db3');


db.serialize(function () {
    async.waterfall([
        function (callbackdb1) {
            var sqlstmt = "CREATE INDEX IF NOT EXISTS KLISTATIONS01";
            sqlstmt += " ON KLISTATIONS(source, stationid)";
            db.run(sqlstmt, function (err) {
                console.log("Create Index KLISTATIONS:" + err);
                callbackdb1(null);
                return;
            });
        },
        /*
        function (callbackdb2a) {
            var sqlstmt = "DROP INDEX KLIDATA01";
            db.run(sqlstmt, function (err) {
                console.log("Drop Index KLIDATA01:" + err);
                callbackdb2a(null);
                return;
            });
        },
        */
        function (callbackdb2) {
            var sqlstmt = "CREATE INDEX IF NOT EXISTS KLIDATA01";
            sqlstmt += " ON KLIDATA(source, stationid, variable, fromyear, anzyears)";
            db.run(sqlstmt, function (err) {
                console.log("Create Index KLIDATA:" + err);
                callbackdb2(null);
                return;
            });
        },
        /*
        function (callbackdb3a) {
            var sqlstmt = "DROP INDEX KLIINVENTORY01";
            db.run(sqlstmt, function (err) {
                console.log("Drop Index KLIDATA:" + err);
                callbackdb3a(null);
                return;
            });
        },
        */
        function (callbackdb3) {
            var sqlstmt = "CREATE INDEX IF NOT EXISTS KLIINVENTORY01";
            sqlstmt += " ON KLIINVENTORY(source, stationid, variable, fromyear, toyear)";
            db.run(sqlstmt, function (err) {
                console.log("Create Index KLIINVENTORY01:" + err);
                callbackdb3(null);
                return;
            });
        },
        function (callbackdb9) {

            db.get("PRAGMA index_list('KLICONFIG')", function (err, indexlist) {
                console.log("index_list KLICONFIG:" + JSON.stringify(indexlist) + " " + err);
                if (typeof indexlist === "object") {
                    var indexname = indexlist.name;
                    db.all("PRAGMA index_info('" + indexname + "')", function (err, indexfields) {
                        console.log("index_info " + indexname + ":" + JSON.stringify(indexfields) + " " + err);
                    });
                }
                callbackdb9(null);
                return;
            });
        },
        function (callbackdb10) {

            //var db = new sqlite3.cached.Database('klidata.db3'); // Optimierungsversuch
            db.run("PRAGMA synchronous = OFF", function (err) {
                console.log("synchronous = OFF:" + err);
            });

            db.run("PRAGMA journal_mode = TRUNCATE", function (err) {
                console.log("journal_mode = TRUNCATE:" + err);
            });
            // PRAGMA temp_store = 0 | DEFAULT | 1 | FILE | 2 | MEMORY;
            db.run("PRAGMA temp_store = 2", function (err) {
                console.log("temp_store = 2:" + err);
            });

            /*
            db.run("PRAGMA optimize", function (err) {
                console.log("optimize:" + err);
            });
            */
            db.get("PRAGMA page_size", function (err, page) {
                console.log("page_size:" + JSON.stringify(page) + " " + err);
            });

            /*
            db.on('trace', function (sql) {
                console.log(sql);
            });
            */
            /*
            db.on('profile', function (sql, ms) {
                if (ms > 0) console.log(ms);
            });
            */
           callbackdb10(null);
           return;
        },

        /*
        function (callbackdb4) {
            var sqlstmt = "ALTER TABLE KLIDATA ";
            sqlstmt += " ADD COLUMN lastUpdated TEXT";
            db.run(sqlstmt, function (err) {
                console.log("add column KLIDATA:" + err);
                callbackdb4(null);
                return;
            });
        },
        */
       /*
        function (callbackdb5) {
            var sqlstmt = "ALTER TABLE KLIINVENTORY ";
            sqlstmt += " ADD COLUMN lastUpdated TEXT";
            db.run(sqlstmt, function (err) {
                console.log("add column KLIINVENTORY:" + err);
                callbackdb5(null);
                return;
            });
        }
        */
    ], function (error, result) {
        console.log("Fertig mit Indexerstellung");
    }); // async.waterfall
}); // serialize





/*
db.get("PRAGMA index_list('KLISTA1')", function (err, indexlist) {
    console.log("index_list KLISTA1:" + JSON.stringify(indexlist) + " " + err);
    if (typeof indexlist === "object") {
        var indexname = indexlist.name;
        db.all("PRAGMA index_info('" + indexname + "')", function (err, indexfields) {
            console.log("index_info " + indexname + ":" + JSON.stringify(indexfields) + " " + err);
        });
    }
});
*/
/*
db.get("PRAGMA index_list('KLISTATIONS')", function (err, indexlist) {
    console.log("index_list KLISTATIONS:" + JSON.stringify(indexlist) + " " + err);
    if (typeof indexlist === "object") {
        var indexname = indexlist.name;
        db.all("PRAGMA index_info('" + indexname + "')", function (err, indexfields) {
            console.log("index_info " + indexname + ":" + JSON.stringify(indexfields) + " " + err);
        });
    }
});
*/
/*
db.get("PRAGMA index_list('KLIDATA')", function (err, indexlist) {
    console.log("index_list KLIDATA:" + JSON.stringify(indexlist) + " " + err);
    if (typeof indexlist === "object") {
        var indexname = indexlist.name;
        db.all("PRAGMA index_info('" + indexname + "')", function (err, indexfields) {
            console.log("index_info " + indexname + ":" + JSON.stringify(indexfields) + " " + err);
        });
    } else {
        for (var i2 = 0; i2 < indexlist.length; i2++) {
            var indexname = indexlist[i2].name;
            db.get("PRAGMA index_info('" + indexname + "')", function (err, indexfields) {
                console.log("index_info KLIDATA:" + JSON.stringify(indexfields) + " " + err);
            });
        }
    }
});
*/
/*
db.all("PRAGMA table_info('KLISTATIONS')", function (err, felder) {
    if (typeof felder === "undefined" || felder === null || felder.length === 0) {
        console.log("Tabelle KLISTATIONS nicht vorhanden");
    } else {
        for (var ifeld = 0; ifeld < felder.length; ifeld++) {
            console.log(JSON.stringify(felder[ifeld], null, ""));
        }
    }
});
*/
/**
 * Sequenz zum kompletten Löscher einer Tabelle mit ihren Indices
 */
/*
db.serialize(function () {
    async.waterfall([
        function (cb100) {
            db.all("PRAGMA index_list('KLIINVENTORY')", function (err, indexlist) {
                console.log("index_list KLIINVENTORY:" + JSON.stringify(indexlist) + " " + err);
                cb100(null, {
                    error: false,
                    message: "indices",
                    indexlist: indexlist
                });
            });
        },
        function (ret, cb101) {
            var indexlist = ret.indexlist;
            async.eachSeries(indexlist, function(dbindex, nextindex) {
                var dropStmt = "DROP INDEX IF EXISTS " + dbindex.name;
                db.run(dropStmt, function (err) {
                    console.log(dropStmt + "=>" + err);
                    nextindex();
                    return;
                });
            },
            function (err) {
                cb101(null, {
                    error: false,
                    message: "Indices gelöscht"
                });
                return;
            });
        },
        function(ret, cb102) {
            var dropStmt = "DROP TABLE IF EXISTS " + "KLIINVENTORY";
            db.run(dropStmt, function (err) {
                console.log("KLIINVENTORY gelöscht:" + err);
                cb102("Finish", {
                    error: false,
                    message: "fertig"
                });
                return;
            });
        }
    ],
    function(error, result) {
        console.log("Fertig mit Vorlauf");
    });
});
*/

/*
process.on('uncaughtException', function (err) {
    console.log("###uncaughtException", err);
});

process.on('unhandledRejection', function (err) {
    console.log("###unhandledRejection", err);
});

process.on('rejectionHandled', function (promise) {
    console.log("###rejectionHandled");
    // unhandledRejections.delete(promise);
});
*/

process.on('exit', function (code) {
    console.log("###exit", code);
});


var regression = require("./static/lib/regression.js");
var uihelper = require("re-frame/uihelper.js");



// bereitstellen countries.json und continents.json
// "./data/countries.json"
console.log("*START*");
global.countries = {};
if (fs.existsSync("./data/countries.json")) {
    var coustring = fs.readFileSync("./data/countries.json");
    global.countries = JSON.parse(coustring);
    console.log(Object.keys(global.countries).length);
}
global.continents = {};
if (fs.existsSync("./data/continents.json")) {
    var constring = fs.readFileSync("./data/continents.json");
    global.continents = JSON.parse(constring);
    console.log(Object.keys(global.continents).length);
}

console.log("*EXIT*");

var sys0000sys = require("re-frame/sys0000sys.js");
var kla9020fun = require("re-klima/kla9020fun.js");
var kla1490srv = require("re-klima/kla1490srv.js");
var kla1790srv = require("re-klima/kla1790srv.js");


var gblInfo = sys0000sys.getInfo();



app.use(compression({
    threshold: 64000
}));
var sess;


app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));

/**
 * Security Layer
 */
app.set("trust proxy", 1);
app.use(session({
    name: "server-session-cookie-id",
    secret: 'keyboard cat',
    resave: true,
    httpOnly: false,
    saveUninitialized: false
}));

function checkSession(req, res) {
    sess = req.session;
    /**
     * server-session-cookie-id
     * wenn die Session noch nicht aktiv ist, dann muss
     * der Login erzwungen werden - serverseitig
     */
    var username = "Climate-Expert";
    sess.username = username;
    var pass = "";
    // Dummy Prüfung des API auf Security Level administrator
    var ischecked = true;
    console.log("GET-session:" + sess.username);
    return false;
}

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'static'))); // __dirname is always root verzeichnis #denglisch

/**
 * createtemptable - API - Erstellen temporary table sqlite3
 */
app.get('/createtemptable', function (req, res) {
    if (checkSession(req, res)) return;
    // var cousername = req.query.username;
    try {
        var crtsql = "";
        if (req.query && typeof req.query.crtsql !== "undefined" && req.query.crtsql.length > 0) {
            crtsql = req.query.crtsql;
        }
        db.serialize(function () {
            db.run(crtsql, function (err) {
                var ret = {};
                if (err) {
                    ret.error = true;
                    ret.message = err;
                } else {
                    ret.error = false;
                    ret.message = "CREATE TABLE ausgeführt";
                    var smsg = JSON.stringify(ret);
                    res.writeHead(200, {
                        'Content-Type': 'application/text',
                        "Access-Control-Allow-Origin": "*"
                    });
                    res.end(smsg);
                    return;
                }
            });
        });
    } catch (err) {
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify({
            error: true,
            message: err.message,
            records: null
        }));
        return;
    }
});

/**
 * getsql3tables - API - Sammlung der Tabellen einer Datenbank,
 * gleiche Rückgabestruktur - wird spannend
 */
app.get('/getsql3tables', function (req, res) {
    if (checkSession(req, res)) return;
    // var cousername = req.query.username;
    try {
        var sqlStmt = "SELECT name";
        sqlStmt += " FROM sqlite_master";
        sqlStmt += " WHERE type ='table'";
        sqlStmt += " AND name NOT LIKE 'sqlite_%'";
        db.serialize(function () {
            db.all(sqlStmt, function (err, rows) {
                var ret = {};
                if (err) {
                    ret.error = true;
                    ret.message = err;
                } else {
                    ret.error = false;
                    ret.message = "Tabellen gefunden:" + rows.length;
                    ret.records = rows;
                    var smsg = JSON.stringify(ret);
                    res.writeHead(200, {
                        'Content-Type': 'application/text',
                        "Access-Control-Allow-Origin": "*"
                    });
                    res.end(smsg);
                    return;
                }
            });
        });
    } catch (err) {
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify({
            error: true,
            message: err.message,
            records: null
        }));
        return;
    }
});



/**
 * getsql3tablesx - API - Sammlung der Tabellen und Felder einer Datenbank,
 * gleiche Rückgabestruktur - wird spannend
 */

app.get('/getsql3tablesx', function (req, res) {
    if (checkSession(req, res)) return;
    // var cousername = req.query.username;
    try {
        var sqlStmt = "SELECT name";
        sqlStmt += " FROM sqlite_master";
        sqlStmt += " WHERE type ='table'";
        sqlStmt += " AND name NOT LIKE 'sqlite_%'";
        var tabletree = [];
        var rootobj = {
            text: "Tabellen",
            state: {
                selected: true,
                opened: true
            },
            a_attr: {
                tablename: "all"
            },
            children: []
        };
        db.serialize(function () {
            db.all(sqlStmt, function (err, rows) {
                var ret = {};
                if (err) {
                    ret.error = true;
                    ret.message = err;
                } else {
                    ret.error = false;
                    ret.message = "Tabellen gefunden:" + rows.length;
                    ret.records = rows;
                    async.eachSeries(rows, function (row, nextrow) {
                            var newobj = {
                                text: row.name,
                                state: {
                                    selected: false
                                },
                                a_attr: {
                                    tablename: row.name
                                },
                                children: []
                            };
                            // Satzbeschreibung holen
                            db.all("PRAGMA table_info('" + row.name + "')", function (err, felder) {
                                if (typeof felder === "undefined" || felder === null || felder.length === 0) {
                                    console.log("Tabelle " + row.name + " nicht vorhanden");
                                } else {
                                    for (var ifeld = 0; ifeld < felder.length; ifeld++) {
                                        var feld = felder[ifeld];
                                        var newfld = {
                                            text: feld.name + "(" + feld.type + ")",
                                            state: {
                                                selected: false
                                            },
                                            a_attr: {
                                                name: feld.name,
                                                type: feld.type
                                            },
                                            "icon": "jstree-file"
                                        };
                                        newobj.children.push(newfld);
                                    }
                                    rootobj.children.push(newobj);
                                    nextrow();
                                }
                            });
                        },
                        function (error) {
                            tabletree.push(rootobj);
                            ret.tabletree = tabletree;
                            var smsg = JSON.stringify(ret);
                            res.writeHead(200, {
                                'Content-Type': 'application/text',
                                "Access-Control-Allow-Origin": "*"
                            });
                            res.end(smsg);
                            return;
                        });
                }
            });
        });
    } catch (err) {
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify({
            error: true,
            message: err.message,
            records: null
        }));
        return;
    }

});


/**
 * getsql3index - API - Holen Information zu Indices auf Tabelle
 * in SQLite3 für node.js, Vorgaben
 * - tablename - ist muss
 * - indexname ist optional
 * return: in ret indices als array mit
 * {
 *  - name - Name des Index
 *  - fields - als Strukr der Felder mit
 * }
 */

app.get('/getsql3index', function (req, res) {
    if (checkSession(req, res)) return;
    var indices = [];
    var tablename = "";
    if (req.query && typeof req.query.tablename !== "undefined" && req.query.tablename.length > 0) {
        tablename = req.query.tablename;
    }
    /*
    index_list KLICONFIG:{"seq":0,"name":"indT401961_KLICONFIG","unique":0,"origin":"c","partial":0} null
    index_info indT401961_KLICONFIG:[{"seqno":0,"cid":0,"name":"username"},{"seqno":1,"cid":1,"name":"configname"}] null
    */
    async.waterfall([
        function (callback) {
            db.all("PRAGMA index_list('" + tablename + "')", function (err, indexlist) {
                callback(null, {
                    error: false,
                    message: "OK",
                    indexlist: indexlist
                });
                return;
            });
        },
        function (ret, callback) {
            async.eachSeries(ret.indexlist, function (indexinfo, nextindex) {
                var indexname = indexinfo.name;
                db.all("PRAGMA index_info('" + indexname + "')", function (err, indexfields) {
                    console.log("index_info " + indexname + ":" + JSON.stringify(indexfields) + " " + err);
                    indexinfo.indexfields = indexfields;
                    nextindex();
                    return;
                });
            }, function (error) {
                callback("Finish", {
                    error: false,
                    message: "OK",
                    indexlist: ret.indexlist
                });
                return;
            });
        }
    ], function (error, ret) {
        var smsg = JSON.stringify({
            error: false,
            message: "Indexinfo bereitgestellt",
            indexlist: ret.indexlist
        });
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * getcontfiles  - generische Funktion
 * holt content eines Directory mit direkter Vorgabe
 * directory als array oder string
 * wenn es nicht gefunden wird, dann wird es zu root versucht.
 * parentdirectory wird zurückgegeben, problematisch: wenn der leer wird, dann wird gestoppt
 */
app.get('/getdirectory', function (req, res) {
    if (checkSession(req, res)) return;
    var directory = "";
    if (req.query && typeof req.query.directory !== "undefined" && req.query.directory.length > 0) {
        directory = req.query.directory;
    }
    var rootdir = path.dirname(require.main.filename);

    if (typeof directory === "object" && Array.isArray(directory)) {
        var startdir = directory[0] || "";
        for (var idir = 1; idir < directory.length; idir++) {
            startdir = path.join(startdir, directory[idir]);
        }
        directory = startdir;
    }
    var parentdirectory = directory;
    var dirs = directory.split(path.sep);
    if (dirs.length > 1) {
        dirs.pop();
        parentdirectory = dirs.join(path.sep);
    }
    var searchdir = "";
    if (fs.existsSync(directory)) {
        searchdir = directory;
    } else if (fs.existsSync(path.join(rootdir, directory))) {
        searchdir = path.join(rootdir, directory);
    } else if (fs.existsSync(path.join(rootdir, "static", directory))) {
        searchdir = path.join(rootdir, "static", directory);
    } else {
        var smsg = JSON.stringify({
            error: true,
            message: "directory not found:" + directory
        });
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    }
    async.waterfall([
            function (cbdir) {
                fs.readdir(searchdir, function (error, dirs) {
                    var ret = {};
                    ret.files = [];
                    for (var i = 0; i < dirs.length; i++) {
                        try {
                            var dirinfo = {};
                            dirinfo.name = dirs[i];
                            dirinfo.directory = directory;
                            dirinfo.fullname = path.join(searchdir, dirs[i]);
                            dirinfo.urlname = path.join(directory, dirs[i]);
                            var info = fs.lstatSync(dirinfo.fullname);
                            dirinfo.isFile = info.isFile();
                            dirinfo.isDirectory = info.isDirectory();
                            dirinfo.size = info.size;
                            ret.files.push(dirinfo);
                        } catch (err) {
                            var errinfo = {};
                            errinfo.name = err.message;
                            errinfo.error = true;
                            ret.files.push(errinfo);
                        }
                    }
                    cbdir("finish", ret);
                    return;
                });
            }
        ],
        function (error, ret) {
            ret.error = false;
            if (error !== "finish") {
                ret.error = true;
                ret.message = error;
            }
            ret.message = "Directory aufgelöst:" + ret.files.length;
            ret.parentdirectory = parentdirectory;
            // in ret liegen error, message und record
            var smsg = JSON.stringify(ret);
            res.writeHead(200, {
                'Content-Type': 'application/text',
                "Access-Control-Allow-Origin": "*"
            });
            res.end(smsg);
            return;
        });
});


/**
 * getdirectoryfiles  - generische Funktion
 */
app.get('/getdirectoryfiles', function (req, res) {
    if (checkSession(req, res)) return;
    var useroot = true; // Default
    if (req.query && typeof req.query.useroot !== "undefined" && req.query.useroot.length > 0) {
        useroot = req.query.useroot;
    }
    var rootdir = path.dirname(require.main.filename);
    if (useroot === false || useroot === "false") {
        rootdir = "";
    }
    sys0000sys.getdirectoryfiles(db, rootdir, fs, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * getfilecontent: fullname, fromline, frombyte
 * line by line, chunks nach lines oder bytes, wenn lines zu lange sind
 * Blättern kann noch holprig sein
 */
app.get('/getfilecontent', function (req, res) {
    if (checkSession(req, res)) return;
    var rootdir = path.dirname(require.main.filename);
    var fullname = "";
    if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
        fullname = req.query.fullname;
    }
    var fromline = 0;
    if (req.query && typeof req.query.fromline !== "undefined" && req.query.fromline.length > 0) {
        fromline = parseInt(req.query.fromline) || 0;
    }
    var frombyte = 0;
    if (req.query && typeof req.query.frombyte !== "undefined" && req.query.frombyte.length > 0) {
        frombyte = parseInt(req.query.frombyte) || 0;
    }
    var checklinelength = true;
    if (req.query && typeof req.query.checklinelength !== "undefined" && req.query.checklinelength.length > 0) {
        checklinelength = req.query.checklinelength;
    }
    var getall = false;
    if (req.query && typeof req.query.getall !== "undefined" && req.query.getall.length > 0) {
        getall = req.query.getall;
        if (getall === "true" || getall === true) {
            getall = true;
        }
    }
    var aktline = 0;
    var aktbyte = 0;
    var newline = 0;
    var newbyte = 0;
    var nextchunk = "";
    var ret = {};
    ret.error = false;
    var smsg = "";
    if (!fs.existsSync(fullname)) {
        smsg = JSON.stringify({
            error: true,
            message: "NOT FOUND:" + fullname,
            fullname: fullname
        });
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    }
    var readInterface = readline.createInterface({
        input: fs.createReadStream(fullname),
        console: false
    });
    readInterface.on('line', function (line) {
        //console.log(line);
        if (line.length > 10000 && checklinelength === true) {
            line = line.substr(0, 10000);
            aktline++;
            aktbyte += line.length;
            newline++;
            newbyte += line.length;
            nextchunk += line + "<br>";
            ret.error = true;
            ret.message = "lines zu lang";
            readInterface.close();
            //readInterface.removeAllListeners();
            return false;
        } else {
            aktline++;
            aktbyte += line.length;
            if (getall === true) {
                nextchunk += line + "\n";
                return true;
            } else if (aktline > fromline || aktbyte > frombyte) {
                newline++;
                newbyte += line.length;
                nextchunk += line + "<br>";
                if (checklinelength === true && (newline > 100 || newbyte > 10000)) {
                    readInterface.close();
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        }
    });
    readInterface.on('close', function (err) {
        // do something on finish here
        var smsg = "";
        if (ret.error === true) {
            smsg = JSON.stringify({
                error: true,
                message: ret.message,
                fullname: fullname,
                nextchunk: nextchunk,
                fromline: aktline,
                frombyte: aktbyte
            });

        } else {
            smsg = JSON.stringify({
                error: false,
                message: "next chunk",
                fullname: fullname,
                nextchunk: nextchunk,
                fromline: aktline,
                frombyte: aktbyte
            });
        }
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * textanalysis - Textanalyse
 */
app.get('/textanalysis', function (req, res) {
    if (checkSession(req, res)) return;
    var timeout = 10 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootdir = path.dirname(require.main.filename);
    kla1790srv.textanalysis(db, async, path, fs, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * getfileasstring: fullname
 * gibt filestring zurück in ret!
 */
app.get('/getfileasstring', function (req, res) {
    if (checkSession(req, res)) return;
    var rootdir = path.dirname(require.main.filename);
    var fullname = "";
    if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
        fullname = req.query.fullname;
    }
    if (!fs.existsSync(fullname)) {
        fullname = path.join(__dirname, fullname);
        if (!fs.existsSync(fullname)) {
            res.end(JSON.stringify({
                error: true,
                message: "Datei nicht vorhanden"
            }));
            return;
        }
    }
    fs.readFile(fullname, 'utf8', function (err, data) {
        if (err !== null) {
            res.writeHead(200, {
                'Content-Type': 'application/text',
                "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({
                error: true,
                message: err.message
            }));
            return;
        } else {
            res.end(JSON.stringify({
                error: false,
                message: "Datei geladen:" + data.length,
                filestring: data
            }));
            return;
        }
    });
});

/**
 * /upload für CKEditor
 */
app.post("/upload", function (req, res) {
    var dest, fileName, fs, l, tmpPath;
    fs = require('fs');
    tmpPath = req.files.upload.path;
    l = tmpPath.split('/').length;
    fileName = tmpPath.split('/')[l - 1] + "_" + req.files.upload.name;
    dest = __dirname + "/public/uploads/" + fileName;
    fs.readFile(req.files.upload.path, function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        fs.writeFile(dest, data, function (err) {
            var html;
            if (err) {
                console.log(err);
                return;
            }
            html = "";
            html += "<script type='text/javascript'>";
            html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
            html += "    var url     = \"/uploads/" + fileName + "\";";
            html += "    var message = \"Uploaded file successfully\";";
            html += "";
            html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
            html += "</script>";
            res.send(html);
        });
    });
});





/**
 * getallrecords - generische Funktion wird  umgelenkt auf getallsqlrecords
 */
app.get('/getallrecords', function (req, res) {
    if (checkSession(req, res)) return;
    var timeout = 10 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootdir = path.dirname(require.main.filename);
    sys0000sys.getallsqlrecords(db, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * getallsqlrecords - generische Funktion
 */
app.get('/getallsqlrecords', function (req, res) {
    if (checkSession(req, res)) return;
    var timeout = 70 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    sys0000sys.getallsqlrecords(db, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});

/**
 * getonerecord - generische Funktion wird  umgelenkt auf getallsqlrecords
 * und entsprechend angepasst
 */
app.get('/getonerecord', function (req, res) {
    if (checkSession(req, res)) return;
    sys0000sys.getonerecord(db, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});

/**
 * setonerecord - API wie bei MongoDB, interne Umsetzung sqlite3
 * komfortabel mit SELECT, CREATE TABLE, INSERT oder UPDATE
 */
app.post('/setonerecord', function (req, res) {
    if (checkSession(req, res)) return;
    sys0000sys.setonerecord(db, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});

/**
 * delonerecord - API wie bei MongoDB, interne Umsetzung sqlite3
 * für DELETE FROM ... in SQL
 */
app.post('/delonerecord', function (req, res) {
    if (checkSession(req, res)) return;
    sys0000sys.delonerecord(db, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * getmoredata - spezielle Funktion, TEMPORARY für stationids, dann Zugriff
 * crtsql: crtsql,
 * selstations: selstations,
 * sqlStmt: sqlStmt
 */
app.post('/getmoredata', function (req, res) {
    if (checkSession(req, res)) return;
    var timeout = 70 * 60 * 1000; // hier: gesetzter Default
    if (req.body && typeof req.body.timeout !== "undefined" && req.body.timeout.length > 0) {
        timeout = req.body.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var crtsql = "";
    if (req.body && typeof req.body.crtsql !== "undefined" && req.body.crtsql.length > 0) {
        crtsql = req.body.crtsql;
    }
    var selstations = [];
    if (req.body && typeof req.body.selstations !== "undefined" && req.body.selstations.length > 0) {
        selstations = req.body.selstations;
    }
    var temptable = "";
    if (req.body && typeof req.body.temptable !== "undefined" && req.body.temptable.length > 0) {
        temptable = req.body.temptable;
    }
    var sqlStmt = "";
    if (req.body && typeof req.body.sqlStmt !== "undefined" && req.body.sqlStmt.length > 0) {
        sqlStmt = req.body.sqlStmt;
    }
    async.waterfall([
        function (cbmd1) {
            /**
             * CREATE TEMPORARY TABLE
             */
            db.serialize(function () {
                db.run(crtsql, function (err) {
                    var ret = {};
                    if (err) {
                        ret.error = true;
                        ret.message = crtsql + " " + err;
                        cbmd1("error", ret);
                        return;
                    } else {
                        ret.error = false;
                        ret.message = crtsql + "  ausgeführt";
                        cbmd1(null, ret);
                        return;
                    }
                });
            });
        },
        function (ret, cbmd2) {
            async.eachSeries(selstations, function (newstation, nextstation) {
                var newsource = newstation.source;
                var newstationid = newstation.stationid;
                var newvariable = newstation.variable;
                var reqparm = {};
                reqparm.selfields = {};
                reqparm.selfields.source = newsource;
                reqparm.selfields.stationid = newstationid;
                reqparm.selfields.variable = newvariable;
                reqparm.updfields = {};
                reqparm.updfields["$setOnInsert"] = {};
                reqparm.updfields["$setOnInsert"].source = newsource;
                reqparm.updfields["$setOnInsert"].stationid = newstationid;
                reqparm.updfields["$setOnInsert"].variable = newvariable;
                reqparm.updfields["$set"] = {};
                reqparm.table = temptable;
                sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret) {
                    //console.log("setonerecord-returned:" + JSON.stringify(ret));
                    nextstation(); // holt den nächsten Satz
                    return;
                });
            }, function (err) {
                cbmd2(null, ret);
                return;
            });
        },
        function (ret, cbmd3) {
            var reqparm = {};
            reqparm.sel = sqlStmt;
            reqparm.limit = 0;
            reqparm.offset = 0;
            sys0000sys.getallsqlrecords(db, async, null, reqparm, res, function (res, ret) {
                // in ret liegen error, message und record
                cbmd3("Finish", ret);
                return;
            });
        }
    ], function (error, result) {
        var smsg = JSON.stringify(result);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });

});



/**
 * loadwasserstand - HYGRIS Wasserstand nach KLIDATA
 * und NRWSTATIONS nach KLISTATIONS
 * https://www.opengeodata.nrw.de/produkte/umwelt_klima/wasser/hygrisc/
 */
app.get('/loadwasserstand', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 10 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootname = __dirname;
    kla1490srv.loadwasserstand(gblInfo, db, fs, path, rootname, async, stream, csv, readline, sys0000sys, kla9020fun, req, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});



/**
 * loadnao - North Atlantic Oscillation
 * https://crudata.uea.ac.uk/cru/data/nao/
 */
app.get('/loadnao', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 10 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootname = __dirname;
    kla1490srv.loadnao(gblInfo, db, fs, path, rootname, async, stream, csv, readline, sys0000sys, kla9020fun, req, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});










/**
 * ghcndcomplete- ghcnd-stations.txt und unterunterverzeichnis mit den Dateien dazu
 */
app.get('/ghcndcomplete', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 10 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootname = __dirname;
    kla1490srv.ghcndcomplete(gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * ghcndinventory - ghcnd-inventory.txt Randdaten zu Stations und Variablen
 */
app.get('/ghcndinventory', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 10 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootname = __dirname;
    kla1490srv.ghcndinventory(gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});




/**
 * ghcndall - für alle stationid's aus KLISTATIONS die Daten auflösen
 */
app.get('/ghcndall', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 20 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootname = __dirname;
    kla1490srv.ghcndall(gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = "";
        try {
            smsg = JSON.stringify(ret);
        } catch (err) {
            console.log(err);
            console.log(err.stack);
            var keys = Object.keys(ret);
            var newret = {};
            newret.message = "";
            for (var ikey = 0; ikey < keys.length; ikey++) {
                if (typeof ret[keys[ikey]] === "undefined") {

                } else if (typeof ret[keys[ikey]] !== "object") {
                    newret[keys[ikey]] = ret[keys[ikey]];
                } else if (ret[keys[ikey]] === null) {
                    newret[keys[ikey]] = null;
                } else {
                    // kann kritisches Objekt sein
                    newret[keys[ikey]] = null;
                    newret.message += " Object:" + keys[ikey] + " evtl. rekursiv";
                    newret.error = true;
                }
            }
            console.log(JSON.stringify(newret));
            smsg = JSON.stringify(newret);
        }

        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * ghcnddata - ghcnd *.dly Dateien aus dem Unterverzeichnis laden
 */
app.get('/ghcnddata', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 10 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootname = __dirname;
    kla1490srv.ghcnddata(gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});

/**
 * ghcndonline - Online-Update GHCND mit stationid und variable
 */
app.get('/ghcndonline', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 10 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootname = __dirname;
    kla1490srv.ghcndonline(gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});




/**
 * transhyde - HYDE-Daten in JSON aufbereiten (*.txt-Files)
 */
app.get('/transhyde', function (req, res) {
    if (checkSession(req, res)) return;
    var timeout = 100 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootdir = __dirname;
    sys0000sys.transhyde(rootdir, fs, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * stationhyde - HYDE-Daten in JSON aufbereiten (*.txt-Files)
 * geplant: KLIHYDE als Tabelle dazu
 */
app.get('/stationhyde', function (req, res) {
    if (checkSession(req, res)) return;
    var timeout = 100 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootdir = __dirname;
    var source = "";
    if (req.query && typeof req.query.source !== "undefined" && req.query.source.length > 0) {
        source = req.query.source;
    }
    var stationid = "";
    if (req.query && typeof req.query.stationid !== "undefined" && req.query.stationid.length > 0) {
        stationid = req.query.stationid;
    }
    var selvars = "";
    if (req.query && typeof req.query.selvars !== "undefined" && req.query.selvars.length > 0) {
        selvars = req.query.selvars;
    }
    if (source.length === 0) {
        source = "HYDE";
    }
    var ret = {};
    async.waterfall([
            function (cbsh1) {
                /**
                 * Prüfung, ob Vorhanden mit source gemäß KLISTATIONS
                 */
                var reqparm = {
                    sel: {
                        source: source,
                        stationid: stationid
                    },
                    projection: {},
                    table: "KLIHYDE"
                };
                sys0000sys.getonerecord(db, async, null, reqparm, res, function (res, ret1) {
                    if (ret1.error === true) {
                        ret.message = ret1.message;
                        ret.error = ret1.error;
                        cbsh1("Error", res, ret);
                        return;
                    }
                    if (ret1.error === false && typeof ret1.record !== "undefined" && ret1.record !== null) {
                        ret.message = ret1.message;
                        ret.error = false;
                        ret.klihyde = ret1.record;
                        cbsh1("Finish", res, ret);
                        return;
                    } else {
                        ret.message = ret1.message;
                        ret.error = true;
                        cbsh1(null, res, ret);
                        return;
                    }

                });
            },
            function (res, ret, cbsh1a) {
                /**
                 * Prüfung, ob Vorhanden mit alter source mit HYDE und Umsetzung, wenn erforderlich
                 * vorher Aussprung, wenn der korrekte Satz bereits gefunden wurde!
                 */
                var reqparm = {
                    sel: {
                        source: "HYDE",
                        stationid: stationid
                    },
                    projection: {},
                    table: "KLIHYDE"
                };
                sys0000sys.getonerecord(db, async, null, reqparm, res, function (res, ret1) {
                    if (ret1.error === true) {
                        ret.message = ret1.message;
                        ret.error = ret1.error;
                        cbsh1a("Error", res, ret);
                        return;
                    }
                    if (ret1.error === false && typeof ret1.record !== "undefined" && ret1.record !== null) {
                        ret.message = ret1.message;
                        ret.error = false;
                        ret.operation = "change";
                        ret.klihyde = ret1.record;
                        cbsh1a(null, res, ret);
                        return;
                    } else {
                        ret.message = ret1.message;
                        ret.error = true;
                        ret.operation = "load";
                        cbsh1a(null, res, ret);
                        return;
                    }
                });
            },

            function (res, ret, cbsh1b) {
                /**
                 * Update source in KLIHYDE und Rückgabe ret wie übernommen
                 */
                if (ret.operation !== "change") {
                    cbsh1b(null, res, ret);
                    return;
                }

                var reqparm = {};
                reqparm.selfields = {
                    source: "HYDE",
                    stationid: stationid
                };
                reqparm.updfields = {};
                reqparm.updfields["$setOnInsert"] = {};
                reqparm.updfields["$set"] = {};
                reqparm.updfields["$set"].source = source;
                reqparm.table = "KLIHYDE";
                sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                    if (ret1.error === true) {
                        ret.message = ret1.message;
                        ret.error = ret1.error;
                        cbsh1b("Error", res, ret);
                        return;
                    }
                    if (ret1.error === false && typeof ret1.record !== "undefined" && ret1.record !== null) {
                        ret.message = ret1.message;
                        ret.error = false;
                        ret.klihyde = ret1.record;
                        cbsh1b("Finish", res, ret);
                        return;
                    } else {
                        ret.message = ret1.message;
                        ret.error = true;
                        cbsh1b("Error", res, ret);
                        return;
                    }
                });
            },
            function (res, ret, cbsh2) {
                /**
                 * TODO: reqparm sollte hier besser sein!!!
                 * speziell weil der API umgestellt wurde für "allin"
                 */
                sys0000sys.stationhyde(db, rootdir, fs, async, req, null, res, function (res, ret) {
                    // in ret liegen error, message und record
                    cbsh2("Finish", res, ret);
                    return;
                });
            }
        ],
        function (error, res, ret) {
            var smsg = JSON.stringify(ret);
            res.writeHead(200, {
                'Content-Type': 'application/text',
                "Access-Control-Allow-Origin": "*"
            });
            res.end(smsg);
            return;
        }
    );
});




/**
 * getp2kfiles - Alle Dateien zu pages2k Verzeichnis holen, download, fortschreiben
 * Parameter ist fullname als directory und lisd
 * Rückgabe ret.data als Array
 */
app.post('/getp2kfiles', function (req, res) {
    if (checkSession(req, res)) return;
    var rootdir = path.dirname(require.main.filename);
    kla1490srv.getp2kfiles(db, rootdir, fs, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});



/**
 * getp2kfile - Datei lesen und Daten als Array bereitstellen
 * Parameter sind url, predirectory, directory, filename
 * Rückgabe ret.data als Array
 */
app.get('/getp2kfile', function (req, res) {
    if (checkSession(req, res)) return;
    var rootdir = path.dirname(require.main.filename);
    kla1490srv.getp2kfile(db, rootdir, fs, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});



/**
 * gethtmllinks url aufrufen und links extrahieren
 * Übergabe in ret.linkliste als array
 */
app.get('/gethtmllinks', function (req, res) {
    if (checkSession(req, res)) return;
    sys0000sys.gethtmllinks(db, async, uihelper, req, res, function (res, ret) {
        // in ret liegen error, message und linkliste
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});

/**
 * geturllinksfiles - Dateien aus url mit link holen
 * und in Zielverzeichnis schreiben
 */
app.post('/geturllinksfiles', function (req, res) {
    if (checkSession(req, res)) return;
    sys0000sys.geturllinksfiles(gblInfo, db, async, uihelper, req, res, function (res, ret) {
        // in ret liegen error, message und linkliste
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});




/**
 * updatecontinent - value zu continent in KLISTATIONS neu zuordnen
 */
app.get('/updatecontinent', function (req, res) {
    if (checkSession(req, res)) return;
    var timeout = 100 * 60 * 1000; // hier: gesetzter Default
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootdir = __dirname;
    sys0000sys.updatecontinent(db, rootdir, fs, async, req, null, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});






/**
 * batchreg - Regressionsanalyse im Batch mit Filter auf die Stations, wie vorgegeben
 * in starecord
 */
app.get('/batchreg', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 10 * 60 * 1000; // hier: gesetzter Default, kann sehr lange dauern, je nach Filtert
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootname = __dirname;
    kla1490srv.batchreg(gblInfo, db, async, regression, sys0000sys, uihelper, req, res, function (res, ret) {
        // in ret liegen error, message und record
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});



/**
 * loadcsvdata csv-Datei nach MongoDB laden gemäß Vorgabe
 * fullname, filetype, targettable
 */
app.post('/loadcsvdata', function (req, res) {
    if (checkSession(req, res)) return;

    var fullname = "";
    if (req.body && typeof req.body.fullname !== "undefined" && req.body.fullname.length > 0) {
        fullname = req.body.fullname;
    }

    var filetype = "";
    if (req.body && typeof req.body.filetype !== "undefined" && req.body.filetype.length > 0) {
        filetype = req.body.filetype;
    }

    var separator = "";
    if (req.body && typeof req.body.separator !== "undefined" && req.body.separator.length > 0) {
        separator = req.body.separator;
        if (separator === "Tab") separator = "\t";
    }

    var targettable = "";
    if (req.body && typeof req.body.targettable !== "undefined" && req.body.targettable.length > 0) {
        targettable = req.body.targettable;
    }

    var primarykey = "";
    if (req.body && typeof req.body.primarykey !== "undefined" && req.body.primarykey.length > 0) {
        primarykey = req.body.primarykey;
    }

    //var dir = gblInfo.gblUpdatePath;
    var dir = fullname;

    console.log("loadcsvdata:" + dir);
    if (!fs.existsSync(dir)) {
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify({
            error: true,
            message: "Datei nicht gefunden:" + dir
        }));
        return;
    }
    var counter = 0;
    if (filetype === "special") {

        var readInterface = readline.createInterface({
            input: fs.createReadStream(fullname),
            console: false
        });
        readInterface.on('line', function (line) {
            counter++;
            /*
            Region Label and Number Coordinates (Latitude [°], Longitude [°]) of Region Corners
            ALA 1 (60.000N, 105.000W) (60.000N, 168.022W) (72.554N, 168.022W) (72.554N, 105.000W)
            */
            var record = {
                ipcczone: "",
                label: "",
                coordinates: ""
            };
            var wrkline = line;
            var idis = 0;
            idis = wrkline.indexOf(" ");
            if (idis > 0) {
                record.ipcczone = wrkline.substr(0, idis);
                wrkline = wrkline.substr(idis);
            }
            idis = wrkline.indexOf(" ");
            if (idis > 0) {
                record.label = wrkline.substr(0, idis);
                wrkline = wrkline.substr(idis);
            }
            // jetzt noch die Koordinaten
            return true;
        });
        readInterface.on('close', function (err) {
            console.log(">>>done readInterface<<<");
            var ret = {};
            ret.error = false;
            ret.message = "Importiert " + counter + " records from " + fullname;
            ret.filename = dir;
            ret.counter = counter;
            res.writeHead(200, {
                'Content-Type': 'application/text',
                "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify(ret));
            return;
        });
    } else if (filetype === "csv mit Header") {
        var fileschema = "";
        var fieldarray = [];
        try {
            fs.createReadStream(dir)
                /*
                .pipe(iconv.decodeStream('iso-8859-15'))
                .pipe(iconv.encodeStream('utf8'))
                */
                .pipe(csv.parse({
                    headers: true,
                    delimiter: separator,
                    /* '\t',  */
                    ignoreEmpty: true
                }))
                .on("data", function (data) {
                    var that = this;
                    that.pause();
                    // data ist ein array der Felder, hier kein Header!!!
                    counter++;
                    var record = uihelper.cloneObject(data);
                    var reqparm = {};
                    reqparm.selfields = {};
                    reqparm.selfields[primarykey] = record[primarykey];

                    reqparm.updfields = {};
                    reqparm.updfields["$setOnInsert"] = {};
                    reqparm.updfields["$setOnInsert"][primarykey] = record[primarykey];

                    delete record[primarykey];
                    reqparm.updfields["$set"] = record;
                    reqparm.table = targettable;
                    sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret) {
                        //console.log("setonerecord-returned:" + JSON.stringify(ret));
                        that.resume(); // holt den nächsten Satz, auch aus waterfall
                    });
                })
                .on("end", function () {
                    console.log(">>>done Stream<<<");
                    var ret = {};
                    ret.error = false;
                    ret.message = "Importiert";
                    ret.filename = dir;
                    ret.counter = counter;
                    res.writeHead(200, {
                        'Content-Type': 'application/text',
                        "Access-Control-Allow-Origin": "*"
                    });
                    res.end(JSON.stringify(ret));
                    return;
                });
        } catch (err) {
            res.writeHead(200, {
                'Content-Type': 'application/text',
                "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({
                error: true,
                message: "Error:" + dir + " " + err
            }));
            return;
        }
    }
});

/**
 * dropcolumn3 - SQLite3 ALTER TABLE DROP COLUMN - Ersatzlösung
 */
app.get('/dropcolumn3', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 10 * 60 * 1000; // hier: gesetzter Default, kann sehr lange dauern, je nach Filtert
    if (req.query && typeof req.query.timeout !== "undefined" && req.query.timeout.length > 0) {
        timeout = req.query.timeout;
        req.setTimeout(parseInt(timeout));
    }

    var tablename = "";
    if (req.query && typeof req.query.tablename !== "undefined" && req.query.tablename.length > 0) {
        tablename = req.query.tablename;
    }

    var columnnames = "";
    if (req.query && typeof req.query.columnnames !== "undefined" && req.query.columnnames.length > 0) {
        columnnames = req.query.columnnames;
    }

    var keys = "";
    if (req.query && typeof req.query.keys !== "undefined" && req.query.keys.length > 0) {
        keys = req.query.keys;
    }

    async.waterfall([
            function (callback77) {
                var ret = {};
                ret.oldtablename = tablename;
                ret.newtablename = tablename + "NEW";
                ret.columnnames = columnnames.split(",");
                ret.keys = keys.split(",");
                callback77(null, res, ret);
                return;
            },
            function (res, ret, callback77a1) {
                // erst mal die Satzbeschreibung holen
                db.all("PRAGMA table_info('" + ret.oldtablename + "')", function (err, felder) {
                    if (typeof felder === "undefined" || felder === null || felder.length === 0) {
                        console.log(ret.oldtablename + "Tabelle nicht vorhanden");
                        ret.error = true;
                        ret.message = err;
                        callback77a1("Error", res, ret);
                        return;
                    } else {
                        for (var ifeld = 0; ifeld < felder.length; ifeld++) {
                            console.log(JSON.stringify(felder[ifeld], null, ""));
                        }
                        ret.felder = felder; // name, type TEXT, FLOAT
                        callback77a1(null, res, ret);
                        return;
                    }
                });
            },
            function (res, ret, callback77a) {
                var reqparm = {};
                reqparm.sel = "SELECT * FROM " + ret.oldtablename;
                reqparm.sel += " ORDER BY " + ret.keys.join(",");
                reqparm.limit = 1;
                reqparm.offset = 0;
                sys0000sys.getallsqlrecords(db, async, null, reqparm, res, function (res, ret1) {
                    // jetzt mit dem EINEN Satz den setonerecord vorbereiten durchführen
                    if (ret1.error === true) {
                        callback77a("Error", res, ret1);
                        return;
                    }
                    if (ret1.records.length !== 1) {
                        callback77a("Error", res, {
                            error: true,
                            message: "nicht genau 1 Satz gefunden"
                        });
                        return;
                    }
                    ret.record = ret1.records[0];
                    // den Record aufpimpen für den speziellen Fall
                    var ipimp = 0;
                    for (var ifld = 0; ifld < ret.felder.length; ifld++) {
                        var feldname = ret.felder[ifld].name;
                        var feldtype = ret.felder[ifld].type;
                        if (typeof ret.record[feldname] === "undefined" || ret.record[feldname] === null) {
                            if (feldtype === "FLOAT") {
                                ret.record[feldname] = 1;
                                ipimp++;
                            } else {
                                ret.record[feldname] = "A";
                                ipimp++;
                            }
                        } else if (feldtype === "TEXT" && ret.record[feldname].length === 0) {
                            ret.record[feldname] = "A";
                            ipimp++;
                        }
                    }
                    console.log("dropcolumn3: 1 Satz gefunden, pimped:" + ipimp + " von " + Object.keys(ret.record).length);
                    callback77a(null, res, ret);
                    return;
                });
            },
            function (res, ret, callback77b1) {
                // Löschen evtl. schon vorhandene, neue Tabelle
                var dropStmt = "DROP TABLE IF EXISTS " + ret.newtablename;
                db.run(dropStmt, function (err) {
                    callback77b1(null, res, ret);
                    return;
                });
            },
            function (res, ret, callback77b) {
                // jetzt setonerecord, um die neue Tabelle anzulegen
                var record = ret.record;
                // Löschen der Felder, die wegfallen sollen
                for (var idrop = 0; idrop < ret.columnnames.length; idrop++) {
                    delete record[ret.columnnames[idrop]];
                }
                ret.record = record;
                // jetzt anlegen der neuen Tabelle mit dem geänderten Satz mit setonerecord
                var reqparm = {};
                reqparm.tablename = ret.newtablename;
                reqparm.table = ret.newtablename;
                reqparm.selfields = {};
                reqparm.updfields = {};
                for (var ikey = 0; ikey < ret.keys.length; ikey++) {
                    reqparm.selfields[ret.keys[ikey]] = record[ret.keys[ikey]];
                }
                reqparm.updfields = {};
                reqparm.updfields.$setOnInsert = reqparm.selfields;
                reqparm.updfields.$set = {};
                for (var ikey = 0; ikey < ret.keys.length; ikey++) {
                    delete record[ret.keys[ikey]];
                }
                reqparm.updfields.$set = record; // record hat keine key-Felder und keine drop-Felder mehr
                ret.reqparm = reqparm;
                sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                    if (ret1.error === true) {
                        callback77b("Error", res, ret1);
                        return;
                    } else {
                        console.log("dropcolumn3: neue Tabelle mit 1 Satz angelegt");
                        callback77b(null, res, ret);
                        return;
                    }
                });
            },
            function (res, ret, callback77c) {
                var delStmt = "DELETE FROM " + ret.newtablename;
                delStmt += " WHERE ";
                var sel = ret.reqparm.selfields;
                for (var ikey = 0; ikey < ret.keys.length; ikey++) {
                    if (ikey > 0) delStmt += " AND ";
                    if (typeof sel[ret.keys[ikey]] === "string") {
                        delStmt += " " + ret.keys[ikey] + " = '" + sel[ret.keys[ikey]] + "'";
                    } else {
                        delStmt += " " + ret.keys[ikey] + " = " + sel[ret.keys[ikey]];
                    }
                }
                db.run(delStmt, function (err) {
                    console.log("dropcolumn3: deleted:" + this.changes);
                    callback77c(null, res, ret);
                    return;
                });
            },
            function (res, ret, callback77d) {
                // jetzt bulk-insert
                var rkeys = Object.keys(ret.record);
                var skeys = ret.keys;
                // rkeys.unshift(skeys); - Funktioniert nicht korrekt, das Array skeys wird erstes Element, nicht die Elemente von skeys
                for (var ikey = skeys.length - 1; ikey >= 0; ikey--) {
                    var newkey = skeys[ikey];
                    rkeys.unshift(newkey);
                }
                // entfernen der unerwünschten Felder
                var ckeys = ret.columnnames;
                for (var ikey = ckeys.length - 1; ikey >= 0; ikey--) {
                    for (var irkey = 0; irkey < rkeys.length; irkey++) {
                        if (ckeys[ikey] === rkeys[irkey]) {
                            rkeys.splice(irkey, 1);
                        }
                    }
                }
                // Liste aus ret.felder aufbauen
                var liste = rkeys.join(",");
                var sqlStmt = "INSERT INTO " + ret.newtablename;
                sqlStmt += " (" + liste + ")";
                sqlStmt += " SELECT " + liste;
                sqlStmt += " FROM " + ret.oldtablename;
                console.log(sqlStmt);
                db.run(sqlStmt, function (err) {
                    console.log("dropcolumn3: inserted:" + this.changes);
                    callback77d(null, res, ret);
                    return;
                });
            },
            function (res, ret, callback77e) {
                // sichern alte indices - https://www.sqlite.org/pragma.html#pragma_index_info
                // direkt als Statements für den Wiederaufbau
                // CREATE INDEX IF NOT EXISTS ind1_KLISTATIONS ON KLISTATIONS(tsserverrupd)
                db.get("PRAGMA index_list('" + ret.oldtablename + "')", function (err, indexlist) {
                    var newindexarray = [];
                    var indexnr = 0;
                    console.log("index_list " + ret.oldtablename + ":" + JSON.stringify(indexlist) + " " + err);
                    if (typeof indexlist === "object") {
                        var indexname = indexlist.name;
                        db.all("PRAGMA index_info('" + indexname + "')", function (err, indexfields) {
                            console.log("index_info " + indexname + ":" + JSON.stringify(indexfields) + " " + err);
                            // [{"seqno":0,"cid":0,"name":"source"}, . . .]
                            var crtStmt = "CREATE INDEX IF NOT EXISTS ";
                            indexnr++;
                            var liste = "";
                            for (var ifld = 0; ifld < indexfields.length; ifld++) {
                                if (liste.length > 0) liste += ", ";
                                liste += indexfields[ifld].name;
                            }
                            crtStmt += " ind" + indexnr + "_" + ret.oldtablename + " ON " + ret.oldtablename;
                            crtStmt += "(" + liste + ")";
                            newindexarray.push(crtStmt);
                            ret.newindexarray = newindexarray;
                            console.log("dropcolumn3:" + crtStmt);
                            callback77e(null, res, ret);
                            return;
                        });
                    } else {
                        // for (var i2 = 0; i2 < indexlist.length; i2++) {
                        async.eachSeries(indexlist, function (index, nextindex) {
                            var indexname = index.name;
                            db.get("PRAGMA index_info('" + indexname + "')", function (err, indexfields) {
                                    console.log("index_info KLIDATA:" + JSON.stringify(indexfields) + " " + err);
                                    var crtStmt = "CREATE INDEX IF NOT EXISTS ";
                                    indexnr++;
                                    var liste = "";
                                    for (var ifld = 0; ifld < indexfields.length; ifld++) {
                                        if (liste.length > 0) liste += ", ";
                                        liste += indexfields[ifld].name;
                                    }
                                    crtStmt += " " + indexname + " ON " + ret.oldtablename;
                                    crtStmt += "(" + liste + ")";
                                    newindexarray.push(crtStmt);
                                    nextindex();
                                    return;
                                },
                                function (error) {
                                    ret.newindexarray = newindexarray;
                                    console.log("dropcolumn3:" + JSON.stringify(newindexarray));
                                    callback77e(null, res, ret);
                                    return;
                                });
                        });
                        //}
                    }
                });
            },
            function (res, ret, callback77f) {
                // alte Tabelle Löschen
                var dropStmt = "DROP TABLE " + ret.oldtablename;
                db.run(dropStmt, function (err) {
                    console.log("dropcolumn3:" + dropStmt + "=>" + err);
                    callback77f(null, res, ret);
                    return;
                });
            },
            function (res, ret, callback77g) {
                // Umbenennen newtablename nach oldtablename
                // ALTER TABLE new_table RENAME TO table;
                var renStmt = "ALTER TABLE " + ret.newtablename + " RENAME TO " + ret.oldtablename;
                db.run(renStmt, function (err) {
                    console.log("dropcolumn3:" + renStmt + "=>" + err);
                    callback77g(null, res, ret);
                    return;
                });
            },
            function (res, ret, callback77h) {
                // Löschen evtl. schon vorhandene, neue Tabelle
                var dropStmt = "DROP TABLE IF EXISTS " + ret.newtablename;
                db.run(dropStmt, function (err) {
                    callback77h(null, res, ret);
                    return;
                });
            },
            function (res, ret, callback77i) {
                // neue Indices anlegen aus ret.newindexarray auf oldtablename
                async.eachSeries(ret.newindexarray, function (newindex, nextcrtindex) {
                        db.run(newindex, function (err) {
                            console.log("dropcolumn3:" + newindex + "=>" + err);
                            nextcrtindex();
                            return;
                        });
                    },
                    function (error) {
                        callback77i("Finish", res, ret);
                        return;
                    });
            }
        ],
        function (err, res, ret) {
            // hier die Antwort an den Client
            res.writeHead(200, {
                'Content-Type': 'application/text',
                "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({
                error: false,
                message: ret.message + " " + err
            }));
            return;
        });
});


/**
 * Download large String from Browser als File to Browsder
 */
app.post('/getbackasfile', function (req, res) {
    var largestring = req.body.largestring;
    var filename = req.body.filename;
    var fullpath = "";
    var fpath = "";
    var targetpath = path.join(__dirname, "static");
    targetpath = path.join(targetpath, "temp");
    if (!fs.existsSync(targetpath)) {
        fs.mkdirSync(targetpath);
    }
    if (typeof filename === "object" && Array.isArray(filename)) {
        for (var ifilename = 0; ifilename < (filename.length - 1); ifilename++) {
            targetpath = path.join(targetpath, filename[ifilename]);
            if (!fs.existsSync(targetpath)) {
                fs.mkdirSync(targetpath);
            }
        }
        // jetzt der echte Dateiname
        fullpath = path.join(targetpath, filename[filename.length - 1]);
    } else {
        if (typeof filename === "undefined" || filename.length === 0) {
            filename = "download.html";
        }
        fullpath = path.join(targetpath, filename);
    }
    fpath = fullpath.substr(fullpath.indexOf("static") + 7);
    /*
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', 'text/plain');
    res.charset = 'UTF-8';
    res.write(largestring);
    res.end();
    */

    fs.writeFile(fullpath, largestring, {
        encoding: 'utf8',
        flag: 'w'
    }, function (err) {
        if (err) {
            var smsg = JSON.stringify({
                error: true,
                message: err.message || "Es ist ein Fehler im Server aufgetreten"
            });
            res.writeHead(200, {
                'Content-Type': 'application/text'
            });
            res.end(smsg);
            return;
        } else {
            var path = fpath;
            var ret = {
                error: false,
                message: "Datei zwischengespeichert",
                path: path
            };
            var smsg1 = JSON.stringify(ret);
            res.writeHead(200, {
                'Content-Type': 'application/text'
            });
            res.end(smsg1);
            return;
        }
    });
});




/**
 * sql2csv - Execute SQL Select and download csv-File
 */
app.post('/sql2csv', function (req, res) {
    if (checkSession(req, res)) return;

    var timeout = 10 * 60 * 1000; // hier: gesetzter Default, kann sehr lange dauern, je nach Filtert
    //req.body.filename;
    if (req.body && typeof req.body.timeout !== "undefined" && req.body.timeout.length > 0) {
        timeout = req.body.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var sqlstmt = "";
    if (req.body && typeof req.body.sqlstmt !== "undefined" && req.body.sqlstmt.length > 0) {
        sqlstmt = req.body.sqlstmt;
    }
    var limit = 1000;
    if (req.body && typeof req.body.limit !== "undefined" && req.body.limit.length > 0) {
        limit = req.body.limit;
    }
    var filename = "sql.csv";
    if (req.body && typeof req.body.filename !== "undefined" && req.body.filename.length > 0) {
        filename = req.body.filename;
    }

    var reqparm = {};
    reqparm.sel = sqlstmt;
    reqparm.limit = limit || 1000;
    reqparm.offset = 0;

    var fpath = "/temp/" + filename;
    var fullpath = __dirname + "/static" + fpath;
    var ws = fs.createWriteStream(fullpath);

    var csvStream = csvformat.format({
        headers: true
    });
    /*
    csvStream.pipe(ws).on('end', function() {
        var ret = {
            error: false,
            message: "Datei zwischengespeichert",
            path: fpath,
        };
        var smsg1 = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text'
        });
        res.end(smsg1);
        return;
    });
    */
    sys0000sys.getallsqlrecords(db, async, null, reqparm, res, function (res, ret1) {
        // getbackasfile
        csvStream.pipe(ws);
        for (var irec = 0; irec < ret1.records.length; irec++) {
            /*
            var vals = gravec.map(function (a) {
                return a.year;
            }),
            */
            var csvrecord = ret1.records[irec];
            csvStream.write(csvrecord);

            /*
            csv.
            write([csvrecord], {
                    headers: false
                })
                .pipe(ws);
            */

        }
        csvStream.end();
        var ret = {
            error: false,
            message: "Datei zwischengespeichert",
            path: fpath,
        };
        var smsg1 = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text'
        });
        res.end(smsg1);
        return;
        // res.download(fullpath, filename);

    });

});
/**
 * sql2eliminate - Doppelte Sätze beseitigen
 * der unique index wird später aufgebaut
 */
var icount = 0;
var gblcount = 0;
app.post('/sql2eliminate', function (req, res) {
    if (checkSession(req, res)) return;
    icount = 0;
    var timeout = 10 * 60 * 1000; // hier: gesetzter Default, kann sehr lange dauern, je nach Filtert
    //req.body.filename;
    if (req.body && typeof req.body.timeout !== "undefined" && req.body.timeout.length > 0) {
        timeout = req.body.timeout;
        req.setTimeout(parseInt(timeout));
    }
    var rootname = __dirname;
    sys0000sys.sql2eliminate(gblInfo, sqlite3, db, async, uihelper, req, res, function (res, ret) {
        // in ret liegen error und message
        var smsg = JSON.stringify(ret);
        res.writeHead(200, {
            'Content-Type': 'application/text',
            "Access-Control-Allow-Origin": "*"
        });
        res.end(smsg);
        return;
    });
});


/**
 * sql2eliminatechunk
 * @param {*} elimtable - Tablename
 * @param {*} elimrecords - Sätze des Chunks
 * @param {*} callbackeli10 - returns res, ret
 */
function sql2eliminatechunk(elimtable, elimrecords, callbackeli10) {
    /**
     * Loop über die Gruppen des Chunk
     */
    var rounds = 1; // Math.floor(elirecords.length / 100) + 1;
    var icount = 0;
    async.eachSeries(elimrecords, function (elirecord, nextrecord) {
            icount++;
            if (icount % 10 === 0) console.log(icount);
            sql2eliminateone(icount, elimtable, elirecord, function (ret) {
                console.log("nextrecord nach:" + icount);
                setImmediate(function () {
                    nextrecord();
                    return;
                });

            });
        },
        function (error) {
            console.log("fertig");
            var ret = {
                error: false,
                message: "Fertig"
            };
            callbackeli10(ret);
            return;
        });
} // Ende Loop über die Gruppen




/**
 * sql2eliminateone
 * @param {*} elimtable - Tablename
 * @param {*} elimrecord - Satz mit den Keys aus group by
 * @param {*} callbackeli0 - returns res, ret
 */
function sql2eliminateone(elimcount, elimtable, elimrecord, callbackeli0) {
    var ret = {
        error: false,
        message: "dummy"
    };
    db.serialize(function () {
        async.waterfall([
                function (cbeli1) {
                    var where = "";
                    var orderby = "";
                    var selfields = {};
                    var reqparm = {};
                    reqparm.sel = "SELECT * FROM " + elimtable;
                    for (var feld in elimrecord) {
                        if (elimrecord.hasOwnProperty(feld)) {
                            if (feld === "anzahl") {
                                continue;
                            }
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

                    reqparm.sel += " WHERE " + where;
                    reqparm.sel += " ORDER BY " + orderby;
                    reqparm.limit = 100;
                    reqparm.offset = 0;
                    var actcount = 0;
                    db.run("BEGIN TRANSACTION;");
                    db.all(reqparm.sel, function (err, elirows) {
                        db.run("COMMIT TRANSACTION;");
                        var ret = {};
                        if (err) {
                            ret.error = true;
                            ret.message = "getallsqlrecords-2:" + err + " " + reqparm.sel;
                            console.log(ret.message);
                            cbeli1("Error", ret);
                            return;
                        } else if (elirows.length === 0) {
                            ret.error = false;
                            ret.message = "getallsqlrecords-2:Keine Sätze zu " + reqparm.sel;
                            console.log(ret.message);
                            cbeli1("Error", ret);
                            return;
                        } else {
                            ret.error = false;
                            ret.message = "getallsqlrecords-5:" + " gefunden:" + elirows.length + " " + (gblcount + elimcount);
                            ret.records = elirows;
                            console.log(ret.message);
                            cbeli1("Test", ret);
                            return;
                        }
                    });
                }
            ],
            function (error, ret) {
                console.log("Callback:" + error);
                setImmediate(function () {
                    callbackeli0(ret);
                    return;
                });
            });
    });
}


/*
        async.eachSeries(ret1.records, function (record, nextrecord) {

                        function (res, ret, cbeli2) {
                            if (1 === 1) {
                                cbeli2(null, res, ret);
                                return;
                            }

                            var delStmt = "DELETE FROM " + ret.tablename;
                            delStmt += " WHERE " + ret.where;
                            db.serialize(function () {
                                db.run(delStmt, function (err) {
                                    if (err) {
                                        console.log("***Error:" + err);
                                    }
                                    console.log("sql2eliminate: deleted:" + this.changes);
                                    ret.deleted = this.changes;

                                });
                            });
                            cbeli2(null, res, ret);
                            return;
                        },
                        function (res, ret, cbeli3) {
                            if (1 === 1) {
                                cbeli3(null, res, ret);
                                return;
                            }

                            var reqparm = {};
                            var insrecord = uihelper.cloneObject(ret.duprecords[0]);
                            var reqparm = {};
                            reqparm.selfields = {};
                            reqparm.selfields = ret.selfields;

                            reqparm.updfields = {};
                            reqparm.updfields["$setOnInsert"] = {};
                            reqparm.updfields["$setOnInsert"] = ret.selfields;
                            reqparm.updfields["$set"] = insrecord;
                            for (var feld in ret.selfields) {
                                if (ret.selfields.hasOwnProperty(feld)) {
                                    delete reqparm.updfields["$set"][feld];
                                }
                            }
                            reqparm.table = ret.tablename;
                            sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret4) {
                                if (ret4.error === true) {
                                    console.log("***Error:" + ret4.message);
                                } else {
                                    console.log("***Inserted:" + 1);
                                }
                                ret.inserted = 1;
                                cbeli3(null, res, ret);
                                return;
                            });
                        },
                        function (res, ret, cbeli4) {
                            cbeli4("finish", res, ret);
                            return;
                        }
                    ],
                    function (error, result) {
                        nextrecord();
                    });

            },
            function (err) {
                csvStream.end();
                var ret = {
                    error: false,
                    message: "Datei zwischengespeichert",
                    path: fpath,
                };
                var smsg1 = JSON.stringify(ret);
                res.writeHead(200, {
                    'Content-Type': 'application/text'
                });
                res.end(smsg1);
                return;
            });
    });
    */






app.post("/saveBase64ToGif", function (req, res) {
    if (typeof req.body.imagedata === "undefined") {
        console.log("imagedata undefined");
        res.writeHead(200, {
            'Content-Type': 'application/text'
        });
        res.end(JSON.stringify({
            error: true,
            message: "imagedata undefined"
        }));
        return;
    }
    console.log("imagedata length:" + req.body.imagedata.length);

    var filename = req.body.filename;
    var fullpath = "";
    var fpath = "";
    var targetpath = path.join(__dirname, "static");
    targetpath = path.join(targetpath, "temp");
    if (!fs.existsSync(targetpath)) {
        fs.mkdirSync(targetpath);
    }
    if (typeof filename === "object" && Array.isArray(filename)) {
        for (var ifilename = 0; ifilename < (filename.length - 1); ifilename++) {
            targetpath = path.join(targetpath, filename[ifilename]);
            if (!fs.existsSync(targetpath)) {
                fs.mkdirSync(targetpath);
            }
        }
        // jetzt der echte Dateiname
        fullpath = path.join(targetpath, filename[filename.length - 1]);
    } else {
        if (typeof filename === "undefined" || filename.length === 0) {
            filename = "animated.gif";
        }
        fullpath = path.join(targetpath, filename);
    }
    fpath = fullpath.substr(fullpath.indexOf("static") + 7);

    // var base64Data = req.body.imagedata.replace(/^data:image\/jpeg;base64,/, "");
    var base64Data = req.body.imagedata;
    async.waterfall([
        function (callback) {
            var jahr = "" + new Date().getFullYear();
            ba64.writeImage(fullpath, base64Data, function (err) {
                res.writeHead(200, {
                    'Content-Type': 'application/text'
                });
                res.end(JSON.stringify({
                    error: false,
                    message: fpath + " bereitgestellt",
                    filename: filename,
                    fullfilename: fullpath
                }));
                return;
            });
        }
    ]);
});

app.get("/generate", function (req, res) {
    if (req.query && typeof req.query.contentpath !== "undefined" && req.query.contentpath.length > 0) {}
    /**
     * template lesen in den Speicher als string
     * Struktur lesen aus KLICONFIG mit CONTREE
     * Sätze in KLICONTFILES lesen - alle
     *      jeweils template aufbereiten mit den Platzhaltern nach Ausgabestring
     *      zusätzlich die Strukturverweise ausgeben
     * Ausgabestring in Zieldatei schreiben
     */
    var rootdir = path.dirname(require.main.filename);
    var contentpath = path.join(rootdir, "static", "content");
    var contentimagespath = path.join(contentpath, "images");
    var templatepath = path.join(rootdir, "static", "template.html");
    var template = fs.readFileSync(templatepath, "utf8");

    async.waterfall([
            function (cbgen1) {
                var reqparm = {
                    sel: {
                        configname: "CONTREE"
                    },
                    projection: {},
                    table: "KLICONFIG"
                };
                sys0000sys.getonerecord(db, async, null, reqparm, res, function (res, ret1) {
                    var ret = {};
                    if (ret1.error === true) {
                        ret.message = ret1.message;
                        ret.error = ret1.error;
                        cbgen1("Error", res, ret);
                        return;
                    }
                    if (ret1.error === false && typeof ret1.record !== "undefined" && ret1.record !== null) {
                        ret.message = "Tree gefunden";
                        ret.error = false;
                        ret.tree = JSON.parse(ret1.record.jsonString);
                    } else {
                        ret.message = "Tree nicht gefunden";
                        ret.error = false;
                        ret.tree = {};
                    }
                    cbgen1(null, res, ret);
                    return;
                });
            },
            function (res, ret, cbgen2) {
                var reqparm = {};
                reqparm.table = "KLICONTFILES";
                reqparm.sel = {};
                reqparm.projection = {};
                sys0000sys.getallrecords(db, async, null, reqparm, res, function (res, ret1) {
                    if (ret1.error === true) {
                        ret.message += " keine KLICONTFILES:" + ret1.error;
                    } else {
                        if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                            for (var recordind = 0; recordind < ret1.records.length; recordind++) {
                                var record = ret1.records[recordind];
                                /**
                                 * Holen der Verweise
                                 * home, top, prev, next
                                 */
                                var res1 = {
                                    anchor: record.filename,
                                    ready: false
                                };
                                // res1 = iterategtree (ret.tree, res1);
                                // Suchbegriff, Tree, Parent mit init null
                                var targetnode = findNode(record.filename, ret.tree[0], null);
                                console.log(record.filename + "=>" + targetnode.currentNode.li_attr.filename || "MIST");
                                // Generierung der Verweise
                                var refhtml1 = createRefHtml(targetnode, record.filename);
                                var footerlinks = createFooterLinks(targetnode, record.filename);
                                var newtemplate = template;
                                newtemplate = newtemplate.replace("&header&", record.title);
                                newtemplate = newtemplate.replace("&content&", record.content);
                                newtemplate = newtemplate.replace("&footerlinkstring&", JSON.stringify(footerlinks));
                                var fullname = path.join(contentpath, record.filename);
                                fs.writeFileSync(fullname, newtemplate);
                                console.log("html-Transfer:" + record.filename);
                                // Loop für die Images
                                var imgarray = JSON.parse(record.imgsrcs);
                                for (var iimg = 0; iimg < imgarray.length; iimg++) {
                                    // physical image source file
                                    var imgsourcefile = path.join(rootdir, "static", imgarray[iimg]);
                                    // physical image destination file and check/make Destination-Subdirectories
                                    var imgdestinationfile = path.join(rootdir, "static", "content", imgarray[iimg]);
                                    var imgdirs = imgdestinationfile.split(path.sep);
                                    var checkdir = imgdirs[0];
                                    // Subdirectories ohne die Datei selbst
                                    for (var iimgdirs = 1; iimgdirs < imgdirs.length - 1; iimgdirs++) {
                                        checkdir = path.join(checkdir, imgdirs[iimgdirs]);
                                        if (checkdir.indexOf("content") > 0) {
                                            if (!fs.existsSync(checkdir)) {
                                                fs.mkdirSync(checkdir);
                                            }
                                        }
                                    }
                                    fs.copyFileSync(imgsourcefile, imgdestinationfile);
                                    console.log("img-Transfer:" + imgarray[iimg]);
                                }
                            }
                        }
                    }
                    cbgen2("finish", res, ret);
                    return;
                });
            }
        ],
        function (error, res, ret) {
            var smsg1 = JSON.stringify(ret);
            res.writeHead(200, {
                'Content-Type': 'application/text'
            });
            res.end(smsg1);
            return;
        });
});


/**
 * findNode  * https: //stackoverflow.com/questions/53390440/how-to-find-a-object-in-a-nested-array-using-recursion-in-js
 * @param {*} searchname
 * @param {*} currentNode
 * @param {*} parentNode
 * returns object mit currentNode, parentNode oder false wenn gescheitert.
 */
function findNode(searchname, currentNode, parentNode) {
    var i, currentChild, result;
    if (searchname === currentNode.li_attr.filename) {
        return {
            currentNode: currentNode,
            parentNode: parentNode
        };
    } else {
        // Use a for loop instead of forEach to avoid nested functions
        // Otherwise "return" will not work properly
        for (i = 0; i < currentNode.children.length; i += 1) {
            currentChild = currentNode.children[i];
            // Search in the current child
            result = findNode(searchname, currentChild, currentNode);
            // Return the result if the node has been found
            if (result !== false) {
                return result;
            }
        }
        // The node has not been found and we have no more options
        return false;
    }
}

/**
 * createRefHtml - generiert Verweise
 * @param {*} targetnode
 * @param {*} search
 * returns refhtml
 */
function createRefHtml(targetnode, search) {
    var refhtml = "";
    refhtml += "<div ";
    refhtml += " style='clear:both;text-align:center;font-weight: bold;padding-top:1em;'";
    refhtml += ">";
    refhtml += "<span>";
    if (targetnode.parentNode === null) {
        refhtml += "<br>Parent:" + "root";
    } else {
        refhtml += "<br>Parent:" + targetnode.parentNode.li_attr.filename;
    }
    refhtml += "<br>Current:" + targetnode.currentNode.li_attr.filename || "";
    refhtml += "</span>";
    refhtml += "</div>";
    return refhtml;
}

/**
 * createFooterLinks - erzeugt die Links für den Footer
 * @param {*} targetnode
 * @param {*} search
 * returns footerlinks
 */
function createFooterLinks(targetnode, search) {
    var footerlinks = {};
    /**
     * Feststellen des Index von currentNode in den children von parentNode innerhalb von targetnode
     */
    if (typeof targetnode.parentNode !== "undefined" && targetnode.parentNode !== null) {
        var lastpos = targetnode.parentNode.children.length - 1;
        for (var ipos = 0; ipos <= lastpos; ipos++) {
            if (search === targetnode.parentNode.children[ipos].li_attr.filename) {
                if (ipos > 0) {
                    footerlinks.prev = targetnode.parentNode.children[ipos - 1].li_attr.filename;
                    footerlinks.prevTitle = targetnode.parentNode.children[ipos - 1].text;
                }
            }
            if (ipos < lastpos) {
                footerlinks.next = targetnode.parentNode.children[ipos + 1].li_attr.filename;
                footerlinks.nextTitle = targetnode.parentNode.children[ipos + 1].text;
            }
            break;
        }
        footerlinks.up = targetnode.parentNode.li_attr.filename;
        footerlinks.upTitle = targetnode.parentNode.text;
    }
    if (targetnode.currentNode.children.length > 0) {
        footerlinks.down = targetnode.currentNode.children[0].li_attr.filename;
        footerlinks.downTitle = targetnode.currentNode.children[0].text;
    }
    return footerlinks;
}



/**
 * findNode
 * https://stackoverflow.com/questions/22222599/javascript-recursive-search-in-json-object
 * @param {} searchname - Suchkriterium
 * @param {*} currentNode - Übergabeobjekt oder Childobjekte
 */
function findNode1(searchname, currentNode) {
    if (searchname === currentNode.li_attr.filename) {
        return currentNode;
    } else {
        for (var index in currentNode.children) {
            var node = currentNode.children[index];
            if (searchname === node.li_attr.filename) {
                return node;
            }
            findNode(searchname, node);
        }
        return "No Node found";
    }
}




/**
 * iterategtree - Rekursive Iteration Generierungstree
 * @param {*} obj - Tree zum Ausgangspunkt
 * @param {*} res - Ergebnisobjekt
 */
function iterategtree(obj, res) {
    try {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                var node = obj[property];
                if (typeof res.home === "undefined") {
                    res.home = node.li_attr.filename;
                    res.top = node.li_attr.filename;
                }
                if (node.li_attr.filename === res.anchor) {
                    // found und es geht los
                    for (var ichild = 0; ichild < res.top.children.length; ichild++) {
                        var sibl = res.top.children[ichild];
                        node.li_attr.filename === res.anchor
                    }

                } else {
                    if (node.children.length > 0) {
                        res.top = node.li_attr.filename;
                        res = iterategtree(node, res);
                        if (res.ready === true) break;
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
    return res;
}




app.get('**/*.js', function (req, res) {
    // res.send('Hello World!');
    // so wird node.js zum http-Server
    try {
        var path1 = req.path;
        var path1a = path.dirname(req.path);
        var modulename = path1.substr(path1a.length);
        var path2 = path.join("/apps/re-klima/", modulename);
        if (req.path === "/gif.worker.js") {
            var p0 = path.join(__dirname, "static");
            p0 = path.join(p0, "lib");
            p0 = path.join(p0, req.path);
            res.sendFile(p0);
        } else if (fs.existsSync(path.join(__dirname, req.path))) {
            //res.sendFile(path.resolve(req.path));
            res.sendFile(path.join(__dirname, req.path));
        } else if (fs.existsSync(path.join(__dirname, path2))) {
            //res.sendFile(path.resolve("apps" + req.path));
            var p = path.join(__dirname, path2);
            res.sendFile(p);
        } else {
            res.send('{}');
        }
    } catch (err) {
        res.send('{}');
    }
    return;
});


app.get('/', function (req, res) {
    // res.send('Hello World!');
    // so wird node.js zum http-Server
    res.sendFile(path.resolve("static/index.html"));
    return;
});

app.listen(3001, function () {
    console.log('Example app listening on port 3001!');
});

/**
 * dir2tree - Auflösung Verzeichnis
 * @param {*} dir - Vorgabe des Verzeichnisses, das aufzulösen ist
 * @param {*} parobj - Objekt, das dem Verzeichnis entspricht, in diesem Objekt werden die children versorgt
 * @param {*} filetree - Gesamthafter Filetree für das UI, wird als return verwendet (s.u.)
 * returns filetree
 * {
        id          : "string" // will be autogenerated if omitted
        text        : "string" // node text
        icon        : "string" // string for custom
        state       : {
            opened    : boolean  // is the node open
            disabled  : boolean  // is the node disabled
            selected  : boolean  // is the node selected
        },
        children    : []  // array of strings or objects
        li_attr     : {}  // attributes for the generated LI node
        a_attr      : {}  // attributes for the generated A node
   }
 */
// https://stackoverflow.com/questions/50121881/node-js-recursively-list-full-path-of-files
function dir2tree(dir, parobj, filetree) {
    fs.readdirSync(dir).forEach(function (file) {
        var fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            console.log(fullPath);
            var newobj = {
                text: file,
                state: {
                    selected: false
                },
                a_attr: {
                    fullpath: fullPath
                },
                children: []
            };
            parobj.children.push(newobj);
            filetree = dir2tree(fullPath, newobj, filetree);
        } else {
            console.log(fullPath);
            var newfile = {
                text: file,
                icon: "jstree-file",
                state: {
                    selected: false
                },
                a_attr: {
                    fullpath: fullPath
                }
            };
            parobj.children.push(newfile);
        }
    });
    return filetree;
}