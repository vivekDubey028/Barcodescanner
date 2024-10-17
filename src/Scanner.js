import React, { useState, useEffect } from 'react';
import Quagga from 'quagga'; // Import QuaggaJS
import axios from 'axios';

const Scanner = () => {
    const [isScanning, setIsScanning] = useState(true); // Initialize isScanning state first
    const [barcodeValue, setBarcodeValue] = useState('');
    const [error, setError] = useState(''); // State for error messages

    // Initialize QuaggaJS on component mount
    useEffect(() => {
        if (isScanning) { // Start scanning only if isScanning is true
            Quagga.init({
                inputStream: {
                    type: 'LiveStream',
                    target: document.querySelector('#scanner-container'), // Attach camera stream to this element
                    constraints: {
                        facingMode: 'environment', // Use rear camera
                    },
                },
                decoder: {
                    readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'],
                    multiple: false // Supported barcode types
                },
            }, (err) => {
                if (err) {
                    console.error('Error initializing Quagga:', err);
                    return;
                }
                Quagga.start(); // Start the barcode scanner
            });

            // Detect and process barcode on each frame
            Quagga.onDetected((data) => {
                if (data && data.codeResult && data.codeResult.code) {
                    handleScan(data.codeResult.code);
                    Quagga.stop(); // Stop scanning once a barcode is detected
                    setIsScanning(false); // Update state to stop further scanning
                }
            });

            return () => {
                Quagga.stop(); // Stop Quagga when component is unmounted
            };
        }
    }, [isScanning]); // Depend on isScanning to trigger the effect
    
    const handleScan = (value) => {
        if (isScanning && value && value !== barcodeValue) {
            setIsScanning(false); // Stop scanning
            setBarcodeValue(value);
            sendToBackend(value); // Send scanned barcode to backend
        }
    };

    const sendToBackend = async (barcode) => {
        try {
            const response = await axios.post('https://not.webyourvyavsay.com/scan', {
                barcode: barcode,
            });

            // Ensure response is defined and contains data
            if (response && response.data) {
                console.log('Barcode stored successfully:', response.data);
                alert(`User added successfully with barcode: ${barcode}`); // Include the barcode in the alert
                window.location.reload(); // Reload the page after successful scan
            } else {
                console.error('Response data is undefined:', response);
            }
        } catch (error) {
            console.error('Error storing barcode:', error);

            // Handle error accordingly
            if (error.response) {
                // The request was made, but the server responded with a status code
                if (error.response.status === 409) {
                    // Show alert if the status code is 409 (Conflict) - user already registered
                    alert(`User already registered with Barcode: ${barcode}`);
                } else {
                    console.error('Server responded with:', error.response.data);
                }
            } else {
                // The request was made but no response was received
                console.error('Error message:', error.message);
            }
        }
    };

    return (
        <div>
            <h2>Barcode Scanner</h2>
            <div id="scanner-container" style={{ width: '100%', height: '400px' }}>
                {/* Quagga will attach the video stream here */}
            </div>
            {barcodeValue && <p>Scanned Barcode: {barcodeValue}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
        </div>
    );
};

export default Scanner;
