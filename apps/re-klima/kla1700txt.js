/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper,SuperGif,WordCloud */
(function () {
    var kla1700txt = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var actprjname = "";
    var actfullname = "";
    var actresult = "";
    var poprecord = {};
    var aktsource = "";
    var fulldatafilename = "";
    var datafilename = "";
    var acttext = "";

    kla1700txt.show = function (parameters, navigatebucket) {
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
        $(".headertitle").html("Textanalyse zum Klima");
        $(".headertitle").attr("title", "kla1700txt");
        $(".content").attr("pageid", "kla1700txt");
        $(".content").attr("id", "kla1700txt");
        $(".content")
            .css({
                overflow: "hidden"
            });

        $(".content")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1700txt_isdirty",
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
                            html: "Textanalyse",
                            click: function (evt) {
                                evt.preventDefault();
                                var fullname = actfullname;
                                var target = "#kla1700txt_rightw";
                                $(target).empty();
                                var options = {};
                                kla1700txt.textanalysis(fullname, target, options, function (ret) {
                                    // Ausgabe
                                });

                            }
                        }))


                        .append($("<li/>", {
                            class: "dropdown-menuepoint",
                            html: "Word-Cloud",
                            click: function (evt) {
                                evt.preventDefault();
                                window.parent.sysbase.setCache("wordcloud", actresult);
                                var idc20 = window.parent.sysbase.tabcreateiframe("WordCloud", "", "re-klima", "kla1710wcl", "klatext.html");
                                window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();


                                /*
                                var fullname = actfullname;
                                var target = "#kla1700txt_rightw";
                                $(target).empty();
                                if (typeof actresult !== "object" || Object.keys(actresult).length === 0) {
                                    sysbase.putMessage("Erst Textanalyse, dann Word-Cloud aufrufen", 3);
                                    return;
                                }

                                $(target)
                                    .append($("<canvas/>", {
                                        id: "kla1700txtcanvas",
                                        css: {
                                            border: "1px solid"
                                        }
                                    }));
                                var canvas = document.getElementById("kla1700txtcanvas");
                                canvas.width = $("#kla1700txt_rightw").width() * .9;
                                canvas.height = $("#kla1700txt_rightw").height() * .9;

                                // where list is an array that look like this: [['foo', 12], ['bar', 6]]
                                var wordarray = [];
                                for (var iword = 0; iword < actresult.vocstats.length; iword++) {
                                    wordarray.push([
                                        actresult.vocstats[iword].word,
                                        actresult.vocstats[iword].count,
                                    ])
                                }
                                WordCloud(document.getElementById('kla1700txtcanvas'), {
                                    list: wordarray,
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
                                */
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
            id: "kla1700txt_left",
            class: "col1of2",
            css: {
                width: "30%",
                "background-color": "lightsteelblue"
            }
        }));

        $(".content").append($("<div/>", {
            id: "kla1700txt_right",
            class: "col2of2",
            css: {
                width: "69%",
                "background-color": "yellow"
            }
        }));
        /**
         * Tab/Reiter-Struktur anlegen https://www.w3schools.com/howto/howto_js_tabs.asp
         * class: "tab" für das gesamte div-Konstrukt
         * class: "tablink" für den Reiter-Button
         * class: "tabcontent" für den div-Inhalt je Reiter
         * opentab (tablink als this oder id des Button, id des tab, callback) für die Aktivierung eines Tabs
         */
        $("#kla1700txt_right").empty();

        sysbase.initFooter();

        // hier die Höhen absolut berechnen und versorgen
        var h = $(".content").height();
        var hh = $(".header").height();
        h += hh;
        var fh = $(".footer").height();
        h -= fh - 3;
        $("#kla1700txt_left").height(h);
        $("#kla1700txt_right").height(h);
        var url = $("#kla1700txturl").val();
        var directory = $("#kla1700txtdir").val();
        $("#kla1700txt_left")
            .append($("<div/>", {
                    css: {
                        width: "100%"
                    }
                })
                .append($("<button/>", {
                    html: "Text-Tree Save",
                    css: {
                        float: "left",
                        "margin-left": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var selfields = {
                            username: uihelper.getUsername(),
                            configname: "TEXTTREE"
                        };
                        var updfields = {};
                        var api = "setonerecord";
                        var table = "KLICONFIG";
                        var confrecord = {};
                        try {
                            var treeData = $('#kla1700txtt0').jstree(true).get_json('#', {
                                flat: false
                            });
                            // set flat:true to get all nodes in 1-level json
                            var jsonString = JSON.stringify(treeData);
                            updfields["$setOnInsert"] = {
                                username: uihelper.getUsername(),
                                configname: "TEXTTREE"
                            };
                            updfields["$set"] = {
                                jsonString: jsonString
                            };
                            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                                if (ret.error === false) {
                                    sysbase.putMessage("kla1700txt" + " saved:" + ret.message, 1);
                                    return;
                                } else {
                                    sysbase.putMessage("kla1700txt" + " NOT saved:" + ret.message, 3);
                                    return;
                                }
                            });
                        } catch (err) {
                            sysbase.putMessage("kla1700txt" + " ERROR:" + err, 3);
                            return;
                        }
                    }
                }))
                .append($("<button/>", {
                    html: "Text-Tree Restore",
                    css: {
                        float: "left",
                        "margin-left": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var sel = {
                            username: uihelper.getUsername(),
                            configname: "TEXTTREE"
                        };
                        var projection = {
                            history: 0
                        };
                        var api = "getonerecord";
                        var table = "KLICONFIG";
                        uihelper.getOneRecord(sel, projection, api, table, function (ret) {
                            if (ret.error === false && ret.record !== null) {
                                /*
                                    var treeData = $('#MyTree').jstree(true).get_json('#', {flat:false})
                                    // set flat:true to get all nodes in 1-level json
                                    var jsonData = JSON.stringify(treeData );
                                */
                                var filenodes = JSON.parse(ret.record.jsonString);
                                if ($("#kla1700txtt0").hasClass("jstree")) {
                                    $("#kla1700txtt0").jstree(true).destroy();
                                }
                                // "checkbox"
                                $("#kla1700txtt0").jstree({
                                    "plugins": ["state"],
                                    core: {
                                        'check_callback': true,
                                        data: filenodes
                                    }
                                });
                                sysbase.putMessage("Konfiguration geladen");
                            } else {
                                sysbase.putMessage("Konfiguration nicht vorhanden");
                            }
                        });
                    }
                }))
                .append($("<button/>", {
                    html: "Text-Tree Refresh",
                    css: {
                        float: "left",
                        "margin-left": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        kla1700txt.showfiles("list", "", "", "", function (ret) {
                            if (ret.error === true) {
                                var newdirectory = ["C:", "projekte", "klimadaten", "BOOKS"];
                                kla1700txt.showfiles("list", "", newdirectory, "", function (ret) {
                                    return;
                                });
                            } else {
                                return;
                            }
                        });
                    }
                }))

                .append($("<button/>", {
                    html: "KLIRAWFILES-Reorg",
                    title: "Dateieinträge ohne physische Datei werden entfernt, History wird geschrieben",
                    css: {
                        float: "left",
                        "margin-left": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        kla1700txt.showfiles("list", "", "", "", function (ret) {
                            return;
                        });
                    }
                }))
                .append($("<br/>"))

                .append($("<button/>", {
                    html: "Textanalyse",
                    title: "Bereinigung, Stemming, Auszählung",
                    css: {
                        float: "left",
                        "margin-left": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        /**
                         *
                         * kla1700txt - Prompt;
                         */
                        var username = uihelper.getUsername();
                        poprecord = {
                            toplimit: 10,
                            language: "EN"
                        }
                        var popschema = {
                            entryschema: {
                                /*
                                props: {
                                    title: "Abrufparameter Textanalyse",
                                    description: "",
                                    type: "object", // currency, integer, datum, text, key, object
                                    class: "uiefieldset",
                                    properties: {
                                */
                                toplimit: {
                                    title: "Anzahl Top-Statistik",
                                    type: "string", // currency, integer, datum, text, key
                                    class: "uietext",
                                    width: "100px",
                                    io: "i"
                                },
                                language: {
                                    title: "Sprache",
                                    type: "string", // currency, integer, datum, text, key
                                    class: "uieselectinput",
                                    width: "100px",
                                    default: "EN",
                                    io: "i",
                                    enum: [
                                        "DE",
                                        "EN"
                                    ]
                                },
                                contextwords: {
                                    title: "Kontextanalyse",
                                    type: "string", // currency, integer, datum, text, key
                                    class: "uiestring",
                                    width: "100px",
                                    io: "i"
                                },
                                comment: {
                                    title: "Kommentar",
                                    type: "string", // currency, integer, datum, text, key
                                    class: "uietext",
                                    width: "100px",
                                    default: "",
                                    io: "i"
                                }
                            }
                            /*
                                }
                            }
                            */
                        };
                        var anchorHash = "#kla1700txt_rightw";
                        var title = "Super-Textanalyse";
                        /*
                        var pos = {
                            left: $("#kla1700txt_rightw").offset().left,
                            top: screen.height * 0.1,
                            width: $("#kla1700txt_rightw").width() * 0.80,
                            height: $("#kla1700txt_rightw").height() * 0.90
                        };
                        */
                        var pos = {
                            left: $("#kla1700txt_rightw").offset().left,
                            top: screen.height / 2 * .4 ,
                            width: $("#kla1700txt_rightw").width() * 0.60,
                        };
                        //Math.ceil($(this).offset().top + $(this).height() + 20)
                        $(document).on('popupok', function (evt, extraParam) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                            console.log(extraParam);
                            var superParam = JSON.parse(extraParam);
                            var fullname = actfullname;
                            var target = "#kla1700txt_rightw";
                            $(target).empty();
                            kla1700txt.textanalysis(fullname, target, superParam, function (ret) {
                                // Ausgabe wordcloud



                                return;
                            });
                        });
                        uientry.inputDialogX(anchorHash, pos, title, popschema, poprecord, function (ret) {
                            if (ret.error === false) {
                                // outrec.isactive = "false"; // true oder false wenn gelöscht
                            } else {
                                sysbase.putMessage("Kein Abruf Textanalyse", 1);
                                return;
                            }
                        });
                    }
                }))
                .append($("<br/>"))
            );

        var sel = {
            username: uihelper.getUsername(),
            configname: "TEXTTREE"
        };
        var projection = {
            history: 0
        };
        var api = "getonerecord";
        var table = "KLICONFIG";
        uihelper.getOneRecord(sel, projection, api, table, function (ret) {
            if (ret.error === false && ret.record !== null) {
                /*
                    var treeData = $('#MyTree').jstree(true).get_json('#', {flat:false})
                    // set flat:true to get all nodes in 1-level json
                    var jsonData = JSON.stringify(treeData );
                */
                var filenodes = JSON.parse(ret.record.jsonString);
                $("#kla1700txt_leftw").remove();
                $("#kla1700txt_left")
                    .append($("<div/>", {
                        id: "kla1700txt_leftw",
                        css: {
                            overflow: "auto",
                            float: "left",
                            width: "100%"
                        }
                    }));
                var h = $(".content").height();
                var loff = $("#kla1700txt_leftw").position();
                var ot = loff.top;
                h -= ot;
                var hh = $(".header").height();
                h += hh;
                var fh = $(".footer").height();
                h -= fh - 3;
                $("#kla1700txt_leftw").height(h);
                $("#kla1700txt_leftw").hide();
                $("#kla1700txtt0").remove();

                $("#kla1700txt_leftw")
                    .append($("<div/>", {
                        id: "kla1700txtt0",
                        css: {
                            width: "100%"
                        }
                    }));

                if ($("#kla1700txtt0").hasClass("jstree")) $("#kla1700txtt0").jstree(true).destroy();
                $("#kla1700txtt0").jstree({
                    "plugins": ["state"],
                    core: {
                        'check_callback': true,
                        data: filenodes
                    }
                });
                $("#kla1700txt_leftw").show();
                $('#kla1700txtt0').on("select_node.jstree", function (e, data) {
                    var node = $('#kla1700txtt0').jstree(true).get_node(data.node.id);
                    kla1700txt.clicknode(node, function (ret) {

                    });
                    //alert("node_id: " + data.node.id + " " + node.text);
                });
                sysbase.putMessage("Konfiguration geladen");
                /**
                 * sofortige Anzeige nach Rückkehr
                 */
                if (typeof navigatebucket.navigate !== "undefined" && navigatebucket.navigate === "back") {
                    if (typeof navigatebucket.oldparameters === "object") {

                    }
                }
            } else {
                sysbase.putMessage("Konfiguration nicht vorhanden");
                kla1700txt.showfiles("list", url, "", "", function (ret) {
                    return;
                });
            }
        });
    };


    kla1700txt.showclock = function (clockcontainer) {
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
     * showfiles - holt die vorhandenen Datendateien aus dem Verzeichnis
     * fileopcode: show oder prep
     * url: ist informatorisch zu sehen "https://www1.ncdc.noaa.gov/pub/data/paleo/pages2k/pages2k-temperature-v2-2017/data-current-version/"
     * predirectory: hier das klima1001-Verzeichnis
     * directory: Verzeichnis der eigentlichen Daten unter dem klima1001-Verzeichnis
     * ret.files - Array der gefundenen Dateien (Metadaten der Dateien)
     */
    kla1700txt.showfiles = function (fileopcode, url, predirectory, directory, callbacksf) {
        if (predirectory.length === 0) {
            predirectory = ["G:", "Projekte", "klimadaten", "BOOKS"];
        }
        document.getElementById("kla1700txt").style.cursor = "progress";
        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer("getdirectoryfiles"),
            data: {
                fileopcode: fileopcode,
                url: url,
                useroot: false,
                predirectory: predirectory,
                directory: directory,
                filterextensions: ".txt,.html",
                skipsubdirectories: "false",
                doKLIFILES: "false",
                doKLIRAWFILES: "false"
            }
        }).done(function (r1, textStatus, jqXHR) {
            sysbase.checkSessionLogin(r1);
            sysbase.putMessage(r1, 1);
            var ret = JSON.parse(r1);
            // Ausgabe in Map rechts
            $("#kla1700txt_leftw").remove();
            $("#kla1700txt_left")
                .append($("<div/>", {
                    id: "kla1700txt_leftw",
                    css: {
                        overflow: "auto",
                        float: "left",
                        width: "100%"
                    }
                }));
            var h = $(".content").height();
            var loff = $("#kla1700txt_leftw").position();
            var ot = loff.top;
            h -= ot;
            var hh = $(".header").height();
            h += hh;
            var fh = $(".footer").height();
            h -= fh - 3;
            $("#kla1700txt_leftw").height(h);
            $("#kla1700txt_leftw").hide();

            $(".kla1700txtt0").remove();
            $("#kla1700txt_leftw")
                .append($("<div/>", {
                    id: "kla1700txtt0",
                    css: {
                        width: "100%"
                    }
                }));
            var filenodes = [];
            for (var ilink = 0; ilink < ret.files.length; ilink++) {
                var linkname = ret.files[ilink].name;
                var linksize = ret.files[ilink].size || "?";
                var tsfilecreated = ret.files[ilink].tsfilecreated || "?";
                var archive = ret.files[ilink].archive || "?";
                var sitename = ret.files[ilink].sitename || "?";
                var longitude = ret.files[ilink].longitude || "?";
                var latitude = ret.files[ilink].latitude || "?";
                var firstyear = ret.files[ilink].firstyear || "?";
                var lastyear = ret.files[ilink].lastyear || "?";
                /*
                    // Expected format of the node (there are no required fields)
                    {
                    id          : "string" // will be autogenerated if omitted
                    text        : "string" // node text
                    icon        : "string" // string for custom
                    state       : {
                        opened    : boolean  // is the node open
                        disabled  : boolean  // is the node disabled
                        selected  : boolean  // is the node selected
                    },
                    children    : []  // array of strings or objects
                    li_attr     : {}  // attributes for the generated LI node
                    a_attr      : {}  // attributes for the generated A node
                    }
                */
                var filenode = {
                    text: linkname,
                };
                filenode.li_attr = {
                    fullname: ret.files[ilink].fullname
                };
                if (ret.files[ilink].isDirectory === true || ret.files[ilink].isDirectory === "1") {
                    filenode.children = [];
                    filenode.li_attr.what = "directory";
                } else {
                    filenode.icon = "jstree-file";
                    filenode.li_attr.what = "file";
                }
                filenodes.push(filenode);
            }
            if ($("#kla1700txtt0").hasClass("jstree")) $("#kla1700txtt0").jstree(true).destroy();
            // "checkbox"
            $("#kla1700txtt0").jstree({
                "plugins": ["state"],
                core: {
                    'check_callback': true,
                    data: filenodes
                }
            });

            $("#kla1700txt_leftw").show();
            document.getElementById("kla1700txt").style.cursor = "default";
            $('#kla1700txtt0').on("select_node.jstree", function (e, data) {
                var node = $('#kla1700txtt0').jstree(true).get_node(data.node.id);
                kla1700txt.clicknode(node, function (ret) {

                });
            });
            callbacksf(ret);
            return;
        }).fail(function (err) {
            document.getElementById("kla1700txt").style.cursor = "default";
            sysbase.putMessage(err, 1);
            callbacksf({
                error: true,
                message: err
            });
            return;
        }).always(function () {
            // nope
        });
    };

    /**
     * showfiles - holt die vorhandenen Datendateien aus dem Verzeichnis
     * fileopcode: show oder prep
     * url: ist informatorisch zu sehen "https://www1.ncdc.noaa.gov/pub/data/paleo/pages2k/pages2k-temperature-v2-2017/data-current-version/"
     * predirectory: hier das klima1001-Verzeichnis
     * directory: Verzeichnis der eigentlichen Daten unter dem klima1001-Verzeichnis
     * ret.files - Array der gefundenen Dateien (Metadaten der Dateien)
     */
    kla1700txt.addfiles = function (node, callbacka) {
        var fileopcode = "list";
        var predirectory = "";
        var directory = node.li_attr.fullname;
        document.getElementById("kla1700txt").style.cursor = "progress";
        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer("getdirectoryfiles"),
            data: {
                fileopcode: fileopcode,
                url: "",
                predirectory: predirectory,
                directory: directory,
                filterextensions: ".txt,.html",
                skipsubdirectories: "false",
                doKLIFILES: "false",
                doKLIRAWFILES: "false"
            }
        }).done(function (r1, textStatus, jqXHR) {
            sysbase.checkSessionLogin(r1);
            sysbase.putMessage(r1, 1);
            var ret = JSON.parse(r1);
            //for (var ilink = 0; ilink < ret.files.length; ilink++) {
            async.eachSeries(ret.files, function (filedata, nextfile) {
                    var filenode = {
                        text: filedata.name,
                    };
                    filenode.li_attr = {
                        fullname: filedata.fullname
                    };
                    if (filedata.isDirectory === true || filedata.isDirectory === "1") {
                        filenode.children = [];
                        filenode.li_attr.what = "directory";
                    } else {
                        filenode.icon = "jstree-file";
                        filenode.li_attr.what = "file";
                    }

                    try {
                        $('#kla1700txtt0').jstree().create_node(node, filenode, 'last', function (newnode) {
                            console.log("zugefügt:" + newnode.text);
                            nextfile();
                        }, true);
                    } catch (err) {
                        console.log("Error:" + err);
                        console.log(err.stack);
                    }
                },
                function (err) {
                    //$("#kla1700txtt0").jstree("open_all");
                    $("#kla1700txtt0").jstree().open_node(node);
                    $("#kla1700txt_leftw").show();
                    document.getElementById("kla1700txt").style.cursor = "default";
                    callbacka({
                        error: false,
                        message: "geladen"
                    });
                    return;
                });
        }).fail(function (err) {
            document.getElementById("kla1700txt").style.cursor = "default";
            sysbase.putMessage(err, 1);
            callbacka({
                error: false,
                message: "geladen"
            });
            return;
        }).always(function () {
            // nope
        });
    };

    /**
     * Anclicken Knoten in Treeview
     *
     * @param {*} node
     * @param {*} supercallback
     */
    kla1700txt.clicknode = function (node, supercallback) {
        var fullname = node.li_attr.fullname;
        actfullname = fullname;
        // dirty-flag später
        $("#kla1700txtform").empty();
        if (node.li_attr.what === "directory") {
            /**
             * Verzeichnisanalyse
             */
            async.waterfall([
                    function (callbackc) {
                        if (typeof node.children !== "undefined" && node.children.length > 0) {
                            // schon aufgelöst, also anzeigen
                            $("#kla1700txtt0").jstree().open_node(node);
                            callbackc(null, {
                                error: false,
                                message: "ausgegeben"
                            });
                            return;
                        } else {
                            kla1700txt.addfiles(node, function (ret) {
                                callbackc(null, ret);
                                return;
                            });
                        }
                    }
                ],
                function (error, ret) {
                    supercallback(ret);
                    return;
                }
            );
        } else {
            /**
             * Dateianalyse
             */
            // nur bei erste Anzeige, nicht beim Blättern neue Anzeige
            $("#kla1700txtform").empty();
            /**
             * Differenzieren der Dateitypen, Default ist Anzeige aus dem Inhalt,
             * spezielle Dateien werden abgefangen, GHCND vorgezogen
             */
            if (kla1700txt.checkfragments(fullname, "IPCC GHCN Daily stations \.html")) {
                // fullname, datatype, callbacksvg
                kla1700txt.painthtml(fullname, "html", function (ret) {
                    // nur bei erste Anzeige, nicht beim Blättern neue Anzeige
                    supercallback(ret);
                    return;
                });
            } else {
                // einfache Dateianzeige, inhalt
                kla1700txt.showfilecontent(fullname, 0, 0, "#kla1700txt_rightw", function (ret) {
                    // nur bei erste Anzeige, nicht beim Blättern neue Anzeige
                    supercallback(ret);
                    return;
                });
            }
        }
    };


    kla1700txt.setResizeObserver = function () {
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
                    $("#kla1700txt_entry").offset({
                        left: l2
                    });
                    $("#kla1700txt_entry").width(w2);
                    console.log("new l2:" + l2 + " w2:" + w2);
                }
            });
            if ($(".kla1700txt_rightw").length > 0) {
                resizeObserver.observe(document.querySelector(".kla1700txt_rightw"));
            }
        }
    };

    /**
     * showfilecontent - Anzeige txt-Dateien (hier mit Button zur Textanalyse)
     */
    kla1700txt.showfilecontent = function (fullname, fromline, frombyte, target, callbackf) {
        actfullname = fullname;
        if (typeof target === "undefined" || target.length === 0) {
            target = "#kla1700txt_rightw";
        }
        if (typeof target === "undefined" || target.length === 0) {
            target = "#kla1700txt_rightw";
            $("#kla1700txt_right")
                .append($("<div/>", {
                    id: "kla1700txt_rightw",
                    class: "kla1700txt_rightw",
                    css: {
                        resize: "horizontal",
                        overflow: "auto",
                        float: "left",
                        width: "100%"
                    }
                }));
        }
        document.getElementById("kla1700txt").style.cursor = "progress";
        // file - rechts anzeigen
        if ($(target).length === 0) {
            $("#kla1700txt_right")
                .append($("<div/>", {
                    id: target.substr(1),
                    class: target.substr(1),
                    css: {
                        resize: "horizontal",
                        overflow: "auto",
                        float: "left",
                        width: "100%"
                    }
                }));
        }
        $(target).empty();
        kla1700txt.setResizeObserver();
        $(target).height($("#kla1700txt_right").height() - $(target).position().top - 3);
        if (fullname.endsWith(".zip") || fullname.endsWith(".tar") || fullname.endsWith(".gz")) {
            /**
             * Inhaltsverzeichnis der komprimierten Datei holen
             */
            var jqxhr = $.ajax({
                method: "GET",
                crossDomain: false,
                url: sysbase.getServer("getzipentries"),
                data: {
                    fullname: fullname
                }
            }).done(function (r1, textStatus, jqXHR) {
                sysbase.checkSessionLogin(r1);
                sysbase.putMessage(r1, 1);
                var ret = JSON.parse(r1);
                // Ausgabe in Map rechts
                sysbase.putMessage(ret.message, 1);
                $(target).empty();
                $(target)
                    .append($("<span/>", {
                        html: ret.html,
                        css: {
                            width: "100%"
                        }
                    }));
                kla1700txt.setResizeObserver();
                document.getElementById("kla1700txt").style.cursor = "default";
                callbackf();
                return;
            }).fail(function (err) {
                document.getElementById("kla1700txt").style.cursor = "default";
                sysbase.putMessage(err, 1);
                callbackf();
                return;
            }).always(function () {
                // nope
            });
        } else {
            var jqxhr = $.ajax({
                method: "GET",
                crossDomain: false,
                url: sysbase.getServer("getfilecontent"),
                data: {
                    fullname: fullname,
                    fromline: fromline,
                    frombyte: frombyte
                }
            }).done(function (r1, textStatus, jqXHR) {
                sysbase.checkSessionLogin(r1);
                sysbase.putMessage(r1, 1);
                var ret = JSON.parse(r1);
                // Ausgabe in Map rechts
                sysbase.putMessage(ret.message, 1);
                $(target).empty();
                $(target)
                    .append($("<span/>", {
                        html: ret.nextchunk,
                        css: {
                            width: "100%"
                        }
                    }));
                kla1700txt.setResizeObserver();
                document.getElementById("kla1700txt").style.cursor = "default";
                // Buttons für das Blättern ausgeben oder nicht
                if (ret.error === false) {
                    $(target)
                        .append($("<button/>", {
                            html: "<<<",
                            fullname: ret.fullname,
                            fromline: ret.fromline - 100,
                            frombyte: ret.frombyte - 10000,
                            css: {
                                float: "left",
                                "margin-left": "10px",
                                "background-color": "navyblue"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var fullname = $(this).attr("fullname");
                                var fromline = $(this).attr("fromline");
                                var frombyte = $(this).attr("frombyte");
                                kla1700txt.showfilecontent(fullname, fromline, frombyte, target, function (ret) {

                                });
                            }
                        }));
                    $(target)
                        .append($("<button/>", {
                            html: ">>>",
                            fullname: ret.fullname,
                            fromline: ret.fromline,
                            frombyte: ret.frombyte,
                            css: {
                                float: "left",
                                "margin-left": "10px",
                                "background-color": "navyblue"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var fullname = $(this).attr("fullname");
                                var fromline = $(this).attr("fromline");
                                var frombyte = $(this).attr("frombyte");

                                kla1700txt.showfilecontent(fullname, fromline, frombyte, target, function (ret) {

                                });

                            }
                        }));
                }
                callbackf();
                return;


            }).fail(function (err) {
                document.getElementById("kla1700txt").style.cursor = "default";
                sysbase.putMessage(err, 1);
                callbackf();
                return;
            }).always(function () {
                // nope
            });
        }
    };


    /**
     * paintHtml - HTML-Datei anzeigen, Tabellen und Graphiken
     */
    kla1700txt.paintHtml = function (fullname, datatype, callbacksvg) {
        $("#kla1680gra_right").empty();
        var h = $(".col1of2").height();
        var w = $("#kla1680gra.content").width();
        w -= $(".col1of2").position().left;
        w -= $(".col1of2").width();
        w -= 40;
        $("#kla1680gra_right")
            .append($("<div/>", {
                id: "kla1680graw",
                css: {
                    height: h,
                    width: w,
                    "background-color": "white"
                }
            }));
        $("#kla1680graw").empty();
        $("#kla1680graw")
            .append($("<iframe/>", {
                id: "kla1680grafra",
                height: h,
                width: w
            }));

        var idis = fullname.indexOf("temp");
        var filename = fullname.substr(idis);
        $("#kla1680grafra").attr("src", filename);

    };




    /**
     * textanalysis - Analyse Textdatei im Server und Anzeige Ergebnis
     */
    kla1700txt.textanalysis = function (fullname, target, options, callbackf) {
        if (typeof target === "undefined" || target.length === 0) {
            target = "#kla1700txt_rightw";
        }
        if (typeof target === "undefined" || target.length === 0) {
            target = "#kla1700txt_rightw";
            $("#kla1700txt_right")
                .append($("<div/>", {
                    id: "kla1700txt_rightw",
                    class: "kla1700txt_rightw",
                    css: {
                        resize: "horizontal",
                        overflow: "auto",
                        float: "left",
                        width: "100%"
                    }
                }));
        }
        document.getElementById("kla1700txt").style.cursor = "progress";
        // file - rechts anzeigen
        if ($(target).length === 0) {
            $("#kla1700txt_right")
                .append($("<div/>", {
                    id: target.substr(1),
                    class: target.substr(1),
                    css: {
                        resize: "horizontal",
                        overflow: "auto",
                        float: "left",
                        width: "100%"
                    }
                }));
        }
        $(target).empty();
        kla1700txt.setResizeObserver();
        $(target).height($("#kla1700txt_right").height() - $(target).position().top - 3);

        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer("textanalysis"),
            data: {
                fullname: fullname,
                language: options.language || "EN",
                toplimit: options.toplimit || 10
            }
        }).done(function (r1, textStatus, jqXHR) {
            sysbase.checkSessionLogin(r1);
            sysbase.putMessage(r1, 1);
            var ret = JSON.parse(r1);
            // Ausgabe in Map rechts
            sysbase.putMessage(ret.message, 1);
            $(target).empty();
            actresult = ret.result;
            acttext = ret.text;
            $(target)
                .append($("<div/>", {
                        css: {
                            width: "100%"
                        }
                    })
                    .append($("<button/>", {
                        css: {
                            "margin-left": "10px"
                        },
                        html: "Download Tabelle",
                        click: function (evt) {
                            evt.preventDefault();
                            //uihelper.downloadHtmlTable ("#kla1700txtwords", "Extrakt", options);
                            uihelper.downloadHtmlTableSelected ("#kla1700txtwords", "Extract.html");
                        }
                    }))
                );
            var htmltable = "";
            var staformat = {
                pos: {
                    title: "Nr",
                    width: "8%",
                    align: "center"
                },
                word: {
                    title: "Word",
                    name: "word",
                    width: "25%",
                    align: "left",
                    css: {
                        "word-wrap": "break-word"
                    }
                },
                count: {
                    title: "Anzahl",
                    width: "10%",
                    align: "center"
                }
            };
            // for (irec = 0; irec < ret.records.length; irec++) {
            // actresult.vocstats
            var irec = 0;
            for (var iword = 0; iword < actresult.vocstats.length; iword++) {
                var record = actresult.vocstats[iword];
                irec++;
                var starec = {
                    pos: irec,
                    word: record.word,
                    count: record.count
                };
                var line = uihelper.transformJSON2TableTR(starec, irec - 1, staformat, "", "kla1700txttrclick tablesorter-ignoreRow");
                htmltable += line;
            }
            htmltable += "</body>";
            htmltable += "</table>";
            $(target)
                .append($("<table/>", {
                    id: "kla1700txtwords",
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

            kla1700txt.setResizeObserver();
            document.getElementById("kla1700txt").style.cursor = "default";
            callbackf();
            return;
        }).fail(function (err) {
            document.getElementById("kla1700txt").style.cursor = "default";
            sysbase.putMessage(err, 1);
            callbackf();
            return;
        }).always(function () {
            // nope
        });
    };

    $(document).on("click", ".kla1700txttrclick", function(evt){
        alert($(this).find("td[name=word]").text());
    });
    



    /**
     * Prüfen teststring, ob alle Fragemente in fragments enthalten sind
     * blank-separierte fragmente
     * return true oder false
     */
    kla1700txt.checkfragments = function (teststring, fragments) {
        var test = teststring.toLowerCase();
        var frag = fragments.toLowerCase();
        var tfrags = frag.split(" ");
        for (var ifrag = 0; ifrag < tfrags.length; ifrag++) {
            var such = tfrags[ifrag].trim();
            if (test.indexOf(such) < 0) {
                return false;
            }
        }
        return true;
        /*
        for (var ifrag = 0; ifrag < tfrags.length; ifrag++) {
            if (trags[ifrag].startsWith("."))
            var such = new RegExp(tfrags[ifrag].trim(), "i");
            if (!such.test(teststring)) {
                return false;
            }
        }
        return true;
        */

    };



    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1700txt;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1700txt;
        });
    } else {
        // included directly via <script> tag
        root.kla1700txt = kla1700txt;
    }
}());