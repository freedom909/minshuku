import nodemailer from 'nodemailer';

class MailToUser {
    async sendActivationPassword(email, token) {
        const emailData = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Password Activation Link',
          html: `
            <h1>Please use the following link to activate your account</h1>
            <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
            <hr />
            <p>This email may contain sensitive information</p>
            <p>${process.env.CLIENT_URL}</p>
          `,
        };
    
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
    
        try {
          await transporter.sendMail(emailData);
          console.log(`Activation email sent to ${email}`);
        } catch (error) {
          console.error('Error sending activation email:', error);
          throw new Error('Error sending activation email');
        }
      }
      // async sendResetPassword(email, token) {
      //   const emailData = {
      //     from: process.env.EMAIL_FROM,
      //     to: email,
      //     subject: 'Password Reset Link',
      //     html: `
      //       <h1>Please use the following link to reset your password</h1>
      //       <p>${process.env.CLIENT_URL}/users/reset-password/${token}</p>
      //       <hr />
      //       <p>This email may contain sensitive information</p>
      //       <p>${process.env.CLIENT_URL}</p>
      //     `,
      //   };
      // }
    }