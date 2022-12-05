"use strict";
exports.__esModule = true;
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var mongoose_1 = require("mongoose");
var app = (0, express_1["default"])();
// configure cors
app.use((0, cors_1["default"])());
// configure express to receive form data
app.use(express_1["default"].json());
// configure dotEnv
dotenv_1["default"].config({ path: './.env' });
var port = 5000;
if (process.env.PORT) {
    port = +process.env.PORT;
}
// configure mongodb connection
if (process.env.MONGO_DB_CLOUD_URL) {
    mongoose_1["default"].connect(process.env.MONGO_DB_CLOUD_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    }).then(function () {
        console.log('Connected to MongoDB Cloud Successfully......');
    })["catch"](function (error) {
        console.error(error);
        process.exit(1);
    });
}
// simple request
app.get('/', function (request, response) {
    console.log(request);
    response.send("<h2>Welcome to User Onboarding BoilerPlate </h2>");
});
// router configuration
// app.use('/api/users' , require('./router/userRouter'));
app.listen(port, function () {
    console.log("Express Server is started at PORT : ".concat(port));
});
