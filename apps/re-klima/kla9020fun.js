(function () {
    var kla9020fun = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla9020fun - Funktionen speziell für Klimaanalyse
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */

     
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