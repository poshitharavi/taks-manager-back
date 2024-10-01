import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { CreateTaskDto, UpdateTaskDto } from './dtos';

@Controller('task')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @Post('save')
  async saveTask(
    @Req() request: any,
    @Res() response: Response,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<any> {
    try {
      const userId: string = request.user.sub;
      createTaskDto.status = 'pending';

      const task = await this.taskService.createTask(createTaskDto, userId);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Successfully task created',
        body: {
          task,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/save: ${error.message}`);

      if (error instanceof BadRequestException) {
        // Handle BadRequestException differently
        return response.status(StatusCodes.BAD_REQUEST).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.BAD_REQUEST),
          statusCode: StatusCodes.BAD_REQUEST,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Patch('update/:id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<any> {
    try {
      const updatedTask = await this.taskService.updateTask(id, updateTaskDto);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: `Successfully updated task of Task ID ${updatedTask.id}`,
        body: {
          updatedTask,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/update/${id}: ${error.message}`);

      if (error instanceof NotFoundException) {
        // Handle UnauthorizedException differently
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      if (error instanceof BadRequestException) {
        // Handle BadRequestException differently
        return response.status(StatusCodes.BAD_REQUEST).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.BAD_REQUEST),
          statusCode: StatusCodes.BAD_REQUEST,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get('details/:id')
  async getTaskDetailsById(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<any> {
    try {
      const task = await this.taskService.getTaskDetailsById(id);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Successfully retrieved task',
        body: {
          task,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/details/${id}: ${error.message}`);

      if (error instanceof NotFoundException) {
        // Handle NotFoundException differently
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get('all')
  async getAllTasks(@Res() response: Response): Promise<any> {
    try {
      const tasks = await this.taskService.getAllTasks();

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Successfully retrieved all tasks',
        body: {
          tasks,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/all: ${error.message}`);

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Delete('delete/:id')
  async deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<any> {
    try {
      const task = await this.taskService.deleteTask(id);

      return response.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: 'Successfully deleted the task',
        body: {
          task,
        },
      });
    } catch (error) {
      this.logger.error(`Error at /task/delete/${id}: ${error.message}`);

      if (error instanceof NotFoundException) {
        // Handle UnauthorizedException differently
        return response.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
          error: getReasonPhrase(StatusCodes.NOT_FOUND),
          statusCode: StatusCodes.NOT_FOUND,
        });
      }

      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
        error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
