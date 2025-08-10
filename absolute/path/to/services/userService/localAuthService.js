// ... existing code ...
async localLogin(email, password) {
  console.log("Starting local login process for email:", email);

  try {
    // 检查账户是否存在
    const userExisting = await this.userRepository.getUserByEmailFromDb(email);
    if (!userExisting) {
      throw new GraphQLError("User not found", {
        extensions: { code: "USER_NOT_FOUND" },
      });
    }
    // 检查账户是否被锁定
    if (this.accountLockService) {
      const isLocked = await this.accountLockService.isAccountLocked(email);
      if (isLocked) {
        const retryAfter = await this.accountLockService.getLockTimeRemaining(
          email
        );
        throw new GraphQLError(
          "Account temporarily locked due to too many failed attempts",
          {
            extensions: {
              code: "ACCOUNT_LOCKED",
              retryAfter,
            },
          }
        );
      }
    }

    // 尝试登录
    console.log("Attempting local login for email:", email);
    const user = await this.login(email, password);

    // 登录成功后清除失败尝试记录
    if (this.accountLockService) {
      await this.accountLockService.clearAttempts(email);
    }

    // 生成访问令牌和刷新令牌
    console.log("Generating tokens for user:", user._id.toString());
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateToken(user),
      this.tokenService.generateRefreshToken(user),
    ]);

    console.log("Local login successful for user:", user._id.toString());
    return {
      code: 200,
      success: true,
      message: "Login successful",
      token: accessToken,
      refreshToken,
      userId: user._id?.toString() || user._id,
      role: user.role || "GUEST",
      user: {
        id: user._id?.toString?.() || user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        picture: user.picture,
      }
    };
  } catch (error) {
    console.error("Local login error:", error);

    // 记录失败尝试
    if (this.accountLockService && error.extensions?.code !== "ACCOUNT_LOCKED") {
      await this.accountLockService.recordAttempt(email);
    }

    // 检查是否达到锁定阈值
    if (this.accountLockService && error.extensions?.code === "INVALID_CREDENTIALS") {
      const attempts = await this.accountLockService.getAttemptCount(email);
      if (attempts >= this.accountLockService.MAX_ATTEMPTS) {
        await this.accountLockService.lockAccount(email);
        throw new GraphQLError(
          "Account temporarily locked due to too many failed attempts",
          {
            extensions: {
              code: "ACCOUNT_LOCKED",
              retryAfter: this.accountLockService.LOCK_DURATION / 1000,
            },
          }
        );
      }
    }

    if (error instanceof GraphQLError) {
      throw error;
    }

    throw new GraphQLError("Authentication failed", {
      extensions: {
        code: "AUTHENTICATION_FAILED",
        error: error.message,
      },
    });
  }
}
// ... existing code ...