import {create_program, create_shader, create_vbo, create_ibo, get_canvas, get_gl, get_program, set_attributes} from './glutil.js'
import {torus, torus2, hsva} from './torus.js'
import {sphere} from './sphere.js'


onload = function(){
    const elmTransparency = document.getElementById('transparency');    
    const elmAdd          = document.getElementById('add');
    const elmRange = document.getElementById('range')
    
    const c = get_canvas('canvas', 500, 300);
    const gl = get_gl(c)

    const prg = get_program(gl, 'vs', 'fs')
    
    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'color');
    attLocation[2] = gl.getAttribLocation(prg, 'textureCoord');


    var attStride = new Array();
    attStride[0] = 3;
    attStride[1] = 4;
    attStride[2] = 2;

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
    const vPosition = create_vbo(gl, position)
    const vColor = create_vbo(gl, color)
    const vTextureCoord = create_vbo(gl, textureCoord)
    const vIndex = create_ibo(gl, index)
    const vVBOList = [vPosition, vColor, vTextureCoord]
    
    set_attributes(gl, vVBOList, attLocation, attStride)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex)

	var uniLocation = new Array();
	uniLocation[0]  = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1]  = gl.getUniformLocation(prg, 'vertexAlpha');
	uniLocation[2]  = gl.getUniformLocation(prg, 'texture');
	uniLocation[3]  = gl.getUniformLocation(prg, 'useTexture');
	

	var m = new matIV();
	var mMatrix   = m.identity(m.create());
	var vMatrix   = m.identity(m.create());
	var pMatrix   = m.identity(m.create());
	var tmpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	

	m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
	m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
	m.multiply(pMatrix, vMatrix, tmpMatrix);
	

	var texture = null;
	create_texture('texture.png');
	gl.activeTexture(gl.TEXTURE0);
	
	var count = 0;
	    


    
    const loop = () => {
        if(elmTransparency.checked){blend_type(0);}
	if(elmAdd.checked){blend_type(1);}
		
	var vertexAlpha = parseFloat(elmRange.value / 100);
		
	gl.clearColor(0.0, 0.75, 0.75, 1.0);
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
