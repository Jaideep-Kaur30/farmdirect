import os
from datetime import datetime, timedelta
import jwt
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models import db, User, Product, Order, Review, MandiPriceHistory
from seed import seed_database

app = Flask(__name__)
CORS(app, supports_credentials=True)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'farmdirect.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("JWT_SECRET", "farmdirect-sih-2026-super-secret-key")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db.init_app(app)

with app.app_context():
    seed_database(app)


def decode_token(req):
    auth_header = req.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            return User.query.get(payload["userId"])
        except Exception:
            return None
    return None


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "app": "FarmDirect Flask REST API SIH 2026"})


@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    name = data.get("name")
    phone = data.get("phone")
    password = data.get("password")
    role = data.get("role", "consumer")
    location = data.get("location", "")
    address = data.get("address", "")

    if not name or not phone or not password:
        return jsonify({"error": "Name, phone, and password required"}), 400

    existing = User.query.filter_by(phone=phone).first()
    if existing:
        return jsonify({"error": "Phone number already registered"}), 409

    user = User(
        name=name,
        role=role if role in ["farmer", "consumer", "admin"] else "consumer",
        phone=phone,
        password_hash=generate_password_hash(password),
        location=location,
        address=address,
    )
    db.session.add(user)
    db.session.commit()

    token = jwt.encode(
        {"userId": user.id, "role": user.role, "exp": datetime.utcnow() + timedelta(days=7)},
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )
    return jsonify({"message": "Signup successful", "token": token, "user": user.to_dict()}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    phone = data.get("phone")
    password = data.get("password")

    user = User.query.filter_by(phone=phone).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid phone number or password"}), 401

    token = jwt.encode(
        {"userId": user.id, "role": user.role, "exp": datetime.utcnow() + timedelta(days=7)},
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )
    return jsonify({"message": "Login successful", "token": token, "user": user.to_dict()}), 200


@app.route("/api/auth/me", methods=["GET"])
def me():
    user = decode_token(request)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"user": user.to_dict()})


@app.route("/api/products", methods=["GET", "POST"])
def handle_products():
    if request.method == "GET":
        search = request.args.get("search", "").lower()
        category = request.args.get("category", "all")
        min_price = float(request.args.get("minPrice", 0))
        max_price = float(request.args.get("maxPrice", 100000))
        farmer_id = request.args.get("farmer_id")

        query = Product.query.filter(Product.status != "removed")
        if farmer_id:
            query = query.filter_by(farmer_id=int(farmer_id))
        if category and category != "all":
            query = query.filter_by(category=category)

        products = query.order_by(Product.id.desc()).all()
        result = []
        for p in products:
            if p.price_per_unit < min_price or p.price_per_unit > max_price:
                continue
            if search and search not in p.crop_name.lower():
                continue
            result.append(p.to_dict())

        return jsonify({"products": result, "count": len(result)})

    # POST create product
    user = decode_token(request)
    data = request.get_json() or {}
    farmer_id = user.id if user else data.get("farmer_id", 1)

    product = Product(
        farmer_id=farmer_id,
        crop_name=data.get("crop_name"),
        crop_name_hi=data.get("crop_name_hi"),
        category=data.get("category", "vegetable"),
        quantity_available=float(data.get("quantity_available", 100)),
        unit=data.get("unit", "kg"),
        price_per_unit=float(data.get("price_per_unit", 30)),
        mandi_reference_price=float(
            data.get("mandi_reference_price", float(data.get("price_per_unit", 30)) * 1.35)
        ),
        image_url=data.get("image_url", "/images/tomatoes.jpg"),
        harvest_date=data.get("harvest_date", datetime.utcnow().strftime("%Y-%m-%d")),
        description=data.get("description", ""),
        status="active",
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({"message": "Product created", "product": product.to_dict()}), 201


@app.route("/api/products/<int:product_id>", methods=["GET", "PUT", "DELETE"])
def single_product(product_id):
    product = Product.query.get_or_404(product_id)
    if request.method == "GET":
        return jsonify({"product": product.to_dict()})
    elif request.method == "PUT":
        data = request.get_json() or {}
        product.crop_name = data.get("crop_name", product.crop_name)
        product.price_per_unit = float(data.get("price_per_unit", product.price_per_unit))
        product.quantity_available = float(data.get("quantity_available", product.quantity_available))
        product.description = data.get("description", product.description)
        db.session.commit()
        return jsonify({"message": "Updated", "product": product.to_dict()})
    elif request.method == "DELETE":
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Deleted"})


@app.route("/api/orders", methods=["POST"])
def place_order():
    data = request.get_json() or {}
    product_id = int(data.get("product_id"))
    quantity = float(data.get("quantity_ordered", 1))
    consumer_id = int(data.get("consumer_id", 11))

    product = Product.query.get_or_404(product_id)
    if product.quantity_available < quantity:
        return jsonify({"error": "Insufficient stock"}), 400

    product.quantity_available -= quantity
    savings = max(0, (product.mandi_reference_price - product.price_per_unit) * quantity)
    order = Order(
        product_id=product.id,
        consumer_id=consumer_id,
        farmer_id=product.farmer_id,
        quantity_ordered=quantity,
        unit_price=product.price_per_unit,
        total_price=product.price_per_unit * quantity,
        middleman_savings=savings,
        delivery_address=data.get("delivery_address", "Delhi NCR"),
        status="pending",
    )
    db.session.add(order)
    db.session.commit()
    return jsonify({"message": "Order placed", "order": order.to_dict()}), 201


@app.route("/api/orders/farmer/<int:farmer_id>", methods=["GET"])
def farmer_orders(farmer_id):
    orders = Order.query.filter_by(farmer_id=farmer_id).order_by(Order.id.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]})


@app.route("/api/orders/consumer/<int:consumer_id>", methods=["GET"])
def consumer_orders(consumer_id):
    orders = Order.query.filter_by(consumer_id=consumer_id).order_by(Order.id.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]})


@app.route("/api/orders/<int:order_id>/status", methods=["PATCH"])
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json() or {}
    order.status = data.get("status", order.status)
    db.session.commit()
    return jsonify({"message": "Status updated", "order": order.to_dict()})


@app.route("/api/reviews", methods=["POST"])
def post_review():
    data = request.get_json() or {}
    rev = Review(
        order_id=data.get("order_id"),
        farmer_id=int(data["farmer_id"]),
        consumer_id=int(data.get("consumer_id", 11)),
        rating=int(data.get("rating", 5)),
        comment=data.get("comment", ""),
    )
    db.session.add(rev)
    db.session.commit()
    return jsonify({"message": "Review submitted", "review": rev.to_dict()}), 201


@app.route("/api/reviews/farmer/<int:farmer_id>", methods=["GET"])
def get_farmer_reviews(farmer_id):
    revs = Review.query.filter_by(farmer_id=farmer_id).all()
    return jsonify({"reviews": [r.to_dict() for r in revs]})


@app.route("/api/admin/users", methods=["GET"])
def admin_users():
    users = User.query.all()
    return jsonify({"users": [u.to_dict() for u in users]})


@app.route("/api/admin/products", methods=["GET"])
def admin_products():
    products = Product.query.all()
    return jsonify({"products": [p.to_dict() for p in products]})


@app.route("/api/admin/products/<int:product_id>", methods=["DELETE"])
def moderate_product(product_id):
    p = Product.query.get_or_404(product_id)
    p.status = "removed"
    db.session.commit()
    return jsonify({"message": "Moderated"})


@app.route("/api/admin/orders", methods=["GET"])
def admin_orders():
    orders = Order.query.all()
    return jsonify({"orders": [o.to_dict() for o in orders]})


@app.route("/api/admin/stats", methods=["GET"])
def admin_stats():
    users = User.query.all()
    products = Product.query.all()
    orders = Order.query.all()
    return jsonify(
        {
            "stats": {
                "total_users": len(users),
                "total_farmers": len([u for u in users if u.role == "farmer"]),
                "total_consumers": len([u for u in users if u.role == "consumer"]),
                "total_listings": len(products),
                "total_orders": len(orders),
                "total_transaction_value": sum(o.total_price for o in orders),
                "total_middleman_savings": sum(o.middleman_savings for o in orders),
            }
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
