import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { query } from './_generated/server';
import { useQuery } from 'convex/react';

export const CreateVideo = mutation({
  args: {
    uid: v.id('users'),
    title: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert('videoData', {
      title: args.title,
      uid: args.uid,
      createdBy: args.createdBy,
    });
    return { id: result, createdBy: args.createdBy };
  },
});

export const CreateVideoData = mutation({
  args: {
    recordId: v.id('videoData'),
    script: v.string(),
    topic: v.string(),
    voice: v.string(),
    videoStyle: v.string(),
    caption: v.any(),
    uid: v.id('users'),
    createdBy: v.string(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      script: args.script,
      topic: args.topic,
      voice: args.voice,
      videoStyle: args.videoStyle,
      caption: args.caption,
      uid: args.uid,
      createdBy: args.createdBy,
      status: 'pending',
    });

    await ctx.db.patch(args.uid, {
      credits: args?.credits - 1,
    });

    return result;
  },
});

export const UpdateVideoRecord = mutation({
  args: {
    recordId: v.id('videoData'),
    audioUrl: v.optional(v.any()),
    images: v.any(),
    captionJson: v.optional(v.any()),
    downloadUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      audioUrl: args.audioUrl,
      images: args.images,
      captionJson: args.captionJson,
      downloadUrl: args.downloadUrl,
      status: 'completed',
    });
    return result;
  },
});
//Images
export const UpdateImages = mutation({
  args: {
    recordId: v.id('videoData'),
    images: v.any(),
  },
  handler: async (ctx,args)=>{
    const result = await ctx.db.patch(args.recordId, {
      images: args.images,
    });
    return result;  
  }
});
//Script + Audio
export const UpdateCaptionsAndAudio = mutation({
  args:{
    recordId: v.id('videoData'),
    audioUrl: v.optional(v.string()),
    captionJson: v.optional(v.any()),
  },
  handler: async (ctx,args)=>{
    const result =await ctx.db.patch(args.recordId,{
      audioUrl: args.audioUrl,
      captionJson: args.captionJson,
    });
    return result
  }
})

export const UpdateCompletedvideo = mutation({
  args:{
    recordId: v.id('videoData'),
    status: v.string(),
    downloadUrl: v.optional(v.string()),
  },
  handler: async (ctx,args)=>{
    const result = await ctx.db.patch(args.recordId,{
      status: 'completed',
      downloadUrl: args.downloadUrl,
    });
    return result;
  }
})


export const GetUserVideos = query({
  args: {
    uid: v.id('users'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('videoData')
      .filter((q) => q.eq(q.field('uid'), args.uid))
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'completed'),
          q.eq(q.field('status'), 'pending')
        )
      )
      .order('desc')
      .collect();

    return result;
  },
});


export const GetVideoById = query({
  args: {
    videoId: v.id('videoData'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.videoId);
    return result;
  },
});

export const fetchImages = query({
  args: {
    videoId: v.optional(v.id('videoData')),
  },
  handler: async (ctx, args) => {
    const videoData = await ctx.db.get(args.videoId);
    if (!videoData) {
      throw new Error(`Video data with ID ${args.videoId} not found.`);
    }
    return videoData.images; // Return the images field from the videoData document
  },
});

export const fetchAudio = query({
  args:{
    videoId: v.id('videoData'),
  },
  handler: async (ctx,args)=>{
    const videoData = await ctx.db.get(args.videoId);
    if(!videoData){
      throw new Error(`Video data with Id ${args.videoId} not found.`);
    }
    return videoData.audioUrl;
  },
});

export const fetchVideoData = query({
  args: {
    videoId: v.id('videoData'),
  },
  handler: async (ctx, args) => {
    const videoData = await ctx.db.get(args.videoId);
    if (!videoData) {
      throw new Error(`Video data with ID ${args.videoId} not found.`);
    }

    return {
      audioUrl: videoData.audioUrl,
      captionJson: videoData.captionJson,
      images: videoData.images,
      caption: videoData.caption,
    };
  }
});
