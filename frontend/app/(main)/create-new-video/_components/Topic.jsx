"use client"
import React from 'react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { SparklesIcon } from 'lucide-react'
import axios from 'axios'
import { Loader2Icon } from 'lucide-react'
const suggestions=[
    "Historic Story",
    "Kids Story",
    "Movie Stories",
    "AI Innovations",
    "Space Mysteries",
    "Horror Stories",
    "Mythological Tales",
    "Tech Breakthroughs",
    "True Crime Stories",
    "Fantasy Adventures",
    "Science Experiments",
    "Motivational Stories",
]

function Topic({onHandleInputChange}) {
    const [selectedTopic,setSelectedTopic]=useState();
    const [selecetedScriptIndex,setSelectedScriptIndex]=useState();
    const [scripts,setScripts]=useState();
    const [loading,setLoading]=useState(false);

    const GenerateScript=async()=>{
        setLoading(true);
        setSelectedScriptIndex(null);
        try{
        const result=await axios.post('/api/generate-script',{
            topic:selectedTopic
        })
        console.group(result.data);
        setScripts(result.data?.scripts);
        }
        catch (e){
        console.log(e);
        }
        setLoading(false);
    }

    return (
        <div>
            <h2 className='mb-1'>Project Title</h2>
            <Input placeholder="Enter Project Title" onChange={(event)=>onHandleInputChange('title',event?.target.value)} />
            <div className='mt-5'>
                <h2>Video Topic</h2>
                <p className ='text-sm text-gray-600'>Select topic for your video</p>

                <Tabs defaultValue="suggestion" className="w-full mt-2">
                    <TabsList>
                        <TabsTrigger value ="suggestion">Suggestions</TabsTrigger>
                        <TabsTrigger value ="your_topic">Your Topic</TabsTrigger>
                    </TabsList>
                    <TabsContent value ="suggestion">
                        <div className=''>
                            {suggestions.map((suggestion, index)=>(
                                <Button variant="outline" key={index} 
                                    className={`m-1 ${suggestion == selectedTopic && 'bg-secondary'}`} 
                                    onClick={()=>{setSelectedTopic(suggestion)
                                        onHandleInputChange('topic',suggestion)
                                    }}>{suggestion}</Button>
                                ))}
                        </div>
                    </TabsContent>
                    <TabsContent value ="your_topic">
                        <div>
                            <h2>Enter your own topic</h2>
                            <Textarea placeholder="Enter your topic"
                            onChange={(event)=>onHandleInputChange('topic',event.target.value)}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
                {scripts?.length>0 &&
                <div className='mt-3'>
                    <h2>Select the Script</h2>
                    <div className='grid grid-cols-2 gap-5 mt-1'>
                        {scripts?.map((item,index)=>(
                            <div key={index} 
                            className={`p-3 border rounded-lg cursor-pointer
                            ${selecetedScriptIndex==index && 'border-white bg-secondary'}
                            `}
                                onClick={()=>setSelectedScriptIndex(index)}
                            >
                                <h2 className='line-clamp-4 text-sm text-gray-300'>{item.content}</h2>
                            </div>
                        ))}
                    </div>
                </div>
                }
            </div>
            {!scripts && <Button className ="mt-3 ml-1" size="sm" 
                disabled={loading}
                onClick={GenerateScript}>
                {loading?<Loader2Icon className ='animate-spin' />: <SparklesIcon/>}Generate Script</Button>}
        </div>
    )
}

export default Topic
