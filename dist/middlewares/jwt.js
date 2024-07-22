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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.generateToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    jsonwebtoken_1.default.sign({ user: req.user }, "secretkey", { expiresIn: "1h" }, (err, token) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: "Token generation failed",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
        });
    });
});
exports.verifyToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (bearerHeader) {
        const bearer = bearerHeader.split(" ");
        if (bearer.length === 2) {
            const bearerToken = bearer[1];
            req.token = bearerToken;
            next();
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Malformed token",
            });
        }
    }
    else {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Missing Authorization header",
        });
    }
};
