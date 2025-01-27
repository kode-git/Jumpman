"use strict";

/**
 * This script manages interface to leverage actions on user interface buttons.
 */

// mouse movement 
var drag = false;
var lastX, lastY;
var dX = 0, dY = 0;

// camera controls
var theta = degToRad(90);
var phi = degToRad(10);
var D = 7;

var abs;

// Shadow flag
var isShadow = false;

// hidden flag
var hidden = false;

// play button
var play;

// objects decorators references
var objects;

// Logic button status trigger 
var gameStart; // check the status of the inner game 

// key to predict scrolls
var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

// mobile controls
var wKey, aKey, sKey, dKey;

// mobile keyboard
var mobile;

// initial Light Position and Angle for perspective illuminance
var lightPosition = [0, 15.0, 26.0];
var lightAngle = 50; // must be in degree
var lightNear = 10;
var lightFar = 200;
var lightTarget = [0, 0, -10];

// display frustum
var isFrustum = false;

// soundtrack
var soundtrack;

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; }
    }));
} catch (e) { }

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// control GUI
var gui = new dat.GUI();
var controls = {
    D: 40,
    shadow: false,
    image: false,
    frustum: false,
    lightX: lightPosition[0],
    lightY: lightPosition[1],
    lightZ: lightPosition[2],
    lightTargetX: lightTarget[0],
    lightTargetY: lightTarget[1],
    lightTargetZ: lightTarget[2],
    angleLight: lightAngle,
    lightNear: lightNear,
    lightFar: lightFar,
}
/**
 * Remove a default event action
 * @param {*} e is the event to trigger
 */
function preventDefault(e) {
    e.preventDefault();
}

/**
 * Remove a default event action related to a key
 * @param {*} e is the event of interest
 * @returns false if it trigger an interested key
 */
function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

/**
 * Disable windows scrolls
 */
function disableScroll() {
    window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
    window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
    window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
    window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

/**
 * Remove external objects from the interface.
 */
function initPreviewController() {
    for (let object of objects) {
        if (controls.image) {
            object.style.display = "none";
        }
        else {
            object.style.display = "block"
        }
    }
}

/**
 * Redirect to the index.html
 */
function linkInfo() {
    startGame = false;
    window.location.replace('./index.html');
}

/**
 * Start game status
 */
function startGame() {
    gameStart = true;
}

/**
 * Toggle the Start Buttons
 */
function toggleStartButtons() {
    if (gameStart) {
        play.style.display = "none";
    } else {
        play.style.display = "block";
    }
}

/**
 * Adding mobile commands into the display
 * @param {*} isMobile is the value that define if the device is mobile or not
 */
function toggleMobileButton(isMobile) {
    if (!isMobile) {
        mobile = document.getElementById('mobile-buttons');
        mobile.style.display = "none";
    } else {
        mobile.style.display = "block";
    }
}
/**
 * Main function.
 */
function initButtonControllers() {

    objects = document.getElementsByClassName('object');
    play = document.getElementById('play-button');

    // mobile keyboards
    aKey = document.getElementById('a-key');
    wKey = document.getElementById('w-key');
    sKey = document.getElementById('s-key');
    dKey = document.getElementById('d-key');

    // mobile container 
    mobile = document.getElementById('mobile-buttons');

    // initial interface status
    hidden = false;
    gameStart = false;

    play.onclick = startGame;

}


/**
 * Initialize the GUI interface provided by dat.GUI, it is available only in the game session
 */
function initInterfaceGUI() {
    gui.add(controls, "D").min(0).max(100).step(1).onChange(() => {
        D = controls.D;
    })
    gui.add(controls, "shadow").onChange(() => {
        isShadow = !isShadow;
    })
    gui.add(controls, "image").onChange(() => {
        initPreviewController();
    });
    gui.add(controls, "frustum").onChange(() => {
        isFrustum = !isFrustum;
    })
    gui.add(controls, "lightX").min(-10).max(40).step(0.1).onChange(() => {
        lightPosition[0] = controls.lightX;
    })
    gui.add(controls, "lightY").min(-10).max(40).step(0.1).onChange(() => {
        lightPosition[1] = controls.lightY;
    })
    gui.add(controls, "lightZ").min(-10).max(40).step(0.1).onChange(() => {
        lightPosition[2] = controls.lightZ;
    })
    gui.add(controls, "lightTargetX").min(-10).max(40).step(0.1).onChange(() => {
        lightTarget[0] = controls.lightTargetX;
    })
    gui.add(controls, "lightTargetY").min(-10).max(40).step(0.1).onChange(() => {
        lightTarget[1] = controls.lightTargetY;
    })
    gui.add(controls, "lightTargetZ").min(-10).max(40).step(0.1).onChange(() => {
        lightTarget[2] = controls.lightTargetZ;
    })
    gui.add(controls, "angleLight").min(0).max(360).step(1).onChange(() => {
        lightAngle = controls.angleLight;
    })
    gui.add(controls, "lightNear").min(1).max(40).step(1).onChange(() => {
        lightNear = controls.lightNear;
    })
    gui.add(controls, "lightFar").min(0).max(200).step(1).onChange(() => {
        lightFar = controls.lightFar;
    })

}

/**
 * Init script on load
 */
initButtonControllers();
disableScroll();