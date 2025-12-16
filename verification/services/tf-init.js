import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';

tf.env().set('WASM_HAS_SIMD_SUPPORT', true);
tf.env().set('WASM_HAS_MULTITHREAD_SUPPORT', true);

await tf.setBackend('wasm');
await tf.ready();

console.log('[TF] backend =', tf.getBackend());

export default tf;
