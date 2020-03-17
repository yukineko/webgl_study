export {create_program, create_vbo, create_ibo, create_shader, get_canvas, get_gl, get_program, set_attributes}
const get_gl = (canvas) => {
    // webglコンテキストを取得
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    // canvasを初期化する色を設定する
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // canvasを初期化する際の深度を設定する
    gl.clearDepth(1.0);
    
    // canvasを初期化
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    return gl
}

const get_canvas = (id, width, height) => {
    const c = document.getElementById(id);
    c.width = width;
    c.height = height;
    return c
}

const get_program = (gl, v_id, f_id) => {
    const v_shader = create_shader(gl, v_id);
    const f_shader = create_shader(gl, f_id);
    
    let prg = create_program(gl, v_shader, f_shader);
    return prg
}

const create_shader = (gl, id) => {
    // シェーダを格納する変数
    let shader;
    
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



const create_program = (gl, vs, fs) => {
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

const create_vbo = (gl, data) => {
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    return vbo
}

const create_ibo = (gl, data) => {
    const ibo = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    return ibo
}


const set_attributes = (gl, vbos, attrLocations, attrStrides) => {
    for(let i in vbos){
        gl.bindBuffer(gl.ARRAY_BUFFER, vbos[i])
        gl.enableVertexAttribArray(attrLocations[i])
        gl.vertexAttribPointer(attrLocations[i], attrStrides[i], gl.FLOAT, false, 0, 0)
    }
}
