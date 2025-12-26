const mockProducts = [
    { id: 1, name: "Apple iPhone 15 Pro Max", price: 9999, img: "assets/images/image.png", brand: "Apple" },
    { id: 2, name: "联想拯救者 Y9000P", price: 8999, img: "assets/images/imag2.jpg", brand: "Lenovo" },
    { id: 3, name: "索尼 WH-1000XM5", price: 2499, img: "assets/images/索尼耳机.jpg", brand: "Sony" },
    { id: 4, name: "小米 14 Pro", price: 4999, img: "assets/images/小米14.jpg", brand: "Xiaomi" },
    { id: 5, name: "Java编程思想", price: 108, img: "assets/images/Java编程.jpg", brand: "Book" },
    { id: 6, name: "耐克 Air Force 1", price: 799, img: "assets/images/耐克 Air Force 1.webp", brand: "Nike" },
    { id: 7, name: "Apple iPad Pro", price: 6999, img: "assets/images/ipad.jpg", brand: "Apple" },
    { id: 8, name: "索尼 PlayStation 5", price: 3899, img: "assets/images/索尼手柄.jpg", brand: "Sony" },
    { id: 9, name: "小米 智能手环", price: 299, img: "assets/images/小米手环.jpg", brand: "Xiaomi" },
    { id: 10, name: "联想 小新笔记本", price: 5499, img: "assets/images/联想小新.jpg", brand: "Lenovo" },
    { id: 11, name: "Java核心技术卷", price: 98, img: "assets/images/Java核心.webp", brand: "Book" },
    { id: 12, name: "耐克 跑步鞋", price: 599, img: "assets/images/耐克跑步鞋.png", brand: "Nike" },
];

const brands = [
    { id: "all", name: "全部", icon: "🛒", color: "#f10215" },
    { id: "Apple", name: "Apple", icon: "🍎", color: "#999" },
    { id: "Xiaomi", name: "小米", icon: "📱", color: "#ff6900" },
    { id: "Sony", name: "索尼", icon: "🎧", color: "#0066cc" },
    { id: "Lenovo", name: "联想", icon: "💻", color: "#e60012" },
    { id: "Nike", name: "耐克", icon: "👟", color: "#000" },
    { id: "Book", name: "图书", icon: "📚", color: "#8b4513" },
];

const bannerImages = [
    "assets/images/lunbo1.jpg",
    "assets/images/lunbo2.png",
    "assets/images/lunbo3.jpg"
];

// 主应用对象，包含所有应用逻辑和数据
const app = {
    // 应用数据状态
    data: {
        currentUser: null,         // 当前登录用户
        cart: [],                  // 购物车数据
        products: mockProducts,    // 当前显示的商品列表
        bannerTimer: null,         // 轮播图定时器
        bannerIndex: 0,            // 当前轮播图索引
        currentBrand: "all",       // 当前选中的品牌
        allProducts: mockProducts  // 保存所有商品，用于筛选时恢复
    },

    /**
     * 应用初始化方法
     * 加载用户数据、渲染页面组件
     */
    init: function () {
        this.loadData();           // 加载本地存储的用户和购物车数据
        this.renderHeader();       // 渲染顶部导航栏
        this.renderBrands();       // 渲染品牌列表
        this.renderHome(this.data.products);  // 渲染商品列表
        this.initBanner();         // 初始化轮播图
        this.router('home');      // 导航到首页
    },

    /**
     * 从本地存储加载用户和购物车数据
     */
    loadData: function () {
        const user = localStorage.getItem('jd_user');
        const cart = localStorage.getItem('jd_cart');
        if (user) this.data.currentUser = JSON.parse(user);
        if (cart) this.data.cart = JSON.parse(cart);
    },

    /**
     * 保存购物车数据到本地存储并更新顶部导航栏
     */
    saveCart: function () {
        localStorage.setItem('jd_cart', JSON.stringify(this.data.cart));
        this.renderHeader();
    },

    /**
     * 路由控制方法，根据页面ID切换不同页面
     * @param {string} pageId - 页面ID
     * @param {any} param - 可选参数，用于商品详情页等
     */
    router: function (pageId, param = null) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        // 显示目标页面
        const target = document.getElementById(pageId);
        if (target) target.classList.add('active');

        // 根据不同页面执行相应逻辑
        if (pageId === 'cart') {
            // 购物车页面需要先登录
            if (!this.data.currentUser) {
                alert('请先登录');
                return this.router('login');
            }
            this.renderCart();
        } else if (pageId === 'detail' && param) {
            // 商品详情页
            this.renderDetail(param);
        } else if (pageId === 'profile') {
            // 个人中心页
            document.getElementById('profileName').innerText = this.data.currentUser.username;
        } else if (pageId === 'home') {
            // 回到首页时重置品牌筛选
            this.data.currentBrand = "all";
            this.data.products = this.data.allProducts;
            this.renderBrands();
            this.renderHome(this.data.products);
        }

        // 滚动到页面顶部
        window.scrollTo(0, 0);
    },

    // --- Banner 轮播逻辑 ---

    /**
     * 初始化轮播图
     * 创建轮播图HTML结构和指示点
     */
    initBanner: function () {
        const wrapper = document.getElementById('bannerWrapper');
        const dotsContainer = document.getElementById('bannerDots');

        // 创建轮播图片
        wrapper.innerHTML = bannerImages.map(src =>
            `<div class="banner-slide"><img src="${src}"></div>`
        ).join('');

        // 创建指示点
        dotsContainer.innerHTML = bannerImages.map((_, i) =>
            `<div class="dot ${i === 0 ? 'active' : ''}" onclick="app.changeBanner(${i})"></div>`
        ).join('');

        // 开始自动播放
        this.startAutoPlay();
    },

    /**
     * 切换轮播图到指定索引
     * @param {number} index - 目标轮播图索引
     */
    changeBanner: function (index) {
        this.data.bannerIndex = index;
        const wrapper = document.getElementById('bannerWrapper');
        // 通过CSS transform实现轮播切换
        wrapper.style.transform = `translateX(-${index * 100}%)`;

        // 更新指示点状态
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    },

    /**
     * 开始轮播图自动播放
     */
    startAutoPlay: function () {
        // 清除之前的定时器
        if (this.data.bannerTimer) clearInterval(this.data.bannerTimer);
        // 设置新的定时器，每3秒切换一次
        this.data.bannerTimer = setInterval(() => {
            let next = (this.data.bannerIndex + 1) % bannerImages.length;
            this.changeBanner(next);
        }, 3000);
    },

    // --- 品牌筛选功能 ---

    /**
     * 渲染品牌列表
     * 计算每个品牌的商品数量，并显示选中状态
     */
    renderBrands: function () {
        const container = document.getElementById('brandList');

        // 计算每个品牌的商品数量
        const brandCounts = {};
        this.data.allProducts.forEach(product => {
            brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
        });

        // 生成品牌列表HTML
        container.innerHTML = brands.map(brand => {
            // "全部"品牌显示所有商品数量
            const count = brand.id === "all" ? this.data.allProducts.length : (brandCounts[brand.id] || 0);
            // 判断当前品牌是否被选中
            const isActive = this.data.currentBrand === brand.id;

            return `
                        <div class="brand-item ${isActive ? 'active' : ''}" onclick="app.filterByBrand('${brand.id}')">
                            <div class="brand-icon" style="color: ${brand.color}">${brand.icon}</div>
                            <div class="brand-name">${brand.name}</div>
                            <div class="brand-count">${count}款</div>
                        </div>
                    `;
        }).join('');
    },

    /**
     * 根据品牌ID筛选商品
     * @param {string} brandId - 品牌ID
     */
    filterByBrand: function (brandId) {
        // 更新当前选中的品牌
        this.data.currentBrand = brandId;

        // 更新品牌列表的选中状态
        this.renderBrands();

        // 筛选商品
        if (brandId === "all") {
            // 显示所有商品
            this.data.products = this.data.allProducts;
        } else {
            // 只显示指定品牌的商品
            this.data.products = this.data.allProducts.filter(product => product.brand === brandId);
        }

        // 渲染筛选后的商品
        this.renderHome(this.data.products);
    },

    // --- 渲染逻辑 ---

    /**
     * 渲染顶部导航栏
     * 根据用户登录状态显示不同的导航内容
     */
    renderHeader: function () {
        const area = document.getElementById('userArea');
        if (this.data.currentUser) {
            // 计算购物车商品总数
            const count = this.data.cart.reduce((sum, item) => sum + item.count, 0);
            // 显示用户名和购物车
            area.innerHTML = `
                        <span onclick="app.router('cart')">🛒 购物车(${count})</span>
                        <span onclick="app.router('profile')">👤 ${this.data.currentUser.username}</span>
                    `;
        } else {
            // 显示登录和注册链接
            area.innerHTML = `
                        <span onclick="app.router('login')">你好，请登录</span>
                        <span onclick="app.router('register')" style="color:var(--jd-red)">免费注册</span>
                    `;
        }
    },

    /**
     * 渲染商品列表
     * @param {Array} list - 要显示的商品列表
     */
    renderHome: function (list) {
        const container = document.getElementById('goodsList');
        // 如果没有商品，显示空状态提示
        if (list.length === 0) {
            container.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #fff; border-radius: 8px;">
                            <p style="color: #999; font-size: 16px;">暂无商品</p>
                            <button onclick="app.filterByBrand('all')" style="margin-top: 15px; padding: 8px 20px; background: var(--jd-red); color: #fff; border: none; border-radius: 4px; cursor: pointer;">
                                查看全部商品
                            </button>
                        </div>
                    `;
            return;
        }

        // 生成商品卡片HTML
        container.innerHTML = list.map(item => `
                    <div class="goods-card" onclick="app.router('detail', ${item.id})">
                        <img src="${item.img}" class="goods-img" alt="${item.name}">
                        <div class="goods-price">¥${item.price}</div>
                        <div class="goods-name">${item.name}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 5px;">品牌: ${item.brand}</div>
                    </div>
                `).join('');
    },

    /**
     * 渲染商品详情页
     * @param {number} id - 商品ID
     */
    renderDetail: function (id) {
        // 根据ID查找商品
        const product = this.data.allProducts.find(p => p.id === id);
        const container = document.getElementById('detailContent');
        if (!product) return;

        // 生成商品详情HTML
        container.innerHTML = `
                    <img src="${product.img}" class="detail-img">
                    <div class="detail-info">
                        <h1>${product.name}</h1>
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #666;">${product.brand}</span>
                            <span style="margin-left: 10px; color:#666;">京东自营 | 闪电发货</span>
                        </div>
                        <div class="price-large">¥${product.price}</div>
                        <button class="btn-add-cart" onclick="app.addToCart(${product.id})">加入购物车</button>
                    </div>
                `;
    },

    /**
     * 渲染购物车页面
     */
    renderCart: function () {
        const tbody = document.getElementById('cartBody');
        const totalSpan = document.getElementById('cartTotal');

        // 如果购物车为空，显示空状态提示
        if (this.data.cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">购物车空空如也</td></tr>';
            totalSpan.innerText = '0.00';
            return;
        }

        // 计算总价并生成购物车商品列表
        let total = 0;
        tbody.innerHTML = this.data.cart.map(item => {
            const subtotal = item.price * item.count;
            total += subtotal;
            return `
                        <tr>
                            <td>${item.name}</td>
                            <td>¥${item.price}</td>
                            <td>
                                <button style="cursor:pointer; width:25px;" onclick="app.updateCart(${item.id}, -1)">-</button>
                                <span style="margin:0 10px;">${item.count}</span>
                                <button style="cursor:pointer; width:25px;" onclick="app.updateCart(${item.id}, 1)">+</button>
                            </td>
                            <td>¥${subtotal}</td>
                            <td><a onclick="app.removeCart(${item.id})" style="color:var(--text-light); cursor:pointer;">删除</a></td>
                        </tr>
                    `;
        }).join('');
        // 显示总价
        totalSpan.innerText = total.toFixed(2);
    },

    /**
     * 搜索商品
     * 根据关键词在商品名称和品牌中搜索
     */
    search: function () {
        const keyword = document.getElementById('searchInput').value.toLowerCase();
        // 在所有商品中搜索匹配的商品
        const result = this.data.allProducts.filter(p =>
            p.name.toLowerCase().includes(keyword) ||
            p.brand.toLowerCase().includes(keyword)
        );
        // 重置品牌筛选并显示搜索结果
        this.data.currentBrand = "all";
        this.renderBrands();
        this.renderHome(result);
    },

    /**
     * 用户登录
     */
    login: function () {
        const user = document.getElementById('loginUser').value;
        const pass = document.getElementById('loginPass').value;
        // 从本地存储获取用户数据
        const storedUser = JSON.parse(localStorage.getItem('users_db') || '[]');
        // 验证用户名和密码
        const valid = storedUser.find(u => u.username === user && u.password === pass);
        if (valid) {
            // 登录成功，保存用户信息
            this.data.currentUser = valid;
            localStorage.setItem('jd_user', JSON.stringify(valid));
            this.renderHeader();
            alert('登录成功！');
            this.router('home');
        } else {
            alert('用户名或密码错误');
        }
    },

    /**
     * 用户注册
     */
    register: function () {
        const user = document.getElementById('regUser').value;
        const pass = document.getElementById('regPass').value;
        // 用户名格式验证
        const userRegex = /^[a-zA-Z0-9]{4,16}$/;
        if (!userRegex.test(user)) {
            document.getElementById('regUserErr').style.display = 'inline';
            return;
        }
        // 获取已有用户列表
        const users = JSON.parse(localStorage.getItem('users_db') || '[]');
        // 检查用户名是否已存在
        if (users.find(u => u.username === user)) {
            alert('用户已存在');
            return;
        }
        // 添加新用户
        users.push({ username: user, password: pass });
        localStorage.setItem('users_db', JSON.stringify(users));
        alert('注册成功，请登录');
        this.router('login');
    },

    /**
     * 用户登出
     */
    logout: function () {
        // 清除用户信息
        this.data.currentUser = null;
        localStorage.removeItem('jd_user');
        this.renderHeader();
        this.router('home');
    },

    /**
     * 添加商品到购物车
     * @param {number} id - 商品ID
     */
    addToCart: function (id) {
        // 检查用户是否登录
        if (!this.data.currentUser) {
            alert('请先登录');
            this.router('login');
            return;
        }
        // 查找商品
        const product = this.data.allProducts.find(p => p.id === id);
        // 检查购物车中是否已有该商品
        const existing = this.data.cart.find(c => c.id === id);
        if (existing) {
            // 如果已有，增加数量
            existing.count++;
        } else {
            // 如果没有，添加到购物车
            this.data.cart.push({ ...product, count: 1 });
        }
        // 保存购物车数据
        this.saveCart();
        alert('已加入购物车');
    },

    /**
     * 更新购物车商品数量
     * @param {number} id - 商品ID
     * @param {number} delta - 数量变化（正数增加，负数减少）
     */
    updateCart: function (id, delta) {
        const item = this.data.cart.find(c => c.id === id);
        if (item) {
            // 更新数量
            item.count += delta;
            // 如果数量小于等于0，删除该商品
            if (item.count <= 0) {
                this.removeCart(id);
                return;
            }
            // 保存并重新渲染购物车
            this.saveCart();
            this.renderCart();
        }
    },

    /**
     * 从购物车删除商品
     * @param {number} id - 商品ID
     */
    removeCart: function (id) {
        if (confirm('确定删除吗？')) {
            // 从购物车中移除商品
            this.data.cart = this.data.cart.filter(c => c.id !== id);
            // 保存并重新渲染购物车
            this.saveCart();
            this.renderCart();
        }
    },

    /**
     * 结算购物车
     */
    checkout: function () {
        if (this.data.cart.length === 0) return alert('购物车是空的');
        alert('订单提交成功！');
        // 清空购物车
        this.data.cart = [];
        this.saveCart();
        this.renderCart();
        // 返回首页
        this.router('home');
    }
};

// 初始化应用
app.init();