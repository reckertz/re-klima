/*jshint evil: true */
/*global $,window,module,define,root,global,self,this,document,alert */
/*global sysbase,uihelper,uientry,CKEDITOR */
(function () {
    var contadm = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;

    var predir = ["C:", "Projekte", "re-klima", "content"];
    var editor;
    var contschema = {
        entryschema: {
            contdata: {
                title: "Dateiname",
                description: "",
                type: "object", // currency, integer, datum, text, key, object
                class: "uiefieldset",
                width: "90%",
                properties: {
                    title: {
                        title: "Überschrift",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        width: "40em",
                        default: "",
                        io: "i"
                    },
                    filename: {
                        title: "Dateiname",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        width: "25em",
                        io: "i"
                    },
                    fullname: {
                        title: "Voller Name",
                        type: "string", // currency, integer, datum, text, key
                        class: "uietext",
                        io: "h"
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
                .append($("<input/>", {
                    type: "search",
                    id: "contadmsearch",
                    class: "contadmsearch",
                    css: {
                        float: "left",
                        margin: "10px"
                    }
                }))

                .append($("<button/>", {
                    html: "Filter",
                    title: "Selektive Anzeige",
                    class: "contadmsearchbut",
                    css: {
                        float: "left",
                        "margin": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        $("#contadmt0").jstree("search", $("#contadmsearch").val());
                    }
                }))

                .append($("<button/>", {
                    html: "Generieren",
                    title: "Generierung der HTML-Seiten mit den Bildverweisen",
                    css: {
                        float: "left",
                        "margin": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // $("#contadmt0").jstree("search",$("#contadmsearch").val());

                        var jqxhr = $.ajax({
                            method: "GET",
                            crossDomain: false,
                            url: sysbase.getServer("generate"),
                            data: {
                                contentpath: "content"
                            }
                        }).done(function (r1, textStatus, jqXHR) {
                            sysbase.checkSessionLogin(r1);
                            var j1 = JSON.parse(r1);
                            if (j1.error === false) {
                                sysbase.putMessage(" Generierung erfolgt", 1);
                                /**
                                 * kein "echter" Root-Node, etwas komplizierte Mimik
                                 * li_attr("filename") geht nicht
                                 */
                                $('#contadmt0').jstree('select_node', 'ul:first > li:first');
                                var root_nodes = $('#contadmt0').jstree('get_selected');
                                var root_nodeid = root_nodes[root_nodes.length - 1];
                                var filename = $("#" + root_nodeid).attr("filename");

                                var gurl = sysbase.getServer("content/" + filename);
                                window.open(gurl, "Klima", 'height=' + screen.height + ', width=' + screen.width);
                            } else {
                                sysbase.putMessage("Generierung ERROR:" + j1.message, 3);
                            }
                            return;
                        }).fail(function (err) {
                            sysbase.putMessage("Generierung AJAX ERROR:" + err.message);
                            return;
                        }).always(function () {
                            // nope
                        });
                    }
                }))


                .append($("<button/>", {
                    html: "Testen",
                    title: "Aufruf der Startseite in neuem Fenster",
                    css: {
                        float: "left",
                        "margin": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        $('#contadmt0').jstree('select_node', 'ul:first > li:first');
                        var root_nodes = $('#contadmt0').jstree('get_selected');
                        var root_nodeid = root_nodes[root_nodes.length - 1];
                        var filename = $("#" + root_nodeid).attr("filename");
                        var gurl = sysbase.getServer("content/" + filename);
                        debugger;
                        var urlstyles = "resizable,scrollbars,status"; //'height=' + screen.height + ',width=' + screen.width + ',resizable=yes,scrollbars=yes,toolbar=yes,menubar=yes,location=yes';
                        window.open(gurl, "Klima", urlstyles);

                    }
                }))

                .append($("<button/>", {
                    html: "Tree Sichern",
                    title: "Sichern des Strukturbaums",
                    css: {
                        float: "left",
                        "margin": "10px",
                        "background-color": "navyblue"
                    },
                    click: function (evt) {
                        evt.preventDefault();
                        // $("#contadmt0").jstree("search",$("#contadmsearch").val());
                        contadm.savetree(function (ret) {
                            console.log(ret.message);
                        });

                    }
                }))



                .append($("<br/>"))
                .append($("<br/>"))
            );

        $(document).on("keypress", ".contadmsearch", function (evt) {
            if (evt.keyCode === 13) {
                // Cancel the default action, if needed
                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                // Trigger the button element with a click
                //document.getElementById("myBtn").click();

                $(".contadmsearchbut").click();
            }
        });

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
        contadm.restoretree(function (ret) {
            if (ret.error === true) {
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
     *  - holt die vorhandenen Datendateien aus dem Verzeichnis
     * fileopcode: show oder prep
     * url: ist informatorisch zu sehen "https://www1.ncdc.noaa.gov/pub/data/paleo/pages2k/pages2k-temperature-v2-2017/data-current-version/"
     * predirectory: hier das klima1001-Verzeichnis
     * directory: Verzeichnis der eigentlichen Daten unter dem klima1001-Verzeichnis
     * ret.files - Array der gefundenen Dateien (Metadaten der Dateien)
     */
    contadm.showfiles = function (fileopcode, url, predirectory, directory, callback) {
        document.getElementById("contadm").style.cursor = "progress";
        var sqlStmt = "SELECT filename, fullname ";
        sqlStmt += " FROM KLICONTFILES";
        sqlStmt += " ORDER BY filename";
        var table = "KLICONTFILES";
        var api = "getallrecords";
        uihelper.getAllRecords(sqlStmt, {}, [], 0, 0, api, table, function (ret) {
            if (ret.error === true) {
                sysbase.putMessage(ret.message, 3);
                if (typeof callback !== "undefined") {
                    callback(ret);
                    return;
                } else {
                    return;
                }
            }
            var filenodes = [];
            if (typeof ret.records !== "undefined" && ret.records !== null && Object.keys(ret.records).length > 0) {
                // Ausgabe in jstree links
                for (var ilink in ret.records) {
                    if (ret.records.hasOwnProperty(ilink)) {
                        var record = ret.records[ilink];
                        var linkname = record.filename;
                        var filenode = {
                            text: record.title + " (" + record.filename + ")",
                        };
                        filenode.li_attr = {
                            fullname: record.fullname,
                            filename: record.filename,
                        };
                        filenode.a_attr = {
                            title: record.filename
                        };
                        filenode.icon = "jstree-file";
                        filenode.li_attr.what = "file";
                        filenodes.push(filenode);
                    }
                }
            } else {
                $("#contadmform1").empty();
                // einfache Dateianzeige, inhalt
                // nur bei erste Anzeige, nicht beim Blättern neue Anzeige
                uientry.getSchemaUI("contadm", contschema, "contadm", "contadm" + "form1", function (ret) {
                    if (ret.error === false) {
                        // Formatierung
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
                                .append($("<button/>", {
                                    class: "contadmActionDelete",
                                    css: {
                                        "margin-left": "10px"
                                    },
                                    html: "Löschen",
                                }))
                            );
                        $("#contadmcontdatadiv").css({
                            overflow: "auto"
                        });
                        var h = $("#contadm_entry").height();
                        $("#contadmform1").height(h);
                        var h1 = $("#contadmcontdatadiv").height();
                        var h2 = h - h1 - 20;
                        $("#contadmcontareadiv").height(h2);

                        editor = CKEDITOR.replace('contadmcontent', {
                            width: "100%",
                            filebrowserBrowseUrl: '/ckurlbrowser.html',
                            filebrowserImageUploadUrl: '/ckbrowser.html',
                            extraPlugins: 'smiley,font',
                            extraCss: "body{font-family:Calibri, serif;font-size:16px}"
                        });
                        // https://stackoverflow.com/questions/13617111/i-cant-add-the-source-button-to-ckeditor-4s-toolbar
                        editor.ui.addButton('InsertCustomImage', {
                            label: "Speichern",
                            command: 'contadmActionSave',
                            toolbar: 'insert',
                            icon: '/images/icons-png/arrow-d-black.png'
                        });

                    }
                });
            }
            if ($("#contadmt0").hasClass("jstree")) $("#contadmt0").jstree(true).destroy();
            // "checkbox"
            $("#contadmt0").jstree({
                "plugins": ["state", "search", "dnd"],
                "search": {
                    case_sensitive: false,
                    show_only_matches: true
                },
                core: {
                    'check_callback': true,
                    data: filenodes
                }
            });

            $("#contadm_leftw").show();
            document.getElementById("contadm").style.cursor = "default";

            //$(document).on('click', '.jstree-anchor', function(e) {...});

            $('#contadmt0').on("select_node.jstree", function (e, data) {
                var node = $('#contadmt0').jstree(true).get_node(data.node.id);
                contadm.clicknode(node, function (ret) {
                    //alert("node_id: " + data.node.id + " " + node.text);
                });
            });
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
        var filename = node.li_attr.filename;
        // dirty-flag später

        $("#contadmform1").empty();
        // einfache Dateianzeige, inhalt
        // nur bei erste Anzeige, nicht beim Blättern neue Anzeige
        uientry.getSchemaUI("contadm", contschema, "contadm", "contadm" + "form1", function (ret) {
            if (ret.error === false) {
                // Formatierung
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
                        .append($("<button/>", {
                            class: "contadmActionDelete",
                            css: {
                                "margin-left": "10px"
                            },
                            html: "Löschen",
                        }))
                    );
                $("#contadmcontdatadiv").css({
                    overflow: "auto"
                });
                //sysbase.putMessage("kli1020evt" + " aufgebaut", 0);
                console.log("contadm" + " aufgebaut", 0);
                // Initialisierung des UI
                contrecord = {};
                // den Satz holen zum Editieren
                var sel = {
                    filename: filename
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
                        contrecord.filename = filename;
                        uientry.fromRecord2UI("#contadmform1", contrecord, contschema);
                    }
                    $("#contadm_entry").height($("#contadm_left").height());
                    var h = $("#contadm_entry").height();
                    $("#contadmform1").height(h);
                    var h1 = $("#contadmcontdatadiv").height();
                    var h2 = h - h1 - 20;
                    $("#contadmcontareadiv").height(h2);
                    // AJAX
                    editor = CKEDITOR.replace('contadmcontent', {
                        width: "100%",
                        filebrowserBrowseUrl: '/ckurlbrowser.html',
                        filebrowserImageBrowseUrl: '/ckbrowser.html',
                        extraPlugins: 'smiley,font,tableresize',
                        extraCss: "body{font-family:Calibri, serif;font-size:16px}"
                    });
                    // https://stackoverflow.com/questions/1957156/how-to-add-a-custom-button-to-the-toolbar-that-calls-a-javascript-function
                    editor.addCommand("storeRecord", { // create named command
                        exec: function (edt) {
                            //alert(edt.getData());
                            $(".contadmActionSave").click();
                        }
                    });

                    // https://stackoverflow.com/questions/13617111/i-cant-add-the-source-button-to-ckeditor-4s-toolbar
                    editor.ui.addButton('speichern', {
                        label: "Speichern",
                        command: 'storeRecord',
                        toolbar: 'insert',
                        icon: '/images/icons-png/arrow-d-black.png'
                    });




                    // $("#contadmform1")
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
        try {
            contrecord = uientry.fromUI2Record("#contadmform1", contrecord, contschema);
            contrecord.content = CKEDITOR.instances.contadmcontent.getData();
            /**
             * Sammlung der Imager-Verweise img src
             */
            // https://stackoverflow.com/questions/18101673/jquery-get-all-src-of-images-in-div-and-put-into-field
            var imgsrcs = $(contrecord.content).find("img").map(function () {
                return $(this).attr("src");
            }).get();
            var filename = contrecord.contdata.filename.trim().replace(/ /g, "_");
            contrecord.contdata.filename = filename;
            var foundid = "";
            $("#contadmt0").find("[filename='" + filename + "']").each(function () {
                //alert($(this).attr("id"));
                foundid = $(this).attr("id");
            });
            if (foundid.length > 0) {
                // Aktualisieren alter Knoten
                var newtext = contrecord.contdata.title + " (" + contrecord.contdata.filename + ")";
                $('#contadmt0').jstree('rename_node', foundid, newtext);
            } else {
                // neu hinzufügen
                var filenode = {
                    text: contrecord.contdata.title + " (" + contrecord.contdata.filename + ")"
                };
                filenode.li_attr = {
                    fullname: contrecord.contdata.fullname,
                    filename: contrecord.contdata.filename
                };
                filenode.a_attr = {
                    title: contrecord.contdata.filename
                };
                filenode.icon = "jstree-file";
                filenode.li_attr.what = "file";

                var refnode = $("#contadmt0").jstree().get_selected(true)[0];
                if (typeof refnode === "undefined" || refnode === null) {
                    $("#contadmt0").jstree()
                        .create_node('#', filenode, "last", function (newid) {
                            sysbase.putMessage("Zugefügt:" + contrecord.contdata.filename + "=>" + newid);
                            // $('#contadmt0').jstree('refresh');
                            $('#contadmt0').jstree('redraw');
                            $("#contadmb1").click();
                        });
                } else {
                    // insert as sibling
                    debugger;
                    var $parent = $('#' + refnode.id).parent();
                    var index = $parent.children().index($('#' + refnode.id)) + 1;
                    if (refnode.parent === '#') {
                        $parent = '#';
                    }
                    $("#contadmt0").jstree().create_node($parent, filenode, index);
                }

            }
            selfields = {
                filename: contrecord.contdata.filename
            };
            updfields["$setOnInsert"] = {
                filename: contrecord.contdata.filename
            };
            updfields["$set"] = {
                title: contrecord.contdata.title,
                fullname: contrecord.contdata.fullname,
                content: contrecord.content,
                imgsrcs: JSON.stringify(imgsrcs)
            };
            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                if (ret.error === false) {
                    sysbase.putMessage("contadm" + " saved:" + ret.message, 1);
                    contadm.savetree(function (ret1) {

                    });
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
     * click on actionDelete, speichert nach Editierung
     */
    $(document).on("click", ".contadmActionDelete", function (event) {
        event.preventDefault();

        try {
            contrecord = uientry.fromUI2Record("#contadmform1", contrecord, contschema);
            contrecord.content = CKEDITOR.instances.contadmcontent.getData();
            // https://stackoverflow.com/questions/18101673/jquery-get-all-src-of-images-in-div-and-put-into-field
            var imgsrcs = $(contrecord.content).find("img").map(function () {
                return $(this).attr("src");
            }).get();
            var filename = contrecord.contdata.filename.trim().replace(/ /g, "_");
            contrecord.contdata.filename = filename;

            var qmsg = "Sollen die Daten gelöscht werden für:" + filename;
            var check = window.confirm(qmsg);
            if (check === false) {
                return;
            }
            var delStmt = "DELETE FROM KLICONTFILES";
            delStmt += " WHERE filename = '" + filename + "'";
            var api = "delonerecord";
            var table = "KLICONTFILES";
            var record = {};
            $("body").css("cursor", "progress");
            uihelper.delOneRecord(delStmt, api, table, record, function (ret) {
                if (ret.error === false) {
                    var foundid = "";
                    $("#contadmt0").find("[filename='" + filename + "']").each(function () {
                        //alert($(this).attr("id"));
                        foundid = $(this).attr("id");
                        $("#contadmt0").jstree("delete_node", "#" + foundid);
                        $('#contadmt0').jstree('redraw');
                    });
                    sysbase.putMessage(filename + " gelöscht", 1);
                } else {
                    sysbase.putMessage(filename + " nicht gelöscht " + ret.message, 3);
                }
            });
        } catch (err) {
            alert(err);
            sysbase.putMessage("contadm:" + err, 3);
            console.log(err);
            console.log(err.stack);
        }
    });

    contadm.savetree = function (cbsave) {
        var selfields = {
            configname: "CONTREE"
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
                configname: "CONTREE"
            };
            updfields["$set"] = {
                jsonString: jsonString
            };
            uihelper.setOneRecord(selfields, updfields, api, table, function (ret) {
                if (ret.error === false) {
                    sysbase.putMessage("contadm" + " saved:" + ret.message, 1);
                    cbsave({
                        error: false,
                        message: "contadm" + " saved:" + ret.message
                    });
                    return;
                } else {
                    cbsave({
                        error: true,
                        message: "contadm" + " NOT saved:" + ret.message
                    });
                    return;
                }
            });
        } catch (err) {
            cbsave({
                error: true,
                message: "contadm" + " saved:" + err
            });
            return;
        }
    };


    contadm.restoretree = function (cbrest) {

        var sel = {
            configname: "CONTREE"
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
                    "plugins": ["state", "search", "dnd"],
                    "search": {
                        case_sensitive: false,
                        show_only_matches: true
                    },
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
                        //alert("node_id: " + data.node.id + " " + node.text);
                    });
                });
                sysbase.putMessage("contadm geladen");
                cbrest({
                    error: false,
                    message: "contadm" + " Tree restored"
                });
                return;
            } else {
                sysbase.putMessage("contadm nicht vorhanden");
                cbrest({
                    error: true,
                    message: "contadm" + " Tree not restored:" + ret.message
                });
                return;
            }
        });
    };



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