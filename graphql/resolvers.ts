import { Context } from "@/pages/api/graphql";

const resolvers = {
  Query: {
    users: async (_parent: unknown, _args: any, context: Context) => {
      return context.prisma.user.findMany();
    },
    user: async (_parent: unknown, args: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: args.id },
      });
    },
  },
  Mutation: {
    createUser: async (_parent: unknown, args: any, context: Context) => {
      return context.prisma.user.create({
        data: {
          email: args.email,
          username: args.username,
          password: args.password, // Ensure to hash the password before storing it in production
        },
      });
    },
    updateUser: async (_parent: unknown, args: any, context: Context) => {
      return context.prisma.user.update({
        where: { id: args.id },
        data: {
          email: args.email,
          username: args.username,
          password: args.password, // Ensure to hash the password before storing it in production
          role: args.role,
        },
      });
    },
    deleteUser: async (_parent: unknown, args: any, context: Context) => {
      return context.prisma.user.delete({
        where: { id: args.id },
      });
    },
  },
};
export { resolvers };