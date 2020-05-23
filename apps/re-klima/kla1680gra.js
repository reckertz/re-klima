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
                                var datum = prompt("ISO-Datum eingeben", "2020-02-17");
                                if (datum != null) {
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
                                var parameters = {};
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
            class: "col1of3",
            css: {
                width: "30%",
                "background-color": "lightsteelblue"

            }
        }));

        $(".content").append($("<div/>", {
            id: "kla1680gra_right",
            class: "col2of3",
            css: {
                width: "35%",
                "background-color": "yellow"
            }
        }));

        $(".content").append($("<div/>", {
                id: "kla1680gra_entry",
                class: "col3of3",
                css: {
                    width: "35%",
                    "background-color": "lime",
                    overflow: "auto"
                }
            })
            .append($("<form/>", {
                id: "kla1680graform",
                class: "uieform"
            }))
        );

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
        $("#kla1680gra_entry").height(h);

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
                                if ($("#kla1680grat0").hasClass("jstree")) $("#kla1680grat0").jstree(true).destroy();
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
                        selyears = navigatebucket.oldparameters[0].selyears;
                        fullname = navigatebucket.oldparameters[0].fullname;
                        aktfullname = fullname;
                        var node = {
                            li_attr: {
                                fullname: fullname,
                                what: "file"
                            }
                        };
                        kla1680gra.clicknode(node, function (ret) {
                            $("#kla1680grab4").click();
                        });
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




    /**
     * kla1680gra.prepselection - Dialog ausgeben etc.
     * selyears ist die Default-Initialisierung,
     * fullname ist gegeben aus dem Treeview
     */
    kla1680gra.selData = function (pivotopcode, selyears, fullname, callbacksel) {
        aktfullname = fullname;

        if ($("#kla1680gra_rightw").length === 0) {
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
        $("#kla1680gra_rightw").empty();
        $("#kla1680gra_rightw").height($("#kla1680gra_left").height());
        $("#kla1680gra_rightw")
            .append($("<form/>", {
                id: "kla1680gra" + "form1",
                class: "uieform"
            }));
        uientry.getSchemaUI("kla1680gra", selschema, "kla1680gra", "kla1680gra" + "form1", function (ret) {
            if (ret.error === false) {
                //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                var selrecord = {
                    years: selyears
                };
                uientry.fromRecord2UI("#kla1680graform1", selrecord, selschema);
                // <button
                $("#kla1680gra_rightw")
                    .append($("<br/>"))
                    .append($("<div/>", {
                            id: "kla1680gra_rightwbutts",
                            width: "100%"
                        })
                        .append($("<button/>", {
                            html: "Rohdaten anzeigen",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var target = "";
                                if ($("#kla1680gra_rightw").length === 0) {
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
                                $("#kla1680gra_rightwdata").empty();
                                $("#kla1680gra_rightw")
                                    .append($("<div/>", {
                                        id: "kla1680gra_rightwdata",
                                        width: "98%"
                                    }));
                                kla1680gra.showfilecontent(aktfullname, 0, 0, "#kla1680gra_rightwdata", function (ret) {
                                    // nur bei erste Anzeige, nicht beim Blättern neue Anzeige
                                });
                            }
                        }))

                        .append($("<button/>", {
                            html: "Breitengrade bereitstellen",
                            id: "kla1680grab4",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                $("#kla1680grab4").prop("disabled", true);
                                var target = "";
                                if ($("#kla1680gra_rightw").length === 0) {
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
                                $("#kla1680gra_rightwdata").empty();
                                $("#kla1680gra_rightw")
                                    .append($("<div/>", {
                                        id: "kla1680gra_rightwdata",
                                        width: "98%"
                                    }));
                                var ghcnclock = kla1680gra.showclock("#kla1680gra_rightwdata");
                                var selrecord = {};
                                selrecord = uientry.fromUI2Record("#kla1680graform1", selrecord, selschema);
                                var apiname;
                                if (kla1680gra.checkfragments(fullname, "IPCC GHCNM v3 .dat")) {
                                    apiname = "ghcndat2latitudes";
                                } else if (kla1680gra.checkfragments(fullname, "IPCC GHCNM v4 .dat")) {
                                    apiname = "ghcndat2latitudes";
                                } else if (kla1680gra.checkfragments(fullname, "crutem4 asof .dat")) {
                                    apiname = "crutem42latitudes";
                                } else if (kla1680gra.checkfragments(fullname, "ECA .zip")) {
                                    apiname = "ecad2latitudes";
                                } else {
                                    return;
                                }
                                var jqxhr = $.ajax({
                                    method: "GET",
                                    crossDomain: false,
                                    url: sysbase.getServer(apiname),
                                    data: {
                                        forcedata: forcedata,
                                        fullname: fullname,
                                        timeout: 10 * 60 * 1000,
                                        pivotopcode: pivotopcode,
                                        selyears: selrecord.seldata.years
                                    }
                                }).done(function (r1, textStatus, jqXHR) {
                                    clearInterval(ghcnclock);
                                    $("#kla1680grab4").prop("disabled", false);
                                    forcedata = "false";
                                    // $("#kla1680gra_rightw").empty();
                                    sysbase.checkSessionLogin(r1);
                                    var ret = JSON.parse(r1);
                                    sysbase.putMessage(ret.message, 1);
                                    yearlats = ret.yearlats;
                                    var datafilename = ret.datafilename;
                                    fulldatafilename = ret.fulldatafilename;
                                    $("#kla1680gra_rightwdata")
                                        .append($("<span/>", {
                                            html: "Bereitstellung ist erfolgt in:<br>" + datafilename
                                        }))
                                        .append($("<br>"))
                                        .append($("<br>"))
                                        .append($("<span/>", {
                                            html: yearlats
                                        }));

                                    document.getElementById("kla1680gra").style.cursor = "default";
                                    /*
                                    localStorage.removeItem("yearlats");
                                    // crosswindow = window.open("klipivot.html", wname);
                                    localStorage.setItem("yearlats", JSON.stringify(yearlats));
                                    */

                                    /**
                                     * Aufbau Buttons für die Verarbeitung
                                     */
                                    $("#kla1680gra_rightwoper").empty();
                                    $("#kla1680gra_rightwdata")
                                        .append($("<div/>", {
                                            id: "kla1680gra_rightwoper"
                                        }));
                                    $("#kla1680gra_rightwoper")
                                        .append($("<button/>", {
                                            html: "Pivottabelle",
                                            css: {
                                                margin: "10px"
                                            },
                                            click: function (evt) {
                                                evt.preventDefault();
                                                window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                                var idc20 = window.parent.sysbase.tabcreateiframe("Pivot", "", "re-klima", "kli1500piv");
                                                window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                                            }
                                        }))
                                        .append($("<button/>", {
                                            html: "Randstatistik",
                                            css: {
                                                margin: "10px"
                                            },
                                            click: function (evt) {
                                                evt.preventDefault();
                                                window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                                /*
                                                sysbase.navigateTo("kli1520sta", [], function (ret) {
                                                    if (ret.error === true) {
                                                        alert(ret.message);
                                                    }
                                                });
                                                */
                                                var idc20 = window.parent.sysbase.tabcreateiframe("Randstatistik", "", "re-klima", "kli1520sta");
                                                window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                                            }
                                        }))
                                        .append($("<button/>", {
                                            html: "Heatmap",
                                            css: {
                                                margin: "10px"
                                            },
                                            click: function (evt) {
                                                evt.preventDefault();
                                                window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                                                var seldata = {
                                                    fullname: fullname,
                                                    selyears: selrecord.seldata.years
                                                };
                                                window.parent.sysbase.setCache("seldata", JSON.stringify(seldata));
                                                var idc20 = window.parent.sysbase.tabcreateiframe("Heatmap", "", "re-klima", "kli1540map", "kliheatmap.html");
                                                window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                                            }
                                        }));
                                    return;
                                }).fail(function (err) {
                                    clearInterval(ghcnclock);
                                    $("#kla1680grab4").prop("disabled", false);
                                    forcedata = "false";
                                    $("#kla1680gra_rightwdata").empty();
                                    document.getElementById("kla1680gra").style.cursor = "default";
                                    sysbase.putMessage(err, 1);
                                    return;
                                }).always(function () {
                                    // nope
                                });
                            }
                        }))
                        /**
                         * Daten komplett übernehmen
                         */
                        .append($("<button/>", {
                            html: "Daten komplett übernehmen",
                            id: "kla1680grab5",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                /**
                                 * Popup Prompt zur Bestätigung der kompletten Übernahme
                                 * kla1680grafullname -  $("#kla1680grafullname").text();
                                 */
                                var username = uihelper.getUsername();
                                var popschema = {
                                    entryschema: {
                                        refname: {
                                            title: "Übernahmedatei",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uietext",
                                            default: "",
                                            width: "100px",
                                            io: "i"
                                        },
                                        stationfilter: {
                                            title: "Prefix-Filter stationid",
                                            type: "string", // currency, integer, datum, text, key
                                            class: "uietext",
                                            default: "",
                                            width: "100px",
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
                                };
                                var poprecord = {};
                                poprecord.refname = $("#kla1680grafullname").text();
                                var anchorHash = "#kla1680gra_rightw";
                                var title = "Daten komplett übernehmen";
                                var pos = {
                                    left: $("#kla1680gra_rightw").offset().left,
                                    top: screen.height / 2
                                };
                                //Math.ceil($(this).offset().top + $(this).height() + 20)
                                $(document).on('popupok', function (evt, extraParam) {
                                    evt.preventDefault();
                                    evt.stopPropagation();
                                    evt.stopImmediatePropagation();
                                    kla1680gra.loadghcnall($("#kla1680grafullname").text(), extraParam);
                                });

                                uientry.inputDialogX(anchorHash, pos, title, popschema, poprecord, function (ret) {
                                    if (ret.error === false) {
                                        // outrec.isactive = "false"; // true oder false wenn gelöscht
                                    } else {
                                        sysbase.putMessage("Stationen werden nicht komplett übernommen", 1);
                                        callback1({
                                            error: false,
                                            message: "finished"
                                        });
                                        return;
                                    }
                                });
                            }
                        }))
                        /**
                         * Datenkontrolle
                         */
                        .append($("<button/>", {
                            html: "Datenkontrolle",
                            id: "kla1680grab6a",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var actvariablename = "";
                                if (kla1680gra.checkfragments(fullname, "IPCC GHCNM v3 .dat")) {
                                    aktsource = "GHCN";
                                    actvariablename = "tavg";
                                } else if (kla1680gra.checkfragments(fullname, "IPCC GHCNM v4 .dat")) {
                                    aktsource = "GHCN4";
                                    actvariablename = "tavg";
                                } else if (kla1680gra.checkfragments(fullname, "crutem4 asof .dat")) {
                                    aktsource = "CRUTEM4";
                                    actvariablename = "tavg";
                                } else if (kla1680gra.checkfragments(fullname, "ECA .zip")) {
                                    aktsource = "ECAD";
                                    actvariablename = "tmax";
                                } else {
                                    return;
                                }
                                var selstations = {
                                    fullname: aktfullname,
                                    source: aktsource,
                                    actvariablename: actvariablename
                                };

                                var table = "KLISTATIONS";
                                var api = "getaggregaterecords";

                                var options = [{
                                    $group: {
                                        "_id": {
                                            "source": "$source",
                                            "hasTMAX": {
                                                "$gt": [{
                                                    "$ifNull": ["$tmax", ""]
                                                }, ""]
                                            },
                                            "hasTMIN": {
                                                "$gt": [{
                                                    "$ifNull": ["$tmin", ""]
                                                }, ""]
                                            },
                                            "hasTAVG": {
                                                "$gt": [{
                                                    "$ifNull": ["$tavg", ""]
                                                }, ""]
                                            }
                                        },
                                        "count": {
                                            "$sum": 1
                                        }
                                    }
                                }];
                                uihelper.getAggregateRecords(options, api, table, function (ret) {
                                    if (ret.error === true) {
                                        sysbase.putMessage(ret.message, 3);
                                        return;
                                    } else if (typeof ret.records === "undefined" || ret.records === null) {
                                        sysbase.putMessage("Keine Daten gefunden", 3);
                                        return;
                                    } else {
                                        console.log(JSON.stringify(ret.records));
                                        var html = JSON.stringify(ret.records, null, "");
                                        $("#kla1680gra_rightw1").remove();
                                        var htmltable = "";
                                        // "0":{"_id":{"source":"ECAD","hasTMAX":true,"hasTMIN":false,"hasTAVG":false},"count":10050},
                                        var staformat = {
                                            source: {
                                                title: "Datenquelle",
                                                width: "20%",
                                                align: "center"
                                            },
                                            TMAX: {
                                                title: "hat TMAX",
                                                width: "15%",
                                                align: "center"
                                            },
                                            TMIN: {
                                                title: "hat TMIN",
                                                width: "15%",
                                                align: "center"
                                            },
                                            TAVG: {
                                                title: "hat TAVG",
                                                width: "15%",
                                                align: "center"
                                            },
                                            count: {
                                                title: "Anzahl",
                                                width: "20%",
                                                align: "right"
                                            }
                                        };
                                        // for (irec = 0; irec < ret.records.length; irec++) {
                                        var irec = 0;
                                        for (property in ret.records) {
                                            if (ret.records.hasOwnProperty(property)) {
                                                var record = ret.records[property];
                                                irec++;
                                                var rowid = record._id;
                                                var starec = {
                                                    source: record._id.source,
                                                    TMAX: record._id.hasTMAX,
                                                    TMIN: record._id.hasTMIN,
                                                    TAVG: record._id.hasTAVG,
                                                    count: record.count
                                                };
                                                var line = uihelper.transformJSON2TableTR(starec, irec - 1, staformat, "", "tablesorter-ignoreRow");
                                                htmltable += line;
                                            }
                                        }
                                        htmltable += "</body>";
                                        htmltable += "</table>";
                                        $("#kla1680gra_rightw")
                                            .append($("<div/>", {
                                                    id: "kla1680gra_rightw1"
                                                })
                                                .append($("<table/>", {
                                                    id: "kla1680grat5",
                                                    class: "tablesorter", // wichtig
                                                    width: "95%",
                                                    border: "2",
                                                    rules: "all",
                                                    css: {
                                                        layout: "fixed"
                                                    },
                                                    html: htmltable
                                                }))
                                            );
                                        $(".tablesorter").tablesorter({
                                            theme: "blue",
                                            widgets: ['filter'],
                                            widthFixed: true,
                                            widgetOptions: {
                                                filter_hideFilters: false,
                                                filter_ignoreCase: true
                                            }
                                        });
                                    }

                                });

                            }
                        }))
                        /**
                         * Stationen analysieren mit Heatmaps
                         */
                        .append($("<button/>", {
                            html: "Stationen analysieren",
                            id: "kla1680grab6",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var actvariablename = "";
                                if (kla1680gra.checkfragments(fullname, "IPCC GHCN Daily stations \.txt")) {
                                    aktsource = "GHCND";
                                    actvariablename = "TMAX";
                                } else if (kla1680gra.checkfragments(fullname, "IPCC GHCNM v3 .dat")) {
                                    aktsource = "GHCN";
                                    actvariablename = "tavg";
                                } else if (kla1680gra.checkfragments(fullname, "IPCC GHCNM v4 .dat")) {
                                    aktsource = "GHCN4";
                                    actvariablename = "tavg";
                                } else if (kla1680gra.checkfragments(fullname, "crutem4 asof .dat")) {
                                    aktsource = "CRUTEM4";
                                    actvariablename = "tavg";
                                } else if (kla1680gra.checkfragments(fullname, "ECA .zip")) {
                                    aktsource = "ECAD";
                                    actvariablename = "tmax";
                                } else {
                                    return;
                                }
                                var selstations = {
                                    fullname: aktfullname,
                                    source: aktsource,
                                    actvariablename: actvariablename
                                };
                                window.parent.sysbase.setCache("selstations", selstations);
                                var tourl = "inframe.html" + "?" + "source=" + aktsource + "&variablename=" + actvariablename;
                                tourl += "&fullname=" + aktfullname;
                                var idc20 = window.parent.sysbase.tabcreateiframe("Stations", "", "re-klima", "kla1610sta", tourl);
                                window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                            }
                        }))


                        /**
                         * Stationen korrigieren
                         */
                        .append($("<button/>", {
                            html: "Stationen korrigieren",
                            id: "kla1680grab7",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                var jqxhr = $.ajax({
                                    method: "GET",
                                    crossDomain: false,
                                    url: sysbase.getServer("dropcolumn3"),
                                    data: {
                                        timeout: 70 * 60 * 1000,
                                        tablename: "KLISTATIONS",
                                        columnnames: "anzyears,realyears,fromyear,toyear",
                                        keys: "source,stationid"
                                    }
                                }).done(function (r1, textStatus, jqXHR) {
                                    //sysbase.checkSessionLogin(r1);
                                    var ret = JSON.parse(r1);
                                    sysbase.putMessage(ret.message, 1);
                                    return;
                                }).fail(function (err) {
                                    sysbase.putMessage("ERROR:" + err, 3);
                                    return;
                                }).always(function () {
                                    // nope
                                });
                            }
                        }))
                    );

                if (kla1680gra.checkfragments(fullname, "ECA .zip")) {
                    /**
                     * Datenkonvertierung SQLite3
                     */
                    $("#kla1680gra_rightwbutts")
                        .append($("<button/>", {
                            html: "Datenkonvertierung SQLite3",
                            id: "kla1680grab6b",
                            css: {
                                margin: "10px"
                            },
                            click: function (evt) {
                                evt.preventDefault();
                                evt.stopPropagation();
                                evt.stopImmediatePropagation();
                                var selrecord = {
                                    years: selyears
                                };
                                uientry.fromRecord2UI("#kla1680graform1", selrecord, selschema);
                                var ghcnclock = kla1680gra.showclock("#kla1680gra_rightwdata");
                                var apiname = "convecad2sql";
                                try {
                                    var jqxhr = $.ajax({
                                        method: "GET",
                                        crossDomain: false,
                                        url: sysbase.getServer(apiname),
                                        data: {
                                            forcedata: forcedata,
                                            fullname: fullname,
                                            timeout: 70 * 60 * 1000,
                                            source: "ECAD"
                                            /*
                                            selyears: selrecord.seldata.years,
                                            minyears: selrecord.seldata.minyears
                                            */
                                        }
                                    }).done(function (r1, textStatus, jqXHR) {
                                        clearInterval(ghcnclock);
                                        $("#kla1680grab4").prop("disabled", false);
                                        $("#kla1680grab5").prop("disabled", false);
                                        $("#kla1680gra_rightw1").remove();
                                        sysbase.checkSessionLogin(r1);
                                        var ret = JSON.parse(r1);
                                        sysbase.putMessage(ret.message, 1);
                                        var html = ret.html;
                                        $("#kla1680gra_rightw1").html(html);
                                    }).fail(function (err) {
                                        clearInterval(ghcnclock);
                                        $("#kla1680grab4").prop("disabled", false);
                                        forcedata = "false";
                                        $("#kla1680gra_rightwdata").empty();
                                        document.getElementById("kla1680gra").style.cursor = "default";
                                        sysbase.putMessage("ERROR:" + err, 3);
                                        return;
                                    }).always(function () {
                                        // nope
                                    });


                                } catch (err) {
                                    clearInterval(ghcnclock);
                                    document.getElementById("kla1680gra").style.cursor = "default";
                                    sysbase.putMessage("ERROR:" + err, 3);
                                    console.log(err);
                                    console.log(err.stack);
                                    return;
                                }
                            }
                        }));
                }







                callbacksel({
                    error: false,
                    message: "aufgebaut"
                });
            } else {
                callbacksel({
                    error: true,
                    message: ret.message
                });
                return;
            }
        });
    };

    /**
     * loadghcnall - GHCN-Daily nur stations laden
     */
    kla1680gra.loadghcnall = function (fullname, extraParam) {
        $("#kla1680grab4").prop("disabled", true);
        $("#kla1680grab5").prop("disabled", true);
        var target = "";
        if ($("#kla1680gra_rightw").length === 0) {
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
        $("#kla1680gra_rightwdata").empty();
        $("#kla1680gra_rightw")
            .append($("<div/>", {
                id: "kla1680gra_rightwdata",
                width: "98%"
            }));
        var ghcnclock = kla1680gra.showclock("#kla1680gra_rightwdata");
        var selrecord = {};
        selrecord = uientry.fromUI2Record("#kla1680graform1", selrecord, selschema);
        var apiname;
        var source;
        if (kla1680gra.checkfragments(fullname, "IPCC GHCN Daily stations .txt")) {
            apiname = "ghcndcomplete";
            source = "GHCND";
        } else {
            return;
        }
        try {
            var jqxhr = $.ajax({
                method: "GET",
                crossDomain: false,
                url: sysbase.getServer(apiname),
                data: {
                    forcedata: forcedata,
                    fullname: fullname,
                    timeout: 70 * 60 * 1000,
                    source: source,
                    selyears: selrecord.seldata.years,
                    extraParam: extraParam
                }
            }).done(function (r1, textStatus, jqXHR) {
                clearInterval(ghcnclock);
                $("#kla1680grab4").prop("disabled", false);
                $("#kla1680grab5").prop("disabled", false);
                forcedata = "false";
                // $("#kla1680gra_rightw").empty();
                sysbase.checkSessionLogin(r1);
                var ret = JSON.parse(r1);
                sysbase.putMessage(ret.message, 1);
                yearlats = ret.yearlats;
                var datafilename = ret.datafilename;
                fulldatafilename = ret.fulldatafilename;
                $("#kla1680gra_rightwdata")
                    .append($("<span/>", {
                        html: "Bereitstellung ist erfolgt in:<br>" + datafilename
                    }))
                    .append($("<br>"))
                    .append($("<br>"))
                    .append($("<span/>", {
                        html: yearlats
                    }));
                document.getElementById("kla1680gra").style.cursor = "default";
                /**
                 * Aufbau Buttons für die Verarbeitung
                 */
                $("#kla1680gra_rightwoper").empty();
                $("#kla1680gra_rightwdata")
                    .append($("<div/>", {
                        id: "kla1680gra_rightwoper"
                    }));
                $("#kla1680gra_rightwoper")
                    .append($("<button/>", {
                        html: "Pivottabelle",
                        css: {
                            margin: "10px"
                        },
                        click: function (evt) {
                            evt.preventDefault();
                            window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                            var idc20 = window.parent.sysbase.tabcreateiframe("Pivot", "", "re-klima", "kli1500piv");
                            window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                        }
                    }))
                    .append($("<button/>", {
                        html: "Randstatistik",
                        css: {
                            margin: "10px"
                        },
                        click: function (evt) {
                            evt.preventDefault();
                            window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                            /*
                            sysbase.navigateTo("kli1520sta", [], function (ret) {
                                if (ret.error === true) {
                                    alert(ret.message);
                                }
                            });
                            */
                            var idc20 = window.parent.sysbase.tabcreateiframe("Randstatistik", "", "re-klima", "kli1520sta");
                            window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                        }
                    }))
                    .append($("<button/>", {
                        html: "Heatmap",
                        css: {
                            margin: "10px"
                        },
                        click: function (evt) {
                            evt.preventDefault();
                            window.parent.sysbase.setCache("yearlats", JSON.stringify(yearlats));
                            var seldata = {
                                fullname: fullname,
                                selyears: selrecord.seldata.years
                            };
                            window.parent.sysbase.setCache("seldata", JSON.stringify(seldata));
                            var idc20 = window.parent.sysbase.tabcreateiframe("Heatmap", "", "re-klima", "kli1540map", "kliheatmap.html");
                            window.parent.$(".tablinks[idhash='#" + idc20 + "']").click();
                        }
                    }));
                return;
            }).fail(function (err) {
                clearInterval(ghcnclock);
                $("#kla1680grab4").prop("disabled", false);
                forcedata = "false";
                $("#kla1680gra_rightwdata").empty();
                document.getElementById("kla1680gra").style.cursor = "default";
                sysbase.putMessage("ERROR:" + err, 3);
                return;
            }).always(function () {
                // nope
            });
        } catch (err) {
            clearInterval(ghcnclock);
            $("#kla1680grab4").prop("disabled", false);
            forcedata = "false";
            $("#kla1680gra_rightwdata").empty();
            document.getElementById("kla1680gra").style.cursor = "default";
            sysbase.putMessage(err, 1);
            return;
        }
    }




    /**
     * getPivotData mit pivotopcode für Variationen der Daten
     */
    kla1680gra.getPivotData = function (pivotopcode, selyears, fullname, callbackpiv) {
        document.getElementById("kla1680gra").style.cursor = "progress";
        // Ausgabe in Map rechts
        $("#kla1680gra_rightw").empty();
        $("#kla1680gra_rightw").height($("#kla1680gra_left").height());
        var ghcnclock = kla1680gra.showclock("#kla1680gra_rightw");

        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer("ghcndat2latitudes"),
            data: {
                fullname: fullname,
                timeout: 10 * 60 * 1000,
                pivotopcode: pivotopcode,
                selyears: selyears
            }
        }).done(function (r1, textStatus, jqXHR) {
            clearInterval(ghcnclock);
            // $("#kla1680gra_rightw").empty();
            sysbase.checkSessionLogin(r1);
            var ret = JSON.parse(r1);
            sysbase.putMessage(ret.message, 1);
            var tarray = [];
            /*
            for (var lat in ret.latprofile) {
                if (ret.latprofile.hasOwnProperty(lat)) {
                    tarray.push({
                        lats: lat,
                        latprofile: ret.latprofile[lat]
                    });
                }
            }
            tarray.sort(function (a, b) {
                if (a.lats < b.lats)
                    return -1;
                if (a.lats > b.lats)
                    return 1;
                return 0;
            });
            */
            for (var year in ret.yearlats) {
                if (ret.yearlats.hasOwnProperty(year)) {
                    for (var lats in ret.yearlats[year]) {
                        if (ret.yearlats[year].hasOwnProperty(lats)) {
                            tarray.push({
                                year: year,
                                lats: lats,
                                stations: ret.yearlats[year][lats].stations,
                                months: ret.yearlats[year][lats].months /* mit tmax, tmin */
                            });
                        }
                    }

                }
            }
            yearlats = ret.yearlats;
            tarray.sort(function (a, b) {
                if (a.year < b.year)
                    return -1;
                if (a.year > b.year)
                    return 1;
                if (a.lats < b.lats)
                    return -1;
                if (a.lats > b.lats)
                    return 1;
                return 0;
            });
            var lstring = $.map(tarray, function (obj) {
                return JSON.stringify(obj, null, " ");
            }).join('<br>');
            $("#kla1680gra_rightw")
                .append($("<br/>"))
                .append($("<button/>", {
                    html: "Pivottabelle",
                    click: function (evt) {
                        evt.preventDefault();
                        if (!window.localStorage) {
                            alert("Kein localStorage, Pivot nicht möglich");
                            return;
                        }
                        var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
                        localStorage.removeItem("pivotdata");
                        localStorage.removeItem("yearlats");
                        // NEU pivotdata kompatibel aufbauen:
                        pivotdata = [];
                        pivotdata.push([
                            "lats",
                            "year",
                            "month",
                            "tmax",
                            "tmin"
                        ]);
                        for (var ita = 0; ita < tarray.length; ita++) {
                            var latdata = tarray[ita];
                            var otab = [];
                            var lats = latdata.lats;
                            var year = latdata.year;
                            var monthdata = latdata.months;
                            for (var mon in monthdata) {
                                if (monthdata.hasOwnProperty(mon)) {
                                    pivotdata.push([
                                        lats,
                                        year,
                                        mon,
                                        monthdata[mon].tmax,
                                        monthdata[mon].tmin
                                    ]);
                                }
                            }
                        }
                        crosswindow = window.open("klipivot.html", wname);
                        localStorage.setItem("pivotdata", JSON.stringify(pivotdata));
                        localStorage.setItem("yearlats", JSON.stringify(yearlats));
                    }
                }));
            var html = "";
            html += "<br>";
            html += lstring; // uihelper.iterateJSON2pretty(ret.latprofile, "", "");
            $("#kla1680gra_rightw")
                .append($("<span/>", {
                    html: html
                }));
            document.getElementById("kla1680gra").style.cursor = "default";
            callbackpiv({
                error: false,
                message: "Daten bereitgestellt"
            });
            return;
        }).fail(function (err) {
            clearInterval(ghcnclock);
            $("#kla1680gra_rightw").empty();
            document.getElementById("kla1680gra").style.cursor = "default";
            sysbase.putMessage(err, 1);
            callbackpiv({
                error: true,
                message: "Daten NICHT bereitgestellt:" + err
            });
            return;
        }).always(function () {
            // nope
        });
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
                    },
                    function (ret, callbackc) {
                        uientry.getSchemaUI("kla1680gra", klischema, "kla1680gra", "kla1680gra" + "form", function (ret) {
                            if (ret.error === false) {
                                //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                                console.log("kla1680gra" + " aufgebaut", 0);
                                // Initialisierung des UI
                                klirecord = {};
                                // den Satz holen zum Editieren
                                var sel = {
                                    fullname: fullname
                                };
                                var projection = {
                                    history: 0
                                };
                                var api = "getonerecord";
                                var table = "KLIRAWFILES";
                                uihelper.getOneRecord(sel, projection, api, table, function (ret) {
                                    if (ret.error === false && ret.record !== null) {
                                        klirecord = ret.record;
                                        uientry.fromRecord2UI("#kla1680graform", klirecord, klischema);
                                        $("#kla1680graform")
                                            .append($("<div/>", {
                                                    css: {
                                                        "text-align": "center",
                                                        width: "100%"
                                                    }
                                                })
                                                .append($("<button/>", {
                                                    class: "kla1680graActionSave",
                                                    css: {
                                                        "margin-left": "10px"
                                                    },
                                                    html: "Speichern",
                                                }))
                                            );
                                    }
                                    $("#kla1680graselections").attr("rules", "all");
                                    $("#kla1680graselections").css({
                                        border: "1px solid black",
                                        margin: "10px"
                                    });
                                    $("#kla1680graselections tbody tr:nth-child(2)").hide();
                                    callbackc(null, {
                                        error: false,
                                        message: "erledigt"
                                    });
                                    return;
                                });
                            } else {
                                //sysbase.putMessage("kli1020evt" + " NICHT aufgebaut", 3);
                                console.log("kla1680gra" + " NICHT aufgebaut", 3);
                                callbackc(null, {
                                    error: false,
                                    message: "erledigt"
                                });
                                return;
                            }
                        });
                    },
                    function (ret, callbackc) {
                        if (kla1680gra.checkfragments(fullname, "G:  Projekte  klimadaten  HYDE_lu_pop_proxy  baseline  asc")) {
                            // Ausgabe Mittelbereich für die dedizierte Verarbeitung
                            kla1680gra.puthydeform(fullname, function (ret) {
                                callbackc(null, {
                                    error: false,
                                    message: "erledigt"
                                });
                                return;
                            });
                        } else {
                            callbackc(null, {
                                error: false,
                                message: "erledigt"
                            });
                            return;
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
                kla1680gra.ghcndstations("GHCND", "", fullname, function (ret) {

                });
            } else {
                // einfache Dateianzeige, inhalt
                kla1680gra.showfilecontent(fullname, 0, 0, "#kla1680gra_rightw", function (ret) {
                    // nur bei erste Anzeige, nicht beim Blättern neue Anzeige
                    uientry.getSchemaUI("kla1680gra", klischema, "kla1680gra", "kla1680gra" + "form", function (ret) {
                        if (ret.error === false) {
                            //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                            console.log("kla1680gra" + " aufgebaut", 0);
                            // Initialisierung des UI
                            klirecord = {};
                            // den Satz holen zum Editieren
                            var sel = {
                                fullname: fullname
                            };
                            var projection = {
                                history: 0
                            };
                            var api = "getonerecord";
                            var table = "KLIRAWFILES";
                            uihelper.getOneRecord(sel, projection, api, table, function (ret) {
                                if (ret.error === false && ret.record !== null) {
                                    klirecord = ret.record;
                                    uientry.fromRecord2UI("#kla1680graform", klirecord, klischema);
                                    $("#kla1680graform")
                                        .append($("<div/>", {
                                                css: {
                                                    "text-align": "center",
                                                    width: "100%"
                                                }
                                            })
                                            .append($("<button/>", {
                                                class: "kla1680graActionSave",
                                                css: {
                                                    "margin-left": "10px"
                                                },
                                                html: "Speichern",
                                            }))
                                            .append($("<button/>", {
                                                class: "kla1680graActionLoad",
                                                css: {
                                                    "margin-left": "10px"
                                                },
                                                html: "Laden Datei",
                                                click: function (evt) {
                                                    evt.preventDefault();
                                                    document.getElementById("kla1680gra").style.cursor = "progress";
                                                    $(".kla1680graActionLoad").prop('disabled', true);
                                                    // Ausgabe in Map rechts
                                                    $("#kla1680gra_rightw").empty();
                                                    $("#kla1680gra_rightw").height($("#kla1680gra_left").height());
                                                    var ghcnclock = kla1680gra.showclock("#kla1680gra_rightw");
                                                    var klirecord = uientry.fromUI2Record("#kla1680gra", klirecord, klischema);
                                                    if (kla1680gra.checkfragments(fullname, "IPCC GHCN Daily inventory \.txt")) {
                                                        aktsource = "GHCND";
                                                        var jqxhr = $.ajax({
                                                            method: "GET",
                                                            crossDomain: false,
                                                            url: sysbase.getServer("ghcndinventory"),
                                                            data: {
                                                                fullname: fullname,
                                                                targettable: klirecord.metadata.targettable,
                                                                primarykey: klirecord.metadata.primarykey,
                                                                separator: klirecord.metadata.separator,
                                                                timeout: 10 * 60 * 1000
                                                            }
                                                        }).done(function (r1, textStatus, jqXHR) {
                                                            clearInterval(ghcnclock);
                                                            document.getElementById("kla1680gra").style.cursor = "default";
                                                            $(".kla1680graActionLoad").prop('disabled', false);
                                                            $("#kla1680gra_rightw").empty();
                                                            sysbase.checkSessionLogin(r1);
                                                            var ret = JSON.parse(r1);
                                                            sysbase.putMessage(ret.message, 1);
                                                            return;
                                                        }).fail(function (err) {
                                                            clearInterval(ghcnclock);
                                                            $("#kla1680gra_rightw").empty();
                                                            document.getElementById("kla1680gra").style.cursor = "default";
                                                            $(".kla1680graActionLoad").prop('disabled', false);
                                                            sysbase.putMessage(err, 1);
                                                            return;
                                                        }).always(function () {
                                                            // nope
                                                        });
                                                    } else {
                                                        $(".kla1680graActionLoad").prop('disabled', true);
                                                        var jqxhr = $.ajax({
                                                            method: "POST",
                                                            crossDomain: false,
                                                            url: sysbase.getServer("loadcsvdata"),
                                                            data: {
                                                                fullname: fullname,
                                                                filetype: klirecord.metadata.filetype,
                                                                targettable: klirecord.metadata.targettable,
                                                                primarykey: klirecord.metadata.primarykey,
                                                                separator: klirecord.metadata.separator,
                                                                timeout: 10 * 60 * 1000
                                                            }
                                                        }).done(function (r1, textStatus, jqXHR) {
                                                            clearInterval(ghcnclock);
                                                            document.getElementById("kla1680gra").style.cursor = "default";
                                                            $(".kla1680graActionLoad").prop('disabled', false);
                                                            $("#kla1680gra_rightw").empty();
                                                            sysbase.checkSessionLogin(r1);
                                                            var ret = JSON.parse(r1);
                                                            sysbase.putMessage(ret.message, 1);
                                                        }).fail(function (err) {
                                                            clearInterval(ghcnclock);
                                                            $("#kla1680gra_rightw").empty();
                                                            document.getElementById("kla1680gra").style.cursor = "default";
                                                            $(".kla1680graActionLoad").prop('disabled', false);
                                                            sysbase.putMessage(err, 1);
                                                            return;
                                                        }).always(function () {
                                                            // nope
                                                        });
                                                    }
                                                }
                                            }))

                                        );
                                }
                                $("#kla1680graselections").attr("rules", "all");
                                $("#kla1680graselections").css({
                                    border: "1px solid black",
                                    margin: "10px"
                                });
                                $("#kla1680graselections tbody tr:nth-child(2)").hide();
                                supercallback({
                                    error: false,
                                    message: "erledigt"
                                });
                                return;
                            });
                        } else {
                            //sysbase.putMessage("kli1020evt" + " NICHT aufgebaut", 3);
                            console.log("kla1680gra" + " NICHT aufgebaut", 3);
                            supercallback({
                                error: false,
                                message: "erledigt"
                            });
                            return;
                        }
                    });
                });

            }
        }
    };

    /**
     * click on actionSave, speichert nach Editierung
     */
    $(document).on("click", ".kla1680graActionSave", function (event) {
        event.preventDefault();
        var selfields = {};
        var updfields = {};
        var api = "setonerecord";
        var table = "KLIRAWFILES";
        var usrrecord = {};
        try {
            klirecord = uientry.fromUI2Record("#kla1680gra", klirecord, klischema);
            selfields = {
                fullname: klirecord.fsdata.fullname
            };
            updfields["$set"] = {
                metadata: klirecord.metadata
            };
            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                if (ret.error === false) {
                    sysbase.putMessage("kla1680gra" + " saved:" + ret.message, 1);
                } else {
                    sysbase.putMessage("kla1680gra-ERROR" + " saved:" + ret.message, 3);
                }
                return;
            });
        } catch (err) {
            alert(err);
            sysbase.putMessage("kla1680gra:" + err, 3);
            console.log(err);
            console.log(err.stack);
        }
    });

    kla1680gra.setResizeObserver = function () {

        if (typeof ResizeObserver !== "undefined") {
            var resizeObserver = new ResizeObserver(function (entries, observer) {
                for (var entry in entries) {
                    // console.log("resize:" + $(this).width());
                    var resx = entries[entry];
                    var div0 = $("#" + resx.target.id);
                    var div1 = $("#kla1680gra_entry");
                    // console.log(resx.target.id);
                    var ww = $(window).width();

                    var l0 = $(div0).position().left;
                    var w0 = $(div0).width();
                    $(div0).parent().width(w0);

                    var l1 = $(div1).position().left;
                    var w1 = $(div1).width();

                    console.log("old l:" + l0 + " w:" + w0 + " l1:" + l1 + " w1:" + w1 + " ww:" + ww);

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

    /**
     * ghcndstations - Einstieg in GHCN-Daily, erst stations laden, dann Daten
     * später!!!
     */
    kla1680gra.ghcndstations = function (seltype, selyears, fullname, callback55) {
        // seltype ist hier GHCND
        kla1680gra.selData(seltype, selyears, fullname, function (ret) {
            uientry.getSchemaUI("kla1680gra", klischema, "kla1680gra", "kla1680gra" + "form", function (ret) {
                if (ret.error === false) {
                    //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                    console.log("kla1680gra" + " aufgebaut", 0);
                    // Initialisierung des UI
                    klirecord = {};
                    // den Satz holen zum Editieren
                    var sel = {
                        fullname: fullname
                    };
                    var projection = {
                        history: 0
                    };
                    var api = "getonerecord";
                    var table = "KLIRAWFILES";
                    uihelper.getOneRecord(sel, projection, api, table, function (ret) {
                        if (ret.error === false && ret.record !== null) {
                            klirecord = ret.record;
                            uientry.fromRecord2UI("#kla1680graform", klirecord, klischema);
                            // Post-Processing
                            $("#kla1680graform").find(".refUITable").removeClass("ui-btn");
                            $("#kla1680graform").find(".refUITable").removeClass("ui--shadow");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-mini");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-corner-all");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-btn-icon-notext");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-icon-refresh");
                            $("#kla1680graform").find(".refUITable").addClass('kla1680grarefresh').removeClass('refUITable');

                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-btn");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui--shadow");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-mini");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-corner-all");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-btn-icon-notext");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-icon-delete");
                            $("#kla1680graform").find(".delUITableRow").addClass('kla1680gradelete').removeClass('.delUITableRow');

                            $("#kla1680graform")
                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            width: "100%"
                                        }
                                    })
                                    .append($("<button/>", {
                                        class: "kla1680graActionSave",
                                        css: {
                                            "margin-left": "10px"
                                        },
                                        html: "Speichern",
                                    }))
                                );
                        }
                        $("#kla1680graselections").attr("rules", "all");
                        $("#kla1680graselections").css({
                            border: "1px solid black",
                            margin: "10px"
                        });
                        $("#kla1680graselections tbody tr:nth-child(2)").hide();
                        /**
                         * Refresh der Selektion aus der angezeigten Tabelle
                         */
                        $(".content").on("click", ".kla1680grarefresh", function (evt) {
                            evt.preventDefault();
                            var row = $(this).closest("tr");
                            var cselyears = $(row).find("[name=selyears]").text();
                            var cdatafilename = $(row).find("[name=datafilename]").text();
                            $("#kla1680grayears").val(cselyears);
                            $("#kla1680grab4").click();
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                        });
                        /**
                         * Zeile löschen mit Dateiverweis aus der angezeigten Tabelle
                         */
                        $(".content").on("click", ".kla1680gradelete", function (evt) {
                            evt.preventDefault();
                            var row = $(this).closest("tr");
                            var cselyears = $(row).find("[name=selyears]").text();
                            var cdatafilename = $(row).find("[name=datafilename]").text();
                            /*
                            selections(object=>array){
                                0(object){
                                    fullname(string):G:\Projekte\klimadaten\IPCC_AR4\crutem4_asof020611_stns_used.dat,
                                    selyears(string):**50,**00,
                                    fulldatafilename(string):C:\Projekte\re-framework\static\temp\2019\19916963924.txt,
                                    datafilename(string):19916963924.txt,
                                }
                            */
                            var table = "KLIRAWFILES";
                            var api = "setonerecord";
                            var selfields = {};
                            var updfields = {};
                            selfields.fullname = $("#kla1680grafullname").text();
                            updfields["$pull"] = {
                                selections: {
                                    datafilename: cdatafilename
                                }
                            };
                            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                                if (ret.error === false) {
                                    sysbase.putMessage("kla1680gra" + " deleted:" + cdatafilename + " " + ret.message, 1);
                                    $(row).remove();
                                    return;
                                } else {
                                    sysbase.putMessage("kla1680gra" + " NOT deleted:" + cdatafilename + " " + ret.message, 3);
                                    return;
                                }
                            });
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                        });
                        callback55({
                            error: false,
                            message: "erledigt"
                        });
                        return;
                    });
                } else {
                    //sysbase.putMessage("kli1020evt" + " NICHT aufgebaut", 3);
                    console.log("kla1680gra" + " NICHT aufgebaut", 3);
                    callback55({
                        error: true,
                        message: "kla1680gra" + " NICHT aufgebaut"
                    });
                    return;
                }
            });
        });


    };


    /**
     * ecadfile ist Zip-Datei mit stations.txt und Daten
     * im Namen ist die Variable zu erkennen, z.B. tx = max temperature
     */
    kla1680gra.ecadfile = function (seltype, selyears, fullname, callback44) {
        // seltype ist hier ECAD
        kla1680gra.selData(seltype, selyears, fullname, function (ret) {
            uientry.getSchemaUI("kla1680gra", klischema, "kla1680gra", "kla1680gra" + "form", function (ret) {
                if (ret.error === false) {
                    //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                    console.log("kla1680gra" + " aufgebaut", 0);
                    // Initialisierung des UI
                    klirecord = {};
                    // den Satz holen zum Editieren
                    var sel = {
                        fullname: fullname
                    };
                    var projection = {
                        history: 0
                    };
                    var api = "getonerecord";
                    var table = "KLIRAWFILES";
                    uihelper.getOneRecord(sel, projection, api, table, function (ret) {
                        if (ret.error === false && ret.record !== null) {
                            klirecord = ret.record;
                            uientry.fromRecord2UI("#kla1680graform", klirecord, klischema);
                            // Post-Processing
                            $("#kla1680graform").find(".refUITable").removeClass("ui-btn");
                            $("#kla1680graform").find(".refUITable").removeClass("ui--shadow");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-mini");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-corner-all");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-btn-icon-notext");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-icon-refresh");
                            $("#kla1680graform").find(".refUITable").addClass('kla1680grarefresh').removeClass('refUITable');

                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-btn");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui--shadow");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-mini");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-corner-all");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-btn-icon-notext");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-icon-delete");
                            $("#kla1680graform").find(".delUITableRow").addClass('kla1680gradelete').removeClass('.delUITableRow');

                            $("#kla1680graform")
                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            width: "100%"
                                        }
                                    })
                                    .append($("<button/>", {
                                        class: "kla1680graActionSave",
                                        css: {
                                            "margin-left": "10px"
                                        },
                                        html: "Speichern",
                                    }))
                                );
                        }
                        $("#kla1680graselections").attr("rules", "all");
                        $("#kla1680graselections").css({
                            border: "1px solid black",
                            margin: "10px"
                        });
                        $("#kla1680graselections tbody tr:nth-child(2)").hide();
                        /**
                         * Refresh der Selektion aus der angezeigten Tabelle
                         */
                        $(".content").on("click", ".kla1680grarefresh", function (evt) {
                            evt.preventDefault();
                            var row = $(this).closest("tr");
                            var cselyears = $(row).find("[name=selyears]").text();
                            var cdatafilename = $(row).find("[name=datafilename]").text();
                            $("#kla1680grayears").val(cselyears);
                            $("#kla1680grab4").click();
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                        });
                        /**
                         * Zeile löschen mit Dateiverweis aus der angezeigten Tabelle
                         */
                        $(".content").on("click", ".kla1680gradelete", function (evt) {
                            evt.preventDefault();
                            var row = $(this).closest("tr");
                            var cselyears = $(row).find("[name=selyears]").text();
                            var cdatafilename = $(row).find("[name=datafilename]").text();
                            /*
                            selections(object=>array){
                                0(object){
                                    fullname(string):G:\Projekte\klimadaten\IPCC_AR4\crutem4_asof020611_stns_used.dat,
                                    selyears(string):**50,**00,
                                    fulldatafilename(string):C:\Projekte\re-framework\static\temp\2019\19916963924.txt,
                                    datafilename(string):19916963924.txt,
                                }
                            */
                            var table = "KLIRAWFILES";
                            var api = "setonerecord";
                            var selfields = {};
                            var updfields = {};
                            selfields.fullname = $("#kla1680grafullname").text();
                            updfields["$pull"] = {
                                selections: {
                                    datafilename: cdatafilename
                                }
                            };
                            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                                if (ret.error === false) {
                                    sysbase.putMessage("kla1680gra" + " deleted:" + cdatafilename + " " + ret.message, 1);
                                    $(row).remove();
                                    return;
                                } else {
                                    sysbase.putMessage("kla1680gra" + " NOT deleted:" + cdatafilename + " " + ret.message, 3);
                                    return;
                                }
                            });
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                        });
                        callback44({
                            error: false,
                            message: "erledigt"
                        });
                        return;
                    });
                } else {
                    //sysbase.putMessage("kli1020evt" + " NICHT aufgebaut", 3);
                    console.log("kla1680gra" + " NICHT aufgebaut", 3);
                    callback44({
                        error: true,
                        message: "kla1680gra" + " NICHT aufgebaut"
                    });
                    return;
                }
            });
        });
    };


    /**
     * ghcnv3file - Anzeige für Verarbeitung
     * (nicht die Verarbeitung selbst)
     */
    kla1680gra.ghcnv3file = function (seltype, selyears, fullname, callbackghcn) {
        // seltype ist hier GHCN
        kla1680gra.selData(seltype, selyears, fullname, function (ret) {
            uientry.getSchemaUI("kla1680gra", klischema, "kla1680gra", "kla1680gra" + "form", function (ret) {
                if (ret.error === false) {
                    //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                    console.log("kla1680gra" + " aufgebaut", 0);
                    // Initialisierung des UI
                    klirecord = {};
                    // den Satz holen zum Editieren
                    var sel = {
                        fullname: fullname
                    };
                    var projection = {
                        history: 0
                    };
                    var api = "getonerecord";
                    var table = "KLIRAWFILES";
                    uihelper.getOneRecord(sel, projection, api, table, function (ret) {
                        if (ret.error === false && ret.record !== null) {
                            klirecord = ret.record;
                            uientry.fromRecord2UI("#kla1680graform", klirecord, klischema);
                            // Post-Processing
                            $("#kla1680graform").find(".refUITable").removeClass("ui-btn");
                            $("#kla1680graform").find(".refUITable").removeClass("ui--shadow");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-mini");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-corner-all");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-btn-icon-notext");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-icon-refresh");
                            $("#kla1680graform").find(".refUITable").addClass('kla1680grarefresh').removeClass('refUITable');

                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-btn");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui--shadow");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-mini");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-corner-all");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-btn-icon-notext");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-icon-delete");
                            $("#kla1680graform").find(".delUITableRow").addClass('kla1680gradelete').removeClass('.delUITableRow');

                            $("#kla1680graform")
                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            width: "100%"
                                        }
                                    })
                                    .append($("<button/>", {
                                        class: "kla1680graActionSave",
                                        css: {
                                            "margin-left": "10px"
                                        },
                                        html: "Speichern",
                                    }))
                                );
                        }
                        $("#kla1680graselections").attr("rules", "all");
                        $("#kla1680graselections").css({
                            border: "1px solid black",
                            margin: "10px"
                        });
                        $("#kla1680graselections tbody tr:nth-child(2)").hide();
                        /**
                         * Refresh der Selektion aus der angezeigten Tabelle
                         */
                        $(".content").on("click", ".kla1680grarefresh", function (evt) {
                            evt.preventDefault();
                            var row = $(this).closest("tr");
                            var cselyears = $(row).find("[name=selyears]").text();
                            var cdatafilename = $(row).find("[name=datafilename]").text();
                            $("#kla1680grayears").val(cselyears);
                            $("#kla1680grab4").click();
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                        });
                        /**
                         * Zeile löschen mit Dateiverweis aus der angezeigten Tabelle
                         */
                        $(".content").on("click", ".kla1680gradelete", function (evt) {
                            evt.preventDefault();
                            var row = $(this).closest("tr");
                            var cselyears = $(row).find("[name=selyears]").text();
                            var cdatafilename = $(row).find("[name=datafilename]").text();
                            /*
                            selections(object=>array){
                                0(object){
                                    fullname(string):G:\Projekte\klimadaten\IPCC_AR4\crutem4_asof020611_stns_used.dat,
                                    selyears(string):**50,**00,
                                    fulldatafilename(string):C:\Projekte\re-framework\static\temp\2019\19916963924.txt,
                                    datafilename(string):19916963924.txt,
                                }
                            */
                            var table = "KLIRAWFILES";
                            var api = "setonerecord";
                            var selfields = {};
                            var updfields = {};
                            selfields.fullname = $("#kla1680grafullname").text();
                            updfields["$pull"] = {
                                selections: {
                                    datafilename: cdatafilename
                                }
                            };
                            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                                if (ret.error === false) {
                                    sysbase.putMessage("kla1680gra" + " deleted:" + cdatafilename + " " + ret.message, 1);
                                    $(row).remove();
                                    return;
                                } else {
                                    sysbase.putMessage("kla1680gra" + " NOT deleted:" + cdatafilename + " " + ret.message, 3);
                                    return;
                                }
                            });
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                        });
                        callbackghcn({
                            error: false,
                            message: "erledigt"
                        });
                        return;
                    });
                } else {
                    //sysbase.putMessage("kli1020evt" + " NICHT aufgebaut", 3);
                    console.log("kla1680gra" + " NICHT aufgebaut", 3);
                    callbackghcn({
                        error: true,
                        message: "kla1680gra" + " NICHT aufgebaut"
                    });
                    return;
                }
            });
        });
    };


    /**
     * crutem4file - Anzeige für Verarbeitung
     * (nicht die Verarbeitung selbst)
     */
    kla1680gra.crutem4file = function (seltype, selyears, fullname, callbackcrutem4) {
        // seltype ist hier CRUTEM4

        kla1680gra.selData("CRUTEM4", selyears, fullname, function (ret) {
            uientry.getSchemaUI("kla1680gra", klischema, "kla1680gra", "kla1680gra" + "form", function (ret) {
                if (ret.error === false) {
                    //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                    console.log("kla1680gra" + " aufgebaut", 0);
                    // Initialisierung des UI
                    klirecord = {};
                    // den Satz holen zum Editieren
                    var sel = {
                        fullname: fullname
                    };
                    var projection = {
                        history: 0
                    };
                    var api = "getonerecord";
                    var table = "KLIRAWFILES";
                    uihelper.getOneRecord(sel, projection, api, table, function (ret) {
                        if (ret.error === false && ret.record !== null) {
                            klirecord = ret.record;
                            uientry.fromRecord2UI("#kla1680graform", klirecord, klischema);
                            // Post-Processing
                            $("#kla1680graform").find(".refUITable").removeClass("ui-btn");
                            $("#kla1680graform").find(".refUITable").removeClass("ui--shadow");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-mini");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-corner-all");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-btn-icon-notext");
                            $("#kla1680graform").find(".refUITable").removeClass("ui-icon-refresh");
                            $("#kla1680graform").find(".refUITable").addClass('kla1680grarefresh').removeClass('refUITable');


                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-btn");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui--shadow");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-mini");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-corner-all");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-btn-icon-notext");
                            $("#kla1680graform").find(".delUITableRow").removeClass("ui-icon-delete");
                            $("#kla1680graform").find(".delUITableRow").addClass('kla1680gradelete').removeClass('delUITableRow');

                            $("#kla1680graform")
                                .append($("<div/>", {
                                        css: {
                                            "text-align": "center",
                                            width: "100%"
                                        }
                                    })
                                    .append($("<button/>", {
                                        class: "kla1680graActionSave",
                                        css: {
                                            "margin-left": "10px"
                                        },
                                        html: "Speichern",
                                    }))
                                );
                        }
                        $("#kla1680graselections").attr("rules", "all");
                        $("#kla1680graselections").css({
                            border: "1px solid black",
                            margin: "10px"
                        });
                        $("#kla1680graselections tbody tr:nth-child(2)").hide();
                        /**
                         * Refresh der Selektion aus der angezeigten Tabelle
                         */
                        $(".content").on("click", ".kla1680grarefresh", function (evt) {
                            evt.preventDefault();
                            var row = $(this).closest("tr");
                            var cselyears = $(row).find("[name=selyears]").text();
                            var cdatafilename = $(row).find("[name=datafilename]").text();
                            $("#kla1680grayears").val(cselyears);
                            $("#kla1680grab4").click();
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                        });

                        /**
                         * Zeile löschen mit Dateiverweis aus der angezeigten Tabelle
                         */
                        $(".content").on("click", ".kla1680gradelete", function (evt) {
                            evt.preventDefault();
                            var row = $(this).closest("tr");
                            var cselyears = $(row).find("[name=selyears]").text();
                            var cdatafilename = $(row).find("[name=datafilename]").text();
                            /*
                            selections(object=>array){
                                0(object){
                                    fullname(string):G:\Projekte\klimadaten\IPCC_AR4\crutem4_asof020611_stns_used.dat,
                                    selyears(string):**50,**00,
                                    fulldatafilename(string):C:\Projekte\re-framework\static\temp\2019\19916963924.txt,
                                    datafilename(string):19916963924.txt,
                                }
                            */
                            var table = "KLIRAWFILES";
                            var api = "setonerecord";
                            var selfields = {};
                            var updfields = {};
                            selfields.fullname = $("#kla1680grafullname").text();
                            updfields["$pull"] = {
                                selections: {
                                    datafilename: cdatafilename
                                }
                            };
                            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                                if (ret.error === false) {
                                    sysbase.putMessage("kla1680gra" + " deleted:" + cdatafilename + " " + ret.message, 1);
                                    $(row).remove();
                                    return;
                                } else {
                                    sysbase.putMessage("kla1680gra" + " NOT deleted:" + cdatafilename + " " + ret.message, 3);
                                    return;
                                }
                            });
                            evt.stopPropagation();
                            evt.stopImmediatePropagation();
                        });
                        callbackcrutem4({
                            error: false,
                            message: "erledigt"
                        });
                        return;
                    });
                } else {
                    //sysbase.putMessage("kli1020evt" + " NICHT aufgebaut", 3);
                    console.log("kla1680gra" + " NICHT aufgebaut", 3);
                    callbackcrutem4({
                        error: true,
                        message: "kla1680gra" + " NICHT aufgebaut"
                    });
                    return;
                }
            });
        });
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