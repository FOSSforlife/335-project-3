//var canvas= document.querySelector('knightsFLow');
let source = [1, 2];
let sink = [8, 7];
let gridBoundaries = [1, 10];

let stack = [];
let maxPossibleFlow, lastDistances = [], referenceFlow, visitedPoints = [], destinationReached;

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

// use this one for {x: int, y: int} objects
function containsPoint (current, stack) {
  for (let i = 0; i < stack.length; i++) {
    if (current === stack[i]) {
      return true;
    }
  }
  return false;
}

// use this one for [x, y] arrays
function containsPointNonFormatted(arrayOfPoints, point) {
  return arrayOfPoints.findIndex(p => { return (p[0] == point[0] && p[1] == point[1]); }) > -1;
}

function formatPoint(point) {
  return {
    x: point[0],
    y: point[1]
  };
}

function coordInBounds(coord) {
  return (
    coord >= gridBoundaries[0] - 1 &&
    coord <= gridBoundaries[1] - 1 
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

function findNextPossibleMoves(start, grid, maxPossibleFlow = 1000) {
  let possibleMoves = [];
  for(let xSign = -1; xSign <= 1; xSign = xSign + 2) {
    for(let ySign = -1; ySign <= 1; ySign = ySign + 2) {
      for(let horizontal = 0; horizontal <= 1; horizontal++) {
        let newMove, edgeCapacity;
        if(horizontal) {
          newMove = [start[0] + (2*xSign), start[1] + (1*ySign)];
          //draw_knight_path(newMove);
        }
        else {
          newMove = [start[0] + (1*xSign), start[1] + (2*ySign)];
          //draw_knight_path(newMove);
        }

        if(!inBounds(newMove)) { // out of grid bounds
          break;
        }
        // console.log(`newMove = ${newMove}`);
        edgeCapacity = (grid[newMove[0]][newMove[1]] + grid[start[0]][start[1]]) / 2;
        if(!referenceFlow || edgeCapacity >= referenceFlow) {
          // console.log(`${edgeCapacity} >= ${referenceFlow}`);
          possibleMoves.push({
            coords: newMove,
            edgeCapacity: Math.min(edgeCapacity, maxPossibleFlow)
          });
        }
      }
    }  
  }
  // console.log(possibleMoves);
  return possibleMoves
    .sort((a, b) => a.edgeCapacity < b.edgeCapacity)
    .map(a => a.coords);
}

// this assumes distances are sorted from least recent to most recent
// e.g. [3, 5, 7] would be moving away (and would return true)
function isMovingAway(lastDistances) {
  return (lastDistances.length == 3
      && lastDistances[2] > lastDistances[1] 
      &&  lastDistances[1] > lastDistances[0]);
}

function flow(stack, grid) {
  return stack.reduce((acc, point, idx) => {
    let edgeCapacity = (grid[point['x']][point['y']] + grid[stack[idx-1]['x']][stack[idx-1]['y']]) / 2;
     console.log(`(${stack[idx-1]['x']}, ${stack[idx-1]['y']}) = ${grid[stack[idx-1]['x']][stack[idx-1]['y']]}`);
    console.log(`(${point['x']}, ${point['y']}) = ${grid[point['x']][point['y']]}`);
    console.log(`edgeCapacity = ${edgeCapacity}`); 

    if(idx == 1) {
      return edgeCapacity;
    }
    else {
      return Math.min(acc, edgeCapacity);
    }
  });
}

// TODO: copy/paste grid code from project 1; draw source, sink, and knight path on it

// ALGORITHM PART 1
function findMaxPossibleFlow(source, sink, grid) {
  let sourceEdges = findNextPossibleMoves(source, grid);
  let sourceMaxEdge = sourceEdges[0];
  let sourceMaxEdgeCapacity = (grid[source[0]][source[1]] + grid[sourceMaxEdge[0]][sourceMaxEdge[1]]) / 2;

  let sinkEdges = findNextPossibleMoves(sink, grid);
  let sinkMaxEdge = sinkEdges[0];
  let sinkMaxEdgeCapacity = (grid[sink[0]][sink[1]] + grid[sinkMaxEdge[0]][sinkMaxEdge[1]]) / 2;

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



// ALGORITHM PART 3
function findBestPath(point, destination, grid, newStack) {
  newStack.push(formatPoint(point));
  visitedPoints.push(point);
  // console.log(`(${point[0]}, ${point[1]}) = ${grid[point[0]][point[1]]}`);
  if(point[0] == destination[0] && point[1] == destination[1]) {
    destinationReached = true;
    return newStack;
  }

  // check if knight is moving away
  lastDistances.push(manhattanDistance(point, destination));
  if(lastDistances.length > 3) {
    lastDistances.shift();
  }
  if(isMovingAway(lastDistances)) {
    newStack.pop();
  }
  else { // DFS
    let nextMoves = findNextPossibleMoves(point, grid, maxPossibleFlow)
      .filter(p => {
        return !containsPointNonFormatted(visitedPoints, p); // only include non-visited points
      });
    
    for(let i = 0; i < nextMoves.length && !destinationReached; i++) {
      if(!containsPointNonFormatted(visitedPoints, nextMoves[i])) {
        newStack = findBestPath(nextMoves[i], destination, grid, newStack);
      }
    }
    if(!destinationReached) {
      console.log("Path not found");
      newStack.pop();
    }
  }
  //draw_knight_path(newStack);
  return newStack;
}

let resultsText = '';
grid = createGrid();
maxPossibleFlow = findMaxPossibleFlow(source, sink, grid);
console.log(`MAX POSSIBLE FLOW: ${maxPossibleFlow}`);

console.log("FIRST PATH:");
let firstPathTime = window.performance.now();
findQuickPath(source, sink);
firstPathTime = window.performance.now() - firstPathTime;

referenceFlow = flow(stack, grid);

let bestPathTime = window.performance.now();
let bestPath = findBestPath(source, sink, grid, []);
bestPathTime = window.performance.now() - bestPathTime;

console.log("\nBEST PATH:");
//console.log(Object.values(bestPath[0]));
var nresult = [];
//function convertArr(){ 
  for(let j = 0; j < bestPath.length; j++)
  {
      nresult[j] = Object.values(bestPath[j]);
      //console.log(nresult[j]);
  }
//      return nresult;
//}
//console.log(`Flow of first path = ${flow(stack, grid)}`);
//alert(flow(bestPath, grid));
var bestFlow = flow(bestPath, grid);
document.getElementById('maxFlow').appendChild(document.createTextNode(maxPossibleFlow));
document.getElementById('firstFlow').appendChild(document.createTextNode(referenceFlow));
document.getElementById('bestFlow').appendChild(document.createTextNode(bestFlow));
// document.getElementById('firstFlowTime').appendChild(document.createTextNode('(' + firstPathTime + ' ms)'));
// document.getElementById('bestFlowTime').appendChild(document.createTextNode('(' + bestPathTime + ' ms)'));
