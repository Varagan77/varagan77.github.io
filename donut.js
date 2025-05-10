// See https://www.a1k0n.net/2011/07/20/donut-math.html for an explanation

// Procedure Summary

// Donut cross-section: (x, y, z) = (R2, 0, 0) + (R1 cos theta, R1 sin theta, 0)
// Rotate about y-axis by phi for solid of revolution.
// Rotate whole donut about x-axis by A and z-axis by B.
// Project from 3D space onto 2D z-buffer: (x', y') = (K1 x, K1 y) / (K2 + z)

// Also get normal for a point on the donut by doing this but starting from a unit circle (cos theta, sin theta, 0)
// Dot the normal with the light direction (0, 1, -1) to get a shading luminance value.
// Use the shading to pick an ascii character to display.

// Intervals for producing donut points
const thetaSpacing = 0.02
const phiSpacing = 0.01

// Size of the screen (in chars)
const screenW = 100
const screenH = 100

// Small radius of the donut
const R1 = 1
// Large radius of the donut
const R2 = 2
// Distance from the donut to the camera eye
const K2 = 5
// Distance from the viewer plane to camera eye, chosen so the donut fills most of the screen
const K1 = screenW * K2 * 3 / (8 * (R1 + R2))

// Ascii characters in order of brightness for rendering
const ascii = ".:-=+£#%@"

// Output buffer of characters to print
const output = new Array(screenW * screenH).fill(' ')
// Z-buffer of 1/z depths (larger values are closer to the camera eye, 0 is infinite depth)
const zInvBuffer = new Array(screenW * screenH).fill(0)

// Render donut at rotation A about x-axis and rotation B about z-axis.
// Returns a string to be printed to the console.
function renderFrame(A, B) {
  // Precompute sines and cosines
  const cosA = Math.cos(A)
  const sinA = Math.sin(A)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)
  const TwoPi = 2 * Math.PI

  // Clear buffers
  output.fill(' ')
  zInvBuffer.fill(0)

  // Iterate through theta and phi to get points on the donut
  for (let theta = 0; theta < TwoPi; theta += thetaSpacing) {
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)

    // x,y coordinate of the donut circle before revolving
    const circleX = R2 + R1 * cosTheta
    const circleY = R1 * sinTheta

    for (let phi = 0; phi < TwoPi; phi += phiSpacing) {
      const cosPhi = Math.cos(phi)
      const sinPhi = Math.sin(phi)

      // x,y,z coordinates on the donut after rotations phi, A, B
      const x = circleX * (cosB * cosPhi + sinA * sinB * sinPhi) - circleY * cosA * sinB
      const y = circleX * (sinB * cosPhi - sinA * cosB * sinPhi) + circleY * cosA * cosB
      const z = circleX * cosA * sinPhi + circleY * sinA + K2
      const zInv = 1 / z // Inverse of z

      // Projection onto screen
      const xp = (0.5 * screenW + K1 * zInv * x) | 0
      const yp = (0.5 * screenH - K1 * zInv * y) | 0

      // Skip plotting if off-screen
      if (xp < 0 || xp >= screenW || yp < 0 || yp >= screenW)
        continue

      // Linear index in z-buffer and output
      const index = screenW * yp + xp

      // Luminance from dot product
      const lum = Math.SQRT1_2 * (cosPhi * cosTheta * sinB - cosA * cosTheta * sinPhi - sinA * sinTheta + cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi))

      // Luminance ranges from -1 < lum < +1, where negative is facing away from camera so can be ignored.
      // Also test against the z-buffer and skip plotting if 1/z is smaller (further) than what's already plotted.
      if (lum < 0 || zInv <= zInvBuffer[index])
        continue

      // New closest point in the z-buffer
      zInvBuffer[index] = zInv

      // Put ascii character for luminance in the output
      output[index] = ascii[(lum * ascii.length) | 0]
    }
  }

  // Return output as a string
  let str = ''
  for (let index = 0, row = 0; row < screenH; ++row) {
    for (let col = 0; col < screenW; ++col, ++index) {
      str += output[index]
    }
    str += '\n'
  }
  return str
}

// Toggle play/pause button
const playPause = document.getElementById('play-pause')
let isPlaying = true

playPause.addEventListener('click', () => {
  if (isPlaying) {
    isPlaying = false
    playPause.innerText = 'Play'
  } else {
    isPlaying = true
    playPause.innerText = 'Pause'
    draw()
  }
})

// Dom element to print characters to
const domElement = document.getElementById('console')

// Rotation angles to increment each frame
const rateA = 0.01
const rateB = 0.003
let a = 0.5 * Math.PI
let b = 0

function draw() {
  domElement.innerHTML = renderFrame(a, b)

  a += rateA
  b += rateB

  if (isPlaying)
    requestAnimationFrame(draw)
}

draw()
