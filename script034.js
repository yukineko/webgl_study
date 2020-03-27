import {create_program, create_shader, create_vbo, create_ibo, get_canvas, get_gl, get_program, set_attributes} from './glutil.js'
//import {torus, torus2, hsva} from './torus.js'



function mousemove(event){

}


onload = function(){
    const q = new qtnIV();;
    const qa = q.identity(q.create())
    const qb = q.identity(q.create())
    const qc = q.identity(q.create())
    
    const c = get_canvas('canvas', 500, 500);
    
    const gl = get_gl(c)

    const prg = get_program(gl, 'vs', 'fs')

    const eRange = document.getElementById('range')
    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'normal');
    attLocation[2] = gl.getAttribLocation(prg, 'color');


    var attStride = new Array();
    attStride[0] = 3;
    attStride[1] = 3;
    attStride[2] = 4;

    
    // attributeの要素数を配列に格納
    const torusData = torus(64, 64, 0.5, 1.5, [0.5, 0.5, 0.5, 1.0]);    

    const vPosition = create_vbo(gl, torusData.p)
    const vNormal = create_vbo(gl, torusData.n)
    const vColor = create_vbo(gl, torusData.c)
    const vIndex = create_ibo(gl, torusData.i)
    const vVBOList = [vPosition, vNormal, vColor]


    set_attributes(gl, vVBOList, attLocation, attStride)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex)

    const uniLocations = new Array()
    uniLocations[0] = gl.getUniformLocation(prg, 'mvpMatrix')
    uniLocations[1] = gl.getUniformLocation(prg, 'mMatrix')
    uniLocations[2] = gl.getUniformLocation(prg, 'invMatrix')
    uniLocations[3] = gl.getUniformLocation(prg, 'lightPosition')
    uniLocations[4] = gl.getUniformLocation(prg, 'eyeDirection')
    uniLocations[5] = gl.getUniformLocation(prg, 'ambientColor')            
    
    const m = new matIV();
    const mMatrix   = m.identity(m.create());
    const vMatrix   = m.identity(m.create());
    const pMatrix   = m.identity(m.create());
    const tmpMatrix = m.identity(m.create());
    const mvpMatrix = m.identity(m.create());
    const invMatrix = m.identity(m.create());    

    const qMatrix = m.identity(m.create())
    const lightPosition = [15.0, 10.0, 15.0]
    const ambientColor = [0.1, 0.1, 0.1, 1.0]
    const cameraPosition = [0.0, 0.0, 20.0]
    const cameraUpDirection = [0.0, 1.0, 0.0]
    
    let count = 0
    m.lookAt(cameraPosition, [0, 0, 0], cameraUpDirection, vMatrix);
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE)

    let rad = 0
    const draw = (qtn) => {
        q.toMatIV(qtn, qMatrix)
	m.identity(mMatrix);
	m.multiply(mMatrix, qMatrix, mMatrix);
	m.rotate(mMatrix, rad, [0, 0, -5.0], mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix)
        m.inverse(mMatrix, invMatrix)
        
	gl.uniformMatrix4fv(uniLocations[0], false, mvpMatrix);
	gl.uniformMatrix4fv(uniLocations[1], false, mMatrix);
	gl.uniformMatrix4fv(uniLocations[2], false, invMatrix);
	gl.uniform3fv(uniLocations[3], lightPosition);
	gl.uniform3fv(uniLocations[4], cameraPosition);
	gl.uniform4fv(uniLocations[5], ambientColor);        
	gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);

    }
    
    const loop = () => {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	count++;
	rad = (count % 360) * Math.PI / 90;
        // #1
        let time = eRange.value / 100
        
        q.rotate(rad, [1.0, 0,0], qa)
        draw(qa)
        q.rotate(rad, [0, 1.0, 0], qb)
        draw(qb)
        q.slerp(qa, qb, time, qc)
        draw(qc)
        gl.flush()
        
        setTimeout(loop, 1000 / 30)
    }
    loop()        

    function blend_type(prm) {
        switch(prm){
        case 0:
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            break;
        case 1:
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
            break;
        default:
            break;
        }
    }
    function create_texture(source){
        // イメージオブジェクトの生成
        var img = new Image();
        
        // データのオンロードをトリガーにする
        img.onload = function(){
            // テクスチャオブジェクトの生成
            var tex = gl.createTexture();
            
            // テクスチャをバインドする
            gl.bindTexture(gl.TEXTURE_2D, tex);
            
            // テクスチャへイメージを適用
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            
            // ミップマップを生成
            gl.generateMipmap(gl.TEXTURE_2D);
            
            // テクスチャのバインドを無効化
            gl.bindTexture(gl.TEXTURE_2D, null);
            
            texture = tex;
            console.log('loaded image')
            console.log(texture)
        };
        
        // イメージオブジェクトのソースを指定

        img.src = source;

    }    
}
