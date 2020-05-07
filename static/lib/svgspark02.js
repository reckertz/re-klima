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

    var svgspark02g = {};  // Container für alle Daten einer Instanz = Group mit id

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



    svgspark02.sparkline = function (sparkid, svg, entries, options) {

        // svgspark02.removeChildren(svg);
        if (typeof sparkid === "undefined" || sparkid === null || sparkid.length === 0) {
            sparkid = "mysparkline";
        }
        svgspark02g[sparkid] = {};
        if (entries.length <= 1) {
            return;
        }

        svgspark02g[sparkid].offsetX = options.offsetX || 0;
        svgspark02g[sparkid].offsetY = options.offsetY || 0;
        svgspark02g[sparkid].stroke = options.stroke || "red";
        svgspark02g[sparkid].strokeOpacity = options.strokeOpacity || 0.5;
        svgspark02g[sparkid].fill = options.fill || "mistyrose";
        svgspark02g[sparkid].fillOpacity = options.fillOpacity || 0.5;

        // This function will be called whenever the mouse moves
        // over the SVG. You can use it to render something like a
        // tooltip.
        svgspark02g[sparkid].onmousemove = options.onmousemove;

        // This function will be called whenever the mouse leaves
        // the SVG area. You can use it to hide the tooltip.
        svgspark02g[sparkid].onmouseout = options.onmouseout;

        // Should we run in interactive mode? If yes, this will handle the
        // cursor and spot position when moving the mouse.
        svgspark02g[sparkid].interactive = ("interactive" in options) ? options.interactive : !! svgspark02g[sparkid].onmousemove;

        // Define how big should be the spot area.
        svgspark02g[sparkid].spotRadius = options.spotRadius || 4;
        svgspark02g[sparkid].spotDiameter = svgspark02g[sparkid].spotRadius * 2;

        // Define how wide should be the cursor area.
        svgspark02g[sparkid].cursorWidth = options.cursorWidth || 2;

        // Get the stroke width; this is used to compute the
        // rendering offset.
        //var strokeWidth = parseFloat(svg.attributes["stroke-width"].value || 2);
        svgspark02g[sparkid].strokeWidth = options.strokeWidth || 2;

        // By default, data must be formatted as an array of numbers or
        // an array of objects with the value key (like `[{value: 1}]`).
        // You can set a custom function to return data for a different
        // data structure.
        var fetch = options.fetch || svgspark02.defaultFetch;

        // Retrieve only values, easing the find for the maximum value.
        var values = entries.map(function (entry) {
           return fetch(entry);
        });
        svgspark02g[sparkid].values = values;

        // The rendering width will account for the spot size.
        //var width = parseFloat(svg.attributes.width.value) - spotDiameter * 2;
        svgspark02g[sparkid].width = options.width || 100;

        // Get the SVG element's full height.
        // This is used
        //var fullHeight = parseFloat(svg.attributes.height.value);
        svgspark02g[sparkid].fullHeight = options.fullHeight || 30;

        // The rendering height accounts for stroke width and spot size.
        svgspark02g[sparkid].height = svgspark02g[sparkid].fullHeight - (svgspark02g[sparkid].strokeWidth * 2) - svgspark02g[sparkid].spotDiameter;

        // The maximum value. This is used to calculate the Y coord of
        // each svgspark02.sparkline datapoint.
        // Problem null-Values gibt es hier noch
        svgspark02g[sparkid].min = options.chartRangeMin || Math.min.apply(null, values);
        svgspark02g[sparkid].max = options.chartRangeMax || Math.max.apply(null, values);

        // Some arbitrary value to remove the cursor and spot out of
        // the viewing canvas.
        var offscreen = -1000;

        // Cache the last item index.
        svgspark02g[sparkid].lastItemIndex = svgspark02g[sparkid].values.length - 1;

        // Calculate the X coord base step.
        svgspark02g[sparkid].offset = svgspark02g[sparkid].width / svgspark02g[sparkid].lastItemIndex;

        svgspark02g[sparkid].group = document.createElementNS("http://www.w3.org/2000/svg","g");
        svgspark02g[sparkid].group.setAttribute("id",sparkid);
        svg.appendChild(svgspark02g[sparkid].group);

        //$("#" + sparkid).draggable();

        svgspark02g[sparkid].interactionLayer = svgspark02.buildElement("rect", {
            width: svgspark02g[sparkid].width + 10,
            height: svgspark02g[sparkid].fullHeight,
            stroke: "magenta",
            "stroke-opacity": 0.2,
            "stroke-width": 2,
            fill: "transparent",
            x: svgspark02g[sparkid].offsetX,
            y: svgspark02g[sparkid].offsetY
        });
        svgspark02g[sparkid].group.appendChild(svgspark02g[sparkid].interactionLayer);
        // Hold all datapoints, which is whatever we got as the entry plus
        // x/y coords and the index.
        svgspark02g[sparkid].datapoints = [];
        // Hold the line coordinates.
        svgspark02g[sparkid].pathY = svgspark02g[sparkid].offsetY + svgspark02.getY(svgspark02g[sparkid].max, svgspark02g[sparkid].min, svgspark02g[sparkid].height, svgspark02g[sparkid].strokeWidth + svgspark02g[sparkid].spotRadius, svgspark02g[sparkid].values[0]);
        //var pathCoords = 'M${spotDiameter} ${pathY}';
        var pathString = ""; // "M" + (options.offsetX + spotDiameter) + " " + pathY;
        var saveString = "";
        var anznulls = 0;
        // null-values werden zugelassen und beachtet
        svgspark02g[sparkid].values.forEach(function (value, index) {
            if (value === null) {
                anznulls++;
                if (pathString.length > 0) {
                    var path = svgspark02.buildElement("path", {
                        d: pathString,
                        fill: "none",
                        stroke: svgspark02g[sparkid].stroke,
                        "stroke-opacity": svgspark02g[sparkid].strokeOpacity
                    });
                    svgspark02g[sparkid].group.appendChild(path);
                    pathString = "";
                }
            } else {
                if (svgspark02.getPredecessor(index, svgspark02g[sparkid].values) === null && svgspark02.getSuccessor(index, svgspark02g[sparkid].values) === null) {
                    // solitärer Wert
                    var x = svgspark02g[sparkid].offsetX + index * svgspark02g[sparkid].offset + svgspark02g[sparkid].spotDiameter;
                    var y = svgspark02g[sparkid].offsetY + svgspark02.getY(svgspark02g[sparkid].max, svgspark02g[sparkid].min, svgspark02g[sparkid].height, svgspark02g[sparkid].strokeWidth + svgspark02g[sparkid].spotRadius, value);
                    svgspark02g[sparkid].datapoints.push(Object.assign({}, entries[index], {
                        index: index,
                        x: x,
                        y: y
                    }));
                    pathString += " M" + x + " " + y;
                    // TODO: den Min-Value nehmen, wenn er realisiert ist, sonst echte 0
                    var y0 = svgspark02g[sparkid].offsetY + svgspark02.getY(svgspark02g[sparkid].max, svgspark02g[sparkid].min, svgspark02g[sparkid].height, svgspark02g[sparkid].strokeWidth + svgspark02g[sparkid].spotRadius, svgspark02g[sparkid].min);
                    pathString += " L " + x + " " + y0;
                    svgspark02g[sparkid].path = svgspark02.buildElement("path", {
                        d: pathString,
                        fill: "none",
                        stroke: svgspark02g[sparkid].stroke,
                        "stroke-opacity": svgspark02g[sparkid].strokeOpacity
                    });
                    svgspark02g[sparkid].group.appendChild(svgspark02g[sparkid].path);
                    saveString = pathString;
                    pathString = "";
                } else if (svgspark02.getPredecessor(index, svgspark02g[sparkid].values) === null) {
                    // kein Vorgänger, neuer path
                    var x = svgspark02g[sparkid].offsetX + index * svgspark02g[sparkid].offset + svgspark02g[sparkid].spotDiameter;
                    var y = svgspark02g[sparkid].offsetY + svgspark02.getY(svgspark02g[sparkid].max, svgspark02g[sparkid].min, svgspark02g[sparkid].height, svgspark02g[sparkid].strokeWidth + svgspark02g[sparkid].spotRadius, value);
                    svgspark02g[sparkid].datapoints.push(Object.assign({}, entries[index], {
                        index: index,
                        x: x,
                        y: y
                    }));
                    pathString += " M" + x + " " + y;
                } else if (svgspark02.getSuccessor(index, svgspark02g[sparkid].values) === null) {
                    // kein Nachfolger, Erzeugen und Ausgabe vornehmen, gibt auch den letzten schon aus
                    var x = svgspark02g[sparkid].offsetX + index * svgspark02g[sparkid].offset + svgspark02g[sparkid].spotDiameter;
                    var y = options.offsetY + svgspark02.getY(svgspark02g[sparkid].max, svgspark02g[sparkid].min, svgspark02g[sparkid].height, svgspark02g[sparkid].strokeWidth + svgspark02g[sparkid].spotRadius, value);
                    svgspark02g[sparkid].datapoints.push(Object.assign({}, entries[index], {
                        index: index,
                        x: x,
                        y: y
                    }));
                    pathString += " L " + x + " " + y;
                    svgspark02g[sparkid].path = svgspark02.buildElement("path", {
                        d: pathString,
                        fill: "none",
                        stroke: svgspark02g[sparkid].stroke,
                        "stroke-opacity": svgspark02g[sparkid].strokeOpacity
                    });
                    svgspark02g[sparkid].group.appendChild(svgspark02g[sparkid].path);
                    saveString = pathString;
                    pathString = "";
                } else {
                    // umrandeter Wert/Sandwich
                    var x = svgspark02g[sparkid].offsetX + index * svgspark02g[sparkid].offset + svgspark02g[sparkid].spotDiameter;
                    var y = options.offsetY + svgspark02.getY(svgspark02g[sparkid].max, svgspark02g[sparkid].min, svgspark02g[sparkid].height, svgspark02g[sparkid].strokeWidth + svgspark02g[sparkid].spotRadius, value);
                    svgspark02g[sparkid].datapoints.push(Object.assign({}, entries[index], {
                        index: index,
                        x: x,
                        y: y
                    }));
                    pathString += " L " + x + " " + y;
                }
            }
        });

        if (anznulls === 0 && svgspark02g[sparkid].interactive === false) {
            // zurück zum ersten Datenpunkt
            var fillCoords = "" + saveString;
            fillCoords += " V " + (svgspark02g[sparkid].offsetY + svgspark02g[sparkid].fullHeight);
            fillCoords += " L " + (svgspark02g[sparkid].offsetX + svgspark02g[sparkid].spotDiameter) + " " + (svgspark02g[sparkid].offsetY + svgspark02g[sparkid].fullHeight);
            fillCoords += " Z";
            // parseFloat((height - (value * height / (max - min)) + diff).toFixed(2));
            svgspark02g[sparkid].fill = svgspark02.buildElement("path", {
                d: fillCoords,
                fill: svgspark02g[sparkid].fill,
                "fill-opacity": svgspark02g[sparkid].fillOpacity
            });
            svgspark02g[sparkid].group.appendChild(svgspark02g[sparkid].fill);
        }


        if (!svgspark02g[sparkid].interactive) {
            return;
        }

        svgspark02g[sparkid].cursor = svgspark02.buildElement("line", {
            x1: offscreen,
            x2: offscreen,
            y1: 0,
            y2: svgspark02g[sparkid].fullHeight,
            "stroke-width": svgspark02g[sparkid].cursorWidth,
            stroke: svgspark02g[sparkid].stroke,
            "stroke-opacity": svgspark02g[sparkid].strokeOpacity
        });

        svgspark02g[sparkid].spot = svgspark02.buildElement("circle", {
            cx: offscreen,
            cy: offscreen,
            r: svgspark02g[sparkid].spotRadius,
            fill: svgspark02g[sparkid].fill,
            stroke: svgspark02g[sparkid].stroke,
            "fill-opacity": svgspark02g[sparkid].fillOpacity
        });
        svgspark02g[sparkid].group.appendChild(svgspark02g[sparkid].cursor);
        svgspark02g[sparkid].group.appendChild(svgspark02g[sparkid].spot);

        svgspark02g[sparkid].interactionLayer.addEventListener("mouseout", function (event) {
            svgspark02g[sparkid].cursor.setAttribute("x1", offscreen);
            svgspark02g[sparkid].cursor.setAttribute("x2", offscreen);

            svgspark02g[sparkid].spot.setAttribute("cx", offscreen);

            if (svgspark02g[sparkid].onmouseout) {
                svgspark02g[sparkid].onmouseout(event);
            }
        });
        svgspark02g[sparkid].interactionLayer.addEventListener("mousemove", function (event) {
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

            var nextDataIndex = svgspark02g[sparkid].datapoints.findIndex(function (entry) {
                return entry.x >= mouseX;
            });

            //sysbase.putMessage("event.x:" + event.x + "data.x:" + mouseX + " clientX:" + event.clientX + " screenX:" + event.screenX + " datapoints:" + JSON.stringify(datapoints));
            var currentDataPoint;
            var halfX;

            if (nextDataIndex < 0) {
                nextDataIndex = svgspark02g[sparkid].lastItemIndex;
                sysbase.putMessage("1-event.x:" + event.x + "=>" + mouseX + " nextDataIndex:" + nextDataIndex + " mit:" + svgspark02g[sparkid].datapoints[nextDataIndex].x);
                currentDataPoint = svgspark02g[sparkid].datapoints[nextDataIndex];
            } else {
                // hier echter Hit
                if (nextDataIndex === 0) {
                    sysbase.putMessage("2-event.x:" + event.x + "=>" + mouseX + " nextDataIndex:" + nextDataIndex + " mit:" + svgspark02g[sparkid].datapoints[nextDataIndex].x);
                    currentDataPoint = svgspark02g[sparkid].datapoints[0];
                } else if (nextDataIndex <= svgspark02g[sparkid].lastItemIndex) {
                    halfX = (svgspark02g[sparkid].datapoints[nextDataIndex].x + svgspark02g[sparkid].datapoints[nextDataIndex - 1].x) / 2;
                    halfX = Math.round(halfX);
                    if (mouseX > halfX) {
                        var msg = "3-event.x:" + event.x + "=>" + mouseX;
                        msg += " between:" + (nextDataIndex-1) + "=>" + nextDataIndex + " " + svgspark02g[sparkid].datapoints[nextDataIndex-1].x + "=>" + svgspark02g[sparkid].datapoints[nextDataIndex].x;
                        msg += " hit:" + nextDataIndex + " mit:" + svgspark02g[sparkid].datapoints[nextDataIndex].x;
                        sysbase.putMessage(msg);
                        currentDataPoint = svgspark02g[sparkid].datapoints[nextDataIndex];
                    } else {
                        var msg = "4-event.x:" + event.x + "=>" + mouseX;
                        msg += " between:" + (nextDataIndex-1) + "=>" + nextDataIndex + " " + svgspark02g[sparkid].datapoints[nextDataIndex-1].x + "=>" + svgspark02g[sparkid].datapoints[nextDataIndex].x;
                        msg += " hit:" + (nextDataIndex-1) + " mit:" + svgspark02g[sparkid].datapoints[nextDataIndex-1].x;
                        sysbase.putMessage(msg);
                        nextDataIndex--;
                        currentDataPoint = svgspark02g[sparkid].datapoints[nextDataIndex];
                    }
                } else {
                    nextDataIndex = svgspark02g[sparkid].lastItemIndex;
                    sysbase.putMessage("5.event.x:" + event.x + "=>" + mouseX + " nextDataIndex:" + nextDataIndex + " auf:" + svgspark02g[sparkid].lastItemIndex + " mit:" + svgspark02g[sparkid].datapoints[nextDataIndex].x);
                    currentDataPoint = svgspark02g[sparkid].datapoints[nextDataIndex];
                }
            }
            var x = currentDataPoint.x;
            var y = currentDataPoint.y;

            svgspark02g[sparkid].spot.setAttribute("cx", x);
            svgspark02g[sparkid].spot.setAttribute("cy", y);

            svgspark02g[sparkid].cursor.setAttributeNS(null, "x1", x);
            svgspark02g[sparkid].cursor.setAttributeNS(null, "y1", svgspark02g[sparkid].offsetY);
            svgspark02g[sparkid].cursor.setAttributeNS(null, "x2", x);
            svgspark02g[sparkid].cursor.setAttributeNS(null, "y2", svgspark02g[sparkid].offsetY + svgspark02g[sparkid].fullHeight);
            /*
            console.log(JSON.stringify(datapoints));
            console.log(JSON.stringify(values));
            console.log(mouseX + "=>" + halfX + "=>" + x + " ind:" + nextDataIndex + " val:" + values[nextDataIndex]);
            console.log(JSON.stringify(currentDataPoint));
            */
            if (svgspark02g[sparkid].onmousemove) {
                svgspark02g[sparkid].onmousemove(event, currentDataPoint);
            }
        });
    };

    svgspark02.setCursor = function (sparkid, svg, values, options, index) {
        var currentDataPoint = svgspark02g[sparkid].datapoints[index];
        var x = currentDataPoint.x;
        var y = currentDataPoint.y;
        var fullHeight = svgspark02g[sparkid].fullHeight || 30;
        svgspark02g[sparkid].spot.setAttribute("cx", x);
        svgspark02g[sparkid].spot.setAttribute("cy", svgspark02g[sparkid].offsetY + y);
        svgspark02g[sparkid].cursor.setAttributeNS(null, "x1", x);
        svgspark02g[sparkid].cursor.setAttributeNS(null, "y1", svgspark02g[sparkid].offsetY);
        svgspark02g[sparkid].cursor.setAttributeNS(null, "x2", x);
        svgspark02g[sparkid].cursor.setAttributeNS(null, "y2", svgspark02g[sparkid].offsetY + svgspark02g[sparkid].fullHeight);
    };

    svgspark02.deleteGroup = function (sparkid, svg) {
        try {
        var gdel = document.getElementById(sparkid);
        gdel.remove();
        } catch(err) {
            console.log(err);
        }
        delete svgspark02g[sparkid];
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