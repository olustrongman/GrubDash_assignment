const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function list(request, response) {
    response.json({ data: orders });
  } 

  function deliverToPropertyMissing(request, response, next) {
    const { data: { deliverTo } = {} } = request.body;
    if (deliverTo) {
      response.locals.deliverTo = deliverTo;
      return next();
    }
  
    next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  } 

  function deliverToPropertyEmpty(request, response, next) {
    const { data: { deliverTo } = {} } = request.body;
    if (deliverTo === "") {
      next({
        status: 400,
        message: "Order must include a deliverTo",
      });
    }
    return next();
  } 

  function mobileNumberPropertyMissing(request, response, next) {
    const { data: { mobileNumber } = {} } = request.body;
    if (mobileNumber) {
      response.locals.mobileNumber = mobileNumber;
      return next();
    }
    next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  } 

  function mobileNumberPropertyEmpty(request, response, next) {
    const { data: { mobileNumber } = {} } = request.body;
    if (mobileNumber === "") {
      next({
        status: 400,
        message: "Order must include a mobileNumber",
      });
    }
    return next();
  } 

  function dishesPropertyMissing(request, response, next) {
    const { data: { dishes } = {} } = request.body;
    if (dishes) {
      response.locals.dishes = dishes;
      return next();
    }
    next({
      status: 400,
      message: "Order must include a dish",
    });
  } 

  function dishesPropertyArray(request, response, next) {
    const { data: { dishes } = {} } = request.body;
    if (Array.isArray(dishes)) {
      return next();
    }
    next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  function dishesPropertyEmpty(request, response, next) {
    const { data: { dishes } = {} } = request.body;
    if (dishes.length > 0) {
      return next();
    }
    next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  function dishQuantityPropertyMissing(request, response, next) {
    const { data: { dishes } = {} } = request.body;
    const quantityMissing = dishes.find((dish) => !dish.quantity);
    if (quantityMissing) {
      quantityMissing.index = dishes.indexOf(quantityMissing);
      next({
        status: 400,
        message: `Dish ${quantityMissing.index} must have a quantity that is an integer greater than 0.`,
      });
    }
    return next();
  }
  
  function dishQuantityisZero(request, response, next) {
    const { data: { dishes } = {} } = request.body;
    const quantityLessThanOne = dishes.find((dish) => dish.quantity < 1);
    if (quantityLessThanOne) {
      quantityLessThanOne.index = dishes.indexOf(quantityLessThanOne);
      next({
        status: 400,
        message: `Dish ${quantityLessThanOne.index} must have a quantity that is an integer greater than 0.`,
      });
    }
  
    return next();
  } 

  function dishQuantityPropertyNotInteger(request, response, next) {
    const { data: { dishes } = {} } = request.body;
    const quantityNotInteger = dishes.find(
      (dish) => !Number.isInteger(dish.quantity)
    );
    if (quantityNotInteger) {
      quantityNotInteger.index = dishes.indexOf(quantityNotInteger);
      next({
        status: 400,
        message: `Dish ${quantityNotInteger.index} must have a quantity that is an integer greater than 0.`,
      });
    }
    return next();
  } 

  function create(request, response) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = request.body;
    const newId = new nextId();
    const newOrder = {
      id: newId,
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: dishes,
    };
  
    orders.push(newOrder);
    response.status(201).json({ data: newOrder });
  } 

  function orderExists(request, response, next) {
    const { orderId } = request.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      response.locals.order = foundOrder;
      return next();
    }
  
    next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
  } 

  function read(request, response) {
    response.json({ data: response.locals.order });
  } 

  function orderIdMatch(request, response, next) {
    const { data: { id } = {} } = request.body;
    const { orderId } = request.params;
    if (id === orderId || !id) {
      return next();
    }
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  } 

  // This a Middleware function to check if status property exists
function statusPropertyExists(request, response, next) {
    const { data: { status } = {} } = request.body;
    if (status) {
      response.locals.status = status;
      return next();
    }
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered.`,
    });
  } 

  // This a Middleware function to check if status property is correct value
function statusPropertyCorrect(request, response, next) {
    const { data: { status } = {} } = request.body;
    if (
      status === "pending" ||
      status === "preparing" ||
      status === "out-for-delivery" ||
      status === "delivered"
    ) {
      return next();
    }
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered.`,
    });
  } 

// This a Middleware function to check if order has been delivered
  function statusPropertyDelivered(request, response, next) {
    const { data: { status } = {} } = request.body;
    if (status === "delivered") {
      next({
        status: 400,
        message: `A delivered order cannot be changed.`,
      });
    }
    return next();
  } 

  function update(request, response) {
    const order = response.locals.order;
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = request.body;
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
  
    response.json({ data: order });
  } 

  function statusPropertyPending(request, response, next) {
    const order = response.locals.order;
    const { status } = order;
    if (status === "pending") {
      return next();
    }
    next({
      status: 400,
      message: `An order cannot be deleted unless it is pending.`,
    });
  } 

  function destroy(request, response) {
    const { orderId } = request.params;
    const index = orders.findIndex((order) => order.id === orderId);
    orders.splice(index, 1);
  
    response.sendStatus(204);
  }
 
  module.exports = {
    list,
    create: [
      deliverToPropertyMissing,
      deliverToPropertyEmpty,
      mobileNumberPropertyMissing,
      mobileNumberPropertyEmpty,
      dishesPropertyMissing,
      dishesPropertyArray,
      dishesPropertyEmpty,
      dishQuantityPropertyMissing,
      dishQuantityisZero,
      dishQuantityPropertyNotInteger,
      create,
    ],
    read: [orderExists, read],
  update: [
    orderExists,
    deliverToPropertyMissing,
    deliverToPropertyEmpty,
    mobileNumberPropertyMissing,
    mobileNumberPropertyEmpty,
    dishesPropertyMissing,
    dishesPropertyArray,
    dishesPropertyEmpty,
    dishQuantityPropertyMissing,
    dishQuantityisZero,
    dishQuantityPropertyNotInteger,
    orderIdMatch,
    statusPropertyExists,
    statusPropertyCorrect,
    statusPropertyDelivered,
    update,
  ],
  delete: [orderExists, statusPropertyPending, destroy],
    
}
 