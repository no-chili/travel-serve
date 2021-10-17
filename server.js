const express = require('express');
const {
    Scenery,
    User,
    Log,
    Comment
} = require('./model')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
//以json格式设置请求参数
app.use(express.json())

const { SECRET } = require('./SECRET')

//中间件，验证token
const auth = async(req, res, next) => {
    const raw = String(req.headers.authorization).split(' ').pop()
    const { id } = jwt.verify(raw, SECRET)
    req.user = await User.findById(id)
    next()
}

app.get('/', async(req, res) => {
    res.send('ok')
})

app.get('/api/users', async(req, res) => {
    const users = await User.find()
    res.send(users)
})

//register
app.post('/api/regist', async(req, res) => {
    console.log(req.body);
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }).catch((err) => {
        return ''
    })
    if (user !== '') {
        res.send({
            user,
            message: '注册成功',
            status: 200
        })
    } else {
        res.send({
            user,
            message: '用户已存在',
            status: 422
        })
    }

})

//login
app.post('/api/login', async(req, res) => {
    console.log(req.body.username);
    const user = await User.findOne({
        username: req.body.username
    })
    if (!user) {
        return res.send({
            message: '用户不存在',
            status: 422
        })
    }

    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password)
    if (!isPasswordValid) {
        return res.send({
            message: '密码不正确',
            status: 422
        })
    }

    const token = jwt.sign({
        id: String(user._id)
    }, SECRET)

    res.send({
        token: token,
        message: '登录成功',
        status: 200
    })
})

//请求个人页面
app.get('/api/profile', auth, async(req, res) => {
    return res.send(req.user)
})

//个人setting页
app.post('/api/setting', auth, async(req, res) => {
    console.log(req.body);
    await User.findOneAndUpdate({ _id: req.user._id }, {
        $set: {
            username: req.body.username,
            address: req.body.address,
            email: req.body.email,
            phone: req.body.phone,
            headpho: req.body.headph
        }
    }, {}, function(err, data) {
        if (err) {
            console.log('数据库更新失败')
        } else {
            console.log('数据库更新成功')
        }
    }).catch(() => {
        return ''
    })
    res.send({
        status: 200,
        message: '修改成功'
    })
})

//个人password页
app.post('/api/password', auth, async(req, res) => {
    console.log(req.body);
    console.log(req.user);
    const right = bcrypt.compareSync(req.body.oldpassword, req.user.password)
    if (right) {
        await User.findOneAndUpdate({ _id: req.user._id }, {
            $set: {
                password: req.body.newpassword
            }
        }, {}, function(err, data) {
            if (err) {
                console.log('数据库更新失败')
            } else {
                console.log('数据库更新成功')
            }
        }).catch(() => {
            return ''
        })
    } else {
        return res.send({
            status: 422,
            message: '原密码错误'
        })
    }
    res.send({
        status: 200,
        message: '修改成功'
    })
})


//添加wanto
app.post('/api/addwantto', auth, async(req, res) => {
    let wantto = []
    const user = await User.findOne({ _id: req.user._id })
    wantto = user.wantTO;
    wantto.push(req.body.wantto);
    await User.findOneAndUpdate({ _id: req.user._id }, {
        $set: {
            wantTO: wantto
        }
    }, {}, function(err, data) {
        if (err) {
            console.log('数据库更新失败')
        } else {
            console.log('数据库更新成功')
        }
    }).catch(() => {
        return ''
    })
    res.send({
        status: 200,
        message: '添加成功'
    })
})

//提交评论
app.post('/api/commitcomment', auth, async(req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    Comment.create({
            position: req.body.sceneryname,
            headpho: user.headpho.data,
            content: req.body.content
        })
        .then(() => {
            res.send({
                status: 200,
                message: '提交成功'
            })
        })
        .catch(() => {
            res.send({
                status: 422,
                message: '提交失败'
            })
        })
})

// 获取评论
app.post('/api/getcomment', async(req, res) => {
    console.log(req.body);
    const datas = await Comment.find({ position: req.body.sceneryname })
    res.send({
        status: 200,
        message: '获取成功',
        datas: datas
    })
})

//like
app.post('/api/like', async(req, res) => {
    const datas = await Scenery.findOne({ name: req.body.sceneryname })
    let like;
    like = datas.like >= 1 ? datas.like + 1 : 1
    console.log(like);
    Scenery.findOneAndUpdate({ name: req.body.sceneryname }, { $set: { like: like } })
        .then(() => {
            res.send({
                status: 200,
                message: 'like成功'
            })
        })
        .catch(() => {
            res.send({
                status: 422,
                message: 'like失败'
            })
        })
})

//wantTo
app.post('/api/wantto', async(req, res) => {
    const datas = await Scenery.findOne({ name: req.body.sceneryname })
    let w = 0;
    w = datas.wantTO >= 1 ? datas.wantTO + 1 : 1
    Scenery.findOneAndUpdate({ name: req.body.sceneryname }, { $set: { wantTO: w } })
        .then(() => {
            res.send({
                status: 200,
                message: 'wantTo成功'
            })
        })
        .catch(() => {
            res.send({
                status: 422,
                message: 'wantTo失败'
            })
        })
})

//获取所有个人log
app.get('/api/getlog', auth, async(req, res) => {
    const log = await Log.find({ ofuser: req.user._id })
    res.send({
        status: 200,
        message: '获取成功',
        logs: log
    })
})

//写log
app.post('/api/newlog', auth, async(req, res) => {
    console.log(req.body);
    await Log.create({
            title: req.body.title,
            content: req.body.content,
            date: req.body.date,
            ofuser: req.user._id,
            position: req.body.position
        })
        .then(() => {
            console.log(123);
            return res.send({
                status: 200,
                message: '写入成功'
            })
        })
        .catch((err) => {
            console.log(456);
            return res.send({
                status: 422,
                message: '写入失败'
            })
        })
})

//删log
app.post('/api/deletelog', auth, async(req, res) => {
    console.log(req.body);
    await Log.findOneAndDelete({ _id: req.body._id })
        .then(() => {
            console.log(123);
            return res.send({
                status: 200,
                message: '删除成功'
            })
        })
        .catch((err) => {
            console.log(456);
            return res.send({
                status: 422,
                message: '删除失败'
            })
        })
})

//改log
app.post('/api/updatelog', auth, async(req, res) => {
    console.log(req.body);
    await Log.findOneAndUpdate({ _id: req.body._id }, {
            title: req.body.title,
            content: req.body.content,
            date: req.body.date,
            ofuser: req.user._id,
            position: req.body.position
        })
        .then(() => {
            console.log(123);
            return res.send({
                status: 200,
                message: '修改成功'
            })
        })
        .catch((err) => {
            console.log(456);
            return res.send({
                status: 422,
                message: '修改失败'
            })
        })
})


//home主页get请求
app.get('/api/main', async(req, res) => {
    let data = {}
    data.arr = await Scenery.aggregate([{
        $sample: {
            size: 12
        }
    }]).catch(() => {
        return null
    })
    data.rec = await Scenery.aggregate([{
        $sample: {
            size: 6
        }
    }]).catch(() => {
        return null
    })

    res.send(data)
})

// 城市搜索
app.post('/api/SceneryInfo/city', async(req, res) => {
    console.log(req.body);
    let info = await Scenery.find({
        city: req.body.city
    })
    if (!info) {
        return res.status(422).send({
            message: '查询不到结果'
        })
    }
    res.send(info)

})

// 省份搜索
app.post('/api/SceneryInfo/provin', async(req, res) => {
    let info = await Scenery.find({
        provin: req.body.provin
    })
    if (!info) {
        return res.status(422).send({
            message: '查询不到结果'
        })
    }
    res.send(info)

})

// 景点搜索
app.post('/api/SceneryInfo/scenery', async(req, res) => {
    let info = await Scenery.find({
        name: req.body.scenery
    })
    if (!info) {
        return res.status(422).send({
            message: '查询不到结果'
        })
    }
    res.send(info)

})

//search
app.post('/api/search', async(req, res) => {
    console.log(req.body);
    let mes1 = await Scenery.find({
        name: req.body.key
    })
    let mes2 = await Scenery.find({
        city: req.body.key
    })
    let mes3 = await Scenery.find({
        provin: req.body.key
    })
    let info = [...mes1, ...mes2, ...mes3]
    res.send(info)
})



app.listen(3001, () => {
    console.log('http://localhost:3001');
})
