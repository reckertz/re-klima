/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global IDBKeyRange,IDBCursor,pdfMake,tageliste,uihelper,ecsystem,console,devide,window,module,define,root,global,self */
/*global async,CKEDITOR,uisystem, */

(function () {
    var cfeCodes = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * cfeCodes - stellt Schlüssel zur Verfügung
     * key ist ein Schlüssel, nicht eine Ausprägung bzw. ein Wert
     * orderstates = Auftragsstatus
     * linestates  = Positionsstatus
     * articletype = Artikeltyp mit Blick auf Costing, Tax
     * salestax    = Mehrwertsteuersätze mit datefrom, key, value, title
     * value ist ein Wert eines Schlüssels
     * title ist die lesbare Bezeichnung zu dem Wert
     * cfeCodes.getKeyTitle - key, value => title als return
     * cfeCodes.getTitleKey - key, title => value als return
     * cfeCodes.getKey       - key => Objekt mit allen Daten, die unter dem key gespeichert sind
     * cfeCodes.getSalesTaxRate - leistungsdatum, title => percent %-Satz oder 0
     *      geht dediziert auf separates Array salestaxrate
     * evtl noch: cfeCodes.appendKeyOptions - key, datalist => append-Mimik auf eine datalist, die übergeben wird
     *
     */

    var myInfo;

    cfeCodes.initAll = function () {
        myInfo = uisystem.getsysInfo();
    };

    var cfe = {
        hydevariable: {
            popc_: "population count per cell",
            popd_: "population density per km2 in cell",
            rurc_: "rural population count per cell",
            urb_: "urban population count per cell",
            uopp_: "total built-up area in km2 per cell"

        },
    };

    /**
     * getKeyTitle
     * @param {*} key
     * @param {*} value
     */
    cfeCodes.getKeyTitle = function (key, value) {
        var title = "";
        var obj = cfe[key];
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] !== "object" && obj[property] === value) {
                    title = property;
                    return title;
                }
            }
        }
        return title;
    };


    /**
     * getTitleKey
     * @param {*} key
     * @param {*} title
     */
    cfeCodes.getTitleKey = function (key, title) {
        var value = "";
        var obj = cfe[key];
        var property = title;
        if (typeof obj[property] !== "undefined") {
            value = obj[property];
            return value;
        }
        return null;
    };


    /**
     * getKey
     * @param {*} key
     * return object des key
     */
    cfeCodes.getKey = function (key) {
        var value = "";
        var obj = cfe[key];
        if (typeof obj !== "undefined") {
            return obj;
        } else {
            return null;
        }
    };

    /**
     * getSalesTaxRate
     * @param {*} leistungsdatum (ISO-Datum ohne Trennzeichen)
     * @param {*} articlecode
     * @param {*} transactioncode - S wie Service und V wie Verkauf
     * return Steuersatz (Mehrwertsteuersatz)
     */
    cfeCodes.getSalesTaxRate = function (leistungsdatum, vktyp, vktrans) {
        if (salestaxarray.length === 0) {
            // Aufbau salestaxarray aus salestaxstrings - reverse order!!!!
            for (istr = 0; istr < salestaxstrings.length; istr++) {
                //from;vktyp;vktrans;mwstproz
                var sts = salestaxstrings[istr].split(";");
                if (sts.length === 4) {
                    salestaxarray.unshift({
                        from: sts[0],
                        vktaxcode: sts[1],
                        vktrans: sts[2],
                        mwstproz: sts[3]
                    });
                }
            }
        }
        /*
        var salestaxrate = [{
            from: 20000101,
            Voll: 19.0,
            Reduziert: 7.0,
            Keine: 0
        */
        if (leistungsdatum.indexOf("-") > 0) {
            leistungsdatum = leistungsdatum.replace(/-/g, "");
        }
        for (itr = 0; itr < salestaxarray.length; itr++) {
            if (leistungsdatum >= salestaxarray[itr].from) {
                if (vktyp === salestaxarray[itr].vktaxcode && vktrans === salestaxarray[itr].vktrans) {
                    return salestaxarray[itr].mwstproz;
                }
            }
        }
        return null;
    };

    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = cfeCodes;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return cfeCodes;
        });
    } else {
        // included directly via <script> tag
        root.cfeCodes = cfeCodes;
    }
}()); // JavaScript source code