var express = require('express');
const mysql = require('mysql');
var router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

function XSS_Check(value) {
    value = value.replace(/\<|\>|\"|\'|\%|\;|\(|\)|\&|\+|\-/g, "");
    value = value.replace(/\</g, "&lt;");
    value = value.replace(/\>/g, "&gt;");
    return value;
}

function mail_auth(email) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your_email@gmail.com',  // gmail 계정 아이디를 입력
            pass: 'your_pw'          // gmail 계정의 비밀번호를 입력
        }
    });


    crypto.randomBytes(64, (err, buf) => {  // salt생성(랜덤 문자열)
        const random_number = Math.floor(Math.random() * (999999 - 100000)) + 100000;
        crypto.pbkdf2(email + random_number.toString(), buf.toString('base64'), 100, 20, 'sha512', async(err, key) => { // 인자(비밀번호, salt, 반복 횟수, 비밀번호 길이, 해시 알고리즘)
            const token = key.toString('base64');

            const msg = `<table align="center" width="583" border="0" cellpadding="0" cellspacing="0" style="padding:10px 0; text-align:left;">
            <tbody>
                <tr>
                    <td><img src="http://yjc526.cafe24.com/certchain/certchain_logo0.png" alt="CertChain" border="0" width=300px; height=150px ></td>
                </tr>
                <tr>
                    <td style="padding:0; border:1px solid #cbcbcb;">
                        <!-- 내용 -->
                        <table width="581" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                                <tr>
                                    <!-- 상단 -->
                                    <td><img src="https://nonghyup.career.co.kr/images/mail/mail_certify.jpg"></td>
                                </tr><!-- //상단 -->
                                <tr>
                                    <!-- 본문 -->
                                    <td align="center" style="text-align:left;">
                                        <table align="center" width="531" border="0" cellspacing="0" cellpadding="0"
                                            style="margin:0 auto;">
                                            <tbody>
                                                <tr>
                                                    <td height="29"></td>
                                                </tr>
                                                <tr>
                                                    <!-- 안내글 -->
                                                    <td style="color:#333333; font:12px/22px Dotum;">
                                                        <strong style="line-height:28px;">
                                                            인증코드는
                                                            [ <span style="color:#f26522;">${token}</span> ]
                                                            입니다.
                                                        </strong><br>
                                                    </td>
                                                </tr><!-- //안내글 -->
                                                <tr>
                                                    <td height="80"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <!--//본문 -->
                                <tr>
                                    <td height="55"></td>
                                </tr>
                                <tr>
                                    <!-- 하단 -->
                                    <td align="center">
                                        <table width="568" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                                            <tbody>
                                                <tr>
                                                    <td style="border:1px solid #d8d5d5">
                                                        <table width="568" border="0" cellspacing="0" cellpadding="0">
                                                            <tbody>
                                                                <tr>
                                                                    <td align="center" bgcolor="#f6f6f6" height="40"
                                                                        style="border:1px solid #ffffff; color:#666666; font:normal 12px/19px Gulim;">
                                                                        본 메일은 발신전용이므로 회신하실 경우 답변되지 않습니다.
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr><!-- //하단 -->
                                <tr>
                                    <td height="7"></td>
                                </tr>
                            </tbody>
                        </table>
                    </td><!-- //내용 -->
                </tr>
            </tbody>
        </table>`;

            

            let mailOptions = {
                from: {
                    name: 'I AM 관리자',
                    address: 'yjc7840@gmail.com'
                },    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
                to: email,                     // 수신 메일 주소
                subject: '[I AM] CertChain 메일인증을 완료해주세요',   // 제목
                html: msg  // 내용          
            };

            await transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                    transporter.close();
                }
            });

            let conn9 = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'mysql',
                database: 'nodejs'
            });

            conn9.connect((err) => {
                if (err) {
                    return console.error(err.message);
                }

                const sql = `insert into certchain_auth_email(email, token) values(?, ?) ON DUPLICATE KEY UPDATE email=?, token=?`;

                conn9.query(sql, [email, token, email, token], (err, result, fields) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log(result, fields);
                    }
                    conn9.end();
                });

            });

        });
    });
}

router.post('/', function (req, res, next) {
    if (req.body.email == "") {
        const res_dup = {
            result: "Null Point 역참조 발생 (계속 반복 된다면 해킹 우려가 있으니 고객센터에 문의주세요.)"
        };
        res.json(JSON.stringify(res_dup));
    } else {
        let conn = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'mysql',
            database: 'nodejs'
        });
        const email = XSS_Check(req.body.email);
        conn.connect((err) => {
            if (err) {
                return console.error(err.message);
            }
            const sql = `select count(email) as count_email from certchain_account WHERE email=?`;

            conn.query(sql, [email], (err, result, fields) => {
                if (err) {
                    console.error(err.message);
                } else {
                    if (result[0].count_email == 0) {
                        req.session.dupState = 1;
                        req.session.dupEmail = email;
                        mail_auth(email);
                    }
                    const res_dup = {
                        result: result[0].count_email
                    };
                    res.json(JSON.stringify(res_dup));
                }
                conn.end();
            });
        });
    }

});

module.exports = router;