class Uploader {
  constructor(userID, contentName, privateContent, contentBuffer) {
    this.owner = userID;
    this.name = contentName;
    this.isPrivate = privateContent;
    this.content = contentBuffer;
    this.azureStorage = require('azure-storage');
  }

  upload() {
    const processEnv = require('process').env;
    const ContentObject = require('./content');
    const blobService = this.azureStorage.createBlobService(processEnv.AZURE_STORAGE_AUTH);

    return new Promise((resolve, reject) => {
      const publicName = this.owner + '-' + this.name;

      blobService.createBlockBlobFromText('streamme-content', publicName, this.content, (err) => {
        if (err) {
          console.log('Error uploading file');
          reject(err);
        } else {
          console.log('File uploaded correctly');

          // Create content record.
          let newContent = new ContentObject(this.owner, this.name, this.isPrivate);
          newContent.save()
            .catch((error) => console.log('Problem with DB creating content.', error))
            .then(() => resolve());
        }
      });
    });
  }
}

module.exports = Uploader;
