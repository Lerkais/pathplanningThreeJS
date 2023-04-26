export function distance(x1, y1, x2, y2) {
      return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}
import * as PHY from 'simplePhysics';

<<<<<<< Updated upstream
export function step(RADIUS,sceneEntities,world,sdfCells) {
  const C_TAU_MAX = 20;
	//double C_MAX_ACCELERATION = cur->getTimeStep() * MAX_ACCEL;
	const C_MAX_ACCELERATION = 0.01;
  const C_TAO0 = 20;
  const C_LONG_RANGE_STIFF = 0.02;
  const AGENTSIZE = RADIUS * 2;
  const epsilon = 0.0001;
  const timestep = 0.03;
  const ITERNUM =3;
  const MAX_DELTA = 0.9;//0.01;
=======


export function step(RADIUS,sceneEntities,world,sdfCellsMap) {
const C_TAU_MAX = 20;
//double C_MAX_ACCELERATION = cur->getTimeStep() * MAX_ACCEL;
const C_MAX_ACCELERATION = 0.01;
const C_TAO0 = 20;
const C_LONG_RANGE_STIFF = 0.02;
const AGENTSIZE = RADIUS * 2;
const epsilon = 0.0001;
const timestep = 0.03;
const ITERNUM =3;
const MAX_DELTA = 0.9;//0.01;
>>>>>>> Stashed changes


function getCell(x,z)
{

    let a = Math.floor((x +world.x/2)/world.C_CELL_DIM)
    let b = Math.floor((z +world.z/2)/world.C_CELL_DIM)

    let cell =  sdfCellsMap[[a,b]]
    return cell;
}
function getSDFNeighbourBottom(x,z)
{
    let res = getCell(x,z-world.C_CELL_DIM);
    if(res==undefined){
        res = getCell(x,z);
    }
    return res;
}
function getSDFNeighbourTop(x,z)
{
    let res = getCell(x,z+world.C_CELL_DIM);
    if(res==undefined){
        res = getCell(x,z);
    }
    return res;
}

function getSDFNeighbourLeft(x,z)
{
    let res = getCell(x-world.C_CELL_DIM,z);
    if(res==undefined){
        res = getCell(x,z);
    }
    return res;
}
function getSDFNeighbourRight(x,z)
{
    let res = getCell(x+world.C_CELL_DIM,z);
    if(res==undefined){
        res = getCell(x,z);
    }
    return res;
}

function clamp2D(vx,vy, maxValue) {
  const lengthV = Math.sqrt(vx * vx + vy * vy);
  if (lengthV > maxValue) {
    const mult = (maxValue / lengthV);
    vx *= mult;
    vy *= mult;
  }
  return {"x":vx, "y":vy}
}

<<<<<<< Updated upstream

  /*  -----------------------  */
  /*  TODO modify lines below  */
  /*  -----------------------  */
  function distanceConstraint(agent_i,agent_j, desiredDistance)
  {
    const agentCentroidDist = distance(agent_i.px, agent_i.pz, 
                agent_j.px, agent_j.pz );
    const agentDist = agentCentroidDist - desiredDistance;
    const dir_x = (agent_j.px- agent_i.px)/agentCentroidDist; 
    const dir_z = (agent_j.pz- agent_i.pz)/agentCentroidDist; 
    const agent_i_scaler = 0.1*agent_i.invmass/(agent_i.invmass+agent_j.invmass) * agentDist;
    const agent_j_scaler = 0.1*agent_j.invmass/(agent_i.invmass+agent_j.invmass) * agentDist;
    if(Math.abs(agentDist) > epsilon )
    {
        agent_i.px +=  agent_i_scaler * dir_x
        agent_i.pz +=  agent_i_scaler * dir_z
        agent_j.px += - agent_j_scaler * dir_x
        agent_j.pz += - agent_j_scaler * dir_z
    } 
  }

  function longRangeConstraint(agent_i, agent_j)
  {
      const agentCentroidDist = distance(agent_i.px, agent_i.pz, 
                agent_j.px, agent_j.pz );
      const radius_init = AGENTSIZE;
      const radius_sq_init = radius_init * radius_init;
      var radius_sq = radius_sq_init;
      const dv_i = 1.;  // 1./delta_t;
      let delta_correction_i, delta_correction_j;
	    if (agentCentroidDist < radius_init) {
	    	radius_sq = (radius_init - agentCentroidDist) * (radius_init - agentCentroidDist);
      }
      const v_x = (agent_i.px - agent_i.x) / timestep - (agent_j.px - agent_j.x) / timestep;
      const v_y = (agent_i.pz - agent_i.z) / timestep - (agent_j.pz - agent_j.z) / timestep;
      const x0 = agent_i.x - agent_j.x; 
      const y0 = agent_i.z - agent_j.z; 
      const v_sq = v_x * v_x + v_y * v_y;
      const x0_sq = x0 * x0;
      const y0_sq = y0 * y0;
      const x_sq = x0_sq + y0_sq; 
      const a = v_sq;
      const b = -v_x * x0 - v_y * y0;   // b = -1 * v_.dot(x0_).  Have to check this. 
      const b_sq = b * b;
		  const c = x_sq - radius_sq;
		  const d_sq = b_sq - a * c;
		  const d = Math.sqrt(d_sq);
		  const tao = (b - d) / a;
      let lengthV;
      if (d_sq > 0.0 && Math.abs(a) > epsilon && tao > 0 && tao < C_TAU_MAX){
            const clamp_tao = Math.exp(-tao * tao / C_TAO0);
            const c_tao = clamp_tao;  //Math.abs(tao - C_TAO0);
            const tao_sq = c_tao * c_tao;
            const grad_x_i = 2 * c_tao * ((dv_i / a) * ((-2. * v_x * tao) - (x0 + (v_y * x0 * y0 + v_x * (radius_sq - y0_sq)) / d)));
            const grad_y_i = 2 * c_tao * ((dv_i / a) * ((-2. * v_y * tao) - (y0 + (v_x * x0 * y0 + v_y * (radius_sq - x0_sq)) / d)));
            const grad_x_j = -grad_x_i;
            const grad_y_j = -grad_y_i;
            const stiff =C_LONG_RANGE_STIFF * Math.exp(-tao * tao / C_TAO0);    //changed
            const s =  stiff * tao_sq / (agent_i.invmass * (grad_y_i * grad_y_i + grad_x_i * grad_x_i) + agent_j.invmass  * (grad_y_j * grad_y_j + grad_x_j * grad_x_j));     //changed

            lengthV = Math.sqrt(s * agent_i.invmass * grad_x_i * s * agent_i.invmass * grad_x_i 
                             + s * agent_i.invmass * grad_y_i * s * agent_i.invmass * grad_y_i);
            //if (lengthV > MAX_DELTA) {
            //    console.log(lengthV);
            //}
            //delta_correction_i = {"x":s * agent_i.invmass * grad_x_i,
            //                      "y":s * agent_i.invmass * grad_y_i}            
            delta_correction_i = clamp2D(s * agent_i.invmass * grad_x_i,
                                        s * agent_i.invmass * grad_y_i,
                                        MAX_DELTA);          
            //delta_correction_j = {"x":s * agent_j.invmass * grad_x_j,
            //                      "y":s * agent_j.invmass * grad_y_j}
            delta_correction_j = clamp2D(s * agent_j.invmass * grad_x_j,
                                         s * agent_j.invmass * grad_y_j,
                                         MAX_DELTA);  
            agent_i.px += delta_correction_i.x; 
            agent_i.pz += delta_correction_i.y;
            agent_j.px += delta_correction_j.x;
            agent_j.pz += delta_correction_j.y;
      }
=======
function sdfConstraint(agent_i)
{
  var x = agent_i.x;
  var z = agent_i.z;



  var cell = getCell(x,z);
  var maxi = cell;

  if(cell == null)
    return 0;

  agentMiniSdfField(agent_i,cell);





  if( cell.asdf  - agent_i.radius < 0 )
  {
    if(getSDFNeighbourBottom(x,z).asdf>maxi.asdf){
        maxi = getSDFNeighbourBottom(x,z);
    }
    if(getSDFNeighbourTop(x,z).asdf>maxi.asdf){
        maxi = getSDFNeighbourTop(x,z);
    }
    if(getSDFNeighbourLeft(x,z).asdf>maxi.asdf){
        maxi = getSDFNeighbourLeft(x,z);
    }
    if(getSDFNeighbourRight(x,z).asdf>maxi.asdf){
        maxi = getSDFNeighbourRight(x,z);
    }

    x = maxi.x;
    z = maxi.z;

    agent_i.px = x;
    agent_i.pz = z;



    return 0;







      /*find neighbouring sdf cells 
      find one with the max sdf value 
      move there 
       .... do something */
  }else{
    return 0;
  }

}

function agentMiniSdfField(agent,cell){
    let adist,curDist,k1,k2;
    let offset = Math.floor(agent.radius/world.C_CELL_DIM+world.C_CELL_DIM/2)*2;

    let rangeStart = cell.xIndex - offset;
    let domainStart = cell.zIndex - offset;

    if(rangeStart < 0 || rangeStart+offset*2 >= world.x/world.C_CELL_DIM || domainStart < 0 || domainStart+offset*2 >= world.z/world.C_CELL_DIM)
        return 0;

    for(k1 = rangeStart;k1 < rangeStart+offset*2;k1++){
        for(k2 = domainStart;k2 < domainStart+offset*2;k2++)
        {
            adist = 9999999;

            let sdfX = sdfCellsMap[[k1,k2]].x;
            let sdfZ = sdfCellsMap[[k1,k2]].z;
            //TODO ADD AGENTS TO SDF CALCULATIONS
            sceneEntities.forEach(function (ag){
                if(ag != agent){
                    curDist = PHY.distance(sdfX,sdfZ, ag.x,ag.z)-ag.radius;
                    if(curDist<adist)
                        adist = curDist;
                }
            });

            sdfCellsMap[[k1,k2]].adist = adist;
            i+=1;
        }
    }


    for(k1= rangeStart;k1< rangeStart+offset*2;k1++){
        for(k2 = domainStart;k2 < domainStart+offset*2;k2++)
        {
            // actual distance field value
            sdfCellsMap[[k1,k2]].asdf = Math.min(sdfCellsMap[[k1,k2]].adist,sdfCellsMap[[k1,k2]].sdf);
        }
    }
}


function collisionConstraint(agent_i,agent_j)
{
const agentCentroidDist = distance(agent_i.px, agent_i.pz, 
            agent_j.px, agent_j.pz );
const agentDist = agentCentroidDist - AGENTSIZE;
const dir_x = (agent_j.px- agent_i.px)/agentCentroidDist; 
const dir_z = (agent_j.pz- agent_i.pz)/agentCentroidDist;
const agent_i_scaler = agent_i.invmass/(agent_i.invmass+agent_j.invmass) * agentDist
const agent_j_scaler = agent_j.invmass/(agent_i.invmass+agent_j.invmass) * agentDist 
if(agentDist < 0)
{
    agent_i.px += agent_i_scaler * dir_x
    agent_i.pz += agent_i_scaler * dir_z
    agent_j.px += - agent_j_scaler * dir_x
    agent_j.pz += - agent_j_scaler * dir_z
} 
}

function agentVelocityPlanner()  {
sceneEntities.forEach(function (agent_i) {
  const distToGoal = distance(agent_i.x, agent_i.z, 
                    agent_i.goal_x, agent_i.goal_z );
  if(distToGoal > RADIUS)
  {
    const dir_x = (agent_i.goal_x- agent_i.x)/distToGoal; 
    const dir_z = (agent_i.goal_z- agent_i.z)/distToGoal;
    agent_i.vx = agent_i.v_pref * dir_x;
    agent_i.vz = agent_i.v_pref * dir_z;
  }
  agent_i.vx = 0.9999*agent_i.vx;
  agent_i.vz = 0.9999*agent_i.vz;      
});
}

/*  -----------------------  */


agentVelocityPlanner();

sceneEntities.forEach(function (item) {
item.px = item.x + timestep*item.vx; 
item.pz = item.z + timestep*item.vz; 
item.py = item.y + timestep*item.vy;
});


let pbdIters = 0;
var agent_a, agent_b, desDistance, i,j, idx = 0;

while(pbdIters<ITERNUM)
{
  idx = 0;
  while(idx < world.distanceConstraints.length)
  {
      desDistance = world.distanceConstraints[idx].distance;
      agent_a = sceneEntities[world.distanceConstraints[idx].idx_a]
      agent_b = sceneEntities[world.distanceConstraints[idx].idx_b]         
      distanceConstraint(agent_a,agent_b, desDistance);
      idx+=1; 
  }  
  i=0;
  while(i<sceneEntities.length)
  {
     sdfConstraint(sceneEntities[i])
     i+=1
>>>>>>> Stashed changes
  }

  function sdfConstraint(agent_i)
  {
      /**
      sdfCellValue <-- get_sdf_dist(agent.x, agent.z)
      if(  agent_i.radius - sdfCellValue <0  ) 
      {
          find neighbouring sdf cells 
          find one with the max sdf value 
          move there 
           .... do something 
      }
     */




<<<<<<< Updated upstream
  }


  function collisionConstraint(agent_i,agent_j)
  {
    const agentCentroidDist = distance(agent_i.px, agent_i.pz, 
                agent_j.px, agent_j.pz );
    const agentDist = agentCentroidDist - AGENTSIZE;
    const dir_x = (agent_j.px- agent_i.px)/agentCentroidDist; 
    const dir_z = (agent_j.pz- agent_i.pz)/agentCentroidDist;
    const agent_i_scaler = agent_i.invmass/(agent_i.invmass+agent_j.invmass) * agentDist
    const agent_j_scaler = agent_j.invmass/(agent_i.invmass+agent_j.invmass) * agentDist 
    if(agentDist < 0)
    {
        agent_i.px += agent_i_scaler * dir_x
        agent_i.pz += agent_i_scaler * dir_z
        agent_j.px += - agent_j_scaler * dir_x
        agent_j.pz += - agent_j_scaler * dir_z
    } 
  }

  function agentVelocityPlanner()  {
    sceneEntities.forEach(function (agent_i) {
      const distToGoal = distance(agent_i.x, agent_i.z, 
                        agent_i.goal_x, agent_i.goal_z );
      if(distToGoal > RADIUS)
      {
        const dir_x = (agent_i.goal_x- agent_i.x)/distToGoal; 
        const dir_z = (agent_i.goal_z- agent_i.z)/distToGoal;
        agent_i.vx = agent_i.v_pref * dir_x;
        agent_i.vz = agent_i.v_pref * dir_z;
      }
      agent_i.vx = 0.9999*agent_i.vx;
      agent_i.vz = 0.9999*agent_i.vz;      
    });
  }

  /*  -----------------------  */


  agentVelocityPlanner();

  sceneEntities.forEach(function (item) {
    item.px = item.x + timestep*item.vx; 
    item.pz = item.z + timestep*item.vz; 
    item.py = item.y + timestep*item.vy;
  });


  let pbdIters = 0;
  var agent_a, agent_b, desDistance, i,j, idx = 0;

  while(pbdIters<ITERNUM)
  {
      idx = 0;
      while(idx < world.distanceConstraints.length)
      {
          desDistance = world.distanceConstraints[idx].distance;
          agent_a = sceneEntities[world.distanceConstraints[idx].idx_a]
          agent_b = sceneEntities[world.distanceConstraints[idx].idx_b]         
          distanceConstraint(agent_a,agent_b, desDistance);
          idx+=1; 
      }  
      i=0;
      while(i<sceneEntities.length)
      {
          j=i+1;
          while(j<sceneEntities.length)
          {
            //collisionConstraint(sceneEntities[i],sceneEntities[j])
            longRangeConstraint(sceneEntities[i],sceneEntities[j])
            j+=1;
          }
          i+=1
      }
    pbdIters+=1;
  }


  sceneEntities.forEach(function (item) {
    item.vx = (item.px-item.x)/timestep;
    item.vz = (item.pz-item.z)/timestep;
    item.vy = (item.py-item.y)/timestep;
    item.x = item.px; 
    item.z = item.pz; 
    item.y = item.py; 

    if(item.x < -world.x/2)
    {
      item.x = -world.x/2;
    }
    else if(item.x > world.x/2)
    {
      item.x = world.x/2; 
    }
    if(item.z < -world.z/2)
    {
      item.z = -world.z/2;
    }
    else if(item.z > world.z/2)
    {
      item.z= world.z/2; 
    }
  });

}
=======


}
>>>>>>> Stashed changes
