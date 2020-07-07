/*global $,window,document,module,define,root,global,self,var,this,sysbase,uihelper */
(function () {
    'use strict';
    var kla1790srv = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1790srv - Funktionen speziell für Textanalyse und Textmining
     */
    //var tm = require("textmining");
    var tm = require('text-miner');
    /**
     * textanalysis: fullname
     * Analyse und Ergebnis in ret.result als html
     * Blättern kann noch holprig sein
     */


    kla1790srv.textanalysis = function (db, async, path, fs, req, reqparm, res, callbackt1) {
        // app.get('/textanalysis', function (req, res) {
        var rootdir = path.dirname(require.main.filename);
        var fullname = "";
        if (req.query && typeof req.query.fullname !== "undefined" && req.query.fullname.length > 0) {
            fullname = req.query.fullname;
        }
        var toplimit = 10;
        if (req.query && typeof req.query.toplimit !== "undefined" && req.query.toplimit.length > 0) {
            toplimit = parseInt(req.query.toplimit);
        }
        var language = "DE";
        if (req.query && typeof req.query.language !== "undefined" && req.query.language.length > 0) {
            language = req.query.language;
        }
        var aktline = 0;
        var aktbyte = 0;
        var newline = 0;
        var newbyte = 0;
        var nextchunk = "";
        var ret = {};
        ret.error = false;
        var smsg = "";
        if (!fs.existsSync(fullname)) {
            smsg = JSON.stringify({
                error: true,
                message: "NOT FOUND:" + fullname,
                fullname: fullname
            });
            res.writeHead(200, {
                'Content-Type': 'application/text',
                "Access-Control-Allow-Origin": "*"
            });
            res.end(smsg);
            return;
        }
        var textcontent = fs.readFileSync(fullname, {
            encoding: 'utf8'
        });

        // Experiment: jeder Satz sein eigenes Dokument
        // oder
        // https://www.npmjs.com/package/text-miner
        // removeInterpunctuation wurde erweitert
        // var textcontent1 = uihelper.normalizeString (textcontent, false);
        var textcontent1 = textcontent.replace(/[^a-z0-9äöüß]/gmi, " ").replace(/\s+/g, " ");
        var my_corpus = new tm.Corpus([textcontent1]);
        var stops = tm.STOPWORDS[language];
        my_corpus
            .trim()
            .toLower()
            .clean()
            .removeNewlines()
            .removeInterpunctuation()
            .removeDigits()
            .removeWords(stops)
            .stem();

        var terms = new tm.TermDocumentMatrix(my_corpus);
        var termmat = terms.findFreqTerms(toplimit);
        var vocstat = tm.weightTfIdf(termmat);

        var vocstats = vocstat.sort(function (a, b) {
            if (a.count > b.count) return -1;
            else if (a.count < b.count) return 1;
            else return 0;
        });

        // var vocabulary = terms.vocabulary;
        console.log(vocstats);
        var result = {
            vocstats: vocstats
        };

        ret.error = false;
        ret.message = "Textanalyse erfolgt";
        ret.fullname = fullname;
        ret.result = result;
        ret.text = my_corpus.documents[0].text;
        callbackt1(res, ret);
        return;
    };




    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1790srv;

    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS

        define([], function () {
            return kla1790srv;
        });
    } else {
        // included directly via <script> tag
        root.kla1790srv = kla1790srv;
    }
}());