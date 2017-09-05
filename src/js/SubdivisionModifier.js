/* eslint no-console: 0 */
/*
 * THREE.js SUBDIVISION MODIFIER EXAMPLE BY
 *    zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 *
 * SOURCE: https://github.com/mrdoob/three.js/blob/master/examples/js/modifiers/SubdivisionModifier.js
 *
 * REWRITTEN WITH ES6 SYNTAX
 *
 */

import * as THREE from 'three';

const WARNINGS = !true; // Set to true for development
const ABC = ['a', 'b', 'c'];


function getEdge(a, b, map) {
  let vertexIndexA = Math.min(a, b);
  let vertexIndexB = Math.max(a, b);
  let key = vertexIndexA + '_' + vertexIndexB;
  return map[key];
}

function processEdge(a, b, vertices, map, face, metaVertices) {
  let vertexIndexA = Math.min(a, b);
  let vertexIndexB = Math.max(a, b);
  let key = vertexIndexA + '_' + vertexIndexB;
  let edge;

  if (key in map) {
    edge = map[key];
  } else {
    let vertexA = vertices[vertexIndexA];
    let vertexB = vertices[vertexIndexB];
    edge = {
      a: vertexA, // pointer reference
      b: vertexB,
      newEdge: null,
      // aIndex: a, // numbered reference
      // bIndex: b,
      faces: [] // pointers to face
    };
    map[key] = edge;
  }

  edge.faces.push(face);

  metaVertices[a].edges.push(edge);
  metaVertices[b].edges.push(edge);
}

function generateLookups(vertices, faces, metaVertices, edges) {

  let i, il, face;

  for (i = 0, il = vertices.length; i < il; i++) {
    metaVertices[i] = {edges: []};
  }

  for (i = 0, il = faces.length; i < il; i++) {
    face = faces[i];
    processEdge(face.a, face.b, vertices, edges, face, metaVertices);
    processEdge(face.b, face.c, vertices, edges, face, metaVertices);
    processEdge(face.c, face.a, vertices, edges, face, metaVertices);
  }
}

function newFace(newFaces, a, b, c) {
  newFaces.push(new THREE.Face3(a, b, c));
}


class SubdivisionModifier {
  constructor(subdivisions) {
    this.subdivisions = (subdivisions === undefined) ? 1 : subdivisions;
  }

  modify(geometry) {
    let repeats = this.subdivisions;
    while (repeats-- > 0) {
      this.smooth(geometry);
    }
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
  }

  smooth(geometry) {
    let tmp = new THREE.Vector3();
    let oldVertices, oldFaces;
    let newVertices, newFaces;
    let n, i, il, j, k;
    let metaVertices, sourceEdges;
    let newEdgeVertices, newSourceVertices;

    oldVertices = geometry.vertices; // { x, y, z}
    oldFaces = geometry.faces; // { a: oldVertex1, b: oldVertex2, c: oldVertex3 }

    // Step 0: Preprocess Geometry to Generate edges Lookup

    metaVertices = new Array(oldVertices.length);
    sourceEdges = {}; // Edge => { oldVertex1, oldVertex2, faces[]  }
    generateLookups(oldVertices, oldFaces, metaVertices, sourceEdges);

    // Step 1: For each edge, create a new Edge Vertex, then position it.

    newEdgeVertices = [];
    let other, currentEdge, newEdge, face;
    let edgeVertexWeight, adjacentVertexWeight, connectedFaces;

    for (i in sourceEdges) {
      currentEdge = sourceEdges[i];
      newEdge = new THREE.Vector3();

      edgeVertexWeight = 3 / 8;
      adjacentVertexWeight = 1 / 8;

      connectedFaces = currentEdge.faces.length;

      // check how many linked faces. 2 should be correct.
      if (connectedFaces !== 2) {
        // if length is not 2, handle condition
        edgeVertexWeight = 0.5;
        adjacentVertexWeight = 0;

        if (connectedFaces !== 1) {
          if (WARNINGS) {
            console.warn('Subdivision Modifier: Number of connected faces != 2, is: ', connectedFaces, currentEdge);
          }
        }
      }

      newEdge.addVectors(currentEdge.a, currentEdge.b).multiplyScalar(edgeVertexWeight);
      tmp.set(0, 0, 0);

      for (j = 0; j < connectedFaces; j++) {
        face = currentEdge.faces[ j ];
        for (k = 0; k < 3; k++) {
          other = oldVertices[face[ABC[k]]];
          if (other !== currentEdge.a && other !== currentEdge.b) {
            break;
          }
        }
        tmp.add(other);
      }

      tmp.multiplyScalar(adjacentVertexWeight);
      newEdge.add(tmp);

      currentEdge.newEdge = newEdgeVertices.length;
      newEdgeVertices.push(newEdge);

      // console.log(currentEdge, newEdge);

    }

    // Step 2: Reposition each source vertices.

    let beta, sourceVertexWeight, connectingVertexWeight;
    let connectingEdge, connectingEdges, oldVertex, newSourceVertex;
    newSourceVertices = [];

    for (i = 0, il = oldVertices.length; i < il; i++) {
      oldVertex = oldVertices[ i ];
      // find all connecting edges (using lookupTable)
      connectingEdges = metaVertices[ i ].edges;
      n = connectingEdges.length;

      if (n === 3) {
        beta = 3 / 16;
      } else if (n > 3) {
        beta = 3 / (8 * n); // Warren's modified formula
      }
      // Loop's original beta formula
      // beta = 1 / n * ( 5/8 - Math.pow( 3/8 + 1/4 * Math.cos( 2 * Math. PI / n ), 2) );
      sourceVertexWeight = 1 - n * beta;
      connectingVertexWeight = beta;
      if (n <= 2) {
        // crease and boundary rules
        // console.warn('crease and boundary rules');
        if (n === 2) {
          if (WARNINGS) {
            console.warn('2 connecting edges', connectingEdges);
          }
          sourceVertexWeight = 3 / 4;
          connectingVertexWeight = 1 / 8;
          // sourceVertexWeight = 1;
          // connectingVertexWeight = 0;
        } else if (n === 1) {
          if (WARNINGS) {
            console.warn('only 1 connecting edge');
          }
        } else if (n === 0) {
          if (WARNINGS) {
            console.warn('0 connecting edges');
          }
        }
      }

      newSourceVertex = oldVertex.clone().multiplyScalar(sourceVertexWeight);
      tmp.set(0, 0, 0);
      for (j = 0; j < n; j++) {
        connectingEdge = connectingEdges[ j ];
        other = connectingEdge.a !== oldVertex ? connectingEdge.a : connectingEdge.b;
        tmp.add(other);
      }

      tmp.multiplyScalar(connectingVertexWeight);
      newSourceVertex.add(tmp);
      newSourceVertices.push(newSourceVertex);
    }

    // Step 3: Generate Faces between source vertecies and edge vertices.

    newVertices = newSourceVertices.concat(newEdgeVertices);
    let sl = newSourceVertices.length, edge1, edge2, edge3;
    newFaces = [];

    for (i = 0, il = oldFaces.length; i < il; i++) {
      face = oldFaces[ i ];
      // find the 3 new edges vertex of each old face
      edge1 = getEdge(face.a, face.b, sourceEdges).newEdge + sl;
      edge2 = getEdge(face.b, face.c, sourceEdges).newEdge + sl;
      edge3 = getEdge(face.c, face.a, sourceEdges).newEdge + sl;
      // create 4 faces.
      newFace(newFaces, edge1, edge2, edge3);
      newFace(newFaces, face.a, edge1, edge3);
      newFace(newFaces, face.b, edge2, edge1);
      newFace(newFaces, face.c, edge3, edge2);
    }

    // Overwrite old arrays
    geometry.vertices = newVertices;
    geometry.faces = newFaces;
  }
}

export default SubdivisionModifier;
