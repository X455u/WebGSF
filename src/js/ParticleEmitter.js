import THREE from 'three';

class ParticleGroup extends THREE.Points {

  constructor(options) {
    super();
    // Put option values or default
    this.maxParticles = options.particles; // ? options.particles : 500;
    this.color = options.color; // ? options.color : new THREE.Color(0xffffff);
    this.spawnRate = options.spawnRate; // ? options.spawnRate : 100;
    this.lifetime = options.lifetime; // ? options.lifetime : 5.0;
    this.position.copy(options.position); // ? options.position : new THREE.Vector3(0, 0, 0);
    this.velocity = options.velocity; // ? options.velocity : new THREE.Vector3(
      //Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    let particles = new THREE.Geometry();
    for (let p = 0; p < 100000; p++) {
      let part = new THREE.Vector3(Math.random(), Math.random(), Math.random());
      part.velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      particles.vertices.push(part);
    }
    let particleSystem = new THREE.Points(
      particles,
      new THREE.PointsMaterial({
        color: 0x00ff00,
        size: 0.1
      })
    );
    scene.add(particleSystem);
    // this.geometry = new THREE.BufferGeometry();
    // this.positions = new Float32Array(this.maxParticles * 3);
    // this.velocities = new Float32Array(this.maxParticles * 3);
    // this.colors = new Float32Array(this.maxParticles * 3);
    // for (var i = 0; i < this.positions.length; i += 3) {
    //   this.positions[i + 0] = this.position.x;
    //   this.positions[i + 1] = this.position.y;
    //   this.positions[i + 2] = this.position.z;
    //   this.velocities[i + 0] = this.velocity.x;
    //   this.velocities[i + 1] = this.velocity.y;
    //   this.velocities[i + 2] = this.velocity.z;
    //   this.colors[i + 0] = this.color.r;
    //   this.colors[i + 1] = this.color.g;
    //   this.colors[i + 2] = this.color.b;
    // }
    // this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    // this.geometry.addAttribute('velocity', new THREE.BufferAttribute(this.velocities, 3));
    // this.geometry.addAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    // this.geometry.needsUpdate();
    // this.geometry.computeBoundingSphere();
    //
    // this.material = new THREE.PointsMaterial({vertexColors: THREE.VertexColors});
  }

  update(delta) {
    for (var i = 0; i < this.positions.length; i += 3) {
      // this.velocities[i + 0] = this.acceleration.x;
      // this.velocities[i + 1] = this.acceleration.y;
      // this.velocities[i + 2] = this.acceleration.z;
      this.positions[i + 0] = this.position.x + this.velocity.x * delta;
      this.positions[i + 1] = this.position.y + this.velocity.y * delta;
      this.positions[i + 2] = this.position.z + this.velocity.z * delta;
      // this.colors[i + 0] = this.color.r;
      // this.colors[i + 1] = this.color.g;
      // this.colors[i + 2] = this.color.b;
    }
    this.geometry.getAttribute('position').set(this.positions);
    this.geometry.getAttribute('position').needsUpdate();
    this.geometry.computeBoundingSphere();
  }

  setMaterial(material) {
    this.material = material;
    // Update emitter?
  }

}

export default ParticleGroup;
