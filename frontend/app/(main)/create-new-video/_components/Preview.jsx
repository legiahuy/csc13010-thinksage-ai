import React from 'react'
import Image from 'next/image'
import { options } from './VideoStyle'

function Preview({formData}) {
    const selectVideoStyle = formData && options.find((item=>item?.name==formData?.videoStyle));
    console.log(selectVideoStyle);
    return formData?.videoStyle && (
        <div className='relative'>
            <h4 className="text-lg font-medium mb-3">Preview caption style</h4>
            <Image src={selectVideoStyle?.image} alt={selectVideoStyle?.name}
                width={1000}
                height={300}
                className='w-full h-[70vh] object-cover rounded-xl'
            />
            <h2 className={`${formData?.caption?.style} absolute bottom-7 text-center w-full`}>{formData?.caption?.name}</h2>
        </div>
    )
}

export default Preview
