import { Router } from "express";
const router = Router();

// import all controllers
import * as controller from '../controllers/appController.js'
import { registerMail } from "../controllers/mailer.js";
import Auth , {localVariables} from "../middleware/auth.js";

// POST Method
router.route('/register').post(controller.register);  //register user
router.route('/registerMail').post(registerMail);  //send the mail
router.route('/authenticate').post( controller.verifyUser, (req,  res)=> res.end());  //authnticate user
router.route('/login').post( controller.verifyUser, controller.login);  // login in app

// GET method
router.route('/user/:username').get(controller.getUser);
router.route('/generateOTP').get(  controller.verifyUser , localVariables , controller.generateOTP);
router.route('/verifyOTP').get(controller.verifyOTP);
router.route('/createResetSession').get(controller.createResetSession);

// PUT Request
router.route('/updateuser').put( Auth, controller.updateUser);
router.route('/resetPassword').put( controller.verifyUser , controller.resetPassword);

export default router;