// validators.js
// import { GraphQLError } from 'graphql';

// const validRegister = async ({ email, password, name, nickname, role, picture }) => {
//   const errors = [];

//   if (!nickname) {
//     errors.push('Nickname is required');
//   }
//   if (!role) {
//     errors.push('Role is required');
//   }
//   if (!picture || !/^https?:\/\/.*\.(jpg|jpeg|png|gif)$/.test(picture)) {
//     errors.push('Picture must be a valid URL');
//   }
//   if (!name || name.length < 2 || name.length > 18) {
//     errors.push('Name must be between 2 and 18 characters');
//   }
//   if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
//     errors.push('Must be a valid email address');
//   }
//   if (!password || password.length < 8 || password.length > 88 || !/\d/.test(password)) {
//     errors.push('Password must contain at least 8 characters and include a number');
//   }

//   if (errors.length > 0) {
//     throw new GraphQLError(errors.join(', '), {
//       extensions: { code: 'BAD_USER_INPUT' }
//     });
//   }
// };
import { check } from 'express-validator';

const validRegister = [
  check('email')
    .isEmail()
    .withMessage('Must be a valid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('name')
    .notEmpty()
    .withMessage('Name is required'),
  check('nickname')
    .notEmpty()
    .withMessage('Nickname is required'),
  check('role')
    .isIn(['GUEST', 'HOST'])
    .withMessage('Role must be either GUEST or HOST'),
  check('inviteCode')
    .optional()
    .isString()
    .withMessage('Invite code must be a string'),
  check('picture')
    .optional()
    .isURL()
    .withMessage('Picture must be a valid URL'),
];

export default validRegister;

