import THREE from 'three';

function spawnPointRandomness(r) {
  let p = new THREE.Vector3(
    (Math.random() - 0.5),
    (Math.random() - 0.5),
    (Math.random() - 0.5))
    .normalize()
    .multiplyScalar(r);
  return p;
}

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

    emitter.offset = options.offset;
    emitter.bindTo = options.bindTo;
    emitter.spawnRate = options.spawnRate;
    emitter.lifetime = options.lifetime;
    emitter.velocity = options.velocity;
    emitter.velocityRandomness = options.velocityRandomness;
    emitter.r = options.r;

    emitter.geometry = new THREE.Geometry();
    for (let i = 0; i < Math.ceil(emitter.spawnRate * emitter.lifetime); i++) {
      let part = emitter.bindTo.position.clone();
      part.copy(spawnPointRandomness(emitter.r));
      part.velocity = emitter.velocity.clone();
      part.velocity.multiplyScalar(1 - emitter.velocityRandomness * (2 * Math.random() - 1));
      emitter.geometry.vertices.push(part);
    }

    emitter.material = new THREE.PointsMaterial({
      color: options.color,
      size: options.size
    });

    emitter.iterator = 0;
    emitter.geometry.computeBoundingSphere();

    this.emitters.push(emitter);
    this.scene.add(emitter);
    return emitter;
  }

  updateOne(emit, delta) {
    let max = (emit.iterator + Math.ceil(emit.spawnRate * delta + 1)) % emit.geometry.vertices.length;
    while (emit.iterator !== max) {
      let p = emit.geometry.vertices[emit.iterator];
      p.copy(emit.bindTo.position);
      let offset = emit.offset.clone();
      offset.applyQuaternion(emit.bindTo.quaternion);
      offset.add(spawnPointRandomness(emit.r));
      p.add(offset);
      emit.iterator = (emit.iterator + 1) % emit.geometry.vertices.length;
    }
    emit.geometry.vertices.forEach(particle => {
      particle.addScaledVector(particle.velocity, delta);
    });
    emit.geometry.verticesNeedUpdate = true;
    emit.geometry.computeBoundingSphere();
  }

}

export default ParticleSystem;
