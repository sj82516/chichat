const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FriendshipSchema = new Schema({
    requestee: {type:String},
    requester: {type: String}
});

const FriendshipModel = mongoose.model('Friendship', FriendshipSchema);

module.exports = FriendshipModel;