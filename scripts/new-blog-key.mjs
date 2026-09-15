import { randomInt } from "node:crypto";
// AT Protocol TID: microsecond timestamp and a 10-bit clock ID in sortable base32.
const alphabet = "234567abcdefghijklmnopqrstuvwxyz";
let value = ((BigInt(Date.now()) * 1000n) << 10n) | BigInt(randomInt(1024));
let key = "";
for (let i = 0; i < 13; i++) {
  key = alphabet[Number(value & 31n)] + key;
  value >>= 5n;
}
console.log(key);
