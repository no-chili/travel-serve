const mongoose = require('mongoose')
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/travel', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('数据库连接成功');
    })
    .catch(() => {
        console.log('数据库连接出错：' + error);
    })


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    headpho: {
        type: Object
    },
    email: {
        type: String
    },
    password: {
        type: String,
        required: true,
        set(val) {
            return bcrypt.hashSync(val, 10)
        }
    },
    phone: {
        type: String,
    },
    address: {
        type: String
    },
    wantTO: {
        type: Array
    }
})

const scenerySchema = new mongoose.Schema({
    provin: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    infomation: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    sceneryImgUrl: {
        type: Array,
        required: true
    },
    like: {
        type: Number
    },
    wantTO: {
        type: Number
    }
})

const commentSchema = new mongoose.Schema({
    position: String,
    headpho: String,
    content: String
})

const logs = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    ofuser: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true

    }
})

const Scenery = mongoose.model('Scenery', scenerySchema)
const User = mongoose.model('User', userSchema)
const Log = mongoose.model('Log', logs)
const Comment = mongoose.model('Comment', commentSchema)

// 删除集合
// User.db.dropCollection('users')

module.exports = {
    User,
    Scenery,
    Log,
    Comment
}
