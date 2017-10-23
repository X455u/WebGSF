/* eslint-disable */
import * as THREE from 'three';

function randomPointInUnitSphere() {
  let x1 = 2 * (Math.random() - 0.5);
  let x2 = 2 * (Math.random() - 0.5);
  let x3 = 2 * (Math.random() - 0.5);
  let coef = Math.pow(Math.random(), 1.0 / 3.0) / Math.sqrt(x1*x1 + x2*x2 + x3*x3);
  let result = new THREE.Vector3(x1 * coef, x2 * coef, x3 * coef);
  return result;
}

class SimpleParticleSystem extends THREE.Object3D {

  constructor(options) {
    super();
  	this.options = options || {};

  	// parse options and use defaults
  	this.PARTICLE_COUNT = options.particles || 200;
    this.PARTICLE_CURSOR = 0;

  	this.PARTICLE_SPRITE_TEXTURE = options.particleSpriteTex || null;

    this.options.lifetime = this.options.lifetime || 1.0;

    this.time = 0.0;
    this.offset = 0;
    this.count = 0;
    this.DPR = window.devicePixelRatio;
    this.particleUpdate = false;

    // geometry
    this.particleShaderGeo = new THREE.BufferGeometry();

    this.particleShaderGeo.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'destination', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'size', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'lifeOffset', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ) );

    // material
    this.particleShaderMat = this.particleShaderMat;

  	// custom vertex and fragement shader
  	let GPUParticleShader = {
  		vertexShader: `
  			uniform float uTime;
  			uniform float uScale;
  			uniform float uLifetime;

  			attribute vec3 destination;
  			attribute vec3 color;
  			attribute float size;
        attribute float lifeOffset;

  			varying vec4 vColor;
  			varying float lifeLeft;

  			void main() {
          float lifeUnclamped = uTime / uLifetime;
          float life = lifeUnclamped - float(int(lifeUnclamped)) + lifeOffset;
          if (life > 1.0) life -= 1.0;
  				lifeLeft = 1.0 - life;

          vColor = vec4(color, 1.0);

          vec3 worldPosition = vec3(modelMatrix[3][0], modelMatrix[3][1], modelMatrix[3][2]);

  				gl_PointSize = uScale * size * lifeLeft / distance(worldPosition + position, cameraPosition);
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position + destination * life, 1.0 );
  			}
  		`,
  		fragmentShader: `
        uniform sampler2D tSprite;
  			varying vec4 vColor;
  			varying float lifeLeft;
  			void main() {
  				vec4 tex = texture2D( tSprite, gl_PointCoord );
  				gl_FragColor = vec4( vColor.rgb, lifeLeft * tex.a );
  			}
  		`
  	};

  	let textureLoader = new THREE.TextureLoader();

  	this.particleSpriteTex = this.PARTICLE_SPRITE_TEXTURE || textureLoader.load( './media/particle2.png' );
  	this.particleSpriteTex.wrapS = this.particleSpriteTex.wrapT = THREE.RepeatWrapping;

  	this.particleShaderMat = new THREE.ShaderMaterial( {
  		transparent: true,
  		depthWrite: false,
  		uniforms: {
  			'uTime': {
  				value: 0.0
  			},
  			'uScale': {
  				value: Math.pow(window.innerHeight / 1200, 2)
  			},
  			'tSprite': {
  				value: this.particleSpriteTex
  			},
  			'uLifetime': {
  				value: this.options.lifetime
  			}
  		},
  		blending: THREE.AdditiveBlending,
  		vertexShader: GPUParticleShader.vertexShader,
  		fragmentShader: GPUParticleShader.fragmentShader
  	} );

  	// define defaults for all values
  	this.particleShaderMat.defaultAttributeValues.particlePositionsStartTime = [ 0, 0, 0, 0 ];
  	this.particleShaderMat.defaultAttributeValues.particleVelColSizeLife = [ 0, 0, 0, 0 ];

		let particleSystem = new THREE.Points( this.particleShaderGeo, this.particleShaderMat );
		particleSystem.frustumCulled = false;
		this.add( particleSystem );

    for (let i = 0; i < this.PARTICLE_COUNT; i++) {
      this.spawnParticle(this.options);
    }
  }

  random() {
    return 2 * (Math.random() - 0.5);
  }

	dispose() {
		this.particleShaderMat.dispose();
		this.particleSpriteTex.dispose();
	}

	spawnParticle( options ) {
		let positionAttribute = this.particleShaderGeo.getAttribute( 'position' );
		let destinationAttribute = this.particleShaderGeo.getAttribute( 'destination' );
		let colorAttribute = this.particleShaderGeo.getAttribute( 'color' );
		let sizeAttribute = this.particleShaderGeo.getAttribute( 'size' );
		let lifeOffsetAttribute = this.particleShaderGeo.getAttribute( 'lifeOffset' );

		options = options || {};

		// setup reasonable default values for all arguments
    let position = new THREE.Vector3();
    let destination = new THREE.Vector3();
    let color = new THREE.Color();

		position = options.position !== undefined ? position.copy( options.position ) : position.set( 0, 0, 0 );
		destination = options.destination !== undefined ? destination.copy( options.destination ) : destination.set( 0, 0, 0 );
		color = options.color !== undefined ? color.set( options.color ) : color.set( 0xffffff );

		let positionRandomness = options.positionRandomness !== undefined ? options.positionRandomness : 0;
		let destinationRandomness = options.destinationRandomness !== undefined ? options.destinationRandomness : 0;
		let colorRandomness = options.colorRandomness !== undefined ? options.colorRandomness : 0;
		let size = options.size !== undefined ? options.size : 100;
		let sizeRandomness = options.sizeRandomness !== undefined ? options.sizeRandomness : 0;
		let smoothPosition = options.smoothPosition !== undefined ? options.smoothPosition : false;

		if ( this.DPR !== undefined ) size *= this.DPR;

		let i = this.PARTICLE_CURSOR++;

		// position
		let positionRandomOffset = randomPointInUnitSphere().multiplyScalar(positionRandomness);
		positionAttribute.array[ i * 3 + 0 ] = position.x + positionRandomOffset.x;
		positionAttribute.array[ i * 3 + 1 ] = position.y + positionRandomOffset.y;
		positionAttribute.array[ i * 3 + 2 ] = position.z + positionRandomOffset.z;

		if ( smoothPosition === true ) {
			positionAttribute.array[ i * 3 + 0 ] += - ( destination.x * this.random() );
			positionAttribute.array[ i * 3 + 1 ] += - ( destination.y * this.random() );
			positionAttribute.array[ i * 3 + 2 ] += - ( destination.z * this.random() );
		}

		// destination
		let destinationRandomOffset = randomPointInUnitSphere().multiplyScalar(positionRandomness);
		destinationAttribute.array[ i * 3 + 0 ] = destination.x + destinationRandomOffset.x;
		destinationAttribute.array[ i * 3 + 1 ] = destination.y + destinationRandomOffset.y;
		destinationAttribute.array[ i * 3 + 2 ] = destination.z + destinationRandomOffset.z;

		// color
		color.r = THREE.Math.clamp( color.r + this.random() * colorRandomness, 0, 1 );
		color.g = THREE.Math.clamp( color.g + this.random() * colorRandomness, 0, 1 );
		color.b = THREE.Math.clamp( color.b + this.random() * colorRandomness, 0, 1 );

		colorAttribute.array[ i * 3 + 0 ] = color.r;
		colorAttribute.array[ i * 3 + 1 ] = color.g;
		colorAttribute.array[ i * 3 + 2 ] = color.b;

		// size, lifeOffset
		sizeAttribute.array[ i ] = size + this.random() * sizeRandomness;
		lifeOffsetAttribute.array[ i ] = Math.random();

		this.particleUpdate = true;
	}

	update( delta ) {
    this.time += delta;
    if (this.time > this.options.lifetime) this.time -= this.options.lifetime;
		this.particleShaderMat.uniforms.uTime.value = this.time;
		this.geometryUpdate();
	}

	geometryUpdate() {
		if ( this.particleUpdate === true ) {
			this.particleUpdate = false;

			let positionAttribute = this.particleShaderGeo.getAttribute( 'position' );
			let destinationAttribute = this.particleShaderGeo.getAttribute( 'destination' );
			let colorAttribute = this.particleShaderGeo.getAttribute( 'color' );
			let sizeAttribute = this.particleShaderGeo.getAttribute( 'size' );
			let lifeOffsetAttribute = this.particleShaderGeo.getAttribute( 'lifeOffset' );

			positionAttribute.updateRange.offset = 0;
			destinationAttribute.updateRange.offset = 0;
			colorAttribute.updateRange.offset = 0;
			sizeAttribute.updateRange.offset = 0;
			lifeOffsetAttribute.updateRange.offset = 0;

			// Use -1 to update the entire buffer, see #11476
			positionAttribute.updateRange.count = -1;
			destinationAttribute.updateRange.count = -1;
			colorAttribute.updateRange.count = -1;
			sizeAttribute.updateRange.count = -1;
			lifeOffsetAttribute.updateRange.count = -1;

			positionAttribute.needsUpdate = true;
			destinationAttribute.needsUpdate = true;
			colorAttribute.needsUpdate = true;
			sizeAttribute.needsUpdate = true;
			lifeOffsetAttribute.needsUpdate = true;

			this.offset = 0;
			this.count = 0;
		}
	}

	dispose() {
		this.particleShaderGeo.dispose();
	}

}

export default SimpleParticleSystem;
