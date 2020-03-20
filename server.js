var path = require("path");
require('app-module-path/register');
require('app-module-path').addPath(path.join(__dirname, "apps"));
var express = require('express');
var app = express();
var fs = require("fs");
var async = require("async");

var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");

var session = require('express-session');
var FileStore = require('session-file-store')(session);
var cookieParser = require("cookie-parser");
var compression = require("compression");

var readline = require("readline");
var stream = require("stream");
// gblInfo 
var StreamZip = require("node-stream-zip");

// DB expressions
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('klidata.db3');

var sys0000sys = require("re-frame/sys0000sys.js");
var kla9020fun = require("re-klima/kla9020fun.js");
var kla1490srv = require("re-klima/kla1490srv.js");
 

var gblInfo = sys0000sys.getInfo();


var app = express();
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
    var pass = "";
    // Dummy Prüfung des API auf Security Level administrator
    var ischecked = true;
    console.log("GET-session:" + sess.username);
    return false;

}

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'static'))); // __dirname is always root verzeichnis #denglisch

/** 
 * getsql3tables - API über uihelper.getalltables aufgerufen, 
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
 * getdirectoryfiles  - generische Funktion
 */
app.get('/getdirectoryfiles', function (req, res) {
    if (checkSession(req, res)) return;
    var rootdir = path.dirname(require.main.filename);
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
            if (aktline > fromline || aktbyte > frombyte) {
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
 * getallrecords - generische Funktion wird  umgelenkt auf getallsqlrecords
 */
app.get('/getallrecords', function (req, res) {
    if (checkSession(req, res)) return;
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
 * setonerecord - API wie bei MongoDB, inter Umsetzung sqlite3
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