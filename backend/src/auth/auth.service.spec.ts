import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService (Unit Test)', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_jwt_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const dto = { username: 'Test User', email: 'test@gmail.com', password: 'password123' };
      
      mockPrismaService.user.findUnique.mockResolvedValue(null); // Chưa tồn tại email
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        username: 'Test User',
        email: 'test@gmail.com',
        passwordHash: 'hashed_password',
        loyaltyPoints: 0,
      });

      const result = await authService.register(dto);

      expect(result).toHaveProperty('message', 'Đăng ký tài khoản thành công');
      expect(result.user).toHaveProperty('email', dto.email);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
    });

    it('should throw BadRequestException if email already exists', async () => {
      const dto = { username: 'Test User', email: 'existing@gmail.com', password: 'password123' };
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1, email: dto.email });

      await expect(authService.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should successfully login and return access_token', async () => {
      const dto = { email: 'test@gmail.com', password: 'password123' };
      const hashedPassword = await bcrypt.hash('password123', 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'Test User',
        email: 'test@gmail.com',
        passwordHash: hashedPassword,
        loyaltyPoints: 10,
      });

      const result = await authService.login(dto);

      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token', 'mock_jwt_token');
      expect(result).toHaveProperty('message', 'Đăng nhập thành công');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto = { email: 'wrong@gmail.com', password: 'password123' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const dto = { email: 'test@gmail.com', password: 'wrongpassword' };
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@gmail.com',
        passwordHash: hashedPassword,
      });

      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});