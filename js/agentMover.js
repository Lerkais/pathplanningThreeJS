import * as PTHER from './pathPlanner.js'
export function moveAgentOneCell(agent,nextPos,grid){ //Grid relative positions
    if(PTHER.isWalkable(endPos,grid)){
        agent.goal_x = nextPos.x;
        agent.goal_z = nextPos.z;
        return true;
    }
    else
        return false;
}

export function updateSdfCells(agentData,grid){
    grid.forEach(function (cell){
        cell.hasAgent = false;
    })

    agentData.forEach(function (ag){
        let cells = getCells(ag);
        cells.forEach(function (cell){
            cell.hasAgent = true;
        })
    });
}

export function getCells(agent,grid){
    const cells = new Set();
    const radius = agent.radius;

    const topRow = Math.floor(agent.z - radius);
    const bottomRow = Math.ceil(agent.z + radius) - 1; // subtract 1 to get the bottom-most row that the agent is touching
    const leftCol = Math.floor(agent.x - radius);
    const rightCol = Math.ceil(agent.x + radius) - 1; // subtract 1 to get the right-most column that the agent is touching

    for (let row = topRow; row <= bottomRow; row++) {
      for (let col = leftCol; col <= rightCol; col++) {
        const cell = grid[[col+world.x/2,row+world.z/2]];
        const dx = agent.x - cell.x;
        const dz = agent.z - cell.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance <= radius) {
          cells.add(cell);
        }
      }
    }

    return cells;
  }

  export function updateCurrentCell(agent,grid,world){
        let x = Math.floor(agent.x + world.x/2);
        let z = Math.floor(agent.z + world.z/2);
        
        agent.gridX = x;
        agent.gridZ = z;
  }
