import Hashids from 'hashids';
const hashids = new Hashids("this is salt", 8, "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");

export default async function inviteCode() {
// Initialize numbers array
const numbers = [];
for (let i = 0; i < 1000000; i++) {
  numbers.push(i);
}

const encoded = numbers.map(num => hashids.encode(num));

const decoded = encoded.map(code => hashids.decode(code)[0]);

// Check for duplicates. There should be none.
const sortedEncoded = [...encoded].sort();
let hasDuplicates = false;

for (let i = 0; i < sortedEncoded.length - 1; i++) {
  if (sortedEncoded[i] === sortedEncoded[i + 1]) {
    console.log('Found duplicate: ', sortedEncoded[i]);
    hasDuplicates = true;
  }
}

if (!hasDuplicates) {
  console.log(`No duplicates found in ${encoded.length} codes`);
}

console.log('First number:', numbers[0]);
console.log('Middle number:', numbers[500000]);
console.log('Last number:', numbers[999999]);

console.log('First encoded:', encoded[0]);
console.log('Middle encoded:', encoded[500000]);
console.log('Last encoded:', encoded[999999]);

console.log('First decoded:', decoded[0]);
console.log('Middle decoded:', decoded[500000]);
console.log('Last decoded:', decoded[999999]);
}

