export interface S3Object {
  // 存储桶名称
  bucket: string
  // 对象的唯一键（即对象在存储桶内的路径）
  key: string
  // 使用该对象所需的 AWS 访问密钥 ID
  accessKeyId: string
  // 使用该对象所需的 AWS 秘密访问密钥
  secretAccessKey: string
  // 用于访问该对象的临时令牌
  sessionToken: string
  // 对象的 URL
  url: string
}
