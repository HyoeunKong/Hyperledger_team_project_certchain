var express = require('express');
const mysql = require('mysql');
var router = express.Router();
const Cert_BC_Service = require('../blockchain/update_cert');

function XSS_Check(value) {
    value = value.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g, "");
    value = value.replace(/\</g, "&lt;");
    value = value.replace(/\>/g, "&gt;");
    return value;
}

router.post('/', function (req, res, next) {



    if (
      req.body.cert_title == "" ||
      req.body.cert_org_name == "" ||
      req.body.cert_grade == "" ||
      req.body.cert_serial == "" ||
      req.body.cert_date == "" ||
      req.body.cert_key == ""
    ){
        const msg = {
            msg: "Null Point 역참조 발생 (계속 반복 된다면 해킹 우려가 있으니 고객센터에 문의주세요.)"
        };

    } else {
        let conn2 = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'mysql',
            database: 'nodejs'
        });

        conn2.connect((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log(req.body, req.session.email);
            // XSS 방어
            const email = XSS_Check(req.session.email);
            const cert_title = XSS_Check(req.body.cert_title);
            const cert_grade = XSS_Check(req.body.cert_grade);
            const cert_serial = XSS_Check(req.body.cert_serial);
            const cert_date = XSS_Check(req.body.cert_date);
            const cert_key = req.body.cert_key;

            const create_at = Date.now();

            const sql = `insert into certchain_cert(from_no, to_no, title, grade, serial, date, create_at) values((select no from certchain_account where email=?), (select account_no from certchain_key_encoded where encoded_key=?), ?, ?, ?, ?, ?)`;

            conn2.query(sql, [email, cert_key, cert_title,  cert_grade, cert_serial, cert_date, create_at], (err, result, fields) => {
                if (err) {
                    console.error(err.message);
                } else {
                
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
                        
                        const sql = `select origin_key from certchain_key_origin where account_no = (select account_no from certchain_key_encoded where encoded_key=?)`;
                        conn3.query(sql, [cert_key], (err, result, fields) => {
                            if (err) {
                                console.error(err.message);
                            } else {
                                const origin_key = result[0].origin_key;
                                const msg = { msg: "자격증 발급을 완료했습니다.." };
            
                                Cert_BC_Service.update_cert(origin_key, cert_title, cert_grade, cert_serial, cert_date, create_at.toString());
                                res.json(JSON.stringify(msg));
                            }
                            conn3.end();
                        });
                    });
                }
                conn2.end();
            });
        });

    }
});




module.exports = router;

