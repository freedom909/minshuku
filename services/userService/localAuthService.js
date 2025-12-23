// services/userService/localAuthService.js
import { GraphQLError } from 'graphql';

export default class LocalAuthService {
  constructor({
    userRepository,
    passwordHasher,
    tokenService,
    accountLockService,
  }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
    this.accountLockService = accountLockService;
  }

  async signIn({ email, password }) {
    if (!email || !password) {
      throw new GraphQLError('Email and password are required', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new GraphQLError('Invalid email or password', {
        extensions: { code: 'UNAUTHORIZED' },
      });
    }

    // 🔒 检查是否被锁定
    const locked = await this.accountLockService.isLocked(user.id);
    if (locked) {
      throw new GraphQLError('Account temporarily locked', {
        extensions: { code: 'ACCOUNT_LOCKED' },
      });
    }

    const passwordValid = await this.passwordHasher.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      await this.accountLockService.recordFailure(user.id);
      throw new GraphQLError('Invalid email or password', {
        extensions: { code: 'UNAUTHORIZED' },
      });
    }

    // ✅ 登录成功，清空失败记录
    await this.accountLockService.clearFailures(user.id);

    // 🎯 唯一正确的 token 出口
    const token = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const refreshToken = this.tokenService.generateRefreshToken({
      userId: user.id,
    });

    return {
      token,
      refreshToken,
      userId: user.id,
      role: user.role,
    };
  }

  async generateResetPasswordToken(user) {
 
    return this.tokenService.generateResetPasswordToken({
      userId: user.id,
    });
  }
}
