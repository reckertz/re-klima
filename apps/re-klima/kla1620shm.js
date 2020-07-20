/*global $,this,window,module,define,root,global,self,var,async,sysbase,uihelper,kla9020fun,regression */
(function () {
    'use strict';
    var kla1620shm = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1620shm  bekommt über getCache pivotdata oder yearlats(?)
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
    var selparms;
    var selstationid = null;
    var selsource = null;
    var selvariablename = null;
    var starecord = null; // Selektionsparameter
    var savedwidth = null;
    var heatmapparms = {};
    var stationrecord;
    var yearindexarray = {};
    var matrix1 = {}; // aktive Datenmatrix, wenn gefüllt
    var histo1 = {}; // Histogramm auf Temperatur gerundet Ganzzahl
    var array1 = []; // aktives Array für d3
    var klirecords = [];

    var poprecord = {}; // Konfigurationsparameter mit Default-Zuweisung
    poprecord.qonly = true;
    poprecord.total = false;
    poprecord.mixed = true;
    poprecord.moon = false;
    poprecord.sunwinter = true;
    poprecord.export = false;

    kla1620shm.show = function (parameters, navigatebucket) {

        // if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {}
        if (typeof parameters !== "undefined" && parameters.length > 0) {
            selstationid = parameters[0].stationid;
            selsource = parameters[0].source;
            selvariablename = parameters[0].variablename;
            starecord = JSON.parse(parameters[0].starecord);
        } else {
            selparms = window.parent.sysbase.getCache("onestation");
            selparms = JSON.parse(selparms);
            selstationid = selparms.stationid;
            starecord = selparms.starecord;
            selsource = selparms.starecord.source;
            selvariablename = selparms.starecord.variablename;
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
        $(".headertitle").attr("title", "kla1620shm");
        $(".content").attr("pageid", "kla1620shm");
        $(".content").attr("id", "kla1620shm");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1620shm")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1620shm_isdirty",
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
        $("#kla1620shm.content")
            .append($("<div/>", {
                css: {
                    width: "100%",
                    "background-color": "lightsteelblue"
                }
            }));

        $("#kla1620shm.content").empty();
        $("#kla1620shm.content")
            .append($("<div/>", {
                    id: "kla1620shmbuttons",
                    css: {
                        width: "100%",
                        float: "left"
                    }
                })

                // Auswahl selvariablename



                .append($("<button/>", {
                    html: "Sparklines/Periode anzeigen",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.paintS(selvariablename, selsource, selstationid, matrix1);
                    }
                }))

                .append($("<button/>", {
                    html: "Sparklines/Jahr anzeigen",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.paintT(selvariablename, selsource, selstationid, matrix1);
                    }
                }))


                .append($("<button/>", {
                    html: "Super-Heatmaps",
                    id: "kla1620shmsuper",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        async.waterfall([
                            function (cb1620a) {
                                // brutal auf die rechte Seite
                                $("#kla1620shmwrapper").empty();
                                $("#kla1620shmwrapper").css({
                                    overflow: "auto"
                                });
                                $("#kla1620shmwrapper")
                                    .append($("<div/>", {
                                        id: "kla1620shmd1",
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
                                kla1620shm.kliheatmap2("kla1620shmd1", "TMAX", selsource, selstationid, starecord, hmoptions, function (ret) {
                                    cb1620a(null);
                                });
                            },
                            function (cb1620b) {
                                $("#kla1620shmwrapper")
                                    .append($("<div/>", {
                                        id: "kla1620shmd2",
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
                                kla1620shm.kliheatmap2("kla1620shmd2", "TMIN", selsource, selstationid, starecord, hmoptions, function (ret) {
                                    cb1620b(null);
                                });
                            },
                            function (cb1620c) {
                                /**
                                 * für TMAX min und max bestimmen, Histogramm als Sparkline
                                 */
                                $("#kla1620shmwrapper")
                                    .append($("<div/>", {
                                        id: "kla1620shmd3",
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
                                kla1620shm.kliheatmap2("kla1620shmd3", "TMAX", selsource, selstationid, starecord, hmoptions, function (ret) {
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
                                    cb1620c(null);
                                });
                            },
                            function (cb1620d) {
                                /**
                                 * für TMIN min und max bestimmen, Histogramm als Sparkline
                                 */
                                $("#kla1620shmwrapper")
                                    .append($("<div/>", {
                                        id: "kla1620shmd4",
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
                                kla1620shm.kliheatmap2("kla1620shmd4", "TMIN", selsource, selstationid, starecord, hmoptions, function (ret) {
                                    cb1620d(null);
                                });
                            }

                        ]);
                    }
                }))



                .append($("<button/>", {
                    html: "Google-Maps",
                    id: "kla1620shmgoogle",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        //var gurl = "https://www.google.com/maps/dir/";
                        var gurl = "https://www.google.com/maps/search/?api=1&query=";
                        debugger;
                        gurl += selparms.latitude;
                        gurl += ",";
                        gurl += selparms.longitude;
                        var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                        window.open(gurl, wname, 'height=' + screen.height + ', width=' + screen.width);

                    }
                }))


                .append($("<button/>", {
                    html: "Sparklines-Kelvin",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
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
                        kla1620shm.paintT(selvariablename, selsource, selstationid, matrix2);
                    }
                }))


                .append($("<button/>", {
                    html: "Super-Sparklines",
                    css: {
                        float: "left",
                        margin: "10px"
                    },


                    click: function (evt) {
                        evt.preventDefault();
                        /**
                         * Popup Prompt zur Bestätigung der kompletten Übernahme
                         * kla1400rawfullname -  $("#kla1400rawfullname").text();
                         */
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
                                            /* width: "100px", */
                                            io: "i"
                                        },
                                        mixed: {
                                            title: "Mixed Sparklines",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            /* width: "100px", */
                                            io: "i"
                                        },
                                        total: {
                                            title: "ganze Jahre",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            /* width: "100px", */
                                            io: "i"
                                        },
                                        sunwinter: {
                                            title: "Sommer/Winter",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            default: false,
                                            /* width: "100px", */
                                            io: "i"
                                        },
                                        export: {
                                            title: "SQL-Export",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            /* width: "100px", */
                                            io: "i"
                                        },
                                        moon: {
                                            title: "Mondphasen",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uiecheckbox",
                                            /* width: "100px", */
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
                        var anchorHash = "#kla1620shmwrapper";
                        var title = "Super-Sparklines";
                        var pos = {
                            left: $("#kla1620shmwrapper").offset().left,
                            top: window.screen.height * 0.1,
                            width: $("#kla1620shmwrapper").width() * 0.60,
                            height: $("#kla1620shmwrapper").height() * 0.90
                        };
                        //Math.ceil($(this).offset().top + $(this).height() + 20)
                        $(document).on('popupok', function (evt, extraParam) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                            console.log(extraParam);
                            var superParam = JSON.parse(extraParam).props;
                            kla1620shm.loadrecs(selvariablename, selsource, selstationid, superParam, function (ret) {
                                // Daten in klirecords[0] und [1] wenn OK
                                kla1620shm.paintX(selvariablename, selsource, selstationid, superParam, function (ret) {
                                    return;
                                });
                            });
                        });
                        uientry.inputDialogX(anchorHash, pos, title, popschema, poprecord, function (ret) {
                            if (ret.error === false) {
                                // outrec.isactive = "false"; // true oder false wenn gelöscht
                            } else {
                                sysbase.putMessage("Kein Abruf Super-Sparklines", 1);
                                return;
                            }
                        });
                    }
                }))


                .append($("<button/>", {
                    html: "Sparklines-Download",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // es müssen die canvas modifiziert werden, so dass dataUrl möglich wird
                        var canliste = $('#kla1620shmt1 tbody tr td span canvas');
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
                        if ($("#kla1620shmt1").hasClass("hasFilters")) {
                            clonerow = $("#kla1620shmt1 thead tr").eq(1).clone();
                            $("#kla1620shmt1 thead tr").eq(1).remove();
                        }
                        var elHtml = "";
                        elHtml += "<html>";
                        elHtml += "<head>";
                        elHtml += "<meta charset='UTF-8'>";
                        elHtml += "<style type='text/css'> @page { size: 29.5cm 21.0cm; margin-left: 1cm; margin-right: 1cm }</style>";
                        elHtml += "</head>";
                        elHtml += "<body style='font-family:Calibri,Arial,Helvetica,sans-serif;font-size:11px'>";
                        elHtml += "<h2>" + $("#kla1620shmh2").text() + "</h2>";
                        elHtml += "<p style='page-break-before: always'>";
                        var oldwidth = $("#kla1620shmt1").width();
                        $("#kla1620shmt1").width("100%");
                        elHtml += $("#kla1620shmt1").parent().html();
                        elHtml += "</body>";
                        elHtml += "<html>";
                        // Filterzeile clone wieder einfügen
                        if ($("#kla1620shmt1").hasClass("hasFilters")) {
                            $("#kla1620shmt1 thead").append(clonerow);
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


                .append($("<button/>", {
                    html: "Scattergram",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.scatter(selvariablename, selsource, selstationid, matrix1);
                    }
                }))






                .append($("<button/>", {
                    html: "Regression testen",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.paintU(selvariablename, selsource, selstationid, matrix1);
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
                        kla1620shm.paintChart(30, selvariablename, selsource, selstationid);
                    }
                }))


                .append($("<button/>", {
                    html: "Clusteranalyse",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.clusterAnalysis(selvariablename, selsource, selstationid);
                    }
                }))


                .append($("<button/>", {
                    html: "Bucketanalyse (30)",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.bucketAnalysis(30, selvariablename, selsource, selstationid);
                    }
                }))


                .append($("<button/>", {
                    html: "Bucketanalyse (10)",
                    css: {
                        float: "left",
                        margin: "10px"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // stationrecord - heatworld
                        kla1620shm.bucketAnalysis(10, selvariablename, selsource, selstationid);
                    }
                }))

                .append($("<div/>", {
                    id: "kla1620shmclock",
                    float: "left",
                    css: {
                        float: "left",
                        margin: "10px"
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

                            $("#kla1620shmwrapper").empty();
                            var h = $("#heatmap").height();
                            var w = $("#kla1620shm.content").width();
                            w -= $("#heatmap").position().left;
                            w -= $("#heatmap").width();
                            w -= 40;
                            $("#kla1620shmwrapper")
                                .append($("<div/>", {
                                    id: "kla1620shmcolormap",
                                    css: {
                                        "background-color": "yellow",
                                        height: h,
                                        width: w,
                                        overflow: "auto"
                                    }
                                }));

                            $("#kla1620shmcolormap").show();
                            kla9020fun.getColorPaletteX1("kla1620shmcolormap", 7);
                        }
                        return false;
                    }
                }))
            );
        /**
         * heatmap ist die Konstante in der Darstellung
         */
        $("#kla1620shm.content")
            .append($("<div/>", {
                    id: "heatmap",
                    height: "600px",
                    width: "520px",
                    css: {
                        "margin": "10px",
                        float: "left"
                    }
                })
                .append($("<canvas/>", {
                    id: cid,
                    css: {
                        border: "1px solid"
                    }
                }))
            );
        /**
         * kla1620shmwrapper ist für die dynamischen Einspielunge zu den Buttons in paintA etc.
         */
        $("#kla1620shm.content")
            .append($("<div/>", {
                id: "kla1620shmwrapper",
                class: "kla1620shmwrapper"
            }));
        var h = $("#kla1620shm.content").height();
        var hsum = 0;
        $("#heatmap").prevAll().each(function (index) {
            var hs = $(this).height();
            hsum += hs;
        });
        h = h - hsum;
        $("#kla1620shmwrapper")
            .css({
                "margin": "10px",
                height: h,
                overflow: "auto",
                float: "left"
            });
        $("#heatmap")
            .css({
                "margin": "10px",
                height: h,
                overflow: "auto",
                float: "left"
            });
        console.log("kliheatmap Finished");
        // Dragdrop aktivieren
        var box = $(".heatvardiv");
        var mainCanvas = $(".content");
        box.draggable({
            containment: mainCanvas,
            helper: "clone",
            start: function () {
                $(this).css({
                    opacity: 0
                });
                $(".box").css("z-index", "0");
            },
            stop: function () {
                $(this).css({
                    opacity: 1
                });
            }
        });
        box.droppable({
            accept: box,
            drop: function (event, ui) {
                var draggable = ui.draggable;
                var droppable = $(this);
                var dragPos = draggable.position();
                var dropPos = droppable.position();
                draggable.css({
                    left: dropPos.left + "px",
                    top: dropPos.top + "px",
                    "z-index": 20
                });
                droppable.css("z-index", 10).animate({
                    left: dragPos.left,
                    top: dragPos.top
                });
            }
        });

        if ($("#" + cid).length === 0) {
            $("#heatmap")
                .append($("<canvas/>", {
                    id: cid,
                    css: {
                        border: "1px solid"
                    }
                }));
        }

        $(window).on('resize', function () {
            var w = $("#kla1620shm.content").width();
            w -= $("#heatmap").position().left;
            w -= $("#heatmap").width();
            w -= 40;
            $("#kla1620shmwrapper div:first").css({
                width: w
            });
        });
        savedwidth = $("#heatmap").width();

        if (typeof selvariablename !== "undefined" && selvariablename !== null && selvariablename.trim().length > 0) {
            kla1620shm.kliheatmap2(cid, selvariablename, selsource, selstationid, starecord, {}, function (ret) {
                $("#kla1620shmwrapper").empty();
                var h = $("#heatmap").height();
                var w = $("#kla1620shm.content").width();
                w -= $("#heatmap").position().left;
                w -= $("#heatmap").width();
                w -= 40;
                $("#kla1620shmwrapper").css({
                    overflow: "hidden",
                    height: h,
                    width: w
                });

                // kla1620shm.paintT(selvariablename, selsource, selstationid, ret.matrix);
            });
        } else {
            sysbase.putMessage("Bitte eine Auswahl TMIN/TMAX treffen, default TMAX genutzt", 3);
            selvariablename = "TMAX";
            kla1620shm.kliheatmap2(cid, selvariablename, selsource, selstationid, starecord, {}, function (ret) {

            });
        }

    }; // Ende show



    /**
     * kla1620shm.loadrecs - Bereitstellen klirecords [0] und [1] für TMAX, TMIN
     * @param {*} selvariablename - hier TMAX,TMIN, wird dann auf SQL aufbereitet
     * @param {*} selsource
     * @param {*} selstationid
     * @param {*} callbackshm77
     * return in ret: ret.error, ret.message, ret.klirecords
     * ret.klirecords wird bereitgestellt in klirecords
     */
    kla1620shm.loadrecs = function (selvariablename, selsource, selstationid, extraParm, callback77) {
        klirecords = [];
        var sqlStmt = "";
        selvariablename = "TMAX,TMIN";
        var sel = {
            source: selsource,
            stationid: selstationid
        };
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
        if (selvariablename.indexOf(",") < 0) {
            selvariablename = "TMAX,TMIN";
        }
        var tliste = selvariablename.split(",");
        if (tliste.length > 1) {
            sqlStmt += "AND (";
            for (var itliste = 0; itliste < tliste.length; itliste++) {
                if (itliste > 0) sqlStmt += " OR ";
                sqlStmt += "KLIDATA.variable = '" + tliste[itliste].trim().toUpperCase() + "' ";
            }
            sqlStmt += ") ";
        } else {
            sqlStmt += "AND KLIDATA.variable = '" + selvariablename.trim().toUpperCase() + "' ";
        }
        sqlStmt += "ORDER BY KLISTATIONS.source, KLISTATIONS.stationid, KLIDATA.variable";
        var api = "getallsqlrecords";
        var table = "KLISTATIONS";
        async.waterfall([
                function (callback77a) {
                    callback77a(null, {
                        error: false,
                        message: "Start",
                        sqlStmt: sqlStmt,
                        selvariablename: selvariablename,
                        selsource: selsource,
                        selstationid: selstationid
                    });
                    return;
                },
                function (ret, callback77d) {
                    uihelper.getAllRecords(sqlStmt, {}, [], 0, 2, api, table, function (ret1) {
                        if (ret1.error === false && ret1.record !== null) {
                            /*
                            intern wird getallsqlrecords gerufen und es werden zwei Sätze erwartet,
                            wenn die Station komplette Temperaturdaten geliefert hat
                            */

                            stationrecord = ret1.record;
                            klirecords = [];
                            if (typeof ret1.records[0] !== "undefined") klirecords.push(ret1.records[0]);
                            if (typeof ret1.records[1] !== "undefined") klirecords.push(ret1.records[1]);
                            callback77d("Finish", {
                                error: false,
                                message: "Daten gefunden",
                                klirecords: ret1.records
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
                                callback77d("Error", {
                                    error: true,
                                    message: "Keine Daten gefunden"
                                });
                                return;
                            } else {
                                callback77d(null, {
                                    error: true,
                                    message: "Keine Daten gefunden",
                                    sqlStmt: ret.sqlStmt,
                                    selvariablename: ret.selvariablename,
                                    selsource: ret.selsource,
                                    selstationid: ret.selstationid
                                });
                                return;
                            }
                        }
                    });
                },
                function (ret, callback77g) {
                    /**
                     * Laden aus den Urdaten (*.dly-Files)
                     */
                    var ghcnclock = kla1620shm.showclock("#kla1620shmclock");
                    var that = this;
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
                        clearInterval(ghcnclock);
                        sysbase.checkSessionLogin(r1);
                        var ret1 = JSON.parse(r1);
                        sysbase.putMessage(ret1.message, 1);
                        if (ret1.error === true) {
                            callback77g("Error", {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        } else {
                            callback77g(null, {
                                error: ret1.error,
                                message: ret1.message,
                                sqlStmt: ret.sqlStmt,
                                selvariablename: ret.selvariablename,
                                selsource: ret.selsource,
                                selstationid: ret.selstationid
                            });
                            return;
                        }
                    }).fail(function (err) {
                        clearInterval(ghcnclock);
                        //$("#kli1400raw_rightwdata").empty();
                        //document.getElementById("kli1400raw").style.cursor = "default";
                        sysbase.putMessage("ghcnddata:" + err, 3);
                        callback77g("Error", {
                            error: true,
                            message: err.message || err
                        });
                        return;
                    }).always(function () {
                        // nope
                        $(that).attr("disabled", false);
                    });
                },
                function (ret, callback77j) {
                    uihelper.getAllRecords(ret.sqlStmt, {}, [], 0, 2, api, table, function (ret1) {
                        if (ret1.error === false && ret1.record !== null) {
                            /*
                            intern wird getallsqlrecords gerufen und es werden zwei Sätze erwartet,
                            wenn die Station komplette Temperaturdaten geliefert hat
                            */
                            klirecords = [];
                            if (typeof ret1.records[0] !== "undefined") klirecords.push(ret1.records[0]);
                            if (typeof ret1.records[1] !== "undefined") klirecords.push(ret1.records[1]);
                            callback77j("Finish", {
                                error: false,
                                message: "Daten gefunden",
                                klirecords: ret1.records
                            });
                            return;
                        } else {
                            sysbase.putMessage("Keine Daten zur Station gefunden", 3);
                            callback77j("Error", {
                                error: true,
                                message: "Keine Daten gefunden"
                            });
                            return;
                        }
                    });
                }
            ],
            function (error, ret) {
                callback77(ret);
                return;
            });
    };







    /**
     * loadstationdata - Laden der Rohdaten nach SQLite und Bereitstellen Datensatz
     * @param {*} stationid  - identifiziert die Staion
     * @param {*} source - Datenquelle zur Selektion
     * @param {*} sqlStmt  - SQL-SELECT, um den geforderten Satz zu holen, wiederholt den Zugriff
     * vor dem Laden der Daten
     * returns callbackshm8 mit ret, record, wenn Record gefunden wurde nach dem Aufruf Laden
     */
    kla1620shm.loadstationdata = function (stationid, source, sqlStmt, callbackshm8) {

        async.waterfall([
                function (callbackshm8a) {
                    var ghcnclock = kla1620shm.showclock("#kla1620shmclock");
                    var that = this;
                    $(that).attr("disabled", true);
                    var jqxhr = $.ajax({
                        method: "GET",
                        crossDomain: false,
                        url: sysbase.getServer("ghcnddata"),
                        data: {
                            timeout: 10 * 60 * 1000,
                            source: source,
                            stationid: stationid
                        }
                    }).done(function (r1, textStatus, jqXHR) {
                        clearInterval(ghcnclock);
                        sysbase.checkSessionLogin(r1);
                        var ret1 = JSON.parse(r1);
                        sysbase.putMessage(ret1.message, 1);
                        if (ret1.error === true) {
                            callbackshm8a("Error", {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        } else {
                            callbackshm8a(null, {
                                error: ret1.error,
                                message: ret1.message
                            });
                            return;
                        }
                    }).fail(function (err) {
                        clearInterval(ghcnclock);
                        //$("#kli1400raw_rightwdata").empty();
                        //document.getElementById("kli1400raw").style.cursor = "default";
                        sysbase.putMessage("ghcnddata:" + err, 3);
                        callbackshm8a("Error", {
                            error: true,
                            message: err
                        });
                        return;
                    }).always(function () {
                        // nope
                        $(that).attr("disabled", false);
                    });
                },
                function (ret, callbackshm8b) {
                    uihelper.getOneRecord(sqlStmt, "", "getonerecord", "KLIDATA", function (ret) {
                        if (ret.error === false && ret.record !== null) {
                            /*
                            intern wird getallsqlrecords gerufen und EIN Satz in record zurückgegeben.
                            */
                            stationrecord = ret.record;
                            callbackshm8b("Finish", {
                                error: false,
                                message: "Daten gefunden",
                                record: ret.record
                            });
                            return;
                        } else {
                            callbackshm8b("Error", {
                                error: true,
                                message: ret.message
                            });
                            return;
                        }
                    });
                }
            ],
            function (error, result) {
                callbackshm8(result);
                return;
            });
    };



    /**
     * paintS - Sparklines für Monate Gesamt = alle Jahre
     * - Randauszählung der Zuordnungen zu Grad Celsius je Jahr
     */
    kla1620shm.paintS = function (selvariablename, selsource, selstationid, matrix) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         */
        var years = matrix.data;
        var tarray = [];
        array1 = []; // für d3 scatter
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: matrix1.rowheaders[year],
                    values: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        overflow: "auto"
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        id: "kla1620shmt1",
                        css: {
                            "max-width": w + "px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
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
                                html: "tmin"
                            }))
                            .append($("<th/>", {
                                html: "tmax"
                            }))
                            .append($("<th/>", {
                                html: "tavg"
                            }))

                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        /**
         * jeder Monat über alle Jahre eine Sparkline
         */
        var pcount = 0;
        var lvalue = tarray[0].values.length;
        if (lvalue > 365) lvalue = 365; // kleine Vereinfachung
        for (var ivalue = 0; ivalue < lvalue; ivalue++) {
            var monindex = ivalue;
            pcount++;
            var sparkid = '#spark' + pcount;
            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            var tsum = 0;
            var tcount = 0;
            for (var iarray = 0; iarray < tarray.length; iarray++) {
                // Iterate values
                var x = parseInt(tarray[iarray].year);
                var y;
                var temperatur = tarray[iarray].values[ivalue];
                if (temperatur === null) {
                    pearls.push(null);
                    y = null;
                } else {
                    pearls.push(parseFloat(temperatur));
                    y = parseFloat(temperatur);
                    if (miny === null) {
                        miny = y;
                    } else if (y < miny) {
                        miny = y;
                    }
                    if (maxy === null) {
                        maxy = y;
                    } else if (y > maxy) {
                        maxy = y;
                    }
                    tcount++;
                    tsum += y;
                }
                // Transformation von x und y
                //y = y + 273.15;  // Kelvin
                // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                regarray.push([x, y]);
            }
            var minyv = miny;
            var maxyv = maxy;
            var tavg = 0;
            var result = null;
            var gradient = null;
            var yIntercept = null;
            var r2 = null;
            if (miny !== null && maxy !== null) {
                result = regression.linear(regarray);
                gradient = result.equation[0].toFixed(2);
                yIntercept = result.equation[1].toFixed(2);
                r2 = result.r2.toFixed(2);
                minyv = minyv.toFixed(2);
                maxyv = maxyv.toFixed(2);
                if (tcount > 0) {
                    tavg = (tsum / tcount).toFixed(2);
                } else {
                    tavg = null;
                }
                array1.push({
                    temp: tavg || yIntercept,
                    gradient: gradient
                });
            }
            // Regression https://github.com/Tom-Alexander/regression-js
            // rowtit noch verfeinern für spezielle Termine, wie Tag/Nachtgleiche etc.
            var rowtit = "";
            if (tarray.length <= 12) {
                rowtit = 'M' + ("00" + (ivalue + 1)).slice(-2);
            } else {
                rowtit = 'D' + ("000" + (ivalue + 1)).slice(-3);
            }

            $("#kla1620shmt1")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: rowtit
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'spark' + pcount,
                            css: {
                                margin: "5px",
                                float: "left"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: gradient,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: yIntercept,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: r2,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'avg' + pcount,
                            html: tavg,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )


                );

            /**
             * Regressionsgerade berechnen und einblenden
             * return [m, c] aus y = mx + c; basierend auf regarray.push([x, y]);
             */
            var linarray = [];
            var newpearls = [];
            var isigvals = 0;
            if (result !== null) {
                for (var ilin = 0; ilin < regarray.length; ilin++) {
                    var newx = regarray[ilin][0];
                    var newp = result.predict(newx);
                    var newy = newp[1].toFixed(2);
                    var y = newp[1];
                    if (miny === null && y !== null) {
                        miny = y;
                    } else if (y !== null && y < miny) {
                        miny = y;
                    }
                    if (maxy === null && y !== null) {
                        maxy = y;
                    } else if (y !== null && y > maxy) {
                        maxy = y;
                    }
                    linarray.push([newx, newy]);
                    newpearls.push(newy);
                }
            }
            // $(sparkid).sparkline(pearls);

            $(sparkid).sparkline(pearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: 3,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "blue"
                /* composite: true */
            });
            if (result !== null) {
                $(sparkid).sparkline(newpearls, {
                    type: 'line',
                    /* height: 60, */
                    fillColor: false,
                    defaultPixelsPerValue: 3,
                    chartRangeMin: miny,
                    chartRangeMax: maxy,
                    lineColor: "red",
                    composite: true
                });
            }

        }
        $(".tablesorter").tablesorter({
            theme: "blue",
            /* widgets: ['filter'], */
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

    }; // ende paintS



    /**
     * paintT - Sparklines Matrix "as is" also per row
     * - Randauszählung der Zuordnungen zu Grad Celsius je Jahr
     * - Regressionsanalyse je Zeile
     */
    kla1620shm.paintT = function (selvariablename, selsource, selstationid, matrix) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         * tarray[i] mit year und values[]
         * colheaders direkt nutzbar
         */
        var years = matrix.data;
        var tarray = [];
        array1 = [];
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: matrix.rowheaders[year],
                    values: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        overflow: "auto"
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        id: "kla1620shmt1",
                        css: {
                            "max-width": w + "px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
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
         * jeder Monat über alle Jahre eine Sparkline
         */
        var pcount = 0;
        var lvalue = tarray[0].values.length;
        if (lvalue > 365) lvalue = 365; // kleine Vereinfachung
        // Iteration über Zeilen = Jahre
        for (var iarray = 0; iarray < tarray.length; iarray++) {
            var monindex = ivalue;
            pcount++;
            var sparkid = '#spark' + pcount;
            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            var avgy = null;
            var tcount = 0;
            var tsum = 0;
            // Iteration über Werte, je Monat/je Tag/ ...
            for (var ivalue = 0; ivalue < lvalue; ivalue++) {
                // Iterate values
                var x = ivalue; // hier: laufende Periode im Jahr parseInt(tarray[iarray].year);
                var y;
                var temperatur = tarray[iarray].values[ivalue];
                if (temperatur === null) {
                    pearls.push(null);
                    y = null;
                } else {
                    pearls.push(parseFloat(temperatur));
                    y = parseFloat(temperatur);
                    if (miny === null) {
                        miny = y;
                    } else if (y < miny) {
                        miny = y;
                    }
                    if (maxy === null) {
                        maxy = y;
                    } else if (y > maxy) {
                        maxy = y;
                    }
                    tcount++;
                    tsum += y;
                }
                // Transformation von x und y
                //y = y + 273.15;  // Kelvin
                // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                regarray.push([x, y]);
            }
            var minyv = miny;
            var maxyv = maxy;
            var result = null;
            var gradient = null;
            var yIntercept = null;
            var r2 = null;
            if (miny !== null && maxy !== null) {
                result = regression.linear(regarray);
                gradient = result.equation[0].toFixed(2);
                yIntercept = result.equation[1].toFixed(2);
                r2 = result.r2.toFixed(2);
                minyv = minyv.toFixed(2);
                maxyv = maxyv.toFixed(2);
                if (tcount > 0) avgy = (tsum / tcount).toFixed(2);
                array1.push({
                    temp: r2,
                    /* yIntercept, */
                    gradient: gradient,
                    avg: avgy
                });
            }
            // Regression https://github.com/Tom-Alexander/regression-js
            // rowtit noch verfeinern für spezielle Termine, wie Tag/Nachtgleiche etc.
            var rowtit = tarray[iarray].year;

            $("#kla1620shmt1")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: rowtit
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
                            id: 'reg' + pcount,
                            html: gradient,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: yIntercept,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: r2,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'avg' + pcount,
                            html: avgy,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                );

            /**
             * Regressionsgerade berechnen und einblenden
             * return [m, c] aus y = mx + c; basierend auf regarray.push([x, y]);
             */
            var linarray = [];
            var newpearls = [];
            var isigvals = 0;
            if (result !== null) {
                for (var ilin = 0; ilin < regarray.length; ilin++) {
                    var newx = regarray[ilin][0];
                    var newp = result.predict(newx);
                    var newy = newp[1].toFixed(2);
                    var y = newp[1];
                    if (miny === null && y !== null) {
                        miny = y;
                    } else if (y !== null && y < miny) {
                        miny = y;
                    }
                    if (maxy === null && y !== null) {
                        maxy = y;
                    } else if (y !== null && y > maxy) {
                        maxy = y;
                    }
                    linarray.push([newx, newy]);
                    newpearls.push(newy);
                }
            }
            // $(sparkid).sparkline(pearls);
            var defaultpixel = 3;
            if (pearls.length > 350) defaultpixel = 2;
            $(sparkid).sparkline(pearls, {
                type: 'line',
                height: 60,
                fillColor: false,
                defaultPixelsPerValue: defaultpixel,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "blue"
                /* composite: true */
            });
            if (result !== null) {
                $(sparkid).sparkline(newpearls, {
                    type: 'line',
                    height: 60,
                    fillColor: false,
                    defaultPixelsPerValue: defaultpixel,
                    chartRangeMin: miny,
                    chartRangeMax: maxy,
                    lineColor: "red",
                    composite: true
                });
            }

        }
        $(".tablesorter").tablesorter({
            theme: "blue",
            /* widgets: ['filter'], */
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

    }; // ende paintT



    /**
     * paintU - Testen der Regression
     * - Regressionsanalyse je Zeile - concatenierte Werte 1 - Jahre
     */
    kla1620shm.paintU = function (selvariablename, selsource, selstationid, matrix) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         * tarray[i] mit year und values[]
         * colheaders direkt nutzbar
         */
        var years = matrix.data;
        var tarray = [];
        array1 = [];
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: matrix1.rowheaders[year],
                    values: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        overflow: "auto"
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        id: "kla1620shmt1",
                        css: {
                            "max-width": w + "px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
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
         * jeder Monat über alle Jahre eine Sparkline
         */
        var pcount = 0;

        // Iteration über Zeilen = Jahre
        for (var iarray = 0; iarray < tarray.length; iarray++) {
            var monindex = ivalue;
            pcount++;
            var sparkid = '#spark' + pcount;
            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            var tsum = 0;
            var tcount = 0;
            // Iteration über Werte, je Monat/je Tag/ ...
            // Iteration über zu aggregierende Jahre
            for (var itest = 0; itest <= iarray; itest++) {
                // Werte eines Jahres
                var lvalue = tarray[itest].values.length; // tarray hat year als String und values als array
                if (lvalue > 365) lvalue = 365; // kleine Vereinfachung
                for (var ivalue = 0; ivalue < lvalue; ivalue++) {
                    // Iterate values
                    var x = ivalue; // hier: laufende Periode im Jahr parseInt(tarray[iarray].year);
                    var y;
                    var temperatur = tarray[itest].values[ivalue];
                    if (temperatur === null) {
                        pearls.push(null);
                        y = null;
                    } else {
                        pearls.push(parseFloat(temperatur));
                        y = parseFloat(temperatur);
                        if (miny === null) {
                            miny = y;
                        } else if (y < miny) {
                            miny = y;
                        }
                        if (maxy === null) {
                            maxy = y;
                        } else if (y > maxy) {
                            maxy = y;
                        }
                        tcount++;
                        tsum += y;
                    }
                    // Transformation von x und y
                    //y = y + 273.15;  // Kelvin
                    // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                    regarray.push([x, y]);
                }
            }
            var minyv = miny;
            var maxyv = maxy;
            var result = null;
            var gradient = null;
            var yIntercept = null;
            var r2 = null;
            var rstring = null;
            if (miny !== null && maxy !== null) {
                result = regression.linear(regarray);
                gradient = result.equation[0].toFixed(2);
                yIntercept = result.equation[1].toFixed(2);
                rstring = result.string;
                r2 = result.r2.toFixed(2);
                minyv = minyv.toFixed(2);
                maxyv = maxyv.toFixed(2);
                var avg = (tsum / tcount).toFixed(2);
                array1.push({
                    temp: r2,
                    /* yIntercept, */
                    gradient: gradient,
                    avg: avg
                });
            }
            var regmsg = "" + regarray.length + " Werte von ";
            regmsg += tarray[0].year + " bis " + tarray[iarray].year;
            regmsg += " => " + rstring;
            // Regression https://github.com/Tom-Alexander/regression-js
            // rowtit noch verfeinern für spezielle Termine, wie Tag/Nachtgleiche etc.
            var rowtit = tarray[iarray].year;

            $("#kla1620shmt1")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: rowtit
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'spark' + pcount,
                            html: regmsg,
                            css: {
                                margin: "5px",
                                float: "left"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: gradient,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: yIntercept,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: r2,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'avg' + pcount,
                            html: avg,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                );
        }
        $(".tablesorter").tablesorter({
            theme: "blue",
            /* widgets: ['filter'], */
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

    }; // ende paintU

    /**
     * paintX - gemischte Auswertung TMAX, TMIN und "all years"
     * mit Super-Sparkline auf Basis klirecords
     * superParam.sunwinter - das ist schon ein Brocken
     */
    var outrecords = [];
    kla1620shm.paintX = function (selvariablename, selsource, selstationid, superParam, callbackshm9) {
        try {
            outrecords = [];
            if (typeof klirecords === "undefined" || klirecords.length < 1) {
                sysbase.putMessage("Keine Daten vorhanden", 3);
                return;
            }
            /**
             * Container kla1620shmwrapper aufbereiten
             * in diesen Container gehen sukzessive die Auswertungen
             */
            $("#kla1620shmwrapper").empty();
            var h = screen.height;
            h -= $(".header").height();
            h -= $("#kla1620shmbuttons").height();
            h -= $(".footer").height();

            var w = $("#kla1620shm.content").width();
            w -= $("#heatmap").position().left;
            w -= $("#heatmap").width();
            w -= 40;
            $("#kla1620shmwrapper").css({
                overflow: "auto",
                height: h,
                width: w
            });
            var stationdata = klirecords[0];
            /**
             * Abschnitt Stammdaten zur Station
             */
            $("#kla1620shmwrapper")
                .append($("<div/>", {
                        css: {
                            width: "100%",
                            overflow: "hidden"
                        }
                    })
                    .append($("<h2/>", {
                        id: "kla1620shmh2",
                        text: stationdata.stationid + " " + stationdata.stationname
                    }))
                );

            /**
             * Abschnitt sparklines
             * Header zu sparkline-Tabelle
             * */
            $("#kla1620shmwrapper")
                .append($("<div/>", {
                        css: {
                            width: "100%",
                            overflow: "hidden"
                        }
                    })
                    .append($("<table/>", {
                            class: "tablesorter",
                            id: "kla1620shmt1",
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
                    kla1620shm.paintXtr("#kla1620shmt1", "tot", iyear, pcount, rowdata, superParam);
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
                                var tempf = parseFloat(temp)
                                rowrecord.tarray[iday] = [iday, tempf];
                                rowrecord.pearls.push(temp);
                            }
                        }
                        rowdata.push(rowrecord);
                    }
                    kla1620shm.paintXtr("#kla1620shmt1", "som", iyear, pcount, rowdata, superParam);


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
                    kla1620shm.paintXtr("#kla1620shmt1", "win", iyear, pcount, rowdata, superParam);
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
                    message: "Daten gechrieben"
                });
                return;
            });
        } else {
            callbackshm9({
                error: false,
                message: "keine Daten gechrieben"
            });
            return;
        }


    }; // ende paintX

    /**
     * kla1620shm.paintXtr - Ausgabe der Zeilen zu rowdata[0] und rowdata[1]
     * max drei Zeilen für total, summer-up, winter-dwn
     * @param {*} trcontainer
     * @param {*} rowdata
     * @param {*} superParam
     */
    kla1620shm.paintXtr = function (trcontainer, rkat, iyear, pcount, rowdata, superParam) {
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
            $("#kla1620shmt1")
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
     * paintChart - mit chartJS wird eine Gesamtgraphik ausgegeben
     * mit Skalierung etc.
     */
    kla1620shm.paintChart = function (bucketlength, selvariablename, selsource, selstationid) {
        /**
         * Bereitstellung der Daten
         */

        var matrix = matrix1;
        var years = matrix1.rowheaders;
        var tarray = [];
        for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {
            tarray.push({
                year: matrix1.rowheaders[iyear],
                days: matrix.data[iyear]
            });
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        "background-color": "white"
                    }
                })
                .append($("<canvas/>", {
                    id: "myChart",
                    css: {
                        height: h,
                        width: w
                    }
                }))
            );
        var datasets = [];
        var labels = [];
        var lab;
        for (var iday = 0; iday < 365; iday++) {
            var rowvalues = [];
            for (var iarray = 0; iarray < tarray.length; iarray++) {
                if (iday === 0) {
                    lab = "";
                    if (iarray % bucketlength === 0 || iarray === 0) {
                        lab = tarray[iarray].year;
                    }
                    labels.push(lab);
                }
                rowvalues.push(parseFloat(tarray[iarray].days[iday]));
            }
            datasets.push({
                label: "D" + ("000" + (iday + 1)).slice(-3),
                backgroundColor: '#00FFFF',
                borderColor: '#00FFFF',
                borderWidth: 1,
                pointRadius: 1,
                data: rowvalues,
                fill: false,
            });
        }
        var ctx = document.getElementById('myChart').getContext('2d');
        Chart.defaults.global.plugins.colorschemes.override = true;
        Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
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
    };

    /**
     * Clusteranalyse mit https://www.npmjs.com/package/tayden-clusterfck
     */
    kla1620shm.clusterAnalysis = function (selvariablename, selsource, selstationid) {
        /**
         * Bereitstellung der Daten
         */
        var colorarray = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];

        //var years = stationrecord[selvariablename].years;
        var years = matrix1.data;
        var tarray = [];
        for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {

            tarray.push({
                year: matrix1.rowheaders[iyear],
                values: matrix1.data[iyear]
            });

        }

        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var carray = [];
        var md5pointers = {};
        var objstrings = {};
        // null - substitute -999
        for (var ia = 0; ia < tarray.length; ia++) {
            var cvector = [];
            var iskip = false;
            for (var imo = 0; imo < tarray[0].values.length; imo++) {
                if (tarray[ia].values[imo] === null) {
                    //cvector.push(-9999);
                    iskip = true;
                    break;
                } else {
                    cvector.push(parseFloat(tarray[ia].values[imo]));
                }
            }
            if (iskip === true) continue;
            carray.push(cvector);
            var aktyear = tarray[ia].year;
            var md5pointer = md5(JSON.stringify(cvector));

            md5pointers[md5pointer] = aktyear;
            var objstring = cvector[cvector.length - 1].toString();
            objstrings[objstring] = aktyear;
        }
        /*  Input: nur Zahlen!!!
        carray = [
            [-20.2, -20, 80,20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [22, 22, -90, 20.2, 20, 80, -20.2, 20, 80,20.2, 40, 80],
            [250, 255, -253, 20.2, 20, 80, -20.2, 20, 80,20.2, 40, 80],
            [0, 30, 70, -20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [200, 0, 23, -20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [100, 54, 100, 20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [255, 13, 8, 20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80]
         ];
         */
        /* MIT license; https://www.npmjs.com/package/tayden-clusterfck */
        // var clusters = clusterfck.kmeans(carray, 8);
        // var clusters = clusterfck.kmeans(carray);  // default ist sqrt(n) für n Zeilen/Vektoren - Fehlerquelle!
        var nclusters = Math.ceil(Math.sqrt(carray.length));
        var clusters = clusterfck.kmeans(carray, nclusters);

        for (var icluster = 0; icluster < clusters.length; icluster++) {
            console.log("Cluster:" + icluster);
            for (var ielem = 0; ielem < clusters[icluster].length; ielem++) {
                var md5pointer = md5(JSON.stringify(clusters[icluster][ielem]));
                var md5year = md5pointers[md5pointer];
                var objstring = clusters[icluster][ielem].toString();
                var objyear = objstrings[objstring];
                console.log(md5year + " " + JSON.stringify(clusters[icluster][ielem]));
            }
        }
        /**
         * Vorbereitung Ausgabebereich
         */
        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var whm = $("#heatmap").width();
        /*
        if (whm <= heatmapparms.savedwidth) {
            var cdiff = Math.trunc(heatmapparms.colwidth * heatmapparms.wratio) + 1;
            $("#heatmap").width(whm + cdiff);
            var whmc = $("#" + cid).width();
            $("#" + cid).width(whmc + cdiff);
        }
        */

        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;

        $("#kla1620shmwrapper").css({
            height: h,
            width: w,
            overflow: "auto"
        });

        var scw = uihelper.getScrollbarWidth($("#kla1620shmwrapper")[0].parentElement);
        /**
         * Loop zur Ausgabe der Charts zu den Clustern
         */
        var hmcc = document.getElementById(cid);
        var hmcctx = hmcc.getContext("2d");
        var ihit = 0;

        for (var icluster = 0; icluster < clusters.length; icluster++) {
            // Holen der Daten zu den Jahren eines Clusters aus stationrecord[selvariablename].years;
            // year wird label, 12 Monate werden die Werte
            var datasets = [];
            var labels = [];
            var vlen = tarray[0].values.length;
            if (vlen === 12) {
                for (var imon = 0; imon < vlen; imon++) {
                    labels.push("M" + ("00" + (imon + 1)).slice(-2));
                }
            } else {
                for (var imon = 0; imon < vlen; imon++) {
                    labels.push("T" + ("000" + (imon + 1)).slice(-3));
                }
            }

            var rowvalues = [];
            for (var ielem = 0; ielem < clusters[icluster].length; ielem++) {
                var md5pointer = md5(JSON.stringify(clusters[icluster][ielem]));
                var rowlabel = md5pointers[md5pointer];
                // rowvalues = stationrecord[selvariablename].years[rowlabel];
                // rowvalues = matrix1.data[rowlabel];
                // rowvalues = stationrecord.years[rowlabel];  // wäre ein String
                var year = rowlabel;
                for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {
                    if (year === matrix1.rowheaders[iyear]) {
                        rowvalues = matrix1.data[iyear];
                        break;
                    }
                }

                datasets.push({
                    label: rowlabel,
                    backgroundColor: '#00FFFF',
                    borderColor: '#00FFFF',
                    borderWidth: 1,
                    pointRadius: 1,
                    data: rowvalues,
                    fill: false,
                });
            }
            $("#kla1620shmwrapper")
                .append($("<div/>", {
                        css: {
                            height: h - scw,
                            width: w - scw,
                            "background-color": "white",
                            float: "left",
                            "margin-bottom": "15px"
                        }
                    })
                    .append($("<canvas/>", {
                        id: "myChart" + icluster,
                        css: {
                            height: h - scw,
                            width: w - scw
                        }
                    }))
                );

            var ctx = document.getElementById('myChart' + icluster).getContext('2d');
            Chart.defaults.global.plugins.colorschemes.override = true;
            Chart.defaults.global.legend.display = true;
            // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
            var clusterheader = "Cluster:" + (icluster + 1);
            clusterheader += " " + selsource;
            clusterheader += " " + stationrecord.stationid;
            clusterheader += " " + stationrecord.stationname;
            var config = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    title: {
                        display: true,
                        text: clusterheader
                    },
                    plugins: {
                        colorschemes: {
                            scheme: 'tableau.HueCircle19'
                        }
                    },
                    onClick: function (ev) {
                        var title = this.titleBlock;
                        if (!title) {
                            return;
                        }
                        var x = ev.x;
                        var y = ev.y;
                        if (x > title.left && x < title.right && y > title.top && y < title.bottom) {
                            alert('title clicked!');
                        }
                    }
                }
            };
            window.chart1 = new Chart(ctx, config);
        }
        /**
         * Ausgabe des Metaclusters
         */
        var metacluster = []; // n cluster mit 12 Monatswerten
        datasets = [];
        labels = [];
        var vlen = tarray[0].values.length;
        if (vlen === 12) {
            for (var imon = 0; imon < vlen; imon++) {
                labels.push("M" + ("00" + (imon + 1)).slice(-2));
            }
        } else {
            for (var imon = 0; imon < vlen; imon++) {
                labels.push("T" + ("000" + (imon + 1)).slice(-3));
            }
        }

        var yearsounds = [];
        var clusteravgs = [];
        for (var icluster = 0; icluster < clusters.length; icluster++) {
            var monsum = new Array(vlen).fill(0.0);
            var moncount = new Array(vlen).fill(0);
            for (var ielem = 0; ielem < clusters[icluster].length; ielem++) {
                var md5pointer = md5(JSON.stringify(clusters[icluster][ielem]));
                var year = md5pointers[md5pointer];
                var rowvalues = [];
                for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {
                    if (year === matrix1.rowheaders[iyear]) {
                        rowvalues = matrix1.data[iyear];
                        break;
                    }
                }
                yearsounds.push([year, icluster]);
                for (var imon = 0; imon < vlen; imon++) {
                    if (rowvalues[imon] !== null) {
                        monsum[imon] += parseFloat(rowvalues[imon]);
                        moncount[imon]++;
                    }
                }
            }

            var avgvalues = new Array(vlen).fill(0);
            var avgsum = 0;
            var avgcount = 0;
            for (var imo = 0; imo < vlen; imo++) {
                if (moncount[imo] > 0) {
                    avgvalues[imo] = monsum[imo] / moncount[imo];
                    avgsum += monsum[imo];
                    avgcount += moncount[imo];
                }
            }
            clusteravgs.push({
                icluster: icluster,
                avg: avgsum / avgcount
            });
            datasets.push({
                label: "Cluster:" + (icluster + 1),
                /* "M" + ("00" + (imon + 1)).slice(-2), */
                backgroundColor: '#00FFFF',
                borderColor: colorarray[icluster % 10],
                borderWidth: 1,
                pointRadius: 1,
                data: avgvalues,
                fill: false,
            });
        }
        // yearsounds[[year, icluster]]
        yearsounds.sort(function (a, b) {
            if (a[0] < b[0])
                return -1;
            if (a[0] > b[0])
                return 1;
            return 0;
        });
        var spanstring = "";
        var metaarray = [];

        for (var iy = 0; iy < yearsounds.length; iy++) {
            if (iy > 0) spanstring += ",";
            spanstring += yearsounds[iy][1];
            metaarray.push(Number(yearsounds[iy][1]));
        }

        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h - scw,
                        width: w - scw,
                        "background-color": "white",
                        float: "left",
                        "margin-bottom": "15px"
                        /* overflow: "auto" */
                    }
                })
                .append($("<canvas/>", {
                    id: "myMetaChart",
                    css: {
                        height: h - scw,
                        width: w - scw,
                        /* overflow: "auto" */
                    }
                }))
            );

        var metactx = document.getElementById('myMetaChart').getContext('2d');
        Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var clusterheader = "Meta-Cluster ";
        clusterheader += " " + selsource;
        clusterheader += " " + stationrecord.variable;
        clusterheader += " " + stationrecord.stationid;
        clusterheader += " " + stationrecord.stationname;
        clusterheader += " " + stationrecord.anzyears;
        clusterheader += " von:" + stationrecord.fromyear;
        clusterheader += " bis:" + stationrecord.toyear;
        clusterheader += " " + stationrecord.countryname;
        clusterheader += " " + stationrecord.region;
        clusterheader += " " + stationrecord.longitude;
        clusterheader += "/" + stationrecord.latitude;
        var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                title: {
                    display: true,
                    text: clusterheader
                },

            }
        };
        window.chart1 = new Chart(metactx, config);
        /*
        clusteravgs.push({
            icluster: icluster,
            avg: avgsum/avgcount
        });
        */
        // absteigend
        clusteravgs.sort(function (a, b) {
            if (a.avg > b.avg)
                return -1;
            if (a.avg < b.avg)
                return 1;
            return 0;
        });
        var newval = 0;
        for (var ic = 0; ic < clusteravgs.length; ic++) {
            newval++;
            clusteravgs[ic].newval = newval;
        }
        clusteravgs.sort(function (a, b) {
            if (a.icluster < b.icluster)
                return -1;
            if (a.icluster < b.icluster)
                return 1;
            return 0;
        });
        var metaarray1 = [];
        for (var imeta = 0; imeta < metaarray.length; imeta++) {
            metaarray1.push(clusteravgs[metaarray[imeta]].newval);
        }

        $("#kla1620shmwrapper")
            .append($("<br/>"))
            .append($("<span/>", {
                id: "metasound",
                css: {
                    margin: "10px",
                    float: "left"
                }
            }))
            .append($("<button/>", {
                html: "Soundification  year/cluster#",
                css: {
                    margin: "10px"
                },
                click: function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    var splay = [];
                    for (var iy = 0; iy < yearsounds.length; iy++) {
                        splay.push(yearsounds[iy][1] + 100);
                    }
                    //var a = dtm.data(pearls[key]);
                    var a = dtm.data(splay);
                    dtm.music().note(a.range(60, 90)).play().for(24);
                    // dtm.music().note(a.range(20, 60)).play().for(12);
                    //dtm.music().note(a.range(0,10)).play();
                }
            }));
        $("#metasound").sparkline(metaarray, {
            type: 'line',
            fillColor: false,
            defaultPixelsPerValue: 3,
            lineColor: "blue"
            /* composite: true */
        });


        $("#kla1620shmwrapper")
            .append($("<br/>"))
            .append($("<span/>", {
                id: "metasound1",
                css: {
                    margin: "10px",
                    float: "left"
                }
            }))
            .append($("<button/>", {
                html: "Soundification year/cluster*",
                css: {
                    margin: "10px"
                },
                click: function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    var splay = [];

                    for (var iy = 0; iy < metaarray1.length; iy++) {
                        splay.push(metaarray1[iy] + 100);
                    }
                    var a = dtm.data(splay);
                    dtm.music().note(a.range(60, 90)).play().for(24);
                    //  mit Callback - später mal richtig
                    /*
                    var mus0 = dtm.music().note(a.range(60,90)).play().for(24);
                    var mus1 = dtm.music(function (mus0,i) {
                        console.log(i);
                        var a1 = this.data(i).print();
                        console.log(a1);
                        dtm.music().note(a1).play();
                    });
                    mus1.trigger();
                    */
                }
            }));
        $("#metasound1").sparkline(metaarray1, {
            type: 'line',
            fillColor: false,
            defaultPixelsPerValue: 3,
            lineColor: "blue"
            /* composite: true */
        });

    };

    /**
     * bucketAnalysis - 30 Jahre zusammengefasst = Klimaperioden-Monatsaufbereitung
     */
    kla1620shm.bucketAnalysis = function (bucketlength, selvariablename, selsource, selstationid) {
        /**
         * Bereitstellung der Daten
         */
        var colorarray = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];
        var years = stationrecord[selvariablename].years;
        tarray = [];
        // Lückenfüllung in years
        var yearvals = Object.keys(years);
        // Korrektur auf bucketlength-Jahre Buckets
        var startyear = parseInt(yearvals[0]);
        var endyear = new Date().getFullYear();
        var diff1 = endyear - startyear + 1;
        var rem1 = diff1 % bucketlength;
        startyear = endyear - diff1 - (bucketlength - rem1) + 1;
        for (var iyear = startyear; iyear <= endyear; iyear++) {
            if (typeof years["" + iyear] === "undefined") {
                years["" + iyear] = new Array(12).fill(null);
            }
        }
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: year,
                    months: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        /**
         * Vorbereitung Ausgabebereich
         */
        var scw = uihelper.getScrollbarWidth($("#kla1620shmwrapper")[0].parentElement);
        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h - scw,
                        width: w - scw,
                        "background-color": "white",
                        overflow: "auto"
                    }
                })
                .append($("<canvas/>", {
                    id: "myChartBucket",
                    css: {
                        height: h - scw,
                        width: w - scw
                    }
                }))
            );
        /**
         * Rahmen für die Sparklines mit Regressionsgerade zu den Buckets
         */
        var scw = uihelper.getScrollbarWidth($("#kla1620shmwrapper")[0].parentElement);
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;

        /**
         * Tabelle 1 "kla1620shmt3" - Monatsspalten pivotiert
         */
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        width: w - scw,
                        "margin-top": "15px",
                        "z-index": 1,
                        position: "relative"
                        /* overflow: "auto" */
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        id: "kla1620shmt3",
                        css: {
                            "max-width": (w - scw - 10) + "px",
                            "margin-top": "10px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Jahr"
                            }))
                            .append($("<th/>", {
                                html: "M01"
                            }))
                            .append($("<th/>", {
                                html: "M02"
                            }))
                            .append($("<th/>", {
                                html: "M03"
                            }))
                            .append($("<th/>", {
                                html: "M04"
                            }))
                            .append($("<th/>", {
                                html: "M05"
                            }))
                            .append($("<th/>", {
                                html: "M06"
                            }))
                            .append($("<th/>", {
                                html: "M07"
                            }))
                            .append($("<th/>", {
                                html: "M08"
                            }))
                            .append($("<th/>", {
                                html: "M09"
                            }))
                            .append($("<th/>", {
                                html: "M10"
                            }))
                            .append($("<th/>", {
                                html: "M11"
                            }))
                            .append($("<th/>", {
                                html: "M12"
                            }))
                            .append($("<th/>", {
                                html: "AVG"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        $("#kla1620shmt3").hide();
        /**
         * Tabelle 2 "kla1620shmt2"
         */
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        width: w - scw,
                        "margin-top": "15px",
                        "z-index": 2,
                        position: "relative"
                        /* overflow: "auto" */
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        id: "kla1620shmt2",
                        css: {
                            "max-width": (w - scw - 10) + "px",
                            "margin-top": "10px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Jahr"
                            }))
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
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
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        /**
         * Loop zur Ausgabe der Buckets
         */
        var hmcc = document.getElementById(cid);
        var hmcctx = hmcc.getContext("2d");
        var ihit = 0;
        // var anzyears = tarray.length;
        var anzyears = parseInt(tarray.length);
        var anzbuckets = Math.ceil(anzyears / bucketlength); // aufgerundet
        var labels = [];
        for (var imon = 0; imon < 12; imon++) {
            labels.push("M" + ("00" + (imon + 1)).slice(-2));
        }
        var datasets = [];
        var yearavgs = [];
        for (var ibucket = 1; ibucket <= anzbuckets; ibucket++) {
            var firstyear = (ibucket - 1) * bucketlength; // auf 0 als Basis im Array
            var lastyear = (ibucket) * bucketlength - 1; // also 0 - 29 im ersten Bucket bei 30
            if (lastyear >= anzyears) lastyear = anzyears - 1; // Absicherung
            // Holen der Daten zu den Jahren eines Clusters aus stationrecord[selvariablename].years;
            // year wird label, 12 Monate werden die Werte
            var rowvalues = [];
            var monsum = new Array(12).fill(0);
            var moncount = new Array(12).fill(0);
            kla1620shm.paintSB(bucketlength, selvariablename, selsource, selstationid, firstyear, lastyear, "kla1620shmt2", "kla1620shmt3");
            for (var iyear = firstyear; iyear <= lastyear; iyear++) {
                rowvalues = tarray[iyear].months;
                for (var imon = 0; imon < 12; imon++) {
                    if (rowvalues[imon] !== null) {
                        monsum[imon] += parseFloat(rowvalues[imon]);
                        moncount[imon]++;
                    }
                }
            }
            var avgvalues = new Array(12).fill(0);
            for (var imo = 0; imo < 12; imo++) {
                if (moncount[imo] > 0) {
                    avgvalues[imo] = monsum[imo] / moncount[imo];
                } else {
                    avgvalues[imo] = null;
                }
            } // years-Loop im Bucket
            var rowlabel = "ab:" + tarray[firstyear].year;
            datasets.push({
                label: rowlabel,
                /* "M" + ("00" + (imon + 1)).slice(-2), */
                backgroundColor: '#00FFFF',
                borderColor: '#00FFFF',
                borderWidth: 1,
                pointRadius: 1,
                data: avgvalues,
                fill: false,
            });
        } // bucket-Loop


        $(".tablesorter").tablesorter({
            theme: "blue",
            widgets: ['filter'],
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

        $("#kla1620shmt3").show();

        var ctx = document.getElementById('myChartBucket').getContext('2d');
        Chart.defaults.global.plugins.colorschemes.override = true;
        Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var bucketheader = "Buckets:";
        bucketheader += " " + selsource;
        bucketheader += " " + stationrecord.stationid;
        bucketheader += " " + stationrecord.stationname;
        var config = {
            type: 'line',
            data: {
                datasets: datasets,
                labels: labels
            },
            options: {
                title: {
                    display: true,
                    text: bucketheader
                },
                plugins: {
                    colorschemes: {
                        scheme: 'tableau.HueCircle19'
                    }
                },
            }
        };
        window.chart1 = new Chart(ctx, config);


        /**
         * Soundification for buckets https://ttsuchiya.github.io/dtm/doc/
         */
        /*
        $("#kla1620shmwrapper")
            .append($("<div/>", {
                    css: {
                        "max-width": (w - scw - 10) + "px",
                        float: "left"
                    }
                })
                .append($("<span/>", {
                    id: "metasound",
                    css: {
                        margin: "10px",
                        float: "left"
                    }
                }))
                .append($("<button/>", {
                    html: "Soundification  Buckets Winter",
                    css: {
                        margin: "10px"
                    },
                    click: function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                        var cvector = [];
                        var von = tarray.length - 30 - 1;
                        var bis = tarray.length - 1;
                        cvector = [];
                        for (var ia = von; ia <= bis; ia++) {
                            var iskip = false;
                            // Januar bis April
                            for (var imo = 0; imo < 3; imo++) {
                                if (tarray[ia].months[imo] === null) {
                                    //cvector.push(-9999);
                                    iskip = true;
                                    break;
                                } else {
                                    cvector.push(parseFloat(tarray[ia].months[imo]));
                                }
                            }
                            if (iskip === true) continue;
                            // November, Dezember
                            for (var imo = 10; imo < 12; imo++) {
                                if (tarray[ia].months[imo] === null) {
                                    //cvector.push(-9999);
                                    iskip = true;
                                    break;
                                } else {
                                    cvector.push(parseFloat(tarray[ia].months[imo]));
                                }
                            }
                            if (iskip === true) continue;
                        }
                        // Soundification
                        var splay = [];
                        for (var ic = 0; ic < cvector.length; ic++) {
                            splay.push(Number(cvector[ic]) + 100);
                        }
                        //var a = dtm.data(pearls[key]);
                        var a = dtm.data(splay);
                        dtm.music().note(a.range(60, 90)).play().for(24);
                    }
                }))
                .append($("<br/>"))
                .append($("<button/>", {
                    html: "Soundification  Buckets Sommer",
                    css: {
                        margin: "10px"
                    },
                    click: function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                        var cvector = [];
                        var von = tarray.length - 30 - 1;
                        var bis = tarray.length - 1;
                        cvector = [];
                        for (var ia = von; ia <= bis; ia++) {
                            var iskip = false;
                            // Januar bis April
                            for (var imo = 4; imo < 10; imo++) {
                                if (tarray[ia].months[imo] === null) {
                                    //cvector.push(-9999);
                                    iskip = true;
                                    break;
                                } else {
                                    cvector.push(parseFloat(tarray[ia].months[imo]));
                                }
                            }
                            if (iskip === true) continue;
                        }
                        // Soundification
                        var splay = [];
                        for (var ic = 0; ic < cvector.length; ic++) {
                            splay.push(Number(cvector[ic]) + 100);
                        }
                        //var a = dtm.data(pearls[key]);
                        var a = dtm.data(splay);
                        dtm.music().note(a.range(60, 90)).play().for(24);
                    }
                }))
            );
            */
    };


    /**
     * paintSB - Sparklines für Monate eines Buckets
     * - von Jahr, bis Jahr für ein Bucket
     */
    kla1620shm.paintSB = function (bucketlength, selvariablename, selsource, selstationid, von, bis, tableid, tableid2) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         * table wird vorausgesetzt, es kommen nur die rows in die Table
         * tarray wird vorausgesetzt
         * ***
         */
        $("#" + tableid2)
            .append($("<tr/>")
                .append($("<td/>", {
                    html: tarray[von].year + "-" + tarray[bis].year
                }))
            );

        /**
         * jeder Monat über alle Jahre eines Bucket
         */
        var pcount = 0;
        var msum = 0;
        var mcount = 0;
        for (var imon = 0; imon < 12; imon++) {
            var monindex = imon;
            pcount++;
            var sparkid = 'spark' + von + "_" + pcount;

            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            // rowvalues = tarray[iyear].months;
            for (var iarray = von; iarray <= bis; iarray++) {
                // Iterate Monate
                var x = parseInt(tarray[iarray].year);
                var y;
                var temperatur = tarray[iarray].months[imon];
                if (temperatur === null) {
                    pearls.push(null);
                    y = null;
                } else {
                    pearls.push(parseFloat(temperatur));
                    y = parseFloat(temperatur);
                    if (miny === null) {
                        miny = y;
                    } else if (y < miny) {
                        miny = y;
                    }
                    if (maxy === null) {
                        maxy = y;
                    } else if (y > maxy) {
                        maxy = y;
                    }
                }
                // Transformation von x und y
                //y = y + 273.15;  // Kelvin
                // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                regarray.push([x, y]);
            }
            if (miny !== null && regarray.length > 1) {
                var minyv = miny;
                var maxyv = maxy;
                // Regression https://github.com/Tom-Alexander/regression-js
                var result = regression.linear(regarray);
                if (result === null || result.length < 2) debugger;
                var gradient = result.equation[0];
                if (gradient === null) debugger;
                var yIntercept = result.equation[1];
                var gcolor;
                var cfakt;
                // percentage zwischen 0 und 1, daher transponieren
                if (gradient < -0.01) {
                    if (gradient < -5) {
                        cfakt = 1;
                    } else {
                        cfakt = (Math.abs(gradient)) / 5;
                    }
                    gcolor = kla9020fun.percentagetohsl(cfakt * 1, 160, 200); // blue
                } else if (gradient >= -0.01 && gradient < 0.01) {
                    cfakt = (Math.abs(gradient + 0.01));
                    gcolor = kla9020fun.percentagetohsl(cfakt, 90, 135); // green
                } else {
                    if (gradient > 5) {
                        cfakt = 1;
                    } else {
                        cfakt = (Math.abs(gradient)) / 5;
                    }
                    gcolor = kla9020fun.percentagetohsl((1 - cfakt), 1, 80); // red mit Kehrwert
                }


                $("#" + tableid2)
                    .find("tr:last")
                    .append($("<td/>", {
                        css: {
                            "text-align": "center",
                            "background-color": gcolor
                        },
                        html: gradient // zu 'M' + ("00" + (imon + 1)).slice(-2)
                    }));

            } else {

                $("#" + tableid2)
                    .find("tr:last")
                    .append($("<td/>", {
                        css: {
                            "text-align": "center"
                        },
                        html: "&nbsp;" // zu 'M' + ("00" + (imon + 1)).slice(-2)
                    }));
                continue;
            }

            msum += gradient;
            mcount++;

            $("#" + tableid)
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: tarray[von].year + "-" + tarray[bis].year
                    }))
                    .append($("<td/>", {
                        html: 'M' + ("00" + (imon + 1)).slice(-2)
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: sparkid,
                            css: {
                                margin: "5px",
                                float: "left"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            html: gradient.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            html: yIntercept.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            html: result.r2.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                );

            /**
             * Regressionsgerade berechnen und einblenden
             * return [m, c] aus y = mx + c; basierend auf regarray.push([x, y]);
             */
            var linarray = [];
            var newpearls = [];
            for (var ilin = 0; ilin < regarray.length; ilin++) {
                var newx = regarray[ilin][0];
                var newp = result.predict(newx);
                var newy = newp[1].toFixed(2);
                var y = newp[1];
                if (miny === null && y !== null) {
                    miny = y;
                } else if (y < miny) {
                    miny = y;
                }
                if (maxy === null && y !== null) {
                    maxy = y;
                } else if (y > maxy) {
                    maxy = y;
                }
                linarray.push([newx, newy]);
                newpearls.push(newy);
            }

            // $(sparkid).sparkline(pearls);

            $("#" + sparkid).sparkline(pearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: 3,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "blue"
                /* composite: true */
            });
            $("#" + sparkid).sparkline(newpearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: 3,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "red",
                composite: true
            });

        }

        if (mcount > 0) {
            var gradient = (msum / mcount).toFixed(2);
            var gcolor;
            var cfakt;
            // percentage zwischen 0 und 1, daher transponieren
            if (gradient < -0.01) {
                if (gradient < -5) {
                    cfakt = 1;
                } else {
                    cfakt = (Math.abs(gradient)) / 5;
                }
                gcolor = kla9020fun.percentagetohsl(cfakt * 1, 160, 200); // blue
            } else if (gradient >= -0.01 && gradient < 0.01) {
                cfakt = (Math.abs(gradient + 0.01));
                gcolor = kla9020fun.percentagetohsl(cfakt, 90, 135); // green
            } else {
                if (gradient > 5) {
                    cfakt = 1;
                } else {
                    cfakt = (Math.abs(gradient)) / 5;
                }
                gcolor = kla9020fun.percentagetohsl((1 - cfakt), 1, 80); // red mit Kehrwert
            }

            $("#" + tableid2)
                .find("tr:last")
                .append($("<td/>", {
                    css: {
                        "text-align": "center",
                        "background-color": gcolor
                    },
                    html: gradient // zu 'M' + ("00" + (imon + 1)).slice(-2)
                }));
        } else {
            $("#" + tableid2)
                .find("tr:last")
                .append($("<td/>", {
                    css: {
                        "text-align": "center"
                    },
                    html: "&nbsp;" // zu 'M' + ("00" + (imon + 1)).slice(-2)
                }));
        }
    }; // ende paintSB

    /**
     * kliheatmap2 - Heatmap berechnen, Animation sichern und anzeigen
     * mit "Video-Controls" - aus KLISTATIONS - YEARS
     *
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
     *
     * @param {*} callbackh0
     */
    kla1620shm.kliheatmap2 = function (cid, selvariablename, selsource, selstationid, starecord, hmoptions, callbackh0) {
        $("#heatmap").show();
        $("#heatworld").show();

        // KLISTATIONS mit <variablename>.years[<year>][12 Werte im Array]

        async.waterfall([
                function (callbackshm1) {
                    var sqlStmt = "";
                    var sel = {
                        source: selsource,
                        stationid: selstationid
                    };
                    var projection = {
                        source: 1,
                        stationid: 1,
                        name: 1,
                        climatezone: 1,
                        region: 1,
                        subregion: 1,
                        countryname: 1,
                        lats: 1,
                        longitude: 1,
                        latitude: 1,
                        anzyears: 1,
                        realyears: 1,
                        fromyear: 1,
                        toyear: 1,
                        height: 1,
                        "analysis.tavg.regression.total.m": 1,
                        "analysis.tavg.regression.mtotal": 1,
                    };
                    sqlStmt += "SELECT ";
                    sqlStmt += "KLISTATIONS.source, ";
                    sqlStmt += "KLISTATIONS.stationid, ";
                    sqlStmt += "stationname, ";
                    sqlStmt += "climatezone, ";
                    sqlStmt += "region, ";
                    sqlStmt += "subregion, ";
                    sqlStmt += "countryname, ";
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
                    sqlStmt += "AND KLIDATA.variable = '" + selvariablename.toUpperCase() + "' ";
                    sqlStmt += "ORDER BY KLISTATIONS.source, KLISTATIONS.stationid";
                    // "analysis.tavg.regression.total.m": 1,
                    // "analysis.tavg.regression.mtotal": 1,
                    var api = "getonerecord";
                    var table = "KLISTATIONS";
                    uihelper.getOneRecord(sqlStmt, projection, api, table, function (ret) {
                        if (ret.error === false && ret.record !== null) {
                            /*
                            intern wird getallsqlrecords gerufen und EIN Satz in record zurückgegeben.
                            */
                            stationrecord = ret.record;
                            callbackshm1(null, {
                                error: false,
                                message: "Daten gefunden",
                                record: ret.record
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
                                callbackshm1("Error", {
                                    error: true,
                                    message: "Keine Daten gefunden",
                                });
                                return;
                            } else {
                                kla1620shm.loadstationdata(selstationid, selsource, sqlStmt, function (ret, record) {
                                    sysbase.putMessage("Daten geladen und bereitgestellt", 1);
                                    console.log("loadstationdata fertig:" + ret.message);
                                    callbackshm1(null, {
                                        error: ret.error,
                                        message: ret.message,
                                        record: ret.record
                                    });
                                    return;
                                });
                            }
                        }
                    });
                },
                function (ret, callbackshm2) {
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
                    try {
                        var wmtit = "Selektion für Station:";
                        wmtit += " " + ret.record.source + " ";
                        // isMember ? '$2.00' : '$10.00'
                        wmtit += selstationid;
                        wmtit += (ret.record.stationname || "").length > 0 ? " " + ret.record.stationname : "";
                        wmtit += (ret.record.fromyear || "").length > 0 ? " von " + ret.record.fromyear : "";
                        wmtit += (ret.record.toyear || "").length > 0 ? " bis " + ret.record.toyear : "";
                        wmtit += (ret.record.anzyears || 0).length > 0 ? " für " + ret.record.anzyears + " Jahre" : "";
                        wmtit += (ret.record.region || "").length > 0 ? " Region:" + ret.record.region : "";
                        wmtit += (ret.record.climatezone || "").length > 0 ? " Klimazone:" + ret.record.climatezone : "";
                        wmtit += (ret.record.height || "").length > 0 ? " Höhe:" + ret.record.height : "";
                        $(".headertitle").html(wmtit);
                        var years = JSON.parse(ret.record.years);
                        var dayyears = JSON.parse(ret.record.years); // ret.record[selvariablename].years;

                        var mtitle = "";
                        mtitle += (ret.record.variable || "").length > 0 ? " " + ret.record.variable : "";
                        mtitle += " " + selstationid;
                        mtitle += (ret.record.stationname || "").length > 0 ? " " + ret.record.stationname : "";
                        mtitle += (ret.record.fromyear || "").length > 0 ? " von " + ret.record.fromyear : "";
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
                        for (var year in years) {
                            if (years.hasOwnProperty(year)) {
                                matrix1.rowheaders.push(year);
                                var rowvalues = years[year];
                                matrix1.data[irow] = [];
                                for (var icol = 0; icol < 365; icol++) {
                                    if (typeof rowvalues[icol] === "undefined") {
                                        debugger;
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
                                                    var hmvalstr = "" + Math.round(parseFloat(rowvalues[icol]));
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
                                                    var buck2 = Math.floor(buck1 / 30);
                                                    var buck3 = 1661 + (buck2) * 30;
                                                    var buckyear = "" + buck3;
                                                    if (typeof hmoptions.cbucketdata[buckyear] === "undefined") {
                                                        hmoptions.cbucketdata[buckyear] = {
                                                            toyear: buck3 + 29,
                                                            histo: [],
                                                            minval: null,
                                                            maxval: null,
                                                            valsum: 0,
                                                            valcount: 0
                                                        };
                                                    }
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
                        var erg = kla9020fun.getHeatmap(cid, matrix1, hmoptions, function (ret) {
                            sysbase.putMessage("Heatmap ausgegeben", 1);
                            // if (hmoptions.minmax === true) debugger;
                            callbackshm2(null, {
                                error: false,
                                message: "Heatmap ausgegeben",
                                matrix: matrix1,
                                options: uihelper.cloneObject(hmoptions),
                                hoptions: ret.hoptions,
                                histo: hmoptions.histo,
                                temparray: ret.temparray
                            });
                            return;
                        });
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
                function (ret, callbackshm2) {
                    // hier muss die matrix1-Struktur übergeben werden
                    // kla1620shm.paintT(selvariablename, selsource, selstationid, ret.matrix);
                    callbackshm2("Finish", ret);
                    return;
                }
            ],
            function (error, ret) {
                callbackh0(ret);
                return;
            });
    };




    /**
     * scatter - Scattergramm erzeugen aus array1 in festes Zielgebiet
     * array1 hat pairs mit Objekten aus gradient und temp (avg-Temp)
     * das ist zu verallgemeinern mit x und y als Übergaben und
     * Konfiguration bzw. Beschriftung, die dem Anwender die Bedeutung erklärt
     */
    kla1620shm.scatter = function () {

        $("#kla1620shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1620shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1620shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1620shmwrapper")
            .append($("<div/>", {
                id: "my_dataviz",
                css: {
                    height: h,
                    width: w,
                    overflow: "auto",
                    "background-color": "white"
                }
            }));


        // set the dimensions and margins of the graph
        var margin = {
                top: 10,
                right: 30,
                bottom: 30,
                left: 60
            },
            width = 920 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")

        var minx = null;
        var maxx = null;
        var miny = null;
        var maxy = null;
        for (var ind = 0; ind < array1.length; ind++) {
            var x = parseFloat(array1[ind].temp);
            var y = parseFloat(array1[ind].gradient);
            if (minx === null) {
                minx = x;
            } else if (minx > x) {
                minx = x;
            }

            if (maxx === null) {
                maxx = x;
            } else if (maxx < x) {
                maxx = x;
            }

            if (miny === null) {
                miny = y;
            } else if (miny > y) {
                miny = y;
            }

            if (maxy === null) {
                maxy = y;
            } else if (maxy < y) {
                maxy = y;
            }
        }
        //Read the data - or provide the data
        var data = array1;

        //d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function (data) {
        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, 0])
            .range([0, width]);
        svg.append("g")
            .attr("class", "myXaxis") // Note that here we give a class to the X axis, to be able to call it later and modify it
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("opacity", "0");

        // Add Y axis -  .domain([0, 500000])    .range([height, 0]);
        var y = d3.scaleLinear()
            .domain([miny, maxy])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d.temp);
            })
            .attr("cy", function (d) {
                return y(d.gradient);
            })
            .attr("r", 1.5)
            .style("fill", "#69b3a2");

        // new X axis - x.domain([0, 4000])
        x.domain([minx, maxx]);
        svg.select(".myXaxis")
            .transition()
            .duration(2000)
            .attr("opacity", "1")
            .call(d3.axisBottom(x));

        svg.selectAll("circle")
            .transition()
            .delay(function (d, i) {
                return (i * 3)
            })
            .duration(2000)
            .attr("cx", function (d) {
                return x(d.temp);
            })
            .attr("cy", function (d) {
                return y(d.gradient);
            });
        // })

    };






    kla1620shm.activateDragDrop = function () {
        // Dragdrop aktivieren, umstellen auf offset
        var box = $(".heatvardiv");
        var mainCanvas = $(".kla1620shmwrapper");
        box.draggable({
            containment: mainCanvas,
            helper: "clone",
            start: function () {
                $(this).css({
                    opacity: 0
                });
                $(".box").css("z-index", "0");
            },
            stop: function () {
                $(this).css({
                    opacity: 1
                });
            }
        });
        box.droppable({
            accept: box,
            drop: function (event, ui) {
                var draggable = ui.draggable;
                var droppable = $(this);
                var dragOff = draggable.offset();
                var dropOff = droppable.offset();
                ui.draggable.offset(dropOff);
                draggable.offset(dropOff);
                droppable.offset(dragOff);
            }
        });
    };

    /**
     * Einblendung Stopuhr wärend langer AJAX-Aufrufe
     */
    kla1620shm.showclock = function (clockcontainer) {
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
        module.exports = kla1620shm;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1620shm;
        });
    } else {
        // included directly via <script> tag
        root.kla1620shm = kla1620shm;
    }
}());