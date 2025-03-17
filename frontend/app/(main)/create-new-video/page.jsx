"use client"
import React from 'react'
import Topic from './_components/Topic'
import { useState } from 'react'
import VideoStyle from './_components/VideoStyle'
import Voice from './_components/Voice'
import Captions from './_components/Captions'
import { WandSparkles } from 'lucide-react'
import {Button} from '@/components/ui/button'
import Preview from './_components/Preview'
import axios from 'axios'
function CreateNewVideo() { 

    const [formData,setFormData]=useState();

    const onHandleInputChange=(fieldName,fieldValue)=>{
        setFormData(prev=>({
            ...prev,
            [fieldName]:fieldValue
        }))
        console.log(formData);
    }

    const GenerateVideo=async()=>{
        if(!formData?.topic || !formData?.script || !formData?.voice || !formData?.videoStyle || !formData?.caption){
            console.log('Error: Please fill all fields');
        }
        const result = await axios.post('/api/generate-video-data',{
            ...formData
        })
        console.log(result);
    }

    return (
        <div>
            <h2 className='text-3xl'>Create New Video</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 mt-8 gap-7'>
                <div className='col-span-2 p-8 border rounded-xl h-[75vh] overflow-auto'>
                        {/* Topic and Script */}
                        <Topic onHandleInputChange={onHandleInputChange}/>
                        {/* Video Image Style */}
                        <VideoStyle onHandleInputChange={onHandleInputChange}/>
                        {/* Voice */}
                        <Voice onHandleInputChange={onHandleInputChange}/>
                        {/* Captions */}
                        <Captions onHandleInputChange={onHandleInputChange}/>
                        <Button className="w-full mt-5"
                        onClick={GenerateVideo}
                        ><WandSparkles/>Generate Video</Button>
                </div>
                <div>
                    <Preview formData={formData}/>
                </div>
            </div>
        </div>
    )
}

export default CreateNewVideo
