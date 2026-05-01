import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get('list')
  findAll(): Promise<Todo[]> {
    return this.todoService.findAll();
  }

  @Post('add')
  create(@Body() body: Partial<Todo>): Promise<Todo> {
    return this.todoService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Todo>,
  ): Promise<Todo | null> {
    return this.todoService.update(id, body);
  }

  @Put(':id/toggle')
  toggle(@Param('id', ParseIntPipe) id: number): Promise<Todo | null> {
    return this.todoService.toggle(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.todoService.remove(id);
  }
}
