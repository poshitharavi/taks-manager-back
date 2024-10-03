import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dtos';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { Response } from 'express';
import { TaskPriority, TaskStatus } from '@prisma/client';

describe('TaskController', () => {
  let controller: TaskController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let taskService: TaskService;

  const mockTaskService = {
    createTask: jest.fn(),
    updateTask: jest.fn(),
    getTaskDetailsById: jest.fn(),
    getAllTasks: jest.fn(),
    deleteTask: jest.fn(),
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('saveTask', () => {
    it('should create a task successfully', async () => {
      const mockCreateTaskDto: CreateTaskDto = {
        title: 'Test Task',
        priority: TaskPriority.medium,
        dueDate: '2024-10-01',
        status: TaskStatus.pending,
      };
      const mockTask = { id: 1, ...mockCreateTaskDto };

      mockTaskService.createTask.mockResolvedValue(mockTask);
      const request = { user: { sub: 'user123' } };

      await controller.saveTask(request, mockResponse, mockCreateTaskDto);

      expect(mockTaskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          priority: TaskPriority.medium,
          dueDate: '2024-10-01',
          status: 'pending',
        }),
        'user123',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully task created',
        body: { task: mockTask },
      });
    });

    it('should handle BadRequestException', async () => {
      const mockCreateTaskDto: CreateTaskDto = {
        title: 'Test Task',
        priority: TaskPriority.medium,
        dueDate: '2024-10-01',
        status: TaskStatus.pending,
      };

      mockTaskService.createTask.mockRejectedValue(
        new BadRequestException('Invalid data'),
      );
      const request = { user: { sub: 'user123' } };

      await controller.saveTask(request, mockResponse, mockCreateTaskDto);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid data',
        error: getReasonPhrase(StatusCodes.BAD_REQUEST),
        statusCode: StatusCodes.BAD_REQUEST,
      });
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const mockUpdateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        priority: TaskPriority.high,
      };
      const mockUpdatedTask = { id: 1, ...mockUpdateTaskDto };

      mockTaskService.updateTask.mockResolvedValue(mockUpdatedTask);

      await controller.updateTask(1, mockResponse, mockUpdateTaskDto);

      expect(mockTaskService.updateTask).toHaveBeenCalledWith(
        1,
        mockUpdateTaskDto,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: `Successfully updated task of Task ID 1`,
        body: { updatedTask: mockUpdatedTask },
      });
    });

    it('should handle NotFoundException for update', async () => {
      const mockUpdateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        priority: TaskPriority.high,
      };

      mockTaskService.updateTask.mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await controller.updateTask(1, mockResponse, mockUpdateTaskDto);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Task not found',
        error: getReasonPhrase(StatusCodes.NOT_FOUND),
        statusCode: StatusCodes.NOT_FOUND,
      });
    });
  });

  describe('getTaskDetailsById', () => {
    it('should retrieve task details successfully', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
      };

      mockTaskService.getTaskDetailsById.mockResolvedValue(mockTask);

      await controller.getTaskDetailsById(1, mockResponse);

      expect(mockTaskService.getTaskDetailsById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully retrieved task',
        body: { task: mockTask },
      });
    });

    it('should handle NotFoundException for task details', async () => {
      mockTaskService.getTaskDetailsById.mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await controller.getTaskDetailsById(1, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Task not found',
        error: getReasonPhrase(StatusCodes.NOT_FOUND),
        statusCode: StatusCodes.NOT_FOUND,
      });
    });
  });

  describe('getAllTasks', () => {
    it('should retrieve all tasks successfully', async () => {
      const mockTasks = [
        { id: 1, title: 'Test Task', description: 'Test Description' },
      ];

      mockTaskService.getAllTasks.mockResolvedValue(mockTasks);

      await controller.getAllTasks(mockResponse);

      expect(mockTaskService.getAllTasks).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully retrieved all tasks',
        body: { tasks: mockTasks },
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const mockTask = { id: 1, title: 'Test Task' };

      mockTaskService.deleteTask.mockResolvedValue(mockTask);

      await controller.deleteTask(1, mockResponse);

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully deleted the task',
        body: { task: mockTask },
      });
    });

    it('should handle NotFoundException for delete', async () => {
      mockTaskService.deleteTask.mockRejectedValue(
        new NotFoundException('Task not found'),
      );

      await controller.deleteTask(1, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Task not found',
        error: getReasonPhrase(StatusCodes.NOT_FOUND),
        statusCode: StatusCodes.NOT_FOUND,
      });
    });
  });
});
