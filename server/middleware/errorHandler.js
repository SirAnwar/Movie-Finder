// No route matched the request
const notFound = (req, res) => {
    res.status(404).json({ message: "المسار غير موجود" });
};

// Any error thrown in a route or controller ends up here
const errorHandler = (err, req, res, next) => {
    // Duplicate value blocked by a unique index: a registered email, or the same favorite twice
    if (err.code === 11000) {
        const message = err.keyValue?.email ? "البريد الإلكتروني مستخدم مسبقًا" : "الفيلم موجود في المفضّلة";
        return res.status(409).json({ message });
    }

    // Missing or wrong data (required fields, enum, wrong types)
    if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(400).json({ message: "بيانات غير صحيحة" });
    }

    // Anything else: log the details here, never send them to the client
    console.error(err);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
};

module.exports = { notFound, errorHandler };
