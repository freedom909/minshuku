import { Router } from 'express'
const router = Router()

import { registerHost, registerGuest,activation, login, forgotPassword, resetPassword, googleLogin, facebookLogin } from './datasources/accounts'

import {validSign,validLogin,forgotPasswordValidator,resetPasswordValidator} from "../helpers/valid.js"
router.post('/registerHost', registerHost)