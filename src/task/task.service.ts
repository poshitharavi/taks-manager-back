import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '@prisma/client';
import { validateAndFormatDate } from 'src/common/util/dates.util';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(createTaskDto, userId: string): Promise<Task> {
    try {
      const dueDate = validateAndFormatDate(createTaskDto.dueDate);

      const task = await this.prisma.task.create({
        data: {
          ...createTaskDto,
          dueDate,
          userId,
        },
      });

      return task;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }
}
