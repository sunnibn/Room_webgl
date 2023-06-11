// vertex shader program
var VSHADER_SOURCE =
  //attributes
  'attribute vec4 Position;\n' +
  'attribute vec4 Color;\n' +
  'attribute vec4 Normal;\n' +
  'attribute vec2 TexCoord;\n' +
  //matrix
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  //lighting, color, texture
  'uniform vec3 u_LightColor;\n' + // Deffuse light color
  'uniform vec3 u_AmbientLight;\n' + // Ambient light color
  'uniform vec3 u_LightPosition;\n' + // Point light sorce position
  'uniform bool u_isLighting;\n' + // enable/disable light
  'varying vec4 v_Color;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * Position;\n' +
  '  if(u_isLighting)\n' +
  '  {\n' +
  '     vec3 lightDirection = normalize(u_LightPosition - vec3(u_ModelMatrix * Position));\n' +
  '     vec3 normal = normalize((u_NormalMatrix * Normal).xyz);\n' +
  '     float nDotL = max(dot(lightDirection, normal), 0.0);\n' +

  '     vec3 ambient = u_AmbientLight * Color.rgb;\n' +
  '     vec3 diffuse = u_LightColor * Color.rgb * nDotL;\n' +// Calculate the color due to diffuse reflection
  '     v_Color = vec4(diffuse + ambient, Color.a);\n' +
  '  }\n' +
  '  else\n' +
  '  {\n' +
  '     v_Color = Color;\n' +
  '  }\n' +
  '  v_TexCoord = TexCoord;\n' +
  '}\n';
// fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform bool u_UseTextures;\n' + // Texture enable/disable flag
  'uniform sampler2D u_Sampler;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  if (u_UseTextures) {\n' +
  '    vec4 TexColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '    gl_FragColor = TexColor * v_Color;\n' +
  '  } else {\n' +
  '    gl_FragColor = v_Color;\n' +
  '  }\n' +
  '}\n';

//Camera setting variables.
var angle = 90; // camera angle
var r = 30; // camera radius
var x = r * Math.cos(angle * Math.PI / 180);
var y = 20; // camera hight
var z = r * Math.sin(angle * Math.PI / 180);
// Matricies.
var modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();
// Animations
var lastSquareUpdateTime;
// for fan
var fan = false;
var fanRotate = 0.0;
// for tv & remote controller
var tv = false;
var channel = 0;
var off = false;
var red = false;
var blue = false;
var offdown = false;
var reddown = false;
var bluedown = false;
var offbutton = 0;
var redbutton = 0;
var bluebutton = 0;
// for door
var door = false;
var doorangle = 0.0;
// for speaker
var speaker = 0;
var speakerback = false;
// for light effect
var light = true;



function main() {
  // set rendering context "gl"
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get rendering context for WebGL');
    return;
  }
  // initialize vertex and fragment shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return;
  }

  //set texture
  var vnum = 4;
  if (!initTextures(gl, vnum, '../src/floor.jpg', 0)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  if (!initTextures(gl, vnum, '../src/desk.jpg', 1)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  if (!initTextures(gl, vnum, '../src/door.jpg', 2)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  if (!initTextures(gl, vnum, '../src/couch.jpg', 3)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  if (!initTextures(gl, vnum, '../src/channel1.jpg', 4)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  if (!initTextures(gl, vnum, '../src/channel2.jpg', 5)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  if (!initTextures(gl, vnum, '../src/channel3.jpg', 6)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  if (!initTextures(gl, vnum, '../src/wall2.jpg', 7)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  if (!initTextures(gl, vnum, '../src/wall.jpg', 8)) {
    console.log('Failed to intialize the texture.');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clearColor(0.3, 0.4, 0.35, 1.0); //background color
  gl.clear(gl.COLOR_BUFFER_BIT);

  // get the locations of uniform attributes
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_isLighting = gl.getUniformLocation(gl.program, 'u_isLighting');
  if (!u_ModelMatrix || !u_ViewMatrix || !u_ProjMatrix || !u_NormalMatrix ||
    !u_LightColor || !u_AmbientLight ||  !u_LightPosition || !u_isLighting) {
    console.log('Failed to Get the storage locations of uniform attribute');
    return;
  }
  // adjust matricies
  modelMatrix.setTranslate(0,-3,0);
  viewMatrix.setLookAt(x,y,z, 0,0,0, 0,1,0); // initial camera setting
  projMatrix.setPerspective(40, canvas.width/canvas.height, 1, 100); // initial projection setting
  // set matricies into uniform variables
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  // keyboard input
  document.onkeydown = function(evnt) {
    userInput(evnt, gl, u_ModelMatrix, u_ViewMatrix, u_NormalMatrix, u_LightColor,u_AmbientLight,u_LightPosition,u_isLighting, vnum);
  }
  // draw scene repeatedly
  var then = 0;
  function render(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;
    draw(gl, u_ModelMatrix, u_NormalMatrix, u_LightColor,u_AmbientLight,u_LightPosition,u_isLighting)//programInfo, buffers, deltaTime);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// keyboard input function
function userInput(evnt, gl, u_ModelMatrix, u_ViewMatrix, u_NormalMatrix, u_LightColor,u_AmbientLight,u_LightPosition,u_isLighting, vnum) {
  switch (evnt.keyCode) {
    case 38: // Up arrow key
      if (y < 30) { y += 10; }
      break;
    case 40: // Down arrow key
      if (y > 10) { y -= 10; }
      break;
    case 37: // Left arrow key
      angle = (angle + 10) % 360;
      x = r * Math.cos(angle * Math.PI / 180);
      z = r * Math.sin(angle * Math.PI / 180);
      break;
    case 39: // Right arrow key
      angle = (360 + angle - 10) % 360;
      x = r * Math.cos(angle * Math.PI / 180);
      z = r * Math.sin(angle * Math.PI / 180);
      break;
    case 189: // - key
      if (r <= 30) { r += 10;
      x = r * Math.cos(angle * Math.PI / 180);
      z = r * Math.sin(angle * Math.PI / 180); } //max distance 30
      break;
    case 187: // + key
      if (r > 10) { r -= 10;
      x = r * Math.cos(angle * Math.PI / 180);
      z = r * Math.sin(angle * Math.PI / 180); } //min distance 10
      break;
    case 70: // f key
      fan = !fan;
      break;
    case 84: // t key
      if (off || red || blue) { break; }
      off = true;
      offdown = true;
      break;
    case 50: // 2 key
      if (off || red || blue) { break; }
      blue = true;
      bluedown = true;
      break;
    case 49: // 1 key
      if (off || red || blue) { break; }
      red = true;
      reddown = true;
      break;
    case 76: // l key
      light = !light;
      break;
    case 68: // d key
      door = !door;
      break;
    default:
      return;
  }
  viewMatrix.setLookAt(x,y,z, 0,0,0, 0,1,0); // change viewMatrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements); // reset camera
}

var storedMatrix = [];
function pushMatrix(m) {
  var m2 = new Matrix4(m);
  storedMatrix.push(m2);
}
function popMatrix() {
  return storedMatrix.pop();
}



function draw(gl, u_ModelMatrix, u_NormalMatrix, u_LightColor,u_AmbientLight,u_LightPosition,u_isLighting) {
  var vnum;
  // clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // enable use modelMatrix, textures.
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  var u_UseTextures = gl.getUniformLocation(gl.program, 'u_UseTextures');
  if (!u_UseTextures) {
    console.log('Failed to get the storage location for texture map enable flag');
    return;
  }
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location for texture map enable flag');
    return;
  }

  // set animation changes
  if (fan) {
    fanRotate = (fanRotate + 10) % 360;
  }
  if (door) {
    if (doorangle < 90) { doorangle = (doorangle + 5) % 360; }
  } else {
    if (doorangle > 0){ doorangle = (360 + doorangle - 5) % 360; }
  }
  if (off) {
    if (offdown) {
      if (offbutton < 5) { offbutton = offbutton + 1; }
      else { offdown = false; tv = !tv; }
    } else {
      if (offbutton > 0) { offbutton = offbutton - 1; }
      else { off = false; }
    }
  }
  if (red) {
    if (reddown) {
      if (redbutton < 5) { redbutton = redbutton + 1; }
      else { reddown = false; if (tv) { channel = (3 + channel - 1) % 3; } }
    } else {
      if (redbutton > 0) { redbutton = redbutton - 1; }
      else { red = false; }
    }
  }
  if (blue) {
    if (bluedown) {
      if (bluebutton < 5) { bluebutton = bluebutton + 1; }
      else { bluedown = false; if (tv) { channel = (channel + 1) % 3; }}
    } else {
      if (bluebutton > 0) { bluebutton = bluebutton - 1; }
      else { blue = false; }
    }
  }
  if (tv) {
    if (speakerback) {
      if (speaker < 5) { speaker = speaker + 1; }
      else { speakerback = false; }
    } else {
      if (speaker > 0) { speaker = speaker - 1; }
      else { speakerback = true; }
    }
  }

  // set light changes
  gl.uniform1i(u_isLighting, true); // lighting enable/disable (set as true)
  if (light) {
    gl.uniform3f(u_LightColor, 0.8,0.8,0.8);
    gl.uniform3f(u_LightPosition, 0,20,0);
    gl.uniform3f(u_AmbientLight, 0.3,0.3,0.3);
  } else if (tv) {
    gl.uniform3f(u_LightPosition, -10,3,0);
    gl.uniform3f(u_AmbientLight, 0.2,0.2,0.2);
    if (channel === 0) {
      gl.uniform3f(u_LightColor, 0.2,0.1,0.1);
    } else if (channel === 1) {
      gl.uniform3f(u_LightColor, 0.2,0.2,0.2);
    } else {
      gl.uniform3f(u_LightColor, 0,0.2,0.2);
    }
  } else {
    gl.uniform3f(u_LightColor, 0.1,0.1,0.1);
    gl.uniform3f(u_LightPosition, 0,20,0);
    gl.uniform3f(u_AmbientLight, 0.1,0.1,0.1);
  }



  //draw floor
  vnum = initFloorBuffers(gl);
  if (vnum < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  gl.uniform1i(u_Sampler,0);
  gl.uniform1i(u_UseTextures, 1);
  gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);

  //draw walls
  vnum = initWallBuffers(gl, [1,1,1]);
  if (vnum < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  gl.uniform1i(u_Sampler,7);
  //texture walls
  if (!(angle >= 180-45 -30  && angle <= 180+45 +30)) {
    pushMatrix(modelMatrix);
      modelMatrix.translate(-10,5,0);
      modelMatrix.rotate(90,0,1,0);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      g_normalMatrix.setInverseOf(modelMatrix);
      g_normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
  }
  if (!((angle >= 0-45+360 -30 && angle <= 360) || angle <= 0+45 +30)) {
    pushMatrix(modelMatrix);
      modelMatrix.translate(10,5,0);
      modelMatrix.rotate(-90,0,1,0);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      g_normalMatrix.setInverseOf(modelMatrix);
      g_normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
  }
  //side wall
  gl.uniform1i(u_Sampler,8);
  if (!(angle >= 90-45 -30 && angle <= 90+45 +30)) {
    pushMatrix(modelMatrix);
      modelMatrix.translate(0,5,10);
      modelMatrix.rotate(180,0,1,0);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      g_normalMatrix.setInverseOf(modelMatrix);
      g_normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
  }
  //door side walls
  if (!(angle >= 270-45 -30 && angle <= 270+45 +30)) {
    vnum = initDoorWallBuffers(gl, [1,1,1]);
    if (vnum < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    pushMatrix(modelMatrix);
      modelMatrix.translate(0,5,-10);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      g_normalMatrix.setInverseOf(modelMatrix);
      g_normalMatrix.transpose();
      gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
    modelMatrix = popMatrix();
  }

  //draw couch
  vnum = initTextureBoxBuffers(gl);
  if (vnum < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  gl.uniform1i(u_Sampler,3);
  pushMatrix(modelMatrix);
    modelMatrix.translate(7,1,0); //move couch
    modelMatrix.rotate(-90,0,1,0);
    modelMatrix.scale(1.3,1,1.2);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
    pushMatrix(modelMatrix);
      modelMatrix.scale(2,1,1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//sitting
      pushMatrix(modelMatrix);
        modelMatrix.translate(0,1,-1.5);
        modelMatrix.scale(1,2,0.5);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//back
      modelMatrix = popMatrix();
    modelMatrix = popMatrix();
    modelMatrix.scale(0.5,1.5,1.5);
    modelMatrix.translate(-5,0.25,-0.25);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//1st side
    modelMatrix.translate(10,0,0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//2nd side
  modelMatrix = popMatrix();
  //draw small couch1
  pushMatrix(modelMatrix);
    modelMatrix.translate(4,1,-6.5); //move couch
    modelMatrix.rotate(-70,0,1,0);
    modelMatrix.scale(0.7,1,1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
    pushMatrix(modelMatrix);
      modelMatrix.scale(2,1,1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//sitting
      pushMatrix(modelMatrix);
        modelMatrix.translate(0,1,-1.5);
        modelMatrix.scale(1,2,0.5);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//back
      modelMatrix = popMatrix();
    modelMatrix = popMatrix();
    modelMatrix.scale(0.5,1.5,1.5);
    modelMatrix.translate(-5,0.25,-0.25);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//1st side
    modelMatrix.translate(10,0,0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//2nd side
  modelMatrix = popMatrix();
  //draw small couch2
  pushMatrix(modelMatrix);
    modelMatrix.translate(2,1,6.5); //move couch
    modelMatrix.rotate(-160,0,1,0);
    modelMatrix.scale(0.7,1,1);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
    pushMatrix(modelMatrix);
      modelMatrix.scale(2,1,1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//sitting
      pushMatrix(modelMatrix);
        modelMatrix.translate(0,1,-1.5);
        modelMatrix.scale(1,2,0.5);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//back
      modelMatrix = popMatrix();
    modelMatrix = popMatrix();
    modelMatrix.scale(0.5,1.5,1.5);
    modelMatrix.translate(-5,0.25,-0.25);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//1st side
    modelMatrix.translate(10,0,0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//2nd side
  modelMatrix = popMatrix();

  //draw desk
  gl.uniform1i(u_Sampler,1);
  pushMatrix(modelMatrix);
    modelMatrix.translate(0,1,-2); //move desk
    modelMatrix.rotate(90,0,1,0);
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
    pushMatrix(modelMatrix);
      modelMatrix.translate(-1.5,1,0);
      modelMatrix.scale(3.2,0.2,1.2);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //up
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
      modelMatrix.translate(1.5,0,1);
      modelMatrix.scale(0.2,1,0.2);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //1st leg
      modelMatrix.translate(0,0,-2*5);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //2nd leg
      modelMatrix.translate(-6*5,0,0);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //3rd leg
      modelMatrix.translate(0,0,2*5);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //4th leg
    modelMatrix = popMatrix();
  modelMatrix = popMatrix();

  //draw door
  vnum = initDoorBuffers(gl);
  if (vnum < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  gl.uniform1i(u_Sampler,2);
  pushMatrix(modelMatrix);
    modelMatrix.translate(-4-2.4,0,-10);//move door
    modelMatrix.rotate((-1)*doorangle,0,1,0); //open door
    modelMatrix.scale(0.6,0.6,0.6);
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
    pushMatrix(modelMatrix);
      modelMatrix.scale(4,9,0.4);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //up
    modelMatrix = popMatrix();
  modelMatrix = popMatrix();
  gl.uniform1i(u_UseTextures, 0);

  //draw tv
  if (tv) {
    vnum = initScreenBuffers(gl, [1,1,1]);
    gl.uniform3f(u_AmbientLight, 1,1,1);
  } else {
    vnum = initScreenBuffers(gl, [0,0,0]);
    if (light) { gl.uniform3f(u_AmbientLight, 0.2,0.2,0.2); }
    else { gl.uniform3f(u_AmbientLight, 0.1,0.1,0.1); }
  }
  if (vnum < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  pushMatrix(modelMatrix);
    modelMatrix.translate(-10+0.1,6,0);//move tv
    modelMatrix.rotate(90,0,1,0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
    //draw tv screen
    if (channel === 0) { gl.uniform1i(u_Sampler,4); }
    else if (channel === 1) { gl.uniform1i(u_Sampler,5); }
    else { gl.uniform1i(u_Sampler,6); }
    gl.uniform1i(u_UseTextures, 1);
    gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //screen
    gl.uniform1i(u_UseTextures, 0);
    if (tv) { gl.uniform3f(u_AmbientLight, 0.2,0.2,0.2); }
    //draw tv edge
    vnum = initElectroBuffers(gl, [0.2,0.2,0.2]);
    if (vnum < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    pushMatrix(modelMatrix);
      modelMatrix.translate(0,2,0);
      modelMatrix.scale(3,0.1,0.1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //up
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
      modelMatrix.translate(0,-2,0);
      modelMatrix.scale(3,0.1,0.1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //down
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
      modelMatrix.translate(3-0.1,0,0);
      modelMatrix.scale(0.1,2,0.1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //side_right
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
      modelMatrix.translate(-3+0.1,0,0);
      modelMatrix.scale(0.1,2,0.1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //side_left
    modelMatrix = popMatrix();
  modelMatrix = popMatrix();

  //draw remote controller
  pushMatrix(modelMatrix);
    modelMatrix.translate(4,3,0);//move remote controller
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.rotate(20,1,0,0);
    modelMatrix.scale(1.5,1.5,1.5);
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
    //draw remote controller's body
    pushMatrix(modelMatrix);
      modelMatrix.scale(0.5,0.2,0.75);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //body
    modelMatrix = popMatrix();
    //draw red button
    vnum = initButtonBuffers(gl, [1,0.2,0.2]);
    if (vnum < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    pushMatrix(modelMatrix);
      modelMatrix.translate(-0.05,0.25,0.2);//move button
      modelMatrix.translate(0,(-0.025)*redbutton,0);
      modelMatrix.rotate(0,0,1,0);
      modelMatrix.scale(0.4,1,0.4);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //red button
    modelMatrix = popMatrix();
    //draw blue button
    vnum = initButtonBuffers(gl, [0.2,0.2,1]);
    if (vnum < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    pushMatrix(modelMatrix);
      modelMatrix.translate(0.05,0.25,0.2);//move button
      modelMatrix.translate(0,(-0.025)*bluebutton,0);
      modelMatrix.rotate(180,0,1,0);
      modelMatrix.scale(0.4,1,0.4);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //blue button
    modelMatrix = popMatrix();
    //draw exit button
    vnum = initButtonBuffers(gl, [0.4,0.4,0.4]);
    if (vnum < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    pushMatrix(modelMatrix);
      modelMatrix.translate(0,0.25,-0.55);//move button
      modelMatrix.translate(0,(-0.025)*offbutton,0);
      modelMatrix.rotate(90,0,1,0);
      modelMatrix.scale(0.2,1,0.2);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //blue button
    modelMatrix = popMatrix();
  modelMatrix = popMatrix();

  //draw speakers
  gl.uniform1i(u_UseTextures, 0);
  pushMatrix(modelMatrix);
    modelMatrix.translate(-10+1.2,1.2,0);//move speaker
    modelMatrix.rotate(90,0,1,0);
    modelMatrix.scale(0.4,0.4,0.4);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
    //speaker1
    modelMatrix.translate(-12.5,0,0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    pushMatrix(modelMatrix);
      vnum = initSpeakerBuffers(gl);
      if (vnum < 0) {
        console.log('Failed to set the vertex information');
        return;
      }
      if (tv) { gl.uniform3f(u_AmbientLight, 1,1,1); }
      else { gl.uniform3f(u_AmbientLight, 0.1,0.1,0.1); }
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//speaker
      pushMatrix(modelMatrix);
        modelMatrix.translate(0,6,0);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//speaker
      modelMatrix = popMatrix();
      vnum = initSpeakerBodyBuffers(gl);
      if (vnum < 0) {
        console.log('Failed to set the vertex information');
        return;
      }
      if (light) { gl.uniform3f(u_AmbientLight, 0.3,0.3,0.3); }
      else { gl.uniform3f(u_AmbientLight, 0.1,0.1,0.1); }
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//speaker body
      pushMatrix(modelMatrix);
        modelMatrix.translate(0,0,0);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//speaker body
      modelMatrix = popMatrix();
    modelMatrix = popMatrix();
    //speaker2
    modelMatrix.translate(25,0,0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    pushMatrix(modelMatrix);
      vnum = initSpeakerBuffers(gl);
      if (vnum < 0) {
        console.log('Failed to set the vertex information');
        return;
      }
      if (tv) { gl.uniform3f(u_AmbientLight, 1,1,1); }
      else { gl.uniform3f(u_AmbientLight, 0.1,0.1,0.1); }
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//speaker
      pushMatrix(modelMatrix);
        modelMatrix.translate(0,6,0);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//speaker
      modelMatrix = popMatrix();
      vnum = initSpeakerBodyBuffers(gl);
      if (vnum < 0) {
        console.log('Failed to set the vertex information');
        return;
      }
      if (light) { gl.uniform3f(u_AmbientLight, 0.3,0.3,0.3); }
      else { gl.uniform3f(u_AmbientLight, 0.1,0.1,0.1); }
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//speaker body
      pushMatrix(modelMatrix);
        modelMatrix.translate(0,0,0);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);//speaker body
      modelMatrix = popMatrix();
    modelMatrix = popMatrix();
    //speaker movement
    vnum = initWallBuffers(gl, [0,0,0]);
    if (vnum < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    pushMatrix(modelMatrix);
      modelMatrix.translate(0,0,(-0.05)*speaker);
      pushMatrix(modelMatrix);
        modelMatrix.translate(0,2.2,-0.2);
        modelMatrix.scale(0.25,0.95,1);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
      modelMatrix = popMatrix();
      pushMatrix(modelMatrix);
        modelMatrix.translate(-25,2.2,-0.2);
        modelMatrix.scale(0.25,0.95,1);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
      modelMatrix = popMatrix();
    modelMatrix = popMatrix();
  modelMatrix = popMatrix();

  //draw fan
  vnum = initElectroBuffers(gl, [0.2,0.2,0.2]);
  if (vnum < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  pushMatrix(modelMatrix);
    modelMatrix.translate(-6,1,7);//move fan
    modelMatrix.rotate(120,0,1,0);
    g_normalMatrix.setInverseOf(modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);//normal
    pushMatrix(modelMatrix);
      modelMatrix.translate(0,-0.8,0);
      modelMatrix.scale(1,0.2,1);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //fan base
    modelMatrix = popMatrix();
    pushMatrix(modelMatrix);
      modelMatrix.translate(0,1,0);
      modelMatrix.scale(0.2,2,0.2);
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
      gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0); //fan body
    modelMatrix = popMatrix();
    //draw fan wings
    if (light) { vnum = initFanWingBuffers(gl, [0.7,0.7,1, 0.5]); }
    else { vnum = initFanWingBuffers(gl, [0.7,0.7,1, 0.1]); }
    if (vnum < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    pushMatrix(modelMatrix);
      modelMatrix.translate(0,3-0.2,0.21); //move wings
      modelMatrix.rotate(fanRotate,0,0,1);
      pushMatrix(modelMatrix);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
        modelMatrix.rotate(90,0,0,1);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
        modelMatrix.rotate(90,0,0,1);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
        modelMatrix.rotate(90,0,0,1);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawElements(gl.TRIANGLES, vnum, gl.UNSIGNED_BYTE, 0);
      modelMatrix = popMatrix();
    modelMatrix = popMatrix();
  modelMatrix = popMatrix();
}



function initFloorBuffers(gl) {
  var vertex = new Float32Array([
    -10.0, 0.0, -10.0,  10.0, 0.0, -10.0,  10.0, 0.0,10.0,  -10.0, 0.0,10.0 //floor
  ]);
  var color = new Float32Array([
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,
  ]);
  var normal = new Float32Array([
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
  ]);
  var index = new Uint8Array([
    0,1,2, 0,2,3
  ]);
  var texCoords = new Float32Array([
    0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
  ]);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'TexCoord', texCoords, 2, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initWallBuffers(gl, coloring) {
  var vertex = new Float32Array([
    -10.0, -5.0, 0.0,  10.0, -5.0, 0.0,  10.0, 7.0, 0.0,  -10.0, 7.0, 0.0
  ]);
  var temp = [];
  for (let i=0; i<vertex.length/3; i++) { temp = temp.concat(coloring); }
  var color = new Float32Array(temp);
  var normal = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
  ]);
  var index = new Uint8Array([
    0,1,2, 0,2,3
  ]);
  var texCoords = new Float32Array([
    0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
  ]);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'TexCoord', texCoords, 2, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initDoorWallBuffers(gl, coloring) {
  var vertex = new Float32Array([
    -10.0, -5.0, 0.0,  -6.4, -5.0, 0.0,  -6.4, 7.0, 0.0,  -10.0, 7.0, 0.0,
    -6.4, 5.8, 0.0,  -1.6, 5.8, 0.0,  -1.6, 7.0, 0.0,  -6.4, 7.0, 0.0,
    -1.6, -5.0, 0.0,  10.0, -5.0, 0.0,  10.0, 7.0, 0.0,  -1.6, 7.0, 0.0,
  ]);
  var temp = [];
  for (let i=0; i<vertex.length/3; i++) { temp = temp.concat(coloring); }
  var color = new Float32Array(temp);
  var normal = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
  ]);
  var index = new Uint8Array([
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
  ]);
  var texCoords = new Float32Array([
    0.0, 0.0,    0.3, 0.0,   0.3, 1.0,   0.0, 1.0,
    0.5, 0.9,    1.0, 0.9,   1.0, 1.0,   0.5, 1.0,
    0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
  ]);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'TexCoord', texCoords, 2, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initTextureBoxBuffers(gl) {
  var vertex = new Float32Array([
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // back
  ]);
  var temp = [];
  for (let i=0; i<vertex.length/3; i++) { temp = temp.concat([1,1,1]); }
  var color = new Float32Array(temp);
  var normal = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // back
  ]);
  var index = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
 ]);
 var texCoords = new Float32Array([
   0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
   0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
   0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
   0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
   0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
   0.0, 0.0,    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
 ]);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'TexCoord', texCoords, 2, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initDoorBuffers(gl) {
  var vertex = new Float32Array([
    2.0, 2.0, 1.0,  0.0, 2.0, 1.0,  0.0,0.0, 1.0,   2.0,0.0, 1.0, // front
    2.0, 2.0, 1.0,   2.0,0.0, 1.0,   2.0,0.0,-1.0,   2.0, 2.0,-1.0, // right
    2.0, 2.0, 1.0,   2.0, 2.0,-1.0,  0.0, 2.0,-1.0,  0.0, 2.0, 1.0, // up
    0.0, 2.0, 1.0,  0.0, 2.0,-1.0,  0.0,0.0,-1.0,  0.0,0.0, 1.0, // left
    0.0,0.0,-1.0,   2.0,0.0,-1.0,   2.0,0.0, 1.0,  0.0,0.0, 1.0, // down
    2.0,0.0,-1.0,  0.0,0.0,-1.0,  0.0, 2.0,-1.0,   2.0, 2.0,-1.0  // back
  ]);
  var temp = [];
  for (let i=0; i<vertex.length/3; i++) { temp = temp.concat([1.0,1.0,1.0]); }
  var color = new Float32Array(temp);
  var normal = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // back
  ]);
  var index = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
  ]);
  var texCoords = new Float32Array([
    0.0, 0.0,    0.5, 0.0,   0.5, 1.0,   0.0, 1.0,
    0.0, 0.0,    0.1, 0.0,   0.1, 0.1,   0.0, 0.1,
    0.0, 0.0,    0.1, 0.0,   0.1, 0.1,   0.0, 0.1,
    0.0, 0.0,    0.1, 0.0,   0.1, 0.1,   0.0, 0.1,
    0.0, 0.0,    0.1, 0.0,   0.1, 0.1,   0.0, 0.1,
    0.0, 0.0,    0.5, 0.0,   0.5, 1.0,   0.0, 1.0,
  ]);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'TexCoord', texCoords, 2, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initElectroBuffers(gl,coloring) {
  var vertex = new Float32Array([
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // back
  ]);
  var temp = [];
  for (let i=0; i<vertex.length/3; i++) { temp = temp.concat(coloring); }
  var color = new Float32Array(temp);
  var normal = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // back
  ]);
  var index = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
  ]);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initButtonBuffers(gl, coloring) {
  var vertex = new Float32Array([
    0,0.1,1,  0,0.1,-1, -1,0.1,0, // up 0,1,2
    0,-0.1,1,  0,-0.1,-1, -1,-0.1,0, // down 3,4,5
    0,0.1,1,  0,0.1,-1,  0,-0.1,1,  0,-0.1,-1, // right side 6,7,8,9(0,1,3,4)
    0,0.1,1,  -1,0.1,0,  0,-0.1,1,  -1,-0.1,0, // left downward 10,11,12,13()
    0,0.1,-1,  -1,0.1,0,  0,-0.1,-1, -1,-0.1,0, // left upward 14,15,16,17
  ]);
  var temp = [];
  for (let i=0; i<vertex.length/3; i++) { temp = temp.concat(coloring); }
  var color = new Float32Array(temp);
  var normal = new Float32Array([
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // up
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // down
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // right
   -1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  // left down
   -1.0,-1.0, 0.0,  -1.0,-1.0, 0.0,  -1.0,-1.0, 0.0,  -1.0,-1.0, 0.0,  // left down
  ]);
  var index = new Uint8Array([
    0,1,2,  3,4,5,
    6,7,8,  7,8,9,
    10,11,12, 11,12,13,
    14,15,16, 15,16,17,
  ]);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initFanWingBuffers(gl, coloring) {
  var vertex = new Float32Array([
    0,0,0,  0.5,1.5,0,  -0.5,1.5,0, // wing
  ]);
  var temp = [];
  for (let i=0; i<vertex.length/3; i++) { temp = temp.concat(coloring); }
  var color = new Float32Array(temp);
  var normal = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // front
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,  // back
  ]);
  var index = new Uint8Array([
    0,1,2,
  ]);
  // for transparancy
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 4, gl.FLOAT)) return -1; // needs transparancy
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initScreenBuffers(gl, coloring) {
  var vertex = new Float32Array([
    -2.9,-1.9,0,   2.9,-1.9,0,   2.9,1.9,0,   -2.9,1.9,0,
  ]);
  var temp = [];
  for (let i=0; i<vertex.length/3; i++) { temp = temp.concat(coloring); }
  var color = new Float32Array(temp);
  var normal = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0, // front
  ]);
  var index = new Uint8Array([
    0,1,2,  0,2,3
  ]);
  var texCoords = new Float32Array([
    0.0, 0.2,    1.0, 0.2,   1.0, 0.8,   0.0, 0.8,
  ]);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'TexCoord', texCoords, 2, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initSpeakerBuffers(gl) {
  var vertex = new Float32Array([
    2,1,0, 1,2,0, 0,0,-2, //0 0,1,2
    1,2,0, -1,2,0, 0,0,-2, //1 3,4,5
    -1,2,0,  -2,1,0, 0,0,-2, //2 6,7,8
    -2,1,0,  -2,-1,0, 0,0,-2, //3 9,10,11
    -2,-1,0, -1,-2,0, 0,0,-2, //4 12,13,14
    -1,-2,0, 1,-2,0, 0,0,-2, //5 15,16,17
    1,-2,0,  2,-1,0, 0,0,-2, //6 18,19,20
    2,-1,0,  2,1,0, 0,0,-2, //7 21,22,23
  ]);
  var temp = [];
  for (let i=0; i<24; i++) { temp = temp.concat([1,1,0.2]); }
  var color = new Float32Array(temp);
  var normal = new Float32Array([
    -1,-1,1, -1,-1,1, -1,-1,1,  //1 triangle
    0,-1,1, 0,-1,1, 0,-1,1, //2 triangle
    1,-1,1, 1,-1,1, 1,-1,1, //3 triangle
    1,0,1, 1,0,1, 1,0,1, //4 triangle
    1,1,-1, 1,1,-1, 1,1,-1, //5 triangle
    0,1,1, 0,1,1, 0,1,1, //6 triangle
    -1,1,1, -1,1,1, -1,1,1, //7 triangle
    -1,0,1, -1,0,1, -1,0,1, //8 triangle
  ]);
  var index = new Uint8Array([
    0,1,2, 3,4,5, 6,7,8, 9,10,11, 12,13,14, 15,16,17, 18,19,20, 21,22,23, //1~8 color triangles
  ]);

  if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;

  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

  return index.length;
}
function initSpeakerBodyBuffers(gl) {
    var vertex = new Float32Array([
      3,3,0, -3,3,0, -3,-3,0, 3,-3,0, //edges 0,1,2,3
      2,1,0, 1,2,0, -1,2,0, -2,1,0, -2,-1,0, -1,-2,0, 1,-2,0, 2,-1,0,
      //4 5 6 7 8 9 10 11
      3,3,0, -3,3,0, 3,3,-3, -3,3,-3, //12,13,14,15
      -3,3,0, -3,-3,0, -3,3,-3, -3,-3,-3, //16,17,18,19
      -3,-3,0, 3,-3,0, -3,-3,-3, 3,-3,-3, //20,21,22,23
      3,3,0, 3,-3,0, 3,3,-3, 3,-3,-3, //24,25,26,27
      3,3,-3, -3,3,-3, -3,-3,-3, 3,-3,-3, //28,29,30,31
    ]);
    var temp = [];
    for (let i=0; i<32; i++) { temp = temp.concat([0.2,0.2,0.2]); }
    var color = new Float32Array(temp);
    var normal = new Float32Array([
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, //front
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
    ]);
    var index = new Uint8Array([
      0,4,5, 0,5,6, 0,6,1, //1front
      1,6,7, 1,7,8, 1,8,2, //2front
      2,8,9, 2,9,10, 2,10,3, //3front
      3,10,11, 3,11,4, 3,4,0, //4front
      12,13,14, 13,14,15, //top
      16,17,18, 17,18,19, //left
      20,21,22, 21,22,23, //down
      24,25,26, 25,26,27, //right
      28,29,30, 28,30,31 //back
    ]);

    if (!initArrayBuffer(gl, 'Position', vertex, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'Color', color, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'Normal', normal, 3, gl.FLOAT)) return -1;

    var buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

    return index.length;
}



// create buffer object, write data in it, assign buffer to attribute.
function initArrayBuffer (gl, u_attribute, data, num, type) {
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  var FSIZE = data.BYTES_PER_ELEMENT;
  var a_attribute = gl.getAttribLocation(gl.program, u_attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, FSIZE * num, 0);
  gl.enableVertexAttribArray(a_attribute)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return true;
}


// functions for applying textures
function initTextures(gl, n, imgfile, texUnit) {
  // create texture object
  var texF = gl.createTexture();
  if (!texF) {
    console.log('Failed to create the image object');
    return false;
  }
  // get locations of samplers.
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
  // create image object
  var imgF = new Image();
  if (!imgF) {
    console.log('Failed to create the image object');
    return false;
  }

  imgF.onload = function(){ loadTexture(gl, n, texF, u_Sampler, imgF, texUnit); };
  imgF.crossOrigin = '';
  imgF.src = imgfile;

  return true;
}

function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis
  // Choose which texture unit active
  if (texUnit === 0) {
    gl.activeTexture(gl.TEXTURE0);
  } else if (texUnit === 1) {
    gl.activeTexture(gl.TEXTURE1);
  } else if (texUnit === 2) {
    gl.activeTexture(gl.TEXTURE2);
  } else if (texUnit === 3) {
    gl.activeTexture(gl.TEXTURE3);
  } else if (texUnit === 4) {
    gl.activeTexture(gl.TEXTURE4);
  } else if (texUnit === 5) {
    gl.activeTexture(gl.TEXTURE5);
  } else if (texUnit === 6) {
    gl.activeTexture(gl.TEXTURE6);
  } else if (texUnit === 7) {
    gl.activeTexture(gl.TEXTURE7);
  } else if (texUnit === 8) {
    gl.activeTexture(gl.TEXTURE8);
  }
  gl.bindTexture(gl.TEXTURE_2D, texture); // Bind texture object to target

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}
