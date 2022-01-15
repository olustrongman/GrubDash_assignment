const { request } = require("express");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");



function list(request, response) {
    response.json({ data: dishes });
  } 


  function dishExists(request, response, next) {
    const { dishId } = request.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      response.locals.dish = foundDish;
      return next();
    }
  
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    });
  } 

  function read(request, response, next) {
    response.json({
      data: response.locals.dish,
    }); 
  }

  function namePropertyMissing(request, response, next) {
    const { data: { name } = {} } = request.body;
    if (name) {
      response.locals.name = name;
      return next();
    }
    next({
      status: 400,
      message: "Dish must include a name.",
    });
  } 

  function namePropertyIsEmpty(request, response, next) {
    const { data: { name } = {} } = request.body;
    if (name === "") {
      next({
        status: 400,
        message: "Dish must include a name.",
      });
    }
    return next();
  } 

  function descriptionPropertyMissing(request, response, next) {
    const { data: { description } = {} } = request.body;
    if (description) {
      response.locals.description = description;
      return next();
    }
    next({
      status: 400,
      message: "Dish must include a description.",
    });
  } 

function descriptionPropertyIsEmpty(request, response, next) {
    const { data: { description } = {} } = request.body;
    if (description === "") {
      next({
        status: 400,
        message: "Dish must include a description.",
      });
    }
    return next();
  } 

  function pricePropertyMissing(request, response, next) {
    const { data: { price } = {} } = request.body;
    if (price) {
      response.locals.price = price;
      return next();
    }
    next({
      status: 400,
      message: "Dish must include a price.",
    });
  } 

  function pricePropertyisZero(request, response, next) {
    const { data: { price } = {} } = request.body;
    if (price === 0 || price < 0) {
      next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0.",
      });
    }
    return next();
  } 

  function pricePropertyNotInteger(request, res, next) {
    const { data: { price } = {} } = request.body;
    if (Number.isInteger(price)) {
      return next();
    }
  
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0.",
    });
  } 

  function imageUrlPropertyMissing(request, response, next) {
    const { data: { image_url } = {} } = request.body;
    if (image_url) {
      response.locals.image_url = image_url;
      return next();
    }
  
    next({
      status: 400,
      message: "Dish must include an image_url.",
    });
  } 

  function imageUrlPropertyEmpty(request, response, next) {
    const { data: { image_url } = {} } = request.body;
    if (image_url === "") {
      next({
        status: 400,
        message: "Dish must include an image_url.",
      });
    }
    return next();
  }
  
  function create(request, response) {
    const { data: { name, description, price, image_url } = {} } = request.body;
    const newId = new nextId();
    const newDish = {
      id: newId,
      name: response.locals.name,
      description: response.locals.description,
      price: response.locals.price,
      image_url: image_url,
    };
    dishes.push(newDish);
    response.status(201).json({ data: newDish });
  } 
  
  function dishIdMatch(request, response, next) {
    const { data: { id } = {} } = request.body;
    const { dishId } = request.params;
  
    if (id === dishId || !id) {
      return next();
    }
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId} `,
    });
  }

  function update(request, response) {
    const dish = response.locals.dish;
    const { data: { name, description, price, image_url } = {} } = request.body;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    response.json({ data: dish });
  } 

  module.exports = {
    list,
    read: [dishExists, read],
    create: [
      namePropertyMissing,
      namePropertyIsEmpty,
      descriptionPropertyMissing,
      descriptionPropertyIsEmpty,
      pricePropertyMissing,
      pricePropertyisZero,
      pricePropertyNotInteger,
      imageUrlPropertyEmpty,
      imageUrlPropertyMissing,
      create,
    ],
    update: [
        dishExists,
        dishIdMatch,
        namePropertyMissing,
        namePropertyIsEmpty,
        descriptionPropertyMissing,
        descriptionPropertyIsEmpty,
        pricePropertyMissing,
        pricePropertyisZero,
        pricePropertyNotInteger,
        imageUrlPropertyEmpty,
        imageUrlPropertyMissing,
        update,
      ],
  }