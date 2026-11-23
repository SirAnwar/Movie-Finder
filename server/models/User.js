const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

module.exports = mongoose.model("User", userSchema);
