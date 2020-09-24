/*global $,this,screen,document,window,module,define,root,global,self,var,async,sysbase,uihelper,kla9020fun,regression */
(function () {
    'use strict';
    var kla1625shm = {};
    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1625shm  bekommt über getCache pivotdata oder yearlats(?)
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
    var tarray = [];
    var cid;
    var cidw;
    var sgif;
    var aktyear;
    var aktvariablename;

    var myCharts = {};

    var selparms;
    var selstations = []; // die Massenabfrage kann je station unterschiedliche source haben!!!,
    // daher Strukur mit selstationid und selsource je Eintrag
    var selstationid = null;
    var selsource = null;
    var selvariablename = null;
    var starecord = null; // Selektionsparameter
    var kla1625shmconfig = {};
    var savedwidth = null;
    var heatmapparms = {};
    var stationrecord;
    var yearindexarray = {};
    var matrix1 = {}; // aktive Datenmatrix, wenn gefüllt
    var histo1 = {}; // Histogramm auf Temperatur gerundet Ganzzahl
    var array1 = []; // aktives Array für d3
    var klirecords = [];

    var klihyde = {};
    var kla1625shmclock;

    var hmatrixR;
    var hmatrixL;

    var hoptionsR;
    var hoptionsL;

    var poprecord = {}; // Konfigurationsparameter mit Default-Zuweisung
    poprecord.qonly = true;
    poprecord.total = false;
    poprecord.mixed = true;
    poprecord.moon = false;
    poprecord.tempdistribution = true;
    poprecord.export = false;

    kla1625shm.show = function (parameters, navigatebucket) {
        // if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {}

        if (typeof parameters !== "undefined" && parameters.length > 0) {
            selstationid = parameters[0].stationid;
            selsource = parameters[0].source;
            selvariablename = parameters[0].variablename;
            starecord = JSON.parse(parameters[0].starecord);
        } else {
            /**
             * Prüfen, ob allin - Abarbeiten aller stationid aus der Liste
             */
            selparms = window.parent.sysbase.getCache("onestation");
            selparms = JSON.parse(selparms);
            selstations = selparms.selstations || [];
            selstationid = selparms.stationid;
            starecord = selparms.starecord;
            selsource = selparms.starecord.source;
            selvariablename = selparms.starecord.variablename;
            /*
            config:
            comment: ""
            decimals: false
            heatmaps: false
            hyde: false
            master: true
            qonly: false
            tempdistribution: false
            tempchart: false
            temptable: false
            */
            kla1625shmconfig = $.extend(true, {
                comment: "",
                decimals: true,
                heatmaps: true,
                hyde: true,
                master: true,
                qonly: true,
                tempdistribution: true,
                tempchart: true,
                temptable: true,
                allin: false,
                autoload: false

            }, selparms.config);

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
        $(".headertitle").html("Heatmap für Station:" + selstationid + " Quelle:" + selsource);
        $(".headertitle").attr("title", "kla1625shm");
        $(".content").attr("pageid", "kla1625shm");
        $(".content").attr("id", "kla1625shm");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1625shm")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1625shm_isdirty",
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
        $("#kla1625shm.content").empty();
        $("#kla1625shm.content")
            .append($("<div/>", {
                id: "kla1625shmbuttons",
                css: {
                    width: "100%",
                    float: "left"
                }
            }));

        if (kla1625shmconfig.allin === false) {

            $("#kla1625shmbuttons")
                .append($("<button/>", {
                    html: "Google-Maps",
                    id: "kla1625shmgoogle",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        //var gurl = "https://www.google.com/maps/dir/";
                        var gurl = "https://www.google.com/maps/search/?api=1&query=";
                        gurl += stationrecord.latitude;
                        gurl += ",";
                        gurl += stationrecord.longitude;
                        var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                        window.open(gurl, wname, 'height=' + screen.height + ', width=' + screen.width);

                    }
                }))
                .append($("<button/>", {
                    html: "Leaflet-Raster",
                    id: "kla1625shmleaf",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var gurl = "klaleaflet.html";
                        gurl += "?";
                        gurl += "latitude=" + encodeURIComponent(stationrecord.latitude);
                        gurl += "&";
                        gurl += "longitude=" + encodeURIComponent(stationrecord.longitude);
                        var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                        window.open(gurl, wname, 'height=' + screen.height + ', width=' + screen.width);

                    }
                }));
        }

        // Auswahl selvariablename
        /*
        .append($("<button/>", {
            html: "Sparklines/Periode anzeigen",
            css: {
                float: "left",
                margin: "10px"
            },
            click: function (evt) {
                evt.preventDefault();
                kla1625shm.paintS(selvariablename, selsource, selstationid, matrix1);
            }
        }))
        */
        /*
         .append($("<button/>", {
             html: "Sparklines/Jahr anzeigen",
             css: {
                 float: "left",
                 margin: "10px"
             },
             click: function (evt) {
                 evt.preventDefault();
                 // stationrecord - heatworld
                 kla1625shm.paintT(selvariablename, selsource, selstationid, matrix1);
             }
         }))
         */

        $("#kla1625shmbuttons")

            .append($("<button/>", {
                html: "Super-Heatmaps",
                id: "kla1625shmsuper",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // stationrecord - heatworld
                    async.waterfall([
                        function (cb1625a) {
                            // brutal auf die rechte Seite
                            $("#kla1625shmwrapper").empty();
                            $("#kla1625shmwrapper").css({
                                overflow: "auto"
                            });
                            $("#kla1625shmwrapper")
                                .append($("<div/>", {
                                    id: "kla1625shmd1",
                                    css: {
                                        width: $("#heatmap").width(),
                                        height: $("#heatmap").height(),
                                        float: "left"
                                    }
                                }));
                            var hmoptions = {
                                minmax: false,
                                minmaxhistogram: false,
                                cbuckets: false,
                                hyde: false
                            };
                            kla1625shm.kliheatmap2("kla1625shmd1", "TMAX", selsource, selstationid, starecord, hmoptions, function (ret) {
                                cb1625a(null);
                            });
                        },
                        function (cb1625b) {
                            $("#kla1625shmwrapper")
                                .append($("<div/>", {
                                    id: "kla1625shmd2",
                                    css: {
                                        width: $("#heatmap").width(),
                                        height: $("#heatmap").height(),
                                        float: "left"
                                    }
                                }));
                            var hmoptions = {
                                minmax: false,
                                minmaxhistogram: false,
                                cbuckets: false,
                                hyde: false
                            };
                            kla1625shm.kliheatmap2("kla1625shmd2", "TMIN", selsource, selstationid, starecord, hmoptions, function (ret) {
                                cb1625b(null);
                            });
                        },
                        function (cb1625c) {
                            /**
                             * für TMAX min und max bestimmen, Histogramm als Sparkline
                             */
                            $("#kla1625shmwrapper")
                                .append($("<div/>", {
                                    id: "kla1625shmd3",
                                    css: {
                                        width: $("#heatmap").width(),
                                        height: $("#heatmap").height(),
                                        float: "left"
                                    }
                                }));
                            var hmoptions = {
                                minmax: true,
                                minmaxhistogram: true,
                                cbuckets: true,
                                hyde: true
                            };
                            kla1625shm.kliheatmap2("kla1625shmd3", "TMAX", selsource, selstationid, starecord, hmoptions, function (ret) {
                                // über ret kommen hier options in ret zurück
                                /*
                                    error: false,
                                    message: "Heatmap ausgegeben",
                                    matrix: matrix1,
                                    options: uihelper.cloneObject(hmoptions),
                                    hoptions: ret.hoptions,
                                    histo: hmoptions.histo,
                                    temparray: ret.temparray,
                                    matrix: hmatrix
                                */
                                cb1625c(null);
                            });
                        },
                        function (cb1625d) {
                            /**
                             * für TMIN min und max bestimmen, Histogramm als Sparkline
                             */
                            $("#kla1625shmwrapper")
                                .append($("<div/>", {
                                    id: "kla1625shmd4",
                                    css: {
                                        width: $("#heatmap").width(),
                                        height: $("#heatmap").height(),
                                        float: "left"
                                    }
                                }));
                            var hmoptions = {
                                minmax: true,
                                minmaxhistogram: true,
                                cbuckets: true,
                                hyde: false
                            };
                            kla1625shm.kliheatmap2("kla1625shmd4", "TMIN", selsource, selstationid, starecord, hmoptions, function (ret) {
                                cb1625d(null);
                            });
                        }

                    ]);
                }
            }))


            /*
            .append($("<button/>", {
                html: "Bucketanalyse (10)",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // stationrecord - heatworld
                    kla1625shm.bucketAnalysis(10, selvariablename, selsource, selstationid);
                }
            }))
            */



            /*
            .append($("<button/>", {
                html: "Sparklines-Kelvin",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    var matrix2 = uihelper.cloneObject(matrix1);
                    for (var i1 = 0; i1 < matrix2.data.length; i1++) {
                        for (var i2 = 0; i2 < matrix2.data[i1].length; i2++) {
                            var temp1 = matrix2.data[i1][i2];
                            if (temp1 !== null) {
                                var tkelvin = (parseFloat(temp1) + 273).toFixed(1);
                                matrix2.data[i1][i2] = tkelvin;
                            }
                        }
                    }
                    kla1625shm.paintT(selvariablename, selsource, selstationid, matrix2);
                }
            }))
            */


            .append($("<button/>", {
                html: "Super-Sparklines",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    var username = uihelper.getUsername();
                    window.parent.sysbase.setCache("regstation", JSON.stringify({
                        starecord: starecord,
                        klirecords: klirecords,
                        fromyear: klirecords[0].fromyear,
                        toyear: "" + (parseInt(klirecords[0].fromyear) + 29)
                    }));
                    var tourl = "klaheatmap.html" + "?" + "stationid=" + klirecords[0].stationid + "&source=" + klirecords[0].source + "&variablename=" + klirecords[0].variable;
                    var tabname = klirecords[0].stationname;
                    var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1626reg", tourl);
                    window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
                }
            }))


            /*
            .append($("<button/>", {
                html: "Sparklines-Download",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // es müssen die canvas modifiziert werden, so dass dataUrl möglich wird
                    var canliste = $('#kla1625shmt1 tbody tr td span canvas');
                    $(canliste).each(function (index, element) {
                        var dataurl = element.toDataURL('image/png');
                        var par = $(element).parent();
                        $(par).append($("<img/>", {
                            src: dataurl
                        }));
                        $(element).remove();
                    });
                    // Filterzeile clone und löschen
                    // wenn hasClass u.a. hasFilters
                    var clonerow;
                    if ($("#kla1625shmt1").hasClass("hasFilters")) {
                        clonerow = $("#kla1625shmt1 thead tr").eq(1).clone();
                        $("#kla1625shmt1 thead tr").eq(1).remove();
                    }
                    var elHtml = "";
                    elHtml += "<html>";
                    elHtml += "<head>";
                    elHtml += "<meta charset='UTF-8'>";
                    elHtml += "<style type='text/css'> @page { size: 29.5cm 21.0cm; margin-left: 1cm; margin-right: 1cm }</style>";
                    elHtml += "</head>";
                    elHtml += "<body style='font-family:Calibri,Arial,Helvetica,sans-serif;font-size:11px'>";
                    elHtml += "<h2>" + $("#kla1625shmh2").text() + "</h2>";
                    elHtml += "<p style='page-break-before: always'>";
                    var oldwidth = $("#kla1625shmt1").width();
                    $("#kla1625shmt1").width("100%");
                    elHtml += $("#kla1625shmt1").parent().html();
                    elHtml += "</body>";
                    elHtml += "<html>";
                    // Filterzeile clone wieder einfügen
                    if ($("#kla1625shmt1").hasClass("hasFilters")) {
                        $("#kla1625shmt1 thead").append(clonerow);
                    }
                    var filename = "sparklines.html";
                    if (elHtml.length > 100) {
                        var jqxhr = $.ajax({
                            method: "POST",
                            crossDomain: false,
                            url: sysbase.getServer("getbackasfile"),
                            data: {
                                timeout: 10 * 60 * 1000,
                                largestring: elHtml,
                                filename: filename
                            }
                        }).done(function (r1, textStatus, jqXHR) {
                            sysbase.checkSessionLogin(r1);
                            console.log("getbackasfile:" + filename + "=>" + r1);
                            var j1 = JSON.parse(r1);
                            if (j1.error === false) {
                                var download_path = j1.path;
                                // Could also use the link-click method.
                                // window.location = download_path;
                                window.open(download_path, '_blank');
                                sysbase.putMessage(filename + " download erfolgt", 1);
                            } else {
                                sysbase.putMessage(filename + " download ERROR:" + j1.message, 3);
                            }
                            return;
                        }).fail(function (err) {
                            sysbase.putMessage("download:" + err, 3);
                            return;
                        }).always(function () {
                            // nope
                        });
                    }
                }
            }))
            */
            /*
            .append($("<button/>", {
                html: "Scattergram",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // stationrecord - heatworld
                    kla1625shm.scatter(selvariablename, selsource, selstationid, matrix1);
                }
            }))
            */

            /*
            .append($("<button/>", {
                html: "Regression testen",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // stationrecord - heatworld
                    kla1625shm.paintU(selvariablename, selsource, selstationid, matrix1);
                }
            }))
            .append($("<button/>", {
                html: "Chart anzeigen",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // stationrecord - heatworld
                    kla1625shm.paintChart(30, selvariablename, selsource, selstationid);
                }
            }))
            */
            /*
            .append($("<button/>", {
                html: "Clusteranalyse",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // stationrecord - heatworld
                    kla1625shm.clusterAnalysis(selvariablename, selsource, selstationid);
                }
            }))
            */
            /*
            .append($("<button/>", {
                html: "Bucketanalyse (30)",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // stationrecord - heatworld
                    kla1625shm.bucketAnalysis(30, selvariablename, selsource, selstationid);
                }
            }))
            */



            .append($("<button/>", {
                html: "Drucken",
                css: {
                    "text-align": "center",
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    // sysbase.printDivAll($("#kla1625shmwrapper").html());
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
                            image.src = printcanvas.toDataURL("image/jpg"); // png
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

                        /**
                         * Konvertieren svg zu Image
                         */
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
                        });

                    }, 2000);
                    if (1 === 1) return;
                    window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
                }
            }))


            .append($("<button/>", {
                html: "Heatmap Colortest",
                css: {
                    float: "left",
                    margin: "10px"
                },
                click: function (evt) {
                    evt.preventDefault();
                    // evt.stopPropagation();
                    // evt.stopImmediatePropagation();
                    if ($("#kliheattable").is(":visible")) {
                        $("#kliheattable").hide();
                    } else {
                        $("#kla1625shmwrapper").empty();
                        var h = $("#heatmap").height();
                        var w = $("#kla1625shm.content").width();
                        w -= 0; // $("#heatmap").position().left;
                        w -= 0; // $("#heatmap").width();
                        w -= 0; // 40;
                        $("#kla1625shmwrapper")
                            .append($("<div/>", {
                                id: "kla1625shmcolormap",
                                css: {
                                    "background-color": "yellow",
                                    height: h,
                                    width: w,
                                    overflow: "auto"
                                }
                            }));
                        $("#kla1625shmcolormap").show();
                        kla9020fun.getColorPaletteX1("kla1625shmcolormap", 7);
                    }
                    return false;
                }
            }))

            .append($("<div/>", {
                id: "kla1625shmclock",
                float: "left",
                css: {
                    float: "left",
                    margin: "10px"
                }
            }));
        /**
         * Beginn des initialen Aufbaus kla1625shmwrapper
         */
        $("#kla1625shm.content")
            .append($("<div/>", {
                    id: "kla1625shmdiv",
                    class: "kla1625shmdiv"
                })
                .append($("<div/>", {
                    id: "kla1625shmwrapper",
                    class: "kla1625shmwrapper"
                }))
            );
        var h = $("#kla1625shm").height();
        h -= $("#kla1625shm.header").height();
        h -= $("#kla1625shmbuttons").height();
        h -= $("#kla1625shm.footer").height();
        $("#kla1625shmdiv")
            .css({
                "margin": "10px",
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        $("#kla1625shmwrapper")
            .css({
                "background-color": "lime",
                height: h,
                width: "100%",
                overflow: "auto",
                float: "left"
            });
        console.log("kla1625shmwrapper initialisiert, leer");
        $(window).on('resize', function () {
            var h = $("#kla1625shm").height();
            h -= $("#kla1625shm.header").height();
            h -= $("#kla1625shmbuttons").height();
            h -= $("#kla1625shm.footer").height();
            $("#kla1625shmdiv").css({
                height: h
            });
        });

        /**
         * Laden aller benötigten Daten, dann Ausgabe mit Formatieren
         */
        if (kla1625shmconfig.allin === false) {
            kla1625shm.loadalldata(function (ret) {
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
                kla1625shm.showall(ret);
            });
        } else {
            kla1625shm.getmoredata(function (ret) {
                var wmtit = "Auswertung für Station:";
                // isMember ? '$2.00' : '$10.00'
                wmtit += "Auswertung aller selektierten Stationen";
                /*
                wmtit += (stationrecord.stationname || "").length > 0 ? " " + stationrecord.stationname : "";
                wmtit += (stationrecord.fromyear || "").length > 0 ? " von " + stationrecord.fromyear : "";
                wmtit += (stationrecord.toyear || "").length > 0 ? " bis " + stationrecord.toyear : "";
                wmtit += (stationrecord.anzyears || 0).length > 0 ? " für " + stationrecord.anzyears + " Jahre" : "";
                wmtit += (stationrecord.region || "").length > 0 ? " Region:" + stationrecord.region : "";
                wmtit += (stationrecord.climatezone || "").length > 0 ? " Klimazone:" + stationrecord.climatezone : "";
                wmtit += (stationrecord.height || "").length > 0 ? " Höhe:" + stationrecord.height : "";
                */
                $(".headertitle").html("Sammelauswertung");
                kla1625shm.showall(ret);
            });


        }

    }; // Ende show

    /**
     * alle Daten laden - kla1625shmconfig.allin auswerten für Differenzierung
     * allin === false, dann selstationid abfragen
     * allin === true, dann selstationids als Array abfragen
     */
    kla1625shm.loadalldata = function (cb1625g) {
        async.waterfall([
                function (cb1625g1) {
                    kla1625shmclock = kla1625shm.showclock("#kla1625shmclock");
                    //$("button").hide();
                    $(':button').prop('disabled', true); // Disable all the buttons
                    $("body").css("cursor", "progress");
                    var sqlStmt = "";
                    // das passt nicht mehr
                    if (selvariablename === "TMAX" || selvariablename === "TMIN") {
                        selvariablename = "TMAX,TMIN";
                    }
                    var projection = {};
                    sqlStmt += "SELECT ";
                    sqlStmt += "KLISTATIONS.source, ";
                    sqlStmt += "KLISTATIONS.stationid, ";
                    sqlStmt += "stationname, ";
                    sqlStmt += "climatezone, ";
                    sqlStmt += "region, ";
                    sqlStmt += "subregion, ";
                    sqlStmt += "countryname, ";
                    sqlStmt += "continent, ";
                    sqlStmt += "continentname, ";
                    sqlStmt += "lats, ";
                    sqlStmt += "longitude, ";
                    sqlStmt += "latitude, ";
                    sqlStmt += "variable, ";
                    sqlStmt += "anzyears, ";
                    sqlStmt += "realyears, ";
                    sqlStmt += "fromyear, ";
                    sqlStmt += "toyear, ";
                    sqlStmt += "height, ";
                    sqlStmt += "years ";
                    sqlStmt += "FROM KLISTATIONS ";
                    sqlStmt += "LEFT JOIN KLIDATA ";
                    sqlStmt += "ON KLISTATIONS.source = KLIDATA.source ";
                    sqlStmt += "AND KLISTATIONS.stationid = KLIDATA.stationid ";
                    sqlStmt += "WHERE KLISTATIONS.source = '" + selsource + "' ";
                    sqlStmt += "AND KLISTATIONS.stationid = '" + selstationid + "' ";
                    if (selvariablename === "TMAX,TMIN") {
                        sqlStmt += "AND (KLIDATA.variable ='TMAX' OR KLIDATA.variable = 'TMIN') ";
                    } else {
                        sqlStmt += "AND KLIDATA.variable ='" + selvariablename + "' ";
                    }
                    sqlStmt += "ORDER BY KLISTATIONS.source, KLISTATIONS.stationid, KLIDATA.variable";
                    var api = "getallsqlrecords";
                    var table = "KLISTATIONS";
                    uihelper.getAllRecords(sqlStmt, {}, [], 0, 2, api, table, function (ret1) {
                        if (ret1.error === false && ret1.records !== null) {
                            /*
                            intern wird getallsqlrecords gerufen und es werden zwei Sätze erwartet,
                            wenn die Station komplette Temperaturdaten geliefert hat
                            */
                            klirecords = [];
                            // Sortierfolge ist TMAX, TMIN alphabetisch
                            if (typeof ret1.records[0] !== "undefined") {
                                ret1.records[0].years.replace(/""/g, null);
                                klirecords.push(ret1.records[0]);
                                stationrecord = ret1.records[0];
                            }
                            if (typeof ret1.records[1] !== "undefined") {
                                ret1.records[1].years.replace(/""/g, null);
                                klirecords.push(ret1.records[1]);
                            } else {
                                klirecords.push(ret1.records[0]);
                                ret1.records[1] = ret1.records[0];
                            }
                            cb1625g1(null, {
                                error: false,
                                message: "Daten gefunden"
                            });
                            return;
                        } else {
                            /**
                             * Abfrage, ob Daten geladen werden sollen
                             */
                            var qmsg = "Für Station:" + selstationid + " aus " + selsource;
                            qmsg += " und " + selvariablename;
                            qmsg += " gibt es keine Daten, sollen diese geladen werden (dauert)?";
                            var check = window.confirm(qmsg);
                            if (check === false) {
                                sysbase.putMessage("Keine Daten zur Station gefunden", 3);
                                cb1625g1("Error", {
                                    error: true,
                                    message: "Keine Temperatur-Daten gefunden"
                                });
                                return;
                            } else {
                                cb1625g1(null, {
                                    error: true,
                                    operation: "loadghcn",
                                    message: "Keine Temperatur-Daten gefunden",
                                    sqlStmt: sqlStmt,
                                    selvariablename: selvariablename,
                                    selsource: selsource,
                                    selstationid: selstationid
                                });
                                return;
                            }
                        }
                    });
                },
                function (ret, cb1625g2) {
                    /**
                     * Laden der GHCN-Daily-Daten, falls angefordert
                     * Laden aus den Urdaten (*.dly-Files)
                     */
                    if (ret.error === false) {
                        cb1625g2(null, ret);
                        return;
                    }
                    if (ret.error === true && (typeof ret.operation === "undefined" || typeof ret.operation !== "undefined" && ret.operation !== "loadghcn")) {
                        cb1625g2(null, ret);
                        return;
                    }

                    $(that).attr("disabled", true);
                    var jqxhr = $.ajax({
                        method: "GET",
                        crossDomain: false,
                        url: sysbase.getServer("ghcnddata"),
                        data: {
                            timeout: 10 * 60 * 1000,
                            source: selsource,
                            stationid: selstationid
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        sysbase.checkSessionLogin(r1);
                        var ret1 = JSON.parse(r1);
                        sysbase.putMessage(ret1.message, 1);
                        if (ret1.error === true) {
                            cb1625g2("Error", {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        } else {
                            cb1625g2(null, {
                                error: ret1.error,
                                operation: "repeat",
                                message: ret1.message,
                                sqlStmt: ret.sqlStmt,
                                selvariablename: ret.selvariablename,
                                selsource: ret.selsource,
                                selstationid: ret.selstationid
                            });
                            return;
                        }
                    }).fail(function (err) {
                        //$("#kli1400raw_rightwdata").empty();
                        //document.getElementById("kli1400raw").style.cursor = "default";
                        sysbase.putMessage("ghcnddata:" + err, 3);
                        cb1625g2("Error", {
                            error: true,
                            message: err.message || err
                        });
                        return;
                    }).always(function () {
                        // nope
                        $(that).attr("disabled", false);
                    });
                },
                function (ret, cb1625g3) {
                    /**
                     * nochmaliges Lesen, falls erforderlich
                     */
                    if (typeof ret.operation === "undefined" || ret.operation !== "repeat") {
                        cb1625g3(null, ret);
                        return;
                    }
                    uihelper.getAllRecords(ret.sqlStmt, {}, [], 0, 2, ret.api, ret.table, function (ret1) {
                        if (ret1.error === false && ret1.record !== null) {
                            stationrecord = ret1.record;
                            klirecords = [];
                            // Sortierfolge ist TMAX, TMIN alphabetisch
                            if (typeof ret1.records[0] !== "undefined") klirecords.push(ret1.records[0]);
                            if (typeof ret1.records[1] !== "undefined") klirecords.push(ret1.records[1]);
                            cb1625g3(null, {
                                error: false,
                                message: "Daten gefunden"
                            });
                            return;
                        } else {
                            cb1625g3(null, {
                                error: true,
                                message: "Endgültig keine Temperatur-Daten gefunden"
                            });
                            return;
                        }
                    });
                },
                function (ret, cb1625g4) {
                    /**
                     * Holen der HYDE-Daten
                     */
                    if (kla1625shmconfig.hyde === false) {
                        cb1625g4(null, ret);
                        return;
                    }
                    var jqxhr = $.ajax({
                        method: "GET",
                        crossDomain: false,
                        url: sysbase.getServer("stationhyde"),
                        data: {
                            source: klirecords[0].source,
                            stationid: selstationid,
                            longitude: stationrecord.longitude,
                            latitude: stationrecord.latitude,
                            name: stationrecord.stationname,
                            globals: false,
                            selyears: "",
                            selvars: "popc,rurc,urbc,uopp,cropland,tot_irri"
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        sysbase.checkSessionLogin(r1);
                        var ret = JSON.parse(r1);
                        sysbase.putMessage(ret.message, 1);
                        if (ret.error === true) {
                            cb1625g4(null, ret);
                            return;
                        } else {
                            klihyde = ret.klihyde;
                            // klihyde.data muss mit JSON.parse noch entpackt werden
                            cb1625g4(null, ret);
                            return;
                        }
                    }).fail(function (err) {
                        sysbase.putMessage(err, 1);
                        cb1625g4(null, ret);
                        return;
                    }).always(function () {
                        // nope
                    });
                }
            ],
            function (error, result) {
                clearInterval(kla1625shmclock);
                $("#kliclock").html("&nbsp;&nbsp;&nbsp;");
                //$("button").show();
                $(':button').prop('disabled', false); // Enable all the buttons
                $("body").css("cursor", "default");
                cb1625g(result);
                return;
            });
    };

    /**
     * getmoredata - kla1625shmconfig.allin === true
     * allin === true, dann selstations mit stationid und source als Array abfragen
     * im server:
     * - create temporary table
     * - dann laden der temporary table
     * - dann eigentlicher SQL-Zugriff
     * - Rückgabe records - das eigentliche Ziel
     * tricky mit temporary table
     */
    kla1625shm.getmoredata = function (cb1625n) {
        var ttid = "STA" + Math.floor(Math.random() * 100000) + 1;
        async.waterfall([
                function (cb1625n0) {
                    kla1625shmclock = kla1625shm.showclock("#kla1625shmclock");
                    //$("button").hide();
                    $(':button').prop('disabled', true); // Disable all the buttons
                    $("body").css("cursor", "progress");
                    if (selvariablename === "TMAX" || selvariablename === "TMIN") {
                        selvariablename = "TMAX,TMIN";
                    }
                    /**
                     * Aufbau temporary table
                     */
                    var crtsql = "CREATE TEMPORARY TABLE " + ttid + " (stationid text, source text)";
                    /**
                     * Daten zum Laden der temporary table: selstations
                     */
                    /**
                     * sql SELECT mit temptable
                     */
                    var sqlStmt = "";
                    // selvariablename = "TMAX,TMIN";
                    var projection = {};
                    sqlStmt += "SELECT ";
                    sqlStmt += "KLISTATIONS.source, ";
                    sqlStmt += "KLISTATIONS.stationid, ";
                    sqlStmt += "stationname, ";
                    sqlStmt += "climatezone, ";
                    sqlStmt += "region, ";
                    sqlStmt += "subregion, ";
                    sqlStmt += "countryname, ";
                    sqlStmt += "continent, ";
                    sqlStmt += "continentname, ";
                    sqlStmt += "lats, ";
                    sqlStmt += "longitude, ";
                    sqlStmt += "latitude, ";
                    sqlStmt += "variable, ";
                    sqlStmt += "anzyears, ";
                    sqlStmt += "realyears, ";
                    sqlStmt += "fromyear, ";
                    sqlStmt += "toyear, ";
                    sqlStmt += "height, ";
                    sqlStmt += "years ";
                    sqlStmt += " FROM " + ttid;
                    sqlStmt += " INNER JOIN KLISTATIONS ";
                    sqlStmt += " ON " + ttid + ".source = KLISTATIONS.source";
                    sqlStmt += " AND " + ttid + ".stationid = KLISTATIONS.stationid";
                    sqlStmt += " LEFT JOIN KLIDATA ";
                    sqlStmt += " ON " + ttid + ".source = KLIDATA.source ";
                    sqlStmt += " AND " + ttid + ".stationid = KLIDATA.stationid ";
                    if (selvariablename === "TMAX,TMIN") {
                        sqlStmt += " WHERE (KLIDATA.variable ='TMAX' OR KLIDATA.variable = 'TMIN') ";
                    } else {
                        sqlStmt += " WHERE KLIDATA.variable ='" + selvariablename + "' ";
                    }
                    sqlStmt += " ORDER BY " + ttid + ".source, " + ttid + ".stationid, KLIDATA.variable";
                    var api = "getallsqlrecords";
                    var table = "KLISTATIONS";

                    //uihelper.getAllRecords(sqlStmt, {}, [], 0, 2, api, table, function (ret1) {
                    var jqxhr = $.ajax({
                        method: "POST",
                        crossDomain: false,
                        url: sysbase.getServer("getmoredata"),
                        data: {
                            timeout: 10 * 60 * 1000,
                            crtsql: crtsql,
                            selstations: selstations,
                            sqlStmt: sqlStmt,
                            temptable: ttid
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        sysbase.checkSessionLogin(r1);
                        var ret1 = JSON.parse(r1);
                        sysbase.putMessage(ret1.message, 1);
                        debugger;
                        if (ret1.error === true) {
                            cb1625n0("Error", {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        } else {
                            cb1625n0(null, {
                                error: ret1.error,
                                message: ret1.message,
                                records: ret1.records
                            });
                            return;
                        }
                    }).fail(function (err) {
                        //$("#kli1400raw_rightwdata").empty();
                        //document.getElementById("kli1400raw").style.cursor = "default";
                        sysbase.putMessage("getmoredata:" + err, 3);
                        cb1625n0("Error", {
                            error: true,
                            message: err.message || err
                        });
                        return;
                    }).always(function () {
                        // nope
                    });

                },
                function (ret1, cb1625n1) {
                    /**
                     * hier kommt eine async loop-Steuerung, um die Daten sequentiell abzuarbeite
                     * in der bisherigen Logik
                     */
                    var vglsource = "";
                    var vglstationid = "";
                    klirecords = [];
                    async.eachSeries(ret1.records, function (klirow, nextklirow) {
                        if (vglsource === "" && vglstationid === "") {
                            // 1. mal
                            vglsource = klirow.source;
                            vglstationid = klirow.stationid;
                            klirecords.push(klirow);
                            nextklirow();
                            return;
                        } else if (vglsource !== klirow.source || vglstationid !== klirow.stationid) {
                            // Gruppenwechsel-Verarbeitung, Komplettierung und Ausgabe
                            kla1625shm.execmoredata(vglsource, vglstationid, function (ret2) {
                                // neue Gruppe einleiten
                                vglsource = klirow.source;
                                vglstationid = klirow.stationid;
                                klirecords = [];
                                klirecords.push(klirow);
                                nextklirow();
                                return;
                            });
                        } else {
                            klirecords.push(klirow);
                            nextklirow();
                            return;
                        }
                    }, function (err) {
                        // zum Ablschluss
                        kla1625shm.execmoredata(vglsource, vglstationid, function (ret2) {
                            cb1625n1(null, ret2);
                            return;
                        });
                    });
                }
            ],
            function (error, result) {

            });

    };



    /**
     * execmoredata - in Loop die Verarbeitung eines Pair in klirecords
     * durchführen, teilweise von altem loadall und dann showall
     * @param {*} newsource
     * @param {*} newstationid
     * @param {*} cbexec
     */
    kla1625shm.execmoredata = function (newsource, newstationid, cb1625p) {
        selsource = newsource;
        selstationid = newstationid;
        async.waterfall([
                function (cb1625p1) {
                    /*
                    intern wird getallsqlrecords gerufen und es werden zwei Sätze erwartet,
                    wenn die Station komplette Temperaturdaten geliefert hat
                    */
                    if (typeof klirecords[0].years !== "undefined" || klirecords[0].years.length > 0) {
                        // Sortierfolge ist TMAX, TMIN alphabetisch
                        stationrecord = klirecords[0];
                        cb1625p1(null, {
                            error: false,
                            message: "Daten gefunden"
                        });
                        return;
                    } else {
                        /**
                         * Abfrage, ob Daten geladen werden sollen
                         */
                        var qmsg = "Für Station:" + selstationid + " aus " + selsource;
                        qmsg += " und " + selvariablename;
                        qmsg += " gibt es keine Daten, sollen diese geladen werden (dauert)?";
                        var check = window.confirm(qmsg);
                        if (check === false) {
                            sysbase.putMessage("Keine Daten zur Station gefunden", 3);
                            cb1625p1("Error", {
                                error: true,
                                message: "Keine Temperatur-Daten gefunden"
                            });
                            return;
                        } else {
                            // TODO: neues SQL und beide Variablen bereitstellen
                            cb1625p1(null, {
                                error: true,
                                operation: "loadghcn",
                                message: "Keine Temperatur-Daten gefunden",
                                sqlStmt: sqlStmt,
                                selvariablename: selvariablename,
                                selsource: selsource,
                                selstationid: selstationid
                            });
                            return;
                        }
                    }
                },
                function (ret, cb1625p2) {
                    /**
                     * Laden der GHCN-Daily-Daten, falls angefordert
                     * Laden aus den Urdaten (*.dly-Files)
                     */
                    if (ret.error === false) {
                        cb1625p2(null, ret);
                        return;
                    }
                    if (ret.error === true && (typeof ret.operation === "undefined" || typeof ret.operation !== "undefined" && ret.operation !== "loadghcn")) {
                        cb1625p2(null, ret);
                        return;
                    }

                    $(that).attr("disabled", true);
                    var jqxhr = $.ajax({
                        method: "GET",
                        crossDomain: false,
                        url: sysbase.getServer("ghcnddata"),
                        data: {
                            timeout: 10 * 60 * 1000,
                            source: selsource,
                            stationid: selstationid
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        sysbase.checkSessionLogin(r1);
                        var ret1 = JSON.parse(r1);
                        sysbase.putMessage(ret1.message, 1);
                        if (ret1.error === true) {
                            cb1625p2("Error", {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        } else {
                            cb1625p2(null, {
                                error: ret1.error,
                                operation: "repeat",
                                message: ret1.message,
                                sqlStmt: ret.sqlStmt,
                                selvariablename: ret.selvariablename,
                                selsource: ret.selsource,
                                selstationid: ret.selstationid
                            });
                            return;
                        }
                    }).fail(function (err) {
                        //$("#kli1400raw_rightwdata").empty();
                        //document.getElementById("kli1400raw").style.cursor = "default";
                        sysbase.putMessage("ghcnddata:" + err, 3);
                        cb1625p2("Error", {
                            error: true,
                            message: err.message || err
                        });
                        return;
                    }).always(function () {
                        // nope
                        $(that).attr("disabled", false);
                    });
                },
                function (ret, cb1625p3) {
                    /**
                     * nochmaliges Lesen, falls erforderlich
                     */
                    if (typeof ret.operation === "undefined" || ret.operation !== "repeat") {
                        cb1625p3(null, ret);
                        return;
                    }
                    uihelper.getAllRecords(ret.sqlStmt, {}, [], 0, 2, ret.api, ret.table, function (ret1) {
                        if (ret1.error === false && ret1.record !== null) {
                            stationrecord = ret1.record;
                            klirecords = [];
                            // Sortierfolge ist TMAX, TMIN alphabetisch
                            if (typeof ret1.records[0] !== "undefined") klirecords.push(ret1.records[0]);
                            if (typeof ret1.records[1] !== "undefined") klirecords.push(ret1.records[1]);
                            cb1625p3(null, {
                                error: false,
                                message: "Daten gefunden"
                            });
                            return;
                        } else {
                            cb1625p3(null, {
                                error: true,
                                message: "Endgültig keine Temperatur-Daten gefunden"
                            });
                            return;
                        }
                    });
                },
                function (ret, cb1625p4) {
                    /**
                     * Holen der HYDE-Daten
                     */
                    if (kla1625shmconfig.hyde === false) {
                        cb1625p4(null, ret);
                        return;
                    }
                    var jqxhr = $.ajax({
                        method: "GET",
                        crossDomain: false,
                        url: sysbase.getServer("stationhyde"),
                        data: {
                            source: klirecords[0].source,
                            stationid: selstationid,
                            longitude: stationrecord.longitude,
                            latitude: stationrecord.latitude,
                            name: stationrecord.stationname,
                            globals: false,
                            selyears: "",
                            selvars: "popc,rurc,urbc,uopp,cropland,tot_irri"
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        sysbase.checkSessionLogin(r1);
                        var ret = JSON.parse(r1);
                        sysbase.putMessage(ret.message, 1);
                        if (ret.error === true) {
                            cb1625p4(null, ret);
                            return;
                        } else {
                            klihyde = ret.klihyde;
                            // klihyde.data muss mit JSON.parse noch entpackt werden
                            cb1625p4(null, ret);
                            return;
                        }
                    }).fail(function (err) {
                        sysbase.putMessage(err, 1);
                        cb1625p4(null, ret);
                        return;
                    }).always(function () {
                        // nope
                    });
                },
                function (ret, cb1625p5) {
                    // hier die Ausgabe durchführen
                    kla1625shm.showall(ret, function (ret1) {
                        cb1625p5("Finish", ret1);
                        return;
                    });
                }
            ],
            function (error, result) {
                clearInterval(kla1625shmclock);
                $("#kliclock").html("&nbsp;&nbsp;&nbsp;");
                //$("button").show();
                $(':button').prop('disabled', false); // Enable all the buttons
                $("body").css("cursor", "default");
                cb1625p(result);
                return;
            });
    };





    /**
     * kla1625shm.showall - Aufruf aller Funktionen für die Standardauswertung
     * @param {*} ret
     */
    kla1625shm.showall = function (ret, cball) {
        /**
         * zweibahnige Ausgabe nach kla1625shmwrapper
         */
        hmatrixR = {};
        hmatrixL = {};

        hoptionsR = {};
        hoptionsL = {};

        /*
        var w = new Vector([0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2, 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3, 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8]);
        var l = new Vector([1.4, 1.4, 1.3, 1.5, 1.4, 1.7, 1.4, 1.5, 1.4, 1.5, 1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5, 1.7, 1.5, 1.0, 1.7, 1.9, 1.6, 1.6, 1.5, 1.4, 1.6, 1.6, 1.5, 1.5, 1.4, 1.5, 1.2, 1.3, 1.4, 1.3, 1.5, 1.3, 1.3, 1.3, 1.6, 1.9, 1.4, 1.6, 1.4, 1.5, 1.4, 4.7, 4.5, 4.9, 4.0, 4.6, 4.5, 4.7, 3.3, 4.6, 3.9, 3.5, 4.2, 4.0, 4.7, 3.6, 4.4, 4.5, 4.1, 4.5, 3.9, 4.8, 4.0, 4.9, 4.7, 4.3, 4.4, 4.8, 5.0, 4.5, 3.5, 3.8, 3.7, 3.9, 5.1, 4.5, 4.5, 4.7, 4.4, 4.1, 4.0, 4.4, 4.6, 4.0, 3.3, 4.2, 4.2, 4.2, 4.3, 3.0, 4.1, 6.0, 5.1, 5.9, 5.6, 5.8, 6.6, 4.5, 6.3, 5.8, 6.1, 5.1, 5.3, 5.5, 5.0, 5.1, 5.3, 5.5, 6.7, 6.9, 5.0, 5.7, 4.9, 6.7, 4.9, 5.7, 6.0, 4.8, 4.9, 5.6, 5.8, 6.1, 6.4, 5.6, 5.1, 5.6, 6.1, 5.6, 5.5, 4.8, 5.4, 5.6, 5.1, 5.1, 5.9, 5.7, 5.2, 5.0, 5.2, 5.4, 5.1]);
        var lm = new Regression.linear(l, w);
        console.log(JSON.stringify(lm, null, 4));
        debugger;
        */

        async.waterfall([
                function (cb1625g0a) {
                    klirecords[0].titel = klirecords[0].stationid + " " + klirecords[0].stationname + " (" + klirecords[0].source + ")";

                    if (kla1625shmconfig.allin === true) {
                        var gldivid = "div" + Math.floor(Math.random() * 100000) + 1;

                        $("#kla1625shmwrapper")
                            .append($("<div/>", {
                                    class: "doprintthis",
                                    id: gldivid,
                                    css: {
                                        width: "100%",
                                        float: "left",
                                        overflow: "hidden"
                                    }
                                })
                                .append($("<br/>"))
                                .append($("<br/>"))
                                .append($("<h2/>", {
                                    html: klirecords[0].stationid + " " + klirecords[0].stationname + " (" + klirecords[0].source + ")",
                                    class: "doprintthis"
                                }))
                            );
                        // Spezielle Buttons mit Vor-Aufbereitung
                        var gurl = "https://www.google.com/maps/search/?api=1&query=";
                        gurl += klirecords[0].latitude;
                        gurl += ",";
                        gurl += klirecords[0].longitude;

                        var lurl = "klaleaflet.html";
                        lurl += "?";
                        lurl += "latitude=" + encodeURIComponent(klirecords[0].latitude);
                        lurl += "&";
                        lurl += "longitude=" + encodeURIComponent(klirecords[0].longitude);

                        $("#" + gldivid)
                            .append($("<button/>", {
                                html: "Google-Maps",
                                gurl: gurl,
                                css: {
                                    float: "left",
                                    margin: "10px"
                                },
                                click: function (evt) {
                                    evt.preventDefault();
                                    //var gurl = "https://www.google.com/maps/dir/";
                                    var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                                    var newurl = $(this).attr("gurl");
                                    window.open(newurl, wname, 'height=' + screen.height + ', width=' + screen.width);
                                }
                            }))
                            .append($("<button/>", {
                                html: "Leaflet-Raster",
                                lurl: lurl,
                                css: {
                                    float: "left",
                                    margin: "10px"
                                },
                                click: function (evt) {
                                    evt.preventDefault();
                                    var newurl = $(this).attr("lurl");
                                    var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                                    window.open(newurl, wname, 'height=' + screen.height + ', width=' + screen.width);
                                }
                            }));
                    }
                    /**
                     * Datenqualität missing/bad data
                     */
                    if (kla1625shmconfig.master === false) {
                        cb1625g0a(null, ret);
                        return;
                    }
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    $("#kla1625shmwrapper")
                        .append($("<div/>", {
                            id: divid,
                            class: "doprintthis",
                            css: {
                                width: "100%",
                                float: "left",
                                overflow: "hidden"
                            }
                        }));

                    $("#" + divid)
                        .append($("<a/>", {
                                title: "Copy to Clipboard",
                                css: {
                                    margin: "10px"
                                },
                                click: function (evt) {
                                    evt.preventDefault();
                                    var cHtml = $(this).parent()[0];
                                    var copyh = "";
                                    copyh += "<html>";
                                    copyh += "<head>";
                                    copyh += "<meta charset='UTF-8'>";
                                    copyh += "</head>";
                                    copyh += "<body ";
                                    copyh += " styles='font-family:Calibri,sans-serif'>";
                                    copyh += $(this).parent().html();
                                    copyh += "</body>";
                                    copyh += "</html>";
                                    uihelper.downloadfile("station.html", copyh, function (ret) {
                                        console.log("Downloaded");
                                    });
                                }
                            })
                            .append($("<h2/>", {
                                html: "Stammdaten " + klirecords[0].titel
                            }))
                        );

                    var master = {};
                    master.stationid = klirecords[0].stationid;
                    master.source = klirecords[0].source;
                    master.stationname = klirecords[0].stationname;
                    master.climatezone = klirecords[0].climatezone;
                    master.region = klirecords[0].region;
                    master.subregion = klirecords[0].subregion;
                    master.countryname = klirecords[0].countryname;
                    master.continent = klirecords[0].continent;
                    master.continentname = klirecords[0].continentname;
                    master.lats = klirecords[0].lats;
                    master.longitude = klirecords[0].longitude;
                    master.latitude = klirecords[0].latitude;
                    master.height = klirecords[0].height;
                    ret.master = master;
                    var html = uihelper.iterateJSON2HTML(master, "", "");

                    $("#" + divid)
                        .append($("<div/>", {
                            html: html
                        }));
                    cb1625g0a(null, ret);
                    return;
                },
                function (ret, cb1625g0) {
                    /**
                     * Datenqualität missing/bad data
                     */
                    if (kla1625shmconfig.qonly === false) {
                        cb1625g0(null, ret);
                        return;
                    }
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    $("#kla1625shmwrapper")
                        .append($("<div/>", {
                            id: divid,
                            class: "doprintthis",
                            css: {
                                width: "100%",
                                float: "left",
                                overflow: "hidden"
                            }
                        }));

                    $("#" + divid)
                        .append($("<a/>", {
                                title: "Copy to Clipboard",
                                css: {
                                    margin: "10px"
                                },
                                click: function (evt) {
                                    evt.preventDefault();
                                    var cHtml = $(this).closest("div");
                                    debugger;
                                    if ($(cHtml).attr("id") !== null) {
                                        cHtml = $(cHtml).attr("id");
                                        uihelper.copyHtml2clipboard(cHtml);
                                    } else {
                                        var newid = "I" + Math.floor(Math.random() * 100000) + 1;
                                        $(cHtml).attr("id", newid);
                                        uihelper.copyHtml2clipboard(newid);
                                    }
                                }
                            })
                            .append($("<h2/>", {
                                html: "Datenqualität, Jahresdaten " + klirecords[0].titel
                            }))
                        );


                    /**
                     * Prüfung der Datenqualität je Jahr in klirecords.years
                     */
                    for (var irec = 0; irec < klirecords.length; irec++) {
                        var klirecord = klirecords[irec];
                        var years = JSON.parse(klirecord.years)
                        var rawyears = Object.keys(years);
                        var yearcontrol = [];
                        var firstyear = null;
                        var lastyear = null;
                        for (var iyear = 0; iyear < rawyears.length; iyear++) {
                            yearcontrol.push(parseInt(rawyears[iyear]));
                        }
                        yearcontrol.sort(function (a, b) {
                            if (a < b)
                                return -1;
                            if (a > b)
                                return 1;
                            return 0;
                        });
                        var imissing = 0;
                        var ibad = 0;
                        var badyears = [];
                        var missingyears = [];
                        for (var iyear = 1; iyear < yearcontrol.length; iyear++) {
                            var ydiff = yearcontrol[iyear] + yearcontrol[iyear - 1];
                            if (ydiff !== 1) {
                                for (var imiss = yearcontrol[iyear - 1] + 1; imiss < yearcontrol[iyear] - 1; imiss++) {
                                    missingyears.push(imiss);
                                }
                            }
                        }
                        for (var iyear = 1; iyear < yearcontrol.length; iyear++) {
                            var ayear = "" + yearcontrol[iyear];
                            var testyear = years[ayear];
                            if (uihelper.isqualityyear(testyear) === false) {
                                badyears.push(ayear);
                            }
                        }
                        console.log("Missing:" + JSON.stringify(missingyears));
                        console.log("Bad:" + JSON.stringify(badyears));

                        var rep1 = "Variable:<b>" + klirecord.variable + "</b>";
                        rep1 += "<br>";
                        rep1 += "Missing years:" + missingyears.join(", ");
                        rep1 += "<br>";
                        rep1 += "Bad data in years:" + badyears.join(", ");
                        var fdir = "right";
                        if (irec === 0) {
                            fdir = "left";
                        }
                        $("#" + divid)
                            .append($("<div/>", {
                                html: rep1,
                                css: {
                                    float: fdir,
                                    width: "49%"
                                }
                            }));
                    }
                    cb1625g0(null, ret);
                    return;
                },
                function (ret27, cb1625g1) {
                    /**
                     * Heatmap-1
                     */
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    if (kla1625shmconfig.heatmaps === true || kla1625shmconfig.heatmapsx === true) {
                        $("#kla1625shmwrapper")
                            .append($("<div/>", {
                                    css: {
                                        width: "100%",
                                        float: "left",
                                        overflow: "hidden"
                                    }
                                })
                                .append($("<div/>", {
                                        css: {
                                            width: "100%",
                                            "text-align": "center"
                                        }
                                    })
                                    .append($("<h2>", {
                                        text: "Heatmaps " + klirecords[0].titel
                                    }))
                                )
                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            float: "left",
                                            width: "49%"
                                        }
                                    })
                                    .append($("<div/>", {
                                        id: divid + "L",
                                    }))
                                )
                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            float: "left",
                                            width: "49%"
                                        }
                                    })
                                    .append($("<div/>", {
                                        id: divid + "R",
                                    }))
                                )
                            );
                    }
                    // Linke heatmap
                    var hmoptions = {
                        minmax: false,
                        minmaxhistogram: false,
                        cbuckets: false,
                        hyde: true
                    };
                    kla1625shm.kliheatmap2("#" + divid + "L", "TMAX", selsource, selstationid, starecord, hmoptions, function (ret) {
                        ret.divid = divid;
                        if (kla1625shmconfig.heatmaps === true) {
                            var nkorr = $("#" + divid + "L").find("canvas").height();
                            $("#" + divid + "L").css({
                                "max-height": nkorr + 10,
                                height: nkorr + 10,
                                overflow: "hidden"
                            });
                        }
                        cb1625g1(null, ret);
                        return;
                    });
                },
                function (ret, cb1625g2) {
                    /**
                     * Heatmap-2
                     */
                    // Rechte heatmap
                    var hmoptions = {
                        minmax: false,
                        minmaxhistogram: false,
                        cbuckets: false,
                        hyde: true
                    };
                    var divid = ret.divid;
                    kla1625shm.kliheatmap2("#" + divid + "R", "TMIN", selsource, selstationid, starecord, hmoptions, function (ret) {
                        if (kla1625shmconfig.heatmaps === true) {
                            var nkorr = $("#" + divid + "R").find("canvas").height();
                            $("#" + divid + "R").css({
                                "max-height": nkorr + 10,
                                height: nkorr + 10,
                                overflow: "hidden"
                            });
                        }
                        cb1625g2(null, ret);
                        return;
                    });
                },

                function (ret, cb1625g3) {
                    /**
                     * Heatmap-3
                     */
                    if (kla1625shmconfig.heatmaps === true) {
                        var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                        $("#kla1625shmwrapper")
                            .append($("<div/>", {
                                    css: {
                                        width: "100%",
                                        float: "left",
                                        overflow: "hidden"
                                    }
                                })
                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            float: "left",
                                            width: "49%"
                                        }
                                    })
                                    .append($("<div/>", {
                                        id: divid + "L",
                                    }))
                                )

                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            float: "left",
                                            width: "49%"
                                        }
                                    })
                                    .append($("<div/>", {
                                        id: divid + "R",
                                    }))
                                ));
                    }
                    // Linke heatmap
                    var hmoptions = {
                        minmax: true,
                        minmaxhistogram: true,
                        cbuckets: true,
                        hyde: true
                    };
                    kla1625shm.kliheatmap2("#" + divid + "L", "TMAX", selsource, selstationid, starecord, hmoptions, function (ret) {
                        ret.divid = divid;
                        if (kla1625shmconfig.heatmaps === true) {
                            var nkorr = $("#" + divid + "L").find("canvas").height();
                            $("#" + divid + "L").css({
                                "max-height": nkorr + 10,
                                height: nkorr + 10,
                                overflow: "hidden"
                            });
                        }
                        hmatrixL = ret.matrix;
                        hoptionsL = ret.options;
                        cb1625g3(null, ret);
                        return;
                    });
                },
                function (ret, cb1625g4) {
                    /**
                     * Heatmap-4
                     */
                    // Rechte heatmap
                    var hmoptions = {
                        minmax: true,
                        minmaxhistogram: true,
                        cbuckets: true,
                        hyde: true
                    };
                    var divid = ret.divid;
                    kla1625shm.kliheatmap2("#" + divid + "R", "TMIN", selsource, selstationid, starecord, hmoptions, function (ret) {
                        if (kla1625shmconfig.heatmaps === true) {
                            var nkorr = $("#" + divid + "R").find("canvas").height();
                            $("#" + divid + "R").css({
                                "max-height": nkorr + 10,
                                height: nkorr + 10,
                                overflow: "hidden"
                            });
                        }
                        hmatrixR = ret.matrix;
                        hoptionsR = ret.options;
                        cb1625g4(null, ret);
                        return;
                    });
                },
                function (ret, cb1625g5a) {
                    /**
                     * Heat-Distribution mit ChartJS TMAX
                     */
                    if (kla1625shmconfig.tempdistribution === false) {
                        cb1625g5a(null, ret);
                        return;
                    }
                    /**
                     * Berechnen aller Werte für die Ausgabeoptimierung
                     */
                    var distrs = {};
                    var maxy = 0;
                    distrs["TMAX"] = kla1625shm.klidistr2calc("TMAX", selsource, selstationid, ret);
                    distrs["TMIN"] = kla1625shm.klidistr2calc("TMIN", selsource, selstationid, ret);

                    // Konsolidierung
                    if (distrs["TMAX"].winconfig.options.maxcount > maxy) {
                        maxy = distrs["TMAX"].winconfig.options.maxcount;
                    }
                    if (distrs["TMAX"].sunconfig.options.maxcount > maxy) {
                        maxy = distrs["TMAX"].sunconfig.options.maxcount;
                    }

                    if (distrs["TMIN"].winconfig.options.maxcount > maxy) {
                        maxy = distrs["TMIN"].winconfig.options.maxcount;
                    }
                    if (distrs["TMIN"].sunconfig.options.maxcount > maxy) {
                        maxy = distrs["TMIN"].sunconfig.options.maxcount;
                    }
                    // Aufrunden auf die nächste 50
                    if (maxy % 50 !== 0) {
                        var yrest = maxy % 50;
                        var maxy = maxy - yrest + 50;
                    }
                    distrs["TMAX"].winconfig.options.scales.yAxes[0].ticks.max = maxy;
                    distrs["TMAX"].sunconfig.options.scales.yAxes[0].ticks.max = maxy;
                    distrs["TMIN"].winconfig.options.scales.yAxes[0].ticks.max = maxy;
                    distrs["TMIN"].sunconfig.options.scales.yAxes[0].ticks.max = maxy;

                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    $("#kla1625shmwrapper")
                        .append($("<div/>", {
                                css: {
                                    width: "100%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            })
                            .append($("<div/>", {
                                id: divid + "L",
                                css: {
                                    width: "49%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            }))
                            .append($("<div/>", {
                                id: divid + "R",
                                css: {
                                    width: "49%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            }))

                        );
                    ret.distrs = distrs;
                    kla1625shm.klidistr2("#" + divid + "L", "TMAX", selsource, selstationid, ret, function (ret1) {
                        ret.divid = divid;
                        ret.distrs = distrs;
                        cb1625g5a(null, ret);
                        return;
                    });
                },

                function (ret, cb1625g5b) {
                    /**
                     * Heat-Distribution mit ChartJS TMIN
                     */
                    if (kla1625shmconfig.tempdistribution === false) {
                        cb1625g5b(null, ret);
                        return;
                    }
                    var divid = ret.divid;
                    kla1625shm.klidistr2("#" + divid + "R", "TMIN", selsource, selstationid, ret, function (ret) {
                        cb1625g5b(null, ret);
                        return;
                    });
                },



                function (ret, cb1625g5) {
                    /**
                     * Temperaturtabelle mit Histogrammen - links
                     */
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    // hier wird eine Struktur links und rechts bereitgestellt, noch ohne Inhalt
                    $("#kla1625shmwrapper")
                        .append($("<div/>", {
                                css: {
                                    width: "100%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            })
                            .append($("<div/>", {
                                    css: {
                                        "text-align": "center",
                                        float: "left",
                                        width: "49%"
                                    }
                                })
                                .append($("<div/>", {
                                    id: divid + "L",
                                }))
                            )
                            .append($("<div/>", {
                                    css: {
                                        "text-align": "center",
                                        float: "left",
                                        width: "49%"
                                    }
                                })
                                .append($("<div/>", {
                                    id: divid + "R",
                                }))
                            )
                        );

                    var hmoptions = {
                        minmax: true,
                        minmaxhistogram: true,
                        cbuckets: true,
                        hyde: true
                    };
                    if (typeof hoptionsL === "undefined") {
                        cb1625g5(null, ret);
                        return;
                    } else {
                        hoptionsL.minmaxhistogram = true;
                        kla1625shm.klihisto2("#" + divid + "L", "TMAX", selsource, selstationid, starecord, hmatrixL, hoptionsL, function (ret) {
                            ret.divid = divid;
                            cb1625g5(null, ret);
                            return;
                        });
                    }
                },
                function (ret, cb1625g6) {
                    /**
                     * Temperaturtabelle mit Histogrammen - rechts
                     */
                    var hmoptions = {
                        minmax: true,
                        minmaxhistogram: true,
                        cbuckets: true,
                        hyde: true,
                        divid: ret.divid
                    };
                    if (typeof hoptionsR === "undefined") {
                        cb1625g6(null, ret);
                        return;
                    } else {
                        hoptionsR.minmaxhistogram = true;
                        kla1625shm.klihisto2("#" + ret.divid + "R", "TMIN", selsource, selstationid, starecord, hmatrixR, hoptionsR, function (ret) {
                            cb1625g6(null, ret);
                            return;
                        });
                    }
                },
                function (ret, cb1625g7) {
                    /**
                     * Temperaturverlauf Graphik und Tabelle
                     */
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    if (kla1625shmconfig.tempchart === false) {
                        cb1625g7(null, ret);
                        return;
                    }
                    $("#kla1625shmwrapper")
                        .append($("<div/>", {
                                css: {
                                    width: "100%",
                                    float: "left",
                                    overflow: "hidden"
                                }
                            })
                            .append($("<div/>", {
                                id: divid + "L",
                                css: {
                                    "text-align": "center",
                                    float: "left",
                                    width: "49%"
                                }
                            }))
                            .append($("<div/>", {
                                id: divid + "R",
                                css: {
                                    "text-align": "center",
                                    float: "left",
                                    width: "49%"
                                }
                            }))
                        );
                    // Linker Temperaturverlauf
                    var hmoptions = {
                        minmax: true,
                        minmaxhistogram: true,
                        cbuckets: true,
                        hyde: true
                    };
                    if (typeof hoptionsL === "undefined") {
                        cb1625g7(null, ret);
                        return;
                    } else {
                        hoptionsL.minmaxhistogram = true;
                        kla1625shm.klitemp2("#" + divid + "L", "TMAX", selsource, selstationid, starecord, hmatrixL, hoptionsL, function (ret) {
                            ret.divid = divid;
                            cb1625g7(null, ret);
                            return;
                        });
                    }
                },

                function (ret, cb1625g8) {
                    // Rechter Temperaturverlauf
                    if (kla1625shmconfig.tempchart === false) {
                        cb1625g8(null, ret);
                        return;
                    }
                    var hmoptions = {
                        minmax: true,
                        minmaxhistogram: true,
                        cbuckets: true,
                        hyde: true,
                        divid: ret.divid
                    };
                    if (typeof hoptionsR === "undefined") {
                        cb1625g8(null, ret);
                        return;
                    } else {
                        hoptionsR.minmaxhistogram = true;
                        var divid = ret.divid;
                        kla1625shm.klitemp2("#" + divid + "R", "TMIN", selsource, selstationid, starecord, hmatrixR, hoptionsR, function (ret) {
                            cb1625g8(null, ret);
                            return;
                        });
                    }
                },



                function (ret, cb1625g9) {
                    if (kla1625shmconfig.hyde === false) {
                        cb1625g9("Finish", ret);
                        return;
                    }
                    var divid = "D" + Math.floor(Math.random() * 100000) + 1;
                    $("#kla1625shmwrapper")
                        .append($("<div/>", {
                            id: divid,
                            css: {
                                width: "100%",
                                float: "left",
                                overflow: "hidden"
                            }
                        }));
                    var hmoptions = {};
                    kla1625shm.klihyde2("#" + divid, selstationid, starecord, function (ret) {
                        cb1625g9("Finish", ret);
                        return;
                    });
                }
            ],
            function (error, result) {
                $(".tablesorter").tablesorter({
                    theme: "blue",
                    widgets: ['filter'],
                    widthFixed: true,
                    widgetOptions: {
                        filter_hideFilters: false,
                        filter_ignoreCase: true
                    }
                }); // so funktioniert es
                $("#kla1625shmwrapper")
                    .append($("<div/>", {
                            css: {
                                width: "100%",
                                float: "left",
                                overflow: "hidden"
                            }
                        })
                        .append($("<br/>"))
                        .append($("<br/>"))
                        .append($("<br/>"))
                        .append($("<br/>"))
                    );
                // finaler Callback, wenn vorgegeben
                if (typeof cball !== "undefined") {
                    cball(result);
                    return;
                }

            });
    };


    /**
     * kliheatmap2 - Heatmap berechnen und anzeigen
     * @param {*} cid
     * @param {*} selvariablename
     * @param {*} selsource
     * @param {*} selstationid
     * @param {*} starecord
     * @param {*} hmoptions
     *            minmax: true, - Temperaturskala auf echte Min und Max der Werte beziehen, nicht auf die Standardskale
     *            minmaxhistogram: true - Ausgabe Sparkline über dem Historgramm => histo1
     *            scale: 7 oder 5 - Anzahl der Grundfarben für die Heatmap
     *              minval, maxval, sumval, countval werden berechnet und mit übergeben
     * @param {*} callbackh0
     */
    kla1625shm.kliheatmap2 = function (cid, selvariablename, selsource, selstationid, starecord, hmoptions, callbackh0) {

        async.waterfall([
                function (callbackshm2) {
                    var ret = {};
                    if (typeof hmoptions === "object" && Object.keys(hmoptions).length >= 1) {
                        hmoptions.minmax = hmoptions.minmax || false;
                        hmoptions.scale = 7; // Farb-Buckets
                        hmoptions.minval = null;
                        hmoptions.maxval = null;
                        hmoptions.sumval = 0.0;
                        hmoptions.countval = 0;
                    } else {
                        hmoptions = {};
                        hmoptions.minmax = false;
                        hmoptions.scale = 7; // Farb-Buckets
                        hmoptions.minval = null;
                        hmoptions.maxval = null;
                        hmoptions.sumval = 0.0;
                        hmoptions.countval = 0;
                    }
                    var colwidth;
                    var rowheight;
                    var wratio;
                    var hratio;
                    var hmvalstr;
                    try {
                        /*
                        if (selvariablename === "TMAX" && klirecords.length > 0) {
                            ret.record = klirecords[0];
                        } else if (selvariablename === "TMIN" && klirecords.length > 1) {
                            ret.record = klirecords[1];
                        }
                        */
                        if (selvariablename === "TMAX" && klirecords.length > 0) {
                            if (klirecords[0].variable === "TMAX") {
                                ret.record = klirecords[0];
                            } else if (klirecords.length > 1 && klirecords[1].variable === "TMAX") {
                                ret.record = klirecords[1];
                            }
                        }
                        if (selvariablename === "TMIN" && klirecords.length > 0) {
                            if (klirecords[0].variable === "TMIN") {
                                ret.record = klirecords[0];
                            } else if (klirecords.length > 1 && klirecords[1].variable === "TMIN") {
                                ret.record = klirecords[1];
                            }
                        }
                        if (typeof ret.record === "undefined" || typeof ret.record.years === "undefined") {
                            callbackshm2("No Record:" + selvariablename, {
                                error: true,
                                message: "No Record:" + selvariablename
                            });
                            return;
                        }
                        var years = JSON.parse(ret.record.years);
                        var dayyears = JSON.parse(ret.record.years); // ret.record[selvariablename].years;
                        var mtitle = "";
                        mtitle += (ret.record.variable || "").length > 0 ? " " + ret.record.variable : "";
                        mtitle += " " + selstationid;
                        mtitle += (ret.record.stationname || "").length > 0 ? " " + ret.record.stationname : "";
                        mtitle += (ret.record.fromyear || "").length > 0 ? " von " + ret.record.fromyear : "";
                        mtitle += (ret.record.toyear || "").length > 0 ? " bis " + ret.record.toyear : "";
                        ret.record.fromyear = kla1625shmconfig.fromyear;
                        ret.record.toyear = kla1625shmconfig.toyear;
                        mtitle += (ret.record.fromyear || "").length > 0 ? " Filter von " + ret.record.fromyear : "";
                        mtitle += (ret.record.toyear || "").length > 0 ? " bis " + ret.record.toyear : "";
                        // Aufruf Heatmap mit Container und Matrix
                        matrix1 = {
                            title: mtitle,
                            fromyear: ret.record.fromyear,
                            toyear: ret.record.toyear,
                            colheaders: [],
                            rowheaders: [],
                            data: []
                        };

                        var irow = 0;
                        hmoptions.cbucketdata = {}; // year mit: toyear, histo, yearmin, yearmax, yearsum, yearcount
                        var numberhisto = new Array(10).fill(0);
                        for (var year in years) {
                            if (years.hasOwnProperty(year)) {
                                if (parseInt(year) < kla1625shmconfig.fromyear || parseInt(year) > kla1625shmconfig.toyear) {
                                    continue;
                                }
                                matrix1.rowheaders.push(year);
                                var rowvalues = years[year];
                                matrix1.data[irow] = [];
                                for (var icol = 0; icol < 365; icol++) {
                                    if (typeof rowvalues[icol] === "undefined") {
                                        matrix1.data[irow][icol] = null;
                                    } else if (rowvalues[icol] === null || rowvalues[icol] === "" || rowvalues[icol].trim().length === 0) {
                                        matrix1.data[irow][icol] = null;
                                    } else if (rowvalues[icol] === "-9999" || rowvalues[icol] === "-999.9") {
                                        matrix1.data[irow][icol] = null;
                                    } else {
                                        matrix1.data[irow][icol] = rowvalues[icol];
                                        if (hmoptions.minmax === true) {
                                            var hmval = parseFloat(rowvalues[icol]);
                                            if (!isNaN(hmval)) {
                                                hmoptions.sumval += hmval;
                                                if (isNaN(hmoptions.sumval)) {
                                                    console.log("*****" + hmval);
                                                    debugger;
                                                }
                                                hmoptions.countval += 1;
                                                if (hmoptions.minval === null) {
                                                    hmoptions.minval = hmval;
                                                } else if (hmoptions.minval > hmval) {
                                                    hmoptions.minval = hmval;
                                                }
                                                if (hmoptions.maxval === null) {
                                                    hmoptions.maxval = hmval;
                                                } else if (hmoptions.maxval < hmval) {
                                                    hmoptions.maxval = hmval;
                                                }
                                                if (hmoptions.minmaxhistogram === true) {
                                                    hmvalstr = "" + Math.round(parseFloat(rowvalues[icol]));
                                                    if (typeof histo1[hmvalstr] === "undefined") {
                                                        histo1[hmvalstr] = 0;
                                                    }
                                                    histo1[hmvalstr] += 1;
                                                }
                                                if (hmoptions.cbuckets === true) {
                                                    //    hmoptions.cbucketdata = {};  // year mit: toyear, histo, minval, maxval, valsum, valcount
                                                    // berechnen buckyear für das Klimabucket
                                                    // 1961 bis 1990 als Referenzperiode; 1961 = 30*
                                                    var buck0 = parseInt(year);
                                                    var buck1 = buck0 - 1661; // 65 * 30 = 1950 Rest 11
                                                    // oder 1661 als Basisjahr und damit rechnen
                                                    var steps = parseInt(kla1625shmconfig.step || 30);
                                                    var buck2 = Math.floor(buck1 / steps);
                                                    var buck3 = 1661 + (buck2) * steps;
                                                    var buckyear = "" + buck3;
                                                    if (typeof hmoptions.cbucketdata[buckyear] === "undefined") {
                                                        hmoptions.cbucketdata[buckyear] = {
                                                            toyear: buck3 + steps - 1,
                                                            histo: [],
                                                            minval: null,
                                                            maxval: null,
                                                            valsum: 0,
                                                            valcount: 0,
                                                            numberhisto: []
                                                        };
                                                        hmoptions.cbucketdata[buckyear].numberhisto = new Array(10).fill(0);
                                                    }
                                                    var wert = rowvalues[icol];
                                                    var inum = 0;
                                                    var numt = wert.split(".");
                                                    if (numt.length === 2) {
                                                        inum = parseInt(numt[1].substr(0, 1));
                                                    }
                                                    hmoptions.cbucketdata[buckyear].numberhisto[inum] += 1;
                                                    hmoptions.cbucketdata[buckyear].valsum += hmval;
                                                    hmoptions.cbucketdata[buckyear].valcount += 1;
                                                    if (hmoptions.cbucketdata[buckyear].minval === null) {
                                                        hmoptions.cbucketdata[buckyear].minval = hmval;
                                                    } else if (hmoptions.cbucketdata[buckyear].minval > hmval) {
                                                        hmoptions.cbucketdata[buckyear].minval = hmval;
                                                    }
                                                    if (hmoptions.cbucketdata[buckyear].maxval === null) {
                                                        hmoptions.cbucketdata[buckyear].maxval = hmval;
                                                    } else if (hmoptions.cbucketdata[buckyear].maxval < hmval) {
                                                        hmoptions.cbucketdata[buckyear].maxval = hmval;
                                                    }
                                                    if (typeof hmoptions.cbucketdata[buckyear].histo[hmvalstr] === "undefined") {
                                                        hmoptions.cbucketdata[buckyear].histo[hmvalstr] = 0;
                                                    }
                                                    hmoptions.cbucketdata[buckyear].histo[hmvalstr] += 1;
                                                }
                                            } else {
                                                matrix1.data[irow][icol] = null;
                                                console.log("Keine formal korrekte Temperatur:" + rowvalues[icol]);
                                                debugger;
                                            }
                                        }
                                    }
                                }
                                irow++;
                            }
                        }

                        // hier ist das Layout nochmal zu kontrollieren
                        hmoptions.histo = histo1;
                        if (kla1625shmconfig.heatmaps === true) {
                            var erg = kla9020fun.getHeatmap(cid, kla1625shmconfig.heatmapsx, matrix1, hmoptions, function (ret) {
                                sysbase.putMessage("Heatmap ausgegeben", 1);
                                // if (hmoptions.minmax === true) debugger;
                                callbackshm2(null, {
                                    error: false,
                                    message: "Heatmap ausgegeben",
                                    matrix: matrix1,
                                    options: uihelper.cloneObject(hmoptions),
                                    hoptions: ret.hoptions,
                                    hcwrapperid: ret.hcwrapperid,
                                    histo: hmoptions.histo,
                                    temparray: ret.temparray
                                });
                                return;
                            });
                        } else {
                            callbackshm2(null, {
                                error: false,
                                message: "Heatmap nicht ausgegeben",
                                matrix: matrix1,
                                options: uihelper.cloneObject(hmoptions),
                                hoptions: ret.hoptions,
                                hcwrapperid: ret.hcwrapperid,
                                histo: hmoptions.histo,
                                temparray: ret.temparray
                            });
                            return;
                        }
                    } catch (err) {
                        sysbase.putMessage("Error:" + err, 3);
                        console.log(err);
                        console.log(err.stack);
                        callbackshm2("Error", {
                            error: true,
                            message: "Heatmap ausgegeben:" + err
                        });
                        return;
                    }
                },
                function (ret, callbackshm4) {
                    // hier muss die matrix1-Struktur übergeben werden
                    // kla1625shm.paintT(selvariablename, selsource, selstationid, ret.matrix);
                    callbackshm4("Finish", ret);
                    return;
                }
            ],
            function (error, ret) {
                callbackh0(ret);
                return;
            });
    };


    kla1625shm.klihisto2 = function (cid, selvariable, selsource, selstationid, starecord, hmatrix, hoptions, cb1625h) {
        var ret = {
            error: false,
            message: ""
        };

        //$(cid).addClass("doprintthis");
        /**
         * Histogramm ausgeben, wenn übergeben
         */
        var temparray = [];
        if (hoptions.minmax === true && typeof hoptions.histo === "object" && Object.keys(hoptions.histo).length > 0) {
            temparray = [];
            // Ergänzen der Temperaturen ohne count
            for (var ival = -50; ival <= 50; ival++) {
                var valstr = "" + ival;
                if (typeof hoptions.histo[valstr] === "undefined") {
                    hoptions.histo[valstr] = 0;
                }
            }
            var tempvals = Object.keys(hoptions.histo);
            var mincount = null;
            var maxcount = null;
            for (var i = 0; i < tempvals.length; i++) {
                var count = hoptions.histo[tempvals[i]];
                if (mincount === null) {
                    mincount = count;
                } else if (count < mincount) {
                    mincount = count;
                }
                if (maxcount === null) {
                    maxcount = count;
                } else if (count > maxcount) {
                    maxcount = count;
                }
                temparray.push({
                    temp: tempvals[i],
                    count: count
                });
            }
            temparray.sort(function (a, b) {
                if (parseInt(a.temp) < parseInt(b.temp))
                    return -1;
                if (parseInt(a.temp) > parseInt(b.temp))
                    return 1;
                return 0;
            });
            var sparkpoints = [];
            var xvalues = [];
            for (var i = 0; i < temparray.length; i++) {
                //sparkpoints.push(temparray[i].count);
                //xvalues.push(temparray[i].temp);
                sparkpoints.push([temparray[i].temp, temparray[i].count]);

            }
            var tableid;
            var bigchart = {};
            if (hoptions.cbuckets === true && typeof hoptions.cbucketdata === "object" && Object.keys(hoptions.cbucketdata).length > 0) {
                tableid = "tbl" + Math.floor(Math.random() * 100000) + 1;

                if (kla1625shmconfig.temptable === true) {
                    $(cid)
                        .append($("<h3/>", {
                            text: "Histogramm Temperaturverteilung " + selvariable + " " + klirecords[0].titel,
                            class: "doprintthis"
                        }))
                        .append($("<table/>", {
                                id: tableid,
                                border: "2",
                                rules: "all",
                                class: "doprintthis tablesorter",
                                css: {
                                    float: "left",
                                    margin: "10px",
                                    width: "95%",
                                    layout: "fixed",
                                    "background-color": "white"
                                }
                            })
                            .append($("<thead/>")
                                .append($("<tr/>")
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Periode"
                                    }))
                                    .append($("<th/>", {
                                        width: "40%",
                                        html: "Histogramm"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Min"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Max"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Avg"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Kurtosis<br>Skewness"
                                    }))
                                    .append($("<th/>", {
                                        width: "10%",
                                        html: "Shapiro Wilk W/P"
                                    }))
                                )
                            )
                            .append($("<tbody/>"))
                        );
                }
                /**
                 * hier wird die Gesamtzeile eingeschoben und ausgegeben
                 * für split stehen bereit selvariable, selsource, selstationid, starecord,
                 * klirecords.push(ret1.records[0]);
                 * stationrecord = ret1.records[0];
                 * sowie hmatrix.fromyear + "-" + hmatrix.toyear
                 */
                var sparkid = "spark" + Math.floor(Math.random() * 100000) + 1;
                if (kla1625shmconfig.temptable === true) {
                    $("#" + tableid + " tbody")
                        .append($("<tr/>")
                            .append($("<td/>", {
                                html: hmatrix.fromyear + "-" + hmatrix.toyear
                            }))
                            .append($("<td/>")
                                .append($("<span/>", {
                                    id: sparkid,
                                    css: {
                                        width: "100%",
                                        float: "left"
                                    }
                                }))
                            )
                            .append($("<td/>", {
                                align: "center",
                                html: hoptions.minval
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: hoptions.maxval
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: (hoptions.sumval / hoptions.countval).toFixed(2)
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: "&nbsp;"
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: "&nbsp;<br>&nbsp;<br>&nbsp;<br>"
                            }))
                        );
                    $("#" + sparkid).sparkline(sparkpoints, {
                        type: 'line',
                        height: 60,
                        fillColor: "red",
                        defaultPixelsPerValue: 3,
                        chartRangeMin: mincount,
                        chartRangeMax: maxcount,
                        lineColor: "red",
                        composite: false
                    });
                }
            }

            /**
             * Loop über die Klimaperioden
             */
            var bucknumberprot = "";
            var buckyears = Object.keys(hoptions.cbucketdata);
            for (var ibuck = 0; ibuck < buckyears.length; ibuck++) {
                bucknumberprot += " " + JSON.stringify(hoptions.cbucketdata[buckyears[ibuck]].numberhisto);
                temparray = [];
                var bucket = hoptions.cbucketdata[buckyears[ibuck]];
                // Ergänzen der Temperaturen ohne count
                for (var ival = -50; ival <= 50; ival++) {
                    var valstr = "" + ival;
                    if (typeof bucket.histo[valstr] === "undefined") {
                        bucket.histo[valstr] = 0;
                    }
                }
                var tempvals = Object.keys(bucket.histo);
                var mincount = null;
                var maxcount = null;
                for (var i = 0; i < tempvals.length; i++) {
                    var count = bucket.histo[tempvals[i]];
                    if (mincount === null) {
                        mincount = count;
                    } else if (count < mincount) {
                        mincount = count;
                    }
                    if (maxcount === null) {
                        maxcount = count;
                    } else if (count > maxcount) {
                        maxcount = count;
                    }
                    temparray.push({
                        temp: tempvals[i],
                        count: count
                    });
                }
                temparray.sort(function (a, b) {
                    if (parseInt(a.temp) < parseInt(b.temp))
                        return -1;
                    if (parseInt(a.temp) > parseInt(b.temp))
                        return 1;
                    return 0;
                });
                var sparkpoints = [];
                for (var i = 0; i < temparray.length; i++) {
                    sparkpoints.push(temparray[i].count);
                }
                // Kennziffern
                var kur = ss.sampleKurtosis(sparkpoints);
                var skew = ss.sampleSkewness(sparkpoints);
                var calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2);
                calc1 += "<br>" + (kur - skew ** 2).toFixed(2);
                /*
                calc1 += "<br>" + ss.standardDeviation(sparkpoints).toFixed(2);
                calc1 += "<br>" + ss.sampleStandardDeviation(sparkpoints).toFixed(2);
                calc1 += "<br>" + ss.medianAbsoluteDeviation(sparkpoints).toFixed(2);
                */
                var w = new Vector(sparkpoints);
                var wperg = new Normality.shapiroWilk(w);
                var calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);
                //var lm = new Regression.linear(l, w);


                // Ausgabe
                var sparkid = "spark" + Math.floor(Math.random() * 100000) + 1;

                if (kla1625shmconfig.temptable === true) {
                    $("#" + tableid + " tbody")
                        .append($("<tr/>", {
                                class: "kla1625shmsplit",
                                fromyear: buckyears[ibuck],
                                toyear: bucket.toyear,
                                selvariable: selvariable,
                                selsource: selsource,
                                selstationid: selstationid
                            })
                            .append($("<td/>", {
                                html: buckyears[ibuck] + "-" + bucket.toyear
                            }))
                            .append($("<td/>")
                                .append($("<span/>", {
                                    id: sparkid,
                                    class: "mouseoverdemo",
                                    css: {
                                        width: "100%",
                                        float: "left"
                                    }
                                }))
                            )
                            .append($("<td/>", {
                                align: "center",
                                html: bucket.minval
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: bucket.maxval
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: (bucket.valsum / bucket.valcount).toFixed(2)
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: calc1
                            }))
                            .append($("<td/>", {
                                align: "center",
                                html: calc2
                            }))
                        );
                    $("#" + sparkid).sparkline(sparkpoints, {
                        /*
                        type: 'bar',
                        height: 60,
                        barColor: "red",
                        negBarColor: "blue",
                        barWidth: 3,
                        barSpacing: 0,
                        fillColor: false,
                        defaultPixelsPerValue: 3,
                        chartRangeMin: mincount,
                        chartRangeMax: maxcount
                        */
                        type: 'line',
                        height: 60,
                        fillColor: "red",
                        defaultPixelsPerValue: 3,
                        chartRangeMin: mincount,
                        chartRangeMax: maxcount,
                        lineColor: "red",
                        composite: false
                    });
                }
            }

            /*
            $("#" + tableid).parent().append($("<span/>", {
                html: bucknumberprot
            }));
            */
            if (kla1625shmconfig.decimals === true) {
                var divid = "div" + Math.floor(Math.random() * 100000) + 1;
                var chartid = divid + "c";
                /* die tableid hat links oder rechts unterschieden, das muss bei cid nicht so sein?
                $("#" + tableid)
                    .parent()
                */
                $(cid)
                    .append($("<div/>", {
                            id: divid,
                            css: {
                                float: "left",
                                overflow: "hidden",
                                "background-color": "white",
                                margin: "10px",
                                width: "90%"
                            }
                        })
                        .append($("<h3/>", {
                            text: "Histogramm 1. Dezimalstelle " + selvariable + " " + klirecords[0].titel,
                            class: "doprintthis"
                        }))
                        .append($("<canvas/>", {
                            id: chartid,
                            class: "doprintthis",
                            selvariable: selvariable,
                            css: {
                                "text-align": "center"
                            }
                        }))
                    );

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
                        mytype: selvariable,
                        onClick: function (mouseEvent, chart) {
                            var mytype = this.options.mytype;
                            var myChart = myCharts[mytype];
                            var firstPoint = myChart.getElementAtEvent(mouseEvent)[0];
                            if (firstPoint) {
                                var fpIndex = firstPoint._index;
                                var fpDataIndex = firstPoint._datasetIndex;
                                var xlabel = myChart.data.labels[firstPoint._index];
                                var ylabel = myChart.data.datasets[firstPoint._datasetIndex].label;
                                var value = myChart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];

                                var syears = ylabel.split("-");
                                /**
                                 * echte Werte später
                                 */
                                window.parent.sysbase.setCache("regstation", JSON.stringify({
                                    starecord: starecord,
                                    klirecords: klirecords,
                                    fromyear: syears[0],
                                    toyear: syears[1]
                                }));
                                var tourl = "klaheatmap.html" + "?" + "stationid=" + klirecords[0].stationid + "&source=" + klirecords[0].source + "&variablename=" + klirecords[0].variable;
                                var tabname = klirecords[0].stationname;
                                var idc21 = window.parent.sysbase.tabcreateiframe(tabname, "", "re-klima", "kla1627dec", tourl);
                                window.parent.$(".tablinks[idhash='#" + idc21 + "']").click();
                            }

                            console.log(ylabel + ":" + value);
                        }

                    }
                };
                for (var ibuck = 0; ibuck < buckyears.length; ibuck++) {
                    bucknumberprot += " " + JSON.stringify(hoptions.cbucketdata[buckyears[ibuck]].numberhisto);
                    config.data.datasets.push({
                        label: buckyears[ibuck] + "-" + hoptions.cbucketdata[buckyears[ibuck]].toyear,
                        data: hoptions.cbucketdata[buckyears[ibuck]].numberhisto,
                        /* backgroundColor: "red", */
                        /* borderColor: "red", */
                        fill: false,
                        borderWidth: 2
                    });
                }
                myCharts[selvariable] = new Chart(ctx, config);
                /*
                $('#' + chartid).click(function (e) {
                    debugger;
                    var activePoints = myChart.getElementsAtEvent(event);
                    var activeDataSet = myChart.getDatasetAtEvent(event);

                    if (activePoints.length > 0) {
                        var clickedDatasetIndex = activeDataSet[0]._datasetIndex;
                        var clickedElementIndex = activePoints[0]._index;
                        var value = myChart.data.datasets[clickedDatasetIndex].data[clickedElementIndex];
                    }
                    // todo: add code to do something with value.
                });
                */
            }
            cb1625h(ret);
            return;
        } else {
            cb1625h(ret);
            return;
        }
    };


    /**
     * kla1625shmsplit - Splitten Sommer/Winter Histogramm
     * in neue Zeilen der Zieltabelle
     * starecord hat source, stationid
     * klirecords[0] oder [1] mit variable
     */
    $(document).on("click", ".kla1625shmsplit", function (evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
        var splstationid = $(this).closest("tr").attr("selstationid");
        var splsource = $(this).closest("tr").attr("selsource");
        var splvariable = $(this).closest("tr").attr("selvariable");
        var splfromyear = $(this).closest("tr").attr("fromyear");
        var spltoyear = $(this).closest("tr").attr("toyear");

        var oldsparkid = $(this).closest("tr").find("span").attr("id");
        // from - to Logik mit den years
        //var years = JSON.parse(ret.record.years);
        var splrecord = klirecords[0];
        if (splrecord.variable !== splvariable) {
            splrecord = klirecords[1];
        }
        var sun = {
            numberhisto: [],
            valsum: 0,
            valcount: 0,
            minval: null,
            maxval: null,
            maxcount: 0
        };
        var win = {
            numberhisto: [],
            valsum: 0,
            valcount: 0,
            minval: null,
            maxval: null,
            maxcount: 0
        };
        var years = JSON.parse(splrecord.years);
        /*
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
            }
        }
        */
        var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        sun.temphisto = new Array(101).fill(0);
        win.temphisto = new Array(101).fill(0);
        for (var iyear = parseInt(splfromyear); iyear <= parseInt(spltoyear); iyear++) {
            if (typeof years[iyear] !== "undefined") {
                if (uihelper.isleapyear(iyear)) {
                    mdtable[1] = 29;
                } else {
                    mdtable[1] = 28;
                }
                var splfromday = 0;
                var spltoday = 0;
                var yearvals = years["" + iyear];
                /**
                 * Loop über die 12 Monate
                 * je Monat Zuweisung des "richtigen" Objekts sun oder win als work
                 */
                var wrk = {};
                for (var imon = 0; imon < 12; imon++) {
                    if (imon >= 0 && imon <= 2 || imon >= 9 && imon <= 11) {
                        wrk = win;
                    } else {
                        wrk = sun;
                    }
                    spltoday = splfromday + mdtable[imon];

                    for (var iday = splfromday; iday < spltoday; iday++) {
                        var dval1 = yearvals[iday];
                        if (dval1 !== null && dval1 !== -9999 && !isNaN(dval1)) {
                            var dval = parseFloat(dval1);
                            var inum = 0;
                            var numt = dval1.split(".");
                            if (numt.length === 2) {
                                inum = parseInt(numt[1].substr(0, 1));
                            }
                            wrk.valsum += dval;
                            wrk.valcount += 1;
                            if (wrk.minval === null) {
                                wrk.minval = dval;
                            } else if (dval < wrk.minval) {
                                wrk.minval = dval;
                            }
                            if (wrk.maxval === null) {
                                wrk.maxval = dval;
                            } else if (dval > wrk.maxval) {
                                wrk.maxval = dval;
                            }
                            var itemp = Math.round(dval);
                            itemp += 50;
                            if (itemp >= 0 && itemp <= 100) {
                                wrk.temphisto[itemp] += 1;
                            } else if (itemp < 0) {
                                wrk.temphisto[0] += 1;
                            } else {
                                wrk.temphisto[100] += 1;
                            }
                        }
                    }
                    splfromday = splfromday + mdtable[imon];
                }
            }
        }
        // Kennziffern Kurtosis, Skewness, Shapiro Wilk-Test mit P und W-Wert
        var kur = ss.sampleKurtosis(sun.temphisto);
        var skew = ss.sampleSkewness(sun.temphisto);
        sun.calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2) + "<br>" + (kur - skew ** 2).toFixed(2);
        var w = new Vector(sun.temphisto);
        var wperg = new Normality.shapiroWilk(w);
        sun.calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);

        var kur = ss.sampleKurtosis(win.temphisto);
        var skew = ss.sampleSkewness(win.temphisto);
        win.calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2) + "<br>" + (kur - skew ** 2).toFixed(2);
        var w = new Vector(win.temphisto);
        var wperg = new Normality.shapiroWilk(w);
        win.calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);


        // Ausgabe der Zeile mit den Sommerwerten
        var baserow = $(this).closest("tr");
        var sparkid = "S" + Math.floor(Math.random() * 100000) + 1;
        $(baserow)
            .after($("<tr/>", {
                    id: sparkid + "s"
                })
                .append($("<td/>", {
                    html: splfromyear + "-" + spltoyear + " 04-09 sun"
                }))
                .append($("<td/>")
                    .append($("<span/>", {
                        id: sparkid,
                        class: "mouseoverdemo",
                        css: {
                            width: "100%",
                            float: "left"
                        }
                    }))
                )
                .append($("<td/>", {
                    align: "center",
                    html: sun.minval
                }))
                .append($("<td/>", {
                    align: "center",
                    html: sun.maxval
                }))
                .append($("<td/>", {
                    align: "center",
                    html: (sun.valsum / sun.valcount).toFixed(2)
                }))
                .append($("<td/>", {
                    align: "center",
                    html: sun.calc1
                }))
                .append($("<td/>", {
                    align: "center",
                    html: sun.calc2
                }))
            );
        $("#" + sparkid).sparkline(sun.temphisto, {
            /*
            type: 'bar',
            height: 60,
            barColor: "red",
            negBarColor: "blue",
            barWidth: 3,
            barSpacing: 0,
            fillColor: false,
            defaultPixelsPerValue: 3,
            chartRangeMin: 0,
            chartRangeMax: Math.max(sun.temphisto),
            composite: false
            */
            type: 'line',
            height: 60,
            fillColor: "red",
            defaultPixelsPerValue: 3,
            chartRangeMin: 0,
            chartRangeMax: Math.max(sun.temphisto),
            lineColor: "red",
            composite: false



        });

        // auf oldsparkid
        $("#" + oldsparkid).sparkline(sun.temphisto, {
            type: 'line',
            defaultPixelsPerValue: 3,
            lineColor: "black",
            fillColor: false,
            composite: true
        });

        var sparkid1 = "S" + Math.floor(Math.random() * 100000) + 1;
        $("#" + sparkid + "s")
            .after($("<tr/>", {
                    id: sparkid + "w"
                })
                .append($("<td/>", {
                    html: splfromyear + "-" + spltoyear + " 01-03, 10-12 win"
                }))
                .append($("<td/>")
                    .append($("<span/>", {
                        id: sparkid1,
                        class: "mouseoverdemo",
                        css: {
                            width: "100%",
                            float: "left"
                        }
                    }))
                )
                .append($("<td/>", {
                    align: "center",
                    html: win.minval
                }))
                .append($("<td/>", {
                    align: "center",
                    html: win.maxval
                }))
                .append($("<td/>", {
                    align: "center",
                    html: (win.valsum / win.valcount).toFixed(2)
                }))
                .append($("<td/>", {
                    align: "center",
                    html: win.calc1
                }))
                .append($("<td/>", {
                    align: "center",
                    html: win.calc2
                }))
            );
        $("#" + sparkid1).sparkline(win.temphisto, {
            /*
            type: 'bar',
            height: 60,
            barColor: "red",
            negBarColor: "blue",
            barWidth: 3,
            barSpacing: 0,
            fillColor: false,
            defaultPixelsPerValue: 3,
            chartRangeMin: 0,
            chartRangeMax: Math.max(win.temphisto),
            composite: false
            */
            type: 'line',
            height: 60,
            fillColor: "red",
            defaultPixelsPerValue: 3,
            chartRangeMin: 0,
            chartRangeMax: Math.max(sun.temphisto),
            lineColor: "red",
            composite: false



        });


        // auf oldsparkid
        $("#" + oldsparkid).sparkline(win.temphisto, {
            type: 'line',
            defaultPixelsPerValue: 3,
            lineColor: "blue",
            fillColor: false,
            composite: true
        });

        $(".tablesorter").tablesorter({
            theme: "blue",
            widgets: ['filter', 'cssStickyHeaders'],
            widthFixed: true,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es
    });


    /**
     * klidistr2calc
     * @param {*} selvariable
     * @param {*} selsource
     * @param {*} selstationid
     * @param {*} ret1
     * returns object mit
     *  - sunconfig und winconfig
     */
    kla1625shm.klidistr2calc = function (selvariable, selsource, selstationid, ret1) {
        //Chart.defaults.global.plugins.colorschemes.override = true;
        //Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var yAxesticks = [];
        var newArr;

        var sunconfig = {
            type: 'line',
            data: {
                labels: [],
                datasets: [],
                backgroundColor: "yellow"
            },
            options: {
                plugins: {
                    colorschemes: {
                        scheme: 'brewer.Paired12'
                    }
                },
                mytype: selvariable,
                maxcount: 0,
                scales: {
                    xAxes: [{
                        ticks: {
                            minRotation: 88,
                            autoskip: true
                            /* autoSkipPadding: 10 */
                        },
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 500
                        }
                    }]
                }
            }
        };

        var winconfig = {
            type: 'line',
            data: {
                labels: [],
                datasets: [],
                backgroundColor: "yellow"
            },
            options: {
                plugins: {
                    colorschemes: {
                        scheme: 'brewer.Paired12'
                    }
                },
                mytype: selvariable,
                maxcount: 0,
                scales: {
                    xAxes: [{
                        ticks: {
                            minRotation: 88,
                            autoskip: true
                            /* autoSkipPadding: 10 */
                        },
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 500
                        }
                    }]
                }
            }
        };

        for (var ilabel = 0; ilabel <= 100; ilabel++) {
            var itemp = ilabel - 50;
            var lab;
            if (itemp % 10 === 0) {
                lab = "" + itemp;
            } else {
                lab = "";
            }
            sunconfig.data.labels.push(lab);
            winconfig.data.labels.push(lab);
        }

        /**
         * sunconfig und winconfig für die Differenzierung
         */
        var mdtable = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        //sun.temphisto = new Array(101).fill(0); // von -50 bis +50
        //win.temphisto = new Array(101).fill(0); // von -50 bis +50
        if (typeof kla1625shmconfig.fromyear === "undefined") {
            var year1 = uihelper.getwmobucket(selparms.fromyear).fromyear;
            var year2 = uihelper.getwmobucket(selparms.toyear).toyear;
            kla1625shmconfig.fromyear = year1;
            kla1625shmconfig.toyear = year2;
            kla1625shmconfig.step = 30;
        }

        var distfromyear = parseInt(kla1625shmconfig.fromyear);
        var disttoyear = parseInt(kla1625shmconfig.toyear);
        var diststep = parseInt(kla1625shmconfig.step);
        var sunbucket = {};
        var winbucket = {};
        var ibucket = 0;
        var ebucket = distfromyear + diststep - 1;
        var sunbuckets = [];
        var winbuckets = [];
        // Initialisieren und auf Standard-Buckets runden oder vorher setzen!!!
        for (var ibuck = distfromyear; ibuck <= disttoyear; ibuck += diststep) {
            sunbuckets.push({
                fromyear: ibuck,
                toyear: ibuck + diststep - 1,
                temphisto: new Array(101).fill(0),
                valsum: 0,
                valcount: 0,
                minval: null,
                maxval: null
            });
            winbuckets.push({
                fromyear: ibuck,
                toyear: ibuck + diststep - 1,
                temphisto: new Array(101).fill(0),
                valsum: 0,
                valcount: 0,
                minval: null,
                maxval: null
            });
        }

        // years bereitstellen
        if (selvariable === "TMAX" && klirecords.length > 0) {
            ret1.record = klirecords[0];
        } else if (selvariable === "TMIN" && klirecords.length > 1) {
            ret1.record = klirecords[1];
        }

        var years = JSON.parse(ret1.record.years);
        for (var iyear = parseInt(distfromyear); iyear <= parseInt(disttoyear); iyear++) {
            if (typeof years[iyear] !== "undefined") {
                if (uihelper.isleapyear(iyear)) {
                    mdtable[1] = 29;
                } else {
                    mdtable[1] = 28;
                }
                var splfromday = 0;
                var spltoday = 0;
                var yearvals = years["" + iyear];
                /**
                 * Loop über die 12 Monate
                 * je Monat Zuweisung des "richtigen" Objekts sun oder win als work
                 */
                var wrk = {};
                for (var imon = 0; imon < 12; imon++) {
                    if (imon >= 0 && imon <= 2 || imon >= 9 && imon <= 11) {
                        for (var ibuck1 = 0; ibuck1 < winbuckets.length; ibuck1++) {
                            if (iyear >= winbuckets[ibuck1].fromyear && iyear <= winbuckets[ibuck1].toyear) {
                                wrk = winbuckets[ibuck1];
                                break;
                            }
                        }
                    } else {
                        for (var ibuck2 = 0; ibuck2 < sunbuckets.length; ibuck2++) {
                            if (iyear >= sunbuckets[ibuck2].fromyear && iyear <= sunbuckets[ibuck2].toyear) {
                                wrk = sunbuckets[ibuck2];
                                break;
                            }
                        }
                    }
                    spltoday = splfromday + mdtable[imon];
                    for (var iday = splfromday; iday < spltoday; iday++) {
                        var dval1 = yearvals[iday];
                        if (dval1 !== null && dval1 !== -9999 && !isNaN(dval1)) {
                            var dval = parseFloat(dval1);
                            var inum = 0;
                            if (selvariablename.indexOf("TMAX") >= 0 || selvariablename.indexOf("TMIN") >= 0) {
                                var numt = dval1.split(".");
                                if (numt.length === 2) {
                                    inum = parseInt(numt[1].substr(0, 1));
                                } else {
                                    debugger;
                                }
                            } else {
                                inum = parseInt(dval1.substr(dval1.length - 1));
                            }
                            wrk.valsum += dval;
                            wrk.valcount += 1;
                            if (wrk.minval === null) {
                                wrk.minval = dval;
                            } else if (dval < wrk.minval) {
                                wrk.minval = dval;
                            }
                            if (wrk.maxval === null) {
                                wrk.maxval = dval;
                            } else if (dval > wrk.maxval) {
                                wrk.maxval = dval;
                            }
                            var itemp = Math.round(dval);
                            itemp += 50;
                            if (itemp >= 0 && itemp <= 100) {
                                wrk.temphisto[itemp] += 1;
                            } else if (itemp < 0) {
                                wrk.temphisto[0] += 1;
                            } else {
                                wrk.temphisto[100] += 1;
                            }
                        }
                    }
                    splfromday = splfromday + mdtable[imon];
                }
            }
        }
        sunconfig.options.maxcount = 0;
        for (var ibuck = 0; ibuck < sunbuckets.length; ibuck++) {
            for (var imax = 0; imax <= 100; imax++) {
                if (sunbuckets[ibuck].temphisto[imax] > sunconfig.options.maxcount) {
                    sunconfig.options.maxcount = sunbuckets[ibuck].temphisto[imax];
                }
            }
            sunconfig.data.datasets.push({
                label: sunbuckets[ibuck].fromyear + "-" + sunbuckets[ibuck].toyear,
                data: sunbuckets[ibuck].temphisto,
                pointStyle: 'line',
                fill: false,
                borderWidth: 2
            });
        }

        winconfig.options.maxcount = 0;
        for (var ibuck = 0; ibuck < winbuckets.length; ibuck++) {
            for (var imax = 0; imax <= 100; imax++) {
                if (winbuckets[ibuck].temphisto[imax] > winconfig.options.maxcount) {
                    winconfig.options.maxcount = winbuckets[ibuck].temphisto[imax];
                }
            }
            winconfig.data.datasets.push({
                label: winbuckets[ibuck].fromyear + "-" + winbuckets[ibuck].toyear,
                data: winbuckets[ibuck].temphisto,
                pointStyle: 'line',
                fill: false,
                borderWidth: 2
            });
        }

        winconfig.options.scales.yAxes[0].ticks.max = 100;

        return {
            sunconfig: sunconfig,
            winconfig: winconfig
        };
    };

    /**
     * kla1625shm.klidistr2 - tempdistribution
     * Separate Charts für Sommer und Winter für die Distribution
     * starecord hat source, stationid
     * klirecords[0] oder [1] mit variable
     */
    kla1625shm.klidistr2 = function (cid, selvariable, selsource, selstationid, ret1, cb1625p) {
        try {
            var divid = "div" + Math.floor(Math.random() * 100000) + 1;
            var chartidsun = divid + "sun";
            var chartidwin = divid + "win";
            $(cid)
                .append($("<div/>", {
                        id: divid,
                        css: {
                            float: "left",
                            overflow: "hidden",
                            "background-color": "white",
                            margin: "10px",
                            width: "100%"
                        }
                    })
                    .append($("<h3/>", {
                        text: "Distribution " + selvariable + " Summer " + klirecords[0].titel,
                        class: "doprintthis"
                    }))
                    .append($("<canvas/>", {
                        id: chartidsun,
                        class: "doprintthis",
                        selvariable: selvariable,
                        css: {
                            "text-align": "center",
                            margin: "10px",
                            width: "90%"
                        }
                    }))
                    .append($("<div/>", {
                            css: {
                                "background-color": "lime",
                                width: "100%"
                            }
                        })
                        .append($("<br/>"))
                        .append($("<br/>"))
                    )

                    .append($("<h3/>", {
                        text: "Distribution " + selvariable + " Winter " + klirecords[0].titel,
                        class: "doprintthis"
                    }))
                    .append($("<canvas/>", {
                        id: chartidwin,
                        class: "doprintthis",
                        selvariable: selvariable,
                        css: {
                            "text-align": "center",
                            margin: "10px",
                            width: "90%"
                        }
                    }))

                );
            //Chart.defaults.global.plugins.colorschemes.override = true;
            //Chart.defaults.global.legend.display = true;
            // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html


            var ctx1 = document.getElementById(chartidsun).getContext('2d');
            myCharts[selvariable + "D1"] = new Chart(ctx1, ret1.distrs[selvariable].sunconfig);

            var ctx2 = document.getElementById(chartidwin).getContext('2d');
            myCharts[selvariable + "D2"] = new Chart(ctx2, ret1.distrs[selvariable].winconfig);
            cb1625p({
                error: false,
                message: "Distribution-Chart ausgegeben"
            });
            return;
        } catch (err) {
            console.log(err);
            cb1625p({
                error: true,
                message: "Distribution-Chart:" + err
            });
            return;
        }



        /*
        // Kennziffern Kurtosis, Skewness, Shapiro Wilk-Test mit P und W-Wert
        var kur = ss.sampleKurtosis(sun.temphisto);
        var skew = ss.sampleSkewness(sun.temphisto);
        sun.calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2) + "<br>" + (kur - skew ** 2).toFixed(2);
        var w = new Vector(sun.temphisto);
        var wperg = new Normality.shapiroWilk(w);
        sun.calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);

        var kur = ss.sampleKurtosis(win.temphisto);
        var skew = ss.sampleSkewness(win.temphisto);
        win.calc1 = kur.toFixed(2) + "<br>" + skew.toFixed(2) + "<br>" + (kur - skew ** 2).toFixed(2);
        var w = new Vector(win.temphisto);
        var wperg = new Normality.shapiroWilk(w);
        win.calc2 = "W: " + wperg.w.toFixed(4) + "<br>P: " + wperg.p.toFixed(4);
        */
    };


    /**
     * kla1625shm.klitemp2 Temperatur-Sparkline über Klima-Buckets
     * @param {*} cid
     * @param {*} selvariable
     * @param {*} selsource
     * @param {*} selstationid
     * @param {*} starecord
     * @param {*} hmatrix
     * @param {*} hoptions
     * @param {*} cb1625k
     */
    kla1625shm.klitemp2 = function (cid, selvariable, selsource, selstationid, starecord, hmatrix, hoptions, cb1625k) {
        var ret = {};
        var ciddiv = cid.substr(1) + "div";
        var tableid = cid.substr(1) + "tbl";
        $(cid)
            .append($("<h3/>", {
                text: "Temperaturverlauf " + selvariable + " " + klirecords[0].titel,
                class: "doprintthis",
            }))
            .append($("<div/>", {
                id: ciddiv + "L1",
                css: {
                    width: "55%",
                    margin: "10px",
                    float: "left",
                    "background-color": "white",
                    overflow: "hidden"
                }
            }))
            .append($("<div/>", {
                    id: ciddiv + "R1",
                    css: {
                        width: "40%",
                        float: "right",
                        overflow: "hidden"
                    }
                })
                .append($("<table/>", {
                        id: tableid,
                        class: "doprintthis tablesorter",
                        border: "2",
                        rules: "all",
                        css: {
                            width: "95%",
                            float: "left",
                            margin: "10px",
                            "background-color": "white"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Jahr"
                            }))
                            .append($("<th/>", {
                                html: "min"
                            }))
                            .append($("<th/>", {
                                html: "avg"
                            }))
                            .append($("<th/>", {
                                html: "max"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        // Loop über die Jahre
        // hoptions.cbucketdata[year]

        var miny = null;
        var maxy = null;
        var minvals = [];
        var avgvals = [];
        var maxvals = [];
        var minregvals = [];
        var avgregvals = [];
        var maxregvals = [];
        var ycount = 0;
        var baseyear = 0;
        for (var year in hoptions.cbucketdata) {
            if (hoptions.cbucketdata.hasOwnProperty(year)) {
                var nyear = parseInt(year);
                if (baseyear === 0) {
                    baseyear = nyear - 1;
                }
                ycount = nyear - baseyear;
                var yeardata = hoptions.cbucketdata[year];
                ycount++;
                var yearlabel = year + "-" + hoptions.cbucketdata[year].toyear;
                yeardata.avgval = yeardata.valsum / yeardata.valcount;
                $("#" + tableid)
                    .find("tbody")
                    .append($("<tr/>")
                        .append($("<td/>", {
                            html: yearlabel
                        }))
                        .append($("<td/>", {
                            html: yeardata.minval.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: yeardata.avgval.toFixed(1)
                        }))
                        .append($("<td/>", {
                            html: yeardata.maxval.toFixed(1)
                        }))
                    );
                minvals.push(yeardata.minval.toFixed(1));
                avgvals.push(yeardata.avgval.toFixed(1));
                maxvals.push(yeardata.maxval.toFixed(1));
                // Umrechnung auf Kelvin
                minregvals.push([ycount, yeardata.minval + 273.15]);
                avgregvals.push([ycount, yeardata.avgval + 273.15]);
                maxregvals.push([ycount, yeardata.maxval + 273.15]);

                if (miny === null) {
                    miny = yeardata.minval;
                } else if (miny < yeardata.minval) {
                    miny = yeardata.minval;
                }
                if (maxy === null) {
                    maxy = yeardata.maxval;
                } else if (maxy < yeardata.maxval) {
                    maxy = yeardata.maxval;
                }
            }
        }
        /**
         * Regressionsanalyse minvals, avgvals und maxvals als Array
         * https://tom-alexander.github.io/regression-js/
         */
        var result = regression.linear(minregvals, {
            order: 2,
            precision: 3
        });
        var mingradient = result.equation[0].toFixed(3);
        var minyIntercept = result.equation[1].toFixed(2);
        var minr2 = Math.round(result.r2 * 100);

        result = regression.linear(avgregvals, {
            order: 2,
            precision: 3
        });
        var avggradient = result.equation[0].toFixed(3);
        var avgyIntercept = result.equation[1].toFixed(2);
        var avgr2 = Math.round(result.r2 * 100);

        result = regression.linear(maxregvals, {
            order: 2,
            precision: 3
        });
        var maxgradient = result.equation[0].toFixed(3);
        var maxyIntercept = result.equation[1].toFixed(2);
        var maxr2 = Math.round(result.r2 * 100);

        var mindelta = minregvals[minregvals.length - 1][1] - minregvals[0][1];
        var avgdelta = avgregvals[avgregvals.length - 1][1] - avgregvals[0][1];
        var maxdelta = maxregvals[maxregvals.length - 1][1] - maxregvals[0][1];
        $("#" + tableid)
            .find("tbody")
            .append($("<tr/>")
                .append($("<td/>", {
                    html: "Delta 1-n"
                }))
                .append($("<td/>", {
                    html: mindelta.toFixed(1)
                }))
                .append($("<td/>", {
                    html: avgdelta.toFixed(1)
                }))
                .append($("<td/>", {
                    html: maxdelta.toFixed(1)
                }))
            );



        $("#" + tableid)
            .find("tbody")
            .append($("<tr/>")
                .append($("<td/>", {
                    html: "Steigung g"
                }))
                .append($("<td/>", {
                    html: mingradient
                }))
                .append($("<td/>", {
                    html: avggradient
                }))
                .append($("<td/>", {
                    html: maxgradient
                }))
            );


        $("#" + tableid)
            .find("tbody")
            .append($("<tr/>")
                .append($("<td/>", {
                    html: "Bestimmtheit r2 %"
                }))
                .append($("<td/>", {
                    html: minr2
                }))
                .append($("<td/>", {
                    html: avgr2
                }))
                .append($("<td/>", {
                    html: maxr2
                }))
            );

        var chartid = ciddiv + "chart";
        $("#" + ciddiv + "L1")
            .append($("<canvas/>", {
                id: chartid,
                class: "doprintthis",
                css: {
                    "text-align": "center"
                }
            }));

        var ctx = document.getElementById(chartid).getContext('2d');
        //Chart.defaults.global.plugins.colorschemes.override = true;
        //Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html

        var config = {
            type: 'line',
            data: {
                labels: Object.keys(hoptions.cbucketdata),
                datasets: [{
                        label: "min",
                        data: minvals,
                        backgroundColor: "blue",
                        borderColor: "blue",
                        fill: false,
                        borderWidth: 2
                    },
                    {
                        label: "avg",
                        data: avgvals,
                        backgroundColor: "black",
                        /* window.chartColors.black,*/
                        borderColor: "black",
                        /* window.chartColors.black, */
                        fill: false,
                        borderWidth: 2
                    },
                    {
                        label: "max",
                        data: maxvals,
                        backgroundColor: "red",
                        borderColor: "red",
                        fill: false,
                        borderWidth: 2
                    }
                ],
                backgroundColor: "yellow"
            },
            options: {
                plugins: {
                    colorschemes: {
                        scheme: 'tableau.HueCircle19'
                    }
                }
            }
        };
        window.chart1 = new Chart(ctx, config);
        cb1625k(ret);
        return;
    };



    /**
     * kla1625shm.klihyde2 - Ausgabe der HYDE-Daten
     * Tabelle mit Spalten und Unterteilungen nach Variablen
     * Prüfen: Line-Chart je Variablen, 3 Linien L1, L2, L3 - in %-Egalisierung auf jeweiliges Maximum
     * oder height entsprechend erweitern
     * {"1750": {
        "L1":{"popc_":175.11806088,"rurc_":0,"uopp_":0},
        "L2":{"popc_":1281.765752112,"rurc_":246.622361287,"uopp_":0},
        "L3":{"popc_":1275.5785712538,"rurc_":611.3757526348,"uopp_":0}
       },
     * @param {*} cid - Container-ID, wird vorgegeben, mit #
     * @param {*} selstationid - wird ausgewertet, Daten stehen in klihyde
     * @param {*} starecord - wird ausgewertet für Geo-Koordinaten
     * @param {*} cb1625j - Callback
     */
    kla1625shm.klihyde2 = function (cid, selstationid, starecord, cb1625j) {
        // Transformation der Daten nach Variable, year, L1, L2, L3 in Struktur
        // Dasmit Tabelle mit Charts
        var hyderep = {}; // variable - year - level
        if (typeof klihyde.data === "string" && klihyde.data.length > 0) {
            klihyde.data = JSON.parse(klihyde.data);
        }
        for (var year in klihyde.data) {
            if (klihyde.data.hasOwnProperty(year)) {
                var yeardata = klihyde.data[year];
                for (var level in yeardata) {
                    if (yeardata.hasOwnProperty(level)) {
                        var leveldata = yeardata[level];
                        for (var variablename in leveldata) {
                            if (leveldata.hasOwnProperty(variablename)) {
                                var wert = leveldata[variablename];
                                // hier ist die finale Werteebene
                                if (typeof hyderep[variablename] === "undefined") {
                                    hyderep[variablename] = {};
                                }
                                if (typeof hyderep[variablename][year] === "undefined") {
                                    hyderep[variablename][year] = {};
                                }
                                if (typeof hyderep[variablename][year][level] === "undefined") {
                                    hyderep[variablename][year][level] = 0;
                                }
                                hyderep[variablename][year][level] += wert;
                            }
                        }
                    }
                }
            }
        }

        var hcount = 0;
        $(cid)
            .append($("<div/>", {
                    css: {
                        width: "100%",
                        "text-align": "center"
                    }
                })
                .append($("<h2>", {
                    text: "Auswertung HYDE-Daten " + klirecords[0].titel,
                    class: "doprintthis"

                }))
            );
        for (var variablename in hyderep) {
            if (hyderep.hasOwnProperty(variablename)) {
                hcount++;
                var ciddiv = cid + variablename;
                var chartdiv = ciddiv + "c";
                var tableid = "tbl" + Math.floor(Math.random() * 100000) + 1;
                var gravec = []; // Vektor für Sparkline-Graphik
                var floatdirection = "right";
                if (hcount % 2 === 1) {
                    floatdirection = "left";
                }
                $(cid)
                    .append($("<div/>", {
                            css: {
                                width: "49%",
                                float: floatdirection,
                                overflow: "hidden"
                            }
                        })
                        .append($("<h2/>", {
                            html: variablename + " " + cfeCodes.getTitleKey("hydevariable", variablename),
                            class: "doprintthis",
                            css: {
                                width: "100%"
                            }
                        }))
                        .append($("<div/>", {
                            id: chartdiv.substr(1),
                            css: {
                                width: "50%",
                                float: "left",
                                overflow: "hidden"
                            }
                        }))
                        .append($("<div/>", {
                                id: ciddiv.substr(1),
                                css: {
                                    width: "40%",
                                    float: "right",
                                    overflow: "hidden"
                                }
                            })
                            .append($("<table/>", {
                                    id: tableid,
                                    class: "doprintthis tablesorter",
                                    border: "2",
                                    rules: "all",
                                    css: {
                                        width: "49%",
                                        float: "left"
                                    }
                                })
                                .append($("<thead/>")
                                    .append($("<tr/>")
                                        .append($("<th/>", {
                                            html: "Variable"
                                        }))
                                        .append($("<th/>", {
                                            html: "Jahr"
                                        }))
                                        .append($("<th/>", {
                                            html: "L1"
                                        }))
                                        .append($("<th/>", {
                                            html: "L2"
                                        }))
                                        .append($("<th/>", {
                                            html: "L3"
                                        }))
                                    )
                                )
                                .append($("<tbody/>"))
                            )
                        )
                    );
                // Loop über die Jahre
                // hyderep[variablename][year][level] += wert;
                var miny = null;
                var maxy = null;
                var L1vals = [];
                var L2vals = [];
                var L3vals = [];
                for (var year in hyderep[variablename]) {
                    if (hyderep[variablename].hasOwnProperty(year)) {
                        var yeardata = hyderep[variablename][year];
                        $("#" + tableid)
                            .find("tbody")
                            .append($("<tr/>")
                                .append($("<td/>", {
                                    html: variablename
                                }))
                                .append($("<td/>", {
                                    html: year
                                }))
                                .append($("<td/>", {
                                    html: yeardata.L1.toFixed(0)
                                }))
                                .append($("<td/>", {
                                    html: (yeardata.L1 + yeardata.L2).toFixed(0)
                                }))
                                .append($("<td/>", {
                                    html: (yeardata.L1 + yeardata.L2 + yeardata.L3).toFixed(0)
                                }))
                            );
                        gravec.push({
                            year: year,
                            L1: yeardata.L1.toFixed(0),
                            L2: (yeardata.L1 + yeardata.L2).toFixed(0),
                            L3: (yeardata.L1 + yeardata.L2 + yeardata.L3).toFixed(0)
                        });
                        L1vals.push(yeardata.L1.toFixed(0));
                        L2vals.push((yeardata.L1 + yeardata.L2).toFixed(0));
                        L3vals.push((yeardata.L1 + yeardata.L2 + yeardata.L3).toFixed(0));
                        if (miny === null) {
                            miny = yeardata.L1;
                        } else if (miny < yeardata.L1) {
                            miny = yeardata.L1;
                        }
                        if (maxy === null) {
                            maxy = yeardata.L1 + yeardata.L2 + yeardata.L3;
                        } else if (maxy < yeardata.L1 + yeardata.L2 + yeardata.L3) {
                            maxy = yeardata.L1 + yeardata.L2 + yeardata.L3;
                        }
                    }
                }
                var chartid = ciddiv + "chart";
                // $(cid)
                /*
                $(ciddiv)
                    .parent()
                    .append($("<div/>", {
                            css: {
                                width: "49%",
                                align: "right",
                                overflow: "auto",
                                "background-color": "white"
                            }
                        })
                        */
                // hier Canvas für Chartjs
                $(chartdiv)
                    .append($("<canvas/>", {
                        id: chartid,
                        class: "doprintthis",
                        css: {
                            "text-align": "center",
                            "background-color": "white"
                        }
                    }));
                //);

                var ctx = document.getElementById(chartid).getContext('2d');
                //Chart.defaults.global.plugins.colorschemes.override = true;
                //Chart.defaults.global.legend.display = true;
                // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
                var config = {
                    type: 'line',
                    data: {
                        labels: gravec.map(function (a) {
                            return a.year;
                        }),
                        datasets: [{
                                label: "L1",
                                data: gravec.map(function (a) {
                                    return a.L1;
                                }),
                                backgroundColor: "blue",
                                borderColor: "blue",
                                fill: false,
                                borderWidth: 2
                            },
                            {
                                label: "L2",
                                data: gravec.map(function (a) {
                                    return a.L2;
                                }),
                                backgroundColor: "black",
                                borderColor: "black",
                                fill: false,
                                borderWidth: 2
                            },
                            {
                                label: "L3",
                                data: gravec.map(function (a) {
                                    return a.L3;
                                }),
                                backgroundColor: "red",
                                borderColor: "red",
                                fill: false,
                                borderWidth: 2
                            }
                        ],
                        backgroundColor: "yellow"
                    },
                    options: {
                        plugins: {
                            colorschemes: {
                                scheme: 'tableau.HueCircle19'
                            }
                        }
                    }
                };
                window.chart1 = new Chart(ctx, config);
                /**
                 * Hier Chart-Ausgabe - mit chartJS wird eine Gesamtgraphik ausgegeben
                 */
                // hmatrixL, hoptionsL,
                // hmatrixR, hoptionsR,

            }
        }
        cb1625j({
            error: false,
            message: "HYDE ausgegeben"
        });
    };




    /**
     * Einblendung Stopuhr wärend langer AJAX-Aufrufe
     */
    kla1625shm.showclock = function (clockcontainer) {
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
        module.exports = kla1625shm;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1625shm;
        });
    } else {
        // included directly via <script> tag
        root.kla1625shm = kla1625shm;
    }
}());