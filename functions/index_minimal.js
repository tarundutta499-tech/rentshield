const functions = require("firebase-functions");
const axios = require("axios");

exports.createOrder = functions.https.onRequest(async (req, res) => {
  try {
    const { amount, customerEmail } = req.body;

    if (!amount || !customerEmail) {
      return res.status(400).json({
        error: "Missing amount or customerEmail",
      });
    }

    const appId = functions.config().cashfree?.app_id;
    const secretKey = functions.config().cashfree?.secret_key;

    console.log("Cashfree App ID:", appId ? "Loaded" : "Missing");

    if (!appId || !secretKey) {
      return res.status(500).json({
        error: "Cashfree credentials not configured",
      });
    }

    const orderId = "order_" + Date.now();

    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "cust_" + Date.now(),
          customer_email: customerEmail,
          customer_phone: "9999999999",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": appId,
          "x-client-secret": secretKey,
        },
      }
    );

    return res.status(200).json({
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
    });
  } catch (error) {
    console.error("Cashfree Error:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Failed to create order",
      details: error.response?.data || error.message,
    });
  }
});
