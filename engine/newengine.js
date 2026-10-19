const canvas = document.getElementById("sex");
const ctx = canvas.getContext("2d");
ctx.fillStyle='Black';

import {mouse} from "./mouseengine.js";
import { gravity_values, groundFriction, airResistacce, moveForce } from "./settings.js";
export const keys = {};
export let phisicsObjects = [];
let sleeping_phisicsObjects = [];




export class Phiscis_Obj {
    constructor(tag,x,y,height,width,isInteractable,mass,restitution,color){
        this.tag = tag;
        this.isInteractable = isInteractable;
        this.x = x;
        this.y = y;
        this.tlcx = 0;
        this.tlcy = 0;
        this.trcx = 0;
        this.trcy = 0;
        this.blcx = 0;
        this.blcy = 0;
        this.brcx = 0;
        this.brcy = 0;
        this.tltrx = 0;
        this.tltry = 0;
        this.trbrx = 0;
        this.trbry = 0;
        this.brblx = 0;
        this.brbly = 0;
        this.bltlx = 0;
        this.bltly = 0;
        this.axis1maxProj = 0;
        this.axis1minProj = 0;
        this.axis2maxProj = 0;
        this.axis2minProj = 0;
        this.axis3maxProj = 0;
        this.axis3minProj = 0;
        this.axis4maxProj = 0;
        this.axis4minProj = 0;
        this.axis1x = 0;
        this.axis1y = 0;
        this.axis2x = 0;
        this.axis2y = 0;
        this.axis3x = 0;
        this.axis3y = 0;
        this.axis4x = 0;
        this.axis4y = 0;
        this.objectH = height;
        this.objectW = width;
        this.xacc = 0;
        this.yacc = 0;
        this.xvel = 0;
        this.yvel = 0;
        this.mass = mass;
        this.invmass = mass === 0 ? 0 : 1 / mass;
        this.isGrounded = true;
        this.rotation =  0;
        this.aacc = 0;
        this.avel = 0;
        this.momentI = 15;
        this.torque = 0;
        this.pivotx = 0;
        this.pivoty = 0;
        this.restitution = restitution;
        this.color = color;

        phisicsObjects.push(this);
    }
}

export let GlobalContactPoints = [];

export class ContactPoint { 
    constructor(objectA, objectB, point, collisionData, restitutionVelocity){
        this.objectA = objectA;
        this.objectB = objectB;
        this.x = point.x;
        this.y = point.y;
        this.collisionData = collisionData;
        this.restitutionVelocity = restitutionVelocity;
        this.normalImpulse = 0;
        GlobalContactPoints.push(this);
    }
}

//renderss

export class Rendering_Engine {

    static draw() {
        // Drawing goes here
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for(let object of phisicsObjects){
            this.drawPlayer(object);
        }

        if(Phiscis_Tools.lastExplosion !== null){
            if(performance.now() < Phiscis_Tools.lastExplosion.expiresAt){
                const { x, y, radius } = Phiscis_Tools.lastExplosion;
                Phiscis_Tools.debugExplosion(x, y, radius);
            }
            else{
                Phiscis_Tools.lastExplosion = null;
            }
        }

        this.drawDot(mouse.x, mouse.y, 2, "Black");
        this.drawDot(200,350,5,"brown");

        //Engine.debugSleeping(sleeping_phisicsObjects);
        Engine.debugOrigin();
   
    }

    static clearTheCanvas(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }    
    static drawPlayer(player){

        ctx.save();
        ctx.fillStyle=player.color;
        ctx.translate(player.x + player.objectW/2, player.y+player.objectH/2);
        ctx.rotate(player.rotation);    
        ctx.fillRect(0 - player.objectW/2 ,0 - player.objectH/2 ,player.objectW, player.objectH);
        ctx.restore();
    }

    static drawDot(x, y, radius, color){
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    static drawGameobject(object){
        ctx.fillStyle = object.fillStyle;
        ctx.fillRect(object.x, object.y, object.objectW, object.objectH);
    }
}

export class Phiscis_Tools {
    static lastExplosion = null

    static debugExplosion(x, y, radius){
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.restore();
    }

    static explosion(x,y,power,radius,phisicsObjects){
        this.lastExplosion = { x, y, radius, expiresAt: performance.now() + 500 };

        for(let object of phisicsObjects){

            if(object.mass != 0){
                let r = Math.sqrt(Math.pow(object.x - x, 2) + Math.pow(object.y - y, 2));

                if(r > radius){
                    continue;
                }

                let d = {
                    dx: (object.x - x) / r,
                    dy: (object.y - y) / r
                }
            
                let force = power * (1 - (r/radius));
            
                let vx = d.dx * (force/object.mass);
                let vy = d.dy * (force/object.mass);

                object.xvel += vx;
                object.yvel += vy;
            }
        }
    }
    static implosion(x,y,power,radius,phisicsObjects){

        for(let object of phisicsObjects){

            if(object.mass != 0){
                let r = Math.sqrt(Math.pow(object.x - x, 2) + Math.pow(object.y - y, 2));

                if(r > radius){
                    continue;
                }

                let d = {
                    dx: (object.x - x) / r,
                    dy: (object.y - y) / r
                }
            
                let force = -power * (1 - (r/radius));
            
                let vx = d.dx * (force/object.mass);
                let vy = d.dy * (force/object.mass);

                object.xvel += vx;
                object.yvel += vy;
            }
        }
    }

    static checkCollision(objectA, objectB){
        var a_left = objectA.x;
        var a_right = objectA.x + objectA.objectW;
        var a_top = objectA.y;
        var a_bottom = objectA.y + objectA.objectH;

        var b_left = objectB.x;
        var b_right = objectB.x + objectB.objectW;
        var b_top = objectB.y;
        var b_bottom = objectB.y + objectB.objectH;

        if(a_right < b_left || a_left > b_right || a_bottom < b_top || a_top > b_bottom){
            return false;
        }
        else{
            return true;
        }
    }

    static addForceAlongNormalisedVector(object,dirx,diry,power){
        if(object.mass != 0){
            object.xacc += dirx * power / object.mass;
            object.yacc += diry * power/ object.mass;
        }
    }
}

export class Engine {
    //PHISICS BITCH

    static removePhisicsObjects(removeStatic) {
        if (removeStatic) {
            phisicsObjects = [];
            return;
        }
    
        for (let i = phisicsObjects.length - 1; i >= 0; i--) {
            if (phisicsObjects[i].mass !== 0) {
                phisicsObjects.splice(i, 1);
            }
        }
    }

    static calculateVelocity(object,dt){
        object.xvel += object.xacc * dt;
        object.yvel += object.yacc * dt;
    }
    static moveObject(object,dt){
        if(object.mass != 0){
            object.x += object.xvel * dt;
            object.y += object.yvel * dt;     
        }

    }

    static gravity(object, gvalue){
        if(object.mass !== 0){
            object.yacc += gvalue;
        }
    }

    static addForce(object, dirx, diry){
        if(object.mass != 0){
            object.xacc += dirx / object.mass;
            object.yacc += diry / object.mass;
        }
    }

    static addForceSimulated(object, dirx, diry, posx, posy){
        this.addForce(object,dirx,diry);
        this.addTorque(object,dirx,diry,posx,posy);
    }

    static addImpulse(object, newx, newy){
        if(newx != null){
            object.xvel = newx;
        }
        if(newy != null){
            object.yvel = newy;
        }
    }

    static resetAcceleration(object){
        object.xacc = 0;
        object.yacc = 0;
    }

    static resetVelocity(object){
        object.xvel = 0;
        object.yvel = 0;
    }

    static addVelocity(object,dirx,diry){
        object.xvel += dirx;
        object.yvel += diry;
    }

    // static jump(object, request){
    //     if(request == true && object.isGrounded){
    //         //resetAcceleration(object);
    //         this.addVelocity(object, 0, jumpForce);
    //         jumpReq = false;
    //     }
    // }


    static friction(object, groundFriction, airResistance, dt){
        let frictionAmount;
        if(object.isGrounded){
            frictionAmount = groundFriction * dt;
        }
        else{
            frictionAmount = airResistance * dt;
        }
        object.xvel -= object.xvel * frictionAmount;
        object.yvel -= object.yvel * frictionAmount;
        //object.avel -= object.avel * groundFriction * dt;
    }

    static issiueMovement(object, movementForce){
        if (keys["a"]) {
            this.addForce(object, -movementForce, 0);
        }
        if (keys["d"]) {
            this.addForce(object, movementForce, 0);
        }
        if (keys["f"]){
            this.addForceSimulated(object, 2000, -800, object.x + 5, object.y + 1);
        }
        
    }

    //Rotation phisics %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    static calculateMomentOfInteria(object){
        object.momentI = (1 / 12) * object.mass * (object.objectW ** 2 + object.objectH ** 2);
    }

    static getPivot(object){
        object.pivotx = object.x + object.objectW / 2;
        object.pivoty = object.y + object.objectH / 2;
    }

    static addTorque(object, forcex, forcey, fposX, fposY){
        //var r = Math.sqrt(Math.pow(forcex - object.pivotx, 2) + Math.pow(forcey - object.pivoty, 2));
        var rx = fposX - object.pivotx;
        var ry = fposY- object.pivoty;
        object.torque = (rx * forcey) - (ry * forcex);
    }

    static calculateRotationalAcceleration(object){
        if(object.momentI != 0){
            object.aacc += object.torque / object.momentI;
        }
    }

    static calculateRotationalVelocity(object, dt){
        object.avel += object.aacc * dt;
    }

    static resetRotationalAcceleration(object){
        object.aacc = 0;
        object.torque = 0;
    }


    static doRotation(object, dt){
        if(object.mass != 0){
            object.rotation += object.avel * dt;
        }
    }

    //Collisions (sat algorythm)

    static getRotatedCorners(object){
        this.getPivot(object);

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

    static getEdges(object){
        object.tltrx = object.trcx - object.tlcx;
        object.tltry = object.trcy - object.tlcy;

        object.trbrx = object.brcx - object.trcx;
        object.trbry = object.brcy - object.trcy;

        object.brblx = object.blcx - object.brcx;
        object.brbly = object.blcy - object.brcy;

        object.bltlx = object.tlcx - object.blcx;
        object.bltly = object.tlcy - object.blcy;
    }

    static getAxes(object){
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

    static projection(object, axisX, axisY){
    

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

    static SAT(objectA, objectB){
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
            let aMax = this.projection(objectA, axisA.x, axisA.y).max2;
            let bMin = this.projection(objectB, axisA.x, axisA.y).min2;
            let bMax = this.projection(objectB, axisA.x, axisA.y).max2;
            let aMin = this.projection(objectA, axisA.x, axisA.y).min2;

            if(aMax < bMin || bMax < aMin){
                return false;
            }
        } 
        for(let axisB of axesB){
            let aMax = this.projection(objectA, axisB.x, axisB.y).max2;
            let bMin = this.projection(objectB, axisB.x, axisB.y).min2;
            let aMin = this.projection(objectA, axisB.x, axisB.y).min2;
            let bMax = this.projection(objectB, axisB.x, axisB.y).max2;

            if(aMax < bMin || bMax < aMin){
                return false;
            }
        }


        let smallestOverlap = Infinity;
        let minimumAxisX;
        let minimumAxisY;

        for(let axis of allAxes){
            let aMin = this.projection(objectA, axis.x, axis.y).min2;
            let aMax = this.projection(objectA, axis.x, axis.y).max2;
            let bMin = this.projection(objectB, axis.x, axis.y).min2;
            let bMax = this.projection(objectB, axis.x, axis.y).max2;

            let overlap1 = aMax - bMin;
            let overlap2 = bMax - aMin;
            let overlap = Math.min(overlap1,overlap2);
            if(overlap < smallestOverlap){
                smallestOverlap = overlap;
                minimumAxisX = axis.x;
                minimumAxisY = axis.y;
            }
        }

        this.getPivot(objectA);
        this.getPivot(objectB);

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

    static returnEdges(object){
        let edges = [];

        let edge1 = {
            p1: { x: object.tlcx, y: object.tlcy },
            p2: { x: object.trcx, y: object.trcy },
            x: object.tltrx,
            y: object.tltry
        };
        let edge2 = {
            p1: { x: object.trcx, y: object.trcy },
            p2: { x: object.brcx, y: object.brcy },
            x: object.trbrx,
            y: object.trbry
        };
        let edge3 = {
            p1: { x: object.brcx, y: object.brcy },
            p2: { x: object.blcx, y: object.blcy },
            x: object.brblx,
            y: object.brbly
        };
        let edge4 = {
            p1: { x: object.blcx, y: object.blcy },
            p2: { x: object.tlcx, y: object.tlcy },
            x: object.bltlx,
            y: object.bltly
        };

        edges.push(edge1,edge2,edge3,edge4);
        return edges;
    }

    static returnEdgeNormalFacingOutward(edge, object){
        
        let normal = {
            x: -edge.y,
            y: edge.x
        };

        let lenght = Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y,2));

        normal.x = normal.x/lenght;
        normal.y = normal.y/lenght;
        
        let midpointx = (edge.p1.x + edge.p2.x) / 2;
        let midpointy = (edge.p1.y + edge.p2.y) / 2;

        let toCenter = {
            x: object.pivotx - midpointx,
            y: object.pivoty - midpointy
        };

        let dot = this.returnDotProduct(normal.x, normal.y, toCenter);
        if(dot > 0){
            normal.x *= -1;
            normal.y *= -1;
        }

        return normal;
    }

    static returnNormalisedDirection(edge){
        let direction = {
            dx: edge.p2.x - edge.p1.x,
            dy: edge.p2.y - edge.p1.y
        };

        let length = Math.sqrt(
            direction.dx * direction.dx +
            direction.dy * direction.dy
        );

        direction.dx /= length;
        direction.dy /= length;

        return direction;
    }

    static returnDotProduct(collisionNormalx, collisionNormaly ,edge){
        let dot = (edge.x * collisionNormalx) + (edge.y * collisionNormaly);
        return dot;
    }

    static isPointInPlane(point,plane){
        let pdx = point.x - plane.point.x;
        let pdy = point.y - plane.point.y;

        let distance = pdx * plane.normalx + pdy * plane.normaly;
        if(distance >= 0){
            return true;
        }
        else{
            return false;
        }
    }

    static signedDistance(point,plane){
        let pdx = point.x - plane.point.x;
        let pdy = point.y - plane.point.y;

        let distance = pdx * plane.normalx + pdy * plane.normaly;
        return distance;
    }

    static resolveClipping(referenceEdge,incidentEdge){

        let points = [];
        points.push(incidentEdge.p1, incidentEdge.p2);

        let referenceEdgeDir = this.returnNormalisedDirection(referenceEdge);

        let plane1 = {
            point: referenceEdge.p1,
            normalx: referenceEdgeDir.dx,
            normaly: referenceEdgeDir.dy
        }
        let plane2 = {
            point: referenceEdge.p2,
            normalx: -referenceEdgeDir.dx,
            normaly: -referenceEdgeDir.dy
        }

        let incidentEdgePoints = {
            I1Plane1: true,
            I1Plane2: true,
            I2Plane1: true,
            I2Plane2: true
        };



        incidentEdgePoints.I1Plane1 = this.isPointInPlane(points[0],plane1);
        incidentEdgePoints.I2Plane1 = this.isPointInPlane(points[1],plane1);

        if(incidentEdgePoints.I1Plane1 && !incidentEdgePoints.I2Plane1){
            points[1] = this.returnIntersection(points[0],points[1],plane1);
        }
        if(!incidentEdgePoints.I1Plane1 && incidentEdgePoints.I2Plane1){
            points[0] = this.returnIntersection(points[0],points[1],plane1);
        }
        if(!incidentEdgePoints.I1Plane1 && !incidentEdgePoints.I2Plane1){
            points = [];
        }

        if(points.length === 0){
            return points;
        }

        incidentEdgePoints.I1Plane2 = this.isPointInPlane(points[0],plane2);
        incidentEdgePoints.I2Plane2 = this.isPointInPlane(points[1],plane2);

        if(incidentEdgePoints.I1Plane2 && !incidentEdgePoints.I2Plane2){
            points[1] = this.returnIntersection(points[0],points[1],plane2);
        }
        if(!incidentEdgePoints.I1Plane2 && incidentEdgePoints.I2Plane2){
            points[0] = this.returnIntersection(points[0],points[1],plane2);
        }
        if(!incidentEdgePoints.I1Plane2 && !incidentEdgePoints.I2Plane2){
            points = [];
        }

        points = points.filter(function(p){
            let separation = (p.x - referenceEdge.p1.x) * referenceEdge.x +
                            (p.y - referenceEdge.p1.y) * referenceEdge.y;
            return separation <= 0;
        });

        return points;

    }

    static returnIntersection(point1, point2, plane){
        let d1 = this.signedDistance(point1, plane);
        let d2 = this.signedDistance(point2, plane);

        let t = d1 / (d1 - d2);

        let intersection = {
            x: point1.x + t*(point2.x - point1.x),
            y: point1.y + t*(point2.y - point1.y)
        }

        return intersection;
    }


    static calculateContactVelocity(object,point){

        
        var rx = point.x - object.pivotx;
        var ry = point.y - object.pivoty;

        let contactVel = {
            vx: object.xvel - object.avel * ry,
            vy: object.yvel + object.avel * rx
        }

        return contactVel;
    }

    static calculateRelativeVelocityAlongCollisionNormal(objectAvel,objectBvel,normalx,normaly){
        let relativeVelX = objectBvel.vx - objectAvel.vx;
        let relativeVelY = objectBvel.vy - objectAvel.vy;

        let relativeVelocity = relativeVelX * normalx + relativeVelY * normaly;
        return relativeVelocity;
    }

    static putToSleep(object){
        if(object.xvel < 0.1 && object.xvel > -0.1 && object.yvel < 0.1 && object.yvel > -0.1){
            sleeping_phisicsObjects.push(object);
        }
    }

    static positionCorrection(objectA,objectB,collisionData){
        let totalInverseMass = objectA.invmass + objectB.invmass;
        if(totalInverseMass === 0){
            return;
        }

        let slop = 0.02;   
        let separationVector = {
            x:  collisionData.normalx * Math.max(collisionData.penetration - slop, 0),
            y:  collisionData.normaly * Math.max(collisionData.penetration - slop, 0)
        };
        
        const b = 0.8;

        let correctionA = {
            x: b * separationVector.x * (objectA.invmass/totalInverseMass),
            y: b * separationVector.y * (objectA.invmass/totalInverseMass)
        };
        let correctionB =  {
            x: b * separationVector.x * (objectB.invmass/totalInverseMass),
            y: b * separationVector.y * (objectB.invmass/totalInverseMass)
        }
        

        objectA.x -= correctionA.x;
        objectA.y -= correctionA.y   
        objectB.x += correctionB.x;
        objectB.y += correctionB.y;
    }

    static clearGlobalPoints(){
        GlobalContactPoints = [];
    }


    static resolveCollisionForPoints(objectA, objectB,dt){
        this.getAxes(objectA);
        this.getAxes(objectB);

        //Calling the detection algorythm, it returns: isColliding, normalx, normaly, penetration
        let collisionData = this.SAT(objectA,objectB);

        //returns 0 if there is no collsiosn
        if(collisionData == false){
            return 0;
        }


        let edgesA = this.returnEdges(objectA);
        let edgesB = this.returnEdges(objectB);

        //nnormalising my edges for both obejcts and making 
        for(let edge of edgesA){
            let n = this.returnEdgeNormalFacingOutward(edge, objectA);
            edge.x = n.x;
            edge.y = n.y;
        }

        for(let edge of edgesB){
            let n = this.returnEdgeNormalFacingOutward(edge, objectB);
            edge.x = n.x;
            edge.y = n.y;
        }
        

        //Choosing the referenceEdge and incidentEdge for future collssion response
        let referenceEdge = {
            p1: {x: 0, y: 0},
            p2: {x: 0, y: 0},
            x: 0,
            y: 0
        };
        let refCandidateA = {
            x: 0,
            y: 0
        };
        let refCandidateB = {
            x: 0,
            y: 0            
        }
        let incidentEdge = {
            p1: {x: 0, y: 0},
            p2: {x: 0, y: 0},
            x: 0,
            y: 0
        };

        


        let dot;
        let largestDotA;
        let largestDotB;

        let firstIte = true;

        for(let edge of edgesA){
            dot = this.returnDotProduct(collisionData.normalx, collisionData.normaly, edge);
            if(firstIte){
                largestDotA = dot;
                refCandidateA = edge;
                firstIte = false;
            }
            else{
                if(dot > largestDotA){
                    largestDotA = dot;
                    refCandidateA = edge;
                }
            }
        }

        firstIte = true;

        for(let edge of edgesB){
            dot = this.returnDotProduct(-collisionData.normalx, -collisionData.normaly, edge);
            if(firstIte){
                largestDotB = dot;
                refCandidateB = edge;
                firstIte = false;
            }
            else{
                if(dot > largestDotB){
                    largestDotB = dot;
                    refCandidateB = edge;
                }
            }
        }

        let dot2;
        let smallestDot2;

        firstIte = true;

        if(largestDotA > largestDotB){
            referenceEdge = refCandidateA;


            for(let edge of edgesB){
                dot2 = this.returnDotProduct(edge.x,edge.y,referenceEdge);
                if(firstIte){
                    firstIte = false;
                    smallestDot2 = dot2;
                    incidentEdge = edge;
                }
                else{
                    if(dot2<smallestDot2){
                        smallestDot2 = dot2;
                        incidentEdge = edge;
                    }
                }
            }
        }

        else{
            firstIte = true;
            referenceEdge = refCandidateB;


            for(let edge of edgesA){
                dot2 = this.returnDotProduct(edge.x,edge.y,referenceEdge);
                if(firstIte){
                    firstIte = false;
                    smallestDot2 = dot2;
                    incidentEdge = edge;
                }
                else{
                    if(dot2<smallestDot2){
                        smallestDot2 = dot2;
                        incidentEdge = edge;
                    }
                }
            }       
        }


        let contactPoints = this.resolveClipping(referenceEdge, incidentEdge);


        this.getPivot(objectA);
        this.getPivot(objectB);


        for(let contactPoint of contactPoints){
            let acv = this.calculateContactVelocity(objectA, contactPoint);
            let bcv = this.calculateContactVelocity(objectB, contactPoint);
            let relativeVelocity = this.calculateRelativeVelocityAlongCollisionNormal(
                acv,
                bcv,
                collisionData.normalx,
                collisionData.normaly
            );
            let restitution = (objectA.restitution + objectB.restitution) / 2;
            let restitutionVelocity;
            if (relativeVelocity < -(6 * gravity_values * dt)) {
                restitutionVelocity = -restitution * relativeVelocity;
            } else {
                restitutionVelocity = 0;
            }
            new ContactPoint(objectA, objectB, contactPoint, collisionData, restitutionVelocity);
        }   
    }

    static collisionResponse(GlobalContactPoints){
        const correctedPairs = new Map();
        for(let point of GlobalContactPoints){
            let correctedObjects = correctedPairs.get(point.objectA);
            if(!correctedObjects){
                correctedObjects = new Set();
                correctedPairs.set(point.objectA, correctedObjects);
            }
            if(!correctedObjects.has(point.objectB)){
                this.positionCorrection(point.objectA, point.objectB, point.collisionData);
                correctedObjects.add(point.objectB);
                this.getPivot(point.objectA);
                this.getPivot(point.objectB);
            }
        }

        const iterations = 32;
        for(let i = 0; i < iterations; i++){
            for(let point of GlobalContactPoints){
                const objectA = point.objectA;
                const objectB = point.objectB;
                const normalx = point.collisionData.normalx;
                const normaly = point.collisionData.normaly;
                const rAx = point.x - objectA.pivotx;
                const rAy = point.y - objectA.pivoty;
                const rBx = point.x - objectB.pivotx;
                const rBy = point.y - objectB.pivoty;
                const rAn = rAx * normaly - rAy * normalx;
                const rBn = rBx * normaly - rBy * normalx;
                const totalInverseMass = objectA.invmass + objectB.invmass;
                const rotationalMassA = objectA.momentI === 0 ? 0 : rAn * rAn / objectA.momentI;
                const rotationalMassB = objectB.momentI === 0 ? 0 : rBn * rBn / objectB.momentI;
                const denominator = totalInverseMass + rotationalMassA + rotationalMassB;
                if(denominator === 0){
                    continue;
                }

                const acv = this.calculateContactVelocity(objectA, point);
                const bcv = this.calculateContactVelocity(objectB, point);
                const relativeVelocity = this.calculateRelativeVelocityAlongCollisionNormal(acv, bcv, normalx, normaly);
                const impulse = (point.restitutionVelocity - relativeVelocity) / denominator;
                const newImpulse = Math.max(point.normalImpulse + impulse, 0);
                const impulseChange = newImpulse - point.normalImpulse;
                point.normalImpulse = newImpulse;

                const jx = impulseChange * normalx;
                const jy = impulseChange * normaly;
                const torqueA = rAx * jy - rAy * jx;
                const torqueB = rBx * jy - rBy * jx;

                objectA.xvel -= jx * objectA.invmass;
                objectA.yvel -= jy * objectA.invmass;
                objectB.xvel += jx * objectB.invmass;
                objectB.yvel += jy * objectB.invmass;
                if(objectA.momentI !== 0){
                    objectA.avel -= torqueA / objectA.momentI;
                }
                if(objectB.momentI !== 0){
                    objectB.avel += torqueB / objectB.momentI;
                }
            }
        }
    }
    static collisionSeparation(objectA, objectB){
        let collisionData = this.SAT(objectA,objectB);
        if(collisionData == false){
            return false;
        }
        this.positionCorrection(objectA, objectB, collisionData);
    }

    //fixes and stuff
    static avoidSmallNums(object){
        if(object.xvel <= 0.1 && object.xvel >= -0.1){
            object.xvel = 0;
        }
        if(object.yvel <= 0.1 && object.yvel >= -0.1){
            object.yvel = 0;
        }
        if(object.avel <= 0.01 && object.avel >= -0.01){
            object.avel = 0;
        }
    }


    static debugOrigin() {
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

    static debugSleeping(sleeping){
        for(let object of sleeping){
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.fillStyle = "red";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(object.pivotx - 10, object.pivoty);
            ctx.lineTo(object.pivotx + 10, object.pivoty);
            ctx.moveTo(object.pivotx, object.pivoty - 10);
            ctx.lineTo(object.pivotx, object.pivoty + 10);
            ctx.stroke();
            ctx.restore();
        }
    }

    static debugOriginPlayer(player) {
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

    static debugRotatingPoints(object){

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
}



