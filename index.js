const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// 示例数据
let articles = [
    { id: 0, author: 'Mack', text: 'First post in our social network!', date: new Date().toISOString() },
    { id: 1, author: 'Jack', text: 'Learning about CORS integration today.', date: new Date().toISOString() },
    { id: 2, author: 'Zack', text: 'Frontend and backend working together!', date: new Date().toISOString() }
];

// 用户数据（模拟数据库）
let users = [
    {
        id: 1,
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890',
        zipcode: '77005'
    },
    {
        id: 2,
        username: 'demo',
        password: 'demo123',
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '098-765-4321',
        zipcode: '77004'
    }
];

// 会话存储（简单实现，实际项目中应使用proper session管理）
let sessions = {};

const app = express();

// CORS配置 - 这是作业的核心部分
app.use(cors({
    origin: 'http://localhost:4200',  // 前端URL
    credentials: true,  // 允许发送cookies和session信息
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // 允许的HTTP方法
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ]  // 允许的请求头
}));

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 简单的session中间件
app.use((req, res, next) => {
    // 这里应该有proper session处理，现在只是演示
    req.session = sessions;
    next();
});

// ============ API路由 ============

// 根路由
const hello = (req, res) => res.send({
    message: 'Social Network Backend API',
    status: 'running',
    cors: 'enabled',
    endpoints: [
        'POST /register',
        'POST /login',
        'GET /articles',
        'POST /article'
    ]
});

// 用户注册
const register = (req, res) => {
    const { username, password, name, email, phone, zipcode, dob } = req.body;

    // 验证必需字段
    if (!username || !password || !name || !email) {
        return res.status(400).json({
            success: false,
            message: 'Username, password, name, and email are required'
        });
    }

    // 检查用户名是否已存在
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'Username already exists'
        });
    }

    // 创建新用户
    const newUser = {
        id: users.length + 1,
        username,
        password, // 实际项目中应该加密
        name,
        email,
        phone: phone || '',
        zipcode: zipcode || '',
        dob: dob || '',
        followedUserIds: []
    };

    users.push(newUser);

    // 不返回密码
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userResponse
    });
};

// 用户登录
const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    // 查找用户
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }

    // 创建简单的session
    const sessionId = Date.now().toString();
    sessions[sessionId] = { userId: user.id, username: user.username };

    // 设置session cookie
    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: false, // 开发环境中设为false
        sameSite: 'lax'
    });

    // 不返回密码
    const { password: _, ...userResponse } = user;

    res.json({
        success: true,
        message: 'Login successful',
        user: userResponse
    });
};

// 获取所有文章
const getArticles = (req, res) => {
    res.json({
        success: true,
        articles: articles.map(article => ({
            ...article,
            date: new Date(article.date).toISOString()
        }))
    });
};

// 根据ID获取指定文章
const getArticle = (req, res) => {
    const id = parseInt(req.params.id);
    const article = articles.find(article => article.id === id);

    if (!article) {
        return res.status(404).json({
            success: false,
            message: 'Article not found'
        });
    }

    res.json({
        success: true,
        article
    });
};

// 添加新文章
const addArticle = (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({
            success: false,
            message: 'Article text is required'
        });
    }

    const newArticle = {
        id: articles.length,
        author: 'Current User', // 实际项目中应从session获取
        text,
        date: new Date().toISOString(),
        comments: []
    };

    articles.push(newArticle);

    res.status(201).json({
        success: true,
        message: 'Article created successfully',
        article: newArticle
    });
};

// 更新文章
const updateArticle = (req, res) => {
    const id = parseInt(req.params.id);
    const { text, commentId } = req.body;

    const articleIndex = articles.findIndex(article => article.id === id);

    if (articleIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Article not found'
        });
    }

    if (commentId) {
        // 更新评论（简单实现）
        articles[articleIndex].comments = articles[articleIndex].comments || [];
        articles[articleIndex].comments.push({
            id: commentId,
            text,
            author: 'Current User',
            date: new Date().toISOString()
        });
    } else {
        // 更新文章内容
        articles[articleIndex].text = text;
    }

    res.json({
        success: true,
        message: 'Article updated successfully',
        article: articles[articleIndex]
    });
};

// 注册路由
app.get('/', hello);
app.post('/register', register);
app.post('/login', login);
app.get('/articles', getArticles);
app.get('/articles/:id', getArticle);
app.post('/article', addArticle);
app.put('/articles/:id', updateArticle);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// 启动服务器
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log('=================================');
    console.log('🚀 Social Network Backend Server');
    console.log('=================================');
    console.log(`📡 Server running at: http://localhost:${port}`);
    console.log(`🌐 CORS enabled for: http://localhost:4200`);
    console.log('📋 Available endpoints:');
    console.log('   GET  /              - Server info');
    console.log('   POST /register      - User registration');
    console.log('   POST /login         - User login');
    console.log('   GET  /articles      - Get all articles');
    console.log('   POST /article       - Create new article');
    console.log('   GET  /articles/:id  - Get specific article');
    console.log('   PUT  /articles/:id  - Update article');
    console.log('=================================');
    console.log('✅ CORS Configuration:');
    console.log('   - Origin: http://localhost:4200');
    console.log('   - Credentials: true');
    console.log('   - Methods: GET, POST, PUT, DELETE, OPTIONS');
    console.log('=================================');
});

module.exports = server;