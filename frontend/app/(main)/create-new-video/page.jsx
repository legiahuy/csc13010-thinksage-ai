"use client"
import React from 'react'
import Topic from './_components/Topic'
import { useState } from 'react'

function CreateNewVideo() {

    const [formData,setFormData]=useState();

    const onHandleInputChange=(fieldName,fieldValue)=>{
        setFormData(prev=>({
            ...prev,
            [fieldName]:fieldValue
        }))
        console.log(formData);
    }
    
    return (
        <div>
            <h2 className='text-3xl'>Create New Video</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 mt-8'>
                <div className='col-span 2 p-7 border rounded-xl'>
                        {/* Topic and Script */}
                        <Topic onHandleInputChange={onHandleInputChange}/>
                        {/* Video Image Style */}

                        {/* Voice */}

                        {/* Captions */}
                    <div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateNewVideo
