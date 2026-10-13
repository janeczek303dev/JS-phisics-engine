
//REQUIRED BY THE ENGINE/////////////////////////////////////////////////////
import { Engine, Phiscis_Obj, Rendering_Engine, Phiscis_Tools, phisicsObjects, keys } from "./newengine.js";
import { gravity_values, groundFriction, airResistacce, moveForce } from "./settings.js";
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
//BOUNDARIES OF THE CANVAS
const floor_obj = new Phiscis_Obj(0,498,2,1000,false,0,0.1,"Black");
const roof_obj = new Phiscis_Obj(0,0,2,1000,false,0,0.1,"Black");
const left_wall_obj = new Phiscis_Obj(0,0,1000,2,false,0,0.1,"Black");
const right_wall_obj = new Phiscis_Obj(998,0,1000,2,false,0,0.1,"Black");
//////////////////////////////////////////////////////////////////////////////
const boxButton = document.getElementById("spawnCube");
const playerButton = document.getElementById("spawnPlayer");
const resetButton = document.getElementById("clear");
const xInput = document.getElementById("x");
const yInput = document.getElementById("y");
const wInput = document.getElementById("w");
const hInput = document.getElementById("h");
const massInput = document.getElementById("m");
const colorInput = document.getElementById("c");

function getSpawnValues(isPlayer = false) {
    const x = Number.parseFloat(xInput.value) || 0;
    const y = Number.parseFloat(yInput.value) || 0;
    const width = Number.parseFloat(wInput.value) || 40;
    const height = Number.parseFloat(hInput.value) || 40;
    const mass = Number.parseFloat(massInput.value) || 1;
    const color = colorInput.value || "#ffffff";

    return {
        x,
        y,
        height,
        width,
        isInteractable: isPlayer,
        mass,
        restitution: 0.1,
        color
    };
}

boxButton.addEventListener("click", () => {
    const { x, y, height, width, mass, restitution, color } = getSpawnValues(false);
    new Phiscis_Obj(x, y, height, width, false, mass, restitution, color);
});

playerButton.addEventListener("click", () => {
    const { x, y, height, width, mass, restitution, color } = getSpawnValues(true);
    new Phiscis_Obj(x, y, height, width, true, mass, restitution, color);
});

resetButton.addEventListener("click", () => {
    Engine.removePhisicsObjects(false);
    Rendering_Engine.clearTheCanvas();
});



let player;
for(let object of phisicsObjects){
    if(object.isInteractable){
        player = object;
    }
}

document.addEventListener("keydown", function(event) {
    keys[event.key] = true;
    if(player != null){
        if (event.key === "w" && player.isGrounded) {
            jumpReq = true;
        }
    }
});

document.addEventListener("keyup", function(event) {
    keys[event.key] = false;
});

function start() {
    requestAnimationFrame(gameLoop);

    //calculates the invmass
    for(let object of phisicsObjects){
        if(object.mass != 0){
            object.invmass = 1/object.mass;
        }
        else{
            object.invmass = 0;
        }
        
    }
}

//delta time system
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
    Rendering_Engine.draw();

    requestAnimationFrame(gameLoop);
}


function fixedUpdate(dt) {

    for(let object of phisicsObjects){
        //PHASE 1: preparation of all the data slay
        Engine.getPivot(object);
        Engine.calculateMomentOfInteria(object);
        Engine.getRotatedCorners(object);
        Engine.getEdges(object);
        Engine.getAxes(object);
        Engine.resetAcceleration(object);
        Engine.resetRotationalAcceleration(object);
    }


    for(let object of phisicsObjects){
        //PHASE 2: apply forces bitch
        Engine.gravity(object,gravity_values);
        Engine.friction(object,groundFriction,airResistacce,dt);
    }


    for(let object of phisicsObjects){
    //     Phase 2.5: player movement
        if(object.isInteractable){
            Engine.issiueMovement(object,moveForce);
        }
    }


    for(let object of phisicsObjects){
        //phase 3: calculations and stuff
        Engine.calculateRotationalAcceleration(object);
        Engine.calculateRotationalVelocity(object, dt);
        Engine.calculateVelocity(object,dt);
    }



    //PHASE 4: collisions
    for (let i = 0; i < phisicsObjects.length; i++) {

        for (let j = i + 1; j < phisicsObjects.length; j++) {
            
            let A = phisicsObjects[i];
            let B = phisicsObjects[j];
            Engine.resolveCollision(A, B);
        }
    }
    
    

    for(let object of phisicsObjects){
        //Phase 5: Move shit around
        Engine.doRotation(object,dt);
        Engine.moveObject(object,dt);
    }


    for(let object of phisicsObjects){
        //Phase 6: cleanUp
        Engine.avoidSmallNums(object);
    }
    
}


function update(dt) {
    if (keys["e"]){
        Phiscis_Tools.explosion(180,80, 500,70,phisicsObjects);
    }
}

start();