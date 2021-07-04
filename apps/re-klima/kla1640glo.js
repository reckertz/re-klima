/*jshint laxbreak:true */
/*global $,window,module,document,define,root,global,self,var,this,sysbase,uihelper */
/*global uientry,planetaryjs, */
(function () {
    "use strict";
    var kla1640glo = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;
    /**
     * kla1640glo  starecord mit den Selektionskriterien und
     * holt die Daten selbst
     */
    var starecord = {};
    var stationarray = [];
    var pearls = [];
    var cid;
    var cidw;
    kla1640glo.show = function (parameters, navigatebucket) {
        // https://www.sitepoint.com/get-url-parameters-with-javascript/
        starecord = {};
        if (typeof parameters === "undefined" && typeof navigatebucket === "undefined") {}
        if (typeof parameters !== "undefined" && parameters.length > 0) {
            starecord.source = parameters.source || "";
            starecord.variablename = parameters.variablename || "";
            starecord.fromyear = parameters.fromyear || "0";
            starecord.toyear = parameters.toyear || "0";
        } else {
            var queryString = window.location.search;
            console.log(queryString); // ?product=shirt&color=blue&newuser&size=m
            queryString = queryString.substr(1);
            var idis = queryString.lastIndexOf("?");
            if (idis > 0) {
                queryString = queryString.substr(0, idis);
            }
            if (queryString && queryString.length > 0) {
                var parms = queryString.split("&");
                var parmobj = {};
                parms.forEach(function (item) {
                    var subparms = item.split("=");
                    var key = subparms[0];
                    parmobj[key] = subparms[1];
                });
                console.log(parmobj);
                starecord.source = parmobj.source || "";
                starecord.variablename = parmobj.variablename || "";
                starecord.fromyear = parmobj.fromyear || "0";
                starecord.toyear = parmobj.toyear || "0";
            }
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
        var wname = "wmap" + Math.floor(Math.random() * 100000) + 1;
        cid = wname + "map";
        cidw = cid + "w";
        $(".content").empty();
        $(".headertitle").html("Globus anzeigen");
        $(".headertitle").attr("title", "kla1640glo");
        $(".content").attr("pageid", "kla1640glo");
        $(".content").attr("id", "kla1640glo");
        $(".content")
            .css({
                overflow: "hidden"
            });
        $("#kla1640glo")
            .append($("<input/>", {
                type: "hidden",
                id: "kla1640glo_isdirty",
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
                    )
                )
            );

        sysbase.initFooter();
        $("#kla1640glo.content")
            .append($("<div/>", {
                class: "col1of2",
                css: {
                    "background-color": "yellow",
                    overflow: "auto"
                }
            }));
        $("#kla1640glo.content")
            .append($("<div/>", {
                    class: "col2of2",
                    css: {
                        "background-color": "lightsteelblue",
                        overflow: "auto"
                    }
                })

                .append($("<canvas/>", {
                    id: 'rotatingGlobe'
                }))
                .append($("<div/>", {
                        id: 'controls',
                        css: {
                            "text-align": "center",
                            width: "100%"
                        }
                    })
                    .append($("<div/>")
                        .append($("<input/>", {
                            width: "50%",
                            id: 'slider640',
                            class: "slider640",
                            type: 'range',
                            min: '0',
                            max: '100',
                            step: '0.1',
                            value: '0'
                        }))
                    )
                    .append($("<div/>")
                        .append($("<span/>", {
                            id: 'date640',
                            html: "&nbsp;"
                        }))
                    )
                )
            );
        /*
        $("#rotatingGlobe").parent().css({
            "max-width": "700px",
            "max-height": "700px"
        });
        */
        stationarray = window.parent.sysbase.getCache("stationarray");
        starecord = window.parent.sysbase.getCache("starecord");

        var canvas = document.getElementById("rotatingGlobe");
        canvas.width = $("#kla1640glo .col2of2").width();
        canvas.height = $("#kla1640glo .col2of2").height();
        /*
        <canvas id='rotatingGlobe' width='400' height='400' style='width: 400px; height: 400px; cursor: move;'></canvas>
        */

        $(document).on("keypress", "input", function (evt) {
            if (evt.keyCode === 13) {
                // Cancel the default action, if needed
                evt.preventDefault();
                evt.stopPropagation();
                evt.stopImmediatePropagation();
                // Trigger the button element with a click
                //document.getElementById("myBtn").click();
            }
        });

        var h = $(".content").height();
        var hh = $(".header").height();
        h += hh;
        var fh = $(".footer").height();
        h -= fh - 3;
        $("#kla1640glo .col1of2").height(h);
        $("#kla1640glo .col2of2").height(h);
        var wmtit = "Globus ";
        if (typeof starecord.stasel !== "undefined") {
            wmtit += starecord.source.length > 0 ? " " + starecord.source : "";
            wmtit += starecord.variablename.length > 0 ? " " + starecord.variablename : "";
            wmtit += starecord.fromyear.length > 0 ? " " + starecord.fromyear : "";
            wmtit += starecord.toyear.length > 0 ? " " + starecord.toyear : "";
        }
        $(".headertitle").html(wmtit);

        /**
         * Ausgabe des Globus ansteuern: putglobe
         */
        kla1640glo.putglobe(function (ret) {
            sysbase.putMessage(ret.message);
            return;
        });
    }; // Ende show



    kla1640glo.putglobe = function (callback640) {
        /**
         * stationarray hat die Daten
         * starecord hat die Selektionsparameter dazu
         */
        async.waterfall([
            function (callback640a) {
                var irow = 0;
                var vonjahr = null;
                var bisjahr = null;
                var pearls = [];
                $("#kla1640glo .col1of2")
                    .append($("<ul/>", {
                        id: "kla1640glol1"
                    }));

                for (var ista = 0; ista < stationarray.length; ista++) {
                    var record = stationarray[ista];
                    irow++;
                    pearls.push({
                        stationid: record.stationid,
                        stationname: record.stationid,
                        /* record.stationname, */
                        variable: starecord.variablename,
                        latitude: record.latitude,
                        longitude: record.longitude,
                        fromyear: record.fromyear || 0,
                        toyear: record.toyear || 0,
                        ispainted: false
                    });
                    $("#kla1640glol1")
                        .append($("<li/>", {
                            html: JSON.stringify(pearls[pearls.length - 1])
                        }));
                }
                callback640a(null, {
                    error: false,
                    message: "Daten gefunden:" + irow,
                    pearls: uihelper.cloneObject(pearls),
                    starecord: uihelper.cloneObject(starecord),
                });
                return;
            },
            function (ret, callback640b) {
                /**
                 * Ausgabe aus dem Puffer mit Iteration über die Jahre
                 */
                var pearls = ret.pearls;
                var fromyear = parseInt(ret.starecord.fromyear);
                var toyear = parseInt(ret.starecord.toyear);

                $("#slider640").prop("min", fromyear);
                $("#slider640").prop("max", toyear);
                $("#slider640").prop("step", "1");
                $("#slider640").prop("value", fromyear);

                $(document).on("change slide", ".slider640", function (evt) {
                    evt.preventDefault();
                    var newValue = $(this).val();
                    $("#date640").html(newValue);
                });

                /*
                $("#kla1640glo").find(".col2of2").empty();
                var targetdiv = $("#kla1640glo").find(".content");
                $(targetdiv)
                    .append($("<div/>", {
                            css: {
                                width: "400px",
                                height: "400px"
                            }
                        })
                        .append($("<canvas/>", {
                            id: 'rotatingGlobe',
                            width: '400',
                            height: '400',
                            css: {
                                width: "400px",
                                height: "400px",
                                cursor: "move"
                            }
                        }))
                    );
                    */
                try {
                    (function () {
                        var globe = planetaryjs.planet();
                        // http://planetaryjs.com/examples/quake.html
                        globe.loadPlugin(autocenter({
                            extraHeight: -120
                        }));
                        globe.loadPlugin(autoscale({
                            extraHeight: -120
                        }));

                        // Load our custom autorotate plugin; see below.
                        globe.loadPlugin(autorotate(10));
                        // The earth plugin draws the oceans and the land; it's actually
                        // a combination of several separate built-in plugins.
                        //
                        // Note that we're loading a special TopoJSON file
                        // (world-110m-withlakes.json) so we can render lakes.
                        globe.loadPlugin(planetaryjs.plugins.earth({
                            topojson: {
                                file: '/world-110m-withlakes.json'
                            },
                            oceans: {
                                fill: '#000080'
                            },
                            land: {
                                fill: '#339966'
                            },
                            borders: {
                                stroke: '#008000'
                            }
                        }));
                        // Load our custom `lakes` plugin to draw lakes; see below.
                        globe.loadPlugin(lakes({
                            fill: '#000080'
                        }));
                        // The `pings` plugin draws animated pings on the globe.
                        globe.loadPlugin(planetaryjs.plugins.pings());
                        // The `zoom` and `drag` plugins enable
                        // manipulating the globe with the mouse.
                        globe.loadPlugin(planetaryjs.plugins.zoom({
                            /* scaleExtent: [100, 300] */
                            // http://planetaryjs.com/examples/quake.html
                            scaleExtent: [50, 5000]
                        }));
                        globe.loadPlugin(planetaryjs.plugins.drag({
                            // Dragging the globe should pause the
                            // automatic rotation until we release the mouse.
                            onDragStart: function () {
                                this.plugins.autorotate.pause();
                            },
                            onDragEnd: function () {
                                this.plugins.autorotate.resume();
                            }
                        }));
                        // Set up the globe's initial scale, offset, and rotation.
                        // globe.projection.scale(175).translate([175, 175]).rotate([0, -10, 0]);
                        globe.projection.rotate([100, -10, 0]);

                        // Every few hundred milliseconds, we'll draw another random ping.
                        var colors = ['red', 'yellow', 'white', 'orange', 'green', 'cyan', 'pink'];
                        /**
                         * hier werden die pings gesetzt
                         * nicht mehr random, sondern aus den Stationen
                         */

                        var ipearl = 0;
                        var fromyear = parseInt(ret.starecord.fromyear);
                        var toyear = parseInt(ret.starecord.toyear);
                        console.log("Animation mit:" + fromyear + "=>" + toyear);
                        var actyear = fromyear;
                        // var stationloop = setInterval(function () {
                        var tstationloop;

                        function stationloop() {
                            $("#slider640").val(actyear);
                            $("#date640").html(actyear);
                            //$("#slider640").slider("refresh");
                            for (var ipearl = 0; ipearl < pearls.length; ipearl++) {
                                if (pearls[ipearl].ispainted === false && actyear >= pearls[ipearl].fromyear && actyear <= pearls[ipearl].toyear) {
                                    pearls[ipearl].ispainted = true;
                                    var lat = pearls[ipearl].latitude;
                                    var lng = pearls[ipearl].longitude;
                                    var color = colors[Math.floor(Math.random() * colors.length)];
                                    globe.plugins.pings.add(lng, lat, {
                                        color: color,
                                        ttl: 200000,
                                        angle: 1
                                    });
                                }
                            }
                            actyear++;
                            if (actyear > toyear) {
                                clearInterval(tstationloop);
                                return;
                            }
                            //}, 2000);
                            tstationloop = setTimeout(function () {
                                stationloop();
                            }, 3000);
                        }
                        /*
                         setInterval(function () {
                             var lat = Math.random() * 170 - 85;
                             var lng = Math.random() * 360 - 180;
                             var color = colors[Math.floor(Math.random() * colors.length)];
                             globe.plugins.pings.add(lng, lat, {
                                 color: color,
                                 ttl: 20000,
                                 angle: Math.random() * 30
                             });
                         }, 150);
                         */
                        var canvas = document.getElementById('rotatingGlobe');
                        var context;
                        // Special code to handle high-density displays (e.g. retina, some phones)
                        // In the future, Planetary.js will handle this by itself (or via a plugin).
                        if (window.devicePixelRatio == 2) {
                            canvas.width = 800;
                            canvas.height = 800;
                            context = canvas.getContext('2d');
                            context.scale(2, 2);
                        }
                        // Draw that globe!
                        globe.draw(canvas);
                        stationloop(); // initialisieren des Loops

                        // http://planetaryjs.com/examples/quake.html

                        // Plugin to resize the canvas to fill the window and to
                        // automatically center the planet when the window size changes
                        function autocenter(options) {
                            options = options || {};
                            var needsCentering = false;
                            var globe = null;

                            var resize = function () {
                                //var width = window.innerWidth + (options.extraWidth || 0);
                                //var height = window.innerHeight + (options.extraHeight || 0);
                                // RE: angepasst an Container
                                var width = $("#kla1640glo .col2of2").width() + (options.extraWidth || 0);
                                var height = $("#kla1640glo .col2of2").height() + (options.extraHeight || 0);

                                globe.canvas.width = width;
                                globe.canvas.height = height;

                                globe.projection.translate([width / 2, height / 2]);
                            };

                            return function (planet) {
                                globe = planet;
                                planet.onInit(function () {
                                    needsCentering = true;
                                    d3.select(window).on('resize', function () {
                                        needsCentering = true;
                                    });
                                });

                                planet.onDraw(function () {
                                    if (needsCentering) {
                                        resize();
                                        needsCentering = false;
                                    }
                                });
                            };
                        };

                        // Plugin to automatically scale the planet's projection based
                        // on the window size when the planet is initialized
                        function autoscale(options) {
                            options = options || {};
                            return function (planet) {
                                planet.onInit(function () {
                                    //var width = window.innerWidth + (options.extraWidth || 0);
                                    //var height = window.innerHeight + (options.extraHeight || 0);
                                    // RE: angepasst an Container
                                    var width = $("#kla1640glo .col2of2").width() + (options.extraWidth || 0);
                                    var height = $("#kla1640glo .col2of2").height() + (options.extraHeight || 0);
                                    planet.projection.scale(Math.min(width, height) / 2);
                                });
                            };
                        };

                        // Plugin to automatically rotate the globe around its vertical
                        // axis a configured number of degrees every second.
                        function autorotate(degPerSec) {
                            return function (planet) {
                                var lastTick = null;
                                var paused = false;
                                planet.plugins.autorotate = {
                                    pause: function () {
                                        paused = true;
                                    },
                                    resume: function () {
                                        paused = false;
                                    }
                                };
                                planet.onDraw(function () {
                                    if (paused || !lastTick) {
                                        lastTick = new Date();
                                    } else {
                                        var now = new Date();
                                        var delta = now - lastTick;
                                        var rotation = planet.projection.rotate();
                                        rotation[0] += degPerSec * delta / 1000;
                                        if (rotation[0] >= 180) rotation[0] -= 360;
                                        planet.projection.rotate(rotation);
                                        lastTick = now;
                                    }
                                });
                            };
                        }



                        // This plugin will automatically rotate the globe around its vertical
                        // axis a configured number of degrees every second.
                        function autorotate(degPerSec) {
                            // Planetary.js plugins are functions that take a `planet` instance
                            // as an argument...
                            return function (planet) {
                                var lastTick = null;
                                var paused = false;
                                planet.plugins.autorotate = {
                                    pause: function () {
                                        paused = true;
                                    },
                                    resume: function () {
                                        paused = false;
                                    }
                                };
                                // ...and configure hooks into certain pieces of its lifecycle.
                                planet.onDraw(function () {
                                    if (paused || !lastTick) {
                                        lastTick = new Date();
                                    } else {
                                        var now = new Date();
                                        var delta = now - lastTick;
                                        // This plugin uses the built-in projection (provided by D3)
                                        // to rotate the globe each time we draw it.
                                        var rotation = planet.projection.rotate();
                                        rotation[0] += degPerSec * delta / 1000;
                                        if (rotation[0] >= 180) rotation[0] -= 360;
                                        planet.projection.rotate(rotation);
                                        lastTick = now;
                                    }
                                });
                            };
                        }
                        // This plugin takes lake data from the special
                        // TopoJSON we're loading and draws them on the map.
                        function lakes(options) {
                            options = options || {};
                            var lakes = null;

                            return function (planet) {
                                planet.onInit(function () {
                                    // We can access the data loaded from the TopoJSON plugin
                                    // on its namespace on `planet.plugins`. We're loading a custom
                                    // TopoJSON file with an object called "ne_110m_lakes".
                                    var world = planet.plugins.topojson.world;
                                    lakes = topojson.feature(world, world.objects.ne_110m_lakes);
                                });

                                planet.onDraw(function () {
                                    planet.withSavedContext(function (context) {
                                        context.beginPath();
                                        planet.path.context(context)(lakes);
                                        context.fillStyle = options.fill || 'black';
                                        context.fill();
                                    });
                                });
                            };
                        };
                    })();
                } catch (err) {
                    console.log(err);
                    console.log(err.stack);
                }
            }
        ], function (error, ret) {

            callback640(ret);
            return;

        });

    };


    kla1640glo.showclock = function (clockcontainer) {
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
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = kla1640glo;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return kla1640glo;
        });
    } else {
        // included directly via <script> tag
        root.kla1640glo = kla1640glo;
    }
}());