import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  USER_ROLES_ARRAY,
  USER_ROLES,
  BCRYPT_CONFIG,
} from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please provide a valid 10-digit Indian mobile number",
      ],
    },

    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: USER_ROLES_ARRAY,
        message: "Role must be one of: member, trainer, admin",
      },
      default: USER_ROLES.MEMBER,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    profilePicture: {
      type: String,
      default: null,
      // Stores the Cloudinary URL of the profile picture
    },

    profilePicturePublicId: {
      type: String,
      default: null,
      // Stores the Cloudinary public_id — needed to delete the old image
      // when user uploads a new one or removes their picture
    },
  },

  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) {
    return;
  }
  this.passwordHash = await bcrypt.hash(
    this.passwordHash,
    BCRYPT_CONFIG.SALT_ROUNDS,
  );
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.index({ role: 1, isActive: 1 });

const User = mongoose.model("User", userSchema);

export default User;
