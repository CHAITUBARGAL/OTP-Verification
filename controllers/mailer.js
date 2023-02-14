import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;
// import ENV from '../config.js'

// https://ethernal.email/create
let nodeConfig =  {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: EMAIL, // generated ethereal user
      pass: PASSWORD, // generated ethereal password
    }
  }
  let transporter = nodemailer.createTransport(nodeConfig);

  let MailGenerator = new Mailgen({
    theme: "default",
    product : {
        name: "Mailgen",
        link: "https://mailgen.js/"
    }
  })





//   POST : http://localhost:5000/api/registerMail
// "username":"chetan2002",
//   "userEmail": "chetan11@gmail.com",
//   "text": "Testing Mail",
//   "subject": "Backendd Mail Request"

  export const registerMail = async (req, res)=>{
    const { username, userEmail, text, subject} = req.body;

    // body of the email
    var email ={
        body:{
            name: username,
            intro: text ||  'Welcome to dailty tution',
            outro: 'Need help or have question?'
        }
    }

    var emailBody = MailGenerator.generate(email);

    let message={
        from: EMAIL ,
        to: userEmail,
        subject : subject || "Signup Succesffully",
        html : emailBody
    }

    // send mail
    transporter.sendMail(message)
    .then(()=>{
        return res.status(200).send({msg: "You should receive an email from us."})

    })
    .catch(error => res.status(500).send({error}))
  }