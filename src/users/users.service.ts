import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginUserDTO } from './dto/login-user.dto';
import { CryptoService } from 'src/CryptoService';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createAsync(createUserDto: CreateUserDto): Promise<{access_token: string;refresh_token: string;}> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      createUserDto.password = await CryptoService.encrypt(createUserDto.password)
      const user = queryRunner.manager.create(User, createUserDto);
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      const foundUser : User | null = await queryRunner.manager.findOne(User, { where: { email: user.email  } })

      if (!foundUser) {
        throw new NotFoundException();
      }

      const payload = { sub: foundUser.id, email: foundUser.email };
      const accessToken = this.jwtService.sign(payload); 

      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      foundUser.refreshToken = refreshToken;
      await this.repository.save(foundUser);

      return { access_token: accessToken, refresh_token: refreshToken };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error) ;
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
      throw new InternalServerErrorException(error) ;
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
      throw new InternalServerErrorException(error) ;
    } finally {
      await queryRunner.release();
    }
  }

  async LoginAsync(userDto: LoginUserDTO) {
    try {
      const foundUser: User | null = await this.repository.findOne({ where: { email: userDto.email } });
  
      if (!foundUser) {
        return false;
      }
  
      const isPasswordCorrect: boolean = await CryptoService.compare(userDto.password, foundUser.password);
  
      if (!isPasswordCorrect) {
        return false;
      }

      const payload = { sub: foundUser.id, email: foundUser.email };
      const accessToken = this.jwtService.sign(payload); 

      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      foundUser.refreshToken = refreshToken;
      await this.repository.save(foundUser);

      return { access_token: accessToken, refresh_token: refreshToken };

    } catch (error) {
      throw new InternalServerErrorException(error) ;
    }
  }  

  async logout(userId: number) {
    const user = await this.repository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    user.refreshToken = null;
    await this.repository.save(user);

    return { message: 'Logout realizado com sucesso' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
  
      const foundUser = await this.repository.findOne({
        where: { id: payload.sub, refreshToken },
      });
  
      if (!foundUser) {
        throw new UnauthorizedException('Refresh token inválido');
      }
  
      const newAccessToken = this.jwtService.sign(
        { sub: foundUser.id, email: foundUser.email }
      );
  
      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }
  

}