import React, { useEffect, useState } from "react"
import Modal from "./components/Modal"
import QrComponent from "./components/QR Reader"
import { philsysForm } from "./lib/generics"
import PocketBase from "pocketbase"
import dayjs from "dayjs"
import { WebcamComponent } from "./components/WebcamReader"
import { Stepper, Button, Group, FileInput } from "@mantine/core"
import axios from "axios"
import sendData from "./lib/api"
import { Signature } from "./components/Signature"
import { DatePicker } from "@mantine/dates"
import { jobCategoryOptions, maritalStatusOptions } from "./lib/dropdownvalues"

const pb = new PocketBase("http://127.0.0.1:8090/")

const RegisterForm = () => {
    const [qrVisible, setQrVisible] = useState<boolean>(false)

    const [camVisible, setCamVisible] = useState<boolean>(false)

    const [screenshot, setScreenshot] = useState()

    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const [signature, setSignature] = useState(null);

    const [active, setActive] = useState(0)

    const [dateIssue, setDateIssued] = useState<Date | null>(new Date());

    const [dob, setDOB] = useState<Date | null>(null);

    const nextStep = () => setActive((current) => (current < 4 ? current + 1 : current))

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

    const [pin, setPin] = useState(["", "", "", ""])

    const [confirmPin, setConfirmPin] = useState(["", "", "", ""])

    const [match, setMatch] = useState(false)

    const [pdfUrl, setPdfUrl] = useState(null)

    const [addresData, setAddressData] = useState({
        unit: '',
        houseNo: '',
        building: '',
        region: '',
        province: '',
        municipality: '',
        barangay: '',
        zipCode: '',
    });

    const [formData, setFormData] = useState<any>({
        DateIssued: new Date(),
        Issuer: "",
        subject: {
            Suffix: "",
            lName: "",
            fName: "",
            mName: "",
            sex: "",
            BF: "",
            DOB: new Date(),
            POB: "",
            PCN: "",
            phone: "",
            marital: "single",
            occupation: "",
            address: "",
            benefits: [],
        },
        alg: "",
        pin: "",
        signature: "",
    })

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handlePinChange = (event: any, index: any) => {
        const newPin = [...pin]
        newPin[index] = event.target.value
        setPin(newPin)

        if (event.target.value.length === 1 && index < 3) {
            const nextInput = document.getElementById(`input-${index + 1}`)
            nextInput?.focus()
        }

        if (JSON.stringify(pin) === JSON.stringify(confirmPin)) {
            setMatch(true)
        } else {
            setMatch(false)
        }
    }

    function generateUID() {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }

    const handleConfirmPinChange = (event: any, index: any) => {
        const newConfirmPin = [...confirmPin]
        newConfirmPin[index] = event.target.value
        setConfirmPin(newConfirmPin)

        if (event.target.value.length === 1 && index < 3) {
            const nextInput = document.getElementById(`confirm-input-${index + 1}`)
            nextInput?.focus()
        }

        if (JSON.stringify(pin) === JSON.stringify(newConfirmPin)) {
            setMatch(true)
        } else {
            setMatch(false)
        }
    }

    const parseDate = (dateString: Date) => {
        const parsedDate = new Date(dateString + " 12:00:00")
        const convertedDate = parsedDate.toISOString()

        return convertedDate
    }

    const handleSubjectChange = (e: any) => {
        setFormData({
            ...formData,
            subject: {
                ...formData.subject,
                [e.target.name]: e.target.value,
            },
        })

        console.log(formData);
    }
    const handleOptionChange = (event: any) => {
        if (selectedOptions.includes(event.target.value)) {
            setSelectedOptions(selectedOptions.filter((item) => item !== event.target.value));
        } else {
            setSelectedOptions([...selectedOptions, event.target.value]);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        let flag = true
        let count = 0

        while (flag && count < 10) {
            if (
                formData.subject.phone === "" ||
                formData.subject.phone === null ||
                formData.subject.phone === undefined
            ) {
                formData.subject.phone = generateUID()
            }
            console.log("ikot")
            count++
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

            let rsp: any = await sendData(screenshot, insertData)
            console.log(rsp)

            if (rsp === "success") {
                flag = false
                const pocketData = {
                    fullname:
                        formData.subject.lName +
                        " " +
                        formData.subject.fName +
                        " " +
                        formData.subject.mName +
                        " " +
                        formData.subject.Suffix,
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
                    address: addresData,
                    // image: screenshot,
                    alg: formData.alg,
                }

                const formDataX = new FormData()

                formDataX.append("fullname", pocketData.fullname)
                formDataX.append("fullname_data", JSON.stringify(pocketData.fullname_data))
                formDataX.append("dob", pocketData.dob)
                formDataX.append("suffix", pocketData.suffix)
                formDataX.append("bf", pocketData.bf)
                formDataX.append("pcn", pocketData.pcn)
                formDataX.append("pob", pocketData.pob)
                formDataX.append("date_issued", pocketData.date_issued)
                formDataX.append("sex", pocketData.sex)
                formDataX.append("occupation", pocketData.occupation)
                formDataX.append("phone", pocketData.phone)
                formDataX.append("marital", pocketData.marital)
                formDataX.append("alg", pocketData.alg)
                formDataX.append("benefits", selectedOptions.toString())

                const newImage = base64ConvertToFile(screenshot ?? "")
                const newSignature = base64ConvertToFile(signature ?? "")
                formDataX.append("picture", newImage)
                formDataX.append("signature", newSignature);

                console.log(insertData)
                const record = await pb
                    .collection("constituents")
                    .create(formDataX)
                    .then((res) => {
                        console.log("nice")
                        console.log(res)
                    })
                    .catch((e) => {
                        console.log(e)
                    })

                // const formDataX2 = new FormData()
                // formDataX2.append("file", newImage)
                // formDataX2.append("signature", newSignature)
                // formDataX2.append("name", pocketData.fullname)
                // formDataX2.append("address", `${addresData.unit} ${addresData.houseNo} ${addresData.barangay} ${addresData.municipality} ${addresData.province} ${addresData.region} ${addresData.zipCode}`)
                // formDataX2.append("dob", pocketData.dob)
                // formDataX2.append("date_issue", pocketData.date_issued)
                // formDataX2.append("marital_status", pocketData.marital)
                // formDataX2.append("gender", pocketData.sex)
                // formDataX2.append("phone", pocketData.phone)
                // formDataX2.append("philsys_data", JSON.stringify(pocketData))

                // axios
                //     .post("http://127.0.0.1:3000", formDataX2, {
                //         responseType: "blob",
                //         headers: {
                //             "Content-Type": "multipart/form-data",
                //         },
                //     })
                //     .then((response) => {
                //         //@ts-ignore
                //         setPdfUrl(URL.createObjectURL(response.data))
                //     })
                handleGeneratePdf()
            }
            // 
            nextStep();
        }
    }

    const handleGeneratePdf = () => {
        const formDataX2 = new FormData()
        const newImage = base64ConvertToFile(screenshot ?? "")
        const newSign = base64ConvertToFile(signature ?? "");
        formDataX2.append("file", newImage)
        formDataX2.append("file1", newSign)
        formDataX2.append(
            "name",
            formData.subject.lName +
            " " +
            formData.subject.fName +
            " " +
            formData.subject.mName +
            " " +
            formData.subject.Suffix
        )
        formDataX2.append("address", formData.subject.POB)
        formDataX2.append("dob", formData.subject.DOB)
        formDataX2.append("date_issue", formData.DateIssued)
        formDataX2.append("marital_status", formData.subject.marital)
        formDataX2.append("gender", formData.subject.sex)
        formDataX2.append("phone", formData.subject.phone)
        formDataX2.append("pcn", formData.subject.PCN)
        formDataX2.append("philsys_data", JSON.stringify(formData))

        for (const [key, value] of formDataX2.entries()) {
            console.log(key, value)
        }

        axios
            .postForm("http://localhost:3000", formDataX2, {
                responseType: "blob",
                // headers: {
                //     "Content-Type": "multipart/form-data",
                // },
            })
            .then((response) => {
                //@ts-ignore
                setPdfUrl(URL.createObjectURL(response.data))
            })
    }

    const base64ConvertToFile = (base64Image: string) => {
        // Extract the MIME type and base64 data from the image string
        let [mimeType, imageData] = base64Image.split(",")

        // Create a Blob from the base64 data
        let binary = atob(imageData)
        let array = []
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i))
        }
        let file = new Blob([new Uint8Array(array)], { type: mimeType })
        return file
    }

    // useEffect(() => {
    //     if (pin !== confirmPin) {
    //         setError('Pins do not match');
    //         return;
    //     } else {
    //         setError('');
    //     }
    // }, [pin, confirmPin])

    return (
        <div className="">
            <form onSubmit={handleSubmit}>
                <Stepper active={active} breakpoint="sm">
                    <Stepper.Step label="First step" description="Create an account">
                        <Modal
                            title={"QR READER"}
                            isVisible={qrVisible}
                            setIsVisible={setQrVisible}
                            className={"max-w-sm"}
                        >
                            <div>{qrVisible && <QrComponent formData={formData} setFormData={setFormData} setIsVisible={setQrVisible} />}</div>
                        </Modal>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => setQrVisible(true)}
                            >
                                Integrate Philsys Information
                            </button>
                        </div>
                        <div>
                            <div className="py-4">
                                <p className="text-xl font-bold">Personal Information</p>
                                <hr />
                            </div>
                            <div className="flex flex-col md:flex-row mb-4">
                                <div className="md:w-1/3 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="PCN">
                                        PCN
                                    </label>
                                    <input
                                        type="text"
                                        name="PCN"
                                        id="PCN" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"

                                        value={formData.subject.PCN}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="DateIssued">
                                        Date Issued
                                    </label>
                                    <DatePicker withAsterisk onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            DateIssued: e,

                                        })
                                    }} value={new Date(formData.DateIssued)} size="md" />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-4">
                                <div className="md:w-1/3 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="lName">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lName"
                                        id="lName" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"

                                        value={formData.subject.lName}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="fName">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fName"
                                        id="fName" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"

                                        value={formData.subject.fName}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="mName">
                                        Middle Name
                                    </label>
                                    <input
                                        type="text"
                                        name="mName"
                                        id="mName" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"

                                        value={formData.subject.mName}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="w-1/12 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="Suffix">
                                        Suffix
                                    </label>
                                    <input
                                        type="text"
                                        name="Suffix"
                                        id="Suffix" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"

                                        value={formData.subject.Suffix}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-4">
                                <div className="md:w-1/3 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="DOB">
                                        Date of Birth
                                    </label>
                                    <DatePicker placeholder="Pick date" withAsterisk onChange={(val) => {
                                        setFormData({
                                            ...formData,
                                            subject: {
                                                ...formData.subject,
                                                DOB: val,
                                            }

                                        })
                                    }} value={new Date(formData.subject.DOB)} size="md" />
                                </div>

                                <div className="md:w-1/6 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="sex">
                                        Sex
                                    </label>
                                    <input
                                        type="text"
                                        name="sex"
                                        id="sex" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"

                                        value={formData.subject.sex}
                                        onChange={handleSubjectChange}
                                    />
                                </div>


                            </div>

                            <div className="flex flex-col md:flex-row mb-4">
                                <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="POB">
                                        Place of Birth
                                    </label>
                                    <input
                                        type="text"
                                        name="POB"
                                        id="POB" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.subject.POB}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="py-4">
                                <p className="text-xl font-bold">Other Information</p>
                                <hr />
                            </div>
                            <div className="flex flex-col md:flex-row mb-4">
                                <div className="md:w-1/3 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="phone">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        id="phone" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.subject.phone}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="occupation">
                                        Occupation
                                    </label>
                                    <select
                                        name="occupation"
                                        id="occupation"
                                        value={formData.occupation}
                                        onChange={handleSubjectChange}
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                        {jobCategoryOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                                <div className="md:w-1/3 mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="marital">
                                        Marital Status
                                    </label>
                                    <select
                                        name="marital"
                                        id="marital"
                                        value={formData.marital}
                                        onChange={handleSubjectChange}
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                        {maritalStatusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-4">
                                {/* <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="address">
                                        Permanent Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        id="address"
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.subject.address}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                            </div>
                            <div> */}
                                <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="unit">Unit</label>
                                    <input
                                        type="text"
                                        name="unit"
                                        id="unit"
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.unit}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="houseNo">House No.</label>
                                    <input
                                        type="text"
                                        name="houseNo"
                                        id="houseNo"
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.houseNo}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="building">Building</label>
                                    <input
                                        type="text"
                                        name="building"
                                        id="building"
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.building}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="region">Region</label>
                                    <input
                                        type="text"
                                        name="region"
                                        id="region"
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.region}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="province">Province</label>
                                    <input
                                        type="text"
                                        name="province"
                                        id="province"
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.province}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="municipality">Municipality</label>
                                    <input
                                        type="text"
                                        name="municipality"
                                        id="municipality"
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.municipality}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="barangay">Barangay</label>
                                    <input
                                        type="text"
                                        name="barangay"
                                        id="barangay"
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.barangay}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                                <div className="w-full mr-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="zipCode">ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        id="zipCode"
                                        className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        value={formData.zipCode}
                                        onChange={handleSubjectChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Benefits</p>
                            </div>
                            <div className="flex flex-row space-x-4 py-2">
                                <div className="flex items-center">
                                    <input
                                        id="checked-scholar"
                                        type="checkbox"
                                        value="Scholar"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedOptions.includes('Scholar')}
                                        onChange={handleOptionChange} />
                                    <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Scholar</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="checked-4ps"
                                        type="checkbox"
                                        value="4ps"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedOptions.includes('4ps')}
                                        onChange={handleOptionChange} />
                                    <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">4p's</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="checked-senior"
                                        type="checkbox"
                                        value="Senior"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedOptions.includes('Senior')}
                                        onChange={handleOptionChange} />
                                    <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Senior</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="checked-sap"
                                        type="checkbox"
                                        value="Sap"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedOptions.includes('Sap')}
                                        onChange={handleOptionChange} />
                                    <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">SAP</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="checked-single"
                                        type="checkbox"
                                        value="Single"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedOptions.includes('Single')}
                                        onChange={handleOptionChange} />
                                    <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Single Parent</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="checked-pwd"
                                        type="checkbox"
                                        value="Pwd"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedOptions.includes('Pwd')}
                                        onChange={handleOptionChange} />
                                    <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Person with Disability</label>
                                </div>
                            </div>
                        </div>

                    </Stepper.Step>
                    <Stepper.Step label="Second step" description="ID Picture">
                        <div className="flex justify-center m-4 flex-col">
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => setCamVisible(true)}
                            >
                                Take Picture
                            </button>

                            {screenshot && <img className="m-4 h-96 w-96 self-center" src={screenshot} />}

                            {/* <FileInput
                                placeholder="Pick file"
                                label="Upload Picture"
                                accept="image/png,image/jpeg"
                                value={screenshot}
                                onChange={(e) => { console.log(e); setScreenshot(e) }}
                                withAsterisk
                            /> */}
                            <div className="my-5">
                                <p className="text-xl font-bold">User Signature</p>
                                <hr />
                                <div className="my-4">
                                    <Signature signature={signature} setSignature={setSignature} />
                                </div>
                            </div>
                        </div>
                    </Stepper.Step>

                    <Stepper.Step label="Third Step" description="Add wallet pin">
                        <div className="flex items-center flex-col">
                            <div className="mb-4 flex flex-col justify-center">
                                <label className="block font-bold mb-2 text-gray-700" htmlFor="pin">
                                    Pin
                                </label>
                                <div className="flex-row">
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
                                <div className="flex-row">
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
                        <div className="flex items-center flex-col">
                            {match ? (
                                <p className="text-green-500 mt-2">Pins match</p>
                            ) : (
                                <p className="text-red-500 mt-2">Pins do not match</p>
                            )}
                        </div>

                    </Stepper.Step>
                    <Stepper.Step label="Fourth Step" description="Confirmation">
                        <div className="flex justify-center m-4 flex-col">
                            <div>
                                <div>
                                    <div className="flex flex-col md:flex-row mb-4 items-end justify-between py-4">
                                        <div className="w-[80%]">
                                            <div className="py-4">
                                                <p className="text-xl font-bold">Personal Information</p>
                                                <hr />
                                            </div>
                                            <div className="flex flex-col md:flex-row mb-4 content-end items-end">
                                                <div className="md:w-1/3 mr-4">
                                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="PCN">
                                                        PCN
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="PCN"
                                                        id="PCN" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        disabled
                                                        value={formData.subject.PCN}
                                                        onChange={handleSubjectChange}
                                                    />
                                                </div>
                                                <div className="md:w-1/3 mr-4">
                                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="DateIssued">
                                                        Date Issued
                                                    </label>

                                                    <DatePicker withAsterisk onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            DateIssued: e,

                                                        })
                                                    }} value={new Date(formData.DateIssued)} size="md"
                                                        disabled />
                                                </div>
                                            </div>


                                        </div>
                                        <div className="flex justify-end">
                                            <div className="flex-col">
                                                {screenshot && <img src={screenshot ?? ""} className="w-48"></img>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row mb-4">
                                        <div className="md:w-1/3 mr-4">
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="lName">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="lName"
                                                id="lName" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                disabled
                                                value={formData.subject.lName}
                                                onChange={handleSubjectChange}
                                            />
                                        </div>
                                        <div className="md:w-1/3 mr-4">
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="fName">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="fName"
                                                id="fName" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                disabled
                                                value={formData.subject.fName}
                                                onChange={handleSubjectChange}
                                            />
                                        </div>
                                        <div className="md:w-1/3 mr-4">
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="mName">
                                                Middle Name
                                            </label>
                                            <input
                                                type="text"
                                                name="mName"
                                                id="mName" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                disabled
                                                value={formData.subject.mName}
                                                onChange={handleSubjectChange}
                                            />
                                        </div>
                                        <div className="w-1/12 mr-4">
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="Suffix">
                                                Suffix
                                            </label>
                                            <input
                                                type="text"
                                                name="Suffix"
                                                id="Suffix" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                disabled
                                                value={formData.subject.Suffix}
                                                onChange={handleSubjectChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row mb-4">
                                        <div className="md:w-1/3 mr-4">
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="DOB">
                                                Date of Birth
                                            </label>
                                            <DatePicker placeholder="Pick date" withAsterisk onChange={(val) => {
                                                setFormData({
                                                    ...formData,
                                                    subject: {
                                                        ...formData.subject,
                                                        DOB: val,
                                                    }

                                                })
                                            }} value={new Date(formData.subject.DOB)} size="md"
                                                disabled />
                                        </div>

                                        <div className="md:w-1/6 mr-4">
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="sex">
                                                Sex
                                            </label>
                                            <input
                                                type="text"
                                                name="sex"
                                                id="sex" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                disabled
                                                value={formData.subject.sex}
                                                onChange={handleSubjectChange}
                                            />
                                        </div>


                                    </div>

                                    <div className="flex flex-col md:flex-row mb-4">
                                        <div className="w-full mr-4">
                                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="POB">
                                                Place of Birth
                                            </label>
                                            <input
                                                type="text"
                                                name="POB"
                                                id="POB" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                disabled
                                                value={formData.subject.POB}
                                                onChange={handleSubjectChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="py-4">
                                    <p className="text-xl font-bold">Other Information</p>
                                    <hr />
                                </div>
                                <div className="flex flex-col md:flex-row mb-4">
                                    <div className="md:w-1/3 mr-4">
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="phone">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            id="phone" className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            disabled
                                            value={formData.subject.phone}
                                            onChange={handleSubjectChange}
                                        />
                                    </div>
                                    <div className="md:w-1/3 mr-4">
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="occupation">
                                            Occupation
                                        </label>
                                        <select
                                            name="occupation"
                                            id="occupation"
                                            value={formData.occupation}
                                            disabled
                                            onChange={handleSubjectChange}
                                            className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        >
                                            {jobCategoryOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                    <div className="md:w-1/3 mr-4">
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="marital">
                                            Marital Status
                                        </label>
                                        <select
                                            name="marital"
                                            id="marital"
                                            value={formData.marital}
                                            disabled
                                            onChange={handleSubjectChange}
                                            className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        >
                                            {maritalStatusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row mb-4">
                                    <div className="w-full mr-4">
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white" htmlFor="address">
                                            Permanent Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            id="address"
                                            className="form-input w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            disabled
                                            value={formData.subject.address}
                                            onChange={handleSubjectChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Beneficiaries</p>
                                </div>
                                <div className="flex flex-row space-x-4 py-2">
                                    <div className="flex items-center">
                                        <input
                                            id="checked-scholar"
                                            type="checkbox"
                                            value="Scholar"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            disabled
                                            checked={selectedOptions.includes('Scholar')}
                                            onChange={handleOptionChange} />
                                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Scholar</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="checked-4ps"
                                            type="checkbox"
                                            value="4ps"
                                            disabled
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            checked={selectedOptions.includes('4ps')}
                                            onChange={handleOptionChange} />
                                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">4p's</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="checked-senior"
                                            type="checkbox"
                                            value="Senior"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            disabled
                                            checked={selectedOptions.includes('Senior')}
                                            onChange={handleOptionChange} />
                                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Senior</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="checked-sap"
                                            type="checkbox"
                                            value="Sap"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            disabled
                                            checked={selectedOptions.includes('Sap')}
                                            onChange={handleOptionChange} />
                                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">SAP</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="checked-single"
                                            type="checkbox"
                                            value="Single"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            disabled
                                            checked={selectedOptions.includes('Single')}
                                            onChange={handleOptionChange} />
                                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Single Parent</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="checked-pwd"
                                            type="checkbox"
                                            value="Pwd"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            disabled
                                            checked={selectedOptions.includes('Pwd')}
                                            onChange={handleOptionChange} />
                                        <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Person with Disability</label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row justify-between">


                                <div className="flex-col">
                                    <p>Signature</p>
                                    {signature && <img src={signature ?? ""} className="bg-white"></img>}
                                </div>
                            </div>


                        </div>
                    </Stepper.Step>
                    <Stepper.Step>
                        <div className="h-[700px]">
                            {pdfUrl && <DisplayPDF pdfUrl={pdfUrl} />}
                        </div>
                    </Stepper.Step>
                </Stepper>

                <Modal isVisible={camVisible} setIsVisible={setCamVisible} title="Id Picture" className="max-w-xl">
                    <WebcamComponent screenshot={screenshot} setScreenshot={setScreenshot} setIsVisible={setCamVisible} />
                </Modal>

                <Group position="center" mt="xl">
                    {active > 0 && (
                        <p className="hover:underline hover:cursor-pointer" onClick={prevStep}>
                            Back
                        </p>
                    )}
                    {active < 3 && (
                        <button
                            // type={active === 2 ? "submit" : "button"}
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={nextStep}
                        >
                            Next step
                        </button>
                    )}
                    {active === 3 && (
                        <div className="text-right">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </Group>
            </form>
        </div>
    )
}

export default RegisterForm

function DisplayPDF({ pdfUrl }: any) {
    return <object data={pdfUrl} type="application/pdf" width="100%" height="100%" />
}


