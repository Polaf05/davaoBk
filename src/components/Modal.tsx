import { Dialog, Transition } from "@headlessui/react"
// import { XCircleIcon } from "@heroicons/react/outline";
import React, { Fragment } from "react"

export default function Modal({
    title,
    isVisible,
    setIsVisible,
    children,
    className,
}: {
    title: string
    isVisible: boolean
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
    children: React.ReactElement
    className: string
}) {
    const closeModal = () => {
        setIsVisible(false)
    }

    // const openModal = () => {
    //   setIsVisible(true)
    // }

    return (
        <>
            <Transition appear show={isVisible} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-50" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto ">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel
                                    className={`bg-darkmode-300 w-full transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all ${className}`}
                                >
                                    <div className="p-6">
                                        <Dialog.Title
                                            as="h3"
                                            className="flex justify-between text-xl font-semibold leading-6 text-neutral-800"
                                        >
                                            {title}

                                            <div>
                                                <i className="fa-thin fa-circle-xmark hover:cursor-pointer" onClick={closeModal}></i>
                                            </div>

                                        </Dialog.Title>
                                    </div>
                                    <hr className="w-full"></hr>
                                    <div className="px-6 py-6">
                                        {children}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}