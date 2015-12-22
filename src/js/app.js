import THREE from 'three';
import Ship from './Ship';

const CAMERA_DISTANCE = 4;

let scene = new THREE.Scene();
let aspect = window.innerWidth / window.innerHeight;
let camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 50);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let ambientLight = new THREE.AmbientLight(0x222222, 0.1);
let light = new THREE.DirectionalLight(0xffffff, 1);
renderer.domElement.setAttribute('tabIndex', '0');
renderer.domElement.focus();

scene.add(ambientLight);
scene.add(light);
camera.position.z = 5;

// prepare loader and load the model
let loader = new THREE.ObjectLoader();
let ship;
loader.load('./media/star-wars-vader-tie-fighter.json', function(object) {
  ship = new Ship(object);
  scene.add(ship);
});

// Format debugging text
let text = document.createElement('div');
text.style.position = 'absolute';
text.style.width = 100;
text.style.height = 100;
text.style.color = 'white';
text.style.top = 10 + 'px';
text.style.left = 10 + 'px';
text.innerHTML = 'Loading...';
document.body.appendChild(text);

// Terrain testing
let mapX = 200;
let mapY = mapX; // Does not yet work with different x y dimensions
let heightMap = new Array(mapX);
for (let i = 0; i < mapX; i++) {
  heightMap[i] = new Array(mapY);
}
let map = new THREE.Geometry();

for (let x = 0; x < mapX; x++) {
  for (let y = 0; y < mapY; y++) {
    heightMap[x][y] = Math.floor((Math.random() * 8));
    map.vertices.push(new THREE.Vector3(x, y, heightMap[x][y]));
  }
}

for (let x = 0; x < mapX - 1; x++) {
  for (let y = 0; y < mapY - 1; y++) {
    map.faces.push(new THREE.Face3(x * mapY + y + 1, x * mapY + y, (x + 1) * mapX + y));
    map.faces.push(new THREE.Face3((x + 1) * mapY + y + 1, x * mapY + y + 1, (x + 1) * mapX + y));
  }
}
map.computeFaceNormals();

let mapReady = new THREE.Mesh(map, new THREE.MeshNormalMaterial());
scene.add(mapReady);
mapReady.rotation.x = -0.8;
mapReady.position.x = -10;
mapReady.position.y = -10;
mapReady.position.z = -10;

// Game Loop
let render = function() {
  requestAnimationFrame(render);
  let delta = 0.1;

  ship.update(delta);

  // Camera follow
  let direction = new THREE.Vector3(0, 0, 1);
  direction.applyQuaternion(ship.quaternion).setLength(CAMERA_DISTANCE);
  let cameraTargetPosition = ship.position.clone().add(direction);
  camera.position.lerp(cameraTargetPosition, delta);
  camera.quaternion.slerp(ship.quaternion, delta);

  renderer.render(scene, camera);

  //Update debugging text
  text.innerHTML = 'X: ' + ship.position.x +
    '<br/>Y: ' + ship.position.y +
    '<br/>Z: ' + ship.position.z;
};

render();
