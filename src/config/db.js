const mongoose = require('mongoose');
async function main() {
    await mongoose.connect(process.env.DB_CONNECT_STRING)
}
console.log("DB_CONNECT_STRING exists:", !!process.env.DB_CONNECT_STRING);
module.exports = main;