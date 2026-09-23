const canvas = document.getElementById("sex");
const ctx = canvas.getContext("2d");

ctx.fillStyle='Black';


// Frame timing
let lastTime = 0;
let deltaTime = 0;
let gameTime = 0;

// Physics timing
const fixedDeltaTime = 1 / 60;
let physicsAccumulator = 0;


//gravity
let gravity_values = 110;

//walls floors etc
let floor = 125;
let wallA = 0;
let wallB = 275;

//player phisics related;
const playerH = 25;
const playerW = 25;

const jumpForce = -120;
const moveForce = 200;
let jumpReq = false;

//frictions of all sorts and kinds 
let groundFriction = 3;
let airResistacce = 2;

let player = {
    x: 0,
    y: 0,
    tlcx: 0,
    tlcy: 0,
    trcx: 0,
    trcy: 0,
    blcx: 0,
    blcy: 0,
    brcx: 0,
    brcy: 0,
    tltrx: 0,
    tltry: 0,
    trbrx: 0,
    trbry: 0,
    brblx: 0,
    brbly: 0,
    bltlx: 0,
    bltly: 0,
    axis1maxProj: 0,
    axis1minProj: 0,
    axis2maxProj: 0,
    axis2minProj: 0,
    axis3maxProj: 0,
    axis3minProj: 0,
    axis4maxProj: 0,
    axis4minProj: 0,
    axis1x: 0,
    axis1y: 0,
    axis2x: 0,
    axis2y: 0,
    axis3x: 0,
    axis3y: 0,
    axis4x: 0,
    axis4y: 0,
    objectH: 25,
    objectW: 25,
    xacc: 0,
    yacc: 0,
    xvel: 0,
    yvel: 0,
    mass: 1,
    invmass: 1/player.mass,
    isGrounded: true,
    rotation: 0,
    aacc: 0,
    avel: 0,
    momentI: 15,
    torque: 0,
    pivotx: 0,
    pivoty: 0
};

let box1 = {
    x: 30,
    y: 20,
    objectH: 10,
    objectW: 10,
    xacc: 0,
    yacc: 0,
    xvel: 0,
    yvel: 0,
    mass: 1,
    isGrounded: true,
    rotation: 0,
    aacc: 0,
    avel: 0,
    momentI: 15,
    torque: 0,
    pivotx: 0,
    pivoty: 0
}

let platform1 = { 
    x: 100,
    y: 100,
    objectW: 80,
    objectH: 10,
    fillStyle: 'green'
}

let phisicsObjects = [];
phisicsObjects.push(box1);

const xadisplay = document.getElementById("xacc");
const yadisplay = document.getElementById("yacc");
const xveldisplay = document.getElementById("xvel");
const yveldisplay = document.getElementById("yvel");


//EVENTS

const keys = {};

document.addEventListener("keydown", function(event) {
    keys[event.key] = true;
    if (event.key === "w" && player.isGrounded) {
        jumpReq = true;
    }
    if (event.key === "e"){
        addImpulse(player, 0);
    }
    if (event.key === "r"){
        addImpulse(player, 30);
    }
});

document.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});


function start() {
    requestAnimationFrame(gameLoop);
}


function gameLoop(currentTime) {


    // Convert milliseconds to seconds
    deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Prevent huge time jumps
    if (deltaTime > 0.1) {
        deltaTime = 0.1;
    }

    gameTime += deltaTime;

    // Add frame time to physics accumulator
    physicsAccumulator += deltaTime;

    // Run physics at a fixed 60 FPS
    while (physicsAccumulator >= fixedDeltaTime) {

        fixedUpdate(fixedDeltaTime);

        physicsAccumulator -= fixedDeltaTime;
    }

    // Normal game update
    update(deltaTime);

    // Render
    draw();

    requestAnimationFrame(gameLoop);
}


function fixedUpdate(dt) {
    // Physics goes here

    // for(let object of phisicsObjects){
    //      reverseMass(object);
    //     getPivot(object);
    //     resetAcceleration(object);
    //     resetRotationalAcceleration(object);
    //     gravity(object,gravity_values);
    //     calculateRotationalAcceleration(object);
    //     calculateRotationalVelocity(object, dt);
    //     calculateVelocity(object,dt);
    //     friction(object,groundFriction,airResistacce,dt);
        
    //     doRotation(object,dt);
    //     moveObject(object,dt);

    //     avoidSmallNums(object);

    //     checkWall(object);
    //     checkGround(object);
    // }




    //console.log("aaa")
    reverseMass(player);
    getRotatedCorners(player);
    getPivot(player);

    resetAcceleration(player);
    resetRotationalAcceleration(player);

    gravity(player,gravity_values);

    issiueMovement(player, moveForce);

    jump(player,jumpReq);

    calculateRotationalAcceleration(player);
    calculateRotationalVelocity(player, dt);
    
    calculateVelocity(player,dt);


    friction(player,groundFriction, airResistacce, dt);

    //doRotation(player, 45);
    //player.rotation += Math.PI * dt;

    //checkCollision(player,platform1);
    
    doRotation(player,dt);
    moveObject(player,dt);

    avoidSmallNums(player);

    checkGround(player);
    checkWall(player);
    
}


function update(dt) {
    xadisplay.textContent = "box xacc= " + box1.xacc;
    yadisplay.textContent = "box xvel= " + box1.xvel;
    xveldisplay.textContent = "box yacc= " + box1.yacc;
    yveldisplay.textContent = "box yvel" + box1.yvel;
}

//renderss

function draw() {
    // Drawing goes here
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGameobject(platform1);


    drawPlayer(player);
    //drawPlayer(box1);
    debugOrigin();
    debugOriginPlayer(player);
    debugRotatingPoints(player);
    debugRotatingPoints(box1);
    
    
}

function drawPlayer(player){

    ctx.save();
    ctx.fillStyle='Black';
    ctx.translate(player.x + player.objectW/2, player.y+player.objectH/2);
    ctx.rotate(player.rotation);    
    ctx.fillRect(0 - player.objectW/2 ,0 - player.objectH/2 ,player.objectW, player.objectH);
    ctx.restore();
}

function drawGameobject(object){
    ctx.fillStyle = object.fillStyle;
    ctx.fillRect(object.x, object.y, object.objectW, object.objectH);
}

//PHISICS BITCH

function calculateVelocity(object,dt){
    object.xvel += object.xacc * dt;
    object.yvel += object.yacc * dt;
}
function moveObject(object,dt){
    object.x += object.xvel * dt;
    object.y += object.yvel * dt;
}

function gravity(object, gvalue){
    object.yacc += gvalue;
}

function addForce(object, dirx, diry){
    //everything has the mass of 1, leaving mass to be implemented later
    object.xacc += dirx / object.mass;
    object.yacc += diry / object.mass;
}

function addForceSimulated(object, dirx, diry, posx, posy){
    addForce(object,dirx,diry);
    addTorque(object,dirx,diry,posx,posy);
}

function addImpulse(object, newx, newy){
    if(newx != null){
        object.xvel = newx;
    }
    if(newy != null){
        object.yvel = newy;
    }
}

function resetAcceleration(object){
    object.xacc = 0;
    object.yacc = 0;
}

function resetVelocity(object){
    object.xvel = 0;
    object.yvel = 0;
}

function addVelocity(object,dirx,diry){
    object.xvel += dirx;
    object.yvel += diry;
}

function jump(object, request){
    if(request == true && object.isGrounded){
        //resetAcceleration(object);
        addVelocity(object, 0, jumpForce);
        jumpReq = false;
    }
}


function checkGround(object){
    if (object.y  >= floor) {

        object.isGrounded = true;

        object.y = floor;

        if (object.yvel > 0) 
        {
            object.yvel = 0;
        }
    }
    else{
        object.isGrounded = false;
    }
}

function checkWall(object){
    if(object.x >= wallB){
        object.x = wallB;

        if(object.xvel > 0){
            object.xvel = 0;
        }
    }
    if(object.x <= wallA){
        object.x = wallA;

        if(object.xvel > 0){
            object.xvel = 0;
        }
    }
}



function friction(object, groundFriction, airResistance, dt){
    if(object.isGrounded){
        object.xvel -= object.xvel * groundFriction * dt;
        
    }
    else{
        object.xvel -= object.xvel * airResistance * dt;
    }
    object.avel -= object.avel * groundFriction * dt;
}

function issiueMovement(object, movementForce){
    if (keys["a"]) {
        addForce(object, -movementForce, 0);
    }
    if (keys["d"]) {
        addForce(object, movementForce, 0);
    }
    if (keys["f"]){
        addForceSimulated(object, 500, -800, object.x + 5, object.y + 7);
    }
}

//Rotation phisics %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function getPivot(object){
    object.pivotx = object.x + object.objectW / 2;
    object.pivoty = object.y + object.objectH / 2;
}

function addTorque(object, forcex, forcey, fposX, fposY){
    //var r = Math.sqrt(Math.pow(forcex - object.pivotx, 2) + Math.pow(forcey - object.pivoty, 2));
    var rx = fposX - object.pivotx;
    var ry = fposY- object.pivoty;
    object.torque = (rx * forcey) - (ry * forcex);
}

function calculateRotationalAcceleration(object){
    object.aacc += object.torque / object.momentI;
}

function calculateRotationalVelocity(object, dt){
    object.avel += object.aacc * dt;
}

function resetRotationalAcceleration(object){
    object.aacc = 0;
    object.torque = 0;
}


function doRotation(object, dt){
    object.rotation += object.avel * dt;
}

//Collisions (sat algorythm)

function checkCollision(objectA, objectB){//obsolete
    var a_left = objectA.x;
    var a_right = objectA.x + objectA.objectW;
    var a_top = objectA.y;
    var a_bottom = objectA.y + objectA.objectH;

    var b_left = objectB.x;
    var b_right = objectB.x + objectB.objectW;
    var b_top = objectB.y;
    var b_bottom = objectB.y + objectB.objectH;

    if(a_right < b_left || a_left > b_right || a_bottom < b_top || a_top > b_bottom){
        //console.log("no collision");
    }
    else{
        //console.log(objectA + " collided with " + objectB);
    }
}

function getRotatedCorners(object){
    getPivot(object);

    let corners = [];

    //local corners
    let tl = {
        x: -object.objectW / 2,
        y: -object.objectH / 2
    };
    let tr = {
        x: object.objectW / 2,
        y: -object.objectH / 2
    };
    let bl = {
        x: -object.objectW / 2,
        y: object.objectH / 2
    };
    let br = {
        x: object.objectW / 2,
        y: object.objectH / 2
    };

    corners.push(tl, tr, br, bl);

    for(let corner of corners){
        let ox = corner.x;
        let oy = corner.y;
        corner.x = ox * Math.cos(object.rotation) - oy * Math.sin(object.rotation);
        corner.y = ox * Math.sin(object.rotation) + oy * Math.cos(object.rotation);
    }

    for(let corner of corners){
        corner.x = object.pivotx + corner.x;
        corner.y = object.pivoty + corner.y;
    }

    object.tlcx = tl.x;
    object.tlcy = tl.y;

    object.trcx = tr.x;
    object.trcy = tr.y;

    object.blcx = bl.x;
    object.blcy = bl.y;

    object.brcx = br.x;
    object.brcy = br.y;

    
    
}

function getEdges(object){
    object.tltrx = object.trcx - object.tlcx;
    object.tltry = object.trcy - object.tlcy;

    object.trbrx = object.brcx - object.trcx;
    object.trbry = object.brcy - object.trcy;

    object.brblx = object.blcx - object.brcx;
    object.brbly = object.blcy - object.brcy;

    object.bltlx = object.tlcx - object.blcx;
    object.bltly = object.tlcy - object.blcy;
}

function getAxes(object){
    let axes = [];

    let axistltr = {
        x: -object.tltry,
        y: object.tltrx
    };
    let axistrbr = {
        x: -object.trbry,
        y: object.trbrx
    };

    let axisbrbl = {
        x: -object.brbly,
        y: object.brblx
    };
    let axisbltl = {
        x: -object.bltly,
        y: object.bltlx
    };

    axes.push(axistltr, axistrbr, axisbrbl, axisbltl);

    for(let axis of axes){
        var lenght = Math.sqrt(Math.pow(axis.x, 2) + Math.pow(axis.y, 2));
        axis.x /= lenght;
        axis.y /= lenght;
    }

    object.axis1x = axistltr.x;
    object.axis1y = axistltr.y;

    object.axis2x = axistrbr.x;
    object.axis2y = axistrbr.y;

    object.axis3x = axisbrbl.x;
    object.axis3y = axisbrbl.y;

    object.axis4x = axisbltl.x;
    object.axis4y = axisbltl.y;

}

function projection(object, axisX, axisY){
   

    let corners = [];

    let tl = {
        x: object.tlcx,
        y: object.tlcy
    };
    let tr = {
        x: object.trcx,
        y: object.trcy
    };
    let bl = {
        x: object.blcx,
        y: object.blcy
    };
    let br = {
        x: object.brcx,
        y: object.brcy
    };

    corners.push(tl, tr, br, bl);

    let min = 0;
    let max = 0;

    var firstProj = true;
    for(let corner of corners){
        var projection = (corner.x * axisX) + (corner.y * axisY)
        if(firstProj){
            min = projection;
            max = projection;
            firstProj = false;
        }
        else{
            if(projection < min) {min = projection;}
            if(projection > max) {max = projection;}
        }

    }
    let returner = {
        min2: min,
        max2: max
    };

    return returner;

}

function SAT(objectA, objectB){
    let axesA = [];
    let axesB = [];
    let allAxes = [];

    let axis1A = { x: objectA.axis1x, y: objectA.axis1y };
    let axis2A = { x: objectA.axis2x, y: objectA.axis2y };
    let axis3A = { x: objectA.axis3x, y: objectA.axis3y };
    let axis4A = { x: objectA.axis4x, y: objectA.axis4y };

    let axis1B = { x: objectB.axis1x, y: objectB.axis1y };
    let axis2B = { x: objectB.axis2x, y: objectB.axis2y };
    let axis3B = { x: objectB.axis3x, y: objectB.axis3y };
    let axis4B = { x: objectB.axis4x, y: objectB.axis4y };

    axesA.push(axis1A, axis2A, axis3A, axis4A);
    axesB.push(axis1B, axis2B, axis3B, axis4B);
    allAxes.push(axis1A, axis2A, axis3A, axis4A, axis1B, axis2B, axis3B, axis4B);


    for(let axisA of axesA){
        let aMin = projection(objectA, axisA.x, axisA.y).min2;
        let aMax = projection(objectA, axisA.x, axisA.y).max2;
        let bMin = projection(objectB, axisA.x, axisA.y).min2;
        let bMax = projection(objectB, axisA.x, axisA.y).max2;

        if(aMax < bMin || bMax < aMin){
            return false;
        }
    } 
    for(let axisB of axesB){
        let aMax = projection(objectA, axisB.x, axisB.y).max2;
        let bMin = projection(objectB, axisB.x, axisB.y).min2;
        let aMin = projection(objectA, axisB.x, axisB.y).min2;
        let bMax = projection(objectB, axisB.x, axisB.y).max2;

        if(aMax < bMin || bMax < aMin){
            return false;
        }
    }


    let smallestOverlap = Infinity;
    let minimumAxisX;
    let minimumAxisY;

    for(let axis of allAxes){
        let aMin = projection(objectA, axis.x, axis.y).min2;
        let aMax = projection(objectA, axis.x, axis.y).max2;
        let bMin = projection(objectB, axis.x, axis.y).min2;
        let bMax = projection(objectB, axis.x, axis.y).max2;

        let overlap1 = aMax - bMin;
        let overlap2 = bMax - aMin;
        let overlap = Math.min(overlap1,overlap2);
        if(overlap < smallestOverlap){
            smallestOverlap = overlap;
            minimumAxisX = axis.x;
            minimumAxisY = axis.y;
        }
    }

    getPivot(objectA);
    getPivot(objectB);

    let dirx = objectB.pivotx - objectA.pivotx;
    let diry = objectB.pivoty - objectA.pivoty;

    let dotProduct = (dirx * minimumAxisX) + (diry * minimumAxisY);

    if(dotProduct < 0){
        minimumAxisX = -minimumAxisX;
        minimumAxisY = -minimumAxisY;
    }

    let collisionInfo = {
        isColliding: true,
        penetration: smallestOverlap,
        normalx: minimumAxisX,
        normaly: minimumAxisY
    }

    return collisionInfo;

}

function resolveCollision(){
    //WORK IN PROGRESS HERE
}









//fixes and stuff

function avoidSmallNums(object){
    if(object.xvel <= 0.9 && object.xvel >= -0.9){
        object.xvel = 0;
    }
    if(object.yvel <= 0.1 && object.yvel >= -0.1){
        object.yvel = 0;
    }
    if(object.avel <= 0.5 && object.xvel >= -0.5){
        object.avel = 0;
    }
}


function debugOrigin() {
    ctx.save();

    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.lineWidth = 2;

    // Cross at 0,0
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();

    // Label
    ctx.font = "14px Arial";
    ctx.fillText("(0, 0)", 10, 15);

    ctx.restore();
}

function debugOriginPlayer(player) {
    ctx.save();

    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.lineWidth = 2;

    // Cross at 0,0
    ctx.beginPath();
    ctx.moveTo(player.x - 10, player.y);
    ctx.lineTo(player.x + 10, player.y);
    ctx.moveTo(player.x, player.y - 10);
    ctx.lineTo(player.x, player.y + 10);
    ctx.stroke();

    
    ctx.restore();
}

function debugRotatingPoints(object){

    getRotatedCorners(object);

    const corners = [
        { x: object.tlcx, y: object.tlcy },
        { x: object.trcx, y: object.trcy },
        { x: object.blcx, y: object.blcy },
        { x: object.brcx, y: object.brcy }
    ];

    ctx.save();
    ctx.strokeStyle = "orange";
    ctx.fillStyle = "orange";
    ctx.lineWidth = 1.5;

    for (const point of corners) {
        ctx.beginPath();
        ctx.moveTo(point.x - 5, point.y - 5);
        ctx.lineTo(point.x + 5, point.y + 5);
        ctx.moveTo(point.x - 5, point.y + 5);
        ctx.lineTo(point.x + 5, point.y - 5);
        ctx.stroke();
    }

    ctx.restore();
}




start();