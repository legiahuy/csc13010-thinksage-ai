import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    pictureURL: v.string(),
    credits: v.number(),
    role: v.optional(v.string()),
  }),

  videoData: defineTable({
    title: v.string(),
    script: v.optional(v.string()),
    topic: v.optional(v.string()),
    voice: v.optional(v.string()),
    videoStyle: v.optional(v.string()),
    caption: v.optional(v.any()),
    images: v.optional(v.any()),
    audioUrl: v.optional(v.string()),
    captionJson: v.optional(v.any()),
    uid: v.optional(v.id('users')),
    createdBy: v.string(),
    status: v.optional(v.string()),
    downloadUrl: v.optional(v.string()),
    backgroundMusic: v.optional(
      v.object({
        url: v.string(),
        volume: v.number(),
        start: v.optional(v.number()),
        end: v.optional(v.number()),
      })
    ),
    youtubeStats: v.optional(
      v.object({
        viewCount: v.string(),
        likeCount: v.string(),
        commentCount: v.string(),
      })
    ),
    youtubeUrl: v.optional(v.string()),
    narratorVolume: v.optional(v.number()),
  }),
});
