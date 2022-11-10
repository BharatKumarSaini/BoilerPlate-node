import nodemailer from "nodemailer";
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'

const sendEmail = async (email : string, subject : string, text : string, HTMLtemplate : string) => {
  try {
      const templatePath = path.resolve('template', HTMLtemplate)
      const template = fs.readFileSync(templatePath, { encoding: 'utf8' })
      const html = ejs.render(template, { Link: text })
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.USER,
        to: email,
        subject: subject,
        text: html,
      });
      console.log("email sent sucessfully");
    
  } catch (error) {
    console.log("email not sent");
    console.log(error);
  }
};

export default sendEmail;