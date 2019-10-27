var express = require('express');
const mysql = require('mysql');
var router = express.Router();
const Career_BC_Service = require('../blockchain/update_career');

router.post('/', function (req, res, next) {

    function XSS_Check(value) {
        value = value.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g, "");
        value = value.replace(/\</g, "&lt;");
        value = value.replace(/\>/g, "&gt;");
        return value;
    }

    if (req.body.career_name == "" || req.body.career_birth == "" || req.body.career_start == "" || req.body.career_end == "" || req.body.career_department == "" || req.body.career_rank == "") {
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
            const create_at = Date.now();
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! "+create_at);
            console.log(req.body, req.session.email);
            // XSS 방어
            const email = XSS_Check(req.session.email);
            const career_key = req.body.career_key;
            const career_name = XSS_Check(req.body.career_name);
            const career_birth = XSS_Check(req.body.career_birth);
            const career_join = XSS_Check(req.body.career_join);
            const career_leave = XSS_Check(req.body.career_leave);
            const career_dept = XSS_Check(req.body.career_dept);
            const career_rank = XSS_Check(req.body.career_rank);

            const sql = `insert into certchain_career(from_no, to_no, name, birth, date_join, date_leave, dept, career_rank, create_at) values((select no from certchain_account where email=?), (select account_no from certchain_key_encoded where encoded_key=?), ?, ?, ?, ?, ?, ?, ?)`;

            conn2.query(sql, [email, career_key, career_name, career_birth, career_join, career_leave, career_dept, career_rank, create_at], (err, result, fields) => {
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
            
                        conn3.query(sql, [career_key], (err, result, fields) => {
                            if (err) {
                                console.error(err.message);
                            } else {
                                const origin_key = result[0].origin_key;
                                const msg = { msg: "증명서 발급을 완료했습니다." };
            
                                Career_BC_Service.update_career(origin_key, career_name, career_birth, career_join, career_leave, career_dept, career_rank, create_at.toString());
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
