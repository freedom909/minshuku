// services/accountServices/identity/identityService.js
export default class IdentityService {
  constructor(storageService, faceService, accountService) {
    this.storage = storageService;
    this.face = faceService;
    this.account = accountService;
    this.THRESHOLD = 0.5;
  }

  async verify(userId, frontKey, selfieKey) {
    // 下载文件
    const [frontBuffer, selfieBuffer] = await Promise.all([
      this.storage.getObjectBuffer(frontKey),
      this.storage.getObjectBuffer(selfieKey),
    ]);

    // 人脸向量
    const [frontEmb, selfieEmb] = await Promise.all([
      this.face.getEmbedding(frontBuffer),
      this.face.getEmbedding(selfieBuffer),
    ]);

    // 相似度
    const similarity = this.face.cosineSimilarity(frontEmb, selfieEmb);

    if (similarity < this.THRESHOLD) {
      return { success: false, similarity };
    }

    // ⭐更新用户状态为已实名
    await this.account.updateUserStatus(userId, "HOST_VERIFIED");

    return { success: true, similarity };
  }
}
