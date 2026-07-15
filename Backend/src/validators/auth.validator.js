import {body,validationResult} from "express-validator";

export function validate(req,res,next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    next();
}

export const registerValidation = [
    body("username")
        .notEmpty().withMessage("Username is required")
        .isLength({min: 3}).withMessage("Username must be at least 3 characters long")
        .matches(/^[a-zA-Z0-9]+$/).withMessage("Username must be alphanumeric")
        .trim(),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .trim(),
    
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({min: 6}).withMessage("Password must be at least 6 characters long"),

    validate
]; 

export const loginValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),

    body("password")
        .notEmpty().withMessage("Password is required"),

    validate

]
    