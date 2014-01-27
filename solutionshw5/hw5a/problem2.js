/* Harvard CS171/CSCI E-64 Spring 2013     
 * Solution for HW5 Problem 2 
 * By Andres Arslanian 
 */

/*HTML Variables*/
var graphCanvas = document.getElementById('graphCanvas');
var graphContext = graphCanvas.getContext('2d');
var displayCanvas = document.getElementById('displayCanvas');
var displayContext = displayCanvas.getContext('2d');
var data1_CSV = document.getElementById('csv').value;
var data2_JSON = document.getElementById('JSON').value;
var cb_hover = document.getElementById('cb_hover');
var cb_zoom = document.getElementById('cb_zoom');
var cb_complete_scale = document.getElementById('cb_complete_scale');
var cb_ars = document.getElementById('cb_ars');
var cb_brl = document.getElementById('cb_brl');

/*Graph properties*/			
var graph = []
graph.ars_color = "#4DAFFA";
graph.brl_color = "#008837";
graph.x_margin = 0.05;
graph.y_margin = 0.07;
graph.max_x = x_max()-x_origin();
graph.max_y = 100;
graph.min_y = 0;
graph.scale_max = 1.05;
graph.scale_min = 0.8;
graph.resolutionAbsolute = false;
graph.end_date = new Date ("12-31-2012");
graph.start_date = new Date ("10-02-2006");
graph.x_max_zoom = new Date ("12-31-2012");;
graph.x_min_zoom = new Date ("10-02-2006");			
graph.zoom_level = 1;
graph.zoom_x_length = (x_max()-x_origin())*0.8;
graph.zoom_y_length = Math.abs(y_max()-y_origin())*0.8; 


/*Transformation functions for simplifying the coding*/			
//Transform from graphCanvas system of coordinates to common: origin in bottom-left
function x_coord(x){
	if (x > x_max())
		return x_max();
	else
		return x_origin()+x;
}

//Transform from graphCanvas system of coordinates to common: origin in bottom-left
function y_coord(y){
	if (y_origin()-y < y_max())
		return y_max();
	else
		return y_origin()-y;
}

function y_origin(){
	return graphContext.canvas.height-graphContext.canvas.height*graph.y_margin;
}
function y_max(){
	return graphContext.canvas.height*graph.y_margin;
}

function x_origin(){
	return graphContext.canvas.width*graph.x_margin;
}

function x_max(){
	return graphContext.canvas.width-graphContext.canvas.width*graph.x_margin;
}

/*Draw the graph area*/
function draw_graph_grid(c){
	var pixel = 0.5;
	var h = c.canvas.height;
	var w = c.canvas.width;

	//vertical lines
	c.moveTo(pixel,0);
	c.lineTo(pixel,h);

	c.moveTo(w-pixel,0);
	c.lineTo(w-pixel,h);
	
	//horizontal lines
	c.moveTo(0,pixel);
	c.lineTo(w,pixel);

	c.moveTo(0,h-pixel);
	c.lineTo(w,h-pixel);

	//draw it!
	c.strokeStyle = "#eee";
	c.stroke();

	//axis
	c.beginPath();

	c.moveTo(x_coord(0), y_coord(0)); 
	c.lineTo(x_coord(0), y_coord(h));

	c.moveTo(x_coord(w), y_coord(0)); 
	c.lineTo(x_coord(w), y_coord(h));

	c.moveTo(x_coord(0), y_coord(0));
	c.lineTo(x_coord(w), y_coord(0));

	c.moveTo(x_coord(0), y_coord(h));
	c.lineTo(x_coord(w), y_coord(h));

	//draw it!
	c.strokeStyle = "#000";
	c.stroke();
}


/* Draw the graph depending of the checkboxes selected*/
function draw_graph(c){

	//Get the start and end date
	if (cb_zoom.checked && graph.zoom_level != 1){
		ds = new Date(graph.start_date);
		de = new Date(graph.start_date);
		ds.setDate(ds.getDate() + (graph.x_min_zoom-x_origin())/graph.x_resolution);
		de.setDate(de.getDate() + (graph.x_max_zoom-x_origin())/graph.x_resolution);

		graph.start_date = ds;
		graph.end_date = de;

	} else {
		graph.end_date = new Date ("12-31-2012");
		graph.start_date = new Date ("10-02-2006");					
	}

	//Get the information of the CSV or JSON if needed.
	if (graph.ars)
		var csv_info = getCSVInfo();
	if (graph.brl)
		var json_info = getJSONInfo();
	max_x_length = x_max()-x_origin();

	graph.oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	diffDays = Math.floor(Math.abs((graph.start_date - graph.end_date)/(graph.oneDay)));

	graph.points_length = diffDays;

	//Get the graph limits
	if (graph.brl && graph.ars){
		graph.y_max = (csv_info.y_max > json_info.y_max)? csv_info.y_max : json_info.y_max ;
		graph.y_min = (csv_info.y_min < json_info.y_min)? csv_info.y_min : json_info.y_min ;						
	}
	else if (graph.brl){
		graph.y_max = json_info.y_max;
		graph.y_min = json_info.y_min;
	}
	else if (graph.ars){
		graph.y_max = csv_info.y_max;
		graph.y_min = csv_info.y_min;
	}

	//The name of the axis
	if (graph.ars || graph.brl){
		if (cb_zoom.checked && graph.zoom_level != 1){
			graph.y_max = graph.y_max_zoom;
			graph.y_min = graph.y_min_zoom;
		}					
		graph.x_resolution = max_x_length/graph.points_length;
		if (graph.ars){
			graph.x_title = csv_info.x_title;
			graph.y_title = csv_info.y_title;
			graph.x_unit  = csv_info.x_unit;
			graph.y_unit  = csv_info.y_unit;
		} else{
			graph.x_title = json_info.x_title;
			graph.y_title = json_info.y_title;
			graph.x_unit  = json_info.x_unit;
			graph.y_unit  = json_info.y_unit;				
		}					
	}
		

	//Check if absolute or relative view
	graph.y_resolution = 0;
	if (graph.resolutionAbsolute){
		graph.y_resolution = Math.abs(y_max()-y_origin())/(graph.y_max*graph.scale_max);
	}
	else{
		if (cb_zoom.checked)
			graph.y_resolution = Math.abs((y_max()-y_origin())/(graph.y_max-graph.y_min));
		else
			graph.y_resolution = Math.abs(y_max()-y_origin())/(graph.y_max*graph.scale_max-graph.scale_min*graph.y_min);
	}

	//Draw the axis
	plot_axis(c);
	
	//Plot the corresponding curve
	if(graph.ars){
		graph.ars_points = csv_info.points;
		plot_graph(graphContext, graph.ars_points, 1);
	}
	if(graph.brl){
		graph.brl_points = json_info.points;
		plot_graph(graphContext, graph.brl_points, 2);
	}
}


/*Get all the information of a CSV*/
function getCSVInfo(){
	csv_data = [];
	csv_elements = data1_CSV.split("\n");
	csv_data.x_title = csv_elements[1].split(",")[0];
	csv_data.y_title = csv_elements[1].split(",")[1];
	csv_data.x_unit = csv_elements[2].split(",")[0];
	csv_data.y_unit = csv_elements[2].split(",")[1];				
	points = csv_elements.slice(3,1+csv_elements.length-3);
	csv_data.points_length = points.length;

	temp = new Array();

	var y_max_val = 0;
	var y_min_val = 100.0;
	var i = 0;

	for(point in points){

		d = new Date(points[point].split(",")[0]);

		if ( cb_zoom.checked && (d < graph.start_date|| d> graph.end_date))
			continue;
		if (y_max_val < parseFloat(points[point].split(",")[1]))
			y_max_val = parseFloat(points[point].split(",")[1]);
		if (y_min_val > parseFloat(points[point].split(",")[1]))
			y_min_val = parseFloat(points[point].split(",")[1]);
		temp[i++] = points[point].split(",");
	}


	csv_data.points = temp;
	if (cb_zoom.checked){
		if (graph.y_max_zoom){
			csv_data.y_max = graph.y_max_zoom;
			csv_data.y_min = graph.y_min_zoom;					
		} else {
		csv_data.y_max = y_max_val;
		csv_data.y_min = y_min_val;					

		}
		csv_data.y_max = y_max_val;
		csv_data.y_min = y_min_val;						

	}else {
		csv_data.y_max = y_max_val;
		csv_data.y_min = y_min_val;					
	}


	return csv_data;
}

/*Get all the information of a JSON*/
function getJSONInfo(){
	json_data = [];
	json_elements = JSON.parse(data2_JSON);
	json_data.x_title = json_elements.x.title;
	json_data.y_title = json_elements.y.title;
	json_data.x_unit = json_elements.x.units;
	json_data.y_unit = json_elements.y.units;					
	points = json_elements.points.slice(3,1+json_elements.points.length);
	json_data.points_length = points.length;

	temp = new Array();

	var y_max_val = 0;
	var y_min_val = 100.0;
	var i = 0;

	for(point in points){
		d = new Date(points[point][0]);
		if ( cb_zoom.checked && (d < graph.start_date|| d> graph.end_date))
			continue;					
		if (y_max_val < parseFloat(points[point][1]))
			y_max_val = parseFloat(points[point][1]);
		if (y_min_val > parseFloat(points[point][1]))
			y_min_val = parseFloat(points[point][1]);
		temp[i++] = points[point];					
	}


	json_data.points = temp;
	if (cb_zoom.checked){
		if (graph.y_max_zoom){
			json_data.y_max = graph.y_max_zoom;
			json_data.y_min = graph.y_min_zoom;					
		} else {
		json_data.y_max = y_max_val;
		json_data.y_min = y_min_val;					

		}
		json_data.y_max = y_max_val;
		json_data.y_min = y_min_val;						

	}else {
		json_data.y_max = y_max_val;
		json_data.y_min = y_min_val;					
	}

	return json_data;				
}


//Draw the axis
function plot_axis(c){
	//y-axis
	c.beginPath();
	resolution = 0.3;
	c.moveTo(x_origin()-2,y_coord(0*graph.y_resolution));
	c.textAlign = "right";
	c.textBaseline = "middle";
	for (i = 0; i*graph.y_resolution < Math.abs(graph.y_max-y_origin()); i += resolution){
		c.lineTo(x_origin()+2,y_coord(i*graph.y_resolution));
		if (graph.resolutionAbsolute)
			y_min = i;
		else
			if (cb_zoom.checked)
				y_min = i + graph.y_min;
			else
				y_min = i + graph.y_min*graph.scale_min;
		c.fillText(y_min.toFixed(2), x_origin()-4, y_coord(i*graph.y_resolution));
		c.moveTo(x_origin()-2,y_coord((i+resolution)*graph.y_resolution));
	}

	//x-axis
	days_resolution = 250;
	c.moveTo(x_coord(0*graph.x_resolution),y_origin()-2);
	c.textAlign = "center";
	c.textBaseline = "top";

	for (i = 0; i*graph.x_resolution < graph.max_x; i += days_resolution){
		c.lineTo(x_coord(i*graph.x_resolution),y_origin()+2);
		d = new Date(graph.start_date);
		d.setDate(d.getDate() + i);
		c.fillText(date_to_str(d), x_coord(i*graph.x_resolution), y_origin()+4);					
		c.moveTo(x_coord((i+days_resolution)*graph.x_resolution),y_origin()-2);
	}
	c.closePath();
	c.strokeStyle = "#000";
	c.stroke();	

	if (graph.ars || graph.brl){
		c.beginPath();

	    details = graph.x_title+" ["+graph.x_unit.trim()+"]";

		c.textAlign = "right";
		c.textBaseline = "bottom";

		c.fillStyle = "#000";
		c.fillText(details, x_max()+10, y_origin()+30);	
		c.closePath();	

		c.beginPath();
	    details = graph.y_title+" ["+graph.y_unit.trim()+"]";
		c.textAlign = "left";
		c.textBaseline = "top";

		c.fillStyle = "#000";
		c.fillText(details, 0+3, 0+10);	
		c.closePath();										
	}
	c.beginPath();
		if (graph.ars){
			c.beginPath();
			c.moveTo(x_max()-140,y_max()-8);
			c.lineTo(x_max()-90,y_max()-8);
			c.strokeStyle = graph.ars_color;
			c.stroke();							
		    details = " ARS ";

			c.textAlign = "left";
			c.textBaseline = "top";

			c.fillStyle = "#000";
			c.fillText(details, x_max()-170, y_max()-15);	
			c.closePath();
		}
		if (graph.brl){
			c.beginPath();
			c.moveTo(x_max()-50,y_max()-8);
			c.lineTo(x_max()-0,y_max()-8);
			c.strokeStyle = graph.brl_color;
			c.stroke();	
		    details = " BRL ";
			c.textAlign = "left";
			c.textBaseline = "top";

			c.fillStyle = "#000";
			c.fillText(details, x_max()-80, y_max()-15);						    
			c.closePath();						
		}


}

/*Helper function that converts a date to a string*/
function date_to_str(d) {
    var temp = d;
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var dateStr = padStr(temp.getDate())+"-"+months[temp.getMonth()] +"-"+ padStr(temp.getFullYear());
    return dateStr;
}

function padStr(i) {
    return (i < 10) ? "0" + i : "" + i;
}			


/*Draw a specific data set (plot_data) into a context (c) and specify which type of data is being plot*/
function plot_graph(c,plot_data, plot_type){

	points = plot_data;

	x_point = 0;
	c.beginPath();

	if (graph.resolutionAbsolute){
		c.moveTo(x_coord(x_point),y_coord(points[0][1]*graph.y_resolution));
	}
	else{
		c.moveTo(x_coord(x_point),y_coord((points[0][1]-graph.y_min*graph.scale_min)*graph.y_resolution));
	}

	
	for(point in points){
		if (graph.resolutionAbsolute)
			y_point = parseFloat(points[point][1])*graph.y_resolution;
		else {
			if (cb_zoom.checked){
				y_point = (parseFloat(points[point][1])-graph.y_min)*graph.y_resolution;
				y_point = (y_coord(y_point) > y_origin())? 0:y_point;

			}
			else
				y_point = (parseFloat(points[point][1])-graph.y_min*graph.scale_min)*graph.y_resolution;
		}
		x_point = new Date (points[point][0]);

		x_point = Math.floor(Math.abs((graph.start_date.getTime() - x_point.getTime())/(graph.oneDay)));
		x_point = x_point * graph.x_resolution;					

		c.lineTo(x_coord(x_point),y_coord(y_point));
		c.moveTo(x_coord(x_point),y_coord(y_point));

	}
	//draw it!
	c.closePath();
	if (plot_type == 1)
		c.strokeStyle = graph.ars_color;
	else
		c.strokeStyle = graph.brl_color;
	c.stroke();		
}





/*Check box events*/
cb_hover.addEventListener('click',function(e){displayContext.canvas.width = displayContext.canvas.width});
cb_zoom.addEventListener('click',function(){
	if (cb_zoom.checked){
		cb_complete_scale.disabled = true;
	} else {
		cb_complete_scale.disabled = false;
		graph.end_date = new Date ("12-31-2012");
		graph.start_date = new Date ("10-02-2006");
		draw();					
	}

});
cb_complete_scale.addEventListener('click', function(){
	if (cb_complete_scale.checked) {graph.resolutionAbsolute = true;}
	else {graph.resolutionAbsolute = false;}
	draw();
});

cb_ars.addEventListener('click',function(){
	if (cb_ars.checked){graph.ars = true;}
	else {graph.ars = false;}
	draw(graphContext);
});
cb_brl.addEventListener('click',function(){
	if (cb_brl.checked){graph.brl = true;}
	else {graph.brl = false;}
	
	draw();
});			



graph.ars = cb_ars.checked;			

graph.brl = cb_brl.checked;

graph.lastXHover = 0;
graph.lastYHover = 0;

function displayHover(c,e){
	var mousePos = getMousePos(displayCanvas, e);
	c.canvas.width = c.canvas.width;
	c.beginPath();
	if (mousePos.x<x_origin()){
		c.moveTo(x_origin(),y_origin());
		c.lineTo(x_origin(),y_max());
		c.strokeStyle = "#000";
		c.stroke();	
	}	
	else if (mousePos.x > x_max()){
		c.moveTo(x_max(),y_origin());
		c.lineTo(x_max(),y_max());
		c.strokeStyle = "#000";
		c.stroke();	
	} else {
		c.moveTo(mousePos.x,y_origin());
		c.lineTo(mousePos.x,y_max());
		c.strokeStyle = "#ccc";
		c.stroke();	
		details = "";
		if (graph.ars || graph.brl){
			d = new Date(graph.start_date);
			d.setDate(d.getDate() + (mousePos.x - x_origin())/graph.x_resolution);
			details += date_to_str(d);
		}
		getY(mousePos.x);
		if (graph.ars){
			y = graph.ars_current_y;
			y = (y_coord(y) > y_origin())? 0 : y;
			c.moveTo(x_origin(),y_coord(y));
			c.lineTo(x_max(),y_coord(y));
			c.strokeStyle = "#0f0";
			c.stroke();	
			c.beginPath();
			c.arc(mousePos.x, y_coord(y), 3, 0, Math.PI * 2, false);
			c.strokeStyle = "#f00";
			c.stroke();	
		    c.fillStyle = "#f00";
		    c.fill();
		    details += " - ARS: "+graph.ars_current_y_value;

		}
		if (graph.brl){
			y = graph.brl_current_y;
			y = (y_coord(y) > y_origin())? 0 : y;						
			c.moveTo(x_origin(),y_coord(y));
			c.lineTo(x_max(),y_coord(y));
			c.strokeStyle = "#0f0";
			c.stroke();							
			c.beginPath();
			c.arc(mousePos.x, y_coord(y), 3, 0, Math.PI * 2, false);
			c.strokeStyle = "#f00";
			c.stroke();	
		    c.fillStyle = "#f00";
		    c.fill();
		    details += " - BRL: "+graph.brl_current_y_value;

		}

		if (graph.ars || graph.brl){
			c.textAlign = "left";
			c.textBaseline = "top";

			c.fillStyle = "#000";
			c.fillText(details, x_origin()+5, y_max()-15);					
		}

	}

}
displayCanvas.addEventListener('mousemove', function(e){
	if (!cb_hover.checked) return;
	displayHover(displayContext,e);				
});

function getY(x){
	if(graph.ars){
		points = graph.ars_points;
		for (point in points){
			x_point = new Date (points[point][0]);
			graph.ars_current_x = x_point;
			x_point = Math.floor(Math.abs((graph.start_date.getTime() - x_point.getTime())/(graph.oneDay)));

			x_point = x_point * graph.x_resolution;	

			if (x_point + x_origin()  - x > 0){
				if (graph.resolutionAbsolute)
					y_point = parseFloat(points[point][1])*graph.y_resolution;
				else{
					if (cb_zoom.checked && graph.zoom_level > 1)
						y_point = (parseFloat(points[point][1])-graph.y_min)*graph.y_resolution;
					else
						y_point = (parseFloat(points[point][1])-graph.y_min*graph.scale_min)*graph.y_resolution;
				}
					
				break;
			}
				
		}

		graph.ars_current_y = y_point;
		graph.ars_current_y_value = parseFloat(points[point][1]).toFixed(2);
		graph.ars_comment = points[point][2];
	}
	if (graph.brl){
		points = graph.brl_points;
		for (point in points){
			x_point = new Date (points[point][0]);
			graph.brl_current_x = x_point;
			x_point = Math.floor(Math.abs((graph.start_date.getTime() - x_point.getTime())/(graph.oneDay)));
			x_point = x_point * graph.x_resolution;	
			if (x_point - x + x_origin()> 0){
				if (graph.resolutionAbsolute)
					y_point = parseFloat(points[point][1])*graph.y_resolution;
				else{
					if (cb_zoom.checked && graph.zoom_level > 1)
						y_point = (parseFloat(points[point][1])-graph.y_min)*graph.y_resolution;						
					else
					y_point = (parseFloat(points[point][1])-graph.scale_min*graph.y_min)*graph.y_resolution;	
				}
					
				break;
			}
				
		}
		graph.brl_current_y = y_point;		
		graph.brl_current_y_value = parseFloat(points[point][1]).toFixed(2);	
		graph.brl_comment = points[point][2];		
	}

}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}			
function draw(){
	graphContext.canvas.width = graphContext.canvas.width;
	draw_graph_grid(graphContext);
	draw_graph(graphContext);
}


displayCanvas.addEventListener('mousedown', mouseDown, false);
displayCanvas.addEventListener('mouseup', mouseUp, false);
displayCanvas.addEventListener('mousemove', mouseMove, false);
drag = false;
rect = {};
function mouseDown(e) {
	if (!cb_zoom.checked) return;
	mouseX = getMousePos(displayCanvas, e).x;
	mouseY = getMousePos(displayCanvas, e).y;
	if (mouseX > x_origin() && mouseY> y_max() && mouseY < y_origin() && mouseX < x_max()){
	  rect.startX = mouseX;//e.pageX - this.offsetLeft;

	  rect.startY = mouseY;//e.pageY - this.offsetTop;
	  drag = true;

	} else
		drag = false;
}
function mouseUp() {
	
    drag = false;
	if (!cb_zoom.checked) return;
	calculate_zoom(rect.startX, rect.startY, rect.w, rect.h);
	displayContext.canvas.width = displayContext.canvas.width;	

		var tooltip = document.getElementById('tooltip');
    	CancelTimer();
    	tooltip.style.display = "none";				
}

function mouseMove(e) {
	mouseX = getMousePos(displayCanvas, e).x;
	mouseY = getMousePos(displayCanvas, e).y;	
    if (drag) {
	  	if(mouseX > x_max()){
		    rect.w = x_max() - rect.startX;
	  	} else {
	  		if (mouseX < x_origin())
		    	rect.w = x_origin() - rect.startX;
		    else
				rect.w = mouseX - rect.startX;
	  	}
	  	if(mouseY < y_max()){
		    rect.h = y_max() - rect.startY ;
	  	} else {
	  		if (mouseY > y_origin())
		    	rect.h = y_origin() - rect.startY ;
		    else
		    	rect.h = mouseY - rect.startY ;
	  	}
	    draw_zoom_box();
    }
    
    if (!document.getElementById('tooltip')){
    	var vis = document.getElementById('vis_container');
    	var div = document.createElement('div');
    	div.id = 'tooltip';

    	div.appendChild(document.createTextNode("yo"));
    	div.style.position = "absolute";
    	div.style.width = "150px";
    	div.style.left = mouseX+"px";
    	div.style.top=mouseY+"px";			    	
    	div.style.display = "none";
    	div.style.border ='1px solid #fdd';
    	div.style.padding = '2px';
    	div.style.background = '#fdd';
    	div.style.opacity = "0.80";			    	
    	vis.appendChild(div);
    } else {
    	var tooltip = document.getElementById('tooltip');


    	tooltip.style.display = "none";

    	CancelTimer();
    	tooltipEvent = e;
		DelayedTooltip();

	}

}		

var timerID = null;
var tooltipEvent = null;
function DelayedTooltip () {
if (timerID === null) { // to avoid multiple registration
	if (!cb_hover.checked && !drag)
    	displayContext.canvas.width  = displayContext.canvas.width ;            
    timerID = setTimeout ("DisplayTooltip ()", 200);
}
}
function DisplayTooltip () {

var tooltip = document.getElementById('tooltip');
// getMousePos(displayCanvas,e)

x = getMousePos(displayCanvas,tooltipEvent).x;
y = getMousePos(displayCanvas,tooltipEvent).y;

var data = tooltip_data(x);

if (graph.ars){
	if (graph.resolutionAbsolute)
		val = -(parseFloat(data.ars))*graph.y_resolution+y_origin();
	else{
		if (cb_zoom.checked && graph.zoom_level > 1)
			val = -(parseFloat(data.ars)-parseFloat(graph.y_min))*graph.y_resolution+y_origin();				
		else
		val = -(parseFloat(data.ars)-parseFloat(graph.y_min)*graph.scale_min)*graph.y_resolution+y_origin();	
	}               	
	// val = -(parseFloat(data.ars)-parseFloat(graph.y_min)*graph.scale_min)*graph.y_resolution+y_origin();
	if ( Math.abs(y-val) <5){
		tooltip.innerHTML = "Value: "+data.ars+"<br>Relative Value: "+parseFloat(data.ars_comment).toFixed(3)+"<br>"+"Date: "+data.ars_date;
		tooltip.style.left = mouseX+230+"px";
		tooltip.style.top=mouseY+65+"px";	
		tooltip.style.display = "block";	

			displayContext.beginPath();
			displayContext.arc(mouseX, mouseY, 3, 0, Math.PI * 2, false);
			displayContext.strokeStyle = "#f00";
			displayContext.stroke();					
	}
}

if (graph.brl){
	if (graph.resolutionAbsolute)
		val = -(parseFloat(data.brl))*graph.y_resolution+y_origin();
	else{
		if (cb_zoom.checked && graph.zoom_level > 1)
			val = -(parseFloat(data.brl)-parseFloat(graph.y_min))*graph.y_resolution+y_origin();				
		else
		val = -(parseFloat(data.brl)-parseFloat(graph.y_min)*graph.scale_min)*graph.y_resolution+y_origin();	
	}                   	
	// val = -(parseFloat(data.brl)-parseFloat(graph.y_min)*graph.scale_min)*graph.y_resolution+y_origin();
	if ( Math.abs(y-val) <5){
		tooltip.innerHTML = "Value: "+data.brl+"<br>Relative Value: "+parseFloat(data.brl_comment).toFixed(3)+"<br>"+"Date: "+data.brl_date;
		tooltip.style.left = mouseX+230+"px";
		tooltip.style.top=mouseY+65+"px";	
		tooltip.style.display = "block";	
	}
}

CancelTimer ();
}
function CancelTimer () {
clearTimeout (timerID);
timerID = null;
tooltipEvent = null;


}


function draw_zoom_box() {
	displayContext.canvas.width = displayContext.canvas.width;
	displayContext.beginPath();
	displayContext.fillStyle =  'rgba(0,0,0,0.1)';
  displayContext.fillRect(rect.startX, rect.startY, rect.w, rect.h);

  displayContext.closePath();
}		

function tooltip_data(x){
	var data = []
	if (graph.ars || graph.brl){
		d = new Date(graph.start_date);
		d.setDate(d.getDate() + (x - x_origin())/graph.x_resolution);
		data.date = date_to_str(d);
	}
	getY(x);
	if (graph.ars){
	    data.ars = graph.ars_current_y_value;
	    data.ars_date = date_to_str(graph.ars_current_x);
	    data.ars_comment = graph.ars_comment;

	}
	if (graph.brl){
	    data.brl = graph.brl_current_y_value;
	    data.brl_date = date_to_str(graph.brl_current_x);
	    data.brl_comment = graph.brl_comment;
	}


	return data;
}		


/*Calculate the zoom*/
function calculate_zoom(startX, startY, w, h){

        if (w > 0) { //zoom in
        	
        	graph.x_min_zoom = startX;
        	graph.x_max_zoom = startX + w;
        	offset = 0;
			//graph.resolutionAbsolute = false;
        	if (graph.resolutionAbsolute){
            	cb_complete_scale.checked = false;
		
        	} else {
        		
        		if (graph.zoom_level == 1)
        			offset = graph.y_min*graph.scale_min;
        		else
        			offset = graph.y_min;
        	}
        	graph.zoom_level = 2;
        	graph.resolutionAbsolute = false;
        	if (h > 0){
        		graph.y_max_zoom = (y_origin()-startY)/graph.y_resolution+offset;
        		graph.y_min_zoom = graph.y_max_zoom - h/graph.y_resolution;
        	} else {
        		graph.y_min_zoom = (y_origin()-startY)/graph.y_resolution+offset;
        		graph.y_max_zoom = (y_origin()-startY - h)/graph.y_resolution+offset;
        	}
        	draw(); 
		} else {
			graph.zoom_level = 1;
			graph.end_date = new Date ("12-31-2012");
			graph.start_date = new Date ("10-02-2006");
			graph.x_min_zoom = x_origin();
			graph.x_max_zoom = x_max();
			graph.y_min_zoom = y_origin();
			graph.y_max_zoom = y_max();
			graph.resolutionAbsolute = true;
			draw();										
		}
}			
draw();
