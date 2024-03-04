// Validation Schema 
import { z } from "zod";
export const passwdSchema = z.string()
    .min(8, 'Password must be at least 8 characters long')
    .refine(
        password => /[A-Z]/.test(password),
        { message: 'Password must contain at least one uppercase letter' }
    )
    .refine(
        password => /[a-z]/.test(password),
        { message: 'Password must contain at least one lowercase letter' }
    )
    .refine(
        password => /\d/.test(password),
        { message: 'Password must contain at least one number' }
    )
    .refine(
        password => /[!@#$%^&*(),.?":{}|<>]/.test(password),
        { message: 'Password must contain at least one special character' }
    );


export const unameSchema = z
    .string()
    .trim()
    .min(4, {
        message: "This field cannot be left blank.",
    })
    .max(32);