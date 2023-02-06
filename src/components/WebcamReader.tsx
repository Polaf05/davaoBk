import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

export const WebcamComponent = (props: {
    screenshot: any,
    setScreenshot: any
}) => {

    const videoConstraints = {
        width: 720,
        height: 720,
        facingMode: "environment"
    };

    const webcamRef = useRef(null);

    const handleClick = async () => {
        //@ts-ignore
        const imageSrc = webcamRef.current.getScreenshot();
        props.setScreenshot(imageSrc);
    };


    return (
        <div>
            <Webcam
                audio={false}
                height={720}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={1280}
                videoConstraints={videoConstraints}
            />
            <button onClick={handleClick}>Take Screenshot</button>
            {props.screenshot && <img src={props.screenshot} />}
        </div>
    )
};