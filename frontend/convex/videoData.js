import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { query } from './_generated/server';

export const CreateVideoData = mutation({
  args: {
    title: v.string(),
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
    const result = await ctx.db.insert('videoData', {
      title: args.title,
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
    audioUrl: v.string(),
    images: v.any(),
    captionJson: v.any(),
    downloadUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      audioUrl: args.audioUrl,
      images: args.images,
      captionJson: args.captionJson,
      status: 'completed',
    });
    return result;
  },
});

export const GetUserVideos = query({
  args: {
    uid: v.id('users'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('videoData')
      .filter((q) => q.eq(q.field('uid'), args.uid))
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
