var THREE = require('three');
var THREEx = {
  KeyboardState: require('./threex.keyboardstate'),
  SpaceShips: require('./threex.spaceships')
};

var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var ambientLight = new THREE.AmbientLight(0x222222, 0.1);
var light = new THREE.DirectionalLight(0xffffff, 1);
var keyboard	= new THREEx.KeyboardState(renderer.domElement);
renderer.domElement.setAttribute("tabIndex", "0");
renderer.domElement.focus();

scene.add(ambientLight);
scene.add(light);
camera.position.z = 5;

// prepare loader and load the model
var loader = new THREE.ObjectLoader();
var ship;
loader.load( './media/star-wars-vader-tie-fighter.json', function ( object ) {
  ship = object;
  scene.add( ship );
} );

var render = function () {
  requestAnimationFrame( render );
  var delta = 0.2;
  if( keyboard.pressed('left') ){
    ship.rotation.y -= 1 * delta;
    ship.position.x -= 1 * delta;
  }else if( keyboard.pressed('right') ){
    ship.rotation.y += 1 * delta;
    ship.position.x += 1 * delta;
  }
  if( keyboard.pressed('down') ){
    ship.rotation.x += 1 * delta;
    ship.position.y -= 1 * delta;
  }else if( keyboard.pressed('up') ){
    ship.rotation.x -= 1 * delta;
    ship.position.y += 1 * delta;
  }
  renderer.render( scene, camera );
};

render();
