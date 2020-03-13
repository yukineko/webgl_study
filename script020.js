import {create_program, create_shader, create_vbo, create_ibo, get_canvas, get_gl, get_program, set_attributes} from './glutil.js'

const hsva = (h, s, v, a) => {
    if(s > 1 || v > 1 || a > 1){
        return
    }

    const th = h % 360
    const i = Math.floor(th / 60)
    const f = th / 60 - i
    const m = v * (1 - s)
    const n = v * (1 - s * f)
    const k = v * (1 - s * (1 - f))

    const color = new Array()
    if(s === 0){
        color.push(v, v, v, a)
    } else {
        const r = new Array(v, n, m, m, k, v)
        const g = new Array(k, v, v, n, m, m)
        const b = new Array(m, m, k, v, v, n)
        color.push(r[i], g[i], b[i], a)
    }
    return color
}


const torus = (row, column, irad, orad) => {
    const pos = new Array(), col = new Array(), idx = new Array()

    for(let i = 0; i <= row; i++){
        const r = Math.PI * 2 / row * i
        const rr = Math.cos(r)
        const ry = Math.sin(r)

        for(let j = 0; j <= column; j++){
            const tr = Math.PI * 2 / column * j
            const tx = (rr * irad + orad) * Math.cos(tr)
            const ty = ry * irad
            const tz = (rr * irad + orad) * Math.sin(tr)
            pos.push(tx, ty, tz)

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
    return [pos, col, idx]
}

onload = function(){
    const c = get_canvas('canvas', 500, 500);
    const gl = get_gl(c)
    const prg = get_program(gl, 'vs', 'fs')

    const attrLocation = new Array(2)
    attrLocation[0] = gl.getAttribLocation(prg, 'position');
    attrLocation[1] = gl.getAttribLocation(prg, 'color');
    
    const attrStride = new Array(2)
    attrStride[0] = 3
    attrStride[1] = 4

    let torus_data = torus(32, 32, 1.0, 2.0)

    const position = torus_data[0]
    const color = torus_data[1]
    const index = torus_data[2]
    
    const vbo_position = create_vbo(gl, position);
    const vbo_color = create_vbo(gl, color)

    set_attributes(gl, [vbo_position, vbo_color], attrLocation, attrStride)

    const ibo = create_ibo(gl, index)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)

    
    // minMatrix.js を用いた行列関連処理
    // matIVオブジェクトを生成
    var m = new matIV();
    
    // 各種行列の生成と初期化
    const mMatrix = m.identity(m.create())
    const vMatrix = m.identity(m.create())
    const pMatrix = m.identity(m.create())
    const tmpMatrix = m.identity(m.create())
    const mvpMatrix = m.identity(m.create())

    const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
    
    // ビュー座標変換行列 + プロジェクション座標変換行列
    m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);

    let count = 0

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
	    
    function loop(){
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clearDepth(1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        count++

        const rad = (count % 360) * Math.PI / 180
        const x = Math.cos(rad)
        const z = Math.sin(rad)

        // #1
        m.identity(mMatrix)
        m.rotate(mMatrix, rad, [0, 1, 1], mMatrix)        
        m.multiply(tmpMatrix, mMatrix, mvpMatrix)
        gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0)

        
        gl.flush()

        setTimeout(loop, 1000 / 20)
    }
    loop()
}
