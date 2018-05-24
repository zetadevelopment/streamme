class Content {
  static findForUser(userID) {
    const me = this;
    const mongodb = require('mongodb').MongoClient;

    const promise = new Promise((resolve, reject) => {
      const processEnv = require('process').env;
      mongodb.connect(processEnv.MONGODB_URL, { useNewUrlParser: true }, function(err, client) {
        if (err) {
          console.log('Error mongodb', err);
          reject(err);
        } else {
          const db = client.db('streamme');

          db.collection('Contents')
            .find({ userID: userID })
            .toArray()
            .then((contents) => {
              const result = contents.map((content) => {
                return new me(content.userID, content.name, content.private).toObject();
              });

              resolve(result);
            })
            .catch((error) => reject(error));
        }
      });
    });

    return promise;
  }

  constructor(userUuid, name, privateContent) {
    this.userID = userUuid;
    this.contentName = name;
    this.isPrivate = privateContent;
  }

  toObject() {
    return {
      owner: this.userID,
      name:this.contentName,
      private: this.isPrivate,
      publicURL: this.url()
    };
  }

  url() {
    // Make to dynamic
    const host = 'https://streammevideos.blob.core.windows.net/streamme-content/'
    return host + this.userID + '-' + this.contentName;
  }

  save() {
    return new Promise((resolve, reject) => {
      const uuidv4 = require('uuid/v4');
      const mongodb = require('mongodb').MongoClient;
      const me = this;

      const processEnv = require('process').env;
      const mongourl = processEnv.MONGODB_URL;
      mongodb.connect(mongourl, { useNewUrlParser: true }, function(err, client) {
        if (err) {
          console.log('Error mongodb', err);
          reject(err);
        } else {
          const db = client.db('streamme');
          const content = {
            contentID: uuidv4(),
            userID: me.userID,
            name: me.contentName,
            private: me.isPrivate,
            timestamp: Date.now()
          };

          db.collection('Contents')
            .insertOne(content)
            .then((result) => {
              client.close();

              if (result.insertedCount == 1) {
                resolve('Content insertion OK');
              } else {
                reject('Error. Records inserted', result.insertedCount);
              }
            })
            .catch((error) => { client.close(); reject(error); });
        }
      }); // End Mongo callback.
    }); // End Promise.
  }
}

module.exports = Content;
