export default {
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.jsx', '.js'],
  };
  
  