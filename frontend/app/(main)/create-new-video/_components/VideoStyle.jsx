import React from 'react'

const options=[
    {
        name:'Realistic',
        image:'/realistic.png'
    },
    {
        name:'Cinematic',
        image:'/cinematic.png'
    },
    {
        name:'Cartoon',
        image:'/3d.png'
    },
    {
        name:'Watercolor',
        image:'/watercolor.png'
    },
    {
        name:'Cyberpunk',
        image:'/cyberpunk.png'
    },
    {
        name: 'GTA',
        image: '/gta.png'
    },
    {
        name: 'Anime',
        image: '/anim.png'
    }
]

function VideoStyle({onHandleInputChange}) {
  return (
    <div>
      <h2>VideoStyle</h2>
      <p className='text-sm text-gray-400'>Select Video Style</p>
    </div>
  )
}

export default VideoStyle
