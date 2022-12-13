import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ApiBadRequestResponse } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService
  ) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    const hashPassword = await bcrypt.hash(createUserDto.password, 12)
    return {
      data: await this.usersService.create({
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashPassword
      }),
      statusCode: HttpStatus.CREATED,
      message: 'success',
    };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneUser(loginUserDto.username)

    if(!user) {
      throw new BadRequestException('invalid credentials');
    }

    if(!await bcrypt.compare(loginUserDto.password, user.password)){
      throw new BadRequestException('invalid credentials');
    }

    const jwt = await this.jwtService.signAsync(
      {
        id: user.id,
        username: user.username,
        email: user.email
      }
    )

    return {
      data: jwt
    }
  }

  // @Get()
  // async findAll() {
  //   const [data, count] = await this.usersService.findAll();
  //   return {
  //     data,
  //     count,
  //     statusCode: HttpStatus.OK,
  //     message: 'success',
  //   };
  // }

  // @Get(':id')
  // async findOne(@Param('id', ParseUUIDPipe) id: string) {
  //   return {
  //     data: await this.usersService.findOne(id),
  //     statusCode: HttpStatus.OK,
  //     message: 'success',
  //   };
  // }

  // @Put(':id')
  // async update(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ) {
  //   return {
  //     data: await this.usersService.update(id, updateUserDto),
  //     statusCode: HttpStatus.OK,
  //     message: 'success',
  //   };
  // }

  // @Delete(':id')
  // async remove(@Param('id', ParseUUIDPipe) id: string) {
  //   await this.usersService.remove(id);

  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: 'success',
  //   };
  // }
}
