const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
 
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
 
const ccpPath = path.resolve(__dirname, '..' , 'basic_articles', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
 
// Create a new CA client for interacting with the CA.
const caURL = ccp.certificateAuthorities['ca.example.com'].url;
const ca = new FabricCAServices(caURL);
 
// Create a new file system based wallet for managing identities.
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);
console.log(`Wallet path: ${walletPath}`);

module.exports={
    update_degree: async function(degree_key, type, name, birth, dept, date, degree, code, create_at){
        try{
            //console.log(pcode,name,ssn,addr,email,visitDate,desease,deseaseCode,content,docterName,docterNo);
            const userExists = await wallet.exists('user5');
                if (!userExists) {
                  console.log('An identity for the user "user1" does not exist in the wallet');
                  await res.json({'msg':'연결부터 해주세요'});
                  return;
              }
          
              // Create a new gateway for connecting to our peer node.
              const gateway = new Gateway();
              await gateway.connect(ccp, { wallet, identity: 'user5', discovery: { enabled: false } });
          
              // Get the network (channel) our contract is deployed to.
              const network = await gateway.getNetwork('mychannel');
          
              // Get the contract from the network.
              const contract = network.getContract('certchain5');
          
              await contract.submitTransaction('update_degree',degree_key, type, name, birth, dept, date, degree, code, create_at);
              console.log('degree 업로드');
              
          }catch(e){
              console.log(e);
             
          }
    }
}        

