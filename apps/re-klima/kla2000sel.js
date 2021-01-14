/*jshint laxbreak:true */
/*global $,window,module,document,define,root,global,self,var,this,sysbase,uihelper */
/*global uientry,planetaryjs, */
(function () {
    "use strict";
    var kla2000sel = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla2000sel  bekommt über getCache pivotdata oder yearlats(?)
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
    var selstations = [];
    var stationrecords = {};
    var sqlStmt = "";
    var origin = "";
    var poprecord = {};
    var confrecord = {};
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
                    "PAGES2K",
                    "HYGRIS",
                    "NAO",
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
                    "TMIN,TMAX",
                    "WLVL",
                    "PRCP",
                    "TMIN",
                    "TMAX",
                    "TSUN",
                    "PSUN",
                    "SNOW",
                    "NAO",
                    "PAGES2K",
                    ""
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
            },
            latN: {
                title: "Latitude North",
                type: "string", // currency, integer, datum, text, key
                class: "uietext",
                default: "",
                io: "h"
            },
            latS: {
                title: "Latitude South",
                type: "string", // currency, integer, datum, text, key
                class: "uietext",
                default: "",
                io: "h"
            },
            lonW: {
                title: "Longitude West",
                type: "string", // currency, integer, datum, text, key
                class: "uietext",
                default: "",
                io: "h"
            },
            lonE: {
                title: "Longitude East",
                type: "string", // currency, integer, datum, text, key
                class: "uietext",
                default: "",
                io: "h"
            }
        }
    };


    kla2000sel.show = function (parameters, navigatebucket) {
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
            parms.forEach(function (item) {
                var subparms = item.split("=");
                var key = subparms[0];
                parmobj[key] = subparms[1];
            });
            console.log(parmobj);
            defaultsource = parmobj.source || "";
            defaultvariablename = parmobj.variablename || "";
            fullname = parmobj.fullname || "";
            actfullname = parmobj.fullname || "";
            if (typeof parmobj.origin !== "undefined" && parmobj.origin.length > 0) {
                origin = parmobj.origin;
            }
            if (typeof parmobj.sqlStmt !== "undefined" && parmobj.sqlStmt.length > 0) {
                sqlStmt = decodeURIComponent(parmobj.sqlStmt);
            }
            if (typeof parmobj.selrecord !== "undefined" && parmobj.selrecord.length > 0) {
                starecord = JSON.parse(decodeURIComponent(parmobj.selrecord));
            }
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
        if (typeof defaultsource === "undefined" || defaultsource === null || defaultsource.trim().length === 0) {
            defaultsource = "GHCND";
        }

        if (typeof defaultvariablename === "undefined" || defaultvariablename === null || defaultvariablename.trim().length === 0) {
            defaultvariablename = "TMAX";
        }

        var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
        cid = wname + "map";
        cidw = cid + "w";
        $(".content").empty();
        $(".headertitle").html("Stationen selektieren");
        $(".headertitle").attr("title", "kla2000sel");
        $(".content").attr("pageid", "kla2000sel");
        $(".content").attr("id", "kla2000sel");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla2000sel")
            .append($("<input/>", {
                type: "hidden",
                id: "kla2000sel_isdirty",
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
                            html: "HTML-Tabelle download alle",
                            click: function (evt) {
                                evt.preventDefault();
                                uihelper.downloadHtmlTable($(".tablesorter"), "html-extrakt", true);
                                return;
                            }
                        }))
                        .append($("<li/>", {
                            class: "dropdown-menuepoint",
                            html: "HTML-Tabelle download selektiv",
                            click: function (evt) {
                                evt.preventDefault();
                                uihelper.downloadHtmlTable($(".tablesorter"), "html-extrakt", true, true);
                                return;
                            }
                        }))
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

        $("#kla2000sel.content")
            .append($("<div/>", {
                css: {
                    width: "100%",
                    "background-color": "lightsteelblue"
                }
            }));

        $("#kla2000sel.content").empty();
        $("#kla2000sel.content")
            .append($("<div/>", {
                    class: "col1of2",
                    css: {
                        width: "30%",
                        "background-color": "lightsteelblue",
                        overflow: "auto"
                    }
                })
                .append($("<form/>", {
                    id: "kla2000selform",
                    class: "uieform"
                }))
                .append($("<div/>", {
                    id: "kla2000sellock",
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
                    id: "kla2000selt1"
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
        $("#kla2000sel .col1of2").height(h);
        $("#kla2000sel .col2of2").height(h);

        uientry.getSchemaUI("kla2000sel", staschema, "kla2000sel", "kla2000selform", function (ret) {
            if (ret.error === false) {
                //sysbase.putMessage("sys0300usr" + " format OK", 0);
                // Daten ausgeben
                starecord = {
                    source: defaultsource,
                    variablename: defaultvariablename,
                    /* name: "berlin" */
                    anzyears: ">=150"
                    /* fromyear: "<=1850", */
                    /* toyear: ">=1850", */
                };
                uientry.fromRecord2UI($("#kla2000selform"), starecord, staschema);
                uientry.init();
                $("#kla2000selform")
                    .append($("<div/>", {
                            id: "kla2000selbuttons",
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
                            id: "kla2000selliste",
                            css: {
                                float: "left",
                                clear: "both",
                                "margin": "10px"
                            },
                            html: "Liste",
                            click: function (evt) {
                                evt.preventDefault();
                                $("#kla2000selbuttons").hide();
                                kla2000sel.getStations(false, false, false, function (ret) {
                                    $("#kla2000selbuttons").show();
                                });
                            }
                        }))


                        .append($("<button/>", {
                            id: "kla2000selall",
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Liste auswerten",
                            click: function (evt) {
                                evt.preventDefault();
                                selstations = [];
                                $(".kla2000selid").each(function (index, item) {
                                    selstations.push({
                                        source: $(this).attr("source"),
                                        stationid: $(this).attr("rowid"),
                                        variable: $(this).attr("variable")
                                    });
                                });
                                window.parent.sysbase.setCache("onestation", JSON.stringify({
                                    selstations: selstations,
                                    stationid: "",
                                    source: starecord.source,
                                    variablename: starecord.variable,
                                    starecord: starecord,
                                }));
                                var tourl = "klaheatmap.html" + "?";
                                var stationname = stationarray[confrecord.stationid];
                                var tabname = "Sammelauswertung"; // confrecord.stationid + " " + stationname;
                                var selsource = starecord.source; // $("#kla2000selsource").val();
                                if (selsource === "GHCND") {
                                    var idc20 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla2100rep", tourl);
                                    window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                                } else if (selsource === "HYGRIS") {
                                    var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla2100rep", tourl);
                                    window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
                                }
                                return;
                            }
                        }))

                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Worldmap (Liste)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                var stationarray = [];
                                var test = $("#kla2000sel").find(".col2of2").find("tbody tr:visible");
                                $("#kla2000sel").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
                                    var stationid = $(row).attr("rowid");
                                    var sitename = $(row).find("td:nth-child(2)").html(); //
                                    var longitude = $(row).attr("longitude"); // .find("td:nth-child(8)").text();
                                    var latitude = $(row).attr("latitude"); // .find("td:nth-child(9)").text();
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
                            id: "kla2000seldwn",
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "HTML-Tabelle download",
                            click: function (evt) {
                                evt.preventDefault();
                                uihelper.downloadHtmlTable($(".tablesorter"), "html-extrakt", true);
                                return;
                            }
                        }))


                        /*
                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Globus (Filter)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                var stationarray = [];
                                var test = $("#kla2000sel").find(".col2of2").find("tbody tr:visible");
                                $("#kla2000sel").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
                                    var stationid = $(row).attr("rowid");
                                    var sitename = $(row).find("td:nth-child(2)").html(); //
                                    var longitude = $(row).attr("longitude"); // .find("td:nth-child(8)").text();
                                    var latitude = $(row).attr("latitude"); // .find("td:nth-child(9)").text();
                                    var fromyear = $(row).attr("fromyear");
                                    var toyear = $(row).attr("toyear");
                                    stationarray.push({
                                        stationid: stationid,
                                        sitename: sitename,
                                        longitude: parseFloat(longitude),
                                        latitude: parseFloat(latitude),
                                        fromyear: parseInt(fromyear),
                                        toyear: parseInt(toyear),
                                    });
                                });
                                if (stationarray.length === 0) {
                                    sysbase.putMessage("Bitte erst die Liste aufrufen", 3);
                                    return;
                                } else {
                                    window.parent.sysbase.setCache("stationarray", stationarray);
                                    window.parent.sysbase.setCache("starecord", starecord);
                                    var tourl = "klaplanetary.html" + "?" + "source=" + starecord.source;
                                    tourl += "&variablename=" + starecord.variablename;
                                    tourl += "&fromyear=" + starecord.fromyear;
                                    tourl += "&toyear=" + starecord.toyear;
                                    var idc640 = window.parent.sysbase.tabcreateiframe("Globe", "", "re-klima", "kla1640glo", tourl);
                                    window.parent.$(".tablinks[idhash='#" + idc640 + "']").click();
                                }
                            }
                        }))
                        */

                        .append($("<button/>", {
                            html: "Leaflet-Pins (Liste)",
                            id: "kla2100reppins",
                            css: {
                                float: "left",
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                // Iteration Liste für stationid, longitude, latitude
                                // Übergabe stringified
                                var stationarray = [];
                                var test = $("#kla2000sel").find(".col2of2").find("tbody tr:visible");
                                $("#kla2000sel").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
                                    var stationid = $(row).attr("rowid");
                                    var sitename = $(row).find("td:nth-child(2)").text(); //
                                    var longitude = $(row).attr("longitude"); // .find("td:nth-child(8)").text();
                                    var latitude = $(row).attr("latitude"); // .find("td:nth-child(9)").text();
                                    stationarray.push({
                                        source: $(row).attr("source"),
                                        variable: $(row).attr("variable"),
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
                                    var idc20 = window.parent.sysbase.tabcreateiframe("Station-Pins", "", "re-klima", "kla1632pins", "klaleafletpins.html");
                                    window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                                }


                                /*
                                var gurl = "klaleafpins.html";
                                gurl += "?";
                                gurl += "latitude=" + encodeURIComponent(latitude);
                                gurl += "&";
                                gurl += "longitude=" + encodeURIComponent(longitude);
                                var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                                window.open(gurl, wname, 'height=' + screen.height + ', width=' + screen.width);
                                */
                            }
                        }))

                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Pivot (Filter)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                $("#kla2000sel").find(".col2of2").empty();
                                starecord = {};
                                kla2000sel.getStations(false, false, true, function (ret) {
                                    if (ret.error === false) {
                                        var table = "KLISTATIONS";
                                        window.parent.sysbase.setCache("pivotstations", JSON.stringify({
                                            sqlStmt: ret.sqlStmt
                                        }));
                                        uientry.fromUI2Record("#kla2000selform", starecord, staschema);
                                        var tourl = "klapivot.html" + "?" + "source=" + starecord.source;
                                        tourl += "&variablename=" + starecord.variablename;
                                        tourl += "&fromyear=" + starecord.fromyear;
                                        tourl += "&toyear=" + starecord.toyear;
                                        var idc640 = window.parent.sysbase.tabcreateiframe("Pivot", "", "re-klima", "kla1670piv", tourl);
                                        window.parent.$(".tablinks[idhash='#" + idc640 + "']").click();
                                    } else {
                                        sysbase.putMessage(ret.message, 3);
                                        return;
                                    }
                                });
                            }
                        }))




                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Übernahme (Liste)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                var stationarray = [];
                                var stationids = [];
                                var test = $("#kla2000sel").find(".col2of2").find("tbody tr:visible");
                                $("#kla2000sel").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
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
                                    var source = $("#kla2000selsource").val(); //   $(this).closest("tr").find('td:first-child').text();
                                    var ghcnclock = kla2000sel.showclock("#kla2000sellock");
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
                                        $("#kla2000selliste").click();
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
                            html: "Übernahme (Filter)",
                            click: function (evt) {
                                evt.preventDefault();
                                var source = $("#kla2000selsource").val(); //   $(this).closest("tr").find('td:first-child').text();
                                var ghcnclock = kla2000sel.showclock("#kla2000sellock");
                                var that = this;
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
                                    $("#kla2000selliste").click();
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
                            html: "Regression (Filter)",
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
                                            title: "Batch-Regressionsanalyse",
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
                                var anchorHash = "#kla2000sel";
                                var title = "Batch Regressionsanalyse";
                                /* top: Math.ceil($(this).offset().top + $(this).height() + 20) */
                                var pos = {
                                    left: $("#kla2000selt1").offset().left,
                                    top: screen.height / 2
                                };

                                $(document).on('popupok', function (evt, extraParam) {
                                    evt.preventDefault();
                                    evt.stopPropagation();
                                    evt.stopImmediatePropagation();
                                    var ghcnclock = kla2000sel.showclock("#kla2000sellock");
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


                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Regression (Liste)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                var stationarray = [];
                                var stationids = [];
                                var test = $("#kla2000sel").find(".col2of2").find("tbody tr:visible");
                                $("#kla2000sel").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
                                    var stationid = $(row).attr("rowid");
                                    var source = $(row).find("td:nth-child(1)").html(); //
                                    var sitename = $(row).find("td:nth-child(2)").html(); //
                                    var longitude = $(row).find("td:nth-child(8)").text();
                                    var latitude = $(row).find("td:nth-child(9)").text();
                                    stationids.push(stationid);
                                    stationarray.push({
                                        source: source,
                                        stationid: stationid,
                                        sitename: sitename
                                    });
                                });
                                if (stationarray.length === 0) {
                                    // nur stationid, wenn vorgegeben
                                    var stationid = $("#kla2000selstationid").val();
                                    var source = $("#kla2000selsource").val();
                                    stationids.push(stationid);
                                    stationarray.push({
                                        source: source,
                                        stationid: stationid
                                    });

                                }
                                if (stationarray.length === 0) {
                                    sysbase.putMessage("Bitte erst die Liste aufrufen", 3);
                                    return;
                                } else {
                                    var source = $("#kla2000selsource").val(); //   $(this).closest("tr").find('td:first-child').text();
                                    var ghcnclock = kla2000sel.showclock("#kla2000sellock");
                                    var that = this;
                                    $(that).attr("disabled", true);
                                    var jqxhr = $.ajax({
                                        method: "GET",
                                        crossDomain: false,
                                        url: sysbase.getServer("batchreg"),
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
                                        $("#kla2000selliste").click();
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
                    );
            }
        });

        $(document).keydown(function (event) {
            if (event.which === 13) {
                // login code here
                $("#kla2000selliste").click();
            }
        });


        $("#kla2000selbuttons").hide();
        kla2000sel.getStations(true, false, false, function (ret) {
            $("#kla2000selbuttons").show();
        });

    }; // Ende show


    /**
     * Aufbau Filter und Listenausgaben zunächst einmal
     * CAST(Width AS DECIMAL(10,2))
     * @param {*} isfirst - wichtig für die more-Funktion
     * @param {*} allsources - setzt den Filter aus sources aus
     * @param {*} returnSqlStmt - generiert SQL, führt es nicht aus
     * @param {*} cb20000 - Callback, return ret mit error, message
     * wenn returnSqlStmt = true, dann wird sqlStmt in ret zurückgegeben
     */
    kla2000sel.getStations = function (isfirst, allsources, returnSqlStmt, cb20000) {
        $("#kla2000sellist").empty();
        var table = "KLISTATIONS";
        if (origin === "kla1650ani") {
            // starecord und sqlStmt sind schon bekannt
        } else {
            starecord = {};
            uientry.fromUI2Record("#kla2000selform", starecord, staschema);
            var sel = {};
            sqlStmt = "";
            var where = "";
            // löschen nicht signifikante Feldnamen
            var selfieldnames = Object.keys(starecord);
            for (var ifield = 0; ifield < selfieldnames.length; ifield++) {
                var fieldname = selfieldnames[ifield];
                var fieldvalue = starecord[fieldname];
                if (typeof fieldvalue === "undefined" && fieldvalue !== null || typeof fieldvalue === "string" && fieldvalue.trim().length === 0) {
                    delete starecord[fieldname];
                }
            }
            selfieldnames = Object.keys(starecord);
            // erste if-Bedingung tot gelegt
            if (selfieldnames.length === 300 &&
                typeof starecord.source === "string" && starecord.source.length > 0 &&
                typeof starecord.variablename === "string" && starecord.variablename.length > 0 &&
                typeof starecord.fromyear === "string" && starecord.fromyear.length > 0) {
                sqlStmt += "SELECT ";
                sqlStmt += " DISTINCT";
                sqlStmt += " KLISTATIONS.source, KLISTATIONS.stationid, KLISTATIONS.stationname, ";
                sqlStmt += " KLISTATIONS.alpha2, KLISTATIONS.alpha3, ";
                sqlStmt += " KLISTATIONS.region, KLISTATIONS.subregion, KLISTATIONS.countryname, ";
                sqlStmt += " KLISTATIONS.continentname,";
                sqlStmt += " KLISTATIONS.temperature,";
                sqlStmt += " KLISTATIONS.lats, KLISTATIONS.longitude, KLISTATIONS.latitude, KLISTATIONS.height, ";
                sqlStmt += " KLIDATA.variable, ";
                sqlStmt += " KLIDATA.anzyears, KLIDATA.realyears, KLIDATA.fromyear, KLIDATA.toyear,";
                sqlStmt += " KLIDATA.regtotm,KLIDATA.regtottmin, KLIDATA.regtottmax, KLIDATA.regtottavg";
                sqlStmt += " FROM KLISTATIONS";

                sqlStmt += " INNER JOIN KLIDATA";
                sqlStmt += " ON KLISTATIONS.source = KLIDATA.source";
                sqlStmt += " AND KLISTATIONS.stationid = KLIDATA.stationid";
                where += " KLISTATIONS.source = '" + starecord.source + "'";
                where += " AND ";
                where += " KLISTATIONS.stationid IN (";
                where += " SELECT stationid FROM KLIINVENTORY";
                if (allsources === false) {
                    where += " WHERE KLIINVENTORY.source = '" + starecord.source + "'";
                    where += " AND KLIINVENTORY.variable = '" + starecord.variablename + "'";
                }
                where += " AND KLIINVENTORY.fromyear <= '" + starecord.fromyear + "'";
                where += ")";
                sqlStmt += " WHERE " + where;
                sqlStmt += " ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";


            } else if (selfieldnames.length >= 3) {
                var where1 = "";
                var where2 = "";
                var where3 = "";
                var selvariablename = starecord.variablename; // wird erst später gebraucht
                if (allsources === false) {
                    if (typeof starecord.source !== "undefined" && starecord.source.trim().length > 0) {
                        if (where1.length > 0) where1 += " AND ";
                        where1 += " KLISTATIONS.source ='" + starecord.source + "'";
                        if (where2.length > 0) where2 += " AND ";
                        where2 += " KLIINVENTORY.source ='" + starecord.source + "'";
                    }

                    if (typeof starecord.variablename !== "undefined" && starecord.variablename.trim().length > 0) {
                        selvariablename = starecord.variablename;
                        if (selvariablename.indexOf(",") < 0) {
                            if (where1.length > 0) where1 += " AND ";
                            // where += " KLIDATA.variable = '" + selvariablename + "'";
                            where1 += " KLIINVENTORY.variable = '" + selvariablename + "'";
                            if (where2.length > 0) where2 += " AND ";
                            // where += " KLIDATA.variable = '" + selvariablename + "'";
                            where2 += " KLIINVENTORY.variable = '" + selvariablename + "'";
                            where3 += " KLIDATA.variable = '" + selvariablename + "'";
                        } else {
                            var keys = selvariablename.split(",");
                            var liste = keys.length ? "'" + keys.join("','") + "'" : "";
                            if (where1.length > 0) where2 += " AND ";
                            // where += " KLIDATA.variable IN (" + liste + ")";
                            where1 += " KLIINVENTORY.variable IN (" + liste + ")";
                            if (where2.length > 0) where2 += " AND ";
                            // where += " KLIDATA.variable IN (" + liste + ")";
                            where2 += " KLIINVENTORY.variable IN (" + liste + ")";
                            where3 += " KLIDATA.variable IN (" + liste + ")";
                        }
                    }
                }
                /**
                 * hier die Geo-Selektion - alternativ zur "normalen" Selektion
                 */
                if (typeof starecord.latN !== "undefined" && starecord.latN.trim().length > 0) {
                    var latN = parseFloat(starecord.latN);
                    var latS = parseFloat(starecord.latS);
                    var lonW = parseFloat(starecord.lonW);
                    var lonE = parseFloat(starecord.lonE);
                    if (latN > latS) {
                        if (where1.length > 0) where1 += " AND ";
                        // CAST(Width AS DECIMAL(10,2))
                        where1 += " CAST(KLISTATIONS.latitude as DECIMAL(4,5)) <= " + latN;
                        where1 += " AND CAST(KLISTATIONS.latitude as DECIMAL(4,5)) >= " + latS;
                    } else {
                        if (where1.length > 0) where1 += " AND ";
                        where1 += " CAST(KLISTATIONS.latitude as DECIMAL(4,5)) >= " + latN;
                        where1 += " AND CAST(KLISTATIONS.latitude as DECIMAL(4,5)) <= " + latS;
                    }
                    if (lonW > lonE) {
                        if (where1.length > 0) where1 += " AND ";
                        where1 += " CAST(KLISTATIONS.longitude as DECIMAL(4,5)) <= " + lonW;
                        where1 += " AND CAST(KLISTATIONS.longitude as DECIMAL(4,5)) >= " + lonE;
                    } else {
                        if (where1.length > 0) where1 += " AND ";
                        where1 += " CAST(KLISTATIONS.longitude as DECIMAL(4,5)) >= " + lonW;
                        where1 += " AND CAST(KLISTATIONS.longitude as DECIMAL(4,5)) <= " + lonE;
                    }
                } else {
                    if (typeof starecord.stationid !== "undefined" && starecord.stationid.trim().length > 0) {
                        if (where1.length > 0) where1 += " AND ";
                        if (where2.length > 0) where2 += " AND ";
                        if (starecord.stationid.indexOf("*") >= 0) {
                            var stationid = starecord.stationid.replace(/\*/g, "%");
                            where1 += " KLISTATIONS.stationid LIKE '" + stationid + "'";
                            where2 += " KLIINVENTORY.stationid LIKE '" + stationid + "'";
                        } else {
                            where1 += " KLISTATIONS.stationid ='" + starecord.stationid + "'";
                            where2 += " KLIINVENTORY.stationid ='" + starecord.stationid + "'";
                        }
                    }
                    if (typeof starecord.name !== "undefined" && starecord.name.trim().length > 0) {
                        if (where1.length > 0) where1 += " AND ";
                        where1 += " lower(KLISTATIONS.stationname) LIKE '%" + starecord.name.toLowerCase() + "%'";
                    }
                    if (typeof starecord.region !== "undefined" && starecord.region.trim().length > 0) {
                        if (where1.length > 0) where1 += " AND ";
                        if (starecord.region.toLowerCase().indexOf("is null") >= 0) {
                            where1 += "(";
                            where1 += "KLISTATIONS.region is null";
                            where1 += " OR KLISTATIONS.countryname is null";
                            where1 += " OR KLISTATIONS.alpha2 is null";
                            where1 += ")";
                        } else {
                            where1 += "(";
                            where1 += " lower(KLISTATIONS.region) LIKE '%" + starecord.region.toLowerCase() + "%'";
                            where1 += " OR lower(KLISTATIONS.subregion) LIKE '%" + starecord.region.toLowerCase() + "%'";
                            where1 += " OR lower(KLISTATIONS.countryname) LIKE '%" + starecord.region.toLowerCase() + "%'";
                            where1 += " OR lower(KLISTATIONS.continentname) LIKE '%" + starecord.region.toLowerCase() + "%'";
                            where1 += ")";
                        }
                    }
                }
                // geht nur für numerische Vorgaben
                //where = uihelper.getSqlCompareString ("KLIDATA.anzyears", starecord.anzyears, where);
                if (typeof starecord.anzyears !== "undefined" && starecord.anzyears.trim().length > 0) {
                    if (where2.length > 0) where2 += " AND ";
                    where2 += uihelper.getSqlCompareString("(KLIINVENTORY.toyear - KLIINVENTORY.fromyear + 1)", starecord.anzyears, where);
                }
                if (typeof starecord.fromyear !== "undefined" && starecord.fromyear.trim().length > 0) {
                    if (where2.length > 0) where2 += " AND ";
                    var fromyear = starecord.fromyear.match(/(<=|>=|<|>|=)(\d*)/);
                    if (fromyear !== null && fromyear.length > 2) {
                        // where += " KLIDATA.fromyear " + fromyear[1] + parseInt(fromyear[2]);
                        where2 += " KLIINVENTORY.fromyear " + fromyear[1] + parseInt(fromyear[2]);
                    } else {
                        //where += " KLIDATA.fromyear >= " + starecord.fromyear.trim();
                        where2 += " KLIINVENTORY.fromyear >= " + starecord.fromyear.trim();
                    }
                }
                if (typeof starecord.toyear !== "undefined" && starecord.toyear.trim().length > 0) {
                    if (where2.length > 0) where2 += " AND ";
                    var toyear = starecord.toyear.match(/(<=|>=|<|>|=)(\d*)/);
                    if (toyear !== null && toyear.length > 2) {
                        //where += " KLIDATA.toyear " + toyear[1] + parseInt(toyear[2]);
                        where2 += " KLIINVENTORY.toyear " + toyear[1] + parseInt(toyear[2]);
                    } else {
                        //where += " KLIDATA.toyear <= " + starecord.toyear.trim();
                        where2 += " KLIINVENTORY.toyear <= " + starecord.toyear.trim();
                    }
                }
                if (typeof starecord.climatezone !== "undefined" && starecord.climatezone.trim().length > 0) {
                    var selclimatezone = starecord.climatezone.substr(0, 2);
                    if (where1.length > 0) where1 += " AND ";
                    if (selclimatezone.startsWith("G")) {
                        var cz1 = "N" + starecord.climatezone.substr(1, 1);
                        var cz2 = "S" + starecord.climatezone.substr(1, 1);
                        where1 += " (substr(KLISTATIONS.climatezone, 1, 2) = '" + cz1 + "'";
                        where1 += " OR substr(KLISTATIONS.climatezone, 1, 2) = '" + cz2 + "')";
                    } else {
                        where1 += " substr(KLISTATIONS.climatezone, 1, 2) = '" + selclimatezone + "'";
                    }

                    if (typeof starecord.height !== "undefined" && starecord.height.trim().length > 0) {
                        var height = starecord.height.match(/(<=|>=|<|>|=)(\d*)/);
                        if (height !== null && height.length > 2) {
                            if (where1.length > 0) where1 += " AND ";
                            where1 += " KLISTATIONS.height " + height[1] + parseInt(height[2]);
                        } else {
                            sysbase.putMessage("bitte Vergleichsoperator vor die Höhe setzen", 3);
                        }
                    }
                }

                sqlStmt += "SELECT ";
                sqlStmt += " DISTINCT";
                sqlStmt += " KLISTATIONS.source, KLISTATIONS.stationid, KLISTATIONS.stationname, ";
                sqlStmt += " KLISTATIONS.alpha2, KLISTATIONS.alpha3, ";
                sqlStmt += " KLISTATIONS.region, KLISTATIONS.subregion, KLISTATIONS.countryname, ";
                sqlStmt += " KLISTATIONS.continent, KLISTATIONS.continentname,";
                sqlStmt += " KLISTATIONS.temperature,";
                sqlStmt += " KLISTATIONS.climatezone,";
                sqlStmt += " KLISTATIONS.lats, KLISTATIONS.longitude, KLISTATIONS.latitude, KLISTATIONS.height, ";
                /*
                sqlStmt += "KLIDATA.variable, ";
                sqlStmt += "KLIDATA.anzyears, KLIDATA.realyears, KLIDATA.fromyear, KLIDATA.toyear,";
                sqlStmt += "KLIDATA.regtotm,KLIDATA.regtottmin, KLIDATA.regtottmax, KLIDATA.regtottavg";
                */
                sqlStmt += " KLIINVENTORY.variable, ";
                sqlStmt += " (KLIINVENTORY.toyear - KLIINVENTORY.fromyear + 1)  'anzyears', ";
                sqlStmt += " KLIINVENTORY.fromyear, KLIINVENTORY.toyear, ";
                sqlStmt += " KLIINVENTORY.lastUpdated, ";

                sqlStmt += " KLIDATA.realyears,";
                sqlStmt += " KLIDATA.regtotm,KLIDATA.regtottmin, KLIDATA.regtottmax, KLIDATA.regtottavg";

                // sqlStmt += "KLIDATA.regtotm,KLIDATA.regtottmin, KLIDATA.regtottmax, KLIDATA.regtottavg";
                // sqlStmt += "anzyears, realyears, fromyear, toyear";

                /**
                 * Optimierung des SQL-Statements - denn SQLite3 kann dies nicht ausreichend
                 */
                sqlStmt += " FROM KLISTATIONS";
                sqlStmt += " INNER JOIN KLIINVENTORY";
                sqlStmt += " ON KLISTATIONS.source = KLIINVENTORY.source";
                sqlStmt += " AND KLISTATIONS.stationid = KLIINVENTORY.stationid";
                sqlStmt += " LEFT JOIN KLIDATA";
                sqlStmt += " ON KLIINVENTORY.source = KLIDATA.source";
                sqlStmt += " AND KLIINVENTORY.stationid = KLIDATA.stationid";
                sqlStmt += " AND KLIINVENTORY.variable = KLIDATA.variable";
                if (where3.length > 0) {
                    sqlStmt += " AND " + where3;
                }
                if (where1.length > 0) {
                    sqlStmt += " WHERE " + where1;
                }
                if (where2.length > 0) {
                    sqlStmt += " AND KLISTATIONS.stationid IN(SELECT stationid FROM KLIINVENTORY WHERE " + where2 + ")";
                }
                sqlStmt += " ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";

                /*
                var checkwhere = where;
                checkwhere = checkwhere.replace(/KLISTATIONS.source/g, " ");
                if (checkwhere.indexOf("KLISTATIONS") >= 0) {
                    sqlStmt += " FROM KLISTATIONS";
                    sqlStmt += " INNER JOIN KLIDATA";
                    sqlStmt += " ON KLIDATA.source = KLISTATIONS.source";
                    sqlStmt += " AND KLIDATA.stationid = KLISTATIONS.stationid";
                    if (where.length > 0) {
                        sqlStmt += " WHERE " + where;
                    }
                    sqlStmt += " ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";
                } else {
                    where = where.replace(/KLISTATIONS.source/g, "KLIDATA.source");
                    sqlStmt += " FROM KLIDATA";
                    sqlStmt += " INNER JOIN KLISTATIONS";
                    sqlStmt += " ON KLIDATA.source = KLISTATIONS.source";
                    sqlStmt += " AND KLIDATA.stationid = KLISTATIONS.stationid";
                    if (where.length > 0) {
                        sqlStmt += " WHERE " + where;
                    }
                    sqlStmt += " ORDER BY KLIDATA.source, KLIDATA.stationid";
                }
                */


            } else {
                if (isfirst === false) {
                    sysbase.putMessage("Bitte Selektionsvorgabe verfeinern", 3);
                    cb20000({
                        error: true,
                        message: "Bitte Selektionsvorgabe verfeinern"
                    });
                    return;
                } else {
                    cb20000({
                        error: false,
                        message: ""
                    });
                    return;
                }
            }
        }

        /**
         * Aussprung mit den sqlStmt für Pivot und andere Folgefunktionen
         * damit sqlStmt nur hier aufgebaut werden muss.
         */
        if (returnSqlStmt === true) {
            cb20000({
                error: false,
                message: "sqlStmt returned",
                sqlStmt: sqlStmt
            });
            return;
        }
        var skip = 0;
        var limit = 0;
        var api = "getallrecords";
        uihelper.getAllRecords(sqlStmt, null, null, skip, limit, api, table, function (ret) {
            if (ret.error === true) {
                // sollte nicht passieren??? oder auch hier anlegen
                sysbase.putMessage("Error:" + ret.message, 3);
                cb20000({
                    error: true,
                    message: ret.message
                });
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
                            $("#kla2000sellist")
                                .append($("<li/>", {
                                    html: JSON.stringify(record)
                                }));
                        }
                    }
                    */
                    var stationformat = {
                        nr: {
                            title: "Nr",
                            width: "8%",
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
                        fromyear: {
                            title: "von/bis",
                            width: "8%",
                            align: "center"
                        },
                        longitude: {
                            title: "lon/lat/h",
                            width: "8%",
                            align: "center"
                        },
                        regression: {
                            title: "reg(m)",
                            width: "8%",
                            align: "center"
                        }

                    };
                    stationrecords = ret.records;
                    var vglsource = "";
                    var vglstationid = "";
                    var vglvariable = "";
                    //stationrecords.source = ret.rsource;
                    var htmltable = "<table class='tablesorter'>";
                    var irow = 0;
                    for (var property in ret.records) {
                        if (ret.records.hasOwnProperty(property)) {
                            var record = ret.records[property];
                            if (record.source === vglsource && record.stationid === vglstationid) {
                                // gleiche Gruppe - später Post-Processing für die letzte Zeile!!!
                                continue;
                            }
                            delete record._id;
                            var rowid = record.stationid; // "key" + irow;
                            var reprecord = {};
                            // reprecord.source = record.source;
                            reprecord.nr = irow + 1;
                            reprecord.station = record.stationid;
                            reprecord.station += " (" + (record.variable || "") + ") ";
                            reprecord.station += "<br><b>" + record.stationname + "</b>";
                            /*
                            if (typeof record.temperature === "undefined" || record.temperature === null) {
                                reprecord.station += "*unknown";
                            } else {
                                reprecord.station += " " + record.temperature;
                            }
                            */
                            reprecord.station += "<br>";
                            reprecord.station += "<img src='/images/icons-png/arrow-u-black.png'";
                            reprecord.station += " title='Upload *.dly'";
                            reprecord.station += " class='kla2000selupl'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/gear-black.png'";
                            reprecord.station += " title='Alte Auswertung'";
                            reprecord.station += " class='kla2000selold'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/star-black.png'";
                            reprecord.station += " title='New Config-Auswertung'";
                            reprecord.station += " style='background-color:red;'";
                            reprecord.station += " class='kla2000newconf'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/star-black.png'";
                            reprecord.station += " title='Config-Auswertung'";
                            reprecord.station += " class='kla2000selconf'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/eye-black.png'";
                            reprecord.station += " title='Distanz-30 km'";
                            reprecord.station += " class='kla2000seld30'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/eye-black.png'";
                            reprecord.station += " title='Distanz-60 km'";
                            reprecord.station += " class='kla2000seld60'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/eye-white.png'";
                            reprecord.station += " title='Distanz-30 km'";
                            reprecord.station += " class='kla2000seld30a'>";


                            stationarray[record.stationid] = record.stationname;
                            //delete record.stationid;
                            //delete record.name;
                            reprecord.region = record.continent;
                            reprecord.region += "-" + record.continentname;
                            reprecord.region += "<br>";
                            /*
                            reprecord.region += record.alpha2 + "-";
                            reprecord.region += record.region;
                            */
                            reprecord.region += record.countryname;

                            if (typeof record.lastUpdated !== "undefined" && record.lastUpdated !== null) {
                                reprecord.region += "<br>";
                                reprecord.region += record.lastUpdated;
                            } else {
                                reprecord.region += "<br>";
                                reprecord.region += record.toyear;
                                record.lastUpdated = record.toyear + "-01-01";
                            }
                            if (record.source === "GHCND") {

                                reprecord.region += " ";
                                reprecord.region += "<img src='/images/icons-png/arrow-d-black.png'";
                                reprecord.region += " title='Online-Aktualisierung'";
                                reprecord.region += " class='kla2000seluplonline'>";

                            }

                            reprecord.anzyears = record.anzyears;
                            reprecord.anzyears += "<br>";
                            reprecord.anzyears += record.realyears;

                            reprecord.fromyear = record.fromyear;
                            reprecord.fromyear += "<br>";
                            reprecord.fromyear += record.toyear;

                            reprecord.longitude = record.longitude;
                            reprecord.longitude += "<br>";
                            reprecord.longitude += record.latitude;
                            reprecord.longitude += "<br>";
                            reprecord.longitude += record.height;
                            reprecord.regression = "";
                            // reprecord.regtottmin = "";
                            // reprecord.regtottmax = "";
                            // reprecord.regtottavg = "";
                            try {
                                reprecord.regression = record.regtotm || "";
                                reprecord.regression += "<br>";
                                reprecord.regression += record.regtottmin || "";
                                reprecord.regression += " " + record.regtottmax || "";
                                reprecord.regression += "<br>";
                                reprecord.regression += record.regtottavg.toFixed(2) || "";
                            } catch (err) {}
                            var rowprop = {
                                rowid: rowid,
                                source: record.source,
                                variable: record.variable,
                                longitude: record.longitude,
                                latitude: record.latitude,
                                fromyear: record.fromyear,
                                toyear: record.toyear,
                                lastUpdated: record.lastUpdated
                            };
                            var line = uihelper.transformJSON2TableTR(reprecord, irow, stationformat, rowprop, "kla2000selid tablesorter-ignoreRow");
                            htmltable += line;
                            irow++;
                        }
                    }
                    htmltable += "</body>";
                    htmltable += "</table>";

                    $("#kla2000sel").find(".col2of2").empty();
                    $("#kla2000sel").find(".col2of2")
                        .append($("<span/>", {
                            html: htmltable
                        }));
                    /**
                     * hier kann die Färbung des Eye erfolgen für total search
                     * kla2000seld30a ist die class des img des Icons
                     * marker2.valueOf()._icon.style.filter = 'hue-rotate(60deg)';  bisher
                     */
                    $("img.kla2000seld30a").each(function (index, item) {
                        //item.style.filter = 'hue-rotate(60deg)';
                        item.style["background-color"] = "red";
                    });

                    $(".tablesorter").tablesorter({
                        theme: "blue",
                        widgets: ['filter'],
                        widthFixed: true,
                        widgetOptions: {
                            filter_hideFilters: false,
                            filter_ignoreCase: true
                        }
                    }); // so funktioniert es

                    kla2000sel.genevents(); // Aktiviert die events der Zeilen

                    sysbase.putMessage("Stations ausgegeben", 1);
                    cb20000({
                        error: false,
                        message: "Stations ausgegeben"
                    });
                    return;
                } else {
                    sysbase.putMessage("Keine Stations gefunden", 3);
                    cb20000({
                        error: true,
                        message: "Keine Stations gefunden"
                    });
                    return;
                }
            }
        });
    };


    /**
     * kla2000sel.genevents Aktivierung aller icons-class-events in li-Zeilen
     */
    kla2000sel.genevents = function () {
        $(document).on("click", ".kla2000selold", function (evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            evt.stopPropagation();
            var stationid = $(this).closest("tr").attr("rowid");
            var source = starecord.source;
            var variablename = starecord.variablename;
            selvariablename = variablename;
            console.log("Station:" + stationid + " from:" + source);
            if (source !== "ECAD") {
                window.parent.sysbase.setCache("onestation", JSON.stringify({
                    stationid: stationid,
                    source: source,
                    variablename: selvariablename,
                    starecord: starecord,
                    latitude: $(this).closest("tr").attr("latitude"),
                    longitude: $(this).closest("tr").attr("longitude")
                }));
                var tourl = "klaheatmap.html" + "?" + "stationid=" + stationid + "&source=" + source + "&variablename=" + variablename;
                var stationname = stationarray[stationid];
                var tabname = variablename + " " + stationname;
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
         * kla2000newconf - ganz neue Analyse
         */
        $(document).on("click", ".kla2000newconf", function (evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            evt.stopPropagation();
            var source = $(this).closest("tr").attr("source");
            var stationid = $(this).closest("tr").attr("rowid");
            var variablename = $(this).closest("tr").attr("variable");

            var longitude = $(this).closest("tr").attr("longitude");
            var latitude = $(this).closest("tr").attr("latitude");
            var fromyear = $(this).closest("tr").attr("fromyear");
            var toyear = $(this).closest("tr").attr("toyear");

            window.parent.sysbase.setCache("onestation", JSON.stringify({
                selstations: [],
                stationid: stationid,
                source: source,
                variablename: variablename,
                longitude: longitude,
                latitude: latitude,
                fromyear: fromyear,
                toyear: toyear,
                starecord: starecord,
                stationsarray: stationarray
            }));

            var tourl = "klaheatmap.html";
            var stationname = stationarray[stationid];
            var tabname = stationname; // confrecord.stationid + " " + stationname;
            if (source === "GHCND") {
                var idc20 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla2150rep", tourl);
                window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
            } else if (source === "HYGRIS") {
                var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla2150rep", tourl);
                window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
            } else if (source === "PAGES2K") {
                var idc22 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla2150rep", tourl);
                window.parent.$(".tablinks[idhash='#" + idc22 + "']").click();
            } else {
                sysbase.putMessage("keine Einzelauswertung vorgesehen", 3);
            }
            if (1 === 1) {
                return;
            }
            selvariablename = variablename;
            console.log("Station:" + stationid + " from:" + source + " " + variablename);
            var username = uihelper.getUsername();
        });

        /**
         * kla2000selconf - neue Analyse
         */
        $(document).on("click", ".kla2000selconf", function (evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            evt.stopPropagation();
            var source = $(this).closest("tr").attr("source");
            var stationid = $(this).closest("tr").attr("rowid");
            var variablename = $(this).closest("tr").attr("variable");

            var longitude = $(this).closest("tr").attr("longitude");
            var latitude = $(this).closest("tr").attr("latitude");
            var fromyear = $(this).closest("tr").attr("fromyear");
            var toyear = $(this).closest("tr").attr("toyear");

            window.parent.sysbase.setCache("onestation", JSON.stringify({
                selstations: [],
                stationid: stationid,
                source: source,
                variablename: variablename,
                longitude: longitude,
                latitude: latitude,
                fromyear: fromyear,
                toyear: toyear,
                starecord: starecord,
                stationsarray: stationarray
            }));

            var tourl = "klaheatmap.html";
            var stationname = stationarray[stationid];
            var tabname = stationname; // confrecord.stationid + " " + stationname;
            if (source === "GHCND") {
                var idc20 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla2100rep", tourl);
                window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
            } else if (source === "HYGRIS") {
                var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla2100rep", tourl);
                window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
            } else if (source === "PAGES2K") {
                var idc22 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla2100rep", tourl);
                window.parent.$(".tablinks[idhash='#" + idc22 + "']").click();
            } else {
                sysbase.putMessage("keine Einzelauswertung vorgesehen", 3);
            }
            if (1 === 1) {
                return;
            }
            selvariablename = variablename;
            console.log("Station:" + stationid + " from:" + source + " " + variablename);
            var username = uihelper.getUsername();
        });




        /**
         * kla2000seld30 - Analyse Stationen im 30 km Umkreis
         * als Näherungslösung (eher Rechteck als Kreis)
         */
        $(document).on("click", ".kla2000seld30", function (evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            evt.stopPropagation();
            var stationid = $(this).closest("tr").attr("rowid");
            var longitude = $(this).closest("tr").attr("longitude");
            var latitude = $(this).closest("tr").attr("latitude");
            var fromyear = $(this).closest("tr").attr("fromyear");
            var toyear = $(this).closest("tr").attr("toyear");

            var source = starecord.source;
            var variablename = starecord.variablename;
            selvariablename = variablename;
            console.log("Station:" + stationid + " from:" + source);
            var selcoordinates = uihelper.lincoordinates(latitude, longitude, 30);
            // Übernahme in die Hidden-Fields

            if (selcoordinates.error === false) {
                sysbase.putMessage(" ", 1);
                // hier muss eine neue Selektion erfolgen - tricky mit hidden values
                // latN, latS, lonW, lonE
                $("#kla2000sellatN").val(selcoordinates.latN);
                $("#kla2000sellatS").val(selcoordinates.latS);
                $("#kla2000sellonW").val(selcoordinates.lonW);
                $("#kla2000sellonE").val(selcoordinates.lonE);
                kla2000sel.getStations(false, false, false, function (ret) {
                    sysbase.putMessage("Liste neu ausgegeben", 1);
                    $("#kla2000sellatN").val("");
                    $("#kla2000sellatS").val("");
                    $("#kla2000sellonW").val("");
                    $("#kla2000sellonE").val("");
                    return;
                });
            } else {
                sysbase.putMessage(selcoordinates.message, 3);
                return;
            }
        });


        /**
         * kla2000seld30a - Analyse Stationen im 30 km Umkreis
         * als Näherungslösung (eher Rechteck als Kreis)
         */
        $(document).on("click", ".kla2000seld30a", function (evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            evt.stopPropagation();
            var stationid = $(this).closest("tr").attr("rowid");
            var longitude = $(this).closest("tr").attr("longitude");
            var latitude = $(this).closest("tr").attr("latitude");
            var fromyear = $(this).closest("tr").attr("fromyear");
            var toyear = $(this).closest("tr").attr("toyear");
            var source = starecord.source;
            var variablename = starecord.variablename;
            selvariablename = variablename;
            console.log("Station:" + stationid + " from:" + source);
            var selcoordinates = uihelper.lincoordinates(latitude, longitude, 30);
            // Übernahme in die Hidden-Fields

            if (selcoordinates.error === false) {
                sysbase.putMessage(" ", 1);
                // hier muss eine neue Selektion erfolgen - tricky mit hidden values
                // latN, latS, lonW, lonE
                $("#kla2000sellatN").val(selcoordinates.latN);
                $("#kla2000sellatS").val(selcoordinates.latS);
                $("#kla2000sellonW").val(selcoordinates.lonW);
                $("#kla2000sellonE").val(selcoordinates.lonE);
                kla2000sel.getStations(false, true, false, function (ret) {
                    sysbase.putMessage("Liste neu ausgegeben", 1);
                    $("#kla2000sellatN").val("");
                    $("#kla2000sellatS").val("");
                    $("#kla2000sellonW").val("");
                    $("#kla2000sellonE").val("");
                    return;
                });
            } else {
                sysbase.putMessage(selcoordinates.message, 3);
                return;
            }
        });


        /**
         * kla2000seld60 - Analyse Stationen im 60 km Umkreis
         * als Näherungslösung (eher Rechteck als Kreis)
         */
        $(document).on("click", ".kla2000seld60", function (evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            evt.stopPropagation();
            var stationid = $(this).closest("tr").attr("rowid");
            var longitude = $(this).closest("tr").attr("longitude");
            var latitude = $(this).closest("tr").attr("latitude");
            var fromyear = $(this).closest("tr").attr("fromyear");
            var toyear = $(this).closest("tr").attr("toyear");

            var source = starecord.source;
            var variablename = starecord.variablename;
            selvariablename = variablename;
            console.log("Station:" + stationid + " from:" + source);
            var selcoordinates = uihelper.lincoordinates(latitude, longitude, 60);
            // Übernahme in die Hidden-Fields

            if (selcoordinates.error === false) {
                sysbase.putMessage(" ", 1);
                // hier muss eine neue Selektion erfolgen - tricky mit hidden values
                // latN, latS, lonW, lonE
                $("#kla2000sellatN").val(selcoordinates.latN);
                $("#kla2000sellatS").val(selcoordinates.latS);
                $("#kla2000sellonW").val(selcoordinates.lonW);
                $("#kla2000sellonE").val(selcoordinates.lonE);
                kla2000sel.getStations(false, false, false, function (ret) {
                    sysbase.putMessage("Liste neu ausgegeben", 1);
                    return;
                });
            } else {
                sysbase.putMessage(selcoordinates.message, 3);
                return;
            }
        });




        $(document).on("click", ".kla2000selupl", function (evt) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            evt.stopPropagation();
            var stationid = $(this).closest("tr").attr("rowid");
            var source = $(this).closest("tr").find('td:first-child').text();
            var ghcnclock = kla2000sel.showclock("#kla2000sellock");
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

                $("#kla2000selliste").click();

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


        $(document).on("click", ".kla2000seluplonline", function (evt) {
            /**
             * Online-Aktualisierung GHCND
             */
            evt.preventDefault();
            evt.stopImmediatePropagation();
            evt.stopPropagation();
            var source = $(this).closest("tr").attr("source");
            var stationid = $(this).closest("tr").attr("rowid");
            var variable = $(this).closest("tr").attr("variable");
            var lastUpdated = $(this).closest("tr").attr("lastUpdated");

            var longitude = $(this).closest("tr").attr("longitude");
            var latitude = $(this).closest("tr").attr("latitude");
            var fromyear = $(this).closest("tr").attr("fromyear");
            var toyear = $(this).closest("tr").attr("toyear");
            var ghcnclock = kla2000sel.showclock("#kla2000sellock");
            var that = this;
            $(that).attr("disabled", true);

            /*  sysbase.getServer("ghcndonline"), */

            var jqxhr = $.ajax({
                method: "GET",
                crossDomain: true,
                url: sysbase.getServer("ghcndonline"),
                data: {
                    timeout: 10 * 60 * 1000,
                    source: source,
                    stationid: stationid,
                    variable: variable,
                    lastUpdated: lastUpdated,
                    fullname: fullname
                }
            }).done(function (r1, textStatus, jqXHR) {
                clearInterval(ghcnclock);
                sysbase.checkSessionLogin(r1);
                var ret = JSON.parse(r1);
                sysbase.putMessage(ret.message, 1);
                $("#kla2000selliste").click();
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
    };


    kla2000sel.getBucketValue = function (bucket, value) {
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


    kla2000sel.showclock = function (clockcontainer) {
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
        module.exports = kla2000sel;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla2000sel;
        });
    } else {
        // included directly via <script> tag
        root.kla2000sel = kla2000sel;
    }
}());