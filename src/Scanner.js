import React, { useState, useEffect } from 'react';
import Quagga from 'quagga';
import axios from 'axios';


const Scanner = () => {
    const [barcodeValue, setBarcodeValue] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const initializeScanner = () => {
            Quagga.init({
                inputStream: {
                    type: 'LiveStream',
                    target: document.querySelector('#scanner-container'),
                    constraints: {
                        facingMode: 'environment',
                    },
                },
                decoder: {
                    readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'],
                    multiple: false
                },
            }, (err) => {
                if (err) {
                    console.error('Error initializing Quagga:', err);
                    setError('Failed to initialize the scanner. Please check your camera permissions.');
                    return;
                }
                Quagga.start();
            });

            Quagga.onDetected((data) => {
                if (data && data.codeResult && data.codeResult.code) {
                    const scannedValue = data.codeResult.code;
                    setBarcodeValue(scannedValue);
                    sendToBackend(scannedValue);
                }
            });
        };

        initializeScanner();

        return () => {
            Quagga.stop();
        };
    }, []);

    const sendToBackend = async (barcode) => {
        try {
            const response = await axios.post(`https://not.webyourvyavsay.com/scan`, 
                { barcode },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                }
            );
            console.log('Barcode stored successfully:', response.data);
            alert(`User added successfully with barcode: ${barcode}`);
            window.location.reload();
        } catch (error) {
            console.error('Error storing barcode:', error);
            if (error.response && error.response.status === 409) {
                alert(`User already registered with Barcode: ${barcode}`);
            } else {
                setError('An error occurred while processing the barcode. Please try again.');
            }
        }
    };

    return (
        <div>
            <h2>Barcode Scanner</h2>
            <div id="scanner-container" style={{ width: '100%', height: '400px' }} />
            {barcodeValue && <p>Scanned Barcode: {barcodeValue}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Scanner;