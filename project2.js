/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */
// CAGRI CAN SARACAYDIN 30984
// CAGRI CAN SARACAYDIN 30984
// CAGRI CAN SARACAYDIN 30984


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
   
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);
 
	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);
 
	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]
 
	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]
 
	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);
 
	return mvp;
 }
 
 
 class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
 
		this.colorLoc = gl.getUniformLocation(this.prog, 'color');
 
		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
 
		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();
 
		this.numTriangles = 0;
 
		/**
		 * @Task2 : You should initialize the required variables for lighting here
		 */
 
		// lighting locations
		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
		this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
		
		// normal
		this.normBuffer = gl.createBuffer();
		this.normalLoc = gl.getAttribLocation(this.prog, 'normal');
		
		// setting lighting state
		this.lightingEnabled = false;
		this.ambientValue = 0.3; // default
 
		// Add specular lighting uniforms
		this.specularIntensityLoc = gl.getUniformLocation(this.prog, 'specularIntensity');
		this.viewPosLoc = gl.getUniformLocation(this.prog, 'viewPos');
		this.modelMatrixLoc = gl.getUniformLocation(this.prog, 'modelMatrix');
		this.specularIntensity = 1.0;
		
		// setting camera position
		this.viewPos = [0, 0, 5]; 
 
		// texture locs
		this.tex1Loc = gl.getUniformLocation(this.prog, 'tex1');
		this.tex2Loc = gl.getUniformLocation(this.prog, 'tex2');
		this.textureBlendLoc = gl.getUniformLocation(this.prog, 'textureBlend');
		this.texture1 = null;
		this.texture2 = null;
		this.textureBlend = 0.5; // default
	}
 
	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
 
		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
 
		/**
		 * @Task2 : You should update the rest of this function to handle the lighting
		 */

		// update normal coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);
 
		this.numTriangles = vertPos.length / 3;
	}
 
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);
	
		gl.uniformMatrix4fv(this.mvpLoc, false, trans);
		const modelMatrix = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
		gl.uniformMatrix4fv(this.modelMatrixLoc, false, modelMatrix);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		/**
		 * @Task2 : You should update this function to handle the lighting
		 */

		///////////////////////////////
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuffer);
		gl.enableVertexAttribArray(this.normalLoc);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
	
		// set lighting uniforms
		updateLightPos();
		gl.uniform3f(this.lightPosLoc, lightX, lightY, 5.0);
		gl.uniform3fv(this.viewPosLoc, this.viewPos);
		gl.uniform1f(this.specularIntensityLoc, this.specularIntensity);
 
		// binding textures
		if (this.texture1) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture1);
			gl.uniform1i(this.tex1Loc, 0);
		}
		if (this.texture2) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.texture2);
			gl.uniform1i(this.tex2Loc, 1);
		}
	
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}
 
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
 
		// You can set the texture image data using the following command.
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			img);

		// Set texture parameters 
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			//console.error("Task 1: Non power of 2, you should implement this part to accept non power of 2 sized textures");
			/**
			 * @Task1 : You should implement this part to accept non power of 2 sized textures
			 */
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
 
		this.texture1 = texture;
		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(this.tex1Loc, 0);
	}
 
	// task 4 text2
	setTexture2(img) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
 
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			img);
 
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
 
		this.texture2 = texture;
		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(this.tex2Loc, 1);
	}
	//task4 blending
	setTextureBlend(blend) {
		gl.useProgram(this.prog);
		this.textureBlend = blend;
		gl.uniform1f(this.textureBlendLoc, blend);
	}
 
	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}
 
	enableLighting(show) {
		//console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */
		gl.useProgram(this.prog);
		this.lightingEnabled = show;
		gl.uniform1i(this.enableLightingLoc, show);
		
		if (show) {
			const ambientSlider = document.getElementById('ambient-light-setter');
			const specularSlider = document.getElementById('specular-light-setter');
			
			this.setAmbientLight(ambientSlider.value/100);
			this.setSpecularIntensity(specularSlider.value/100);
		}
	}
	
	setAmbientLight(ambient) {
		//console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */
		gl.useProgram(this.prog);
		this.ambientValue = ambient;
		gl.uniform1f(this.ambientLoc, ambient);
	}
 
	setSpecularIntensity(intensity) {
		gl.useProgram(this.prog);
		this.specularIntensity = intensity;
		gl.uniform1f(this.specularIntensityLoc, intensity);
	}
 }
 
 function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
 }
 
 function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
 }
 
 // creating texture blend slider at top
 window.addEventListener('load', function() {
	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.top = '10px';
	container.style.left = '10px';
	container.style.zIndex = '1000';
	container.style.backgroundColor = 'rgba(51, 51, 51, 0.8)';
	container.style.padding = '10px';
	container.style.borderRadius = '5px';
	container.style.color = 'white';
 
	const label = document.createElement('label');
	label.innerHTML = 'Texture Blend: ';
	label.htmlFor = 'textureBlendSlider';
	label.style.marginRight = '10px';
 
	const slider = document.createElement('input');
	slider.type = 'range';
	slider.id = 'textureBlendSlider';
	slider.min = '0';
	slider.max = '100';
	slider.value = '50';
	slider.style.width = '150px';
 
	slider.addEventListener('input', function() {
		meshDrawer.setTextureBlend(this.value / 100);
		DrawScene();
	});
 
	container.appendChild(label);
	container.appendChild(slider);
	document.body.appendChild(container);
 });

 // Vertex shader source code
 const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;
 
			uniform mat4 mvp;
			uniform mat4 modelMatrix;
 
			varying vec2 v_texCoord; 
			varying vec3 v_normal;
			varying vec3 v_fragPos;
 
			void main() {
				v_texCoord = texCoord;
				v_normal = normal;
				v_fragPos = vec3(modelMatrix * vec4(pos, 1.0));
				gl_Position = mvp * vec4(pos, 1.0);
			}`;
 
// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
			precision mediump float;

			uniform bool showTex;
			uniform bool enableLighting;
			uniform sampler2D tex1;
			uniform sampler2D tex2;
			uniform float textureBlend;
			uniform vec3 color;
			uniform vec3 lightPos;
			uniform float ambient;
			uniform float specularIntensity;
			uniform vec3 viewPos;

			varying vec2 v_texCoord;
			varying vec3 v_normal;
			varying vec3 v_fragPos;

			void main() {
				// sample both textures
				vec4 tex1Color = texture2D(tex1, v_texCoord);
				vec4 tex2Color = texture2D(tex2, v_texCoord);
				
				// now blend 
				vec4 blendedColor = mix(tex1Color, tex2Color, textureBlend);
				vec4 baseColor = showTex ? blendedColor : vec4(color, 1.0);
				
				if (enableLighting) {
					vec3 normal = normalize(v_normal);
					vec3 lightDir = normalize(lightPos - v_fragPos);
					
					// Ambient
					vec3 ambient = vec3(ambient) * baseColor.rgb;
					
					// Diffuse
					float diff = max(dot(normal, lightDir), 0.0);
					vec3 diffuse = diff * baseColor.rgb;
					
					// Specular
					vec3 viewDir = normalize(viewPos - v_fragPos);
					vec3 reflectDir = reflect(-lightDir, normal);
					float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
					vec3 specular = specularIntensity * spec * vec3(1.0);
					
					// combinging final vec
					vec3 result = ambient + diffuse + specular;
					gl_FragColor = vec4(result, baseColor.a);
				} else {
					gl_FragColor = baseColor;
				}
			}`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
const translationSpeed = 1;
if (keys['ArrowUp']) lightY -= translationSpeed;
if (keys['ArrowDown']) lightY += translationSpeed;
if (keys['ArrowRight']) lightX -= translationSpeed;
if (keys['ArrowLeft']) lightX += translationSpeed;
}

function SetSpecularLight(param) {
meshDrawer.setSpecularIntensity(param.value/100);
DrawScene();
}

function LoadTexture2(param) {
if (param.files && param.files[0]) {
	var reader = new FileReader();
	reader.onload = function(e) {
		var img = new Image();
		img.src = e.target.result;
		img.onload = function() {
			meshDrawer.setTexture2(img);
			const slider = document.getElementById('textureBlendSlider');
			if (slider) {
				meshDrawer.setTextureBlend(slider.value / 100);
			}
			DrawScene();
		}
	};
	reader.readAsDataURL(param.files[0]);
}
}
///////////////////////////////////////////////////////////////////////////////////