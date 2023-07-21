# API Docs

## List
1. Space
2. Authorize
3. Bucke
4. File



### 1. Space

userOwnedSpace storageHandler.userOwnedSpace(AccountId32)
BuySpace   storageHandler.buySpace(gibCount)
ExpansionSpace   storageHandler.expansionSpace(gibCount)
RenewalSpace  storageHandler.renewalSpace(days)


### 2. Authorize

AuthorizeSpace   oss.authorize
UnAuthorizeSpace  oss.cancelAuthorize()
QuaryAuthorizedAccount  oss.authorityList



### 3. Bucket

QueryBucketList   fileBank.userBucketList
QueryBucketInfo   fileBank.bucket
CreateBucket  fileBank.createBucket
DeleteBucket  fileBank.deleteBucket


### 4. File

FileList   userHoldFileList(AccountId32)
QueryFileMetadata  fileBank.file
StoreFile
DeleteFile  fileBank.deleteFile
DownloadFile











