"use strict";

const Products = require('../model/product');
const Carts = require('../model/cart');
const Items = require('../model/item');

const uuidv4 = require('uuid').v4;

const {asyncHandler} = require('../utils/asyncHandler'); // statusCode = 200, success = true, nextPage = {}, previousPage = {}, total = 0,  message = '', data = {}
const {ErrorHandler} = require('../utils/errorHandler');
const {responseHandler} = require('../utils/responseHandler');
const {pagination} = require('../utils/pagination');

/*
*   @desc add to cart
*   @route POST /api/v1/cart
*   @access Public
*   @params
*       1. product-id
*       2. quantity
*       3. cart id || undefined
*       4. item id || undefined
*   @response all products in the cart and the total items
* */

exports.addToCart = asyncHandler(async (req,res, next) => {
    const uuid = uuidv4();
    let Cart = {};
    let Item = {};
    let totalItems = 0;
    let itemDetails;

    if(!req.body){
        return next(new ErrorHandler(400, 'nothing to add to cart'));
    }

    const { productId, quantity, cartUUID, itemUUID } = req.body;

    const productQuery = {_id: productId}

    //  get the product details using the product id
    const Product = await Products.find(productQuery).lean();

    if(!Product){
        return next(new ErrorHandler(400, 'no product found'));
    }


    let totalPrice = parseInt(Product[0].price) * parseInt(quantity);

    if(cartUUID){
        /*
        *   Item may be already in the cart
        *   get the item based on the cart and the item UUID
        *   if not in cart create and add to cart
        */
        Item = await Items.findOneAndUpdate({cartId: cartUUID, uuid: itemUUID}, {quantity}, {new: true});

        if(!Item){
            // create the item
            Item = new Items({
                cartId: cartUUID || uuid,
                uuid: uuidv4(),
                name: Product[0].productName,
                price: Product[0].price,
                quantity,
            })
            await Item.save();
            itemDetails = await Items.find({cartId: cartUUID}).lean();
            Cart = await Carts.findOneAndUpdate({uuid : cartUUID}, {$inc : { totalPrice}}, {new: true})
        } else {
            itemDetails = await Items.find({cartId: cartUUID}).lean();
            totalPrice = 0;
            itemDetails.map(itemDetail => {
                 totalPrice += (itemDetail.quantity * itemDetail.price)
            })
            Cart = await Carts.findOneAndUpdate({uuid : cartUUID}, { totalPrice}, {new: true})
        }

        totalItems = itemDetails.length;
    } else {

        /*
        *   If no cart id than the cart is being built for the first time
        *   hence no items attached to the cart
        * */

        // create the item
        Item = new Items({
            cartId: uuid,
            uuid: uuidv4(),
            name: Product[0].productName,
            price: Product[0].price,
            quantity,
        })
        await Item.save();

        //  create a cart and the the total price will be price of product * quantity
        Cart = new Carts({
            uuid,
            totalPrice
        });
        await Cart.save()

        itemDetails = Item;
        totalItems = quantity;
    }


    const data = {
        totalItems,
        Cart,
        itemDetails
    }

    return responseHandler(req,res)(200, true, {}, {}, 0, 'cart updated', data)
})

/*
*   @desc apply offer to cart
*   @route POST /api/v1/cart/:cart-id/:offer
*   @access Public
*   @param
*       1. local or global offers
*   @response if valid update cart or send error
*
* */
// TODO: check the offer and update the cart model with valid offer id and return cart object with new total
exports.checkOffers = asyncHandler(async (req,res, next)=>{
    if(!req.params){
        return next(new ErrorHandler(400,'no cart id or offer found'));
    }
    return res.json({
        "message": "check the offer and update the cart model with valid offer id and return cart object with new total"
    })
})

/*
*   @desc checkout
*   @route GET /api/v1/cart/:cart-id/checkout
*   @access Public
*   @param cart-id
*   @response
*           1. If all items available in the quantity show success
*           2. If some items missing or quantity is less ask the user to change
*              return the items which are missing return the number of item user
*              can choose
*
*
*   things to consider
*       check if the item is present
*       check if the quantity is less than the requested quantity for all the items -
*       yes - decrement the quantity of the items
*           - create order document mark status as pending
*             and amount document and update the orderId in cart document
*       no - send error message along with the
*
*   Now make the payment request for the total amount
*   success -
*   failed instantaneously - roll back the quantity
*   pending - for how long ?? 10 mins  or so
* */
