var express = require('express');
const mysql = require('mysql');
var router = express.Router();
const Check_BC_Service = require('../blockchain/check_key');
var origin_key;

function XSS_Check(value) {
    value = value.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g, "");
    value = value.replace(/\</g, "&lt;");
    value = value.replace(/\>/g, "&gt;");
    return value;
}

router.post('/', function (req, res, next) {
    let encoded_key;
    if (req.session.accountType == "client") {    // client로 커리어 조회 시 키값 입력없이 커리어 조회 (세션.이메일 값으로 encoded_key 값 조회)
        let conn5 = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'mysql',
            database: 'nodejs'
        });
        conn5.connect((err) => {
            if (err) {
                return console.error(err.message);
            }
            const sql = `select encoded_key from certchain_key_encoded where account_no = (select no from certchain_account where email =?)`;

            conn5.query(sql, [req.session.email], (err, result, fields) => {
                if (err) {
                    console.error(err.message);
                } else {
                    encoded_key = result[0].encoded_key;
                }
                conn5.end();
            });
        });
    } else {
        encoded_key = req.body.encoded_key;
    }

    let conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'mysql',
        database: 'nodejs'
    });
    conn.connect((err) => { //키값이 가진 문서 정보 조회
        if (err) {
            return console.error(err.message);
        }
        let select_account = [];
        let select_degree = [];
        let select_cert = [];
        let select_career = [];
        let select_result = [];

        let conn2 = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'mysql',
            database: 'nodejs'
        });
        let conn3 = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'mysql',
            database: 'nodejs'
        });
        let conn4 = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'mysql',
            database: 'nodejs'
        });


        conn2.connect((err) => { // 키값 주인 사용자 정보 조회
            if (err) {
                return console.error(err.message);
            }
            const sql = `select * from certchain_account where no=(select account_no from certchain_key_encoded where encoded_key=?)`;

            conn2.query(sql, [encoded_key], (err, result, fields) => {
                if (err) {
                    console.error(err.message);
                } else {
                    if (result[0]) {// 조회 ok
                        select_account = {
                            name: result[0].name,
                            email: result[0].email
                        };
                        let user_info = result[0];

                        let conn8 = mysql.createConnection({
                            host: 'localhost',
                            user: 'root',
                            password: 'mysql',
                            database: 'nodejs'
                        });
                        conn8.connect((err) => {
                            if (err) {
                                return console.error(err.message);
                            }
                            const sql = `select origin_key from certchain_key_origin where account_no = (select account_no from certchain_key_encoded where encoded_key=?)`;
                            conn8.query(sql, [encoded_key], async (err, result, fields) => {
                                if (err) {
                                    console.error(err.message);
                                } else {

                                    origin_key = result[0].origin_key;

                                    if (user_info) {// 조회 ok
                                        select_account = {
                                            name: user_info.name,
                                            email: user_info.email
                                        };

                                        const sql = `SELECT degree.*, account.name as from_name FROM certchain_degree AS degree, certchain_account AS account 
                                                    where degree.from_no = account.no && to_no=(select account_no from certchain_key_encoded where encoded_key=?)`;

                                        conn.query(sql, [encoded_key], (err, result, fields) => {
                                            if (err) {
                                                console.error(err.message);
                                            } else {
                                                console.log("degree ");
                                                console.log(result);
                                                result.forEach(element => {
                                                    select_degree.push({
                                                        no: element.no,
                                                        type: element.type,
                                                        name: element.name,
                                                        birth: element.birth,
                                                        dept: element.dept,
                                                        date: element.date,
                                                        degree: element.degree,
                                                        code: element.code,
                                                        create_at: element.create_at,
                                                        from_name: element.from_name
                                                    });
                                                });
                                                console.log("1111111111111111111111111111111111111111111111111111111");
                                                conn3.connect((err) => {
                                                    if (err) {
                                                        return console.error(err.message);
                                                    }
                                                    const sql = `SELECT cert.*, account.name as from_name FROM certchain_cert AS cert, certchain_account AS account 
                                                    where cert.from_no = account.no && to_no=(select account_no from certchain_key_encoded where encoded_key=?)`;

                                                    //const sql = `select * from certchain_cert where to_no=(select account_no from certchain_key_encoded where encoded_key=?)`;
                                                    conn3.query(sql, [encoded_key], (err, result, fields) => {
                                                        if (err) {
                                                            console.error(err.message);
                                                        } else {
                                                            //console.log("cert ");
                                                            console.log(result);
                                                            result.forEach(element => {
                                                                select_cert.push({
                                                                    no: element.no,
                                                                    title: element.title,
                                                                    grade: element.grade,
                                                                    serial: element.serial,
                                                                    date: element.date,
                                                                    create_at: element.create_at,
                                                                    from_name: element.from_name
                                                                });
                                                            });
                                                            console.log("22222222222222222222222222222222222222222222222222222222222");
                                                            conn4.connect((err) => {
                                                                if (err) {
                                                                    return console.error(err.message);
                                                                }
                                                                const sql = `SELECT career.*, account.name as from_name FROM certchain_career AS career, certchain_account AS account 
                                                    where career.from_no = account.no && to_no=(select account_no from certchain_key_encoded where encoded_key=?)`;

                                                                conn4.query(sql, [encoded_key], (err, result, fields) => {
                                                                    if (err) {
                                                                        console.error(err.message);
                                                                    } else {
                                                                        //console.log("career ");
                                                                        //console.log(result);
                                                                        result.forEach(element => {
                                                                            select_career.push({
                                                                                no: element.no,
                                                                                name: element.name,
                                                                                birth: element.birth,
                                                                                date_join: element.date_join,
                                                                                date_leave: element.date_leave,
                                                                                dept: element.dept,
                                                                                rank: element.career_rank,
                                                                                create_at: element.create_at,
                                                                                from_name: element.from_name
                                                                            });
                                                                        });
                                                                        select_result = [select_account, select_degree, select_cert, select_career];
                                                                        console.log(select_result);

                                                                        Check_BC_Service.check_key(origin_key, select_result, res);
                                                                        //res.json(JSON.stringify(select_result));
                                                                    }
                                                                    conn4.end();
                                                                });
                                                            });
                                                        }
                                                        conn3.end();

                                                    });

                                                });

                                            }
                                            conn.end();
                                        });

                                    } else {// 조회 fail
                                        const msg = { msg: "키 값으로 조회된 정보가 없습니다." };
                                        res.json(JSON.stringify(msg));
                                    }

                                }
                                conn8.end();
                            });

                        });
                    } else {// 조회 fail
                        const msg = { msg: "키 값으로 조회된 정보가 없습니다." };
                        res.json(JSON.stringify(msg));
                    }
                }
                conn2.end();
            });
        });

    });
});


module.exports = router;