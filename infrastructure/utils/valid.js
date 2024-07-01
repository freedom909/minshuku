
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
const validLogin = [
  check('email')
    .isEmail()
    .withMessage('Must be a valid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export {validRegister, validLogin};

