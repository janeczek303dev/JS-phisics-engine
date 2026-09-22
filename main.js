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
    objectH: 25,
    objectW: 25,
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

    for(let object of phisicsObjects){
        getPivot(object);
        resetAcceleration(object);
        resetRotationalAcceleration(object);
        gravity(object,gravity_values);
        calculateRotationalAcceleration(object);
        calculateRotationalVelocity(object, dt);
        calculateVelocity(object,dt);
        friction(object,groundFriction,airResistacce,dt);
        
        doRotation(object,dt);
        moveObject(object,dt);

        avoidSmallNums(object);

        checkWall(object);
        checkGround(object);
    }




    //console.log("aaa")
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

    checkCollision(player,platform1);
    
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
    drawPlayer(box1);
    debugOrigin();
    debugOriginPlayer(player);
    
    
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
//Collisions

function checkCollision(objectA, objectB){
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
    console.log("czarnuszzek");
    //smthsmth
    
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




start();