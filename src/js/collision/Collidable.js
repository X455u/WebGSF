class Collidable {
  constructor() {
    this.hull = null
    this.capsule = null
    this.dragHull = null // TODO: Implement draggable hull for high speeds
  }

  setHull(points) {
    this.hull = points
  }

  setCapsule(start, end, radius) {
    this.capsule = { start: start, end: end, radius: radius }
  }
}
export default Collidable
