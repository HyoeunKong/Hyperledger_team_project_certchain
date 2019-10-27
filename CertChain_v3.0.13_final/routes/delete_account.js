var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const Delete_BC_Service = require('../blockchain/delete_account');


function XSS_Check(value) {
    value = value.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g, "");
    value = value.replace(/\</g, "&lt;");
    value = value.replace(/\>/g, "&gt;");
    return value;
}

router.post('/', function (req, res, next) {

    let conn3 = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'mysql',
        database: 'nodejs'
    });
    conn3.connect((err) => {
        if (err) {
            return console.error(err.message);
        }

        const sql = `select origin_key from certchain_key_origin where account_no = (select no from certchain_account where email = ?)`;
        conn3.query(sql, [req.session.email], (err, result, fields) => {
            if (err) {
                console.error(err.message);
            } else {
                const origin_key = result[0].origin_key;
                let conn = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'mysql',
                    database: 'nodejs'
                });

                conn.connect((err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    const sql = `delete from certchain_account where email = ?`;

                    conn.query(sql, [XSS_Check(req.session.email)], (err, result, fields) => {
                        if (err) {
                            console.error(err.message);
                            const msg = { msg: "정상적으로 처리되지 않았습니다. 계속 반복된다면 고객센터에 문의주세요." };
                            res.json(JSON.stringify(msg));
                        } else {
                            const msg = { msg: "정상적으로 탈퇴 되었습니다." };
                            Delete_BC_Service.delete_account(origin_key);
                            res.json(JSON.stringify(msg));
                            req.session.destroy(function (err) { });
                        }
                        conn.end();
                    });
                });

            }
            conn3.end();



        });
    });
});


module.exports = router;