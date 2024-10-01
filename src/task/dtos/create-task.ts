import { TaskPriority, TaskStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsNotEmpty()
  @IsEnum(TaskPriority, {
    message: 'Priority must be a valid TaskPriority value',
  })
  priority: TaskPriority;
  @IsNotEmpty()
  @IsString()
  dueDate: string;

  status: TaskStatus;
}
