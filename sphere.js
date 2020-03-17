export {sphere}
import {hsva} from './torus.js'

	function sphere(row, column, rad, color){
		var pos = new Array(), nor = new Array(),
		    col = new Array(), idx = new Array();
		for(var i = 0; i <= row; i++){
			var r = Math.PI / row * i;
			var ry = Math.cos(r);
			var rr = Math.sin(r);
			for(var ii = 0; ii <= column; ii++){
			    var tr = Math.PI * 2 / column * ii;
			    var tx = rr * rad * Math.cos(tr);
			    var ty = ry * rad;
			    var tz = rr * rad * Math.sin(tr);
			    var rx = rr * Math.cos(tr);
			    var rz = rr * Math.sin(tr);
                            var tc = color;
                            
                            if(!color){
				tc = hsva(360 / row * i, 1, 1, 1);
			    }
			    pos.push(tx, ty, tz);
			    nor.push(rx, ry, rz);
			    col.push(tc[0], tc[1], tc[2], tc[3]);
			}
		}
		r = 0;
		for(i = 0; i < row; i++){
			for(ii = 0; ii < column; ii++){
				r = (column + 1) * i + ii;
				idx.push(r, r + 1, r + column + 2);
				idx.push(r, r + column + 2, r + column + 1);
			}
		}
		return {position : pos, normal : nor, color : col, index : idx};
	}
