/*! Planetary.js v1.1.3
 *  Copyright (c) 2013 Michelle Tilley
 *
 *  Released under the MIT license
 *  Date: 2018-10-30T18:49:58.667Z
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['d3', 'topojson'], function (d3, topojson) {
            return (root.planetaryjs = factory(d3, topojson, root));
        });
    } else if (typeof exports === 'object') {
        module.exports = factory(require('d3'), require('topojson'));
    } else {
        root.planetaryjs = factory(root.d3, root.topojson, root);
    }
}(this, function (d3, topojson, window) {
    'use strict';

    var originalPlanetaryjs = null;
    if (window) originalPlanetaryjs = window.planetaryjs;
    var plugins = [];

    var doDrawLoop = function (planet, canvas, hooks) {
        d3.timer(function () {
            if (planet.stopped) {
                return true;
            }

            planet.context.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < hooks.onDraw.length; i++) {
                hooks.onDraw[i]();
            }
        });
    };

    var initPlugins = function (planet, localPlugins) {
        // Add the global plugins to the beginning of the local ones
        for (var i = plugins.length - 1; i >= 0; i--) {
            localPlugins.unshift(plugins[i]);
        }

        // Load the default plugins if none have been loaded so far
        if (localPlugins.length === 0) {
            if (planetaryjs.plugins.earth)
                planet.loadPlugin(planetaryjs.plugins.earth());
            if (planetaryjs.plugins.pings)
                planet.loadPlugin(planetaryjs.plugins.pings());
        }

        for (i = 0; i < localPlugins.length; i++) {
            localPlugins[i](planet);
        }
    };

    var runOnInitHooks = function (planet, canvas, hooks) {
        // onInit hooks can be asynchronous if they take a parameter;
        // iterate through them one at a time
        if (hooks.onInit.length) {
            var completed = 0;
            var doNext = function (callback) {
                var next = hooks.onInit[completed];
                if (next.length) {
                    next(function () {
                        completed++;
                        callback();
                    });
                } else {
                    next();
                    completed++;
                    setTimeout(callback, 0);
                }
            };
            var check = function () {
                if (completed >= hooks.onInit.length) doDrawLoop(planet, canvas, hooks);
                else doNext(check);
            };
            doNext(check);
        } else {
            doDrawLoop(planet, canvas, hooks);
        }
    };

    var startDraw = function (planet, canvas, localPlugins, hooks) {
        planet.canvas = canvas;
        planet.context = canvas.getContext('2d');

        if (planet.stopped !== true) {
            initPlugins(planet, localPlugins);
        }

        planet.stopped = false;
        runOnInitHooks(planet, canvas, hooks);
    };

    var planetaryjs = {
        plugins: {},

        noConflict: function () {
            window.planetaryjs = originalPlanetaryjs;
            return planetaryjs;
        },

        loadPlugin: function (plugin) {
            plugins.push(plugin);
        },

        planet: function () {
            var localPlugins = [];
            var hooks = {
                onInit: [],
                onDraw: [],
                onStop: []
            };

            var planet = {
                plugins: {},

                draw: function (canvas) {
                    startDraw(planet, canvas, localPlugins, hooks);
                },

                onInit: function (fn) {
                    hooks.onInit.push(fn);
                },

                onDraw: function (fn) {
                    hooks.onDraw.push(fn);
                },

                onStop: function (fn) {
                    hooks.onStop.push(fn);
                },

                loadPlugin: function (plugin) {
                    localPlugins.push(plugin);
                },

                stop: function () {
                    planet.stopped = true;
                    for (var i = 0; i < hooks.onStop.length; i++) {
                        hooks.onStop[i](planet);
                    }
                },

                withSavedContext: function (fn) {
                    if (!this.context) {
                        throw new Error("No canvas to fetch context for");
                    }

                    this.context.save();
                    fn(this.context);
                    this.context.restore();
                }
            };

            planet.projection = d3.geo.orthographic()
                .clipAngle(90);
            planet.path = d3.geo.path().projection(planet.projection);

            return planet;
        }
    };

    planetaryjs.plugins.topojson = function (config) {
        return function (planet) {
            planet.plugins.topojson = {};

            planet.onInit(function (done) {
                if (config.world) {
                    planet.plugins.topojson.world = config.world;
                    setTimeout(done, 0);
                } else {
                    var file = config.file || 'world-110m.json';
                    d3.json(file, function (err, world) {
                        if (err) {
                            throw new Error("Could not load JSON " + file);
                        }
                        planet.plugins.topojson.world = world;
                        done();
                    });
                }
            });
        };
    };

    planetaryjs.plugins.oceans = function (config) {
        return function (planet) {
            planet.onDraw(function () {
                planet.withSavedContext(function (context) {
                    context.beginPath();
                    planet.path.context(context)({
                        type: 'Sphere'
                    });

                    context.fillStyle = config.fill || 'black';
                    context.fill();
                });
            });
        };
    };

    planetaryjs.plugins.land = function (config) {
        return function (planet) {
            var land = null;

            planet.onInit(function () {
                var world = planet.plugins.topojson.world;
                land = topojson.feature(world, world.objects.land);
            });

            planet.onDraw(function () {
                planet.withSavedContext(function (context) {
                    context.beginPath();
                    planet.path.context(context)(land);

                    if (config.fill !== false) {
                        context.fillStyle = config.fill || 'white';
                        context.fill();
                    }

                    if (config.stroke) {
                        if (config.lineWidth) context.lineWidth = config.lineWidth;
                        context.strokeStyle = config.stroke;
                        context.stroke();
                    }
                });
            });
        };
    };

    planetaryjs.plugins.borders = function (config) {
        return function (planet) {
            var borders = null;
            var borderFns = {
                internal: function (a, b) {
                    return a.id !== b.id;
                },
                external: function (a, b) {
                    return a.id === b.id;
                },
                both: function (a, b) {
                    return true;
                }
            };

            planet.onInit(function () {
                var world = planet.plugins.topojson.world;
                var countries = world.objects.countries;
                var type = config.type || 'internal';
                borders = topojson.mesh(world, countries, borderFns[type]);
            });

            planet.onDraw(function () {
                planet.withSavedContext(function (context) {
                    context.beginPath();
                    planet.path.context(context)(borders);
                    context.strokeStyle = config.stroke || 'gray';
                    if (config.lineWidth) context.lineWidth = config.lineWidth;
                    context.stroke();
                });
            });
        };
    };

    planetaryjs.plugins.earth = function (config) {
        config = config || {};
        var topojsonOptions = config.topojson || {};
        var oceanOptions = config.oceans || {};
        var landOptions = config.land || {};
        var bordersOptions = config.borders || {};

        return function (planet) {
            planetaryjs.plugins.topojson(topojsonOptions)(planet);
            planetaryjs.plugins.oceans(oceanOptions)(planet);
            planetaryjs.plugins.land(landOptions)(planet);
            planetaryjs.plugins.borders(bordersOptions)(planet);
        };
    };

    /**
     * pings - kommen und gehen mit:
     * addPing   - fügt neues Element hinzu, pings.push(ping);
     * drawpings - loop und newPings.push(ping); sowie drawping
     * drawping  - macht Kreis größer bis er verschwindet
     * @param {} config
     */
    planetaryjs.plugins.pings = function (config) {
        var pings = [];
        config = config || {};

        var addPing = function (lng, lat, options) {
            options = options || {};
            options.color = options.color || config.color || 'white';
            options.angle = options.angle || config.angle || 5;
            options.ttl = options.ttl || config.ttl || 2000;
            var ping = {
                time: new Date(),
                options: options
            };
            if (config.latitudeFirst) {
                ping.lat = lng;
                ping.lng = lat;
            } else {
                ping.lng = lng;
                ping.lat = lat;
            }
            pings.push(ping);
        };

        var drawPings = function (planet, context, now) {
            var newPings = [];
            for (var i = 0; i < pings.length; i++) {
                var ping = pings[i];
                var alive = now - ping.time;
                if (alive < ping.options.ttl) {
                    newPings.push(ping);
                    drawPing(planet, context, now, alive, ping);
                }
            }
            pings = newPings;
        };
        /**
         *
         *
         * @param {*} planet
         * @param {*} context
         * @param {*} now
         * @param {*} alive
         * @param {*} ping
         */
        var drawPing = function (planet, context, now, alive, ping) {
            var alpha = 1 - (alive / ping.options.ttl);
            var color = d3.rgb(ping.options.color);
            color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")";
            context.strokeStyle = color;
            var circle = d3.geo.circle().origin([ping.lng, ping.lat])
              .angle(alive / ping.options.ttl * ping.options.angle)();
            context.beginPath();
            planet.path.context(context)(circle);
            /**
             * RE: Erweiterung großer Kreis mit opacity
             */
            context.fillStyle = "rgba(0, 33, 0, 0.2)";
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = '#003300';

            context.stroke();
        };

        return function (planet) {
            planet.plugins.pings = {
                add: addPing
            };

            planet.onDraw(function () {
                var now = new Date();
                planet.withSavedContext(function (context) {
                    drawPings(planet, context, now);
                });
            });
        };
    };

    /**
     * pongs - kommen und bleiben bis zu hide (später)
     * addPong   - fügt neues Element hinzu, pongs.push(pong);
     * drawpongs - loop und newPongs.push(pong); sowie drawpong
     * drawpong  - macht Kreis größer bis er verschwindet
     * @param {} config
     */
    var vglangle = 0;
    var vglcount = 0;
    planetaryjs.plugins.pongs = function (config) {
        var pongs = [];
        config = config || {};

        var addPong = function (lng, lat, options) {
            options = options || {};
            options.color = options.color || config.color || 'white';
            options.angle = 1;  // options.angle || config.angle || 5;
            options.ttl = 2000; /// options.ttl || config.ttl || 2000;
            vglcount ++;
            if (vglcount === 1) {
                console.log(options);
            }
            var pong = {
                time: new Date(),
                options: options
            };
            if (config.latitudeFirst) {
                pong.lat = lng;
                pong.lng = lat;
            } else {
                pong.lng = lng;
                pong.lat = lat;
            }
            pongs.push(pong);
        };

        var drawPongs = function (planet, context, now) {
            /**
             * der Pong verschwindet nicht
             */
            for (var i = 0; i < pongs.length; i++) {
                var pong = pongs[i];
                var alive = now;
                drawPong(planet, context, now, alive, pong);
            }
            /*
            var newPongs = [];
            for (var i = 0; i < pongs.length; i++) {
                var pong = pongs[i];
                var alive = now - pong.time;
                if (alive < pong.options.ttl) {
                    newPongs.push(pong);
                    drawPong(planet, context, now, alive, pong);
                }
            }
            pongs = newPongs;
            */
        };
        /**
         *
         * @param {*} planet
         * @param {*} context
         * @param {*} now
         * @param {*} alive
         * @param {*} pong
         */
        var drawPong = function (planet, context, now, alive, pong) {
            //var alpha = 1 - (alive / pong.options.ttl);
            var alpha = .5;
            var color = d3.rgb(pong.options.color);
            //color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")";
            color = "rgba(" + 255 + "," + 0 + "," + 0 + "," + alpha + ")";
            //context.strokeStyle = color;
            context.fillStyle = "rgba(255,165,0,1)";
            /**
             * RE: fester Radius der circles der pongs
             */
            // var circle = d3.geo.circle().origin([pong.lng, pong.lat])
            //  .angle(alive / pong.options.ttl * pong.options.angle)();
            console.log("drawPong:" + pong.options.angle);
            if (vglangle !== pong.options.angle) {
                console.log("********:" + vglangle);
                vglangle = pong.options.angle;
            }
            var circle = d3.geo.circle().origin([pong.lng, pong.lat])
                .angle(1 * pong.options.angle)();
            context.beginPath();
            planet.path.context(context)(circle);
            /**
             * RE: Erweiterung fester Kreis mit opacity
             */
            //context.fillStyle = "rgba(0, 33, 0, 0.2)";
            context.fill();
            context.lineWidth = 2;
            context.strokeStyle = '#003300';
            context.strokeStyle =  "rgba(255,165,0,1)";
            context.stroke();
        };

        return function (planet) {
            planet.plugins.pongs = {
                add: addPong
            };

            planet.onDraw(function () {
                var now = new Date();
                planet.withSavedContext(function (context) {
                    drawPongs(planet, context, now);
                });
            });
        };
    };




    planetaryjs.plugins.zoom = function (options) {
        options = options || {};
        var noop = function () {};
        var onZoomStart = options.onZoomStart || noop;
        var onZoomEnd = options.onZoomEnd || noop;
        var onZoom = options.onZoom || noop;
        var afterZoom = options.afterZoom || noop;
        var startScale = options.initialScale;
        var scaleExtent = options.scaleExtent || [50, 2000];

        return function (planet) {
            planet.onInit(function () {
                var zoom = d3.behavior.zoom()
                    .scaleExtent(scaleExtent);

                if (startScale !== null && startScale !== undefined) {
                    zoom.scale(startScale);
                } else {
                    zoom.scale(planet.projection.scale());
                }

                zoom
                    .on('zoomstart', onZoomStart.bind(planet))
                    .on('zoomend', onZoomEnd.bind(planet))
                    .on('zoom', function () {
                        onZoom.call(planet);
                        planet.projection.scale(d3.event.scale);
                        afterZoom.call(planet);
                    });
                d3.select(planet.canvas).call(zoom);
            });
        };
    };

    planetaryjs.plugins.drag = function (options) {
        options = options || {};
        var noop = function () {};
        var onDragStart = options.onDragStart || noop;
        var onDragEnd = options.onDragEnd || noop;
        var onDrag = options.onDrag || noop;
        var afterDrag = options.afterDrag || noop;

        return function (planet) {
            planet.onInit(function () {
                var drag = d3.behavior.drag()
                    .on('dragstart', onDragStart.bind(planet))
                    .on('dragend', onDragEnd.bind(planet))
                    .on('drag', function () {
                        onDrag.call(planet);
                        var dx = d3.event.dx;
                        var dy = d3.event.dy;
                        var rotation = planet.projection.rotate();
                        var radius = planet.projection.scale();
                        var scale = d3.scale.linear()
                            .domain([-1 * radius, radius])
                            .range([-90, 90]);
                        var degX = scale(dx);
                        var degY = scale(dy);
                        rotation[0] += degX;
                        rotation[1] -= degY;
                        if (rotation[1] > 90) rotation[1] = 90;
                        if (rotation[1] < -90) rotation[1] = -90;
                        if (rotation[0] >= 180) rotation[0] -= 360;
                        planet.projection.rotate(rotation);
                        afterDrag.call(planet);
                    });
                d3.select(planet.canvas).call(drag);
            });
        };
    };

    return planetaryjs;
}));