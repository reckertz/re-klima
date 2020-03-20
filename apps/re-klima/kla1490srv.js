/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper */
(function () {
    var kla1490srv = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var crg = crg || require('country-reverse-geocoding').country_reverse_geocoding();
    var path = path || require("path");

    var uihelper = null;
    var sys0000sys = null;
    var kla9020fun = null;
    var LineByLineReader = null;

    var gbldb = null;
    var res = null;

    var crg = null;
    var anzecads = 0;
    var countries = {};
    var vglsouid = "";
    var countmin = 0;
    var countmax = 0;
    var fs;
    var sql3inserts = 0;
    var sql3errors = 0;



    /**
     * ghcndcomplete - GHCN daily-Aufbereitung
     * Vorgabe ist fullname von ghcnd-stations.txt
     * damit wird KLISTATIONS fortgeschrieben,
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
                    var ret = {};
                    ret.fullname = fullname;
                    ret.fullnamestations = fullname;
                    ret.dirname = path.dirname(fullname);
                    ret.source = source;
                    ret.selyears = selyears;
                    callback290a(null, res, ret);
                    return;
                },
                function (res, ret, callback290b) {
                    /**
                     * KLICOUNTRIES neu aufbauen aus ghcnd-countries.txt
                     */
                    couschema = [{
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
                    LineByLineReader = LineByLineReader || require('line-by-line');
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
                        var lat = invrecord.latitude;
                        var latobj = kla9020fun.getlatfieldsp(lat);
                        invrecord.latn = latobj.latn;
                        invrecord.lats = latobj.lats;
                        ret.stations[invrecord.stationid] = invrecord;
                        /**
                         * contry festellen und Datenkomplettierung
                         */
                        if (crg === null) {
                            crg = require('country-reverse-geocoding').country_reverse_geocoding();
                        }
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
                            if (counter % 100 === 0) {
                                var logmsg = counter + "/" + stationnr + " " + invrecord.name;
                                if (typeof country !== "undefined" && country !== null) {
                                    logmsg += "=>" + country.code || "" + " " + country.name || "" + "=>" + countrydata.region || "";
                                    // console.log(logmsg);
                                } else {
                                    logmsg += "=>Keine Region-Data";
                                    console.log(logmsg);
                                }
                            }
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
                            ret.message += " keine KLICOUNTRIES:" + err;
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
     * fullname = zui-Datei mit den Daten zu einer Variablen
     * basiert auf vorhandenen Sourcen, die umgebaut werden
     * ghc1030dta.showallzips
     * callback45 mit function (res, ret)
     */
    kla1490srv.ecadcomplete = function (gblInfo, gbldbx, fs, path, rootname, async, stream, StreamZip, readline, sys0000sysx, kla9020funx, req, resx, callback45) {
        /*
        forcedata: forcedata,
        fullname: fullname,
        timeout: 70 * 60 * 1000,
        source: source,
        selyears: selrecord.seldata.years
        */
        if (uihelper === null) {
            uihelper = require("re-frame/uihelper.js");
        }
        if (sys0000sys === null) {
            sys0000sys = sys0000sysx;
        }
        if (kla9020fun === null) {
            kla9020fun = kla9020funx;
        }
        if (crg === null) {
            crg = require('country-reverse-geocoding').country_reverse_geocoding();
        }
        if (gbldb === null) {
            gbldb = gbldbx;
        }
        if (res === null) {
            res = resx;
        }
        var fullname = "";
        if (typeof reqparm !== "undefined" && reqparm !== null) {
            fullname = reqparm.fullname;
        } else {
            fullname = req.query.fullname;
        }
        // var dir = path.join(gblInfo.rootDirectory, "/../klima1001/ipccdata");
        var dirtable = [];
        var varstatable = [];
        var varfldtable = [];
        var srcfldtable = [];
        var srcstatable = [];
        var srcsoutable = [];
        var stafldtable = [];
        var soutable = [];
        anzecads = 0;
        async.waterfall([
                function (callback45x) {
                    /**
                     * KLICOUNTRIES laden
                     */
                    var ret = {};
                    if (Object.keys(countries).length > 0) {
                        ret.message += " countries bereits geladen";
                        ret.countries = countries;
                        callback45x(null, res, ret);
                        return;
                    }
                    var reqparm = {};
                    reqparm.table = "KLICOUNTRIES";
                    reqparm.sel = {};
                    reqparm.projection = {};
                    sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            ret.message += " keine KLICOUNTRIES:" + err;
                            ret.countries = {};
                            callback45x(null, res, ret);
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
                                    countries[alpha3] = record;
                                }
                                callback45x(null, res, ret);
                                return;
                            } else {
                                ret.message += " keine KLICOUNTRIES";
                                countries = {};
                                callback45x(null, res, ret);
                                return;
                            }
                        }
                    });
                },
                function (res, ret, callback45y) {
                    try {

                        var sel = {
                            source: "ECAD"
                        };
                        countmin = 0;
                        countmax = 0;
                        /** 
                         * deleteMany ist nur für Datenkorrekturen sinnvoll
                         * und ist daher standardmäßig auskommentiert
                         */
                        callback45y(null, res, {
                            error: false,
                            message: "KLISOURCES skipped delete"
                        });
                        return;
                        /*
                        gbldb.collection("KLISTATIONS").deleteMany(sel, function (err, obj) {
                            // if (err) throw err;
                            console.log(obj.result.n + " sources(s) deleted");
                            callback45y(null, res, {
                                error: false,
                                message: "KLISOURCES deleted " + err
                            });
                            return;
                        });
                        */
                    } catch (err) {
                        var ret = {};
                        ret.error = true;
                        ret.message = "Korrektur tmax war nicht erfolgreich:" + err.message;
                        ret.record = null;
                        console.log("Korrektur tmax war nicht erfolgreich:" + ret.message);
                        callback45y(null, res, ret);
                        return;
                    }
                },
                function (res, ret, callback45a) {
                    var zip = new StreamZip({
                        file: fullname,
                        storeEntries: true
                    });

                    // Handle errors
                    zip.on('error', function (err) {
                        callback45a("Error", {
                            error: true,
                            message: err
                        });
                        return;
                    });
                    zip.on('ready', function (err) {
                        // Take a look at the files
                        console.log('Entries read: ' + zip.entriesCount);
                        var files = zip.entries();

                        kla1490srv.getSourcesTxtData(zip, "elements.txt", varfldtable, varstatable);
                        kla1490srv.getSourcesTxtData(zip, "sources.txt", srcfldtable, srcsoutable);
                        kla1490srv.getSourcesTxtData(zip, "stations.txt", stafldtable, srcstatable);

                        // for (var file in files) {
                        try {
                            async.eachSeries(files, function (fileobj, nextfile) {
                                //optional check for properties from prototype chain
                                if (typeof fileobj.name !== "undefined") {
                                    //no a property from prototype chain     
                                    if (fileobj.name === "elements.txt" || fileobj.name === "sources.txt" || fileobj.name === "stations.txt") {
                                        // bereits verarbeitet
                                        nextfile();
                                    } else {
                                        // hier die Daten aufbereiten!!!
                                        var filname = fileobj.name;
                                        vglsouid = "";
                                        kla1490srv.getFileTxtData(zip, filname, StreamZip, function (ret) {
                                            /** 
                                             * für KLISTATIONS
                                             * years: years,
                                             * fldtable: fldtable
                                             * targetelem: targetelem,
                                             * targetvar: targetvar
                                             */
                                            kla1490srv.putecaddata(srcstatable, srcsoutable, ret.years, ret.fldtable, ret.targetvar, ret.targetelem, async, function (ret) {
                                                nextfile();
                                                return;
                                            });
                                        });
                                    }
                                }
                            }, function (error) {
                                zip.close();
                                zip = null;
                                console.log(fullname + " finished");
                                callback45(res, {
                                    error: false,
                                    message: "unzipped + processed",
                                    datafilename: fullname,
                                    fulldatafilename: fullname
                                });
                                return;
                            });
                        } catch (err) {
                            console.log(err);
                            console.log(err.stack);
                            callback45(res, {
                                error: true,
                                message: err
                            });
                            return;
                        }
                    });
                }
            ],
            function (error, result) {
                callback45(res, result);
                return;
            }
        );
    };

    /** 
     * putecaddata - Schreiben KLISTATIONS aus
     * soutable - Stammdaten zu den Stations und Sources
     * years - years[souid][sjahr][dayofyear] = temperatur;
     * Ausgabe in <variablename>.<"years">.<jahreszahl>.array der werte
     * fldtable - wird hier nicht ausgewertet
     */
    kla1490srv.putecaddata = function (statable, soutable, years, fldtable, targetvar, targetelem, async, callback47) {
        var souids = Object.keys(years);
        async.eachSeries(souids, function (souid, nextsouid) {
                /** 
                 * Suche richtige Stammdaten in soutable
                 * key berechnen, führende Nullen unterdrücken
                 *  dmode:21
                    data:Object {STAID: "104", STANAME: "VYTEGRA", CN: "RU", …}
                    STAID, SOUID, SOUNAME, CN, LAT, LON, HGTH, ELEI, START YYYYMMDD, STOP YYYYMMDD, PARID, PARNAME
                    LAT +56:52:00
                    LON +014:48:00
                    also Stunden, Minuten und Sekunden, Umrechnung mit
                    latitude: uihelper.convertDMS2dd(LAT),
                    longitude: uihelper.convertDMS2dd(LON)
                 */
                var actstaid = souid.substr(0, 6).replace(/^0+/, '');
                var actsouid = souid.substr(6, 6).replace(/^0+/, '');
                var ifound = -1;
                var stationdata = {};
                var sec1 = "9999999";
                var sec2 = "999999";
                if (souid.substr(6, 1) === "0") {
                    sec1 = "1" + souid.substr(7, 5);
                    sec2 = "9" + souid.substr(7, 5);
                }

                for (var isource = 0; isource < soutable.length; isource++) {
                    if (soutable[isource].dmode === 21) {
                        if (soutable[isource].data.STAID === actstaid) {
                            if (soutable[isource].data.SOUID === actsouid || soutable[isource].data.SOUID === sec1 || soutable[isource].data.SOUID === sec2) {
                                ifound = isource;
                                stationdata = soutable[isource].data;
                                // Gefunden-Stammdaten:000002000005/2/5
                                break;
                            }
                        }
                    }
                }
                if (ifound === -1) {
                    for (var isource = 0; isource < statable.length; isource++) {
                        if (statable[isource].dmode === 21) {
                            if (statable[isource].data.STAID === actstaid) {
                                ifound = isource;
                                stationdata = statable[isource].data;
                                stationdata.SOUID = actsouid;
                                stationdata.SOUNAME = stationdata.STANAME;
                                break;
                            }
                        }
                    }
                }
                if (ifound === -1) {
                    console.log("Keine Stammdaten:" + souid + "/" + actstaid + "/" + actsouid);
                    nextsouid();
                    return;
                }
                var starec = {};
                starec.source = "ECAD";
                starec.stationid = souid;
                starec.name = stationdata.SOUNAME || "";
                starec.longitude = stationdata.LON || "";
                starec.latitude = stationdata.LAT || "";

                starec.latitude = uihelper.convertDMS2dd(stationdata.LAT).toFixed(5).replace(/\.?0+$/, '');
                starec.longitude = uihelper.convertDMS2dd(stationdata.LON).toFixed(5).replace(/\.?0+$/, '');
                var latobj = kla9020fun.getlatfieldsp(starec.latitude);
                starec.lat = latobj.lat;
                starec.latn = latobj.latn;
                starec.lats = latobj.lats;

                starec.height = stationdata.HGHT || stationdata.HGTH || "";

                var country = crg.get_country(parseFloat(starec.latitude), parseFloat(starec.longitude));
                if (typeof country !== "undefined" && country !== null) {
                    var countrydata = countries[country.code];
                    if (typeof countrydata !== "undefined" && countrydata !== null) {
                        console.log(starec.name + "=>" + country.code + " " + country.name + "=>" + countrydata.region);
                        delete countrydata.history;
                        delete countrydata.tsserverupd;
                        delete countrydata._id;
                        starec = Object.assign(starec, countrydata);
                        delete starec.history;
                        delete starec.tsserverupd;
                        delete starec.values;
                        delete starec._id;
                    } else {
                        console.log(starec.name + "=>" + "NODATA");
                    }
                } else {
                    console.log(starec.name + "=>" + "NO-REVERSE");
                }
                /**
                 * Klimazone bestimmen
                 */
                var vgllat = parseFloat(starec.latitude);
                if (vgllat > 60) {
                    starec.climatezone = "N0-North Cold 60-90";
                } else if (vgllat > 40) {
                    starec.climatezone = "N1-North Moderate 40-60";
                } else if (vgllat > 23.5) {
                    starec.climatezone = "N2-North Subtrop 23,5-40";
                } else if (vgllat > 0) {
                    starec.climatezone = "N3-North Tropic 0-23,5";
                } else if (vgllat < -60) {
                    starec.climatezone = "S0-South Cold 60-90";
                } else if (vgllat < -40) {
                    starec.climatezone = "S1-South Moderate 40-60";
                } else if (vgllat < -23.5) {
                    starec.climatezone = "S2-South Subtrop 23,5-40";
                } else {
                    starec.climatezone = "S3-South Tropic 0-23,5";
                }

                starec.firstyear = (stationdata.START || "").substr(0, 4);
                starec.firstyearok = (stationdata.START || "").substr(0, 4);
                starec.fromyear = (stationdata.START || "").substr(0, 4);
                starec.toyear = (stationdata.STOP || "").substr(0, 4);
                starec.anzyears = parseInt(starec.toyear) - parseInt(starec.fromyear) + 1;
                starec.parid = (stationdata.PARID || " ").trim();
                starec.parname = (stationdata.PARNAME || " ").trim();
                starec[targetvar] = {};
                starec[targetvar].years = years[souid];
                var ys = Object.keys(starec[targetvar]);
                // immer berechnen - speziell wenn source nicht gefunden wurde
                for (var iys = 0; iys < ys.length; iys++) {
                    if (starec.firstyear.length === 0) {
                        starec.firstyear = ys[iys];
                        starec.firstyearok = ys[iys];
                    } else if (starec.firstyear > ys[iys]) {
                        starec.firstyear = ys[iys];
                        starec.firstyearok = ys[iys];
                    }
                    if (starec.toyear.length === 0) {
                        starec.toyear = ys[iys];
                    } else if (starec.firstyear > ys[iys]) {
                        starec.toyear = ys[iys];
                    }
                }
                starec.anzyears = parseInt(starec.toyear) - parseInt(starec.fromyear) + 1;
                starec.realyears = ys.length;
                var reqparm = {};
                reqparm.selfields = {
                    source: "ECAD",
                    stationid: starec.stationid
                };
                reqparm.updfields = {};
                reqparm.updfields["$setOnInsert"] = {
                    source: "ECAD",
                    stationid: starec.stationid
                };
                delete starec.source;
                delete starec.stationid;
                reqparm.updfields["$set"] = starec;
                reqparm.table = "KLISTATIONS";
                console.log("update requested:" + souid + " " + reqparm.updfields["$set"].name);
                /*
                if (typeof starec.tmax !== "undefined") {
                    countmax++;
                    if (countmax < 3)  debugger;
                }
                if (typeof starec.tmin !== "undefined") {
                    countmin++;
                    if (countmin < 3)  debugger;
                }
                */
                sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret) {
                    anzecads += 1;
                    // if (anzecads > 120) {
                    //    nextsouid("false");
                    //    return;
                    //} else {
                    nextsouid();
                    return;
                    //}
                });
            },
            function (err) {
                callback47({
                    error: false,
                    message: "OK"
                });
                return;
            });
    };


    /**
     * Perlschnüre im Detail aufbereiten
     */
    kla1490srv.getFileTxtData = function (zip, filname, StreamZip, callback46) {
        console.log("getFileTxtData:" + filname);
        var fldtable = [];
        var laststr = "";
        var years = {};
        var targetelem = "";
        var targetvar = "";
        // filname = TX_STAID999999.txt
        if (filname.startsWith("TX")) {
            targetelem = "TX";
            targetvar = "tmax";
        } else if (filname.startsWith("TN")) {
            targetelem = "TN";
            targetvar = "tmin";
        }

        /**
         * csv auseinandernehmen
         * https://stackoverflow.com/questions/39705209/node-js-read-a-file-in-a-zip-without-unzipping-it
         * https://github.com/C2FO/fast-csv/blob/HEAD/docs/parsing.md#csv-parse
         */
        var filetext = ""; //  zip.entryDataSync(filename).toString('utf8');
        var counter = 0;
        var dmode = 0;
        var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var firstfieldname = "";
        var lastrest = "";
        var lastlength = 0;
        var anzinchunk = 0;
        zip.stream(filname, function (err, stm) {
            stm.on('data', function (chunk) {
                var str = laststr + chunk.toString();
                laststr = "";
                // zeilenweise dynamisch abarbeiten
                counter = 0;
                var idis = 0;
                var skip = false;
                var vglyear = "";
                /** 
                 * icount ist laufvariable, zählt die loops
                 * idis ist die aktuelle/letzte Position
                 * inext ist das gefundene Zeilenende
                 * wenn lastrest vorhanden ist, dann mit nächstem Chunk zusammenführen
                 */
                for (var icount = 0; icount < str.length; icount++) {
                    var inext = str.indexOf("\n", idis);
                    if (typeof idis === "undefined") {
                        break;
                    }

                    if (inext <= 0) {
                        var lastline = str.substring(idis, str.length);
                        if (lastline.length < lastlength - 1) {
                            laststr = str.substr(idis);
                            // console.log("Übernahme Rest:" + laststr + " =>Break");
                            break;
                        }
                        // weiter, wenn eine volle Zeile vorliegt!!!, das ist dann die letze Zeile
                    }
                    if (inext >= 0) {
                        var line = str.substring(idis, inext);
                        if (line.length === 0) {
                            // console.log("Satz leer =>Skip");
                            idis++;
                            continue;
                        }
                        /**
                         * Kontrollen zum Testen
                         */
                        counter++;
                        // if (counter <= 50) console.log("Pos:" + idis + " Len:" + inext + "=>" + line);
                        /**
                         * hier findet die Verarbeitung der Zeile statt
                         */
                        skip = false;
                        if (dmode === 0) {
                            // 1. Trigger FILE FORMAT
                            if (line.startsWith("FILE FORMAT")) {
                                dmode = 1;
                                skip = true;
                            }
                        }
                        if (dmode === 1 && skip === false) {
                            var data = kla1490srv.getLocFieldFormat(line);
                            if (data.error === true && fldtable.length > 0) {
                                skip = true;
                                dmode = 20;
                            } else if (data.error === false) {
                                if (firstfieldname.length === 0) {
                                    firstfieldname = data.name;
                                }
                                for (var key in data) {
                                    if (typeof data[key] === "string") {
                                        data[key] = data[key].trim();
                                    }
                                }
                                fldtable.push({
                                    dmode: dmode,
                                    data: data
                                });
                            }
                        }
                        if (dmode === 20 && skip === false) {
                            // Suche nach dem Header der Daten, trigger
                            if (line.startsWith(firstfieldname)) {
                                dmode = 21;
                                skip = true;
                            }
                        }
                        if (dmode === 21 && skip === false) {
                            // Suche nach den Daten
                            if (line.trim().length === 0) {
                                idis++;
                                // console.log("empty record skipped");
                                continue;
                            }
                            var data1 = kla1490srv.getFieldData(fldtable, line);
                            for (var key1 in data1) {
                                if (typeof data1[key1] === "string") {
                                    data1[key1] = data1[key1].trim();
                                }
                            }
                            if (Object.keys(fldtable).length !== Object.keys(data1).length) {
                                console.log("Satz zu kurz:" + Object.keys(fldtable).length + "/" + Object.keys(data1).length + ":" + line);
                                // auch hier ist eine Übergabe notwendig
                                laststr = str.substr(idis);
                                // console.log("Übernahme Rest (Break):" + laststr);
                                break;
                            } else {
                                lastlength = line.length;
                            }

                            /**
                             * hier wird data nach years aufbereitet  
                             * STAID, SOUID,    DATE,   TX, Q_TX
                             * TX steht hier für ein Merkmal, die Umsetzung erfolgt dediziert, 
                             * hier wird aus TX ein tmax in KLISTATIONS
                             *      1,     2,19180101,    0,    0
                             *      1,     2,19180102,  -40,    0
                             * leapyear/Schaltjahr (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
                             */
                            var staid = ("000000" + data1.STAID.trim()).slice(-6);
                            var souid = staid + ("000000" + data1.SOUID.trim()).slice(-6);
                            // Gefunden-Stammdaten:000002000005/2/5
                            if (souid !== vglsouid) {
                                if (souid === "000002000005") debugger;
                                if (typeof years[souid] === "undefined") {
                                    years[souid] = {};
                                }
                                vglyear = "";
                            }
                            vglsouid = souid;

                            var ddatum = data1.DATE;
                            var djahr = parseInt(ddatum.substr(0, 4));
                            var sjahr = ddatum.substr(0, 4);
                            var dmon = parseInt(ddatum.substr(4, 2));
                            var dday = parseInt(ddatum.substr(6, 2));
                            var anzdays = 365;
                            var isleapyear = (djahr % 4 === 0 && djahr % 100 !== 0) || djahr % 400 === 0;
                            if (isleapyear) {
                                mdtable[1] = 29;
                                anzdays = 366;
                            } else {
                                mdtable[0] = 28;
                            }
                            var dayofyear = 0;
                            for (var imon = 1; imon < dmon; imon++) {
                                dayofyear += mdtable[imon - 1];
                            }
                            if (vglyear !== sjahr) {
                                if (typeof years[souid][sjahr] === "undefined") {
                                    years[souid][sjahr] = new Array(anzdays).fill("");
                                }
                            }
                            vglyear = sjahr;
                            dayofyear += dday - 1; // wird als JS-Index verwendet, daher -1
                            try {
                                var temperatur = data1[targetelem].trim();
                                if (temperatur === "-9999") {
                                    years[souid][sjahr][dayofyear] = null;
                                } else {
                                    var tlen = temperatur.length;
                                    temperatur = temperatur.substr(0, tlen - 1) + "." + temperatur.substr(tlen - 1, 1);
                                    years[souid][sjahr][dayofyear] = temperatur;
                                }
                            } catch (err) {
                                console.log("ERROR:" + souid + " " + sjahr + " " + dayofyear + "=>" + data1.targetelem);
                                console.log(err);
                                console.log(err.stack);
                            }
                        }
                        idis = inext + 1;
                    }
                }
            });
            stm.on('end', function () {
                /**
                 * Verarbeitung des Restes aus dem Buffer u.U. bzw. prüfen
                 * hier werden die Daten ausgegeben oder zurückgegeben
                 */
                if (laststr.length > 0) {
                    console.log("DER REST:" + laststr + " Anz Fields:" + fldtable.length);
                }
                callback46({
                    error: false,
                    message: "getseldata finished",
                    years: years,
                    fldtable: fldtable,
                    targetelem: targetelem,
                    targetvar: targetvar
                });
            });
        });

    };



    /** 
     * kla1490srv.getSourcesTxtData = function (zip, filename, fldtable, statable) {
     * übernommen aus ghc1030dta.getSourcesTxtData(zip, "elements.txt", varfldtable, varstatable);
     */

    kla1490srv.getSourcesTxtData = function (zip, filename, fldtable, statable) {
        /**
         * csv auseinandernehmen
         * https://stackoverflow.com/questions/39705209/node-js-read-a-file-in-a-zip-without-unzipping-it
         * https://github.com/C2FO/fast-csv/blob/HEAD/docs/parsing.md#csv-parse
         */
        var filetext = zip.entryDataSync(filename).toString('utf8');
        // Der String muss erst mal aufbereitet werden, weil die csv/ascii-Daten erst spät kommen
        // STAID, SOUID, SOUNAME - Trigger für Header-Line, genauer: alles vorher weg
        /**
         * inline parsen - weil nicht normgerechte Daten, aber einheitlich 
         */
        var dmode = 0;
        var idis = 0;
        var firstfieldname = "";
        for (var iline = 0; iline < 200000; iline++) {
            // get next line
            var ilf = filetext.indexOf("\n", idis);
            if (ilf < 0) break;
            var line = filetext.substring(idis, ilf);
            line = line.trim();
            idis = ilf + 1;
            // cr noch absichern = entfernen
            // detect FILE FORMAT
            if (dmode === 0) {
                if (line.startsWith("FILE FORMAT")) {
                    dmode = 10;
                    statable.push({
                        dmode: dmode,
                        data: line
                    });
                    // chance für dynamisches Nachlesen nach Jackson
                    // skip empty line
                    ilf = filetext.indexOf("\n", idis);
                    if (ilf < 0) break;
                    idis = ilf + 1;
                    for (var iline1 = 0; iline1 < 200000; iline1++) {
                        ilf = filetext.indexOf("\n", idis);
                        if (ilf < 0) break;
                        line = filetext.substring(idis, ilf);
                        idis = ilf + 1;
                        line = line.trim();
                        if (line.length < 2) {
                            break;
                        }
                        var data = kla1490srv.getLocFieldFormat(line);
                        if (firstfieldname.length === 0) {
                            firstfieldname = data.name;
                        }
                        for (var key in data) {
                            if (typeof data[key] === "string") {
                                data[key] = data[key].trim();
                            }
                        }
                        fldtable.push({
                            dmode: dmode,
                            data: data
                        });
                    }
                    dmode = 11;
                    if (ilf < 0) break;
                }
            }
            // detect HEADER-Line
            if (dmode === 11) {
                ilf = filetext.indexOf("\n", idis);
                if (ilf < 0) break;
                line = filetext.substring(idis, ilf);
                line = line.trim();
                idis = ilf + 1;
                //if (line.startsWith("STAID")) {
                if (line.startsWith(firstfieldname)) {
                    dmode = 20;
                    statable.push({
                        dmode: dmode,
                        data: line
                    });
                    // skip empty line
                    ilf = filetext.indexOf("\n", idis);
                    if (ilf < 0) break;
                    idis = ilf + 1;
                    dmode = 21;
                }
            }
            // detect DATA-Lines
            if (dmode === 21) {
                for (var iline2 = 0; iline2 < 200000; iline2++) {
                    ilf = filetext.indexOf("\n", idis);
                    if (ilf < 0) break;
                    line = filetext.substring(idis, ilf);
                    idis = ilf + 1;
                    if (line.trim().length < 2) {
                        break;
                    }
                    var data1 = kla1490srv.getFieldData(fldtable, line);
                    for (var key1 in data1) {
                        if (typeof data1[key1] === "string") {
                            data1[key1] = data1[key1].trim();
                        }
                    }
                    statable.push({
                        dmode: dmode,
                        data: data1
                    });
                }
                break;
            }
        }
        console.log("fertig");
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
     * getallclimatedata -Wrapper um getallrecords für KLISTATIONS
     * @param  {} gbldb - Datenbankverbindung
     * @param  {} async - async-Modul
     * @param  {} req - Request aus AJAX
     * @param  {} reqparm - Request aus Parameterübergabe
     * @param  {} res - Response aus AJAX
     * @param  {} callbackcd returns (res, ret)
     */
    kla1490srv.getallclimatedata = function (gbldb, async, sys0000sys, kla9020fun, uihelper, req, reqparm, res, callbackcd) {

        var sel = {};
        var selfunction = "";
        var starecord = {};
        var projection = {};
        var sort = {};
        var selrecord = {};
        var selarray = [];
        if (typeof reqparm !== "undefined" && reqparm !== null) {
            selrecord = reqparm.starecord;
            if (typeof reqparm.starecord.datasel !== "undefined" && typeof reqparm.starecord.datasel.tabelle !== "undefined") {
                selarray = reqparm.starecord.datasel.tabelle;
            }
            projection = reqparm.projection;
            sort = reqparm.sort;
        } else {
            selrecord = req.body.starecord;
            if (typeof req.body.starecord.datasel !== "undefined" && typeof req.body.starecord.datasel.tabelle !== "undefined") {
                selarray = req.body.starecord.datasel.tabelle;
            }
            projection = req.body.projection;
            sort = req.body.sort || {};
        }
        starecord.source = selrecord.source;
        starecord.variablename = selrecord.variablename;
        starecord = Object.assign(starecord, selrecord.stasel);



        selvariablename = starecord.variablename; // wird erst später gebraucht
        if (typeof starecord.source !== "undefined" && starecord.source.length > 0) {
            sel.source = starecord.source;
        }
        if (typeof starecord.stationid !== "undefined" && starecord.stationid.length > 0) {
            sel.stationid = starecord.stationid;
        }
        if (typeof starecord.name !== "undefined" && starecord.name.length > 0) {
            sel.name = {
                "$regex": starecord.name,
                "$options": "i"
            };
        }
        if (typeof starecord.region !== "undefined" && starecord.region.length > 0) {
            sel.$or = [{
                    region: {
                        "$regex": starecord.region,
                        "$options": "i"
                    }
                },
                {
                    subregion: {
                        "$regex": starecord.region,
                        "$options": "i"
                    }
                },
                {
                    countryname: {
                        "$regex": starecord.region,
                        "$options": "i"
                    }
                }
            ];
        }
        if (typeof starecord.anzyears !== "undefined" && starecord.anzyears.trim().length > 0) {
            sel.anzyears = kla9020fun.getComparator(starecord.anzyears);
        }
        var effyears = 0;
        if (typeof starecord.effyears !== "undefined" && starecord.effyears.trim().length > 0) {
            effyears = parseInt(starecord.effyears);
            delete starecord.effyears;
        }
        if (typeof starecord.fromyear !== "undefined" && starecord.fromyear.trim().length > 0) {
            //sel.fromyear = kla9020fun.getComparator(starecord.fromyear);
            var selparts = starecord.fromyear.match(/(<=|>=|<|>|=)(\d*)/);

            if (selparts === null) {
                if (starecord.fromyear.length > 0) {
                    sel.fromyear = starecord.fromyear;
                }
            } else if (selparts.length >= 2) {
                selfunction += "if (parseInt(this.fromyear) " + selparts[1] + " " + selparts[2] + ") {" +
                    " return true;" +
                    "} else {" +
                    " return false;" +
                    "}";
            }
        }
        if (typeof starecord.toyear !== "undefined" && starecord.toyear.trim().length > 0) {
            //sel.toyear = kla9020fun.getComparator(starecord.toyear);
            var selparts = starecord.toyear.match(/(<=|>=|<|>|=)(\d*)/);
            if (selparts === null) {
                if (starecord.toyear.length > 0) {
                    sel.toyear = starecord.toyear;
                }
            } else if (selparts.length >= 2) {
                selfunction += "if (parseInt(this.toyear) " + selparts[1] + " " + selparts[2] + ") {" +
                    " return true;" +
                    "} else {" +
                    " return false;" +
                    "}";
            }
        }
        if (typeof starecord.climatezone !== "undefined" && starecord.climatezone.trim().length > 0) {
            // sel.climatezone = kla9020fun.getComparator (starecord.toyear);
            // sel.$where = "function() {"
            selfunction += "var cz = '" + starecord.climatezone.substr(0, 2) + "';" +
                "if (this.climatezone.substr(0,2) === cz) {" +
                "return true;" +
                "} else {" +
                "return false;" +
                "}";
            // Zerlegung mit Regex
        }

        if (typeof starecord.height !== "undefined" && starecord.height.trim().length > 0) {
            //sel.height = kla9020fun.getComparator (starecord.height);

            var selparts = starecord.height.match(/(<=|>=|<|>|=)(\d*)/);
            if (selparts.length >= 2) {
                selfunction += "if (this.height " + selparts[1] + " " + selparts[2] + ") {" +
                    " return true;" +
                    "} else {" +
                    " return false;" +
                    "}";
            }

            // };
        }
        if (selfunction.length > 0) {
            sel.$where = "function() {" +
                selfunction +
                "};";
        }

        var skip = 0;
        var limit = 0;
        var api = "getallrecords";
        var table = "KLISTATIONS";

        var reqparm = {};
        reqparm.sel = sel;
        reqparm.projection = projection;
        reqparm.skip = skip;
        reqparm.limit = limit;
        reqparm.api = api;
        reqparm.table = table;
        var singleyears = false;
        var totyears = 0;
        /** 
         * Berechnung der effektiven Jahre - aus der Vorgabe
         */
        for (var isel = 0; isel < selarray.length; isel++) {
            if (selarray[isel].year1.length === 0) selarray[isel].year1 = "0";
            if (selarray[isel].year2.length === 0) selarray[isel].year2 = "0";
            selarray[isel].year1 = parseInt(selarray[isel].year1);
            selarray[isel].year2 = parseInt(selarray[isel].year2);
            if (selarray[isel].year2 === 0) selarray[isel].year2 = selarray[isel].year1;
            totyears += selarray[isel].year2 - selarray[isel].year1 + 1;
        }
        /** 
         * Aufbereitung projection - Einzeljahre oder "alle" generisch 
         */
        if (totyears > 0 && totyears <= 60) {
            //<variablename>.years raus und explizit rein
            var name = selvariablename + ".years";
            delete projection[name];
            for (var isel = 0; isel < selarray.length; isel++) {
                for (var iyear = selarray[isel].year1; iyear <= selarray[isel].year2; iyear++) {
                    name = selvariablename + ".years." + iyear;
                    projection[name] = 1;
                }
            }
        } else {
            var name = selvariablename + ".years";
            projection[name] = 1;
        }

        sys0000sys.getallrecords(gbldb, async, req, reqparm, res, function (res, ret) {
            // sys0000sys.getallrecords(sel, projection, sort, skip, limit, api, table, function(ret) {
            // Iteration über das Array records mit selarray, year1, year2
            // prepare selarray
            if (ret.error === true) {
                console.log("getallclimatedata-ERROR:" + ret.message);
                ret.records = [];
                callbackcd(res, ret);
                return;
            } else if (typeof ret.records === "undefined" || ret.records === null || ret.records.length === 0) {
                ret.message = "Keine Daten gefunden";
                ret.records = [];
                console.log("getallclimatedata:" + ret.message);
                callbackcd(res, ret);
                return;
            }
            var records = ret.records;
            var idels = 0;
            var ikeeps = 0;
            if (totyears > 0) {
                for (var irec = records.length - 1; irec >= 0; irec--) {
                    var record = records[irec];
                    var yearnumbers = Object.keys(record[selvariablename].years);
                    var ifound = 0; // gefundene Jahre mit Daten
                    var ydels = 0; // gelöschte Jahre
                    for (var iyear = yearnumbers.length - 1; iyear >= 0; iyear--) {
                        var yearnumber = parseInt(yearnumbers[iyear]);
                        for (var isel1 = 0; isel1 < selarray.length; isel1++) {
                            if (yearnumber >= selarray[isel1].year1 && yearnumber <= selarray[isel1].year2) {
                                var mohits = 0;
                                var months = record[selvariablename].years[yearnumber];
                                for (var imo = 0; imo < 12; imo++) {
                                    if (months[imo] !== null) mohits++;
                                }
                                if (mohits > 0) {
                                    ifound++;
                                } else {
                                    record[selvariablename].years["" + yearnumber] = null;
                                    delete record[selvariablename].years["" + yearnumber];
                                    ydels++;
                                }
                            } else {
                                record[selvariablename].years["" + yearnumber] = null;
                                delete record[selvariablename].years["" + yearnumber];
                                ydels++;
                            }
                        }
                    } // for iyear
                    if (ifound === 0) {
                        console.log("skipped:" + record.stationid + " " + record.name + " mit:" + ifound);
                        ret.records.splice(irec, 1);
                        idels++;
                    } else if (ifound > 0 && effyears > 0 && ifound >= effyears || effyears === 0 && ifound > 0) {
                        // nix, weil Limit erreicht/überschritten
                        console.log("gefunden:" + record.stationid + " " + record.name + " mit:" + ifound);
                    } else {
                        console.log("skipped:" + record.stationid + " " + record.name + " mit:" + ifound);
                        ret.records.splice(irec, 1);
                        idels++;
                    }
                } // for records
            }
            if (idels > 0) {
                console.log("getallclimatedata:" + ret.records.length || 0 + " skipped:" + idels);
                callbackcd(res, ret);
                return;
            } else {
                console.log("getallclimatedata:" + ret.records.length || 0);
                callbackcd(res, ret);
                return;
            }
        });
    };


    /**
     * ghcn - Stations aus .inv lesen und nach KLISTATIONS übernehmen
     * callback res, ret
     */
    var stations = {};
    var xstations = {};
    var latprofile = {};
    var yearlats = {};
    var linereader = null;
    kla1490srv.ghcninv2stations = function (gblInfo, gbldb, fs, async, stream, readline, sys0000sys, kla9020fun, req, res, supercallback1) {
        latprofile = {};
        yearlats = {};
        console.log("ghcninv2stations gestartet");
        var fullname = "";
        if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
            fullname = req.query.fullname;
        }
        var value = "";
        if (fullname.indexOf("tmin") > 0) {
            value = "tmin";
        }
        if (fullname.indexOf("tmax") > 0) {
            value = "tmax";
        }
        if (fullname.indexOf("tavg") > 0) {
            value = "tavg";
        }
        var seltype = "GHCN";
        if (fullname.indexOf("v4") > 0) {
            seltype = "GHCN4";
        }
        var invschema = [{
                name: "stationid", // "ID",
                von: "1",
                bis: "11",
                type: "Integer" // Integer hat 2 Stellen Präfix GM
            },
            {
                name: "latitude", // "LATITUDE",
                von: "13",
                bis: "20",
                type: "Real" // ist string mit real-Formatierung
            },
            {
                name: "longitude", // "LONGITUDE",
                von: "22",
                bis: "30",
                type: "Real"
            },
            {
                name: "height", // "STNELEV",
                von: "32",
                bis: "37",
                type: "Real"
            },
            {
                name: "name", // "NAME",
                von: "39",
                bis: "68",
                type: "Character"
            }
        ];

        async.waterfall([
                function (callback1) {
                    if (!fs.existsSync(fullname)) {
                        callback1("error", {
                            error: true,
                            message: "Datei nicht gefunden:" + fullname
                        });
                        return;
                    } else {
                        callback1(null, {
                            error: false,
                            message: "Datei vorhanden",
                            fullname: fullname
                        });
                    }
                },
                function (ret, callback1) {
                    var counter = 0;
                    var html = "";
                    var rl = readline.createInterface({
                        input: fs.createReadStream(ret.fullname)
                    });
                    // event is emitted after each line
                    rl.on('line', function (line) {
                        var that = this;
                        counter++;
                        var invrecord = {};
                        for (var i = 0; i < invschema.length; i++) {
                            var val1 = line.substring(invschema[i].von - 1, invschema[i].bis).trim();
                            var fld1 = invschema[i].name;
                            invrecord[fld1] = val1;
                        }

                        var lat = invrecord.latitude;
                        var latobj = kla9020fun.getlatfieldsp(lat);
                        invrecord.latn = latobj.latn;
                        invrecord.lats = latobj.lats;
                        /*
                        var latn;
                        lat = lat.substr(0, lat.indexOf("."));
                        if (lat.startsWith("-")) {
                            latn = "S" + lat.substr(1);
                        } else {
                            latn = "N" + lat;
                        }
                        invrecord.latn = latn;
                        invrecord.lats = lat.substr(0, 1) + ("000" + lat.substr(1)).slice(-3);
                        if (typeof latprofile[latn] === "undefined") {
                            latprofile[latn] = {
                                count: 0
                            };
                        }
                        */
                        var reqparm = {};
                        reqparm.selfields = {
                            source: seltype,
                            stationid: invrecord.stationid
                        };
                        reqparm.updfields = {};
                        reqparm.updfields["$setOnInsert"] = {
                            source: seltype,
                            stationid: invrecord.stationid
                        };
                        reqparm.updfields["$addToSet"] = {
                            values: value
                        };
                        delete invrecord.source;
                        delete invrecord.stationid;
                        reqparm.updfields["$set"] = invrecord;
                        reqparm.table = "KLISTATIONS";
                        console.log("update requested:" + invrecord.name);
                        async.waterfall([
                            function (callbackks) {
                                sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret) {
                                    //console.log("setonerecord-returned:" + JSON.stringify(ret));
                                    console.log("update finished:" + ret.record.name);
                                    that.resume(); // holt den nächsten Satz, auch aus waterfall
                                });
                            }
                        ]);
                    });
                    // end
                    rl.on('close', function (line) {
                        console.log('Total lines : ' + counter);
                        callback1(null, {
                            error: false,
                            message: "geladen:" + ret.fullname + " " + counter,
                            /* latprofile: latprofile, */
                            yearlats: yearlats,
                            html: html
                        });
                    });
                }
            ],
            function (error, ret) {
                console.log("ghcninv2stations beendet");
                supercallback1(res, ret);
                return;
            });
    };


    /**
     * datfilename - datschema ASCII fix
     * 1234567890123456789012345678901234567890123456789012345678901234567890
     * 101603550001995TMIN-9999   -9999     980  G 1100  G 1700  G 1910  G 2160  G-9999    2040  G-9999    1380  G 1230  G
     * 101603550001996TMIN-9999   -9999    1100  G 1270  G 1490  G 1820  G 2110  G 2280  G 1850  G 1490  G 1310  G 1140  G
     * 425000406931966TMIN  567  U  584  U  760  U  966  U  997  U 1105c U-9999   -9999    1229b U 1128  U  927  U  597  U
     * 133610990002010TMIN 1950  K-9999    2670  K-9999    2750  K-9999   -9999   -9999    2340  K 2380  K-9999   -9999   
     */
    var datschema = [{
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
            name: "variable", // "ELEMENT",
            von: "16",
            bis: "19",
            type: "Character"
        }
    ];
    /**
     * 12 Buckets für 12 Monate
     */
    var monschema = [{
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
     * crutem4complete - macht alles für CRUTEM4
     * returns function (res, ret)
     */
    kla1490srv.crutem4complete = function (gblInfo, gbldb, fs, path, rootname, async, stream, readline, sys0000sys, kla9020fun, req, res, supercallback) {

        async.waterfall([
                function (callbackcc) {
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
                    var ret = {};
                    ret.fullname = fullname;
                    ret.source = source;
                    ret.selyears = selyears;
                    if (!fs.existsSync(ret.fullname)) {
                        callbackcc("error", res, {
                            error: true,
                            message: "Datei nicht gefunden:" + ret.fullname
                        });
                        return;
                    }
                    if (ret.source === "CRUTEM4") {
                        callbackcc(null, res, ret);
                        return;
                    } else {
                        ret.error = true;
                        ret.message = "Falscher Input";
                        callbackcc("Error", res, ret);
                        return;
                    }
                },
                function (res, ret, callbackcc) {
                    /**
                     * KLICOUNTRIES laden
                     */
                    var reqparm = {};
                    reqparm.table = "KLICOUNTRIES";
                    reqparm.sel = {};
                    reqparm.projection = {};
                    sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            ret.message += " keine KLICOUNTRIES:" + err;
                            ret.countries = {};
                            callbackcc(null, res, ret);
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
                                callbackcc(null, res, ret);
                                return;
                            } else {
                                ret.message += " keine KLICOUNTRIES";
                                ret.countries = {};
                                callbackcc(null, res, ret);
                                return;
                            }
                        }
                    });
                },

                function (res, ret, callbackcc) {
                    var fullfilename = ret.fullname;
                    var starec = {};
                    ret.stations = {};
                    var counter = 0;
                    var linecounter = 0;
                    /*
                    var rl = readline.createInterface({
                        input: fs.createReadStream(fullfilename)
                    });
                    */
                    // var LineByLineReader = require('line-by-line');
                    var fullfilename = ret.fullname;
                    if (linereader === null) linereader = require("line-reader");
                    // var rl = new LineByLineReader(ret.fullname);
                    // event is emitted after each line
                    // rl.on('line', function (line) {
                    linereader.eachLine(fullfilename, function (line, last, cb) {
                        // var that = this;
                        // rl.pause();
                        if (last === false) {
                            linecounter++;
                            var datrecord = {};
                            var lastbis = 0;
                            /**
                             * eigene Satzart für die Daten, wechselnd mit Stationsdaten
                             *  10010 709   87   10 Jan Mayen            NORWAY        19212011  541921    1  287
                             *1921  -44  -71  -68  -43   -8   22   47   58   27  -20  -21  -40                                    
                             *1922   -9  -17  -62  -37  -16   29   48   63   27   -2  -38  -26
                             * Erkennungsregel: 4 Stellen numerisch vorne => Datensatz dat4schema
                             */
                            // Prüfung Station-Satz srec oder Data-Satz drec
                            if (line.substr(4, 1) === " ") {
                                datrecord.year = line.substr(0, 4);
                                datrecord.months = [];
                                // Monate holen
                                var ivon = 4 + 1;
                                for (imon = 0; imon < 12; imon++) {
                                    var idis = ivon + imon * 5;
                                    var value;
                                    value = line.substr(idis + 1, 4).trim();
                                    if (value === "999" || value === "-999") {
                                        value = null;
                                    } else {
                                        var len = value.length;
                                        value = value.substr(0, len - 1) + "." + value.substr(len - 1, 1);
                                    }
                                    datrecord.months[imon] = {
                                        leer: line.substr(idis, 1),
                                        tavg: value
                                    };
                                }
                                /**
                                 * hier ist datrecord vorhanden für ein Jahr
                                 */
                                var year = datrecord.year;
                                var months = [];
                                for (var imo = 0; imo < 12; imo++) {
                                    if (typeof datrecord.months[imo] === "undefined") {
                                        months.push(null);
                                    } else {
                                        months.push(datrecord.months[imo].tavg);
                                    }
                                }
                                if (typeof starec.tavg === "undefined") {
                                    starec.tavg = {};
                                }
                                if (typeof starec.tavg.years === "undefined") {
                                    starec.tavg.years = {};
                                }
                                if (typeof starec.tavg.years[year] === "undefined") {
                                    starec.tavg.years[year] = months;
                                }
                                // rl.resume(); // holt den nächsten Satz, auch aus waterfall
                                // return;
                                cb(true);
                                return;
                            } else {
                                /**
                                 * Update alte Station, wenn vorhanden
                                 * und dann neue line verarbeiten
                                 */
                                if (Object.keys(starec).length > 0 && typeof starec.tavg !== "undefined") {
                                    var kyears = Object.keys(starec.tavg.years);

                                    starec.fromyear = kyears[0];
                                    starec.toyear = kyears[kyears.length - 1];
                                    starec.anzyears = parseInt(kyears[kyears.length - 1]) - parseInt(kyears[0]) + 1;
                                    // Besonderheit CRUTEM4: jahre mit 12 Monaten -999/null
                                    starec.realyears = 0;
                                    for (var ija = 0; ija < kyears.length; ija++) {
                                        var nonulls = 0;
                                        for (var imo = 0; imo < 12; imo++) {
                                            if (starec.tavg.years[ija][imo] !== null) {
                                                nonulls++;
                                            }
                                        }
                                        if (nonulls > 0) {
                                            starec.realyears++;
                                        }
                                    }
                                    var reqparm = {};
                                    reqparm.selfields = {
                                        source: ret.source,
                                        stationid: starec.stationid
                                    };
                                    reqparm.updfields = {};
                                    reqparm.updfields["$setOnInsert"] = {
                                        source: ret.source,
                                        stationid: starec.stationid
                                    };
                                    delete starec.source;
                                    delete starec.stationid;
                                    delete starec.history;
                                    reqparm.updfields["$set"] = starec;
                                    reqparm.table = "KLISTATIONS";
                                    counter++;
                                    if (counter === 1 || counter % 100 === 0) {
                                        console.log(counter + ". " + reqparm.selfields.stationid + " vor Update");
                                    }
                                    sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret1) {
                                        if (counter === 1 || counter % 100 === 0) {
                                            console.log(counter + ". " + ret1.record.stationid + " nach Update");
                                            /*
                                            var logmsg = counter + "/" + ret1.record.stationid + " " + ret1.record.name;
                                            console.log(logmsg);
                                            */
                                        }
                                        starec = {};
                                        kla1490srv.crutem4staline(ret, line, starec, kla9020fun);
                                        // rl.resume(); // holt den nächsten Satz, auch aus waterfall
                                        // return;
                                        cb(true);
                                        return;
                                    });
                                } else {

                                    starec = {};
                                    kla1490srv.crutem4staline(ret, line, starec, kla9020fun);
                                    //rl.resume(); // holt den nächsten Satz, auch aus waterfall
                                    cb(true);
                                    return;
                                }
                            }
                            // });
                            // end
                            // rl.on('close', function (line) {
                        } else {
                            /**
                             * Ende der Datei
                             * Update alte Station, wenn vorhanden
                             * und dann neue line verarbeiten
                             */
                            if (Object.keys(starec).length > 0) {
                                var kyears = Object.keys(starec.tavg.years);
                                starec.fromyear = kyears[0];
                                starec.toyear = kyears[kyears.length - 1];
                                starec.anzyears = parseInt(kyears[kyears.length - 1]) - parseInt(kyears[0]) + 1;
                                // Besonderheit CRUTEM4: jahre mit 12 Monaten -999/null
                                starec.realyears = 0;
                                for (var ija = 0; ija < kyears.length; ija++) {
                                    var nonulls = 0;
                                    for (var imo = 0; imo < 12; imo++) {
                                        if (starec.tavg.years[ija][imo] !== null) {
                                            nonulls++;
                                        }
                                    }
                                    if (nonulls > 0) {
                                        starec.realyears++;
                                    }
                                }
                                var reqparm = {};
                                reqparm.selfields = {
                                    source: ret.source,
                                    stationid: starec.stationid
                                };
                                reqparm.updfields = {};
                                reqparm.updfields["$setOnInsert"] = {
                                    source: ret.source,
                                    stationid: starec.stationid
                                };
                                delete starec.source;
                                delete starec.stationid;
                                delete starec.history;
                                reqparm.updfields["$set"] = starec;
                                reqparm.table = "KLISTATIONS";

                                console.log(counter + ". " + reqparm.selfields.stationid + " vor Update");

                                sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret1) {
                                    counter++;

                                    console.log(ret1.record.stationid + " nach Update - last one");
                                    /*
                                    var logmsg = counter + "/" + stationnr + " " + starec.name;
                                    if (typeof country !== "undefined" && country !== null) {
                                        logmsg += "=>" + country.code + " " + country.name + "=>" + countrydata.region;
                                    } else {
                                        logmsg += "=>Keine Region-Data";
                                    }
                                    console.log(logmsg);
                                    */

                                    callbackcc(null, res, ret);
                                    return;
                                });
                            } else {
                                console.log('Total lines : ' + linecounter);
                                callbackcc(null, res, ret);
                                return;
                            }
                            //});
                        }
                    });
                }
            ],
            function (error, res, ret) {
                supercallback(res, ret);
                return;
            });
    };


    kla1490srv.crutem4staline = function (ret, line, starec, kla9020fun) {
        /**
         * hier wird die neue Station angelegt
         */
        for (var i = 0; i < sta4schema.length; i++) {
            var val1 = line.substring(sta4schema[i].von - 1, sta4schema[i].bis).trim();
            var fld1 = sta4schema[i].name;
            starec[fld1] = val1;
            lastbis = sta4schema[i].bis;
        }
        // 
        var latfields = {};
        /*
        (ch. 8-11) Station latitude in degrees and tenths (-999 is missing), 
            with negative values in the Southern Hemisphere
        (ch. 12-16) Station longitude in degrees and tenths (-1999 is missing), 
            with negative values in the Eastern Hemisphere (NB this is opposite to the more usual convention)
        */

        if (starec.latitude === "-999") {
            console.log(starec.name + "=>" + starec.latitude);
            starec.latitude = null;
        } else {
            starec.latitude = (parseInt(starec.latitude) / 10).toFixed(1);
            latfields = kla9020fun.getlatfieldsp(starec.latitude);
        }
        if (starec.longitude === "-1999") {
            console.log(starec.name + "=>" + starec.longitude);
            starec.longitude = null;
        } else {
            starec.longitude = (parseInt(starec.longitude) * -1 / 10).toFixed(1);
        }
        starec.lat = latfields.lat;
        starec.latn = latfields.latn;
        starec.lats = latfields.lats;
        ret.stations[starec.stationid] = starec;
        /**
         * contry festellen und Datenkomplettierung
         */
        if (crg === null) {
            crg = require('country-reverse-geocoding').country_reverse_geocoding();
        }
        var country = crg.get_country(parseFloat(starec.latitude), parseFloat(starec.longitude));
        if (typeof country !== "undefined" && country !== null) {
            starec.alpha3 = country.code;
            starec.countryname = country.name;
            var countrydata = ret.countries[country.code];
            if (typeof countrydata !== "undefined" && countrydata !== null) {
                delete countrydata.history;
                delete countrydata.tsserverupd;
                delete countrydata._id;
                starec = Object.assign(starec, countrydata);
            }
        }
        /**
         * Klimazone bestimmen
         */
        var vgllat = parseFloat(starec.latitude);
        if (vgllat > 60) {
            starec.climatezone = "N0-North Cold 60-90";
        } else if (vgllat > 40) {
            starec.climatezone = "N1-North Moderate 40-60";
        } else if (vgllat > 23.5) {
            starec.climatezone = "N2-North Subtrop 23,5-40";
        } else if (vgllat > 0) {
            starec.climatezone = "N3-North Tropic 0-23,5";
        } else if (vgllat < -60) {
            starec.climatezone = "S0-South Cold 60-90";
        } else if (vgllat < -40) {
            starec.climatezone = "S1-South Moderate 40-60";
        } else if (vgllat < -23.5) {
            starec.climatezone = "S2-South Subtrop 23,5-40";
        } else {
            starec.climatezone = "S3-South Tropic 0-23,5";
        }
        starec.source = "CRUTEM4";
        starec.anzyears = 0;
        starec.fromyear = null;
        starec.toyear = null;
        starec.realyears = 0;
    };




    /**
     * ghcncomplete - macht alles
     * returns function (res, ret)
     */
    kla1490srv.ghcncomplete = function (gblInfo, gbldb, fs, path, rootname, async, stream, readline, sys0000sys, kla9020fun, req, res, supercallback) {

        async.waterfall([
                function (callbackgc) {
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
                    var ret = {};
                    ret.fullname = fullname;
                    ret.source = source;
                    ret.selyears = selyears;
                    if (ret.source === "GHCN" || ret.source === "GHCN4") {
                        var ext = path.extname(ret.fullname);
                        ret.fullnamestations = ret.fullname.replace(ext, ".inv");
                        if (ret.fullname.indexOf("tmin") > 0) {
                            ret.fullnametmin = ret.fullname;
                            ret.fullnametmax = ret.fullname.replace("tmin", "tmax");
                            ret.fullnametavg = ret.fullname.replace("tmin", "tavg");
                        } else if (ret.fullname.indexOf("tmax") > 0) {
                            ret.fullnametmax = ret.fullname;
                            ret.fullnametmin = ret.fullname.replace("tmax", "tmin");
                            ret.fullnametavg = ret.fullname.replace("tmax", "tavg");
                        } else if (ret.fullname.indexOf("tavg") > 0) {
                            ret.fullnametavg = ret.fullname;
                            ret.fullnametmin = ret.fullname.replace("tavg", "tmin");
                            ret.fullnametmax = ret.fullname.replace("tavg", "tmax");
                        }
                        callbackgc(null, res, ret);
                        return;
                    }
                },
                function (res, ret, callbackgc) {
                    /**
                     * KLICOUNTRIES laden
                     */
                    var reqparm = {};
                    reqparm.table = "KLICOUNTRIES";
                    reqparm.sel = {};
                    reqparm.projection = {};
                    sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            ret.message += " keine KLICOUNTRIES:" + err;
                            ret.countries = {};
                            callbackgc(null, res, ret);
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
                                callbackgc(null, res, ret);
                                return;
                            } else {
                                ret.message += " keine KLICOUNTRIES";
                                ret.countries = {};
                                callbackgc(null, res, ret);
                                return;
                            }
                        }
                    });
                },
                function (res, ret, callbackgc) {
                    /**
                     * KLISTATIONS neu aufbauen aus ret.fullnamestations
                     */
                    ret.invschema = [{
                            name: "stationid", // "ID",
                            von: "1",
                            bis: "11",
                            type: "Integer" // Integer hat 2 Stellen Präfix GM
                        },
                        {
                            name: "latitude", // "LATITUDE",
                            von: "13",
                            bis: "20",
                            type: "Real" // ist string mit real-Formatierung
                        },
                        {
                            name: "longitude", // "LONGITUDE",
                            von: "22",
                            bis: "30",
                            type: "Real"
                        },
                        {
                            name: "height", // "STNELEV",
                            von: "32",
                            bis: "37",
                            type: "Real"
                        },
                        {
                            name: "name", // "NAME",
                            von: "39",
                            bis: "68",
                            type: "Character"
                        }
                    ];
                    if (!fs.existsSync(ret.fullnamestations)) {
                        callbackgc("error", res, {
                            error: true,
                            message: "Datei nicht gefunden:" + ret.fullnamestations
                        });
                        return;
                    } else {
                        callbackgc(null, res, ret);
                        return;
                    }
                },
                function (res, ret, callbackgc) {
                    /**
                     * Lesen Stations-Datei und Update KLISTATIONS
                     */
                    var counter = 0;
                    var html = "";
                    ret.stations = {};
                    var LineByLineReader = require('line-by-line');
                    var rl = new LineByLineReader(ret.fullnamestations);
                    /*
                    var rl = readline.createInterface({
                        input: fs.createReadStream(ret.fullnamestations)
                    });
                    */
                    var invschema = ret.invschema;
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
                        var lat = invrecord.latitude;
                        var latobj = kla9020fun.getlatfieldsp(lat);
                        invrecord.latn = latobj.latn;
                        invrecord.lats = latobj.lats;
                        ret.stations[invrecord.stationid] = invrecord;
                        /**
                         * contry festellen und Datenkomplettierung
                         */
                        if (crg === null) {
                            crg = require('country-reverse-geocoding').country_reverse_geocoding();
                        }
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
                        delete invrecord.source;
                        delete invrecord.stationid;
                        delete invrecord.history;
                        reqparm.updfields["$set"] = invrecord;
                        reqparm.table = "KLISTATIONS";
                        sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret) {
                            if (counter % 100 === 0) {
                                var logmsg = counter + "/" + stationnr + " " + invrecord.name;
                                if (typeof country !== "undefined" && country !== null) {
                                    logmsg += "=>" + country.code || "" + " " + country.name || "" + "=>" + countrydata.region || "";
                                    // console.log(logmsg);
                                } else {
                                    logmsg += "=>Keine Region-Data";
                                    console.log(logmsg);
                                }

                            }
                            rl.resume(); // holt den nächsten Satz, auch aus waterfall
                        });
                    });
                    // end - line-by-line davor war es close
                    rl.on('end', function (line) {
                        console.log('Total lines : ' + counter);
                        ret.message += " KLISTATION:" + counter;
                        callbackgc(null, res, ret);
                        return;
                    });
                },
                function (res, ret, callbackgc) {
                    /**
                     *  KLISTATIONS komplettieren mit geonames - später mal
                     */
                    callbackgc(null, res, ret);
                    return;
                },
                function (res, ret, callbackgc) {
                    /**
                     * Daten lesen und in KLISTATIONS integrieren mit years-Object
                     * ret.fullnamemin, ret.fullnamemax, ret.fullnameavg
                     * ausgelagert, bisherige Mimik anpassen
                       kla1490srv.ghcndat2obj(fullfilename, selyears, variablename, ret, gblInfo, gbldb, fs, async, stream, readline, sys0000sys, req, res, function (res, ret1) {
                          callback2(null, res, ret1);
                          return;
                       });
                     * 
                     * ghcndat2all aufrufen
                     * 
                     */
                    kla1490srv.ghcndat2all(ret.fullnametmin, ret.selyears, "tmin", ret, gblInfo, gbldb, fs, async, stream, readline, sys0000sys, req, res, function (res, ret1) {
                        callbackgc(null, res, ret1);
                        return;
                    });
                },
                function (res, ret, callbackgc) {
                    /**
                     * ghcndat2all aufrufen - tmax
                     */
                    kla1490srv.ghcndat2all(ret.fullnametmax, ret.selyears, "tmax", ret, gblInfo, gbldb, fs, async, stream, readline, sys0000sys, req, res, function (res, ret1) {
                        callbackgc(null, res, ret1);
                        return;
                    });
                },
                function (res, ret, callbackgc) {
                    /**
                     * ghcndat2all aufrufen - tavg
                     */
                    kla1490srv.ghcndat2all(ret.fullnametavg, ret.selyears, "tavg", ret, gblInfo, gbldb, fs, async, stream, readline, sys0000sys, req, res, function (res, ret1) {
                        callbackgc(null, res, ret1);
                        return;
                    });
                }

            ],
            function (error, res, ret) {
                supercallback(res, ret);
                return;
            });
    };


    /**
     * lesen eine dat-Datei mit Auswertung fullfilename und variablename auf tmin oder tmax
     * returns res, ret
     */
    kla1490srv.ghcndat2obj = function (fullfilename, selyears, variablename, ret1, gblInfo, gbldb, fs, async, stream, readline, sys0000sys, req, res, callback3) {
        var ret = ret1;
        var sels = selyears.split(",");
        var counter = 0;
        var html = "";

        var rl = readline.createInterface({
            input: fs.createReadStream(fullfilename)
        });
        // event is emitted after each line
        rl.on('line', function (line) {
            var that = this;
            counter++;
            var datrecord = {};
            var lastbis = 0;
            for (var i = 0; i < datschema.length; i++) {
                var val1 = line.substring(datschema[i].von - 1, datschema[i].bis).trim();
                var fld1 = datschema[i].name;
                datrecord[fld1] = val1;
                lastbis = datschema[i].bis;
            }
            // hier sind die header-fields fertig und es kommt die Monatstabelle
            // je Monat 8 stellen: 5+1+1+1 ab Stelle lastbis

            datrecord.months = [];
            var dis = parseInt(lastbis);
            // Auswertung mit regex
            //1-15 Station und year, 16-19 TMIN,TMAX,TAVG
            // danach 5 Wert und 3x1 Flags mal 12 Monate
            var teststring = line.substr(15); // gegen 0 gerechnet
            var tparts = teststring.match(/(TMIN|TMAX|TAVG)( (-| )([0-9 ])   )/);


            for (var imon = 0; imon < 12; imon++) {
                var var0 = {};
                for (var ifld = 0; ifld < monschema.length; ifld++) {
                    var von = dis;
                    var len = monschema[ifld].length;
                    var name = monschema[ifld].name;
                    var val0 = line.substr(von, len);
                    //                   wwwwwdqd   
                    //1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
                    //101603550001995TMIN-9999 -9999 980 G 1100 G 1700 G 1910 G 2160 G-9999 2040 G-9999 1380 G 1230 G 
                    var0[name] = val0;
                    if (name === "value") {
                        var monvalue;
                        if (val0 === "-9999") {
                            monvalue = null;
                        } else {
                            monvalue = val0;
                            // -7 ist zweistellig, aber als -0.7 aufzubereiten
                            if (monvalue.indexOf("-") >= 0) {
                                monvalue = monvalue.replace(/-/g, " ");
                                monvalue = monvalue.replace(/ /g, "0");
                                monvalue = (monvalue.substr(0, 3) + "." + monvalue.substr(3, 2)).trim();
                                monvalue = monvalue.replace(/^0+/, '');
                                if (monvalue.startsWith(".")) {
                                    monvalue = "0" + monvalue;
                                }
                                monvalue = "-" + monvalue;
                            } else {
                                monvalue = monvalue.replace(/ /g, "0");
                                monvalue = (monvalue.substr(0, 3) + "." + monvalue.substr(3, 2)).trim();
                                monvalue = monvalue.replace(/^0+/, '');
                                if (monvalue.startsWith(".")) {
                                    monvalue = "0" + monvalue;
                                }
                            }

                            if (monvalue !== null && monvalue.indexOf(" ") >= 0) {
                                console.log(line);
                            }
                        }
                        datrecord.months.push(monvalue);
                    }
                    dis += parseInt(len);
                }
            }
            /**
             * Selektion year
             */
            var ifound = false;
            for (var isel = 0; isel < sels.length; isel++) {
                if (sels[isel].length === 0) continue;
                if (sels[isel].indexOf("*") >= 0) {
                    ifound = true;
                    for (var isel1 = 0; isel1 < sels[isel].length; isel1++) {
                        var y1 = datrecord.year.substr(isel1, 1);
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
                    if (datrecord.year !== sels[isel]) {
                        ifound = false;
                        continue;
                    } else {
                        ifound = true;
                        break;
                    }
                }
            }
            if (ifound === false) {
                that.resume(); // holt den nächsten Satz, auch aus waterfall
                return;
            }
            /*
            if (selyears.indexOf(datrecord.year) < 0) {
                that.resume(); // holt den nächsten Satz, auch aus waterfall
                return;
            }
            */
            var stationid = datrecord.stationid;
            // Abfangen, wenn stationid nicht vordefiniert ist.
            var lats = "-9999";
            if (typeof stations[stationid] !== "undefined") {
                lats = stations[stationid];
            }
            // Abfangen, wenn stationid nicht vordefiniert ist.
            /*
               if (lat.substr(0, 1) === "N") {
                   lats = ("000" + lat.substr(1)).slice(-3) + "_" + lat.substr(0, 1) + ("000" + lat.substr(1)).slice(-3);
                   // Sortierung von 90 zu 0 mit dem Kehrwert
                   latnum = parseInt(lat.substr(1));
                   latnum = 90 - latnum;
                   lats = ("000" + latnum).slice(-3) + "_" + lat.substr(0, 1) + ("000" + lat.substr(1)).slice(-3);
               } else {
                   latnum = parseInt(lat.substr(1));
                   latnum = 90 + latnum;
                   lats = ("000" + latnum).slice(-3) + "_" + lat.substr(0, 1) + ("000" + lat.substr(1)).slice(-3);
               }
               */
            /**
             * hierarchie lat, year, source, 
             *              values - für year mit tmin, tmax
             *              months - Monatstabelle mit tmin, tmax
             */
            var year = datrecord.year;
            // year, lats und stationid sind hier bekannt
            if (typeof yearlats[year] === "undefined") {
                yearlats[year] = {};
            }
            if (typeof yearlats[year][lats] === "undefined") {
                yearlats[year][lats] = {
                    stations: "",
                    xstations: [],
                    numcount: 0,
                    months: {}
                };
            }
            if (yearlats[year][lats].stations.indexOf(stationid) < 0) {
                yearlats[year][lats].stations += stationid + ";";
                yearlats[year][lats].xstations.push(xstations[stationid]);
            }
            var oldvalue;
            var value;
            var mon;
            for (var imo1 = 0; imo1 < datrecord.months.length; imo1++) {
                value = datrecord.months[imo1];
                // yearlats[year].temphist[variablename]
                mon = "M" + ("00" + (imo1 + 1)).slice(-2);
                if (typeof yearlats[year][lats].months[mon] === "undefined") {
                    if (variablename === "tavg") {
                        yearlats[year][lats].months[mon] = {
                            tmin: null,
                            tmax: null,
                            traws: null,
                            tavg: null
                        };
                    } else {
                        yearlats[year][lats].months[mon] = {
                            tmin: null,
                            tmax: null
                        };
                    }
                }
                if (value === null || value === "999" || value === "-999") {
                    continue;
                }
                if (variablename === "tmax") {
                    oldvalue = yearlats[year][lats].months[mon].tmax;
                    if (oldvalue === null) {
                        yearlats[year][lats].months[mon].tmax = value;
                    } else {
                        if (value !== null && parseFloat(value) > parseFloat(oldvalue)) {
                            yearlats[year][lats].months[mon].tmax = value;
                        }
                    }
                } else if (variablename === "tmin") {
                    oldvalue = yearlats[year][lats].months[mon].tmin;
                    if (oldvalue === null) {
                        yearlats[year][lats].months[mon].tmin = value;
                    } else {
                        if (value !== null && parseFloat(value) < parseFloat(oldvalue)) {
                            yearlats[year][lats].months[mon].tmin = value;
                        }
                    }
                } else if (variablename === "tavg") {
                    // berechne tmax von value
                    oldvalue = yearlats[year][lats].months[mon].tmax;
                    if (oldvalue === null) {
                        yearlats[year][lats].months[mon].tmax = value;
                    } else {
                        if (value !== null && parseFloat(value) > parseFloat(oldvalue)) {
                            yearlats[year][lats].months[mon].tmax = value;
                        }
                    }
                    // berechne tmin von value
                    oldvalue = yearlats[year][lats].months[mon].tmin;
                    if (oldvalue === null) {
                        yearlats[year][lats].months[mon].tmin = value;
                    } else {
                        if (value !== null && parseFloat(value) < parseFloat(oldvalue)) {
                            yearlats[year][lats].months[mon].tmin = value;
                        }
                    }
                    // berechne tavg aus Summe und Anzahl
                    // traws - Liste der Werte
                    if (yearlats[year][lats].months[mon].traws === null) {
                        yearlats[year][lats].months[mon].traws = value;
                    } else {
                        yearlats[year][lats].months[mon].traws += "," + value;
                    }
                    // tavg - nicht gerade performancefreundlich, aber sicher
                    yearlats[year][lats].months[mon].tavg = kla1490srv.getavg(yearlats[year][lats].months[mon].traws);
                }
            }
            that.resume(); // holt den nächsten Satz, auch aus waterfall
        });
        // end
        rl.on('close', function (line) {
            console.log('Total lines : ' + counter);
            callback3(res, ret);
        });
    };

    /**
     * Station-Header-Satz
     */
    var sta4schema = [{
            name: "stationid", // "ID",
            von: "1",
            bis: "7",
            type: "string" // Integer kann 2 Stellen Präfix haben für das Land
        },
        {
            name: "latitude", // "ID",
            von: "8",
            bis: "11",
            type: "string" // Integer, zehntelgrad, - für Süden, -999 missing
        },
        {
            name: "longitude", // "ID",
            von: "12",
            bis: "16",
            type: "string" // Integer, zehntelgrad, - für Süden, -1999 missing
        },
        {
            name: "elevation", // "ID",
            von: "18",
            bis: "21",
            type: "string" // Integer, Meter, -999 missing
        },
        {
            name: "name", // "ID",
            von: "23",
            bis: "42",
            type: "string" // Station Name
        },
        {
            name: "country", // "ID",
            von: "44",
            bis: "56",
            type: "string" // Land
        },
        {
            name: "firstyear", // "ID",
            von: "58",
            bis: "61",
            type: "string" // Integer, erstes Jahr mit Temperaturdaten
        },
        {
            name: "lastyear", // "ID",
            von: "62",
            bis: "65",
            type: "string" // Integer, letztes Jahr mit Temperaturdaten
        },
        {
            name: "datasource", // "ID",
            von: "68",
            bis: "69",
            type: "string" // Schlüssel
        },
        {
            name: "firstyearok", // "ID",
            von: "70",
            bis: "73",
            type: "string" // Erstes Jahr mit brauchbaren Daten
        },
        {
            name: "uid", // "ID",
            von: "75",
            bis: "78",
            type: "string" // unique index Number
        },
        {
            name: "gridind", // "ID",
            von: "80",
            bis: "83",
            type: "string" // Grid-Index, nur interne Verwendung
        }
    ];
    /**
     * eigene Satzart für die Daten, wechselnd mit Stationsdaten
     *         1         2         3         4         5         6         7
     *1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890 
     *  10010 709   87   10 Jan Mayen            NORWAY        19212011  541921    1  287
     *1921  -44  -71  -68  -43   -8   22   47   58   27  -20  -21  -40                                    
     *1922   -9  -17  -62  -37  -16   29   48   63   27   -2  -38  -26
     * Erkennungsregel: 4 Stellen numerisch vorne => Datensatz dat4schema
     */
    var dat4schema = {
        year: {
            name: "year", // "ID",
            von: "1",
            bis: "4",
            type: "integer" // Integer kann 2 Stellen Präfix haben für das Land
        },
        /*
        12 Monatsbuckets, immer:
        - Leerstelle
        - vierstellige Temperatur:
            optional - für Kältegrade
            3-stellige Temperatur mit einer Dezimalen
        */
        months: [{
            leer: 1,
            tavg: 4
        }]
    };
    /**
     * crutem42latitudes - dat für tavg, 
     * fullname, timeout, pivotopcode, selyears
     * Zugriff KLISTATIONS, latprofile berechnet
     * fullname wird entsprechend variiert
     * returns res, ret mit latprofile
     */
    kla1490srv.crutem42latitudes = function (gblInfo, gbldb, fs, path, rootname, async, stream, readline, sys0000sys, kla9020fun, uihelper, req, res, supercallback2) {
        latprofile = {};
        yearlats = {};
        console.log("crutem42latitudes gestartet");
        var fullname = "";
        if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
            fullname = req.query.fullname;
        }
        var pivotopcode = "";
        if (req.query && typeof req.query.pivotopcode !== "undefined" && req.query.pivotopcode.length > 0) {
            pivotopcode = req.query.pivotopcode;
        }
        var selyears = "";
        if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
            selyears = req.query.selyears;
        }
        var forcedata = "false";
        if (req.query && typeof req.query.forcedata !== "undefined" && req.query.forcedata.length > 0) {
            forcedata = req.query.forcedata;
        }
        var value = "tavg";


        async.waterfall([
                function (callback2) {
                    if (!fs.existsSync(fullname)) {
                        callback2("error", res, {
                            error: true,
                            message: "Datei nicht gefunden:" + fullname
                        });
                        return;
                    } else {
                        callback2(null, res, {
                            error: false,
                            message: "Datei vorhanden",
                            fullname: fullname,
                            forcedata: forcedata
                        });
                        return;
                    }
                },
                function (res, ret, callback2) {
                    if (ret.forcedata === "true") {
                        callback2(null, res, ret);
                        return;
                    }
                    /**
                     * prüfen, ob die Selektion schon einmal realisiert wurde
                     * und schon eine Datei vorhanden ist
                     */
                    var reqparm = {
                        sel: {
                            fullname: ret.fullname
                        },
                        projection: {},
                        table: "KLIRAWFILES"
                    };
                    sys0000sys.getonerecord(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            ret.message = ret1.message;
                            ret.error = ret1.error;
                            callback2("Error", res, ret);
                            return;
                        }
                        var smsg = "";
                        var isregistered = false;
                        if (ret1.error === false && typeof ret1.record !== "undefined" && ret1.record !== null) {
                            /**
                             * durchsuchen der Selektionen in selections
                             */
                            /*
                            fullname: ret.fullname,
                            selyears: selyears,
                            fulldatafilename: ret.fulldatafilename,
                            datafilename: ret.datafilename
                            */
                            var filerecord = ret1.record;
                            if (typeof filerecord.selections !== "undefined" && filerecord.selections.length > 0) {
                                for (isel = 0; isel < filerecord.selections.length; isel++) {
                                    if (filerecord.selections[isel].selyears === selyears) {
                                        ret.oldrecord = true;
                                        ret.fullname = filerecord.selections[isel].fullname;
                                        ret.selyears = filerecord.selections[isel].selyears;
                                        ret.fulldatafilename = filerecord.selections[isel].fulldatafilename;
                                        ret.datafilename = filerecord.selections[isel].datafilename;
                                        break;
                                    }
                                }
                                ret.oldrecord = true;
                                callback2(null, res, ret);
                                return;
                            } else {
                                ret.oldrecord = true;
                                callback2(null, res, ret);
                                return;
                            }
                        } else {
                            ret.oldrecord = false;
                            callback2(null, res, ret);
                            return;
                        }
                    });
                },
                function (res, ret, callback2) {
                    if (ret.forcedata === "true") {
                        callback2(null, res, ret);
                        return;
                    }
                    if (typeof ret.fulldatafilename !== "undefined") {
                        /**
                         * Daten noch lesen und liefern
                         */
                        fs.readFile(ret.fulldatafilename, function (err, data) {
                            if (err !== null) {
                                callback2(null, res, ret);
                                return;
                            } else {
                                yearlats = JSON.parse(data);
                                ret.yearlats = yearlats;
                                callback2("Finish", res, ret);
                                return;
                            }
                        });
                    } else {
                        callback2(null, res, ret);
                        return;
                    }
                },
                function (res, ret, callback2) {
                    var fullfilename = ret.fullname;
                    var variablename = "tavg";
                    kla1490srv.crutem42obj(fullfilename, selyears, variablename, ret, gblInfo, gbldb, fs, async, stream, readline, sys0000sys, kla9020fun, uihelper, req, res, function (res, ret1) {
                        callback2(null, res, ret1);
                        return;
                    });
                },
                function (res, ret, callback2) {
                    /**
                     * Daten in yearlats speichern in temp als Datei
                     */
                    var jahr = "" + new Date().getFullYear();
                    var fullpath64 = "";
                    var path64 = "";
                    fullpath64 = path.join(rootname, "static");
                    path64 = "static";
                    fullpath64 = path.join(fullpath64, "temp");
                    path64 = path.join(path64, "temp");
                    if (!fs.existsSync(fullpath64)) {
                        fs.mkdirSync(fullpath64);
                    }
                    fullpath64 = path.join(fullpath64, jahr);
                    path64 = path.join(path64, jahr);
                    if (!fs.existsSync(fullpath64)) {
                        fs.mkdirSync(fullpath64);
                    }

                    var filnr = Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000;
                    var filename = "" + jahr.substr(2, 2) + filnr + ".txt";
                    var fullfilename = path.join(fullpath64, filename);
                    var fullfilenamex = path.join(fullpath64, "" + jahr.substr(2, 2) + filnr);

                    fs.writeFile(fullfilename, JSON.stringify(yearlats), function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("The file was saved!");
                        }
                        ret.fulldatafilename = fullfilename;
                        ret.datafilename = filename;
                        callback2(null, res, ret);
                        return;
                    });
                },
                function (res, ret, callback2) {
                    /**
                     * Speichern in KLIRAWFILES
                     */
                    var reqparm = {
                        table: "KLIRAWFILES",
                        selfields: {
                            fullname: ret.fullname
                        },
                        updfields: {
                            "$setOnInsert": {
                                fullname: ret.fullname
                            }
                        }
                    };

                    reqparm.updfields["$addToSet"] = {
                        selections: {
                            fullname: ret.fullname,
                            selyears: selyears,
                            fulldatafilename: ret.fulldatafilename,
                            datafilename: ret.datafilename
                        }
                    };
                    sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret1) {
                        callback2(null, res, ret);
                        return;
                    });
                }
            ],
            function (error, res, ret) {
                console.log("crutem42latitudes beendet");
                /* ret.latprofile = latprofile; */
                ret.yearlats = yearlats;
                supercallback2(res, ret);
                return;
            });
    };








    /**
     * getstationdata - KLISTATIONS - holen country und Daten aus KLICOUNTRIES
     * function (res, ret)
     */
    kla1490srv.getstationdata = function (gblInfo, gbldb, fs, async, stream, readline, crg, sys0000sys, kla9020fun, req, res, callbacktd) {
        var countries = {}; // countrycode und alle Daten dazu
        async.waterfall([
                function (callbacktd0) {
                    /**
                     * Vorlauf: KLICOUNTRIES laden
                     */
                    var reqparm = {};
                    reqparm.table = "KLICOUNTRIES";
                    reqparm.sel = {};
                    reqparm.projection = {};
                    sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                        if (ret1.error === true) {
                            // sollte nicht passieren??? oder auch hier anlegen
                            callbacktd0(null, res, {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        } else {
                            if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                                for (var recordind in ret1.records) {
                                    var record = ret1.records[recordind];
                                    var alpha3 = record.alpha3;
                                    delete record.history;
                                    var countryname = record.name;
                                    delete record.name;
                                    record.countryname = countryname;
                                    countries[alpha3] = record;
                                }
                                callbacktd0(null, res, {
                                    error: false,
                                    message: "KLICOUNTRIES geladen"
                                });
                                return;
                            }
                        }
                    });
                },
                function (res, ret, callbacktd1) {
                    /**
                     * Verarbeitung KLISTATIONS komplettieren
                     */
                    var reqparm = {};
                    reqparm.table = "KLISTATIONS";
                    reqparm.sel = {};
                    reqparm.projection = {};
                    sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret3) {
                        if (ret3.error === true) {
                            // sollte nicht passieren??? oder auch hier anlegen
                            callbacktd(res, {
                                error: ret3.error,
                                message: ret3.message
                            });
                            return;
                        } else {
                            if (ret3.records !== "undefined" && ret3.records !== null && ret3.records.length > 0) {
                                stations = {};
                                xstations = {};
                                async.eachSeries(ret3.records, function (record, nextrec) {
                                    async.waterfall([
                                            function (callbacktd4) {
                                                var ret = {};
                                                ret.klirecord = record;
                                                var country = crg.get_country(parseFloat(record.latitude), parseFloat(record.longitude));
                                                if (typeof country !== "undefined" && country !== null) {
                                                    var countrydata = countries[country.code];
                                                    if (typeof countrydata !== "undefined" && countrydata !== null) {
                                                        console.log(record.name + "=>" + country.code + " " + country.name + "=>" + countrydata.region);
                                                        delete countrydata.history;
                                                        delete countrydata.tsserverupd;
                                                        delete countrydata._id;
                                                        ret.klirecord = Object.assign(ret.klirecord, countrydata);
                                                        delete ret.klirecord.history;
                                                        delete ret.klirecord.tsserverupd;
                                                        delete ret.klirecord.values;
                                                        delete ret.klirecord._id;
                                                        ret.error = false;
                                                        ret.message = "OK";
                                                        callbacktd4(null, res, ret);
                                                        return;
                                                    } else {
                                                        console.log(record.name + "=>" + "NODATA");
                                                        ret.error = true;
                                                        ret.message = "NODATA";
                                                        callbacktd4(null, res, ret);
                                                        return;
                                                    }
                                                } else {
                                                    console.log(record.name + "=>" + "NO-REVERSE");
                                                    ret.error = true;
                                                    ret.message = "NODATA";
                                                    callbacktd4(null, res, ret);
                                                    return;
                                                }

                                            },
                                            function (res, ret, callbacktd4) {
                                                if (ret.error === true) {
                                                    callbacktd4("finish", res, ret);
                                                    return;
                                                }
                                                var reqparm = {};
                                                reqparm.selfields = {
                                                    source: ret.klirecord.source,
                                                    stationid: ret.klirecord.stationid
                                                };
                                                reqparm.updfields = {};
                                                reqparm.updfields["$setOnInsert"] = {
                                                    source: ret.klirecord.source,
                                                    stationid: ret.klirecord.stationid
                                                };
                                                delete ret.klirecord.source;
                                                delete ret.klirecord.stationid;
                                                reqparm.updfields["$set"] = ret.klirecord;
                                                reqparm.table = "KLISTATIONS";
                                                console.log("update requested:" + ret.klirecord.name);
                                                sys0000sys.setonerecord(gbldb, async, null, reqparm, res, function (res, ret) {
                                                    //console.log("setonerecord-returned:" + JSON.stringify(ret));
                                                    console.log("update finished:" + ret.record.name);
                                                    callbacktd4("finish", res, ret);
                                                    return;
                                                });
                                            }
                                        ],
                                        function (error, res, ret) {
                                            nextrec();
                                            return;
                                        });
                                }, function (error) {
                                    callbacktd1(null, res, ret);
                                    return;
                                });
                            }
                        }
                    });


                }
            ],
            function (error, result) {
                callbacktd(res, ret);
                return;
            });
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
     * Berechnung tavg aus Werteliste in traws
     * kommasepariert, eine Dezimalstelle mit .
     * genau so wird auch das Ergebnis geliefert
     * return tavg
     */
    kla1490srv.getavg = function (traws) {
        var tvals = traws.split(",");
        if (tvals.length === 1) return traws;
        var sum = 0;
        for (var iavg = 0; iavg < tvals.length; iavg++) {
            sum += parseFloat(tvals[iavg]);
        }
        var tavg = sum / tvals.length;
        // tavg = Math.round(tavg);
        tavg = tavg.toFixed(2);
        return "" + tavg;
    };


    /**
     * kla1490srv.convecad2sql - Konvertieren ECAD aus MongoDB
     * nach SQLite mit Zeitkonsolidierung
     * @param {*} gbldb 
     * @param {*} async 
     * @param {*} sqlite3 
     * @param {*} uihelper 
     * @param {*} req 
     * @param {*} res
     * @param {*} callback64 mit res, ret als retun-Variablen
     */
    kla1490srv.convecad2sql = function (gbldb, async, sqlite3, db, uihelper, sys0000sys, req, res, callback64) {
        fs = fs || require("fs");
        sql3inserts = 0;
        sql3errors = 0;
        async.waterfall([
            function (callback64del) {
                var ret = {};
                try {
                    // Löschen alte Sätze gleiche source
                    db.serialize(function () {
                        var delStmt = "DELETE FROM KLISTATIONS ";
                        delStmt += " WHERE source = 'ECAD'";
                        db.run(delStmt, function (err) {
                            if (err !== null) {
                                ret.error = true;
                                ret.message = err;
                                console.log(err);
                            } else {
                                // hier erfolgreich geschrieben
                                console.log("Delete war erfolgreich: " + this.changes);
                                ret.error = false;
                                ret.message = "Delete war erfolgreich: " + this.changes;
                            }
                            callback64del(null, ret);
                            return;
                        });
                    });
                } catch (err) {
                    callback64del(null, ret);
                    return;
                }
            },
            function (ret, callback64ind) {
                /** 
                 * Index KLISTATIONS MongoDB anlegen
                 */
                gbldb.collection("KLISTATIONS").createIndex({
                    source: 1,
                    stationid: 1
                }, function (err) {
                    callback64ind(null, ret);
                    return;
                });
            },
            function (ret, callback64prep) {
                /** 
                 * KLISTATIONS nach ret.stations - 6-stellig mit counter
                 */
                var reqparm = {};
                reqparm.table = "KLISTATIONS";
                reqparm.sel = {
                    source: "ECAD"
                };
                reqparm.sort = [];
                reqparm.sort.push(
                    ["source", "asc"], ["stationid", "asc"]
                );
                reqparm.projection = {
                    source: 1,
                    stationid: 1
                };
                // Paging-Logik/Buffering, damit intern der Speicher nicht überlastet wird
                reqparm.skip = 0;
                reqparm.limit = 0; // Begrenzung zum Testen

                sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                    if (ret1.error === true) {
                        ret.message += " keine KLISTATIONS:" + ret1.message;
                        ret.html = " keine KLISTATIONS:" + ret1.message;
                        callback64(res, ret);
                        return;
                    } else {
                        var vglstation = ""; // 6-stellig
                        var html = "";
                        var stations = {};
                        if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                            for (var irec = 0; irec < ret1.records.length; irec++) {
                                var station = ret1.records[irec].stationid.substr(0, 6);
                                if (typeof stations[station] === "undefined") {
                                    stations[station] = 1;
                                } else {
                                    stations[station] += 1;
                                }
                            }
                        }
                        var staarray = Object.keys(stations);
                        staarray.sort(function (a, b) {
                            if (a < b)
                                return -1;
                            if (a > b)
                                return 1;
                            return 0;
                        });
                        ret.stations = Object.assign(staarray);
                        callback64prep(null, ret);
                        return;
                    }
                });
            },
            function (ret77, callback64b) {
                /** 
                 * Lesen KLISTATIONS in loop über Führungsstruktur top-down in Gruppen
                 */


                async.eachSeries(ret77.stations, function (station, nextstation) {
                        var reqparm = {};
                        reqparm.table = "KLISTATIONS";
                        reqparm.sel = {
                            source: "ECAD",
                            stationid: {
                                "$gte": station + "000000",
                                "$lte": station + "999999"
                            }
                        };
                        reqparm.sort = [];
                        reqparm.sort.push(
                            ["source", "asc"], ["stationid", "asc"]
                        );
                        reqparm.projection = {
                            history: 0
                        };
                        // Paging-Logik/Buffering, damit intern der Speicher nicht überlastet wird
                        reqparm.skip = 0;
                        reqparm.limit = 0;
                        sys0000sys.getallrecords(gbldb, async, null, reqparm, res, function (res, ret1) {
                            if (ret1.error === true) {
                                console.log("Keine Sätze zu:" + station);
                                nextstation();
                                return;
                            } else {
                                var vglstation = ""; // 6-stellig
                                var html = "";
                                if (ret1.records !== "undefined" && ret1.records !== null && ret1.records.length > 0) {
                                    var starecords = {}; // Buffer for old records of one station - 6 digits
                                    var newrecords = {}; // Buffer for new records, later to sqlite3
                                    var actstation = ret1.records[0].stationid.substr(0, 6);
                                    /** 
                                     * separieren nach variablename = 1 Datensatz, strenger Loop
                                     */
                                    for (var irec1 = 0; irec1 < ret1.records.length; irec1++) {
                                        var record = ret1.records[irec1];
                                        starecord = {};
                                        for (var prop in record) {
                                            if (record.hasOwnProperty(prop) && typeof record[prop] !== "object") {
                                                starecord[prop] = record[prop];
                                            }
                                        }
                                        // jetzt sind die Trivialfelder übernommen
                                        starecord.station = starecord.stationid.substr(0, 6);
                                        starecord.substation = starecord.stationid.substr(6);
                                        if (typeof record.tmax === "object") {
                                            starecord.variablename = "tmax";
                                            starecord.years = uihelper.cloneObject(record.tmax.years);
                                            starecords[starecord.substation + "tmax"] = starecord;
                                        }
                                        if (typeof record.tmin === "object") {
                                            starecord.variablename = "tmin";
                                            starecord.years = uihelper.cloneObject(record.tmin.years);
                                            starecords[starecord.substation + "tmin"] = starecord;
                                        }
                                    } // for
                                    // Konsolidierung und Ausgabe der Daten
                                    newrecords = kla1490srv.konsecad(starecords, db, async, function (ret) {
                                        nextstation();
                                        return;
                                    });
                                } else {
                                    console.log("Keine Sätze zu:" + station);
                                    nextstation();
                                    return;
                                }
                            }
                        });
                    },
                    function (err) {
                        var ret = {};
                        ret.error = false;
                        ret.message = "KLISTATIONS fertig konvertiert, insert:" + sql3inserts + " Errors:" + sql3errors;
                        ret.html = "KLISTATIONS fertig konvertiert, insert:" + sql3inserts + " Errors:" + sql3errors;
                        callback64(res, ret);
                        return;
                    }
                ); // async.series für stations in {}
            }
        ]);
    };

    /**
     * kla1490srv.konsecad - Konvertieren im Speicher
     * für SQLite mit Zeitkonsolidierung
     * inserts sqlite3-records!!! - async/callback65
     * Existent der table wird geprüft und create bei Bedarf
     * @param {*} starecords - Object mit starecord-Instanzen
     * returns newrecords - Objekt mit den Sätzen für SQLite3
     */
    kla1490srv.konsecad = function (starecords, db, async, callback65) {
        /*
        station, substation und die normalen Felder, years hat die years
        years(object){
            2018(object=>array){
                0(string):,
                1(string):,
        */
        var messages = "";
        var newrecords = [];
        // suche substation - wenn es passt in variablename
        // mit fromyear und toyear
        // top-loop auf async.eachseries mit pseudotabelle, damit die 2 Durchgeänge gehen
        async.eachSeries([1, 2], function (iround, nextround) {
            //for (var iround = 0; iround < 2; iround++) {
            var keys = Object.keys(starecords);
            var recs = keys.length;
            var baserecord = starecords[keys[0]];
            var hits = [];
            for (var itry = 1; itry < recs; itry++) {
                candrecord = starecords[keys[itry]];
                if (baserecord.station === candrecord.station) {
                    if (baserecord.variablename === candrecord.variablename) {
                        hits.push(keys[itry]);
                        var candyears = Object.keys(candrecord.years);
                        for (var iyear = 0; iyear < candyears.length; iyear++) {
                            var candyear = candyears[iyear];
                            if (typeof baserecord.years[candyear] !== "undefined") {
                                // doppelt
                                messages += "<br>" + candyear + " doppelt";
                            } else {
                                baserecord.years[candyear] = Object.assign(candrecord.years[candyear]);
                            }
                        }
                    }
                }
            }
            // Berechnen der Jahres-Felder anzyears, firstyear, firstyearok, fromyear, realyears, toyear
            baserecord.firstyear = "";
            baserecord.firstyearok = "";
            baserecord.fromyear = "";
            baserecord.toyear = "";
            baserecord.anzyears = 0;
            baserecord.realyears = 0;

            var ys = Object.keys(baserecord.years);
            // immer berechnen - speziell wenn source nicht gefunden wurde
            for (var iys = 0; iys < ys.length; iys++) {
                if (baserecord.firstyear.length === 0) {
                    baserecord.firstyear = ys[iys];
                    baserecord.firstyearok = ys[iys];
                } else if (baserecord.firstyear > ys[iys]) {
                    baserecord.firstyear = ys[iys];
                    baserecord.firstyearok = ys[iys];
                }
                if (baserecord.toyear.length === 0) {
                    baserecord.toyear = ys[iys];
                } else if (baserecord.toyear < ys[iys]) {
                    baserecord.toyear = ys[iys];
                }
            }
            baserecord.fromyear = baserecord.firstyear;
            baserecord.anzyears = parseInt(baserecord.toyear) - parseInt(baserecord.fromyear) + 1;
            baserecord.realyears = ys.length;
            // Verpacken der no-sql Felder
            var yearsstring = JSON.stringify(baserecord.years);
            delete baserecord.years;
            baserecord.yearsstring = yearsstring;
            newrecords.push(baserecord);
            // Aufräumen und noch eine Runde, wenn etwas übrig ist
            delete starecords[baserecord.substation + baserecord.variablename];
            for (var ihit = 0; ihit < hits.length; ihit++) {
                delete starecords[hits[ihit]];
            }
            async.waterfall([
                    function (callback66) {
                        // create table if not exists - baserecord als Vorlage
                        var sql = ""
                        var varlist = "";
                        var vallist = "";
                        db.serialize(function () {
                            var createStmt = 'CREATE TABLE IF NOT EXISTS KLISTATIONS(';
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
                                        vallist += "'" + pvalue.replace(/'/g, "''") + "',";
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
                                // if (err) console.log("CREATE:" + err);
                                callback66(null, {
                                    error: false,
                                    message: "OK",
                                    varlist: varlist,
                                    vallist: vallist
                                });
                                return;
                            });
                        }); // von serialize
                    },
                    function (ret, callback66a1) {
                        // CREATE UNIQUE INDEX unique_com_id ON company (com_id,com_name);
                        db.serialize(function () {
                            var createInd = "CREATE UNIQUE INDEX IF NOT EXISTS uni1_KLISTATIONS ON KLISTATIONS(source, station, variablename)";
                            db.run(createInd, function (err) {
                                callback66a1(null, {
                                    error: false,
                                    message: "OK",
                                    varlist: ret.varlist,
                                    vallist: ret.vallist
                                });
                                return;
                            });
                        });
                    },
                    function (ret, callback66a2) {
                        // CREATE INDEX unique_com_id ON company (com_id,com_name);
                        db.serialize(function () {
                            var createInd = "CREATE INDEX IF NOT EXISTS ind1_KLISTATIONS ON KLISTATIONS(tsserverrupd)";
                            db.run(createInd, function (err) {
                                callback66a2(null, {
                                    error: false,
                                    message: "OK",
                                    varlist: ret.varlist,
                                    vallist: ret.vallist
                                });
                                return;
                            });
                        });
                    },
                    function (ret, callback66a) {
                        // hier schreiben eines Satzes in SQLite3 - async
                        /*
                        keine Duplikate zu:
                        starecord.station = starecord.stationid.substr(0, 6);
                        // starecord.substation = starecord.stationid.substr(6);
                        starecord.variablename = "tmax"; pder tmin
                        */
                        // Ausgabe der newrecords nach sqlite3
                        db.serialize(function () {
                            var insStmt = "INSERT INTO KLISTATIONS ";
                            insStmt += "(";
                            insStmt += ret.varlist;
                            insStmt += ")";
                            insStmt += " VALUES("
                            insStmt += ret.vallist
                            insStmt += ")";
                            /* unpraktikabel für viele Varialben
                            insStmt += " SELECT " + ret.vallist;
                            insStmt += " EXCEPT ";
                            insStmt += " SELECT source, station, variablename ";
                            insStmt += " FROM KLISTATIONS ";
                            insStmt += " WHERE source = 'ECAD'";
                            insStmt += " AND station = '" + baserecord.station + "'";
                            insStmt += " AND variablename = '" + baserecord.variablename + "'";
                            */
                            //https://stackoverflow.com/questions/39106668/node-js-sqlite3-read-all-records-in-table-and-return
                            // method to read table
                            // console.log("Insert Statement: " + insStmt.length);
                            db.run(insStmt, function (err) {
                                if (err !== null) {
                                    sql3errors++;
                                    var imsg = "***** source:" + baserecord.source;
                                    imsg += " station:" + baserecord.station;
                                    imsg += " varname:" + baserecord.variablename;
                                    imsg += " ERROR:" + err.message;
                                    // SQLITE_ERROR: no such column: NaN
                                    // Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: KLISTATIONS.source, KLISTATIONS.station, KLISTATIONS.variablename
                                    console.log(imsg);
                                    var wstream = fs.createWriteStream('sqllog.txt', {
                                        'flags': 'a'
                                    });
                                    wstream.write(imsg + '\n');
                                    wstream.write(JSON.stringify(baserecord, null, "\n"));
                                    wstream.on('finish', () => {
                                        console.log('wrote all data to file');
                                        wstream.end();
                                        callback66a("finish", ret);
                                        return;
                                    });
                                } else {
                                    // hier erfolgreich geschrieben
                                    sql3inserts++;
                                    var imsg = "source:" + baserecord.source;
                                    imsg += " station:" + baserecord.station;
                                    imsg += " varname:" + baserecord.variablename;
                                    imsg += " INSERT:" + this.lastID;
                                    console.log(imsg);
                                    callback66a("finish", ret);
                                    return;
                                }

                            });
                        }); // von serialize
                    },
                ],
                function (err, result) {
                    if (Object.keys(starecords).length > 0) {
                        // console.log("Nextround");
                        nextround();
                    } else {
                        // console.log("Nextround-Finished");
                        callback65({
                            error: false,
                            message: "OK"
                        });
                    }
                }
            );
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