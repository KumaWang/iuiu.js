function MathTools() {
}

MathTools.pointRotate = function(center, p1, angle) {
	var tmp = {};
    var angleHude = -angle * Math.PI / 180;/*角度变成弧度*/
    var x1 = (p1.x - center.x) * Math.cos(angleHude) + (p1.y - center.y) * Math.sin(angleHude) + center.x;
    var y1 = -(p1.x - center.x) * Math.sin(angleHude) + (p1.y - center.y) * Math.cos(angleHude) + center.y;
    tmp.x = x1;
    tmp.y = y1;
    return tmp;
}

MathTools.getDistance = function(p1, p2) {
	var a = p1.x - p2.x;
	var b = p1.y - p2.y;
	var distance = Math.sqrt(a * a + b * b);
	return distance;
}

MathTools.getExtendPoint = function(p1, p2, length) {
	var rotation = MathTools.getAngle(p1, p2);
	var target = MathTools.pointRotate(p1, { x : p1.x, y : p1.y - length }, rotation);
	return target;
}

MathTools.getAngle = function(p1, p2) {
	var xDiff = p2.x - p1.x;
    var yDiff = p2.y - p1.y;

    if (xDiff == 0 && yDiff == 0) return 0;

    var angle = Math.atan2(xDiff, yDiff) * 180 / Math.PI;
    return ((180 - angle) % 360);
}

MathTools.maskPolygon = function(polygon, mask) {
	var v = new [];
	var intersectPoints = MathTools.intersectionPolygons(mask, polygon);
	if (intersectPoints.length % 2 == 0 && intersectPoints.length > 0) {
        for (var c = 0; c < polygon.length; c++) {
            for (var k = intersectPoints.length - 2; k >= 0; k = k - 2) {
                var start = intersectPoints[k];
                var end = intersectPoints[k + 1];

                if (start.reverse) {
                    if (c == start.index) {
                        v.push(end.point);
                    }

                    if (c > start.index && c < end.index + 1) {
                        v.push(polygon[c]);
                    }

                    if (c == start.index) {
                        v.push(start.point);
                    }
                }
                else {
                    if (c > start.index && c < end.index + 1) {
                    }
                    else {
                        v.push(polygon[c]);
                    }

                    if (c == start.index) {
                        v.push(start.point);
                        v.push(end.point);
                    }
                }
            }
        }
	}
	
	return v;
}

MathTools.intersectionPolygons = function(v1, v2) {
	var result = [];
	var temp = false;
	
	for(var i = 0; i < v2.length; i++) {
		var curr = v2[i];
		var next = v2[i == v2.length - 1 ? 0 : 1 ];
		
		var clipPoints = MathTools.clipLineWithPolygon(curr, next, v1);
		for(var x = 0; x < clipPoints.length; i++) {
			result.push({
				index : i,
				point : clipPoints[x].point,
				outside : clipPoints[x].outsdie
			});
		}
	}
	
	return result;
}

MathTools.clipLineWithPolygon = function(point1, point2, polygon_points) {
	// Make lists to hold points of
    // intersection and their t values.
    var intersections = [];
    var t_values = [];

    // Add the segment's starting point.
    //intersections.Add(point1);
    //t_values.Add(0f);
    var starts_outside_polygon =
        !PointIsInPolygon(point1.x, point1.y,
            polygon_points.ToArray());

    // Examine the polygon's edges.
    for (var i1 = 0; i1 < polygon_points.length; i1++)
    {
        // Get the end points for this edge.
        var i2 = (i1 + 1) % polygon_points.length;

        // See where the edge intersects the segment.
        var result = MathTools.findIntersection(point1, point2, polygon_points[i1], polygon_points[i2]);
        
        var lines_intersect = result.lines_intersect, segments_intersect = result.segments_intersect;
        var intersection = result.intersection, close_p1 = result.close_p1, close_p2 = result.close_p2;
        var t1 = result.t1, t2 = result.t2;

        // See if the segment intersects the edge.
        if (segments_intersect)
        {
            // See if we need to record this intersection.

            // Record this intersection.
            intersections.push(intersection);
            t_values.push(t1);
        }
    }

    // Add the segment's ending point.
    //intersections.Add(point2);
    //t_values.Add(1f);

    // Sort the points of intersection by t value.
    var s_array = [];
	for(var i = 0; i < intersections.length; i++) {
		s_array.push({ id : t_values[i], value : intersections[i] });
	}
	s_array.sort(function(a,b){
		return a.id - b.id;
	});
    
    var intersections_array = [];
	for(var i = 0; i < s_array.length; i++) {
		intersections_array.push(s_array[i].value);
	}
	
    // Return the intersections.
    return intersections_array;
}


MathTools.findIntersection = function(p1, p2, p3, p4) {
	var lines_intersect, segments_intersect, intersection, close_p1, close_p2, t1, t2;
	
    // Get the segments' parameters.
    var dx12 = p2.x - p1.x;
    var dy12 = p2.y - p1.y;
    var dx34 = p4.x - p3.x;
    var dy34 = p4.y - p3.y;

    // Solve for t1 and t2
    var denominator = (dy12 * dx34 - dx12 * dy34);
    t1 = ((p1.x - p3.x) * dy34 + (p3.y - p1.y) * dx34) / denominator;
    if (t1 == Number.NEGATIVE_INFINITY || t1 == Number.POSITIVE_INFINITY)
    {
        // The lines are parallel (or close enough to it).
        lines_intersect = false;
        segments_intersect = false;
		intersection = { x : Number.NaN, y : Number.NaN };
        close_p1 = { x : Number.NaN, y : Number.NaN };
        close_p2 = { x : Number.NaN, y : Number.NaN };
        t2 = Number.POSITIVE_INFINITY;
        return;
    }
    lines_intersect = true;

    t2 = ((p3.x - p1.x) * dy12 + (p1.y - p3.y) * dx12) / -denominator;

    // Find the point of intersection.
	intersection = { x : p1.x + dx12 * t1, y : p1.y + dy12 * t1 };

    // The segments intersect if t1 and t2 are between 0 and 1.
    segments_intersect = ((t1 >= 0) && (t1 <= 1) && (t2 >= 0) && (t2 <= 1));

    // Find the closest points on the segments.
    if (t1 < 0) t1 = 0;
    else if (t1 > 1) t1 = 1;

    if (t2 < 0) t2 = 0;
    else if (t2 > 1) t2 = 1;

	close_p1 = { x : p1.x + dx12 * t1, y : p1.y + dy12 * t1 };
	close_p2 = { x : p3.x + dx34 * t2, y : p3.y + dy34 * t2 };
	
	return {
		lines_intersect : lines_intersect,
		segments_intersect : segments_intersect,
		intersection : intersection,
		close_p1 : close_p1,
		close_p2 : close_p2,
		t1 : t1,
		t2 : t2
	};
}

MathTools.pointIsInPolygon = function(x, y, polygon_points) {
    // Get the angle between the point and the
    // first and last vertices.
    var max_point = polygon_points.length - 1;
    var total_angle = MathTool.getAngle2(
        polygon_points[max_point].x, polygon_points[max_point].y,
        x, y,
        polygon_points[0].x, polygon_points[0].y);

    // Add the angles from the point
    // to each other pair of vertices.
    for (var i = 0; i < max_point; i++)
    {
        total_angle += MathTool.getAngle2(
            polygon_points[i].x, polygon_points[i].y,
            x, y,
            polygon_points[i + 1].x, polygon_points[i + 1].y);
    }

    // The total angle should be 2 * PI or -2 * PI if
    // the point is in the polygon and close to zero
    // if the point is outside the polygon.
    return (Math.abs(total_angle) > 0.000001);
}

MathTools.getAngle2 = function(Ax, Ay, Bx, By, Cx, Cy) {
	// Get the dot product.
	var dot_product = MathTools.dotProduct(Ax, Ay, Bx, By, Cx, Cy);

	// Get the cross product.
	var cross_product = MathTools.crossProductLength(Ax, Ay, Bx, By, Cx, Cy);

	// Calculate the angle.
	return Math.atan2(cross_product, dot_product);
}

// Return the dot product AB · BC.
// Note that AB · BC = |AB| * |BC| * Cos(theta).
MathTools.dotProduct = function(Ax, Ay, Bx, By, Cx, Cy) {
	// Get the vectors' coordinates.
	var BAx = Ax - Bx;
	var BAy = Ay - By;
	var BCx = Cx - Bx;
	var BCy = Cy - By;

	// Calculate the dot product.
	return (BAx * BCx + BAy * BCy);
}

MathTools.crossProductLength = function(Ax, Ay, Bx, By, Cx, Cy)
{
    // Get the vectors' coordinates.
    var BAx = Ax - Bx;
    var BAy = Ay - By;
    var BCx = Cx - Bx;
    var BCy = Cy - By;

    // Calculate the Z coordinate of the cross product.
    return (BAx * BCy - BAy * BCx);
}