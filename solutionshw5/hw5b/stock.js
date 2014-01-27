/* Harvard CS171/CSCI E-64 Spring 2013
 * Solution for HW5 Problem 2
 * By a CS171 Student
 */

// This entire thing can probably be refactored a bunch. Like, with more objects
// and stuff. "Meh."


var parse_csv = function(str) {
  // Let's assume that this is "nice" CSV, because I don't feel like writing a
  // full tokenizing parser

  // Strip out empty lines
  var lines = str.split('\n').filter(function(line) {
    return line.trim() != '';
  });

  var header = lines.shift().split(',');
  return lines.map(function(line) {
    var out = {};
    line = line.split(',');
    for (var i = 0; i < header.length; i++) {
      out[header[i]] = line[i];
    }
    return out;
  });
};

var parse_json = function(str) {
  return JSON.parse(str);
};

var normalize_data = function(data) {
  data.forEach(function(datum) {
    datum['price'] = Number(datum['price']);
    datum['time'] = new Date(Number(datum['time']) * 1000);
  });
};

var parse_data = function(data_elem) {
  var data;
  switch (data_elem.getAttribute('type')) {
    case 'text/json':
      data = parse_json(data_elem.textContent);
      break;
    case 'text/csv':
      data = parse_csv(data_elem.textContent);
      break;
    default:
      console.log('Unknown data format!');
      return;
  }
  normalize_data(data);
  return data;
};

var minmax = function(out, data) {
  data.forEach(function(d) {
    if (typeof out.xmin == 'undefined' || d.time < out.xmin) {
      out.xmin = d.time;
    }
    if (typeof out.xmax == 'undefined' || d.time > out.xmax) {
      out.xmax = d.time;
    }
    if (typeof out.ymin == 'undefined' || d.price < out.ymin) {
      out.ymin = d.price;
    }
    if (typeof out.ymax == 'undefined' || d.price > out.ymax) {
      out.ymax = d.price;
    }
  });
};

var transform = function(metrics, bounds, x, y, out) {
  var r = metrics.ratio;
  var yw = metrics.yaxiswidth, w = metrics.width - yw;
  var xh = metrics.xaxisheight, h = metrics.height - xh;

  var scaledx = (+x - +bounds.xmin) / (+bounds.xmax - +bounds.xmin);
  var scaledy = (y - bounds.ymin) / (bounds.ymax - bounds.ymin);

  var scale = function(dim, off, coord) {
    return r * (off + Math.round(r * dim * coord) / r) + 0.5;
  };

  if (typeof out == 'undefined') {
    out = {};
  }
  out.x = scale(w, yw, scaledx);
  out.y = scale(h, 0, 1 - scaledy);
  return out;
};

var plot = function(metrics, bounds, data) {
  data.forEach(function(d) {
    transform(metrics, bounds, d.time, d.price, d);
  });
};

var months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var calculate_ticks = function(metrics, bounds, info) {
  // X axis
  var m = bounds.xmin;
  var year = m.getFullYear(), month = m.getMonth(), d;
  if (new Date(year, month, 1) < m) {
    if (++month == 13) {
      month = 1;
      year++;
    }
  }
  while ((d = new Date(year, month, 1)) < bounds.xmax) {
    var point = transform(metrics, bounds, d, 0);
    var tick = {
      'tick': point.x,
      'label': months[month]
    };
    if (month == 1) {
      tick.label += ' ' + d.getFullYear();
    }
    info.xticks.push(tick);

    if (++month == 13) {
      month = 1;
      year++;
    }
  }

  // Y axis
  var ytick = Math.pow(10, Math.floor(Math.log(bounds.ymax) / Math.log(10)) - 1);
  for (var i = 0; i < bounds.ymax; i += ytick) {
    var point = transform(metrics, bounds, 0, i);
    info.yticks.push({
      'tick': point.y,
      'label': '' + i
    });
  }
  while (info.yticks.length > 10) {
    info.yticks = info.yticks.filter(function(_, i) {
      return i % 2 == 0;
    });
  }
};

var calculate_xsnaps = function(metrics, bounds, info) {
  var snaps = {};
  info.data.forEach(function(data, i) {
    data.forEach(function(row) {
      if (typeof snaps[+row.time] == 'undefined') {
        snaps[+row.time] = [];
      }
      snaps[+row.time][i] = row;
    });
  });
  info.xsnaps = [];
  for (var time in snaps) {
    var out = transform(metrics, bounds, time, 0);
    info.xsnaps.push({'x': out.x, 'data': snaps[time]});
  }
  info.xsnaps.sort(function(a, b) {
    return a.x - b.x;
  });
};

var plot_data = function(metrics, elems) {
  var out = {'series': [], 'data': [], 'xticks': [], 'yticks': []};
  var bounds = {};
  for (var i = 0; i < elems.length; i++) {
    var data = parse_data(elems.item(i));
    data.sort(function(a, b) {
      if (a.time < b.time) {
        return -1;
      } else if (a.time > b.time) {
        return 1;
      } else {
        return 0;
      }
    });
    minmax(bounds, data);
    out.series.push(elems.item(i).dataset.ticker);
    out.data.push(data);
  }
  bounds.ymin = 0;
  for (var i = 0; i < out.data.length; i++) {
    plot(metrics, bounds, out.data[i]);
  }
  calculate_ticks(metrics, bounds, out);
  calculate_xsnaps(metrics, bounds, out);
  return out;
};

var layer_colors = ['#36f', '#f36'];

var new_canvas = function(metrics) {
  var c = document.createElement('canvas');
  c.width = metrics.width * metrics.ratio;
  c.height = metrics.height * metrics.ratio;
  metrics.parent.appendChild(c);
  return c;
};

var render_layer = function(canvas, metrics, data, i) {
  var ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.strokeStyle = layer_colors[i];
  ctx.lineWidth = metrics.ratio;
  data.forEach(function(d) {
    ctx.lineTo(d.x, d.y);
  });
  ctx.stroke();
};

var render_axes = function(canvas, metrics, xticks, yticks) {
  var ctx = canvas.getContext('2d');

  var yw = metrics.yaxiswidth   * metrics.ratio;
  var xh = metrics.xaxisheight  * metrics.ratio;
  var w = metrics.width         * metrics.ratio;
  var h = metrics.height        * metrics.ratio;
  var t = metrics.ticksize      * metrics.ratio;
  var f = metrics.font          * metrics.ratio;

  ctx.beginPath();
  ctx.strokeStyle = '#000';
  ctx.font = '' + f + 'px "Helvetica Neue", Helvetica, Arial, sans-serif';

  // Axes
  ctx.moveTo(yw, 0);
  ctx.lineTo(yw, h - xh);
  ctx.lineTo(w, h - xh);

  // Labels
  xticks.forEach(function(tick) {
    ctx.moveTo(tick.tick, h - xh);
    ctx.lineTo(tick.tick, h - xh + t);
    ctx.fillText(tick.label, tick.tick, h - xh + t * 1.5 + f);
  });
  yticks.forEach(function(tick) {
    ctx.moveTo(yw, tick.tick);
    ctx.lineTo(yw - t, tick.tick);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(tick.label, -tick.tick, yw - t * 1.5, tick.tick);
    ctx.restore();
  });

  ctx.stroke();
};

var render = function(metrics, info) {
  var c = new_canvas(metrics);
  c.className = 'axes';
  render_axes(c, metrics, info.xticks, info.yticks);

  for (var i = 0; i < info.data.length; i++) {
    var c = new_canvas(metrics);
    c.className = 'layer';
    c.dataset.series = info.series[i];
    render_layer(c, metrics, info.data[i], i);
  }
};

var binary_search = function(xsnaps, x) {
  var hi = xsnaps.length, lo = 0, mid;
  while (hi > lo) {
    mid = Math.floor((hi + lo) / 2);
    if (xsnaps[mid].x > x) {
      hi = mid;
    } else if (lo == mid) {
      break;
    } else {
      lo = mid;
    }
  }
  if (mid + 1 < xsnaps.length) {
    if (Math.abs(xsnaps[mid+1].x - x) < Math.abs(xsnaps[mid].x - x)) {
      return xsnaps[mid+1].data;
    }
  }
  return xsnaps[mid].data;
};

var get_selection = function(metrics, info, visible, x, y) {
  x *= metrics.ratio;
  y *= metrics.ratio;
  var points = binary_search(info.xsnaps, x).slice(0);
  info.series.forEach(function(series, i) {
    if (!visible[series]) {
      delete points[i];
    }
  });
  try {
    var target = points.reduce(function(best, point) {
      if (Math.abs(best.y - y) < Math.abs(point.y - y)) {
        return best;
      }
      return point;
    });
  } catch (e) {
    return null;
  }

  return {
    'points': points,
    'target': target
  };
};

var render_crosshair = function(metrics, canvas, target) {
  canvas.width = canvas.width;

  var yw = metrics.yaxiswidth   * metrics.ratio;
  var xh = metrics.xaxisheight  * metrics.ratio;
  var w = metrics.width         * metrics.ratio;
  var h = metrics.height        * metrics.ratio;

  var ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.strokeStyle = '#aaa';
  ctx.moveTo(yw, target.y);
  ctx.lineTo(w, target.y);
  ctx.moveTo(target.x, 0);
  ctx.lineTo(target.x, h - xh);
  ctx.stroke();
};

var render_details = function(elem, info) {
  var toggles = elem.querySelector('.layer-toggle');
  var make_box = function(name, color) {
    var container = document.createElement('div');
    container.className = 'series';
    toggles.appendChild(container);

    var toggle = document.createElement('input');
    // "This is probably unique enough!"
    toggle.id = name + Math.floor(1000000 * Math.random());
    toggle.type = 'checkbox';
    toggle.checked = true;
    toggle.dataset.series = name;
    container.appendChild(toggle);

    var label = document.createElement('label');
    label.htmlFor = toggle.id;
    label.appendChild(document.createTextNode(name));
    label.style.color = color;
    container.appendChild(label);
  };
  info.series.forEach(function(series, i) {
    make_box(series, layer_colors[i]);
  });

  make_box('Crosshairs', undefined);
};

var nuke = function(elem) {
  while (elem.hasChildNodes()) {
    elem.removeChild(elem.lastChild);
  }
};

var render_tooltip = function(chart, elem, metrics, target) {
  var tooltip = elem.querySelector('.tooltip');
  if (tooltip == null) {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.appendChild(document.createTextNode(''));
    elem.appendChild(tooltip);
  }
  tooltip.firstChild.data = '$' + target.price;

  tooltip.style.top = (chart.offsetTop + target.y / metrics.ratio) + 'px';
  tooltip.style.left = (chart.offsetLeft + target.x / metrics.ratio) + 'px';
};

var render_ticker = function(elem, info, target, points) {
  var ticker = elem.querySelector('.ticker');
  nuke(ticker);

  var xlabel = document.createElement('div');
  xlabel.className = 'date';
  var xlabellabel = target.time.toLocaleString().split(' ')[0]; // Hax
  xlabel.appendChild(document.createTextNode(xlabellabel));
  ticker.appendChild(xlabel);

  info.series.forEach(function(series, i) {
    if (typeof points[i] != 'undefined') {
      var point = document.createElement('div');
      point.className = 'symbol';
      ticker.appendChild(point);

      var symbol = document.createElement('span');
      symbol.className = 'label';
      symbol.appendChild(document.createTextNode(series + ': '));
      symbol.style.color = layer_colors[i];
      point.appendChild(symbol);

      var data = document.createElement('span');
      data.className = 'value';
      data.appendChild(document.createTextNode('$' + points[i].price));
      point.appendChild(data);
    }
  });
};

var make_things_go_away = function(details) {
  nuke(details.querySelector('.ticker'));
  details.removeChild(details.querySelector('.tooltip'));
};

// Set everything up
document.addEventListener('DOMContentLoaded', function() {
  var elems = document.querySelectorAll('script[data-ticker]')
  var chart = document.getElementById('chart');
  var details = document.getElementById('details');

  var metrics = {
    'parent': chart,
    'width': chart.offsetWidth,
    'height': chart.offsetHeight,
    // <3 retina displays
    'ratio': window.devicePixelRatio || 1,
    'xaxisheight': 30,
    'yaxiswidth': 30,
    'ticksize': 7,
    'font': 10
  };

  var ch = new_canvas(metrics);
  ch.className = 'crosshair';
  // We pretend the crosshairs are a pseudo-series to DRY up our checkbox code
  ch.dataset.series = 'Crosshairs';

  var info = plot_data(metrics, elems);
  render(metrics, info);
  render_details(details, info);

  var visible = {};
  info.series.forEach(function(series) { visible[series] = true; });

  chart.addEventListener('mousemove', function(e) {
    var sel = get_selection(metrics, info, visible, e.offsetX, e.offsetY);
    if (sel == null) return;
    render_crosshair(metrics, ch, sel.target);
    render_tooltip(chart, details, metrics, sel.target);
    render_ticker(details, info, sel.target, sel.points);
  });
  chart.addEventListener('mouseout', function(e) {
    ch.width = ch.width;
    make_things_go_away(details);
  });

  details.addEventListener('change', function(e) {
    var target = e.target, series = target.dataset.series;
    var c = chart.querySelector('canvas[data-series="' + series + '"]');
    visible[series] = target.checked;
    c.style.visibility = target.checked ? 'visible' : 'hidden';
    make_things_go_away(details);
  });

  console.log(info.xsnaps);
}, false);
