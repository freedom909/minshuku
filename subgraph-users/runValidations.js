import { validationResult } from 'express-validator';
import {validRegister} from '../infrastructure/utils/valid.js';

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

