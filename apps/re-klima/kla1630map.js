/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global window,module,define,root,global,self,var,this,sysbase,uihelper,uientry,async */
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
    var selrecord = {};
    var stations = {};
    var stationarray = [];
    var worldmap;

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
                            html: "Kontinente",
                            click: function (evt) {
                                evt.preventDefault();
                                var continents = uihelper.setContinents();
                                // https://github.com/neveldo/jQuery-Mapael/blob/master/UPGRADE.md
                                var newLinks = {};
                                var ilink = 0;
                                for (var icon = 0; icon < continents.length; icon++) {
                                    var continent = continents[icon];
                                    for (var iko = 0; iko < continent.lat.length; iko++) {
                                        ilink++;
                                        var name = continent.value + ilink;
                                        var fakt = 1.0;
                                        if (continent.lat[iko] === continent.lat[iko + 1]) {
                                            fakt = 1.001;
                                        }
                                        newLinks[name] = {
                                            factor: 0.01,
                                            // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
                                            between: [{
                                                latitude: continent.lat[iko],
                                                longitude: continent.lon[iko]
                                            }, {
                                                latitude: continent.lat[iko + 1] * fakt,
                                                longitude: continent.lon[iko + 1]
                                            }],
                                            attrs: {
                                                "stroke-width": 2,
                                                stroke: "red",
                                                /* "#a4e100", */
                                                opacity: 0.6
                                            },
                                            tooltip: {
                                                content: continent.text
                                            }
                                        };
                                    }
                                    // Rück-Linie - letzte zu erster Linie - ist nicht notwendig
                                }
                                // dahin muss die Ausgabe
                                // http://jsfiddle.net/neveldo/dk3ers47/
                                // https://github.com/neveldo/jQuery-Mapael/blob/master/UPGRADE.md
                                var options = {
                                    mapOptions: {}, // was updatedOptions
                                    replaceOptions: false, // replace opt.resetPlots/resetAreas: whether mapsOptions should entirely replace current map options, or just extend it,
                                    newPlots: {}, // was newPlots
                                    newLinks: newLinks, // was opt.newLinks
                                    deletePlotKeys: [], // was deletedPlots
                                    deleteLinkKeys: [], // was opt.deletedLinks
                                    setLegendElemsState: true, // is new
                                    animDuration: 0, // was opt.animDuration
                                    afterUpdate: function () {} // was opt.afterUpdate
                                };
                                $(".mapcontainer").trigger('update', [options]);

                            }
                        }))

                        .append($("<li/>", {
                            class: "dropdown-menuepoint",
                            html: "Klimazonen",
                            click: function (evt) {
                                evt.preventDefault();
                                //kla1630map.fitMap(".content", "world", paper);
                                var zoneLinks = kla1630map.getClimatezonelinks();
                                // https://github.com/neveldo/jQuery-Mapael/blob/master/UPGRADE.md
                                var options = {
                                    mapOptions: {}, // was updatedOptions
                                    replaceOptions: false, // replace opt.resetPlots/resetAreas: whether mapsOptions should entirely replace current map options, or just extend it,
                                    newPlots: {}, // was newPlots
                                    newLinks: zoneLinks, // was opt.newLinks
                                    deletePlotKeys: [], // was deletedPlots
                                    deleteLinkKeys: [], // was opt.deletedLinks
                                    setLegendElemsState: true, // is new
                                    animDuration: 300, // was opt.animDuration
                                    afterUpdate: function () {} // was opt.afterUpdate
                                };
                                $(".mapcontainer").trigger('update', [options]);
                            }
                        }))


                        .append($("<li/>", {
                            class: "dropdown-menuepoint",
                            html: "Animation",
                            click: function (evt) {
                                evt.preventDefault();
                                kla1630map.prepeditor(function (ret) {
                                    return;
                                });
                            }
                        }))

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

        $("#kla1630map.content").css({
            width: "100%",
            "background-color": "lightsteelblue"
        });

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
            kla1630map.showMap(stationarray);
        } else {
            stationarray = window.parent.sysbase.getCache("stationarray");
            if (typeof stationarray !== "undefined" && Array.isArray(stationarray) && stationarray.length > 0) {
                kla1630map.showMap(stationarray);
            } else {
                stationarray = [];

                    kla1630map.prepeditor(function (ret) {
                        sysbase.putMessage(ret.message);
                        return;
                    });

            }
        }
        window.parent.sysbase.delCache("stationarray");
        window.parent.sysbase.delCache("stationrecords");
    }; // Ende show



    /**
     * Anzeige Stationen
     *
     * @param {*} stations
     */
    kla1630map.showMap = function (stationarray) {


        var h = $("body").height();
        h = h - $(".header").outerHeight();
        h = h - $(".footer").outerHeight();

        $("#kla1630map.content").css({
            height: h - 3,
            overflow: "hidden"
        });

        if ($(".col1of2").length === 0) {
            $("#kla1630map.content")
                .append($("<div/>", {
                        class: "col1of2",
                        css: {
                            height: h - 3,
                            width: "75%",
                            overflow: "auto"
                        }
                    })
                    .append($("<div/>", {
                            class: "mapcontainer",
                            css: {
                                width: "100%"
                            }
                        })
                        .append($("<div/>", {
                                class: "map"
                            })

                        ))
                    .append($("<div/>", {
                            id: "kla1630mapline"
                        })
                        .append($("<span/>", {
                            id: "kla1630mapspark",
                            html: "&nbsp;"
                        }))
                        .append($("<br/>"))
                        .append($("<span/>", {
                            id: "kla1630mapsres",
                            html: "&nbsp;"
                        }))
                    )
                )
                .append($("<div/>", {
                    class: "col2of2",
                    css: {
                        height: h - 3,
                        width: "24%",
                        overflow: "auto"
                    }
                }));
        }
        /*
        var h = $("body").height() - $("#kla1630map.header") - $("#kla1630map.footer");
        $("#kla1630map.content").css({
            height: h - 3,
            overflow: "auto"
        });
        $("#kla1630map.container").css({
            height: h - 3,
            overflow: "auto"
        });
        */
        $("#kla1630map.mapcontainer").css({
            height: h - 100,
            overflow: "auto"
        });
        $("#kla1630mapline").css({
            height: 99,
            overflow: "auto"
        });


        plots = {}; // [];
        /*
        "047_N043":
            {"stations":"40371624003;",
             "xstations":[
                 {"latn":"N43","lon":"-79.4000","lat":"43.6700","name":"TORONTO,ON"}
                ],
        */
        for (var isa = 0; isa < stationarray.length; isa++) {
            var station = stationarray[isa];
            if (typeof station.stationid === "undefined" || station.stationid.length === 0) {
                station.stationid = 'plot-' + Math.round(Math.random() * 10000);
            }
            var sitename = station.sitename || "unknown";
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
            //plots.push({
                console.log(contenthtml);
            plots[station.stationid] = {
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
            //});
            };

        }
        var worldmaplinks = {};

        worldmap = {
            map: {
                // Set the name of the map to display
                name: "world",
                zoom: {
                    "enabled": true
                },
                defaultArea: {
                    eventHandlers: {
                        mouseover: function (e, id, mapElem, textElem, elemOptions) {
                            /*
                            if (typeof elemOptions.myText != 'undefined') {
                                $('.myText span').html(elemOptions.myText).css({display: 'none'}).fadeIn('slow');
                            }
                            */

                            var msg = "MouseOver:" + id;
                            var coords = $(".mapcontainer").data("mapael").mapPagePositionToXY(e.pageX, e.pageY);
                            msg += "e.pageX:" + e.pageX;
                            msg += " e.pageY:" + e.pageY;
                            msg += " x:" + coords.x;
                            msg += " y:" + coords.y;
                            sysbase.putMessage(msg);
                        },
                        click: function (e, id, mapElem, textElem) {
                            sysbase.putMessage("MouseClick:" + id);
                            // uihelper.pointIsInContinent
                            var newData = {
                                'areas': {}
                            };
                            if (mapElem.originalAttrs.fill == "#5ba400") {
                                newData.areas[id] = {
                                    attrs: {
                                        fill: "#0088db"
                                    }
                                };
                            } else {
                                newData.areas[id] = {
                                    attrs: {
                                        fill: "#5ba400"
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
                            /**
                             * Test Kontinentbestimmung aus Polygon
                             * mapElem.attrs.x und mapElem.attrs.y sind pixel-Koordinaten
                             * daher besser  mit Station-Data zum Beginn
                             * elemOptions.longitude und elemOptions.latitude sind vorhanden
                             */
                            var cont = uihelper.getContinent(elemOptions.longitude, elemOptions.latitude);
                            if (cont.error === false) {
                                sysbase.putMessage(cont.code);
                            }
                            var msg = elemOptions.myText || "Kein Hinweis vorhanden";
                            var msg1 = msg.replace("<br>", " ");
                            var msgp = msg1.split(" ");
                            var stationname = msgp[1];
                            var stationid = msgp[0];
                            if (typeof starecord === "undefined" || typeof starecord.variablename === "undefined") {
                                starecord = selrecord;
                            }
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
                            debugger;
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
                    var mapi = $(".mapcontainer").data("mapael");
                    var mapW = paper._viewBox[2];
                    var mapH = paper._viewBox[3];
                    var mapRatio = mapW / mapH;
                    var availableH = $(".content").height() - 100; // für content - Bereich für
                    var availableW = availableH * mapRatio;
                    var maxW = $(".col1of2").width();
                    if (availableW > maxW) {
                        availableH = maxW / mapRatio; // für content - Bereich für
                        availableW = maxW;
                    }
                    var msg = "";
                    msg += " avH:" + availableH;
                    msg += " ratio:" + mapRatio;
                    msg += " avW:" + availableW;
                    console.log(msg);
                    paper.setSize(availableW, availableH);
                    //kla1630map.fitMap(".content", "world", paper);
                    /*
                    $(window).on('resize', function () {
                        kla1630map.fitMap (".content", "world", paper);
                    }).trigger('resize');
                    */
                    $(window).on('resize', function () {
                        // kla1630map.fitMap(".content", "world", paper);
                    });
                }
            },
            plots: plots,
            links: worldmaplinks
        };
        // jetzt kann in worldmaplink entsprechend eine Modifikation stattfinden
        // worldmap.links = kla1630map.getClimatezonelinks(worldmaplinks);


        $(document).on('click', ".mapcontainer", function (e) {
            // mapPagePositionToXY() allows to get the x,y coordinates
            // on the map from a x,y coordinates on the page
            var msg = " ";
            var mapi = $(".mapcontainer").data("mapael");
            var coords = mapi.mapPagePositionToXY(e.pageX, e.pageY);
            // var lon = (x - xoffset) / xfactor;
            var lon = (coords.x - mapi.mapConf.xoffset) / mapi.mapConf.xfactor;
            var lat = (coords.y - mapi.mapConf.yoffset) / mapi.mapConf.yfactor;

            var coninfo = uihelper.getContinent(lon, lat);
            msg += " Continent:" + coninfo.continentcode + " " + coninfo.continentname;
            msg += " x:" + coords.x;
            msg += " lon:" + lon;
            msg += " y:" + coords.y;
            msg += " lat:" + lat;
            console.log(msg);
            sysbase.putMessage(msg);

            var updateOptions = {
                mapOptions: {}, // was updatedOptions
                replaceOptions: false, // replace opt.resetPlots/resetAreas: whether mapsOptions should entirely replace current map options, or just extend it,
                newPlots: {}, // was newPlots
                newLinks: [], // was opt.newLinks
                deletePlotKeys: [], // was deletedPlots
                deleteLinkKeys: [], // was opt.deletedLinks
                setLegendElemsState: true, // is new
                animDuration: 0, // was opt.animDuration
                afterUpdate: function (container, paper, areas, plots, options) {} // was opt.afterUpdate
            };
            // Each new plot must have its own unique ID
            var plotId = 'plot-' + Math.round(Math.random() * 1000);
            updateOptions.newPlots[plotId] = {
                longitude: lon,
                latitude: lat,
                tooltip: {
                    content: "Dies ist ein Test"
                }
            };
            $(".mapcontainer").trigger('update', [updateOptions]);
        });

        $(".mapcontainer").mapael(worldmap);

        // Berechnung xoffset und yoffset
        var mapi = $(".mapcontainer").data("mapael");
        var xoffset = mapi.mapConf.width / 2;
        var yoffset = mapi.mapConf.height / 2;
        var lat = 45;
        var lon = 90;
        var testcoord = mapi.mapConf.getCoords(lat, lon);
        var xfactor = (testcoord.x - xoffset) / lon;
        var yfactor = (testcoord.y - yoffset) / lat;
        var msg = "";
        msg += " xoffset:" + xoffset;
        msg += " longitude:" + lon;
        msg += " testcoord.x:" + testcoord.x;
        msg += " xfactor:" + xfactor;

        msg += " yoffset:" + yoffset;
        msg += " latitude:" + lat;
        msg += " testcoord.y:" + testcoord.y;
        msg += " yfactor:" + yfactor;

        mapi.mapConf.xoffset = xoffset;
        mapi.mapConf.yoffset = yoffset;
        mapi.mapConf.xfactor = xfactor;
        mapi.mapConf.yfactor = yfactor;

        console.log(msg);
        sysbase.putMessage(msg);

        /**
         * Animation hier vorprüfen und gegf. ausführen
         */
        if (typeof starecord === "undefined") {
            kla1630map.prepeditor(function (ret) {
                return;
            });
        }
    };

    /**
     * prepanimation - rechts Selektionskriterien ausgeben
     * selrecord hält die Selektionsparamter
     * selschema definiert die Erfassungsstruktur
     */
    var selschema = {
        entryschema: {
            source: {
                title: "Quelle",
                type: "string", // currency, integer, datum, text, key
                class: "uieselectinput",
                default: "GHCND",
                io: "o",
                enum: [
                    "GHCND"
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
                    "TMIN",
                    "TMAX"
                ]
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
            continent: {
                title: "Kontinentalzone",
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
            stepyear: {
                title: "Intervall",
                type: "string", // currency, integer, datum, text, key
                class: "uieselectinput",
                default: "1",
                io: "i",
                enum: [
                    "1",
                    "5",
                    "10",
                    "30",
                    "50"
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

    kla1630map.prepeditor = function (cb1630A) {
        /*
        stationarray = [];
        kla1630map.showMap([{
            longitude: 15,
            latitude: 15,
            tooltip: "Dies ist ein Test-Tooltip"
        }]);
        */
        $("#kla1630mapwrapper").remove();
        $("#kla1630map .col2of2")
            .append($("<div/>", {
                    id: "kla1630mapwrapper",
                    width: "100%"
                })
                .append($("<form/>", {
                    id: "kla1630mapform",
                    class: "uieform"
                }))
            );
        uientry.getSchemaUI("kla1630map", selschema, "kla1630map", "kla1630mapform", function (ret) {
            if (ret.error === false) {
                if (typeof selrecord.source === "undefined") {
                    selrecord.source = "GHCND";
                    selrecord.variablename = "TMAX";
                    selrecord.climatezone = "N1";
                    selrecord.stepyear = "1";
                    selrecord.anzyears = ">=150";
                }
                uientry.fromRecord2UI("#kla1630mapform", selrecord, selschema);
                $(".col2of2")
                    .append($("<div/>", {
                            css: {
                                width: "100%",
                                float: "left"
                            }
                        })
                        .append($("<button/>", {
                            html: "Animation",
                            class: "kla1630mapbut1",
                            click: function (evt) {
                                evt.preventDefault();
                                var thisbutton = this;
                                $('.kla1630mapbut1').prop('disabled', true);
                                $('.kla1630mapbut1').hide();
                                kla1630map.animate(false, function (ret) {
                                    $('.kla1630mapbut1').prop('disabled', false);
                                    $('.kla1630mapbut1').show();
                                });
                            }
                        }))
                    );
            }
            cb1630A({
                error: false,
                message: "OK"
            });
        });
    };


    /**
     * animate - animierte Anzeige und optional gif-Ausgabe
     */
    kla1630map.animate = function (dogif, cb1630B) {
        /*
        kla1630map.showMap([{
            sitename: "hoffentlich"
            longitude: 15,
            latitude: 15,
            tooltip: "Dies ist ein Test-Tooltip"
        }]);
        */

        var creategif = false;
        if (typeof dogif !== "undefined" && dogif === true) {
            creategif = true;
        }
        if (typeof selrecord === "undefined") {
            sysbase.putMessage("Animation nur mit Selektionsvorgabe");
        }

        uientry.fromUI2Record("#kla1630mapform", selrecord, selschema);

        var sel = {};
        var table = "KLISTATIONS";
        var sqlStmt = "";
        var where = "";

        sqlStmt += "SELECT ";
        sqlStmt += " DISTINCT";
        sqlStmt += " KLISTATIONS.source, KLISTATIONS.stationid, KLISTATIONS.stationname, ";
        sqlStmt += " KLISTATIONS.longitude, ";
        sqlStmt += " KLISTATIONS.latitude, ";
        sqlStmt += " KLISTATIONS.climatezone, ";
        sqlStmt += " KLISTATIONS.continent, ";
        sqlStmt += " KLIINVENTORY.variable, ";
        sqlStmt += " KLIINVENTORY.fromyear, KLIINVENTORY.toyear,";
        sqlStmt += " (KLIINVENTORY.toyear - KLIINVENTORY.fromyear + 1) AS anzyears,";
        sqlStmt += " 1 AS ANZAHL";
        sqlStmt += " FROM KLISTATIONS";
        sqlStmt += " LEFT JOIN KLIINVENTORY";
        sqlStmt += " ON KLISTATIONS.source = KLIINVENTORY.source";
        sqlStmt += " AND KLISTATIONS.stationid = KLIINVENTORY.stationid";
        where += " KLISTATIONS.stationid IN (";
        where += " SELECT stationid FROM KLIINVENTORY";
        where += " WHERE KLIINVENTORY.source = '" + selrecord.source + "'";
        where += " AND KLIINVENTORY.variable = '" + selrecord.variablename + "'";
        if (typeof selrecord.fromyear !== "undefined" && selrecord.fromyear.trim().length > 0) {
            var fromyear = selrecord.fromyear.match(/(<=|>=|<|>|=)?(\d*)(-)?(\d*)?/);
            if (fromyear !== null && fromyear.length >= 3) {
                if (where.length > 0) where += " AND ";
                where += " KLIINVENTORY.toyear " + ">=" + parseInt(fromyear[2]);
                selrecord.fromyear = fromyear[2];
            } else {
                cb1630B({
                    error: true,
                    message: "Parameterfehler"
                });
                return;
            }
        }
        if (typeof selrecord.toyear !== "undefined" && selrecord.toyear.trim().length > 0) {
            var toyear = selrecord.toyear.match(/(<=|>=|<|>|=)?(\d*)(-)?(\d*)?/);
            if (toyear !== null && toyear.length >= 3) {
                if (where.length > 0) where += " AND ";
                where += " KLIINVENTORY.fromyear " + "<=" + parseInt(toyear[2]);
                selrecord.toyear = toyear[2];
            } else {
                cb1630B({
                    error: true,
                    message: "Parameterfehler"
                });
                return;
            }
        }
        where += ")";
        where += " AND KLISTATIONS.source = '" + selrecord.source + "'";
        where += " AND KLIINVENTORY.variable = '" + selrecord.variablename + "'";
        if (typeof selrecord.climatezone !== "undefined" && selrecord.climatezone.trim().length > 0) {
            var selclimatezone = selrecord.climatezone.substr(0, 2);
            if (where.length > 0) where += " AND ";
            if (selclimatezone.startsWith("G")) {
                var cz1 = "N" + starecord.climatezone.substr(1, 1);
                var cz2 = "S" + starecord.climatezone.substr(1, 1);
                where += " (substr(KLISTATIONS.climatezone, 1, 2) = '" + cz1 + "'";
                where += " OR substr(KLISTATIONS.climatezone, 1, 2) = '" + cz2 + "')";
            } else {
                where += " substr(KLISTATIONS.climatezone, 1, 2) = '" + selclimatezone + "'";
            }
        }
        if (typeof selrecord.anzyears !== "undefined" && selrecord.anzyears.trim().length > 0) {
            if (where.length > 0) where += " AND ";
            var anzparts = selrecord.anzyears.match(/(<=|>=|<|>|=)(\d*)/);
            if (anzparts !== null && anzparts.length > 2) {
                where += " anzyears " + anzparts[1] + parseInt(anzparts[2]);
            } else {
                where += " anzyears >= " + selrecord.anzyears.trim();
            }
        }

        // where += " AND KLIISTATIONS.temperature = 'TMAX,TMIN'";
        sqlStmt += " WHERE " + where;
        /*
        sqlStmt += " GROUP BY KLISTATIONS.continent, KLISTATIONS.climatezone,";
        sqlStmt += " KLIINVENTORY.variable,",
        sqlStmt += " KLIINVENTORY.fromyear, KLIINVENTORY.toyear";
        */
        sqlStmt += " ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";
        // sqlStmt += " ORDER BY KLISTATIONS.continent, KLISTATIONS.climatezone";
        async.waterfall([
                function (cb1630B1) {
                    var skip = 0;
                    var limit = 0;
                    var api = "getallrecords";
                    var table = "KLISTATIONS";
                    var vglstationid = "";
                    var vgldata = {};
                    uihelper.getAllRecords(sqlStmt, null, null, skip, limit, api, table, function (ret) {
                        if (ret.error === true) {
                            // sollte nicht passieren??? oder auch hier anlegen
                            sysbase.putMessage("Error:" + ret.message, 3);
                            cb1630B1("error", {
                                error: true,
                                message: ret.message
                            });
                            return;
                        } else {
                            if (ret.records !== "undefined" && ret.records !== null) {
                                sysbase.putMessage("Stations:" + Object.keys(ret.records).length, 1);
                                var irow = 0;
                                var fromyear = null;
                                var toyear = null;
                                var pearls = [];
                                $("#kla1670piv .col1of2")
                                    .append($("<ul/>", {
                                        id: "kla1670pivl1"
                                    }));
                                for (var property in ret.records) {
                                    if (ret.records.hasOwnProperty(property)) {
                                        var record = ret.records[property];
                                        irow++;
                                        if (vglstationid === record.stationid) {
                                            sysbase.putMessage("Doppel:" + vglstationid);
                                            console.log("OLD:" + JSON.stringify(vgldata));
                                            console.log("DUP:" + JSON.stringify(record));
                                            debugger;
                                        }
                                        vglstationid = record.stationid;
                                        vgldata = uihelper.cloneObject(record);
                                        if (fromyear === null) {
                                            fromyear = record.fromyear;
                                        } else if (record.fromyear < fromyear) {
                                            fromyear = record.fromyear;
                                        }
                                        if (toyear === null) {
                                            toyear = record.toyear;
                                        } else if (record.toyear > toyear) {
                                            toyear = record.toyear;
                                        }

                                        pearls.push({
                                            source: record.source,
                                            stationid: record.stationid,
                                            stationname: record.stationname,
                                            longitude: record.longitude,
                                            latitude: record.latitude,
                                            continent: record.continent,
                                            climatezone: record.climatezone,
                                            variable: record.variable,
                                            fromyear: parseInt(record.fromyear) || 0,
                                            toyear: parseInt(record.toyear) || 0,
                                            ispainted: 0
                                        });
                                        $("#kla1670pivl1")
                                            .append($("<li/>", {
                                                html: JSON.stringify(pearls[pearls.length - 1])
                                            }));
                                    }
                                }
                                if (irow > 0) {
                                    if (typeof selrecord.fromyear === "undefined" || selrecord.fromyear === null || selrecord.fromyear.trim().length === 0) {
                                        selrecord.fromyear = "" + fromyear;
                                    }
                                    if (typeof selrecord.toyear === "undefined" || selrecord.toyear === null || selrecord.toyear.trim().length === 0) {
                                        selrecord.toyear = "" + toyear;
                                    }
                                    cb1630B1(null, {
                                        error: false,
                                        message: "Daten gefunden:" + irow,
                                        pearls: uihelper.cloneObject(pearls),
                                        selrecord: uihelper.cloneObject(selrecord),
                                    });
                                    return;
                                } else {
                                    cb1630B1("error", {
                                        error: true,
                                        message: "Keine Daten gefunden"
                                    });
                                    return;
                                }
                            }
                        }
                    });
                },
                function (ret1, cb1630B2) {
                    /**
                     * Loop über die Daten aufrufen zur Ausgabe mit Animation
                     * in ret: pearls[] mit: continent, climatezone, variable, fromyear, toyear, ispainted
                     * sowie error, message und selrecord
                     */
                    kla1630map.loop(dogif, ret1.selrecord, ret1.pearls, function (ret) {
                        cb1630B2("Finish", ret);
                        return;
                    });
                }
            ],
            function (error, ret) {
                cb1630B(ret);
                return;
            });
    };

    /**
     * loop - grosse Mimik zur animierten Ausgabe in einem Loop, verschachtelt
     * und asynchron
     * Loop über die Daten aufrufen zur Ausgabe mit Animation
     * in ret: pearls[] mit: continent, climatezone, variable, fromyear, toyear, ispainted
     * ispainted: 0 = noch nicht ausgegeben, 1 = ausgegeben, 9 = gelöscht
     * sowie error, message und selrecord
     * @param {*} dogif - true für die Ausgabe
     * @param {*} selrecord {} - Selektionskriterien
     * @param {*} pearls [] - Daten aus der Datenbank
     * @param {*} cb1630C - Callback, returns error, message
     */
    kla1630map.loop = function (dogif, selrecord, pearls, cb1630C) {
        // Anlegen des Steuer-Arrays, Loop über Auswertungsspanne
        try {
            var loopyears = [];
            var fromyear = parseInt(selrecord.fromyear);
            var toyear = parseInt(selrecord.toyear);
            var anzyears = toyear - fromyear + 1;
            var maxcount = 0;
            var yearindex = {};
            var ind = 0;
            for (var iyear = fromyear; iyear <= toyear; iyear++) {
                loopyears.push({
                    year: iyear,
                    count: 0
                });
                yearindex["" + iyear] = ind;
                ind++;
            }
            for (var ipearl = 0; ipearl < pearls.length; ipearl++) {
                var pearl = pearls[ipearl];
                for (var iloop = 0; iloop < loopyears.length; iloop++) {
                    var actyear = loopyears[iloop].year;
                    if (actyear <= pearl.toyear && actyear >= pearl.fromyear) {
                        var yearind = yearindex["" + actyear];
                        loopyears[yearind].count += 1;
                        if (loopyears[yearind].count > maxcount) maxcount = loopyears[yearind].count;
                    }
                }
            }
            var sparkarray = new Array(anzyears).fill(null);
            // https://github.com/neveldo/jQuery-Mapael/blob/master/UPGRADE.md
            var icontrol = 0;
            async.eachSeries(loopyears, function (loopyear, nextyear) {
                // Loop über pearls
                // Bereitstellung newplots für neue stations, die hinzukommen
                // Bereitstellung deletePlotKeys für stations, die verschwinden
                // maxcount für die sparkline-Konfiguration
                var options = {
                    mapOptions: {}, // was updatedOptions
                    replaceOptions: false, // replace opt.resetPlots/resetAreas: whether mapsOptions should entirely replace current map options, or just extend it,
                    newPlots: {}, // was newPlots
                    newLinks: [], // was opt.newLinks
                    deletePlotKeys: [], // was deletedPlots
                    deleteLinkKeys: [], // was opt.deletedLinks
                    setLegendElemsState: true, // is new
                    animDuration: 100, // was opt.animDuration
                    afterUpdate: function () {} // was opt.afterUpdate
                };
                icontrol++;
                // if (icontrol <= 2) debugger;
                var actyear = "" + loopyear.year;
                var actcount = loopyear.count;
                var sparkindex = yearindex[actyear];
                sparkarray[sparkindex] = actcount;
                var anznew = 0;
                var anzdel = 0;
                // Aufbau newPlots und deletePlotKeys
                for (var ipearl = 0; ipearl < pearls.length; ipearl++) {
                    if (pearls[ipearl].ispainted === 0) {
                        var pearl = pearls[ipearl];
                        if (pearl.fromyear <= actyear && pearl.toyear >= actyear) {
                            pearls[ipearl].ispainted = 1;
                            var contenthtml = pearl.stationid + " " + pearl.stationname;
                            anznew++;
                            options.newPlots[pearl.stationid] = {
                                type: "square", // circle
                                size: 5,
                                latitude: pearl.latitude,
                                longitude: pearl.longitude,
                                tooltip: {
                                    content: contenthtml
                                },
                                /*
                                text: {

                                },
                                myText: pearl.stationname + " lon:" + pearl.longitude + " lat:" + pearl.latitude,
                                */
                                selstationid: pearl.stationid
                            };
                            continue;
                        }
                    } else if (pearls[ipearl].ispainted === 1) {
                        var pearl = pearls[ipearl];
                        if (pearl.toyear < actyear) {
                            pearls[ipearl].ispainted = 9;
                            anzdel++;
                            options.deletePlotKeys.push(pearl.stationid);
                            continue;
                        }
                    }
                }
                // Aktualisierung worldmap
                if (anznew > 0 || anzdel > 0) {
                    // if (anzdel > 0 && anzdel < 2) debugger;
                    $(".mapcontainer").trigger('update', [options]);
                }
                // Ausgabe sparklines aktualisiert
                /**
                 * Sparkline vorbereiten
                 */
                var defaultpixels = 3;
                var sparkwidth = $(".mapcontainer").width();
                if (sparkarray.length > 0) {
                    defaultpixels = Math.floor(sparkwidth / sparkarray.length);
                    if (defaultpixels < 1) defaultpixels = 1;
                }

                $("#kla1630mapspark").sparkline(sparkarray, {
                    type: 'line',
                    height: 60,
                    fillColor: false,
                    defaultPixelsPerValue: defaultpixels,
                    chartRangeMin: 0,
                    chartRangeMax: maxcount,
                    lineColor: "blue"
                    // composite: true
                });
                var html = "JAHR:" + actyear + " - " + actcount;
                $("#kla1630mapsres").html(html);

                setTimeout(function () {
                    nextyear();
                    return;
                }, 400);


            }, function (error) {
                // Ende des Loops
                cb1630C({
                    error: false,
                    message: "worldmap fertiggestellt"
                });
                return;
            });
        } catch (err) {
            console.log(err);
            console.log(err.stack);
            cb1630C({
                error: true,
                message: "worldmap Error:" + err
            });
            return;
        }
    };



    // Klimazone
    kla1630map.getClimatezonelinks = function (worldmaplinks) {
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
                    opacity: 0.6
                },
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
        var mapRatio = mapW / mapH;
        //var winW = $(window).width();
        //var winH = $(window).height();
        var winW = $(mapcontainer).width();
        var winH = $(mapcontainer).height() - 5;
        var winRatio = winW / winH;

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