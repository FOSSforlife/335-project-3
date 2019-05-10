
var canvas= document.querySelector('canvas');
//make canvas fill the entire window (though our grid does not necessarily have to)
canvas.width= 600;
canvas.height= 600;

//get drawing methods for the canvas
var c= canvas.getContext('2d');

//set cell size for our grid
var square_size= 60;

//these two function draw the grid, could be done in one with two for-loops but I thought it was clearer this way 
function draw_grid_corners(coord){
for (var i=0; i<square_size*10; i+=square_size){
	c.rect(coord,i, square_size, square_size);
	c.rect(i, coord, square_size, square_size)
	c.stroke();
}
}

function draw_grid(){
for (var i=0; i<square_size*10; i+=square_size){
	draw_grid_corners(i);
}

}


//to feed into the draw line and draw circle function. Translates the basic grid coordinate into the dimensions of the grid
//so if you wanted to see what cell (0, 1) was in terms of the grid you would do get_point(0) get_point(1)
function get_point(cell){
	return (square_size/2)+(square_size*cell);
}


//these can be used to mark the position of the knight in each step once we have our path
function draw_circle(x, y){
	c.beginPath();
	c.arc(x, y, 5, 0, Math.PI* 2, false);
	c.stroke();

}

//draw circles at a specific cell in the grid, for instance (0,0) or (2,4)
function draw_circle_at_coordinate(x,y){
	x_coord= get_point(x);
	y_coord= get_point(y);
	draw_circle(x_coord, y_coord);

}





/*
//create 2d array of the flow capacity ***this function is already in the main file***
function createGrid() {
  let gridRows = new Array(10);
  gridRows.fill(new Array(10).fill(0));
  gridRows = gridRows.map(row => {
    row = row.map(() => {
      return Math.floor(Math.random()*16)*2; // random even number
    })
    return row;
  });
  return gridRows;
}
*/



//draws randomized flow values on the canvas, saved in the 2d array created by createGrid. (change font/textsize if desired here)
function draw_flow_capacity(flow_values){
	for (var i=0; i<10; i++){
		x_coordinate= i * square_size+ square_size/3;
		for (var j=0; j<10; j++){
		 	c.font= "10px Arial";
		 	c.fillText(flow_values[i][j], x_coordinate, j*square_size+ square_size/5);
		 	console.log("This is x" + x_coordinate);
		 	
		 }

	}
}


//this is going to help draw our path, connecting the circles
function draw_line(x_start, y_start, x_end, y_end){
	c.beginPath();
	c.moveTo(get_point(x_start), get_point(y_start));
	c.lineTo(get_point(x_end), get_point(y_end));
	c.stroke();
}


//Given an array filled with subarrays, where each subarray is a cell, draw the path.
function draw_knight_path(path_array){
	for (var i=0; i<path_array.length-1; i++){
		var start_cell= path_array[i];
		var end_cell= path_array[i+1];
		c.strokeStyle= 'grey';
		c.lineWidth=1;
		draw_circle_at_coordinate(start_cell[0], start_cell[1]);
		draw_line(start_cell[0],start_cell[1], end_cell[0], end_cell[1]);
	}

	}

//-------Drawing------	

//*******make sure this is the same values that the algorithm is using and not creating another instance **********
//var flow_values= createGrid();

draw_grid();
draw_flow_capacity(grid);

//marks source point at 1,2 (indexed from zero)
c.strokeStyle= 'blue';
c.lineWidth=5;
draw_circle_at_coordinate(1,2)


//marks sink at 8,7 
c.strokeStyle= 'red';
draw_circle_at_coordinate(8,7);



//just testing the path.  
//var test_path= [[1,2], [2,4], [3,6], [4,5]];
//let stack = [];
//grid = createGrid();
//let source = [1, 2];
//let sink = [8, 7];
//var test_path= findBestPath(source, sink, grid, []);

//checkCall2();
draw_knight_path(nresult);
// alert(bestFlow);
/*
function checkCall()
{
	alert(nresult);
}
*/
