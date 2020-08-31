/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper,uientry */
(function () {
    var contadm = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var contschema = {
        entryschema: {
            contdata: {
                title: "Vergleichsvorgaben",
                description: "",
                type: "object", // currency, integer, datum, text, key, object
                class: "uiefieldset",
                width: "90%",
                properties: {
                    fullname: {
                        title: "Dateiname",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        size: 150,
                        default: "",
                        io: "i"
                    },
                    titel: {
                        title: "Titel",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        size: 150,
                        default: "",
                        io: "i"
                    }
                }
            },
            contarea: {
                title: "Inhaltseditierung",
                description: "",
                type: "object", // currency, integer, datum, text, key, object
                class: "uiefieldset",
                width: "90%",
                properties: {
                    content: {
                        title: "",
                        type: "string", // currency, integer, datum, text, key
                        class: "uiearea",
                        rows: 10,
                        cols: 80,
                        default: "",
                        io: "i"
                    }
                }
            }
        }
    };
    var contrecord = {};

    var actprjname;
    var aktfullname;

    contadm.show = function (parameters, navigatebucket) {
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
        $(".headertitle").html("Redaktionssystem");
        $(".headertitle").attr("title", "contadm");
        $(".content").attr("pageid", "contadm");
        $(".content").attr("id", "contadm");
        $(".content")
            .css({
                overflow: "hidden"
            });


        $(".content")
            .append($("<input/>", {
                type: "hidden",
                id: "contadm_isdirty",
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
            id: "contadm_left",
            class: "col1of2",
            css: {
                width: "30%",
                "background-color": "lightsteelblue"
            }
        }));

        $(".content").append($("<div/>", {
                id: "contadm_entry",
                class: "col2of2",
                css: {
                    width: "69%",
                    "background-color": "yellow"
                }
            })
            .append($("<form/>", {
                id: "contadmform1",
                class: "uieform",
                css: {
                    width: "99%",
                    "background-color": "lightsteelblue"
                }
            }))
        );

        sysbase.initFooter();

        // hier die Höhen absolut berechnen und versorgen
        var h = $(".content").height();
        var hh = $(".header").height();
        h += hh;
        var fh = $(".footer").height();
        h -= fh - 3;
        $("#contadm_left").height(h);
        $("#contadm_entry").height(h);
        $("#contadmform1").height(h);

        var url = $("#contadmurl").val();
        var directory = $("#contadmdir").val();

        $("#contadm_left")
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
                            configname: "CONTTREE"
                        };
                        var updfields = {};
                        var api = "setonerecord";
                        var table = "KLICONFIG";
                        var confrecord = {};
                        try {
                            var treeData = $('#contadmt0').jstree(true).get_json('#', {
                                flat: false
                            });
                            // set flat:true to get all nodes in 1-level json
                            var jsonString = JSON.stringify(treeData);
                            updfields["$setOnInsert"] = {
                                username: uihelper.getUsername(),
                                configname: "CONTTREE"
                            };
                            updfields["$set"] = {
                                jsonString: jsonString
                            };
                            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                                if (ret.error === false) {
                                    sysbase.putMessage("contadm" + " saved:" + ret.message, 1);
                                    return;
                                } else {
                                    sysbase.putMessage("contadm" + " NOT saved:" + ret.message, 3);
                                    return;
                                }
                            });
                        } catch (err) {
                            sysbase.putMessage("contadm" + " ERROR:" + err, 3);
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
                            configname: "CONTTREE"
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
                                if ($("#contadmt0").hasClass("jstree")) $("#contadmt0").jstree(true).destroy();
                                // "checkbox"
                                $("#contadmt0").jstree({
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
                        // C:\Projekte\re-klima\content
                        var predir = ["C:", "Projekte", "re-klima", "content"];
                        contadm.showfiles("list", "", predir, "", function (ret) {
                            return;
                        });
                    }
                }))

                .append($("<button/>", {
                    html: "KLICONTFILES-Reorg",
                    title: "Dateieinträge ohne physische Datei werden entfernt, History wird geschrieben",
                    css: {
                        float: "left",
                        "margin-left": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        var predir = ["C:", "Projekte", "re-klima", "content"];
                        contadm.showfiles("list", "", predir, "", function (ret) {
                            return;
                        });
                    }
                }))
                .append($("<br/>"))
                .append($("<br/>"))
            );

        var sel = {
            username: uihelper.getUsername(),
            configname: "CONTTREE"
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
                $("#contadm_leftw").remove();
                $("#contadm_left")
                    .append($("<div/>", {
                        id: "contadm_leftw",
                        css: {
                            overflow: "auto",
                            float: "left",
                            width: "100%"
                        }
                    }));
                var h = $(".content").height();
                var loff = $("#contadm_leftw").position();
                var ot = loff.top;
                h -= ot;
                var hh = $(".header").height();
                h += hh;
                var fh = $(".footer").height();
                h -= fh - 3;
                $("#contadm_leftw").height(h);
                $("#contadm_leftw").hide();
                $("#contadmt0").remove();

                $("#contadm_leftw")
                    .append($("<div/>", {
                        id: "contadmt0",
                        css: {
                            width: "100%"
                        }
                    }));

                if ($("#contadmt0").hasClass("jstree")) $("#contadmt0").jstree(true).destroy();
                $("#contadmt0").jstree({
                    "plugins": ["state"],
                    core: {
                        'check_callback': true,
                        data: filenodes
                    }
                });
                $("#contadm_leftw").show();
                $('#contadmt0').on("select_node.jstree", function (e, data) {
                    var node = $('#contadmt0').jstree(true).get_node(data.node.id);
                    contadm.clicknode(node, function (ret) {

                    });
                    //alert("node_id: " + data.node.id + " " + node.text);
                });
                sysbase.putMessage("Konfiguration geladen");
            } else {
                sysbase.putMessage("Konfiguration nicht vorhanden");
                var predir = ["C:", "Projekte", "re-klima", "content"];
                contadm.showfiles("list", url, predir, "", function (ret) {
                    return;
                });
            }
        });
    };



    contadm.showclock = function (clockcontainer) {
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
    contadm.showfiles = function (fileopcode, url, predirectory, directory, callback) {
        document.getElementById("contadm").style.cursor = "progress";
        var jqxhr = $.ajax({
            method: "GET",
            crossDomain: false,
            url: sysbase.getServer("getdirectory"),
            data: {
                fileopcode: fileopcode,
                url: url,
                directory: predirectory
            }
        }).done(function (r1, textStatus, jqXHR) {
            sysbase.checkSessionLogin(r1);
            sysbase.putMessage(r1, 1);
            var ret = JSON.parse(r1);
            // Ausgabe in Map rechts
            $("#contadm_leftw").remove();
            $("#contadm_left")
                .append($("<div/>", {
                    id: "contadm_leftw",
                    css: {
                        overflow: "auto",
                        float: "left",
                        width: "100%"
                    }
                }));
            var h = $(".content").height();
            var loff = $("#contadm_leftw").position();
            var ot = loff.top;
            h -= ot;
            var hh = $(".header").height();
            h += hh;
            var fh = $(".footer").height();
            h -= fh - 3;
            $("#contadm_leftw").height(h);
            $("#contadm_leftw").hide();
            $("#contadmform1").height(h);
            $(".contadmt0").remove();
            $("#contadm_leftw")
                .append($("<div/>", {
                    id: "contadmt0",
                    css: {
                        width: "100%"
                    }
                }));
            var filenodes = [];
            for (var ilink = 0; ilink < ret.files.length; ilink++) {
                var linkname = ret.files[ilink].name;
                var linksize = ret.files[ilink].size || "?";
                var tsfilecreated = ret.files[ilink].tsfilecreated || "?";
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

            if ($("#contadmt0").hasClass("jstree")) $("#contadmt0").jstree(true).destroy();
            // "checkbox"
            $("#contadmt0").jstree({
                "plugins": ["state"],
                core: {
                    'check_callback': true,
                    data: filenodes
                }
            });

            $("#contadm_leftw").show();
            document.getElementById("contadm").style.cursor = "default";
            $('#contadmt0').on("select_node.jstree", function (e, data) {
                var node = $('#contadmt0').jstree(true).get_node(data.node.id);
                contadm.clicknode(node, function (ret) {

                });
                //alert("node_id: " + data.node.id + " " + node.text);
            });

            /*
            $('#contadmt0').on("changed.jstree", function (e, data) {
                console.log("The selected nodes are:");
                console.log(data.selected);
            });
            */
        }).fail(function (err) {
            document.getElementById("contadm").style.cursor = "default";
            sysbase.putMessage(err, 1);
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
    contadm.clicknode = function (node, supercallback) {
        var fullname = node.li_attr.fullname;
        // dirty-flag später

        $("#contadmform1").empty();

        // einfache Dateianzeige, inhalt
        // nur bei erste Anzeige, nicht beim Blättern neue Anzeige
        uientry.getSchemaUI("contadm", contschema, "contadm", "contadm" + "form1", function (ret) {
            if (ret.error === false) {
                //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                console.log("contadm" + " aufgebaut", 0);
                // Initialisierung des UI
                contrecord = {};
                // den Satz holen zum Editieren
                var sel = {
                    fullname: fullname
                };
                var projection = {
                    history: 0
                };
                var api = "getonerecord";
                var table = "KLICONTFILES";
                uihelper.getOneRecord(sel, projection, api, table, function (ret) {
                    if (ret.error === false && ret.record !== null) {
                        contrecord = ret.record;
                        uientry.fromRecord2UI("#contadmform1", contrecord, contschema);
                    } else {
                        contrecord = {};
                        contrecord.fullname = fullname;
                        uientry.fromRecord2UI("#contadmform1", contrecord, contschema);
                    }
                    CKEDITOR.replace( 'contadmcontent', {
                        width: "100%",
                        "extraPlugins": "imagebrowser",
		                "imageBrowser_listUrl": "/path/to/images_list.json"
                      });
                    // $("#contadmform1")
                    $("#contadmcontdatadiv")
                        .append($("<div/>", {
                                css: {
                                    "text-align": "center",
                                    width: "100%"
                                }
                            })
                            .append($("<button/>", {
                                class: "contadmActionSave",
                                css: {
                                    "margin-left": "10px"
                                },
                                html: "Speichern",
                            }))
                        );

                    $("#contadmselections").attr("rules", "all");
                    $("#contadmselections").css({
                        border: "1px solid black",
                        margin: "10px"
                    });
                    $("#contadmselections tbody tr:nth-child(2)").hide();
                    supercallback({
                        error: false,
                        message: "erledigt"
                    });
                    return;
                });
            } else {
                //sysbase.putMessage("kli1020evt" + " NICHT aufgebaut", 3);
                console.log("contadm" + " NICHT aufgebaut", 3);
                supercallback({
                    error: false,
                    message: "erledigt"
                });
                return;
            }
        });
    };

    /**
     * click on actionSave, speichert nach Editierung
     */
    $(document).on("click", ".contadmActionSave", function (event) {
        event.preventDefault();
        var selfields = {};
        var updfields = {};
        var api = "setonerecord";
        var table = "KLICONTFILES";
        var usrrecord = {};
        debugger;
        try {
            contrecord = uientry.fromUI2Record("#contadmform1", contrecord, contschema);
            contrecord.content = CKEDITOR.instances.contadmcontent.getData();
            selfields = {
                fullname: contrecord.contdata.fullname
            };
            updfields["$setOnInsert"] = {
                metadata: contrecord.contdata.fullname
            };
            updfields["$set"] = {
                titel: contrecord.contdata.titel,
                content: contrecord.content
            };
            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                if (ret.error === false) {
                    sysbase.putMessage("contadm" + " saved:" + ret.message, 1);
                } else {
                    sysbase.putMessage("contadm-ERROR" + " saved:" + ret.message, 3);
                }
                return;
            });
        } catch (err) {
            alert(err);
            sysbase.putMessage("contadm:" + err, 3);
            console.log(err);
            console.log(err.stack);
        }
    });

    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = contadm;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return contadm;
        });
    } else {
        // included directly via <script> tag
        root.contadm = contadm;
    }
}());