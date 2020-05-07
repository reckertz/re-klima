// basiert auf https://raw.githubusercontent.com/fnando/svgspark02.sparkline/master/src/svgspark02.sparkline.js
// mit MIT-License
// geändert durch Rolf Eckertz 2020
/*global $,this,window,module,define,root,global,self,var,async,sysbase,uihelper,kla9020fun,regression */
/*global document */
(function () {
    'use strict';
    var svgspark02 = {};

    var root = typeof self === 'object' && self.self === self && self ||
        typeof global === 'object' && global.global === global && global ||
        this;


    svgspark02.getY = function (max, min, height, diff, value) {
        return Math.round(height - ((value - min) * height / (max - min)) + diff);
    };

    svgspark02.removeChildren = function (svg) {
        [svg.querySelectorAll("*")].forEach(function (element) {
            try {
                svg.removeChild(element);
            } catch (err) {
                console.log(err);
            }
        });
    };

    svgspark02.defaultFetch = function (entry) {
        if (typeof entry === "number") {
            return entry;
        } else if (entry === null) {
            return null;
        } else if (typeof entry === "object") {
            return entry.value;
        } else {
            return parseFloat(entry);
        }
    };

    svgspark02.buildElement = function (tag, attrs) {
        var element = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (var name in attrs) {
            if ("x,y".indexOf(name) >= 0) {
                element.setAttributeNS(null, name, attrs[name]);
            } else {
                element.setAttribute(name, attrs[name]);
                // element.setAttributeNS(null, name, attrs[name]);
            }
        }
        element.setAttribute("family", "svgspark");
        return element;
    };



    svgspark02.sparkline = function (svg, entries, options) {
        // svgspark02.removeChildren(svg);
        if (entries.length <= 1) {
            return;
        }

        options = options || {};
        if (typeof (entries[0]) !== "number") {
            entries = entries.map(function (entry) {
                return {
                    value: entry
                };
            });
        }
        options.offsetX = options.offsetX || 0;
        options.offsetY = options.offsetY || 0;
        options.stroke = options.stroke || "red";
        options.strokeOpacity = options.strokeOpacity || 0.5;
        options.fill = options.fill || "mistyrose";
        options.fillOpacity = options.fillOpacity || 0.5;

        // This function will be called whenever the mouse moves
        // over the SVG. You can use it to render something like a
        // tooltip.
        var onmousemove = options.onmousemove;

        // This function will be called whenever the mouse leaves
        // the SVG area. You can use it to hide the tooltip.
        var onmouseout = options.onmouseout;

        // Should we run in interactive mode? If yes, this will handle the
        // cursor and spot position when moving the mouse.
        var interactive = ("interactive" in options) ? options.interactive : !!onmousemove;

        // Define how big should be the spot area.
        var spotRadius = options.spotRadius || 4;
        var spotDiameter = spotRadius * 2;

        // Define how wide should be the cursor area.
        var cursorWidth = options.cursorWidth || 2;

        // Get the stroke width; this is used to compute the
        // rendering offset.
        //var strokeWidth = parseFloat(svg.attributes["stroke-width"].value || 2);
        var strokeWidth = options.strokeWidth || 2;

        // By default, data must be formatted as an array of numbers or
        // an array of objects with the value key (like `[{value: 1}]`).
        // You can set a custom function to return data for a different
        // data structure.
        var fetch = options.fetch || svgspark02.defaultFetch;

        // Retrieve only values, easing the find for the maximum value.
        var values;
        if (typeof (entries[0]) !== "number") {
            var values = entries.map(function (entry) {
                fetch(entry);
            });
        } else {
            values = entries;
        }

        // The rendering width will account for the spot size.
        //var width = parseFloat(svg.attributes.width.value) - spotDiameter * 2;
        var width = options.width || 100;

        // Get the SVG element's full height.
        // This is used
        //var fullHeight = parseFloat(svg.attributes.height.value);
        var fullHeight = options.fullHeight || 30;

        // The rendering height accounts for stroke width and spot size.
        var height = fullHeight - (strokeWidth * 2) - spotDiameter;

        // The maximum value. This is used to calculate the Y coord of
        // each svgspark02.sparkline datapoint.
        // Problem null-Values gibt es hier noch
        var min = options.chartRangeMin || Math.min.apply(null, values);
        var max = options.chartRangeMax || Math.max.apply(null, values);

        // Some arbitrary value to remove the cursor and spot out of
        // the viewing canvas.
        var offscreen = -1000;

        // Cache the last item index.
        var lastItemIndex = values.length - 1;

        // Calculate the X coord base step.
        var offset = width / lastItemIndex;


        var interactionLayer = svgspark02.buildElement("rect", {
            width: options.width + 10,
            height: options.fullHeight,
            stroke: "magenta",
            "stroke-opacity": 0.2,
            "stroke-width": 2,
            fill: "transparent",
            x: options.offsetX,
            y: options.offsetY
        });
        svg.appendChild(interactionLayer);


        // Hold all datapoints, which is whatever we got as the entry plus
        // x/y coords and the index.
        var datapoints = [];
        // Hold the line coordinates.
        var pathY = options.offsetY + svgspark02.getY(max, min, height, strokeWidth + spotRadius, values[0]);
        //var pathCoords = 'M${spotDiameter} ${pathY}';
        var pathString = ""; // "M" + (options.offsetX + spotDiameter) + " " + pathY;
        var saveString = "";
        var anznulls = 0;
        // null-values werden zugelassen und beachtet
        values.forEach(function (value, index) {
            if (value === null) {
                anznulls++;
                if (pathString.length > 0) {
                    var path = svgspark02.buildElement("path", {
                        d: pathString,
                        fill: "none",
                        stroke: options.stroke,
                        "stroke-opacity": options.strokeOpacity
                    });
                    svg.appendChild(path);
                    pathString = "";
                }
            } else {
                if (svgspark02.getPredecessor(index, values) === null && svgspark02.getSuccessor(index, values) === null) {
                    // solitärer Wert
                    var x = options.offsetX + index * offset + spotDiameter;
                    var y = options.offsetY + svgspark02.getY(max, min, height, strokeWidth + spotRadius, value);
                    datapoints.push(Object.assign({}, entries[index], {
                        index: index,
                        x: x,
                        y: y
                    }));
                    pathString += " M" + x + " " + y;
                    // TODO: den Min-Value nehmen, wenn er realisiert ist, sonst echte 0
                    var y0 = options.offsetY + svgspark02.getY(max, min, height, strokeWidth + spotRadius, min);
                    pathString += " L " + x + " " + y0;
                    var path = svgspark02.buildElement("path", {
                        d: pathString,
                        fill: "none",
                        stroke: options.stroke,
                        "stroke-opacity": options.strokeOpacity
                    });
                    svg.appendChild(path);
                    saveString = pathString;
                    pathString = "";
                } else if (svgspark02.getPredecessor(index, values) === null) {
                    // kein Vorgänger, neuer path
                    var x = options.offsetX + index * offset + spotDiameter;
                    var y = options.offsetY + svgspark02.getY(max, min, height, strokeWidth + spotRadius, value);
                    datapoints.push(Object.assign({}, entries[index], {
                        index: index,
                        x: x,
                        y: y
                    }));
                    pathString += " M" + x + " " + y;
                } else if (svgspark02.getSuccessor(index, values) === null) {
                    // kein Nachfolger, Erzeugen und Ausgabe vornehmen, gibt auch den letzten schon aus
                    var x = options.offsetX + index * offset + spotDiameter;
                    var y = options.offsetY + svgspark02.getY(max, min, height, strokeWidth + spotRadius, value);
                    datapoints.push(Object.assign({}, entries[index], {
                        index: index,
                        x: x,
                        y: y
                    }));
                    pathString += " L " + x + " " + y;
                    var path = svgspark02.buildElement("path", {
                        d: pathString,
                        fill: "none",
                        stroke: options.stroke,
                        "stroke-opacity": options.strokeOpacity
                    });
                    svg.appendChild(path);
                    saveString = pathString;
                    pathString = "";
                } else {
                    // umrandeter Wert/Sandwich
                    var x = options.offsetX + index * offset + spotDiameter;
                    var y = options.offsetY + svgspark02.getY(max, min, height, strokeWidth + spotRadius, value);
                    datapoints.push(Object.assign({}, entries[index], {
                        index: index,
                        x: x,
                        y: y
                    }));
                    pathString += " L " + x + " " + y;
                }
            }
        });

        if (anznulls === 0 && interactive === false) {
            // zurück zum ersten Datenpunkt
            var fillCoords = "" + saveString;
            fillCoords += " V " + (options.offsetY + fullHeight);
            fillCoords += " L " + (options.offsetX + spotDiameter) + " " + (options.offsetY + fullHeight);
            fillCoords += " Z";
            // parseFloat((height - (value * height / (max - min)) + diff).toFixed(2));
            var fill = svgspark02.buildElement("path", {
                d: fillCoords,
                fill: options.fill,
                "fill-opacity": options.fillOpacity
            });
            svg.appendChild(fill);
        }


        if (!interactive) {
            return;
        }

        var cursor = svgspark02.buildElement("line", {
            x1: offscreen,
            x2: offscreen,
            y1: 0,
            y2: fullHeight,
            "stroke-width": cursorWidth,
            stroke: options.stroke,
            "stroke-opacity": options.strokeOpacity
        });

        var spot = svgspark02.buildElement("circle", {
            cx: offscreen,
            cy: offscreen,
            r: spotRadius,
            fill: options.fill,
            "fill-opacity": options.fillOpacity
        });
        svg.appendChild(cursor);
        svg.appendChild(spot);

        interactionLayer.addEventListener("mouseout", function (event) {
            cursor.setAttribute("x1", offscreen);
            cursor.setAttribute("x2", offscreen);

            spot.setAttribute("cx", offscreen);

            if (onmouseout) {
                onmouseout(event);
            }
        });
        interactionLayer.addEventListener("mousemove", function (event) {
            event.preventDefault();

            var pOffset = $(svg).offset();
            var currentTarget = event.currectTarget;
            var mouseX = event.x; //event.x; // event.offsetX;

            // https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again/
            var pt = svg.createSVGPoint();
            pt.x = event.clientX;
            pt.y = event.clientY;
            var svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

            mouseX = Math.round(svgP.x);

            var nextDataIndex = datapoints.findIndex(function (entry) {
                return entry.x >= mouseX;
            });

            //sysbase.putMessage("event.x:" + event.x + "data.x:" + mouseX + " clientX:" + event.clientX + " screenX:" + event.screenX + " datapoints:" + JSON.stringify(datapoints));
            var currentDataPoint;
            var halfX;

            if (nextDataIndex < 0) {
                nextDataIndex = lastItemIndex;
                sysbase.putMessage("1-event.x:" + event.x + "=>" + mouseX + " nextDataIndex:" + nextDataIndex + " mit:" + datapoints[nextDataIndex].x);
                currentDataPoint = datapoints[nextDataIndex];
            } else {
                // hier echter Hit
                if (nextDataIndex === 0) {
                    sysbase.putMessage("2-event.x:" + event.x + "=>" + mouseX + " nextDataIndex:" + nextDataIndex + " mit:" + datapoints[nextDataIndex].x);
                    currentDataPoint = datapoints[0];
                } else if (nextDataIndex <= lastItemIndex) {
                    halfX = (datapoints[nextDataIndex].x + datapoints[nextDataIndex - 1].x) / 2;
                    halfX = Math.round(halfX);
                    if (mouseX > halfX) {
                        var msg = "3-event.x:" + event.x + "=>" + mouseX;
                        msg += " between:" + (nextDataIndex-1) + "=>" + nextDataIndex + " " + datapoints[nextDataIndex-1].x + "=>" + datapoints[nextDataIndex].x;
                        msg += " hit:" + nextDataIndex + " mit:" + datapoints[nextDataIndex].x;
                        sysbase.putMessage(msg);
                        currentDataPoint = datapoints[nextDataIndex];
                    } else {
                        var msg = "4-event.x:" + event.x + "=>" + mouseX;
                        msg += " between:" + (nextDataIndex-1) + "=>" + nextDataIndex + " " + datapoints[nextDataIndex-1].x + "=>" + datapoints[nextDataIndex].x;
                        msg += " hit:" + (nextDataIndex-1) + " mit:" + datapoints[nextDataIndex-1].x;
                        sysbase.putMessage(msg);
                        nextDataIndex--;
                        currentDataPoint = datapoints[nextDataIndex];
                    }
                } else {
                    nextDataIndex = lastItemIndex;
                    sysbase.putMessage("5.event.x:" + event.x + "=>" + mouseX + " nextDataIndex:" + nextDataIndex + " auf:" + lastItemIndex + " mit:" + datapoints[nextDataIndex].x);
                    currentDataPoint = datapoints[nextDataIndex];
                }
            }
            var x = currentDataPoint.x;
            var y = currentDataPoint.y;

            spot.setAttribute("cx", x);
            spot.setAttribute("cy", options.offsetY + y);

            cursor.setAttributeNS(null, "x1", x);
            cursor.setAttributeNS(null, "y1", options.offsetY);
            cursor.setAttributeNS(null, "x2", x);
            cursor.setAttributeNS(null, "y2", options.offsetY + fullHeight);
            /*
            console.log(JSON.stringify(datapoints));
            console.log(JSON.stringify(values));
            console.log(mouseX + "=>" + halfX + "=>" + x + " ind:" + nextDataIndex + " val:" + values[nextDataIndex]);
            console.log(JSON.stringify(currentDataPoint));
            */
            if (onmousemove) {
                onmousemove(event, currentDataPoint);
            }
        });

    };

    svgspark02.getPredecessor = function (index, values) {
        if (index <= 0) {
            return null;
        } else {
            return values[index - 1];
        }
    };

    svgspark02.getSuccessor = function (index, values) {
        if (index >= values.length - 1) {
            return null;
        } else {
            return values[index + 1];
        }
    };
    /**
     * standardisierte Mimik zur Integration mit App, Browser und node.js
     */
    if (typeof module === 'object' && module.exports) {
        // Node.js
        module.exports = svgspark02;
    } else if (typeof define === 'function' && define.amd) {
        // AMD / RequireJS
        define([], function () {
            return svgspark02;
        });
    } else {
        // included directly via <script> tag
        root.svgspark02 = svgspark02;
    }
}());