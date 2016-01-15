import THREE from 'three';

class ParticleSystem {

  constructor(scene) {
    this.emitters = [];
    this.scene = scene;
  }

  update(delta) {
    this.emitters.forEach(emit => {
      this.updateOne(emit, delta);
    });
  }

  createEmitter(options) {
    let emitter = new THREE.Points();
    emitter.geometry = new THREE.Geometry();
    for (let i = 0; i < Math.ceil(options.spawnRate * options.lifetime); i++) {
      let part = options.position.clone(); //new THREE.Vector3(Math.random() * 5, Math.random() * 5, Math.random() * 5);
      part.velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      emitter.geometry.vertices.push(part);
    }
    emitter.material = new THREE.PointsMaterial({
      color: options.color,
      size: options.size
    });
    emitter.position.copy(options.position);
    emitter.spawnRate = options.spawnRate;
    emitter.velocity = options.velocity;
    emitter.iterator = 0;
    this.emitters.push(emitter);
    this.scene.add(emitter);
  }

  updateOne(emit, delta) {
    emit.geometry.vertices.forEach(particle => {
      particle.addScaledVector(particle.velocity, delta);
    });
    let max = (emit.iterator + Math.ceil(emit.spawnRate * delta + 1)) % emit.geometry.vertices.length;
    while (emit.iterator !== max) {
      emit.geometry.vertices[emit.iterator].copy(emit.position);
      emit.iterator = (emit.iterator + 1) % emit.geometry.vertices.length;
    }
    emit.geometry.verticesNeedUpdate = true;
    emit.geometry.computeBoundingSphere();
  }

}

export default ParticleSystem;
