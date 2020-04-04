import * as THREE from 'three'

///////////////////////////////////
// GJK algorithm
///////////////////////////////////
let MAX_ITERATIONS = 256

function getFarthestPoint(shape, d) { // vertices of shape and direction (normalized)

  // Project all vertices onto shape and get the longest
  let p = shape[0].clone()
  let l = p.dot(d)

  for (let i = 1; i < shape.length; ++i) {
    let q = shape[i].clone()
    let proj = q.dot(d)

    if (proj > l) {
      p = q
      l = proj
    }
  }

  return p
}

function support(shape1, shape2, d) { // vertices of shape 1 and 2 and direction

  // Get some point on the minkowski sum (difference really)
  // Do this by getting the farthest point in d
  let dir = d.clone().normalize()

  let p1 = getFarthestPoint(shape1, dir)
  let p2 = getFarthestPoint(shape2, dir.negate())

  return p1.clone().sub(p2)
}

export default function gjk(shape1, shape2) {
  // Keep track of how many vertices of the simplex are known
  let simplex = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
  let n = 2

  // Use some arbitrary initial direction
  let d = new THREE.Vector3(1, 0, 0)
  simplex[1] = support(shape1, shape2, d)

  // If no points are beyond the origin, the origin is outside the minkowski sum
  // No collision is possible
  if (simplex[1].dot(d) < 0) return false

  // Get another point in the opposite direction of the first
  d = simplex[1].clone().negate()
  simplex[0] = support(shape1, shape2, d)

  // Same story as above
  if (simplex[0].dot(d) < 0) return false

  // Pick a direction perpendiclar to the line
  let tmp = simplex[1].clone().sub(simplex[0])
  let tmp2 = simplex[0].clone().negate()
  d = tmp.clone().cross(tmp2).cross(tmp)

  // We have two points, now we start iterating to get the simplex closer
  // and closer to the origin of the minkowski sum
  // Also we're dealing with floating point numbers and erros, so cap
  // the maximum number of iterations to deal with weird cases
  for (let i = 0; i < MAX_ITERATIONS; ++i) {
    let a = support(shape1, shape2, d)

    // Dejavu
    if (a.dot(d) < 0) return false

    // We still only have a triangle
    // Our goal is to find another point to get a tetrahedron that might
    // enclose the origin
    if (n === 2) {
      let aO = a.clone().negate()

      // Edges we'll be testing and the triangle's normal
      let ab = simplex[0].clone().sub(a)
      let ac = simplex[1].clone().sub(a)
      let abc = ab.clone().cross(ac)

      let abp = ab.clone().cross(abc)

      if (abp.dot(aO) > 0) {
        // Origin lies outside near edge ab
        simplex[1] = simplex[0]
        simplex[0] = a.clone()
        d = ab.clone().cross(aO).cross(ab)

        continue
      }

      let acp = abc.clone().cross(ac)

      if (acp.dot(aO) > 0) {
        // Origin lies outside near edge ac
        simplex[0] = a.clone()
        d = ac.clone().cross(aO).cross(ac)

        continue
      }

      // At this point the origin must be within the triangle
      // However we need to know if it is above or below
      if (abc.dot(aO) > 0) {
        simplex[2] = simplex[1]
        simplex[1] = simplex[0]
        simplex[0] = a.clone()
        d = abc.clone()
      } else {
        simplex[2] = simplex[0]
        simplex[0] = a.clone()
        d = abc.clone().negate()
      }

      // We do however need a tetrahedron to eclose the origin
      n = 3
      continue
    }

    // By now we do have a tetrahedron, start checking if it contains the origin
    let aO = a.clone().negate()
    let ab = simplex[0].clone().sub(a)
    let ac = simplex[1].clone().sub(a)
    let ad = simplex[2].clone().sub(a)

    let abc = ab.clone().cross(ac)
    let acd = ac.clone().cross(ad)
    let adb = ad.clone().cross(ab)

    // Here come some generalized functions that are called by all cases
    // Each case simply rotates the order of the vertices accordingly
    let face = function() {
      if (ab.clone().cross(abc).dot(aO) > 0) {
        // In the region of AB
        simplex[1] = simplex[0]
        simplex[0] = a.clone()
        d = ab.clone().cross(aO).cross(ab)
        n = 2
      } else {
        // In the region of ABC
        simplex[2] = simplex[1]
        simplex[1] = simplex[0]
        simplex[0] = a.clone()
        d = abc.clone()
      }
    }

    let oneFace = function() {
      if (abc.clone().cross(ac).dot(aO) > 0) {
        // In the region of AC
        simplex[0] = a.clone()
        d = ac.clone().cross(aO).cross(ac)
        n = 2
      } else face()
    }

    let twoFaces = function() {
      if (abc.clone().cross(ac).dot(aO) > 0) {
        // Origin is beyond AC from ABCs view
        // Only need to test ACD
        simplex[0] = simplex[1]
        simplex[1] = simplex[2].clone()

        ab = ac
        ac = ad.clone()
        abc = acd.clone()

        oneFace()
      } else face() // At this point we're over ABC or over AB. Revert back to a single face.
    }

    // Check if the point is inside the tetrahedron
    let ABC = 0x1
    let ACD = 0x2
    let ADB = 0x4
    let tests = (abc.dot(aO) > 0 ? ABC : 0) | (acd.dot(aO) > 0 ? ACD : 0) | (adb.dot(aO) > 0 ? ADB : 0)

    // Behind all three faces, collision!
    if (tests === 0) return true

    // Behind one face
    if (tests === ABC) oneFace()
    else if (tests === ACD) {
      // Rotate ACD into ABC
      simplex[0] = simplex[1]
      simplex[1] = simplex[2].clone()

      ab = ac
      ac = ad.clone()
      abc = acd.clone()

      oneFace()
    } else if (tests === ADB) {
      // Rotate ADB into ABC
      simplex[1] = simplex[0]
      simplex[0] = simplex[2].clone()

      ac = ab
      ab = ad.clone()
      abc = adb.clone()

      oneFace()
    } else if (tests === ABC | ACD) twoFaces() // Behind two faces
    else if (tests === ACD | ADB) {
      // Rotate ACD, ADB into ABC, ACD
      tmp = simplex[0]
      simplex[0] = simplex[1]
      simplex[1] = simplex[2]
      simplex[2] = tmp

      tmp = ab
      ab = ac
      ac = ad
      ad = tmp

      abc = acd
      acd = adb.clone()

      twoFaces()
    } else if (tests === ADB | ABC) {
      // Rotate ADB, ABC into ABC, ACD
      tmp = simplex[1]
      simplex[1] = simplex[0]
      simplex[0] = simplex[2]
      simplex[2] = tmp

      tmp = ac
      ac = ab
      ab = ad
      ad = tmp

      acd = abc
      abc = adb.clone()

      twoFaces()
    } else {
      // Well this shouldn't happen
      // What the hell happened here
      // Shitty floating point numbers being shitty I suppose
      // Let's just say things collided
      return true
    }
  }
  // Out of iterations, but we're so damn close, let's just say it's a hit
  return true
}
