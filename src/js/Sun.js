import THREE from 'three';

const VERTEX_SHADER = `varying vec3 vNormal;
void main()
{
    vNormal = normalize( normalMatrix * normal );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

const FRAGMENT_SHADER = `uniform float c;
uniform float p;
varying vec3 vNormal;
void main()
{
	float intensity = pow( c - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), p );
	gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 ) * intensity;
}`;

const HALO_MATERIAL = new THREE.ShaderMaterial({
  uniforms: {
    'c': {type: 'f', value: 0.5},
    'p': {type: 'f', value: 3.0}
  },
  vertexShader: VERTEX_SHADER,
  fragmentShader: FRAGMENT_SHADER
});
const HALO_SCALE = 1.5;

const SUN_GEO = new THREE.SphereGeometry(100, 32, 16);
const SUN_MAT = new THREE.MeshBasicMaterial({color: 0xffff00});

class Sun extends THREE.Mesh {

  constructor() {
    super(SUN_GEO, SUN_MAT);

    let halo = new THREE.Mesh(SUN_GEO.clone(), HALO_MATERIAL);
    halo.material.side = THREE.BackSide;
    halo.scale.x = halo.scale.y = halo.scale.z = HALO_SCALE;
    this.add(halo);

    this.light = new THREE.PointLight(0xffffff, 3);
    this.add(this.light);
  }

}
export default Sun;
