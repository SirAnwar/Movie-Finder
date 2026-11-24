const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "الاسم مطلوب"],
            trim: true,
            maxlength: [50, "الاسم طويل جدًا"],
        },
        email: {
            type: String,
            required: [true, "البريد الإلكتروني مطلوب"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "البريد الإلكتروني غير صالح"],
        },
        password: {
            type: String,
            required: [true, "كلمة المرور مطلوبة"],
            minlength: [8, "كلمة المرور يجب أن تكون ٨ أحرف على الأقل"],
            select: false,
        },
        resetToken: { type: String, select: false },
        resetTokenExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

// Hash the password before saving (only when it was changed)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare a typed password with the saved hash
userSchema.methods.checkPassword = function (password) {
    return bcrypt.compare(password, this.password);
};

// Create a reset token: save its hash + expiry, return the plain token for the email
userSchema.methods.createResetToken = function () {
    const token = crypto.randomBytes(32).toString("hex");
    this.resetToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetTokenExpires = Date.now() + 15 * 60 * 1000;
    return token;
};

module.exports = mongoose.model("User", userSchema);
