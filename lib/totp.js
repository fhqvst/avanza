/* eslint-disable no-bitwise */

const crypto = require('crypto')

/**
 * TOTP function
 *
 * @license MIT
 * @author github.com/bonan
 * @param secret OTP Secret, as buffer of bytes or base32-encoded string
 * @param timeStep Interval between new codes, defaults to 30
 * @param numDigits Number of digits in code, defaults to 6
 * @returns {string}
 */
module.exports = (secret, timeStep = 30, numDigits = 6) => {
  const alg = 'sha1'
  const counter = Math.floor(Date.now() / 1000 / timeStep)

  // If secret is not already a buffer, treat is as base32 encoded string.
  secret = Buffer.isBuffer(secret)
    ? secret
    : Buffer.from(
        secret
          .split('')
          .filter(x => {
            const y = x.charCodeAt(0)
            return (
              (y >= 0x32 && y <= 0x37) || // 2-7
              (y >= 0x41 && y <= 0x5b) || // A-Z
              (y >= 0x61 && y <= 0x7b)
            ) // a-z
          })
          .map(x => {
            const y = x.charCodeAt(0)
            // A-Z / a-z translates into 0-25
            if ((y & 0xc0) === 64) {
              return (y & 0x1f) - 1
            }
            // 2-7 translates into 26-31
            return parseInt(x, 10) + 24
          })
          .reduce((v, e, i, a) => {
            // Calculate left-shift and right-shift values.
            const ls = ((i + 1) * 3) % 8
            const rs = ls >= 4 ? 8 - ls : undefined
            // Pop last value off array, unless at an index that's a multiple of 8
            let lv = i % 8 === 0 ? 0 : v.pop()
            if (rs) {
              // If rs is set, shift that many bits to the right, push to result ..
              v.push(lv + (e >> rs))
              // .. and start on a fresh byte
              lv = 0
            }
            // Next value
            const nv = lv + ((e << ls) & 255)

            // Ignore 0x00 if at end
            if (i < a.length - 1 || nv > 0 || i % 8 === 7) {
              v.push(nv)
            }
            return v
          }, [])
      )

  // Convert the counter to raw bytes
  const counterBuf = Buffer.from(
    [24, 16, 8, 0]
      .map(x => ((counter / 2 ** 32) >> x) & 255)
      .concat([24, 16, 8, 0].map(x => (counter % 2 ** 32 >> x) & 255))
  )

  const hmac = crypto.createHmac(alg, secret).update(counterBuf).digest()

  // Get offset from last byte
  const o = hmac[hmac.length - 1] & 0x0f

  // Find offset and read the next 4 bytes
  const v = `${
    (((hmac[o] & 0x7f) << 24) | ((hmac[o + 1] & 0xff) << 16) | ((hmac[o + 2] & 0xff) << 8) | (hmac[o + 3] & 0xff)) %
    // Modulus operation to get the right number of digits
    10 ** numDigits
  }`

  // Left-pad with zeros
  return Array(numDigits + 1 - v.length).join('0') + v
}
