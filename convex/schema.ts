export const videoData = defineTable({
  title: v.string(),
  script: v.string(),
  topic: v.string(),
  voice: v.string(),
  videoStyle: v.string(),
  caption: v.string(),
  images: v.array(v.union(v.string(), v.object({
    url: v.string(),
    transition: v.string(),
    duration: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    volume: v.number()
  }))),
  audioUrl: v.string(),
  captionJson: v.array(v.object({
    word: v.string(),
    start: v.number(),
    end: v.number()
  })),
  status: v.string(),
  uid: v.string(),
  createdBy: v.string(),
  credits: v.number(),
  backgroundMusic: v.optional(v.object({
    url: v.string(),
    volume: v.number()
  }))
}); 