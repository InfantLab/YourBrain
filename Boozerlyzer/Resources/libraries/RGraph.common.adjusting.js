    /**
    * o------------------------------------------------------------------------------o
    * | This file is part of the RGraph package - you can learn more at:             |
    * |                                                                              |
    * |                          http://www.rgraph.net                               |
    * |                                                                              |
    * | This package is licensed under the RGraph license. For all kinds of business |
    * | purposes there is a small one-time licensing fee to pay and for non          |
    * | commercial  purposes it is free to use. You can read the full license here:  |
    * |                                                                              |
    * |                      http://www.rgraph.net/LICENSE.txt                       |
    * o------------------------------------------------------------------------------o
    */

    if (typeof(RGraph) == 'undefined') RGraph = {isRGraph:true,type:'common'};

    RGraph.AllowAdjusting = function (obj)
    {
        var canvas  = obj.canvas;
        var context = obj.context;
        
        RGraph.Register(obj);
            
        if (obj.type == 'line') {
            var canvas_onmousedown = function (e)
            {
                e = RGraph.FixEventObject(e);
    
                var obj         = e.target.__object__;
                var id          = obj.id;
                var canvas      = obj.canvas;
                var context     = obj.context;
                var coords      = obj.coords;
                var mouseCoords = RGraph.getMouseXY(e);
    
                RGraph.Redraw();
    
                for (var i=0; i<coords.length; ++i) {
    
                    if (   mouseCoords[0] > coords[i][0] - 5
                        && mouseCoords[1] > coords[i][1] - 5
                        && mouseCoords[0] < coords[i][0] + 5
                        && mouseCoords[1] < coords[i][1] + 5
                       ) {

                        var numDataSeries = obj.original_data.length;
                        var numDataPoints = obj.original_data[0].length;
                        var data_series   = i / numDataPoints;
                            data_series = Math.floor(data_series);
    
    
    
                      canvas.style.cursor = 'ns-resize';
                      RGraph.FireCustomEvent(obj, 'onadjustbegin');
                      RGraph.Registry.Set('chart.adjusting.line.' + id, [obj, i, [coords[i][0], coords[i][1]], data_series]);
    
                      return;
                    }
                }
            }
            canvas.addEventListener('mousedown', canvas_onmousedown, false);
            RGraph.AddEventListener(canvas.id, 'mousedown', canvas_onmousedown);
    
    
            var canvas_onmousemove = function (e)
            {
                e = RGraph.FixEventObject(e);
                var id = e.target.__object__.id;
    
                var state = RGraph.Registry.Get('chart.adjusting.line.' + id);
    
                if (state) {
                    var obj         = state[0];
                    var idx         = state[1];
                    var canvas      = obj.canvas;
                    var context     = obj.context;
                    var data_series = state[3];
                    var points      = obj.original_data[data_series];
                    var mouseCoords = RGraph.getMouseXY(e);
                    var x           = mouseCoords[0];
                    var y           = mouseCoords[1];
                    var h           = RGraph.GetHeight(obj);
                    
    
                    // Don't allow adjusting to the gutter if out-of-bounds is NOT specified
                    if (!obj.Get('chart.outofbounds')) {
                        if (y >= (h - obj.Get('chart.gutter'))) {
                            y = h - obj.Get('chart.gutter');
                        } else if (y <= obj.Get('chart.gutter')) {
                            y = obj.Get('chart.gutter');
                        }
                    }

                    // This accounts for a center X axis
                    if (obj.Get('chart.xaxispos') == 'center') {
                        y *= 2;
                        y -= (obj.Get('chart.gutter') / 2);
                    }
    
                    var pos   = h - (2 * obj.Get('chart.gutter'));
                        pos   = pos - (y - obj.Get('chart.gutter'));
                    var value = (obj.max / (h - (2 * obj.Get('chart.gutter')))) * pos;
    
                    // Adjust the index so that it's applicable to the correct data series
                    for (var i=0; i<data_series; ++i) {
                        idx -= obj.original_data[0].length;
                    }
    
                    obj.original_data[data_series][idx] = value;
    
                    obj.Set('chart.ymax', obj.max);
                    canvas.style.cursor = 'ns-resize';
                    RGraph.Redraw();

                    /**
                    * Fire the onadjust event
                    */
                    RGraph.FireCustomEvent(obj, 'onadjust');
    
                    return;
    
                } else {
                    
                    var canvas  = e.target;
                    var context = canvas.__object__.context;
                    var obj     = canvas.__object__;
                    var mouseCoords = RGraph.getMouseXY(e);
                    var x       = mouseCoords[0];
                    var y       = mouseCoords[1];
    
                    for (var i=0; i<obj.coords.length; ++i) {
    
                        if (   x > obj.coords[i][0] - 5
                            && y > obj.coords[i][1] - 5
                            && x < obj.coords[i][0] + 5
                            && y < obj.coords[i][1] + 5
                           ) {
    
                           canvas.style.cursor = 'ns-resize';
                           return;
                        }
                    }
                }
                
                e.target.style.cursor = null;
            }
            canvas.addEventListener('mousemove', canvas_onmousemove, false);
            RGraph.AddEventListener(canvas.id, 'mousemove', canvas_onmousemove);
    
    
            var canvas_onmouseup = function (e)
            {
                var id = e.target.__object__.id;
                
                if (RGraph.Registry.Get('chart.adjusting.line.' + id)) {
                    RGraph.FireCustomEvent(e.target.__object__, 'onadjustend');
                }

                RGraph.Registry.Set('chart.adjusting.line.' + id, null);
                e.target.style.cursor = null;
            }
            canvas.addEventListener('mouseup', canvas_onmouseup, false);
            RGraph.AddEventListener(canvas.id, 'mouseup', canvas_onmouseup);
    
    
            var canvas_onmouseout = function (e)
            {
                canvas_onmouseup(e);
            }
            canvas.addEventListener('mouseout', canvas_onmouseout, false);
            RGraph.AddEventListener(canvas.id, 'mouseout', canvas_onmouseout);
        
        /**
        * HProgress bar
        */
        } else if (obj.type == 'hprogress') {

            
            var canvas_onmousedown = function (e)
            {
                var id = e.target.__object__.id;

                RGraph.Registry.Set('chart.adjusting.hprogress.' + id, [true]);
                
                RGraph.FireCustomEvent(e.target.__object__, 'onadjustbegin');
                
                canvas_onmousemove(e);
            }
            canvas.addEventListener('mousedown', canvas_onmousedown, false);
            RGraph.AddEventListener(canvas.id, 'mousedown', canvas_onmousedown);


            var canvas_onmousemove = function (e)
            {
                var id    = e.target.__object__.id;
                var state = RGraph.Registry.Get('chart.adjusting.hprogress.' + id);

                if (state && state.length) {
                    var obj     = e.target.__object__;
                    var canvas  = obj.canvas;
                    var context = obj.context;
                    
                    if (obj.type == 'hprogress') {
                    
                        var coords = RGraph.getMouseXY(e);
                            coords[0] = Math.max(0, coords[0] - obj.Get('chart.gutter'));
                        var barWidth  = canvas.width - (2 * obj.Get('chart.gutter'));
                        
                        // Work out the new value
                        var value  = (coords[0] / barWidth) * (obj.max - obj.Get('chart.min'));
                            value += obj.Get('chart.min');
                        
                        obj.value = Math.max(0, value.toFixed());
                        RGraph.Clear(obj.canvas);
                        obj.Draw();

/*
                    } else if (obj.type == 'vprogress') {

                        var coords = RGraph.getMouseXY(e);
                            coords[1] = Math.max(0, coords[1] - obj.Get('chart.gutter'));
                        var barHeight = canvas.height - (2 * obj.Get('chart.gutter'));
                        
                        // Work out the new value
                        var value = ( (barHeight - coords[1]) / barHeight) * obj.max;
                        
                        obj.value = Math.max(0, value.toFixed());
                        RGraph.Clear(obj.canvas);
                        obj.Draw();
*/
                    }

                    /**
                    * Fire the onadjust event
                    */
                    RGraph.FireCustomEvent(obj, 'onadjust');
                }
            }
            canvas.addEventListener('mousemove', canvas_onmousemove, false);
            RGraph.AddEventListener(canvas.id, 'mousemove', canvas_onmousemove);
            
            
            var canvas_onmouseup = function (e)
            {
                var id = e.target.__object__.id;

                if (RGraph.Registry.Get('chart.adjusting.hprogress.' + id)) {
                    RGraph.FireCustomEvent(e.target.__object__, 'onadjustend');
                }

                RGraph.Registry.Set('chart.adjusting.hprogress.' + id, null);
            }
            canvas.addEventListener('mouseup', canvas_onmouseup, false);
            RGraph.AddEventListener(canvas.id, 'mouseup', canvas_onmouseup);
    
    
            var canvas_onmouseout = function (e)
            {
                canvas_onmouseup(e);
            }
            canvas.addEventListener('mouseout', canvas_onmouseout, false);
            RGraph.AddEventListener(canvas.id, 'mouseout', canvas_onmouseout);
        
        /**
        * VProgress bar
        */
        } else if (obj.type == 'vprogress') {

            
            var canvas_onmousedown = function (e)
            {
                var id = e.target.__object__.id;

                RGraph.Registry.Set('chart.adjusting.vprogress.' + id, [true]);
                
                RGraph.FireCustomEvent(e.target.__object__, 'onadjustbegin');
                
                canvas_onmousemove(e);
            }
            canvas.addEventListener('mousedown', canvas_onmousedown, false);
            RGraph.AddEventListener(canvas.id, 'mousedown', canvas_onmousedown);


            var canvas_onmousemove = function (e)
            {
                var id    = e.target.__object__.id;
                var state = RGraph.Registry.Get('chart.adjusting.vprogress.' + id);

                if (state && state.length) {
                    var obj     = e.target.__object__;
                    var canvas  = obj.canvas;
                    var context = obj.context;
                    
                    if (obj.type == 'hprogress') {
                    
                        var coords = RGraph.getMouseXY(e);
                            coords[0] = Math.max(0, coords[0] - obj.Get('chart.gutter'));
                        var barWidth  = canvas.width - (2 * obj.Get('chart.gutter'));
                        
                        // Work out the new value
                        var value  = (coords[0] / barWidth) * (obj.max - obj.Get('chart.min'));
                            value += obj.Get('chart.min');
                        
                        obj.value = Math.max(0, value.toFixed());
                        RGraph.Clear(obj.canvas);
                        obj.Draw();

                    } else if (obj.type == 'vprogress') {

                        var coords = RGraph.getMouseXY(e);
                            coords[1] = Math.max(0, coords[1] - obj.Get('chart.gutter'));
                        var barHeight = canvas.height - (2 * obj.Get('chart.gutter'));
                        
                        // Work out the new value
                        var value = ( (barHeight - coords[1]) / barHeight) * obj.max;
                        
                        obj.value = Math.max(0, value.toFixed());
                        RGraph.Clear(obj.canvas);
                        obj.Draw();
                    }

                    /**
                    * Fire the onadjust event
                    */
                    RGraph.FireCustomEvent(obj, 'onadjust');
                }
            }
            canvas.addEventListener('mousemove', canvas_onmousemove, false);
            RGraph.AddEventListener(canvas.id, 'mousemove', canvas_onmousemove);
            
            
            var canvas_onmouseup = function (e)
            {
                var id = e.target.__object__.id;

                if (RGraph.Registry.Get('chart.adjusting.vprogress.' + id)) {
                    RGraph.FireCustomEvent(e.target.__object__, 'onadjustend');
                }

                RGraph.Registry.Set('chart.adjusting.vprogress.' + id, null);
            }
            canvas.addEventListener('mouseup', canvas_onmouseup, false);
            RGraph.AddEventListener(canvas.id, 'mouseup', canvas_onmouseup);
    
    
            var canvas_onmouseout = function (e)
            {
                canvas_onmouseup(e);
            }
            canvas.addEventListener('mouseout', canvas_onmouseout, false);
            RGraph.AddEventListener(canvas.id, 'mouseout', canvas_onmouseout);
        
        /**
        * Rose chart
        */
        } else if (obj.type == 'rose') {


            obj.Set('chart.ymax', obj.max);


            var canvas_onmousemove = function (e)
            {
                var obj     = e.target.__object__;
                var id      = obj.id;
                var canvas  = obj.canvas;
                var context = obj.context;
                var coords  = RGraph.getMouseXY(e);
                var segment = RGraph.Registry.Get('chart.adjusting.rose.' + id);
                var x       = Math.abs(coords[0] - obj.centerx);
                var y       = Math.abs(coords[1] - obj.centery);
                var theta   = Math.atan(y / x) * (180 / Math.PI); // theta is now in DEGREES


                // Account for the correct quadrant
                if (coords[0] >= obj.centerx && coords[1] < obj.centery) {
                    theta = 90 - theta;
                } else if (coords[0] >= obj.centerx && coords[1] >= obj.centery) {
                    theta += 90;
                } else if (coords[0] < obj.centerx && coords[1] >= obj.centery) {
                    theta = 90 - theta;
                    theta = 180 + theta;
                    
                } else if (coords[0] < obj.centerx && coords[1] < obj.centery) {
                    theta = theta + 270;
                }

                var Opp = y;
                var Adj = x;
                var Hyp = Math.abs(Adj / Math.sin(theta / (180 / Math.PI)));

                for (var i=0; i<obj.angles.length; ++i) {
                    if (
                           theta > obj.angles[i][0]
                        && theta < obj.angles[i][1]) {

                        if (RGraph.Registry.Get('chart.adjusting.rose.' + id) && i == segment[5]) {
                            var newvalue  = (Hyp / (obj.radius - 25) ) * obj.max;
                            obj.data[i]   = Math.min(newvalue, obj.max);

                            RGraph.Clear(obj.canvas);
                            obj.Draw();

                            /**
                            * Fire the onadjust event
                            */
                            RGraph.FireCustomEvent(obj, 'onadjust');
                        }
                        
                        if (Hyp <= (obj.angles[i][2] + 5) && Hyp >= (obj.angles[i][2] - 5) ) {
                            canvas.style.cursor = 'move';
                            return false;
                        
                        } else if (obj.Get('chart.tooltips') && Hyp <= (obj.angles[i][2] - 5) ) {
                            canvas.style.cursor = 'pointer';
                            return false;
                        }

                    }
                }

                canvas.style.cursor = 'default';
                
                return;
            }
            canvas.addEventListener('mousemove', canvas_onmousemove, false);
            RGraph.AddEventListener(canvas.id, 'mousemove', canvas_onmousemove);


            var canvas_onmousedown = function (e)
            {
                var obj     = e.target.__object__;
                var id      = obj.id;
                var canvas  = obj.canvas;
                var context = obj.context;
                var coords  = RGraph.getMouseXY(e);
                var segment = RGraph.getSegment(e, 5);

                if (segment && segment.length && !RGraph.Registry.Get('chart.adjusting.rose.' + id)) {
                    var x = Math.abs(coords[0] - obj.centerx);
                    var y = Math.abs(coords[1] - obj.centery);
                    var a = Math.atan(y / x) * (180 / Math.PI); // a is now in DEGREES

                    // Account for the correct quadrant
                    if (coords[0] >= obj.centerx && coords[1] < obj.centery) {
                        a  = 90 - a;
                        a += 270;
                    } else if (coords[0] >= obj.centerx && coords[1] >= obj.centery) {
                        // Nada
                    } else if (coords[0] < obj.centerx && coords[1] >= obj.centery) {
                         a  = 90 - a;
                         a += 90;
                    } else if (coords[0] < obj.centerx && coords[1] < obj.centery) {
                        a += 180;
                    }

                    var hyp = Math.abs(y / Math.sin(a / 57.3));

                    if (hyp >= (segment[2] - 10) ) {

                        /**
                        * Hide any currently shown tooltip
                        */
                        if (RGraph.Registry.Get('chart.tooltip')) {
                            RGraph.Registry.Get('chart.tooltip').style.display = 'none';
                            RGraph.Registry.Set('chart.tooltip', null);
                        }
                        
                        RGraph.Registry.Set('chart.adjusting.rose.' + id, segment);
                        
                        RGraph.FireCustomEvent(e.target.__object__, 'onadjustbegin');
                        
                        e.stopPropagation();
                    }
                }
            }
            canvas.addEventListener('mousedown', canvas_onmousedown, false);
            RGraph.AddEventListener(canvas.id, 'mousedown', canvas_onmousedown);


            var canvas_onmouseup = function (e)
            {
                var obj = e.target.__object__;
                var id  = obj.id;

                if (RGraph.Registry.Get('chart.adjusting.rose.' + id)) {


                    RGraph.FireCustomEvent(e.target.__object__, 'onadjustend');
                    RGraph.Registry.Set('chart.adjusting.rose.' + id, null);
                    e.stopPropagation();
                    
                    return false;
                }
            }
            canvas.addEventListener('mouseup', canvas_onmouseup, false);
            RGraph.AddEventListener(canvas.id, 'mouseup', canvas_onmouseup);
    
    
            var canvas_onmouseout = function (e)
            {
                canvas_onmouseup(e);
            }
            canvas.addEventListener('mouseout', canvas_onmouseout, false);
            RGraph.AddEventListener(canvas.id, 'mouseout', canvas_onmouseout);

        /**
        * Bar chart
        */
        } else if (obj.type == 'bar') {
        
            // Stacked bar charts not supported
            if (obj.Get('chart.grouping') == 'stacked') {
                alert('[BAR] Adjusting stacked bar charts is not supported');
                return;
            }


            var canvas  = obj.canvas;
            var context = obj.context;


            var canvas_onmousemove = function (e)
            {
                var obj     = e.target.__object__;
                var id      = obj.id;
                var canvas  = obj.canvas;
                var context = obj.context;
                var mouse   = RGraph.getMouseXY(e);
                var mousex  = mouse[0];
                var mousey  = mouse[1]; // mousey, mousey...
                

                // Loop through the coords to see if the mouse position is at the top of a bar
                for (var i=0; i<obj.coords.length; ++i) {
                    if (mousex > obj.coords[i][0] && mousex < (obj.coords[i][0] + obj.coords[i][2])) {
                        
                        // Change the mouse pointer
                        if (mousey > (obj.coords[i][1] - 5) && mousey < (obj.coords[i][1] + 5)) {
                            canvas.style.cursor = 'ns-resize';
                        } else {
                            canvas.style.cursor = 'default';
                        }

                        var idx = RGraph.Registry.Get('chart.adjusting.bar.' + id)
                        
                        if (typeof(idx) == 'number') {

                            // This accounts for a center X axis
                            if (obj.Get('chart.xaxispos') == 'center') {
                                obj.grapharea /= 2;
                            }

                            var newheight = obj.grapharea - (mousey - obj.Get('chart.gutter'));
                            var newvalue  = (newheight / obj.grapharea) * obj.max;
                            
                            // Top and bottom boundaries
                            if (newvalue > obj.max) newvalue = obj.max;
                    
                            if (obj.Get('chart.xaxispos') == 'center') {
                                if (newvalue < (-1 * obj.max)) newvalue = (-1 * obj.max);
                            } else {
                                if (newvalue < 0) newvalue = 0;
                            }

                            ///////////////// This was fun to work out... /////////////////
                            for (var j=0, index=0; j<obj.data.length; ++j,++index) {
                                if (typeof(obj.data[j]) == 'object') {
                                    for (var k=0; k<obj.data[j].length && index <= idx; ++k, ++index) {
                                        if (index == idx) {
                                            obj.data[j][k] = newvalue;
                                            var b = true;
                                            break;
                                        }
                                    }
                                    
                                    --index;
                                } else if (typeof(obj.data[j]) == 'number') {
                            
                                    if (index == idx) {
                                        obj.data[j] = newvalue;
                                        // No need to set b
                                        break;
                                    }
                                }
                                
                                if (b) {
                                    break;
                                }
                            }
                            ///////////////////////////////////////////////////////////////

                            RGraph.Clear(canvas);
                            obj.Draw();

                            /**
                            * Fire the onadjust event
                            */
                            RGraph.FireCustomEvent(obj, 'onadjust');
                        }

                        return;
                    }
                }
                
                canvas.style.cursor = 'pointer';
            }
            canvas.addEventListener('mousemove', canvas_onmousemove, false);
            RGraph.AddEventListener(canvas.id, 'mousemove', canvas_onmousemove);



            var canvas_onmousedown = function (e)
            {
                var obj     = e.target.__object__;
                var id      = obj.id;
                var canvas  = obj.canvas;
                var context = obj.context;
                var mouse   = RGraph.getMouseXY(e);
                var mousex  = mouse[0];
                var mousey  = mouse[1];

                // Loop through the coords to see if the mouse position is at the top of a bar
                for (var i=0; i<obj.coords.length; ++i) {
                    if (mousex > obj.coords[i][0] && mousex < (obj.coords[i][0] + obj.coords[i][2])) {

                        RGraph.FireCustomEvent(obj, 'onadjustbegin');

                        obj.Set('chart.ymax', obj.max);
                        RGraph.Registry.Set('chart.adjusting.bar.' + id, i);
                        
                        canvas_onmousemove(e);
                    }
                }
            }
            canvas.addEventListener('mousedown', canvas_onmousedown, false);
            RGraph.AddEventListener(canvas.id, 'mousedown', canvas_onmousedown);



            var canvas_onmouseup = function (e)
            {
                var id = e.target.__object__.id;
                
                if (typeof(RGraph.Registry.Get('chart.adjusting.bar.' + id)) == 'number') {
                    RGraph.FireCustomEvent(e.target.__object__, 'onadjustend');
                }
                
                RGraph.Registry.Set('chart.adjusting.bar.' + id, null);
            }
            canvas.addEventListener('mouseup', canvas_onmouseup, false);
            RGraph.AddEventListener(canvas.id, 'mouseup', canvas_onmouseup);


            var canvas_onmouseout = function (e)
            {
                canvas_onmouseup(e);
            }
            canvas.addEventListener('mouseout', canvas_onmouseout, false);
            RGraph.AddEventListener(canvas.id, 'mouseout', canvas_onmouseout);


        /**
        * The Tradar chart
        */
        } else if (obj.type == 'tradar') {


            var canvas = obj.canvas;
            var context = obj.context;
            
            
            var canvas_onmousemove = function (e)
            {
                var obj         = e.target.__object__;
                var id          = obj.id;
                var canvas      = obj.canvas;
                var context     = obj.context;
                var mouseDown   = RGraph.Registry.Get('chart.adjusting.tradar.' + id);
                var mouseCoords = RGraph.getMouseXY(e);


                if (mouseDown) {

                    canvas.style.cursor = 'move';

                    var dx  = mouseCoords[0] - obj.centerx;
                    var dy  = mouseCoords[1] - obj.centery;
                    var hyp = Math.sqrt((dx * dx) + (dy * dy));

                    var newvalue = (hyp / (obj.size / 2)) * obj.max;
                    
                    newvalue = Math.min(obj.max, newvalue);
                    newvalue = Math.max(0, newvalue);

                    /**
                    * Only redraw the graph if the mouse is in the same quadrant as the point
                    */
                    if ( (dx >= 0 ? true : false) == mouseDown[1] && (dy >= 0 ? true : false) == mouseDown[2]) {
                        obj.data[mouseDown[0]] = newvalue;
                        RGraph.Clear(canvas);
                        obj.Draw();

                        /**
                        * Fire the onadjust event
                        */
                        RGraph.FireCustomEvent(obj, 'onadjust');
                    }


                } else {

                    // Determine if the mouse is near a point, and if so, change the pointer
                    for (var i=0; i<obj.coords.length; ++i) {
                        
                        var dx = Math.abs(mouseCoords[0] - obj.coords[i][0]);
                        var dy = Math.abs(mouseCoords[1] - obj.coords[i][1]);
                        var a  = Math.atan(dy / dx);
    
                        
                        var hyp = Math.sqrt((dx * dx) + (dy * dy));
    
                        if (hyp <= 5) {
                            canvas.style.cursor = 'move';
                            return;
                        }
                    }

                    canvas.style.cursor = 'default';
                }
            }
            canvas.addEventListener('mousemove', canvas_onmousemove, false);
            RGraph.AddEventListener(canvas.id, 'mousemove', canvas_onmousemove);
            
            
            var canvas_onmousedown = function (e)
            {
                e = RGraph.FixEventObject(e);
                
                var obj         = e.target.__object__;
                var id          = obj.id;
                var canvas      = obj.canvas;
                var context     = obj.context;
                var mouseCoords = RGraph.getMouseXY(e);


                // Determine if the mouse is near a point
                for (var i=0; i<obj.coords.length; ++i) {
                    
                    var dx = Math.abs(mouseCoords[0] - obj.coords[i][0]);
                    var dy = Math.abs(mouseCoords[1] - obj.coords[i][1]);
                    var a  = Math.atan(dy / dx);

                    
                    var hyp = Math.sqrt((dx * dx) + (dy * dy));

                    if (hyp <= 5) {
                        canvas.style.cursor = 'pointer';
                        RGraph.FireCustomEvent(obj, 'onadjustbegin');
                        RGraph.Registry.Set('chart.adjusting.tradar.' + id, [i, obj.coords[i][0] > obj.centerx, obj.coords[i][1] > obj.centery]);
                        return;
                    }
                }
                    
                canvas.style.cursor = 'default';
            }
            canvas.addEventListener('mousedown', canvas_onmousedown, false);
            RGraph.AddEventListener(canvas.id, 'mousedown', canvas_onmousedown);


            var canvas_onmouseup = function (e)
            {
                var id = e.target.id;

                if (RGraph.Registry.Get('chart.adjusting.tradar.' + id)) {
                    RGraph.FireCustomEvent(e.target.__object__, 'onadjustend');
                }

                RGraph.Registry.Set('chart.adjusting.tradar.' + id, null);
                canvas.style.cursor = 'default';
            }
            canvas.addEventListener('mouseup', canvas_onmouseup, false);
            RGraph.AddEventListener(canvas.id, 'mouseup', canvas_onmouseup);
    
    
            var canvas_onmouseout = function (e)
            {
                canvas_onmouseup(e);
            }
            canvas.addEventListener('mouseout', canvas_onmouseout, false);
            RGraph.AddEventListener(canvas.id, 'mouseout', canvas_onmouseout);
        
        /**
        * Gantt chart
        */
        } else if (obj.type == 'gantt') {


            /**
            * The onmousedown event handler
            */
            var canvas_onmousedown = function (e)
            {
                var canvas      = e.target;
                var id          = canvas.id;
                var obj         = canvas.__object__;
                var mouseCoords = RGraph.getMouseXY(e);
                var mouseX      = mouseCoords[0];
                var mouseY      = mouseCoords[1];

                for (var i=0; i<obj.coords.length; ++i) {
                    
                    var coordX = obj.coords[i][0];
                    var coordY = obj.coords[i][1];
                    var coordW = obj.coords[i][2];
                    var coordH = obj.coords[i][3];

                    if (mouseX > coordX
                        && mouseX < (coordX + coordW)
                        && mouseY > coordY
                        && mouseY < (coordY + coordH)
                       ) {
                        
                        var mode = (mouseX >= (coordX + coordW - 5) ? 'resize' : 'move');

                        RGraph.Registry.Set('chart.adjusting.gantt', {'index': i,'object': obj,'mousex': mouseX,'mousey': mouseY,'event_start': obj.Get('chart.events')[i][0],'event_duration': obj.Get('chart.events')[i][1],'mode': mode});

                        RGraph.FireCustomEvent(obj, 'onadjustbegin');
                        return;
                    }
                }
            }
            canvas.addEventListener('mousedown', canvas_onmousedown, false);
            RGraph.AddEventListener(canvas.id, 'mousedown', canvas_onmousedown);

            
            /**
            * Change the pointer
            */
            var canvas_onmousemove = function (e)
            {
                var canvas      = e.target;
                var id          = canvas.id;
                var obj         = canvas.__object__;
                var mouseCoords = RGraph.getMouseXY(e);
                var mouseX      = mouseCoords[0];
                var mouseY      = mouseCoords[1];
                
                for (var i=0; i<obj.coords.length; ++i) {
                    
                    var coordX = obj.coords[i][0];
                    var coordY = obj.coords[i][1];
                    var coordW = obj.coords[i][2];
                    var coordH = obj.coords[i][3];

                    if (mouseX > coordX
                        && mouseX < (coordX + coordW)
                        && mouseY > coordY
                        && mouseY < (coordY + coordH)
                       ) {

                       canvas.style.cursor = 'ew-resize';                        
                        return;
                    }
                }
                
                canvas.style.cursor = 'default';
            }
            canvas.addEventListener('mousemove', canvas_onmousemove, false);
            RGraph.AddEventListener(canvas.id, 'mousemove', canvas_onmousemove);








            var window_onmousemove = function (e)
            {
                var conf = RGraph.Registry.Get('chart.adjusting.gantt');

                if (conf) {

                    var obj         = conf['object'];
                    var id          = obj.id;
                    var index       = conf['index'];
                    var startX      = conf['mousex'];
                    var startY      = conf['mousey'];
                    var eventStart  = conf['event_start'];
                    var duration    = conf['event_duration'];
                    var mode        = conf['mode'];
                    var mouseCoords = RGraph.getMouseXY(e);
                    var mouseX      = mouseCoords[0];
                    var mouseY      = mouseCoords[1];
                    
                    RGraph.FireCustomEvent(obj, 'onadjust');

                    if (mode == 'resize') {
                    
                        /**
                        * Account for the right hand gutter. Appears to be a FF bug
                        */
                        if (mouseX > (RGraph.GetWidth(obj) - obj.Get('chart.gutter')) ) {
                            mouseX = RGraph.GetWidth(obj) - obj.Get('chart.gutter');
                        }
                        
                        var diff = ((mouseX - startX) / (RGraph.GetWidth(obj) - (4 * obj.Get('chart.gutter')))) * obj.Get('chart.xmax');
                            diff = Math.round(diff);
                        
                        obj.Get('chart.events')[index][1] = duration + diff;
                        
                        if (obj.Get('chart.events')[index][1] < 0) {
                            obj.Get('chart.events')[index][1] = 1;
                        }

                    } else {

                        var diff = ((mouseX - startX) / (RGraph.GetWidth(obj) - (4 * obj.Get('chart.gutter')))) * obj.Get('chart.xmax');
                        diff = Math.round(diff);

                        if (   eventStart + diff > 0
                            && (eventStart + diff + obj.Get('chart.events')[index][1]) < obj.Get('chart.xmax')) {
    
                            obj.Get('chart.events')[index][0] = eventStart + diff;
                        
                        } else if (eventStart + diff < 0) {
                            obj.Get('chart.events')[index][0] = 0;
                        
                        } else if ((eventStart + diff + obj.Get('chart.events')[index][1]) > obj.Get('chart.xmax')) {
                            obj.Get('chart.events')[index][0] = obj.Get('chart.xmax') - obj.Get('chart.events')[index][1];
                        }
                    }
                    
                    RGraph.Redraw();
                    RGraph.FireCustomEvent(obj, 'onadjust');
                }
            }
            window.addEventListener('mousemove', window_onmousemove, false);
            RGraph.AddEventListener('window_' + canvas.id, 'mousemove', window_onmousemove);








        
        
            var window_onmouseup = function (e)
            {
                if (RGraph.Registry.Get('chart.adjusting.gantt')) {
                
                    var conf = RGraph.Registry.Get('chart.adjusting.gantt');
                    var obj  = conf['object'];
                    var id   = obj.id;

                    RGraph.FireCustomEvent(obj, 'onadjustend');
                    RGraph.Registry.Set('chart.adjusting.gantt', null);
                }
            }
            window.addEventListener('mouseup', window_onmouseup, false);
            RGraph.AddEventListener('window_' + canvas.id, 'mouseup', window_onmouseup);
        }
    }