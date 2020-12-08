const db = require('../models')
const helpers = require('../_helpers')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Like = db.Like

const pageLimit = 10

const restController = {
  getRestaurants: (req, res) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    Restaurant.findAndCountAll(({ include: Category, where: whereQuery, offset: offset, limit: pageLimit })).then(result => {
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: helpers.getUser(req).FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: helpers.getUser(req).RestaurantsLike.map(l => l.id).includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })
      })
      // console.log(restaurants[0]) 
      // console.log(whereQuery)
      // console.log(result.rows)
    })
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoriteUsers' },
        { model: User, as: 'UsersLike' },
        // 加入關聯資料
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      // console.log(restaurant.Comments[0].dataValues)
      const isFavorited = restaurant.FavoriteUsers.map(d => d.id).includes(helpers.getUser(req).id)
      const isLiked = restaurant.UsersLike.map(l => l.id).includes(helpers.getUser(req).id)
      restaurant.viewCounts += 1
      restaurant.save({ field: ['viewCounts'] })
        .then(restaurant => {
          res.render('restaurant', {
            restaurant: restaurant.toJSON(),
            isFavorited: isFavorited,
            isLiked: isLiked
          })
        })
    })
  },
  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', {
        restaurants: restaurants,
        comments: comments
      })
    })
  },
  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: 'FavoriteUsers' }
      ]
    }).then(restaurant => {
      const FavoriteCount = restaurant.FavoriteUsers.length
      return res.render('dashboard', {
        restaurant: restaurant.toJSON(),
        FavoriteCount: FavoriteCount
      })
    })

  },
  getTopRestaurant: (req, res) => {
    return Restaurant.findAll({
      include: [
        { model: User, as: 'FavoriteUsers' }
      ]
    }).then(restaurants => {
      restaurants = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        FavoriteCount: restaurant.FavoriteUsers.length,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(restaurant.id)
      }))
      restaurants = restaurants.sort((a, b) => b.FavoriteCount - a.FavoriteCount).slice(0, 10)
      return res.render('topRestaurants', { restaurants: restaurants })
    })
  }
}

module.exports = restController