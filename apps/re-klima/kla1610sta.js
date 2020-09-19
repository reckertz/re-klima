/*jshint laxbreak:true */
/*global $,window,module,document,define,root,global,self,var,this,sysbase,uihelper */
/*global uientry,planetaryjs, */
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
                    "HYGRIS",
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
                    "TMIN",
                    "TMAX",
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
                            html: "HTML-Tabelle download",
                            click: function (evt) {
                                evt.preventDefault();
                                uihelper.downloadHtmlTable($(".tablesorter"), "html-extrakt", true);
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
                    id: "kla1610stat1"
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
                    /* name: "berlin" */
                    anzyears: ">=150"
                    /* fromyear: "<=1850", */
                    /* toyear: ">=1850", */
                };
                uientry.fromRecord2UI($("#kla1610staform"), starecord, staschema);
                uientry.init();
                $("#kla1610staform")
                    .append($("<div/>", {
                            id: "kla1610stabuttons",
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
                                $("#kla1610stabuttons").hide();
                                kla1610sta.getStations(false, function (ret) {
                                    $("#kla1610stabuttons").show();
                                });
                            }
                        }))

                        .append($("<button/>", {
                            id: "kla1610stadwn",
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
                                var test = $("#kla1610sta").find(".col2of2").find("tbody tr:visible");
                                $("#kla1610sta").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
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
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Globus (Filter)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                var stationarray = [];
                                var test = $("#kla1610sta").find(".col2of2").find("tbody tr:visible");
                                $("#kla1610sta").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
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


                        .append($("<button/>", {
                            css: {
                                float: "left",
                                "margin": "10px"
                            },
                            html: "Pivot (Filter)",
                            click: function (evt) {
                                evt.preventDefault();
                                //window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                $("#kla1610sta").find(".col2of2").empty();
                                starecord = {};
                                uientry.fromUI2Record("#kla1610staform", starecord, staschema);
                                var sel = {};
                                var table = "KLISTATIONS";
                                var sqlStmt = "";
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
                                uihelper.markok("#kla1610stasource");
                                if (typeof starecord.source === "undefined" || starecord.source.length === 0) {
                                    uihelper.markerror("#kla1610stasource");
                                    return;
                                }
                                uihelper.markok("#kla1610stavariablename");
                                if (typeof starecord.variablename === "undefined" || starecord.variablename.length === 0) {
                                    uihelper.markerror("#kla1610stavariablename");
                                    return;
                                }
                                uihelper.markok("#kla1610stafromyear");
                                if (typeof starecord.fromyear === "undefined" || starecord.fromyear.length === 0) {
                                    uihelper.markerror("#kla1610stafromyear");
                                    return;
                                }
                                uihelper.markok("#kla1610statoyear");
                                if (typeof starecord.toyear === "undefined" || starecord.fromyear.length === 0) {
                                    uihelper.markerror("#kla1610statoyear");
                                    return;
                                }
                                if (typeof starecord.fromyear !== "undefined" && starecord.fromyear.trim().length > 0) {
                                    var fromyear = starecord.fromyear.match(/(<=|>=|<|>|=)?(\d*)(-)?(\d*)?/);
                                    if (fromyear !== null && fromyear.length >= 3) {
                                        if (where.length > 0) where += " AND ";
                                        where += " KLIINVENTORY.toyear " + ">=" + parseInt(fromyear[2]);
                                        starecord.fromyear = fromyear[2];
                                        $("#kla1610stafromyear").val(starecord.fromyear);
                                    } else {
                                        uihelper.markerror("#kla1610stafromyear");
                                        return;
                                    }
                                }
                                if (typeof starecord.toyear !== "undefined" && starecord.toyear.trim().length > 0) {
                                    var toyear = starecord.toyear.match(/(<=|>=|<|>|=)?(\d*)(-)?(\d*)?/);
                                    if (toyear !== null && toyear.length >= 3) {
                                        if (where.length > 0) where += " AND ";
                                        where += " KLIINVENTORY.toyearyear " + "<=" + parseInt(toyear[2]);
                                        starecord.toyear = toyear[2];
                                        $("#kla1610statoyear").val(starecord.toyear);
                                    } else {
                                        uihelper.markerror("#kla1610statoyear");
                                        return;
                                    }
                                }
                                var tourl = "klapivot.html" + "?" + "source=" + starecord.source;
                                tourl += "&variablename=" + starecord.variablename;
                                tourl += "&fromyear=" + starecord.fromyear;
                                tourl += "&toyear=" + starecord.toyear;
                                var idc640 = window.parent.sysbase.tabcreateiframe("Pivot", "", "re-klima", "kla1670piv", tourl);
                                window.parent.$(".tablinks[idhash='#" + idc640 + "']").click();
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
                                    var source = $("#kla1610stasource").val(); //   $(this).closest("tr").find('td:first-child').text();
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
                            html: "Übernahme (Filter)",
                            click: function (evt) {
                                evt.preventDefault();
                                var source = $("#kla1610stasource").val(); //   $(this).closest("tr").find('td:first-child').text();
                                var ghcnclock = kla1610sta.showclock("#kla1610stalock");
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
                                var anchorHash = "#kla1610sta";
                                var title = "Batch Regressionsanalyse";
                                /* top: Math.ceil($(this).offset().top + $(this).height() + 20) */
                                var pos = {
                                    left: $("#kla1610stat1").offset().left,
                                    top: screen.height / 2
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
                                var test = $("#kla1610sta").find(".col2of2").find("tbody tr:visible");
                                $("#kla1610sta").find(".col2of2").find("tbody tr:visible").each(function (index, row) {
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
                                    var stationid = $("#kla1610stastationid").val();
                                    var source = $("#kla1610stasource").val();
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
                                    var source = $("#kla1610stasource").val(); //   $(this).closest("tr").find('td:first-child').text();
                                    var ghcnclock = kla1610sta.showclock("#kla1610stalock");
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
                    );
            }
        });

        $("#kla1610stabuttons").hide();
        kla1610sta.getStations(true, function (ret) {
            $("#kla1610stabuttons").show();
        });

    }; // Ende show

    $(document).on("click", ".kla1610staid", function (evt) {
        evt.preventDefault();
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
                longitude: $(this).closest("tr").attr("longitude"),
                fromyear: $(this).closest("tr").attr("fromyear"),
                toyear: $(this).closest("tr").attr("toyear"),
            }));
            var tourl = "klaheatmap.html" + "?" + "stationid=" + stationid + "&source=" + source + "&variablename=" + variablename;
            var stationname = stationarray[stationid];
            var tabname = variablename + " " + stationname;
            var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1625shm", tourl);
            window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
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
     * CAST(Width AS DECIMAL(10,2))
     */
    kla1610sta.getStations = function (isfirst, cb16100) {
        $("#kla1610stalist").empty();
        var table = "KLISTATIONS";
        if (origin === "kla1650ani") {
            // starecord und sqlStmt sind schon bekannt
        } else {
            starecord = {};
            uientry.fromUI2Record("#kla1610staform", starecord, staschema);
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
                where += " WHERE KLIINVENTORY.source = '" + starecord.source + "'";
                where += " AND KLIINVENTORY.variable = '" + starecord.variablename + "'";
                where += " AND KLIINVENTORY.fromyear <= '" + starecord.fromyear + "'";
                where += ")";
                sqlStmt += " WHERE " + where;
                sqlStmt += " ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";
            } else if (selfieldnames.length >= 3) {
                var where1 = "";
                var where2 = "";
                var where3 = "";
                var selvariablename = starecord.variablename; // wird erst später gebraucht
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
                sqlStmt += " KLISTATIONS.lats, KLISTATIONS.longitude, KLISTATIONS.latitude, KLISTATIONS.height, ";
                /*
                sqlStmt += "KLIDATA.variable, ";
                sqlStmt += "KLIDATA.anzyears, KLIDATA.realyears, KLIDATA.fromyear, KLIDATA.toyear,";
                sqlStmt += "KLIDATA.regtotm,KLIDATA.regtottmin, KLIDATA.regtottmax, KLIDATA.regtottavg";
                */
                sqlStmt += " KLIINVENTORY.variable, ";
                sqlStmt += " (KLIINVENTORY.toyear - KLIINVENTORY.fromyear + 1)  'anzyears', ";
                sqlStmt += " KLIINVENTORY.fromyear, KLIINVENTORY.toyear, ";

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
                sqlStmt += " ON KLISTATIONS.source = KLIDATA.source";
                sqlStmt += " AND KLISTATIONS.stationid = KLIDATA.stationid";
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
                    cb16100({
                        error: true,
                        message: "Bitte Selektionsvorgabe verfeinern"
                    });
                    return;
                } else {
                    cb16100({
                        error: false,
                        message: ""
                    });
                    return;
                }
            }
        }

        var skip = 0;
        var limit = 0;
        var api = "getallrecords";

        uihelper.getAllRecords(sqlStmt, null, null, skip, limit, api, table, function (ret) {
            if (ret.error === true) {
                // sollte nicht passieren??? oder auch hier anlegen
                sysbase.putMessage("Error:" + ret.message, 3);
                cb16100({
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
                            $("#kla1610stalist")
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
                    //stationrecords.source = ret.rsource;
                    var htmltable = "<table class='tablesorter'>";
                    var irow = 0;
                    for (var property in ret.records) {
                        if (ret.records.hasOwnProperty(property)) {
                            var record = ret.records[property];
                            delete record._id;
                            var rowid = record.stationid; // "key" + irow;
                            var reprecord = {};
                            // reprecord.source = record.source;
                            reprecord.nr = irow + 1;
                            reprecord.station = record.stationid;
                            //reprecord.station += " " + record.variable || "" + " ";
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
                            reprecord.station += " class='kla1610staupl'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/gear-black.png'";
                            reprecord.station += " title='Alte Auswertung'";
                            reprecord.station += " class='kla1610staold'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/star-black.png'";
                            reprecord.station += " title='Config-Auswertung'";
                            reprecord.station += " class='kla1610staconf'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/eye-black.png'";
                            reprecord.station += " title='Distanz-30 km'";
                            reprecord.station += " class='kla1610stad30'>";

                            reprecord.station += " &nbsp;";
                            reprecord.station += "<img src='/images/icons-png/eye-black.png'";
                            reprecord.station += " title='Distanz-60 km'";
                            reprecord.station += " class='kla1610stad60'>";


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
                                longitude: record.longitude,
                                latitude: record.latitude,
                                fromyear: record.fromyear,
                                toyear: record.toyear
                            };
                            var line = uihelper.transformJSON2TableTR(reprecord, irow, stationformat, rowprop, "kla1610staid tablesorter-ignoreRow");
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
                    cb16100({
                        error: false,
                        message: "Stations ausgegeben"
                    });
                    return;
                } else {
                    sysbase.putMessage("Keine Stations gefunden", 3);
                    cb16100({
                        error: true,
                        message: "Keine Stations gefunden"
                    });
                    return;
                }
            }
        });
    };

    $(document).on("click", ".kla1610staold", function (evt) {
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
     * kla1610staconf - Konfigurierte Analyse
     */
    $(document).on("click", ".kla1610staconf", function (evt) {
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

        var username = uihelper.getUsername();
        var confschema = {
            entryschema: {
                props: {
                    title: "Abrufparameter " + stationid,
                    description: "",
                    type: "object", // currency, integer, datum, text, key, object
                    class: "uiefieldset",
                    properties: {
                        stationid: {
                            title: "Stations-ID",
                            type: "string", // currency, integer, datum, text, key
                            class: "uietext",
                            io: "h"
                        },
                        source: {
                            title: "Source",
                            type: "string", // currency, integer, datum, text, key
                            class: "uietext",
                            io: "h"
                        },
                        variable: {
                            title: "Variable",
                            type: "string", // currency, integer, datum, text, key
                            class: "uietext",
                            io: "h"
                        },
                        master: {
                            title: "Stammdaten",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            io: "i"
                        },
                        qonly: {
                            title: "gute Daten",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            io: "i"
                        },
                        heatmaps: {
                            title: "Heatmaps",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            io: "i"
                        },
                        heatmapsx: {
                            title: "Heatmaps+",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            io: "i"
                        },
                        fromyear: {
                            title: "Von Jahr",
                            type: "string", // currency, integer, datum, text, key
                            class: "uietext",
                            maxlength: 4,
                            size: 4,
                            width: "70px",
                            default: "",
                            io: "i"
                        },
                        toyear: {
                            title: "Bis Jahr",
                            type: "string", // currency, integer, datum, text, key
                            class: "uietext",
                            maxlength: 4,
                            size: 4,
                            width: "70px",
                            default: "",
                            io: "i"
                        },
                        step: {
                            title: "Bucket",
                            type: "string", // currency, integer, datum, text, key
                            class: "uietext",
                            maxlength: 4,
                            size: 4,
                            width: "70px",
                            default: "",
                            io: "i"
                        },
                        decimals: {
                            title: "Dezimalstelle",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            default: true,
                            io: "i"
                        },
                        tempchart: {
                            title: "Temperaturverlauf",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            io: "i"
                        },
                        temptable: {
                            title: "Temperaturtabelle",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            io: "i"
                        },
                        tempdistribution: {
                            title: "Distribution",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            default: true,
                            io: "i"
                        },
                        hyde: {
                            title: "HYDE-Daten",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            default: false,
                            io: "i"
                        },
                        allin: {
                            title: "Alle in der Liste",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            default: false,
                            io: "i"
                        },
                        autoload: {
                            title: "Automatisch Laden",
                            type: "string", // currency, integer, datum, text, key
                            class: "uiecheckbox",
                            default: false,
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
                }
            }
        };
        var anchorHash = "#kla1610sta .col2of2";
        var title = "GHCN-D Analyse-Konfiguration";
        var pos = {
            left: $(anchorHash).offset().left,
            top: window.screen.height * 0.1,
            width: $(anchorHash).width() * 0.60,
            height: $(anchorHash).height() * 0.90
        };
        $(document).on('popupok', function (evt, extraParam) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            console.log(extraParam);
            confrecord = JSON.parse(extraParam).props;
            if (confrecord.allin === false) {
                window.parent.sysbase.setCache("onestation", JSON.stringify({
                    stationid: confrecord.stationid,
                    source: confrecord.source,
                    variablename: confrecord.variable,
                    starecord: starecord,
                    latitude: $(this).closest("tr").attr("latitude"),
                    longitude: $(this).closest("tr").attr("longitude"),
                    config: confrecord
                }));
                var tourl = "klaheatmap.html" + "?" + "stationid=" + confrecord.stationid + "&source=" + confrecord.source + "&variablename=" + confrecord.variable;
                var stationname = stationarray[confrecord.stationid];
                var tabname = confrecord.stationid + " " + stationname;
                var idc20 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1625shm", tourl);
                window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
            } else {
                selstations = [];
                $(".kla1610staid").each(function (index, item) {
                    selstations.push({
                        stationid: $(this).attr("rowid"),
                        source: $(this).attr("source")
                    });
                });
                window.parent.sysbase.setCache("onestation", JSON.stringify({
                    selstations: selstations,
                    stationid: confrecord.stationid,
                    source: confrecord.source,
                    variablename: confrecord.variable,
                    starecord: starecord,
                    latitude: $(this).closest("tr").attr("latitude"),
                    longitude: $(this).closest("tr").attr("longitude"),
                    config: confrecord
                }));
                var tourl = "klaheatmap.html" + "?" + "stationid=" + confrecord.stationid + "&source=" + confrecord.source + "&variablename=" + confrecord.variable;
                var stationname = stationarray[confrecord.stationid];
                var tabname = "Sammelauswertung"; // confrecord.stationid + " " + stationname;
                if (selstations.length === 1) {
                    tabname = confrecord.stationid + " " + stationname;
                }
                var idc20 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1625shm", tourl);
                window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
            }
        });
        if (Object.keys(confrecord).length === 0) {
            // Default-Setzungen
            confrecord = {
                decimals: true,
                heatmaps: true,
                heatmapsx: true,
                hyde: true,
                master: true,
                qonly: true,
                tempdistribution: true,
                tempchart: true,
                temptable: true,
                allin: false,
                autoload: false,
                comment: "",
                fromyear: fromyear,
                toyear: toyear,
                step: 30
            };
        }
        // Hidden der aktuellen variablen Daten
        confrecord.stationid = stationid;
        confrecord.source = source;
        confrecord.variable = variablename;
        uientry.inputDialogX(anchorHash, pos, title, confschema, confrecord, function (ret) {
            if (ret.error === false) {} else {
                sysbase.putMessage("Kein Abruf Super-Sparklines", 1);
                return;
            }
        });

        /*
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
            var idc20 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1625shm", tourl);
            window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
            */
    });



    /**
     * kla1610stad30 - Analyse Stationen im 30 km Umkreis
     * als Näherungslösung (eher Rechteck als Kreis)
     */
    $(document).on("click", ".kla1610stad30", function (evt) {
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
            $("#kla1610stalatN").val(selcoordinates.latN);
            $("#kla1610stalatS").val(selcoordinates.latS);
            $("#kla1610stalonW").val(selcoordinates.lonW);
            $("#kla1610stalonE").val(selcoordinates.lonE);
            kla1610sta.getStations(false, function (ret) {
                sysbase.putMessage("Liste neu ausgegeben", 1);
                $("#kla1610stalatN").val("");
                $("#kla1610stalatS").val("");
                $("#kla1610stalonW").val("");
                $("#kla1610stalonE").val("");
                return;
            });
        } else {
            sysbase.putMessage(selcoordinates.message, 3);
            return;
        }
    });



    /**
     * kla1610stad60 - Analyse Stationen im 60 km Umkreis
     * als Näherungslösung (eher Rechteck als Kreis)
     */
    $(document).on("click", ".kla1610stad60", function (evt) {
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
            $("#kla1610stalatN").val(selcoordinates.latN);
            $("#kla1610stalatS").val(selcoordinates.latS);
            $("#kla1610stalonW").val(selcoordinates.lonW);
            $("#kla1610stalonE").val(selcoordinates.lonE);
            kla1610sta.getStations(false, function (ret) {
                sysbase.putMessage("Liste neu ausgegeben", 1);
                return;
            });
        } else {
            sysbase.putMessage(selcoordinates.message, 3);
            return;
        }
    });




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