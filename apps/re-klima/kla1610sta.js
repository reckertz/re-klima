/*jshint laxbreak:true */
/*global $,window,module,document,define,root,global,self,var,this,sysbase,uihelper */
/*global uientry */
(function () {
    "use strict";
    var kla1610sta = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1610sta  bekommt über getCache pivotdata oder yearlats(?)
     * und erzeugt animierte Gifs mit der Option weiterer Zuordnungen
     * nach latitude und
     * nach temperatur, grundet auf Ganzzahlen
     * mit Sekundärdaten aus HYDE
     */
    var defaultvariablename = "";
    var defaultsource = "";
    var actprjname;
    var fullname;
    var actfullname;
    var fulldatafilename;
    var datafilename;
    var selyears;
    var yearlats;
    var tarray;
    var cid;
    var cidw;
    var sgif;
    var aktyear;
    var aktvariablename;
    var starecord;
    var selvariablename;
    var stationarray = [];
    var stationrecords = {};

    var staschema = {
        entryschema: {
            source: {
                title: "Quelle",
                type: "string", // currency, integer, datum, text, key
                class: "uieselectinput",
                default: "",
                io: "i",
                enum: [
                    "GHCND",
                    "GHCN",
                    "GHCN4",
                    "CRUTEM4",
                    "ECAD"
                ]
            },
            variablename: {
                title: "Variable",
                type: "string", // currency, integer, datum, text, key
                class: "uieselectinput",
                default: "",
                io: "i",
                enum: [
                    "tmin",
                    "tmax",
                    "tavg"
                ]
            },
            stationid: {
                title: "Station-ID",
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
                io: "i"
            },
            region: {
                title: "Region iwS",
                type: "string", // currency, integer, datum, text, key
                class: "uietext",
                default: "",
                io: "i"
            },
            anzyears: {
                title: "#Jahre ><=",
                type: "string", // currency, integer, datum, text, key
                class: "uietext",
                default: "",
                io: "i"
            },
            fromyear: {
                title: "von Jahr ><=",
                type: "string", // currency, integer, datum, text, key
                class: "uietext",
                default: "",
                io: "i"
            },
            toyear: {
                title: "bis Jahr ><=",
                type: "string", // currency, integer, datum, text, key
                class: "uietext",
                default: "",
                io: "i"
            },
            climatezone: {
                title: "Zone",
                type: "string", // currency, integer, datum, text, key
                class: "uieselectinput",
                default: "",
                io: "i",
                enum: [{
                        value: "N0",
                        text: "North Cold 60-90"
                    },
                    {
                        value: "N1",
                        text: "North Moderate 40-60"
                    },
                    {
                        value: "N2",
                        text: "North Subtrop 23,5-40"
                    },
                    {
                        value: "N3",
                        text: "North Tropic 0-23,5"
                    },
                    {
                        value: "S0",
                        text: "South Cold 60-90"
                    },
                    {
                        value: "S1",
                        text: "South Moderate 40-60"
                    },
                    {
                        value: "S2",
                        text: "South Subtrop 23,5-40"
                    },
                    {
                        value: "S3",
                        text: "South Tropic 0-23,5"
                    },
                    {
                        value: "G0",
                        text: "Global Cold 60-90"
                    },
                    {
                        value: "G1",
                        text: "Global Moderate 40-60"
                    },
                    {
                        value: "G2",
                        text: "Global Subtrop 23,5-40"
                    },
                    {
                        value: "G3",
                        text: "Global Tropic 0-23,5"
                    },
                    {
                        value: "*",
                        text: "Alle Zonen"
                    }
                ]
            },
            height: {
                title: "Höhe",
                type: "string", // currency, integer, datum, text, key
                class: "uietext",
                default: "",
                io: "i"
            }
        }
    };


    kla1610sta.show = function (parameters, navigatebucket) {
        // https://www.sitepoint.com/get-url-parameters-with-javascript/
        var queryString = window.location.search;
        console.log(queryString); // ?product=shirt&color=blue&newuser&size=m
        queryString = queryString.substr(1);
        var idis = queryString.lastIndexOf("?");
        if (idis > 0) {
            queryString = queryString.substr(0, idis);
        }
        if (queryString && queryString.length > 0) {
            var parms = queryString.split("&");
            var parmobj = {};
            parms.forEach(function(item) {
                var subparms = item.split("=");
                var key = subparms[0];
                parmobj[key] = subparms[1];
             });
             console.log(parmobj);
             defaultsource = parmobj.source || "";
             defaultvariablename = parmobj.variablename || "";
             fullname = parmobj.fullname || "";
             actfullname = parmobj.fullname || "";

        }



        if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {

        }

        if (typeof parameters !== "undefined" && Array.isArray(parameters) && parameters.length > 0) {
            fullname = parameters[0].fullname;
            fulldatafilename = parameters[0].fulldatafilename;
            datafilename = parameters[0].datafilename;
            selyears = parameters[0].selyears;
            yearlats = parameters[0].yearlats;
        }
        if (typeof navigatebucket === "object") {
            if (navigatebucket.navigate === "back") {
                if (typeof navigatebucket.oldparameters === "object") {
                    /* hier wird es sehr kontext-/anwendungsspezifisch */
                    if (navigatebucket.oldparameters.length > 0) {
                        if (typeof navigatebucket.oldparameters[0].prjname !== "undefined") {
                            actprjname = navigatebucket.oldparameters[0].prjname;
                        }
                    }
                }
            }
        }
        if (typeof parameters !== "undefined") {
            if (Array.isArray(parameters) && parameters.length > 0) {
                actprjname = parameters[0].prjname;
            }
        }
        var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
        cid = wname + "map";
        cidw = cid + "w";
        $(".content").empty();
        $(".headertitle").html("Stations auswählen");
        $(".headertitle").attr("title", "kla1610sta");
        $(".content").attr("pageid", "kla1610sta");
        $(".content").attr("id", "kla1610sta");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1610sta")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1610sta_isdirty",
                value: "false"
            }));
        $(".headerright").remove();
        $(".header")
            .append($("<div/>", {
                class: "headerright",
                css: {
                    float: "right"
                }
            }));
        $(".headerright")
            .prepend($("<button/>", {
                    title: "Actions",
                    class: "dropdown-right",
                    css: {
                        float: "right",
                        height: "0.7em",
                        width: "35px",
                        "background-color": "navyblue"
                    }
                })
                .append($("<div/>", {
                        class: "dropdown-content-right",
                        css: {
                            margin: 0,
                            right: 0,
                            left: "auto"
                        }
                    })
                    .append($("<ul/>")
                        .append($("<li/>", {
                            class: "dropdown-menuepoint",
                            html: "zurück",
                            click: function (evt) {
                                evt.preventDefault();
                                var parameters = {};
                                sysbase.navigateBack(parameters, function (ret) {
                                    if (ret.error === true) {
                                        sysbase.putMessage(ret.message, 3);
                                    }
                                });
                                return;
                            }
                        }))
                    )
                )
            );

        sysbase.initFooter();

        $("#kla1610sta.content")
            .append($("<div/>", {
                css: {
                    width: "100%",
                    "background-color": "lightsteelblue"
                }
            }));

        $("#kla1610sta.content").empty();
        $("#kla1610sta.content")
            .append($("<div/>", {
                    class: "col1of2",
                    css: {
                        width: "30%",
                        "background-color": "lightsteelblue",
                        overflow: "auto"
                    }
                })
                .append($("<form/>", {
                    id: "kla1610staform",
                    class: "uieform"
                }))
                .append($("<div/>", {
                    id: "kla1610stalock",
                    css: {
                        float: "left",
                        width: "100%",
                        "text-align": "center"
                    }
                }))
            )
            .append($("<div/>", {
                    class: "col2of2",
                    css: {
                        width: "70%",
                        "background-color": "lightsteelblue",
                        overflow: "auto"
                    }
                })
                .append($("<div/>", {
                    id: "kla1610stat1",
                }))
            );

        $(document).on("keypress", "input", function (evt) {
            if (evt.keyCode === 13) {
                // Cancel the default action, if needed
                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                // Trigger the button element with a click
                //document.getElementById("myBtn").click();
            }
        });

        var h = $(".content").height();
        var hh = $(".header").height();
        h += hh;
        var fh = $(".footer").height();
        h -= fh - 3;
        $("#kla1610sta .col1of2").height(h);
        $("#kla1610sta .col2of2").height(h);

        uientry.getSchemaUI("kla1610sta", staschema, "kla1610sta", "kla1610staform", function (ret) {
            if (ret.error === false) {
                //sysbase.putMessage("sys0300usr" + " format OK", 0);
                // Daten ausgeben
                starecord = {
                    source: defaultsource,
                    variablename: defaultvariablename,
                    name: "berlin"
                };
                uientry.fromRecord2UI($("#kla1610staform"), starecord, staschema);
                uientry.init();
                $("#kla1610staform")
                    .append($("<div/>", {
                            css: {
                                "text-align": "center",
                                width: "100%"
                            }
                        })
                        /*
                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Randauszählung",
                        }))
                        */
                        .append($("<button/>", {
                            id: "kla1610staliste",
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Liste",
                            click: function (evt) {
                                evt.preventDefault();
                                kla1610sta.getStations();
                            }
                        }))

                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Worldmap (Datenbankzugriff)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                window.parent.sysbase.setCache("stationrecords", stationrecords);
                                if (Object.keys(stationrecords).length === 0) {
                                    sysbase.putMessage("Bitte erst die Liste aufrufen", 3);
                                    return;
                                } else {
                                    window.parent.sysbase.setCache("starecord", starecord);
                                    var idc20 = window.parent.sysbase.tabcreateiframe("Stations-Map", "", "re-klima", "kla1630map", "klaworldmap.html");
                                    window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                                }
                            }
                        }))


                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Worldmap (aus der Liste)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                var stationarray = [];
                                var test = $("#kla1610sta").find(".col2of2").find("tbody tr:visible");
                                $("#kla1610sta").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
                                    var stationid = $(row).attr("rowid");
                                    var sitename = $(row).find("td:nth-child(2)").html(); //
                                    var longitude = $(row).find("td:nth-child(8)").text();
                                    var latitude = $(row).find("td:nth-child(9)").text();
                                    stationarray.push({
                                        stationid: stationid,
                                        sitename: sitename,
                                        longitude: parseFloat(longitude),
                                        latitude: parseFloat(latitude)
                                    });
                                });
                                if (stationarray.length === 0) {
                                    sysbase.putMessage("Bitte erst die Liste aufrufen", 3);
                                    return;
                                } else {
                                    window.parent.sysbase.setCache("stationarray", stationarray);
                                    window.parent.sysbase.setCache("starecord", starecord);
                                    var idc20 = window.parent.sysbase.tabcreateiframe("Stations-Map", "", "re-klima", "kla1630map", "klaworldmap.html");
                                    window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                                }
                            }
                        }))


                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Übernahme (aus der Liste)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                var stationarray = [];
                                var stationids = [];
                                var test = $("#kla1610sta").find(".col2of2").find("tbody tr:visible");
                                $("#kla1610sta").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
                                    var stationid = $(row).attr("rowid");
                                    var sitename = $(row).find("td:nth-child(2)").html(); //
                                    var longitude = $(row).find("td:nth-child(8)").text();
                                    var latitude = $(row).find("td:nth-child(9)").text();
                                    stationids.push(stationid);
                                    stationarray.push({
                                        stationid: stationid,
                                        sitename: sitename,
                                        longitude: parseFloat(longitude),
                                        latitude: parseFloat(latitude)
                                    });
                                });
                                if (stationarray.length === 0) {
                                    sysbase.putMessage("Bitte erst die Liste aufrufen", 3);
                                    return;
                                } else {
                                    var source = $("#kla1610stasource").val();    //   $(this).closest("tr").find('td:first-child').text();
                                    var ghcnclock = kla1610sta.showclock("#kla1610stalock");
                                    var that = this;
                                    $(that).attr("disabled", true);
                                    var jqxhr = $.ajax({
                                        method: "GET",
                                        crossDomain: false,
                                        url: sysbase.getServer("ghcnddata"),
                                        data: {
                                            timeout: 10 * 60 * 1000,
                                            source: source,
                                            stationids: stationids
                                        }
                                    }).done(function (r1, textStatus, jqXHR) {
                                        clearInterval(ghcnclock);
                                        sysbase.checkSessionLogin(r1);
                                        var ret = JSON.parse(r1);
                                        sysbase.putMessage(ret.message, 1);
                                        $("#kla1610staliste").click();
                                        return;
                                    }).fail(function (err) {
                                        clearInterval(ghcnclock);
                                        //$("#kli1400raw_rightwdata").empty();
                                        //document.getElementById("kli1400raw").style.cursor = "default";
                                        sysbase.putMessage("ghcnddata:" + err, 3);
                                        return;
                                    }).always(function () {
                                        // nope
                                        $(that).attr("disabled", false);
                                    });
                                }
                            }
                        }))



                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Übernahme (alle)",
                            click: function (evt) {
                                evt.preventDefault();
                                    var source = $("#kla1610stasource").val();    //   $(this).closest("tr").find('td:first-child').text();
                                    var ghcnclock = kla1610sta.showclock("#kla1610stalock");
                                    var that = this;
                                    debugger;
                                    $(that).attr("disabled", true);
                                    var jqxhr = $.ajax({
                                        method: "GET",
                                        crossDomain: false,
                                        url: sysbase.getServer("ghcndall"),
                                        data: {
                                            timeout: 10 * 60 * 1000,
                                            source: source
                                        }
                                    }).done(function (r1, textStatus, jqXHR) {
                                        clearInterval(ghcnclock);
                                        sysbase.checkSessionLogin(r1);
                                        var ret = JSON.parse(r1);
                                        sysbase.putMessage(ret.message, 1);
                                        $("#kla1610staliste").click();
                                        return;
                                    }).fail(function (err) {
                                        clearInterval(ghcnclock);
                                        //$("#kli1400raw_rightwdata").empty();
                                        //document.getElementById("kli1400raw").style.cursor = "default";
                                        sysbase.putMessage("ghcnddata:" + err, 3);
                                        return;
                                    }).always(function () {
                                        // nope
                                        $(that).attr("disabled", false);
                                    });

                            }
                        }))




                        .append($("<button/>", {
                            html: "Batch-Analyse",
                            css: {
                                float: "left",
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                /**
                                 * Popup Prompt zur Bestätigung der kompletten Übernahme
                                 * kli1400rawfullname -  $("#kli1400rawfullname").text();
                                 */
                                var username = uihelper.getUsername();
                                var popschema = {
                                    entryschema: {
                                        refname: {
                                            title: "Batch-Rechnungen",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uietext",
                                            default: "",
                                            width: "100px",
                                            io: "i"
                                        },
                                        comment: {
                                            title: "Kommentar",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uietext",
                                            default: "",
                                            io: "i"
                                        }
                                    }
                                };
                                var poprecord = {};
                                poprecord.refname = starecord.source;
                                var anchorHash = "#kla1610sta";
                                var title = "Batch Regressionsanalyse";
                                var pos = {
                                    left: $("#kla1610sta").offset().left,
                                    top: Math.ceil($(this).offset().top + $(this).height() + 20)
                                };

                                $(document).on('popupok', function (evt, extraParam) {
                                    evt.preventDefault();
                                    evt.stopPropagation();
                                    evt.stopImmediatePropagation();
                                    var ghcnclock = kla1610sta.showclock("#kla1610stalock");
                                    var that = this;
                                    $(that).attr("disabled", true);
                                    var jqxhr = $.ajax({
                                        method: "GET",
                                        crossDomain: false,
                                        url: sysbase.getServer("batchreg"),
                                        data: {
                                            timeout: 10 * 60 * 1000,
                                            starecord: starecord
                                        }
                                    }).done(function (r1, textStatus, jqXHR) {
                                        clearInterval(ghcnclock);
                                        sysbase.checkSessionLogin(r1);
                                        var ret = JSON.parse(r1);
                                        sysbase.putMessage(ret.message, 1);
                                        return;
                                    }).fail(function (err) {
                                        clearInterval(ghcnclock);
                                        //$("#kli1400raw_rightwdata").empty();
                                        //document.getElementById("kli1400raw").style.cursor = "default";
                                        sysbase.putMessage("batchreg:" + err, 3);
                                        return;
                                    }).always(function () {
                                        // nope
                                        $(that).attr("disabled", false);
                                    });
                                });

                                uientry.inputDialogX(anchorHash, pos, title, popschema, poprecord, function (ret) {
                                    if (ret.error === false) {
                                        // outrec.isactive = "false"; // true oder false wenn gelöscht
                                    } else {
                                        sysbase.putMessage("Batch-Berechnungen erfolglos", 3);
                                        return;
                                    }
                                });
                            }
                        }))

                    );
            }
        });

    }; // Ende show

    $(document).on("click", ".kla1610staid", function (evt) {
        evt.preventDefault();
        var stationid = $(this).closest("tr").attr("rowid");
        /*
        window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
        var idc20 = window.parent.sysbase.tabcreateiframe("Stations", "", "re-klima", "kla1610sta", "kliheatmap.html");
        window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
        */
        var source = $(this).closest("tr").find('td:first-child').text();
        var str1 = $(this).closest("tr").find(':nth-child(2)').text();
        var idis1 = str1.indexOf(" ");
        var variablename = "";
        if (idis1 > 10) {
            variablename = str1.substr(idis1+1, 4);
            selvariablename = variablename;
        }
        console.log("Station:" + stationid + " from:" + source);
        /*
         sysbase.navigateTo("kli1620shm", [{
             stationid: stationid,
             source: source,
             variablename: selvariablename
         }], function (ret) {
             if (ret.error === true) {
                 alert(ret.message);
             }
         });
         */
        if (source !== "ECAD") {
            window.parent.sysbase.setCache("onestation", JSON.stringify({
                stationid: stationid,
                source: source,
                variablename: selvariablename,
                starecord: starecord
            }));
            var tourl = "klaheatmap.html" + "?" + "stationid=" + stationid + "&source=" + source + "&variablename=" + variablename;
            var stationname = stationarray[stationid];
            var tabname =variablename + " " + stationname;
            var idc20 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1620shm", tourl);
            window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
        } else if (source === "ECAD") {
            window.parent.sysbase.setCache("onestation", JSON.stringify({
                stationid: stationid,
                source: source,
                variablename: selvariablename,
                starecord: starecord
            }));
            var tourl = "kliheatmap.html" + "?" + "stationid=" + stationid + "&source=" + source + "&variablename=" + selvariablename + "&starecord=" + JSON.stringify(starecord);
            var stationname = stationarray[stationid];
            var idc20 = window.parent.sysbase.tabcreateiframe(stationname, "", "re-klima", "kli1640eca", tourl);
            window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();


        }
    });

    /**
     * Aufbau Filter und Listenausgaben zunächst einmal
     */
    kla1610sta.getStations = function () {
        $("#kla1610stalist").empty();
        starecord = {};
        uientry.fromUI2Record("#kla1610staform", starecord, staschema);
        selvariablename = starecord.variablename; // wird erst später gebraucht
        var sel = {};
        var selfunction = "";
        var where = "";
        if (typeof starecord.source !== "undefined" && starecord.source.length > 0) {
            if (where.length > 0) where += " AND ";
            where += " KLISTATIONS.source ='" +  starecord.source + "'";
        }
        if (typeof starecord.stationid !== "undefined" && starecord.stationid.length > 0) {
            if (where.length > 0) where += " AND ";
            where += " KLISTATIONS.stationid ='" +  starecord.stationid + "'";
        }
        if (typeof starecord.name !== "undefined" && starecord.name.length > 0) {
            if (where.length > 0) where += " AND ";
            where += " lower(stationname) LIKE '%" +  starecord.name.toLowerCase() + "%'";
        }
        if (typeof starecord.region !== "undefined" && starecord.region.length > 0) {
            if (where.length > 0) where += " AND ";
            where += "(";
            where += " lower(region) LIKE '%" +  starecord.region.toLowerCase() + "%'";
            where += " OR lower(subregion) LIKE '%" +  starecord.region.toLowerCase() + "%'";
            where += " OR lower(countryname) LIKE '%" +  starecord.region.toLowerCase() + "%'";
            where += ")";
        }
        if (typeof starecord.anzyears !== "undefined" && starecord.anzyears.trim().length > 0) {
            //sel.anzyears = kli9020fun.getComparator(starecord.anzyears);
            if (where.length > 0) where += " AND ";
            var anzparts = starecord.anzyears.match(/(<=|>=|<|>|=)(\d*)/);
            if (anzparts !== null && anzparts.length > 2) {
                where += " anzyears " + anzparts[1] + parseInt(anzparts[2]);
            }
        }
        if (typeof starecord.fromyear !== "undefined" && starecord.fromyear.trim().length > 0) {
            //sel.fromyear = kli9020fun.getComparator(starecord.fromyear);
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
            sel.toyear = kli9020fun.getComparator(starecord.toyear);
        }
        if (typeof starecord.climatezone !== "undefined" && starecord.climatezone.trim().length > 0) {
            // sel.climatezone = kli9020fun.getComparator (starecord.toyear);
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
            //sel.height = kli9020fun.getComparator (starecord.height);

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
        var table = "KLISTATIONS";
        var sqlStmt = "";
        sqlStmt += "SELECT ";
        sqlStmt += "KLISTATIONS.source, KLISTATIONS.stationid, stationname, ";
        sqlStmt += "region, subregion, countryname, ";
        sqlStmt += " temperature,";
        sqlStmt += "lats, longitude, latitude, height, ";
        sqlStmt += "KLIDATA.variable, ";
        sqlStmt += "KLIDATA.anzyears, KLIDATA.realyears, KLIDATA.fromyear, KLIDATA.toyear";
        // sqlStmt += "anzyears, realyears, fromyear, toyear";
        sqlStmt += " FROM " + table;

        sqlStmt += " LEFT JOIN KLIDATA";
        sqlStmt += " ON KLIDATA.source = KLISTATIONS.source";
        sqlStmt += " AND KLIDATA.stationid = KLISTATIONS.stationid";
        if (where.length > 0){
            sqlStmt += " WHERE " + where;
        }
        sqlStmt += " ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";
        var skip = 0;
        var limit = 0;
        var api = "getallrecords";


        uihelper.getAllRecords(sqlStmt, null, null, skip, limit, api, table, function (ret) {
            if (ret.error === true) {
                // sollte nicht passieren??? oder auch hier anlegen
                sysbase.putMessage("Error:" + ret.message, 3);
                return;
            } else {
                if (ret.records !== "undefined" && ret.records !== null) {
                    /*
                    var irec = 0;
                    for (var property in ret.records) {
                        if (ret.records.hasOwnProperty(property)) {
                            irec++;
                            var record = ret.records[property];
                            delete record._id;
                            $("#kla1610stalist")
                                .append($("<li/>", {
                                    html: JSON.stringify(record)
                                }));
                        }
                    }
                    */
                    var stationformat = {
                        source: {
                            title: "Quelle",
                            width: "10%",
                            align: "center"
                        },
                        station: {
                            title: "Station",
                            width: "20%",
                            align: "center"
                        },
                        region: {
                            title: "Region",
                            width: "20%",
                            align: "center"
                        },
                        anzyears: {
                            title: "#Jahre",
                            width: "8%",
                            align: "center"
                        },
                        realyears: {
                            title: "#Daten",
                            width: "8%",
                            align: "center"
                        },
                        fromyear: {
                            title: "von",
                            width: "8%",
                            align: "center"
                        },
                        toyear: {
                            title: "bis",
                            width: "8%",
                            align: "center"
                        },
                        longitude: {
                            title: "lon",
                            width: "8%",
                            align: "center"
                        },
                        latitude: {
                            title: "lat",
                            width: "8%",
                            align: "center"
                        },
                        height: {
                            title: "height",
                            width: "8%",
                            align: "center"
                        },
                        regression: {
                            title: "reg(m)",
                            width: "8%",
                            align: "center"
                        },
                        minreg: {
                            title: "min(m)",
                            width: "8%",
                            align: "center"
                        },
                        maxreg: {
                            title: "max(m)",
                            width: "8%",
                            align: "center"
                        }


                    };
                    stationrecords = ret.records;
                    //stationrecords.source = ret.rsource;
                    var htmltable = "<table class='tablesorter'>";
                    var irow = 0;
                    for (var property in ret.records) {
                        if (ret.records.hasOwnProperty(property)) {
                            var record = ret.records[property];
                            delete record._id;
                            var rowid = record.stationid; // "key" + irow;
                            record.station = record.stationid;
                            record.station += " " + record.variable || "" + " ";
                            record.station += "<br>" + record.stationname;
                            if (typeof record.temperature === "undefined" || record.temperature ===null) {
                                record.station += "*unknown";
                            } else {
                                record.station += " " + record.temperature;
                            }
                            record.station += "<br>";
                            record.station += "<img src='/images/icons-png/arrow-u-black.png'";
                            record.station += " title='Upload *.dly'";
                            record.station += " class='kla1610staupl'>";
                            stationarray[record.stationid] = record.stationname;
                            //delete record.stationid;
                            //delete record.name;
                            record.region += "<br>";
                            record.region += record.subregion;
                            record.region += "<br>";
                            record.region += record.countryname;
                            delete record.subregion;
                            delete record.countryname;
                            delete record.lats;
                            try {
                                record.regression = record.analysis.tavg.regression.total.m || "";
                            } catch (err) {}
                            // "analysis.tavg.regression.mtotal": 1,
                            record.minreg = "";
                            record.maxreg = "";
                            // if (irow < 2) debugger;
                            try {
                                if (typeof record.analysis !== "undefined" && typeof record.analysis.tavg !== "undefined" &&
                                    record.analysis.tavg.regression !== "undefined" && record.analysis.tavg.regression.mtotal !== "undefined") {
                                    var minreg = null;
                                    var maxreg = null;
                                    mtotal = record.analysis.tavg.regression.mtotal;
                                    for (var imo = 0; imo < Object.keys(mtotal).length; imo++) {
                                        var mo = "M" + ("00" + (imo + 1)).slice(-2);
                                        var m = mtotal[mo].m;
                                        if (minreg === null) {
                                            minreg = m;
                                        } else if (m < minreg) {
                                            minreg = m;
                                        }
                                        if (maxreg === null) {
                                            maxreg = m;
                                        } else if (m > maxreg) {
                                            maxreg = m;
                                        }
                                    }
                                    record.minreg = minreg;
                                    record.maxreg = maxreg;
                                }
                            } catch (err) {}
                            var line = uihelper.transformJSON2TableTR(record, irow, stationformat, rowid, "kla1610staid tablesorter-ignoreRow");
                            htmltable += line;
                            irow++;
                        }
                    }
                    htmltable += "</body>";
                    htmltable += "</table>";

                    $("#kla1610sta").find(".col2of2").empty();
                    $("#kla1610sta").find(".col2of2")
                        .append($("<span/>", {
                            html: htmltable
                        }));
                    $(".tablesorter").tablesorter({
                        theme: "blue",
                        widgets: ['filter'],
                        widthFixed: true,
                        widgetOptions: {
                            filter_hideFilters: false,
                            filter_ignoreCase: true
                        }
                    }); // so funktioniert es
                    sysbase.putMessage("Stations ausgegeben", 1);
                } else {
                    sysbase.putMessage("Keine Stations gefunden", 3);
                    return;
                }
            }
        });
    };



    $(document).on("click", ".kla1610staupl", function (evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        var stationid = $(this).closest("tr").attr("rowid");
        var source = $(this).closest("tr").find('td:first-child').text();
        var ghcnclock = kla1610sta.showclock("#kla1610stalock");
        var that = this;
        $(that).attr("disabled", true);
        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer("ghcnddata"),
            data: {
                timeout: 10 * 60 * 1000,
                source: source,
                stationid: stationid,
                fullname: fullname
            }
        }).done(function (r1, textStatus, jqXHR) {
            clearInterval(ghcnclock);
            sysbase.checkSessionLogin(r1);
            var ret = JSON.parse(r1);
            sysbase.putMessage(ret.message, 1);

            $("#kla1610staliste").click();

            return;
        }).fail(function (err) {
            clearInterval(ghcnclock);
            //$("#kli1400raw_rightwdata").empty();
            //document.getElementById("kli1400raw").style.cursor = "default";
            sysbase.putMessage("ghcnddata:" + err, 3);
            return;
        }).always(function () {
            // nope
            $(that).attr("disabled", false);
        });
    });





    kla1610sta.getBucketValue = function (bucket, value) {
        var gvalue = "999";
        if (typeof value !== "undefined" && value !== null) {
            gvalue = parseInt(value);
            if (bucket === 1) {
                if (gvalue < -40) {
                    gvalue = "-41!";
                } else if (gvalue > 40) {
                    gvalue = "41!";
                } else {
                    gvalue = "" + gvalue;
                }
            } else {
                var grem = gvalue % bucket;
                var von = Math.floor(gvalue / bucket) * bucket;
                var bis = von + bucket - 1;
                // console.log(gvalue, bucket, von, bis);
                gvalue = "" + von; //  + " " + bis;
            }
        }
        return gvalue;
    };


    kla1610sta.showclock = function (clockcontainer) {
        // Update the count down every 1 second
        if (typeof clockcontainer === "string") {
            if (!clockcontainer.startsWith("#")) clockcontainer = "#" + clockcontainer;
        }
        if ($('#kliclock', clockcontainer).length === 0) {
            $(clockcontainer)
                .append($("<span/>", {
                    id: "kliclock",
                    class: "kliclock",
                    html: "Stoppuhr",
                    css: {
                        "font-size": "2em",
                        "font-weight": "bold"
                    }
                }));
        }
        var countDownDate = new Date().getTime();
        var xclock = setInterval(function () {
            // Get today's date and time
            var now = new Date().getTime();
            // Find the distance between now and the count down date
            var distance = now - countDownDate;
            // Time calculations for days, hours, minutes and seconds
            // var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            distance = Math.floor(distance - seconds * 1000);
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            distance = Math.floor(distance - minutes * 1000 * 60);
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            // Display the result in the element with id="demo"
            $("#kliclock").text(hours + "h " + minutes + "m " + seconds + "s ");
        }, 1000);
        return xclock;
    };

    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1610sta;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1610sta;
        });
    } else {
        // included directly via <script> tag
        root.kla1610sta = kla1610sta;
    }
}());