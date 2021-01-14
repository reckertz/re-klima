/*global $,window,document,module,define,root,global,self,var,this,sysbase,uihelper */
(function () {
    'use strict';
    var kla9020fun = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla9020fun - Funktionen speziell für Klimaanalyse
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */

    var tempopt = {};
    var temparray = [];
    var tempint = [];
    var tempint5 = [{
            text: "blue-cyan",
            vont: -50,
            bist: -20,
            voncolor: [0, 0, 1],
            biscolor: [0, 1, 1]
        },
        {
            text: "cyan-green",
            vont: -20,
            bist: 0,
            voncolor: [0, 1, 1],
            biscolor: [0, 1, 0]
        },
        {
            text: "green-yellow",
            vont: 0,
            bist: 25,
            voncolor: [0, 1, 0],
            biscolor: [1, 1, 0]
        },
        {
            text: "yellow-red",
            vont: 25,
            bist: 50,
            voncolor: [1, 1, 0],
            biscolor: [1, 0, 0]
        }
    ];

    // Farbskala für Differenzen von Temperaturen
    var tempint6 = [{
            text: "blue-cyan",
            vont: -50,
            bist: 0,
            voncolor: [0, 0, 1],
            biscolor: [0, 1, 1]
        },
        {
            text: "yellow-red",
            vont: 0,
            bist: 50,
            voncolor: [1, 1, 0],
            biscolor: [1, 0, 0]
        }
    ];



    var tempint7 = [{
            text: "black-blue",
            vont: -50,
            bist: -20,
            voncolor: [0, 0, 0],
            biscolor: [0, 0, 1]
        },
        {
            text: "blue-cyan",
            vont: -20,
            bist: 0,
            voncolor: [0, 0, 1],
            biscolor: [0, 1, 1]
        },
        {
            text: "cyan-green",
            vont: 0,
            bist: 8,
            voncolor: [0, 1, 1],
            biscolor: [0, 1, 0]
        },
        {
            text: "green-yellow",
            vont: 8,
            bist: 25,
            voncolor: [0, 1, 0],
            biscolor: [1, 1, 0]
        },
        {
            text: "yellow-red",
            vont: 25,
            bist: 40,
            voncolor: [1, 1, 0],
            biscolor: [1, 0, 0]
        },
        {
            text: "red-white",
            vont: 40,
            bist: 50,
            voncolor: [1, 0, 0],
            biscolor: [1, 1, 1]
        }
    ];
    var heatmapparms = {};
    /**
     * getHeatmap - Heatmap aus Matrix erzeugen und nach Container ausgeben
     * 1. Prüfen der Daten in Matrix und Default-Setzungen oder Abbruch
     * 2. Dimensionsparameter auf 400*500-Matrix (maximal)
     *
     * @param {*} hcontainerid - wird flexibel gehandhabt
     * @param {*} hmatrix
     * @param {*} hoptions - Konfigurationsparameter minmax
     * @param {*} callback901
     * @returns
     */
    kla9020fun.getHeatmap = function (hcontainerid, heatmapsx, hmatrix, hoptions, callback901) {
        tempopt = {};
        if (typeof hoptions === "number") {
            var hmethod = hoptions;
            hoptions = {};
            hoptions.hmethod = hmethod;
        } else if (typeof hoptions !== "object") {
            hoptions = {};
        }
        hoptions.hmethod = hoptions.hmethod || 7;
        hoptions.cbuckets = hoptions.cbuckets || false;
        var hcwrapperid = "";
        var hccanvasid = "";
        if (typeof hcontainerid !== "string" || hcontainerid.length === 0) {
            callback901({
                error: true,
                message: "No containerid"
            });
            return;
        }
        if (hcontainerid.startsWith("#")) {
            hcontainerid = hcontainerid.substr(1);
        }
        var hctagname = document.getElementById(hcontainerid).tagName;
        if (hctagname === "CANVAS") {
            // hier ist alles in Ordnung
            hcwrapperid = document.getElementById(hcontainerid).parentNode.id;
            hccanvasid = hcontainerid;
        } else if (hctagname === "DIV") {
            hcwrapperid = hcontainerid;
            // wenn schon ein canvas da ist, dann neues Div daneben setzen
            if ($("#" + hcontainerid).find("canvas").length > 0) {
                var newrnd = "x" + Math.floor(Math.random() * 100000) + 1;
                $("#" + hcontainerid)
                    .css("float", "left");
                $("#" + hcontainerid)
                    .parent()
                    .append($("<div/>", {
                        id: hcontainerid + newrnd,
                        css: {
                            float: "left",
                            width: $("#" + hcontainerid).width(),
                            height: $("#" + hcontainerid).height()
                            /*
                            maxHeight: $("#" + hcontainerid).maxHeight(),
                            maxWidth: $("#" + hcontainerid).maxWidth()
                            */
                        }
                    }));
                hcwrapperid = hcontainerid + newrnd;
            }

            hccanvasid = "hcan" + Math.floor(Math.random() * 100000) + 1;
            $("#" + hcwrapperid)
                .append($("<canvas/>", {
                    id: hccanvasid,
                    css: {
                        border: "1px solid"
                    }
                }));
        }

        $("#" + hcwrapperid).addClass("doprintthis");
        $("#" + hcwrapperid).show();
        $("#" + hccanvasid).show();
        if (typeof hmatrix.data === "undefined" || !Array.isArray(hmatrix.data)) {
            callback901({
                error: true,
                message: "No Data-Array"
            });
            return;
        }
        if (typeof hmatrix.title === "undefined") {
            hmatrix.title = "Matrix";
        }
        if (typeof hmatrix.origin === "undefined") {
            hmatrix.origin = "unknown";
        }
        if (typeof hmatrix.history === "undefined") {
            hmatrix.history = [];
            hmatrix.history.push({
                text: "getHeatmap",
                ts: new Date().toISOString()
            });
        }
        if (typeof hmatrix.usefull === "undefined") {
            hmatrix.usefull = false;
        }
        var anzcols = 0;
        var anzrows = 0;
        if (heatmapsx === true) {
            var iyear0 = parseInt(hmatrix.rowheaders[0]);
            var iyearl = parseInt(hmatrix.rowheaders[hmatrix.rowheaders.length - 1]);
            var ihits = 0;
            var newheaders = [];
            var newdata = [];
            var icount = 0;
            var newyears = {};
            for (var iyear = 0; iyear < hmatrix.rowheaders.length; iyear++) {
                var nyear = hmatrix.rowheaders[iyear];
                newyears[nyear] = ihits;
                ihits++;
            }
            for (var numyear = iyear0; numyear <= iyearl; numyear++) {
                var charyear = "" + numyear;
                if (typeof newyears[charyear] === "undefined") {
                    newheaders.push(charyear);
                    newdata.push(Array(365).fill(null));
                } else {
                    newheaders.push(charyear);
                    var ind = newyears[numyear];
                    newdata.push(hmatrix.data[ind]);
                }
            }
            hmatrix.data = newdata;
            hmatrix.rowheaders = newheaders;
        }
        anzrows = hmatrix.data.length;
        if (typeof hmatrix.rowheaders === "undefined" || hmatrix.rowheaders.length === 0) {
            var anz2 = hmatrix.length;
            hmatrix.rowheaders = [];
            for (var irow = 0; irow < anz2; irow++) {
                hmatrix.rowheaders.push("##" + (irow + 1));
            }
        }
        if (typeof hmatrix.colheaders === "undefined" || hmatrix.colheaders.length === 0) {
            var anz1 = hmatrix.data[0].length;
            hmatrix.colheaders = [];
            for (var icol = 0; icol < anz1; icol++) {
                hmatrix.colheaders.push("#" + (icol + 1));
            }
        }
        anzcols = hmatrix.colheaders.length;
        // Holen der wichtigen Eckparameter
        var c = document.getElementById(hccanvasid);
        var canvas = document.getElementById(hccanvasid);
        var ctx = c.getContext("2d");
        /**
         * neue Designüberlegungen Scrollbar wegen hoher Jahreszahl notwendig
         */
        // https://stackoverflow.com/questions/15461811/html-canvas-with-scrollbar
        $("#" + hccanvasid).parent().css({
            "max-width": "500px",
            "max-height": "400px"
        });
        canvas.width = 500;
        //canvas.height = 364; //580;

        // Prozente auf canvas.height und width
        var colwidth = ctx.canvas.clientWidth / anzcols;
        var rowheight = 2; // ctx.canvas.clientHeight / 182;

        // kann evtl. wegfallen weil clearRect jetzt richtig definiert
        var wratio = ctx.canvas.width / ctx.canvas.clientWidth;
        var hratio = ctx.canvas.height / ctx.canvas.clientHeight;
        heatmapparms.colwidth = colwidth;
        heatmapparms.rowheight = rowheight;
        heatmapparms.wratio = wratio;
        heatmapparms.hratio = hratio;
        // hier Anhängen Bereich für Textausgabe
        canvas.width = 500;
        canvas.height = anzrows * rowheight + 48; //580;
        ctx.canvas.height = canvas.height;
        // canvas.height = 364 + 48; //580;
        // ctx.canvas.height = canvas.height;

        ctx.fillStyle = "#FFFFFF";

        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, anzrows * rowheight + 2, 500, 2);
        // Textausgabe
        ctx.moveTo(10, anzrows * rowheight + 5);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, anzrows * rowheight + 5, 500, 20);
        ctx.fillStyle = "#000000";
        ctx.font = "12px Arial";
        //ctx.fillStyle = "navyblue";
        ctx.fillText(hmatrix.title, 10, anzrows * rowheight + 20);
        // Korrektur Scrollbar - Vertikal

        var scw = uihelper.getScrollbarWidth(c.parentElement);
        // evtl. reicht 1? pixel mehr gegen den horizontalen Scrollbar
        var neww = 500 + scw + 15;

        $("#" + hccanvasid).parent().css({
            width: "" + neww + "px",
            "max-width": "" + neww + "px",
            "max-height": "500px",
            overflow: "auto"
        });
        /**
         * jedes Jahr eine Zeile, jede Zeile anzcols Tage
         * also direkte Steuerung, einfach
         * hier werden die Daten der Matrix bearbeitet , Sortierung liegt bereits vor
         */
        for (var irow = 0; irow < hmatrix.data.length; irow++) {
            // Iterate Monate
            var rowindex = irow;
            var rowheader = hmatrix.rowheaders[irow];
            // rowindexarray[thisyear] = rowindex;
            for (var icol = 0; icol < hmatrix.data[irow].length; icol++) {
                var colindex = icol;
                var temperatur = hmatrix.data[irow][icol];
                if (temperatur === null) continue;
                if (isNaN(temperatur)) continue;
                ctx.fillStyle = kla9020fun.getcolorstring(temperatur, hoptions);
                var cleft = Math.ceil(colindex * colwidth * wratio);
                var ctop = Math.ceil(rowindex * rowheight * hratio);
                var cwidth = Math.ceil(colwidth * wratio);
                var cheight = Math.ceil(rowheight * hratio);
                if (cheight === 0) cheight = 2;
                ctx.fillRect(cleft, ctop, cwidth, cheight);
            }
        }
        heatmapparms.savedwidth = $("#heatmap").width();
        heatmapparms.savedcanvaswidth = $("#heatmap canvas").width();
        $("#" + hcwrapperid).show();
        $("#" + hccanvasid).show();
        sysbase.putMessage("Heatmap ausgegeben", 1);

        callback901({
            error: false,
            message: "OK",
            hccanvasid: hccanvasid,
            hcwrapperid: hcwrapperid,
            hoptions: hoptions,
            temparray: temparray,
            matrix: hmatrix
        });
        return;
    };







    /**
     * getcolorstring zu einer Temperatur
     * es gibt 100 Ganzzahlwerte, gerundet wird auf 0.5 Grad
     * dann sind es 200 Colorcodes für gif = ok
     */
    kla9020fun.getcolorstring = function (temperatur, coptions) {
        if (isNaN(temperatur)) {
            return "";
        }
        var method;
        if (typeof coptions === "undefined") {
            method = 5;
            coptions = {};
            coptions.minmax = false;
        } else {
            coptions.minmax = coptions.minmax || false;
            method = coptions.hmethod || 7;
        }
        method = parseInt(method) || 7;
        if (coptions.minmax === true) {
            /**
             * Drama: prüfen, ob die Definition schon da ist, wenn ja, dann verwenden
             * sonst erst erzeugen und dann verwenden
             */
            if (Object.keys(tempopt).length >= 2) {
                if (tempopt.minval === coptions.minval && tempopt.maxval === coptions.maxval) {
                    // do nothing, tempint weiter verwenden
                    var xjkl = 0;
                } else {
                    // tempint neu berechnen
                    kla9020fun.calctempint(coptions);
                    tempopt.minval = coptions.minval;
                    tempopt.maxval = coptions.maxval;
                }
            } else {
                // tempint neu berechnen
                kla9020fun.calctempint(coptions);
                tempopt.minval = coptions.minval;
                tempopt.maxval = coptions.maxval;
            }
        } else if (method === 5) {
            tempint = tempint5;
        } else if (method === 6) {
            tempint = tempint6;

        } else {
            tempint = tempint7;
        }
        var tempsave = temperatur;
        temperatur = kla9020fun.round(parseFloat(temperatur), 0.5);
        var icat;
        if (temperatur <= tempint[0].vont) {
            icat = 0;
            temperatur = tempint[0].vont;
        } else if (temperatur >= tempint[tempint.length - 1].bist) {
            icat = tempint.length - 1;
            temperatur = tempint[icat].bistt;
        } else {
            for (icat = 0; icat < tempint.length; icat++) {
                if (temperatur >= tempint[icat].vont && temperatur <= tempint[icat].bist) {
                    break;
                }
            }
        }
        var itemp = temperatur;
        var idiff;
        try {
            idiff = Math.abs(tempint[icat].vont - tempint[icat].bist) + 1;
        } catch (err) {
            console.log("*******" + icat);
            debugger;
        }
        // itemp ist die Temperatur
        /*
                voncolor: [0, 0, 1],
                biscolor: [0, 1, 1]
         */
        var reltemp = itemp - tempint[icat].vont;
        var colfakt = reltemp / idiff;
        var redcolor = 0;
        if (tempint[icat].voncolor[0] === tempint[icat].biscolor[0]) {
            redcolor = tempint[icat].voncolor[0] * 255;
        } else if (tempint[icat].voncolor[0] > tempint[icat].biscolor[0]) {
            redcolor = (1 - colfakt) * 255;
        } else {
            redcolor = colfakt * 255;
        }
        redcolor = (redcolor).toFixed(0);

        var greencolor = 0;
        if (tempint[icat].voncolor[1] === tempint[icat].biscolor[1]) {
            greencolor = tempint[icat].voncolor[1] * 255;
        } else if (tempint[icat].voncolor[1] > tempint[icat].biscolor[1]) {
            greencolor = (1 - colfakt) * 255;
        } else {
            greencolor = colfakt * 255;
        }
        greencolor = (greencolor).toFixed(0);

        var bluecolor = 0;
        if (tempint[icat].voncolor[2] === tempint[icat].biscolor[2]) {
            bluecolor = tempint[icat].voncolor[2] * 255;
        } else if (tempint[icat].voncolor[2] > tempint[icat].biscolor[2]) {
            bluecolor = (1 - colfakt) * 255;
        } else {
            bluecolor = colfakt * 255;
        }
        bluecolor = (bluecolor).toFixed(0);

        var colorcode = kla9020fun.rgb2hex(redcolor, greencolor, bluecolor);
        return colorcode;
    };

    /**
     *
     */
    kla9020fun.calctempint = function (hoptions) {
        /*
         var tempint7 = [
            {
                text: "black-blue",
                vont: -50,
                bist: -20,
                voncolor: [0, 0, 0],
                biscolor: [0, 0, 1]
            },
        */

        var vont = Math.floor(parseInt(hoptions.minval));
        var bist = Math.ceil(parseInt(hoptions.maxval));
        var hinter = Math.ceil(parseInt((bist - vont + 1) / (tempint.length - 1)));
        tempint = uihelper.cloneObject(tempint7);
        var aktt = vont;
        for (var i = 0; i < tempint.length; i++) {
            tempint[i].vont = aktt;
            tempint[i].bist = aktt + hinter;
            aktt += hinter;
        }
    };

    /**
     * Berechnen Color-String
     */
    kla9020fun.rgb2hex = function (red, green, blue) {
        var colstring = "#";
        var hex = Number(red).toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        colstring += hex;

        hex = Number(green).toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        colstring += hex;

        hex = Number(blue).toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        colstring += hex;
        return colstring;
    };

    kla9020fun.round = function (value, step) {
        step || (step = 1.0);
        var inv = 1.0 / step;
        return Math.round(value * inv) / inv;
    };




    var clamp = (num, min, max) => num < min ? min : num > max ? max : num;

    /** Given a temperature (in Kelvin), estimate an RGB equivalent
     * @param {number} tmpKelvin - Temperature (in Kelvin) between 1000 and 40000
     * @returns {{r:number, g:number, b:number}} - RGB channel intensities (0-255)
     * @description Ported from: http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
     */
    /*
    exports.getRGBFromTemperature = function (tmpKelvin) {
        // All calculations require tmpKelvin \ 100, so only do the conversion once
        tmpKelvin = clamp(tmpKelvin, 1000, 40000) / 100;

        // Note: The R-squared values for each approximation follow each calculation
        return {
            r: tmpKelvin <= 66 ? 255 : clamp(329.698727446 * (Math.pow(tmpKelvin - 60, -0.1332047592)), 0, 255), // .988

            g: tmpKelvin <= 66 ?
                clamp(99.4708025861 * Math.log(tmpKelvin) - 161.1195681661, 0, 255) : // .996
                clamp(288.1221695283 * (Math.pow(tmpKelvin - 60, -0.0755148492)), 0, 255), // .987

            b: tmpKelvin >= 66 ? 255 : tmpKelvin <= 19 ? 0 : clamp(138.5177312231 * Math.log(tmpKelvin - 10) - 305.0447927307, 0, 255) // .998
        };
    };
    */




    /**
     * getColorPaletteX1 erzeugt Table im Übergabe-Container
     *   wird genutzt zur Prüfung des ColorGrading
     * für gif sind nur 256 Farben zulässig,
     * Schwarz und Weiss sind belegt
     *   Bereich -50 bis +50
     *   container muss ein div o.ä. sein
     */
    kla9020fun.getColorPaletteX1 = function (container, method) {
        if (typeof method === "undefined") {
            method = 5;
        }
        method = parseInt(method) || 5;
        if (method === 5) {
            tempint = tempint5;
        } else {
            tempint = tempint7;
        }
        if (typeof container === "string" && !container.startsWith("#")) {
            container = "#" + container;
        }
        $(container).empty();
        var ctx;
        var c;
        var cid;
        var colorcounter = 0;

        for (var icat = 0; icat < tempint.length; icat++) {
            var subcontainer = container + "d" + icat;
            $(container)
                .append($("<div/>", {
                    id: subcontainer.substr(1),
                    css: {
                        clear: "both",
                        "text-align": "center",
                        "font-weight": "bold",
                        "padding-top": "1em"
                    }
                }));
            $(subcontainer)
                .append($("<span/>", {
                    html: tempint[icat].text + " " + tempint[icat].vont + "=>" + tempint[icat].bist,
                    float: "left"
                }));
            $(subcontainer).append($("<br/>"));
            $(subcontainer).append($("<br/>"));

            var idiff = Math.abs(tempint[icat].vont - tempint[icat].bist) + 1;
            for (var itemp = tempint[icat].vont; itemp < tempint[icat].bist; itemp += 0.5) {
                /*
                    voncolor: [0, 0, 1],
                    biscolor: [0, 1, 1]
                */
                var reltemp = itemp - tempint[icat].vont;
                var colfakt = reltemp / idiff;

                var redcolor = 0;
                if (tempint[icat].voncolor[0] === tempint[icat].biscolor[0]) {
                    redcolor = tempint[icat].voncolor[0] * 255;
                } else if (tempint[icat].voncolor[0] > tempint[icat].biscolor[0]) {
                    redcolor = (1 - colfakt) * 255;
                } else {
                    redcolor = colfakt * 255;
                }
                redcolor = (redcolor).toFixed(0);

                var greencolor = 0;
                if (tempint[icat].voncolor[1] === tempint[icat].biscolor[1]) {
                    greencolor = tempint[icat].voncolor[1] * 255;
                } else if (tempint[icat].voncolor[1] > tempint[icat].biscolor[1]) {
                    greencolor = (1 - colfakt) * 255;
                } else {
                    greencolor = colfakt * 255;
                }
                greencolor = (greencolor).toFixed(0);

                var bluecolor = 0;
                if (tempint[icat].voncolor[2] === tempint[icat].biscolor[2]) {
                    bluecolor = tempint[icat].voncolor[2] * 255;
                } else if (tempint[icat].voncolor[2] > tempint[icat].biscolor[2]) {
                    bluecolor = (1 - colfakt) * 255;
                } else {
                    bluecolor = colfakt * 255;
                }
                bluecolor = (bluecolor).toFixed(0);

                var colorcode = kla9020fun.rgb2hex(redcolor, greencolor, bluecolor);
                // var color = "rgb(" + (colfakt * 255).toFixed(0) + ", 255, 0)";
                colorcounter++;
                $(subcontainer)
                    .append($("<div/>", {
                        html: "&nbsp;" + itemp + " " + colorcode + "&nbsp;",
                        css: {
                            float: "left",
                            "background-color": colorcode
                        }
                    }));

            }
        }
        $(container)
            .append($("<div/>", {
                css: {
                    clear: "both",
                    "text-align": "center",
                    "font-weight": "bold",
                    "padding-top": "1em"
                },
                html: "Insgesamt:" + colorcounter
            }));
    };




    /**
     * getlatfields - latitude wird vorgegeben,
     * hier: implizite Dezimalstelle!!! und -999 für Missing!!!
     * Struktur wird zurückgegeben mit
     * lat - Gerundet auf ganzzahlige latitude 1 bis 90 und -1 bis -90
     * latn - Nord/Süd-Wert, mit Präfix für Nord oder Süd, zweistellig
     * lats - Sortierwert von 001 = Nordpol bis 180 = Südpol und lat dahinter
     *        Äquator liegt zwischen 90 und 91
     */
    kla9020fun.getlatfields = function (latitude) {

        var latfields = {};
        var lat = latitude;
        var latn;
        var lats;
        lat = lat.substr(0, lat.length - 1);
        if (lat.startsWith("-")) {
            latn = "S" + lat.substr(1);
        } else {
            latn = "N" + lat;
        }
        var latnum;
        if (latn.substr(0, 1) === "N") {
            lats = ("000" + latn.substr(1)).slice(-3) + "_" + latn.substr(0, 1) + ("000" + latn.substr(1)).slice(-3);
            // Sortierung von 90 zu 0 mit dem Kehrwert
            latnum = parseInt(latn.substr(1));
            latnum = 90 - latnum;
            lats = ("000" + latnum).slice(-3) + "_" + latn.substr(0, 1) + ("000" + latn.substr(1)).slice(-3);
        } else {
            latnum = parseInt(latn.substr(1));
            latnum = 90 + latnum + 1;
            lats = ("000" + latnum).slice(-3) + "_" + latn.substr(0, 1) + ("000" + latn.substr(1)).slice(-3);
        }
        return {
            lat: lat,
            latn: latn,
            lats: lats
        };
    };

    /**
     * getlatfieldsp - latitude wird vorgegeben,
     * hier: explizite Dezimalstellen mit . getrennt und -999 für Missing!!!
     * Struktur wird zurückgegeben mit
     * lat - Gerundet auf ganzzahlige latitude
     * latn - Nord/Süd-Wert, mit Präfix für Nord oder Süd, zweistellig
     * lats - Sortierwert von 000 = Nordpol bis 180 = Südpol und lat dahinter
     */
    kla9020fun.getlatfieldsp = function (latitude) {

        var latfields = {};
        var lat = latitude;
        var latn;
        var lats;
        lat = lat.substr(0, lat.indexOf("."));
        if (lat.startsWith("-")) {
            latn = "S" + lat.substr(1);
        } else {
            latn = "N" + lat;
        }
        var latnum;
        if (latn.substr(0, 1) === "N") {
            //lats = ("000" + latn.substr(1)).slice(-3) + "_" + latn.substr(0, 1) + ("000" + latn.substr(1)).slice(-3);
            // Sortierung von 90 zu 0 mit dem Kehrwert
            latnum = parseInt(latn.substr(1));
            latnum = 90 - latnum;
            lats = ("000" + latnum).slice(-3) + "_" + latn.substr(0, 1) + ("000" + latn.substr(1)).slice(-3);
        } else {
            latnum = parseInt(latn.substr(1));
            latnum = 90 + latnum + 1;
            lats = ("000" + latnum).slice(-3) + "_" + latn.substr(0, 1) + ("000" + latn.substr(1)).slice(-3);
        }
        if (lats.endsWith(".")) {
            lats = lats.substr(0, lats.length - 1);
        }
        if (lat.endsWith(".")) {
            lat = lat.substr(0, lat.length - 1);
        }
        if (latn.endsWith(".")) {
            latn = latn.substr(0, latn.length - 1);
        }
        return {
            lat: lat,
            latn: latn,
            lats: lats
        };
    };



    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla9020fun;

    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS

        define([], function () {
            return kla9020fun;
        });
    } else {
        // included directly via <script> tag
        root.kla9020fun = kla9020fun;
    }
}());