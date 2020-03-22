/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper */
(function () {
    'use strict';
    var kla1490srv = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var crg = crg || require('country-reverse-geocoding').country_reverse_geocoding();
    var path = path || require("path");
    var LineByLineReader = LineByLineReader || require('line-by-line');
    var uihelper = uihelper || require('re-frame/uihelper');

    var sys0000sys = null;
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
                        var lat = invrecord.latitude;
                        var latobj = kla9020fun.getlatfieldsp(lat);
                        invrecord.latn = latobj.latn;
                        invrecord.lats = latobj.lats;
                        // ret.stations[invrecord.stationid] = invrecord;
                        /**
                         * contry festellen und Datenkomplettierung
                         */
                        var alpha2 = invrecord.stationid.substr(0, 2);


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
                        } else {
                            if (typeof ret.countrycodes[alpha2] !== "undefined") {
                                delete ret.countrycodes[alpha2].tsserverupd;
                                delete ret.countrycodes[alpha2].iostatus;
                                var countryname = ret.countrycodes[alpha2].countryname;
                                if (typeof countryname === "undefined") {
                                    countryname = ret.countrycodes[alpha2].name;
                                    delete ret.countrycodes[alpha2].name;
                                    ret.countrycodes[alpha2].countryname = countryname;
                                }
                                invrecord = Object.assign(invrecord, ret.countrycodes[alpha2]);
                            } else if (typeof ret.countries[alpha2] !== "undefined") {
                                invrecord.countryname = ret.countries[alpha2];


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
                        /**
                         * Default-Felder zufügen, werden erst nach der Übernahme versorgt
                         */
                        reqparm.updfields["$setOnInsert"].anzyears = 0;
                        reqparm.updfields["$setOnInsert"].realyears = 0;
                        reqparm.updfields["$setOnInsert"].fromyear = "";
                        reqparm.updfields["$setOnInsert"].toyear = "";

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
     * Vorgabe ist fullname von ghcnd-stations.txt
     * optional kann eine .dly-Datei vorgegeben sein,
     * das kann auch abgeleitet werden aus stationid und Suffix .dly
     * damit wird KLIDATA fortgeschrieben,
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
    kla1490srv.ghcnddata = function (gblInfo, db, fs, path, rootname, async, stream, StreamZip, readline, sys0000sys, kla9020fun, req, res, callback390) {
        var vglstationid = "";
        var stationdata = [];
        async.waterfall([
            function (callback390a) {
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
                var stationid = "";
                if (req.query && typeof req.query.stationid !== "undefined" && req.query.stationid.length > 0) {
                    stationid = req.query.stationid;
                }
                var selyears = "";
                if (req.query && typeof req.query.selyears !== "undefined" && req.query.selyears.length > 0) {
                    selyears = req.query.selyears;
                }
                var ret = {};
                ret.source = source;
                ret.selyears = selyears;
                ret.stationid = stationid;
                ret.fullname = fullname;
                ret.dirname = path.dirname(fullname);
                callback390a(null, res, ret);
                return;
            },
            function (res, ret, callback390d) {

                var datapath = path.join(ret.dirname, "ghcnd_all.tar", "ghcnd_all", "ghcnd_all");
                datapath = path.join(datapath, ret.stationid + ".dly");
                if (!fs.existsSync(datapath)) {
                    callback390d("Error", res, {
                        error: false,
                        message: datapath + " nicht auf dem Server vorhanden"
                    });
                    return;
                }
                var counter = 0;
                var dayrecord = {};
                var linestartts = new Date();
                var lineendts = 0;
                var html = "";
                ret.stations = {};
                var rl = new LineByLineReader(datapath);
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
                                     * Ausgabe aller Tagesdaten der stationid aus stationdata
                                     */
                                    if (vglstationid.length > 0) {
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
                                if (dayrecord.variable === "TMAX" || dayrecord.variable === "TMIN") {
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
                                    dayrecord.days = [];
                                    // Tage holen 8 = 5 + 1 + 1 + 1
                                    var ivon = 22 - 1;
                                    for (var iday = 0; iday < 31; iday++) {
                                        var idis = ivon + iday * 8; // startet mit 0!
                                        if ((idis + 8) <= line.length) {
                                            var value;
                                            value = line.substr(idis, 5).trim();
                                            if (value === "999" || value === "-999") {
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
                    kla1490srv.putstationdata(stationdata, db, async, sys0000sys, res, ret, function (res, ret1) {
                        console.log('Total lines : ' + counter);
                        ret.message += " KLISTATION:" + counter;
                        callback390d("Finish", res, ret1);
                        return;
                    });
                });
            },
        ], function (error, res, ret) {
            callback390(res, ret);
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
                    outrecs.stationid = ret.stationid;
                    outrecs.source = ret.source;
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

                        }
                        var baseday = 0;
                        for (var imon = 0; imon < (month - 2); imon++) {
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
                    // Reserve
                    callback394g(null, res, ret);
                    return;
                },
                function (res, ret, callback394u) {
                    var varkeys = Object.keys(ret.outrecs.variables);
                    async.eachSeries(varkeys, function (variable, nextrec) {

                            var reqparm = {};
                            reqparm.selfields = {
                                source: ret.source,
                                stationid: ret.outrecs.stationid,
                                variable: variable
                            };
                            reqparm.updfields = {};
                            reqparm.updfields["$setOnInsert"] = {
                                source: ret.source,
                                stationid: ret.outrecs.stationid,
                                variable: variable,
                                years: JSON.stringify(ret.outrecs.variables[variable].years)
                            };
                            /**
                             * Default-Felder zufügen, werden erst nach der Übernahme versorgt
                             */
                            reqparm.updfields["$set"] = {};
                            reqparm.table = "KLIDATA";
                            sys0000sys.setonerecord(db, async, null, reqparm, res, function (res, ret1) {
                                console.log("KLIDATA-setonerecord:" +  ret.outrecs.stationid);
                                nextrec();
                                return;
                            });
                        },
                        function (error) {
                            callback394u("error", res, ret);
                            return;
                        });
                }
            ],
            function (error, res, ret) {
                callback394(res, ret);
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