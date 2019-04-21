# tc-fkb-message-api
Responsible for broadcasting / receiving messages to the Fakebook project.

## Features
* 目前和 main-api 搭配的 user 驗證機制，只會存取 main db 一次。也就是說只透過 main-api 驗證 user 後， 直接請 main-api 透過 http request 取得 message-api 的 token 只須驗證 user 一次，這樣的機制運作良好。

## Formats
### types of limit, skip, type
* Invitation: inviLimit, inviSkip, inviType
** inviType is just a convenient label. Invitation(in db shcema) doesn't has type for now.
* ChannelInfo: chanLimit, chanSkip
* Conversation: convLimit, convSkip, convType

## Improvement Needs
* Generate secret(JWT) for individual user obtains a bad performance.

## References
### run in ES6
* ex: use startWith
https://medium.com/@drcallaway/debugging-es6-in-visual-studio-code-4444db797954

### mongo DB
* 分散式儲存架構建置-概念篇：https://l.facebook.com/l.php?u=https%3A%2F%2Fblog.toright.com%2Fposts%2F4552%2Fmongodb-sharding-%E5%88%86%E6%95%A3%E5%BC%8F%E5%84%B2%E5%AD%98%E6%9E%B6%E6%A7%8B%E5%BB%BA%E7%BD%AE-%E6%A6%82%E5%BF%B5%E7%AF%87.html%3Ffbclid%3DIwAR2-nsfKFNRVDK-SEBRuRNfgL3qyuI3qPWYeQCrELcBXsQ9cYZkztRAiCIQ&h=AT1fYJcb01dVSZyd3Zfg5oC_IoHD4a-jstUlvxMCyRzbOqQ9poyYRMyJhhKVZZQ9ShNPclqhfKpukncHVlnHiXCmK76-1eEpKuzaGIJzhajMBpDuXg38tJhDJz0NVQ