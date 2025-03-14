import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './JwtStrategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'gd4b6rb7478bc1fgcn4031478tcb4ydhr47t947gf47tg437fcgc7464rvc1864bcgfy03fev',
      signOptions: { expiresIn: '24h' },
    }),

  ], 
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
})
export class UsersModule {}
