import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner'; // Use default import
import axios from 'axios';

const Scanner = () => {
    const [data, setData] = useState(''); // For storing scanned data
    const [barcodeValue, setBarcodeValue] = useState('');

    const handleScan = (value) => {
        if (value !== null) {
            setData(value);
            setBarcodeValue(value);
            sendToBackend(value); // Send scanned value to backend
        }
    };

    const sendToBackend = async (barcode) => {
        try {
            const response = await axios.post('http://localhost:5000/scan', {
                barcode: barcode
            });
            console.log('Barcode stored successfully:', response.data);
        } catch (error) {
            console.error('Error storing barcode:', error);
        }
    };

    return (
        <div>
            <h2>Barcode Scanner</h2>
            <BarcodeScannerComponent
                onUpdate={(err, result) => {
                    if (result) handleScan(result.text);
                }}
            />
            {data && <p>Scanned Barcode: {data}</p>}
        </div>
    );
};

export default Scanner;
