import {create_program, create_shader, create_vbo, create_ibo, get_canvas, get_gl, get_program, set_attributes} from './glutil.js'
import {torus, hsva} from './torus.js'

onload = function(){
    const c = get_canvas('canvas', 500, 500);
    const gl = get_gl(c)

    const prg = get_program(gl, 'vs', 'fs')
    
    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'normal');
    attLocation[2] = gl.getAttribLocation(prg, 'color');
    
    // attributeの要素数を配列に格納
    var attStride = new Array();
    attStride[0] = 3;
    attStride[1] = 3;
    attStride[2] = 4;

    const attrLocation = new Array()
    attrLocation[0] = gl.getAttribLocation(prg, 'position');
    attrLocation[2] = gl.getAttribLocation(prg, 'normal');    
    attrLocation[2] = gl.getAttribLocation(prg, 'color');
    
    const attrStride = new Array()
    attrStride[0] = 3
    attrStride[1] = 3    
    attrStride[2] = 4

    let torus_data = torus(32, 32, 1.0, 2.0)

    const position = torus_data[0]
    const normal = torus_data[1]
    const color = torus_data[2]
    const index = torus_data[3]
    
    // VBOの生成
    let pos_vbo = create_vbo(gl, position);
    let nor_vbo = create_vbo(gl, normal);
    let col_vbo = create_vbo(gl, color);
    
    // VBO を登録する
    set_attributes(gl, [pos_vbo, nor_vbo, col_vbo], attLocation, attStride);
    
    // IBOの生成
    var ibo = create_ibo(gl, index);
    
    // IBOをバインドして登録する
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    // uniformLocationを配列に取得
    const uniLocation = new Array()
    uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix')
    uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix')
    uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection')
    uniLocation[3] = gl.getUniformLocation(prg, 'eyeDirection')
    uniLocation[4] = gl.getUniformLocation(prg, 'ambientColor')
    
    // minMatrix.js を用いた行列関連処理
    // matIVオブジェクトを生成
    var m = new matIV();
    
    // 各種行列の生成と初期化
    let mMatrix = m.identity(m.create());
    let vMatrix = m.identity(m.create());
    let pMatrix = m.identity(m.create());
    let tmpMatrix = m.identity(m.create());
    let mvpMatrix = m.identity(m.create());
    let invMatrix = m.identity(m.create());

    // ビュー×プロジェクション座標変換行列
    m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);

    // 平行光源の向き
    let lightDirection = [-0.5, 0.5, 0.5];
    let ambientColor = [0.1, 0.1, 0.1, 1.0]
    let eyeDirection = [0.0, 0.0, 20.0]
    
    // カウンタの宣言
    let count = 0;
    
    // カリングと深度テストを有効にする
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);

    function loop(){
        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // カウンタをインクリメントする
        count++;
        
        // カウンタを元にラジアンを算出
        var rad = (count % 360) * Math.PI / 180;
        
        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        
        // モデル座標変換行列から逆行列を生成
        m.inverse(mMatrix, invMatrix);
        
        // uniform変数の登録
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
        gl.uniform3fv(uniLocation[2], lightDirection);
        gl.uniform3fv(uniLocation[3], eyeDirection);        
        gl.uniform4fv(uniLocation[4], ambientColor);        
        
        // モデルの描画
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
        
        // コンテキストの再描画
        gl.flush();
        
        // ループのために再帰呼び出し
        setTimeout(loop, 1000 / 30);
    }
    loop()
}
