import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Response } from 'express';
import { CreateTaskDto } from './dtos/create-task';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

@Controller('task')
export class TaskController {
  private readonly logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  @Post('save')
  async saveTask(
    @Req() request: any,
    @Res() response: Response,
    @Body() createTaskDto: CreateTaskDto,
  ) {
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
}
