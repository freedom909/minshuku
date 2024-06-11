import pkg from 'jsonwebtoken';
const { verify } = pkg;
import nodemailer from 'nodemailer';

class EmailVerification {
  async sendActivationEmail(email, token) {
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Account activation link',
      html: `
        <h1>Please use the following to activate your account</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>${process.env.CLIENT_URL}</p>
      `
    };

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    return transporter.sendMail(emailData);
  }

  async activateUser(token) {
    return new Promise((resolve, reject) => {
      verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
        if (err) {
          reject('Expired link, please signup again');
        } else {
          resolve(decoded);
        }
      });
    });
  }
}

export default EmailVerification;
