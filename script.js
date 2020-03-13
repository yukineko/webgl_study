onload = function(){
	var c = document.getElementById('canvas');
	c.width = 500;
	c.height = 500;

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');

	var prg = create_program(v_shader, f_shader);
	var attLocation = gl.getAttribLocation(prg, 'position');
	var attStride = 3;
	
	// モデル(頂点)データ
	var vertex_position = [
		 0.0, 1.0, 0.0,
		 1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0
	];
	
	var vbo = create_vbo(vertex_position);
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.enableVertexAttribArray(attLocation);
	gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);
	
	// minMatrix.js を用いた行列関連処理
	// matIVオブジェクトを生成
	var m = new matIV();
	
	// 各種行列の生成と初期化
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	
	// ビュー座標変換行列
	m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);
	
	// プロジェクション座標変換行列
	m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);
	
	// 各行列を掛け合わせ座標変換行列を完成させる
	m.multiply(pMatrix, vMatrix, mvpMatrix);
	m.multiply(mvpMatrix, mMatrix, mvpMatrix);
	
	// uniformLocationの取得
	var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
	
	// uniformLocationへ座標変換行列を登録
	gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
	
	// モデルの描画
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	
	// コンテキストの再描画
	gl.flush();
    
    // const canvas  = document.getElementById('canvas')
    // canvas.width = 300
    // canvas.height = 300
    
    // const gl = canvas.getContext('webgl')
    // gl.clearColor(0.0, 0.0, 0.0, 1.0)
    // gl.clearDepth(1.0)
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // const v_shader = create_shader('vs')
    // const f_shader = create_shader('fs')

    // const prg = create_program(v_shader, f_shader)
    // const attLocation = gl.getAttribLocation(prg, 'position')
    // const attStride = 3

    // const vertex_position = [
    //     0.0, 1.0, 0.0,
    //     1.0, 0.0, 0.0,
    //     -1.0, 0.0, 0.0
    // ]

    // let vbo = create_vbo(vertex_position)
    // gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    // gl.enableVertexAttribArray(attLocation)

    // gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0)
    
    // let m = new matIV()
    
    // let mMatrix = m.identity(m.create())
    // let vMatrix = m.identity(m.create())
    // let pMatrix = m.identity(m.create())
    // let mvpMatrix = m.identity(m.create())

    // m.lookAt([0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix )
    // m.perspective(90, canvas.width / canvas.height, 0.1, 100, pMatrix)
    // m.multiply(pMatrix, vMatrix, mvpMatrix)
    // m.multiply(mvpMatrix, mMatrix, mvpMatrix)
    
    // const uniLocation = gl.getUniformLocation(prg, 'mvpMatrix')
    // gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
    // gl.drawArrays(gl.TRIANGLES, 0, 3)
    // gl.flush()

	function create_shader(id){
		// シェーダを格納する変数
		var shader;
		
		// HTMLからscriptタグへの参照を取得
		var scriptElement = document.getElementById(id);
		
		// scriptタグが存在しない場合は抜ける
		if(!scriptElement){return;}
		
		// scriptタグのtype属性をチェック
		switch(scriptElement.type){
			
			// 頂点シェーダの場合
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;
				
			// フラグメントシェーダの場合
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return;
		}
		
		// 生成されたシェーダにソースを割り当てる
		gl.shaderSource(shader, scriptElement.text);
		
		// シェーダをコンパイルする
		gl.compileShader(shader);
		
		// シェーダが正しくコンパイルされたかチェック
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			
			// 成功していたらシェーダを返して終了
			return shader;
		}else{
			
			// 失敗していたらエラーログをアラートする
			alert(gl.getShaderInfoLog(shader));
		}
	}
	
	

    function create_program(vs, fs) {
        let program = gl.createProgram()
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)
        
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program)
            return program
        } else {
            alert(gl.getProgramInfoLog(program))
        }
    }

    function create_vbo(data){
        var vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        return vbo
    }
    
    
}
