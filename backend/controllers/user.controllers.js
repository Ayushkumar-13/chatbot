import User from "../models/user.models.js";
import { generateToken } from "../utils/utils.js";
import bcrypt from "bcryptjs"
import cloudinary from "../utils/cloudinary.js";
// Signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    res.json({
      success: true,
      user: newUser,
      token,
      message: "Account Created Successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to login a user 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.json({ success: false, message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(existingUser._id);
    res.json({
      success: true,
      user: existingUser,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
 
// Controller to check if user is authenticated 
export const checkAuth = (req,res) => {
    res.json({success: true, user: req.user});
}

// Controller to update user profile details 
export const updateProfile = async (req,res) => {
    try {
        const {profilePic, bio, fullName} = req.body

        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
          updatedUser =  await User.findById(userId, {bio, fullName}, {new: true})
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }

        res.json({success: true, user: updatedUser});

    } catch (error) {
        console.log(error.message);
     res.json({success: false, message: error.message})     
    }
}