import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    // Seed a default admin user if none exists
    const adminEmail = 'admin@igi.com';
    const existingUser = await this.usersService.findOneByEmail(adminEmail);
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.usersService.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
      });
      console.log('Default admin user created: admin@igi.com / admin123');
    }

    // Seed a second user
    const userEmail = 'user@igi.com';
    const existingRegularUser =
      await this.usersService.findOneByEmail(userEmail);
    if (!existingRegularUser) {
      const hashedPassword = await bcrypt.hash('user123', 10);
      await this.usersService.create({
        username: 'operator',
        email: userEmail,
        password: hashedPassword,
      });
      console.log('Second static user created: user@igi.com / user123');
    }
  }

  async login(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
      throw new BadRequestException('Incorrect old password');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.usersService.update(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }
}
