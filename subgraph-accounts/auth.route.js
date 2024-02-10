import { Router } from 'express'
const router = Router()

import { registerHost, registerGuest, login} from './datasources/accounts.js'
import {validRegister,validLogin} from "./helpers/valid.js"

router.post('/registerHost', validRegister, registerHost)
router.post('/registerGuest', validRegister,registerGuest)
router.post('/login', validLogin, login)
// router.post('/activateUser', activateUser)
// router.put('/forgotPassword', forgotPasswordValidator,forgotPassword)
// router.put('/resetPassword', resetPasswordValidator,resetPassword)
// router.post('/googleLogin', googleLogin)
// router.post('/facebookLogin', facebookLogin)

router.get('/logout', logout)


export default authRouter;