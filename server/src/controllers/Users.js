import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";
import { sendEmail } from "../utils/mailer.js";
import util from "util";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

export const userSignup = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password || !company) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).send({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await Users.findOne({ email });

    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Users({
      name,
      email,
      password: hashedPassword,
      company,
    });

    await user.save();

    try {
      const readFile = util.promisify(fs.readFile);
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const templatePath = join(__dirname, "../templates/signupTemplate.html");
      const template = await readFile(templatePath, "utf-8");

      const replcedTemplate = template.replace("${userName}", user.name);
      -(await sendEmail(
        process.env.ADMIN_EMAIL,
        "Welcome to our plateform!",
        replcedTemplate
      ));
    } catch (error) {
      console.error("Email error:", error);
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send({
      success: false,
      message: "Error during signup",
      error: error.message,
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "Email and password are required" });
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid email or password" });
    }

    try {
      const readFile = util.promisify(fs.readFile);
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const templatePath = join(__dirname, "../templates/signinTemplate.html");
      const template = await readFile(templatePath, "utf-8");

      const replcedTemplate = template.replace("${userName}", user.name);
      -(await sendEmail(
        process.env.ADMIN_EMAIL,
        "Login Successful!",
        replcedTemplate
      ));
    } catch (error) {
      console.error("Email error:", error);
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).send({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};
