// Database tools ==================================================
var sqlite3   = require("sqlite3").verbose();
var file      = "Bomberman.db";
var db = new sqlite3.Database(file);
//db.run("drop table if exists userInfo");
db.run("CREATE TABLE if not exists userInfo (id INTEGER PRIMARY KEY, username char(50), password char(50))");

module.exports = db;


