import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/JwtAuth.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RefreshTokenDTO } from './dto/refresh-token.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createAsync(createUserDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req : any) {
    return await this.usersService.findOneAsync(req.user.sub);
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(@Req() req : any, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.updateAsync(req.user.sub, updateUserDto);
  }

  @Delete()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req : any) {
    return await this.usersService.removeAsync(req.user.sub);
  }

  @Post("login")
  async login(@Body() user: LoginUserDTO){
    return await this.usersService.LoginAsync(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    return await this.usersService.logout(req.user.sub);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDTO) {
    return await this.usersService.refreshToken(refreshTokenDto.refresh_token);
  }

}
