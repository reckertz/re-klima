
    /**
     * paintS - Sparklines für Monate Gesamt = alle Jahre
     * - Randauszählung der Zuordnungen zu Grad Celsius je Jahr
     */
    kla1625shm.paintS = function (selvariablename, selsource, selstationid, matrix) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         */
        var years = matrix.data;
        var tarray = [];
        array1 = []; // für d3 scatter
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: matrix1.rowheaders[year],
                    values: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1625shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1625shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1625shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1625shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        overflow: "auto"
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        border: "2",
                        rules: "all",
                        id: "kla1625shmt1",
                        css: {
                            "max-width": w + "px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
                            }))
                            .append($("<th/>", {
                                html: "m"
                            }))
                            .append($("<th/>", {
                                html: "c"
                            })).append($("<th/>", {
                                html: "r2"
                            }))
                            .append($("<th/>", {
                                html: "tmin"
                            }))
                            .append($("<th/>", {
                                html: "tmax"
                            }))
                            .append($("<th/>", {
                                html: "tavg"
                            }))

                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        /**
         * jeder Monat über alle Jahre eine Sparkline
         */
        var pcount = 0;
        var lvalue = tarray[0].values.length;
        if (lvalue > 365) lvalue = 365; // kleine Vereinfachung
        for (var ivalue = 0; ivalue < lvalue; ivalue++) {
            var monindex = ivalue;
            pcount++;
            var sparkid = '#spark' + pcount;
            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            var tsum = 0;
            var tcount = 0;
            for (var iarray = 0; iarray < tarray.length; iarray++) {
                // Iterate values
                var x = parseInt(tarray[iarray].year);
                var y;
                var temperatur = tarray[iarray].values[ivalue];
                if (temperatur === null) {
                    pearls.push(null);
                    y = null;
                } else {
                    pearls.push(parseFloat(temperatur));
                    y = parseFloat(temperatur);
                    if (miny === null) {
                        miny = y;
                    } else if (y < miny) {
                        miny = y;
                    }
                    if (maxy === null) {
                        maxy = y;
                    } else if (y > maxy) {
                        maxy = y;
                    }
                    tcount++;
                    tsum += y;
                }
                // Transformation von x und y
                //y = y + 273.15;  // Kelvin
                // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                regarray.push([x, y]);
            }
            var minyv = miny;
            var maxyv = maxy;
            var tavg = 0;
            var result = null;
            var gradient = null;
            var yIntercept = null;
            var r2 = null;
            if (miny !== null && maxy !== null) {
                result = regression.linear(regarray);
                gradient = result.equation[0].toFixed(2);
                yIntercept = result.equation[1].toFixed(2);
                r2 = result.r2.toFixed(2);
                minyv = minyv.toFixed(2);
                maxyv = maxyv.toFixed(2);
                if (tcount > 0) {
                    tavg = (tsum / tcount).toFixed(2);
                } else {
                    tavg = null;
                }
                array1.push({
                    temp: tavg || yIntercept,
                    gradient: gradient
                });
            }
            // Regression https://github.com/Tom-Alexander/regression-js
            // rowtit noch verfeinern für spezielle Termine, wie Tag/Nachtgleiche etc.
            var rowtit = "";
            if (tarray.length <= 12) {
                rowtit = 'M' + ("00" + (ivalue + 1)).slice(-2);
            } else {
                rowtit = 'D' + ("000" + (ivalue + 1)).slice(-3);
            }

            $("#kla1625shmt1")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: rowtit
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'spark' + pcount,
                            css: {
                                margin: "5px",
                                float: "left"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: gradient,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: yIntercept,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: r2,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'avg' + pcount,
                            html: tavg,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )


                );

            /**
             * Regressionsgerade berechnen und einblenden
             * return [m, c] aus y = mx + c; basierend auf regarray.push([x, y]);
             */
            var linarray = [];
            var newpearls = [];
            var isigvals = 0;
            if (result !== null) {
                for (var ilin = 0; ilin < regarray.length; ilin++) {
                    var newx = regarray[ilin][0];
                    var newp = result.predict(newx);
                    var newy = newp[1].toFixed(2);
                    var y = newp[1];
                    if (miny === null && y !== null) {
                        miny = y;
                    } else if (y !== null && y < miny) {
                        miny = y;
                    }
                    if (maxy === null && y !== null) {
                        maxy = y;
                    } else if (y !== null && y > maxy) {
                        maxy = y;
                    }
                    linarray.push([newx, newy]);
                    newpearls.push(newy);
                }
            }
            // $(sparkid).sparkline(pearls);

            $(sparkid).sparkline(pearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: 3,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "blue"
                /* composite: true */
            });
            if (result !== null) {
                $(sparkid).sparkline(newpearls, {
                    type: 'line',
                    /* height: 60, */
                    fillColor: false,
                    defaultPixelsPerValue: 3,
                    chartRangeMin: miny,
                    chartRangeMax: maxy,
                    lineColor: "red",
                    composite: true
                });
            }

        }
        $(".tablesorter").tablesorter({
            theme: "blue",
            /* widgets: ['filter'], */
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

    }; // ende paintS





    /**
     * paintT - Sparklines Matrix "as is" also per row
     * - Randauszählung der Zuordnungen zu Grad Celsius je Jahr
     * - Regressionsanalyse je Zeile
     */
    kla1625shm.paintT = function (selvariablename, selsource, selstationid, matrix) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         * tarray[i] mit year und values[]
         * colheaders direkt nutzbar
         */
        var years = matrix.data;
        var tarray = [];
        array1 = [];
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: matrix.rowheaders[year],
                    values: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1625shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1625shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1625shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1625shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        overflow: "auto"
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        border: "2",
                        rules: "all",
                        id: "kla1625shmt1",
                        css: {
                            "max-width": w + "px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
                            }))
                            .append($("<th/>", {
                                html: "m"
                            }))
                            .append($("<th/>", {
                                html: "c"
                            })).append($("<th/>", {
                                html: "r2"
                            }))
                            .append($("<th/>", {
                                html: "min"
                            }))
                            .append($("<th/>", {
                                html: "max"
                            }))
                            .append($("<th/>", {
                                html: "avg"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        /**
         * jeder Monat über alle Jahre eine Sparkline
         */
        var pcount = 0;
        var lvalue = tarray[0].values.length;
        if (lvalue > 365) lvalue = 365; // kleine Vereinfachung
        // Iteration über Zeilen = Jahre
        for (var iarray = 0; iarray < tarray.length; iarray++) {
            var monindex = ivalue;
            pcount++;
            var sparkid = '#spark' + pcount;
            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            var avgy = null;
            var tcount = 0;
            var tsum = 0;
            // Iteration über Werte, je Monat/je Tag/ ...
            for (var ivalue = 0; ivalue < lvalue; ivalue++) {
                // Iterate values
                var x = ivalue; // hier: laufende Periode im Jahr parseInt(tarray[iarray].year);
                var y;
                var temperatur = tarray[iarray].values[ivalue];
                if (temperatur === null) {
                    pearls.push(null);
                    y = null;
                } else {
                    pearls.push(parseFloat(temperatur));
                    y = parseFloat(temperatur);
                    if (miny === null) {
                        miny = y;
                    } else if (y < miny) {
                        miny = y;
                    }
                    if (maxy === null) {
                        maxy = y;
                    } else if (y > maxy) {
                        maxy = y;
                    }
                    tcount++;
                    tsum += y;
                }
                // Transformation von x und y
                //y = y + 273.15;  // Kelvin
                // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                regarray.push([x, y]);
            }
            var minyv = miny;
            var maxyv = maxy;
            var result = null;
            var gradient = null;
            var yIntercept = null;
            var r2 = null;
            if (miny !== null && maxy !== null) {
                result = regression.linear(regarray);
                gradient = result.equation[0].toFixed(2);
                yIntercept = result.equation[1].toFixed(2);
                r2 = result.r2.toFixed(2);
                minyv = minyv.toFixed(2);
                maxyv = maxyv.toFixed(2);
                if (tcount > 0) avgy = (tsum / tcount).toFixed(2);
                array1.push({
                    temp: r2,
                    /* yIntercept, */
                    gradient: gradient,
                    avg: avgy
                });
            }
            // Regression https://github.com/Tom-Alexander/regression-js
            // rowtit noch verfeinern für spezielle Termine, wie Tag/Nachtgleiche etc.
            var rowtit = tarray[iarray].year;

            $("#kla1625shmt1")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: rowtit
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'spark' + pcount,
                            css: {
                                margin: "5px",
                                float: "left",
                                "background-color": "yellow"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: gradient,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: yIntercept,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: r2,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'avg' + pcount,
                            html: avgy,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                );

            /**
             * Regressionsgerade berechnen und einblenden
             * return [m, c] aus y = mx + c; basierend auf regarray.push([x, y]);
             */
            var linarray = [];
            var newpearls = [];
            var isigvals = 0;
            if (result !== null) {
                for (var ilin = 0; ilin < regarray.length; ilin++) {
                    var newx = regarray[ilin][0];
                    var newp = result.predict(newx);
                    var newy = newp[1].toFixed(2);
                    var y = newp[1];
                    if (miny === null && y !== null) {
                        miny = y;
                    } else if (y !== null && y < miny) {
                        miny = y;
                    }
                    if (maxy === null && y !== null) {
                        maxy = y;
                    } else if (y !== null && y > maxy) {
                        maxy = y;
                    }
                    linarray.push([newx, newy]);
                    newpearls.push(newy);
                }
            }
            // $(sparkid).sparkline(pearls);
            var defaultpixel = 3;
            if (pearls.length > 350) defaultpixel = 2;
            $(sparkid).sparkline(pearls, {
                type: 'line',
                height: 60,
                fillColor: false,
                defaultPixelsPerValue: defaultpixel,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "blue"
                /* composite: true */
            });
            if (result !== null) {
                $(sparkid).sparkline(newpearls, {
                    type: 'line',
                    height: 60,
                    fillColor: false,
                    defaultPixelsPerValue: defaultpixel,
                    chartRangeMin: miny,
                    chartRangeMax: maxy,
                    lineColor: "red",
                    composite: true
                });
            }

        }
        $(".tablesorter").tablesorter({
            theme: "blue",
            /* widgets: ['filter'], */
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

    }; // ende paintT





    /**
     * paintU - Testen der Regression
     * - Regressionsanalyse je Zeile - concatenierte Werte 1 - Jahre
     */
    kla1625shm.paintU = function (selvariablename, selsource, selstationid, matrix) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         * tarray[i] mit year und values[]
         * colheaders direkt nutzbar
         */
        var years = matrix.data;
        var tarray = [];
        array1 = [];
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: matrix1.rowheaders[year],
                    values: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1625shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1625shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1625shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1625shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        overflow: "auto"
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        border: "2",
                        rules: "all",
                        id: "kla1625shmt1",
                        css: {
                            "max-width": w + "px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
                            }))
                            .append($("<th/>", {
                                html: "m"
                            }))
                            .append($("<th/>", {
                                html: "c"
                            })).append($("<th/>", {
                                html: "r2"
                            }))
                            .append($("<th/>", {
                                html: "min"
                            }))
                            .append($("<th/>", {
                                html: "max"
                            }))
                            .append($("<th/>", {
                                html: "avg"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        /**
         * jeder Monat über alle Jahre eine Sparkline
         */
        var pcount = 0;

        // Iteration über Zeilen = Jahre
        for (var iarray = 0; iarray < tarray.length; iarray++) {
            var monindex = ivalue;
            pcount++;
            var sparkid = '#spark' + pcount;
            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            var tsum = 0;
            var tcount = 0;
            // Iteration über Werte, je Monat/je Tag/ ...
            // Iteration über zu aggregierende Jahre
            for (var itest = 0; itest <= iarray; itest++) {
                // Werte eines Jahres
                var lvalue = tarray[itest].values.length; // tarray hat year als String und values als array
                if (lvalue > 365) lvalue = 365; // kleine Vereinfachung
                for (var ivalue = 0; ivalue < lvalue; ivalue++) {
                    // Iterate values
                    var x = ivalue; // hier: laufende Periode im Jahr parseInt(tarray[iarray].year);
                    var y;
                    var temperatur = tarray[itest].values[ivalue];
                    if (temperatur === null) {
                        pearls.push(null);
                        y = null;
                    } else {
                        pearls.push(parseFloat(temperatur));
                        y = parseFloat(temperatur);
                        if (miny === null) {
                            miny = y;
                        } else if (y < miny) {
                            miny = y;
                        }
                        if (maxy === null) {
                            maxy = y;
                        } else if (y > maxy) {
                            maxy = y;
                        }
                        tcount++;
                        tsum += y;
                    }
                    // Transformation von x und y
                    //y = y + 273.15;  // Kelvin
                    // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                    regarray.push([x, y]);
                }
            }
            var minyv = miny;
            var maxyv = maxy;
            var result = null;
            var gradient = null;
            var yIntercept = null;
            var r2 = null;
            var rstring = null;
            if (miny !== null && maxy !== null) {
                result = regression.linear(regarray);
                gradient = result.equation[0].toFixed(2);
                yIntercept = result.equation[1].toFixed(2);
                rstring = result.string;
                r2 = result.r2.toFixed(2);
                minyv = minyv.toFixed(2);
                maxyv = maxyv.toFixed(2);
                var avg = (tsum / tcount).toFixed(2);
                array1.push({
                    temp: r2,
                    /* yIntercept, */
                    gradient: gradient,
                    avg: avg
                });
            }
            var regmsg = "" + regarray.length + " Werte von ";
            regmsg += tarray[0].year + " bis " + tarray[iarray].year;
            regmsg += " => " + rstring;
            // Regression https://github.com/Tom-Alexander/regression-js
            // rowtit noch verfeinern für spezielle Termine, wie Tag/Nachtgleiche etc.
            var rowtit = tarray[iarray].year;

            $("#kla1625shmt1")
                .find("tbody")
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: rowtit
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'spark' + pcount,
                            html: regmsg,
                            css: {
                                margin: "5px",
                                float: "left"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: gradient,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: yIntercept,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'reg' + pcount,
                            html: r2,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'avg' + pcount,
                            html: avg,
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )

                );
        }
        $(".tablesorter").tablesorter({
            theme: "blue",
            /* widgets: ['filter'], */
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

    }; // ende paintU




    /**
     * paintChart - mit chartJS wird eine Gesamtgraphik ausgegeben
     * mit Skalierung etc.
     */
    kla1625shm.paintChart = function (bucketlength, selvariablename, selsource, selstationid) {
        /**
         * Bereitstellung der Daten
         */

        var matrix = matrix1;
        var years = matrix1.rowheaders;
        var tarray = [];
        for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {
            tarray.push({
                year: matrix1.rowheaders[iyear],
                days: matrix.data[iyear]
            });
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var anzyears = tarray.length;

        $("#kla1625shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1625shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1625shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h,
                        width: w,
                        "background-color": "white"
                    }
                })
                .append($("<canvas/>", {
                    id: "myChart",
                    css: {
                        height: h,
                        width: w
                    }
                }))
            );
        var datasets = [];
        var labels = [];
        var lab;
        for (var iday = 0; iday < 365; iday++) {
            var rowvalues = [];
            for (var iarray = 0; iarray < tarray.length; iarray++) {
                if (iday === 0) {
                    lab = "";
                    if (iarray % bucketlength === 0 || iarray === 0) {
                        lab = tarray[iarray].year;
                    }
                    labels.push(lab);
                }
                rowvalues.push(parseFloat(tarray[iarray].days[iday]));
            }
            datasets.push({
                label: "D" + ("000" + (iday + 1)).slice(-3),
                backgroundColor: '#00FFFF',
                borderColor: '#00FFFF',
                borderWidth: 1,
                pointRadius: 1,
                data: rowvalues,
                fill: false,
            });
        }
        var ctx = document.getElementById('myChart').getContext('2d');
        Chart.defaults.global.plugins.colorschemes.override = true;
        Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                plugins: {
                    colorschemes: {
                        scheme: 'tableau.HueCircle19'
                    }
                }
            }
        };
        window.chart1 = new Chart(ctx, config);
    };




    /**
     * Clusteranalyse mit https://www.npmjs.com/package/tayden-clusterfck
     */
    kla1625shm.clusterAnalysis = function (selvariablename, selsource, selstationid) {
        /**
         * Bereitstellung der Daten
         */
        var colorarray = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];

        //var years = stationrecord[selvariablename].years;
        var years = matrix1.data;
        var tarray = [];
        for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {

            tarray.push({
                year: matrix1.rowheaders[iyear],
                values: matrix1.data[iyear]
            });

        }

        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        var carray = [];
        var md5pointers = {};
        var objstrings = {};
        // null - substitute -999
        for (var ia = 0; ia < tarray.length; ia++) {
            var cvector = [];
            var iskip = false;
            for (var imo = 0; imo < tarray[0].values.length; imo++) {
                if (tarray[ia].values[imo] === null) {
                    //cvector.push(-9999);
                    iskip = true;
                    break;
                } else {
                    cvector.push(parseFloat(tarray[ia].values[imo]));
                }
            }
            if (iskip === true) continue;
            carray.push(cvector);
            var aktyear = tarray[ia].year;
            var md5pointer = md5(JSON.stringify(cvector));

            md5pointers[md5pointer] = aktyear;
            var objstring = cvector[cvector.length - 1].toString();
            objstrings[objstring] = aktyear;
        }
        /*  Input: nur Zahlen!!!
        carray = [
            [-20.2, -20, 80,20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [22, 22, -90, 20.2, 20, 80, -20.2, 20, 80,20.2, 40, 80],
            [250, 255, -253, 20.2, 20, 80, -20.2, 20, 80,20.2, 40, 80],
            [0, 30, 70, -20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [200, 0, 23, -20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [100, 54, 100, 20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80],
            [255, 13, 8, 20.2, 20, 80, 20.2, 20, 80,20.2, 40, 80]
         ];
         */
        /* MIT license; https://www.npmjs.com/package/tayden-clusterfck */
        // var clusters = clusterfck.kmeans(carray, 8);
        // var clusters = clusterfck.kmeans(carray);  // default ist sqrt(n) für n Zeilen/Vektoren - Fehlerquelle!
        var nclusters = Math.ceil(Math.sqrt(carray.length));
        var clusters = clusterfck.kmeans(carray, nclusters);

        for (var icluster = 0; icluster < clusters.length; icluster++) {
            console.log("Cluster:" + icluster);
            for (var ielem = 0; ielem < clusters[icluster].length; ielem++) {
                var md5pointer = md5(JSON.stringify(clusters[icluster][ielem]));
                var md5year = md5pointers[md5pointer];
                var objstring = clusters[icluster][ielem].toString();
                var objyear = objstrings[objstring];
                console.log(md5year + " " + JSON.stringify(clusters[icluster][ielem]));
            }
        }
        /**
         * Vorbereitung Ausgabebereich
         */
        $("#kla1625shmwrapper").empty();
        var h = $("#heatmap").height();
        var whm = $("#heatmap").width();
        /*
        if (whm <= heatmapparms.savedwidth) {
            var cdiff = Math.trunc(heatmapparms.colwidth * heatmapparms.wratio) + 1;
            $("#heatmap").width(whm + cdiff);
            var whmc = $("#" + cid).width();
            $("#" + cid).width(whmc + cdiff);
        }
        */

        var w = $("#kla1625shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;

        $("#kla1625shmwrapper").css({
            height: h,
            width: w,
            overflow: "auto"
        });

        var scw = uihelper.getScrollbarWidth($("#kla1625shmwrapper")[0].parentElement);
        /**
         * Loop zur Ausgabe der Charts zu den Clustern
         */
        var hmcc = document.getElementById(cid);
        var hmcctx = hmcc.getContext("2d");
        var ihit = 0;

        for (var icluster = 0; icluster < clusters.length; icluster++) {
            // Holen der Daten zu den Jahren eines Clusters aus stationrecord[selvariablename].years;
            // year wird label, 12 Monate werden die Werte
            var datasets = [];
            var labels = [];
            var vlen = tarray[0].values.length;
            if (vlen === 12) {
                for (var imon = 0; imon < vlen; imon++) {
                    labels.push("M" + ("00" + (imon + 1)).slice(-2));
                }
            } else {
                for (var imon = 0; imon < vlen; imon++) {
                    labels.push("T" + ("000" + (imon + 1)).slice(-3));
                }
            }

            var rowvalues = [];
            for (var ielem = 0; ielem < clusters[icluster].length; ielem++) {
                var md5pointer = md5(JSON.stringify(clusters[icluster][ielem]));
                var rowlabel = md5pointers[md5pointer];
                // rowvalues = stationrecord[selvariablename].years[rowlabel];
                // rowvalues = matrix1.data[rowlabel];
                // rowvalues = stationrecord.years[rowlabel];  // wäre ein String
                var year = rowlabel;
                for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {
                    if (year === matrix1.rowheaders[iyear]) {
                        rowvalues = matrix1.data[iyear];
                        break;
                    }
                }

                datasets.push({
                    label: rowlabel,
                    backgroundColor: '#00FFFF',
                    borderColor: '#00FFFF',
                    borderWidth: 1,
                    pointRadius: 1,
                    data: rowvalues,
                    fill: false,
                });
            }
            $("#kla1625shmwrapper")
                .append($("<div/>", {
                        css: {
                            height: h - scw,
                            width: w - scw,
                            "background-color": "white",
                            float: "left",
                            "margin-bottom": "15px"
                        }
                    })
                    .append($("<canvas/>", {
                        id: "myChart" + icluster,
                        css: {
                            height: h - scw,
                            width: w - scw
                        }
                    }))
                );

            var ctx = document.getElementById('myChart' + icluster).getContext('2d');
            Chart.defaults.global.plugins.colorschemes.override = true;
            Chart.defaults.global.legend.display = true;
            // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
            var clusterheader = "Cluster:" + (icluster + 1);
            clusterheader += " " + selsource;
            clusterheader += " " + stationrecord.stationid;
            clusterheader += " " + stationrecord.stationname;
            var config = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    title: {
                        display: true,
                        text: clusterheader
                    },
                    plugins: {
                        colorschemes: {
                            scheme: 'tableau.HueCircle19'
                        }
                    },
                    onClick: function (ev) {
                        var title = this.titleBlock;
                        if (!title) {
                            return;
                        }
                        var x = ev.x;
                        var y = ev.y;
                        if (x > title.left && x < title.right && y > title.top && y < title.bottom) {
                            alert('title clicked!');
                        }
                    }
                }
            };
            window.chart1 = new Chart(ctx, config);
        }
        /**
         * Ausgabe des Metaclusters
         */
        var metacluster = []; // n cluster mit 12 Monatswerten
        datasets = [];
        labels = [];
        var vlen = tarray[0].values.length;
        if (vlen === 12) {
            for (var imon = 0; imon < vlen; imon++) {
                labels.push("M" + ("00" + (imon + 1)).slice(-2));
            }
        } else {
            for (var imon = 0; imon < vlen; imon++) {
                labels.push("T" + ("000" + (imon + 1)).slice(-3));
            }
        }

        var yearsounds = [];
        var clusteravgs = [];
        for (var icluster = 0; icluster < clusters.length; icluster++) {
            var monsum = new Array(vlen).fill(0.0);
            var moncount = new Array(vlen).fill(0);
            for (var ielem = 0; ielem < clusters[icluster].length; ielem++) {
                var md5pointer = md5(JSON.stringify(clusters[icluster][ielem]));
                var year = md5pointers[md5pointer];
                var rowvalues = [];
                for (var iyear = 0; iyear < matrix1.rowheaders.length; iyear++) {
                    if (year === matrix1.rowheaders[iyear]) {
                        rowvalues = matrix1.data[iyear];
                        break;
                    }
                }
                yearsounds.push([year, icluster]);
                for (var imon = 0; imon < vlen; imon++) {
                    if (rowvalues[imon] !== null) {
                        monsum[imon] += parseFloat(rowvalues[imon]);
                        moncount[imon]++;
                    }
                }
            }

            var avgvalues = new Array(vlen).fill(0);
            var avgsum = 0;
            var avgcount = 0;
            for (var imo = 0; imo < vlen; imo++) {
                if (moncount[imo] > 0) {
                    avgvalues[imo] = monsum[imo] / moncount[imo];
                    avgsum += monsum[imo];
                    avgcount += moncount[imo];
                }
            }
            clusteravgs.push({
                icluster: icluster,
                avg: avgsum / avgcount
            });
            datasets.push({
                label: "Cluster:" + (icluster + 1),
                /* "M" + ("00" + (imon + 1)).slice(-2), */
                backgroundColor: '#00FFFF',
                borderColor: colorarray[icluster % 10],
                borderWidth: 1,
                pointRadius: 1,
                data: avgvalues,
                fill: false,
            });
        }
        // yearsounds[[year, icluster]]
        yearsounds.sort(function (a, b) {
            if (a[0] < b[0])
                return -1;
            if (a[0] > b[0])
                return 1;
            return 0;
        });
        var spanstring = "";
        var metaarray = [];

        for (var iy = 0; iy < yearsounds.length; iy++) {
            if (iy > 0) spanstring += ",";
            spanstring += yearsounds[iy][1];
            metaarray.push(Number(yearsounds[iy][1]));
        }

        $("#kla1625shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h - scw,
                        width: w - scw,
                        "background-color": "white",
                        float: "left",
                        "margin-bottom": "15px"
                        /* overflow: "auto" */
                    }
                })
                .append($("<canvas/>", {
                    id: "myMetaChart",
                    css: {
                        height: h - scw,
                        width: w - scw,
                        /* overflow: "auto" */
                    }
                }))
            );

        var metactx = document.getElementById('myMetaChart').getContext('2d');
        Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var clusterheader = "Meta-Cluster ";
        clusterheader += " " + selsource;
        clusterheader += " " + stationrecord.variable;
        clusterheader += " " + stationrecord.stationid;
        clusterheader += " " + stationrecord.stationname;
        clusterheader += " " + stationrecord.anzyears;
        clusterheader += " von:" + stationrecord.fromyear;
        clusterheader += " bis:" + stationrecord.toyear;
        clusterheader += " " + stationrecord.countryname;
        clusterheader += " " + stationrecord.region;
        clusterheader += " " + stationrecord.longitude;
        clusterheader += "/" + stationrecord.latitude;
        var config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                title: {
                    display: true,
                    text: clusterheader
                },

            }
        };
        window.chart1 = new Chart(metactx, config);
        /*
        clusteravgs.push({
            icluster: icluster,
            avg: avgsum/avgcount
        });
        */
        // absteigend
        clusteravgs.sort(function (a, b) {
            if (a.avg > b.avg)
                return -1;
            if (a.avg < b.avg)
                return 1;
            return 0;
        });
        var newval = 0;
        for (var ic = 0; ic < clusteravgs.length; ic++) {
            newval++;
            clusteravgs[ic].newval = newval;
        }
        clusteravgs.sort(function (a, b) {
            if (a.icluster < b.icluster)
                return -1;
            if (a.icluster < b.icluster)
                return 1;
            return 0;
        });
        var metaarray1 = [];
        for (var imeta = 0; imeta < metaarray.length; imeta++) {
            metaarray1.push(clusteravgs[metaarray[imeta]].newval);
        }

        $("#kla1625shmwrapper")
            .append($("<br/>"))
            .append($("<span/>", {
                id: "metasound",
                css: {
                    margin: "10px",
                    float: "left"
                }
            }))
            .append($("<button/>", {
                html: "Soundification  year/cluster#",
                css: {
                    margin: "10px"
                },
                click: function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    var splay = [];
                    for (var iy = 0; iy < yearsounds.length; iy++) {
                        splay.push(yearsounds[iy][1] + 100);
                    }
                    //var a = dtm.data(pearls[key]);
                    var a = dtm.data(splay);
                    dtm.music().note(a.range(60, 90)).play().for(24);
                    // dtm.music().note(a.range(20, 60)).play().for(12);
                    //dtm.music().note(a.range(0,10)).play();
                }
            }));
        $("#metasound").sparkline(metaarray, {
            type: 'line',
            fillColor: false,
            defaultPixelsPerValue: 3,
            lineColor: "blue"
            /* composite: true */
        });


        $("#kla1625shmwrapper")
            .append($("<br/>"))
            .append($("<span/>", {
                id: "metasound1",
                css: {
                    margin: "10px",
                    float: "left"
                }
            }))
            .append($("<button/>", {
                html: "Soundification year/cluster*",
                css: {
                    margin: "10px"
                },
                click: function (event) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    var splay = [];

                    for (var iy = 0; iy < metaarray1.length; iy++) {
                        splay.push(metaarray1[iy] + 100);
                    }
                    var a = dtm.data(splay);
                    dtm.music().note(a.range(60, 90)).play().for(24);
                    //  mit Callback - später mal richtig
                    /*
                    var mus0 = dtm.music().note(a.range(60,90)).play().for(24);
                    var mus1 = dtm.music(function (mus0,i) {
                        console.log(i);
                        var a1 = this.data(i).print();
                        console.log(a1);
                        dtm.music().note(a1).play();
                    });
                    mus1.trigger();
                    */
                }
            }));
        $("#metasound1").sparkline(metaarray1, {
            type: 'line',
            fillColor: false,
            defaultPixelsPerValue: 3,
            lineColor: "blue"
            /* composite: true */
        });

    };





    /**
     * bucketAnalysis - 30 Jahre zusammengefasst = Klimaperioden-Monatsaufbereitung
     */
    kla1625shm.bucketAnalysis = function (bucketlength, selvariablename, selsource, selstationid) {
        /**
         * Bereitstellung der Daten
         */
        var colorarray = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];
        var years = stationrecord[selvariablename].years;
        tarray = [];
        // Lückenfüllung in years
        var yearvals = Object.keys(years);
        // Korrektur auf bucketlength-Jahre Buckets
        var startyear = parseInt(yearvals[0]);
        var endyear = new Date().getFullYear();
        var diff1 = endyear - startyear + 1;
        var rem1 = diff1 % bucketlength;
        startyear = endyear - diff1 - (bucketlength - rem1) + 1;
        for (var iyear = startyear; iyear <= endyear; iyear++) {
            if (typeof years["" + iyear] === "undefined") {
                years["" + iyear] = new Array(12).fill(null);
            }
        }
        for (var year in years) {
            if (years.hasOwnProperty(year)) {
                tarray.push({
                    year: year,
                    months: years[year]
                });
            }
        }
        tarray.sort(function (a, b) {
            if (a.year < b.year)
                return -1;
            if (a.year > b.year)
                return 1;
            return 0;
        });
        /**
         * Vorbereitung Ausgabebereich
         */
        var scw = uihelper.getScrollbarWidth($("#kla1625shmwrapper")[0].parentElement);
        $("#kla1625shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1625shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1625shmwrapper")
            .append($("<div/>", {
                    css: {
                        height: h - scw,
                        width: w - scw,
                        "background-color": "white",
                        overflow: "auto"
                    }
                })
                .append($("<canvas/>", {
                    id: "myChartBucket",
                    css: {
                        height: h - scw,
                        width: w - scw
                    }
                }))
            );
        /**
         * Rahmen für die Sparklines mit Regressionsgerade zu den Buckets
         */
        var scw = uihelper.getScrollbarWidth($("#kla1625shmwrapper")[0].parentElement);
        var h = $("#heatmap").height();
        var w = $("#kla1625shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;

        /**
         * Tabelle 1 "kla1625shmt3" - Monatsspalten pivotiert
         */
        $("#kla1625shmwrapper")
            .append($("<div/>", {
                    css: {
                        width: w - scw,
                        "margin-top": "15px",
                        "z-index": 1,
                        position: "relative"
                        /* overflow: "auto" */
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        border: "2",
                        rules: "all",
                        id: "kla1625shmt3",
                        css: {
                            "max-width": (w - scw - 10) + "px",
                            "margin-top": "10px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Jahr"
                            }))
                            .append($("<th/>", {
                                html: "M01"
                            }))
                            .append($("<th/>", {
                                html: "M02"
                            }))
                            .append($("<th/>", {
                                html: "M03"
                            }))
                            .append($("<th/>", {
                                html: "M04"
                            }))
                            .append($("<th/>", {
                                html: "M05"
                            }))
                            .append($("<th/>", {
                                html: "M06"
                            }))
                            .append($("<th/>", {
                                html: "M07"
                            }))
                            .append($("<th/>", {
                                html: "M08"
                            }))
                            .append($("<th/>", {
                                html: "M09"
                            }))
                            .append($("<th/>", {
                                html: "M10"
                            }))
                            .append($("<th/>", {
                                html: "M11"
                            }))
                            .append($("<th/>", {
                                html: "M12"
                            }))
                            .append($("<th/>", {
                                html: "AVG"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        $("#kla1625shmt3").hide();
        /**
         * Tabelle 2 "kla1625shmt2"
         */
        $("#kla1625shmwrapper")
            .append($("<div/>", {
                    css: {
                        width: w - scw,
                        "margin-top": "15px",
                        "z-index": 2,
                        position: "relative"
                        /* overflow: "auto" */
                    }
                })
                .append($("<table/>", {
                        class: "tablesorter",
                        border: "2",
                        rules: "all",
                        id: "kla1625shmt2",
                        css: {
                            "max-width": (w - scw - 10) + "px",
                            "margin-top": "10px"
                        }
                    })
                    .append($("<thead/>")
                        .append($("<tr/>")
                            .append($("<th/>", {
                                html: "Jahr"
                            }))
                            .append($("<th/>", {
                                html: "Mon"
                            }))
                            .append($("<th/>", {
                                html: "Sparkline mit Regressionsgerade"
                            }))
                            .append($("<th/>", {
                                html: "m"
                            }))
                            .append($("<th/>", {
                                html: "c"
                            })).append($("<th/>", {
                                html: "r2"
                            }))
                            .append($("<th/>", {
                                html: "min"
                            }))
                            .append($("<th/>", {
                                html: "max"
                            }))
                        )
                    )
                    .append($("<tbody/>"))
                )
            );
        /**
         * Loop zur Ausgabe der Buckets
         */
        var hmcc = document.getElementById(cid);
        var hmcctx = hmcc.getContext("2d");
        var ihit = 0;
        // var anzyears = tarray.length;
        var anzyears = parseInt(tarray.length);
        var anzbuckets = Math.ceil(anzyears / bucketlength); // aufgerundet
        var labels = [];
        for (var imon = 0; imon < 12; imon++) {
            labels.push("M" + ("00" + (imon + 1)).slice(-2));
        }
        var datasets = [];
        var yearavgs = [];
        for (var ibucket = 1; ibucket <= anzbuckets; ibucket++) {
            var firstyear = (ibucket - 1) * bucketlength; // auf 0 als Basis im Array
            var lastyear = (ibucket) * bucketlength - 1; // also 0 - 29 im ersten Bucket bei 30
            if (lastyear >= anzyears) lastyear = anzyears - 1; // Absicherung
            // Holen der Daten zu den Jahren eines Clusters aus stationrecord[selvariablename].years;
            // year wird label, 12 Monate werden die Werte
            var rowvalues = [];
            var monsum = new Array(12).fill(0);
            var moncount = new Array(12).fill(0);
            kla1625shm.paintSB(bucketlength, selvariablename, selsource, selstationid, firstyear, lastyear, "kla1625shmt2", "kla1625shmt3");
            for (var iyear = firstyear; iyear <= lastyear; iyear++) {
                rowvalues = tarray[iyear].months;
                for (var imon = 0; imon < 12; imon++) {
                    if (rowvalues[imon] !== null) {
                        monsum[imon] += parseFloat(rowvalues[imon]);
                        moncount[imon]++;
                    }
                }
            }
            var avgvalues = new Array(12).fill(0);
            for (var imo = 0; imo < 12; imo++) {
                if (moncount[imo] > 0) {
                    avgvalues[imo] = monsum[imo] / moncount[imo];
                } else {
                    avgvalues[imo] = null;
                }
            } // years-Loop im Bucket
            var rowlabel = "ab:" + tarray[firstyear].year;
            datasets.push({
                label: rowlabel,
                /* "M" + ("00" + (imon + 1)).slice(-2), */
                backgroundColor: '#00FFFF',
                borderColor: '#00FFFF',
                borderWidth: 1,
                pointRadius: 1,
                data: avgvalues,
                fill: false,
            });
        } // bucket-Loop


        $(".tablesorter").tablesorter({
            theme: "blue",
            widgets: ['filter'],
            widthFixed: false,
            widgetOptions: {
                filter_hideFilters: false,
                filter_ignoreCase: true
            }
        }); // so funktioniert es

        $("#kla1625shmt3").show();

        var ctx = document.getElementById('myChartBucket').getContext('2d');
        Chart.defaults.global.plugins.colorschemes.override = true;
        Chart.defaults.global.legend.display = true;
        // https://nagix.github.io/chartjs-plugin-colorschemes/colorchart.html
        var bucketheader = "Buckets:";
        bucketheader += " " + selsource;
        bucketheader += " " + stationrecord.stationid;
        bucketheader += " " + stationrecord.stationname;
        var config = {
            type: 'line',
            data: {
                datasets: datasets,
                labels: labels
            },
            options: {
                title: {
                    display: true,
                    text: bucketheader
                },
                plugins: {
                    colorschemes: {
                        scheme: 'tableau.HueCircle19'
                    }
                },
            }
        };
        window.chart1 = new Chart(ctx, config);


        /**
         * Soundification for buckets https://ttsuchiya.github.io/dtm/doc/
         */
        /*
        $("#kla1625shmwrapper")
            .append($("<div/>", {
                    css: {
                        "max-width": (w - scw - 10) + "px",
                        float: "left"
                    }
                })
                .append($("<span/>", {
                    id: "metasound",
                    css: {
                        margin: "10px",
                        float: "left"
                    }
                }))
                .append($("<button/>", {
                    html: "Soundification  Buckets Winter",
                    css: {
                        margin: "10px"
                    },
                    click: function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                        var cvector = [];
                        var von = tarray.length - 30 - 1;
                        var bis = tarray.length - 1;
                        cvector = [];
                        for (var ia = von; ia <= bis; ia++) {
                            var iskip = false;
                            // Januar bis April
                            for (var imo = 0; imo < 3; imo++) {
                                if (tarray[ia].months[imo] === null) {
                                    //cvector.push(-9999);
                                    iskip = true;
                                    break;
                                } else {
                                    cvector.push(parseFloat(tarray[ia].months[imo]));
                                }
                            }
                            if (iskip === true) continue;
                            // November, Dezember
                            for (var imo = 10; imo < 12; imo++) {
                                if (tarray[ia].months[imo] === null) {
                                    //cvector.push(-9999);
                                    iskip = true;
                                    break;
                                } else {
                                    cvector.push(parseFloat(tarray[ia].months[imo]));
                                }
                            }
                            if (iskip === true) continue;
                        }
                        // Soundification
                        var splay = [];
                        for (var ic = 0; ic < cvector.length; ic++) {
                            splay.push(Number(cvector[ic]) + 100);
                        }
                        //var a = dtm.data(pearls[key]);
                        var a = dtm.data(splay);
                        dtm.music().note(a.range(60, 90)).play().for(24);
                    }
                }))
                .append($("<br/>"))
                .append($("<button/>", {
                    html: "Soundification  Buckets Sommer",
                    css: {
                        margin: "10px"
                    },
                    click: function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        event.stopPropagation();
                        var cvector = [];
                        var von = tarray.length - 30 - 1;
                        var bis = tarray.length - 1;
                        cvector = [];
                        for (var ia = von; ia <= bis; ia++) {
                            var iskip = false;
                            // Januar bis April
                            for (var imo = 4; imo < 10; imo++) {
                                if (tarray[ia].months[imo] === null) {
                                    //cvector.push(-9999);
                                    iskip = true;
                                    break;
                                } else {
                                    cvector.push(parseFloat(tarray[ia].months[imo]));
                                }
                            }
                            if (iskip === true) continue;
                        }
                        // Soundification
                        var splay = [];
                        for (var ic = 0; ic < cvector.length; ic++) {
                            splay.push(Number(cvector[ic]) + 100);
                        }
                        //var a = dtm.data(pearls[key]);
                        var a = dtm.data(splay);
                        dtm.music().note(a.range(60, 90)).play().for(24);
                    }
                }))
            );
            */
    };





    /**
     * paintSB - Sparklines für Monate eines Buckets
     * - von Jahr, bis Jahr für ein Bucket
     */
    kla1625shm.paintSB = function (bucketlength, selvariablename, selsource, selstationid, von, bis, tableid, tableid2) {
        /**
         * Aufbau des Rahmens für die Einzelgraphiken
         * table wird vorausgesetzt, es kommen nur die rows in die Table
         * tarray wird vorausgesetzt
         * ***
         */
        $("#" + tableid2)
            .append($("<tr/>")
                .append($("<td/>", {
                    html: tarray[von].year + "-" + tarray[bis].year
                }))
            );

        /**
         * jeder Monat über alle Jahre eines Bucket
         */
        var pcount = 0;
        var msum = 0;
        var mcount = 0;
        for (var imon = 0; imon < 12; imon++) {
            var monindex = imon;
            pcount++;
            var sparkid = 'spark' + von + "_" + pcount;

            var pearls = [];
            var regarray = [];
            var miny = null;
            var maxy = null;
            // rowvalues = tarray[iyear].months;
            for (var iarray = von; iarray <= bis; iarray++) {
                // Iterate Monate
                var x = parseInt(tarray[iarray].year);
                var y;
                var temperatur = tarray[iarray].months[imon];
                if (temperatur === null) {
                    pearls.push(null);
                    y = null;
                } else {
                    pearls.push(parseFloat(temperatur));
                    y = parseFloat(temperatur);
                    if (miny === null) {
                        miny = y;
                    } else if (y < miny) {
                        miny = y;
                    }
                    if (maxy === null) {
                        maxy = y;
                    } else if (y > maxy) {
                        maxy = y;
                    }
                }
                // Transformation von x und y
                //y = y + 273.15;  // Kelvin
                // x = iarray + 1; // hier wird numeriert, nicht die Jahreszahl verwendet, oben ist das Jahr
                regarray.push([x, y]);
            }
            if (miny !== null && regarray.length > 1) {
                var minyv = miny;
                var maxyv = maxy;
                // Regression https://github.com/Tom-Alexander/regression-js
                var result = regression.linear(regarray);
                if (result === null || result.length < 2) debugger;
                var gradient = result.equation[0];
                if (gradient === null) debugger;
                var yIntercept = result.equation[1];
                var gcolor;
                var cfakt;
                // percentage zwischen 0 und 1, daher transponieren
                if (gradient < -0.01) {
                    if (gradient < -5) {
                        cfakt = 1;
                    } else {
                        cfakt = (Math.abs(gradient)) / 5;
                    }
                    gcolor = kla9020fun.percentagetohsl(cfakt * 1, 160, 200); // blue
                } else if (gradient >= -0.01 && gradient < 0.01) {
                    cfakt = (Math.abs(gradient + 0.01));
                    gcolor = kla9020fun.percentagetohsl(cfakt, 90, 135); // green
                } else {
                    if (gradient > 5) {
                        cfakt = 1;
                    } else {
                        cfakt = (Math.abs(gradient)) / 5;
                    }
                    gcolor = kla9020fun.percentagetohsl((1 - cfakt), 1, 80); // red mit Kehrwert
                }


                $("#" + tableid2)
                    .find("tr:last")
                    .append($("<td/>", {
                        css: {
                            "text-align": "center",
                            "background-color": gcolor
                        },
                        html: gradient // zu 'M' + ("00" + (imon + 1)).slice(-2)
                    }));

            } else {

                $("#" + tableid2)
                    .find("tr:last")
                    .append($("<td/>", {
                        css: {
                            "text-align": "center"
                        },
                        html: "&nbsp;" // zu 'M' + ("00" + (imon + 1)).slice(-2)
                    }));
                continue;
            }

            msum += gradient;
            mcount++;

            $("#" + tableid)
                .append($("<tr/>")
                    .append($("<td/>", {
                        html: tarray[von].year + "-" + tarray[bis].year
                    }))
                    .append($("<td/>", {
                        html: 'M' + ("00" + (imon + 1)).slice(-2)
                    }))
                    .append($("<td/>")
                        .append($("<span/>", {
                            class: "mouseoverdemo",
                            id: sparkid,
                            css: {
                                margin: "5px",
                                float: "left"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            html: gradient.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            html: yIntercept.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            html: result.r2.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>")
                        .append($("<span/>", {
                            id: 'min' + pcount,
                            html: minyv.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                    .append($("<td/>", {

                        })
                        .append($("<span/>", {
                            id: 'max' + pcount,
                            html: maxyv.toFixed(2),
                            css: {
                                margin: "5px",
                                float: "right"
                            }
                        }))
                    )
                );

            /**
             * Regressionsgerade berechnen und einblenden
             * return [m, c] aus y = mx + c; basierend auf regarray.push([x, y]);
             */
            var linarray = [];
            var newpearls = [];
            for (var ilin = 0; ilin < regarray.length; ilin++) {
                var newx = regarray[ilin][0];
                var newp = result.predict(newx);
                var newy = newp[1].toFixed(2);
                var y = newp[1];
                if (miny === null && y !== null) {
                    miny = y;
                } else if (y < miny) {
                    miny = y;
                }
                if (maxy === null && y !== null) {
                    maxy = y;
                } else if (y > maxy) {
                    maxy = y;
                }
                linarray.push([newx, newy]);
                newpearls.push(newy);
            }

            // $(sparkid).sparkline(pearls);

            $("#" + sparkid).sparkline(pearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: 3,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "blue"
                /* composite: true */
            });
            $("#" + sparkid).sparkline(newpearls, {
                type: 'line',
                /* height: 60, */
                fillColor: false,
                defaultPixelsPerValue: 3,
                chartRangeMin: miny,
                chartRangeMax: maxy,
                lineColor: "red",
                composite: true
            });

        }

        if (mcount > 0) {
            var gradient = (msum / mcount).toFixed(2);
            var gcolor;
            var cfakt;
            // percentage zwischen 0 und 1, daher transponieren
            if (gradient < -0.01) {
                if (gradient < -5) {
                    cfakt = 1;
                } else {
                    cfakt = (Math.abs(gradient)) / 5;
                }
                gcolor = kla9020fun.percentagetohsl(cfakt * 1, 160, 200); // blue
            } else if (gradient >= -0.01 && gradient < 0.01) {
                cfakt = (Math.abs(gradient + 0.01));
                gcolor = kla9020fun.percentagetohsl(cfakt, 90, 135); // green
            } else {
                if (gradient > 5) {
                    cfakt = 1;
                } else {
                    cfakt = (Math.abs(gradient)) / 5;
                }
                gcolor = kla9020fun.percentagetohsl((1 - cfakt), 1, 80); // red mit Kehrwert
            }

            $("#" + tableid2)
                .find("tr:last")
                .append($("<td/>", {
                    css: {
                        "text-align": "center",
                        "background-color": gcolor
                    },
                    html: gradient // zu 'M' + ("00" + (imon + 1)).slice(-2)
                }));
        } else {
            $("#" + tableid2)
                .find("tr:last")
                .append($("<td/>", {
                    css: {
                        "text-align": "center"
                    },
                    html: "&nbsp;" // zu 'M' + ("00" + (imon + 1)).slice(-2)
                }));
        }
    }; // ende paintSB


        /**
     * scatter - Scattergramm erzeugen aus array1 in festes Zielgebiet
     * array1 hat pairs mit Objekten aus gradient und temp (avg-Temp)
     * das ist zu verallgemeinern mit x und y als Übergaben und
     * Konfiguration bzw. Beschriftung, die dem Anwender die Bedeutung erklärt
     */
    kla1625shm.scatter = function () {

        $("#kla1625shmwrapper").empty();
        var h = $("#heatmap").height();
        var w = $("#kla1625shm.content").width();
        w -= $("#heatmap").position().left;
        w -= $("#heatmap").width();
        w -= 40;
        $("#kla1625shmwrapper").css({
            overflow: "hidden",
            height: h,
            width: w
        });

        $("#kla1625shmwrapper")
            .append($("<div/>", {
                id: "my_dataviz",
                css: {
                    height: h,
                    width: w,
                    overflow: "auto",
                    "background-color": "white"
                }
            }));


        // set the dimensions and margins of the graph
        var margin = {
                top: 10,
                right: 30,
                bottom: 30,
                left: 60
            },
            width = 920 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var minx = null;
        var maxx = null;
        var miny = null;
        var maxy = null;
        for (var ind = 0; ind < array1.length; ind++) {
            var x = parseFloat(array1[ind].temp);
            var y = parseFloat(array1[ind].gradient);
            if (minx === null) {
                minx = x;
            } else if (minx > x) {
                minx = x;
            }

            if (maxx === null) {
                maxx = x;
            } else if (maxx < x) {
                maxx = x;
            }

            if (miny === null) {
                miny = y;
            } else if (miny > y) {
                miny = y;
            }

            if (maxy === null) {
                maxy = y;
            } else if (maxy < y) {
                maxy = y;
            }
        }
        //Read the data - or provide the data
        var data = array1;

        //d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function (data) {
        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, 0])
            .range([0, width]);
        svg.append("g")
            .attr("class", "myXaxis") // Note that here we give a class to the X axis, to be able to call it later and modify it
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("opacity", "0");

        // Add Y axis -  .domain([0, 500000])    .range([height, 0]);
        var y = d3.scaleLinear()
            .domain([miny, maxy])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d.temp);
            })
            .attr("cy", function (d) {
                return y(d.gradient);
            })
            .attr("r", 1.5)
            .style("fill", "#69b3a2");

        // new X axis - x.domain([0, 4000])
        x.domain([minx, maxx]);
        svg.select(".myXaxis")
            .transition()
            .duration(2000)
            .attr("opacity", "1")
            .call(d3.axisBottom(x));

        svg.selectAll("circle")
            .transition()
            .delay(function (d, i) {
                return (i * 3);
            })
            .duration(2000)
            .attr("cx", function (d) {
                return x(d.temp);
            })
            .attr("cy", function (d) {
                return y(d.gradient);
            });
        // })

    };




    kla1625shm.activateDragDrop = function () {
        // Dragdrop aktivieren, umstellen auf offset
        var box = $(".heatvardiv");
        var mainCanvas = $(".kla1625shmwrapper");
        box.draggable({
            containment: mainCanvas,
            helper: "clone",
            start: function () {
                $(this).css({
                    opacity: 0
                });
                $(".box").css("z-index", "0");
            },
            stop: function () {
                $(this).css({
                    opacity: 1
                });
            }
        });
        box.droppable({
            accept: box,
            drop: function (event, ui) {
                var draggable = ui.draggable;
                var droppable = $(this);
                var dragOff = draggable.offset();
                var dropOff = droppable.offset();
                ui.draggable.offset(dropOff);
                draggable.offset(dropOff);
                droppable.offset(dragOff);
            }
        });
    };


