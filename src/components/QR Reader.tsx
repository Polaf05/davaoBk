import React, { useEffect, useRef, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { philsysForm } from '../lib/generics';

const QrComponent = (props: {
    formData: any,
    setFormData: any,
    setIsVisible: any,
}) => {
    const [data, setData] = useState<any>(null);
    const [facing, setFacing] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(true);

    useEffect(() => {
        if (data !== null) {
            console.log(data);
            if (data?.data) {
                try {
                    props.setFormData(data?.data)
                    props.setIsVisible(false);
                } catch (error) {
                    console.log("mali")
                }
            }
        }
    }, [data])
    return (
        <>
            <div className="btn" onClick={() => setFacing(!facing)}>
                Flip
            </div>

            <div className="btn" onClick={() => setMounted(!mounted)}>
                toggle
            </div>

            {mounted && <QrReader
                constraints={{ facingMode: facing ? "user" : "environment" }}
                onResult={(result, error) => {
                    if (!!result) {
                        // console.log(result);
                        try {
                            // @ts-ignore
                            const data: any = JSON.parse(result?.text);
                            setData({
                                message: "Success Decoding",
                                data: data,
                            });

                        } catch (error) {
                            setData({
                                message: "No data found",
                                data: null,
                            });
                        }
                    }

                    if (!!error) {
                        console.info("omu", error);
                        console.log(error);
                    }
                }}
                scanDelay={1000}
                // @ts-ignore
                style={{ width: "100%" }}
            />}
        </>
    );
};

export default QrComponent;