import {create_program, create_shader, create_vbo, create_ibo, get_canvas, get_gl, get_program, set_attributes} from './glutil.js'
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
	
    // モデル(頂点)データ
    const vertex_position = [
	0.0, 1.0, 0.0,
	1.0, 0.0, 0.0,
	-1.0, 0.0, 0.0,
        0.0, -1.0, 0.0
    ]
    const vertex_color = [
        1.0, 0.0, 0.0, 1.5,
        0.0, 1.0, 0.0, 0.2,
        0.0, 0.0, 1.0, 0.5,
        1.0, 1.0, 1.0, 1.0
    ]
    const index = [
        0,1,2,
        1,2,3
    ]
    
    const vbo_position = create_vbo(gl, vertex_position);
    const vbo_color = create_vbo(gl, vertex_color)

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
    m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);

    let count = 0
    
    function loop(){
        gl.disable(gl.CULL_FACE)
        gl.enable(gl.DEPTH_TEST)
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clearDepth(1.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        count++

        const rad = (count % 360) * Math.PI / 180
        const x = Math.cos(rad)
        const z = Math.sin(rad)

        // #1
        m.identity(mMatrix)
        m.translate(mMatrix, [x, 0.0, z], mMatrix)
        m.rotate(mMatrix, rad, [1, 0, 0], mMatrix)        
        m.multiply(tmpMatrix, mMatrix, mvpMatrix)
        gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0)

        m.identity(mMatrix)
        m.translate(mMatrix, [-x, 0.0, -z], mMatrix)
        m.rotate(mMatrix, rad, [0, 1, 0], mMatrix)        
        m.multiply(tmpMatrix, mMatrix, mvpMatrix)
        gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0)
        
        gl.flush()

        setTimeout(loop, 1000 / 20)
    }
    loop()
}
