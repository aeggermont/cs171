/* Harvard CS171/CSCI E-64 Spring 2013     
 * Solution for HW5 Problem 2 
 * By David Chouinard
 */

$(document).ready(function() {
  var data1_raw = $.trim($("#csv").val()).split("\n");
  var data1 = {};

  data1.title = data1_raw.shift().slice(0, -1);

  var xs = data1_raw.shift().split(",");
  data1.x = {"title": xs[0], "units": xs[1]};
  var ys = data1_raw.shift().split(",");
  data1.y = {"title": ys[0], "units": ys[1]};

  data1.points = [];
  for (var i = 0; i < data1_raw.length; i++) {
    var row = data1_raw[i].split(",");
    data1.points.push([parseInt(row[0], 10), parseFloat(row[1]), "", row[2]]);
  }

  dataset = [data1, JSON.parse($("#JSON").val())];
  //var colors = ["#DD3558", "#0576B0"];
  colors = ["#779A46", "#F4723E"];

  context = document.getElementById("graph").getContext("2d");
  var crosshairs = document.getElementById("crosshairs").getContext("2d");

  position = {
    top: 30.5,
    left: 30.5,
    bottom: context.canvas.height - 50.5,
    right: context.canvas.width - 50.5};

  // Filter options
  for (var i = 0; i < dataset.length; i++) {
    $('#filter').append('<div id="filter-item" style="color: ' + colors[i] + ';"><input type="checkbox" checked>' + dataset[i].title + "</div>");
  }

  drawGraphBasedOnFilters();

  $(context.canvas).on("mousemove", function(e) {
    if (e.originalEvent.layerX >= position.left && e.originalEvent.layerX <= position.right && e.originalEvent.layerY >= position.top && e.originalEvent.layerY <= position.bottom) {
      // Reset any previous crosshairs
      crosshairs.canvas.width = crosshairs.canvas.width;

      closest_datapoint = getClosestDataPoint(e.originalEvent.layerX, e.originalEvent.layerY);

      // Snap to closest datapoint if we're close to it
      if (closest_datapoint !== null && closest_datapoint.distance <= 15) {
        var crosshair_x = closest_datapoint.x;
        var crosshair_y = closest_datapoint.y;

        var tooltip_text = dataset[1].x.units + ": " + closest_datapoint.data[0] + "<br>" + closest_datapoint.data[1].toFixed(1) + dataset[1].y.units;
        if (closest_datapoint.data[2] !== undefined && closest_datapoint.data[2] !== "")
          var tooltip_text = tooltip_text + "<br><strong>" + closest_datapoint.data[2] + "</strong>";

        $("#tooltip").html(tooltip_text);
        $("#tooltip").show();
        $("#tooltip").css("left", (closest_datapoint.x + 15) + "px");
        $("#tooltip").css("top", (closest_datapoint.y - 67) + "px");

        $("#side-tooltip-content").html(tooltip_text).show();
      } else {
        $("#tooltip").hide();
        $("#side-tooltip-content").hide();
        var crosshair_x = e.originalEvent.layerX;
        var crosshair_y = e.originalEvent.layerY;
      }

      if ($("#options-crosshair").is(':checked')) {
        crosshairs.strokeStyle = "#bce8f1";
        crosshairs.lineWidth = 2;

        crosshairs.beginPath();
        crosshairs.moveTo(position.left, crosshair_y);
        crosshairs.lineTo(position.right, crosshair_y);
        crosshairs.stroke();

        crosshairs.beginPath();
        crosshairs.moveTo(crosshair_x, position.top);
        crosshairs.lineTo(crosshair_x, position.bottom);
        crosshairs.stroke();
      }
    }
  });

  $("#filter").on("click", "input", drawGraphBasedOnFilters);

  $("#options-crosshair").on("click", function() {
    crosshairs.canvas.width = crosshairs.canvas.width;
    $("#tooltip").hide();
  });
});

function x_increment(index) {
  return index * 30;
}
function y_increment(value) {
  return position.bottom - (value * (position.bottom - position.top)) / 10.0;
}

function drawXAxis(points) {
  // Draw grid
  context.strokeStyle = "#eee";
  context.lineWidth = 1;
  context.font = "bold 12px Helvetica, Arial, sans-serif";
  context.textAlign = "center";

  // X axis
  context.beginPath();
  for (var i = 0; i < points.length - 1; i++) {
    context.moveTo(x_increment(i) + position.left, position.top);
    context.lineTo(x_increment(i) + position.left, position.bottom);
    // Only draw one out of each two labels
    if (i % 2 == 1)
      context.fillText(points[i][0].toString(), x_increment(i) + position.left, position.bottom + 15);
  }
  context.stroke();

  // Draw Axis
  context.strokeStyle = "#000";
  context.beginPath();
  context.moveTo(position.left, position.bottom);
  context.lineTo(position.right, position.bottom);
  context.stroke();
}

function drawYAxis(legend_items) {
  // Draw grid
  context.strokeStyle = "#eee";
  context.lineWidth = 1;
  context.textAlign = "left";
  context.textBaseline = "middle";

  context.beginPath();
  legend_items = [1,2,3,4,5,6,7,8,9,10];
  for (var i = 0; i < legend_items.length; i++) {
    context.moveTo(position.left, y_increment(legend_items[i]));
    context.lineTo(position.right, y_increment(legend_items[i]));
    // Only draw one out of each two labels
    context.fillText(legend_items[i].toString() + "%", position.right + 10, y_increment(legend_items[i]));
  }
  context.stroke();

  // Draw axis
  context.strokeStyle = "#000";
  context.beginPath();
  context.moveTo(position.right, position.top);
  context.lineTo(position.right, position.bottom);
  context.stroke();
}

function drawLineData(data, color) {
  // Draw line
  context.strokeStyle = color;
  context.lineCap = "round";
  context.lineWidth = 5;

  context.beginPath();
  var is_first = true;
  for (var i = 0; i < data.points.length; i++) {
    if (data.points[i][1] !== null) {
      if (is_first) {
        // Deal with the first point differently
        context.moveTo(x_increment(i) + position.left, y_increment(data.points[i][1]));
        is_first = false;
      } else {
        context.lineTo(x_increment(i) + position.left, y_increment(data.points[i][1]));
      }
      dataset_coord.push({x: x_increment(i) + position.left, y: y_increment(data.points[i][1]), data: data.points[i]});
    }
  }
  context.stroke();
}

function getClosestDataPoint(x,y) {
  closest_datapoint = null;

  for (var i = 0; i < dataset_coord.length; i++) {
    var distance_to_point = Math.sqrt(Math.pow((x - dataset_coord[i].x), 2) + Math.pow((y - dataset_coord[i].y), 2));
    if (closest_datapoint === null || distance_to_point < closest_datapoint.distance) {
      closest_datapoint = dataset_coord[i];
      closest_datapoint.distance = distance_to_point;
    }
  }

  return closest_datapoint;
}

function drawGraphBasedOnFilters() {
  context.canvas.width = context.canvas.width;

  dataset_coord = [];

  drawXAxis(dataset[1].points);
  drawYAxis([1,2,3,4,5,6,7,8,9,10]);

  $("#filter input").each(function(i) {
    if ($(this).is(":checked"))
      drawLineData(dataset[i], colors[i]);
  });
}
