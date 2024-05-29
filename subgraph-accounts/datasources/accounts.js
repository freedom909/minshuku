import { RESTDataSource } from '@apollo/datasource-rest'

import { OAuth2Client } from 'google-auth-library';
import { GraphQLError, graphql } from 'graphql'
import fetch from 'node-fetch';
import { validateInviteCode } from '../helpers/validateInvitecode.js'
import { hashPassword, checkPassword } from '../helpers/passwords.js'
import pkgj from 'jsonwebtoken'
const { sign, verify, decode } = pkgj
import { V2 as paseto } from 'paseto';
import nodemailer from 'nodemailer'

class AccountsAPI extends RESTDataSource {
  baseURL = 'http://localhost:4011/'
  async createAccount(email, password) {
    return this.auth0.createUser({
      connection: "Username-Password-Authentication",
      email,
      password
    });
  }

  async login (email, password ) {
    const message = 'Username or password is incorrect'
    let user
    try {
      user = await this.getUserByEmail(email)
      console.log(user)
      const isValidPassword = await checkPassword(password, user.password)
      if (!isValidPassword) {
        throw new GraphQLError(message, {
          extensions: {
            code: 'BAD_EMAIL_OR_PASSWORD',
            description: message
          }
        })
      }
    } catch (error) {
      if (!user) {
        throw new GraphQLError(message, {
          extensions: {
            code: 'BAD_EMAIL',
            description: 'User with that email does not exist'
          }
        })
      }
      return user
    }
    const payload = { id: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: 'HS256',
      subject: user.id.toString(),
      expiresIn: '1d'
    })
    console.log(token)
    return { token }
  }
  
  async registerGuest ( email, password, name, nickname, role = 'GUEST', picture) {
    const existingUser = await this.getUserByEmailOrNickname({
      email,
      nickname
    })
    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApolloServerErrorCode.BAD_USER_INPUT(
          'Email is already in use'
        )
      } else if (existingUser.nickname === nickname) {
        throw new ApolloServerErrorCode.BAD_USER_INPUT(
          'nickname is already in use'
        )
      }
    }

    if (!validator.isStrongPassword(password)) {
      throw new GraphQLError('message', {
        extensions: {
          code: 'BAD_PASSWORD',
          description:
            'The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols'
        }
      })
    }

    const passwordHash = await hashPassword(password)
    const newUser = {
      email,
      name,
      password: passwordHash,
      nickname,
      role:'GUEST',
      picture
    }
    console.log(newUser)
    try {
      const { data, error } = await this.post(`/user`, newUser)
      if (error) {
        throw new GraphQLError('Something went wrong on our end', {
          extensions: {
            code: 'SERVER_ERROR',
          }
        })
      }

      const payload = { id: data.id }
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: user.id.toString(),
          expiresIn: '1d' // expiration time
        },
        process.env.JWT_ACCOUNT_ACTIVATION,
        {
          expiresIn: '5m'
        }
      )
console.log(token)

      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Account activation link',
        html: `
        <h1>Please use the following to activate your account</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr />
        <p>This email may containe sensetive information</p>
        <p>${process.env.CLIENT_URL}</p>
 `
      }

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_FROM,
          password: process.env.EMAIL_PASSWORD
        }
      })
      transporter.sendMail(emailData, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log(info.response + 'was send')
        }
      })

      return { token }
    } catch (e) {
      throw new GraphQLError('message', {
        extensions: {
          code: 'BAD_EMAIL',
          description: 'The email is already in use'
        }
      })
    }
  }
  
  async registerHost (email, password, nickname, name, inviteCode, picture) {
    validateInviteCode(_, inviteCode)
      // Validate password strength
      if (!validator.isStrongPassword(password)) {
        throw new GraphQLError('message', {
          extensions: {
            code: 'BAD_PASSWORD',
            description:
              'The password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and symbols'
          }
        })
      }
          // Check for existing email and nickname
    const res = await Promise.all([
      this.get(`/users?email=${email}&& ${nickname}`)
    ])

    const [existingEmail, existingNickname] = res
   
    if (existingEmail.length) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT('Email is already in use')
    } else if (existingNickname.length) {
      throw new ApolloServerErrorCode.BAD_USER_INPUT(
        `Username ${existingNickname} already in use`
      )
    }
    const passwordHash = await hashPassword(password)
    const newUser = {
      name,
      email,
      password: passwordHash,
      nickname,
      picture,
      role: 'HOST'
    }
    try {
      const { data, error } = await this.post(`/user`, newUser)

      const payload = { id: data.id }
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: user.id.toString(),
          expiresIn: '1d' // expiration time
        },
        process.env.JWT_ACCOUNT_ACTIVATION,
        {
          expiresIn: '5m'
        }
      )
  
      // Send activation email using nodemailer
      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Account activation link',
        html: `
        <h1>Please use the following to activate your account</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr />
        <p>This email may containe sensetive information</p>
        <p>${process.env.CLIENT_URL}</p>
        `
      }
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASSWORD
        }
      })
      transporter.sendMail(emailData, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log(info.response + 'was send')
        }
      })
      return { token }
    } catch (e) {
      throw new GraphQLError('message', {
        extensions: {
          code: 'SERVER_ERROR',
          description: 'Something went wrong on our end'
        }
      })
    }
  }
  
  async activateUser (req, res) {
    const { token } = req.body
    if (token) {
      verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decode) => {
        if (err) {
          console.log('Activation error')
          return res.status(401).json({
            errors: 'Exprired link, please signup again'
          })
        } else {
          const { name, email, password } = decode(token)
          console.log(email)
          const newUser = new UserActivation({
            name,
            email,
            password
          })
          newUser.save((err, user) => {
            if (err) {
              console.log('Activation error')
              return res.status(401).json({
                errors: 'Exprired link, please signup again'
              })
            } else {
              return res.json({
                sucess: true,
                data: user,
                message: 'Account activated successfully'
              })
            }
          })
        }
      })
    } else {
      return res.status(401).json({
        errors: 'Exprired link, please signup again'
      })
    }
  }

  async forgotPassword (req, res) {
    const { email }=req.body
    const user = await getUserByEmail ( email )
    if (!user) {
      return res.status(400).json({
        errors: 'User not found'
      })
    }
    const token = sign(
      {
        _id: user.id
      },
      process.env.JWT_SECRET_RESET_PASSWORD,
      {
        expiresIn: '10m'
      }
    )
    const emailData={
      from:process.env.EMAIL_FROM,
      to:email,
      subject:"Account activation link",
      html: `
      <h1>Please use the following to activate your account</h1>
      <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
      <hr />
      <p>This email may containe sensetive information</p>
      <p>${process.env.CLIENT_URL}</p>
  `
    }

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    let info = await transporter.sendMail(emailData)
    if (info) {
      return res.status(200).json({
        message: 'Email sent successfully'
      })
    }
  }

async requireSignin (req, res, next)  {
  try {
    const token = req.headers.authorization;
    const secret = process.env.JWT_SECRET;
    
    const payload = await paseto.verify(token, secret);
    
    req.user = payload.sub; // Assuming the user ID is stored in the "sub" claim
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

async resetPassword(req,res) {
  const {resetPasswordLink,newPassword}=req.body
  const token=resetPasswordLink.split('/')[2]
  if (token) {
    const userId=await getUserId(token)
    const user=await getUserById(userId)
    const salt=await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash(newPassword,salt)
    await updateUserById(userId,{password:hashedPassword})
    res.status(200).json({message:'Password reset successfully'})
  }
 return "something wrong with resetPassword"
  }  

client = new OAuth2Client(process.env.GOOGLE_CLIENT);
async googleLogin(req,res){
  const token=req.body.token
  const ticket=await client.verifyIdToken({
    idToken:token,
    audience:process.env.GOOGLE_CLIENT
  })
  const payload=ticket.getPayload()
  const userId=payload.sub
  const email=payload.email
  const name=payload.name
  const picture=payload.picture
  const user=await getUserByEmail(email)
  if (user) {
    const token=signToken(user._id)
    res.status(200).json({token
    })
  }
  else {
    const newUser=await createUser({
      email,
      name,
      password:token,
      picture
   
    } 
    )
  }}



  async facebookLogin(req, res) {
    const token = req.body.token;
    const profileUrl = `https://graph.facebook.com/v3.3/${token}?fields=first_name,last_name,email,picture&access_token=${process.env.FACEBOOK_SECRET}`;
  
    try {
      const response = await fetch(profileUrl);
      const profile = await response.json();
      const userId = profile.id;
      const email = profile.email;
      const name = profile.first_name + ' ' + profile.last_name;
      const picture = profile.picture.data.url;
      const user = await getUserByEmail(email);
  
      if (user) {
        const token = signToken(user._id);
        res.status(200).json({ token });
      } else {
        const newUser = await createUser({
          email,
          name,
          password: token,
          picture,
        });
        res.status(200).json({ token: signToken(newUser._id) });
      }
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
  
  async adminMiddleware (req, res, next) {
    const adminUser = getUserById(userId)
    if (adminUser.role !== 'admin') {
      return res.status(400).json({
        error: 'User not found'
      })
      req.profile = adminUser
      next()
    }
  }
  //retrieve Id of user
  async getUserByEmail ( email ) {
    const url = `/user`
    const body = { email }
    const result = await this.post(url, body)
    console.log(this)
    return result.data[0]
  }

  async getUserById (userId) {
    const url = `/user/${userId}`
    console.log(url)
    const result = await this.get(url)
    console.log(result)
    return result.data[0]
  }
        
  async getUserByEmailOrNickname ({email, nickname} ) {
    const url = `/user`
    const body = { email,nickname }
    const result = await this.post(url, body)
    return result.data[0]
  }

  updateUser (userId, userInfo ) {
    return this.patch(`users/${userId}`, { body: { ...userInfo } })
  }
  getUser (userId) {
    return this.get(`user/${userId}`)
  }
  getGalacticCoordinates (userId) {
    return this.get(`users/${userId}/coordinates`)
  }
}

export default AccountsAPI
