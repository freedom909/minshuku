import { check } from 'express-validator';
export const validRegister = [
    check('nickname', 'Nickname is required').notEmpty(),
    check('role').notEmpty().default('GUEST'),,
    check('picture').notEmpty(),
    check('picture').isURL().withMessage('Must be a valid URL'),
    check('name', 'Name is required').notEmpty()
    .isLength({
        min: 2,
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
    .withMessage('Password must contain at least 8 characters').matches(/\d/).withMessage('password must contain a number')
    ]

    export const validPassword = [
        check('password', 'Password is required')
            .notEmpty()
            .isLength({ min: 8 })
            .withMessage('Password must contain at least 8 characters')
            .matches(/\d/)
            .withMessage('Password must contain a number'),
    ];