const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');

const ccpPath = path.resolve(__dirname, '..', 'basic_articles', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// Create a new CA client for interacting with the CA.
const caURL = ccp.certificateAuthorities['ca.example.com'].url;
const ca = new FabricCAServices(caURL);

// Create a new file system based wallet for managing identities.
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);
console.log(`Wallet path: ${walletPath}`);

module.exports = {
    check_key: async function (key, select_result, res) {
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%\n", select_result);
        try {
            //console.log(pcode,name,ssn,addr,email,visitDate,desease,deseaseCode,content,docterName,docterNo);
            const userExists = await wallet.exists('user5');
            if (!userExists) {
                console.log('An identity for the user "user4" does not exist in the wallet');
                await res.json({ 'msg': '연결부터 해주세요' });
                return;
            }

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: 'user5', discovery: { enabled: false } });

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('certchain5');

            const result = await contract.evaluateTransaction('check_key', key);
            const stringResult = result.toString();
            const chain_result = JSON.parse(stringResult)
            console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb블록체인에서 가져온데이터 ")
            console.log(chain_result);
            console.log("dddddddddddddddddddddddddd db에서 가져온데이터")
            console.log(select_result);


            /*
            let x;

            for (x in parsedData[1]) {
                let type;
                parsedData[1][x].type
                Date(parsedData[1][x].create_at)
                parsedData[1][x].name
                parsedData[1][x].from_name
                parsedData[1][x].birth + "</p>" +
                parsedData[1][x].dept
                parsedData[1][x].date
                parsedData[1][x].degree
                parsedData[1][x].code
                
            }

       
            for (x in parsedData[2]) {
                Date(parsedData[2][x].create_at) + "</a>" +
                parsedData[2][x].title 
                parsedData[2][x].from_name 
                 parsedData[2][x].grade + "</p>" +
                    "<p>등록번호 : " + parsedData[2][x].serial + "</p>" +
                    "<p>취득일자 : " + parsedData[2][x].date + "</p>" +
                    "</div></div>";
            }

            result += "<hr><h4 class='widget-title mb-30'>경력 증명서</h4>";
            for (x in parsedData[3]) {
                result +=
                    "<div class='single-recent-post d-flex' >" +
                    "<!-- Thumb -->" +
                    "<div class='post-thumb'>" +
                    "<a href='#'><img src='img/box-filled.png' alt=''></a>" +
                    "</div>" +
                    "<!-- Content -->" +
                    "<div class='post-content'>" +
                    "<!-- Post Meta -->" +
                    "<div class='post-meta'>" +
                    "<a class='post-author'>발급일 : " + Date(parsedData[3][x].create_at) + "</a>" +
                    "<a class='post-author'>성명 : " + parsedData[3][x].name + "</a>" +
                    "<a class='post-author'>발급기관 : " + parsedData[3][x].from_name + "</a>" +
                    "</div>" +
                    "<p>생년월일 : " + parsedData[3][x].birth + "</p>" +
                    "<p>입사일자 : " + parsedData[3][x].date_join + "</p>" +
                    "<p>퇴사일자 : " + parsedData[3][x].date_leave + "</p>" +
                    "<p>담당부서 : " + parsedData[3][x].dept + "</p>" +
                    "<p>직위 : " + parsedData[3][x].rank + "</p>" +
                    "</div></div>";
            }
            */


            res.json(JSON.stringify(select_result));



        } catch (e) {
            console.log(e);

        }
    }
}

