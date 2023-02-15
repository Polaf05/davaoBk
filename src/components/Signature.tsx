import { useEffect, useRef, useState } from 'react';
import ReactSignatureCanvas from 'react-signature-canvas';

export const Signature = (props: { signature: any, setSignature: any }) => {
    const [trimmedDataURL, setTrimmedDataURL] = useState<string | null>(null);

    const [image, setImage] = useState("");

    const sigCanvas = useRef(null);

    const handleTrim = (dataURL: string) => {
        setTrimmedDataURL(dataURL);
    };
    const handleSave = () => {
        //@ts-ignore
        const dataURL = sigCanvas.current.getCanvas().toDataURL();

        props.setSignature(dataURL);
        // You can now save the dataURL to your backend or display it in an image tag, etc.
    };

    const handleClear = () => {
        //@ts-ignore
        const dataURL = sigCanvas.current.clear();
    };
    useEffect(() => {
        console.log(trimmedDataURL)
    }, [trimmedDataURL])

    return (
        <div className='flex justify-center items-center content-center'>
            <div className='flex-col'>
                <div className='bg-white'>
                    <ReactSignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        backgroundColor="transparent"
                        onEnd={handleTrim}
                        canvasProps={{
                            width: 500,
                            height: 200,
                            className: "sigCanvas"

                        }}
                    />
                </div>
                <div className="flex flex-row items-center w-full content-center justify-center gap-5">
                    <button onClick={handleSave}>Save Signature</button>
                    <button onClick={handleClear}>Clear Signature</button>
                </div>
            </div>
        </div>
    );
};