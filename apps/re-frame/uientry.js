/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global ecsystem,parseNumberconsole,devide,window,module,define,root,global,self,this */
/*global async,uilogger,nta1010login,nta1000men,kber2,kassenber1cal,nta3001show,nta3005mit,nta3010devlst,nta3007raw,uiloginControl,nta3050users,nta3055user,nta3060invite,nta3020uploader,uimessages,uisystem */
(function () {
    var uientry = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    var mytransliste = {};
    var ajax4options = {};
    var resmsg = "";
    /**
     * init aktiviert die klassenbezogenen Events
     */
    uientry.init = function () {

        //mytransliste = kabu2.getbctransliste();
        /**
         * text
         */
        $(document).on("change keyup", ".uietext", function (event) {

            var text = $(this);
            var plausi = true;
            if ($(text).hasClass("uiehomepage")) {
                // https://stackoverflow.com/questions/42618872/regex-for-website-or-url-validation
                var re = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;
                if (re.test($(text).val()) === false) {
                    plausi = false;
                }
            }
            if ($(text).hasClass("uieemail")) {
                // https://stackoverflow.com/questions/46155/how-can-an-email-address-be-validated-in-javascript
                //var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (re.test($(text).val()) === false) {
                    plausi = false;
                }
            }
            if ($(text).hasClass("uiepassword")) {
                if (!uihelper.checkPassword($(text).val())) {
                    plausi = false;
                }
            }
            if (plausi === true) {
                var name = $(this).attr("name");
                if (typeof mytransliste.entryschema !== "undefined") {

                }
            }

            if (plausi === true) {
                uihelper.markok(this);
            } else {
                uihelper.markerror(this);
            }

        });

        $(document).on("focus", "input", function (event) {
            var inputfield = $(this);
            uihelper.markactive(inputfield);
        });

        $(document).on("blur", "input", function (event) {
            var inputfield = $(this);
            uihelper.markinactive(inputfield);
        });

        $(document).on("focus", "textarea", function (event) {
            var inputfield = $(this);
            uihelper.markactive(inputfield);
        });

        $(document).on("blur", "textarea", function (event) {
            var inputfield = $(this);
            uihelper.markinactive(inputfield);
        });


        /**
         * text mit IBAN
         */
        $(document).on("change keyup", ".uieiban", function (event) {
            var iban = $(this);
            if (uihelper.checkIbanUI(iban)) {
                // value is in list
                uihelper.markok(this);
            } else {
                // value is not in list
                uihelper.markerror(this);
            }
        });
        /**
         * text mit Prompt zur Auswahl
         */
        $(document).on("click", ".ui-input-clear-active", function (event) {
            if ($(this).siblings("a").hasClass("ui-input-clear-hidden")) {
                return;
            }
            $(this).siblings("input").val("");

            $(this).removeClass("ui-input-clear-active");
            $(this).addClass("ui-input-clear-hidden");
        });

        $(document).on("change keyup input", ".uieselectinput", function (event) {
            if ($(this).siblings("a").hasClass("ui-input-clear-hidden")) {
                $(this).siblings("a").removeClass("ui-input-clear-hidden");
                $(this).siblings("a").addClass("ui-input-clear-active");
            }
            var $input = $(this);
            var val = $input.val();
            var list = $input.attr('list');
            $($input).nextAll('span').remove();
            var vtext = "";
            // jQuery filter kennt keinen BREAK!!!!
            /*
            var match = $('#' + list + ' option').filter(function () {
                vtext = $(this).text();
                return ($(this).val() === val);
            });
            */
            var vvalue = null;
            $('#' + list + ' option').each(function (i, el) {
                if (el.value === val) {
                    vvalue = val;
                    vtext = el.innerText;
                    return false; // das beendet diesen each-Loop
                }
            });
            if (vvalue !== null) {
                // value is in list
                /**
                 * Übersetzen Schlüsselwerte
                 */
                if (vtext.length > 0) {
                    $($input).after(
                        $("<span/>", {
                            html: vtext,
                            css: {
                                margin: "10px"
                            }
                        })
                    );
                }
                uihelper.markok(this);
            } else {
                // value is not in list
                uihelper.markerror(this);
            }
        });

        /**
         * text-Liste mit Prompt zur Mehrfach-Auswahl
         */
        $(document).on("change keyup input", ".uieselectmany", function (event) {
            var $input = $(this);
            var val = $input.val();
            var list = $input.attr('list');
            var match = $('#' + list + ' option').filter(function () {
                return ($(this).val() === val);
            });

            if (match.length > 0) {
                // value is in list
                uihelper.markok(this);
            } else {
                // value is not in list
                uihelper.markerror(this);
            }
        });



        /**
         * currency
         */
        $(document).on("change keyup", ".uiecurrency", function (event) {
            var name = $(this).attr("name");
            var betrag = $(this).val();
            if (betrag.trim().length > 0) {
                //var betragUS = uihelper.convertD2US(betrag);
                var betragUS = betrag.replace(/\./g, ""); // nimmt die Tausenderpunkte Wegfall
                betragUS = betragUS.replace(",", "."); // Tausch
                if (isNaN(betragUS)) {
                    uihelper.markerror(this);
                    return;
                }
                try {
                    var betragBig = new Big(betragUS);
                    betragUS = betragBig.toString();
                    var dis = betragUS.indexOf(".");
                    if (dis >= 0) {
                        if ((betragUS.replace(/-/g, "").split('.')[1]).length > 2) {
                            uihelper.markerror(this);
                            return;
                        }
                    }
                } catch (e) {
                    console.log("ERROR uicurreny " + e.message);
                    uihelper.markerror(this);
                    return;
                }
                uihelper.markok(this);
            }
            if (typeof mytransliste.entryschema !== "undefined") {

            }
        });
        /**
         * date - deutsch extern, ISO intern
         */
        $(document).on("change keyup", ".uiedate", function (event) {
            var name = $(this).attr("name");
            var datum = $(this).val();
            var datumISO = uihelper.convertD2ISO(datum);
            if (datumISO === "") {
                uihelper.markerror(this);
                return;
            }
            try {
                var dateJS = new Date(datumISO);
            } catch (e) {
                console.log("ERROR uiedate:" + e.message);
                sysbase.putMessage("ERROR uiedate:" + datum + "/" + datumISO + "=>" + e.message, 3);
                uientry.merkerror(this);
                return;
            }
            uihelper.markok(this);
        });

        $(document).on("blur", ".uiedate", function (event) {
            var name = $(this).attr("name");
            var datum = $(this).val();
            // Format prüfen
            // Format konvertieren
            /* DELAYED
            var datumISO = $(this).datepicker({
                dateFormat: 'yy-mm-dd'
            }).val();
            $(this).val($(this).datepicker({
                dateFormat: 'dd.mm.yy'
            }).val());
            */
        });


        /**
         * generisches Event für das Zufügen von Zeilen
         */
        $(document).on("click", ".addUITableRow", function () {

            var containerHash = "#" + $(this).closest("table").attr("id");

            $(containerHash)
                .find(" tbody tr:first")
                .clone()
                .appendTo($(containerHash)
                    .find("tbody"))
                .show();

        });


        /**
         * generisches Event für das logische Löschen von Zeilen
         */
        $(document).on("click", ".delUITableRow", function () {
            // event.preventDefault();
            // TODO: Popup für Kommentareingabe, später evtl. Passwort
            uientry.inactivaterow($(this));
        });

        /**
         * generisches Event für das reaktivieren von Zeilen
         */
        $(document).on("click", ".recUITableRow", function () {
            // event.preventDefault();
            // erst clone erzeugen von Musterzeile
            // hier wird die unsichtbare Zeile als Eingabezeile kopiert
            var tcontainer = $(this).closest("table");
            // alte Zeile
            var oldrow = $(this).closest("tr");
            // neue Zeile als Clone der Musterzeile hinter die alte Zeile
            $(oldrow).after($(tcontainer).find(" tbody tr:first").clone());
            var newrow = $(oldrow).next();
            $(oldrow).next().show();
            // dann Werte transferieren
            $(newrow).find(':input').each(function () {
                //if (this.name === "isactive") {
                //    $(this).val("true");
                //} else {
                var oldvalue = $(oldrow).find("[name=" + this.name + "]").text();
                $(this).val(oldvalue);
                //}
            });
            // dann alte Zeile löschen
            $(oldrow).remove();
            // und neue Zeile anzeigen
            $(newrow).show();
            // icons aktualisieren
            $(newrow).find('.delUITableRow').each(function () {
                $(this).show();
            });
            $(newrow).find('.recUITableRow').each(function () {
                $(this).hide();
            });
            $(newrow).enhanceWithin();
        });
    };

    uientry.inactivaterow = function (thisrow) {
        var row = $(thisrow);
        if ($(row).prop("tagName") !== "TR") {
            row = $(thisrow).closest("tr");
        }
        $(row).attr("kio", "canceled");
        $(row).css("text-decoration", "line-through");
        $(row).find('input').each(function () {
            if (this.type === "hidden") {
                if (this.name === "isactive") {
                    this.value = "false";
                }
            } else {
                var akttd = $(this).closest("td");
                var aktvalue = this.value;
                var aktname = this.name;
                $(akttd).empty();
                $(akttd).append($("<span/>", {
                    name: aktname,
                    text: aktvalue
                }));
            }
        });
        $(row).find('.delUITableRow').each(function () {
            $(this).hide();
        });

    };


    uientry.protectrow = function (thisrow) {
        var row = $(thisrow);
        if ($(row).prop("tagName") !== "TR") {
            row = $(thisrow).closest("tr");
        }
        $(row).find('input').each(function () {
            if (this.type === "hidden") {
                // nix
            } else {
                var akttd = $(this).closest("td");
                var aktvalue = this.value;
                var aktname = this.name;
                $(akttd).empty();
                $(akttd).append($("<span/>", {
                    name: aktname,
                    text: aktvalue
                }));
            }
        });
        // TODO: select, checkbox ...
        // reactivate anzeigen recUITableRow
        $(row).find('.recUITableRow').each(function () {
            $(this).show();
        });
    };



    /**
     * Generierung des UI für ein JSON-Schema
     * @param {*} schema - JSON-Schema
     * @param {*} container - UI-Container im DOM
     * returns ret mit superoptions
     */

    uientry.getSchemaUI = function (bctype, schema, pageprefix, containerID, callback) {
        uientry.getSchemaUIX(bctype, schema, pageprefix, containerID, true, function (ret) {
            if (typeof ret.superoptions === "string" && ret.superoptions.startsWith("{")) {
                var superoptions = JSON.parse(ret.superoptions);
                // hier müssen die gefundenen Daten übernommen werden
                for (var fieldname in superoptions) {
                    if (superoptions.hasOwnProperty(fieldname)) {
                        var options = superoptions[fieldname].options;
                        var parms = superoptions[fieldname].parms;
                        $("#" + parms.containerID).empty();
                        for (var ioption = 0; ioption < options.length; ioption++) {
                            var optionkey = options[ioption].key;
                            // enum versorgen - popup
                            // var enu = schema.entryschema[fieldname].enum;
                            // enu.push(optionkey);
                            // options versorgen in UI
                            if (typeof parms !== "undefined" && typeof parms.containerID !== "undefined") {
                                $("#" + parms.containerID)
                                    .append($("<option/>", {
                                        value: optionkey
                                    }));
                            }
                        }
                    }
                }
            }
            callback(ret);
            return;
        });
    };

    uientry.getSchemaUIX = function (bctype, schema, pageprefix, containerID, doempty, supercallback) {
        // DELAYED $.datepicker.setDefaults($.datepicker.regional["de"]);
        var epfields = {};
        // fallback für properties!!!!
        if (typeof schema.entryschema !== "undefined") {
            epfields = schema.entryschema;
        } else {
            epfields = schema.properties;
        }
        /*
            name: "vendor",
            title: "Lieferant",
            description: "",
            type: "text", // currency, integer, datum, text, key
            default: ""
        */
        var containerHash = "#" + containerID;
        if (doempty === true) $(containerHash).empty();
        $(containerHash).attr("bctype", bctype);
        for (var epfieldname in epfields) {
            if (epfields.hasOwnProperty(epfieldname)) {
                var epfield = epfields[epfieldname];
                if (typeof epfield.customclasses === "undefined") {
                    epfield.customclasses = "";
                }
                // entfernen aller Klassen, die mit uie anfangen, damit die custom-classes erhalten bleiben
                if (typeof epfield.io === "undefined" || epfield.io.trim().length < 1) {
                    epfield.io = "i";
                }
                if (epfield.io === "h") {
                    $(containerHash)
                        .append($("<input/>", {
                            id: pageprefix + epfieldname,
                            name: epfieldname,
                            class: "uietext" + " " + epfield.customclasses,
                            bctype: bctype,
                            type: "hidden"
                        }));
                    if (typeof epfield.value !== "undefined") {
                        $("#" + pageprefix + epfieldname).val(epfield.value);
                    }
                } else if (epfield.io === "o") {
                    $(containerHash)
                        .append($('<div/>', {
                                class: "ui-field-contain",
                                width: "95%"
                            })
                            .append($('<label/>', {
                                for: pageprefix + epfieldname,
                                text: epfield.title
                            }))
                            .append($("<span/>", {
                                id: pageprefix + epfieldname,
                                name: epfieldname,
                                class: "uietext" + " " + epfield.customclasses,
                                bctype: bctype,
                                "data-mini": true
                            }))
                            .append($("<span/>", {
                                html: "&nbsp;"
                            }))
                        );
                } else if (epfield.type === "string" && epfield.class === "uietext") {
                    var uietype = "text";
                    if (epfield.customclasses.indexOf("password") >= 0) {
                        uietype = "password";
                    }
                    if (epfield.title.trim().length > 0) {
                        $(containerHash)
                            .append($('<div/>', {
                                    class: "ui-field-contain",
                                    width: "95%"
                                })
                                .append($('<label/>', {
                                    for: pageprefix + epfieldname,
                                    text: epfield.title
                                }))
                                .append($("<input/>", {
                                    id: pageprefix + epfieldname,
                                    name: epfieldname,
                                    class: "uietext" + " " + epfield.customclasses,
                                    bctype: bctype,
                                    type: uietype,
                                    "data-mini": true
                                }))
                            );
                    } else {
                        $(containerHash)
                            .append($('<div/>', {
                                    class: "ui-field-contain",
                                    width: "95%"
                                })
                                .append($("<input/>", {
                                    id: pageprefix + epfieldname,
                                    name: epfieldname,
                                    class: "uietext" + " " + epfield.customclasses,
                                    bctype: bctype,
                                    type: uietype,
                                    "data-mini": true
                                }))
                            );
                    }
                    if (typeof epfield.maxlength !== "undefined" && !isNaN(epfield.maxlength)) {
                        $("#" + pageprefix + epfieldname).attr("maxLength", epfield.maxlength);
                    }
                    if (typeof epfield.size !== "undefined" && !isNaN(epfield.size)) {
                        $("#" + pageprefix + epfieldname).attr("size", epfield.size);
                    }
                    if (typeof epfield.width !== "undefined" && epfield.width.length > 0) {
                        $("#" + pageprefix + epfieldname).css("width", epfield.width);
                    }
                } else if (epfield.type === "string" && epfield.class === "uiearea") {
                    var rows = epfield.rows || 5;
                    var cols = epfield.cols || 50;
                    if (epfield.title.trim().length > 0) {
                        $(containerHash)
                            .append($('<div/>', {
                                    class: "ui-field-contain",
                                    width: "95%"
                                })
                                .append($('<label/>', {
                                    for: pageprefix + epfieldname,
                                    text: epfield.title
                                }))
                                .append($("<textarea/>", {
                                    id: pageprefix + epfieldname,
                                    name: epfieldname,
                                    class: "uiearea" + " " + epfield.customclasses,
                                    bctype: bctype,
                                    type: epfield.type,
                                    rows: rows,
                                    cols: cols,
                                    "data-mini": true
                                }))
                            );
                    } else {
                        $(containerHash)
                            .append($('<div/>', {
                                    class: "ui-field-contain",
                                    width: "95%"
                                })
                                .append($("<textarea/>", {
                                    id: pageprefix + epfieldname,
                                    name: epfieldname,
                                    class: "uiearea" + " " + epfield.customclasses,
                                    bctype: bctype,
                                    type: epfield.type,
                                    rows: rows,
                                    cols: cols,
                                    "data-mini": true
                                }))
                            );
                    }
                    if (typeof epfield.maxlength !== "undefined" && !isNaN(epfield.maxlength)) {
                        $("#" + pageprefix + epfieldname).attr("maxLength", epfield.maxlength);
                    }
                } else if (epfield.type === "string" && epfield.class === "uiecurrency") {
                    /**
                     * currency
                     */
                    $(containerHash)
                        .append($('<div/>', {
                                class: "ui-field-contain",
                                width: "95%"
                            })
                            .append($('<label/>', {
                                for: pageprefix + epfieldname,
                                text: epfield.title
                            }))
                            .append($("<input/>", {
                                id: pageprefix + epfieldname,
                                name: epfieldname,
                                type: "text",
                                class: "uiecurrency" + " " + epfield.customclasses,
                                "data-mini": true
                            }))
                        );
                } else if (epfield.type === "string" && epfield.class === "uiedate") {
                    /**
                     * date
                     */
                    $(containerHash)
                        .append($('<div/>', {
                                class: "ui-field-contain",
                                width: "95%"
                            })
                            .append($('<label/>', {
                                for: pageprefix + epfieldname,
                                text: epfield.title
                            }))
                            .append($("<input/>", {
                                id: pageprefix + epfieldname,
                                name: epfieldname,
                                type: "text",
                                class: "uiedate" + " " + epfield.customclasses,
                                "data-mini": true
                            }))
                        );
                    // DELAYED $('#' + pageprefix + epfieldname).datepicker();
                } else if (epfield.type === "string" && epfield.class === "uiecheckbox") {
                    /**
                     * checkbox
                     */
                    $(containerHash)
                        .append($('<div/>', {
                                class: "ui-field-contain",
                                width: "95%"
                            })
                            .append($('<label/>', {
                                for: pageprefix + epfieldname,
                                text: epfield.title
                            }))
                            .append($("<input/>", {
                                id: pageprefix + epfieldname,
                                name: epfieldname,
                                type: "checkbox",
                                class: "uiecheckbox" + " " + epfield.customclasses
                            }))
                        );
                } else if (epfield.type === "string" && epfield.class === "uieradio") {
                    /**
                     * radio-buttons - muss enum haben!!!
                     */
                    $(containerHash)
                        .append($('<fieldset/>', {
                                id: pageprefix + epfieldname,
                                class: "ui-field-contain"
                            })
                            .append($("<legend/>", {
                                text: epfield.title
                            }))
                        );
                    for (var ienu = 0; ienu < epfield.enum.length; ienu++) {
                        var radiovalue = "";
                        var radiotext = "";
                        if (typeof epfield.enum[ienu] === "string") {
                            radiovalue = epfield.enum[ienu];
                            radiotext = epfield.enum[ienu];
                        } else if (typeof epfield.enum[ienu] === "object") {
                            radiovalue = epfield.enum[ienu].value;
                            radiotext = epfield.enum[ienu].text;
                        }
                        $("#" + pageprefix + epfieldname)
                            .append($("<input/>", {
                                id: pageprefix + epfieldname + ienu,
                                name: epfieldname,
                                type: "radio",
                                value: epfield.enum[ienu],
                                class: "uieradio" + " " + epfield.customclasses,
                                "data-mini": true
                            }))
                            .append($('<label/>', {
                                for: pageprefix + epfieldname + ienu,
                                text: radiotext /* epfield.enum[ienu] */
                            }))
                            .append($("<br/>"));
                    }
                } else if (epfield.type === "string" && epfield.class === "uieselectinput") {
                    /**
                     * dynamische Eingabeunterstützung
                     */
                    $(containerHash)
                        .append($("<div/>", {
                                class: "ui-field-contain",
                                width: "95%"
                            })
                            .append($('<label/>', {
                                for: pageprefix + epfieldname,
                                text: epfield.title
                            }))
                            .append($("<input/>", {
                                id: pageprefix + epfieldname,
                                name: epfieldname,
                                type: "search",
                                class: "drop uieselectinput" + " " + epfield.customclasses,
                                list: pageprefix + epfieldname + "_list",
                                "data-clear-btn": "true",
                                "data-mini": true
                            }))
                            .append($("<datalist/>", {
                                    id: pageprefix + epfieldname + "_list"
                                })
                                /* hier folgen die option-Zuweisungen mit value */
                            )
                        );
                    // hier wäre eine Versorgungsfunktion gut - enumapi
                    if (typeof epfield.enumapi !== "undefined") {

                    }

                    if (typeof epfield.enum !== "undefined" && epfield.enum.length > 0) {
                        $("#" + pageprefix + epfieldname + "_list").empty();
                        if (typeof epfield.enum[0] === "object") {
                            for (var ienu = 0; ienu < epfield.enum.length; ienu++) {
                                $("#" + pageprefix + epfieldname + "_list")
                                    .append($("<option/>", {
                                        html: epfield.enum[ienu].text,
                                        value: epfield.enum[ienu].value
                                    }));
                            }
                        } else {
                            for (var ienu = 0; ienu < epfield.enum.length; ienu++) {
                                $("#" + pageprefix + epfieldname + "_list")
                                    .append($("<option/>", {
                                        html: epfield.enum[ienu],
                                        value: epfield.enum[ienu]
                                    }));

                            }
                        }
                    } else {
                        $("#" + pageprefix + epfieldname + "_list").empty();
                        // AJAX am Schluss mit async-Konstruktion auf einen Schlag
                        if (typeof epfield.cfekeytype !== "undefined" && epfield.cfekeytype.trim().length > 0) {
                            if (typeof ajax4options[epfieldname] === "undefined") {
                                ajax4options[epfieldname] = [];
                            }
                            var neu = {
                                containerID: pageprefix + epfieldname + "_list",
                                cfekeytype: epfield.cfekeytype
                            };
                            ajax4options[epfieldname].push(neu);
                        } else {
                            if (typeof ajax4options[epfieldname] === "undefined") {
                                ajax4options[epfieldname] = [];
                            }
                            ajax4options[epfieldname].push({
                                containerID: pageprefix + epfieldname + "_list"
                            });
                        }
                    }




                } else if (epfield.type === "array" || epfield.class === "uietable") {
                    $(containerHash)
                        .append($("<div/>", {
                                class: "ui-field-contain"
                            })
                            .append($("<table/>", {
                                    id: pageprefix + epfieldname,
                                    name: epfieldname,
                                    "data-role": "none",
                                    width: "98%",
                                    css: {
                                        position: "relative",
                                        float: "left",
                                        "table-layout": "fixed"
                                    }
                                })
                                .append($("<thead/>"))
                                .append($("<tbody/>"))
                            )
                        );
                    var showfirst = 0;
                    if (typeof epfield.showfirst !== "undefined" && epfield.showfirst > 0) {
                        showfirst = epfield.showfirst;
                    }
                    uientry.getArrayUI(bctype, epfield, pageprefix, pageprefix + epfieldname);

                } else if (epfield.type === "object" && epfield.class === "uiefieldset") {
                    // width prüfen
                    var wdiv = epfield.width || "98%";
                    $(containerHash)
                        .append($("<fieldset/>", {
                                id: pageprefix + epfieldname + "div",
                                name: epfieldname,
                                "data-role": "none",
                                width: wdiv,
                                css: {
                                    position: "relative",
                                    float: "left",
                                    border: "solid 3px #21376c",
                                    "margin-left": "10px",
                                    "margin-bottom": "10px",
                                    padding: "15px"
                                }
                            })
                            .append($("<legend/>", {
                                text: epfield.title
                            }))
                        );
                    // tricky span verschieben in die Border
                    var w = $("#" + pageprefix + epfieldname + "div" + " h4").outerWidth();
                    $("#" + pageprefix + epfieldname + "div" + " h4").css({
                        background: "white none repeat scroll 0 0",
                        "margin-top": "-25px",
                        width: w,
                        visibility: "visible"
                    });
                    // hier wäre eine Rekursion ideal, weil nichts weiter notwendig ist
                    uientry.getSchemaUIX(bctype, epfield, pageprefix, pageprefix + epfieldname + "div", false, function (ret) {
                        return;
                    });


                } else if (epfield.type === "object" || epfield.class === "uiediv") {
                    /*
                            $("#" + pageprefix + "tmp").empty();
                            $("#" + pageprefix + "tmp")
                                .append($("<h3/>",{
                                    text: epfield.title
                                }));

                            var w = $("#" + pageprefix + "tmp" + " h3:first").outerWidth();
                            */
                    if (typeof epfield.customclasses !== "undefined" && epfield.customclasses.indexOf("col1of1") >= 0 && epfield.customclasses.indexOf("separator") >= 0) {
                        $(containerHash)
                            .append($("<div/>", {
                                id: pageprefix + epfieldname + "div",
                                name: epfieldname,
                                class: epfield.customclasses,
                                "data-role": "none",
                                height: "1px"
                            }));
                        continue;
                    }
                    var wdiv = epfield.width || "98%";
                    var hdiv = epfield.height || "auto";
                    $(containerHash)
                        .append($("<div/>", {
                                id: pageprefix + epfieldname + "div",
                                class: "uiediv " + epfield.customclasses,
                                name: epfieldname,
                                "data-role": "none",
                                /* width: "98%", */
                                width: wdiv,
                                height: hdiv,
                                css: {
                                    position: "relative",
                                    float: "left",
                                    "margin-left": "10px",
                                    "margin-bottom": "10px",
                                    padding: "15px"
                                }
                            })

                            .append($("<div/>", {
                                css: {
                                    position: "absolute",
                                    visibility: "hidden",
                                    display: "block",
                                    "left-margin": 5,
                                    "right-margin": 5
                                },
                                text: epfield.title
                            }))
                        );
                    // tricky span verschieben in die Border
                    var w = $("#" + pageprefix + epfieldname + "div" + " h4").outerWidth();
                    $("#" + pageprefix + epfieldname + "div" + " h4").css({
                        background: "white none repeat scroll 0 0",
                        "margin-top": "-25px",
                        width: w,
                        visibility: "visible"
                    });
                    // hier wäre eine Rekursion ideal, weil nichts weiter notwendig ist
                    uientry.getSchemaUIX(bctype, epfield, pageprefix, pageprefix + epfieldname + "div", false, function (ret) {
                        return;
                    });

                } else {
                    /**
                     * default ist text
                     */
                    $(containerHash)
                        .append($('<div/>', {
                                class: "ui-field-contain",
                                width: "95%"
                            })
                            .append($('<label/>', {
                                for: pageprefix + epfieldname,
                                text: epfield.title
                            }))
                            .append($("<input/>", {
                                id: pageprefix + epfieldname,
                                name: epfieldname,
                                class: "uietext" + " " + epfield.customclasses,
                                bctype: bctype,
                                type: "text",
                                "data-mini": true
                            }))
                        );
                }
            }
        }
        /**
         * asynchrone Nachbearbeitung
         * zu name wird in enum label und value in eine option gepackt sowie der Zielcontainer
         */
        async.waterfall([
                function (callback) {
                    // ajaxstring abarbeiten
                    if (Object.keys(ajax4options).length > 0) {
                        var ajaxstring = JSON.stringify(ajax4options);
                        var jqxhr = $.ajax({
                            method: "POST",
                            crossDomain: false,
                            url: sysbase.getServer("getoptions"),
                            data: {
                                ajaxstring: ajaxstring
                            }
                        }).done(function (r1) {
                            sysbase.checkSessionLogin(r1);
                            // console.log("getoptions:" + r1);
                            var j1 = JSON.parse(r1);
                            sysbase.putMessage("Datalist, Länge:" + r1.length, 3);
                            callback(null, j1);
                            return;
                        }).fail(function (err) {
                            console.log("getoptions:" + err.message);
                            //myInfo.server = null;
                            //myInfo.servermessage = err.message;
                            //uihelper.setSystemInfo(myInfo);
                            sysbase.putMessage("getoptions:" + err.message, 3);
                            callback(null, {
                                error: true,
                                message: "getoptions-ERROR:" + err.message
                            });
                            return;
                        }).always(function () {
                            // nope
                        });
                    } else {
                        callback(null, null);
                        return;
                    }
                },
                function (ret, callback) {
                    if (ret !== null) {
                        callback(null, {
                            error: false,
                            message: "",
                            superoptions: ret.superoptions
                        });
                    } else {
                        callback(null, {
                            error: false,
                            message: "",
                            superoptions: {}
                        });
                    }
                    return;
                }
            ],
            function (err, data) {
                //$(containerHash).enhanceWithin();
                if (err !== null) {
                    supercallback({
                        error: true,
                        message: err.message
                    });
                    return;
                } else {
                    supercallback({
                        error: false,
                        message: "OK",
                        superoptions: data.superoptions
                    });
                    return;
                }
            }
        );

    };

    /**
     * Spezielle UI generierung für arrays mit/ohne Daten
     * die table an sich mit thead und tbody kommt oben
     * es sind tr und th sowie tr und td zu ergänzen
     * strukturen sind in sich unproblematisch
     * schema bezieht sich auf die items
     * containerID bezieht sich auf table mit thead und tbody
     */

    uientry.getArrayUI = function (bctype, arrayfield, pageprefix, containerID) {
        var epfields = arrayfield.items;
        var showfirst = 0;
        if (typeof arrayfield.showfirst !== "undefined" && arrayfield.showfirst > 0) {
            showfirst = arrayfield.showfirst;
        }
        var showaddicon = false;
        if (typeof arrayfield.showaddicon !== "undefined") {
            showaddicon = arrayfield.showaddicon;
        }
        var showdeleteicon = false;
        if (typeof arrayfield.showdeleteicon !== "undefined") {
            showdeleteicon = arrayfield.showdeleteicon;
        }
        var showreactivateicon = false;
        if (typeof arrayfield.showreactivateicon !== "undefined") {
            showreactivateicon = arrayfield.showreactivateicon;
        }
        var showrefreshicon = false;
        if (typeof arrayfield.showrefreshicon !== "undefined") {
            showrefreshicon = arrayfield.showrefreshicon;
        }
        var tablerowinput = false;
        if (typeof arrayfield.tablerowinput !== "undefined") {
            tablerowinput = arrayfield.tablerowinput;
        }

        /*
        io: "h",
        title: "Schlüssel",
        description: "",
        type: "string", // currency, integer, datum, text, key
        class: "uiecurrency",
        default: ""
        */

        var containerHash = "#" + containerID;
        $(containerHash + " thead").empty();
        $(containerHash + " tbody").empty();
        for (var irow = 0; irow < epfields.length; irow++) {
            $(containerHash + " thead")
                .append($("<tr/>"));
            $(containerHash + " tbody")
                .append($("<tr/>", {
                        css: {
                            display: "none"
                        }
                    })
                    .append($("<input/>", {
                        type: "hidden",
                        name: "isactive",
                        value: "true"
                    }))
                );
            // id in td ist nicht unique bei mehreren tr,
            // daher: Verzicht und nur mit name arbeiten
            // und     id: pageprefix + epfieldname, entfernt
            var epfieldstruct = epfields[irow];
            for (var epfieldname in epfieldstruct) {
                if (epfieldstruct.hasOwnProperty(epfieldname)) {
                    var epfield = epfieldstruct[epfieldname];
                    if (typeof epfield.customclasses === "undefined") {
                        epfield.customclasses = "";
                    }
                    if (epfield.io === "h") {
                        $(containerHash + " tbody tr")
                            .append($("<input/>", {
                                name: epfieldname,
                                class: "uietext" + " " + epfield.customclasses,
                                bctype: bctype,
                                type: "hidden",
                            }));
                        if (typeof epfield.value !== "undefined") {
                            $("#" + pageprefix + epfieldname).val(epfield.value);
                        }
                    } else if (epfield.io === "o") {
                        if (typeof epfield.width !== "undefined") {
                            $(containerHash + " thead tr")
                                .append($("<th/>", {
                                    width: epfield.width,
                                    html: epfield.title
                                }));
                        } else {
                            $(containerHash + " thead tr")
                                .append($("<th/>", {
                                    html: epfield.title
                                }));
                        }
                        $(containerHash + " tbody tr")
                            .append($("<td/>")
                                .append($("<span/>", {
                                    name: epfieldname,
                                    class: "uietext" + " " + epfield.customclasses,
                                    bctype: bctype
                                }))
                            );

                    } else {
                        if (typeof epfield.width !== "undefined") {
                            $(containerHash + " thead tr")
                                .append($("<th/>", {
                                    width: epfield.width,
                                    html: epfield.title
                                }));
                        } else {
                            $(containerHash + " thead tr")
                                .append($("<th/>", {
                                    html: epfield.title
                                }));
                        }
                        /**
                         * hier noch Variation nach class
                         */
                        if (epfield.type === "string" && epfield.class === "uietext") {
                            var uietype = "text";
                            if (epfield.customclasses.indexOf("password") >= 0) {
                                uietype = "password";
                            }
                            $(containerHash + " tbody tr")
                                .append($('<td/>', {})
                                    .append($("<input/>", {
                                        name: epfieldname,
                                        id: epfieldname,
                                        class: "uietext" + " " + epfield.customclasses,
                                        bctype: bctype,
                                        type: uietype,
                                        "data-mini": true
                                    }))
                                );
                            if (typeof epfield.width !== "undefined")
                                $("#" + pageprefix + epfieldname).parent().width(epfield.width);
                            if (typeof epfield.size !== "undefined" && !isNaN(epfield.size)) {
                                $("input:last").attr("size", epfield.size);
                            }
                        } else if (epfield.type === "string" && epfield.class === "uiecurrency") {
                            $(containerHash + " tbody tr")
                                .append($('<td/>', {})
                                    .append($("<input/>", {
                                        name: epfieldname,
                                        class: "uiecurrency" + " " + epfield.customclasses,
                                        bctype: bctype,
                                        type: "text",
                                        "data-mini": true
                                    }))
                                );
                            if (typeof epfield.width !== "undefined")
                                $("#" + pageprefix + epfieldname).parent().width(epfield.width);
                        } else if (epfield.type === "string" && epfield.class === "uieiban") {
                            $(containerHash + " tbody tr")
                                .append($('<td/>', {})
                                    .append($("<input/>", {
                                        name: epfieldname,
                                        class: "uieiban" + " " + epfield.customclasses,
                                        bctype: bctype,
                                        type: "text",
                                        "data-mini": true
                                    }))
                                );
                            if (typeof epfield.width !== "undefined")
                                $("#" + pageprefix + epfieldname).parent().width(epfield.width);

                        } else if (epfield.type === "string" && epfield.class === "uiecheckbox") {
                            /**
                             * checkbox
                             */
                            $(containerHash + " tbody tr")
                                .append($('<td/>', {
                                        css: {
                                            "text-align": "center",
                                            "vertical-align": "middle"
                                        }
                                    })
                                    .append($("<input/>", {
                                        name: epfieldname,
                                        type: "checkbox",
                                        class: "uiecheckbox" + " " + epfield.customclasses,
                                        "data-mini": true
                                    }))
                                );
                        } else if (epfield.type === "string" && epfield.class === "uieradio") {
                            /**
                             * radio-buttons - muss enum haben!!!
                             */
                            $(containerHash + " tbody tr")
                                .append($('<td/>', {
                                    css: {
                                        "text-align": "center",
                                        "vertical-align": "middle"
                                    }
                                }));
                            for (var ienu = 0; ienu < epfield.enum.length; ienu++) {
                                $(containerHash + " tbody tr td:last")
                                    .append($('<div/>', {
                                            class: "ui-field-contain",
                                            width: "95%"
                                        })
                                        .append($("<input/>", {
                                            id: pageprefix + epfieldname + ienu,
                                            name: epfieldname,
                                            type: "radio",
                                            value: epfield.enum[ienu],
                                            class: "uieradio" + " " + epfield.customclasses,
                                            "data-mini": true
                                        }))
                                        .append($('<label/>', {
                                            for: pageprefix + epfieldname + ienu,
                                            text: epfield.enum[ienu]
                                        }))
                                    );
                            }


                        } else if (epfield.type === "string" && epfield.class === "uieselectinput") {
                            /**
                             * dynamische Eingabeunterstützung
                             */
                            $(containerHash + " tbody tr")
                                .append($('<td/>', {})
                                    .append($("<input/>", {
                                        name: epfieldname,
                                        type: "search",
                                        /* "data-role": "none", */
                                        class: "drop uieselectinput" + " " + epfield.customclasses,
                                        list: pageprefix + epfieldname + "_list",
                                        "data-clear-btn": "true",
                                        "data-mini": true
                                    }))
                                );
                            /**
                             * die datalist muss nur einmal angelegt werden und kann reused werden!!!
                             * es werden u.U. zwei angelegt, wenn input einzeln und input in Tabelle
                             * vorhanden sind, hier mit _list als suffix zu prüfen!!!
                             * wird an active page gehängt
                             * $.mobile.activePage.attr('id') - vorher, nicht mehr für 1.4.5 empfohlen
                             */
                            // var aid = $.mobile.activePage[0].id;
                            var aid = $(".content").find("div").prop("id");
                            var actpagehash = "#" + aid;
                            var datalistid = "#" + pageprefix + epfieldname + "_list";
                            //if ($(actpagehash).find("[id=" + datalistid + "]").length > 0) {
                            if ($(datalistid).length > 0) {
                                // nichts machen
                            } else {
                                $(actpagehash)
                                    .append($("<datalist/>", {
                                        id: pageprefix + epfieldname + "_list"
                                    }));
                                if (typeof epfield.enum !== "undefined" && epfield.enum.length > 0) {
                                    $("#" + pageprefix + epfieldname + "_list").empty();
                                    for (var ienu = 0; ienu < epfield.enum.length; ienu++) {
                                        if (typeof epfield.enum[ienu] === "object") {
                                            $("#" + pageprefix + epfieldname + "_list")
                                                .append($("<option/>", {
                                                    html: epfield.enum[ienu].text,
                                                    value: epfield.enum[ienu].value
                                                }));
                                        } else {
                                            $("#" + pageprefix + epfieldname + "_list")
                                                .append($("<option/>", {
                                                    html: epfield.enum[ienu],
                                                    value: epfield.enum[ienu]
                                                }));
                                        }
                                    }
                                } else {
                                    $("#" + pageprefix + epfieldname + "_list").empty();
                                    // AJAX am Schluss mit async-Konstruktion auf einen Schlag
                                    if (typeof epfield.cfekeytype !== "undefined" && epfield.cfekeytype.trim().length > 0) {
                                        var neu = {
                                            containerID: pageprefix + epfieldname + "_list",
                                            cfekeytype: epfield.cfekeytype
                                        };
                                        if (typeof ajax4options[epfieldname] === "undefined") {
                                            ajax4options[epfieldname] = [];
                                            ajax4options[epfieldname][0] = neu;
                                        } else {
                                            ajax4options[epfieldname].push(neu);
                                        }
                                    } else {
                                        if (typeof ajax4options[epfieldname] === "undefined") {
                                            ajax4options[epfieldname] = [];
                                        }
                                        ajax4options[epfieldname].push({
                                            containerID: pageprefix + epfieldname + "_list"
                                        });
                                    }
                                }
                            }

                            if (typeof epfield.maxlength !== "undefined" && !isNaN(epfield.maxlength)) {
                                $("#" + pageprefix + epfieldname).attr("maxLength", epfield.maxlength);
                            }
                            if (typeof epfield.width !== "undefined")
                                $("#" + pageprefix + epfieldname).parent().width(epfield.width);
                        }
                    }
                }
            } // hier showfirst-Spalte
            /**
             * showfirst, showaddicon, showdeleteicon
             */
            $(containerHash + " thead tr")
                .append($("<th/>", {
                    html: "Aktion"
                }));
            var action = $(containerHash + " tbody tr")
                .append($('<td/>', {
                    align: "center",
                    name: "action",
                    html: "&nbsp;"
                }));


            if (tablerowinput === true) {
                var iclass = "ui-btn ui--shadow ui-mini ui-corner-all ui-btn-icon-notext";
                iclass += " ui-icon-check chgUITableRow";
                //<span style="float:right">
                $(containerHash + " tbody tr td:last")
                    .append($('<a/>', {
                            "data-mini": "true",
                            href: "#",
                            name: "chgicon",
                            title: "Ändern",
                            class: iclass,
                            css: {
                                float: "left",
                                "margin": "10px"
                            }
                        })
                        .append($("<img/>", {
                            src: "images/icons-png/check-black.png"
                        }))
                    );
            }

            if (showaddicon === true) {
                var aclass = "ui-btn ui--shadow ui-mini ui-corner-all ui-btn-icon-notext ui-icon-plus";
                aclass += " ui-icon-plus addUITableRow";
                $(containerHash + " tbody tr td:last")
                    .append($('<a/>', {
                            "data-mini": "true",
                            href: "#",
                            name: "addicon",
                            title: "Neue Zeile",
                            class: aclass,
                            css: {
                                float: "left",
                                "margin": "10px"
                            }
                        })
                        .append($("<img/>", {
                            src: "images/icons-png/plus-black.png"
                        }))
                    );
            }
            if (showdeleteicon === true) {
                var dclass = "ui-btn ui--shadow ui-mini ui-corner-all ui-btn-icon-notext";
                dclass += " ui-icon-delete delUITableRow";
                //<span style="float:right">
                $(containerHash + " tbody tr td:last")
                    .append($('<a/>', {
                            "data-mini": "true",
                            href: "#",
                            name: "delicon",
                            title: "Zeile löschen",
                            class: dclass,
                            css: {
                                float: "left",
                                margin: "10px"
                            }
                        })
                        .append($("<img/>", {
                            src: "images/icons-png/delete-black.png"
                        }))
                    );
            }
            if (showreactivateicon === true) {
                var rclass = "ui-btn ui--shadow ui-mini ui-corner-all ui-btn-icon-notext";
                rclass += " ui-icon-recycle recUITableRow";
                //<span style="float:right">
                $(containerHash + " tbody tr td:last")
                    .append($('<a/>', {
                            "data-mini": "true",
                            href: "#",
                            name: "recicon",
                            title: "Zeile reaktivieren",
                            class: rclass,
                            css: {
                                float: "left",
                                display: "none",
                                margin: "10px"
                            }
                        })
                        .append($("<img/>", {
                            src: "images/icons-png/recycle-black.png"
                        }))
                    );
            }
            if (showrefreshicon === true) {
                var fclass = "ui-btn ui--shadow ui-mini ui-corner-all ui-btn-icon-notext";
                fclass += " ui-icon-refresh refUITable";
                //<span style="float:right">
                $(containerHash + " tbody tr td:last")
                    .append($('<a/>', {
                            "data-mini": "true",
                            href: "#",
                            name: "reficon",
                            title: "Neue Selektion",
                            class: fclass,
                            css: {
                                float: "left",
                                margin: "10px"
                            }
                        })
                        .append($("<img/>", {
                            src: "images/icons-png/refresh-black.png"
                        }))
                    );
            }




            if (showfirst > 0) {
                // hier muss später etwas passieren
            }
        }
        // hier wird die unsichtbare Zeile als Eingabezeile kopiert
        var newcontainer = $(containerHash).find(" tbody tr:first").clone().appendTo($(containerHash).find("tbody")).show();

    };

    /**
     * Die UI-Inhalte werden nach record übernommen,
     * schema wird "zur Sicherheit" schon mal mitgegeben,
     * aber noch nicht angewendet
     * @param {*} containerID
     * @param {*} record
     * returns record
     */
    uientry.fromUI2Record = function (xcontainerID, record, schema) {
        var containerID = xcontainerID;
        if (typeof xcontainerID === "object") {
            containerID = $(xcontainerID).attr("id");
        }
        var suchstr = "";
        suchstr += containerID + " div,";
        suchstr += containerID + " table,";
        suchstr += containerID + " tr,";
        suchstr += containerID + " input,";
        suchstr += containerID + " select,";
        suchstr += containerID + " span,";
        suchstr += containerID + " textarea";
        $(suchstr).each(function (key, value) {
            //console.log(this.tagName + "/" + this.type + ":" + this.name + " key:" + key +  "/" + this.value + " index:" + this.index);
            var msg = "";
            var vektor = [];
            var found = false;
            if (typeof this.name !== "undefined" && (this.tagName === "TEXTAREA" || this.tagName === "textarea")) {
                msg += " type:" + this.type;
                msg += " value:" + this.value;

                found = true;
                vektor.push({
                    name: this.name,
                    value: this.value,
                    tagName: this.tagName,
                    type: this.type
                });
            } else if (typeof this.name !== "undefined" && (this.tagName === "INPUT" || this.tagName === "SELECT")) {
                msg += " type:" + this.type;
                msg += " value:" + this.value;
                if (this.type === "checkbox") {
                    msg += " checkbox";
                    if ($(this).prop("checked") === true) {
                        found = true;
                        vektor.push({
                            name: this.name,
                            value: true,
                            tagName: this.tagName,
                            type: this.type
                        });
                    } else if ($(this).parent().find("label[for=" + $(this).attr("id") + "]").hasClass("ui-checkbox-on")) {
                        found = true;
                        vektor.push({
                            name: this.name,
                            value: true,
                            tagName: this.tagName,
                            type: this.type
                        });
                    } else if ($(this).parent().find("label[for=" + $(this).attr("id") + "]").hasClass("ui-checkbox-off")) {
                        found = true;
                        vektor.push({
                            name: this.name,
                            value: false,
                            tagName: this.tagName,
                            type: this.type
                        });
                    } else {
                        /**
                         * hier fehlt der Wrapper des label, daher explizite Abfrage
                         */
                        found = true;
                        if ($(this).checked === true) {
                            vektor.push({
                                name: this.name,
                                value: true,
                                tagName: this.tagName,
                                type: this.type
                            });


                        } else {
                            vektor.push({
                                name: this.name,
                                value: false,
                                tagName: this.tagName,
                                type: this.type
                            });
                        }

                    }
                } else if (this.type === "radio") {
                    msg += " radio";
                    var parentHash = "#" + $(this).parent().attr("id");
                    var myidhash = "#" + $(this).attr("id");
                    if (myidhash.endsWith("0")) {
                        var myname = $(this).attr("name");
                        //var gtyp = $(parentHash).find("[name='" + myidhash.substr(1) + "gtyp']:checked").val();
                        var radiovalue = $(parentHash).find("[name='" + myname + "']:checked").val();
                        found = true;
                        vektor.push({
                            name: this.name,
                            value: radiovalue,
                            tagName: this.tagName,
                            type: this.type
                        });
                    }
                } else {
                    found = true;
                    vektor.push({
                        name: this.name,
                        value: this.value,
                        tagName: this.tagName,
                        type: this.type
                    });
                }
            } else if (this.tagName === "SPAN" && typeof ($(this).attr("name")) !== "undefined") {
                // &nbsp; prüfen und rücksetzen auf Leerstring
                if (this.textContent === "&nbsp;") {
                    this.textContent = "";
                }
                msg += " type:" + this.type;
                msg += " value:" + this.textContent;
                found = true;
                vektor.push({
                    name: $(this).attr("name"),
                    value: this.textContent,
                    tagName: this.tagName,
                    type: "text"
                });
            }


            if (found === true) {

                var pars = $(this).parentsUntil(containerID);
                $(pars).each(function (key, value) {
                    msg += " Parent:" + this.tagName;
                    if (typeof $(this).attr("name") !== "undefined") {
                        msg += "=>" + $(this).attr("name");
                        vektor.push({
                            name: $(this).attr("name"),
                            tagName: this.tagName,
                        });
                    } else {
                        if (this.tagName === "TR") {
                            var index = $('tr', $(this).closest("table")).index(this);
                            vektor.push({
                                name: "[" + index + "]",
                                tagName: this.tagName,
                            });
                        }
                    }
                    if (typeof this.value !== "undefined") {
                        msg += "=>" + this.value;
                    }
                });
                // die Elemente müssen von oben nach unten ausgewertet werden
                vektor.reverse();
                var rname = "";
                var lastvalue = null;
                var isarr = false;
                var target = {};
                var path = "";
                for (var i = 0, len = vektor.length; i < len; i++) {
                    var name = vektor[i].name;
                    if (path.length > 0) path += ".";
                    path += name;
                    if (typeof vektor[i].value !== "undefined") {
                        lastvalue = vektor[i].value;
                    }
                }
                if (path.trim().length > 1 && lastvalue !== null) {
                    setDeepValue(target, lastvalue, path);
                    record = $.extend(true, record, target);
                }
            }
        });
        // Arrays säubern von null-Elementen -
        // Problem, dass eine Zeile gelöscht wird beim Füllen mit Mustersatz
        // in der ersten Zeile
        record = cleanArrays(record);
        return record;
    };

    uientry.fromRecord2UI = function (container, record, schema) {
        /**
         * container bezieht sich auf DOM und ist jQuery-Objekt
         * record kann auch ein Ausschnitt sein, bei CFEPOOL ist das data
         * schema - muss nicht unbedingt
         * je Array gibt es in html-table eine leerzeile, diese wird verwendet
         */
        resmsg = "";
        var tablerowinput = false;
        if (typeof schema.tablerowinput !== "undefined") {
            tablerowinput = schema.tablerowinput;
        }
        iterateJSON2DOM(container, record, schema);
        // Position des Focus
        $(':input:enabled:visible:not([readonly]):first').focus().select();

    };

    function iterateJSON2DOM(container, obj, schema) {
        // schema wird hier nicht wirklich genutzt, es müsste sonst rekursiv verfeinert werden,
        // wie das auch für obj geschieht, es ist also auf das UI zuzugreifen
        // dort müssen alle Felder vom Prinzip schon definiert sein, daher auch
        // der Trick mit Zeile 0 als Musterzeile in Arrays
        try {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] === "object") {
                        if (Array.isArray(obj[property])) {
                            // Übernahme zu Array-Zeile
                            // Loop über die Zeilen des Arrays
                            var tblcontainer = $(container).find("[name=" + property + "]");
                            for (var i = 0; i < obj[property].length; i++) {
                                var datarow = obj[property][i];
                                // erst mal die Null-Zeile clonen
                                // container muss das Array selbst sein
                                var newrow = $(tblcontainer).find(" tbody tr:first").clone().appendTo($(tblcontainer).find("tbody")).show();
                                /*
                                 $(newrow).find(".uieselectinput").textinput({
                                     clearBtn: true
                                   });
                                */
                                /*
                                $(newrow).find(".uieselectinput")
                                .append($("<a/>",{
                                     href: "#",
                                     tabindex:"-1",
                                     "aria-hidden": "true",
                                     class: "ui-input-clear ui-btn ui-icon-delete ui-btn-icon-notext ui-corner-all ui-input-clear-hidden",
                                     title: "Clear text"
                                }));
                                */
                                iterateJSON2DOM(newrow, datarow, schema);
                                // jetzt die Zeile inaktiv setzen bei isactive=false
                                if (typeof datarow.isactive !== "undefined" && datarow.isactive === "false") {
                                    uientry.inactivaterow(newrow);
                                } else {
                                    // nicht ganz sauber, weil auf schema keine Rekursion erfolgt
                                    if (typeof schema[property] !== "undefined" && typeof schema[property].tablerowinput === "boolean" && schema[property].tablerowinput === true) {
                                        // nothing, Input-Felder bleiben
                                    } else {
                                        // sonst auf geschützt setzen
                                        // uientry.protectrow(newrow);
                                    }
                                }
                            }
                        } else {
                            // Struktur füllen
                            /*
                            target = $(container).find("[name=" + property + "]");
                            if ($(target).is("input")) {
                                $(target).val(obj[property]);
                            } else {
                                $(target).html(obj[property]);
                            }
                            */
                            target = $(container);
                            iterateJSON2DOM(target, obj[property], schema);
                        }
                    } else {
                        // normale Ausgabe
                        // Struktur füllen
                        target = $(container).find("[name=" + property + "]");
                        if ($(target).is("input")) {
                            if ($(target).attr("type") === "checkbox") {
                                if (obj[property] === "on" || obj[property] === true || obj[property] === "true") {
                                    //$(target).checkboxradio('refresh');
                                    //$(target).prop("checked", true).checkboxradio('refresh');
                                    $(target).prop("checked", true);
                                } else {
                                    //$(target).checkboxradio('refresh');
                                    //$(target).prop("checked", false).checkboxradio('refresh');
                                    $(target).prop("checked", false);
                                }
                            } else if ($(target).attr("type") === "radio") {

                                //var such = "input[name='" + myidhash.substr(1) + "gtyp'][value='" + myoptions.gtyp + "']";
                                //$(such).prop('checked', true);
                                // loop über die Optionen der radio-Optionen in enum, daraus index, der wird suffix
                                // id: pageprefix + epfieldname + ienu,
                                var radiovalue = obj[property];
                                $('input[name=' + property + ']').each(function () {
                                    //code
                                    //alert($(this).attr('name'));
                                    if ($(this).attr("value") === radiovalue) {
                                        $(this).prop('checked', true);
                                    } else {
                                        $(this).prop('checked', false);
                                    }
                                });
                            } else {
                                $(target).val(obj[property]);
                            }
                        } else if ($(target).is("span")) {
                            if (typeof obj[property] === "string" && obj[property].length === 0) {
                                $(target).html("&nbsp;");
                            } else {
                                $(target).html("" + obj[property]);
                            }
                        } else {
                            if ($(target).hasClass("dohtml")) {
                                $(target).html(obj[property]);
                            } else {
                                $(target).text(obj[property]);
                            }
                            $(target).show();
                        }
                    }
                }
            }
        } catch (err) {
            resmsg += "***ERROR***" + err;
            console.log("uientry 2UI:" + err.message + "=>" + err.stack);
        }
        return;
    }

    // https://stackoverflow.com/questions/13719593/how-to-set-object-property-of-object-property-of-given-its-string-name-in-ja

    function setDeepValue(obj, value, path) {
        if (typeof path === "string") {
            path = path.split('.');
        }
        if (path.length > 1) {
            var p = path.shift();
            if (p.startsWith("[")) {
                if (obj[p] == null || typeof obj[p] !== 'object') {
                    p = p.replace("[", "").replace("]", "");
                    obj[p] = {};
                }
            } else {
                if (path.length > 0 && path[0].startsWith("[")) {
                    if (obj[p] == null || typeof obj[p] !== 'object') {
                        obj[p] = [];
                    }
                } else {
                    if (obj[p] == null || typeof obj[p] !== 'object') {
                        obj[p] = {};
                    }
                }
            }
            setDeepValue(obj[p], value, path);
        } else {
            obj[path[0]] = value;
        }
    }

    /**
     * Löschen leerer Zeilen in Arrays
     */
    function cleanArrays(obj) {
        try {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] === "object") {
                        if (Array.isArray(obj[property])) {
                            // erstes Element darf nicht null sein
                            var arr = obj[property];
                            if (arr.length > 0) {
                                var ib = 0;
                                var lastia = arr.length;
                                for (var ia = 0; ia < lastia; ia++) {
                                    if (typeof arr[ib] === "undefined" || arr[ib] === null || arr[ib] === {}) {
                                        console.log("wird gelöscht=>" + ib + "==>" + JSON.stringify(arr[ib]));
                                        arr.splice(ib, 1);
                                    } else {
                                        var hasdata = false;
                                        for (var cell in arr[ib]) {
                                            if (arr[ib].hasOwnProperty(cell)) {
                                                if (cell !== "isactive") {
                                                    if (typeof arr[ib][cell] !== "object") {
                                                        var cellvalue = arr[ib][cell];
                                                        if (cellvalue !== "undefined" && cellvalue.length > 0) {
                                                            hasdata = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (hasdata === false) {
                                            console.log("wird gelöscht=>" + ib + "==>" + JSON.stringify(arr[ib]));
                                            arr.splice(ib, 1);
                                        } else {
                                            ib++;
                                        }
                                    }
                                }
                            }
                        }
                        cleanArrays(obj[property]);
                    }
                }
            }
            return obj;
        } catch (err) {
            return obj;
        }
    }

    /**
     * inputDialogX - baut Popup ohne jQuery Mobile auf und callback mit ret mit error, message und "record"
     * das input-form wird mit uientry gebildet, das Ergebnis als "record" zurückgegeben mit isConfirmed
     * zur Bestätigung oder Invalidierung
     * @param {*} container    - Container im Dom aus formalen Gründen
     * @param {*} position    - mit left und top als MUSS
     * @param {*} title         - Überschrift
     * @param {*} schema        - schema für uientry
     * @param {*} record        - record für uientry, Ausgangswerte
     * @param {*} callback        - callback
     * uientry.getSchemaUI("cfeKto120", schema, "cfeKto120", "cfeKto120entrypanel", function (ret) {
     * uientry.fromRecord2UI($("#cfeKto120entrypanel"), record, schema);
     * outrec = uientry.fromUI2Record("#cfeAdr700entrypanel", outrec, schema);
     * callback gibt ret zurück mit error, message und record mit den Eingabeergebnissen
     * Hinweis: erweiterte Lösung zu uihelper.confirmDialog
     */
    uientry.inputDialogX = function (container, position, title, schema, record, callback) {
        /**
         * Positionieren der Popup-Box
         * die popup-box kommt aus uientry und wird dann positionier
         * relativ zu anchorHash
         */
        var popupid = "popupD" + Math.floor((Math.random() * 90000) + 1);
        var popupHash = "#" + popupid;
        if (typeof container === "string" && !container.startsWith("#")) {
            container = "#" + container;
        }
        var w = $(container).outerWidth();

        var l = 0;
        var t = 0;
        var ww = $(window).width();
        if (typeof position === "undefined" || position === null || Object.keys(position).length === 0) {
            position = {};
            if (w > ww) {
                if (ww > 600) {
                    w = ww / 8 * 5;
                } else {
                    w = ww - 10;
                }
            }
            l = (ww - w) / 2 - 5;
            l = "" + l + "px";
            t = "50px";
        } else {
            l = position.left || "10px";
            t = position.top || "50px";
        }
        position.top = t;
        //width = 500;
        if ((l + w) > ww) l = "10px";
        position.left = l;
        if (typeof position.top === "undefined") {
            position.top = "50px";
        }
        $(container)
            .append($("<div/>", {
                    id: popupid,
                    legend: title,
                    title: title,
                    class: "uiepopup",
                    "z-order": 10000,
                    css: {
                        "min-width": "300px",
                        position: "absolute",
                        // "background-color": "white",
                        left: position.left || "10px",
                        top: position.top || "50px",
                        width: position.width || w + "px",
                        height: position.height || "300px",
                        "z-index": 1000,
                        overflow: "auto"
                    }
                })
                .append($('<div/>', {
                    css: {
                        "text-align": "center"
                    },
                    html: title
                }))
                .append($('<div/>', {
                    id: popupid + "form",
                    class: "uieform"
                }))
                .append($('<div/>', {
                        css: {
                            width: position.width || w + "px",
                            float: "left"
                        }
                    })
                    .append($("<button/>", {
                        href: "#",
                        class: "optionConfirm",
                        bschema: JSON.stringify(schema),
                        css: {
                            "margin-top": "10px",
                            "margin-left": "10px",
                            float: "left"
                        },
                        html: "OK",
                        click: function (econfirm) {
                            $(popupHash).hide();
                            var bschema = $(this).attr("bschema");
                            var schema = JSON.parse(bschema);
                            var record = {};
                            var result = uientry.fromUI2Record(popupHash, record, schema);

                            $(document).trigger('popupok', [JSON.stringify(result)]);

                            $(popupHash).remove();
                            return;
                        }
                    }))
                    .append($("<button/>", {
                        href: "#",
                        class: "optionCancel",
                        css: {
                            float: "left",
                            "margin-top": "10px",
                            "margin-left": "10px"
                        },
                        html: "Cancel",
                        click: function (ecancel) {
                            //$(popupHash).attr('data-confirmed', 'false');
                            //$(popupHash).popup("close");
                            $(popupHash).hide();
                            $(document).trigger('popupcancel');
                            $(popupHash).remove();
                            return;
                        }
                    }))
                )
            );
        // form vervollständigen
        // bctype, schema, pageprefix, containerID, callback
        uientry.getSchemaUI("pop", schema, popupid, popupid + "form", function (ret) {
            if (ret.error === false) {
                sysbase.putMessage("PopupForm" + " aufgebaut", 0);
                // post-processing wie "enhanceWithin"
                /*
                var l1 = $("#" + popupid + "form").position().left;
                var w1 = $("#" + popupid + "form").outerWidth();
                var w0 = $("#" + popupid + "form").parent().outerWidth();
                if ((l1 + w1) > w0) {
                    $("#" + popupid + "form").outerWidth(w0 - l1 - 10);
                }

                $("#" + popupid + "form>div").each(function (index, value) {
                    var tagName = $(this).prop("tagName");
                    if ($(this).prop("tagName") === "DIV" || $(this).prop("tagName") === "FIELDSET") {
                        var l1 = $(this).position().left;
                        var w1 = $(this).outerWidth();
                        var w0 = $(this).parent().outerWidth();
                        if ((l1 + w1) > w0) {
                            $(this).outerWidth(w0 - l1 - 20);
                        }
                    }
                });

                $("#" + popupid + "form>fieldset").each(function (index, value) {
                    var tagName = $(this).prop("tagName");
                    if ($(this).prop("tagName") === "DIV" || $(this).prop("tagName") === "FIELDSET") {
                        var l1 = $(this).position().left;
                        var w1 = $(this).outerWidth();
                        var w0 = $(this).parent().outerWidth();
                        if ((l1 + w1) > w0) {
                            $(this).outerWidth(w0 - l1 - 20);
                        }
                    }
                });
                */
            } else {
                sysbase.putMessage("PopupForm" + " NICHT aufgebaut", 3);
            }
            uientry.fromRecord2UI($("#" + popupid + "form"), record, schema);
            callback({
                error: false,
                message: "Dialog ok"
            });
        });
        /*
        uientry.getSchemaUI("pop", schema, popupid, popupid + "form", function (ret) {
            if (ret.error === false) {
                sysbase.putMessage("PopupForm" + " aufgebaut", 0);
            } else {
                sysbase.putMessage("PopupForm" + " NICHT aufgebaut", 3);
            }

            uientry.fromRecord2UI($("#popupform"), record, schema);
            console.log("popupform aufgebaut");
            var popupDialogObj = $(popupHash);
            popupDialogObj.popup();
            popupDialogObj.popup({
                afterclose: function (event, ui) {
                    popupDialogObj.find(".optionConfirm").first().off('click');
                    var isConfirmed = popupDialogObj.attr('data-confirmed') === 'true' ? true : false;
                    // Ergebniss in ret.record absetzen
                    var record = {};
                    var poprecord = uientry.fromUI2Record("#popupform", record, schema);
                    $(event.target).remove();
                    // hier isConfirmed umsetzen auf ret.error und ret.message
                    if (callback) {
                        if (isConfirmed === true) {
                            ret.error = false;
                            ret.message = "OK";
                            ret.record = poprecord;
                        } else {
                            ret.error = true;
                            ret.message = "Cancelled";
                        }
                        callback(ret);
                    }
                }
            });
            popupDialogObj.popup('open');
            return;
        });
        */

    };









    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = uientry;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return uientry;
        });
    } else {
        // included directly via <script> tag
        root.uientry = uientry;
    }
}());