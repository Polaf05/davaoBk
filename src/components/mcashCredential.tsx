import React, { useEffect, useRef, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { philsysForm } from '../lib/generics';

const MCashCredentials = (props: {
    accountNumber: any
    nextStep: any
    setCreds: any
}) => {

    return (
        <div>
            <p className='font-bold'>Your MCash Credential is</p>
            <p className='font-semibold'>Account Number: <span>{props.accountNumber}</span></p>
            <p className='font-semibold'>4 Digit PIN: <span>* * * *</span></p>

            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                    props.nextStep()
                    props.setCreds(false)
                }}>Next Step</button>
        </div>
    );
};

export default MCashCredentials;