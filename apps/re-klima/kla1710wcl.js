/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper,SuperGif,WordCloud */
(function () {
    var kla1710wcl = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /** 
     * kla1710wcl - WordCloud
     * Parameter aus getCache mit wordcloud
     */
    var actprjname = "";
    var actfullname = "";
    var actresult = "";
    var poprecord = {};

    kla1710wcl.show = function (parameters, navigatebucket) {
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
        $(".headertitle").html("Word-Cloud zum Klima");
        $(".headertitle").attr("title", "kla1710wcl");
        $(".content").attr("pageid", "kla1710wcl");
        $(".content").attr("id", "kla1710wcl");
        $(".content")
            .css({
                overflow: "hidden"
            });

        $(".content")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1710wcl_isdirty",
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
                            html: "Word-Cloud",
                            click: function (evt) {
                                evt.preventDefault();

                                var fullname = actfullname;
                                var target = "#kla1710wcl_rightw";
                                $(target).empty();
                                if (typeof actresult !== "object" || Object.keys(actresult).length === 0) {
                                    sysbase.putMessage("Erst Textanalyse, dann Word-Cloud aufrufen", 3);
                                    return;
                                }

                                $(target)
                                    .append($("<canvas/>", {
                                        id: "kla1710wclcanvas",
                                        css: {
                                            border: "1px solid"
                                        }
                                    }));
                                var canvas = document.getElementById("kla1710wclcanvas");
                                canvas.width = $("#kla1710wcl_rightw").width() * .9;
                                canvas.height = $("#kla1710wcl_rightw").height() * .9;

                                // where list is an array that look like this: [['foo', 12], ['bar', 6]]
                                var wordarray = [];
                                for (var iword = 0; iword < actresult.vocstats.length; iword++) {
                                    wordarray.push([
                                        actresult.vocstats[iword].word,
                                        actresult.vocstats[iword].count,
                                    ])
                                }
                                WordCloud(document.getElementById('kla1710wclcanvas'), {
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
                            }
                        }))



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
            id: "kla1710wcl_left",
            class: "col1of2",
            css: {
                width: "30%",
                "background-color": "lightsteelblue"
            }
        }));

        $(".content").append($("<div/>", {
            id: "kla1710wcl_right",
            class: "col2of2",
            css: {
                width: "69%",
                "background-color": "yellow"
            }
        }));

        $("#kla1710wcl_right").empty();
        sysbase.initFooter();
        // hier die Höhen absolut berechnen und versorgen
        var h = $(".content").height();
        var hh = $(".header").height();
        h += hh;
        var fh = $(".footer").height();
        h -= fh - 3;
        $("#kla1710wcl_left").height(h);
        $("#kla1710wcl_right").height(h);

        kla1710wcl.wordcloud(function (ret) {

        });


    };


    kla1710wcl.showclock = function (clockcontainer) {
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

    kla1710wcl.setResizeObserver = function () {
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
                    $("#kla1710wcl_entry").offset({
                        left: l2
                    });
                    $("#kla1710wcl_entry").width(w2);
                    console.log("new l2:" + l2 + " w2:" + w2);
                }
            });
            if ($(".kla1710wcl_rightw").length > 0) {
                resizeObserver.observe(document.querySelector(".kla1710wcl_rightw"));
            }
        }
    };

    /**
     * textanalysis - Analyse Textdatei im Server und Anzeige Ergebnis
     */
    kla1710wcl.wordcloud = function (callbackf) {
        var target = "#kla1710wcl_rightw";
        $(target).remove();
        $("#kla1710wcl_right")
            .append($("<div/>", {
                id: "kla1710wcl_rightw",
                class: "kla1710wcl_rightw",
                css: {
                    resize: "horizontal",
                    overflow: "auto",
                    float: "left",
                    width: "100%"
                }
            }));

        document.getElementById("kla1710wcl").style.cursor = "progress";
        // file - rechts anzeigen
        $(target).empty();
        kla1710wcl.setResizeObserver();
        $(target).height($("#kla1710wcl_right").height() - 3);

        var fullname = actfullname;
        var target = "#kla1710wcl_rightw";
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
                id: "kla1710wclcanvas",
                css: {
                    border: "1px solid"
                }
            }));
        var canvas = document.getElementById("kla1710wclcanvas");
        canvas.width = $("#kla1710wcl_rightw").width() * .9;
        canvas.height = $("#kla1710wcl_rightw").height() * .9;

        // where list is an array that look like this: [['foo', 12], ['bar', 6]]
        var wordarray = [];
        for (var iword = 0; iword < actresult.vocstats.length; iword++) {
            wordarray.push([
                actresult.vocstats[iword].word,
                actresult.vocstats[iword].count,
            ])
        }
        WordCloud(document.getElementById('kla1710wclcanvas'), {
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
        module.exports = kla1710wcl;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1710wcl;
        });
    } else {
        // included directly via <script> tag
        root.kla1710wcl = kla1710wcl;
    }
}());