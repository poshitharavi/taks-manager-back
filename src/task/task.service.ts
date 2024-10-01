import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '@prisma/client';
import { validateAndFormatDate } from 'src/common/util/dates.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dtos';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<Task> {
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

  async getTaskDetailsById(id: number): Promise<Task> {
    try {
      const task = await this.prisma.task.findUniqueOrThrow({
        where: {
          id,
        },
      });

      return task;
    } catch (error) {
      // check if task not found and throw error
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with id ${id} not found`);
      }

      // throw error if any
      throw error;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany();

    return tasks;
  }

  async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      //Check task exists
      await this.prisma.task.findUniqueOrThrow({
        where: {
          id,
        },
      });

      if (updateTaskDto.dueDate) {
        updateTaskDto.dueDate = validateAndFormatDate(updateTaskDto.dueDate);
      }

      const updatedTask = await this.prisma.task.update({
        where: {
          id,
        },
        data: {
          ...updateTaskDto,
        },
      });

      return updatedTask;
    } catch (error) {
      // check if task not found and throw error
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with id ${id} not found`);
      }

      // throw error if any
      throw error;
    }
  }

  async deleteTask(id: number): Promise<Task> {
    try {
      //Check task exists
      await this.prisma.task.findUniqueOrThrow({
        where: {
          id,
        },
      });

      const task = await this.prisma.task.delete({
        where: {
          id,
        },
      });

      return task;
    } catch (error) {
      // check if task not found and throw error
      if (error.code === 'P2025') {
        throw new NotFoundException(`Task with id ${id} not found`);
      }

      // throw error if any
      throw error;
    }
  }
}
