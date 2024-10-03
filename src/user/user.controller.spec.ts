import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from './dtos';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let response: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            registerUser: jest.fn(),
            loginAdmin: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any as Response;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a new user and return success response', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const newUser = {
        id: '1',
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(userService, 'registerUser').mockResolvedValue(newUser);

      await controller.registerUser(response, createUserDto);

      expect(userService.registerUser).toHaveBeenCalledWith(createUserDto);
      expect(response.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(response.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully registered',
        body: { newUser },
      });
    });

    it('should handle ConflictException when user already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      jest
        .spyOn(userService, 'registerUser')
        .mockRejectedValue(new ConflictException('User already exists'));

      await controller.registerUser(response, createUserDto);

      expect(response.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(response.json).toHaveBeenCalledWith({
        message: 'User already exists',
        error: getReasonPhrase(StatusCodes.CONFLICT),
        statusCode: StatusCodes.CONFLICT,
      });
    });
  });

  describe('loginAdmin', () => {
    it('should return success response on valid login', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'john@example.com',
        password: 'password123',
      };
      const loginRes = {
        name: 'John Doe',
        email: 'john@example.com',
        token: 'jwt-token',
      };
      jest.spyOn(userService, 'loginAdmin').mockResolvedValue(loginRes);

      await controller.loginAdmin(response, loginUserDto);

      expect(userService.loginAdmin).toHaveBeenCalledWith(loginUserDto);
      expect(response.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(response.json).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: 'Successfully authenticated',
        body: loginRes,
      });
    });

    it('should handle UnauthorizedException on invalid login', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'john@example.com',
        password: 'wrong-password',
      };
      jest
        .spyOn(userService, 'loginAdmin')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await controller.loginAdmin(response, loginUserDto);

      expect(response.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(response.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
        error: getReasonPhrase(StatusCodes.UNAUTHORIZED),
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    });

    it('should handle NotFoundException when user not found', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'notfound@example.com',
        password: 'password123',
      };
      jest
        .spyOn(userService, 'loginAdmin')
        .mockRejectedValue(new NotFoundException('User not found'));

      await controller.loginAdmin(response, loginUserDto);

      expect(response.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(response.json).toHaveBeenCalledWith({
        message: 'User not found',
        error: getReasonPhrase(StatusCodes.NOT_FOUND),
        statusCode: StatusCodes.NOT_FOUND,
      });
    });
  });
});
