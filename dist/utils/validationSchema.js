"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSchema = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
exports.authSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    username: joi_1.default.string().min(3).max(30).required(),
    email: joi_1.default.string()
        .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
    })
        .lowercase(),
    role: joi_1.default.string().required(),
    organizationName: joi_1.default.string(),
    password: joi_1.default.string().min(6).required(),
    verifyPassword: joi_1.default.ref("password"),
});
