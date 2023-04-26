function gridedPathToGoal(startPos,goalPos,grid){ //x and z values should be grid relative not world relative
    const path = aStar(startPos,goalPos,grid);
    
    return path; //Returns list of pos(s) that each of a .x and .z value
}

function isWalkable(pos,grid){
    return (grid[[pos.x,pos.z]].sdf > 0) && (isValidPos(pos,grid)) && (!grid[[pos.x,pos.z]].hasAgent);
}

function isValidPos(pos,grid){
    return grid[[pos.x,pos.z]] != null;
}

function manhattanDistance(pos1,pos2){
    const dx = Math.abs(pos1.x - pos2.x);
    const dz = Math.abs(pos1.z - pos2.z);
    return dx + dz;
}

function getNeighbors(pos,grid){
    const neighbors = [];
    for(const [dx,dz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const neighborPos = {x: pos.x + dx, z: pos.z + dz}
        if(isValidPos(neighborPos, grid) && isWalkable(neighborPos, grid)) {
            neighbors.push(neighborPos);
        }
    }
    return neighbors;
}

function hash(pos) {
    return pos.x + "," + pos.z;
} 

class PriorityQueue {
    constructor() {
      this.heap = [];
    }
  
    enqueue(item, priority) {
      this.heap.push({ item, priority });
      this.bubbleUp(this.heap.length - 1);
    }
  
    dequeue() {
      const item = this.heap[0].item;
      const last = this.heap.pop();
      if (this.heap.length > 0) {
        this.heap[0] = last;
        this.bubbleDown(0);
      }
      return item;
    }
  
    isEmpty() {
      return this.heap.length === 0;
    }
  
    contains(item) {
      return this.heap.some((element) => element.item === item);
    }
  
    bubbleUp(index) {
      const element = this.heap[index];
      while (index > 0) {
        const parentIndex = Math.floor((index - 1) / 2);
        const parent = this.heap[parentIndex];
        if (element.priority >= parent.priority) {
          break;
        }
        this.heap[index] = parent;
        index = parentIndex;
      }
      this.heap[index] = element;
    }
  
    bubbleDown(index) {
      const element = this.heap[index];
      const length = this.heap.length;
      while (true) {
        const leftChildIndex = 2 * index + 1;
        const rightChildIndex = 2 * index + 2;
        let leftChild, rightChild;
        let swap = null;
  
        if (leftChildIndex < length) {
          leftChild = this.heap[leftChildIndex];
          if (leftChild.priority < element.priority) {
            swap = leftChildIndex;
          }
        }
  
        if (rightChildIndex < length) {
          rightChild = this.heap[rightChildIndex];
          if (rightChild.priority < (swap === null ? element.priority : leftChild.priority)) {
            swap = rightChildIndex;
          }
        }
  
        if (swap === null) {
          break;
        }
  
        this.heap[index] = this.heap[swap];
        index = swap;
      }
  
      this.heap[index] = element;
    }
  }
  
function equals(pos1,pos2){
    return pos1.z == pos2.z && pos1.x == pos2.x
}


function aStar(start, end, grid) {
    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
  
    gScore.set(hash(start), 0);
    fScore.set(hash(start), manhattanDistance(start, end));
  
    openSet.enqueue(start, fScore.get(hash(start)));
  
    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();
  
      if (equals(current, end)) {
        return reconstructPath(current, cameFrom);
      }
  
      for (const neighbor of getNeighbors(current, grid)) {
        const tentativeGScore = gScore.get(hash(current)) + 1;
  
        if (!gScore.has(hash(neighbor)) || tentativeGScore < gScore.get(hash(neighbor))) {
          cameFrom.set(hash(neighbor), current);
          gScore.set(hash(neighbor), tentativeGScore);
          fScore.set(hash(neighbor), tentativeGScore + manhattanDistance(neighbor, end));
  
          if (!openSet.contains(neighbor)) {
            openSet.enqueue(neighbor, fScore.get(hash(neighbor)));
          }
        }
      }
    }
  
    // If we get here, there is no path from start to end
    return null;
  }

function reconstructPath(current, cameFrom) {
    // Reconstruct the path from the start position to the current position
    const path = [current];
    while (cameFrom.has(hash(current))) {
      current = cameFrom.get(hash(current));
      path.unshift(current);
    }
    return path;
  }
  

let pos1,pos2;
const start = { x: 0, z: 0 };
const end = { x: 0, z: 9 };

let testSdfMap = {};

for(let i = 0; i < 10; i++){
    for(let j = 0; j < 10; j++){
        let sdfCell = {"x":i,"z":j,"hasAgent":false};
        testSdfMap[[i,j]] = sdfCell;
        testSdfMap[[i,j]].sdf = (Math.random()-.1)*10;
        
    }
}
console.log(testSdfMap);

path = gridedPathToGoal(start,end,testSdfMap);

path.forEach(function (item){
    console.log(item);
});


