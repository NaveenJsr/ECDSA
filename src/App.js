import React, { useState, useEffect } from 'react';

const App = () => {
  const [publicKeyJson, setPublicKeyJson] = useState('');
  const [privateKeyJson, setPrivateKeyJson] = useState('');
  const [cipherText, setCipherText] = useState('');
  const [plainText, setPlainText] = useState('Hello, ECDSA!');
  const [privateKey, setPrivateKey] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  useEffect(() => {
    generateKey();
  }, []); // Run once when the component mounts

  const asciiToUint8Array = (asciiString) => {
    return new TextEncoder().encode(asciiString);
  };

  const hexStringToUint8Array = (hexString) => {
    const arrayBuffer = new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))).buffer;
    return new Uint8Array(arrayBuffer);
  };

  const bytesToHexString = (bytes) => {
    return Array.from(new Uint8Array(bytes))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  const generateKey = () => {
    window.crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256', // Change this to your desired curve
      },
      true,
      ['sign', 'verify']
    )
      .then((key) => {
        setPrivateKey(key.privateKey);
        setPublicKey(key.publicKey);

        return Promise.all([
          window.crypto.subtle.exportKey('jwk', key.publicKey),
          window.crypto.subtle.exportKey('jwk', key.privateKey),
        ]);
      })
      .then(([publicKeyData, privateKeyData]) => {
        setPublicKeyJson(JSON.stringify(publicKeyData, null, 2));
        setPrivateKeyJson(JSON.stringify(privateKeyData, null, 2));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const signData = () => {
    window.crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: {
          name: 'SHA-256',
        },
      },
      privateKey,
      asciiToUint8Array(plainText)
    )
      .then((signature) => {
        setCipherText(bytesToHexString(signature));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const verifySignature = () => {
    window.crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      publicKey,
      hexStringToUint8Array(cipherText),
      asciiToUint8Array(plainText)
    )
      .then((isValid) => {
        alert('Signature verification: ' + isValid);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  

  return (
    <div>
      <div>
        <label>Public Key:</label>
        <textarea readOnly value={publicKeyJson} />
      </div>
      <div>
        <label>Private Key:</label>
        <textarea readOnly value={privateKeyJson} />
      </div>
      <div>
        <label>Plain Text:</label>
        <input
          type="text"
          value={plainText}
          onChange={(e) => setPlainText(e.target.value)}
        />
      </div>
      <div>
        <button onClick={signData}>Sign Data</button>
      </div>
      <div>
        <label>Cipher Text:</label>
        <textarea readOnly value={cipherText} />
      </div>
      <div>
        <button onClick={verifySignature}>Verify Signature</button>
      </div>
    </div>
  );
};

export default App;
