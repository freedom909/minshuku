class ProfileService {
    constructor({ profileRepository }) {
      this.profileRepository = profileRepository;
    }
  
    async getProfile({ username, accountId }) {
      const query = {};
      if (username) query.username = username;
      if (accountId) query.accountId = accountId;
      
      return this.profileRepository.findOne(query);
    }
  
    async getProfiles({ page = 1, limit = 20, search, role, status }) {
      const skip = (page - 1) * limit;
      const query = {};
      
      if (search) {
        query.$or = [
          { fullname: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (role) query.role = role;
      if (status) query.status = status;
      
      const [profiles, totalCount] = await Promise.all([
        this.profileRepository.find(query).skip(skip).limit(limit),
        this.profileRepository.countDocuments(query)
      ]);
      
      return {
        profiles,
        totalCount,
        pageInfo: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1
        }
      };
    }
  
    async getProfileById(id) {
      return this.profileRepository.findById(id);
    }
  
    async getNetworkProfilesList(networkIds) {
      return this.profileRepository.find({ _id: { $in: networkIds } });
    }
  
    async getNetworkProfiles({ accountId, page = 1, limit = 20 }) {
      const profile = await this.profileRepository.findOne({ accountId });
      if (!profile || !profile.network) {
        return {
          profiles: [],
          totalCount: 0,
          pageInfo: {
            currentPage: page,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }
      
      const skip = (page - 1) * limit;
      const networkIds = profile.network.slice(skip, skip + limit);
      const profiles = await this.profileRepository.find({ _id: { $in: networkIds } });
      
      return {
        profiles,
        totalCount: profile.network.length,
        pageInfo: {
          currentPage: page,
          totalPages: Math.ceil(profile.network.length / limit),
          hasNextPage: page < Math.ceil(profile.network.length / limit),
          hasPreviousPage: page > 1
        }
      };
    }
  
    async searchProfiles({ query, page = 1, limit = 20 }) {
      const skip = (page - 1) * limit;
      const searchQuery = {
        $or: [
          { fullname: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } },
          { interests: { $in: [new RegExp(query, 'i')] } },
          { skills: { $in: [new RegExp(query, 'i')] } }
        ]
      };
      
      const [profiles, totalCount] = await Promise.all([
        this.profileRepository.find(searchQuery).skip(skip).limit(limit),
        this.profileRepository.countDocuments(searchQuery)
      ]);
      
      return {
        profiles,
        totalCount,
        pageInfo: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1
        }
      };
    }
  
    async checkViewerHasInNetwork(viewerId, profileId) {
      const profile = await this.profileRepository.findById(profileId);
      return profile && profile.network ? profile.network.includes(viewerId) : false;
    }
  
    async createProfile(input) {
      const profileData = {
        ...input,
        fullname: input.fullName,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const profile = new this.profileRepository(profileData);
      return profile.save();
    }
  
    async updateProfile(accountId, updateData) {
      const updateFields = { ...updateData, updatedAt: new Date() };
      if (updateData.fullName) {
        updateFields.fullname = updateData.fullName;
      }
      
      return this.profileRepository.findOneAndUpdate(
        { accountId },
        { $set: updateFields },
        { new: true }
      );
    }
  
    async deleteProfile(accountId) {
      const result = await this.profileRepository.findOneAndDelete({ accountId });
      return !!result;
    }
  
    async addToNetwork(accountId, networkMemberId) {
      return this.profileRepository.findOneAndUpdate(
        { accountId },
        { $addToSet: { network: networkMemberId } },
        { new: true }
      ).exec();
    }
  
    async removeFromNetwork(accountId, networkMemberId) {
      return this.profileRepository.findOneAndUpdate(
        { accountId },
        { $pull: { network: networkMemberId } },
        { new: true }
      ).exec();
    }
  
    async updatePrivacySettings(accountId, settings) {
      return this.profileRepository.findOneAndUpdate(
        { accountId },
        { $set: { privacySettings: settings, updatedAt: new Date() } },
        { new: true }
      ).exec();
    }
  
    async updateNotificationPreferences(accountId, preferences) {
      return this.profileRepository.findOneAndUpdate(
        { accountId },
        { $set: { notificationPreferences: preferences, updatedAt: new Date() } },
        { new: true }
      ).exec();
    }
  
    async verifyProfile(accountId) {
      return this.profileRepository.findOneAndUpdate(
        { accountId },
        { $set: { status: 'VERIFIED', updatedAt: new Date() } },
        { new: true }
      ).exec();
    }
  
    async suspendProfile(accountId) {
      return this.profileRepository.findOneAndUpdate(
        { accountId },
        { $set: { status: 'SUSPENDED', updatedAt: new Date() } },
        { new: true }
      ).exec();
    }
  
    async activateProfile(accountId) {
      return this.profileRepository.findOneAndUpdate(
        { accountId },
        { $set: { status: 'ACTIVE', updatedAt: new Date() } },
        { new: true }
      ).exec();
    }
  
    async followUser(followerId, followingId) {
      // Add followingId to follower's network
      await this.profileRepository.findOneAndUpdate(
        { accountId: followerId },
        { $addToSet: { network: followingId } },
        { new: true }
      ).exec();
      
      // Return the updated follower profile
      return this.profileRepository.findOne({ accountId: followerId });
    }
  
    async unfollowUser(followerId, followingId) {
      // Remove followingId from follower's network
      await this.profileRepository.findOneAndUpdate(
        { accountId: followerId },
        { $pull: { network: followingId } },
        { new: true }
      ).exec();
      
      // Return the updated follower profile
      return this.profileRepository.findOne({ accountId: followerId });
    }
  
    async getProfileStats(accountId) {
      // This would typically integrate with other services
      // For now, return mock data
      return {
        totalBookings: Math.floor(Math.random() * 100),
        totalReviews: Math.floor(Math.random() * 50),
        averageRating: (Math.random() * 4 + 1).toFixed(1),
        responseRate: (Math.random() * 100).toFixed(1),
        networkSize: Math.floor(Math.random() * 500),
        listingsCount: Math.floor(Math.random() * 10),
        completedTransactions: Math.floor(Math.random() * 200)
      };
    }
  }
  
  export default ProfileService;
  