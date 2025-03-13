"use client"
import React from 'react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { SparklesIcon } from 'lucide-react'
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
    const [selectTopic,setSelectedTopic]=useState()
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
                                    className={`m-1 ${suggestion == selectTopic && 'bg-secondary'}`} 
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
            </div>
            <Button className ="mt-3 ml-1" size="sm"> <SparklesIcon/>Generate Script</Button>
        </div>
    )
}

export default Topic
