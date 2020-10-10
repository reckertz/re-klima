/*global $,this,screen,Image,Chart,document,window,module,define,root,global,self,var,async,sysbase,uihelper,kla9020fun,regression */
(function () {
    'use strict';
    var kla1627dec = {};
    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1627dec   Auszählung Dezimalstelle je Wochentag
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
    var kla1627decconfig = {};
    var savedwidth = null;
    var heatmapparms = {};
    var stationrecord;
    var yearindexarray = {};
    var matrix1 = {}; // aktive Datenmatrix, wenn gefüllt
    var histo1 = {}; // Histogramm auf Temperatur gerundet Ganzzahl
    var array1 = []; // aktives Array für d3
    var klirecords = [];

    var klihyde = {};
    var kla1627decclock;

    var hmatrixR;
    var hmatrixL;

    var hoptionsR;
    var hoptionsL;

    var poprecord = {}; // Konfigurationsparameter mit Default-Zuweisung

    kla1627dec.show = function (parameters, navigatebucket) {
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
        $(".headertitle").attr("title", "kla1627dec");
        $(".content").attr("pageid", "kla1627dec");
        $(".content").attr("id", "kla1627dec");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1627dec")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1627dec_isdirty",
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
        $("#kla1627dec.content").empty();
        $("#kla1627dec.content")
            .append($("<div/>", {
                    id: "kla1627decbuttons",
                    css: {
                        width: "100%",
                        float: "left"
                    }
                })
                .append($("<button/>", {
                    html: "Decimals/Weekday",
                    id: "kla1627decsup",
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
                                        fromyear: {
                                            title: "Von Jahr",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uietext",
                                            io: "i"
                                        },
                                        toyear: {
                                            title: "Bis Jahr",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uietext",
                                            io: "i"
                                        }
                                    }
                                }
                            }
                        };
                        var anchorHash = "#kla1627decwrapper";
                        var title = "Super-Sparklines";
                        var pos = {
                            left: $("#kla1627decwrapper").offset().left,
                            top: window.screen.height * 0.1,
                            width: $("#kla1627decwrapper").width() * 0.60,
                            height: $("#kla1627decwrapper").height() * 0.90
                        };
                        $(document).on('popupok', function (evt, extraParam) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                            console.log(extraParam);
                            poprecord = JSON.parse(extraParam).props;
                            selfromyear = poprecord.fromyear;
                            seltoyear = poprecord.toyear;
                            kla1627dec.paintDec(selvariablename, selsource, selstationid, function (ret) {
                                return;
                            });
                        });
                        if (Object.keys(poprecord).length === 0) {
                            poprecord.fromyear = selfromyear;
                            poprecord.toyear = seltoyear;
                        }
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
                        // sysbase.printDivAll($("#kla1627decwrapper").html());
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
                    }
                }))

                .append($("<div/>", {
                    id: "kla1627decclock",
                    float: "left",
                    css: {
                        float: "left",
                        margin: "10px"
                    }
                }))

            );
        /**
         * Beginn des initialen Aufbaus kla1627decwrapper
         */
        $("#kla1627dec.content")
            .append($("<div/>", {
                    id: "kla1627decdiv",
                    class: "kla1627decdiv"
                })
                .append($("<div/>", {
                    id: "kla1627decwrapper",
                    class: "kla1627decwrapper"
                }))
            );
        var h = $("#kla1627dec").height();
        h -= $("#kla1627dec.header").height();
        h -= $("#kla1627decbuttons").height();
        h -= $("#kla1627dec.footer").height();
        $("#kla1627decdiv")
            .css({
                "margin": "10px",
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        $("#kla1627decwrapper")
            .css({
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        console.log("kla1627decwrapper initialisiert, leer");
        $(window).on('resize', function () {
            var h = $("#kla1627dec").height();
            h -= $("#kla1627dec.header").height();
            h -= $("#kla1627decbuttons").height();
            h -= $("#kla1627dec.footer").height();
            $("#kla1627decdiv").css({
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
        wmtit += " von " + selfromyear;
        wmtit += " bis " + seltoyear;
        wmtit += (stationrecord.anzyears || 0).length > 0 ? " für " + stationrecord.anzyears + " Jahre" : "";
        wmtit += (stationrecord.region || "").length > 0 ? " Region:" + stationrecord.region : "";
        wmtit += (stationrecord.climatezone || "").length > 0 ? " Klimazone:" + stationrecord.climatezone : "";
        wmtit += (stationrecord.height || "").length > 0 ? " Höhe:" + stationrecord.height : "";
        $(".headertitle").html(wmtit);

        // $("#kla1627decsup").click();
        kla1627dec.paintDec(selvariablename, selsource, selstationid, function (ret) {
            return;
        });
    }; // Ende show

    /**
     * paintDec - gemischte Auswertung TMAX, TMIN und "all years"
     * mit Super-Sparkline auf Basis klirecords
     * superParam.sunwinter - das ist schon ein Brocken
     */
    var outrecords = [];
    kla1627dec.paintDec = function (selvariablename, selsource, selstationid, callbackshm9) {
        try {
            outrecords = [];
            if (typeof klirecords === "undefined" || klirecords.length < 1) {
                sysbase.putMessage("Keine Daten vorhanden", 3);
                return;
            }
            /**
             * Container kla1627decwrapper aufbereiten
             * in diesen Container gehen sukzessive die Auswertungen
             */
            $("#kla1627decwrapper").empty();
            var h = screen.height;
            h -= $(".header").height();
            h -= $("#kla1627decbuttons").height();
            h -= $(".footer").height();

            var w = $("#kla1627dec.content").width();
            w -= 0; // $("#heatmap").position().left;
            w -= 0; // $("#heatmap").width();
            w -= 0; // 40;
            $("#kla1627decwrapper").css({
                overflow: "auto",
                height: h,
                width: w
            });
            var stationdata = klirecords[0];
            if (stationdata.variable !== selvariablename) {
                stationdata = klirecords[1];
            }
            /**
             * Abschnitt Stammdaten zur Station
             */
            var htext = stationdata.stationid + " " + stationdata.stationname;
            htext += " von " + selfromyear;
            htext += " bis " + seltoyear;
            $("#kla1627decwrapper")
                .append($("<div/>", {
                        css: {
                            width: "100%",
                            overflow: "hidden"
                        }
                    })
                    .append($("<h2/>", {
                        id: "kla1627dech2",
                        text: htext
                    }))
                );

            var divid = "div" + Math.floor(Math.random() * 100000) + 1;
            var chartid = divid + "c";
            $("#kla1627decwrapper")
                .append($("<div/>", {
                        id: divid,
                        css: {
                            float: "left",
                            overflow: "hidden",
                            "background-color": "white",
                            margin: "20px",
                            width: "45%"
                        }
                    })
                    .append($("<h3/>", {
                        text: "Histogramm 1. Dezimalstelle/Wochentag " + selvariablename,
                        class: "doprintthis"
                    }))
                );


            /**
             * Abschnitt sparklines
             * Header zu sparkline-Tabelle
             * */
            $("#kla1627decwrapper")
                .append($("<div/>", {
                        css: {
                            width: "45%",
                            float: "left",
                            margin: "20px",
                            overflow: "hidden"
                        }
                    })
                    .append($("<table/>", {
                            class: "tablesorter",
                            border: "2",
                            rules: "all",
                            id: "kla1627dect1",
                            css: {
                                width: "100%"
                            }
                        })
                        .append($("<thead/>")
                            .append($("<tr/>")
                                .append($("<th/>", {
                                    html: "Tag"
                                }))
                                .append($("<th/>", {
                                    name: "0",
                                    html: "0"
                                }))
                                .append($("<th/>", {
                                    name: "1",
                                    html: "1"
                                }))
                                .append($("<th/>", {
                                    name: "2",
                                    html: "2"
                                }))
                                .append($("<th/>", {
                                    name: "3",
                                    html: "3"
                                }))
                                .append($("<th/>", {
                                    name: "4",
                                    html: "4"
                                }))
                                .append($("<th/>", {
                                    name: "5",
                                    html: "5"
                                }))
                                .append($("<th/>", {
                                    name: "6",
                                    html: "6"
                                }))
                                .append($("<th/>", {
                                    name: "7",
                                    html: "7"
                                }))
                                .append($("<th/>", {
                                    name: "8",
                                    html: "8"
                                }))
                                .append($("<th/>", {
                                    name: "9",
                                    html: "9"
                                }))
                            )
                        )
                        .append($("<tbody/>"))
                    )
                );

            /**
             * jedes Jahr mit allen Tagen für eine Sparkline
             */
            var years = JSON.parse(stationrecord.years);
            var fromyear = parseInt(selfromyear);
            var toyear = parseInt(seltoyear);
            /**
             * Basis-Loop über die Jahr und die Variablen
             */
            var pcount = 0; // für die sparklines
            // var rowdata = Array(10).fill(Array(10).fill(0)); ist ein Fehler in der Referenz!!!
            var rowdata = [];
            for (var irow = 0; irow < 7; irow++) { // Wochen
                rowdata[irow] = new Array(10).fill(0); // Dezimalstelle
            }
            var ccount = 0;
            for (var iyear = fromyear; iyear <= toyear; iyear++) {
                var syear = "" + iyear;
                if (typeof years[syear] !== "undefined") {
                    for (var iday = 0; iday < years[syear].length; iday++) {

                        var temp = years[syear][iday];
                        if (temp === null || isNaN(temp)) {
                            continue;
                        }
                        var numt = temp.split(".");
                        var inum = 0;
                        if (numt.length === 2) {
                            inum = parseInt(numt[1].substr(0, 1));
                        }

                        var mmtt = uihelper.fromTTT2MMTT(iyear, iday); // 1-based day, month in Object
                        var actdate = new Date(syear, mmtt.month - 1, mmtt.day);
                        var dayofweek = actdate.getDay(); // 0 = Sonntag!!!
                        ccount++;
                        rowdata[dayofweek][inum]++;
                    }
                }
            }
            /**
             * Nachlauf für die gesamte Tabelle
             */
            console.log(JSON.stringify(rowdata));
            for (var wday = 0; wday < 7; wday++) {
                $("#kla1627dect1 tbody")
                    .append($("<tr/>")
                        .append($("<td/>", {
                            html: wday + " " + uihelper.getWeekDayText(wday)
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][0]
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][1]
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][2]
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][3]
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][4]
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][5]
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][6]
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][7]
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][8]
                        }))
                        .append($("<td/>", {
                            html: rowdata[wday][9]
                        }))
                    );
            }
            $(".tablesorter").tablesorter({
                theme: "blue",
                widgets: ['filter'],
                widthFixed: false,
                widgetOptions: {
                    filter_hideFilters: false,
                    filter_ignoreCase: true
                }
            }); // so funktioniert es

            /**
             * und jetzt noch die Graphik hinterher
             */

            $("#" + divid)
                .append($("<canvas/>", {
                    id: chartid,
                    class: "doprintthis",
                    selvariable: selvariablename,
                    css: {
                        "text-align": "center"
                    }
                }));

            var ctx = document.getElementById(chartid).getContext('2d');
            //Chart.defaults.global.plugins.colorschemes.override = true;
            //Chart.defaults.global.legend.display = true;
            // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
            var yAxesticks = [];
            var newArr;
            var config = {
                type: 'line',
                data: {
                    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                    datasets: [],
                    backgroundColor: "yellow"
                },
                options: {
                    plugins: {
                        colorschemes: {
                            scheme: 'brewer.Paired12'
                        }
                    },
                    mytype: selvariablename
                }
            };
            for (var wday = 0; wday < 7; wday++) {
                config.data.datasets.push({
                    label: wday + " " + uihelper.getWeekDayText(wday),
                    data: rowdata[wday],
                    /* backgroundColor: "red", */
                    /* borderColor: "red", */
                    fill: false,
                    borderWidth: 2
                });
            }
            window.mychart = new Chart(ctx, config);

            callbackshm9({
                error: false,
                message: "keine Daten geschrieben"
            });
            return;
        } catch (err) {
            console.log(err);
            console.log(err.stack);
        }




    }; // ende paintDec



    /**
     * Einblendung Stopuhr während langer AJAX-Aufrufe
     */
    kla1627dec.showclock = function (clockcontainer) {
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
        module.exports = kla1627dec;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1627dec;
        });
    } else {
        // included directly via <script> tag
        root.kla1627dec = kla1627dec;
    }
}());