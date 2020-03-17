import {create_program, create_shader, create_vbo, create_ibo, get_canvas, get_gl, get_program, set_attributes} from './glutil.js'
import {torus, torus2, hsva} from './torus.js'
import {sphere} from './sphere.js'


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

    let torus_data = torus2(64, 64, 1.0, 2.0)
    const tIndex = torus_data.index
    const tPosition = create_vbo(gl, torus_data.position);
    const tNormal = create_vbo(gl, torus_data.normal);
    const tColor = create_vbo(gl, torus_data.color);
    const tVBOList = [tPosition, tNormal, tColor]
    const tIbo = create_ibo(gl, tIndex);


    const sphereData = sphere(64, 64, 2.0, [0.25, 0.25, 0.75, 1.0])
    const sPosition = create_vbo(gl, sphereData.position)
    const sNormal = create_vbo(gl, sphereData.normal)
    const sColor = create_vbo(gl, sphereData.color)
    const sIndex = sphereData.index
    const sVBOList = [sPosition, sNormal, sColor]
    const sIbo = create_ibo(gl, sIndex)

    
    // uniformLocationを配列に取得
    const uniLocation = new Array()
    uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix')
    uniLocation[1] = gl.getUniformLocation(prg, 'mMatrix')
    uniLocation[2] = gl.getUniformLocation(prg, 'invMatrix')
    uniLocation[3] = gl.getUniformLocation(prg, 'lightPosition')
    uniLocation[4] = gl.getUniformLocation(prg, 'eyeDirection')
    uniLocation[5] = gl.getUniformLocation(prg, 'ambientColor')
    
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
    let lightPosition = [10.0, 10.8, 5.0]
    let ambientColor = [0.1, 0.1, 0.1, 1.0]
    let eyeDirection = [0.0, 0.0, 20.0]
    
    // カウンタの宣言
    let count = 0;

    gl.uniform3fv(uniLocation[3], lightPosition);
    gl.uniform3fv(uniLocation[4], eyeDirection);        
    gl.uniform4fv(uniLocation[5], ambientColor);        
    
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

        let tx = Math.cos(rad) * 3.5
        let ty = Math.sin(rad) * 3.5
        let tz = Math.sin(rad) * 3.5
        
        set_attributes(gl, tVBOList, attLocation, attStride);        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIbo);
        
        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.translate(mMatrix, [tx, -ty, -tz], mMatrix);
        m.rotate(mMatrix, -rad, [0, 1, 1], mMatrix);        
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);
        
        // uniform変数の登録
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix)
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        
        // モデルの描画
        gl.drawElements(gl.TRIANGLES, tIndex.length, gl.UNSIGNED_SHORT, 0);


        set_attributes(gl, sVBOList, attLocation, attStride)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sIbo);

        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.translate(mMatrix, [-tx, ty, tz], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        m.inverse(mMatrix, invMatrix);

        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation[1], false, mMatrix)
        gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
        gl.drawElements(gl.TRIANGLES, sIndex.length, gl.UNSIGNED_SHORT, 0);
        
        // コンテキストの再描画
        gl.flush();
        
        // ループのために再帰呼び出し
        setTimeout(loop, 1000 / 30);
    }
    loop()
}
