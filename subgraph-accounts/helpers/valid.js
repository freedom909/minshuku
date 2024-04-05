import { check } from 'express-validator';
export const validRegister = [
    check('name', 'Name is required').notEmpty()
    .isLength({
        min: 3,
        max: 18
    }).withMessage('name must be between 3 to 18 characters'),
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('password', 'password is required').notEmpty(),
    check('password').isLength({
        min: 8,
        max: 88
    }).withMessage('Password must contain at least 88 characters').matches(/\d/).withMessage('password must contain a number'),
]

export const validLogin=[
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('password', 'password is required').notEmpty(),
    check('password').isLength({min:8})
    .withMessage('Password must contain at least 6 characters').matches(/\d/).withMessage('password must contain a number')
    ]
//  export const forgetPasswordValidator=[
//     check('email')
//     .not()
//     .isEmpty()
//     .isEmail()
//     .withMessage('Must be a valid email address')
//  ]
//  export const resetPasswordValidator = [
//     check('newPassword')
//         .not()
//         .isEmpty()
//         .isLength({ min: 6 })
//         .withMessage('Password must be at least  6 characters long')
// ];