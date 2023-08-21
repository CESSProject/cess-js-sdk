# API Docs

## List

1. Space
2. Authorize
3. Bucke
4. File

### 1. Space

userOwnedSpace(AccountId32)

buySpace(gibCount)

expansionSpace(gibCount)

renewalSpace(days)

### 2. Authorize

authorityList(accountId32)

authorize(mnemonic,config.gateway.account)

cancelAuthorize(mnemonic)

### 3. Bucket

queryBucketList(accountId32)

createBucket(mnemonic, accountId32, buckname)

queryBucketInfo(accountId32)

deleteBucket(mnemonic,accountId32, buckname)

### 4. File

queryFileListFull(accountId32)

queryFileMetadata(fileHash)

uploadFile(mnemonic, accountId32, filePath, bucketName)

downloadFile(fileHash, savePath)

deleteFile(mnemonic, accountId32, [fileHash])
