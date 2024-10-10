const Sequelize = require("sequelize");
const connection = new Sequelize('guiadochurras','root','Homer987@@',{
    host: 'localhost',
    dialect: 'mysql',
    timezone: "-03:00"
});



module.exports = connection;