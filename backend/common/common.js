const nodemailer = require('nodemailer');

exports.isAuth = (req,res,next)=>{
  if(req.isAuthenticated()){
    console.log(req.body);
    return next()
  }
  res.status(400).json({message:'Unauthorized'});
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendMail = async({to, subject, text, html})=>{
    const info = await transporter.sendMail({
        from: `"Medimitra" <${process.env.EMAIL}>`,
        to,
        subject,
        text,
        html
    })
    return info
}