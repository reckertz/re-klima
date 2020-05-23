/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper */
(function () {
    var kla1680gra = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var actprjname = "";
    var aktfullname = "";
    var aktsource = "";
    var fulldatafilename = "";
    var datafilename = "";
    var klirecord = {};
    var bigdata = {};
    var pearldata = {};
    var vgldata;
    var forcedata = "false";

    var klischema = {
        entryschema: {
            fsdata: {
                title: "Filesystem",
                description: "",
                type: "object", // currency, integer, datum, text, key, object
                class: "uiefieldset",
                width: "90%",
                properties: {
                    fullname: {
                        title: "Fullname",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        default: "",
                        io: "o"
                    },
                    /**
                     * aus fs kommen directory, isDirectory, isFile, name, size, tsfilecreated
                     */
                    isDirectory: {
                        title: "ist Verzeichnis",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        default: "",
                        io: "o"
                    },
                    isFile: {
                        title: "ist Datei",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        default: "",
                        io: "o"
                    },
                    size: {
                        title: "Dateigrösse",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        default: "",
                        io: "o"
                    }
                }
            },
            selections: {
                title: "Selektionen",
                type: "array",
                class: "uietable",
                showrefreshicon: true,
                showdeleteicon: true,
                items: [{
                    selyears: {
                        title: "Jahre",
                        type: "string",
                        class: "uietext",
                        io: "o"
                    },
                    datafilename: {
                        title: "Datei",
                        type: "string",
                        class: "uietext",
                        io: "o"
                    }
                }]
            },
            comments: {
                title: "Kommentare",
                description: "",
                type: "object", // currency, integer, datum, text, key, object
                class: "uiefieldset",
                width: "90%",
                properties: {
                    description: {
                        title: "Kommentar",
                        type: "string", // currency, integer, datum, text, key
                        class: "uiearea",
                        default: "",
                        io: "i"
                    }
                }
            },
            metadata: {
                title: "Metadaten",
                description: "",
                type: "object", // currency, integer, datum, text, key, object
                class: "uiefieldset",
                width: "90%",
                properties: {
                    filetype: {
                        title: "Dateityp",
                        type: "string", // currency, integer, datum, text, key
                        class: "uieselectinput",
                        default: "",
                        io: "i",
                        enum: [
                            "csv mit Header",
                            "csv ohne Header",
                            "ASCII fixed",
                            "ASCII Esri Grid",
                            "ASCII spezial",
                            "netCDF",
                            "ASCII netCDF"
                        ]
                    },
                    separator: {
                        title: "Feld-Trenner",
                        type: "string", // currency, integer, datum, text, key
                        class: "uieselectinput",
                        default: "",
                        io: "i",
                        enum: [{
                                value: ",",
                                text: "Komma"
                            },
                            {
                                value: ";",
                                text: "Semikolon"
                            },
                            {
                                value: "Tab",
                                text: "Tab"
                            }
                        ]
                    },
                    targettable: {
                        title: "Zieltabelle",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        default: "",
                        io: "i"
                    },
                    primarykey: {
                        title: "Schlüsselfeld",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        default: "",
                        io: "i"
                    }
                }
            }
        }
    };

    kla1680gra.show = function (parameters, navigatebucket) {
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
        $(".headertitle").html("Statistik mit Graphik");
        $(".headertitle").attr("title", "kla1680gra");
        $(".content").attr("pageid", "kla1680gra");
        $(".content").attr("id", "kla1680gra");
        $(".content")
            .css({
                overflow: "hidden"
            });

        $(".content")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1680gra_isdirty",
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
                            html: "Test Mondphasen",
                            click: function (evt) {
                                evt.preventDefault();
                                var datum = window.prompt("ISO-Datum eingeben", "2020-02-17");
                                if (datum !== null) {
                                    var yea1 = datum.substr(0, 4);
                                    var mon1 = datum.substr(5, 2);
                                    var day1 = datum.substr(8, 2);
                                    var erg = uihelper.moonphase(yea1, mon1, day1);
                                    alert("Ergebnis:" + erg.phase + " " + erg.name);
                                }
                                return;
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
            id: "kla1680gra_left",
            class: "col1of2",
            css: {
                width: "30%",
                "background-color": "lightsteelblue"

            }
        }));

        $(".content").append($("<div/>", {
            id: "kla1680gra_right",
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
        $("#kla1680gra_right").empty();


        sysbase.initFooter();

        // hier die Höhen absolut berechnen und versorgen
        var h = $(".content").height();
        /*
        var loff = $("#kla1680gra_leftw").position();
        var ot = loff.top;
        h -= ot;
        */
        var hh = $(".header").height();
        h += hh;
        var fh = $(".footer").height();
        h -= fh - 3;
        $("#kla1680gra_left").height(h);
        $("#kla1680gra_right").height(h);

        var url = $("#kla1680graurl").val();
        var directory = $("#kla1680gradir").val();

        $("#kla1680gra_left")
            .append($("<div/>", {
                    css: {
                        width: "100%"
                    }
                })
                .append($("<button/>", {
                    html: "Tree Save",
                    css: {
                        float: "left",
                        "margin-left": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var selfields = {
                            username: uihelper.getUsername(),
                            configname: "TEMPTREE"
                        };
                        var updfields = {};
                        var api = "setonerecord";
                        var table = "KLICONFIG";
                        var confrecord = {};
                        try {
                            var treeData = $('#kla1680grat0').jstree(true).get_json('#', {
                                flat: false
                            });
                            // set flat:true to get all nodes in 1-level json
                            var jsonString = JSON.stringify(treeData);
                            updfields["$setOnInsert"] = {
                                username: uihelper.getUsername(),
                                configname: "TEMPTREE"
                            };
                            updfields["$set"] = {
                                jsonString: jsonString
                            };
                            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                                if (ret.error === false) {
                                    sysbase.putMessage("kla1680gra" + " saved:" + ret.message, 1);
                                    return;
                                } else {
                                    sysbase.putMessage("kla1680gra" + " NOT saved:" + ret.message, 3);
                                    return;
                                }
                            });
                        } catch (err) {
                            sysbase.putMessage("kla1680gra" + " ERROR:" + err, 3);
                            return;
                        }
                    }
                }))
                .append($("<button/>", {
                    html: "Tree Restore",
                    css: {
                        float: "left",
                        "margin-left": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var sel = {
                            username: uihelper.getUsername(),
                            configname: "TEMPTREE"
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
                                if ($("#kla1680grat0").hasClass("jstree")) {
                                    $("#kla1680grat0").jstree(true).destroy();
                                }
                                // "checkbox"
                                $("#kla1680grat0").jstree({
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
                    html: "Tree Refresh",
                    css: {
                        float: "left",
                        "margin-left": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        kla1680gra.showfiles("list", "", "", "", function (ret) {
                            return;
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
                        kla1680gra.showfiles("list", "", "", "", function (ret) {
                            return;
                        });
                    }
                }))


                .append($("<br/>"))
                .append($("<br/>"))
            );

        var sel = {
            username: uihelper.getUsername(),
            configname: "TEMPTREE"
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
                $("#kla1680gra_leftw").remove();
                $("#kla1680gra_left")
                    .append($("<div/>", {
                        id: "kla1680gra_leftw",
                        css: {
                            overflow: "auto",
                            float: "left",
                            width: "100%"
                        }
                    }));
                var h = $(".content").height();
                var loff = $("#kla1680gra_leftw").position();
                var ot = loff.top;
                h -= ot;
                var hh = $(".header").height();
                h += hh;
                var fh = $(".footer").height();
                h -= fh - 3;
                $("#kla1680gra_leftw").height(h);
                $("#kla1680gra_leftw").hide();
                $("#kla1680grat0").remove();

                $("#kla1680gra_leftw")
                    .append($("<div/>", {
                        id: "kla1680grat0",
                        css: {
                            width: "100%"
                        }
                    }));

                if ($("#kla1680grat0").hasClass("jstree")) $("#kla1680grat0").jstree(true).destroy();
                $("#kla1680grat0").jstree({
                    "plugins": ["state"],
                    core: {
                        'check_callback': true,
                        data: filenodes
                    }
                });
                $("#kla1680gra_leftw").show();
                $('#kla1680grat0').on("select_node.jstree", function (e, data) {
                    var node = $('#kla1680grat0').jstree(true).get_node(data.node.id);
                    kla1680gra.clicknode(node, function (ret) {

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
                kla1680gra.showfiles("list", url, "", "", function (ret) {
                    return;
                });
            }
        });
    };






    kla1680gra.showclock = function (clockcontainer) {
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
    kla1680gra.showfiles = function (fileopcode, url, predirectory, directory, callback) {
        if (predirectory.length === 0) {
            predirectory = ["static", "temp"];
        }
        document.getElementById("kla1680gra").style.cursor = "progress";
        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer("getdirectoryfiles"),
            data: {
                fileopcode: fileopcode,
                url: url,
                predirectory: predirectory,
                directory: directory,
                filterextensions: ".txt,.json,.csv,.html",
                skipsubdirectories: "false",
                doKLIFILES: "true",
                doKLIRAWFILES: "false"
            }
        }).done(function (r1, textStatus, jqXHR) {
            sysbase.checkSessionLogin(r1);
            sysbase.putMessage(r1, 1);
            var ret = JSON.parse(r1);
            // Ausgabe in Map rechts
            $("#kla1680gra_leftw").remove();
            $("#kla1680gra_left")
                .append($("<div/>", {
                    id: "kla1680gra_leftw",
                    css: {
                        overflow: "auto",
                        float: "left",
                        width: "100%"
                    }
                }));
            var h = $(".content").height();
            var loff = $("#kla1680gra_leftw").position();
            var ot = loff.top;
            h -= ot;
            var hh = $(".header").height();
            h += hh;
            var fh = $(".footer").height();
            h -= fh - 3;
            $("#kla1680gra_leftw").height(h);
            $("#kla1680gra_leftw").hide();

            $(".kla1680grat0").remove();
            $("#kla1680gra_leftw")
                .append($("<div/>", {
                    id: "kla1680grat0",
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

            if ($("#kla1680grat0").hasClass("jstree")) $("#kla1680grat0").jstree(true).destroy();
            // "checkbox"
            $("#kla1680grat0").jstree({
                "plugins": ["state"],
                core: {
                    'check_callback': true,
                    data: filenodes
                }
            });

            $("#kla1680gra_leftw").show();
            document.getElementById("kla1680gra").style.cursor = "default";
            $('#kla1680grat0').on("select_node.jstree", function (e, data) {
                var node = $('#kla1680grat0').jstree(true).get_node(data.node.id);
                kla1680gra.clicknode(node, function (ret) {

                });
                //alert("node_id: " + data.node.id + " " + node.text);
            });

            /*
            $('#kla1680grat0').on("changed.jstree", function (e, data) {
                console.log("The selected nodes are:");
                console.log(data.selected);
            });
            */
        }).fail(function (err) {
            document.getElementById("kla1680gra").style.cursor = "default";
            sysbase.putMessage(err, 1);
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
    kla1680gra.addfiles = function (node, callbacka) {
        var fileopcode = "list";
        var predirectory = "";
        var directory = node.li_attr.fullname;
        document.getElementById("kla1680gra").style.cursor = "progress";
        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer("getdirectoryfiles"),
            data: {
                fileopcode: fileopcode,
                url: "",
                predirectory: predirectory,
                directory: directory,
                filterextensions: ".txt,.json,.svg,.csv",
                skipsubdirectories: "false",
                doKLIFILES: "true",
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
                        $('#kla1680grat0').jstree().create_node(node, filenode, 'last', function (newnode) {
                            console.log("zugefügt:" + newnode.text);
                            nextfile();
                        }, true);
                    } catch (err) {
                        console.log("Error:" + err);
                        console.log(err.stack);
                    }
                },
                function (err) {
                    //$("#kla1680grat0").jstree("open_all");
                    $("#kla1680grat0").jstree().open_node(node);
                    $("#kla1680gra_leftw").show();
                    document.getElementById("kla1680gra").style.cursor = "default";
                    callbacka({
                        error: false,
                        message: "geladen"
                    });
                    return;
                });
        }).fail(function (err) {
            document.getElementById("kla1680gra").style.cursor = "default";
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
    kla1680gra.clicknode = function (node, supercallback) {
        var fullname = node.li_attr.fullname;
        // dirty-flag später
        $("#kla1680graform").empty();
        if (node.li_attr.what === "directory") {
            /**
             * Verzeichnisanalyse
             */
            async.waterfall([
                    function (callbackc) {
                        if (typeof node.children !== "undefined" && node.children.length > 0) {
                            // schon aufgelöst, also anzeigen
                            $("#kla1680grat0").jstree().open_node(node);
                            callbackc(null, {
                                error: false,
                                message: "ausgegeben"
                            });
                            return;
                        } else {
                            kla1680gra.addfiles(node, function (ret) {
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
            $("#kla1680graform").empty();
            /**
             * Differenzieren der Dateitypen, Default ist Anzeige aus dem Inhalt,
             * spezielle Dateien werden abgefangen, GHCND vorgezogen
             */
            if (kla1680gra.checkfragments(fullname, "IPCC GHCN Daily stations \.txt")) {
                supercallback({
                    error: false,
                    message: "OK"
                });
                return;
            } else if (kla1680gra.checkfragments(fullname, "global \.txt")) {
                // Graphik ausgeben
                kla1680gra.paintChart(fullname, "global", function(ret) {
                    supercallback({
                        error: false,
                        message: "OK"
                    });
                    return;
                });
            } else if (kla1680gra.checkfragments(fullname, "continents \.txt")) {
                // Graphik ausgeben
                // {"NA1":{"2018":{"count":26,"plusnew":26,"minusold":0}
                kla1680gra.paintChart(fullname, "continents", function(ret) {
                    supercallback({
                        error: false,
                        message: "OK"
                    });
                    return;
                });
            } else {
                // einfache Dateianzeige, inhalt
                kla1680gra.showfilecontent(fullname, 0, 0, "#kla1680gra_rightw", function (ret) {
                    // nur bei erste Anzeige, nicht beim Blättern neue Anzeige
                    supercallback(ret);
                    return;
                });
            }
        }
    };



    /**
     * paintChart - mit chartJS wird eine Gesamtgraphik ausgegeben
     * mit Skalierung etc. (aus kla1620shm)
     */
    kla1680gra.paintChart = function (fullname, datatype, callbackg) {

        async.waterfall([
            function(callbackh1) {
                /**
                 * Holen der Daten
                 */
                var jqxhr = $.ajax({
                    method: "GET",
                    crossDomain: false,
                    url: sysbase.getServer("getfileasstring"),
                    data: {
                        fullname: fullname
                    }
                }).done(function (r1, textStatus, jqXHR) {
                    sysbase.checkSessionLogin(r1);
                    sysbase.putMessage(r1, 1);
                    var ret = JSON.parse(r1);
                    // Ausgabe in Graphik rechts
                    sysbase.putMessage(ret.message, 1);
                    var dataobject = JSON.parse(ret.filestring);
                    callbackh1(null, {
                        error: false,
                        message: "OK",
                        dataobject: dataobject
                    });
                    return;
                }).fail(function (err) {
                    document.getElementById("kla1680gra").style.cursor = "default";
                    sysbase.putMessage(err, 1);
                    callbackg({
                        error: true,
                        message: err
                    });
                    return;
                }).always(function () {
                    // nope
                });
            },
            function (ret, callbackh2) {
                /**
                 * Ausgabe der Graphik - ret.dataobject
                */
                $("#kla1680gra_right").empty();
                var h = $(".col1of2").height();
                var w = $("#kla1680gra.content").width();
                w -= $(".col1of2").position().left;
                w -= $(".col1of2").width();
                w -= 40;
                $("#kla1680gra_right")
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
                var datasets = [];  // hält die rows
                var labels = [];    // hält die col-headers = Years
                var lab;
                // bei global.txt direkt die years als keys
                var years;
                if (datatype === "global") {
                    years = Object.keys(ret.dataobject);
                    labels = years;
                    var counts = [];
                    var plusnews = [];
                    var minusolds = [];
                    for (var iyear = 0; iyear < years.length; iyear++) {
                        counts.push(ret.dataobject[years[iyear]].count);
                        plusnews.push(ret.dataobject[years[iyear]].plusnew);
                        minusolds.push(ret.dataobject[years[iyear]].minusold);
                    }
                    datasets.push({
                        label: "count",
                        backgroundColor: '#00FFFF',
                        borderColor: '#00FFFF',
                        borderWidth: 1,
                        pointRadius: 1,
                        data: counts,
                        fill: false
                    });
                    datasets.push({
                        label: "plusnew",
                        backgroundColor: '#00FFFF',
                        borderColor: '#00FFFF',
                        borderWidth: 1,
                        pointRadius: 1,
                        data: plusnews,
                        fill: false
                    });
                    datasets.push({
                        label: "minusold",
                        backgroundColor: '#00FFFF',
                        borderColor: '#00FFFF',
                        borderWidth: 1,
                        pointRadius: 1,
                        data: minusolds,
                        fill: false
                    });
                } else if (datatype === "continents") {
                    // {"NA1":{"2018":{"count":26,"plusnew":26,"minusold":0}
                    // erst feststellen aller Jahre!!!
                    var tarray = [];
                    var cons = Object.keys(ret.dataobject);
                    var oyears = {};
                    for (var icon = 0; icon < cons.length; icon++) {
                        var actcon = cons[icon];
                        var years = Object.keys(ret.dataobject[actcon]);
                        for (var iyear = 0; iyear < years.length; iyear++) {
                            var actyear = years[iyear];
                            if (typeof oyears[actyear] === "undefined") {
                                oyears[actyear] = {
                                    year: actyear
                                };
                            }
                            /*
                            tarray.push({
                                continent: actcon,
                                year: actyear,
                                count: ret.dataobject[actcon][actyear].count,
                                plusnew: ret.dataobject[actcon][actyear].plusnew,
                                minusold: ret.dataobject[actcon][actyear].minusold
                            });
                            */
                        }
                    }
                    // oyears umsortieren
                    //oyears = Object.keys(oyears).sort();
                    /*
                    oyears.sort(function (a, b) {
                        if (a.year < b.year)
                            return -1;
                        if (a.year > b.year)
                            return 1;
                        return 0;
                    });
                    */
                    years = Object.keys(oyears).sort();
                    labels = years;
                    for (var icon1 = 0; icon1 < cons.length; icon1++) {
                        var conkey = cons[icon1];
                        // Die Ausgabe erfolgt je Kontinent
                        var counts = [];
                        var plusnews = [];
                        var minusolds = [];
                        for (var iyear = 0; iyear < years.length; iyear++) {
                            if (typeof ret.dataobject[conkey][years[iyear]] === "undefined") {
                                counts.push(null);
                                plusnews.push(null);
                                minusolds.push(null);
                            } else {
                                counts.push(ret.dataobject[conkey][years[iyear]].count || null);
                                plusnews.push(ret.dataobject[conkey][years[iyear]].plusnew || null);
                                minusolds.push(ret.dataobject[conkey][years[iyear]].minusold || null);
                            }
                        }
                        datasets.push({
                            label: conkey + "_count",
                            backgroundColor: '#00FFFF',
                            borderColor: '#00FFFF',
                            borderWidth: 1,
                            pointRadius: 1,
                            data: counts,
                            fill: false
                        });
                        datasets.push({
                            label: conkey + "_plusnew",
                            backgroundColor: '#00FFFF',
                            borderColor: '#00FFFF',
                            borderWidth: 1,
                            pointRadius: 1,
                            data: plusnews,
                            fill: false
                        });
                        datasets.push({
                            label: conkey + "_minusold",
                            backgroundColor: '#00FFFF',
                            borderColor: '#00FFFF',
                            borderWidth: 1,
                            pointRadius: 1,
                            data: minusolds,
                            fill: false
                        });
                    }
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
            }
        ],
        function(error, ret) {
            callbackg({
                error: false,
                message: "fertig"
            });
        });


    };




    kla1680gra.setResizeObserver = function () {

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
                    $("#kla1680gra_entry").offset({
                        left: l2
                    });
                    $("#kla1680gra_entry").width(w2);
                    console.log("new l2:" + l2 + " w2:" + w2);
                }
            });
            if ($(".kla1680gra_rightw").length > 0) {
                resizeObserver.observe(document.querySelector(".kla1680gra_rightw"));
            }
        }
    };



    kla1680gra.showfilecontent = function (fullname, fromline, frombyte, target, callbackf) {
        if (typeof target === "undefined" || target.length === 0) {
            target = "#kla1680gra_rightw";
        }
        if (typeof target === "undefined" || target.length === 0) {
            target = "#kla1680gra_rightw";
            $("#kla1680gra_right")
                .append($("<div/>", {
                    id: "kla1680gra_rightw",
                    class: "kla1680gra_rightw",
                    css: {
                        resize: "horizontal",
                        overflow: "auto",
                        float: "left",
                        width: "100%"
                    }
                }));
        }
        document.getElementById("kla1680gra").style.cursor = "progress";
        // file - rechts anzeigen
        if ($(target).length === 0) {
            $("#kla1680gra_right")
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
        kla1680gra.setResizeObserver();
        $(target).height($("#kla1680gra_right").height() - $(target).position().top - 3);
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
                kla1680gra.setResizeObserver();
                document.getElementById("kla1680gra").style.cursor = "default";
                callbackf();
                return;
            }).fail(function (err) {
                document.getElementById("kla1680gra").style.cursor = "default";
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
                kla1680gra.setResizeObserver();
                document.getElementById("kla1680gra").style.cursor = "default";
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
                                kla1680gra.showfilecontent(fullname, fromline, frombyte, target, function (ret) {

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

                                kla1680gra.showfilecontent(fullname, fromline, frombyte, target, function (ret) {

                                });

                            }
                        }));
                }
                callbackf();
                return;


            }).fail(function (err) {
                document.getElementById("kla1680gra").style.cursor = "default";
                sysbase.putMessage(err, 1);
                callbackf();
                return;
            }).always(function () {
                // nope
            });
        }
    };



    /**
     * Prüfen teststring, ob alle Fragemente in fragments enthalten sind
     * blank-separierte fragmente
     * return true oder false
     */
    kla1680gra.checkfragments = function (teststring, fragments) {
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
        module.exports = kla1680gra;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1680gra;
        });
    } else {
        // included directly via <script> tag
        root.kla1680gra = kla1680gra;
    }
}());