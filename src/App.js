import React, {useState} from 'react';
import { DIDSession } from 'did-session';
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum';
import { ethers } from 'ethers';  
import nacl from 'tweetnacl';
import {TextEncoderLite, TextDecoderLite} from 'text-encoder-lite';
const base64 = require('base64-js');

const contractAddress = '0x92fbf393c2b6207c254df83ef2322dcf7f6fe7f8';
const abi =[
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "inputString",
          "type": "string"
        }
      ],
      "name": "storePubKey",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "outputMessage",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pub_key",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
     
            

const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(contractAddress, abi, provider.getSigner());


function App() {
  const [didstring, setDidstring] = useState('');
  const [DIDcreated, setDIDcreated] = useState(false);
  const [pubKey, setPubKey] = useState('');
  const [pubKeyCreated, setPubKeyCreated] = useState(false);
  const [privKey, setPrivKey] = useState('');
  const [privKeyCreated, setPrivKeyCreated] = useState(false);

  const [output33Created, setOutput33Created] = useState(false);
  const [output33, setOutput33] = useState('');

  
  
  const [output22, setOutput22] = useState('');
  const [output22Created, setOutput22Created] = useState(false);
  

  const [encrypted, setEncrypted] = useState('');
  const [encryptedCreated, setEncryptedCreated] = useState(false);

  const [encodedNonce, setEncodedNonce] = useState('');
  const [encodedNonceCreated, setEncodedNonceCreated] = useState(false);

  const [decrypted, setDecrypted] = useState('');
  const [decryptedCreated, setDecryptedCreated] = useState(false);


  // const { randomBytes } = require('tweetnacl-util'); 

  async function connect () {
    const ethProvider = window.ethereum;
    const addresses = await ethProvider.request({ method: 'eth_requestAccounts' });
    const accountId = await getAccountId(ethProvider, addresses[0]);
    const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)
    await DIDSession.authorize(authMethod, { resources: [`ceramic://*`]})
    return addresses;

  }
//  

  // const { publicKey, secretKey } = nacl.sign.keyPair();
  const { publicKey, secretKey } = nacl.box.keyPair();
  
    async function generatePubKey () {
      try {
        const pubKey = publicKey.toString();
        const privKey = secretKey.toString();
        setPubKey(pubKey);
        setPrivKey(privKey);
        setPubKeyCreated(true);
        setPrivKeyCreated(true);
        return pubKey;
      } catch (error) {
        console.log(error);
      }
    
    }


  async function createAdid() {
    try {             
      await connect();
      const pk = await generatePubKey();
      const transaction = await contract.storePubKey(pk);
      await transaction.wait();
      const method = "did:ethr:";
      const didString = method.concat(transaction.hash);
      setDidstring(didString);
      setDIDcreated(true);

      const output2 = didString.concat(':');
      const output22 = output2.concat(pk);
      setOutput22(output22);
      setOutput22Created(true);

      const output33 = await contract.outputMessage();
      setOutput33Created(true);
      setOutput33(output33);
      return output22;
    } catch (err) {
      console.log(err);
    }
  }

   const nonce = nacl.randomBytes(nacl.box.nonceLength);

  async function encryptMessage (message) { 
    const textEncoder = new TextEncoderLite();
    const encode = textEncoder.encode(message);
    const encrypt = nacl.box(encode, nonce, publicKey, secretKey);
    const encodedNonce = base64.fromByteArray(nonce);
    const encodedCipher = base64.fromByteArray(encrypt);
    return {
      nonce: encodedNonce,
      ciphertext: encodedCipher,
    };
  }
    

    function decryptMessage(ciphertext, encodedNonce, secretKey) {
    console.log('start')
    console.log('');
    const textDecoder = new TextDecoderLite();
    console.log('decodedNonce:');
    const decodedNonce = base64.toByteArray(encodedNonce);
    console.log('decodedcypher:');
    const decodedCipher = base64.toByteArray(ciphertext);
    console.log('decryptedMesssage:');
    const decryptedMessage = nacl.box.open(
      decodedCipher,
      decodedNonce,
      publicKey, 
      secretKey
    );
  
    if (decryptedMessage) {
      console.log('');
      console.log('inside if:');
      const decodedMessage = textDecoder.decode(decryptedMessage);
      return decodedMessage;
    }
  
    throw new Error('Failed to decrypt message');
  }
  

  async function testEncrypt() {
        const toEncrypt = "Helloo World";
        const tryThis = await encryptMessage(toEncrypt);
        setEncodedNonceCreated(true);
        setEncodedNonce(tryThis.nonce);
        setEncryptedCreated(true);
        setEncrypted(tryThis.ciphertext);
        console.log('tryThis ' , tryThis.ciphertext);
  }
  
  async function testDecrypt() {
    const output = await decryptMessage(encrypted, encodedNonce, secretKey)
    setDecryptedCreated(true);
    console.log('output ' , output);
}




  return (
    <div className="container">
      <p>Helloo</p>
      <button onClick={testEncrypt}>Encrypt!</button>  
      {setEncryptedCreated && <p>Final encrypt: {encrypted}</p>} 

      <button onClick={testDecrypt}>Decrypt!</button>  

      <button onClick={createAdid}>Create DID!</button>
      {output22Created && <p>DID String: {output22}</p>} 
      {setDidstring && <p>Complete DID: {didstring}</p>} 

      <button onClick={generatePubKey}>Create keys!</button>
      {pubKeyCreated && <p>Pubkey: {pubKey}</p>}

      {DIDcreated && <p>DID String: {didstring}</p>}
      {output22Created && <p>Final output: {output22}</p>}

      {output33Created && <p>Transaction state: {output33}</p>}


   </div>
  );
}

export default App;
