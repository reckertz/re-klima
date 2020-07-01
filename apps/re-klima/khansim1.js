/*********************************************************
 * https://www.khanacademy.org/science/cosmology-and-astronomy/earth-history-topic/earth-title-topic/pi/season-simulator
 * https://www.khanacademy.org/computer-programming/season-simulator/2131015999 
 * Why are there seasons?
 * Why are there no seasons near the equator?
 **********************************************************/
// Scale down image to fit on screen
var scalingFactor = 0.5;
var speed = 12; // Change in hours per update
var resolution = 20; // How accurate orbit speed is
var running = true;

// Poistion of windows
var divX = 200;
var divY = 190;

// Sun parameters
var sunX = 100;
var sunY = 104;
var sunR = 21;
var flare = 3;
var flareA = 10;

var earthData = {
    name: "Earth",
    size: 15,
    colour: color(61, 100, 255),
    perihelion: 147, // million km
    aperihelion: 152, // million km
    peri_longitude: 102, // degrees
    asc_longitude: 348.7, // degrees
    inclination: 0, // degrees (by defintion)
    year: 365.25, // earth days
    mass: 5.97 // 10^24 kg
};

var earthTilt = 23.4; // degrees
var SUNLIGHT = color(255, 255, 0, 80);

var Planet = function (data, angle) {
    this.name = data.name;
    this.year = data.year;
    this.r = data.size;
    this.colour = data.colour;

    // Distance from ellipse centre to sun
    var focusDist = scalingFactor * (data.aperihelion - data.perihelion) / 2;

    // Ellipse axes
    var major = scalingFactor * data.aperihelion - focusDist;
    var minor = sqrt(major * major - focusDist * focusDist);

    // Store these to save repeatedly calculating them
    var phi = data.peri_longitude;
    var cosPhi = cos(phi);
    var sinPhi = sin(phi);

    // Center of ellipse
    var cx = sunX - focusDist * cosPhi;
    var cy = sunY + focusDist * sinPhi;

    // Handy properties for calculations
    var eccentricity = focusDist / major;
    var angleConstant = 360 * major * minor / data.year;

    this.findPosition = function (angle) {
        angle -= phi;

        // Radius of ellipse at this angle
        var r = major * (1 - eccentricity * eccentricity) /
            (1 + eccentricity * cos(angle));

        // Position based on non-rotated ellipse
        var x = r * cos(angle) + focusDist;
        var y = r * sin(angle);

        // Rotate based on ellipse rotation
        return [cx + x * cosPhi - y * sinPhi,
            cy - x * sinPhi - y * cosPhi
        ];
    };

    // Set planet's position using its angle
    this.setPosition = function (angle) {
        if (angle !== undefined) {
            // Angle relative the perihelion
            this.angle = angle - phi;
        }

        // Radius of ellipse at this angle
        var r = major * (1 - eccentricity * eccentricity) /
            (1 + eccentricity * cos(this.angle));

        // Position based on non-rotated ellipse
        var x = r * cos(this.angle) + focusDist;
        var y = r * sin(this.angle);

        // Rotate based on ellipse rotation
        this.x = cx + x * cosPhi - y * sinPhi;
        this.y = cy - x * sinPhi - y * cosPhi;
    };
    this.setPosition(angle);

    // Add a numbers of days to the orbit
    this.update = function (hours) {
        var sign = hours < 0 ? -1 / resolution : 1 / resolution;
        sign /= 24;

        for (var d = 0; d < abs(hours) * resolution; d++) {
            // Distance from sun
            var r = major * (1 - eccentricity * eccentricity) /
                (1 + eccentricity * cos(this.angle));

            // Update angle around sun
            this.angle += sign * angleConstant / (r * r);
        }
        this.setPosition();
    };

    this.draw = function (x, y, r) {
        var x = x || this.x;
        var y = y || this.y;
        var r = r || data.size;
        noStroke();
        fill(this.colour);
        ellipse(x, y, r, r);
    };

    this.drawCycle = function () {
        translate(cx, cy);
        rotate(phi);
        ellipse(0, 0, major * 2, minor * 2);
        resetMatrix();
    };

    this.drawCenter = function () {
        noFill();
        strokeWeight(1);
        stroke(80);
        var dx = major * cosPhi;
        var dy = major * sinPhi;
        line(cx + dx, cy - dy, cx - dx, cy + dy);

        strokeWeight(2);
        this.drawCycle();

        /*
        fill(255);
        textSize(11);
        textAlign(RIGHT, BASELINE);
        text("Perihelion", cx + (major + 2) * cosPhi - 6, cy - (major + 2) * sinPhi);
        textAlign(LEFT, BASELINE);
        text("Aperihelion",  cx - (major + 10) * cosPhi + 6, cy + (major + 10) * sinPhi);
        */

    };

    this.mouseOverCycle = function () {
        var d = dist(mouseX, mouseY, sunX, sunY);
        return d >= minor - this.r && d <= major + this.r;
    };
};

// Create the Earth
// At 6pm 28th August 2003, Earth and Mars in opposition
var _year = 2003;
var _day = 239.75;
var earthAngle = 335.6;
var earth = new Planet(earthData, earthAngle);

var drawPlayButton = function () {
    // Play / Pause
    var r = 18;
    var x = 14;
    var y = 14;
    var c;

    if (dist(mouseX, mouseY, x, y) <= r) {
        c = color(250, 250, 250);
    } else {
        c = color(160, 160, 160);
    }

    noFill();
    stroke(c);
    strokeWeight(2);
    ellipse(x, y, r, r);

    noStroke();
    fill(c);
    if (running) {
        rect(x - 4, y - 5, 3, 10, 5);
        rect(x + 1, y - 5, 3, 10, 5);
    } else {
        triangle(x - 3, y - 5, x - 3, y + 5, x + 6, y);
    }
};

var drawSun = function () {
    noStroke();
    fill(255, 204, 0);
    ellipse(sunX, sunY, sunR, sunR);
    fill(255, 151, 33, 200);

    beginShape();
    curveVertex(sunX + sunR / 2 + flare, sunY);
    var up = true;
    for (var i = 0; i <= 360; i += flareA) {
        var r = up ? sunR / 2 + flare : sunR / 2;
        curveVertex(sunX + r * cos(i),
            sunY + r * sin(i));
        up = !up;
    }
    curveVertex(sunX + sunR / 2, sunY);
    endShape();
};

/*
var drawEarth = function() {
    noStroke();
    fill(0, 16, 32);
    var a = atan2(earthY - sunY, earthX - sunX);
    translate(earthX, earthY);
    rotate(a);
    ellipse(1, 0, earthR*2, earthR*2);
    //image(earthImage, -earthR, -earthR-2);
    resetMatrix();
};

var getSphereImage = function(r, theta, col, colT) {
    var img = createGraphics(r*2+2, r*2+2, JAVA2D);
    img.beginDraw();
    img.background(0, 0, 0, 0);

    var r2 = r*r;
    var s = 90 /r;

    for (var y = -r; y <= r; y++) {
        var d = sqrt(r2 - y*y);
        var rd = round(d);
        var light1 = cos(s * y);
        var w = 90 / d;

        for (var x = -rd-1; x <= rd+1; x++) {
            var p = light1 * cos(theta + (x / d) * 90);
            if (p >= 0 && p <= 1) {
                if (x < -rd || x > rd) {
                    p *= d + 0.5 - rd;
                }
                var c = lerpColor(colT, col, p);
                img.stroke(c);
                img.point(r+x+1, r+y+1);
            }
        }
    }

    return img;
};
*/

/*******************************************************
 *         Date functions
 *******************************************************/

var months = {
    January: 31,
    February: 28,
    March: 31,
    April: 30,
    May: 31,
    June: 30,
    July: 31,
    August: 31,
    September: 30,
    October: 31,
    November: 30,
    December: 31
};

var isLeapYear = function (y) {
    return (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0));
};

var dayToDate = function (d, y) {
    for (var m in months) {
        var days = months[m];
        if (m === 'February' && isLeapYear(y)) {
            days++;
        }
        if (d <= days) {
            return [d, m];
        } else {
            d -= days;
        }
    }
    return [d, m];
};

var convertDayToYear = function (days) {
    var y = 0;

    if (days > 365) {
        while (true) {
            var n = 365 + isLeapYear(_year + y);
            if (days > n) {
                days -= n;
                y++;
            } else {
                break;
            }
        }
    } else if (days < 0) {
        while (true) {
            if (days < 0) {
                var n = 365 + isLeapYear(_year - 1 - y);
                days += n;
                y--;
            } else {
                break;
            }
        }
    }

    return [y, days];
};

var updateDate = function (days) {
    _day += days;
    var y = convertDayToYear(_day);
    _day = y[1];
    _year += y[0];
};

var getKM = function (d) {
    return round(10 * d / scalingFactor) / 10;
};

var getAU = function (d) {
    return round(1000 * d / scalingFactor / 149.597871) / 1000;
};

/*******************************************************
 *         Draw functions
 *******************************************************/
var drawEarthInSunlight = function (x, y, w, h) {
    var d = 25;
    var r = h - d * 2;
    var cx = x + w - r / 2 - 10;
    var cy = y + h - r / 2 - d;

    // Axis
    strokeWeight(2);
    stroke(255);
    var length = 20;
    var ct = cos(90 - earthTilt);
    var st = sin(90 - earthTilt);
    var dy1 = r / 2 * st;
    var dy2 = (r / 2 + length) * st;
    var r1 = r / 2 * ct;
    var r2 = (r / 2 + length) * ct;

    var angle = atan2(earth.y - sunY, earth.x - sunX) - 90;
    r1 *= cos(angle);
    r2 *= cos(angle);

    // Change order so either top or bottom axis is partly obscured
    if (abs(angle + 90) < 90) {
        // Top axis
        line(cx - r1, cy - dy1, cx - r2, cy - dy2);

        // Earth
        noStroke();
        fill(earth.colour);
        ellipse(cx, cy, r, r);

        // Bottom axis
        strokeWeight(2);
        stroke(255);
        line(cx + r1, cy + dy1, cx + r2, cy + dy2);
    } else {
        // Bottom axis
        line(cx + r1, cy + dy1, cx + r2, cy + dy2);

        // Earth
        noStroke();
        fill(earth.colour);
        ellipse(cx, cy, r, r);

        // Top axis
        strokeWeight(2);
        stroke(255);
        line(cx - r1, cy - dy1, cx - r2, cy - dy2);
    }

    strokeWeight(1);
    stroke(255, 255, 255, 220);
    noFill();

    translate(cx, cy);
    rotate(-earthTilt * cos(angle));

    // Equator
    arc(0, 0, r - 1, r / 2 * ct * sin(angle), 0, 180);

    // Tropics
    stroke(255, 255, 255, 100);
    arc(0, r / 2 * ct, dy1 * 2 - 1, dy1 * ct * sin(angle), 0, 180);
    arc(0, -r / 2 * ct, dy1 * 2 - 1, dy1 * ct * sin(angle), 0, 180);

    // Arctic and Antarctic circles
    arc(0, r / 2 * st, r * ct - 1, r / 2 * ct * ct * sin(angle), 0, 180);
    arc(0, -r / 2 * st, r * ct - 1, r / 2 * ct * ct * sin(angle), 0, 180);

    textAlign(RIGHT, CENTER);
    fill(255);
    text("A", -r * ct / 2 - 5, -r / 2 * st);
    text("C", -dy1 - 3, -r / 2 * ct);
    text("E", -r / 2 - 3, 0);

    resetMatrix();

    // Sunlight
    noStroke();
    fill(SUNLIGHT);
    rect(x, d - 1, cx - x, r);

    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);
    text("N", cx - min(r1, r2) + 3, cy - r / 2 - 17);
    text("S", cx + max(r1, r2) + 3, cy + r / 2 + 3);
};

var drawSunIntensity = function (x, y, w, h) {
    var places = ["(A) Arctic",
        "(C) Tropic\nof Cancer",
        "(E) Equator"
    ];
    var degrees = [66.6, 23.4, 0];
    var angle = atan2(earth.y - sunY, earth.x - sunX);

    var d = 8;
    var boxH = round((h - 12 - d * 5) / 3);
    var barWidth = (w - 4 * d) / 24;
    var barHeight = boxH - 10;

    // Ground and light positions
    var gx = 365;
    var length = 20;
    var lx = gx - 45;

    fill(250);
    textSize(14);
    textAlign(LEFT, TOP);
    text("Light intensity", 4, y + 4);
    text("Light angle", lx, y + 4);

    // Hours
    textAlign(CENTER, BASELINE);
    textSize(10);
    for (var i = 0; i <= 24; i += 2) {
        text(i, x + d * 2 + barWidth * i, y + h - 15);
    }
    textSize(11);
    text("Hours of the day", x + d + w / 2, y + h - 4);

    var c1 = color(20, 20, 250);
    var c2 = color(200, 20, 20);

    for (var i in places) {
        var y = divY + d + i * (boxH + d);
        var theta = sin(angle) * earthTilt;
        var groundAngle = theta - degrees[i];
        var intensity = cos(groundAngle);
        var hours = sin(theta) * sin(degrees[i]) / cos(degrees[i]);
        var dawn = 6 * (1 - hours);
        var dusk = 6 * (3 + hours);
        var dayLength = dusk - dawn;

        noStroke();
        // Draw bars
        for (var h = round(dawn); h <= round(dusk); h++) {
            var strength = intensity * cos(180 * (12 - h) / dayLength);
            if (strength < 0) {
                continue;
            }

            fill(lerpColor(c1, c2, strength));
            rect(x + d * 2 + (h - 0.5) * barWidth,
                y + 1 + boxH - barHeight * strength,
                barWidth - 1,
                barHeight * strength);
        }

        // Axis
        stroke(255);
        strokeWeight(1);
        line(x + d, y + boxH + 1, x + w - d, y + boxH + 1);

        // Place labels and mid-bar label
        fill(255);
        textSize(10);
        textAlign(CENTER, BOTTOM);
        text(round(intensity * 100),
            x + d * 2 + 12 * barWidth,
            y + boxH - barHeight * intensity);
        textSize(12);
        textAlign(LEFT, CENTER);
        text(places[i], x + d, y + boxH / 2);

        // Ground angle
        var gy = y + boxH / 2 + 5;
        var dx = length * sin(groundAngle);
        var dy = length * cos(groundAngle);

        noStroke();
        fill(250, 250, 0, 200);
        quad(lx, gy - dy, lx, gy + dy,
            gx + dx, gy + dy, gx - dx, gy - dy);

        strokeWeight(3);
        stroke(lerpColor(c1, c2, intensity));
        line(gx + dx, gy + dy, gx - dx, gy - dy);

        fill(255);
        textSize(10);
        textAlign(CENTER, TOP);
        text(round(90 - abs(groundAngle)) + "°", gx, gy + dy + 3);
    }
};

var drawEarthAxis = function () {
    var axisLength = 8;
    strokeWeight(1);
    stroke(250);
    line(earth.x, earth.y - sin(earthTilt) * earth.r / 2,
        earth.x, earth.y - axisLength);
    line(earth.x, earth.y + earth.r / 2, earth.x, earth.y + axisLength);
};

var drawArrowToEarth = function () {
    // Draw arrow
    stroke(220, 220, 0);
    strokeWeight(5);
    var angle = atan2(earth.y - sunY, earth.x - sunX);

    var x1 = sunX + scalingFactor * 95 * cos(angle);
    var y1 = sunY + scalingFactor * 95 * sin(angle);
    line(sunX + 20 * cos(angle), sunY + 20 * sin(angle), x1, y1);

    translate(x1, y1);
    rotate(angle - 90);
    // Arrowhead
    noStroke();
    fill(220, 220, 0);
    triangle(-5, -3, 5, -3, 0, 12);

    // Distance label
    fill(255, 255, 255);
    textSize(10);
    textAlign(CENTER, CENTER);
    var distance = dist(sunX, sunY, earth.x, earth.y);
    if (abs(angle) > 90) {
        rotate(270);
        text(getAU(distance) + " AU", 10, -12);
    } else {
        rotate(90);
        text(getAU(distance) + " AU", -10, -12);
    }

    resetMatrix();

    // Draw sunlight
    fill(SUNLIGHT);
    noStroke();
    arc(earth.x, earth.y, earth.r, earth.r, angle + 90, angle + 270);

};

var drawOrbit = function () {
    earth.drawCenter();
    earth.draw();

    drawEarthAxis();
    drawArrowToEarth();

    // Draw earth marker where mouse is
    if (earth.mouseOverCycle()) {
        var angle = -atan2(mouseY - sunY, mouseX - sunX);
        var coord = earth.findPosition(angle);
        fill(255, 255, 255, 80);
        ellipse(coord[0], coord[1], earth.r + 2, earth.r + 2);
    }

    drawSun();
};

var draw = function () {
    if (running) {
        for (var i = 0; i < speed; i++) {
            updateDate(1 / 24);
            earth.update(1);
        }
    }

    background(0);

    // Grid
    strokeWeight(1);
    stroke(120);
    line(0, divY, 400, divY);
    line(divX, 0, divX, divY);

    // Labels
    fill(255);
    textSize(13);
    textAlign(LEFT, TOP);
    var _date = dayToDate(_day);
    text(_date[1] + " " + ceil(_date[0]), 30, 5);


    drawOrbit();
    drawPlayButton();
    drawEarthInSunlight(divX, -1, 400 - divX, divY);
    drawSunIntensity(5, divY, 400 - 104, 400 - divY);
};

// Spacebar toggles animation
var keyPressed = function () {
    if (keyCode === 32) {
        running = !running;
    }
};

var mouseReleased = function () {
    // Play / Pause
    if (dist(mouseX, mouseY, 14, 14) <= sunR / 2) {
        running = !running;
    }

    // Pick position
    if (earth.mouseOverCycle()) {
        var angle = -atan2(mouseY - sunY, mouseX - sunX);
        earth.setPosition(angle);
        _day = (angle - earthData.peri_longitude + 360) * 365 / 360;
        _day %= 365;
        running = false;
    }
};