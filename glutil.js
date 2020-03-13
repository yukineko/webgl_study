export {create_program, create_vbo, create_shader}
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
