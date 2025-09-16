'use strict';

var createApp = function (canvas) {
    var c = canvas.getContext("2d");

    // ====== New variables for animation control ======
    var sunPosition = 0;
    var sunRadius = 40;
    var animationFrameId;

    // ====== Function to draw the sky and ground ======
    var drawSkyAndGround = function (sunY) {
        // Change sky color based on sun position to simulate day to night
        const dayFactor = Math.abs(canvas.height / 2 - sunY) / (canvas.height / 2);
        const r = Math.floor(135 + 120 * (1 - dayFactor));
        const g = Math.floor(206 + 49 * (1 - dayFactor));
        const b = Math.floor(235 + 20 * (1 - dayFactor));
        c.fillStyle = `rgb(${r},${g},${b})`;
        c.fillRect(0, 0, canvas.width, canvas.height);

        // Ground color
        var floor = canvas.height / 2;
        var grad = c.createLinearGradient(0, floor, 0, canvas.height);
        grad.addColorStop(0, "green");
        grad.addColorStop(1, "black");
        c.fillStyle = grad;
        c.fillRect(0, floor, canvas.width, canvas.height);
    };

    // ====== New function to draw the sun ======
    var drawSun = function () {
        // Sun's X coordinate moves from left to right
        var sunX = canvas.width * sunPosition;
        // Sun's Y coordinate simulates an arc motion
        var sunY = (canvas.height * 0.4) * Math.sin(sunPosition * Math.PI) + (canvas.height * 0.1);

        c.beginPath();
        c.arc(sunX, sunY, sunRadius, 0, 2 * Math.PI);
        c.fillStyle = "yellow";
        c.fill();
        c.closePath();

        return sunY; // Return the sun's Y coordinate for sky color updates
    };

    // ====== Modified build function to draw a single building ======
    var windowSpacing = 2, floorSpacing = 3;
    var windowHeight = 5, windowWidth = 3;
    var blgColors = ['red', 'blue', 'gray', 'orange'];

    var build = function () {
        var x0 = Math.random() * canvas.width;
        var blgWidth = (windowWidth + windowSpacing) * Math.floor(Math.random() * 10);
        var blgHeight = Math.random() * canvas.height / 2;

        c.fillStyle = blgColors[Math.floor(Math.random() * blgColors.length)];
        c.fillRect(x0, canvas.height / 2 - blgHeight, blgWidth, blgHeight);

        const dy = floorSpacing + windowHeight;
        const dx = windowSpacing + windowWidth;
        const floors = Math.floor(blgHeight / dy);
        const cols = Math.floor(blgWidth / dx) - 1;
        const range = (n, delta, x0) => Array(n).fill(1).map((_, i) => x0 + i * delta);

        range(floors, dy, canvas.height / 2 - blgHeight + dy).forEach(y => {
            range(cols, dx, windowSpacing).forEach(x => {
                // ====== Modified here: random lights ======
                if (Math.random() < 0.7) {
                    c.fillStyle = "yellow";
                } else {
                    c.fillStyle = "black"; // Unlit windows are black
                }
                c.fillRect(x0 + x, y - windowHeight, windowWidth, windowHeight);
            });
        });
    };

    // ====== New main drawing and animation loop function ======
    var draw = function () {
        c.clearRect(0, 0, canvas.width, canvas.height);

        // **修正后的顺序：先画天空，再画太阳**
        var sunY = (canvas.height * 0.4) * Math.sin(sunPosition * Math.PI) + (canvas.height * 0.1);
        drawSkyAndGround(sunY);
        drawSun();

        // Redraw all buildings
        for (let i = 0; i < 15; i++) {
            build();
        }

        sunPosition += 0.005;
        if (sunPosition > 1) {
            sunPosition = 0;
        }

        animationFrameId = requestAnimationFrame(draw);
    };

    return {
        build: draw,
        stop: function () { cancelAnimationFrame(animationFrameId); }
    };
};

window.onload = function () {
    var app = createApp(document.querySelector("canvas"));
    document.getElementById("build").onclick = app.build;
    app.build();
};