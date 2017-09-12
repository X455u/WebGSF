/* eslint-disable */
/*
 * GPU Particle System
 * @author flimshaw - Charlie Hoey - http://charliehoey.com
 * @edited N1cc3 - Niclas Lindgren https://github.com/N1cc3
 *
 * A simple to use, general purpose GPU system. Particles are spawn-and-forget with
 * several options available, and do not require monitoring or cleanup after spawning.
 * Because the paths of all particles are completely deterministic once spawned, the scale
 * and direction of time is also variable.
 *
 * Currently uses a static wrapping perlin noise texture for turbulence, and a small png texture for
 * particles, but adding support for a particle texture atlas or changing to a different type of turbulence
 * would be a fairly light day's work.
 *
 * Shader and javascript packing code derrived from several Stack Overflow examples.
 *
 */
import * as THREE from 'three';

class GPUParticleSystem extends THREE.Object3D {

  constructor(options) {
    super();
  	options = options || {};

  	// parse options and use defaults

  	this.PARTICLE_COUNT = options.maxParticles || 1000000;
  	this.PARTICLE_CONTAINERS = options.containerCount || 1;

  	this.PARTICLE_NOISE_TEXTURE = options.particleNoiseTex || null;
  	this.PARTICLE_SPRITE_TEXTURE = options.particleSpriteTex || null;

  	this.PARTICLES_PER_CONTAINER = Math.ceil( this.PARTICLE_COUNT / this.PARTICLE_CONTAINERS );
  	this.PARTICLE_CURSOR = 0;
  	this.time = 0;
  	this.particleContainers = [];
  	this.rand = [];

  	// custom vertex and fragement shader

  	let GPUParticleShader = {

  		vertexShader: [

  			'uniform float uTime;',
  			'uniform float uScale;',
  			'uniform sampler2D tNoise;',

  			'attribute vec3 positionStart;',
  			'attribute float startTime;',
  			'attribute vec3 velocity;',
  			'attribute float turbulence;',
  			'attribute vec3 color;',
  			'attribute float size;',
  			'attribute float lifeTime;',
  			'attribute float distanceToCamera;',

  			'varying vec4 vColor;',
  			'varying float lifeLeft;',

  			'void main() {',

  			// unpack things from our attributes'

  			'	vColor = vec4( color, 1.0 );',

  			// convert our velocity back into a value we can use'

  			'	vec3 newPosition;',
  			'	vec3 v;',

  			'	float timeElapsed = uTime - startTime;',

  			'	lifeLeft = 1.0 - ( timeElapsed / lifeTime );',

  			'	gl_PointSize = ( uScale * size / distanceToCamera ) * lifeLeft;',

  			'	v.x = ( velocity.x - 0.5 ) * 3.0;',
  			'	v.y = ( velocity.y - 0.5 ) * 3.0;',
  			'	v.z = ( velocity.z - 0.5 ) * 3.0;',

  			'	newPosition = positionStart + ( v * 10.0 ) * timeElapsed;',

  			'	vec3 noise = texture2D( tNoise, vec2( newPosition.x * 0.015 + ( uTime * 0.05 ), newPosition.y * 0.02 + ( uTime * 0.015 ) ) ).rgb;',
  			'	vec3 noiseVel = ( noise.rgb - 0.5 ) * 30.0;',

  			'	newPosition = mix( newPosition, newPosition + vec3( noiseVel * ( turbulence * 5.0 ) ), ( timeElapsed / lifeTime ) );',

  			'	if( v.y > 0. && v.y < .05 ) {',

  			'		lifeLeft = 0.0;',

  			'	}',

  			'	if( v.x < - 1.45 ) {',

  			'		lifeLeft = 0.0;',

  			'	}',

  			'	if( timeElapsed > 0.0 ) {',

  			'		gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );',

  			'	} else {',

  			'		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
  			'		lifeLeft = 0.0;',
  			'		gl_PointSize = 0.;',

  			'	}',

  			'}'

  		].join( '\n' ),

  		fragmentShader: [

  			'float scaleLinear( float value, vec2 valueDomain ) {',

  			'	return ( value - valueDomain.x ) / ( valueDomain.y - valueDomain.x );',

  			'}',

  			'float scaleLinear( float value, vec2 valueDomain, vec2 valueRange ) {',

  			'	return mix( valueRange.x, valueRange.y, scaleLinear( value, valueDomain ) );',

  			'}',

  			'varying vec4 vColor;',
  			'varying float lifeLeft;',

  			'uniform sampler2D tSprite;',

  			'void main() {',

  			'	float alpha = 0.;',

  			'	if( lifeLeft > 0.995 ) {',

  			'		alpha = scaleLinear( lifeLeft, vec2( 1.0, 0.995 ), vec2( 0.0, 1.0 ) );',

  			'	} else {',

  			'		alpha = lifeLeft * 0.75;',

  			'	}',

  			'	vec4 tex = texture2D( tSprite, gl_PointCoord );',
  			'	gl_FragColor = vec4( vColor.rgb * tex.a, alpha * tex.a );',

  			'}'

  		].join( '\n' )

  	};

  	// preload a million random numbers

  	this.i = 0;

  	for (let i = 1e5; i > 0; i-- ) {

  		this.rand.push( Math.random() - 0.5 );

  	}

  	let textureLoader = new THREE.TextureLoader();

  	this.particleNoiseTex = this.PARTICLE_NOISE_TEXTURE || textureLoader.load( './media/perlin-512.png' );
  	this.particleNoiseTex.wrapS = this.particleNoiseTex.wrapT = THREE.RepeatWrapping;

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
  			'tNoise': {
  				value: this.particleNoiseTex
  			},
  			'tSprite': {
  				value: this.particleSpriteTex
  			}
  		},
  		blending: THREE.AdditiveBlending,
  		vertexShader: GPUParticleShader.vertexShader,
  		fragmentShader: GPUParticleShader.fragmentShader
  	} );

  	// define defaults for all values

  	this.particleShaderMat.defaultAttributeValues.particlePositionsStartTime = [ 0, 0, 0, 0 ];
  	this.particleShaderMat.defaultAttributeValues.particleVelColSizeLife = [ 0, 0, 0, 0 ];

    this.init();
  }

  random() {

    return ++ this.i >= this.rand.length ? this.rand[ this.i = 1 ] : this.rand[ this.i ];

  }

	init() {

		for ( let i = 0; i < this.PARTICLE_CONTAINERS; i ++ ) {

			let c = new GPUParticleContainer( this.PARTICLES_PER_CONTAINER, this );
			this.particleContainers.push( c );
			this.add( c );

		}

	}

	spawnParticle( options ) {

		this.PARTICLE_CURSOR ++;

		if ( this.PARTICLE_CURSOR >= this.PARTICLE_COUNT ) {

			this.PARTICLE_CURSOR = 1;

		}

		let currentContainer = this.particleContainers[ Math.floor( this.PARTICLE_CURSOR / this.PARTICLES_PER_CONTAINER ) ];

		currentContainer.spawnParticle( options );

	}

	update( time ) {

		for ( let i = 0; i < this.PARTICLE_CONTAINERS; i ++ ) {

			this.particleContainers[ i ].update( time );

		}

	}

	dispose() {

		this.particleShaderMat.dispose();
		this.particleNoiseTex.dispose();
		this.particleSpriteTex.dispose();

		for ( let i = 0; i < this.PARTICLE_CONTAINERS; i ++ ) {

			this.particleContainers[ i ].dispose();

		}

	}

}


// Subclass for particle containers, allows for very large arrays to be spread out

class GPUParticleContainer extends THREE.Object3D {

  constructor(maxParticles, particleSystem) {
    super();
    this.PARTICLE_COUNT = maxParticles || 100000;
    this.PARTICLE_CURSOR = 0;
    this.time = 0;
    this.offset = 0;
    this.count = 0;
    this.DPR = window.devicePixelRatio;
    this.GPUParticleSystem = particleSystem;
    this.particleUpdate = false;

    // geometry

    this.particleShaderGeo = new THREE.BufferGeometry();

    this.particleShaderGeo.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'positionStart', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'startTime', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'velocity', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'turbulence', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT * 3 ), 3 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'size', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'lifeTime', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ) );
    this.particleShaderGeo.addAttribute( 'distanceToCamera', new THREE.BufferAttribute( new Float32Array( this.PARTICLE_COUNT ), 1 ).setDynamic( true ) );

    // material

    this.particleShaderMat = this.GPUParticleSystem.particleShaderMat;

  	this.init();
  }

	spawnParticle( options ) {

		let positionStartAttribute = this.particleShaderGeo.getAttribute( 'positionStart' );
		let startTimeAttribute = this.particleShaderGeo.getAttribute( 'startTime' );
		let velocityAttribute = this.particleShaderGeo.getAttribute( 'velocity' );
		let turbulenceAttribute = this.particleShaderGeo.getAttribute( 'turbulence' );
		let colorAttribute = this.particleShaderGeo.getAttribute( 'color' );
		let sizeAttribute = this.particleShaderGeo.getAttribute( 'size' );
		let lifeTimeAttribute = this.particleShaderGeo.getAttribute( 'lifeTime' );
		let distanceToCameraAttribute = this.particleShaderGeo.getAttribute( 'distanceToCamera' );

		options = options || {};

		// setup reasonable default values for all arguments

    let position = new THREE.Vector3();
    let velocity = new THREE.Vector3();
    let color = new THREE.Color();

		position = options.position !== undefined ? position.copy( options.position ) : position.set( 0, 0, 0 );
		velocity = options.velocity !== undefined ? velocity.copy( options.velocity ) : velocity.set( 0, 0, 0 );
		color = options.color !== undefined ? color.set( options.color ) : color.set( 0xffffff );

		let positionRandomness = options.positionRandomness !== undefined ? options.positionRandomness : 0;
		let velocityRandomness = options.velocityRandomness !== undefined ? options.velocityRandomness : 0;
		let colorRandomness = options.colorRandomness !== undefined ? options.colorRandomness : 1;
		let turbulence = options.turbulence !== undefined ? options.turbulence : 1;
		let lifetime = options.lifetime !== undefined ? options.lifetime : 5;
		let size = options.size !== undefined ? options.size : 10;
		let sizeRandomness = options.sizeRandomness !== undefined ? options.sizeRandomness : 0;
		let smoothPosition = options.smoothPosition !== undefined ? options.smoothPosition : false;
		let distanceToCamera = options.distanceToCamera !== undefined ? options.distanceToCamera : 0;

		if ( this.DPR !== undefined ) size *= this.DPR;

		let i = this.PARTICLE_CURSOR;

		// position

		positionStartAttribute.array[ i * 3 + 0 ] = position.x + ( this.GPUParticleSystem.random() * positionRandomness );
		positionStartAttribute.array[ i * 3 + 1 ] = position.y + ( this.GPUParticleSystem.random() * positionRandomness );
		positionStartAttribute.array[ i * 3 + 2 ] = position.z + ( this.GPUParticleSystem.random() * positionRandomness );

		if ( smoothPosition === true ) {

			positionStartAttribute.array[ i * 3 + 0 ] += - ( velocity.x * this.GPUParticleSystem.random() );
			positionStartAttribute.array[ i * 3 + 1 ] += - ( velocity.y * this.GPUParticleSystem.random() );
			positionStartAttribute.array[ i * 3 + 2 ] += - ( velocity.z * this.GPUParticleSystem.random() );

		}

		// velocity

		let maxVel = 2;

		let velX = velocity.x + this.GPUParticleSystem.random() * velocityRandomness;
		let velY = velocity.y + this.GPUParticleSystem.random() * velocityRandomness;
		let velZ = velocity.z + this.GPUParticleSystem.random() * velocityRandomness;

		velX = THREE.Math.clamp( ( velX - ( - maxVel ) ) / ( maxVel - ( - maxVel ) ), 0, 1 );
		velY = THREE.Math.clamp( ( velY - ( - maxVel ) ) / ( maxVel - ( - maxVel ) ), 0, 1 );
		velZ = THREE.Math.clamp( ( velZ - ( - maxVel ) ) / ( maxVel - ( - maxVel ) ), 0, 1 );

		velocityAttribute.array[ i * 3 + 0 ] = velX;
		velocityAttribute.array[ i * 3 + 1 ] = velY;
		velocityAttribute.array[ i * 3 + 2 ] = velZ;

		// color

		color.r = THREE.Math.clamp( color.r + this.GPUParticleSystem.random() * colorRandomness, 0, 1 );
		color.g = THREE.Math.clamp( color.g + this.GPUParticleSystem.random() * colorRandomness, 0, 1 );
		color.b = THREE.Math.clamp( color.b + this.GPUParticleSystem.random() * colorRandomness, 0, 1 );

		colorAttribute.array[ i * 3 + 0 ] = color.r;
		colorAttribute.array[ i * 3 + 1 ] = color.g;
		colorAttribute.array[ i * 3 + 2 ] = color.b;

		// turbulence, size, lifetime and starttime

		turbulenceAttribute.array[ i ] = turbulence;
		sizeAttribute.array[ i ] = size + this.GPUParticleSystem.random() * sizeRandomness;
		lifeTimeAttribute.array[ i ] = lifetime;
		startTimeAttribute.array[ i ] = this.time + this.GPUParticleSystem.random() * 2e-2;
    distanceToCameraAttribute.array[ i ] = distanceToCamera;

		// offset

		if ( this.offset === 0 ) {

			this.offset = this.PARTICLE_CURSOR;

		}

		// counter and cursor

		this.count ++;
		this.PARTICLE_CURSOR ++;

		if ( this.PARTICLE_CURSOR >= this.PARTICLE_COUNT ) {

			this.PARTICLE_CURSOR = 0;

		}

		this.particleUpdate = true;

	}

	init() {

		let particleSystem = new THREE.Points( this.particleShaderGeo, this.particleShaderMat );
		particleSystem.frustumCulled = false;
		this.add( particleSystem );

	};

	update( time ) {

		this.time = time;
		this.particleShaderMat.uniforms.uTime.value = time;

		this.geometryUpdate();

	}

	geometryUpdate() {

		if ( this.particleUpdate === true ) {

			this.particleUpdate = false;

			let positionStartAttribute = this.particleShaderGeo.getAttribute( 'positionStart' );
			let startTimeAttribute = this.particleShaderGeo.getAttribute( 'startTime' );
			let velocityAttribute = this.particleShaderGeo.getAttribute( 'velocity' );
			let turbulenceAttribute = this.particleShaderGeo.getAttribute( 'turbulence' );
			let colorAttribute = this.particleShaderGeo.getAttribute( 'color' );
			let sizeAttribute = this.particleShaderGeo.getAttribute( 'size' );
			let lifeTimeAttribute = this.particleShaderGeo.getAttribute( 'lifeTime' );
  		let distanceToCameraAttribute = this.particleShaderGeo.getAttribute( 'distanceToCamera' );

			if ( this.offset + this.count < this.PARTICLE_COUNT ) {

				positionStartAttribute.updateRange.offset = this.offset * positionStartAttribute.itemSize;
				startTimeAttribute.updateRange.offset = this.offset * startTimeAttribute.itemSize;
				velocityAttribute.updateRange.offset = this.offset * velocityAttribute.itemSize;
				turbulenceAttribute.updateRange.offset = this.offset * turbulenceAttribute.itemSize;
				colorAttribute.updateRange.offset = this.offset * colorAttribute.itemSize;
				sizeAttribute.updateRange.offset = this.offset * sizeAttribute.itemSize;
				lifeTimeAttribute.updateRange.offset = this.offset * lifeTimeAttribute.itemSize;
				distanceToCameraAttribute.updateRange.offset = this.offset * distanceToCameraAttribute.itemSize;

				positionStartAttribute.updateRange.count = this.count * positionStartAttribute.itemSize;
				startTimeAttribute.updateRange.count = this.count * startTimeAttribute.itemSize;
				velocityAttribute.updateRange.count = this.count * velocityAttribute.itemSize;
				turbulenceAttribute.updateRange.count = this.count * turbulenceAttribute.itemSize;
				colorAttribute.updateRange.count = this.count * colorAttribute.itemSize;
				sizeAttribute.updateRange.count = this.count * sizeAttribute.itemSize;
				lifeTimeAttribute.updateRange.count = this.count * lifeTimeAttribute.itemSize;
				distanceToCameraAttribute.updateRange.count = this.count * distanceToCameraAttribute.itemSize;

			} else {

				positionStartAttribute.updateRange.offset = 0;
				startTimeAttribute.updateRange.offset = 0;
				velocityAttribute.updateRange.offset = 0;
				turbulenceAttribute.updateRange.offset = 0;
				colorAttribute.updateRange.offset = 0;
				sizeAttribute.updateRange.offset = 0;
				lifeTimeAttribute.updateRange.offset = 0;
				distanceToCameraAttribute.updateRange.offset = 0;

				// Use -1 to update the entire buffer, see #11476
				positionStartAttribute.updateRange.count = -1;
				startTimeAttribute.updateRange.count = -1;
				velocityAttribute.updateRange.count = -1;
				turbulenceAttribute.updateRange.count = -1;
				colorAttribute.updateRange.count = -1;
				sizeAttribute.updateRange.count = -1;
				lifeTimeAttribute.updateRange.count = -1;
				distanceToCameraAttribute.updateRange.count = -1;

			}

			positionStartAttribute.needsUpdate = true;
			startTimeAttribute.needsUpdate = true;
			velocityAttribute.needsUpdate = true;
			turbulenceAttribute.needsUpdate = true;
			colorAttribute.needsUpdate = true;
			sizeAttribute.needsUpdate = true;
			lifeTimeAttribute.needsUpdate = true;
			distanceToCameraAttribute.needsUpdate = true;

			this.offset = 0;
			this.count = 0;

		}

	}

	dispose() {

		this.particleShaderGeo.dispose();

	}

}

export default GPUParticleSystem;
