import { validationResult } from 'express-validator';
import {validRegister} from '../helpers/valid.js';
<<<<<<< HEAD
import { GraphQLError } from 'graphql';
=======
>>>>>>> 423c9ada222eec0adc48468d9b684fd46ad7492d

const runValidations = async (input) => {
  // Mock a request object
  const req = { body: input };

  // Run the validation checks
  await Promise.all(validRegister.map((validation) => validation.run(req)));

  // Check the validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new GraphQLError('Validation errors', {
      extensions: { code: 'BAD_USER_INPUT', errors: errors.array() },
    });
  }
};

export default runValidations;

