/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper */
(function () {
    'use strict';
    var kla0201men = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global || this;

    var gblmode = "";

    var msgbuffer = [];

    kla0201men.setMode = function (modus) {
        gblmode = modus;
    };

    kla0201men.show = function () {
        /**
         * neue Aufgaben für Tab-Steuerung!!!
         */
        kla0201men.putMenu();
        $(".header")
            .append($("<div/>", {
                    class: "tabwrapper"
                })
                .append($("<div/>", {
                    class: "tab"
                }))
            );
        $(".footer").remove();
        var con = $(".content");
        $(con).addClass("tabbodies");
        $(con).removeClass("content");
        $(".tabbodies").empty();

        var hh = $(".header").outerHeight();
        var fh = 0; /* $(".footer").outerHeight(); */
        var wh = $(window).height();
        $(".tabbodies").height(wh - hh - fh - 1);
        $(".tabbodies").width("100%");
        sysbase.tabcreateiframe("SQLite3", "", "re-frame", "uisql3");
        sysbase.tabcreateiframe("Schlüsselverz", "", "re-frame", "syspool");

        var idc = sysbase.tabcreateiframe("SQLite3-Rep", "", "re-frame", "uisql3rep");
        // window.parent.$(".tablinks[idhash='#" + idc + "']").click();

        //var idc1 = sysbase.tabcreateiframe("Klima-Rohdaten", "", "re-klima", "kla1400raw");
        //window.parent.$(".tablinks[idhash='#" + idc1 + "']").click();

        var idc1 = sysbase.tabcreateiframe("Stationsanalyse", "", "re-klima", "kla1610sta");
        // window.parent.$(".tablinks[idhash='#" + idc1 + "']").click();

        var idc2 = sysbase.tabcreateiframe("Animation", "", "re-klima", "kla1650ani", "klaworldmap.html");
        window.parent.$(".tablinks[idhash='#" + idc2 + "']").click();
        /* sysbase.initFooter(); */
        // uientry.init();

        if ($("#kla0201menList li").length === 0) {
            for (var imsg = 0; imsg < msgbuffer.length - 1; imsg++) {
                var oldtxt = msgbuffer[imsg];
                $("#kla0201menList")
                    .prepend($('<li/>', {
                        html: "OLD:" + oldtxt,
                        css: {
                            "white-space": "normal",
                            "background-color": "lightsteelblue",
                            "text-align": "left"
                        }
                    }));
            }
        }
    };

    /**
     * all als generalmenue für alle bevor rollenrechte kommen
     * script und domref können aus module abgeleitet werden!!!
     * script: "js/uiloginControl.js",  domref: "loginControl"
     */
    var sysmenu = {

        all: [
            /*
            {
                id: "admin0002",
                text: "RAW-Data-Admin",
                app: "re-klima",
                module: "kli1400raw"
            },
            {
                id: "admin0003",
                text: "Stationen",
                app: "re-klima",
                module: "kli1610sta"
            },
            {
                id: "admin0020",
                text: "netCDF Albedo",
                app: "re-klima",
                module: "kli1300net"
            },
            */
            {
                id: "admin0008",
                text: "Stationen",
                app: "re-klima",
                module: "kla1610sta"
            },
            {
                id: "admin0010",
                text: "Rohdaten",
                app: "re-klima",
                module: "kla1400raw"
            },
            {
                id: "admin0020",
                text: "Statistik",
                app: "re-klima",
                module: "kla1680gra",
                htmlpage: "klaheatmap.html"
            },
            {
                id: "admin0025",
                text: "Textanalyse",
                app: "re-klima",
                module: "kla1700txt"
            },
            {
                id: "admin0030",
                text: "Codes and Keys",
                app: "re-frame",
                module: "syspool"
            },
            {
                id: "admin0035",
                text: "Report SQL3",
                app: "re-frame",
                module: "uisql3rep"
            },
            {
                id: "admin0040",
                text: "Control SQL3",
                app: "re-frame",
                module: "uisql3"
            },
            {
                id: "admin0060",
                text: "Logfiles",
                app: "re-frame",
                module: "sys2100dwn"
            },
            {
                id: "admin0070",
                text: "Close",
                exec: "*close"
            }
        ]
    };


    kla0201men.putMenu = function () {
        /**
         * Dropdown-Menue anlegen, wenn es noch nicht vorhanden ist
         */

        if ($(".generalmenue").length === 0) {
            $(".header")
                .prepend($("<button/>", {
                        class: "dropdown generalmenue",
                        text: "Menu",
                        css: {
                            float: "left",
                            height: "2em",
                            "background-color": "lime"
                        }
                    })
                    .append($("<div/>", {
                            class: "dropdown-content",
                        })
                        .append($("<ul/>", {
                            id: "kla0201top"
                        }))
                    )
                );
        }

        for (var men in sysmenu) {
            if (sysmenu.hasOwnProperty(men)) {
                var rolemenu = sysmenu[men];
                for (var im = 0; im < rolemenu.length; im++) {
                    var menupoint = rolemenu[im];
                    $("#kla0201top")
                        .append($("<li/>", {
                            class: "dropdown-menuepoint kla0201mp",
                            html: menupoint.text,
                            app: menupoint.app,
                            htmlpage: menupoint.htmlpage,
                            module: menupoint.module,
                            exec: menupoint.exec
                        }));
                }
            }
        }



        $(document).on("click", ".kla0201mp", function (event) {
            event.preventDefault();
            var app = $(this).attr("app");
            var module = $(this).attr("module");
            var title = $(this).html();
            var htmlpage = $(this).attr("htmlpage") || "";
            var exec = $(this).attr("exec");
            if (typeof exec === "string") {
                if (exec === "*close") {
                    // TODO - ist noch zu verfeinern!!! - function übergeordnet aufrufen
                    // window.opener könnte ein Ansatz sein, zum Aufruf
                    window.close();
                    return;
                } else {
                    eval(exec);
                }

            } else {
                var idcode = sysbase.tabcreateiframe(title, "", app, module, htmlpage);
                $(".tablinks[idhash='#" + idcode + "']").click();
            }
        });


        if ($(".generalmenue").length === 0) {
            $(".header")
                .prepend($("<button/>", {
                        class: "dropdown generalmenue",
                        css: {
                            float: "left",
                            height: "1em",
                            "background-color": "navyblue"
                        }
                    })
                    .append($("<div/>", {
                            class: "dropdown-content",
                        })
                        .append($("<ul/>")
                            .append($("<li/>", {
                                class: "dropdown-menuepoint",
                                html: "Messages",
                                click: function (evt) {
                                    evt.preventDefault();
                                    // selbstaufruf ohne navigateTo
                                    kla0201men.show();
                                }
                            }))
                            .append($("<li/>", {
                                class: "dropdown-menuepoint",
                                html: "Control SQLite3",
                                click: function (event) {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    event.stopPropagation();
                                    sysbase.navigateTo("uisql3", [], function (ret) {
                                        if (ret.error === true) {
                                            alert(ret.message);
                                        }
                                    });
                                }
                            }))
                            .append($("<li/>", {
                                class: "dropdown-menuepoint",
                                html: "Codes and Keys",
                                click: function (event) {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    event.stopPropagation();
                                    sysbase.navigateTo("syspool", [], function (ret) {
                                        if (ret.error === true) {
                                            alert(ret.message);
                                        }
                                    });
                                }
                            }))

                            .append($("<li/>", {
                                class: "dropdown-menuepoint",
                                html: "Download Logfiles",
                                click: function (event) {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    event.stopPropagation();
                                    sysbase.navigateTo("sys2100dwn", [], function (ret) {
                                        if (ret.error === true) {
                                            alert(ret.message);
                                        }
                                    });
                                }
                            }))
                            .append($("<li/>", {
                                class: "dropdown-menuepoint",
                                html: "Close",
                                click: function () {
                                    window.top.close();
                                }
                            }))))
                );
        }
    };



    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla0201men;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla0201men;
        });
    } else {
        // included directly via <script> tag
        root.kla0201men = kla0201men;
    }
}());