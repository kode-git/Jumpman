
//===================================================
//              Main script for the game
//===================================================


/*
============================================
        Global Variables Declarations
===========================================
*/

var gl, canvas, textCanvas, textContext;


// Scroll problems ontouchmove
// Chrome adaptation
try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; }
    }));
} catch (e) { }
var supportsPassive = false;
var wheelOpt = supportsPassive ? { passive: false } : false;

// GLSL Programs
var envProgramInfo, skyboxProgramInfo;

var numVertices;

// ========= Environment Object ============
var parts;
var range;
var objOffset;
var sharedUniforms;

// ======== Skybox Object ===========
var quadBufferInfo; // SkyBox buffer
var texture; // Skybox texture


// Fixed light parameters (the light position is managed in the interface.js)
var ambientLight = [0.1, 0.1, 0.1];
var lightAmbient =  lightPosition;
var lightDiffuse = [0.8, 0.8, 0.8];
var lightSpecular = [1.0, 1.0, 1.0];
var lightEmissive = [0, 0, 0]; // no emission
var lightOpacity = 1;
var lightShiness = 120;

// Shadow 
var depthFramebuffer, depthTexture, unusedTexture;
var depthTextureSize;

// ========================================

// ============= Prospective  =============
var fieldOfViewRadians = degToRad(80);
var aspect;
var deltaTime, then = 0;

// Camera 
var cameraPosition, cameraAngle, target, up;

// Matrices
var viewDirectionProjectionInverseMatrix, viewDirectionProjectionMatrix, worldMatrix, cameraMatrix, viewMatrix, projectionMatrix, viewDirectionMatrix;

// Platform Collision
var isPlatformCollision
var platformCollision = [false, false, false, false];

// ========================================

// ======== Resource Urls ===========

// Starting Jumpman references
const startJumpmanUrl = 'src/models/jumpman/start_baseline.obj';


// Game Jumpman
const bodyUrl = 'src/models/gameBody/body.obj'
const feetUrl = 'src/models/gameFeet/feet.obj'
const feetRightUrl = 'src/models/gameFeet/rightFeet.obj'
const feetLeftUrl = 'src/models/gameFeet/leftFeet.obj'

// cloud
const cloudUrl = 'src/models/platform/clouds.obj'

// drone
const droneUrl = 'src/models/drone/drone.obj'
const propellerUrl = 'src/models/drone/propeller.obj'
var upDown = 4; // is upDown value for the vertical ondulation
var verse = false; // negative = false, positive = true

// Colors of jumpman
const colors = ['purple', 'orange', 'red', 'turquoise', 'green']

// Platform
const platformUrl = 'src/models/platform/plartform.obj';

// Coins
const coinUrl = 'src/models/coin/coin.obj';

// Obstacles
const obstacleUrl = 'src/models/obstacle/obstacle.obj';

// ======= Object variables ========
var jumpmans = [];
var coin;
var platform;
var obstacle;
var feet;
var leftFeet;
var rightFeet;
var body;
var drone;
var propeller;


// platform transformation
var platformTranslation = [2, -23.2, -7];

// initilize the jumpman transformation values, feet offset, speed and side inclination
var jumpmanPosition = [0, 0.5, 12] // feet level
var jumpmanScale = [0.8, 0.8, 0.8] // scale body
var jumpmanRotation = [0, 180, 0] // degree of rotation
const feetOffset = 2.1 // feet offset for the body level on y axe
var speedMove = 0.09; // speed movement
var bodySide = [0, 0, 0] // side inclination for the animation during movement

// step variables
var feetRightState; // 0 for behind, 1 for on position and 2 ahead
var feetLeftState; // 0 for behind, 1 for on position and 2 ahead

// rotation for behind, on position and ahead on 3 axes
var rightRot = [0, 0, 0]
var leftRot = [0, 0, 0]

// behind, on position and ahead applied on 3 axes
var rightStep = [0, 0, 0]
var leftStep = [0, 0, 0]

// previous step status and animation time
var wasBehind = true;
var stepTime;

// initialize the coin positions, hit status and coin points.
var coinPosition = [[0, 1.5, 0], [-5, 1.5, -3], [4, 1.5, -9], [10, 1.5, -7], [4, 1.5, 4]]
var coinHit = [false, false, false, false, false]

// hitted
var invulnerability; // when the jumpman lose a life, it is invulnerable for 3 seconds

// Scores
var coinPoint = 0;
var life = 5;


// =========== Obstacles Variables ============
// initialize the starting 
var obstaclePosition = [
    // movement on z 
    [-10, 2.7, -24],
    [-3, 2.7, -24],
    [4, 2.7, -24],
    [11, 2.7, -24],
]
var obstacleAppearance = [true, true, true, false];
var initialAppearance = [true, true, true, true];
var obstacleSpeed = 0.005;
// =================================

// Event management
var mouseToggle = true;

/*
====================================
        Step Functions of the 
          SelectChar Scene 
====================================
*/

/**
 * Pre-loading of resources for faster game
 * @param {*} gl 
 */
async function initResource(gl) {

    // Loading of jumpmans models
    let dataJump = await loadObjParts(gl, startJumpmanUrl);
    parts = dataJump.p;
    objOffset = dataJump.offset;
    range = dataJump.r;


    // Loading platform model
    let dataPlat = await loadObjParts(gl, platformUrl)
    platform = {
        p: dataPlat.p,
        offset: dataPlat.offset,
        r: dataPlat.r,
    }

    // loading coin model
    let dataCoin = await loadObjParts(gl, coinUrl)
    coin = {
        p: dataCoin.p,
        offset: dataCoin.offset,
        r: dataCoin.r,
    }

    // loading obstacle model
    let dataObstacle = await loadObjParts(gl, obstacleUrl);
    obstacle = {
        p: dataObstacle.p,
        offset: dataObstacle.offset,
        r: dataObstacle.r,
    }


    // loading game jumpman body
    let dataBody = await loadObjParts(gl, bodyUrl);
    body = {
        p: dataBody.p,
        offset: dataBody.offset,
        r: dataBody.r,
    }

    // loading right feet of the game jumpman
    let dataRightFeet = await loadObjParts(gl, feetRightUrl);
    rightFeet = {
        p: dataRightFeet.p,
        offset: dataRightFeet.offset,
        r: dataRightFeet.r,
    }

    // loading the left feet of the game jumpman
    let dataLeftFeet = await loadObjParts(gl, feetLeftUrl);
    leftFeet = {
        p: dataLeftFeet.p,
        offset: dataLeftFeet.offset,
        r: dataLeftFeet.r,
    }

    // clouds of the environment
    let dataCloud = await loadObjParts(gl, cloudUrl);
    cloud = {
        p: dataCloud.p,
        offset: dataCloud.offset,
        r: dataCloud.r,
    }

    let dataDrone = await loadObjParts(gl, droneUrl);
    drone = {
        p: dataDrone.p,
        offset: dataDrone.offset,
        r: dataDrone.r,
    }

    let dataPropeller = await loadObjParts(gl, propellerUrl);
    propeller = {
        p: dataPropeller.p,
        offset: dataPropeller.offset,
        r: dataPropeller.r,
    }

}



/**
 * Draw the skybox using its embdedded GLSL program with the buffer, projection of the view direction and texture for the scene orientation
 * @param {*} gl is the WebGL context
 * @param {*} skyboxProgramInfo is the GLSL program for the skybox 
 * @param {*} quadBufferInfo is the buffer with geometric data
 * @param {*} viewDirectionProjectionInverseMatrix  is the inverse of the multiply between projection matrix and view matrix
 * @param {*} texture is the texture of the skybox
 */
function drawSkybox(gl, skyboxProgramInfo, quadBufferInfo, viewDirectionProjectionInverseMatrix, texture) {
    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(skyboxProgramInfo.program);
    webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, quadBufferInfo);
    webglUtils.setUniforms(skyboxProgramInfo, {
        u_viewDirectionProjectionInverse: viewDirectionProjectionInverseMatrix,
        u_skybox: texture,
    });
    webglUtils.drawBufferInfo(gl, quadBufferInfo);
}

/**
 * Draw the jumpman, platforms, money or other object waveform using its embedded GLSL program with the buffer, uniforms, parts, objectOffests and time for the rotation
 * @param {*} gl is the WebGL context
 * @param {*} envProgramInfo is the program for the environment object
 * @param {*} sharedUniforms container of the uniforms variables values 
 * @param {*} parts is the parts of the object wavefront
 * @param {*} objOffset is the object offset
 * @param {*} time is the time animation strictly related to the rotation
 */
function drawJumpman(gl, envProgramInfo, sharedUniforms, parts, objOffset, time) {
    gl.depthFunc(gl.LESS);  // use the default depth test
    gl.useProgram(envProgramInfo.program);
    webglUtils.setUniforms(envProgramInfo, sharedUniforms);

    // =========== Compute the world matrix once since all parts =========
    let u_world = m4.yRotation(time);
    u_world = m4.translate(u_world, ...objOffset);
    for (const { bufferInfo, material } of parts) {
        webglUtils.setBuffersAndAttributes(gl, envProgramInfo, bufferInfo);
        webglUtils.setUniforms(envProgramInfo, {
            u_world,
        }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }
}

function drawDrone(gl, envProgramInfo, sharedUniforms, drone, propeller, time) {
    gl.depthFunc(gl.LESS);  // use the default depth test
    gl.useProgram(envProgramInfo.program);
    webglUtils.setUniforms(envProgramInfo, sharedUniforms);

    // =========== Compute the world matrix once since all parts =========

    if (verse) {
        upDown -= 0.02;

    } else {
        upDown += 0.02;
    }
    if (upDown < 2 || upDown > 4) verse = !verse;

    let u_world = m4.identity();
    u_world = m4.yRotation(0);
    u_world = m4.translate(u_world, ...drone.offset);
    u_world = m4.translate(u_world, ...[0, 10.5, -23])
    u_world = m4.scale(u_world, ...[1.5, 1.5, 1.5])
    u_world = m4.translate(u_world, ...[0, upDown, 0])

    for (const { bufferInfo, material } of drone.p) {
        webglUtils.setBuffersAndAttributes(gl, envProgramInfo, bufferInfo);
        webglUtils.setUniforms(envProgramInfo, {
            u_world,
        }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }

    webglUtils.setUniforms(envProgramInfo, sharedUniforms);
    u_world = m4.identity();
    u_world = m4.translate(u_world, ...[0.25, 14, -23.3])
    u_world = m4.translate(u_world, ...propeller.offset);
    u_world = m4.scale(u_world, ...[1.5, 1.5, 1.5]);
    u_world = m4.multiply(u_world, m4.yRotation(time * 8));
    u_world = m4.translate(u_world, ...[0, upDown, 0])

    for (const { bufferInfo, material } of propeller.p) {
        webglUtils.setBuffersAndAttributes(gl, envProgramInfo, bufferInfo);
        webglUtils.setUniforms(envProgramInfo, {
            u_world,
        }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }


}


/*
====================================
        Step Functions of the 
            Game Scene 
====================================
*/


/**
 * Update zoom according to the key pressing
 */
function zoomUpdate() {
    if (zoomKey[0] && D == 5) return; // min zoom
    if (zoomKey[1] && D == 20) return; // max zoom
    if (zoomKey[0]) { D += 1; }
    if (zoomKey[1]) { D -= 1; }
}


/**
 * Draw the platform 
 * @param {*} gl is the WebGL context
 * @param {*} envProgramInfo is the GLSL program
 * @param {*} sharedUniforms is uniforms values
 * @param {*} parts is parts of the object
 * @param {*} objOffset is the offset of the object
 */
function drawPlatform(gl, envProgramInfo, sharedUniforms, parts, objOffset, translation) {
    gl.depthFunc(gl.LESS);  // use the default depth test
    gl.useProgram(envProgramInfo.program);
    webglUtils.setUniforms(envProgramInfo, sharedUniforms);

    // =========== Compute the world matrix once since all parts =========
    let u_world = m4.identity();
    u_world = m4.translate(u_world, ...translation)
    u_world = m4.translate(u_world, ...objOffset);
    for (const { bufferInfo, material } of parts) {
        webglUtils.setBuffersAndAttributes(gl, envProgramInfo, bufferInfo);
        webglUtils.setUniforms(envProgramInfo, {
            u_world,
        }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }
}

/**
 * Draw a coin element
 * @param {*} gl is the WebGL context
 * @param {*} envProgramInfo is the GLSL program
 * @param {*} sharedUniforms is uniforms values
 * @param {*} parts is parts of object
 * @param {*} objOffset is the offset of the object
 * @param {*} y is the rotation on y axe
 */
function drawCoin(gl, envProgramInfo, sharedUniforms, parts, objOffset, y, tx, ty, tz) {

    gl.depthFunc(gl.LESS);  // use the default depth test
    gl.useProgram(envProgramInfo.program);
    webglUtils.setUniforms(envProgramInfo, sharedUniforms);


    // =========== Compute the world matrix once since all parts =========
    let u_world = m4.identity();
    u_world = m4.translate(u_world, tx, ty, tz)
    u_world = m4.translate(u_world, ...objOffset);
    u_world = m4.multiply(u_world, m4.yRotation(y));
    for (const { bufferInfo, material } of parts) {
        webglUtils.setBuffersAndAttributes(gl, envProgramInfo, bufferInfo);
        webglUtils.setUniforms(envProgramInfo, {
            u_world,
        }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }
}

/**
 * Draw an obstacle in the scene
 * @param {*} gl is the WebGL context
 * @param {*} envProgramInfo is the GLSL program to draw obstacle
 * @param {*} sharedUniforms uniforms variables for the GLSL program
 * @param {*} parts set of parts of the mesh for the light and other effects
 * @param {*} objOffset is the offset of the position for the object 
 * @param {*} y is the rotation degree
 * @param {*} tx is the x translation
 * @param {*} ty is the y translation
 * @param {*} tz is the z translation
 */
function drawObstacle(gl, envProgramInfo, sharedUniforms, parts, objOffset, y, tx, ty, tz) {
    gl.depthFunc(gl.LESS);  // use the default depth test
    gl.useProgram(envProgramInfo.program);
    webglUtils.setUniforms(envProgramInfo, sharedUniforms);

    // =========== Compute the world matrix once since all parts =========
    let u_world = m4.identity();
    u_world = m4.translate(u_world, tx, ty, tz)
    u_world = m4.translate(u_world, ...objOffset);
    u_world = m4.multiply(u_world, m4.yRotation(y));


    for (const { bufferInfo, material } of parts) {
        webglUtils.setBuffersAndAttributes(gl, envProgramInfo, bufferInfo);
        webglUtils.setUniforms(envProgramInfo, {
            u_world,
        }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }
}


/**
 * draw the body of the jumpman
 * @param {*} gl is the WebGL context
 * @param {*} envProgramInfo is the GLSL program
 * @param {*} sharedUniforms is the uniform values
 * @param {*} body is the body object of the jumpman
 * @param {*} feet is the feet values
 * @param {*} rot is the rotation vector
 * @param {*} pos is the translation vector
 * @param {*} scale is the scale vector
 */
function drawGameJumpman(gl, envProgramInfo, sharedUniforms, body, feet, rot, pos, scale) {
    gl.depthFunc(gl.LESS);  // use the default depth test
    gl.useProgram(envProgramInfo.program);
    webglUtils.setUniforms(envProgramInfo, sharedUniforms);

    // position is on the feet level, we need to translate it on y axe from on the offset for the feet level
    var oldY = pos[1]
    pos[1] = pos[1] + feetOffset; // Warning: in case of scaling, we need to change offset

    // =========== Compute the world matrix once since all parts of body =========
    let u_world = m4.identity();
    u_world = m4.translate(u_world, pos[0], pos[1], pos[2])
    u_world = m4.translate(u_world, ...body.offset);
    u_world = m4.scale(u_world, scale[0], scale[1], scale[2])
    u_world = m4.multiply(u_world, m4.yRotation(degToRad(rot[1])));
    u_world = m4.multiply(u_world, m4.zRotation(degToRad(bodySide[2])))


    for (const { bufferInfo, material } of body.p) {
        webglUtils.setBuffersAndAttributes(gl, envProgramInfo, bufferInfo);
        webglUtils.setUniforms(envProgramInfo, {
            u_world,
        }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }

    // restore origin y
    pos[1] = oldY;
}


/**
 * draw right or left feet according to the position of the body
 * @param {*} gl is the WebGL context
 * @param {*} envProgramInfo is the GLSL program
 * @param {*} sharedUniforms is the uniforms values
 * @param {*} feet is the feet object
 * @param {*} rot is the rotation transformation
 * @param {*} pos is the translation transformation
 * @param {*} type is the type of feet (1 for right, 0 for left)
 */
function drawFeet(gl, envProgramInfo, sharedUniforms, feet, rot, pos, type) {
    gl.depthFunc(gl.LESS);  // use the default depth test
    gl.useProgram(envProgramInfo.program);
    webglUtils.setUniforms(envProgramInfo, sharedUniforms);

    // offset from the body position
    let dispose = [0, 0, 0]
    if (type) { // right feet
        dispose[0] -= 0.45;
    } else { // left feet
        dispose[0] += 0.45;
    }

    // =========== Compute the world matrix once since all parts of body =========
    let u_world = m4.identity();
    u_world = m4.translate(u_world, pos[0], pos[1], pos[2])
    u_world = m4.translate(u_world, ...feet.offset);
    u_world = m4.translate(u_world, ...dispose)
    u_world = m4.multiply(u_world, m4.yRotation(degToRad(rot[1])));
    if (type) {
        u_world = m4.translate(u_world, ...rightStep);
        u_world = m4.multiply(u_world, m4.xRotation(degToRad(rightRot[0])))
    } else {
        u_world = m4.translate(u_world, ...leftStep);
        u_world = m4.multiply(u_world, m4.xRotation(degToRad(leftRot[0])))
    }



    for (const { bufferInfo, material } of feet.p) {
        webglUtils.setBuffersAndAttributes(gl, envProgramInfo, bufferInfo);
        webglUtils.setUniforms(envProgramInfo, {
            u_world,
        }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }
}

/**
 * Draw clouds of the environment
 * @param {*} gl is the WebGL context
 * @param {*} envProgramInfo is the GLSL program
 * @param {*} sharedUniforms is shared uniforms
 * @param {*} cloud is the cloud object instance
 * @param {*} traslate is the translation transformation
 */
function drawCloud(gl, envProgramInfo, sharedUniforms, cloud, translate) {
    gl.depthFunc(gl.LESS);  // use the default depth test
    gl.useProgram(envProgramInfo.program);
    webglUtils.setUniforms(envProgramInfo, sharedUniforms);

    // =========== Compute the world matrix once since all parts =========
    let u_world = m4.identity();
    u_world = m4.translate(u_world, ...cloud.offset);
    u_world = m4.translate(u_world, ...translate)
    for (const { bufferInfo, material } of cloud.p) {
        webglUtils.setBuffersAndAttributes(gl, envProgramInfo, bufferInfo);
        webglUtils.setUniforms(envProgramInfo, {
            u_world,
        }, material);
        webglUtils.drawBufferInfo(gl, bufferInfo);
    }
}
/**
 * update the step movement animation with refresh reduction due to the high frame updating
 * @param {*} time 
 */
function updateStep(time) {
    if (!stepTime) stepTime = 0;
    let shift = Math.abs(time - stepTime);
    if ((moveKey[0] || moveKey[1] || moveKey[2] || moveKey[3]) && Math.abs(time - stepTime) >= 0.05) {

        stepTime = time;
        switch (feetLeftState) {
            case 0:
                {
                    feetLeftState = 1;
                    wasBehind = true;
                    leftRot[0] = 340;
                    leftStep[2] = 0.1;
                    bodySide[2] = -5;
                }
                break;
            case 1:
                {
                    if (wasBehind) {
                        feetLeftState = 2;
                    } else feetLeftState = 0;
                    leftRot[0] = 0;
                    leftStep[2] = 0;
                    bodySide[2] = 0;
                }
                break;
            case 2:
                {
                    wasBehind = false;
                    feetLeftState = 1;
                    leftRot[0] = 20;
                    leftStep[2] = -0.2
                    leftStep[0] = 0.1;
                    bodySide[2] = 5;
                }
                break;
            default:
                break;
        }

        // the right feet has the same movement but with the opposite order (behind-ahead, ahead-behind)
        switch (feetRightState) {
            case 0:
                {
                    feetRightState = 1;
                    rightRot[0] = 340;
                    rightStep[2] = 0.2;
                    rightStep[1] = 0.1;
                }
                break;
            case 1:
                {
                    if (wasBehind) {
                        feetRightState = 0;
                    } else feetRightState = 2;
                    rightRot[0] = 0;
                    rightStep[2] = 0;
                    rightStep[1] = 0;
                }
                break;
            case 2:
                {
                    feetRightState = 1;
                    rightRot[0] = 20;
                    rightStep[2] = -0.2;
                    rightStep[1] = 0.1;

                }
                break;
            default:
                break;
        }
    } else {
        if (shift >= 0.05) {
            // it is not move, so... we need to let the jumpman stay in the on position state for both feets
            leftRot[0] = 0;
            rightRot[0] = 0;
            leftStep[2] = 0;
            rightStep[2] = 0;
            bodySide[2] = 0;
            feetLeftState = 1;
            feetLeftState = 1
            wasBehind = false; // restart from the left behind and right ahead
        }
    }
}
/**
 *  Update Jumpman Movement function based on the current key event pressing
 */
function updateJumpmanMove(time) {
    if (isPlatformCollision) {
        isPlatformCollision = false;
    } else {
        if (moveKey[0] == true) { // a key
            jumpmanPosition[0] -= speedMove;
            jumpmanRotation[1] = 270;
        }
        if (moveKey[1] == true) { // w key
            jumpmanPosition[2] -= speedMove;
            jumpmanRotation[1] = 180;
        }
        if (moveKey[2] == true) { // s key 
            jumpmanPosition[2] += speedMove;
            jumpmanRotation[1] = 0;
        }
        if (moveKey[3] == true) { // d key
            jumpmanPosition[0] += speedMove;
            jumpmanRotation[1] = 90;
        }

        // combination of keys for rotation
        if (moveKey[1] && moveKey[0]) jumpmanRotation[1] = 225;
        if (moveKey[2] && moveKey[0]) jumpmanRotation[1] = 315;
        if (moveKey[2] && moveKey[3]) jumpmanRotation[1] = 45;
        if (moveKey[3] && moveKey[1]) jumpmanRotation[1] = 135;

    }
}


/**
 * Reinitialize a new set of obstacles
 */
function newObstacleDisposition() {

    let position = getRandomInteger(0, 4);
    for (let j = 0; j < obstacleAppearance.length; j++) {
        obstacleAppearance[j] = true;
    }
    obstacleAppearance[position] = false;
    // reset position
    for (let i = 0; i < obstaclePosition.length; i++) {
        obstaclePosition[i][2] = (-1) * 24;
    }
}

/**
 * Update the z position on the world space for obstacles, simulating the movement in the player PoV. 
 * @param {*} time is the time frame used for the movement animation
 */
function updateObstacles(time) {
    for (let i = 0; i < obstaclePosition.length; i++) {
        if (obstaclePosition[0][2] >= 24) {
            // last spot for the session movement
            newObstacleDisposition();
        } else obstaclePosition[i][2] += 0.1 // z update for obstacle i
    }
}

/**
 * Add or remove Mouse listener on the text canvas (that is because the z-buffer of the text canvas is greater than the game canvas),
 * so, there is an overlayer for the game canvas that will not catch any event outside the overlap.
 * @param {*} canvas is the canvas where apply or cancel listeners 
 */
function toggleListener(canvas) {
    if (mouseToggle) {
        canvas.onmousedown = mouseDown;
        canvas.onmouseup = mouseUp;
        canvas.mouseout = mouseUp;
        canvas.onmousemove = mouseMove;
        canvas.addEventListener("touchstart", function (event) {
            var touch;
            if (event.targetTouches.length == 1) {
                touch = event.targetTouches[0];
                drag = true;
                lastX = touch.pageX, lastY = touch.pageY;
                return false;
            }
        });

        canvas.addEventListener("touchend", function (event) {
            drag = false;
        });

        canvas.addEventListener("touchmove", function (event) {
            var touch;
            if (event.targetTouches.length == 1) {
                touch = event.targetTouches[0];
                if (!drag) return false;
                dX = - (touch.pageX - lastX) * 2 * Math.PI / canvas.width;
                dY = - (touch.pageY - lastY) * 2 * Math.PI / canvas.height;
                theta += dX;
                phi += dY;
                lastX = touch.pageX, lastY = touch.pageY;
            }
        });

        window.addEventListener('keydown', keyDown);
        window.addEventListener('keyup', keyUp);

    } else {

        canvas.onmousedown = (e) => { };
        canvas.onmouseup = (e) => { };
        canvas.onmouseout = (e) => { };
        canvas.onmousemove = (e) => { };
        canvas.touchstart = (e) => { };
        canvas.touchend = (e) => { };
        canvas.touchmove = (e) => { };
        window.addEventListener('keydown', (e) => { });
        window.addEventListener('keyup', (e) => { });
    }
    mouseToggle = !mouseToggle;
}


/**
 * Check if the Jumpman go out of platform bounds
 */
function checkPlatformCollisions() {
    // platform collision with limits (min, max) for the x and z
    var platformLimits = [[-12.39, 13.49], [-23.60, 20.30]]
    if (isBetween(jumpmanPosition[0], platformLimits[0][0], platformLimits[0][1]) && isBetween(jumpmanPosition[2], platformLimits[1][0], platformLimits[1][1])) {
        // no collision

    } else {
        // platform collision

        // collision is vertical
        if (jumpmanPosition[2] <= platformLimits[1][0]) {
            // platform top collision
            jumpmanPosition[2] += 0.1;
        }
        if (jumpmanPosition[2] >= platformLimits[1][1])
            jumpmanPosition[2] -= 0.1;


        // collision is horizontal
        if (jumpmanPosition[0] <= platformLimits[0][0]) {
            jumpmanPosition[0] += 0.1;
        }
        if (jumpmanPosition[0] >= platformLimits[0][1]) {
            jumpmanPosition[0] -= 0.1
        }
    }
}


/**
 * Check if the Jumpman hit some coin
 */
function checkCoinCollision() {
    let fullCoin = true;
    for (let i = 0; i < coinPosition.length; i++) {
        if (Math.hypot(jumpmanPosition[0] - coinPosition[i][0], jumpmanPosition[2] - coinPosition[i][2]) < 1) { // euclidean distance 
            if (!coinHit[i]) { // if it is already taken, don't count
                coinHit[i] = true;
                coinPoint++;
            }
        } else {
            if (!coinHit[i]) // not hit yet
                fullCoin = false; // some coin are not yet taken
        }
    }

    if (fullCoin) {
        generateRandomCoin(5);
    }

}

/**
 * Generate n random coin on the platform coordinates
 * @param {number} n is the number of random coin to generate 
 */
function generateRandomCoin(n) {
    var coins = []
    for (let i = 0; i < n; i++) {
        coins.push([
            getRandomArbitrary(-10, 13),
            1.5,
            getRandomArbitrary(-23, 20.30)
        ])
    }
    coinPosition = coins;
    coinHit = [false, false, false, false, false]
}

/**
 *Check if the Jumpman hit obstacles
 */
function checkObstacleCollision(time) {
    for (let i = 0; i < obstaclePosition.length; i++) {
        if (obstacleAppearance[i]) {
            var rect = { max: { x: obstaclePosition[i][0] + 3, y: obstaclePosition[i][2] + 0.5 }, min: { x: obstaclePosition[i][0] - 3, y: obstaclePosition[i][2] - 0.5 } }
            var p = { x: jumpmanPosition[0], y: jumpmanPosition[2] } // x and z 
            if (distance(rect, p) < 2) {
                invulnerability = time - invulnerability;
                if (invulnerability < 3) life += 1;
                invulnerability = time;
                if (jumpmanPosition[2] >= 8) {
                    // limit hits
                    jumpmanPosition = [0, 0.5, jumpmanPosition[2] - 3];
                } else {
                    // normal hit
                    jumpmanPosition = [0, 0.5, 12];
                }
                life -= 1;
                break
            }

        }
    }
}


/*
====================================
        Main Function of the 
          SelectChar Scene 
====================================
*/

/**
 * Checking and change the display mode according to the nature of the device (mobile or not)
 */
function checkMobileSize() {
    if (window.innerHeight < 500 && window.innerWidth < 900) {
        // it is mobile
        toggleMobileButton(true);
    } else {
        toggleMobileButton(false);
    }
}


/**
 * This is the main script, here start the game rendering after loading 
 * resources from the local file system (file .obj and relative .mtl)
 * @returns 
 */
function loadAndRun() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    canvas = document.getElementById("game");
    textCanvas = document.getElementById('text');
    gl = canvas.getContext("webgl");
    textContext = textCanvas.getContext('2d');
    if (!gl) {
        return;
    }

    // Warning: Development in WebGL v.1
    console.log('WebGL version: ', gl.getParameter(gl.VERSION));
    console.log('WebGL vendor : ', gl.getParameter(gl.VENDOR));
    console.log('WebGL supported extensions: ', gl.getSupportedExtensions());

    // checking the depth texture extension for shadows
    depthTextureExtension = gl.getExtension('WEBGL_depth_texture');
    if (!depthTextureExtension) {
        console.log('This WebGL program requires the use of the ' +
            'WEBGL_depth_texture extension. This extension is not supported ' +
            'by your browser, so this WEBGL program is terminating.');
        return;
    }


    // loading jumpmans 
    initResource(gl).then(() => {
        // loadingInterface(); // Starting the interface with the loading phase
        runSelectCharScene();
    })
}

/**
 * Clear the WebGL previous frame
 * @param {*} gl 
 */
function clearFrame(gl) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    textContext ? textContext.clearRect(0, 0, textContext.canvas.width, textContext.canvas.height) : null;

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // enable culling face and depth test
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

/**
 * Main function for the SelectChar Scene
 * @returns if WebGL is not supported
 */
async function runSelectCharScene() {


    // setup GLSL programs and lookup locations

    // =================================
    //          Start Program               
    // =================================
    envProgramInfo = webglUtils.createProgramInfo(
        gl, ["env-vs", "env-fs"]);


    // =====================================
    //          SkyBox Program  
    // =====================================


    skyboxProgramInfo = webglUtils.createProgramInfo(
        gl, ["skybox-vs", "skybox-fs"]);


    // ================================
    //          Color Program 
    // ================================
    colorProgramInfo = webglUtils.createProgramInfo(gl, ["color-vs", "color-fs"]);


    // Skybox BufferInfo
    quadBufferInfo = createXYQuadBufferInfo(gl);
    // Loading Texture
    if (!texture) texture = createSkyboxTexture(gl);


    requestAnimationFrame(drawScene);

    // Draw the scene.
    async function drawScene(time) {

        // convert to seconds
        time *= 0.001;
        // Subtract the previous time from the current time
        deltaTime = time - then;
        // Remember the current time for the next frame.
        then = time;

        clearFrame(gl);
        // Compute the projection matrix
        aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        projectionMatrix =
            m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        // camera going in circle 2 units from origin looking at origin
        // var cameraPosition = [Math.cos(time * .1) * 2, 0, Math.sin(time * .1) * 2];
        cameraPosition = [D * Math.sin(phi) * Math.cos(theta),
        D * Math.sin(phi) * Math.sin(phi),
        D * Math.cos(phi)];
        target = [0, 0, 0];
        up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        viewMatrix = m4.inverse(cameraMatrix);

        // Rotate the cube around the x axis
        worldMatrix = m4.identity();

        // We only care about direciton so remove the translation
        viewDirectionMatrix = m4.copy(viewMatrix);
        viewDirectionMatrix[12] = 0;
        viewDirectionMatrix[13] = 0;
        viewDirectionMatrix[14] = 0;

        viewDirectionProjectionMatrix = m4.multiply(
            projectionMatrix, viewDirectionMatrix);
        viewDirectionProjectionInverseMatrix =
            m4.inverse(viewDirectionProjectionMatrix);


        // ========= Set Ligh direction, view and projection matrix and camera position for the Jumpman ===========
        sharedUniforms = {
            u_lightDirection: m4.normalize([0.5, 1, 1]), // direction of the source light
            u_view: viewMatrix,
            u_projection: projectionMatrix,
            isShadow : isShadow ? 1 : 0,
            u_viewWorldPosition: cameraPosition,
            ambient: lightAmbient,
            diffuse: lightDiffuse,
            specular: lightSpecular,
            emissive: lightEmissive,
            opacity: lightOpacity,
            u_ambientLight: ambientLight,
            shiness: lightShiness,
        };

        // draw Jumpman  
        drawJumpman(gl, envProgramInfo, sharedUniforms, parts, objOffset, time);

        // draw Skybox
        drawSkybox(gl, skyboxProgramInfo, quadBufferInfo, viewDirectionProjectionInverseMatrix, texture);


        if (gameStart) startGameScene();
        else requestAnimationFrame(drawScene);

    }
}


/*
====================================
        Main Function of the 
          Game Scene 
====================================
*/
/**
 * It manages the initial Game metadata
 * @param {*} gl 
 */
function initGameScene(gl) {
    if (textCanvas) toggleListener(textCanvas);
    initInterfaceGUI();
    // initial camera positioon
    D = 40;
    theta = degToRad(90);
    phi = degToRad(45);
    cameraAngle = degToRad(0)
    // reinitialize the then and deltaTime to separate animation from the starting scene
    deltaTime, then = 0;
    // on position step
    feetLeftState = 1;
    feetRightState = 1;
}

function checkGameOver() {
    if (life <= 0) {
        textContext ? textContext.clearRect(0, 0, textContext.canvas.width, textContext.canvas.height) : null;
        textContext.font = '1.20rem Titan One';
        textContext.fillStyle = 'white';
        textContext.fillText('Score: ' + coinPoint + ' - Game Over! ',textCanvas.width / 4, 40);
        return true;
    } else return false;
}


/**
 * Initialize the depthTexture, depthFramebuffer and unusedTexture for the shadow management 
 */
function initShadowTexture() {

    depthTexture = gl.createTexture();
    depthTextureSize = 512;
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.DEPTH_COMPONENT, // internal format
        depthTextureSize,   // width
        depthTextureSize,   // height
        0,                  // border
        gl.DEPTH_COMPONENT, // format
        gl.UNSIGNED_INT,    // type
        null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target
        gl.DEPTH_ATTACHMENT,  // attachment point
        gl.TEXTURE_2D,        // texture target
        depthTexture,         // texture
        0);                   // mip level

    // create a color texture of the same size as the depth texture
    // see article why this is needed_
    unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        depthTextureSize,
        depthTextureSize,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // attach it to the framebuffer
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,        // target
        gl.COLOR_ATTACHMENT0,  // attachment point
        gl.TEXTURE_2D,         // texture target
        unusedTexture,         // texture
        0);                    // mip level
}

/**
 * Rendering of the Game scene
 * @param {} time is the time
 * @returns in case of error or gameover
 */
function renderGameScene(time) {

    // mobile adaptation
    checkMobileSize();

    // time frame
    time *= 0.001;
    deltaTime = time - then;
    then = time;
    if(deltaTime < 0.01){
        requestAnimationFrame(renderGameScene);
    }

    // clear frame and buffers
    clearFrame(gl);

    // Update zoom and angle of camera 
    zoomUpdate();

    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    const lightWorldMatrix = m4.lookAt(lightPosition, lightTarget, up);
    const lightProjectionMatrix = m4.perspective(degToRad(lightAngle), aspect, lightNear, lightFar);

    // binding frame buffer to save depth of pixels related to the shadow rendering
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawGameScene(time, lightProjectionMatrix, lightWorldMatrix, m4.identity(), lightWorldMatrix, colorProgramInfo)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // texture related to the shadow rendering
    let textureMatrix = m4.identity();
    textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
    // we use the inverse light world matrix to render the position in the world space for the shadows
    textureMatrix = m4.multiply(
        textureMatrix,
        m4.inverse(lightWorldMatrix));

    // redefine matrices 
    projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // camera going in circle 2 units from origin looking at origin
    // var cameraPosition = [Math.cos(time * .1) * 2, 0, Math.sin(time * .1) * 2];
    cameraPosition = [D * Math.sin(phi) * Math.cos(theta),
    D * Math.sin(phi) * Math.sin(phi),
    D * Math.cos(phi)];

    // Compute the camera's matrix using look at.
    cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    viewMatrix = m4.inverse(cameraMatrix);

    // Rotate the cube around the x axis
    worldMatrix = m4.identity();

    // We only care about direciton so remove the translation
    viewDirectionMatrix = m4.copy(viewMatrix);
    viewDirectionMatrix[12] = 0;
    viewDirectionMatrix[13] = 0;
    viewDirectionMatrix[14] = 0;

    viewDirectionProjectionMatrix = m4.multiply(
        projectionMatrix, viewDirectionMatrix);
    viewDirectionProjectionInverseMatrix =
        m4.inverse(viewDirectionProjectionMatrix);

    drawGameScene(time, projectionMatrix, cameraMatrix, textureMatrix, lightWorldMatrix, envProgramInfo);

    // check pltform collision
    checkPlatformCollisions();

    // coin collision
    checkCoinCollision();

    // obstacles collisions
    checkObstacleCollision(time);

    // draw 2D text
    draw2DContent();

    // draw Frustum
    if (isFrustum) {
        drawFrustum(gl, colorProgramInfo, cameraMatrix, lightWorldMatrix, lightProjectionMatrix)
    }

    // check if there is a game over, in this situation, we will not refresh the frame because the game ends and give the player the possible to restart toggling the play button again.
    if (checkGameOver()) {
        return;
    } else {
        // animation frame iteration
        requestAnimationFrame(renderGameScene);
    }
}


/**
 * Draw the Game Scene 
 * @param {*} time is the frame time
 * @param {*} projectionMatrix is the projection matrix of the camera or the light
 * @param {*} cameraMatrix is the camera matrix or the world light matrix 
 * @param {*} textureMatrix is the texture matrix (identity if light)
 * @param {*} lightWorldMatrix is the world light matrix
 * @param {*} programInfo is the GLSL program info that defines the color of the light or colored texture for a pixel in the camera view
 */
function drawGameScene(time, projectionMatrix, cameraMatrix, textureMatrix, lightWorldMatrix, programInfo) {

    const viewMatrix = m4.inverse(cameraMatrix);
    gl.useProgram(programInfo.program);

    // fixed shared values
    sharedUniforms = {
        u_view: viewMatrix,
        u_projection: projectionMatrix,
        u_bias: -0.0100,
        isShadow: isShadow ? 1 : 0,
        u_textureMatrix: textureMatrix,
        u_projectedTexture: depthTexture,
        u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
        ambient: lightAmbient,
        diffuse: lightDiffuse,
        specular: lightSpecular,
        emissive: lightEmissive,
        opacity: lightOpacity,
        u_ambientLight: ambientLight,
        shiness: lightShiness,
    };

    // draw coins
    for (let i = 0; i < coinPosition.length; i++) {
        if (!coinHit[i])
            drawCoin(gl, programInfo, sharedUniforms, coin.p, coin.offset, time, coinPosition[i][0], coinPosition[i][1], coinPosition[i][2]);
    }

    // update the obstales positions and appearances
    updateObstacles(time);

    // draw obstacles
    for (let i = 0; i < obstaclePosition.length; i++) {
        if (obstacleAppearance[i])
            drawObstacle(gl, programInfo, sharedUniforms, obstacle.p, obstacle.offset, 0, obstaclePosition[i][0], obstaclePosition[i][1], obstaclePosition[i][2]);
    }

    // update the position of the jumpman according to the key pressed in the frame
    // draw body of the Jumpman
    updateJumpmanMove(time); // for the general movement according to the world
    updateStep(time)

    // draw Jumpman
    drawGameJumpman(gl, programInfo, sharedUniforms, body, feet, jumpmanRotation, jumpmanPosition, jumpmanScale);
    drawFeet(gl, programInfo, sharedUniforms, rightFeet, jumpmanRotation, jumpmanPosition, 1);
    drawFeet(gl, programInfo, sharedUniforms, leftFeet, jumpmanRotation, jumpmanPosition, 0);

    // draw Drone
    drawDrone(gl, programInfo, sharedUniforms, drone, propeller, time)

    // draw Cloud
    drawCloud(gl, programInfo, sharedUniforms, cloud, platformTranslation)


    // draw platform 
    drawPlatform(gl, programInfo, sharedUniforms, platform.p, platform.offset, platformTranslation);


    // draw Skybox
    drawSkybox(gl, skyboxProgramInfo, quadBufferInfo, viewDirectionProjectionInverseMatrix, texture);


}

/**
 * Draw the 2D Content for the score during the game
 */
function draw2DContent() {
    textContext.font = '1.20rem Titan One';
    textContext.fillStyle = 'white';
    textContext.fillText('Score: ' + coinPoint + ' - Life: ' + life, textCanvas.width / 4, 40);
}

/**
 * Draw frustum of the light 
 * @param {} gl is the WebGL context
 * @param {*} programInfo is the GLSL program
 * @param {*} cameraMatrix is the camera matrix 
 * @param {*} lightWorldMatrix is the light in the world space
 * @param {*} lightProjectionMatrix is the projection of the light into the world space
 */
function drawFrustum(gl, programInfo, cameraMatrix, lightWorldMatrix, lightProjectionMatrix) {

    const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
        position: [
            -1, -1, -1,
            1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            -1, -1, 1,
            1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
        ],
        indices: [
            0, 1,
            1, 3,
            3, 2,
            2, 0,

            4, 5,
            5, 7,
            7, 6,
            6, 4,

            0, 4,
            1, 5,
            3, 7,
            2, 6,
        ],
    });
    const viewMatrix = m4.inverse(cameraMatrix);

    gl.useProgram(programInfo.program);

    // Setup all the needed attributes.
    webglUtils.setBuffersAndAttributes(gl, programInfo, cubeLinesBufferInfo);

    // scale the cube in Z so it's really long
    // to represent the texture is being projected to
    // infinity
    const mat = m4.multiply(
        lightWorldMatrix, m4.inverse(lightProjectionMatrix));

    // Set the uniforms we just computed
    webglUtils.setUniforms(programInfo, {
        u_color: [1, 1, 1, 1],
        u_view: viewMatrix,
        u_projection: projectionMatrix,
        u_world: mat,
    });

    // calls gl.drawArrays or gl.drawElements
    webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
}


/**
 * Start Game Scene, clear frame and starting elements and start the animation.
 */

function startGameScene() {
    toggleStartButtons();
    initGameScene(gl);
    initShadowTexture();
    requestAnimationFrame(renderGameScene);
}

// Load Scene on loading state
window.onload = loadAndRun;
window.onresize = checkMobileSize;

