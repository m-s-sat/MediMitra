require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../model/auth');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const { sendMail } = require('../common/common');
const path = require('path');
const HospitalReg = require('../model/hospitalreg');
const cron = require('node-cron');



const emailTemplate = fs.readFileSync(path.join(__dirname,'../template/emailTemplate.html'), 'utf-8');
const welcomeEmailTemplate = fs.readFileSync(
    path.join(__dirname, '../template/welcomeemail.html'), 
    'utf-8'
);

exports.createUser = async(req, res)=>{
    try{
        const { username, name, password, confirmPassword, phone, preferredLanguage, avatar, dob, pincode, role } = req.body; 
        if(password!==confirmPassword) return res.status(400).json('password did not match');
        bcrypt.hash(password, parseInt(process.env.SALT), async(err,hashedPassword)=>{
            if(err) return res.status(500).json('facing problem in hashing passsword');
            const user = new User({username, name, password:hashedPassword, phone, preferredLanguage, avatar, dob, pincode, role});
            await user.save();
            const appName = 'Medimitra';
            const profileLink = process.env.PROFILELINK;
            const currentYear = new Date().getFullYear();
            let htmlToSend = welcomeEmailTemplate
                .replace(/{{APP_NAME}}/g, appName)
                .replace(/{{NAME}}/g, name)
                .replace(/{{CALL_TO_ACTION_LINK}}/g, profileLink)
                .replace(/{{CURRENT_YEAR}}/g, currentYear);
            const subject = `Welcome to ${appName}, ${name}!`;
            sendMail({ to: username, subject, html: htmlToSend }).catch(error => {
                console.error(`Failed to send welcome email to ${username}:`, error);
            });
            req.login(user, (err)=>{
                if(err) res.status(401);
                res.json(user);
            })
        });
    }
    catch(err){
        res.status(500).json(err);
    }
}
exports.createHospital = async(req,res)=>{
    try{
        const hospital_data = req.body;
        bcrypt.hash(hospital_data.admin.password, parseInt(process.env.SALT), async(err,hashedPassword)=>{
            if(err) return res.status(500).json({message:"Error in hashing password"});
            const data = new HospitalReg({...hospital_data, admin: {...hospital_data.admin, password: hashedPassword}});
            await data.save();
            req.login(data, (err)=>{
                if(err) return res.status(401).json({message:"Unable to login"});
                return res.status(201).json({
                    message: "Hospital registered successfully",
                    data: data
                });
            });
        });
    }
    catch(err){
        return res.status(500).json({message:"Internal server error"});
    }
}
exports.loginUser = (req,res)=>{
    res.status(200).json(req.user);
}
exports.checkAuthStatus = (req, res) => {
    res.status(200).json(req.user);
};
exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err) return next(err);
        req.session.destroy((err)=>{
            if(err) return res.status(500).json({message:"unable to destroy the session"});
            res.clearCookie('connect.sid');
            return res.status(200).json({message:'logout successfully'});
        })
    })
}
exports.forgotpass = async(req,res)=>{
    try{
        const {password, confirmPassword, email, token} = req.body;
        const user = await User.findOne({username:email});
        if(!user) return res.status(400).json({message:"user not found"});
        if(password!==confirmPassword) return res.status(400).json({message:"password is not matching with the confirm password"});
        if(token!==user.resetPasswordToken) return res.status(401).json({message:'unauthorized'});
        bcrypt.hash(password, parseInt(process.env.SALT), async(err,hashedPassword)=>{
            if(err) return res.status(500).json({message:"hashing problem"});
            user.password = hashedPassword;
            await user.save();
            return res.status(200).json({message:"password change successfully"});
        });
    }
    catch(err){
        return res.status(500).json({message:"something went wrong"});
    }
}

exports.setForgotPassToken = async(req,res)=>{
    try{
        const {email} = req.body;
        const user = await User.findOne({username:email});
        if(!user) return res.status(400).json({message:"user not found"});
        if(user.password==='google') return res.status(400).json({message:"Your created account through the google, you can't change password. Please login through the google account."})
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        await user.save();
        const resetPageLink = 'http://locahost:5173/password-reset/?token='+token+'&email='+email;
        const subject = 'Reset password for your medimitra account';
        let html = emailTemplate.replace('{{RESET_LINK}}', resetPageLink);
        html = html.replace('{{NAME}}', user.name);
        if(email){
            const response = await sendMail({to:email, subject, html});
            return res.status(201).json({message:"We've sent a password reset link to the email address you provided."});
        }
        res.sendStatus(400);
    }
    catch(err){
        res.status(400);
    }
}

exports.updateProfile = async(req,res)=>{
    try{
        const {id} = req.user;
        const updateData = req.body;
        if(!updateData) return res.status(400).json({message:'Unable to fetch your data'});
        if (updateData.weeklyLogs) {
            updateData.weeklyLogs.lastUpdated = new Date();
            updateData.weeklyLogs.weeklyReminderSent = false;
        }
        const user = await User.findOneAndUpdate({_id:id},updateData,{new:true});
        if(!user) return res.status(500).json({message:'Unable to fetch your data in our database.'});
        req.login(user, (err) => {
            if (err) {
                console.error("Login Error:", err);
                return res.status(500).json({ message: "An error occurred while logging in." });
            }
            res.status(200).json({ message: "Profile updated successfully.", data: user });
        });
    }
    catch(err){
        console.error("Profile Update Error:", err)
        res.status(500).json({ message: "An error occurred while updating your profile." });
    }
}
exports.addDoctor = async(req,res)=>{
    try{
        const {id, role} = req.user;
        const doctorData = req.body;
        if(!doctorData) return res.status(400).json({message:"Unable to fetch doctor data."});
        if(!id) return res.status(400).json({message:"Unable to fetch your id."});
        if(role!=='hospital') return res.status(403).json({message:"You are not authorized to add a doctor."});
        const hospital = await HospitalReg.findByIdAndUpdate({_id:id},{$push:{doctors:doctorData}}, {new:true});
        if(!hospital) return res.status(500).json({message:"Unable to add doctor in our database."});
        req.login(hospital, (err)=>{
            if(err){
                return res.status(500).json({ message: "An error occurred while logging in." });
            }
            return res.status(201).json({ message: "Doctor added successfully.", data: hospital });
        })
    }
    catch(err){
        console.error("Error adding doctor:", err);
        res.status(500).json({ message: "An error occurred while adding the doctor." });
    }
}