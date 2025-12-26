class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async findOrCreateOAuthUser(profile) {
    const {
      provider,
      providerAccountId,
      email,
      name,
      picture,
    } = profile;

    let user = await this.userRepository.findByOAuth(
      provider,
      providerAccountId
    );

    if (user) return user;

    user = await this.userRepository.create({
      email,
      name,
      avatar: picture,
      role: 'USER',
      oauth: {
        provider,
        providerAccountId,
      },
    });

    return user;
  }
}

export default UserService;
