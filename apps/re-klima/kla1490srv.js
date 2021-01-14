/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */

const {
    isleapyear
} = require('../re-frame/uihelper');

/*global sysbase,uihelper */
(function () {
    'use strict';
    var kla1490srv = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var crg = crg || require('country-reverse-geocoding').country_reverse_geocoding();
    var path = path || require("path");
    var download = download || require("download-file");
    var LineByLineReader = LineByLineReader || require('line-by-line');
    var uihelper = uihelper || require('re-frame/uihelper');
    var sys0000sys = sys0000sys || require('re-frame/sys0000sys');
    var readline = readline || require("readline");

    var kla9020fun = null;

    var gbldb = null;
    var res = null;

    var anzecads = 0;
    var countries = {};
    var vglsouid = "";
    var countmin = 0;
    var countmax = 0;
    var fs;
    var sql3inserts = 0;
    var sql3errors = 0;
    var stationdata = [];


    /**
     * getp2kfiles - Steuerlogik für den Abruf aller Pages2k-Daten zu einer Liste von Stationen/Filenames
     * @param {*} db
     * @param {*} rootdir
     * @param {*} fs
     * @param {*} async
     * @param {*} req
     * @param {*} reqparm
     * @param {*} res
     * @param {*} callback295
     * Übergabeparameter:
     * url: url,
     * directory: directory,
     * filelist: filelist
     * Returns ret
     */
    kla1490srv.getp2kfiles = function (db, rootdir, fs, async, req, reqparm, res, callback295) {
        var url = "";
        var directory = "";
        var filelist = [];
        if (typeof req !== "undefined" && req !== null) {
            if (req.query && typeof req.body.url !== "undefined" && req.body.url.length > 0) {
                url = req.body.url;
            }
            if (req.query && typeof req.body.directory !== "undefined" && req.body.directory.length > 0) {
                directory = req.body.directory;
            }
            if (req.query && typeof req.body.filelist !== "undefined" && req.body.filelist.length > 0) {
                if (typeof req.body.filelist === "string") {
                    filelist = JSON.parse(req.body.filelist);
                } else {
                    filelist = req.body.filelist;
                }
            }
        } else if (typeof reqparm !== "undefined" && reqparm !== null) {
            if (reqparm && typeof reqparm.url !== "undefined" && reqparm.url.length > 0) {
                url = reqparm.url;
            }
            if (reqparm && typeof reqparm.directory !== "undefined" && reqparm.directory.length > 0) {
                directory = reqparm.directory;
            }
            if (reqparm && typeof reqparm.filelist !== "undefined" && reqparm.filelist.length > 0) {
                if (typeof reqparm.filelist === "string") {
                    filelist = JSON.parse(reqparm.filelist);
                } else {
                    filelist = reqparm.filelist;
                }
            }
        }
        /**
         * Erst feststellen, ob schon alle Dateien vorhanden sind,
         * wenn die filelist nicht vorgegeben ist, sonst die filelist abarbeiten
         * sys0000sys.getdirectoryfiles = function (gbldb, rootdir, fs, async, req, reqparm, res, supercallback4) {
         * holt die Fileliste von der Platte
         */
        var ret = {};
        async.waterfall([
            function (callback296a) {
                // sys0000sys.getdirectoryfiles, wenn filelist nicht gegeben ist
                if (filelist.length > 0) {
                    callback296a(null, res, ret);
                    return;
                } else {
                    /*
                     * fileopcode: "show" und "prep"
                     * predirectory: "/../klima1001/";
                     * directory: Beispiel: "albedo"
                     * root-Directory wird zugefügt
                     * wenn doKLIFILES und doKLIRAWFILES === false, dann kein SQL-Abgleich, nur directories
                     * var appDir = path.dirname(require.main.filename);
                     */
                    var reqparm = {};
                    reqparm.fileopcode = "list";
                    reqparm.url = url;
                    reqparm.predirectory = "";
                    reqparm.directory = directory;
                    reqparm.filterextensions = ".txt";
                    reqparm.skipsubdirectories = "false";
                    reqparm.doKLIFILES = "false";
                    reqparm.doKLIRAWFILES = "true";

                    sys0000sys.getdirectoryfiles(db, rootdir, fs, async, null, reqparm, res, function (res, ret) {
                        var firstfullname = "";
                        if (typeof ret.files !== "undefined" && ret.files.length > 0) {
                            for (var ifile = 0; ifile < ret.files.length; ifile++) {
                                filelist.push(ret.files[ifile].name);
                                if (firstfullname.length === 0) {
                                    firstfullname = ret.files[ifile].fullname;
                                }
                            }
                        }
                        callback296a(null, res, ret);
                        return;
                    });
                }
            },
            function (res, ret, callback296b) {
                // LOOP
                /**
                 * Loop async
                 * skip first one - ist ein Directory-Verweis
                 */
                var filecounter = 0;
                async.eachSeries(filelist, function (file, nextfile) {
                    filecounter++;
                    /*
                    if (filecounter === 1) {
                        nextfile();
                        return;
                    }
                    */
                    if (file.startsWith(directory)) {
                        file = path.basename(file);
                    }
                    async.waterfall([
                        function (callback295a) {
                            var reqparm = {};
                            reqparm.fullname = path.join(directory, file);
                            console.log("Verarbeitung:" + file);
                            reqparm.trule = false;
                            kla1490srv.getp2kfile(db, rootdir, fs, async, null, reqparm, res, function (res, ret1) {
                                // Post-Processing ein File nach callback
                                callback295a("Finish", res, ret1);
                                return;
                            });
                        }
                    ], function (error, result) {
                        // Ende der async-sequenz
                        nextfile();
                        return;
                    });
                }, function (error) {
                    // Endes des Loops eachSeries
                    callback295(res, {
                        error: false,
                        message: "Übernahme beendet:" + error
                    });
                    return;
                });

            }
        ], function (error, result) {
            // Abschluss
        });


    };




    /**
     * kla1490srv.getp2kfile - EINE pages2k Datei aufbereiten
     *  Aufruf aus kla1400raw: Einzel-Click oder sequentielle Aufrufe
     * - Vorbereitung
     * - Prüfung, wenn File nicht vorhanden, dann Download
     * - dann Tabellen fortschreiben KLISTATIONS, KLIHYDE (!)
     * @param {*} rootdir
     * @param {*} fs
     * @param {*} async
     * @param {*} req
     * @param {*} reqparm
     * @param {*} res
     * @param {*} supercallback3
     *
     */
    kla1490srv.getp2kfile = function (db, rootdir, fs, async, req, reqparm, res, callback294) {

        var files = [];
        var fullname = "";
        var trule = "";
        var directory = "";
        var ret = {};
        ret.data = [];
        if (typeof req !== "undefined" && req !== null) {
            if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
                fullname = req.query.fullname;
            }
            if (req.query && typeof req.query.trule !== "undefined" && req.query.trule.length > 0) {
                trule = req.query.trule;
            }
        } else if (typeof reqparm !== "undefined" && reqparm !== null) {
            if (reqparm && typeof reqparm.fullname !== "undefined" && reqparm.fullname.length > 0) {
                fullname = reqparm.fullname;
            }
            if (reqparm && typeof reqparm.trule !== "undefined" && reqparm.trule.length > 0) {
                trule = reqparm.trule;
            }
        }

        var check = sys0000sys.getPhysicalDirectory(fullname);
        if (check.error === false) {
            fullname = check.fullname;
        }
        ret.fullname = fullname;

        var sortdata = [];
        var iraw = 0;

        async.waterfall([
                function (callback294a) {
                    /**
                     * Dateinamen bereitstellen fullname, source, selyears,
                     * selyears wird nicht genutzt
                     */
                    callback294a(null, res, ret);
                    return;
                },
                function (res, ret, callback294a1) {
                    /**
                     * KLICOUNTRYCODES laden nach countries, wenn nicht vorhanden
                     */
                    if (Object.keys(countries).length > 0) {
                        callback294a1(null, res, ret);
                        return;
                    }
                    var reqparm = {};
                    reqparm.table = "KLICOUNTRYCODES";
                    reqparm.sel = {};
                    reqparm.projection = {};
                    sys0000sys.getallrecords(db, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            ret.message += " keine KLICOUNTRYCODES:" + ret1.message;
                            countries = {};
                            callback294a1(null, res, ret);
                            return;
                        } else {
                            if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                                countries = {};
                                for (var recordind in ret1.records) {
                                    var record = ret1.records[recordind];
                                    var alpha3 = record.alpha3;
                                    delete record.history;
                                    var countryname = record.name;
                                    delete record.name;
                                    record.countryname = countryname;
                                    countries[alpha3] = record;
                                }
                                callback294a1(null, res, ret);
                                return;
                            } else {
                                ret.message += " keine KLICOUNTRYCODES";
                                countries = {};
                                callback294a1(null, res, ret);
                                return;
                            }
                        }
                    });
                },
                function (res, ret, callback294a1a) {
                    /**
                     * KLISTATIONS löschen für pages2k
                     */
                    //var delStmt = "DELETE FROM KLISTATIONS ";
                    //delStmt += " WHERE source = 'PAGES2K'";
                    //db.run(delStmt, function (err) {
                    //    console.log("KLISTATIONS-PAGES2K: deleted:" + this.changes);
                    callback294a1a(null, res, ret);
                    return;
                    //});
                },
                function (res, ret, callback291a1b) {
                    /**
                     * KLIINVENTORY löschen für PAGES2K
                     */
                    //var delStmt = "DELETE FROM KLIINVENTORY ";
                    //delStmt += " WHERE source = 'PAGES2K'";
                    //db.run(delStmt, function (err) {
                    //    console.log("KLIINVENTORY-PAGES2K: deleted:" + this.changes);
                    callback291a1b(null, res, ret);
                    return;
                    //});
                },
                function (res, ret, callback294a1c) {
                    /**
                     * KLIHYDE löschen für pages2k
                     */
                    //var delStmt = "DELETE FROM KLIHYDE ";
                    //delStmt += " WHERE source = 'PAGES2K'";
                    //db.run(delStmt, function (err) {
                    //    console.log("KLIHYDE-PAGES2K: deleted:" + this.changes);
                    callback294a1c(null, res, ret);
                    return;
                    //});
                },

                function (res, ret, callback294a1d) {
                    /**
                     * ret.fullname prüfen
                     * und gegebenenfalls Download
                     */
                    if (!fs.existsSync(fullname)) {
                        var targetdir = path.dirname(fullname);
                        var filename = path.basename(fullname);
                        var url = "https://www1.ncdc.noaa.gov/pub/data/paleo/pages2k/pages2k-temperature-v2-2017/data-current-version/";
                        var fileurl = url + filename;
                        ret.filename = filename;
                        var options = {
                            directory: targetdir,
                            filename: filename
                        };
                        download(fileurl, options, function (err) {
                            if (err) {
                                console.log("*** download " + targetdir + "=>" + filename + "=>" + err);
                                console.log(err.stack);
                                callback294a1d("Error", res, {
                                    error: false,
                                    message: fullname + " " + err
                                });
                                return;
                            } else {
                                callback294a1d(null, res, ret);
                                return;
                            }
                        });
                    } else {
                        callback294a1d(null, res, ret);
                        return;
                    }
                },
                function (res, ret, callback294a2a) {
                    /**
                     * KLISTATIONS und KLIINVENTORY: 1 Datensatz
                     * KLIHYDE: 1 Datensatz, Jahreswerte,  L1 mit den Variablennamen und -Werten
                     * "" als missing value in der stringified-Speicherung
                     */
                    sortdata = [];
                    var stationid = "";
                    var stationname = "";
                    var variable = "";
                    var latitude = 0;
                    var longitude = 0;
                    // Werte für KLISTATIONS
                    // sind hier noch nicht vorhanden!!!
                    stationid = "";
                    stationname = "";
                    latitude = 0;
                    longitude = 0;

                    var klistationrec = {
                        source: "PAGES2K",
                        stationid: stationid,
                        stationname: stationname,
                        latitude: latitude,
                        longitude: longitude,
                        climatezone: "",
                        continent: "",
                        continentname: "",
                        alpha2: "",
                        alpha3: "",
                        countrycode: "",
                        region: "",
                        subregion: "",
                        intermediateregion: "",
                        temperatur: "TAVG",
                        height: 0,
                        state: "",
                    };
                    var kliinventoryrec = {
                        source: "PAGES2K",
                        stationid: stationid,
                        variable: "PAGES2K",
                        latitude: latitude,
                        longitude: longitude,
                        fromyear: null,
                        toyear: null,
                        anzyears: 0,
                    };
                    var klihyderec = {
                        source: "PAGES2K",
                        stationid: stationid,
                        fromyear: null,
                        toyear: null,
                        anzyears: 0,
                        realyears: 0,
                        missing: 0,
                        data: {}
                    };
                    ret.klistation = klistationrec;
                    ret.kliinventory = kliinventoryrec;
                    ret.klihyde = klihyderec;
                    callback294a2a(null, res, ret);
                    return;
                },
                function (res, ret, callback294a2b) {
                    /**
                     * Lesen Datei und Transfer in Strukturen
                     * ret.klistation, ret.klihyde
                     */

                    var linecount = 0;
                    var metadata = {};
                    var metafields = [];
                    var headfields = [];
                    var datafields = [];
                    var datalinecounter = 0;
                    var data = {}; // Alle Wertesätze aus der Datei mit allen Variablen und Periode
                    var stationdata = {}; // alle Attribute/Parameter aus der Datei

                    if (!fs.existsSync(fullname)) {
                        console.log(fullname + " nicht vorhanden nach Download");
                        ret.error = true;
                        ret.message = fullname + " nicht vorhanden nach Download";
                        callback294a2b("Error", res, ret);
                        return;
                    }

                    ret.filepath = fullname;
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
                            sys0000sys.getlineparameter(line, "Southernmost_Latitude:", "latitude1", metadata);
                            sys0000sys.getlineparameter(line, "Westernmost_Longitude:", "longitude1", metadata);

                            sys0000sys.getlineparameter(line, "Elevation:", "HGHT", metadata);
                            sys0000sys.getlineparameter(line, "Site_Name:", "sitename", metadata);
                            sys0000sys.getlineparameter(line, "Earliest_Year:", "firstyear", metadata);
                            sys0000sys.getlineparameter(line, "Most_Recent_Year:", "lastyear", metadata);
                            // Sonstige Attribute gehen in Pool-Feld
                            // es gibt Mehrfachnennungen von Feldnamen,
                            // Die Überschriften im Header sind nicht identisch mit o.a. meta...
                            var gdis = line.indexOf("#");
                            var ddis = line.indexOf(":");
                            if (gdis === 0 && ddis > 0) {
                                var name = line.substring(gdis + 1, ddis).trim();
                                var value = line.substr(ddis + 1).trim();
                                if (typeof stationdata[name] === "undefined") {
                                    stationdata[name] = value;
                                } else {
                                    stationdata[name] += "; " + value;
                                }
                            }
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
                        // Hier werden alle Daten ausgegeben
                        // KLISTATIONS, KLIHYDE
                        ret.filename = path.basename(ret.filepath);
                        if (typeof metadata.sitename !== "undefined" && metadata.sitename.length > 0) {
                            ret.klihyde.name = metadata.sitename.trim();
                            ret.klistation.stationname = metadata.sitename.trim();
                            if (typeof ret.filename !== "undefined") {
                                ret.klihyde.name += " (" + ret.filename + ")";
                                ret.klistation.stationname += " (" + ret.filename + ")";
                            }
                        } else {
                            var filename = path.basename(ret.fullname);
                            ret.klihyde.name = ret.filename;
                            ret.klistation.stationname = ret.filename;
                        }

                        metadata.longitude = metadata.longitude || "";
                        metadata.longitude1 = metadata.longitude1 || "";
                        if (metadata.longitude !== metadata.longitude1) {
                            var long0 = parseFloat(metadata.longitude);
                            var long1 = parseFloat(metadata.longitude1);
                            var long2 = ((long2 - long1) / 2).toFixed(6);
                            ret.klihyde.longitude = long2;
                            ret.klistation.longitude = long2;
                        } else {
                            ret.klihyde.longitude = metadata.longitude;
                            ret.klistation.longitude = metadata.longitude;
                        }

                        metadata.latitude = metadata.latitude || "";
                        metadata.latitude1 = metadata.latitude1 || "";
                        if (metadata.latitude !== metadata.latitude1) {
                            var lat0 = parseFloat(metadata.latitude);
                            var lat1 = parseFloat(metadata.latitude1);
                            var lat2 = ((lat2 - lat1) / 2).toFixed(6);
                            ret.klihyde.latitude = lat2;
                            ret.klistation.latitude = lat2;
                        } else {
                            ret.klihyde.latitude = metadata.latitude;
                            ret.klistation.latitude = metadata.latitude;
                        }

                        ret.kliinventory.longitude = ret.klistation.longitude;
                        ret.kliinventory.latitude = ret.klistation.latitude;

                        var cont = uihelper.getContinent(ret.klistation.longitude, ret.klistation.latitude);
                        if (cont.error === false) {
                            ret.klistation.continent = cont.continentcode;
                            ret.klistation.continentname = cont.continentname;
                        }
                        var climatezone = uihelper.getClimateZone(ret.klistation.latitude);
                        ret.klistation.climatezone = climatezone.value;
                        if (crg === null) {
                            crg = require('country-reverse-geocoding').country_reverse_geocoding();
                        }
                        /**
                         * Land aufgrund latitude/longitude bestimmen
                         */
                        var country = crg.get_country(parseFloat(ret.klistation.latitude), parseFloat(ret.klistation.longitude));
                        if (typeof country !== "undefined" && country !== null && typeof country.code !== "undefined") {
                            ret.klistation.alpha3 = country.code;
                            ret.klistation.countryname = country.name;
                            var countrydata = countries[country.code];
                            if (typeof countrydata !== "undefined" && countrydata !== null) {
                                delete countrydata.history;
                                delete countrydata.tsserverupd;
                                delete countrydata.iostatus;
                                delete countrydata._id;
                                ret.klistation = Object.assign(ret.klistation, countrydata);
                            }
                        }
                        /**
                         * Konstruktion stationid
                         */
                        if (typeof metadata.HGHT === "string" && metadata.HGHT.length > 0) {
                            ret.klistation.height = metadata.HGHT.trim();
                        } else {
                            ret.klistation.height = "0";
                        }

                        var newstationid = ret.klistation.continent;
                        if (newstationid.length === 0) {
                            newstationid = "PS";
                        }
                        newstationid += (parseFloat(ret.klistation.longitude).toFixed(3)) + (parseFloat(ret.klistation.latitude).toFixed(3)) + ret.klistation.height;
                        newstationid = newstationid.replace(/-/g, "");
                        newstationid = newstationid.replace(/\./g, "");

                        ret.klistation.stationid = newstationid;
                        ret.kliinventory.stationid = newstationid;
                        ret.klihyde.stationid = newstationid;

                        ret.klistation.metafields = metafields;
                        ret.klistation.metadata = metadata;
                        ret.klihyde.metafields = metafields;
                        /**
                         * Aufbereitung Jahresdaten in klihyde
                         */
                        ret.klihyde.data = {};
                        ret.klihyde.fromyear = null;
                        ret.klihyde.toyear = null;
                        ret.klihyde.anzyears = 0;
                        for (var idata = 0; idata < ret.data.length; idata++) {
                            var year = "9999";
                            if (typeof ret.data[idata].year === "undefined" || isNaN(ret.data[idata].year)) {
                                console.log("no year found:" + idata + ". " + JSON.stringify(ret.data[idata]));
                                continue;
                            } else {
                                year = ret.data[idata].year;
                                if (year.indexOf(".") >= 0) {
                                    year = year.substring(0, year.indexOf("."));
                                }
                            }
                            if (typeof ret.klihyde.data[year] === "undefined") {
                                ret.klihyde.data[year] = {};
                                if (ret.klihyde.fromyear === null) {
                                    ret.klihyde.fromyear = year;
                                } else if (ret.klihyde.fromyear > year) {
                                    ret.klihyde.fromyear = year;
                                }
                                if (ret.klihyde.toyear === null) {
                                    ret.klihyde.toyear = year;
                                } else if (ret.klihyde.toyear < year) {
                                    ret.klihyde.toyear = year;
                                }
                            }
                            if (typeof ret.klihyde.data[year].L1 === "undefined") {
                                ret.klihyde.data[year].L1 = {};
                            }
                            var names = Object.keys(ret.data[idata]);
                            for (var iname = 0; iname < names.length; iname++) {
                                if (names[iname] !== "year") {
                                    if (ret.data[idata][names[iname]] === "nan") {
                                        ret.klihyde.data[year].L1[names[iname]] = "";
                                    } else {
                                        ret.klihyde.data[year].L1[names[iname]] = ret.data[idata][names[iname]];
                                    }
                                }
                            }
                        }
                        ret.klihyde.anzyears = parseInt(ret.klihyde.toyear) - parseInt(ret.klihyde.fromyear) + 1;
                        /**
                         * Vererben auf KLIINVENTORY
                         */
                        ret.kliinventory.fromyear = ret.klihyde.fromyear;
                        ret.kliinventory.toyear = ret.klihyde.toyear;
                        ret.kliinventory.anzyears = ret.klihyde.anzyears;

                        var reqparm = {};
                        async.waterfall([
                                function (callback294b) {
                                    // Ausgabe KLISTATIONS
                                    reqparm.selfields = {
                                        source: "PAGES2K",
                                        stationid: ret.klistation.stationid
                                    };
                                    var updstation = Object.assign({}, ret.klistation, true);
                                    delete updstation.source;
                                    delete updstation.stationid;

                                    reqparm.updfields = {};
                                    reqparm.updfields["$setOnInsert"] = {
                                        source: "PAGES2K",
                                        stationid: ret.klistation.stationid
                                    };
                                    reqparm.updfields["$set"] = updstation;
                                    reqparm.table = "KLISTATIONS";
                                    sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                                        callback294b(null, res, ret);
                                        return;
                                    });
                                },
                                function (res, ret, callback294b1) {
                                    // Ausgabe KLIINVENTORY
                                    var reqparm = {};
                                    reqparm.selfields = {
                                        source: "PAGES2K",
                                        stationid: ret.klistation.stationid,
                                        variable: "PAGES2K"
                                    };
                                    reqparm.updfields = {};
                                    reqparm.updfields["$setOnInsert"] = reqparm.selfields;
                                    var updrecord = {
                                        fromyear: ret.klihyde.fromyear,
                                        toyear: ret.klihyde.toyear,
                                        anzyears: ret.klihyde.anzyears,
                                        longitude: ret.klistation.longitude,
                                        latitude: ret.klistation.latitude
                                    };
                                    reqparm.updfields["$set"] = updrecord;
                                    reqparm.table = "KLIINVENTORY";
                                    sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                                        if (ret1.error === true) {
                                            console.log(ret.klihyde.stationid + " ERROR " + ret1.message);
                                            ret.error = false;
                                            ret.message = "ERROR:" + ret1.message;
                                            callback294b1(null, res, ret);
                                            return;
                                        } else {
                                            ret.error = false;
                                            ret.message = "process";
                                            callback294b1(null, res, ret);
                                            return;
                                        }
                                    });
                                },
                                function (res, ret, callback294c) {
                                    // Ausgabe KLIHYDE
                                    reqparm.selfields = {
                                        source: "PAGES2K",
                                        stationid: ret.klihyde.stationid,
                                    };
                                    var updstation = Object.assign({}, ret.klihyde, true);
                                    delete updstation.source;
                                    delete updstation.stationid;
                                    reqparm.updfields = {};
                                    reqparm.updfields["$setOnInsert"] = {
                                        source: "PAGES2K",
                                        stationid: ret.klihyde.stationid
                                    };
                                    reqparm.updfields["$set"] = updstation;
                                    reqparm.table = "KLIHYDE";
                                    sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                                        callback294c("Finish", res, ret);
                                        return;
                                    });
                                }
                            ],
                            function (error, res, ret) {
                                ret.error = true;
                                ret.message = error;
                                callback294a2b("Finish", res, ret);
                                return;
                            });
                    });
                }
            ],
            function (error, res, ret) {
                console.log("FERTIG PAGES2K");
                callback294(res, ret);
                return;
            });
    };


    /**
     * loadnao  - North Atlantic Oscillation
     * https://crudata.uea.ac.uk/cru/data/nao/
     *
     * @param {*} gblInfo
     * @param {*} db
     * @param {*} fs
     * @param {*} path
     * @param {*} rootname
     * @param {*} async
     * @param {*} stream
     * @param {*} csv
     * @param {*} readline
     * @param {*} sys0000sys
     * @param {*} kla9020fun
     * @param {*} req
     * @param {*} res
     * @param {*} callback291
     * returns function (res, ret)
     *
     */
    kla1490srv.loadnao = function (gblInfo, db, fs, path, rootname, async, stream, csv, readline, sys0000sys, kla9020fun, req, res, callback292) {
        var sortdata = [];
        var iraw = 0;
        async.waterfall([
                function (callback292a) {
                    /**
                     * Dateinamen bereitstellen fullname, source, selyears,
                     * selyears wird nicht genutzt
                     */
                    var fullname = "";
                    if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
                        fullname = req.query.fullname;
                    }
                    var source = "NAO";
                    if (req.query && typeof req.query.source !== "undefined" && req.query.source.length > 0) {
                        source = req.query.source;
                    }
                    var selyears = "";
                    if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
                        selyears = req.query.selyears;
                    }
                    if (!fs.existsSync(fullname)) {
                        callback292a("Error", res, {
                            error: false,
                            message: fullname + " nicht auf dem Server vorhanden"
                        });
                        return;
                    }
                    var stationfilter = "";
                    if (req.query && typeof req.query.extraParam !== "undefined" && req.query.extraParam.length > 0) {
                        stationfilter = JSON.parse(req.query.extraParam).stationfilter;
                    }
                    var ret = {};
                    ret.fullname = fullname;
                    ret.fullnamestations = fullname;
                    ret.dirname = path.dirname(fullname);
                    ret.source = source;
                    ret.selyears = selyears;
                    ret.stationfilter = stationfilter;
                    callback292a(null, res, ret);
                    return;
                },
                function (res, ret, callback292a1) {
                    /**
                     * KLICOUNTRYCODES laden nach countries
                     */
                    var reqparm = {};
                    reqparm.table = "KLICOUNTRYCODES";
                    reqparm.sel = {};
                    reqparm.projection = {};
                    sys0000sys.getallrecords(db, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            ret.message += " keine KLICOUNTRYCODES:" + ret1.message;
                            countries = {};
                            callback292a1(null, res, ret);
                            return;
                        } else {
                            if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                                countries = {};
                                for (var recordind in ret1.records) {
                                    var record = ret1.records[recordind];
                                    var alpha3 = record.alpha3;
                                    delete record.history;
                                    var countryname = record.name;
                                    delete record.name;
                                    record.countryname = countryname;
                                    countries[alpha3] = record;
                                }
                                callback292a1(null, res, ret);
                                return;
                            } else {
                                ret.message += " keine KLICOUNTRYCODES";
                                countries = {};
                                callback292a1(null, res, ret);
                                return;
                            }
                        }
                    });
                },
                function (res, ret, callback292a1a) {
                    /**
                     * KLISTATIONS löschen für NAO
                     */
                    // var delStmt = "DELETE FROM KLISTATIONS ";
                    //delStmt += " WHERE source = 'NAO'";
                    //db.run(delStmt, function (err) {
                    //    console.log("KLISTATIONS: deleted:" + this.changes);
                    callback292a1a(null, res, ret);
                    return;
                    //});
                },
                function (res, ret, callback292a1b) {
                    /**
                     * KLIINVENTORY löschen für ANO
                     */
                    //var delStmt = "DELETE FROM KLIINVENTORY ";
                    //delStmt += " WHERE source = 'NAO'";
                    //db.run(delStmt, function (err) {
                    //    console.log("KLIINVENTORY: deleted:" + this.changes);
                    callback292a1b(null, res, ret);
                    return;
                    //});
                },
                function (res, ret, callback292a1c) {
                    /**
                     * KLIDATA löschen für NAO
                     */
                    //var delStmt = "DELETE FROM KLIDATA ";
                    //delStmt += " WHERE source = 'NAO'";
                    //db.run(delStmt, function (err) {
                    //    console.log("KLIDATA: deleted:" + this.changes);
                    callback292a1c(null, res, ret);
                    return;
                    //});
                },
                function (res, ret, callback292a2a) {
                    /**
                     * KLISTATIONS und KLIINVENTORY: 1 Datensatz
                     * KLIDATA: 1 Datensatz, Monatswerte auf Tage des jeweiligen Monats roh verteilt
                     * "" als missing value in der stringified-Speicherung
                     */
                    sortdata = [];
                    var stationid = "";
                    var stationname = "";
                    var variable = "";
                    var latitude = 0;
                    var longitude = 0;
                    if (ret.fullname.indexOf("azo") >= 0) {
                        stationid = "NAO-Azoren";
                        stationname = "NAO-Azoren (Ponte Delgada)";
                        variable = "NAO";
                        latitude = 37.6675097;
                        longitude = -26.0922538;
                    } else if (ret.fullname.indexOf("gib") >= 0) {
                        stationid = "NAO-Gibraltar";
                        stationname = "NAO-Gibraltar";
                        variable = "NAO";
                        latitude = 36.1249979;
                        longitude = -5.3674627;
                    } else if (ret.fullname.indexOf("ice") >= 0) {
                        stationid = "NAO-Iceland";
                        stationname = "NAO-Iceland";
                        variable = "NAO";
                        latitude = 64.1334735;
                        longitude = -21.9224816;
                    } else {
                        stationid = "NAO-Index";
                        stationname = "NAO-Index";
                        variable = "NAO";
                        latitude = 37.6675097;
                        longitude = -26.0922538;
                    }
                    var klistationrec = {
                        source: "NAO",
                        stationid: stationid,
                        stationname: stationname,
                        latitude: latitude,
                        longitude: longitude,
                        climatezone: "",
                        continent: "",
                        continentname: "",
                        alpha2: "",
                        alpha3: "",
                        countrycode: "",
                        region: "",
                        subregion: "",
                        intermediateregion: "",
                        temperatur: "NAO",
                        height: 0,
                        state: "",
                    };
                    var kliinventoryrec = {
                        source: "NAO",
                        stationid: stationid,
                        variable: variable,
                        fromyear: 0,
                        toyear: 0,
                        latitude: latitude,
                        longitude: longitude,
                    };
                    var klidatarec = {
                        source: "NAO",
                        stationid: stationid,
                        variable: variable,
                        fromyear: null,
                        toyear: null,
                        anzyears: 0,
                        realyears: 0,
                        missing: 0,
                        years: {}
                    };

                    var cont = uihelper.getContinent(klistationrec.longitude, klistationrec.latitude);
                    if (cont.error === false) {
                        klistationrec.continent = cont.continentcode;
                        klistationrec.continentname = cont.continentname;
                    }
                    var climatezone = uihelper.getClimateZone(klistationrec.latitude);
                    klistationrec.climatezone = climatezone.value;
                    if (crg === null) {
                        crg = require('country-reverse-geocoding').country_reverse_geocoding();
                    }
                    /**
                     * Land aufgrund latitude/longitude bestimmen
                     */
                    var country = crg.get_country(klistationrec.latitude, klistationrec.longitude);
                    if (typeof country !== "undefined" && country !== null) {
                        klistationrec.alpha3 = country.code;
                        klistationrec.countryname = country.name;
                        var countrydata = countries[country.code];
                        if (typeof countrydata !== "undefined" && countrydata !== null) {
                            delete countrydata.history;
                            delete countrydata.tsserverupd;
                            delete countrydata.iostatus;
                            delete countrydata._id;
                            klistationrec = Object.assign(klistationrec, countrydata);
                        }
                    }
                    var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                    try {
                        var readInterface = readline.createInterface({
                            input: fs.createReadStream(ret.fullname),
                            console: false
                        });
                        readInterface.on('line', function (data) {
                            // fs.createReadStream(ret.fullname)
                            /*
                            .pipe(iconv.decodeStream('iso-8859-15'))
                            .pipe(iconv.encodeStream('utf8'))
                            */
                            // .on("data", function (data) {
                            var that = this;

                            that.pause();
                            iraw++;
                            // 1825  -0.23   0.21   0.33  -0.28   0.13   0.41  -0.92   1.43  -0.95   1.98   1.06  -1.31    0.16

                            var haserror = false;
                            var darray = data.trim().split(/[\s]+/); // Trenner 1-n Blanks
                            if (darray.length < 13) {
                                haserror = true;
                            }
                            var year = darray[0];
                            var monvalues = [];
                            if (haserror === false) {
                                monvalues = darray.slice(1, 13);
                                // check if NaN
                                for (var imon = 0; imon < 12; imon++) {
                                    if (isNaN(monvalues[imon])) {
                                        haserror = true;
                                        break;
                                    }
                                }
                            }
                            if (haserror === false) {
                                // var yearvalue = darray[13]; prüfen, ob vorhanden, azoren etc. ohne!!!
                                if (typeof klidatarec.years["" + year] === "undefined") {
                                    if (uihelper.isleapyear(year)) {
                                        klidatarec.years[year] = new Array(366).fill("");
                                    } else {
                                        klidatarec.years[year] = new Array(365).fill("");
                                    }
                                    if (klidatarec.fromyear === null) {
                                        klidatarec.fromyear = year;
                                    } else if (year < klidatarec.fromyear) {
                                        klidatarec.fromyear = year;
                                    }
                                    if (klidatarec.toyear === null) {
                                        klidatarec.toyear = year;
                                    } else if (year > klidatarec.toyear) {
                                        klidatarec.toyear = year;
                                    }
                                }
                                if (uihelper.isleapyear(year)) {
                                    mdtable[1] = 29;
                                } else {
                                    mdtable[1] = 28;
                                }
                                var baseday = 0;
                                for (var imon = 0; imon < 12; imon++) {
                                    for (var day = 0; day < mdtable[imon]; day++) {
                                        var tind = baseday + parseInt(day);
                                        if (monvalues[imon] !== "-99.99" && monvalues[imon] !== "-10") {
                                            klidatarec.years[year][tind] = monvalues[imon];
                                        }
                                    }
                                    baseday += mdtable[imon];
                                }
                            }
                            that.resume();
                        });
                        readInterface.on("close", function (err) {
                            // KLISTATIONS, KLIINVENTORY, KLIDATA: 1 Datensatz
                            var reqparm = {};
                            async.waterfall([
                                    function (callback293a) {
                                        // Ausgabe KLISTATIONS
                                        reqparm.selfields = {
                                            source: "NAO",
                                            stationid: stationid
                                        };
                                        var updstation = Object.assign({}, klistationrec, true);
                                        delete updstation.source;
                                        delete updstation.stationid;

                                        reqparm.updfields = {};
                                        reqparm.updfields["$setOnInsert"] = {
                                            source: "NAO",
                                            stationid: stationid
                                        };
                                        reqparm.updfields["$set"] = updstation;
                                        reqparm.table = "KLISTATIONS";
                                        sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                                            callback293a(null, res, ret);
                                            return;
                                        });
                                    },
                                    function (res, ret, callback293b) {
                                        // Ausgabe KLIINVENTORY
                                        kliinventoryrec.fromyear = klidatarec.fromyear;
                                        kliinventoryrec.toyear = klidatarec.toyear;
                                        kliinventoryrec.anzyears = parseInt(kliinventoryrec.toyear) - parseInt(kliinventoryrec.fromyear) + 1;
                                        reqparm.selfields = {
                                            source: "NAO",
                                            stationid: stationid,
                                            variable: variable
                                        };
                                        var updstation = Object.assign({}, kliinventoryrec, true);
                                        delete updstation.source;
                                        delete updstation.stationid;
                                        delete updstation.variable;

                                        reqparm.updfields = {};
                                        reqparm.updfields["$setOnInsert"] = {
                                            source: "NAO",
                                            stationid: stationid,
                                            variable: variable
                                        };
                                        reqparm.updfields["$set"] = updstation;
                                        reqparm.table = "KLIINVENTORY";
                                        sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                                            callback293b(null, res, ret);
                                            return;
                                        });
                                    },
                                    function (res, ret, callback293c) {
                                        // Ausgabe KLIDATA
                                        klidatarec.years = JSON.stringify(klidatarec.years);
                                        klidatarec.anzyears = parseInt(klidatarec.toyear) - parseInt(klidatarec.fromyear) + 1;
                                        reqparm.selfields = {
                                            source: "NAO",
                                            stationid: stationid,
                                            variable: variable
                                        };
                                        var updstation = Object.assign({}, klidatarec, true);
                                        delete updstation.source;
                                        delete updstation.stationid;
                                        delete updstation.variable;

                                        reqparm.updfields = {};
                                        reqparm.updfields["$setOnInsert"] = {
                                            source: "NAO",
                                            stationid: stationid,
                                            variable: variable
                                        };
                                        reqparm.updfields["$set"] = updstation;
                                        reqparm.table = "KLIDATA";
                                        sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                                            callback293c("Finish", res, ret);
                                            return;
                                        });
                                    }
                                ],
                                function (error, res, ret) {
                                    ret.error = true;
                                    ret.message = err;
                                    callback292a2a("Finish", res, ret);
                                    return;
                                });
                        });
                    } catch (err) {
                        console.log(err.stack);
                        ret.error = true;
                        ret.message = err;
                        callback292a2a("Error", res, ret);
                        return;
                    }
                }
            ],
            function (error, res, ret) {
                console.log("FERTIG NAO");
                callback292(res, ret);
                return;
            });
    };




    /**
     * loadwasserstand - HYGRIS-Daten nach KLIDATA
     * und NRWSTATIONS nach KLISTATIONS
     * https://www.opengeodata.nrw.de/produkte/umwelt_klima/wasser/hygrisc/
     * @param {*} gblInfo
     * @param {*} db
     * @param {*} fs
     * @param {*} path
     * @param {*} rootname
     * @param {*} async
     * @param {*} stream
     * @param {*} StreamZip
     * @param {*} readline
     * @param {*} sys0000sys
     * @param {*} req
     * @param {*} res
     * returns function (res, ret)
     */
    kla1490srv.loadwasserstand = function (gblInfo, db, fs, path, rootname, async, stream, csv, readline, sys0000sys, kla9020fun, req, res, callback291) {
        var sortdata = [];
        var iraw = 0;
        async.waterfall([
                function (callback291a) {
                    /**
                     * Dateinamen bereitstellen fullname, source, selyears,
                     * selyears wird nicht genutzt
                     */
                    var fullname = "";
                    if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
                        fullname = req.query.fullname;
                    }
                    var source = "HYGRIS";
                    if (req.query && typeof req.query.source !== "undefined" && req.query.source.length > 0) {
                        source = req.query.source;
                    }
                    var selyears = "";
                    if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
                        selyears = req.query.selyears;
                    }
                    if (!fs.existsSync(fullname)) {
                        callback291a("Error", res, {
                            error: false,
                            message: fullname + " nicht auf dem Server vorhanden"
                        });
                        return;
                    }
                    var stationfilter = "";
                    if (req.query && typeof req.query.extraParam !== "undefined" && req.query.extraParam.length > 0) {
                        stationfilter = JSON.parse(req.query.extraParam).stationfilter;
                    }
                    var ret = {};
                    ret.fullname = fullname;
                    ret.fullnamestations = fullname;
                    ret.dirname = path.dirname(fullname);
                    ret.source = source;
                    ret.selyears = selyears;
                    ret.stationfilter = stationfilter;
                    callback291a(null, res, ret);
                    return;
                },
                function (res, ret, callback291a1) {
                    /**
                     * KLICOUNTRYCODES laden nach countries
                     */
                    var reqparm = {};
                    reqparm.table = "KLICOUNTRYCODES";
                    reqparm.sel = {};
                    reqparm.projection = {};
                    sys0000sys.getallrecords(db, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            ret.message += " keine KLICOUNTRYCODES:" + ret1.message;
                            countries = {};
                            callback291a1(null, res, ret);
                            return;
                        } else {
                            if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                                countries = {};
                                for (var recordind in ret1.records) {
                                    var record = ret1.records[recordind];
                                    var alpha3 = record.alpha3;
                                    delete record.history;
                                    var countryname = record.name;
                                    delete record.name;
                                    record.countryname = countryname;
                                    countries[alpha3] = record;
                                }
                                callback291a1(null, res, ret);
                                return;
                            } else {
                                ret.message += " keine KLICOUNTRYCODES";
                                countries = {};
                                callback291a1(null, res, ret);
                                return;
                            }
                        }
                    });
                },
                function (res, ret, callback291a1a) {
                    /**
                     * KLISTATIONS löschen für HYGRIS
                     */
                    // var delStmt = "DELETE FROM KLISTATIONS ";
                    //delStmt += " WHERE source = 'HYGRIS'";
                    //db.run(delStmt, function (err) {
                    //    console.log("KLISTATIONS: deleted:" + this.changes);
                    callback291a1a(null, res, ret);
                    return;
                    //});
                },
                function (res, ret, callback291a1b) {
                    /**
                     * KLIINVENTORY löschen für HYGRIS
                     */
                    //var delStmt = "DELETE FROM KLIINVENTORY ";
                    //delStmt += " WHERE source = 'HYGRIS'";
                    //db.run(delStmt, function (err) {
                    //    console.log("KLIINVENTORY: deleted:" + this.changes);
                    callback291a1b(null, res, ret);
                    return;
                    //});
                },
                function (res, ret, callback291a1c) {
                    /**
                     * KLIDATA löschen für HYGRIS
                     */
                    //var delStmt = "DELETE FROM KLIDATA ";
                    //delStmt += " WHERE source = 'HYGRIS'";
                    //db.run(delStmt, function (err) {
                    //    console.log("KLIDATA: deleted:" + this.changes);
                    callback291a1c(null, res, ret);
                    return;
                    //});

                },
                function (res, ret, callback291a2a) {
                    /**
                     * Chunks bilden und vorsortieren, 1 Mio Sätze pro Chunk
                     * kontrolliert mit iraw
                     */
                    sortdata = [];
                    try {
                        fs.createReadStream(ret.fullname)
                            /*
                            .pipe(iconv.decodeStream('iso-8859-15'))
                            .pipe(iconv.encodeStream('utf8'))
                            */
                            .pipe(csv.parse({
                                headers: true,
                                delimiter: ';',
                                ignoreEmpty: true
                            }))
                            .on("data", function (data) {
                                var that = this;
                                that.pause();
                                var messstelle_id = data.messstelle_id;
                                var datum = data.datum_messung;
                                var wert = data.wasserstd_m;
                                if (data.messstelle_id === "data.messstelle_id") {
                                    that.resume();
                                }
                                sortdata.push({
                                    messstelle_id: data.messstelle_id,
                                    datum_messung: data.datum_messung,
                                    wasserstd_m: data.wasserstd_m
                                });
                                iraw++;
                                if (iraw % 1000000 === 0) {
                                    sortdata.sort(function (a, b) {
                                        if (a.messstelle_id < b.messstelle_id) {
                                            return -1;
                                        } else if (a.messstelle_id > b.messstelle_id) {
                                            return 1;
                                        } else {
                                            if (a.datum_messung < b.datum_messung) {
                                                return -1;
                                            } else if (a.datum_messung > b.datum_messung) {
                                                return 1;
                                            }
                                            return 0;
                                        }
                                    });
                                    kla1490srv.putHYGRISchunk(db, async, uihelper, sys0000sys, sortdata, res, ret, function (ret1) {
                                        sortdata = [];
                                        that.resume();
                                    });
                                } else {
                                    that.resume();
                                }

                            })
                            .on("end", function () {
                                sortdata.sort(function (a, b) {
                                    if (a.messstelle_id < b.messstelle_id) {
                                        return -1;
                                    } else if (a.messstelle_id > b.messstelle_id) {
                                        return 1;
                                    } else {
                                        if (a.datum_messung < b.datum_messung) {
                                            return -1;
                                        } else if (a.datum_messung > b.datum_messung) {
                                            return 1;
                                        }
                                        return 0;
                                    }
                                });
                                kla1490srv.putHYGRISchunk(db, async, uihelper, sys0000sys, sortdata, res, ret, function (ret1) {
                                    callback291a2a(null, res, ret);
                                    return;
                                });
                            });
                    } catch (err) {
                        ret.error = true;
                        ret.message = err;
                        console.log(counter + " " + err);
                        callback291a2a("Error", res, ret);
                        return;
                    }
                }
            ],
            function (error, res, ret) {
                console.log("FERTIG WLVL");
                callback291(res, ret);
                return;
            });
    };


    /**
     * putHYGRISchunk - Verarbeiten bis 1 Mio Einträge in sortdata
     * @param {*} db
     * @param {*} async
     * @param {*} uihelper
     * @param {*} sys0000sys
     * @param {*} res
     * @param {*} ret
     * @param {*} chchunk1
     */
    kla1490srv.putHYGRISchunk = function (db, async, uihelper, sys0000sys, sortdata, res, ret, chchunk1) {

        var counter = 0;
        ret.vglstationid = "";
        var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        async.eachSeries(sortdata, function (data, nextdata) {
                counter++;
                // Daten in Puffer lesen, solange die Gruppe gleich ist - ganz schlicht, dann erst verarbeiten
                // der Puffer ist ret.datarecord, ganz schlicht
                if (data.messstelle_id === "messstelle_id") {
                    /**
                     * Prüfung auf ungültige Daten und Skip
                     */
                    nextdata();
                    return;
                } else if (data.datum_messung < '0') {
                    /**
                     * zum Testen Skip nach Vorgabe!!! - an delete o.a. Denken
                     * alte Messstelle: 081360034 19570402
                     */
                    nextdata();
                    return;
                } else if (ret.vglstationid === data.messstelle_id) {
                    /**
                     * Fortschreiben in Puffer ret.datarecord
                     */
                    kla1490srv.updatewlvl(mdtable, data, ret);
                    nextdata();
                    return;
                } else {
                    /**
                     * Ausgabe aus dem Puffer aufrufen und neuen Puffer aufbauen
                     */
                    ret.data = data;
                    ret.counter = counter;
                    kla1490srv.putHYGRIS(db, async, uihelper, sys0000sys, res, ret, function (res, ret1) {
                        /**
                         * Konsistenzcheck
                         */
                        if (ret.counter !== counter) {
                            throw new Error('Counter-Inkonsistenz:' + ret.counter + " zu " + counter);
                            process.exit();
                        }
                        /**
                         * neue Daten vorbereiten, wenn nicht vorhanden
                         */
                        if (Object.keys(ret1.datarecord).length === 0) {
                            console.log("neue Messstelle: " + data.messstelle_id + " " + data.datum_messung);
                            ret = {};
                            ret.vglstationid = data.messstelle_id;
                            ret.data = data;
                            ret.datarecord = {};
                            ret.datarecord.source = "HYGRIS";
                            ret.datarecord.stationid = data.messstelle_id;

                            ret.datarecord.variable = "WLVL";
                            ret.datarecord.years = {}; // wird am Schluss stringified
                            ret.datarecord.fromyear = null;
                            ret.datarecord.toyear = null;
                        } else {
                            console.log("alte Messstelle: " + data.messstelle_id + " " + data.datum_messung);
                            ret.datarecord = Object.assign({}, ret1.datarecord, true);
                            ret.vglstationid = data.messstelle_id;
                        }
                        kla1490srv.updatewlvl(mdtable, data, ret);
                        nextdata();
                        return;
                    });
                }
            },
            function (error) {
                // hier noch die letzte Gruppe Verarbeiten
                /**
                 * Ausgabe aus dem Puffer aufrufen und neuen Puffer aufbauen
                 */
                ret.data = {};
                ret.counter = counter;
                kla1490srv.putHYGRIS(db, async, uihelper, sys0000sys, res, ret, function (res, ret1) {
                    /**
                     * Konsistenzcheck
                     */
                    if (ret.counter !== counter) {
                        throw new Error('Counter-Inkonsistenz:' + ret.counter + " zu " + counter);
                        process.exit();
                    }
                    chchunk1(res, ret);
                    return;
                });
            });
    };



    /**
     * updatewlvl - Fortschreibung ein Tag in years in datarecord
     * @param {*} mdtable - hilfstabelle mit den Tagesanzahlen je Monat eines Jahres
     * @param {*} data - akutueller Satz mit Messdaten
     * @param {*} ret hat ret.datarecord - Zielsatz der stationid mit source und variable
     */
    kla1490srv.updatewlvl = function (mdtable, data, ret) {
        var datum = data.datum_messung;
        var wert = data.wasserstd_m;
        var year = datum.substr(0, 4);
        var month = datum.substr(4, 2);
        var day = datum.substr(6, 2);
        var tind = 0;
        if (typeof ret.datarecord.years === "string") {
            ret.datarecord.years = JSON.parse(ret.datarecord.years);
        }
        try {
            if (typeof ret.datarecord.years[year] === "undefined") {
                ret.datarecord.years[year] = [];
                if (uihelper.isleapyear(year)) {
                    ret.datarecord.years[year] = new Array(366).fill("");
                } else {
                    ret.datarecord.years[year] = new Array(365).fill("");
                }
            }
            if (uihelper.isleapyear(year)) {
                mdtable[1] = 29;
            } else {
                mdtable[1] = 28;
            }
            var baseday = 0;
            for (var imon = 0; imon < (month - 1); imon++) {
                baseday += mdtable[imon];
            }
            tind = baseday + parseInt(day) - 1;
            if (ret.datarecord.fromyear === null) {
                ret.datarecord.fromyear = year;
            } else if (year < ret.datarecord.fromyear) {
                ret.datarecord.fromyear = year;
            }
            if (ret.datarecord.toyear === null) {
                ret.datarecord.toyear = year;
            } else if (year > ret.datarecord.toyear) {
                ret.datarecord.toyear = year;
            }
            ret.datarecord.years[year][tind] = wert;
        } catch (err) {
            console.log(data);
            console.log("Tagesindex:" + tind + " zu Datum:" + datum);
            console.log(err);
        }
    };






    kla1490srv.putHYGRIS = function (db, async, uihelper, sys0000sys, res, ret, callback291b) {
        console.log("Abschluss zu: " + ret.vglstationid);
        db.serialize(function () {
            async.waterfall([
                function (callback291b1) {
                    /**
                     * KLISTATIONS lesen
                     */
                    if (ret.vglstationid.length === 0) {
                        callback291b1(null, res, ret);
                        return;
                    }
                    // Feststellen, ob schon ein alter Datensatz da ist
                    var reqparm = {
                        sel: {
                            source: "HYGRIS",
                            stationid: ret.vglstationid
                        },
                        projection: {},
                        table: "KLISTATIONS"
                    };
                    sys0000sys.getonerecord(db, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            ret.error = false;
                            ret.message = "no KLISTATIONS/Error" + ret1.message;
                            ret.stationinitialize = true;
                            ret.stationrecord = {};
                            callback291b1(null, res, ret);
                            return;
                        } else if (typeof ret1.record !== "undefined" && ret1.record !== null && Object.keys(ret1.record).length > 0) {
                            ret.error = false;
                            ret.message = "KLISTATIONS found";
                            ret.stationinitialize = false;
                            ret.stationrecord = Object.assign({}, ret1.record); // fullcopy
                            callback291b1(null, res, ret);
                            return;
                        } else {
                            ret.error = false;
                            ret.message = "no old KLISTATIONS record";
                            ret.stationinitialize = true;
                            ret.klistationrecord = {};
                            callback291b1(null, res, ret);
                            return;
                        }
                    });
                },
                function (res, ret, callback291b3b) {
                    /**
                     * KLISTATIONS - NRWSTATIONS übernehmen, wenn KLISTATIONS nicht vorhanden
                     */
                    if (ret.vglstationid.length === 0) {
                        callback291b3b(null, res, ret);
                        return;
                    }
                    ret.stationwrite = false;
                    if (ret.stationinitialize === false) {
                        callback291b3b(null, res, ret);
                        return;
                    } else {
                        // Feststellen, ob schon ein alter Datensatz da ist
                        var reqparm = {
                            sel: {
                                messstelle_id: ret.vglstationid
                            },
                            projection: {},
                            table: "NRWSTATIONS"
                        };
                        sys0000sys.getonerecord(db, async, null, reqparm, res, function (res, ret1) {
                            if (ret1.error === true) {
                                ret.error = false;
                                ret.message = "no old NRWSTATIONS-record" + ret1.message;
                                ret.stationinitialize = true;
                                callback291b3b(null, res, ret);
                                return;
                            } else if (typeof ret1.record !== "undefined" && ret1.record !== null && Object.keys(ret1.record).length > 0) {
                                ret.error = false;
                                ret.message = "NRWSTATIONS-record found";
                                ret.stationinitialize = false;
                                ret.stationwrite = true;
                                ret.stationrecord = {};
                                ret.stationrecord.source = "HYGRIS";
                                ret.stationrecord.stationid = ret.datarecord.stationid;
                                ret.stationrecord.stationname = ret1.record.name;
                                ret.stationrecord.temperature = "WLVL";
                                // ;"e32";"n32" Ortskoordinaten, Bsp: "2935xx";"56452xx"; für Unschärfe von Privatgrund
                                var coord = uihelper.convertETRS89UTM("e32", ret1.record.e32, "n32", ret1.record.n32);
                                if (coord.error === false) {
                                    ret.stationrecord.longitude = coord.longitude;
                                    ret.stationrecord.latitude = coord.latitude;

                                    var cont = uihelper.getContinent(coord.longitude, coord.latitude);
                                    if (cont.error === false) {
                                        ret.stationrecord.continent = cont.continentcode;
                                        ret.stationrecord.continentname = cont.continentname;
                                    }
                                    var climatezone = uihelper.getClimateZone(coord.latitude);
                                    ret.stationrecord.climatezone = climatezone.value;
                                    if (crg === null) {
                                        crg = require('country-reverse-geocoding').country_reverse_geocoding();
                                    }
                                    /**
                                     * Land aufgrund latitude/longitude bestimmen
                                     */
                                    var country = crg.get_country(coord.latitude, coord.longitude);
                                    if (typeof country !== "undefined" && country !== null) {
                                        ret.stationrecord.alpha3 = country.code;
                                        ret.stationrecord.countryname = country.name;
                                        var countrydata = countries[country.code];

                                        if (typeof countrydata !== "undefined" && countrydata !== null) {
                                            delete countrydata.history;
                                            delete countrydata.tsserverupd;
                                            delete countrydata.iostatus;
                                            delete countrydata._id;
                                            ret.stationrecord = Object.assign(ret.stationrecord, countrydata);
                                        }
                                    }
                                }
                                callback291b3b(null, res, ret);
                                return;
                            } else {
                                ret.error = false;
                                ret.message = "no old record";
                                // TODO: hier kann es eigenlich nicht weitergehen!!!
                                ret.stationinitialize = false;
                                ret.stationrecord = {};
                                callback291b3b(null, res, ret);
                                return;
                            }
                        });
                    }
                },
                function (res, ret, callback291b3c) {
                    /**
                     * Schreiben KLISTATIONS aus ret.stationrecord
                     */
                    if (ret.vglstationid.length === 0) {
                        callback291b3c(null, res, ret);
                        return;
                    }
                    if (ret.stationwrite === false) {
                        callback291b3c(null, res, ret);
                        return;
                    } else {
                        var reqparm = {};
                        reqparm.selfields = {
                            source: "HYGRIS",
                            stationid: ret.stationrecord.stationid
                        };
                        var updstation = Object.assign({}, ret.stationrecord, true);
                        delete updstation.source;
                        delete updstation.stationid;

                        reqparm.updfields = {};
                        reqparm.updfields["$setOnInsert"] = {
                            source: "HYGRIS",
                            stationid: ret.stationrecord.stationid
                        };
                        reqparm.updfields["$set"] = updstation;
                        reqparm.table = "KLISTATIONS";
                        sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                            callback291b3c(null, res, ret);
                            return;
                        });
                    }
                },
                function (res, ret, callback291b3a) {
                    if (ret.vglstationid.length === 0) {
                        callback291b3a(null, res, ret);
                        return;
                    }

                    // finale Rechnungen
                    ret.datarecord.anzyears = parseInt(ret.datarecord.toyear) - parseInt(ret.datarecord.fromyear) + 1;
                    //ret.datarecord.years = JSON.stringify(ret.datarecord.years);
                    if (typeof ret.datarecord.years === "object") {
                        ret.datarecord.years = JSON.stringify(ret.datarecord.years);
                    }
                    // Ausgabe Daten der Station - asynchron, etwas "kriminell"
                    var reqparm = {};
                    reqparm.selfields = {
                        source: ret.datarecord.source,
                        stationid: ret.datarecord.stationid,
                        variable: "WLVL"
                    };
                    reqparm.updfields = {};
                    reqparm.updfields["$setOnInsert"] = reqparm.selfields;
                    var updrecord = {
                        fromyear: ret.datarecord.fromyear,
                        toyear: ret.datarecord.toyear,
                        longitude: ret.stationrecord.longitude,
                        latitude: ret.stationrecord.latitude
                    };
                    reqparm.updfields["$set"] = updrecord;
                    reqparm.table = "KLIINVENTORY";
                    sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            console.log(ret.vglstationid + " ERROR " + ret1.message);
                            ret.error = false;
                            ret.message = "ERROR:" + ret1.message;
                            callback291b3a(null, res, ret);
                            return;
                        } else {
                            ret.error = false;
                            ret.message = "process";
                            callback291b3a(null, res, ret);
                            return;
                        }
                    });
                },
                function (res, ret, callback291b2) {
                    /**
                     * Gruppenwechsel, Nachlauf KLIDATA, wenn nicht erster Satz
                     */
                    if (ret.vglstationid.length === 0) {
                        callback291b2(null, res, ret);
                        return;
                    }
                    var reqparm = {};
                    reqparm.selfields = {
                        source: ret.datarecord.source,
                        stationid: ret.datarecord.stationid,
                        variable: "WLVL"
                    };
                    reqparm.updfields = {};
                    reqparm.updfields["$setOnInsert"] = reqparm.selfields;
                    var updrecord = ret.datarecord;
                    delete ret.datarecord.source;
                    delete ret.datarecord.stationid;
                    delete ret.datarecord.variable;
                    reqparm.updfields["$set"] = ret.datarecord;
                    reqparm.table = "KLIDATA";
                    sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            console.log(ret.vglstationid + " ERROR " + ret1.message);
                            ret.error = false;
                            ret.message = "ERROR:" + ret1.message;
                            callback291b2(null, res, ret);
                            return;
                        } else {
                            ret.error = false;
                            ret.message = "process";
                            callback291b2(null, res, ret);
                            return;
                        }
                    });
                },
                function (res, ret, callback291b3d) {
                    /**
                     * Vorlauf KLIDATA zu ret.data
                     */
                    // Feststellen, ob schon ein alter Datensatz da ist
                    if (Object.keys(ret.data).length > 0) {
                        var reqparm = {
                            sel: {
                                source: "HYGRIS",
                                stationid: ret.data.messstelle_id,
                                variable: "WLVL"
                            },
                            projection: {},
                            table: "KLIDATA"
                        };
                        sys0000sys.getonerecord(db, async, null, reqparm, res, function (res, ret1) {
                            if (ret1.error === true) {
                                ret.error = false;
                                ret.message = "no KLIDATA/Error" + ret1.message;
                                ret.initialize = true;
                                ret.datarecord = {};
                                callback291b3d(null, res, ret);
                                return;
                            } else if (typeof ret1.record !== "undefined" && ret1.record !== null && Object.keys(ret1.record).length > 0) {
                                ret.error = false;
                                ret.message = "KLIDATA found";
                                ret.itialize = false;
                                ret.datarecord = Object.assign({}, ret1.record); // fullcopy
                                callback291b3d(null, res, ret);
                                return;
                            } else {
                                ret.error = false;
                                ret.message = "no old KLIDATA record";
                                ret.initialize = true;
                                ret.datarecord = {};
                                callback291b3d(null, res, ret);
                                return;
                            }
                        });
                    } else {
                        callback291b3d(null, res, ret);
                        return;
                    }
                }
            ], function (error, res, ret) {
                if (typeof ret.vglstationid === "undefined" || ret.vglstationid === null) {
                    console.log("verschwunden vglstationid");
                }
                callback291b(res, ret);
                return;
            });
        });
        // console.log(counter + JSON.stringify(data));
    };




    /**
     * ghcndcomplete - GHCN daily-Aufbereitung
     * Vorgabe ist fullname von ghcnd-stations.txt
     * damit wird KLISTATIONS fortgeschrieben, die +.dly-Files werden hier NICHT geladen
     * @param {*} gblInfo
     * @param {*} db
     * @param {*} fs
     * @param {*} path
     * @param {*} rootname
     * @param {*} async
     * @param {*} stream
     * @param {*} StreamZip
     * @param {*} readline
     * @param {*} sys0000sys
     * @param {*} req
     * @param {*} res
     * returns function (res, ret)
     */
    kla1490srv.ghcndcomplete = function (gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, res, callback290) {
        async.waterfall([
                function (callback290a) {
                    /**
                     * Dateinamen bereitstellen
                     */
                    var fullname = "";
                    if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
                        fullname = req.query.fullname;
                    }
                    var source = "";
                    if (req.query && typeof req.query.source !== "undefined" && req.query.source.length > 0) {
                        source = req.query.source;
                    }
                    var selyears = "";
                    if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
                        selyears = req.query.selyears;
                    }
                    if (!fs.existsSync(fullname)) {
                        callback290a("Error", res, {
                            error: false,
                            message: fullname + " nicht auf dem Server vorhanden"
                        });
                        return;
                    }
                    var stationfilter = "";
                    if (req.query && typeof req.query.extraParam !== "undefined" && req.query.extraParam.length > 0) {
                        stationfilter = JSON.parse(req.query.extraParam).stationfilter;
                    }
                    var ret = {};
                    ret.fullname = fullname;
                    ret.fullnamestations = fullname;
                    ret.dirname = path.dirname(fullname);
                    ret.source = source;
                    ret.selyears = selyears;
                    ret.stationfilter = stationfilter;
                    callback290a(null, res, ret);
                    return;
                },
                function (res, ret, callback290b) {
                    /**
                     * KLICOUNTRIES neu aufbauen aus ghcnd-countries.txt
                     */
                    var couschema = [{
                            name: "countrycode", // "GM",
                            von: "1",
                            bis: "2",
                            type: "String"
                        },
                        {
                            name: "skip1", // Leerstelle
                            von: "3",
                            bis: "3",
                            type: "String"
                        },
                        {
                            name: "countryname", // "Germany"
                            von: "4",
                            bis: "53",
                            type: "String"
                        }
                    ];
                    var countryfilename = path.join(ret.dirname, "ghcnd-countries.txt");
                    ret.countryfilename = countryfilename;
                    if (!fs.existsSync(countryfilename)) {
                        callback290b("Error", res, {
                            error: true,
                            message: "Datei nicht gefunden:" + countryfilename
                        });
                        return;
                    }
                    /**
                     * Lesen ghcnd-countries.txt und Update KLICOUNTRIES
                     */
                    var counter = 0;
                    var html = "";
                    ret.countries = {};

                    var rl = new LineByLineReader(ret.countryfilename);
                    // event is emitted after each line
                    rl.on('line', function (line) {
                        var that = this;
                        rl.pause();
                        counter++;
                        var courecord = {};
                        for (var i = 0; i < couschema.length; i++) {
                            var val1 = line.substring(couschema[i].von - 1, couschema[i].bis).trim();
                            var fld1 = couschema[i].name;
                            courecord[fld1] = val1;
                        }
                        ret.countries[courecord.countrycode] = courecord.countryname;
                        var reqparm = {};
                        reqparm.selfields = {
                            countrycode: courecord.countrycode
                        };
                        reqparm.updfields = {};
                        reqparm.updfields["$setOnInsert"] = {
                            countryname: courecord.countryname
                        };
                        reqparm.updfields["$set"] = {};
                        reqparm.table = "KLICOUNTRIES";
                        sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                            rl.resume(); // holt den nächsten Satz, auch aus waterfall
                        });
                    });
                    // end - line-by-line davor war es close
                    rl.on('end', function (line) {
                        console.log('Total lines : ' + counter);
                        ret.message += " KLICOUNTRIES:" + counter;
                        callback290b(null, res, ret);
                        return;
                    });
                },


                function (res, ret, callback290c) {
                    /**
                     * Lesen countrycodes für die Zuordnung, return in ret1.data
                     */
                    var countrycodename = path.join(ret.dirname, "countrycodes.csv");
                    ret.countrycodes = {};
                    sys0000sys.importcsv2JSON(countrycodename, "alpha2", res, function (res, ret1) {
                        ret.countrycodes = ret1.data;
                        callback290c(null, res, ret);
                        return;
                    });
                },


                function (res, ret, callback290c1) {
                    /**
                     * Lesen countrycodes für die Zuordnung, return in ret1.data
                     */
                    var countrycodename = path.join(ret.dirname, "countrycodes.csv");
                    ret.countrycodes3 = {};
                    sys0000sys.importcsv2JSON(countrycodename, "alpha3", res, function (res, ret1) {
                        ret.countrycodes3 = ret1.data;
                        callback290c1(null, res, ret);
                        return;
                    });
                },


                function (res, ret, callback290d) {
                    /**
                     * Lesen ghncd-stations.txt und Update KLISTATIONS
                     */
                    var invschema = [{
                            name: "stationid", // "GM000003319",
                            von: "1",
                            bis: "11",
                            type: "String"
                        },
                        {
                            name: "latitude", //  "  52.4639" - Berlin
                            von: "13",
                            bis: "20",
                            type: "String"
                        },
                        {
                            name: "longitude", //  "   13.3017" Berlin
                            von: "22",
                            bis: "30",
                            type: "String"
                        },
                        {
                            name: "height", //  "   51.0" Berlin
                            von: "32",
                            bis: "37",
                            type: "String"
                        },
                        {
                            name: "state", //  "    " Berlin
                            von: "39",
                            bis: "40",
                            type: "String"
                        },
                        {
                            name: "stationname", //  "    " Berlin
                            von: "42",
                            bis: "71",
                            type: "String"
                        },
                        {
                            name: "GSN", //  Flas
                            von: "73",
                            bis: "75",
                            type: "String"
                        },
                        {
                            name: "HCN_CRN", //  Flag
                            von: "77",
                            bis: "79",
                            type: "String"
                        },
                        {
                            name: "WMO_ID", //  Flag
                            von: "81",
                            bis: "85",
                            type: "String"
                        }
                    ];
                    var counter = 0;
                    var linestartts = new Date();
                    var lineendts = 0;
                    var html = "";
                    ret.stations = {};
                    var rl = new LineByLineReader(ret.fullnamestations);
                    var stationnr = 0;
                    // event is emitted after each line
                    rl.on('line', function (line) {
                        var that = this;
                        rl.pause();
                        counter++;
                        var invrecord = {};
                        for (var i = 0; i < invschema.length; i++) {
                            var val1 = line.substring(invschema[i].von - 1, invschema[i].bis).trim();
                            var fld1 = invschema[i].name;
                            invrecord[fld1] = val1;
                        }
                        if (ret.stationfilter.length > 0) {
                            if (!invrecord.stationid.startsWith(ret.stationfilter)) {
                                rl.resume();
                                return;
                            }
                        }
                        var lat = invrecord.latitude;
                        var latobj = kla9020fun.getlatfieldsp(lat);
                        invrecord.latn = latobj.latn;
                        invrecord.lats = latobj.lats;
                        // ret.stations[invrecord.stationid] = invrecord;
                        /**
                         * contry festellen und Datenkomplettierung
                         */
                        var alpha2 = invrecord.stationid.substr(0, 2);
                        if (alpha2 === "GM") alpha2 = "DE"; // nach ISO, das ist in den Daten falsch!!!
                        if (alpha2 === "AJ") alpha2 = "AZ"; // nach ISO, das ist in den Daten falsch!!!                        invrecord.alpha2 = alpha2;
                        if (crg === null) {
                            crg = require('country-reverse-geocoding').country_reverse_geocoding();
                        }
                        /**
                         * Land aufgrund latitude/longitude bestimmen
                         */
                        var country = crg.get_country(parseFloat(invrecord.latitude), parseFloat(invrecord.longitude));
                        if (typeof country !== "undefined" && country !== null) {
                            invrecord.alpha3 = country.code;
                            invrecord.countryname = country.name;
                            var countrydata = ret.countries[country.code];
                            if (typeof countrydata !== "undefined" && countrydata !== null) {
                                stationnr++;
                                delete countrydata.history;
                                delete countrydata.tsserverupd;
                                delete countrydata._id;
                                invrecord = Object.assign(invrecord, countrydata);
                            }
                        }
                        if (typeof ret.countrycodes[alpha2] !== "undefined") {
                            // name,alpha2,alpha3,countrycode,iso_31662,region,subregion,intermediateregion,regioncode,subregioncode,intermediateregioncode
                            delete ret.countrycodes[alpha2].tsserverupd;
                            delete ret.countrycodes[alpha2].iostatus;
                            var countryname = ret.countrycodes[alpha2].countryname;
                            if (typeof countryname === "undefined") {
                                countryname = ret.countrycodes[alpha2].name;
                                delete ret.countrycodes[alpha2].name;
                                ret.countrycodes[alpha2].countryname = countryname;
                            }
                            invrecord = Object.assign(invrecord, ret.countrycodes[alpha2]);
                        }
                        if (typeof invrecord.region === "undefined" || invrecord.region === null || invrecord.region.length === 0) {
                            var alpha3 = invrecord.stationid.substr(0, 3);
                            if (typeof ret.countrycodes3[alpha3] !== "undefined") {
                                // name,alpha2,alpha3,countrycode,iso_31662,region,subregion,intermediateregion,regioncode,subregioncode,intermediateregioncode
                                delete ret.countrycodes3[alpha3].tsserverupd;
                                delete ret.countrycodes3[alpha3].iostatus;
                                var countryname = ret.countrycodes3[alpha3].countryname;
                                if (typeof countryname === "undefined") {
                                    countryname = ret.countrycodes3[alpha3].name;
                                    delete ret.countrycodes3[alpha3].name;
                                    ret.countrycodes3[alpha3].countryname = countryname;
                                }
                                invrecord = Object.assign(invrecord, ret.countrycodes3[alpha3]);
                            }
                        }
                        if (typeof invrecord.countryname === "undefined" || invrecord.countryname.length === 0) {
                            if (typeof ret.countries[alpha2] !== "undefined") {
                                invrecord.countryname = ret.countries[alpha2];
                            }
                        }
                        var countrydata1 = global.countries[alpha2];
                        if (typeof countrydata1 !== "undefined") {
                            if (typeof invrecord.countryname === "undefined" || invrecord.countryname === null || invrecord.countryname.length === 0) {
                                invrecord.countryname = countrydata1.name;
                            }
                            var continentdata1 = global.continents[countrydata1.continent] || "";
                            if (continentdata1.length > 0) {
                                invrecord.continent = countrydata1.continent;
                                invrecord.continentname = continentdata1;
                                if (typeof invrecord.region === "undefined" || invrecord.region === null || invrecord.region.length === 0) {
                                    invrecord.region = invrecord.continentname;
                                }
                            }
                        }
                        if (counter % 100 === 0) {
                            var logmsg = counter + "/" + invrecord.stationid + " " + invrecord.stationname;
                            if (typeof invrecord.countryname !== "undefined") {
                                logmsg += "=>" + invrecord.countryname + " ";
                                // console.log(logmsg);
                            } else {
                                logmsg += "=>Keine Region-Data";
                                console.log(logmsg);
                            }
                        }
                        /**
                         * Klimazone bestimmen
                         */
                        var vgllat = parseFloat(invrecord.latitude);
                        if (vgllat > 60) {
                            invrecord.climatezone = "N0-North Cold 60-90";
                        } else if (vgllat > 40) {
                            invrecord.climatezone = "N1-North Moderate 40-60";
                        } else if (vgllat > 23.5) {
                            invrecord.climatezone = "N2-North Subtrop 23,5-40";
                        } else if (vgllat > 0) {
                            invrecord.climatezone = "N3-North Tropic 0-23,5";
                        } else if (vgllat < -60) {
                            invrecord.climatezone = "S0-South Cold 60-90";
                        } else if (vgllat < -40) {
                            invrecord.climatezone = "S1-South Moderate 40-60";
                        } else if (vgllat < -23.5) {
                            invrecord.climatezone = "S2-South Subtrop 23,5-40";
                        } else {
                            invrecord.climatezone = "S3-South Tropic 0-23,5";
                        }
                        var reqparm = {};
                        reqparm.selfields = {
                            source: ret.source,
                            stationid: invrecord.stationid
                        };
                        reqparm.updfields = {};
                        reqparm.updfields["$setOnInsert"] = {
                            source: ret.source,
                            stationid: invrecord.stationid
                        };
                        //delete invrecord.source;
                        //delete invrecord.stationid;
                        delete invrecord.history;
                        reqparm.updfields["$set"] = invrecord;
                        reqparm.table = "KLISTATIONS";
                        sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret) {
                            lineendts = new Date();
                            if (counter % 100 === 0) {
                                console.log(">" + counter + ". line:" + (lineendts - linestartts) + " ms");
                            }
                            linestartts = lineendts;
                            rl.resume(); // holt den nächsten Satz, auch aus waterfall
                        });
                    });
                    // end - line-by-line davor war es close
                    rl.on('end', function (line) {
                        console.log('Total lines : ' + counter);
                        ret.message += " KLISTATION:" + counter;
                        callback290d("Finish", res, ret);
                        return;
                    });
                },
                function (res, ret, callback290g) {
                    /**
                     * KLICOUNTRIES laden
                     */
                    var reqparm = {};
                    reqparm.table = "KLICOUNTRIES";
                    reqparm.sel = {};
                    reqparm.projection = {};
                    sys0000sys.getallrecords(db, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            ret.message += " keine KLICOUNTRIES:" + ret1.message;
                            ret.countries = {};
                            callback290g(null, res, ret);
                            return;
                        } else {
                            if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                                ret.countries = {};
                                for (var recordind in ret1.records) {
                                    var record = ret1.records[recordind];
                                    var alpha3 = record.alpha3;
                                    delete record.history;
                                    var countryname = record.name;
                                    delete record.name;
                                    record.countryname = countryname;
                                    ret.countries[alpha3] = record;
                                }
                                callback290g(null, res, ret);
                                return;
                            } else {
                                ret.message += " keine KLICOUNTRIES";
                                ret.countries = {};
                                callback290g(null, res, ret);
                                return;
                            }
                        }
                    });
                }
            ],
            function (error, res, ret) {
                callback290(res, ret);
                return;
            });
    };

    /**
     * für alle stationid's aus KLISTATIONS der source die Daten aufbereiten
     */
    kla1490srv.ghcndall = function (gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, res, callback370) {
        /**
         * Dateinamen bereitstellen
         */
        var fullname = "";
        if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
            fullname = req.query.fullname;
        }
        var source = "";
        if (req.query && typeof req.query.source !== "undefined" && req.query.source.length > 0) {
            source = req.query.source;
        }
        actsource = source;
        var stationid = "";
        if (req.query && typeof req.query.stationid !== "undefined" && req.query.stationid.length > 0) {
            stationid = req.query.stationid;
        }
        var stationids = "";
        if (req.query && typeof req.query.stationids !== "undefined" && req.query.stationids.length > 0) {
            stationids = req.query.stationids;
        }
        var selyears = "";
        if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
            selyears = req.query.selyears;
        }
        var reqparm = {};
        reqparm.table = "KLISTATIONS";
        reqparm.sel = {
            source: source
        };
        reqparm.projection = {
            source: 1,
            stationid: 1,
            temperature: 1
        };
        reqparm.sort = [];
        reqparm.sort.push(
            ["source", "asc"], ["stationid", "asc"]
        );
        /**
         * Reparatur
         */
        reqparm = {};
        reqparm.table = "";
        reqparm.sel = "SELECT source, stationid, variable, count(*) AS ZAHL FROM KLIDATA ";
        reqparm.sel += " GROUP BY source, stationid, variable";
        reqparm.sel += " HAVING ZAHL > 1";
        reqparm.sel += " ORDER BY source, stationid, variable";
        var korrektur = true;

        sys0000sys.getallrecords(db, async, null, reqparm, res, function (res, ret1) {
            if (ret1.error === true) {
                var ret = {};
                ret.message += " keine KLISTATIONS:" + ret1.message;
                ret.countries = {};
                callback370(res, ret);
                return;
            } else {
                if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                    var stationids = [];
                    var statistik = {
                        unverarbeitet: 0,
                        verarbeitet: {}
                    }
                    for (var irec = 0; irec < ret1.records.length; irec++) {
                        if (korrektur === true) {
                            stationids.push(ret1.records[irec].stationid);
                            statistik.unverarbeitet += 1;
                        } else if (typeof ret1.records[irec].temperature === "undefined" || ret1.records[irec].temperature === null || typeof ret1.records[irec].temperature === "string" && ret1.records[irec].temperature.length === 0) {
                            stationids.push(ret1.records[irec].stationid);
                            statistik.unverarbeitet += 1;
                        } else {
                            var status = ret1.records[irec].temperature;
                            if (typeof statistik.verarbeitet[status] === "undefined") {
                                statistik.verarbeitet[status] = 0;
                            } else {
                                statistik.verarbeitet[status] += 1;
                            }
                        }
                    }
                    console.log(JSON.stringify(statistik, null, " "));
                    reqparm.fullname = fullname;
                    reqparm.source = source;
                    reqparm.stationid = stationid;
                    reqparm.stationids = stationids;
                    reqparm.years = selyears;
                    reqparm.statistik = statistik;
                    kla1490srv.ghcnddata(gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, null, reqparm, res, function (res, ret) {
                        callback370(res, ret);
                        return;
                    });
                } else {
                    var ret = {};
                    ret.message += " keine KLISTATIONS:" + ret1.message;
                    ret.countries = {};
                    callback370(res, ret);
                    return;
                }
            }
        });
    };



    /**
     * ghcndinventory - GHCN daily-Aufbereitung ghcnd-inventory.txt
     * Vorgabe ist fullname von ghcnd-inventory.txt
     * damit wird KLIINVENTORY fortgeschrieben, die +.dly-Files werden hier NICHT geladen
     * @param {*} gblInfo
     * @param {*} db
     * @param {*} fs
     * @param {*} path
     * @param {*} rootname
     * @param {*} async
     * @param {*} stream
     * @param {*} StreamZip
     * @param {*} readline
     * @param {*} sys0000sys
     * @param {*} req
     * @param {*} res
     * returns function (res, ret)
     */
    kla1490srv.ghcndinventory = function (gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, res, callback290) {
        async.waterfall([
                function (callback290a) {
                    /**
                     * Dateinamen bereitstellen
                     */
                    var fullname = "";
                    if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
                        fullname = req.query.fullname;
                    }
                    var source = "";
                    if (req.query && typeof req.query.source !== "undefined" && req.query.source.length > 0) {
                        source = req.query.source;
                    }
                    var selyears = "";
                    if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
                        selyears = req.query.selyears;
                    }
                    if (!fs.existsSync(fullname)) {
                        callback290a("Error", res, {
                            error: false,
                            message: fullname + " nicht auf dem Server vorhanden"
                        });
                        return;
                    }
                    var stationfilter = "";
                    if (req.query && typeof req.query.extraParam !== "undefined" && req.query.extraParam.length > 0) {
                        stationfilter = JSON.parse(req.query.extraParam).stationfilter;
                    }
                    var ret = {};
                    ret.fullname = fullname;
                    ret.fullnamestations = fullname;
                    ret.dirname = path.dirname(fullname);
                    ret.source = source;
                    ret.selyears = selyears;
                    ret.stationfilter = stationfilter;
                    callback290a(null, res, ret);
                    return;
                },
                function (res, ret, callback290b) {
                    /**
                     * KLIINVENTORY neu aufbauen aus ghcnd-inventory.txt
                     *          1         1         1         1
                     * 12345678901234567890123456789012345678901234567890
                     * ACW00011604  17.1167  -61.7833 TMAX 1949 1949
                     * ACW00011604  17.1167  -61.7833 TMIN 1949 1949
                     * als Zusatzfeld wird source = GHCND zugefügt
                     */
                    var invschema = [{
                            name: "stationid", //
                            von: "1",
                            bis: "12",
                            type: "String"
                        },
                        {
                            name: "skip1", // Leerstelle
                            von: "13",
                            bis: "13",
                            type: "String"
                        },
                        {
                            name: "longitude", // "Longitude"
                            von: "14",
                            bis: "20",
                            type: "String"
                        },
                        {
                            name: "skip2", // Leerstelle
                            von: "21",
                            bis: "21",
                            type: "String"
                        },
                        {
                            name: "latitude", // "Latitude"
                            von: "22",
                            bis: "30",
                            type: "String"
                        },
                        {
                            name: "skip3", // Leerstelle
                            von: "31",
                            bis: "31",
                            type: "String"
                        },
                        {
                            name: "variable", // variable-Name
                            von: "32",
                            bis: "35",
                            type: "String"
                        },
                        {
                            name: "skip4", // Leerstelle
                            von: "36",
                            bis: "36",
                            type: "String"
                        }, {
                            name: "fromyear", //
                            von: "37",
                            bis: "40",
                            type: "String"
                        }, {
                            name: "skip5", // Leerstelle
                            von: "41",
                            bis: "41",
                            type: "String"
                        }, {
                            name: "toyear", //
                            von: "42",
                            bis: "45",
                            type: "String"
                        }
                    ];
                    var inventoryfilename = path.join(ret.dirname, "ghcnd-inventory.txt");
                    ret.inventoryfilename = inventoryfilename;
                    if (!fs.existsSync(inventoryfilename)) {
                        callback290b("Error", res, {
                            error: true,
                            message: "Datei nicht gefunden:" + inventoryfilename
                        });
                        return;
                    }
                    /**
                     * Lesen ghcnd-inventory.txt und Update KLIINVENTORY
                     */
                    var counter = 0;
                    var html = "";
                    var rl = new LineByLineReader(ret.inventoryfilename);
                    // event is emitted after each line
                    rl.on('line', function (line) {
                        var that = this;
                        rl.pause();
                        counter++;
                        var invrecord = {};
                        for (var i = 0; i < invschema.length; i++) {
                            var val1 = line.substring(invschema[i].von - 1, invschema[i].bis).trim();
                            var fld1 = invschema[i].name;
                            invrecord[fld1] = val1.trim();
                        }
                        var reqparm = {};
                        var stationid = invrecord.stationid;
                        var variable = invrecord.variable;
                        var fromyear = invrecord.fromyear;
                        delete invrecord.stationid;
                        delete invrecord.variable;
                        delete invrecord.fromyear;
                        delete invrecord.skip1;
                        delete invrecord.skip2;
                        delete invrecord.skip3;
                        delete invrecord.skip4;
                        delete invrecord.skip5;
                        reqparm.selfields = {
                            source: "GHCND",
                            stationid: stationid,
                            variable: variable,
                            fromyear: fromyear
                        };
                        reqparm.updfields = {};
                        reqparm.updfields["$setOnInsert"] = {
                            source: "GHCND",
                            stationid: stationid,
                            variable: variable,
                            fromyear: fromyear
                        };
                        reqparm.updfields["$set"] = invrecord;
                        reqparm.table = "KLIINVENTORY";
                        sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                            if (counter > 1000) {
                                if (counter % 2000 === 0) console.log("KLIINVENTORY:" + counter);
                            } else {
                                if (counter % 100 === 0) console.log("KLIINVENTORY:" + counter);
                            }
                            rl.resume(); // holt den nächsten Satz, auch aus waterfall
                        });
                    });
                    // end - line-by-line davor war es close
                    rl.on('end', function (line) {
                        console.log('Total lines : ' + counter);
                        ret.message += " KLIINVENTORY:" + counter;
                        callback290b("Finish", res, ret);
                        return;
                    });
                }

            ],
            function (error, res, ret) {
                callback290(res, ret);
                return;
            });
    };




    /**
     * get Daily Data for Stations GHCND
     */
    /**
     * datfilename - datschema ASCII fix
     * 1234567890123456789012345678901234567890123456789012345678901234567890
     * 101603550001995TMIN-9999   -9999     980  G 1100  G 1700  G 1910  G 2160  G-9999    2040  G-9999    1380  G 1230  G
     * 101603550001996TMIN-9999   -9999    1100  G 1270  G 1490  G 1820  G 2110  G 2280  G 1850  G 1490  G 1310  G 1140  G
     * 425000406931966TMIN  567  U  584  U  760  U  966  U  997  U 1105c U-9999   -9999    1229b U 1128  U  927  U  597  U
     * 133610990002010TMIN 1950  K-9999    2670  K-9999    2750  K-9999   -9999   -9999    2340  K 2380  K-9999   -9999
     */
    /*
    ------------------------------
    Variable   Columns  Len Type
    ------------------------------
    ID            1-11  11  Character
    YEAR         12-15   4  Integer
    MONTH        16-17   2  Integer
    ELEMENT      18-21   4  Character
    VALUE1       22-26   5  Integer
    MFLAG1       27-27   1  Character
    QFLAG1       28-28   1  Character
    SFLAG1       29-29   1  Character
    bis 31
    */
    var dayschema1 = [{
            name: "stationid", // "ID",
            von: "1",
            bis: "11",
            type: "Integer" // Integer hat 2 Stellen Präfix GM
        },
        {
            name: "year", // "YEAR",
            von: "12",
            bis: "15",
            type: "Integer"
        },
        {
            name: "month", // "MONTH",
            von: "16",
            bis: "17",
            type: "Integer"
        },
        {
            name: "variable", // "ELEMENT",
            von: "18",
            bis: "21",
            type: "Character"
        }
    ];
    /**
     * 31 Buckets für 31 Tage eines Monats
     */
    var dayschema2 = [{
            name: "value", // "VALUE",
            length: "5",
            type: "Integer"
        },
        {
            name: "DMFLAG",
            length: "1",
            type: "Character"
        },
        {
            name: "QCFLAG",
            length: "1",
            type: "Character"
        },
        {
            name: "DSFLAG",
            length: "1",
            type: "Character"
        }
    ];

    /**
     * ghcnddata - GHCN daily-Aufbereitung Tagesdaten
     * Vorgabe ist fullname von ghcnd-stations.txt, ist dies nicht vorgegeben,
     * dann wird die u.a. Verzeichnishierarchie genutzt für das finden der *.dly-Files
     * *.dly-Files sind abgeleitet aus stationid und Suffix .dly
     * Mit diesen Daten wird KLIDATA fortgeschrieben,
     * anschliessend werden die entpackten Dateien bearbeitet:
     * G:\Projekte\klimadaten\IPCC-GHCN-Daily\
     * G:\Projekte\klimadaten\IPCC-GHCN-Daily\ghcnd-stations.txt
     * G:\Projekte\klimadaten\IPCC-GHCN-Daily\ => ghcnd_all.tar\ghcnd_all\ghcnd_all => *.dly-Files
     * @param {*} gblInfo
     * @param {*} db
     * @param {*} fs
     * @param {*} path
     * @param {*} rootname
     * @param {*} async
     * @param {*} stream
     * @param {*} StreamZip
     * @param {*} readline
     * @param {*} sys0000sys
     * @param {*} req
     * @param {*} res
     * returns function (res, ret)
     */
    var actsource = "";
    kla1490srv.ghcnddata = function (gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, reqparm, res, callback390) {
        var vglstationid = "";
        stationdata = [];

        async.waterfall([
            function (callback390a) {
                /**
                 * Dateinamen bereitstellen
                 */
                var fullname = "";
                var source = "";
                var stationid = "";
                var stationids = "";
                var selyears = "";
                var selvariablename = "";
                if (req !== null) {
                    if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
                        fullname = req.query.fullname;
                    }
                    if (req.query && typeof req.query.source !== "undefined" && req.query.source.length > 0) {
                        source = req.query.source;
                    }
                    actsource = source;
                    if (req.query && typeof req.query.stationid !== "undefined" && req.query.stationid.length > 0) {
                        stationid = req.query.stationid;
                    }
                    if (req.query && typeof req.query.stationids !== "undefined" && req.query.stationids.length > 0) {
                        stationids = req.query.stationids;
                    }

                    if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
                        selyears = req.query.selyears;
                    }
                    if (req.query && typeof req.query.variable !== "undefined" && req.query.variable.length > 0) {
                        selvariablename = req.query.variable;
                    }
                } else {
                    fullname = reqparm.fullname || "";
                    source = reqparm.source || "";
                    stationid = reqparm.stationid || "";
                    stationids = reqparm.stationids || [];
                    selyears = reqparm.selyears || "";
                    selvariablename = reqparm.selvariablename || "";
                }
                var ret = {};
                ret.source = source;
                ret.selyears = selyears;
                ret.stationid = stationid;
                ret.stationids = stationids;
                ret.selvariablename = selvariablename;
                console.log(ret.source + " " + ret.stationid + " " + ret.stationids.length + " " + ret.selvariablename);
                if (typeof stationids === "undefined" ||
                    typeof stationids === "string" && stationids.length === 0 ||
                    Array.isArray(stationids) && stationids.length === 0) {
                    ret.stationids = [];
                    ret.stationids.push(stationid);
                }
                if (typeof fullname === "undefined" || fullname === null || fullname.length === 0) {
                    fullname = path.join("G:", "Projekte");
                    fullname = path.join(fullname, "klimadaten");
                    fullname = path.join(fullname, "IPCC-GHCN-Daily");
                    ret.fullname = fullname;
                    ret.dirname = fullname;
                } else {
                    ret.fullname = fullname;
                    ret.dirname = path.dirname(fullname);
                }
                /**
                 * TODO: Verzeichnisexistenz prüfen, wenn nicht vorhanden,
                 * dann Suchen in __dirname als root evtl. Daten mit
                 * __dirname, data, IPCC-GHCN-Daily suchen
                 */
                callback390a(null, res, ret);
                return;
            },
            function (res, ret, callback390d) {
                /**
                 * TODO: Suchverfahren für <stationid>.dly auf jeder Ebene und in ret.dirname als
                 * root der hier erfolgenden Suchen
                 */
                console.log("Daten-Root:" + ret.dirname);
                var datapath = path.join(ret.dirname, "ghcnd_all.tar", "ghcnd_all", "ghcnd_all");
                for (var istation = ret.stationids.length - 1; istation > 0; istation--) {
                    if (ret.stationids[istation] === ret.stationids[istation - 1]) {
                        ret.stationids.splice(istation, 1);
                    }
                }
                /**
                 * Start Loop über stationsid's
                 */
                var stationids = ret.stationids;
                var selvariablename = ret.selvariablename;
                var rootpath = datapath;
                async.eachSeries(stationids, function (station, nextstation) {
                        if (typeof station === "undefined" || station === null || station.trim().length === 0) {
                            nextstation();
                            return;
                        }
                        ret.stationid = station;
                        var datapath = path.join(rootpath, station + ".dly");
                        console.log(datapath);
                        async.waterfall([
                                function (callback360) {
                                    var found = true;
                                    try {
                                        if (!fs.existsSync(datapath)) {
                                            found = false;
                                            console.log("Keine Datei für:" + ret.stationid);
                                            kla1490srv.markstation(ret.source, ret.stationid, "*NODATA", db, async, sys0000sys, function (ret1) {
                                                //nextstation();
                                                callback360("Error");
                                                return;
                                            });
                                        } else {
                                            callback360(null);
                                            return;
                                        }
                                    } catch (err) {
                                        found = false;
                                        console.log("Keine Datei für:" + ret.stationid + " " + err);
                                        console.log(err.stack);
                                        kla1490srv.markstation(ret.source, ret.stationid, "*NODATA", db, async, sys0000sys, function (ret1) {
                                            //nextstation();
                                            callback360("Error");
                                            return;
                                        });
                                    }
                                },
                                function (callback361) {
                                    console.log(" ist auf dem Server vorhanden");
                                    var counter = 0;
                                    var dayrecord = {};
                                    var linestartts = new Date();
                                    var lineendts = 0;
                                    var html = "";
                                    var rl;
                                    try {
                                        rl = new LineByLineReader(datapath);
                                    } catch (err) {
                                        console.log("Keine Datei für:" + ret.stationid);
                                        kla1490srv.markstation(ret.source, ret.stationid, "*NODATA", db, async, sys0000sys, function (ret1) {
                                            //nextstation();
                                            callback361("Error");
                                            return;
                                        });
                                    }
                                    var stationnr = 0;
                                    // event is emitted after each line
                                    rl.on('line', function (line) {
                                        var that = this;
                                        rl.pause();
                                        async.waterfall([
                                                function (callback392a) {
                                                    counter++;
                                                    dayrecord = {};
                                                    // rootschema
                                                    for (var i = 0; i < dayschema1.length; i++) {
                                                        var val1 = line.substring(dayschema1[i].von - 1, dayschema1[i].bis).trim();
                                                        var fld1 = dayschema1[i].name;
                                                        dayrecord[fld1] = val1;
                                                    }
                                                    // Ergänzen Überlebenswerte
                                                    dayrecord.source = actsource;
                                                    var ret1 = {
                                                        error: false,
                                                        message: "OK",
                                                        line: line,
                                                        dayrecord: dayrecord
                                                    };
                                                    callback392a(null, res, ret1);
                                                    return;
                                                },
                                                function (res, ret1, callback392b) {
                                                    if (vglstationid !== dayrecord.stationid) {
                                                        /**
                                                         * Ausgabe aller monatsbezogenen Tagesdaten der stationid aus stationdata
                                                         */
                                                        if (vglstationid.length > 0 && stationdata.length > 0) {
                                                            kla1490srv.putstationdata(stationdata, db, async, sys0000sys, res, ret1, function (res, ret1) {
                                                                stationdata = [];
                                                                callback392b(null, res, ret1);
                                                                return;
                                                            });
                                                        } else {
                                                            callback392b(null, res, ret1);
                                                            return;
                                                        }
                                                    } else {
                                                        callback392b(null, res, ret1);
                                                        return;
                                                    }
                                                },
                                                function (res, ret1, callback392c) {
                                                    vglstationid = dayrecord.stationid;
                                                    //if (dayrecord.variable === "TMAX" || dayrecord.variable === "TMIN" || dayrecord.variable ==="PRCP") {
                                                    if ((selvariablename === "TMAX" || selvariablename === "TMIN") && (dayrecord.variable === "TMAX" || dayrecord.variable === "TMIN") ||
                                                        dayrecord.variable === selvariablename) {
                                                        // ab 22 kommen 31 Felder für Tageswerte
                                                        var dayarray = [];
                                                        var lastbis = 0;
                                                        /**
                                                         * eigene Satzart für die Daten, wechselnd mit Stationsdaten
                                                         *  10010 709   87   10 Jan Mayen            NORWAY        19212011  541921    1  287
                                                         *1921  -44  -71  -68  -43   -8   22   47   58   27  -20  -21  -40
                                                         *1922   -9  -17  -62  -37  -16   29   48   63   27   -2  -38  -26
                                                         * Erkennungsregel: 4 Stellen numerisch vorne => Datensatz dat4schema
                                                         */
                                                        // console.log(JSON.stringify(dayrecord));
                                                        dayrecord.days = [];
                                                        // Tage holen 8 = 5 + 1 + 1 + 1
                                                        var ivon = 22 - 1;
                                                        for (var iday = 0; iday < 31; iday++) {
                                                            var idis = ivon + iday * 8; // startet mit 0!
                                                            if ((idis + 8) <= line.length) {
                                                                var value;
                                                                // console.log(line.substr(idis, 8).replace(/ /g,"."));
                                                                value = line.substr(idis, 5).trim();
                                                                if (value === "9999" || value === "-9999") {
                                                                    value = null;
                                                                } else {
                                                                    var len = value.length;
                                                                    value = value.substr(0, len - 1) + "." + value.substr(len - 1, 1);
                                                                }
                                                                dayrecord.days[iday] = value;
                                                            }
                                                        }
                                                        stationdata.push(dayrecord);
                                                    }
                                                    // callback390d("Finish", res, ret);
                                                    callback392c("Finish", res, ret);
                                                    //rl.resume(); // holt den nächsten Satz, auch aus waterfall
                                                    return;
                                                }
                                            ],
                                            function (error, res, ret) {
                                                rl.resume(); // holt den nächsten Satz, auch aus waterfall
                                            });
                                    });
                                    // end - line-by-line davor war es close
                                    rl.on('end', function (line) {
                                        /**
                                         * Letzter Gruppenwechsel
                                         * Ausgabe aller Tagesdaten der stationid aus stationdata
                                         */
                                        if (stationdata.length > 0) {
                                            kla1490srv.putstationdata(stationdata, db, async, sys0000sys, res, ret, function (res, ret1) {
                                                console.log('Total lines : ' + counter);
                                                var varcount = Object.keys(ret1.outrecs.variables).length;
                                                if (varcount === 0) {
                                                    ret.error = true;
                                                    ret.message += " KLISTATION:" + ret1.outrecs.stationid + " " + selvariablename;
                                                } else {
                                                    ret.error = false;
                                                    ret.message += " KLISTATION:" + counter;
                                                }
                                                stationdata = [];
                                                callback361("Finish");
                                                //nextstation();
                                                return;
                                            });
                                        } else {
                                            ret.error = true;
                                            ret.message += " KLISTATION:" + station + " hat kein " + selvariablename;
                                            console.log("KLISTATION:" + station + " hat kein " + selvariablename);
                                            kla1490srv.markstation(actsource, station, "*NODATA", db, async, sys0000sys, function (ret1) {
                                                stationdata = [];
                                                callback361("Error");
                                                //nextstation();
                                                return;
                                            });
                                        }
                                    });
                                }
                            ],
                            function (error, result) {
                                /**
                                 * Ende Async über eine Datei
                                 */
                                nextstation();
                                return;
                            }
                        );
                    },
                    function (error) {
                        /**
                         * Ende Loop über stationsid's
                         */
                        callback390d("Finish", res, {
                            error: false,
                            message: "Alle stationids abgearbeitet"
                        });
                        return;
                    });
            },
        ], function (error, res, ret) {
            callback390(res, ret);
            return;
        });
    };


    /**
     * ghcndonline - GHCN daily - Online Aufbereitung Tagesdaten
     * @param {*} gblInfo
     * @param {*} db
     * @param {*} fs
     * @param {*} path
     * @param {*} rootname
     * @param {*} async
     * @param {*} stream
     * @param {*} StreamZip
     * @param {*} readline
     * @param {*} sys0000sys
     * @param {*} req
     * @param {*} res
     * returns function (res, ret)
     */
    kla1490srv.ghcndonline = function (gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, reqparm, res, callback391) {
        var vglstationid = "";
        stationdata = [];

        async.waterfall([
            function (callback391a) {
                /**
                 * Dateinamen bereitstellen
                 */
                var fullname = "";
                var source = "";
                var stationid = "";
                var variable = "";
                var lastUpdated = "";
                if (req !== null) {
                    if (req.query && typeof req.query.source !== "undefined" && req.query.source.length > 0) {
                        source = req.query.source;
                    }
                    if (req.query && typeof req.query.stationid !== "undefined" && req.query.stationid.length > 0) {
                        stationid = req.query.stationid;
                    }
                    if (req.query && typeof req.query.variable !== "undefined" && req.query.variable.length > 0) {
                        variable = req.query.variable;
                    }

                    if (req.query && typeof req.query.lastUpdated !== "undefined" && req.query.lastUpdated.length > 0) {
                        lastUpdated = req.query.lastUpdated;
                    }
                } else {
                    fullname = reqparm.fullname || "";
                    source = reqparm.source || "";
                    stationid = reqparm.stationid || "";
                    variable = reqparm.variable || "";
                    lastUpdated = reqparm.lastUpdated || "";
                }
                var ret = {};
                ret.source = source;
                ret.stationid = stationid;
                ret.variable = variable;
                ret.lastUpdated = lastUpdated;
                console.log(ret.source + " " + ret.stationid + " " + ret.variable + " " + ret.lastUpdated);
                callback391a(null, res, ret);
                return;
            },
            function (res, ret, callback391a1) {
                // KLIDATA muss schon vorhanden sein
                var reqparm = {
                    sel: {
                        source: "GHCND",
                        stationid: ret.stationid,
                        variable: ret.variable
                    },
                    projection: {},
                    table: "KLIDATA"
                };
                sys0000sys.getonerecord(db, async, null, reqparm, res, function (res, ret1) {
                    if (ret1.error === true) {
                        ret.error = false;
                        ret.message = "no KLIDATA/Error" + ret1.message;
                        ret.stationinitialize = true;
                        ret.stationrecord = {};
                        callback391a1("Error", res, ret);
                        return;
                    } else if (typeof ret1.record !== "undefined" && ret1.record !== null && Object.keys(ret1.record).length > 0) {
                        ret.error = false;
                        ret.message = "KLIDATA found";
                        ret.stationinitialize = false;
                        ret.datarecord = Object.assign({}, ret1.record); // fullcopy
                        // hier ist der Bereich des Nachladens zu definieren
                        var years = JSON.parse(ret.datarecord.years);
                        var yearkeys = Object.keys(years);
                        var lastyear = "0000";
                        var lastyearday = 0;
                        for (var iyear = 0; iyear < yearkeys.length; iyear++) {
                            var lastday = 0;
                            for (var iday = 0; iday < years[yearkeys[iyear]].length; iday++) {
                                if (years[yearkeys[iyear]][iday] !== null) {
                                    lastday = iday;
                                }
                            }
                            if (yearkeys[iyear] > lastyear) {
                                lastyear = yearkeys[iyear];
                                lastyearday = lastday;
                            }
                        }
                        // wenn das letzte Jahr "voll" ist, dann wird das nächste Jahr abgerufen!
                        // kommt später, tsserverupd hat 2020-04-04T14:55:14.631Z und kann geprüft werden
                        ret.lastyear = lastyear;
                        ret.lastyearday = lastyearday;
                        callback391a1(null, res, ret);
                        return;
                    } else {
                        ret.error = false;
                        ret.message = "no old KLIDATA record";
                        ret.datarecord = {};
                        callback391a1("Error", res, ret);
                        return;
                    }
                });
            },
            function (res, ret, callback391b) {
                /**
                 * API Aufrufen
                 * https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=YOUR_DATASETID
                 * https://nodejs.org/api/https.html#https_https_get_url_options_callback
                 */
                var https = require("https");
                var options = {
                    headers: {
                        'token': 'OcsMfeWLPWrSUUpqGPSHOiAHAFdTfGCl'
                    }
                };
                var url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/data";
                url += "?";
                url += "datasetid=GHCND";
                url += "&datatypeid=" + ret.variable;
                url += "&stationid=GHCND:" + ret.stationid;
                /**
                 * TODO: den "echten" letzten Tag finden
                 */
                ret.korrUpdated = ret.lastUpdated;
                if (ret.lastyear > "0000") {
                    var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                    if (uihelper.isleapyear(ret.lastyear)) {
                        // zero-based beachten
                        mdtable[1] = 29;
                    }
                }
                var mon = 0;
                var kmon = 0;
                var lmon = 0;
                var xmon = 0;
                var xday = 0;
                for (var imon = 0; imon < 12; imon++) {
                    kmon += mdtable[imon];
                    if ((ret.lastyearday + 1) > kmon) {
                        xmon = imon + 1;
                        xday = ret.lastyearday - kmon;
                        lmon = kmon;
                    } else {
                        break;
                    }
                }
                if (xmon === 0) xmon = 1;
                if (xday === 0) xday = 1;
                var lastiso = ret.lastyear + "-" + ("00" + xmon).slice(-2) + "-" + ("00" + xday).slice(-2);
                var lastday = new Date(lastiso);
                //add a day to the date
                lastday.setDate(lastday.getDate() + 1);
                var nextday = lastday.toISOString().substr(0, 10);
                url += "&startdate=" + nextday;
                url += "&enddate=" + ret.lastyear + '-12-31';
                /*
                if (ret.lastUpdated.length === 4) {
                    ret.korrUpdated = ret.lastUpdated + "-01-01";
                } else if (ret.lastUpdated.length >= 10) {
                    ret.korrUpdated = ret.lastUpdated.substr(0, 4) + "-01-01"; // für aktuelle Tests
                }
                url += "&startdate=" + ret.korrUpdated;
                url += "&enddate=" + (new Date().getFullYear()) + '-12-31';
                */
                url += "&offset=0";
                url += "&limit=1000";
                console.log(url);
                var result = "";
                https.get(url, options, function (httpsres) {
                    //console.log('statusCode:', httpsres.statusCode);
                    //console.log('headers:', httpsres.headers);
                    httpsres.on('data', function (d) {
                        //console.log(JSON.stringify(d));
                        //console.log(d.toString("utf8"));
                        result += d;
                    });
                    httpsres.on('end', function (d) {
                        console.log('statusCode-end:', httpsres.statusCode);
                        if (httpsres.statusCode !== 200) {
                            console.log('statusCode-callback:', httpsres.statusCode);
                            ret.error = true;
                            ret.message = "ERROR:" + httpsres.statusCode;
                            ret.message += " " + httpsres.statusMessage;
                            ret.message += " " + result;
                            callback391b("Error", res, ret);
                            return;
                        }
                        console.log(result);
                        //var len = result.length - 2;
                        //result = result.substr(1, len);
                        result = JSON.parse(result);
                        ret.result = uihelper.cloneObject(result);
                        callback391b(null, res, ret);
                        return;
                    });
                }).on('error', function (e) {
                    console.error(e);
                    callback391b("Error", res, ret);
                    return;
                });
            },
            function (res, ret, callback391c) {
                var targetpath = path.join(rootname, "static");
                var filename = path.join(targetpath, "temp");
                if (!fs.existsSync(filename)) {
                    fs.mkdirSync(filename);
                }
                filename = path.join(filename, "prot");
                if (!fs.existsSync(filename)) {
                    fs.mkdirSync(filename);
                }
                filename = path.join(filename, ret.source + "_" + ret.stationid + "_" + ret.variable + ".log");
                var rstring = ret.result;
                fs.writeFile(filename, JSON.stringify(rstring), function (err) {
                    callback391c(null, res, ret);
                    return;
                });
            },
            function (res, ret, callback390d) {
                // KLIDATA muss schon vorhanden sein
                var reqparm = {
                    sel: {
                        source: "GHCND",
                        stationid: ret.stationid,
                        variable: ret.variable
                    },
                    projection: {},
                    table: "KLIDATA"
                };
                sys0000sys.getonerecord(db, async, null, reqparm, res, function (res, ret1) {
                    if (ret1.error === true) {
                        ret.error = false;
                        ret.message = "no KLIDATA/Error" + ret1.message;
                        ret.stationinitialize = true;
                        ret.stationrecord = {};
                        callback390d("Error", res, ret);
                        return;
                    } else if (typeof ret1.record !== "undefined" && ret1.record !== null && Object.keys(ret1.record).length > 0) {
                        ret.error = false;
                        ret.message = "KLIDATA found";
                        ret.stationinitialize = false;
                        ret.datarecord = Object.assign({}, ret1.record); // fullcopy
                        callback390d(null, res, ret);
                        return;
                    } else {
                        ret.error = false;
                        ret.message = "no old KLIDATA record";
                        ret.datarecord = {};
                        callback390d("Error", res, ret);
                        return;
                    }
                });
            },
            function (res, ret, callback390e) {
                /**
                 * Verarbeitung ret.result als Objekt gegen KLIDATA in ret.datarecord:
                 * result.metadata.resultset.count - aktuelle Zahl "Sätze"
                 * result.metadata.results[i] sind die "Sätze" mit
                 *       date,
                 *       datatype TMAX...,
                 *       station mit GHCND:<stationid>,
                 *       attributes meist ",,S,", - wird derzeit nicht ausgewertet
                 *       value als string mit implizit 1 Dezimale
                 */
                var years = JSON.parse(ret.datarecord.years);
                if (typeof years === "string") {
                    years = JSON.parse(years);
                }
                var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                // Iteration
                var maxyear = 0;
                var minyear = 9999;
                var newlastUpdated = "";
                for (var ival = 0; ival < ret.result.results.length; ival++) {
                    var actdata = ret.result.results[ival];
                    if (actdata.date > newlastUpdated) {
                        newlastUpdated = actdata.date;
                    }
                    var actyear = parseInt(actdata.date.substr(0, 4));
                    if (actyear < minyear) minyear = actyear;
                    if (actyear > maxyear) maxyear = actyear;
                    var actmonth = parseInt(actdata.date.substr(5, 2));
                    var actday = parseInt(actdata.date.substr(8, 2));
                    if (typeof years["" + actyear] === "undefined") {
                        // jetzt das Jahr zufügen mit Array
                        if (uihelper.isleapyear(actyear)) {
                            years["" + actyear] = new Array(366).fill("");
                        } else {
                            years["" + actyear] = new Array(365).fill("");
                        }
                    } else {
                        var diff = 0;
                        if (uihelper.isleapyear(actyear)) {
                            if (years["" + actyear].length < 366) {
                                // Auffüllen
                                diff = 366 - years["" + actyear].length;
                                years["" + actyear].concat(new Array(diff).fill(""));

                            }
                        } else {
                            if (years["" + actyear].length < 365) {
                                // auffüllen
                                diff = 365 - years["" + actyear].length;
                                years["" + actyear].concat(new Array(diff).fill(""));
                            }
                        }
                    }
                    // Plausi
                    if (uihelper.isleapyear(actyear)) {
                        mdtable[1] = 29;
                    } else {
                        mdtable[1] = 28;
                    }
                    var actindex = 0;
                    for (var imon = 0; imon < (actmonth - 1); imon++) {
                        actindex += mdtable[imon];
                    }

                    var value = "" + actdata.value;
                    if (value === "9999" || value === "-9999") {
                        value = "";
                    } else {
                        var len = value.length;
                        value = value.substr(0, len - 1) + "." + value.substr(len - 1, 1);
                    }
                    /**
                     * erst mal nur Protokollausgabe, bevor es zu Problemen kommt
                     */
                    var msg = "";
                    msg += actdata.date;
                    msg += "=>" + (actindex + actday - 1);
                    msg += " " + years["" + actyear][actindex + actday - 1] + "=>" + value;
                    // console.log(msg);
                    years["" + actyear][actindex + actday - 1] = value;
                }
                ret.datarecord.years = years;
                if (minyear < ret.datarecord.fromyear) {
                    ret.datarecord.fromyear = minyear;
                }
                if (maxyear > ret.datarecord.toyear) {
                    ret.datarecord.toyear = minyear;
                }
                ret.datarecord.lastUpdated = newlastUpdated;
                callback390e(null, res, ret);
                return;
            },
            function (res, ret, callback390f) {
                /**
                 * Updates KLIDATA, KLIINVENTORY, zuerst KLIDATA
                 */
                var reqparm = {};
                reqparm.selfields = {
                    source: ret.datarecord.source,
                    stationid: ret.datarecord.stationid,
                    variable: ret.datarecord.variable
                };
                reqparm.updfields = {};
                reqparm.updfields["$setOnInsert"] = {
                    source: ret.datarecord.source,
                    stationid: ret.datarecord.stationid,
                    variable: ret.datarecord.variable
                };
                if (typeof ret.datarecord.years !== "string") {
                    ret.datarecord.years = JSON.stringify(ret.datarecord.years);
                }
                reqparm.updfields["$set"] = {
                    firstyear: ret.datarecord.fromyear,
                    firstyearok: ret.datarecord.fromyear,
                    fromyear: ret.datarecord.fromyear,
                    toyear: ret.datarecord.toyear,
                    anzyears: ret.datarecord.toyear - ret.datarecord.fromyear + 1,
                    realyears: ret.datarecord.toyear - ret.datarecord.fromyear + 1,
                    lastUpdated: ret.datarecord.lastUpdated,
                    years: ret.datarecord.years
                };
                reqparm.table = "KLIDATA";
                sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                    console.log("KLIDATA-setonerecord:" + ret.datarecord.stationid + " " + ret.datarecord.variable);
                    callback390f(null, res, ret);
                    return;
                });
            },
            function (res, ret, callback390f) {
                /**
                 * Update KLIINVENTORY
                 */
                var reqparm = {};
                reqparm.selfields = {
                    source: ret.datarecord.source,
                    stationid: ret.datarecord.stationid,
                    variable: ret.datarecord.variable
                };
                reqparm.updfields = {};
                reqparm.updfields["$setOnInsert"] = {
                    source: ret.datarecord.source,
                    stationid: ret.datarecord.stationid,
                    variable: ret.datarecord.variable
                };
                reqparm.updfields["$set"] = {
                    fromyear: ret.datarecord.fromyear,
                    toyear: ret.datarecord.toyear,
                    anzyears: ret.datarecord.toyear - ret.datarecord.fromyear + 1,
                    lastUpdated: ret.datarecord.lastUpdated
                };
                reqparm.table = "KLIINVENTORY";
                sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                    console.log("KLIINVENTORY-setonerecord:" + ret.datarecord.stationid + " " + ret.datarecord.variable);
                    callback390f(null, res, ret);
                    return;
                });
            }
        ], function (error, res, ret) {
            ret.message = "kla1490srv.ghcndonline - beendet:" + ret.message;
            callback391(res, ret);
            return;
        });
    };


    /**
     * Verarbeitung stationdata zur Ausgabe in KLIDATA
     * Aufwändige Konsolidierung der Daten,
     * TODO: Qualitäsmaß berechnen
     * Sortierung nach stationid, variable, year, month
     * Gruppenwechsel auf stationid, variable - die Daten in einem Object years mit year und array für alle Tage des year wie bisher
     * @param {*} stationdata - reorganisieren und ausgeben
     *                         aus stationdata.push(dayrecord);
     * und stationid, year, month, variable und dann days[i] je Monat,
     * source kommt aus ret.source
     * @param {*} db
     * @param {*} async
     * @param {*} res
     * @param {*} ret1 stellt u.a. source bereit
     * @param {*} callback394
     * return mit Callback res und ret
     */
    kla1490srv.putstationdata = function (stationdata, db, async, sys0000sys, res, ret1, callback394) {
        /**
         * Sortieren der Daten in stationdata
         * Loop1 Gruppenwechsel mit Konsolidierung je variable, years, year, days[j] in year
         * Loop2 Ausgabe je variable
         *
         */
        async.waterfall([
                function (callback394a) {
                    var ret = uihelper.cloneObject(ret1);
                    ret.stationdata = stationdata;
                    callback394a(null, res, ret);
                    return;
                },
                function (res, ret, callback394c) {
                    // Die Konsolidierung der Jahre und Monate kommt später
                    ret.stationdata.sort(function (a, b) {
                        if (a.stationid < b.stationid) {
                            return -1;
                        } else if (a.stationid > b.stationid) {
                            return 1;
                        } else if (a.stationid === b.stationid) {
                            if (a.variable < b.variable) {
                                return -1;
                            } else if (a.variable > b.variable) {
                                return 1;
                            } else {
                                return 0;
                            }
                        }
                    });
                    callback394c(null, res, ret);
                    return;
                },
                function (res, ret, callback394e) {
                    // Aufbau der Jahres tabellen und Ausgabesätze (mit objs und arrays)
                    var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                    var outrecs = {};
                    outrecs.variables = {};
                    outrecs.stationid = ret.stationdata[0].stationid;
                    outrecs.source = ret.stationdata[0].source;
                    for (var irec = 0; irec < ret.stationdata.length; irec++) {
                        var rec = ret.stationdata[irec];
                        if (typeof outrecs.variables[rec.variable] === "undefined") {
                            outrecs.variables[rec.variable] = {};
                        }
                        if (typeof outrecs.variables[rec.variable].years === "undefined") {
                            outrecs.variables[rec.variable].years = {};
                        }
                        if (typeof outrecs.variables[rec.variable].years[rec.year] === "undefined") {
                            outrecs.variables[rec.variable].years[rec.year] = [];
                            if (uihelper.isleapyear(rec.year)) {
                                outrecs.variables[rec.variable].years[rec.year] = new Array(366).fill("");
                            } else {
                                outrecs.variables[rec.variable].years[rec.year] = new Array(365).fill("");
                            }
                        }
                        if (uihelper.isleapyear(rec.year)) {
                            mdtable[1] = 29;
                        } else {
                            mdtable[1] = 28;
                        }
                        var month = parseInt(rec.month);
                        if (rec.days.length < mdtable[month - 1]) {
                            // Inputtabelle zu kurz, wird aufgefüllt
                            for (var inull = rec.days.length; inull < mdtable[month - 1]; inull++) {
                                rec.days[inull] = "";
                            }
                        }
                        var baseday = 0;
                        for (var imon = 0; imon < (month - 1); imon++) {
                            baseday += mdtable[imon];
                        }
                        for (var iday = 0; iday < mdtable[month - 1]; iday++) {
                            var value = rec.days[iday];
                            var tind = baseday + iday;
                            outrecs.variables[rec.variable].years[rec.year][tind] = value;
                        }
                    }
                    ret.outrecs = outrecs;
                    callback394e(null, res, ret);
                    return;
                },
                function (res, ret, callback394g) {
                    // Löschen der alten Daten in KLIDATA
                    var keys = Object.keys(ret.outrecs.variables);
                    var liste = keys.length ? "'" + keys.join("','") + "'" : "";
                    db.serialize(function () {
                        var delstmt = "DELETE FROM KLIDATA";
                        delstmt += " WHERE source = '" + ret.outrecs.source + "'";
                        delstmt += " AND stationid = '" + ret.outrecs.stationid + "'";
                        delstmt += " AND variable  IN (" + liste + ")";
                        db.run(delstmt, function (err) {
                            console.log("Row(s) deleted:" + this.changes);
                            callback394g(null, res, ret);
                            return;
                        });
                    }); // serialize
                },
                function (res, ret, callback394u) {
                    var varkeys = Object.keys(ret.outrecs.variables);
                    var actvariables = "";
                    async.eachSeries(varkeys, function (variable, nextrec) {
                            // Hier die Qualitätsparameter berechnen
                            var outrec = ret.outrecs.variables[variable];
                            var firstyear = "";
                            var firstyearok = "";
                            var fromyear = "";
                            var toyear = "";
                            var anzyears = 0;
                            var realyears = 0;
                            var missing = 0;
                            var imissing = 0;
                            var ymissing = 0;
                            var icount = 0;
                            var goodyears = 0;
                            var ys = Object.keys(outrec.years);
                            // immer berechnen - speziell wenn source nicht gefunden wurde
                            for (var iys = 0; iys < ys.length; iys++) {
                                if (firstyear.length === 0) {
                                    firstyear = ys[iys];
                                    firstyearok = ys[iys];
                                } else if (firstyear > ys[iys]) {
                                    firstyear = ys[iys];
                                    firstyearok = ys[iys];
                                }
                                if (toyear.length === 0) {
                                    toyear = ys[iys];
                                } else if (toyear < ys[iys]) {
                                    toyear = ys[iys];
                                }
                                var ymissing = 0;
                                for (var idy = 0; idy < outrec.years[ys[iys]].length; idy++) {
                                    icount++;
                                    var dval = outrec.years[ys[iys]][idy];
                                    if (typeof dval === "undefined" || dval === null || dval === "") {
                                        dval = null;
                                        outrec.years[ys[iys]][idy] = dval;
                                        imissing++;
                                        ymissing++;
                                    }
                                }
                                if ((ymissing / outrec.years[ys[iys]].length) < 20.0) {
                                    goodyears++;
                                }
                            }
                            fromyear = firstyear;
                            anzyears = parseInt(toyear) - parseInt(fromyear) + 1;
                            realyears = ys.length;
                            missing = (imissing / icount).toFixed(2);
                            goodyears = goodyears;
                            var reqparm = {};
                            reqparm.selfields = {
                                source: ret.source,
                                stationid: ret.outrecs.stationid,
                                variable: variable
                            };
                            if (actvariables.length > 0) actvariables += ",";
                            actvariables += variable;
                            reqparm.updfields = {};
                            reqparm.updfields["$setOnInsert"] = {
                                source: ret.source,
                                stationid: ret.outrecs.stationid,
                                variable: variable
                            };
                            reqparm.updfields["$set"] = {
                                firstyear: firstyear,
                                firstyearok: firstyear,
                                fromyear: firstyear,
                                toyear: toyear,
                                anzyears: anzyears,
                                realyears: realyears,
                                missing: missing,
                                imissing: imissing,
                                icount: icount,
                                goodyears: goodyears,
                                years: JSON.stringify(ret.outrecs.variables[variable].years)
                            };
                            reqparm.table = "KLIDATA";
                            sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                                console.log("KLIDATA-setonerecord:" + ret.outrecs.stationid + " " + variable);
                                nextrec();
                                return;
                            });
                        },
                        function (error) {
                            var thissource = ret.source;
                            var thisstationid = ret.outrecs.stationid;
                            var thisvariables = Object.keys(ret.outrecs.variables).join(",");
                            if (thisvariables.length <= 0) {
                                thisvariables = "*NONE";
                            }

                            kla1490srv.markstation(thissource, thisstationid, thisvariables, db, async, sys0000sys, function (ret1) {
                                callback394u("finish", res, ret);
                                return;
                            });



                        });
                }
            ],
            function (error, res, ret) {
                callback394(res, ret);
                return;
            });
    };

    /**
     * markstation - temperature-Feld setzen nach Vorgaben mit tempts
     * @param {*} msource
     * @param {*} mstationid
     * @param {*} mvariables
     * @param {*} callback380
     */
    kla1490srv.markstation = function (msource, mstationid, mvariables, db, async, sys0000sys, callback380) {
        var reqparm = {};
        reqparm.selfields = {
            source: msource,
            stationid: mstationid
        };
        reqparm.updfields = {};
        var date = new Date();
        reqparm.updfields["$set"] = {
            temperature: mvariables,
            tempts: new Date(date - date.getTimezoneOffset() * 60 * 1000).toISOString()
        };
        reqparm.updfields["$setOnInsert"] = {};
        reqparm.table = "KLISTATIONS";
        sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
            callback380(ret1);
            return;
        });
    };






    /**
     * getFormat - String Analyse Feldformat - EIN FELD
     *  * 01- 05 STAID  : Station identifier
     * (\d+) ... https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_match_regexp2
     */
    kla1490srv.getLocFieldFormat = function (line) {
        //var res = line.match(/([0-9]*)(-)(\s)([0-9]*)(\s)([a-zA-Z_0-9]*)(\s*)([:]*)(\s*)(.*)/);
        var res = line.match(/([0-9]*)(-)(\s*)([0-9]*)(\s*)([a-zA-Z_0-9]*)(\s*)([:]*)(\s*)(.*)/);
        if (res === null) {
            return ({
                error: true
            });
        }
        var von = "";
        var bis = "";
        var name = "";
        var desc = "";
        // ab 1, skip total string
        for (var ires = 1; ires < res.length; ires++) {
            var hit = res[ires].trim();
            if (hit !== null && hit.length > 0 && hit !== "-" && hit !== ":") {
                if (von.length === 0) {
                    von = parseInt(hit);
                } else if (bis.length === 0) {
                    bis = parseInt(hit);
                } else if (name.length === 0) {
                    name = hit;
                } else if (desc.length === 0) {
                    desc = hit;
                    break;
                }
            }
        }
        return ({
            error: false,
            von: von,
            bis: bis,
            name: name,
            desc: desc
        });
    };



    /**
     * https://stackoverflow.com/questions/4371565/create-regexps-on-the-fly-using-string-variables
     * aber hier nicht regex, sondern fest formatiert!
     * https://texthandler.com/info/remove-line-breaks-javascript/
     */
    kla1490srv.getFieldData = function (fldtable, line) {
        var result = {};
        line = line.replace(/(\r\n|\n|\r)/gm, " ");
        for (var ifld = 0; ifld < fldtable.length; ifld++) {
            var von = fldtable[ifld].data.von;
            var bis = fldtable[ifld].data.bis;
            var name = fldtable[ifld].data.name;
            var desc = fldtable[ifld].data.desc;
            if (bis <= line.length) {
                var fldval = line.substring(von - 1, bis);
                result[name] = fldval;
            } else {
                break;
            }
        }
        return result;
    };


    /**
     * year gegen Vorgabe prüfen
     * kommaseparierte Vorgaben
     * 4-stellige Jahreszahlen
     * Wildcard * ist erlaubt
     * und es kommen von-bis Angaben mit - dazu
     */
    kla1490srv.hasyear = function (year, selyears) {
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
     * batchreg - Batch-Analyse, Regressionsrechnung, Parameter m Filterung,
     * Speicherung in Datenbank-Tabelle KLIDATA je source, stationid und variable
     * Filter erst mal fest vorgeben
     * returns function (res, ret)
     */

    kla1490srv.batchreg = function (gblInfo, gbldb, async, regression, sys0000sys, uihelper, req, res, supercallback) {

        async.waterfall([
                function (callbackba) {
                    /**
                     * Vorgabeparameter übernehmen
                     */
                    var source = "GHCND";
                    var stationid = "";
                    var stationids = [];
                    var variable = "TMAX,TMIN"; // Default

                    if (req.query && typeof req.query.source !== "undefined") {
                        source = req.query.source;
                    }
                    if (req.query && typeof req.query.stationid !== "undefined") {
                        stationid = req.query.stationid;
                    }
                    if (req.query && typeof req.query.stationids !== "undefined") {
                        stationids = req.query.stationids;
                    }
                    if (req.query && typeof req.query.variable !== "undefined") {
                        variable = req.query.variable;
                    }

                    /**
                     * SQLite3-Selektion aufbauen, Kerndaten in Array
                     */
                    var selstmt = "SELECT";
                    selstmt += " source, stationid, variable";
                    selstmt += " FROM KLIDATA";
                    selstmt += " WHERE source = '" + source + "'";
                    if (stationids.length > 0) {
                        var sliste = stationids.length ? "'" + stationids.join("','") + "'" : "";
                        selstmt += " AND stationid IN (" + sliste + ")";
                    } else if (stationid.length > 0) {
                        selstmt += " AND stationid = '" + stationid + "'";
                    }
                    var keys = variable.split(",");
                    var liste = keys.length ? "'" + keys.join("','") + "'" : "";
                    selstmt += " AND variable IN (" + liste + ")";
                    selstmt += " ORDER BY source, stationid, variable";
                    var reqparm = {};
                    reqparm.sel = selstmt;
                    reqparm.skip = 0;
                    reqparm.limit = 0;
                    sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            callbackba("Error", res, {
                                error: true,
                                message: ret1.message
                            });
                            return;
                        } else if (ret1.records === null || ret1.records.length === 0) {
                            callbackba("Error", res, {
                                error: true,
                                message: "Keine Daten gefunden in KLIDATA"
                            });
                            return;
                        } else {
                            // Dubletten entfernen
                            var vglrec = JSON.stringify(ret1.records.length - 1);
                            for (var irec = ret1.records.length - 2; irec >= 0; irec++) {
                                var actrec = JSON.stringify(irec);
                                if (vglrec === actrec) {
                                    ret1.records.splice((irec + 1), 1);
                                }
                            }
                            callbackba(null, res, {
                                error: false,
                                message: "Daten gefunden in KLIDATA",
                                records: ret1.records
                            });
                            return;
                        }
                    });
                },
                function (res, ret, callbackba) {
                    // Loop über alle stations mit variable - record hat source, stationid, variable
                    var count = 0;
                    async.eachSeries(ret.records, function (record, nextrecord) {
                            count++;
                            kla1490srv.analysis(record, res, ret, gbldb, async, regression, sys0000sys, function (res, ret) {
                                nextrecord();
                            });
                        },
                        function () {
                            // Ende-Verarbeitung, Speichern zur Studie "gesamt"?
                            console.log("End eachseries analysis");
                            callbackba("finish", res, ret);
                            return;
                        });
                },

            ],
            function (error, res, ret) {
                supercallback(res, ret);
                return;
            });
    };

    /**
     * Analyse für eine Station und eine variable in KLIDATA
     * res wird nur durchgewunken, kann null sein
     * ret enthält vorgaben und wird zurückgegeben
     * die Analyseergebnisse werden fortgeschrieben in KLISTUDIES ???
     * returns callback res, ret
     */
    kla1490srv.analysis = function (selrecord, res, ret, gbldb, async, regression, sys0000sys, callbackb1) {
        async.waterfall([
                function (callbackb2) {
                    /**
                     * Lesen der temperaturdaten zu source, stationid, variable in selrecord
                     */
                    var selstmt = "SELECT * ";
                    selstmt += " FROM KLIDATA";
                    selstmt += " WHERE source = '" + selrecord.source + "'";
                    selstmt += " AND stationid = '" + selrecord.stationid + "'";
                    selstmt += " AND variable = '" + selrecord.variable + "'";
                    selstmt += " ORDER BY source, stationid, variable";
                    var reqparm = {};
                    reqparm.sel = selstmt;
                    reqparm.skip = 0;
                    reqparm.limit = 0;
                    sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            console.log(ret1.message);
                            callbackb2("Error", res, {
                                error: true,
                                message: ret1.message
                            });
                            return;
                        } else if (ret1.records === null || ret1.records.length === 0) {
                            console.log("Keine Daten gefunden in KLIDATA");
                            callbackb2("Error", res, {
                                error: true,
                                message: "Keine Daten gefunden in KLIDATA"
                            });
                            return;
                        } else {
                            console.log("Daten gefunden in KLIDATA:" + selrecord.stationid + " " + selrecord.variable);
                            callbackb2(null, res, {
                                error: false,
                                message: "Daten gefunden in KLIDATA",
                                record: ret1.records[0]
                            });
                            return;
                        }
                    });
                },
                function (res, ret, callbackb2) {
                    /**
                     * Vorbereitung der Daten für vereinfachte Analyse
                     * nach ret.tarray[year[0..12]]
                     */
                    var regarray = []; // array[x, y] mit x = periode, y = temperatur
                    var record = ret.record;
                    var yeardata = JSON.parse(ret.record.years);
                    var xindex = -1;
                    var tmax = null;
                    var tmin = null;
                    var tsum = 0;
                    var tcount = 0;

                    for (var iyear = parseInt(record.fromyear); iyear <= parseInt(record.toyear); iyear++) {
                        // Iteration über alle Jahre
                        if (typeof yeardata["" + iyear] === "undefined") {
                            // hier kann improvisiert werden, zuerst skip
                        } else {
                            var yeary = yeardata["" + iyear];
                            for (var iday = 0; iday < yeary.length; iday++) {
                                if (yeary[iday] !== null && yeary[iday].length > 0) {
                                    xindex++;
                                    var x = xindex;
                                    var y = parseFloat(yeary[iday]);
                                    regarray.push([x, y]);
                                    if (tmin === null) {
                                        tmin = y;
                                    } else if (tmin > y) {
                                        tmin = y;
                                    }
                                    if (tmax === null) {
                                        tmax = y;
                                    } else if (tmax < y) {
                                        tmax = y;
                                    }
                                    tsum += y;
                                    tcount++;
                                }
                            }
                        }
                    }
                    /**
                     * Regression - total-all months
                     */
                    ret.regression = {};
                    ret.regression.total = {};
                    var result;
                    try {
                        result = regression.linear(regarray);
                    } catch (err) {
                        console.log("Regression-Error:" + err + " zu " + record.stationid + " " + record.variable);
                    }
                    ret.erg = {};
                    ret.erg.regtotfirstyear = ret.record.fromyear;
                    ret.erg.regtotlastyear = ret.record.toyear;
                    ret.erg.regtotm = result.equation[0]; // gradient
                    ret.erg.regtotc = result.equation[1]; // intercept
                    ret.erg.string = result.string;
                    ret.erg.regtotr2 = result.r2; // determination, Bestimmtheitsmaß
                    ret.erg.regtottmin = tmin;
                    ret.erg.regtottmax = tmax;
                    ret.erg.regtottcount = tcount;
                    if (tcount === 0) tcount = 1;
                    ret.erg.regtottavg = (tsum / tcount);
                    callbackb2(null, res, ret);
                    return;
                },



                function (res, ret, callbackb2) {
                    /**
                     * Ausgabe in Datenbank
                     */
                    var record = ret.record;

                    var reqparm = {};
                    reqparm.selfields = {
                        source: record.source,
                        stationid: record.stationid,
                        variable: record.variable
                    };
                    reqparm.updfields = {};
                    reqparm.updfields["$setOnInsert"] = {
                        source: record.source,
                        stationid: record.stationid,
                        variable: record.variable
                    };
                    reqparm.updfields["$set"] = ret.erg;
                    reqparm.table = "KLIDATA";
                    console.log("update requested:" + record.stationid + " " + record.variable);
                    sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret) {
                        //console.log("setonerecord-returned:" + JSON.stringify(ret));
                        console.log("update finished:" + record.stationid + " " + record.variable);
                        callbackb2(null, res, ret);
                        return;
                    });
                }
            ],
            function (error, res, ret) {
                callbackb1(res, ret);
                return;
            });
    };


    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1490srv;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1490srv;
        });
    } else {
        // included directly via <script> tag
        root.kla1490srv = kla1490srv;
    }
}());