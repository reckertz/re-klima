/*global $,this,screen,document,window,module,define,root,global,self,var,async,sysbase,uihelper,kla9020fun,regression */
(function () {
    'use strict';
    var kla2110spa = {};
    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla2110spa  bekommt über getCache onestation, darin wird
     * pivotdata oder yearlats(?)
     * Regressionsanalyse über Sommer und Winter oder Jahr
     * mit Sparkline und
     */
    var actprjname;
    var fullname;
    var fulldatafilename;
    var datafilename;
    var selyears;
    var yearlats;
    var tarray = [];
    var cid;
    var cidw;
    var sgif;
    var aktyear;
    var aktvariablename;
    var selparms;
    var selstationid = null;
    var selsource = null;
    var selvariablename = null;
    var selfromyear = null;
    var seltoyear = null;
    var starecord = null; // Selektionsparameter
    var kla2110spaconfig = {};
    var savedwidth = null;
    var heatmapparms = {};
    var stationrecord;
    var yearindexarray = {};
    var matrix1 = {}; // aktive Datenmatrix, wenn gefüllt
    var histo1 = {}; // Histogramm auf Temperatur gerundet Ganzzahl
    var array1 = []; // aktives Array für d3
    var klirecords = [];

    var klihyde = {};
    var kla2110spaclock;

    var hmatrixR;
    var hmatrixL;

    var hoptionsR;
    var hoptionsL;

    var poprecord = {}; // Konfigurationsparameter mit Default-Zuweisung
    poprecord.qonly = true;
    poprecord.total = false;
    poprecord.mixed = true;
    poprecord.moon = false;
    poprecord.sunwinter = true;
    poprecord.export = false;

    kla2110spa.show = function (parameters, navigatebucket) {

        // if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {}
        if (typeof parameters !== "undefined" && parameters.length > 0) {
            selstationid = parameters[0].stationid;
            selsource = parameters[0].source;
            selvariablename = parameters[0].variablename;
            starecord = JSON.parse(parameters[0].starecord);
        } else {
            /*
            window.parent.sysbase.setCache("regstation", JSON.stringify({
                klirecords: klirecords,
                starecord: starecord,
                fromyear: klirecords[0].fromyear,
                toyear: klirecords[0].fromyear + 29
            }));
            */

            selparms = window.parent.sysbase.getCache("regstation");
            selparms = JSON.parse(selparms);
            klirecords = selparms.klirecords;
            selfromyear = selparms.fromyear;
            seltoyear = selparms.toyear;
            stationrecord = selparms.klirecords[0];
            selstationid = stationrecord.stationid;
            starecord = selparms.starecord;
            selsource = stationrecord.source;
            selvariablename = selparms.starecord.variablename;
            /*
            config:
            comment: ""
            decimals: false
            heatmaps: false
            hyde: false
            master: true
            qonly: false
            sunwinter: false
            tempchart: false
            temptable: false
            */
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
        $("body").css({
            "background-color": "lightsteelblue"
        });

        $(".content").empty();
        $(".headertitle").html("Regressionsanalyse für Station:" + selstationid + " Quelle:" + selsource);
        $(".headertitle").attr("title", "kla2110spa");
        $(".content").attr("pageid", "kla2110spa");
        $(".content").attr("id", "kla2110spa");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla2110spa")
            .append($("<input/>", {
                type: "hidden",
                id: "kla2110spa_isdirty",
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
                                parameters = {};
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
        $("#kla2110spa.content").empty();
        $("#kla2110spa.content")
            .append($("<div/>", {
                    id: "kla2110spabuttons",
                    css: {
                        width: "100%",
                        float: "left"
                    }
                })


                .append($("<button/>", {
                    html: "Super-Sparklines",
                    id: "kla2110spasup",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var username = uihelper.getUsername();
                        var popschema = {
                            entryschema: {
                                props: {
                                    title: "Abrufparameter",
                                    description: "",
                                    type: "object", // currency, integer, datum, text, key, object
                                    class: "uiefieldset",
                                    properties: {
                                        qonly: {
                                            title: "Nur 'gute Daten'",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            io: "i"
                                        },
                                        mixed: {
                                            title: "Mixed Sparklines",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            io: "i"
                                        },
                                        total: {
                                            title: "ganze Jahre",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            io: "i"
                                        },
                                        sunwinter: {
                                            title: "Sommer/Winter",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            default: false,
                                            io: "i"
                                        },
                                        export: {
                                            title: "SQL-Export",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            io: "i"
                                        },
                                        moon: {
                                            title: "Mondphasen",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
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
                        var anchorHash = "#kla2110spawrapper";
                        var title = "Super-Sparklines";
                        var pos = {
                            left: $("#kla2110spawrapper").offset().left,
                            top: window.screen.height * 0.1,
                            width: $("#kla2110spawrapper").width() * 0.60,
                            height: $("#kla2110spawrapper").height() * 0.90
                        };
                        $(document).on('popupok', function (evt, extraParam) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                            console.log(extraParam);
                            var superParam = JSON.parse(extraParam).props;
                            //kla2110spa.loadrecs(selvariablename, selsource, selstationid, superParam, function (ret) {
                            kla2110spa.paintX(selvariablename, selsource, selstationid, superParam, function (ret) {
                                return;
                            });
                            //});
                        });
                        uientry.inputDialogX(anchorHash, pos, title, popschema, poprecord, function (ret) {
                            if (ret.error === false) {} else {
                                sysbase.putMessage("Kein Abruf Super-Sparklines", 1);
                                return;
                            }
                        });
                    }
                }))


                .append($("<button/>", {
                    html: "Drucken",
                    css: {
                        "text-align": "center",
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        // sysbase.printDivAll($("#kla2110spawrapper").html());
                        // https://georgebohnisch.com/dynamically-generate-replace-html5-canvas-elements-img-elements/
                        $('canvas').each(function (e) {
                            var image = new Image();
                            var that = this;
                            image.src = this.toDataURL("image/png");
                            var w = $(this).width();
                            var h = $(this).height();
                            $(image).width(w);
                            $(image).height(h);
                            // doprintthis, wenn die Klasse schon da war
                            if ($(this).hasClass("doprintthis")) {
                                $(image).addClass("doprintthis");
                            }

                            var parspan = $(this).parent();
                            if ($(parspan).prop("tagName") === "SPAN") {
                                $(parspan).css({
                                    width: w + "px",
                                    height: h + "px"
                                });
                            }
                            $(this).replaceWith(image);
                        });
                        evt.preventDefault();
                        // https://github.com/jasonday/printThis
                        $('.doprintthis').printThis({
                            canvas: true,
                            afterPrint: function () {
                                //var lsid = $("iframe").find("[name=printIframe]").attr("id");
                                var lsid = $('iframe[name="printIframe"]').attr('id');

                                var largestring = document.getElementById(lsid).contentWindow.document.body.innerHTML;
                                uihelper.downloadfile("station.html", largestring, function (ret) {
                                    console.log("Downloaded");
                                });
                                /*
                                var canvas = document.getElementById("mycanvas");
                                var imgString = canvas.toDataURL("image/png");
                                var image1 = new Image();
                                image1.src = imgString;

                                var image = img.replace("image/png", "image/octet-stream"); //Convert image to 'octet-stream' (Just a download, really)
                                window.location.href = image;
                                */
                            }
                        });
                    }
                }))

                .append($("<button/>", {
                    html: "Aufbereiten HTML",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // evt.stopPropagation();
                        // evt.stopImmediatePropagation();
                        // https://georgebohnisch.com/dynamically-generate-replace-html5-canvas-elements-img-elements/
                        /**
                         * Konvertieren svg zu image
                         * http://bl.ocks.org/biovisualize/8187844
                         */
                        var tourl = "klaheatmap.html" + "?" + "stationid=" + selstationid + "&source=" + selsource + "&variablename=" + selvariablename;
                        var idc21 = window.parent.sysbase.tabcreateiframe(selstationid, "", "re-klima", "kla1990htm", tourl);
                        window.parent.$(".tablinks[idhash='#" + idc21 + "']").click(); // das legt erst den iFrame an
                        setTimeout(function () {

                            var actdiv = window.parent.$("#" + idc21);
                            var actiFrame = $(actdiv).find("iframe").get(0);
                            var actiFrameBody = $(actiFrame).contents();
                            /**
                             * Loop über alle doprintthis-Elemente
                             */
                            var aktwrapper = $(actiFrameBody).find(".kla1990htmwrapper");
                            $('.doprintthis').each(function (index, printelement) {
                                $(aktwrapper)
                                    .append($(printelement));
                                $(aktwrapper)
                                    .append($("<div/>", {
                                        html: "&nbsp;",
                                        css: {
                                            clear: "both"
                                        }
                                    }));
                            });

                            /**
                             * Konvertieren canvas zu image
                             */
                            $(actiFrameBody).find('canvas').each(function (index, printcanvas) {
                                var image = new Image();
                                image.src = printcanvas.toDataURL("image/png");
                                var w = $(printcanvas).width();
                                var h = $(printcanvas).height();
                                $(image).width(w);
                                $(image).height(h);
                                // doprintthis, wenn die Klasse schon da war
                                if ($(printcanvas).hasClass("doprintthis")) {
                                    $(image).addClass("doprintthis");
                                }
                                var parspan = $(printcanvas).parent();
                                if ($(parspan).prop("tagName") === "SPAN") {
                                    $(parspan).css({
                                        width: w + "px",
                                        height: h + "px"
                                    });
                                }
                                $(printcanvas).replaceWith(image);
                            });
                        }, 2000);
                        if (1 === 1) return;

                        $(actiFrame).find('svg').each(function (index, svgelement) {
                            var svgString = new XMLSerializer().serializeToString(svgelement);
                            //var canvas = document.getElementById("canvas");
                            var canvas = document.createElement("canvas");
                            var ctx = canvas.getContext("2d");
                            var DOMURL = self.URL || self.webkitURL || self;
                            var svg = new Blob([svgString], {
                                type: "image/svg+xml;charset=utf-8"
                            });
                            var url = DOMURL.createObjectURL(svg);
                            var image = new Image();
                            image.src = url;
                            var w = $(svgelement).width();
                            var h = $(svgelement).height();
                            $(image).width(w);
                            $(image).height(h);
                            // doprintthis, wenn die Klasse schon da war
                            if ($(svgelement).hasClass("doprintthis")) {
                                $(svgelement).addClass("doprintthis");
                            }
                            var parspan = $(svgelement).parent();
                            if ($(parspan).prop("tagName") === "SPAN") {
                                $(parspan).css({
                                    width: w + "px",
                                    height: h + "px"
                                });
                            }
                            $(svgelement).replaceWith(image);
                            /*
                            var img = new Image();
                            img.onload = function () {
                                ctx.drawImage(img, 0, 0);
                                var png = canvas.toDataURL("image/png");
                                document.querySelector('#png-container').innerHTML = '<img src="' + png + '"/>';
                                DOMURL.revokeObjectURL(png);
                            };
                            img.src = url;
                            */
                        });
                        window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
                    }
                }))

                .append($("<div/>", {
                    id: "kla2110spaclock",
                    float: "left",
                    css: {
                        float: "left",
                        margin: "10px"
                    }
                }))

            );
        /**
         * Beginn des initialen Aufbaus kla2110spawrapper
         */
        $("#kla2110spa.content")
            .append($("<div/>", {
                    id: "kla2110spadiv",
                    class: "kla2110spadiv"
                })
                .append($("<div/>", {
                    id: "kla2110spawrapper",
                    class: "kla2110spawrapper"
                }))
            );
        var h = $("#kla2110spa").height();
        h -= $("#kla2110spa.header").height();
        h -= $("#kla2110spabuttons").height();
        h -= $("#kla2110spa.footer").height();
        $("#kla2110spadiv")
            .css({
                "margin": "10px",
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        $("#kla2110spawrapper")
            .css({
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        console.log("kla2110spawrapper initialisiert, leer");
        $(window).on('resize', function () {
            var h = $("#kla2110spa").height();
            h -= $("#kla2110spa.header").height();
            h -= $("#kla2110spabuttons").height();
            h -= $("#kla2110spa.footer").height();
            $("#kla2110spadiv").css({
                height: h
            });
        });

        /**
         * Laden aller benötigten Daten, dann Ausgabe mit Formatieren
         * hier: Übernahme aus Parametern
         */
        var wmtit = "Auswertung für Station:";
        // isMember ? '$2.00' : '$10.00'
        wmtit += selstationid;
        wmtit += (stationrecord.stationname || "").length > 0 ? " " + stationrecord.stationname : "";
        wmtit += (stationrecord.fromyear || "").length > 0 ? " von " + stationrecord.fromyear : "";
        wmtit += (stationrecord.toyear || "").length > 0 ? " bis " + stationrecord.toyear : "";
        wmtit += (stationrecord.anzyears || 0).length > 0 ? " für " + stationrecord.anzyears + " Jahre" : "";
        wmtit += (stationrecord.region || "").length > 0 ? " Region:" + stationrecord.region : "";
        wmtit += (stationrecord.climatezone || "").length > 0 ? " Klimazone:" + stationrecord.climatezone : "";
        wmtit += (stationrecord.height || "").length > 0 ? " Höhe:" + stationrecord.height : "";
        $(".headertitle").html(wmtit);

        $("#kla2110spasup").click();

    }; // Ende show

    /**
     * kla2110spa.showall - Aufruf aller Funktionen für die Standardauswertung
     * @param {*} ret
     */
    kla2110spa.showall = function (ret) {
        return;
    };



    /**
     * paintX - gemischte Auswertung TMAX, TMIN und "all years"
     * mit Super-Sparkline auf Basis klirecords
     * superParam.sunwinter - das ist schon ein Brocken
     */
    var outrecords = [];
    kla2110spa.paintX = function (selvariablename, selsource, selstationid, superParam, callbackshm9) {
        try {
            outrecords = [];
            debugger;
            if (typeof klirecords === "undefined" || klirecords.length < 1) {
                sysbase.putMessage("Keine Daten vorhanden", 3);
                return;
            }
            /**
             * Container kla2110spawrapper aufbereiten
             * in diesen Container gehen sukzessive die Auswertungen
             */
            $("#kla2110spawrapper").empty();
            var h = screen.height;
            h -= $(".header").height();
            h -= $("#kla2110spabuttons").height();
            h -= $(".footer").height();

            var w = $("#kla2110spa.content").width();
            w -= 0; // $("#heatmap").position().left;
            w -= 0; // $("#heatmap").width();
            w -= 0; // 40;
            $("#kla2110spawrapper").css({
                overflow: "auto",
                height: h,
                width: w
            });
            var stationdata = klirecords[0];
            /**
             * Abschnitt Stammdaten zur Station
             */
            $("#kla2110spawrapper")
                .append($("<div/>", {
                        css: {
                            width: "100%",
                            overflow: "hidden"
                        }
                    })
                    .append($("<h2/>", {
                        id: "kla2110spah2",
                        text: stationdata.stationid + " " + stationdata.stationname
                    }))
                );

            /**
             * Abschnitt sparklines
             * Header zu sparkline-Tabelle
             * */
            $("#kla2110spawrapper")
                .append($("<div/>", {
                        css: {
                            width: "100%",
                            overflow: "hidden"
                        }
                    })
                    .append($("<table/>", {
                            class: "tablesorter",
                            border: "2",
                            rules: "all",
                            id: "kla2110spat1",
                            css: {
                                "max-width": w + "px"
                            }
                        })
                        .append($("<thead/>")
                            .append($("<tr/>")
                                .append($("<th/>", {
                                    html: "Jahr"
                                }))
                                .append($("<th/>", {
                                    html: "Kat"
                                }))
                                .append($("<th/>", {
                                    html: "Sparkline mit Regressionsgerade y = m*x + c"
                                }))
                                .append($("<th/>", {
                                    html: "m"
                                }))
                                .append($("<th/>", {
                                    html: "c"
                                })).append($("<th/>", {
                                    html: "r2"
                                }))
                                .append($("<th/>", {
                                    html: "min"
                                }))
                                .append($("<th/>", {
                                    html: "max"
                                }))
                                .append($("<th/>", {
                                    html: "avg"
                                }))
                            )
                        )
                        .append($("<tbody/>"))
                    )
                );

            /**
             * jedes Jahr mit allen Tagen für eine Sparkline
             */
            var varyears = [];
            var fromyear = null;
            var toyear = null;
            varyears.push({
                variablename: klirecords[0].variable,
                years: JSON.parse(klirecords[0].years)
            });
            fromyear = parseInt(klirecords[0].fromyear);
            toyear = parseInt(klirecords[0].toyear);
            if (klirecords.length > 1) {
                varyears.push({
                    variablename: klirecords[1].variable,
                    years: JSON.parse(klirecords[1].years)
                });
                var fromyear1 = parseInt(klirecords[1].fromyear);
                var toyear1 = parseInt(klirecords[1].toyear);
                if (fromyear1 < fromyear) fromyear = fromyear1;
                if (toyear1 > toyear) toyear = toyear1;
            }
            /**
             * Vorlauf: Loop über alle möglichen Jahre
             * totmin und totmax bestimmen die Dimensionierung der Sparklines!!!
             * evtl. runden auf .5/.0
             */
            var totmin = null;
            var totmax = null;
            var xcount = 0;
            fromyear = parseInt(selfromyear);
            toyear = parseInt(seltoyear);
            for (var iyear = fromyear; iyear <= toyear; iyear++) {
                for (var ivar = 0; ivar < varyears.length; ivar++) {
                    xcount++;
                    if (typeof varyears[ivar].years === "undefined" ||
                        typeof varyears[ivar].years[iyear] === "undefined") {
                        console.log("***ivar:" + ivar + " iyear:" + iyear + " undefiniert");
                        continue;
                    }
                    if (superParam.qonly === true && !uihelper.isqualityyear(varyears[ivar].years[iyear])) {
                        console.log("***ivar:" + ivar + " iyear:" + iyear + " bad data");
                        continue;
                    }
                    for (var iday = 0; iday < varyears[ivar].years[iyear].length; iday++) {
                        var temp = varyears[ivar].years[iyear][iday];
                        if (temp !== null && temp.length > 0) {
                            if (totmin === null) {
                                totmin = temp;
                            } else if (totmin > parseFloat(temp)) {
                                totmin = parseFloat(temp);
                            }
                            if (totmax === null) {
                                totmax = temp;
                            } else if (totmax < parseFloat(temp)) {
                                totmax = parseFloat(temp);
                            }
                        }
                    }
                }
            }
            superParam.totmin = totmin;
            superParam.totmax = totmax;
            /**
             * Basis-Loop über die Jahr und die Variablen
             */
            var pcount = 0; // für die sparklines
            var rowdata = [];
            for (var iyear = fromyear; iyear <= toyear; iyear++) {
                if (superParam.total === true) {
                    rowdata = []; // bekommt rowrecord[0] und [1]
                    pcount++;
                    for (var ivar = 0; ivar < varyears.length; ivar++) {
                        // Jahr ohne Daten
                        if (typeof varyears[ivar].years === "undefined" ||
                            typeof varyears[ivar].years[iyear] === "undefined") {
                            console.log("***ivar:" + ivar + " iyear:" + iyear + " undefiniert");
                            continue;
                        }
                        if (superParam.qonly === true && !uihelper.isqualityyear(varyears[ivar].years[iyear])) {
                            console.log("***ivar:" + ivar + " iyear:" + iyear + " bad data");
                            continue;
                        }
                        /**
                         * reine Vorbereitung und Initialisierung rowrecord für rowdata
                         * noch keine Algorithmen
                         */
                        var rowrecord = {};
                        rowrecord.source = selsource;
                        rowrecord.stationid = selstationid;
                        rowrecord.variablename = varyears[ivar].variablename;
                        rowrecord.year = iyear.toFixed(0);
                        rowrecord.tarray = [];
                        rowrecord.pearls = [];
                        for (var iday = 0; iday < varyears[ivar].years[iyear].length; iday++) {
                            var temp = varyears[ivar].years[iyear][iday];
                            if (temp === null || temp.length === 0) {
                                rowrecord.tarray[iday] = [iday, null]; // x, y
                                rowrecord.pearls.push(null);
                            } else {
                                var tempf = parseFloat(temp)
                                rowrecord.tarray[iday] = [iday, tempf];
                                rowrecord.pearls.push(temp);
                            }
                        }
                        rowdata.push(rowrecord);
                    }
                    kla2110spa.paintXtr("#kla2110spat1", "tot", iyear, pcount, rowdata, superParam);
                }


                if (superParam.sunwinter === true) {
                    // Sommer- und Winterrechnung - halbes Jahr
                    rowdata = []; // bekommt rowrecord[0] und [1]
                    pcount++;
                    var middleindex;
                    for (var ivar = 0; ivar < varyears.length; ivar++) {
                        /**
                         * Sommer
                         */
                        if (typeof varyears[ivar].years === "undefined" ||
                            typeof varyears[ivar].years[iyear] === "undefined") {
                            console.log("***ivar:" + ivar + " iyear:" + iyear + " undefiniert");
                            continue;
                        }
                        if (superParam.qonly === true && !uihelper.isqualityyear(varyears[ivar].years[iyear])) {
                            console.log("***ivar:" + ivar + " iyear:" + iyear + " bad data");
                            continue;
                        }
                        var rowrecord = {};
                        rowrecord.source = selsource;
                        rowrecord.stationid = selstationid;
                        rowrecord.variablename = varyears[ivar].variablename;
                        rowrecord.year = iyear.toFixed(0);
                        rowrecord.tarray = [];
                        rowrecord.pearls = [];
                        if (uihelper.isleapyear(iyear)) {
                            middleindex = 366 / 2;
                        } else {
                            middleindex = Math.floor(365 / 2);
                        }
                        for (var iday = 0; iday < middleindex; iday++) {
                            var temp = varyears[ivar].years[iyear][iday];
                            if (temp === null || temp.length === 0) {
                                rowrecord.tarray[iday] = [iday, null]; // x, y
                                rowrecord.pearls.push(null);
                            } else {
                                var tempf = parseFloat(temp);
                                rowrecord.tarray[iday] = [iday, tempf];
                                rowrecord.pearls.push(temp);
                            }
                        }
                        rowdata.push(rowrecord);
                    }
                    kla2110spa.paintXtr("#kla2110spat1", "som", iyear, pcount, rowdata, superParam);


                    /**
                     * Winter
                     */
                    rowdata = []; // bekommt rowrecord[0] und [1]
                    pcount++;
                    for (var ivar = 0; ivar < varyears.length; ivar++) {
                        /**
                         * Sommer
                         */
                        if (typeof varyears[ivar].years === "undefined" ||
                            typeof varyears[ivar].years[iyear] === "undefined") {
                            console.log("***ivar:" + ivar + " iyear:" + iyear + " undefiniert");
                            continue;
                        }
                        if (superParam.qonly === true && !uihelper.isqualityyear(varyears[ivar].years[iyear])) {
                            console.log("***ivar:" + ivar + " iyear:" + iyear + " bad data");
                            continue;
                        }
                        rowrecord = {};
                        rowrecord.source = selsource;
                        rowrecord.stationid = selstationid;
                        rowrecord.variablename = varyears[ivar].variablename;
                        rowrecord.year = iyear.toFixed(0);
                        rowrecord.tarray = [];
                        rowrecord.pearls = [];
                        var firstindex = varyears[ivar].years[iyear].length - middleindex;
                        var lastindex = varyears[ivar].years[iyear].length;
                        for (var iday = firstindex - 1; iday < lastindex; iday++) {
                            var temp = varyears[ivar].years[iyear][iday];
                            if (temp === null || temp.length === 0) {
                                rowrecord.tarray.push([iday, null]); // x, y
                                rowrecord.pearls.push(null);
                            } else {
                                var tempf = parseFloat(temp);
                                rowrecord.tarray.push([iday, tempf]);
                                rowrecord.pearls.push(temp);
                            }
                        }
                        rowdata.push(rowrecord);
                    }
                    kla2110spa.paintXtr("#kla2110spat1", "win", iyear, pcount, rowdata, superParam);
                }
            }
            /**
             * Nachlauf für die gesamte Tabelle
             */
            $(".tablesorter").tablesorter({
                theme: "blue",
                widgets: ['filter'],
                widthFixed: false,
                widgetOptions: {
                    filter_hideFilters: false,
                    filter_ignoreCase: true
                }
            }); // so funktioniert es
        } catch (err) {
            console.log(err);
            console.log(err.stack);
        }

        if (superParam.export === true) {
            //for (var irow = 0; irow < rowdata.length; irow++) {
            //    var outrecord = rowdata[irow];
            async.eachSeries(outrecords, function (outrecord, nextoutrecord) {
                delete outrecord.tarray;
                delete outrecord.points;
                outrecord.pearls = outrecord.pearls.join(",");
                var selfields = {
                    source: outrecord.source,
                    stationid: outrecord.stationid,
                    year: outrecord.year,
                    rkat: outrecord.rkat,
                    variable: outrecord.variablename
                };
                var updfields = {};
                updfields["$setOnInsert"] = {
                    source: outrecord.source,
                    stationid: outrecord.stationid,
                    year: outrecord.year,
                    rkat: outrecord.rkat,
                    variable: outrecord.variablename
                };
                delete outrecord.source;
                delete outrecord.stationid;
                delete outrecord.year;
                delete outrecord.rkat;
                delete outrecord.variablename;
                updfields["$set"] = outrecord;
                uihelper.setOneRecord(selfields, updfields, "setonerecord", "KLISTA1", function (ret) {
                    nextoutrecord();
                    return;
                });
            }, function (err) {
                sysbase.putMessage("Daten geschrieben");
                callbackshm9({
                    error: false,
                    message: "Daten geschrieben"
                });
                return;
            });
        } else {
            callbackshm9({
                error: false,
                message: "keine Daten geschrieben"
            });
            return;
        }
    }; // ende paintX

    /**
     * kla2110spa.paintXtr - Ausgabe der Zeilen zu rowdata[0] und rowdata[1]
     * max drei Zeilen für total, summer-up, winter-dwn
     * @param {*} trcontainer
     * @param {*} rowdata
     * @param {*} superParam
     */
    kla2110spa.paintXtr = function (trcontainer, rkat, iyear, pcount, rowdata, superParam) {
        /**
         * Vorlauf: regressionsrechnung
         */
        var totmin = superParam.totmin;
        var totmax = superParam.totmax;
        for (var irow = 0; irow < rowdata.length; irow++) {
            var rowrecord = rowdata[irow];
            rowrecord.year = iyear;
            rowrecord.rkat = rkat;
            var cleanarray0 = rowrecord.pearls.map(function (pearl) {
                if (pearl === null) {
                    return null;
                } else {
                    return parseFloat(pearl);
                }
            });
            var cleanarray = cleanarray0.filter(function (cval) {
                if (cval !== null) cval = parseFloat(cval);
                return cval !== null;
            });
            rowrecord.tmin = cleanarray.reduce(function (min, p) {
                return p < min ? p : min;
            }).toFixed(1);
            rowrecord.tmax = cleanarray.reduce(function (max, p) {
                return p > max ? p : max;
            }).toFixed(1);
            rowrecord.tcount = cleanarray.length;
            rowrecord.tsum = cleanarray.reduce(function (total, num) {
                return total + num;
            });
            rowrecord.tavg = (rowrecord.tsum / rowrecord.tcount).toFixed(2);
            rowrecord.tsum = rowrecord.tsum.toFixed(1);
            var result = regression.linear(rowrecord.tarray, {
                order: 2,
                precision: 3,
            });
            var gradient = result.equation[0];
            var yIntercept = result.equation[1];
            var r2 = result.r2;
            rowrecord.gradient = (gradient).toFixed(3);
            rowrecord.yIntercept = yIntercept.toFixed(1);
            rowrecord.r2 = (r2).toFixed(3);
            rowrecord.points = result.points;
            array1.push({
                temp: r2,
                gradient: gradient
            });
            if (superParam.export === true) {
                for (var irowdata = 0; irowdata < rowdata.length; irowdata++) {
                    outrecords.push(rowrecord);
                }
            }
        }
        /**
         * Bearbeitung: Ausgabe in Tabellenzeile
         */
        // hier wird eine Tabellenzeile für TMIN und TMAX ausgegeben
        var rowtit = iyear.toFixed(0);
        if (rowdata.length > 0) {
            /**
             * neue eine Variable = eine einfache Zeile
             */
            $("#kla2110spat1")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: rowtit
                    }))
                    .append($("<td/>", {
                        id: 'var' + pcount,
                        html: rkat + "<br>" + rowdata[0].variablename
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'spark' + pcount,
                            css: {
                                margin: "5px",
                                float: "left",
                                "background-color": "yellow"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'grad' + pcount,
                            html: rowdata[0].gradient,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'inter' + pcount,
                            html: rowdata[0].yIntercept,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'r2' + pcount,
                            html: rowdata[0].r2,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: rowdata[0].tmin,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: rowdata[0].tmax,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'avg' + pcount,
                            html: rowdata[0].tavg,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                );


            var defaultpixel = 3;
            if (rowdata[0].pearls.length > 350) defaultpixel = 2;
            var sparkid = "#spark" + pcount;
            $(sparkid).sparkline(rowdata[0].pearls, {
                type: 'line',
                height: 60,
                fillColor: false,
                defaultPixelsPerValue: defaultpixel,
                chartRangeMin: totmin,
                chartRangeMax: totmax,
                lineColor: "red"
                /* composite: true */
            });

            if (typeof rowdata[0].points !== "undefined") {
                var sparkpoints = [];
                for (var i = 0; i < rowdata[0].points.length; i++) {
                    sparkpoints.push(rowdata[0].points[i][1]);
                }
                $(sparkid).sparkline(sparkpoints, {
                    type: 'line',
                    height: 60,
                    fillColor: false,
                    defaultPixelsPerValue: defaultpixel,
                    chartRangeMin: totmin,
                    chartRangeMax: totmax,
                    lineColor: "black",
                    composite: true
                });
            }
        }
        if (rowdata.length >= 2) {
            /**
             * Doppelzeile, wird spannend - anfügen an bestehende span-Bereiche
             * mit id aus spark, grad, inter, r2, min, max, avg und pcount als Suffix
             */
            try {
                var html = "";

                html = $("#var" + pcount).html();
                html += "<br>" + rowdata[1].variablename;
                $("#var" + pcount).html(html);

                html = $("#grad" + pcount).html();
                html += "<br>" + rowdata[1].gradient;
                $("#grad" + pcount).html(html);

                html = $("#inter" + pcount).html();
                html += "<br>" + rowdata[1].yIntercept;
                $("#inter" + pcount).html(html);

                html = $("#r2" + pcount).html();
                html += "<br>" + rowdata[1].r2;
                $("#r2" + pcount).html(html);

                html = $("#min" + pcount).html();
                html += "<br>" + rowdata[1].tmin;
                $("#min" + pcount).html(html);

                html = $("#max" + pcount).html();
                html += "<br>" + rowdata[1].tmax;
                $("#max" + pcount).html(html);

                html = $("#avg" + pcount).html();
                html += "<br>" + rowdata[1].tavg;
                $("#avg" + pcount).html(html);

                var defaultpixel = 3;
                if (rowdata[0].pearls.length > 350) defaultpixel = 2;
                var sparkid = "#spark" + pcount;
                $(sparkid).sparkline(rowdata[1].pearls, {
                    type: 'line',
                    height: 60,
                    fillColor: false,
                    defaultPixelsPerValue: defaultpixel,
                    chartRangeMin: totmin,
                    chartRangeMax: totmax,
                    lineColor: "blue",
                    composite: true
                });
            } catch (err) {

            }
        }
        /**
         * Vollmond als Bar-Chart zu iyear und pcount mit uihelper.moonphase
         * returns phase, name
         * 0 = Neumond => -8 in der Graphik
         * 4 = Vollmond => +8
         */
        if (superParam.moon === true) {
            var moonpearls = [];
            var anztage = 365;
            if (uihelper.isleapyear(iyear)) {
                anztage = 366;
            }
            for (var iday = 0; iday < anztage; iday++) {
                var mday = uihelper.fromTTT2MMTT(iyear, iday);
                var moon = uihelper.moonphase(iyear, mday.month, mday.day);
                if (moon.phase === 0) {
                    moonpearls.push("-8");
                } else if (moon.phase === 4) {
                    moonpearls.push("8");
                    // if (iyear === 1968) console.log("1968:" + iday + "=>" + mday.day + "." + mday.month + "=>" + moon.phase);
                } else {
                    moonpearls.push(null);
                }
            }
            var defaultpixel = 3;
            if (anztage > 350) defaultpixel = 2;
            var sparkid = "#spark" + pcount;
            $(sparkid).sparkline(moonpearls, {
                type: 'bar',
                height: 60,
                barColor: "red",
                negBarColor: "blue",
                barWidth: defaultpixel,
                barSpacing: 0,
                fillColor: false,
                defaultPixelsPerValue: defaultpixel,
                chartRangeMin: totmin,
                chartRangeMax: totmax,
                composite: true
            });
        }
    }; // paintXtr

    /**
     * Einblendung Stopuhr wärend langer AJAX-Aufrufe
     */
    kla2110spa.showclock = function (clockcontainer) {
        // Update the count down every 1 second
        if (typeof clockcontainer === "string") {
            if (!clockcontainer.startsWith("#")) clockcontainer = "#" + clockcontainer;
        }
        if ($('#kliclock', clockcontainer).length === 0) {
            $(clockcontainer)
                .append($("<span/>", {
                    id: "kliclock",
                    class: "kliclock",
                    html: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
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
            $("#kliclock").text(hours + "h " + minutes + "m " + seconds + "s " + " . . . loading");
        }, 1000);
        return xclock;
    };

    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla2110spa;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla2110spa;
        });
    } else {
        // included directly via <script> tag
        root.kla2110spa = kla2110spa;
    }
}());