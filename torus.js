export {torus, hsva}
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
    
const torus = (row, column, irad, orad) => {
    const pos = new Array(), col = new Array(), idx = new Array(), nor = new Array()

    for(let i = 0; i <= row; i++){
        const r = Math.PI * 2 / row * i
        const rr = Math.cos(r)
        const ry = Math.sin(r)

        for(let j = 0; j <= column; j++){
            const tr = Math.PI * 2 / column * j
            const tx = (rr * irad + orad) * Math.cos(tr)
            const ty = ry * irad
            const tz = (rr * irad + orad) * Math.sin(tr)
            const rx = rr * Math.cos(tr) * 2
            const rz = rr * Math.sin(tr) * 2

            pos.push(tx, ty, tz)
            nor.push(rx, ry, rz)
            let tc = hsva(360 / column * j, 1, 1, 1)
            col.push(tc[0], tc[1], tc[2], tc[3])
        }
    }

    for(let i = 0;i < row; i++){
        for(let j = 0; j < column; j++){
            const r = (column + 1) * i + j
            idx.push(r, r + column + 1, r + 1)
            idx.push(r + column + 1, r + column + 2, r + 1)
        }
    }
    return [pos, nor, col, idx]
}


