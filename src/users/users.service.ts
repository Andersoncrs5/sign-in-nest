import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginUserDTO } from './dto/login-user.dto';
import { CryptoService } from 'src/CryptoService';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async createAsync(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      createUserDto.password = await CryptoService.encrypt(createUserDto.password)
      const user = queryRunner.manager.create(User, createUserDto);
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOneAsync(id: number): Promise<User> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.repository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateAsync(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    if (!Object.keys(updateUserDto).length) {
      throw new BadRequestException('Update data is required');
    }

    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      if (updateUserDto.password) {
        updateUserDto.password = await CryptoService.encrypt(updateUserDto.password)
      }
      await queryRunner.manager.update(User, id, updateUserDto);
      const user = await queryRunner.manager.findOne(User, { where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeAsync(id: number): Promise<string> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await queryRunner.manager.delete(User, id);

      await queryRunner.commitTransaction();
      return 'User deleted';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async LoginAsync(userDto: LoginUserDTO): Promise<boolean> {
    try {
      const email = userDto.email;
      const foundUser = await this.repository.findOne({ where: { email } });
  
      if (!foundUser) {
        return false;
      }
  
      const isPasswordCorrect = await CryptoService.compare(userDto.password, foundUser.password);
  
      if (!isPasswordCorrect) {
        return false;
      }
  
      return true;
    } catch (error) {
      throw error;
    }
  }  

}