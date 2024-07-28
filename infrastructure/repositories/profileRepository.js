class ProfileRepository {
    constructor({ ProfileModel }) {
      this.ProfileModel = ProfileModel;
    }
  
    findOne(query) {
      return this.ProfileModel.findOne(query).exec();
    }
  
    find(query = {}) {
      return this.ProfileModel.find(query).exec();
    }
  
    findById(id) {
      return this.ProfileModel.findById(id).exec();
    }
  
    findOneAndUpdate(query, update, options) {
      return this.ProfileModel.findOneAndUpdate(query, update, options).exec();
    }
  
    findOneAndDelete(query) {
      return this.ProfileModel.findOneAndDelete(query).exec();
    }
  
    save(profile) {
      const newProfile = new this.ProfileModel(profile);
      return newProfile.save();
    }
  }
  
  export default ProfileRepository;
  