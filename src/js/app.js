var THREE = require('three');
var THREEx = {
  KeyboardState: require('./threex.keyboardstate'),
  ObjectLoader: require('./OBJMTLLoader')
};

var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshLambertMaterial();
var ambientLight = new THREE.AmbientLight(0x222222, 0.1);
var light = new THREE.DirectionalLight(0xffffff, 1);
var cube = new THREE.Mesh( geometry, material );
var keyboard	= new THREEx.KeyboardState(renderer.domElement);
renderer.domElement.setAttribute("tabIndex", "0");
renderer.domElement.focus();
cube.rotation.x += 0.4;
scene.add(cube);
scene.add(ambientLight);
scene.add(light);
camera.position.z = 5;

// prepare loader and load the model
var oLoader = new THREEx.ObjectLoader();
oLoader.load('media/SpaceFighter01/SpaceFighter01.obj',
  'media/SpaceFighter01/SpaceFighter01.mtl', function(object) {

  object.position.x = 0;
  object.position.y = 0;
  object.position.z = 0;
  object.scale.set(0.1, 0.1, 0.1);
  scene.add(object);
});


var render = function () {
  requestAnimationFrame( render );
  var delta = 0.2;
  if( keyboard.pressed('left') ){
    cube.rotation.y -= 1 * delta;
    cube.position.x -= 1 * delta;
  }else if( keyboard.pressed('right') ){
    cube.rotation.y += 1 * delta;
    cube.position.x += 1 * delta;
  }
  if( keyboard.pressed('down') ){
    cube.rotation.x += 1 * delta;
    cube.position.y -= 1 * delta;
  }else if( keyboard.pressed('up') ){
    cube.rotation.x -= 1 * delta;
    cube.position.y += 1 * delta;
  }
  renderer.render( scene, camera );
};

render();
