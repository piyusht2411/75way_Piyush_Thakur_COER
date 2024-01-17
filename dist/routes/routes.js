"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const allController_1 = require("../controller/allController");
const router = (0, express_1.Router)();
router.post('/register', allController_1.register);
router.post('/signIn', allController_1.signIn);
router.get('/showBalance', allController_1.showBalance);
exports.default = router;
