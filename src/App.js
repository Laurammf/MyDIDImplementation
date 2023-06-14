import React, {useState} from 'react';
import { DIDSession } from 'did-session';
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum';
import { ethers } from 'ethers';  


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
  const [didstring, setdidstring] = useState('');
  const [didstringCreated, setdidstringCreated] = useState(false);

  const [successMessageCreated, setsuccessMessageCreated] = useState(false);
  const [successMessage, setsuccessMessage] = useState('');
  
  const [completeDID, setcompleteDID] = useState('');
  const [completeDIDCreated, setcompleteDIDCreated] = useState(false);
  

  async function connect () {
    const ethProvider = window.ethereum;
    const addresses = await ethProvider.request({ method: 'eth_requestAccounts' });
    const accountId = await getAccountId(ethProvider, addresses[0]);
    const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)
    await DIDSession.authorize(authMethod, { resources: [`ceramic://*`]})
    return addresses;

  }


  async function createAdid() {
    try {             
      const address = await connect();
      const transaction = await contract.storePubKey(address[0]);
      await transaction.wait();
      const method = "did:ethr:";
      const didString = method.concat(transaction.hash);
      setdidstring(didString);
      setdidstringCreated(true);

      const output2 = didString.concat(':');
      const completeDID = output2.concat(address[0]);
      setcompleteDID(completeDID);
      setcompleteDIDCreated(true);

      const successMessage = await contract.outputMessage();
      console.log(successMessage);
      setsuccessMessageCreated(true);
      setsuccessMessage(successMessage);
      return completeDID;
    } catch (err) {
      console.log(err);
    }
  }




  return (
    <div className="container">
      <p>DID-creating Dapp</p>

      <button onClick={createAdid}>Create DID!</button>
      {didstringCreated && <p>DID String: {didstring}</p>}
      {completeDIDCreated && <p>Complete DID String: {completeDID}</p>} 
      {successMessageCreated && <p>Transaction state: {successMessage}</p>}


   </div>
  );
}

export default App;
