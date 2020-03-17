export {torus, torus2, hsva}
function hsva(h, s, v, a){
    if(s > 1 || v > 1 || a > 1){return;}
    var th = h % 360;
    var i = Math.floor(th / 60);
    var f = th / 60 - i;
    var m = v * (1 - s);
    var n = v * (1 - s * f);
    var k = v * (1 - s * (1 - f));
    var color = new Array();
    if(!s > 0 && !s < 0){
        color.push(v, v, v, a); 
    } else {
        var r = new Array(v, n, m, m, k, v);
        var g = new Array(k, v, v, n, m, m);
        var b = new Array(m, m, k, v, v, n);
        color.push(r[i], g[i], b[i], a);
    }
    return color;
}

// トーラスを生成する関数
const  torus = (row, column, irad, orad) => {
    var pos = new Array(), nor = new Array(),
	col = new Array(), idx = new Array();
    for(var i = 0; i <= row; i++){
	var r = Math.PI * 2 / row * i;
	var rr = Math.cos(r);
	var ry = Math.sin(r);
	for(var ii = 0; ii <= column; ii++){
	    var tr = Math.PI * 2 / column * ii;
	    var tx = (rr * irad + orad) * Math.cos(tr);
	    var ty = ry * irad;
	    var tz = (rr * irad + orad) * Math.sin(tr);
	    var rx = rr * Math.cos(tr);
	    var rz = rr * Math.sin(tr);
	    pos.push(tx, ty, tz);
	    nor.push(rx, ry, rz);
	    var tc = hsva(360 / column * ii, 1, 1, 1);
	    col.push(tc[0], tc[1], tc[2], tc[3]);
	}
    }
    for(i = 0; i < row; i++){
	for(ii = 0; ii < column; ii++){
	    r = (column + 1) * i + ii;
	    idx.push(r, r + column + 1, r + 1);
	    idx.push(r + column + 1, r + column + 2, r + 1);
	}
    }
    return [pos, nor, col, idx];
}

const torus2 = (row, column, irad, orad, color) => {
    var pos = new Array(), nor = new Array(),
	col = new Array(), idx = new Array();
    for(var i = 0; i <= row; i++){
	var r = Math.PI * 2 / row * i;
	var rr = Math.cos(r);
	var ry = Math.sin(r);
	for(var ii = 0; ii <= column; ii++){
	    var tr = Math.PI * 2 / column * ii;
	    var tx = (rr * irad + orad) * Math.cos(tr);
	    var ty = ry * irad;
	    var tz = (rr * irad + orad) * Math.sin(tr);
	    var rx = rr * Math.cos(tr);
	    var rz = rr * Math.sin(tr);
	    if(color){
		var tc = color;
	    }else{
		tc = hsva(360 / column * ii, 1, 1, 1);
	    }
	    pos.push(tx, ty, tz);
	    nor.push(rx, ry, rz);
	    col.push(tc[0], tc[1], tc[2], tc[3]);
	}
    }
    for(i = 0; i < row; i++){
	for(ii = 0; ii < column; ii++){
	    r = (column + 1) * i + ii;
	    idx.push(r, r + column + 1, r + 1);
	    idx.push(r + column + 1, r + column + 2, r + 1);
	}
    }
    return {position : pos, normal : nor, color : col, index : idx};
}
