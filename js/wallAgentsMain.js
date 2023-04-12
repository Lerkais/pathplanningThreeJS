import * as THREE from 'three';
import * as PHY from 'simplePhysics';
import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";

import Stats from 'three/addons/libs/stats.module.js';

let renderer, scene, camera;
let world = {
    x: 80,
    z: 80
};
let agentData = [];
let pickableObjects = [];
let wallsData = [];
let sdfMaterials = {}
wallsData.push({
        "x": -15.0,
        "y": 0,
        "z": -15.0,
        "dx":5.0,
        "dy":15.0,
        "dz":20.0,
    });

wallsData.push({
        "x": 25.0,
        "y": 0,
        "z": 25.0,
        "dx":5.0,
        "dy":5.0,
        "dz":5.0,
    });

let C_QUANTIZATION = 10;
let selected = null;
let mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let grid;
let sdfCells = [];
let sdfCellsMap = {};
let topTexture;
const RADIUS = 1;
const C_CELL_DIM = 0.25;
const blueAgentMaterial = new THREE.MeshLambertMaterial({
    color: 0x0000ff
});
const redAgentMaterial = new THREE.MeshLambertMaterial({
    color: 0xff0000
});

const stats = new Stats();
document.body.appendChild(stats.dom)   



init();
render();


function init() {
    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // scene
    scene = new THREE.Scene();
    // camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-67.26, 54.07, -3.77);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = -1.6267;
    camera.rotation.x = -0.46;

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2;

    // light
    const light = new THREE.PointLight(0xffffff, 0.9, 0, 100000);
    light.position.set(0, 50, 120);
    light.castShadow = true;
    light.shadow.mapSize.width = 512; // default
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 5000; // default

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.castShadow = true;
    directionalLight.position.set(-5, 20, 4);
    directionalLight.target.position.set(9, 0, -9);
    directionalLight.shadow.camera.left *= 9;
    directionalLight.shadow.camera.right *= 9;
    directionalLight.shadow.camera.top *= 9;
    directionalLight.shadow.camera.bottom *= 9;

    scene.add(directionalLight);

    // axes
    scene.add(new THREE.AxesHelper(40));
    const loader = new THREE.TextureLoader();
    const texture = loader.load('resources/OIP.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = 40 / 32;
    texture.repeat.set(repeats, repeats);

    
    topTexture = loader.load('resources/triangle2.png');
    //topTexture.wrapS = THREE.RepeatWrapping;
    //topTexture.wrapT = THREE.RepeatWrapping;
    topTexture.magFilter = THREE.NearestFilter;
    topTexture.repeat.set(3, 3);
    //topTexture.rotation = -Math.PI / 2;
    // grid
    const geometry = new THREE.PlaneGeometry(world.x, world.z, 10, 10);
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        //side: THREE.DoubleSide,
    });
    grid = new THREE.Mesh(geometry, material);
    grid.rotation.order = 'YXZ';
    grid.rotation.y = -Math.PI / 2;
    grid.rotation.x = -Math.PI / 2;
    scene.add(grid);

    createSDFColors(C_QUANTIZATION);
    addGridCells(world);
    

    // quantization value between 0 and 1
    function createSDFColors(quantization)
    {
        let sdfMaterialQuant=0,sdfMaterial;
        while(sdfMaterialQuant<=100)
        {
            sdfMaterial = new THREE.MeshLambertMaterial({
                    color: new THREE.Color( sdfMaterialQuant/100.0, sdfMaterialQuant/100.0, 0 )
                }) ;  
            sdfMaterials[sdfMaterialQuant] = sdfMaterial; 
            sdfMaterialQuant+=quantization;
        }
    }



    function addGridCells(world)
    {
        let start_x = -world.x/2;
        let start_z = -world.z/2;
        let start_y = 0.0;
        let cur_z;
        let voxelMaterial;
        let cur_x = start_x;
        let xIndex,zIndex;
        xIndex=0;
        while(cur_x<world.x/2)
        {
            zIndex=0;
            cur_z = start_z;
            while(cur_z<world.z/2)
            {
                voxelMaterial = getSDFMaterialKey(Math.random() *100 ) ;
                let sdfCell = {"material":voxelMaterial,"x":cur_x, "y": start_y,  "z":cur_z , 
                               "xIndex":xIndex, "zIndex":zIndex};
                sdfCells.push(sdfCell);
                sdfCellsMap[[xIndex,zIndex]] = sdfCell;
                cur_z+=C_CELL_DIM;
                zIndex+=1;
            }
            xIndex+=1;
           cur_x+=C_CELL_DIM; 
        }
        world.sdfCellsMap=sdfCellsMap;
        world.getSDFCell = function (x,z) {
            let res;
            if(x>=-world.x/2 && x<=world.x/2 && z>=-world.z/2 && z<=world.z/2)
            {
                //adjust starting point 
                let xIndex = Math.floor( (x+world.x/2)/C_CELL_DIM);
                let zIndex = Math.floor( (z+world.z/2)/C_CELL_DIM);
                res = world.sdfCellsMap[[xIndex,zIndex]];
            }
            return res;
        };
        

    }

    function addColumnAgentGroup(agentData, numAgents, spacing,
        startPos, goalPos,
        velocityMagnitude, direction) {
        let i = 0;
        let initalIdx = agentData.length;
        let dx = 0,
            dz = 0,
            vx = 0,
            vz = 0;
        let distanceToGoal = PHY.distance(startPos.x, startPos.z,
            goalPos.x, goalPos.z);
        vx = velocityMagnitude * (goalPos.x - startPos.x) / distanceToGoal;
        vz = velocityMagnitude * (goalPos.z - startPos.z) / distanceToGoal;

        if (direction == "X") {
            dx = spacing;
        } else if (direction == "Z") {
            dz = spacing;
        }
        while (i < numAgents) {
            agentData.push({
                index: i + initalIdx,
                x: startPos.x + dx * i,
                y: 2.0,
                z: startPos.z + dz * i,
                goal_x: goalPos.x + dx * i,
                goal_y: 0.0,
                goal_z: goalPos.z + dz * i,
                vx: vx,
                vy: 0.0,
                vz: vz,
                v_pref: Math.sqrt(vx*vx + vz*vz),
                radius: RADIUS,
                invmass: 0.5,
                group_id: 1
            });
            i += 1;
        }
    }


    let i = 0;
    let deltaSpacing = 3;
    let startX, startY, goalX, goalY;
    startX = -25;
    goalX = -25;
    startY = -20
    goalY = 20;
    world.distanceConstraints = [];

    addColumnAgentGroup(agentData, 3, RADIUS * 4, {
            x: 30,
            z: 25
        }, {
            x: -25,
            z: 25
        },
        0.6, "X", );

    addColumnAgentGroup(agentData, 4, RADIUS * 4, {
            x: 25,
            z: 20
        }, {
            x: -25,
            z: 20
        },
        0.7, "X", );

    addColumnAgentGroup(agentData, 4, RADIUS * 4, {
            x: 25,
            z: 10
        }, {
            x: -25,
            z: 10
        },
        0.8, "X", );

    addColumnAgentGroup(agentData, 4, RADIUS * 4, {
            x: 25,
            z: 6
        }, {
            x: -25,
            z: 6
        },
        0.8, "X", );

    addColumnAgentGroup(agentData, 3, RADIUS * 4, {
            x: -25,
            z: 12
        }, {
            x: 30,
            z: 25
        },
        0.6, "X", );

    addColumnAgentGroup(agentData, 3, RADIUS * 4, {
            x: -25,
            z: 0
        }, {
            x: 30,
            z: 33
        },
        0.6, "X", );


    addColumnAgentGroup(agentData, 8, RADIUS * 4, {
            x: 0,
            z: -25.
        }, {
            x: 0,
            z: 30,
        },
        0.6, "Z", );

    addColumnAgentGroup(agentData, 3, RADIUS * 4, {
            x: RADIUS * 3,
            z: 25.
        }, {
            x: RADIUS * 3,
            z: -25,
        },
        0.6, "Z", );


    let agnetGeometry, agentMaterial, agent;

    agentData.forEach(function(item) {
        agnetGeometry = new THREE.CylinderGeometry(item.radius, 1, 4, 16);
        agentMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ff00
        }) ;

        agent = new THREE.Mesh(agnetGeometry, agentMaterial);
        agent.castShadow = true;
        agent.receiveShadow = true;
        agent.userData = {"index": item.index};
        scene.add(agent);

        item.agent = agent;
        pickableObjects.push(agent);
    });



    let wallGeometry, wall, wallMaterial;
    wallsData.forEach(function (item) {
        wallGeometry = new THREE.SphereGeometry(item.dx, 16, 16);
        wallMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ff00
        }) ;

        wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData = {"index": item.index};
        scene.add(wall);
        wall.position.x = item.x; 
        wall.position.y = item.y; 
        wall.position.z = item.z; 
        //pickableObjects.push(wall);
    });

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mousemove", mouseMove, false);
}    


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function mouseMove(event) {
    event.preventDefault();
    if(selected!=null)
    {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);    
        var intersects =  raycaster.intersectObject(grid, false);
        for (var i = 0; i < intersects.length; i++) {
            agentData.forEach(function(member) {
                if (selected != null && member.index == selected) {
                    member.goal_x = intersects[i].point.x;
                    member.goal_z = intersects[i].point.z;


                }
            });
            break;
        }   
    }
}


function mouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    selected=null;
    var intersects =  raycaster.intersectObjects(pickableObjects, false);
    for (var i = 0; i < intersects.length; i++) {
        selected = intersects[i].object.userData.index;
        break;
    }  
}

//integers between 1...100
function getSDFMaterialKey(value)
{
    const materialKey = Math.trunc(Math.floor(value/C_QUANTIZATION) * C_QUANTIZATION);
    let res =  sdfMaterials[materialKey];
    if(res==undefined)
    {
        console.log(materialKey, sdfMaterials);
        return undefined;
    }
    return materialKey;
}

//integers between 1...100
function getSDFMaterial(value)
{
    const materialKey = Math.trunc(Math.floor(value/C_QUANTIZATION) * C_QUANTIZATION);
    let res =  sdfMaterials[materialKey];
    if(res==undefined)
    {
        console.log(materialKey, sdfMaterials);
    }
    return res;
}



function setVoxelPosition(sdfCell)
{
    let x = sdfCell.x;
    let y = sdfCell.y;
    let z = sdfCell.z; 
    let mesh = sdfCell.voxel;
    let countId = sdfCell._id; 
    const dummy = new THREE.Object3D()
    dummy.position.set(x,y,z);
    dummy.updateMatrix()
    mesh.setMatrixAt(countId, dummy.matrix)
}

function constructInstancedMeshes()
{
    let materialsCount ={};
    let totalNumCells=0;

    sdfCells.forEach(function(cell) {    
        totalNumCells+=1;
        if(cell.material in materialsCount)
        {
            cell._id = materialsCount[cell.material]; 
            materialsCount[cell.material]=materialsCount[cell.material]+1;
        }
        else
        {
           cell._id = 0;
           materialsCount[cell.material] = 1; 
        }
    });   
    let count, material, mesh, instancedMeshes = {};
    let geometry = new THREE.BoxGeometry(C_CELL_DIM*0.98, 1, C_CELL_DIM*0.98);
    var keys = Object.keys(materialsCount);
    for(let i in keys){
        count = materialsCount[keys[i]]
        material = getSDFMaterial(keys[i]);
        mesh = new THREE.InstancedMesh(geometry, material, count)
        mesh.receiveShadow = true;
        scene.add(mesh) 
        instancedMeshes[ keys[i] ] = mesh;
    }

    sdfCells.forEach(function(cell) {
        const dummy = new THREE.Object3D()
        dummy.position.set(cell.x,cell.y, cell.z);
        dummy.updateMatrix()
        let mesh = instancedMeshes[cell.material];
        mesh.setMatrixAt(cell._id, dummy.matrix) 
    });
}


function getCell(x,z)
{
    let cell =  sdfCellsMap[[x,z]]
    return cell;    
}

function getSDFNeighbourBottom(x,z)
{
    let res = getCell(x,z-1);
    if(res==undefined){
        res = getCell(x,z); 
    }
    return res;
}
function getSDFNeighbourTop(x,z)
{
    let res = getCell(x,z+1);
    if(res==undefined){
        res = getCell(x,z); 
    }
    return res;
}

function getSDFNeighbourLeft(x,z)
{
    let res = getCell(x-1,z);
    if(res==undefined){
        res = getCell(x,z); 
    }
    return res;
}
function getSDFNeighbourRight(x,z)
{
    let res = getCell(x+1,z);
    if(res==undefined){
        res = getCell(x,z); 
    }
    return res;
}

function calculateSDFGradiant(x,z)
{
    let center = getCell(x,z);
    if(center!=undefined)
    {
        left = getSDFNeighbourLeft(x,z);
        right = getSDFNeighbourRight(x,z);
        up = getSDFNeighbourTop(x,z);
        down = getSDFNeighbourBottom(x,z);

        Math.abs(left.+right+up+down)
        
            // TODO work in progress
            //center.grad = {x: gradx z: gradz}

    }
}



function calculateCellSDFGradiants() 
{
    sdfCells.forEach(function(cell) {
        calculateSDFGradiant(cell.xIndex,cell.zIndex);
     });    
}

function updateSDFMaterial()
{
    // iterate over all wallsData
    let i =0,j, dist,curDist;
    while(i<sdfCells.length)
    {
        j=0;
        dist = 6666666;   
        while(j<wallsData.length)
        {
            curDist= PHY.distance(sdfCells[i].x,  sdfCells[i].z, 
                              wallsData[j].x, wallsData[j].z)
                     - wallsData[j].dx;            
            if(curDist<dist)
            {
                dist = curDist;    
            }
            j+=1;
        }
        sdfCells[i].dist = dist;
        i+=1;
    }

    let minSDFvalue=sdfCells[0].dist;
    let maxSDFValue=sdfCells[0].dist;
    i=1;
    while(i<sdfCells.length)
    {
        minSDFvalue=Math.min(minSDFvalue,sdfCells[i].dist);
        maxSDFValue=Math.max(maxSDFValue,sdfCells[i].dist);
        i+=1;
    }

    i=0;
    while(i<sdfCells.length)
    {
        // actual distance field value 
        sdfCells[i].sdf = sdfCells[i].dist;
        // sdf value for visualization
        sdfCells[i].dist= 100 * (sdfCells[i].dist-minSDFvalue)/
                          (maxSDFValue - minSDFvalue)
        i+=1;
    } 
    if(sdfCells!=undefined)
    {
        sdfCells.forEach(function(cell) {
            let materialKey  = getSDFMaterialKey(cell.dist ) ;
            if(materialKey!=undefined){            
                cell.material = materialKey;
            }  
         });
    }
    constructInstancedMeshes();
    calculateCellSDFGradiants();
}


function render() {
    renderer.render(scene, camera);
}


function animate() {
    requestAnimationFrame(animate);
    PHY.step(RADIUS, agentData, world)
    agentData.forEach(function(member) {
        member.agent.position.x = member.x;
        member.agent.position.y = member.y;
        member.agent.position.z = member.z;
        member.agent.material = redAgentMaterial;
        if(selected!=null&& member.index == selected)
        {
            member.agent.material = blueAgentMaterial;
            selected = null;
        }

    });
    renderer.render(scene, camera);
    stats.update()
};


updateSDFMaterial();
animate();