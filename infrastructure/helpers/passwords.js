import { promisify } from "util";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password) {
    const salt=randomBytes(16).toString("hex")
    const hash = (await scryptAsync(password, salt, 64)).toString("hex")    
    return `${salt}.${hash}`;
}
export async function checkPassword(password, hash) {
    const [salt, hash2] = hash.split(".");
    const hash1 = (await scryptAsync(password, salt, 64)).toString("hex");
    return timingSafeEqual(Buffer.from(hash1), Buffer.from(hash2));
}
