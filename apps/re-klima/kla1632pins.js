/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global window,module,define,root,global,self,var,this,sysbase,uihelper,uientry,async */
(function () {
    var kla1632pins = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1632pins  bekommt über getCache
     * stationarray mit stationid, sitename, longitude, latitude
     * und starecord, hier für source und variablename
     */
    var actprjname;
    var fullname;
    var fulldatafilename;
    var datafilename;
    var selyears;
    var yearlats;
    var plots;
    var tarray;
    var cid;
    var cidw;
    var sgif;
    var aktyear;
    var aktvariablename;
    var starecord = {};
    var selrecord = {};
    var stations = {};
    var stationarray = [];
    var worldmap;

    kla1632pins.show = function (parameters, navigatebucket) {

        if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {

        }
        if (typeof parameters !== "undefined" && parameters.length > 0) {
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
        $(".headertitle").html("Leaflet-Pins für Stationen");
        $(".headertitle").attr("title", "kla1632pins");
        $(".content").attr("pageid", "kla1632pins");
        $(".content").attr("id", "kla1632pins");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1632pins")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1632pins_isdirty",
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

        $("#kla1632pins.content").css({
            width: "100%",
            "background-color": "lightsteelblue"
        });

        var ret = {};
        starecord = window.parent.sysbase.getCache("starecord");
        selrecord = starecord;
        if (typeof starecord !== "undefined" && starecord !== null && Object.keys(starecord).length > 0) {
            var wmtit = "Pins für Stationen aus der Liste";
            wmtit += " " + starecord.source;
            // isMember ? '$2.00' : '$10.00'
            if (typeof starecord.stasel !== "undefined") {
                wmtit += starecord.stasel.stationid.length > 0 ? " " + starecord.stasel.stationid : "";
                wmtit += starecord.stasel.stationname.length > 0 ? " " + starecord.stasel.stationname : "";
                wmtit += starecord.stasel.fromyear.length > 0 ? " von " + starecord.stasel.fromyear : "";
                wmtit += starecord.stasel.toyear.length > 0 ? " bis " + starecord.stasel.toyear : "";
                wmtit += starecord.stasel.anzyears.length > 0 ? " für " + starecord.stasel.anzyears + " Jahre" : "";
                wmtit += starecord.stasel.region.length > 0 ? " Region:" + starecord.stasel.region : "";
                wmtit += starecord.stasel.climatezone.length > 0 ? " Klimazone:" + starecord.stasel.climatezone : "";
                wmtit += starecord.stasel.height.length > 0 ? " Höhe:" + starecord.stasel.height : "";
            }
            $(".headertitle").html(wmtit);
        } else {
            starecord = null; // keine Verzweigung auf einzelne Stations möglich
        }
        stationarray = window.parent.sysbase.getCache("stationarray");
        if (typeof stationarray !== "undefined" && Array.isArray(stationarray) && stationarray.length > 0) {
            kla1632pins.showPins(stationarray);
        } else {
            stationarray = [];
            kla1632pins.prepeditor(function (ret) {
                sysbase.putMessage(ret.message);
                return;
            });
        }
        /*
        stationarray.push({
            stationid: stationid,
            sitename: sitename,
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude)
        });
        */

        /*
        if (typeof stations !== "undefined" && stations !== null && stations.length > 0) {
            stationarray = [];
            for (var station in stations) {
                if (stations.hasOwnProperty(station)) {
                    var sitename = stations[station].stationname;
                    var longitude = Number(stations[station].longitude);
                    var latitude = Number(stations[station].latitude);
                    stationarray.push({
                        sitename: sitename,
                        longitude: longitude,
                        latitude: latitude
                    });
                }
            }
            kla1632pins.showMap(stationarray);
        } else {
            stationarray = window.parent.sysbase.getCache("stationarray");
            if (typeof stationarray !== "undefined" && Array.isArray(stationarray) && stationarray.length > 0) {
                kla1632pins.showMap(stationarray);
            } else {
                stationarray = [];
                    kla1632pins.prepeditor(function (ret) {
                        sysbase.putMessage(ret.message);
                        return;
                    });

            }
        }
        */
        window.parent.sysbase.delCache("stationarray");
        window.parent.sysbase.delCache("stationrecords");
    }; // Ende show



    /**
     * Anzeige Pins der Stationen
     *
     * @param {*} stationarray
     */
    kla1632pins.showPins = function (stationarray) {


        var h = $("body").height();
        h = h - $(".header").outerHeight();
        h = h - $(".footer").outerHeight();

        $("#kla1632pins.content").css({
            height: h - 3,
            overflow: "hidden"
        });

        if ($(".col1of2").length === 0) {
            $("#kla1632pins.content")
                .append($("<div/>", {
                    class: "col1of2",
                    id: "mapid",
                    css: {
                        height: h - 3,
                        width: "75%",
                        overflow: "auto"
                    }
                }))
                .append($("<div/>", {
                    id: "protwrapper",
                    class: "col2of2",
                    css: {
                        height: h - 3,
                        width: "24%",
                        overflow: "auto"
                    }
                }));
        }

        var hh = $(".header").outerHeight();
        var fh = $(".footer").outerHeight();
        var wh = $(window).height();
        var h = wh - hh - fh - 1;
        $(".content").height(h);
        $("#mapid").css({
            height: h,
            overflow: "auto"
        });
        $("#protwrapper").css({
            height: h,
            overflow: "auto"
        });

        var mymap;

        // Köln, Nabel der Welt als Bezug (später die erste Station)
        var latitude = 50.941278;
        var longitude = 6.958281;
        mymap = L.map('mapid').setView([Number(stationarray[0].latitude), Number(stationarray[0].longitude)], 11);
        // Default public token
        // pk.eyJ1IjoiZWNraTIwMDAiLCJhIjoiY2s0d3pzZTh1MDNtMzNrbnJjaHN3amJ5YyJ9.P7wr6VrNtLPHMvW_O14d7Q
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/streets-v11',
            style: 'mapbox://styles/mapbox/satellite-v9'
        }).addTo(mymap);

        // Marker des Zielpunktes, Station, Kölner Dom
        // latitude = 50.941278;
        // longitude = 6.958281;
        // var marker = L.marker([latitude, longitude]).addTo(mymap);

        // Elbphilharmonie
        // latitude = 53.5582446;
        // longitude = 9.6476395
        // var marker1 = L.marker([latitude, longitude]).addTo(mymap);

        // München Marienplatz
        // latitude = 48.1373932;
        // longitude = 11.5732598;
        // var marker2 = L.marker([latitude, longitude]).addTo(mymap);

        for (var isa = 0; isa < stationarray.length; isa++) {
            var station = stationarray[isa];
            if (typeof station.stationid === "undefined" || station.stationid.length === 0) {
                station.stationid = 'plot-' + Math.round(Math.random() * 10000);
            }
            var sitename = station.sitename || "unknown";
            var longitude = Number(station.longitude);
            var latitude = Number(station.latitude);
            var marker2 = L.marker([latitude, longitude], station); // station ist das Objekt mit den Daten
            marker2.bindTooltip(sitename, {
                permanent: false,
                direction: 'right'
            });
            marker2.on('click', onMarkerClick);
            marker2.addTo(mymap);
            if (station.variable === "WLVL") {
                marker2.valueOf()._icon.style.filter = 'hue-rotate(240deg)';
            } else if (station.variable === "TMAX" || station.variable === "TMIN") {
                marker2.valueOf()._icon.style.filter = 'hue-rotate(60deg)';
            } else {
                marker2.valueOf()._icon.style.filter = 'hue-rotate(120deg)';
            }

        }
    };

    var onMarkerClick = function(e){
        alert("You clicked on marker with customId: " + this.options.stationid + ", variable:" + this.options.variables);
        var stationdata = this.options;
        window.parent.sysbase.setCache("onestation", JSON.stringify({
            stationid: stationdata.stationid,
            source: stationdata.source,
            variable: stationdata.variable,
            starecord: starecord,
            latitude: stationdata.latitude,
            longitude: stationdata.longitude,
            fromyear: starecord.fromyear,
            toyear: starecord.toyear,
            config: {
                hyde: false
            }
        }));

        // Aufruf der Auswertung in neuem Reiter für die stationid

        var tourl = "klaheatmap.html" + "?" + "stationid=" + stationdata.stationid + "&source=" + stationdata.source + "&variablename=" + stationdata.variable;
        var stationname = stationdata.sitename;
        var tabname = stationdata.variable + " " + stationname;
        if (stationdata.variable === "WLVL") {
            var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1626gwa", tourl);
            window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
        } else if (stationdata.variable === "TMAX" || stationdata.variable === "TMIN") {
            var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1625shm", tourl);
            window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
        } else {
            var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1629ghc", tourl);
            window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
        }


    };

    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1632pins;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1632pins;
        });
    } else {
        // included directly via <script> tag
        root.kla1632pins = kla1632pins;
    }
}());