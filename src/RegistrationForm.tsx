import React, { useEffect, useState } from 'react';
import Modal from './components/Modal';
import QrComponent from './components/QR Reader';
import { philsysForm } from './lib/generics';
import PocketBase from 'pocketbase';
import dayjs from 'dayjs';
import { WebcamComponent } from './components/WebcamReader';
import { Stepper, Button, Group, FileInput } from '@mantine/core';
import axios from 'axios';
import sendData from './lib/api';

const pb = new PocketBase('http://127.0.0.1:8090/');

const RegisterForm = () => {

    const [qrVisible, setQrVisible] = useState<boolean>(false);

    const [camVisible, setCamVisible] = useState<boolean>(false);

    const [screenshot, setScreenshot] = useState();

    const [active, setActive] = useState(0);

    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const [pin, setPin] = useState(['', '', '', '']);

    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);

    const [match, setMatch] = useState(false);

    const [formData, setFormData] = useState<any>({
        DateIssued: new Date(),
        Issuer: "",
        subject: {
            Suffix: '',
            lName: '',
            fName: '',
            mName: '',
            sex: '',
            BF: '',
            DOB: new Date(),
            POB: '',
            PCN: '',
            phone: '',
            marital: '',
            occupation: '',
        },
        alg: '',
        pin: '',
        signature: ''
    });

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePinChange = (event: any, index: any) => {
        const newPin = [...pin];
        newPin[index] = event.target.value;
        setPin(newPin);

        if (event.target.value.length === 1 && index < 3) {
            const nextInput = document.getElementById(`input-${index + 1}`);
            nextInput?.focus();
        }

        if (JSON.stringify(pin) === JSON.stringify(confirmPin)) {
            setMatch(true);
        } else {
            setMatch(false);
        }
    };

    function generateUID() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }


    const handleConfirmPinChange = (event: any, index: any) => {
        const newConfirmPin = [...confirmPin];
        newConfirmPin[index] = event.target.value;
        setConfirmPin(newConfirmPin);

        if (event.target.value.length === 1 && index < 3) {
            const nextInput = document.getElementById(`confirm-input-${index + 1}`);
            nextInput?.focus();
        }

        if (JSON.stringify(pin) === JSON.stringify(newConfirmPin)) {
            setMatch(true);
        } else {
            setMatch(false);
        }
    };

    const parseDate = (dateString: Date) => {
        const parsedDate = new Date(dateString + " 12:00:00");
        const convertedDate = parsedDate.toISOString();

        return convertedDate;
    }

    const handleSubjectChange = (e: any) => {
        setFormData({
            ...formData,
            subject: {
                ...formData.subject,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        let flag = true;
        let count = 0;

        while (flag && count < 10) {
            if (formData.subject.phone === "" || formData.subject.phone === null || formData.subject.phone === undefined) {
                formData.subject.phone = generateUID();
            }
            console.log("ikot")
            count++;
            const insertData = {
                f_name: formData.subject.fName,
                l_name: formData.subject.lName,
                m_name: formData.subject.mName,
                gender: formData.subject.sex,
                occupation: formData.subject.occupation,
                phone: formData.subject.phone,
                email: `${formData.subject.lName}.${formData.subject.fName}@lgudavao.com`,
                password: pin.join(""),
            }


            let rsp: any = await sendData(screenshot, insertData);
            console.log(rsp);

            if (rsp === "success") {
                flag = false;
                const pocketData = {
                    fullname: formData.subject.lName + " " + formData.subject.fName + " " + formData.subject.mName + " " + formData.subject.Suffix,
                    fullname_data: {
                        fName: formData.subject.fName,
                        lName: formData.subject.lName,
                        mName: formData.subject.mName,
                        suffix: formData.subject.Suffix,
                    },
                    dob: parseDate(formData.subject.DOB),
                    suffix: formData.subject.Suffix,
                    bf: formData.subject.BF,
                    pcn: formData.subject.PCN,
                    pob: formData.subject.POB,
                    date_issued: parseDate(formData.DateIssued),
                    sex: formData.subject.sex,
                    occupation: formData.subject.occupation,
                    phone: insertData.phone,
                    marital: formData.subject.marital,
                    // image: screenshot,
                    alg: formData.alg,
                }
                console.log(insertData)
                const record = await pb.collection('constituents').create(pocketData

                ).then(() => { console.log("nice") }).catch((e) => { console.log(e) })
                console.log(formData);
            }
        }
    };

    // useEffect(() => {
    //     if (pin !== confirmPin) {
    //         setError('Pins do not match');
    //         return;
    //     } else {
    //         setError('');
    //     }
    // }, [pin, confirmPin])

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Stepper active={active} breakpoint="sm">
                    <Stepper.Step label="First step" description="Create an account">
                        <Modal title={'QR READER'} isVisible={qrVisible} setIsVisible={setQrVisible} className={'max-w-sm'}>
                            <div>
                                {qrVisible && <QrComponent formData={formData} setFormData={setFormData} />}
                            </div>
                        </Modal>
                        <div className='flex justify-end space-x-2'>
                            <button type='button' className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setQrVisible(true)}> Scan QR Code</button>
                        </div>
                        <div>
                            <div className="flex flex-col md:flex-row mb-4">
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="DateIssued"
                                    >
                                        Date Issued
                                    </label>
                                    <input
                                        type="text"
                                        name="DateIssued"
                                        id="DateIssued"
                                        className="form-input w-full"
                                        value={formData.DateIssued}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-4">
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="Suffix"
                                    >
                                        Suffix
                                    </label>
                                    <input
                                        type="text"
                                        name="Suffix"
                                        id="Suffix"
                                        className="form-input w-full"
                                        value={formData.subject.Suffix}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="lName"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lName"
                                        id="lName"
                                        className="form-input w-full"
                                        value={formData.subject.lName}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="fName"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fName"
                                        id="fName"
                                        className="form-input w-full"
                                        value={formData.subject.fName}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="mName"
                                    >
                                        Middle Name
                                    </label>
                                    <input
                                        type="text"
                                        name="mName"
                                        id="mName"
                                        className="form-input w-full"
                                        value={formData.subject.mName}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-4">

                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="sex"
                                    >
                                        Sex
                                    </label>
                                    <input
                                        type="text"
                                        name="sex"
                                        id="sex"
                                        className="form-input w-full"
                                        value={formData.subject.sex}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="BF"
                                    >
                                        BF
                                    </label>
                                    <input
                                        type="text"
                                        name="BF"
                                        id="BF"
                                        className="form-input w-full"
                                        value={formData.subject.BF}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="phone"
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        className="form-input w-full"
                                        value={formData.subject.phone}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="marital"
                                    >
                                        Marital Status
                                    </label>
                                    <input
                                        type="text"
                                        name="marital"
                                        id="marital"
                                        className="form-input w-full"
                                        value={formData.subject.marital}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-4">
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="DOB"
                                    >
                                        Date of Birth
                                    </label>
                                    <input
                                        type="text"
                                        name="DOB"
                                        id="DOB"
                                        className="form-input w-full"
                                        value={formData.subject.DOB}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="POB"
                                    >
                                        Place of Birth
                                    </label>
                                    <input
                                        type="text"
                                        name="POB"
                                        id="POB"
                                        className="form-input w-full"
                                        value={formData.subject.POB}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="PCN"
                                    >
                                        PCN
                                    </label>
                                    <input
                                        type="text"
                                        name="PCN"
                                        id="PCN"
                                        className="form-input w-full"
                                        value={formData.subject.PCN}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label
                                        className="block font-medium mb-2 text-gray-700"
                                        htmlFor="occupation"
                                    >
                                        Occupation
                                    </label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        id="occupation"
                                        className="form-input w-full"
                                        value={formData.subject.occupation}
                                        onChange={handleSubjectChange}
                                    />
                                </div>

                            </div>
                        </div>
                    </Stepper.Step>
                    <Stepper.Step label="Second step" description="ID Picture">

                        <div className='flex justify-center m-4 flex-col'>
                            <button type='button' className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setCamVisible(true)}>Take Picture</button>

                            {/* <FileInput
                                placeholder="Pick file"
                                label="Upload Picture"
                                accept="image/png,image/jpeg"
                                value={screenshot}
                                onChange={(e) => { console.log(e); setScreenshot(e) }}
                                withAsterisk
                            /> */}
                            <img className='m-4' src={screenshot} />
                        </div>
                    </Stepper.Step>

                    <Stepper.Step label="Final step" description="Get full access">
                        <div className='flex items-center flex-col'>
                            <div className="mb-4 flex flex-col justify-center">
                                <label className="block font-bold mb-2 text-gray-700" htmlFor="pin">
                                    Pin
                                </label>
                                <div className='flex-row'>
                                    {pin.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`input-${index}`}
                                            className="shadow appearance-none border rounded w-12 py-2 px-3 mx-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            type="password"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(event) => handlePinChange(event, index)}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4 flex flex-col justify-center">
                                <label className="block font-bold mb-2 text-gray-700" htmlFor="confirmPin">
                                    Confirm Pin
                                </label>
                                <div className='flex-row'>
                                    {confirmPin.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`confirm-input-${index}`}
                                            className="shadow appearance-none border rounded w-12 py-2 px-3 mx-1 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            type="password"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(event) => handleConfirmPinChange(event, index)}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center flex-col'>
                            {match ? (
                                <p className="text-green-500 mt-2">Pins match</p>
                            ) : (
                                <p className="text-red-500 mt-2">Pins do not match</p>
                            )}
                        </div>
                    </Stepper.Step>
                </Stepper>



                <Modal isVisible={camVisible} setIsVisible={setCamVisible} title='Id Picture' className='max-w-xl'>
                    <WebcamComponent screenshot={screenshot} setScreenshot={setScreenshot} />
                </Modal>

                <Group position="center" mt="xl">
                    {active > 0 && <p className="hover:underline hover:cursor-pointer" onClick={prevStep}>Back</p>}
                    {active < 2 && <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={nextStep}>Next step</button>}
                    {active === 2 && <div className="text-right">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                        >
                            Submit
                        </button>
                    </div>}
                </Group>
            </form>
        </div>
    );
};

export default RegisterForm;