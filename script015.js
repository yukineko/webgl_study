import {create_program, create_shader, create_vbo, get_canvas, get_gl, get_program} from './glutil.js'
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
	-1.0, 0.0, 0.0
    ]
    const vertex_color = [
        1.0, 0.0, 0.0, 1.5,
        0.0, 1.0, 0.0, 0.2,
        0.0, 0.0, 1.0, 0.5
    ]
    
    const vbo_position = create_vbo(gl, vertex_position);
    const vbo_color = create_vbo(gl, vertex_color)
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_position);
    gl.enableVertexAttribArray(attrLocation[0]);
    gl.vertexAttribPointer(attrLocation[0], attrStride[0], gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo_color);
    gl.enableVertexAttribArray(attrLocation[1]);
    gl.vertexAttribPointer(attrLocation[1], attrStride[1], gl.FLOAT, false, 0, 0);

    // minMatrix.js を用いた行列関連処理
    // matIVオブジェクトを生成
    var m = new matIV();
    
    // 各種行列の生成と初期化
    const mMatrix = m.identity(m.create())
    const vMatrix = m.identity(m.create())
    const pMatrix = m.identity(m.create())

    const mvpMatrix = m.identity(m.create())
    
    // ビュー座標変換行列 
    m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
    
    // プロジェクション座標変換行列
    m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
    
    // 各行列を掛け合わせ座標変換行列を完成させる
    m.multiply(pMatrix, vMatrix, mvpMatrix);
    m.multiply(mvpMatrix, mMatrix, mvpMatrix);
    
    // uniformLocationの取得
    const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
    
    // uniformLocationへ座標変換行列を登録
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
    
    // モデルの描画
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    // コンテキストの再描画
    gl.flush();
}
