var config = require('config');
var path = require('path');
const _ = require('lodash');
// const { ObjectID } = require('mongodb');
// const jwt = require('jsonwebtoken');

const {
    REQUEST_EVENTS,
    BUSINESS_EVENTS
} = require(path.join(config.get('property'), 'property'));

const {
    Channel,
    ChannelInfo,
    Comment,
    Conversation,
    ConversationCache,
    Invitation,
    Post,
    User
} = require(path.join(config.get('nosql'), 'nosql'));

// const userId = new ObjectID();

const getRandom = function (items) {
    if (items == undefined) {
        return (Math.random() * 100000 + 1).toString();
    }

    const min = 0,
        max = items.length - 1;
    let result = Math.random() * (max - min) + min;
    return items[Math.floor(result + 0.5)];
}

const firstNames = ['Lydia', 'Ivy', 'Abbie', 'Ford', 'Hank', 'John', 'Sunny', 'Linda', 'Glen', 'Jennifer'];
const lastNames = ['Johnson', 'Williams', 'Jones', 'Smith', 'Brown', 'Pitt', 'Davis', 'Miller', 'Taylor'];
const genders = ['f', 'm'];
const userAgents = ['chrome', 'firefox', 'safari', 'ie'];

const generateClientUsers = function (amount) {
    let users = [];
    for (let i = 0; i < amount; i++) {
        let user = {
            uid: getRandom(),
            firstName: getRandom(firstNames),
            lastName: getRandom(lastNames),
            gender: getRandom(genders),
            online: true,
            userAgent: getRandom(userAgents)
        }
        user.email = `${user.firstName.toLowerCase()}-${getRandom()}@ex.com`;

        users.push(user);
    }
    return users;
}


// 'createUsers' is an operation with database
const createUsers = async function (amount, state) {
    let users = [];

    if (Array.isArray(amount)) {
        let clientUsers = amount;
        let databaseRelated = ['firstName', 'lastName', 'gender', 'online'];

        clientUsers.forEach((clientUser) => {
            let userData = _.pick(clientUser, databaseRelated);
            let user = await (new User(userData)).save();
            user.uid = user._id;
            users.push(user);
        });
        return users;
    }

    for (let i = 0; i < amount; i++) {
        let user = await (new User({
            firstName: getRandom(firstNames),
            lastName: getRandom(lastNames),
            gender: getRandom(genders),
            online: (state == null) ? getRandom([true, false]) : state
        })).save();
        user.uid = user._id;
        users.push(user);
    }
    return users;
}

// function createChannelInfo(chData) {
//     // const { type, creator, name } = chData;
//     return new ChannelInfo(chData).save();
// }

// function createConversation(chData) {
//     // const { channel, sender, content } = chData;
//     chData.createdAt = Date.now();
//     return new Conversation(chData).save();
// }

// function createPost(postData) {
//     // const { content, 
//     //         owner, public, // unnecessary
//     //     } = postData;
//     console.log(`\n postData: ${JSON.stringify(postData, null, 2)}`)
//     postData.createdAt = Date.now();
//     return new Post(postData).save();
// } 

// function createComment(cmtData) {
//     // const { post, user, content } = cmtData;
//     cmtData.createdAt = Date.now();
//     return new Comment(cmtData).save();
// }

// function createInvitation(inviteData) {
//     // const { type, sender, receiver(array), content, info } = inviteData;
//     inviteData.createdAt = Date.now();
//     return new Invitation(inviteData);
// }

function eventContent(events) {
    let container = new Set();
    for (let key in events) {
        container.add(events[key]);
    }
    return container;
}

module.exports = {
    generateClientUsers,
    createUsers,
    eventContent,
    getRandom,
};