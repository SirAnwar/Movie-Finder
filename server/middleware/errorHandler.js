// No route matched the request
const notFound = (req, res) => {
    res.status(404).json({ message: "المسار غير موجود" });
};

// Any error thrown in a route or controller ends up here
const errorHandler = (err, req, res, next) => {
    // Same favorite added twice (blocked by the unique index)
    if (err.code === 11000) {
        return res.status(409).json({ message: "الفيلم موجود في المفضّلة" });
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
