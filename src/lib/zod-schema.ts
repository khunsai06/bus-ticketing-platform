// Validation Schema
import moment from "moment";
import { z } from "zod";
export const passwdSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((password) => /\d/.test(password), {
    message: "Password must contain at least one number",
  })
  .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
    message: "Password must contain at least one special character",
  });

export const requiredSchema = z
  .string()
  .trim()
  .min(1, { message: "This field cannot be left blank." });

export const emailSchema = requiredSchema.email({
  message: "Please enter a valid email address.",
});

export const unameSchema = requiredSchema
  .min(4, {
    message: "Username must be at least 4 characters long.",
  })
  .max(20, {
    message: "Username must be less than 20 characters.",
  });

export const dateOfBirthSchema = requiredSchema.refine(
  (val) => {
    const dob = moment(val, "YYYY-MM-DD");
    const today = moment();
    const age = today.diff(dob, "years");
    return age >= 16;
  },
  {
    message: "You must be at least 16 years old.",
  }
);
export const confirmPasswordSchema = z
  .object({
    passwd: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.passwd === data.confirm, {
    message: "Passwords don't match",
  });
