/*jslint es5:true, browser:true, devel:true, white:true, vars:true */
/*jshint laxbreak:true */
/*global $:false, intel:false, cordova:false, device:false */
/*global IDBKeyRange,IDBCursor,pdfMake,tageliste,uihelper,ecsystem,console,devide,window,module,define,root,global,self */
/*global async,CKEDITOR,uisystem, */
"use strict";
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
            urbc_: "urban population count per cell",
            uopp_: "total built-up area in km2 per cell",

            cropland: "total cropland area, km2 per cell (Ackerland)",
            grazing: "total land grazing, km2 per cell (Weideland)",
            pasture: "total pasture, km2 per cell, aridity >.5 (Trockenzonen)",
            rangeland: "total rangeland, km2 per cell, aridity < .5 (Naturweide)",
            conv_rangeland: "total converted rangeland, km2 per cell (ehem. Wald)",
            tot_irri: "total irrigated area, km2 per cell (Bewässertes Land)"
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