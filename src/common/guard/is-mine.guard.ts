import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IsMineGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 💡 We can access the user payload from the request object
    // because we assigned it in the AuthGuard

    // 💡 Get instance of the route by splitting the path, e.g. /posts/1
    const route = request.route.path.split('/')[2];
    const paramId: number = isNaN(parseInt(request.params.id))
      ? 0
      : parseInt(request.params.id);

    switch (route) {
      // 💡 Check if the task belongs to the user
      case 'task':
        const task = await this.prismaService.task.findFirst({
          where: {
            id: paramId,
            userId: request.user.sub,
          },
        });

        return paramId === task?.id;
      default:
        // 💡 Check if the user manages its own profile
        return paramId === request.user.sub;
    }
  }
}
