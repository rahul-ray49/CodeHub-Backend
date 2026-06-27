function decode(value) {
    if (value == null) return value;

    return Buffer.from(value, "base64").toString("utf8");
}

module.exports={decode};

