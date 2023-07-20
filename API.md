# API Docs

## 目录
1. 存储空间
2. 账号授权
3. Bucket管理
4. 文件管理



### 1. 存储空间

userOwnedSpace storageHandler.userOwnedSpace(AccountId32)查询我的空间
BuySpace   storageHandler.buySpace(gibCount)
ExpansionSpace  扩展空间大小  storageHandler.expansionSpace(gibCount)
RenewalSpace 续期  storageHandler.renewalSpace(days)


### 2. 账号授权

AuthorizeSpace   oss.authorize
UnAuthorizeSpace  oss.cancelAuthorize()
QuaryAuthorizedAccount  oss.authorityList



### 3. Bucket管理

QueryBucketList   fileBank.userBucketList
QueryBucketInfo   fileBank.bucket
CreateBucket  fileBank.createBucket
DeleteBucket  fileBank.deleteBucket


### 4. 文件管理

FileList   userHoldFileList(AccountId32)
QueryFileMetadata  fileBank.file
StoreFile
DeleteFile  fileBank.deleteFile
RetrieveFile  下载




https://github.com/CESSProject/cess-go-sdk/blob/main/core/sdk/sdk.go








