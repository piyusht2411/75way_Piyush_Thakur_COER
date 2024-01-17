"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const bcrypt_1 = require("bcrypt");
const schema_1 = __importDefault(require("../model/schema"));
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fname, lname, email, phone, password, gender } = req.body;
        const expression = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;
        // check input for correctness
        if (!pass.test(password.toString())) {
            return res.status(407).json({ message: 'Enter valid password with uppercase, lowercase, number & @' });
        }
        if (!expression.test(email.toString())) {
            return res.status(407).json({ message: 'Enter valid email' });
        }
        if (typeof phone !== 'number' && ("" + phone).length !== 10) {
            return res.status(407).json({ message: 'Phone number should only have 10 digits, No character allowed.' });
        }
        const existinguser = yield schema_1.default.findOne({ email });
        //if user is already exist
        if (existinguser) {
            return res.status(407).json({ message: 'User already Exist' });
        }
        //hashing password
        const salt = (0, bcrypt_1.genSaltSync)(10);
        const hashPassword = (0, bcrypt_1.hashSync)(password, salt);
        const newUser = new schema_1.default({
            fname,
            lname,
            email,
            phone,
            password: hashPassword,
            gender
        });
        //save new user
        yield newUser.save();
        res.status(200).json({ message: 'registred successfully' });
    }
    catch (err) {
        res.status(407).json({ message: err });
    }
});
exports.register = register;
