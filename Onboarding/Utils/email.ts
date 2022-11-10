import nodemailer from "nodemailer";
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'

const sendEmail = async (email : string, subject : string, text : string) => {
  try {
    if (process.env.BASE_URL) {
      const Link = process.env.BASE_URL
      const templatePath = path.resolve('template', 'emailVerification.ejs.html')
      const template = fs.readFileSync(templatePath, { encoding: 'utf8' })
      const html = ejs.render(template, { Link: Link })
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.USER,
        to: email,
        subject: subject,
        text: text,
        html,
      });
      console.log("email sent sucessfully");
    }
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

export default sendEmail;