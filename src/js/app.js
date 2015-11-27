var THREE = require('three');
var THREEx = {
  KeyboardState: require('./threex.keyboardstate')
};

var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 50);
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
var fakeShip = new THREE.Object3D();
loader.load( './media/star-wars-vader-tie-fighter.json', function ( object ) {
  ship = object;
  scene.add( ship );
  // Steer smoothing helpers
  fakeShip.rotation.set(ship.rotation.x, ship.rotation.y, ship.rotation.z);
  ship.velocity = 0;
  ship.maxVelocity = 4;
  ship.acceleration = 2;
} );

// Format debugging text
var text = document.createElement('div');
text.style.position = 'absolute';
text.style.width = 100;
text.style.height = 100;
text.style.color = "white";
text.style.top = 10 + 'px';
text.style.left = 10 + 'px';
text.innerHTML = "Loading..."
document.body.appendChild(text);

// Terrain testing
var mapX = 200;
var mapY = mapX; // Does not yet work with different x y dimensions
var heightMap = new Array(mapX);
for (i = 0; i < mapX; i++) {
	heightMap[i] = new Array(mapY);
}
var map = new THREE.Geometry();

for (x = 0; x < mapX; x++) {
	for (y = 0; y < mapY; y++) {
		heightMap[x][y] = Math.floor((Math.random() * 8));
		map.vertices.push( new THREE.Vector3( x, y, heightMap[x][y] ) );
	}
}

for (x = 0; x < mapX-1; x++) {
	for (y = 0; y < mapY-1; y++) {
		map.faces.push( new THREE.Face3( x*mapY + y+1, x*mapY + y, (x+1)*mapX + y ));
		map.faces.push( new THREE.Face3( (x+1)*mapY + y+1, x*mapY + y+1, (x+1)*mapX + y ));
	}
}
map.computeFaceNormals();

var mapReady = new THREE.Mesh( map, new THREE.MeshNormalMaterial() );
scene.add(mapReady);
mapReady.rotation.x = -0.8
mapReady.position.x = -10;
mapReady.position.y = -10;
mapReady.position.z = -10;

// Ship thrust
var shipThrust = false;
keyboard.domElement.addEventListener('keydown', function(event){
  if (event.repeat) {return;}
  if ( keyboard.eventMatches(event, 'space') ){
    shipThrust = !shipThrust;
  }
});

// Camera follow helper
var fakeCam = new THREE.Object3D();

// Game Loop
var render = function () {
  requestAnimationFrame( render );
  var delta = 0.1;

  // Ship steering
  if( keyboard.pressed('left') ){
    fakeShip.rotateOnAxis(new THREE.Vector3( 0, 0, 1 ), delta);
  }else if( keyboard.pressed('right') ){
    fakeShip.rotateOnAxis(new THREE.Vector3( 0, 0, 1 ), -delta);
  }
  if( keyboard.pressed('down') ){
    fakeShip.rotateOnAxis(new THREE.Vector3( 1, 0, 0 ), delta);
  }else if( keyboard.pressed('up') ){
    fakeShip.rotateOnAxis(new THREE.Vector3( 1, 0, 0 ), -delta);
  }
  ship.quaternion.slerp( fakeShip.quaternion, 0.1 );

  // Ship move
  if (shipThrust) {
    ship.velocity = Math.min( ship.maxVelocity,
      ship.velocity + ship.acceleration * delta );
  } else {
    ship.velocity = Math.max( 0,
      ship.velocity - ship.acceleration * delta )
  };
  ship.translateZ( -ship.velocity * delta );

  // Camera follow
  fakeCam.position.set(ship.position.x, ship.position.y, ship.position.z);
  fakeCam.rotation.set(ship.rotation.x, ship.rotation.y, ship.rotation.z);
  fakeCam.translateZ(4);
  camera.position.set(fakeCam.position.x, fakeCam.position.y, fakeCam.position.z);
  camera.rotation.set(ship.rotation.x, ship.rotation.y, ship.rotation.z);

  renderer.render( scene, camera );

	//Update debugging text
	text.innerHTML = "X: " + ship.position.x +
		"<br/>" + "Y: " + ship.position.y +
		"<br/>" + "Z: " + ship.position.z;
};

render();
