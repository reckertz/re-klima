/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global window,module,define,root,global,self,var,this,sysbase,uihelper */
(function () {
    var kla1630map = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1630map  bekommt über getCache pivotdata oder yearlats(?)
     * und erzeugt animierte Gifs mit der Option weiterer Zuordnungen
     * nach latitude und
     * nach temperatur, grundet auf Ganzzahlen
     * mit Sekundärdaten aus HYDE
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
    var stations = {};
    var stationarray = [];

    kla1630map.show = function (parameters, navigatebucket) {
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
        $(".headertitle").html("Worldmap für Stations");
        $(".headertitle").attr("title", "kla1630map");
        $(".content").attr("pageid", "kla1630map");
        $(".content").attr("id", "kla1630map");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1630map")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1630map_isdirty",
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
                            html: "Justierte Karte",
                            click: function (evt) {
                                evt.preventDefault();
                                $(window).resize();
                                //kla1630map.fitMap(".content", "world", paper);

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
        $("#kla1630map.content")
            .append($("<div/>", {
                css: {
                    width: "100%",
                    "background-color": "lightsteelblue"
                }
            }));

        var ret = {};
        starecord = window.parent.sysbase.getCache("starecord");
        if (typeof starecord !== "undefined" && starecord !== null && Object.keys(starecord).length > 0) {
            var wmtit = "Worldmap für Stations";
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
        stations = window.parent.sysbase.getCache("stationrecords");
        if (typeof stations !== "undefined" && stations !== null && Object.keys(stations).length > 0) {
            stationarray = [];
            for (station in stations) {
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
            kla1630map.showMap(stationarray);
        } else {
            stationarray = window.parent.sysbase.getCache("stationarray");
            if (typeof stationarray !== "undefined" && stationarray.length > 0) {
                kla1630map.showMap(stationarray);
            }
        }
        window.parent.sysbase.delCache("stationarray");
        window.parent.sysbase.delCache("stationrecords");
    }; // Ende show

    /**
     * Anzeige Stationen
     */
    kla1630map.showMap = function (stations) {

        $("#kla1630map.content").empty();
        var h = $("body").height() - $("#kla1630map.header") - $("#kla1630map.footer");
        $("#kla1630map.content").css({
            height: h - 3,
            overflow: "auto"
        });

        $("#kla1630map.content")
            .append($("<div/>", {
                    class: "container",
                    css: {
                        height: "inherit",
                        width: "inherit"
                    }
                })
                .append($("<div/>", {
                        class: "mapcontainer"
                    })
                    .append($("<div/>", {
                            class: "map"
                        })
                        .append($("<span/>", {
                            id: "waiting"
                        }))
                    )
                    .append($("<div/>", {
                            class: "myText"
                        })
                        .append($("<span/>", {
                            html: "&nbsp;"
                        }))
                    )
                )
            );
        plots = [];
        /*
        "047_N043":
            {"stations":"40371624003;",
             "xstations":[
                 {"latn":"N43","lon":"-79.4000","lat":"43.6700","name":"TORONTO,ON"}
                ],
        */
        for (var isa = 0; isa < stationarray.length; isa++) {
            var station = stationarray[isa];
            var sitename = station.sitename;
            var longitude = Number(station.longitude);
            var latitude = Number(station.latitude);
            var contenthtml = ""; // "<span style=\"font-weight:bold;font-size:x-small;\">";
            contenthtml += sitename.replace("<br>", " ");
            //contenthtml += "</span>";
            var texthtml = sitename;
            /*
            tooltip: {content: "<span style=\"font-weight:bold;\">City :</span> Rennes"},
                    text: {content: "Rennes"},
            */
            plots.push({
                type: "square", // circle
                size: 5,
                latitude: latitude,
                longitude: longitude,
                tooltip: {
                    content: contenthtml
                },
                text: {
                    /*
                    attrs: {
                        "font-size": "10px"
                    },
                    content: texthtml
                    */
                },
                myText: sitename + " lon:" + longitude + " lat:" + latitude,
                selstationid: station.stationid
            });

        }
        var worldmaplinks = {
            'link1': {
                factor: 0.01,
                // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                between: [{
                    latitude: 23,
                    longitude: -179.0
                }, {
                    latitude: 24,
                    longitude: 179.0
                }],
                attrs: {
                    "stroke-width": 2
                },
                tooltip: {
                    content: "Link"
                }
            }
        };


        var worldmap =   {
            map: {
                // Set the name of the map to display
                name: "world",
                zoom: {
                    "enabled": true
                },
                defaultArea: {
                    eventHandlers: {
                        click: function (e, id, mapElem, textElem) {
                            var newData = {
                                'areas': {}
                            };
                            if (mapElem.originalAttrs.fill == "#5ba4ff") {
                                newData.areas[id] = {
                                    attrs: {
                                        fill: "#0088db"
                                    }
                                };
                            } else {
                                newData.areas[id] = {
                                    attrs: {
                                        fill: "#5ba4ff"
                                    }
                                };
                            }
                            $(".mapcontainer").trigger('update', [{
                                mapOptions: newData
                            }]);
                        }
                    }
                },
                defaultPlot: {
                    eventHandlers: {
                        click: function (e, id, mapElem, textElem, elemOptions) {
                            var msg = elemOptions.myText || "Kein Hinweis vorhanden";
                            var msg1 = msg.replace("<br>", " ");
                            var msgp = msg1.split(" ");
                            var stationname = msgp[1];
                            var stationid = msgp[0];
                            var selvariablename = starecord.variablename;
                            var source = starecord.source;
                            // alert(msg);

                            window.parent.sysbase.setCache("onestation", JSON.stringify({
                                stationid: stationid,
                                source: starecord.source,
                                variablename: starecord.variablename,
                                starecord: starecord
                            }));
                            var tourl = "klaheatmap.html" + "?" + "stationid=" + stationid + "&source=" +
                                source + "&variablename=" + selvariablename + "&starecord=" + JSON.stringify(starecord);
                            var idc20 = window.parent.sysbase.tabcreateiframe(stationname, "", "re-klima",
                                "kla1620shm", tourl);
                            window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                        },
                        /*
                        mouseover: function (e, id, mapElem, textElem, elemOptions) {
                            if (typeof elemOptions.myText !== 'undefined') {
                                $('.myText span').html(elemOptions.myText).css({
                                    display: 'none'
                                }).fadeIn('slow');
                            }
                        }
                        */
                    }

                },

                afterInit: function ($self, paper, areas, plots, options) {
                    $('.mapcontainer .map').unbind("resizeEnd");
                    kla1630map.fitMap(".content", "world", paper);
                    /*
                    $(window).on('resize', function () {
                        kla1630map.fitMap (".content", "world", paper);
                    }).trigger('resize');
                    */
                    $(window).on('resize', function () {
                        kla1630map.fitMap(".content", "world", paper);
                    });
                    /*
                    $('.mapcontainer .map').unbind("resizeEnd");
                    var viewportHeight = $("#kla1630map.content").height();
                    var viewportWidth = $.mapael.maps['world'].width * (viewportHeight / $.mapael.maps['world'].height);
                    paper.setSize(viewportWidth, viewportHeight);
                    $(window).on('resize', function () {
                        var viewportHeight = $("#kla1630map.content").height();
                        var viewportWidth = $.mapael.maps['world'].width * (viewportHeight / $.mapael.maps['world'].height);
                        paper.setSize(viewportWidth, viewportHeight);
                    }).trigger('resize');
                    */
                }
            },
            plots: plots,
            links: worldmaplinks

            /*
            ,
            links: {
                'link1': {
                    factor: 0.5,
                    // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                    between: [{
                        latitude: 23,
                        longitude: 0.0
                    }, {
                        latitude: 24,
                        longitude: 100
                    }],
                    attrs: {
                        "stroke-width": 2
                    },
                    tooltip: {
                        content: "Link"
                    }
                }
            }
            */
        };
        // jetzt kann in worldmaplink entsprechend eine Modifikation stattfinden
        worldmap.links = kla1630map.getClimatezonelinks(worldmaplinks);
        $(".mapcontainer").mapael(worldmap);
    };

    kla1630map.getClimatezonelinks = function(worldmaplinks) {
        // 23,5 - 40 - 60
        var wl = {
            'link0': {
                factor: 0.01,
                // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                between: [{
                    latitude: 0.1,
                    longitude: -179.0
                }, {
                    latitude: 0.2,
                    longitude: 179.0
                }],
                attrs: {
                    "stroke-width": 2,
                    stroke: "#a4e100",
                    opacity: 0.6
                },
                tooltip: {
                    content: "Tropic"
                }
            },
            'link1': {
                factor: 0.01,
                // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                between: [{
                    latitude: 23.50,
                    longitude: -179.0
                }, {
                    latitude: 23.51,
                    longitude: 179.0
                }],
                attrs: {
                    "stroke-width": 2,
                    stroke: "#a4e100",
                    opacity: 0.6                },
                tooltip: {
                    content: "Subtropic"
                }
            },
            'link2': {
                factor: 0.01,
                // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                between: [{
                    latitude: 40.0,
                    longitude: -179.0
                }, {
                    latitude: 40.1,
                    longitude: 179.0
                }],
                attrs: {
                    "stroke-width": 2,
                    stroke: "#a4e100",
                    opacity: 0.6
                },
                tooltip: {
                    content: "Gemäßigt"
                }
            },
            'link3': {
                factor: 0.01,
                // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                between: [{
                    latitude: 60.0,
                    longitude: -179.0
                }, {
                    latitude: 60.1,
                    longitude: 179.0
                }],
                attrs: {
                    "stroke-width": 2,
                    stroke: "#a4e100",
                    opacity: 0.6
                },
                tooltip: {
                    content: "Kalt"
                }
            },


            'link1s': {
                factor: 0.01,
                // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                between: [{
                    latitude: -23.50,
                    longitude: -179.0
                }, {
                    latitude: -23.51,
                    longitude: 179.0
                }],
                attrs: {
                    "stroke-width": 2,
                    stroke: "#a4e100",
                    opacity: 0.6
                },
                tooltip: {
                    content: "Subtropic"
                }
            },
            'link2s': {
                factor: 0.01,
                // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                between: [{
                    latitude: -40.0,
                    longitude: -179.0
                }, {
                    latitude: -40.1,
                    longitude: 179.0
                }],
                attrs: {
                    "stroke-width": 2,
                    stroke: "#a4e100",
                    opacity: 0.6
                },
                tooltip: {
                    content: "Gemäßigt"
                }
            },
            'link3s': {
                factor: 0.01,
                // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                between: [{
                    latitude: -60.0,
                    longitude: -179.0
                }, {
                    latitude: -60.1,
                    longitude: 179.0
                }],
                attrs: {
                    "stroke-width": 2,
                    stroke: "#a4e100",
                    opacity: 0.6
                },
                tooltip: {
                    content: "Kalt"
                }
            }
        };
        return wl;
    };
    /**
     * fitMap nach http://jsfiddle.net/neveldo/mrga03aj/
     * und https://github.com/neveldo/jQuery-Mapael/issues/216
     * leicht abgewandelt, weil nicht fullscreen und weil
     * noch ein Bereich für die Liste der Stationen übrig bleiben soll
     * Parameters:
     * - mapcontainer: jQuery-Selector für den Container, kann .content sein o.ä.
     * - mapname: "world" oder "germany" ...
     * - paper: Übergabeparameter von Mapael, format notwendig
     *
     * returns: ret mit
     * - error
     * - message
     * - widthRemaining - Platz für die Liste und für die Entscheidung, ob die Liste daneben geht ...
     * - heightRemaining - Platz für die Liste und für die Entscheidung, ob die Liste darunter geht ...
     */
    kla1630map.fitMap = function (mapcontainer, mapname, paper) {

        var mapW = $.mapael.maps[mapname].width;
        var mapH = $.mapael.maps[mapname].height;

        //var winW = $(window).width();
        //var winH = $(window).height();
        var winW = $(mapcontainer).width();
        var winH = $(mapcontainer).height() - 5;
        var winRatio = winW / winH;
        var mapRatio = mapW / mapH;
        //if the window ratio is larger than the map ratio
        //then the height of the map needs to match the window
        //but then space appears on the right of the map
        //
        //if the window ratio is smaller than the map ratio
        //then the width of the map needs to match the window
        //but then space appears below the map
        //
        //the zoom trigger's latitude and longitude lines aren't relevant any more.
        //the map should be centered on europe or at least not let the spacing occur only on one side.
        //i think i just need to add something to the x on winRatio > mapRatio
        //or add something to the y on winRatio < mapRatio
        //but i can't figure out what ;_;.
        if (winRatio > mapRatio) {
            paper.setSize((mapW * winH) / mapH, winH);
            //$(".mapcontainer").trigger("zoom", {latitude : lat, longitude: long});
        } else {
            paper.setSize(winW, (mapH * winW) / mapW);
            //$(".mapcontainer").trigger("zoom", {latitude : lat, longitude: long});
        }
        return;
    };



    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1630map;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1630map;
        });
    } else {
        // included directly via <script> tag
        root.kla1630map = kla1630map;
    }
}());