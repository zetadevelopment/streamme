class UserLogin {
  // This namespace allows uniqueness over a certain space (uuid string, in this case).
  static uuidNamespace() {
    return '8605fc0f-99cc-4e78-a31b-45b1a7236d9f'; // Generated with uuid v4
  }

  static login(username, password) {
    return new Promise((resolve, reject) => {
      // Pass password as sha256 string.
      let hash = require('crypto').createHash('sha256');
      hash.update(password);

      const mongodb = require('mongodb').MongoClient;
      const processEnv = require('process').env;

      mongodb.connect(processEnv.MONGODB_URL, { useNewUrlParser: true }, function(err, client) {
        if (err) {
          console.log('Error mongodb', err);
          reject(err);
        } else {
          const db = client.db('streamme');

          db.collection('UserAuthority')
            .find({ username: username, password: hash.digest('hex') })
            .limit(1)
            .toArray()
            .then((search) => {
              client.close(); // close Db connection and perform check.

              if (search.length == 1) {
                resolve(search[0].userID);
              } else {
                reject('User not found.');
              }
            })
            .catch((errorPromise) => { client.close(); reject(errorPromise) });
        }
      }); // End Mongo callback.
    }); // End Promise.
  }

  static createUser(username, password, email) {
    return new Promise((resolve, reject) => {
      const userID = require('uuid/v5')(username, this.uuidNamespace());

      // Pass password as sha256 string.
      let hash = require('crypto').createHash('sha256');
      hash.update(password);

      const mongodb = require('mongodb').MongoClient;

      const processEnv = require('process').env;
      mongodb.connect(processEnv.MONGODB_URL, { useNewUrlParser: true }, function(err, client) {
        if (err) {
          console.log('Error mongodb', err);
          reject(err);
        } else {
          const db = client.db('streamme');
          const user = { userID: userID,
                         username: username,
                         password: hash.digest('hex'),
                         email: email };

          db.collection('UserAuthority')
            .insertOne(user)
            .then((result) => {
              client.close();

              if (result.insertedCount == 1) {
                resolve(result.ops[0].userID);
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

module.exports = UserLogin;
