import THREE from 'three';

function applyPointRandomness(r) {
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
      this.updateEmitter(emit, delta);
    });
  }

  createEmitter(options) {
    let emitter = new THREE.Points();

    emitter.offset = options.offset;
    emitter.oldPosition = emitter.offset.clone();
    emitter.bindTo = options.bindTo;
    emitter.spawnRate = options.spawnRate;
    emitter.lifetime = options.lifetime;
    emitter.velocity = options.velocity;
    emitter.velocityRandomness = options.velocityRandomness;
    emitter.pointRandomness = options.pointRandomness;

    emitter.geometry = new THREE.Geometry();
    let toSpawn = Math.ceil(emitter.spawnRate * emitter.lifetime);
    for (let i = 0; i < toSpawn; i++) {
      let point = emitter.bindTo.position.clone();
      let offset = emitter.offset.clone();
      offset.applyQuaternion(emitter.bindTo.quaternion);
      if (i === toSpawn - 1) {emitter.oldPosition.copy(point);} // Before randomness
      offset.add(applyPointRandomness(emitter.pointRandomness));
      point.add(offset);
      point.velocity = emitter.velocity.clone();
      point.velocity.multiplyScalar(1 - emitter.velocityRandomness * (2 * Math.random() - 1));
      emitter.geometry.vertices.push(point);
    }

    emitter.material = new THREE.PointsMaterial({
      color: options.color,
      blending: THREE.AdditiveBlending,
      transparent: true,
      map: options.map,
      size: options.size
    });

    emitter.iterator = 0;
    emitter.geometry.computeBoundingSphere();

    this.emitters.push(emitter);
    this.scene.add(emitter);
    return emitter;
  }

  updateEmitter(emit, delta) {
    let n = 0;
    let toSpawn = Math.ceil(emit.spawnRate * delta + 1);
    let max = (emit.iterator + toSpawn) % emit.geometry.vertices.length;
    while (emit.iterator !== max) {
      n++;

      // New position
      let newPoint = emit.bindTo.position.clone();
      let offset = emit.offset.clone();
      offset.applyQuaternion(emit.bindTo.quaternion);
      newPoint.add(offset);
      let point = emit.oldPosition.clone();
      point.lerp(newPoint, n / toSpawn);
      if (n === toSpawn) {emit.oldPosition.copy(point);} // Before randomness
      point.add(applyPointRandomness(emit.pointRandomness));
      emit.geometry.vertices[emit.iterator].copy(point);

      // New velocity
      point.velocity = emit.velocity.clone();
      point.velocity.multiplyScalar(1 - emit.velocityRandomness * (2 * Math.random() - 1));

      emit.iterator = (emit.iterator + 1) % emit.geometry.vertices.length;
    }
    emit.geometry.vertices.forEach(particle => {
      let velocity = particle.velocity.clone();
      velocity.applyQuaternion(emit.bindTo.quaternion);
      particle.addScaledVector(velocity, delta);
    });
    emit.geometry.verticesNeedUpdate = true;
    emit.geometry.computeBoundingSphere();
  }

}

export default ParticleSystem;
