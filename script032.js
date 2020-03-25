import {create_program, create_shader, create_vbo, create_ibo, get_canvas, get_gl, get_program, set_attributes} from './glutil.js'
import {torus, torus2, hsva} from './torus.js'
import {sphere} from './sphere.js'


onload = function(){
    const c = get_canvas('canvas', 300, 300);
    const gl = get_gl(c)

    const prg = get_program(gl, 'vs', 'fs')
    
    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'normal');
    attLocation[2] = gl.getAttribLocation(prg, 'color');


    var attStride = new Array();
    attStride[0] = 3;
    attStride[1] = 3;
    attStride[2] = 4;

    const position = [
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0
    ]
    const color = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ]

    const textureCoord = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ]

    const index = [
        0, 1, 2,
        3, 2, 1
    ]
	
    
    // attributeの要素数を配列に格納
    const torusData = torus2(64, 64, 0.5, 1.5)
    const vPosition = create_vbo(gl, torusData.position)
    const vNormal = create_vbo(gl, torusData.normal)
    const vColor = create_vbo(gl, torusData.color)
    const vIndex = create_ibo(gl, torusData.index)
    const vVBOList = [vPosition, vNormal, vColor]
    
    set_attributes(gl, vVBOList, attLocation, attStride)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex)

    const uniLocations = new Array()
    uniLocations[0] = gl.uniLocations(prg, 'mvpMatrix')
    uniLocations[1] = gl.uniLocations(prg, 'mMatrix')
    uniLocations[2] = gl.uniLocations(prg, 'invMatrix')
    uniLocations[3] = gl.uniLocations(prg, 'lightPosition')
    uniLocations[4] = gl.uniLocations(prg, 'eyeDirection')
    uniLocations[5] = gl.uniLocations(prg, 'ambientColor')            
    
    const m = new matIV();
    const mMatrix   = m.identity(m.create());
    const vMatrix   = m.identity(m.create());
    const pMatrix   = m.identity(m.create());
    const tmpMatrix = m.identity(m.create());
    const mvpMatrix = m.identity(m.create());
    const invMatrix = m.identity(m.create());    

    
    const q = new qtnIV()
    const xQuatanion = q.identity(q.create())
    console.log(xQuatanion)

    const lightPosition = [15.0, 10.0, 15.0]
    const ambientColor = [0.1, 0.1, 0.1, 1.0]
    const cameraPosition = [0.0, 0.0, 10.0]
    const cameraUpDirection = [0.0, 1.0, 0.0]
    
    let count = 0
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE)
    
    const loop = () => {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	count++;
	var rad = (count % 360) * Math.PI / 180;

        // #1
	m.identity(mMatrix);
	m.translate(mMatrix, [0.25, 0.25, -0.25], mMatrix);
	m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
	m.multiply(tmpMatrix, mMatrix, mvpMatrix);

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.disable(gl.BLEND);
	
	gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
	gl.uniform1f(uniLocation[1], 1.0);
	gl.uniform1i(uniLocation[2], 0);
	gl.uniform1i(uniLocation[3], true);
	gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

        // #2
	m.identity(mMatrix);
	m.translate(mMatrix, [-0.25, -0.25, 0.25], mMatrix);
	m.rotate(mMatrix, rad, [0, 0, 1], mMatrix);
	m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        
        gl.bindTexture(gl.TEXTURE_2D, null);
	gl.enable(gl.BLEND);
        
	gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
	gl.uniform1f(uniLocation[1], vertexAlpha);
	gl.uniform1i(uniLocation[2], 0);
	gl.uniform1i(uniLocation[3], false);
	gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
        
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
