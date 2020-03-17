// sample_011
//
// WebGLで拡散光(ディレクショナルライト)＋環境光(アンビエントライト)＋反射光(スペキュラライト)
import {create_program, create_shader, create_vbo, create_ibo, get_canvas, get_gl, get_program, set_attributes} from './glutil.js'
import {torus, hsva} from './torus.js'
onload = function(){
	// canvasエレメントを取得
    const c = get_canvas('canvas', 500, 500);
    const gl = get_gl(c)

    const prg = get_program(gl, 'vs', 'fs')
	
	// attributeLocationを配列に取得
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'normal');
	attLocation[2] = gl.getAttribLocation(prg, 'color');
	
	// attributeの要素数を配列に格納
	var attStride = new Array();
	attStride[0] = 3;
	attStride[1] = 3;
	attStride[2] = 4;
	
	// トーラスの頂点データを生成
	var torusData = torus(32, 32, 1.0, 2.0);
	var position = torusData[0];
	var normal = torusData[1];
	var color = torusData[2];
	var index = torusData[3];
	
	// VBOの生成
    var pos_vbo = create_vbo(gl, position);
    var nor_vbo = create_vbo(gl, normal);
    var col_vbo = create_vbo(gl, color);
	
	// VBO を登録する
    set_attributes(gl, [pos_vbo, nor_vbo, col_vbo], attLocation, attStride);
	
	// IBOの生成
    var ibo = create_ibo(gl, index);
	
	// IBOをバインドして登録する
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	
	// uniformLocationを配列に取得
	var uniLocation = new Array();
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
	uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');
	uniLocation[3] = gl.getUniformLocation(prg, 'eyeDirection');
	uniLocation[4] = gl.getUniformLocation(prg, 'ambientColor');
	
	// minMatrix.js を用いた行列関連処理
	// matIVオブジェクトを生成
	var m = new matIV();
	
	// 各種行列の生成と初期化
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var tmpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	var invMatrix = m.identity(m.create());
	
	// ビュー×プロジェクション座標変換行列
	m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix);
	m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
	m.multiply(pMatrix, vMatrix, tmpMatrix);
	
	// 平行光源の向き
	var lightDirection = [-0.5, 0.5, 0.5];
	
	// 視点ベクトル
	var eyeDirection = [0.0, 0.0, 20.0];
	
	// 環境光の色
	var ambientColor = [0.1, 0.1, 0.1, 1.0];
	
	// カウンタの宣言
	var count = 0;
	
	// カリングと深度テストを有効にする
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);
	
	// 恒常ループ
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
	
	
	// // トーラスを生成する関数
	// function torus(row, column, irad, orad){
	// 	var pos = new Array(), nor = new Array(),
	// 	    col = new Array(), idx = new Array();
	// 	for(var i = 0; i <= row; i++){
	// 		var r = Math.PI * 2 / row * i;
	// 		var rr = Math.cos(r);
	// 		var ry = Math.sin(r);
	// 		for(var ii = 0; ii <= column; ii++){
	// 			var tr = Math.PI * 2 / column * ii;
	// 			var tx = (rr * irad + orad) * Math.cos(tr);
	// 			var ty = ry * irad;
	// 			var tz = (rr * irad + orad) * Math.sin(tr);
	// 			var rx = rr * Math.cos(tr);
	// 			var rz = rr * Math.sin(tr);
	// 			pos.push(tx, ty, tz);
	// 			nor.push(rx, ry, rz);
	// 			var tc = hsva(360 / column * ii, 1, 1, 1);
	// 			col.push(tc[0], tc[1], tc[2], tc[3]);
	// 		}
	// 	}
	// 	for(i = 0; i < row; i++){
	// 		for(ii = 0; ii < column; ii++){
	// 			r = (column + 1) * i + ii;
	// 			idx.push(r, r + column + 1, r + 1);
	// 			idx.push(r + column + 1, r + column + 2, r + 1);
	// 		}
	// 	}
	// 	return [pos, nor, col, idx];
	// }
	
	// // HSVカラー取得用関数
	// function hsva(h, s, v, a){
	// 	if(s > 1 || v > 1 || a > 1){return;}
	// 	var th = h % 360;
	// 	var i = Math.floor(th / 60);
	// 	var f = th / 60 - i;
	// 	var m = v * (1 - s);
	// 	var n = v * (1 - s * f);
	// 	var k = v * (1 - s * (1 - f));
	// 	var color = new Array();
	// 	if(!s > 0 && !s < 0){
	// 		color.push(v, v, v, a); 
	// 	} else {
	// 		var r = new Array(v, n, m, m, k, v);
	// 		var g = new Array(k, v, v, n, m, m);
	// 		var b = new Array(m, m, k, v, v, n);
	// 		color.push(r[i], g[i], b[i], a);
	// 	}
	// 	return color;
	// }
	
};
