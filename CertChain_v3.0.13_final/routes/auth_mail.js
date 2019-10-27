var express = require("express");
const mysql = require("mysql");
var router = express.Router();
const crypto = require("crypto");

function XSS_Check(value) {
  value = value.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g, "");
  value = value.replace(/\</g, "&lt;");
  value = value.replace(/\>/g, "&gt;");
  return value;
}

router.post("/", function(req, res, next) {
  if (req.body.token == "") {
    const msg = {
      result:
        "Null Point 역참조 발생 (계속 반복 된다면 해킹 우려가 있으니 고객센터에 문의주세요.)"
    };
    res.json(JSON.stringify(msg));
  } else {
    const email = XSS_Check(req.body.email);

    let conn = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "mysql",
      database: "nodejs"
    });

    conn.connect(err => {
      if (err) {
        return console.error(err.message);
      }
      const sql = `select count(token) as count_token from certchain_auth_email WHERE token=? && email=?`;

      conn.query(sql, [req.body.token, email], (err, result, fields) => {
        if (err) {
          console.error(err.message);
        } else {
          if (result[0].count_token > 0) {
            req.session.emailAuthState = 1;
          }
          const msg = {
            result: result[0].count_token
          };
          res.json(JSON.stringify(msg));
        }
        conn.end();
      });
    });
  }
});

module.exports = router;
