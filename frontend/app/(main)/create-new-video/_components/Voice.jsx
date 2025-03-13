import React from 'react'
import { useState } from 'react'
import {ScrollArea} from '@/components/ui/scroll-area'

const voiceOptions =[
    {
        "value": "am_liam",
        "name": "(US) Liam (Male)"
    },
    {
        "value": "am_michael",
        "name": "(US) Michael (Male)"
    },
    {
        "value": "am_onyx",
        "name": "(US) Onyx (Male)"
    },
    {
        "value": "am_fenrir",
        "name": "(US) Fenrir (Male)"
    },
    {
        "value": "am_eric",
        "name": "(US) Eric (Male)"
    },
    {
        "value": "am_echo",
        "name": "(US) Echo (Male)"
    },
    {
        "value": "hm_psi",
        "name": "(IN) Psi (Male)"
    },
    {
        "value": "hm_omega",
        "name": "(IN) Omega (Male)"
    },
    {
        "value": "hf_beta",
        "name": "(IN) Beta (Female)"
    },
    {
        "value": "hf_alpha",
        "name": "(IN) Beta (Female)"
    },
    {
        "value": "am_adam",
        "name": "(US) Adam (Male)"
    },
    {
        "value": "af_sky",
        "name": "(US) Sky (Female)"
    },
    {
        "value": "af_sarah",
        "name": "(US) Sarah (Female)"
    }
]
function Voice({onHandleInputChange}) {
    const [selectedVoice,setSelectedVoice]=useState();
    return (
        <div className ='mt-5'>
        <h2>Video Voice</h2>
        <p className='text-sm text-gray-400'>Select voice for your video</p>
        <ScrollArea className='h-[70px] w-full'>
        <div className='grid grid-cols-2 gap-3'>
            {voiceOptions.map((voice,index)=>(
                <h2 className={`cursor-pointer p-3 dark:bg-slate-900 dark:border-white rounded-lg hover:boarder ${voice.name==selectedVoice&&'border'}`}
                    onClick={()=>{setSelectedVoice(voice.name);
                        setSelectedVoice(voice.name);
                        onHandleInputChange('voice',voice.value)
                    }}
                    key={index}>{voice.name}</h2>
            ))}
        </div>
        </ScrollArea>
        </div>
    )
}

export default Voice
