/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global window,module,define,root,global,self,var,this,sysbase,uihelper,uientry,async,GIF,svgspark02,PlainDraggable */
(function () {
    var kla1650ani = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1650ani  bekommt über getCache pivotdata oder yearlats(?)
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
    var selrecord = {};
    var titlerecord = {};
    var stations = {};
    var stationarray = [];
    var worldmap = {};
    var firststationid = "";
    var gif;

    kla1650ani.show = function (parameters, navigatebucket) {
        if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {

        }
        if (typeof parameters !== "undefined" && parameters.length > 0) {}
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
        $(".headertitle").attr("title", "kla1650ani");
        $(".content").attr("pageid", "kla1650ani");
        $(".content").attr("id", "kla1650ani");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1650ani")
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
                                        var name = continent.code + ilink;
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
                                                content: continent.name
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
                                //kla1650ani.fitMap(".content", "world", paper);
                                var zoneLinks = kla1650ani.getClimatezonelinks();
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
                                kla1650ani.prepeditor(function (ret) {
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
                                //kla1650ani.fitMap(".content", "world", paper);
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

        $("#kla1650ani.content").css({
            width: "100%",
            "background-color": "lightsteelblue"
        });

        $(".headertitle").html("Animation Worldmap und Sparklines");
        var ret = {};

        var h = $("body").height();
        h = h - $(".header").outerHeight();
        h = h - $(".footer").outerHeight();

        $("#kla1650ani.content")
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
                .append($("<div/>", {
                        id: "kla1630controls"
                    })

                    .append($("<button/>", {
                        html: "Stop",
                        class: "kla1630anistop",
                        click: function (evt) {
                            evt.preventDefault();
                            var thisbutton = this;
                            $('.kla1630mapbut1').prop('disabled', true);
                            $('.kla1630mapbut1').hide();
                            $('.kla1630mapbut2').hide();
                            kla1650ani.animate(false, function (ret) {
                                $('.kla1630mapbut1').prop('disabled', false);
                                $('.kla1630mapbut1').show();
                                $('.kla1630mapbut2').show();
                            });
                        }
                    }))
                )
                .append($("<div/>", {

                    })
                    .append($("<canvas/>", {
                        id: "kla1650can"
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

        /**
         * erst mal rechts den Editor einrichten
         */
        kla1650ani.prepeditor(function (ret) {
            sysbase.putMessage(ret.message);

        });

    }; // Ende show

    /**
     * prepeditor - Rechts den Editor ausgeben für die Selektion
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

    kla1650ani.prepeditor = function (cb1630A) {

        $("#kla1630mapwrapper").remove();
        $("#kla1650ani .col2of2")
            .append($("<div/>", {
                    id: "kla1630mapwrapper",
                    width: "100%"
                })
                .append($("<form/>", {
                    id: "kla1630mapform",
                    class: "uieform"
                }))
            );
        uientry.getSchemaUI("kla1650ani", selschema, "kla1650ani", "kla1630mapform", function (ret) {
            if (ret.error === false) {
                if (typeof selrecord.source === "undefined") {
                    selrecord.source = "GHCND";
                    selrecord.variablename = "TMAX";
                    selrecord.climatezone = "N1";
                    selrecord.stepyear = "1";
                    selrecord.anzyears = ">=150";
                    selrecord.fromyear = "2018";
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
                                $('.kla1630mapbut2').hide();
                                kla1650ani.animate(false, function (ret) {
                                    $('.kla1630mapbut1').prop('disabled', false);
                                    $('.kla1630mapbut1').show();
                                    $('.kla1630mapbut2').show();
                                });
                            }
                        }))

                        .append($("<button/>", {
                            html: "Animation mit gif-Sicherung",
                            class: "kla1630mapbut2",
                            css: {
                                "margin-left": "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var thisbutton = this;
                                $('.kla1630mapbut2').prop('disabled', true);
                                $('.kla1630mapbut2').hide();
                                $('.kla1630mapbut1').hide();
                                kla1650ani.animate(true, function (ret) {
                                    $('.kla1630mapbut2').prop('disabled', false);
                                    $('.kla1630mapbut2').show();
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
     * Anzeige Stationen
     *
     * @param {*} stations
     */
    kla1650ani.prepMap = function (plots) {
        var h = $("#kla1650ani.content").height();
        $("#kla1650ani.mapcontainer").css({
            height: h - 100,
            overflow: "auto"
        });
        $("#kla1630mapline").css({
            height: 99,
            overflow: "auto"
        });

        var worldmaplinks = {};
        worldmap = {
            map: {
                // Set the name of the map to display
                name: "world",
                zoom: {
                    "enabled": true,
                    maxLevel: 20
                },
                defaultArea: {
                    eventHandlers: {
                        /*
                        mouseover: function (e, id, mapElem, textElem, elemOptions) {
                            var msg = "MouseOver:" + id;
                            var coords = $(".mapcontainer").data("mapael").mapPagePositionToXY(e.pageX, e.pageY);
                            msg += "e.pageX:" + e.pageX;
                            msg += " e.pageY:" + e.pageY;
                            msg += " x:" + coords.x;
                            msg += " y:" + coords.y;
                            sysbase.putMessage(msg);
                        },
                        */

                        click: function (e, id, mapElem, textElem) {
                            sysbase.putMessage("MouseClick:" + id);
                            // uihelper.pointIsInContinent
                            var newData = {
                                'areas': {}
                            };
                            // färbt die areas ein
                            if (mapElem.originalAttrs.fill == "lightsalmon") {
                                newData.areas[id] = {
                                    attrs: {
                                        fill: "lightgreen"
                                    }
                                };
                            } else {
                                newData.areas[id] = {
                                    attrs: {
                                        fill: "lightsalmon"
                                    }
                                };
                            }
                            // hier funktioniert wohl noch die alte Mimik
                            $(".mapcontainer").trigger('update', [{
                                mapOptions: newData
                            }]);
                            var mapi = $(".mapcontainer").data("mapael");
                            var area = mapi.areas[id];
                            debugger;
                            if (area.zoom) {
                                // Area has a zoom property, use it
                                this.mapcontainer.trigger('zoom', area.zoom);
                            } else {
                                // Calculate zoom position
                                var mbx = mapElem.getBBox();
                                var posX = mbx.x + mbx.width / 2;
                                var posY = mbx.y + mbx.height / 2;
                                var sizeMetric = Math.round(mbx.height * mbx.width / 100);
                                var zoomLevel = 0;
                                if (sizeMetric < 50) {
                                    zoomLevel = 15;
                                }
                                if (sizeMetric < 10) {
                                    zoomLevel = 25;
                                }
                                if (sizeMetric < 5) {
                                    zoomLevel = 35;
                                }
                                if (sizeMetric < 3) {
                                    zoomLevel = 40;
                                }
                                //this.mapcontainer.trigger('zoom', {
                                $(".mapcontainer").trigger('zoom', {
                                    level: zoomLevel,
                                    x: posX,
                                    y: posY
                                });
                            }

                        }
                    }
                },
                defaultPlot: {
                    size: 5,
                    type: "square",
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
                            // TODO anpassen
                            var msg = elemOptions.myText || "Kein Hinweis vorhanden";
                            var msg1 = msg.replace("<br>", " ");
                            var msgp = msg1.split(" ");
                            var stationname = msgp[1];
                            var stationid = elemOptions.selstationid; // msgp[0];
                            var variablename = elemOptions.selvariable;
                            var source = elemOptions.selsource;
                            // alert(msg);

                            window.parent.sysbase.setCache("onestation", JSON.stringify({
                                stationid: stationid,
                                source: source,
                                variablename: variablename
                            }));
                            var tourl = "klaheatmap.html" + "?" + "stationid=" + stationid + "&source=" +
                                source + "&variablename=" + variablename; // + "&starecord=" + JSON.stringify(starecord);
                            var idc20 = window.parent.sysbase.tabcreateiframe(stationname, "", "re-klima",
                                "kla1620shm", tourl);
                            window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();

                        },

                        mouseover: function (e, id, mapElem, textElem, elemOptions) {
                            var x = elemOptions.attrs.x;
                            var y = elemOptions.attrs.y;
                            var con = elemOptions.tooltip.content;
                            $(".mapael .mapTooltip").css({
                                'position': 'absolute',
                                'top': x + 10,
                                'left': y + 10,
                                "background-color": "DARKSLATEGRAY",
                                "moz-opacity": 0.70,
                                opacity: 0.70,
                                filter: "alpha(opacity=70)",
                                "border-radius": "10px",
                                padding: "10px",
                                "z-index": 1000,
                                "max-width": "200px",
                                display: "none",
                                color: "WHITE"
                            });
                        }
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
                    $(".mapcontainer").css({
                        width: availableW,
                        height: availableH
                    });
                }
            },
            plots: plots,
            links: worldmaplinks
        };
        // jetzt kann in worldmaplink entsprechend eine Modifikation stattfinden
        // worldmap.links = kla1650ani.getClimatezonelinks(worldmaplinks);

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

        $('.map').on('afterZoom', function () {
            var mapi = $(".mapcontainer").data("mapael");
            var oldlevel = mapi.zoomData.zoomLevel;
            var oldsize = mapi.options.map.defaultPlot.size;
            var size = Math.floor(5 * Math.pow(0.95, oldlevel));
            console.log("afterZoom:" + oldlevel + "=>" + size);
            $(this).trigger('update', [{
                mapOptions: {
                    map: {
                        defaultPlot: {
                            size: size,
                        }
                    }
                }
            }]);
        });

    };



    /**
     * animate - animierte Anzeige und optional gif-Ausgabe
     * dogif === true setzt gif-Sicherung in Gang
     * mit creategif als Indiktor
     */
    kla1650ani.animate = function (dogif, cb1630B) {
        var creategif = false;
        if (typeof dogif !== "undefined" && dogif === true) {
            creategif = true;
        }
        if (typeof selrecord === "undefined" || typeof selrecord.source === "undefined") {
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

        /**
         * wenn stepyear > 1 vorgegeben ist, dann wird eine Jahresliste mit den
         * entsprechenden Sprüngen im Bereich von-bis erzeugt
         * das wird allerdings erst später wirksam wenn die Daten u.a. ausgewertet werden!
         */

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
                var cz1 = "N" + selrecord.climatezone.substr(1, 1);
                var cz2 = "S" + selrecord.climatezone.substr(1, 1);
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
        if (typeof selrecord.region !== "undefined" && selrecord.region.trim().length > 0) {
            if (where.length > 0) where += " AND ";
            if (selrecord.region.trim().length === 2) {
                where += " alpha2 ='" + selrecord.region + "'";
            } else {
                where += "(";
                where += " lower(KLISTATIONS.region) LIKE '%" + selrecord.region.toLowerCase() + "%'";
                where += " OR lower(KLISTATIONS.subregion) LIKE '%" + selrecord.region.toLowerCase() + "%'";
                where += " OR lower(KLISTATIONS.countryname) LIKE '%" + selrecord.region.toLowerCase() + "%'";
                where += ")";
            }
        }

        sqlStmt += " WHERE " + where;
        sqlStmt += " ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";
        async.waterfall([
                function (cb1630B0) {
                    // ret1.selrecord und ret1.pearls müssen weitergegeben werden - oder das geht nach oben
                    if (creategif === true) {
                        gif = new GIF({
                            workers: 2,
                            quality: 10
                        });
                    }
                    if (creategif === true) {
                        kla1650ani.getTitlePageData(true, selrecord, selschema, function (ret) {
                            cb1630B0(null, ret);
                            return;
                        });
                    } else {
                        cb1630B0(null, {
                            error: false,
                            message: "OK"
                        });
                        return;
                    }
                },
                function (ret, cb1630B1) {
                    var skip = 0;
                    var limit = 0;
                    var api = "getallrecords";
                    var table = "KLISTATIONS";
                    var vglstationid = "";
                    var vgldata = {};
                    uihelper.getAllRecords(sqlStmt, null, null, skip, limit, api, table, function (ret) {
                        if (ret.error === true) {
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
                                    var ichanged = false;
                                    if (typeof selrecord.fromyear === "undefined" || selrecord.fromyear === null || selrecord.fromyear.trim().length === 0) {
                                        selrecord.fromyear = "" + fromyear;
                                        ichanged = true;
                                    }
                                    if (typeof selrecord.toyear === "undefined" || selrecord.toyear === null || selrecord.toyear.trim().length === 0) {
                                        selrecord.toyear = "" + toyear;
                                        ichanged = true;
                                    }
                                    if (ichanged === true) {
                                        uientry.fromRecord2UI("#kla1630mapform", selrecord, selschema);
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
                function (ret1, cb1630B3) {
                    /**
                     * Loop über die Daten aufrufen zur Ausgabe mit Animation
                     * in ret: pearls[] mit: continent, climatezone, variable, fromyear, toyear, ispainted
                     * sowie error, message und selrecord
                     */
                    kla1650ani.loop(creategif, ret1.selrecord, ret1.pearls, function (ret) {
                        cb1630B3("Finish", ret);
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
    kla1650ani.loop = function (creategif, selrecord, pearls, cb1630C) {
        // Anlegen des Steuer-Arrays, Loop über Auswertungsspanne

        var svgrect;
        var svgnested;
        var svg;
        try {


            var loopyears = [];
            var fromyear = parseInt(selrecord.fromyear);
            var toyear = parseInt(selrecord.toyear);
            var anzyears = toyear - fromyear + 1;
            var maxcount = 0;
            var mincount = null;
            var yearindex = {};
            var ind = 0;
            if (typeof selrecord.stepyear === "undefined") {
                selrecord.stepyear = 1;
            } else if (parseInt(selrecord.stepyear) < 1) {
                selrecord.stepyear = 1;
            } else {
                selrecord.stepyear = parseInt(selrecord.stepyear);
            }

            for (var iyear = fromyear; iyear <= toyear; iyear++) {
                /**
                 * hier kommt die stepyear-Filterung zum Einsatz
                 */
                if (selrecord.stepyear === 1) {
                    loopyears.push({
                        year: iyear,
                        count: 0
                    });
                    yearindex["" + iyear] = ind;
                    ind++;
                } else {
                    if (iyear === fromyear || iyear === toyear) {
                        loopyears.push({
                            year: iyear,
                            count: 0
                        });
                        yearindex["" + iyear] = ind;
                        ind++;
                    } else if (iyear % selrecord.stepyear === 0) {
                        loopyears.push({
                            year: iyear,
                            count: 0
                        });
                        yearindex["" + iyear] = ind;
                        ind++;
                    }
                }
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
            for (var iloop = 0; iloop < loopyears.length; iloop++) {
                if (mincount === null) {
                    mincount = loopyears[iloop].count;
                } else if (loopyears[iloop].count < mincount) {
                    mincount = loopyears[iloop].count;
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
                                /*
                                contenthtml += " <img src='/images/icons-png/arrow-u-black.png'";
                                contenthtml += " title='Upload *.dly'";
                                contenthtml += " class='kla1610staupl'>";
                                */
                                anznew++;
                                options.newPlots[pearl.stationid] = {
                                    /*  type: "square", */
                                    /* size: 5, */
                                    latitude: parseFloat(pearl.latitude),
                                    longitude: parseFloat(pearl.longitude),
                                    tooltip: {
                                        content: contenthtml
                                    },
                                    text: {
                                        /* */
                                    },
                                    // myText: pearl.stationname + " lon:" + pearl.longitude + " lat:" + pearl.latitude,
                                    selstationid: pearl.stationid,
                                    selsource: pearl.source,
                                    selvariable: pearl.variable
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
                    /**
                     * das erste Jahr wird speziell ausgegeben
                     * mit Initialisierung der MAP, sonst Update
                     */
                    if (icontrol === 1) {
                        kla1650ani.prepMap(options.newPlots);
                    } else {
                        if (anznew > 0 || anzdel > 0) {
                            // if (anzdel > 0 && anzdel < 2) debugger;
                            $(".mapcontainer").trigger('update', [options]);
                        }
                    }
                    // Jahreszahl über SVG
                    var sparkarray1 = [];
                    if (icontrol === 1) {
                        var svgs = document.getElementsByTagName('svg');
                        svg = document.getElementsByTagName('svg')[0];
                        $(svg).css({
                            "background-color": "lightsteelblue"
                        });
                        var svgtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        svgtext.setAttributeNS(null, 'x', '250');
                        svgtext.setAttributeNS(null, 'y', '150');
                        svgtext.setAttributeNS(null, 'font-size', '30');
                        svgtext.setAttributeNS(null, 'fill', 'red');
                        svgtext.setAttributeNS(null, 'id', 'actyear1650');
                        svgtext.setAttribute("obliquity", .5);
                        svgtext.textContent = actyear + "(" + actcount + ")";
                        svg.appendChild(svgtext);
                    } else {
                        document.getElementById('actyear1650').textContent = actyear + "(" + actcount + ")";
                    }
                    // alle Werte bereitstellen

                    if (icontrol === 1) {
                        for (var iind = 0; iind < loopyears.length; iind++) {
                            sparkarray1.push(loopyears[iind].count);
                        }
                    }

                    if (icontrol === 1) {
                        svgspark02.sparkline("mygroup", document.getElementsByTagName('svg')[0], sparkarray1, {
                            offsetX: 100,
                            offsetY: 300,
                            width: 300,
                            fullHeight: 60,
                            stroke: "green",
                            strokeOpacity: 1,
                            fill: "mistyrose",
                            chartRangeMin: mincount,
                            chartRangeMax: maxcount,
                            draggable: true,
                            interactive: true
                        });
                    }
                    svgspark02.setCursor("mygroup", document.getElementsByTagName('svg')[0], sparkarray1, {
                        offsetX: 100,
                        offsetY: 300,
                        width: 300,
                        fullHeight: 60,
                        stroke: "green",
                        strokeOpacity: 1,
                        fill: "mistyrose",
                        chartRangeMin: mincount,
                        chartRangeMax: maxcount,
                        interactive: true
                    }, icontrol - 1);

                    if (icontrol === 1) {
                        svgspark02.sparkline("mygroup1", document.getElementsByTagName('svg')[0], sparkarray1, {
                            offsetX: 100,
                            offsetY: 150,
                            width: 300,
                            fullHeight: 60,
                            stroke: "green",
                            strokeOpacity: 1,
                            fill: "mistyrose",
                            chartRangeMin: mincount,
                            chartRangeMax: maxcount,
                            draggable: true,
                            interactive: true
                        });

                    }
                    svgspark02.setCursor("mygroup1", document.getElementsByTagName('svg')[0], sparkarray1, {
                        offsetX: 100,
                        offsetY: 150,
                        width: 300,
                        fullHeight: 60,
                        stroke: "green",
                        strokeOpacity: 1,
                        fill: "mistyrose",
                        chartRangeMin: mincount,
                        chartRangeMax: maxcount,
                        interactive: true
                    }, icontrol - 1);

                    var html = "JAHR:" + actyear + " - " + actcount;
                    $("#kla1630mapsres").html(html);

                    /**
                     * Ausgabe der Graphik als gif für animiertes Gif
                     */
                    if (creategif === true) {
                        setTimeout(function () {
                            // hier wird die gif-Sicherung aktiviert
                            async.waterfall([
                                    function (cb1650E1) {
                                        var img = new Image();
                                        var svghtml = (new XMLSerializer()).serializeToString(document.querySelector('svg'));
                                        var url = "data:image/svg+xml," + encodeURIComponent(svghtml);
                                        console.log("svg-string1:" + url.length);
                                        // Onload, callback to move on to next frame
                                        img.onload = function () {
                                            gif.addFrame(img, {
                                                delay: 400,
                                                copy: true
                                            });
                                            cb1650E1(null, {
                                                error: false,
                                                message: "image1",
                                                image: img,
                                                imageurl: url,
                                                svghtml: svghtml
                                            });
                                            return;
                                        };
                                        img.src = url;
                                    },

                                    function (ret, cb1650E2) {
                                        var filename = titlerecord.projectid + new Date().toISOString().replace(/:/g, "_").replace(/-/g, "_") + ".svg";
                                        var jqxhr = $.ajax({
                                            method: "POST",
                                            crossDomain: false,
                                            url: sysbase.getServer("getbackasfile"),
                                            data: {
                                                largestring: ret.svghtml, // $("#heatpic").find("img").attr("src")  //    'data:image/gif;base64,' + encode64(encoder.stream().getData()),
                                                filename: filename
                                            }
                                        }).done(function (r1, textStatus, jqXHR) {
                                            sysbase.checkSessionLogin(r1);
                                            var ret = JSON.parse(r1);
                                            sysbase.putMessage(ret.message, 1);
                                            if (ret.error === true) {
                                                cb1650E2("error", {
                                                    error: ret.error,
                                                    message: ret.message
                                                });
                                                return;
                                            } else {
                                                cb1650E2(null, ret);
                                            }
                                        }).fail(function (err) {
                                            sysbase.putMessage(err, 1);
                                            cb1650E2("error", {
                                                error: true,
                                                message: "Daten NICHT bereitgestellt:" + err
                                            });
                                            return;
                                        }).always(function () {
                                            // nope
                                        });
                                    },
                                    function (ret, cb1650E3) {
                                        cb1650E3("Finish", {
                                            error: false,
                                            message: "image1"
                                        });
                                        return;
                                    }
                                ],
                                function (error, result) {
                                    nextyear();
                                    return;
                                });
                        }, 400);
                    } else {
                        nextyear();
                        return;
                    }
                },
                function (error) {
                    // Ende des Loops
                    if (creategif === true) {
                        gif.on('finished', function (blob) {
                            try {
                                var winurl = URL.createObjectURL(blob);
                                var win = window.open(winurl, "_blank");
                                if (typeof win !== "undefined" && win !== null) {
                                    win.focus();
                                } else {
                                    alert("Popup wird geblockt, daher keine Anzeige des animierten Gif");
                                }
                                // deleteGroup funktioniert, war nur Test
                                // svgspark02.deleteGroup("mygroup", svg);
                                console.log("Animierte worldmap fertiggestellt");
                                cb1630C({
                                    error: false,
                                    message: "Animierte worldmap fertiggestellt"
                                });
                                return;
                            } catch (err) {
                                console.log("Aninmierte worldmap Error-1:" + err);
                                cb1630C({
                                    error: true,
                                    message: "Aninmierte worldmap Error-1:" + err
                                });
                                return;
                            }
                        });
                        try {
                            gif.render();
                        } catch (err) {
                            console.log("Aninmierte worldmap Error-2:" + err);
                            cb1630C({
                                error: true,
                                message: "Aninmierte worldmap Error-2:" + err
                            });
                            return;
                        }
                    } else {
                        cb1630C({
                            error: false,
                            message: "fertig ohne gif-Ausgabe"
                        });
                        return;
                    }
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


    kla1650ani.getTitlePageData = function (clearmap, selrecord, selschema, cb1650F0) {

        async.waterfall([
                function (cb1650F1) {
                    /**
                     * Popup Prompt zur Bestätigung der kompletten Übernahme
                     * kla1400rawfullname -  $("#kla1400rawfullname").text();
                     */
                    var username = uihelper.getUsername();
                    var titleschema = {
                        entryschema: {
                            props: {
                                title: "Titelerfassung",
                                description: "",
                                type: "object", // currency, integer, datum, text, key, object
                                class: "uiefieldset",
                                properties: {
                                    projectid: {
                                        title: "Projektkürzel",
                                        type: "string", // currency, integer, datum, text, key
                                        class: "uietext",
                                        default: "",
                                        width: "50px",
                                        io: "i"
                                    },
                                    headertitle: {
                                        title: "Titel",
                                        type: "string", // currency, integer, datum, text, key
                                        class: "uietext",
                                        default: "",
                                        width: "50px",
                                        io: "i"
                                    },
                                    subtitle: {
                                        title: "Untertitel",
                                        type: "string", // currency, integer, datum, text, key
                                        class: "uietext",
                                        default: "",
                                        width: "100px",
                                        io: "i"
                                    },
                                    selection: {
                                        title: "Selektion",
                                        type: "string", // currency, integer, datum, text, key
                                        class: "uietext",
                                        default: "",
                                        width: "100px",
                                        io: "o"
                                    },
                                    comment: {
                                        title: "Kommentar",
                                        type: "string", // currency, integer, datum, text, key
                                        class: "uiearea",
                                        rows: 8,
                                        cols: 50,
                                        default: "",
                                        io: "i"
                                    },
                                    delay: {
                                        title: "Spezielle Verzögerung",
                                        type: "string", // currency, integer, datum, text, key
                                        class: "uietext",
                                        default: "",
                                        io: "i"
                                    }
                                }
                            }
                        }
                    };
                    titlerecord = {};
                    titlerecord.projectid = "Studie 4711";
                    titlerecord.headertitle = "Test-Inhalt Headertitle";
                    titlerecord.subtitle = "Test-Inhalt Subtitle";
                    /*
                     source, variablename, climatezone, continent, region, anzyears, fromyear, toyear, stepyear, height,
                    */
                    titlerecord.selection = "";
                    titlerecord.selection += " Source:" + selrecord.source;
                    titlerecord.selection += " Variable:" + selrecord.variablename;
                    titlerecord.selection += " Klimazone:" + selrecord.climatezone;
                    titlerecord.selection += " Kontinentalzone:" + selrecord.continent;
                    titlerecord.selection += " Region:" + selrecord.region;
                    titlerecord.selection += " Anzahl Jahre:" + selrecord.anzyears;
                    titlerecord.selection += " Von Jahr:" + selrecord.fromyear;
                    titlerecord.selection += " Bis Jahr:" + selrecord.toyear;
                    titlerecord.selection += " Jahresintervalle:" + selrecord.stepyear;
                    titlerecord.selection += " Höhe üdM:" + selrecord.height;

                    titlerecord.comment = "Dies ist eine langer Kommentartext";
                    titlerecord.comment += "\nDies ist eine langer Kommentartext";
                    titlerecord.comment += "\nDies ist eine langer Kommentartext";
                    var anchorHash = "#kla1650ani";
                    var title = "";
                    var pos = {
                        left: Math.round($(".col1of2").width() * 0.2),
                        top: Math.round($(".col1of2").height() * 0.15),
                        width: $(".col1of2").width() / 2,
                        height: Math.round($(".col1of2").height() * 0.75)
                    };
                    //Math.ceil($(this).offset().top + $(this).height() + 20)
                    $(document).on('popupcancel', function (evt, extraParam) {
                        evt.preventDefault();
                        $('.kla1630mapbut1').prop('disabled', false);
                        $('.kla1630mapbut2').prop('disabled', false);
                        $('.kla1630mapbut1').show();
                        $('.kla1630mapbut2').show();
                        cb1650F1("error", {
                            error: true,
                            message: "Popup abgebrochen"
                        });
                        return;
                    });
                    $(document).on('popupok', function (evt, extraParam) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        evt.stopImmediatePropagation();
                        var titleParam = JSON.parse(extraParam); // Satzstruktur!
                        titlerecord = titleParam.props;
                        cb1650F1(null, {
                            error: false,
                            message: "Popup erfasst"
                        });
                        return;
                    });
                    uientry.inputDialogX(anchorHash, pos, title, titleschema, titlerecord, function (ret1) {
                        if (ret1.error === false) {
                            sysbase.putMessage("Erfassungsdialog ist ausgegeben worden", 1);
                        } else {
                            $('.kla1630mapbut1').prop('disabled', false);
                            $('.kla1630mapbut2').prop('disabled', false);
                            $('.kla1630mapbut1').show();
                            $('.kla1630mapbut2').show();
                            cb1650F1("error", {
                                error: true,
                                message: "Der Dialog wurde nicht aufgebaut:" + ret1.message
                            });
                        }
                    });
                },
                function (ret, cb1650F2) {
                    /**
                     * Ausgabe der Titelseite
                     */
                    titlerecord.delay = titlerecord.delay || 3000;
                    if (clearmap === true) {
                        kla1650ani.prepMap({});
                    }
                    // Textboxen ausgeben
                    var svgs = document.getElementsByTagName('svg');
                    var svg = document.getElementsByTagName('svg')[0];
                    $(svg).css({
                        "background-color": "lightsteelblue"
                    });
                    var svgw = svg.getAttribute('viewBox').split(" ")[2];

                    var randi = "T" + Math.floor(Math.random() * 100000) + 1;
                    var ypegel;
                    var svgtext1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    svgtext1.setAttributeNS(null, 'x', 0); // damit die dx-Rechnung stimmt
                    svgtext1.setAttributeNS(null, 'y', '50');
                    svgtext1.setAttributeNS(null, 'width', svgw * 0.7);
                    svgtext1.setAttributeNS(null, 'font-size', '40');
                    svgtext1.setAttributeNS(null, 'fill', 'white');
                    svgtext1.setAttributeNS(null, 'id', 'hdr1' + randi);
                    svgtext1.setAttributeNS(null, 'name', "header");
                    svgtext1.textContent = titlerecord.headertitle;
                    svg.appendChild(svgtext1);
                    var tl = svgtext1.textLength.baseVal.value;
                    var dx = (svgw - tl) / 2;
                    svgtext1.setAttributeNS(null, 'dx', dx);
                    ypegel = 100;

                    var svgtext2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    svgtext2.setAttributeNS(null, 'x', 0); // damit die dx-Rechnung stimmt
                    svgtext2.setAttributeNS(null, 'y', ypegel);
                    svgtext2.setAttributeNS(null, 'width', svgw * 0.7);
                    svgtext2.setAttributeNS(null, 'font-size', '30');
                    svgtext2.setAttributeNS(null, 'fill', 'white');
                    svgtext2.setAttributeNS(null, 'id', 'hdr2' + randi);
                    svgtext2.setAttributeNS(null, 'name', "subheader");
                    svgtext2.textContent = titlerecord.subtitle;
                    svg.appendChild(svgtext2);
                    tl = svgtext2.textLength.baseVal.value;
                    dx = (svgw - tl) / 2;
                    svgtext2.setAttributeNS(null, 'dx', dx);
                    ypegel += 35;

                    var svgtext2a = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    svgtext2a.setAttributeNS(null, 'x', 0); // damit die dx-Rechnung stimmt
                    svgtext2a.setAttributeNS(null, 'y', ypegel);
                    svgtext2a.setAttributeNS(null, 'width', svgw * 0.7);
                    svgtext2a.setAttributeNS(null, 'font-size', '30');
                    svgtext2a.setAttributeNS(null, 'fill', 'white');
                    svgtext2a.setAttributeNS(null, 'id', 'hdr3' + randi);
                    svgtext2a.setAttributeNS(null, 'name', "projectid");
                    svgtext2a.textContent = titlerecord.projectid;
                    svg.appendChild(svgtext2a);
                    tl = svgtext2a.textLength.baseVal.value;
                    dx = (svgw - tl) / 2;
                    svgtext2a.setAttributeNS(null, 'dx', dx);
                    ypegel += 20;
                    dx = svgw * 0.20;
                    /**
                     * hier ist ein Zeilenvorschub notwendig
                     */
                    var seltext = kla1650ani.svg_textMultiline(svg, {
                        id: 'hdr4' + randi,
                        name: "selection",
                        width: svgw * 0.7,
                        x: 0,
                        y: ypegel + 14,
                        fontSize: 10,
                        dx: dx,
                        dy: 12
                    }, titlerecord.selection);

                    var metrics = seltext.getBoundingClientRect();
                    var mheight = metrics.height;
                    ypegel += mheight;
                    var comtext = kla1650ani.svg_textMultiline(svg, {
                        id: 'hdr5' + randi,
                        name: "comment",
                        width: svgw * 0.6,
                        x: 0,
                        y: ypegel + 14,
                        fontSize: 10,
                        dx: dx,
                        dy: 12
                    }, titlerecord.comment);
                    var metrics1 = seltext.getBoundingClientRect();
                    var mheight1 = metrics1.height;
                    ypegel += mheight1 + 10;

                    var svgtext6 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    svgtext6.setAttributeNS(null, 'x', 0); // damit die dx-Rechnung stimmt
                    svgtext6.setAttributeNS(null, 'y', ypegel + 14);
                    svgtext6.setAttributeNS(null, 'width', svgw * 0.7);
                    svgtext6.setAttributeNS(null, 'font-size', '12');
                    svgtext6.setAttributeNS(null, 'fill', 'white');
                    svgtext6.setAttributeNS(null, 'id', 'hdr6' + randi);
                    svgtext6.setAttributeNS(null, 'name', "selrecord");

                    svgtext6.textContent = JSON.stringify(selrecord);
                    svg.appendChild(svgtext6);
                    dx = svgw * 0.15;
                    svgtext6.setAttributeNS(null, 'dx', dx);

                    /**
                     * Ausgabe des gif mit den Titeldaten
                     */
                    var img = new Image();
                    var svghtml = (new XMLSerializer()).serializeToString(document.querySelector('svg'));
                    var url = "data:image/svg+xml," + encodeURIComponent(svghtml);
                    // Onload, callback to move on to next frame
                    img.onload = function () {
                        gif.addFrame(img, {
                            delay: titlerecord.delay,
                            copy: true
                        });
                        cb1650F2(null, {
                            error: false,
                            message: "Header-Image ausgegeben",
                            image: img,
                            svghtml: svghtml
                        });
                        return;
                    };
                    img.src = url;
                },
                function (ret, cb1650F3) {
                    var filename = titlerecord.projectid + new Date().toISOString().replace(/:/g, "_").replace(/-/g, "_") + ".svg";
                    var jqxhr = $.ajax({
                        method: "POST",
                        crossDomain: false,
                        url: sysbase.getServer("getbackasfile"),
                        data: {
                            largestring: ret.svghtml, // $("#heatpic").find("img").attr("src")  //    'data:image/gif;base64,' + encode64(encoder.stream().getData()),
                            filename: filename
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        sysbase.checkSessionLogin(r1);
                        var ret = JSON.parse(r1);
                        sysbase.putMessage(ret.message, 1);
                        if (ret.error === true) {
                            cb1650F3("error", {
                                error: ret.error,
                                message: ret.message
                            });
                            return;
                        } else {
                            cb1650F3(null, ret);
                        }
                    }).fail(function (err) {
                        sysbase.putMessage(err, 1);
                        cb1650F3("error", {
                            error: true,
                            message: "Daten NICHT bereitgestellt:" + err
                        });
                        return;
                    }).always(function () {
                        // nope
                    });
                }
            ],
            function (error, ret1) {
                sysbase.putMessage("Headertitle fertig:" + ret1.message, 1);
                cb1650F0({
                    error: ret1.error,
                    message: ret1.message
                });
            });
    };

    /**
     * Text-Wrappig für svg
     * container ist das svg-Target-Element, in das der Text als Element kommt
     * options mit:
     *   x - Ziel-Position im Container, Default 0
     *   y - Ziel-Position im Container, Default 0
     *   width - Ziel-Breite im Container, innere Koordinaten, Default 100
     *   fontSize - Größenangabe zur Schrift, Default 12
     * text - Text, der u.U. mehrzeilig auszugeben ist, keine Default, Abbruch, wenn leerer Text
     * return svg-text-Element, das erzeugt wurde
     */
    kla1650ani.svg_textMultiline = function (container, options, text) {
        options.lineHeight = options.lineHeight || 10;

        options.id = options.id || "T" + Math.floor(Math.random() * 100000) + 1;
        options.x = options.x || 0;
        options.y = options.y || 0;
        options.width = options.width || 200;
        options.fontSize = options.fontSize || 12;
        options.dy = options.dy || 14;
        options.dx = options.dx || 20;

        var svgtext3 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        svgtext3.setAttributeNS(null, 'x', options.x); // damit die dx-Rechnung stimmt
        svgtext3.setAttributeNS(null, 'y', options.y);
        svgtext3.setAttributeNS(null, 'width', options.width);
        svgtext3.setAttributeNS(null, 'font-size', options.fontSize);
        svgtext3.setAttributeNS(null, 'fill', 'white');
        svgtext3.setAttributeNS(null, 'id', options.id);
        svgtext3.textContent = ""; // titlerecord.selection;
        container.appendChild(svgtext3);


        var svgtest = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        svgtest.setAttributeNS(null, 'x', options.x); // damit die dx-Rechnung stimmt
        svgtest.setAttributeNS(null, 'y', options.y);
        svgtest.setAttributeNS(null, 'width', options.width);
        svgtest.setAttributeNS(null, 'font-size', options.fontSize);
        svgtest.setAttributeNS(null, 'id', options.id + "1");
        svgtest.textContent = ""; // titlerecord.selection;
        container.appendChild(svgtest);

        /* split the words into array */
        var words = text.split(' ');
        var line = '';

        /* Make a tspan for testing */
        svgtest.innerHTML = "<tspan id='PROCESSING'>" + text + "</tspan >";

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var testElem = svgtest; // document.getElementById('PROCESSING');
            /*  Add line in testElement */
            testElem.innerHTML = testLine;
            /* Messure textElement */
            var metrics = testElem.getBoundingClientRect();
            var testWidth = metrics.width;

            var metrics1 = testElem.getBBox();
            var testWidth1 = metrics1.width;
            var testWidth2 = testElem.getComputedTextLength();

            if (testWidth > options.width && n > 0) {
                svgtext3.innerHTML += '<tspan x="' + options.dx + '" dy="' + options.dy + '">' + line + '</tspan>';
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        svgtext3.innerHTML += '<tspan x="' + options.dx + '" dy="' + options.dy + '">' + line + '</tspan>';
        document.getElementById(options.id + "1").remove();
        return svgtext3;
    };




    // Klimazone
    kla1650ani.getClimatezonelinks = function (worldmaplinks) {
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
                    stroke: "CRIMSON",
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
                    stroke: "CRIMSON",
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
                    stroke: "CRIMSON",
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
                    stroke: "CRIMSON",
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
                    stroke: "CRIMSON",
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
                    stroke: "CRIMSON",
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
                    stroke: "CRIMSON",
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
    kla1650ani.fitMap = function (mapcontainer, mapname, paper) {
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
        module.exports = kla1650ani;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1650ani;
        });
    } else {
        // included directly via <script> tag
        root.kla1650ani = kla1650ani;
    }
}());