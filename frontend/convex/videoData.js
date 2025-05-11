import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { query } from './_generated/server';

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
    captionJson: v.optional(v.any()),
    uid: v.id('users'),
    createdBy: v.string(),
    credits: v.number(),
    backgroundMusic: v.optional(
      v.object({
        url: v.string(),
        volume: v.number(),
        start: v.optional(v.number()),
        end: v.optional(v.number()),
      })
    ),
    narratorVolume: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      script: args.script,
      topic: args.topic,
      voice: args.voice,
      videoStyle: args.videoStyle,
      caption: args.caption,
      captionJson: args.captionJson,
      uid: args.uid,
      createdBy: args.createdBy,
      status: 'pending',
      backgroundMusic: args.backgroundMusic,
      narratorVolume: args.narratorVolume,
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
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      images: args.images,
    });
    return result;
  },
});
//Script + Audio
export const UpdateCaptionsAndAudio = mutation({
  args: {
    recordId: v.id('videoData'),
    audioUrl: v.optional(v.string()),
    captionJson: v.optional(v.any()),
    narratorVolume: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      audioUrl: args.audioUrl,
      captionJson: args.captionJson,
      narratorVolume: args.narratorVolume,
    });
    return result;
  },
});

export const UpdateCompletedvideo = mutation({
  args: {
    recordId: v.id('videoData'),
    status: v.string(),
    downloadUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      status: 'completed',
      downloadUrl: args.downloadUrl,
    });
    return result;
  },
});

export const DeleteVideo = mutation({
  args: {
    videoId: v.id('videoData'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.delete(args.videoId);
    return result;
  },
});

export const UpdateBackgroundMusic = mutation({
  args: {
    recordId: v.id('videoData'),
    backgroundMusic: v.optional(
      v.object({
        url: v.string(),
        volume: v.number(),
        start: v.optional(v.number()),
        end: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      backgroundMusic: args.backgroundMusic,
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
      .filter((q) => q.or(q.eq(q.field('status'), 'completed'), q.eq(q.field('status'), 'pending')))
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
  args: {
    videoId: v.id('videoData'),
  },
  handler: async (ctx, args) => {
    const videoData = await ctx.db.get(args.videoId);
    if (!videoData) {
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
  },
});

export const GetAllVideos = query({
  handler: async (ctx) => {
    const result = await ctx.db
      .query('videoData')
      .filter((q) => q.or(q.eq(q.field('status'), 'completed'), q.eq(q.field('status'), 'pending')))
      .order('desc')
      .collect();

    return result;
  },
});

export const saveYoutubeStats = mutation({
  args: {
    videoId: v.id('videoData'),
    stats: v.object({
      viewCount: v.string(),
      likeCount: v.string(),
      commentCount: v.string(),
    }),
    youtubeUrl: v.optional(v.string()), // ✅ Thêm url nếu có
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.videoId, {
      youtubeStats: args.stats,
      ...(args.youtubeUrl ? { youtubeUrl: args.youtubeUrl } : {}),
    });
  },
});
