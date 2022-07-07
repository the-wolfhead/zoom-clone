var mysql = require ('mysql');
var connection= mysql.createConnection({
    host : "LOCALHOST",
    user : "root",
    password :"",
    database :"zoom",
    multipleStatements : true
});

module.exports = connection