/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper,SuperGif,WordCloud */
(function () {
    var kla1715sen = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1715sen - Sentence-Analysis in raw text
     * Parameter aus getCache mit wordcloud
     */
    var actprjname = "";
    var actfullname = "";
    var actresult = "";
    var acttext = "";
    var poprecord = {};

    kla1715sen.show = function (parameters, navigatebucket) {
        if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {

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
        $(".content").empty();
        $(".headertitle").html("Text in Sätze unterteilen");
        $(".headertitle").attr("title", "kla1715sen");
        $(".content").attr("pageid", "kla1715sen");
        $(".content").attr("id", "kla1715sen");
        $(".content")
            .css({
                overflow: "hidden"
            });

        $(".content")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1715sen_isdirty",
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
                    )));

        /**
         * content - body der Application
         */
        $(".content").append($("<div/>", {
            id: "kla1715sen_left",
            class: "col1of2",
            css: {
                width: "30%",
                "background-color": "lightsteelblue"
            }
        }));

        $(".content").append($("<div/>", {
            id: "kla1715sen_right",
            class: "col2of2",
            css: {
                width: "69%",
                "background-color": "yellow"
            }
        }));

        $("#kla1715sen_right").empty();
        sysbase.initFooter();
        // hier die Höhen absolut berechnen und versorgen
        var h = $(".content").height();
        var hh = $(".header").height();
        h += hh;
        var fh = $(".footer").height();
        h -= fh - 3;
        $("#kla1715sen_left").height(h);
        $("#kla1715sen_right").height(h);

        kla1715sen.text2sen(function (ret) {

        });


    };


    kla1715sen.showclock = function (clockcontainer) {
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

    kla1715sen.setResizeObserver = function () {
        if (1 === 1) return;
        if (typeof ResizeObserver !== "undefined") {
            var resizeObserver = new ResizeObserver(function (entries, observer) {
                for (var entry in entries) {
                    // console.log("resize:" + $(this).width());
                    var resx = entries[entry];
                    var div0 = $("#" + resx.target.id);
                    // console.log(resx.target.id);
                    var ww = $(window).width();

                    var l0 = $(div0).position().left;
                    var w0 = $(div0).width();
                    $(div0).parent().width(w0);
                    var l2 = l0 + w0;
                    var w2 = ww - l2;
                    $("#kla1715sen_entry").offset({
                        left: l2
                    });
                    $("#kla1715sen_entry").width(w2);
                    console.log("new l2:" + l2 + " w2:" + w2);
                }
            });
            if ($(".kla1715sen_rightw").length > 0) {
                resizeObserver.observe(document.querySelector(".kla1715sen_rightw"));
            }
        }
    };



    /**
     * text2sen - Text in Sentences unterteilen
     */
    kla1715sen.text2sen = function (callbackf) {
        /**
         * Daten holen
         */
        document.getElementById("kla1715sen").style.cursor = "progress";
        actresult = window.parent.sysbase.getCache("wordcloud"); // dort vocstats[] mit word, count
        acttext = window.parent.sysbase.getCache("wordtext");
        actfullname = window.parent.sysbase.getCache("wordfile");

        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer("getfilecontent"),
            data: {
                fullname: actfullname,
                getall: "true"
            }
        }).done(function (r1, textStatus, jqXHR) {
            sysbase.checkSessionLogin(r1);
            sysbase.putMessage(r1, 1);
            var ret = JSON.parse(r1);
            // Ausgabe in Map rechts
            sysbase.putMessage(ret.message, 1);
            kla1715sen.dosentences(ret.nextchunk);
            document.getElementById("kla1715sen").style.cursor = "default";
            callbackf();
            return;
        }).fail(function (err) {
            document.getElementById("kla1400raw").style.cursor = "default";
            sysbase.putMessage(err, 1);
            document.getElementById("kla1715sen").style.cursor = "default";
            callbackf();
            return;
        }).always(function () {
            // nope
        });
    };



    /**
     * Ausführen Satzanalyse
    */

    kla1715sen.dosentences = function (wordtext) {
        acttext = wordtext;
        document.getElementById("kla1715sen").style.cursor = "progress";

        var target = "#kla1715sen_rightw";
        $(target).remove();
        $("#kla1715sen_right")
            .append($("<div/>", {
                id: "kla1715sen_rightw",
                class: "kla1715sen_rightw",
                css: {
                    resize: "horizontal",
                    overflow: "auto",
                    float: "left",
                    width: "100%"
                }
            }));

        // file - rechts anzeigen
        $(target).empty();
        kla1715sen.setResizeObserver();
        $(target).height($("#kla1715sen_right").height() - 3);
        var target = "#kla1715sen_rightw";

        if (typeof acttext !== "string" || acttext.length === 0) {
            sysbase.putMessage("Dateiauswahl erst vornehmen, dann Syntaax-Analysis aufrufen", 3);
            return;
        }

        var htmltable = "";
        var staformat = {
            pos: {
                title: "Nr",
                width: "8%",
                align: "center"
            },
            sentence: {
                title: "Word",
                name: "word",
                width: "80%",
                align: "left",
                css: {
                    "word-wrap": "break-word"
                }
            },
            sep: {
                title: "Command",
                width: "10%",
                align: "center"
            }
        };
        // Byte-für_Byte-Analyse - senbuff als Zwischenspeicher
        // actresult.vocstats
        var irec = 0;
        var senbuff = "";
        var sens = [];
        for (var ipiece = 0; ipiece < acttext.length; ipiece++) {
            var piece = acttext[ipiece];
            if (piece === "\n" || piece === "\r") {
                if (senbuff.trim().length > 0) {
                    irec++;
                    var senrec = {
                        pos: irec,
                        sentence: senbuff,
                        sep: "LINE"
                    };
                    sens.push(senrec);
                    senbuff = "";
                }
                continue;
            }
            if (":!?".indexOf(piece) >= 0) {
                if (senbuff.trim().length > 0) {
                    irec++;
                    var senrec = {
                        pos: irec,
                        sentence: senbuff,
                        sep: piece
                    };
                    sens.push(senrec);
                    senbuff = "";
                }
                continue;
            }
            if (piece === ".") {
                var prepiece = "";
                if (ipiece > 0) prepiece = acttext[ipiece - 1];
                if ("0123456789".indexOf(prepiece) >= 0) {
                    senbuff += piece;
                    continue;
                }
                if (senbuff.trim().length > 0) {
                    irec++;
                    var senrec = {
                        pos: irec,
                        sentence: senbuff,
                        sep: "POINT"
                    };
                    sens.push(senrec);
                    senbuff = "";
                }
                continue;
            }
            senbuff += piece;
        }
        if (senbuff.trim().length > 0) {
            irec++;
            var senrec = {
                pos: irec,
                sentence: senbuff,
                sep: "FIN"
            };
            sens.push(senrec);
            senbuff = "";
        }
        for (var isen = 0; isen < sens.length; isen++) {
            var line = uihelper.transformJSON2TableTR(sens[isen], isen, staformat, "", "kla1715sent1click tablesorter-ignoreRow");
            htmltable += line;
        }
        htmltable += "</body>";
        htmltable += "</table>";
        $(target)
            .append($("<table/>", {
                id: "kla1715sent1",
                class: "tablesorter", // wichtig
                width: "95%",
                border: "2",
                rules: "all",
                css: {
                    layout: "fixed"
                },
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
        });
    };





    /**
     * textanalysis - Analyse Textdatei im Server und Anzeige Ergebnis
     */
    kla1715sen.wordcloud = function (callbackf) {
        var target = "#kla1715sen_rightw";
        $(target).remove();
        $("#kla1715sen_right")
            .append($("<div/>", {
                id: "kla1715sen_rightw",
                class: "kla1715sen_rightw",
                css: {
                    resize: "horizontal",
                    overflow: "auto",
                    float: "left",
                    width: "100%"
                }
            }));

        document.getElementById("kla1715sen").style.cursor = "progress";
        // file - rechts anzeigen
        $(target).empty();
        kla1715sen.setResizeObserver();
        $(target).height($("#kla1715sen_right").height() - 3);

        var fullname = actfullname;
        var target = "#kla1715sen_rightw";
        $(target).empty();
        /**
         * Daten holen
         */
        actresult = window.parent.sysbase.getCache("wordcloud");
        if (typeof actresult !== "object" || Object.keys(actresult).length === 0) {
            sysbase.putMessage("Erst Textanalyse, dann Word-Cloud aufrufen", 3);
            return;
        }

        $(target)
            .append($("<canvas/>", {
                id: "kla1715sencanvas",
                css: {
                    border: "1px solid"
                }
            }));
        var canvas = document.getElementById("kla1715sencanvas");
        canvas.width = $("#kla1715sen_rightw").width() * .9;
        canvas.height = $("#kla1715sen_rightw").height() * .9;

        // where list is an array that look like this: [['foo', 12], ['bar', 6]]
        var wordarray = [];
        for (var iword = 0; iword < actresult.vocstats.length; iword++) {
            wordarray.push([
                actresult.vocstats[iword].word,
                actresult.vocstats[iword].count,
            ])
        }
        WordCloud(document.getElementById('kla1715sencanvas'), {
            list: wordarray,
            /* gridSize: 18, */
            /* weightFactor: 3, */
            drawOutOfBound: false,
            shrinkToFit: true,
            fontFamily: 'Finger Paint, cursive, sans-serif',
            color: '#f0f0c0',
            hover: window.drawBox,
            click: function (item) {
                alert(item[0] + ': ' + item[1]);
            },
            backgroundColor: '#001f00'
        });




    };




    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1715sen;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1715sen;
        });
    } else {
        // included directly via <script> tag
        root.kla1715sen = kla1715sen;
    }
}());