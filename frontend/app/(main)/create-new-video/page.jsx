"use client"
import React from 'react'
import Topic from './_components/Topic'
import { useState } from 'react'
import VideoStyle from './_components/VideoStyle'
import Voice from './_components/Voice'

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
            <div className='grid grid-cols-1 md:grid-cols-2 mt-8'>
                <div className='col-span 4 p-7 border rounded-xl h-[72vh] overflow-auto'>
                        {/* Topic and Script */}
                        <Topic onHandleInputChange={onHandleInputChange}/>
                        {/* Video Image Style */}
                        <VideoStyle onHandleInputChange={onHandleInputChange}/>
                        {/* Voice */}
                        <Voice onHandleInputChange={onHandleInputChange}/>
                        {/* Captions */}
                    <div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateNewVideo
