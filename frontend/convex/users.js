import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    pictureURL: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .collect();

    if (!user[0]?.email) {
      const userData = {
        name: args?.name,
        email: args?.email,
        pictureURL: args?.pictureURL,
        credits: 100,
        role: 'user',
      };

      return userData;
    }

    return user[0];
  },
});

export const GetUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();
    return user;
  },
});
