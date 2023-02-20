import React from "react"

const Select = ({
    name = "",
    id = "",
    placeholder,
    label = "No Label",
    className,
    items,
    selectKey,
    disabled = false,
    onChange,
    value
}: any) => {

    const onChangeSelect = (e: any) => {
        console.log(e.target.value)
        onChange(e.target.value)
    }

    return (
        <div className={"w-full form-control " + className}>
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <select
                name={name}
                id={id}
                placeholder={placeholder}
                className="w-full select select-bordered"
                disabled={disabled}
                onChange={onChangeSelect}
                value={value}
            >
                <option value="">{placeholder}</option>
                {items?.map((item: any, key: any) => {
                    return (
                        <option value={item[selectKey]} key={key}>
                            {item[selectKey]}
                        </option>
                    )
                })}
            </select>
        </div>
    )
}

export default Select
