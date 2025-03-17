import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateVideoData = mutation({
    args:{
        title: v.string(),
        script: v.string(),
        topic: v.string(),
        voice: v.string(),
        videoStyle: v.string(),
        caption: v.any(),
        uid: v.id('users'),
        createdBy: v.string()
    },
    handler:async(ctx, args)=>{
        const result = await ctx.db.insert('videoData',{
            title: args.title,
            script: args.script,
            topic: args.topic,
            voice: args.voice,
            videoStyle: args.videoStyle,
            caption: args.caption,
            uid: args.uid,
            createdBy: args.createdBy

        })
        return result;
    }
})