let source = [1, 2];
let sink = [8, 7];
let gridBoundaries = [1, 10];

let stack = [];
let maxPossibleFlow, lastDistances, referenceFlow;

// create 2d grid where each cell contains its capacity (a random even number)
function createGrid() {
  let gridRows = new Array(10);
  gridRows.fill(new Array(10).fill(0));
  gridRows = gridRows.map(row => {
    row = row.map(() => {
      return Math.floor(Math.random()*15)*2; // random even number
    })
    return row;
  });
  return gridRows;
}

function containsPoint (current, stack) {
  for (let i = 0; i < stack.length; i++) {
    if (current === stack[i]) {
      return true;
    }
  }
  return false;
}

function formatPoint(point) {
  return {
    x: point[0],
    y: point[1]
  };
}

function coordInBounds(coord) {
  return (
    coord >= gridBoundaries[0] &&
    coord <= gridBoundaries[1]
  );
}

function inBounds(point) {
  return (
    coordInBounds(point[0]) &&
    coordInBounds(point[1])
  );
}

// return a knight move in any direction from the start variable
// xSign is left or right, ySign is up or down
// horizontal = move 2 horizontal, 1 vertical
//    else, move 2 vertical, 1 horizontal
function getMove(start, xSign, ySign, horizontal) {
  let newMove;
  if(horizontal) {
    newMove = [start[0] + (2*xSign), start[1] + (1*ySign)];
    if(!coordInBounds(newMove[0])) {
      newMove[0] += (-4*xSign);
    }
    if(!coordInBounds(newMove[1])) {
      newMove[1] += (-2*xSign);
    }
  }
  else {
    newMove = [start[0] + (1*xSign), start[1] + (2*ySign)];
    if(!coordInBounds(newMove[0])) {
      newMove[0] += (-2*xSign);
    }
    if(!coordInBounds(newMove[1])) {
      newMove[1] += (-4*xSign);
    }
  }
  return newMove;
}

function findMoveCloserToSink(knightCoords, sinkCoords) {
  let xDist = sinkCoords[0] - knightCoords[0];
  let yDist = sinkCoords[1] - knightCoords[1];
  let xDistAbs = Math.abs(xDist);
  let yDistAbs = Math.abs(yDist);
  let xSign = xDistAbs / xDist || 1;
  let ySign = yDistAbs / yDist || 1;

  if(xDistAbs + yDistAbs > 3) {
    // move towards destination, leaning either horiz or vert
    return getMove(knightCoords, xSign, ySign, xDistAbs > yDistAbs);
  }
  else if(xDistAbs == 3 && yDistAbs == 0
       || xDistAbs == 1 && yDistAbs == 0
       || xDistAbs == 0 && yDistAbs == 2) {
    // move towards destination, leaning horiz
    return getMove(knightCoords, xSign, ySign, 1);
  }
  else if(xDistAbs == 0 && yDistAbs == 3
       || xDistAbs == 0 && yDistAbs == 1
       || xDistAbs == 2 && yDistAbs == 0) {
    // move towards destination, leaning vert
    return getMove(knightCoords, xSign, ySign, 0);
  }
  else if(xDistAbs == 2 && yDistAbs == 1
       || xDistAbs == 1 && yDistAbs == 2) {
    // success
    return Array.from(sinkCoords);
  }
  else if(xDistAbs == 1 && yDistAbs == 1) {
    // special case: move away vertically, towards horizontally
    return getMove(knightCoords, xSign, -1*ySign, 1);
  }
  
}

function findNextPossibleMoves(knightCoords, grid, maxPossibleFlow = 1000) {
  let possibleMoves = [];
  for(let xSign = -1; xSign <= 1; xSign *= -1) {
    for(let ySign = -1; ySign <= 1; ySign *= -1) {
      for(let horizontal = 0; horizontal <= 1; horizontal++) {
        let newMove, edgeCapacity;
        if(horizontal) {
          newMove = [start[0] + (2*xSign), start[1] + (1*ySign)];
        }
        else {
          newMove = [start[0] + (1*xSign), start[1] + (2*ySign)];
        }

        edgeCapacity = (grid[newMove[0], newMove[1]] + grid[knightCoords[0], knightCoords[1]]) / 2;
        if(inBounds(newMove) || edgeCapacity >= referenceFlow) {
          possibleMoves.push({
            coords: newMove,
            edgeCapacity: Math.min(edgeCapacity, maxPossibleFlow)
          });
        }
      }
    }  
  }
  return possibleMoves
    .sort((a, b) => a.edgeCapacity > b.edgeCapacity)
    .map(a => a.coords);
}

// this assumes distances are sorted from least recent to most recent
// e.g. [3, 5, 7] would be moving away (and would return true)
function isMovingAway(lastDistances) {
  return (lastDistances[2] > lastDistances[1] 
      &&  lastDistances[1] > lastDistances[0]);
}

function flow(stack, grid) {
  return stack.reduce((acc, point, idx) => {
    if(idx == 1) {
      return 1000;
    }
    else {
      let edgeCapacity = (grid[point['x']][point['y']] + grid[stack[idx-1]['x']][stack[idx-1]['y']]) / 2;
      return Math.min(acc, edgeCapacity);
    }
  });
}

// TODO: copy/paste grid code from project 1; draw source, sink, and knight path on it

// ALGORITHM PART 1
function findMaxPossibleFlow(grid) {
  let sourceEdges = findNextPossibleMoves(source, grid);
  let sourceMaxEdge = sourceEdges[0];
  let sourceMaxEdgeCapacity = (grid[source[0], source[1]] + grid[sourceMaxEdge[0], sourceMaxEdge[1]]) / 2;

  let sinkEdges = findNextPossibleMoves(sink, grid);
  let sinkMaxEdge = sinkEdges[0];
  let sinkMaxEdgeCapacity = (grid[sink[0], sink[1]] + grid[sinkMaxEdge[0], sinkMaxEdge[1]]) / 2;

  return Math.max(sourceMaxEdgeCapacity, sinkMaxEdgeCapacity);
}

// ALGORITHM PART 2
function findQuickPath(point, destination) {
  var found = false;
  let currentPoint = point;

  stack.push(formatPoint(currentPoint));

  while (found === false) {
    console.log(formatPoint(currentPoint));
    if (found === true) {
      console.log(formatPoint(currentPoint));
      break;
    }
    
    currentPoint = findMoveCloserToSink(currentPoint, destination);
    if (containsPoint(formatPoint(currentPoint), stack) === false) {
      stack.push(formatPoint(currentPoint));
    }
    if(currentPoint[0] === destination[0]
    && currentPoint[1] === destination[1]) {
      console.log(formatPoint(currentPoint));
      found = true;
      break;
    }
  }
};

function manhattanDistance(point1, point2) {
  return (Math.abs(point2[0] - point1[0]) + Math.abs(point2[1] - point1[1]));
}

// TODO: ALGORITHM PART 3
// use the existing findNextPossibleMoves() and isMovingAway() functions
// the only hard part is figuring out DFS traversal
function findBestPath(point, destination, lastDistances) {
  // check if knight is moving away
  lastDistances.push(manhattanDistance(point, destination));
  if(lastDistances.length > 3) {
    lastDistances.shift();
  }
  if(isMovingAway(lastDistances)) {
    return;
  }


}

grid = createGrid();
findQuickPath(source, sink);
console.log(flow(stack, grid));
for (let i = 0; i < stack.length; i++) {
  // console.log(stack[i]);
}

// ********************************ALGORITHM 3************************************************
// function findBestPath (point, destination) {
//   let currentPoint = isMovingAway(point)
//   let setPoints = findNextPossibleMoves(currentPoint, grid, maxPossibleFlow = 1000)
//   var visited = []
//   for (var i = 0; i < this.noOfVertices; i++) { visited[i] = false }

//   this.DFSUtil(setPoints, visited)
// }
// function DFSUtil (vert, visited) {
//   visited[vert] = true
//   console.log(vert)

//   var getNeighbours = this.AdjList.get(vert)

//   for (var i in getNeighbours) {
//     var getElem = getNeighbours[i]
//     if (!visited[getElem]) { this.DFSUtil(getElem, visited) }
//   }
// }

// // ***********************DFS #1***********************************************
// function DFS (node) {
//   // Create a Stack and add our initial node in it
//   let s = new Stack(this.nodes.length)
//   let explored = new Set()
//   s.push(node)
//   // Mark the first node as explored
//   explored.add(node)
//   // We'll continue till our Stack gets empty
//   while (!s.isEmpty()) {
//     let t = s.pop()
//     // Log every element that comes out of the Stack
//     console.log(t)
//     // 1. In the edges object, we search for nodes this node is directly connected to.
//     // 2. We filter out the nodes that have already been explored.
//     // 3. Then we mark each unexplored node as explored and push it to the Stack.
//     this.edges[t]
//       .filter(n => !explored.has(n))
//       .forEach(n => {
//         explored.add(n)
//         s.push(n)
//       })
//   }
// }

// let g = new Graph()
// g.addNode('A')
// g.addNode('B')
// g.addNode('C')
// g.addNode('D')
// g.addNode('E')
// g.addNode('F')
// g.addNode('G')

// g.addEdge('A', 'C')
// g.addEdge('A', 'B')
// g.addEdge('A', 'D')
// g.addEdge('D', 'E')
// g.addEdge('E', 'F')
// g.addEdge('B', 'G')

// g.DFS('A')

// // ********************************DFS #2**********************************************
// function dfs (startingNode) {
//   var visited = []
//   for (var i = 0; i < this.noOfVertices; i++) { visited[i] = false }

//   this.DFSUtil(startingNode, visited)
// }

// // Recursive function which process and explore
// // all the adjacent vertex of the vertex with which it is called
// function DFSUtil (vert, visited) {
//   visited[vert] = true
//   console.log(vert)

//   var getNeighbours = this.AdjList.get(vert)

//   for (var i in getNeighbours) {
//     var getElem = getNeighbours[i]
//     if (!visited[getElem]) { this.DFSUtil(getElem, visited) }
//   }
// }
